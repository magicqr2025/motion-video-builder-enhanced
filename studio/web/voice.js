// Voiceover panel under the Story card: ElevenLabs text-to-speech from the script, with audio tags.
//   Audio tags are [bracketed cues] typed into the script (e.g. [whispers]). They steer the voice only: stripTags() hides them
//   from every word count here, and the server removes them from what the video-building AI reads.
//   A generated file is a draft you can play and download; it joins the project only when you press "Save to project".
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

// Keep in step with TAG in server/voice.mjs
const TAG = /[ \t]*\[[A-Za-z][^\[\]\n]{0,39}\][ \t]*/g;
export const stripTags = (t) => String(t ?? '').replace(TAG, ' ').replace(/[ \t]+\n/g, '\n').replace(/ {2,}/g, ' ').trim();
export const countTags = (t) => (String(t ?? '').match(TAG) ?? []).length;

let C = null; // {S, api, toast, flushSave}
const V = {status: null, voices: null, voicesError: '', loadingVoices: false, busy: false, saving: false, draft: null, saved: false, error: '', keyBusy: false, pid: null};

export const initVoice = (ctx) => { C = ctx; };

const proj = () => C.S.cur?.project;
const script = () => String(proj()?.brief.script ?? '');
const clock = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
const model = () => V.status?.models.find((m) => m.id === V.status.modelId) ?? V.status?.models[0];

const load = async () => {
  if (!V.status) { try { V.status = await C.api('/api/voice'); } catch (e) { V.error = e.message; } }
  if (V.status?.connected && !V.voices && !V.loadingVoices) loadVoices();
  renderVoice();
};
const loadVoices = async () => {
  V.loadingVoices = true; V.voicesError = '';
  try { V.voices = (await C.api('/api/voice/voices')).voices; }
  catch (e) { V.voices = []; V.voicesError = e.message; }
  V.loadingVoices = false; renderVoice();
};

const connectBox = () => `
  <p class="small muted vo-lead">Turn the script into a voiceover with ElevenLabs. Paste your API key once; it stays on this PC.</p>
  <div class="vo-key"><input type="password" data-vo-key placeholder="ElevenLabs API key" autocomplete="off" spellcheck="false" />
    <button type="button" class="btn primary" data-vo="connect" ${V.keyBusy ? 'disabled' : ''}>${V.keyBusy ? 'Checking…' : 'Connect'}</button></div>
  <div class="small muted">Create a key at elevenlabs.io → Developers → API keys. It needs “Text to Speech” (and “Voices: read” to list your voices).</div>`;

const voiceSelect = (s) => {
  if (V.loadingVoices) return '<div class="f"><span class="fl">Voice</span><div class="small muted vo-pad">Loading your voices…</div></div>';
  if (!V.voices?.length) return `<label class="f"><span>Voice ID</span><input data-vo-set="voiceId" value="${esc(s.voiceId)}" placeholder="Paste a voice ID from ElevenLabs" /><em>${esc(V.voicesError || 'No voices listed.')} You can paste a voice ID instead.</em></label>`;
  const opt = (v) => `<option value="${esc(v.id)}" ${v.id === s.voiceId ? 'selected' : ''}>${esc(v.name)}${v.desc ? ` · ${esc(v.desc)}` : ''}</option>`;
  const mine = V.voices.filter((v) => v.category !== 'premade'), stock = V.voices.filter((v) => v.category === 'premade');
  return `<label class="f"><span>Voice <button type="button" class="vo-link" data-vo="voices" title="Reload the list">↻</button></span><select data-vo-set="voiceId"><option value="">Choose a voice…</option>
    ${mine.length ? `<optgroup label="Your voices">${mine.map(opt).join('')}</optgroup>` : ''}${stock.length ? `<optgroup label="ElevenLabs voices">${stock.map(opt).join('')}</optgroup>` : ''}</select></label>`;
};

const palette = (m) => `
  <div class="vo-tags">
    <div class="vo-tags-head"><b>Audio tags</b> <span class="small muted">${m.tags ? 'Click to add at the cursor in your script. They shape how it is spoken and never appear in the video.' : 'Eleven v4 and v3 act these out. With this model they are removed before sending.'}</span></div>
    ${V.status.tagGroups.map((g) => `<div class="vo-grp"><span class="vo-gn">${esc(g.name)}</span>${g.tags.map((t) => `<button type="button" class="vo-chip" data-vo="tag" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>`).join('')}
    <div class="vo-custom"><input data-vo-custom placeholder="Your own, e.g. whispers excitedly" maxlength="38" /><button type="button" class="btn sm" data-vo="tag-custom">Add</button></div>
  </div>`;

const result = () => {
  const d = V.draft;
  if (!d) return '';
  const tagLine = d.tagsSent ? `${d.tagsSent} audio tag${d.tagsSent > 1 ? 's' : ''} used` : d.tagsRemoved ? `${d.tagsRemoved} tag${d.tagsRemoved > 1 ? 's' : ''} removed (this model cannot act them out)` : '';
  const hasVo = proj().assets.some((a) => a.role === 'voiceover');
  return `<div class="vo-result">
    <audio controls preload="auto" src="${esc(d.url)}"></audio>
    <div class="small muted vo-meta">${d.seconds ? `${clock(d.seconds)} · ` : ''}${d.chars.toLocaleString()} characters · ${esc(V.status.models.find((m) => m.id === d.model)?.name ?? d.model)}${tagLine ? ` · ${tagLine}` : ''}</div>
    <div class="st-actions">
      <a class="btn" href="${esc(d.url)}" download="voiceover.mp3">⭳ Download MP3</a>
      ${V.saved ? '<span class="pill save">✓ Saved in this project</span>' : `<button type="button" class="btn primary" data-vo="save" ${V.saving ? 'disabled' : ''}>${V.saving ? 'Saving…' : 'Save to project as voiceover'}</button>`}
      <span class="small muted">${V.saved ? (V.draft?.timed ? 'It is in Media. The word timings came with it, so there is nothing to transcribe.' : 'It is in Media and the speech is being transcribed for timing.') : hasVo ? 'This project already has a voiceover. Saving makes this one the voiceover; the old file stays in Media.' : 'Not in the project yet. Listen first, then save if it sounds right.'}</span>
    </div></div>`;
};

export const voiceHTML = () => {
  if (!proj()) return '';
  if (V.pid !== proj().id) { V.pid = proj().id; V.draft = null; V.saved = false; V.error = ''; }
  const head = `<div class="vo-head"><b>Voiceover</b><span class="pill">ElevenLabs</span>${V.status?.connected ? `<span class="small muted">connected ${esc(V.status.keyHint)}${V.status.fromEnv ? ' · from ELEVENLABS_API_KEY' : ''}</span><button type="button" class="vo-link" data-vo="disconnect">Disconnect</button>` : ''}</div>`;
  if (!V.status) return `${head}<div class="small muted">${esc(V.error || 'Loading…')}</div>`;
  if (!V.status.connected) return `${head}${connectBox()}${V.error ? `<div class="st-err">${esc(V.error)}</div>` : ''}`;
  const s = V.status, m = model(), text = script(), n = stripTags(text).length, tags = countTags(text);
  const noScript = !stripTags(text);
  return `${head}
    <div class="vo-grid">
      ${voiceSelect(s)}
      <label class="f"><span>Model</span><select data-vo-set="modelId">${s.models.map((x) => `<option value="${x.id}" ${x.id === s.modelId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><em>${esc(m.note)}</em></label>
      <label class="f"><span>Delivery</span><select data-vo-set="stability">${[['creative', 'Creative · most expressive'], ['natural', 'Natural · balanced'], ['robust', 'Robust · steady, follows the text closely']].map(([v, l]) => `<option value="${v}" ${v === s.stability ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    </div>
    ${palette(m)}
    ${tags && !m.tags ? `<div class="st-note">Your script has ${tags} audio tag${tags > 1 ? 's' : ''}. ${esc(m.name)} cannot act them out, so they will be removed. Pick Eleven v4 or v3 to use them.</div>` : ''}
    <div class="st-actions">
      <button type="button" class="btn primary lg" data-vo="generate" ${V.busy || noScript ? 'disabled' : ''}>${V.busy ? 'Making the voiceover…' : V.draft ? '↻ Generate again' : '▶ Generate voiceover'}</button>
      <span class="small muted">${noScript ? 'Write or generate a script above first.' : `${n.toLocaleString()} characters${tags ? ` · ${tags} audio tag${tags > 1 ? 's' : ''}` : ''}. Uses your ElevenLabs credits.`}</span>
    </div>
    ${V.busy ? '<div class="bar indet"><i></i></div>' : ''}
    ${V.error ? `<div class="st-err">${esc(V.error)}</div>` : ''}
    ${result()}`;
};

export const renderVoice = () => {
  const el = $('#voice-card');
  if (!el) return;
  const keep = $('[data-vo-key]', el)?.value, custom = $('[data-vo-custom]', el)?.value;
  el.innerHTML = voiceHTML();
  if (keep) $('[data-vo-key]', el).value = keep;
  if (custom) $('[data-vo-custom]', el).value = custom;
  if (!V.status) load();
  else if (V.status.connected && !V.voices && !V.loadingVoices) loadVoices();
};

const insertTag = (tag) => {
  const ta = $('#story-card [name="script"]');
  if (!ta) { C.toast('Write or generate a script first, then add tags.'); return; }
  ta.closest('details')?.setAttribute('open', '');
  const clean = tag.trim().replace(/[\[\]\n]/g, '');
  if (!clean) return;
  const at = ta.selectionStart ?? ta.value.length, end = ta.selectionEnd ?? at, before = ta.value.slice(0, at), after = ta.value.slice(end);
  const lead = before && !/\s$/.test(before) ? ' ' : '', trail = after && !/^\s/.test(after) ? ' ' : after ? '' : ' ';
  const piece = `${lead}[${clean}]${trail}`;
  ta.value = before + piece + after;
  const pos = (before + piece).length;
  ta.focus(); ta.setSelectionRange(pos, pos);
  ta.dispatchEvent(new Event('input', {bubbles: true})); // saves the brief and refreshes the word count like normal typing
  renderVoice();
};

const saveSettings = async (patch) => {
  try { V.status = {...V.status, ...(await C.api('/api/voice', {method: 'PUT', body: patch}))}; } catch (e) { C.toast(e.message); }
  renderVoice();
};

document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-vo]');
  if (!b || !C?.S.cur) return;
  switch (b.dataset.vo) {
    case 'connect': {
      const key = String($('[data-vo-key]')?.value ?? '').trim();
      if (!key) { C.toast('Paste your ElevenLabs API key first.'); break; }
      V.keyBusy = true; V.error = ''; renderVoice();
      try { V.status = await C.api('/api/voice', {method: 'PUT', body: {apiKey: key}}); V.voices = null; C.toast('ElevenLabs connected.'); }
      catch (e) { V.error = e.message; }
      V.keyBusy = false; renderVoice(); break;
    }
    case 'disconnect': V.voices = null; V.draft = null; await saveSettings({apiKey: null}); break;
    case 'voices': loadVoices(); break;
    case 'tag': insertTag(b.dataset.tag); break;
    case 'tag-custom': { const i = $('[data-vo-custom]'); insertTag(i?.value ?? ''); if (i) i.value = ''; break; }
    case 'generate': {
      if (V.busy) break;
      if (!V.status.voiceId) { C.toast('Choose a voice first.'); break; }
      const id = proj().id;
      await C.flushSave();
      V.busy = true; V.error = ''; V.saved = false; renderVoice();
      try {
        const d = await C.api(`/api/projects/${id}/voice/generate`, {method: 'POST', body: {text: script()}});
        if (proj()?.id === id) V.draft = d;
      } catch (e) { V.error = e.message; C.toast(e.message); }
      V.busy = false; renderVoice();
      if (V.draft && !V.error) $('#voice-card audio')?.play().catch(() => {}); // autoplay may be blocked: the player is right there
      break;
    }
    case 'save': {
      if (V.saving || !V.draft) break;
      V.saving = true; renderVoice();
      try { await C.api(`/api/projects/${proj().id}/voice/save`, {method: 'POST', body: {draft: V.draft.draft}}); V.saved = true; C.toast('Saved as the project voiceover.'); }
      catch (e) { V.error = e.message; C.toast(e.message); }
      V.saving = false; renderVoice(); break;
    }
  }
});

document.addEventListener('change', (ev) => {
  const k = ev.target.dataset?.voSet;
  if (k && ev.target.closest('#voice-card')) saveSettings({[k]: ev.target.value});
});
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' || !ev.target.closest?.('#voice-card')) return;
  if (ev.target.matches('[data-vo-key]')) { ev.preventDefault(); $('[data-vo="connect"]')?.click(); }
  else if (ev.target.matches('[data-vo-custom]')) { ev.preventDefault(); $('[data-vo="tag-custom"]')?.click(); }
});
