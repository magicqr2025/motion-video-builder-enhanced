// =====================================================================
//  "STOP SELLING POSTS, SELL SAAS" REEL — edit this file for text and timings.
//  Each scene has its own `dur` (seconds); every cue inside a scene is in
//  seconds FROM THE START OF THAT SCENE. Change a `dur` and everything
//  after it shifts automatically.
//  Synced to public/w-instapost mat becho.mp3 (48.4s) — "// VO" is where the
//  scene starts in that audio (word times from a whisper transcript).
//  The [bracket] tags in the script are voice directions only — never on screen.
// =====================================================================

export const VIDEO = {
  fps: 30,
  voiceover: 'w-instapost mat becho.mp3', // in /public (48.4s)
  music: '',
  musicVolume: 0.12,
};

// MagicBolt brand (logo blues + gold/orange), plus the pink/purple of the site illustrations
export const M = {
  navy: '#0B1E4A',
  ink: '#16204A',
  slate: '#5B6585',
  line: '#E2E5F3',
  blue: '#1582D5',
  deep: '#1354BC',
  gold: '#FDC60B',
  orange: '#F7941D',
  pink: '#ED1C6F',
  purple: '#7B3FF2',
  green: '#16A34A',
  red: '#EF4444',
  wash: ['#FFFFFF', '#F3F0FF', '#FCEFFA'],
  ig: ['#FEDA75', '#FA7E1E', '#D62976', '#962FBF', '#4F5BD5'],
};

export const ASSETS = {
  logo: 'magicbolt-logo.png',
  planner: 'Glossy Social Media Planner Scene.png',
  growth: 'Playful Local Business Growth Dashboard.png',
};

export const BRAND = {
  yours: 'Your Agency',
  domain: 'app.youragency.com',
  site: 'www.magicbolt.ai',
};

type Cue = [string, number];

// ---------- 1 · Hook ---------- VO 0.0  "Agency chalate ho? Toh... ab Instagram posts mat becho."
export const S1 = {
  dur: 4.05,
  l1: ['Agency chalate ho?', 0.1] as Cue,
  postsAt: 1.3,
  l2: ['Instagram posts', 2.2] as Cue,
  l3: ['mat becho.', 3.2] as Cue,
  banAt: 3.3,
};

// ---------- 2 · Stop posts → sell software ---------- VO 4.05
// "Stop selling Instagram posts. Sell your own software instead!"
export const S2 = {
  dur: 4.35,
  l1: ['Stop selling posts.', 0.15] as Cue,
  strikeAt: 1.45,
  swapAt: 2.2, // "Sell your own software instead!"
  l2: ['Sell your own', 2.3] as Cue,
  l3: ['SOFTWARE', 3.1] as Cue,
};

// ---------- 3 · Client vs posts ---------- VO 8.4
// "Posts bechoge, client bolega... 'Itna kyun? Canva se ho jata hai.'"
export const S3 = {
  dur: 4.4,
  l1: ['Posts bechoge…', 0.15] as Cue,
  faceAt: 1.0,
  typingAt: 1.5,
  bubble: ['Itna kyun?', 2.3] as Cue,
  bubble2: ['Canva se ho jata hai.', 3.15] as Cue,
  priceAt: 3.5, // the price tag drops
};

// ---------- 4 · Client vs software ---------- VO 12.8
// "Software bechoge, client bolega... 'Wow, ye aapne banaya?'"
export const S4 = {
  dur: 4.15,
  l1: ['Software bechoge…', 0.15] as Cue,
  dashAt: 0.5,
  faceAt: 1.4,
  bubble: ['Wow, ye aapne banaya?', 2.5] as Cue,
};

// ---------- 5 · Canva vs SaaS ---------- VO 16.95  "Fark samjho... Canva versus SaaS."
export const S5 = {
  dur: 3.0,
  l1: ['Fark samjho…', 0.15] as Cue,
  leftAt: 1.3,
  vsAt: 1.75,
  rightAt: 2.2,
};

// ---------- 6 · Rate vs bill ---------- VO 19.95
// "Posts ka rate — har 30 din negotiate hota hai. Software ka bill — har mahine auto-renew hota hai."
export const S6 = {
  dur: 6.1,
  postAt: 0.1,
  postLine: ['Har 30 din: negotiate', 1.2] as Cue,
  haggleAt: 1.9,
  billAt: 3.05,
  billLine: ['Har mahine: auto-renew', 4.2] as Cue,
  renewAt: 4.85, // months tick over and the bill pays itself
};

// ---------- 7 · No code ---------- VO 26.05  "Aur haan... code likhne ki koi zaroorat nahi."
export const S7 = {
  dur: 2.05,
  codeAt: 0.05,
  l1: ['Code likhne ki', 0.7] as Cue,
  l2: ['zaroorat nahi', 1.6] as Cue,
  banAt: 1.65,
};

// ---------- 8 · White-label ---------- VO 28.1
// "Magic Bolt A-I ka white-label SaaS — aapka logo... aapka domain."
export const S8 = {
  dur: 4.85,
  logoAt: 0.05,
  l1: ['White-label SaaS', 1.65] as Cue,
  swapAt: 3.1, // "aapka logo"
  logoLine: ['Aapka logo', 3.15] as Cue,
  urlAt: 3.95, // "aapka domain"
  urlLine: ['Aapka domain', 4.0] as Cue,
};

// ---------- 9 · Dashboard + features ---------- VO 32.95
// "Client ko dikhega... aapka dashboard. Social posting, Google profile, reviews, reports — sab usme."
export const S9 = {
  dur: 6.4,
  l1: ['Client ko dikhega', 0.1] as Cue,
  l2: ['aapka dashboard', 0.9] as Cue,
  dashAt: 0.4,
  tiles: [
    {label: 'Social posting', icon: 'post', at: 2.6},
    {label: 'Google profile', icon: 'pin', at: 3.2},
    {label: 'Reviews', icon: 'star', at: 3.75},
    {label: 'Reports', icon: 'chart', at: 4.25},
  ] as {label: string; icon: FeatIcon; at: number}[],
  l3: ['Sab usme.', 5.0] as Cue,
};
export type FeatIcon = 'post' | 'pin' | 'star' | 'chart';

// ---------- 10 · Identity shift ---------- VO 39.35
// "Ab aap service agency nahi... Aap SaaS company ho."
export const S10 = {
  dur: 3.5,
  l1: ['Ab aap', 0.12] as Cue,
  oldAt: 0.45, // "Service Agency" badge
  strikeAt: 1.25,
  l2: ['Aap', 2.0] as Cue,
  newAt: 2.3, // "SaaS Company" badge
};

// ---------- 11 · Offer ---------- VO 42.85  "No setup fee. No lock-in. Free trial."
export const S11 = {
  dur: 2.85,
  rows: [
    {no: true, text: 'Setup fee', at: 0.15},
    {no: true, text: 'Lock-in', at: 1.25},
    {no: false, text: 'Free trial', at: 2.1},
  ],
};

// ---------- 12 · CTA ---------- VO 45.7  "Bas signup karo... ya webinar join karo!"
export const S12 = {
  dur: 3.6,
  logoAt: 0.0,
  signup: ['Sign up', 0.25] as Cue,
  clickAt: 0.75,
  or: ['ya', 1.15] as Cue,
  webinar: ['Join Webinar', 1.35] as Cue,
  click2At: 1.8,
  siteAt: 2.0,
};
