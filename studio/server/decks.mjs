// Visual PPT: browser slide decks (like ../webinar-deck) kept in a list you can open, describe, upload files to and rebuild.
//   data/decks.json                  the list (a deck is a folder with one or more .html files; the folder itself is never copied or moved)
//   GET    /api/decks                the list
//   POST   /api/decks                add an existing folder
//   GET    /api/decks/:id            details + files + the editable prices / contact
//   PATCH  /api/decks/:id            title, description, notes, versions
//   DELETE /api/decks/:id            take it off the list (the folder and its files stay)
//   POST   /api/decks/:id/upload     add or replace files inside the deck folder
//   PUT    /api/decks/:id/config     change the prices / contact lines in src/slides.js
//   POST   /api/decks/:id/build      rebuild deck.js / night.js from src/ (needed after config or text changes)
//   GET    /decks/:id/<file>         the deck itself, to open in a new tab
//   (chat with Claude about a deck: see deckagent.mjs)
// A deck is either a folder on this PC ("local") or a link to a deck that lives online, e.g. a claude.ai Slides artifact ("online": open, copy the link, notes).
// Either kind can carry extra links (the published copy, a shared link…).
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import {DATA, STUDIO, REEL, reelRequire} from './paths.mjs';
import {activityLog} from './activity.mjs';
import {mountDeckChat} from './deckagent.mjs';

const FILE = path.join(DATA, 'decks.json');
const WEBINAR = path.resolve(STUDIO, '..', 'webinar-deck');
const IMG = /\.(png|jpe?g|webp|gif|svg|avif|ico)$/i;
const fail = (status, message) => Object.assign(new Error(message), {status});
const slug = (s) => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'deck';

const seed = () => [{
  id: 'webinar-deck', title: 'MagicBolt AI Agency Webinar', dir: WEBINAR,
  description: 'The “Build Your Own Digital & AI Agency” webinar: one slide at a time, arrow keys or click, 3D background, full screen.',
  notes: '',
  versions: [{id: 'bright', label: 'Bright design', file: 'index.html'}, {id: 'night', label: 'City Lights (night)', file: 'night.html'}],
  build: [{entry: 'src/main.js', out: 'deck.js'}, {entry: 'src/night.js', out: 'night.js'}],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}];

let cache = null;
const read = () => {
  if (cache) return cache;
  try { cache = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { cache = fs.existsSync(WEBINAR) ? seed() : []; write(cache); }
  return cache;
};
const write = (list) => { cache = list; fs.mkdirSync(DATA, {recursive: true}); fs.writeFileSync(FILE, JSON.stringify(list, null, 2) + '\n'); };
const find = (id) => read().find((d) => d.id === id);
const need = (id) => { const d = find(id); if (!d) throw fail(404, 'That deck is not in the list.'); return d; };
const touch = (d, bump = true) => { if (bump) d.updatedAt = new Date().toISOString(); write(read()); };

const isOnline = (d) => d.kind === 'online';
const local = (d) => { if (isOnline(d)) throw fail(400, 'This deck lives online. Open it there to edit it.'); return d; };
const cleanUrl = (u, what = 'link') => {
  let x; try { x = new URL(String(u ?? '').trim()); } catch { throw fail(400, `The ${what} is not a valid address. Paste the full link, starting with https://`); }
  if (!/^https?:$/.test(x.protocol)) throw fail(400, `The ${what} must start with http:// or https://`);
  return x.href;
};
const cleanLinks = (links) => (Array.isArray(links) ? links : []).filter((l) => l && String(l.url ?? '').trim()).slice(0, 8)
  .map((l) => ({label: String(l.label ?? '').trim().slice(0, 80) || new URL(cleanUrl(l.url)).hostname, url: cleanUrl(l.url)}));

const htmlFiles = (dir) => { try { return fs.readdirSync(dir, {withFileTypes: true}).filter((e) => e.isFile() && /\.html?$/i.test(e.name) && !/^_/.test(e.name)).map((e) => e.name); } catch { return []; } };
const inside = (dir, rel) => { // a path under the deck folder, or null (no .., no absolute paths, nothing outside)
  const full = path.resolve(dir, String(rel ?? ''));
  return full === dir || full.startsWith(dir + path.sep) ? full : null;
};

// the files you would swap: everything under assets/ (images, fonts, video), plus the loose files in the main folder
const listFiles = (d) => {
  const out = [];
  const walk = (rel, depth) => {
    let entries = [];
    try { entries = fs.readdirSync(path.join(d.dir, rel), {withFileTypes: true}); } catch { return; }
    for (const e of entries) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { if (depth < 3 && !/^(node_modules|\.git)$/.test(e.name)) walk(r, depth + 1); continue; }
      const st = fs.statSync(path.join(d.dir, r));
      out.push({path: r, name: e.name, folder: rel, size: st.size, mtime: st.mtimeMs, image: IMG.test(e.name)});
    }
  };
  walk('assets', 0);
  return out.sort((a, b) => a.path.localeCompare(b.path)).slice(0, 400);
};
const folders = (d) => {
  const out = new Set(['', 'assets']);
  const walk = (rel, depth) => {
    try { for (const e of fs.readdirSync(path.join(d.dir, rel), {withFileTypes: true})) if (e.isDirectory() && depth < 3) { const r = `${rel}/${e.name}`; out.add(r); walk(r, depth + 1); } } catch {}
  };
  walk('assets', 0);
  return [...out];
};

// ---- the prices / contact lines at the top of src/slides.js ----
const SLIDES = (d) => path.join(d.dir, 'src', 'slides.js');
const BLOCKS = {PRICES: 'number', CONTACT: 'string'};
const blockRange = (src, name) => {
  const m = new RegExp(`export const ${name} = \\{\\n([\\s\\S]*?)\\n\\};`).exec(src);
  return m ? {start: m.index + m[0].indexOf('\n') + 1, text: m[1]} : null;
};
const readConfig = (d) => {
  let src; try { src = fs.readFileSync(SLIDES(d), 'utf8'); } catch { return null; }
  const out = {};
  for (const [name, type] of Object.entries(BLOCKS)) {
    const b = blockRange(src, name);
    if (!b) continue;
    out[name] = [...b.text.matchAll(type === 'number' ? /^\s*(\w+):\s*(-?\d+(?:\.\d+)?),?\s*(?:\/\/\s*(.*))?$/gm : /^\s*(\w+):\s*'((?:[^'\\]|\\.)*)',?\s*(?:\/\/\s*(.*))?$/gm)]
      .map((m) => ({key: m[1], value: type === 'number' ? Number(m[2]) : m[2].replace(/\\(['\\])/g, '$1'), note: m[3] ?? ''}));
  }
  return Object.keys(out).length ? out : null;
};
const writeConfig = (d, edits) => {
  let src = fs.readFileSync(SLIDES(d), 'utf8');
  let n = 0;
  for (const [name, type] of Object.entries(BLOCKS)) {
    const fields = edits?.[name]; const b = blockRange(src, name);
    if (!fields || !b) continue;
    const lines = b.text.split('\n').map((line) => {
      const m = /^(\s*)(\w+):(\s*)(.*?)(,?)(\s*\/\/.*)?$/.exec(line);
      if (!m || !(m[2] in fields)) return line;
      let v = fields[m[2]];
      if (type === 'number') { v = Number(v); if (!Number.isFinite(v) || v < 0) throw fail(400, `${m[2]} must be a number.`); }
      else { v = String(v ?? ''); if (v.length > 200 || /[\r\n]/.test(v)) throw fail(400, `${m[2]} is too long or has a line break.`); v = `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`; }
      n++;
      return `${m[1]}${m[2]}:${m[3]}${v}${m[5]}${m[6] ?? ''}`;
    });
    src = src.slice(0, b.start) + lines.join('\n') + src.slice(b.start + b.text.length);
  }
  fs.writeFileSync(SLIDES(d), src);
  return n;
};

let building = null;
const build = async (d) => {
  if (!d.build?.length) throw fail(400, 'This deck has no build step. Its .html files are used as they are.');
  if (building) throw fail(409, `Already rebuilding “${building}”. Wait for it to finish.`);
  building = d.title;
  try {
    const {build: esbuild} = reelRequire('esbuild');
    const three = path.join(REEL, 'node_modules', 'three', 'build', 'three.module.js');
    for (const b of d.build) {
      const entry = inside(d.dir, b.entry), out = inside(d.dir, b.out);
      if (!entry || !out || !fs.existsSync(entry)) throw fail(400, `Build file missing: ${b.entry}`);
      await esbuild({entryPoints: [entry], bundle: true, minify: true, format: 'iife', alias: fs.existsSync(three) ? {three} : {}, outfile: out, logLevel: 'silent', absWorkingDir: d.dir});
    }
  } catch (e) { throw e.status ? e : fail(500, `The build failed: ${String(e.message ?? e).split('\n')[0]}`); } finally { building = null; }
};

export const mountDecks = (app, {wrap}) => {
  const upload = multer({storage: multer.diskStorage({destination: path.join(DATA, '_uploads'), filename: (q, f, cb) => cb(null, `deck-${Date.now()}-${Math.random().toString(36).slice(2)}`)}), limits: {fileSize: 1024 ** 3, files: 40}});
  const summary = (d) => ({id: d.id, kind: isOnline(d) ? 'online' : 'local', title: d.title, description: d.description, updatedAt: d.updatedAt, versions: d.versions?.length ?? 0, exists: isOnline(d) || fs.existsSync(d.dir)});
  const detail = (d) => (isOnline(d)
    ? {...d, kind: 'online', links: d.links ?? [], summary: summary(d), exists: true, htmlFiles: [], files: [], folders: [], config: null, canBuild: false, versions: []}
    : {...d, kind: 'local', links: d.links ?? [], summary: summary(d), exists: fs.existsSync(d.dir), htmlFiles: htmlFiles(d.dir), files: listFiles(d), folders: folders(d), config: readConfig(d), canBuild: !!d.build?.length});

  app.get('/api/decks', wrap(async (req, res) => res.json({decks: read().map(summary)})));

  app.post('/api/decks', wrap(async (req, res) => {
    if (String(req.body?.url ?? '').trim()) { // a deck that lives online
      const url = cleanUrl(req.body.url, 'deck link');
      if (read().some((d) => isOnline(d) && d.url === url)) throw fail(409, 'That link is already in the list.');
      const title = String(req.body?.title ?? '').trim().slice(0, 120) || new URL(url).hostname;
      let id = slug(title); for (let i = 2; find(id); i++) id = `${slug(title)}-${i}`;
      const now = new Date().toISOString();
      const d = {id, kind: 'online', title, url, description: '', notes: '', links: [], createdAt: now, updatedAt: now};
      write([...read(), d]);
      activityLog(`Added the online deck “${title}” to Visual PPT.`, {source: 'save'});
      return res.json(detail(d));
    }
    const dir = path.resolve(String(req.body?.dir ?? '').trim().replace(/^"|"$/g, ''));
    if (!req.body?.dir || !path.isAbsolute(dir) || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) throw fail(400, 'Type the full path of an existing folder, e.g. D:\\Dev 2026\\my-deck.');
    const html = htmlFiles(dir);
    if (!html.length) throw fail(400, 'That folder has no .html file at its top level, so there is nothing to open.');
    if (read().some((d) => path.resolve(d.dir).toLowerCase() === dir.toLowerCase())) throw fail(409, 'That folder is already in the list.');
    const title = String(req.body?.title ?? '').trim().slice(0, 120) || path.basename(dir);
    let id = slug(title); for (let i = 2; find(id); i++) id = `${slug(title)}-${i}`;
    const first = html.includes('index.html') ? 'index.html' : html[0];
    const now = new Date().toISOString();
    const d = {id, title, dir, description: '', notes: '', versions: [{id: 'main', label: 'Main', file: first}], build: [], createdAt: now, updatedAt: now};
    write([...read(), d]);
    activityLog(`Added the deck “${title}” to Visual PPT.`, {source: 'save'});
    res.json(detail(d));
  }));

  app.get('/api/decks/:id', wrap(async (req, res) => res.json(detail(need(req.params.id)))));

  app.patch('/api/decks/:id', wrap(async (req, res) => {
    const d = need(req.params.id), b = req.body ?? {};
    const n = {}; // check everything first, then apply: a request that fails changes nothing
    if (typeof b.title === 'string') { if (!b.title.trim()) throw fail(400, 'The title cannot be empty.'); n.title = b.title.trim().slice(0, 120); }
    if (typeof b.description === 'string') n.description = b.description.slice(0, 2000);
    if (typeof b.notes === 'string') n.notes = b.notes.slice(0, 8000);
    if (typeof b.url === 'string' && isOnline(d)) n.url = cleanUrl(b.url, 'deck link');
    if (Array.isArray(b.links)) n.links = cleanLinks(b.links);
    if (Array.isArray(b.versions) && !isOnline(d)) {
      const ok = new Set(htmlFiles(d.dir));
      const seen = new Set();
      const v = b.versions.filter((x) => x && ok.has(x.file) && !seen.has(x.file) && seen.add(x.file)).map((x, i) => ({id: String(x.id || `v${i + 1}`).slice(0, 30), label: String(x.label || x.file).trim().slice(0, 60), file: x.file}));
      if (!v.length) throw fail(400, 'A deck needs at least one version to open.');
      n.versions = v;
    }
    Object.assign(d, n);
    touch(d);
    res.json(detail(d));
  }));

  app.delete('/api/decks/:id', wrap(async (req, res) => {
    const d = need(req.params.id);
    write(read().filter((x) => x.id !== d.id));
    activityLog(`Took the deck “${d.title}” off the Visual PPT list (its folder was not touched).`, {source: 'save'});
    res.json({ok: true});
  }));

  app.post('/api/decks/:id/upload', upload.array('files', 40), wrap(async (req, res) => {
    const d = need(req.params.id);
    const files = req.files ?? [];
    try {
      local(d);
      if (!files.length) throw fail(400, 'Choose at least one file.');
      const folder = String(req.body?.folder ?? 'assets').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
      const target = inside(d.dir, folder);
      if (!target || /(^|\/)(node_modules|\.git|src)(\/|$)/.test(folder)) throw fail(400, 'Pick a folder inside the deck (not src or node_modules).');
      fs.mkdirSync(target, {recursive: true});
      const saved = [], replaced = [];
      for (const f of files) {
        const name = path.basename(Buffer.from(f.originalname, 'latin1').toString('utf8')).replace(/[<>:"|?*\u0000-\u001f]/g, '_');
        if (!name || /^\.+$/.test(name)) continue;
        const dest = path.join(target, name);
        if (fs.existsSync(dest)) replaced.push(name);
        fs.copyFileSync(f.path, dest);
        saved.push(folder ? `${folder}/${name}` : name);
      }
      touch(d);
      activityLog(`Uploaded ${saved.length} file${saved.length === 1 ? '' : 's'} to the deck “${d.title}”${replaced.length ? ` (replaced ${replaced.join(', ')})` : ''}.`, {source: 'save'});
      res.json({saved, replaced, deck: detail(d)});
    } finally { for (const f of files) fs.rm(f.path, {force: true}, () => {}); }
  }));

  app.put('/api/decks/:id/config', wrap(async (req, res) => {
    const d = local(need(req.params.id));
    if (!readConfig(d)) throw fail(400, 'This deck has no prices or contact lines to edit.');
    const n = writeConfig(d, req.body);
    touch(d);
    activityLog(`Changed ${n} value${n === 1 ? '' : 's'} in the deck “${d.title}” (needs a rebuild to show).`, {source: 'save'});
    res.json({changed: n, config: readConfig(d)});
  }));

  app.post('/api/decks/:id/build', wrap(async (req, res) => {
    const d = local(need(req.params.id));
    const t = Date.now();
    await build(d);
    touch(d);
    activityLog(`Rebuilt the deck “${d.title}” (${((Date.now() - t) / 1000).toFixed(1)}s).`, {source: 'save', level: 'ok'});
    res.json({ok: true, ms: Date.now() - t});
  }));

  mountDeckChat(app, {wrap, need, touch, rebuild: build});

  // the deck itself: /decks/<id>/<file>. Its own relative links (deck.js, assets/…) then work from that address.
  app.use('/decks/:id', (req, res, next) => {
    const d = find(req.params.id);
    if (!d || isOnline(d) || !fs.existsSync(d.dir)) return res.status(404).type('text').send('That deck is not in the list, or its folder is missing.');
    express.static(d.dir, {fallthrough: false, setHeaders: (r) => r.set('Cache-Control', 'no-cache')})(req, res, next);
  });
};
