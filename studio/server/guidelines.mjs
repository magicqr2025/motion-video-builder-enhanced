// Do's and Don'ts that every video follows. One file (studio/guidelines.json) the user edits in the browser:
// a general set, one set per format (picked by the video's size), and an "extra" set for personal rules.
import fs from 'node:fs';
import path from 'node:path';
import {STUDIO} from './paths.mjs';

const FILE = path.join(STUDIO, 'guidelines.json');
const DEFAULTS_FILE = path.join(STUDIO, 'guidelines.defaults.json');

const lines = (v) => (Array.isArray(v) ? v : []).map((x) => String(x ?? '').trim().slice(0, 300)).filter(Boolean).slice(0, 40);
const set = (s = {}) => ({title: String(s.title ?? '').slice(0, 80), do: lines(s.do), dont: lines(s.dont)});

export const cleanGuidelines = (g = {}) => ({
  general: set(g.general),
  formats: Object.fromEntries(['vertical', 'horizontal', 'square'].map((k) => [k, set(g.formats?.[k])])),
  extra: set(g.extra),
});

const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

// The shipped starter rules are copied to a defaults file once, so "Reset to starter rules" still works after the user edits.
const ensureDefaults = () => { if (!fs.existsSync(DEFAULTS_FILE) && fs.existsSync(FILE)) fs.copyFileSync(FILE, DEFAULTS_FILE); };

export const getGuidelines = () => { ensureDefaults(); return cleanGuidelines(read(FILE) ?? {}); };
export const saveGuidelines = (g) => { ensureDefaults(); const c = cleanGuidelines(g); fs.writeFileSync(FILE, JSON.stringify(c, null, 2)); return c; };
export const resetGuidelines = () => { ensureDefaults(); const d = read(DEFAULTS_FILE); if (d) fs.writeFileSync(FILE, JSON.stringify(cleanGuidelines(d), null, 2)); return getGuidelines(); };

export const formatKey = (w, h) => { const r = (w || 1080) / (h || 1920); return r < 0.8 ? 'vertical' : r > 1.25 ? 'horizontal' : 'square'; };

// Text for the AI: general rules, then the rules for this video's format, then the user's own. `off` lists groups the user switched off for this video.
export const guidelinesText = (brief = {}, g = getGuidelines()) => {
  const off = new Set(brief.guidelinesOff ?? []), fk = formatKey(brief.width, brief.height);
  const groups = [['general', g.general], [fk, g.formats[fk]], ['extra', g.extra]].filter(([k, s]) => !off.has(k) && (s.do.length || s.dont.length));
  const own = lines(String(brief.projectRules ?? '').split('\n'));
  if (own.length) groups.push(['project', {title: 'For this video only', do: [], dont: [], free: own}]);
  if (!groups.length) return '';
  return groups.map(([, s]) => `**${s.title || 'Rules'}**\n${[...s.do.map((x) => `- DO: ${x}`), ...s.dont.map((x) => `- DON'T: ${x.replace(/^do not /i, '')}`), ...(s.free ?? []).map((x) => `- ${x}`)].join('\n')}`).join('\n\n');
};

export const mountGuidelines = (app, {wrap}) => {
  app.get('/api/guidelines', wrap(async (req, res) => res.json({guidelines: getGuidelines(), formatKeys: {}})));
  app.put('/api/guidelines', wrap(async (req, res) => res.json({guidelines: saveGuidelines(req.body.guidelines)})));
  app.post('/api/guidelines/reset', wrap(async (req, res) => res.json({guidelines: resetGuidelines()})));
};
