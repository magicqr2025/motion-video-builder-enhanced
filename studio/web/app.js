// MotionStudio by MagicBolt.ai: browser side. Plain JS modules, no build step.
import {initTools, renderTools, toolsChanged} from './tools.js';
import {initStorage, renderStorage} from './storage.js';
import {initReview, reviewHtml, reviewEditing} from './review.js';
import {initFiles} from './files.js';
import {initStory, storyHTML, renderStory, storyRunning, stopStoryRun, aiFilled, usageHTML} from './story.js';
import {initActivity, onServerEvent, note, setConnection, refreshContext} from './activity.js';
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const api = async (url, opts = {}) => {
  const res = await fetch(url, {headers: opts.body && !(opts.body instanceof FormData) ? {'Content-Type': 'application/json'} : {}, ...opts, body: opts.body && !(opts.body instanceof FormData) ? JSON.stringify(opts.body) : opts.body}).catch((e) => {
    note(`Could not reach the studio server for ${opts.method ?? 'GET'} ${url.split('?')[0]}. Is the MotionStudio window still open?`, {level: 'error', source: 'system'});
    throw e;
  });
  const j = await res.json().catch(() => ({}));
  if (res.status === 401 && j.login) { location.replace(`/login?next=${encodeURIComponent(location.pathname + location.hash)}`); throw new Error('Sign in required.'); }
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
  $('#ni-chat')?.setAttribute('aria-pressed', String(!S.rightCollapsed));
};
applyPanelState();
// collapsible menu sections (remembered)
const foldKey = (k) => `studio-fold-${k}`;
const setFold = (sec, folded) => { sec.classList.toggle('folded', folded); sec.querySelector('.sec-head')?.setAttribute('aria-expanded', String(!folded)); };
document.querySelectorAll('.side-sec').forEach((sec) => { try { setFold(sec, localStorage.getItem(foldKey(sec.dataset.sec)) === '1'); } catch { /* storage unavailable */ } });

// ---------- theme and full screen (top right) ----------
const applyTheme = (t) => {
  document.documentElement.dataset.theme = t === 'dark' ? 'dark' : 'light';
  try { localStorage.setItem('studio-theme', t === 'dark' ? 'dark' : 'light'); } catch { /* storage unavailable */ }
  const b = $('#theme-btn');
  if (b) { b.title = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'; b.setAttribute('aria-pressed', String(t === 'dark')); }
};
applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
document.addEventListener('fullscreenchange', () => { const b = $('#fs-btn'); if (b) { b.classList.toggle('is-fs', !!document.fullscreenElement); b.title = document.fullscreenElement ? 'Exit full screen' : 'Full screen'; } });

// ---------- who is signed in (top right) ----------
(async () => {
  try {
    const {user} = await (await fetch('/api/session')).json();
    if (!user) return;
    $('#uc-av').textContent = (user.name || user.username).trim().charAt(0).toUpperCase();
    $('#uc-name').textContent = user.name || user.username;
    const left = user.daysLeft;
    $('#uc-exp').textContent = left <= 0 ? 'expires today' : left <= 14 ? `expires in ${left} day${left === 1 ? '' : 's'}` : `until ${user.expiresAt}`;
    $('#user-chip').classList.toggle('soon', left <= 14);
    $('#user-chip').title = `Signed in as ${user.username}. Access runs until ${user.expiresAt}.`;
    $('#user-chip').hidden = false;
  } catch { /* the chip is optional */ }
})();

// ---------- routing ----------
const route = () => {
  const [, kind, id, tab] = location.hash.split('/');
  if (kind === 'tools') return {id: null, tools: true};
  if (kind === 'storage') return {id: null, storage: true};
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
  if (r.tools) { S.cur = null; $('#chat').hidden = true; $('#crumbs').innerHTML = '<b>Video tools</b> · video to script &amp; MP3'; note('Opened Video tools.', {projectId: null}); await renderTools(); refreshContext(); return; }
  if (r.storage) { S.cur = null; $('#chat').hidden = true; $('#crumbs').innerHTML = '<b>Storage</b> · files and clean-up'; note('Opened Storage.', {projectId: null}); await renderStorage(); refreshContext(); return; }
  if (!r.id) { S.cur = null; note('Opened the home page.', {projectId: null}); renderHome(); renderChat(); refreshContext(); return; }
  try { await loadProject(r.id); } catch { note(`Could not open video “${r.id}” (it no longer exists). Going home.`, {level: 'warn', projectId: null}); go(null); return; }
  S.tab = r.tab || bestTab(S.cur.project);
  note(`Opened “${S.cur.project.title}” · ${TABS.find(([k]) => k === S.tab)?.[1] ?? S.tab}`, {projectId: r.id});
  renderProject();
  renderChat();
  refreshContext();
};

// ---------- sidebar ----------
const renderSide = () => {
  const r = route();
  $('#tools-link')?.classList.toggle('on', !!r.tools);
  $('#storage-link')?.classList.toggle('on', !!r.storage);
  const all = S.state.projects, STEP = 8;
  S.sideLimit ??= STEP;
  // the open video always stays in the list, even when it is beyond the current page
  const shown = all.filter((p, i) => i < S.sideLimit || p.id === r.id);
  const left = all.length - shown.length;
  $('#projects').innerHTML = all.length
    ? shown.map((p) => {
      const [label] = STATUS[p.status] ?? [p.status];
      return `<a href="#/p/${p.id}/" class="${p.id === r.id ? 'on' : ''}" title="${esc(p.title)}"><div class="t">${p.busy ? '<i class="dot"></i>' : ''}<span>${esc(p.title)}</span></div><div class="s">${esc(label)}</div></a>`;
    }).join('')
      + (left > 0 ? `<button type="button" class="side-more" data-action="side-more">Show ${Math.min(STEP, left)} more <small>· ${left} not shown</small></button>` : '')
      + (left <= 0 && S.sideLimit > STEP ? '<button type="button" class="side-more" data-action="side-less">Show less</button>' : '')
    : '<div class="muted small" style="padding:0 10px">No videos yet.</div>';
};

const projectRunning = () => !!S.cur && (S.cur.busy || S.plannerBusy || storyRunning() || !!S.lookAI?.busy || (S.renderJob && !S.renderJob.done && S.renderJob.projectId === S.cur.project.id));
const syncHeadStop = () => { const b = $('#head-stop'); if (b) { const on = projectRunning(); b.hidden = !on; if (on) b.disabled = false; } };
const renderRenderPill = () => {
  const j = S.renderJob, el = $('#render-pill');
  if (!j || j.done) { el.hidden = true; syncHeadStop(); return; }
  el.hidden = false;
  syncHeadStop();
  el.innerHTML = `<i class="dot"></i> Rendering ${esc(j.projectId)} · ${j.stage} ${Math.round((j.progress ?? 0) * 100)}%`;
};

// ---------- home: presets ----------
const presetThumb = (pr) => `/data/_presets/${pr.id}.png`;
// ---------- AI model settings (home page) ----------
const CLAUDE_MODELS = [['', 'Default (whatever your Claude Code login uses)'], ['claude-fable-5-1', 'Fable 5.1 (most capable)'], ['claude-opus-5-5', 'Opus 5.5'], ['claude-sonnet-5-5', 'Sonnet 5.5 (faster, cheaper)'], ['claude-haiku-5-5', 'Haiku 5.5 (fastest, simplest videos)']];
const prettyModel = (id) => ({'claude-fable-5-1': 'Fable 5.1', 'claude-opus-5-5': 'Opus 5.5', 'claude-sonnet-5-5': 'Sonnet 5.5', 'claude-haiku-5-5': 'Haiku 5.5'}[id] ?? (id && id !== 'default' ? id : 'default model'));
const WHERE = {cloud: 'cloud', local: 'this PC', lan: 'local network'};
// "Claude Code · Opus 5.5" and the chip "Opus 5.5 · cloud (Anthropic servers)"
const aiRuntime = () => S.state?.settings?.ai?.runtime ?? null;
const aiTag = () => { const r = aiRuntime(); return r ? `${r.engine} · ${prettyModel(r.model)}` : null; };
const aiChip = () => {
  const r = aiRuntime();
  if (!r) return null;
  return {where: r.where, text: `${prettyModel(r.model)} · ${WHERE[r.where] ?? r.where} (${r.host})`,
    title: `${r.engine}, ${prettyModel(r.model)}.\nThe model itself runs on: ${r.host}.\nWhat it asks for (reading and writing files, commands, rendering frames) runs on: ${r.tools}.`};
};
const kTok = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n ?? 0));
const aiName = () => { const ai = S.state?.settings?.ai; return !ai || ai.provider === 'claude' ? 'Claude' : ai.provider === 'codex' ? 'Codex' : (ai.model || S.state.settings.providers[ai.provider]?.model || 'AI'); };
const aiCard = () => {
  const ai = S.state.settings?.ai ?? {};
  const label = CLAUDE_MODELS.find(([v]) => v === (ai.model ?? ''))?.[1] ?? ai.model ?? 'default';
  return `<details class="card ai-card" style="margin:0 0 22px" open>
    <summary class="spread" style="cursor:pointer"><b>AI</b><span class="muted small">Claude Code on this PC · ${esc(label)}</span></summary>
    <div id="ai-form" style="margin-top:12px;display:grid;gap:10px">
      <p class="small muted" style="margin:0">MotionStudio works through the Claude Code login on this PC. There is nothing to connect and no API key.</p>
      ${ai.signedIn === false ? '<div class="st-err">Claude Code is not signed in on this PC yet. Open a terminal, run <b>claude</b>, then type <b>/login</b> once.</div>' : ''}
      ${select('claude-model', 'Model for building videos', ai.model ?? '', CLAUDE_MODELS)}
      <p class="small muted" style="margin:-4px 0 0">Applies to every new request (concepts, builds, chat). A request already running keeps its model. If your plan does not include the model, the error shows in the chat panel; switch back to the default.</p>
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
      <p>Pick a preset or start blank. Add optional sample snapshots for visual reference, complete the brief, then develop concepts and build the video.</p>
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
const TABS = [['script', 'Reference snapshots'], ['brief', 'Brief'], ['look', 'Look & feel'], ['concepts', 'Concepts'], ['build', 'Build & timing'], ['text', 'Text'], ['style', 'Style'], ['audio', 'Audio'], ['background', 'Background'], ['render', 'Preview & render']];
const fmtStamp = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '' : d.toLocaleString(undefined, {day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'}); };
const headMeta = (p, sb) => {
  const total = sb ? (Number(sb.durationSec) || Math.max(0, ...(sb.scenes ?? []).map((x) => Number(x.end) || 0))) : 0;
  const stamp = fmtStamp(p.updatedAt);
  return `${total ? `<span class="pill blue" title="Total video length">⏱ ${fmtT(total)}</span>` : ''}${stamp ? `<span class="muted small" title="Last updated ${esc(new Date(p.updatedAt).toLocaleString())}">Updated ${esc(stamp)}</span>` : ''}`;
};
const tabEnabled = (t, p, cur) => !(S.plannerBusy && t === 'brief') && (t === 'script' || t === 'brief' || t === 'look' || (t === 'concepts' && (cur.concepts || p.status !== 'brief')) || (t === 'build' && (cur.storyboard || cur.resumable || ['building', 'review', 'rendering', 'done'].includes(p.status))) || ((t === 'render' || t === 'text' || t === 'audio' || t === 'background' || t === 'style') && cur.storyboard));
const tabDone = (t, p) => ({brief: p.status !== 'brief', look: !!p.look?.reviewed, concepts: !!p.approvedConcept, build: !!p.approval, text: false, style: false, audio: false, background: false, render: p.renders.length > 0}[t]);

const renderProject = () => {
  const {project: p} = S.cur;
  const [label, tone] = STATUS[p.status] ?? [p.status, ''];
  const preset = S.state.presets.find((x) => x.id === p.presetId);
  $('#crumbs').innerHTML = `<b>${esc(p.title)}</b> · ${esc(preset?.name ?? 'Blank')} · ${p.brief.width}×${p.brief.height}`;
  $('#chat').hidden = false;
  const tabs = TABS.map(([k, l], i) => `<button data-tab="${k}" class="${S.tab === k ? 'on' : ''} ${tabDone(k, p) ? 'done' : ''}" ${tabEnabled(k, p, S.cur) ? '' : 'disabled'}><span class="k">${tabDone(k, p) ? '✓' : i + 1}</span>${l}</button>`).join('');
  $('#main').innerHTML = `
    <div class="spread">
      <div class="row"><h1 style="font-size:24px">${esc(p.title)}</h1><span class="pill ${tone}">${S.cur.busy ? '<i class="dot"></i>' : ''}${esc(label)}</span>${headMeta(p, S.cur.storyboard)}<button class="btn sm stop-all" id="head-stop" data-action="stop-all" title="Stop everything running for this video (stops AI usage and renders)" hidden>■ Stop</button></div>
      <div class="row"><span class="muted small" title="${p.tokens ? esc(`Written ${kTok(p.tokens.output)} · new input ${kTok((p.tokens.input ?? 0) + (p.tokens.cacheWrite ?? 0))} · re-read from cache ${kTok(p.tokens.cacheRead ?? 0)}`) : ''}">${p.cost ? `usage ≈ $${p.cost.toFixed(2)}` : ''}${p.tokens ? `${p.cost ? ' · ' : 'usage '}${kTok((p.tokens.input ?? 0) + (p.tokens.output ?? 0) + (p.tokens.cacheWrite ?? 0))} tokens` : ''}</span><button class="btn ghost sm danger" data-action="delete">Delete</button></div>
    </div>
    <div class="tabs">${tabs}</div>
    <div id="tab"></div>`;
  syncHeadStop();
  ({script: renderScriptPlanner, brief: renderBrief, look: renderLook, concepts: renderConcepts, build: renderBuild, text: renderText, style: renderStyle, audio: renderAudio, background: renderBackground, render: renderRender}[S.tab] ?? renderBrief)();
};

const renderScriptPlanner = () => {
  const {project: p} = S.cur;
  const refs = p.assets.filter((a) => a.kind === 'video');
  $('#tab').innerHTML = `<div class="hero" style="padding:22px 0 10px"><h1 style="font-size:26px">Reference snapshots</h1><p>Upload a sample video to capture one frame per second for visual reference. Snapshots are created locally; script and AI analysis are not run here.</p></div>
    <div class="card stack">
      <div class="spread"><div><b>Sample video</b><div class="small muted">Frames are captured locally at one-second intervals and duplicate frames are removed.</div></div><button type="button" class="btn primary" data-action="planner-upload">Upload video</button></div>
      <input type="file" id="planner-file" accept="video/*" hidden />
      ${refs.length ? `<div class="grid g2">${refs.map((a) => {
        const frames = S.cur.referenceFrames?.[a.file] ?? [];
        const frameCards = frames.map((frame) => `<div class="planner-frame"><img loading="lazy" src="/data/${encodeURIComponent(p.id)}/${a.refDir.split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(frame)}" alt="Sample frame at ${esc(frame.match(/f-(\d+\.\d+)s/)?.[1] || '')} seconds"><div class="spread"><small>${esc(frame.match(/f-(\d+\.\d+)s/)?.[1] || '')}s</small><button type="button" class="btn ghost sm danger" data-action="planner-delete-frame" data-video="${esc(a.file)}" data-frame="${esc(frame)}">Delete</button></div></div>`).join('');
        return `<div class="card stack" style="margin:0"><div class="spread"><span><b>${esc(a.original)}</b><small class="muted" style="display:block">${a.refDir ? `${frames.length} unique snapshots - one per second` : esc(a.job || 'Preparing snapshots...')}</small></span>${a.jobError ? `<span class="pill red" title="${esc(a.jobError)}">Snapshot error</span>` : ''}</div>${frames.length ? `<details open><summary class="small">Review or remove snapshots</summary><div class="planner-frames">${frameCards}</div></details>` : ''}</div>`;
      }).join('')}</div>` : '<div class="muted small">No sample videos yet. Upload a video to create reference snapshots.</div>'}</div>
    <div class="sticky-bar"><span class="small muted">Snapshot capture runs locally and does not call an AI model.</span><button type="button" class="btn primary" data-tab="brief">Continue to brief</button></div>`;
};

const updatePlannerWait = () => {
  const label = $('#planner-wait');
  if (!label || !S.plannerStartedAt) return;
  const elapsed = Math.floor((Date.now() - S.plannerStartedAt) / 1000);
  const selected = S.cur?.project?.brief?.plannerRefs ?? [];
  const frameCount = selected.reduce((n, file) => n + (S.cur?.referenceFrames?.[file]?.length || 0), 0);
  // A deliberately broad estimate: model speed varies substantially, especially for local vision models.
  const estimate = 30 + frameCount * 2;
  const clock = (seconds) => `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
  const step = S.plannerAborting ? 'Cancelling analysis…' : S.plannerProgress?.message || 'Preparing analysis…';
  const count = S.plannerProgress?.total ? ` · ${S.plannerProgress.completed || 0}/${S.plannerProgress.total} frames` : '';
  label.textContent = elapsed < estimate
    ? `${step}${count} · elapsed ${clock(elapsed)} · rough total ${clock(estimate)}; check back in about ${clock(estimate - elapsed)}. Timing varies by model.`
    : `Still analyzing · elapsed ${clock(elapsed)} · the rough ${clock(estimate)} estimate has passed. Check back in about a minute.`;
};
const updatePlannerPreflight = () => {
  const label = $('#planner-preflight');
  if (!label) return;
  const selected = S.cur?.project?.brief?.plannerRefs ?? [];
  const count = selected.reduce((n, file) => n + (S.cur?.referenceFrames?.[file]?.length || 0), 0);
  if (!count) { label.textContent = 'Select a sample video to include its snapshots in analysis. Script-only requests are usually quicker.'; return; }
  const seconds = 30 + count * 2;
  label.textContent = `${count} snapshots selected · about ${Math.ceil(count / 8)} analysis batches · rough estimate ${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s, depending on the model.`;
};

// ---------- 1 · brief ----------
const field = (name, label, value, {type = 'text', rows, placeholder = '', hint = ''} = {}) => `
  <label class="f${aiFilled(name) ? ' ai-filled' : ''}"><span>${label}</span>${rows ? `<textarea name="${name}" rows="${rows}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>` : `<input name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" />`}${hint ? `<em>${hint}</em>` : ''}</label>`;
const select = (name, label, value, opts) => `<label class="f"><span>${label}</span><select name="${name}">${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o || '(preset default)']; return `<option value="${esc(v)}" ${String(v) === String(value ?? '') ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`;

initStory({S, api: (...a) => api(...a), toast: (...a) => toast(...a), field, select, LANGS, flushSave: () => flushSave(), setBrief: (...a) => setBrief(...a), aiTag, onBusy: () => syncHeadStop(), onChange: () => updateRail(), onFilled: () => renderProject()});
const OUT_FORMATS = [['mp4', 'MP4', 'video with sound'], ['gif', 'GIF', 'loops · no sound'], ['webp', 'WebP', 'animated · no sound']];
const ANIM_SIZES = [[480, 'Small', '480 px'], [720, 'Medium', '720 px'], [1080, 'Large', '1080 px']];
const ANIM_FPS_OPTS = [[10, '10 fps', 'smallest'], [15, '15 fps'], [24, '24 fps', 'smoothest']];
const outFmt = (b) => (OUT_FORMATS.some((o) => o[0] === b.outputFormat) ? b.outputFormat : 'mp4');
const outputPicker = (b) => {
  const f = outFmt(b), anim = f !== 'mp4', secs = Number(b.durationSec) || Math.round(((String(b.script ?? '').trim().match(/\S+/g) ?? []).length) / 2.5);
  return `${optField('Output format', optGroup('data-outfmt', f, OUT_FORMATS), f === 'mp4' ? 'Best quality, with sound. Use for YouTube, Instagram, WhatsApp and ads.' : f === 'gif' ? 'Works everywhere, even in email and chat. Large files and 256 colours, so keep it short.' : 'Smaller and sharper than GIF. Works in browsers, WhatsApp and most apps.', 'outputFormat')}
    ${anim ? `<div class="anim-opts">${optField('Animation size', optGroup('data-animw', Number(b.animWidth) || 480, ANIM_SIZES))}${optField('Animation frame rate', optGroup('data-animfps', Number(b.animFps) || 15, ANIM_FPS_OPTS))}
      ${secs > 20 ? `<div class="st-note" style="grid-column:1/-1">This is about ${secs} seconds long. ${f.toUpperCase()}s that long make very large files. Under 15 seconds works best, or use MP4.</div>` : ''}</div>` : ''}`;
};
const BSECS = [['basics', 1, 'Basics'], ['story', 2, 'Story'], ['format', 3, 'Format'], ['look', 4, 'Look'], ['media', 5, 'Media']];
const bsecFolded = (k) => { try { return localStorage.getItem(`studio-bsec-${k}`) === '1'; } catch { return false; } };
const bsec = (key, n, title, sub, summary, body) => `
  <section class="bsec ${bsecFolded(key) ? 'folded' : ''}" data-bsec="${key}" id="bsec-${key}">
    <button type="button" class="bsec-head" data-action="bsec-fold" aria-expanded="${!bsecFolded(key)}"><span class="n">${n}</span><span class="bt"><b>${title}</b><small>${sub}</small></span><span class="bsum">${summary}</span><i class="sec-chev" aria-hidden="true">▾</i></button>
    <div class="bsec-body">${body}</div>
  </section>`;
const storySummary = (b, p) => {
  const n = (String(b.script ?? '').trim().match(/\S+/g) ?? []).length;
  if (!n) return 'not started';
  return b.scriptState === 'review' ? `script in review · ${n} words` : (b.scriptState === 'approved' || (b.scriptState === undefined && p.status !== 'brief')) ? `script approved · ${n} words` : `${n} words`;
};

// segmented option group: opts = [[value, label, sub?]]
const optGroup = (attr, current, opts) => `<div class="opts" role="radiogroup">${opts.map(([v, l, sub]) => `<button type="button" role="radio" aria-checked="${String(v) === String(current ?? '')}" class="opt ${String(v) === String(current ?? '') ? 'on' : ''}" ${attr}="${esc(v)}"><b>${esc(l)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('')}</div>`;
const optField = (label, html, hint = '', key = '') => `<div class="f${key && aiFilled(key) ? ' ai-filled' : ''}"><span class="fl">${label}</span>${html}${hint ? `<em>${hint}</em>` : ''}</div>`;
const DURS = [['', 'Auto', 'from voiceover'], [15, '15 s'], [30, '30 s'], [45, '45 s'], [60, '1 min'], [90, '90 s']];
const MOODS = ['Glossy', 'Premium', 'Playful', 'Minimal', 'Bold', 'Cinematic', 'Warm', 'Techy', 'Calm', 'Fast cuts', 'Lots of motion', 'Clean'];
const moodList = (t) => String(t ?? '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const sizeCard = ([l, w, h], b) => {
  const k = 30, bw = w >= h ? k : Math.max(10, Math.round(k * w / h)), bh = h >= w ? k : Math.max(10, Math.round(k * h / w));
  return `<button type="button" role="radio" aria-checked="${b.width === w && b.height === h}" class="size-card ${b.width === w && b.height === h ? 'on' : ''}" data-size="${w}x${h}"><span class="ar-box"><i style="width:${bw}px;height:${bh}px"></i></span><b>${esc(l.split(' ')[0])}</b><small>${esc(l.split(' ').slice(1).join(' '))} · ${w}×${h}</small></button>`;
};

// what is ready, shown in the right-hand rail
const readiness = () => {
  const {project: p} = S.cur, b = p.brief, has = (v) => String(v ?? '').trim().length > 0;
  const approvedScript = b.scriptState === 'approved' || (b.scriptState === undefined && has(b.script) && p.status !== 'brief');
  const items = [
    ['Video title', has(p.title), 'basics', ''],
    ['Script written', has(b.script), 'story', ''],
    ['Script approved', approvedScript, 'story', ''],
    ['Audience', has(b.audience), 'story', ''],
    ['Call to action', has(b.cta), 'story', ''],
    ['Colours', (b.colors ?? []).length > 0, 'look', ''],
    ['Voiceover, footage or logo', p.assets.some((x) => ['voiceover', 'footage', 'logo', 'image'].includes(x.role)), 'media', 'optional'],
  ];
  return items;
};
const briefActions = () => {
  const {project: p} = S.cur;
  return `${S.cur.concepts ? '<button type="button" class="btn" data-tab="concepts">View concepts</button>' : ''}
    ${!S.cur.concepts && !p.look?.reviewed ? `<button type="button" class="btn" data-action="gen-concepts" ${S.cur.busy ? 'disabled' : ''}>Skip, generate concepts</button>
    <button type="button" class="btn primary lg" data-tab="look">Next: Look &amp; feel →</button>` : `<button type="button" class="btn" data-tab="look">Look &amp; feel</button>
    <button type="button" class="btn primary lg" data-action="gen-concepts" ${S.cur.busy ? 'disabled' : ''}>${S.cur.concepts ? 'Regenerate concepts' : 'Generate concepts'} →</button>`}`;
};
const railHTML = () => {
  const {project: p} = S.cur, b = p.brief, items = readiness(), req = items.filter((i) => i[3] !== 'optional'), done = req.filter((i) => i[1]).length, pct = Math.round(done / req.length * 100);
  const words = (String(b.script ?? '').trim().match(/\S+/g) ?? []).length, size = SIZES.find(([, w, h]) => w === b.width && h === b.height);
  const brand = S.state.brands.find((x) => x.id === b.brandId);
  const stat = (k, v) => `<div class="rs"><span>${k}</span><b>${v}</b></div>`;
  return `
    <div class="rail-card">
      <div class="spread"><h4>Readiness</h4><span class="small muted">${done} of ${req.length}</span></div>
      <div class="bar"><i style="width:${Math.max(4, pct)}%"></i></div>
      <ul class="rail-list">${items.map(([l, ok, key, tag]) => `<li><button type="button" class="${ok ? 'ok' : 'todo'}" data-action="bsec-go" data-key="${key}"><span class="tick">${ok ? '✓' : ''}</span><span>${l}</span>${tag ? `<small>${tag}</small>` : ''}</button></li>`).join('')}</ul>
    </div>
    <div class="rail-card">
      <h4>At a glance</h4>
      ${stat('Spoken length', words ? `≈ ${fmtT(words / 2.5).replace(/\.\d$/, '')}` : '–')}
      ${stat('Words', words || '–')}
      ${stat('Format', `${size ? size[0].split(' ')[0] + ' · ' : ''}${b.width}×${b.height}`)}
      ${stat('Frame rate', `${b.fps} fps`)}
      ${stat('Target length', b.durationSec ? `${b.durationSec} s` : 'auto')}
      ${stat('Output', outFmt(b).toUpperCase())}
      ${stat('Brand', esc(brand?.name ?? 'Custom'))}
      ${stat('Files', p.assets.length)}
    </div>
    <div class="rail-card rail-actions">${briefActions()}</div>`;
};
const updateRail = () => { const el = $('#brief-rail'); if (el) el.innerHTML = railHTML(); };

const renderBrief = () => {
  const {project: p} = S.cur, b = p.brief;
  const preset = S.state.presets.find((x) => x.id === p.presetId);
  const brands = S.state.brands, moods = moodList(b.style).map((x) => x.toLowerCase());
  $('#tab').innerHTML = `
    <form id="brief" autocomplete="off">
      <div class="brief-head"><div><h2>Brief</h2><p class="muted small">Tell the studio what to make. Everything saves as you type.</p></div><span class="pill save" id="save-state">Changes save automatically.</span></div>
      ${preset ? `<div class="preset-banner"><img src="${presetThumb(preset)}" alt="" onerror="this.remove()" /><div><b>${esc(preset.name)}</b><div class="small muted" style="margin-top:3px">${esc(preset.tagline)}</div>${preset.asks?.length ? `<div class="small" style="margin-top:6px"><b>This preset needs:</b> ${preset.asks.map(esc).join(' · ')}</div>` : ''}</div></div>` : ''}

      <div class="brief-wrap">
      <div class="brief-main">
      <nav class="bnav" aria-label="Sections on this page">${BSECS.map(([k, , t]) => { const r = readiness().filter((i) => i[2] === k && i[3] !== 'optional'); return `<button type="button" class="${r.length ? (r.every((i) => i[1]) ? 'ok' : 'todo') : ''}" data-action="bsec-go" data-key="${k}">${r.length && r.every((i) => i[1]) ? '✓ ' : ''}${t}</button>`; }).join('')}</nav>

      ${bsec('basics', 1, 'Basics', 'name, preset and brand', `${esc(p.title)}`, `
      <div class="card grid g3">
        ${field('title', 'Video title', p.title, {placeholder: 'e.g. White label setup in 3 steps'})}
        ${select('presetId', 'Preset (reusable look)', p.presetId ?? '', [['', 'Blank (no preset)'], ...S.state.presets.map((x) => [x.id, x.name])])}
        ${select('brandId', 'Brand kit', b.brandId, [...brands.map((x) => [x.id, x.name]), ['custom', 'Custom colours']])}
      </div>`)}

      ${bsec('story', 2, 'Story', 'start from an idea or a script', storySummary(b, p), '<div class="card st-card" id="story-card"></div>')}

      ${bsec('format', 3, 'Format', 'size, frame rate, length and output', `${b.width}×${b.height} · ${b.fps} fps · ${outFmt(b).toUpperCase()}`, `
      <div class="card stack">
        ${optField('Size', `<div class="size-grid" role="radiogroup">${SIZES.map((x) => sizeCard(x, b)).join('')}</div>`)}
        ${optField('Frame rate', optGroup('data-fps', b.fps, [[24, '24'], [25, '25'], [30, '30'], [60, '60']]))}
        ${optField('Target length', optGroup('data-dur', b.durationSec ?? '', DURS), 'Leave on Auto when you have a voiceover: the video follows it.', 'durationSec')}
        ${outputPicker(b)}
        <details class="adv"><summary>Custom size and length</summary>
          <div class="grid g3" style="margin-top:12px">
            ${field('width', 'Width (px)', b.width, {type: 'number'})}${field('height', 'Height (px)', b.height, {type: 'number'})}
            ${field('durationSec', 'Length (seconds)', b.durationSec ?? '', {type: 'number', placeholder: 'auto from voiceover'})}
          </div>
        </details>
      </div>`)}

      ${bsec('look', 4, 'Look', 'colours, mood and captions', `${(b.colors ?? []).length} colours`, `
      <div class="card stack">
        <div class="spread"><label class="f" style="margin:0"><span>Colours</span></label><button type="button" class="btn ghost sm" data-action="brand-palette">Use brand palette</button></div>
        <div class="swatches" id="swatches">${(b.colors ?? []).map((c, i) => `<div class="swc"><div class="sw" style="background:${esc(c)}" title="${esc(c)}"><input type="color" value="${esc(c)}" data-color="${i}" /><button type="button" class="x" data-action="rm-color" data-i="${i}">✕</button></div><code>${esc(String(c).toUpperCase())}</code></div>`).join('')}<button type="button" class="sw-add" data-action="add-color" title="Add colour">＋</button></div>
        ${field('style', 'Style words / mood', b.style, {placeholder: 'e.g. glossy, premium, playful, fast cuts, lots of motion'})}
        <div class="moods">${MOODS.map((m) => `<button type="button" class="mood ${moods.includes(m.toLowerCase()) ? 'on' : ''}" data-mood="${esc(m)}">${esc(m)}</button>`).join('')}</div>
        ${optField('Captions', optGroup('data-caption', b.captions ?? '', CAPTIONS.map((c) => [c, c || 'Preset default'])), '', 'captions')}
      </div>`)}

      ${bsec('media', 5, 'Media & references', 'voiceover, music, logo, images, footage, reference videos', `${p.assets.length} file${p.assets.length === 1 ? '' : 's'}`, `
      <div class="card">
        <div class="drop" id="drop"><b>Drop files here</b> or click to upload<div class="small muted" style="margin-top:4px">Voiceovers are transcribed for timing · reference videos are turned into frames Claude can study</div></div><input type="file" id="file" multiple hidden />
        <div class="assets" id="assets"></div>
      </div>
      <div class="card grid g2" style="margin-top:16px">
        ${field('links', 'Links (one per line)', b.links, {rows: 4, placeholder: 'Websites, product pages, YouTube/Instagram references…'})}
        ${field('notes', 'Notes · do & don\'t', b.notes, {rows: 4, placeholder: 'e.g. No stock photos. Keep the logo big at the end. Prices in INR.'})}
      </div>`)}
      </div>
      <aside class="brief-rail" id="brief-rail" aria-label="Brief summary"></aside>
      </div>

      <div class="sticky-bar">
        <div class="small muted">Review the sections above, then continue.</div>
        <div class="row">${briefActions()}</div>
      </div>
    </form>`;
  $('#story-card').innerHTML = storyHTML();
  updateRail();
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
      <div class="spread"><div class="name" title="${esc(a.original)}">${esc(a.original)}</div>${a.role === 'reference' ? '' : `<button type="button" class="btn ghost sm" data-action="rm-asset" data-file="${esc(a.file)}" title="Remove">✕</button>`}</div>
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
const setBrief = (k, v) => { S.cur.project.brief[k] = v; queueSave({brief: {...(pending.brief ?? {}), [k]: v}}); updateRail(); };

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

// "what is it doing right now" panel for waiting screens; the Activity module fills it from the live feed
const liveBox = () => `<div class="live"><div class="live-head"><span>Running for <b data-live-elapsed>0:00</b></span><span class="live-quiet" data-live-quiet></span></div><div data-live-steps></div></div>`;

// ---------- 2 · concepts ----------
const renderConcepts = () => {
  const {project: p, concepts: doc, busy} = S.cur;
  if (!doc?.concepts?.length) {
    if (S.conceptTimer) clearInterval(S.conceptTimer);
    if (busy || p.status === 'concepting') {
      const key = `studio-concepts-start-${p.id}`;
      const started = Number(localStorage.getItem(key)) || Date.now();
      localStorage.setItem(key, String(started));
      const lastTool = [...(p.log ?? [])].reverse().find((e) => e.kind === 'tool');
      $('#tab').innerHTML = `<div class="card waiting"><div class="spinner"></div><h2>Designing concepts</h2><p>Working from your brief and local references. This pass skips link fetching and audio transcription.</p><p class="small muted">Elapsed: <b id="concept-elapsed">0:00</b></p><p class="small" id="concept-activity">${esc(lastTool?.text || 'Planning two concept directions...')}</p>${liveBox()}<button type="button" class="btn danger" data-action="stop" style="margin-top:16px">Stop generation</button></div>`;
      const tick = () => { const el = $('#concept-elapsed'); if (el) { const sec = Math.floor((Date.now() - started) / 1000); el.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; } };
      tick(); S.conceptTimer = setInterval(tick, 1000);
    } else {
      localStorage.removeItem(`studio-concepts-start-${p.id}`);
      $('#tab').innerHTML = '<div class="card waiting"><h2>No concepts yet</h2><p>Fill the brief, then generate concepts.</p><button class="btn primary" data-tab="brief">Go to brief</button></div>';
    }
    return;
  }
  if (S.conceptTimer) clearInterval(S.conceptTimer);
  localStorage.removeItem(`studio-concepts-start-${p.id}`);
  const portrait = p.brief.height > p.brief.width;
  const approved = p.approvedConcept?.id;
  $('#tab').innerHTML = `
    ${S.cur.resumable && !busy ? resumeCard(p, busy) : ''}
    ${busy ? `<div class="card row" style="margin-bottom:16px"><div class="spinner" style="width:22px;height:22px;border-width:3px;margin:0"></div><b>Claude is working…</b><span class="live-line" data-live-last></span><span class="muted">samples refresh when done</span></div>` : ''}
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
const resumeCard = (p, busy) => `<div class="card resume-card"><div class="resume-ic">!</div><div class="resume-tx"><h2>The build was interrupted</h2>
  <p>The studio stopped while Claude was building “${esc(p.approvedConcept?.name ?? 'your video')}”. Your work is saved (the video code and the check frames). <b>Resume</b> carries on from where it stopped. It does not start over.</p>
  <div class="row"><button type="button" class="btn primary lg" data-action="resume-build" ${busy ? 'disabled' : ''}>▶ Resume build</button><span class="small muted">Uses AI. Usually much quicker than a fresh build.</span></div></div></div>`;
// ---------- build checklist ----------
const tasksHtml = (bp) => {
  const tasks = bp.tasks, doneN = tasks.filter((t) => t.done).length, open = tasks.findIndex((t) => !t.done);
  const todos = bp.todos ?? [], todoDone = todos.filter((t) => t.status === 'completed').length;
  return `<div class="card tasks-card">
    <div class="spread"><div><h3>Build checklist</h3><div class="small muted">${doneN} of ${tasks.length} done${bp.busy ? ' · Claude is working on it' : bp.interrupted ? ' · interrupted, press Resume below' : doneN === tasks.length ? ' · all done' : ''}</div></div>
      <span class="pill ${doneN === tasks.length ? 'green' : 'blue'}">${Math.round(doneN / tasks.length * 100)}%</span></div>
    <div class="bar"><i style="width:${Math.max(3, doneN / tasks.length * 100)}%"></i></div>
    <ol class="tasks">${tasks.map((t, i) => `<li class="${t.done ? 'done' : i === open ? (bp.busy ? 'active' : 'next') : ''}"><span class="tk">${t.done ? '✓' : i === open && bp.busy ? '<i class="dot"></i>' : ''}</span><div><b>${esc(t.label)}</b>${t.detail ? `<small>${esc(t.detail)}</small>` : i === open && !bp.busy && !bp.interrupted ? '<small>next</small>' : ''}</div></li>`).join('')}</ol>
    ${bp.busy && bp.now ? `<div class="tasks-now"><i class="dot"></i><span>${esc(bp.now)}</span></div>` : ''}
    ${todos.length ? `<details class="tasks-ai" ${bp.busy ? 'open' : ''}><summary>Claude's own to-do list · ${todoDone} of ${todos.length} done</summary><ul>${todos.map((t) => `<li class="${esc(t.status)}"><span>${t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '▶' : '○'}</span>${esc(t.status === 'in_progress' ? t.activeForm || t.content : t.content)}</li>`).join('')}</ul></details>` : ''}
  </div>`;
};
let bpTimer = null;
const loadBuildProgress = async () => {
  if (!$('#build-tasks') || !S.cur) return;
  try { const bp = await api(`/api/projects/${S.cur.project.id}/build-progress`); const host = $('#build-tasks'); if (host) host.innerHTML = tasksHtml(bp); } catch { /* the next update retries */ }
};
const pokeBuildProgress = () => { if (S.tab !== 'build') return; clearTimeout(bpTimer); bpTimer = setTimeout(loadBuildProgress, 1500); };

const renderBuild = () => {
  const {project: p, storyboard: sb, checks, busy} = S.cur;
  if (!sb && S.cur.resumable && !busy) { $('#tab').innerHTML = `<div id="build-tasks"></div>${resumeCard(p, busy)}`; loadBuildProgress(); return; }
  if (!sb) {
    $('#tab').innerHTML = `<div id="build-tasks"></div><div class="card waiting"><div class="spinner"></div><h2>Building “${esc(p.approvedConcept?.name ?? 'your video')}”</h2><p>Claude is writing the scenes, syncing them to the voiceover and checking frames. The timing appears here when it's ready.</p>${liveBox()}${busy ? '<button type="button" class="btn danger" data-action="stop" style="margin-top:16px">Stop</button>' : ''}</div>`;
    loadBuildProgress();
    return;
  }
  $('#tab').innerHTML = `<div id="build-tasks"></div>${reviewHtml()}`;
  loadBuildProgress();
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
// ---------- look & feel: choose the effects before the concepts (and change them later) ----------
const LOOK_LV = ['Off', 'Light', 'Full'];
const lookDemo = (k, mood = 'neutral') => ({
  grain: '<div class="ld-photo"></div><div class="ld-grain"></div>',
  vignette: '<div class="ld-photo"></div><div class="ld-vig"></div>',
  grade: `<div class="ld-photo ld-g-${mood}"></div>${mood === 'cinematic' ? '<div class="ld-gtint"></div>' : ''}`,
  leaks: '<div class="ld-photo"></div><div class="ld-leak"></div>',
  motionBlur: '<div class="ld-mbdot"></div><div class="ld-mbdot"></div><div class="ld-mbdot"></div><div class="ld-mbdot"></div>',
  sfx: '<div class="ld-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',
  camera: '<div class="ld-zoom ld-photo"></div>',
  transitions: '<div class="ld-photo"></div><div class="ld-wipe"></div>',
  physics: '<div class="ld-ball"></div>',
  objects3d: '<div class="ld-coin"></div>',
  illustration: '<div class="ld-icon"></div>',
  particles: '<div class="ld-photo" style="opacity:.5"></div>' + '<div class="ld-dot"></div>'.repeat(6),
  cursor: '<div class="ld-btn"></div><div class="ld-cur"></div>',
  uiActions: '<div class="ld-toggle"></div><div class="ld-bar"></div>',
  guidedFocus: '<div class="ld-photo"></div><div class="ld-focus"></div>',
  captions: '<div class="ld-words"><span>Reply</span><span>faster</span><span>today</span></div>',
}[k] ?? '');

const lookState = () => {
  const p = S.cur.project;
  return {levels: {...(p.look?.levels ?? {})}, gradeMood: p.look?.gradeMood ?? 'neutral', bundle: p.look?.bundle ?? ''};
};
const saveLook = async (edit) => {
  const id = S.cur.project.id;
  const r = await api(`/api/projects/${id}/look`, {method: 'PUT', body: {look: edit}});
  S.cur.project.look = r.look;
  S.lookChanges = r.changes;
  renderLook();
};
const LOOK_TAG = {layer: ['Live', 'Shows in the preview right away. No AI cost.', ''], built: ['Claude builds', 'Claude designs this into the video when it builds it.', 'b']};
const lgFolded = (id) => { try { return localStorage.getItem(`studio-lg-${id}`) === '1'; } catch { return false; } };
const lookTick = () => { const el = document.querySelector('[data-look-time]'); if (el && S.lookAI?.busy) { const sec = Math.round((Date.now() - S.lookAI.startedAt) / 1000); el.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')} elapsed · usually 10 to 30 s`; } };
const renderLook = () => {
  const {project: p, storyboard, busy, compositions} = S.cur;
  const spec = S.state.lookSpec;
  const st = lookState();
  const built = !!storyboard;
  const changes = built ? lookChangesLocal(p.look) : [];
  const items = spec.groups.flatMap((g) => g.items);
  const onItems = items.filter((i) => (st.levels[i.key] ?? 0) > 0);
  const total = onItems.length;
  const ai = S.lookAI ?? {};
  const studioUrl = `http://localhost:${S.state.studioPort}/${compositions.video}`;
  const hasStory = !!(String(p.brief.script ?? '').trim() || String(p.brief.idea ?? '').trim());
  $('#tab').innerHTML = `
    <div class="card look-intro">
      <h2>Look &amp; feel</h2>
      <p class="muted">Choose how your video feels: motion, colour and extras. It is all optional, and you can change it later.</p>
      <ol class="howto">
        <li><span class="hn">1</span><div><b>Pick a style</b><small>Press “Let AI choose for me”, or tap a ready-made style below.</small></div></li>
        <li><span class="hn">2</span><div><b>Fine-tune</b><small>Each card is one feature. <i>Off</i> = not used, <i>Light</i> = subtle, <i>Full</i> = strong. The small animation shows what it does.</small></div></li>
        <li><span class="hn">3</span><div><b>Continue</b><small>Press “${built ? 'Preview &amp; render' : 'Generate concepts'}”. Claude uses your choices.</small></div></li>
      </ol>
      <div class="look-ai">
        <button type="button" class="btn primary lg" data-action="look-suggest" ${ai.busy || busy ? 'disabled' : ''} title="${hasStory ? 'The AI reads your idea and script and picks the options for you' : 'Write your idea or script on the Brief page first'}">✦ Let AI choose for me</button>
        <button type="button" class="btn" data-action="look-reset" ${total && !ai.busy ? '' : 'disabled'}>Reset all to Off</button>
        <span class="pill ${total ? 'blue' : ''}">${total} option${total === 1 ? '' : 's'} on</span>
        ${!hasStory ? '<span class="small muted">Tip: write your idea or script first so the AI can choose well.</span>' : ''}
      </div>
      ${ai.busy ? `<div class="st-run"><div class="st-run-top"><i class="dot"></i><b>The AI is choosing the options…</b><span class="muted small" data-look-time></span><button type="button" class="btn ghost sm" data-action="stop-all">Stop</button></div><div class="bar indet"><i></i></div></div>` : ''}
      ${ai.error ? `<div class="st-err">${esc(ai.error)}</div>` : ''}
      ${ai.reason ? `<div class="look-why"><span class="pill ai">✦ Why the AI chose this</span><p>${esc(ai.reason)}</p>${usageHTML(ai.usage)}</div>` : ''}
      ${onItems.length ? `<div class="look-on"><span class="small muted">Switched on:</span> ${onItems.map((i) => `<span class="pill ${st.levels[i.key] === 2 ? 'blue' : ''}" title="${LOOK_LV[st.levels[i.key]]}">${esc(i.title)}${st.levels[i.key] === 2 ? ' · Full' : ''}</span>`).join(' ')}</div>` : ''}
      <div class="look-sub"><b>Ready-made styles</b><div class="bundles">${spec.bundles.map((b) => `<button type="button" class="bundle ${st.bundle === b.id ? 'on' : ''}" data-look-bundle="${b.id}"><b>${esc(b.name)}</b><span>${esc(b.tagline)}</span></button>`).join('')}</div></div>
      <div class="look-legend small muted"><span class="tagc" title="${LOOK_TAG.layer[1]}">Live</span> shows in the preview straight away, no AI cost <span class="sep">·</span> <span class="tagc b" title="${LOOK_TAG.built[1]}">Claude builds</span> Claude designs it into the video (uses AI when it builds)</div>
    </div>
    ${built ? `<div class="card" style="margin-bottom:14px"><div class="spread"><b>Live preview</b><span class="muted small">Options tagged “Live” show here as you change them. Motion blur and sound effects appear in the final render.</span></div><div class="preview" style="height:340px;margin-top:10px"><iframe src="${studioUrl}" title="Remotion preview"></iframe></div></div>` : ''}
    <div class="look-groups">${spec.groups.map((g) => {
      const on = g.items.filter((it) => (st.levels[it.key] ?? 0) > 0).length, folded = lgFolded(g.id);
      return `<section class="look-group ${folded ? 'folded' : ''}" data-lg="${g.id}">
        <button type="button" class="lg-head" data-action="lg-fold" aria-expanded="${!folded}"><b>${esc(g.title)}</b><span class="pill ${on ? 'blue' : ''}">${on ? `${on} on` : 'all off'}</span><i class="sec-chev" aria-hidden="true">▾</i></button>
        <div class="look-grid">${g.items.map((it) => {
          const lv = st.levels[it.key] ?? 0, tag = LOOK_TAG[it.kind === 'built' ? 'built' : 'layer'];
          return `<div class="look-card ${lv ? 'on' : ''}"><div class="ld">${lookDemo(it.key, st.gradeMood)}</div>
            <div class="t"><span>${esc(it.title)}</span><span class="tagc ${tag[2]}" title="${tag[1]}">${tag[0]}</span></div>
            <div class="d">${esc(it.desc)}</div>
            <div class="seg">${LOOK_LV.map((l, n) => `<button type="button" class="${lv === n ? 'on' : ''}" data-look-key="${it.key}" data-look-level="${n}">${l}</button>`).join('')}</div>
            <div class="lv">${lv ? esc(lv === 2 ? it.full : it.light) : 'Not used'}</div>
            ${it.key === 'grade' && lv ? `<select data-look-mood>${spec.moods.map((m) => `<option ${m === st.gradeMood ? 'selected' : ''}>${m}</option>`).join('')}</select>` : ''}
          </div>`;
        }).join('')}</div></section>`;
    }).join('')}</div>
    <div class="sticky-bar">
      <div class="small muted">${built ? (changes.length ? `${changes.length} Claude-built change${changes.length === 1 ? '' : 's'} waiting. “Live” options are already showing.` : '“Live” options are showing in the preview. Render to get motion blur and sound.') : 'Saved as you click. Next, Claude designs three concept looks using these choices.'}</div>
      <div class="row">
        ${built && changes.length ? `<button type="button" class="btn gold" data-action="apply-look" ${busy ? 'disabled' : ''}>Apply ${changes.length} change${changes.length === 1 ? '' : 's'} with Claude</button>` : ''}
        ${built ? '<button type="button" class="btn primary lg" data-tab="render">Preview &amp; render →</button>' : `<button type="button" class="btn primary lg" data-action="gen-concepts" ${busy ? 'disabled' : ''}>${S.cur.concepts ? 'Regenerate concepts' : 'Generate concepts'} →</button>`}
      </div>
    </div>`;
  lookTick();
};
// same rule as the server: Claude-built options whose level differs from what was last applied
const lookChangesLocal = (look) => {
  const was = look?.applied?.levels ?? {};
  return S.state.lookSpec.groups.flatMap((g) => g.items).filter((i) => i.kind === 'built' && (look?.levels?.[i.key] ?? 0) !== (was[i.key] ?? 0)).map((i) => ({key: i.key}));
};

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
  const fmt = outFmt(p.brief);
  const locked = !p.approval; // rendering waits for the user's approval on Build & timing
  $('#tab').innerHTML = `
    ${locked ? '<div class="render-lock"><div><b>Rendering is locked until you approve the build.</b><div class="small muted" style="margin-top:3px">Check every scene on Build &amp; timing, send any corrections to the AI, then approve. You can still watch the live preview here.</div></div><button type="button" class="btn primary" data-tab="build">Go to review →</button></div>' : ''}
    <div class="spread" style="margin-bottom:12px"><div class="row"><h2>Live preview</h2><span class="muted small">Remotion Studio · updates as Claude edits</span></div><a class="btn ghost sm" href="${studioUrl}" target="_blank" rel="noopener">Open full screen ↗</a></div>
    <div class="preview"><iframe src="${studioUrl}" title="Remotion preview"></iframe></div>
    <div class="card" style="margin-top:16px">
      <div class="spread">
        <div><h2>Render</h2><div class="muted small">Draft = half resolution, quick check. Final = ${fmt === 'mp4' ? 'full quality H.264' : `full quality, converted to ${fmt.toUpperCase()}`}.</div></div>
        <div class="row">
          <button class="btn" data-action="render" data-draft="1" ${(j && !j.done) || locked ? 'disabled' : ''}>Draft render</button>
          <button class="btn primary" data-action="render" ${(j && !j.done) || locked ? 'disabled' : ''}>Final render (${fmt.toUpperCase()})</button>
          ${j && !j.done ? '<button class="btn ghost danger" data-action="cancel-render">Cancel</button>' : ''}
        </div>
      </div>
      <div class="render-out">${outputPicker(p.brief)}</div>
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
      <div class="card" style="padding:12px">${r.format === 'gif' || r.format === 'webp' ? `<img class="anim-prev" src="/data/${p.id}/${r.file}" alt="" />` : `<video src="/data/${p.id}/${r.file}" controls preload="metadata"></video>`}
        <div class="spread" style="margin-top:10px"><div class="small"><b>${r.draft ? 'Draft' : 'Final'}</b> <span class="pill">${esc((r.format ?? 'mp4').toUpperCase())}</span> · ${fmtT(r.durationSec)} · ${r.width}×${r.height}<div class="muted">${new Date(r.at).toLocaleString()}</div>${r.exported ? `<div class="muted" title="${esc(r.exported)}">Saved: ${esc(r.exported)}</div>` : ''}</div>
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
  const rt = aiRuntime(), chip = aiChip();
  $('#chat-head-name').title = chip ? chip.title : '';
  $('#chat-head-name').textContent = aiTag() ?? aiName();
  const meta = $('#chat-meta'), lt = S.cur.project.lastTurn;
  meta.hidden = !rt;
  if (rt) {
    const big = (lt?.context ?? 0) > 120000;
    meta.innerHTML = `<span class="where ${esc(rt.where)}" title="${esc(chip.title)}">${rt.where === 'cloud' ? '☁ model on' : '⌂ model on'} ${esc(rt.host)}</span><span class="where pc" title="Files, commands and renders run on this computer">⌂ tools on ${esc(rt.tools)}</span>
      ${lt?.context ? `<span class="ctx ${big ? 'big' : ''}" title="Every request re-reads the whole conversation, so a long one costs more each time.">conversation ≈ ${kTok(lt.context)} tokens</span><button type="button" class="btn ghost sm" data-action="fresh-session" ${S.cur.busy ? 'disabled' : ''} title="Forget the chat history (not your video files). The next request starts small and costs less.">Fresh start</button>` : ''}`;
  }
  $('#agent-state').innerHTML = S.cur.busy ? '<i class="dot"></i> working' : 'idle';
  $('#stop-btn').hidden = !S.cur.busy;
  syncHeadStop();
};

// ---------- events from the server ----------
const es = new EventSource('/api/events');
let refreshTimer = null;
const refresh = (full = true) => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    await loadState().catch(() => {});
    if (!S.cur) { if (!route().id && !route().tools) renderHome(); return; }
    await loadProject(S.cur.project.id).catch(() => {});
    if (!full) return renderChat();
    const editing = (S.tab === 'brief' && document.activeElement?.closest?.('#brief')) || (S.tab === 'text' && S.textDirty) || (S.tab === 'audio' && S.audioDirty) || (S.tab === 'background' && document.activeElement?.closest?.('#bgform')) || (S.tab === 'style' && document.activeElement?.closest?.('#style-request, #styleform')) || (S.tab === 'build' && reviewEditing());
    if (editing) { renderAssets(); } else { renderProject(); }
    renderChat();
  }, 250);
};
es.onopen = () => setConnection(true);
es.onerror = () => setConnection(false);
es.onmessage = (m) => {
  const e = JSON.parse(m.data);
  // The heartbeat lists what is really running. If this page still shows the open video as busy (or a render as running) but the
  // server says it is not, the "finished" message was lost (reconnect, restart): correct the page instead of showing it as running.
  if (e.type === 'tick' && S.cur) {
    const serverBusy = (e.busy ?? []).some((b) => b.projectId === S.cur.project.id);
    if (S.cur.busy && !serverBusy) { S.cur.busy = false; renderChat(); refresh(); }
    if (S.renderJob && !S.renderJob.done && !e.render) { S.renderJob = {...S.renderJob, done: true, stage: 'error', error: 'Stopped'}; renderRenderPill(); }
    syncHeadStop();
  }
  if (onServerEvent(e)) return; // activity lines + heartbeat feed the Activity dock only
  if (e.type === 'tools') { if (route().tools) toolsChanged(); return; }
  if (e.type === 'projects') return refresh(false);
  if (e.type === 'planner') { if (S.cur?.project.id === e.projectId && S.plannerBusy) { S.plannerProgress = e; updatePlannerWait(); } return; }
  if (e.type === 'render') { S.renderJob = e; renderRenderPill(); if (S.cur?.project.id === e.projectId && S.tab === 'render') { if (e.done) refresh(); else renderRender(); } return; }
  if (!S.cur || e.projectId !== S.cur.project.id) { if (e.type === 'agent' && e.kind === 'done') refresh(false); return; }
  if (e.type === 'project') return refresh();
  if (e.type === 'job') { if (e.file) { S.jobText[e.file] = e.text; renderAssets(); } else { toast(e.text); if (e.done) refresh(); } return; }
  if (e.type === 'agent') {
    if (e.kind === 'status') { S.cur.busy = e.busy; renderChat(); return; }
    if (S.tab === 'concepts' && S.cur.project.status === 'concepting' && ['tool', 'text'].includes(e.kind)) { const activity = $('#concept-activity'); if (activity) activity.textContent = e.text; }
    if (S.plannerBusy && e.kind === 'tool') { S.plannerProgress = {message: e.text}; updatePlannerWait(); }
    if (e.kind === 'done') { refresh(); if (e.ok) toast(`${aiName()} finished.`); return; }
    S.cur.log.push(e);
    if (e.kind === 'tool') pokeBuildProgress();
    renderChat();
  }
};

initTools({api, toast});
initStorage({api, toast});
initFiles({api, toast, reload: async () => { await loadProject(S.cur.project.id); renderProject(); renderChat(); }});
initReview({S: () => S, api, toast, esc, fmtT, bust, liveBox, rerender: () => renderBuild(), reload: async () => { await loadProject(S.cur.project.id); renderProject(); renderChat(); }});

// ---------- activity dock: what the page itself is doing ----------
initActivity(() => ({projectId: S.cur?.project.id ?? route().id ?? null, aiName: S.state?.settings ? aiName() : 'The AI', aiTag: aiTag(), aiChip: aiChip(), projectTitle: (id) => S.state?.projects?.find((x) => x.id === id)?.title ?? id, prettyModel}));
// a click is noted before it is handled, so "I pressed it and nothing happened" still leaves a trace (and the line after it says what came of it)
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('button, [data-action], [data-tab], [data-look-bundle]');
  if (!b || b.closest('#dock')) return;
  const label = (b.textContent || b.getAttribute('title') || b.dataset.action || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  if (label) note(`Clicked “${label}”`);
}, true);
window.addEventListener('error', (e) => note(`Page error: ${e.message}${e.filename ? ` (${e.filename.split('/').pop()}:${e.lineno})` : ''}`, {level: 'error'}));
window.addEventListener('unhandledrejection', (e) => note(`Page error: ${e.reason?.message ?? e.reason}`, {level: 'error'}));

// ---------- lightbox (prev / next through the frames of the same group) ----------
let lbGroup = [], lbIdx = 0;
function lbShow() {
  const el = lbGroup[lbIdx], lb = $('#lightbox');
  $('img', lb).src = el.dataset.zoom; $('.lb-cap', lb).textContent = `${el.dataset.cap ?? ''}${lbGroup.length > 1 ? `  ·  ${lbIdx + 1} / ${lbGroup.length}` : ''}`;
  lb.classList.toggle('single', lbGroup.length < 2); lb.hidden = false;
}
function lbOpen(el) { lbGroup = [...(el.parentElement?.querySelectorAll(':scope > [data-zoom]') ?? [el])]; lbIdx = Math.max(0, lbGroup.indexOf(el)); if (!lbGroup.length) lbGroup = [el]; lbShow(); }
function lbStep(d) { if (lbGroup.length < 2) return; lbIdx = (lbIdx + d + lbGroup.length) % lbGroup.length; lbShow(); }
document.addEventListener('keydown', (e) => {
  if ($('#lightbox').hidden) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); lbStep(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); lbStep(-1); } else if (e.key === 'Escape') $('#lightbox').hidden = true;
});

// ---------- actions ----------
document.addEventListener('click', async (ev) => {
  const zoom = ev.target.closest('[data-zoom]');
  if (zoom) { lbOpen(zoom); return; }
  const lbNav = ev.target.closest('[data-lb]');
  if (lbNav) { lbStep(lbNav.dataset.lb === 'next' ? 1 : -1); return; }
  if (ev.target.closest('#lightbox')) { $('#lightbox').hidden = true; return; }
  const tabBtn = ev.target.closest('[data-tab]');
  if (tabBtn && !tabBtn.disabled) { await flushSave(); S.tab = tabBtn.dataset.tab; go(S.cur.project.id, S.tab); return; }
  const lk = ev.target.closest('[data-look-key]');
  if (lk) { const st = lookState(); st.levels[lk.dataset.lookKey] = Number(lk.dataset.lookLevel); st.bundle = ''; try { await saveLook(st); } catch (e) { toast(e.message); } return; }
  const lb = ev.target.closest('[data-look-bundle]');
  if (lb) { try { await saveLook({bundle: lb.dataset.lookBundle, levels: null}); } catch (e) { toast(e.message); } return; }
  const outBtn = ev.target.closest('[data-outfmt], [data-animw], [data-animfps]');
  if (outBtn) {
    if (outBtn.dataset.outfmt) setBrief('outputFormat', outBtn.dataset.outfmt);
    if (outBtn.dataset.animw) setBrief('animWidth', Number(outBtn.dataset.animw));
    if (outBtn.dataset.animfps) setBrief('animFps', Number(outBtn.dataset.animfps));
    if (S.tab === 'render') renderRender(); else renderBrief();
    return;
  }
  const fpsBtn = ev.target.closest('[data-fps]');
  if (fpsBtn) { setBrief('fps', Number(fpsBtn.dataset.fps)); renderBrief(); return; }
  const durBtn = ev.target.closest('[data-dur]');
  if (durBtn) { setBrief('durationSec', durBtn.dataset.dur === '' ? null : Number(durBtn.dataset.dur)); renderBrief(); return; }
  const capBtn = ev.target.closest('[data-caption]');
  if (capBtn) { setBrief('captions', capBtn.dataset.caption); renderBrief(); return; }
  const moodBtn = ev.target.closest('[data-mood]');
  if (moodBtn) {
    const list = moodList(S.cur.project.brief.style), m = moodBtn.dataset.mood, i = list.findIndex((x) => x.toLowerCase() === m.toLowerCase());
    if (i >= 0) list.splice(i, 1); else list.push(m.toLowerCase());
    const val = list.join(', '); setBrief('style', val);
    const input = document.querySelector('#brief [name="style"]'); if (input) input.value = val;
    moodBtn.classList.toggle('on', i < 0); return;
  }
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
      case 'logout': await fetch('/api/logout', {method: 'POST'}); location.replace('/login'); break;
      case 'quit': {
        if (!confirm('Quit MotionStudio? The studio stops and this window closes.')) break;
        let r = await fetch('/api/quit', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}'});
        if (r.status === 409) { const j = await r.json(); if (!confirm(`${j.error}\n\nQuit anyway?`)) break; r = await fetch('/api/quit', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({force: true})}); }
        document.body.innerHTML = '<div style="min-height:100vh;display:grid;place-items:center;font:16px Poppins,system-ui,sans-serif;color:#888">MotionStudio has closed. You can close this window.</div>';
        setTimeout(() => window.close(), 800);
        break;
      }
      case 'toggle-theme': applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); break;
      case 'toggle-fullscreen': if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); break;
      case 'resume-build':
        await api(`/api/projects/${id}/resume-build`, {method: 'POST'});
        toast('Resuming the build…'); S.tab = 'build'; go(id, 'build'); await refresh?.(false);
        break;
      case 'lg-fold': { const sec = a.closest('.look-group'), off = !sec.classList.contains('folded'); sec.classList.toggle('folded', off); a.setAttribute('aria-expanded', String(!off)); try { localStorage.setItem(`studio-lg-${sec.dataset.lg}`, off ? '1' : '0'); } catch { /* ignore */ } break; }
      case 'look-reset': await saveLook({bundle: 'none', levels: null}); S.lookAI = null; renderLook(); toast('Everything is off. Pick a style or switch on what you like.'); break;
      case 'look-suggest': {
        if (S.lookAI?.busy) break;
        await flushSave();
        const ctrl = new AbortController();
        S.lookAI = {busy: true, startedAt: Date.now(), ctrl};
        clearInterval(S.lookTimer); S.lookTimer = setInterval(lookTick, 1000);
        renderLook(); syncHeadStop();
        try {
          const r = await api(`/api/projects/${id}/look/suggest`, {method: 'POST', body: {}, signal: ctrl.signal});
          await saveLook({levels: r.levels, gradeMood: r.gradeMood, bundle: ''});
          S.lookAI = {reason: r.reason, usage: r.usage};
          toast('The AI chose the look. Change anything you like.');
        } catch (e) {
          S.lookAI = ctrl.signal.aborted ? null : {error: e.message};
          toast(ctrl.signal.aborted ? 'Stopped.' : e.message);
        } finally { clearInterval(S.lookTimer); if (S.tab === 'look' && S.cur?.project.id === id) renderLook(); syncHeadStop(); }
        break;
      }
      case 'bsec-fold': { const sec = a.closest('.bsec'), off = !sec.classList.contains('folded'); sec.classList.toggle('folded', off); a.setAttribute('aria-expanded', String(!off)); try { localStorage.setItem(`studio-bsec-${sec.dataset.bsec}`, off ? '1' : '0'); } catch { /* ignore */ } break; }
      case 'bsec-go': { const sec = document.getElementById(`bsec-${a.dataset.key}`); if (sec) { sec.classList.remove('folded'); sec.querySelector('.bsec-head')?.setAttribute('aria-expanded', 'true'); try { localStorage.setItem(`studio-bsec-${a.dataset.key}`, '0'); } catch { /* ignore */ } sec.scrollIntoView({behavior: 'smooth', block: 'start'}); } break; }
      case 'fold': { const sec = a.closest('.side-sec'), off = !sec.classList.contains('folded'); setFold(sec, off); try { localStorage.setItem(foldKey(sec.dataset.sec), off ? '1' : '0'); } catch { /* ignore */ } break; }
      case 'fresh-session':
        if (!confirm('Start a fresh AI conversation for this video?\n\nThe AI forgets the chat so far (your video files are untouched) and the next request costs less. It will re-read the brief and the code it needs.')) break;
        await api(`/api/projects/${id}/fresh-session`, {method: 'POST'}); await loadProject(id); renderChat(); toast('Fresh conversation started. The next request starts small.');
        break;
      case 'side-more': S.sideLimit += 8; renderSide(); break;
      case 'side-less': S.sideLimit = 8; renderSide(); break;
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
        go(p.id, 'script');
        break;
      }
      case 'planner-upload': $('#planner-file').click(); break;
      case 'planner-delete-frame': {
        const frame = a.dataset.frame, video = a.dataset.video;
        if (!confirm(`Delete the ${frame.match(/f-(\d+\.\d+)s/)?.[1] || ''} second snapshot? It will be removed from your reference set.`)) break;
        const result = await api(`/api/projects/${id}/reference-frames/${encodeURIComponent(video)}/${encodeURIComponent(frame)}`, {method: 'DELETE'});
        S.cur.referenceFrames[video] = result.frames; renderProject(); toast('Snapshot deleted.'); break;
      }
      case 'script-help':
      case 'script-generate': {
        await flushSave();
        const b = S.cur.project.brief;
        S.plannerBusy = true; S.plannerAborting = false; S.plannerProgress = null; S.plannerStartedAt = Date.now(); renderProject(); updatePlannerWait();
        S.plannerTimer = setInterval(updatePlannerWait, 1000);
        try {
          const result = await api(`/api/projects/${id}/script-plan`, {method: 'POST', body: {brief: {idea: b.idea, audience: b.audience, style: b.style, durationSec: b.durationSec, notes: b.notes, plannerScript: b.plannerScript, plannerRefs: b.plannerRefs || []}, action: a.dataset.action === 'script-help' ? 'coach' : 'generate'}});
          S.cur.project.brief = {...S.cur.project.brief, ...result.brief};
        } finally { clearInterval(S.plannerTimer); S.plannerBusy = false; S.plannerAborting = false; S.plannerStartedAt = null; S.plannerProgress = null; renderProject(); }
        toast('Script plan updated.');
        break;
      }
      case 'planner-cancel':
        S.plannerAborting = true; updatePlannerWait();
        await api(`/api/projects/${id}/script-plan/cancel`, {method: 'POST'});
        toast('Cancellation requested.');
        break;
      case 'restore-planner-version': {
        const b = S.cur.project.brief, index = Number(a.dataset.version), versions = b.plannerVersions ?? [], chosen = versions[index];
        if (!chosen) break;
        const history = [...(b.plannerScript?.trim() && b.plannerScript !== chosen.text ? [{text: b.plannerScript, savedAt: Date.now()}] : []), ...versions.filter((_, i) => i !== index)].slice(0, 10);
        S.cur.project = await api(`/api/projects/${id}`, {method: 'PATCH', body: {brief: {plannerScript: chosen.text, plannerVersions: history}}});
        renderProject(); toast('Previous script draft restored.'); break;
      }
      case 'script-finalize': {
        await flushSave(); const b = S.cur.project.brief;
        const patch = {idea: b.idea || b.plannerScript, script: b.plannerScript || b.script};
        S.cur.project = await api(`/api/projects/${id}`, {method: 'PATCH', body: {brief: patch}}); S.tab = 'brief'; go(id, 'brief'); toast('Script and details added to the video brief.'); break;
      }
      case 'delete':
        if (confirm(`Delete "${S.cur.project.title}" with its code, uploads and renders?`)) { await api(`/api/projects/${id}`, {method: 'DELETE'}); go(null); }
        break;
      case 'stop': await api(`/api/projects/${id}/stop`, {method: 'POST'}); break;
      case 'stop-all': {
        a.disabled = true;
        const jobs = [];
        if (storyRunning()) stopStoryRun();
        if (S.lookAI?.busy) S.lookAI.ctrl?.abort();
        if (S.cur.busy) jobs.push(api(`/api/projects/${id}/stop`, {method: 'POST'}));
        if (S.plannerBusy) { S.plannerAborting = true; updatePlannerWait(); jobs.push(api(`/api/projects/${id}/script-plan/cancel`, {method: 'POST'})); }
        if (S.renderJob && !S.renderJob.done && S.renderJob.projectId === id) jobs.push(api('/api/render/cancel', {method: 'POST'}));
        try { await Promise.all(jobs); toast('Stop requested. It can take a few seconds to wind down.'); } catch (e) { a.disabled = false; toast(e.message); }
        break;
      }
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
      case 'apply-look': await api(`/api/projects/${id}/look/apply`, {method: 'POST'}); S.lookChanges = []; toast('Claude is applying the changes…'); break;
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
  if (t.closest('#tab') && t.name?.startsWith('planner') && t.name !== 'plannerProvider') {
    const key = t.name, val = t.value;
    S.cur.project.brief[key] = val;
    queueSave({brief: {...(pending.brief ?? {}), [key]: val}});
    return;
  }
  if (!t.closest('#brief') || !t.name) return;
  if (t.name === 'title') { S.cur.project.title = t.value; queueSave({title: t.value}); updateRail(); return; }
  if (t.name === 'presetId') return;
  const num = ['width', 'height', 'fps', 'durationSec'].includes(t.name);
  setBrief(t.name, num ? (t.value === '' ? null : Number(t.value)) : t.value);
});
document.addEventListener('change', async (ev) => {
  const t = ev.target;
  try {
    if (t.id === 'planner-file' && t.files?.length) {
      const fd = new FormData(); fd.append('role', 'reference'); fd.append('files', t.files[0]);
      toast(`Uploading ${t.files[0].name}…`, 60000);
      const assets = await api(`/api/projects/${S.cur.project.id}/assets`, {method: 'POST', body: fd});
      const refs = [...new Set([...(S.cur.project.brief.plannerRefs || []), assets.at(-1)?.file].filter(Boolean))];
      await api(`/api/projects/${S.cur.project.id}`, {method: 'PATCH', body: {brief: {plannerRefs: refs}}});
      await loadProject(S.cur.project.id); renderProject(); toast('Sample video added. Preparing snapshots...'); return;
    }
    if (t.dataset.plannerRef) {
      const refs = new Set(S.cur.project.brief.plannerRefs || []); t.checked ? refs.add(t.dataset.plannerRef) : refs.delete(t.dataset.plannerRef);
        setBrief('plannerRefs', [...refs]); updatePlannerPreflight(); return;
    }
    if (t.dataset.role) { await api(`/api/projects/${S.cur.project.id}/assets/${encodeURIComponent(t.dataset.role)}`, {method: 'PATCH', body: {role: t.value}}); return; }
    if (t.dataset.note != null) { await api(`/api/projects/${S.cur.project.id}/assets/${encodeURIComponent(t.dataset.note)}`, {method: 'PATCH', body: {note: t.value}}); return; }
    if (t.name === 'claude-model') { S.state.settings = await api('/api/settings', {method: 'PUT', body: {ai: {model: t.value}}}); S.aiOpen = true; renderHome(); toast(t.value ? `MotionStudio will use ${t.value}.` : 'MotionStudio will use the Claude Code default model.'); return; }
    if (t.name === 'ai-provider') { S.state.settings = await api('/api/settings', {method: 'PUT', body: {ai: {provider: t.value}}}); S.aiOpen = true; renderHome(); return; }
    if (t.name === 'plannerProvider') { S.state.settings = await api('/api/settings', {method: 'PUT', body: {ai: {provider: t.value}}}); renderProject(); return; }
    if (t.name?.startsWith('planner')) { setBrief(t.name, t.value); return; }
    if (t.name === 'presetId') { await flushSave(); S.cur.project = await api(`/api/projects/${S.cur.project.id}`, {method: 'PATCH', body: {presetId: t.value}}); renderProject(); return; }
    if (t.name === 'brandId' || t.name === 'width' || t.name === 'height') { await flushSave(); renderBrief(); }
    if (t.id === 'file') uploadFiles([...t.files]);
    if (t.dataset.lookMood !== undefined) { const st = lookState(); st.gradeMood = t.value; await saveLook(st); return; }
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
