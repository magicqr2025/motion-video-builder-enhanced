// Story assistant on the Brief page:
//   idea  -> AI writes a script -> you review -> approve -> AI fills audience / CTA / language / on-screen text
//   script -> improve with AI (or use as it is) -> review -> approve -> same
import {stripTags} from './voice.js';
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

let C = null; // {S, api, toast, field, select, LANGS, flushSave, setBrief, aiTag, onBusy}
const ST = {pid: null, busy: false, action: '', ctrl: null, startedAt: 0, timer: null, usage: null, filled: [], error: ''};

export const initStory = (ctx) => { C = ctx; };
export const aiFilled = (key) => ST.filled.includes(key);
export const storyRunning = () => ST.busy;
export const stopStoryRun = () => ST.ctrl?.abort();

const WPS = 2.5; // words per second of voiceover
const words = (t) => (stripTags(t).match(/\S+/g) ?? []).length; // audio tags are voice cues, not spoken words
const clock = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
const countText = (t) => { const n = words(t); return n ? `${n} words · about ${clock(n / WPS)} spoken` : 'Nothing written yet'; };
const brief = () => C.S.cur.project.brief;
// Videos made before this assistant existed (no scriptState, already past the brief) count as approved.
const phase = (b) => !String(b.script ?? '').trim() ? 'start' : b.scriptState === 'approved' || (b.scriptState === undefined && C.S.cur.project.status !== 'brief') ? 'approved' : b.scriptState === 'review' ? 'review' : 'start';
const mode = (b) => b.storyMode ?? (String(b.script ?? '').trim() && !String(b.idea ?? '').trim() ? 'script' : 'idea');

const RUN_TEXT = {script: 'Writing your script…', improve: 'Improving your script…', fill: 'Reading the script and filling in the details…', score: 'Scoring your script…', hooks: 'Looking for stronger hooks…'};
const TYPICAL = {script: '10 to 30 s', improve: '10 to 30 s', fill: '5 to 15 s', score: '5 to 15 s', hooks: '5 to 15 s'};

// Score / hooks: read-only checks under the script. Results stay until the project changes; a note says when the script has moved on.
const band = (n, hi) => { const p = n / hi * 100; return p >= 80 ? 'good' : p >= 60 ? 'ok' : 'low'; };
const stale = (res, b) => (res && res.of !== String(b.script ?? '').trim() ? '<span class="small muted">The script changed since this check.</span>' : '');
const checkTools = (b) => words(b.script) ? `<div class="st-checks"><span class="small muted">Check the script</span>
  <button type="button" class="btn sm" data-story="score" ${dis()}>★ Score it</button>
  <button type="button" class="btn sm" data-story="hooks" ${dis()}>⚡ Find stronger hooks</button></div>` : '';
const scoreHTML = (b) => { const s = ST.score; return !s ? '' : `
  <div class="st-res"><div class="st-res-head"><span class="st-big ${band(s.score, 100)}">${s.score}<small>/100</small></span><div><b>${esc(s.verdict)}</b>${stale(s, b)}</div><button type="button" class="vo-link" data-story="close-score">Hide</button></div>
    <div class="st-parts">${s.parts.map((x) => `<div class="st-part"><span>${esc(x.name)}</span><i class="${band(x.score, 10)}"><u style="width:${x.score * 10}%"></u></i><b>${x.score}</b><small>${esc(x.note)}</small></div>`).join('')}</div>
    ${s.fixes.length ? `<div class="st-fixes"><b>Fix first</b><ol>${s.fixes.map((f) => `<li>${esc(f)}</li>`).join('')}</ol></div>` : ''}</div>`; };
const hooksHTML = (b) => { const h = ST.hooks; return !h ? '' : `
  <div class="st-res"><div class="st-res-head"><div><b>Stronger opening lines</b>${stale(h, b)}</div><button type="button" class="vo-link" data-story="close-hooks">Hide</button></div>
    ${h.hooks.length ? h.hooks.map((x, i) => `<div class="st-hook"><div><b>${esc(x.line)}</b><div class="small muted">${x.formula ? `<span class="pill">${esc(x.formula)}</span> ` : ''}${esc(x.why)}</div></div><button type="button" class="btn sm" data-story="usehook" data-i="${i}" ${dis()} title="Replaces the first line of your script with this hook (audio tags on that line are kept)">Use as opening line</button></div>`).join('') : '<div class="small muted">No hooks came back. Try again.</div>'}</div>`; };

export const usageHTML = (u) => usageLine(u);
const usageLine = (u = ST.usage) => {
  if (!u) return '';
  const tok = (u.input || 0) + (u.output || 0);
  return `<div class="st-usage"><span class="pill ai">✦ AI used</span><span>${esc(u.engine)}${u.model && u.model !== 'default' ? ` · ${esc(u.model)}` : ''}</span><span>${(u.ms / 1000).toFixed(1)} s</span>${tok ? `<span>${tok.toLocaleString()} tokens <span class="muted">(${(u.input || 0).toLocaleString()} in · ${(u.output || 0).toLocaleString()} out)</span></span>` : '<span class="muted">usage not reported by this model</span>'}${u.costUsd ? `<span>≈ $${u.costUsd.toFixed(4)}</span>` : u.engine === 'Claude Code' ? '<span class="muted">counted against your Claude plan</span>' : ''}</div>`;
};

const runBar = () => ST.busy ? `<div class="st-run"><div class="st-run-top"><i class="dot"></i><b>${esc(RUN_TEXT[ST.action] ?? 'Working…')}</b><span class="muted small" data-story-time></span><button type="button" class="btn ghost sm" data-story="cancel">Stop</button></div><div class="bar indet"><i></i></div></div>` : '';

const dis = () => (ST.busy ? 'disabled' : '');

const stepper = (ph) => {
  const order = ['start', 'review', 'approved'], at = order.indexOf(ph);
  const steps = [['Idea or script', 0], ['Review the script', 1], ['Video details', 2]];
  return `<ol class="st-steps">${steps.map(([l, i]) => `<li class="${i < at ? 'done' : ''} ${i === at ? 'on' : ''}"><span>${i < at ? '✓' : i + 1}</span>${l}</li>`).join('')}</ol>`;
};

const filledWrap = (key, html) => `<div class="st-f ${ST.filled.includes(key) ? 'ai-filled' : ''}">${html}</div>`;

const startIdea = (b) => `
  ${C.field('idea', 'Your idea', b.idea, {rows: 5, placeholder: 'e.g. Show agencies how to set up the white label in 3 steps, so support tickets drop.', hint: 'A sentence or two is enough. You do not need to fill in anything else.'})}
  <div class="st-actions"><button type="button" class="btn primary lg" data-story="write" ${dis()}>✦ Write the script</button>
    <span class="small muted">The AI writes a voiceover script from your idea. You review it before anything else is filled in.</span></div>`;

const startScript = (b) => `
  ${C.field('script', 'Your script', b.script, {rows: 10, placeholder: 'Paste your script here. One sentence per line works best.'})}
  <div class="small muted st-count" data-story-count>${countText(b.script)}</div>
  <div class="st-actions"><button type="button" class="btn primary lg" data-story="improve" ${dis()}>✦ Improve with AI</button>
    <button type="button" class="btn lg" data-story="use" ${dis()} title="Keep your script exactly as written and move on">Use as it is →</button>
    <span class="small muted">Improve rewrites it for you to review. “Use as it is” keeps your words and fills in the rest.</span></div>`;

const review = (b) => {
  const improved = !!b.scriptOriginal;
  return `
  <div class="st-note"><b>Draft ready.</b> Read it, edit it right here, or ask for changes and regenerate.</div>
  <div class="st-f">${C.field('script', `Script <span class="pill ai">${improved ? 'improved by AI' : 'written by AI'}</span>`, b.script, {rows: 12})}</div>
  <div class="small muted st-count" data-story-count>${countText(b.script)}</div>
  <label class="f"><span>What should change? <i class="muted">(optional)</i></span><input data-story-instr placeholder="e.g. shorter, more energetic, mention the free trial" /></label>
  <div class="st-actions"><button type="button" class="btn ghost" data-story="back" ${dis()}>← Back</button>
    <button type="button" class="btn" data-story="regen" ${dis()} title="${improved ? 'Improve your original text again' : 'Write a new version from your idea'}">↻ Regenerate</button>
    ${improved ? `<button type="button" class="btn ghost" data-story="revert" ${dis()}>Use my original</button>` : ''}
    <button type="button" class="btn primary lg" data-story="approve" ${dis()}>Approve script &amp; fill details →</button></div>`;
};

const ALSO = {title: 'title', style: 'style words', captions: 'captions', durationSec: 'length', notes: 'notes'};
const approved = (b) => {
  const also = Object.keys(ALSO).filter((k) => ST.filled.includes(k));
  return `
  <div class="st-approved"><span class="st-check">✓</span><div><b>Script approved</b><div class="small muted">${countText(b.script)}</div></div>
    <button type="button" class="btn ghost sm" data-story="edit" ${dis()}>Edit script</button></div>
  <details class="st-script"><summary>Show the script</summary>${C.field('script', '', b.script, {rows: 8})}</details>
  <div class="st-fill-head"><div><b>Video details</b><div class="small muted">${ST.filled.length ? 'Filled in by the AI from your script. Change anything you like.' : 'Edit anything that is not right.'}</div></div>
    <button type="button" class="btn sm" data-story="refill" ${dis()} title="Let the AI fill every box again from the script">↻ Refill all from script</button></div>
  <div class="st-rows">
    <div class="grid g2">
      ${filledWrap('audience', C.field('audience', 'Audience', b.audience, {placeholder: 'e.g. Indian digital agencies, local business owners'}))}
      ${filledWrap('cta', C.field('cta', 'Call to action', b.cta, {placeholder: 'e.g. Start your free trial at www.magicbolt.ai'}))}
    </div>
    ${filledWrap('idea', C.field('idea', 'Idea / goal', b.idea, {rows: 2, placeholder: 'What the video is for'}))}
    ${filledWrap('language', `<div class="f"><span class="fl">Language</span><div class="opts" role="radiogroup">${C.LANGS.map((l) => `<button type="button" role="radio" aria-checked="${l === b.language}" class="opt ${l === b.language ? 'on' : ''}" data-story="lang" data-v="${esc(l)}"><b>${esc(l)}</b></button>`).join('')}</div></div>`)}
    ${filledWrap('onScreen', C.field('onScreen', 'Key on-screen text', b.onScreen, {rows: 4, placeholder: 'Headlines, prices, numbers that must appear exactly.'}))}
  </div>
  ${also.length ? `<div class="st-also"><span class="pill ai">✦ also filled</span> ${also.map((k) => `<span class="pill">${ALSO[k]}</span>`).join(' ')}<span class="small muted">in the sections below, marked “filled by AI”</span></div>` : ''}`;
};

export const storyHTML = () => {
  const b = brief(), ph = phase(b), m = mode(b), tag = C.aiTag?.();
  if (ST.pid !== C.S.cur.project.id) { ST.pid = C.S.cur.project.id; ST.usage = null; ST.filled = []; ST.error = ''; ST.score = ST.hooks = null; }
  const body = ph === 'review' ? review(b) : ph === 'approved' ? approved(b) : m === 'script' ? startScript(b) : startIdea(b);
  return `
    <div class="st-top">
      ${ph === 'start' ? `<div class="st-mode" role="tablist"><button type="button" role="tab" class="${m === 'idea' ? 'on' : ''}" data-story="mode" data-mode="idea" ${dis()}><b>I have an idea</b><small>AI writes the script</small></button><button type="button" role="tab" class="${m === 'script' ? 'on' : ''}" data-story="mode" data-mode="script" ${dis()}><b>I have a script</b><small>Improve it or use it as it is</small></button></div>` : stepper(ph)}
      ${tag ? `<span class="pill ai" title="The model that answers when you press an AI button here">✦ AI · ${esc(tag)}</span>` : ''}
    </div>
    ${body}
    ${checkTools(b)}
    ${runBar()}
    ${scoreHTML(b)}${hooksHTML(b)}
    ${ST.error ? `<div class="st-err">${esc(ST.error)}</div>` : ''}
    ${usageLine()}`;
};

export const renderStory = () => { const el = $('#story-card'); if (el) el.innerHTML = storyHTML(); tickTime(); };

const tickTime = () => {
  const el = $('[data-story-time]');
  if (el && ST.busy) el.textContent = `${clock((Date.now() - ST.startedAt) / 1000)} elapsed · usually ${TYPICAL[ST.action] ?? '10 to 30 s'}`;
};

const run = async (action, extra = {}) => {
  if (ST.busy) return;
  const id = C.S.cur.project.id;
  await C.flushSave();
  ST.busy = true; ST.action = action; ST.error = ''; ST.startedAt = Date.now(); ST.ctrl = new AbortController();
  clearInterval(ST.timer); ST.timer = setInterval(tickTime, 1000);
  renderStory(); C.onBusy?.();
  let ok = false;
  try {
    const r = await C.api(`/api/projects/${id}/story/assist`, {method: 'POST', signal: ST.ctrl.signal, body: {action, ...extra}});
    if (action === 'score' || action === 'hooks') { // read-only checks: the script itself is untouched
      if (C.S.cur?.project.id === id) { ST[action] = {...r, of: extra.brief?.script ?? ''}; ST.usage = r.usage; }
    } else if (C.S.cur?.project.id === id) {
      C.S.cur.project.brief = r.brief;
      ST.usage = r.usage; ST.filled = action === 'fill' ? r.filled : ST.filled;
      if (r.filled?.includes('style')) { const el = document.querySelector('#brief [name="style"]'); if (el) el.value = r.brief.style; }
    }
    if (action === 'fill' && C.S.cur?.project.id === id) { if (r.title) C.S.cur.project.title = r.title; }
    ok = true;
    if (action === 'fill') C.toast('Everything is filled in. Change anything you like.');
  } catch (e) {
    if (ST.ctrl.signal.aborted || e.name === 'AbortError') C.toast('Stopped.');
    else { ST.error = e.message; C.toast(e.message); }
  } finally {
    clearInterval(ST.timer); ST.busy = false; ST.ctrl = null;
    if (C.S.cur?.project.id === id) { if (ok && action === 'fill') C.onFilled?.(); else renderStory(); }
    C.onBusy?.(); C.onChange?.();
  }
};

const text = (name) => String($(`#story-card [name="${name}"]`)?.value ?? brief()[name] ?? '').trim();

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-story]');
  if (!b || !C?.S.cur) return;
  const br = brief(), instr = () => String($('[data-story-instr]')?.value ?? '').trim();
  switch (b.dataset.story) {
    case 'mode': C.setBrief('storyMode', b.dataset.mode); renderStory(); break;
    case 'write':
      if (!text('idea')) { C.toast('Write your idea first.'); break; }
      await run('script', {brief: {idea: text('idea')}}); break;
    case 'improve':
      if (!text('script')) { C.toast('Paste your script first.'); break; }
      await run('improve', {brief: {script: text('script')}}); break;
    case 'use':
      if (!text('script')) { C.toast('Paste your script first.'); break; }
      C.setBrief('script', text('script')); C.setBrief('scriptOriginal', ''); await run('fill', {brief: {script: text('script')}}); break;
    case 'regen': {
      const i = instr();
      if (br.scriptOriginal) await run('improve', {instruction: i, brief: {script: br.scriptOriginal}});
      else await run('script', {instruction: i, brief: {script: text('script'), idea: text('idea') || br.idea}});
      break;
    }
    case 'revert': {
      C.setBrief('script', br.scriptOriginal); C.setBrief('scriptOriginal', ''); C.setBrief('scriptState', 'review'); renderStory(); break;
    }
    case 'approve': C.setBrief('script', text('script')); await run('fill', {brief: {script: text('script')}}); break;
    case 'refill': await run('fill', {overwrite: true, brief: {script: text('script')}}); break;
    case 'back': C.setBrief('scriptState', ''); renderStory(); break;
    case 'edit': C.setBrief('scriptState', 'review'); renderStory(); break;
    case 'lang': C.setBrief('language', b.dataset.v); renderStory(); break;
    case 'score': case 'hooks':
      if (!text('script')) { C.toast('Write or paste a script first.'); break; }
      await run(b.dataset.story, {brief: {script: text('script')}}); break;
    case 'close-score': ST.score = null; renderStory(); break;
    case 'close-hooks': ST.hooks = null; renderStory(); break;
    case 'usehook': {
      const hook = ST.hooks?.hooks[Number(b.dataset.i)], ta = $('#story-card [name="script"]');
      if (!hook || !ta) break;
      ta.closest('details')?.setAttribute('open', '');
      const lines = ta.value.split('\n'), lead = (lines[0].match(/^(?:\s*\[[^\]\n]+\])*\s*/) ?? [''])[0]; // keep audio tags that start the old line
      lines[0] = `${lead}${hook.line}`;
      ta.value = lines.join('\n');
      ta.dispatchEvent(new Event('input', {bubbles: true})); // saves the brief like normal typing
      C.toast('Opening line replaced. Edit it if you like.'); renderStory(); break;
    }
    case 'cancel': stopStoryRun(); break;
  }
});

document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.name === 'script' && t.closest('#story-card')) { const c = $('[data-story-count]'); if (c) c.textContent = countText(t.value); }
});
