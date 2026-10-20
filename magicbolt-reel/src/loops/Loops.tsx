// Eight square (1200x1200), transparent, seamlessly looping feature animations.
// Rendered to GIF from the "Gif-*" compositions in Root.tsx.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fontFamily} from '../components/kit';
import {Stars, Tx} from '../qr/kit';
import {AiBadge, Qr, StandImg} from '../qr/objects';
import {At, Av, Badge, Bar, Bubble, G, GName, GREEN, Magnifier, OL, Panel, PhoneF, Pin, Plane, Q, SH, Store, Twinks, useLoop} from './parts';

const Stage: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{fontFamily}}>{children}</AbsoluteFill>;

// A single outlined star
const Star: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <polygon points="50,6 62,36 95,38 69,59 78,92 50,73 22,92 31,59 5,38 38,36" fill={Q.yellow} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
  </svg>
);

// id → component, used by Root.tsx to register one composition per GIF
export const LOOPS: [string, React.FC][] = [];

// ---------- 1 · Review Booster ----------
export const ReviewBooster: React.FC = () => {
  const {osc, on} = useLoop();
  return (
    <Stage>
      <Twinks pts={[[130, 520, 80, Q.yellow], [1080, 820, 70, Q.pink], [170, 930, 60, Q.pink], [1060, 300, 64, Q.yellow]]} />
      <At x={600} y={740 + 12 * osc()} rot={1.5 * osc(1, 0.25)}><StandImg w={760} /></At>
      {[0, 1, 2, 3, 4].map((i) => {
        const big = 2 - Math.abs(i - 2);
        return (
          <At key={i} x={600 + (i - 2) * 172} y={250 - big * 44 + 8 * osc(2, i * 0.1)} rot={(i - 2) * 9} scale={on(0.06 + i * 0.09)}>
            <Star size={150 + big * 34} />
          </At>
        );
      })}
      <At x={1010} y={600 + 10 * osc(1, 0.4)} scale={0.92 + 0.08 * osc(2)}><AiBadge size={250} spin={14 * osc()} /></At>
    </Stage>
  );
};

// ---------- 2 · Smart Menu ----------
const FOOD: [string, string][] = [[Q.yellow, '#E2522B'], ['#FF9E57', '#3FA34D'], ['#F6C453', '#C2452D'], ['#FF8A5B', '#F4E04D']];
const Dish: React.FC<{i: number}> = ({i}) => {
  const [a, b] = FOOD[i % 4];
  return (
    <div style={{width: 156, height: 176, borderRadius: 24, border: `6px solid ${OL}`, boxSizing: 'border-box', background: '#fff', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative'}}>
      <div style={{height: 84, borderRadius: 16, background: '#F3EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={76} height={76} viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill={a} stroke={OL} strokeWidth={7} />{[[36, 38], [62, 44], [44, 64], [66, 68]].map(([x, y], j) => <circle key={j} cx={x} cy={y} r={8} fill={b} />)}</svg>
      </div>
      <Bar w="80%" h={14} /><Bar w="46%" h={14} c={Q.pink} />
      <div style={{position: 'absolute', right: 10, bottom: 10, width: 34, height: 34, borderRadius: '50%', background: Q.pink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={26} color="#fff" style={{lineHeight: 1}}>+</Tx></div>
    </div>
  );
};
export const SmartMenu: React.FC = () => {
  const {p, osc} = useLoop();
  const ROW = 190;
  return (
    <Stage>
      <Twinks pts={[[1090, 250, 70, Q.yellow], [120, 880, 64, Q.pink], [1100, 1040, 56, Q.pink]]} />
      <At x={190} y={430} rot={-14 + 8 * osc()}><Badge name="fork" size={190} color={Q.purple} /></At>
      <At x={500} y={600 + 8 * osc()} rot={-5}>
        <PhoneF>
          <div style={{height: 130, background: Q.pink, borderBottom: `6px solid ${OL}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14, boxSizing: 'border-box', position: 'relative', zIndex: 2}}>
            <Bar w={170} h={26} c="#fff" />
          </div>
          <div style={{padding: '18px 14px', transform: `translateY(${-2 * ROW * p}px)`}}>
            {[0, 1, 2, 3, 4, 5].map((r) => <div key={r} style={{display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 14}}><Dish i={r * 2} /><Dish i={r * 2 + 1} /></div>)}
          </div>
        </PhoneF>
      </At>
      <At x={900} y={800 + 10 * osc(1, 0.3)} rot={5 + 2 * osc(1, 0.5)}>
        <Panel w={330} h={440} r={44} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
          <svg width={110} height={84} viewBox="0 0 110 84"><path d="M12 62a43 43 0 0 1 86 0z" fill={Q.pink} stroke={OL} strokeWidth={7} strokeLinejoin="round" /><rect x="4" y="62" width="102" height="16" rx="8" fill={Q.pink} stroke={OL} strokeWidth={7} /><circle cx="55" cy="13" r="8" fill={Q.pink} stroke={OL} strokeWidth={6} /></svg>
          <Qr size={210} />
          <Bar w={170} h={24} c={Q.pink} />
        </Panel>
      </At>
    </Stage>
  );
};

// ---------- 3 · Smart Card (NFC) ----------
export const SmartCard: React.FC = () => {
  const {p, osc} = useLoop();
  const rows: GName[] = ['call', 'mail', 'pin', 'globe'];
  const orbit: [GName, string][] = [['chat', GREEN], ['call', '#2B7BFF'], ['mail', Q.pink]];
  return (
    <Stage>
      <Twinks pts={[[150, 300, 70, Q.yellow], [1060, 980, 64, Q.pink], [200, 1020, 56, Q.yellow]]} />
      <At x={600} y={610 + 12 * osc()} rot={-6 + 1.5 * osc(1, 0.25)}>
        <Panel w={760} h={500} r={56} bg={Q.purple} sh={18} style={{position: 'relative'}}>
          <div style={{position: 'absolute', left: 44, top: 40}}><Av size={170} bg={Q.yellow} /></div>
          <div style={{position: 'absolute', left: 44, top: 236, display: 'flex', flexDirection: 'column', gap: 14}}>
            {rows.map((g, i) => <div key={g} style={{display: 'flex', alignItems: 'center', gap: 16}}><div style={{width: 44, height: 44, borderRadius: 12, background: [Q.pink, '#2B7BFF', Q.yellow, '#8B7BE8'][i], display: 'flex', alignItems: 'center', justifyContent: 'center'}}><G name={g} size={26} /></div><Bar w={[230, 190, 250, 170][i]} h={18} c="#B9AFEA" /></div>)}
          </div>
          <div style={{position: 'absolute', right: 44, top: 40, padding: 14, borderRadius: 26, background: '#fff', border: `6px solid ${OL}`}}><Qr size={170} /></div>
          {/* NFC tap ripples */}
          <svg width={300} height={240} style={{position: 'absolute', right: 20, bottom: 0, overflow: 'visible'}}>
            {[0, 1, 2].map((j) => { const r = (p * 2 + j / 3) % 1; return <circle key={j} cx={150} cy={130} r={26 + 110 * r} fill="none" stroke={Q.pink} strokeWidth={10} opacity={1 - r} />; })}
            <circle cx={150} cy={130} r={26} fill={Q.pink} stroke="#fff" strokeWidth={8} />
          </svg>
        </Panel>
      </At>
      {orbit.map(([g, c], i) => {
        const a = Math.PI * 2 * (p + i / 3);
        return <At key={g} x={600 + 500 * Math.cos(a)} y={610 + 400 * Math.sin(a)} z={Math.sin(a) > 0 ? 3 : 0}><Badge name={g} size={150} color={c} /></At>;
      })}
    </Stage>
  );
};

// ---------- 4 · Bio Link ----------
export const BioLink: React.FC = () => {
  const {p, osc} = useLoop();
  const pills: [GName, string][] = [['cam', Q.purple], ['play', Q.pink], ['chat', Q.yellow], ['globe', Q.purple], ['mail', Q.pink]];
  const side: [GName, string][] = [['cam', Q.pink], ['play', '#EF4444'], ['chat', GREEN], ['globe', Q.purple]];
  const active = Math.floor(p * pills.length);
  const k = (p * pills.length) % 1;
  return (
    <Stage>
      <Twinks pts={[[1090, 300, 70, Q.yellow], [1060, 1030, 60, Q.pink], [330, 150, 56, Q.yellow]]} />
      {side.map(([g, c], i) => <At key={i} x={170 + (i % 2) * 60} y={300 + i * 210 + 14 * osc(1, i * 0.22)} rot={(i % 2 ? 8 : -8) + 3 * osc(1, i * 0.3)}><Badge name={g} size={140} color={c} square /></At>)}
      <At x={600} y={600 + 8 * osc()}>
        <PhoneF>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 62, gap: 12}}>
            <Av size={130} bg={Q.yellow} /><Bar w={170} h={18} c={OL} /><Bar w={110} h={12} />
            <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12}}>
              {pills.map(([g, c], i) => {
                const hit = i === active ? Math.sin(Math.PI * k) : 0;
                return (
                  <div key={i} style={{width: 310, height: 72, borderRadius: 36, background: c, border: `6px solid ${OL}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', transform: `scale(${1 + 0.1 * hit})`, position: 'relative', zIndex: hit > 0 ? 2 : 1}}>
                    <div style={{width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><G name={g} size={26} color={c === Q.yellow ? Q.ink : c} /></div>
                    <Bar w={130} h={14} c="#fff" />
                    <svg width={22} height={28} viewBox="0 0 22 28" style={{marginLeft: 'auto'}}><path d="M5 4l12 10L5 24" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                );
              })}
            </div>
          </div>
        </PhoneF>
      </At>
      <At x={1000} y={640 + 14 * osc(1, 0.3)} rot={-30 + 8 * osc()}>
        <svg width={260} height={420} viewBox="0 0 260 420">
          <rect x="60" y="190" width="140" height="210" rx="70" fill="none" stroke={OL} strokeWidth={62} /><rect x="60" y="190" width="140" height="210" rx="70" fill="none" stroke={Q.purple} strokeWidth={44} />
          <rect x="60" y="20" width="140" height="210" rx="70" fill="none" stroke={OL} strokeWidth={62} /><rect x="60" y="20" width="140" height="210" rx="70" fill="none" stroke={Q.pink} strokeWidth={44} />
          <path d="M60 300V260" stroke={OL} strokeWidth={62} /><path d="M60 310V250" stroke={Q.purple} strokeWidth={44} />
        </svg>
      </At>
    </Stage>
  );
};

// ---------- 5 · AEO + GEO ----------
export const AeoGeo: React.FC = () => {
  const {p, osc, on, fill} = useLoop();
  const blink = (p * 2) % 1 > 0.93 ? 0.15 : 1;
  return (
    <Stage>
      <Twinks pts={[[1100, 760, 70, Q.yellow], [120, 620, 60, Q.pink], [640, 1080, 56, Q.yellow]]} />
      <At x={250} y={300 + 16 * osc(1, 0.2)} rot={-10 + 6 * osc()}><Magnifier size={300}><svg width={110} height={110} viewBox="0 0 100 100"><path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill={Q.yellow} /></svg></Magnifier></At>
      {/* robot */}
      <At x={420} y={800 + 12 * osc()} rot={-4 + 2 * osc(1, 0.25)}>
        <div style={{position: 'relative', width: 480, height: 520}}>
          <div style={{position: 'absolute', left: 226, top: 0, width: 28, height: 80, background: OL}} />
          <div style={{position: 'absolute', left: 204, top: -36, width: 72, height: 72, borderRadius: '50%', background: Q.pink, border: `8px solid ${OL}`, boxSizing: 'border-box', transform: `scale(${0.85 + 0.15 * Math.abs(osc(2))})`}} />
          {[0, 388].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 150, width: 92, height: 150, borderRadius: 40, background: Q.purple, border: `8px solid ${OL}`, boxSizing: 'border-box'}} />)}
          <Panel w={400} h={320} r={120} sh={0} style={{position: 'absolute', left: 40, top: 66, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 300, height: 190, borderRadius: 80, background: OL, position: 'relative'}}>
              {[72, 188].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 54, width: 44, height: 56 * blink, borderRadius: 22, background: Q.pink, transform: `translateY(${(1 - blink) * 28}px)`}} />)}
              <svg width={110} height={50} viewBox="0 0 110 50" style={{position: 'absolute', left: 95, top: 124}}><path d="M10 8q45 44 90 0" fill="none" stroke={Q.pink} strokeWidth={12} strokeLinecap="round" /></svg>
            </div>
          </Panel>
          <Panel w={250} h={150} r={60} bg={Q.purple} sh={0} style={{position: 'absolute', left: 115, top: 370, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 54, height: 54, borderRadius: '50%', background: Q.yellow, border: `7px solid ${OL}`, boxSizing: 'border-box'}} />
          </Panel>
        </div>
      </At>
      {/* recommendation bubble */}
      <At x={830} y={440 + 10 * osc(1, 0.35)} scale={0.97 + 0.03 * osc(2)}>
        <Bubble w={500} h={400}>
          <div style={{position: 'relative'}}>
            <Store w={230} />
            <div style={{position: 'absolute', right: -74, top: -30, width: 110, height: 110, borderRadius: '50%', background: Q.pink, border: `8px solid ${OL}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on(0.55)})`}}>
              <svg width={60} height={60} viewBox="0 0 60 60"><polyline points="13,31 26,44 48,18" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
          <div style={{marginTop: 10}}><Stars n={5 * fill(0.12, 0.4)} size={66} empty="#CFC8EA" /></div>
        </Bubble>
      </At>
    </Stage>
  );
};

// ---------- 6 · WhatsApp API CRM ----------
const PEOPLE = ['#FFB3C7', '#9BD3FF', Q.yellow, '#C9B8FF', '#FFC48A', '#A8E6B0', '#FFB3C7', '#9BD3FF', Q.yellow];
export const WhatsappCrm: React.FC = () => {
  const {p, osc, on} = useLoop();
  const [cx, cy, R] = [600, 800, 470];
  const pts = PEOPLE.map((c, i) => { const a = Math.PI * (1.06 - (1.12 * i) / (PEOPLE.length - 1)); return {c, x: cx + R * Math.cos(a), y: cy - R * Math.sin(a) * 0.98}; });
  const fa = Math.PI * (1.06 - 1.12 * p);
  return (
    <Stage>
      <Twinks pts={[[160, 1060, 64, Q.yellow], [1050, 1060, 60, Q.pink]]} />
      <svg width={1200} height={1200} style={{position: 'absolute', left: 0, top: 0}}>
        {pts.map((q, i) => <line key={i} x1={cx} y1={cy} x2={q.x} y2={q.y} stroke={GREEN} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={-p * 120} />)}
      </svg>
      {pts.map((q, i) => (
        <React.Fragment key={i}>
          <At x={q.x} y={q.y + 6 * osc(1, i * 0.11)}><Av size={126} bg={q.c} hair={i % 3 === 1 ? '#7A4A2A' : OL} /></At>
          <At x={q.x + 46} y={q.y - 78} scale={on(0.08 + i * 0.075)}>
            <svg width={84} height={72} viewBox="0 0 84 72"><path d="M14 6h56a10 10 0 0 1 10 10v24a10 10 0 0 1-10 10H34L16 66V50h-2A10 10 0 0 1 4 40V16A10 10 0 0 1 14 6z" fill={GREEN} stroke={OL} strokeWidth={6} strokeLinejoin="round" /><path d="M20 22h44M20 34h28" stroke="#fff" strokeWidth={7} strokeLinecap="round" /></svg>
          </At>
        </React.Fragment>
      ))}
      <At x={cx} y={cy + 10 * osc()} scale={0.96 + 0.04 * osc(2)}>
        <svg width={380} height={380} viewBox="0 0 380 380">
          <path d="M190 24a160 160 0 1 1-84 296L34 346l28-70A160 160 0 0 1 190 24z" fill={GREEN} stroke={OL} strokeWidth={12} strokeLinejoin="round" />
          <path d="M136 108c-12 0-24 12-24 24c0 60 48 108 108 108c12 0 24-12 24-24l-30-22l-20 16c-18-8-32-22-40-40l16-20z" fill="#fff" />
        </svg>
      </At>
      <At x={cx + 290 * Math.cos(fa)} y={cy - 290 * Math.sin(fa)} rot={-(fa * 180) / Math.PI + 45 + 90} scale={Math.sin(Math.PI * p)}><Plane size={150} /></At>
    </Stage>
  );
};

// ---------- 7 · Social Planner ----------
export const SocialPlanner: React.FC = () => {
  const {p, osc, on} = useLoop();
  const posts: [number, GName, string][] = [[0, 'img', Q.pink], [5, 'play', '#2B7BFF'], [2, 'heart', Q.yellow], [7, 'img', Q.purple], [9, 'play', GREEN]];
  return (
    <Stage>
      <Twinks pts={[[130, 260, 70, Q.yellow], [1090, 560, 60, Q.pink], [560, 1110, 56, Q.yellow]]} />
      <At x={620} y={650 + 8 * osc()} rot={-3}>
        <Panel w={700} h={640} r={50} sh={18} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 130, flexShrink: 0, background: Q.purple, borderBottom: `8px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 70px'}}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{width: 44, height: 44, borderRadius: '50%', background: '#fff', border: `7px solid ${OL}`, boxSizing: 'border-box'}} />)}
          </div>
          <div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, padding: 26}}>
            {Array.from({length: 12}, (_, i) => {
              const post = posts.findIndex((q) => q[0] === i);
              return (
                <div key={i} style={{borderRadius: 22, background: '#EFEAFB', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {post >= 0 && <div style={{transform: `scale(${on(0.08 + post * 0.14)})`}}><Badge name={posts[post][1]} size={120} color={posts[post][2]} square /></div>}
                </div>
              );
            })}
          </div>
        </Panel>
      </At>
      {/* megaphone */}
      <At x={240} y={810} rot={-12 + 6 * osc(2)}>
        <svg width={320} height={280} viewBox="0 0 320 280" style={{overflow: 'visible'}}>
          <path d="M40 110h60l130-70v200l-130-70H40a20 20 0 0 1-20-20v-20a20 20 0 0 1 20-20z" fill={Q.pink} stroke={OL} strokeWidth={10} strokeLinejoin="round" />
          <rect x="226" y="24" width="34" height="232" rx="17" fill="#fff" stroke={OL} strokeWidth={10} />
          <path d="M60 170l14 78h44l-12-78z" fill={Q.purple} stroke={OL} strokeWidth={10} strokeLinejoin="round" />
          {[0, 1].map((j) => { const r = (p * 2 + j / 2) % 1; return <path key={j} d={`M${280 + 50 * r} ${80 - 20 * r}q${30 + 20 * r} 60 0 ${120 + 40 * r}`} fill="none" stroke={Q.yellow} strokeWidth={14} strokeLinecap="round" opacity={1 - r} />; })}
        </svg>
      </At>
      {/* clock: the hand makes exactly one turn per loop */}
      <At x={1010} y={950 + 8 * osc(1, 0.3)}>
        <svg width={240} height={240} viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="104" fill="#fff" stroke={OL} strokeWidth={12} /><circle cx="120" cy="120" r="88" fill="none" stroke={Q.yellow} strokeWidth={16} />
          <path d="M120 120V62" stroke={OL} strokeWidth={12} strokeLinecap="round" transform={`rotate(${p * 360} 120 120)`} />
          <path d="M120 120h36" stroke={Q.pink} strokeWidth={12} strokeLinecap="round" transform={`rotate(${p * 360 * 2} 120 120)`} />
          <circle cx="120" cy="120" r="12" fill={OL} />
        </svg>
      </At>
      <At x={760 + 340 * p} y={330 - 200 * Math.sin(Math.PI * p)} rot={-20 + 50 * p} scale={Math.sin(Math.PI * p)}><Plane size={170} /></At>
      <At x={470} y={200 + 12 * osc(1, 0.1)} rot={-8}><Badge name="heart" size={130} color={Q.pink} square /></At>
      <At x={640} y={170 + 12 * osc(1, 0.4)} rot={8}><Badge name="chat" size={120} color={Q.purple} square /></At>
    </Stage>
  );
};

// ---------- 8 · Google Profile growth ----------
export const ProfileGrowth: React.FC = () => {
  const {osc, fill} = useLoop();
  const hop = Math.abs(osc(1));
  return (
    <Stage>
      <Twinks pts={[[130, 620, 70, Q.yellow], [1090, 380, 60, Q.pink], [1060, 1080, 56, Q.yellow]]} />
      {/* platform */}
      <At x={600} y={1010}>
        <svg width={900} height={260} viewBox="0 0 900 260">
          <ellipse cx="450" cy="150" rx="430" ry="96" fill={Q.purple} stroke={OL} strokeWidth={10} />
          <ellipse cx="450" cy="118" rx="430" ry="96" fill="#fff" stroke={OL} strokeWidth={10} />
          <defs><clipPath id="platTop"><ellipse cx="450" cy="118" rx="420" ry="88" /></clipPath></defs>
          <g clipPath="url(#platTop)"><path d="M150 110l150-40l90 60l-160 40z" fill="#A8E6B0" /><path d="M430 60l170-10l60 60l-200 20z" fill="#9BD3FF" /><path d="M620 130l140-30l40 40l-150 40z" fill="#A8E6B0" /></g>
        </svg>
      </At>
      {/* bars */}
      {[0, 1, 2, 3].map((i) => {
        const h = [200, 290, 380, 470][i] * (0.78 + 0.22 * osc(1, -i * 0.08));
        return <div key={i} style={{position: 'absolute', left: 620 + i * 104, top: 800 - h, width: 84, height: h, borderRadius: '18px 18px 0 0', background: i === 3 ? Q.purple : '#8B7BE8', border: `8px solid ${OL}`, boxSizing: 'border-box'}} />;
      })}
      {/* growth arrow */}
      <At x={830} y={300 + 12 * osc(1, 0.2)} rot={4 * osc()}>
        <svg width={520} height={300} viewBox="0 0 520 300" style={{overflow: 'visible'}}>
          <path d="M20 270C160 250 330 190 440 70" fill="none" stroke={OL} strokeWidth={50} strokeLinecap="round" /><path d="M370 40l110-10l-10 112z" fill={OL} stroke={OL} strokeWidth={26} strokeLinejoin="round" />
          <path d="M20 270C160 250 330 190 440 70" fill="none" stroke={Q.yellow} strokeWidth={30} strokeLinecap="round" /><path d="M370 40l110-10l-10 112z" fill={Q.yellow} stroke={Q.yellow} strokeWidth={8} strokeLinejoin="round" />
        </svg>
      </At>
      <At x={240} y={330 + 14 * osc(1, 0.3)} rot={-8 + 6 * osc()}><Magnifier size={300} /></At>
      {/* shop card */}
      <At x={800} y={840 + 8 * osc(1, 0.15)} rot={3}>
        <Panel w={430} h={330} r={40} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8}}>
          <Store w={200} />
          <Stars n={5 * fill(0.1, 0.45)} size={58} empty="#CFC8EA" />
        </Panel>
      </At>
      {/* pin hops, with a shadow that shrinks as it rises */}
      <At x={380} y={985}><div style={{width: 150 - 60 * hop, height: 34 - 12 * hop, borderRadius: '50%', background: SH}} /></At>
      <At x={380} y={760 - 70 * hop} rot={3 * osc(2)}><Pin size={300} /></At>
    </Stage>
  );
};

LOOPS.push(
  ['Gif-ReviewBooster', ReviewBooster],
  ['Gif-SmartMenu', SmartMenu],
  ['Gif-SmartCard', SmartCard],
  ['Gif-BioLink', BioLink],
  ['Gif-AeoGeo', AeoGeo],
  ['Gif-WhatsappCrm', WhatsappCrm],
  ['Gif-SocialPlanner', SocialPlanner],
  ['Gif-ProfileGrowth', ProfileGrowth],
);
