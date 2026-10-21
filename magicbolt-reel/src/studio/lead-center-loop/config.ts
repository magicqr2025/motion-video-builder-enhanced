// Lead Center loop: colours and timing. 4 s seamless loop, no voiceover.
// All on-screen text lives in text.json (editable from the browser).
// Three leads arrive per loop (one every 1.33 s); within each beat (f = 0..1):
//   0.00 lead leaves its source · 0.42 inbox list pushes down · 0.58 lead lands · 0.62 hot/warm tag stamps
import TEXT from './text.json';

export const LC = {
  fps: 30,
  dur: 4,
  beat: {land: 0.58, push: 0.42, pushDur: 0.18, stamp: 0.62},
};

import STYLE from './style.json';
const C = STYLE.colors; // editable in the Studio's Style tab
export const NAVY = C.NAVY;
export const DEEP = C.DEEP;
export const BLUE = C.BLUE;
export const GOLD = C.GOLD;
export const ORANGE = C.ORANGE;
export const SLATE = C.SLATE;

export type Src = 'wa' | 'web' | 'google';
export type Lead = {name: string; via: string; src: Src; hot: boolean; face: string; hair: string};

// Look of each demo lead; name and channel text come from TEXT.Leads (same order)
const LOOK: Omit<Lead, 'name' | 'via'>[] = [
  {src: 'wa', hot: true, face: '#FF9ACB', hair: '#2B1B4A'},
  {src: 'web', hot: false, face: '#9BD3FF', hair: '#7A4A2A'},
  {src: 'google', hot: true, face: '#FFD15C', hair: '#2B1B4A'},
];
export const LEADS: Lead[] = LOOK.map((l, i) => ({...l, name: TEXT.Leads[i]?.name ?? '', via: TEXT.Leads[i]?.source ?? ''}));
