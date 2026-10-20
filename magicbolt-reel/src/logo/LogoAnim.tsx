// MagicBolt AI logo animation (1440x480, 5 s, loops from empty back to empty).
// Uses the real logo file, split into its parts with clip-paths so each part can animate on its own:
// shield → "Magic" → "Bolt" → ".ai" → tagline, then a light sweep, twinkling AI stars and a soft exit.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const LOGO = 'magicbolt-logo.png'; // in /public, 706 x 133
const [SW, SH] = [706, 133]; // source pixels
const W = 1200; // drawn width
const K = W / SW;
const H = SH * K;
const [OX, OY] = [(1440 - W) / 2, (480 - H) / 2 - 6];
const BLUE = '#1582D5', DEEP = '#1354BC', GOLD = '#FDC60B', ORANGE = '#F7941D';

const cl = (x: number) => Math.max(0, Math.min(1, x));
const P = (t: number, a: number, d: number) => cl((t - a) / d);
const eo = (x: number) => 1 - (1 - x) ** 3;
const eb = (x: number, s = 1.9) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2;

// One rectangular slice of the logo, in source pixels. `reveal` (0–1) wipes it in from the left.
const Part: React.FC<{x0: number; x1: number; y0: number; y1: number; reveal?: number; style?: React.CSSProperties}> = ({x0, x1, y0, y1, reveal = 1, style}) => {
  const right = x0 + (x1 - x0) * reveal;
  return (
    <div style={{position: 'absolute', left: OX, top: OY, width: W, height: H, transformOrigin: `${((x0 + x1) / 2) * K}px ${((y0 + y1) / 2) * K}px`, ...style}}>
      <Img src={staticFile(LOGO)} style={{width: W, height: H, display: 'block', clipPath: `inset(${y0 * K}px ${(SW - right) * K}px ${(SH - y1) * K}px ${x0 * K}px)`}} />
    </div>
  );
};

// Four-point "AI" star
const Star: React.FC<{x: number; y: number; size: number; c: string; k: number; spin: number}> = ({x, y, size, c, k, spin}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `rotate(${spin}deg) scale(${k})`, filter: `drop-shadow(0 0 ${size * 0.12}px ${c})`, overflow: 'visible'}}>
    <path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill={c} />
  </svg>
);
const STARS: [number, number, number, string, number][] = [
  [70, 70, 78, BLUE, 1.9], [150, 130, 40, GOLD, 2.1], // top-left corner
  [1372, 62, 84, GOLD, 1.75], [1300, 120, 42, BLUE, 2.0], // top-right corner
  [78, 410, 64, ORANGE, 2.05], [1366, 414, 70, DEEP, 2.2], // bottom corners
  [1330, 330, 36, GOLD, 2.3], [140, 330, 34, BLUE, 2.35],
];

export const LogoAnim: React.FC<{bg?: string}> = ({bg}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  // exit: everything lifts and fades between 4.3 s and 4.7 s
  const out = eo(P(t, 4.3, 0.4));
  const kShield = P(t, 0.1, 0.5);
  const flash = P(t, 0.3, 0.55);
  const kMagic = eo(P(t, 0.5, 0.55));
  const kAi = P(t, 1.3, 0.4);
  const kTag = eo(P(t, 1.55, 0.45));
  const sweep = P(t, 2.15, 0.9);
  const sweep2 = P(t, 3.3, 0.8);
  const built = t > 1.9;
  const maskUrl = `url(${staticFile(LOGO)})`;
  const cxShield = OX + 46 * K, cyShield = OY + 66 * K;
  return (
    <AbsoluteFill style={{background: bg}}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translateY(${-24 * out}px) scale(${1 + 0.04 * out})`}}>
        {/* glow behind the bolt: flashes on entry, then breathes */}
        {kShield > 0 && (
          <div style={{position: 'absolute', left: cxShield - 260, top: cyShield - 260, width: 520, height: 520, borderRadius: '50%',
            background: `radial-gradient(closest-side, ${GOLD}AA, ${ORANGE}33 55%, ${ORANGE}00)`, opacity: Math.max(Math.sin(Math.PI * flash), built ? 0.35 + 0.2 * Math.sin(t * 5) : 0), transform: `scale(${0.5 + 0.7 * eo(flash)})`}} />
        )}
        {/* lightning rays on entry */}
        {flash > 0 && flash < 1 && (
          <svg width={1440} height={480} style={{position: 'absolute', left: 0, top: 0}}>
            {Array.from({length: 12}, (_, i) => {
              const a = (i * Math.PI) / 6 + 0.2;
              const r0 = 110 + 160 * eo(flash), r1 = r0 + 70 * (1 - flash);
              return <line key={i} x1={cxShield + r0 * Math.cos(a)} y1={cyShield + r0 * Math.sin(a)} x2={cxShield + r1 * Math.cos(a)} y2={cyShield + r1 * Math.sin(a)} stroke={i % 2 ? GOLD : BLUE} strokeWidth={10} strokeLinecap="round" opacity={1 - flash} />;
            })}
          </svg>
        )}
        {/* sparks drifting up from the bolt once the logo is built */}
        {built && Array.from({length: 7}, (_, i) => {
          const r = ((t - 1.9) * 0.55 + i / 7) % 1;
          return <div key={i} style={{position: 'absolute', left: cxShield - 60 + ((i * 53) % 130) + 14 * Math.sin(r * 9 + i), top: cyShield + 60 - 190 * r, width: 12, height: 12, borderRadius: '50%', background: i % 2 ? GOLD : ORANGE, opacity: Math.sin(Math.PI * r), boxShadow: `0 0 12px ${GOLD}`}} />;
        })}
        {/* logo parts */}
        <Part x0={0} x1={97} y0={0} y1={SH} style={{transform: `scale(${kShield > 0 ? eb(kShield, 2.4) : 0}) rotate(${(1 - eo(kShield)) * -25}deg)`}} />
        {/* "Magic" in two slices so the g's tail (which hangs below the baseline) stays with the word, not the tagline */}
        <Part x0={97} x1={344} y0={0} y1={SH} reveal={cl((337 * kMagic) / 247)} style={{transform: `translateX(${(1 - kMagic) * -40}px)`}} />
        <Part x0={344} x1={434} y0={0} y1={103} reveal={cl((337 * kMagic - 247) / 90)} style={{transform: `translateX(${(1 - kMagic) * -40}px)`}} />
        <Part x0={434} x1={664} y0={0} y1={103} reveal={eo(P(t, 0.9, 0.5))} style={{transform: `translateX(${(1 - eo(P(t, 0.9, 0.5))) * -30}px)`}} />
        <Part x0={664} x1={SW} y0={0} y1={103} style={{transform: `scale(${kAi > 0 ? eb(kAi, 2.6) : 0}) rotate(${(1 - eo(kAi)) * 40}deg)`}} />
        <Part x0={344} x1={SW} y0={103} y1={SH} reveal={kTag} style={{opacity: kTag, transform: `translateY(${(1 - kTag) * 16}px)`}} />
        {/* light sweeping across the letters only (masked by the logo's own shape) */}
        {[sweep, sweep2].map((s, i) => s > 0 && s < 1 && (
          <div key={i} style={{position: 'absolute', left: OX, top: OY, width: W, height: H, WebkitMaskImage: maskUrl, maskImage: maskUrl, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', overflow: 'hidden'}}>
            <div style={{position: 'absolute', top: -40, left: -260 + (W + 420) * s, width: i ? 110 : 190, height: H + 80, transform: 'skewX(-20deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.95), rgba(255,255,255,0))'}} />
          </div>
        ))}
        {/* a streak of light running under the wordmark */}
        {t > 1.6 && (
          <div style={{position: 'absolute', left: OX + 97 * K, top: OY + H + 14, width: (SW - 97) * K * eo(P(t, 1.6, 0.6)), height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${DEEP}, ${BLUE} 45%, ${GOLD} 70%, ${ORANGE})`, overflow: 'hidden'}}>
            <div style={{position: 'absolute', top: 0, left: `${((t - 1.6) * 60) % 130 - 20}%`, width: '14%', height: '100%', background: 'rgba(255,255,255,0.95)'}} />
          </div>
        )}
        {/* AI stars in the corners: pop in, then twinkle */}
        {STARS.map(([x, y, s, c, at], i) => {
          const k = P(t, at - 1.0 + i * 0.05, 0.4);
          return k > 0 ? <Star key={i} x={x} y={y} size={s} c={c} k={eb(k, 2.4) * (0.7 + 0.3 * Math.abs(Math.sin(t * 3.2 + i * 1.3)))} spin={t * (i % 2 ? 50 : -40)} /> : null;
        })}
      </div>
    </AbsoluteFill>
  );
};
