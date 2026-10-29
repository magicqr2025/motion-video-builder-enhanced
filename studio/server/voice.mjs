// ElevenLabs voiceover: turn a project's script into an audio file, preview it, and (only if asked) save it into the project.
// Audio tags such as [whispers] or [pause] live inside the script text. They are for the voice engine only: stripAudioTags()
// removes them everywhere else (the brief the video-building AI reads, word counts) and before sending to any model that cannot act them out.
import fs from 'node:fs';
import path from 'node:path';
import {DATA, projectDir} from './paths.mjs';
import {activityLog} from './activity.mjs';

const API = 'https://api.elevenlabs.io/v1';
const FILE = path.join(DATA, 'voice.json'); // data/ is never committed; the key stays out of settings.json so /api/settings can never return it

// [tag]: a short square-bracket phrase on one line. Matches ElevenLabs v3 tags (free-form, e.g. [whispers], [French accent]).
const TAG = /[ \t]*\[[A-Za-z][^\[\]\n]{0,39}\][ \t]*/g;
export const stripAudioTags = (t) => String(t ?? '').replace(TAG, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/ {2,}/g, ' ').trim();
export const countAudioTags = (t) => (String(t ?? '').match(TAG) ?? []).length;

export const MODELS = [
  {id: 'eleven_v4', name: 'Eleven v4', note: 'Newest and most emotive. Acts out audio tags.', tags: true, maxChars: 10000}, // ElevenLabs does not publish a v4 limit: the API answers if it is too long
  {id: 'eleven_v4_turbo', name: 'Eleven v4 Turbo', note: 'Faster v4 for quick drafts. Acts out audio tags.', tags: true, maxChars: 10000},
  {id: 'eleven_v3', name: 'Eleven v3', note: 'Previous generation. Expressive, acts out audio tags.', tags: true, maxChars: 5000},
  {id: 'eleven_multilingual_v2', name: 'Multilingual v2', note: 'Stable and natural. Tags are removed before sending.', tags: false, maxChars: 10000},
  {id: 'eleven_flash_v2_5', name: 'Flash v2.5', note: 'Fastest and cheapest. Tags are removed before sending.', tags: false, maxChars: 40000},
];
// v3 only accepts these three stability values; the same three are used for every model so the control stays simple (v4 takes them too).
export const STABILITY = {creative: 0, natural: 0.5, robust: 1};
const DEFAULTS = {voiceId: '', modelId: 'eleven_v4', stability: 'natural'};

const read = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } };
const write = (v) => { fs.mkdirSync(DATA, {recursive: true}); fs.writeFileSync(FILE, JSON.stringify(v, null, 2)); };
const apiKey = () => read().apiKey || process.env.ELEVENLABS_API_KEY || '';
const hint = (k) => (k ? `${k.slice(0, 3)}…${k.slice(-4)}` : '');

export const voiceStatus = () => {
  const s = {...DEFAULTS, ...read()}, key = apiKey();
  return {connected: !!key, keyHint: hint(key), fromEnv: !read().apiKey && !!key, voiceId: s.voiceId, modelId: s.modelId, stability: s.stability, models: MODELS, tagGroups: TAG_GROUPS};
};

export const TAG_GROUPS = [
  {name: 'Emotion', tags: ['excited', 'calm', 'happy', 'serious', 'curious', 'sad', 'nervous', 'frustrated', 'sarcastic']},
  {name: 'Delivery', tags: ['whispers', 'shouts', 'softly', 'slowly', 'rushed', 'confident']},
  {name: 'Reaction', tags: ['laughs', 'chuckles', 'sighs', 'gasps', 'clears throat', 'exhales']},
  {name: 'Pause', tags: ['short pause', 'pause', 'long pause']},
];

// ---------- ElevenLabs calls ----------
const fail = async (r) => {
  const body = await r.json().catch(() => ({}));
  const d = body.detail, msg = String(typeof d === 'string' ? d : d?.message || body.message || r.statusText).replace(/[.\s]+$/, '');
  const status = r.status === 401 ? 401 : r.status === 402 || r.status === 429 ? 402 : 502;
  const hintText = r.status === 401 ? ' Check the API key (and that it allows text-to-speech).' : r.status === 402 ? ' Your ElevenLabs plan may be out of credits or limited.' : '';
  return Object.assign(new Error(`ElevenLabs: ${msg}.${hintText}`), {status});
};
const el = async (url, {key = apiKey(), ...init} = {}) => {
  if (!key) throw Object.assign(new Error('Connect ElevenLabs first (paste your API key).'), {status: 400});
  const r = await fetch(`${API}${url}`, {...init, headers: {'xi-api-key': key, ...(init.headers ?? {})}}).catch((e) => { throw Object.assign(new Error(`Could not reach ElevenLabs: ${e.message}`), {status: 502}); });
  if (!r.ok) throw await fail(r);
  return r;
};

const listVoices = async () => {
  const r = await el('/voices');
  const d = await r.json();
  return (d.voices ?? []).map((v) => ({id: v.voice_id, name: v.name, category: v.category ?? '', desc: [v.labels?.accent, v.labels?.gender, v.labels?.descriptive ?? v.labels?.use_case].filter(Boolean).join(' · '), preview: v.preview_url ?? ''}))
    .sort((a, b) => (a.category === 'premade') - (b.category === 'premade') || a.name.localeCompare(b.name));
};

const synth = async ({text, voiceId, modelId, stability}) => {
  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  const sent = model.tags ? text.trim() : stripAudioTags(text);
  if (!sent) throw Object.assign(new Error('There is no script text to speak.'), {status: 400});
  if (sent.length > model.maxChars) throw Object.assign(new Error(`The script is ${sent.length.toLocaleString()} characters; ${model.name} takes up to ${model.maxChars.toLocaleString()} per request. Shorten it or pick another model.`), {status: 400});
  const body = JSON.stringify({text: sent, model_id: model.id, voice_settings: {stability: STABILITY[stability] ?? STABILITY.natural}});
  const id = encodeURIComponent(voiceId);
  let audio = null, alignment = null;
  // Ask for the audio together with the time of every character: that gives the word timings for free, so the studio does not
  // have to transcribe the voiceover afterwards (the slowest step on this PC). If that route is refused, fall back to plain audio.
  try {
    const r = await el(`/text-to-speech/${id}/with-timestamps?output_format=mp3_44100_128`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body});
    const j = await r.json();
    if (j.audio_base64) { audio = Buffer.from(j.audio_base64, 'base64'); alignment = j.alignment ?? null; }
  } catch (e) { if (e.status === 401 || e.status === 402) throw e; }
  if (!audio) {
    const r = await el(`/text-to-speech/${id}?output_format=mp3_44100_128`, {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'audio/mpeg'}, body});
    audio = Buffer.from(await r.arrayBuffer());
  }
  return {audio, alignment, model, sentChars: sent.length, tagsSent: model.tags ? countAudioTags(sent) : 0, tagsRemoved: model.tags ? 0 : countAudioTags(text)};
};

// ElevenLabs gives the start and end second of every character. Turn that into the same word timing file the transcription makes
// ({duration, language, words, sentences}), leaving out the audio tags, which are not spoken.
export const alignmentToTranscript = (al, {duration = 0, language = 'auto'} = {}) => {
  const chars = al?.characters, st = al?.character_start_times_seconds, en = al?.character_end_times_seconds;
  if (!Array.isArray(chars) || !chars.length || !Array.isArray(st) || !Array.isArray(en)) return null;
  const joined = chars.join(''), skip = new Uint8Array(joined.length + 1), off = [];
  let pos = 0;
  for (const c of chars) { off.push(pos); pos += c.length; }
  for (const m of joined.matchAll(new RegExp(TAG.source, 'g'))) for (let k = m.index; k < m.index + m[0].length; k++) skip[k] = 1;
  const words = []; let cur = null;
  const flush = () => { if (cur) { words.push(cur); cur = null; } };
  chars.forEach((c, i) => {
    if (skip[off[i]] || /\s/.test(c)) return flush();
    if (cur) { cur.text += c; cur.end = en[i]; } else cur = {text: c, start: st[i], end: en[i]};
  });
  flush();
  if (!words.length) return null;
  const sentences = []; let s = null;
  words.forEach((w, i) => {
    if (!s) s = {text: '', start: w.start, end: w.end};
    s.text += (s.text ? ' ' : '') + w.text; s.end = w.end;
    const gap = (words[i + 1]?.start ?? Infinity) - w.end;
    if (/[.?!।]["'”’)\]]*$/.test(w.text) || gap > 0.6) { sentences.push(s); s = null; }
  });
  if (s) sentences.push(s);
  const round = (x) => Math.round(x * 100) / 100;
  return {duration: round(duration || words.at(-1).end), language, source: 'elevenlabs', words: words.map((w) => ({...w, start: round(w.start), end: round(w.end)})), sentences: sentences.map((x) => ({...x, start: round(x.start), end: round(x.end)}))};
};

// ---------- routes ----------
export const mountVoice = (app, {wrap, need, probe, storeAsset, changed}) => {
  const draftDir = (id) => path.join(projectDir(id), 'voice');
  const draftPath = (id, name) => (/^[\w-]+\.mp3$/.test(name) ? path.join(draftDir(id), name) : null);

  app.get('/api/voice', wrap(async (req, res) => res.json(voiceStatus())));

  // Save the key and/or the chosen voice, model and stability. A key is checked against ElevenLabs before it is kept.
  app.put('/api/voice', wrap(async (req, res) => {
    const b = req.body ?? {}, cur = read(), next = {...cur};
    if (b.apiKey === null) delete next.apiKey;
    else if (typeof b.apiKey === 'string' && b.apiKey.trim()) {
      const key = b.apiKey.trim();
      await el('/user', {key}).catch((e) => { if (e.status === 401) throw e; /* a key limited to text-to-speech cannot read /user: fine */ });
      next.apiKey = key;
    }
    if (typeof b.voiceId === 'string') next.voiceId = b.voiceId.trim();
    if (MODELS.some((m) => m.id === b.modelId)) next.modelId = b.modelId;
    if (b.stability in STABILITY) next.stability = b.stability;
    write(next);
    if (b.apiKey !== undefined) activityLog(b.apiKey === null ? 'ElevenLabs disconnected' : 'ElevenLabs connected', {source: 'voice', level: 'ok'});
    res.json(voiceStatus());
  }));

  app.get('/api/voice/voices', wrap(async (req, res) => res.json({voices: await listVoices()})));

  // Make audio from the script. Nothing is added to the project: the file is a draft the user can play, download or save.
  app.post('/api/projects/:id/voice/generate', wrap(async (req, res) => {
    const p = need(req.params.id), b = req.body ?? {}, s = {...DEFAULTS, ...read()};
    const voiceId = String(b.voiceId || s.voiceId || '').trim();
    if (!voiceId) throw Object.assign(new Error('Choose a voice first.'), {status: 400});
    const text = String(b.text ?? p.brief.script ?? '');
    const t0 = Date.now();
    let out;
    try { out = await synth({text, voiceId, modelId: b.modelId || s.modelId, stability: b.stability || s.stability}); }
    catch (e) { activityLog(`ElevenLabs could not make the voiceover: ${e.message}`, {projectId: p.id, source: 'voice', level: 'error'}); throw e; }
    fs.mkdirSync(draftDir(p.id), {recursive: true});
    const name = `voice-${Date.now()}.mp3`, file = path.join(draftDir(p.id), name);
    fs.writeFileSync(file, out.audio);
    for (const old of fs.readdirSync(draftDir(p.id)).filter((f) => /^voice-\d+\.mp3$/.test(f)).sort().slice(0, -8)) { for (const ext of ['.mp3', '.json', '.meta.json']) fs.rmSync(path.join(draftDir(p.id), old.replace(/\.mp3$/, ext)), {force: true}); } // keep the last 8 drafts
    const info = await probe(file).catch(() => null);
    const lang = /hindi|hinglish/i.test(p.brief.language ?? '') ? 'hi' : /english/i.test(p.brief.language ?? '') ? 'en' : 'auto';
    const transcript = alignmentToTranscript(out.alignment, {duration: info?.duration, language: lang});
    if (transcript) fs.writeFileSync(file.replace(/\.mp3$/, '.json'), JSON.stringify(transcript, null, 1)); // saved with the draft; used when the draft is saved to the project
    fs.writeFileSync(file.replace(/\.mp3$/, '.meta.json'), JSON.stringify({script: text, voiceId, modelId: out.model.id, stability: b.stability || s.stability, chars: out.sentChars, tagsSent: out.tagsSent, language: lang, at: Date.now()})); // what the voiceover was made from, for the library
    activityLog(`ElevenLabs voiceover made (${out.model.name}, ${out.sentChars} characters${out.tagsSent ? `, ${out.tagsSent} audio tags` : ''}${transcript ? `, ${transcript.words.length} word timings` : ', no timings'}, ${((Date.now() - t0) / 1000).toFixed(1)}s)`, {projectId: p.id, source: 'voice', level: 'ok'});
    res.json({draft: name, url: `/data/${p.id}/voice/${name}`, seconds: info?.duration ? Math.round(info.duration * 10) / 10 : null, bytes: out.audio.length, model: out.model.id, chars: out.sentChars, tagsSent: out.tagsSent, tagsRemoved: out.tagsRemoved, timed: !!transcript, timedWords: transcript?.words.length ?? 0});
  }));

  // Only on request: put a draft into the project as its voiceover (it is then transcribed like any uploaded voiceover).
  app.post('/api/projects/:id/voice/save', wrap(async (req, res) => {
    const p = need(req.params.id), src = draftPath(p.id, String(req.body?.draft ?? ''));
    if (!src || !fs.existsSync(src)) throw Object.assign(new Error('That voiceover is no longer available. Generate it again.'), {status: 404});
    let transcript = null;
    try { transcript = JSON.parse(fs.readFileSync(src.replace(/\.mp3$/, '.json'), 'utf8')); } catch { /* no timings with this draft: it is transcribed instead */ }
    const asset = await storeAsset(p, src, `voiceover-${new Date().toLocaleDateString('en-CA')}.mp3`, 'audio/mpeg', 'voiceover', transcript);
    activityLog(`Saved the ElevenLabs voiceover to the project as ${asset.file}${transcript ? ' (word timings came with it, no transcription needed)' : ''}`, {projectId: p.id, source: 'voice', level: 'ok'});
    changed(p.id);
    res.json({asset, timed: !!transcript});
  }));
};
