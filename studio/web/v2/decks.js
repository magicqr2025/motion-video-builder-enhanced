// Decks (Visual PPT): browser slide decks. A list on the left; for the open deck its details, a chat to ask Claude for changes,
// prices and contact lines, and its files to download, upload or replace. Same /api/decks routes as the classic page.
import {$, api, esc, toast, pill} from './core.js';

const D = {list: null, id: null, cur: null, loading: false, adding: false, addMode: 'dir', fq: '', fshow: 60, dirty: false, busy: '', msg: {}, err: '', chat: {busy: false, log: [], startedAt: null}, poll: null};
const PRICE = {programRegular: 'Program · regular price', programOffer: 'Program · offer price', bundleRegular: 'Bundle · regular price', bundleOffer: 'Bundle · offer price', avgClientFee: 'Average client fee'};
const CONTACT = {web: 'Website', email: 'Email', phones: 'Phone numbers'};
const size = (b) => { b = Number(b) || 0; if (b < 1024) return `${b} B`; const u = ['KB', 'MB', 'GB']; let i = -1; do { b /= 1024; i++; } while (b >= 1024 && i < 2); return `${b >= 100 ? b.toFixed(0) : b.toFixed(1)} ${u[i]}`; };
const when = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '' : d.toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'}); };
const clock = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const enc = (p) => String(p).split('/').map(encodeURIComponent).join('/');
const deckUrl = (d, f) => `/decks/${encodeURIComponent(d.id)}/${enc(f)}`;
const inPage = () => location.hash.startsWith('#/decks');
const wantId = () => decodeURIComponent(location.hash.split('/')[2] ?? '');
const online = (d) => d?.kind === 'online';

const listHTML = () => `<aside class="dk-side card tight"><div><h2>Decks</h2><div class="small muted">Browser slide decks. Click one to open, edit or upload.</div></div>
  <button type="button" class="btn main" data-dk="add-toggle">＋ Add a deck</button>
  ${D.adding ? `<form class="stack" style="gap:10px" data-dk-form="add"><div class="seg" style="grid-template-columns:1fr 1fr"><button type="button" class="${D.addMode === 'dir' ? 'on' : ''}" data-dk="add-mode" data-mode="dir">Folder on this PC</button><button type="button" class="${D.addMode === 'url' ? 'on' : ''}" data-dk="add-mode" data-mode="url">Online link</button></div>
    ${D.addMode === 'dir' ? '<label class="f"><span>Folder of the deck</span><input class="in" name="dir" placeholder="D:\\Dev 2026\\my-deck" autocomplete="off" required /></label><div class="small muted">The folder needs an .html file at its top level.</div>' : '<label class="f"><span>Link to the deck</span><input class="in" name="url" placeholder="https://claude.ai/artifact/…" autocomplete="off" required /></label>'}
    <label class="f"><span>Name (optional)</span><input class="in" name="title" autocomplete="off" /></label><div class="row"><button class="btn main sm" type="submit">Add</button><button class="btn ghost sm" type="button" data-dk="add-toggle">Cancel</button></div>${D.err ? `<div class="err">${esc(D.err)}</div>` : ''}</form>` : ''}
  <nav class="dk-items">${(D.list ?? []).map((d) => `<a class="dk-item ${d.id === D.id ? 'on' : ''}" href="#/decks/${encodeURIComponent(d.id)}"><span class="mark" style="width:34px;height:34px;border-radius:11px;flex:none">${d.kind === 'online' ? '☁' : '▦'}</span><span style="min-width:0"><b>${esc(d.title)}</b><small>${d.exists ? `${d.kind === 'online' ? 'Online deck' : `${d.htmlFiles?.length ?? 0} file${(d.htmlFiles?.length ?? 0) === 1 ? '' : 's'}`}${d.updatedAt ? ` · ${esc(when(d.updatedAt))}` : ''}` : 'Folder missing'}</small></span></a>`).join('') || '<div class="small muted" style="padding:10px">No decks yet.</div>'}</nav></aside>`;

const viewButtons = (d) => {
  const links = (d.links ?? []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">↗ ${esc(l.label)}</a>`).join('');
  if (online(d)) return `<a class="btn main" href="${esc(d.url)}" target="_blank" rel="noopener">▶ Open online ↗</a><button type="button" class="btn" data-dk="copy-link">Copy link</button>${links}`;
  return d.versions.map((v, i) => `<a class="btn ${i === 0 ? 'main' : ''}" href="${deckUrl(d, v.file)}" target="_blank" rel="noopener">▶ View${d.versions.length > 1 ? ` · ${esc(v.label)}` : ''}</a>`).join('') + links;
};
const linkRow = (l, i) => `<div class="row dk-lrow" data-i="${i}" style="flex-wrap:nowrap"><input class="in" name="llabel" value="${esc(l.label)}" maxlength="80" placeholder="Name, e.g. Published copy" aria-label="Link name" /><input class="in" name="lurl" value="${esc(l.url)}" placeholder="https://…" aria-label="Link address" /><button type="button" class="btn ghost icon sm danger" data-dk="link-del" data-i="${i}" aria-label="Remove link">✕</button></div>`;

const detailsHTML = (d) => {
  const unused = d.htmlFiles.filter((f) => !d.versions.some((v) => v.file === f));
  return `<section class="card stack" id="dk-details"><div class="spread"><label class="f" style="flex:1;min-width:220px"><span>Deck name</span><input class="in" name="title" value="${esc(d.title)}" maxlength="120" /></label><div class="row">${d.exists ? viewButtons(d) : pill('Folder missing', 'red')}</div></div>
    ${d.exists ? '' : `<div class="err">The folder ${esc(d.dir)} was not found. Move it back, or remove this deck from the list.</div>`}
    ${online(d) ? `<label class="f"><span>Deck link</span><input class="in" name="url" value="${esc(d.url)}" placeholder="https://claude.ai/artifact/…" /></label>` : ''}
    <label class="f"><span>What this deck is</span><textarea class="in" name="description" rows="2" maxlength="2000" placeholder="e.g. 1-hour webinar deck for the AI-agency offer">${esc(d.description)}</textarea></label>
    <label class="f"><span>Notes for yourself</span><textarea class="in" name="notes" rows="3" maxlength="8000">${esc(d.notes)}</textarea></label>
    ${online(d) ? '' : `<h3>Versions to open</h3><div class="stack" style="gap:8px">${d.versions.map((v, i) => `<div class="row dk-ver" data-i="${i}" style="flex-wrap:nowrap"><input class="in" name="vlabel" value="${esc(v.label)}" maxlength="60" aria-label="Version name" /><select class="in" name="vfile" aria-label="File">${d.htmlFiles.map((f) => `<option value="${esc(f)}" ${f === v.file ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select><button type="button" class="btn ghost icon sm danger" data-dk="ver-del" data-i="${i}" ${d.versions.length < 2 ? 'disabled' : ''} aria-label="Remove version">✕</button></div>`).join('')}</div>
      ${unused.length ? `<div class="row"><select class="in" id="dk-newver" style="width:auto" aria-label="Add a version">${unused.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join('')}</select><button type="button" class="btn sm" data-dk="ver-add">＋ Add version</button></div>` : ''}`}
    <h3>More links</h3><div class="small muted">The published copy, a shared link, the live page… They show as buttons at the top.</div><div class="stack" style="gap:8px">${(d.links ?? []).map(linkRow).join('')}</div><div><button type="button" class="btn sm" data-dk="link-add">＋ Add a link</button></div>
    <div class="row"><button type="button" class="btn main" data-dk="save">Save details</button><span class="small muted" id="dk-save-msg">${esc(D.msg.details ?? '')}</span></div></section>`;
};

const chatLog = () => {
  const log = D.chat.log;
  if (!log.length) return '<div class="small muted">Nothing yet. Ask for a change below.</div>';
  const out = []; let tools = [];
  const flush = () => { if (tools.length) { out.push(`<div class="small dim">${tools.length > 4 ? `${tools.length} steps · ${esc(tools.at(-1))}` : tools.map(esc).join('<br>')}</div>`); tools = []; } };
  for (const e of log) { if (e.kind === 'tool') { tools.push(e.text); continue; } flush(); out.push(`<div class="dk-msg ${esc(e.kind)}">${esc(e.text).replace(/\n/g, '<br>')}</div>`); }
  flush(); if (D.chat.busy) out.push('<div class="small muted"><i class="live"></i> Working…</div>');
  return out.join('');
};
const chatStatus = () => (D.chat.busy ? `Claude is working… ${clock(Date.now() - (D.chat.startedAt ?? Date.now()))}. You can leave this page; it keeps going.` : '');
const askHTML = (d) => online(d)
  ? `<section class="card stack" id="dk-ask"><h3>Changing this deck</h3><div class="small muted">This deck lives online, so it is edited there: press <b>▶ Open online</b> and use its own editor.</div></section>`
  : `<section class="card stack" id="dk-ask"><div class="spread"><h3>Ask Claude to change this deck</h3>${pill('AI', 'violet')}</div><div class="small muted">Say what you want in plain words, e.g. “Change the offer price to ₹9,999” or “Add a slide with three testimonials”. Claude edits the deck and rebuilds it.</div>
    <div class="dk-chat" id="dk-chatlog">${chatLog()}</div><textarea class="in" id="dk-chatmsg" rows="3" maxlength="4000" placeholder="What should change? (Ctrl+Enter to send)" ${d.exists ? '' : 'disabled'}></textarea>
    <div class="row"><button type="button" class="btn main" data-dk="chat-send" id="dk-send" ${D.chat.busy || !d.exists ? 'disabled' : ''}>Send</button><button type="button" class="btn" data-dk="chat-stop" id="dk-stop" ${D.chat.busy ? '' : 'hidden'}>■ Stop</button><button type="button" class="btn ghost sm" data-dk="chat-clear" ${D.chat.busy || !D.chat.log.length ? 'disabled' : ''}>Clear chat</button><span class="small muted" id="dk-chatstatus">${esc(chatStatus())}</span></div></section>`;

const configHTML = (d) => {
  if (!d.config) return '';
  const f = (g, label, num) => (d.config[g] ?? []).map((x) => `<label class="f"><span>${esc(label[x.key] ?? x.key)}${x.note ? ` <i class="dim">· ${esc(x.note)}</i>` : ''}</span><input class="in" data-cfg="${g}.${esc(x.key)}" ${num ? 'type="number" min="0" step="1"' : 'type="text" maxlength="200"'} value="${esc(x.value)}" /></label>`).join('');
  return `<section class="card stack" id="dk-config"><div class="spread"><h3>Prices and contact lines</h3>${d.canBuild ? pill('needs a rebuild to show') : ''}</div><div class="small muted">These sit at the top of <b>src/slides.js</b>. Change them here instead of editing code.</div>
    ${d.config.PRICES ? `<div class="g2">${f('PRICES', PRICE, true)}</div>` : ''}${d.config.CONTACT ? `<div class="g2">${f('CONTACT', CONTACT, false)}</div>` : ''}
    <div class="row"><button type="button" class="btn main" data-dk="cfg-save" ${D.busy ? 'disabled' : ''}>${d.canBuild ? 'Save and rebuild' : 'Save'}</button>${d.canBuild ? `<button type="button" class="btn" data-dk="build" ${D.busy ? 'disabled' : ''}>Rebuild only</button>` : ''}<span class="small muted" id="dk-cfg-msg">${esc(D.busy === 'build' ? 'Rebuilding…' : D.msg.config ?? '')}</span></div></section>`;
};
const filesHTML = (d) => {
  if (online(d)) return '';
  const q = D.fq.trim().toLowerCase(), all = d.files.filter((f) => !q || f.path.toLowerCase().includes(q)), shown = all.slice(0, D.fshow);
  return `<section class="card stack" id="dk-files"><div class="spread"><h3>Files</h3><span class="small muted">${d.files.length} in assets · downloads and uploads go straight to the deck folder</span></div>
    <div class="drop" id="dk-drop"><b>Upload files</b> <span class="small muted">Images, logos, fonts, videos… A file with the same name replaces the old one.</span>
      <div class="row" style="justify-content:center;margin-top:10px"><select class="in" id="dk-folder" style="width:auto" aria-label="Upload into folder">${d.folders.map((f) => `<option value="${esc(f)}" ${f === 'assets' ? 'selected' : ''}>${f === '' ? 'Main folder (next to the .html files)' : esc(f)}</option>`).join('')}</select><button type="button" class="btn main" data-dk="pick" ${D.busy ? 'disabled' : ''}>⬆ Choose files</button><input type="file" id="dk-file" multiple hidden /></div>
      <div class="small muted" id="dk-up-msg" style="margin-top:6px">${esc(D.busy === 'upload' ? 'Uploading…' : D.msg.files ?? '')}</div></div>
    <input class="in" id="dk-fq" placeholder="Find a file…" value="${esc(D.fq)}" aria-label="Find a file" />
    <div class="dk-files">${shown.map((f) => `<div class="dk-file">${f.image ? `<a class="dk-th" href="${deckUrl(d, f.path)}" target="_blank" rel="noopener"><img loading="lazy" src="${deckUrl(d, f.path)}?v=${Math.round(f.mtime)}" alt="" /></a>` : `<span class="dk-th">${esc((f.name.split('.').pop() || '').slice(0, 4))}</span>`}
      <div style="flex:1;min-width:0"><b class="small" title="${esc(f.path)}">${esc(f.name)}</b><div class="small muted">${esc(f.folder)} · ${size(f.size)}</div></div><a class="btn ghost icon sm" href="${deckUrl(d, f.path)}" download="${esc(f.name)}" aria-label="Download ${esc(f.name)}">⬇</a><button type="button" class="btn ghost sm" data-dk="replace" data-path="${esc(f.path)}" ${D.busy ? 'disabled' : ''}>Replace</button></div>`).join('')}</div>
    ${all.length > shown.length ? `<button type="button" class="btn ghost sm" data-dk="more">Show more (${all.length - shown.length} hidden)</button>` : ''}<input type="file" id="dk-replace" hidden /></section>`;
};
const moreHTML = (d) => `<section class="card stack">${online(d) ? '' : `<h3>Bigger changes</h3><div class="small muted">New slides or a redesign are best asked in the chat above. You can also ask Claude Code from this folder:</div><div class="row"><code class="small">${esc(d.dir)}</code><button type="button" class="btn sm" data-dk="copy-path">Copy path</button></div>`}
  <div class="row"><button type="button" class="btn ghost sm danger" data-dk="remove">Remove from this list</button><span class="small muted">${online(d) ? 'Only the list entry goes. The online deck itself is not touched.' : 'The folder and all its files stay where they are.'}</span></div></section>`;

const rightHTML = () => {
  if (D.loading && !D.cur) return '<div class="skel" style="height:320px"></div>';
  const d = D.cur;
  if (!d) return `<div class="card empty"><h2>${(D.list ?? []).length ? 'Pick a deck on the left' : 'No decks yet'}</h2><p>${(D.list ?? []).length ? 'Open it, change its details, ask Claude for a change, or replace its files.' : 'Add a deck with the button on the left.'}</p></div>`;
  return `<div class="stack" data-deck="${esc(d.id)}">${detailsHTML(d)}${askHTML(d)}${configHTML(d)}${filesHTML(d)}${moreHTML(d)}</div>`;
};
const paint = () => { const el = $('#view'); if (!el || !inPage()) return; el.innerHTML = `<div class="dk">${listHTML()}<div class="dk-right">${rightHTML()}</div></div>`; scrollChat(); };
const repaint = (id, html) => { const el = $(`#${id}`); if (el) el.outerHTML = html; if (id === 'dk-ask') scrollChat(); };
const scrollChat = () => { const l = $('#dk-chatlog'); if (l) l.scrollTop = l.scrollHeight; };

const loadList = async () => { D.list = (await api('/api/decks')).decks; };
const loadCur = async () => { if (!D.id) { D.cur = null; return; } try { D.cur = await api(`/api/decks/${encodeURIComponent(D.id)}`); } catch (e) { D.cur = null; toast(e.message); } };
const loadChat = async () => { if (!D.cur || online(D.cur)) { D.chat = {busy: false, log: [], startedAt: null}; return; } try { D.chat = await api(`/api/decks/${encodeURIComponent(D.id)}/chat`); } catch { D.chat = {busy: false, log: [], startedAt: null}; } };
const stopPoll = () => { clearInterval(D.poll); D.poll = null; };
const startPoll = () => {
  if (D.poll) return; const id = D.id;
  D.poll = setInterval(async () => {
    if (!inPage() || D.id !== id) return stopPoll();
    const was = D.chat.log.length; await loadChat();
    const log = $('#dk-chatlog'); if (log) { log.innerHTML = chatLog(); if (D.chat.log.length !== was) scrollChat(); }
    const st = $('#dk-chatstatus'); if (st) st.textContent = chatStatus();
    const send = $('#dk-send'), stop = $('#dk-stop'); if (send) send.disabled = D.chat.busy; if (stop) stop.hidden = !D.chat.busy;
    if (!D.chat.busy) { stopPoll(); const last = D.chat.log.at(-1); if (last?.kind === 'done') toast('Claude finished. The deck is rebuilt.'); else if (last?.kind === 'error') toast('Claude could not finish. See the chat.'); await refreshAfter(['ask', 'config', 'files']); }
  }, 1500);
};
export const render = async () => {
  const id = wantId(), changed = id !== D.id; D.id = id || null;
  if (changed) { stopPoll(); D.cur = null; D.dirty = false; D.fq = ''; D.fshow = 60; D.msg = {}; D.chat = {busy: false, log: [], startedAt: null}; }
  D.loading = true; paint();
  await Promise.all([loadList().catch((e) => toast(e.message)), loadCur()]); await loadChat();
  if (!D.id && D.list?.length && !D.adding) { location.replace(`#/decks/${encodeURIComponent(D.list[0].id)}`); return; }
  D.loading = false; paint(); if (D.chat.busy) startPoll();
};
export const leave = () => stopPoll();
export const onEvent = () => {};

const collect = () => {
  const root = $('#dk-details');
  const out = {title: $('[name=title]', root).value, description: $('[name=description]', root).value, notes: $('[name=notes]', root).value, links: [...root.querySelectorAll('.dk-lrow')].map((r) => ({label: $('[name=llabel]', r).value, url: $('[name=lurl]', r).value}))};
  if (online(D.cur)) out.url = $('[name=url]', root).value; else out.versions = [...root.querySelectorAll('.dk-ver')].map((r, i) => ({id: D.cur.versions[i]?.id, label: $('[name=vlabel]', r).value, file: $('[name=vfile]', r).value}));
  return out;
};
const refreshAfter = async (parts) => {
  await Promise.all([loadList(), loadCur()]);
  if (!D.cur) return paint();
  if (parts.includes('details')) repaint('dk-details', detailsHTML(D.cur));
  if (parts.includes('config')) repaint('dk-config', configHTML(D.cur));
  if (parts.includes('files')) repaint('dk-files', filesHTML(D.cur));
  if (parts.includes('ask')) { const keep = $('#dk-chatmsg')?.value ?? ''; repaint('dk-ask', askHTML(D.cur)); const m = $('#dk-chatmsg'); if (m) m.value = keep; }
  const nav = $('.dk-items'); if (nav) nav.outerHTML = listHTML().match(/<nav class="dk-items">[\s\S]*<\/nav>/)[0];
};
const say = (key, id, text) => { D.msg[key] = text; const el = $(`#${id}`); if (el) el.textContent = text; };
const withEdits = (fn) => { const body = collect(); fn(body); D.cur = {...D.cur, title: body.title, description: body.description, notes: body.notes, links: body.links, ...(online(D.cur) ? {url: body.url} : {versions: body.versions})}; repaint('dk-details', detailsHTML(D.cur)); D.dirty = true; say('details', 'dk-save-msg', 'Unsaved changes'); };
const upload = async (files, folder, asName) => {
  if (!files.length || D.busy) return; const d = D.cur, names = asName ? [asName] : files.map((f) => f.name);
  const clash = d.files.filter((x) => x.folder === folder && names.includes(x.name)).map((x) => x.name);
  if (clash.length && !asName && !confirm(`These files already exist and will be replaced:\n\n${clash.join('\n')}\n\nContinue?`)) return;
  const fd = new FormData(); fd.append('folder', folder); files.forEach((f) => fd.append('files', f, asName ?? f.name));
  D.busy = 'upload'; say('files', 'dk-up-msg', `Uploading ${files.length} file${files.length === 1 ? '' : 's'}…`);
  try { const r = await api(`/api/decks/${encodeURIComponent(d.id)}/upload`, {method: 'POST', body: fd}); D.busy = ''; D.msg.files = `Uploaded ${r.saved.length}${r.replaced.length ? ` (replaced ${r.replaced.length})` : ''}.`; D.cur = r.deck; await loadList(); paint(); toast(`Uploaded ${r.saved.length} file${r.saved.length === 1 ? '' : 's'}.`); }
  catch (e) { D.busy = ''; D.msg.files = e.message; repaint('dk-files', filesHTML(D.cur)); toast(e.message); }
};
const saveConfig = async (mode) => {
  const d = D.cur, body = {};
  document.querySelectorAll('#dk-config [data-cfg]').forEach((i) => { const [g, k] = i.dataset.cfg.split('.'); (body[g] ??= {})[k] = i.type === 'number' ? Number(i.value) : i.value; });
  D.busy = 'build'; say('config', 'dk-cfg-msg', mode === 'only' ? 'Rebuilding…' : 'Saving, then rebuilding…'); document.querySelectorAll('#dk-config .btn').forEach((b) => (b.disabled = true));
  try {
    if (mode !== 'only') await api(`/api/decks/${encodeURIComponent(d.id)}/config`, {method: 'PUT', body});
    if (d.canBuild) { const r = await api(`/api/decks/${encodeURIComponent(d.id)}/build`, {method: 'POST'}); D.msg.config = `${mode === 'only' ? 'Rebuilt' : 'Saved and rebuilt'} in ${(r.ms / 1000).toFixed(1)}s. Press View (or refresh the open tab) to see it.`; } else D.msg.config = 'Saved.';
    D.busy = ''; await refreshAfter(['config']);
  } catch (e) { D.busy = ''; D.msg.config = e.message; repaint('dk-config', configHTML(D.cur)); toast(e.message); }
};
const sendChat = async () => {
  const box = $('#dk-chatmsg'), message = box?.value.trim(); if (!message || D.chat.busy) return;
  try { await api(`/api/decks/${encodeURIComponent(D.id)}/chat`, {method: 'POST', body: {message}}); box.value = ''; await loadChat(); D.chat.busy = true; D.chat.startedAt = D.chat.startedAt ?? Date.now(); repaint('dk-ask', askHTML(D.cur)); startPoll(); } catch (e) { toast(e.message); }
};

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-dk]');
  if (!b || !inPage()) return;
  const a = b.dataset.dk, d = D.cur;
  try {
    if (a === 'add-toggle') { D.adding = !D.adding; D.err = ''; paint(); $('[data-dk-form=add] input')?.focus(); }
    else if (a === 'add-mode') { D.addMode = b.dataset.mode; D.err = ''; paint(); }
    else if (a === 'save') { say('details', 'dk-save-msg', 'Saving…'); D.cur = await api(`/api/decks/${encodeURIComponent(d.id)}`, {method: 'PATCH', body: collect()}); D.dirty = false; D.msg.details = 'Saved.'; await refreshAfter(['details']); toast('Details saved.'); }
    else if (a === 'ver-add') { const f = $('#dk-newver')?.value; if (f) withEdits((body) => body.versions.push({label: f.replace(/\.html?$/i, ''), file: f})); }
    else if (a === 'ver-del') withEdits((body) => body.versions.splice(+b.dataset.i, 1));
    else if (a === 'link-add') withEdits((body) => body.links.push({label: '', url: ''}));
    else if (a === 'link-del') withEdits((body) => body.links.splice(+b.dataset.i, 1));
    else if (a === 'cfg-save') saveConfig('save');
    else if (a === 'build') saveConfig('only');
    else if (a === 'pick') $('#dk-file')?.click();
    else if (a === 'replace') { const r = $('#dk-replace'); r.dataset.path = b.dataset.path; r.click(); }
    else if (a === 'more') { D.fshow += 100; repaint('dk-files', filesHTML(d)); }
    else if (a === 'copy-path') { try { await navigator.clipboard.writeText(d.dir); toast('Folder path copied.'); } catch { toast(d.dir); } }
    else if (a === 'copy-link') { try { await navigator.clipboard.writeText(d.url); toast('Link copied.'); } catch { toast(d.url); } }
    else if (a === 'chat-send') sendChat();
    else if (a === 'chat-stop') { await api(`/api/decks/${encodeURIComponent(d.id)}/chat/stop`, {method: 'POST'}); toast('Asked Claude to stop.'); }
    else if (a === 'chat-clear') { if (!confirm('Clear this conversation? The deck is not changed.')) return; await api(`/api/decks/${encodeURIComponent(d.id)}/chat`, {method: 'DELETE'}); D.chat = {busy: false, log: [], startedAt: null}; repaint('dk-ask', askHTML(d)); }
    else if (a === 'remove') { if (!confirm(`Remove “${d.title}” from the Decks list?\n\n${online(d) ? 'The online deck itself is not touched.' : 'The folder and all its files stay where they are.'}`)) return; await api(`/api/decks/${encodeURIComponent(d.id)}`, {method: 'DELETE'}); toast('Removed from the list.'); D.cur = null; D.id = null; location.hash = '#/decks'; }
  } catch (e) { toast(e.message); }
});
document.addEventListener('submit', async (ev) => {
  const f = ev.target.closest('[data-dk-form=add]'); if (!f) return; ev.preventDefault();
  try { const body = D.addMode === 'url' ? {url: f.url.value, title: f.title.value} : {dir: f.dir.value, title: f.title.value}; const r = await api('/api/decks', {method: 'POST', body}); D.adding = false; D.err = ''; location.hash = `#/decks/${encodeURIComponent(r.id)}`; toast(`Added “${r.title}”.`); } catch (e) { D.err = e.message; paint(); }
});
document.addEventListener('change', (ev) => {
  if (!inPage()) return;
  if (ev.target.id === 'dk-file') { const fs = [...ev.target.files]; ev.target.value = ''; upload(fs, $('#dk-folder').value); }
  else if (ev.target.id === 'dk-replace') { const f = ev.target.files[0], p = ev.target.dataset.path || ''; ev.target.value = ''; if (!f || !p) return; const i = p.lastIndexOf('/'), folder = i < 0 ? '' : p.slice(0, i), name = p.slice(i + 1); if (confirm(`Replace ${name} with ${f.name}?\n\nThe deck will use the new file under the old name.`)) upload([f], folder, name); }
});
document.addEventListener('input', (ev) => {
  if (!inPage()) return;
  if (ev.target.id === 'dk-fq') { D.fq = ev.target.value; D.fshow = 60; const pos = ev.target.selectionStart; repaint('dk-files', filesHTML(D.cur)); const q = $('#dk-fq'); q?.focus(); q?.setSelectionRange(pos, pos); }
  else if (ev.target.closest('#dk-details') && !D.dirty) { D.dirty = true; say('details', 'dk-save-msg', 'Unsaved changes'); }
});
document.addEventListener('keydown', (ev) => { if (inPage() && ev.target.id === 'dk-chatmsg' && ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); sendChat(); } });
document.addEventListener('dragover', (ev) => { if (inPage() && ev.target.closest?.('#dk-drop')) { ev.preventDefault(); $('#dk-drop').classList.add('over'); } });
document.addEventListener('dragleave', (ev) => { if (ev.target.closest?.('#dk-drop')) $('#dk-drop').classList.remove('over'); });
document.addEventListener('drop', (ev) => { if (!inPage() || !ev.target.closest?.('#dk-drop')) return; ev.preventDefault(); $('#dk-drop').classList.remove('over'); upload([...ev.dataTransfer.files], $('#dk-folder').value); });
