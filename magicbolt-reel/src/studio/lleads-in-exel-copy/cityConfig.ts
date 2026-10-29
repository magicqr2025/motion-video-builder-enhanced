// The 3D city's clock and colours (city.tsx and cam.ts read from here). Times are VIDEO seconds,
// derived from the scene starts in config.ts, so the city reacts on the spoken words.
import {BLUE, DEEP, GOLD, GREEN, NAVY, ORANGE, S, START, TOTAL} from './config';

export const W = {ink: NAVY, yellow: GOLD, pink: ORANGE, blue: DEEP, green: GREEN, purple: DEEP, cyan: BLUE};

export type ShopIcon = 'clinic' | 'salon' | 'cafe' | 'gym' | 'store';
// five lead "shops"; the Way CRM HQ is at 0,0
export const SHOPS: {name: string; icon: ShopIcon; color: string; cell: [number, number]}[] = [
  {name: 'Lead 1', icon: 'cafe', color: ORANGE, cell: [-1, 1]},
  {name: 'Lead 2', icon: 'salon', color: BLUE, cell: [1, 1]},
  {name: 'Lead 3', icon: 'store', color: GREEN, cell: [0, 2]},
  {name: 'Lead 4', icon: 'clinic', color: GOLD, cell: [-1, -1]},
  {name: 'Lead 5', icon: 'gym', color: DEEP, cell: [1, -1]},
];

export const S3 = {searchAt: 0}; // radar rings = the ad running
export const S4 = {pinAt: 0}; // pin drops on the plaza
export const S5 = {hqAt: 0}; // Way CRM HQ rises
export const S6 = {arcsAt: 0, arcGap: 0.3}; // every lead links to Way CRM

export const T = {
  s2: -3, // city already built when the video starts
  s3: START.example + S.example.ad, // "आपने ad चलाया"
  s4: START.wayCrm + S.wayCrm.brand - 0.6,
  s5: START.wayCrm + S.wayCrm.brand, // "Way CRM"
  s6: START.features + S.features.wa,
  example: START.example,
  wayCrm: START.wayCrm,
  features: START.features,
  result: START.result,
  end: TOTAL,
};
