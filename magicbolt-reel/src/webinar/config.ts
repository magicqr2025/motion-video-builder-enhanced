// =====================================================================
//  AI AGENCY WEBINAR REEL — bright, glossy, with a 3D city.
//  Edit this file to change text, timings and captions.
//  Each scene has its own `dur` (seconds); every cue inside a scene is in
//  seconds FROM THE START OF THAT SCENE. Change a `dur` and everything
//  after it shifts automatically.
//  Timings are synced to public/webinar-voiceover.mp3 (43.3 s, taken from
//  "Apna boss baniye .mp4"). Re-sync `dur`, cue and `caps` times if the audio changes.
// =====================================================================

export const VIDEO = {
  fps: 30,
  voiceover: 'webinar-voiceover.mp3', // put this file in /public — it is picked up automatically
  music: '', // e.g. 'music.mp3' (put in /public)
  musicVolume: 0.12,
  captions: false, // footer captions (text and timings live in each scene's `caps`)
};

export const W = {
  ink: '#1B1640',
  slate: '#5B5680',
  line: '#E6E0FA',
  purple: '#6C3BFF',
  violet: '#9B5CFF',
  pink: '#FF2E8A',
  yellow: '#FFC928',
  orange: '#FF7A1A',
  blue: '#1E78FF',
  cyan: '#16C8F0',
  green: '#12C98A',
  red: '#FF4B55',
  wash: ['#DCCFFF', '#FFD2EB', '#FFE8BC'],
};

export const BRAND = {logo: 'magicbolt-logo.png', name: 'MagicBolt AI'};
// Pictures in /public used as stickers
export const ART = {
  robot: 'AI Robot Recommends a Local Shop.png',
  growth: 'Playful Local Business Growth Dashboard.png',
};

// One caption line: [text, start, end] in scene-local seconds
export type Cap = [string, number, number];

// The five local businesses in the 3D city. `cell` is the grid position (x, z); the agency is at 0,0.
export type ShopIcon = 'clinic' | 'salon' | 'cafe' | 'gym' | 'store';
export const SHOPS: {name: string; icon: ShopIcon; color: string; cell: [number, number]}[] = [
  {name: 'Café', icon: 'cafe', color: W.orange, cell: [-1, 1]},
  {name: 'Salon', icon: 'salon', color: W.pink, cell: [1, 1]},
  {name: 'Store', icon: 'store', color: W.green, cell: [0, 2]},
  {name: 'Clinic', icon: 'clinic', color: W.cyan, cell: [-1, -1]},
  {name: 'Gym', icon: 'gym', color: W.purple, cell: [1, -1]},
];

// ---------- 1 · Hook ----------
export const S1 = {
  dur: 8.1,
  l1: ['AI aapki', 0.05] as [string, number],
  big: ['JOB', 0.9] as [string, number],
  l2: ['nahi lega.', 1.14] as [string, number],
  cardsAt: 2.5,
  line: ['Jo AI use karna jaanta hai…', 2.62] as [string, number],
  swapAt: 4.9, // "woh zaroor le lega"
  line2: ['…woh zaroor le lega.', 4.94] as [string, number],
  left: {tag: 'Without AI', before: 'Working', after: 'Replaced'},
  right: {tag: 'Uses AI', before: 'Learning', after: 'Hired'},
  bossAt: 6.54,
  boss: ['Toh aap', 'BOSS', 'baniye!'],
  caps: [
    ['AI aapki job nahi lega.', 0.0, 1.9],
    ['Lekin jo AI use karna', 2.62, 4.0],
    ['jaanta hai,', 4.0, 4.75],
    ['woh zaroor le lega.', 4.94, 5.95],
    ['Toh aap boss baniye.', 6.54, 7.9],
  ] as Cap[],
};

// ---------- 2 · Look at your city ----------
export const S2 = {
  dur: 3.7,
  l1: ['Apni city mein dekhiye', 0.16] as [string, number],
  swapAt: 1.68,
  l2: ['Har business', 1.72] as [string, number],
  l3: ['grow karna chahta hai', 2.26] as [string, number],
  chipsAt: 0.55,
  chipGap: 0.22,
  caps: [
    ['Apni city mein dekhiye.', 0.16, 1.45],
    ['Har business grow karna', 1.72, 2.84],
    ['chahta hai.', 2.84, 3.55],
  ] as Cap[],
};

// ---------- 3 · They need someone ----------
export const S3 = {
  dur: 6.6,
  l1: ['AI se growth ho sakti hai', 0.2] as [string, number],
  bubblesAt: 0.3,
  bubble1: 'AI',
  howAt: 2.58,
  l2: ['Bas yeh nahi pata…', 2.58] as [string, number],
  how: ['KAISE?', 3.44] as [string, number],
  bubble2: 'Kaise?',
  searchAt: 4.5, // search bar + radar pulses
  query: 'AI growth expert near me',
  need: ['Unhe koi chahiye', 4.64] as [string, number],
  needSub: ['jo unki help kare', 5.28] as [string, number],
  caps: [
    ['Unhe pata hai AI se', 0.14, 1.12],
    ['growth ho sakti hai,', 1.12, 2.25],
    ['bas yeh nahi pata, kaise.', 2.58, 4.1],
    ['Unhe koi chahiye', 4.64, 5.28],
    ['jo unki help kare.', 5.28, 6.35],
  ] as Cap[],
};

// ---------- 4 · That someone is you ----------
export const S4 = {
  dur: 2.15,
  pinAt: 0.8,
  result: '1 match found',
  l1: ['Woh koi', 0.14] as [string, number],
  l2: ['AAP ho sakte hain', 0.82] as [string, number],
  pinLabel: 'AAP',
  caps: [['Woh koi aap ho sakte hain.', 0.14, 2.05]] as Cap[],
};

// ---------- 5 · MagicBolt AI opportunity ----------
export const S5 = {
  dur: 10.1,
  logoAt: 0.1,
  l1: ['aapko de raha hai', 1.0] as [string, number],
  l2: ['yeh OPPORTUNITY', 1.5] as [string, number],
  hqAt: 2.9, // logo shrinks, the agency building rises
  pre: ['Apni city mein start kijiye', 2.93] as [string, number],
  head1: ['Apni AI Digital', 3.75] as [string, number],
  head2: ['Marketing Agency', 4.89] as [string, number],
  sign: 'Your AI Agency',
  badgesAt: 5.2,
  badges: [
    {text: 'SEO', color: W.blue},
    {text: 'AEO', color: W.purple},
    {text: 'GEO', color: W.pink},
    {text: 'Ads', color: W.orange},
    {text: 'Social', color: W.green},
    {text: 'AI', color: W.cyan},
  ],
  cards: [
    {title: 'Training', sub: 'Step-by-step, live', kind: 'train' as const, color: W.purple, at: 6.63},
    {title: 'Software', sub: 'Ready-made AI tools', kind: 'soft' as const, color: W.blue, at: 7.47},
    {title: 'First sale tak support', sub: 'Hum saath rahenge', kind: 'support' as const, color: W.pink, at: 7.97},
  ],
  caps: [
    ['MagicBolt AI aapko', 0.1, 1.35],
    ['yeh opportunity de raha hai.', 1.35, 2.7],
    ['Apni city mein apni AI', 2.93, 4.57],
    ['digital marketing agency', 4.57, 5.69],
    ['start kijiye.', 5.69, 6.4],
    ['Training, software,', 6.63, 7.97],
    ['first sale tak', 7.97, 8.73],
    ['poora support hum denge.', 8.73, 10.0],
  ] as Cap[],
};

// ---------- 6 · Earn from your own city ----------
export const S6 = {
  dur: 5.15,
  arcsAt: 0.15, // client lines connect one by one
  arcGap: 0.3,
  cardAt: 0.2,
  label: 'Aapki monthly income',
  countFrom: 0.9,
  countDur: 1.9,
  amount: 200000,
  range: '₹1–2 lakh / month',
  rangeSub: 'apni hi city se',
  note: 'Earning potential. Results depend on your effort.',
  toast: 'New client',
  stamp: ['Apne boss khud baniye', 3.6] as [string, number],
  caps: [
    ['Apni city se mahine ka', 0.11, 1.5],
    ['ek se do lakh kama sakte hain.', 1.5, 3.35],
    ['Apne boss khud baniye.', 3.6, 4.95],
  ] as Cap[],
};

// ---------- 7 · CTA ----------
export const S7 = {
  dur: 7.8,
  q1: ['Toh phir kya', 0.14] as [string, number],
  q2: ['soch rahe hain?', 0.66] as [string, number],
  bigAt: 1.7,
  b1: ['Aaj hi apna', 1.76] as [string, number],
  b2: ['AI CAREER', 2.26] as [string, number],
  b3: ['chuniye', 4.36] as [string, number],
  logoAt: 5.1,
  ticketAt: 4.95,
  ticket: {stub: 'FREE', title: 'Live Webinar', sub: 'Start your AI Marketing Agency', chips: ['Training', 'Software', 'Support']},
  buttonAt: 5.22,
  button: 'Join the Free Webinar',
  tapAt: 6.7,
  caps: [
    ['Toh phir kya soch rahe hain?', 0.14, 1.4],
    ['Aaj hi AI ke saath', 1.76, 3.18],
    ['apna career aur growth chuniye.', 3.18, 4.95],
    ['Join kijiye hamara free webinar.', 5.22, 7.15],
  ] as Cap[],
};

// Scene start times (global seconds), derived from the durations above
const DURS = [S1.dur, S2.dur, S3.dur, S4.dur, S5.dur, S6.dur, S7.dur];
const at = (i: number) => DURS.slice(0, i).reduce((a, b) => a + b, 0);
export const T = {s1: at(0), s2: at(1), s3: at(2), s4: at(3), s5: at(4), s6: at(5), s7: at(6), end: at(7)};
