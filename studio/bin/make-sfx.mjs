// Synthesises the built-in sound effects used by the Look & feel "Sound effects" option:
// magicbolt-reel/public/sfx/{whoosh,pop,chime,click}.wav. Original sounds, so no licence to worry about.
//   node studio/bin/make-sfx.mjs
import fs from 'node:fs';
import path from 'node:path';
import {REEL} from '../server/paths.mjs';

const SR = 44100;
const outDir = path.join(REEL, 'public', 'sfx');
fs.mkdirSync(outDir, {recursive: true});

let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32 * 2 - 1; };
const make = (sec, fn) => Float32Array.from({length: Math.floor(sec * SR)}, (_, i) => fn(i / SR, i));
const bell = (x) => Math.sin(Math.PI * Math.min(1, Math.max(0, x)));

const write = (name, data) => {
  const peak = data.reduce((m, v) => Math.max(m, Math.abs(v)), 0.0001);
  const fadeN = Math.floor(0.01 * SR);
  const buf = Buffer.alloc(44 + data.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + data.length * 2, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => {
    const edge = Math.min(1, i / fadeN, (data.length - 1 - i) / fadeN); // no clicks at the ends
    buf.writeInt16LE(Math.round((v / peak) * 0.8 * edge * 32767), 44 + i * 2);
  });
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(name, (data.length / SR).toFixed(2) + 's');
};

// whoosh: noise through a band-pass that sweeps up then down
{
  let low = 0, band = 0;
  write('whoosh.wav', make(0.8, (t) => {
    const x = t / 0.8;
    const fc = 250 + 2600 * bell(x); // centre frequency sweeps up and back down
    const f = 2 * Math.sin((Math.PI * fc) / SR); // state-variable filter coefficient
    const q = 0.5;
    const input = rnd();
    low += f * band; const high = input - low - q * band; band += f * high;
    return band * bell(x) ** 1.4;
  }));
}
// pop: quick falling sine plus a tiny click
write('pop.wav', make(0.25, (t) => Math.sin(2 * Math.PI * (180 + 520 * Math.exp(-t * 38)) * t) * Math.exp(-t * 22) + (t < 0.004 ? rnd() * 0.3 : 0)));
// chime: three soft partials decaying
write('chime.wav', make(1.4, (t) => [[880, 1], [1318.5, 0.5], [1760, 0.3]].reduce((s, [f, a]) => s + a * Math.sin(2 * Math.PI * f * t), 0) * Math.exp(-t * 3.2)));
// click: very short tick
write('click.wav', make(0.06, (t) => (rnd() * 0.5 + Math.sin(2 * Math.PI * 2100 * t)) * Math.exp(-t * 110)));
