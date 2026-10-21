// MagicBolt Video Studio: local web app. Brief -> concept stills -> approved -> full Remotion video -> render.
//   cd studio && npm start      (opens http://localhost:4321)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {exec, execFile} from 'node:child_process';
import express from 'express';
import multer from 'multer';
import {DATA, WEB, REEL, projectDir, projectAssets, projectCode, compId, conceptsCompId} from './paths.mjs';
import {listPresets, listBrands, getPreset, listProjects, getProject, saveProject, createProject, deleteProject, readConcepts, readStoryboard, listImages, readLog, appendLog} from './projects.mjs';
import {runAgent, isBusy, stopAgent} from './agent.mjs';
import {conceptsPrompt, buildPrompt, revisePrompt, briefChangedNote, savePresetPrompt, textPrompt, textEditedNote, audioPrompt, audioEditedNote, backgroundPrompt, BG_OBJECTS, stylePrompt, styleEditedNote} from './prompts.mjs';
import {renderStills, renderVideo, probe, extractReference, startRemotionStudio, writeRegistry, STUDIO_PORT} from './remotion.mjs';
import {transcribeFile} from './transcribe.mjs';
import {readSettings, writeSettings, publicSettings, updateAi, aiConfig} from './settings.mjs';
import {pingModel} from './providers/openai.mjs';

const PORT = Number(process.env.PORT ?? 4321);
const app = express();
app.use(express.json({limit: '2mb'}));

// ---------- live events (server-sent) ----------
const clients = new Set();
const broadcast = (e) => { const s = `data: ${JSON.stringify(e)}\n\n`; for (const res of clients) res.write(s); };
app.get('/api/events', (req, res) => {
  res.set({'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive'});
  res.flushHeaders();
  res.write('retry: 2000\n\n');
  clients.add(res);
  const ping = setInterval(() => res.write(': ping\n\n'), 20000);
  req.on('close', () => { clearInterval(ping); clients.delete(res); });
});
const changed = (id) => broadcast({type: 'project', projectId: id});

// ---------- helpers ----------
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => res.status(e.status ?? 500).json({error: String(e.message ?? e)}));
const need = (id) => { const p = getProject(id); if (!p) throw Object.assign(new Error('No such project'), {status: 404}); return p; };
const busyGuard = (id) => { if (isBusy(id)) throw Object.assign(new Error('Claude is still working on this project.'), {status: 409}); };
const safeName = (s) => s.normalize('NFKD').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(-80) || `file-${Date.now()}`;
const kindOf = (mime, name) => (/^audio\//.test(mime) || /\.(mp3|wav|m4a|aac|ogg)$/i.test(name) ? 'audio' : /^video\//.test(mime) || /\.(mp4|mov|webm|mkv)$/i.test(name) ? 'video' : /^image\//.test(mime) ? 'image' : 'other');
const defaultRole = (kind, name) => (kind === 'audio' ? (/music|bgm|track/i.test(name) ? 'music' : 'voiceover') : kind === 'video' ? 'reference' : kind === 'image' ? (/logo/i.test(name) ? 'logo' : 'image') : 'file');

// background media jobs: reference frames and voiceover transcripts, one at a time
let mediaQueue = Promise.resolve();
const processAsset = (id, file) => { mediaQueue = mediaQueue.then(() => processAssetNow(id, file)).catch((e) => console.error(e)); };
const patchAsset = (id, file, patch) => { const p = getProject(id); const a = p?.assets.find((x) => x.file === file); if (a) { Object.assign(a, patch); saveProject(p); changed(id); } return a; };
const processAssetNow = async (id, file) => {
  const p = getProject(id);
  const a = p?.assets.find((x) => x.file === file);
  if (!a) return;
  const src = path.join(projectAssets(id), file);
  if ((a.role === 'reference' || a.role === 'footage') && a.kind === 'video' && !a.refDir) {
    patchAsset(id, file, {job: 'extracting frames'});
    const refDir = `refs/${file.replace(/\.[^.]+$/, '')}`;
    await extractReference(src, path.join(projectDir(id), refDir)).then(() => patchAsset(id, file, {refDir, job: null}), (e) => patchAsset(id, file, {job: null, jobError: String(e.message)}));
  }
  if (a.role === 'voiceover' && (a.kind === 'audio' || a.kind === 'video') && !a.transcript) {
    patchAsset(id, file, {job: 'transcribing (first time downloads whisper)'});
    try {
      const lang = /hindi|hinglish/i.test(p.brief.language) ? 'hi' : /english/i.test(p.brief.language) ? 'en' : 'auto';
      const res = await transcribeFile(src, {language: lang, log: (m) => broadcast({type: 'job', projectId: id, file, text: m})});
      const transcript = `transcripts/${file}.json`;
      fs.mkdirSync(path.join(projectDir(id), 'transcripts'), {recursive: true});
      fs.writeFileSync(path.join(projectDir(id), transcript), JSON.stringify(res, null, 1));
      patchAsset(id, file, {transcript, job: null, words: res.words.length});
    } catch (e) {
      patchAsset(id, file, {job: null, jobError: `transcription failed: ${String(e.message).slice(0, 200)}`});
    }
  }
};

// ---------- state ----------
app.get('/api/state', wrap(async (req, res) => {
  res.json({presets: listPresets(), brands: listBrands(), projects: listProjects().map((p) => ({id: p.id, title: p.title, status: p.status, presetId: p.presetId, updatedAt: p.updatedAt, busy: isBusy(p.id)})), studioPort: STUDIO_PORT, renderJob, settings: publicSettings()});
}));

app.post('/api/projects', wrap(async (req, res) => {
  const p = createProject({title: req.body.title?.trim() || getPreset(req.body.presetId)?.name || 'Untitled video', presetId: req.body.presetId});
  broadcast({type: 'projects'});
  res.json(p);
}));

app.get('/api/projects/:id', wrap(async (req, res) => {
  const p = need(req.params.id);
  res.json({project: p, concepts: readConcepts(p.id), storyboard: readStoryboard(p.id), checks: listImages(p.id, 'checks'), text: readText(p.id), audio: await fillDurations(p.id), background: readBackground(p.id), style: readStyle(p.id), log: readLog(p.id).slice(-400), busy: isBusy(p.id),
    compositions: {video: compId(p.id), concepts: conceptsCompId(p.id)}, renderJob: renderJob?.projectId === p.id ? renderJob : null});
}));

app.patch('/api/projects/:id', wrap(async (req, res) => {
  const p = need(req.params.id);
  if (typeof req.body.title === 'string' && req.body.title.trim()) p.title = req.body.title.trim();
  if ('presetId' in req.body) p.presetId = req.body.presetId || null;
  if (req.body.brief) { p.brief = {...p.brief, ...req.body.brief}; if (p.sessionId) p.briefDirty = true; }
  if (req.body.status) p.status = req.body.status;
  saveProject(p); changed(p.id); broadcast({type: 'projects'});
  res.json(p);
}));

app.delete('/api/projects/:id', wrap(async (req, res) => {
  need(req.params.id); busyGuard(req.params.id);
  deleteProject(req.params.id); broadcast({type: 'projects'});
  res.json({ok: true});
}));

// ---------- media ----------
const upload = multer({dest: path.join(DATA, '_uploads'), limits: {fileSize: 4 * 1024 ** 3}});
app.post('/api/projects/:id/assets', upload.array('files', 30), wrap(async (req, res) => {
  const p = need(req.params.id);
  fs.mkdirSync(projectAssets(p.id), {recursive: true});
  for (const f of req.files ?? []) {
    const original = Buffer.from(f.originalname, 'latin1').toString('utf8');
    let name = safeName(original);
    while (p.assets.some((a) => a.file === name)) name = name.replace(/(\.[^.]+)?$/, (ext) => `-${Date.now() % 1000}${ext}`);
    fs.copyFileSync(f.path, path.join(projectAssets(p.id), name));
    fs.rmSync(f.path, {force: true});
    const kind = kindOf(f.mimetype, name);
    const info = kind === 'audio' || kind === 'video' ? await probe(path.join(projectAssets(p.id), name)).catch(() => null) : null;
    p.assets.push({file: name, original, kind, role: req.body.role || defaultRole(kind, original), size: f.size, info, addedAt: Date.now()});
  }
  if (p.sessionId) p.briefDirty = true;
  saveProject(p); changed(p.id);
  for (const a of p.assets) processAsset(p.id, a.file);
  res.json(p.assets);
}));

app.patch('/api/projects/:id/assets/:file', wrap(async (req, res) => {
  const p = need(req.params.id);
  const a = p.assets.find((x) => x.file === req.params.file);
  if (!a) return res.status(404).json({error: 'No such file'});
  if (req.body.role) a.role = req.body.role;
  if (typeof req.body.note === 'string') a.note = req.body.note;
  if (p.sessionId) p.briefDirty = true;
  saveProject(p); changed(p.id); processAsset(p.id, a.file);
  res.json(a);
}));

app.delete('/api/projects/:id/assets/:file', wrap(async (req, res) => {
  const p = need(req.params.id);
  p.assets = p.assets.filter((a) => a.file !== req.params.file);
  fs.rmSync(path.join(projectAssets(p.id), req.params.file), {force: true});
  if (p.sessionId) p.briefDirty = true;
  saveProject(p); changed(p.id);
  res.json({ok: true});
}));

// ---------- agent phases ----------
const startTurn = (p, prompt, label, {before, after} = {}) => {
  busyGuard(p.id);
  if (before) { Object.assign(p, before); saveProject(p); }
  if (p.briefDirty && !prompt.includes('### Brief')) prompt = `${briefChangedNote(p)}\n\n${prompt}`;
  if (p.textEdited) prompt = `${textEditedNote(p)}\n\n${prompt}`;
  if (p.audioEdited) prompt = `${audioEditedNote(p)}\n\n${prompt}`;
  if (p.styleEdited) prompt = `${styleEditedNote(p)}\n\n${prompt}`;
  p.briefDirty = false; p.textEdited = false; p.audioEdited = false; p.styleEdited = false; saveProject(p);
  changed(p.id); broadcast({type: 'projects'});
  runAgent(p.id, prompt, {
    label, emit: broadcast,
    onDone: async (ok) => { const q = getProject(p.id); if (q) { after?.(q, ok); saveProject(q); } changed(p.id); broadcast({type: 'projects'}); },
  }).catch((e) => broadcast({type: 'agent', projectId: p.id, kind: 'error', text: String(e.message)}));
};

app.post('/api/projects/:id/concepts', wrap(async (req, res) => {
  const p = need(req.params.id);
  const prev = p.status;
  startTurn(p, conceptsPrompt(p, req.body.feedback), req.body.feedback ? `Revise concepts: ${req.body.feedback}` : 'Generate concepts from the brief', {
    before: {status: 'concepting'},
    after: (q, ok) => { q.status = readConcepts(q.id)?.concepts?.length ? 'concepts' : prev === 'concepting' ? 'brief' : prev; },
  });
  res.json({ok: true});
}));

app.post('/api/projects/:id/approve', wrap(async (req, res) => {
  const p = need(req.params.id);
  const {conceptId, notes = ''} = req.body;
  const c = readConcepts(p.id)?.concepts?.find((x) => x.id === conceptId);
  startTurn(p, buildPrompt(p, conceptId, notes), `Approved concept ${c?.name ? `"${c.name}"` : conceptId}${notes ? `: ${notes}` : ''}. Build the full video.`, {
    before: {status: 'building', approvedConcept: {id: conceptId, name: c?.name ?? conceptId, notes}},
    after: (q) => { q.status = readStoryboard(q.id) ? 'review' : 'concepts'; },
  });
  res.json({ok: true});
}));

app.post('/api/projects/:id/message', wrap(async (req, res) => {
  const p = need(req.params.id);
  const text = String(req.body.text ?? '').trim();
  if (!text) return res.status(400).json({error: 'Empty message'});
  const first = !p.sessionId;
  startTurn(p, first ? `${briefChangedNote(p)}\n\nUser: ${text}` : revisePrompt(p, text), text, {
    after: (q) => { if (q.status === 'building') q.status = readStoryboard(q.id) ? 'review' : q.status; if (q.status === 'brief' && readConcepts(q.id)?.concepts?.length) q.status = 'concepts'; },
  });
  res.json({ok: true});
}));

app.post('/api/projects/:id/stop', wrap(async (req, res) => { stopAgent(req.params.id); res.json({ok: true}); }));

app.post('/api/projects/:id/save-preset', wrap(async (req, res) => {
  const p = need(req.params.id);
  const name = String(req.body.name || p.title).trim();
  startTurn(p, savePresetPrompt(p, name), `Save as preset "${name}"`, {after: () => { thumbsFor([]); broadcast({type: 'projects'}); }});
  res.json({ok: true});
}));

// ---------- on-screen text: src/studio/<id>/text.json, edited straight from the browser ----------
const textFile = (id) => path.join(projectCode(id), 'text.json');
const readText = (id) => { try { return JSON.parse(fs.readFileSync(textFile(id), 'utf8')); } catch { return null; } };
// take the edited strings, keep the original shape (no keys added or removed, non-strings untouched)
const mergeStrings = (orig, edit) => {
  if (typeof orig === 'string') return typeof edit === 'string' ? edit : orig;
  if (Array.isArray(orig)) return orig.map((v, i) => mergeStrings(v, Array.isArray(edit) ? edit[i] : undefined));
  if (orig && typeof orig === 'object') return Object.fromEntries(Object.entries(orig).map(([k, v]) => [k, k.startsWith('_') ? v : mergeStrings(v, edit?.[k])]));
  return orig;
};
app.put('/api/projects/:id/text', wrap(async (req, res) => {
  const p = need(req.params.id);
  const orig = readText(p.id);
  if (!orig) return res.status(400).json({error: 'This video has no text.json yet'});
  const next = mergeStrings(orig, req.body.text);
  fs.writeFileSync(textFile(p.id), JSON.stringify(next, null, 2) + '\n');
  p.textEdited = true; saveProject(p);
  appendLog(p.id, {kind: 'system', text: 'You edited the on-screen text.'});
  changed(p.id);
  res.json(next);
}));
app.post('/api/projects/:id/make-text-editable', wrap(async (req, res) => {
  const p = need(req.params.id);
  startTurn(p, textPrompt(p), 'Make the on-screen text editable in the browser');
  res.json({ok: true});
}));

// ---------- soundtrack: src/studio/<id>/audio.json (voiceover + music), edited in the Audio tab ----------
// registry.tsx wraps the project's main composition with <StudioAudio/> whenever this file exists.
const audioFile = (id) => path.join(projectCode(id), 'audio.json');
const readAudio = (id) => { try { return JSON.parse(fs.readFileSync(audioFile(id), 'utf8')); } catch { return null; } };
const TRACK_DEFAULT = {src: null, volume: 1, muted: false, startSec: 0, trimStartSec: 0, trimEndSec: null, durationSec: null};
const MUSIC_DEFAULT = {...TRACK_DEFAULT, volume: 0.25, loop: true, fadeInSec: 1, fadeOutSec: 2, duck: true, duckLevel: 0.35};
const clampNum = (v, lo, hi, d) => { const n = Number(v); return v === null || v === '' || !Number.isFinite(n) ? d : Math.min(hi, Math.max(lo, n)); };
const publicAudio = (src) => {
  if (typeof src !== 'string' || !src || src.includes('..') || path.isAbsolute(src) || !/\.(mp3|wav|m4a|aac|ogg|mp4|mov|webm)$/i.test(src)) return null;
  const full = path.join(REEL, 'public', src);
  return fs.existsSync(full) ? full : null;
};
const cleanTrack = async (edit, prev, def) => {
  const e = edit ?? {};
  const t = {...def, ...(prev ?? {})};
  const oldSrc = t.src;
  if ('src' in e) {
    if (e.src === null) t.src = null;
    else if (publicAudio(e.src)) t.src = e.src;
    else throw Object.assign(new Error(`Audio file not found: ${e.src}`), {status: 400});
  }
  t.volume = clampNum(e.volume, 0, 1, t.volume);
  t.startSec = clampNum(e.startSec, 0, 3600, t.startSec);
  t.trimStartSec = clampNum(e.trimStartSec, 0, 36000, t.trimStartSec);
  t.trimEndSec = 'trimEndSec' in e ? clampNum(e.trimEndSec, 0, 36000, null) : t.trimEndSec;
  if (t.trimEndSec !== null && t.trimEndSec <= t.trimStartSec) t.trimEndSec = null;
  if ('muted' in e) t.muted = !!e.muted;
  if ('loop' in def) {
    t.fadeInSec = clampNum(e.fadeInSec, 0, 60, t.fadeInSec);
    t.fadeOutSec = clampNum(e.fadeOutSec, 0, 60, t.fadeOutSec);
    t.duckLevel = clampNum(e.duckLevel, 0, 1, t.duckLevel);
    if ('loop' in e) t.loop = !!e.loop;
    if ('duck' in e) t.duck = !!e.duck;
  }
  if (!t.src) t.durationSec = null;
  else if (t.src !== oldSrc || !t.durationSec) {
    const info = await probe(publicAudio(t.src)).catch(() => null);
    t.durationSec = info?.duration ? Math.round(info.duration * 100) / 100 : null;
    if (t.src !== oldSrc) { t.trimStartSec = 'trimStartSec' in e ? t.trimStartSec : 0; t.trimEndSec = 'trimEndSec' in e ? t.trimEndSec : null; }
  }
  return t;
};
// old files without a length (or hand-edited): measure once and write it back
const fillDurations = async (id) => {
  const a = readAudio(id);
  if (!a || !['voiceover', 'music'].some((k) => a[k]?.src && !a[k].durationSec)) return a;
  const next = {...a};
  for (const k of ['voiceover', 'music']) if (a[k]?.src && !a[k].durationSec) next[k] = await cleanTrack({}, a[k], k === 'music' ? MUSIC_DEFAULT : TRACK_DEFAULT);
  fs.writeFileSync(audioFile(id), JSON.stringify(next, null, 2) + '\n');
  return next;
};
// does the video's own code still play audio itself? (it would double up with audio.json)
const ownsAudio = (id) => {
  const walk = (d) => fs.readdirSync(d, {withFileTypes: true}).flatMap((f) => (f.isDirectory() ? walk(path.join(d, f.name)) : /\.tsx?$/.test(f.name) ? [path.join(d, f.name)] : []));
  try { return walk(projectCode(id)).some((f) => /<(Html5)?Audio[\s>]/.test(fs.readFileSync(f, 'utf8'))); } catch { return false; }
};
app.put('/api/projects/:id/audio', wrap(async (req, res) => {
  const p = need(req.params.id);
  const prev = readAudio(p.id);
  if (!prev) return res.status(400).json({error: 'This video has no audio.json yet'});
  const e = req.body.audio ?? {};
  const next = {voiceover: await cleanTrack(e.voiceover, prev.voiceover, TRACK_DEFAULT), music: await cleanTrack(e.music, prev.music, MUSIC_DEFAULT)};
  fs.writeFileSync(audioFile(p.id), JSON.stringify(next, null, 2) + '\n');
  p.audioEdited = true; saveProject(p);
  appendLog(p.id, {kind: 'system', text: 'You edited the audio mix.'});
  changed(p.id);
  res.json(next);
}));
app.post('/api/projects/:id/make-audio-editable', wrap(async (req, res) => {
  const p = need(req.params.id);
  const have = readAudio(p.id);
  if (have) return res.json({audio: have});
  if (ownsAudio(p.id)) {
    startTurn(p, audioPrompt(p), 'Move the audio into audio.json so it is editable in the browser');
    return res.json({agent: true});
  }
  const pick = (role) => p.assets.find((a) => a.role === role && (a.kind === 'audio' || a.kind === 'video'));
  const vo = pick('voiceover'), mu = pick('music');
  const audio = {
    voiceover: await cleanTrack(vo ? {src: `studio/${p.id}/${vo.file}`} : {}, null, TRACK_DEFAULT),
    music: await cleanTrack(mu ? {src: `studio/${p.id}/${mu.file}`} : {}, null, MUSIC_DEFAULT),
  };
  fs.mkdirSync(projectCode(p.id), {recursive: true});
  fs.writeFileSync(audioFile(p.id), JSON.stringify(audio, null, 2) + '\n');
  writeRegistry();
  changed(p.id);
  res.json({audio});
}));
// ---------- animated background objects: a request Claude carries out (a layer in the video's own code) ----------
app.post('/api/projects/:id/background', wrap(async (req, res) => {
  const p = need(req.params.id);
  const b = req.body ?? {};
  const str = (v, n) => String(v ?? '').trim().slice(0, n);
  const o = {
    objects: (Array.isArray(b.objects) ? b.objects : []).filter((k) => k in BG_OBJECTS),
    custom: str(b.custom, 400),
    placement: b.placement === 'edges' ? 'edges' : 'behind',
    intensity: ['subtle', 'medium', 'lively'].includes(b.intensity) ? b.intensity : 'subtle',
    colors: str(b.colors, 120),
    scenes: str(b.scenes, 160),
  };
  if (!o.objects.length && !o.custom) throw Object.assign(new Error('Pick at least one kind of object or describe your own.'), {status: 400});
  const what = [...o.objects, o.custom].filter(Boolean).join(', ');
  startTurn(p, backgroundPrompt(p, o), `Add animated background objects (${what}), ${o.intensity}${o.scenes ? `, scenes: ${o.scenes}` : ''}`);
  res.json({ok: true});
}));
// ---------- palette: src/studio/<id>/style.json {colors, _defaults, _labels}, edited from the Style tab ----------
const styleFile = (id) => path.join(projectCode(id), 'style.json');
const readStyle = (id) => { try { return JSON.parse(fs.readFileSync(styleFile(id), 'utf8')); } catch { return null; } };
app.put('/api/projects/:id/style', wrap(async (req, res) => {
  const p = need(req.params.id);
  const prev = readStyle(p.id);
  if (!prev) return res.status(400).json({error: 'This video has no style.json yet'});
  const edit = req.body.colors ?? {};
  const colors = Object.fromEntries(Object.entries(prev.colors).map(([k, v]) => {
    const e = req.body.reset ? prev._defaults?.[k] : edit[k];
    return [k, typeof e === 'string' && /^#[0-9a-f]{6}$/i.test(e) ? e.toUpperCase() : v];
  }));
  const next = {...prev, colors};
  fs.writeFileSync(styleFile(p.id), JSON.stringify(next, null, 2) + '\n');
  p.styleEdited = true; saveProject(p);
  appendLog(p.id, {kind: 'system', text: req.body.reset ? 'You reset the colours.' : 'You changed the colours.'});
  changed(p.id);
  res.json(next);
}));
app.post('/api/projects/:id/make-style-editable', wrap(async (req, res) => {
  const p = need(req.params.id);
  startTurn(p, stylePrompt(p), 'Move the colours into style.json so they are editable in the browser');
  res.json({ok: true});
}));
// live controls of the background layer Claude built: src/studio/<id>/background.json {enabled, opacity, speed}
const bgFile = (id) => path.join(projectCode(id), 'background.json');
const readBackground = (id) => { try { return JSON.parse(fs.readFileSync(bgFile(id), 'utf8')); } catch { return null; } };
app.put('/api/projects/:id/background-settings', wrap(async (req, res) => {
  const p = need(req.params.id);
  const prev = readBackground(p.id);
  if (!prev) return res.status(400).json({error: 'This video has no background layer yet'});
  const b = req.body ?? {};
  const next = {...prev, enabled: 'enabled' in b ? !!b.enabled : prev.enabled !== false, opacity: clampNum(b.opacity, 0, 1.5, prev.opacity ?? 1), speed: clampNum(b.speed, 0.1, 4, prev.speed ?? 1)};
  fs.writeFileSync(bgFile(p.id), JSON.stringify(next, null, 2) + '\n');
  appendLog(p.id, {kind: 'system', text: 'You adjusted the background objects.'});
  changed(p.id);
  res.json(next);
}));
// sound files already in the Remotion project's public/ folder (voiceovers, music, sfx) to pick from
app.get('/api/audio-library', wrap(async (req, res) => {
  const dir = path.join(REEL, 'public');
  res.json(fs.readdirSync(dir).filter((f) => /\.(mp3|wav|m4a|aac|ogg)$/i.test(f)).sort().map((f) => ({src: f, size: fs.statSync(path.join(dir, f)).size})));
}));

// re-render the check frames (times come from their names: "...-2.4s.png" or "...-f37.png")
app.post('/api/projects/:id/checks', wrap(async (req, res) => {
  const p = need(req.params.id);
  const fps = readStoryboard(p.id)?.fps ?? p.brief.fps ?? 30;
  const specs = listImages(p.id, 'checks').map((rel) => {
    const f = rel.match(/-f(\d+)s?\.(png|jpe?g)$/i);
    const s = rel.match(/-(\d+(?:\.\d+)?)s\.(png|jpe?g)$/i);
    if (!f && !s) return null;
    return {composition: compId(p.id), frame: f ? Number(f[1]) : Math.round(Number(s[1]) * fps), out: path.join(projectDir(p.id), rel)};
  }).filter(Boolean);
  if (!specs.length) return res.status(400).json({error: 'No check frames with a time in their name'});
  res.json({ok: true, count: specs.length});
  broadcast({type: 'job', projectId: p.id, text: `Re-rendering ${specs.length} check frames…`});
  const r = await renderStills(specs).catch((e) => [{ok: false, error: e.message}]);
  const bad = r.filter((x) => !x.ok);
  broadcast({type: 'job', projectId: p.id, text: bad.length ? `Check frames: ${bad.length} failed (${bad[0].error})` : 'Check frames updated', done: true});
}));

// re-render the concept stills without the agent
app.post('/api/projects/:id/samples', wrap(async (req, res) => {
  const p = need(req.params.id);
  const doc = readConcepts(p.id);
  if (!doc) return res.status(400).json({error: 'No concepts yet'});
  res.json({ok: true});
  const specs = [];
  for (const c of doc.concepts) (c.samples ?? []).forEach((s, i) => { s.file = `samples/${c.id}-${i + 1}.png`; specs.push({composition: s.composition ?? doc.composition ?? conceptsCompId(p.id), frame: s.frame ?? Math.round((s.t ?? 0) * (doc.fps ?? 30)), props: {concept: c.id, ...(s.props ?? {})}, out: path.join(projectDir(p.id), s.file)}); });
  broadcast({type: 'job', projectId: p.id, text: 'Rendering samples…'});
  const r = await renderStills(specs).catch((e) => [{ok: false, error: e.message}]);
  fs.writeFileSync(path.join(projectDir(p.id), 'concepts.json'), JSON.stringify(doc, null, 2));
  const bad = r.filter((x) => !x.ok);
  broadcast({type: 'job', projectId: p.id, text: bad.length ? `Samples: ${bad.length} failed (${bad[0].error})` : 'Samples updated', done: true});
  changed(p.id);
}));

// ---------- settings: output folder for finished renders, AI model ----------
app.get('/api/settings', (req, res) => res.json(publicSettings()));
app.put('/api/settings', wrap(async (req, res) => {
  const s = readSettings();
  if ('outDir' in req.body) {
    const dir = String(req.body.outDir ?? '').trim().replace(/^"|"$/g, '');
    if (dir && !path.isAbsolute(dir)) throw Object.assign(new Error('Use a full folder path, e.g. D:\\Videos'), {status: 400});
    if (dir) fs.mkdirSync(dir, {recursive: true});
    s.outDir = dir ? path.resolve(dir) : '';
  }
  writeSettings(s);
  if (req.body.ai) updateAi(req.body.ai);
  res.json(publicSettings());
}));
// check that the chosen AI model answers (key, address and model name)
app.post('/api/settings/test-ai', wrap(async (req, res) => {
  const cfg = aiConfig();
  if (cfg.provider === 'claude') return res.json({ok: true, text: 'Using your Claude Code login.'});
  if (cfg.provider === 'codex') {
    const result = await new Promise((resolve) => execFile('codex', ['login', 'status'], {windowsHide: true}, (error, stdout, stderr) => resolve({error, stdout, stderr})));
    return res.json({ok: !result.error, text: result.error ? `Codex CLI login unavailable: ${String(result.stderr || result.error.message).trim()}` : 'Codex CLI is available and signed in on this PC.'});
  }
  try { await pingModel(cfg); res.json({ok: true, text: `${cfg.model} answered.`}); }
  catch (e) { res.json({ok: false, text: String(e.message ?? e)}); }
}));
// native folder picker (a web page can't see real paths)
app.post('/api/settings/pick-folder', wrap(async (req, res) => {
  if (process.platform !== 'win32') throw Object.assign(new Error('Type the folder path instead.'), {status: 400});
  const start = (readSettings().outDir || os.homedir()).replace(/'/g, "''");
  const ps = `Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.FolderBrowserDialog; $f.Description = 'Where should rendered videos go?'; $f.SelectedPath = '${start}'; $o = New-Object System.Windows.Forms.Form -Property @{TopMost = $true}; if ($f.ShowDialog($o) -eq 'OK') { [Console]::OutputEncoding = [Text.Encoding]::UTF8; $f.SelectedPath }`;
  const dir = await new Promise((ok, fail) => execFile('powershell.exe', ['-NoProfile', '-STA', '-Command', ps], {windowsHide: true}, (e, out) => (e ? fail(e) : ok(String(out).trim()))));
  res.json({outDir: dir || null});
}));
app.post('/api/settings/open-folder', wrap(async (req, res) => {
  const dir = req.body.path ? path.dirname(String(req.body.path)) : readSettings().outDir;
  if (!dir || !fs.existsSync(dir)) throw Object.assign(new Error('Folder not found'), {status: 404});
  if (process.platform === 'win32') execFile('explorer.exe', req.body.path && fs.existsSync(req.body.path) ? ['/select,', req.body.path] : [dir]);
  else execFile(process.platform === 'darwin' ? 'open' : 'xdg-open', [dir]);
  res.json({ok: true});
}));
// copy a finished render to the output folder with a readable name
const exportRender = (p, rel) => {
  const {outDir} = readSettings();
  if (!outDir) return null;
  fs.mkdirSync(outDir, {recursive: true});
  const dest = path.join(outDir, `${safeName(p.title)}-${path.basename(rel).replace(`${p.id}-`, '')}`);
  fs.copyFileSync(path.join(projectDir(p.id), rel), dest);
  return dest;
};
app.post('/api/projects/:id/renders/export', wrap(async (req, res) => {
  const p = need(req.params.id);
  const r = p.renders.find((x) => x.file === req.body.file);
  if (!r) throw Object.assign(new Error('No such render'), {status: 404});
  r.exported = exportRender(p, r.file);
  if (!r.exported) throw Object.assign(new Error('Set an output folder first'), {status: 400});
  saveProject(p); changed(p.id); res.json(r);
}));

// ---------- render ----------
let renderJob = null;
let renderAbort = null;
app.post('/api/projects/:id/render', wrap(async (req, res) => {
  const p = need(req.params.id);
  if (renderJob && !renderJob.done) return res.status(409).json({error: `Already rendering ${renderJob.projectId}`});
  const scale = req.body.draft ? 0.5 : 1;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 13);
  const rel = `renders/${p.id}-${stamp}${scale < 1 ? '-draft' : ''}.mp4`;
  renderJob = {projectId: p.id, file: rel, stage: 'bundling', progress: 0, draft: scale < 1, startedAt: Date.now()};
  renderAbort = new AbortController();
  p.status = 'rendering'; saveProject(p); changed(p.id);
  res.json(renderJob);
  let last = 0;
  try {
    const info = await renderVideo({composition: compId(p.id), out: path.join(projectDir(p.id), rel), scale, signal: renderAbort.signal,
      onProgress: (e) => { Object.assign(renderJob, e); if (Date.now() - last > 400 || e.progress === 1) { last = Date.now(); broadcast({type: 'render', ...renderJob}); } }});
    const q = getProject(p.id);
    let exported = null, exportError = null;
    try { exported = exportRender(q, rel); } catch (e) { exportError = String(e.message); }
    q.renders.unshift({file: rel, at: new Date().toISOString(), draft: scale < 1, durationSec: info.durationInFrames / info.fps, width: info.width * scale, height: info.height * scale, exported});
    q.status = 'done'; saveProject(q);
    Object.assign(renderJob, {done: true, stage: 'done', progress: 1, exported, exportError});
    appendLog(p.id, {kind: 'system', text: `Rendered ${rel}${exported ? `, saved to ${exported}` : ''}${exportError ? ` (copy to output folder failed: ${exportError})` : ''}`});
  } catch (e) {
    const q = getProject(p.id); q.status = 'review'; saveProject(q);
    Object.assign(renderJob, {done: true, stage: 'error', error: renderAbort.signal.aborted ? 'Cancelled' : String(e.message).split('\n')[0]});
  }
  broadcast({type: 'render', ...renderJob});
  changed(p.id);
}));
app.post('/api/render/cancel', (req, res) => { renderAbort?.abort(); res.json({ok: true}); });

// ---------- preset thumbnails: one real frame of each preset's reference composition ----------
const THUMBS = path.join(DATA, '_presets');
let thumbsRunning = false;
const thumbsFor = async (force) => {
  if (thumbsRunning) return;
  thumbsRunning = true;
  try {
    const todo = listPresets().filter((pr) => pr.example?.composition && (force?.includes(pr.id) || !fs.existsSync(path.join(THUMBS, `${pr.id}.png`))));
    if (!todo.length) return;
    console.log(`Rendering ${todo.length} preset thumbnails…`);
    await renderStills(todo.map((pr) => ({composition: pr.example.composition, frame: Math.round((pr.example.t ?? 2) * 30), out: path.join(THUMBS, `${pr.id}.png`)})));
    broadcast({type: 'projects'});
  } catch (e) {
    console.error('Preset thumbnails failed:', e.message);
  } finally { thumbsRunning = false; }
};

// ---------- files ----------
app.use('/data', (req, res, next) => (/^\/(settings\.json|[^/]+\/agent-session\.json)$/i.test(decodeURIComponent(req.path)) ? res.status(404).end() : next())); // holds the API key / raw model history
app.use('/data', express.static(DATA, {fallthrough: false}));
app.use('/public', express.static(path.join(REEL, 'public'), {fallthrough: false}));
app.use(express.static(WEB, {setHeaders: (res) => res.set('Cache-Control', 'no-cache')}));

const URL_ = `http://localhost:${PORT}`;
const openBrowser = () => { if (!process.argv.includes('--no-open')) exec(process.platform === 'win32' ? `start "" "${URL_}"` : `${process.platform === 'darwin' ? 'open' : 'xdg-open'} ${URL_}`); };

// If the studio stopped mid-run (PC out of memory, window closed), projects stay "concepting"/"building"/"rendering"
// with a spinner forever. Called once this copy owns the port (so nothing is running), it puts them back to the
// last finished step.
const recoverStuck = () => {
  for (const {id} of listProjects()) {
    const q = getProject(id);
    if (!q || !['concepting', 'building', 'rendering'].includes(q.status)) continue;
    const before = q.status;
    q.status = readStoryboard(id) ? (q.renders?.length ? 'done' : 'review') : readConcepts(id)?.concepts?.length ? 'concepts' : 'brief';
    saveProject(q);
    appendLog(id, {kind: 'error', text: `Video Studio stopped while this was ${before} (often the PC ran out of memory). Status reset to "${q.status}"; your files are kept. Start the step again.`});
    console.log(`  ! ${id}: was ${before} when the studio stopped, reset to ${q.status}`);
  }
};

// Leave a trace when the server dies, so the next start can say why.
const CRASH_LOG = path.join(DATA, 'crash.log');
const crashed = (kind) => (e) => {
  try { fs.appendFileSync(CRASH_LOG, `${new Date().toISOString()} ${kind}: ${e?.stack ?? e}\n  free RAM ${Math.round(os.freemem() / 2 ** 20)} MB of ${Math.round(os.totalmem() / 2 ** 20)} MB\n`); } catch {}
  console.error(`\n  Video Studio crashed (${kind}): ${e?.message ?? e}\n`);
  process.exit(1);
};
process.on('uncaughtException', crashed('uncaughtException'));
process.on('unhandledRejection', crashed('unhandledRejection'));

const server = app.listen(PORT, (err) => {
  if (err) return; // handled by the 'error' listener below (Express 5 also passes it here)
  try { recoverStuck(); } catch (e) { console.error('  ! Could not check for stuck projects:', e.message); }
  console.log(`\n  MagicBolt Video Studio  ->  ${URL_}\n  Remotion Studio (live preview)  ->  http://localhost:${STUDIO_PORT}\n`);
  // Claude runs on this PC's Claude Code login only (API keys are ignored, see agent.mjs). macOS keeps it in the Keychain.
  const creds = path.join(process.env.CLAUDE_CONFIG_DIR ?? path.join(os.homedir(), '.claude'), '.credentials.json');
  const ai = aiConfig();
  if (ai.provider !== 'claude') console.log(`  AI model: ${ai.model} via ${ai.baseUrl} (change it under "AI model" on the home page)\n`);
  else if (process.platform !== 'darwin' && !fs.existsSync(creds)) console.log('  ! Not signed in to Claude Code on this PC. Run "claude" in a terminal and type /login.\n');
  else console.log('  Claude: using your local Claude Code login (no API key)\n');
  if (!process.env.NO_REMOTION_STUDIO) startRemotionStudio((s) => { if (/error/i.test(s)) process.stdout.write(`[remotion] ${s}`); });
  openBrowser();
  setTimeout(() => thumbsFor(), 1500);
});
// already running (e.g. started from another terminal or VS Code): just open the web view
server.on('error', (e) => {
  if (e.code !== 'EADDRINUSE') throw e;
  console.log(`\n  Video Studio is already running -> ${URL_} (opening it)\n`);
  openBrowser();
  setTimeout(() => process.exit(0), 1500);
});
