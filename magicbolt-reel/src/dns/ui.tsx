// DNS tutorial primitives: glyphs, glossy chips, brand background, rails, captions, widgets
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily, cl, P, eo, eb, lerp, grad} from '../components/kit';
import {Chip, lite, dark} from '../glow/parts';
import {D} from './config';

export {cl, P, eo, eb, lerp, grad, fontFamily, lite, dark};

export const useSec = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

// ---------- glyphs (white line icons, 100x100) ----------
export type Gl = 'login' | 'qr' | 'app' | 'crm' | 'cname' | 'name' | 'target' | 'dns' | 'save' | 'globe' | 'ff' | 'copy' | 'cloud' | 'check' | 'clock' | 'mail';
export const Glyph: React.FC<{name: Gl; size: number; color?: string}> = ({name, size, color = '#fff'}) => {
  const s = {fill: 'none', stroke: color, strokeWidth: 9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', display: 'block'}}>
      {name === 'login' && (<><path d="M56 16h20a8 8 0 0 1 8 8v52a8 8 0 0 1-8 8H56" {...s} /><path d="M16 50h44M44 34l16 16-16 16" {...s} /></>)}
      {name === 'qr' && (<>{[[14, 14], [58, 14], [14, 58]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width={28} height={28} rx={6} {...s} strokeWidth={8} /><rect x={x + 10} y={y + 10} width={8} height={8} fill={color} /></g>)}<rect x="60" y="60" width="10" height="10" fill={color} /><rect x="76" y="76" width="10" height="10" fill={color} /><rect x="76" y="58" width="10" height="10" fill={color} /><rect x="58" y="78" width="10" height="10" fill={color} /></>)}
      {name === 'app' && [[14, 14], [56, 14], [14, 56], [56, 56]].map(([x, y], i) => i === 3 ? <rect key={i} x={x} y={y} width={30} height={30} rx={9} {...s} /> : <rect key={i} x={x} y={y} width={30} height={30} rx={9} fill={color} />)}
      {name === 'crm' && (<><path d="M14 46c0-17 16-30 36-30s36 13 36 30-16 30-36 30c-5 0-10-1-14-2L18 84l4-16c-5-6-8-14-8-22z" fill={color} /><circle cx="36" cy="46" r="5" fill={dark(D.green, 0.2)} /><circle cx="50" cy="46" r="5" fill={dark(D.green, 0.2)} /><circle cx="64" cy="46" r="5" fill={dark(D.green, 0.2)} /></>)}
      {name === 'cname' && (<><path d="M42 58a14 14 0 0 0 20 0l16-16a14 14 0 0 0-20-20l-6 6" {...s} /><path d="M58 42a14 14 0 0 0-20 0L22 58a14 14 0 0 0 20 20l6-6" {...s} /></>)}
      {name === 'name' && (<><path d="M14 22v24l38 38 32-32-38-38H22a8 8 0 0 0-8 8z" {...s} /><circle cx="34" cy="34" r="6" fill={color} /></>)}
      {name === 'target' && (<><circle cx="50" cy="50" r="32" {...s} /><circle cx="50" cy="50" r="13" {...s} /><path d="M50 6v14M50 80v14M6 50h14M80 50h14" {...s} /></>)}
      {name === 'cloud' && <path d="M28 78a20 20 0 0 1-2-40 26 26 0 0 1 50 6 17 17 0 0 1-2 34z" fill={color} />}
      {name === 'dns' && (<><path d="M28 74a18 18 0 0 1-2-36 24 24 0 0 1 46 5 16 16 0 0 1-2 31z" {...s} /><path d="M16 88L84 14" {...s} stroke={color} /></>)}
      {name === 'save' && <polyline points="18,52 40,74 82,28" {...s} strokeWidth={12} />}
      {name === 'check' && <polyline points="18,52 40,74 82,28" {...s} strokeWidth={12} />}
      {name === 'globe' && (<><circle cx="50" cy="50" r="36" {...s} /><ellipse cx="50" cy="50" rx="15" ry="36" {...s} /><path d="M14 50h72M20 30h60M20 70h60" {...s} strokeWidth={7} /></>)}
      {name === 'ff' && (<><polygon points="12,24 48,50 12,76" fill={color} stroke={color} strokeWidth={6} strokeLinejoin="round" /><polygon points="50,24 86,50 50,76" fill={color} stroke={color} strokeWidth={6} strokeLinejoin="round" /></>)}
      {name === 'copy' && (<><rect x="32" y="32" width="52" height="52" rx="10" {...s} /><path d="M20 66V24a8 8 0 0 1 8-8h40" {...s} /></>)}
      {name === 'clock' && (<><circle cx="50" cy="50" r="36" {...s} /><path d="M50 28v24l16 10" {...s} /></>)}
      {name === 'mail' && (<><rect x="12" y="24" width="76" height="54" rx="10" {...s} /><polyline points="18,32 50,56 82,32" {...s} /></>)}
    </svg>
  );
};

// Glossy 3D icon chip
export const IconChip: React.FC<{name: Gl; size: number; c: string; round?: boolean; style?: React.CSSProperties}> = ({name, size, c, round, style}) => (
  <Chip w={size} h={size} r={round ? size / 2 : size * 0.28} c={c} depth={Math.max(4, size * 0.08)} style={style}>
    <Glyph name={name} size={size * 0.52} />
  </Chip>
);

export const REC_GLYPH: Record<string, Gl> = {login: 'login', customer: 'login', qr: 'qr', app: 'app', business: 'app', crm: 'crm'};
export const ACT_GLYPH: Record<string, Gl> = {cname: 'cname', name: 'name', target: 'target', dns: 'dns', save: 'save'};

export const Tx: React.FC<{size: number; color?: string; g?: string[]; w?: 400 | 700; style?: React.CSSProperties; children?: React.ReactNode}> = ({size, color = D.ink, g, w = 700, style, children}) => (
  <span style={{fontFamily, fontSize: size, fontWeight: w, lineHeight: 1.15, letterSpacing: -size * 0.015, color, display: 'inline-block', whiteSpace: 'nowrap', ...(g ? grad(g) : {}), ...style}}>{children}</span>
);

// Pop-in wrapper, absolutely centred on (x, y)
export const Pop: React.FC<{t: number; at: number; out?: number; x: number; y: number; dy?: number; s?: number; children?: React.ReactNode}> = ({t, at, out, x, y, dy = 40, s = 1, children}) => {
  const k = P(t, at, 0.5);
  if (k <= 0) return null;
  const ko = out === undefined ? 0 : P(t, out, 0.3);
  if (ko >= 1) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y + dy * (1 - eo(k)) - 20 * ko, transform: `translate(-50%, -50%) scale(${lerp(0.6, 1, eb(k, 2)) * s})`, opacity: Math.min(1, k * 2.5) * (1 - ko)}}>
      {children}
    </div>
  );
};

// Words rising in one by one
export const Words: React.FC<{t: number; at: number; text: string; size: number; g?: string[]; color?: string; hi?: Record<number, string[]>}> = ({t, at, text, size, g, color, hi}) => (
  <div style={{display: 'flex', gap: size * 0.26, justifyContent: 'center'}}>
    {text.split(' ').map((w, i) => {
      const k = P(t, at + i * 0.08, 0.5);
      return (
        <span key={i} style={{display: 'inline-block', opacity: Math.min(1, k * 2), transform: `translateY(${(1 - eo(k)) * size * 0.6}px) scale(${lerp(0.8, 1, eb(k, 2))})`}}>
          <Tx size={size} g={hi?.[i] ?? g} color={color}>{w}</Tx>
        </span>
      );
    })}
  </div>
);

// ---------- background: soft brand wash, slow blobs, faint dot grid ----------
const BLOBS: [number, number, number, string][] = [[260, 220, 520, D.blue], [1640, 260, 460, D.gold], [1500, 900, 560, D.violet], [380, 920, 440, D.orange]];
export const Backdrop: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #F7F9FF 0%, #EEF3FF 55%, #FFF7EA 100%)', overflow: 'hidden'}}>
      {BLOBS.map(([x, y, s, c], i) => (
        <div key={i} style={{position: 'absolute', left: x - s / 2 + 60 * Math.sin(t * 0.25 + i * 1.7), top: y - s / 2 + 40 * Math.cos(t * 0.21 + i), width: s, height: s, borderRadius: '50%',
          background: `radial-gradient(closest-side, ${c}2E, ${c}00)`}} />
      ))}
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(19,84,188,0.10) 2px, transparent 2.5px)', backgroundSize: '34px 34px', backgroundPosition: `${(t * 6) % 34}px 0px`,
        WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 35%, #000 90%)', maskImage: 'radial-gradient(ellipse at center, transparent 35%, #000 90%)'}} />
    </AbsoluteFill>
  );
};

// White glossy card
export const Card: React.FC<{w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, r = 34, style, children}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: r, boxSizing: 'border-box', background: 'linear-gradient(180deg, #FFFFFF, #F3F6FF)', border: '3px solid #fff',
    boxShadow: '0 8px 0 #D5DEF3, 0 26px 50px rgba(19,40,120,0.16), inset 0 4px 0 #fff', ...style}}>{children}</div>
);

// Rail item: glossy chip + label; state 0 = upcoming, 1 = active, 2 = done
export const RailItem: React.FC<{icon: Gl; label: string; c: string; state: number; k: number; size?: number}> = ({icon, label, c, state, k, size = 74}) => {
  const t = useSec();
  const active = state === 1;
  const sc = active ? 1.12 + 0.03 * Math.sin(t * 5) : 0.92;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: lerp(0, state === 0 ? 0.55 : 1, k), transform: `scale(${lerp(0.5, 1, eb(k, 2))})`}}>
      <div style={{position: 'relative', transform: `scale(${sc})`, filter: state === 0 ? 'saturate(0.25)' : undefined}}>
        {active && <div style={{position: 'absolute', left: -size * 0.35, top: -size * 0.35, width: size * 1.7, height: size * 1.7, borderRadius: '50%', background: `radial-gradient(closest-side, ${c}66, ${c}00)`}} />}
        <IconChip name={icon} size={size} c={state === 0 ? '#9AA6C4' : c} />
        {state === 2 && (
          <div style={{position: 'absolute', right: -12, top: -12}}>
            <Chip w={34} h={34} r={17} c={D.green} depth={3}><Glyph name="check" size={20} /></Chip>
          </div>
        )}
      </div>
      <Tx size={20} color={active ? D.ink : D.slate} style={{opacity: active ? 1 : 0.85}}>{label}</Tx>
    </div>
  );
};

// Caption pill at the bottom: badge + text, re-pops whenever the text changes
export const Caption: React.FC<{text: string; since: number; badge?: string; c?: string; k?: number}> = ({text, since, badge, c = D.blue, k = 1}) => {
  const t = useSec();
  const e = P(t, since, 0.4);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 992, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{transform: `translateY(-50%) translateY(${(1 - eo(e)) * 22}px) scale(${lerp(0.94, 1, eb(e, 2))})`, opacity: Math.min(1, 0.3 + e * 2)}}>
        <Card r={46} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '14px 40px 14px 16px'}}>
          {badge && (
            <Chip w="auto" h={58} r={29} c={c} depth={5} style={{padding: '0 22px'}}><Tx size={26} color="#fff">{badge}</Tx></Chip>
          )}
          <Tx size={38}>{text}</Tx>
        </Card>
      </div>
    </div>
  );
};

// Proxy toggle widget: orange cloud "Proxied" switches to grey "DNS only"
export const ProxyWidget: React.FC<{k: number; flip: number}> = ({k, flip}) => {
  const t = useSec();
  const off = eo(flip);
  const knob = lerp(46, 6, off);
  const track = off > 0.5 ? '#C9D1E3' : D.blue;
  const cloud = off > 0.5 ? '#AAB3C8' : D.cf;
  const wob = flip >= 1 ? 1 + 0.03 * Math.sin(t * 6) : 1;
  return (
    <div style={{opacity: Math.min(1, k * 2), transform: `scale(${lerp(0.6, 1, eb(k, 2)) * wob})`, transformOrigin: '100% 100%'}}>
      <Card r={30} style={{padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 12, border: `3px solid ${off > 0.5 ? D.green : D.orange}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Chip w={36} h={36} r={18} c={off > 0.5 ? D.green : D.red} depth={3}><Tx size={22} color="#fff">{off > 0.5 ? '✓' : '!'}</Tx></Chip>
          <Tx size={24} color={D.slate}>Proxy status</Tx>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{position: 'relative', width: 92, height: 50, borderRadius: 25, background: track, boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.2)'}}>
            <div style={{position: 'absolute', left: knob, top: 6, width: 38, height: 38, borderRadius: 19, background: '#fff', boxShadow: '0 3px 6px rgba(0,0,0,0.25)'}} />
          </div>
          <Glyph name="cloud" size={50} color={cloud} />
          <Tx size={34} color={off > 0.5 ? D.ink : D.cf}>{off > 0.5 ? 'DNS only' : 'Proxied'}</Tx>
        </div>
      </Card>
    </div>
  );
};

// Small pill toast ("login added")
export const Toast: React.FC<{text: string; c?: string; icon?: Gl}> = ({text, c = D.green, icon = 'check'}) => (
  <Chip w="auto" h={66} r={33} c={c} depth={6} style={{padding: '0 30px 0 12px'}}>
    <div style={{width: 46, height: 46, borderRadius: 23, background: 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Glyph name={icon} size={26} /></div>
    <Tx size={30} color="#fff">{text}</Tx>
  </Chip>
);

// Four-point sparkle
export const Spark: React.FC<{x: number; y: number; s: number; c: string; t: number; i: number}> = ({x, y, s, c, t, i}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible', transform: `rotate(${t * (i % 2 ? 40 : -50)}deg) scale(${0.55 + 0.45 * Math.abs(Math.sin(t * 2.4 + i * 1.3))})`, filter: `drop-shadow(0 0 ${s * 0.12}px ${c})`}}>
    <path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill={c} />
  </svg>
);
