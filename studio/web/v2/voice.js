// Voiceover panel on the Brief page: ElevenLabs text-to-speech from the script, with audio tags.
// A generated file is a draft you can play and download; it joins the project only when you press "Save to project".
import {$, S, api, esc, toast, clock, stripTags, countTags, flushSave, pill} from './core.js';
import {keepVoice} from './voicelib.js';

const V = {savedFile: null, usedFile: null, status: null, voices: null, voicesError: '', loadingVoices: false, busy: false, saving: false, draft: null, saved: false, error: '', keyBusy: false, pid: null};
const proj = () => S.cur?.project;
const script = () => String(proj()?.brief.script ?? '');
const model = () => V.status?.models.find((m) => m.id === V.status.modelId) ?? V.status?.models[0];

const load = async () => {
  if (!V.status) { try { V.status = await api('/api/voice'); } catch (e) { V.error = e.message; } }
  if (V.status?.connected && !V.voices && !V.loadingVoices) loadVoices();
  paintVoice();
};
const loadVoices = async () => {
  V.loadingVoices = true; V.voicesError = '';
  try { V.voices = (await api('/api/voice/voices')).voices; } catch (e) { V.voices = []; V.voicesError = e.message; }
  V.loadingVoices = false; paintVoice();
};

const voiceSelect = (s) => {
  if (V.loadingVoices) return '<div class="f"><span>Voice</span><div class="small muted" style="padding:10px 0">Loading your voices…</div></div>';
  if (!V.voices?.length) return `<label class="f"><span>Voice ID</span><input class="in" data-vo-set="voiceId" value="${esc(s.voiceId)}" placeholder="Paste a voice ID from ElevenLabs" /><small class="dim">${esc(V.voicesError ? 'Your key cannot list voices. ' : 'No voices listed. ')}Paste a voice ID instead; it is saved as your default.</small></label>`;
  const opt = (v) => `<option value="${esc(v.id)}" ${v.id === s.voiceId ? 'selected' : ''}>${esc(v.name)}${v.desc ? ` · ${esc(v.desc)}` : ''}</option>`;
  const mine = V.voices.filter((v) => v.category !== 'premade'), stock = V.voices.filter((v) => v.category === 'premade');
  return `<label class="f"><span>Voice <button type="button" class="link" data-vo="voices">↻</button></span><select class="in" data-vo-set="voiceId"><option value="">Choose a voice…</option>${mine.length ? `<optgroup label="Your voices">${mine.map(opt).join('')}</optgroup>` : ''}${stock.length ? `<optgroup label="ElevenLabs voices">${stock.map(opt).join('')}</optgroup>` : ''}</select></label>`;
};

const result = () => {
  const d = V.draft;
  if (!d) return '';
  const tagLine = d.tagsSent ? `${d.tagsSent} audio tag${d.tagsSent > 1 ? 's' : ''} used` : d.tagsRemoved ? `${d.tagsRemoved} tag${d.tagsRemoved > 1 ? 's' : ''} removed (this model cannot act them out)` : '';
  const hasVo = proj().assets.some((a) => a.role === 'voiceover');
  return `<div class="res"><audio controls preload="auto" src="${esc(d.url)}" style="width:100%"></audio>
    <div class="small muted">${d.seconds ? `${clock(d.seconds)} · ` : ''}${d.chars.toLocaleString()} characters · ${esc(V.status.models.find((m) => m.id === d.model)?.name ?? d.model)}${tagLine ? ` · ${tagLine}` : ''}${d.timed ? ` · ${d.timedWords} word timings included` : ''}</div>
    <div class="row"><a class="btn" href="${esc(d.url)}" download="voiceover.mp3">⭳ Download MP3</a>
      ${V.saved ? pill('✓ Saved in this project', 'mint') : `<button type="button" class="btn main" data-vo="save" ${V.saving ? 'disabled' : ''}>${V.saving ? 'Saving…' : 'Save to project as voiceover'}</button>`}
      ${V.saved && S.cur?.audio && V.savedFile && V.usedFile !== V.savedFile ? `<button type="button" class="btn main" data-vo="use" ${V.saving ? 'disabled' : ''}>Use it in the video now</button>` : ''}${V.usedFile && V.usedFile === V.savedFile ? pill('✓ In the video', 'mint') : ''}
      ${V.kept ? pill('✓ In the library', 'mint') : `<button type="button" class="btn" data-vo="keep" ${V.saving ? 'disabled' : ''} title="Keep the script and this voiceover to reuse in other videos">Save to library</button>`}
      <span class="small muted">${V.saved ? (V.draft?.timed ? 'It is in Media. The word timings came with it, so there is nothing to transcribe.' : 'It is in Media and the speech is being transcribed for timing.') : hasVo ? 'This project already has a voiceover. Saving makes this one the voiceover; the old file stays in Media.' : 'Not in the project yet. Listen first, then save if it sounds right.'}</span></div></div>`;
};

export const voiceHTML = () => {
  if (!proj()) return '';
  if (V.pid !== proj().id) Object.assign(V, {pid: proj().id, draft: null, saved: false, error: ''});
  const head = `<div class="spread"><div class="row"><h2>Voiceover</h2>${pill('ElevenLabs')}</div>${V.status?.connected ? `<div class="row small muted"><span>connected ${esc(V.status.keyHint)}${V.status.fromEnv ? ' · from ELEVENLABS_API_KEY' : ''}</span><button type="button" class="link" data-vo="disconnect">Disconnect</button></div>` : ''}</div>`;
  if (!V.status) return `${head}<div class="small muted">${esc(V.error || 'Loading…')}</div>`;
  if (!V.status.connected) return `${head}<p class="small muted" style="margin:0">Turn the script into a voiceover with ElevenLabs. Paste your API key once; it stays on this PC.</p>
    <div class="row"><input class="in" type="password" data-vo-key placeholder="ElevenLabs API key" autocomplete="off" spellcheck="false" style="max-width:420px" /><button type="button" class="btn main" data-vo="connect" ${V.keyBusy ? 'disabled' : ''}>${V.keyBusy ? 'Checking…' : 'Connect'}</button></div>
    <div class="small dim">Create a key at elevenlabs.io → Developers → API keys. It needs “Text to Speech” (and “Voices: read” to list your voices).</div>${V.error ? `<div class="err">${esc(V.error)}</div>` : ''}`;
  const s = V.status, m = model(), t = script(), n = stripTags(t).length, tags = countTags(t), none = !stripTags(t);
  return `${head}
    <div class="g3">${voiceSelect(s)}
      <label class="f"><span>Model</span><select class="in" data-vo-set="modelId">${s.models.map((x) => `<option value="${x.id}" ${x.id === s.modelId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><small class="dim">${esc(m.note)}</small></label>
      <label class="f"><span>Delivery</span><select class="in" data-vo-set="stability">${[['creative', 'Creative · most expressive'], ['natural', 'Natural · balanced'], ['robust', 'Robust · steady']].map(([v, l]) => `<option value="${v}" ${v === s.stability ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <div class="tags"><div class="small"><b>Audio tags</b> <span class="muted">${m.tags ? 'Click to add at the cursor in your script. They shape how it is spoken and never appear in the video.' : 'Eleven v4 and v3 act these out. With this model they are removed before sending.'}</span></div>
      ${s.tagGroups.map((g) => `<div class="tg"><span class="gn">${esc(g.name)}</span>${g.tags.map((x) => `<button type="button" class="chipb" data-vo="tag" data-tag="${esc(x)}">${esc(x)}</button>`).join('')}</div>`).join('')}
      <div class="row"><input class="in" data-vo-custom placeholder="Your own, e.g. whispers excitedly" maxlength="38" style="max-width:300px;height:36px" /><button type="button" class="btn sm" data-vo="tag-custom">Add</button></div></div>
    ${tags && !m.tags ? `<div class="note">Your script has ${tags} audio tag${tags > 1 ? 's' : ''}. ${esc(m.name)} cannot act them out, so they will be removed. Pick Eleven v4 or v3 to use them.</div>` : ''}
    <div class="row"><button type="button" class="btn main" data-vo="generate" ${V.busy || none ? 'disabled' : ''}>${V.busy ? 'Making the voiceover…' : V.draft ? '↻ Generate again' : 'Generate voiceover'}</button>
      <span class="small muted">${none ? 'Write or generate a script above first.' : `${n.toLocaleString()} characters${tags ? ` · ${tags} audio tag${tags > 1 ? 's' : ''}` : ''}. Uses your ElevenLabs credits.`}</span></div>
    ${V.busy ? '<div class="bar"><span class="sheen"></span></div>' : ''}${V.error ? `<div class="err">${esc(V.error)}</div>` : ''}${result()}`;
};
export const paintVoice = () => {
  const el = $('#sec-voice');
  if (!el) return;
  const key = $('[data-vo-key]', el)?.value, custom = $('[data-vo-custom]', el)?.value;
  el.innerHTML = voiceHTML();
  if (key) $('[data-vo-key]', el).value = key;
  if (custom) $('[data-vo-custom]', el).value = custom;
  if (!V.status) load(); else if (V.status.connected && !V.voices && !V.loadingVoices) loadVoices();
};

const insertTag = (tag) => {
  const t = $('#sec-story [data-b="script"]') ?? $('[data-voice-script]');
  if (!t) { toast('Write or generate a script first, then add tags.'); return; }
  t.closest('details')?.setAttribute('open', '');
  const clean = tag.trim().replace(/[\[\]\n]/g, '');
  if (!clean) return;
  const at = t.selectionStart ?? t.value.length, end = t.selectionEnd ?? at, before = t.value.slice(0, at), after = t.value.slice(end);
  const lead = before && !/\s$/.test(before) ? ' ' : '', trail = after && !/^\s/.test(after) ? ' ' : after ? '' : ' ';
  const piece = `${lead}[${clean}]${trail}`;
  t.value = before + piece + after;
  const pos = (before + piece).length;
  t.focus(); t.setSelectionRange(pos, pos);
  t.dispatchEvent(new Event('input', {bubbles: true})); // saves the brief and refreshes the word count like normal typing
  paintVoice();
};
const saveSettings = async (patch) => {
  try { V.status = {...V.status, ...(await api('/api/voice', {method: 'PUT', body: patch}))}; } catch (e) { toast(e.message); }
  paintVoice();
};

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-vo]');
  if (!b || !S.cur || !$('#sec-voice')) return;
  switch (b.dataset.vo) {
    case 'connect': {
      const key = String($('[data-vo-key]')?.value ?? '').trim();
      if (!key) { toast('Paste your ElevenLabs API key first.'); break; }
      V.keyBusy = true; V.error = ''; paintVoice();
      try { V.status = await api('/api/voice', {method: 'PUT', body: {apiKey: key}}); V.voices = null; toast('ElevenLabs connected.'); } catch (e) { V.error = e.message; }
      V.keyBusy = false; paintVoice(); break;
    }
    case 'disconnect': V.voices = null; V.draft = null; await saveSettings({apiKey: null}); break;
    case 'voices': loadVoices(); break;
    case 'tag': insertTag(b.dataset.tag); break;
    case 'tag-custom': { const i = $('[data-vo-custom]'); insertTag(i?.value ?? ''); if (i) i.value = ''; break; }
    case 'generate': {
      if (V.busy) break;
      if (!V.status.voiceId) { toast('Choose a voice first.'); break; }
      const id = proj().id;
      await flushSave();
      Object.assign(V, {busy: true, error: '', saved: false, kept: false}); paintVoice();
      try { const d = await api(`/api/projects/${id}/voice/generate`, {method: 'POST', body: {text: script()}}); if (proj()?.id === id) V.draft = d; }
      catch (e) { V.error = e.message; toast(e.message); }
      V.busy = false; paintVoice();
      if (V.draft && !V.error) $('#sec-voice audio')?.play().catch(() => {});
      break;
    }
    case 'keep': {
      if (V.saving || !V.draft) break;
      V.saving = true; paintVoice();
      try { await keepVoice(V.draft.draft); V.kept = true; toast('Saved to the library (Library → Scripts & voiceovers).'); } catch (e) { V.error = e.message; toast(e.message); }
      V.saving = false; paintVoice(); break;
    }
    case 'use': {
      if (V.saving || !V.savedFile) break;
      V.saving = true; paintVoice();
      try {
        const id = proj().id;
        S.cur.audio = await api(`/api/projects/${id}/audio`, {method: 'PUT', body: {audio: {voiceover: {src: `studio/${id}/${V.savedFile}`, trimStartSec: 0, trimEndSec: null}}}});
        V.usedFile = V.savedFile;
        document.dispatchEvent(new CustomEvent('v2:vo-changed', {detail: {id}}));
        toast('The video now uses this voiceover. Re-sync the timing when you are ready.');
      } catch (e) { V.error = e.message; toast(e.message); }
      V.saving = false; paintVoice(); break;
    }
    case 'save': {
      if (V.saving || !V.draft) break;
      V.saving = true; paintVoice();
      try { const r = await api(`/api/projects/${proj().id}/voice/save`, {method: 'POST', body: {draft: V.draft.draft}}); V.saved = true; V.savedFile = r.asset?.file ?? null; V.usedFile = null; toast('Saved as the project voiceover.'); }
      catch (e) { V.error = e.message; toast(e.message); }
      V.saving = false; paintVoice(); break;
    }
  }
});
document.addEventListener('change', (ev) => { const k = ev.target.dataset?.voSet; if (k && ev.target.closest('#sec-voice')) saveSettings({[k]: ev.target.value}); });
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' || !ev.target.closest?.('#sec-voice')) return;
  if (ev.target.matches('[data-vo-key]')) { ev.preventDefault(); $('[data-vo="connect"]')?.click(); }
  else if (ev.target.matches('[data-vo-custom]')) { ev.preventDefault(); $('[data-vo="tag-custom"]')?.click(); }
});
