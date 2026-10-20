// =====================================================================
//  EDIT THIS FILE to change text, timings, colors, services, clients.
//  All times are in SECONDS, synced to public/voiceover.wav
// =====================================================================

export const VIDEO = {
  fps: 30,
  duration: 33, // total seconds (VO is 31.6s + end-card hold)
  voiceover: 'voiceover.wav', // in /public
  sfx: 'sfx.wav', // set to '' to disable
  music: '', // e.g. 'music.mp3' (put in /public)
  musicVolume: 0.12,
};

export const C = {
  ink: '#0C1030',
  slate: '#566080',
  blue: '#2B59FF',
  violet: '#7B3FF2',
  pink: '#F43F8E',
  orange: '#FB6A1C',
  yellow: '#FFC72C',
  green: '#0CA678',
  amber: '#F79A0B',
  cyan: '#0EA5E0',
  red: '#EF3E46',
};

// Background: vertical wash (top → bottom) + the drifting blob colors
export const BG = {
  wash: ['#EEEBFF', '#FAF7FF', '#FFF3EA'],
  blobs: [C.violet, C.pink, C.orange, C.blue, C.violet],
  line: '#E3E0F5', // hairline borders on white cards
};

export const BRAND = {
  name1: 'Magic',
  name2: 'Bolt',
  url: 'magicbolt.ai',
  cta: 'Start Your Agency Today',
};

// Scene start/end (seconds). Change these if you replace the voiceover.
export const SCENES = {
  s1: [0, 3.22],
  s2: [3.22, 6.0],
  s3: [6.0, 10.52],
  s4: [10.52, 18.32],
  s5: [18.32, 22.94],
  s6: [22.94, 26.7],
  s7: [26.7, 28.6],
  s8: [28.6, 33],
} as const;

// ---------- Scene 1 ----------
export const S1 = {
  line1: [['Want', 0.15], ['to', 0.33], ['start', 0.42]] as [string, number][],
  line2: [['your', 0.72], ['own', 0.86]] as [string, number][],
  big: ['business?', 1.02] as [string, number],
  sub1: [['But', 1.62], ["don't", 1.76], ['know', 1.95]] as [string, number][],
  sub2: [['what', 2.08], ['to', 2.55], ['start?', 2.66]] as [string, number][],
  chips: [
    {text: 'Café?', x: 250, y: 300, color: C.orange, rot: -0.1, at: 1.85},
    {text: 'Franchise?', x: 810, y: 360, color: C.violet, rot: 0.08, at: 2.05},
    {text: 'Online store?', x: 270, y: 1290, color: C.pink, rot: 0.07, at: 2.25},
    {text: 'Boutique?', x: 820, y: 1230, color: C.green, rot: -0.08, at: 2.45},
    {text: 'Bakery?', x: 560, y: 1420, color: C.blue, rot: 0.04, at: 2.65},
  ],
};

// ---------- Scene 2 ----------
export const S2 = {
  heading: ['What if you could…', 3.25] as [string, number],
  typed: ['Start my own digital', 'marketing business'],
  typeStart: 3.75,
  typeDur: 1.6,
  hint: 'Agency mode',
  click: 5.62,
};

// ---------- Scene 3 ----------
export const S3 = {
  withAt: 6.05,
  logoAt: 6.12,
  launch: ['Launch your own', 6.95] as [string, number],
  percentAt: 7.72,
  stamp: ['WHITE LABEL', 8.45] as [string, number],
  line: ['Digital Marketing Business', 9.05] as [string, number],
  chips: [
    {text: 'Your Logo', color: C.blue, at: 9.35},
    {text: 'Your Brand', color: C.pink, at: 9.6},
    {text: 'Your Domain', color: C.green, at: 9.85},
  ],
};

// ---------- Scene 4 ----------
export type IconName = 'pin' | 'chart' | 'chat' | 'star' | 'sparkle' | 'dash' | 'people';
export const S4 = {
  heading: [['Offer', 10.55], ['your', 10.7], ['clients', 10.85]] as [string, number][],
  services: [
    {title: 'Google Business Profile', sub: 'Management', color: C.blue, icon: 'pin' as IconName, at: 10.85},
    {title: 'Google Ranking Services', sub: 'Rank higher in local search', color: C.green, icon: 'chart' as IconName, at: 12.78},
    {title: 'Social Media Management', sub: 'Posts, reels & scheduling', color: C.pink, icon: 'chat' as IconName, at: 14.18},
    {title: 'Reputation Management', sub: 'Reviews & ratings on autopilot', color: C.amber, icon: 'star' as IconName, at: 15.38},
    {title: 'AI-Powered Marketing Tools', sub: 'Content, replies & insights', color: C.violet, icon: 'sparkle' as IconName, at: 16.7},
  ],
};

// ---------- Scene 5 ----------
export const S5 = {
  heading: [['Get', 18.38], ['local', 18.57], ['businesses', 18.85]] as [string, number][],
  heading2: ['as your clients', 19.4] as [string, number],
  hubAt: 18.6,
  clientsStart: 19.0,
  clientsGap: 0.24,
  clients: [
    {name: 'Café', color: C.orange},
    {name: 'Salon', color: C.pink},
    {name: 'Clinic', color: C.cyan},
    {name: 'Gym', color: C.green},
    {name: 'Restaurant', color: C.amber},
    {name: 'Real Estate', color: C.violet},
  ],
  build: ['Build your own', 20.2] as [string, number],
  company: ['Digital Marketing Company', 20.9] as [string, number],
  city: ['in your city', 22.3] as [string, number],
};

// ---------- Scene 6 ----------
export const S6 = {
  line1: [['Sell', 22.98], ['software', 23.3]] as [string, number][],
  line2: [['&', 23.75], ['services', 23.88], ['together', 24.3]] as [string, number][],
  software: {title: 'Software', sub: 'Dashboards & tools', at: 23.3},
  services: {title: 'Services', sub: 'Done-for-you work', at: 23.88},
  plusAt: 23.75,
  togetherAt: 24.3,
  noTechAt: 24.9,
  strikeAt: 25.55,
  noCode: 'No coding.',
  noDev: ['No developers.', 25.9] as [string, number],
  tagline: ['We built the tech. You sell it.', 26.1] as [string, number],
};

// ---------- Scene 7 ----------
export const S7 = {
  big: ['Recurring', 26.72] as [string, number],
  sub: ['monthly revenue', 27.4] as [string, number],
  chartAt: 26.85,
  barsAt: 27.0,
  lineAt: 27.45,
  bars: [0.22, 0.32, 0.43, 0.56, 0.72, 0.92],
  labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
  badge: 'Growing',
  footer: ['as your client base grows', 27.9] as [string, number],
};

// ---------- Scene 8 ----------
export const S8 = {
  l1: ['Launch your own', 28.62] as [string, number],
  l2: ['Digital Marketing', 29.1] as [string, number],
  l3: ['Business', 30.1] as [string, number],
  withAt: 30.66,
  logoAt: 30.78,
  ctaAt: 31.35,
  urlAt: 31.75,
  cursorAt: 31.9,
};
