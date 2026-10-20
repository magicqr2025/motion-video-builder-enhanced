// Webinar reel primitives: fonts, text, cards, sparkles, bright stage, transitions
import React, {createContext, useContext} from 'react';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {Abs, TimeCtx, fontFamily, grad, useT, P, cl, eo, eb, lerp} from '../components/kit';
import {W} from './config';
import {V3, project} from './cam';
import {mix} from '../glow/parts';

export const FD = 'Anton';
loadFont({family: FD, url: staticFile('fonts/Anton-Regular.ttf'), weight: '400'});

// Global seconds, readable inside a Shot/Seg (where useT() is scene-local)
export const GCtx = createContext(0);
export const useG = () => useContext(GCtx);

// white glow so text stays readable on top of the 3D city
const HALO = 'drop-shadow(0 0 8px rgba(255,255,255,0.95)) drop-shadow(0 3px 16px rgba(255,255,255,0.9))';

type TP = {size: number; color?: string; g?: string[]; w?: number; halo?: boolean; style?: React.CSSProperties; children?: React.ReactNode};
// Poppins
export const Tx: React.FC<TP> = ({size, color = W.ink, g, w = 700, halo, style, children}) => (
  <span style={{fontFamily, fontSize: size, fontWeight: w >= 600 ? 700 : 400, lineHeight: 1.18, letterSpacing: -size * 0.015, color, display: 'inline-block', whiteSpace: 'nowrap', ...(g ? grad(g) : {}), filter: halo ? HALO : undefined, ...style}}>{children}</span>
);
// Anton: tall impact words
export const Big: React.FC<TP> = ({size, color = W.ink, g, halo, style, children}) => (
  <span style={{fontFamily: FD, fontSize: size, fontWeight: 400, lineHeight: 1.1, letterSpacing: size * 0.01, textTransform: 'uppercase', color, display: 'inline-block', whiteSpace: 'nowrap', padding: `0 ${size * 0.04}px`, ...(g ? grad(g, 100) : {}), filter: halo ? HALO : undefined, ...style}}>{children}</span>
);

// Centered headline: words pop up one by one. `hi` gives single words (by index) their own gradient.
export const Line: React.FC<{text: string; at: number; out?: number; y: number; size: number; color?: string; g?: string[]; hi?: Record<number, string[]>; big?: boolean; mark?: string; halo?: boolean; x?: number}> = ({text, at, out, y, size, color, g, hi, big, mark, halo, x = 540}) => {
  const t = useT();
  if (t < at) return null;
  const ko = out === undefined ? 0 : P(t, out, 0.22);
  if (ko >= 1) return null;
  const C = big ? Big : Tx;
  const km = eo(P(t, at + 0.15, 0.45));
  return (
    <div style={{position: 'absolute', left: x - 540, width: 1080, top: y - 30 * ko, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', opacity: 1 - ko}}>
      <div style={{position: 'relative', display: 'flex', gap: size * (big ? 0.2 : 0.26)}}>
        {mark && <div style={{position: 'absolute', left: -size * 0.14, right: -size * 0.14, bottom: size * 0.1, height: size * 0.42, borderRadius: size * 0.1, background: mark, transformOrigin: '0 50%', transform: `scaleX(${km}) rotate(-1.2deg)`}} />}
        {text.split(' ').map((wd, i) => {
          const k = P(t, at + i * 0.08, 0.42);
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', opacity: eo(Math.min(1, k * 2)), transform: `translateY(${(1 - eo(k)) * size * 0.55}px) scale(${lerp(0.8, 1, eb(k, 2.2))})`}}>
              <C size={size} color={color} g={hi?.[i] ?? g} halo={halo}>{wd}</C>
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Pop anything in at a point (and optionally out again)
export const Pop: React.FC<{at: number; out?: number; x: number; y: number; from?: [number, number]; rot?: number; s?: number; children?: React.ReactNode}> = ({at, out, x, y, from = [0, 40], rot = 0, s = 1, children}) => {
  const t = useT();
  const k = P(t, at, 0.5);
  if (k <= 0) return null;
  const ko = out === undefined ? 0 : P(t, out, 0.25);
  if (ko >= 1) return null;
  const e = eo(k);
  return (
    <Abs x={x + from[0] * (1 - e)} y={y + from[1] * (1 - e)} transform={`rotate(${rot}deg) scale(${lerp(0.55, 1, eb(k, 2)) * (1 - 0.25 * ko) * s})`} opacity={Math.min(1, k * 2.4) * (1 - ko)}>
      {children}
    </Abs>
  );
};

// Stick a 2D element to a 3D point of the city (uses the same camera as the canvas)
export const Anchor: React.FC<{p: V3; s?: number; dy?: number; opacity?: number; children?: React.ReactNode}> = ({p, s = 1, dy = 0, opacity = 1, children}) => {
  const q = project(useG(), p);
  return <Abs x={q.x} y={q.y + dy} transform={`scale(${q.k * s})`} opacity={opacity}>{children}</Abs>;
};

export const SHADOW = '0 26px 60px rgba(76,48,170,0.22), 0 6px 14px rgba(76,48,170,0.1)';
// White glossy card
export const Card: React.FC<{w?: number | string; h?: number | string; r?: number; bg?: string; border?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 40, bg = 'linear-gradient(180deg, #FFFFFF, #F3EEFF)', border = '#fff', style, children}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: r, background: bg, border: `3px solid ${border}`, boxShadow: `0 8px 0 #D6CCF5, ${SHADOW}, inset 0 4px 0 #fff, inset 0 -10px 18px rgba(108,59,255,0.06)`, boxSizing: 'border-box', ...style}}>{children}</div>
);
// Glossy coloured tile / pill: gradient fill with a soft highlight on top
export const Gloss: React.FC<{c: string; c2?: string; r?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({c, c2, r = 28, style, children}) => {
  // light top-left → base colour → deeper bottom-right, a solid "thickness" under it, and a crisp top highlight
  const end = c2 ?? mix(c, '#000000', 0.2);
  return (
    <div style={{position: 'relative', borderRadius: r, background: `linear-gradient(155deg, ${mix(c, '#ffffff', 0.4)} 0%, ${c} 42%, ${end} 100%)`,
      boxShadow: `0 7px 0 ${mix(end, '#000000', 0.38)}, 0 22px 34px ${c}77, inset 0 3px 0 rgba(255,255,255,0.75), inset 0 -10px 16px rgba(0,0,0,0.16)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style}}>
      <div style={{position: 'absolute', left: '5%', right: '5%', top: '4%', height: '46%', borderRadius: `${r * 0.8}px ${r * 0.8}px 50% 50% / ${r * 0.8}px ${r * 0.8}px 36% 36%`, background: 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.12) 78%, rgba(255,255,255,0))'}} />
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </div>
  );
};

// Four-point AI sparkle
export const Sparkle: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = W.yellow, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', ...style}}>
    <path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill={color} />
  </svg>
);
// One-shot burst of sparkles and confetti dots
const BURST = [W.yellow, W.pink, W.purple, W.cyan];
export const Burst: React.FC<{at: number; x: number; y: number; r?: number; n?: number}> = ({at, x, y, r = 420, n = 18}) => {
  const t = useT();
  const k = P(t, at, 1.0);
  if (k <= 0 || k >= 1) return null;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const a = (i * 2 * Math.PI) / n + 0.4, d = (80 + r * eo(k)) * (i % 2 ? 1 : 0.66);
        const px = x + d * Math.cos(a), py = y + d * Math.sin(a) * 0.9 + 160 * k * k;
        return i % 3 === 0
          ? <Abs key={i} x={px} y={py} transform={`rotate(${k * 160 + i * 30}deg) scale(${1 - k})`}><Sparkle size={76} color={BURST[i % 4]} /></Abs>
          : <Abs key={i} x={px} y={py} transform={`rotate(${k * 300 + i * 50}deg) scale(${1 - k * 0.6})`} opacity={1 - k}><div style={{width: 22, height: i % 2 ? 22 : 44, borderRadius: 8, background: BURST[i % 4]}} /></Abs>;
      })}
    </>
  );
};
// Rotating sunburst behind a hero word
export const Rays: React.FC<{x: number; y: number; r: number; c?: string; a?: number}> = ({x, y, r, c = W.yellow, a = 1}) => {
  const t = useT();
  const mask = 'radial-gradient(closest-side, #000 20%, transparent 78%)';
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', opacity: a, transform: `rotate(${t * 22}deg)`,
    background: `repeating-conic-gradient(${c}88 0deg 9deg, ${c}00 9deg 18deg)`, WebkitMaskImage: mask, maskImage: mask}} />;
};
// Tap ripple
export const Tap: React.FC<{at: number; x: number; y: number; color?: string}> = ({at, x, y, color = '#fff'}) => {
  const t = useT();
  return <>{[0, 0.14].map((d, i) => {
    const k = P(t, at + d, 0.6);
    if (k <= 0 || k >= 1) return null;
    const s = 60 + 320 * eo(k);
    return <div key={i} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', border: `8px solid ${color}`, opacity: 1 - k, boxSizing: 'border-box'}} />;
  })}</>;
};

// ---------- Stage: bright wash, drifting colour blobs, light beams, floating sparkles ----------
const BLOBS = [
  {c: W.purple, x: 120, y: 260, r: 700, sp: 0.2, ph: 0},
  {c: W.pink, x: 980, y: 720, r: 640, sp: 0.17, ph: 1.7},
  {c: W.yellow, x: 200, y: 1560, r: 680, sp: 0.19, ph: 3.1},
  {c: W.cyan, x: 940, y: 1700, r: 520, sp: 0.23, ph: 4.4},
];
const SKY: [number, number, number, string][] = [
  [100, 170, 74, W.yellow], [972, 236, 52, W.purple], [62, 800, 42, W.pink], [1010, 1040, 60, W.yellow],
  [120, 1400, 48, W.purple], [948, 1470, 70, W.pink], [540, 1790, 40, W.cyan], [1016, 600, 34, W.cyan],
];
export const Sky: React.FC = () => {
  const t = useT();
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(165deg, ${W.wash.join(', ')})`, overflow: 'hidden'}}>
      {BLOBS.map((b, i) => {
        const x = b.x + 130 * Math.sin(t * b.sp * 2 + b.ph), y = b.y + 150 * Math.cos(t * b.sp * 1.6 + b.ph);
        return <div key={i} style={{position: 'absolute', left: x - b.r, top: y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, ${b.c}55, ${b.c}1c 55%, ${b.c}00)`}} />;
      })}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: -600 + ((t * 90 + i * 760) % 2300), top: -300, width: 200 + i * 60, height: 2600, transform: 'rotate(24deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0))'}} />
      ))}
      <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${W.purple}26 2px, transparent 2.5px)`, backgroundSize: '54px 54px', backgroundPosition: `${t * 8}px ${t * 5}px`}} />
      {SKY.map(([x, y, s, c], i) => (
        <Abs key={i} x={x} y={y + 14 * Math.sin(t * 1.4 + i)} transform={`rotate(${t * 16 + i * 40}deg) scale(${0.7 + 0.35 * Math.sin(t * 2.2 + i * 1.9)})`} opacity={0.85}><Sparkle size={s} color={c} /></Abs>
      ))}
    </div>
  );
};

// ---------- Shot: one scene; children read shot-local time. Rises and settles in. ----------
export const Shot: React.FC<{start: number; dur: number; first?: boolean; last?: boolean; children?: React.ReactNode}> = ({start, dur, first, last, children}) => {
  const t = useG();
  if (t < start || t >= start + dur) return null;
  const e = first ? 1 : eo(P(t, start, 0.3));
  const kout = last ? 0 : P(t, start + dur - 0.1, 0.1);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: e * (1 - kout), transform: `scale(${lerp(1.08, 1, e) * lerp(1, 1.03, (t - start) / dur)})`, transformOrigin: '540px 900px'}}>
      <TimeCtx.Provider value={t - start}>{children}</TimeCtx.Provider>
    </div>
  );
};
// Seg: like Shot but with no transform, for overlays that sit on top of the moving 3D city
export const Seg: React.FC<{start: number; dur: number; children?: React.ReactNode}> = ({start, dur, children}) => {
  const t = useG();
  if (t < start || t >= start + dur) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: eo(P(t, start, 0.2)) * (1 - P(t, start + dur - 0.18, 0.18))}}>
      <TimeCtx.Provider value={t - start}>{children}</TimeCtx.Provider>
    </div>
  );
};

// Swipe: four slanted colour bands race across the screen at a cut (global time)
const BANDS = [W.purple, W.pink, W.yellow, W.blue];
export const Swipe: React.FC<{at: number}> = ({at}) => {
  const t = useG();
  if (t < at - 0.5 || t > at + 0.6) return null;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {BANDS.map((c, i) => {
        const k = cl((t - (at - 0.33 + (i - 1.5) * 0.05)) / 0.7);
        if (k <= 0 || k >= 1) return null;
        return <div key={i} style={{position: 'absolute', top: -200, left: lerp(-2700, 1500, k), width: 2400, height: 2400, background: c, transform: 'skewX(-12deg)'}} />;
      })}
    </div>
  );
};
// Quick white flash (scene-local time)
export const FlashW: React.FC<{at: number; a?: number}> = ({at, a = 0.85}) => {
  const k = P(useT(), at, 0.4);
  if (k <= 0 || k >= 1) return null;
  return <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: a * (1 - k) ** 2}} />;
};
// Camera shake on impact moments (cues in scene-local seconds)
export const Shake: React.FC<{cues: number[]; amp?: number; children?: React.ReactNode}> = ({cues, amp = 18, children}) => {
  const t = useT();
  let dx = 0, dy = 0;
  for (const c of cues) {
    const k = (t - c) / 0.4;
    if (k > 0 && k < 1) { const a = amp * (1 - k) ** 2; dx += a * Math.sin(t * 90); dy += a * Math.cos(t * 77); }
  }
  return <div style={{position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px)`}}>{children}</div>;
};
