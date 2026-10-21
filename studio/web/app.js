// MagicBolt Video Studio: browser side. Plain JS modules, no build step.
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const api = async (url, opts = {}) => {
  const res = await fetch(url, {headers: opts.body && !(opts.body instanceof FormData) ? {'Content-Type': 'application/json'} : {}, ...opts, body: opts.body && !(opts.body instanceof FormData) ? JSON.stringify(opts.body) : opts.body});
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || res.statusText);
  return j;
};
const toast = (msg, ms = 3200) => { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => (t.hidden = true), ms); };
const fmtT = (s) => { s = Math.max(0, Number(s) || 0); const m = Math.floor(s / 60); return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`; };
const bust = () => `?v=${Date.now() % 1e7}`;

const SIZES = [
  ['Reel 9:16', 1080, 1920], ['Landscape 16:9', 1920, 1080], ['Square 1:1', 1080, 1080], ['Portrait 4:5', 1080, 1350], ['Loop 1200²', 1200, 1200], ['4K 16:9', 3840, 2160],
];
const LANGS = ['English', 'Hinglish', 'Hindi', 'Hindi + English captions'];
const CAPTIONS = ['', 'word-by-word pill', 'step pill', 'kinetic big lines', 'subtitles', 'none'];
const ROLES = ['voiceover', 'music', 'logo', 'image', 'footage', 'reference', 'file'];
const STATUS = {
  brief: ['Brief', ''], concepting: ['Designing concepts', 'blue'], concepts: ['Pick a concept', 'gold'], building: ['Building video', 'blue'],
  review: ['Ready to review', 'gold'], rendering: ['Rendering', 'blue'], done: ['Rendered', 'green'],
};
const SCENE_COLORS = ['#1354BC', '#1582D5', '#F7941D', '#7B3FF2', '#ED1C6F', '#16A34A', '#0E1B4D', '#E0A800'];

const S = {
  state: null, cur: null, tab: 'brief', editing: false, renderJob: null, jobText: {},
  leftCollapsed: localStorage.getItem('studio-left-collapsed') === '1',
  rightCollapsed: localStorage.getItem('studio-right-collapsed') === '1',
};
const applyPanelState = () => {
  const layout = $('.layout');
  layout.classList.toggle('left-collapsed', S.leftCollapsed);
  layout.classList.toggle('right-collapsed', S.rightCollapsed);
  const left = $('#toggle-left'), right = $('#toggle-right');
  left.textContent = S.leftCollapsed ? 'Show projects' : 'Hide projects';
  right.textContent = S.rightCollapsed ? 'Show chat' : 'Hide chat';
  left.setAttribute('aria-expanded', String(!S.leftCollapsed));
  right.setAttribute('aria-expanded', String(!S.rightCollapsed));
};
applyPanelState();

// ---------- routing ----------
const route = () => {
  const [, kind, id, tab] = location.hash.split('/');
  return kind === 'p' && id ? {id, tab: tab || null} : {id: null};
};
const go = (id, tab) => { location.hash = id ? `#/p/${id}/${tab ?? ''}` : '#/'; };

window.addEventListener('hashchange', () => load());

// ---------- data ----------
const loadState = async () => {
  S.state = await api('/api/state');
  S.renderJob = S.state.renderJob;
  $('#open-remotion').href = `http://localhost:${S.state.studioPort}`;
  renderSide();
  renderRenderPill();
};
const loadProject = async (id) => {
  S.cur = await api(`/api/projects/${id}`);
  if (S.cur.renderJob) S.renderJob = S.cur.renderJob;
};
const bestTab = (p) => ({brief: 'brief', concepting: 'concepts', concepts: 'concepts', building: 'build', review: 'build', rendering: 'render', done: 'render'}[p.status] ?? 'brief');

const load = async () => {
  const r = route();
  await loadState().catch((e) => toast(e.message));
  if (!r.id) { S.cur = null; renderHome(); renderChat(); return; }
  try { await loadProject(r.id); } catch { go(null); return; }
  S.tab = r.tab || bestTab(S.cur.project);
  renderProject();
  renderChat();
};

// ---------- sidebar ----------
const renderSide = () => {
  const r = route();
  $('#projects').innerHTML = S.state.projects.length
    ? S.state.projects.map((p) => {
      const [label] = STATUS[p.status] ?? [p.status];
      return `<a href="#/p/${p.id}/" class="${p.id === r.id ? 'on' : ''}"><div class="t">${p.busy ? '<i class="dot"></i>' : ''}${esc(p.title)}</div><div class="s">${esc(label)}</div></a>`;
    }).join('')
    : '<div class="muted small" style="padding:0 10px">No videos yet.</div>';
};

const renderRenderPill = () => {
  const j = S.renderJob, el = $('#render-pill');
  if (!j || j.done) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = `<i class="dot"></i> Rendering ${esc(j.projectId)} · ${j.stage} ${Math.round((j.progress ?? 0) * 100)}%`;
};

// ---------- home: presets ----------
const presetThumb = (pr) => `/data/_presets/${pr.id}.png`;
// ---------- AI model settings (home page) ----------
const aiName = () => { const ai = S.state?.settings?.ai; return !ai || ai.provider === 'claude' ? 'Claude' : ai.provider === 'codex' ? 'Codex' : (ai.model || S.state.settings.providers[ai.provider]?.model || 'AI'); };
const aiCard = () => {
  const st = S.state.settings ?? {};
  const ai = st.ai ?? {provider: 'claude'};
  const provs = st.providers ?? {claude: {name: 'Claude Code (your login)'}};
  const def = provs[ai.provider] ?? {};
  const isClaude = ai.provider === 'claude';
  const isCodex = ai.provider === 'codex';
  return `<details class="card ai-card" style="margin:0 0 22px" open>
    <summary class="spread" style="cursor:pointer"><b>AI model</b><span class="muted small">${esc(provs[ai.provider]?.name ?? 'Claude')}${isClaude || isCodex ? '' : ` · ${esc(ai.model || def.model)}`}</span></summary>
    <div id="ai-form" style="margin-top:12px;display:grid;gap:10px">
      ${select('ai-provider', 'Provider', ai.provider, Object.entries(provs).map(([k, v]) => [k, v.name]))}
      ${isClaude ? '<p class="small muted" style="margin:0">Uses the Claude Code login on this PC (run <code>claude</code> and <code>/login</code> once). No API key needed.</p>' : isCodex ? `
        <p class="small muted" style="margin:0">Uses the Codex CLI login on this PC. Enter a model ID available in your Codex account's model picker. No API key needed.</p>
        ${field('ai-model', 'Codex model ID', ai.model, {placeholder: 'model ID from your Codex model picker', hint: 'This must be available to your signed-in ChatGPT account.'})}` : `
        ${field('ai-model', 'Model', ai.model, {placeholder: def.model || 'model name', hint: 'The exact model id your provider uses. It must support tool calling; vision is needed to check rendered frames.'})}
        ${field('ai-baseUrl', 'API address', ai.baseUrl, {placeholder: def.baseUrl || 'https://…/v1'})}
        ${field('ai-apiKey', 'API key', '', {type: 'password', placeholder: ai.keySaved ? `saved (${ai.keyHint}): leave empty to keep` : ai.hasKey ? `using ${def.keyEnv} from the environment` : ai.provider === 'ollama' ? 'not needed for Ollama' : 'paste your key', hint: 'Stored only on this PC in studio/data/settings.json.'})}`}
      <div class="row" style="gap:8px">
        ${isClaude ? '' : '<button class="btn primary sm" data-action="save-ai">Save</button>'}
        <button class="btn ghost sm" data-action="test-ai">Test connection</button>
        ${ai.keySaved ? '<button class="btn ghost sm" data-action="clear-ai-key">Remove saved key</button>' : ''}
        <span class="small muted" id="ai-test"></span>
      </div>
    </div>
  </details>`;
};

const renderHome = () => {
  $('#crumbs').innerHTML = '';
  $('#chat').hidden = true;
  const ps = S.state.presets;
  const cats = [...new Set(ps.map((p) => p.category))];
  $('#main').innerHTML = `
    <div class="hero">
      <h1>What are we making today?</h1>
      <p>Pick a preset (a look you've already approved) or start blank. Fill the brief, Claude proposes concepts as real sample frames, you approve one, and it builds the full video with timing synced to your voiceover.</p>
      <div class="steps"><span>1 · Brief</span><span>2 · Concept stills</span><span>3 · Approve</span><span>4 · Full build</span><span>5 · Render MP4</span></div>
    </div>
    ${aiCard()}
    <div class="section-title"><h2>Start from a preset</h2><span class="muted">no need to explain the style again</span></div>
    ${cats.map((c) => `
      <h3 style="margin:18px 0 10px;color:var(--slate)">${esc(c)}</h3>
      <div class="presets">${ps.filter((p) => p.category === c).map((p) => `
        <div class="preset" data-action="new" data-preset="${p.id}">
          <div class="thumb"><img src="${presetThumb(p)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'${esc(p.defaults?.width)}×${esc(p.defaults?.height)}'}))" /></div>
          <div class="body">
            <div class="spread"><h3>${esc(p.name)}</h3>${p.custom ? '<span class="pill gold">yours</span>' : ''}</div>
            <p>${esc(p.tagline)}</p>
            <div class="row"><span class="pill">${p.defaults?.width}×${p.defaults?.height}</span><span class="pill">${esc(p.defaults?.language ?? '')}</span></div>
          </div>
        </div>`).join('')}
      </div>`).join('')}
    <h3 style="margin:18px 0 10px;color:var(--slate)">Blank</h3>
    <div class="presets"><div class="preset" data-action="new" data-preset="">
      <div class="thumb"><div class="ph">＋</div></div>
      <div class="body"><h3>Blank video</h3><p>Describe anything. Claude can still borrow from your past videos.</p></div>
    </div></div>`;
};

// ---------- project shell ----------
const TABS = [['brief', 'Brief'], ['concepts', 'Concepts'], ['build', 'Build & timing'], ['text', 'Text'], ['style', 'Style'], ['audio', 'Audio'], ['background', 'Background'], ['render', 'Preview & render']];
const tabEnabled = (t, p, cur) => t === 'brief' || (t === 'concepts' && (cur.concepts || p.status !== 'brief')) || (t === 'build' && (cur.storyboard || ['building', 'review', 'rendering', 'done'].includes(p.status))) || ((t === 'render' || t === 'text' || t === 'audio' || t === 'background' || t === 'style') && cur.storyboard);
const tabDone = (t, p) => ({brief: p.status !== 'brief', concepts: !!p.approvedConcept, build: ['review', 'rendering', 'done'].includes(p.status), text: false, style: false, audio: false, background: false, render: p.renders.length > 0}[t]);

const renderProject = () => {
  const {project: p} = S.cur;
  const [label, tone] = STATUS[p.status] ?? [p.status, ''];
  const preset = S.state.presets.find((x) => x.id === p.presetId);
  $('#crumbs').innerHTML = `<b>${esc(p.title)}</b> · ${esc(preset?.name ?? 'Blank')} · ${p.brief.width}×${p.brief.height}`;
  $('#chat').hidden = false;
  const tabs = TABS.map(([k, l], i) => `<button data-tab="${k}" class="${S.tab === k ? 'on' : ''} ${tabDone(k, p) ? 'done' : ''}" ${tabEnabled(k, p, S.cur) ? '' : 'disabled'}><span class="k">${tabDone(k, p) ? '✓' : i + 1}</span>${l}</button>`).join('');
  $('#main').innerHTML = `
    <div class="spread">
      <div class="row"><h1 style="font-size:24px">${esc(p.title)}</h1><span class="pill ${tone}">${S.cur.busy ? '<i class="dot"></i>' : ''}${esc(label)}</span></div>
      <div class="row"><span class="muted small">${p.cost ? `usage ≈ $${p.cost.toFixed(2)}` : ''}</span><button class="btn ghost sm danger" data-action="delete">Delete</button></div>
    </div>
    <div class="tabs">${tabs}</div>
    <div id="tab"></div>`;
  ({brief: renderBrief, concepts: renderConcepts, build: renderBuild, text: renderText, style: renderStyle, audio: renderAudio, background: renderBackground, render: renderRender}[S.tab] ?? renderBrief)();
};

// ---------- 1 · brief ----------
const field = (name, label, value, {type = 'text', rows, placeholder = '', hint = ''} = {}) => `
  <label class="f"><span>${label}</span>${rows ? `<textarea name="${name}" rows="${rows}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>` : `<input name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" />`}${hint ? `<em>${hint}</em>` : ''}</label>`;
const select = (name, label, value, opts) => `<label class="f"><span>${label}</span><select name="${name}">${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o || '(preset default)']; return `<option value="${esc(v)}" ${String(v) === String(value ?? '') ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`;

const renderBrief = () => {
  const {project: p} = S.cur, b = p.brief;
  const preset = S.state.presets.find((x) => x.id === p.presetId);
  const brands = S.state.brands;
  $('#tab').innerHTML = `
    <form id="brief" autocomplete="off">
      ${preset ? `<div class="preset-banner"><img src="${presetThumb(preset)}" alt="" onerror="this.remove()" /><div><b>${esc(preset.name)}</b><div class="small muted" style="margin-top:3px">${esc(preset.tagline)}</div>${preset.asks?.length ? `<div class="small" style="margin-top:6px"><b>This preset needs:</b> ${preset.asks.map(esc).join(' · ')}</div>` : ''}</div></div>` : ''}

      <div class="section-title"><span class="n">1</span><h2>Basics</h2></div>
      <div class="card grid g3">
        ${field('title', 'Video title', p.title)}
        ${select('presetId', 'Preset (reusable look)', p.presetId ?? '', [['', 'Blank (no preset)'], ...S.state.presets.map((x) => [x.id, x.name])])}
        ${select('brandId', 'Brand kit', b.brandId, [...brands.map((x) => [x.id, x.name]), ['custom', 'Custom colours']])}
      </div>

      <div class="section-title"><span class="n">2</span><h2>Story</h2><span class="muted small">what it says and why</span></div>
      <div class="card grid g2">
        ${field('idea', 'Idea / goal', b.idea, {rows: 4, placeholder: 'e.g. Show agencies how to set up the white label in 3 steps, so support tickets drop.'})}
        <div class="stack">${field('audience', 'Audience', b.audience, {placeholder: 'e.g. Indian digital agencies, local business owners'})}${field('cta', 'Call to action', b.cta, {placeholder: 'e.g. Start your free trial at www.magicbolt.ai'})}</div>
        ${field('script', 'Script / voiceover text', b.script, {rows: 7, placeholder: 'Paste the script. One sentence per line works best. If you upload a voiceover, Claude transcribes it and syncs to it.'})}
        <div class="stack">${select('language', 'Language', b.language, LANGS)}${field('onScreen', 'Key on-screen text', b.onScreen, {rows: 4, placeholder: 'Headlines, prices, numbers that must appear exactly.'})}</div>
      </div>

      <div class="section-title"><span class="n">3</span><h2>Format</h2></div>
      <div class="card stack">
        <div class="chips">${SIZES.map(([l, w, h]) => `<button type="button" class="chip ${b.width === w && b.height === h ? 'on' : ''}" data-size="${w}x${h}"><i class="ar" style="width:${Math.round(w / Math.max(w, h) * 18)}px;height:${Math.round(h / Math.max(w, h) * 18)}px"></i>${l}</button>`).join('')}</div>
        <div class="grid g4">
          ${field('width', 'Width (px)', b.width, {type: 'number'})}${field('height', 'Height (px)', b.height, {type: 'number'})}
          ${select('fps', 'Frame rate', b.fps, [[24, '24 fps'], [25, '25 fps'], [30, '30 fps'], [60, '60 fps']])}
          ${field('durationSec', 'Target length (s)', b.durationSec ?? '', {type: 'number', placeholder: 'auto from voiceover'})}
        </div>
      </div>

      <div class="section-title"><span class="n">4</span><h2>Look</h2></div>
      <div class="card stack">
        <div class="spread"><label class="f" style="margin:0"><span>Colours</span></label><button type="button" class="btn ghost sm" data-action="brand-palette">Use brand palette</button></div>
        <div class="swatches" id="swatches">${(b.colors ?? []).map((c, i) => `<div class="sw" style="background:${esc(c)}" title="${esc(c)}"><input type="color" value="${esc(c)}" data-color="${i}" /><button type="button" class="x" data-action="rm-color" data-i="${i}">✕</button></div>`).join('')}<button type="button" class="sw-add" data-action="add-color" title="Add colour">＋</button></div>
        <div class="grid g2">
          ${field('style', 'Style words / mood', b.style, {placeholder: 'e.g. glossy, premium, playful, fast cuts, lots of motion'})}
          ${select('captions', 'Captions', b.captions, CAPTIONS)}
        </div>
      </div>

      <div class="section-title"><span class="n">5</span><h2>Media & references</h2><span class="muted small">voiceover, music, logo, images, footage, reference videos</span></div>
      <div class="card">
        <div class="drop" id="drop"><b>Drop files here</b> or click to upload<div class="small muted" style="margin-top:4px">Voiceovers are transcribed for timing · reference videos are turned into frames Claude can study</div></div><input type="file" id="file" multiple hidden />
        <div class="assets" id="assets"></div>
      </div>
      <div class="card grid g2" style="margin-top:16px">
        ${field('links', 'Links (one per line)', b.links, {rows: 4, placeholder: 'Websites, product pages, YouTube/Instagram references…'})}
        ${field('notes', 'Notes · do & don\'t', b.notes, {rows: 4, placeholder: 'e.g. No stock photos. Keep the logo big at the end. Prices in INR.'})}
      </div>

      <div class="sticky-bar">
        <div class="small muted" id="save-state">Changes save automatically.</div>
        <div class="row">
          ${S.cur.concepts ? '<button type="button" class="btn" data-tab="concepts">View concepts</button>' : ''}
          <button type="button" class="btn primary lg" data-action="gen-concepts" ${S.cur.busy ? 'disabled' : ''}>${S.cur.concepts ? 'Regenerate concepts' : 'Generate concepts'} →</button>
        </div>
      </div>
    </form>`;
  renderAssets();
};

const renderAssets = () => {
  const el = $('#assets');
  if (!el) return;
  const {project: p} = S.cur;
  el.innerHTML = p.assets.map((a) => {
    const url = `/public/studio/${p.id}/${encodeURIComponent(a.file)}`;
    const pv = a.kind === 'image' ? `<img src="${url}" alt="" />` : a.kind === 'video' ? `<video src="${url}#t=0.5" muted preload="metadata"></video>` : a.kind === 'audio' ? `<audio src="${url}" controls preload="none"></audio>` : '<span class="muted">file</span>';
    const info = a.info?.duration ? `${a.info.duration.toFixed(1)} s${a.info.width ? ` · ${a.info.width}×${a.info.height}` : ''}` : `${(a.size / 1024 / 1024).toFixed(1)} MB`;
    const job = S.jobText[a.file] && a.job ? `${a.job} · ${S.jobText[a.file]}` : a.job;
    const badges = [a.transcript && `<span class="pill green">transcribed · ${a.words} words</span>`, a.refDir && '<span class="pill green">frames ready</span>', job && `<span class="pill blue"><i class="dot"></i>${esc(job)}</span>`, a.jobError && `<span class="pill red" title="${esc(a.jobError)}">${esc(a.jobError.slice(0, 40))}</span>`].filter(Boolean).join('');
    return `<div class="asset"><div class="pv">${pv}</div><div class="meta">
      <div class="spread"><div class="name" title="${esc(a.original)}">${esc(a.original)}</div><button type="button" class="btn ghost sm" data-action="rm-asset" data-file="${esc(a.file)}" title="Remove">✕</button></div>
      <div class="row"><select data-role="${esc(a.file)}">${ROLES.map((r) => `<option ${r === a.role ? 'selected' : ''}>${r}</option>`).join('')}</select><span class="muted">${info}</span></div>
      ${badges ? `<div class="row">${badges}</div>` : ''}
      <input placeholder="note for Claude (optional)" value="${esc(a.note ?? '')}" data-note="${esc(a.file)}" style="padding:5px 8px;font-size:12px;border-radius:8px" />
    </div></div>`;
  }).join('');
};

let saveTimer = null, pending = {};
const queueSave = (patch) => {
  Object.assign(pending, patch);
  $('#save-state') && ($('#save-state').textContent = 'Saving…');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 500);
};
const flushSave = async () => {
  clearTimeout(saveTimer);
  if (!Object.keys(pending).length || !S.cur) return;
  const body = pending; pending = {};
  try {
    S.cur.project = await api(`/api/projects/${S.cur.project.id}`, {method: 'PATCH', body});
    $('#save-state') && ($('#save-state').textContent = 'Saved.');
    $('#crumbs') && renderProjectCrumbs();
  } catch (e) { toast(e.message); }
};
const renderProjectCrumbs = () => {
  const p = S.cur.project, preset = S.state.presets.find((x) => x.id === p.presetId);
  $('#crumbs').innerHTML = `<b>${esc(p.title)}</b> · ${esc(preset?.name ?? 'Blank')} · ${p.brief.width}×${p.brief.height}`;
};
const setBrief = (k, v) => { S.cur.project.brief[k] = v; queueSave({brief: {...(pending.brief ?? {}), [k]: v}}); };

const uploadFiles = async (files) => {
  if (!files.length) return;
  const fd = new FormData();
  for (const f of files) fd.append('files', f);
  toast(`Uploading ${files.length} file(s)…`, 60000);
  try {
    await api(`/api/projects/${S.cur.project.id}/assets`, {method: 'POST', body: fd});
    await loadProject(S.cur.project.id);
    renderAssets();
    toast('Uploaded.');
  } catch (e) { toast(e.message); }
};

// ---------- 2 · concepts ----------
const renderConcepts = () => {
  const {project: p, concepts: doc, busy} = S.cur;
  if (!doc?.concepts?.length) {
    $('#tab').innerHTML = busy || p.status === 'concepting'
      ? '<div class="card waiting"><div class="spinner"></div><h2>Claude is studying your brief</h2><p>Reading the preset, your media and links, then designing concepts and rendering real sample frames. Follow along on the right.</p></div>'
      : '<div class="card waiting"><h2>No concepts yet</h2><p>Fill the brief, then generate concepts.</p><button class="btn primary" data-tab="brief">Go to brief</button></div>';
    return;
  }
  const portrait = p.brief.height > p.brief.width;
  const approved = p.approvedConcept?.id;
  $('#tab').innerHTML = `
    ${busy ? '<div class="card row" style="margin-bottom:16px"><div class="spinner" style="width:22px;height:22px;border-width:3px;margin:0"></div><b>Claude is working…</b><span class="muted">samples refresh when done</span></div>' : ''}
    ${doc.analysis?.length ? `<div class="card" style="margin-bottom:18px"><h3>What Claude understood</h3><ul class="analysis">${[].concat(doc.analysis).map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}
    <div class="concepts">${doc.concepts.map((c) => `
      <div class="concept ${approved === c.id ? 'approved' : ''}">
        <div class="shots ${portrait ? 'portrait' : ''}">${(c.samples ?? []).map((s) => s.file ? `<div class="shot" data-zoom="/data/${p.id}/${s.file}${bust()}" data-cap="${esc(c.name)} · ${esc(s.label ?? '')}"><img loading="lazy" src="/data/${p.id}/${s.file}${bust()}" alt="" /><span>${esc(s.label ?? '')}${s.t != null ? ` · ${s.t}s` : ''}</span></div>` : '').join('') || '<div class="muted small" style="padding:20px">Samples not rendered yet.</div>'}</div>
        <div class="body">
          <div class="row"><span class="tag">${esc(c.id)}</span><h2 style="flex:1">${esc(c.name)}</h2>${approved === c.id ? '<span class="pill gold">approved</span>' : ''}</div>
          <div class="kv">${esc(c.idea ?? c.summary ?? '')}</div>
          ${c.palette?.length ? `<div class="pal">${c.palette.map((h) => `<i style="background:${esc(h)}" title="${esc(h)}"></i>`).join('')}</div>` : ''}
          ${c.fonts ? `<div class="kv"><b>Type:</b> ${esc(c.fonts)}</div>` : ''}
          ${c.motion ? `<div class="kv"><b>Motion:</b> ${esc(c.motion)}</div>` : ''}
          ${c.outline?.length ? `<details><summary class="kv" style="cursor:pointer"><b>Scene outline</b> · ${c.outline.length} scenes · ${c.outline.reduce((s, o) => s + (Number(o.sec) || 0), 0).toFixed(1)} s</summary><table class="outline">${c.outline.map((o) => `<tr><td>${esc(o.scene)}</td><td>${esc(o.what)}</td><td class="s">${o.sec ?? ''}s</td></tr>`).join('')}</table></details>` : ''}
          <div style="flex:1"></div>
          <textarea rows="2" placeholder="Notes for the build (optional)" data-notes="${esc(c.id)}"></textarea>
          <button class="btn gold block" data-action="approve" data-concept="${esc(c.id)}" ${busy ? 'disabled' : ''}>Approve “${esc(c.name)}” & build full video</button>
        </div>
      </div>`).join('')}
    </div>
    <div class="card" style="margin-top:18px">
      <h3>Not quite? Ask for another round</h3>
      <div class="row" style="margin-top:10px;align-items:flex-end">
        <textarea id="concept-feedback" rows="2" style="flex:1" placeholder="e.g. Mix A's colours with B's layout, bigger headlines, less text in the hook…"></textarea>
        <button class="btn primary" data-action="revise-concepts" ${busy ? 'disabled' : ''}>Revise concepts</button>
        <button class="btn" data-action="rerender-samples" ${busy ? 'disabled' : ''} title="Re-render the stills from the current code">↻ Stills</button>
      </div>
    </div>`;
};

// ---------- 3 · build & timing ----------
const renderBuild = () => {
  const {project: p, storyboard: sb, checks, busy} = S.cur;
  if (!sb) {
    $('#tab').innerHTML = `<div class="card waiting"><div class="spinner"></div><h2>Building “${esc(p.approvedConcept?.name ?? 'your video')}”</h2><p>Claude is writing the scenes, syncing them to the voiceover and checking frames. The timing appears here when it's ready.</p></div>`;
    return;
  }
  const total = sb.durationSec || sb.scenes?.at(-1)?.end || 1;
  const ticks = Array.from({length: 6}, (_, i) => fmtT((total * i) / 5));
  $('#tab').innerHTML = `
    ${busy ? '<div class="card row" style="margin-bottom:16px"><div class="spinner" style="width:22px;height:22px;border-width:3px;margin:0"></div><b>Claude is updating the video…</b></div>' : ''}
    <div class="card">
      <div class="spread"><h2>Timeline</h2><div class="row"><span class="pill blue">${fmtT(total)} total</span><span class="pill">${sb.scenes?.length ?? 0} scenes</span><span class="pill">${sb.width}×${sb.height} · ${sb.fps} fps</span>${(sb.audio ?? []).map((a) => `<span class="pill">♪ ${esc(a)}</span>`).join('')}</div></div>
      <div class="timeline" style="margin-top:14px">${(sb.scenes ?? []).map((s, i) => `<div style="flex:${Math.max(0.01, s.end - s.start)};background:${SCENE_COLORS[i % SCENE_COLORS.length]}" title="${esc(s.name)} · ${fmtT(s.start)}–${fmtT(s.end)}">${esc(s.name)}</div>`).join('')}</div>
      <div class="ticks">${ticks.map((t) => `<span>${t}</span>`).join('')}</div>
    </div>
    <div class="card" style="margin-top:16px;padding:8px 12px">
      <table class="sb"><thead><tr><th>#</th><th>Time</th><th>Scene</th><th>On screen</th><th>Voiceover</th><th>Visual</th></tr></thead><tbody>
      ${(sb.scenes ?? []).map((s, i) => `<tr><td><b>${s.n ?? i + 1}</b></td><td class="tm">${fmtT(s.start)} – ${fmtT(s.end)}<div class="muted small">${(s.end - s.start).toFixed(1)} s</div></td><td><b>${esc(s.name)}</b></td><td>${esc(s.onScreen)}</td><td class="muted">${esc(s.vo)}</td><td class="muted">${esc(s.visual)}</td></tr>`).join('')}
      </tbody></table>
    </div>
    ${checks.length ? `<div class="section-title"><h2>Check frames</h2><span class="muted small">rendered by Claude to verify the build · click to zoom</span></div>
      <div class="checks">${checks.map((c) => `<div class="shot" data-zoom="/data/${p.id}/${c}${bust()}" data-cap="${esc(c.split('/').pop())}"><img loading="lazy" src="/data/${p.id}/${c}${bust()}" alt="" /><span>${esc(c.split('/').pop().replace(/\.(png|jpe?g)$/, ''))}</span></div>`).join('')}</div>` : ''}
    <div class="sticky-bar"><div class="small muted">Want changes? Tell Claude in the panel on the right, e.g. “make scene 3 two seconds longer”.</div><button class="btn primary lg" data-tab="render">Preview & render →</button></div>`;
};

// ---------- text: edit src/studio/<id>/text.json directly ----------
const humanize = (k) => String(k).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
// every string leaf as [path, value]
const leaves = (v, path = []) => typeof v === 'string' ? [[path, v]]
  : Array.isArray(v) ? v.flatMap((x, i) => leaves(x, [...path, i]))
  : v && typeof v === 'object' ? Object.entries(v).filter(([k]) => !k.startsWith('_')).flatMap(([k, x]) => leaves(x, [...path, k])) : [];
const setPath = (obj, path, val) => { let o = obj; path.slice(0, -1).forEach((k) => (o = o[k])); o[path.at(-1)] = val; };

const renderText = () => {
  const {project: p, text, busy, compositions} = S.cur;
  S.textDirty = false;
  if (!text) {
    $('#tab').innerHTML = `<div class="card waiting"><h2>Text isn't editable yet for this video</h2>
      <p>Its text is still inside the code. Claude can move every headline, label and caption into one text file (look and timing stay the same). After that you can edit it here directly, with no Claude run needed.</p>
      <button class="btn primary lg" data-action="make-text-editable" ${busy ? 'disabled' : ''}>Make text editable</button></div>`;
    return;
  }
  const help = text._help ?? {};
  const groups = Object.entries(text).filter(([k]) => !k.startsWith('_'));
  const studioUrl = `http://localhost:${S.state.studioPort}/${compositions.video}`;
  $('#tab').innerHTML = `
    <div class="text-layout">
      <form id="textform" class="stack" autocomplete="off">
        ${groups.map(([g, v]) => `<div class="card"><h3 style="margin-bottom:12px">${esc(humanize(g))}</h3><div class="stack">
          ${leaves(v, [g]).map(([path, val]) => {
            const label = path.slice(1).map((k) => (typeof k === 'number' ? `#${k + 1}` : humanize(k))).join(' · ') || humanize(g);
            const hint = help[path.join('.')] ?? '';
            const long = val.length > 60 || val.includes('\n');
            const attrs = `data-path='${esc(JSON.stringify(path))}' data-orig="${esc(val)}"`;
            return `<label class="f"><span>${esc(label)}</span>${long ? `<textarea rows="3" ${attrs}>${esc(val)}</textarea>` : `<input value="${esc(val)}" ${attrs} />`}${hint ? `<em>${esc(hint)}</em>` : ''}</label>`;
          }).join('')}</div></div>`).join('')}
      </form>
      <div class="text-side">
        <div class="preview" style="height:420px"><iframe src="${studioUrl}" title="Remotion preview"></iframe></div>
        <div class="muted small" style="margin-top:8px">The preview reloads by itself a moment after you save.</div>
      </div>
    </div>
    <div class="sticky-bar">
      <div class="small muted" id="text-state">Edit any text, then save. Much longer text may need Claude to re-fit the layout.</div>
      <div class="row">
        <button class="btn" data-action="refresh-checks" title="Re-render the check frames with the new text">↻ Check frames</button>
        <button class="btn primary lg" data-action="save-text" id="save-text" disabled>Save text</button>
      </div>
    </div>`;
};

// ---------- audio: edit src/studio/<id>/audio.json (voiceover + music) ----------
const audioUrl = (src) => `/public/${String(src).split('/').map(encodeURIComponent).join('/')}`;
const baseName = (src) => String(src).split('/').pop();
const AUDIO_SLOTS = {
  voiceover: ['Voiceover', 'The spoken track. The scene timing is built around it.'],
  music: ['Background music', 'Plays under the voiceover. Loops to fill the video and lowers while the voice speaks.'],
};

const srcSelect = (slot, cur) => {
  const {project: p} = S.cur;
  const mine = p.assets.filter((a) => a.kind === 'audio' || a.kind === 'video').map((a) => [`studio/${p.id}/${a.file}`, a.original]);
  const lib = (S.audioLib ?? []).map((f) => [f.src, f.src]);
  const known = new Set([...mine, ...lib].map(([v]) => v));
  const opt = ([v, l]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`;
  return `<select data-a="${slot}.src"><option value="">${slot === 'music' ? 'No music' : 'No voiceover'}</option>
    ${cur && !known.has(cur) ? opt([cur, baseName(cur)]) : ''}
    ${mine.length ? `<optgroup label="Uploaded to this video">${mine.map(opt).join('')}</optgroup>` : ''}
    ${lib.length ? `<optgroup label="Library (public folder)">${lib.map(opt).join('')}</optgroup>` : ''}</select>`;
};
const aNum = (name, v, {min = 0, step = 0.1, ph = ''} = {}) => `<input type="number" data-a="${name}" min="${min}" step="${step}" value="${v ?? ''}" placeholder="${esc(ph)}" />`;
const aRange = (name, label, v) => `<label class="f"><span>${label} <b data-out="${name}">${Math.round(v * 100)}%</b></span><input type="range" min="0" max="100" step="1" data-a="${name}" value="${Math.round(v * 100)}" /></label>`;

const audioCard = (slot, t) => {
  const [title, sub] = AUDIO_SLOTS[slot];
  const music = slot === 'music';
  return `<div class="card"><div class="spread"><div><h3>${title}</h3><div class="muted small">${sub}</div></div><label class="chk"><input type="checkbox" data-a="${slot}.muted" ${t.muted ? 'checked' : ''} /> Mute</label></div>
    <div class="stack" style="margin-top:14px">
      <label class="f"><span>Sound file</span>${srcSelect(slot, t.src)}</label>
      <div class="row">
        <button type="button" class="btn sm" data-action="audio-upload" data-slot="${slot}">Upload new…</button>
        <input type="file" accept="audio/*,video/*" hidden data-audio-file="${slot}" />
        ${t.src ? `<audio class="aud-player" src="${audioUrl(t.src)}" controls preload="none"></audio><span class="muted small">${t.durationSec ? `${fmtT(t.durationSec)} long` : ''}</span>` : ''}
      </div>
      ${aRange(`${slot}.volume`, 'Volume', t.volume)}
      <div class="aud-grid">
        <label class="f"><span>Starts at (s)</span>${aNum(`${slot}.startSec`, t.startSec)}<em>on the video timeline</em></label>
        <label class="f"><span>Play from (s)</span>${aNum(`${slot}.trimStartSec`, t.trimStartSec)}<em>skip the start of the file</em></label>
        <label class="f"><span>Play until (s)</span>${aNum(`${slot}.trimEndSec`, t.trimEndSec, {ph: 'to the end'})}<em>cut the end of the file</em></label>
      </div>
      ${music ? `
      <div class="aud-grid two">
        <label class="f"><span>Fade in (s)</span>${aNum('music.fadeInSec', t.fadeInSec)}</label>
        <label class="f"><span>Fade out (s)</span>${aNum('music.fadeOutSec', t.fadeOutSec)}</label>
      </div>
      <div class="row" style="gap:22px">
        <label class="chk"><input type="checkbox" data-a="music.loop" ${t.loop ? 'checked' : ''} /> Loop to fill the video</label>
        <label class="chk"><input type="checkbox" data-a="music.duck" ${t.duck ? 'checked' : ''} /> Lower under the voiceover</label>
      </div>
      ${aRange('music.duckLevel', 'Music level while the voice speaks', t.duckLevel)}` : ''}
    </div></div>`;
};

const renderAudio = () => {
  const {project: p, audio, busy, compositions} = S.cur;
  S.audioDirty = false;
  if (!audio) {
    $('#tab').innerHTML = `<div class="card waiting"><h2>Audio isn't editable yet for this video</h2>
      <p>Turn on the audio controls to swap the voiceover or music, set volumes and fades, lower the music under the voice, and trim or move either track. Look and timing stay the same. A video that plays its own sound needs one quick Claude pass first.</p>
      <button class="btn primary lg" data-action="make-audio-editable" ${busy ? 'disabled' : ''}>Make audio editable</button></div>`;
    return;
  }
  if (!S.audioLib) {
    S.audioLib = [];
    api('/api/audio-library').then((l) => { S.audioLib = l; if (S.tab === 'audio' && !S.audioDirty && S.cur?.audio) renderAudio(); }).catch(() => {});
  }
  const studioUrl = `http://localhost:${S.state.studioPort}/${compositions.video}`;
  $('#tab').innerHTML = `
    ${S.voChanged === p.id ? `<div class="card spread" style="margin-bottom:16px;border:2px solid var(--gold)"><div><b>You changed the voiceover.</b><div class="muted small">The scenes were timed to the old one. Claude can re-time them to the new voiceover (the look stays the same).</div></div><button class="btn gold" data-action="resync-timing" ${busy ? 'disabled' : ''}>Re-sync timing with Claude</button></div>` : ''}
    <div class="text-layout">
      <form id="audioform" class="stack" autocomplete="off" onsubmit="return false">
        ${audioCard('voiceover', audio.voiceover)}
        ${audioCard('music', audio.music)}
      </form>
      <div class="text-side">
        <div class="preview" style="height:420px"><iframe src="${studioUrl}" title="Remotion preview"></iframe></div>
        <div class="muted small" style="margin-top:8px">Save, then press play in the preview to hear the mix. The same settings go into the next render.</div>
      </div>
    </div>
    <div class="sticky-bar">
      <div class="small muted" id="audio-state">Change anything, then save. A new voiceover does not move the scenes by itself.</div>
      <button class="btn primary lg" data-action="save-audio" id="save-audio" disabled>Save audio</button>
    </div>`;
};
// current form values, shaped like audio.json (volumes are 0..1)
const readAudioForm = () => {
  const out = {voiceover: {}, music: {}};
  document.querySelectorAll('#audioform [data-a]').forEach((el) => {
    const [slot, key] = el.dataset.a.split('.');
    out[slot][key] = el.type === 'checkbox' ? el.checked
      : el.type === 'range' ? Number(el.value) / 100
      : el.type === 'number' ? (el.value === '' ? (key === 'trimEndSec' ? null : 0) : Number(el.value))
      : key === 'src' ? (el.value || null) : el.value;
  });
  return out;
};
const saveAudio = async (form, {voChanged} = {}) => {
  const id = S.cur.project.id;
  const before = S.cur.audio?.voiceover?.src ?? null;
  S.cur.audio = await api(`/api/projects/${id}/audio`, {method: 'PUT', body: {audio: form}});
  if (voChanged || (S.cur.audio.voiceover?.src ?? null) !== before) S.voChanged = id;
  renderAudio();
};

// ---------- background: ask Claude to add animated objects behind the scenes ----------
const BG_KINDS = [['icons', 'Glossy 3D icons', 'brand-style icons floating by'], ['sparkles', 'Sparkles & particles', 'soft glints and dust'], ['blobs', 'Gradient blobs', 'blurred colour that drifts'], ['shapes', 'Floating shapes', 'rings, pills, rounded shapes'], ['grid', 'Moving grid', 'slow dotted or line pattern']];
// ---------- style: palette colours in style.json, saved as you pick ----------
const renderStyle = () => {
  const {project: p, style, busy, compositions} = S.cur;
  if (!style) {
    $('#tab').innerHTML = `<div class="card waiting"><h2>Colours aren't editable yet for this video</h2>
      <p>Claude can move the main palette colours into one file. After that you pick colours here and see them in the preview, with no Claude run. Look and timing stay the same.</p>
      <button class="btn primary lg" data-action="make-style-editable" ${busy ? 'disabled' : ''}>Make colours editable</button></div>`;
    return;
  }
  const studioUrl = `http://localhost:${S.state.studioPort}/${compositions.video}`;
  const changed = Object.keys(style.colors).some((k) => style.colors[k] !== style._defaults?.[k]);
  $('#tab').innerHTML = `
    <div class="text-layout">
      <div class="stack">
        <div class="card"><div class="spread"><div><h3>Brand colours</h3><div class="muted small">Changes save as you pick and show in the preview. Soft tints and shadows follow only partly; Claude can re-tune them.</div></div>
          <button class="btn sm ghost" data-action="reset-style" ${changed ? '' : 'disabled'}>Reset colours</button></div>
          <div class="stack" id="styleform" style="margin-top:14px">${Object.entries(style.colors).map(([k, v]) => `
            <div class="row" style="gap:12px;flex-wrap:nowrap"><input type="color" data-sc="${k}" value="${esc(v)}" style="width:54px;height:40px;padding:2px;flex:none" />
              <div style="flex:1;min-width:0"><b>${esc(style._labels?.[k] ?? k)}</b><div class="muted small"><span data-sout="${k}">${esc(v)}</span>${style._defaults?.[k] && style._defaults[k] !== v ? ` · was ${esc(style._defaults[k])}` : ''}</div></div></div>`).join('')}
          </div>
        </div>
        <div class="card"><h3>Logo, fonts, captions</h3>
          <div class="muted small" style="margin:4px 0 12px">These need design changes in the video, so Claude does them. Describe what you want.</div>
          <textarea id="style-request" rows="2" placeholder="e.g. use the white version of the logo on dark scenes, bolder headline font, add word-by-word captions"></textarea>
          <div style="margin-top:10px"><button class="btn primary" data-action="style-request" ${busy ? 'disabled' : ''}>Ask Claude</button></div>
        </div>
      </div>
      <div class="text-side">
        <div class="preview" style="height:420px"><iframe src="${studioUrl}" title="Remotion preview"></iframe></div>
        <div class="muted small" style="margin-top:8px">The preview reloads by itself a moment after each change.</div>
      </div>
    </div>`;
};

// live controls of an existing background layer (background.json): saved straight away, no Claude run
const bgControls = (b) => `<div class="card" id="bgctl"><div class="spread"><div><h3>Background controls</h3><div class="muted small">Changes save as you go and show in the preview.</div></div>
  <label class="chk"><input type="checkbox" data-bgs="enabled" ${b.enabled !== false ? 'checked' : ''} /> Show objects</label></div>
  <div class="aud-grid two" style="margin-top:14px">
    <label class="f"><span>Amount <b data-bgout="opacity">${Math.round((b.opacity ?? 1) * 100)}%</b></span><input type="range" min="0" max="150" step="5" data-bgs="opacity" value="${Math.round((b.opacity ?? 1) * 100)}" /></label>
    <label class="f"><span>Speed <b data-bgout="speed">${Math.round((b.speed ?? 1) * 100)}%</b></span><input type="range" min="10" max="400" step="10" data-bgs="speed" value="${Math.round((b.speed ?? 1) * 100)}" /></label>
  </div></div>`;
const renderBackground = () => {
  const {project: p, busy, compositions} = S.cur;
  const f = S.bgForm ??= {objects: ['icons', 'sparkles'], custom: '', placement: 'behind', intensity: 'subtle', colors: '', scenes: ''};
  const studioUrl = `http://localhost:${S.state.studioPort}/${compositions.video}`;
  $('#tab').innerHTML = `
    <div class="text-layout">
      <div class="stack">
      ${S.cur.background ? bgControls(S.cur.background) : ''}
      <form id="bgform" class="stack" autocomplete="off" onsubmit="return false">
        <div class="card"><h3>${S.cur.background ? 'Change or add objects' : 'Animated background objects'}</h3>
          <div class="muted small" style="margin:4px 0 14px">For a video whose background is flat or still. Claude adds the objects as a separate layer behind your scenes. Text, timing and sound stay the same. If a scene already has a moving background, Claude leaves it alone and tells you.</div>
          <div class="stack">
            <div><div class="small" style="font-weight:600;color:var(--slate);margin-bottom:8px">What should float and move?</div>
              <div class="row" style="gap:14px 22px">${BG_KINDS.map(([k, l, h]) => `<label class="chk" title="${esc(h)}"><input type="checkbox" data-bg="objects" value="${k}" ${f.objects.includes(k) ? 'checked' : ''} /> ${l}</label>`).join('')}</div></div>
            <label class="f"><span>Or describe your own</span><textarea rows="2" data-bg="custom" placeholder="e.g. floating chat bubbles and rupee coins, tiny QR codes drifting up">${esc(f.custom)}</textarea></label>
            <div class="aud-grid two">
              <label class="f"><span>Where</span><select data-bg="placement"><option value="behind" ${f.placement === 'behind' ? 'selected' : ''}>Behind everything</option><option value="edges" ${f.placement === 'edges' ? 'selected' : ''}>Only around the edges, clear of content</option></select></label>
              <label class="f"><span>Intensity</span><select data-bg="intensity">${[['subtle', 'Subtle: barely noticed'], ['medium', 'Medium: clearly alive'], ['lively', 'Lively: energetic']].map(([k, l]) => `<option value="${k}" ${f.intensity === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
            </div>
            <div class="aud-grid two">
              <label class="f"><span>Colours</span><input data-bg="colors" value="${esc(f.colors)}" placeholder="brand colours (default) or e.g. gold and blue" /></label>
              <label class="f"><span>Scenes</span><input data-bg="scenes" value="${esc(f.scenes)}" placeholder="all scenes (default) or e.g. Hook, CTA" /></label>
            </div>
          </div>
        </div>
      </form>
      </div>
      <div class="text-side">
        <div class="preview" style="height:420px"><iframe src="${studioUrl}" title="Remotion preview"></iframe></div>
        <div class="muted small" style="margin-top:8px">The preview updates as Claude works. Ask for tweaks in the chat panel, e.g. “slower, fewer objects”.</div>
      </div>
    </div>
    <div class="sticky-bar">
      <div class="small muted">${busy ? '<i class="dot"></i> Claude is working on this video…' : 'Claude will check the scenes, add the layer, and render check frames to review.'}</div>
      <button class="btn primary lg" data-action="add-background" ${busy ? 'disabled' : ''}>Add background objects</button>
    </div>`;
};
const readBgForm = () => {
  const f = {objects: [], custom: '', placement: 'behind', intensity: 'subtle', colors: '', scenes: ''};
  document.querySelectorAll('#bgform [data-bg]').forEach((el) => { if (el.dataset.bg === 'objects') { if (el.checked) f.objects.push(el.value); } else f[el.dataset.bg] = el.value; });
  return f;
};

// ---------- 4 · preview & render ----------
const renderRender = () => {
  const {project: p, compositions, busy} = S.cur;
  const j = S.renderJob?.projectId === p.id ? S.renderJob : null;
  const studioUrl = `http://localhost:${S.state.studioPort}/${compositions.video}`;
  const pct = Math.round((j?.progress ?? 0) * 100);
  const outDir = S.state.settings?.outDir ?? '';
  $('#tab').innerHTML = `
    <div class="spread" style="margin-bottom:12px"><div class="row"><h2>Live preview</h2><span class="muted small">Remotion Studio · updates as Claude edits</span></div><a class="btn ghost sm" href="${studioUrl}" target="_blank" rel="noopener">Open full screen ↗</a></div>
    <div class="preview"><iframe src="${studioUrl}" title="Remotion preview"></iframe></div>
    <div class="card" style="margin-top:16px">
      <div class="spread">
        <div><h2>Render</h2><div class="muted small">Draft = half resolution, quick check. Final = full quality H.264.</div></div>
        <div class="row">
          <button class="btn" data-action="render" data-draft="1" ${j && !j.done ? 'disabled' : ''}>Draft render</button>
          <button class="btn primary" data-action="render" ${j && !j.done ? 'disabled' : ''}>Final render (MP4)</button>
          ${j && !j.done ? '<button class="btn ghost danger" data-action="cancel-render">Cancel</button>' : ''}
        </div>
      </div>
      <div class="row" style="margin-top:14px;gap:8px;flex-wrap:wrap">
        <span class="small"><b>Output folder</b></span>
        <input id="out-dir" style="flex:1;min-width:220px" placeholder="Not set: renders stay inside the studio (use Download)" value="${esc(outDir)}" />
        <button class="btn sm" data-action="pick-folder">Browse…</button>
        <button class="btn sm" data-action="save-folder">Save</button>
        ${outDir ? '<button class="btn sm ghost" data-action="open-folder">Open</button>' : ''}
      </div>
      ${j ? `<div style="margin-top:14px"><div class="spread small"><b>${j.stage === 'error' ? `Failed: ${esc(j.error)}` : j.done ? `Done${j.exported ? ` · saved to ${esc(j.exported)}` : ''}${j.exportError ? ` · copy to output folder failed: ${esc(j.exportError)}` : ''}` : `${esc(j.stage)}${j.frames ? ` · frame ${j.frames}/${j.total}` : ''}`}</b><span>${pct}%</span></div><div class="bar" style="margin-top:6px"><i style="width:${pct}%"></i></div></div>` : ''}
    </div>
    ${p.renders.length ? `<div class="section-title"><h2>Renders</h2></div><div class="renders">${p.renders.map((r) => `
      <div class="card" style="padding:12px"><video src="/data/${p.id}/${r.file}" controls preload="metadata"></video>
        <div class="spread" style="margin-top:10px"><div class="small"><b>${r.draft ? 'Draft' : 'Final'}</b> · ${fmtT(r.durationSec)} · ${r.width}×${r.height}<div class="muted">${new Date(r.at).toLocaleString()}</div>${r.exported ? `<div class="muted" title="${esc(r.exported)}">Saved: ${esc(r.exported)}</div>` : ''}</div>
          <div class="row" style="gap:6px">${r.exported ? `<button class="btn sm ghost" data-action="open-folder" data-path="${esc(r.exported)}">Show</button>` : outDir ? `<button class="btn sm ghost" data-action="export-render" data-file="${esc(r.file)}">Save to folder</button>` : ''}<a class="btn sm" href="/data/${p.id}/${r.file}" download>Download</a></div></div></div>`).join('')}</div>` : ''}
    <div class="card" style="margin-top:18px">
      <h3>Reuse this look</h3>
      <div class="muted small" style="margin:4px 0 10px">Saves the structure, style, components and timing method as a preset, so next time you only fill in the new content.</div>
      <div class="row"><input id="preset-name" style="max-width:340px" placeholder="Preset name" value="${esc(p.title)} style" /><button class="btn gold" data-action="save-preset" ${busy ? 'disabled' : ''}>Save as preset</button></div>
    </div>`;
};

// ---------- chat ----------
// tiny markdown: **bold**, `code`, "- " bullets
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/^- /gm, '• ');
const renderChat = () => {
  if (!S.cur) return;
  const log = S.cur.log ?? [];
  const items = [];
  let tools = [];
  const flush = () => {
    if (!tools.length) return;
    items.push(tools.length > 3
      ? `<details class="tools-group"><summary>⚙ ${tools.length} steps · ${esc(tools.at(-1).text)}</summary>${tools.map((t) => `<div class="tool"><b>${esc(t.tool)}</b><span>${esc(t.text)}</span></div>`).join('')}</details>`
      : tools.map((t) => `<div class="tool"><b>${esc(t.tool)}</b><span>${esc(t.text)}</span></div>`).join(''));
    tools = [];
  };
  for (const e of log) {
    if (e.kind === 'tool') { tools.push(e); continue; }
    flush();
    if (['user', 'text', 'error', 'system'].includes(e.kind)) items.push(`<div class="msg ${e.kind}">${md(e.text)}</div>`);
  }
  flush();
  const el = $('#chat-log');
  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  el.innerHTML = items.join('') || `<div class="chat-empty">This is where Claude reports what it's doing. You can also type here at any time: ask questions, give feedback on concepts, or request changes to the built video.</div>`;
  if (atBottom || renderChat.first !== S.cur.project.id) el.scrollTop = el.scrollHeight;
  renderChat.first = S.cur.project.id;
  $('#chat-head-name').textContent = aiName();
  $('#agent-state').innerHTML = S.cur.busy ? '<i class="dot"></i> working' : 'idle';
  $('#stop-btn').hidden = !S.cur.busy;
};

// ---------- events from the server ----------
const es = new EventSource('/api/events');
let refreshTimer = null;
const refresh = (full = true) => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    await loadState().catch(() => {});
    if (!S.cur) { if (!route().id) renderHome(); return; }
    await loadProject(S.cur.project.id).catch(() => {});
    if (!full) return renderChat();
    const editing = (S.tab === 'brief' && document.activeElement?.closest?.('#brief')) || (S.tab === 'text' && S.textDirty) || (S.tab === 'audio' && S.audioDirty) || (S.tab === 'background' && document.activeElement?.closest?.('#bgform')) || (S.tab === 'style' && document.activeElement?.closest?.('#style-request, #styleform'));
    if (editing) { renderAssets(); } else { renderProject(); }
    renderChat();
  }, 250);
};
es.onmessage = (m) => {
  const e = JSON.parse(m.data);
  if (e.type === 'projects') return refresh(false);
  if (e.type === 'render') { S.renderJob = e; renderRenderPill(); if (S.cur?.project.id === e.projectId && S.tab === 'render') { if (e.done) refresh(); else renderRender(); } return; }
  if (!S.cur || e.projectId !== S.cur.project.id) { if (e.type === 'agent' && e.kind === 'done') refresh(false); return; }
  if (e.type === 'project') return refresh();
  if (e.type === 'job') { if (e.file) { S.jobText[e.file] = e.text; renderAssets(); } else { toast(e.text); if (e.done) refresh(); } return; }
  if (e.type === 'agent') {
    if (e.kind === 'status') { S.cur.busy = e.busy; renderChat(); return; }
    if (e.kind === 'done') { refresh(); if (e.ok) toast(`${aiName()} finished.`); return; }
    S.cur.log.push(e);
    renderChat();
  }
};

// ---------- actions ----------
document.addEventListener('click', async (ev) => {
  const zoom = ev.target.closest('[data-zoom]');
  if (zoom) { const lb = $('#lightbox'); $('img', lb).src = zoom.dataset.zoom; $('.lb-cap', lb).textContent = zoom.dataset.cap ?? ''; lb.hidden = false; return; }
  if (ev.target.closest('#lightbox')) { $('#lightbox').hidden = true; return; }
  const tabBtn = ev.target.closest('[data-tab]');
  if (tabBtn && !tabBtn.disabled) { await flushSave(); S.tab = tabBtn.dataset.tab; go(S.cur.project.id, S.tab); return; }
  const sizeBtn = ev.target.closest('[data-size]');
  if (sizeBtn) { const [w, h] = sizeBtn.dataset.size.split('x').map(Number); setBrief('width', w); setBrief('height', h); renderBrief(); return; }
  const a = ev.target.closest('[data-action]');
  if (!a) return;
  const id = S.cur?.project.id;
  try {
    switch (a.dataset.action) {
      case 'toggle-left':
        S.leftCollapsed = !S.leftCollapsed;
        localStorage.setItem('studio-left-collapsed', S.leftCollapsed ? '1' : '0');
        applyPanelState();
        break;
      case 'toggle-right':
        S.rightCollapsed = !S.rightCollapsed;
        localStorage.setItem('studio-right-collapsed', S.rightCollapsed ? '1' : '0');
        applyPanelState();
        break;
      case 'home': go(null); break;
      case 'save-ai': {
        const v = (n) => $(`#ai-form [name="${n}"]`)?.value ?? '';
        S.state.settings = await api('/api/settings', {method: 'PUT', body: {ai: {model: v('ai-model'), baseUrl: v('ai-baseUrl'), apiKey: v('ai-apiKey')}}});
        S.aiOpen = true; renderHome(); toast('AI model saved.');
        break;
      }
      case 'clear-ai-key': S.state.settings = await api('/api/settings', {method: 'PUT', body: {ai: {apiKey: null}}}); S.aiOpen = true; renderHome(); toast('Saved key removed.'); break;
      case 'test-ai': {
        $('#ai-test').textContent = 'Testing…';
        const r = await api('/api/settings/test-ai', {method: 'POST'});
        $('#ai-test').textContent = r.ok ? `✓ ${r.text}` : `✗ ${r.text}`;
        break;
      }
      case 'new': {
        const p = await api('/api/projects', {method: 'POST', body: {presetId: a.dataset.preset || null}});
        go(p.id, 'brief');
        break;
      }
      case 'delete':
        if (confirm(`Delete "${S.cur.project.title}" with its code, uploads and renders?`)) { await api(`/api/projects/${id}`, {method: 'DELETE'}); go(null); }
        break;
      case 'stop': await api(`/api/projects/${id}/stop`, {method: 'POST'}); break;
      case 'add-color': { const c = [...S.cur.project.brief.colors, '#1582D5']; setBrief('colors', c); renderBrief(); break; }
      case 'rm-color': { const c = S.cur.project.brief.colors.filter((_, i) => i !== Number(a.dataset.i)); setBrief('colors', c); renderBrief(); break; }
      case 'brand-palette': {
        const br = S.state.brands.find((x) => x.id === S.cur.project.brief.brandId);
        if (!br) return toast('Pick a brand kit first.');
        setBrief('colors', Object.values(br.palette).slice(0, 6)); renderBrief();
        break;
      }
      case 'rm-asset': await api(`/api/projects/${id}/assets/${encodeURIComponent(a.dataset.file)}`, {method: 'DELETE'}); await loadProject(id); renderAssets(); break;
      case 'gen-concepts':
        await flushSave();
        await api(`/api/projects/${id}/concepts`, {method: 'POST', body: {}});
        S.tab = 'concepts'; go(id, 'concepts');
        break;
      case 'revise-concepts': {
        const fb = $('#concept-feedback').value.trim();
        if (!fb) return toast('Write what to change first.');
        await api(`/api/projects/${id}/concepts`, {method: 'POST', body: {feedback: fb}});
        break;
      }
      case 'rerender-samples': await api(`/api/projects/${id}/samples`, {method: 'POST'}); toast('Rendering stills…'); break;
      case 'approve': {
        const notes = $(`[data-notes="${a.dataset.concept}"]`)?.value.trim() ?? '';
        await api(`/api/projects/${id}/approve`, {method: 'POST', body: {conceptId: a.dataset.concept, notes}});
        S.tab = 'build'; go(id, 'build');
        break;
      }
      case 'render': await api(`/api/projects/${id}/render`, {method: 'POST', body: {draft: !!a.dataset.draft}}); toast('Render started.'); break;
      case 'cancel-render': await api('/api/render/cancel', {method: 'POST'}); break;
      case 'pick-folder': {
        toast('Choose a folder in the window that opened…');
        const r = await api('/api/settings/pick-folder', {method: 'POST'});
        if (!r.outDir) break;
        S.state.settings = await api('/api/settings', {method: 'PUT', body: {outDir: r.outDir}});
        renderRender(); toast('Output folder saved.');
        break;
      }
      case 'save-folder':
        S.state.settings = await api('/api/settings', {method: 'PUT', body: {outDir: $('#out-dir').value}});
        renderRender(); toast(S.state.settings.outDir ? 'Output folder saved.' : 'Output folder cleared.');
        break;
      case 'open-folder': await api('/api/settings/open-folder', {method: 'POST', body: {path: a.dataset.path}}); break;
      case 'export-render': await api(`/api/projects/${id}/renders/export`, {method: 'POST', body: {file: a.dataset.file}}); await loadProject(id); renderRender(); toast('Saved to output folder.'); break;
      case 'make-text-editable': await api(`/api/projects/${id}/make-text-editable`, {method: 'POST'}); toast('Claude is moving the text into an editable file…'); break;
      case 'save-text': {
        const next = structuredClone(S.cur.text);
        document.querySelectorAll('#textform [data-path]').forEach((el) => setPath(next, JSON.parse(el.dataset.path), el.value));
        S.cur.text = await api(`/api/projects/${id}/text`, {method: 'PUT', body: {text: next}});
        S.textDirty = false;
        document.querySelectorAll('#textform [data-path]').forEach((el) => (el.dataset.orig = el.value));
        $('#save-text').disabled = true;
        $('#text-state').textContent = 'Saved. The preview updates in a moment; render again for the final MP4.';
        toast('Text saved.');
        break;
      }
      case 'make-audio-editable': {
        const r = await api(`/api/projects/${id}/make-audio-editable`, {method: 'POST'});
        if (r.agent) { toast('Claude is moving the audio into an editable file…'); break; }
        S.cur.audio = r.audio; renderAudio(); toast('Audio controls are on.');
        break;
      }
      case 'audio-upload': document.querySelector(`[data-audio-file="${a.dataset.slot}"]`)?.click(); break;
      case 'save-audio': await saveAudio(readAudioForm()); toast('Audio saved. Press play in the preview to hear it.'); break;
      case 'resync-timing': {
        const vo = S.cur.audio?.voiceover?.src;
        await api(`/api/projects/${id}/message`, {method: 'POST', body: {text: `I replaced the voiceover with ${vo ? baseName(vo) : 'a new file'} (see audio.json; it is transcribed in the project's transcripts folder, or transcribe it if not). Re-time the video to it: update the scene starts and cues in config.ts and the storyboard so each scene lands on its sentence, keep the look, and re-render the check stills. Do not touch audio.json.`}});
        S.voChanged = null; renderAudio(); toast('Claude is re-timing the video…');
        break;
      }
      case 'make-style-editable': await api(`/api/projects/${id}/make-style-editable`, {method: 'POST'}); toast('Claude is moving the colours into an editable file…'); break;
      case 'reset-style': S.cur.style = await api(`/api/projects/${id}/style`, {method: 'PUT', body: {reset: true}}); renderStyle(); toast('Colours reset.'); break;
      case 'style-request': {
        const text = $('#style-request').value.trim();
        if (!text) return toast('Write what to change first.');
        await api(`/api/projects/${id}/message`, {method: 'POST', body: {text: `Style change for the built video: ${text}. Keep the colours in style.json, the text, timing and audio as they are unless I say otherwise; re-render a few check stills and look at them.`}});
        $('#style-request').value = ''; toast('Sent to Claude.');
        break;
      }
      case 'add-background': {
        S.bgForm = readBgForm();
        await api(`/api/projects/${id}/background`, {method: 'POST', body: S.bgForm});
        toast('Claude is adding the background objects…');
        break;
      }
      case 'refresh-checks': await api(`/api/projects/${id}/checks`, {method: 'POST'}); toast('Re-rendering check frames…'); break;
      case 'save-preset': await api(`/api/projects/${id}/save-preset`, {method: 'POST', body: {name: $('#preset-name').value}}); toast('Claude is writing the preset…'); break;
    }
  } catch (e) { toast(e.message); }
});

document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.dataset.color != null) { const c = [...S.cur.project.brief.colors]; c[Number(t.dataset.color)] = t.value; t.parentElement.style.background = t.value; setBrief('colors', c); return; }
  if (t.dataset.note != null) return;
  if (t.closest('#textform')) {
    S.textDirty = [...document.querySelectorAll('#textform [data-path]')].some((el) => el.value !== el.dataset.orig);
    $('#save-text').disabled = !S.textDirty;
    $('#text-state').textContent = S.textDirty ? 'Unsaved changes.' : 'No changes.';
    return;
  }
  if (t.dataset.sc) { const o = document.querySelector(`[data-sout="${t.dataset.sc}"]`); if (o) o.textContent = t.value.toUpperCase(); return; }
  if (t.closest('#bgctl')) { if (t.type === 'range') { const o = document.querySelector(`[data-bgout="${t.dataset.bgs}"]`); if (o) o.textContent = `${t.value}%`; } return; }
  if (t.closest('#bgform')) { S.bgForm = readBgForm(); S.bgDirty = true; return; }
  if (t.closest('#audioform')) {
    if (t.type === 'range') { const o = document.querySelector(`[data-out="${t.dataset.a}"]`); if (o) o.textContent = `${t.value}%`; }
    S.audioDirty = true;
    $('#save-audio').disabled = false;
    $('#audio-state').textContent = 'Unsaved changes.';
    return;
  }
  if (!t.closest('#brief') || !t.name) return;
  if (t.name === 'title') { S.cur.project.title = t.value; queueSave({title: t.value}); return; }
  if (t.name === 'presetId') return;
  const num = ['width', 'height', 'fps', 'durationSec'].includes(t.name);
  setBrief(t.name, num ? (t.value === '' ? null : Number(t.value)) : t.value);
});
document.addEventListener('change', async (ev) => {
  const t = ev.target;
  try {
    if (t.dataset.role) { await api(`/api/projects/${S.cur.project.id}/assets/${encodeURIComponent(t.dataset.role)}`, {method: 'PATCH', body: {role: t.value}}); return; }
    if (t.dataset.note != null) { await api(`/api/projects/${S.cur.project.id}/assets/${encodeURIComponent(t.dataset.note)}`, {method: 'PATCH', body: {note: t.value}}); return; }
    if (t.name === 'ai-provider') { S.state.settings = await api('/api/settings', {method: 'PUT', body: {ai: {provider: t.value}}}); S.aiOpen = true; renderHome(); return; }
    if (t.name === 'presetId') { await flushSave(); S.cur.project = await api(`/api/projects/${S.cur.project.id}`, {method: 'PATCH', body: {presetId: t.value}}); renderProject(); return; }
    if (t.name === 'brandId' || t.name === 'width' || t.name === 'height') { await flushSave(); renderBrief(); }
    if (t.id === 'file') uploadFiles([...t.files]);
    if (t.dataset.sc) {
      const colors = Object.fromEntries([...document.querySelectorAll('#styleform [data-sc]')].map((el) => [el.dataset.sc, el.value]));
      S.cur.style = await api(`/api/projects/${S.cur.project.id}/style`, {method: 'PUT', body: {colors}});
      renderStyle();
      return;
    }
    if (t.closest('#bgctl') && t.dataset.bgs) {
      const val = (k) => document.querySelector(`#bgctl [data-bgs="${k}"]`);
      S.cur.background = await api(`/api/projects/${S.cur.project.id}/background-settings`, {method: 'PUT', body: {enabled: val('enabled').checked, opacity: Number(val('opacity').value) / 100, speed: Number(val('speed').value) / 100}});
      return;
    }
    if (t.closest('#audioform') && t.dataset.a) { S.audioDirty = true; $('#save-audio').disabled = false; $('#audio-state').textContent = 'Unsaved changes.'; }
    if (t.dataset.audioFile) {
      const slot = t.dataset.audioFile, f = t.files[0];
      if (!f) return;
      const form = readAudioForm(), id = S.cur.project.id;
      const fd = new FormData(); fd.append('role', slot); fd.append('files', f);
      toast(`Uploading ${f.name}…`, 60000);
      const assets = await api(`/api/projects/${id}/assets`, {method: 'POST', body: fd});
      form[slot].src = `studio/${id}/${assets.at(-1).file}`;
      form[slot].trimStartSec = 0; form[slot].trimEndSec = null;
      await loadProject(id);
      await saveAudio(form, {voChanged: slot === 'voiceover'});
      toast(slot === 'voiceover' ? 'New voiceover set. Re-sync the timing when you are ready.' : 'Music set and saved.');
    }
  } catch (e) { toast(e.message); }
});

// drag & drop uploads
document.addEventListener('dragover', (e) => { const d = e.target.closest?.('#drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
document.addEventListener('dragleave', (e) => e.target.closest?.('#drop')?.classList.remove('over'));
document.addEventListener('drop', (e) => { const d = e.target.closest?.('#drop'); if (!d) return; e.preventDefault(); d.classList.remove('over'); uploadFiles([...e.dataTransfer.files]); });
document.addEventListener('click', (e) => { if (e.target.closest('#drop')) $('#file')?.click(); });

// chat input
$('#chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ta = $('#chat-text'), text = ta.value.trim();
  if (!text || !S.cur) return;
  try { await flushSave(); await api(`/api/projects/${S.cur.project.id}/message`, {method: 'POST', body: {text}}); ta.value = ''; } catch (err) { toast(err.message); }
});
$('#chat-text').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chat-form').requestSubmit(); } });
window.addEventListener('beforeunload', () => flushSave());

load();
