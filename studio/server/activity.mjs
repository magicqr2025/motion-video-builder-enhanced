// Live activity feed + process ledger, both saved to disk.
//   data/activity/log-YYYY-MM-DD.jsonl   every line the studio wrote that day (one JSON per line)
//   data/activity/processes.jsonl         one line per finished process: what ran, how long, how many tokens, what it cost
// The browser's Activity panel shows both, live (pushed over the event stream) and from the saved files after a restart.
import fs from 'node:fs';
import path from 'node:path';
import {DATA} from './paths.mjs';

const DIR = path.join(DATA, 'activity');
fs.mkdirSync(DIR, {recursive: true});
const PROC_FILE = path.join(DIR, 'processes.jsonl');
const MAX = 600;          // lines kept in memory for the live view
const MAX_PROCS = 3000;   // finished processes kept in memory
const buf = [];
const lastAt = new Map(); // projectId -> ms of its latest entry
const procs = new Map();  // running processes by id
const finished = [];      // finished processes, oldest first
const owner = new Map();  // `${source}:${projectId}` -> running process id, so log lines can say which process they belong to
let send = () => {};
let lastId = 0;

const dayOf = (ts = Date.now()) => new Date(ts).toLocaleDateString('en-CA'); // local YYYY-MM-DD
const logFile = (day) => path.join(DIR, `log-${day}.jsonl`);
// ids sort by time and stay unique across restarts
const nextId = () => (lastId = Math.max(lastId + 1, Date.now() * 1000));
const parseLines = (file) => { try { return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };

// ---- start-up: bring back the most recent lines and every saved process
for (const day of listDays().slice(0, 2).reverse()) for (const e of parseLines(logFile(day))) { buf.push(e); lastId = Math.max(lastId, e.id ?? 0); }
buf.splice(0, Math.max(0, buf.length - MAX));
for (const p of parseLines(PROC_FILE)) finished.push(p);
finished.splice(0, Math.max(0, finished.length - MAX_PROCS));

export function listDays() {
  try { return fs.readdirSync(DIR).map((f) => f.match(/^log-(\d{4}-\d{2}-\d{2})\.jsonl$/)?.[1]).filter(Boolean).sort().reverse(); } catch { return []; }
}

export const bindActivity = (broadcast) => { send = broadcast; };

// ---------------------------------------------------------------- log lines
/** Record one line. level: info | ok | warn | error. source: ai | render | media | script | save | system | job.
 *  tool: the tool or step name (Edit, Bash…). where: 'pc' (ran on this computer) | 'cloud' | 'local' | 'lan' (where the model answered). */
export const activityLog = (text, {projectId = null, source = 'system', level = 'info', tool = null, where = 'pc', processId = null} = {}) => {
  const now = Date.now();
  text = String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 600);
  if (!text) return;
  if (projectId) lastAt.set(projectId, now);
  processId ??= owner.get(`${source}:${projectId}`) ?? null;
  const entry = {id: nextId(), ts: now, level, source, projectId, text, tool, where, processId};
  fs.appendFile(logFile(dayOf(now)), JSON.stringify(entry) + '\n', () => {}); // every raw line is saved, even ones the live view folds together
  const p = processId && procs.get(processId);
  if (p) { p.steps++; touch(p); }
  const last = buf.at(-1);
  // the same line again within a few seconds (typing saves, progress ticks) shows as "x3" in the live view
  if (last && last.text === text && last.projectId === projectId && last.source === source && last.tool === tool && now - last.ts < 4000) {
    last.n = (last.n ?? 1) + 1; last.ts = now; last.level = level;
    send({type: 'activity', entry: last});
    return;
  }
  buf.push(entry);
  if (buf.length > MAX) buf.shift();
  send({type: 'activity', entry});
};

export const recentActivity = (since = 0, limit = 300) => buf.filter((e) => e.id > since).slice(-limit);
export const lastActivityAt = (projectId) => lastAt.get(projectId) ?? null;

/** Saved lines for a day (from disk): filter by project, process or search text. */
export const readHistory = ({day = dayOf(), project = '', process = '', q = '', limit = 1500} = {}) => {
  const needle = String(q).toLowerCase();
  const rows = parseLines(logFile(day)).filter((e) => (!project || e.projectId === project) && (!process || e.processId === process) && (!needle || `${e.text} ${e.tool ?? ''} ${e.source}`.toLowerCase().includes(needle)));
  return {day, total: rows.length, entries: rows.slice(-limit)};
};

// ---------------------------------------------------------------- processes
const snap = (p) => ({...p});
const touchTimers = new Map();
function touch(p) { // throttled: a busy build changes the step count many times a second
  if (touchTimers.has(p.id)) return;
  touchTimers.set(p.id, setTimeout(() => { touchTimers.delete(p.id); if (procs.has(p.id)) send({type: 'process', process: snap(p)}); }, 800));
}

/** A unit of work with a start and an end: an AI request, a render, a transcription, an MP3 conversion…
 *  source: which log lines belong to it (defaults to kind). Returns the process id. */
export const startProcess = ({kind, label, projectId = null, model = null, where = 'pc', source = kind}) => {
  const p = {id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, kind, source, label: String(label ?? kind).replace(/\s+/g, ' ').trim().slice(0, 200), projectId, status: 'running', startedAt: Date.now(), endedAt: null, durationMs: null, model, where, steps: 0, progress: null, stage: null, tokens: null, cost: null, error: null};
  procs.set(p.id, p);
  owner.set(`${source}:${projectId}`, p.id);
  send({type: 'process', process: snap(p)});
  return p.id;
};

export const patchProcess = (id, patch) => {
  const p = procs.get(id);
  if (!p) return;
  Object.assign(p, patch);
  touch(p);
};

export const addProcessTokens = (id, u, cost) => {
  const p = procs.get(id);
  if (!p) return;
  const t = p.tokens ?? {input: 0, output: 0, cacheRead: 0, cacheWrite: 0, context: 0};
  p.tokens = {input: t.input + (u.input ?? 0), output: t.output + (u.output ?? 0), cacheRead: t.cacheRead + (u.cacheRead ?? 0), cacheWrite: t.cacheWrite + (u.cacheWrite ?? 0), context: u.context || t.context};
  if (cost) p.cost = (p.cost ?? 0) + cost;
  touch(p);
};

export const endProcess = (id, {status = 'done', error = null} = {}) => {
  const p = procs.get(id);
  if (!p) return null;
  procs.delete(id);
  clearTimeout(touchTimers.get(id)); touchTimers.delete(id);
  const key = `${p.source}:${p.projectId}`;
  if (owner.get(key) === id) owner.delete(key);
  p.status = status; p.endedAt = Date.now(); p.durationMs = p.endedAt - p.startedAt; p.error = error ? String(error).slice(0, 300) : null;
  if (status === 'done') p.progress = 1;
  finished.push(p);
  if (finished.length > MAX_PROCS) finished.shift();
  fs.appendFile(PROC_FILE, JSON.stringify(p) + '\n', () => {});
  send({type: 'process', process: snap(p)});
  return p;
};

/** Run fn as a tracked process: ok -> done, throws -> error. */
export const trackProcess = async (meta, fn) => {
  const id = startProcess(meta);
  try { const r = await fn(id); endProcess(id, {status: 'done'}); return r; }
  catch (e) { endProcess(id, {status: 'error', error: e?.message ?? e}); throw e; }
};

export const runningProcesses = () => [...procs.values()].map(snap);
export const listProcesses = ({project = '', limit = 1500} = {}) => ({
  running: runningProcesses().filter((p) => !project || p.projectId === project),
  finished: finished.filter((p) => !project || p.projectId === project).slice(-limit),
});

const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const processesCsv = () => {
  const head = ['started', 'ended', 'duration_s', 'kind', 'label', 'project', 'status', 'model', 'where', 'steps', 'input_tokens', 'output_tokens', 'cache_read_tokens', 'cache_write_tokens', 'cost_usd', 'error'];
  const iso = (t) => (t ? new Date(t).toISOString() : '');
  const rows = finished.map((p) => [iso(p.startedAt), iso(p.endedAt), (p.durationMs / 1000).toFixed(1), p.kind, p.label, p.projectId, p.status, p.model, p.where, p.steps, p.tokens?.input, p.tokens?.output, p.tokens?.cacheRead, p.tokens?.cacheWrite, p.cost?.toFixed?.(4), p.error]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
};
