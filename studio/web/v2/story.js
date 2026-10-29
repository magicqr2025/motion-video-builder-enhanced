// Story on the Brief page: idea -> AI script -> review -> approve -> AI fills the details; or paste a script and improve it / use it as it is.
// Same steps and the same saved fields (scriptState, scriptOriginal, storyMode) as the classic app, so both show the same state.
import {$, S, api, esc, toast, clock, words, queueSave, flushSave, pill} from './core.js';
import './voicelib.js'; // the "From library" and "Save to library" buttons are handled there

const LANGS = ['English', 'Hinglish', 'Hindi', 'Hindi + English captions'];
const ST = {pid: null, busy: false, action: '', ctrl: null, startedAt: 0, timer: null, usage: null, filled: [], error: '', score: null, hooks: null};
const RUN = {script: 'Writing your script…', improve: 'Improving your script…', fill: 'Reading the script and filling in the details…', score: 'Scoring your script…', hooks: 'Looking for stronger hooks…'};
const WPS = 2.5;

let onChange = () => {}; // the Brief page: refresh its summary and readiness
export const initStory = (fn) => { onChange = fn; };
export const storyRunning = () => ST.busy;

const brief = () => S.cur.project.brief;
const set = (k, v) => { brief()[k] = v; queueSave({brief: {[k]: v}}, setState); onChange(); };
const setState = (t) => { const el = $('#b-state'); if (el) el.textContent = t; };
const phase = (b) => (!String(b.script ?? '').trim() ? 'start' : b.scriptState === 'approved' || (b.scriptState === undefined && S.cur.project.status !== 'brief') ? 'approved' : b.scriptState === 'review' ? 'review' : 'start');
const mode = (b) => b.storyMode ?? (String(b.script ?? '').trim() && !String(b.idea ?? '').trim() ? 'script' : 'idea');
const count = (t) => { const n = words(t); return n ? `${n} words · about ${clock(n / WPS)} spoken` : 'Nothing written yet'; };
const dis = () => (ST.busy ? 'disabled' : '');
const text = (name) => String($(`#sec-story [data-b="${name}"]`)?.value ?? brief()[name] ?? '').trim();

const ta = (name, label, value, rows, ph = '') => `<label class="f"><span>${label}</span><textarea class="in" data-b="${name}" rows="${rows}" placeholder="${esc(ph)}">${esc(value ?? '')}</textarea></label>`;
const inp = (name, label, value, ph = '') => `<label class="f"><span>${label}</span><input class="in" data-b="${name}" value="${esc(value ?? '')}" placeholder="${esc(ph)}" /></label>`;
const filled = (key, html) => `<div class="${ST.filled.includes(key) ? 'ai-filled' : ''}">${html}</div>`;

const steps = (ph) => `<ol class="steps">${[['Idea or script', 'start'], ['Review the script', 'review'], ['Video details', 'approved']].map(([l, k], i) => { const at = ['start', 'review', 'approved'].indexOf(ph); return `<li class="${i < at ? 'done' : ''} ${i === at ? 'on' : ''}"><span>${i < at ? '✓' : i + 1}</span>${l}</li>`; }).join('')}</ol>`;

const body = (b, ph, m) => {
  if (ph === 'review') {
    const imp = !!b.scriptOriginal;
    return `<div class="note">Draft ready. Read it, edit it right here, or ask for changes and regenerate.</div>
      ${ta('script', `Script ${pill(imp ? 'improved by AI' : 'written by AI', 'violet')}`, b.script, 12)}
      <div class="small muted" data-count>${count(b.script)}</div>
      <label class="f"><span>What should change? <i class="dim">(optional)</i></span><input class="in" data-instr placeholder="e.g. shorter, more energetic, mention the free trial" /></label>
      <div class="row"><button type="button" class="btn ghost" data-st="back" ${dis()}>← Back</button><button type="button" class="btn" data-st="regen" ${dis()}>↻ Regenerate</button>${imp ? `<button type="button" class="btn ghost" data-st="revert" ${dis()}>Use my original</button>` : ''}
        <button type="button" class="btn main" data-st="approve" ${dis()}>Approve script and fill details →</button></div>`;
  }
  if (ph === 'approved') {
    const also = {title: 'title', style: 'style words', captions: 'captions', durationSec: 'length', notes: 'notes'};
    return `<div class="approved"><span class="okdot">✓</span><div style="flex:1"><b>Script approved</b><div class="small muted" data-count>${count(b.script)}</div></div><button type="button" class="btn sm" data-st="edit" ${dis()}>Edit script</button></div>
      <details class="fold"><summary>Show the script</summary>${ta('script', '', b.script, 8)}</details>
      <div class="spread"><div><b>Video details</b><div class="small muted">${ST.filled.length ? 'Filled in by the AI from your script. Change anything you like.' : 'Edit anything that is not right.'}</div></div><button type="button" class="btn sm" data-st="refill" ${dis()}>↻ Refill all from script</button></div>
      <div class="g2">${filled('audience', inp('audience', 'Audience', b.audience, 'e.g. Indian digital agencies'))}${filled('cta', inp('cta', 'Call to action', b.cta, 'e.g. Start your free trial'))}</div>
      ${filled('idea', ta('idea', 'Idea / goal', b.idea, 2, 'What the video is for'))}
      ${filled('language', `<div class="f"><span>Language</span><div class="opts">${LANGS.map((l) => `<button type="button" class="opt ${l === b.language ? 'on' : ''}" data-st="lang" data-v="${esc(l)}">${esc(l)}</button>`).join('')}</div></div>`)}
      ${filled('onScreen', ta('onScreen', 'Key on-screen text', b.onScreen, 4, 'Headlines, prices, numbers that must appear exactly.'))}
      ${Object.keys(also).some((k) => ST.filled.includes(k)) ? `<div class="row small muted">${pill('✦ also filled', 'violet')}${Object.keys(also).filter((k) => ST.filled.includes(k)).map((k) => pill(also[k])).join('')}<span>in the sections below</span></div>` : ''}`;
  }
  return m === 'script'
    ? `${ta('script', 'Your script', b.script, 10, 'Paste your script here. One sentence per line works best.')}<div class="small muted" data-count>${count(b.script)}</div>
       <div class="row"><button type="button" class="btn main" data-st="improve" ${dis()}>Improve with AI</button><button type="button" class="btn" data-st="use" ${dis()}>Use as it is →</button><span class="small muted">Improve rewrites it for you to review. “Use as it is” keeps your words and fills in the rest.</span></div>`
    : `${ta('idea', 'Your idea', b.idea, 5, 'e.g. Show agencies how to set up the white label in 3 steps, so support tickets drop.')}
       <div class="row"><button type="button" class="btn main" data-st="write" ${dis()}>Write the script</button><span class="small muted">The AI writes a voiceover script from your idea. You review it before anything else is filled in.</span></div>`;
};

const checks = (b) => {
  if (!words(b.script)) return '';
  const band = (n, hi) => { const p = (n / hi) * 100; return p >= 80 ? 'good' : p >= 60 ? 'ok' : 'low'; };
  const stale = (r) => (r && r.of !== String(b.script ?? '').trim() ? '<span class="small muted">The script changed since this check.</span>' : '');
  const s = ST.score, h = ST.hooks;
  return `<div class="row"><span class="small muted">Check the script</span><button type="button" class="btn sm" data-st="score" ${dis()}>Score it</button><button type="button" class="btn sm" data-st="hooks" ${dis()}>Find stronger hooks</button></div>
    ${s ? `<div class="res"><div class="spread"><div class="row" style="gap:16px"><span class="big ${band(s.score, 100)}" style="font-size:44px">${s.score}<small>/100</small></span><div><b>${esc(s.verdict)}</b><div>${stale(s)}</div></div></div><button type="button" class="btn ghost sm" data-st="close-score">Hide</button></div>
      <div class="parts">${s.parts.map((x) => `<div class="part"><span>${esc(x.name)}</span><i class="${band(x.score, 10)}"><u style="width:${x.score * 10}%"></u></i><b>${x.score}</b><small>${esc(x.note)}</small></div>`).join('')}</div>
      ${s.fixes.length ? `<div><b>Fix first</b><ol class="fixes">${s.fixes.map((f) => `<li>${esc(f)}</li>`).join('')}</ol></div>` : ''}</div>` : ''}
    ${h ? `<div class="res"><div class="spread"><div><b>Stronger opening lines</b> ${stale(h)}</div><button type="button" class="btn ghost sm" data-st="close-hooks">Hide</button></div>
      ${h.hooks.length ? h.hooks.map((x, i) => `<div class="hook"><div><b>${esc(x.line)}</b><div class="small muted">${x.formula ? `${pill(x.formula)} ` : ''}${esc(x.why)}</div></div><button type="button" class="btn sm" data-st="usehook" data-i="${i}" ${dis()} title="Replaces the first line of your script (audio tags on that line are kept)">Use as opening line</button></div>`).join('') : '<div class="small muted">No hooks came back. Try again.</div>'}</div>` : ''}`;
};

const usage = () => {
  const u = ST.usage;
  if (!u) return '';
  const tok = (u.input || 0) + (u.output || 0);
  return `<div class="usage">${pill('✦ AI used', 'violet')}<span>${esc(u.engine)}${u.model && u.model !== 'default' ? ` · ${esc(u.model)}` : ''}</span><span>${(u.ms / 1000).toFixed(1)} s</span>${tok ? `<span>${tok.toLocaleString()} tokens</span>` : ''}${u.costUsd ? `<span>≈ $${u.costUsd.toFixed(4)}</span>` : u.engine === 'Claude Code' ? '<span class="dim">counted against your Claude plan</span>' : ''}</div>`;
};

export const storyHTML = () => {
  const b = brief(), ph = phase(b), m = mode(b);
  if (ST.pid !== S.cur.project.id) Object.assign(ST, {pid: S.cur.project.id, usage: null, filled: [], error: '', score: null, hooks: null});
  const modeBar = ph === 'start' ? `<div class="seg" role="tablist"><button type="button" role="tab" class="${m === 'idea' ? 'on' : ''}" data-st="mode" data-mode="idea" ${dis()}><b>I have an idea</b><small>AI writes the script</small></button><button type="button" role="tab" class="${m === 'script' ? 'on' : ''}" data-st="mode" data-mode="script" ${dis()}><b>I have a script</b><small>Improve it or use it as it is</small></button></div>` : steps(ph);
  return `<div class="spread"><div><h2>Story</h2><div class="small muted">Start from an idea or a script</div></div>
    <div class="row" style="gap:8px"><button type="button" class="btn sm" data-vl="pick-script" ${dis()}>From library</button>${words(b.script) ? `<button type="button" class="btn sm" data-vl="save-script" ${dis()} title="Keep this script to reuse in other videos">Save to library</button>` : ''}</div></div>${modeBar}${body(b, ph, m)}${checks(b)}
    ${ST.busy ? `<div class="run"><div class="row"><i class="live"></i><b>${RUN[ST.action] ?? 'Working…'}</b><span class="small muted" data-st-time></span><button type="button" class="btn sm ghost" data-st="cancel">Stop</button></div><div class="bar"><span class="sheen"></span></div></div>` : ''}
    ${ST.error ? `<div class="err">${esc(ST.error)}</div>` : ''}${usage()}`;
};
export const paintStory = () => { const el = $('#sec-story'); if (el) el.innerHTML = storyHTML(); tickTime(); };
const tickTime = () => { const el = $('[data-st-time]'); if (el && ST.busy) el.textContent = `${clock((Date.now() - ST.startedAt) / 1000)} elapsed · usually 10 to 30 s`; };

const run = async (action, extra = {}) => {
  if (ST.busy) return;
  const id = S.cur.project.id;
  await flushSave(setState);
  Object.assign(ST, {busy: true, action, error: '', startedAt: Date.now(), ctrl: new AbortController()});
  clearInterval(ST.timer); ST.timer = setInterval(tickTime, 1000);
  paintStory();
  let ok = false;
  try {
    const r = await api(`/api/projects/${id}/story/assist`, {method: 'POST', signal: ST.ctrl.signal, body: {action, ...extra}});
    if (S.cur?.project.id === id) {
      if (action === 'score' || action === 'hooks') ST[action] = {...r, of: extra.brief?.script ?? ''};
      else { S.cur.project.brief = r.brief; if (r.title) S.cur.project.title = r.title; if (action === 'fill') ST.filled = r.filled ?? []; }
      ST.usage = r.usage;
    }
    ok = true;
    if (action === 'fill') toast('Everything is filled in. Change anything you like.');
  } catch (e) {
    if (ST.ctrl.signal.aborted || e.name === 'AbortError') toast('Stopped.'); else { ST.error = e.message; toast(e.message); }
  } finally {
    clearInterval(ST.timer); ST.busy = false; ST.ctrl = null;
    if (S.cur?.project.id === id) { paintStory(); onChange(ok && action === 'fill'); }
  }
};

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-st]');
  if (!b || !S.cur || !$('#sec-story')) return;
  const br = brief(), instr = () => String($('#sec-story [data-instr]')?.value ?? '').trim();
  switch (b.dataset.st) {
    case 'mode': set('storyMode', b.dataset.mode); paintStory(); break;
    case 'write': if (!text('idea')) { toast('Write your idea first.'); break; } await run('script', {brief: {idea: text('idea')}}); break;
    case 'improve': if (!text('script')) { toast('Paste your script first.'); break; } await run('improve', {brief: {script: text('script')}}); break;
    case 'use': if (!text('script')) { toast('Paste your script first.'); break; } set('script', text('script')); set('scriptOriginal', ''); await run('fill', {brief: {script: text('script')}}); break;
    case 'regen': { const i = instr(); if (br.scriptOriginal) await run('improve', {instruction: i, brief: {script: br.scriptOriginal}}); else await run('script', {instruction: i, brief: {script: text('script'), idea: text('idea') || br.idea}}); break; }
    case 'revert': set('script', br.scriptOriginal); set('scriptOriginal', ''); set('scriptState', 'review'); paintStory(); break;
    case 'approve': set('script', text('script')); await run('fill', {brief: {script: text('script')}}); break;
    case 'refill': await run('fill', {overwrite: true, brief: {script: text('script')}}); break;
    case 'back': set('scriptState', ''); paintStory(); break;
    case 'edit': set('scriptState', 'review'); paintStory(); break;
    case 'lang': set('language', b.dataset.v); paintStory(); break;
    case 'score': case 'hooks': if (!text('script')) { toast('Write or paste a script first.'); break; } await run(b.dataset.st, {brief: {script: text('script')}}); break;
    case 'close-score': ST.score = null; paintStory(); break;
    case 'close-hooks': ST.hooks = null; paintStory(); break;
    case 'usehook': {
      const hook = ST.hooks?.hooks[Number(b.dataset.i)], t = $('#sec-story [data-b="script"]');
      if (!hook || !t) break;
      t.closest('details')?.setAttribute('open', '');
      const lines = t.value.split('\n'), lead = (lines[0].match(/^(?:\s*\[[^\]\n]+\])*\s*/) ?? [''])[0]; // keep audio tags that start the old line
      lines[0] = `${lead}${hook.line}`; t.value = lines.join('\n');
      t.dispatchEvent(new Event('input', {bubbles: true}));
      toast('Opening line replaced. Edit it if you like.'); paintStory(); break;
    }
    case 'cancel': ST.ctrl?.abort(); break;
  }
});
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.dataset?.b === 'script' && t.closest('#sec-story')) { const c = $('#sec-story [data-count]'); if (c) c.textContent = count(t.value); }
});
