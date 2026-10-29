// Background: ask Claude to add animated objects behind the scenes, and tune an existing background layer live.
import {$, S, api, esc, toast, previewBox} from './core.js';

const KINDS = [['icons', 'Glossy 3D icons', 'brand-style icons floating by'], ['sparkles', 'Sparkles & particles', 'soft glints and dust'], ['blobs', 'Gradient blobs', 'blurred colour that drifts'], ['shapes', 'Floating shapes', 'rings, pills, rounded shapes'], ['grid', 'Moving grid', 'slow dotted or line pattern']];
const F = {objects: ['icons', 'sparkles'], custom: '', placement: 'behind', intensity: 'subtle', colors: '', scenes: ''};

const controls = (b) => `<div class="card" id="bg-ctl"><div class="spread"><div><h3>Background controls</h3><div class="small muted">Changes save as you go and show in the preview.</div></div><label class="chk"><input type="checkbox" data-bgs="enabled" ${b.enabled !== false ? 'checked' : ''} /> Show objects</label></div>
  <div class="g2" style="margin-top:14px"><label class="f"><span>Amount <b data-bgout="opacity">${Math.round((b.opacity ?? 1) * 100)}%</b></span><input type="range" class="rng" min="0" max="150" step="5" data-bgs="opacity" value="${Math.round((b.opacity ?? 1) * 100)}" /></label>
    <label class="f"><span>Speed <b data-bgout="speed">${Math.round((b.speed ?? 1) * 100)}%</b></span><input type="range" class="rng" min="10" max="400" step="10" data-bgs="speed" value="${Math.round((b.speed ?? 1) * 100)}" /></label></div></div>`;

export const render = async (host, c) => {
  host.innerHTML = `<div class="split"><div class="stack">${c.background ? controls(c.background) : ''}
    <form id="bg-form" class="card stack" autocomplete="off" onsubmit="return false"><div><h3>${c.background ? 'Change or add objects' : 'Animated background objects'}</h3><div class="small muted" style="margin-top:4px">For a video whose background is flat or still. Claude adds the objects as a separate layer behind your scenes. Text, timing and sound stay the same. If a scene already has a moving background, Claude leaves it alone and tells you.</div></div>
      <div class="f"><span>What should float and move?</span><div class="row" style="gap:12px 22px">${KINDS.map(([k, l, h]) => `<label class="chk" title="${esc(h)}"><input type="checkbox" data-bg="objects" value="${k}" ${F.objects.includes(k) ? 'checked' : ''} /> ${l}</label>`).join('')}</div></div>
      <label class="f"><span>Or describe your own</span><textarea class="in" rows="2" data-bg="custom" placeholder="e.g. floating chat bubbles and rupee coins, tiny QR codes drifting up">${esc(F.custom)}</textarea></label>
      <div class="g2"><label class="f"><span>Where</span><select class="in" data-bg="placement"><option value="behind" ${F.placement === 'behind' ? 'selected' : ''}>Behind everything</option><option value="edges" ${F.placement === 'edges' ? 'selected' : ''}>Only around the edges, clear of content</option></select></label>
        <label class="f"><span>Intensity</span><select class="in" data-bg="intensity">${[['subtle', 'Subtle: barely noticed'], ['medium', 'Medium: clearly alive'], ['lively', 'Lively: energetic']].map(([k, l]) => `<option value="${k}" ${F.intensity === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <div class="g2"><label class="f"><span>Colours</span><input class="in" data-bg="colors" value="${esc(F.colors)}" placeholder="brand colours (default) or e.g. gold and blue" /></label><label class="f"><span>Scenes</span><input class="in" data-bg="scenes" value="${esc(F.scenes)}" placeholder="all scenes (default) or e.g. Hook, CTA" /></label></div></form></div>
    <div class="side">${previewBox(c)}<div class="small muted" style="margin-top:8px">The preview updates as Claude works. Ask for tweaks, e.g. “slower, fewer objects”.</div></div></div>
    <div class="barfix"><div class="tx"><b>${c.busy ? 'Claude is working on this video…' : 'Add background objects'}</b><div class="small muted">Claude will check the scenes, add the layer, and render check frames to review.</div></div><button type="button" class="btn main" data-act="bg-add" ${c.busy ? 'disabled' : ''}>Add background objects</button></div>`;
};
export const soft = () => {};
export const live = () => {};

const readForm = () => {
  const f = {objects: [], custom: '', placement: 'behind', intensity: 'subtle', colors: '', scenes: ''};
  document.querySelectorAll('#bg-form [data-bg]').forEach((el) => { if (el.dataset.bg === 'objects') { if (el.checked) f.objects.push(el.value); } else f[el.dataset.bg] = el.value; });
  return f;
};
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.closest?.('#bg-form')) Object.assign(F, readForm());
  if (t.closest?.('#bg-ctl') && t.type === 'range') { const o = document.querySelector(`[data-bgout="${t.dataset.bgs}"]`); if (o) o.textContent = `${t.value}%`; }
});
document.addEventListener('change', async (ev) => {
  const t = ev.target;
  if (!S.cur || !t.closest?.('#bg-ctl') || !t.dataset.bgs) return;
  const v = (k) => document.querySelector(`#bg-ctl [data-bgs="${k}"]`);
  try { S.cur.background = await api(`/api/projects/${S.cur.project.id}/background-settings`, {method: 'PUT', body: {enabled: v('enabled').checked, opacity: Number(v('opacity').value) / 100, speed: Number(v('speed').value) / 100}}); } catch (e) { toast(e.message); }
});
document.addEventListener('click', async (ev) => {
  if (!ev.target.closest('[data-act="bg-add"]') || !S.cur) return;
  try { Object.assign(F, readForm()); await api(`/api/projects/${S.cur.project.id}/background`, {method: 'POST', body: F}); toast('Claude is adding the background objects…'); } catch (e) { toast(e.message); }
});
void $;
