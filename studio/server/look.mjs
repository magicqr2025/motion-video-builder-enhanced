// "Look & feel" options chosen before the concepts. One list drives the board in the browser, what is saved in
// project.json (project.look), the look.json that the video's finishing layer reads, and what Claude is told.
//   kind "layer": applied by the app as a finishing layer over any video (StudioLook.tsx), no Claude run.
//   kind "built": designed into the video by Claude (camera, transitions, objects, actions).
// Levels: 0 Off, 1 Light, 2 Full.

export const MOODS = ['neutral', 'warm', 'cool', 'cinematic'];

export const LOOK_SPEC = {
  groups: [
    {id: 'motion', title: 'Motion', items: [
      {key: 'motionBlur', kind: 'layer', title: 'Motion blur', desc: 'Fast movement smears like a real camera. Final render only, so renders take longer.', light: 'soft blur on fast moves', full: 'strong cinematic blur (slowest render)'},
      {key: 'physics', kind: 'built', kit: 'SpringIn / useSpringK / stagger', title: 'Spring physics', desc: 'Things overshoot and settle instead of sliding linearly.', light: 'gentle settle on entrances', full: 'bouncy, springy entrances everywhere'},
      {key: 'camera', kind: 'built', kit: 'CameraRig, Parallax', title: 'Camera moves', desc: 'Push-ins, parallax and glides to what is being explained.', light: 'slow subtle push-in per scene', full: 'push-ins, parallax layers and guided glides'},
      {key: 'transitions', kind: 'built', kit: 'SceneSeq + transitionFor', title: 'Scene transitions', desc: 'How one scene leaves and the next arrives.', light: 'polished crossfades', full: 'designed slides, wipes, flips and scale-throughs'},
    ]},
    {id: 'finish', title: 'Finish', items: [
      {key: 'grade', kind: 'layer', title: 'Colour grade', desc: 'One consistent colour mood over the whole video.', light: 'subtle', full: 'strong'},
      {key: 'vignette', kind: 'layer', title: 'Vignette', desc: 'Edges darken slightly to focus the eye.', light: 'subtle', full: 'strong'},
      {key: 'grain', kind: 'layer', title: 'Film grain', desc: 'Fine texture so digital gradients feel filmed.', light: 'fine', full: 'visible'},
      {key: 'leaks', kind: 'layer', title: 'Light leaks', desc: 'A warm light sweep at scene changes.', light: 'every other scene change', full: 'every scene change, brighter'},
    ]},
    {id: 'objects', title: 'Objects', items: [
      {key: 'objects3d', kind: 'built', kit: 'Obj3D', title: 'Real 3D objects', desc: 'Glossy 3D phones, coins, chat bubbles and QR cards (three.js).', light: 'one or two hero 3D objects', full: '3D objects through many scenes'},
      {key: 'illustration', kind: 'built', title: 'Illustrations', desc: 'Glossy brand-style illustrations and icons. New art is only generated if you have an image key, otherwise existing art is reused.', light: 'a few illustrations', full: 'illustration-rich scenes'},
      {key: 'particles', kind: 'built', kit: 'Particles', title: 'Particles & floating objects', desc: 'Sparkles and drifting shapes behind the content.', light: 'a few subtle sparkles', full: 'rich floating layer'},
    ]},
    {id: 'actions', title: 'Actions', items: [
      {key: 'cursor', kind: 'built', kit: 'CursorPath', title: 'Cursor choreography', desc: 'A cursor that glides, hovers, clicks with a ripple, drags and types.', light: 'a few key clicks', full: 'full click-through'},
      {key: 'uiActions', kind: 'built', kit: 'Toggle, CountUp, ProgressBar, Notification', title: 'UI animations', desc: 'Toggles flipping, notifications sliding in, numbers counting up, bars filling.', light: 'a few', full: 'throughout'},
      {key: 'guidedFocus', kind: 'built', kit: 'Spotlight', title: 'Guided focus', desc: 'Dim everything except the part being explained, with a glowing outline.', light: 'on key moments', full: 'on every explained part'},
      {key: 'captions', kind: 'built', kit: 'KineticCaptions', title: 'Kinetic captions', desc: 'Captions that follow the voice word by word.', light: 'clean word-by-word', full: 'big kinetic styling'},
    ]},
    {id: 'sound', title: 'Sound', items: [
      {key: 'sfx', kind: 'layer', title: 'Sound effects', desc: 'Whoosh and pop sounds at scene changes, a chime at the end. Built-in sounds, no files needed.', light: 'soft whooshes at scene changes', full: 'whoosh, pop and an ending chime'},
    ]},
  ],
  bundles: [
    {id: 'none', name: 'Nothing extra', tagline: 'Plain, fast, cheapest', levels: {}},
    {id: 'clean', name: 'Clean tutorial', tagline: 'Clear and calm for how-tos', levels: {vignette: 1, grade: 1, sfx: 1, physics: 1, camera: 1, transitions: 1, cursor: 1, uiActions: 1, guidedFocus: 1}},
    {id: 'glossy', name: 'Premium glossy', tagline: 'Rich 3D, polished motion', levels: {grain: 1, vignette: 1, grade: 1, leaks: 1, motionBlur: 1, sfx: 1, physics: 2, camera: 1, transitions: 2, objects3d: 1, illustration: 1, particles: 1, uiActions: 1, captions: 1}},
    {id: 'energy', name: 'High-energy reel', tagline: 'Bold, fast, scroll-stopping', levels: {grain: 1, vignette: 2, grade: 2, leaks: 2, motionBlur: 2, sfx: 2, physics: 2, camera: 2, transitions: 2, objects3d: 1, particles: 2, captions: 2}},
  ],
  moods: MOODS,
};

const ITEMS = LOOK_SPEC.groups.flatMap((g) => g.items);
export const LAYER_KEYS = ITEMS.filter((i) => i.kind === 'layer').map((i) => i.key);
export const BUILT_KEYS = ITEMS.filter((i) => i.kind === 'built').map((i) => i.key);

const lvl = (v) => { const n = Math.round(Number(v)); return n >= 2 ? 2 : n === 1 ? 1 : 0; };

// merge an edit into the saved look; unknown keys are dropped, levels clamped to 0..2
export const cleanLook = (edit = {}, prev = {}) => {
  const levels = {};
  for (const it of ITEMS) levels[it.key] = lvl(edit.levels && it.key in edit.levels ? edit.levels[it.key] : prev.levels?.[it.key] ?? 0);
  const bundle = typeof edit.bundle === 'string' ? (LOOK_SPEC.bundles.some((b) => b.id === edit.bundle) ? edit.bundle : '') : prev.bundle ?? '';
  const gradeMood = MOODS.includes(edit.gradeMood) ? edit.gradeMood : MOODS.includes(prev.gradeMood) ? prev.gradeMood : 'neutral';
  return {levels, gradeMood, bundle, reviewed: true, applied: prev.applied ?? null};
};
export const bundleLevels = (id) => {
  const b = LOOK_SPEC.bundles.find((x) => x.id === id);
  return Object.fromEntries(ITEMS.map((it) => [it.key, b?.levels?.[it.key] ?? 0]));
};

// what the video's finishing layer reads (src/studio/<id>/look.json)
export const layerFile = (look, sceneStarts = []) => ({
  grain: look.levels.grain, vignette: look.levels.vignette, grade: look.levels.grade, gradeMood: look.gradeMood,
  leaks: look.levels.leaks, motionBlur: look.levels.motionBlur, sfx: look.levels.sfx,
  sceneStarts: sceneStarts.map((s) => Math.round(s * 100) / 100),
});

const LABEL = ['Off', 'Light', 'Full'];
const describe = (it, n) => `${it.title} (${LABEL[n]}, level=${n}): ${n === 2 ? it.full : it.light}${it.kit ? ` -> kit: ${it.kit}` : ""}`;
export const builtLevels = (look) => Object.fromEntries(BUILT_KEYS.map((k) => [k, look?.levels?.[k] ?? 0]));

// the look as the agent should read it (added to the project context)
export const lookContext = (look) => {
  if (!look?.reviewed) return '';
  const on = (kind) => ITEMS.filter((i) => i.kind === kind && look.levels[i.key] > 0);
  const layer = on('layer'), built = on('built');
  const lines = ['### Look & feel (chosen by the user)'];
  if (layer.length) lines.push(`Applied automatically by the app as a finishing layer, so do NOT build these in the video's code: ${layer.map((i) => describe(i, look.levels[i.key]) + (i.key === 'grade' ? `, mood ${look.gradeMood}` : '')).join('; ')}.`);
  if (built.length) lines.push(`Build these into the video with the effects kit (read src/studio/kit/KIT.md first; pass the level; show them in the concept samples):\n${built.map((i) => `- ${describe(i, look.levels[i.key])}`).join('\n')}`);
  const off = ITEMS.filter((i) => i.kind === 'built' && !look.levels[i.key]).map((i) => i.title.toLowerCase());
  if (off.length) lines.push(`Not wanted (keep it simple, do not add): ${off.join(', ')}.`);
  if (built.some((i) => i.key === 'illustration')) lines.push('Illustrations: generate new art only if OPENAI_API_KEY is set, otherwise reuse the existing art in public/.');
  return lines.join('\n');
};

// after the video is built: what changed in the Claude-built options since they were last applied
export const lookChanges = (look) => {
  const was = look?.applied?.levels ?? {};
  return BUILT_KEYS.filter((k) => (look?.levels?.[k] ?? 0) !== (was[k] ?? 0)).map((k) => ({key: k, from: was[k] ?? 0, to: look.levels[k]}));
};
export const lookChangePrompt = (look, changes, compId) => `The user changed the Look & feel options of the built video ${compId}. Apply exactly these changes and leave everything else (text, timing, audio, colours) as it is:
${changes.map((c) => { const it = ITEMS.find((i) => i.key === c.key); return `- ${c.to === 0 ? `Remove: ${it.title}` : describe(it, c.to)} (was ${LABEL[c.from]})`; }).join('\n')}
Typecheck, render 3-4 check stills where the change is visible, look at them, fix problems, and reply in one or two lines.`;
