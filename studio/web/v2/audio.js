// Audio: swap the voiceover or music, set volume, fades, ducking, trims and start times (audio.json). Saved with one button.
import {$, S, api, esc, toast, fmtT, notEditable, previewBox, queueSave, words} from './core.js';
import {paintVoice} from './voice.js';
import './voicelib.js'; // the "from library" buttons are handled there

const A = {dirty: false, lib: null, voChanged: null};
const audioUrl = (src) => `/public/${String(src).split('/').map(encodeURIComponent).join('/')}`;
const SLOTS = {voiceover: ['Voiceover', 'The spoken track. The scene timing is built around it.'], music: ['Background music', 'Plays under the voiceover. Loops to fill the video and lowers while the voice speaks.']};

const srcSelect = (slot, cur, p) => {
  const mine = p.assets.filter((a) => a.kind === 'audio' || a.kind === 'video').map((a) => [`studio/${p.id}/${a.file}`, a.original]), lib = (A.lib ?? []).map((f) => [f.src, f.src]);
  const known = new Set([...mine, ...lib].map(([v]) => v)), opt = ([v, l]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`;
  return `<select class="in" data-a="${slot}.src"><option value="">${slot === 'music' ? 'No music' : 'No voiceover'}</option>${cur && !known.has(cur) ? opt([cur, String(cur).split('/').pop()]) : ''}
    ${mine.length ? `<optgroup label="Uploaded to this video">${mine.map(opt).join('')}</optgroup>` : ''}${lib.length ? `<optgroup label="Library (public folder)">${lib.map(opt).join('')}</optgroup>` : ''}</select>`;
};
const num = (name, v, ph = '') => `<input class="in" type="number" data-a="${name}" min="0" step="0.1" value="${v ?? ''}" placeholder="${esc(ph)}" />`;
const range = (name, label, v) => `<label class="f"><span>${label} <b data-out="${name}">${Math.round(v * 100)}%</b></span><input type="range" class="rng" min="0" max="100" step="1" data-a="${name}" value="${Math.round(v * 100)}" /></label>`;
const chk = (name, label, on) => `<label class="chk"><input type="checkbox" data-a="${name}" ${on ? 'checked' : ''} /> ${label}</label>`;

const card = (slot, t, p) => {
  const [title, sub] = SLOTS[slot], music = slot === 'music';
  return `<div class="card"><div class="spread"><div><h3>${title}</h3><div class="small muted">${sub}</div></div>${chk(`${slot}.muted`, 'Mute', t.muted)}</div>
    <div class="stack" style="margin-top:14px"><label class="f"><span>Sound file</span>${srcSelect(slot, t.src, p)}</label>
      <div class="row"><button type="button" class="btn sm" data-act="a-upload" data-slot="${slot}">Upload new…</button><input type="file" accept="audio/*,video/*" hidden data-audio-file="${slot}" />
        ${t.src ? `<audio src="${audioUrl(t.src)}" controls preload="none" style="height:36px;max-width:300px"></audio><span class="small muted">${t.durationSec ? `${fmtT(t.durationSec)} long` : ''}</span>` : ''}</div>
      ${range(`${slot}.volume`, 'Volume', t.volume)}
      <div class="g3"><label class="f"><span>Starts at (s)</span>${num(`${slot}.startSec`, t.startSec)}<small class="dim">on the video timeline</small></label><label class="f"><span>Play from (s)</span>${num(`${slot}.trimStartSec`, t.trimStartSec)}<small class="dim">skip the start of the file</small></label><label class="f"><span>Play until (s)</span>${num(`${slot}.trimEndSec`, t.trimEndSec, 'to the end')}<small class="dim">cut the end of the file</small></label></div>
      ${music ? `<div class="g2"><label class="f"><span>Fade in (s)</span>${num('music.fadeInSec', t.fadeInSec)}</label><label class="f"><span>Fade out (s)</span>${num('music.fadeOutSec', t.fadeOutSec)}</label></div>
        <div class="row" style="gap:22px">${chk('music.loop', 'Loop to fill the video', t.loop)}${chk('music.duck', 'Lower under the voiceover', t.duck)}</div>${range('music.duckLevel', 'Music level while the voice speaks', t.duckLevel)}` : ''}</div></div>`;
};

const generator = (c) => `<section class="card stack" id="sec-script"><div class="spread"><div><h3>Script for the voiceover</h3><div class="small muted">The same script as on the Brief page. Add audio tags from the palette below, then generate.</div></div><div class="row" style="gap:8px"><button type="button" class="btn sm" data-vl="pick-script">Script from library</button><button type="button" class="btn sm" data-vl="pick-audio">Voiceover from library</button></div></div>
  <label class="f"><textarea class="in" data-voice-script rows="7" placeholder="Write or paste the voiceover script…">${esc(c.project.brief.script ?? '')}</textarea></label><div class="small muted" data-vo-count>${words(c.project.brief.script)} words</div></section>
  <section class="card stack" id="sec-voice"></section>`;
const mount = () => { paintVoice(); };
const html = (c) => `${A.voChanged === c.project.id ? `<div class="card accent d1"><div class="spread"><div><b>You changed the voiceover.</b><div class="small muted">The scenes were timed to the old one. Claude can re-time them to the new voiceover (the look stays the same).</div></div><button type="button" class="btn main" data-act="a-resync" ${c.busy ? 'disabled' : ''}>Re-sync the timing</button></div></div>` : ''}
  <div class="split"><div class="stack">${generator(c)}<form id="a-form" class="stack" autocomplete="off" onsubmit="return false">${card('voiceover', c.audio.voiceover, c.project)}${card('music', c.audio.music, c.project)}</form></div>
  <div class="side">${previewBox(c)}<div class="small muted" style="margin-top:8px">Save, then press play in the preview to hear the mix. The same settings go into the next render.</div></div></div>
  <div class="barfix"><div class="tx"><b id="a-state">Change anything, then save.</b><div class="small muted">A new voiceover does not move the scenes by itself.</div></div><button type="button" class="btn main" data-act="a-save" id="a-save" disabled>Save audio</button></div>`;

export const render = async (host, c) => {
  A.dirty = false;
  if (!c.audio) { host.innerHTML = `<div class="stack">${generator(c)}${notEditable("Audio isn't editable yet for this video", 'Turn on the audio controls to swap the voiceover or music, set volumes and fades, lower the music under the voice, and trim or move either track. Look and timing stay the same. A video that plays its own sound needs one quick Claude pass first.', 'Make audio editable', 'make-audio', c.busy)}</div>`; mount(); return; }
  host.innerHTML = html(c); mount();
  if (!A.lib) { A.lib = []; api('/api/audio-library').then((l) => { A.lib = l; if ($('#a-form') && !A.dirty && S.cur?.audio) { $('#tab').innerHTML = html(S.cur); mount(); } }).catch(() => {}); }
};
export const soft = () => {};
export const live = () => {};

const readForm = () => {
  const out = {voiceover: {}, music: {}};
  document.querySelectorAll('#a-form [data-a]').forEach((el) => {
    const [slot, key] = el.dataset.a.split('.');
    out[slot][key] = el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) / 100 : el.type === 'number' ? (el.value === '' ? (key === 'trimEndSec' ? null : 0) : Number(el.value)) : key === 'src' ? (el.value || null) : el.value;
  });
  return out;
};
const saveAudio = async (form, {voChanged} = {}) => {
  const id = S.cur.project.id, before = S.cur.audio?.voiceover?.src ?? null;
  S.cur.audio = await api(`/api/projects/${id}/audio`, {method: 'PUT', body: {audio: form}});
  if (voChanged || (S.cur.audio.voiceover?.src ?? null) !== before) A.voChanged = id;
  $('#tab').innerHTML = html(S.cur); mount();
};
document.addEventListener('v2:vo-changed', (ev) => { A.voChanged = ev.detail.id; if ($('#a-form') && S.cur?.audio) { $('#tab').innerHTML = html(S.cur); mount(); } });
let vt = null;
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.matches?.('[data-voice-script]') && S.cur) { S.cur.project.brief.script = t.value; queueSave({brief: {script: t.value}}); const c = $('[data-vo-count]'); if (c) c.textContent = `${words(t.value)} words`; clearTimeout(vt); vt = setTimeout(paintVoice, 400); return; }
  if (!t.closest?.('#a-form') || !t.dataset.a) return;
  if (t.type === 'range') { const o = document.querySelector(`[data-out="${t.dataset.a}"]`); if (o) o.textContent = `${t.value}%`; }
  A.dirty = true; $('#a-save').disabled = false; $('#a-state').textContent = 'Unsaved changes.';
});
document.addEventListener('change', async (ev) => {
  const t = ev.target;
  if (t.closest?.('#a-form') && t.dataset.a) { A.dirty = true; $('#a-save').disabled = false; $('#a-state').textContent = 'Unsaved changes.'; }
  if (!t.dataset?.audioFile || !S.cur) return;
  const slot = t.dataset.audioFile, f = t.files[0], id = S.cur.project.id;
  if (!f) return;
  try {
    const form = readForm(), fd = new FormData(); fd.append('role', slot); fd.append('files', f);
    toast(`Uploading ${f.name}…`, 60000);
    const assets = await api(`/api/projects/${id}/assets`, {method: 'POST', body: fd});
    form[slot].src = `studio/${id}/${assets.at(-1).file}`; form[slot].trimStartSec = 0; form[slot].trimEndSec = null;
    S.cur = await api(`/api/projects/${id}?nolog=1`);
    await saveAudio(form, {voChanged: slot === 'voiceover'});
    toast(slot === 'voiceover' ? 'New voiceover set. Re-sync the timing when you are ready.' : 'Music set and saved.');
  } catch (e) { toast(e.message); }
});
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act^="a-"], [data-act="make-audio"]');
  if (!b || !S.cur) return;
  const id = S.cur.project.id;
  try {
    switch (b.dataset.act) {
      case 'make-audio': { const r = await api(`/api/projects/${id}/make-audio-editable`, {method: 'POST'}); if (r.agent) toast('Claude is moving the audio into an editable file…'); else { S.cur.audio = r.audio; $('#tab').innerHTML = html(S.cur); mount(); toast('Audio controls are on.'); } break; }
      case 'a-upload': document.querySelector(`[data-audio-file="${b.dataset.slot}"]`)?.click(); break;
      case 'a-save': await saveAudio(readForm()); toast('Audio saved. Press play in the preview to hear it.'); break;
      case 'a-resync': {
        const vo = S.cur.audio?.voiceover?.src;
        await api(`/api/projects/${id}/message`, {method: 'POST', body: {text: `I replaced the voiceover with ${vo ? String(vo).split('/').pop() : 'a new file'} (see audio.json; it is transcribed in the project's transcripts folder, or transcribe it if not). Re-time the video to it: update the scene starts and cues in config.ts and the storyboard so each scene lands on its sentence, keep the look, and re-render the check stills. Do not touch audio.json.`}});
        A.voChanged = null; $('#tab').innerHTML = html(S.cur); mount(); toast('Claude is re-timing the video…'); break;
      }
    }
  } catch (e) { toast(e.message); }
});
