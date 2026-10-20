// Neon-version objects: line icons, mini items, windows, brand, dashboard, cursor
import React from 'react';
import {useT, P, eo} from '../components/kit';
import {Bolt} from '../components/graphics';
import {BRAND, IcoName, MiniKind, N} from './config';
import {B, Glass, M} from './kit';

const starPts = (cx: number, cy: number, R: number, r: number) =>
  Array.from({length: 10}, (_, i) => {
    const rad = i % 2 ? r : R; const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(' ');

// ---------- Line icons (100x100) ----------
export const Ico: React.FC<{name: IcoName; size: number; color: string; sw?: number}> = ({name, size, color, sw = 7}) => {
  const s = {fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 0 14px ${color}99)`}}>
      {name === 'post' && (<><rect x="14" y="14" width="72" height="72" rx="14" {...s} /><circle cx="37" cy="38" r="8" {...s} /><polyline points="18,76 42,54 56,66 68,56 84,72" {...s} /></>)}
      {name === 'star' && <polygon points={starPts(50, 53, 40, 17)} {...s} />}
      {name === 'pin' && (<><path d="M50 90 C36 70 20 58 20 40 A30 30 0 0 1 80 40 C80 58 64 70 50 90Z" {...s} /><circle cx="50" cy="40" r="11" {...s} /></>)}
      {name === 'chart' && (<><polyline points="14,14 14,86 88,86" {...s} /><polyline points="26,70 44,50 58,60 84,26" {...s} /><polyline points="68,26 84,26 84,42" {...s} /></>)}
    </svg>
  );
};

// ---------- Tiny repeated items for the "10 of everything" rows (84x84) ----------
export const Mini: React.FC<{kind: MiniKind; color: string; n: number}> = ({kind, color, n}) => (
  <svg width={84} height={84} viewBox="0 0 84 84">
    {kind === 'tab' && (<>
      <path d="M6 70V30a12 12 0 0 1 12-12h48a12 12 0 0 1 12 12v40" fill={`${color}22`} stroke={color} strokeWidth={4} />
      <circle cx="24" cy="38" r="7" fill={color} /><rect x="38" y="34" width="28" height="8" rx="4" fill={`${color}88`} /><line x1="2" y1="70" x2="82" y2="70" stroke={color} strokeWidth={4} />
    </>)}
    {kind === 'key' && (<>
      <rect x="4" y="22" width="76" height="40" rx="20" fill={`${color}22`} stroke={color} strokeWidth={4} />
      {[22, 36, 50, 64].map((x) => <circle key={x} cx={x} cy={42} r={5} fill={color} />)}
    </>)}
    {kind === 'bill' && (<>
      <path d="M14 6h56v70l-9.3-8-9.3 8-9.4-8-9.3 8-9.4-8L14 76z" fill={`${color}22`} stroke={color} strokeWidth={4} strokeLinejoin="round" />
      <rect x="24" y="20" width="36" height="6" rx="3" fill={color} /><rect x="24" y="34" width="24" height="6" rx="3" fill={`${color}88`} /><rect x="24" y="48" width="30" height="6" rx="3" fill={`${color}88`} />
    </>)}
    <text x="78" y="16" textAnchor="end" fontFamily="JetBrains Mono" fontSize="13" fontWeight="700" fill={color} opacity={0.9}>{String(n).padStart(2, '0')}</text>
  </svg>
);

// ---------- Window chrome ----------
export const Dots3: React.FC<{s?: number}> = ({s = 14}) => (
  <div style={{display: 'flex', gap: s * 0.6}}>{[N.red, N.amber, N.lime].map((c) => <div key={c} style={{width: s, height: s, borderRadius: '50%', background: c}} />)}</div>
);

// Blurred-depth decorative window
export const MiniWin: React.FC<{w: number; h: number; c: string}> = ({w, h, c}) => (
  <Glass w={w} h={h} r={22} style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 12, filter: 'blur(1.5px)'}}>
    <Dots3 s={10} />
    <div style={{height: 12, width: '70%', borderRadius: 6, background: c}} />
    <div style={{height: 12, width: '45%', borderRadius: 6, background: 'rgba(255,255,255,0.18)'}} />
    <div style={{flex: 1, borderRadius: 12, background: `${c}26`}} />
  </Glass>
);

// ---------- Brand ----------
export const Logo: React.FC<{size: number}> = ({size}) => {
  const tile = size * 1.35;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.28}}>
      <div style={{width: tile, height: tile, borderRadius: tile * 0.28, background: `linear-gradient(135deg, ${N.violet}, ${N.blue})`, boxShadow: `0 0 60px ${N.violet}AA`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Bolt size={tile * 0.74} />
      </div>
      <B size={size} w={700}>{BRAND.name}</B>
      <div style={{background: N.lime, borderRadius: size * 0.18, padding: `${size * 0.02}px ${size * 0.2}px`}}><B size={size * 0.6} w={700} color={N.bg}>{BRAND.suffix}</B></div>
    </div>
  );
};

// Product brand mark. k: 0 = MagicBolt AI, 1 = the agency's own brand (flips between)
export const BrandChip: React.FC<{size: number; k?: number}> = ({size, k = 0}) => {
  const ours = k < 0.5;
  const s = Math.max(0.001, ours ? 1 - k * 2 : k * 2 - 1);
  const tile = size * 1.3;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.32, transform: `scaleY(${s})`}}>
      <div style={{width: tile, height: tile, borderRadius: tile * 0.28, background: ours ? `linear-gradient(135deg, ${N.violet}, ${N.blue})` : N.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        {ours ? <Bolt size={tile * 0.74} /> : <B size={size * 0.85} w={700} color="#fff">{BRAND.yours[0]}</B>}
      </div>
      <B size={size} w={700}>{ours ? `${BRAND.name} ${BRAND.suffix}` : BRAND.yours}</B>
    </div>
  );
};

// ---------- Dark dashboard (drawn stand-in) — 900x600 ----------
const NAV = ['Social', 'GBP', 'Reviews', 'Reports'];
const Bar: React.FC<{w: number | string; h?: number; c?: string}> = ({w, h = 12, c = 'rgba(255,255,255,0.16)'}) => <div style={{width: w, height: h, borderRadius: h, background: c, flexShrink: 0}} />;
const panel: React.CSSProperties = {borderRadius: 18, border: `2px solid ${N.line}`, background: 'rgba(255,255,255,0.04)', boxSizing: 'border-box'};

export const Dash: React.FC<{k?: number; accent?: string; at?: number}> = ({k = 0, accent = N.cyan, at = 0}) => {
  const t = useT();
  return (
    <Glass w={900} h={600} r={34} glow={accent} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
      <div style={{height: 80, flexShrink: 0, borderBottom: `2px solid ${N.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px'}}>
        <BrandChip size={30} k={k} />
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Bar w={190} h={34} /><div style={{width: 44, height: 44, borderRadius: '50%', background: accent}} /></div>
      </div>
      <div style={{display: 'flex', flex: 1, minHeight: 0}}>
        <div style={{width: 200, flexShrink: 0, borderRight: `2px solid ${N.line}`, padding: '20px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10}}>
          {NAV.map((n, i) => (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: i === 0 ? `${accent}26` : 'transparent', border: `2px solid ${i === 0 ? accent : 'transparent'}`}}>
              <div style={{width: 12, height: 12, borderRadius: '50%', background: i === 0 ? accent : N.dim}} /><B size={24} color={i === 0 ? N.text : N.dim}>{n}</B>
            </div>
          ))}
        </div>
        <div style={{flex: 1, minWidth: 0, padding: 22, display: 'flex', flexDirection: 'column', gap: 18}}>
          <div style={{display: 'flex', gap: 16}}>
            {[accent, N.pink, N.lime].map((c, i) => (
              <div key={i} style={{...panel, flex: 1, height: 104, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <Bar w="60%" /><Bar w={`${[80, 55, 70][i]}%`} h={26} c={c} />
              </div>
            ))}
          </div>
          <div style={{display: 'flex', gap: 16, flex: 1, minHeight: 0}}>
            <div style={{...panel, flex: 1.5, padding: 18, display: 'flex', alignItems: 'flex-end', gap: 12}}>
              {[0.35, 0.5, 0.42, 0.66, 0.6, 0.82, 1].map((h, i) => <div key={i} style={{flex: 1, height: `${h * 100 * eo(P(t, at + 0.2 + i * 0.07, 0.5))}%`, borderRadius: 8, background: i === 6 ? accent : `${accent}55`, boxShadow: i === 6 ? `0 0 24px ${accent}` : undefined}} />)}
            </div>
            <div style={{...panel, flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
              {[70, 50, 62, 44].map((p) => <div key={p} style={{display: 'flex', alignItems: 'center', gap: 10}}><div style={{width: 22, height: 22, borderRadius: '50%', background: N.lime, flexShrink: 0}} /><Bar w={`${p}%`} /></div>)}
            </div>
          </div>
        </div>
      </div>
    </Glass>
  );
};

// ---------- Pointer ----------
export const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
  <svg width={64} height={92} viewBox="-4 -4 56 86" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.14 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))'}}>
    <polygon points="0,0 0,62 15,48 26,74 38,69 27,44 47,44" fill="#fff" stroke={N.bg} strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

// Mono chip
export const Chip: React.FC<{color: string; size?: number; children?: React.ReactNode}> = ({color, size = 26, children}) => (
  <div style={{display: 'inline-block', background: color, borderRadius: size * 0.4, padding: `${size * 0.18}px ${size * 0.6}px`}}><M size={size} color={N.bg} w={800}>{children}</M></div>
);
