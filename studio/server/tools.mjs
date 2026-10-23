// Video tools: drop in any video, get its spoken script (when it has audio) and/or an MP3 of its soundtrack.
// Independent of video projects. Files live in studio/data/_tools/<job>/ (job.json, source, transcript.json, script.txt, subtitles.srt, audio.mp3).
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {DATA, FFMPEG} from './paths.mjs';
import {probe} from './remotion.mjs';
import {transcribeFile} from './transcribe.mjs';
import {activityLog, startProcess, endProcess} from './activity.mjs';

const TOOLS = path.join(DATA, '_tools');
const dirOf = (id) => path.join(TOOLS, id);
const jobFile = (id) => path.join(dirOf(id), 'job.json');
const readJob = (id) => { try { return JSON.parse(fs.readFileSync(jobFile(id), 'utf8')); } catch { return null; } };
const safe = (s) => String(s).normalize('NFKD').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(-80) || 'video';
const stem = (name) => safe(String(name).replace(/\.[^.]+$/, ''));
const LANG = /^(auto|[a-z]{2,3})$/;
const BITRATES = [96, 128, 192, 256, 320];

const srtTime = (t) => { const ms = Math.round(t * 1000); const p = (n, w = 2) => String(n).padStart(w, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
const toSrt = (sentences) => sentences.map((s, i) => `${i + 1}\n${srtTime(s.start)} --> ${srtTime(Math.max(s.end, s.start + 0.4))}\n${s.text}\n`).join('\n');

export const mountTools = (app, {upload, wrap, broadcast, enqueue}) => {
  fs.mkdirSync(TOOLS, {recursive: true});
  const save = (job) => { fs.writeFileSync(jobFile(job.id), JSON.stringify(job, null, 2)); broadcast({type: 'tools', jobId: job.id}); return job; };
  const patch = (id, fn) => { const j = readJob(id); if (!j) return null; fn(j); return save(j); };
  const note = (text, level = 'info') => activityLog(text, {source: 'media', level});
  const need = (id) => { const j = readJob(id); if (!j) throw Object.assign(new Error('No such video'), {status: 404}); return j; };

  // a job that was running when the studio stopped can never finish: mark it so the page does not wait forever
  for (const d of fs.existsSync(TOOLS) ? fs.readdirSync(TOOLS) : []) {
    const j = readJob(d);
    if (!j) continue;
    let dirty = false;
    if (j.script?.status === 'running' || j.script?.status === 'queued') { j.script = {...j.script, status: 'error', message: 'The studio stopped while this was running. Press “Get script” to run it again.'}; dirty = true; }
    if (j.mp3?.status === 'running') { j.mp3 = {...j.mp3, status: 'error', message: 'The studio stopped while this was running. Press “Convert to MP3” to run it again.'}; dirty = true; }
    if (dirty) fs.writeFileSync(jobFile(d), JSON.stringify(j, null, 2));
  }

  // a job plus its finished script (text + timed sentences), which are small enough to send with the list
  const full = (j) => {
    const t = path.join(dirOf(j.id), 'script.txt');
    let sentences = [];
    try { sentences = JSON.parse(fs.readFileSync(path.join(dirOf(j.id), 'transcript.json'), 'utf8')).sentences ?? []; } catch {}
    return {...j, text: fs.existsSync(t) ? fs.readFileSync(t, 'utf8') : '', sentences};
  };
  app.get('/api/tools/jobs', wrap(async (req, res) => {
    res.json(fs.readdirSync(TOOLS).map(readJob).filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(full));
  }));

  const runScript = (id, language) => {
    patch(id, (j) => { j.script = {status: 'queued', message: 'Waiting for the speech engine…', language, progress: 0}; });
    enqueue(async () => {
      const j0 = readJob(id);
      if (!j0) return;
      const src = path.join(dirOf(id), j0.file);
      patch(id, (j) => { j.script = {...j.script, status: 'running', message: 'Starting the speech engine (the very first run downloads the model, a few minutes)…', startedAt: Date.now()}; });
      const sp = startProcess({kind: 'script', label: `Script · ${j0.name}`});
      const pnote = (text, level = 'info') => activityLog(text, {source: 'media', level, processId: sp});
      pnote(`Script: transcribing ${j0.name}…`);
      let last = 0;
      try {
        const out = await transcribeFile(src, {language, log: (m) => {
          if (Date.now() - last < 600) return;
          last = Date.now();
          const pct = Number(m.match(/(\d+)%/)?.[1] ?? NaN);
          patch(id, (j) => { j.script.message = m.startsWith('model') ? `Downloading the speech model… ${pct}%` : `Listening… ${pct}%`; if (Number.isFinite(pct) && !m.startsWith('model')) j.script.progress = pct / 100; });
        }});
        fs.writeFileSync(path.join(dirOf(id), 'transcript.json'), JSON.stringify(out, null, 1));
        const text = out.sentences.map((s) => s.text).join('\n');
        fs.writeFileSync(path.join(dirOf(id), 'script.txt'), text + '\n');
        fs.writeFileSync(path.join(dirOf(id), 'subtitles.srt'), toSrt(out.sentences));
        patch(id, (j) => { j.script = {status: 'done', language, detected: out.language, words: out.words.length, message: out.words.length ? '' : 'No speech was detected. The audio may be music or silence.', startedAt: j.script?.startedAt, finishedAt: Date.now(), progress: 1}; });
        pnote(`Script ready for ${j0.name} (${out.words.length} words)`, 'ok');
        endProcess(sp, {status: 'done'});
      } catch (e) {
        patch(id, (j) => { j.script = {status: 'error', language, message: `Could not get the script: ${String(e.message).slice(0, 300)}`}; });
        pnote(`Script failed for ${j0.name}: ${String(e.message).slice(0, 160)}`, 'error');
        endProcess(sp, {status: 'error', error: e.message});
      }
    });
  };

  app.post('/api/tools/jobs', upload.single('file'), wrap(async (req, res) => {
    const f = req.file;
    if (!f) throw Object.assign(new Error('Choose a video file first.'), {status: 400});
    const name = Buffer.from(f.originalname, 'latin1').toString('utf8');
    const id = `${Date.now().toString(36)}-${stem(name).slice(0, 24)}`;
    fs.mkdirSync(dirOf(id), {recursive: true});
    const file = `source${path.extname(name).toLowerCase().replace(/[^.\w]/g, '') || '.mp4'}`;
    fs.copyFileSync(f.path, path.join(dirOf(id), file));
    fs.rmSync(f.path, {force: true});
    const info = await probe(path.join(dirOf(id), file)).catch(() => null);
    if (!info) {
      fs.rmSync(dirOf(id), {recursive: true, force: true});
      throw Object.assign(new Error('That file could not be read as audio or video.'), {status: 400});
    }
    const language = LANG.test(req.body.language ?? '') ? req.body.language : 'auto';
    const job = {id, name, file, size: f.size, createdAt: new Date().toISOString(), info, script: info.hasAudio ? {status: 'queued', language} : {status: 'none', message: 'This file has no audio track, so there is no speech to turn into a script.'}, mp3: info.hasAudio ? {status: 'idle'} : {status: 'none', message: 'No audio track to convert.'}};
    save(job);
    note(`Added ${name} (${info.duration.toFixed(1)}s${info.hasAudio ? '' : ', no audio'})`, info.hasAudio ? 'info' : 'warn');
    if (info.hasAudio) runScript(id, language);
    res.json(job);
  }));

  app.post('/api/tools/jobs/:id/script', wrap(async (req, res) => {
    const j = need(req.params.id);
    if (!j.info.hasAudio) throw Object.assign(new Error('This file has no audio track.'), {status: 400});
    if (['queued', 'running'].includes(j.script?.status)) throw Object.assign(new Error('The script is already being created.'), {status: 409});
    const language = LANG.test(req.body.language ?? '') ? req.body.language : 'auto';
    runScript(j.id, language);
    res.json({ok: true});
  }));

  app.post('/api/tools/jobs/:id/mp3', wrap(async (req, res) => {
    const j = need(req.params.id);
    if (!j.info.hasAudio) throw Object.assign(new Error('This file has no audio track.'), {status: 400});
    if (j.mp3?.status === 'running') throw Object.assign(new Error('Already converting.'), {status: 409});
    const kbps = BITRATES.includes(Number(req.body.bitrate)) ? Number(req.body.bitrate) : 192;
    const out = path.join(dirOf(j.id), 'audio.mp3');
    patch(j.id, (x) => { x.mp3 = {status: 'running', bitrate: kbps, progress: 0, message: 'Converting…', startedAt: Date.now()}; });
    const mp = startProcess({kind: 'mp3', label: `MP3 · ${j.name} (${kbps} kbps)`});
    activityLog(`MP3: converting ${j.name} at ${kbps} kbps…`, {source: 'media', processId: mp});
    res.json({ok: true});
    const child = spawn(FFMPEG, ['-y', '-v', 'error', '-i', path.join(dirOf(j.id), j.file), '-vn', '-map', 'a:0', '-c:a', 'libmp3lame', '-b:a', `${kbps}k`, '-progress', 'pipe:1', '-nostats', out], {windowsHide: true});
    let err = '', last = 0;
    child.stdout.on('data', (d) => {
      const us = Number(String(d).match(/out_time_ms=(\d+)/g)?.at(-1)?.split('=')[1]);
      if (!Number.isFinite(us) || Date.now() - last < 400) return;
      last = Date.now();
      patch(j.id, (x) => { x.mp3.progress = Math.min(0.99, us / 1e6 / (j.info.duration || 1)); });
    });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => { err = String(e.message); });
    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(out)) {
        patch(j.id, (x) => { x.mp3 = {status: 'done', bitrate: kbps, size: fs.statSync(out).size, progress: 1, startedAt: x.mp3?.startedAt, finishedAt: Date.now()}; });
        activityLog(`MP3 ready for ${j.name} (${(fs.statSync(out).size / 1048576).toFixed(1)} MB)`, {source: 'media', level: 'ok', processId: mp});
        endProcess(mp, {status: 'done'});
      } else {
        fs.rmSync(out, {force: true});
        patch(j.id, (x) => { x.mp3 = {status: 'error', bitrate: kbps, message: `Conversion failed: ${err.trim().slice(-300) || `ffmpeg exited with code ${code}`}`}; });
        activityLog(`MP3 conversion failed for ${j.name}`, {source: 'media', level: 'error', processId: mp});
        endProcess(mp, {status: 'error', error: err.trim().slice(-200)});
      }
    });
  }));

  app.delete('/api/tools/jobs/:id', wrap(async (req, res) => {
    const j = need(req.params.id);
    if (j.mp3?.status === 'running' || ['queued', 'running'].includes(j.script?.status)) throw Object.assign(new Error('Wait for it to finish first.'), {status: 409});
    fs.rmSync(dirOf(j.id), {recursive: true, force: true});
    broadcast({type: 'tools', jobId: j.id, removed: true});
    res.json({ok: true});
  }));
};
