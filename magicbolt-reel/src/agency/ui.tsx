import React from 'react';
import {Img, staticFile} from 'remotion';
import {Abs, TimeCtx, Txt, useT, P, eo, eio, lerp} from '../components/kit';
import {Bolt} from '../components/graphics';
import {ASSETS, BRAND, GlyphName, S7, T} from './config';

export const hard = (n = 10, c: string = T.ink) => `${n}px ${n}px 0 ${c}`;

// ---------- Shot: one scene. Children read time relative to the shot start ----------
// `bg` gives the shot a full-bleed colour instead of the paper. Every shot slowly pushes in.
export const Shot: React.FC<{start: number; dur: number; first?: boolean; last?: boolean; bg?: string; children?: React.ReactNode}> = ({start, dur, first, last, bg, children}) => {
  const t = useT();
  if (t < start || t >= start + dur) return null;
  const kin = first ? 1 : P(t, start, 0.14);
  const kout = last ? 0 : P(t, start + dur - 0.1, 0.1);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: eo(kin) * (1 - kout)}}>
      {bg && <div style={{position: 'absolute', inset: 0, background: bg}}><Dots color="rgba(255,255,255,0.09)" gap={26} r={6} style={{inset: 0}} /></div>}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1, 1.04, (t - start) / dur)})`, transformOrigin: '540px 900px'}}>
        <TimeCtx.Provider value={t - start}>{children}</TimeCtx.Provider>
      </div>
    </div>
  );
};

// Slanted colour panel that sweeps across the frame at a cut (uses global time)
export const Wipe: React.FC<{at: number; color: string}> = ({at, color}) => {
  const t = useT();
  const k = P(t, at - 0.2, 0.44);
  if (k <= 0 || k >= 1) return null;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: lerp(-1700, 1700, eio(k)) - 410, top: -100, width: 1900, height: 2120, background: color, transform: 'skewX(-10deg)',
        borderLeft: `44px solid ${T.ink}`, borderRight: `44px solid ${T.ink}`, boxSizing: 'border-box'}} />
    </div>
  );
};

// Spinning sunburst rays (place behind a hero element)
export const Burst: React.FC<{size: number; color?: string; speed?: number}> = ({size, color = T.yellow, speed = 14}) => {
  const t = useT();
  const fade = 'radial-gradient(closest-side, #000 30%, transparent 100%)';
  return <div style={{width: size, height: size, borderRadius: '50%', background: `repeating-conic-gradient(from ${t * speed}deg, ${color} 0deg 9deg, transparent 9deg 22.5deg)`, WebkitMaskImage: fade, maskImage: fade}} />;
};

// One-shot confetti pop
const CONFETTI = [T.yellow, T.pink, T.blue, T.green, T.orange, T.violet];
export const Confetti: React.FC<{at: number; x: number; y: number; r?: number}> = ({at, x, y, r = 420}) => {
  const t = useT();
  const k = P(t, at, 1.0);
  if (k <= 0 || k >= 1) return null;
  return (
    <>
      {Array.from({length: 20}, (_, i) => {
        const ang = (i * 2 * Math.PI) / 20 + 0.3;
        const d = (120 + r * eo(k)) * (i % 3 === 0 ? 0.7 : 1);
        const sz = 30 * (1 - k * 0.7);
        return (
          <Abs key={i} x={x + d * Math.cos(ang)} y={y + d * Math.sin(ang) * 0.8 + 160 * k * k} transform={`rotate(${(ang + k * 4) * 57}deg)`} opacity={1 - k * k}>
            {i % 2
              ? <svg width={sz * 2} height={sz * 2} viewBox="0 0 100 100"><polygon points="50,0 60,40 100,50 60,60 50,100 40,60 0,50 40,40" fill={CONFETTI[i % 6]} stroke={T.ink} strokeWidth={5} /></svg>
              : <div style={{width: sz, height: sz * 0.6, borderRadius: 6, background: CONFETTI[i % 6], border: `3px solid ${T.ink}`}} />}
          </Abs>
        );
      })}
    </>
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

// ---------- Halftone dot field ----------
export const Dots: React.FC<{color?: string; gap?: number; r?: number; fade?: string; style?: React.CSSProperties}> = ({color = T.ink, gap = 22, r = 5, fade, style}) => (
  <div style={{position: 'absolute', backgroundImage: `radial-gradient(${color} ${r}px, transparent ${r + 0.6}px)`, backgroundSize: `${gap}px ${gap}px`,
    WebkitMaskImage: fade, maskImage: fade, ...style}} />
);

// ---------- Background: grid paper + halftone corners ----------
export const Paper: React.FC = () => {
  const t = useT();
  return (
    <div style={{position: 'absolute', inset: 0, background: T.paper, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundSize: '90px 90px', backgroundPosition: `45px ${(t * 10) % 90}px`,
        backgroundImage: `linear-gradient(${T.grid} 2px, transparent 2px), linear-gradient(90deg, ${T.grid} 2px, transparent 2px)`}} />
      <Dots color={`${T.violet}59`} gap={26} r={6} fade="radial-gradient(circle at 100% 0%, #000, transparent 68%)" style={{right: 0, top: 0, width: 700, height: 700}} />
      <Dots color={`${T.orange}59`} gap={26} r={6} fade="radial-gradient(circle at 0% 100%, #000, transparent 68%)" style={{left: 0, bottom: 0, width: 760, height: 760}} />
    </div>
  );
};

// ---------- Building blocks ----------
export const Box: React.FC<{w?: number | string; h?: number | string; r?: number; bg?: string; bw?: number; sh?: number; shc?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 32, bg = '#fff', bw = 5, sh = 10, shc, style, children}) => (
  <div style={{width: w, height: h, borderRadius: r, background: bg, border: `${bw}px solid ${T.ink}`, boxShadow: sh ? hard(sh, shc) : undefined, boxSizing: 'border-box', ...style}}>{children}</div>
);

// Highlighter-style label
export const Mark: React.FC<{size: number; bg?: string; color?: string; rot?: number; children?: React.ReactNode}> = ({size, bg = T.yellow, color = T.ink, rot = -1.5, children}) => (
  <div style={{display: 'inline-block', background: bg, padding: `${size * 0.06}px ${size * 0.3}px`, borderRadius: size * 0.2, border: `5px solid ${T.ink}`, boxShadow: hard(8), transform: `rotate(${rot}deg)`}}>
    <Txt size={size} color={color}>{children}</Txt>
  </div>
);

// A Mark that wipes in left-to-right like a highlighter stroke
export const Swipe: React.FC<{at: number; x: number; y: number; size: number; bg?: string; color?: string; rot?: number; children?: React.ReactNode}> = ({at, x, y, children, ...mark}) => {
  const t = useT();
  const k = P(t, at, 0.32);
  if (k <= 0) return null;
  const e = eo(k);
  return (
    <Abs x={x} y={y} transform={`scale(${lerp(1.14, 1, e)})`}>
      <div style={{clipPath: `inset(-30px calc(${100 * (1 - e)}% - 30px) -30px -30px)`}}><Mark {...mark}>{children}</Mark></div>
    </Abs>
  );
};

// The ten generic "tools" (scene 2 pile, scene 5 merge)
export const TOOL_GLYPHS: GlyphName[] = ['chat', 'mail', 'chart', 'cal', 'star', 'lock', 'pin', 'doc', 'bell', 'people'];
export const TOOL_COLORS = [T.blue, T.pink, T.orange, T.green, T.violet, T.cyan, T.amber, T.red, T.blue, T.violet];

export const Tick: React.FC<{size?: number; color?: string}> = ({size = 64, color = T.green}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{flexShrink: 0}}>
    <circle cx="32" cy="32" r="29" fill={color} stroke={T.ink} strokeWidth={5} />
    <polyline points="20,33 29,42 45,24" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------- Generic (logo-less) glyphs, 100x100 ----------
const starPts = (cx: number, cy: number, R: number, r: number) =>
  Array.from({length: 10}, (_, i) => {
    const rad = i % 2 ? r : R; const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(' ');

export const Glyph: React.FC<{name: GlyphName; size: number; tint: string}> = ({name, size, tint}) => {
  const w = '#fff';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {name === 'chat' && (<>
        <rect x="14" y="20" width="72" height="50" rx="14" fill={w} />
        <polygon points="32,68 24,86 48,68" fill={w} />
        {[34, 50, 66].map((x) => <circle key={x} cx={x} cy={45} r={5} fill={tint} />)}
      </>)}
      {name === 'mail' && (<>
        <rect x="12" y="24" width="76" height="54" rx="10" fill={w} />
        <polyline points="18,32 50,56 82,32" fill="none" stroke={tint} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </>)}
      {name === 'chart' && (<>
        {[25, 42, 62].map((h, i) => <rect key={i} x={20 + i * 24} y={82 - h} width={14} height={h} rx={4} fill={w} />)}
        <polyline points="14,48 42,28 56,40 82,16" fill="none" stroke={w} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </>)}
      {name === 'cal' && (<>
        <rect x="14" y="22" width="72" height="64" rx="10" fill={w} />
        <rect x="14" y="40" width="72" height="6" fill={tint} />
        <rect x="30" y="12" width="9" height="22" rx="4.5" fill={w} /><rect x="61" y="12" width="9" height="22" rx="4.5" fill={w} />
        {[30, 50, 70].map((x) => <circle key={x} cx={x} cy={64} r={5} fill={tint} />)}
      </>)}
      {name === 'star' && <polygon points={starPts(50, 52, 40, 17)} fill={w} />}
      {name === 'lock' && (<>
        <path d="M32 48V36a18 18 0 0 1 36 0v12" fill="none" stroke={w} strokeWidth={9} strokeLinecap="round" />
        <rect x="22" y="46" width="56" height="42" rx="10" fill={w} />
        <circle cx="50" cy="66" r="7" fill={tint} />
      </>)}
      {name === 'pin' && (<>
        <path d="M50 88 C36 68 22 56 22 40 A28 28 0 0 1 78 40 C78 56 64 68 50 88Z" fill={w} />
        <circle cx="50" cy="40" r="11" fill={tint} />
      </>)}
      {name === 'doc' && (<>
        <path d="M26 12h32l18 18v58H26z" fill={w} />
        {[46, 60, 74].map((y) => <rect key={y} x={36} y={y} width={30} height={6} rx={3} fill={tint} />)}
      </>)}
      {name === 'bell' && (<>
        <path d="M50 14C33 14 27 30 27 46V62L16 75H84L73 62V46C73 30 67 14 50 14Z" fill={w} />
        <circle cx="50" cy="84" r="8" fill={w} />
      </>)}
      {name === 'people' && (<>
        <circle cx="35" cy="36" r="11" fill={w} /><path d="M15 80 A20 20 0 0 1 55 80Z" fill={w} />
        <circle cx="65" cy="36" r="13" fill={w} /><path d="M41 80 A24 24 0 0 1 89 80Z" fill={w} />
      </>)}
    </svg>
  );
};

export const Tile: React.FC<{name: GlyphName; size: number; color: string; bw?: number; sh?: number}> = ({name, size, color, bw = 5, sh = 0}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.26, background: color, border: bw ? `${bw}px solid ${T.ink}` : undefined, boxShadow: sh ? hard(sh) : undefined,
    boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <Glyph name={name} size={size * 0.7} tint={color} />
  </div>
);

// ---------- Brand ----------
export const Logo: React.FC<{size: number}> = ({size}) => {
  const tile = size * 1.4;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.3}}>
      <div style={{width: tile, height: tile, borderRadius: tile * 0.28, background: `linear-gradient(135deg, ${T.violet}, ${T.blue})`, border: `5px solid ${T.ink}`, boxShadow: hard(8),
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Bolt size={tile * 0.74} />
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: size * 0.2}}>
        <span><Txt size={size}>{BRAND.name1}</Txt><Txt size={size} color={T.violet}>{BRAND.name2}</Txt></span>
        <div style={{background: T.ink, borderRadius: size * 0.2, padding: `${size * 0.02}px ${size * 0.2}px`}}><Txt size={size * 0.62} color={T.yellow}>{BRAND.suffix}</Txt></div>
      </div>
    </div>
  );
};

// Dashboard brand mark. k: 0 = MagicBolt AI, 1 = the agency's own brand (flips between)
export const BrandChip: React.FC<{size: number; k?: number}> = ({size, k = 0}) => {
  const ours = k < 0.5;
  const s = Math.max(0.001, ours ? 1 - k * 2 : k * 2 - 1);
  const tile = size * 1.35;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.32, transform: `scaleY(${s})`}}>
      <div style={{width: tile, height: tile, borderRadius: tile * 0.28, background: ours ? `linear-gradient(135deg, ${T.violet}, ${T.blue})` : T.pink,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        {ours ? <Bolt size={tile * 0.74} /> : <Txt size={size * 0.9} color="#fff">{S7.yourBrand[0]}</Txt>}
      </div>
      <Txt size={size}>{ours ? `${BRAND.name1}${BRAND.name2} ${BRAND.suffix}` : S7.yourBrand}</Txt>
    </div>
  );
};

// ---------- Dashboard (drawn stand-in, or ASSETS.dashboard if set) — 900x600 ----------
const NAV: {label: string; g: GlyphName; c: string}[] = [
  {label: 'Social', g: 'chat', c: T.pink},
  {label: 'GBP', g: 'pin', c: T.blue},
  {label: 'Reviews', g: 'star', c: T.amber},
  {label: 'Reports', g: 'chart', c: T.green},
];
const Bar: React.FC<{w: number | string; h?: number; c?: string}> = ({w, h = 12, c = T.mute}) => <div style={{width: w, height: h, borderRadius: h, background: c, flexShrink: 0}} />;
const panel: React.CSSProperties = {borderRadius: 18, border: `3px solid ${T.ink}`, boxSizing: 'border-box'};

export const Dash: React.FC<{k?: number}> = ({k = 0}) => (
  <div style={{position: 'relative', width: 900, height: 600}}>
    <Dots color={T.violet} gap={18} r={5} style={{left: 26, top: 26, width: 900, height: 600, borderRadius: 36}} />
    <Box w={900} h={600} r={36} sh={0} style={{position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
      {ASSETS.dashboard ? <Img src={staticFile(ASSETS.dashboard)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : (<>
        <div style={{height: 84, flexShrink: 0, borderBottom: `4px solid ${T.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px'}}>
          <BrandChip size={30} k={k} />
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Bar w={190} h={34} /><div style={{width: 44, height: 44, borderRadius: '50%', background: T.violet}} /></div>
        </div>
        <div style={{display: 'flex', flex: 1, minHeight: 0}}>
          <div style={{width: 214, flexShrink: 0, borderRight: `4px solid ${T.ink}`, padding: '20px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10, background: T.paper}}>
            {NAV.map((n, i) => (
              <div key={n.label} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 16, background: i === 0 ? T.yellow : 'transparent', border: `3px solid ${i === 0 ? T.ink : 'transparent'}`}}>
                <Tile name={n.g} size={40} color={n.c} bw={0} /><Txt size={24}>{n.label}</Txt>
              </div>
            ))}
          </div>
          <div style={{flex: 1, minWidth: 0, padding: 22, display: 'flex', flexDirection: 'column', gap: 18}}>
            <div style={{display: 'flex', gap: 16}}>
              {[T.violet, T.pink, T.green].map((c, i) => (
                <div key={c} style={{...panel, flex: 1, height: 104, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                  <Bar w="60%" /><Bar w={`${[80, 55, 70][i]}%`} h={26} c={c} />
                </div>
              ))}
            </div>
            <div style={{display: 'flex', gap: 16, flex: 1, minHeight: 0}}>
              <div style={{...panel, flex: 1.5, padding: 18, display: 'flex', alignItems: 'flex-end', gap: 12}}>
                {[0.35, 0.5, 0.42, 0.66, 0.6, 0.82, 1].map((h, i) => <div key={i} style={{flex: 1, height: `${h * 100}%`, borderRadius: 8, background: i === 6 ? T.violet : `${T.violet}66`}} />)}
              </div>
              <div style={{...panel, flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                {[70, 50, 62, 44].map((p) => <div key={p} style={{display: 'flex', alignItems: 'center', gap: 10}}><Tick size={30} /><Bar w={`${p}%`} /></div>)}
              </div>
            </div>
          </div>
        </div>
      </>)}
    </Box>
  </div>
);

// ---------- Scene 1 art: agency owner at a cluttered desk (or ASSETS.ownerPhoto) — 760x560 ----------
export const Owner: React.FC = () => {
  const t = useT();
  if (ASSETS.ownerPhoto) {
    return (
      <div style={{position: 'relative', width: 760, height: 560}}>
        <Dots color={T.violet} gap={18} r={5} style={{left: 26, top: 26, width: 760, height: 560, borderRadius: 36}} />
        <Box w={760} h={560} r={36} sh={0} style={{position: 'relative', overflow: 'hidden'}}>
          <Img src={staticFile(ASSETS.ownerPhoto)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.25)'}} />
          <Dots color="#fff" gap={8} r={1.6} style={{inset: 0, mixBlendMode: 'soft-light'}} />
        </Box>
      </div>
    );
  }
  const ink = T.ink;
  const note = (x: number, y: number, rot: number, c: string, ph: number) => (
    <g transform={`translate(${x} ${y + 8 * Math.sin(t * 2.2 + ph)}) rotate(${rot})`}>
      <rect x={-42} y={-42} width={84} height={84} rx={8} fill={c} stroke={ink} strokeWidth={5} />
      <rect x={-24} y={-18} width={48} height={7} rx={3.5} fill={ink} /><rect x={-24} y={0} width={34} height={7} rx={3.5} fill={ink} />
    </g>
  );
  return (
    <svg width={760} height={560} viewBox="0 0 760 560" style={{overflow: 'visible'}}>
      <defs>
        <pattern id="ownerHt" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="12" height="12" fill={ink} /><circle cx="6" cy="6" r="2.6" fill="#5A60A0" />
        </pattern>
        <pattern id="ownerBg" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="5" fill={T.violet} /></pattern>
        <radialGradient id="ownerFade"><stop offset="0.45" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
        <mask id="ownerMask"><circle cx="380" cy="270" r="290" fill="url(#ownerFade)" /></mask>
        <filter id="cutout" x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="11" result="fat" />
          <feFlood floodColor="#fff" /><feComposite in2="fat" operator="in" result="edge" />
          <feMerge><feMergeNode in="edge" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="380" cy="270" r="290" fill="url(#ownerBg)" mask="url(#ownerMask)" opacity={0.55} />
      <circle cx="380" cy="270" r="215" fill={T.yellow} stroke={ink} strokeWidth={6} />
      <g filter="url(#cutout)">
        {/* paper stack */}
        {[[70, 432, -3], [82, 406, 2], [66, 380, -2], [78, 354, 3]].map(([x, y, r], i) => <rect key={i} x={x} y={y} width={176} height={26} rx={5} fill="#fff" stroke={ink} strokeWidth={5} transform={`rotate(${r} ${x + 88} ${y + 13})`} />)}
        {/* person: arms up, hands on head */}
        <path d="M300 340 L258 246 L328 170" fill="none" stroke={ink} strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M460 340 L502 246 L432 170" fill="none" stroke={ink} strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M268 458 C268 350 310 296 380 296 C450 296 492 350 492 458 Z" fill="url(#ownerHt)" />
        <circle cx="380" cy="198" r="68" fill="#fff" stroke={ink} strokeWidth={6} />
        <path d="M312 190 C306 124 348 108 384 110 C430 112 456 138 448 192 C432 164 404 154 380 156 C354 158 328 168 312 190Z" fill={ink} />
        <circle cx="358" cy="206" r="6" fill={ink} /><circle cx="402" cy="206" r="6" fill={ink} />
        <path d="M362 238 Q380 224 398 238" fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" />
        <circle cx="326" cy="168" r="25" fill="#fff" stroke={ink} strokeWidth={6} /><circle cx="434" cy="168" r="25" fill="#fff" stroke={ink} strokeWidth={6} />
        {/* laptop */}
        <rect x="286" y="344" width="188" height="116" rx="14" fill={ink} />
        <rect x="298" y="356" width="164" height="92" rx="6" fill="#2B3068" /><circle cx="380" cy="402" r="13" fill={T.yellow} />
        <rect x="256" y="454" width="248" height="16" rx="8" fill={ink} />
        {/* mug + files */}
        <rect x="548" y="398" width="60" height="62" rx="9" fill="#fff" stroke={ink} strokeWidth={5} />
        <path d="M608 414q28 0 28 15t-28 15" fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" />
        <rect x="650" y="372" width="84" height="88" rx="6" fill={T.pink} stroke={ink} strokeWidth={5} /><rect x="642" y="342" width="78" height="32" rx="5" fill="#fff" stroke={ink} strokeWidth={5} />
        {/* desk */}
        <rect x="24" y="460" width="712" height="30" rx="12" fill={ink} />
      </g>
      {[0, 1].map((i) => <path key={i} d={`M${568 + i * 20} ${384 - 6 * Math.sin(t * 3 + i)} q-10 -16 0 -30 q10 -14 0 -28`} fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" opacity={0.55} />)}
      {note(96, 190, -12, T.yellow, 0)}{note(668, 150, 10, '#fff', 1.4)}{note(150, 60, 8, T.pink, 2.6)}{note(620, 270, -7, T.cyan, 3.6)}
      <g transform={`translate(560 70) scale(${1 + 0.08 * Math.sin(t * 6)})`}>
        <circle r="34" fill={T.red} stroke={ink} strokeWidth={5} /><rect x="-5" y="-20" width="10" height="24" rx="5" fill="#fff" /><circle cy="15" r="6" fill="#fff" />
      </g>
    </svg>
  );
};
