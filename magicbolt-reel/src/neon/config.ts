// =====================================================================
//  AGENCY OS REEL — NEON VERSION (dark, glass, condensed type)
//  Same voiceover and script as src/agency, different look.
//  Each scene has its own `dur` (seconds); every cue inside a scene is in
//  seconds FROM THE START OF THAT SCENE. Synced to
//  public/agency-flow-video_audio.mp3 — "// VO" is where the scene starts.
// =====================================================================

export const VIDEO = {
  fps: 30,
  voiceover: 'agency-flow-video_audio.mp3', // in /public
  music: '', // e.g. 'music.mp3' (put in /public)
  musicVolume: 0.12,
};

export const N = {
  bg: '#07080E',
  card: '#0F111B',
  line: 'rgba(255,255,255,0.16)',
  text: '#F4F6FF',
  dim: '#8B90A8',
  cyan: '#19D3F3',
  lime: '#C8FF3D',
  pink: '#FF4D8D',
  red: '#FF4B4B',
  violet: '#8B6CFF',
  amber: '#FFB02E',
  blue: '#2B59FF',
};

export const BRAND = {
  name: 'MagicBolt',
  suffix: 'AI',
  yours: 'Your Agency',
  url: 'magicbolt.ai/pricing',
};

export type IcoName = 'post' | 'star' | 'pin' | 'chart';
export type MiniKind = 'tab' | 'key' | 'bill';

// ---------- 1 · Hook ---------- VO 0.0
export const S1 = {
  dur: 3.4,
  pre: ['If you run a', 0.15] as [string, number],
  lines: [['Digital', 1.1], ['Marketing', 1.45], ['Agency', 1.8]] as [string, number][],
};

// ---------- 2 · 10 tools ---------- VO 3.4
export const S2 = {
  dur: 5.9,
  pre: ['Aapka din jaata hai…', 0.3] as [string, number],
  count: 10,
  rows: [
    {word: 'Tools', kind: 'tab' as MiniKind, color: N.cyan, at: 1.6},
    {word: 'Logins', kind: 'key' as MiniKind, color: N.violet, at: 2.86},
    {word: 'Bills', kind: 'bill' as MiniKind, color: N.amber, at: 3.86},
  ],
  tail: ['// right?', 5.3] as [string, number],
};

// ---------- 3 · Everything is separate ---------- VO 9.3
export const S3 = {
  dur: 8.15,
  tag: 'alag',
  wins: [
    {title: 'Posting', icon: 'post' as IcoName, color: N.pink, at: 0.5},
    {title: 'Reviews', icon: 'star' as IcoName, color: N.amber, at: 1.5},
    {title: 'GBP', icon: 'pin' as IcoName, color: N.cyan, at: 3.0},
    {title: 'Reports', icon: 'chart' as IcoName, color: N.lime, at: 5.3},
  ],
  weekAt: 6.3,
  week: 'Report = pura Sunday',
};

// ---------- 4 · Client asks ---------- VO 17.45
export const S4 = {
  dur: 2.85,
  line: ['Aur client poochta hai', 0.15] as [string, number],
  from: 'Client',
  typingAt: 0.7,
  bubble: ['Kaam kya hua?', 1.65] as [string, number],
};

// ---------- 5 · Reveal ---------- VO 20.3
export const S5 = {
  dur: 6.7,
  intro: ['Isliye humne banaya', 0.15] as [string, number],
  logoAt: 2.1,
  tagline: ['Your Agency OS', 4.0] as [string, number],
  dashAt: 4.6,
};

// ---------- 6 · Features (bento grid) ---------- VO 27.0
export const S6 = {
  dur: 8.6,
  cards: [
    {title: 'Social posting', icon: 'post' as IcoName, color: N.pink, at: 0.16},
    {title: 'GBP automation', icon: 'pin' as IcoName, color: N.cyan, at: 1.96},
    {title: 'Review management', icon: 'star' as IcoName, color: N.amber, at: 4.2},
    {title: 'Client reports', icon: 'chart' as IcoName, color: N.lime, at: 5.42},
  ],
  closer: ['Sab ek dashboard se.', 6.72] as [string, number],
};

// ---------- 7 · White-label ---------- VO 35.6
export const S7 = {
  dur: 6.8,
  cardAt: 0.2,
  strikeAt: 2.2, // "MagicBolt nahi dikhega"
  swapAt: 3.7, // "aapka brand dikhega"
  line: ['Aapke brand naam se.', 3.9] as [string, number],
  stamp: ['White-label', 5.44] as [string, number],
};

// ---------- 9 · Offer ---------- VO 42.4
export const S9 = {
  dur: 5.35,
  heading: ['Now my offer is', 0.18] as [string, number],
  rows: [
    {no: true, text: 'Lock-in', at: 1.4},
    {no: true, text: 'Setup fee', at: 2.65},
    {no: false, text: 'Cancel anytime', at: 4.4},
  ],
};

// ---------- 10 · Free trial ---------- VO 47.75
export const S10 = {
  dur: 3.45,
  l1: ['Pehle', 0.15] as [string, number],
  l2: ['Free trial karo', 0.5] as [string, number],
  ticketAt: 0.2,
  m1: ['Pasand aaye toh', 1.8] as [string, number],
  m2: ['Continue karo', 2.55] as [string, number],
};

// ---------- 11 · Risk zero ---------- VO 51.2
export const S11 = {
  dur: 2.2,
  q: ['Risk?', 0.75] as [string, number],
  gaugeAt: 0.1,
  zeroAt: 1.5,
  a: ['Zero.', 1.65] as [string, number],
};

// ---------- 12 · CTA ---------- VO 53.4
export const S12 = {
  dur: 6.6,
  l1: ['Toh apna', 0.15] as [string, number],
  big1: ['White-label', 2.4] as [string, number],
  big2: ['AI SaaS', 2.75] as [string, number],
  l3: ['Setup karo', 3.8] as [string, number],
  withAt: 4.45,
  logoAt: 4.6,
  urlAt: 5.2,
  clickAt: 5.75,
};
