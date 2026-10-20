// Lead Center props: source chips (WhatsApp / Website / Google), hot & warm tags, lead rows and the
// feed engine that drops three leads per loop into an inbox list (seamless: list content repeats every 3 rows).
import React from 'react';
import {Card, Chip, Face, G, Tx, dark, lite, useLoop} from '../../glow/parts';
import {BLUE, GOLD, LC, LEADS, Lead, NAVY, ORANGE, SLATE, Src} from './config';
import TEXT from './text.json';

// Shrinks a one-line label so retyped (longer) text still fits maxW px (Poppins Bold ≈ 0.58 em per char)
export const fit = (t: string, size: number, maxW: number) => Math.min(size, maxW / Math.max(1, t.length * 0.58));

export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const eo = (x: number) => 1 - (1 - x) ** 3;
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const eb = (x: number, s = 2.2) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2;
const mod = (n: number, m: number) => ((n % m) + m) % m;
export const leadAt = (n: number) => LEADS[mod(n, LEADS.length)];
export const WA = '#25D366';

// ---------- feed engine ----------
// seg = which lead is arriving (0..2), f = progress through its beat
export const useFeed = () => {
  const {p} = useLoop();
  const s = p * LEADS.length;
  const seg = Math.floor(s);
  const f = s - seg;
  const {land, push, pushDur, stamp} = LC.beat;
  return {
    seg, f,
    fly: eio(cl(f / land)), // flyer travel 0→1
    flying: f < land,
    push: eo(cl((f - push) / pushDur)), // older rows slide down one slot
    stamp: f < stamp ? 0 : eb(cl((f - stamp) / 0.12)), // newest row's tag
    pulse: Math.sin(Math.PI * cl(f / 0.16)), // source "emits"
  };
};

// Rows of the inbox: [lead, y offset in rows, tag scale, row alpha]
export const useRows = (visible = 4) => {
  const {seg, flying, push, stamp} = useFeed();
  const rows: {n: number; lead: Lead; y: number; tag: number; a: number}[] = [];
  for (let n = seg - visible; n < seg; n++) rows.push({n, lead: leadAt(n), y: seg - n - 1 + push, tag: 1, a: 1});
  if (!flying) rows.push({n: seg, lead: leadAt(seg), y: 0, tag: stamp, a: 1});
  return rows;
};

// ---------- glyphs ----------
export const WaGlyph: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 10a40 40 0 1 1-20 74.6L12 90l5.6-17.4A40 40 0 0 1 50 10z" fill="none" stroke={color} strokeWidth={9} strokeLinejoin="round" />
    <path d="M37 30c-4 0-8 4-8 8c0 18 15 33 33 33c4 0 8-4 8-8l-9-6l-6 5c-5-2-10-7-12-12l5-6z" fill={color} />
  </svg>
);

const arc = (a1: number, a2: number, r = 30) => {
  const pt = (a: number) => `${50 + r * Math.cos((a * Math.PI) / 180)} ${50 + r * Math.sin((a * Math.PI) / 180)}`;
  return `M${pt(a1)}A${r} ${r} 0 0 1 ${pt(a2)}`;
};
export const GoogleG: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g fill="none" strokeWidth={16}>
      <path d={arc(205, 318)} stroke="#EA4335" />
      <path d={arc(148, 207)} stroke="#FBBC05" />
      <path d={arc(42, 150)} stroke="#34A853" />
      <path d={arc(0, 44)} stroke="#4285F4" />
    </g>
    <rect x="50" y="42" width="38" height="16" fill="#4285F4" />
  </svg>
);

export const SRC: Record<Src, {c: string; label: string}> = {wa: {c: WA, label: TEXT.Sources.whatsapp}, web: {c: BLUE, label: TEXT.Sources.website}, google: {c: '#FFFFFF', label: TEXT.Sources.google}};

export const SrcChip: React.FC<{src: Src; size: number}> = ({src, size}) => (
  <Chip w={size} h={size} r={size * 0.3} c={SRC[src].c} depth={size * 0.08} style={src === 'google' ? {boxShadow: `0 ${size * 0.08}px 0 #B9C6DE, 0 ${size * 0.08 + 14}px 24px rgba(14,27,77,0.35), inset 0 4px 6px #fff`, background: 'linear-gradient(160deg, #FFFFFF, #EEF3FB)'} : undefined}>
    {src === 'wa' && <WaGlyph size={size * 0.58} />}
    {src === 'web' && <G name="globe" size={size * 0.6} />}
    {src === 'google' && <GoogleG size={size * 0.6} />}
  </Chip>
);

// ---------- hot / warm ----------
export const Flame3D: React.FC<{size: number; id?: string}> = ({size, id = 'fl'}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id={`${id}o`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#FFE27A" /><stop offset="0.45" stopColor={ORANGE} /><stop offset="1" stopColor="#E2401B" /></linearGradient>
      <linearGradient id={`${id}i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFBE0" /><stop offset="1" stopColor={GOLD} /></linearGradient>
    </defs>
    <path d="M50 10C58 32 84 46 84 78a34 34 0 0 1-68 0c0-17 8-28 17-36c0 13 6 19 12 21C44 48 40 28 50 10z" fill="#A9300E" transform="translate(0 7)" />
    <path d="M50 10C58 32 84 46 84 78a34 34 0 0 1-68 0c0-17 8-28 17-36c0 13 6 19 12 21C44 48 40 28 50 10z" fill={`url(#${id}o)`} />
    <path d="M50 62c7 11 17 17 17 30a17 17 0 0 1-34 0c0-11 9-18 17-30z" fill={`url(#${id}i)`} />
    <path d="M27 70c-2 8 0 16 4 22" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={6} strokeLinecap="round" />
  </svg>
);

export const Sun3D: React.FC<{size: number; id?: string; rot?: number}> = ({size, id = 'sn', rot = 0}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: 'visible'}}>
    <defs><radialGradient id={`${id}g`} cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor="#FFF6C2" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor={ORANGE} /></radialGradient></defs>
    <g transform={`rotate(${rot} 60 60)`}>
      {Array.from({length: 8}, (_, i) => <rect key={i} x={53} y={2} width={14} height={24} rx={7} fill={i % 2 ? ORANGE : GOLD} transform={`rotate(${i * 45} 60 60)`} />)}
    </g>
    <circle cx="60" cy="64" r="33" fill="#C46A00" />
    <circle cx="60" cy="60" r="33" fill={`url(#${id}g)`} />
    <path d="M40 48a24 24 0 0 1 18-12" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={6} strokeLinecap="round" />
  </svg>
);

export const Tag: React.FC<{hot: boolean; size?: number}> = ({hot, size = 28}) => {
  const t = hot ? TEXT.Tags.hot : TEXT.Tags.warm;
  return (
  <Chip w={size * Math.max(hot ? 4.5 : 5.4, 2.2 + 0.66 * t.length)} h={size * 1.65} r={size} c={hot ? '#F26A1B' : GOLD} depth={size * 0.16}>
    <div style={{display: 'flex', marginTop: hot ? -size * 0.2 : 0}}>{hot ? <Flame3D size={size * 1.1} id={`tf${size}`} /> : <Sun3D size={size * 1.35} id={`ts${size}`} />}</div>
    <Tx size={fit(t, size, size * 4.2)} color={hot ? '#fff' : NAVY}>{t}</Tx>
  </Chip>
  );
};

// ---------- lead row ----------
export const LeadRow: React.FC<{lead: Lead; w: number; tag?: number; s?: number}> = ({lead, w, tag = 1, s = 1}) => (
  <div style={{width: w, height: 104 * s, display: 'flex', alignItems: 'center', gap: 16 * s, padding: `0 ${18 * s}px`, boxSizing: 'border-box'}}>
    <div style={{position: 'relative', flexShrink: 0}}>
      <Face size={74 * s} c={lead.face} hair={lead.hair} />
      <div style={{position: 'absolute', right: -10 * s, bottom: -6 * s}}><SrcChip src={lead.src} size={38 * s} /></div>
    </div>
    <div style={{flex: 1, minWidth: 0}}>
      <Tx size={fit(lead.name, 28 * s, 300 * s)} color={NAVY}>{lead.name}</Tx><br />
      <Tx size={fit(`${TEXT.Common.via} ${lead.via}`, 20 * s, 300 * s)} color={SLATE} w={400}>{TEXT.Common.via} {lead.via}</Tx>
    </div>
    <div style={{transform: `scale(${tag})`, transformOrigin: '100% 50%'}}><Tag hot={lead.hot} size={24 * s} /></div>
  </div>
);

// Floating single lead card (the "flyer")
export const LeadCard: React.FC<{lead: Lead; w?: number; tag?: number}> = ({lead, w = 520, tag = 0}) => (
  <Card w={w} r={34} edge="#B8CBEF" style={{background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)'}}><LeadRow lead={lead} w={w} tag={tag} /></Card>
);

// ---------- brand confetti & ring ----------
const CONF = [GOLD, ORANGE, BLUE, '#FFFFFF', '#5FC2FF'];
export const BrandConfetti: React.FC<{n?: number; c?: string[]}> = ({n = 14, c = CONF}) => {
  const {p} = useLoop();
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const r = (p + (i * 0.618) % 1) % 1;
        const x = 190 + ((i * 97) % 820);
        return <div key={i} style={{position: 'absolute', left: x + 40 * Math.sin(r * 8 + i), top: 130 + 900 * r, width: 24, height: 13, borderRadius: 5, background: c[i % c.length], opacity: 0.85 * Math.sin(Math.PI * r), transform: `rotate(${r * 720 + i * 40}deg)`}} />;
      })}
    </>
  );
};

export {dark, lite};
