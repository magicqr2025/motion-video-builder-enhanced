// The motion catalog (studio/catalog/motion-catalog.json): named effects and layouts the user can pick in the brief,
// tag references with ("borrow the transitions from this clip"), and that the agent maps onto src/studio/kit.
import fs from 'node:fs';
import path from 'node:path';
import {STUDIO} from './paths.mjs';

const FILE = path.join(STUDIO, 'catalog', 'motion-catalog.json');
export const getCatalog = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {categories: [], items: []}; } };

export const catalogCats = () => getCatalog().categories.map((c) => c.id);
export const cleanBorrow = (v) => { const ok = new Set(catalogCats()); return [...new Set((Array.isArray(v) ? v : []).filter((x) => ok.has(x)))]; };
export const cleanPicks = (v) => { const ok = new Set(getCatalog().items.map((i) => i.id)); return [...new Set((Array.isArray(v) ? v : []).filter((x) => ok.has(x)))]; };

// what the agent reads: the user's picks (exact kit pieces) and the references with what to borrow from each
export const inspirationContext = (p) => {
  const cat = getCatalog(), picks = new Set(p.brief.effects ?? []);
  const catTitle = Object.fromEntries(cat.categories.map((c) => [c.id, c.title.toLowerCase()]));
  const lines = [];
  if (picks.size) {
    const by = cat.categories.map((c) => [c, cat.items.filter((i) => picks.has(i.id) && i.cat === c.id)]).filter(([, items]) => items.length);
    lines.push('Picked from the motion library. Use exactly these (kit piece after the arrow; read src/studio/kit/KIT.md for their props):');
    for (const [c, items] of by) lines.push(`- ${c.title}: ${items.map((i) => `${i.name} (${i.desc.toLowerCase()}) -> ${i.kit}`).join('; ')}`);
  }
  const refs = p.assets.filter((a) => a.role === 'reference' && (a.borrow?.length || a.note));
  if (refs.length) {
    lines.push('Reference material to borrow from. Study it (videos: the frames in the data folder named below, look at the frames either side of a cut to see the transition; images: Read the file). Recreate the technique with the closest kit pieces and say which you used. Never copy the reference\'s branding, text, logos or imagery.');
    for (const a of refs) {
      const where = a.kind === 'video' ? (a.refDir ? `frames in data/${p.id}/${a.refDir}/` : 'frames still being extracted') : `image public/studio/${p.id}/${a.file}`;
      lines.push(`- ${a.original} (${where}): borrow ${a.borrow?.length ? a.borrow.map((b) => catTitle[b] ?? b).join(', ') : 'the overall feel'}${a.note ? `; user says: ${a.note}` : ''}`);
    }
  }
  if (!lines.length) return '';
  lines.push('Where a reference and a pick disagree, the pick wins. If a borrowed technique is missing from the kit, build it in the project folder (not in the kit) and say so.');
  return `### Motion & layout direction (chosen by the user)\n${lines.join('\n')}`;
};

// the whole vocabulary in one compact block, for the system prompt: lets the user say "use the iris transition" in the notes
export const vocabulary = () => {
  const cat = getCatalog();
  return cat.categories.map((c) => `- ${c.title}: ${cat.items.filter((i) => i.cat === c.id).map((i) => `${i.name} = ${i.kit}`).join('; ')}`).join('\n');
};
