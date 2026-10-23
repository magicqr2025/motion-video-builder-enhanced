// Storage panel: where the studio keeps its files, how big each part is, and a few safe clean-ups.
// Only fixed, known locations are ever measured or deleted (never a path sent by the browser).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {STUDIO, REEL, DATA, projectDir, projectCode, projectAssets} from './paths.mjs';
import {getProject, saveProject, listProjects} from './projects.mjs';
import {sweepBundles} from './remotion.mjs';
import {activityLog} from './activity.mjs';

const TOOLS = path.join(DATA, '_tools');
const WHISPER = path.join(STUDIO, '.whisper');
const WEBPACK_CACHE = path.join(REEL, 'node_modules', '.cache');
const REMOTION_CHROME = path.join(REEL, 'node_modules', '.remotion');
const STAGING = path.join(DATA, '_uploads');
const TEMP_PREFIXES = ['remotion-webpack-bundle-', 'remotion-v', 'studio-webp-'];
const PART_DIRS = ['renders', 'samples', 'checks', 'refs', 'transcripts'];

// total bytes under a path (files only, symlinks are not followed)
const sizeOf = async (p) => {
  let st;
  try { st = await fs.promises.lstat(p); } catch { return 0; }
  if (!st.isDirectory()) return st.size;
  let total = 0, entries = [];
  try { entries = await fs.promises.readdir(p); } catch { return 0; }
  for (let i = 0; i < entries.length; i += 64) total += (await Promise.all(entries.slice(i, i + 64).map((e) => sizeOf(path.join(p, e))))).reduce((a, b) => a + b, 0);
  return total;
};
const exists = (p) => fs.existsSync(p);
const rmDir = (p) => fs.promises.rm(p, {recursive: true, force: true, maxRetries: 2});
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

const tempEntries = () => {
  try { return fs.readdirSync(os.tmpdir(), {withFileTypes: true}).filter((d) => d.isDirectory() && TEMP_PREFIXES.some((x) => d.name.startsWith(x))).map((d) => path.join(os.tmpdir(), d.name)); } catch { return []; }
};

let cache = null;
const measure = async () => {
  const known = listProjects();
  const projects = await Promise.all(known.map(async (p) => {
    const dir = projectDir(p.id);
    const parts = Object.fromEntries(await Promise.all(PART_DIRS.map(async (d) => [d, await sizeOf(path.join(dir, d))])));
    const dataTotal = await sizeOf(dir);
    const uploads = await sizeOf(projectAssets(p.id)), code = await sizeOf(projectCode(p.id));
    parts.other = Math.max(0, dataTotal - PART_DIRS.reduce((a, d) => a + parts[d], 0));
    return {id: p.id, title: p.title, status: p.status, updatedAt: p.updatedAt, parts: {...parts, uploads, code}, total: dataTotal + uploads + code};
  }));
  const tools = await Promise.all((exists(TOOLS) ? fs.readdirSync(TOOLS) : []).map(async (id) => {
    const job = readJson(path.join(TOOLS, id, 'job.json'));
    return job ? {id, name: job.name, createdAt: job.createdAt, bytes: await sizeOf(path.join(TOOLS, id))} : null;
  }));
  const temps = tempEntries();
  const tempBytes = (await Promise.all(temps.map(sizeOf))).reduce((a, b) => a + b, 0);
  const system = [
    {id: 'whisper', label: 'Speech engine', desc: 'The speech-to-text program and model used by Video tools and voiceover timing. Downloaded once.', path: WHISPER, bytes: await sizeOf(WHISPER), clean: null, note: 'Needed for scripts. Removing it means a re-download on the next use.'},
    {id: 'cache', label: 'Render cache', desc: 'Remotion keeps compiled code here so the next preview or render starts faster.', path: WEBPACK_CACHE, bytes: await sizeOf(WEBPACK_CACHE), clean: 'Clear cache', note: 'Safe to clear. The next render or preview takes a little longer once, then it rebuilds.'},
    {id: 'chrome', label: 'Render browser', desc: 'The headless Chrome that Remotion uses to draw frames.', path: REMOTION_CHROME, bytes: await sizeOf(REMOTION_CHROME), clean: null, note: 'Needed to render. Remotion re-downloads it if removed.'},
    {id: 'temp', label: 'Temporary files', desc: `Left-over render bundles and animation frames in Windows' temp folder (${temps.length} folder${temps.length === 1 ? '' : 's'}).`, path: os.tmpdir(), bytes: tempBytes, clean: 'Clear temporary files', note: 'Safe to clear. Anything a running job is using is kept.'},
    {id: 'staging', label: 'Upload staging', desc: 'Where uploads wait while they are being received.', path: STAGING, bytes: await sizeOf(STAGING), clean: 'Clear staging', note: 'Safe to clear. Only files older than 10 minutes are removed.'},
    {id: 'logs', label: 'Activity history and log', desc: 'The studio log and the history shown in the Activity panel.', path: DATA, bytes: (await sizeOf(path.join(DATA, 'activity'))) + (await sizeOf(path.join(DATA, 'studio.log'))), clean: null, note: 'Small. Kept for the Activity history.'},
  ];
  let disk = null;
  try { const s = await fs.promises.statfs(DATA); disk = {free: Number(s.bavail) * Number(s.bsize), total: Number(s.blocks) * Number(s.bsize)}; } catch { /* not supported */ }
  const total = projects.reduce((a, p) => a + p.total, 0) + tools.filter(Boolean).reduce((a, t) => a + t.bytes, 0) + system.reduce((a, x) => a + x.bytes, 0);
  return {at: Date.now(), disk, total, projects: projects.sort((a, b) => b.total - a.total), tools: tools.filter(Boolean).sort((a, b) => b.bytes - a.bytes), system};
};

export const mountStorage = (app, {wrap, need, changed, broadcast, busy}) => {
  app.get('/api/storage', wrap(async (req, res) => {
    if (!cache || req.query.refresh || Date.now() - cache.at > 20000) cache = await measure();
    res.json(cache);
  }));

  app.post('/api/storage/clean', wrap(async (req, res) => {
    const {target, id, what} = req.body ?? {};
    const b = busy();
    const fail = (m, status = 409) => { throw Object.assign(new Error(m), {status}); };
    let freed = 0, note = '';
    const log = (t) => activityLog(t, {source: 'save', projectId: id ?? null});

    if (target === 'cache') {
      if (b.render || b.ai.length) fail('A render or an AI task is running. Wait for it to finish, then clear the cache.');
      freed = await sizeOf(WEBPACK_CACHE); await rmDir(WEBPACK_CACHE); note = 'Render cache cleared.';
    } else if (target === 'temp') {
      freed = 0;
      for (const d of tempEntries()) freed += await sizeOf(d);
      sweepBundles(0); // bundles no running job is using
      for (const d of tempEntries()) {
        const base = path.basename(d);
        if (base.startsWith('remotion-webpack-bundle-')) continue; // handled (and protected) above
        try { if (Date.now() - fs.statSync(d).mtimeMs > 30 * 60 * 1000) await rmDir(d); } catch { /* ignore */ }
      }
      let left = 0; for (const d of tempEntries()) left += await sizeOf(d);
      freed = Math.max(0, freed - left); note = 'Temporary files cleared.';
    } else if (target === 'staging') {
      if (exists(STAGING)) for (const f of fs.readdirSync(STAGING)) {
        const full = path.join(STAGING, f);
        try { const st = fs.statSync(full); if (Date.now() - st.mtimeMs > 10 * 60 * 1000) { freed += await sizeOf(full); await rmDir(full); } } catch { /* ignore */ }
      }
      note = 'Upload staging cleared.';
    } else if (target === 'project') {
      const p = need(id);
      if (b.ai.includes(p.id)) fail('The AI is working on this video. Wait for it to finish.');
      if (b.render === p.id) fail('This video is rendering. Wait for it to finish.');
      const dir = projectDir(p.id);
      for (const w of [].concat(what ?? [])) {
        if (!['renders', 'samples', 'checks'].includes(w)) fail('Unknown clean-up.', 400);
        freed += await sizeOf(path.join(dir, w)); await rmDir(path.join(dir, w));
        if (w === 'renders') { p.renders = []; if (p.status === 'done') p.status = 'review'; }
      }
      saveProject(p); changed(p.id); broadcast({type: 'projects'});
      note = `Cleared ${[].concat(what).join(', ')} for “${p.title}”.`;
    } else fail('Unknown clean-up.', 400);

    cache = null;
    log(`Storage: ${note} Freed ${(freed / 1048576).toFixed(0)} MB.`);
    res.json({ok: true, freed, note});
  }));
};
