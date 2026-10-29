// Projects on disk: studio/data/<id>/project.json (+ log.jsonl, concepts.json, storyboard.json, samples/, checks/, refs/, renders/)
import fs from 'node:fs';
import path from 'node:path';
import {DATA, PRESETS, BRANDS, projectDir, projectAssets, projectCode} from './paths.mjs';

fs.mkdirSync(DATA, {recursive: true});

const readJson = (file, fallback = null) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const writeJson = (file, v) => { fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, JSON.stringify(v, null, 2)); };

export const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'video';

export const listPresets = () => fs.readdirSync(PRESETS).filter((f) => f.endsWith('.json')).map((f) => readJson(path.join(PRESETS, f))).filter(Boolean)
  .sort((a, b) => catRank(a.category) - catRank(b.category) || (a.custom ? 1 : 0) - (b.custom ? 1 : 0) || a.name.localeCompare(b.name));
const CATS = ['Tutorial', 'Reel 9:16', 'Loop / GIF'];
const catRank = (c) => (CATS.includes(c) ? CATS.indexOf(c) : CATS.length);
export const getPreset = (id) => (id ? readJson(path.join(PRESETS, `${id}.json`)) : null);
export const listBrands = () => fs.readdirSync(BRANDS).filter((f) => f.endsWith('.json')).map((f) => readJson(path.join(BRANDS, f))).filter(Boolean);
export const getBrand = (id) => (id && id !== 'custom' ? readJson(path.join(BRANDS, `${id}.json`)) : null);

const file = (id) => path.join(projectDir(id), 'project.json');
export const getProject = (id) => readJson(file(id));
export const saveProject = (p) => { p.updatedAt = new Date().toISOString(); writeJson(file(p.id), p); return p; };

export const listProjects = () => fs.readdirSync(DATA, {withFileTypes: true})
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => getProject(d.name)).filter(Boolean)
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export const createProject = ({title = 'Untitled video', presetId = null} = {}) => {
  const preset = getPreset(presetId);
  let id = slugify(title), n = 2;
  while (fs.existsSync(projectDir(id))) id = `${slugify(title)}-${n++}`;
  const d = preset?.defaults ?? {};
  const brand = getBrand(d.brand);
  const p = {
    id, title, presetId: preset?.id ?? null, status: 'brief', createdAt: new Date().toISOString(), sessionId: null, cost: 0,
    brief: {
      idea: '', audience: '', cta: '', script: '', language: d.language ?? 'English', onScreen: '',
      width: d.width ?? 1080, height: d.height ?? 1920, fps: d.fps ?? 30, durationSec: d.durationSec ?? null,
      brandId: d.brand ?? 'magicbolt', colors: brand ? Object.values(brand.palette).slice(0, 5) : ['#0E1B4D', '#1582D5', '#FDC60B'],
      style: '', captions: d.captions ?? '', links: '', notes: '',
    },
    assets: [], approvedConcept: null, renders: [],
  };
  fs.mkdirSync(projectAssets(id), {recursive: true});
  return saveProject(p);
};

export const deleteProject = (id) => {
  for (const dir of [projectDir(id), projectAssets(id), projectCode(id)]) fs.rmSync(dir, {recursive: true, force: true});
};

// ---------- duplicate: a full working copy of a project (code, media, brief, concept, storyboard) under a new id ----------
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// swap a project id wherever the copied files name it: asset paths (studio/<id>/), workspace paths, composition ids (Studio-<id>, Studio-<id>-concepts) and quoted ids
const swapId = (text, from, to) => {
  const f = reEsc(from), end = '(?=-concepts(?![A-Za-z0-9-])|(?![A-Za-z0-9-]))';
  return text
    .replace(new RegExp(`(studio|data)/${f}${end}`, 'g'), `$1/${to}`)
    .replace(new RegExp(`Studio-${f}${end}`, 'g'), `Studio-${to}`)
    .replace(new RegExp(`(['"\`])${f}\\1`, 'g'), `$1${to}$1`);
};
const renameInTree = (dir, from, to) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) renameInTree(full, from, to);
    else if (/\.(tsx?|jsx?|json|md|txt|css)$/i.test(e.name) && fs.statSync(full).size < 2 * 1024 * 1024) {
      const a = fs.readFileSync(full, 'utf8'), b = swapId(a, from, to);
      if (a !== b) fs.writeFileSync(full, b);
    }
  }
};
// not copied from the workspace: renders (big, and of the old video), check stills (old size), the chat and the AI's session
// Windows hands the copy filter paths with a \?\ prefix
const plain = (f) => path.resolve(String(f).replace(/^\\\\\?\\/, ''));
const SKIP_DATA = new Set(['renders', 'checks', 'log.jsonl', 'agent-session.json', 'project.json']);

export const duplicateProject = (srcId, {title, width, height, fps} = {}) => {
  const src = getProject(srcId);
  if (!src) throw Object.assign(new Error('No such project'), {status: 404});
  const name = String(title ?? '').trim() || `${src.title} (copy)`;
  let id = slugify(name), n = 2;
  while (fs.existsSync(projectDir(id)) || fs.existsSync(projectCode(id))) id = `${slugify(name)}-${n++}`;

  if (fs.existsSync(projectCode(srcId))) fs.cpSync(projectCode(srcId), projectCode(id), {recursive: true});
  if (fs.existsSync(projectAssets(srcId))) fs.cpSync(projectAssets(srcId), projectAssets(id), {recursive: true});
  else fs.mkdirSync(projectAssets(id), {recursive: true});
  fs.cpSync(projectDir(srcId), projectDir(id), {recursive: true, filter: (from) => { const rel = path.relative(plain(projectDir(srcId)), plain(from)); return !rel || !SKIP_DATA.has(rel.split(path.sep)[0]); }});
  renameInTree(projectCode(id), srcId, id);
  renameInTree(projectDir(id), srcId, id);

  const sb = readStoryboard(id);
  backfillAiSteps(src); // the copy keeps which steps the AI already did (its chat log is not copied)
  const p = structuredClone(src);
  for (const k of ['sessionId', 'codexSessionId', 'sessionHistory', 'codexSessionHistory', 'tokens', 'approval', 'adaptedAt']) delete p[k];
  Object.assign(p, {
    id, title: name, createdAt: new Date().toISOString(), cost: 0, renders: [], briefDirty: false, textEdited: false, audioEdited: false, styleEdited: false,
    status: sb ? 'review' : readConcepts(id)?.concepts?.length ? 'concepts' : 'brief',
    duplicatedFrom: {id: src.id, title: src.title, brief: structuredClone(src.brief), built: sb ? {width: sb.width, height: sb.height, fps: sb.fps} : null, at: new Date().toISOString()},
  });
  p.brief = {...p.brief, ...(width && height ? {width: Number(width), height: Number(height)} : {}), ...(fps ? {fps: Number(fps)} : {})};
  return saveProject(p);
};

// Which workflow steps (tab keys) the AI has worked on in this project, shown as a badge on the tab.
// Marked when an AI run starts; projects from before this existed are filled in once from the chat log.
const AI_LABELS = [[/^(Generate|Revise) concepts/, 'concepts'], [/^(Approved concept|Resume the build|Adapt the |Apply your review)/, 'build'], [/Make the on-screen text editable/, 'text'],
  [/Move the audio into/, 'audio'], [/Move the colours into/, 'style'], [/^Add animated background/, 'background'], [/^Apply look changes/, 'look']];
export const markAiStep = (p, step) => { if (step) p.aiSteps = {...(p.aiSteps ?? {}), [step]: new Date().toISOString()}; return p; };
export const backfillAiSteps = (p) => {
  if (p.aiSteps) return false;
  p.aiSteps = {};
  for (const e of readLog(p.id)) if (e.kind === 'user') { const hit = AI_LABELS.find(([re]) => re.test(String(e.text))); if (hit) p.aiSteps[hit[1]] = new Date(e.at).toISOString(); }
  if (p.brief?.storyFilled) p.aiSteps.brief = p.updatedAt ?? new Date().toISOString();
  return true;
};

export const readConcepts = (id) => readJson(path.join(projectDir(id), 'concepts.json'));
export const readStoryboard = (id) => readJson(path.join(projectDir(id), 'storyboard.json'));
export const listImages = (id, sub) => {
  const dir = path.join(projectDir(id), sub);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort().map((f) => `${sub}/${f}`) : [];
};

// chat / activity log
export const appendLog = (id, entry) => fs.appendFileSync(path.join(projectDir(id), 'log.jsonl'), JSON.stringify({at: Date.now(), ...entry}) + '\n');
export const readLog = (id) => {
  const f = path.join(projectDir(id), 'log.jsonl');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : [];
};
