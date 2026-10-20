// Neon-version primitives: fonts, text, glass cards, stage, transitions
import React from 'react';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {TimeCtx, useT, P, eo, lerp, cl} from '../components/kit';
import {N} from './config';

export const FH = 'Anton';
export const FB = 'Space Grotesk';
export const FM = 'JetBrains Mono';
loadFont({family: FH, url: staticFile('fonts/Anton-Regular.ttf'), weight: '400'});
loadFont({family: FB, url: staticFile('fonts/SpaceGrotesk.ttf'), weight: '300 700'});
loadFont({family: FM, url: staticFile('fonts/JetBrainsMono.ttf'), weight: '100 800'});

type TP = {size: number; color?: string; w?: number; style?: React.CSSProperties; children?: React.ReactNode};
// Display: condensed, uppercase
export const H: React.FC<TP> = ({size, color = N.text, style, children}) => (
  <span style={{fontFamily: FH, fontSize: size, fontWeight: 400, lineHeight: 1.08, textTransform: 'uppercase', letterSpacing: size * 0.012, color, display: 'inline-block', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
// Body
export const B: React.FC<TP> = ({size, color = N.text, w = 600, style, children}) => (
  <span style={{fontFamily: FB, fontSize: size, fontWeight: w, lineHeight: 1.12, letterSpacing: -size * 0.015, color, display: 'inline-block', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
// Mono label
export const M: React.FC<TP> = ({size, color = N.dim, w = 500, style, children}) => (
  <span style={{fontFamily: FM, fontSize: size, fontWeight: w, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: size * 0.08, color, display: 'inline-block', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

// Kinetic line: each word slides up out of a mask
export const Kin: React.FC<{text: string; at: number; y: number; size: number; color?: string; accent?: string; font?: 'h' | 'b'; stagger?: number}> = ({text, at, y, size, color, accent, font = 'h', stagger = 0.07}) => {
  const t = useT();
  if (t < at) return null;
  const words = text.split(' ');
  const C = font === 'h' ? H : B;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', gap: size * 0.24}}>
      {words.map((w, i) => {
        const e = eo(P(t, at + i * stagger, 0.38));
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: `${size * 0.06}px ${size * 0.03}px`}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - e) * 115}%) skewY(${(1 - e) * 6}deg)`}}>
              <C size={size} color={accent && i === words.length - 1 ? accent : color}>{w}</C>
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Opaque "glass" panel; pass glow for a lit neon edge
export const Glass: React.FC<{w?: number | string; h?: number | string; r?: number; glow?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 36, glow, style, children}) => (
  <div style={{width: w, height: h, borderRadius: r, boxSizing: 'border-box', background: `linear-gradient(160deg, rgba(255,255,255,0.11), rgba(255,255,255,0.02)), ${N.card}`,
    border: `2px solid ${glow ?? N.line}`,
    boxShadow: glow ? `0 0 70px ${glow}66, 0 30px 80px rgba(0,0,0,0.6), inset 0 0 40px ${glow}22` : '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)', ...style}}>{children}</div>
);

// Small section label, top-left
export const Tag: React.FC<{n: string; label: string}> = ({n, label}) => {
  const t = useT();
  const e = eo(P(t, 0.05, 0.5));
  return (
    <div style={{position: 'absolute', left: 80, top: 205, display: 'flex', alignItems: 'center', gap: 18, opacity: e}}>
      <M size={30} color={N.lime} w={700}>{n}</M>
      <div style={{width: 90 * e, height: 3, background: N.line}} />
      <M size={30}>{label}</M>
    </div>
  );
};

// ---------- Stage: aurora glows, dot grid, moving perspective floor ----------
const BLOBS = [
  {c: N.cyan, x: 180, y: 380, r: 640, sp: 0.21, ph: 0},
  {c: N.violet, x: 920, y: 900, r: 700, sp: 0.17, ph: 1.7},
  {c: N.pink, x: 300, y: 1500, r: 520, sp: 0.19, ph: 3.1},
];
export const Stage: React.FC = () => {
  const t = useT();
  const floorMask = 'linear-gradient(transparent 5%, #000 75%)';
  return (
    <div style={{position: 'absolute', inset: 0, background: N.bg, overflow: 'hidden'}}>
      {BLOBS.map((b, i) => {
        const x = b.x + 120 * Math.sin(t * b.sp * 2 + b.ph), y = b.y + 150 * Math.cos(t * b.sp * 1.6 + b.ph);
        return <div key={i} style={{position: 'absolute', left: x - b.r, top: y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, ${b.c}38, ${b.c}12 55%, ${b.c}00)`}} />;
      })}
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 2px)', backgroundSize: '48px 48px'}} />
      <div style={{position: 'absolute', left: -700, right: -700, bottom: -60, height: 820, transform: 'perspective(700px) rotateX(64deg)', transformOrigin: '50% 100%',
        backgroundImage: `linear-gradient(${N.cyan}66 2px, transparent 2px), linear-gradient(90deg, ${N.cyan}66 2px, transparent 2px)`, backgroundSize: '120px 120px',
        backgroundPosition: `0 ${(t * 70) % 120}px`, WebkitMaskImage: floorMask, maskImage: floorMask}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(0,0,0,0.62))'}} />
    </div>
  );
};

// ---------- Shot: one scene; children read shot-local time. Zooms + de-blurs in. ----------
export const Shot: React.FC<{start: number; dur: number; first?: boolean; last?: boolean; children?: React.ReactNode}> = ({start, dur, first, last, children}) => {
  const t = useT();
  if (t < start || t >= start + dur) return null;
  const e = first ? 1 : eo(P(t, start, 0.28));
  const kout = last ? 0 : P(t, start + dur - 0.12, 0.12);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: e * (1 - kout), transform: `scale(${lerp(1.14, 1, e) * lerp(1, 1.035, (t - start) / dur)})`, transformOrigin: '540px 880px',
      filter: e < 1 ? `blur(${16 * (1 - e)}px)` : undefined}}>
      <TimeCtx.Provider value={t - start}>{children}</TimeCtx.Provider>
    </div>
  );
};

// Horizontal neon shutter bars that snap across at a cut (global time)
export const Shutter: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  const k = P(t, at - 0.16, 0.4);
  if (k <= 0 || k >= 1) return null;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 6}, (_, i) => {
        const ki = cl(k * 1.7 - i * 0.12);
        return <div key={i} style={{position: 'absolute', left: 0, top: i * 320, width: 1080, height: 320, background: i % 2 ? N.cyan : N.lime, transformOrigin: i % 2 ? '100% 50%' : '0 50%', transform: `scaleX(${Math.sin(Math.PI * ki)})`}} />;
      })}
    </div>
  );
};

// Camera shake on impact moments (cues in shot-local seconds)
export const Shake: React.FC<{cues: number[]; amp?: number; children?: React.ReactNode}> = ({cues, amp = 16, children}) => {
  const t = useT();
  let dx = 0, dy = 0;
  for (const c of cues) {
    const k = (t - c) / 0.35;
    if (k > 0 && k < 1) { const a = amp * (1 - k) ** 2; dx += a * Math.sin(t * 90); dy += a * Math.cos(t * 77); }
  }
  return <div style={{position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px)`}}>{children}</div>;
};

// Soft neon flash centred on a point
export const Flash: React.FC<{at: number; x: number; y: number; color?: string; r?: number}> = ({at, x, y, color = N.lime, r = 700}) => {
  const t = useT();
  const k = P(t, at, 0.7);
  if (k <= 0 || k >= 1) return null;
  const s = r * (0.5 + eo(k));
  return <div style={{position: 'absolute', left: x - s, top: y - s, width: s * 2, height: s * 2, borderRadius: '50%', opacity: (1 - k) ** 2, background: `radial-gradient(closest-side, ${color}CC, ${color}33 45%, ${color}00)`}} />;
};
