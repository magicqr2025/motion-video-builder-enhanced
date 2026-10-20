// "Sell SaaS" reel primitives: brand text, the stage, and the real logo build animation.
// Shot / Iris / Line / Sparkle come from the MagicQR kit; only the colours change here.
import React from 'react';
import {Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Abs, fontFamily, useT, P, eo, eb, lerp} from '../components/kit';
import {Line as QLine, Sparkle} from '../qr/kit';
import {LogoAnim} from '../logo/LogoAnim';
import {ASSETS, M} from './config';

export {Iris, Shot, Sparkle, Tap, Twinkle} from '../qr/kit';

type TP = {size: number; color?: string; w?: number; style?: React.CSSProperties; children?: React.ReactNode};
export const Tx: React.FC<TP> = ({size, color = M.ink, w = 700, style, children}) => (
  <span style={{fontFamily, fontSize: size, fontWeight: w >= 600 ? 700 : 400, lineHeight: 1.18, letterSpacing: -size * 0.015, color, display: 'inline-block', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

// Bold Poppins headline, words float up one by one; `mark` paints a highlighter swash
export const Line: React.FC<{text: string; at: number; y: number; size: number; color?: string; mark?: string}> = ({color = M.navy, ...p}) => <QLine {...p} color={color} sans />;
export const MARK = `${M.gold}AA`;

// White sheen across the top of any rounded glossy object
export const Gloss: React.FC<{h?: string; a?: number}> = ({h = '48%', a = 0.45}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, borderRadius: 'inherit', background: `linear-gradient(180deg, rgba(255,255,255,${a}), rgba(255,255,255,0.04))`, pointerEvents: 'none'}} />
);

// Pop-in wrapper (shot-local time): scale overshoot + rise + fade
export const PopIn: React.FC<{at: number; x: number; y: number; d?: number; rise?: number; s?: number; rot?: number; float?: number; children?: React.ReactNode}> = ({at, x, y, d = 0.5, rise = 60, s = 2, rot = 0, float = 0, children}) => {
  const t = useT();
  const k = P(t, at, d);
  if (k <= 0) return null;
  return (
    <Abs x={x} y={y + rise * (1 - eo(k)) + float * Math.sin(t * 2.6 + x * 0.01)} transform={`scale(${eb(k, s)}) rotate(${rot * (1 - eo(k))}deg)`} opacity={eo(Math.min(1, k * 1.8))}>
      {children}
    </Abs>
  );
};

// ---------- Stage: soft lavender wash (matches the site illustrations), brand blobs, sparkles ----------
const BLOBS = [
  {c: M.blue, x: 140, y: 300, r: 640, sp: 0.2, ph: 0},
  {c: M.pink, x: 960, y: 820, r: 560, sp: 0.17, ph: 1.7},
  {c: M.gold, x: 220, y: 1580, r: 620, sp: 0.19, ph: 3.1},
  {c: M.purple, x: 900, y: 1820, r: 480, sp: 0.15, ph: 4.4},
];
const SKY: [number, number, number, string, boolean][] = [
  [110, 190, 64, M.gold, false], [970, 250, 50, M.blue, true], [60, 800, 42, M.pink, true], [1010, 1020, 58, M.gold, false],
  [120, 1400, 48, M.purple, true], [950, 1580, 70, M.orange, false], [560, 1730, 38, M.blue, false], [1015, 560, 34, M.pink, true],
];
export const Sky: React.FC = () => {
  const t = useT();
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg, ${M.wash.join(', ')})`, overflow: 'hidden'}}>
      {BLOBS.map((b, i) => {
        const x = b.x + 110 * Math.sin(t * b.sp * 2 + b.ph), y = b.y + 140 * Math.cos(t * b.sp * 1.6 + b.ph);
        return <div key={i} style={{position: 'absolute', left: x - b.r, top: y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, ${b.c}26, ${b.c}0C 55%, ${b.c}00)`}} />;
      })}
      {SKY.map(([x, y, s, c, o], i) => (
        <Abs key={i} x={x} y={y + 10 * Math.sin(t * 1.4 + i)} transform={`rotate(${t * 14 + i * 40}deg) scale(${0.75 + 0.3 * Math.sin(t * 2.2 + i * 1.9)})`} opacity={0.6}><Sparkle size={s} color={c} outline={o} /></Abs>
      ))}
    </div>
  );
};

// Real MagicBolt logo image (706 x 133)
export const LogoImg: React.FC<{w: number}> = ({w}) => <Img src={staticFile(ASSETS.logo)} style={{width: w, height: (w * 133) / 706, display: 'block'}} />;

// The real logo build animation (1440 x 480 comp) played from shot-local `at`, scaled to `w`.
// Holds on the built logo instead of running its own exit.
export const LogoBuild: React.FC<{at: number; x: number; y: number; w: number}> = ({at, x, y, w}) => {
  const t = useT();
  const g = useCurrentFrame(); // global frame (Shot only shifts TimeCtx, not Remotion's frame)
  const {fps} = useVideoConfig();
  if (t < at) return null;
  // LogoAnim's own frame: runs from 0, then freezes at 4.2 s, just before its exit fade
  const local = Math.min(Math.round((t - at) * fps), Math.round(4.2 * fps));
  const s = w / 1440;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - (480 * s) / 2, width: 1440, height: 480, transform: `scale(${s})`, transformOrigin: '0 0'}}>
      <Sequence from={g - local} layout="none" name="logo"><LogoAnim /></Sequence>
    </div>
  );
};

// Light glow disc
export const Halo: React.FC<{x: number; y: number; r: number; c: string; a?: number}> = ({x, y, r, c, a = 1}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', opacity: a, background: `radial-gradient(closest-side, ${c}66, ${c}22 55%, ${c}00)`}} />
);

export {lerp};
