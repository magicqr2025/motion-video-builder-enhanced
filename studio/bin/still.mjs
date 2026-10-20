// Render one check still.   node ../studio/bin/still.mjs <compositionId> <seconds | fN> <out.png> [propsJson]
import path from 'node:path';
import {renderStills} from '../server/remotion.mjs';

const [composition, at, out, props] = process.argv.slice(2);
if (!out) { console.error('usage: still.mjs <compositionId> <seconds|fN> <out.png> [propsJson]'); process.exit(1); }
const frame = /^f\d+$/.test(at) ? Number(at.slice(1)) : Math.round(Number(at) * 30);
const [r] = await renderStills([{composition, frame, props: props ? JSON.parse(props) : {}, out: path.resolve(out)}]);
console.log(r.ok ? `OK ${r.out}` : `FAIL ${r.error}`);
process.exit(r.ok ? 0 : 1);
