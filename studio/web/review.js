// Build & timing as a review: a frame with every scene, a "what needs to change?" box per scene, "add a scene here" slots,
// send everything to the AI in one go, look at the new frames, then approve. Rendering stays locked until the user approves.
const ctx = {S: () => null, api: null, toast: () => {}, esc: (s) => s, fmtT: (s) => s, bust: () => '', liveBox: () => '', rerender: () => {}, reload: async () => {}};
export const initReview = (c) => Object.assign(ctx, c);

const R = {addOpen: null, saveTimer: null, dirty: false};
const $ = (s, el = document) => el.querySelector(s);
const cur = () => ctx.S().cur;
const proj = () => cur().project;
const review = () => { const p = proj(); p.review ??= {}; p.review.notes ??= {}; p.review.adds ??= []; p.review.general ??= ''; return p.review; };
const noteCount = () => Object.values(review().notes).filter((t) => String(t).trim()).length;
const addCount = () => review().adds.filter((a) => String(a.text).trim()).length;
const generalSet = () => !!String(review().general).trim();
const pending = () => noteCount() + addCount() + (generalSet() ? 1 : 0);
const summary = () => [noteCount() && `${noteCount()} scene correction${noteCount() === 1 ? '' : 's'}`, addCount() && `${addCount()} new scene${addCount() === 1 ? '' : 's'}`, generalSet() && 'a general note'].filter(Boolean).join(', ');

/** True while the user is typing here, so the page is not redrawn under them. */
export const reviewEditing = () => R.dirty || !!document.activeElement?.closest?.('#reviewform');

// ---------- saving (autosave, no redraw) ----------
const setSaveState = (t) => { const el = $('#rv-save'); if (el) el.textContent = t; };
const saveNow = async () => {
  clearTimeout(R.saveTimer);
  if (!R.dirty || !cur()) return;
  R.dirty = false;
  try {
    const r = await ctx.api(`/api/projects/${proj().id}/review`, {method: 'PUT', body: review()});
    if (!r.approval && proj().approval) { proj().approval = null; paintBar(); }
    setSaveState('Saved.');
  } catch (e) { R.dirty = true; setSaveState('Not saved'); ctx.toast(e.message); }
};
const queueSave = () => {
  R.dirty = true;
  if (proj().approval && pending()) { proj().approval = null; }
  clearTimeout(R.saveTimer);
  R.saveTimer = setTimeout(saveNow, 700);
  setSaveState('Saving…');
  paintBar();
};

// ---------- frames: pick the check still that belongs to each scene (by the time in its file name) ----------
const framesByTime = () => {
  const fps = cur().storyboard?.fps ?? 30;
  return (cur().checks ?? []).map((rel) => {
    const name = rel.split('/').pop();
    const a = name.match(/-(\d+(?:\.\d+)?)s\.(?:png|jpe?g)$/i), b = name.match(/-f(\d+)\.(?:png|jpe?g)$/i);
    const t = a ? Number(a[1]) : b ? Number(b[1]) / fps : null;
    return t == null ? null : {rel, t};
  }).filter(Boolean);
};
const frameFor = (frames, s, last) => {
  const mid = (Number(s.start) + Number(s.end)) / 2;
  const hits = frames.filter((f) => f.t >= Number(s.start) - 0.05 && (f.t < Number(s.end) - 0.001 || (last && f.t <= Number(s.end) + 0.6)));
  return {best: hits.sort((x, y) => Math.abs(x.t - mid) - Math.abs(y.t - mid))[0] ?? null, count: hits.length};
};

// ---------- html ----------
const stepsHtml = () => {
  const p = proj(), busy = cur().busy, n = pending();
  const active = p.approval ? 4 : busy ? 3 : n ? 2 : 1;
  const st = (i, t, sub) => `<div class="rv-step ${i < active || (i === 4 && p.approval) ? 'done' : ''} ${i === active ? 'on' : ''}"><i>${i < active || (i === 4 && p.approval) ? '✓' : i}</i><span><b>${t}</b><small>${sub}</small></span></div>`;
  return `<div class="rv-steps">${st(1, 'Check the frames', 'Look at each scene below')}${st(2, 'Write corrections', n ? `${n} waiting` : 'Or add a scene')}${st(3, 'AI applies them', busy ? 'Working now…' : 'Then new frames appear')}${st(4, 'Approve', p.approval ? 'Rendering unlocked' : 'Then render')}</div>`;
};

const barHtml = () => {
  const {esc} = ctx, p = proj(), busy = cur().busy, n = pending();
  if (p.approval) {
    return `<div class="small"><b style="color:var(--green)">✓ Approved</b> ${esc(new Date(p.approval.at).toLocaleString())} · review round ${(p.approval.round ?? 0) + 1}. Rendering is unlocked. If you change anything you will need to approve again.</div>
      <div class="row"><span class="small muted" id="rv-save"></span><button type="button" class="btn ghost sm" data-rv="unapprove">Undo approval</button><button type="button" class="btn primary lg" data-tab="render">Preview &amp; render →</button></div>`;
  }
  if (n) {
    return `<div class="small"><b>${esc(summary())}</b> waiting. Send them to the AI, check the new frames, then approve.</div>
      <div class="row"><span class="small muted" id="rv-save"></span><button type="button" class="btn gold lg" data-rv="send" ${busy ? 'disabled' : ''}>Send to AI →</button><button type="button" class="btn lg" disabled title="Send or clear your corrections first">Approve</button></div>`;
  }
  return `<div class="small muted">${busy ? 'The AI is working on the video…' : 'Happy with every scene? Approve to unlock rendering. Or write a correction / add a scene above.'}</div>
    <div class="row"><span class="small muted" id="rv-save"></span><button type="button" class="btn primary lg" data-rv="approve" ${busy ? 'disabled' : ''}>✓ Approve &amp; continue to render →</button></div>`;
};
const paintBar = () => { const el = $('#rv-bar'); if (el) el.innerHTML = barHtml(); document.querySelectorAll('.rv-steps').forEach((e) => { e.outerHTML = stepsHtml(); }); };

const addCard = (a) => {
  const {esc} = ctx;
  return `<div class="addcard" data-add="${esc(a.id)}"><div class="spread"><span class="pill gold">New scene · will become scene ${a.after + 1} · waiting for you to send it</span><button type="button" class="btn ghost sm danger" data-rv="add-remove" data-id="${esc(a.id)}">Remove</button></div>
    <textarea rows="2" data-rv-addtext="${esc(a.id)}" aria-label="New scene description">${esc(a.text)}</textarea>
    <label class="f" style="max-width:220px"><span>Length in seconds (optional)</span><input type="number" min="1" max="120" data-rv-addsec="${esc(a.id)}" value="${a.sec ?? ''}" placeholder="auto" /></label></div>`;
};
const slotHtml = (after) => {
  const open = R.addOpen === after, adds = review().adds.filter((a) => a.after === after);
  return `<div class="slot"><div class="slot-line"><button type="button" class="slot-btn" data-rv="add-open" data-after="${after}">${open ? '✕ Cancel' : `＋ Add a scene ${after === 0 ? 'at the start' : `after scene ${after}`}`}</button></div>
    ${adds.map(addCard).join('')}
    ${open ? `<div class="addform"><b>New scene ${after === 0 ? 'at the start' : `between scene ${after} and the next one`}</b>
      <textarea id="rv-new-text" rows="3" placeholder="Describe the scene for the AI: what it shows, what is said, how it should look and move. For example: “A pricing screen with three plans, the middle one highlighted with a gold ring. Voiceover: Pick the plan that fits your team.”"></textarea>
      <div class="row"><label class="f" style="width:200px"><span>Length in seconds (optional)</span><input id="rv-new-sec" type="number" min="1" max="120" placeholder="auto" /></label>
        <button type="button" class="btn primary sm" data-rv="add-save" data-after="${after}">Add to my review list</button></div>
      <div class="small muted">Nothing changes until you press “Send to AI”. You can add as many scenes as you like.</div></div>` : ''}</div>`;
};

const sceneCard = (s, i, frames, last, portrait) => {
  const {esc, fmtT, bust} = ctx, p = proj(), key = String(s.n ?? i + 1), note = review().notes[key] ?? '';
  const {best, count} = frameFor(frames, s, last);
  const dur = (Number(s.end) - Number(s.start)).toFixed(1);
  const img = best
    ? `<div class="shot" data-zoom="/data/${p.id}/${best.rel}${bust()}" data-cap="Scene ${esc(key)} · ${esc(s.name)} · ${best.t}s"><img loading="lazy" src="/data/${p.id}/${best.rel}${bust()}" alt="Frame of scene ${esc(key)}" /><span>${best.t}s${count > 1 ? ` · +${count - 1} more` : ''}</span></div>`
    : '<div class="noframe">No frame for this scene yet</div>';
  return `<article class="scene ${note.trim() ? 'has-note' : ''}" data-scene="${esc(key)}">
    <div class="scene-img">${img}<button type="button" class="btn ghost sm" data-rv="frame" data-n="${esc(key)}" title="Draw a fresh frame of this scene from the current code (no AI, no tokens)">↻ ${best ? 'Refresh' : 'Create'} frame</button></div>
    <div class="scene-body">
      <div class="scene-head"><span class="num">${esc(key)}</span><h3>${esc(s.name)}</h3><span class="pill blue">${fmtT(s.start)} – ${fmtT(s.end)} · ${dur}s</span><span class="pill gold flag">correction waiting</span></div>
      <div class="scene-info">
        ${s.onScreen ? `<div><small>On screen</small><p>${esc(s.onScreen)}</p></div>` : ''}
        ${s.vo ? `<div><small>Voiceover</small><p>${esc(s.vo)}</p></div>` : ''}
        ${s.visual ? `<div><small>Visual</small><p>${esc(s.visual)}</p></div>` : ''}
      </div>
      <label class="f"><span>What needs to change in this scene? <em class="inl">The AI reads this exactly as you write it.</em></span>
        <textarea rows="2" data-rv-note="${esc(key)}" placeholder="e.g. Make the headline bigger. Slow the chat rows down. Replace the 3D coin with the MagicBolt logo. Keep the voiceover as it is.">${esc(note)}</textarea></label>
    </div></article>`;
};

export const reviewHtml = () => {
  const {esc, fmtT, liveBox} = ctx, {project: p, storyboard: sb, busy} = cur();
  const scenes = sb.scenes ?? [], total = sb.durationSec || scenes.at(-1)?.end || 1, frames = framesByTime();
  const portrait = sb.height > sb.width;
  const ticks = Array.from({length: 6}, (_, i) => fmtT((total * i) / 5));
  const colors = ['#1354BC', '#1582D5', '#F7941D', '#7B3FF2', '#ED1C6F', '#16A34A', '#0E1B4D', '#E0A800'];
  const hist = p.reviewHistory ?? [];
  return `
    ${busy ? `<div class="card" style="margin-bottom:16px"><div class="row"><div class="spinner" style="width:22px;height:22px;border-width:3px;margin:0"></div><b>The AI is working on your video…</b><span class="live-line" data-live-last></span></div>${liveBox()}</div>` : ''}
    <div id="reviewform">
    <div class="card rv-intro">
      ${stepsHtml()}
      <p class="rv-lead"><b>Nothing is rendered until you approve.</b> Look at every scene below. If something is wrong, write it in that scene’s box. If a scene is missing, add one where it belongs. Send it all to the AI at once, check the new frames, and approve when it is right.</p>
      <div class="row"><button type="button" class="btn sm" data-rv="frames-all" ${busy ? 'disabled' : ''}>↻ Refresh all frames</button><span class="small muted">Draws one frame per scene from the current code. No AI, no tokens.</span>${p.round ? `<span class="pill" style="margin-left:auto">Review round ${p.round + 1}</span>` : ''}</div>
      <label class="f" style="margin-top:14px"><span>Notes for the whole video (optional)</span><textarea id="rv-general" rows="2" placeholder="e.g. Make everything a bit faster. Use the white logo on dark scenes.">${esc(review().general)}</textarea></label>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="spread"><h2>Timeline</h2><div class="row"><span class="pill blue">${fmtT(total)} total</span><span class="pill">${scenes.length} scenes</span><span class="pill">${sb.width}×${sb.height} · ${sb.fps} fps</span>${(sb.audio ?? []).map((a) => `<span class="pill">♪ ${esc(a)}</span>`).join('')}</div></div>
      <div class="timeline" style="margin-top:14px">${scenes.map((s, i) => `<div style="flex:${Math.max(0.01, s.end - s.start)};background:${colors[i % colors.length]}" title="${esc(s.name)} · ${fmtT(s.start)}–${fmtT(s.end)}">${esc(s.name)}</div>`).join('')}</div>
      <div class="ticks">${ticks.map((t) => `<span>${t}</span>`).join('')}</div>
    </div>
    <div class="scenes ${portrait ? 'portrait' : ''}">
      ${slotHtml(0)}
      ${scenes.map((s, i) => sceneCard(s, i, frames, i === scenes.length - 1, portrait) + slotHtml(Number(s.n ?? i + 1))).join('')}
    </div>
    ${hist.length ? `<details class="card rv-hist" style="margin-top:18px"><summary><b>Earlier corrections</b> <span class="muted small">${hist.length} sent to the AI so far, kept for your records</span></summary>
      ${[...hist].reverse().map((h) => `<div class="rv-h"><div class="small muted">${esc(new Date(h.at).toLocaleString())} · round ${(h.round ?? 0) + 1}</div><ul>${[h.review.general && `<li><b>Whole video:</b> ${esc(h.review.general)}</li>`, ...Object.entries(h.review.notes ?? {}).map(([k, t]) => `<li><b>Scene ${esc(k)}:</b> ${esc(t)}</li>`), ...(h.review.adds ?? []).map((a) => `<li><b>New scene after ${a.after || 'the start'}:</b> ${esc(a.text)}</li>`)].filter(Boolean).join('')}</ul></div>`).join('')}</details>` : ''}
    </div>
    <div class="sticky-bar" id="rv-bar">${barHtml()}</div>`;
};

// ---------- actions ----------
const rerenderAll = () => ctx.rerender();
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-rv]');
  if (!b || !cur()) return;
  const p = proj(), act = b.dataset.rv;
  try {
    if (act === 'add-open') { const a = Number(b.dataset.after); R.addOpen = R.addOpen === a ? null : a; ctx.rerender(); if (R.addOpen === a) $('#rv-new-text')?.focus(); }
    else if (act === 'add-save') {
      const text = $('#rv-new-text')?.value.trim();
      if (!text) { ctx.toast('Describe the new scene first.'); return; }
      review().adds.push({id: `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, after: Number(b.dataset.after), text, sec: Number($('#rv-new-sec')?.value) || null});
      R.addOpen = null; queueSave(); await saveNow(); ctx.rerender();
    } else if (act === 'add-remove') { review().adds = review().adds.filter((a) => a.id !== b.dataset.id); queueSave(); await saveNow(); ctx.rerender(); }
    else if (act === 'frame' || act === 'frames-all') {
      await ctx.api(`/api/projects/${p.id}/scene-frame`, {method: 'POST', body: act === 'frame' ? {n: b.dataset.n} : {}});
      ctx.toast(act === 'frame' ? 'Drawing a fresh frame…' : 'Drawing a frame for every scene…');
    } else if (act === 'send') {
      await saveNow();
      await ctx.api(`/api/projects/${p.id}/review/send`, {method: 'POST'});
      ctx.toast('Sent. The AI is applying your review. New frames appear when it is done.');
      await ctx.reload();
    } else if (act === 'approve') {
      await saveNow();
      const r = await ctx.api(`/api/projects/${p.id}/approve-build`, {method: 'POST'});
      p.approval = r.approval; ctx.toast('Approved. Rendering is unlocked.'); await ctx.reload();
    } else if (act === 'unapprove') {
      await ctx.api(`/api/projects/${p.id}/approve-build`, {method: 'DELETE'}); p.approval = null; ctx.toast('Approval withdrawn.'); await ctx.reload();
    }
  } catch (e) { ctx.toast(e.message); await ctx.reload().catch(() => {}); }
});
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (!cur() || !t.closest?.('#reviewform')) return;
  if (t.dataset.rvNote != null) { review().notes[t.dataset.rvNote] = t.value; t.closest('.scene')?.classList.toggle('has-note', !!t.value.trim()); queueSave(); }
  else if (t.id === 'rv-general') { review().general = t.value; queueSave(); }
  else if (t.dataset.rvAddtext != null) { const a = review().adds.find((x) => x.id === t.dataset.rvAddtext); if (a) { a.text = t.value; queueSave(); } }
  else if (t.dataset.rvAddsec != null) { const a = review().adds.find((x) => x.id === t.dataset.rvAddsec); if (a) { a.sec = Number(t.value) || null; queueSave(); } }
});
document.addEventListener('focusout', (ev) => { if (ev.target.closest?.('#reviewform')) saveNow(); });
