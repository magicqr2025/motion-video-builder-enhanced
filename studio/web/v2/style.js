// Style: the palette colours of the built video (style.json), saved as you pick, shown in the preview with no AI run.
import {$, S, api, esc, toast, notEditable, previewBox} from './core.js';

const paint = (c) => {
  const style = c.style, changed = Object.keys(style.colors).some((k) => style.colors[k] !== style._defaults?.[k]);
  return `<div class="split"><div class="stack">
    <div class="card"><div class="spread"><div><h3>Brand colours</h3><div class="small muted" style="max-width:420px">Changes save as you pick and show in the preview. Soft tints and shadows follow only partly; Claude can re-tune them.</div></div><button type="button" class="btn sm ghost" data-act="s-reset" ${changed ? '' : 'disabled'}>Reset colours</button></div>
      <div class="stack" id="s-form" style="margin-top:16px;gap:14px">${Object.entries(style.colors).map(([k, v]) => `<div class="row" style="flex-wrap:nowrap;gap:14px"><label class="sw big" style="background:${esc(v)}"><input type="color" data-sc="${esc(k)}" value="${esc(v)}" aria-label="${esc(style._labels?.[k] ?? k)}" /></label>
        <div style="flex:1;min-width:0"><b>${esc(style._labels?.[k] ?? k)}</b><div class="small muted"><span>${esc(v)}</span>${style._defaults?.[k] && style._defaults[k] !== v ? ` · was ${esc(style._defaults[k])}` : ''}</div></div></div>`).join('')}</div></div>
    <div class="card"><h3>Logo, fonts, captions</h3><div class="small muted" style="margin:4px 0 12px">These need design changes in the video, so Claude does them. Describe what you want.</div>
      <textarea class="in" id="s-request" rows="2" placeholder="e.g. use the white version of the logo on dark scenes, bolder headline font, add word-by-word captions"></textarea>
      <div style="margin-top:10px"><button type="button" class="btn main" data-act="s-ask" ${c.busy ? 'disabled' : ''}>Ask Claude</button></div></div></div>
    <div class="side">${previewBox(c)}<div class="small muted" style="margin-top:8px">The preview reloads by itself a moment after each change.</div></div></div>`;
};
export const render = async (host, c) => {
  host.innerHTML = c.style ? paint(c) : notEditable("Colours aren't editable yet for this video", 'Claude can move the main palette colours into one file. After that you pick colours here and see them in the preview, with no Claude run. Look and timing stay the same.', 'Make colours editable', 'make-style', c.busy);
};
export const soft = () => {};
export const live = () => {};

document.addEventListener('change', async (ev) => {
  const t = ev.target;
  if (!t.dataset?.sc || !S.cur || !$('#s-form')) return;
  try {
    const colors = Object.fromEntries([...document.querySelectorAll('#s-form [data-sc]')].map((el) => [el.dataset.sc, el.value]));
    S.cur.style = await api(`/api/projects/${S.cur.project.id}/style`, {method: 'PUT', body: {colors}});
    $('#tab').innerHTML = paint(S.cur);
  } catch (e) { toast(e.message); }
});
document.addEventListener('input', (ev) => { const t = ev.target; if (t.dataset?.sc && $('#s-form')) t.closest('.sw').style.background = t.value; });
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act="s-reset"], [data-act="s-ask"], [data-act="make-style"]');
  if (!b || !S.cur) return;
  const id = S.cur.project.id;
  try {
    if (b.dataset.act === 'make-style') { await api(`/api/projects/${id}/make-style-editable`, {method: 'POST'}); toast('Claude is moving the colours into an editable file…'); }
    else if (b.dataset.act === 's-reset') { S.cur.style = await api(`/api/projects/${id}/style`, {method: 'PUT', body: {reset: true}}); $('#tab').innerHTML = paint(S.cur); toast('Colours reset.'); }
    else {
      const text = $('#s-request').value.trim();
      if (!text) return toast('Write what to change first.');
      await api(`/api/projects/${id}/message`, {method: 'POST', body: {text: `Style change for the built video: ${text}. Keep the colours in style.json, the text, timing and audio as they are unless I say otherwise; re-render a few check stills and look at them.`}});
      $('#s-request').value = ''; toast('Sent to Claude.');
    }
  } catch (e) { toast(e.message); }
});
