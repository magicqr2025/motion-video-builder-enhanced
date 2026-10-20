// =====================================================================
//  MAGICQR "ADS VS REVIEWS" REEL — edit this file for text and timings.
//  Each scene has its own `dur` (seconds); every cue inside a scene is in
//  seconds FROM THE START OF THAT SCENE. Change a `dur` and everything
//  after it shifts automatically (captions are on audio time — see captions.tsx).
//  Synced to public/aireviewbooser-magicqr.mp3 (37.4s) — "// VO" is where
//  the scene starts in that audio. Captions live in captions.tsx.
// =====================================================================

export {Q} from '../qr/config';

export const VIDEO = {
  fps: 30,
  voiceover: 'aireviewbooser-magicqr.mp3', // in /public
  captions: true,
  music: '',
  musicVolume: 0.12,
};

export const ASSETS = {
  standee: 'magicqr-standee.webp',
  logo: 'magicqr-logo.png',
  robot: 'AI Robot Recommends a Local Shop.png',
};

// The demo salon inside the phone (placeholder — not a real listing)
export const DEMO = {
  name: 'GLOW SALON',
  address: 'Arera Colony, Bhopal',
  search: 'salon near me',
  suggestions: ['salon near me', 'salon near me open now', 'salon near me for women'],
  keyword: 'Best salon near me',
  review: 'Best salon near me! Quick, stylish haircut and super friendly staff. Clean place, fair prices. Highly recommend!',
  reviewer: 'Neha Sharma',
};

type Cue = [string, number];

// ---------- 1 · Hook ---------- VO 0.0  "Ads pe paisa jalana band karo."
export const S1 = {
  dur: 2.45,
  l1: ['Ads pe paisa', 0.05] as Cue,
  l2: ['jalana band karo.', 0.8] as Cue,
  notesAt: 0.1,
  stopAt: 1.2,
};

// ---------- 2 · Google = free customers ---------- VO 2.45  "Google aapko free mein naye customers bhej sakta hai."
export const S2 = {
  dur: 3.5,
  googleAt: 0.12,
  l1: ['FREE customers', 0.95] as Cue,
  shopAt: 0.35,
  freeAt: 1.0,
  walkAt: 1.7,
  walkGap: 0.2,
};

// ---------- 3 · The search ---------- VO 5.95  "Socho, koi Google pe search karta hai. Salon near me."
export const S3 = {
  dur: 3.6,
  l1: ['Koi search karta hai…', 0.1] as Cue,
  barAt: 0.8,
  typeAt: 1.45,
  typeDur: 0.9,
  sugAt: 2.45,
  tapAt: 3.1,
};

// ---------- 4 · Top 3 ---------- VO 9.55  "Customer sirf top 3 mein se hi chunta hai."
export const S4 = {
  dur: 2.65,
  l1: ['Customer chunta hai', 0.1] as Cue,
  l2: ['sirf Top 3', 0.5] as Cue,
  listAt: 0.15,
  top3At: 0.9,
};

// ---------- 5 · Biggest factor ---------- VO 12.2  "Aur top 3 ka sabse bada factor? Reviews."
export const S5 = {
  dur: 3.35,
  l1: ['Top 3 ka', 0.12] as Cue,
  l2: ['sabse bada factor?', 0.9] as Cue,
  chipsAt: 1.0,
  factors: ['Photos', 'Website', 'Reviews', 'Offers'],
  pickAt: 2.6,
  rating: 4.9,
  count: 328,
};

// ---------- 6 · Asking doesn't work ---------- VO 15.55  "Aur reviews maangne se nahi aate. MagicQR se aate hain."
export const S6 = {
  dur: 3.93,
  l1: ['Reviews maangne se', 0.1] as Cue,
  l2: ['nahi aate.', 1.6] as Cue,
  ask: ['Google pe review de dena!', 0.2] as Cue,
  reply: ['Haan, baad mein…', 1.0] as Cue,
  crossAt: 1.75,
  swapAt: 2.55, // second half: "MagicQR se aate hain"
  l3: ['MagicQR se', 2.6] as Cue,
  l4: ['aate hain!', 3.3] as Cue,
};

// ---------- 7 · Step 1: scan ---------- VO 19.48  "Customer MagicQR scan karta hai."
export const S7 = {
  dur: 2.17,
  l1: ['Customer scans', 0.1] as Cue,
  l2: ['the Magic QR', 0.45] as Cue,
  scanAt: 0.8,
  doneAt: 1.55,
};

// ---------- 8 · Step 2: AI writes an SEO review ---------- VO 21.65  "Hamara AI SEO-friendly review suggest karta hai."
export const S8 = {
  dur: 2.9,
  l1: ['AI suggests an', 0.4] as Cue,
  l2: ['SEO-friendly review', 0.77] as Cue,
  robotAt: 0.2,
  writingAt: 0.4,
  typeAt: 1.0,
  typeDur: 1.6,
};

// ---------- 9 · Step 3: one tap, live ---------- VO 24.55  "Customer ka ek tap, aur review Google pe live."
export const S9 = {
  dur: 3.07,
  l1: ['Customer ka 1 tap', 0.1] as Cue,
  l2: ['Live on Google!', 1.7] as Cue,
  tapAt: 0.93,
  cardAt: 1.25,
  liveAt: 2.7,
};

// ---------- 10 · Ads stop, reviews don't ---------- VO 27.62  "Ads band, customers band. Reviews kaam karte rehte hain."
export const S10 = {
  dur: 4.43,
  l1: ['Ads band,', 0.05] as Cue,
  l2: ['customers band.', 1.35] as Cue,
  adsAt: 0.1,
  revAt: 2.45,
  l3: ['Reviews kaam karte rehte hain', 2.5] as Cue,
};

// ---------- 11 · Order ---------- VO 32.05  "Aaj hi apna MagicQR Review Booster order karo."
export const S11 = {
  dur: 2.85,
  standAt: 0.05,
  nameAt: 0.75,
  productAt: 1.45,
  btn: ['Order Today', 2.05] as Cue,
  clickAt: 2.5,
};

// ---------- 12 · Tagline ---------- VO 34.9  "Ads pe nahi, reviews pe dhanda badhao."
export const S12 = {
  dur: 3.6,
  l1: ['Ads pe nahi,', 0.05] as Cue,
  strikeAt: 0.6,
  l2: ['reviews pe', 0.82] as Cue,
  l3: ['dhanda badhao!', 1.6] as Cue,
  logoAt: 2.2,
};
