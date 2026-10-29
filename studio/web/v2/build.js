// Build & timing: checklist, what the AI is doing right now, the timeline and one card per scene to review and approve.
import {$, S, api, esc, toast, clock, fmtT, dur, bust, pill, ICON, gradFor, classicUrl} from './core.js';

const B = {id: null, saveTimer: null, dirty: false, progress: null, progAt: 0, done: null, steps: []};
const COLORS = ['#7B5CFF', '#3B7BFF', '#14A36B', '#E8A52B', '#E0437F', '#0FA5B8', '#6A58E8', '#C9822B'];
let ticker = null;

const proj = () => S.cur.project;
const review = () => { const p = proj(); p.review ??= {}; p.review.notes ??= {}; p.review.adds ??= []; p.review.general ??= ''; return p.review; };
const noteCount = () => Object.values(review().notes).filter((t) => String(t).trim()).length;
const pending = () => noteCount() + review().adds.filter((a) => String(a.text).trim()).length + (String(review().general).trim() ? 1 : 0);
const myJob = () => S.live.busy.find((b) => b.projectId === proj().id);
const myProc = () => (S.live.procs ?? []).find((x) => x.projectId === proj().id && x.kind === 'ai');

// ---------- data ----------
const loadProgress = async () => {
  if (!S.cur) return;
  try { B.progress = await api(`/api/projects/${proj().id}/build-progress`); B.progAt = Date.now(); paintTasks(); paintLive(); } catch { /* retried on the next beat */ }
};
// "usually X to Y" comes from this PC's own history: finished AI tasks with the same name
const loadHistory = async () => { try { B.done = (await api('/api/processes')).finished ?? []; paintLive(); paintRestart(); } catch { B.done = []; } };
const usually = () => {
  const run = myProc();
  if (!run || !B.done) return '';
  const t = B.done.filter((x) => x.label === run.label && x.status === 'done' && x.durationMs > 5000).map((x) => x.durationMs).sort((a, b) => a - b);
  if (!t.length) return '';
  const q = (f) => t[Math.min(t.length - 1, Math.floor(f * t.length))];
  return t.length >= 3 ? `Usually ${dur(q(0.25))} to ${dur(q(0.75))}` : `Last time ${dur(t[t.length - 1])}`;
};
const loadSteps = async () => {
  try {
    const r = await api(`/api/activity?since=${B.since ?? Date.now() - 10 * 60000}`);
    B.since = r.now ?? B.since;
    B.steps = [...B.steps, ...(r.entries ?? []).filter((e) => e.projectId === proj().id && e.source !== 'save' && !B.steps.some((x) => x.id === e.id))].slice(-4);
    paintLive();
  } catch { /* optional */ }
};

// ---------- pieces ----------
const tasksHtml = () => {
  const bp = B.progress;
  if (!bp) return '<div class="skel" style="height:330px"></div>';
  const t = bp.tasks, doneN = t.filter((x) => x.done).length, open = t.findIndex((x) => !x.done), pct = Math.round((doneN / t.length) * 100);
  return `<div class="card d1" style="padding:26px 28px"><i class="glow" style="width:240px;height:240px;left:-70px;top:-80px;background:rgba(111,92,255,.28)"></i>
    <div class="spread" style="position:relative"><div><h2>Build checklist</h2><div class="small muted">${doneN} of ${t.length} done${bp.busy ? ' · the AI is working on it' : bp.interrupted ? ' · interrupted' : doneN === t.length ? ' · all done' : ''}</div></div>
      <span class="big" style="font-size:52px">${pct}<small style="font-size:22px;letter-spacing:0">%</small></span></div>
    <div class="bar" style="margin:14px 0 8px;position:relative"><i style="width:${Math.max(3, pct)}%">${bp.busy ? '<span class="sheen"></span>' : ''}</i></div>
    <div style="position:relative">${t.map((x, i) => `<div class="task ${x.done ? 'done' : i === open && bp.busy ? 'now' : ''}"><span class="tk">${x.done ? ICON.check : i === open && bp.busy ? '<i class="live"></i>' : ''}</span><b>${esc(x.label)}</b><small>${esc(x.detail ?? '')}</small></div>`).join('')}</div>
    ${bp.busy && bp.now ? `<div class="small muted" style="margin-top:10px;position:relative">${esc(bp.now)}</div>` : ''}</div>`;
};
const paintTasks = () => { const el = $('#b-tasks'); if (el) el.innerHTML = tasksHtml(); };

const liveHtml = () => {
  const job = myJob(), p = myProc(), last = B.steps.at(-1);
  const quiet = job && Date.now() - (job.lastAt || job.startedAt) > 60000;
  if (!job) return `<div class="card d2" style="padding:26px 28px"><div class="spread"><h2>Live</h2>${pill('Idle', 'dim')}</div><p class="muted" style="margin:14px 0 0">The AI is not working on this video right now.${S.cur.resumable ? ' The build was interrupted: use Resume below.' : ''}</p></div>`;
  return `<div class="card d2" style="padding:26px 28px;display:flex;flex-direction:column;gap:16px">
    <div class="spread"><h2>Live</h2><span class="pill mint"><i class="live"></i>Working</span></div>
    <div class="row" style="gap:30px;align-items:flex-end">
      <div><div class="big" style="font-size:44px" data-elapsed="${job.startedAt}">${clock((Date.now() - job.startedAt) / 1000)}</div><div class="small muted">elapsed</div></div>
      ${usually() ? `<div><b style="font-size:17px">${esc(usually())}</b><div class="small muted">from your own earlier runs</div></div>` : ''}
    </div>
    <div class="bar"><span class="sheen"></span></div>
    <div class="logbox" aria-live="off">${B.steps.length ? B.steps.map((e) => `<span><time>${new Date(e.ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}</time>${esc(e.text)}</span>`).join('') : '<span class="muted">Waiting for the first step…</span>'}</div>
    ${quiet ? `<div class="quiet">No new output for ${dur(Date.now() - (job.lastAt || job.startedAt))}. Still running. Type-checking and rendering are quiet; stop it only if this goes past about 5 minutes.</div>` : ''}
    <div class="row" style="margin-top:auto;justify-content:space-between"><span class="small muted">${esc(p?.model ?? '')}${p?.where ? ` · ${esc(p.where)}` : ''}</span><span class="row" style="gap:8px"><button type="button" class="btn sm" data-act="restart" title="Stops the AI, then starts the same task again">Stop &amp; restart</button><button type="button" class="btn sm danger" data-act="stop">Stop build</button></span></div></div>`;
};
const paintLive = () => { const el = $('#b-live'); if (el) el.innerHTML = liveHtml(); };

// pick the check still that belongs to a scene (by the time in its file name)
const framesByTime = () => {
  const fps = S.cur.storyboard?.fps ?? 30;
  return (S.cur.checks ?? []).map((rel) => {
    const name = rel.split('/').pop(), a = name.match(/-(\d+(?:\.\d+)?)s\.(?:png|jpe?g)$/i), b = name.match(/-f(\d+)\.(?:png|jpe?g)$/i);
    const t = a ? Number(a[1]) : b ? Number(b[1]) / fps : null;
    return t == null ? null : {rel, t};
  }).filter(Boolean);
};
const frameFor = (frames, s, last) => {
  const mid = (Number(s.start) + Number(s.end)) / 2;
  return frames.filter((f) => f.t >= Number(s.start) - 0.05 && (f.t < Number(s.end) - 0.001 || (last && f.t <= Number(s.end) + 0.6))).sort((x, y) => Math.abs(x.t - mid) - Math.abs(y.t - mid))[0] ?? null;
};

const timelineHtml = (sb) => {
  const scenes = sb.scenes ?? [], total = sb.durationSec || scenes.at(-1)?.end || 1;
  return `<div class="card d3"><div class="spread" style="margin-bottom:16px"><h2>Timeline</h2><div class="row" style="gap:8px">${pill(`${fmtT(total)} total`, 'violet')}${pill(`${scenes.length} scenes`)}${pill(`${sb.width}×${sb.height} · ${sb.fps} fps`)}${(sb.audio ?? []).length ? pill('Voiceover synced', 'mint') : ''}</div></div>
    <div class="tl">${scenes.map((s, i) => `<div style="flex:${Math.max(0.01, s.end - s.start)} 1 0;background:${COLORS[i % COLORS.length]};animation-delay:${(0.1 + i * 0.1).toFixed(2)}s" title="${esc(s.name)} · ${fmtT(s.start)}–${fmtT(s.end)}" data-jump="${i}">${esc(s.name)}</div>`).join('')}</div>
    <div class="ticks">${Array.from({length: 6}, (_, i) => `<span>${fmtT((total * i) / 5)}</span>`).join('')}</div></div>`;
};

const sceneCard = (s, i, frames, last, portrait, busy) => {
  const f = frameFor(frames, s, last), n = String(s.n ?? i + 1), note = review().notes[n] ?? '';
  return `<div class="card scene ${note.trim() ? 'has-note' : ''}" id="scene-${i}" style="padding:12px">
    <div class="frame" style="background:${gradFor(proj().id, i)}" ${f ? `data-zoom="/data/${proj().id}/${f.rel}${bust()}" data-group="scenes" data-cap="${esc(`${n} · ${s.name}`)}"` : ''}>
      ${f ? `<img loading="lazy" src="/data/${proj().id}/${f.rel}${bust()}" alt="Frame of scene ${esc(n)}: ${esc(s.name)}" />` : '<span class="no">No frame yet</span>'}
      <span class="num">${esc(n)}</span>${f ? '' : `<span class="nm">${esc(s.name)}</span>`}</div>
    <div class="srow"><b style="font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.name)}</b><span class="pill">${(s.end - s.start).toFixed(1)} s</span></div>
    <div class="srow muted"><span>${fmtT(s.start)} – ${fmtT(s.end)}</span><button type="button" class="btn ghost icon sm" data-act="frame" data-n="${esc(n)}" ${busy ? 'disabled' : ''} title="Draw a fresh frame for this scene" aria-label="Refresh frame of scene ${esc(n)}">${ICON.refresh}</button></div>
    <label class="f"><span>What should change?</span><textarea class="in" rows="2" data-note="${esc(n)}" placeholder="e.g. hold longer, bigger headline">${esc(note)}</textarea></label></div>`;
};

const barHtml = () => {
  const p = proj(), busy = S.cur.busy, pend = pending();
  const sum = [noteCount() && `${noteCount()} scene correction${noteCount() === 1 ? '' : 's'}`, review().adds.length && `${review().adds.length} new scene${review().adds.length === 1 ? '' : 's'}`, String(review().general).trim() && 'a general note'].filter(Boolean).join(', ');
  return `<div class="tx"><b>${p.approval ? 'Approved. Rendering is unlocked.' : pend ? `${sum} ready to send` : 'Nothing is rendered until you approve'}</b><div class="small muted"><span id="b-save">${p.approval ? 'Withdraw the approval to change the video again.' : 'Check every scene. Notes save as you type.'}</span></div></div>
    <button type="button" class="btn" data-act="frames-all" ${busy ? 'disabled' : ''}>${ICON.refresh} Refresh frames</button>
    ${p.approval ? `<button type="button" class="btn" data-act="unapprove">Withdraw approval</button><a class="btn main" href="#/p/${p.id}/render">Go to render ${ICON.play}</a>`
      : `<button type="button" class="btn ${pend ? 'main' : ''}" data-act="send" ${busy || !pend ? 'disabled' : ''}>Send corrections to AI</button>
         <button type="button" class="btn ${pend ? '' : 'main'}" data-act="approve" ${busy || pend ? 'disabled' : ''} title="${pend ? 'Send or clear your corrections first' : ''}">Approve and render</button>`}`;
};
const paintBar = () => { const el = $('#b-bar'); if (el) el.innerHTML = barHtml(); };

// ---------- restart: what to do when the AI was stopped, failed or hangs ----------
const lastAi = () => (B.done ?? []).filter((x) => x.projectId === proj().id && x.kind === 'ai').at(-1);
const RETRY = [[/^Adapt the video/, 'adapt'], [/^(Approved concept|Resume the build)/, 'build'], [/^Apply your review/, 'review'], [/^(Generate|Revise) concepts/, 'concepts'], [/^Apply look changes/, 'look']];
const retryKind = (label) => RETRY.find(([re]) => re.test(label ?? ''))?.[1] ?? null;
const call = (path, body) => api(`/api/projects/${proj().id}/${path}`, {method: 'POST', body});
const retry = async (label) => {
  const c = S.cur, kind = retryKind(label), ap = c.project.approvedConcept;
  if (kind === 'adapt') return call('adapt', {notes: String(label).split(': ').slice(1).join(': ')});
  if (kind === 'build') return !c.storyboard && c.resumable ? call('resume-build') : ap ? call('approve', {conceptId: ap.id, notes: ap.notes ?? ''}) : Promise.reject(new Error('No concept was approved for this video.'));
  if (kind === 'review') return call('review/send');
  if (kind === 'concepts') return call('concepts', {});
  if (kind === 'look') return call('look/apply');
  throw new Error('Not sure what to repeat. Start it again from the page that began it.');
};
const restartHtml = () => {
  const c = S.cur, p = proj(), last = lastAi();
  if (c.busy) return '';
  const bad = last && ['stopped', 'error'].includes(last.status);
  if (!bad && !c.resumable) return '';
  const can = bad && retryKind(last.label), ap = p.approvedConcept;
  return `<div class="card accent d1"><div class="spread"><div style="flex:1 1 360px"><h2>${bad ? (last.status === 'stopped' ? 'The last AI task was stopped' : 'The last AI task failed') : 'The build was interrupted'}</h2>
    <p class="muted" style="margin:4px 0 0;max-width:660px">${bad ? `“${esc(String(last.label).slice(0, 120))}”${last.error ? ` · ${esc(String(last.error).slice(0, 160).replace(/[.\s]+$/, ''))}` : ''}. Your work is saved. Pick how to go on.` : `The studio stopped while the AI was building “${esc(ap?.name ?? 'your video')}”. Your work is saved. Resume carries on from where it stopped and does not start over.`}</p></div>
    <div class="row">${c.resumable ? `<button type="button" class="btn main" data-act="resume">${ICON.play} Resume build</button>` : ''}
      ${can ? `<button type="button" class="btn ${c.resumable ? '' : 'main'}" data-act="retry">${ICON.refresh} Try again</button>` : ''}
      ${c.storyboard && p.duplicatedFrom ? '<button type="button" class="btn" data-act="readapt">Re-adapt to the brief</button>' : ''}
      ${!c.storyboard && ap ? `<button type="button" class="btn" data-act="rebuild" title="Starts the build again from the beginning">Rebuild “${esc(ap.name ?? ap.id)}”</button>` : ''}</div></div></div>`;
};
const paintRestart = () => { const el = $('#b-restart'); if (el && S.cur) el.innerHTML = restartHtml(); };

// ---------- page ----------
export const render = async (host, c) => {
  const p = c.project, sb = c.storyboard, busy = c.busy;
  if (B.id !== p.id) { B.id = p.id; B.progress = null; B.steps = []; B.since = null; B.done = null; }
  clearInterval(ticker); ticker = setInterval(tick, 1000);
  const portrait = sb && sb.height > sb.width;
  host.innerHTML = `
    <div id="b-restart">${restartHtml()}</div>
    <div class="wrap"><div id="b-tasks" style="flex:1.3 1 520px;min-width:0">${tasksHtml()}</div><div id="b-live" style="flex:1 1 380px;min-width:0">${liveHtml()}</div></div>
    ${sb ? `${timelineHtml(sb)}
      <div class="spread"><h2>Scenes</h2><span class="small muted">Write what is wrong under a scene, then send everything to the AI at once. ${review().adds.length ? '' : `Need a new scene? <a href="${classicUrl(p.id, 'build')}" target="_blank" rel="noopener" style="text-decoration:underline">Add it in classic</a>.`}</span></div>
      <div class="scenes ${portrait ? '' : 'land'}">${(sb.scenes ?? []).map((s, i, a) => sceneCard(s, i, framesByTime(), i === a.length - 1, portrait, busy)).join('')}</div>
      <label class="f card tight"><span>Notes for the whole video (optional)</span><textarea class="in" id="b-general" rows="2" placeholder="e.g. Make everything a bit faster. Use the white logo on dark scenes.">${esc(review().general)}</textarea></label>
      <div class="barfix" id="b-bar">${barHtml()}</div>`
    : `<div class="card empty"><div class="orb" aria-hidden="true"></div><h2>${busy ? 'Building your video' : 'Waiting for the timing'}</h2><p>${busy ? 'The AI is writing the scenes, syncing them to the voiceover and checking frames. The timeline and the scene cards appear here as soon as the timing is ready.' : 'The timeline and scene cards appear once the build has produced the timing.'}</p></div>`}`;
  loadProgress(); loadHistory(); if (busy) loadSteps();
};

const tick = () => {
  if (!$('#b-live')) { clearInterval(ticker); return; }
  document.querySelectorAll('[data-elapsed]').forEach((el) => { el.textContent = clock((Date.now() - Number(el.dataset.elapsed)) / 1000); });
};
export const leave = () => { clearInterval(ticker); };
export const soft = () => { paintTasks(); paintLive(); paintBar(); paintRestart(); };
export const live = () => {
  if (!S.cur) return;
  if (Date.now() - B.progAt > 2500) loadProgress();
  if (myJob()) loadSteps(); else paintLive();
};

// ---------- notes: saved as you type, same review object the classic app uses ----------
const save = async () => {
  clearTimeout(B.saveTimer);
  if (!B.dirty || !S.cur) return;
  B.dirty = false;
  try {
    const r = await api(`/api/projects/${proj().id}/review`, {method: 'PUT', body: review()});
    if (!r.approval && proj().approval) proj().approval = null;
    const el = $('#b-save'); if (el) el.textContent = 'Saved.';
  } catch (e) { B.dirty = true; toast(e.message); }
};
const queueSave = () => {
  B.dirty = true;
  if (proj().approval && pending()) proj().approval = null;
  clearTimeout(B.saveTimer); B.saveTimer = setTimeout(save, 700);
  const el = $('#b-save'); if (el) el.textContent = 'Saving…';
  paintBar();
};
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (!S.cur || !t.closest?.('#tab')) return;
  if (t.dataset.note != null) { review().notes[t.dataset.note] = t.value; t.closest('.scene')?.classList.toggle('has-note', !!t.value.trim()); queueSave(); }
  else if (t.id === 'b-general') { review().general = t.value; queueSave(); }
});
document.addEventListener('focusout', (ev) => { if (ev.target.closest?.('#tab') && B.dirty) save(); });

document.addEventListener('click', async (ev) => {
  const j = ev.target.closest('[data-jump]');
  if (j && S.cur) { $(`#scene-${j.dataset.jump}`)?.scrollIntoView({behavior: 'smooth', block: 'center'}); return; }
  const b = ev.target.closest('[data-act]');
  if (!b || !S.cur || !$('#b-bar, #b-live')) return;
  const id = proj().id;
  try {
    switch (b.dataset.act) {
      case 'frame': await api(`/api/projects/${id}/scene-frame`, {method: 'POST', body: {n: b.dataset.n}}); toast('Drawing a fresh frame…'); break;
      case 'frames-all': await api(`/api/projects/${id}/scene-frame`, {method: 'POST', body: {}}); toast('Drawing a frame for every scene…'); break;
      case 'send': await save(); await api(`/api/projects/${id}/review/send`, {method: 'POST'}); toast('Sent. The AI is applying your review. New frames appear when it is done.'); break;
      case 'approve': await save(); proj().approval = (await api(`/api/projects/${id}/approve-build`, {method: 'POST'})).approval; toast('Approved. Rendering is unlocked.'); paintBar(); break;
      case 'unapprove': await api(`/api/projects/${id}/approve-build`, {method: 'DELETE'}); proj().approval = null; toast('Approval withdrawn.'); paintBar(); break;
      case 'resume': await api(`/api/projects/${id}/resume-build`, {method: 'POST'}); toast('Resuming the build…'); break;
      case 'retry': { b.disabled = true; await retry(lastAi()?.label); toast('Trying again…'); break; }
      case 'readapt': { b.disabled = true; await call('adapt', {notes: ''}); toast('Claude is adapting the video again…'); break; }
      case 'rebuild': { const ap = proj().approvedConcept; b.disabled = true; await call('approve', {conceptId: ap.id, notes: ap.notes ?? ''}); toast('Rebuilding from the approved concept…'); break; }
      case 'restart': {
        const label = myProc()?.label; b.disabled = true; b.textContent = 'Stopping…';
        await call('stop');
        for (let n = 0; n < 40; n++) { await new Promise((r) => setTimeout(r, 500)); if (!(await api(`/api/projects/${id}?nolog=1`)).busy) break; }
        await retry(label); toast('Stopped, and started again.'); break;
      }
    }
  } catch (e) { toast(e.message); }
});
