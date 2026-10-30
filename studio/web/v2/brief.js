// Brief: everything the studio needs to know before it designs. Saves as you type through the same PATCH the classic app uses.
import {$, S, api, esc, toast, fmtT, pill, ICON, queueSave, flushSave, words, classicUrl} from './core.js';
import {initStory, storyHTML, storyRunning} from './story.js';
import {paintVoice} from './voice.js';
import {initRules, rulesHTML, rulesSummary} from './rules.js';

const SIZES = [['Reel 9:16', 1080, 1920], ['Landscape 16:9', 1920, 1080], ['Square 1:1', 1080, 1080], ['Portrait 4:5', 1080, 1350], ['Loop 1200²', 1200, 1200], ['4K 16:9', 3840, 2160]];
const CAPTIONS = [['', 'Preset default'], ['word-by-word pill', 'Word by word'], ['step pill', 'Step pill'], ['kinetic big lines', 'Big lines'], ['subtitles', 'Subtitles'], ['none', 'None']];
const DURS = [['', 'Auto'], [15, '15 s'], [30, '30 s'], [45, '45 s'], [60, '1 min'], [90, '90 s']];
const FPS = [24, 25, 30, 60];
const OUTS = [['mp4', 'MP4', 'video with sound'], ['gif', 'GIF', 'loops, no sound'], ['webp', 'WebP', 'animated, no sound']];
const MOODS = ['Glossy', 'Premium', 'Playful', 'Minimal', 'Bold', 'Cinematic', 'Warm', 'Techy', 'Calm', 'Fast cuts', 'Lots of motion', 'Clean'];
const ROLES = ['voiceover', 'music', 'logo', 'image', 'footage', 'reference', 'file'];
const NUM = ['width', 'height', 'fps', 'durationSec'];

const proj = () => S.cur.project;
const brief = () => proj().brief;
const has = (v) => String(v ?? '').trim().length > 0;
const setState = (t) => { const el = $('#b-state'); if (el) el.textContent = t; };
const setB = (k, v) => { brief()[k] = v; queueSave({brief: {[k]: v}}, setState); paintRail(); };
const outFmt = (b) => (OUTS.some((o) => o[0] === b.outputFormat) ? b.outputFormat : 'mp4');
const moodList = (t) => String(t ?? '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const jobText = {};

// ---------- folding: every section starts closed, the ones you open stay open on this PC ----------
const FOLD = (k) => `studio-v2-sec-${k}`;
const isOpen = (k) => { try { return localStorage.getItem(FOLD(k)) === '1'; } catch { return false; } };
const setOpen = (k, on) => { $(`#sec-${k}`)?.classList.toggle('open', on); try { localStorage.setItem(FOLD(k), on ? '1' : '0'); } catch { /* ignore */ } };
const SUMS = {
  basics: () => proj().title,
  story: () => { const b = brief(), n = words(b.script); return !n ? 'not started' : b.scriptState === 'review' ? `in review · ${n} words` : `${n} words`; },
  voice: () => (proj().assets.some((x) => x.role === 'voiceover') ? 'voiceover added' : 'optional'),
  format: () => { const b = brief(); return `${b.width}×${b.height} · ${b.fps} fps · ${outFmt(b).toUpperCase()}`; },
  look: () => `${(brief().colors ?? []).length} colours`,
  media: () => `${proj().assets.length} file${proj().assets.length === 1 ? '' : 's'}`,
  rules: () => rulesSummary(),
};
const paintSums = () => { for (const [k, fn] of Object.entries(SUMS)) { const el = $(`#sec-${k}`); if (el) el.dataset.sum = fn(); } };

// ---------- readiness (the same checks as the classic page) ----------
const readiness = () => {
  const p = proj(), b = brief();
  const approved = b.scriptState === 'approved' || (b.scriptState === undefined && has(b.script) && p.status !== 'brief');
  return [['Video title', has(p.title), 'basics', ''], ['Script written', has(b.script), 'story', ''], ['Script approved', approved, 'story', ''], ['Audience', has(b.audience), 'story', ''], ['Call to action', has(b.cta), 'story', ''],
    ['Colours', (b.colors ?? []).length > 0, 'look', ''], ['Voiceover, footage or logo', p.assets.some((x) => ['voiceover', 'footage', 'logo', 'image'].includes(x.role)), 'media', 'optional']];
};

// ---------- small builders ----------
const opts = (attr, current, list) => `<div class="opts">${list.map(([v, l, sub]) => `<button type="button" class="opt ${String(v) === String(current ?? '') ? 'on' : ''}" ${attr}="${esc(v)}"><b>${esc(l)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('')}</div>`;
const field = (label, html, hint = '') => `<div class="f"><span>${label}</span>${html}${hint ? `<small class="dim">${hint}</small>` : ''}</div>`;
const head = (title, sub, right = '') => `<div class="spread"><div><h2>${title}</h2><div class="small muted">${sub}</div></div>${right}</div>`;

// ---------- sections ----------
const SECTIONS = {
  basics: () => {
    const p = proj(), b = brief(), pr = S.state.presets.find((x) => x.id === p.presetId);
    return `${head('Basics', 'Name, preset and brand')}
      ${pr ? `<div class="preset-banner"><img src="/data/_presets/${esc(pr.id)}.png" alt="" onerror="this.remove()" /><div><b>${esc(pr.name)}</b><div class="small muted">${esc(pr.tagline ?? '')}</div>${pr.asks?.length ? `<div class="small" style="margin-top:6px"><b>This preset needs:</b> ${pr.asks.map(esc).join(' · ')}</div>` : ''}</div></div>` : ''}
      <div class="g3">
        <label class="f"><span>Video title</span><input class="in" data-p="title" value="${esc(p.title)}" placeholder="e.g. White label setup in 3 steps" /></label>
        <label class="f"><span>Preset (reusable look)</span><select class="in" data-p="presetId"><option value="">Blank (no preset)</option>${S.state.presets.filter((x) => !x.hidden || x.id === p.presetId).map((x) => `<option value="${esc(x.id)}" ${x.id === p.presetId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        <label class="f"><span>Brand kit</span><select class="in" data-b="brandId">${S.state.brands.map((x) => `<option value="${esc(x.id)}" ${x.id === b.brandId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}<option value="custom" ${b.brandId === 'custom' ? 'selected' : ''}>Custom colours</option></select></label>
      </div>`;
  },
  format: () => {
    const b = brief(), f = outFmt(b), anim = f !== 'mp4', secs = Number(b.durationSec) || Math.round(words(b.script) / 2.5);
    return `${head('Format', 'Size, frame rate, length and output')}
      ${field('Size', `<div class="sizes">${SIZES.map(([l, w, h]) => { const on = b.width === w && b.height === h, k = 30, bw = w >= h ? k : Math.max(10, Math.round((k * w) / h)), bh = h >= w ? k : Math.max(10, Math.round((k * h) / w)); return `<button type="button" class="size ${on ? 'on' : ''}" data-size="${w}x${h}"><span class="ar"><i style="width:${bw}px;height:${bh}px"></i></span><b>${esc(l.split(' ')[0])}</b><small>${w}×${h}</small></button>`; }).join('')}</div>`)}
      <div class="g2">${field('Frame rate', opts('data-fps', b.fps, FPS.map((x) => [x, x])))}${field('Target length', opts('data-dur', b.durationSec ?? '', DURS), 'Leave on Auto when you have a voiceover: the video follows it.')}</div>
      ${field('Output', opts('data-out', f, OUTS), f === 'mp4' ? 'Best quality, with sound.' : 'Large files and no sound. Keep it short.')}
      ${anim ? `<div class="g2">${field('Animation size', opts('data-animw', Number(b.animWidth) || 480, [[480, 'Small', '480 px'], [720, 'Medium', '720 px'], [1080, 'Large', '1080 px']]))}${field('Animation frame rate', opts('data-animfps', Number(b.animFps) || 15, [[10, '10 fps'], [15, '15 fps'], [24, '24 fps']]))}</div>${secs > 20 ? `<div class="note">This is about ${secs} seconds. ${f.toUpperCase()}s that long make very large files. Under 15 seconds works best, or use MP4.</div>` : ''}` : ''}
      <details class="fold"><summary>Custom size and length</summary><div class="g3" style="margin-top:12px">
        <label class="f"><span>Width (px)</span><input class="in" type="number" data-b="width" value="${esc(b.width)}" /></label><label class="f"><span>Height (px)</span><input class="in" type="number" data-b="height" value="${esc(b.height)}" /></label>
        <label class="f"><span>Length (seconds)</span><input class="in" type="number" data-b="durationSec" value="${esc(b.durationSec ?? '')}" placeholder="auto from voiceover" /></label></div></details>`;
  },
  look: () => {
    const b = brief(), moods = moodList(b.style).map((x) => x.toLowerCase());
    return `${head('Look', 'Colours, mood and captions', '<button type="button" class="btn ghost sm" data-bf="brand-palette">Use brand palette</button>')}
      ${field('Colours', `<div class="swatches">${(b.colors ?? []).map((c, i) => `<div class="swc"><label class="sw" style="background:${esc(c)}" title="${esc(c)}"><input type="color" value="${esc(c)}" data-color="${i}" aria-label="Colour ${i + 1}" /></label><button type="button" class="x" data-bf="rm-color" data-i="${i}" aria-label="Remove colour ${i + 1}">✕</button><code>${esc(String(c).toUpperCase())}</code></div>`).join('')}<button type="button" class="swadd" data-bf="add-color" aria-label="Add a colour">${ICON.plus}</button></div>`)}
      <label class="f"><span>Style words / mood</span><input class="in" data-b="style" value="${esc(b.style ?? '')}" placeholder="e.g. glossy, premium, playful, fast cuts" /></label>
      <div class="opts">${MOODS.map((m) => `<button type="button" class="opt slim ${moods.includes(m.toLowerCase()) ? 'on' : ''}" data-mood="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      ${field('Captions', opts('data-caption', b.captions ?? '', CAPTIONS))}`;
  },
  rules: () => rulesHTML(),
  media: () => `${head('Media and references', 'Voiceover, music, logo, images, footage, reference videos')}
    <div class="drop" id="b-drop" tabindex="0" role="button" aria-label="Upload files"><b>Drop files here</b> or click to upload<div class="small muted">Voiceovers are transcribed for timing · reference videos are turned into frames the AI can study</div></div><input type="file" id="b-file" multiple hidden />
    <label class="f" style="max-width:460px"><span>Transcription speed <i class="dim">(for voiceovers you upload)</i></span><select class="in" data-tm>${[['auto', 'Auto: fast for English, accurate for Hindi and others'], ['fast', 'Fast: quickest for everything (weaker on Hindi)'], ['accurate', 'Accurate: always the careful model (slowest)']].map(([v, l]) => `<option value="${v}" ${v === (S.state.settings?.transcribeMode ?? 'auto') ? 'selected' : ''}>${l}</option>`).join('')}</select><small class="dim">This is the step that took about 16 minutes. A voiceover made with ElevenLabs here skips it.</small></label>
    <div class="assets" id="b-assets"></div>
    <div class="g2"><label class="f"><span>Links (one per line)</span><textarea class="in" data-b="links" rows="4" placeholder="Websites, product pages, YouTube or Instagram references…">${esc(brief().links ?? '')}</textarea></label>
      <label class="f"><span>Notes, do and don't</span><textarea class="in" data-b="notes" rows="4" placeholder="e.g. No stock photos. Keep the logo big at the end.">${esc(brief().notes ?? '')}</textarea></label></div>`,
};
const paint = (k) => { const el = $(`#sec-${k}`); if (el) { el.innerHTML = SECTIONS[k](); if (k === 'media') paintAssets(); } };

export const paintAssets = () => {
  const el = $('#b-assets');
  if (!el) return;
  const p = proj();
  el.innerHTML = p.assets.map((a) => {
    const url = `/public/studio/${p.id}/${encodeURIComponent(a.file)}`;
    const pv = a.kind === 'image' ? `<img src="${url}" alt="" />` : a.kind === 'video' ? `<video src="${url}#t=0.5" muted preload="metadata"></video>` : a.kind === 'audio' ? `<audio src="${url}" controls preload="none"></audio>` : '<span class="muted">file</span>';
    const info = a.info?.duration ? `${a.info.duration.toFixed(1)} s${a.info.width ? ` · ${a.info.width}×${a.info.height}` : ''}` : `${(a.size / 1024 / 1024).toFixed(1)} MB`;
    const job = jobText[a.file] && a.job ? `${a.job} · ${jobText[a.file]}` : a.job;
    const badges = [a.transcript && pill(`transcribed · ${a.words} words`, 'mint'), a.refDir && pill('frames ready', 'mint'), job && pill(job, 'violet', true), a.jobError && pill(a.jobError.slice(0, 40), 'red')].filter(Boolean).join('');
    return `<div class="asset"><div class="pv">${pv}</div><div class="meta">
      <div class="spread" style="flex-wrap:nowrap"><div class="name" title="${esc(a.original)}">${esc(a.original)}</div>${a.role === 'reference' ? '' : `<button type="button" class="btn ghost icon sm" data-bf="rm-asset" data-file="${esc(a.file)}" aria-label="Remove ${esc(a.original)}">✕</button>`}</div>
      <div class="row" style="gap:8px"><select class="in" data-role="${esc(a.file)}" style="width:auto;height:34px;padding:0 10px">${ROLES.map((r) => `<option ${r === a.role ? 'selected' : ''}>${r}</option>`).join('')}</select><span class="small muted">${info}</span></div>
      ${badges ? `<div class="row" style="gap:6px">${badges}</div>` : ''}
      <input class="in" placeholder="note for the AI (optional)" value="${esc(a.note ?? '')}" data-anote="${esc(a.file)}" style="height:34px;font-size:12px" /></div></div>`;
  }).join('') || '<div class="small muted">No files yet.</div>';
};

// ---------- rail + actions ----------
const paintRail = () => {
  const el = $('#b-rail');
  if (!el || !S.cur) return;
  const p = proj(), b = brief(), items = readiness(), req = items.filter((i) => i[3] !== 'optional'), done = req.filter((i) => i[1]).length, pct = Math.round((done / req.length) * 100);
  const n = words(b.script), size = SIZES.find(([, w, h]) => w === b.width && h === b.height), brand = S.state.brands.find((x) => x.id === b.brandId);
  const st = (k, v) => `<div class="rs"><span>${k}</span><b>${v}</b></div>`;
  el.innerHTML = `<div class="card tight"><div class="spread"><h3>Readiness</h3><span class="small muted">${done} of ${req.length}</span></div><div class="bar" style="margin:10px 0"><i style="width:${Math.max(4, pct)}%"></i></div>
      <ul class="rlist2">${items.map(([l, ok, key, tag]) => `<li><button type="button" class="${ok ? 'ok' : ''}" data-bf="go" data-key="${key}"><span class="tick">${ok ? '✓' : ''}</span><span>${l}</span>${tag ? `<small>${tag}</small>` : ''}</button></li>`).join('')}</ul></div>
    <div class="card tight"><h3 style="margin-bottom:6px">At a glance</h3>${st('Spoken length', n ? `≈ ${fmtT(n / 2.5)}` : '–')}${st('Words', n || '–')}${st('Format', `${size ? `${size[0].split(' ')[0]} · ` : ''}${b.width}×${b.height}`)}${st('Frame rate', `${b.fps} fps`)}${st('Target length', b.durationSec ? `${b.durationSec} s` : 'auto')}${st('Output', outFmt(b).toUpperCase())}${st('Brand', esc(brand?.name ?? 'Custom'))}${st('Files', p.assets.length)}</div>`;
  paintSums();
  const act = $('#b-actions');
  if (act) {
    const busy = S.cur.busy;
    act.innerHTML = `<div class="tx"><b>Ready when you are</b><div class="small muted"><span id="b-state">Changes save automatically.</span></div></div>
      ${S.cur.concepts ? `<a class="btn" href="#/p/${p.id}/concepts">View concepts</a>` : ''}
      <a class="btn" href="#/p/${p.id}/look">Look &amp; feel</a>
      <button type="button" class="btn main" data-bf="gen" ${busy ? 'disabled' : ''}>${S.cur.concepts ? 'Regenerate concepts' : 'Generate concepts'} →</button>`;
  }
};

// ---------- page ----------
export const render = async (host, c) => {
  const p = c.project;
  host.innerHTML = `<div class="bgrid"><div class="stack" id="b-main">
      <section class="card" id="sec-basics"></section><section class="card stack" id="sec-story"></section><section class="card stack" id="sec-voice"></section>
      <section class="card stack" id="sec-format"></section><section class="card stack" id="sec-look"></section><section class="card stack" id="sec-media"></section><section class="card stack" id="sec-rules"></section></div>
    <aside class="rail" id="b-rail" aria-label="Brief summary"></aside></div><div class="barfix" id="b-actions"></div>`;
  for (const k of Object.keys(SECTIONS)) paint(k);
  document.querySelectorAll('#b-main > section').forEach((el) => { el.classList.add('fsec'); el.classList.toggle('open', isOpen(el.id.slice(4))); });
  $('#sec-story').innerHTML = storyHTML();
  paintVoice(); paintRail();
  initRules(paintRail);
  initStory((refill) => { paintRail(); if (refill) for (const k of ['basics', 'format', 'look']) paint(k); paintVoice(); });
  void p;
};
export const soft = () => { paintAssets(); paintRail(); };
export const live = (ev) => { if (ev?.type === 'job' && ev.file) { jobText[ev.file] = ev.text; paintAssets(); } };
export const leave = () => flushSave();

// ---------- events ----------
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (!S.cur || !t.closest?.('#b-main')) return;
  if (t.dataset.color != null) { const colors = [...brief().colors]; colors[Number(t.dataset.color)] = t.value; t.closest('.sw').style.background = t.value; setB('colors', colors); return; }
  if (t.dataset.p === 'title') { proj().title = t.value; queueSave({title: t.value}, setState); paintRail(); return; }
  if (t.dataset.b) setB(t.dataset.b, NUM.includes(t.dataset.b) ? (t.value === '' ? null : Number(t.value)) : t.value);
  if (t.dataset.anote != null) api(`/api/projects/${proj().id}/assets/${encodeURIComponent(t.dataset.anote)}`, {method: 'PATCH', body: {note: t.value}}).catch(() => {});
});
document.addEventListener('change', async (ev) => {
  const t = ev.target;
  if (!S.cur || !t.closest?.('#b-main')) return;
  if (t.dataset.p === 'presetId') { proj().presetId = t.value || null; queueSave({presetId: t.value || null}, setState); paint('basics'); return; }
  if (t.dataset.tm !== undefined) { try { S.state.settings = await api('/api/settings', {method: 'PUT', body: {transcribeMode: t.value}}); toast(`Transcription speed: ${t.value}.`); } catch (e) { toast(e.message); } return; }
  if (t.dataset.role) { try { await api(`/api/projects/${proj().id}/assets/${encodeURIComponent(t.dataset.role)}`, {method: 'PATCH', body: {role: t.value}}); paintRail(); } catch (e) { toast(e.message); } return; }
  if (t.id === 'b-file') { await upload([...t.files]); t.value = ''; }
});
document.addEventListener('focusout', (ev) => { if (S.cur && ev.target.closest?.('#b-main')) flushSave(setState); });

const upload = async (files) => {
  if (!files.length) return;
  const fd = new FormData(); for (const f of files) fd.append('files', f);
  toast(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}…`, 60000);
  try { await api(`/api/projects/${proj().id}/assets`, {method: 'POST', body: fd}); S.cur = await api(`/api/projects/${proj().id}?nolog=1`); paintAssets(); paintRail(); toast('Uploaded.'); } catch (e) { toast(e.message); }
};
document.addEventListener('dragover', (ev) => { if (ev.target.closest?.('#b-drop')) { ev.preventDefault(); $('#b-drop').classList.add('over'); } });
document.addEventListener('dragleave', (ev) => { if (ev.target.closest?.('#b-drop')) $('#b-drop').classList.remove('over'); });
document.addEventListener('drop', (ev) => { if (ev.target.closest?.('#b-drop')) { ev.preventDefault(); $('#b-drop').classList.remove('over'); upload([...ev.dataTransfer.files]); } });

document.addEventListener('click', async (ev) => {
  if (!S.cur || !$('#b-main')) return;
  const t = ev.target;
  const hd = t.closest('#b-main .fsec > :first-child');
  if (hd && !t.closest('button, a, input, select, textarea, label, summary')) { const sec = hd.parentElement; setOpen(sec.id.slice(4), !sec.classList.contains('open')); return; }
  if (t.closest('#b-drop')) { $('#b-file').click(); return; }
  const d = t.closest('[data-size],[data-fps],[data-dur],[data-out],[data-animw],[data-animfps],[data-caption],[data-mood]');
  if (d) {
    const q = d.dataset;
    if (q.size) { const [w, h] = q.size.split('x').map(Number); setB('width', w); setB('height', h); paint('format'); }
    else if (q.fps) { setB('fps', Number(q.fps)); paint('format'); }
    else if ('dur' in q) { setB('durationSec', q.dur === '' ? null : Number(q.dur)); paint('format'); }
    else if (q.out) { setB('outputFormat', q.out); paint('format'); }
    else if (q.animw) { setB('animWidth', Number(q.animw)); paint('format'); }
    else if (q.animfps) { setB('animFps', Number(q.animfps)); paint('format'); }
    else if ('caption' in q) { setB('captions', q.caption); paint('look'); }
    else if (q.mood) { const list = moodList(brief().style), i = list.findIndex((x) => x.toLowerCase() === q.mood.toLowerCase()); if (i >= 0) list.splice(i, 1); else list.push(q.mood); setB('style', list.join(', ')); paint('look'); }
    return;
  }
  const b = t.closest('[data-bf]');
  if (!b) return;
  const id = proj().id;
  try {
    switch (b.dataset.bf) {
      case 'go': setOpen(b.dataset.key, true); $(`#sec-${b.dataset.key}`)?.scrollIntoView({behavior: 'smooth', block: 'start'}); break;
      case 'add-color': setB('colors', [...(brief().colors ?? []), '#1582D5']); paint('look'); break;
      case 'rm-color': setB('colors', brief().colors.filter((_, i) => i !== Number(b.dataset.i))); paint('look'); break;
      case 'brand-palette': { const br = S.state.brands.find((x) => x.id === brief().brandId); if (!br) return toast('Pick a brand kit first.'); setB('colors', Object.values(br.palette).slice(0, 6)); paint('look'); break; }
      case 'rm-asset': await api(`/api/projects/${id}/assets/${encodeURIComponent(b.dataset.file)}`, {method: 'DELETE'}); S.cur = await api(`/api/projects/${id}?nolog=1`); paintAssets(); paintRail(); break;
      case 'gen':
        if (storyRunning()) return toast('Wait for the story helper to finish first.');
        await flushSave(setState);
        await api(`/api/projects/${id}/concepts`, {method: 'POST', body: {}});
        location.hash = `#/p/${encodeURIComponent(id)}/concepts`; break;
    }
  } catch (e) { toast(e.message); }
});
