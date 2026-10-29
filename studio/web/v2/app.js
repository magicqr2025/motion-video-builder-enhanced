// MotionStudio V2: shell, routes and the live event stream. Pages live in home.js, project.js and the section files below.
import {$, S, api, esc, toast, ICON} from './core.js';
import {renderHome} from './home.js';
import {renderProject, softRefresh, onLiveTick, userIsEditing} from './project.js';
import * as library from './library.js';
import * as decks from './decks.js';
import * as tools from './tools.js';
import * as storage from './storage.js';
import * as activity from './activity.js';
import {initAiMarks} from './ai.js';
import {initBackground, motionOn, motionPaused, pauseForWork, setMotion} from './bgfx.js';

const PAGES = {library, decks, tools, storage, activity};
const route = () => {
  const [, kind, id, tab] = location.hash.split('/');
  if (kind === 'p' && id) return {id: decodeURIComponent(id), tab: tab || null};
  if (PAGES[kind]) return {id: null, page: kind};
  return {id: null};
};

// ---------- top bar ----------
const NAV = [['Videos', '#/', ''], ['Library', '#/library', 'library'], ['Decks', '#/decks', 'decks'], ['Video tools', '#/tools', 'tools'], ['Storage', '#/storage', 'storage'], ['Activity', '#/activity', 'activity']];
let topSig = '';
const paintTop = (force = false) => {
  const r = route(), busy = S.live.busy, render = S.live.render, work = busy.length + (render ? 1 : 0);
  pauseForWork(work > 0); // the animated background steps aside while the AI or a render works
  const sig = JSON.stringify([r.page ?? (r.id ? 'p' : ''), busy.map((b) => b.title), render ? Math.round((render.progress ?? 0) * 100) : null, S.conn, motionOn(), motionPaused(), !!document.fullscreenElement]);
  if (!force && sig === topSig) return;
  topSig = sig;
  $('#top').innerHTML = `
    <a class="brand" href="#/" aria-label="MotionStudio home"><span class="mark">${ICON.bolt}</span><span><b>MotionStudio</b><small>by MagicBolt.ai · V2 preview</small></span></a>
    <nav class="nav" aria-label="Main">${NAV.map(([label, href, key]) => `<a href="${href}" class="${(key ? r.page === key : !r.page) ? 'on' : ''}">${label}</a>`).join('')}</nav>
    <div class="top-r">
      ${work ? `<a class="chip amber" href="#/activity" title="${esc(busy.map((b) => b.title).join(', '))}"><i class="live"></i>${busy.length ? `AI working${busy.length > 1 ? ` · ${busy.length}` : ''}` : ''}${render ? `${busy.length ? ' · ' : ''}Rendering ${Math.round((render.progress ?? 0) * 100)}%` : ''}</a>` : '<span class="chip">Idle</span>'}
      <button type="button" class="chip tog ${motionOn() ? 'on' : ''}" data-act="motion" aria-pressed="${motionOn()}" title="Turn the animated background on or off">${motionOn() ? (motionPaused() ? 'Motion paused · working' : 'Motion on') : 'Motion off'}</button>
      <span class="chip ${S.conn ? '' : 'off'}" title="Live connection to the studio">${S.conn ? 'Connected' : 'Reconnecting…'}</span>
      <a class="btn sm" href="/?classic=1" title="Open the classic MotionStudio">Classic UI ${ICON.ext}</a>
      <button type="button" class="btn icon sm" data-act="fullscreen" aria-label="${document.fullscreenElement ? 'Exit full screen' : 'Full screen'}" title="${document.fullscreenElement ? 'Exit full screen (Esc)' : 'Full screen'}">${document.fullscreenElement ? ICON.fsOut : ICON.fsIn}</button>
    </div>`;
};

// ---------- routing ----------
let token = 0, active = null;
const show = async () => {
  const my = ++token, r = route();
  paintTop();
  if (active && active !== r.page) PAGES[active]?.leave?.();
  active = r.page ?? null;
  try {
    if (r.page) { S.cur = null; document.title = `${r.page[0].toUpperCase()}${r.page.slice(1)} · MotionStudio V2`; $('#view').dataset.still = ''; await PAGES[r.page].render($('#view')); }
    else if (!r.id) { S.cur = null; await renderHome(); }
    else await renderProject(r.id, r.tab);
  } catch (e) {
    if (my !== token) return;
    $('#view').innerHTML = `<div class="card empty"><div class="ico">${ICON.bolt}</div><h2>Could not open this page</h2><p>${esc(e.message)}</p><a class="btn main" href="#/">Back to all videos</a></div>`;
  }
};
window.addEventListener('hashchange', show);

// ---------- live events ----------
let timer = null;
const refreshSoon = () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const r = route();
    if (r.page) return;
    if (userIsEditing()) return softRefresh();
    try { if (!r.id) await renderHome(); else await renderProject(r.id, r.tab, {quiet: true}); } catch { /* the next event retries */ }
  }, 300);
};
const es = new EventSource('/api/events');
es.onopen = () => { S.conn = true; paintTop(); };
es.onerror = () => { S.conn = false; paintTop(); };
es.onmessage = (m) => {
  let e; try { e = JSON.parse(m.data); } catch { return; }
  const r = route(), id = r.id;
  if (r.page) PAGES[r.page].onEvent?.(e);
  if (e.type === 'tick') { S.live = {busy: e.busy ?? [], render: e.render ?? null, procs: e.procs ?? [], media: e.media ?? null}; paintTop(); onLiveTick(); return; }
  if (e.type === 'projects') return refreshSoon();
  if (e.type === 'render') { S.live.render = e.done ? null : e; paintTop(); if (id && e.projectId === id) refreshSoon(); return; }
  if (e.type === 'project' && (!id || e.projectId === id)) return refreshSoon();
  if (e.type === 'job' && e.file && e.projectId === id) return onLiveTick(e);
  if (e.type === 'agent' && e.projectId === id) { if (e.kind === 'done') refreshSoon(); else if (e.kind === 'tool' || e.kind === 'text') onLiveTick(e); }
};

// ---------- image zoom: stills marked data-group step through each other with the arrows ----------
let zoomList = [], zoomAt = 0;
const showZoom = (i) => {
  const box = $('#zoom'); zoomAt = (i + zoomList.length) % zoomList.length;
  const z = zoomList[zoomAt];
  $('img', box).src = z.dataset.zoom; $('p', box).textContent = `${z.dataset.cap ?? ''}${zoomList.length > 1 ? ` · ${zoomAt + 1} of ${zoomList.length}` : ''}`;
  box.querySelectorAll('.znav').forEach((b) => { b.hidden = zoomList.length < 2; });
  box.hidden = false;
};
document.addEventListener('click', (ev) => {
  const z = ev.target.closest('[data-zoom]');
  if (z) { zoomList = z.dataset.group ? [...document.querySelectorAll('[data-zoom][data-group]')] : [z]; showZoom(Math.max(0, zoomList.indexOf(z))); return; }
  if (ev.target.closest('[data-act="zoom-prev"]')) return showZoom(zoomAt - 1);
  if (ev.target.closest('[data-act="zoom-next"]')) return showZoom(zoomAt + 1);
  if (ev.target.closest('[data-act="zoom-close"]') || ev.target === $('#zoom')) $('#zoom').hidden = true;
});
document.addEventListener('keydown', (ev) => {
  if ($('#zoom').hidden) return;
  if (ev.key === 'Escape') $('#zoom').hidden = true; else if (ev.key === 'ArrowLeft') showZoom(zoomAt - 1); else if (ev.key === 'ArrowRight') showZoom(zoomAt + 1);
});

initAiMarks();
initBackground();
document.addEventListener('click', (ev) => {
  if (ev.target.closest('[data-act="motion"]')) { setMotion(!motionOn()); paintTop(true); }
  if (ev.target.closest('[data-act="fullscreen"]')) { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch((e) => toast(e.message)); }
});
document.addEventListener('fullscreenchange', () => paintTop(true));
(async () => {
  try { S.state = await api('/api/state'); } catch (e) { toast(e.message); }
  show();
})();
