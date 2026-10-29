// Look & feel: choose the effects before the concepts (and change them later). Same PUT /look the classic app uses.
import {$, S, api, esc, toast, clock, pill, previewBox, flushSave, ICON} from './core.js';

const LV = ['Off', 'Light', 'Full'];
const TAG = {layer: ['Live', 'Shows in the preview right away. No AI cost.', 'mint'], built: ['Claude builds', 'Claude designs this into the video when it builds it.', 'violet']};
const L = {ai: null, timer: null, changes: null};
const proj = () => S.cur.project;
const state = () => ({levels: {...(proj().look?.levels ?? {})}, gradeMood: proj().look?.gradeMood ?? 'neutral', bundle: proj().look?.bundle ?? ''});
const changesNow = () => { const look = proj().look, was = look?.applied?.levels ?? {}; return S.state.lookSpec.groups.flatMap((g) => g.items).filter((i) => i.kind === 'built' && (look?.levels?.[i.key] ?? 0) !== (was[i.key] ?? 0)); };

const save = async (edit) => {
  const r = await api(`/api/projects/${proj().id}/look`, {method: 'PUT', body: {look: edit}});
  proj().look = r.look; paint();
};

const html = () => {
  const c = S.cur, p = proj(), spec = S.state.lookSpec, st = state(), built = !!c.storyboard, changes = built ? changesNow() : [];
  const items = spec.groups.flatMap((g) => g.items), onItems = items.filter((i) => (st.levels[i.key] ?? 0) > 0), ai = L.ai ?? {};
  const hasStory = !!(String(p.brief.script ?? '').trim() || String(p.brief.idea ?? '').trim());
  return `
    <div class="card d1"><div class="spread"><div><h2>Look &amp; feel</h2><p class="muted" style="margin:4px 0 0;max-width:640px">Choose how your video feels: motion, colour and extras. It is all optional, and you can change it later. <i>Off</i> = not used, <i>Light</i> = subtle, <i>Full</i> = strong.</p></div>
      <div class="row"><button type="button" class="btn main" data-lk="suggest" ${ai.busy || c.busy ? 'disabled' : ''} title="${hasStory ? 'The AI reads your idea and script and picks the options' : 'Write your idea or script on the Brief page first'}">Let AI choose for me</button>
        <button type="button" class="btn" data-lk="reset" ${onItems.length && !ai.busy ? '' : 'disabled'}>Reset all to Off</button>${pill(`${onItems.length} on`, onItems.length ? 'violet' : 'dim')}</div></div>
      ${ai.busy ? `<div class="run" style="margin-top:14px"><div class="row"><i class="live"></i><b>The AI is choosing the options…</b><span class="small muted" data-lk-time></span><button type="button" class="btn sm ghost" data-lk="stop">Stop</button></div><div class="bar"><span class="sheen"></span></div></div>` : ''}
      ${ai.error ? `<div class="err" style="margin-top:14px">${esc(ai.error)}</div>` : ''}
      ${ai.reason ? `<div class="res" style="margin-top:14px"><div class="row">${pill('✦ Why the AI chose this', 'violet')}</div><p style="margin:0">${esc(ai.reason)}</p></div>` : ''}
      ${!hasStory ? '<div class="small muted" style="margin-top:10px">Tip: write your idea or script first so the AI can choose well.</div>' : ''}
      <div style="margin-top:16px"><b class="small">Ready-made styles</b><div class="bundles">${spec.bundles.map((b) => `<button type="button" class="bundle ${st.bundle === b.id ? 'on' : ''}" data-lk="bundle" data-id="${esc(b.id)}"><b>${esc(b.name)}</b><span>${esc(b.tagline)}</span></button>`).join('')}</div></div>
      <div class="small muted" style="margin-top:12px">${pill('Live', 'mint')} shows in the preview straight away, no AI cost &nbsp; ${pill('Claude builds', 'violet')} Claude designs it into the video (uses AI when it builds)</div></div>
    ${built ? `<div class="card d2"><div class="spread" style="margin-bottom:12px"><h3>Live preview</h3><span class="small muted">“Live” options show here as you change them. Motion blur and sound effects appear in the final render.</span></div>${previewBox(c, 340)}</div>` : ''}
    ${spec.groups.map((g) => { const on = g.items.filter((it) => (st.levels[it.key] ?? 0) > 0).length; return `<section class="card d3"><div class="spread" style="margin-bottom:14px"><h3>${esc(g.title)}</h3>${pill(on ? `${on} on` : 'all off', on ? 'violet' : 'dim')}</div>
      <div class="lgrid">${g.items.map((it) => { const lv = st.levels[it.key] ?? 0, tag = TAG[it.kind === 'built' ? 'built' : 'layer'];
        return `<div class="lcard ${lv ? 'on' : ''}"><div class="spread" style="flex-wrap:nowrap"><b>${esc(it.title)}</b><span class="pill ${tag[2]}" title="${tag[1]}">${tag[0]}</span></div><div class="small muted">${esc(it.desc)}</div>
          <div class="lseg" role="group" aria-label="${esc(it.title)} level">${LV.map((l, n) => `<button type="button" class="${lv === n ? 'on' : ''}" data-lk="level" data-key="${it.key}" data-n="${n}">${l}</button>`).join('')}</div>
          <div class="small ${lv ? '' : 'dim'}">${lv ? esc(lv === 2 ? it.full : it.light) : 'Not used'}</div>
          ${it.key === 'grade' && lv ? `<select class="in" data-lk-mood>${spec.moods.map((m) => `<option ${m === st.gradeMood ? 'selected' : ''}>${m}</option>`).join('')}</select>` : ''}</div>`; }).join('')}</div></section>`; }).join('')}
    <div class="barfix"><div class="tx"><b>${built ? (changes.length ? `${changes.length} Claude-built change${changes.length === 1 ? '' : 's'} waiting` : 'Look is up to date') : 'Saved as you click'}</b><div class="small muted">${built ? '“Live” options are already showing. Render to get motion blur and sound.' : 'Next, the AI designs concept looks using these choices.'}</div></div>
      ${built && changes.length ? `<button type="button" class="btn" data-lk="apply" ${c.busy ? 'disabled' : ''}>Apply ${changes.length} change${changes.length === 1 ? '' : 's'} with Claude</button>` : ''}
      ${built ? `<a class="btn main" href="#/p/${p.id}/render">Preview &amp; render →</a>` : `<button type="button" class="btn main" data-lk="gen" ${c.busy ? 'disabled' : ''}>${c.concepts ? 'Regenerate concepts' : 'Generate concepts'} →</button>`}</div>`;
};
const paint = () => { const el = $('#tab'); if (el && S.cur) { el.innerHTML = html(); tick(); } };
const tick = () => { const el = $('[data-lk-time]'); if (el && L.ai?.busy) el.textContent = `${clock((Date.now() - L.ai.startedAt) / 1000)} elapsed · usually 10 to 30 s`; };

export const render = async (host) => { clearInterval(L.timer); host.innerHTML = html(); tick(); };
export const leave = () => clearInterval(L.timer);
export const soft = () => {};
export const live = () => {};

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-lk]');
  if (!b || !S.cur || !$('.lgrid')) return;
  const id = proj().id;
  try {
    switch (b.dataset.lk) {
      case 'level': { const st = state(); st.levels[b.dataset.key] = Number(b.dataset.n); st.bundle = ''; await save(st); break; }
      case 'bundle': await save({bundle: b.dataset.id, levels: null}); break;
      case 'reset': await save({bundle: 'none', levels: null}); L.ai = null; toast('Everything is off. Pick a style or switch on what you like.'); paint(); break;
      case 'apply': await api(`/api/projects/${id}/look/apply`, {method: 'POST'}); toast('Claude is applying the changes…'); break;
      case 'gen': await flushSave(); await api(`/api/projects/${id}/concepts`, {method: 'POST', body: {}}); location.hash = `#/p/${encodeURIComponent(id)}/concepts`; break;
      case 'stop': L.ai?.ctrl?.abort(); break;
      case 'suggest': {
        if (L.ai?.busy) break;
        await flushSave();
        const ctrl = new AbortController();
        L.ai = {busy: true, startedAt: Date.now(), ctrl}; clearInterval(L.timer); L.timer = setInterval(tick, 1000); paint();
        try {
          const r = await api(`/api/projects/${id}/look/suggest`, {method: 'POST', body: {}, signal: ctrl.signal});
          L.ai = {reason: r.reason}; await save({levels: r.levels, gradeMood: r.gradeMood, bundle: ''}); toast('The AI chose the look. Change anything you like.');
        } catch (e) { L.ai = ctrl.signal.aborted ? null : {error: e.message}; toast(ctrl.signal.aborted ? 'Stopped.' : e.message); }
        finally { clearInterval(L.timer); if (S.cur?.project.id === id) paint(); }
        break;
      }
    }
  } catch (e) { toast(e.message); }
});
document.addEventListener('change', async (ev) => {
  if (ev.target.matches('[data-lk-mood]') && S.cur && $('.lgrid')) { const st = state(); st.gradeMood = ev.target.value; try { await save(st); } catch (e) { toast(e.message); } }
});
void ICON;
