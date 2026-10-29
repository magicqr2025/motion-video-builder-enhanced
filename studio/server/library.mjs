// Library: every video in one list, with a description to copy, "posted / approved / sent" ticks, and a way to move
// where the finished file is kept. The notes live in project.json (project.library); files only move inside folders the user picks.
import fs from 'node:fs';
import path from 'node:path';
import {projectDir} from './paths.mjs';
import {listProjects, saveProject, listImages} from './projects.mjs';
import {activityLog} from './activity.mjs';

export const PLATFORMS = ['instagram', 'youtube', 'facebook', 'linkedin', 'whatsapp', 'x', 'tiktok'];
const YMD = /^\d{4}-\d{2}-\d{2}$/;

const clean = (lib = {}) => ({
  description: String(lib.description ?? '').slice(0, 8000),
  posted: !!lib.posted,
  postedOn: YMD.test(lib.postedOn ?? '') ? lib.postedOn : '',
  platforms: [...new Set((Array.isArray(lib.platforms) ? lib.platforms : []).filter((x) => PLATFORMS.includes(x)))],
  final: !!lib.final,
  sent: !!lib.sent,
});

const sizeOf = (f) => { try { return fs.statSync(f).size; } catch { return 0; } };
const safeName = (s) => String(s).normalize('NFKD').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(-80) || `video-${Date.now()}`;
const uniquePath = (dir, name) => {
  const ext = path.extname(name), stem = path.basename(name, ext);
  let out = path.join(dir, name), n = 2;
  while (fs.existsSync(out)) out = path.join(dir, `${stem} (${n++})${ext}`);
  return out;
};
const moveFile = (from, to) => {
  try { fs.renameSync(from, to); } catch (e) {
    if (e.code !== 'EXDEV') throw e; // another drive: copy, then remove the original
    fs.copyFileSync(from, to); fs.unlinkSync(from);
  }
};

const row = (p) => {
  const dir = projectDir(p.id);
  const renders = (p.renders ?? []).map((r) => {
    const internal = path.join(dir, r.file), exportedOk = !!r.exported && fs.existsSync(r.exported);
    return {file: r.file, format: r.format ?? (path.extname(r.file).slice(1) || 'mp4'), draft: !!r.draft, at: r.at, durationSec: r.durationSec, width: r.width, height: r.height,
      exported: r.exported ?? null, exportedExists: exportedOk, exists: fs.existsSync(internal), size: sizeOf(exportedOk ? r.exported : internal), url: `/data/${p.id}/${r.file}`};
  });
  const thumb = listImages(p.id, 'checks')[0] ?? listImages(p.id, 'samples')[0] ?? null;
  return {id: p.id, title: p.title, status: p.status, createdAt: p.createdAt, updatedAt: p.updatedAt, thumb: thumb ? `/data/${p.id}/${thumb}` : null, library: clean(p.library), renders};
};

export const mountLibrary = (app, {wrap, need, busy}) => {
  app.get('/api/library', wrap(async (req, res) => {
    const rows = listProjects().map(row).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.json({rows, platforms: PLATFORMS});
  }));

  // notes and ticks: saved quietly (no broadcast), so the page is not redrawn under the cursor
  app.patch('/api/projects/:id/library', wrap(async (req, res) => {
    const p = need(req.params.id);
    const next = clean({...clean(p.library), ...req.body});
    if (next.posted && !p.library?.posted && !next.postedOn) next.postedOn = new Date().toLocaleDateString('en-CA');
    if (!next.posted) { next.postedOn = ''; next.platforms = []; }
    p.library = next; saveProject(p);
    res.json({library: next});
  }));

  // where the finished file is kept: move the copy in the output folder, or put a copy in the chosen folder
  app.post('/api/projects/:id/library/move', wrap(async (req, res) => {
    const p = need(req.params.id), fail = (m, status = 400) => { throw Object.assign(new Error(m), {status}); };
    const r = (p.renders ?? []).find((x) => x.file === req.body?.file);
    if (!r) fail('No such render.', 404);
    const dirIn = String(req.body?.dir ?? '').trim();
    if (!dirIn || !path.isAbsolute(dirIn)) fail('Choose a folder with a full path, for example D:\\Videos\\Posted.');
    const dir = path.resolve(dirIn);
    if (busy().render === p.id) fail('This video is rendering. Wait for it to finish.', 409);
    fs.mkdirSync(dir, {recursive: true});
    const internal = path.join(projectDir(p.id), r.file);
    let moved = false, dest;
    if (r.exported && fs.existsSync(r.exported)) {
      if (path.resolve(path.dirname(r.exported)) === dir) fail('It is already in that folder.');
      dest = uniquePath(dir, path.basename(r.exported)); moveFile(r.exported, dest); moved = true;
    } else {
      if (!fs.existsSync(internal)) fail('The rendered file is missing.', 404);
      dest = uniquePath(dir, `${safeName(p.title)}-${path.basename(r.file).replace(`${p.id}-`, '')}`); fs.copyFileSync(internal, dest);
    }
    r.exported = dest; saveProject(p);
    activityLog(`Library: ${moved ? 'moved' : 'copied'} “${p.title}” to ${dest}`, {projectId: p.id, source: 'save', level: 'ok'});
    res.json({ok: true, moved, exported: dest});
  }));
};
