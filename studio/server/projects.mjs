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
