// Do's & don'ts on the Brief page. The saved rules (studio/guidelines.json) apply to every video; each video can switch groups
// off and add rules of its own. Format rules are picked from the video's size, so a reel and a YouTube video get different advice.
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

let C = null; // {S, api, toast, field, setBrief}
const R = {g: null, loading: false, editing: false, error: ''};

export const initRules = (ctx) => { C = ctx; };

const FORMATS = {vertical: 'Vertical', horizontal: 'Horizontal', square: 'Square'};
export const formatKey = (b) => { const r = (b.width || 1080) / (b.height || 1920); return r < 0.8 ? 'vertical' : r > 1.25 ? 'horizontal' : 'square'; };
const count = (s) => (s?.do?.length ?? 0) + (s?.dont?.length ?? 0);

export const rulesSummary = (b) => {
  if (!R.g) return 'saved rules';
  const off = new Set(b.guidelinesOff ?? []), fk = formatKey(b);
  const on = [['general', R.g.general], [fk, R.g.formats[fk]], ['extra', R.g.extra]].filter(([k, s]) => !off.has(k)).reduce((n, [, s]) => n + count(s), 0);
  const own = String(b.projectRules ?? '').split('\n').filter((x) => x.trim()).length;
  return `${on + own} rules on`;
};

const load = async () => {
  if (R.g || R.loading) return;
  R.loading = true;
  try { R.g = (await C.api('/api/guidelines')).guidelines; } catch (e) { R.error = e.message; }
  R.loading = false; render();
};

const list = (s) => `<ul class="rl">${s.do.map((x) => `<li class="do"><i>✓</i>${esc(x)}</li>`).join('')}${s.dont.map((x) => `<li class="dont"><i>✕</i>${esc(x.replace(/^do not /i, ''))}</li>`).join('')}</ul>`;

const group = (key, title, s, off, note = '') => `
  <div class="rg ${off ? 'off' : ''}"><div class="rg-head"><label class="switch"><input type="checkbox" data-rule-toggle="${key}" ${off ? '' : 'checked'} /><span><b>${esc(title)}</b>${note ? `<small>${note}</small>` : ''}</span></label><span class="pill">${count(s)} rules</span></div>
    ${off ? '' : count(s) ? list(s) : '<div class="small muted">No rules in this group yet.</div>'}</div>`;

const editor = () => {
  const row = (path, label, s) => `<div class="re-set"><b>${esc(label)}</b><div class="grid g2">
    <label class="f"><span>Do <i class="muted">(one per line)</i></span><textarea rows="6" data-rule-edit="${path}.do">${esc(s.do.join('\n'))}</textarea></label>
    <label class="f"><span>Don't <i class="muted">(one per line)</i></span><textarea rows="6" data-rule-edit="${path}.dont">${esc(s.dont.join('\n'))}</textarea></label></div></div>`;
  return `<div class="re"><div class="small muted">These are saved on this PC and used for every video. Changes apply from the next AI step.</div>
    ${row('general', 'Always follow', R.g.general)}
    ${Object.entries(FORMATS).map(([k, l]) => row(`formats.${k}`, `${l} format`, R.g.formats[k])).join('')}
    ${row('extra', 'My own extra rules', R.g.extra)}
    <div class="row"><button type="button" class="btn primary" data-rule="save">Save rules</button><button type="button" class="btn ghost" data-rule="cancel">Cancel</button><span style="flex:1"></span><button type="button" class="btn ghost sm" data-rule="reset" title="Put the starter rules back">Reset to starter rules</button></div></div>`;
};

export const rulesHTML = () => '<div class="card stack rules-card" id="rules-card"></div>';

export const renderRules = () => { const el = $('#rules-card'); if (!el || !C?.S.cur) return; el.innerHTML = body(); load(); };
const render = renderRules;

const body = () => {
  const b = C.S.cur.project.brief, g = R.g, off = new Set(b.guidelinesOff ?? []), fk = formatKey(b);
  if (!g) return R.error ? `<div class="st-err">${esc(R.error)}</div>` : '<div class="small muted">Loading rules…</div>';
  if (R.editing) return editor();
  return `<div class="spread"><div><b>Standing rules for every video</b><div class="small muted">The AI reads these before it designs or builds. Switch a group off for this video if it does not fit.</div></div>
      <button type="button" class="btn sm" data-rule="edit">Edit saved rules</button></div>
    <div class="rg-grid">
      ${group('general', g.general.title || 'Always follow', g.general, off.has('general'))}
      ${group(fk, g.formats[fk].title || FORMATS[fk], g.formats[fk], off.has(fk), `picked from your size · ${b.width}×${b.height}`)}
      ${count(g.extra) ? group('extra', g.extra.title || 'My own extra rules', g.extra, off.has('extra')) : ''}
    </div>
    ${C.field('projectRules', 'Only for this video', b.projectRules, {rows: 3, placeholder: 'One rule per line, e.g. Do not show the pricing page. Keep the logo big at the end.', hint: 'These are saved with this video only. Use "Edit saved rules" for rules that should apply every time.'})}`;
};

const assign = (obj, path, v) => { const k = path.split('.'); let o = obj; k.slice(0, -1).forEach((x) => { o = o[x]; }); o[k.at(-1)] = v; };

document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (!C?.S.cur || !t.dataset?.ruleToggle) return;
  const b = C.S.cur.project.brief, off = new Set(b.guidelinesOff ?? []);
  if (t.checked) off.delete(t.dataset.ruleToggle); else off.add(t.dataset.ruleToggle);
  C.setBrief('guidelinesOff', [...off]); renderRules(); C.onChange?.();
});

document.addEventListener('click', async (ev) => {
  const a = ev.target.closest('[data-rule]');
  if (!a || !C?.S.cur) return;
  switch (a.dataset.rule) {
    case 'edit': R.editing = true; renderRules(); break;
    case 'cancel': R.editing = false; renderRules(); break;
    case 'save': {
      const g = structuredClone(R.g);
      document.querySelectorAll('#rules-card [data-rule-edit]').forEach((el) => assign(g, el.dataset.ruleEdit, el.value.split('\n').map((x) => x.trim()).filter(Boolean)));
      try { R.g = (await C.api('/api/guidelines', {method: 'PUT', body: {guidelines: g}})).guidelines; R.editing = false; C.toast('Rules saved.'); } catch (e) { C.toast(e.message); }
      renderRules(); C.onChange?.(); break;
    }
    case 'reset':
      try { R.g = (await C.api('/api/guidelines/reset', {method: 'POST', body: {}})).guidelines; C.toast('Starter rules restored.'); } catch (e) { C.toast(e.message); }
      renderRules(); break;
  }
});
