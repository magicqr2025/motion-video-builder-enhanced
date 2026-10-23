// Extra download / upload endpoints:
//   GET  /api/projects/:id/text.json          the on-screen text file (edit it anywhere)
//   POST /api/projects/:id/text/import        upload an edited text.json (only existing strings are replaced)
//   GET  /api/projects/:id/storyboard.md|csv  the scene list as a readable document or a spreadsheet
//   GET  /api/projects/:id/transcript/<file>.txt   a voiceover's transcript as plain text (?t=1 adds timestamps)
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import {projectCode, projectDir} from './paths.mjs';

const slug = (s) => String(s ?? 'video').normalize('NFKD').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'video';
const fmt = (s) => { s = Math.max(0, Number(s) || 0); const m = Math.floor(s / 60); return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`; };
const cell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

// same rule as the Text tab: take the edited strings, keep the original shape (nothing added or removed, "_" keys untouched)
const mergeStrings = (orig, edit) => {
  if (typeof orig === 'string') return typeof edit === 'string' ? edit : orig;
  if (Array.isArray(orig)) return orig.map((v, i) => mergeStrings(v, Array.isArray(edit) ? edit[i] : undefined));
  if (orig && typeof orig === 'object') return Object.fromEntries(Object.entries(orig).map(([k, v]) => [k, k.startsWith('_') ? v : mergeStrings(v, edit?.[k])]));
  return orig;
};
const leaves = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(leaves) : v && typeof v === 'object' ? Object.entries(v).filter(([k]) => !k.startsWith('_')).flatMap(([, x]) => leaves(x)) : []);
const countChanged = (a, b) => { const x = leaves(a), y = leaves(b); return y.filter((t, i) => t !== x[i]).length; };

export const mountFiles = (app, {wrap, need, saveProject, appendLog, changed, readStoryboard}) => {
  const textFile = (id) => path.join(projectCode(id), 'text.json');
  const attach = (res, name, type) => res.set({'Content-Type': `${type}; charset=utf-8`, 'Content-Disposition': `attachment; filename="${name}"`});
  const upload = multer({storage: multer.memoryStorage(), limits: {fileSize: 2 * 1024 * 1024}});

  app.get('/api/projects/:id/text.json', wrap(async (req, res) => {
    const p = need(req.params.id);
    if (!fs.existsSync(textFile(p.id))) throw Object.assign(new Error('This video has no text file yet.'), {status: 404});
    attach(res, `${slug(p.title)}-text.json`, 'application/json');
    res.send(fs.readFileSync(textFile(p.id), 'utf8'));
  }));

  app.post('/api/projects/:id/text/import', upload.single('file'), wrap(async (req, res) => {
    const p = need(req.params.id);
    if (!req.file) throw Object.assign(new Error('Choose a text.json file first.'), {status: 400});
    if (!fs.existsSync(textFile(p.id))) throw Object.assign(new Error('This video has no text file yet. Use “Make text editable” first.'), {status: 400});
    let edit;
    try { edit = JSON.parse(req.file.buffer.toString('utf8').replace(/^﻿/, '')); } catch { throw Object.assign(new Error('That file is not valid JSON.'), {status: 400}); }
    const orig = JSON.parse(fs.readFileSync(textFile(p.id), 'utf8'));
    const next = mergeStrings(orig, edit);
    const n = countChanged(orig, next);
    if (n) {
      fs.writeFileSync(textFile(p.id), JSON.stringify(next, null, 2) + '\n');
      p.textEdited = true; saveProject(p);
      appendLog(p.id, {kind: 'system', text: `You uploaded a text file (${n} text${n === 1 ? '' : 's'} changed).`});
      changed(p.id);
    }
    res.json({changed: n, text: next});
  }));

  const board = (id) => {
    const sb = readStoryboard(id);
    if (!sb?.scenes?.length) throw Object.assign(new Error('Nothing is built yet.'), {status: 404});
    return sb;
  };
  app.get('/api/projects/:id/storyboard.md', wrap(async (req, res) => {
    const p = need(req.params.id), sb = board(p.id);
    const md = [`# ${p.title}`, '', `${sb.width}x${sb.height} · ${sb.fps} fps · ${fmt(sb.durationSec ?? sb.scenes.at(-1)?.end)} · ${sb.scenes.length} scenes`, '',
      ...sb.scenes.flatMap((s, i) => [`## ${s.n ?? i + 1}. ${s.name} (${fmt(s.start)} – ${fmt(s.end)}, ${(s.end - s.start).toFixed(1)} s)`, '', ...[s.onScreen && `- **On screen:** ${s.onScreen}`, s.vo && `- **Voiceover:** ${s.vo}`, s.visual && `- **Visual:** ${s.visual}`].filter(Boolean), ''])].join('\n');
    attach(res, `${slug(p.title)}-storyboard.md`, 'text/markdown');
    res.send(md + '\n');
  }));
  app.get('/api/projects/:id/storyboard.csv', wrap(async (req, res) => {
    const p = need(req.params.id), sb = board(p.id);
    const rows = [['scene', 'name', 'start_s', 'end_s', 'length_s', 'on_screen', 'voiceover', 'visual'], ...sb.scenes.map((s, i) => [s.n ?? i + 1, s.name, s.start, s.end, (s.end - s.start).toFixed(2), s.onScreen, s.vo, s.visual])];
    attach(res, `${slug(p.title)}-storyboard.csv`, 'text/csv');
    res.send('﻿' + rows.map((r) => r.map(cell).join(',')).join('\n') + '\n'); // BOM so Excel reads Hindi/accents correctly
  }));

  app.get('/api/projects/:id/transcript/:file.txt', wrap(async (req, res) => {
    const p = need(req.params.id);
    const a = p.assets.find((x) => x.file === req.params.file);
    if (!a?.transcript) throw Object.assign(new Error('No transcript for that file yet.'), {status: 404});
    const full = path.resolve(projectDir(p.id), a.transcript);
    if (!full.startsWith(path.resolve(projectDir(p.id)) + path.sep) || !fs.existsSync(full)) throw Object.assign(new Error('Transcript not found.'), {status: 404});
    const t = JSON.parse(fs.readFileSync(full, 'utf8'));
    const lines = (t.sentences ?? []).map((s) => (req.query.t ? `[${fmt(s.start)}] ${s.text}` : s.text));
    attach(res, `${slug(a.original.replace(/\.[^.]+$/, ''))}-transcript.txt`, 'text/plain');
    res.send(lines.join('\n') + '\n');
  }));
};
