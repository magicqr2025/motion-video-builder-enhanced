// Runs Claude Code (via the Agent SDK) for a project: one resumable session per project,
// streamed to the browser as small events and saved to the project's log.
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {query} from '@anthropic-ai/claude-agent-sdk';
import {REEL, STUDIO, DATA, projectDir} from './paths.mjs';
import {SYSTEM} from './prompts.mjs';
import {getProject, saveProject, appendLog} from './projects.mjs';
import {aiConfig, aiRuntime, PROVIDERS} from './settings.mjs';
import {startProcess, endProcess, addProcessTokens} from './activity.mjs';
import {runOpenAITurn} from './providers/openai.mjs';
import {writeRegistry} from './remotion.mjs';

const LOST = /No conversation found with session ID/i;
const running = new Map(); // projectId -> AbortController
export const isBusy = (id) => running.has(id);
export const busyList = () => [...running].map(([id, ac]) => ({id, startedAt: ac.startedAt}));
export const stopAgent = (id) => running.get(id)?.abort();

const inside = (file, dir) => { const r = path.relative(dir, path.resolve(REEL, file)); return r && !r.startsWith('..') && !path.isAbsolute(r); };
const WRITABLE = [REEL, DATA, path.join(STUDIO, 'presets')];
const DANGER = /\b(rm\s+-[a-z]*r[a-z]*f?\s+(\/|~|\.\.|[a-z]:)|git\s+(push|reset\s+--hard|clean\s+-[a-z]*f)|format\s+[a-z]:|del\s+\/s|rmdir\s+\/s|Remove-Item\b.*-Recurse.*(\\|\/)\s*$|shutdown|npm\s+publish)/i;

// Allow the normal design/build loop; keep writes inside the Remotion project and the studio workspace.
const canUseTool = async (tool, input) => {
  if (['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    const f = input.file_path ?? input.notebook_path ?? '';
    return WRITABLE.some((d) => inside(f, d)) ? {behavior: 'allow', updatedInput: input} : {behavior: 'deny', message: `Writes are limited to ${WRITABLE.join(', ')}`};
  }
  if (tool === 'Bash' || tool === 'PowerShell') {
    return DANGER.test(input.command ?? '') ? {behavior: 'deny', message: 'That command is blocked in the studio (destructive).'} : {behavior: 'allow', updatedInput: input};
  }
  return {behavior: 'allow', updatedInput: input};
};

// Always use the local Claude Code login (~/.claude), never an API key, saved token or other provider,
// even if one is set in the shell that started the studio.
const AUTH_VARS = /^(ANTHROPIC_(API_KEY|AUTH_TOKEN|BASE_URL|.*_BASE_URL)|CLAUDE_CODE_(OAUTH_TOKEN|OAUTH_REFRESH_TOKEN|USE_BEDROCK|USE_VERTEX|USE_FOUNDRY|API_KEY_HELPER.*)|AWS_BEARER_TOKEN_BEDROCK)$/i;
const localLoginEnv = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !AUTH_VARS.test(k)));

// A proxy variable left behind by the tool that started the studio (sandboxed terminals and agent tools point
// HTTP(S)_PROXY at a local port that dies with them) makes every Claude call fail with ECONNREFUSED.
// Drop loopback proxies that nothing is listening on; keep real ones.
const PROXY_VARS = /^(https?_proxy|all_proxy)$/i;
const portOpen = (host, port) => new Promise((ok) => {
  const s = net.connect({host, port, timeout: 1500});
  s.once('connect', () => { s.destroy(); ok(true); });
  s.once('error', () => ok(false));
  s.once('timeout', () => { s.destroy(); ok(false); });
});
export const claudeEnv = async () => {
  const env = localLoginEnv();
  const dropped = [];
  for (const k of Object.keys(env).filter((k) => PROXY_VARS.test(k))) {
    let u; try { u = new URL(env[k].includes('://') ? env[k] : `http://${env[k]}`); } catch { continue; }
    if (!/^(localhost|127\.\d+\.\d+\.\d+|\[?::1\]?)$/i.test(u.hostname)) continue;
    if (!(await portOpen(u.hostname.replace(/^\[|\]$/g, ''), Number(u.port || 80)))) { dropped.push(`${k}=${env[k]}`); delete env[k]; }
  }
  if (dropped.length) console.log(`  ! Ignoring dead local proxy for Claude: ${dropped.join(', ')}`);
  return env;
};
const NETWORK = /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up|Connection (refused|error)|network/i;

// Token bookkeeping: running totals on the project, the last request's numbers, and one plain line in the activity log.
const kfmt = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n));
const recordUsage = (projectId, u, cost, send, procId, partial = false) => {
  addProcessTokens(procId, u, cost); // the process ledger keeps this request's tokens and cost next to its running time
  const p = getProject(projectId);
  if (!p) return;
  const t = p.tokens ?? {};
  p.tokens = {input: (t.input ?? 0) + u.input, output: (t.output ?? 0) + u.output, cacheRead: (t.cacheRead ?? 0) + u.cacheRead, cacheWrite: (t.cacheWrite ?? 0) + u.cacheWrite};
  p.lastTurn = {...u, cost: cost || null, at: Date.now()};
  saveProject(p);
  send({kind: 'usage', text: `Used ${partial ? 'before it stopped' : 'this request'}: ${kfmt(u.output)} written, ${kfmt(u.input + u.cacheWrite)} new input${u.cacheRead ? `, ${kfmt(u.cacheRead)} re-read from cache` : ''}${cost ? ` · about $${cost.toFixed(2)}` : ''}${u.context ? ` · conversation size ${kfmt(u.context)} tokens` : ''}`});
};

const short = (s, n = 110) => { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const relPath = (f) => { const r = path.relative(REEL, String(f ?? '')); return (r.startsWith('..') ? path.relative(STUDIO, String(f)) : r).split(path.sep).join('/'); };
const toolLabel = (name, i = {}) => {
  switch (name) {
    case 'Bash': case 'PowerShell': return i.description ? short(i.description) : short(i.command);
    case 'Read': return `Read ${relPath(i.file_path)}`;
    case 'Write': return `Write ${relPath(i.file_path)}`;
    case 'Edit': case 'MultiEdit': return `Edit ${relPath(i.file_path)}`;
    case 'Glob': return `Find ${i.pattern}`;
    case 'Grep': return `Search "${short(i.pattern, 50)}"`;
    case 'WebFetch': return `Fetch ${short(i.url, 80)}`;
    case 'WebSearch': return `Search web: ${short(i.query, 70)}`;
    case 'TodoWrite': return `Plan: ${(i.todos ?? []).filter((t) => t.status === 'in_progress').map((t) => t.activeForm ?? t.content).join(', ') || 'updated'}`;
    default: return name;
  }
};

const runCodexTurn = ({project, prompt, model, signal, onText, onStatus, onTool, onUsage}) => new Promise((resolve, reject) => {
  // A Codex thread keeps its original writable roots when resumed. Start a fresh
  // thread once so projects created before this workspace layout gain their data dir.
  if (project.codexWorkspaceVersion !== 2) {
    if (project.codexSessionId) {
      project.codexSessionHistory = [...(project.codexSessionHistory ?? []), project.codexSessionId];
      project.codexSessionId = null;
    }
    project.codexWorkspaceVersion = 2;
    saveProject(project);
  }
  const modelArgs = ['--model', model];
  const args = project.codexSessionId
    ? ['exec', 'resume', project.codexSessionId, prompt, '--json', ...modelArgs] // the thread already holds the system rules; do not pay for them again
    : ['exec', '--json', '--sandbox', 'workspace-write', '--cd', REEL, '--add-dir', projectDir(project.id), '--add-dir', path.join(STUDIO, 'presets'), ...modelArgs, `${SYSTEM}\n\n${prompt}`];
  const child = spawn('codex', args, {cwd: REEL, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
  let stdout = '', stderr = '', resultError = null, finished = false;
  const finish = (error, value) => { if (finished) return; finished = true; signal?.removeEventListener('abort', abort); error ? reject(error) : resolve(value); };
  const abort = () => child.kill();
  if (signal?.aborted) abort(); else signal?.addEventListener('abort', abort, {once: true});
  const parseLine = (line) => {
    if (!line.trim()) return;
    let e; try { e = JSON.parse(line); } catch { return; }
    if (e.type === 'thread.started' && e.thread_id && project.codexSessionId !== e.thread_id) {
      project.codexSessionId = e.thread_id; saveProject(project);
    }
    const item = e.item ?? {};
    if (item.type === 'agent_message' && item.text) onText(item.text);
    else if (item.type === 'command_execution') {
      onTool('Bash', {command: item.command, description: item.command});
      if (item.status === 'failed') onStatus(item.aggregated_output || `Command failed before it started (exit ${item.exit_code ?? 'unknown'}).`);
    }
    else if (item.type === 'file_change') onTool('Edit', {file_path: item.changes?.[0]?.path ?? 'project files'});
    else if (item.type === 'error' && item.message) onStatus(item.message);
    if (e.type === 'error' && e.message) onStatus(e.message);
    if (e.type === 'turn.completed' && e.usage) onUsage?.({input: Math.max(0, (e.usage.input_tokens ?? 0) - (e.usage.cached_input_tokens ?? 0)), output: e.usage.output_tokens ?? 0, cacheRead: e.usage.cached_input_tokens ?? 0, cacheWrite: 0, context: e.usage.input_tokens ?? 0});
    if (e.type === 'turn.failed') resultError = e.error?.message ?? JSON.stringify(e.error ?? e);
  };
  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
    const lines = stdout.split(/\r?\n/); stdout = lines.pop() ?? '';
    for (const line of lines) parseLine(line);
  });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', (e) => finish(e));
  child.on('close', (code) => {
    if (stdout.trim()) parseLine(stdout);
    if (signal?.aborted) return finish(null, {ok: false, error: 'Stopped.'});
    if (code !== 0 || resultError) return finish(null, {ok: false, error: resultError || stderr.trim() || `Codex exited with code ${code}`});
    finish(null, {ok: true});
  });
});

// A tool call as a log event. Claude's TodoWrite list is kept too, so the Build page can show its own plan and what is ticked off.
const toolEvent = (name, input) => ({kind: 'tool', tool: name, text: toolLabel(name, input), ...(name === 'TodoWrite' && Array.isArray(input?.todos) ? {todos: input.todos.map((t) => ({content: String(t.content ?? ''), status: t.status, activeForm: t.activeForm}))} : {})});

/**
 * Run one agent turn. `emit(event)` gets {type:'agent', projectId, kind:'text'|'tool'|'status'|'done'|'error', ...}.
 * Resolves when the turn ends.
 */
export const runAgent = async (projectId, prompt, {emit, label, onDone} = {}) => {
  if (running.has(projectId)) throw new Error('Claude is still working on this project. Stop it or wait.');
  const ac = new AbortController();
  ac.startedAt = Date.now();
  running.set(projectId, ac);
  const rt = aiRuntime(); // which engine/model answers and where; saved with the process so history shows it
  const proc = startProcess({kind: 'ai', label: short(label ?? prompt, 160), projectId, model: rt.model || rt.engine, where: rt.where});
  let lastError = '';
  const send = (e) => { if (e.kind === 'error') lastError = e.text; emit?.({type: 'agent', projectId, ...e}); if (e.kind !== 'status') appendLog(projectId, e); };
  let p = getProject(projectId);
  appendLog(projectId, {kind: 'user', text: label ?? prompt});
  emit?.({type: 'agent', projectId, kind: 'user', text: label ?? prompt});
  send({kind: 'status', busy: true});
  let ok = false;
  const cfg = aiConfig();
  // A stopped or failed request never sends its final usage, so keep a running count from every model reply
  const seen = {input: 0, output: 0, cacheRead: 0, cacheWrite: 0, context: 0};
  let usageRecorded = false;
  try {
    if (cfg.provider === 'codex') {
      if (!cfg.model) throw new Error('Choose a model ID that is available in your Codex account. Set it in AI model on the Studio home page.');
      const r = await runCodexTurn({
        project: p, prompt, model: cfg.model, signal: ac.signal,
        onText: (text) => send({kind: 'text', text}),
        onStatus: (text) => send({kind: 'text', text}),
        onTool: (name, input) => send(toolEvent(name, input)),
        onUsage: (u) => recordUsage(projectId, u, 0, send, proc),
      });
      ok = r.ok;
      if (!ok) send({kind: 'error', text: r.error});
      return ok;
    }
    if (cfg.provider !== 'claude') {
      // Any OpenAI-compatible model: same prompts, tools and permission rules, our own loop.
      const r = await runOpenAITurn({
        cfg, prompt, systemAppend: SYSTEM, cwd: REEL, additionalDirectories: [STUDIO],
        sessionFile: path.join(projectDir(projectId), 'agent-session.json'),
        signal: ac.signal, canUseTool,
        onText: (text) => send({kind: 'text', text}),
        onTool: (name, input) => send(toolEvent(name, input)),
      });
      ok = r.ok;
      recordUsage(projectId, {input: r.usage.input, output: r.usage.output, cacheRead: 0, cacheWrite: 0, context: 0}, 0, send, proc);
      if (!ok) send({kind: 'error', text: /401|403|api key|unauthor/i.test(r.error ?? '') ? `${r.error}
Check the API key for ${PROVIDERS[cfg.provider].name} in Settings on the home page.` : r.error});
      return ok;
    }
    const env = await claudeEnv();
    // Up to 3 tries: a saved session that no longer exists restarts fresh, a network blip retries once.
    let lostRetried = false, netRetried = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      let failure = null; // error text of this try
      let answered = false; // a real (non-error) assistant message arrived
      let ctxTokens = 0; // size of the conversation at the latest model call
      try {
        const q = query({
          prompt,
          options: {
            cwd: REEL,
            additionalDirectories: [STUDIO],
            resume: p.sessionId ?? undefined,
            systemPrompt: {type: 'preset', preset: 'claude_code', append: SYSTEM},
            settingSources: ['project'],
            permissionMode: 'default',
            canUseTool,
            abortController: ac,
            model: cfg.model || process.env.STUDIO_MODEL || undefined, // chosen on the home page (AI model); empty = Claude Code's default
            env,
            title: `MotionStudio · ${p.title}`,
          },
        });
        for await (const m of q) {
          if (m.type === 'assistant') {
            // API failures arrive as a synthetic assistant message with `error` set and a session that was never
            // saved. Only remember the session once Claude really answered, or the next run fails to resume it.
            if (m.error || m.message?.model === '<synthetic>') continue;
            answered = true;
            const mu = m.message?.usage;
            if (mu) { seen.input += mu.input_tokens ?? 0; seen.output += mu.output_tokens ?? 0; seen.cacheRead += mu.cache_read_input_tokens ?? 0; seen.cacheWrite += mu.cache_creation_input_tokens ?? 0; }
            if (mu && !m.parent_tool_use_id) seen.context = ctxTokens = (mu.input_tokens ?? 0) + (mu.cache_read_input_tokens ?? 0) + (mu.cache_creation_input_tokens ?? 0);
            if (m.session_id && p.sessionId !== m.session_id) { p = getProject(projectId); p.sessionId = m.session_id; saveProject(p); }
            if (m.parent_tool_use_id) continue;
            for (const b of m.message.content ?? []) {
              if (b.type === 'text' && b.text.trim()) send({kind: 'text', text: b.text.trim()});
              else if (b.type === 'tool_use') send(toolEvent(b.name, b.input));
            }
          } else if (m.type === 'result') {
            ok = m.subtype === 'success' && !m.is_error;
            p = getProject(projectId); p.cost = (p.cost ?? 0) + (m.total_cost_usd ?? 0); saveProject(p);
            const ru = m.usage ?? {};
            recordUsage(projectId, {input: ru.input_tokens ?? 0, output: ru.output_tokens ?? 0, cacheRead: ru.cache_read_input_tokens ?? 0, cacheWrite: ru.cache_creation_input_tokens ?? 0, context: ctxTokens}, m.total_cost_usd ?? 0, send, proc);
            usageRecorded = true;
            if (!ok) failure = m.result || m.errors?.join('\n') || `Stopped (${m.subtype})`;
          }
        }
      } catch (e) {
        if (ac.signal.aborted) throw e;
        failure = String(e.message ?? e);
      }
      if (!failure || ok) break;
      if (LOST.test(failure) && !lostRetried) {
        lostRetried = true;
        p = getProject(projectId); p.sessionId = null; saveProject(p);
        send({kind: 'text', text: 'The earlier Claude session for this project was not found, so I started a fresh one.'});
        continue;
      }
      if (NETWORK.test(failure) && !answered && !netRetried) {
        netRetried = true;
        send({kind: 'text', text: 'Could not reach Claude, trying again in 5 seconds…'});
        await new Promise((r) => setTimeout(r, 5000));
        if (ac.signal.aborted) throw new Error('Stopped.');
        continue;
      }
      const hint = LOST.test(failure) ? ''
        : NETWORK.test(failure) ? '\nThis PC could not reach Anthropic. Check the internet / VPN, then restart MotionStudio from a normal terminal (a proxy set by the tool that started it can block Claude).'
        : /\blog ?in\b|not (logged|signed) in|authenticat|\b401\b|credential/i.test(failure) ? '\nSign in to Claude Code on this PC: run "claude" in a terminal and type /login, then try again.' : '';
      send({kind: 'error', text: `${failure}${hint}`});
      break;
    }
  } catch (e) {
    const msg = String(e.message ?? e);
    send({kind: 'error', text: ac.signal.aborted ? 'Stopped.' : cfg.provider !== 'claude' && /401|403|unauthor|invalid.*key/i.test(msg) ? `${msg}
Check the API key for ${PROVIDERS[cfg.provider].name} in Settings on the home page.` : msg});
  } finally {
    if (!usageRecorded && (seen.input || seen.output || seen.cacheRead || seen.cacheWrite)) recordUsage(projectId, seen, 0, send, proc, true);
    endProcess(proc, {status: ac.signal.aborted ? 'stopped' : ok ? 'done' : 'error', error: ok ? null : lastError});
    running.delete(projectId);
    try { writeRegistry(); } catch {}
    await onDone?.(ok);
    send({kind: 'status', busy: false});
    emit?.({type: 'agent', projectId, kind: 'done', ok});
  }
  return ok;
};
