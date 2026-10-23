// App settings in data/settings.json (never committed): output folder and which AI model runs the agent.
import fs from 'node:fs';
import path from 'node:path';
import {DATA} from './paths.mjs';

const SETTINGS = path.join(DATA, 'settings.json');
export const readSettings = () => { try { return JSON.parse(fs.readFileSync(SETTINGS, 'utf8')); } catch { return {}; } };
export const writeSettings = (s) => { fs.mkdirSync(DATA, {recursive: true}); fs.writeFileSync(SETTINGS, JSON.stringify(s, null, 2)); };

// OpenAI-compatible endpoints. `keyEnv` is used when no key is saved in the app.
export const PROVIDERS = {
  codex: {name: 'Codex CLI (your login)'},
  claude: {name: 'Claude Code (your login)'},
  openai: {name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', keyEnv: 'OPENAI_API_KEY', model: 'gpt-5'},
  gemini: {name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', keyEnv: 'GEMINI_API_KEY', model: 'gemini-2.5-pro'},
  openrouter: {name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY', model: 'openai/gpt-5'},
  ollama: {name: 'Ollama (local)', baseUrl: 'http://localhost:11434/v1', keyEnv: null, model: 'qwen3-coder'},
  custom: {name: 'Other OpenAI-compatible', baseUrl: '', keyEnv: null, model: ''},
};

// The agent's view: provider + resolved endpoint, model and key.
export const aiConfig = () => {
  const ai = readSettings().ai ?? {};
  const id = PROVIDERS[ai.provider] ? ai.provider : 'claude';
  const def = PROVIDERS[id];
  return {
    provider: id,
    baseUrl: (ai.baseUrl || def.baseUrl || '').replace(/\/+$/, ''),
    model: ai.model || def.model || '',
    apiKey: ai.apiKey || (def.keyEnv ? process.env[def.keyEnv] ?? '' : ''),
  };
};

// Which engine answers and where: the model always answers somewhere remote unless it is Ollama/localhost; the tools it asks for
// (reading and writing files, commands, rendering) always run on this PC.
const LOCAL_HOST = /^(localhost|127\.|0\.0\.0\.0|\[?::1\]?$)/i;
const LAN_HOST = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
export const aiRuntime = (cfg = aiConfig()) => {
  if (cfg.provider === 'claude') return {engine: 'Claude Code', model: cfg.model || 'default', where: 'cloud', host: 'Anthropic servers', tools: 'This PC'};
  if (cfg.provider === 'codex') return {engine: 'Codex CLI', model: cfg.model, where: 'cloud', host: 'OpenAI servers', tools: 'This PC'};
  let host = ''; try { host = new URL(cfg.baseUrl).hostname; } catch {}
  const where = LOCAL_HOST.test(host) ? 'local' : LAN_HOST.test(host) ? 'lan' : 'cloud';
  return {engine: PROVIDERS[cfg.provider].name, model: cfg.model, where, host: where === 'local' ? 'This PC (localhost)' : where === 'lan' ? `Local network (${host})` : host || 'remote server', tools: 'This PC'};
};

// What the browser sees: the key is only ever shown masked.
export const publicSettings = () => {
  const s = readSettings();
  const ai = s.ai ?? {};
  const cfg = aiConfig();
  const key = ai.apiKey ?? '';
  return {
    ...s,
    ai: {provider: cfg.provider, baseUrl: ai.baseUrl ?? '', model: ai.model ?? '', hasKey: !!cfg.apiKey, keySaved: !!key, keyHint: key ? `…${key.slice(-4)}` : '', runtime: aiRuntime(cfg)},
    providers: Object.fromEntries(Object.entries(PROVIDERS).map(([k, v]) => [k, {name: v.name, baseUrl: v.baseUrl ?? '', model: v.model ?? '', keyEnv: v.keyEnv ?? null}])),
  };
};

// Apply {provider, baseUrl, model, apiKey}; an empty apiKey leaves the saved one, apiKey: null clears it.
export const updateAi = (patch = {}) => {
  const s = readSettings();
  const ai = {...(s.ai ?? {})};
  if ('provider' in patch) {
    if (!PROVIDERS[patch.provider]) throw Object.assign(new Error(`Unknown provider ${patch.provider}`), {status: 400});
    if (patch.provider !== ai.provider) { ai.baseUrl = ''; ai.model = ''; }
    ai.provider = patch.provider;
  }
  if ('baseUrl' in patch) ai.baseUrl = String(patch.baseUrl ?? '').trim();
  if ('model' in patch) ai.model = String(patch.model ?? '').trim();
  if (patch.apiKey === null) delete ai.apiKey;
  else if (typeof patch.apiKey === 'string' && patch.apiKey.trim()) ai.apiKey = patch.apiKey.trim();
  s.ai = ai;
  writeSettings(s);
};
