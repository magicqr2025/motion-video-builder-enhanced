// Video tools: upload a video, get its spoken script (with timestamps and subtitles) and/or an MP3 of the soundtrack. Everything runs on this PC.
import {$, api, esc, toast, pill} from './core.js';

const LANGS = [['auto', 'Auto-detect'], ['en', 'English'], ['hi', 'Hindi'], ['gu', 'Gujarati'], ['mr', 'Marathi'], ['bn', 'Bengali'], ['ta', 'Tamil'], ['te', 'Telugu'], ['ur', 'Urdu'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['pt', 'Portuguese']];
const BITRATES = [[96, '96 kbps (small)'], [128, '128 kbps'], [192, '192 kbps (good)'], [256, '256 kbps'], [320, '320 kbps (best)']];
const T = {jobs: [], stamps: new Set(), up: null, uploading: false};
const clockT = (s) => { s = Math.max(0, Number(s) || 0); const m = Math.floor(s / 60); return `${m}:${(s - m * 60).toFixed(0).padStart(2, '0')}`; };
const mb = (b) => `${(b / 1048576).toFixed(b > 10485760 ? 0 : 1)} MB`;
const stem = (n) => String(n).replace(/\.[^.]+$/, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'video';
const url = (j, f) => `/data/_tools/${encodeURIComponent(j.id)}/${f}`;
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { /* ignore */ } return null; };
const sel = (attr, opts, cur) => `<select class="in" style="width:auto;height:36px;padding:0 12px" ${attr}>${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const dur = (ms) => { const t = Math.max(0, Math.round(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; };
const timeText = (st) => {
  if (!st?.startedAt) return st?.status === 'queued' ? 'Waiting in line…' : '';
  if (st.status === 'done') return st.finishedAt ? `Took ${dur(st.finishedAt - st.startedAt)}` : '';
  if (st.status !== 'running') return '';
  const el = Date.now() - st.startedAt, p = Number(st.progress) || 0;
  return p < 0.03 ? `Elapsed ${dur(el)} · estimating…` : `Elapsed ${dur(el)} · ~${dur(Math.max(0, el / p - el))} left`;
};

const scriptBox = (j) => {
  const s = j.script ?? {};
  let body;
  if (s.status === 'none') body = `<div class="note">${esc(s.message)}</div>`;
  else if (s.status === 'queued' || s.status === 'running') body = `<div class="bar"><i style="width:${Math.max(4, Math.round((s.progress ?? 0) * 100))}%"><span class="sheen"></span></i></div><div class="small muted">${esc(s.message ?? '')}</div>`;
  else if (s.status === 'error') body = `<div class="err">${esc(s.message)}</div>`;
  else if (!j.text.trim()) body = `<div class="note">${esc(s.message || 'No speech was detected.')}</div>`;
  else { const st = T.stamps.has(j.id);
    body = `<div class="spread small muted"><span>${s.words} words · language: ${esc(s.detected || s.language)}</span><span class="row" style="gap:6px"><button type="button" class="btn sm" data-tj="copy" data-job="${j.id}">Copy script</button><a class="btn sm" href="${url(j, 'script.txt')}" download="${esc(stem(j.name))}-script.txt">.txt</a><a class="btn sm" href="${url(j, 'subtitles.srt')}" download="${esc(stem(j.name))}.srt">.srt</a><button type="button" class="btn sm ${st ? 'main' : ''}" data-tj="stamps" data-job="${j.id}">${st ? 'Plain text' : 'Timestamps'}</button></span></div>
      ${st ? `<div class="stamps">${j.sentences.map((x) => `<div><time>${clockT(x.start)}</time><span>${esc(x.text)}</span></div>`).join('')}</div>` : `<textarea class="in" rows="8" readonly>${esc(j.text.trim())}</textarea>`}`; }
  const again = j.info.hasAudio && !['queued', 'running'].includes(s.status) ? `<div class="row">${sel('data-tj-lang', LANGS, s.language ?? 'auto')}<button type="button" class="btn sm" data-tj="script" data-job="${j.id}">${s.status === 'done' ? 'Get script again' : 'Get script'}</button></div>` : '';
  return `<div class="res"><div class="spread"><h3>Script</h3><span class="row" style="gap:6px">${pill('Local · no AI used', 'mint')}<span class="small muted" data-tj-time="script" data-job="${j.id}">${esc(timeText(s))}</span></span></div>${body}${again}</div>`;
};
const mp3Box = (j) => {
  const m = j.mp3 ?? {};
  let body;
  if (m.status === 'none') body = `<div class="note">${esc(m.message)}</div>`;
  else if (m.status === 'running') body = `<div class="bar"><i style="width:${Math.max(4, Math.round((m.progress ?? 0) * 100))}%"><span class="sheen"></span></i></div><div class="small muted">Converting to MP3 at ${m.bitrate} kbps… ${Math.round((m.progress ?? 0) * 100)}%</div>`;
  else { const done = m.status === 'done';
    body = `${m.status === 'error' ? `<div class="err">${esc(m.message)}</div>` : ''}${done ? `<audio controls preload="metadata" src="${url(j, 'audio.mp3')}?v=${m.finishedAt}" style="width:100%"></audio><div class="small muted">${mb(m.size)} · ${m.bitrate} kbps</div>` : '<div class="small muted">Turn the soundtrack of this video into an MP3 file you can download.</div>'}
      <div class="row">${sel('data-tj-bitrate', BITRATES, m.bitrate ?? 192)}<button type="button" class="btn sm ${done ? '' : 'main'}" data-tj="mp3" data-job="${j.id}">${done ? 'Convert again' : 'Convert to MP3'}</button>${done ? `<a class="btn sm main" href="${url(j, 'audio.mp3')}?v=${m.finishedAt}" download="${esc(stem(j.name))}.mp3">Download MP3</a>` : ''}</div>`; }
  return `<div class="res"><div class="spread"><h3>MP3 audio</h3>${pill('Local · no AI used', 'mint')}</div>${body}</div>`;
};
const card = (j) => { const i = j.info;
  return `<section class="card" data-job="${esc(j.id)}"><div class="spread"><div><h3>${esc(j.name)}</h3><div class="row" style="gap:6px;margin-top:6px">${pill(`${clockT(i.duration)} long`)}${i.width ? pill(`${i.width}×${i.height}`) : ''}${pill(mb(j.size))}${pill(i.hasAudio ? 'has audio' : 'no audio', i.hasAudio ? 'mint' : 'amber')}</div></div><button type="button" class="btn sm ghost danger" data-tj="delete" data-job="${esc(j.id)}">Remove</button></div>
    <div class="tjgrid"><div>${i.hasVideo ? `<video controls preload="metadata" src="${url(j, j.file)}" style="width:100%;border-radius:16px;background:#000;max-height:360px"></video>` : `<audio controls preload="metadata" src="${url(j, j.file)}" style="width:100%"></audio>`}</div><div class="stack">${scriptBox(j)}${mp3Box(j)}</div></div></section>`; };

const paintJobs = () => { const el = $('#tj-list'); if (el) el.innerHTML = T.jobs.length ? T.jobs.map(card).join('') : '<div class="card empty"><h2>No videos yet</h2><p>Upload one above. Scripts appear here as soon as they are ready.</p></div>'; };
const fetchJobs = async () => { T.jobs = await api('/api/tools/jobs'); const typing = document.activeElement?.closest?.('#tj-list'); if (!typing) paintJobs(); };

export const render = async (host) => {
  host.innerHTML = `<div class="stack"><div class="card"><h1>Video tools</h1><p class="muted" style="margin:6px 0 0;max-width:640px">Drop in a video. If it has speech you get the written script (with timestamps and a subtitle file). You can also turn its soundtrack into an MP3. Everything runs on this PC.</p></div>
    <div class="card stack"><div class="drop" id="tools-drop" tabindex="0" role="button" data-tj="pick"><b>Drop a video here</b> or click to choose<div class="small muted">MP4, MOV, WebM, MKV… (an audio file works too)</div></div><input type="file" id="tools-file" accept="video/*,audio/*" multiple hidden />
      <div class="row"><label class="f"><span>Spoken language</span>${sel('id="tools-lang"', LANGS, ls('studio-tools-lang') || 'auto')}</label><span class="small muted" style="max-width:520px">Auto-detect works for most videos. Choose the language yourself if the script comes out wrong or mixed up.</span></div>
      <div id="tools-up" hidden><div class="spread small"><b id="tools-up-text"></b><span id="tools-up-pct"></span></div><div class="bar" style="margin-top:6px"><i id="tools-up-bar" style="width:0"></i></div></div></div>
    <div class="stack" id="tj-list"></div></div>`;
  try { await fetchJobs(); } catch (e) { toast(e.message); }
  clearInterval(T.timer); T.timer = setInterval(() => { if (!$('#tj-list')) return clearInterval(T.timer); document.querySelectorAll('[data-tj-time]').forEach((el) => { const j = T.jobs.find((x) => x.id === el.dataset.job); if (j) el.textContent = timeText(el.dataset.tjTime === 'script' ? j.script : j.mp3); }); }, 1000);
};
export const leave = () => clearInterval(T.timer);
export const onEvent = (e) => { if (e.type === 'tools') { clearTimeout(T.dt); T.dt = setTimeout(() => fetchJobs().catch(() => {}), 150); } };

const send = (file, lang, onProg) => new Promise((ok, fail) => {
  const fd = new FormData(); fd.append('language', lang); fd.append('file', file);
  const x = new XMLHttpRequest(); x.open('POST', '/api/tools/jobs'); x.upload.onprogress = (e) => e.lengthComputable && onProg(e.loaded / e.total);
  x.onload = () => { let j = {}; try { j = JSON.parse(x.responseText); } catch { /* ignore */ } x.status < 400 ? ok(j) : fail(new Error(j.error || x.statusText)); };
  x.onerror = () => fail(new Error('Upload failed: could not reach the studio server.')); x.send(fd);
});
const upload = async (files) => {
  files = [...files]; if (!files.length || T.uploading) return; T.uploading = true;
  const lang = $('#tools-lang')?.value || 'auto';
  try {
    for (const [i, f] of files.entries()) {
      const label = `${files.length > 1 ? `(${i + 1}/${files.length}) ` : ''}${f.name}`, box = $('#tools-up'); if (box) box.hidden = false;
      const set = (t, p) => { if ($('#tools-up-text')) $('#tools-up-text').textContent = t; if ($('#tools-up-pct')) $('#tools-up-pct').textContent = p == null ? '' : `${Math.round(p * 100)}%`; if ($('#tools-up-bar')) $('#tools-up-bar').style.width = `${Math.max(2, Math.round((p ?? 0) * 100))}%`; };
      set(`Uploading ${label}…`, 0);
      try { await send(f, lang, (p) => set(p >= 1 ? `Reading ${label}…` : `Uploading ${label}…`, p)); await fetchJobs(); } catch (e) { toast(e.message); }
    }
  } finally { T.uploading = false; const box = $('#tools-up'); if (box) box.hidden = true; }
};
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-tj]');
  if (!b || !$('#tj-list')) return;
  const j = b.dataset.job ? T.jobs.find((x) => x.id === b.dataset.job) : null, card = b.closest('[data-job]');
  try {
    switch (b.dataset.tj) {
      case 'pick': $('#tools-file').click(); break;
      case 'copy': await navigator.clipboard.writeText(j.text.trim()); toast('Script copied.'); break;
      case 'stamps': T.stamps.has(j.id) ? T.stamps.delete(j.id) : T.stamps.add(j.id); paintJobs(); break;
      case 'script': await api(`/api/tools/jobs/${j.id}/script`, {method: 'POST', body: {language: $('[data-tj-lang]', card).value}}); await fetchJobs(); break;
      case 'mp3': await api(`/api/tools/jobs/${j.id}/mp3`, {method: 'POST', body: {bitrate: Number($('[data-tj-bitrate]', card).value)}}); await fetchJobs(); break;
      case 'delete': if (confirm(`Remove “${j.name}” and its script and MP3 from the studio?`)) { await api(`/api/tools/jobs/${j.id}`, {method: 'DELETE'}); await fetchJobs(); } break;
    }
  } catch (e) { toast(e.message); }
});
document.addEventListener('change', (ev) => { const t = ev.target; if (t.id === 'tools-file') { upload(t.files); t.value = ''; } else if (t.id === 'tools-lang') ls('studio-tools-lang', t.value); });
document.addEventListener('dragover', (e) => { const d = e.target.closest?.('#tools-drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
document.addEventListener('dragleave', (e) => e.target.closest?.('#tools-drop')?.classList.remove('over'));
document.addEventListener('drop', (e) => { const d = e.target.closest?.('#tools-drop'); if (!d) return; e.preventDefault(); d.classList.remove('over'); upload(e.dataTransfer.files); });
