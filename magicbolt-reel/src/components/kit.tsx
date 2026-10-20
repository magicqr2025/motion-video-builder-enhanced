import React, {createContext, useContext} from 'react';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {C} from '../config';

// Poppins bundled in /public/fonts (works offline)
export const fontFamily = 'Poppins';
loadFont({family: fontFamily, url: staticFile('fonts/Poppins-Regular.ttf'), weight: '400'});
loadFont({family: fontFamily, url: staticFile('fonts/Poppins-Bold.ttf'), weight: '700'});

// ---------- time (global seconds) ----------
export const TimeCtx = createContext(0);
export const useT = () => useContext(TimeCtx);

// ---------- easing ----------
export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const P = (t: number, a: number, d: number) => cl((t - a) / d);
export const eo = (x: number) => 1 - (1 - x) ** 3;
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const eb = (x: number, s = 1.70158) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2;
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

export const grad = (cols: string[], deg = 90): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${deg}deg, ${cols.join(', ')})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

export const SHADOW = '0 18px 44px rgba(60,40,150,0.14), 0 4px 10px rgba(60,40,150,0.07)';

// ---------- positioning ----------
export const Abs: React.FC<{x: number; y: number; transform?: string; opacity?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, transform = '', opacity = 1, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) ${transform}`, opacity, whiteSpace: 'nowrap', ...style}}>
    {children}
  </div>
);

type TxtProps = {size: number; color?: string; g?: string[]; bold?: boolean; style?: React.CSSProperties; children?: React.ReactNode};
export const Txt: React.FC<TxtProps> = ({size, color = C.ink, g, bold = true, style, children}) => (
  <span style={{fontFamily, fontSize: size, fontWeight: bold ? 700 : 400, lineHeight: 1.15, letterSpacing: -size * 0.01, display: 'inline-block', color, ...(g ? grad(g) : {}), ...style}}>
    {children}
  </span>
);

// Pop-in text (fade + rise + overshoot scale)
export const Pop: React.FC<{at: number; x: number; y: number; rise?: number; d?: number; children?: React.ReactNode}> = ({at, x, y, rise = 40, d = 0.45, children}) => {
  const t = useT();
  const k = P(t, at, d);
  if (k <= 0) return null;
  return (
    <Abs x={x} y={y + rise * (1 - eo(k))} transform={`scale(${lerp(0.85, 1, eb(k))})`} opacity={eo(Math.min(1, k * 1.6))}>
      {children}
    </Abs>
  );
};

// A centered line whose words pop in one by one
export const Words: React.FC<{items: [string, number][]; y: number; size: number; color?: string; g?: string[]}> = ({items, y, size, color, g}) => {
  const t = useT();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', gap: size * 0.28}}>
      {items.map(([w, at], i) => {
        const k = P(t, at, 0.4);
        return (
          <span key={i} style={{opacity: eo(Math.min(1, k * 1.6)), transform: `translateY(${50 * (1 - eo(k))}px) scale(${k > 0 ? lerp(0.85, 1, eb(k)) : 0.85})`, display: 'inline-block'}}>
            <Txt size={size} color={color} g={g}>{w}</Txt>
          </span>
        );
      })}
    </div>
  );
};

export const Card: React.FC<{w?: number | string; h?: number | string; r?: number; border?: string; bg?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 36, border, bg = '#fff', style, children}) => (
  <div style={{width: w, height: h, borderRadius: r, background: bg, boxShadow: SHADOW, border, boxSizing: 'border-box', ...style}}>{children}</div>
);

export const Pill: React.FC<{size: number; bg?: string; g?: string[]; color?: string; padX?: number; padY?: number; children?: React.ReactNode}> = ({size, bg = C.ink, g, color = '#fff', padX = 36, padY = 22, children}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, padding: `${padY}px ${padX}px`, borderRadius: 999, background: g ? `linear-gradient(90deg, ${g.join(', ')})` : bg, boxShadow: SHADOW}}>
    <Txt size={size} color={color}>{children}</Txt>
  </div>
);

// Scene wrapper: fade/scale in, fade/zoom out
export const Scene: React.FC<{start: number; end: number; first?: boolean; last?: boolean; children?: React.ReactNode}> = ({start, end, first, last, children}) => {
  const t = useT();
  const FIN = 0.3, FOUT = 0.28;
  if (t < start - 0.01 || t >= end + FOUT) return null;
  const kin = first ? 1 : P(t, start, FIN);
  const kout = last ? 0 : P(t, end, FOUT);
  const a = eo(kin) * (1 - eio(kout));
  const s = lerp(0.94, 1, eo(kin)) * lerp(1, 1.08, eio(kout));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: a, transform: `scale(${s})`, transformOrigin: '540px 900px'}}>{children}</div>
  );
};

export const Glow: React.FC<{x: number; y: number; rx: number; ry: number; c1: string; c2: string; a?: number}> = ({x, y, rx, ry, c1, c2, a = 1}) => (
  <div style={{position: 'absolute', left: x - rx, top: y - ry, width: rx * 2, height: ry * 2, borderRadius: '50%', opacity: a,
    background: `radial-gradient(closest-side, ${c1}8C, ${c2}40 50%, ${c2}00)`}} />
);
