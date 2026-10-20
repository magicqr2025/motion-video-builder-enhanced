// Every location the studio reads or writes. The Remotion project it drives is ../magicbolt-reel.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

export const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REEL = path.resolve(process.env.REMOTION_PROJECT ?? path.join(STUDIO, '..', 'magicbolt-reel'));

export const DATA = path.join(STUDIO, 'data'); // project.json, chat log, samples, renders (never bundled)
export const PRESETS = path.join(STUDIO, 'presets');
export const BRANDS = path.join(STUDIO, 'brands');
export const WEB = path.join(STUDIO, 'web');

export const REEL_SRC_STUDIO = path.join(REEL, 'src', 'studio'); // code: src/studio/<id>/
export const REEL_PUBLIC_STUDIO = path.join(REEL, 'public', 'studio'); // assets: public/studio/<id>/
export const REEL_ENTRY = path.join(REEL, 'src', 'index.ts');

export const projectDir = (id) => path.join(DATA, id);
export const projectCode = (id) => path.join(REEL_SRC_STUDIO, id);
export const projectAssets = (id) => path.join(REEL_PUBLIC_STUDIO, id);

// Remotion packages are resolved from the Remotion project so versions always match it
export const reelRequire = createRequire(path.join(REEL, 'package.json'));
export const REMOTION_CLI = path.join(REEL, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
// Remotion ships ffmpeg/ffprobe inside its platform compositor package; fall back to PATH elsewhere
const compositorDir = (() => {
  const pkg = {win32: 'win32-x64-msvc', darwin: `darwin-${process.arch}`, linux: `linux-${process.arch}-gnu`}[process.platform];
  try { return path.dirname(reelRequire.resolve(`@remotion/compositor-${pkg}/package.json`)); } catch { return null; }
})();
const exe = process.platform === 'win32' ? '.exe' : '';
export const FFMPEG = compositorDir ? path.join(compositorDir, `ffmpeg${exe}`) : 'ffmpeg';
export const FFPROBE = compositorDir ? path.join(compositorDir, `ffprobe${exe}`) : 'ffprobe';

// composition ids built from a project id: Studio-<id> (the video) and Studio-<id>-concepts (samples)
export const compId = (id) => `Studio-${id}`;
export const conceptsCompId = (id) => `Studio-${id}-concepts`;
