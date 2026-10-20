// Runs Claude Code (via the Agent SDK) for a project: one resumable session per project,
// streamed to the browser as small events and saved to the project's log.
import path from 'node:path';
import {query} from '@anthropic-ai/claude-agent-sdk';
import {REEL, STUDIO, DATA} from './paths.mjs';
import {SYSTEM} from './prompts.mjs';
import {getProject, saveProject, appendLog} from './projects.mjs';
import {writeRegistry} from './remotion.mjs';

const running = new Map(); // projectId -> AbortController
export const isBusy = (id) => running.has(id);
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

/**
 * Run one agent turn. `emit(event)` gets {type:'agent', projectId, kind:'text'|'tool'|'status'|'done'|'error', ...}.
 * Resolves when the turn ends.
 */
export const runAgent = async (projectId, prompt, {emit, label, onDone} = {}) => {
  if (running.has(projectId)) throw new Error('Claude is still working on this project. Stop it or wait.');
  const ac = new AbortController();
  running.set(projectId, ac);
  const send = (e) => { emit?.({type: 'agent', projectId, ...e}); if (e.kind !== 'status') appendLog(projectId, e); };
  let p = getProject(projectId);
  appendLog(projectId, {kind: 'user', text: label ?? prompt});
  emit?.({type: 'agent', projectId, kind: 'user', text: label ?? prompt});
  send({kind: 'status', busy: true});
  let ok = false;
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
        model: process.env.STUDIO_MODEL || undefined,
        env: localLoginEnv(),
        title: `Video Studio · ${p.title}`,
      },
    });
    for await (const m of q) {
      if (m.type === 'system' && m.subtype === 'init' && m.session_id && p.sessionId !== m.session_id) {
        p = getProject(projectId); p.sessionId = m.session_id; saveProject(p);
      } else if (m.type === 'assistant' && !m.parent_tool_use_id) {
        for (const b of m.message.content ?? []) {
          if (b.type === 'text' && b.text.trim()) send({kind: 'text', text: b.text.trim()});
          else if (b.type === 'tool_use') send({kind: 'tool', tool: b.name, text: toolLabel(b.name, b.input)});
        }
      } else if (m.type === 'result') {
        ok = m.subtype === 'success' && !m.is_error;
        p = getProject(projectId); p.cost = (p.cost ?? 0) + (m.total_cost_usd ?? 0); saveProject(p);
        if (!ok) {
          const text = m.result || m.errors?.join('\n') || `Stopped (${m.subtype})`;
          send({kind: 'error', text: /log ?in|auth|401|credential/i.test(text) ? `${text}\nSign in to Claude Code on this PC: run "claude" in a terminal and type /login, then try again.` : text});
        }
      }
    }
  } catch (e) {
    send({kind: 'error', text: ac.signal.aborted ? 'Stopped.' : String(e.message ?? e)});
  } finally {
    running.delete(projectId);
    try { writeRegistry(); } catch {}
    await onDone?.(ok);
    send({kind: 'status', busy: false});
    emit?.({type: 'agent', projectId, kind: 'done', ok});
  }
  return ok;
};
