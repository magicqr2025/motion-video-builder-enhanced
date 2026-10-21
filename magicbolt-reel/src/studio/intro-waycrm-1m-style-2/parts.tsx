// Shared pieces for the MagicBolt AI agency intro: framed screenshots, browser frame, lifted UI callouts,
// glossy icon / channel chips, headlines, CTA button and the backgrounds.
// Built on the Way CRM "Glass Showroom" kit (src/studio/untitled-video/parts.tsx).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {fontFamily, cl, P, eo, eb, lerp} from '../../components/kit';
import {useSec} from '../../dns/ui';
import {Chip, lite, dark} from '../../glow/parts';
import {BLUE, DEEP, GOLD, NAVY, ORANGE, Rect, SHOT, SHOT_H, SHOT_W, ShotName, SLATE} from './config';

export {cl, P, eo, eb, lerp, useSec, lite, dark};

// font size that keeps `text` inside maxW (Poppins Bold ~0.56em per char)
export const fit = (text: string, size: number, maxW: number) => Math.min(size, maxW / Math.max(1, text.length * 0.56));
export const bob = (t: number, i: number, a = 8) => a * Math.sin(t * 1.6 + i * 1.3);

export const Abs: React.FC<{x: number; y: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>
);

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
// `times` (optional) = start of each word, e.g. on its spoken word; words past the list follow the last one
export const Words: React.FC<{text: string; at: number; size: number; color?: string; hi?: number[]; hiG?: string[]; step?: number; maxW?: number; center?: boolean; times?: number[]}> = ({text, at, size, color = NAVY, hi = [], hiG = [ORANGE, GOLD], step = 0.07, maxW, center, times}) => {
  const t = useSec();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: size * 0.26, rowGap: size * 0.02, maxWidth: maxW, justifyContent: center ? 'center' : undefined}}>
      {text.split(' ').map((w, i) => {
        const start = times?.length ? (times[i] ?? times[times.length - 1] + (i - times.length + 1) * step) : at + i * step;
        const k = P(t, start, 0.45);
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
const AR = SHOT_H / SHOT_W;

// Full screenshot in a glossy frame. w = image width in px.
export const Screen: React.FC<{name: ShotName; w: number; filter?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({name, w, filter, style, children}) => {
  const t = useSec();
  const sweep = ((t * 0.35) % 1.6) - 0.3;
  return (
    <div style={{padding: 12, borderRadius: 30, position: 'relative', background: 'linear-gradient(160deg, #FFFFFF, #DCE8FB)',
      boxShadow: '0 2px 0 #fff inset, 0 40px 80px rgba(14,27,77,0.28), 0 10px 22px rgba(14,27,77,0.12)', ...style}}>
      <div style={{width: w, height: w * AR, borderRadius: 20, overflow: 'hidden', position: 'relative'}}>
        <Img src={shotSrc(name)} style={{width: w, height: w * AR, display: 'block', filter}} />
        <div style={{position: 'absolute', top: -100, bottom: -100, left: `${sweep * 100}%`, width: '18%', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))', transform: 'skewX(-18deg)'}} />
        {children}
      </div>
    </div>
  );
};

// Screenshot inside a glossy browser window with tabs and a URL bar (white-label domain)
export const Browser: React.FC<{name: ShotName; w: number; url: string; tab: string; filter?: string; urlK?: number; children?: React.ReactNode}> = ({name, w, url, tab, filter, urlK = 1, children}) => {
  const t = useSec();
  const sweep = ((t * 0.35) % 1.6) - 0.3;
  const bar = w * 0.052;
  const shown = url.slice(0, Math.round(url.length * cl(urlK)));
  return (
    <div style={{borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(180deg, #FFFFFF, #E6EEFC)', boxShadow: '0 2px 0 #fff inset, 0 44px 90px rgba(14,27,77,0.3), 0 10px 22px rgba(14,27,77,0.14), 0 0 0 2px rgba(255,255,255,0.9)'}}>
      <div style={{height: bar, display: 'flex', alignItems: 'center', gap: bar * 0.3, padding: `0 ${bar * 0.45}px`}}>
        {['#FF6B5E', '#FDC60B', '#2ECC71'].map((c) => <div key={c} style={{width: bar * 0.26, height: bar * 0.26, borderRadius: '50%', background: c, boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.2)'}} />)}
        <div style={{marginLeft: bar * 0.3, height: bar * 0.68, padding: `0 ${bar * 0.4}px`, borderRadius: `${bar * 0.2}px ${bar * 0.2}px 0 0`, background: '#fff', display: 'flex', alignItems: 'center', gap: bar * 0.18, alignSelf: 'flex-end', boxShadow: '0 -2px 8px rgba(14,27,77,0.08)'}}>
          <div style={{width: bar * 0.32, height: bar * 0.32, borderRadius: bar * 0.08, background: `linear-gradient(150deg, #8B7CF6, #5B4FE0)`}} />
          <Tx size={bar * 0.3} color={NAVY}>{tab}</Tx>
        </div>
        <div style={{flex: 1, height: bar * 0.6, marginLeft: bar * 0.3, borderRadius: 99, background: '#fff', display: 'flex', alignItems: 'center', gap: bar * 0.18, padding: `0 ${bar * 0.35}px`, boxShadow: 'inset 0 1px 3px rgba(14,27,77,0.12)'}}>
          <Glyph name="lock" size={bar * 0.34} color="#22A45D" />
          <Tx size={bar * 0.3} color={NAVY} w={400}>{shown}<span style={{opacity: urlK < 1 && Math.sin(t * 12) > 0 ? 1 : 0}}>|</span></Tx>
        </div>
      </div>
      <div style={{width: w, height: w * AR, overflow: 'hidden', position: 'relative'}}>
        <Img src={shotSrc(name)} style={{width: w, height: w * AR, display: 'block', filter}} />
        <div style={{position: 'absolute', top: -100, bottom: -100, left: `${sweep * 100}%`, width: '18%', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))', transform: 'skewX(-18deg)'}} />
        {children}
      </div>
    </div>
  );
};

// A rectangle of a screenshot, at scale s (px per screenshot px)
export const Crop: React.FC<{name: ShotName; r: Rect; s: number; radius?: number; filter?: string}> = ({name, r, s, radius = 16, filter}) => (
  <div style={{width: r[2] * s, height: r[3] * s, overflow: 'hidden', borderRadius: radius, position: 'relative'}}>
    <Img src={shotSrc(name)} style={{position: 'absolute', left: -r[0] * s, top: -r[1] * s, width: SHOT_W * s, height: SHOT_H * s, maxWidth: 'none', filter}} />
  </div>
);

// Crop lifted off the screen: white glossy card, gold ring, deep shadow
export const Lift: React.FC<{name: ShotName; r: Rect; s: number; ring?: string; glow?: boolean; filter?: string}> = ({name, r, s, ring = GOLD, glow, filter}) => (
  <div style={{padding: 8, borderRadius: 26, background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)',
    boxShadow: `0 0 0 5px ${ring}, 0 30px 60px rgba(14,27,77,0.35), 0 8px 16px rgba(14,27,77,0.18)${glow ? `, 0 0 70px ${ring}99` : ''}`}}>
    <Crop name={name} r={r} s={s} radius={18} filter={filter} />
  </div>
);

// ---------- glyphs & glossy icons ----------
export type Gl = 'chat' | 'board' | 'team' | 'chart' | 'send' | 'bolt' | 'cal' | 'bell' | 'rupee' | 'lock' | 'spark' | 'globe' | 'star' | 'qr' | 'pin' | 'brush' | 'doc';
export const Glyph: React.FC<{name: Gl; size: number; color?: string}> = ({name, size, color = '#fff'}) => {
  const s = {fill: 'none', stroke: color, strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {name === 'chat' && <path d="M22 22h56a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H46L28 86V72h-6a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z M32 42h36 M32 56h22" {...s} />}
      {name === 'board' && <><rect x="14" y="18" width="20" height="64" rx="6" {...s} /><rect x="40" y="18" width="20" height="44" rx="6" {...s} /><rect x="66" y="18" width="20" height="54" rx="6" {...s} /></>}
      {name === 'team' && <><circle cx="36" cy="36" r="12" {...s} /><circle cx="68" cy="40" r="9" {...s} /><path d="M14 80c2-14 12-22 22-22s20 8 22 22 M58 78c2-10 6-16 12-16s14 6 16 16" {...s} /></>}
      {name === 'chart' && <path d="M16 84h68 M26 72V52 M44 72V36 M62 72V46 M80 72V22" {...s} strokeWidth={10} />}
      {name === 'send' && <path d="M12 48L88 14L66 88L48 60Z M48 60L88 14" {...s} />}
      {name === 'bolt' && <path d="M56 8L22 56h24l-6 36 36-50H52z" fill={color} />}
      {name === 'bell' && <path d="M50 14c-15 0-26 11-26 26v16l-8 14h68l-8-14V40c0-15-11-26-26-26z M40 80a10 10 0 0 0 20 0" {...s} />}
      {name === 'rupee' && <path d="M28 18h46 M28 36h46 M28 18h14a18 18 0 0 1 0 36H30l34 30" {...s} />}
      {name === 'lock' && <><rect x="20" y="44" width="60" height="42" rx="10" {...s} /><path d="M32 44V32a18 18 0 0 1 36 0v12" {...s} /></>}
      {name === 'spark' && <path d="M50 8C54 36 64 46 92 50C64 54 54 64 50 92C46 64 36 54 8 50C36 46 46 36 50 8Z" fill={color} />}
      {name === 'cal' && <><rect x="16" y="22" width="68" height="62" rx="10" {...s} /><path d="M16 40h68 M34 14v14 M66 14v14 M32 56h8 M48 56h8 M64 56h4 M32 70h8 M48 70h8" {...s} /></>}
      {name === 'globe' && <><circle cx="50" cy="50" r="36" {...s} /><path d="M14 50h72 M50 14c-12 12-12 60 0 72 M50 14c12 12 12 60 0 72" {...s} /></>}
      {name === 'star' && <path d="M50 10l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z" fill={color} />}
      {name === 'qr' && <><rect x="14" y="14" width="28" height="28" rx="5" {...s} /><rect x="58" y="14" width="28" height="28" rx="5" {...s} /><rect x="14" y="58" width="28" height="28" rx="5" {...s} /><path d="M60 60h8v8h-8z M76 60h10 M60 78h10 M80 76v10" {...s} /></>}
      {name === 'pin' && <><path d="M50 88S22 60 22 40a28 28 0 0 1 56 0c0 20-28 48-28 48z" {...s} /><circle cx="50" cy="40" r="10" {...s} /></>}
      {name === 'brush' && <><path d="M80 14L44 52l8 8 38-36z" {...s} /><path d="M40 56c-12 0-20 8-20 18 0 6-4 10-8 12 18 4 36-2 36-20z" {...s} /></>}
      {name === 'doc' && <><path d="M26 12h34l18 18v58H26z M60 12v18h18" {...s} /><path d="M38 52h28 M38 66h28" {...s} /></>}
    </svg>
  );
};

export const IconChip: React.FC<{name: Gl; size: number; c: string; round?: boolean}> = ({name, size, c, round}) => (
  <Chip w={size} h={size} r={round ? size / 2 : size * 0.3} c={c} depth={size * 0.08}><Glyph name={name} size={size * 0.56} /></Chip>
);

// Glossy channel chip with its letter mark (as the app shows them): G, f, IG, WA, ...
export const CHANNEL: Record<string, {c: string; g?: string; mark: string}> = {
  google: {c: '#4285F4', mark: 'G'},
  facebook: {c: '#1877F2', mark: 'f'},
  instagram: {c: '#E1306C', g: 'linear-gradient(150deg, #FFC15A, #F05A3B 40%, #D62F8C 70%, #7B3FE4)', mark: 'IG'},
  whatsapp: {c: '#25D366', mark: 'WA'},
  wordpress: {c: '#21759B', mark: 'W'},
  pinterest: {c: '#E60023', mark: 'P'},
  sheets: {c: '#0F9D58', mark: '▦'},
  invoice: {c: ORANGE, mark: '₹'},
};
export const ChannelChip: React.FC<{id: keyof typeof CHANNEL | string; size: number}> = ({id, size}) => {
  const ch = CHANNEL[id] ?? CHANNEL.google;
  return (
    <Chip w={size} h={size} r={size * 0.3} c={ch.c} depth={size * 0.08} style={ch.g ? {background: ch.g} : undefined}>
      <Tx size={size * (ch.mark.length > 1 ? 0.36 : 0.5)} color="#fff" style={{textShadow: '0 2px 4px rgba(0,0,0,0.25)'}}>{ch.mark}</Tx>
    </Chip>
  );
};

// Feature label: glossy icon + title + optional sub line
export const Feature: React.FC<{icon: Gl; c: string; title: string; sub?: string; at?: number; maxW?: number; size?: number; times?: number[]; hi?: number[]}> = ({icon, c, title, sub, at = 0.1, maxW = 820, size = 70, times, hi}) => {
  const t = useSec();
  const kl = eo(P(t, at + 0.35, 0.6));
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
      <In at={at} s0={0.3} rot={-25} dy={0}><IconChip name={icon} size={size * 1.55} c={c} /></In>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <Words text={title} at={at + 0.12} size={fit(title, size, maxW * 1.8)} maxW={maxW} times={times} hi={hi} />
        <div style={{width: 260 * kl, height: 7, borderRadius: 4, background: `linear-gradient(90deg, ${GOLD}, ${ORANGE})`}} />
        {sub && <In at={at + 0.5} dy={16} s0={1}><Tx size={fit(sub, 34, maxW)} color={SLATE} w={400}>{sub}</Tx></In>}
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

// Glossy pill with an icon chip
export const IconPill: React.FC<{icon: Gl; c: string; text: string; size?: number; maxW?: number}> = ({icon, c, text, size = 36, maxW = 360}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 30px 12px 12px', borderRadius: 99, background: 'linear-gradient(180deg, #FFFFFF, #EAF2FF)', boxShadow: '0 8px 0 #C3D5F3, 0 22px 34px rgba(14,27,77,0.25)'}}>
    <IconChip name={icon} size={size * 1.8} c={c} round />
    <Tx size={fit(text, size, maxW)}>{text}</Tx>
  </div>
);

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

// ---------- backgrounds ----------
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

// Bright "studio" stage: white centre, soft slow light rays and a glossy floor reflection line
export const StudioBG: React.FC<{hue?: number}> = ({hue = 0}) => {
  const t = useSec();
  const fade = 'radial-gradient(ellipse at 50% 30%, #000 10%, transparent 70%)';
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #FFFFFF 20%, #EAF1FF 60%, #D5E3FB)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: '-40%', background: `repeating-conic-gradient(from ${t * 4}deg at 50% 30%, rgba(21,130,213,0.05) 0deg 8deg, transparent 8deg 20deg)`, WebkitMaskImage: fade, maskImage: fade}} />
      <div style={{position: 'absolute', left: 960 - 700 + 80 * Math.sin(t * 0.3), top: -500, width: 1400, height: 1000, borderRadius: '50%', background: `radial-gradient(closest-side, ${GOLD}26, ${GOLD}00)`, filter: `hue-rotate(${hue}deg)`}} />
      <div style={{position: 'absolute', left: -300, top: 700 + 30 * Math.cos(t * 0.4), width: 1000, height: 700, borderRadius: '50%', background: `radial-gradient(closest-side, ${BLUE}22, ${BLUE}00)`}} />
    </AbsoluteFill>
  );
};
