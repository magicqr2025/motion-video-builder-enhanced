// MagicQR reel primitives: fonts, text, cards, stars, sparkles, stage, transitions
import React from 'react';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {Abs, TimeCtx, fontFamily, useT, P, eo, eb, lerp} from '../components/kit';
import {Q} from './config';

export const FS = 'DM Serif Display';
loadFont({family: FS, url: staticFile('fonts/DMSerifDisplay-Regular.ttf'), weight: '400'});

type TP = {size: number; color?: string; w?: number; style?: React.CSSProperties; children?: React.ReactNode};
// Serif display (echoes the logo lettering)
export const Se: React.FC<TP> = ({size, color = Q.ink, style, children}) => (
  <span style={{fontFamily: FS, fontSize: size, fontWeight: 400, lineHeight: 1.12, letterSpacing: -size * 0.01, color, display: 'inline-block', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
// Poppins (matches the product UI)
export const Tx: React.FC<TP> = ({size, color = Q.ink, w = 600, style, children}) => (
  <span style={{fontFamily, fontSize: size, fontWeight: w >= 600 ? 700 : 400, lineHeight: 1.2, letterSpacing: -size * 0.012, color, display: 'inline-block', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

// Headline: words float up one by one; `mark` paints a highlighter swash behind it
export const Line: React.FC<{text: string; at: number; y: number; size: number; color?: string; mark?: string; sans?: boolean}> = ({text, at, y, size, color, mark, sans}) => {
  const t = useT();
  if (t < at) return null;
  const C = sans ? Tx : Se;
  const km = eo(P(t, at + 0.15, 0.45));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center'}}>
      <div style={{position: 'relative', display: 'flex', gap: size * 0.26}}>
        {mark && <div style={{position: 'absolute', left: -size * 0.12, right: -size * 0.12, bottom: size * 0.08, height: size * 0.42, borderRadius: size * 0.1, background: mark, transformOrigin: '0 50%', transform: `scaleX(${km}) rotate(-1deg)`}} />}
        {text.split(' ').map((wd, i) => {
          const k = P(t, at + i * 0.07, 0.4);
          return <span key={i} style={{position: 'relative', display: 'inline-block', opacity: eo(Math.min(1, k * 1.8)), transform: `translateY(${(1 - eo(k)) * size * 0.5}px) scale(${lerp(0.9, 1, eb(k))})`}}><C size={size} color={color}>{wd}</C></span>;
        })}
      </div>
    </div>
  );
};

export const SHADOW = '0 24px 60px rgba(79,66,154,0.18), 0 4px 12px rgba(79,66,154,0.08)';
export const Card: React.FC<{w?: number | string; h?: number | string; r?: number; bg?: string; border?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 36, bg = '#fff', border = Q.line, style, children}) => (
  <div style={{width: w, height: h, borderRadius: r, background: bg, border: `2px solid ${border}`, boxShadow: SHADOW, boxSizing: 'border-box', ...style}}>{children}</div>
);

// Step indicator across the top of the "how it works" scenes: 1 — 2 — 3 — 4
export const Stepper: React.FC<{n: number; total?: number}> = ({n, total = 4}) => {
  const t = useT();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 156, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: eo(P(t, 0.05, 0.4))}}>
      {Array.from({length: total}, (_, i) => {
        const done = i + 1 < n, cur = i + 1 === n;
        const c = cur ? Q.pink : done ? Q.purple : Q.line;
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{width: 76, height: 6, borderRadius: 3, background: i < n ? Q.purple : Q.line}} />}
            <div style={{width: 66, height: 66, borderRadius: '50%', boxSizing: 'border-box', background: cur || done ? c : '#fff', border: `4px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${cur ? 1.18 * eb(P(t, 0.15, 0.4), 2.4) : 1})`, boxShadow: cur ? `0 10px 30px ${Q.pink}77` : undefined}}>
              <Tx size={30} color={cur || done ? '#fff' : Q.slate}>{i + 1}</Tx>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Four-point sparkle from the logo
export const Sparkle: React.FC<{size: number; color?: string; outline?: boolean; style?: React.CSSProperties}> = ({size, color = Q.yellow, outline, style}) => (
  <svg width={size} height={size} viewBox="-4 -4 108 108" style={style}>
    <path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill={outline ? 'none' : color} stroke={color} strokeWidth={outline ? 5 : 0} strokeLinejoin="round" />
  </svg>
);

// Five-point rating stars. n may be fractional while filling; `at` staggers a pop.
const STAR = Array.from({length: 10}, (_, i) => {
  const r = i % 2 ? 20 : 48; const a = -Math.PI / 2 + (i * Math.PI) / 5;
  return `${50 + r * Math.cos(a)},${52 + r * Math.sin(a)}`;
}).join(' ');
export const Stars: React.FC<{n: number; size: number; gap?: number; empty?: string}> = ({n, size, gap = size * 0.14, empty = '#CFCBDD'}) => (
  <div style={{display: 'flex', gap}}>
    {[0, 1, 2, 3, 4].map((i) => {
      const f = Math.max(0, Math.min(1, n - i));
      return (
        <svg key={i} width={size} height={size} viewBox="0 0 100 100" style={{transform: `scale(${f > 0 && f < 1 ? 1 + 0.35 * Math.sin(Math.PI * f) : 1})`}}>
          <polygon points={STAR} fill={f > 0.5 ? Q.star : 'none'} stroke={f > 0.5 ? Q.star : empty} strokeWidth={7} strokeLinejoin="round" />
        </svg>
      );
    })}
  </div>
);

// One-shot burst of sparkles
const BURST = [Q.yellow, Q.pink, Q.purple];
export const Twinkle: React.FC<{at: number; x: number; y: number; r?: number; n?: number}> = ({at, x, y, r = 380, n = 14}) => {
  const t = useT();
  const k = P(t, at, 0.9);
  if (k <= 0 || k >= 1) return null;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const a = (i * 2 * Math.PI) / n + 0.4;
        const d = (90 + r * eo(k)) * (i % 2 ? 1 : 0.7);
        return <Abs key={i} x={x + d * Math.cos(a)} y={y + d * Math.sin(a) * 0.85} transform={`rotate(${k * 120 + i * 30}deg) scale(${1 - k})`}><Sparkle size={i % 3 ? 54 : 84} color={BURST[i % 3]} /></Abs>;
      })}
    </>
  );
};

// Tap ripple
export const Tap: React.FC<{at: number; x: number; y: number; color?: string}> = ({at, x, y, color = Q.blue}) => {
  const t = useT();
  const k = P(t, at, 0.6);
  if (k <= 0 || k >= 1) return null;
  const s = 60 + 260 * eo(k);
  return <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', border: `6px solid ${color}`, opacity: 1 - k, boxSizing: 'border-box'}} />;
};

// ---------- Stage: soft wash, brand blobs, twinkling sparkles ----------
const BLOBS = [
  {c: Q.purple, x: 160, y: 320, r: 620, sp: 0.2, ph: 0},
  {c: Q.pink, x: 940, y: 760, r: 560, sp: 0.17, ph: 1.7},
  {c: Q.yellow, x: 240, y: 1560, r: 600, sp: 0.19, ph: 3.1},
];
const SKY: [number, number, number, string, boolean][] = [
  [110, 190, 70, Q.yellow, false], [960, 250, 54, Q.purple, true], [70, 780, 44, Q.pink, true], [1000, 1010, 62, Q.yellow, false],
  [130, 1380, 50, Q.purple, true], [930, 1560, 76, Q.pink, false], [560, 1700, 40, Q.yellow, false], [1010, 560, 36, Q.pink, true],
];
export const Sky: React.FC = () => {
  const t = useT();
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg, ${Q.wash.join(', ')})`, overflow: 'hidden'}}>
      {BLOBS.map((b, i) => {
        const x = b.x + 110 * Math.sin(t * b.sp * 2 + b.ph), y = b.y + 140 * Math.cos(t * b.sp * 1.6 + b.ph);
        return <div key={i} style={{position: 'absolute', left: x - b.r, top: y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, ${b.c}30, ${b.c}10 55%, ${b.c}00)`}} />;
      })}
      {SKY.map(([x, y, s, c, o], i) => (
        <Abs key={i} x={x} y={y + 10 * Math.sin(t * 1.4 + i)} transform={`rotate(${t * 14 + i * 40}deg) scale(${0.75 + 0.3 * Math.sin(t * 2.2 + i * 1.9)})`} opacity={0.75}><Sparkle size={s} color={c} outline={o} /></Abs>
      ))}
    </div>
  );
};

// ---------- Shot: one scene; children read shot-local time ----------
export const Shot: React.FC<{start: number; dur: number; first?: boolean; last?: boolean; children?: React.ReactNode}> = ({start, dur, first, last, children}) => {
  const t = useT();
  if (t < start || t >= start + dur) return null;
  const e = first ? 1 : eo(P(t, start, 0.3));
  const kout = last ? 0 : P(t, start + dur - 0.1, 0.1);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: e * (1 - kout), transform: `translateY(${40 * (1 - e)}px) scale(${lerp(1, 1.03, (t - start) / dur)})`, transformOrigin: '540px 900px'}}>
      <TimeCtx.Provider value={t - start}>{children}</TimeCtx.Provider>
    </div>
  );
};

// Iris: a brand-colour circle blooms from the centre at a cut, then melts away (global time)
export const Iris: React.FC<{at: number; color: string}> = ({at, color}) => {
  const t = useT();
  const k = P(t, at - 0.24, 0.6);
  if (k <= 0 || k >= 1) return null;
  const grow = eo(Math.min(1, k / 0.42));
  const fade = k < 0.42 ? 1 : 1 - eo((k - 0.42) / 0.58);
  const d = 2600 * grow;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: fade}}>
      <div style={{position: 'absolute', left: 540 - d / 2, top: 960 - d / 2, width: d, height: d, borderRadius: '50%', background: color}} />
      <Abs x={540} y={960} transform={`rotate(${k * 200}deg) scale(${0.4 + grow})`}><Sparkle size={220} color="#fff" /></Abs>
    </div>
  );
};
