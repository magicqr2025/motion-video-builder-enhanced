// "Glossy pop" toolkit for the second set of feature loops:
// bright gradient backdrop disc, 3D-style chips with highlights and depth, glows, shine, confetti.
// The disc has a hard edge so the GIFs can stay transparent outside it.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fontFamily} from '../components/kit';
import {Tx} from '../qr/kit';
import {At, G, GName, useLoop} from '../loops/parts';

export const INK = '#1B1640';
export const GREEN = '#25D366';

const h2 = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => { const [x, y] = [rgb(a), rgb(b)]; return '#' + x.map((v, i) => h2(v + (y[i] - v) * t)).join(''); };
export const lite = (c: string, t = 0.35) => mix(c, '#ffffff', t);
export const dark = (c: string, t = 0.28) => mix(c, '#000000', t);

// ---------- Stage: bright disc with slow sunburst and drifting light spots ----------
const SPOTS: [number, number, number][] = [[230, 300, 120], [860, 220, 80], [900, 760, 150], [200, 800, 90], [560, 950, 70], [520, 150, 60]];
export const Stage: React.FC<{c: [string, string, string]; children?: React.ReactNode}> = ({c, children}) => {
  const {p, osc} = useLoop();
  const fade = 'radial-gradient(closest-side, transparent 18%, #000 70%)';
  return (
    <AbsoluteFill style={{fontFamily}}>
      <div style={{position: 'absolute', left: 50, top: 50, width: 1100, height: 1100, borderRadius: '50%', overflow: 'hidden', boxSizing: 'border-box', border: '14px solid #fff',
        background: `radial-gradient(circle at 30% 22%, ${c[0]}, ${c[1]} 55%, ${c[2]} 100%)`}}>
        {/* 22.5° ray pitch, turned 45° per loop, so the burst closes on itself */}
        <div style={{position: 'absolute', inset: '-25%', background: `repeating-conic-gradient(from ${p * 45}deg, rgba(255,255,255,0.16) 0deg 11.25deg, transparent 11.25deg 22.5deg)`, WebkitMaskImage: fade, maskImage: fade}} />
        {SPOTS.map(([x, y, s], i) => <div key={i} style={{position: 'absolute', left: x - s / 2 + 26 * osc(1, i * 0.17), top: y - s / 2 + 30 * osc(1, i * 0.29 + 0.1), width: s, height: s, borderRadius: '50%', background: 'rgba(255,255,255,0.2)'}} />)}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 -70px 110px rgba(20,0,60,0.28), inset 0 50px 90px rgba(255,255,255,0.28)'}} />
      </div>
      {children}
    </AbsoluteFill>
  );
};

// Soft contact shadow on the "floor"
export const Floor: React.FC<{x: number; y: number; w: number; a?: number}> = ({x, y, w, a = 0.3}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.09, width: w, height: w * 0.18, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(20,0,60,${a}), rgba(20,0,60,0))`}} />
);

// ---------- Surfaces ----------
// Coloured 3D chip: gradient face, top highlight, solid "thickness" underneath
export const Chip: React.FC<{w: number | string; h: number; r?: number; c: string; depth?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 30, c, depth = 12, style, children}) => (
  <div style={{width: w, height: h, borderRadius: r, position: 'relative', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `linear-gradient(150deg, ${lite(c, 0.38)}, ${c} 52%, ${dark(c, 0.22)})`,
    boxShadow: `0 ${depth}px 0 ${dark(c, 0.42)}, 0 ${depth + 16}px 26px rgba(20,0,60,0.35), inset 0 5px 8px rgba(255,255,255,0.5), inset 0 -8px 12px ${dark(c, 0.3)}55`, ...style}}>
    <div style={{position: 'absolute', left: '9%', right: '9%', top: '7%', height: '38%', borderRadius: r, background: 'linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0))'}} />
    <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}>{children}</div>
  </div>
);

// White card with thickness and a soft drop shadow
export const Card: React.FC<{w?: number | string; h?: number | string; r?: number; edge?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 40, edge = '#CDBFF3', style, children}) => (
  <div style={{width: w, height: h, borderRadius: r, boxSizing: 'border-box', background: 'linear-gradient(180deg, #FFFFFF, #F2EDFF)',
    boxShadow: `0 14px 0 ${edge}, 0 34px 40px rgba(20,0,60,0.4), inset 0 4px 0 #fff`, ...style}}>{children}</div>
);

export const Icon: React.FC<{name: GName; size: number; c: string; round?: boolean}> = ({name, size, c, round}) => (
  <Chip w={size} h={size} r={round ? size / 2 : size * 0.28} c={c} depth={size * 0.08}><G name={name} size={size * 0.54} /></Chip>
);

// Phone: 430 x 820. `shine` sweeps a highlight across the glass once per loop.
export const Phone: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const {p} = useLoop();
  const s = (p * 1 + 0.4) % 1;
  return (
    <div style={{width: 430, height: 820, borderRadius: 76, padding: 14, boxSizing: 'border-box', background: 'linear-gradient(160deg, #4A4390, #17123A)',
      boxShadow: '0 18px 0 #0B0822, 0 48px 50px rgba(20,0,60,0.5), inset 0 3px 0 rgba(255,255,255,0.3)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 62, background: '#fff', overflow: 'hidden', position: 'relative'}}>
        {children}
        <div style={{position: 'absolute', left: '50%', top: 14, width: 120, height: 26, borderRadius: 13, background: '#17123A', transform: 'translateX(-50%)'}} />
        {s < 0.35 && <div style={{position: 'absolute', top: -60, left: -260 + 2000 * s, width: 130, height: 960, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))', transform: 'skewX(-18deg)'}} />}
      </div>
    </div>
  );
};

// ---------- Small objects ----------
export const Star3D: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 1.08} viewBox="0 0 100 108" style={{overflow: 'visible'}}>
    <defs><linearGradient id="st3" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#FFF3A8" /><stop offset="0.45" stopColor="#FFC61A" /><stop offset="1" stopColor="#FF8A00" /></linearGradient></defs>
    <polygon points="50,12 62,40 93,42 69,62 77,93 50,76 23,93 31,62 7,42 38,40" fill="#C96A00" stroke="#C96A00" strokeWidth={10} strokeLinejoin="round" />
    <polygon points="50,4 62,32 93,34 69,54 77,85 50,68 23,85 31,54 7,34 38,32" fill="url(#st3)" stroke="url(#st3)" strokeWidth={10} strokeLinejoin="round" />
    <path d="M36 30L50 6l6 14" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={5} strokeLinecap="round" />
  </svg>
);

export const Glint: React.FC<{size: number; c?: string}> = ({size, c = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 0 ${size * 0.14}px ${c})`, overflow: 'visible'}}>
    <path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill={c} />
  </svg>
);
// Twinkling glints scattered around
export const Glints: React.FC<{pts: [number, number, number][]; c?: string}> = ({pts, c}) => {
  const {osc, p} = useLoop();
  return <>{pts.map(([x, y, s], i) => <At key={i} x={x} y={y} rot={p * 180 * (i % 2 ? 1 : -1)} scale={0.35 + 0.65 * Math.abs(osc(1, i * 0.19))}><Glint size={s} c={c} /></At>)}</>;
};

// Confetti falling inside the disc
const CONF = ['#FFD43B', '#FF4F8B', '#7B3FF2', '#25D366', '#3FA9FF', '#FFFFFF'];
export const Confetti: React.FC<{n?: number}> = ({n = 16}) => {
  const {p} = useLoop();
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const r = (p + (i * 0.618) % 1) % 1;
        const x = 190 + ((i * 97) % 820);
        return <div key={i} style={{position: 'absolute', left: x + 40 * Math.sin(r * 8 + i), top: 130 + 900 * r, width: 26, height: 14, borderRadius: 5, background: CONF[i % CONF.length], opacity: Math.sin(Math.PI * r), transform: `rotate(${r * 720 + i * 40}deg)`}} />;
      })}
    </>
  );
};

export const Tick: React.FC<{size: number; c?: string}> = ({size, c = GREEN}) => (
  <Chip w={size} h={size} r={size / 2} c={c} depth={size * 0.08}>
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 60 60"><polyline points="12,31 25,44 49,17" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /></svg>
  </Chip>
);

// Round portrait
export const Face: React.FC<{size: number; c: string; hair?: string}> = ({size, c, hair = '#2B1B4A'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs><clipPath id="fc"><circle cx="50" cy="50" r="46" /></clipPath><linearGradient id={`fg${c.slice(1)}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={lite(c, 0.4)} /><stop offset="1" stopColor={c} /></linearGradient></defs>
    <circle cx="50" cy="50" r="46" fill={`url(#fg${c.slice(1)})`} />
    <g clipPath="url(#fc)">
      <path d="M16 106c0-26 15-38 34-38s34 12 34 38z" fill="#fff" />
      <circle cx="50" cy="44" r="19" fill="#FFD3AE" />
      <path d="M29 44c-2-17 9-26 21-26s23 9 21 26c-6-9-13-12-21-12s-15 3-21 12z" fill={hair} />
    </g>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeWidth={7} />
  </svg>
);

// Friendly robot head (360 x 330)
export const Bot: React.FC<{eye?: string}> = ({eye = '#5CF2FF'}) => {
  const {p, osc} = useLoop();
  const blink = (p * 2) % 1 > 0.93 ? 0.15 : 1;
  return (
    <div style={{position: 'relative', width: 360, height: 330}}>
      <div style={{position: 'absolute', left: 172, top: 0, width: 16, height: 60, background: '#B9AFEA'}} />
      <div style={{position: 'absolute', left: 152, top: -34, width: 56, height: 56, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #fff, ${eye} 55%)`, boxShadow: `0 0 ${20 + 16 * Math.abs(osc(2))}px ${eye}`}} />
      {[-18, 312].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 130, width: 66, height: 110, borderRadius: 30, background: 'linear-gradient(160deg, #9A86FF, #5B3FF2)', boxShadow: '0 8px 0 #3A22B8'}} />)}
      <div style={{position: 'absolute', left: 20, top: 50, width: 320, height: 260, borderRadius: 100, background: 'linear-gradient(170deg, #FFFFFF, #E4DCFF)', boxShadow: '0 14px 0 #B9AFEA, 0 36px 40px rgba(20,0,60,0.4), inset 0 6px 0 #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 250, height: 160, borderRadius: 66, background: 'linear-gradient(160deg, #2E2760, #120E30)', position: 'relative', boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.18)'}}>
          {[58, 154].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 44, width: 38, height: 50 * blink, borderRadius: 19, background: eye, boxShadow: `0 0 22px ${eye}`, transform: `translateY(${(1 - blink) * 25}px)`}} />)}
          <svg width={90} height={40} viewBox="0 0 90 40" style={{position: 'absolute', left: 80, top: 104, filter: `drop-shadow(0 0 8px ${eye})`}}><path d="M8 6q37 36 74 0" fill="none" stroke={eye} strokeWidth={10} strokeLinecap="round" /></svg>
        </div>
      </div>
    </div>
  );
};

// White pill "toast" with a tick
export const Toast: React.FC<{text: string; size?: number; c?: string}> = ({text, size = 40, c = GREEN}) => (
  <Card r={999} style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.35, padding: `${size * 0.3}px ${size * 0.7}px ${size * 0.3}px ${size * 0.35}px`}}>
    <Tick size={size * 1.25} c={c} /><Tx size={size} color={INK}>{text}</Tx>
  </Card>
);

// Chat bubble
export const Msg: React.FC<{text: string; mine?: boolean; c?: string; size?: number; w?: number}> = ({text, mine, c = GREEN, size = 30, w}) => (
  <div style={{alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: w ?? 300, padding: `${size * 0.42}px ${size * 0.66}px`, borderRadius: size * 0.8, borderBottomRightRadius: mine ? 6 : size * 0.8, borderBottomLeftRadius: mine ? size * 0.8 : 6,
    background: mine ? `linear-gradient(160deg, ${lite(c, 0.25)}, ${c})` : '#EEE9FB', boxShadow: mine ? `0 5px 0 ${dark(c, 0.35)}` : '0 5px 0 #D5CCF0'}}>
    <Tx size={size} color={mine ? '#fff' : INK} style={{whiteSpace: 'normal', lineHeight: 1.2}}>{text}</Tx>
  </div>
);

export const Dots: React.FC<{c?: string; s?: number}> = ({c = '#8B7BE8', s = 18}) => {
  const {p} = useLoop();
  return <div style={{display: 'flex', gap: s * 0.5}}>{[0, 1, 2].map((i) => <div key={i} style={{width: s, height: s, borderRadius: '50%', background: c, transform: `translateY(${-s * 0.6 * Math.max(0, Math.sin(Math.PI * 2 * (p * 4 - i * 0.14)))}px)`}} />)}</div>;
};

// 8-tooth gear; rot = p * 90 loops cleanly
export const Gear: React.FC<{size: number; c: string; rot: number}> = ({size, c, rot}) => (
  <svg width={size} height={size} viewBox="-104 -112 208 224" style={{overflow: 'visible'}}>
    <g transform={`translate(0 12) rotate(${rot})`}>{Array.from({length: 8}, (_, i) => <rect key={i} x={-21} y={-98} width={42} height={52} rx={10} fill={dark(c, 0.42)} transform={`rotate(${i * 45})`} />)}<circle r={68} fill={dark(c, 0.42)} /></g>
    <g transform={`rotate(${rot})`}>{Array.from({length: 8}, (_, i) => <rect key={i} x={-21} y={-98} width={42} height={52} rx={10} fill={c} transform={`rotate(${i * 45})`} />)}<circle r={68} fill={c} /><circle r={52} fill={lite(c, 0.25)} /><circle r={24} fill="#fff" /></g>
  </svg>
);

export const BoltIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 108" style={{overflow: 'visible', filter: 'drop-shadow(0 0 14px rgba(255,220,60,0.9))'}}>
    <polygon points="56,12 16,64 44,64 36,104 84,50 56,50" fill="#C96A00" />
    <polygon points="56,4 16,56 44,56 36,96 84,42 56,42" fill="#FFD43B" />
  </svg>
);

export {At, G, Tx, useLoop};
export type {GName};
