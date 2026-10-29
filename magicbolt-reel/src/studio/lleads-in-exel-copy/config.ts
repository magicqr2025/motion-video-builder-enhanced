// Way CRM promo "leads in Excel" (1080x1920 @ 24 fps): palette, assets, scene timing.
// All on-screen text lives in text.json; colours in style.json (editable from the browser).
// Each scene has a `dur` (seconds); cues are seconds FROM THE SCENE START. Synced to voiceover-2026-10-28.mp3 (66.6 s).
import STYLE from './style.json';
const C = STYLE.colors;
export const NAVY = C.NAVY;
export const DEEP = C.DEEP;
export const BLUE = C.BLUE;
export const GOLD = C.GOLD;
export const ORANGE = C.ORANGE;
export const SLATE = C.SLATE;
export const GREEN = '#18B26B'; // converted / WhatsApp
export const RED = '#EF4444'; // wasted

export const W = {fps: 24, width: 1080, height: 1920};
export const FONT = "Poppins, 'Nirmala UI', 'Noto Sans Devanagari', sans-serif";
export const LEVEL = {spring: 2, camera: 1, transition: 1, obj3d: 1, ui: 2} as const;

export const ART = {
  whatsapp: 'Glossy WhatsApp Broadcast Network.png',
  robot: 'AI Robot Recommends a Local Shop.png',
  growth: 'Playful Local Business Growth Dashboard.png',
  logo: 'magicbolt-logo.png',
  waycrm: 'studio/lleads-in-exel-copy/waycrm-logo.webp', // from waycrm.in/brand
};

// ---------- scenes ----------
export const S = {
  hook: {dur: 2.8, line1: 0.1, sheet: 0.6, line2: 0.9, line3: 1.8}, // VO 0.04 "Are your leads also"
  ads: {dur: 5.46, head: 0.1, coin: 0.4, lead: 1.55, call: 2.75, ended: 4.4}, // VO 2.80 "You spend money on ads"
  follow: {dur: 8.43, intro: 0.1, line: 0.95, four: 2.7, steps: 3.0, once: 4.86, retarget: 6.9}, // VO 8.26 "But the truth is"
  example: {dur: 8.47, intro: 0.1, ad: 1.85, ten: 2.7, three: 4.25, paid: 5.8}, // VO 16.69 "Let's understand this"
  waste: {dur: 6.88, seven: 0.4, excel: 2.4, phone: 3.8, waste: 4.7}, // VO 25.16 "And the other seven?"
  wayCrm: {dur: 6.44, problem: 0.1, brand: 1.3, sub: 3.7}, // VO 32.04 "This is the problem"
  features: {dur: 15.78, wa: 1.5, ai: 5.52, pipe: 9.84, retarget: 13.8}, // VO 38.48 "The moment a new lead"
  result: {dur: 7.41, q: 0.1, conv: 0.95, tenx: 4.2, team: 5.5}, // VO 54.26 "The result?"
  end: {dur: 7.5, brand: 0.1, by: 0.8, cta: 2.4, site: 2.9, logo: 3.9}, // VO 61.67 "Way CRM by MagicBolt AI"
};
export type SceneKey = keyof typeof S;
export const ORDER: SceneKey[] = ['hook', 'ads', 'follow', 'example', 'waste', 'wayCrm', 'features', 'result', 'end'];
export const START = {} as Record<SceneKey, number>;
let acc = 0;
for (const k of ORDER) { START[k] = acc; acc += S[k].dur; }
export const TOTAL = acc; // 69.17 (VO 66.6 + logo tail)

// Concept samples: MOMENTS moments of MOMENT seconds each (2 per concept)
export const MOMENT = 3;
export const MOMENTS = 2;
// webinar-city clock used by the concept samples (src/webinar/city.tsx runs on the webinar timeline)
export const CITY_T = {built: 11.4, linked: 35.2};
