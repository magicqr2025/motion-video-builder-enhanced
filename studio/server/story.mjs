// Story assistant for the Brief page: idea -> script, improve a pasted script, and fill the rest of the brief from an approved script.
// One short text-only AI call per action (no tools, no project chat session), so it is quick and cheap.
import {query} from '@anthropic-ai/claude-agent-sdk';
import {STUDIO} from './paths.mjs';
import {getProject, saveProject, markAiStep} from './projects.mjs';
import {aiConfig, aiRuntime} from './settings.mjs';
import {startProcess, endProcess, addProcessTokens, activityLog} from './activity.mjs';
import {claudeEnv, runAgent} from './agent.mjs';
import {LOOK_SPEC} from './look.mjs';
import {stripAudioTags} from './voice.mjs';
import {guidelinesText} from './guidelines.mjs';

export const STORY_LANGS = ['English', 'Hinglish', 'Hindi', 'Hindi + English captions'];
export const STORY_CAPTIONS = ['word-by-word pill', 'step pill', 'kinetic big lines', 'subtitles', 'none'];
const WORDS_PER_SEC = 2.5; // ~150 words a minute

const SYSTEM = `You are a senior short-form video scriptwriter and producer for MagicBolt, a WhatsApp/AI marketing platform.
You write clear, spoken, human voiceover. Never invent facts, prices, features or numbers that are not in the material you are given.
Reply with exactly what is asked for and nothing else: no preface, no markdown, no commentary.`;

const ctxLines = (b) => [
  b.idea && `Idea / goal: ${b.idea}`, b.audience && `Audience: ${b.audience}`, b.cta && `Call to action: ${b.cta}`,
  b.language && `Language: ${b.language}`, b.durationSec && `Target length: about ${b.durationSec} seconds`,
  b.style && `Style / mood: ${b.style}`, b.onScreen && `Must appear on screen exactly: ${b.onScreen}`, b.notes && `Notes (do / don't): ${b.notes}`, b.links && `Reference links: ${b.links}`,
].filter(Boolean).join('\n');

const scriptRules = (b) => `Rules for the script:
- It is the spoken voiceover only. One sentence per line. No scene headings, no stage directions, no emojis, no hashtags, no quotation marks around it.
- Open with a hook in the first line. Finish with the call to action if one is given or obvious.
- Language: ${b.language || 'English'}${/hinglish/i.test(b.language || '') ? ' (Hindi words written in English letters)' : ''}.
- Square-bracket audio tags such as [whispers] or [pause] are delivery cues for the voice engine, not spoken words. Keep every one that is already in the text, in place. Do not add new ones.
- Length: about ${b.durationSec ? `${b.durationSec} seconds (~${Math.round(b.durationSec * WORDS_PER_SEC)} words)` : '45 to 60 seconds (~110 to 150 words)'}.`;

const PROMPTS = {
  script: (b) => `Write a voiceover script for a video.\n\n${ctxLines(b)}\n\n${scriptRules(b)}\n${b.instruction ? `\nThe previous draft was not right. Change this: ${b.instruction}\nPrevious draft:\n${b.script}\n` : ''}\nReply with only the script.`,
  split: (b) => `A creator pasted a story or rough idea for a short video. Split it into the parts a video team needs. Use only what is in the story; never invent facts, prices or features.\n\n${ctxLines(b)}\n\nStory:\n${b.story}\n${b.instruction ? `\nThe previous result was not right. Change this: ${b.instruction}\nPrevious script:\n${b.script}\n` : ''}${guidelinesText(b) ?`\nHouse rules to respect while planning:\n${guidelinesText(b)}\n` : ''}\nReturn ONLY a JSON object:\n{"script": "the exact spoken voiceover, one sentence per line, hook first, call to action last; ${b.language || 'English'}${/hinglish/i.test(b.language || '') ? ' (Hindi words in English letters)' : ''}; about ${b.durationSec ? `${b.durationSec} seconds (~${Math.round(b.durationSec * WORDS_PER_SEC)} words)` : '45 to 60 seconds'}; no scene headings, no emojis",\n "storyline": "the story beat by beat, one line per scene: 'Scene 1 (0-5s) Hook: what happens and why'. 5 to 9 scenes, in order",\n "visuals": "one line per scene, matching the storyline: what the viewer SEES: the main visual, the graphics, glossy 3D icons or characters, text on screen, and the camera or motion idea",\n "assets": [{"name": "short item name, e.g. WhatsApp chat screenshot", "kind": "one of: logo | image | footage | icon | screenshot | voiceover | music", "why": "which scene needs it, in a few words"}]}\nList in "assets" only the things the creator should supply or confirm (their logo, product screenshots, footage, photos, brand icons). Skip anything that can be drawn as a glossy 3D icon. At most 10.`,
  improve: (b) => `Improve this voiceover script. Keep every fact and claim, keep its meaning and language${b.instruction ? '' : ', make it tighter, more natural when spoken, with a stronger hook and a clear ending'}.\n${b.instruction ? `Specific request: ${b.instruction}\n` : ''}\n${ctxLines({...b, idea: b.idea})}\n\n${scriptRules(b)}\n\nCurrent script:\n${b.script}\n\nReply with only the improved script.`,
  fill: (b) => `Read this approved voiceover script and fill in the whole video brief that goes with it.\n\n${ctxLines(b)}\n\nScript:\n${stripAudioTags(b.script)}\n\nReturn ONLY a JSON object with these keys:
{"title": "a short video title, 2 to 6 words",
 "idea": "one sentence: what the video is and what it should achieve",
 "audience": "who it is for, short",
 "cta": "the call to action to show/say at the end (use the one in the script if there is one; otherwise a fitting short one)",
 "language": "exactly one of: ${STORY_LANGS.join(' | ')}",
 "onScreen": "key headlines, names, numbers or steps that must appear on screen, one per line, taken from the script only",
 "style": "a few mood/style words for the visuals, comma separated",
 "captions": "exactly one of: ${STORY_CAPTIONS.join(' | ')}",
 "notes": "up to 3 short do / don't lines for the designer, inferred from the tone and content (pacing, what to emphasise). Empty string if nothing is implied"}
Use only what the script and the context support; leave a value as an empty string if you cannot tell.`,
  score: (b) => `Score this short-form video voiceover script as a strict but fair reel coach. Judge only the text; never invent facts.\n\n${ctxLines(b)}\n\nScript (spoken text only):\n${stripAudioTags(b.script)}\n\nReturn ONLY a JSON object:\n{"score": <0-100 overall>, "verdict": "one plain sentence",\n "parts": [{"name": "Hook", "score": <0-10>, "note": "short"}, {"name": "Clarity", ...}, {"name": "Pacing", ...}, {"name": "Payoff", ...}, {"name": "Call to action", ...}, {"name": "Sounds spoken", ...}],\n "fixes": ["the 3 most valuable changes, most important first, each one short and concrete"]}\nThe first line is the hook: it must earn the next 3 seconds. Be specific, quote the line you mean. Plain English notes.`,
  hooks: (b) => `Write 6 alternative opening lines (hooks) for this voiceover script. Each must work as the very first spoken line, make sense with the rest of the script, and use a different hook formula (e.g. bold claim, question, number, mistake, contrast, curiosity gap, direct call-out). Never invent facts, numbers or claims that are not in the material.\n\n${ctxLines(b)}\n\nScript (spoken text only):\n${stripAudioTags(b.script)}\n\nWrite each hook in ${b.language || 'English'}${/hinglish/i.test(b.language || '') ? ' (Hindi words in English letters)' : ''}, under 14 words, spoken style, no emojis, no quotation marks.\nReturn ONLY a JSON object: {"hooks": [{"line": "the hook", "formula": "formula name", "why": "one short plain-English reason it works here"}]}`,
  look: (b, spec) => `Choose the visual "look & feel" options for a video. Be selective: more options means a longer, costlier build and a busier video, so only switch on what truly suits this video.\n\n${ctxLines(b)}\n${b.script ? `\nScript:\n${b.script}\n` : ''}\nOptions (level 0 = off, 1 = light, 2 = full):\n${spec.items.map((i) => `- ${i.key}: ${i.title}. ${i.desc}`).join('\n')}\n\nReady-made styles for reference: ${spec.bundles.map((x) => `${x.name} (${x.tagline})`).join('; ')}.\nCalm how-to / tutorial videos want few, subtle options. Short social reels can take bolder motion.\n\nReturn ONLY a JSON object:\n{"levels": {${spec.items.map((i) => `"${i.key}": 0`).join(', ')}}, "gradeMood": "one of: ${spec.moods.join(' | ')}", "reason": "two short plain sentences telling a non-technical person why you chose this"}`,
};

// ---------- the model call ----------
// `tools: []` alone still sends every built-in tool definition (~11k tokens); disallowing them by name cuts a call to ~1k.
const NO_TOOLS = ['Bash', 'Read', 'Write', 'Edit', 'MultiEdit', 'NotebookEdit', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'Task', 'Agent', 'TodoWrite', 'BashOutput', 'KillShell', 'ExitPlanMode'];
// Writing a short script does not need the biggest model: use the one chosen on the home page, else Sonnet.
const storyModel = (cfg) => cfg.model || process.env.STUDIO_STORY_MODEL || 'claude-opus-5-5';
const askClaude = async (prompt, {signal, cfg}) => {
  const ac = new AbortController();
  signal.addEventListener('abort', () => ac.abort(), {once: true});
  const env = await claudeEnv();
  let text = '', usage = {}, cost = 0, failure = '';
  const q = query({prompt, options: {cwd: STUDIO, systemPrompt: SYSTEM, tools: [], allowedTools: [], disallowedTools: NO_TOOLS, strictMcpConfig: true, mcpServers: {}, persistSession: false, maxTurns: 1, settingSources: [], permissionMode: 'default', abortController: ac, model: storyModel(cfg), env}});
  for await (const m of q) {
    if (m.type === 'assistant' && !m.parent_tool_use_id && !m.error && m.message?.model !== '<synthetic>') {
      for (const part of m.message.content ?? []) if (part.type === 'text') text += part.text;
    } else if (m.type === 'result') {
      cost = m.total_cost_usd ?? 0; usage = m.usage ?? {};
      if (m.subtype !== 'success' || m.is_error) failure = m.result || m.errors?.join('\n') || `Stopped (${m.subtype})`;
    }
  }
  if (signal.aborted) throw new Error('Stopped.');
  if (failure && !text.trim()) throw new Error(/log ?in|authenticat|401|credential/i.test(failure) ? `${failure}\nSign in to Claude Code on this PC (run "claude" in a terminal, then /login).` : failure);
  return {text, input: (usage.input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0), output: usage.output_tokens ?? 0, cost};
};

const askOpenAI = async (prompt, {signal, cfg, json}) => {
  const headers = {'Content-Type': 'application/json', ...(cfg.apiKey ? {Authorization: `Bearer ${cfg.apiKey}`} : {})};
  const r = await fetch(`${cfg.baseUrl}/chat/completions`, {method: 'POST', headers, signal, body: JSON.stringify({model: cfg.model, messages: [{role: 'system', content: SYSTEM}, {role: 'user', content: prompt}], ...(json ? {response_format: {type: 'json_object'}} : {})})});
  if (!r.ok) throw new Error(`${cfg.model} answered ${r.status}: ${(await r.text()).slice(0, 400)}`);
  const d = await r.json();
  return {text: d.choices?.[0]?.message?.content ?? '', input: d.usage?.prompt_tokens ?? 0, output: d.usage?.completion_tokens ?? 0, cost: 0};
};

// Codex has no tool-free one-shot here, so it goes through the normal agent turn (shows in the chat).
const askCodex = async (projectId, prompt, label) => {
  const texts = []; let failure = '';
  const ok = await runAgent(projectId, prompt, {label, emit: (e) => { if (e.kind === 'text') texts.push(e.text); if (e.kind === 'error') failure = e.text; }});
  if (!ok) throw new Error(failure || 'The AI could not answer.');
  return {text: texts.join('\n'), input: 0, output: 0, cost: 0};
};

const cleanScript = (t) => String(t).replace(/^```[a-z]*\n?|```$/gim, '').replace(/^\s*(script|voiceover)\s*:\s*/i, '').trim();
const parseJson = (t) => { try { return JSON.parse(t); } catch { const m = String(t).match(/\{[\s\S]*\}/); if (!m) throw new Error('The AI did not return the details in a usable form. Try again.'); return JSON.parse(m[0]); } };
const pickLang = (v) => STORY_LANGS.find((l) => l.toLowerCase() === String(v ?? '').trim().toLowerCase()) ?? (/hinglish/i.test(v) ? 'Hinglish' : /hindi/i.test(v) && /english/i.test(v) ? 'Hindi + English captions' : /hindi/i.test(v) ? 'Hindi' : /english/i.test(v) ? 'English' : null);

const jobs = new Map(); // projectId -> AbortController

export const storyBusy = (id) => jobs.has(id);
export const stopStory = (id) => jobs.get(id)?.abort();

const lookSpec = () => ({items: LOOK_SPEC.groups.flatMap((g) => g.items), bundles: LOOK_SPEC.bundles, moods: LOOK_SPEC.moods});

export const mountStory = (app, {wrap, need, changed, broadcast}) => {
  // One tracked, cancellable model call for a project. Throws on failure; Stopped (499) when the user cancels.
  const aiCall = async (req, res, p, label, prompt, {json = false} = {}) => {
    if (jobs.has(p.id)) throw Object.assign(new Error('The story assistant is already working on this video.'), {status: 409});
    const cfg = aiConfig();
    if (!['claude', 'codex'].includes(cfg.provider) && (!cfg.baseUrl || !cfg.model)) throw Object.assign(new Error('Choose and configure an AI model first (AI model on the Studio home page).'), {status: 400});
    const ac = new AbortController();
    jobs.set(p.id, ac);
    res.on('close', () => { if (!res.writableEnded) ac.abort(); });
    const rt = aiRuntime(cfg), t0 = Date.now();
    const proc = startProcess({kind: 'ai', source: 'story', label, projectId: p.id, model: rt.model || rt.engine, where: rt.where});
    broadcast({type: 'story', projectId: p.id, busy: true});
    try {
      const r = cfg.provider === 'claude' ? await askClaude(prompt, {signal: ac.signal, cfg})
        : cfg.provider === 'codex' ? await askCodex(p.id, prompt, label)
        : await askOpenAI(prompt, {signal: ac.signal, cfg, json});
      if (ac.signal.aborted) throw new Error('Stopped.');
      // finish(): load the latest project, and done() saves it and closes the tracked process
      const finish = () => {
        const q = getProject(p.id);
        return {q, done: () => {
          if (r.cost) q.cost = (q.cost ?? 0) + r.cost;
          markAiStep(q, 'brief');
          saveProject(q); changed(q.id);
          addProcessTokens(proc, {input: r.input, output: r.output}, r.cost);
          endProcess(proc, {status: 'done'});
          activityLog(`${label} done (${((Date.now() - t0) / 1000).toFixed(1)}s)`, {projectId: p.id, source: 'story', level: 'ok', processId: proc});
          return {engine: rt.engine, model: rt.model || 'default', where: rt.where, ms: Date.now() - t0, input: r.input, output: r.output, costUsd: r.cost || null};
        }};
      };
      return {r, finish};
    } catch (e) {
      endProcess(proc, {status: ac.signal.aborted ? 'stopped' : 'error', error: e.message});
      throw ac.signal.aborted ? Object.assign(new Error('Stopped.'), {status: 499}) : e;
    } finally { jobs.delete(p.id); broadcast({type: 'story', projectId: p.id, busy: false}); }
  };

  app.post('/api/projects/:id/story/assist', wrap(async (req, res) => {
    const p = need(req.params.id), action = req.body.action;
    if (!['script', 'improve', 'fill', 'score', 'hooks', 'split'].includes(action)) throw Object.assign(new Error('Unknown story action.'), {status: 400});
    if (action === 'score' || action === 'hooks') { // read-only checks: they never change the brief or the script
      const sb = {...p.brief, ...(req.body.brief ?? {})};
      if (!stripAudioTags(sb.script).trim()) throw Object.assign(new Error('There is no script yet.'), {status: 400});
      const {r, finish} = await aiCall(req, res, p, action === 'score' ? 'Story · score the script' : 'Story · find stronger hooks', PROMPTS[action](sb), {json: true});
      const out = parseJson(r.text), str = (v, n) => String(v ?? '').trim().slice(0, n);
      const {done} = finish();
      const usage = {...done(), action};
      if (action === 'hooks') return res.json({hooks: (Array.isArray(out.hooks) ? out.hooks : []).map((h) => ({line: str(h.line, 160), formula: str(h.formula, 40), why: str(h.why, 200)})).filter((h) => h.line).slice(0, 8), usage});
      const num = (v, hi) => Math.max(0, Math.min(hi, Math.round(Number(v)) || 0));
      return res.json({score: num(out.score, 100), verdict: str(out.verdict, 240), parts: (Array.isArray(out.parts) ? out.parts : []).map((x) => ({name: str(x.name, 30), score: num(x.score, 10), note: str(x.note, 240)})).filter((x) => x.name).slice(0, 8), fixes: (Array.isArray(out.fixes) ? out.fixes : []).map((f) => str(f, 240)).filter(Boolean).slice(0, 5), usage});
    }
    const b = {...p.brief, ...(req.body.brief ?? {}), instruction: String(req.body.instruction ?? '').trim()};
    if (action === 'split' && !String(b.story ?? '').trim()) throw Object.assign(new Error('Paste your story first.'), {status: 400});
    if (action === 'script' && !String(b.idea ?? '').trim() && !(b.instruction && b.script)) throw Object.assign(new Error('Write your idea first.'), {status: 400});
    if ((action === 'improve' || action === 'fill') && !String(b.script ?? '').trim()) throw Object.assign(new Error('There is no script yet.'), {status: 400});
    // Regenerating an improvement starts again from the user's own text, not from the previous AI rewrite.
    if (action === 'improve' && p.brief.scriptState === 'review' && String(p.brief.scriptOriginal ?? '').trim()) b.script = p.brief.scriptOriginal;
    const original = action === 'improve' ? b.script : null;
    const label = {split: 'Story · split the story into script, storyline and visuals', script: 'Story · write script from idea', improve: 'Story · improve script', fill: 'Story · fill the whole brief from the script'}[action];

    const {r, finish} = await aiCall(req, res, p, label, PROMPTS[action](b), {json: action === 'fill' || action === 'split'});
    const {q, done} = finish(), brief = {...q.brief}, filled = [];
    if (action === 'fill') {
      const out = parseJson(r.text), redo = !!req.body.overwrite;
      const words = (stripAudioTags(b.script).match(/\S+/g) ?? []).length;
      const empty = (k) => !String(brief[k] ?? '').trim();
      const set = (k, v) => { const val = Array.isArray(v) ? v.join('\n') : String(v ?? '').trim(); if (val && (redo || empty(k))) { brief[k] = val; filled.push(k); } };
      set('idea', out.idea); set('audience', out.audience); set('cta', out.cta); set('onScreen', out.onScreen); set('style', out.style); set('notes', out.notes);
      const lang = pickLang(out.language);
      if (lang && (redo || empty('language') || (brief.language === 'English' && !brief.storyFilled))) { brief.language = lang; filled.push('language'); }
      const cap = STORY_CAPTIONS.find((c) => c === String(out.captions ?? '').trim().toLowerCase());
      if (cap && (redo || empty('captions'))) { brief.captions = cap; filled.push('captions'); }
      if (words && (redo || !brief.durationSec)) { brief.durationSec = Math.max(10, Math.round(words / WORDS_PER_SEC / 5) * 5); filled.push('durationSec'); }
      const title = String(out.title ?? '').trim().replace(/^["']|["']$/g, '').slice(0, 80);
      if (title && (redo || !String(q.title ?? '').trim() || /^untitled/i.test(q.title))) { q.title = title; filled.push('title'); }
      if (String(req.body.brief?.script ?? '').trim()) brief.script = String(req.body.brief.script).trim();
      brief.scriptState = 'approved'; brief.storyFilled = true;
    } else if (action === 'split') {
      const out = parseJson(r.text), str = (v, n) => String(Array.isArray(v) ? v.join('\n') : v ?? '').trim().slice(0, n);
      const script = cleanScript(str(out.script, 8000));
      if (!script) throw new Error('The AI returned an empty script. Try again.');
      brief.story = str(b.story, 20000); brief.script = script; brief.storyline = str(out.storyline, 4000); brief.visuals = str(out.visuals, 6000);
      brief.assetsNeeded = (Array.isArray(out.assets) ? out.assets : []).map((a) => ({name: str(a.name, 80), kind: str(a.kind, 20).toLowerCase(), why: str(a.why, 120)})).filter((a) => a.name).slice(0, 10);
      brief.scriptState = 'review'; brief.storyMode = 'story'; delete brief.scriptOriginal;
    } else {
      const text = cleanScript(r.text);
      if (!text) throw new Error('The AI returned an empty script. Try again.');
      brief.script = text; brief.scriptState = 'review'; if (original) brief.scriptOriginal = original; else delete brief.scriptOriginal;
    }
    q.brief = brief; if (q.sessionId) q.briefDirty = true;
    const usage = done();
    if (filled.includes('title')) broadcast({type: 'projects'});
    res.json({brief, title: q.title, filled, usage: {...usage, action}});
  }));

  // Look & feel: the AI proposes a level (off / light / full) for every option. The browser saves it through the normal look route.
  app.post('/api/projects/:id/look/suggest', wrap(async (req, res) => {
    const p = need(req.params.id), b = {...p.brief, ...(req.body.brief ?? {})};
    if (!String(b.script ?? '').trim() && !String(b.idea ?? '').trim()) throw Object.assign(new Error('Write your idea or script on the Brief page first, so the AI knows what the video is about.'), {status: 400});
    const spec = lookSpec();
    const {r, finish} = await aiCall(req, res, p, 'Look & feel · choose the options', PROMPTS.look(b, spec), {json: true});
    const out = parseJson(r.text), keys = new Set(spec.items.map((i) => i.key));
    const levels = Object.fromEntries(Object.entries(out.levels ?? {}).filter(([k]) => keys.has(k)).map(([k, v]) => [k, Math.max(0, Math.min(2, Math.round(Number(v)) || 0))]));
    const {done} = finish();
    res.json({levels, gradeMood: spec.moods.includes(out.gradeMood) ? out.gradeMood : 'neutral', reason: String(out.reason ?? '').trim(), usage: {...done(), action: 'look'}});
  }));

  app.post('/api/projects/:id/story/cancel', wrap(async (req, res) => { stopStory(req.params.id); res.json({ok: true}); }));
};
