// Shared pieces for the square, transparent, seamlessly-looping feature GIFs.
// Everything has a solid outline and no soft shadows, because GIF transparency is on/off only.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Q} from '../qr/config';
import {Sparkle} from '../qr/kit';

export const OL = Q.ink; // outline colour
export const SH = '#D8D0F4'; // solid "shadow" colour
export const GREEN = '#25D366';
const TAU = Math.PI * 2;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const eo = (x: number) => 1 - (1 - x) ** 3;
const eb = (x: number, s = 2.2) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2;

// p runs 0→1 over the loop. osc() is a sine that always closes the loop.
// on(a) pops in at phase a, holds, and shrinks away just before the loop restarts.
export const useLoop = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = f / durationInFrames;
  return {
    p,
    osc: (k = 1, ph = 0) => Math.sin(TAU * (k * p + ph)),
    on: (a: number, d = 0.07) => eb(cl((p - a) / d)) * (1 - eo(cl((p - 0.93) / 0.06))),
    fill: (a: number, d: number) => cl((p - a) / d) * (1 - cl((p - 0.93) / 0.06)),
  };
};

// Absolutely positioned, centred on (x, y)
export const At: React.FC<{x: number; y: number; rot?: number; scale?: number; z?: number; children?: React.ReactNode}> = ({x, y, rot = 0, scale = 1, z, children}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`, zIndex: z}}>{children}</div>
);

export const Panel: React.FC<{w?: number; h?: number; r?: number; bg?: string; sh?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 40, bg = '#fff', sh = 14, style, children}) => (
  <div style={{width: w, height: h, borderRadius: r, background: bg, border: `8px solid ${OL}`, boxShadow: sh ? `${sh}px ${sh}px 0 ${SH}` : undefined, boxSizing: 'border-box', ...style}}>{children}</div>
);

export const Bar: React.FC<{w: number | string; h?: number; c?: string}> = ({w, h = 18, c = '#DCD6F2'}) => <div style={{width: w, height: h, borderRadius: h, background: c, flexShrink: 0}} />;

// Flat phone: 400 x 760
export const PhoneF: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <Panel w={400} h={760} r={64} bg={OL} style={{padding: 12}}>
    <div style={{width: '100%', height: '100%', borderRadius: 46, background: '#fff', overflow: 'hidden', position: 'relative'}}>
      <div style={{position: 'absolute', left: '50%', top: 14, width: 110, height: 24, borderRadius: 12, background: OL, transform: 'translateX(-50%)', zIndex: 5}} />
      {children}
    </div>
  </Panel>
);

// ---------- Glyphs (white, 100x100) ----------
export type GName = 'call' | 'mail' | 'chat' | 'globe' | 'pin' | 'cam' | 'play' | 'heart' | 'img' | 'fork';
export const G: React.FC<{name: GName; size: number; color?: string}> = ({name, size, color = '#fff'}) => {
  const s = {fill: 'none', stroke: color, strokeWidth: 9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {name === 'call' && <path d="M30 16c-7 0-14 7-14 14c0 30 24 54 54 54c7 0 14-7 14-14l-16-11l-10 8c-9-4-16-11-20-20l8-10z" fill={color} />}
      {name === 'mail' && (<><rect x="12" y="24" width="76" height="54" rx="10" fill={color} /><polyline points="18,32 50,56 82,32" fill="none" stroke={OL} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></>)}
      {name === 'chat' && (<><rect x="12" y="18" width="76" height="52" rx="16" fill={color} /><polygon points="30,68 22,88 50,68" fill={color} /></>)}
      {name === 'globe' && (<><circle cx="50" cy="50" r="36" {...s} /><ellipse cx="50" cy="50" rx="15" ry="36" {...s} /><path d="M14 50h72" {...s} /></>)}
      {name === 'pin' && (<><path d="M50 90C36 70 20 58 20 40a30 30 0 0 1 60 0c0 18-16 30-30 50z" fill={color} /><circle cx="50" cy="40" r="11" fill={OL} /></>)}
      {name === 'cam' && (<><rect x="14" y="14" width="72" height="72" rx="20" {...s} /><circle cx="50" cy="50" r="16" {...s} /><circle cx="72" cy="28" r="5" fill={color} /></>)}
      {name === 'play' && <polygon points="34,22 82,50 34,78" fill={color} stroke={color} strokeWidth={8} strokeLinejoin="round" />}
      {name === 'heart' && <path d="M50 86C12 58 8 36 22 22c11-10 23-4 28 8c5-12 17-18 28-8c14 14 10 36-28 64z" fill={color} />}
      {name === 'img' && (<><circle cx="34" cy="34" r="10" fill={color} /><polyline points="12,82 40,52 56,66 68,56 90,82" fill={color} stroke={color} strokeWidth={6} strokeLinejoin="round" /></>)}
      {name === 'fork' && (<><path d="M26 12v24a11 11 0 0 0 22 0V12M37 12v76" {...s} /><path d="M72 88V12c-11 6-15 22-15 40h15" {...s} /></>)}
    </svg>
  );
};

// Coloured icon badge: round (default) or rounded square
export const Badge: React.FC<{name: GName; size: number; color: string; square?: boolean}> = ({name, size, color, square}) => (
  <div style={{width: size, height: size, borderRadius: square ? size * 0.28 : '50%', background: color, border: `7px solid ${OL}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <G name={name} size={size * 0.56} />
  </div>
);

// Round avatar
export const Av: React.FC<{size: number; bg: string; hair?: string}> = ({size, bg, hair = OL}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs><clipPath id={`av${size}`}><circle cx="50" cy="50" r="45" /></clipPath></defs>
    <circle cx="50" cy="50" r="45" fill={bg} />
    <g clipPath={`url(#av${size})`}>
      <path d="M18 104c0-24 14-36 32-36s32 12 32 36z" fill="#fff" />
      <circle cx="50" cy="44" r="19" fill="#FFD9B8" />
      <path d="M30 42c0-14 9-22 20-22s20 8 20 22c-6-8-12-11-20-11s-14 3-20 11z" fill={hair} />
    </g>
    <circle cx="50" cy="50" r="45" fill="none" stroke={OL} strokeWidth={7} />
  </svg>
);

// Shop front (200 x 180 at scale 1)
export const Store: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.9} viewBox="0 0 200 180">
    <rect x="22" y="66" width="156" height="104" rx="8" fill="#fff" stroke={OL} strokeWidth={8} />
    <rect x="40" y="96" width="46" height="74" fill={Q.purple} stroke={OL} strokeWidth={7} />
    <rect x="104" y="96" width="56" height="42" rx="4" fill="#9BD3FF" stroke={OL} strokeWidth={7} />
    <defs><clipPath id="awning"><path d="M10 70l14-52h152l14 52z" /></clipPath></defs>
    <path d="M10 70l14-52h152l14 52z" fill="#fff" />
    <g clipPath="url(#awning)">{[0, 2, 4].map((i) => <rect key={i} x={10 + i * 36} y={10} width={36} height={70} fill={Q.pink} />)}</g>
    <path d="M10 70l14-52h152l14 52z" fill="none" stroke={OL} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);

export const Pin: React.FC<{size: number; color?: string}> = ({size, color = Q.pink}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
    <path d="M50 124C30 94 8 76 8 48a42 42 0 0 1 84 0c0 28-22 46-42 76z" fill={color} stroke={OL} strokeWidth={8} strokeLinejoin="round" />
    <circle cx="50" cy="48" r="17" fill="#fff" stroke={OL} strokeWidth={8} />
  </svg>
);

export const Plane: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M6 46L94 8L62 92L46 58z" fill={color} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
    <path d="M46 58L94 8L26 52z" fill={Q.pink} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
  </svg>
);

export const Magnifier: React.FC<{size: number; children?: React.ReactNode}> = ({size, children}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M62 62l28 28" stroke={OL} strokeWidth={22} strokeLinecap="round" /><path d="M62 62l28 28" stroke={Q.yellow} strokeWidth={10} strokeLinecap="round" />
      <circle cx="40" cy="40" r="32" fill="#EEF4FF" stroke={OL} strokeWidth={8} /><circle cx="40" cy="40" r="26" fill="none" stroke={Q.purple} strokeWidth={7} />
    </svg>
    <div style={{position: 'absolute', left: size * 0.4, top: size * 0.4, transform: 'translate(-50%, -50%)'}}>{children}</div>
  </div>
);

// Speech bubble with a tail at the bottom-left
export const Bubble: React.FC<{w: number; h: number; bg?: string; children?: React.ReactNode}> = ({w, h, bg = '#fff', children}) => (
  <div style={{position: 'relative', width: w, height: h + 50}}>
    <svg width={90} height={80} viewBox="0 0 90 80" style={{position: 'absolute', left: w * 0.14, top: h - 22}}><path d="M8 4L20 72L80 4" fill={bg} stroke={OL} strokeWidth={8} strokeLinejoin="round" /></svg>
    <Panel w={w} h={h} r={Math.min(w, h) * 0.3} bg={bg} style={{position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>{children}</Panel>
    <div style={{position: 'absolute', left: w * 0.14 + 12, top: h - 24, width: 62, height: 20, background: bg}} />
  </div>
);

// Twinkling sparkles scattered around the subject
export const Twinks: React.FC<{pts: [number, number, number, string][]}> = ({pts}) => {
  const {osc, p} = useLoop();
  return (
    <>
      {pts.map(([x, y, s, c], i) => (
        <At key={i} x={x} y={y} rot={p * 360 * (i % 2 ? 1 : -1)} scale={0.55 + 0.45 * Math.abs(osc(1, i * 0.21))}>
          <svg width={s * 1.5} height={s * 1.5} viewBox="-8 -8 116 116"><path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill={c} stroke={OL} strokeWidth={6} strokeLinejoin="round" /></svg>
        </At>
      ))}
    </>
  );
};

export {Sparkle, Q};
