import React from 'react';
import {C, BG, BRAND, IconName} from '../config';
import {Txt, useT, P, eo, eb, SHADOW} from './kit';

// ---------- Icons (100x100 viewBox, white on colored tile) ----------
const star = (cx: number, cy: number, R: number, r: number, n = 5, rot = -Math.PI / 2) =>
  Array.from({length: n * 2}, (_, i) => {
    const rad = i % 2 ? r : R; const a = rot + (i * Math.PI) / n;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(' ');

export const Icon: React.FC<{name: IconName; size: number; tint: string}> = ({name, size, tint}) => {
  const w = '#fff';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {name === 'pin' && (<>
        <path d="M50 88 C36 68 22 56 22 40 A28 28 0 0 1 78 40 C78 56 64 68 50 88Z" fill={w} />
        <circle cx="50" cy="40" r="11" fill={tint} />
      </>)}
      {name === 'chart' && (<>
        {[25, 42, 62].map((h, i) => <rect key={i} x={20 + i * 24} y={82 - h} width={14} height={h} rx={4} fill={w} />)}
        <polyline points="14,48 42,28 56,40 82,16" fill="none" stroke={w} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="86,12 68,12 86,30" fill={w} />
      </>)}
      {name === 'chat' && (<>
        <rect x="14" y="20" width="72" height="50" rx="14" fill={w} />
        <polygon points="32,68 24,86 48,68" fill={w} />
        {[34, 50, 66].map((x) => <circle key={x} cx={x} cy={45} r={5} fill={tint} />)}
      </>)}
      {name === 'star' && <polygon points={star(50, 52, 40, 17)} fill={w} />}
      {name === 'sparkle' && (<>
        <polygon points={star(44, 54, 36, 9, 4, 0)} fill={w} />
        <polygon points={star(74, 26, 15, 4, 4, 0)} fill={w} />
      </>)}
      {name === 'dash' && (<>
        <rect x="12" y="20" width="76" height="56" rx="8" fill="none" stroke={w} strokeWidth={6} />
        {[16, 28, 22, 36].map((h, i) => <rect key={i} x={24 + i * 14} y={66 - h} width={8} height={h} rx={3} fill={w} />)}
      </>)}
      {name === 'people' && (<>
        <circle cx="35" cy="36" r="11" fill={w} /><path d="M15 80 A20 20 0 0 1 55 80Z" fill={w} />
        <circle cx="65" cy="36" r="13" fill={w} /><path d="M41 80 A24 24 0 0 1 89 80Z" fill={w} />
      </>)}
    </svg>
  );
};

export const IconTile: React.FC<{name: IconName; size: number; color: string; radius?: number}> = ({name, size, color, radius = 30}) => (
  <div style={{width: size, height: size, borderRadius: radius, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    boxShadow: `inset 0 ${size / 2}px 0 rgba(255,255,255,0.12)`}}>
    <Icon name={name} size={size * 0.8} tint={color} />
  </div>
);

export const Check: React.FC<{size?: number}> = ({size = 60}) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="30" fill={C.green} />
    <polyline points="19,30 27,38 42,22" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Bolt: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100">
    <defs>
      <linearGradient id="boltG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF7AE" /><stop offset="0.5" stopColor={C.yellow} /><stop offset="1" stopColor={C.orange} />
      </linearGradient>
    </defs>
    <polygon points="10,-46 -30,6 -2,6 -12,46 30,-8 2,-8" fill="url(#boltG)" />
  </svg>
);

// ---------- Logo lockup ----------
export const Logo: React.FC<{at: number; size: number}> = ({at, size}) => {
  const t = useT();
  const k = P(t, at, 0.6);
  const k2 = P(t, at + 0.12, 0.5);
  const tile = size * 1.45;
  const s = k < 1 ? Math.max(0.001, eb(k, 2.4)) : 1;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.32}}>
      <div style={{width: tile, height: tile, borderRadius: tile * 0.28, background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW,
        transform: `scale(${k > 0 ? s : 0}) rotate(${(1 - eo(k)) * -28}deg)`}}>
        <Bolt size={tile * 0.78} />
      </div>
      <div style={{opacity: eo(k2), transform: `translateX(${-40 * (1 - eo(k2))}px)`}}>
        <Txt size={size}>{BRAND.name1}</Txt>
        <Txt size={size} g={[C.violet, C.blue]}>{BRAND.name2}</Txt>
      </div>
    </div>
  );
};

// ---------- Cursor ----------
export const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
  <svg width={60} height={90} viewBox="-4 -4 56 86"
    style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.12 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(3px 8px 6px rgba(0,0,0,0.18))'}}>
    <polygon points="0,0 0,62 15,48 26,74 38,69 27,44 47,44" fill={C.ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

// ---------- Background: drifting colour blobs + dot grid ----------
const BLOBS = [
  {x: 150, y: 300, r: 620, sp: 0.21, ph: 0},
  {x: 950, y: 520, r: 560, sp: 0.17, ph: 1.7},
  {x: 880, y: 1650, r: 600, sp: 0.19, ph: 3.1},
  {x: 160, y: 1450, r: 580, sp: 0.23, ph: 4.4},
  {x: 540, y: 980, r: 520, sp: 0.15, ph: 2.2},
];
export const Background: React.FC = () => {
  const t = useT();
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG.wash.join(', ')})`, overflow: 'hidden'}}>
      {BLOBS.map((b, i) => {
        const c = BG.blobs[i % BG.blobs.length];
        const x = b.x + 110 * Math.sin(t * b.sp * 2 + b.ph);
        const y = b.y + 140 * Math.cos(t * b.sp * 1.6 + b.ph * 1.3);
        return <div key={i} style={{position: 'absolute', left: x - b.r, top: y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: '50%',
          background: `radial-gradient(closest-side, ${c}47, ${c}17 55%, ${c}00)`}} />;
      })}
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(12,16,48,0.06) 1.6px, transparent 1.8px)', backgroundSize: '60px 60px', backgroundPosition: '30px 40px'}} />
    </div>
  );
};
