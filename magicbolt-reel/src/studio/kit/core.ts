// Shared helpers for every kit module. Time is in seconds, local to the nearest <Sequence> (scene time);
// at the top level of a composition it is video time.
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type Level = 1 | 2; // Look & feel: 1 = Light, 2 = Full (0 = don't use the module at all)

export const useSec = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

export const cl = (x: number) => Math.max(0, Math.min(1, x));
/** progress 0..1 of t within [a, a+d] */
export const P = (t: number, a: number, d: number) => cl((t - a) / d);
export const eo = (x: number) => 1 - (1 - x) ** 3; // ease out
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2); // ease in-out
export const eb = (x: number, s = 1.70158) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2; // ease out back
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** deterministic random numbers (never Math.random in a video) */
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** spring progress 0 -> 1 starting at `at` seconds. Light = gentle settle, Full = bouncy overshoot. */
export const useSpringK = (at: number, level: Level = 1) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: Math.round((f / fps - at) * fps), fps, config: level >= 2 ? {damping: 9, stiffness: 150, mass: 0.9} : {damping: 18, stiffness: 130, mass: 1}});
};

export const COLORS = {navy: '#0E1B4D', deep: '#1354BC', blue: '#1582D5', gold: '#FDC60B', orange: '#F7941D', slate: '#5A6488', white: '#FFFFFF'};

/** interpolate through keyframes [{t, ...numbers}] with ease-in-out between neighbours */
export const keyframed = <K extends {t: number}>(keys: K[], t: number, ease: (x: number) => number = eio): K => {
  if (t <= keys[0].t) return keys[0];
  const last = keys[keys.length - 1];
  if (t >= last.t) return last;
  const i = keys.findIndex((k) => k.t > t) - 1;
  const a = keys[i], b = keys[i + 1];
  const k = ease((t - a.t) / (b.t - a.t));
  const out: Record<string, number> = {t};
  for (const key of Object.keys(a)) if (key !== 't' && typeof (a as any)[key] === 'number') out[key] = lerp((a as any)[key], (b as any)[key] ?? (a as any)[key], k);
  return out as unknown as K;
};
