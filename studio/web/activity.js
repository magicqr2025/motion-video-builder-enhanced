// Activity panel: what the studio is doing right now, every process with its time / tokens / cost, and the saved log.
// Three tabs (Live, Processes, Log). Fed by the server over /api/events ('activity', 'process', 'tick') and, after a restart or
// for older days, from the files the server saves in studio/data/activity.
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const KIND = {ai: ['AI request', 'k-ai'], render: ['Render', 'k-render'], media: ['Media', 'k-media'], script: ['Script', 'k-script'], mp3: ['MP3', 'k-mp3'], stills: ['Stills', 'k-stills']};
const SRC = {ai: 'AI', render: 'Render', media: 'Media', script: 'Script', job: 'Job', save: 'Action', system: 'Studio', page: 'Page'};
const WHERE = {pc: ['this PC', 'This ran on your computer'], cloud: ['cloud', 'Answered by a remote AI service'], local: ['local model', 'Answered by a model on this computer'], lan: ['LAN', 'Answered by a model on your local network']};
const STATUS = {running: ['●', 'Running'], done: ['✓', 'Finished'], error: ['✕', 'Failed'], stopped: ['■', 'Stopped']};
const LOG_KINDS = [['all', 'All'], ['ai', 'AI'], ['render', 'Render'], ['media', 'Media & scripts'], ['save', 'Actions'], ['page', 'Page'], ['bad', 'Problems']];
const MAX_ROWS = 500;

const A = {
  entries: [], procs: new Map(), tick: null, lastSignal: Date.now(), connected: false, lastServerId: 0, localId: 0,
  ctx: () => ({}), raf: 0, observer: null, days: [], steps: {}, hist: null, q: '', logSource: 'live', open: new Set(),
  ui: {open: true, tall: false, tab: 'live', scope: 'project', sec: {}, pkind: 'all', pstatus: 'all', pwhen: 'today', lkind: 'all', ...LS.get('studio-activity-ui', {})},
};
const saveUi = () => LS.set('studio-activity-ui', A.ui);

// ---------- formatting ----------
const clock = (ms) => new Date(ms).toLocaleTimeString([], {hour12: false});
const dayKey = (ms) => new Date(ms).toLocaleDateString('en-CA');
const dayLabel = (ms) => { const d = dayKey(ms), t = dayKey(Date.now()), y = dayKey(Date.now() - 864e5); return d === t ? 'today' : d === y ? 'yesterday' : new Date(ms).toLocaleDateString([], {day: 'numeric', month: 'short'}); };
const fmtDur = (ms) => {
  if (ms == null) return '–';
  const s = Math.max(0, ms) / 1000;
  if (s < 10) return `${s.toFixed(1)}s`;
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`;
  return `${Math.floor(s / 3600)}h ${String(Math.floor(s / 60) % 60).padStart(2, '0')}m`;
};
const ago = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return s < 2 ? 'just now' : s < 90 ? `${s}s ago` : `${Math.round(s / 60)} min ago`; };
const tok = (n) => (n == null ? '–' : n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `${Math.round(n / 1e3)}k` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(n));
const money = (c) => (c ? `$${c < 1 ? c.toFixed(3) : c.toFixed(2)}` : '–');
const tIn = (p) => (p.tokens ? p.tokens.input + p.tokens.cacheWrite : null);
const tOut = (p) => (p.tokens ? p.tokens.output : null);
const tCache = (p) => (p.tokens ? p.tokens.cacheRead : null);
const dur = (p, now = Date.now()) => (p.status === 'running' ? now - p.startedAt : p.durationMs);

// ---------- scope helpers ----------
const projectOf = () => A.ctx().projectId ?? null;
const inScope = (projectId) => A.ui.scope === 'all' || !projectOf() || !projectId || projectId === projectOf();
const titleOf = (id) => (id ? A.ctx().projectTitle?.(id) ?? id : '');
const modelName = (m) => A.ctx().prettyModel?.(m) ?? m ?? '';
const allProcs = () => [...A.procs.values()].sort((a, b) => b.startedAt - a.startedAt);
const scopedProcs = () => allProcs().filter((p) => inScope(p.projectId));
const running = () => allProcs().filter((p) => p.status === 'running');

// ---------- small html bits ----------
const kindChip = (kind) => { const [l, c] = KIND[kind] ?? [kind, 'k-media']; return `<i class="chip ${c}">${esc(l)}</i>`; };
const whereChip = (w) => { const [l, tip] = WHERE[w] ?? []; return l ? `<i class="chip w-${esc(w)}" title="${esc(tip)}">${esc(l)}</i>` : ''; };
const modelChip = (m) => (m ? `<i class="chip m" title="Model used">${esc(modelName(m))}</i>` : '');
const statusDot = (s) => `<span class="st st-${esc(s)}" title="${esc(STATUS[s]?.[1] ?? s)}">${STATUS[s]?.[0] ?? '•'}</span>`;
const bar = (p) => `<div class="pbar"><i style="width:${Math.max(3, Math.round((p ?? 0) * 100))}%"></i></div>`;

// ---------- data in ----------
const upsert = (entry) => {
  const i = entry.id != null ? A.entries.findIndex((e) => e.id === entry.id) : -1;
  if (i >= 0) A.entries[i] = entry; else A.entries.push(entry);
  if (typeof entry.id === 'number') A.lastServerId = Math.max(A.lastServerId, entry.id);
  if (A.entries.length > MAX_ROWS * 2) A.entries.splice(0, A.entries.length - MAX_ROWS * 2);
  schedule();
};

/** A line made by the page itself (clicks, navigation, errors, connection state). */
export const note = (text, {level = 'info', source = 'page', projectId = null} = {}) => {
  const last = A.entries.at(-1);
  if (last && typeof last.id === 'string' && last.text === text && Date.now() - last.ts < 2500) { last.n = (last.n ?? 1) + 1; last.ts = Date.now(); schedule(); return; }
  upsert({id: `L${++A.localId}`, ts: Date.now(), level, source, projectId: projectId ?? A.ctx().projectId ?? null, text, tool: null, where: 'pc'});
};

const syncAll = async () => {
  try {
    const [h, p, d] = await Promise.all([fetch(`/api/activity?since=${A.lastServerId}`).then((r) => r.json()), fetch('/api/processes').then((r) => r.json()), fetch('/api/activity/days').then((r) => r.json())]);
    for (const e of h.entries) upsert(e);
    for (const x of [...p.finished, ...p.running]) A.procs.set(x.id, x);
    A.days = d.days ?? [];
    schedule();
  } catch {}
};

export const setConnection = (ok) => {
  if (A.connected === ok && A.entries.length) return;
  const was = A.connected;
  A.connected = ok;
  if (ok) { A.lastSignal = Date.now(); note(was ? 'Reconnected to the studio server.' : 'Connected to the studio server.', {level: 'ok', source: 'system', projectId: null}); syncAll(); }
  else note('Lost the connection to the studio server. Retrying automatically…', {level: 'error', source: 'system', projectId: null});
  schedule();
};

export const onServerEvent = (e) => {
  A.lastSignal = Date.now();
  if (!A.connected) A.connected = true;
  if (e.type === 'activity') { upsert(e.entry); return true; }
  if (e.type === 'process') { A.procs.set(e.process.id, e.process); if (e.process.status !== 'running') delete A.steps[e.process.id]; schedule(); return true; }
  if (e.type === 'tick') {
    A.tick = e;
    for (const p of e.procs ?? []) if (!A.procs.has(p.id) || A.procs.get(p.id).status === 'running') A.procs.set(p.id, p);
    schedule();
    return true;
  }
  return false;
};

// ---------- bar (always visible) ----------
const status = () => {
  const now = Date.now(), {aiName = 'The AI', aiTag} = A.ctx(), t = A.tick;
  const silent = now - A.lastSignal;
  if (!A.connected || silent > 15000) return {tone: 'bad', text: silent > 15000 && A.connected ? `No signal from the studio server for ${fmtDur(silent)}. It may have stopped; check the Video Studio window.` : 'Lost the connection to the studio server. Retrying…'};
  if (!t) return {tone: 'idle', text: 'Connected. Waiting for the first status update…'};
  const r = running();
  if (!r.length) {
    const last = allProcs().find((p) => p.status !== 'running');
    return {tone: 'idle', text: last ? `Idle · last: ${last.label} (${STATUS[last.status][1].toLowerCase()} in ${fmtDur(last.durationMs)}, ${ago(now - last.endedAt)})` : 'Idle. Nothing is running.'};
  }
  const pick = r.find((p) => p.projectId === projectOf()) ?? r[0], more = r.length > 1 ? ` (+${r.length - 1} more)` : '';
  if (pick.kind === 'ai') {
    const b = t.busy?.find((x) => x.projectId === pick.projectId);
    const quiet = now - (b?.lastAt ?? pick.startedAt);
    const where = pick.projectId === projectOf() ? '' : ` on “${titleOf(pick.projectId)}”`;
    return {tone: quiet > 60000 ? 'warn' : 'busy', text: `${aiTag || aiName} is working${where}${more} · ${fmtDur(now - pick.startedAt)} · ${quiet > 60000 ? `no new output for ${fmtDur(quiet)}. Still running; press Stop if it looks stuck` : `last step ${ago(quiet)}`}`};
  }
  const pct = pick.progress != null ? ` · ${Math.round(pick.progress * 100)}%` : '';
  return {tone: 'busy', text: `${KIND[pick.kind]?.[0] ?? pick.kind}: ${pick.label}${pct} · ${fmtDur(now - pick.startedAt)}${more}`};
};

const todayStats = (list) => {
  const start = new Date().setHours(0, 0, 0, 0), now = Date.now();
  const rows = list.filter((p) => p.startedAt >= start);
  const s = {n: rows.length, ms: 0, base: 0, starts: [], in: 0, out: 0, cache: 0, cost: 0};
  for (const p of rows) {
    if (p.status === 'running') s.starts.push(p.startedAt); else s.base += p.durationMs ?? 0;
    s.in += tIn(p) ?? 0; s.out += tOut(p) ?? 0; s.cache += tCache(p) ?? 0; s.cost += p.cost ?? 0;
  }
  s.ms = s.base + s.starts.reduce((a, t) => a + (now - t), 0);
  return s;
};

const paintBar = () => {
  const dock = $('#dock');
  if (!dock) return;
  const s = status();
  dock.dataset.tone = s.tone;
  $('#dock-state').textContent = s.text;
  $('#dock-state').title = s.text;
  const chip = $('#dock-ai'), {aiChip} = A.ctx();
  if (chip) { chip.hidden = !aiChip; if (aiChip) { chip.textContent = aiChip.text; chip.title = aiChip.title; chip.dataset.where = aiChip.where; } }
  const st = todayStats(scopedProcs());
  $('#dock-today').textContent = st.n ? `Today: ${st.n} process${st.n === 1 ? '' : 'es'} · ${fmtDur(st.ms)} · ${tok(st.in + st.out)} tokens${st.cost ? ` · ${money(st.cost)}` : ''}` : 'Today: nothing yet';
  const silent = Date.now() - A.lastSignal;
  $('#dock-signal').textContent = A.connected ? (silent < 7000 ? '● live' : `updated ${ago(silent)}`) : '○ offline';
  const n = running().length;
  const pc = $('#dock-pc'); if (pc) pc.textContent = n ? `${n} running` : '';
};

// ---------- LIVE tab ----------
const SECS = [['now', 'Running now'], ['today', 'Today'], ['steps', 'Latest steps']];
const buildLive = () => {
  $('#dock-pane').innerHTML = `<div class="lv">${SECS.map(([k, t]) => `<details class="pnl" data-sec="${k}" ${A.ui.sec[k] === false ? '' : 'open'}><summary><span class="pnl-t">${t}</span><span class="pnl-n" id="lv-n-${k}"></span><span class="pnl-c">▾</span></summary><div class="pnl-b" id="lv-${k}"></div></details>`).join('')}</div>`;
};
const stepRow = (e) => `<div class="lr ${esc(e.level)}"><time>${clock(e.ts)}</time>${tagChips(e)}<span class="tx">${esc(e.text)}</span>${e.n > 1 ? `<b class="n">×${e.n}</b>` : ''}</div>`;
const tagChips = (e) => `<i class="chip s-${esc(e.source)}" title="${esc(SRC[e.source] ?? e.source)}">${esc(e.tool || SRC[e.source] || e.source)}</i>${whereChip(e.where)}`;

const updateLive = () => {
  const now = Date.now(), r = running().filter((p) => inScope(p.projectId));
  $('#lv-n-now').textContent = r.length ? `${r.length}` : '';
  $('#lv-now').innerHTML = r.length ? r.map((p) => {
    const last = [...A.entries].reverse().find((e) => e.processId === p.id);
    const stop = p.kind === 'ai' || p.kind === 'render';
    return `<div class="rc"><div class="rc-top">${kindChip(p.kind)}<b class="rc-title">${esc(p.label)}</b><span class="rc-time" data-since="${p.startedAt}">${fmtDur(now - p.startedAt)}</span></div>
      <div class="rc-meta">${modelChip(p.model)}${whereChip(p.where)}${p.projectId ? `<span>${esc(titleOf(p.projectId))}</span>` : ''}<span>${p.steps} step${p.steps === 1 ? '' : 's'}</span>${p.stage ? `<span>${esc(p.stage)}</span>` : ''}</div>
      ${p.progress != null ? bar(p.progress) : ''}
      ${last ? `<div class="rc-last">${esc(last.text)}</div>` : ''}
      ${stop ? `<div class="rc-act"><button type="button" class="abtn danger" data-stop="${p.kind}" data-project="${esc(p.projectId ?? '')}">■ Stop</button></div>` : ''}</div>`;
  }).join('') : '<div class="empty">Nothing is running right now.</div>';

  const st = todayStats(scopedProcs());
  const by = {};
  for (const p of scopedProcs().filter((x) => x.startedAt >= new Date().setHours(0, 0, 0, 0))) { const b = (by[p.kind] ??= {n: 0, ms: 0, tok: 0, cost: 0}); b.n++; b.ms += dur(p, now) ?? 0; b.tok += (tIn(p) ?? 0) + (tOut(p) ?? 0); b.cost += p.cost ?? 0; }
  $('#lv-n-today').textContent = st.n ? `${st.n}` : '';
  $('#lv-today').innerHTML = `<div class="tiles">
      <div class="tile"><small>Processes</small><b>${st.n}</b></div>
      <div class="tile"><small>Total time</small><b id="tile-time" data-base="${st.base}" data-starts="${st.starts.join(',')}">${fmtDur(st.ms)}</b></div>
      <div class="tile"><small>Tokens in</small><b>${tok(st.in)}</b></div>
      <div class="tile"><small>Tokens out</small><b>${tok(st.out)}</b></div>
      <div class="tile" title="Re-read from the cache: much cheaper than new input"><small>From cache</small><b>${tok(st.cache)}</b></div>
      <div class="tile"><small>Cost</small><b>${money(st.cost)}</b></div></div>
    ${Object.keys(by).length ? `<table class="mini"><thead><tr><th>Type</th><th>Count</th><th>Time</th><th>Tokens</th><th>Cost</th></tr></thead><tbody>${Object.entries(by).map(([k, b]) => `<tr><td>${kindChip(k)}</td><td>${b.n}</td><td>${fmtDur(b.ms)}</td><td>${b.tok ? tok(b.tok) : '–'}</td><td>${money(b.cost)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">No processes yet today.</div>'}`;

  const lines = A.entries.filter((e) => e.source !== 'page' && inScope(e.projectId)).slice(-8).reverse();
  $('#lv-n-steps').textContent = '';
  $('#lv-steps').innerHTML = lines.length ? lines.map(stepRow).join('') : '<div class="empty">No steps yet.</div>';
};

// ---------- PROCESSES tab ----------
const WHENS = [['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'Last 7 days'], ['all', 'All saved']];
const buildProcs = () => {
  $('#dock-pane').innerHTML = `<div class="pt">
    <div class="tbar"><div class="chips" id="pt-kinds"></div>
      <select id="pt-status" aria-label="Status">${[['all', 'Any status'], ['running', 'Running'], ['done', 'Finished'], ['error', 'Failed'], ['stopped', 'Stopped']].map(([v, l]) => `<option value="${v}" ${A.ui.pstatus === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <select id="pt-when" aria-label="When">${WHENS.map(([v, l]) => `<option value="${v}" ${A.ui.pwhen === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <span class="sp"></span><a class="abtn" href="/api/processes.csv" download title="Every saved process as a spreadsheet file">⬇ Export CSV</a></div>
    <div class="pt-wrap"><div class="ptable" id="pt-table"></div></div><div class="pt-foot" id="pt-foot"></div></div>`;
};
const whenOk = (p) => {
  const w = A.ui.pwhen, today = new Date().setHours(0, 0, 0, 0);
  return w === 'all' || (w === 'today' && p.startedAt >= today) || (w === 'yesterday' && p.startedAt >= today - 864e5 && p.startedAt < today) || (w === 'week' && p.startedAt >= today - 6 * 864e5);
};
const filteredProcs = () => scopedProcs().filter((p) => (A.ui.pkind === 'all' || p.kind === A.ui.pkind) && (A.ui.pstatus === 'all' || p.status === A.ui.pstatus) && whenOk(p));

const stepsHtml = (p) => {
  const rows = p.status === 'running' ? A.entries.filter((e) => e.processId === p.id) : A.steps[p.id];
  if (!rows) return '<div class="empty">Loading the saved steps…</div>';
  if (!rows.length) return '<div class="empty">No steps were recorded for this process.</div>';
  const end = p.endedAt ?? Date.now();
  return `<div class="steps">${rows.map((e, i) => { const next = rows[i + 1]?.ts ?? end; return `<div class="lr ${esc(e.level)}"><time title="${new Date(e.ts).toLocaleString()}">+${fmtDur(e.ts - p.startedAt)}</time>${tagChips(e)}<span class="tx">${esc(e.text)}</span><b class="n" title="Time until the next step">${fmtDur(Math.max(0, next - e.ts))}</b></div>`; }).join('')}</div>`;
};
const stepsBusy = new Set();
const loadSteps = async (p) => {
  if (p.status === 'running' || A.steps[p.id] || stepsBusy.has(p.id)) return;
  stepsBusy.add(p.id);
  try {
    const r = await (await fetch(`/api/activity/history?day=${dayKey(p.startedAt)}&process=${encodeURIComponent(p.id)}`)).json();
    A.steps[p.id] = r.entries ?? [];
  } catch { A.steps[p.id] = []; }
  stepsBusy.delete(p.id);
  if (A.ui.tab === 'procs') schedule();
};

const updateProcs = () => {
  const now = Date.now(), all = scopedProcs().filter(whenOk).filter((p) => A.ui.pstatus === 'all' || p.status === A.ui.pstatus);
  const counts = Object.fromEntries(Object.keys(KIND).map((k) => [k, all.filter((p) => p.kind === k).length]));
  $('#pt-kinds').innerHTML = [['all', 'All', all.length], ...Object.entries(KIND).filter(([k]) => counts[k]).map(([k, [l]]) => [k, l, counts[k]])].map(([k, l, n]) => `<button type="button" class="fchip ${A.ui.pkind === k ? 'on' : ''}" data-pkind="${k}">${l} <b>${n}</b></button>`).join('');
  const rows = filteredProcs();
  const head = '<div class="prow phead"><span></span><span>Process</span><span>Type</span><span>Model · where</span><span>Started</span><span class="r">Time</span><span class="r" title="New input tokens (cache writes included)">In</span><span class="r">Out</span><span class="r" title="Tokens re-read from the cache">Cached</span><span class="r">Cost</span></div>';
  $('#pt-table').innerHTML = head + (rows.length ? rows.map((p) => {
    const open = A.open.has(p.id);
    return `<div class="prow ${open ? 'open' : ''}" data-row="${p.id}" role="button" tabindex="0" aria-expanded="${open}">
        ${statusDot(p.status)}
        <span class="pl"><b>${esc(p.label)}</b><small>${esc(titleOf(p.projectId))}${p.error ? ` · ${esc(p.error.slice(0, 80))}` : ''}</small></span>
        <span>${kindChip(p.kind)}</span><span class="pm">${modelChip(p.model)}${whereChip(p.where)}</span>
        <span class="pw">${clock(p.startedAt)}<small>${dayLabel(p.startedAt)}</small></span>
        <span class="r bold" ${p.status === 'running' ? `data-since="${p.startedAt}"` : ''}>${fmtDur(dur(p, now))}</span>
        <span class="r" title="${p.tokens ? `${p.tokens.input} new + ${p.tokens.cacheWrite} cache writes` : ''}">${tok(tIn(p))}</span><span class="r">${tok(tOut(p))}</span><span class="r">${tok(tCache(p))}</span><span class="r">${money(p.cost)}</span></div>
      ${open ? `<div class="pdet" data-det="${p.id}">${p.status === 'error' && p.error ? `<div class="perr">${esc(p.error)}</div>` : ''}<div class="pdet-h">Steps${p.steps ? ` (${p.steps})` : ''}</div>${stepsHtml(p)}</div>` : ''}`;
  }).join('') : '<div class="empty" style="padding:22px">No processes match these filters.</div>');
  const t = rows.reduce((a, p) => ({ms: a.ms + (dur(p, now) ?? 0), in: a.in + (tIn(p) ?? 0), out: a.out + (tOut(p) ?? 0), cache: a.cache + (tCache(p) ?? 0), cost: a.cost + (p.cost ?? 0)}), {ms: 0, in: 0, out: 0, cache: 0, cost: 0});
  $('#pt-foot').innerHTML = `<b>${rows.length}</b> process${rows.length === 1 ? '' : 'es'} <span>·</span> time <b>${fmtDur(t.ms)}</b> <span>·</span> in <b>${tok(t.in)}</b> <span>·</span> out <b>${tok(t.out)}</b> <span>·</span> cached <b>${tok(t.cache)}</b> <span>·</span> cost <b>${money(t.cost)}</b> <span class="saved">Saved on this PC: studio/data/activity</span>`;
};

// ---------- LOG tab ----------
const buildLog = () => {
  $('#dock-pane').innerHTML = `<div class="lg">
    <div class="tbar"><label class="inl">Show <select id="lg-src"></select></label><div class="chips" id="lg-kinds"></div>
      <input id="lg-q" type="search" placeholder="Search the log…" value="${esc(A.q)}" aria-label="Search the log" />
      <span class="sp"></span><button type="button" class="abtn" id="lg-copy" title="Copy the lines shown">Copy</button><button type="button" class="abtn" id="lg-clear" title="Hides the lines shown. Nothing is deleted: they stay saved on disk.">Clear view</button></div>
    <details class="guide"><summary>What do the tags mean?</summary><div class="guide-b">
      <div><i class="chip s-ai">Edit</i><i class="chip s-ai">Bash</i><i class="chip s-ai">reply</i> what the AI did: a tool it used, or a message it wrote</div>
      <div><i class="chip s-render">Render</i><i class="chip s-media">Media</i><i class="chip s-save">Action</i><i class="chip s-page">Page</i> which part of the studio wrote the line</div>
      <div><i class="chip w-pc">this PC</i> ran on your computer (files, commands, renders) &nbsp; <i class="chip w-cloud">cloud</i> answered by the remote AI service &nbsp; <i class="chip w-local">local model</i> answered by a model on this machine</div>
      <div><b>Colours:</b> <span class="lvl ok">green = finished</span> · <span class="lvl warn">amber = take note</span> · <span class="lvl error">red = problem</span></div></div></details>
    <div class="lg-list" id="lg-list" role="log"></div></div>`;
};
let qTimer = null;
const loadHistory = async () => {
  if (A.logSource === 'live') return;
  A.histBusy = true; schedule();
  try {
    const proj = A.ui.scope === 'project' && projectOf() ? `&project=${encodeURIComponent(projectOf())}` : '';
    A.hist = await (await fetch(`/api/activity/history?day=${A.logSource}${proj}&q=${encodeURIComponent(A.q)}`)).json();
  } catch { A.hist = {entries: [], total: 0, day: A.logSource}; }
  A.histBusy = false; schedule();
};
const logRows = () => {
  const src = A.logSource === 'live' ? A.entries : (A.hist?.entries ?? []);
  const k = A.ui.lkind, q = A.q.trim().toLowerCase();
  return src.filter((e) => inScope(e.projectId) && (k === 'all' || (k === 'bad' ? e.level === 'error' || e.level === 'warn' : k === 'media' ? ['media', 'script', 'job'].includes(e.source) : e.source === k))
    && (A.logSource !== 'live' || !q || `${e.text} ${e.tool ?? ''} ${e.source}`.toLowerCase().includes(q))).sort((a, b) => a.ts - b.ts).slice(-MAX_ROWS);
};
const updateLog = () => {
  const src = $('#lg-src');
  const opts = `<option value="live">Live feed (this session)</option>${A.days.map((d) => `<option value="${d}">${d === dayKey(Date.now()) ? `Today (saved) · ${d}` : `${d} (saved)`}</option>`).join('')}`;
  if (src.dataset.sig !== opts) { src.innerHTML = opts; src.dataset.sig = opts; } // only when the list changes, so an open dropdown is not closed
  src.value = A.logSource;
  $('#lg-kinds').innerHTML = LOG_KINDS.map(([k, l]) => `<button type="button" class="fchip ${A.ui.lkind === k ? 'on' : ''}" data-lkind="${k}">${l}</button>`).join('');
  const list = $('#lg-list'), rows = logRows();
  const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 50;
  list.innerHTML = A.histBusy ? '<div class="empty">Loading the saved log…</div>' : rows.length ? rows.map((e) => `<div class="lr ${esc(e.level)}"><time title="${new Date(e.ts).toLocaleString()}">${clock(e.ts)}</time>${tagChips(e)}<span class="tx">${esc(e.text)}</span>${e.n > 1 ? `<b class="n">×${e.n}</b>` : ''}</div>`).join('') : '<div class="empty">Nothing here yet. Everything the studio does appears as it happens, and is saved.</div>';
  if (atBottom || A.logSource !== 'live') list.scrollTop = list.scrollHeight;
};

// ---------- paint ----------
const TABS = {live: [buildLive, updateLive], procs: [buildProcs, updateProcs], log: [buildLog, updateLog]};
let built = null;
const paintAll = () => {
  A.raf = 0;
  paintBar();
  document.querySelectorAll('[data-dock-tab]').forEach((b) => b.classList.toggle('on', b.dataset.dockTab === A.ui.tab));
  document.querySelectorAll('[data-dock-scope]').forEach((b) => b.classList.toggle('on', b.dataset.dockScope === A.ui.scope));
  if (A.ui.open) {
    const [build, update] = TABS[A.ui.tab] ?? TABS.live;
    if (built !== A.ui.tab) { build(); built = A.ui.tab; }
    update();
    if (A.ui.tab === 'procs') for (const id of A.open) { const p = A.procs.get(id); if (p) loadSteps(p); }
  }
  paintLive();
  A.observer?.takeRecords();
};
const schedule = () => { if (!A.raf) A.raf = requestAnimationFrame(paintAll); };
export const refreshContext = () => schedule();

/** Fills the small "what is it doing" boxes inside waiting cards (Concepts, Build). */
export const paintLive = () => {
  const {projectId} = A.ctx(), now = Date.now();
  const mine = A.entries.filter((e) => e.projectId === projectId && e.source !== 'page' && e.source !== 'save');
  const b = A.tick?.busy?.find((x) => x.projectId === projectId);
  document.querySelectorAll('[data-live-steps]').forEach((el) => {
    const rows = mine.slice(-5);
    el.innerHTML = rows.length ? rows.map((e) => `<div class="ls ${esc(e.level)}"><time>${clock(e.ts)}</time><span>${esc(e.text)}</span></div>`).join('') : '<div class="ls"><span>Waiting for the first step…</span></div>';
  });
  document.querySelectorAll('[data-live-last]').forEach((el) => { const e = mine.at(-1); el.textContent = e ? e.text : 'Starting…'; });
  document.querySelectorAll('[data-live-elapsed]').forEach((el) => { el.textContent = b ? fmtDur(now - b.startedAt) : '0:00'; });
  document.querySelectorAll('[data-live-quiet]').forEach((el) => {
    const quiet = b ? now - (b.lastAt ?? b.startedAt) : 0;
    el.textContent = b ? (quiet > 60000 ? `No new output for ${fmtDur(quiet)}. Still running; press Stop if it looks stuck.` : `Last step ${ago(quiet)}`) : '';
    el.classList.toggle('warn', quiet > 60000);
  });
};

// ---------- open / close / size ----------
const applyShell = () => {
  document.body.classList.toggle('dock-open', A.ui.open);
  document.body.classList.toggle('dock-tall', A.ui.open && A.ui.tall);
  $('#dock-body').hidden = !A.ui.open;
  $('#dock-bar').setAttribute('aria-expanded', String(A.ui.open));
  const t = $('#ni-dock'); if (t) t.textContent = A.ui.open ? 'Panel is open · click to hide' : 'Panel is hidden · click to show';
  const sz = $('#dock-size'); if (sz) { sz.textContent = A.ui.tall ? '⤡ Shorter' : '⤢ Taller'; sz.hidden = !A.ui.open; }
};
const setOpen = (open) => { A.ui.open = open; saveUi(); built = null; applyShell(); schedule(); };

export const initActivity = (getCtx) => {
  A.ctx = getCtx;
  applyShell();
  const bar = $('#dock-bar');
  bar.addEventListener('click', (e) => { if (e.target.closest('button')) return; setOpen(!A.ui.open); });
  bar.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button')) { e.preventDefault(); setOpen(!A.ui.open); } });
  $('#dock-size').addEventListener('click', () => { A.ui.tall = !A.ui.tall; saveUi(); applyShell(); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-action="toggle-dock"]')) setOpen(!A.ui.open); });

  // tabs and scope
  $('.dock-top').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-dock-tab]'), sc = e.target.closest('[data-dock-scope]');
    if (tab) { A.ui.tab = tab.dataset.dockTab; saveUi(); built = null; schedule(); }
    if (sc) { A.ui.scope = sc.dataset.dockScope; saveUi(); if (A.logSource !== 'live') loadHistory(); schedule(); }
  });

  // everything inside the pane is delegated, because the pane is rebuilt when the tab changes
  const pane = $('#dock-pane');
  pane.addEventListener('click', async (e) => {
    const stop = e.target.closest('[data-stop]'), pk = e.target.closest('[data-pkind]'), lk = e.target.closest('[data-lkind]'), row = e.target.closest('[data-row]');
    if (stop) {
      stop.disabled = true;
      try { await fetch(stop.dataset.stop === 'render' ? '/api/render/cancel' : `/api/projects/${encodeURIComponent(stop.dataset.project)}/stop`, {method: 'POST'}); note(stop.dataset.stop === 'render' ? 'Asked the render to cancel.' : 'Asked the AI to stop.'); } catch { stop.disabled = false; }
    } else if (pk) { A.ui.pkind = pk.dataset.pkind; saveUi(); schedule(); }
    else if (lk) { A.ui.lkind = lk.dataset.lkind; saveUi(); schedule(); }
    else if (row) { A.open.has(row.dataset.row) ? A.open.delete(row.dataset.row) : A.open.add(row.dataset.row); schedule(); }
    else if (e.target.closest('#lg-copy')) {
      const text = logRows().map((x) => `${clock(x.ts)} [${x.tool || SRC[x.source] || x.source}${x.where ? ` @${x.where}` : ''}] ${x.level === 'error' ? 'ERROR ' : ''}${x.text}${x.n > 1 ? ` (x${x.n})` : ''}`).join('\n');
      try { await navigator.clipboard.writeText(text); note('Copied the log to the clipboard.', {source: 'system'}); } catch { note('Could not copy the log (clipboard blocked).', {level: 'warn', source: 'system'}); }
    } else if (e.target.closest('#lg-clear')) {
      const ids = new Set(logRows().map((x) => x.id));
      if (A.logSource === 'live') A.entries = A.entries.filter((x) => !ids.has(x.id)); else A.hist = {...A.hist, entries: []};
      schedule();
    }
  });
  pane.addEventListener('keydown', (e) => { const row = e.target.closest?.('[data-row]'); if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); row.click(); } });
  pane.addEventListener('change', (e) => {
    if (e.target.id === 'pt-status') { A.ui.pstatus = e.target.value; saveUi(); schedule(); }
    else if (e.target.id === 'pt-when') { A.ui.pwhen = e.target.value; saveUi(); schedule(); }
    else if (e.target.id === 'lg-src') { A.logSource = e.target.value; A.hist = null; if (A.logSource !== 'live') loadHistory(); schedule(); }
  });
  pane.addEventListener('input', (e) => {
    if (e.target.id !== 'lg-q') return;
    A.q = e.target.value;
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { if (A.logSource !== 'live') loadHistory(); else schedule(); }, 250);
  });
  // remember which sections are folded
  pane.addEventListener('toggle', (e) => { const k = e.target.dataset?.sec; if (k) { A.ui.sec[k] = e.target.open; saveUi(); } }, true);

  // clocks tick once a second without redrawing anything
  setInterval(() => {
    paintBar(); paintLive();
    const now = Date.now();
    document.querySelectorAll('#dock [data-since]').forEach((el) => { el.textContent = fmtDur(now - Number(el.dataset.since)); });
    const tt = $('#tile-time');
    if (tt) tt.textContent = fmtDur(Number(tt.dataset.base) + (tt.dataset.starts ? tt.dataset.starts.split(',').reduce((a, t) => a + (now - Number(t)), 0) : 0));
    A.observer?.takeRecords();
  }, 1000);

  // waiting cards are drawn by the tabs of the page; fill them as soon as they appear (our own repaints are discarded in paintAll)
  const main = $('#main');
  if (main) { A.observer = new MutationObserver(() => schedule()); A.observer.observe(main, {childList: true, subtree: true}); }
  syncAll();
  schedule();
};
