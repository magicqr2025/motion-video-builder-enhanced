// MagicQR reel objects: phone + review screens, QR standee, face, business icons, pointer
import React from 'react';
import {Img, staticFile} from 'remotion';
import {useT} from '../components/kit';
import {Bolt} from '../components/graphics';
import {ASSETS, BizIcon, DEMO, Q} from './config';
import {Card, Sparkle, Stars, Tx} from './kit';

// The real QR standee photo (transparent background)
export const StandImg: React.FC<{w: number}> = ({w}) => (
  <Img src={staticFile(ASSETS.standee)} style={{width: w, display: 'block', filter: 'drop-shadow(0 40px 50px rgba(27,22,64,0.28))'}} />
);

// MagicBolt AI lockup
export const BoltLogo: React.FC<{size: number}> = ({size}) => {
  const tile = size * 1.4;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.3}}>
      <div style={{width: tile, height: tile, borderRadius: tile * 0.28, background: `linear-gradient(135deg, ${Q.boltViolet}, ${Q.boltBlue})`, boxShadow: `0 20px 50px ${Q.boltViolet}66`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Bolt size={tile * 0.76} />
      </div>
      <span><Tx size={size}>Magic</Tx><Tx size={size} color={Q.boltViolet}>Bolt</Tx></span>
      <div style={{background: Q.ink, borderRadius: size * 0.2, padding: `${size * 0.02}px ${size * 0.2}px`}}><Tx size={size * 0.62} color={Q.yellow}>AI</Tx></div>
    </div>
  );
};

// "Google" in its letter colours, as the review screen shows it
export const GoogleWord: React.FC<{size: number}> = ({size}) => (
  <span style={{whiteSpace: 'nowrap'}}>{'Google'.split('').map((ch, i) => <Tx key={i} size={size} color={Q.g[i]} style={{letterSpacing: -size * 0.03}}>{ch}</Tx>)}</span>
);

// ---------- Phone (540 x 1100 at scale 1) ----------
export const Phone: React.FC<{name?: string; address?: string; children?: React.ReactNode}> = ({name = DEMO.name, address = DEMO.address, children}) => (
  <div style={{width: 540, height: 1100, borderRadius: 78, background: Q.ink, padding: 14, boxSizing: 'border-box', boxShadow: '0 50px 110px rgba(27,22,64,0.35)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: 64, background: 'linear-gradient(180deg, #F5F7FF, #EEF0FF)', overflow: 'hidden', position: 'relative'}}>
      <div style={{display: 'flex', height: 8}}>{[Q.g[0], Q.g[4], Q.g[2], Q.g[1]].map((c) => <div key={c} style={{flex: 1, background: c}} />)}</div>
      <div style={{textAlign: 'center', padding: '34px 20px 22px'}}>
        <Tx size={30}>{name}</Tx><br /><Tx size={17} color={Q.slate} w={400}>{address}</Tx>
      </div>
      {children}
    </div>
  </div>
);

const inner: React.CSSProperties = {margin: '0 22px 18px', borderRadius: 26, background: '#fff', boxShadow: '0 10px 30px rgba(79,66,154,0.12)', padding: '26px 24px', textAlign: 'center'};

export const RateCard: React.FC<{n: number}> = ({n}) => (
  <div style={inner}>
    <GoogleWord size={46} /><br />
    <Tx size={26} style={{marginTop: 6}}>Rate Your Experience</Tx><br />
    <Tx size={17} color={Q.slate} w={400}>How was your experience with us?</Tx>
    <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}><Stars n={n} size={58} /></div>
  </div>
);

const field = (label: string, h = 54, value = ''): React.ReactNode => (
  <div style={{height: h, borderRadius: 14, border: `2px solid ${Q.line}`, background: '#FAFAFF', marginTop: 12, padding: '12px 16px', boxSizing: 'border-box', textAlign: 'left'}}>
    <Tx size={18} color={value ? Q.ink : Q.slate} w={400} style={{whiteSpace: 'normal'}}>{value || label}</Tx>
  </div>
);
const blueBtn: React.CSSProperties = {height: 62, borderRadius: 31, background: `linear-gradient(90deg, ${Q.blue}, #0D47A1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16};

// 1–3 stars: private feedback form. k types the message.
export const FeedbackForm: React.FC<{k: number}> = ({k}) => {
  const msg = 'Service was a bit slow today.';
  return (
    <div style={{...inner, textAlign: 'left'}}>
      <Tx size={22}>Share your feedback</Tx>
      {field('Name *')}{field('Phone')}{field('Message', 130, msg.slice(0, Math.floor(msg.length * k)))}
      <div style={blueBtn}><Tx size={20} color="#fff">Submit Feedback</Tx></div>
    </div>
  );
};

// Review text with the keyword highlighted
const Review: React.FC<{chars: number; size: number}> = ({chars, size}) => {
  const full = DEMO.review;
  const i = full.toLowerCase().indexOf(DEMO.keyword.toLowerCase());
  const j = i < 0 ? -1 : i + DEMO.keyword.length;
  const cut = (a: number, b: number) => full.slice(Math.min(a, chars), Math.min(b, chars));
  const st: React.CSSProperties = {whiteSpace: 'normal', display: 'inline', lineHeight: 1.45};
  if (i < 0) return <Tx size={size} w={400} style={st}>{cut(0, full.length)}</Tx>;
  return (
    <>
      <Tx size={size} w={400} style={st}>{cut(0, i)}</Tx>
      <Tx size={size} style={{...st, background: `${Q.yellow}88`, borderRadius: 6}}>{cut(i, j)}</Tx>
      <Tx size={size} w={400} style={st}>{cut(j, full.length)}</Tx>
    </>
  );
};

// 4–5 stars: keyword chip → "writing" dots → typed review + post button
export const AiPanel: React.FC<{chip: number; writing: boolean; typed: number | null; press?: number}> = ({chip, writing, typed, press = 0}) => {
  const t = useT();
  return (
    <div style={{...inner, padding: 0, overflow: 'hidden'}}>
      <div style={{background: '#EEF5FF', padding: '24px 20px'}}>
        <Tx size={21}>Not sure what to write?</Tx><br />
        <Tx size={15} color={Q.slate} w={400}>Pick a topic and we’ll draft a review for you</Tx><br />
        <div style={{display: 'inline-block', marginTop: 14, padding: '10px 22px', borderRadius: 30, border: `2px solid ${Q.blue}`, background: chip > 0 ? Q.blue : 'transparent', transform: `scale(${1 + 0.12 * Math.sin(Math.PI * chip)})`}}>
          <Tx size={18} color={chip > 0 ? '#fff' : Q.blue}>{DEMO.keyword}</Tx>
        </div>
      </div>
      <div style={{padding: '22px 22px 26px'}}>
        {writing && (
          <div style={{padding: '30px 0'}}>
            <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>{[0, 1, 2, 3].map((i) => <div key={i} style={{width: 14, height: 14, borderRadius: '50%', background: Q.blue, transform: `translateY(${-8 * Math.max(0, Math.sin(t * 9 - i * 0.8))}px)`}} />)}</div>
            <Tx size={18} color={Q.slate} style={{marginTop: 14}}>Writing your review…</Tx>
          </div>
        )}
        {typed !== null && (<>
          <div style={{borderRadius: 16, border: `2px solid ${Q.line}`, background: '#FAFAFF', padding: '16px 18px', textAlign: 'left', minHeight: 190}}>
            <Review chars={Math.floor(DEMO.review.length * typed)} size={19} />
          </div>
          <div style={{...blueBtn, transform: `scale(${1 - 0.06 * press})`}}><Tx size={20} color="#fff">Copy &amp; Post on Google</Tx></div>
        </>)}
      </div>
    </div>
  );
};

// Review as it appears once posted
export const ReviewCard: React.FC<{w: number}> = ({w}) => (
  <Card w={w} r={40} style={{padding: '36px 40px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <div style={{width: 92, height: 92, borderRadius: '50%', background: Q.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Tx size={46} color="#fff">{DEMO.reviewer[0]}</Tx></div>
      <div style={{flex: 1}}><Tx size={36}>{DEMO.reviewer}</Tx><br /><Stars n={5} size={44} /></div>
      <GoogleWord size={40} />
    </div>
    <div style={{marginTop: 22}}><Review chars={DEMO.review.length} size={31} /></div>
  </Card>
);

// ---------- QR code (decorative, not scannable) ----------
const FINDER = (r: number, c: number) => {
  for (const [fr, fc] of [[0, 0], [0, 14], [14, 0]]) {
    const dr = r - fr, dc = c - fc;
    if (dr >= 0 && dr < 7 && dc >= 0 && dc < 7) return dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) ? 1 : 0;
    if (dr >= -1 && dr < 8 && dc >= -1 && dc < 8) return 0;
  }
  return -1;
};
export const Qr: React.FC<{size: number; color?: string}> = ({size, color = Q.ink}) => (
  <svg width={size} height={size} viewBox="0 0 21 21" shapeRendering="crispEdges">
    {Array.from({length: 21 * 21}, (_, i) => {
      const r = Math.floor(i / 21), c = i % 21;
      const f = FINDER(r, c);
      const on = f >= 0 ? f === 1 : ((r * 7 + c * 13 + r * c * 3 + ((r ^ c) % 5)) % 7) < 3;
      return on ? <rect key={i} x={c} y={r} width={1.02} height={1.02} fill={color} /> : null;
    })}
  </svg>
);

// ---------- Happy customer face (300x300) ----------
export const Face: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 300 300">
    <circle cx="150" cy="150" r="140" fill={Q.yellow} stroke={Q.ink} strokeWidth={8} />
    <path d="M82 130q22-30 44 0M174 130q22-30 44 0" fill="none" stroke={Q.ink} strokeWidth={11} strokeLinecap="round" />
    <path d="M84 176q66 78 132 0z" fill={Q.ink} /><path d="M112 210q38 26 76 0q-38-22-76 0z" fill={Q.pink} />
    <circle cx="66" cy="176" r="20" fill={Q.pink} opacity={0.45} /><circle cx="234" cy="176" r="20" fill={Q.pink} opacity={0.45} />
  </svg>
);

export const Heart: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><path d="M50 88C10 58 6 34 22 20c12-10 24-4 28 8c4-12 16-18 28-8c16 14 12 38-28 68z" fill={Q.pink} /></svg>
);

// ---------- Business-type icons (white on a coloured tile) ----------
export const Biz: React.FC<{icon: BizIcon; size: number; color: string}> = ({icon, size, color}) => {
  const w = '#fff';
  const s = {fill: 'none', stroke: w, strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <div style={{width: size, height: size, borderRadius: size * 0.28, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 100 100">
        {icon === 'food' && (<><path d="M24 12v26a12 12 0 0 0 24 0V12M36 12v76" {...s} /><path d="M72 88V12c-12 6-16 22-16 40h16" {...s} /></>)}
        {icon === 'salon' && (<><circle cx="24" cy="74" r="13" {...s} /><circle cx="76" cy="74" r="13" {...s} /><path d="M33 64L78 12M67 64L22 12" {...s} /></>)}
        {icon === 'clinic' && <path d="M38 10h24v28h28v24H62v28H38V62H10V38h28z" fill={w} />}
        {icon === 'hotel' && (<><path d="M10 20v66M10 62h80v24M90 62V50a12 12 0 0 0-12-12H46v24" {...s} /><circle cx="28" cy="46" r="9" fill={w} /></>)}
        {icon === 'gym' && (<><path d="M30 50h40" {...s} /><rect x="16" y="26" width="14" height="48" rx="6" fill={w} /><rect x="70" y="26" width="14" height="48" rx="6" fill={w} /><rect x="4" y="36" width="10" height="28" rx="5" fill={w} /><rect x="86" y="36" width="10" height="28" rx="5" fill={w} /></>)}
        {icon === 'spa' && (<><path d="M50 84C30 70 30 36 50 16C70 36 70 70 50 84Z" fill={w} /><path d="M50 84C24 86 8 70 6 46C28 46 44 60 50 84ZM50 84C76 86 92 70 94 46C72 46 56 60 50 84Z" {...s} /></>)}
        {icon === 'retail' && (<><path d="M16 34h68l-6 54H22z" fill={w} /><path d="M34 40V28a16 16 0 0 1 32 0v12" {...s} /></>)}
        {icon === 'service' && (<><rect x="10" y="32" width="80" height="54" rx="10" fill={w} /><path d="M36 32V22a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v10" {...s} /><path d="M10 56h80" stroke={color} strokeWidth={7} /></>)}
      </svg>
    </div>
  );
};

export const Lock: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M30 46V34a20 20 0 0 1 40 0v12" fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
    <rect x="18" y="44" width="64" height="46" rx="12" fill={color} /><circle cx="50" cy="66" r="8" fill="#fff" />
  </svg>
);

export const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
  <svg width={64} height={92} viewBox="-4 -4 56 86" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.14 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(3px 8px 8px rgba(27,22,64,0.3))'}}>
    <polygon points="0,0 0,62 15,48 26,74 38,69 27,44 47,44" fill={Q.ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

// Sparkle badge that says "AI"
export const AiBadge: React.FC<{size: number; spin?: number}> = ({size, spin = 0}) => (
  <div style={{position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Sparkle size={size} color={Q.purple} style={{position: 'absolute', left: 0, top: 0, transform: `rotate(${spin}deg)`}} />
    <Tx size={size * 0.3} color="#fff" style={{position: 'relative'}}>AI</Tx>
  </div>
);
