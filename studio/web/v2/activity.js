// Activity: what the studio is doing now (Live), everything that ran (Processes) and the full day log (Log).
import {$, S, api, esc, toast, dur, pill} from './core.js';

const A = {tab: 'live', procs: {running: [], finished: []}, entries: [], days: [], day: '', q: '', project: '', kind: 'all', status: 'all', log: null, timer: null};
const TABS = [['live', 'Live'], ['procs', 'Processes'], ['log', 'Log']];
const title = (id) => S.state?.projects?.find((p) => p.id === id)?.title ?? id ?? '';
const hm = (t) => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
const kTok = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(n ?? 0));
const TONE = {error: 'red', ok: 'mint', warn: 'amber', info: 'dim'};
const sameDay = (t) => new Date(t).toDateString() === new Date().toDateString();

const procRow = (p) => `<tr><td><b>${esc(p.label)}</b><div class="small muted">${esc(title(p.projectId))}</div></td><td>${pill(p.kind, p.kind === 'ai' ? 'violet' : p.kind === 'render' ? 'amber' : 'dim')}</td><td>${p.model ? esc(p.model) : ''}${p.where ? ` <span class="dim">· ${esc(p.where)}</span>` : ''}</td>
  <td class="num">${hm(p.startedAt)}</td><td class="num">${p.status === 'running' ? `<span class="row" style="gap:6px"><i class="live"></i>${dur(Date.now() - p.startedAt)}</span>` : dur(p.durationMs ?? 0)}</td><td class="num">${p.tokens ? kTok(p.tokens.input) : '–'}</td><td class="num">${p.tokens ? kTok(p.tokens.output) : '–'}</td><td class="num">${p.cost ? `$${p.cost.toFixed(3)}` : '–'}</td>
  <td>${p.status === 'running' ? pill('running', 'mint', true) : pill(p.status, p.status === 'done' ? 'mint' : p.status === 'error' ? 'red' : 'dim')}</td></tr>`;
const procTable = (rows, empty) => (rows.length ? `<div class="tw"><table class="atable"><thead><tr><th>Process</th><th>Type</th><th>Model · where</th><th class="num">Started</th><th class="num">Time</th><th class="num">In</th><th class="num">Out</th><th class="num">Cost</th><th>Status</th></tr></thead><tbody>${rows.map(procRow).join('')}</tbody></table></div>` : `<div class="small muted" style="padding:16px 4px">${empty}</div>`);

const liveHtml = () => {
  const running = S.live.procs?.length ? S.live.procs : A.procs.running, today = A.procs.finished.filter((p) => sameDay(p.startedAt));
  const ms = today.reduce((a, p) => a + (p.durationMs || 0), 0), tok = today.reduce((a, p) => a + (p.tokens?.input || 0) + (p.tokens?.output || 0), 0), cost = today.reduce((a, p) => a + (p.cost || 0), 0);
  return `<div class="wrap"><div class="card" style="flex:1 1 220px"><span class="muted">Running now</span><div class="big" style="font-size:56px">${running.length}</div></div><div class="card" style="flex:1 1 220px"><span class="muted">Today</span><div class="big" style="font-size:56px">${today.length}</div><div class="small muted">${dur(ms)} of work · ${kTok(tok)} tokens${cost ? ` · about $${cost.toFixed(2)}` : ''}</div></div>
    <div class="card" style="flex:2 1 340px"><div class="spread"><b>Heartbeat</b>${pill(S.conn ? 'connected' : 'reconnecting', S.conn ? 'mint' : 'red', S.conn)}</div>${S.live.media ? `<div class="small" style="margin-top:8px">${esc(S.live.media.text)}</div>` : '<div class="small muted" style="margin-top:8px">No background media job.</div>'}</div></div>
    <div class="card"><h3 style="margin-bottom:8px">Running</h3>${procTable(running, 'Nothing is running right now.')}</div>
    <div class="card"><h3 style="margin-bottom:10px">Latest activity</h3><div class="logbox">${A.entries.slice(-14).reverse().map((e) => `<span><time>${hm(e.ts)}</time>${e.projectId ? `<b class="dim">${esc(title(e.projectId))}</b> · ` : ''}${esc(e.text)}${e.n > 1 ? ` <span class="dim">×${e.n}</span>` : ''}</span>`).join('') || '<span class="muted">No activity yet.</span>'}</div></div>`;
};
const procsHtml = () => {
  const all = [...A.procs.running, ...[...A.procs.finished].reverse()];
  const rows = all.filter((p) => (A.kind === 'all' || p.kind === A.kind) && (A.status === 'all' || p.status === A.status) && (!A.project || p.projectId === A.project));
  const opt = (v, l, cur) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`;
  return `<div class="card"><div class="row" style="margin-bottom:12px"><select class="in" style="width:auto" data-af="kind" aria-label="Type">${[['all', 'All types'], ['ai', 'AI'], ['media', 'Media'], ['render', 'Render']].map(([v, l]) => opt(v, l, A.kind)).join('')}</select>
    <select class="in" style="width:auto" data-af="status" aria-label="Status">${[['all', 'Any status'], ['running', 'Running'], ['done', 'Done'], ['error', 'Error'], ['stopped', 'Stopped']].map(([v, l]) => opt(v, l, A.status)).join('')}</select>
    <select class="in" style="width:auto;max-width:260px" data-af="project" aria-label="Video"><option value="">All videos</option>${S.state.projects.map((p) => opt(p.id, p.title, A.project)).join('')}</select><span class="small muted">${rows.length} shown</span><a class="btn sm" style="margin-left:auto" href="/api/processes.csv" download>⭳ Export CSV</a></div>${procTable(rows.slice(0, 300), 'Nothing matches.')}</div>`;
};
const logHtml = () => `<div class="card"><div class="row" style="margin-bottom:12px"><select class="in" style="width:auto" data-al="day" aria-label="Day">${(A.days.length ? A.days : [new Date().toLocaleDateString('en-CA')]).map((d) => `<option ${d === A.day ? 'selected' : ''}>${d}</option>`).join('')}</select>
  <select class="in" style="width:auto;max-width:260px" data-al="project" aria-label="Video"><option value="">All videos</option>${S.state.projects.map((p) => `<option value="${esc(p.id)}" ${p.id === A.project ? 'selected' : ''}>${esc(p.title)}</option>`).join('')}</select>
  <input class="in" type="search" data-al="q" placeholder="Search the log…" value="${esc(A.q)}" style="max-width:280px;border-radius:99px" /><span class="small muted">${A.log ? `${A.log.total} line${A.log.total === 1 ? '' : 's'}` : ''}</span></div>
  <div class="logbox" style="max-height:640px;overflow:auto">${A.log ? (A.log.entries.length ? [...A.log.entries].reverse().map((e) => `<span title="${esc(e.text)}"><time>${hm(e.ts)}</time>${pill(e.source, TONE[e.level] ?? 'dim')} ${e.projectId ? `<b class="dim">${esc(title(e.projectId))}</b> · ` : ''}${esc(e.text)}</span>`).join('') : '<span class="muted">Nothing logged.</span>') : '<span class="muted">Loading…</span>'}</div></div>`;

const body = () => (A.tab === 'live' ? liveHtml() : A.tab === 'procs' ? procsHtml() : logHtml());
const paint = () => { const el = $('#act-body'); if (el) el.innerHTML = body(); document.querySelectorAll('[data-atab]').forEach((b) => b.classList.toggle('on', b.dataset.atab === A.tab)); };
const loadProcs = async () => { try { A.procs = await api('/api/processes'); } catch { /* retried */ } };
const loadEntries = async () => { try { A.entries = (await api(`/api/activity?since=${Date.now() - 30 * 60000}`)).entries ?? []; } catch { /* retried */ } };
const loadLog = async () => {
  try { const qs = new URLSearchParams({day: A.day, project: A.project, q: A.q}); A.log = await api(`/api/activity/history?${qs}`); } catch (e) { toast(e.message); }
  if ($('#act-body') && A.tab === 'log' && !document.activeElement?.closest?.('#act-body')) paint(); else if (A.tab === 'log') { const lb = $('#act-body .logbox'); if (lb && A.log) paint(); }
};

export const render = async (host) => {
  host.innerHTML = `<div class="stack"><div class="spread"><div><h1>Activity</h1><p class="muted small" style="margin:4px 0 0">What the studio is doing now, everything that ran, and the full log of the day.</p></div><nav class="tabs">${TABS.map(([k, l]) => `<button type="button" class="tab ${A.tab === k ? 'on' : ''}" data-atab="${k}">${l}</button>`).join('')}</nav></div><div class="stack" id="act-body"></div></div>`;
  paint();
  await Promise.all([loadProcs(), loadEntries(), api('/api/activity/days').then((d) => { A.days = [...(d.days ?? [])].sort().reverse(); A.day ||= A.days[0] || new Date().toLocaleDateString('en-CA'); }).catch(() => { A.day ||= new Date().toLocaleDateString('en-CA'); })]);
  paint(); if (A.tab === 'log') loadLog();
  clearInterval(A.timer); A.timer = setInterval(async () => { if (!$('#act-body')) return clearInterval(A.timer); if (A.tab === 'log' || document.hidden) return; await Promise.all([loadProcs(), loadEntries()]); if (!document.activeElement?.closest?.('#act-body')) paint(); }, 4000);
};
export const leave = () => clearInterval(A.timer);
export const onEvent = () => {};

document.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-atab]');
  if (!b || !$('#act-body')) return;
  A.tab = b.dataset.atab; paint(); if (A.tab === 'log') loadLog();
});
document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (!$('#act-body')) return;
  if (t.dataset?.af) { A[t.dataset.af] = t.value; paint(); }
  else if (t.dataset?.al) { A[t.dataset.al] = t.value; loadLog(); }
});
let qt = null;
document.addEventListener('input', (ev) => { if (ev.target.dataset?.al === 'q' && $('#act-body')) { A.q = ev.target.value; clearTimeout(qt); qt = setTimeout(async () => { const pos = ev.target.selectionStart; await loadLog(); const q = $('[data-al="q"]'); q?.focus(); q?.setSelectionRange(pos, pos); }, 300); } });
