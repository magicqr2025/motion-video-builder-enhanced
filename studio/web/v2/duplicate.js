// Duplicate a video (a full working copy, optionally at another size, optionally adapted by Claude) and the banner that
// offers "Adapt with Claude" when the brief no longer matches the built video. Same /duplicate and /adapt routes as the classic app.
import {$, S, api, esc, toast, flushSave} from './core.js';

const SIZES = [['Reel 9:16', 1080, 1920], ['Landscape 16:9', 1920, 1080], ['Square 1:1', 1080, 1080], ['Portrait 4:5', 1080, 1350], ['Loop 1200²', 1200, 1200], ['4K 16:9', 3840, 2160]];
const LABELS = {idea: 'idea', audience: 'audience', cta: 'call to action', language: 'language', script: 'script', onScreen: 'on-screen text', durationSec: 'length', colors: 'colours', style: 'style', captions: 'captions', notes: 'notes', brandId: 'brand'};

// what differs between the brief now and what the video was built from (a copy remembers the brief it was made from)
const diff = (p, sb) => {
  const out = [], from = p.duplicatedFrom?.brief, b = p.brief;
  const bw = sb?.width || from?.width, bh = sb?.height || from?.height, bf = sb?.fps || from?.fps;
  if (bw && bh && (bw !== b.width || bh !== b.height)) out.push(`size ${bw}×${bh} → ${b.width}×${b.height}`);
  if (bf && bf !== b.fps) out.push(`${bf} → ${b.fps} fps`);
  if (from) for (const [k, l] of Object.entries(LABELS)) if (JSON.stringify(from[k] ?? null) !== JSON.stringify(b[k] ?? null)) out.push(l);
  return out;
};
export const adaptBanner = (c) => {
  const p = c.project;
  if (c.busy || !c.storyboard) return '';
  const d = diff(p, c.storyboard), dup = p.duplicatedFrom;
  if (!d.length) return '';
  return `<div class="card accent tight"><div class="spread"><div style="flex:1 1 320px"><b>${dup ? `Copy of “${esc(dup.title)}”: ` : ''}the brief no longer matches the built video</b><div class="small muted">Changed: ${esc(d.join(' · '))}. Claude keeps the concept, copy, timing and voiceover and adapts the scenes${d.some((x) => x.startsWith('size')) ? ' to the new size' : ''}.</div></div>
    <div class="row"><input class="in" id="adapt-notes" placeholder="anything else to change? (optional)" style="width:260px" /><button type="button" class="btn main sm" data-dup="adapt">Adapt with Claude</button></div></div></div>`;
};

export const openDuplicate = () => {
  const p = S.cur.project, b = p.brief;
  $('#dup-dialog')?.remove();
  const same = SIZES.some(([, w, h]) => w === b.width && h === b.height);
  const sizes = same ? SIZES : [[`Same ${b.width}×${b.height}`, b.width, b.height], ...SIZES];
  const d = document.createElement('dialog');
  d.id = 'dup-dialog'; d.dataset.size = `${b.width}x${b.height}`;
  d.innerHTML = `<div class="dup-box stack">
    <div><h2>Duplicate this video</h2><p class="muted small" style="margin:6px 0 0">Makes a full working copy: brief, media, concept, scenes, text, audio and look. “${esc(p.title)}” is not touched. The copy opens with everything filled in, so you only change what you need.</p></div>
    <label class="f"><span>Name</span><input class="in" id="dup-title" value="${esc(`${p.title} (copy)`)}" /></label>
    <div class="f"><span>Size of the copy</span><div class="sizes" id="dup-sizes">${sizes.map(([l, w, h]) => { const k = 30, bw = w >= h ? k : Math.max(10, Math.round((k * w) / h)), bh = h >= w ? k : Math.max(10, Math.round((k * h) / w)); return `<button type="button" class="size ${w === b.width && h === b.height ? 'on' : ''}" data-dup-size="${w}x${h}"><span class="ar"><i style="width:${bw}px;height:${bh}px"></i></span><b>${esc(l.split(' ')[0])}</b><small>${w}×${h}</small></button>`; }).join('')}</div></div>
    <label class="f"><span>What should change? (optional)</span><textarea class="in" id="dup-notes" rows="3" placeholder="e.g. Make it for YouTube. Shorter intro, new CTA, bigger text."></textarea></label>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-dup="cancel">Cancel</button>
      <button type="button" class="btn" data-dup="go" data-adapt="0" title="Only copies. Open the copy, edit the Brief, then press Adapt with Claude when you are ready.">Duplicate only</button>
      <button type="button" class="btn main" data-dup="go" data-adapt="1" title="Copies, then Claude re-lays out the scenes for the new size and applies your notes. Uses your Claude plan.">Duplicate &amp; adapt with Claude</button></div>
    <p class="small muted" style="margin:0">Duplicate only costs nothing. Adapt with Claude is one request on your Claude plan; it resizes and applies the changes without redesigning.</p></div>`;
  document.body.append(d); d.showModal();
  d.addEventListener('close', () => d.remove());
  $('#dup-title', d).select();
};

document.addEventListener('click', async (ev) => {
  const sz = ev.target.closest('[data-dup-size]');
  if (sz) { const d = sz.closest('dialog'); d.dataset.size = sz.dataset.dupSize; d.querySelectorAll('[data-dup-size]').forEach((x) => x.classList.toggle('on', x === sz)); return; }
  const b = ev.target.closest('[data-dup]');
  if (!b || !S.cur) return;
  const id = S.cur.project.id;
  try {
    if (b.dataset.dup === 'open') openDuplicate();
    else if (b.dataset.dup === 'cancel') $('#dup-dialog')?.close();
    else if (b.dataset.dup === 'go') {
      const d = $('#dup-dialog'), adapt = b.dataset.adapt === '1', [w, h] = d.dataset.size.split('x').map(Number);
      d.querySelectorAll('button').forEach((x) => (x.disabled = true));
      try {
        const np = await api(`/api/projects/${id}/duplicate`, {method: 'POST', body: {title: $('#dup-title').value, width: w, height: h, adapt, notes: $('#dup-notes').value}});
        d.close(); toast(adapt ? 'Copied. Claude is adapting it…' : 'Copied. Change the brief, then press Adapt with Claude.', 5000);
        location.hash = `#/p/${encodeURIComponent(np.id)}/${adapt ? 'build' : 'brief'}`;
      } catch (e) { d.querySelectorAll('button').forEach((x) => (x.disabled = false)); throw e; }
    } else if (b.dataset.dup === 'adapt') {
      b.disabled = true; await flushSave();
      await api(`/api/projects/${id}/adapt`, {method: 'POST', body: {notes: $('#adapt-notes')?.value.trim() ?? ''}});
      toast('Claude is adapting the video…'); location.hash = `#/p/${encodeURIComponent(id)}/build`;
    }
  } catch (e) { toast(e.message); }
});
