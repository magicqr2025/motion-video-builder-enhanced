// Generate an image with OpenAI's Images API and save it into /public.
//
//   node scripts/generate-image.mjs "<prompt>" [name] [--size 1024x1536] [--quality medium] [--model gpt-image-1]
//
// Sizes: 1024x1024 (square) · 1024x1536 (portrait, reels) · 1536x1024 (landscape, thumbnails)
// Needs OPENAI_API_KEY in the environment.

import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const args = process.argv.slice(2);
const flags = {size: '1024x1536', quality: 'medium', model: 'gpt-image-1'};
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) flags[args[i].slice(2)] = args[++i];
  else positional.push(args[i]);
}

const [prompt, name = `image-${Date.now()}`] = positional;
const key = process.env.OPENAI_API_KEY;

if (!prompt) {
  console.error('Usage: node scripts/generate-image.mjs "<prompt>" [name] [--size WxH] [--quality low|medium|high] [--model id]');
  process.exit(1);
}
if (!key) {
  console.error('OPENAI_API_KEY is not set. Set it as an environment variable and open a new terminal.');
  process.exit(1);
}

const res = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {'Content-Type': 'application/json', Authorization: `Bearer ${key}`},
  body: JSON.stringify({model: flags.model, prompt, size: flags.size, quality: flags.quality, n: 1}),
});

const body = await res.json();
if (!res.ok) {
  console.error(`OpenAI error ${res.status}: ${body.error?.message ?? JSON.stringify(body)}`);
  process.exit(1);
}

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
await mkdir(outDir, {recursive: true});
const out = path.join(outDir, `${name}.png`);
await writeFile(out, Buffer.from(body.data[0].b64_json, 'base64'));
console.log(`Saved ${out}`);
