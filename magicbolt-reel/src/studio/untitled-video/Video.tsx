// Way CRM intro, full video (concept A "Glass Showroom"), synced to the voiceover.
// Scene timings and cues live in config.ts (SCENES / CUE); every string in text.json.
import React from 'react';
import {AbsoluteFill, Audio, Freeze, Sequence, staticFile, useVideoConfig} from 'remotion';
import {LogoAnim} from '../../logo/LogoAnim';
import {AUDIO, BLUE, CROP, CUE, DEEP, GOLD, NAVY, ORANGE, SCENES, SceneKey, ShotName, SLATE, XFADE} from './config';
import TEXT from './text.json';
import {Abs, bob, CtaBlock, Cursor, fmt, RowCard} from './Concepts';
import {Crop, Feature, Gl, Glyph, IconChip, In, Lift, Screen, SkyBG, Sparkle, Tx, WaChip, Words, cl, eb, eo, fit, lerp, P, useSec} from './parts';

// ---------- scene wrapper: soft zoom-in, crossfade out into the next scene ----------
const Fade: React.FC<{dur: number; first?: boolean; last?: boolean; children?: React.ReactNode}> = ({dur, first, last, children}) => {
  const t = useSec();
  const kin = first ? 1 : eo(P(t, 0, XFADE));
  const kout = last ? 0 : P(t, dur, XFADE);
  return <AbsoluteFill style={{opacity: kin * (1 - kout), transform: `scale(${lerp(1.05, 1, kin) * lerp(1, 0.97, kout)})`}}>{children}</AbsoluteFill>;
};
const Scene: React.FC<{k: SceneKey; first?: boolean; last?: boolean; children?: React.ReactNode}> = ({k, first, last, children}) => {
  const {fps} = useVideoConfig();
  const s = SCENES[k];
  return (
    <Sequence from={Math.round(s.start * fps)} durationInFrames={Math.round((s.dur + (last ? 0 : XFADE)) * fps)} name={k}>
      <Fade dur={s.dur} first={first} last={last}>{children}</Fade>
    </Sequence>
  );
};

// Screenshot swinging in with a 3D tilt. side 1 = enters from the right, -1 = from the left
const Swing: React.FC<{name: ShotName; x: number; y: number; w: number; at?: number; side?: 1 | -1; ry?: number; out?: number; children?: React.ReactNode}> = ({name, x, y, w, at = 0, side = 1, ry = 9, out, children}) => {
  const t = useSec();
  const k = eo(P(t, at, 0.8));
  const ko = out === undefined ? 0 : eo(P(t, out, 0.4));
  return (
    <div style={{position: 'absolute', left: x, top: y, perspective: 2400, opacity: k * (1 - ko)}}>
      <div style={{transform: `translateX(${(1 - k) * 300 * side}px) rotateY(${-side * lerp(26, ry, k)}deg) rotateX(3deg) scale(${1 + 0.025 * P(t, at + 0.8, 5)})`, transformOrigin: side > 0 ? '0% 50%' : '100% 50%'}}>
        <Screen name={name} w={w}>{children}</Screen>
      </div>
    </div>
  );
};

// light glossy stat card that counts up
const Stat: React.FC<{label: string; value: number; pct?: number; c: string; at: number}> = ({label, value, pct, c, at}) => {
  const t = useSec();
  const k = eo(P(t, at, 1.1));
  return (
    <In at={at} dx={-140} dy={0} s0={0.8}>
      <div style={{width: 470, padding: '20px 30px', borderRadius: 28, boxSizing: 'border-box', background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)', boxShadow: `0 10px 0 #C3D5F3, 0 28px 44px rgba(14,27,77,0.25), 0 0 0 4px ${c}55`}}>
        <Tx size={28} color={SLATE} w={400}>{label}</Tx>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <Tx size={74} color={NAVY}>{fmt(value * k)}</Tx>
          {pct !== undefined && <Tx size={34} color={c}>{(pct * k).toFixed(1)}%</Tx>}
        </div>
        <div style={{marginTop: 6, height: 12, borderRadius: 6, background: '#E2EBF8'}}>
          <div style={{width: `${(pct ?? 100) * k}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${c}, ${GOLD})`}} />
        </div>
      </div>
    </In>
  );
};

const Pill: React.FC<{text: string; c?: string; dot?: boolean}> = ({text, c = NAVY, dot}) => {
  const t = useSec();
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 24px', borderRadius: 99, background: c, boxShadow: '0 10px 24px rgba(14,27,77,0.35)'}}>
      {dot && <div style={{width: 14, height: 14, borderRadius: 7, background: GOLD, boxShadow: `0 0 12px ${GOLD}`, opacity: 0.5 + 0.5 * Math.sin(t * 8)}} />}
      <Tx size={28} color="#fff">{text}</Tx>
    </div>
  );
};

const IconPill: React.FC<{icon: Gl; c: string; text: string; size?: number; maxW?: number}> = ({icon, c, text, size = 36, maxW = 300}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 30px 12px 12px', borderRadius: 99, background: 'linear-gradient(180deg, #FFFFFF, #EAF2FF)', boxShadow: '0 8px 0 #C3D5F3, 0 22px 34px rgba(14,27,77,0.25)'}}>
    <IconChip name={icon} size={size * 1.8} c={c} round />
    <Tx size={fit(text, size, maxW)}>{text}</Tx>
  </div>
);

// ============================ scenes ============================
const Hook: React.FC = () => {
  const t = useSec();
  const c = CUE.hook;
  const rows = [CROP.chatRow1, CROP.chatRow2, CROP.chatRow3, CROP.chatRow4, CROP.chatRow5];
  return (
    <AbsoluteFill>
      <Abs x={130} y={330}>
        <In at={c.kicker} dy={20} s0={1}><Tx size={40} color={SLATE} w={400}>{TEXT.Hook.kicker}</Tx></In>
        <div style={{height: 22}} />
        <Words text={TEXT.Hook.question} at={c.question} size={fit(TEXT.Hook.question, 104, 1500)} hi={[3, 4]} maxW={860} step={0.09} />
      </Abs>
      {rows.map((r, i) => {
        const slip = i === 1 || i === 3;
        const kf = slip ? P(t, c.slip + (i === 3 ? 0.25 : 0), 1.4) : 0;
        const fall = kf * kf;
        const kin = P(t, 0.15 + i * 0.16, 0.5);
        return (
          <Abs key={i} x={1080 + (slip ? 60 * fall : 0)} y={170 + i * 160 + 520 * fall - (1 - eo(kin)) * 120 + bob(t, i, 4)}
            style={{zIndex: slip && kf > 0 ? 2 : 1, opacity: eo(Math.min(1, kin * 2)) * (1 - cl((kf - 0.75) / 0.25)), transform: `rotate(${(slip ? 16 : 0) * fall * (i === 1 ? 1 : -1)}deg)`}}>
            <RowCard r={r} s={1.38} />
            {slip && kf > 0 && <div style={{position: 'absolute', left: i === 1 ? 60 : -40, ...(i === 1 ? {bottom: -24} : {top: -22}), opacity: cl(kf * 4), transform: `scale(${eb(cl(kf * 3))})`}}>
              <div style={{padding: '8px 22px', borderRadius: 99, background: 'linear-gradient(180deg, #FF7A59, #E5352B)', boxShadow: '0 5px 0 #A51F17, 0 12px 20px rgba(229,53,43,0.4)'}}><Tx size={26} color="#fff">{TEXT.Hook.missed}</Tx></div>
            </div>}
          </Abs>
        );
      })}
      <Abs x={1730} y={70} style={{transform: `translateY(${bob(t, 2, 10)}px) scale(${1 + 0.12 * Math.sin(Math.PI * P(t, c.wa, 0.4))})`}}><In at={c.wa - 0.3} s0={0.2} rot={30}><WaChip size={150} n="12" /></In></Abs>
      <Sparkle x={1000} y={130} size={56} c={GOLD} />
      <Sparkle x={1850} y={980} size={44} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

const Meet: React.FC = () => {
  const t = useSec();
  const c = CUE.meet;
  const k = eo(P(t, c.screen, 1.0));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
        <In at={c.meet} dy={20} s0={1}><Tx size={46} color={SLATE} w={400}>{TEXT.Hook.meet}</Tx></In>
        <In at={c.name} dy={50} s0={0.85}><Tx size={fit(TEXT.Brand.product, 150, 1400)} g={[NAVY, DEEP, BLUE]} style={{padding: '0 10px 10px'}}>{TEXT.Brand.product}</Tx></In>
        <In at={c.by} dy={20} s0={0.9}><Tx size={52} g={[ORANGE, GOLD]}>{TEXT.Brand.by}</Tx></In>
      </div>
      <div style={{position: 'absolute', left: 348, top: 440 + (1 - k) * 500, perspective: 2000, opacity: k}}>
        <div style={{transform: `rotateX(${lerp(40, 12, k)}deg) translateY(${-14 * P(t, 1, 3)}px)`, transformOrigin: '50% 0%'}}><Screen name="dashboard" w={1200} /></div>
      </div>
      <Sparkle x={420} y={200} size={60} c={GOLD} />
      <Sparkle x={1500} y={170} size={48} c={BLUE} ph={1} />
      <Sparkle x={1560} y={380} size={36} c={ORANGE} ph={2.4} />
    </AbsoluteFill>
  );
};

const Inbox: React.FC = () => {
  const t = useSec();
  const c = CUE.inbox;
  const s = 1230 / 2000;
  const kr = eo(P(t, c.ring, 0.5));
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="chat" c="#22C55E" title={TEXT.Inbox.title} sub={TEXT.Inbox.sub} at={c.title} /></Abs>
      <Swing name="inbox" x={600} y={268} w={1230} at={c.screen}>
        <div style={{position: 'absolute', left: 324 * s, top: 182 * s, width: 496 * s, height: 750 * s, borderRadius: 14, border: `5px solid ${GOLD}`, boxShadow: `0 0 30px ${GOLD}99, inset 0 0 30px ${GOLD}33`, opacity: kr * (1 - 0.6 * P(t, c.alert, 0.5)), transform: `scale(${lerp(1.08, 1, kr)})`}} />
      </Swing>
      <Abs x={70} y={600} style={{transform: `translateY(${bob(t, 1, 6)}px)`}}>
        <In at={c.alert} s0={0.6} dx={-80} dy={0}>
          <div style={{marginBottom: 18, marginLeft: 8}}><Pill text={TEXT.Inbox.alert} dot /></div>
          <Lift name="alert" r={CROP.alertCard} s={1.28} />
        </In>
      </Abs>
      <Abs x={1240} y={880} style={{transform: `translateY(${bob(t, 2, 5)}px)`}}>
        <In at={c.toast} s0={0.7} dy={80}><Lift name="alert" r={CROP.desktopToast} s={1.05} ring={BLUE} /></In>
      </Abs>
      <Sparkle x={612} y={600} size={50} c={GOLD} ph={1} />
    </AbsoluteFill>
  );
};

const Bots: React.FC = () => {
  const t = useSec();
  const c = CUE.bots;
  const kb = P(t, c.badge, 0.6);
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="bot" c={BLUE} title={TEXT.Bots.title} sub={TEXT.Bots.sub} at={c.title} /></Abs>
      <Swing name="bot" x={70} y={300} w={1150} at={c.screen} side={-1} />
      <Abs x={1440} y={140} style={{transform: `translateY(${bob(t, 0, 8)}px)`}}>
        <In at={c.phone} dx={160} dy={0} s0={0.8}><Lift name="bot" r={CROP.testPhone} s={0.92} ring={BLUE} /></In>
      </Abs>
      <Abs x={1230} y={700} style={{transform: `scale(${eb(kb)}) rotate(${-12 + 6 * Math.sin(t * 2)}deg)`, opacity: cl(kb * 3)}}>
        <div style={{width: 230, height: 230, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `radial-gradient(circle at 35% 28%, #FFF3B0, ${GOLD} 45%, ${ORANGE})`, boxShadow: `0 14px 0 #B8650C, 0 30px 60px rgba(14,27,77,0.35), 0 0 60px ${GOLD}88, inset 0 6px 10px rgba(255,255,255,0.8)`}}>
          <Tx size={84} color={NAVY}>{TEXT.Bots.badge}</Tx>
        </div>
      </Abs>
      <Abs x={500} y={640} style={{transform: `translateY(${bob(t, 1, 6)}px)`}}>
        <In at={c.drip} s0={0.6} dy={60}>
          <div style={{marginBottom: 16}}><Pill text={TEXT.Bots.drip} c={DEEP} dot /></div>
          <Lift name="bot" r={CROP.sequenceNode} s={1.45} />
        </In>
      </Abs>
    </AbsoluteFill>
  );
};

const Broadcast: React.FC = () => {
  const c = CUE.broadcast;
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="send" c={ORANGE} title={TEXT.Broadcast.title} sub={TEXT.Broadcast.sub} at={c.title} /></Abs>
      <Swing name="broadcast" x={640} y={300} w={1180} at={c.screen} />
      <Abs x={90} y={340}><Stat label={TEXT.Broadcast.recipients} value={1240} c={BLUE} at={c.recipients} /></Abs>
      <Abs x={90} y={560}><Stat label={TEXT.Broadcast.delivered} value={1198} pct={96.6} c="#22C55E" at={c.delivered} /></Abs>
      <Abs x={90} y={780}><Stat label={TEXT.Broadcast.read} value={862} pct={69.5} c={DEEP} at={c.read} /></Abs>
    </AbsoluteFill>
  );
};

const Leads: React.FC = () => {
  const t = useSec();
  const c = CUE.leads;
  const into = eo(P(t, c.into, 0.7));
  const mv = eo(P(t, c.move, 1.0));
  const SRC_ICON: Gl[] = ['send', 'chat', 'team'];
  const SRC_C = [DEEP, BLUE, ORANGE];
  const srcAt = [c.src0, c.src1, c.src2];
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="board" c={DEEP} title={TEXT.Leads.title} sub={TEXT.Leads.sub} at={c.title} /></Abs>
      <Swing name="pipeline" x={540} y={260} w={1300} at={0} ry={6} out={c.board} />
      {t > c.board - 0.1 && <Swing name="board" x={540} y={260} w={1300} at={c.board} ry={6} />}
      {TEXT.Leads.sources.map((s, i) => (
        <Abs key={i} x={80 + 520 * into} y={400 + i * 150 + (1 - i) * 60 * into} style={{transform: `translateY(${bob(t, i, 5)}px) scale(${1 - 0.5 * into})`, opacity: 1 - into}}>
          <In at={srcAt[i] - 0.15} dx={-120} dy={0} s0={0.7}><IconPill icon={SRC_ICON[i]} c={SRC_C[i]} text={s} size={34} /></In>
        </Abs>
      ))}
      {t < c.board + 0.4 && (
        <Abs x={720} y={600} style={{opacity: 1 - P(t, c.board, 0.3)}}>
          <In at={c.total} s0={0.5}><Lift name="pipeline" r={CROP.pipeTotal} s={1.4} glow /></In>
        </Abs>
      )}
      {t > c.board && (
        <Abs x={lerp(1150, 1385, mv)} y={lerp(560, 520, mv) - 40 * Math.sin(Math.PI * mv)} style={{transform: `rotate(${lerp(-2, 3, mv)}deg)`}}>
          <In at={c.assigned - 0.2} s0={0.6}>
            <div style={{marginBottom: 14}}><Pill text={TEXT.Leads.assigned} c={DEEP} dot /></div>
            <Lift name="board" r={CROP.dragCard} s={1.5} glow />
          </In>
          <div style={{position: 'absolute', left: 370, top: 200, opacity: cl((t - c.move + 0.3) * 4)}}><Cursor press={P(t, c.move - 0.1, 0.15) - P(t, c.move + 1.1, 0.15)} /></div>
        </Abs>
      )}
    </AbsoluteFill>
  );
};

const PROFILE_ICONS: Gl[] = ['bell', 'cal', 'link', 'tag', 'rupee', 'ticket'];
const PROFILE_C = [ORANGE, DEEP, BLUE, '#E0A800', '#22C55E', '#E5352B'];
const Profile: React.FC = () => {
  const t = useSec();
  const c = CUE.profile;
  const at = [c.i0, c.i1, c.i2, c.i3, c.i4, c.i5];
  const tr = P(t, c.tracked, 0.8);
  const CARD = {x: 762, y: 290, w: 395 + 16, h: 722 + 16};
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}>
        <Feature icon="team" c={BLUE} title={TEXT.Profile.title} sub={TEXT.Profile.sub} at={c.title} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        {TEXT.Profile.items.map((_, i) => {
          const left = i < 3, row = i % 3;
          const x1 = left ? 640 : 1280, y = 400 + row * 220;
          const x2 = left ? CARD.x : CARD.x + CARD.w;
          const k = eo(P(t, at[i] + 0.2, 0.5));
          return <line key={i} x1={x1} y1={y} x2={lerp(x1, x2, k)} y2={lerp(y, CARD.y + 160 + row * 200, k)} stroke={tr > 0 ? GOLD : '#9DB8E8'} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" strokeDashoffset={-t * 40} opacity={0.9} />;
        })}
      </svg>
      <Abs x={CARD.x} y={CARD.y} style={{transform: `translateY(${bob(t, 0, 5)}px)`}}>
        <In at={c.card} s0={0.7} dy={100}><Lift name="inbox" r={CROP.profilePanel} s={0.95} glow={tr > 0} /></In>
      </Abs>
      {TEXT.Profile.items.map((s, i) => {
        const left = i < 3, row = i % 3;
        const pulse = 1 + 0.08 * Math.sin(Math.PI * P(t, c.tracked + i * 0.08, 0.4));
        return (
          <div key={i} style={{position: 'absolute', top: 400 + row * 220 - 50, ...(left ? {right: 1920 - 640} : {left: 1280}), transform: `translateY(${bob(t, i, 5)}px) scale(${pulse})`}}>
            <In at={at[i] - 0.1} dx={left ? -100 : 100} dy={0} s0={0.5}><IconPill icon={PROFILE_ICONS[i]} c={PROFILE_C[i]} text={s} size={36} maxW={330} /></In>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Team: React.FC = () => {
  const t = useSec();
  const c = CUE.team;
  const chipAt = [c.title + 1.9, c.title + 2.55, c.approve - 0.1]; // "tasks" 43.38, "deadlines" 44.03, "approvals"
  const CHIP_ICONS: Gl[] = ['board', 'cal', 'spark'];
  const CHIP_C = [DEEP, ORANGE, '#22C55E'];
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="team" c={ORANGE} title={TEXT.Team.title} at={c.title} /></Abs>
      <Swing name="tasks" x={600} y={280} w={1240} at={c.screen} />
      {TEXT.Team.chips.map((s, i) => (
        <Abs key={i} x={110} y={300 + i * 120} style={{transform: `translateY(${bob(t, i, 4)}px)`}}>
          <In at={chipAt[i]} dx={-100} dy={0} s0={0.6}><IconPill icon={CHIP_ICONS[i]} c={CHIP_C[i]} text={s} size={32} /></In>
        </Abs>
      ))}
      <Abs x={1280} y={330} style={{transform: `rotate(-2deg) translateY(${bob(t, 1, 6)}px)`}}>
        <In at={c.approve} s0={0.4}><Lift name="tasks" r={CROP.taskReview} s={1.5} glow /></In>
      </Abs>
      <Abs x={70} y={690} style={{transform: `translateY(${bob(t, 2, 5)}px)`}}>
        <In at={c.chat} dx={-300} dy={0} s0={0.8}><Lift name="chat" r={CROP.chatThread} s={0.62} ring={BLUE} /></In>
      </Abs>
    </AbsoluteFill>
  );
};

const Perf: React.FC = () => {
  const t = useSec();
  const c = CUE.perf;
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="chart" c={GOLD} title={TEXT.Know.title} sub={TEXT.Know.sub} at={c.title} /></Abs>
      <Swing name="performance" x={600} y={290} w={1240} at={c.screen} />
      <Abs x={90} y={350} style={{transform: `translateY(${bob(t, 0, 5)}px)`}}><In at={c.calls} dx={-120} dy={0} s0={0.6}><Lift name="performance" r={CROP.callsStat} s={1.25} ring={BLUE} /></In></Abs>
      <Abs x={90} y={560} style={{transform: `translateY(${bob(t, 1, 5)}px)`}}><In at={c.meetings} dx={-120} dy={0} s0={0.6}><Lift name="performance" r={CROP.meetingsStat} s={1.25} ring={BLUE} /></In></Abs>
      <Abs x={90} y={770} style={{transform: `translateY(${bob(t, 2, 5)}px)`}}><In at={c.sales} dx={-120} dy={0} s0={0.5}><Lift name="performance" r={CROP.salesTarget} s={1.25} glow /></In></Abs>
    </AbsoluteFill>
  );
};

const Dots: React.FC = () => {
  const t = useSec();
  return (
    <div style={{display: 'flex', gap: 8, padding: '14px 20px', borderRadius: 22, background: '#EAF2FF', alignSelf: 'flex-start'}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: 12, height: 12, borderRadius: 6, background: BLUE, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i * 0.9))}} />)}
    </div>
  );
};

const Control: React.FC = () => {
  const t = useSec();
  const c = CUE.control;
  const ans = t >= c.answer;
  return (
    <AbsoluteFill>
      <Abs x={110} y={80}><Feature icon="lock" c={DEEP} title={TEXT.Control.title} sub={TEXT.Control.sub} at={c.title} /></Abs>
      <Swing name="staff" x={600} y={290} w={1240} at={c.screen}>
        {/* glow ring on the "access removed" toast, on "who sees what" */}
        <div style={{position: 'absolute', left: 1386 * 0.62, top: 1092 * 0.62, width: 576 * 0.62, height: 120 * 0.62, borderRadius: 12, border: `4px solid ${GOLD}`, boxShadow: `0 0 26px ${GOLD}`, opacity: eo(P(t, c.toast, 0.4)), transform: `scale(${lerp(1.15, 1, eo(P(t, c.toast, 0.4)))})`}} />
      </Swing>
      <Abs x={80} y={420} style={{transform: `translateY(${bob(t, 0, 6)}px)`}}>
        <In at={c.ai} s0={0.5} dx={-150} dy={0}>
          <div style={{width: 620, padding: 28, borderRadius: 34, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18, background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)', boxShadow: `0 12px 0 #C3D5F3, 0 34px 60px rgba(14,27,77,0.3), 0 0 0 5px ${GOLD}`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <IconChip name="bot" size={74} c={BLUE} />
              <Tx size={40}>{TEXT.Control.aiLabel}</Tx>
              <div style={{marginLeft: 'auto'}}><Glyph name="spark" size={40} color={GOLD} /></div>
            </div>
            <In at={c.ai + 0.3} dy={20} s0={0.9} style={{alignSelf: 'flex-end'}}>
              <div style={{padding: '14px 22px', borderRadius: '24px 24px 6px 24px', background: `linear-gradient(135deg, ${DEEP}, ${BLUE})`}}><Tx size={fit(TEXT.Control.question, 28, 470)} color="#fff" w={400}>{TEXT.Control.question}</Tx></div>
            </In>
            {ans ? (
              <In at={c.answer} dy={20} s0={0.9}>
                <div style={{padding: '14px 22px', borderRadius: '24px 24px 24px 6px', background: '#EAF2FF', border: '2px solid #C9DCFA'}}><Tx size={fit(TEXT.Control.answer, 28, 520)} color={NAVY} wrap style={{maxWidth: 540}}>{TEXT.Control.answer}</Tx></div>
              </In>
            ) : t > c.ai + 0.6 ? <Dots /> : null}
          </div>
        </In>
      </Abs>
    </AbsoluteFill>
  );
};

const TAG_SHOTS: ShotName[] = ['inbox', 'pipeline', 'performance'];
const TAG_ICONS: Gl[] = ['chat', 'rupee', 'chart'];
const TAG_C = ['#22C55E', ORANGE, DEEP];
const Tagline: React.FC = () => {
  const t = useSec();
  const c = CUE.tagline;
  const at = [c.l0, c.l1, c.l2];
  return (
    <AbsoluteFill>
      {TEXT.Tagline.map((s, i) => {
        const cx = 330 + i * 630;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: cx - 262, top: 200 + bob(t, i, 8), perspective: 1600}}>
              <In at={at[i] - 0.2} dy={120} s0={0.6} rot={(i - 1) * 8}>
                <div style={{transform: `rotateY(${(1 - i) * 14}deg)`}}><Screen name={TAG_SHOTS[i]} w={500} /></div>
              </In>
            </div>
            <div style={{position: 'absolute', left: cx - 300, width: 600, top: 640, display: 'flex', justifyContent: 'center'}}>
              <In at={at[i]} s0={0.4} dy={60}><IconPill icon={TAG_ICONS[i]} c={TAG_C[i]} text={s} size={50} maxW={400} /></In>
            </div>
          </React.Fragment>
        );
      })}
      <Sparkle x={640} y={170} size={56} c={GOLD} />
      <Sparkle x={1280} y={900} size={48} c={BLUE} ph={1.4} />
      <Sparkle x={160} y={880} size={40} c={ORANGE} ph={2.2} />
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const t = useSec();
  const {fps} = useVideoConfig();
  const c = CUE.cta;
  return (
    <AbsoluteFill>
      {(['dashboard', 'pipeline'] as ShotName[]).map((n, i) => (
        <div key={n} style={{position: 'absolute', left: i ? 1500 : -560, top: 300 + bob(t, i, 10), perspective: 2000, opacity: 0.55 * eo(P(t, 0.2, 0.6))}}>
          <div style={{transform: `rotateY(${i ? -28 : 28}deg)`}}><Screen name={n} w={960} /></div>
        </div>
      ))}
      {/* logo builds, then holds (LogoAnim exits at 4.3 s, so freeze it once built) */}
      <div style={{position: 'absolute', left: 240, top: 40, width: 1440, height: 480}}>
        {t < 3.3 ? <LogoAnim /> : <Freeze frame={Math.round(3.3 * fps)}><LogoAnim /></Freeze>}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <In at={c.name} dy={30} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
          <Tx size={fit(TEXT.Brand.product, 96, 900)} g={[NAVY, DEEP, BLUE]}>{TEXT.Brand.product}</Tx>
          <Tx size={fit(TEXT.End.lead, 38, 900)} color={SLATE} w={400}>{TEXT.End.lead}</Tx>
        </In>
        <CtaBlock at={c.cta} />
      </div>
      <Sparkle x={1500} y={760} size={60} c={GOLD} />
      <Sparkle x={420} y={820} size={46} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

export const WayCrmVideo: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <SkyBG />
    <Scene k="hook" first><Hook /></Scene>
    <Scene k="meet"><Meet /></Scene>
    <Scene k="inbox"><Inbox /></Scene>
    <Scene k="bots"><Bots /></Scene>
    <Scene k="broadcast"><Broadcast /></Scene>
    <Scene k="leads"><Leads /></Scene>
    <Scene k="profile"><Profile /></Scene>
    <Scene k="team"><Team /></Scene>
    <Scene k="perf"><Perf /></Scene>
    <Scene k="control"><Control /></Scene>
    <Scene k="tagline"><Tagline /></Scene>
    <Scene k="cta" last><Cta /></Scene>
    <Audio src={staticFile(AUDIO.src)} />
  </AbsoluteFill>
);
