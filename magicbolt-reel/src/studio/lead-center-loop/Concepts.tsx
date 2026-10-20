// Three concept loops for Lead Center (1200x1200, 4 s, seamless). Each is a full loop at sample quality.
import React from 'react';
import {At, Card, Chip, Face, Floor, Glints, Stage, Tx, useLoop} from '../../glow/parts';
import {BLUE, DEEP, GOLD, LC, LEADS, NAVY, ORANGE, SLATE, Src} from './config';
import TEXT from './text.json';
import {BrandConfetti, fit, Flame3D, LeadCard, LeadRow, SRC, SrcChip, Sun3D, cl, eb, eo, leadAt, useFeed, useRows} from './parts';

const bez = (a: number[], c: number[], b: number[], t: number) => [0, 1].map((k) => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * c[k] + t * t * b[k]);

const Label: React.FC<{text: string; size?: number}> = ({text, size = 24}) => (
  <Card r={999} edge="#B8CBEF" style={{padding: `${size * 0.3}px ${size * 0.8}px`, background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)', boxShadow: '0 6px 0 #B8CBEF, 0 16px 20px rgba(14,27,77,0.3)'}}><Tx size={size} color={NAVY}>{text}</Tx></Card>
);

const InboxGlyph: React.FC<{size: number; color?: string}> = ({size, color = NAVY}) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><path d="M14 54l12-34h48l12 34v22a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z M14 54h22l6 10h16l6-10h22" fill="none" stroke={color} strokeWidth={9} strokeLinejoin="round" /></svg>
);

// ================= A · Three streams, one inbox =================
const SA: Record<Src, [number, number]> = {wa: [215, 330], web: [600, 190], google: [985, 330]};
const A_TOP = 430, A_LIST = A_TOP + 112, A_ROW = 110;
export const ConceptA: React.FC = () => {
  const {p, osc} = useLoop();
  const feed = useFeed();
  const rows = useRows(4);
  const lead = leadAt(feed.seg);
  const end = [600, A_LIST + 8 + A_ROW / 2];
  const s0 = SA[lead.src];
  const [fx, fy] = bez(s0, [(s0[0] + 600) / 2, Math.min(s0[1], 400) - 60], end, feed.fly);
  // newest row glow: fades in on landing and out before the next lead, so the loop point matches
  const hl = cl((feed.f - LC.beat.land) / 0.06) * (1 - cl((feed.f - 0.88) / 0.12));
  return (
    <Stage c={['#CDEBFF', BLUE, DEEP]}>
      <BrandConfetti n={10} />
      <svg width={1200} height={1200} style={{position: 'absolute', left: 0, top: 0}}>
        {(Object.keys(SA) as Src[]).map((k) => { const [x, y] = SA[k]; return <path key={k} d={`M${x} ${y}Q${(x + 600) / 2} ${Math.min(y, 400) - 60} 600 ${A_TOP + 10}`} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={-p * 240} opacity={0.85} />; })}
      </svg>
      <Floor x={600} y={1050} w={620} a={0.35} />
      <At x={600} y={A_TOP + 300 + 6 * osc()}>
        <Card w={640} h={580} r={46} edge="#9DB8E8" style={{overflow: 'hidden', position: 'relative', background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)'}}>
          <div style={{height: 112, background: `linear-gradient(120deg, ${DEEP}, ${BLUE})`, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', boxSizing: 'border-box'}}>
            <Chip w={70} h={70} r={22} c={GOLD} depth={6}><InboxGlyph size={44} /></Chip>
            <Tx size={fit(TEXT.Inbox.title, 46, 470)} color="#fff">{TEXT.Inbox.title}</Tx>
          </div>
          {rows.map((r) => (
            <div key={r.n} style={{position: 'absolute', left: 16, top: 112 + 8 + r.y * A_ROW, width: 608, height: A_ROW - 6, borderRadius: 26, background: r.n === feed.seg ? `rgba(253,198,11,${0.18 * hl})` : 'transparent', borderBottom: '3px solid #E2EBF8', boxSizing: 'border-box', display: 'flex', alignItems: 'center', opacity: 1 - cl(r.y - 3)}}>
              <LeadRow lead={r.lead} w={608} tag={r.tag} />
            </div>
          ))}
        </Card>
      </At>
      {feed.flying && <At x={fx} y={fy} scale={eb(cl(feed.f / 0.12)) * (0.4 + 0.6 * feed.fly)} rot={(1 - feed.fly) * (s0[0] < 600 ? -10 : s0[0] > 600 ? 10 : 0)}><LeadCard lead={lead} w={608} /></At>}
      {(Object.keys(SA) as Src[]).map((k, i) => {
        const [x, y] = SA[k];
        const act = k === lead.src ? feed.pulse : 0;
        return (
          <React.Fragment key={k}>
            <At x={x} y={y + 10 * osc(1, i * 0.2)} rot={(i - 1) * 8} scale={1 + 0.14 * act}><SrcChip src={k} size={150} /></At>
            <At x={x} y={y + 112 + 10 * osc(1, i * 0.2)}><Label text={SRC[k].label} /></At>
          </React.Fragment>
        );
      })}
      <Glints pts={[[1040, 560, 56], [150, 600, 50], [400, 140, 40], [820, 140, 40]]} />
    </Stage>
  );
};

// ================= B · Drop box =================
const SB: Record<Src, [number, number]> = {wa: [200, 470], web: [600, 215], google: [1000, 470]};
const MouthY = 700;
export const ConceptB: React.FC = () => {
  const {osc} = useLoop();
  const feed = useFeed();
  const lead = leadAt(feed.seg);
  const s0 = SB[lead.src];
  const [fx, fy] = bez(s0, [600 + (s0[0] - 600) * 0.25, 230], [600, 800], feed.fly);
  const sq = Math.sin(Math.PI * cl((feed.f - 0.5) / 0.16));
  const pin = feed.f < 0.6 ? 0 : eb(cl((feed.f - 0.6) / 0.12)) * (1 - eo(cl((feed.f - 0.88) / 0.12)));
  const rise = eo(cl((feed.f - 0.6) / 0.2));
  const pop = lead.hot ? TEXT.DropBox.hotPop : TEXT.DropBox.warmPop;
  return (
    <Stage c={['#FFF6CC', GOLD, ORANGE]}>
      <BrandConfetti n={12} c={[DEEP, BLUE, '#FFFFFF', NAVY, '#5FC2FF']} />
      {(Object.keys(SB) as Src[]).map((k, i) => {
        const [x, y] = SB[k];
        const act = k === lead.src ? feed.pulse : 0;
        return (
          <React.Fragment key={k}>
            <At x={x} y={y + 12 * osc(1, i * 0.22)} rot={(i - 1) * 10 + 3 * osc(1, i * 0.3)} scale={1 + 0.16 * act}><SrcChip src={k} size={150} /></At>
            <At x={x} y={y + 112 + 12 * osc(1, i * 0.22)}><Label text={SRC[k].label} /></At>
          </React.Fragment>
        );
      })}
      <Floor x={600} y={1035} w={680} a={0.35} />
      {/* box mouth (inside) */}
      <div style={{position: 'absolute', left: 300, top: MouthY - 50, width: 600, height: 120, borderRadius: 44, background: `linear-gradient(180deg, ${NAVY}, #1B2C6E)`, boxShadow: 'inset 0 18px 30px rgba(0,0,0,0.45)', transform: `scaleX(${1 + 0.03 * sq})`}} />
      {feed.f < 0.8 && <At x={fx} y={fy} rot={(1 - feed.fly) * 14 * Math.sign(s0[0] - 600) + 360 * feed.fly * 0} scale={1 - 0.2 * feed.fly}>
        <Card w={170} h={170} r={40} edge="#B8CBEF" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)'}}>
          <Face size={112} c={lead.face} hair={lead.hair} />
          <div style={{position: 'absolute', right: -14, bottom: -10}}><SrcChip src={lead.src} size={62} /></div>
        </Card>
      </At>}
      {/* box front */}
      <div style={{position: 'absolute', left: 300, top: MouthY, width: 600, height: 300, transformOrigin: '50% 100%', transform: `scale(${1 + 0.03 * sq}, ${1 - 0.05 * sq})`}}>
        <Chip w={600} h={300} r={50} c={BLUE} depth={20}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}><InboxGlyph size={66} color="#fff" /><Tx size={fit(TEXT.Inbox.title, 68, 440)} color="#fff">{TEXT.Inbox.title}</Tx></div>
            <Tx size={fit(TEXT.Inbox.sub, 28, 520)} color="#D6ECFF" w={400}>{TEXT.Inbox.sub}</Tx>
          </div>
        </Chip>
      </div>
      {/* hot / warm pop */}
      <At x={600} y={590 - 120 * rise} scale={pin}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <div style={{transform: `rotate(${-8 + 6 * osc(2)}deg)`, display: 'flex'}}>{lead.hot ? <Flame3D size={150} id="bfl" /> : <Sun3D size={170} id="bsn" rot={feed.f * 45} />}</div>
          <Card r={40} edge={lead.hot ? '#E0631B' : '#D8A300'} style={{padding: '18px 30px', background: 'linear-gradient(180deg, #FFFFFF, #FFF6E2)'}}>
            <Tx size={fit(pop, 50, 380)} color={lead.hot ? '#E2541B' : '#C98700'}>{pop}</Tx><br />
            <Tx size={fit(`${lead.name} · ${lead.via}`, 26, 380)} color={SLATE} w={400}>{lead.name} · {lead.via}</Tx>
          </Card>
        </div>
      </At>
      <Glints pts={[[1010, 760, 60], [190, 760, 54], [380, 180, 44], [830, 180, 44]]} />
    </Stage>
  );
};

// ================= C · Premium phone inbox =================
const NavyPhone: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const {p} = useLoop();
  const s = (p + 0.55) % 1;
  return (
    <div style={{width: 430, height: 820, borderRadius: 76, padding: 14, boxSizing: 'border-box', background: 'linear-gradient(160deg, #3B5BC4, #0A1440)', boxShadow: '0 18px 0 #060C2A, 0 48px 60px rgba(0,0,20,0.55), inset 0 3px 0 rgba(255,255,255,0.35)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 62, background: 'linear-gradient(180deg, #F4F8FF, #FFFFFF)', overflow: 'hidden', position: 'relative'}}>
        {children}
        <div style={{position: 'absolute', left: '50%', top: 14, width: 120, height: 26, borderRadius: 13, background: '#0A1440', transform: 'translateX(-50%)'}} />
        {s < 0.35 && <div style={{position: 'absolute', top: -60, left: -260 + 2000 * s, width: 130, height: 960, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0))', transform: 'skewX(-18deg)'}} />}
      </div>
    </div>
  );
};
const C_ROW = 92;
export const ConceptC: React.FC = () => {
  const {p, osc} = useLoop();
  const feed = useFeed();
  const rows = useRows(6);
  const lead = leadAt(feed.seg);
  const bin = eb(cl(feed.f / 0.12));
  const bout = eo(cl((feed.f - 0.4) / 0.18));
  const bump = Math.sin(Math.PI * cl((feed.f - LC.beat.stamp) / 0.2));
  const hotBump = lead.hot ? bump : 0, warmBump = lead.hot ? 0 : bump;
  return (
    <Stage c={['#4C7FE8', DEEP, NAVY]}>
      <BrandConfetti n={10} c={[GOLD, ORANGE, '#FFFFFF', '#5FC2FF']} />
      <Floor x={600} y={1075} w={480} a={0.45} />
      <At x={210 + 6 * osc(1, 0.1)} y={560 + 14 * osc()} rot={-10 + 4 * osc(1, 0.3)} scale={1 + 0.16 * hotBump}><Flame3D size={190} id="cfl" /></At>
      <At x={995} y={790 + 14 * osc(1, 0.4)} scale={1 + 0.16 * warmBump}><Sun3D size={210} id="csn" rot={p * 45} /></At>
      <At x={600} y={680 + 8 * osc(1, 0.2)} rot={-2} scale={0.95}>
        <NavyPhone>
          <div style={{padding: '64px 24px 0', boxSizing: 'border-box'}}>
            <Tx size={fit(TEXT.Inbox.title, 40, 350)} color={NAVY}>{TEXT.Inbox.title}</Tx><br />
            <Tx size={fit(TEXT.Inbox.sub, 20, 350)} color={SLATE} w={400}>{TEXT.Inbox.sub}</Tx>
            <div style={{display: 'flex', gap: 10, marginTop: 14}}>
              {([[NAVY, '#fff'], ['#FFE7D6', '#E2541B'], ['#FFF3C4', '#B07A00']] as const).map(([bg, c], i) => { const t = TEXT.PhoneApp.filters[i] ?? ''; return <div key={i} style={{padding: '6px 18px', borderRadius: 20, background: bg}}><Tx size={fit(t, 19, 100)} color={c}>{t}</Tx></div>; })}
            </div>
          </div>
          {rows.map((r) => (
            <div key={r.n} style={{position: 'absolute', left: 0, top: 214 + r.y * C_ROW, width: 402, height: C_ROW, borderBottom: '2px solid #E2EBF8', boxSizing: 'border-box', display: 'flex', alignItems: 'center', background: r.n === feed.seg ? 'rgba(253,198,11,0.14)' : 'transparent'}}>
              <LeadRow lead={r.lead} w={402} tag={r.tag} s={0.8} />
            </div>
          ))}
        </NavyPhone>
      </At>
      {/* incoming notification */}
      {feed.f < 0.6 && (
        <At x={600 - 40 * 0} y={150 + 140 * bout} scale={bin * (1 - 0.55 * bout)}>
          <Card r={36} edge="#9DB8E8" style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 30px 18px 18px', background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)', opacity: 1 - cl((feed.f - 0.5) / 0.08)}}>
            <SrcChip src={lead.src} size={76} />
            <div><Tx size={fit(`${TEXT.PhoneApp.notify} · ${lead.name}`, 30, 440)} color={NAVY}>{TEXT.PhoneApp.notify} · {lead.name}</Tx><br /><Tx size={fit(`${TEXT.Common.via} ${lead.via} · ${TEXT.PhoneApp.time}`, 22, 440)} color={SLATE} w={400}>{TEXT.Common.via} {lead.via} · {TEXT.PhoneApp.time}</Tx></div>
          </Card>
        </At>
      )}
      <Glints c="#FFE27A" pts={[[1010, 330, 56], [190, 860, 50], [300, 270, 40], [920, 1040, 44]]} />
    </Stage>
  );
};

export const LeadCenterConcepts: React.FC<{concept?: 'a' | 'b' | 'c'}> = ({concept = 'a'}) =>
  concept === 'b' ? <ConceptB /> : concept === 'c' ? <ConceptC /> : <ConceptA />;

export {LEADS};
