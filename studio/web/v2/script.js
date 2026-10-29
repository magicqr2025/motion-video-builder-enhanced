// Reference snapshots: upload a sample video to capture one frame per second for visual reference (made locally, no AI).
import {$, S, api, esc, toast, pill} from './core.js';

const fileUrl = (p, a, f) => `/data/${encodeURIComponent(p.id)}/${a.refDir.split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(f)}`;
const html = (c) => {
  const p = c.project, refs = p.assets.filter((a) => a.kind === 'video'), picked = new Set(p.brief.plannerRefs ?? []);
  return `<div class="card d1"><div class="spread"><div><h2>Reference snapshots</h2><p class="muted" style="margin:4px 0 0;max-width:620px">Upload a sample video to capture one frame per second for visual reference. Snapshots are created locally and duplicate frames are removed. No AI model is called.</p></div><button type="button" class="btn main" data-act="r-upload">Upload video</button><input type="file" id="r-file" accept="video/*" hidden /></div></div>
    ${refs.length ? refs.map((a) => { const frames = c.referenceFrames?.[a.file] ?? [];
      return `<div class="card d2"><div class="spread"><div><b>${esc(a.original)}</b><div class="small muted">${a.refDir ? `${frames.length} unique snapshots, one per second` : esc(a.job || 'Preparing snapshots…')}</div></div><div class="row">${a.jobError ? pill('Snapshot error', 'red') : ''}${a.job && !a.refDir ? pill(a.job, 'violet', true) : ''}<label class="chk"><input type="checkbox" data-r-pick="${esc(a.file)}" ${picked.has(a.file) ? 'checked' : ''} /> Use as reference</label></div></div>
        ${frames.length ? `<details open style="margin-top:12px"><summary class="small muted" style="cursor:pointer">Review or remove snapshots</summary><div class="rframes">${frames.map((f) => { const t = f.match(/f-(\d+\.\d+)s/)?.[1] ?? '';
          return `<div class="rframe"><img loading="lazy" src="${fileUrl(p, a, f)}" alt="Sample frame at ${esc(t)} seconds" data-zoom="${fileUrl(p, a, f)}" data-cap="${esc(a.original)} · ${esc(t)} s" /><div class="spread" style="flex-wrap:nowrap"><small>${esc(t)} s</small><button type="button" class="btn ghost icon sm" data-act="r-del" data-video="${esc(a.file)}" data-frame="${esc(f)}" aria-label="Delete the ${esc(t)} second snapshot">✕</button></div></div>`; }).join('')}</div></details>` : ''}</div>`; }).join('')
      : '<div class="card empty"><p>No sample videos yet. Upload a video to create reference snapshots.</p></div>'}
    <div class="barfix"><div class="tx"><b>Snapshot capture runs locally</b><div class="small muted">It does not call an AI model.</div></div><a class="btn main" href="#/p/${p.id}/brief">Continue to brief</a></div>`;
};
export const render = async (host, c) => { host.innerHTML = html(c); };
export const soft = () => {};
export const live = () => {};

document.addEventListener('change', async (ev) => {
  const t = ev.target;
  if (!S.cur || !$('.rframes, #r-file')) return;
  try {
    if (t.id === 'r-file' && t.files?.length) {
      const id = S.cur.project.id, fd = new FormData(); fd.append('role', 'reference'); fd.append('files', t.files[0]);
      toast(`Uploading ${t.files[0].name}…`, 60000);
      const assets = await api(`/api/projects/${id}/assets`, {method: 'POST', body: fd});
      const refs = [...new Set([...(S.cur.project.brief.plannerRefs || []), assets.at(-1)?.file].filter(Boolean))];
      await api(`/api/projects/${id}`, {method: 'PATCH', body: {brief: {plannerRefs: refs}}});
      S.cur = await api(`/api/projects/${id}?nolog=1`); $('#tab').innerHTML = html(S.cur); toast('Sample video added. Preparing snapshots…');
    } else if (t.dataset.rPick) {
      const refs = new Set(S.cur.project.brief.plannerRefs || []); t.checked ? refs.add(t.dataset.rPick) : refs.delete(t.dataset.rPick);
      S.cur.project.brief.plannerRefs = [...refs]; await api(`/api/projects/${S.cur.project.id}`, {method: 'PATCH', body: {brief: {plannerRefs: [...refs]}}});
    }
  } catch (e) { toast(e.message); }
});
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act="r-upload"], [data-act="r-del"]');
  if (!b || !S.cur) return;
  try {
    if (b.dataset.act === 'r-upload') { $('#r-file').click(); return; }
    const id = S.cur.project.id, res = await api(`/api/projects/${id}/reference-frames/${encodeURIComponent(b.dataset.video)}/${encodeURIComponent(b.dataset.frame)}`, {method: 'DELETE'});
    S.cur.referenceFrames[b.dataset.video] = res.frames; $('#tab').innerHTML = html(S.cur); toast('Snapshot deleted.');
  } catch (e) { toast(e.message); }
});
