// MagicBolt AI agency intro, full video (concept A "Glass Showroom"), synced to the voiceover.
// Scene timings and cues live in config.ts (SCENES / CUE); every string in text.json.
import React from 'react';
import {AbsoluteFill, Freeze, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import {LogoAnim} from '../../logo/LogoAnim';
import {BLUE, CROP, CUE, DEEP, GOLD, NAVY, ORANGE, SCENES, SceneKey, ShotName, SLATE, XFADE} from './config';
import TEXT from './text.json';
import {JUGGLE, Ring, Swing} from './Concepts';
import {Abs, bob, ChannelChip, CtaButton, Feature, Gl, Glyph, IconChip, IconPill, In, Lift, LogoImg, Screen, shotSrc, SkyBG, Sparkle, Tx, Words, cl, eb, eo, fit, lerp, P, useSec} from './parts';

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

const Pill: React.FC<{text: string; c?: string}> = ({text, c = NAVY}) => {
  const t = useSec();
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 24px', borderRadius: 99, background: c, boxShadow: '0 10px 24px rgba(14,27,77,0.35)'}}>
      <div style={{width: 14, height: 14, borderRadius: 7, background: GOLD, boxShadow: `0 0 12px ${GOLD}`, opacity: 0.5 + 0.5 * Math.sin(t * 8)}} />
      <Tx size={fit(text, 28, 460)} color="#fff">{text}</Tx>
    </div>
  );
};

// a Lift with a small navy pill above it, floating
const Callout: React.FC<{x: number; y: number; at: number; label?: string; i?: number; dx?: number; children?: React.ReactNode}> = ({x, y, at, label, i = 0, dx = -120, children}) => {
  const t = useSec();
  return (
    <Abs x={x} y={y} style={{transform: `translateY(${bob(t, i, 6)}px)`, zIndex: 5}}>
      <In at={at} s0={0.55} dx={dx} dy={0}>
        {label && <div style={{marginBottom: 16, marginLeft: 8}}><Pill text={label} /></div>}
        {children}
      </In>
    </Abs>
  );
};

const RED_BADGE: React.CSSProperties = {position: 'absolute', right: -14, top: -14, minWidth: 44, height: 44, padding: '0 8px', borderRadius: 99, background: 'linear-gradient(180deg, #FF7A59, #E5352B)', boxShadow: '0 4px 0 #A51F17, 0 8px 14px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'};

// ============================ scenes ============================
const Hook: React.FC = () => {
  const t = useSec();
  const c = CUE.hook;
  const kc = eo(P(t, c.collapse, 0.5)); // everything pulls into the centre before "MagicBolt AI"
  const rush = Math.max(0, t - c.pressure);
  const minis: [ShotName, number, number, number][] = [['calendar', 1180, 260, -8], ['billing', 1470, 470, 7], ['inbox', 1210, 620, -4]];
  return (
    <AbsoluteFill>
      <Abs x={130} y={320}>
        <In at={c.kicker} dy={20} s0={1}><Tx size={42} color={SLATE} w={400}>{TEXT.Hook.kicker}</Tx></In>
        <div style={{height: 24}} />
        {TEXT.Hook.lines.map((line, i) => (
          <Words key={i} text={line} at={i ? c.line1 : c.line0} size={fit(line, 100, 860)} hi={[line.split(' ').length - 1]} step={0.12} />
        ))}
      </Abs>
      {minis.map(([n, x, y, r], i) => (
        <Abs key={n} x={lerp(x, 1330, kc) + 8 * Math.sin(t * (2.3 + rush) + i)} y={lerp(y, 420, kc) + bob(t, i, 6)} style={{transform: `rotate(${r + (2 + rush * 2) * Math.sin(t * 1.7 + i)}deg) scale(${1 - 0.6 * kc})`, opacity: 1 - kc}}>
          <In at={c.screens + i * 0.2} s0={0.6} dy={80}><Screen name={n} w={420} /></In>
        </Abs>
      ))}
      {JUGGLE.map((j, i) => {
        const a = t * 1.25 + 0.5 * rush * rush + (i * Math.PI * 2) / JUGGLE.length;
        const R = 1 - kc;
        const x = 1440 + 400 * R * Math.cos(a), y = 520 + 330 * R * Math.sin(a) - 50 * R * Math.abs(Math.sin(a * 2 + t));
        const k = eb(P(t, c.chips - 0.9 + i * 0.1, 0.5));
        return (
          <Abs key={i} x={x - 60} y={y - 60} style={{transform: `scale(${k * (1 - 0.5 * kc)}) rotate(${18 * Math.sin(a * 1.5)}deg)`, zIndex: Math.sin(a) > 0 ? 3 : 1}}>
            {j.id ? <ChannelChip id={j.id} size={120} /> : <IconChip name={j.icon!} size={120} c={j.c!} />}
            {j.n && <div style={RED_BADGE}><Tx size={24} color="#fff">{String(Number(j.n) + Math.floor(rush * 4))}</Tx></div>}
          </Abs>
        );
      })}
      <Sparkle x={1000} y={130} size={56} c={GOLD} />
      <Sparkle x={1860} y={990} size={44} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

const Meet: React.FC = () => {
  const t = useSec();
  const c = CUE.meet;
  const k = eo(P(t, c.screen, 1.0));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
        <In at={c.meet} dy={20} s0={1}><Tx size={46} color={SLATE} w={400}>{TEXT.Meet.meet}</Tx></In>
        <In at={c.name} dy={50} s0={0.85}><Tx size={fit(TEXT.Brand.product, 150, 1400)} g={[NAVY, DEEP, BLUE]} style={{padding: '0 10px 10px'}}>{TEXT.Brand.product}</Tx></In>
        <In at={c.lead} dy={20} s0={0.9}><Tx size={fit(TEXT.Meet.lead, 52, 1300)} g={[ORANGE, GOLD]}>{TEXT.Meet.lead}</Tx></In>
      </div>
      <div style={{position: 'absolute', left: 360, top: 450 + (1 - k) * 500, perspective: 2000, opacity: k}}>
        <div style={{transform: `rotateX(${lerp(40, 12, k)}deg) translateY(${-14 * P(t, 1, 3)}px)`, transformOrigin: '50% 0%'}}><Screen name="dashboard" w={1200} /></div>
      </div>
      {/* the juggled platforms fly into the one dashboard on "it all into one" */}
      {JUGGLE.map((j, i) => {
        const a = (i * Math.PI * 2) / JUGGLE.length + 0.6;
        const kf = eo(P(t, c.into - 0.6 + i * 0.06, 0.7));
        const x = lerp(960 + 760 * Math.cos(a), 960, kf), y = lerp(560 + 380 * Math.sin(a), 760, kf);
        return kf < 1 ? (
          <Abs key={i} x={x - 50} y={y - 50} style={{transform: `scale(${lerp(1, 0.2, kf)}) rotate(${(1 - kf) * 20}deg)`, opacity: Math.min(1, P(t, 0, 0.3) * 2) * (1 - P(kf, 0.8, 0.2))}}>
            {j.id ? <ChannelChip id={j.id} size={100} /> : <IconChip name={j.icon!} size={100} c={j.c!} />}
          </Abs>
        ) : null;
      })}
      <div style={{position: 'absolute', left: 960 - 300, top: 760 - 300, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(closest-side, ${GOLD}88, ${GOLD}00)`, opacity: Math.sin(Math.PI * P(t, c.into, 0.9)), pointerEvents: 'none'}} />
      <Sparkle x={420} y={200} size={60} c={GOLD} />
      <Sparkle x={1500} y={170} size={48} c={BLUE} ph={1} />
    </AbsoluteFill>
  );
};

const White: React.FC = () => {
  const c = CUE.white;
  const times = [c.w0, c.w1, c.w2, c.w3, c.w4, c.w5];
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="globe" c={DEEP} title={TEXT.WhiteLabel.title} sub={TEXT.WhiteLabel.sub} maxW={1000} at={c.w0 - 0.3} times={times} hi={[1, 3, 5]} /></Abs>
      <Swing name="whitelabel" x={560} y={330} w={1180} at={c.screen} />
      <Callout x={1440} y={240} at={c.w1} dx={120} i={0}><Lift name="whitelabel" r={CROP.loginCard} s={1.0} glow /></Callout>
      <Callout x={70} y={700} at={c.w3} i={1}><Lift name="whitelabel" r={CROP.domain} s={0.82} /></Callout>
      <Callout x={1500} y={640} at={c.w5} dx={120} i={2}><Lift name="plans" r={CROP.growthCard} s={0.92} glow /></Callout>
      <Sparkle x={1430} y={230} size={54} c={GOLD} ph={1} />
    </AbsoluteFill>
  );
};

const Channels: React.FC = () => {
  const t = useSec();
  const c = CUE.channels;
  const ids = ['google', 'facebook', 'instagram', 'whatsapp'];
  const at = [c.c0, c.c1, c.c2, c.c3];
  const s = 1150 / 1920;
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="send" c={BLUE} title={TEXT.Channels.title} sub={TEXT.Channels.sub} maxW={980} at={c.title} /></Abs>
      <Swing name="channels" x={640} y={330} w={1150} at={c.screen}>
        <Ring r={[329, 200, 370, 236]} s={s} at={c.c0} out={c.single - 0.2} />
        <Ring r={CROP.weekStats} s={s} at={c.single} />
      </Swing>
      {TEXT.Channels.items.map((label, i) => (
        <Abs key={i} x={70} y={380 + i * 150} style={{transform: `translateY(${bob(t, i, 5)}px) scale(${1 + 0.06 * Math.sin(Math.PI * P(t, c.single + i * 0.08, 0.4))})`, zIndex: 5}}>
          <In at={at[i] - 0.15} dx={-160} dy={0} s0={0.6}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '12px 34px 12px 12px', borderRadius: 99, background: 'linear-gradient(180deg, #FFFFFF, #EAF2FF)', boxShadow: '0 8px 0 #C3D5F3, 0 22px 34px rgba(14,27,77,0.25)'}}>
              <ChannelChip id={ids[i]} size={72} />
              <Tx size={fit(label, 34, 380)}>{label}</Tx>
            </div>
          </In>
        </Abs>
      ))}
    </AbsoluteFill>
  );
};

const Calendar: React.FC = () => {
  const t = useSec();
  const c = CUE.calendar;
  const ids = ['google', 'facebook', 'instagram', 'whatsapp'];
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="cal" c={DEEP} title={TEXT.Calendar.title} sub={TEXT.Calendar.sub} maxW={1000} at={c.title} /></Abs>
      <Swing name="composer" x={620} y={330} w={1180} at={c.screen} out={c.swap} />
      {t > c.swap - 0.1 && <Swing name="calendar" x={620} y={330} w={1180} at={c.swap} />}
      <Abs x={90} y={400} style={{transform: `translateY(${bob(t, 0, 5)}px)`}}>
        <In at={c.title + 0.4} dx={-120} dy={0} s0={0.7}><Pill text={TEXT.Calendar.write} c={DEEP} /></In>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 120px)', gap: 30, marginTop: 40, marginLeft: 20}}>
          {ids.map((id, i) => (
            <In key={id} at={c.chips + i * 0.14} s0={0.2} rot={-20} dy={0}>
              <div style={{position: 'relative'}}>
                <ChannelChip id={id} size={110} />
                <div style={{...RED_BADGE, right: -10, top: -10, background: `linear-gradient(180deg, #FFE36B, ${GOLD} 50%, ${ORANGE})`, boxShadow: '0 4px 0 #B8650C'}}><Glyph name="cal" size={26} color={NAVY} /></div>
              </div>
            </In>
          ))}
        </div>
      </Abs>
      <Callout x={1470} y={230} at={c.day} dx={120} i={1}><Lift name="calendar" r={CROP.dayCard} s={0.95} glow /></Callout>
    </AbsoluteFill>
  );
};

const Ai: React.FC = () => {
  const c = CUE.ai;
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="spark" c={BLUE} title={TEXT.AI.title} sub={TEXT.AI.sub} maxW={1000} at={c.title} /></Abs>
      <Swing name="agent" x={640} y={330} w={1150} at={c.screen} />
      <Callout x={70} y={350} at={c.post} label={TEXT.AI.post} i={0}><Lift name="agent" r={CROP.aiDraft} s={0.7} glow /></Callout>
      <Callout x={1130} y={780} at={c.reply} label={TEXT.AI.reply} dx={120} i={1}><Lift name="inbox" r={CROP.reviewDraft} s={0.85} ring={BLUE} /></Callout>
      <Sparkle x={600} y={380} size={60} c={GOLD} />
    </AbsoluteFill>
  );
};

const Rank: React.FC = () => {
  const c = CUE.rank;
  const s = 1150 / 1920;
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="pin" c={ORANGE} title={TEXT.Rank.title} sub={TEXT.Rank.sub} maxW={900} at={c.title} /></Abs>
      <Swing name="rank" x={640} y={330} w={1150} at={c.screen}>
        <Ring r={CROP.rankGrid} s={s} at={c.map} out={c.compete} />
      </Swing>
      <Callout x={70} y={360} at={c.audit} label={TEXT.Rank.audit} i={0}><Lift name="audit" r={CROP.auditScore} s={0.78} /></Callout>
      <Callout x={1240} y={560} at={c.compete} label={TEXT.Rank.compete} dx={120} i={1}><Lift name="rank" r={CROP.headToHead} s={0.78} glow /></Callout>
    </AbsoluteFill>
  );
};

const Qr: React.FC = () => {
  const c = CUE.qr;
  const s = 1150 / 1920;
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="qr" c={DEEP} title={TEXT.QR.title} sub={TEXT.QR.sub} maxW={1100} at={c.title} /></Abs>
      <Swing name="reviews" x={640} y={330} w={1150} at={c.screen}>
        <Ring r={CROP.phones} s={s} at={c.reviews} out={c.web - 0.3} />
      </Swing>
      <Callout x={90} y={350} at={c.qr} i={0}><Lift name="smartCard" r={CROP.qrCard} s={0.88} glow /></Callout>
      <Callout x={1080} y={640} at={c.web} label={TEXT.QR.web} dx={120} i={1}><Lift name="menu" r={CROP.website} s={0.62} ring={BLUE} /></Callout>
    </AbsoluteFill>
  );
};

const STEP_ICON: [Gl, string][] = [['team', BLUE], ['doc', DEEP], ['bolt', ORANGE], ['rupee', GOLD], ['send', BLUE]];
const STEP_SHOT: ShotName[] = ['clients', 'plans', 'allot', 'billing', 'mailing'];
const Agency: React.FC = () => {
  const t = useSec();
  const c = CUE.agency;
  const at = [c.s0, c.s1, c.s2, c.s3, c.s4];
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="team" c={ORANGE} title={TEXT.Agency.title} sub={TEXT.Agency.sub} maxW={1050} at={c.title} /></Abs>
      <Swing name="dashboard" x={640} y={300} w={1180} at={c.screen}>
        {STEP_SHOT.map((n, i) => (
          <Img key={n} src={shotSrc(n)} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: eo(P(t, at[i] - 0.1, 0.35))}} />
        ))}
        <div style={{position: 'absolute', inset: 0, borderRadius: 20, boxShadow: `inset 0 0 0 6px ${GOLD}, inset 0 0 40px ${GOLD}88`, opacity: Math.sin(Math.PI * P(t, c.all, 1.2))}} />
      </Swing>
      {TEXT.Agency.steps.map((s, i) => (
        <Abs key={i} x={70} y={330 + i * 128} style={{transform: `translateY(${bob(t, i, 4)}px) scale(${1 + 0.07 * Math.sin(Math.PI * P(t, c.all + i * 0.1, 0.45))})`, zIndex: 5}}>
          <In at={at[i] - 0.15} dx={-140} dy={0} s0={0.6}><IconPill icon={STEP_ICON[i][0]} c={STEP_ICON[i][1]} text={s} size={32} maxW={380} /></In>
        </Abs>
      ))}
    </AbsoluteFill>
  );
};

const Brand: React.FC = () => {
  const t = useSec();
  const c = CUE.brand;
  const url = TEXT.Brand.domain;
  const shown = url.slice(0, Math.round(url.length * P(t, c.domain, 0.6)));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center'}}>
        <Words text={TEXT.ClientView.kicker} at={c.card} size={fit(TEXT.ClientView.kicker, 64, 1500)} />
      </div>
      {/* URL bar types the agency's domain on "your domain" */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center'}}>
        <In at={c.domain - 0.25} s0={0.6} dy={-30}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, minWidth: 560, padding: '16px 30px', borderRadius: 99, background: '#fff', boxShadow: `0 0 0 4px ${GOLD}, 0 18px 40px rgba(14,27,77,0.22)`}}>
            <Glyph name="lock" size={36} color="#22A45D" />
            <Tx size={38} w={400}>{shown}<span style={{opacity: P(t, c.domain, 0.6) < 1 && Math.sin(t * 12) > 0 ? 1 : 0, color: BLUE}}>|</span></Tx>
          </div>
        </In>
      </div>
      <div style={{position: 'absolute', left: (1920 - 508) / 2, top: 320, transform: `translateY(${bob(t, 0, 6)}px)`}}>
        <In at={c.card + 0.2} s0={0.6} dy={120}><Lift name="whitelabel" r={CROP.loginCard} s={1.45} glow={t > c.brand} /></In>
      </div>
      <Abs x={170} y={520} style={{transform: `translateY(${bob(t, 1, 6)}px)`}}>
        <In at={c.brand - 0.1} dx={-140} dy={0} s0={0.5}><IconPill icon="brush" c={ORANGE} text={TEXT.ClientView.brand} size={44} maxW={360} /></In>
      </Abs>
      <div style={{position: 'absolute', left: 1330, top: 380, display: 'flex', flexDirection: 'column', gap: 34}}>
        {TEXT.ClientView.prices.map((p, i) => (
          <div key={i} style={{transform: `translateY(${bob(t, i + 2, 5)}px) rotate(${(i - 1) * 3}deg)`}}>
            <In at={c.prices - 0.1 + i * 0.15} s0={0.3} dx={120} dy={0}>
              <div style={{display: 'inline-flex', alignItems: 'baseline', gap: 6, padding: '16px 34px', borderRadius: 26, background: `linear-gradient(180deg, #FFE36B, ${GOLD} 45%, ${ORANGE})`, boxShadow: `0 8px 0 #B8650C, 0 22px 36px rgba(247,148,29,0.4), inset 0 4px 6px rgba(255,255,255,0.7)`}}>
                <Tx size={52} color={NAVY}>{p}</Tx>
                <Tx size={28} color={NAVY} w={400}>{TEXT.ClientView.perMonth}</Tx>
              </div>
            </In>
          </div>
        ))}
      </div>
      <Sparkle x={700} y={320} size={56} c={GOLD} />
      <Sparkle x={1260} y={900} size={44} c={BLUE} ph={1.5} />
    </AbsoluteFill>
  );
};

const Revenue: React.FC = () => {
  const t = useSec();
  const c = CUE.revenue;
  const kc = eo(P(t, c.chart, 1.2));
  const kn = eo(P(t, c.recurring, c.revenue - c.recurring + 0.3));
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="chart" c={GOLD} title={TEXT.Revenue.title} maxW={800} at={c.services - 0.3} times={[c.services, c.services + 0.45, c.recurring, c.revenue]} hi={[1, 3]} /></Abs>
      <div style={{position: 'absolute', left: 860, top: 300, transform: `translateY(${bob(t, 0, 6)}px) rotate(1.5deg)`}}>
        <In at={c.chart} s0={0.7} dy={100}>
          <div style={{clipPath: `inset(${(1 - kc) * 100}% -40px -60px -40px)`}}><Lift name="billing" r={CROP.revenue} s={1.6} glow /></div>
        </In>
      </div>
      <Abs x={110} y={380} style={{transform: `translateY(${bob(t, 1, 5)}px)`}}>
        <In at={c.recurring - 0.2} dx={-140} dy={0} s0={0.7}>
          <div style={{width: 600, padding: '28px 36px', borderRadius: 32, boxSizing: 'border-box', background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)', boxShadow: `0 10px 0 #C3D5F3, 0 30px 50px rgba(14,27,77,0.25), 0 0 0 5px ${GOLD}`}}>
            <Tx size={32} color={SLATE} w={400}>{TEXT.Revenue.label}</Tx>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
              <Tx size={120} g={[ORANGE, GOLD]} style={{filter: 'drop-shadow(0 4px 0 rgba(184,101,12,0.25))'}}>₹{(1.2 * kn).toFixed(1)}</Tx>
              <Tx size={40} color={NAVY}>{TEXT.Revenue.unit}</Tx>
            </div>
          </div>
        </In>
      </Abs>
      <Callout x={130} y={720} at={c.services} i={2}><Lift name="billing" r={CROP.collected} s={1.2} ring={BLUE} /></Callout>
      <Sparkle x={1780} y={300} size={56} c={GOLD} />
    </AbsoluteFill>
  );
};

const TAG_SHOTS: ShotName[] = ['whitelabel', 'dashboard', 'billing'];
const TAG_ICONS: [Gl, string][] = [['brush', ORANGE], ['globe', DEEP], ['chart', BLUE]];
const Tagline: React.FC = () => {
  const t = useSec();
  const c = CUE.tagline;
  const at = [c.l0, c.l1, c.l2];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center'}}>
        <In at={c.name} s0={0.6} dy={40}><LogoImg w={720} /></In>
      </div>
      {TEXT.Tagline.map((s, i) => {
        const cx = 330 + i * 630;
        const ks = P(t, at[i], 0.35);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: cx - 262, top: 330 + bob(t, i, 8), perspective: 1600}}>
              <In at={at[i] - 0.25} dy={120} s0={0.6} rot={(i - 1) * 8}>
                <div style={{transform: `rotateY(${(1 - i) * 14}deg)`}}><Screen name={TAG_SHOTS[i]} w={500} /></div>
              </In>
            </div>
            <div style={{position: 'absolute', left: cx - 320, width: 640, top: 760, display: 'flex', justifyContent: 'center', opacity: cl(ks * 3), transform: `scale(${lerp(1.6, 1, eb(ks, 1.4))})`}}>
              <IconPill icon={TAG_ICONS[i][0]} c={TAG_ICONS[i][1]} text={s} size={52} maxW={440} />
            </div>
          </React.Fragment>
        );
      })}
      <Sparkle x={640} y={300} size={56} c={GOLD} />
      <Sparkle x={1280} y={980} size={48} c={BLUE} ph={1.4} />
      <Sparkle x={160} y={960} size={40} c={ORANGE} ph={2.2} />
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const t = useSec();
  const {fps} = useVideoConfig();
  const c = CUE.cta;
  return (
    <AbsoluteFill>
      {(['whitelabel', 'dashboard'] as ShotName[]).map((n, i) => (
        <div key={n} style={{position: 'absolute', left: i ? 1500 : -560, top: 300 + bob(t, i, 10), perspective: 2000, opacity: 0.55 * eo(P(t, 0.2, 0.6))}}>
          <div style={{transform: `rotateY(${i ? -28 : 28}deg)`}}><Screen name={n} w={960} /></div>
        </div>
      ))}
      {/* logo builds, then holds (LogoAnim exits at 4.3 s, so freeze it once built) */}
      <div style={{position: 'absolute', left: 240, top: 30, width: 1440, height: 480}}>
        {t < 3.3 ? <LogoAnim /> : <Freeze frame={Math.round(3.3 * fps)}><LogoAnim /></Freeze>}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36}}>
        <In at={0.9} dy={30}><Tx size={fit(TEXT.End.lead, 56, 1200)} color={NAVY}>{TEXT.End.lead}</Tx></In>
        <In at={c.cta} dy={30}><CtaButton text={TEXT.End.cta} size={54} /></In>
        <In at={c.site} dy={16} s0={1}><Tx size={40} color={SLATE} w={400}>{TEXT.Brand.site}</Tx></In>
      </div>
      <Sparkle x={1500} y={780} size={60} c={GOLD} />
      <Sparkle x={420} y={820} size={46} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

export const AgencyVideo: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SkyBG />
      <Scene k="hook" first><Hook /></Scene>
      <Scene k="meet"><Meet /></Scene>
      <Scene k="white"><White /></Scene>
      <Scene k="channels"><Channels /></Scene>
      <Scene k="calendar"><Calendar /></Scene>
      <Scene k="ai"><Ai /></Scene>
      <Scene k="rank"><Rank /></Scene>
      <Scene k="qr"><Qr /></Scene>
      <Scene k="agency"><Agency /></Scene>
      <Scene k="brand"><Brand /></Scene>
      <Scene k="revenue"><Revenue /></Scene>
      <Scene k="tagline"><Tagline /></Scene>
      <Scene k="cta" last><Cta /></Scene>
      {/* soundtrack: audio.json, added by registry.tsx (edit it in the Studio Audio tab) */}
    </AbsoluteFill>
  );
};
