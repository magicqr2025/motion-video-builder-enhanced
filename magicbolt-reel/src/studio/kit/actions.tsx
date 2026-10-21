// Cursor choreography and UI animations. Look options "Cursor choreography" and "UI animations".
import React from 'react';
import {fontFamily} from '../../components/kit';
import {COLORS, P, eb, eio, eo, keyframed, lerp, useSec, useSpringK} from './core';

export const Cursor: React.FC<{size?: number; color?: string; press?: number}> = ({size = 64, color = COLORS.navy, press = 0}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `scale(${1 - 0.15 * press})`, transformOrigin: '18% 8%', filter: 'drop-shadow(0 8px 10px rgba(14,27,77,0.4))'}}>
    <path d="M18 8L82 50L52 56L66 86L54 92L40 62L18 82Z" fill={color} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

type CKey = {t: number; x: number; y: number; click?: boolean};

/**
 * A cursor that glides between points (scene coordinates, px) and clicks with a ripple.
 *   <CursorPath keys={[{t: 0.5, x: 300, y: 200}, {t: 1.6, x: 900, y: 500, click: true}]} />
 */
export const CursorPath: React.FC<{keys: CKey[]; size?: number; color?: string; ripple?: string}> = ({keys, size = 64, color, ripple = COLORS.gold}) => {
  const t = useSec();
  if (t < keys[0].t - 0.3) return null;
  const k = keyframed(keys.map((c) => ({t: c.t, x: c.x, y: c.y})), t);
  const clicks = keys.filter((c) => c.click);
  const press = Math.max(0, ...clicks.map((c) => P(t, c.t - 0.12, 0.1) - P(t, c.t + 0.02, 0.14)));
  const fade = Math.min(1, P(t, keys[0].t - 0.3, 0.3));
  return (
    <>
      {clicks.map((c, i) => {
        const r = P(t, c.t, 0.55);
        return r > 0 && r < 1 ? <div key={i} style={{position: 'absolute', left: c.x - 40 * eo(r) - 4, top: c.y - 40 * eo(r) - 4, width: 80 * eo(r) + 8, height: 80 * eo(r) + 8, borderRadius: '50%', border: `5px solid ${ripple}`, opacity: 1 - r}} /> : null;
      })}
      <div style={{position: 'absolute', left: k.x - size * 0.18, top: k.y - size * 0.08, opacity: fade}}><Cursor size={size} color={color} press={press} /></div>
    </>
  );
};

/** switch that flips on at `at` seconds */
export const Toggle: React.FC<{at: number; w?: number; onColor?: string}> = ({at, w = 120, onColor = '#16A34A'}) => {
  const t = useSec();
  const k = eb(P(t, at, 0.3));
  const h = w * 0.54, pad = h * 0.1, d = h - pad * 2;
  return (
    <div style={{width: w, height: h, borderRadius: h, background: k > 0.5 ? onColor : '#9AA3C0', position: 'relative', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.2)'}}>
      <div style={{position: 'absolute', top: pad, left: lerp(pad, w - d - pad, Math.min(1, k)), width: d, height: d, borderRadius: '50%', background: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.3)'}} />
    </div>
  );
};

/** a number that counts up (Indian digit grouping by default) */
export const CountUp: React.FC<{to: number; at: number; dur?: number; decimals?: number; prefix?: string; suffix?: string; style?: React.CSSProperties}> = ({to, at, dur = 1.2, decimals = 0, prefix = '', suffix = '', style}) => {
  const t = useSec();
  const v = to * eo(P(t, at, dur));
  return <span style={style}>{prefix}{v.toLocaleString('en-IN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}{suffix}</span>;
};

/** bar that fills from 0 to `to` (0..1) */
export const ProgressBar: React.FC<{at: number; dur?: number; to?: number; w?: number; h?: number; colors?: [string, string]}> = ({at, dur = 1.2, to = 1, w = 420, h = 22, colors = [COLORS.gold, COLORS.orange]}) => {
  const t = useSec();
  return (
    <div style={{width: w, height: h, borderRadius: h, background: 'rgba(14,27,77,0.12)', overflow: 'hidden'}}>
      <div style={{width: `${100 * to * eio(P(t, at, dur))}%`, height: '100%', borderRadius: h, background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`}} />
    </div>
  );
};

/** a toast / notification card that springs in from the right and leaves after `hold` seconds (omit hold to stay) */
export const Notification: React.FC<{at: number; title: string; sub?: string; hold?: number; icon?: React.ReactNode; w?: number}> = ({at, title, sub, hold, icon, w = 520}) => {
  const t = useSec();
  const k = useSpringK(at, 1);
  const out = hold === undefined ? 0 : eio(P(t, at + hold, 0.35));
  if (t < at) return null;
  return (
    <div style={{width: w, padding: '18px 24px', borderRadius: 24, boxSizing: 'border-box', background: 'linear-gradient(180deg,#fff,#EEF4FF)', boxShadow: '0 8px 0 #C3D5F3, 0 24px 40px rgba(14,27,77,0.28)', display: 'flex', alignItems: 'center', gap: 18, fontFamily, opacity: 1 - out, transform: `translateX(${(1 - k) * 160 + out * 160}px)`}}>
      {icon}
      <div><div style={{fontWeight: 700, fontSize: 30, color: COLORS.navy, lineHeight: 1.15}}>{title}</div>{sub && <div style={{fontSize: 22, color: COLORS.slate, marginTop: 4}}>{sub}</div>}</div>
    </div>
  );
};
