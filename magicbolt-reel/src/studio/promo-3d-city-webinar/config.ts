// Way CRM promo "leads in Excel" (1080x1920 @ 24 fps): palette, assets, scene timing.
// All on-screen text lives in text.json; colours in style.json (editable from the browser).
// Each scene has a `dur` (seconds); cues are seconds FROM THE SCENE START. Synced to voiceover-2026-10-28.mp3 (76.0 s).
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
  waycrm: 'studio/promo-3d-city-webinar/waycrm-logo.webp', // from waycrm.in/brand
};

// ---------- scenes ----------
export const S = {
  hook: {dur: 3.2, line1: 0.1, sheet: 0.6, line2: 0.8, line3: 1.8}, // VO 0.06 "क्या आपकी भी leads"
  ads: {dur: 6.1, head: 0.1, coin: 0.3, lead: 2.1, call: 3.2, ended: 4.6}, // VO 3.29 "आप ads पर पैसा"
  follow: {dur: 10.8, intro: 0.1, line: 2.0, four: 4.6, steps: 5.2, once: 6.8, retarget: 9.2}, // VO 9.37 "लेकिन सच ये है"
  example: {dur: 9.9, intro: 0.2, ad: 2.2, ten: 3.55, three: 5.3, paid: 6.7}, // VO 20.26 "इसे एक example से"
  waste: {dur: 7.7, seven: 0.7, excel: 2.4, phone: 4.7, waste: 6.5}, // VO 30.10 "बाक़ी सात leads"
  wayCrm: {dur: 5.5, problem: 0.1, brand: 2.2, sub: 3.0}, // VO 37.83 "यही problem solve करता है"
  features: {dur: 17.3, wa: 0.2, ai: 4.9, pipe: 9.75, retarget: 14.4}, // VO 43.39 "नई lead आते ही"
  result: {dur: 7.6, q: 0.2, conv: 0.9, tenx: 2.7, team: 5.2}, // VO 60.73 "Result?"
  end: {dur: 7.9, brand: 0.1, by: 0.6, cta: 2.6, site: 3.9, logo: 5.0}, // VO 68.21 "Way CRM by MagicBolt AI"
};
export type SceneKey = keyof typeof S;
export const ORDER: SceneKey[] = ['hook', 'ads', 'follow', 'example', 'waste', 'wayCrm', 'features', 'result', 'end'];
export const START = {} as Record<SceneKey, number>;
let acc = 0;
for (const k of ORDER) { START[k] = acc; acc += S[k].dur; }
export const TOTAL = acc; // 76.0

// Concept samples: MOMENTS moments of MOMENT seconds each (2 per concept)
export const MOMENT = 3;
export const MOMENTS = 2;
// webinar-city clock used by the concept samples (src/webinar/city.tsx runs on the webinar timeline)
export const CITY_T = {built: 11.4, linked: 35.2};
