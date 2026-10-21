// Concept samples for the Way CRM intro: three looks, each shown as 4 key moments of 3 s.
//   A · Glass Showroom (bright) · B · Midnight Command (dark premium) · C · Bento Burst (brand blue)
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {LogoAnim} from '../../logo/LogoAnim';
import {BLUE, CROP, DEEP, GOLD, MOMENT, NAVY, ORANGE, SLATE, ShotName} from './config';
import TEXT from './text.json';
import {BlueBG, Crop, CtaButton, Feature, Glyph, IconChip, In, Lift, LogoImg, NavyBG, Screen, SkyBG, Sparkle, Tile, Tx, WaChip, Words, cl, eb, eo, fit, lerp, P, useSec} from './parts';

type Kind = 'a' | 'b' | 'c';

// One moment = a 3 s Sequence (so useSec() inside is moment-local) with the concept's entry transition
const Moments: React.FC<{kind: Kind; items: React.FC[]}> = ({kind, items}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {items.map((M, i) => (
        <Sequence key={i} from={i * MOMENT * fps} durationInFrames={MOMENT * fps}>
          <Enter kind={kind}><M /></Enter>
        </Sequence>
      ))}
    </>
  );
};

const Enter: React.FC<{kind: Kind; children?: React.ReactNode}> = ({kind, children}) => {
  const t = useSec();
  const k = eo(P(t, 0, kind === 'b' ? 0.45 : 0.35));
  const tf = kind === 'a' ? `scale(${lerp(1.05, 1, k)})` : kind === 'b' ? `translateX(${(1 - k) * 260}px)` : `scale(${lerp(0.88, 1, eb(P(t, 0, 0.45)))})`;
  return <AbsoluteFill style={{opacity: Math.min(1, k * 1.5), transform: tf, filter: kind === 'b' ? `blur(${(1 - k) * 12}px)` : undefined}}>{children}</AbsoluteFill>;
};

export const Abs: React.FC<{x: number; y: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>
);

export const Cursor: React.FC<{press?: number}> = ({press = 0}) => (
  <svg width={64} height={64} viewBox="0 0 100 100" style={{transform: `scale(${1 - 0.15 * press})`, filter: 'drop-shadow(0 8px 10px rgba(14,27,77,0.4))'}}>
    <path d="M18 8L82 50L52 56L66 86L54 92L40 62L18 82Z" fill={NAVY} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

export const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
export const bob = (t: number, i: number, a = 8) => a * Math.sin(t * 1.6 + i * 1.3);

// ============================ A · Glass Showroom ============================
export const RowCard: React.FC<{r: [number, number, number, number]; s: number}> = ({r, s}) => (
  <div style={{padding: 6, borderRadius: 22, background: '#fff', boxShadow: '0 22px 40px rgba(14,27,77,0.2), 0 4px 10px rgba(14,27,77,0.08)'}}><Crop name="inbox" r={r} s={s} radius={16} /></div>
);

const A1: React.FC = () => {
  const t = useSec();
  const rows = [CROP.chatRow1, CROP.chatRow2, CROP.chatRow3, CROP.chatRow4, CROP.chatRow5];
  return (
    <AbsoluteFill>
      <Abs x={130} y={330}>
        <In at={0.05} dy={20} s0={1}><Tx size={36} color={SLATE} w={400}>{TEXT.Hook.kicker}</Tx></In>
        <div style={{height: 22}} />
        <Words text={TEXT.Hook.question} at={0.25} size={fit(TEXT.Hook.question, 104, 1500)} hi={[3, 4]} maxW={860} />
      </Abs>
      {rows.map((r, i) => {
        const slip = i === 1 || i === 3;
        const kf = slip ? P(t, 1.2 + (i === 3 ? 0.15 : 0), 1.3) : 0;
        const fall = kf * kf;
        const kin = P(t, 0.1 + i * 0.12, 0.5);
        return (
          <Abs key={i} x={1080 + (slip ? 60 * fall : 0)} y={170 + i * 160 + 520 * fall - (1 - eo(kin)) * 120 + bob(t, i, 4)}
            style={{opacity: eo(Math.min(1, kin * 2)) * (1 - kf * 0.6), transform: `rotate(${(slip ? 16 : 0) * fall * (i === 1 ? 1 : -1)}deg)`}}>
            <RowCard r={r} s={1.38} />
            {slip && kf > 0 && <div style={{position: 'absolute', left: i === 1 ? 60 : -40, ...(i === 1 ? {bottom: -24} : {top: -22}), opacity: cl(kf * 4), transform: `scale(${eb(cl(kf * 3))})`}}>
              <div style={{padding: '8px 22px', borderRadius: 99, background: 'linear-gradient(180deg, #FF7A59, #E5352B)', boxShadow: '0 5px 0 #A51F17, 0 12px 20px rgba(229,53,43,0.4)'}}><Tx size={26} color="#fff">{TEXT.Hook.missed}</Tx></div>
            </div>}
          </Abs>
        );
      })}
      <Abs x={1730} y={70} style={{transform: `translateY(${bob(t, 2, 10)}px)`}}><In at={0.4} s0={0.2} rot={30}><WaChip size={150} n="12" /></In></Abs>
      <Sparkle x={1000} y={130} size={56} c={GOLD} />
      <Sparkle x={1850} y={980} size={44} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

const A2: React.FC = () => {
  const t = useSec();
  const k = eo(P(t, 0.1, 0.8));
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="chat" c="#22C55E" title={TEXT.Inbox.title} sub={TEXT.Inbox.sub} /></Abs>
      <div style={{position: 'absolute', left: 600, top: 268, perspective: 2400}}>
        <div style={{transform: `translateX(${(1 - k) * 300}px) rotateY(${lerp(-24, -9, k)}deg) rotateX(3deg)`, transformOrigin: '0% 50%', opacity: k}}>
          <Screen name="inbox" w={1230} />
        </div>
      </div>
      <Abs x={70} y={600} style={{transform: `translateY(${bob(t, 1, 6)}px)`}}>
        <In at={0.9} s0={0.6} dx={-80} dy={0}>
          <div style={{marginBottom: 18, marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 24px', borderRadius: 99, background: NAVY, boxShadow: '0 10px 24px rgba(14,27,77,0.35)'}}>
            <div style={{width: 14, height: 14, borderRadius: 7, background: GOLD, boxShadow: `0 0 12px ${GOLD}`, opacity: 0.5 + 0.5 * Math.sin(t * 8)}} />
            <Tx size={28} color="#fff">{TEXT.Inbox.alert}</Tx>
          </div>
          <Lift name="alert" r={CROP.alertCard} s={1.28} />
        </In>
      </Abs>
      <Sparkle x={612} y={600} size={50} c={GOLD} ph={1} />
    </AbsoluteFill>
  );
};

const A3: React.FC = () => {
  const t = useSec();
  const k = eo(P(t, 0.05, 0.7));
  const mv = eo(P(t, 1.0, 1.0));
  const src = TEXT.Leads.sources;
  const SRC_ICON = ['send', 'chat', 'team'] as const;
  const SRC_C = [DEEP, BLUE, ORANGE];
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="board" c={DEEP} title={TEXT.Leads.title} sub={TEXT.Leads.sub} /></Abs>
      <div style={{position: 'absolute', left: 520, top: 250, transform: `scale(${lerp(0.94, 1, k) + 0.02 * P(t, 0.8, 2.2)})`, transformOrigin: '60% 40%', opacity: k}}>
        <Screen name="board" w={1300} />
      </div>
      {src.map((s, i) => (
        <Abs key={i} x={80} y={420 + i * 150} style={{transform: `translateY(${bob(t, i, 5)}px)`}}>
          <In at={0.5 + i * 0.15} dx={-120} dy={0} s0={0.7}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 30px 14px 14px', borderRadius: 99, background: 'linear-gradient(180deg, #FFFFFF, #EAF2FF)', boxShadow: '0 8px 0 #C3D5F3, 0 22px 34px rgba(14,27,77,0.25)'}}>
              <IconChip name={SRC_ICON[i]} size={66} c={SRC_C[i]} round />
              <Tx size={fit(s, 34, 260)}>{s}</Tx>
            </div>
          </In>
        </Abs>
      ))}
      {/* the dragged lead card lifts off the board and moves to the next column */}
      <Abs x={lerp(1100, 1330, mv)} y={lerp(560, 520, mv) - 40 * Math.sin(Math.PI * mv)} style={{transform: `rotate(${lerp(-2, 3, mv)}deg)`}}>
        <In at={0.7} s0={0.6}><Lift name="board" r={CROP.dragCard} s={1.55} glow /></In>
        <div style={{position: 'absolute', left: 380, top: 150, opacity: cl((t - 0.9) * 4)}}><Cursor press={P(t, 0.9, 0.15) - P(t, 2.1, 0.15)} /></div>
      </Abs>
    </AbsoluteFill>
  );
};

export const CtaBlock: React.FC<{light?: boolean; at?: number}> = ({light, at = 1.0}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
    <In at={at} dy={30}><CtaButton text={TEXT.End.cta} size={54} /></In>
    <In at={at + 0.35} dy={16} s0={1}><Tx size={34} color={light ? '#BFD6FF' : SLATE} w={400}>{TEXT.Brand.site}</Tx></In>
  </div>
);

const A4: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      {(['dashboard', 'pipeline'] as ShotName[]).map((n, i) => (
        <div key={n} style={{position: 'absolute', left: i ? 1500 : -560, top: 300 + bob(t, i, 10), perspective: 2000, opacity: 0.55 * eo(P(t, 0.2, 0.6))}}>
          <div style={{transform: `rotateY(${i ? -28 : 28}deg)`}}><Screen name={n} w={960} /></div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 240, top: 40, width: 1440, height: 480}}><LogoAnim /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <In at={0.7} dy={30} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
          <Tx size={fit(TEXT.Brand.product, 96, 900)} g={[NAVY, DEEP, BLUE]}>{TEXT.Brand.product}</Tx>
          <Tx size={fit(TEXT.End.lead, 38, 900)} color={SLATE} w={400}>{TEXT.End.lead}</Tx>
        </In>
        <CtaBlock />
      </div>
      <Sparkle x={1500} y={760} size={60} c={GOLD} />
      <Sparkle x={420} y={820} size={46} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

// ============================ B · Midnight Command ============================
const Tilted: React.FC<{x: number; y: number; ry: number; rx?: number; k: number; from?: number; children?: React.ReactNode}> = ({x, y, ry, rx = 4, k, from = 30, children}) => (
  <div style={{position: 'absolute', left: x, top: y, perspective: 2200}}>
    <div style={{transform: `rotateY(${lerp(ry + from, ry, k)}deg) rotateX(${rx}deg)`, transformStyle: 'preserve-3d', opacity: Math.min(1, k * 2)}}>{children}</div>
  </div>
);

const B1: React.FC = () => {
  const t = useSec();
  const k = eo(P(t, 0.1, 1.1));
  const stack: ShotName[] = ['board', 'inbox', 'dashboard'];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 1010, top: 230, perspective: 2200}}>
        <div style={{transform: `rotateY(${lerp(-55, -24, k)}deg) rotateX(8deg)`, transformStyle: 'preserve-3d'}}>
          {stack.map((n, i) => {
            const d = 2 - i;
            const ki = eo(P(t, 0.15 + i * 0.18, 0.8));
            return (
              <div key={n} style={{position: 'absolute', left: 0, top: 0, transform: `translate3d(${d * 170 + (1 - ki) * 300}px, ${-d * 110 + bob(t, i, 6)}px, ${-d * 220}px)`, opacity: ki * (1 - d * 0.18)}}>
                <Screen name={n} w={980} dark />
              </div>
            );
          })}
        </div>
      </div>
      <Abs x={130} y={330}>
        <In at={0.2} dy={20} s0={1}><Tx size={46} color="#8FBFFF" w={400}>{TEXT.Hook.meet}</Tx></In>
        <In at={0.35} dy={50} s0={0.9}><Tx size={fit(TEXT.Brand.product, 150, 760)} g={['#FFFFFF', '#CFE2FF']} style={{filter: 'drop-shadow(0 10px 30px rgba(21,130,213,0.6))'}}>{TEXT.Brand.product}</Tx></In>
        <In at={0.6} dy={20} s0={1}><Tx size={52} g={[GOLD, ORANGE]}>{TEXT.Brand.by}</Tx></In>
        <div style={{marginTop: 30, width: 380 * eo(P(t, 0.8, 0.7)), height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${BLUE}, ${GOLD})`, boxShadow: `0 0 18px ${BLUE}`}} />
      </Abs>
      <Sparkle x={860} y={220} size={54} c={GOLD} />
      <Sparkle x={1820} y={900} size={40} c="#7FB8FF" ph={1.5} />
    </AbsoluteFill>
  );
};

const B2: React.FC = () => {
  const t = useSec();
  const k = eo(P(t, 0.1, 0.9));
  const kb = P(t, 0.9, 0.6);
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="bot" c={BLUE} title={TEXT.Bots.title} sub={TEXT.Bots.sub} light /></Abs>
      <Tilted x={120} y={330} ry={16} k={k} from={-30}><Screen name="bot" w={1080} dark /></Tilted>
      <Abs x={1390} y={150} style={{transform: `translateY(${bob(t, 0, 8)}px)`}}>
        <In at={0.5} dx={160} dy={0} s0={0.8}><Lift name="bot" r={CROP.testPhone} s={0.98} ring={BLUE} glow /></In>
      </Abs>
      <Abs x={1180} y={700} style={{transform: `scale(${eb(kb)}) rotate(${-12 + 6 * Math.sin(t * 2)}deg)`, opacity: cl(kb * 3)}}>
        <div style={{width: 250, height: 250, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          background: `radial-gradient(circle at 35% 28%, #FFF3B0, ${GOLD} 45%, ${ORANGE})`, boxShadow: `0 14px 0 #B8650C, 0 30px 60px rgba(0,0,0,0.5), 0 0 80px ${GOLD}88, inset 0 6px 10px rgba(255,255,255,0.8)`}}>
          <Tx size={92} color={NAVY}>{TEXT.Bots.badge}</Tx>
        </div>
      </Abs>
    </AbsoluteFill>
  );
};

const GlassStat: React.FC<{label: string; value: number; pct: number; c: string; at: number}> = ({label, value, pct, c, at}) => {
  const t = useSec();
  const k = eo(P(t, at, 1.2));
  return (
    <In at={at - 0.1} dx={-120} dy={0} s0={0.9}>
      <div style={{width: 560, padding: '26px 34px', borderRadius: 30, boxSizing: 'border-box', background: 'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))', border: '2px solid rgba(160,200,255,0.45)', boxShadow: `0 30px 60px rgba(0,0,0,0.45), 0 0 50px ${c}44, inset 0 2px 0 rgba(255,255,255,0.3)`}}>
        <Tx size={30} color="#BFD6FF" w={400}>{label}</Tx>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <Tx size={96} color="#fff">{fmt(value * k)}</Tx>
          <Tx size={40} color={c}>{(pct * k).toFixed(1)}%</Tx>
        </div>
        <div style={{marginTop: 10, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.12)'}}>
          <div style={{width: `${pct * k}%`, height: '100%', borderRadius: 7, background: `linear-gradient(90deg, ${c}, #fff)`, boxShadow: `0 0 16px ${c}`}} />
        </div>
      </div>
    </In>
  );
};

const B3: React.FC = () => {
  const t = useSec();
  const k = eo(P(t, 0.1, 0.9));
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="send" c={ORANGE} title={TEXT.Broadcast.title} light /></Abs>
      <Tilted x={760} y={270} ry={-16} k={k}><Screen name="broadcast" w={1100} dark /></Tilted>
      <Abs x={110} y={360} style={{transform: `translateY(${bob(t, 0, 5)}px)`}}><GlassStat label={TEXT.Broadcast.delivered} value={1198} pct={96.6} c="#4ADE80" at={0.6} /></Abs>
      <Abs x={110} y={640} style={{transform: `translateY(${bob(t, 1, 5)}px)`}}><GlassStat label={TEXT.Broadcast.read} value={862} pct={69.5} c={GOLD} at={0.85} /></Abs>
    </AbsoluteFill>
  );
};

const B4: React.FC = () => {
  const t = useSec();
  const kp = eb(P(t, 0.05, 0.6));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 400, top: 110, width: 1120, height: 380, borderRadius: 48, transform: `scale(${kp})`,
        background: 'linear-gradient(180deg, #FFFFFF, #E8F0FF)', boxShadow: `0 16px 0 #8FA9DE, 0 50px 90px rgba(0,0,0,0.55), 0 0 120px ${BLUE}66, inset 0 4px 0 #fff`}}>
        <div style={{position: 'absolute', left: -160, top: -50, width: 1440, height: 480, transform: 'scale(0.74)'}}><LogoAnim /></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 580, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
        <Words text={TEXT.Tagline.join(' ')} at={0.4} size={64} color="#fff" hi={[1, 3, 5]} step={0.1} />
        <CtaBlock light at={1.0} />
      </div>
      <Sparkle x={380} y={110} size={60} c={GOLD} />
      <Sparkle x={1540} y={480} size={46} c="#7FB8FF" ph={1} />
    </AbsoluteFill>
  );
};

// ============================ C · Bento Burst ============================
const BentoCrop: React.FC<{name: ShotName; r: [number, number, number, number]; s: number; x: number; y: number; at: number; rot: number; i: number}> = ({name, r, s, x, y, at, rot, i}) => {
  const t = useSec();
  return (
    <Abs x={x} y={y + bob(t, i, 7)} style={{transform: `rotate(${rot}deg)`}}>
      <In at={at} s0={0.4} rot={rot * 3} dy={60}>
        <Tile w={r[2] * s + 24} h={r[3] * s + 24} pad={12} r={30}><Crop name={name} r={r} s={s} radius={20} /></Tile>
      </In>
    </Abs>
  );
};

const C1: React.FC = () => {
  const t = useSec();
  const kc = eb(P(t, 0.05, 0.55));
  return (
    <AbsoluteFill>
      <BentoCrop name="inbox" r={CROP.chatRow2} s={1.0} x={90} y={90} at={0.3} rot={-4} i={0} />
      <BentoCrop name="alert" r={CROP.alertCard} s={0.92} x={1350} y={70} at={0.4} rot={3} i={1} />
      <BentoCrop name="board" r={CROP.dragCard} s={1.25} x={70} y={420} at={0.5} rot={3} i={2} />
      <BentoCrop name="broadcast" r={CROP.readStat} s={1.35} x={1420} y={410} at={0.6} rot={-3} i={3} />
      <BentoCrop name="tasks" r={CROP.taskReview} s={1.2} x={170} y={790} at={0.7} rot={-2} i={4} />
      <BentoCrop name="performance" r={CROP.salesTarget} s={1.25} x={1300} y={830} at={0.8} rot={2} i={5} />
      <div style={{position: 'absolute', left: 560, top: 330, transform: `scale(${kc})`}}>
        <Tile w={800} h={400} r={44} pad={56} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}>
          <Tx size={32} color={SLATE} w={400}>{TEXT.Hook.kicker}</Tx>
          <Words text={TEXT.Hook.question} at={0.3} size={fit(TEXT.Hook.question, 82, 1300)} hi={[3, 4, 5, 6]} hiG={[DEEP, BLUE]} maxW={690} />
        </Tile>
        <div style={{position: 'absolute', right: -50, top: -50, transform: `rotate(${12 + 5 * Math.sin(t * 2)}deg)`}}><In at={0.6} s0={0.2}><WaChip size={130} n="12" /></In></div>
      </div>
      <Sparkle x={1250} y={300} size={50} c={GOLD} />
    </AbsoluteFill>
  );
};

const C2: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      <Abs x={100} y={70}><Feature icon="team" c={ORANGE} title={TEXT.Team.title} sub={TEXT.Team.chips.join(", ")} light /></Abs>
      <Abs x={90} y={350} style={{transform: `rotate(-2deg) translateY(${bob(t, 0, 6)}px)`}}>
        <In at={0.3} s0={0.6} dx={-200} dy={0}><Tile w={1074} h={474} pad={12}><Crop name="chat" r={[480, 0, 1500, 650]} s={0.7} radius={22} /></Tile></In>
      </Abs>
      <Abs x={1010} y={560} style={{transform: `rotate(3deg) translateY(${bob(t, 1, 6)}px)`}}>
        <In at={0.55} s0={0.6} dx={200} dy={0}><Tile w={858} h={420} pad={12}><Crop name="tasks" r={[400, 100, 1180, 560]} s={0.707} radius={22} /></Tile></In>
      </Abs>
      <Abs x={1360} y={300} style={{transform: `rotate(-3deg) translateY(${bob(t, 2, 8)}px)`}}>
        <In at={1.0} s0={0.3}><Lift name="tasks" r={CROP.taskReview} s={1.3} glow /></In>
      </Abs>
    </AbsoluteFill>
  );
};

const C3: React.FC = () => {
  const t = useSec();
  const k = eo(P(t, 0.5, 1.4));
  return (
    <AbsoluteFill>
      <Abs x={100} y={80}><Feature icon="chart" c={GOLD} title={TEXT.Know.title} sub={TEXT.Know.sub} light /></Abs>
      <Abs x={1180} y={60} style={{transform: `translateY(${bob(t, 0, 6)}px)`}}>
        <In at={0.3} s0={0.5}>
          <Tile w={640} h={290} pad={40} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <Tx size={30} color={SLATE} w={400}>{TEXT.Know.salesLabel}</Tx>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
              <Tx size={118} g={[ORANGE, GOLD]} style={{filter: 'drop-shadow(0 4px 0 rgba(184,101,12,0.25))'}}>₹{(38.6 * k).toFixed(1)}L</Tx>
              <Tx size={34} color={SLATE} w={400}>{TEXT.Know.of}</Tx>
            </div>
            <div style={{height: 22, borderRadius: 11, background: '#E2EBF8', overflow: 'hidden'}}>
              <div style={{width: `${77 * k}%`, height: '100%', borderRadius: 11, background: `linear-gradient(90deg, ${DEEP}, ${BLUE}, ${GOLD})`}} />
            </div>
          </Tile>
        </In>
      </Abs>
      <Abs x={190} y={480} style={{transform: `translateY(${bob(t, 1, 5)}px)`}}>
        <In at={0.45} s0={0.7} dy={120}><Tile w={1540} h={466} pad={12}><Crop name="performance" r={CROP.perfRows} s={0.9475} radius={22} /></Tile></In>
      </Abs>
    </AbsoluteFill>
  );
};

const C4: React.FC = () => {
  const t = useSec();
  const kp = eb(P(t, 0.05, 0.55));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 310, top: 130, transform: `scale(${kp})`}}>
        <Tile w={1300} h={640} r={56} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34}}>
          <In at={0.3} s0={0.6}><LogoImg w={820} /></In>
          <In at={0.55} dy={20} s0={1}><Tx size={46} color={NAVY}>{TEXT.Brand.product} <span style={{fontWeight: 400, color: SLATE}}>· {TEXT.End.lead}</span></Tx></In>
          <CtaBlock at={0.8} />
        </Tile>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', gap: 30}}>
        {TEXT.Tagline.map((w, i) => (
          <In key={i} at={1.1 + i * 0.12} s0={0.4} dy={40}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 34px 14px 16px', borderRadius: 99, background: 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))', border: '2px solid rgba(255,255,255,0.5)', boxShadow: '0 16px 30px rgba(4,14,50,0.35)'}}>
              <div style={{width: 52, height: 52, borderRadius: 26, background: `linear-gradient(180deg, #FFE36B, ${GOLD} 50%, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Glyph name="bolt" size={34} color={NAVY} /></div>
              <Tx size={40} color="#fff">{w}</Tx>
            </div>
          </In>
        ))}
      </div>
      <Sparkle x={300} y={140} size={60} c={GOLD} />
      <Sparkle x={1640} y={760} size={50} c="#fff" ph={2} />
    </AbsoluteFill>
  );
};

export const WayCrmConcepts: React.FC<{concept?: Kind}> = ({concept = 'a'}) => {
  const BG = concept === 'a' ? SkyBG : concept === 'b' ? NavyBG : BlueBG;
  const items = concept === 'a' ? [A1, A2, A3, A4] : concept === 'b' ? [B1, B2, B3, B4] : [C1, C2, C3, C4];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <BG />
      <Moments kind={concept} items={items} />
    </AbsoluteFill>
  );
};
