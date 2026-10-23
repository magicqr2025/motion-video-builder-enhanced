// Video tools page: upload a video -> its spoken script (if it has audio) and/or an MP3 of the soundtrack.
import {note} from './activity.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const LANGS = [['auto', 'Auto-detect'], ['en', 'English'], ['hi', 'Hindi'], ['gu', 'Gujarati'], ['mr', 'Marathi'], ['bn', 'Bengali'], ['ta', 'Tamil'], ['te', 'Telugu'], ['ur', 'Urdu'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['pt', 'Portuguese'], ['ar', 'Arabic']];
const BITRATES = [[96, '96 kbps (small)'], [128, '128 kbps'], [192, '192 kbps (good)'], [256, '256 kbps'], [320, '320 kbps (best)']];
const clockT = (s) => { s = Math.max(0, Number(s) || 0); const m = Math.floor(s / 60); return `${m}:${(s - m * 60).toFixed(0).padStart(2, '0')}`; };
const mb = (b) => `${(b / 1048576).toFixed(b > 10485760 ? 0 : 1)} MB`;
const stem = (n) => String(n).replace(/\.[^.]+$/, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'video';
const getLS = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const setLS = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

const T = {jobs: [], stamps: new Set(), api: null, toast: () => {}, timer: null};
export const initTools = ({api, toast}) => { T.api = api; T.toast = toast; };
const url = (j, f) => `/data/_tools/${encodeURIComponent(j.id)}/${f}`;
const sel = (attr, opts, cur) => `<select ${attr}>${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;

// ---------- "what is this using" strip: AI tag, credits, elapsed / estimated time ----------
const dur = (ms) => { const t = Math.max(0, Math.round(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`; };
const timeText = (st) => {
  if (!st?.startedAt) return st?.status === 'queued' ? 'Waiting in line…' : '';
  if (st.status === 'done') return st.finishedAt ? `Took ${dur(st.finishedAt - st.startedAt)}` : '';
  if (st.status !== 'running') return '';
  const el = Date.now() - st.startedAt, p = Number(st.progress) || 0;
  if (p < 0.03) return `Elapsed ${dur(el)} · estimating…`;
  const total = el / p;
  return `Elapsed ${dur(el)} · est. total ${dur(total)} · ~${dur(Math.max(0, total - el))} left`;
};
const usageStrip = (kind, j, st) => {
  const t = timeText(st);
  return `<div class="tj-meta"><span class="pill green" title="This step runs on your PC (${kind === 'script' ? 'whisper.cpp speech engine' : 'ffmpeg'}). It does not call any AI service.">Local · no AI used</span><span class="pill" title="No AI model is involved, so nothing is charged.">0 credits</span>${t || ['running', 'queued'].includes(st?.status) ? `<span class="pill blue" data-tj-time="${kind}" data-job="${esc(j.id)}">${esc(t)}</span>` : ''}</div>`;
};
const tickTimes = () => {
  document.querySelectorAll('[data-tj-time]').forEach((el) => {
    const j = T.jobs.find((x) => x.id === el.dataset.job);
    const st = j && (el.dataset.tjTime === 'script' ? j.script : j.mp3);
    if (st) el.textContent = timeText(st);
  });
};

// ---------- one video's two panels (script, MP3) ----------
const scriptBox = (j) => {
  const s = j.script ?? {};
  let body;
  if (s.status === 'none') body = `<div class="tj-note warn">${esc(s.message)}</div>`;
  else if (s.status === 'queued' || s.status === 'running') body = `<div class="tj-run"><div class="bar"><i data-tj-bar="script" style="width:${Math.max(4, Math.round((s.progress ?? 0) * 100))}%"></i></div><div class="tj-note" data-tj-msg="script">${esc(s.message || 'Waiting…')}</div><div class="small muted">The first video after a fresh install downloads the speech model once. Longer videos take longer. Watch the Activity panel below for each step.</div></div>`;
  else if (s.status === 'error') body = `<div class="tj-note err">${esc(s.message)}</div>`;
  else if (!j.text.trim()) body = `<div class="tj-note warn">${esc(s.message || 'No speech was detected.')}</div>`;
  else {
    const stamps = T.stamps.has(j.id);
    body = `<div class="spread small muted"><span>${s.words} words · language: ${esc(s.detected || s.language)}</span>
        <span class="row" style="gap:6px"><button class="btn sm" data-tj="copy" data-job="${j.id}">Copy script</button>
        <a class="btn sm" href="${url(j, 'script.txt')}" download="${esc(stem(j.name))}-script.txt">Download .txt</a>
        <a class="btn sm" href="${url(j, 'subtitles.srt')}" download="${esc(stem(j.name))}.srt" title="Subtitle file with timings">Download .srt</a>
        <button class="btn sm ${stamps ? 'primary' : ''}" data-tj="stamps" data-job="${j.id}">${stamps ? 'Plain text' : 'Show timestamps'}</button></span></div>
      ${stamps ? `<div class="tj-stamps" style="margin-top:10px">${j.sentences.map((x) => `<div><time>${clockT(x.start)}</time><span>${esc(x.text)}</span></div>`).join('')}</div>` : `<textarea class="tj-script" readonly style="margin-top:10px">${esc(j.text.trim())}</textarea>`}`;
  }
  const again = j.info.hasAudio && !['queued', 'running'].includes(s.status)
    ? `<div class="tj-actions">${sel('data-tj-lang', LANGS, s.language ?? 'auto')}<button class="btn sm" data-tj="script" data-job="${j.id}">${s.status === 'done' ? 'Get script again' : 'Get script'}</button><span class="small muted">Pick the spoken language if the script comes out wrong.</span></div>` : '';
  return `<div class="tj-box"><div class="spread"><h4>Script</h4>${usageStrip('script', j, s)}</div>${body}${again}</div>`;
};

const mp3Box = (j) => {
  const m = j.mp3 ?? {};
  let body;
  if (m.status === 'none') body = `<div class="tj-note warn">${esc(m.message)}</div>`;
  else if (m.status === 'running') body = `<div class="tj-run"><div class="bar"><i data-tj-bar="mp3" style="width:${Math.max(4, Math.round((m.progress ?? 0) * 100))}%"></i></div><div class="tj-note" data-tj-msg="mp3">Converting to MP3 at ${m.bitrate} kbps… ${Math.round((m.progress ?? 0) * 100)}%</div></div>`;
  else {
    const done = m.status === 'done';
    body = `${m.status === 'error' ? `<div class="tj-note err" style="margin-bottom:10px">${esc(m.message)}</div>` : ''}
      ${done ? `<audio controls preload="metadata" src="${url(j, 'audio.mp3')}?v=${m.finishedAt}" style="width:100%"></audio>
        <div class="small muted" style="margin-top:6px">${mb(m.size)} · ${m.bitrate} kbps</div>` : '<div class="tj-note">Turn the soundtrack of this video into an MP3 file you can download.</div>'}
      <div class="tj-actions">${sel('data-tj-bitrate', BITRATES, m.bitrate ?? 192)}<button class="btn ${done ? '' : 'primary'} sm" data-tj="mp3" data-job="${j.id}">${done ? 'Convert again' : 'Convert to MP3'}</button>
        ${done ? `<a class="btn primary sm" href="${url(j, 'audio.mp3')}?v=${m.finishedAt}" download="${esc(stem(j.name))}.mp3">Download MP3</a>` : ''}</div>`;
  }
  return `<div class="tj-box"><div class="spread"><h4>MP3 audio</h4>${usageStrip('mp3', j, m)}</div>${body}</div>`;
};

const panels = (j) => scriptBox(j) + mp3Box(j);
const sig = (j) => JSON.stringify([j.script?.status, j.script?.language, j.script?.words, j.script?.detected, j.script?.status === 'running' || j.script?.status === 'queued' ? '' : j.script?.message, j.text.length, j.mp3?.status, j.mp3?.bitrate, j.mp3?.size, j.mp3?.status === 'running' ? '' : j.mp3?.message, T.stamps.has(j.id)]);

const setFolded = (card, folded) => { card.classList.toggle('collapsed', folded); card.querySelector('.tj-fold')?.setAttribute('aria-expanded', String(!folded)); };
const cardEl = (j) => {
  const i = j.info;
  const media = i.hasVideo ? `<video controls preload="metadata" src="${url(j, j.file)}"></video>` : `<audio controls preload="metadata" src="${url(j, j.file)}"></audio>`;
  const el = document.createElement('div');
  el.innerHTML = `<section class="card tj" data-job="${esc(j.id)}">
    <div class="tj-head"><button type="button" class="tj-fold" data-tj="fold" data-job="${esc(j.id)}" aria-label="Collapse or expand this video" title="Collapse / expand" aria-expanded="true"><i aria-hidden="true">▾</i></button><div class="tj-title"><h3>${esc(j.name)}</h3><div class="row" style="margin-top:6px">
        <span class="pill">${clockT(i.duration)} long</span>${i.width ? `<span class="pill">${i.width}×${i.height}</span>` : ''}<span class="pill">${mb(j.size)}</span>
        <span class="pill ${i.hasAudio ? 'green' : 'gold'}">${i.hasAudio ? 'has audio' : 'no audio'}</span><span class="pill blue" data-tj-time="script" data-job="${esc(j.id)}"></span></div></div>
      <button class="btn ghost sm danger" data-tj="delete" data-job="${esc(j.id)}">Remove</button></div>
    <div class="tj-body"><div class="tj-media">${media}</div><div class="tj-panels">${panels(j)}</div></div></section>`;
  const c = el.firstElementChild;
  c.dataset.sig = sig(j);
  setFolded(c, getLS(`studio-tj-fold-${j.id}`) === '1');
  return c;
};

const updateCard = (el, j, force = false) => {
  const s = sig(j);
  if (force || el.dataset.sig !== s) { el.dataset.sig = s; $('.tj-panels', el).innerHTML = panels(j); return; }
  // same state, only progress moved: touch the bars, leave everything else (focus, selection, playback) alone
  for (const [k, p, text] of [['script', j.script?.progress, j.script?.message], ['mp3', j.mp3?.progress, j.mp3?.status === 'running' ? `Converting to MP3 at ${j.mp3.bitrate} kbps… ${Math.round((j.mp3.progress ?? 0) * 100)}%` : null]]) {
    const bar = $(`[data-tj-bar="${k}"]`, el), msg = $(`[data-tj-msg="${k}"]`, el);
    if (bar && p != null) bar.style.width = `${Math.max(4, Math.round(p * 100))}%`;
    if (msg && text) msg.textContent = text;
  }
};

const reconcile = () => {
  const list = $('#tj-list');
  if (!list) return;
  const ids = new Set(T.jobs.map((j) => j.id));
  list.querySelectorAll('[data-job].tj').forEach((el) => { if (!ids.has(el.dataset.job)) el.remove(); });
  T.jobs.forEach((j, i) => {
    let el = list.querySelector(`.tj[data-job="${CSS.escape(j.id)}"]`);
    if (!el) { el = cardEl(j); list.insertBefore(el, list.children[i] ?? null); } else updateCard(el, j);
  });
  $('#tj-empty').hidden = T.jobs.length > 0;
  if (!T.timer) T.timer = setInterval(tickTimes, 1000);
  tickTimes();
};

const fetchJobs = async () => { T.jobs = await T.api('/api/tools/jobs'); reconcile(); };
let debounce = null;
export const toolsChanged = () => { clearTimeout(debounce); debounce = setTimeout(() => fetchJobs().catch(() => {}), 150); };

// ---------- page ----------
export const renderTools = async () => {
  $('#main').innerHTML = `
    <div class="hero" style="padding:28px 32px"><h1 style="font-size:26px">Video tools</h1>
      <p>Drop in a video. If it has speech you get the written script (with timestamps and a subtitle file). You can also turn its soundtrack into an MP3. Everything runs on this PC.</p></div>
    <div class="card stack" style="margin-top:18px">
      <div class="drop" id="tools-drop" data-tj="pick"><b>Drop a video here</b> or click to choose
        <div class="small muted" style="margin-top:4px">MP4, MOV, WebM, MKV… (an audio file works too)</div></div>
      <input type="file" id="tools-file" accept="video/*,audio/*" multiple hidden />
      <div class="row"><label class="f" style="min-width:220px"><span>Spoken language</span>${sel('id="tools-lang"', LANGS, getLS('studio-tools-lang') || 'auto')}</label>
        <span class="small muted" style="max-width:520px">Auto-detect works for most videos. Choose the language yourself if the script comes out wrong or mixed up.</span></div>
      <div class="tj-up" id="tools-up" hidden><div class="spread small"><b id="tools-up-text"></b><span id="tools-up-pct"></span></div><div class="bar" style="margin-top:6px"><i id="tools-up-bar" style="width:0"></i></div></div>
    </div>
    <div id="tj-list"></div>
    <div class="card waiting" id="tj-empty" style="margin-top:18px" hidden><h2>No videos yet</h2><p>Upload one above. Scripts appear here as soon as they are ready.</p></div>`;
  try { await fetchJobs(); } catch (e) { T.toast(e.message); }
};

// ---------- upload (XHR so the bar can move) ----------
const send = (file, lang, onProg) => new Promise((ok, fail) => {
  const fd = new FormData(); fd.append('language', lang); fd.append('file', file);
  const x = new XMLHttpRequest();
  x.open('POST', '/api/tools/jobs');
  x.upload.onprogress = (e) => e.lengthComputable && onProg(e.loaded / e.total);
  x.onload = () => { let j = {}; try { j = JSON.parse(x.responseText); } catch {} x.status < 400 ? ok(j) : fail(new Error(j.error || x.statusText)); };
  x.onerror = () => fail(new Error('Upload failed: could not reach the studio server.'));
  x.send(fd);
});
let uploading = false;
const upload = async (files) => {
  files = [...files];
  if (!files.length || uploading) return;
  uploading = true;
  const lang = $('#tools-lang')?.value || 'auto';
  try {
    for (const [i, f] of files.entries()) {
      const label = `${files.length > 1 ? `(${i + 1}/${files.length}) ` : ''}${f.name}`;
      const box = $('#tools-up'); if (box) box.hidden = false;
      const set = (text, p) => { $('#tools-up-text') && ($('#tools-up-text').textContent = text); $('#tools-up-pct') && ($('#tools-up-pct').textContent = p == null ? '' : `${Math.round(p * 100)}%`); $('#tools-up-bar') && ($('#tools-up-bar').style.width = `${Math.round((p ?? 1) * 100)}%`); };
      set(`Uploading ${label}…`, 0);
      note(`Uploading ${f.name} (${mb(f.size)})…`, {source: 'media'});
      try {
        await send(f, lang, (p) => set(p >= 1 ? `Reading ${label}…` : `Uploading ${label}…`, p));
        await fetchJobs();
      } catch (e) { T.toast(e.message); note(`Upload failed for ${f.name}: ${e.message}`, {level: 'error', source: 'media'}); }
    }
  } finally {
    uploading = false;
    const box = $('#tools-up'); if (box) box.hidden = true;
  }
};

// ---------- clicks ----------
const jobOf = (id) => T.jobs.find((j) => j.id === id);
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-tj]');
  if (!b) return;
  const j = b.dataset.job ? jobOf(b.dataset.job) : null, card = b.closest('.tj');
  try {
    switch (b.dataset.tj) {
      case 'pick': $('#tools-file').click(); break;
      case 'fold': { const off = !card.classList.contains('collapsed'); setFolded(card, off); if (off) card.querySelectorAll('video,audio').forEach((m) => m.pause()); setLS(`studio-tj-fold-${j.id}`, off ? '1' : '0'); break; }
      case 'copy': await navigator.clipboard.writeText(j.text.trim()); T.toast('Script copied.'); break;
      case 'stamps': T.stamps.has(j.id) ? T.stamps.delete(j.id) : T.stamps.add(j.id); updateCard(card, j, true); break;
      case 'script': await T.api(`/api/tools/jobs/${j.id}/script`, {method: 'POST', body: {language: $('[data-tj-lang]', card).value}}); await fetchJobs(); break;
      case 'mp3': await T.api(`/api/tools/jobs/${j.id}/mp3`, {method: 'POST', body: {bitrate: Number($('[data-tj-bitrate]', card).value)}}); await fetchJobs(); break;
      case 'delete':
        if (confirm(`Remove “${j.name}” and its script and MP3 from the studio?`)) { await T.api(`/api/tools/jobs/${j.id}`, {method: 'DELETE'}); await fetchJobs(); }
        break;
    }
  } catch (e) { T.toast(e.message); }
});
document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (t.id === 'tools-file') { upload(t.files); t.value = ''; }
  else if (t.id === 'tools-lang') setLS('studio-tools-lang', t.value);
});
document.addEventListener('dragover', (e) => { const d = e.target.closest?.('#tools-drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
document.addEventListener('dragleave', (e) => e.target.closest?.('#tools-drop')?.classList.remove('over'));
document.addEventListener('drop', (e) => { const d = e.target.closest?.('#tools-drop'); if (!d) return; e.preventDefault(); d.classList.remove('over'); upload(e.dataTransfer.files); });
