// Visual PPT page: the decks on the left (folders on this PC and decks that live online), and for the one you pick: its details,
// where to open it, a chat to ask Claude for changes, the prices / contact lines, and the files you can download, upload or replace.
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

let C = null; // {api, toast}
const D = {list: null, id: null, cur: null, loading: false, adding: false, addMode: 'dir', fq: '', fshow: 60, dirty: false, busy: '', msg: {}, err: '', chat: {busy: false, log: [], startedAt: null}, poll: null};
export const initDecks = (ctx) => { C = ctx; };

const PRICE_LABEL = {programRegular: 'Program · regular price', programOffer: 'Program · offer price', bundleRegular: 'Bundle · regular price', bundleOffer: 'Bundle · offer price', avgClientFee: 'Average client fee (earnings slide)'};
const CONTACT_LABEL = {web: 'Website', email: 'Email', phones: 'Phone numbers'};
const size = (b) => { b = Number(b) || 0; if (b < 1024) return `${b} B`; const u = ['KB', 'MB', 'GB']; let i = -1; do { b /= 1024; i++; } while (b >= 1024 && i < 2); return `${b >= 100 ? b.toFixed(0) : b.toFixed(1)} ${u[i]}`; };
const when = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '' : d.toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'}); };
const clock = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const enc = (p) => String(p).split('/').map(encodeURIComponent).join('/');
const deckUrl = (d, file) => `/decks/${encodeURIComponent(d.id)}/${enc(file)}`;
const wantId = () => decodeURIComponent(location.hash.split('/')[2] ?? '');
const inPage = () => location.hash.startsWith('#/ppt');
const online = (d) => d?.kind === 'online';

// ---------- left: the list ----------
const listHTML = () => {
  const items = (D.list ?? []).map((d) => `<a class="dk-item ${d.id === D.id ? 'on' : ''} ${d.exists ? '' : 'gone'}" href="#/ppt/${encodeURIComponent(d.id)}">
      <span class="dk-ic ${d.kind === 'online' ? 'on' : ''}" aria-hidden="true">${d.kind === 'online' ? '☁' : '▦'}</span><span class="dk-tx"><b>${esc(d.title)}</b><small>${d.exists ? `${d.kind === 'online' ? 'Online deck' : `${d.versions} version${d.versions === 1 ? '' : 's'}`} · edited ${esc(when(d.updatedAt))}` : 'folder missing'}</small></span></a>`).join('');
  return `<aside class="dk-side">
    <div class="dk-lh"><div><h2>Visual PPT</h2><div class="muted small">Browser slide decks. Click one to open, edit or upload.</div></div></div>
    <button type="button" class="btn primary block" data-dk="add-toggle">＋ Add a deck</button>
    ${D.adding ? `<form class="dk-add" data-dk-form="add">
      <div class="dk-seg" role="tablist"><button type="button" class="${D.addMode === 'dir' ? 'on' : ''}" data-dk="add-mode" data-mode="dir">Folder on this PC</button><button type="button" class="${D.addMode === 'url' ? 'on' : ''}" data-dk="add-mode" data-mode="url">Online link</button></div>
      ${D.addMode === 'dir'
    ? `<label class="f"><span>Folder of the deck</span><input name="dir" placeholder="D:\\Dev 2026\\my-deck" autocomplete="off" required /></label><div class="muted small">The folder needs an .html file at its top level. It is listed here, not copied or moved.</div>`
    : `<label class="f"><span>Link to the deck</span><input name="url" placeholder="https://claude.ai/artifact/…" autocomplete="off" required /></label><div class="muted small">For a deck that lives online, such as a Slides deck on claude.ai.</div>`}
      <label class="f"><span>Name (optional)</span><input name="title" placeholder="${D.addMode === 'dir' ? 'Uses the folder name' : 'Uses the site name'}" autocomplete="off" /></label>
      <div class="row" style="gap:8px"><button class="btn primary sm" type="submit">Add</button><button class="btn ghost sm" type="button" data-dk="add-toggle">Cancel</button></div>
      ${D.err ? `<div class="dk-err">${esc(D.err)}</div>` : ''}
    </form>` : ''}
    <nav class="dk-items">${items || '<div class="muted small" style="padding:10px">No decks yet.</div>'}</nav>
  </aside>`;
};

// ---------- right: the deck ----------
const viewButtons = (d) => {
  const links = (d.links ?? []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(l.url)}">↗ ${esc(l.label)}</a>`).join('');
  if (online(d)) return `<a class="btn primary" href="${esc(d.url)}" target="_blank" rel="noopener" title="Opens the deck online in a new tab. Present or edit it there.">▶ Open online ↗</a><button type="button" class="btn" data-dk="copy-link" title="Copy the deck link">Copy link</button>${links}`;
  return d.versions.map((v, i) => `<a class="btn ${i === 0 ? 'primary' : ''}" href="${deckUrl(d, v.file)}" target="_blank" rel="noopener" title="Opens ${esc(v.file)} in a new tab">▶ View${d.versions.length > 1 ? ` · ${esc(v.label)}` : ''} ↗</a>`).join('') + links;
};

const linkRow = (l, i) => `<div class="dk-lrow" data-i="${i}"><input name="llabel" value="${esc(l.label)}" maxlength="80" placeholder="Name, e.g. Published copy" aria-label="Link name" /><input name="lurl" value="${esc(l.url)}" placeholder="https://…" aria-label="Link address" /><button type="button" class="btn ghost sm danger" data-dk="link-del" data-i="${i}" title="Remove this link">✕</button></div>`;

const detailsHTML = (d) => {
  const unused = d.htmlFiles.filter((f) => !d.versions.some((v) => v.file === f));
  return `<section class="card dk-card" id="dk-details">
    <div class="spread dk-head">
      <div style="min-width:0;flex:1"><label class="f"><span>Deck name</span><input name="title" value="${esc(d.title)}" maxlength="120" /></label></div>
      <div class="row dk-view">${d.exists ? viewButtons(d) : '<span class="pill red">Folder missing</span>'}</div>
    </div>
    ${d.exists ? '' : `<div class="dk-err">The folder ${esc(d.dir)} was not found. Move it back, or remove this deck from the list.</div>`}
    ${online(d) ? `<label class="f"><span>Deck link</span><input name="url" value="${esc(d.url)}" placeholder="https://claude.ai/artifact/…" /></label>` : ''}
    <label class="f"><span>What this deck is</span><textarea name="description" rows="2" maxlength="2000" placeholder="e.g. 1-hour webinar deck for the AI-agency offer">${esc(d.description)}</textarea></label>
    <label class="f"><span>Notes for yourself (what to change next, who has seen it…)</span><textarea name="notes" rows="3" maxlength="8000">${esc(d.notes)}</textarea></label>
    ${online(d) ? '' : `<h3 style="margin-top:6px">Versions to open</h3>
    <div class="dk-vers">${d.versions.map((v, i) => `<div class="dk-ver" data-i="${i}">
      <input name="vlabel" value="${esc(v.label)}" maxlength="60" aria-label="Version name" />
      <select name="vfile" aria-label="File">${d.htmlFiles.map((f) => `<option value="${esc(f)}" ${f === v.file ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select>
      <button type="button" class="btn ghost sm danger" data-dk="ver-del" data-i="${i}" ${d.versions.length < 2 ? 'disabled' : ''} title="Remove this version from the list (the file stays)">✕</button></div>`).join('')}</div>
    ${unused.length ? `<div class="row dk-addver"><select id="dk-newver" aria-label="Add a version">${unused.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join('')}</select><button type="button" class="btn sm" data-dk="ver-add">＋ Add this file as a version</button></div>` : ''}`}
    <h3 style="margin-top:6px">More links</h3>
    <div class="muted small">The published copy, a shared link, the live page… They show as buttons next to ▶ at the top.</div>
    <div class="dk-links">${(d.links ?? []).map(linkRow).join('')}</div>
    <div><button type="button" class="btn sm" data-dk="link-add">＋ Add a link</button></div>
    <div class="row dk-save"><button type="button" class="btn primary" data-dk="save" id="dk-save">Save details</button><span class="muted small" id="dk-save-msg">${esc(D.msg.details ?? '')}</span></div>
  </section>`;
};

// ---------- ask Claude ----------
const chatLogHTML = () => {
  const log = D.chat.log;
  if (!log.length) return '<div class="muted small dk-empty-chat">Nothing yet. Ask for a change below.</div>';
  const out = []; let tools = [];
  const flush = () => { if (tools.length) { out.push(`<div class="dk-steps">${tools.length > 4 ? `${tools.length} steps · ${esc(tools.at(-1))}` : tools.map(esc).join('<br>')}</div>`); tools = []; } };
  for (const e of log) {
    if (e.kind === 'tool') { tools.push(e.text); continue; }
    flush();
    out.push(`<div class="dk-msg ${esc(e.kind)}">${esc(e.text).replace(/\n/g, '<br>')}</div>`);
  }
  flush();
  if (D.chat.busy) out.push('<div class="dk-steps dk-working"><i class="dot"></i> Working…</div>');
  return out.join('');
};
const askHTML = (d) => {
  if (online(d)) return `<section class="card dk-card" id="dk-ask"><h3>Changing this deck</h3>
    <div class="muted small">This deck lives online, so it is edited there: press <b>▶ Open online</b> and use its own editor. Or ask Claude Code in VS Code, e.g. <i>“Update the ${esc(d.title)}: …”</i>, and it changes the deck for you.</div></section>`;
  return `<section class="card dk-card" id="dk-ask">
    <div class="spread"><h3>Ask Claude to change this deck</h3><span class="pill blue">AI</span></div>
    <div class="muted small">Say what you want in plain words, e.g. <i>“Change the offer price to ₹9,999”</i>, <i>“Make the first slide say Reserve Your Seat”</i> or <i>“Add a slide with three testimonials”</i>. Claude edits the deck, then the studio rebuilds it. Claude only touches this deck's own files.</div>
    <div class="dk-chat" id="dk-chatlog">${chatLogHTML()}</div>
    <textarea id="dk-chatmsg" rows="3" maxlength="4000" placeholder="What should change? (Ctrl+Enter to send)" ${d.exists ? '' : 'disabled'}></textarea>
    <div class="row dk-save"><button type="button" class="btn primary" data-dk="chat-send" id="dk-send" ${D.chat.busy || !d.exists ? 'disabled' : ''}>Send</button>
      <button type="button" class="btn" data-dk="chat-stop" id="dk-stop" ${D.chat.busy ? '' : 'hidden'}>■ Stop</button>
      <button type="button" class="btn ghost sm" data-dk="chat-clear" ${D.chat.busy || !D.chat.log.length ? 'disabled' : ''} title="Forget this conversation">Clear chat</button>
      <span class="muted small" id="dk-chatstatus">${esc(chatStatus())}</span></div>
  </section>`;
};
const chatStatus = () => (D.chat.busy ? `Claude is working… ${clock(Date.now() - (D.chat.startedAt ?? Date.now()))}. You can leave this page; it keeps going.` : '');

const configHTML = (d) => {
  if (!d.config) return '';
  const f = (group, label, type) => (d.config[group] ?? []).map((x) => `<label class="f"><span>${esc(label[x.key] ?? x.key)}${x.note ? ` <i class="muted">· ${esc(x.note)}</i>` : ''}</span>
    <input data-cfg="${group}.${esc(x.key)}" ${type === 'number' ? `type="number" min="0" step="1" inputmode="numeric"` : 'type="text" maxlength="200"'} value="${esc(x.value)}" /></label>`).join('');
  return `<section class="card dk-card" id="dk-config">
    <div class="spread"><h3>Prices and contact lines</h3>${d.canBuild ? '<span class="pill">needs a rebuild to show</span>' : ''}</div>
    <div class="muted small">These sit at the top of <b>src/slides.js</b>. Change them here instead of editing code.</div>
    ${d.config.PRICES ? `<div class="dk-grid">${f('PRICES', PRICE_LABEL, 'number')}</div>` : ''}
    ${d.config.CONTACT ? `<div class="dk-grid">${f('CONTACT', CONTACT_LABEL, 'text')}</div>` : ''}
    <div class="row dk-save"><button type="button" class="btn primary" data-dk="cfg-save" ${D.busy ? 'disabled' : ''}>${d.canBuild ? 'Save and rebuild' : 'Save'}</button>
      ${d.canBuild ? `<button type="button" class="btn" data-dk="build" ${D.busy ? 'disabled' : ''} title="Rebuild deck.js / night.js from src/ without changing anything">Rebuild only</button>` : ''}
      <span class="muted small" id="dk-cfg-msg">${esc(D.busy === 'build' ? 'Rebuilding…' : D.msg.config ?? '')}</span></div>
  </section>`;
};

const filesHTML = (d) => {
  if (online(d)) return '';
  const q = D.fq.trim().toLowerCase();
  const all = d.files.filter((f) => !q || f.path.toLowerCase().includes(q));
  const shown = all.slice(0, D.fshow);
  const folderOpts = d.folders.map((f) => `<option value="${esc(f)}" ${f === 'assets' ? 'selected' : ''}>${f === '' ? 'Main folder (next to the .html files)' : esc(f)}</option>`).join('');
  return `<section class="card dk-card" id="dk-files">
    <div class="spread"><h3>Files</h3><span class="muted small">${d.files.length} in assets · downloads and uploads go straight to the deck folder</span></div>
    <div class="dk-up" id="dk-drop">
      <div><b>Upload files</b><div class="muted small">Images, logos, fonts, videos… Choose where they go, then pick or drop them here. A file with the same name replaces the old one.</div></div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><select id="dk-folder" aria-label="Upload into folder">${folderOpts}</select>
        <button type="button" class="btn primary" data-dk="pick" ${D.busy ? 'disabled' : ''}>⬆ Choose files</button><input type="file" id="dk-file" multiple hidden /></div>
      <div class="muted small" id="dk-up-msg">${esc(D.busy === 'upload' ? 'Uploading…' : D.msg.files ?? '')}</div>
    </div>
    <input class="dk-q" id="dk-fq" placeholder="Find a file…" value="${esc(D.fq)}" aria-label="Find a file" />
    <div class="dk-files">${shown.map((f) => `<div class="dk-file">
      ${f.image ? `<a class="dk-th" href="${deckUrl(d, f.path)}" target="_blank" rel="noopener"><img loading="lazy" src="${deckUrl(d, f.path)}?v=${Math.round(f.mtime)}" alt="" /></a>` : `<span class="dk-th dk-ext">${esc((f.name.split('.').pop() || 'file').slice(0, 5))}</span>`}
      <div class="dk-fn"><b title="${esc(f.path)}">${esc(f.name)}</b><small>${esc(f.folder)} · ${size(f.size)}</small></div>
      <div class="dk-fa"><a class="btn ghost sm" href="${deckUrl(d, f.path)}" download="${esc(f.name)}" title="Download">⬇</a><button type="button" class="btn ghost sm" data-dk="replace" data-path="${esc(f.path)}" ${D.busy ? 'disabled' : ''} title="Upload a new file to replace this one">⟳ Replace</button></div></div>`).join('') || '<div class="muted small" style="padding:10px">No files match.</div>'}</div>
    ${all.length > shown.length ? `<button type="button" class="btn ghost sm" data-dk="more">Show ${Math.min(100, all.length - shown.length)} more (${all.length - shown.length} hidden)</button>` : ''}
    <input type="file" id="dk-replace" hidden />
  </section>`;
};

const moreHTML = (d) => `<section class="card dk-card dk-more">
  ${online(d) ? '' : `<h3>Bigger changes</h3>
  <div class="muted small">New slides or a redesign are best asked in the chat above. You can also ask Claude Code from this folder${d.canBuild ? ', then press <b>Rebuild only</b> (or run build.cmd)' : ''}:</div>
  <div class="row" style="gap:8px"><code class="dk-path">${esc(d.dir)}</code><button type="button" class="btn sm" data-dk="copy-path">Copy path</button></div>`}
  <div class="row dk-danger"><button type="button" class="btn ghost sm danger" data-dk="remove">Remove from this list</button><span class="muted small">${online(d) ? 'Only the list entry goes. The online deck itself is not touched.' : 'Only the list entry goes. The folder and every file stay where they are.'}</span></div>
</section>`;

const rightHTML = () => {
  if (D.loading && !D.cur) return '<div class="muted" style="padding:30px">Loading…</div>';
  const d = D.cur;
  if (!d) return `<div class="dk-empty card"><h2>${(D.list ?? []).length ? 'Pick a deck on the left' : 'No decks yet'}</h2><p class="muted">${(D.list ?? []).length ? 'Open it, change its details, ask Claude for a change, replace its pictures, or edit the prices.' : 'Press “Add a deck” and give the folder or the link of a slide deck.'}</p></div>`;
  return `<div class="dk-detail" data-deck="${esc(d.id)}">${detailsHTML(d)}${askHTML(d)}${configHTML(d)}${filesHTML(d)}${moreHTML(d)}</div>`;
};

const paint = () => {
  const el = $('#main');
  if (!el || !inPage()) return;
  const top = $('.dk-right', el)?.scrollTop ?? 0;
  el.innerHTML = `<div class="dk"><div class="dk-leftcol">${listHTML()}</div><div class="dk-right">${rightHTML()}</div></div>`;
  if (top) $('.dk-right', el).scrollTop = top;
  scrollChat();
};
const repaint = (id, html) => { const el = $(`#${id}`); if (el) el.outerHTML = html; if (id === 'dk-ask') scrollChat(); };
const scrollChat = () => { const l = $('#dk-chatlog'); if (l) l.scrollTop = l.scrollHeight; };

// ---------- load ----------
const loadList = async () => { D.list = (await C.api('/api/decks')).decks; };
const loadCur = async () => {
  if (!D.id) { D.cur = null; return; }
  try { D.cur = await C.api(`/api/decks/${encodeURIComponent(D.id)}`); } catch (e) { D.cur = null; C.toast(e.message); }
};
const loadChat = async () => {
  if (!D.cur || online(D.cur)) { D.chat = {busy: false, log: [], startedAt: null}; return; }
  try { D.chat = await C.api(`/api/decks/${encodeURIComponent(D.id)}/chat`); } catch { D.chat = {busy: false, log: [], startedAt: null}; }
};
const stopPoll = () => { clearInterval(D.poll); D.poll = null; };
const startPoll = () => {
  if (D.poll) return;
  const id = D.id;
  D.poll = setInterval(async () => {
    if (!inPage() || D.id !== id) return stopPoll();
    const was = D.chat.log.length;
    await loadChat();
    const log = $('#dk-chatlog'); if (log) { log.innerHTML = chatLogHTML(); if (D.chat.log.length !== was) scrollChat(); }
    const st = $('#dk-chatstatus'); if (st) st.textContent = chatStatus();
    const send = $('#dk-send'), stop = $('#dk-stop'); if (send) send.disabled = D.chat.busy; if (stop) stop.hidden = !D.chat.busy;
    if (!D.chat.busy) { // finished: the deck may have changed (text, prices, files)
      stopPoll();
      const last = D.chat.log.at(-1);
      if (last?.kind === 'done') C.toast('Claude finished. The deck is rebuilt.');
      else if (last?.kind === 'error') C.toast('Claude could not finish. See the chat.');
      await refreshAfter(['ask', 'config', 'files']);
    }
  }, 1500);
};
export const renderDecks = async () => {
  const id = wantId();
  const changed = id !== D.id;
  D.id = id || null;
  if (changed) { stopPoll(); D.cur = null; D.dirty = false; D.fq = ''; D.fshow = 60; D.msg = {}; D.chat = {busy: false, log: [], startedAt: null}; }
  D.loading = true; paint();
  await Promise.all([loadList().catch((e) => C.toast(e.message)), loadCur()]);
  await loadChat();
  if (!D.id && D.list?.length && !D.adding) { location.replace(`#/ppt/${encodeURIComponent(D.list[0].id)}`); return; } // open the first deck straight away
  D.loading = false; paint(); crumb();
  if (D.chat.busy) startPoll();
};
const crumb = () => { const c = $('#crumbs'); if (c) c.innerHTML = `<b>Visual PPT</b> · ${D.cur ? esc(D.cur.title) : 'browser slide decks'}`; };
export const decksCrumb = crumb;

// ---------- actions ----------
const collectDetails = () => {
  const root = $('#dk-details');
  const out = {
    title: $('[name=title]', root).value, description: $('[name=description]', root).value, notes: $('[name=notes]', root).value,
    links: [...root.querySelectorAll('.dk-lrow')].map((r) => ({label: $('[name=llabel]', r).value, url: $('[name=lurl]', r).value})),
  };
  if (online(D.cur)) out.url = $('[name=url]', root).value;
  else out.versions = [...root.querySelectorAll('.dk-ver')].map((r, i) => ({id: D.cur.versions[i]?.id, label: $('[name=vlabel]', r).value, file: $('[name=vfile]', r).value}));
  return out;
};
const refreshAfter = async (parts) => { // redraw only the cards that changed, so unsaved typing elsewhere stays
  await Promise.all([loadList(), loadCur()]);
  if (!D.cur) return paint();
  if (parts.includes('details')) repaint('dk-details', detailsHTML(D.cur));
  if (parts.includes('config')) repaint('dk-config', configHTML(D.cur));
  if (parts.includes('files')) repaint('dk-files', filesHTML(D.cur));
  if (parts.includes('ask')) { const keep = $('#dk-chatmsg')?.value ?? ''; repaint('dk-ask', askHTML(D.cur)); const m = $('#dk-chatmsg'); if (m) m.value = keep; }
  const items = $('.dk-items'); if (items) items.outerHTML = listHTML().match(/<nav class="dk-items">[\s\S]*<\/nav>/)[0];
  crumb();
};
const say = (key, id, text) => { D.msg[key] = text; const el = $(`#${id}`); if (el) el.textContent = text; };
const withDetailsEdits = (fn) => { const body = collectDetails(); fn(body); D.cur = {...D.cur, title: body.title, description: body.description, notes: body.notes, links: body.links.map((l) => ({label: l.label, url: l.url})), ...(online(D.cur) ? {url: body.url} : {versions: body.versions.map((v, i) => ({id: v.id ?? `v${i + 1}`, label: v.label, file: v.file}))})}; repaint('dk-details', detailsHTML(D.cur)); say('details', 'dk-save-msg', 'Not saved yet. Press Save details.'); };

const upload = async (files, folder, asName) => {
  if (!files.length || D.busy) return;
  const d = D.cur;
  const names = asName ? [asName] : files.map((f) => f.name);
  const clash = d.files.filter((x) => x.folder === folder && names.includes(x.name)).map((x) => x.name);
  if (clash.length && !asName && !confirm(`These files already exist and will be replaced:\n\n${clash.join('\n')}\n\nContinue?`)) return;
  const fd = new FormData();
  fd.append('folder', folder);
  files.forEach((f) => fd.append('files', f, asName ?? f.name));
  D.busy = 'upload'; say('files', 'dk-up-msg', `Uploading ${files.length} file${files.length === 1 ? '' : 's'}…`);
  try {
    const r = await C.api(`/api/decks/${encodeURIComponent(d.id)}/upload`, {method: 'POST', body: fd});
    D.busy = ''; D.msg.files = `Uploaded ${r.saved.length}${r.replaced.length ? ` (replaced ${r.replaced.length})` : ''}. Press View to see it.`;
    D.cur = r.deck; await loadList(); repaint('dk-files', filesHTML(D.cur)); paint();
    C.toast(`Uploaded ${r.saved.length} file${r.saved.length === 1 ? '' : 's'}.`);
  } catch (e) { D.busy = ''; D.msg.files = e.message; repaint('dk-files', filesHTML(D.cur)); C.toast(e.message); }
};

const saveConfig = async (andBuild) => {
  const d = D.cur, body = {};
  document.querySelectorAll('#dk-config [data-cfg]').forEach((i) => { const [g, k] = i.dataset.cfg.split('.'); (body[g] ??= {})[k] = i.type === 'number' ? Number(i.value) : i.value; });
  D.busy = 'build'; say('config', 'dk-cfg-msg', andBuild ? 'Saving, then rebuilding…' : 'Rebuilding…');
  document.querySelectorAll('#dk-config .btn').forEach((b) => (b.disabled = true));
  try {
    if (andBuild !== 'only') await C.api(`/api/decks/${encodeURIComponent(d.id)}/config`, {method: 'PUT', body});
    if (d.canBuild) { const r = await C.api(`/api/decks/${encodeURIComponent(d.id)}/build`, {method: 'POST'}); D.msg.config = `Saved and rebuilt in ${(r.ms / 1000).toFixed(1)}s. Press View (or refresh the open tab) to see it.`; }
    else D.msg.config = 'Saved.';
    if (andBuild === 'only') D.msg.config = D.msg.config.replace('Saved and rebuilt', 'Rebuilt');
    D.busy = ''; await refreshAfter(['config']);
  } catch (e) { D.busy = ''; D.msg.config = e.message; repaint('dk-config', configHTML(D.cur)); C.toast(e.message); }
};

const sendChat = async () => {
  const box = $('#dk-chatmsg'), message = box?.value.trim();
  if (!message || D.chat.busy) return;
  try {
    await C.api(`/api/decks/${encodeURIComponent(D.id)}/chat`, {method: 'POST', body: {message}});
    box.value = '';
    await loadChat(); D.chat.busy = true; D.chat.startedAt = D.chat.startedAt ?? Date.now();
    repaint('dk-ask', askHTML(D.cur)); startPoll();
  } catch (e) { C.toast(e.message); }
};

let wired = false;
const wire = () => {
  if (wired) return; wired = true;
  document.addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-dk]');
    if (!b || !inPage()) return;
    const a = b.dataset.dk, d = D.cur;
    if (a === 'add-toggle') { D.adding = !D.adding; D.err = ''; paint(); $('[data-dk-form=add] input')?.focus(); }
    else if (a === 'add-mode') { D.addMode = b.dataset.mode; D.err = ''; paint(); $('[data-dk-form=add] input')?.focus(); }
    else if (a === 'save') {
      try {
        say('details', 'dk-save-msg', 'Saving…');
        D.cur = await C.api(`/api/decks/${encodeURIComponent(d.id)}`, {method: 'PATCH', body: collectDetails()});
        D.dirty = false; D.msg.details = 'Saved.'; await refreshAfter(['details']); C.toast('Details saved.');
      } catch (e) { say('details', 'dk-save-msg', e.message); C.toast(e.message); }
    }
    else if (a === 'ver-add') { const f = $('#dk-newver')?.value; if (f) withDetailsEdits((body) => body.versions.push({label: f.replace(/\.html?$/i, ''), file: f})); }
    else if (a === 'ver-del') withDetailsEdits((body) => body.versions.splice(+b.dataset.i, 1));
    else if (a === 'link-add') withDetailsEdits((body) => body.links.push({label: '', url: ''}));
    else if (a === 'link-del') withDetailsEdits((body) => body.links.splice(+b.dataset.i, 1));
    else if (a === 'cfg-save') saveConfig(true);
    else if (a === 'build') saveConfig('only');
    else if (a === 'pick') $('#dk-file')?.click();
    else if (a === 'replace') { const r = $('#dk-replace'); r.dataset.path = b.dataset.path; r.click(); }
    else if (a === 'more') { D.fshow += 100; repaint('dk-files', filesHTML(d)); }
    else if (a === 'copy-path') { try { await navigator.clipboard.writeText(d.dir); C.toast('Folder path copied.'); } catch { C.toast(d.dir); } }
    else if (a === 'copy-link') { try { await navigator.clipboard.writeText(d.url); C.toast('Link copied.'); } catch { C.toast(d.url); } }
    else if (a === 'chat-send') sendChat();
    else if (a === 'chat-stop') { try { await C.api(`/api/decks/${encodeURIComponent(d.id)}/chat/stop`, {method: 'POST'}); C.toast('Asked Claude to stop.'); } catch (e) { C.toast(e.message); } }
    else if (a === 'chat-clear') {
      if (!confirm('Clear this conversation? The deck is not changed.')) return;
      try { await C.api(`/api/decks/${encodeURIComponent(d.id)}/chat`, {method: 'DELETE'}); D.chat = {busy: false, log: [], startedAt: null}; repaint('dk-ask', askHTML(d)); } catch (e) { C.toast(e.message); }
    }
    else if (a === 'remove') {
      if (!confirm(`Remove “${d.title}” from the Visual PPT list?\n\n${online(d) ? 'The online deck itself is not touched.' : 'The folder and all its files stay where they are.'}`)) return;
      try { await C.api(`/api/decks/${encodeURIComponent(d.id)}`, {method: 'DELETE'}); C.toast('Removed from the list.'); D.cur = null; D.id = null; location.hash = '#/ppt'; } catch (e) { C.toast(e.message); }
    }
  });
  document.addEventListener('submit', async (ev) => {
    const f = ev.target.closest('[data-dk-form=add]');
    if (!f) return;
    ev.preventDefault();
    try {
      const body = D.addMode === 'url' ? {url: f.url.value, title: f.title.value} : {dir: f.dir.value, title: f.title.value};
      const r = await C.api('/api/decks', {method: 'POST', body});
      D.adding = false; D.err = ''; location.hash = `#/ppt/${encodeURIComponent(r.id)}`; C.toast(`Added “${r.title}”.`);
    } catch (e) { D.err = e.message; paint(); }
  });
  document.addEventListener('change', (ev) => {
    if (!inPage()) return;
    if (ev.target.id === 'dk-file') { const fs = [...ev.target.files]; ev.target.value = ''; upload(fs, $('#dk-folder').value); }
    else if (ev.target.id === 'dk-replace') {
      const f = ev.target.files[0], p = ev.target.dataset.path || ''; ev.target.value = '';
      if (!f || !p) return;
      const i = p.lastIndexOf('/'), folder = i < 0 ? '' : p.slice(0, i), name = p.slice(i + 1);
      if (confirm(`Replace ${name} with ${f.name}?\n\nThe deck will use the new file under the old name.`)) upload([f], folder, name);
    }
  });
  document.addEventListener('input', (ev) => {
    if (!inPage()) return;
    if (ev.target.id === 'dk-fq') { D.fq = ev.target.value; D.fshow = 60; const pos = ev.target.selectionStart; repaint('dk-files', filesHTML(D.cur)); const q = $('#dk-fq'); q?.focus(); q?.setSelectionRange(pos, pos); }
    else if (ev.target.closest('#dk-details') && !D.dirty) { D.dirty = true; say('details', 'dk-save-msg', 'Unsaved changes'); }
  });
  document.addEventListener('keydown', (ev) => { if (inPage() && ev.target.id === 'dk-chatmsg' && ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); sendChat(); } });
  // drop files onto the upload box
  document.addEventListener('dragover', (ev) => { if (inPage() && ev.target.closest?.('#dk-drop')) { ev.preventDefault(); $('#dk-drop').classList.add('over'); } });
  document.addEventListener('dragleave', (ev) => { if (ev.target.closest?.('#dk-drop')) $('#dk-drop').classList.remove('over'); });
  document.addEventListener('drop', (ev) => {
    if (!inPage() || !ev.target.closest?.('#dk-drop')) return;
    ev.preventDefault(); $('#dk-drop').classList.remove('over');
    upload([...ev.dataTransfer.files], $('#dk-folder').value);
  });
};
wire();
