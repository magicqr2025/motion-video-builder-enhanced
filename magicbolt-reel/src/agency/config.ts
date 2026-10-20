// =====================================================================
//  AGENCY OS REEL — edit this file to change text, timings and offer terms.
//  Each scene has its own `dur` (seconds); every cue inside a scene is in
//  seconds FROM THE START OF THAT SCENE. Change a `dur` and everything
//  after it shifts automatically.
//  Timings are synced to public/agency-flow-video_audio.mp3 (59.4s).
//  The "// VO" note on each scene is where it starts in that audio.
// =====================================================================
import {C} from '../config';

export const VIDEO = {
  fps: 30,
  voiceover: 'agency-flow-video_audio.mp3', // in /public
  music: '', // e.g. 'music.mp3' (put in /public)
  musicVolume: 0.12,
};

// Optional real images (put in /public). Leave '' to use the drawn versions.
export const ASSETS = {
  ownerPhoto: '', // scene 1 — agency owner at desk
  dashboard: '', // scenes 5 & 7 — real dashboard screenshot
};

export const T = {
  ...C,
  paper: '#F5F1E8',
  grid: 'rgba(12,16,48,0.07)',
  mute: '#DCD8EA', // placeholder bars in the drawn dashboard
};

export const BRAND = {
  name1: 'Magic',
  name2: 'Bolt',
  suffix: 'AI',
  url: 'magicbolt.ai/pricing',
};

export type GlyphName = 'chat' | 'mail' | 'chart' | 'cal' | 'star' | 'lock' | 'pin' | 'doc' | 'bell' | 'people';

// ---------- 1 · Hook ---------- VO 0.0
export const S1 = {
  dur: 3.4,
  l1: ['If you run a', 0.15] as [string, number],
  l2: ['Digital Marketing', 1.1] as [string, number],
  big: ['Agency', 1.8] as [string, number],
  artAt: 0.3,
};

// ---------- 2 · 10 tools ---------- VO 3.4
export const S2 = {
  dur: 5.9,
  lines: [['10 tools.', 1.6], ['10 logins.', 2.86], ['10 bills.', 3.86]] as [string, number][],
  iconsAt: 0.15,
  iconGap: 0.12,
  shakeAt: 2.9,
  // little "chaos" bubbles around the pile
  chaos: [
    {text: 'Password?', x: 200, y: 960, rot: -8, at: 2.0},
    {text: 'OTP?', x: 905, y: 1130, rot: 7, at: 3.0},
    {text: 'Bill due!', x: 880, y: 950, rot: 6, at: 4.0},
  ],
};

// ---------- 3 · Everything is separate ---------- VO 9.3
export const S3 = {
  dur: 8.15,
  tag: 'alag',
  boxes: [
    {title: 'Posting', icon: 'chat' as GlyphName, color: T.pink, at: 0.5},
    {title: 'Reviews', icon: 'star' as GlyphName, color: T.amber, at: 1.5},
    {title: 'GBP', icon: 'pin' as GlyphName, color: T.blue, at: 3.0},
    {title: 'Reports', icon: 'chart' as GlyphName, color: T.green, at: 5.3},
  ],
  closer: ['Report mein pura Sunday', 6.6] as [string, number],
};

// ---------- 4 · Client asks ---------- VO 17.45
export const S4 = {
  dur: 2.85,
  line: ['Aur client poochta hai:', 0.15] as [string, number],
  from: 'Client',
  typingAt: 0.7,
  bubble: ['“Kaam kya hua?”', 1.65] as [string, number],
};

// ---------- 5 · Reveal ---------- VO 20.3
export const S5 = {
  dur: 6.7,
  intro: ['Isliye humne banaya', 0.15] as [string, number],
  logoAt: 2.1,
  tagline: ['Your Agency OS', 4.0] as [string, number],
  dashAt: 4.6,
};

// ---------- 6 · Features ---------- VO 27.0
export const S6 = {
  dur: 8.6,
  features: [
    {title: 'Social posting', icon: 'chat' as GlyphName, color: T.pink, at: 0.16},
    {title: 'GBP automation', icon: 'pin' as GlyphName, color: T.blue, at: 1.96},
    {title: 'Review management', icon: 'star' as GlyphName, color: T.amber, at: 4.2},
    {title: 'Client reports', icon: 'chart' as GlyphName, color: T.green, at: 5.42},
  ],
  closer: ['Sab ek dashboard se.', 6.72] as [string, number],
};

// ---------- 7 · White-label ---------- VO 35.6
export const S7 = {
  dur: 6.8,
  line: ['Aapke brand naam se.', 3.9] as [string, number],
  dashAt: 0.2,
  swapAt: 3.7,
  yourBrand: 'Your Agency',
  stamp: ['WHITE-LABEL', 5.44] as [string, number],
};

// ---------- 8 · Proof numbers ----------
// OFF: not in the voiceover. Needs REAL numbers and its own VO line before turning on.
export const S8 = {
  on: false,
  dur: 7,
  agencies: 0,
  clients: 0,
  agenciesLabel: 'agencies',
  clientsLabel: 'clients managed',
  agenciesAt: 0.4,
  clientsAt: 2.6,
};

// ---------- 9 · Offer ---------- VO 42.4
export const S9 = {
  dur: 5.35,
  heading: ['Now my offer is', 0.18] as [string, number],
  boxAt: 0.7,
  terms: [['No lock-in.', 1.4], ['No setup fee.', 2.65], ['Cancel anytime.', 4.4]] as [string, number][],
};

// ---------- 10 · Free trial ---------- VO 47.75
export const S10 = {
  dur: 3.45,
  // The voiceover names no trial length. Set days (e.g. 14) to show a day counter and "14 din free".
  days: 0,
  daysBadge: 'din free',
  calAt: 0.1,
  countDur: 1.0,
  badge: 'Pehle free trial karo',
  badgeAt: 0.5,
  l1: ['Pasand aaye toh', 1.8] as [string, number],
  l2: ['continue karo', 2.55] as [string, number],
};

// ---------- 11 · Risk zero ---------- VO 51.2
export const S11 = {
  dur: 2.2,
  q: ['Risk?', 0.75] as [string, number],
  circleAt: 0.2,
  zeroAt: 1.5,
  a: ['Zero.', 1.65] as [string, number],
};

// ---------- 12 · CTA ---------- VO 53.4
export const S12 = {
  dur: 6.6,
  l1: ['Toh apna', 0.15] as [string, number],
  big: ['White-label AI SaaS', 2.4] as [string, number],
  l3: ['setup karo', 3.8] as [string, number],
  withAt: 4.45,
  logoAt: 4.6,
  urlAt: 5.2,
};
