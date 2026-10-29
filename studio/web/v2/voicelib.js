// Scripts & voiceovers library (inside Library): every script and every generated or imported voiceover, kept to reuse in any video.
// Also exports the small helpers the Brief and Audio pages use: save the current script, pick a saved script or voiceover.
import {$, S, api, esc, toast, clock, pill, ago} from './core.js';

const VL = {items: null, q: '', f: 'all', open: new Set()};
const MODEL = {eleven_v4: 'Eleven v4', eleven_v4_turbo: 'Eleven v4 Turbo', eleven_v3: 'Eleven v3', eleven_multilingual_v2: 'Multilingual v2', eleven_flash_v2_5: 'Flash v2.5'};
const FILTERS = [['all', 'All'], ['voiceover', 'Voiceovers'], ['script', 'Scripts only']];
const when = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '' : d.toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'}); };

export const tabs = (active) => `<nav class="tabs" aria-label="Library sections"><a class="tab ${active === 'videos' ? 'on' : ''}" href="#/library">Videos</a><a class="tab ${active === 'audio' ? 'on' : ''}" href="#/library/audio">Scripts &amp; voiceovers</a></nav>`;

const matches = (it) => { const q = VL.q.trim().toLowerCase(); if (q && !`${it.title} ${it.script} ${it.notes} ${it.source?.projectTitle ?? ''}`.toLowerCase().includes(q)) return false; return VL.f === 'all' || (VL.f === 'voiceover' ? !!it.audio : !it.audio); };
const card = (it) => {
  const open = VL.open.has(it.id), long = it.script.length > 260;
  return `<article class="card vitem" data-vid="${esc(it.id)}">
    <div class="spread" style="flex-wrap:nowrap;align-items:flex-start"><div style="min-width:0"><h3 style="overflow:hidden;text-overflow:ellipsis">${esc(it.title)}</h3>
      <div class="row small" style="gap:6px;margin-top:6px">${it.audio ? pill('Voiceover', 'mint') : pill('Script', 'violet')}${it.durationSec ? pill(clock(it.durationSec)) : ''}${it.modelId ? pill(MODEL[it.modelId] ?? it.modelId) : ''}${it.wordCount ? pill(`${it.wordCount} words`) : ''}${it.transcript ? pill('word timings', 'mint') : ''}</div></div></div>
    ${it.script ? `<div class="vscript ${open || !long ? 'open' : ''}">${esc(it.script)}</div>${long ? `<button type="button" class="link" data-vl="toggle" data-id="${esc(it.id)}">${open ? 'Show less' : 'Show the whole script'}</button>` : ''}` : '<div class="small muted">No script saved with this voiceover.</div>'}
    ${it.audio ? `<audio controls preload="none" src="${esc(it.audioUrl)}" style="width:100%;height:40px"></audio>` : ''}
    ${it.notes ? `<div class="small muted">${esc(it.notes)}</div>` : ''}
    <div class="small dim">Saved ${esc(when(it.createdAt))}${it.source?.projectTitle ? ` · from “${esc(it.source.projectTitle)}”` : ''}</div>
    <div class="row" style="gap:8px"><button type="button" class="btn main sm" data-vl="use" data-id="${esc(it.id)}">Use in a video</button>${it.script ? `<button type="button" class="btn sm" data-vl="copy" data-id="${esc(it.id)}">Copy script</button>` : ''}${it.audio ? `<a class="btn sm" href="${esc(it.audioUrl)}" download="${esc(it.title.replace(/[^\w\- ]+/g, '') || 'voiceover')}.mp3">Download MP3</a>` : ''}<button type="button" class="btn sm ghost" data-vl="edit" data-id="${esc(it.id)}">Edit</button><button type="button" class="btn sm ghost danger" data-vl="del" data-id="${esc(it.id)}">Delete</button></div></article>`;
};
const list = () => { const s = VL.items.filter(matches); return s.length ? s.map(card).join('') : `<div class="card empty" style="grid-column:1/-1"><p>${VL.items.length ? 'Nothing matches this search.' : 'Nothing saved yet. Add a script, import the voiceovers your videos already have, or press “Save to library” after generating a voiceover.'}</p></div>`; };

export const render = async (host) => {
  if (!VL.items) host.innerHTML = '<div class="stack"><div class="skel" style="height:140px"></div><div class="skel" style="height:240px"></div></div>';
  try { VL.items = (await api('/api/vo-library')).items; } catch (e) { toast(e.message); VL.items = VL.items ?? []; }
  const voices = VL.items.filter((i) => i.audio).length;
  host.innerHTML = `<div class="stack"><div class="card"><div class="spread"><div><h1>Library</h1><p class="muted small" style="margin:4px 0 0;max-width:640px">Every script and voiceover you want to keep, so you can use them again in any video.</p></div>${tabs('audio')}</div>
      <div class="lstats"><div><b class="big" style="font-size:34px">${VL.items.length}</b><span>saved</span></div><div><b class="big" style="font-size:34px">${voices}</b><span>voiceovers</span></div><div><b class="big" style="font-size:34px">${VL.items.length - voices}</b><span>scripts only</span></div></div>
      <div class="row" style="margin-top:14px"><button type="button" class="btn main" data-vl="add">＋ Add a script</button><button type="button" class="btn" data-vl="import">Import voiceovers from my videos</button>
        <input class="in" type="search" id="vl-q" placeholder="Search scripts…" value="${esc(VL.q)}" style="max-width:260px;border-radius:99px" /><div class="opts">${FILTERS.map(([k, l]) => `<button type="button" class="opt slim ${VL.f === k ? 'on' : ''}" data-vl="filter" data-f="${k}">${l}</button>`).join('')}</div></div></div>
    <div class="vgrid2" id="vl-list">${list()}</div></div>`;
};
export const leave = () => {};
const repaintList = () => { const el = $('#vl-list'); if (el) el.innerHTML = list(); };
const reload = async () => { VL.items = (await api('/api/vo-library')).items; if ($('#vl-list')) { await render($('#view')); } };

// ---------- dialogs ----------
const dlg = (html) => { $('#vl-dialog')?.remove(); const d = document.createElement('dialog'); d.id = 'vl-dialog'; d.className = 'vldlg'; d.innerHTML = `<div class="stack">${html}</div>`; document.body.append(d); d.showModal(); d.addEventListener('close', () => d.remove()); return d; };
const projectOptions = (cur) => `<select class="in" id="vl-project">${[...S.state.projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((p) => `<option value="${esc(p.id)}" ${p.id === cur ? 'selected' : ''}>${esc(p.title)}</option>`).join('')}</select>`;

const openUse = (it, fixedProject) => {
  const cur = fixedProject ?? S.cur?.project?.id;
  dlg(`<div><h2>Use in a video</h2><p class="muted small" style="margin:6px 0 0">“${esc(it.title)}”</p></div>
    <label class="f"><span>Video</span>${projectOptions(cur)}</label>
    <div class="f"><span>What to use</span><div class="stack" style="gap:8px">
      ${it.script && it.audio ? '<label class="chk"><input type="radio" name="vl-what" value="both" checked /> The script and the voiceover</label>' : ''}
      ${it.script ? `<label class="chk"><input type="radio" name="vl-what" value="script" ${it.audio ? '' : 'checked'} /> Only the script (goes to the Brief for you to review)</label>` : ''}
      ${it.audio ? `<label class="chk"><input type="radio" name="vl-what" value="audio" ${it.script ? '' : 'checked'} /> Only the voiceover (becomes the video's voiceover${it.transcript ? '; its word timings come with it' : ''})</label>` : ''}</div></div>
    ${it.audio ? '<div class="note">A voiceover you add replaces the video\'s current one. The old file stays in its Media list.</div>' : ''}
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-vl="close">Cancel</button><button type="button" class="btn main" data-vl="use-go" data-id="${esc(it.id)}">Use it</button></div>`);
};
const openAdd = (preset = {}) => dlg(`<div><h2>Add a script</h2><p class="muted small" style="margin:6px 0 0">Paste a script to keep. Audio tags like [pause] are fine.</p></div>
  <label class="f"><span>Name</span><input class="in" id="vl-title" value="${esc(preset.title ?? '')}" placeholder="e.g. Excel leads hook, Hinglish" /></label>
  <label class="f"><span>Script</span><textarea class="in" id="vl-script" rows="9" placeholder="Paste or write the script…">${esc(preset.script ?? '')}</textarea></label>
  <label class="f"><span>Notes (optional)</span><input class="in" id="vl-notes" placeholder="e.g. for reels, 45 seconds" /></label>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-vl="close">Cancel</button><button type="button" class="btn main" data-vl="add-go" data-project="${esc(preset.projectId ?? '')}">Save to library</button></div>`);
const openEdit = (it) => dlg(`<div><h2>Edit</h2></div><label class="f"><span>Name</span><input class="in" id="vl-title" value="${esc(it.title)}" /></label>
  <label class="f"><span>Script</span><textarea class="in" id="vl-script" rows="9">${esc(it.script)}</textarea></label><label class="f"><span>Notes</span><input class="in" id="vl-notes" value="${esc(it.notes)}" /></label>
  ${it.audio ? '<div class="small muted">Editing the script here does not change the audio.</div>' : ''}
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-vl="close">Cancel</button><button type="button" class="btn main" data-vl="edit-go" data-id="${esc(it.id)}">Save</button></div>`);
const openImport = async () => {
  const d = dlg('<h2>Import voiceovers from my videos</h2><div class="skel" style="height:120px"></div>');
  try {
    const {candidates} = await api('/api/vo-library/candidates');
    d.querySelector('.stack').innerHTML = `<div><h2>Import voiceovers from my videos</h2><p class="muted small" style="margin:6px 0 0">Voiceovers your videos already have. The video's current script is saved with each one.</p></div>
      ${candidates.length ? `<div class="stack" style="gap:8px;max-height:46vh;overflow:auto">${candidates.map((c, i) => `<label class="vcand"><input type="checkbox" data-cand="${i}" /><span style="flex:1;min-width:0"><b>${esc(c.projectTitle)}</b><small class="muted"> · ${esc(c.original)}${c.durationSec ? ` · ${clock(c.durationSec)}` : ''}</small></span>${c.hasScript ? '' : pill('no script', 'dim')}</label>`).join('')}</div>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-vl="close">Cancel</button><button type="button" class="btn main" data-vl="import-go">Import selected</button></div>` : '<p class="muted">Every voiceover your videos have is already in the library.</p><div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-vl="close">Close</button></div>'}`;
    d.dataset.cands = JSON.stringify(candidates);
  } catch (e) { d.close(); toast(e.message); }
};

// ---------- for the Brief and Audio pages ----------
export const saveScriptToLibrary = async () => {
  const p = S.cur.project, script = String(p.brief.script ?? '').trim();
  if (!script) return toast('Write a script first.');
  openAdd({title: `${p.title} · script`, script, projectId: p.id});
};
export const keepVoice = async (draft) => api(`/api/projects/${S.cur.project.id}/voice/keep`, {method: 'POST', body: {draft}});
export const openPicker = async (kind) => {
  const d = dlg(`<h2>${kind === 'audio' ? 'Pick a saved voiceover' : 'Pick a saved script'}</h2><div class="skel" style="height:120px"></div>`);
  try {
    const items = (await api('/api/vo-library')).items.filter((i) => (kind === 'audio' ? i.audio : i.script));
    d.querySelector('.stack').innerHTML = `<div><h2>${kind === 'audio' ? 'Pick a saved voiceover' : 'Pick a saved script'}</h2><p class="muted small" style="margin:6px 0 0">${kind === 'audio' ? 'It becomes this video\'s voiceover.' : 'It replaces the script on the Brief (you review it before it is approved).'}</p></div>
      ${items.length ? `<input class="in" type="search" id="vl-pq" placeholder="Search…" /><div class="stack" id="vl-plist" style="gap:8px;max-height:46vh;overflow:auto">${items.map((it) => pickRow(it, kind)).join('')}</div>` : '<p class="muted">Nothing saved yet. Save a script or voiceover from Library → Scripts &amp; voiceovers.</p>'}
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-vl="close">Close</button></div>`;
    d.dataset.items = JSON.stringify(items.map((i) => i.id));
  } catch (e) { d.close(); toast(e.message); }
};
const pickRow = (it, kind) => `<div class="vcand" data-pick-text="${esc(`${it.title} ${it.script}`.toLowerCase())}"><span style="flex:1;min-width:0"><b>${esc(it.title)}</b><div class="small muted vclip">${esc(it.script)}</div>${it.audio && kind === 'audio' ? `<audio controls preload="none" src="${esc(it.audioUrl)}" style="width:100%;height:34px;margin-top:6px"></audio>` : ''}</span><button type="button" class="btn main sm" data-vl="pick-go" data-id="${esc(it.id)}" data-kind="${kind}">Use</button></div>`;

// ---------- events ----------
document.addEventListener('input', (ev) => {
  if (ev.target.id === 'vl-q') { VL.q = ev.target.value; repaintList(); }
  if (ev.target.id === 'vl-pq') { const q = ev.target.value.trim().toLowerCase(); document.querySelectorAll('#vl-plist [data-pick-text]').forEach((r) => { r.hidden = !!q && !r.dataset.pickText.includes(q); }); }
});
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-vl]');
  if (!b) return;
  const id = b.dataset.id, it = id ? VL.items?.find((x) => x.id === id) : null;
  try {
    switch (b.dataset.vl) {
      case 'close': $('#vl-dialog')?.close(); break;
      case 'filter': VL.f = b.dataset.f; await render($('#view')); break;
      case 'toggle': VL.open.has(id) ? VL.open.delete(id) : VL.open.add(id); repaintList(); break;
      case 'add': openAdd(); break;
      case 'import': openImport(); break;
      case 'use': openUse(it); break;
      case 'edit': openEdit(it); break;
      case 'save-script': saveScriptToLibrary(); break;
      case 'pick-script': openPicker('script'); break;
      case 'pick-audio': openPicker('audio'); break;
      case 'copy': try { await navigator.clipboard.writeText(it.script); toast('Script copied.'); } catch { toast('Could not copy. Select the text and press Ctrl+C.'); } break;
      case 'del': if (confirm(`Delete “${it.title}” from the library?${it.audio ? '\n\nThe saved audio is deleted too. Videos that already use it keep their own copy.' : ''}`)) { await api(`/api/vo-library/${id}`, {method: 'DELETE'}); toast('Deleted.'); await render($('#view')); } break;
      case 'add-go': {
        const script = $('#vl-script').value.trim(); if (!script) return toast('Paste the script first.');
        b.disabled = true; await api('/api/vo-library/script', {method: 'POST', body: {title: $('#vl-title').value, script, notes: $('#vl-notes').value, projectId: b.dataset.project || undefined}});
        $('#vl-dialog')?.close(); toast('Saved to the library.'); VL.items = null; if ($('#vl-list')) await render($('#view')); break;
      }
      case 'edit-go': b.disabled = true; await api(`/api/vo-library/${id}`, {method: 'PATCH', body: {title: $('#vl-title').value, script: $('#vl-script').value, notes: $('#vl-notes').value}}); $('#vl-dialog')?.close(); toast('Saved.'); await render($('#view')); break;
      case 'import-go': {
        const d = $('#vl-dialog'), cands = JSON.parse(d.dataset.cands || '[]'), chosen = [...d.querySelectorAll('[data-cand]:checked')].map((c) => cands[Number(c.dataset.cand)]);
        if (!chosen.length) return toast('Tick the voiceovers to import.');
        b.disabled = true; b.textContent = 'Importing…';
        for (const c of chosen) await api('/api/vo-library/import', {method: 'POST', body: {projectId: c.projectId, file: c.file}});
        d.close(); toast(`Imported ${chosen.length} voiceover${chosen.length === 1 ? '' : 's'}.`); await render($('#view')); break;
      }
      case 'use-go': {
        const d = $('#vl-dialog'), what = d.querySelector('[name="vl-what"]:checked')?.value ?? 'both', projectId = $('#vl-project').value;
        b.disabled = true; const r = await api(`/api/vo-library/${id}/use`, {method: 'POST', body: {projectId, what}});
        d.close(); toast(`Added to the video${r.asset && !r.timed ? '. The voiceover is being transcribed for timing.' : '.'}`);
        location.hash = `#/p/${encodeURIComponent(projectId)}/${r.asset ? 'audio' : 'brief'}`; break;
      }
      case 'pick-go': {
        const projectId = S.cur.project.id; b.disabled = true;
        const r = await api(`/api/vo-library/${id}/use`, {method: 'POST', body: {projectId, what: b.dataset.kind === 'audio' ? 'audio' : 'script'}});
        $('#vl-dialog')?.close(); toast(r.asset ? 'Voiceover added to this video. Use it in the Audio tab.' : 'Script loaded. Review it, then approve.');
        S.cur = await api(`/api/projects/${projectId}?nolog=1`); window.dispatchEvent(new HashChangeEvent('hashchange')); break;
      }
    }
  } catch (e) { toast(e.message); b.disabled = false; }
});
void ago;
