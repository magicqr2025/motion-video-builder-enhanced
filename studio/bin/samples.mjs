// Render the concept sample stills for a project.
//   node ../studio/bin/samples.mjs <projectId> [conceptId]
// Reads studio/data/<id>/concepts.json. Each concept's samples are [{t: seconds, label}] (or {frame}).
// Renders composition `composition` (default Studio-<id>-concepts) with props {concept: <concept id>}
// into studio/data/<id>/samples/<concept>-<n>.png and writes the file names back into concepts.json.
import fs from 'node:fs';
import path from 'node:path';
import {projectDir, conceptsCompId} from '../server/paths.mjs';
import {renderStills, awaitBundleCleanup} from '../server/remotion.mjs';

const [id, only] = process.argv.slice(2);
if (!id) { console.error('usage: samples.mjs <projectId> [conceptId]'); process.exit(1); }
const file = path.join(projectDir(id), 'concepts.json');
const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
const fps = doc.fps ?? 30;
const specs = [];
for (const c of doc.concepts) {
  if (only && c.id !== only) continue;
  (c.samples ?? []).forEach((s, i) => {
    const name = `${c.id}-${i + 1}.png`;
    s.file = `samples/${name}`;
    specs.push({composition: s.composition ?? doc.composition ?? conceptsCompId(id), frame: s.frame ?? Math.round((s.t ?? 0) * fps), props: {concept: c.id, ...(s.props ?? {})}, out: path.join(projectDir(id), 'samples', name)});
  });
}
const res = await renderStills(specs, {onProgress: (p) => p.file && console.log(`${p.stage} ${Math.round(p.progress * 100)}% ${path.basename(p.file)}`)});
fs.writeFileSync(file, JSON.stringify(doc, null, 2));
for (const r of res) console.log(r.ok ? `OK   ${r.out}` : `FAIL ${r.out}: ${r.error}`);
await awaitBundleCleanup(); // remove the temporary copy of the project before exiting
process.exit(res.every((r) => r.ok) ? 0 : 1);
