// Scripts & voiceovers library: scripts and the audio made from them, kept apart from any one video so they can be reused.
//   data/audio-library/index.json      one entry per script or voiceover
//   data/audio-library/<id>.mp3|.json the audio and its word timings (when there is audio)
// An entry is added by hand ("Add a script"), from a voiceover just generated ("Save to library"), or by importing a voiceover a video already has.
import fs from 'node:fs';
import path from 'node:path';
import {DATA, projectDir, projectAssets} from './paths.mjs';
import {listProjects, saveProject} from './projects.mjs';
import {activityLog} from './activity.mjs';

const DIR = path.join(DATA, 'audio-library'), INDEX = path.join(DIR, 'index.json');
const read = () => { try { const d = JSON.parse(fs.readFileSync(INDEX, 'utf8')); return Array.isArray(d.items) ? d : {items: []}; } catch { return {items: []}; } };
const write = (d) => { fs.mkdirSync(DIR, {recursive: true}); fs.writeFileSync(INDEX, JSON.stringify(d, null, 2)); };
const newId = () => `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const words = (t) => (String(t ?? '').trim().match(/\S+/g) ?? []).length;
const str = (v, n) => String(v ?? '').slice(0, n);
const bad = (m, status = 400) => Object.assign(new Error(m), {status});
const titleFrom = (script) => { const w = String(script ?? '').replace(/\[[^\]\n]{1,40}\]/g, ' ').trim().split(/\s+/).slice(0, 7).join(' '); return w ? `${w}…` : 'Untitled'; };

const view = (it) => ({...it, wordCount: words(it.script), audioUrl: it.audio ? `/data/audio-library/${it.audio}` : null});
const audioPath = (it) => (it.audio ? path.join(DIR, it.audio) : null);

// copy a finished mp3 (and its word timings) into the library and add the entry
const addVoice = ({src, transcriptFile, script, title, notes, meta = {}, source}) => {
  const id = newId();
  fs.mkdirSync(DIR, {recursive: true});
  fs.copyFileSync(src, path.join(DIR, `${id}.mp3`));
  let transcript = false;
  if (transcriptFile && fs.existsSync(transcriptFile)) { fs.copyFileSync(transcriptFile, path.join(DIR, `${id}.json`)); transcript = true; }
  const d = read();
  const it = {id, kind: 'voiceover', title: str(title, 120).trim() || titleFrom(script), script: str(script, 20000), notes: str(notes, 2000), audio: `${id}.mp3`, transcript, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), source, ...meta};
  d.items.unshift(it); write(d);
  return it;
};

export const mountAudioLibrary = (app, {wrap, need, probe, storeAsset, changed}) => {
  const draftFile = (pid, name) => (/^voice-\d+\.mp3$/.test(String(name)) ? path.join(projectDir(pid), 'voice', name) : null);

  app.get('/api/vo-library', wrap(async (req, res) => res.json({items: read().items.map(view)})));

  app.post('/api/vo-library/script', wrap(async (req, res) => {
    const b = req.body ?? {}, script = str(b.script, 20000).trim();
    if (!script) throw bad('Paste the script first.');
    const d = read(), p = b.projectId ? need(b.projectId) : null;
    const it = {id: newId(), kind: 'script', title: str(b.title, 120).trim() || titleFrom(script), script, notes: str(b.notes, 2000), audio: null, transcript: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), source: p ? {projectId: p.id, projectTitle: p.title, how: 'script'} : {how: 'manual'}};
    d.items.unshift(it); write(d);
    activityLog(`Saved a script to the library: ${it.title}`, {source: 'library', level: 'ok'});
    res.json(view(it));
  }));

  // keep a voiceover that was just generated (its script and settings were saved next to the draft)
  app.post('/api/projects/:id/voice/keep', wrap(async (req, res) => {
    const p = need(req.params.id), src = draftFile(p.id, req.body?.draft);
    if (!src || !fs.existsSync(src)) throw bad('That voiceover is no longer available. Generate it again.', 404);
    let meta = {}; try { meta = JSON.parse(fs.readFileSync(src.replace(/\.mp3$/, '.meta.json'), 'utf8')); } catch { /* older draft: the video's script is used */ }
    const info = await probe(src).catch(() => null);
    const it = addVoice({src, transcriptFile: src.replace(/\.mp3$/, '.json'), script: meta.script ?? p.brief.script, title: req.body?.title, notes: req.body?.notes,
      meta: {voiceId: meta.voiceId, modelId: meta.modelId, stability: meta.stability, language: meta.language, chars: meta.chars, durationSec: info?.duration ? Math.round(info.duration * 10) / 10 : null}, source: {projectId: p.id, projectTitle: p.title, how: 'generated'}});
    activityLog(`Saved a voiceover to the library: ${it.title}`, {projectId: p.id, source: 'library', level: 'ok'});
    res.json(view(it));
  }));

  // voiceovers that videos already have and the library does not: to import
  app.get('/api/vo-library/candidates', wrap(async (req, res) => {
    const have = new Set(read().items.map((i) => `${i.source?.projectId}/${i.source?.file}`));
    const out = [];
    for (const p of listProjects()) for (const a of p.assets ?? []) {
      if (a.kind !== 'audio' || !['voiceover', 'file'].includes(a.role) || have.has(`${p.id}/${a.file}`)) continue;
      if (!fs.existsSync(path.join(projectAssets(p.id), a.file))) continue;
      out.push({projectId: p.id, projectTitle: p.title, file: a.file, original: a.original, role: a.role, durationSec: a.info?.duration ? Math.round(a.info.duration * 10) / 10 : null, transcript: !!a.transcript, words: a.words ?? 0, hasScript: !!String(p.brief?.script ?? '').trim(), addedAt: a.addedAt ?? null});
    }
    res.json({candidates: out});
  }));
  app.post('/api/vo-library/import', wrap(async (req, res) => {
    const p = need(req.body?.projectId), a = (p.assets ?? []).find((x) => x.file === req.body?.file && x.kind === 'audio');
    if (!a) throw bad('That file is not an audio file of this video.', 404);
    const src = path.join(projectAssets(p.id), a.file);
    if (!fs.existsSync(src)) throw bad('The file is missing from the video.', 404);
    const info = a.info ?? await probe(src).catch(() => null);
    const it = addVoice({src, transcriptFile: a.transcript ? path.join(projectDir(p.id), a.transcript) : null, script: p.brief.script, title: req.body?.title || `${p.title} · voiceover`, notes: '',
      meta: {durationSec: info?.duration ? Math.round(info.duration * 10) / 10 : null, language: undefined}, source: {projectId: p.id, projectTitle: p.title, how: 'import', file: a.file}});
    activityLog(`Imported a voiceover into the library: ${it.title}`, {projectId: p.id, source: 'library', level: 'ok'});
    res.json(view(it));
  }));

  app.patch('/api/vo-library/:id', wrap(async (req, res) => {
    const d = read(), it = d.items.find((x) => x.id === req.params.id);
    if (!it) throw bad('Not found.', 404);
    const b = req.body ?? {};
    if (typeof b.title === 'string' && b.title.trim()) it.title = str(b.title, 120).trim();
    if (typeof b.notes === 'string') it.notes = str(b.notes, 2000);
    if (typeof b.script === 'string') it.script = str(b.script, 20000);
    it.updatedAt = new Date().toISOString(); write(d);
    res.json(view(it));
  }));
  app.delete('/api/vo-library/:id', wrap(async (req, res) => {
    const d = read(), it = d.items.find((x) => x.id === req.params.id);
    if (!it) throw bad('Not found.', 404);
    for (const f of [`${it.id}.mp3`, `${it.id}.json`]) fs.rmSync(path.join(DIR, f), {force: true});
    d.items = d.items.filter((x) => x !== it); write(d);
    res.json({ok: true});
  }));

  // reuse: put the script into a video's brief, and/or the audio into it as the voiceover (its word timings go with it)
  app.post('/api/vo-library/:id/use', wrap(async (req, res) => {
    const it = read().items.find((x) => x.id === req.params.id);
    if (!it) throw bad('Not found.', 404);
    const p = need(req.body?.projectId), what = req.body?.what ?? 'both', out = {};
    if ((what === 'script' || what === 'both') && it.script) {
      p.brief = {...p.brief, script: it.script, scriptState: 'review'}; delete p.brief.scriptOriginal;
      if (p.sessionId) p.briefDirty = true;
      saveProject(p); out.script = true;
    }
    if ((what === 'audio' || what === 'both') && it.audio && fs.existsSync(audioPath(it))) {
      let transcript = null; try { transcript = JSON.parse(fs.readFileSync(path.join(DIR, `${it.id}.json`), 'utf8')); } catch { /* it is transcribed instead */ }
      out.asset = await storeAsset(p, audioPath(it), `voiceover-${it.title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || it.id}.mp3`, 'audio/mpeg', 'voiceover', transcript);
      out.timed = !!transcript;
    }
    if (!out.script && !out.asset) throw bad(what === 'audio' ? 'This entry has no audio.' : 'Nothing to use.');
    activityLog(`Reused “${it.title}” in the video (${[out.script && 'script', out.asset && 'voiceover'].filter(Boolean).join(' + ')})`, {projectId: p.id, source: 'library', level: 'ok'});
    changed(p.id);
    res.json({...out, projectId: p.id});
  }));
};
