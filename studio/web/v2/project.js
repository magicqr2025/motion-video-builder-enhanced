// A video's page: header, tabs and the view for the open tab. Build, Concepts and Render are V2 pages;
// the other tabs open the same page in the classic app (a card says so) until they are ported.
import {$, S, api, esc, pill, statusOf, bestTab, ICON, classicUrl} from './core.js';
import {adaptBanner} from './duplicate.js';
import {aiTabBadge} from './ai.js';
import * as script from './script.js';
import * as brief from './brief.js';
import * as look from './look.js';
import * as text from './text.js';
import * as style from './style.js';
import * as audio from './audio.js';
import * as background from './background.js';
import * as build from './build.js';
import * as concepts from './concepts.js';
import * as render from './render.js';

const VIEWS = {script, brief, look, build, concepts, text, style, audio, background, render};
const TABS = [['script', 'Reference snapshots'], ['brief', 'Brief'], ['look', 'Look & feel'], ['concepts', 'Concepts'], ['build', 'Build & timing'], ['text', 'Text'], ['style', 'Style'], ['audio', 'Audio'], ['background', 'Background'], ['render', 'Preview & render']];
// same rules as the classic app: which tabs are open at this point of the video
const tabOk = (t, p, c) => ['script', 'brief', 'look'].includes(t)
  || (t === 'concepts' && (c.concepts || p.status !== 'brief'))
  || (t === 'build' && (c.storyboard || c.resumable || ['building', 'review', 'rendering', 'done'].includes(p.status)))
  || (['render', 'text', 'audio', 'background', 'style'].includes(t) && !!c.storyboard);

let current = {id: null, tab: null};

export const userIsEditing = () => { const a = document.activeElement; return !!a && !!a.closest?.('#view') && /^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName); };
export const softRefresh = async () => { if (!current.id) return; try { S.cur = await api(`/api/projects/${current.id}?nolog=1`); VIEWS[current.tab]?.soft?.(); } catch { /* next event retries */ } };
export const onLiveTick = (ev) => { VIEWS[current.tab]?.live?.(ev); };

const meta = (p, sb) => {
  const b = p.brief ?? {}, preset = S.state?.presets?.find((x) => x.id === p.presetId)?.name;
  const size = sb?.width ? `${sb.width}×${sb.height}` : b.width ? `${b.width}×${b.height}` : '';
  return [preset, size && `${size} · ${sb?.fps ?? b.fps} fps`, sb?.durationSec && `${Math.round(sb.durationSec)} s`].filter(Boolean).map(esc).join(' · ');
};

const classicCard = (p, tab) => {
  const label = TABS.find(([k]) => k === tab)?.[1] ?? tab;
  return `<div class="card empty"><div class="ico">${ICON.bolt}</div><h2>${esc(label)} is not in V2 yet</h2>
    <p>This part still works in the classic app, with the same data. Anything you change there shows up here too.</p>
    <a class="btn main" href="${classicUrl(p.id, tab)}" target="_blank" rel="noopener">Open ${esc(label)} in classic ${ICON.ext}</a></div>`;
};

export const renderProject = async (id, tab, {quiet = false} = {}) => {
  if (!quiet && current.id !== id) $('#view').innerHTML = '<div class="stack"><div class="skel" style="height:64px"></div><div class="skel" style="height:44px;width:70%"></div><div class="skel" style="height:420px"></div></div>';
  S.cur = await api(`/api/projects/${encodeURIComponent(id)}?nolog=1`);
  const c = S.cur, p = c.project;
  if (!tab || !tabOk(tab, p, c)) tab = tabOk(bestTab(p), p, c) ? bestTab(p) : 'brief';
  const live = S.live.busy.some((b) => b.projectId === p.id) || c.busy;
  const st = statusOf(p.status, live);
  if (current.id === id && current.tab && current.tab !== tab) VIEWS[current.tab]?.leave?.();
  current = {id, tab};
  document.title = `${p.title || 'Video'} · MotionStudio V2`;
  const view = $('#view');
  view.dataset.still = quiet ? '1' : '';
  view.innerHTML = `<div class="stack">
    <div class="phead">
      <a class="btn icon" href="#/" aria-label="Back to all videos">${ICON.back}</a>
      <div class="t"><h1>${esc(p.title || 'Untitled video')}</h1><div class="small muted">${meta(p, c.storyboard)}</div></div>
      ${pill(st.label, st.tone, st.live)}
      ${c.busy ? `<button type="button" class="btn sm danger" data-act="stop">Stop AI</button>` : ''}
      <button type="button" class="btn sm" data-dup="open" title="Make a full working copy, optionally at another size">⧉ Duplicate</button>
      <a class="btn sm" href="${classicUrl(p.id, tab)}" target="_blank" rel="noopener" title="Open this page in the classic app">Classic ${ICON.ext}</a>
    </div>
    <nav class="tabs" aria-label="Video pages">${TABS.map(([k, label], i) => {
      const ok = tabOk(k, p, c), ported = k in VIEWS;
      return ok ? `<a class="tab ${k === tab ? 'on' : ''}" href="#/p/${encodeURIComponent(p.id)}/${k}" ${k === tab ? 'aria-current="page"' : ''}><span class="n">${i}</span>${label}${ported ? '' : ICON.ext}${aiTabBadge(p.aiSteps?.[k])}</a>` : `<span class="tab off" aria-disabled="true"><span class="n">${i}</span>${label}</span>`;
    }).join('')}</nav>
    ${adaptBanner(c)}
    <div id="tab" class="stack"></div>
  </div>`;
  const host = $('#tab');
  if (VIEWS[tab]) await VIEWS[tab].render(host, c);
  else host.innerHTML = classicCard(p, tab);
};

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act="stop"]');
  if (!b || !current.id) return;
  b.disabled = true;
  try { await api(`/api/projects/${current.id}/stop`, {method: 'POST'}); } catch { /* the heartbeat shows the real state */ }
});
