// Library page: one row per video. Play the latest render, keep a description to copy, tick posted / approved / sent,
// and move where the finished file is kept.
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

let C = null; // {api, toast}
const L = {rows: null, q: '', filter: 'all', open: new Set(), saving: {}, timers: {}, busy: '', loading: false};
export const initLibrary = (ctx) => { C = ctx; };

const PLATFORM_LABEL = {instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', x: 'X', tiktok: 'TikTok'};
const FILTERS = [['all', 'All'], ['rendered', 'Rendered'], ['notrendered', 'Not rendered'], ['posted', 'Posted'], ['notposted', 'Not posted'], ['final', 'Approved'], ['sent', 'Sent to client']];
const STATUS = {brief: 'Brief', concepting: 'Concepts…', concepts: 'Pick a concept', building: 'Building…', review: 'Ready to review', rendering: 'Rendering…', done: 'Rendered'};

const size = (b) => { b = Number(b) || 0; if (b < 1024) return `${b} B`; const u = ['KB', 'MB', 'GB']; let i = -1; do { b /= 1024; i++; } while (b >= 1024 && i < 2); return `${b >= 100 ? b.toFixed(0) : b.toFixed(1)} ${u[i]}`; };
const clock = (s) => { s = Math.round(Number(s) || 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const when = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '' : d.toLocaleString(undefined, {day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'}); };
const dirOf = (p) => String(p ?? '').replace(/[\\/][^\\/]*$/, '');
const fileOf = (p) => String(p ?? '').split(/[\\/]/).pop();

// the render to show first: the newest final render, else the newest draft
const best = (r) => r.renders.filter((x) => x.exists || x.exportedExists).find((x) => !x.draft) ?? r.renders.find((x) => x.exists || x.exportedExists) ?? null;

const matches = (r) => {
  const l = r.library, has = !!best(r);
  const q = L.q.trim().toLowerCase();
  if (q && !`${r.title} ${l.description} ${r.id}`.toLowerCase().includes(q)) return false;
  return {all: true, rendered: has, notrendered: !has, posted: l.posted, notposted: !l.posted, final: l.final, sent: l.sent}[L.filter] ?? true;
};

const renderRow = (r) => {
  const l = r.library, b = best(r), open = L.open.has(r.id), saved = L.saving[r.id];
  const where = b ? (b.exportedExists ? b.exported : null) : null;
  const thumb = r.thumb ? `<img src="${esc(r.thumb)}" alt="" loading="lazy" />` : '<span class="lb-noimg">No preview</span>';
  return `<article class="lb-row ${open ? 'open' : ''}" data-row="${esc(r.id)}">
    <button type="button" class="lb-thumb ${b ? '' : 'off'}" data-lb="play" data-id="${esc(r.id)}" ${b ? '' : 'disabled'} title="${b ? 'Play' : 'Not rendered yet'}">${thumb}${b ? '<span class="lb-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>' : ''}${b ? `<span class="lb-fmt">${esc(b.format.toUpperCase())}</span>` : ''}</button>
    <div class="lb-main">
      <div class="lb-top"><a class="lb-title" href="#/p/${esc(r.id)}/" title="Open this video">${esc(r.title)}</a><span class="pill ${r.status === 'done' ? 'green' : ''}">${esc(STATUS[r.status] ?? r.status)}</span>${saved ? `<span class="lb-saved">${saved === 'saving' ? 'Saving…' : 'Saved ✓'}</span>` : ''}</div>
      <div class="lb-meta small muted">Created ${esc(when(r.createdAt))}${b ? ` · ${clock(b.durationSec)} · ${b.width}×${b.height} · ${size(b.size)}${b.draft ? ' · draft' : ''}` : ' · not rendered yet'}</div>
      <div class="lb-desc"><textarea rows="2" data-lb-desc="${esc(r.id)}" placeholder="Description, caption, hashtags or any text you want to copy later…">${esc(l.description)}</textarea>
        <button type="button" class="btn sm" data-lb="copy" data-id="${esc(r.id)}" title="Copy the description">Copy</button></div>
    </div>
    <div class="lb-side">
      <label class="lb-chk"><input type="checkbox" data-lb-flag="posted" data-id="${esc(r.id)}" ${l.posted ? 'checked' : ''} /> <span>Posted on social media</span></label>
      <label class="lb-chk"><input type="checkbox" data-lb-flag="final" data-id="${esc(r.id)}" ${l.final ? 'checked' : ''} /> <span>Approved (final)</span></label>
      <label class="lb-chk"><input type="checkbox" data-lb-flag="sent" data-id="${esc(r.id)}" ${l.sent ? 'checked' : ''} /> <span>Sent to client</span></label>
      <button type="button" class="btn ghost sm lb-more" data-lb="toggle" data-id="${esc(r.id)}" aria-expanded="${open}">${open ? 'Hide details' : `Location & files${r.renders.length ? ` (${r.renders.length})` : ''}`} <i class="sec-chev" aria-hidden="true">▾</i></button>
    </div>
    ${open ? `<div class="lb-detail">
      ${l.posted ? `<div class="lb-posted"><b>Posted on</b><input type="date" data-lb-date="${esc(r.id)}" value="${esc(l.postedOn)}" /><span class="muted small">where:</span><div class="lb-plat">${Object.entries(PLATFORM_LABEL).map(([k, name]) => `<button type="button" class="mood ${l.platforms.includes(k) ? 'on' : ''}" data-lb="plat" data-id="${esc(r.id)}" data-p="${k}">${name}</button>`).join('')}</div></div>` : ''}
      <div class="lb-where"><b>Location</b><span class="lb-path" title="${esc(where ?? 'Kept inside MotionStudio')}">${esc(where ?? (b ? 'Kept inside MotionStudio (not copied to a folder yet)' : 'Nothing rendered yet'))}</span></div>
      ${r.renders.length ? `<ul class="lb-files">${r.renders.map((x) => `<li>
        <span class="pill">${esc(x.format.toUpperCase())}${x.draft ? ' draft' : ''}</span>
        <span class="lb-fn" title="${esc(x.exportedExists ? x.exported : x.file)}">${esc(fileOf(x.exportedExists ? x.exported : x.file))}</span>
        <span class="muted small">${esc(when(x.at))} · ${size(x.size)}</span>
        <span class="lb-acts">
          <button type="button" class="btn sm" data-lb="play" data-id="${esc(r.id)}" data-file="${esc(x.file)}" ${x.exists || x.exportedExists ? '' : 'disabled'}>▶ Play</button>
          <button type="button" class="btn sm" data-lb="move" data-id="${esc(r.id)}" data-file="${esc(x.file)}" data-dir="${esc(x.exportedExists ? dirOf(x.exported) : '')}" ${x.exists || x.exportedExists ? '' : 'disabled'} title="${x.exportedExists ? 'Move this file to another folder' : 'Put a copy in a folder you choose'}">${x.exportedExists ? 'Move to…' : 'Save to…'}</button>
          ${x.exportedExists ? `<button type="button" class="btn sm ghost" data-lb="reveal" data-path="${esc(x.exported)}">Show in folder</button><button type="button" class="btn sm ghost" data-lb="copypath" data-path="${esc(x.exported)}" title="Copy the file path">Copy path</button>` : ''}
          ${x.exists ? `<a class="btn sm ghost" href="${esc(x.url)}" download="${esc(fileOf(x.file))}">Download</a>` : ''}
        </span></li>`).join('')}</ul>` : ''}
    </div>` : ''}
  </article>`;
};

const statsHtml = (rows) => `<div><b>${rows.length}</b><span>videos</span></div><div><b>${rows.filter((r) => best(r)).length}</b><span>rendered</span></div><div><b>${rows.filter((r) => r.library.posted).length}</b><span>posted</span></div><div><b>${rows.filter((r) => r.library.final).length}</b><span>approved</span></div>`;

const view = () => {
  if (!L.rows) return '<div class="card waiting"><div class="spinner"></div><h2>Loading your videos…</h2></div>';
  const rows = L.rows, shown = rows.filter(matches);
  const rendered = rows.filter((r) => best(r)).length, posted = rows.filter((r) => r.library.posted).length;
  return `
    <div class="card lb-head">
      <div class="spread"><div><h2>Library</h2><p class="muted small" style="margin:4px 0 0">All your videos in one list. Play them, keep a caption to copy, tick what has been posted, and choose where each finished file is kept.</p></div>
        <button type="button" class="btn" data-lb="refresh" ${L.loading ? 'disabled' : ''}>${L.loading ? 'Loading…' : '↻ Refresh'}</button></div>
      <div class="lb-stats">${statsHtml(rows)}</div>
      <div class="lb-tools"><input type="search" id="lb-q" placeholder="Search by title or description…" value="${esc(L.q)}" autocomplete="off" />
        <div class="opts" role="radiogroup">${FILTERS.map(([k, l]) => `<button type="button" role="radio" aria-checked="${L.filter === k}" class="opt ${L.filter === k ? 'on' : ''}" data-lb="filter" data-f="${k}"><b>${l}</b></button>`).join('')}</div></div>
    </div>
    <div class="lb-list" id="lb-list">${shown.length ? shown.map(renderRow).join('') : `<div class="card muted" style="text-align:center;padding:30px">${rows.length ? 'No videos match this filter.' : 'No videos yet. Create one with “New video”.'}</div>`}</div>
    <div class="lb-player" id="lb-player" hidden><div class="lb-pbox"><button type="button" class="lb-x" data-lb="close" aria-label="Close">✕</button><div id="lb-pbody"></div><div class="lb-pcap" id="lb-pcap"></div></div></div>`;
};

const paint = () => { const el = $('#main'); if (el && location.hash.startsWith('#/library')) { const q = $('#lb-q'), had = document.activeElement === q, pos = q?.selectionStart; el.innerHTML = view(); if (had) { const n = $('#lb-q'); n.focus(); n.setSelectionRange(pos, pos); } } };
const repaintList = () => { const list = $('#lb-list'); if (!list) return paint(); list.innerHTML = L.rows.filter(matches).map(renderRow).join('') || '<div class="card muted" style="text-align:center;padding:30px">No videos match this filter.</div>'; };

export const renderLibrary = async (keepOpen = true) => {
  L.loading = true; if (!L.rows) paint();
  try { L.rows = (await C.api('/api/library')).rows; } catch (e) { C.toast(e.message); }
  L.loading = false;
  if (!keepOpen) L.open.clear();
  paint();
};
export const libraryChanged = () => { clearTimeout(L.refreshTimer); L.refreshTimer = setTimeout(() => { if (!document.activeElement?.closest?.('.lb-row')) renderLibrary(); }, 600); };

// ---------- saving ----------
const rowOf = (id) => L.rows.find((r) => r.id === id);
const mark = (id, state) => { L.saving[id] = state; const el = $(`[data-row="${CSS.escape(id)}"] .lb-top`); if (!el) return; let s = el.querySelector('.lb-saved'); if (!s) { s = document.createElement('span'); s.className = 'lb-saved'; el.append(s); } s.textContent = state === 'saving' ? 'Saving…' : 'Saved ✓'; };
const save = (id, patch, now = false) => {
  const r = rowOf(id); Object.assign(r.library, patch);
  const st = $('.lb-stats'); if (st) st.innerHTML = statsHtml(L.rows);
  mark(id, 'saving');
  clearTimeout(L.timers[id]);
  L.timers[id] = setTimeout(async () => {
    try { const j = await C.api(`/api/projects/${encodeURIComponent(id)}/library`, {method: 'PATCH', body: patch}); Object.assign(r.library, j.library); mark(id, 'saved'); setTimeout(() => { if (L.saving[id] === 'saved') { delete L.saving[id]; $(`[data-row="${CSS.escape(id)}"] .lb-saved`)?.remove(); } }, 1800); }
    catch (e) { C.toast(e.message); }
  }, now ? 0 : 500);
};

const player = (r, file) => {
  const x = file ? r.renders.find((v) => v.file === file) : best(r);
  if (!x) return;
  const src = x.url; // played from the studio's own copy
  const media = x.format === 'gif' || x.format === 'webp' ? `<img src="${esc(src)}" alt="" />` : `<video src="${esc(src)}" controls autoplay></video>`;
  $('#lb-pbody').innerHTML = media;
  $('#lb-pcap').textContent = `${r.title} · ${x.format.toUpperCase()}${x.draft ? ' draft' : ''} · ${clock(x.durationSec)} · ${x.width}×${x.height}`;
  $('#lb-player').hidden = false;
};
const closePlayer = () => { const p = $('#lb-player'); if (!p) return; $('#lb-pbody').innerHTML = ''; p.hidden = true; };

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePlayer(); });
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'lb-q') { L.q = t.value; repaintList(); return; }
  if (t.dataset?.lbDesc) save(t.dataset.lbDesc, {description: t.value});
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset?.lbFlag) { const id = t.dataset.id, flag = t.dataset.lbFlag; save(id, {[flag]: t.checked}, true); if (flag === 'posted') { if (t.checked) L.open.add(id); setTimeout(repaintList, 120); } }
  else if (t.dataset?.lbDate) save(t.dataset.lbDate, {postedOn: t.value}, true);
});

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-lb]');
  if (!b || !C) { if (e.target.id === 'lb-player') closePlayer(); return; }
  const id = b.dataset.id, r = id ? rowOf(id) : null;
  switch (b.dataset.lb) {
    case 'refresh': return renderLibrary();
    case 'filter': L.filter = b.dataset.f; return paint();
    case 'toggle': L.open.has(id) ? L.open.delete(id) : L.open.add(id); return repaintList();
    case 'play': return player(r, b.dataset.file);
    case 'close': return closePlayer();
    case 'copy': { const text = r.library.description; if (!text.trim()) return C.toast('There is no description to copy yet.'); try { await navigator.clipboard.writeText(text); C.toast('Description copied.'); } catch { const ta = $(`[data-lb-desc="${CSS.escape(id)}"]`); ta?.select(); document.execCommand('copy'); C.toast('Description copied.'); } return; }
    case 'copypath': try { await navigator.clipboard.writeText(b.dataset.path); C.toast('Path copied.'); } catch { C.toast(b.dataset.path); } return;
    case 'reveal': try { await C.api('/api/settings/open-folder', {method: 'POST', body: {path: b.dataset.path}}); } catch (x) { C.toast(x.message); } return;
    case 'plat': { const p = b.dataset.p, list = new Set(r.library.platforms); list.has(p) ? list.delete(p) : list.add(p); save(id, {platforms: [...list]}, true); b.classList.toggle('on'); return; }
    case 'move': {
      C.toast('Choose a folder in the window that opened…');
      let dir = '';
      try { const j = await C.api('/api/settings/pick-folder', {method: 'POST', body: {start: b.dataset.dir || undefined, description: `Where should “${r.title}” be kept?`}}); dir = j.outDir || ''; }
      catch { dir = (prompt('Type the full folder path (for example D:\\Videos\\Posted):', b.dataset.dir || '') || '').trim(); }
      if (!dir) return;
      try { const j = await C.api(`/api/projects/${encodeURIComponent(id)}/library/move`, {method: 'POST', body: {file: b.dataset.file, dir}}); C.toast(j.moved ? 'Moved.' : 'Saved to that folder.'); L.open.add(id); await renderLibrary(); }
      catch (x) { C.toast(x.message); }
    }
  }
});
