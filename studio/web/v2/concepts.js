// Concepts: the sample stills the AI designed, to compare, approve one, ask for another round, or watch while it is still designing.
import {$, S, api, esc, toast, clock, bust, pill, ICON, classicUrl} from './core.js';

const C = {steps: [], timer: null, openAnalysis: false};
const COLORS = ['#7B5CFF', '#3B7BFF', '#14A36B', '#E8A52B', '#E0437F', '#0FA5B8', '#6A58E8', '#C9822B'];
const proj = () => S.cur.project;
const myJob = () => S.live.busy.find((b) => b.projectId === proj().id);
const stepLine = (e) => `<span><time>${new Date(e.ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}</time>${esc(e.text)}</span>`;
const stepsHtml = () => (C.steps.length ? C.steps.map(stepLine).join('') : '<span class="muted">Waiting for the first step…</span>');
const loadSteps = async () => {
  if (!S.cur) return;
  try {
    const r = await api(`/api/activity?since=${C.since ?? Date.now() - 10 * 60000}`); // only what is new since the last look
    C.since = r.now ?? C.since;
    C.steps = [...C.steps, ...(r.entries ?? []).filter((e) => e.projectId === proj().id && e.source !== 'save' && !C.steps.some((x) => x.id === e.id))].slice(-4);
    const el = $('#c-steps'); if (el) el.innerHTML = stepsHtml();
  } catch { /* optional */ }
};
const tick = () => {
  const els = document.querySelectorAll('[data-c-elapsed]');
  if (!els.length) { clearInterval(C.timer); return; }
  const job = myJob(); if (job) els.forEach((el) => { el.textContent = clock((Date.now() - job.startedAt) / 1000); });
};

const waiting = (job) => `<div class="card empty d1"><div class="orb" aria-hidden="true"></div><h2>Designing concepts</h2>
  <p>Working from your brief and local references. This pass skips link fetching and audio transcription.</p>
  <div class="small muted">Elapsed <b data-c-elapsed>${job ? clock((Date.now() - job.startedAt) / 1000) : '0:00'}</b></div>
  <div class="logbox" id="c-steps" style="width:min(560px,100%);text-align:left">${stepsHtml()}</div>
  <button type="button" class="btn danger" data-act="stop">Stop generation</button></div>`;

// ---------- one concept ----------
const stills = (c, portrait) => {
  const list = c.samples ?? [];
  if (!list.length) return '<div class="stills none"><div class="still ld"><span>Stills are being drawn…</span></div></div>';
  return `<div class="stills ${portrait ? 'portrait' : ''}" style="--n:${Math.min(4, list.length)}">${list.map((s) => (s.file
    ? `<figure class="still ld" data-zoom="/data/${proj().id}/${s.file}${bust()}" data-group="${esc(c.id)}" data-cap="${esc(c.name)} · ${esc(s.label ?? '')}"><img decoding="async" src="/data/${proj().id}/${s.file}${bust()}" alt="${esc(c.name)} ${esc(s.label ?? '')}" onload="this.parentElement.classList.remove('ld')" onerror="this.parentElement.classList.add('bad')" /><figcaption>${esc(s.label ?? '')}</figcaption></figure>`
    : `<figure class="still ld"><span>Drawing…</span><figcaption>${esc(s.label ?? '')}</figcaption></figure>`)).join('')}</div>`;
};
const outline = (c) => {
  const o = c.outline ?? [];
  if (!o.length) return '';
  const total = o.reduce((a, x) => a + (Number(x.sec) || 0), 0) || o.length;
  return `<div class="olwrap"><div class="spread"><b class="small">Scene outline</b><span class="small muted">${o.length} scenes · ${total.toFixed(1)} s</span></div>
    <div class="oltl">${o.map((x, i) => `<i style="flex:${Math.max(0.4, Number(x.sec) || total / o.length)} 1 0;background:${COLORS[i % COLORS.length]}" title="${esc(x.scene)}${Number(x.sec) ? ` · ${Number(x.sec).toFixed(1)} s` : ''}"></i>`).join('')}</div>
    <details class="fold"><summary>Show the scenes</summary><div class="ollist">${o.map((x, i) => `<div><span class="dot" style="background:${COLORS[i % COLORS.length]}"></span><span>${esc(x.scene)}</span><span class="muted">${Number(x.sec) ? `${Number(x.sec).toFixed(1)} s` : ''}</span></div>`).join('')}</div></details></div>`;
};
const concept = (c, approved, portrait, busy) => `<article class="card concept ${approved === c.id ? 'chosen' : ''}">
  ${approved === c.id ? '<span class="ribbon">Approved</span>' : ''}
  <div class="row" style="flex-wrap:nowrap"><span class="tag">${esc(c.id)}</span><div style="min-width:0"><h2>${esc(c.name)}</h2></div></div>
  <p class="kv" style="margin:0">${esc(c.idea ?? c.summary ?? '')}</p>
  ${stills(c, portrait)}
  <dl class="attrs">
    ${c.palette?.length ? `<div><dt>Palette</dt><dd><span class="pal">${c.palette.map((h) => `<i style="background:${esc(h)}" title="${esc(h)}"></i>`).join('')}</span></dd></div>` : ''}
    ${c.fonts ? `<div><dt>Type</dt><dd>${esc(c.fonts)}</dd></div>` : ''}${c.motion ? `<div><dt>Motion</dt><dd>${esc(c.motion)}</dd></div>` : ''}
  </dl>
  ${outline(c)}
  <div style="flex:1"></div>
  <label class="f"><span>Notes for the build (optional)</span><textarea class="in" rows="2" data-cnotes="${esc(c.id)}" placeholder="e.g. keep the hook, slower final scene"></textarea></label>
  <button type="button" class="btn main lg" data-act="approve" data-concept="${esc(c.id)}" ${busy ? 'disabled title="The AI is working. You can approve when it is done."' : ''}>${approved === c.id ? 'Build this one again' : `Approve “${esc(c.name)}” and build`}</button></article>`;

export const render = async (host, c) => {
  const p = c.project, doc = c.concepts, busy = c.busy, job = myJob();
  clearInterval(C.timer);
  if (!doc?.concepts?.length) {
    if (busy || p.status === 'concepting') { host.innerHTML = waiting(job); C.timer = setInterval(tick, 1000); loadSteps(); return; }
    host.innerHTML = `<div class="card empty"><div class="ico">${ICON.bolt}</div><h2>No concepts yet</h2><p>Fill in the brief, then generate concepts.</p><a class="btn main" href="#/p/${p.id}/brief">Go to the brief</a></div>`;
    return;
  }
  const portrait = p.brief.height > p.brief.width, approved = p.approvedConcept?.id, n = doc.concepts.length;
  const analysis = [].concat(doc.analysis ?? []).filter(Boolean), showAll = C.openAnalysis || analysis.length <= 2;
  host.innerHTML = `
    <div class="spread d1"><div><h2 style="font-size:20px">Pick a look</h2><div class="small muted">${n} concept${n === 1 ? '' : 's'} designed from your brief. Compare the stills, then approve one to build the full video.</div></div>
      <div class="row">${approved ? pill(`Approved · ${p.approvedConcept.name}`, 'amber') : pill('Nothing approved yet', 'dim')}<button type="button" class="btn sm" data-act="stills" ${busy ? 'disabled' : ''} title="Re-render the stills from the current code">${ICON.refresh} Refresh stills</button></div></div>
    ${busy ? `<div class="card accent tight livebar"><div class="row" style="flex-wrap:nowrap;gap:14px"><i class="live"></i><div style="flex:1;min-width:0"><b>The AI is working on the concepts</b> <span class="small muted">· <span data-c-elapsed>${job ? clock((Date.now() - job.startedAt) / 1000) : '0:00'}</span> elapsed · stills refresh when it is done</span><div class="logbox slim" id="c-steps">${stepsHtml()}</div></div><button type="button" class="btn sm danger" data-act="stop">Stop</button></div></div>` : ''}
    ${analysis.length ? `<div class="card tight d2"><div class="spread"><b>What the AI understood</b>${analysis.length > 2 ? `<button type="button" class="btn ghost sm" data-act="c-analysis">${showAll ? 'Show less' : `Show all ${analysis.length}`}</button>` : ''}</div><ul class="kv" style="margin:8px 0 0;padding-left:20px;display:grid;gap:4px">${(showAll ? analysis : analysis.slice(0, 2)).map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}
    <div class="concepts">${doc.concepts.map((x) => concept(x, approved, portrait, busy)).join('')}</div>
    <div class="card d4"><div class="spread" style="margin-bottom:10px"><div><h3>Not quite? Ask for another round</h3><div class="small muted">Say what to keep and what to change. The AI redesigns and redraws the stills.</div></div></div>
      <div class="row" style="align-items:flex-end;flex-wrap:nowrap"><textarea class="in" id="c-feedback" rows="2" style="flex:1" placeholder="e.g. Mix A's colours with B's layout, bigger headlines, less text in the hook…"></textarea>
        <button type="button" class="btn main" data-act="revise" ${busy ? 'disabled' : ''}>Revise concepts</button></div></div>`;
  if (busy) { C.timer = setInterval(tick, 1000); loadSteps(); }
};
export const leave = () => clearInterval(C.timer);
export const soft = () => {};
export const live = () => { if ($('#c-steps')) loadSteps(); };

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act="approve"][data-concept], [data-act="revise"], [data-act="stills"], [data-act="c-analysis"]');
  if (!b || !S.cur || !$('.concepts, #c-feedback')) return;
  const id = proj().id;
  try {
    if (b.dataset.act === 'c-analysis') { C.openAnalysis = !C.openAnalysis; render($('#tab'), S.cur); return; }
    if (b.dataset.act === 'approve') {
      const notes = $(`[data-cnotes="${b.dataset.concept}"]`)?.value.trim() ?? '';
      b.disabled = true;
      await api(`/api/projects/${id}/approve`, {method: 'POST', body: {conceptId: b.dataset.concept, notes}});
      location.hash = `#/p/${encodeURIComponent(id)}/build`;
    } else if (b.dataset.act === 'revise') {
      const fb = $('#c-feedback').value.trim();
      if (!fb) return toast('Write what to change first.');
      await api(`/api/projects/${id}/concepts`, {method: 'POST', body: {feedback: fb}});
      toast('Sent. The AI is revising the concepts.');
    } else { await api(`/api/projects/${id}/samples`, {method: 'POST'}); toast('Rendering stills…'); }
  } catch (e) { toast(e.message); b.disabled = false; }
});
void classicUrl;
