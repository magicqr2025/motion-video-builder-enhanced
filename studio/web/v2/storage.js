// Storage: where the studio keeps its files, how big each part is, and safe clean-ups.
import {$, api, esc, toast} from './core.js';

const SG = {data: null, busy: '', msg: ''};
const size = (b) => { b = Number(b) || 0; if (b < 1024) return `${b} B`; const u = ['KB', 'MB', 'GB', 'TB']; let i = -1; do { b /= 1024; i++; } while (b >= 1024 && i < u.length - 1); return `${b >= 100 || i === 0 ? b.toFixed(0) : b.toFixed(1)} ${u[i]}`; };
const pct = (a, b) => (b ? Math.max(0, Math.min(100, (a / b) * 100)) : 0);
const PARTS = [['uploads', 'Uploaded files', '#6A8DFF'], ['renders', 'Renders', '#5EF2A6'], ['samples', 'Concept samples', '#FFA94D'], ['checks', 'Check frames', '#FFD84D'], ['refs', 'Reference snapshots', '#B18CFF'], ['transcripts', 'Transcripts', '#2DD4BF'], ['code', 'Video code', '#94A3B8'], ['other', 'Other', '#64748B']];
const CLEAN = [['renders', 'Delete renders', 'This permanently deletes every finished render of this video (MP4, GIF, WebP). You can render again any time.'], ['samples', 'Clear samples', 'Deletes the concept preview images. You only need them while choosing a concept.'], ['checks', 'Clear check frames', 'Deletes the verification frames. They are made again when the video is rebuilt.']];

const html = () => {
  const d = SG.data;
  if (!d) return '<div class="card empty"><div class="orb"></div><h2>Measuring storage…</h2><p>This can take a few seconds the first time.</p></div>';
  const free = d.disk?.free, dtotal = d.disk?.total;
  const projects = d.projects.map((p) => `<div class="sgrow"><div class="spread" style="flex-wrap:nowrap"><a class="ltitle" href="#/p/${esc(p.id)}/">${esc(p.title)}</a><span class="small muted">${esc(p.status)}</span><b>${size(p.total)}</b></div>
    <div class="sgbar">${PARTS.filter(([k]) => p.parts[k] > 0).map(([k, l, c]) => `<i style="width:${pct(p.parts[k], p.total)}%;background:${c}" title="${l}: ${size(p.parts[k])}"></i>`).join('')}</div>
    <div class="sgleg">${PARTS.filter(([k]) => p.parts[k] > 1024 * 100).map(([k, l, c]) => `<span><i style="background:${c}"></i>${l} ${size(p.parts[k])}</span>`).join('')}</div>
    <div class="row" style="gap:8px">${CLEAN.filter(([k]) => p.parts[k] > 0).map(([k, label, warn]) => `<button type="button" class="btn sm ${k === 'renders' ? 'danger' : ''}" data-sg="project" data-id="${esc(p.id)}" data-what="${k}" data-warn="${esc(warn)}" data-title="${esc(p.title)}" ${SG.busy ? 'disabled' : ''}>${label} (${size(p.parts[k])})</button>`).join('')}</div></div>`).join('') || '<div class="muted">No videos yet.</div>';
  const tools = d.tools.map((t) => `<div class="spread" style="padding:8px 0;border-top:1px solid var(--line)"><span class="small">${esc(t.name)}</span><span class="row"><b class="small">${size(t.bytes)}</b><button type="button" class="btn sm ghost danger" data-sg="tool" data-id="${esc(t.id)}" data-name="${esc(t.name)}" ${SG.busy ? 'disabled' : ''}>Remove</button></span></div>`).join('') || '<div class="muted small">Nothing here.</div>';
  const system = d.system.map((s) => `<div class="card tight"><div class="spread"><b>${esc(s.label)}</b><b>${size(s.bytes)}</b></div><div class="small muted">${esc(s.desc)}</div><div class="small dim" style="word-break:break-all;margin:6px 0">${esc(s.path)}</div><div class="spread"><span class="small muted">${esc(s.note)}</span>${s.clean ? `<button type="button" class="btn sm" data-sg="${esc(s.id)}" data-warn="${esc(s.note)}" ${SG.busy || !s.bytes ? 'disabled' : ''}>${esc(s.clean)}</button>` : ''}</div></div>`).join('');
  return `<div class="stack"><div class="card"><div class="spread"><div><h1>Storage</h1><p class="muted small" style="margin:4px 0 0;max-width:640px">Everything the studio keeps on this PC. Videos and uploads are yours; caches and temporary files are safe to clear and rebuild themselves.</p></div><button type="button" class="btn" data-sg="refresh">↻ Refresh</button></div>
    <div class="lstats"><div><b class="big" style="font-size:34px">${size(d.total)}</b><span>used by the studio</span></div>${free != null ? `<div><b class="big" style="font-size:34px">${size(free)}</b><span>free on this drive</span></div><div><b class="big" style="font-size:34px">${size(dtotal)}</b><span>drive size</span></div>` : ''}<div><b class="big" style="font-size:34px">${d.projects.length}</b><span>videos</span></div></div>
    ${free != null ? `<div class="bar" style="margin-top:12px"><i style="width:${Math.max(2, pct(dtotal - free, dtotal))}%"></i></div><div class="small muted" style="margin-top:6px">${pct(dtotal - free, dtotal).toFixed(0)}% of the drive is full</div>` : ''}${SG.msg ? `<div class="note" style="margin-top:12px">${esc(SG.msg)}</div>` : ''}</div>
    <h2>Your videos</h2><div class="card stack">${projects}</div><h2>Video tools files</h2><div class="card">${tools}</div><h2>App, cache and temporary files</h2><div class="g2">${system}</div></div>`;
};
const paint = () => { const el = $('#view'); if (el && location.hash.startsWith('#/storage')) el.innerHTML = html(); };
export const render = async (host, refresh = false) => { host.innerHTML = html(); try { SG.data = await api(`/api/storage${refresh ? '?refresh=1' : ''}`); } catch (e) { toast(e.message); } paint(); };
export const leave = () => {};
export const onEvent = () => {};

const clean = async (body, ask) => {
  if (SG.busy) return;
  if (ask && !confirm(ask)) return;
  SG.busy = body.target; SG.msg = ''; paint();
  try { const r = await api('/api/storage/clean', {method: 'POST', body}); SG.msg = `${r.note} Freed ${size(r.freed)}.`; toast(SG.msg); } catch (e) { SG.msg = e.message; toast(e.message); }
  SG.busy = ''; SG.data = null; paint(); await render($('#view'), true);
};
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-sg]');
  if (!b || !location.hash.startsWith('#/storage')) return;
  const k = b.dataset.sg;
  if (k === 'refresh') { SG.data = null; return render($('#view'), true); }
  if (k === 'project') return clean({target: 'project', id: b.dataset.id, what: b.dataset.what}, `“${b.dataset.title}”: ${b.dataset.warn}\n\nContinue?`);
  if (k === 'tool') { if (!confirm(`Remove “${b.dataset.name}” and its script and MP3 from Video tools?`)) return; SG.busy = 'tool'; paint(); try { await api(`/api/tools/jobs/${encodeURIComponent(b.dataset.id)}`, {method: 'DELETE'}); } catch (e) { toast(e.message); } SG.busy = ''; SG.data = null; return render($('#view'), true); }
  if (['cache', 'temp', 'staging'].includes(k)) return clean({target: k}, k === 'cache' ? `${b.dataset.warn}\n\nClear the render cache?` : null);
});
