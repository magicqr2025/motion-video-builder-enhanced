// Agent loop for any OpenAI-compatible chat API (OpenAI, Gemini, OpenRouter, Ollama, ...).
// Gives the model the same working tools Claude Code has here (read/look at images, write, edit, shell, find, search),
// runs them through the studio's permission check, and keeps one saved conversation per project.
import fs from 'node:fs';
import path from 'node:path';
import {exec} from 'node:child_process';

const MAX_STEPS = 120; // model calls per turn
const MAX_OUT = 30000; // chars of tool output sent back
const HISTORY_BUDGET = 600000; // chars of history before old tool output and images are trimmed
const IMG = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif'};
const SKIP_DIRS = new Set(['node_modules', '.git', 'out', '.whisper', 'dist']);

const TOOLS = [
  ['Read', 'Read a text file (returns numbered lines), or LOOK at an image (.png/.jpg/.webp): the image is shown to you.', {file_path: {type: 'string', description: 'Absolute or cwd-relative path'}, offset: {type: 'integer', description: 'First line (1-based), optional'}, limit: {type: 'integer', description: 'Max lines, optional (default 2000)'}}, ['file_path']],
  ['Write', 'Create or overwrite a file with the full content.', {file_path: {type: 'string'}, content: {type: 'string'}}, ['file_path', 'content']],
  ['Edit', 'Replace an exact string in a file. old_string must match exactly (including indentation) and be unique unless replace_all is true.', {file_path: {type: 'string'}, old_string: {type: 'string'}, new_string: {type: 'string'}, replace_all: {type: 'boolean'}}, ['file_path', 'old_string', 'new_string']],
  ['Bash', `Run a shell command in the cwd (${process.platform === 'win32' ? 'cmd.exe on Windows: use node/npx, avoid Unix-only tools' : 'sh'}). Returns stdout+stderr and the exit code.`, {command: {type: 'string'}, description: {type: 'string', description: 'What it does, 5-10 words'}, timeout_seconds: {type: 'integer', description: 'Default 600'}}, ['command']],
  ['Glob', 'Find files by glob pattern, e.g. "src/**/*.tsx". Skips node_modules.', {pattern: {type: 'string'}, path: {type: 'string', description: 'Directory to search, default cwd'}}, ['pattern']],
  ['Grep', 'Search file contents with a JavaScript regex. Returns path:line: text.', {pattern: {type: 'string'}, path: {type: 'string', description: 'File or directory, default cwd'}, glob: {type: 'string', description: 'Only files matching this glob, e.g. "*.tsx"'}, ignore_case: {type: 'boolean'}}, ['pattern']],
].map(([name, description, properties, required]) => ({type: 'function', function: {name, description, parameters: {type: 'object', properties, required}}}));

const globRe = (g) => {
  const segs = g.replace(/^\.\//, '').split('/');
  const seg = (s) => s.replace(/[.+^$()|[\]\\]/g, '\\$&').replace(/\{([^}]*)\}/g, (_, a) => `(?:${a.split(',').join('|')})`).replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]');
  return new RegExp('^' + segs.map((s, i) => (s === '**' ? (i === segs.length - 1 ? '.*' : '(?:.*/)?') : seg(s) + (i === segs.length - 1 ? '' : '/'))).join('') + '$', 'i');
};
const walk = function* (dir, root = dir) {
  let ents = [];
  try { ents = fs.readdirSync(dir, {withFileTypes: true}); } catch { return; }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) yield* walk(full, root); }
    else yield path.relative(root, full).split(path.sep).join('/');
  }
};
const clip = (s, n = MAX_OUT) => (s.length > n ? `${s.slice(0, n)}\n… [${s.length - n} more chars cut]` : s);

const runShell = (command, cwd, timeoutS, signal) => new Promise((resolve) => {
  exec(command, {cwd, timeout: (timeoutS || 600) * 1000, maxBuffer: 64 * 1024 * 1024, windowsHide: true, signal, env: {...process.env, FORCE_COLOR: '0'}}, (err, stdout, stderr) => {
    const out = `${stdout ?? ''}${stderr ? `\n${stderr}` : ''}`.trim();
    resolve(err ? `${out}\n[exit ${err.code ?? (err.killed ? 'timeout' : 'error')}]` : out || '[exit 0, no output]');
  });
});

// Run one tool call. Returns {text, image?}.
const runTool = async (name, input, {cwd, signal}) => {
  const abs = (p) => path.resolve(cwd, String(p ?? ''));
  switch (name) {
    case 'Read': {
      const f = abs(input.file_path);
      const ext = path.extname(f).toLowerCase();
      if (IMG[ext]) return {text: `Image ${input.file_path} is attached below.`, image: `data:${IMG[ext]};base64,${fs.readFileSync(f).toString('base64')}`};
      const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
      const from = Math.max(1, input.offset ?? 1);
      const to = Math.min(lines.length, from - 1 + (input.limit ?? 2000));
      return {text: clip(lines.slice(from - 1, to).map((l, i) => `${String(from + i).padStart(5)}\t${l}`).join('\n') + (to < lines.length ? `\n… (${lines.length - to} more lines; use offset)` : ''))};
    }
    case 'Write': {
      const f = abs(input.file_path);
      fs.mkdirSync(path.dirname(f), {recursive: true});
      fs.writeFileSync(f, String(input.content ?? ''));
      return {text: `Wrote ${input.file_path}`};
    }
    case 'Edit': {
      const f = abs(input.file_path);
      const src = fs.readFileSync(f, 'utf8');
      const n = src.split(input.old_string).length - 1;
      if (!input.old_string || n === 0) return {text: 'Error: old_string not found. Read the file and copy the text exactly.'};
      if (n > 1 && !input.replace_all) return {text: `Error: old_string occurs ${n} times. Add surrounding lines to make it unique, or set replace_all.`};
      fs.writeFileSync(f, input.replace_all ? src.split(input.old_string).join(input.new_string) : src.replace(input.old_string, () => input.new_string));
      return {text: `Edited ${input.file_path} (${input.replace_all ? n : 1} replacement${n > 1 && input.replace_all ? 's' : ''})`};
    }
    case 'Bash': return {text: clip(await runShell(String(input.command ?? ''), cwd, input.timeout_seconds, signal))};
    case 'Glob': {
      const dir = abs(input.path ?? '.');
      const re = globRe(String(input.pattern ?? '**/*').replace(/\\/g, '/'));
      const hits = [];
      for (const f of walk(dir)) { if (re.test(f)) hits.push(f); if (hits.length >= 500) break; }
      return {text: hits.length ? hits.join('\n') : 'No files found.'};
    }
    case 'Grep': {
      const re = new RegExp(input.pattern, input.ignore_case ? 'i' : '');
      const target = abs(input.path ?? '.');
      const only = input.glob ? globRe(input.glob.includes('/') ? input.glob : `**/${input.glob}`) : null;
      const files = fs.statSync(target).isFile() ? [path.basename(target)] : [...walk(target)];
      const base = fs.statSync(target).isFile() ? path.dirname(target) : target;
      const hits = [];
      for (const f of files) {
        if (only && !only.test(f)) continue;
        let txt;
        try { const full = path.join(base, f); if (fs.statSync(full).size > 2e6) continue; txt = fs.readFileSync(full, 'utf8'); } catch { continue; }
        if (txt.includes('\0')) continue;
        txt.split(/\r?\n/).forEach((l, i) => { if (hits.length < 300 && re.test(l)) hits.push(`${f}:${i + 1}: ${l.trim().slice(0, 240)}`); });
        if (hits.length >= 300) break;
      }
      return {text: hits.length ? hits.join('\n') : 'No matches.'};
    }
    default: return {text: `Unknown tool ${name}`};
  }
};

// Shrink old history so long projects fit: keep the last 40 messages intact, cut older tool output and drop old images.
const trim = (msgs) => {
  let size = JSON.stringify(msgs).length;
  for (let i = 1; i < msgs.length - 40 && size > HISTORY_BUDGET; i++) {
    const m = msgs[i];
    if (Array.isArray(m.content)) { m.content = m.content.map((c) => (c.type === 'image_url' ? {type: 'text', text: '[earlier image removed]'} : c)); }
    else if (m.role === 'tool' && m.content.length > 1500) m.content = `${m.content.slice(0, 1500)}\n… [trimmed]`;
    size = JSON.stringify(msgs).length;
  }
  return msgs;
};

// fetch with a readable error when the address is wrong or the local server (Ollama, LM Studio) isn't running
const post = async (cfg, headers, body, signal) => {
  try { return await fetch(`${cfg.baseUrl}/chat/completions`, {method: 'POST', headers, signal, body: JSON.stringify(body)}); }
  catch (e) { if (signal?.aborted) throw e; throw new Error(`Could not reach ${cfg.baseUrl} (${e.cause?.code ?? e.message}). Check the API address${/localhost|127\.0\.0\.1/.test(cfg.baseUrl) ? ' and that the local model server is running' : ''}.`); }
};

const chat = async (cfg, messages, signal) => {
  const headers = {'Content-Type': 'application/json', ...(cfg.apiKey ? {Authorization: `Bearer ${cfg.apiKey}`} : {}), 'HTTP-Referer': 'http://localhost', 'X-Title': 'MagicBolt Video Studio'};
  for (let attempt = 0; ; attempt++) {
    const r = await post(cfg, headers, {model: cfg.model, messages, tools: TOOLS, tool_choice: 'auto'}, signal);
    if (r.ok) return r.json();
    const body = await r.text();
    if ((r.status === 429 || r.status >= 500) && attempt < 4) { await new Promise((ok) => setTimeout(ok, 2000 * 2 ** attempt)); continue; }
    throw new Error(`${cfg.baseUrl} answered ${r.status}: ${body.slice(0, 600)}`);
  }
};

const INTRO = (cwd, extraDirs) => `You are a senior software engineer and motion designer working as an autonomous coding agent on the user's PC.
You complete the task fully by calling tools: read code before changing it, make the edits, run the commands, check
the results, and fix problems. Do not stop to ask permission and never tell the user to run commands. Prefer Edit for
small changes to existing files. Paths may be absolute or relative to the cwd.
cwd: ${cwd}
Other directories you may use: ${extraDirs.join(', ')}
Platform: ${process.platform}. Today: ${new Date().toISOString().slice(0, 10)}.
When the task is done, reply with a short plain-text summary and no tool call.`;

/**
 * One agent turn. `canUseTool(name, input)` returns {behavior:'allow'|'deny', message?}.
 * Callbacks: onText(text), onTool(name, input). Returns {ok, error?, usage}.
 */
export const runOpenAITurn = async ({cfg, prompt, systemAppend, cwd, additionalDirectories = [], sessionFile, signal, canUseTool, onText, onTool}) => {
  if (!cfg.baseUrl) return {ok: false, error: 'No API address set for this AI model. Open Settings on the home page.'};
  if (!cfg.model) return {ok: false, error: 'No model name set. Open Settings on the home page.'};
  let msgs = [];
  try { msgs = JSON.parse(fs.readFileSync(sessionFile, 'utf8')).messages ?? []; } catch {}
  if (!msgs.length) msgs.push({role: 'system', content: `${INTRO(cwd, additionalDirectories)}\n${systemAppend}`});
  msgs.push({role: 'user', content: prompt});
  const save = () => fs.writeFileSync(sessionFile, JSON.stringify({model: cfg.model, messages: trim(msgs)}));
  const usage = {input: 0, output: 0};
  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const res = await chat(cfg, msgs, signal);
      usage.input += res.usage?.prompt_tokens ?? 0; usage.output += res.usage?.completion_tokens ?? 0;
      const m = res.choices?.[0]?.message;
      if (!m) throw new Error(`Empty reply from the model: ${JSON.stringify(res).slice(0, 300)}`);
      const calls = m.tool_calls ?? [];
      msgs.push({role: 'assistant', content: m.content ?? '', ...(calls.length ? {tool_calls: calls} : {})});
      if (m.content?.trim()) onText?.(m.content.trim());
      if (!calls.length) { save(); return {ok: true, usage}; }
      const images = [];
      for (const c of calls) {
        let input = {};
        try { input = JSON.parse(c.function.arguments || '{}'); } catch { msgs.push({role: 'tool', tool_call_id: c.id, content: 'Error: arguments were not valid JSON.'}); continue; }
        onTool?.(c.function.name, input);
        let out;
        const perm = await canUseTool(c.function.name, input);
        if (perm.behavior !== 'allow') out = {text: `Denied: ${perm.message}`};
        else { try { out = await runTool(c.function.name, input, {cwd, signal}); } catch (e) { if (signal.aborted) throw e; out = {text: `Error: ${e.message}`}; } }
        msgs.push({role: 'tool', tool_call_id: c.id, content: out.text});
        if (out.image) images.push({type: 'text', text: `Image for ${input.file_path}:`}, {type: 'image_url', image_url: {url: out.image}});
      }
      // tool results can only carry text, so images go in a follow-up user message
      if (images.length) msgs.push({role: 'user', content: images});
      save();
    }
    return {ok: false, error: `Stopped after ${MAX_STEPS} steps. Send "continue" to keep going.`, usage};
  } catch (e) {
    save();
    throw e;
  }
};

// Called before a run to make sure the endpoint + key + model answer.
export const pingModel = async (cfg) => {
  if (!cfg.baseUrl || !cfg.model) throw new Error('Set the model and API address first.');
  const r = await post(cfg, {'Content-Type': 'application/json', ...(cfg.apiKey ? {Authorization: `Bearer ${cfg.apiKey}`} : {})}, {model: cfg.model, messages: [{role: 'user', content: 'Reply with OK'}]});
  if (!r.ok) throw new Error(`${r.status}: ${(await r.text()).slice(0, 400)}`);
  return true;
};
