// Word + sentence timestamps for a voiceover (whisper.cpp, installed on first use).
//   node ../studio/bin/transcribe.mjs <audio> [--model small] [--lang auto|en|hi]
// Writes <audio>.words.json beside the audio and prints the sentence starts.
import fs from 'node:fs';
import {transcribeFile} from '../server/transcribe.mjs';

const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args.splice(i, 2)[1] : d; };
const model = flag('model', 'small'), language = flag('lang', 'auto');
const [audio] = args;
if (!audio) { console.error('usage: transcribe.mjs <audio> [--model small] [--lang auto|en|hi]'); process.exit(1); }
const res = await transcribeFile(audio, {model, language, log: (m) => process.stderr.write(m + '\r')});
const out = `${audio}.words.json`;
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log(`\n${out}\nduration ${res.duration}s, ${res.words.length} words`);
res.sentences.forEach((s, i) => console.log(`${String(i + 1).padStart(2)}  ${s.start.toFixed(2).padStart(6)}-${s.end.toFixed(2)}  ${s.text}`));
