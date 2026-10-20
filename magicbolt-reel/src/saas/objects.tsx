// "Sell SaaS" reel objects: Instagram post, price tag, glossy 3D faces, chat bubble, browser + dashboard,
// glossy app icons, code editor, calendar, invoice, check/cross marks, buttons
import React from 'react';
import {useT, P, eo, eb, lerp} from '../components/kit';
import {FeatIcon, M} from './config';
import {Gloss, Tx} from './kit';

export const SHADOW = '0 26px 60px rgba(30,40,110,0.18), 0 4px 12px rgba(30,40,110,0.08)';

const igGrad = (deg = 45) => `linear-gradient(${deg}deg, ${M.ig.join(', ')})`;

// ---------- Instagram-style post card (w x 1.25w) ----------
const POST_ART: [string, string][] = [['#FFB86B', '#ED1C6F'], ['#7DD3FC', '#7B3FF2'], ['#FDE68A', '#F7941D']];
export const IgPost: React.FC<{w: number; v?: number; likes?: number}> = ({w, v = 0, likes}) => {
  const [a, b] = POST_ART[v % POST_ART.length];
  const u = w / 100;
  return (
    <div style={{position: 'relative', width: w, height: w * 1.28, borderRadius: 7 * u, background: '#fff', boxShadow: SHADOW, overflow: 'hidden', border: `${0.6 * u}px solid ${M.line}`, boxSizing: 'border-box'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 3 * u, padding: `${4 * u}px ${5 * u}px`}}>
        <div style={{width: 11 * u, height: 11 * u, borderRadius: '50%', background: igGrad(), padding: 1.2 * u, boxSizing: 'border-box'}}>
          <div style={{width: '100%', height: '100%', borderRadius: '50%', background: `linear-gradient(145deg, ${M.blue}, ${M.purple})`, border: `${0.9 * u}px solid #fff`, boxSizing: 'border-box'}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{width: 34 * u, height: 3 * u, borderRadius: 2 * u, background: M.ink, opacity: 0.8}} />
          <div style={{width: 22 * u, height: 2.4 * u, borderRadius: 2 * u, background: M.line, marginTop: 1.6 * u}} />
        </div>
        <Tx size={6 * u} color={M.slate}>•••</Tx>
      </div>
      <div style={{position: 'relative', height: w * 0.86, background: `linear-gradient(160deg, ${a}, ${b})`, overflow: 'hidden'}}>
        <svg width="100%" height="100%" viewBox="0 0 100 86" preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}>
          <circle cx="72" cy="24" r="10" fill="#fff" opacity={0.9} />
          <path d="M-5 86L30 40l22 26 14-14 40 34z" fill="#fff" opacity={0.35} />
          <path d="M-5 86L22 56l18 18 16-12 50 24z" fill="#fff" opacity={0.55} />
        </svg>
        <Gloss h="40%" a={0.25} />
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 4 * u, padding: `${3.4 * u}px ${5 * u}px`}}>
        <svg width={9 * u} height={9 * u} viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" fill={M.pink} /></svg>
        <svg width={9 * u} height={9 * u} viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 1 3 6.2L3 20l1.4-4A8 8 0 0 1 4 12z" fill="none" stroke={M.ink} strokeWidth={2.2} strokeLinejoin="round" /></svg>
        <svg width={9 * u} height={9 * u} viewBox="0 0 24 24"><path d="M3 11L21 3l-7 18-3-7z" fill="none" stroke={M.ink} strokeWidth={2.2} strokeLinejoin="round" /></svg>
        {likes != null && <Tx size={5.4 * u} color={M.ink} style={{marginLeft: 'auto'}}>{likes} likes</Tx>}
      </div>
    </div>
  );
};

// ---------- glossy price tag ----------
export const PriceTag: React.FC<{w: number; text: string; c1?: string; c2?: string; color?: string}> = ({w, text, c1 = '#FFE27A', c2 = M.gold, color = M.navy}) => {
  const h = w * 0.42;
  return (
    <div style={{position: 'relative', width: w, height: h, filter: `drop-shadow(0 18px 26px ${c2}77)`}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `polygon(${h * 0.5}px 0, 100% 0, 100% 100%, ${h * 0.5}px 100%, 0 50%)`, borderRadius: h * 0.16, background: `linear-gradient(180deg, ${c1}, ${c2})`, overflow: 'hidden'}}>
        <Gloss />
      </div>
      <div style={{position: 'absolute', left: h * 0.3, top: h * 0.4, width: h * 0.2, height: h * 0.2, borderRadius: '50%', background: '#fff', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25)'}} />
      <div style={{position: 'absolute', left: h * 0.62, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Tx size={h * 0.46} color={color}>{text}</Tx>
      </div>
    </div>
  );
};

// ---------- glossy 3D face (emoji-style character, drawn) ----------
export const Face: React.FC<{size: number; mood: 'bored' | 'wow'}> = ({size, mood}) => {
  const t = useT();
  const blink = mood === 'wow' && (t % 2.6) > 2.45 ? 0.15 : 1;
  return (
    <div style={{position: 'relative', width: size, height: size, borderRadius: '50%',
      background: 'radial-gradient(circle at 36% 30%, #FFF7CC 0%, #FFD84A 32%, #FDC60B 55%, #F39A1B 100%)',
      boxShadow: `0 ${size * 0.1}px ${size * 0.2}px rgba(247,148,29,0.4), inset 0 -${size * 0.06}px ${size * 0.12}px rgba(214,110,10,0.45)`}}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
        {mood === 'bored' ? (
          <>
            {/* one raised brow, one flat */}
            <path d="M24 30q9-6 18-2" stroke="#7A3E06" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M58 32h18" stroke="#7A3E06" strokeWidth="3.4" strokeLinecap="round" />
            {/* half-lidded eyes, looking up and away */}
            {[33, 67].map((cx) => (
              <g key={cx}>
                <ellipse cx={cx} cy="46" rx="10" ry="8" fill="#fff" />
                <circle cx={cx + 4} cy="44.5" r="4.2" fill="#3B2410" />
                <path d={`M${cx - 11} 46a11 9 0 0 1 22 0z`} fill="#F2B21C" />
                <path d={`M${cx - 11} 46h22`} stroke="#7A3E06" strokeWidth="2.6" strokeLinecap="round" />
              </g>
            ))}
            {/* flat, sideways mouth */}
            <path d="M38 72q10 -3 24 1" stroke="#7A3E06" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M22 24q10-9 20-3M58 21q10-6 20 3" stroke="#7A3E06" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            {[33, 67].map((cx) => (
              <g key={cx} transform={`translate(${cx} 42) scale(1 ${blink}) translate(${-cx} -42)`}>
                <ellipse cx={cx} cy="42" rx="11" ry="12.5" fill="#fff" />
                <circle cx={cx} cy="43" r="6.6" fill="#3B2410" />
                <circle cx={cx - 2.4} cy="40" r="2.4" fill="#fff" />
              </g>
            ))}
            <circle cx="20" cy="62" r="7" fill={M.pink} opacity={0.35} />
            <circle cx="80" cy="62" r="7" fill={M.pink} opacity={0.35} />
            <ellipse cx="50" cy="72" rx="10" ry="12" fill="#5A2A0A" />
            <ellipse cx="50" cy="78" rx="6.5" ry="4.5" fill="#F06A6A" />
          </>
        )}
        <ellipse cx="34" cy="17" rx="16" ry="7" fill="#fff" opacity={0.45} transform="rotate(-20 34 17)" />
      </svg>
    </div>
  );
};

// ---------- chat bubble (tail at the left) ----------
export const Bubble: React.FC<{size: number; bg?: string; color?: string; children?: React.ReactNode}> = ({size, bg = '#fff', color = M.ink, children}) => (
  <div style={{position: 'relative', display: 'inline-block', padding: `${size * 0.42}px ${size * 0.62}px`, borderRadius: size * 0.7, borderBottomLeftRadius: size * 0.16, background: bg, boxShadow: SHADOW, border: bg === '#fff' ? `3px solid ${M.line}` : undefined}}>
    <Tx size={size} color={color}>{children}</Tx>
  </div>
);
export const Typing: React.FC<{size?: number}> = ({size = 22}) => {
  const t = useT();
  return (
    <div style={{display: 'inline-flex', gap: size * 0.5, padding: `${size * 0.9}px ${size * 1.2}px`, borderRadius: size * 2, borderBottomLeftRadius: size * 0.4, background: '#fff', boxShadow: SHADOW, border: `3px solid ${M.line}`}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: size, height: size, borderRadius: '50%', background: M.slate, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9))}} />)}
    </div>
  );
};

// ---------- glossy app icons ----------
const ICON_COL: Record<FeatIcon | 'code' | 'rocket', [string, string]> = {
  post: ['#FF7AB6', M.pink], pin: ['#6FB6FF', M.deep], star: ['#FFE07A', M.orange], chart: ['#7CE3A4', M.green], code: ['#9AA6C8', '#3B4670'], rocket: ['#B794FF', M.purple],
};
export const Glyph: React.FC<{icon: FeatIcon | 'code' | 'rocket'; size: number; color?: string}> = ({icon, size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {icon === 'post' && <><rect x="14" y="18" width="72" height="64" rx="12" fill="none" stroke={color} strokeWidth="9" /><circle cx="64" cy="38" r="7" fill={color} /><path d="M18 76l22-24 14 14 10-8 20 18z" fill={color} /></>}
    {icon === 'pin' && <><path d="M50 92C34 72 20 58 20 40a30 30 0 0 1 60 0c0 18-14 32-30 52z" fill={color} /><circle cx="50" cy="40" r="11" fill={ICON_COL.pin[1]} /></>}
    {icon === 'star' && <path d="M50 8l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z" fill={color} strokeLinejoin="round" />}
    {icon === 'chart' && <><rect x="14" y="56" width="16" height="30" rx="4" fill={color} /><rect x="42" y="40" width="16" height="46" rx="4" fill={color} /><rect x="70" y="22" width="16" height="64" rx="4" fill={color} /><path d="M12 40L40 18l14 10 30-20" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} /></>}
    {icon === 'code' && <path d="M36 26L12 50l24 24M64 26l24 24-24 24M56 18L44 82" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    {icon === 'rocket' && <><path d="M50 8c18 12 24 34 18 56H32C26 42 32 20 50 8z" fill={color} /><circle cx="50" cy="38" r="9" fill={ICON_COL.rocket[1]} /><path d="M32 52L18 70l16-2zM68 52l14 18-16-2z" fill={color} /><path d="M40 70h20l-10 22z" fill={M.gold} /></>}
  </svg>
);
export const AppIcon: React.FC<{icon: FeatIcon | 'code' | 'rocket'; size: number}> = ({icon, size}) => {
  const [a, b] = ICON_COL[icon];
  return (
    <div style={{position: 'relative', width: size, height: size, borderRadius: size * 0.28, background: `linear-gradient(145deg, ${a}, ${b})`, boxShadow: `0 ${size * 0.14}px ${size * 0.3}px ${b}66, inset 0 ${size * 0.03}px 0 rgba(255,255,255,0.5)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0}}>
      <Glyph icon={icon} size={size * 0.58} />
      <Gloss />
    </div>
  );
};

// ---------- browser window ----------
export const Browser: React.FC<{w: number; h: number; url: string; urlK?: number; children?: React.ReactNode}> = ({w, h, url, urlK = 1, children}) => {
  const shown = url.slice(0, Math.round(url.length * urlK));
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: 34, background: '#fff', boxShadow: SHADOW, border: `3px solid ${M.line}`, overflow: 'hidden', boxSizing: 'border-box'}}>
      <div style={{height: 78, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', background: '#F5F6FC', borderBottom: `3px solid ${M.line}`}}>
        {['#FF6159', '#FFBD2E', '#28C941'].map((c) => <div key={c} style={{width: 20, height: 20, borderRadius: '50%', background: c}} />)}
        <div style={{flex: 1, marginLeft: 14, height: 46, borderRadius: 23, background: '#fff', border: `2px solid ${M.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px'}}>
          <svg width={22} height={26} viewBox="0 0 22 26"><rect x="2" y="11" width="18" height="13" rx="3" fill={M.green} /><path d="M6 11V8a5 5 0 0 1 10 0v3" stroke={M.green} strokeWidth="3" fill="none" /></svg>
          <Tx size={26} color={M.ink} w={400}>{shown}</Tx>
          {urlK < 1 && <span style={{width: 3, height: 30, background: M.blue}} />}
        </div>
      </div>
      <div style={{position: 'relative', height: h - 78}}>{children}</div>
    </div>
  );
};

// ---------- "Your Agency" brand chip ----------
export const BrandMark: React.FC<{size: number; name: string}> = ({size, name}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.3}}>
    <div style={{position: 'relative', width: size, height: size, borderRadius: size * 0.3, background: `linear-gradient(145deg, ${M.pink}, ${M.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: `0 8px 18px ${M.purple}55`}}>
      <Tx size={size * 0.56} color="#fff">{name[0]}</Tx><Gloss />
    </div>
    <Tx size={size * 0.5} color={M.navy}>{name}</Tx>
  </div>
);

// ---------- dashboard body (fills a Browser). k: 0→1 grows the numbers and charts ----------
const BARS = [0.42, 0.58, 0.5, 0.72, 0.66, 0.88, 1];
export const Dash: React.FC<{w: number; h: number; brand: string; k: number}> = ({w, h, brand, k}) => {
  const t = useT();
  const side = w * 0.26;
  const kpis: [string, number, string, string][] = [['Posts', 128, M.pink, ''], ['Reviews', 4.9, M.orange, '★'], ['Leads', 342, M.green, '']];
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex'}}>
      <div style={{width: side, background: '#F7F7FD', borderRight: `2px solid ${M.line}`, padding: '24px 18px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20}}>
        <BrandMark size={44} name={brand.split(' ')[0]} />
        {['post', 'pin', 'star', 'chart'].map((ic, i) => (
          <div key={ic} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: i === 0 ? '#fff' : 'transparent', boxShadow: i === 0 ? SHADOW : undefined}}>
            <AppIcon icon={ic as FeatIcon} size={36} />
            <div style={{flex: 1, height: 10, borderRadius: 5, background: M.line}} />
          </div>
        ))}
      </div>
      <div style={{flex: 1, padding: 26, display: 'flex', flexDirection: 'column', gap: 22}}>
        <div style={{display: 'flex', gap: 16}}>
          {kpis.map(([label, n, c, suf], i) => {
            const v = n * eo(P(k, i * 0.1, 0.7));
            return (
              <div key={label} style={{flex: 1, borderRadius: 20, padding: '14px 16px', background: `${c}12`, border: `2px solid ${c}33`}}>
                <Tx size={22} color={M.slate} w={400}>{label}</Tx><br />
                <Tx size={40} color={M.navy}>{n % 1 ? v.toFixed(1) : Math.round(v)}{suf && <span style={{color: c}}> {suf}</span>}</Tx>
              </div>
            );
          })}
        </div>
        <div style={{flex: 1, borderRadius: 22, border: `2px solid ${M.line}`, padding: '18px 22px', display: 'flex', alignItems: 'flex-end', gap: 16, position: 'relative'}}>
          {BARS.map((b, i) => {
            const g = eb(P(k, 0.15 + i * 0.07, 0.5), 1.4);
            return <div key={i} style={{position: 'relative', flex: 1, height: `${Math.max(0, b * g) * 88}%`, borderRadius: 12, background: `linear-gradient(180deg, ${i === BARS.length - 1 ? M.gold : M.blue}, ${i === BARS.length - 1 ? M.orange : M.deep})`, overflow: 'hidden'}}><Gloss a={0.35} /></div>;
          })}
          <div style={{position: 'absolute', right: 20, top: 14, padding: '6px 14px', borderRadius: 999, background: `${M.green}18`, opacity: eo(P(k, 0.7, 0.3))}}>
            <Tx size={22} color={M.green}>▲ {Math.round(38 * eo(P(k, 0.7, 0.3)))}%</Tx>
          </div>
        </div>
        <div style={{height: 10, borderRadius: 5, background: M.line, overflow: 'hidden'}}>
          <div style={{width: `${((t * 30) % 140) - 20}%`, height: '100%', background: `linear-gradient(90deg, ${M.blue}, ${M.gold})`, opacity: 0.6}} />
        </div>
      </div>
    </div>
  );
};

// ---------- code editor (dark) ----------
const CODE: [number, string, number][] = [ // indent, colour, width %
  [0, '#C792EA', 42], [1, '#82AAFF', 62], [2, '#C3E88D', 48], [2, '#F78C6C', 70], [1, '#82AAFF', 30], [1, '#FFCB6B', 56], [2, '#C3E88D', 64], [0, '#C792EA', 22], [0, '#89DDFF', 50], [1, '#F78C6C', 38],
];
export const CodeWin: React.FC<{w: number; k: number}> = ({w, k}) => {
  const n = k * CODE.length;
  return (
    <div style={{position: 'relative', width: w, borderRadius: 30, background: 'linear-gradient(170deg, #1E2547, #0F1430)', boxShadow: '0 30px 70px rgba(15,20,48,0.45)', overflow: 'hidden', padding: '0 0 30px'}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', background: 'rgba(255,255,255,0.06)'}}>
        {['#FF6159', '#FFBD2E', '#28C941'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: '50%', background: c}} />)}
        <Tx size={24} color="#8A93B8" w={400} style={{marginLeft: 16}}>app.tsx</Tx>
      </div>
      <div style={{padding: '24px 30px 0', display: 'flex', flexDirection: 'column', gap: 18}}>
        {CODE.map(([ind, c, wd], i) => {
          const f = Math.max(0, Math.min(1, n - i));
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <Tx size={22} color="#4B5378" w={400} style={{width: 30, textAlign: 'right'}}>{i + 1}</Tx>
              <div style={{marginLeft: ind * 40, width: `${wd * f}%`, height: 18, borderRadius: 9, background: c, opacity: 0.9}} />
            </div>
          );
        })}
      </div>
      <Gloss h="30%" a={0.08} />
    </div>
  );
};

// ---------- glossy calendar page ----------
export const Calendar: React.FC<{size: number; big: string; small: string}> = ({size, big, small}) => (
  <div style={{position: 'relative', width: size, height: size * 1.05, borderRadius: size * 0.16, background: '#fff', boxShadow: SHADOW, overflow: 'hidden', border: `3px solid ${M.line}`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
    <div style={{position: 'relative', height: size * 0.28, background: `linear-gradient(180deg, #FF7A9E, ${M.pink})`, overflow: 'hidden'}}><Gloss /></div>
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: -size * 0.04}}>
      <Tx size={size * 0.4} color={M.navy}>{big}</Tx>
      <Tx size={size * 0.13} color={M.slate}>{small}</Tx>
    </div>
    {[0.3, 0.7].map((x) => <div key={x} style={{position: 'absolute', left: size * x - size * 0.04, top: -size * 0.02, width: size * 0.08, height: size * 0.14, borderRadius: size * 0.04, background: 'linear-gradient(180deg, #E6E8F2, #A7ADC6)'}} />)}
  </div>
);

// ---------- invoice card ----------
export const Invoice: React.FC<{w: number; month: string; on: number; paid: number}> = ({w, month, on, paid}) => (
  <div style={{position: 'relative', width: w, borderRadius: 32, background: '#fff', boxShadow: SHADOW, border: `3px solid ${M.line}`, padding: '28px 32px', boxSizing: 'border-box'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <BrandMark size={50} name="Your Agency" />
    </div>
    <div style={{marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
      <Tx size={30} color={M.slate} w={400}>SaaS plan · {month}</Tx>
    </div>
    <div style={{marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <Tx size={32} color={M.navy}>Auto-renew</Tx>
      <div style={{width: 96, height: 54, borderRadius: 27, background: on > 0.5 ? M.green : '#CBD0E0', position: 'relative', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)'}}>
        <div style={{position: 'absolute', top: 5, left: lerp(5, 47, eo(on)), width: 44, height: 44, borderRadius: '50%', background: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,0.25)'}} />
      </div>
    </div>
    {paid > 0 && (
      <div style={{position: 'absolute', right: -24, top: -34, transform: `rotate(12deg) scale(${eb(paid, 2.6)})`, padding: '10px 26px', borderRadius: 16, border: `5px solid ${M.green}`, background: '#ECFDF3'}}>
        <Tx size={40} color={M.green}>PAID ✓</Tx>
      </div>
    )}
  </div>
);

// ---------- glossy round marks ----------
export const Mark: React.FC<{ok: boolean; size: number}> = ({ok, size}) => {
  const [a, b] = ok ? ['#5EE08F', M.green] : ['#FF8A8A', M.red];
  return (
    <div style={{position: 'relative', width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${a}, ${b} 70%)`, boxShadow: `0 ${size * 0.14}px ${size * 0.3}px ${b}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0}}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 100 100">
        {ok ? <path d="M18 54l22 22 44-48" stroke="#fff" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M24 24l52 52M76 24L24 76" stroke="#fff" strokeWidth="16" strokeLinecap="round" />}
      </svg>
      <Gloss />
    </div>
  );
};

// ---------- glossy pill button / badge ----------
export const GPill: React.FC<{size: number; c1: string; c2: string; color?: string; press?: number; padX?: number; children?: React.ReactNode}> = ({size, c1, c2, color = '#fff', press = 0, padX = 0.9, children}) => (
  <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: size * 0.3, padding: `${size * 0.36}px ${size * padX}px`, borderRadius: 999, background: `linear-gradient(180deg, ${c1}, ${c2})`,
    boxShadow: `0 ${size * 0.35 * (1 - press * 0.6)}px ${size * 0.7}px ${c2}66, inset 0 3px 0 rgba(255,255,255,0.45)`, transform: `scale(${1 - 0.06 * press})`, overflow: 'hidden'}}>
    <Tx size={size} color={color}>{children}</Tx>
    <Gloss />
  </div>
);

// Red strike line drawn across something (k: 0→1)
export const Strike: React.FC<{w: number; k: number; color?: string; h?: number}> = ({w, k, color = M.red, h = 14}) => (
  <div style={{position: 'absolute', left: '50%', top: '50%', width: w * eo(k), height: h, marginLeft: -w / 2, marginTop: -h / 2, borderRadius: h, background: color, transform: 'rotate(-6deg)', transformOrigin: '0 50%', boxShadow: `0 6px 16px ${color}66`}} />
);
