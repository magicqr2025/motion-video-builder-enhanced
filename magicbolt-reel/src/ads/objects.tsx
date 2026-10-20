// Ads-vs-reviews reel objects: glossy money, flames, ban sign, shop, pin, people, search, listings, charts
import React from 'react';
import {useT} from '../components/kit';
import {Q} from './config';
import {Card, Sparkle, Stars, Tx} from '../qr/kit';

// White sheen across the top half of any rounded glossy object
export const Gloss: React.FC<{h?: string; a?: number}> = ({h = '48%', a = 0.45}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, borderRadius: 'inherit', background: `linear-gradient(180deg, rgba(255,255,255,${a}), rgba(255,255,255,0.04))`, pointerEvents: 'none'}} />
);

// ---------- ₹ note ----------
export const Note: React.FC<{w: number; style?: React.CSSProperties}> = ({w, style}) => {
  const h = w * 0.5;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: w * 0.05, background: 'linear-gradient(160deg, #5EE08F, #16A34A 55%, #0E7A3C)',
      boxShadow: '0 22px 44px rgba(14,122,60,0.35), inset 0 3px 0 rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style}}>
      <div style={{position: 'absolute', inset: w * 0.035, borderRadius: w * 0.03, border: `${w * 0.009}px solid rgba(255,255,255,0.55)`}} />
      <div style={{position: 'absolute', left: w * 0.08, top: h * 0.3, width: h * 0.4, height: h * 0.4, borderRadius: '50%', border: `${w * 0.008}px solid rgba(255,255,255,0.4)`}} />
      <div style={{position: 'absolute', right: w * 0.08, top: h * 0.3, width: h * 0.4, height: h * 0.4, borderRadius: '50%', border: `${w * 0.008}px solid rgba(255,255,255,0.4)`}} />
      <div style={{width: h * 0.64, height: h * 0.64, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fff, #D9FBE5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.18)'}}>
        <Tx size={h * 0.42} color="#0E7A3C">₹</Tx>
      </div>
      <Gloss />
    </div>
  );
};

// ---------- flame (flickers on its own) ----------
export const Flame: React.FC<{size: number; ph?: number}> = ({size, ph = 0}) => {
  const t = useT();
  const sy = 1 + 0.14 * Math.sin(t * 15 + ph) + 0.06 * Math.sin(t * 23 + ph * 2);
  const sk = 5 * Math.sin(t * 9 + ph);
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 100 125" style={{transform: `scaleY(${sy}) skewX(${sk}deg)`, transformOrigin: '50% 100%', overflow: 'visible', filter: 'drop-shadow(0 0 18px rgba(249,115,22,0.6))'}}>
      <defs>
        <linearGradient id="flameOut" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#DC2626" /><stop offset="0.45" stopColor="#F97316" /><stop offset="1" stopColor="#FDBA17" /></linearGradient>
        <linearGradient id="flameIn" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FDE047" /><stop offset="1" stopColor="#FFFBEB" /></linearGradient>
      </defs>
      <path d="M50 0C60 26 90 44 88 80C86 108 68 125 50 125C32 125 14 108 12 82C10 58 30 46 36 20C42 38 50 40 50 0Z" fill="url(#flameOut)" />
      <path d="M50 52C56 70 72 80 70 98C68 114 60 122 50 122C40 122 32 114 30 100C29 86 40 80 44 66C46 76 50 76 50 52Z" fill="url(#flameIn)" />
    </svg>
  );
};

// ---------- red ban sign ----------
export const Ban: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 18px 30px rgba(200,30,30,0.45))'}}>
    <defs><linearGradient id="banG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF7A7A" /><stop offset="1" stopColor="#C81E1E" /></linearGradient></defs>
    <circle cx="50" cy="50" r="41" fill="rgba(255,255,255,0.35)" stroke="url(#banG)" strokeWidth="12" />
    <path d="M22 22L78 78" stroke="url(#banG)" strokeWidth="12" strokeLinecap="round" />
    <path d="M24 34A30 30 0 0 1 50 14" stroke="rgba(255,255,255,0.7)" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

// ---------- glossy tile with a megaphone: "Ads" ----------
export const AdTile: React.FC<{size: number}> = ({size}) => (
  <div style={{position: 'relative', width: size, height: size, borderRadius: size * 0.28, background: 'linear-gradient(145deg, #FF8A3D, #ED1C6F)', boxShadow: `0 30px 60px ${Q.pink}55, inset 0 4px 0 rgba(255,255,255,0.45)`,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: size * 0.02, overflow: 'hidden'}}>
    <svg width={size * 0.5} height={size * 0.4} viewBox="0 0 100 80">
      <path d="M10 28h18l40-22v68L28 52H10z" fill="#fff" />
      <path d="M24 52l8 24h12l-6-24z" fill="#fff" opacity={0.85} />
      <path d="M78 26q10 14 0 28M86 16q18 24 0 48" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
    <Tx size={size * 0.24} color="#fff">ADS</Tx>
    <Gloss />
  </div>
);

// ---------- storefront (200 x 180 viewBox) ----------
export const Shop: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.9} viewBox="0 0 200 180" style={{filter: 'drop-shadow(0 30px 40px rgba(79,66,154,0.3))'}}>
    <defs>
      <linearGradient id="shRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A78BFA" /><stop offset="1" stopColor="#6D28D9" /></linearGradient>
      <linearGradient id="shWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E9E3FF" /></linearGradient>
      <linearGradient id="shGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7DB6FF" /><stop offset="1" stopColor="#2B59FF" /></linearGradient>
    </defs>
    <rect x="20" y="66" width="160" height="104" rx="10" fill="url(#shWall)" />
    <rect x="8" y="16" width="184" height="26" rx="9" fill="url(#shRoof)" />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${10 + i * 30} 40h30v26a15 15 0 0 1-30 0z`} fill={i % 2 ? '#fff' : Q.pink} />)}
    <rect x="34" y="98" width="58" height="46" rx="7" fill="url(#shGlass)" />
    <path d="M40 104l18 0-14 34h-4z" fill="#fff" opacity={0.35} />
    <rect x="110" y="96" width="50" height="74" rx="7" fill="url(#shRoof)" />
    <circle cx="150" cy="134" r="4" fill="#FDBA17" />
    <rect x="4" y="166" width="192" height="12" rx="6" fill="url(#shRoof)" />
    <rect x="12" y="20" width="176" height="8" rx="4" fill="#fff" opacity={0.35} />
  </svg>
);

// ---------- map pin ----------
export const Pin: React.FC<{size: number; color?: string; label?: string}> = ({size, color = '#EA4335', label}) => (
  <div style={{position: 'relative', width: size, height: size * 1.12}}>
    <svg width={size} height={size * 1.12} viewBox="0 0 100 112" style={{position: 'absolute', filter: `drop-shadow(0 14px 18px ${color}66)`}}>
      <defs><linearGradient id={`pin${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.45} /><stop offset="0.5" stopColor="#fff" stopOpacity={0} /></linearGradient></defs>
      <path d="M50 2C24 2 6 21 6 45c0 30 44 65 44 65s44-35 44-65C94 21 76 2 50 2z" fill={color} />
      <path d="M50 2C24 2 6 21 6 45c0 30 44 65 44 65s44-35 44-65C94 21 76 2 50 2z" fill={`url(#pin${color.slice(1)})`} />
      {!label && <circle cx="50" cy="44" r="17" fill="#fff" />}
    </svg>
    {label && <div style={{position: 'absolute', left: 0, right: 0, top: size * 0.2, textAlign: 'center'}}><Tx size={size * 0.42} color="#fff">{label}</Tx></div>}
  </div>
);

// ---------- glossy avatar ----------
export const Person: React.FC<{size: number; color: string}> = ({size, color}) => (
  <div style={{position: 'relative', width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: `${size * 0.05}px solid #fff`, boxSizing: 'border-box',
    background: `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.6), rgba(255,255,255,0) 50%), ${color}`, boxShadow: `0 14px 30px ${color}66`}}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
      <circle cx="50" cy="40" r="17" fill="#fff" opacity={0.95} />
      <path d="M16 100c2-22 16-34 34-34s32 12 34 34z" fill="#fff" opacity={0.95} />
    </svg>
  </div>
);

// ---------- starburst badge ----------
const BURST = Array.from({length: 32}, (_, i) => {
  const r = i % 2 ? 40 : 50; const a = (i * Math.PI) / 16;
  return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
}).join(' ');
export const Burst: React.FC<{size: number; color?: string; spin?: number; children?: React.ReactNode}> = ({size, color = Q.yellow, spin = 0, children}) => (
  <div style={{position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, transform: `rotate(${spin}deg)`, filter: `drop-shadow(0 14px 24px ${color}88)`}}>
      <polygon points={BURST} fill={color} />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="4 4" opacity={0.8} />
    </svg>
    <div style={{position: 'relative'}}>{children}</div>
  </div>
);

// ---------- glossy magnifier ----------
export const Magnifier: React.FC<{size: number; color?: string}> = ({size, color = Q.purple}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 18px 24px ${color}55)`}}>
    <defs><radialGradient id="lens" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#DCE6FF" stopOpacity={0.6} /></radialGradient></defs>
    <path d="M62 62l26 26" stroke={color} strokeWidth="16" strokeLinecap="round" />
    <circle cx="40" cy="40" r="30" fill="url(#lens)" stroke={color} strokeWidth="10" />
    <path d="M24 34a18 18 0 0 1 14-14" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

// ---------- search bar ----------
export const SearchBar: React.FC<{text: string; w?: number; caret?: boolean}> = ({text, w = 900, caret}) => (
  <Card w={w} h={124} r={62} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 40px', borderWidth: 3}}>
    <svg width={50} height={50} viewBox="0 0 48 48"><circle cx="20" cy="20" r="14" fill="none" stroke={Q.blue} strokeWidth={5} /><path d="M31 31l12 12" stroke={Q.blue} strokeWidth={6} strokeLinecap="round" /></svg>
    <Tx size={46} w={400}>{text}</Tx>
    {caret && <span style={{width: 4, height: 54, background: Q.blue, marginLeft: -18}} />}
    <svg width={40} height={52} viewBox="0 0 40 52" style={{marginLeft: 'auto'}}>
      <rect x="11" y="2" width="18" height="30" rx="9" fill={Q.g[0]} /><path d="M4 24a16 16 0 0 0 32 0" fill="none" stroke={Q.g[1]} strokeWidth={4} /><path d="M20 40v10" stroke={Q.g[4]} strokeWidth={4} strokeLinecap="round" />
    </svg>
  </Card>
);

// ---------- Google Maps style listing row ----------
export const Listing: React.FC<{rank: number; name: string; rating: number; count: number; w?: number; hue: string; badge?: boolean}> = ({rank, name, rating, count, w = 900, hue, badge}) => {
  const medal = ['#FDBA17', '#B8C2D6', '#E59866'][rank - 1];
  return (
    <Card w={w} h={132} r={32} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px'}}>
      <div style={{position: 'relative', width: 88, height: 88, borderRadius: 24, background: `linear-gradient(145deg, ${hue}, ${Q.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0}}>
        <Sparkle size={48} color="#fff" /><Gloss />
      </div>
      <div style={{flex: 1}}>
        <Tx size={36}>{name}</Tx><br />
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 2}}>
          <Tx size={28} color={Q.slate}>{rating.toFixed(1)}</Tx><Stars n={rating} size={30} /><Tx size={26} color={Q.slate} w={400}>({count})</Tx>
        </div>
      </div>
      {badge && medal && (
        <div style={{position: 'relative', width: 74, height: 74, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #fff, ${medal} 60%)`, boxShadow: `0 10px 24px ${medal}aa`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Tx size={36} color={Q.ink}>{rank}</Tx>
        </div>
      )}
    </Card>
  );
};

// ---------- on/off toggle ----------
export const Toggle: React.FC<{on: number}> = ({on}) => (
  <div style={{position: 'relative', width: 130, height: 70, borderRadius: 35, background: on > 0.5 ? Q.green : '#C9C5D8', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.18)'}}>
    <div style={{position: 'absolute', top: 7, left: 7 + 60 * on, width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fff, #EDEAF7)', boxShadow: '0 6px 12px rgba(0,0,0,0.25)'}} />
  </div>
);

// ---------- line chart, drawn left to right up to `p` ----------
export const Chart: React.FC<{f: (x: number) => number; p: number; w: number; h: number; color: string}> = ({f, p, w, h, color}) => {
  const N = 60;
  const pts = Array.from({length: Math.max(2, Math.round(N * p) + 1)}, (_, i) => {
    const x = Math.min(p, i / N);
    return [x * w, h - f(x) * h] as [number, number];
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  const id = `ch${color.slice(1)}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={0.35} /><stop offset="1" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={Q.line} strokeWidth={2} strokeDasharray="8 8" />)}
      <polygon points={`0,${h} ${line} ${lx},${h}`} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={14} fill="#fff" stroke={color} strokeWidth={7} />
    </svg>
  );
};

// ---------- chips for "biggest factor" ----------
export type FactorIcon = 'Photos' | 'Website' | 'Reviews' | 'Offers';
export const FactorGlyph: React.FC<{name: string; size: number}> = ({name, size}) => {
  const s = {fill: 'none', stroke: '#fff', strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {name === 'Photos' && (<><rect x="10" y="26" width="80" height="58" rx="12" {...s} /><circle cx="50" cy="55" r="15" {...s} /><path d="M34 26l6-12h20l6 12" {...s} /></>)}
      {name === 'Website' && (<><circle cx="50" cy="50" r="38" {...s} /><path d="M12 50h76M50 12c-20 22-20 54 0 76M50 12c20 22 20 54 0 76" {...s} /></>)}
      {name === 'Reviews' && <polygon points="50,8 61,38 92,38 67,57 76,88 50,70 24,88 33,57 8,38 39,38" fill="#fff" />}
      {name === 'Offers' && (<><path d="M14 14h36l38 38-36 36-38-38z" {...s} /><circle cx="32" cy="32" r="7" fill="#fff" /></>)}
    </svg>
  );
};
