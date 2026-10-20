// Glossy feature loops 7–12 (1200x1200, 4 s, seamless)
import React from 'react';
import {Stars} from '../qr/kit';
import {At, BoltIcon, Bot, Card, Chip, Confetti, Face, Floor, G, GName, Gear, Glints, GREEN, Icon, INK, Msg, Phone, Stage, Tick, Toast, Tx, dark, lite, useLoop} from './parts';

const cl = (x: number) => Math.max(0, Math.min(1, x));
const SLATE = '#6B6788';
const FB = '#1877F2';
const IG = 'linear-gradient(45deg, #FFC61A, #F0428D 50%, #6B2FE0)';

const Thumb: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><rect x="8" y="44" width="20" height="46" rx="6" fill="#fff" /><path d="M34 46h8l14-32c9 0 13 7 11 15l-4 15h20c7 0 11 6 9 13l-8 25c-2 5-6 8-11 8H34z" fill="#fff" /></svg>
);
// Reactions drifting upward
const Rising: React.FC<{x: number; kinds: ('like' | 'heart')[]}> = ({x, kinds}) => {
  const {p} = useLoop();
  return (
    <>
      {kinds.map((kind, i) => {
        const r = (p + i / kinds.length) % 1;
        return (
          <At key={i} x={x + 40 * Math.sin(r * 9 + i)} y={960 - 700 * r} scale={Math.sin(Math.PI * r) * 1.1} rot={12 * Math.sin(r * 7 + i)}>
            <Chip w={116} h={116} r={58} c={kind === 'like' ? FB : '#F0428D'} depth={9}>{kind === 'like' ? <Thumb size={64} /> : <G name="heart" size={62} />}</Chip>
          </At>
        );
      })}
    </>
  );
};
const Gears: React.FC<{a: string; b: string}> = ({a, b}) => {
  const {p} = useLoop();
  return (<><At x={215} y={870}><Gear size={240} c={a} rot={p * 90} /></At><At x={370} y={1000}><Gear size={150} c={b} rot={-p * 90 + 22} /></At></>);
};
const AutoTag: React.FC<{text?: string}> = ({text = 'AUTO-REPLY'}) => <div style={{padding: '4px 14px', borderRadius: 14, background: '#7B3FF2', alignSelf: 'flex-end'}}><Tx size={18} color="#fff">{text}</Tx></div>;

// ---------- 7 · Social Planner ----------
const POSTS: [number, GName, string][] = [[2, 'img', '#F0428D'], [8, 'play', '#2B7BFF'], [11, 'heart', '#FF7A3D'], [17, 'img', '#7B3FF2'], [20, 'play', GREEN]];
export const SocialPlanner: React.FC = () => {
  const {p, osc, on} = useLoop();
  return (
    <Stage c={['#FFD9EA', '#FF5E9C', '#FF8A2E']}>
      <Floor x={630} y={1010} w={640} />
      <At x={640} y={600 + 8 * osc()} rot={-3}>
        <Card w={660} h={640} r={46} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 120, flexShrink: 0, background: 'linear-gradient(120deg, #7B3FF2, #F0428D)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px'}}>
            <Tx size={44} color="#fff">October</Tx>
            <div style={{display: 'flex', gap: 10}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.7)'}} />)}</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '14px 22px 0'}}>{'MTWTFSS'.split('').map((d, i) => <div key={i} style={{textAlign: 'center'}}><Tx size={24} color={SLATE}>{d}</Tx></div>)}</div>
          <div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 10, padding: '10px 22px 24px'}}>
            {Array.from({length: 28}, (_, i) => {
              const post = POSTS.findIndex((q) => q[0] === i);
              return (
                <div key={i} style={{borderRadius: 16, background: '#F1ECFB', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 6, boxSizing: 'border-box'}}>
                  <Tx size={17} color="#B4ACD0">{i + 1}</Tx>
                  {post >= 0 && (
                    <div style={{position: 'absolute', inset: 4, transform: `scale(${on(0.06 + post * 0.12)})`}}>
                      <Chip w="100%" h={84} r={16} c={POSTS[post][2]} depth={6}><G name={POSTS[post][1]} size={40} /></Chip>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </At>
      {/* megaphone */}
      <At x={205} y={770} rot={-14 + 6 * osc(2)}>
        <svg width={320} height={290} viewBox="0 0 320 290" style={{overflow: 'visible', filter: 'drop-shadow(0 12px 0 #7A1247) drop-shadow(0 26px 20px rgba(20,0,60,0.35))'}}>
          <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF8FC4" /><stop offset="1" stopColor="#E0257A" /></linearGradient></defs>
          <path d="M40 110h60l130-74v208l-130-74H40a22 22 0 0 1-22-22v-16a22 22 0 0 1 22-22z" fill="url(#mg)" />
          <rect x="222" y="22" width="40" height="236" rx="20" fill="#fff" />
          <path d="M62 172l14 76h44l-12-76z" fill="#7B3FF2" />
          {[0, 1].map((j) => { const r = (p * 2 + j / 2) % 1; return <path key={j} d={`M${284 + 50 * r} ${78 - 20 * r}q${32 + 20 * r} 62 0 ${124 + 40 * r}`} fill="none" stroke="#fff" strokeWidth={15} strokeLinecap="round" opacity={1 - r} />; })}
        </svg>
      </At>
      {/* clock: one full turn per loop */}
      <At x={1000} y={900 + 8 * osc(1, 0.3)}>
        <svg width={230} height={244} viewBox="0 0 230 244" style={{overflow: 'visible'}}>
          <circle cx="115" cy="129" r="108" fill="#C96A00" /><circle cx="115" cy="115" r="108" fill="#FFC61A" /><circle cx="115" cy="115" r="86" fill="#fff" />
          <path d="M115 115V58" stroke={INK} strokeWidth={12} strokeLinecap="round" transform={`rotate(${p * 360} 115 115)`} />
          <path d="M115 115h38" stroke="#F0428D" strokeWidth={12} strokeLinecap="round" transform={`rotate(${p * 720} 115 115)`} />
          <circle cx="115" cy="115" r="12" fill={INK} />
        </svg>
      </At>
      <At x={185} y={400 + 12 * osc(1, 0.1)} rot={-8}><div style={{width: 140, height: 140, borderRadius: 40, background: IG, boxShadow: '0 12px 0 #5A1470, 0 26px 24px rgba(20,0,60,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><G name="cam" size={84} /></div></At>
      <At x={1030} y={420 + 12 * osc(1, 0.4)} rot={8}><Chip w={140} h={140} r={40} c={FB}><Tx size={110} color="#fff" style={{lineHeight: 1}}>f</Tx></Chip></At>
      <At x={640} y={1060} rot={-3} scale={on(0.7)}><Toast text="5 posts scheduled" size={38} /></At>
      <Glints pts={[[620, 130, 54], [1070, 620, 50], [130, 540, 46]]} />
    </Stage>
  );
};

// ---------- 8 · Google Profile growth ----------
export const ProfileGrowth: React.FC = () => {
  const {p, osc, on, fill} = useLoop();
  const hop = Math.abs(osc(1));
  return (
    <Stage c={['#D4F1FF', '#3B82F6', '#13A862']}>
      <Confetti n={10} />
      {/* bars */}
      {[0, 1, 2, 3].map((i) => {
        const h = [170, 250, 330, 420][i] * (0.8 + 0.2 * osc(1, -i * 0.08));
        return <div key={i} style={{position: 'absolute', left: 690 + i * 96, top: 1000 - h}}><Chip w={78} h={h} r={18} c={i === 3 ? '#FFC61A' : '#FFFFFF'} depth={10} /></div>;
      })}
      <At x={850} y={470 + 10 * osc(1, 0.2)} rot={3 * osc()}>
        <svg width={420} height={250} viewBox="0 0 420 250" style={{overflow: 'visible', filter: 'drop-shadow(0 12px 0 #B85A00) drop-shadow(0 26px 22px rgba(20,0,60,0.35))'}}>
          <path d="M20 230C140 214 270 160 350 66" fill="none" stroke="#FFC61A" strokeWidth={44} strokeLinecap="round" /><path d="M288 34l104-12l-10 106z" fill="#FFC61A" stroke="#FFC61A" strokeWidth={22} strokeLinejoin="round" />
          <path d="M30 216C140 200 250 152 322 76" fill="none" stroke="#FFF3A8" strokeWidth={10} strokeLinecap="round" />
        </svg>
      </At>
      {/* search result card */}
      <At x={520} y={360 + 8 * osc()} rot={-3}>
        <Card w={640} style={{padding: '26px 30px', position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <Icon name="pin" size={120} c="#F0428D" />
            <div style={{flex: 1}}>
              <Tx size={42} color={INK}>Sunrise Cafe</Tx><br />
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Stars n={5 * fill(0.1, 0.35)} size={42} /></div>
              <Tx size={26} color={GREEN}>Open now</Tx> <Tx size={26} color={SLATE} w={400}>· Cafe · Bhopal</Tx>
            </div>
          </div>
          <div style={{position: 'absolute', right: -40, top: -50, transform: `rotate(10deg) scale(${on(0.5)})`}}><Chip w={150} h={150} r={75} c="#FFC61A"><Tx size={62} color={INK}>#1</Tx></Chip></div>
        </Card>
      </At>
      {/* map tile with a hopping pin */}
      <At x={330} y={820 + 6 * osc(1, 0.3)} rot={-5}>
        <Card w={400} h={320} style={{overflow: 'hidden', position: 'relative'}}>
          <svg width={400} height={320} viewBox="0 0 400 320"><rect width="400" height="320" fill="#E8F6EC" /><path d="M-10 90h420M-10 220h420M120-10v340M290-10v340" stroke="#fff" strokeWidth={30} /><rect x="150" y="120" width="110" height="70" rx="12" fill="#BEE8C8" /><rect x="320" y="20" width="100" height="50" rx="12" fill="#BFE0FF" /><rect x="10" y="240" width="90" height="70" rx="12" fill="#BFE0FF" /></svg>
          <div style={{position: 'absolute', left: 170, top: 196, width: 70 - 26 * hop, height: 22 - 8 * hop, borderRadius: '50%', background: 'rgba(20,0,60,0.3)', transform: 'translateX(-50%)', marginLeft: 35}} />
        </Card>
      </At>
      <At x={338} y={720 - 60 * hop} rot={3 * osc(2)}>
        <svg width={150} height={200} viewBox="0 0 100 134" style={{overflow: 'visible'}}>
          <defs><linearGradient id="pn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF8FC4" /><stop offset="1" stopColor="#E0257A" /></linearGradient></defs>
          <path d="M50 132C30 100 8 82 8 54a42 42 0 0 1 84 0c0 28-22 46-42 78z" fill="#9A1050" /><path d="M50 124C30 94 8 76 8 48a42 42 0 0 1 84 0c0 28-22 46-42 76z" fill="url(#pn)" /><circle cx="50" cy="48" r="17" fill="#fff" />
        </svg>
      </At>
      <At x={600} y={1090} scale={on(0.66)}><Toast text="Ranking up" size={36} /></At>
      <Glints pts={[[1050, 300, 60], [150, 520, 50], [980, 1040, 44]]} />
    </Stage>
  );
};

// ---------- 9 · Facebook automation ----------
export const FacebookAuto: React.FC = () => {
  const {osc, on} = useLoop();
  return (
    <Stage c={['#D6E4FF', '#1877F2', '#3324C4']}>
      <Gears a="#9EC5FF" b="#FFC61A" />
      <At x={330} y={690} scale={0.85 + 0.2 * Math.abs(osc(2))} rot={-8}><BoltIcon size={130} /></At>
      <Floor x={640} y={1010} w={520} />
      <At x={650} y={600 + 8 * osc()} rot={3}>
        <Card w={540} style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Face size={86} c="#FFD15C" /><div><Tx size={32} color={INK}>Sunrise Cafe</Tx><br /><Tx size={22} color={SLATE} w={400}>Scheduled · 9:00 AM</Tx></div></div>
          <div style={{height: 250, borderRadius: 26, background: 'linear-gradient(135deg, #FFB21F, #F0428D)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 6px 14px rgba(255,255,255,0.35)'}}>
            <Tx size={50} color="#fff">Weekend Special</Tx><Tx size={32} color="#FFF3A8">Buy 1 Get 1 Free</Tx>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{transform: `scale(${1 + 0.18 * Math.abs(osc(2))})`}}><Chip w={76} h={76} r={38} c={FB} depth={6}><Thumb size={42} /></Chip></div>
            <Tx size={28} color={FB}>Like</Tx><div style={{flex: 1}} /><Tx size={26} color={SLATE} w={400}>Comment · Share</Tx>
          </div>
          <div style={{transform: `scale(${on(0.45)})`, transformOrigin: '0 0', display: 'flex', flexDirection: 'column', gap: 8}}>
            <Msg mine c={FB} text="Thanks for visiting us!" size={26} w={380} /><AutoTag />
          </div>
        </Card>
      </At>
      <At x={215} y={290 + 12 * osc(1, 0.2)} rot={-10 + 4 * osc()}><Chip w={220} h={220} r={62} c={FB} depth={16} style={{overflow: 'hidden'}}><Tx size={210} color="#fff" style={{lineHeight: 1, transform: 'translate(10px, 18px)'}}>f</Tx></Chip></At>
      <At x={930} y={210} rot={5} scale={on(0.16)}><Toast text="Auto-posted" size={36} c={FB} /></At>
      <Rising x={1040} kinds={['like', 'heart', 'like', 'heart']} />
      <Glints pts={[[560, 130, 50], [130, 560, 46], [1080, 1000, 44]]} />
    </Stage>
  );
};

// ---------- 10 · Instagram automation ----------
const TILES = ['#F0428D', '#3FA9FF', '#FFC61A', '#7B3FF2', '#FF7A3D', '#F0428D', GREEN, '#5B3FF2', '#3FA9FF'];
export const InstagramAuto: React.FC = () => {
  const {p, osc, on} = useLoop();
  const story = Math.floor(p * 4);
  return (
    <Stage c={['#FFE08A', '#F0428D', '#5B24D6']}>
      <Gears a="#C9B8FF" b="#FFC61A" />
      <Floor x={610} y={1050} w={470} />
      <At x={610} y={620 + 8 * osc()} rot={3}>
        <Phone>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 58, gap: 14}}>
            <div style={{display: 'flex', gap: 12}}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{width: 82, height: 82, borderRadius: '50%', background: IG, padding: 6, boxSizing: 'border-box', transform: `scale(${i === story ? 1.16 : 1})`}}>
                  <div style={{width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #fff', boxSizing: 'border-box', overflow: 'hidden'}}><Face size={62} c={['#FFD15C', '#C9B8FF', '#9BD3FF', '#A8E6B0'][i]} /></div>
                </div>
              ))}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'stretch', padding: '0 24px'}}><Tx size={28} color={INK}>sunrisecafe</Tx><div style={{flex: 1}} /><Tx size={22} color="#F0428D">9 posts</Tx></div>
            <div style={{position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 116px)', gap: 12}}>
              {TILES.map((c, i) => (
                <div key={i} style={{width: 116, height: 116, borderRadius: 18, background: '#F1ECFB'}}>
                  <div style={{transform: `scale(${on(0.05 + i * 0.07)})`}}><Chip w={116} h={108} r={18} c={c} depth={7}><G name={i % 3 === 1 ? 'play' : 'img'} size={50} /></Chip></div>
                </div>
              ))}
              <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${on(0.76, 0.06)})`}}>
                <svg width={200} height={200} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 8px 0 #9A1050) drop-shadow(0 0 18px rgba(255,255,255,0.9))'}}><path d="M50 86C12 58 8 36 22 22c11-10 23-4 28 8c5-12 17-18 28-8c14 14 10 36-28 64z" fill="#F0428D" stroke="#fff" strokeWidth={7} strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
        </Phone>
      </At>
      <At x={205} y={290 + 12 * osc(1, 0.2)} rot={-10 + 4 * osc()}>
        <div style={{width: 220, height: 220, borderRadius: 62, background: IG, boxShadow: '0 16px 0 #4A1090, 0 34px 28px rgba(20,0,60,0.4), inset 0 6px 10px rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><G name="cam" size={140} /></div>
      </At>
      <At x={330} y={690} scale={0.85 + 0.2 * Math.abs(osc(2))} rot={-8}><BoltIcon size={130} /></At>
      <At x={900} y={940 + 8 * osc(1, 0.4)} rot={5} scale={on(0.22)}>
        <Card w={380} style={{padding: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end'}}><Msg mine c="#F0428D" text="Hi! Here is our menu." size={27} w={340} /><AutoTag text="AUTO DM" /></Card>
      </At>
      <At x={640} y={150} rot={-3} scale={on(0.62)}><Toast text="Reel published" size={36} c="#F0428D" /></At>
      <Rising x={1050} kinds={['heart', 'heart', 'heart', 'heart']} />
      <Glints pts={[[520, 110, 50], [130, 560, 46]]} />
    </Stage>
  );
};

// ---------- 11 · White-label agency platform ----------
const BRANDS: [string, string][] = [['Your Agency', '#7B3FF2'], ['Pixel Media', '#F0428D'], ['GrowthHub', '#12A5D6']];
const Mark: React.FC<{i: number; size: number; c: string}> = ({i, size, c}) => (
  <div style={{width: size, height: size, borderRadius: i === 0 ? '50%' : i === 1 ? size * 0.26 : size * 0.5, background: `linear-gradient(150deg, ${lite(c)}, ${c}, ${dark(c, 0.2)})`, boxShadow: `0 ${size * 0.08}px 0 ${dark(c, 0.4)}`, clipPath: i === 2 ? 'polygon(50% 0, 100% 100%, 0 100%)' : undefined}} />
);
export const WhiteLabel: React.FC = () => {
  const {p, osc} = useLoop();
  const idx = Math.floor(p * 3) % 3;
  const k = (p * 3) % 1;
  const flip = cl(k / 0.12);
  const [name, c] = BRANDS[idx];
  const xs = [300, 600, 900];
  return (
    <Stage c={['#EBDCFF', '#7B3FF2', '#DB1F74']}>
      <svg width={1200} height={1200} style={{position: 'absolute', left: 0, top: 0}}>
        {xs.map((x, i) => <line key={i} x1={600} y1={760} x2={x} y2={930} stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={-p * 120} opacity={i === idx ? 1 : 0.45} />)}
      </svg>
      <At x={600} y={150 + 10 * osc()} rot={4 * osc(1, 0.25)}>
        <svg width={190} height={150} viewBox="0 0 210 172" style={{overflow: 'visible', filter: 'drop-shadow(0 0 16px rgba(255,220,80,0.9))'}}>
          <path d="M20 152L10 52l52 44l43-70l43 70l52-44l-10 100z" fill="#C96A00" /><path d="M20 140L10 40l52 44l43-70l43 70l52-44l-10 100z" fill="#FFC61A" />
          {[10, 105, 200].map((x, i) => <circle key={i} cx={x} cy={i === 1 ? 14 : 40} r={14} fill="#F0428D" stroke="#fff" strokeWidth={5} />)}
        </svg>
      </At>
      <Floor x={600} y={790} w={760} />
      <At x={600} y={500 + 6 * osc()}>
        <Card w={780} h={500} r={44} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 104, flexShrink: 0, borderBottom: '4px solid #E8E1FA', display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px'}}>
            <div style={{transform: `scaleY(${flip})`}}><Mark i={idx} size={60} c={c} /></div>
            <div style={{transform: `scaleX(${flip})`, transformOrigin: '0 50%'}}><Tx size={40} color={c}>{name}</Tx></div>
            <div style={{marginLeft: 'auto'}}><Face size={62} c="#FFD15C" /></div>
          </div>
          <div style={{flex: 1, display: 'flex', minHeight: 0}}>
            <div style={{width: 190, padding: '24px 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18, background: '#F6F2FF'}}>
              {['Dashboard', 'Clients', 'Reviews', 'Reports'].map((t, i) => <div key={t} style={{padding: '8px 14px', borderRadius: 14, background: i === 0 ? c : 'transparent'}}><Tx size={22} color={i === 0 ? '#fff' : SLATE}>{t}</Tx></div>)}
            </div>
            <div style={{flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 18}}>
              <div style={{display: 'flex', gap: 16}}>
                {['Clients', 'Reviews', 'Posts'].map((t, i) => <div key={t} style={{flex: 1, height: 96, borderRadius: 20, background: i === 0 ? c : '#F1ECFB', padding: '12px 16px', boxSizing: 'border-box'}}><Tx size={20} color={i === 0 ? '#fff' : SLATE}>{t}</Tx><div style={{height: 22, width: `${[70, 52, 62][i]}%`, borderRadius: 11, marginTop: 14, background: i === 0 ? 'rgba(255,255,255,0.7)' : '#CFC8EA'}} /></div>)}
              </div>
              <div style={{flex: 1, borderRadius: 20, background: '#F1ECFB', display: 'flex', alignItems: 'flex-end', gap: 14, padding: 16}}>
                {[0.4, 0.55, 0.45, 0.7, 0.62, 0.85, 1].map((h, i) => <div key={i} style={{flex: 1, height: `${h * (82 + 18 * osc(1, -i * 0.06))}%`, borderRadius: 8, background: i === 6 ? c : lite(c, 0.6)}} />)}
              </div>
            </div>
          </div>
        </Card>
      </At>
      {xs.map((x, i) => {
        const lift = i === idx ? 1 : 0;
        return (
          <At key={i} x={x} y={1000 - 22 * lift + 6 * osc(1, i * 0.3)} scale={1 + 0.1 * lift}>
            <Card w={250} h={150} r={30} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              <div style={{height: 70, flexShrink: 0, background: `linear-gradient(120deg, ${lite(BRANDS[i][1], 0.25)}, ${BRANDS[i][1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={26} color="#fff">{BRANDS[i][0]}</Tx></div>
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={20} color={SLATE}>its own logo &amp; domain</Tx></div>
            </Card>
          </At>
        );
      })}
      <Glints pts={[[150, 300, 60], [1060, 300, 56], [130, 760, 46], [1080, 760, 46]]} />
    </Stage>
  );
};

// ---------- 12 · AI agent & autopilot ----------
const TODO = ['Reply to reviews', 'Post on Instagram', 'Answer WhatsApp', 'Send client report'];
export const AiAgent: React.FC = () => {
  const {osc, on} = useLoop();
  const sw = cl(on(0.04, 0.08));
  return (
    <Stage c={['#D3DBFF', '#5B3FF2', '#0FB5E0']}>
      <Floor x={320} y={790} w={380} />
      <At x={310} y={540 + 12 * osc()} rot={-5 + 2 * osc(1, 0.25)}><Bot /></At>
      <At x={330} y={300} rot={-8} scale={0.85 + 0.2 * Math.abs(osc(2))}><BoltIcon size={110} /></At>
      <At x={790} y={520 + 8 * osc(1, 0.2)} rot={3}>
        <Card w={540} style={{padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 16}}>
          <Tx size={34} color="#5B3FF2">Today’s tasks</Tx>
          {TODO.map((t, i) => {
            const done = on(0.12 + i * 0.16);
            return (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 20, background: done > 0.5 ? '#E6FBEC' : '#F1ECFB'}}>
                <div style={{width: 56, height: 56, position: 'relative'}}><div style={{position: 'absolute', inset: 4, borderRadius: '50%', border: '5px solid #CFC8EA', boxSizing: 'border-box'}} /><div style={{position: 'absolute', inset: 0, transform: `scale(${done})`}}><Tick size={56} /></div></div>
                <Tx size={29} color={INK}>{t}</Tx>
              </div>
            );
          })}
        </Card>
      </At>
      {/* autopilot switch: slides on, stays on, resets with the loop */}
      <At x={600} y={980}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <div style={{width: 300, height: 130, borderRadius: 65, position: 'relative', background: sw > 0.5 ? `linear-gradient(150deg, ${lite(GREEN)}, ${GREEN}, ${dark(GREEN, 0.2)})` : 'linear-gradient(150deg, #E4DEF6, #BDB4DD)',
            boxShadow: `0 12px 0 ${sw > 0.5 ? dark(GREEN, 0.42) : '#8E84B8'}, 0 30px 26px rgba(20,0,60,0.4), inset 0 5px 8px rgba(255,255,255,0.5)${sw > 0.5 ? `, 0 0 ${30 + 20 * Math.abs(osc(2))}px ${GREEN}` : ''}`}}>
            <div style={{position: 'absolute', top: 10, left: 10 + 170 * sw, width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(170deg, #fff, #E4DCFF)', boxShadow: '0 6px 0 #B9AFEA', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><BoltIcon size={62} /></div>
          </div>
          <Tx size={52} color="#fff" style={{textShadow: '0 5px 0 rgba(20,0,60,0.35)'}}>Autopilot {sw > 0.5 ? 'ON' : 'OFF'}</Tx>
        </div>
      </At>
      <Glints pts={[[1050, 280, 60], [140, 880, 50], [1060, 820, 46], [620, 140, 46]]} />
    </Stage>
  );
};
