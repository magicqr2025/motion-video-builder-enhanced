// Shared pieces for the Way CRM video: framed screenshots, lifted UI callouts, glossy icon chips,
// headlines, CTA button and the three concept backgrounds.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {fontFamily, cl, P, eo, eb, lerp} from '../../components/kit';
import {useSec} from '../../dns/ui';
import {Chip, lite, dark} from '../../glow/parts';
import {BLUE, DEEP, GOLD, NAVY, ORANGE, Rect, SHOT, ShotName, SLATE} from './config';

export {cl, P, eo, eb, lerp, useSec, lite, dark};

// font size that keeps `text` inside maxW (Poppins Bold ~0.56em per char)
export const fit = (text: string, size: number, maxW: number) => Math.min(size, maxW / Math.max(1, text.length * 0.56));

export const Tx: React.FC<{size: number; color?: string; g?: string[]; w?: 400 | 700; wrap?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({size, color = NAVY, g, w = 700, wrap, style, children}) => (
  <span style={{fontFamily, fontSize: size, fontWeight: w, lineHeight: 1.12, letterSpacing: -size * 0.015, color, display: 'inline-block', whiteSpace: wrap ? 'normal' : 'nowrap',
    ...(g ? {backgroundImage: `linear-gradient(90deg, ${g.join(', ')})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {}), ...style}}>{children}</span>
);

// pop-in wrapper (fade, rise, overshoot) driven by moment-local seconds
export const In: React.FC<{at: number; d?: number; dy?: number; dx?: number; s0?: number; rot?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({at, d = 0.5, dy = 40, dx = 0, s0 = 0.8, rot = 0, style, children}) => {
  const t = useSec();
  const k = P(t, at, d);
  return (
    <div style={{opacity: eo(Math.min(1, k * 1.8)), transform: `translate(${dx * (1 - eo(k))}px, ${dy * (1 - eo(k))}px) scale(${lerp(s0, 1, eb(k))}) rotate(${rot * (1 - eo(k))}deg)`, ...style}}>{children}</div>
  );
};

// words rise one by one; `hi` = word indexes painted with the gold gradient
export const Words: React.FC<{text: string; at: number; size: number; color?: string; hi?: number[]; hiG?: string[]; gap?: number; step?: number; maxW?: number}> = ({text, at, size, color = NAVY, hi = [], hiG = [ORANGE, GOLD], step = 0.07, maxW}) => {
  const t = useSec();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: size * 0.26, rowGap: size * 0.02, maxWidth: maxW}}>
      {text.split(' ').map((w, i) => {
        const k = P(t, at + i * step, 0.45);
        return (
          <span key={i} style={{display: 'inline-block', opacity: eo(Math.min(1, k * 1.8)), transform: `translateY(${(1 - eo(k)) * size * 0.6}px)`, filter: `blur(${(1 - eo(k)) * 6}px)`}}>
            <Tx size={size} color={color} g={hi.includes(i) ? hiG : undefined}>{w}</Tx>
          </span>
        );
      })}
    </div>
  );
};

// ---------- screenshots ----------
export const shotSrc = (n: ShotName) => staticFile(SHOT[n]);

// Full screenshot in a glossy device-style frame. w = image width in px.
export const Screen: React.FC<{name: ShotName; w: number; dark?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({name, w, dark: dk, style, children}) => {
  const t = useSec();
  const sweep = ((t * 0.35) % 1.6) - 0.3;
  return (
    <div style={{padding: 12, borderRadius: 30, position: 'relative',
      background: dk ? 'linear-gradient(160deg, #3A5BC0, #0B1540)' : 'linear-gradient(160deg, #FFFFFF, #DCE8FB)',
      boxShadow: dk ? '0 0 0 1px rgba(120,170,255,0.5), 0 40px 90px rgba(0,0,0,0.55), 0 0 80px rgba(21,130,213,0.35)' : '0 2px 0 #fff inset, 0 40px 80px rgba(14,27,77,0.28), 0 10px 22px rgba(14,27,77,0.12)', ...style}}>
      <div style={{width: w, height: w * 0.625, borderRadius: 20, overflow: 'hidden', position: 'relative'}}>
        <Img src={shotSrc(name)} style={{width: w, height: w * 0.625, display: 'block'}} />
        <div style={{position: 'absolute', top: -100, bottom: -100, left: `${sweep * 100}%`, width: '18%', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))', transform: 'skewX(-18deg)'}} />
        {children}
      </div>
    </div>
  );
};

// A rectangle of a screenshot, at scale s (px per D unit)
export const Crop: React.FC<{name: ShotName; r: Rect; s: number; radius?: number}> = ({name, r, s, radius = 16}) => (
  <div style={{width: r[2] * s, height: r[3] * s, overflow: 'hidden', borderRadius: radius, position: 'relative'}}>
    <Img src={shotSrc(name)} style={{position: 'absolute', left: -r[0] * s, top: -r[1] * s, width: 2000 * s, height: 1250 * s, maxWidth: 'none'}} />
  </div>
);

// Crop lifted off the screen: white glossy card, gold ring, deep shadow
export const Lift: React.FC<{name: ShotName; r: Rect; s: number; ring?: string; glow?: boolean}> = ({name, r, s, ring = GOLD, glow}) => (
  <div style={{padding: 8, borderRadius: 26, background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)',
    boxShadow: `0 0 0 5px ${ring}, 0 30px 60px rgba(14,27,77,0.35), 0 8px 16px rgba(14,27,77,0.18)${glow ? `, 0 0 70px ${ring}99` : ''}`}}>
    <Crop name={name} r={r} s={s} radius={18} />
  </div>
);

// ---------- glyphs & glossy icons ----------
export type Gl = 'chat' | 'wa' | 'bot' | 'board' | 'team' | 'chart' | 'send' | 'bolt' | 'cal' | 'bell' | 'link' | 'rupee' | 'ticket' | 'tag' | 'lock' | 'spark';
export const Glyph: React.FC<{name: Gl; size: number; color?: string}> = ({name, size, color = '#fff'}) => {
  const s = {fill: 'none', stroke: color, strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {name === 'chat' && <path d="M22 22h56a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H46L28 86V72h-6a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z M32 42h36 M32 56h22" {...s} />}
      {name === 'wa' && <><path d="M50 14a36 36 0 1 1-19 66l-17 5 5-16A36 36 0 0 1 50 14z" {...s} /><path d="M38 36c0 14 12 28 26 28l5-7-8-5-4 4c-5-2-9-6-11-11l4-4-5-8z" fill={color} /></>}
      {name === 'bot' && <><rect x="20" y="32" width="60" height="46" rx="14" {...s} /><path d="M50 32V18 M10 52v12 M90 52v12" {...s} /><circle cx="50" cy="15" r="5" fill={color} /><circle cx="38" cy="54" r="6" fill={color} /><circle cx="62" cy="54" r="6" fill={color} /></>}
      {name === 'board' && <><rect x="14" y="18" width="20" height="64" rx="6" {...s} /><rect x="40" y="18" width="20" height="44" rx="6" {...s} /><rect x="66" y="18" width="20" height="54" rx="6" {...s} /></>}
      {name === 'team' && <><circle cx="36" cy="36" r="12" {...s} /><circle cx="68" cy="40" r="9" {...s} /><path d="M14 80c2-14 12-22 22-22s20 8 22 22 M58 78c2-10 6-16 12-16s14 6 16 16" {...s} /></>}
      {name === 'chart' && <path d="M16 84h68 M26 72V52 M44 72V36 M62 72V46 M80 72V22" {...s} strokeWidth={10} />}
      {name === 'send' && <path d="M12 48L88 14L66 88L48 60Z M48 60L88 14" {...s} />}
      {name === 'bolt' && <path d="M56 8L22 56h24l-6 36 36-50H52z" fill={color} />}
      {name === 'bell' && <path d="M50 14c-15 0-26 11-26 26v16l-8 14h68l-8-14V40c0-15-11-26-26-26z M40 80a10 10 0 0 0 20 0" {...s} />}
      {name === 'link' && <path d="M44 58l14-14 M40 42l8-8a14 14 0 0 1 20 20l-8 8 M60 60l-8 8a14 14 0 0 1-20-20l8-8" {...s} />}
      {name === 'rupee' && <path d="M28 18h46 M28 36h46 M28 18h14a18 18 0 0 1 0 36H30l34 30" {...s} />}
      {name === 'ticket' && <><path d="M14 30h72v12a8 8 0 0 0 0 16v12H14V58a8 8 0 0 0 0-16z" {...s} /><path d="M58 32v36" {...s} strokeDasharray="6 8" /></>}
      {name === 'tag' && <><path d="M14 18h34l38 38-30 30-42-42z" {...s} /><circle cx="34" cy="38" r="6" fill={color} /></>}
      {name === 'lock' && <><rect x="20" y="44" width="60" height="42" rx="10" {...s} /><path d="M32 44V32a18 18 0 0 1 36 0v12 M50 60v10" {...s} /></>}
      {name === 'spark' && <path d="M50 8C54 36 64 46 92 50C64 54 54 64 50 92C46 64 36 54 8 50C36 46 46 36 50 8Z" fill={color} />}
      {name === 'cal' && <><rect x="16" y="22" width="68" height="62" rx="10" {...s} /><path d="M16 40h68 M34 14v14 M66 14v14" {...s} /></>}
    </svg>
  );
};

export const IconChip: React.FC<{name: Gl; size: number; c: string; round?: boolean}> = ({name, size, c, round}) => (
  <Chip w={size} h={size} r={round ? size / 2 : size * 0.3} c={c} depth={size * 0.08}><Glyph name={name} size={size * 0.56} /></Chip>
);

// Feature label: glossy icon + title + optional sub line
export const Feature: React.FC<{icon: Gl; c: string; title: string; sub?: string; at?: number; light?: boolean; maxW?: number; size?: number}> = ({icon, c, title, sub, at = 0.1, light, maxW = 820, size = 72}) => {
  const t = useSec();
  const kl = eo(P(t, at + 0.35, 0.6));
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
      <In at={at} s0={0.3} rot={-25} dy={0}><IconChip name={icon} size={size * 1.55} c={c} /></In>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <Words text={title} at={at + 0.12} size={fit(title, size, maxW)} color={light ? '#fff' : NAVY} />
        <div style={{width: 260 * kl, height: 7, borderRadius: 4, background: `linear-gradient(90deg, ${GOLD}, ${ORANGE})`}} />
        {sub && <In at={at + 0.5} dy={16} s0={1}><Tx size={fit(sub, 34, maxW)} color={light ? '#BFD6FF' : SLATE} w={400}>{sub}</Tx></In>}
      </div>
    </div>
  );
};

// Glossy gold CTA button with a light sweep
export const CtaButton: React.FC<{text: string; size?: number}> = ({text, size = 52}) => {
  const t = useSec();
  const sw = ((t * 0.6) % 1.4) - 0.2;
  const fs = fit(text, size, 900);
  return (
    <div style={{position: 'relative', overflow: 'hidden', padding: `${fs * 0.5}px ${fs * 1.1}px`, borderRadius: 999,
      background: `linear-gradient(180deg, #FFE36B, ${GOLD} 45%, ${ORANGE})`,
      boxShadow: `0 10px 0 ${dark(ORANGE, 0.3)}, 0 30px 50px rgba(247,148,29,0.45), inset 0 4px 6px rgba(255,255,255,0.7)`}}>
      <div style={{position: 'absolute', left: '8%', right: '8%', top: 4, height: '42%', borderRadius: 999, background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0))'}} />
      <div style={{position: 'absolute', top: -40, bottom: -40, left: `${sw * 100}%`, width: '14%', background: 'rgba(255,255,255,0.55)', transform: 'skewX(-20deg)'}} />
      <div style={{position: 'relative'}}><Tx size={fs} color={NAVY}>{text}</Tx></div>
    </div>
  );
};

export const LogoImg: React.FC<{w: number}> = ({w}) => <Img src={staticFile('magicbolt-logo.png')} style={{width: w, height: (w * 133) / 706, display: 'block'}} />;

// Four-point sparkle
export const Sparkle: React.FC<{x: number; y: number; size: number; c?: string; ph?: number}> = ({x, y, size, c = '#fff', ph = 0}) => {
  const t = useSec();
  const k = 0.55 + 0.45 * Math.sin(t * 3 + ph);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${k}) rotate(${t * 30 + ph * 20}deg)`, filter: `drop-shadow(0 0 ${size * 0.15}px ${c})`, overflow: 'visible'}}>
      <path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill={c} />
    </svg>
  );
};

// WhatsApp-style "new message" badge chip
export const WaChip: React.FC<{size: number; n?: string}> = ({size, n}) => (
  <div style={{position: 'relative'}}>
    <IconChip name="wa" size={size} c="#22C55E" round />
    {n && <div style={{position: 'absolute', right: -size * 0.08, top: -size * 0.08, minWidth: size * 0.36, height: size * 0.36, borderRadius: 99, background: `linear-gradient(180deg, #FF7A59, #E5352B)`, boxShadow: '0 4px 0 #A51F17, 0 8px 14px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px'}}><Tx size={size * 0.2} color="#fff">{n}</Tx></div>}
  </div>
);

// ---------- backgrounds (global time, so they keep moving across moments) ----------
const BLOBS: [number, number, number, string][] = [[300, 260, 520, BLUE], [1600, 200, 460, GOLD], [1500, 900, 600, DEEP], [380, 900, 420, ORANGE]];

export const SkyBG: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #F8FBFF, #E3EEFF)', overflow: 'hidden'}}>
      {BLOBS.map(([x, y, r, c], i) => (
        <div key={i} style={{position: 'absolute', left: x - r + 60 * Math.sin(t * 0.4 + i), top: y - r + 40 * Math.cos(t * 0.35 + i * 2), width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, ${c}33, ${c}00)`}} />
      ))}
      <div style={{position: 'absolute', inset: -60, backgroundImage: 'radial-gradient(rgba(19,84,188,0.13) 2px, transparent 2.5px)', backgroundSize: '44px 44px', backgroundPosition: `${(t * 10) % 44}px ${(t * 6) % 44}px`, WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, transparent 30%, #000 85%)', maskImage: 'radial-gradient(ellipse at 50% 40%, transparent 30%, #000 85%)'}} />
    </AbsoluteFill>
  );
};

export const NavyBG: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 68% 38%, #1D3F9C, #0E1B4D 52%, #060C28)', overflow: 'hidden'}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: -400 + ((t * 60 + i * 700) % 2700), top: -300, width: 220, height: 1700, transform: 'rotate(24deg)', background: `linear-gradient(90deg, rgba(21,130,213,0), rgba(${i === 1 ? '253,198,11' : '90,170,255'},0.10), rgba(21,130,213,0))`}} />
      ))}
      {Array.from({length: 26}, (_, i) => {
        const x = (i * 337) % 1920, sp = 18 + (i % 5) * 7;
        const y = 1100 - ((t * sp + i * 97) % 1200);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, borderRadius: '50%', background: i % 4 ? '#7FB8FF' : GOLD, opacity: 0.35, boxShadow: `0 0 10px ${i % 4 ? '#7FB8FF' : GOLD}`}} />;
      })}
      <div style={{position: 'absolute', left: -200, right: -200, bottom: -40, height: 380, backgroundImage: 'linear-gradient(rgba(90,150,255,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(90,150,255,0.16) 2px, transparent 2px)', backgroundSize: '90px 90px', backgroundPosition: `0 ${(t * 30) % 90}px`, transform: 'perspective(600px) rotateX(62deg)', transformOrigin: '50% 100%', WebkitMaskImage: 'linear-gradient(180deg, transparent, #000)', maskImage: 'linear-gradient(180deg, transparent, #000)'}} />
    </AbsoluteFill>
  );
};

export const BlueBG: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{background: `linear-gradient(135deg, #1A8FE0, ${DEEP} 55%, ${NAVY})`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: -200, backgroundImage: 'repeating-linear-gradient(-35deg, rgba(255,255,255,0.05) 0 60px, transparent 60px 140px)', transform: `translateX(${(t * 40) % 170}px)`}} />
      <div style={{position: 'absolute', left: 1300 + 60 * Math.sin(t * 0.5), top: -300, width: 1000, height: 1000, borderRadius: '50%', background: `radial-gradient(closest-side, ${GOLD}40, ${GOLD}00)`}} />
      <div style={{position: 'absolute', left: -400, top: 500 + 40 * Math.cos(t * 0.4), width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(120,200,255,0.35), rgba(120,200,255,0))'}} />
    </AbsoluteFill>
  );
};

// White bento tile
export const Tile: React.FC<{w: number; h: number; r?: number; pad?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 34, pad = 0, style, children}) => (
  <div style={{width: w, height: h, borderRadius: r, padding: pad, boxSizing: 'border-box', overflow: 'hidden', position: 'relative', background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)',
    boxShadow: '0 12px 0 rgba(8,30,90,0.35), 0 34px 60px rgba(4,14,50,0.45), inset 0 3px 0 #fff', ...style}}>{children}</div>
);
