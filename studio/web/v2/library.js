// Library: one row per video. Play the latest render, keep a description to copy, tick posted / approved / sent, and move the finished file.
import {$, api, esc, toast, pill, gradFor} from './core.js';
import * as vl from './voicelib.js';

const L = {rows: null, q: '', filter: 'all', open: new Set(), saving: {}, timers: {}};
const PLATFORMS = {instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', x: 'X', tiktok: 'TikTok'};
const FILTERS = [['all', 'All'], ['rendered', 'Rendered'], ['notrendered', 'Not rendered'], ['posted', 'Posted'], ['notposted', 'Not posted'], ['final', 'Approved'], ['sent', 'Sent to client']];
const STATUS = {brief: 'Brief', concepting: 'Concepts…', concepts: 'Pick a concept', building: 'Building…', review: 'Ready to review', rendering: 'Rendering…', done: 'Rendered'};
const size = (b) => { b = Number(b) || 0; if (b < 1024) return `${b} B`; const u = ['KB', 'MB', 'GB']; let i = -1; do { b /= 1024; i++; } while (b >= 1024 && i < 2); return `${b >= 100 ? b.toFixed(0) : b.toFixed(1)} ${u[i]}`; };
const clock = (s) => { s = Math.round(Number(s) || 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const when = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '' : d.toLocaleString(undefined, {day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'}); };
const fileOf = (p) => String(p ?? '').split(/[\\/]/).pop();
const dirOf = (p) => String(p ?? '').replace(/[\\/][^\\/]*$/, '');
const best = (r) => r.renders.filter((x) => x.exists || x.exportedExists).find((x) => !x.draft) ?? r.renders.find((x) => x.exists || x.exportedExists) ?? null;
const matches = (r) => { const l = r.library, has = !!best(r), q = L.q.trim().toLowerCase(); if (q && !`${r.title} ${l.description} ${r.id}`.toLowerCase().includes(q)) return false; return {all: true, rendered: has, notrendered: !has, posted: l.posted, notposted: !l.posted, final: l.final, sent: l.sent}[L.filter] ?? true; };
const rowOf = (id) => L.rows.find((r) => r.id === id);

const row = (r) => {
  const l = r.library, b = best(r), open = L.open.has(r.id), sv = L.saving[r.id];
  return `<article class="card lrow" data-row="${esc(r.id)}"><button type="button" class="lthumb" style="background:${gradFor(r.id)}" data-lb="play" data-id="${esc(r.id)}" ${b ? '' : 'disabled'} aria-label="${b ? 'Play' : 'Not rendered yet'}">${r.thumb ? `<img src="${esc(r.thumb)}" alt="" loading="lazy" />` : ''}${b ? '<span class="pl">▶</span>' : '<span class="np">Not rendered</span>'}</button>
    <div class="lmain"><div class="row" style="gap:10px"><a class="ltitle" href="#/p/${esc(r.id)}/">${esc(r.title)}</a>${pill(STATUS[r.status] ?? r.status, r.status === 'done' ? 'mint' : 'dim')}<span class="small muted" data-saved>${sv === 'saving' ? 'Saving…' : sv === 'saved' ? 'Saved ✓' : ''}</span></div>
      <div class="small muted">Created ${esc(when(r.createdAt))}${b ? ` · ${clock(b.durationSec)} · ${b.width}×${b.height} · ${size(b.size)}${b.draft ? ' · draft' : ''}` : ' · not rendered yet'}</div>
      <div class="row" style="align-items:flex-start;flex-wrap:nowrap"><textarea class="in" rows="2" data-lb-desc="${esc(r.id)}" placeholder="Description, caption, hashtags or any text you want to copy later…">${esc(l.description)}</textarea><button type="button" class="btn sm" data-lb="copy" data-id="${esc(r.id)}">Copy</button></div></div>
    <div class="lside"><label class="chk"><input type="checkbox" data-lb-flag="posted" data-id="${esc(r.id)}" ${l.posted ? 'checked' : ''} /> Posted on social media</label><label class="chk"><input type="checkbox" data-lb-flag="final" data-id="${esc(r.id)}" ${l.final ? 'checked' : ''} /> Approved (final)</label><label class="chk"><input type="checkbox" data-lb-flag="sent" data-id="${esc(r.id)}" ${l.sent ? 'checked' : ''} /> Sent to client</label>
      <button type="button" class="btn ghost sm" data-lb="toggle" data-id="${esc(r.id)}" aria-expanded="${open}">${open ? 'Hide details' : `Location &amp; files${r.renders.length ? ` (${r.renders.length})` : ''}`}</button></div>
    ${open ? `<div class="ldetail">${l.posted ? `<div class="row"><b class="small">Posted on</b><input class="in" type="date" data-lb-date="${esc(r.id)}" value="${esc(l.postedOn)}" style="width:auto;height:34px" /><span class="small muted">where:</span>${Object.entries(PLATFORMS).map(([k, n]) => `<button type="button" class="opt slim ${l.platforms.includes(k) ? 'on' : ''}" data-lb="plat" data-id="${esc(r.id)}" data-p="${k}">${n}</button>`).join('')}</div>` : ''}
      <div class="small"><b>Location</b> <span class="muted">${esc((b && b.exportedExists ? b.exported : null) ?? (b ? 'Kept inside MotionStudio (not copied to a folder yet)' : 'Nothing rendered yet'))}</span></div>
      ${r.renders.map((x) => `<div class="rrow"><div class="nm"><div class="row" style="gap:8px">${pill(x.format.toUpperCase() + (x.draft ? ' draft' : ''))}<b class="small">${esc(fileOf(x.exportedExists ? x.exported : x.file))}</b></div><div class="small muted">${esc(when(x.at))} · ${size(x.size)}</div></div>
        <button type="button" class="btn sm" data-lb="play" data-id="${esc(r.id)}" data-file="${esc(x.file)}" ${x.exists || x.exportedExists ? '' : 'disabled'}>▶ Play</button><button type="button" class="btn sm" data-lb="move" data-id="${esc(r.id)}" data-file="${esc(x.file)}" data-dir="${esc(x.exportedExists ? dirOf(x.exported) : '')}" ${x.exists || x.exportedExists ? '' : 'disabled'}>${x.exportedExists ? 'Move file' : 'Save to folder'}</button>
        ${x.exportedExists ? `<button type="button" class="btn sm ghost" data-lb="reveal" data-path="${esc(x.exported)}">Show in folder</button><button type="button" class="btn sm ghost" data-lb="copypath" data-path="${esc(x.exported)}">Copy path</button>` : ''}${x.exists ? `<a class="btn sm ghost" href="${esc(x.url)}" download="${esc(fileOf(x.file))}">Download</a>` : ''}</div>`).join('')}</div>` : ''}</article>`;
};
const stats = (rows) => [['videos', rows.length], ['rendered', rows.filter((r) => best(r)).length], ['posted', rows.filter((r) => r.library.posted).length], ['approved', rows.filter((r) => r.library.final).length], ['sent', rows.filter((r) => r.library.sent).length]].map(([k, v]) => `<div><b class="big" style="font-size:34px">${v}</b><span>${k}</span></div>`).join('');
const list = () => { const s = L.rows.filter(matches); return s.length ? s.map(row).join('') : `<div class="card empty"><p>${L.rows.length ? 'No videos match this filter.' : 'No videos yet.'}</p></div>`; };

export const render = async (host) => {
  if (location.hash.startsWith('#/library/audio')) return vl.render(host); // the Scripts & voiceovers tab
  if (!L.rows) host.innerHTML = '<div class="stack"><div class="skel" style="height:140px"></div><div class="skel" style="height:200px"></div></div>';
  try { L.rows = (await api('/api/library')).rows; } catch (e) { toast(e.message); L.rows = L.rows ?? []; }
  host.innerHTML = `<div class="stack"><div class="card"><div class="spread"><div><h1>Library</h1><p class="muted small" style="margin:4px 0 0;max-width:640px">All your videos in one list. Play them, keep a caption to copy, tick what has been posted, and choose where each finished file is kept.</p></div><button type="button" class="btn" data-lb="refresh">${'↻ Refresh'}</button></div>
      <div style="margin-top:14px">${vl.tabs('videos')}</div>
      <div class="lstats" id="l-stats">${stats(L.rows)}</div>
      <div class="row" style="margin-top:14px"><input class="in" type="search" id="l-q" placeholder="Search by title or description…" value="${esc(L.q)}" style="max-width:340px;border-radius:99px" /><div class="opts">${FILTERS.map(([k, l]) => `<button type="button" class="opt slim ${L.filter === k ? 'on' : ''}" data-lb="filter" data-f="${k}">${l}</button>`).join('')}</div></div></div>
    <div class="stack" id="l-list">${list()}</div></div>
    <div class="zoom" id="l-player" hidden><button type="button" class="btn ghost" data-lb="close" aria-label="Close">✕</button><div id="l-pbody"></div><p id="l-pcap"></p></div>`;
};
export const leave = () => {};
export const onEvent = (e) => { if (e.type === 'projects' || e.type === 'render') { clearTimeout(L.rt); L.rt = setTimeout(() => { if ($('#l-list') && !document.activeElement?.closest?.('.lrow')) render($('#view')); }, 600); } };

const repaint = () => { const el = $('#l-list'); if (el) el.innerHTML = list(); const s = $('#l-stats'); if (s) s.innerHTML = stats(L.rows); };
const save = (id, patch, now = false) => {
  const r = rowOf(id); Object.assign(r.library, patch); const s = $('#l-stats'); if (s) s.innerHTML = stats(L.rows);
  L.saving[id] = 'saving'; const tag = () => document.querySelector(`[data-row="${CSS.escape(id)}"] [data-saved]`); if (tag()) tag().textContent = 'Saving…';
  clearTimeout(L.timers[id]);
  L.timers[id] = setTimeout(async () => {
    try { const j = await api(`/api/projects/${encodeURIComponent(id)}/library`, {method: 'PATCH', body: patch}); Object.assign(r.library, j.library); L.saving[id] = 'saved'; if (tag()) tag().textContent = 'Saved ✓'; setTimeout(() => { delete L.saving[id]; if (tag()) tag().textContent = ''; }, 1500); } catch (e) { toast(e.message); }
  }, now ? 0 : 500);
};
const player = (r, file) => {
  const x = file ? r.renders.find((v) => v.file === file) : best(r); if (!x) return;
  $('#l-pbody').innerHTML = x.format === 'gif' || x.format === 'webp' ? `<img src="${esc(x.url)}" alt="" />` : `<video src="${esc(x.url)}" controls autoplay style="max-width:92vw;max-height:78vh;border-radius:16px"></video>`;
  $('#l-pcap').textContent = `${r.title} · ${x.format.toUpperCase()}${x.draft ? ' draft' : ''} · ${clock(x.durationSec)} · ${x.width}×${x.height}`; $('#l-player').hidden = false;
};
const close = () => { const p = $('#l-player'); if (p) { $('#l-pbody').innerHTML = ''; p.hidden = true; } };

document.addEventListener('input', (e) => { const t = e.target; if (!$('#l-list')) return; if (t.id === 'l-q') { L.q = t.value; repaint(); } else if (t.dataset?.lbDesc) save(t.dataset.lbDesc, {description: t.value}); });
document.addEventListener('change', (e) => { const t = e.target; if (!$('#l-list')) return; if (t.dataset?.lbFlag) { save(t.dataset.id, {[t.dataset.lbFlag]: t.checked}, true); if (t.dataset.lbFlag === 'posted') { if (t.checked) L.open.add(t.dataset.id); setTimeout(repaint, 120); } } else if (t.dataset?.lbDate) save(t.dataset.lbDate, {postedOn: t.value}, true); });
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-lb]');
  if (!$('#l-list')) return;
  if (!b) { if (e.target.id === 'l-player') close(); return; }
  const id = b.dataset.id, r = id ? rowOf(id) : null;
  switch (b.dataset.lb) {
    case 'refresh': return render($('#view'));
    case 'filter': L.filter = b.dataset.f; return render($('#view'));
    case 'toggle': L.open.has(id) ? L.open.delete(id) : L.open.add(id); return repaint();
    case 'play': return player(r, b.dataset.file);
    case 'close': return close();
    case 'copy': if (!r.library.description.trim()) return toast('There is no description to copy yet.'); try { await navigator.clipboard.writeText(r.library.description); toast('Description copied.'); } catch { toast('Could not copy. Select the text and press Ctrl+C.'); } return;
    case 'copypath': try { await navigator.clipboard.writeText(b.dataset.path); toast('Path copied.'); } catch { toast(b.dataset.path); } return;
    case 'reveal': try { await api('/api/settings/open-folder', {method: 'POST', body: {path: b.dataset.path}}); } catch (x) { toast(x.message); } return;
    case 'plat': { const p = b.dataset.p, set = new Set(r.library.platforms); set.has(p) ? set.delete(p) : set.add(p); save(id, {platforms: [...set]}, true); b.classList.toggle('on'); return; }
    case 'move': {
      toast('Choose a folder in the window that opened…');
      let dir = '';
      try { dir = (await api('/api/settings/pick-folder', {method: 'POST', body: {start: b.dataset.dir || undefined, description: `Where should “${r.title}” be kept?`}})).outDir || ''; } catch { dir = (prompt('Type the full folder path:', b.dataset.dir || '') || '').trim(); }
      if (!dir) return;
      try { const j = await api(`/api/projects/${encodeURIComponent(id)}/library/move`, {method: 'POST', body: {file: b.dataset.file, dir}}); toast(j.moved ? 'Moved.' : 'Saved to that folder.'); L.open.add(id); await render($('#view')); } catch (x) { toast(x.message); }
    }
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
