// Concept samples for the Way CRM "leads in Excel" promo: two looks, 2 key moments of 3 s each.
//   A · Lead City (the preset: bright glossy 3D city; Way CRM links every lead up)
//   B · Pipeline Night (deep navy techy dashboard: lead orbs, live counters, a 3D phone hero)
import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import {City} from '../../webinar/city';
import {CameraRig, CountUp, Notification, Obj3D, ProgressBar, SpringIn, Toggle, cl, eo, lerp, P, stagger, useSec} from '../kit';
import {ART, BLUE, CITY_T, DEEP, FONT, GOLD, GREEN, LEVEL, MOMENT, NAVY, ORANGE, RED, SLATE} from './config';
import TEXT from './text.json';

type Kind = 'a' | 'b';
const SP = LEVEL.spring;

// ---------- shared parts ----------
export const Abs: React.FC<{x: number; y: number; w?: number; center?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, center, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, transform: center ? 'translateX(-50%)' : undefined, ...style}}>{children}</div>
);
export const gradText = (cols: string[]): React.CSSProperties => ({background: `linear-gradient(90deg, ${cols.join(', ')})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'});
export const Head: React.FC<{size: number; cols?: string[]; color?: string; halo?: string; children?: React.ReactNode}> = ({size, cols, color = NAVY, halo, children}) => (
  <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.18, textAlign: 'center', color, filter: halo ? `drop-shadow(0 0 18px ${halo})` : undefined, ...(cols ? gradText(cols) : {})}}>{children}</div>
);
// Glossy sphere avatar (no flat emoji)
export const Orb: React.FC<{c: string; size?: number; label?: string}> = ({c, size = 64, label}) => (
  <div style={{width: size, height: size, borderRadius: size, flexShrink: 0, background: `radial-gradient(circle at 32% 28%, #fff 0%, ${c} 38%, ${c} 62%, rgba(0,0,0,0.35) 100%)`, boxShadow: `0 8px 20px ${c}66, inset 0 -6px 12px rgba(0,0,0,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: size * 0.38, textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>{label}</div>
);
export const Gloss: React.FC<{c: string; c2: string; r?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({c, c2, r = 30, style, children}) => (
  <div style={{position: 'relative', borderRadius: r, background: `linear-gradient(180deg, ${c}, ${c2})`, boxShadow: `0 18px 40px ${c2}66, inset 0 2px 0 rgba(255,255,255,0.5)`, overflow: 'hidden', ...style}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '48%', background: 'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.05))'}} />
    <div style={{position: 'relative'}}>{children}</div>
  </div>
);

// Bright sky wash for concept A, deep navy grid for concept B (both drift slowly, semi-transparent)
export const SkyA: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #F4F8FF 0%, #DCEBFF 55%, #FFF4D6 100%)'}}>
      <div style={{position: 'absolute', left: -200 + 30 * Math.sin(t * 0.4), top: 120, width: 900, height: 900, borderRadius: 900, background: `radial-gradient(circle, ${BLUE}33, transparent 70%)`}} />
      <div style={{position: 'absolute', right: -260, top: 900 + 30 * Math.cos(t * 0.3), width: 900, height: 900, borderRadius: 900, background: `radial-gradient(circle, ${GOLD}33, transparent 70%)`}} />
    </AbsoluteFill>
  );
};
export const NightB: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${DEEP} 0%, ${NAVY} 60%, #070E2B 100%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: 0.16, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.5) 2px, transparent 2px)', backgroundSize: '90px 90px', backgroundPosition: `0 ${t * 18}px`, transform: 'perspective(900px) rotateX(55deg) translateY(520px) scale(2)'}} />
      <div style={{position: 'absolute', left: 90, top: 260 + 20 * Math.sin(t * 0.5), width: 900, height: 900, borderRadius: 900, background: `radial-gradient(circle, ${BLUE}44, transparent 70%)`}} />
    </AbsoluteFill>
  );
};

// ---------- A · Lead City ----------
export const SheetCard: React.FC<{at: number; z?: string}> = ({at, z = DEEP}) => {
  const t = useSec();
  const H = TEXT.Hook;
  return (
    <SpringIn at={at} level={SP} from={{y: 160, scale: 0.8, rotate: -4}}>
      <div style={{position: 'relative', width: 760, borderRadius: 36, background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)', boxShadow: '0 30px 70px rgba(14,27,77,0.28)', border: '3px solid #fff', overflow: 'hidden', transform: 'rotate(-3deg)'}}>
        <div style={{background: 'linear-gradient(90deg, #1D9A55, #22B566)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#fff'}}>
          <div style={{width: 46, height: 46, borderRadius: 10, background: '#fff', color: '#1D9A55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800}}>X</div>
          {H.sheet}
        </div>
        {H.rows.map((name, i) => {
          const k = eo(P(t, at + 0.35 + i * 0.12, 0.4));
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '16px 32px', borderTop: '2px solid #E3EAF7', opacity: k, transform: `translateX(${(1 - k) * 60}px)`, fontFamily: FONT}}>
              <Orb c={[BLUE, ORANGE, DEEP, GOLD, SLATE][i % 5]} size={54} label={name[0]} />
              <div style={{flex: 1, fontSize: 32, fontWeight: 700, color: NAVY}}>{name}</div>
              <div style={{fontSize: 24, fontWeight: 700, color: SLATE, background: '#E9EEF8', borderRadius: 30, padding: '8px 18px'}}>{H.status}</div>
            </div>
          );
        })}
      </div>
      {/* sleeping Z's drifting up off the sheet */}
      {[0, 1, 2].map((i) => {
        const p = (((t - at - 0.8 + i * 0.5) % 1.5) + 1.5) % 1.5 / 1.5;
        return t > at + 0.8 ? <div key={i} style={{position: 'absolute', right: 30 - p * 40 + i * 30, top: -30 - p * 140, fontFamily: FONT, fontWeight: 800, fontSize: 54 + i * 12, color: z, opacity: Math.sin(Math.PI * cl(p))}}>Z</div> : null;
      })}
    </SpringIn>
  );
};

const A1: React.FC = () => {
  const t = useSec();
  const H = TEXT.Hook;
  return (
    <AbsoluteFill>
      <SkyA />
      <CameraRig level={LEVEL.camera} dur={MOMENT}>
        <AbsoluteFill style={{transform: 'translateY(420px)'}}><City t={CITY_T.built + t * 0.3} /></AbsoluteFill>
        <Abs x={540} y={150} center w={1000}>
          <SpringIn at={0.1} level={SP}><Head size={76}>{H.line1}</Head></SpringIn>
          <SpringIn at={0.35} level={SP} from={{scale: 0.6}}><Head size={112} cols={[DEEP, BLUE]} halo="rgba(255,255,255,0.9)">{H.line2}</Head></SpringIn>
          <SpringIn at={0.6} level={SP}><Head size={84} cols={[ORANGE, GOLD]}>{H.line3}</Head></SpringIn>
        </Abs>
        <Abs x={160} y={720}><SheetCard at={0.7} /></Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

const A2: React.FC = () => {
  const t = useSec();
  const S = TEXT.Solution;
  return (
    <AbsoluteFill>
      <SkyA />
      <CameraRig level={LEVEL.camera} dur={MOMENT}>
        <AbsoluteFill style={{transform: 'translateY(160px)'}}><City t={CITY_T.linked + t * 0.3} /></AbsoluteFill>
        <Abs x={540} y={140} center w={1000}>
          <SpringIn at={0.05} level={SP} from={{scale: 0.5}}><Head size={150} cols={[DEEP, BLUE]} halo="rgba(255,255,255,0.95)">{S.brand}</Head></SpringIn>
          <SpringIn at={0.3} level={SP}>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
              <Gloss c={GOLD} c2={ORANGE} r={40} style={{padding: '14px 40px'}}><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: NAVY}}>{S.sub}</div></Gloss>
            </div>
          </SpringIn>
        </Abs>
        <Abs x={540} y={1260} center w={650}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18, transform: 'scale(1.25)', transformOrigin: '50% 0'}}>
            <Notification at={stagger(0, 0.6, 0.45)} title={S.n1} sub={S.n1sub} w={520} icon={<Orb c={GREEN} size={56} label="W" />} />
            <Notification at={stagger(1, 0.6, 0.45)} title={S.n2} sub={S.n2sub} w={520} icon={<Orb c={BLUE} size={56} label="AI" />} />
            <Notification at={stagger(2, 0.6, 0.45)} title={S.n3} sub={S.n3sub} w={520} icon={<Orb c={ORANGE} size={56} label="₹" />} />
          </div>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- B · Pipeline Night ----------
const B1: React.FC = () => {
  const t = useSec();
  const E = TEXT.Example;
  const sortAt = 1.3;
  const k = eo(P(t, sortAt, 0.6));
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={MOMENT}>
        <Abs x={540} y={170} center w={1000}>
          <SpringIn at={0.05} level={SP}><Head size={64} color="#fff">{E.title}</Head></SpringIn>
          <SpringIn at={0.2} level={SP} from={{scale: 0.4}}>
            <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 24}}>
              <CountUp to={10} at={0.2} dur={0.9} style={{fontFamily: FONT, fontWeight: 800, fontSize: 230, lineHeight: 1.1, ...gradText([GOLD, ORANGE])}} />
              <Head size={70} color="#fff">{E.count}</Head>
            </div>
          </SpringIn>
        </Abs>
        {/* 10 lead orbs: 3 glow green (converted), 7 sink and turn red (wasted) */}
        {Array.from({length: 10}).map((_, i) => {
          const won = i < 3;
          const col = i % 5, row = Math.floor(i / 5);
          const x0 = 105 + col * 180, y0 = 680 + row * 190;
          const j = i - 3, wx = j < 4 ? 195 + j * 180 : 285 + (j - 4) * 180;
          const x = won ? lerp(x0, 230 + i * 220, k) : lerp(x0, wx, k);
          const y = won ? lerp(y0, 1130, k) : lerp(y0, j < 4 ? 690 : 860, k);
          const c = k > 0.5 ? (won ? GREEN : RED) : BLUE;
          return (
            <Abs key={i} x={x} y={y}>
              <SpringIn at={stagger(i, 0.5, 0.06)} level={SP} from={{scale: 0.2, y: 0}}>
                <div style={{opacity: won ? 1 : lerp(1, 0.5, k), filter: won ? `drop-shadow(0 0 ${24 * k}px ${GREEN})` : undefined}}>
                  <Orb c={c} size={130} label={String(i + 1)} />
                </div>
              </SpringIn>
            </Abs>
          );
        })}
        <Abs x={540} y={1340} center w={980}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 28}}>
            <SpringIn at={sortAt + 0.4} level={SP}><Gloss c="#3BD48A" c2={GREEN} style={{padding: '18px 34px'}}><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 48, color: '#fff'}}>3 {E.converted}</div></Gloss></SpringIn>
            <SpringIn at={sortAt + 0.6} level={SP}><Gloss c="#FF7A7A" c2={RED} style={{padding: '18px 34px'}}><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 48, color: '#fff'}}>7 {E.wasted}</div></Gloss></SpringIn>
          </div>
          <SpringIn at={sortAt + 0.9} level={SP}><div style={{marginTop: 40}}><Head size={54} color="#fff">{E.money}</Head></div></SpringIn>
        </Abs>
        <Obj3D kind="coin" x={860} y={1680} size={300} at={sortAt + 0.6} level={LEVEL.obj3d} />
      </CameraRig>
    </AbsoluteFill>
  );
};

const B2: React.FC = () => {
  const t = useSec();
  const R = TEXT.Result;
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={MOMENT}>
        <Obj3D kind="phone" x={540} y={560} size={720} at={0} level={LEVEL.obj3d} />
        <Abs x={540} y={980} center w={1000}>
          <SpringIn at={0.3} level={SP} from={{scale: 0.4}}>
            <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center'}}>
              <CountUp to={10} at={0.3} dur={1} style={{fontFamily: FONT, fontWeight: 800, fontSize: 220, lineHeight: 1.1, ...gradText([GOLD, ORANGE])}} />
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 150, ...gradText([ORANGE, GOLD])}}>{R.suffix}</span>
            </div>
          </SpringIn>
          <SpringIn at={0.5} level={SP}><Head size={56} color="#fff">{R.line}</Head></SpringIn>
        </Abs>
        <Abs x={540} y={1380} center w={840}>
          <SpringIn at={0.8} level={SP}>
            <div style={{borderRadius: 34, padding: '26px 34px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', flexDirection: 'column', gap: 22}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 24, fontFamily: FONT, fontWeight: 700, fontSize: 36, color: '#fff'}}>
                <div style={{width: 250}}>{R.conv}</div><ProgressBar at={1} dur={1.2} to={0.92} w={480} h={26} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 36, color: '#fff'}}>
                {R.team}<Toggle at={1.5} w={120} onColor={GREEN} />
              </div>
            </div>
          </SpringIn>
        </Abs>
        <Abs x={540} y={1660} center>
          <SpringIn at={1.6} level={SP} from={{scale: 0.5, y: 60}}>
            <Gloss c={GOLD} c2={ORANGE} r={60} style={{padding: '20px 56px', transform: `scale(${1 + 0.03 * Math.sin(t * 6)})`}}>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 50, color: NAVY, whiteSpace: 'nowrap'}}>{R.cta} · {R.site}</div>
            </Gloss>
          </SpringIn>
        </Abs>
      </CameraRig>
      <Abs x={540} y={1820} center><div style={{display: "flex", alignItems: "center", gap: 14, opacity: eo(P(t, 1.9, 0.5))}}><span style={{fontFamily: FONT, fontWeight: 700, fontSize: 30, color: "#C9D4F2", whiteSpace: "nowrap"}}>{R.by}</span><Img src={staticFile(ART.logo)} style={{height: 46}} /></div></Abs>
    </AbsoluteFill>
  );
};

const SETS: Record<Kind, React.FC[]> = {a: [A1, A2], b: [B1, B2]};

export const LeadsConcepts: React.FC<{concept?: Kind}> = ({concept = 'a'}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: NAVY}}>
      {SETS[concept].map((M, i) => (
        <Sequence key={i} from={i * MOMENT * fps} durationInFrames={MOMENT * fps}><M /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
