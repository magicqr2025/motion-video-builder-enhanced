// Word-level timestamps for a voiceover, using whisper.cpp (installed on first use into studio/.whisper).
// Output JSON: {duration, language, words: [{text, start, end}], sentences: [{text, start, end}]}
import fs from 'node:fs';
import path from 'node:path';
import {STUDIO} from './paths.mjs';
import {toWav16k, probe} from './remotion.mjs';
import {readSettings} from './settings.mjs';

const WHISPER_DIR = path.join(STUDIO, '.whisper');
const BIN = path.join(WHISPER_DIR, 'whisper.cpp');
const VERSION = '1.5.5'; // the build Remotion hosts for Windows

// Transcription speed (Settings: transcribeMode). The slow model is only needed for languages the fast one is weak in.
//   auto      English -> base (fast), everything else (Hindi, Hinglish...) -> small
//   fast      base for everything
//   accurate  small for everything
export const TRANSCRIBE_MODES = ['auto', 'fast', 'accurate'];
export const modelFor = (mode = 'auto', language = 'auto') => (mode === 'accurate' ? 'small' : mode === 'fast' ? 'base' : language === 'en' ? 'base' : 'small');

export const transcribeFile = async (audio, {model, language = 'auto', log = console.log} = {}) => {
  model ??= modelFor(readSettings().transcribeMode, language);
  log(`using the ${model === 'small' ? 'accurate' : 'fast'} speech model (${model})`);
  const {installWhisperCpp, downloadWhisperModel, transcribe} = await import('@remotion/install-whisper-cpp');
  fs.mkdirSync(WHISPER_DIR, {recursive: true});
  const cwd = process.cwd();
  process.chdir(WHISPER_DIR); // the Windows installer unzips into the current directory
  try {
    await installWhisperCpp({to: BIN, version: VERSION, printOutput: false});
    await downloadWhisperModel({model, folder: BIN, printOutput: false, onProgress: (d, t) => log(`model ${Math.round((d / t) * 100)}%`)});
  } finally {
    process.chdir(cwd);
  }
  const wav = path.join(WHISPER_DIR, `in-${Date.now()}.wav`);
  await toWav16k(audio, wav);
  try {
    const out = await transcribe({inputPath: wav, whisperPath: BIN, whisperCppVersion: VERSION, model, tokenLevelTimestamps: true, splitOnWord: true, language: language === 'auto' ? null : language, printOutput: false, onProgress: (p) => log(`transcribing ${Math.round(p * 100)}%`)});
    const words = [];
    for (const seg of out.transcription) {
      for (const tok of seg.tokens ?? []) {
        const text = tok.text;
        if (!text.trim() || /^\[_/.test(text.trim())) continue;
        if (tok.offsets?.from == null || tok.offsets?.to == null) continue; // a token without timing (the engine adds a few special ones) used to crash the whole transcription
        const start = tok.offsets.from / 1000, end = tok.offsets.to / 1000;
        if (/^\s/.test(text) || !words.length) words.push({text: text.trim(), start, end});
        else { const w = words[words.length - 1]; w.text += text; w.end = end; } // sub-word token: glue on
      }
    }
    // sentences: split on . ? ! or a pause longer than 0.6 s
    const sentences = [];
    let cur = null;
    words.forEach((w, i) => {
      if (!cur) cur = {text: '', start: w.start, end: w.end};
      cur.text += (cur.text ? ' ' : '') + w.text;
      cur.end = w.end;
      const gap = (words[i + 1]?.start ?? Infinity) - w.end;
      if (/[.?!।]["'”’)\]]*$/.test(w.text) || gap > 0.6) { sentences.push(cur); cur = null; }
    });
    if (cur) sentences.push(cur);
    const round = (x) => Math.round(x * 100) / 100;
    return {
      duration: round((await probe(audio)).duration),
      language: out.result?.language ?? language,
      words: words.map((w) => ({...w, start: round(w.start), end: round(w.end)})),
      sentences: sentences.map((s) => ({...s, start: round(s.start), end: round(s.end)})),
    };
  } finally {
    fs.rmSync(wav, {force: true});
  }
};
