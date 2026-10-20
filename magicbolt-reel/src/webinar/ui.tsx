// Drawn UI pieces: icons, chips, profile cards, search bar, logo card, offer cards, earnings card, ticket
import React from 'react';
import {Img, staticFile} from 'remotion';
import {useT, P, cl, eo, eb, lerp} from '../components/kit';
import {BRAND, ShopIcon, W} from './config';
import {Card, Gloss, Sparkle, Tx} from './kit';

export type IcoName = ShopIcon | 'check' | 'cross' | 'play' | 'chat' | 'chart' | 'search' | 'user' | 'case' | 'arrow' | 'up';
const PATHS: Record<IcoName, React.ReactNode> = {
  clinic: <path d="M38 12h24v26h26v24H62v26H38V62H12V38h26z" />,
  salon: <><circle cx="26" cy="72" r="14" fill="none" strokeWidth="10" stroke="currentColor" /><circle cx="74" cy="72" r="14" fill="none" strokeWidth="10" stroke="currentColor" /><path d="M32 60 68 10M68 60 32 10" fill="none" strokeWidth="10" strokeLinecap="round" stroke="currentColor" /></>,
  cafe: <><path d="M14 36h56v22a28 28 0 0 1-56 0z" /><path d="M70 42h8a12 12 0 0 1 0 24h-9" fill="none" strokeWidth="9" stroke="currentColor" /><path d="M30 26c-6-8 6-10 0-18M52 26c-6-8 6-10 0-18" fill="none" strokeWidth="7" strokeLinecap="round" stroke="currentColor" /></>,
  gym: <><rect x="6" y="32" width="14" height="36" rx="5" /><rect x="80" y="32" width="14" height="36" rx="5" /><rect x="22" y="22" width="14" height="56" rx="5" /><rect x="64" y="22" width="14" height="56" rx="5" /><rect x="34" y="43" width="32" height="14" /></>,
  store: <><path d="M16 34h68l-6 54H22z" /><path d="M34 40V28a16 16 0 0 1 32 0v12" fill="none" strokeWidth="9" strokeLinecap="round" stroke="currentColor" /></>,
  check: <path d="M14 52 40 78 88 24" fill="none" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />,
  cross: <path d="M20 20 80 80M80 20 20 80" fill="none" strokeWidth="16" strokeLinecap="round" stroke="currentColor" />,
  play: <path d="M30 14 84 50 30 86z" strokeWidth="8" strokeLinejoin="round" stroke="currentColor" />,
  chat: <path d="M12 16h76a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H50L26 92V72H12a8 8 0 0 1-8-8V24a8 8 0 0 1 8-8z" />,
  chart: <><rect x="10" y="54" width="20" height="36" rx="5" /><rect x="40" y="34" width="20" height="56" rx="5" /><rect x="70" y="10" width="20" height="80" rx="5" /></>,
  search: <><circle cx="42" cy="42" r="28" fill="none" strokeWidth="12" stroke="currentColor" /><path d="M64 64 90 90" fill="none" strokeWidth="14" strokeLinecap="round" stroke="currentColor" /></>,
  user: <><circle cx="50" cy="32" r="20" /><path d="M10 92a40 34 0 0 1 80 0z" /></>,
  case: <><rect x="8" y="30" width="84" height="56" rx="10" /><path d="M36 30V20a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v10" fill="none" strokeWidth="9" stroke="currentColor" /></>,
  arrow: <path d="M12 50h68M56 22l28 28-28 28" fill="none" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />,
  up: <path d="M50 88V16M22 44 50 14l28 30" fill="none" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />,
};
export const Ico: React.FC<{name: IcoName; size: number; color?: string; style?: React.CSSProperties}> = ({name, size, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill={color} color={color} style={{display: 'block', flex: 'none', ...style}}>{PATHS[name]}</svg>
);

export const Crown: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80" style={{display: 'block', filter: `drop-shadow(0 12px 18px ${W.orange}88)`}}>
    <defs><linearGradient id="crown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE680" /><stop offset="1" stopColor={W.orange} /></linearGradient></defs>
    <path d="M8 70 2 20l26 22L50 6l22 36 26-22-6 50z" fill="url(#crown)" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="50" cy="52" r="6" fill={W.pink} /><circle cx="28" cy="56" r="4" fill={W.purple} /><circle cx="72" cy="56" r="4" fill={W.purple} />
  </svg>
);
export const Cursor: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', filter: 'drop-shadow(0 10px 14px rgba(27,22,64,0.4))'}}>
    <path d="M18 6 86 56 54 62 72 94 56 98 40 68 18 88z" fill={W.ink} stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
  </svg>
);

// Round icon tile + label, e.g. the name tag over a shop
export const Chip: React.FC<{icon: IcoName; text: string; color: string; size?: number}> = ({icon, text, color, size = 34}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.3, padding: `${size * 0.22}px ${size * 0.6}px ${size * 0.22}px ${size * 0.24}px`, borderRadius: 999, background: '#fff', boxShadow: '0 12px 28px rgba(76,48,170,0.28)', border: `3px solid ${color}`}}>
    <Gloss c={color} r={999} style={{width: size * 1.4, height: size * 1.4}}><Ico name={icon} size={size * 0.74} /></Gloss>
    <Tx size={size} color={W.ink}>{text}</Tx>
  </div>
);
// Speech bubble with a tail
export const Bubble: React.FC<{text: string; color: string; size?: number; spark?: boolean}> = ({text, color, size = 40, spark}) => (
  <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: `${size * 0.3}px ${size * 0.6}px`, borderRadius: size * 0.7, background: '#fff', boxShadow: '0 14px 30px rgba(76,48,170,0.3)'}}>
    <Tx size={size} color={color}>{text}</Tx>
    {spark && <Sparkle size={size * 0.8} color={W.yellow} />}
    <div style={{position: 'absolute', left: '50%', bottom: -size * 0.28, width: size * 0.6, height: size * 0.6, background: '#fff', transform: 'translateX(-50%) rotate(45deg)', borderRadius: 6}} />
  </div>
);
// Glossy square badge: SEO / AEO / GEO …
export const Badge: React.FC<{text: string; color: string; size?: number}> = ({text, color, size = 44}) => (
  <Gloss c={color} r={size * 0.5} style={{padding: `${size * 0.34}px ${size * 0.52}px`, border: '4px solid #fff'}}><Tx size={size} color="#fff">{text}</Tx></Gloss>
);

// ---------- Hook: two candidate cards ----------
export const Profile: React.FC<{tag: string; status: string; ai?: boolean; state: 'idle' | 'win' | 'lose'}> = ({tag, status, ai, state}) => {
  const c = state === 'win' ? W.green : state === 'lose' ? W.red : W.yellow;
  return (
    <Card w={440} h={480} r={48} border={state === 'win' ? W.green : '#fff'} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 30px', filter: state === 'lose' ? 'grayscale(0.85)' : undefined, boxShadow: state === 'win' ? `0 0 0 10px ${W.green}33, 0 30px 70px ${W.green}66` : undefined}}>
      <Gloss c={ai ? W.purple : '#B9B4D0'} c2={ai ? W.pink : '#9A95B5'} r={999} style={{width: 150, height: 150}}><Ico name="user" size={84} /></Gloss>
      {ai && <div style={{position: 'absolute', left: 258, top: 22}}><Sparkle size={64} color={W.yellow} /></div>}
      <div style={{width: 230, height: 22, borderRadius: 11, background: W.line, marginTop: 26}} />
      <div style={{width: 150, height: 16, borderRadius: 8, background: W.line, marginTop: 14}} />
      <div style={{marginTop: 26, padding: '10px 28px', borderRadius: 999, background: ai ? `${W.purple}1c` : '#EFEDF6'}}><Tx size={34} color={ai ? W.purple : W.slate}>{tag}</Tx></div>
      <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 30px', borderRadius: 999, background: c}}>
        {state !== 'idle' && <Ico name={state === 'win' ? 'check' : 'cross'} size={34} />}
        <Tx size={38} color={state === 'idle' ? W.ink : '#fff'}>{status}</Tx>
      </div>
    </Card>
  );
};

// ---------- Search bar: types the query, then shows a result ----------
export const SearchBar: React.FC<{query: string; typeAt: number; typeDur: number; foundAt?: number; found?: string}> = ({query, typeAt, typeDur, foundAt, found}) => {
  const t = useT();
  const n = Math.floor(query.length * cl((t - typeAt) / typeDur));
  const done = foundAt !== undefined && t >= foundAt;
  return (
    <Card w={900} h={116} r={58} border={done ? W.green : W.purple} style={{display: 'flex', alignItems: 'center', padding: '0 34px', gap: 22}}>
      <Ico name="search" size={48} color={W.purple} />
      <Tx size={42} color={W.ink} style={{flex: 1}}>{query.slice(0, n)}<span style={{opacity: Math.floor(t * 2.5) % 2 ? 0 : 1, color: W.purple}}>|</span></Tx>
      {done
        ? <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 999, background: W.green, transform: `scale(${eb(P(t, foundAt!, 0.4), 2.4)})`}}><Ico name="check" size={30} /><Tx size={32} color="#fff">{found}</Tx></div>
        : <svg width={54} height={54} viewBox="0 0 100 100" style={{transform: `rotate(${t * 420}deg)`}}><circle cx="50" cy="50" r="38" fill="none" stroke={W.line} strokeWidth="12" /><path d="M50 12a38 38 0 0 1 38 38" fill="none" stroke={W.pink} strokeWidth="12" strokeLinecap="round" /></svg>}
    </Card>
  );
};

// ---------- Logo on a white card, with a light sweep ----------
export const LogoCard: React.FC<{w: number; sweepAt?: number}> = ({w, sweepAt}) => {
  const t = useT();
  const h = (w * 133) / 706, s = sweepAt === undefined ? 0 : P(t, sweepAt, 0.9);
  return (
    <Card r={h * 0.5} style={{padding: `${h * 0.36}px ${h * 0.5}px`, overflow: 'hidden', boxShadow: `0 0 0 8px rgba(255,255,255,0.5), 0 30px 70px ${W.blue}55`}}>
      <Img src={staticFile(BRAND.logo)} style={{width: w, height: h, display: 'block'}} />
      {s > 0 && s < 1 && <div style={{position: 'absolute', top: -40, left: lerp(-300, w + 300, s), width: 150, height: h * 3, transform: 'skewX(-20deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.95), rgba(255,255,255,0))'}} />}
    </Card>
  );
};

// ---------- Offer card with a small live UI on the right ----------
const MiniTrain: React.FC<{t: number}> = ({t}) => (
  <div style={{width: 250, display: 'flex', alignItems: 'center', gap: 14}}>
    <Gloss c={W.purple} r={999} style={{width: 62, height: 62, flex: 'none'}}><Ico name="play" size={28} style={{marginLeft: 4}} /></Gloss>
    <div style={{flex: 1, height: 16, borderRadius: 8, background: W.line, overflow: 'hidden'}}><div style={{width: `${100 * cl(t / 2.2)}%`, height: '100%', borderRadius: 8, background: `linear-gradient(90deg, ${W.purple}, ${W.pink})`}} /></div>
  </div>
);
const MiniSoft: React.FC<{t: number}> = ({t}) => (
  <div style={{width: 250, height: 96, borderRadius: 18, background: '#F3F0FF', border: `2px solid ${W.line}`, boxSizing: 'border-box', padding: '10px 14px', display: 'flex', alignItems: 'flex-end', gap: 12}}>
    {[0.35, 0.55, 0.45, 0.8, 1].map((v, i) => <div key={i} style={{flex: 1, height: `${100 * v * eo(cl(t / 0.9 - i * 0.18))}%`, borderRadius: 7, background: i === 4 ? W.pink : W.blue}} />)}
  </div>
);
const MiniSupport: React.FC<{t: number}> = ({t}) => (
  <div style={{width: 250, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end'}}>
    <div style={{alignSelf: 'flex-start', width: 150, height: 34, borderRadius: 17, background: W.line, transform: `scale(${eb(cl(t / 0.4), 2)})`, transformOrigin: '0 100%'}} />
    <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, background: W.green, transform: `scale(${t > 0.5 ? eb(cl((t - 0.5) / 0.4), 2.6) : 0})`, transformOrigin: '100% 0'}}>
      <Ico name="check" size={24} /><Tx size={26} color="#fff">First sale</Tx>
    </div>
  </div>
);
export const OfferCard: React.FC<{title: string; sub: string; kind: 'train' | 'soft' | 'support'; color: string; at: number}> = ({title, sub, kind, color, at}) => {
  const t = useT() - at;
  return (
    <Card w={940} h={140} r={44} border={color} style={{display: 'flex', alignItems: 'center', padding: '0 26px', gap: 24}}>
      <Gloss c={color} r={30} style={{width: 96, height: 96, flex: 'none'}}><Ico name={kind === 'train' ? 'play' : kind === 'soft' ? 'chart' : 'chat'} size={52} /></Gloss>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <Tx size={title.length > 12 ? 40 : 48} color={W.ink}>{title}</Tx>
        <Tx size={28} color={W.slate} w={400}>{sub}</Tx>
      </div>
      {kind === 'train' ? <MiniTrain t={t} /> : kind === 'soft' ? <MiniSoft t={t} /> : <MiniSupport t={t} />}
    </Card>
  );
};

// ---------- Earnings dashboard card ----------
const inr = (n: number) => Math.round(n).toLocaleString('en-IN');
export const Earnings: React.FC<{label: string; amount: number; from: number; dur: number; range: string; rangeSub: string}> = ({label, amount, from, dur, range, rangeSub}) => {
  const t = useT();
  const k = eo(cl((t - from) / dur));
  const pts = Array.from({length: 9}, (_, i) => { const u = i / 8; return [u * 300, 110 - 100 * u ** 1.7 * k - 6 * Math.sin(i * 2.1)]; });
  const done = P(t, from + dur, 0.4);
  return (
    <Card w={940} h={340} r={52} style={{padding: '30px 40px', overflow: 'hidden'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Tx size={36} color={W.slate}>{label}</Tx>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 999, background: `${W.green}22`}}><Ico name="up" size={28} color={W.green} /><Tx size={30} color={W.green}>Growing</Tx></div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6}}>
        <Tx size={112} g={[W.purple, W.pink]} style={{transform: `scale(${1 + 0.06 * Math.sin(Math.PI * done)})`, transformOrigin: '0 50%'}}>₹{inr(amount * k)}</Tx>
        <svg width={300} height={120} viewBox="0 0 300 120" style={{overflow: 'visible'}}>
          <path d={`M${pts.map((p) => p.join(' ')).join(' L')} L300 120 L0 120 Z`} fill={`${W.green}26`} />
          <path d={`M${pts.map((p) => p.join(' ')).join(' L')}`} fill="none" stroke={W.green} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={pts[8][0]} cy={pts[8][1]} r="13" fill="#fff" stroke={W.green} strokeWidth="8" />
        </svg>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 4}}>
        <div style={{padding: '8px 26px', borderRadius: 999, background: `linear-gradient(90deg, ${W.yellow}, ${W.orange})`, transform: `scale(${done > 0 ? eb(done, 2.4) : 0})`, transformOrigin: '0 50%'}}><Tx size={40} color={W.ink}>{range}</Tx></div>
        <Tx size={34} color={W.slate} style={{opacity: done}}>{rangeSub}</Tx>
      </div>
    </Card>
  );
};

// ---------- Webinar ticket ----------
export const Ticket: React.FC<{stub: string; title: string; sub: string; chips: string[]; art: string}> = ({stub, title, sub, chips, art}) => (
  <Card w={940} h={330} r={52} style={{display: 'flex', overflow: 'hidden', padding: 0}}>
    <div style={{width: 190, flex: 'none', background: `linear-gradient(160deg, ${W.pink}, ${W.orange})`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '6px dashed #fff'}}>
      <span style={{transform: 'rotate(-90deg)', display: 'inline-block'}}><Tx size={84} color="#fff">{stub}</Tx></span>
    </div>
    <div style={{flex: 1, padding: '30px 0 0 36px', display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{width: 20, height: 20, borderRadius: 10, background: W.red, boxShadow: `0 0 0 8px ${W.red}33`}} />
        <Tx size={30} color={W.red}>LIVE</Tx>
      </div>
      <Tx size={70} color={W.ink}>{title}</Tx>
      <Tx size={30} color={W.slate} w={400}>{sub}</Tx>
      <div style={{display: 'flex', gap: 10, marginTop: 20}}>
        {chips.map((c, i) => <div key={i} style={{padding: '6px 18px', borderRadius: 999, background: `${W.purple}18`}}><Tx size={26} color={W.purple}>{c}</Tx></div>)}
      </div>
    </div>
    <Img src={staticFile(art)} style={{position: 'absolute', right: -24, top: 44, width: 250, height: 250, borderRadius: 40, border: '6px solid #fff', boxShadow: '0 16px 34px rgba(76,48,170,0.3)', transform: 'rotate(7deg)'}} />
  </Card>
);
