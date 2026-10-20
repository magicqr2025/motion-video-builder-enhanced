// =====================================================================
//  MAGICQR "HOW IT WORKS" REEL — edit this file for text and timings.
//  Each scene has its own `dur` (seconds); every cue inside a scene is in
//  seconds FROM THE START OF THAT SCENE. Change a `dur` and everything
//  after it shifts automatically.
//  Synced to public/magicqr-whitelabel.mp3 (46.3s) — "// VO" is where the
//  scene starts in that audio.
// =====================================================================

export const VIDEO = {
  fps: 30,
  voiceover: 'magicqr-whitelabel.mp3', // in /public
  captions: true, // word-by-word captions; text and timings are in captions.tsx
  music: '',
  musicVolume: 0.12,
};

export const ASSETS = {
  standee: 'magicqr-standee.webp', // in /public — the real QR standee photo
};

// Brand colours (from the MagicQR identity), plus the Google-style UI colours
export const Q = {
  purple: '#4F429A',
  pink: '#ED1C6F',
  yellow: '#FDBA17',
  ink: '#1B1640',
  slate: '#6B6788',
  line: '#E4E0F3',
  wash: ['#FFFFFF', '#F6F2FF', '#FFF1F7'],
  blue: '#1A73E8',
  green: '#16A34A',
  red: '#EF4444',
  star: '#FBBC04',
  g: ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'], // G-o-o-g-l-e
  boltViolet: '#7B3FF2', // MagicBolt AI logo
  boltBlue: '#2B59FF',
};

export const BRAND = {
  name: 'Magic QR',
  product: 'Review Booster',
};

// The demo business shown inside the phone (placeholder — not a real listing)
export const DEMO = {
  name: 'SUNRISE CAFE',
  address: 'MP Nagar, Bhopal',
  keyword: 'Best cafe in Bhopal',
  review: 'Loved this place! Easily the best cafe in Bhopal — cozy seating, quick service and great coffee. Perfect spot to work or catch up with friends.',
  reviewer: 'Happy Customer',
  search: 'best cafe near me',
};

// ---------- 1 · Hook ---------- VO 0.0  "Customer khush hai, par Google par review nahi dete?"
export const S1 = {
  dur: 3.55,
  l1: ['Customer khush hai,', 0.25] as [string, number],
  l2: ['par Google par', 1.3] as [string, number],
  l3: ['review nahi dete?', 2.35] as [string, number],
  faceAt: 0.3,
  starsAt: 2.3,
};

// ---------- 2 · Why ---------- VO 3.55  "Kyunki unhe pata nahi hai, kya likhna hai."
export const S2 = {
  dur: 2.0,
  l1: ['Kyunki unhe pata nahi', 0.15] as [string, number],
  l2: ['kya likhna hai.', 1.15] as [string, number],
  boxAt: 0.15,
  thought: ['Kya likhun?', 1.2] as [string, number],
};

// ---------- 3 · Title ---------- VO 5.55  "Dekhiye, Magic QR kaise kaam karta hai."
export const S3 = {
  dur: 2.75,
  standAt: 0.1,
  l1: ['How Magic QR', 0.86] as [string, number],
  l2: ['Works', 1.8] as [string, number],
  productAt: 2.1,
};

// ---------- 4 · Step 1: scan ---------- VO 8.3
export const S4 = {
  dur: 3.6,
  l1: ['Customer scans', 1.1] as [string, number],
  l2: ['the Magic QR', 1.75] as [string, number],
  standAt: 0.1,
  scanAt: 1.3,
  doneAt: 2.5,
  phoneAt: 2.8,
};

// ---------- 4b · Step 2: rate ---------- VO 11.9
export const SR = {
  dur: 2.7,
  l1: ['Customer gives', 0.6] as [string, number],
  l2: ['a star rating', 1.4] as [string, number],
  tapsAt: 1.4, // first star tap
  tapGap: 0.25,
  stars: 4,
};

// ---------- 5 · Step 3: 1–3 stars → private feedback ---------- VO 14.6
export const S5 = {
  dur: 6.35,
  l1: ['1–2–3 Star?', 0.6] as [string, number],
  starsAt: 0.6,
  stars: 3,
  formAt: 1.8,
  l2: ['Saved as private Feedback', 2.65] as [string, number],
  flyAt: 3.3,
  inbox: 'Private Feedback',
  blocked: ['Not published on Google', 4.78] as [string, number],
};

// ---------- 6 · Step 3: 4–5 stars → AI writes the review ---------- VO 20.95
export const S6 = {
  dur: 5.15,
  l1: ['4–5 Star?', 0.65] as [string, number],
  starsAt: 0.7,
  stars: 5,
  chipAt: 1.7,
  l2: ['AI writes an', 2.45] as [string, number],
  l3: ['SEO-friendly review', 3.05] as [string, number],
  writingAt: 2.2,
  typeAt: 2.9,
  typeDur: 1.9,
};

// ---------- 7 · Step 4: post ---------- VO 26.1  "Customer bas ek tap mein use Google par post kar deta hai."
export const S7 = {
  dur: 3.2,
  l1: ['Just one tap', 0.75] as [string, number],
  l2: ['Posted on Google', 1.65] as [string, number],
  btnAt: 0.15,
  tapAt: 1.0,
  cardAt: 1.7,
  posted: ['Posted', 2.3] as [string, number],
};

// ---------- 8 · Result ---------- VO 29.3  "Zyada reviews, matlab Google par behtar ranking."
export const S8 = {
  dur: 3.2,
  l1: ['More reviews,', 0.2] as [string, number],
  l2: ['better Google ranking', 1.35] as [string, number],
  searchAt: 0.1,
  listAt: 0.4,
  climbAt: 1.3,
  you: 'Your Business',
};

// ---------- 9 · Perfect for ---------- VO 32.5
export type BizIcon = 'food' | 'salon' | 'clinic' | 'hotel' | 'gym' | 'spa' | 'retail' | 'service';
export const S9 = {
  dur: 5.65,
  heading: ['Perfect for', 0.15] as [string, number],
  items: [
    {label: 'Restaurants', icon: 'food' as BizIcon, color: Q.pink, at: 0.7},
    {label: 'Salons', icon: 'salon' as BizIcon, color: Q.purple, at: 1.36},
    {label: 'Clinics', icon: 'clinic' as BizIcon, color: Q.blue, at: 1.82},
    {label: 'Hotels', icon: 'hotel' as BizIcon, color: Q.yellow, at: 2.3},
    {label: 'Gyms', icon: 'gym' as BizIcon, color: Q.green, at: 2.8},
    {label: 'Spa', icon: 'spa' as BizIcon, color: Q.pink, at: 3.24},
    {label: 'Retail', icon: 'retail' as BizIcon, color: Q.purple, at: 3.74},
    {label: 'Services', icon: 'service' as BizIcon, color: Q.blue, at: 4.34},
  ],
};

// ---------- 10 · Product ---------- VO 38.15  "Magic QR Review Booster."
export const S10 = {
  dur: 2.25,
  standAt: 0.1,
  nameAt: 0.2,
  productAt: 0.9,
  starsAt: 1.1,
};

// ---------- 11 · White-label close ---------- VO 40.4
// "Aaj hi apna white-label MagicQR business shuru karen, MagicBolt AI ke saath. Signup today!"
export const S11 = {
  dur: 6.6,
  l1: ['Start your own', 0.15] as [string, number],
  l2: ['White-label', 0.78] as [string, number],
  l3: ['MagicQR business', 1.36] as [string, number],
  withAt: 3.25,
  logoAt: 3.4,
  btn: ['Sign up today', 4.95] as [string, number],
  clickAt: 5.7,
};
