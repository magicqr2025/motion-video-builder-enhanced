// Shared bits for MotionStudio V2: the API client, the one store, small helpers.
// V2 only reads and writes through the same /api routes the classic app uses; it adds nothing on the server.
export const $ = (s, el = document) => el.querySelector(s);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

// state: the list (home), cur: the open video, live: what the server heartbeat says is running
export const S = {state: null, cur: null, live: {busy: [], render: null}, procs: [], activity: [], conn: false};

export const api = async (url, opts = {}) => {
  const isForm = opts.body instanceof FormData;
  const res = await fetch(url, {headers: opts.body && !isForm ? {'Content-Type': 'application/json'} : {}, ...opts, body: opts.body && !isForm ? JSON.stringify(opts.body) : opts.body});
  const j = await res.json().catch(() => ({}));
  if (res.status === 401 && j.login) { location.replace(`/login?next=${encodeURIComponent(location.pathname + location.hash)}`); throw new Error('Sign in required.'); }
  if (!res.ok) throw new Error(j.error || res.statusText);
  return j;
};

export const toast = (msg, ms = 3600) => {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => (t.hidden = true), ms);
};

export const clock = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
export const fmtT = (s) => { s = Math.max(0, Number(s) || 0); return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };
export const dur = (ms) => { const s = Math.round(ms / 1000); return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s` : `${Math.floor(s / 3600)}h ${String(Math.floor(s / 60) % 60).padStart(2, '0')}m`; };
export const ago = (t) => {
  const s = (Date.now() - new Date(t).getTime()) / 1000;
  return !Number.isFinite(s) ? '' : s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)} min ago` : s < 86400 ? `${Math.floor(s / 3600)} h ago` : `${Math.floor(s / 86400)} d ago`;
};
export const bust = () => `?v=${Date.now() % 1e7}`;

// one place for what a project status means, in words and colour
export const STATUS = {
  brief: ['Brief', 'dim'], concepting: ['Designing concepts', 'amber'], concepts: ['Concepts ready', 'violet'], building: ['Building', 'amber'],
  review: ['Ready to review', 'violet'], rendering: ['Rendering', 'amber'], done: ['Done', 'mint'],
};
export const statusOf = (status, busy) => { const [label, tone] = STATUS[status] ?? [status || 'Draft', 'dim']; return {label, tone, live: !!busy || ['concepting', 'building', 'rendering'].includes(status) && !!busy}; };
export const bestTab = (p) => ({brief: 'brief', concepting: 'concepts', concepts: 'concepts', building: 'build', review: 'build', rendering: 'render', done: 'render'}[p.status] ?? 'brief');

// a stable colour pair per video, used for thumbnails and scene frames
const PAIRS = [['#2B1F8F', '#7B5CFF'], ['#12307A', '#3B7BFF'], ['#075B3E', '#14A36B'], ['#7A4E07', '#E8A52B'], ['#7A1241', '#E0437F'], ['#064E5A', '#0FA5B8']];
export const pairFor = (key, i) => PAIRS[(i ?? [...String(key)].reduce((a, c) => a + c.charCodeAt(0), 0)) % PAIRS.length];
export const gradFor = (key, i) => { const [a, b] = pairFor(key, i); return `linear-gradient(165deg, ${a}, ${b} 72%, #E9E5FF)`; };

export const ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 2 5 13.5h5.5L9.5 22 19 9.5h-5.8L13.5 2z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  fsIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  fsOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h3a2 2 0 0 0 2-2V3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M21 16h-3a2 2 0 0 0-2 2v3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
};

export const pill = (text, tone = 'dim', live = false) => `<span class="pill ${tone}">${live ? '<i class="live"></i>' : ''}${esc(text)}</span>`;

// "open this in the classic app" for anything V2 does not cover yet
export const classicUrl = (id, tab) => (id ? `/?classic=1#/p/${encodeURIComponent(id)}/${tab ?? ''}` : '/?classic=1#/');

// audio tags ([whispers], [pause]...) steer the ElevenLabs voice only: they are not spoken words, so they never count as text.
// Keep in step with TAG in server/voice.mjs
const TAG = /[ \t]*\[[A-Za-z][^\[\]\n]{0,39}\][ \t]*/g;
export const stripTags = (t) => String(t ?? '').replace(TAG, ' ').replace(/[ \t]+\n/g, '\n').replace(/ {2,}/g, ' ').trim();
export const countTags = (t) => (String(t ?? '').match(TAG) ?? []).length;
export const words = (t) => (stripTags(t).match(/\S+/g) ?? []).length;

// every edit on the Brief goes through one debounced PATCH, the same call the classic app makes
const PEND = {patch: {}, timer: null};
export const queueSave = (patch, onState) => {
  if (patch.brief) PEND.patch.brief = {...(PEND.patch.brief ?? {}), ...patch.brief};
  for (const k of Object.keys(patch)) if (k !== 'brief') PEND.patch[k] = patch[k];
  onState?.('Saving…');
  clearTimeout(PEND.timer);
  PEND.timer = setTimeout(() => flushSave(onState), 500);
};
export const flushSave = async (onState) => {
  clearTimeout(PEND.timer);
  if (!Object.keys(PEND.patch).length || !S.cur) return;
  const body = PEND.patch; PEND.patch = {};
  try { S.cur.project = await api(`/api/projects/${S.cur.project.id}`, {method: 'PATCH', body}); onState?.('Saved.'); }
  catch (e) { toast(e.message); onState?.('Not saved'); }
};
export const hasPending = () => Object.keys(PEND.patch).length > 0;

// the live Remotion preview of the open video, and the card shown while a page's data file does not exist yet
export const studioUrl = (c) => `${S.state.previewUrl}/${c.compositions.video}`;
export const previewBox = (c, h = 420) => `<div class="preview" style="height:${h}px;aspect-ratio:auto"><iframe src="${studioUrl(c)}" title="Remotion preview"></iframe></div>`;
export const notEditable = (title, text, btn, act, busy) => `<div class="card empty"><div class="ico">${ICON.bolt}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><button type="button" class="btn main" data-act="${act}" ${busy ? 'disabled' : ''}>${esc(btn)}</button></div>`;
