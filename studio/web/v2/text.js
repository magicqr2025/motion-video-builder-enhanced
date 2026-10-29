// Text: every on-screen string of the built video, edited here and saved to its text.json (no AI run needed).
import {$, S, api, esc, toast, notEditable, previewBox} from './core.js';

const T = {dirty: false};
const humanize = (k) => String(k).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
const leaves = (v, path = []) => (typeof v === 'string' ? [[path, v]] : Array.isArray(v) ? v.flatMap((x, i) => leaves(x, [...path, i])) : v && typeof v === 'object' ? Object.entries(v).filter(([k]) => !k.startsWith('_')).flatMap(([k, x]) => leaves(x, [...path, k])) : []);
const setPath = (obj, path, val) => { let o = obj; path.slice(0, -1).forEach((k) => (o = o[k])); o[path.at(-1)] = val; };

export const render = async (host, c) => {
  T.dirty = false;
  if (!c.text) { host.innerHTML = notEditable("Text isn't editable yet for this video", 'Its text is still inside the code. Claude can move every headline, label and caption into one text file (look and timing stay the same). After that you can edit it here directly, with no Claude run needed.', 'Make text editable', 'make-text', c.busy); return; }
  const help = c.text._help ?? {}, groups = Object.entries(c.text).filter(([k]) => !k.startsWith('_'));
  host.innerHTML = `<div class="split"><form id="t-form" class="stack" autocomplete="off" onsubmit="return false">${groups.map(([g, v]) => `<div class="card"><h3 style="margin-bottom:14px">${esc(humanize(g))}</h3><div class="stack" style="gap:14px">${leaves(v, [g]).map(([path, val]) => {
      const label = path.slice(1).map((k) => (typeof k === 'number' ? `#${k + 1}` : humanize(k))).join(' · ') || humanize(g), hint = help[path.join('.')] ?? '', long = val.length > 60 || val.includes('\n');
      const attrs = `data-path='${esc(JSON.stringify(path))}' data-orig="${esc(val)}"`;
      return `<label class="f"><span>${esc(label)}</span>${long ? `<textarea class="in" rows="3" ${attrs}>${esc(val)}</textarea>` : `<input class="in" value="${esc(val)}" ${attrs} />`}${hint ? `<small class="dim">${esc(hint)}</small>` : ''}</label>`; }).join('')}</div></div>`).join('')}</form>
    <div class="side">${previewBox(c)}<div class="small muted" style="margin-top:8px">The preview reloads by itself a moment after you save.</div></div></div>
    <div class="barfix"><div class="tx"><b id="t-state">Edit any text, then save.</b><div class="small muted">Much longer text may need Claude to re-fit the layout.</div></div>
      <button type="button" class="btn" data-act="t-checks" ${c.busy ? 'disabled' : ''}>Refresh check frames</button><button type="button" class="btn main" data-act="t-save" id="t-save" disabled>Save text</button></div>`;
};
export const soft = () => {};
export const live = () => {};

document.addEventListener('input', (ev) => {
  const f = ev.target.closest?.('#t-form');
  if (!f) return;
  T.dirty = [...f.querySelectorAll('[data-path]')].some((el) => el.value !== el.dataset.orig);
  $('#t-save').disabled = !T.dirty; $('#t-state').textContent = T.dirty ? 'Unsaved changes.' : 'No changes.';
});
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act^="t-"], [data-act="make-text"]');
  if (!b || !S.cur) return;
  const id = S.cur.project.id;
  try {
    if (b.dataset.act === 'make-text') { await api(`/api/projects/${id}/make-text-editable`, {method: 'POST'}); toast('Claude is moving the text into an editable file…'); }
    else if (b.dataset.act === 't-checks') { await api(`/api/projects/${id}/checks`, {method: 'POST'}); toast('Re-rendering check frames…'); }
    else if (b.dataset.act === 't-save') {
      const next = structuredClone(S.cur.text);
      document.querySelectorAll('#t-form [data-path]').forEach((el) => setPath(next, JSON.parse(el.dataset.path), el.value));
      S.cur.text = await api(`/api/projects/${id}/text`, {method: 'PUT', body: {text: next}});
      T.dirty = false; document.querySelectorAll('#t-form [data-path]').forEach((el) => (el.dataset.orig = el.value));
      $('#t-save').disabled = true; $('#t-state').textContent = 'Saved. The preview updates in a moment; render again for the final MP4.'; toast('Text saved.');
    }
  } catch (e) { toast(e.message); }
});
