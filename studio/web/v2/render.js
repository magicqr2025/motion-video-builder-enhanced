// Preview & render: the live Remotion preview, draft and final renders with progress, and every finished render.
import {$, S, api, esc, toast, fmtT, pill, ICON, classicUrl} from './core.js';

const proj = () => S.cur.project;
const job = () => (S.live.render && S.live.render.projectId === proj().id ? S.live.render : S.cur.renderJob && !S.cur.renderJob.done ? S.cur.renderJob : null);

const progressHtml = () => {
  const j = job();
  if (!j) return '';
  const pct = Math.round((j.progress ?? 0) * 100);
  return `<div class="stack" style="gap:8px;margin-top:16px"><div class="spread"><span class="row"><i class="live"></i><b>Rendering · ${esc(j.stage ?? '')}</b></span><b>${pct}%</b></div><div class="bar"><i style="width:${Math.max(3, pct)}%"><span class="sheen"></span></i></div>${j.frames ? `<div class="small muted">${j.frames} of ${j.total} frames</div>` : ''}</div>`;
};

const renderRow = (r) => `<div class="rrow">
  <div style="flex:0 0 auto;width:150px">${r.format === 'gif' || r.format === 'webp' ? `<img src="/data/${proj().id}/${esc(r.file)}" alt="" style="width:100%;border-radius:12px" />` : `<video src="/data/${proj().id}/${esc(r.file)}" controls preload="metadata" style="width:100%;border-radius:12px;background:#000"></video>`}</div>
  <div class="nm"><div class="row" style="gap:8px"><b>${r.draft ? 'Draft' : 'Final'}</b>${pill((r.format ?? 'mp4').toUpperCase())}</div><div class="small muted">${fmtT(r.durationSec)} · ${r.width}×${r.height} · ${esc(new Date(r.at).toLocaleString())}</div></div>
  <a class="btn sm" href="/data/${proj().id}/${esc(r.file)}" download>Download</a></div>`;

export const render = async (host, c) => {
  const p = c.project, locked = !p.approval, running = !!job();
  const url = `http://localhost:${S.state.studioPort}/${c.compositions.video}`;
  const fmt = (p.brief.outputFormat || 'mp4').toUpperCase();
  host.innerHTML = `
    ${locked ? `<div class="lock"><b>Rendering is locked until you approve the build.</b><div class="small" style="margin-top:3px">Check every scene on Build &amp; timing, send any corrections, then approve. You can still watch the live preview here.</div><a class="btn sm" style="margin-top:10px" href="#/p/${p.id}/build">Go to Build &amp; timing</a></div>` : ''}
    <div class="spread"><div><h2>Live preview</h2><div class="small muted">Remotion Studio · updates as the AI edits</div></div><a class="btn sm" href="${url}" target="_blank" rel="noopener">Open full screen ${ICON.ext}</a></div>
    <div class="preview d1"><iframe src="${url}" title="Remotion preview"></iframe></div>
    <div class="card d2"><div class="spread"><div><h2>Render</h2><div class="small muted">Draft is half resolution for a quick check. Final is full quality (${fmt}).</div></div>
      <div class="row"><button type="button" class="btn" data-act="render" data-draft="1" ${running || locked ? 'disabled' : ''}>Draft render</button>
        <button type="button" class="btn main" data-act="render" ${running || locked ? 'disabled' : ''}>Final render</button>
        ${running ? '<button type="button" class="btn danger" data-act="cancel-render">Cancel</button>' : ''}</div></div>
      <div id="r-prog">${progressHtml()}</div>
      <div class="small dim" style="margin-top:14px">Output format and the output folder are set in the classic app. <a href="${classicUrl(p.id, 'render')}" target="_blank" rel="noopener" style="text-decoration:underline">Open there</a>.</div></div>
    ${p.renders?.length ? `<div class="card d3"><h2 style="margin-bottom:6px">Renders</h2><div class="rlist">${[...p.renders].reverse().map(renderRow).join('')}</div></div>` : ''}`;
};
export const soft = () => { const el = $('#r-prog'); if (el) el.innerHTML = progressHtml(); };
export const live = () => soft();

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act="render"], [data-act="cancel-render"]');
  if (!b || !S.cur || !$('#r-prog')) return;
  try {
    if (b.dataset.act === 'render') { await api(`/api/projects/${proj().id}/render`, {method: 'POST', body: {draft: !!b.dataset.draft}}); toast('Render started.'); }
    else await api('/api/render/cancel', {method: 'POST'});
  } catch (e) { toast(e.message); }
});
