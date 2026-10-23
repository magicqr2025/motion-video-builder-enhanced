// Render one check still.   node ../studio/bin/still.mjs <compositionId> <seconds | fN> <out.png> [propsJson] [--scale 0.5]
// --scale 0.5 renders at half size: enough to judge layout and costs ~60% fewer image tokens when the still is read.
import path from 'node:path';
import {renderStills} from '../server/remotion.mjs';

const argv = process.argv.slice(2);
const si = argv.indexOf('--scale');
const scale = si >= 0 ? Math.min(1, Math.max(0.25, Number(argv.splice(si, 2)[1]) || 1)) : 1;
const [composition, at, out, props] = argv;
if (!out) { console.error('usage: still.mjs <compositionId> <seconds|fN> <out.png> [propsJson] [--scale 0.5]'); process.exit(1); }
const frame = /^f\d+$/.test(at) ? Number(at.slice(1)) : Math.round(Number(at) * 30);
const [r] = await renderStills([{composition, frame, props: props ? JSON.parse(props) : {}, out: path.resolve(out), scale}]);
console.log(r.ok ? `OK ${r.out}` : `FAIL ${r.error}`);
process.exit(r.ok ? 0 : 1);
