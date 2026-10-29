// Home: how many videos, what is running, every video as a card, and presets to start a new one.
import {$, S, api, esc, toast, ago, dur, gradFor, statusOf, bestTab, pill, ICON} from './core.js';

const F = {q: ''};

const todayStats = async () => {
  try {
    const {finished = []} = await api('/api/processes');
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const today = finished.filter((p) => p.startedAt >= start.getTime());
    return {n: today.length, ms: today.reduce((a, p) => a + (p.durationMs || 0), 0), cost: today.reduce((a, p) => a + (p.costUsd ?? p.cost ?? 0), 0)};
  } catch { return null; }
};

const videoCard = (p, i) => {
  const busyNow = S.live.busy.some((b) => b.projectId === p.id) || p.busy;
  const st = statusOf(p.status, busyNow);
  const preset = S.state.presets.find((x) => x.id === p.presetId)?.name ?? 'No preset';
  return `<a class="card hover vcard d${Math.min(5, i % 5 + 1)}" href="#/p/${encodeURIComponent(p.id)}/${bestTab(p)}" aria-label="Open ${esc(p.title)}">
    <div class="vthumb" style="background:${gradFor(p.id)}"><b>${esc(p.title || 'Untitled video')}</b>${pill(st.label, st.tone, st.live)}</div>
    <div class="meta"><span>${esc(preset)}</span><span>${esc(ago(p.updatedAt))}</span></div></a>`;
};

const paintList = () => {
  const q = F.q.trim().toLowerCase();
  const list = [...S.state.projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).filter((p) => !q || `${p.title} ${p.id}`.toLowerCase().includes(q));
  const el = $('#vlist');
  if (el) el.innerHTML = list.length ? list.map(videoCard).join('') : `<div class="card empty" style="grid-column:1/-1"><p>${q ? 'No video matches that search.' : 'No videos yet. Pick a preset below to start one.'}</p></div>`;
};

export const renderHome = async () => {
  S.state = await api('/api/state');
  const ps = S.state.projects, building = ps.filter((p) => ['concepting', 'building', 'rendering'].includes(p.status) || p.busy || S.live.busy.some((b) => b.projectId === p.id)).length;
  const done = ps.filter((p) => p.status === 'done').length;
  const stats = await todayStats();
  const ai = S.state.settings?.ai?.runtime;
  $('#view').innerHTML = `<div class="stack">
    <div class="hero">
      <div class="card d1"><i class="glow" style="width:240px;height:240px;left:-60px;top:-70px;background:rgba(111,92,255,.32)"></i>
        <span class="muted" style="position:relative">Videos</span><span class="big num" style="position:relative">${ps.length}</span>
        <div class="row" style="position:relative;margin-top:auto">${pill(`${done} finished`, 'mint')}${building ? pill(`${building} in progress`, 'amber', true) : ''}</div></div>
      <div class="card d2"><span class="muted">Today</span>
        ${stats ? `<span class="big num" style="font-size:60px">${stats.n}</span><div class="small muted" style="margin-top:auto">AI tasks and renders · ${dur(stats.ms)} of work${stats.cost ? ` · about $${stats.cost.toFixed(2)}` : ''}</div>` : '<p class="muted">No activity numbers yet.</p>'}</div>
      <div class="card d3"><span class="muted">AI model</span>
        <h2 style="margin-top:8px">${esc(ai?.engine ?? 'Claude Code')}</h2><div class="muted">${esc(ai?.model && ai.model !== 'default' ? ai.model : 'default model')} · ${esc(ai?.where === 'cloud' ? 'cloud' : ai?.where ?? '')}</div>
        <div class="small dim" style="margin-top:auto">Change the model on the classic home page.</div></div>
    </div>

    <div class="spread"><h2>Your videos</h2>
      <label class="row" style="position:relative"><span style="position:absolute;left:14px;width:16px;height:16px;color:var(--dim);display:grid">${ICON.search}</span><input class="in" id="vsearch" type="search" placeholder="Search videos" value="${esc(F.q)}" style="padding-left:38px;width:260px;border-radius:99px" aria-label="Search videos" /></label></div>
    <div class="vgrid" id="vlist"></div>

    <div class="spread" style="margin-top:12px"><h2>Start a new video</h2><span class="small muted">A preset is a look you already approved. Your new video opens on its Brief.</span></div>
    <div class="vgrid" id="presets">${S.state.presets.filter((pr) => !pr.hidden).map((pr) => `<button type="button" class="card hover preset" data-preset="${esc(pr.id)}"><img loading="lazy" src="/data/_presets/${esc(pr.id)}.png" alt="" onerror="this.style.visibility='hidden'" /><b>${esc(pr.name)}</b><small>${esc(pr.tagline ?? '')}</small></button>`).join('')}
      <button type="button" class="card hover preset" data-preset="" style="justify-content:center;align-items:center;min-height:150px"><span class="mark" style="display:grid">${ICON.plus}</span><b>Blank video</b><small>No preset</small></button></div>
  </div>`;
  paintList();
  document.title = 'MotionStudio · V2 preview';
};

document.addEventListener('input', (ev) => { if (ev.target.id === 'vsearch') { F.q = ev.target.value; paintList(); } });
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-preset]');
  if (!b) return;
  b.disabled = true;
  try {
    const presetId = b.dataset.preset || undefined;
    const p = await api('/api/projects', {method: 'POST', body: {presetId}});
    toast('Video created. Opening the brief…');
    location.hash = `#/p/${encodeURIComponent(p.id)}/brief`;
  } catch (e) { toast(e.message); b.disabled = false; }
});
