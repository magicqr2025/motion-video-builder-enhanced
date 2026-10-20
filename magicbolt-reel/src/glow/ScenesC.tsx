// Glossy feature loops 13–15: WordPress automation, appointment scheduling, "many more"
import React from 'react';
import {At, BoltIcon, Card, Chip, Confetti, Face, Floor, G, GName, Gear, Glints, GREEN, Icon, INK, Phone, Stage, Star3D, Tick, Toast, Tx, useLoop} from './parts';

const cl = (x: number) => Math.max(0, Math.min(1, x));
const SLATE = '#6B6788';
const WP = '#21759B';

// ---------- 13 · WordPress automation ----------
const TITLE = '5 Reasons to Visit Sunrise Cafe';
export const WordpressAuto: React.FC = () => {
  const {p, osc, on, fill} = useLoop();
  const typed = TITLE.slice(0, Math.floor(TITLE.length * fill(0.06, 0.3)));
  const published = p >= 0.68 && p < 0.95;
  return (
    <Stage c={['#D8EEFF', '#2B8FC2', '#1B2F7A']}>
      <At x={215} y={870}><Gear size={240} c="#9ED3F0" rot={p * 90} /></At>
      <At x={370} y={1000}><Gear size={150} c="#FFC61A" rot={-p * 90 + 22} /></At>
      <At x={330} y={690} scale={0.85 + 0.2 * Math.abs(osc(2))} rot={-8}><BoltIcon size={130} /></At>
      <Floor x={660} y={1000} w={600} />
      <At x={670} y={590 + 8 * osc()} rot={3}>
        <Card w={620} h={660} r={42} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 84, flexShrink: 0, background: '#EDE7FB', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px'}}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 22, height: 22, borderRadius: '50%', background: c}} />)}
            <div style={{flex: 1, marginLeft: 14, height: 44, borderRadius: 22, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px'}}><Tx size={22} color={SLATE} w={400}>yoursite.com/blog</Tx></div>
          </div>
          <div style={{flex: 1, padding: 26, display: 'flex', flexDirection: 'column', gap: 18}}>
            <div style={{height: 170, borderRadius: 24, background: 'linear-gradient(135deg, #FFB21F, #F0428D)', boxShadow: 'inset 0 6px 14px rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><G name="img" size={110} /></div>
            <div style={{minHeight: 92}}>
              <Tx size={36} color={INK} style={{whiteSpace: 'normal', lineHeight: 1.2}}>{typed}</Tx>
              {fill(0.06, 0.3) < 1 && typed.length > 0 && <span style={{display: 'inline-block', width: 5, height: 40, background: WP, marginLeft: 4, verticalAlign: 'middle'}} />}
            </div>
            {[0, 1, 2].map((i) => <div key={i} style={{height: 18, borderRadius: 9, background: '#DCD6F2', width: `${[100, 92, 64][i] * fill(0.36 + i * 0.07, 0.1)}%`}} />)}
            <div style={{flex: 1}} />
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{padding: '6px 16px', borderRadius: 16, background: '#E6FBEC'}}><Tx size={22} color="#109C4B">SEO-ready</Tx></div>
              <div style={{flex: 1}} />
              <div style={{transform: `scale(${1 + 0.12 * Math.sin(Math.PI * cl((p - 0.6) / 0.1))})`}}>
                <Chip w={220} h={76} r={38} c={published ? GREEN : WP} depth={8}><Tx size={30} color="#fff">{published ? 'Published' : 'Publish'}</Tx></Chip>
              </div>
            </div>
          </div>
        </Card>
      </At>
      {/* WordPress-style badge */}
      <At x={215} y={300 + 12 * osc(1, 0.2)} rot={-10 + 4 * osc()}>
        <Chip w={220} h={220} r={110} c={WP} depth={16}>
          <div style={{width: 168, height: 168, borderRadius: '50%', border: '10px solid #fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={120} color="#fff" style={{lineHeight: 1}}>W</Tx></div>
        </Chip>
      </At>
      <At x={1000} y={300 + 10 * osc(1, 0.4)} rot={8} scale={0.94 + 0.06 * osc(2)}><Chip w={160} h={160} r={80} c="#7B3FF2"><Tx size={66} color="#fff">AI</Tx></Chip></At>
      <At x={660} y={1070} rot={-3} scale={on(0.7)}><Toast text="Blog published" size={38} c={WP} /></At>
      <Glints pts={[[560, 120, 50], [130, 580, 46], [1070, 640, 54], [1010, 980, 44]]} />
    </Stage>
  );
};

// ---------- 14 · Appointment scheduling ----------
const DAYS: [string, string][] = [['Mon', '12'], ['Tue', '13'], ['Wed', '14'], ['Thu', '15']];
const SLOTS = ['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'];
export const Appointments: React.FC = () => {
  const {p, osc, on} = useLoop();
  const picked = p >= 0.3 && p < 0.95;
  const pick = on(0.3);
  const confirmed = p >= 0.55 && p < 0.95;
  return (
    <Stage c={['#DDFBF4', '#14B8A6', '#0B5FA8']}>
      <Floor x={500} y={1060} w={470} />
      <At x={500} y={630 + 8 * osc()} rot={-4}>
        <Phone>
          <div style={{height: 150, background: 'linear-gradient(120deg, #0E9488, #2DD4BF)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 22px 16px', boxSizing: 'border-box'}}>
            <Tx size={32} color="#fff">Book Appointment</Tx><Tx size={22} color="#D9FFF8" w={400}>Glow Salon · Haircut</Tx>
          </div>
          <div style={{padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 18}}>
            <div style={{display: 'flex', gap: 10}}>
              {DAYS.map(([d, n], i) => (
                <div key={d} style={{flex: 1, height: 104, borderRadius: 22, background: i === 2 ? 'linear-gradient(160deg, #2DD4BF, #0E9488)' : '#F1ECFB', boxShadow: i === 2 ? '0 6px 0 #0A6B62' : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                  <Tx size={20} color={i === 2 ? '#D9FFF8' : SLATE}>{d}</Tx><Tx size={36} color={i === 2 ? '#fff' : INK}>{n}</Tx>
                </div>
              ))}
            </div>
            <Tx size={24} color={SLATE}>Pick a time</Tx>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
              {SLOTS.map((s, i) => {
                const sel = i === 2 && picked;
                return (
                  <div key={s} style={{height: 78, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? 'linear-gradient(160deg, #FFD15C, #FF9A1F)' : '#F1ECFB', boxShadow: sel ? '0 6px 0 #B86A00' : undefined, transform: `scale(${sel ? 0.9 + 0.1 * pick : 1})`}}>
                    <Tx size={27} color={INK}>{s}</Tx>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop: 6, transform: `scale(${1 + 0.06 * Math.sin(Math.PI * cl((p - 0.48) / 0.1))})`}}>
              <Chip w="100%" h={84} r={42} c={confirmed ? GREEN : '#0E9488'} depth={8}><Tx size={32} color="#fff">{confirmed ? 'Booked' : 'Confirm booking'}</Tx></Chip>
            </div>
          </div>
        </Phone>
      </At>
      {/* reminder card with a ringing bell */}
      <At x={900} y={400 + 8 * osc(1, 0.3)} rot={5} scale={on(0.62)}>
        <Card w={400} style={{padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{transform: `rotate(${16 * osc(4)}deg)`, transformOrigin: '50% 10%'}}>
            <svg width={90} height={96} viewBox="0 0 100 106" style={{overflow: 'visible'}}>
              <path d="M50 16C32 16 26 32 26 50v16L14 80h72L74 66V50c0-18-6-34-24-34z" fill="#C96A00" transform="translate(0 6)" />
              <path d="M50 12C32 12 26 28 26 46v16L14 76h72L74 62V46c0-18-6-34-24-34z" fill="#FFC61A" /><circle cx="50" cy="88" r="9" fill="#FFC61A" /><circle cx="50" cy="10" r="7" fill="#FFC61A" />
            </svg>
          </div>
          <div><Tx size={28} color={INK}>Reminder sent</Tx><br /><Tx size={23} color={SLATE} w={400}>Wed 14 · 2:00 PM</Tx></div>
        </Card>
      </At>
      {/* customer + clock */}
      <At x={960} y={690 + 8 * osc(1, 0.15)}><Face size={170} c="#FF9ACB" /></At>
      <At x={960} y={690} scale={on(0.56)}><div style={{transform: 'translate(70px, 60px)'}}><Tick size={76} /></div></At>
      <At x={850} y={930 + 8 * osc(1, 0.3)}>
        <svg width={220} height={234} viewBox="0 0 230 244" style={{overflow: 'visible'}}>
          <circle cx="115" cy="129" r="108" fill="#0A6B62" /><circle cx="115" cy="115" r="108" fill="#2DD4BF" /><circle cx="115" cy="115" r="86" fill="#fff" />
          <path d="M115 115V58" stroke={INK} strokeWidth={12} strokeLinecap="round" transform={`rotate(${p * 360} 115 115)`} />
          <path d="M115 115h38" stroke="#F0428D" strokeWidth={12} strokeLinecap="round" transform={`rotate(${p * 720} 115 115)`} />
          <circle cx="115" cy="115" r="12" fill={INK} />
        </svg>
      </At>
      <At x={330} y={160} rot={-5} scale={on(0.58)}><Toast text="Booking confirmed" size={36} /></At>
      <Glints pts={[[1050, 250, 56], [150, 480, 50], [170, 900, 46], [640, 1100, 44]]} />
    </Stage>
  );
};

// ---------- 15 · …and many more ----------
const RING: [GName, string][] = [['chat', GREEN], ['cam', '#F0428D'], ['mail', '#FF7A3D'], ['globe', '#2B7BFF'], ['pin', '#EF4444'], ['play', '#7B3FF2'], ['heart', '#F0428D'], ['call', '#12A5D6'], ['img', '#FFB21F'], ['fork', '#109C4B']];
const GRID: [GName, string][] = [['pin', '#F0428D'], ['chat', GREEN], ['img', '#7B3FF2'], ['play', '#EF4444'], ['mail', '#2B7BFF'], ['heart', '#FF7A3D'], ['globe', '#12A5D6'], ['cam', '#F0428D']];
export const ManyMore: React.FC = () => {
  const {p, osc, on} = useLoop();
  return (
    <Stage c={['#FFEDC2', '#FF7A3D', '#7B2FE0']}>
      <Confetti n={18} />
      {/* ten features circling; one-tenth of a turn per loop lands each on the next one's place */}
      {RING.map(([g, c], i) => {
        const a = Math.PI * 2 * ((i + p) / RING.length);
        return <At key={i} x={600 + 455 * Math.cos(a)} y={560 + 400 * Math.sin(a)} rot={10 * Math.sin(a * 2)} scale={0.92 + 0.08 * Math.sin(a * 3)}><Icon name={g} size={128} c={c} /></At>;
      })}
      <Floor x={600} y={850} w={520} />
      <At x={600} y={560 + 8 * osc()} rot={-3 + 1.5 * osc(1, 0.25)}>
        <Card w={500} h={500} r={60} style={{padding: 34, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 22, placeItems: 'center'}}>
          {GRID.map(([g, c], i) => <div key={i} style={{transform: `scale(${on(0.04 + i * 0.07)})`}}><Icon name={g} size={116} c={c} /></div>)}
          <div style={{transform: `scale(${on(0.62) * (1 + 0.1 * Math.abs(osc(2)))})`}}>
            <Chip w={116} h={116} r={32} c="#FFC61A" depth={9}><Tx size={90} color={INK} style={{lineHeight: 1}}>+</Tx></Chip>
          </div>
        </Card>
      </At>
      {[[-1, 250], [1, 250]].map(([sx, y], i) => <At key={i} x={600 + sx * 330} y={y + 10 * osc(1, i * 0.3)} rot={sx * 14} scale={on(0.66 + i * 0.05)}><Star3D size={120} /></At>)}
      <At x={600} y={1000 + 6 * osc(1, 0.2)} rot={-3} scale={0.96 + 0.04 * osc(2)}>
        <Chip w={620} h={150} r={75} c="#FFC61A" depth={16}><Tx size={84} color={INK}>&amp; Many More</Tx></Chip>
      </At>
      <Glints pts={[[150, 250, 60], [1060, 260, 56], [130, 900, 50], [1070, 900, 50]]} />
    </Stage>
  );
};
