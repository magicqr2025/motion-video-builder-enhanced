// Turn a reference video into contact sheets (and a wav) you can look at.
//   node ../studio/bin/reference.mjs <video> <outDir>
import {extractReference} from '../server/remotion.mjs';

const [video, out] = process.argv.slice(2);
if (!out) { console.error('usage: reference.mjs <video> <outDir>'); process.exit(1); }
console.log(JSON.stringify(await extractReference(video, out), null, 1));
