import STYLE from './style.json';
const C = STYLE.colors;
export const NAVY = C.NAVY, DEEP = C.DEEP, BLUE = C.BLUE, GOLD = C.GOLD, ORANGE = C.ORANGE, SLATE = C.SLATE;
export const TUT = {fps: 30, width: 1920, height: 1080, moment: 3, moments: 2, sampleAt: 2.15, navy: NAVY, deep: DEEP, blue: BLUE, gold: GOLD, orange: ORANGE, slate: SLATE, green: '#19A974'};
export const FULL = {
  titleSec: 5.5,
  scenes: [
    {name: 'Overview', dur: 5},
    {name: 'Create bucket', dur: 6},
    {name: 'Create scoped token', dur: 7},
    {name: 'Connect storage', dur: 6},
  ],
  endSec: 10.04,
  get middleSec() { return this.scenes.reduce((sum, scene) => sum + scene.dur, 0); },
  get endStartSec() { return this.titleSec + this.middleSec + 0.6; },
  get durationSec() { return this.endStartSec + this.endSec; },
};
