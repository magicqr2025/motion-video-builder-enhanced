// Turn a rendered MP4 into an animated GIF or animated WebP (no sound, loops forever).
// GIF: one ffmpeg pass with a generated palette. WebP: ffmpeg writes the frames, sharp encodes each one,
// and the frames are wrapped into an animated WebP file by hand (frame by frame, so memory stays small).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {FFMPEG} from './paths.mjs';
import {probe} from './remotion.mjs';

export const OUTPUT_FORMATS = {mp4: {label: 'MP4', ext: 'mp4'}, gif: {label: 'GIF', ext: 'gif'}, webp: {label: 'WebP', ext: 'webp'}};
export const ANIM_WIDTHS = [480, 720, 1080];
export const ANIM_FPS = [10, 15, 24];

const ffmpeg = (args, {signal, durationSec, onProgress}) => new Promise((resolve, reject) => {
  const child = spawn(FFMPEG, ['-y', '-v', 'error', '-nostats', '-progress', 'pipe:1', ...args], {windowsHide: true});
  let err = '';
  const abort = () => child.kill();
  if (signal?.aborted) abort(); else signal?.addEventListener('abort', abort, {once: true});
  child.stdout.on('data', (d) => {
    const us = Number(String(d).match(/out_time_ms=(\d+)/g)?.at(-1)?.split('=')[1]);
    if (Number.isFinite(us) && durationSec) onProgress?.(Math.min(0.99, us / 1e6 / durationSec));
  });
  child.stderr.on('data', (d) => { err += d; });
  child.on('error', reject);
  child.on('close', (code) => {
    signal?.removeEventListener('abort', abort);
    if (signal?.aborted) return reject(new Error('Cancelled'));
    code === 0 ? resolve() : reject(new Error(err.trim().slice(-400) || `ffmpeg exited with code ${code}`));
  });
});

const scaleFilter = (width) => `scale=${width}:-2:flags=lanczos`;
// this ffmpeg build has no fps filter, so the frame rate is set with -r on the output
// never upscale: cap the requested width at the source width
const capWidth = async (src, width) => Math.min(width, Math.round((await probe(src)).width) || width);

export const toGif = async ({src, out, width, fps, durationSec, signal, onProgress}) => ffmpeg(
  ['-i', src, '-an', '-vf', `${scaleFilter(await capWidth(src, width))},split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`, '-r', String(fps), '-loop', '0', out],
  {signal, durationSec, onProgress});

// ---- animated WebP container ----
const le = (n, bytes) => { const b = Buffer.alloc(bytes); b.writeUIntLE(n, 0, bytes); return b; };
const chunk = (type, payload) => Buffer.concat([Buffer.from(type, 'ascii'), le(payload.length, 4), payload, payload.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)]);

// the image data (ALPH / VP8 / VP8L chunks) of a single-frame .webp
const frameData = (webp) => {
  const parts = [];
  for (let i = 12; i + 8 <= webp.length;) {
    const type = webp.toString('ascii', i, i + 4), size = webp.readUInt32LE(i + 4), end = i + 8 + size + (size % 2);
    if (type === 'ALPH' || type === 'VP8 ' || type === 'VP8L') parts.push(webp.subarray(i, Math.min(end, webp.length)));
    i = end;
  }
  if (!parts.length) throw new Error('Could not read an encoded WebP frame.');
  return Buffer.concat(parts);
};

export const toWebp = async ({src, out, width, fps, quality = 75, durationSec, signal, onProgress}) => {
  const {default: sharp} = await import('sharp');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-webp-'));
  try {
    await ffmpeg(['-i', src, '-an', '-vf', scaleFilter(await capWidth(src, width)), '-r', String(fps), path.join(dir, 'f%05d.png')], {signal, durationSec, onProgress: (p) => onProgress?.(p * 0.5)});
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
    if (!files.length) throw new Error('No frames were produced.');
    const {width: w, height: h} = await sharp(path.join(dir, files[0])).metadata();
    const delay = Math.max(10, Math.round(1000 / fps));
    const fd = fs.openSync(out, 'w');
    let total = 4; // "WEBP"
    const write = (buf) => { fs.writeSync(fd, buf); total += buf.length; };
    fs.writeSync(fd, Buffer.concat([Buffer.from('RIFF'), le(0, 4), Buffer.from('WEBP')])); // size patched at the end
    write(chunk('VP8X', Buffer.concat([Buffer.from([0x02, 0, 0, 0]), le(w - 1, 3), le(h - 1, 3)]))); // animation flag
    write(chunk('ANIM', Buffer.concat([le(0, 4), le(0, 2)]))); // background colour, loop forever
    for (const [i, f] of files.entries()) {
      if (signal?.aborted) throw new Error('Cancelled');
      const webp = await sharp(path.join(dir, f)).removeAlpha().webp({quality, effort: 3, smartSubsample: true}).toBuffer();
      write(chunk('ANMF', Buffer.concat([le(0, 3), le(0, 3), le(w - 1, 3), le(h - 1, 3), le(delay, 3), Buffer.from([0x00]), frameData(webp)])));
      onProgress?.(0.5 + 0.5 * ((i + 1) / files.length));
    }
    fs.writeSync(fd, le(total, 4), 0, 4, 4);
    fs.closeSync(fd);
    return {frames: files.length, width: w, height: h};
  } catch (e) {
    try { fs.rmSync(out, {force: true}); } catch { /* ignore */ }
    throw e;
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
};

export const convertAnimated = ({format, ...opts}) => (format === 'gif' ? toGif(opts) : toWebp(opts));
