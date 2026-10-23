// Storage page: where the studio keeps its files, how big each part is, and safe clean-ups.
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

let C = null; // {api, toast}
const SG = {data: null, loading: false, busy: '', msg: ''};
export const initStorage = (ctx) => { C = ctx; };

const size = (b) => {
  b = Number(b) || 0;
  if (b < 1024) return `${b} B`;
  const u = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  do { b /= 1024; i++; } while (b >= 1024 && i < u.length - 1);
  return `${b >= 100 || i === 0 ? b.toFixed(0) : b.toFixed(1)} ${u[i]}`;
};
const pct = (a, b) => (b ? Math.max(0, Math.min(100, (a / b) * 100)) : 0);

const PARTS = [
  ['uploads', 'Uploaded files', '#3975ed', 'Footage, images, voiceover and music you added'],
  ['renders', 'Renders', '#16A34A', 'Finished MP4, GIF and WebP files'],
  ['samples', 'Concept samples', '#F7941D', 'Preview images made for concepts'],
  ['checks', 'Check frames', '#FDC60B', 'Frames Claude rendered to verify the build'],
  ['refs', 'Reference snapshots', '#8b5cf6', 'Frames pulled from sample videos'],
  ['transcripts', 'Transcripts', '#14b8a6', 'Speech-to-text of voiceovers'],
  ['code', 'Video code', '#64748b', 'The Remotion code of the video'],
  ['other', 'Other', '#cbd5e1', 'Project data and chat history'],
];
const CLEAN_WHAT = [
  ['renders', 'Delete renders', 'This permanently deletes every finished render of this video (MP4, GIF, WebP). You can render again any time.'],
  ['samples', 'Clear samples', 'Deletes the concept preview images. You only need them while choosing a concept.'],
  ['checks', 'Clear check frames', 'Deletes the verification frames. They are made again when the video is rebuilt.'],
];

const view = () => {
  const d = SG.data;
  if (!d) return `<div class="card waiting"><div class="spinner"></div><h2>Measuring storage…</h2><p>This can take a few seconds the first time.</p></div>`;
  const used = d.total, free = d.disk?.free, dtotal = d.disk?.total;
  const projects = d.projects.map((p) => {
    const bar = PARTS.filter(([k]) => p.parts[k] > 0).map(([k, l, c]) => `<i style="width:${pct(p.parts[k], p.total)}%;background:${c}" title="${l}: ${size(p.parts[k])}"></i>`).join('');
    const cleans = CLEAN_WHAT.filter(([k]) => p.parts[k] > 0);
    return `<div class="sg-row">
      <div class="sg-head"><a href="#/p/${esc(p.id)}/" class="sg-name">${esc(p.title)}</a><span class="muted small">${esc(p.status)}</span><b class="sg-size">${size(p.total)}</b></div>
      <div class="sg-bar">${bar}</div>
      <div class="sg-legend">${PARTS.filter(([k]) => p.parts[k] > 1024 * 100).map(([k, l, c]) => `<span><i style="background:${c}"></i>${l} ${size(p.parts[k])}</span>`).join('')}</div>
      ${cleans.length ? `<div class="sg-actions">${cleans.map(([k, label, warn]) => `<button type="button" class="btn sm ${k === 'renders' ? 'danger' : ''}" data-sg="project" data-id="${esc(p.id)}" data-what="${k}" data-warn="${esc(warn)}" data-title="${esc(p.title)}" ${SG.busy ? 'disabled' : ''}>${label} · ${size(p.parts[k])}</button>`).join('')}</div>` : ''}
    </div>`;
  }).join('') || '<div class="muted">No videos yet.</div>';
  const tools = d.tools.map((t) => `<div class="sg-line"><span class="sg-nm" title="${esc(t.name)}">${esc(t.name)}</span><b>${size(t.bytes)}</b><button type="button" class="btn sm ghost danger" data-sg="tool" data-id="${esc(t.id)}" data-name="${esc(t.name)}" ${SG.busy ? 'disabled' : ''}>Remove</button></div>`).join('') || '<div class="muted small">Nothing here. Videos you drop into Video tools are kept here.</div>';
  const system = d.system.map((s) => `<div class="sg-sys">
      <div class="sg-sys-top"><b>${esc(s.label)}</b><span class="sg-size">${size(s.bytes)}</span></div>
      <div class="small muted">${esc(s.desc)}</div>
      <div class="sg-path" title="${esc(s.path)}">${esc(s.path)}</div>
      <div class="sg-sys-foot"><span class="small muted">${esc(s.note)}</span>${s.clean ? `<button type="button" class="btn sm" data-sg="${esc(s.id)}" data-warn="${esc(s.note)}" ${SG.busy || !s.bytes ? 'disabled' : ''}>${esc(s.clean)}</button>` : ''}</div>
    </div>`).join('');
  return `
    <div class="card sg-top">
      <div class="spread"><div><h2>Storage</h2><p class="muted small" style="margin:4px 0 0;max-width:640px">Everything the studio keeps on this PC. Videos and uploads are yours; caches and temporary files are safe to clear and rebuild themselves.</p></div>
        <button type="button" class="btn" data-sg="refresh" ${SG.loading ? 'disabled' : ''}>${SG.loading ? 'Measuring…' : '↻ Refresh'}</button></div>
      <div class="sg-totals">
        <div><span class="muted small">Used by the studio</span><b>${size(used)}</b></div>
        ${free != null ? `<div><span class="muted small">Free on this drive</span><b>${size(free)}</b></div><div><span class="muted small">Drive size</span><b>${size(dtotal)}</b></div>` : ''}
        <div><span class="muted small">Videos</span><b>${d.projects.length}</b></div>
      </div>
      ${free != null ? `<div class="bar"><i style="width:${Math.max(2, pct(dtotal - free, dtotal))}%"></i></div><div class="small muted">${pct(dtotal - free, dtotal).toFixed(0)}% of the drive is full</div>` : ''}
      ${SG.msg ? `<div class="st-note" style="margin-top:4px">${esc(SG.msg)}</div>` : ''}
    </div>
    <section class="sg-sec"><h3>Your videos</h3><div class="card sg-list">${projects}</div></section>
    <section class="sg-sec"><h3>Video tools files</h3><div class="card sg-list">${tools}</div></section>
    <section class="sg-sec"><h3>App, cache and temporary files</h3><div class="sg-grid">${system}</div></section>`;
};

const paint = () => { const el = $('#main'); if (el && location.hash.startsWith('#/storage')) el.innerHTML = view(); };

export const renderStorage = async (refresh = false) => {
  SG.loading = true; paint();
  try { SG.data = await C.api(`/api/storage${refresh ? '?refresh=1' : ''}`); }
  catch (e) { C.toast(e.message); }
  SG.loading = false; paint();
};

const clean = async (body, ask) => {
  if (SG.busy) return;
  if (ask && !confirm(ask)) return;
  SG.busy = body.target; SG.msg = ''; paint();
  try {
    const r = await C.api('/api/storage/clean', {method: 'POST', body});
    SG.msg = `${r.note} Freed ${size(r.freed)}.`;
    C.toast(SG.msg);
  } catch (e) { SG.msg = e.message; C.toast(e.message); }
  SG.busy = '';
  await renderStorage(true);
};

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-sg]');
  if (!b || !C) return;
  const k = b.dataset.sg;
  if (k === 'refresh') return renderStorage(true);
  if (k === 'project') return clean({target: 'project', id: b.dataset.id, what: b.dataset.what}, `“${b.dataset.title}”: ${b.dataset.warn}\n\nContinue?`);
  if (k === 'tool') {
    if (!confirm(`Remove “${b.dataset.name}” and its script and MP3 from Video tools?`)) return;
    SG.busy = 'tool'; paint();
    try { await C.api(`/api/tools/jobs/${encodeURIComponent(b.dataset.id)}`, {method: 'DELETE'}); } catch (e) { C.toast(e.message); }
    SG.busy = ''; return renderStorage(true);
  }
  if (['cache', 'temp', 'staging'].includes(k)) return clean({target: k}, k === 'cache' ? `${b.dataset.warn}\n\nClear the render cache?` : null);
});
