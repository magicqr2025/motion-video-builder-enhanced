// Glossy feature loops 1–6 (1200x1200, 4 s, seamless)
import React from 'react';
import {Stars} from '../qr/kit';
import {Qr, StandImg} from '../qr/objects';
import {At, Bot, Card, Chip, Confetti, Dots, Face, Floor, G, GName, Glints, GREEN, Icon, INK, Msg, Phone, Stage, Star3D, Tick, Toast, Tx, dark, lite, useLoop} from './parts';

const cl = (x: number) => Math.max(0, Math.min(1, x));
const SLATE = '#6B6788';

// ---------- 1 · Review Booster ----------
export const ReviewBooster: React.FC = () => {
  const {osc, on, fill} = useLoop();
  return (
    <Stage c={['#FFF3B0', '#FFB21F', '#FF5E3A']}>
      <Confetti />
      <Floor x={450} y={1030} w={560} />
      <At x={450} y={720 + 10 * osc()} rot={-3 + 1.5 * osc(1, 0.25)}><StandImg w={640} /></At>
      {[0, 1, 2, 3, 4].map((i) => {
        const big = 2 - Math.abs(i - 2);
        return <At key={i} x={600 + (i - 2) * 158} y={235 - big * 40 + 8 * osc(2, i * 0.1)} rot={(i - 2) * 9} scale={on(0.05 + i * 0.07)}><Star3D size={140 + big * 30} /></At>;
      })}
      <At x={850} y={590 + 8 * osc(1, 0.3)} rot={5} scale={on(0.38)}>
        <Card w={440} style={{padding: '26px 28px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <Face size={84} c="#FF7AB6" />
            <div><Tx size={32} color={INK}>Riya S.</Tx><br /><Stars n={5 * fill(0.42, 0.25)} size={36} /></div>
          </div>
          <Tx size={28} color={INK} w={400} style={{whiteSpace: 'normal', marginTop: 14, lineHeight: 1.3}}>Amazing food and super quick service. Loved it!</Tx>
        </Card>
      </At>
      <At x={800} y={930} rot={-4} scale={on(0.62)}><Toast text="+1 Google Review" /></At>
      <At x={230} y={400 + 10 * osc(1, 0.4)} rot={-10} scale={0.94 + 0.06 * osc(2)}><Chip w={170} h={170} r={85} c="#7B3FF2"><Tx size={70} color="#fff">AI</Tx></Chip></At>
      <Glints pts={[[1010, 300, 70], [150, 640, 56], [1040, 760, 50], [620, 1080, 46]]} />
    </Stage>
  );
};

// ---------- 2 · Smart Menu ----------
const DISHES: [string, string, string, string][] = [['Paneer Tikka', '₹220', '#FF9A3D', '#E2452B'], ['Masala Dosa', '₹120', '#FFD15C', '#C77700'], ['Cold Coffee', '₹90', '#C99A6B', '#6B3F1D']];
const DishRow: React.FC<{i: number}> = ({i}) => {
  const [name, price, a, b] = DISHES[i % 3];
  return (
    <div style={{height: 126, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', borderBottom: '3px solid #EFE9FB', boxSizing: 'border-box'}}>
      <div style={{width: 86, height: 86, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${lite(a, 0.5)}, ${a} 60%, ${b})`, boxShadow: `0 6px 0 ${dark(b, 0.2)}`, flexShrink: 0}} />
      <div style={{flex: 1}}><Tx size={27} color={INK}>{name}</Tx><br /><Tx size={25} color="#F0428D">{price}</Tx></div>
      <Chip w={54} h={54} r={27} c="#F0428D" depth={5}><Tx size={36} color="#fff" style={{lineHeight: 1}}>+</Tx></Chip>
    </div>
  );
};
export const SmartMenu: React.FC = () => {
  const {p, osc, on} = useLoop();
  const lid = Math.abs(osc(1));
  return (
    <Stage c={['#FFE9A0', '#FF8A3D', '#FF2F7A']}>
      <Floor x={470} y={1050} w={460} />
      <At x={470} y={630 + 8 * osc()} rot={-5}>
        <Phone>
          <div style={{height: 150, background: 'linear-gradient(120deg, #FF7A3D, #F0428D)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 22px 16px', boxSizing: 'border-box', position: 'relative', zIndex: 2}}>
            <Tx size={34} color="#fff">Sunrise Cafe</Tx><Tx size={22} color="#FFE3EF" w={400}>Digital Menu</Tx>
          </div>
          <div style={{transform: `translateY(${-3 * 126 * p}px)`}}>{Array.from({length: 9}, (_, i) => <DishRow key={i} i={i} />)}</div>
        </Phone>
      </At>
      {/* cloche: the lid lifts and steam rises */}
      <At x={880} y={330}>
        <svg width={330} height={300} viewBox="0 0 330 300" style={{overflow: 'visible'}}>
          {[0, 1, 2].map((j) => { const r = (p * 2 + j / 3) % 1; return <path key={j} d={`M${120 + j * 45} ${150 - 90 * r}q-16 -22 0 -44q16 -22 0 -44`} fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" opacity={(1 - r) * lid} />; })}
          <ellipse cx="165" cy="262" rx="150" ry="26" fill="#C9BDF0" /><ellipse cx="165" cy="250" rx="150" ry="26" fill="#fff" />
          <g transform={`translate(0 ${-70 * lid}) rotate(${-8 * lid} 165 240)`}>
            <path d="M40 244a125 118 0 0 1 250 0z" fill="#C9C3E6" /><path d="M40 238a125 118 0 0 1 250 0z" fill="#F4F1FF" /><path d="M78 190a90 84 0 0 1 60-62" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
            <circle cx="165" cy="112" r="20" fill="#F0428D" />
          </g>
        </svg>
      </At>
      <At x={885} y={790 + 8 * osc(1, 0.3)} rot={5}>
        <Card w={320} h={420} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative', overflow: 'hidden'}}>
          <Tx size={28} color="#F0428D">SCAN FOR MENU</Tx>
          <div style={{position: 'relative'}}><Qr size={210} color={INK} /><div style={{position: 'absolute', left: -8, right: -8, top: 210 * ((p * 2) % 1), height: 8, borderRadius: 4, background: '#F0428D', boxShadow: '0 0 16px #F0428D'}} /></div>
          <Tx size={22} color={SLATE} w={400}>No app needed</Tx>
        </Card>
      </At>
      <At x={330} y={160} rot={-6} scale={on(0.5)}><Toast text="Added to order" size={32} /></At>
      <Glints pts={[[1040, 560, 60], [170, 880, 56], [640, 150, 50]]} />
    </Stage>
  );
};

// ---------- 3 · NFC Smart Card ----------
export const SmartCard: React.FC = () => {
  const {p, osc, on} = useLoop();
  const links: [GName, string][] = [['call', '#2B7BFF'], ['mail', '#F0428D'], ['globe', '#FFB21F'], ['pin', GREEN]];
  return (
    <Stage c={['#E4D6FF', '#7B4CF5', '#2437D8']}>
      <Floor x={520} y={860} w={640} />
      {/* tap ripples between card and phone */}
      <svg width={1200} height={1200} style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1, 2].map((j) => { const r = (p * 2 + j / 3) % 1; return <circle key={j} cx={760} cy={700} r={40 + 240 * r} fill="none" stroke="#fff" strokeWidth={12} opacity={(1 - r) * 0.9} />; })}
      </svg>
      <At x={500} y={520 + 10 * osc()} rot={-9 + 1.5 * osc(1, 0.25)}>
        <div style={{width: 680, height: 420, borderRadius: 48, position: 'relative', background: 'linear-gradient(135deg, #8E5BFF, #5B2FE0 50%, #F0428D)', boxShadow: '0 16px 0 #2A1580, 0 44px 50px rgba(20,0,60,0.5), inset 0 5px 0 rgba(255,255,255,0.4)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -80, top: -140, width: 420, height: 420, borderRadius: '50%', background: 'rgba(255,255,255,0.14)'}} />
          <div style={{position: 'absolute', left: 40, top: 40, display: 'flex', alignItems: 'center', gap: 22}}>
            <Face size={130} c="#FFD15C" />
            <div><Tx size={42} color="#fff">Rahul Sharma</Tx><br /><Tx size={25} color="#E9DEFF" w={400}>Real Estate Consultant</Tx></div>
          </div>
          <div style={{position: 'absolute', left: 40, bottom: 44, display: 'flex', gap: 16}}>{links.map(([g, c]) => <Icon key={g} name={g} size={78} c={c} round />)}</div>
          <div style={{position: 'absolute', right: 36, bottom: 36, padding: 12, borderRadius: 22, background: '#fff', boxShadow: '0 8px 0 #C9BDF0'}}><Qr size={132} color={INK} /></div>
          <svg width={70} height={70} viewBox="0 0 70 70" style={{position: 'absolute', right: 40, top: 40}}>{[14, 28, 42].map((r, i) => <path key={i} d={`M${20 + i * 2} ${35 - r}a${r} ${r} 0 0 1 0 ${r * 2}`} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.4 + 0.6 * Math.abs(osc(2, -i * 0.12))} />)}</svg>
        </div>
      </At>
      <At x={870} y={820 + 8 * osc(1, 0.3)} rot={10} scale={0.62}>
        <Phone>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 110, gap: 18}}>
            <Face size={190} c="#FFD15C" />
            <Tx size={46} color={INK}>Rahul Sharma</Tx>
            <div style={{transform: `scale(${on(0.3)})`}}><Tick size={150} /></div>
            <Tx size={40} color={GREEN}>Contact saved</Tx>
          </div>
        </Phone>
      </At>
      <At x={270} y={900} rot={-5} scale={on(0.5)}><Toast text="One tap to share" size={34} c="#7B3FF2" /></At>
      <Glints pts={[[1030, 330, 64], [160, 300, 56], [1050, 560, 44], [640, 1090, 46]]} />
    </Stage>
  );
};

// ---------- 4 · Bio Link ----------
const LINKS: [string, GName, string, string][] = [['Order on WhatsApp', 'chat', GREEN, '#fff'], ['View Menu', 'fork', '#FF7A3D', '#fff'], ['Book a Table', 'pin', '#7B3FF2', '#fff'], ['Instagram', 'cam', '#F0428D', '#fff'], ['Today’s Offers', 'heart', '#FFC61A', INK]];
export const BioLink: React.FC = () => {
  const {p, osc} = useLoop();
  const active = Math.floor(p * LINKS.length);
  const k = Math.sin(Math.PI * ((p * LINKS.length) % 1));
  return (
    <Stage c={['#FFD0E8', '#F0428D', '#6B2FE0']}>
      <Floor x={560} y={1060} w={470} />
      <At x={560} y={630 + 8 * osc()}>
        <Phone>
          <div style={{background: 'linear-gradient(180deg, #F3EBFF, #fff)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 62, gap: 8}}>
            <Face size={118} c="#FFD15C" />
            <Tx size={30} color={INK}>Sunrise Cafe</Tx><Tx size={22} color={SLATE} w={400}>@sunrisecafe</Tx>
            <div style={{display: 'flex', flexDirection: 'column', gap: 20, marginTop: 14}}>
              {LINKS.map(([label, g, c, tc], i) => (
                <div key={label} style={{transform: `scale(${i === active ? 1 + 0.09 * k : 1})`, position: 'relative', zIndex: i === active ? 2 : 1}}>
                  <Chip w={356} h={74} r={37} c={c} depth={8} style={{justifyContent: 'flex-start', paddingLeft: 14}}>
                    <div style={{width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><G name={g} size={28} color={c === '#FFC61A' ? '#C96A00' : c} /></div>
                    <Tx size={25} color={tc}>{label}</Tx>
                  </Chip>
                </div>
              ))}
            </div>
          </div>
        </Phone>
      </At>
      {/* chain link */}
      <At x={975} y={600 + 12 * osc(1, 0.3)} rot={-32 + 8 * osc()}>
        <svg width={250} height={410} viewBox="0 0 250 410" style={{overflow: 'visible', filter: 'drop-shadow(0 14px 0 #3A1580) drop-shadow(0 30px 24px rgba(20,0,60,0.4))'}}>
          <rect x="55" y="185" width="140" height="205" rx="70" fill="none" stroke="#FFD43B" strokeWidth={50} /><rect x="55" y="185" width="140" height="205" rx="70" fill="none" stroke="#FFF3A8" strokeWidth={12} transform="translate(-12 -12)" opacity={0.7} />
          <rect x="55" y="20" width="140" height="205" rx="70" fill="none" stroke="#fff" strokeWidth={50} />
          <path d="M55 300V250" stroke="#FFD43B" strokeWidth={50} />
        </svg>
      </At>
      {([['cam', '#F0428D', 170, 330], ['play', '#EF4444', 215, 590], ['globe', '#2B7BFF', 165, 840]] as [GName, string, number, number][]).map(([g, c, x, y], i) => (
        <At key={g} x={x} y={y + 14 * osc(1, i * 0.25)} rot={(i % 2 ? 8 : -8) + 3 * osc(1, i * 0.3)}><Icon name={g} size={150} c={c} /></At>
      ))}
      <Glints pts={[[1030, 300, 64], [330, 160, 50], [1010, 920, 54], [300, 1050, 44]]} />
    </Stage>
  );
};

// ---------- 5 · AEO + GEO ----------
export const AeoGeo: React.FC = () => {
  const {p, osc, on, fill} = useLoop();
  const answered = p >= 0.32 && p < 0.96;
  return (
    <Stage c={['#C9F6FF', '#3FA9FF', '#5330E8']}>
      <Floor x={690} y={1000} w={600} />
      <At x={700} y={600 + 8 * osc()} rot={2}>
        <Card w={600} h={680} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 100, background: 'linear-gradient(120deg, #5B3FF2, #3FA9FF)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px', flexShrink: 0}}>
            <svg width={44} height={44} viewBox="0 0 100 100"><path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z" fill="#fff" /></svg>
            <Tx size={34} color="#fff">AI Assistant</Tx>
          </div>
          <div style={{flex: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 22}}>
            <div style={{alignSelf: 'flex-end', transform: `scale(${on(0.04)})`, transformOrigin: '100% 50%'}}><Msg mine c="#3F7BFF" text="Best cafe near me?" size={32} w={400} /></div>
            {!answered && p > 0.12 && <div style={{padding: '22px 26px', borderRadius: 26, background: '#EEE9FB', alignSelf: 'flex-start'}}><Dots /></div>}
            {answered && (
              <div style={{transform: `scale(${on(0.32)})`, transformOrigin: '0 0', alignSelf: 'flex-start'}}>
                <div style={{padding: 22, borderRadius: 30, borderBottomLeftRadius: 6, background: '#EEE9FB', boxShadow: '0 6px 0 #D5CCF0', width: 480, boxSizing: 'border-box'}}>
                  <Tx size={28} color={INK} w={400}>I recommend:</Tx>
                  <div style={{marginTop: 12, padding: 16, borderRadius: 22, background: '#fff', boxShadow: '0 6px 0 #D5CCF0', display: 'flex', alignItems: 'center', gap: 16}}>
                    <Icon name="pin" size={84} c="#F0428D" />
                    <div style={{flex: 1}}><Tx size={32} color={INK}>Sunrise Cafe</Tx><br /><Stars n={5 * fill(0.4, 0.25)} size={34} /></div>
                    <div style={{transform: `scale(${on(0.6)})`}}><Tick size={64} /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </At>
      <At x={250} y={780 + 12 * osc()} rot={-6 + 2 * osc(1, 0.25)} scale={0.92}><Bot /></At>
      <At x={760} y={1040} rot={-3} scale={on(0.66)}><Toast text="Found by AI" size={38} c="#5B3FF2" /></At>
      <Glints pts={[[1040, 300, 64], [150, 520, 50], [1050, 900, 50], [520, 1090, 44]]} />
    </Stage>
  );
};

// ---------- 6 · WhatsApp API CRM ----------
const CROWD: [number, number, string][] = [[170, 420, '#FF9ACB'], [150, 700, '#9BD3FF'], [240, 950, '#FFD15C'], [1030, 420, '#C9B8FF'], [1050, 700, '#FFC48A'], [960, 950, '#A8E6B0']];
export const WhatsappCrm: React.FC = () => {
  const {p, osc, on} = useLoop();
  return (
    <Stage c={['#DDFFE4', '#25D366', '#078C74']}>
      <svg width={1200} height={1200} style={{position: 'absolute', left: 0, top: 0}}>
        {CROWD.map(([x, y], i) => <line key={i} x1={600} y1={640} x2={x} y2={y} stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={-p * 120} opacity={0.9} />)}
      </svg>
      {CROWD.map(([x, y, c], i) => (
        <React.Fragment key={i}>
          <At x={x} y={y + 8 * osc(1, i * 0.15)}><Face size={132} c={c} hair={i % 2 ? '#7A4A2A' : '#2B1B4A'} /></At>
          <At x={x + (x < 600 ? 56 : -56)} y={y - 80} scale={on(0.3 + i * 0.07)}>
            <Chip w={84} h={62} r={22} c={GREEN} depth={6}><svg width={46} height={24} viewBox="0 0 46 24"><path d="M4 6h38M4 18h24" stroke="#fff" strokeWidth={7} strokeLinecap="round" /></svg></Chip>
          </At>
        </React.Fragment>
      ))}
      <Floor x={600} y={1060} w={470} />
      <At x={600} y={640 + 8 * osc()}>
        <Phone>
          <div style={{height: 150, background: 'linear-gradient(120deg, #128C7E, #25D366)', display: 'flex', alignItems: 'flex-end', gap: 14, padding: '0 20px 16px', boxSizing: 'border-box'}}>
            <Face size={70} c="#FFD15C" /><div><Tx size={30} color="#fff">Sunrise Cafe</Tx><br /><Tx size={20} color="#DDFFE4" w={400}>Broadcast · 1 list</Tx></div>
          </div>
          <div style={{background: '#F3F0E8', height: '100%', padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box'}}>
            <div style={{alignSelf: 'flex-end', transform: `scale(${on(0.05)})`, transformOrigin: '100% 50%'}}><Msg mine text="20% OFF this weekend! Book your table now." size={27} w={310} /></div>
            <div style={{alignSelf: 'flex-start', transform: `scale(${on(0.34)})`, transformOrigin: '0 50%'}}><Msg text="Can I book for 4?" size={27} /></div>
            <div style={{alignSelf: 'flex-end', transform: `scale(${on(0.56)})`, transformOrigin: '100% 50%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8}}>
              <Msg mine text="Sure! Table for 4 booked." size={27} w={310} />
              <div style={{padding: '4px 14px', borderRadius: 14, background: '#7B3FF2'}}><Tx size={18} color="#fff">AUTO-REPLY</Tx></div>
            </div>
          </div>
        </Phone>
      </At>
      <At x={600} y={170 + 8 * osc(1, 0.2)} scale={on(0.2)}><Toast text="Broadcast sent" size={36} /></At>
      <Glints pts={[[330, 220, 54], [880, 240, 50], [600, 1110, 44]]} />
    </Stage>
  );
};
