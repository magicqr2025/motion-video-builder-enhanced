// WayCRM icons reel (1080x1920 @ 24 fps): palette, art crops, timings.
// All on-screen text lives in text.json; colours in style.json (editable from the browser).
import STYLE from './style.json';
const C = STYLE.colors;
export const NAVY = C.NAVY;
export const DEEP = C.DEEP;
export const BLUE = C.BLUE;
export const GOLD = C.GOLD;
export const ORANGE = C.ORANGE;
export const SLATE = C.SLATE;
export const GREEN = '#1DB954'; // WhatsApp / WayCRM green

export const W = {fps: 24, width: 1080, height: 1920};
export const FONT = "Poppins, sans-serif";
export const LEVEL = {spring: 2, camera: 1, particles: 1} as const;
export const MOMENT = 3; // seconds per concept moment
export const MOMENTS = 2;

const D = 'studio/untitled-video-3/';
export type Src = {src: string; w: number; h: number};
export const ART = {
  pack: {src: D + 'WayCRM-CRM-Marketing-Asset-Pack.png', w: 1536, h: 1024} as Src,
  calling: {src: D + 'AI-Calling-and-WhatsApp-Growth-Poster.png', w: 941, h: 1672} as Src,
  bg: D + 'Soft-Pastel-Abstract-Wave-Background.png',
  logo: D + 'waycrm-logo.webp',
};

// Crops [x, y, w, h] in source pixels
export type Rect = [number, number, number, number];
export const CROP = {
  screen: [100, 192, 588, 328] as Rect, // laptop pipeline screen (pack)
  aiPhone: [757, 163, 214, 404] as Rect, // AI Sales Agent phone (pack)
  waPhone: [1006, 165, 230, 402] as Rect, // WhatsApp chat phone (pack)
  robot: [20, 545, 370, 330] as Rect, // robot mascot (calling poster)
  cards: [ // activity cards (pack, row 2 + row 1)
    [507, 778, 194, 80], [728, 782, 234, 76], [985, 782, 216, 76], [1198, 685, 210, 64], [1224, 778, 196, 80],
  ] as Rect[],
};
// Glossy icon tiles in the pack: centre x, y (tile ~70 px)
export const ICON_Y = 628;
export const ICONS = {whatsapp: 387, call: 481, funnel: 575, team: 668, chart: 761, calendar: 854, target: 948, settings: 1043, contact: 1137, user: 1230, notes: 1323};
export const ICON_LIST = Object.values(ICONS);
export const RED = '#EF4444'; // lost / wasted
export const MB_LOGO = 'magicbolt-logo.png';
export const LEVEL_T = 2; // scene transitions: designed rotation

// ---------- scenes ----------
// Each scene has a `dur` (seconds); cues are seconds FROM THE SCENE START. Synced to voiceover.mp3 (71.4 s).
export const S = {
  hook: {dur: 3.1, head: 0.15, sheet: 0.35, excel: 1.9}, // VO 0.20 "Are your leads also resting in the excel sheet?"
  ads: {dur: 6.0, head: 0.15, coin: 0.3, lead: 2.1, call: 3.2, ended: 5.2}, // VO 3.24 "You invest money on ads."
  follow: {dur: 10.0, intro: 0.15, four: 4.7, once: 6.3, cross: 8.5}, // VO 9.23 "But the truth is ... 4 follow-ups"
  example: {dur: 15.8, tag: 0.2, ad: 2.1, ten: 3.6, three: 5.6, paid: 7.2, seven: 9.9, excel: 11.6, phone: 12.4, wasted: 14.2}, // VO 19.25 "Let's take this as an example."
  reveal: {dur: 5.0, head: 0.15, brand: 1.6, sub: 3.15}, // VO 35.00 "The same problem is solved with WayCRM"
  whatsapp: {dur: 5.4, icon: 0.1, phone: 0.5, lead: 0.95, title: 2.15, sub: 3.6, card: 4.3}, // VO 40.00 "As soon as a new lead comes"
  calling: {dur: 4.8, icon: 0.1, phone: 0.4, title: 0.3, sub: 1.3, card: 3.5, card2: 4.0}, // VO 45.42 "Then AI agents convert it"
  pipeline: {dur: 7.9, icon: 0.1, screen: 0.5, title: 2.9, counters: 3.6, sub: 6.0}, // VO 50.24 "And the leads that don't reply"
  result: {dur: 7.9, label: 0.1, items: [1.2, 2.2, 2.7], tenx: 4.2, team: 5.2}, // VO 58.13 "Result, more conversions"
  cta: {dur: 5.7, brand: 0.1, by: 0.85, signup: 2.1, site: 3.45}, // VO 66.00 "WayCRM by magicbolt.ai, now sign up"
  logo: {dur: 4.7}, // MagicBolt logo build after the voiceover
};
export type SceneKey = keyof typeof S;
export const ORDER: SceneKey[] = ['hook', 'ads', 'follow', 'example', 'reveal', 'whatsapp', 'calling', 'pipeline', 'result', 'cta', 'logo'];
export const START = {} as Record<SceneKey, number>;
let acc = 0;
for (const k of ORDER) { START[k] = acc; acc += S[k].dur; }
export const TOTAL = acc; // 76.3
