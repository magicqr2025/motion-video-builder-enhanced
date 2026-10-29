// Way CRM "leads in Excel" promo, concept B · Pipeline Night: a deep-navy techy dashboard where leads are
// glossy orbs that get sorted, wasted, then rescued by Way CRM. 9 scenes synced to the voiceover (timings in config.ts, text in text.json).
import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import {LogoAnim} from '../../logo/LogoAnim';
import {CameraRig, CountUp, Notification, Obj3D, ProgressBar, SceneSeq, SpringIn, Toggle, cl, eio, eo, lerp, P, stagger, transitionFor, useSec} from '../kit';
import {ART, BLUE, DEEP, FONT, GOLD, GREEN, LEVEL, NAVY, ORDER, ORANGE, RED, S, SLATE, START, SceneKey} from './config';
import {Abs, Gloss, gradText, Head, Orb, NightB, SheetCard} from './Concepts';
import TEXT from './text.json';

const SP = LEVEL.spring;
const CARD: React.CSSProperties = {borderRadius: 36, background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)', boxShadow: '0 28px 64px rgba(14,27,77,0.22)', border: '3px solid #fff'};
const LITE = ['#FFFFFF', '#A9D4FF'];
const GLOW = 'rgba(21,130,213,0.55)';
const MUTED = '#B4C3EA';
const label = (size: number, color = NAVY, w = 700): React.CSSProperties => ({fontFamily: FONT, fontWeight: w, fontSize: size, color, lineHeight: 1.2});

// Shows children from `at` (springy) until `out` (fade + lift)
const Beat: React.FC<{at: number; out?: number; from?: {x?: number; y?: number; scale?: number; rotate?: number}; children?: React.ReactNode}> = ({at, out, from, children}) => {
  const t = useSec();
  const ko = out === undefined ? 0 : eio(P(t, out, 0.35));
  if (ko >= 1) return null;
  return <div style={{opacity: 1 - ko, transform: `translateY(${-50 * ko}px)`}}><SpringIn at={at} level={SP} from={from}>{children}</SpringIn></div>;
};

// Off switch with a red cross (the kit Toggle only switches on)
const OffSwitch: React.FC<{w?: number}> = ({w = 130}) => {
  const h = w * 0.54;
  return (
    <div style={{width: w, height: h, borderRadius: h, background: '#CBD3E3', position: 'relative', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.15)'}}>
      <div style={{position: 'absolute', left: h * 0.1, top: h * 0.1, width: h * 0.8, height: h * 0.8, borderRadius: h, background: 'linear-gradient(180deg,#fff,#E6EAF2)', boxShadow: '0 3px 8px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...label(h * 0.5, RED, 800)}}>✕</div>
    </div>
  );
};

// ---------- 1 · Hook ----------
const Hook: React.FC = () => {
  const c = S.hook, H = TEXT.Hook;
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={150} center w={1000}>
          <SpringIn at={c.line1} level={SP}><Head size={76} color="#fff">{H.line1}</Head></SpringIn>
          <SpringIn at={c.line2} level={SP} from={{scale: 0.6}}><Head size={112} cols={LITE} halo={GLOW}>{H.line2}</Head></SpringIn>
          <SpringIn at={c.line3} level={SP}><Head size={84} cols={[ORANGE, GOLD]}>{H.line3}</Head></SpringIn>
        </Abs>
        <Abs x={160} y={720}><SheetCard at={c.sheet} z="#9CC8FF" /></Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 2 · Ads → one call → over ----------
const Ads: React.FC = () => {
  const t = useSec();
  const c = S.ads, A = TEXT.Ads;
  const dead = eo(P(t, c.ended, 0.5));
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={170} center w={980}>
          <SpringIn at={c.head} level={SP} from={{scale: 0.6}}><Head size={92} cols={LITE} halo={GLOW}>{A.headline}</Head></SpringIn>
        </Abs>
        <Obj3D kind="coin" x={540} y={560} size={420} at={c.coin} level={LEVEL.obj3d} />
        <Abs x={540} y={850} center w={680}>
          <div style={{transform: 'scale(1.3)', transformOrigin: '50% 0', display: 'flex', justifyContent: 'center'}}>
            <Notification at={c.lead} title={A.lead} sub={A.leadSub} w={520} icon={<Orb c={BLUE} size={56} label="R" />} />
          </div>
        </Abs>
        <Abs x={540} y={1110} center>
          <Beat at={c.call} from={{y: 80, scale: 0.8}}>
            <div style={{...CARD, width: 760, padding: '30px 36px', display: 'flex', alignItems: 'center', gap: 28, filter: `grayscale(${dead})`, opacity: 1 - 0.35 * dead}}>
              <Orb c={GREEN} size={96} label="R" />
              <div style={{flex: 1}}>
                <div style={label(44)}>{A.call}</div>
                <div style={label(34, SLATE, 600)}>{A.callSub}</div>
              </div>
              <div style={{width: 130, height: 54, display: 'flex', gap: 6, alignItems: 'center'}}>
                {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{width: 12, borderRadius: 6, background: GREEN, height: (1 - dead) * (14 + 30 * Math.abs(Math.sin(t * 7 + i * 1.3))) + 6}} />)}
              </div>
            </div>
          </Beat>
          <div style={{position: 'absolute', right: -20, top: -34, transform: `scale(${eo(P(t, c.ended, 0.35))}) rotate(-6deg)`}}>
            <Gloss c="#FF7A7A" c2={RED} r={30} style={{padding: '10px 26px'}}><div style={label(34, '#fff', 800)}>{A.ended}</div></Gloss>
          </div>
        </Abs>
        <Abs x={540} y={1440} center w={1000}>
          <SpringIn at={c.ended + 0.2} level={SP} from={{y: 60, scale: 0.7}}><Head size={74} cols={[ORANGE, GOLD]}>{A.after}</Head></SpringIn>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 3 · 4x follow-ups, no retarget ----------
const Follow: React.FC = () => {
  const t = useSec();
  const c = S.follow, F = TEXT.FollowUp;
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={150} center w={1000}>
          <SpringIn at={c.intro} level={SP}><Head size={60} color={MUTED}>{F.intro}</Head></SpringIn>
          <SpringIn at={c.line} level={SP}><Head size={84} cols={LITE}>{F.line}</Head></SpringIn>
        </Abs>
        <Abs x={540} y={380} center w={1000}>
          <SpringIn at={c.four} level={SP} from={{scale: 0.3}}>
            <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', filter: 'drop-shadow(0 14px 24px rgba(247,148,29,0.35))'}}>
              <CountUp to={4} at={c.four} dur={0.6} style={{fontFamily: FONT, fontWeight: 800, fontSize: 300, lineHeight: 1.05, ...gradText([GOLD, ORANGE])}} />
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 190, ...gradText([ORANGE, GOLD])}}>{F.suffix}</span>
            </div>
          </SpringIn>
          <SpringIn at={c.steps} level={SP}><Head size={72} color="#fff">{F.follow}</Head></SpringIn>
        </Abs>
        {/* 4 follow-up steps: only the first call ever happens */}
        <Abs x={540} y={850} center w={980}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 18}}>
            {F.steps.map((s, i) => (
              <SpringIn key={i} at={stagger(i, c.steps + 0.2, 0.15)} level={SP} from={{y: 60, scale: 0.5}}>
                <div style={{width: 220, padding: '22px 10px', borderRadius: 28, textAlign: 'center', background: i === 0 ? 'linear-gradient(180deg,#fff,#E8FFF2)' : 'rgba(255,255,255,0.07)', border: i === 0 ? `3px solid ${GREEN}` : '3px dashed rgba(174,185,211,0.6)', boxShadow: i === 0 ? '0 16px 34px rgba(24,178,107,0.25)' : 'none'}}>
                  <div style={{display: 'flex', justifyContent: 'center', marginBottom: 10}}><Orb c={i === 0 ? GREEN : '#AEB9D3'} size={70} label={i === 0 ? '✓' : String(i + 1)} /></div>
                  <div style={label(30, i === 0 ? NAVY : MUTED)}>{s}</div>
                </div>
              </SpringIn>
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 30, opacity: eo(P(t, c.steps + 0.6, 0.3))}}><ProgressBar at={c.steps + 0.6} dur={0.8} to={0.25} w={900} h={26} /></div>
        </Abs>
        <Abs x={540} y={1300} center>
          <Beat at={c.once} from={{y: 100, scale: 0.8}}>
            <div style={{...CARD, width: 860, padding: '34px 40px'}}>
              <div style={label(54, NAVY, 800)}>{F.once}</div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, opacity: eo(P(t, c.retarget - 0.3, 0.4))}}>
                <div>
                  <div style={label(50, DEEP, 800)}>{F.retarget}</div>
                  <div style={label(36, RED, 700)}>{F.cant}</div>
                </div>
                <div style={{transform: `translateX(${Math.sin(t * 40) * 8 * cl(1 - (t - c.retarget) / 0.5) * (t > c.retarget ? 1 : 0)}px)`}}><OffSwitch w={170} /></div>
              </div>
            </div>
          </Beat>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 4 · 10 leads, 3 convert, paid for 10 ----------
const Example: React.FC = () => {
  const t = useSec();
  const c = S.example, E = TEXT.Example;
  const k = eo(P(t, c.three, 0.5));
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={130} center w={1000}>
          <SpringIn at={c.intro} level={SP}><Head size={62} color="#fff" halo={GLOW}>{E.intro}</Head></SpringIn>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
            <SpringIn at={c.ad} level={SP} from={{scale: 0.4}}><Gloss c={BLUE} c2={DEEP} r={40} style={{padding: '14px 44px'}}><div style={label(50, '#fff', 800)}>{E.ad}</div></Gloss></SpringIn>
          </div>
        </Abs>
        <Abs x={540} y={330} center w={1000}>
          <SpringIn at={c.ten} level={SP} from={{scale: 0.4}}>
            <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 24}}>
              <CountUp to={10} at={c.ten} dur={0.9} style={{fontFamily: FONT, fontWeight: 800, fontSize: 210, lineHeight: 1.1, ...gradText([GOLD, ORANGE])}} />
              <Head size={74} color="#fff">{E.count}</Head>
            </div>
          </SpringIn>
        </Abs>
        {/* glass panel of 10 lead orbs: 3 glow green, every one cost money */}
        <Abs x={540} y={620} center>
          <SpringIn at={c.ten - 0.1} level={SP} from={{y: 80, scale: 0.9}}>
            <div style={{width: 960, height: 470, borderRadius: 44, background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))', border: '2px solid rgba(255,255,255,0.25)', boxShadow: '0 30px 70px rgba(0,0,0,0.3)', position: 'relative'}}>
              {Array.from({length: 10}).map((_, i) => {
                const won = i < 3, col = i % 5, row = Math.floor(i / 5);
                const pay = eo(P(t, stagger(i, c.paid + 0.6, 0.12), 0.35));
                return (
                  <div key={i} style={{position: 'absolute', left: 50 + col * 178, top: 50 + row * 200}}>
                    <SpringIn at={stagger(i, c.ten + 0.2, 0.07)} level={SP} from={{scale: 0.2, y: 0}}>
                      <div style={{filter: won ? `drop-shadow(0 0 ${22 * k}px ${GREEN})` : undefined, transform: `scale(${won ? 1 + 0.08 * k : 1})`}}>
                        <Orb c={won && k > 0.5 ? GREEN : BLUE} size={130} label={won && k > 0.5 ? '✓' : String(i + 1)} />
                      </div>
                      <div style={{position: 'absolute', right: -14, top: -14, width: 58, height: 58, transform: `scale(${pay})`}}><Orb c={GOLD} size={58} label="₹" /></div>
                    </SpringIn>
                  </div>
                );
              })}
            </div>
          </SpringIn>
        </Abs>
        <Abs x={540} y={1150} center w={1000}>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <SpringIn at={c.three + 0.2} level={SP} from={{scale: 0.4}}><Gloss c="#3BD48A" c2={GREEN} style={{padding: '18px 40px'}}><div style={label(56, '#fff', 800)}>3 {E.converted}</div></Gloss></SpringIn>
          </div>
        </Abs>
        <Abs x={540} y={1330} center w={1000}>
          <SpringIn at={c.paid} level={SP} from={{y: 60, scale: 0.7}}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <Gloss c={GOLD} c2={ORANGE} r={44} style={{padding: '18px 44px'}}><div style={label(62, NAVY, 800)}>{E.money}</div></Gloss>
            </div>
          </SpringIn>
        </Abs>
        <Obj3D kind="coin" x={540} y={1660} size={320} at={c.paid + 0.4} level={LEVEL.obj3d} />
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 5 · 7 leads: Excel or a staff phone → wasted ----------
const MiniSheet: React.FC = () => (
  <div style={{...CARD, width: 420, overflow: 'hidden', borderRadius: 30}}>
    <div style={{background: 'linear-gradient(90deg, #1D9A55, #22B566)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, ...label(30, '#fff')}}>
      <div style={{width: 38, height: 38, borderRadius: 8, background: '#fff', color: '#1D9A55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800}}>X</div>
      {TEXT.Hook.sheet}
    </div>
    {[0, 1, 2, 3].map((i) => <div key={i} style={{height: 64, borderTop: '2px solid #E3EAF7', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14}}><div style={{width: 160, height: 14, borderRadius: 8, background: '#DCE3F0'}} /><div style={{width: 90, height: 14, borderRadius: 8, background: '#E9EEF8'}} /></div>)}
  </div>
);

const Waste: React.FC = () => {
  const t = useSec();
  const c = S.waste, X = TEXT.Waste;
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={160} center w={1000}>
          <SpringIn at={c.seven} level={SP} from={{scale: 0.5}}><Head size={110} cols={[ORANGE, GOLD]} halo={GLOW}>{X.question}</Head></SpringIn>
        </Abs>
        <Abs x={60} y={760}><SpringIn at={c.excel - 0.3} level={SP} from={{x: -200, rotate: -8}}><div style={{transform: 'rotate(-4deg)'}}><MiniSheet /></div></SpringIn></Abs>
        <Abs x={270} y={1180} center w={480}><SpringIn at={c.excel} level={SP}><Head size={46} color="#fff">{X.excel}</Head></SpringIn></Abs>
        <Obj3D kind="phone" x={790} y={940} size={520} at={c.phone - 0.3} level={LEVEL.obj3d} />
        <Abs x={790} y={1220} center w={520}><SpringIn at={c.phone} level={SP}><Head size={46} color="#fff">{X.phone}</Head></SpringIn></Abs>
        {/* 7 orbs: 4 drop into the sheet, 3 into the phone */}
        {Array.from({length: 7}).map((_, i) => {
          const toSheet = i < 4;
          const at = toSheet ? c.excel + i * 0.12 : c.phone + (i - 4) * 0.12;
          const k = eio(P(t, at, 0.6));
          const x0 = 85 + i * 132, y0 = 470;
          const x1 = toSheet ? 150 + i * 80 : 740 + (i - 5) * 60, y1 = toSheet ? 860 : 930;
          const arc = -160 * Math.sin(Math.PI * k);
          return (
            <Abs key={i} x={lerp(x0, x1, k)} y={lerp(y0, y1, k) + arc}>
              <SpringIn at={stagger(i, c.seven + 0.3, 0.08)} level={SP} from={{scale: 0.2, y: 0}}>
                <div style={{transform: `scale(${lerp(1, 0.55, k)})`, opacity: 1 - 0.6 * eo(P(t, at + 0.5, 0.4))}}><Orb c={k > 0.4 ? SLATE : RED} size={112} label={String(i + 4)} /></div>
              </SpringIn>
            </Abs>
          );
        })}
        <Abs x={540} y={1420} center w={1000}>
          <SpringIn at={c.waste} level={SP} from={{scale: 0.4, rotate: -4}}>
            <div style={{display: 'flex', justifyContent: 'center', transform: `rotate(${Math.sin(t * 30) * 2 * cl(1 - (t - c.waste - 0.3) / 0.5)}deg)`}}>
              <Gloss c="#FF7A7A" c2={RED} r={48} style={{padding: '22px 50px'}}><div style={label(76, '#fff', 800)}>{X.waste}</div></Gloss>
            </div>
          </SpringIn>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 6 · Way CRM rises ----------
const WayCrm: React.FC = () => {
  const c = S.wayCrm, X = TEXT.Solution;
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={140} center w={1000}>
          <SpringIn at={c.problem} level={SP}><Head size={62} color="#fff" halo={GLOW}>{X.problem}</Head></SpringIn>
          <SpringIn at={c.brand} level={SP} from={{scale: 0.4}}><Head size={170} cols={LITE} halo={GLOW}>{X.brand}</Head></SpringIn>
          <SpringIn at={c.sub} level={SP}>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
              <Gloss c={GOLD} c2={ORANGE} r={40} style={{padding: '14px 36px'}}><div style={label(44, NAVY, 800)}>{X.sub}</div></Gloss>
            </div>
          </SpringIn>
        </Abs>
        <Obj3D kind="phone" x={540} y={960} size={640} at={c.brand + 0.2} level={LEVEL.obj3d} />
        <Abs x={540} y={1330} center w={660}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: 'scale(1.3)', transformOrigin: '50% 0'}}>
            <Notification at={stagger(0, c.sub + 0.4, 0.45)} title={X.n1} sub={X.n1sub} w={520} icon={<Orb c={GREEN} size={56} label="W" />} />
            <Notification at={stagger(1, c.sub + 0.4, 0.45)} title={X.n2} sub={X.n2sub} w={520} icon={<Orb c={BLUE} size={56} label="AI" />} />
            <Notification at={stagger(2, c.sub + 0.4, 0.45)} title={X.n3} sub={X.n3sub} w={520} icon={<Orb c={ORANGE} size={56} label="₹" />} />
          </div>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 7 · WhatsApp → AI calling → pipeline → retarget ----------
const FeatTitle: React.FC<{title: string; sub: string}> = ({title, sub}) => (
  <div style={{textAlign: 'center'}}>
    <Head size={84} cols={LITE} halo={GLOW}>{title}</Head>
    <div style={{...label(44, MUTED, 700), marginTop: 6}}>{sub}</div>
  </div>
);
const Art: React.FC<{src: string; w: number}> = ({src, w}) => {
  const t = useSec();
  return <Img src={staticFile(src)} style={{width: w, borderRadius: 40, boxShadow: '0 30px 60px rgba(14,27,77,0.25)', border: '6px solid #fff', transform: `translateY(${8 * Math.sin(t * 1.6)}px)`}} />;
};

// Glossy WhatsApp chat: a new lead gets instant auto-replies (replaces the broadcast illustration)
const WaChat: React.FC<{at: number}> = ({at}) => {
  const t = useSec();
  const C = TEXT.Features.chat;
  return (
    <div style={{...CARD, width: 640, overflow: 'hidden', borderRadius: 44, background: 'linear-gradient(180deg, #F3FBF6, #E6F4EC)', transform: `translateY(${8 * Math.sin(t * 1.6)}px)`}}>
      <div style={{background: 'linear-gradient(90deg, #128C4B, #25D366)', padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 18}}>
        <Orb c={BLUE} size={70} label={C.name[0]} />
        <div><div style={label(36, '#fff', 800)}>{C.name}</div><div style={label(24, '#E6FFEF', 600)}>{C.status}</div></div>
      </div>
      <div style={{padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 400}}>
        {C.msgs.map((m, i) => {
          const me = i % 3 !== 0; // lead writes 0 and 3, Way CRM answers
          return (
            <SpringIn key={i} at={at + i * 0.75} level={SP} from={{x: me ? 60 : -60, y: 0, scale: 0.7}} style={{alignSelf: me ? 'flex-end' : 'flex-start'}}>
              <div style={{maxWidth: 470, padding: '14px 20px', borderRadius: 24, borderBottomRightRadius: me ? 6 : 24, borderBottomLeftRadius: me ? 24 : 6, background: me ? 'linear-gradient(180deg, #E2FFD4, #C9F7B4)' : '#fff', boxShadow: '0 6px 14px rgba(14,27,77,0.12)', ...label(28, NAVY, 600)}}>
                {m}{me && <span style={{...label(20, '#34B7F1', 800), marginLeft: 10}}>✓✓</span>}
              </div>
            </SpringIn>
          );
        })}
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  const c = S.features, F = TEXT.Features;
  const beats = [c.wa, c.ai, c.pipe, c.retarget, S.features.dur + 1];
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={120} center w={1040}>
          {[[F.f1, F.f1sub], [F.f2, F.f2sub], [F.f3, F.f3sub], [F.f4, F.f4sub]].map(([a, b], i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 0}}><Beat at={beats[i]} out={beats[i + 1] - 0.35} from={{scale: 0.6}}><FeatTitle title={a} sub={b} /></Beat></div>
          ))}
        </Abs>
        <Abs x={540} y={340} center>
          <Beat at={c.wa + 0.3} out={c.ai - 0.35} from={{y: 80, scale: 0.6, rotate: -6}}><WaChat at={c.wa + 0.5} /></Beat>
        </Abs>
        <Abs x={540} y={340} center>
          <Beat at={c.ai + 0.3} out={c.pipe - 0.35} from={{y: 80, scale: 0.6, rotate: 6}}><Art src={ART.robot} w={560} /></Beat>
        </Abs>
        {/* pipeline board */}
        <Abs x={540} y={360} center>
          <Beat at={c.pipe + 0.3} out={c.retarget - 0.35} from={{y: 80, scale: 0.7}}>
            <div style={{...CARD, width: 940, padding: '30px 30px 34px'}}>
              <div style={{display: 'flex', gap: 14}}>
                {F.stages.map((s, i) => (
                  <SpringIn key={i} at={stagger(i, c.pipe + 0.5, 0.2)} level={SP} from={{y: 40, scale: 0.6}}>
                    <div style={{width: 205, borderRadius: 24, padding: '16px 0', textAlign: 'center', background: `linear-gradient(180deg, ${[BLUE, GOLD, DEEP, GREEN][i]}22, #ffffff)`, border: `3px solid ${[BLUE, GOLD, DEEP, GREEN][i]}`}}>
                      <div style={label(32, NAVY, 800)}>{s}</div>
                      <div style={{display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12}}>
                        {Array.from({length: 4 - (i === 3 ? 1 : 0)}).map((_, j) => <Orb key={j} c={[BLUE, GOLD, DEEP, GREEN][i]} size={38} />)}
                      </div>
                    </div>
                  </SpringIn>
                ))}
              </div>
              <div style={{marginTop: 24, display: 'flex', justifyContent: 'center'}}><ProgressBar at={c.pipe + 1.2} dur={2} to={1} w={860} h={24} colors={[BLUE, GREEN]} /></div>
            </div>
          </Beat>
        </Abs>
        {/* retarget switch flips on (payoff for scene 3) */}
        <Abs x={540} y={620} center>
          <Beat at={c.retarget + 0.3} from={{y: 80, scale: 0.6}}>
            <div style={{...CARD, width: 760, padding: '36px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={label(56, NAVY, 800)}>{F.toggle}</div>
              <div style={{transform: 'scale(1.4)', transformOrigin: '100% 50%'}}><Toggle at={c.retarget + 0.6} w={130} onColor={GREEN} /></div>
            </div>
          </Beat>
        </Abs>
        {/* live notifications stack up as each feature is spoken */}
        <Abs x={540} y={1060} center w={660}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: 'scale(1.4)', transformOrigin: '50% 0'}}>
            <Notification at={c.wa + 1} title={F.n1} sub={F.n1sub} w={520} icon={<Orb c={GREEN} size={56} label="W" />} />
            <Notification at={c.ai + 1} title={F.n2} sub={F.n2sub} w={520} icon={<Orb c={BLUE} size={56} label="AI" />} />
            <Notification at={c.pipe + 1} title={F.n3} sub={F.n3sub} w={520} icon={<Orb c={ORANGE} size={56} label="₹" />} />
          </div>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 8 · Result ----------
const Result: React.FC = () => {
  const c = S.result, R = TEXT.Result;
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={110} center w={1000}>
          <SpringIn at={c.q} level={SP} from={{scale: 0.4}}><Head size={140} cols={LITE} halo={GLOW}>{R.question}</Head></SpringIn>
        </Abs>
        <Abs x={540} y={330} center><SpringIn at={c.q + 0.3} level={SP} from={{y: 80, scale: 0.6}}><Art src={ART.growth} w={600} /></SpringIn></Abs>
        <Abs x={540} y={960} center>
          <SpringIn at={c.conv} level={SP} from={{y: 60, scale: 0.7}}>
            <div style={{...CARD, width: 900, padding: '26px 36px', display: 'flex', alignItems: 'center', gap: 26}}>
              <div style={{...label(44, NAVY, 800), whiteSpace: 'nowrap'}}>{R.conv}</div>
              <ProgressBar at={c.conv + 0.3} dur={1.2} to={0.95} w={420} h={28} colors={[GREEN, '#3BD48A']} />
            </div>
          </SpringIn>
        </Abs>
        <Abs x={540} y={1110} center w={1000}>
          <SpringIn at={c.tenx} level={SP} from={{scale: 0.3}}>
            <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', filter: 'drop-shadow(0 14px 24px rgba(247,148,29,0.35))'}}>
              <CountUp to={10} at={c.tenx} dur={1} style={{fontFamily: FONT, fontWeight: 800, fontSize: 250, lineHeight: 1.1, ...gradText([GOLD, ORANGE])}} />
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 170, ...gradText([ORANGE, GOLD])}}>{R.suffix}</span>
            </div>
          </SpringIn>
          <SpringIn at={c.tenx + 0.3} level={SP}><Head size={58} color="#fff">{R.line}</Head></SpringIn>
        </Abs>
        <Abs x={540} y={1560} center>
          <SpringIn at={c.team} level={SP} from={{y: 60, scale: 0.7}}>
            <div style={{...CARD, width: 900, padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={label(48, NAVY, 800)}>{R.team}</div>
              <div style={{transform: 'scale(1.3)', transformOrigin: '100% 50%'}}><Toggle at={c.team + 0.5} w={130} onColor={GREEN} /></div>
            </div>
          </SpringIn>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 9 · CTA + MagicBolt logo build ----------
const End: React.FC = () => {
  const t = useSec();
  const {fps} = useVideoConfig();
  const c = S.end, X = TEXT.End;
  const s = 1000 / 1440;
  return (
    <AbsoluteFill>
      <NightB />
      <CameraRig level={LEVEL.camera} dur={c.dur}>
        <Abs x={540} y={260} center w={1000}>
          <SpringIn at={c.brand} level={SP} from={{scale: 0.4}}><div style={{display: 'flex', justifyContent: 'center'}}><div style={{...CARD, borderRadius: 56, padding: '20px 40px'}}><Img src={staticFile(ART.waycrm)} alt={X.brand} style={{width: 820, display: 'block'}} /></div></div></SpringIn>
          <SpringIn at={c.by} level={SP}><Head size={58} color={MUTED}>{X.by}</Head></SpringIn>
        </Abs>
        <Abs x={540} y={720} center>
          <SpringIn at={c.cta} level={SP} from={{y: 80, scale: 0.5}}>
            <Gloss c={GOLD} c2={ORANGE} r={70} style={{padding: '30px 70px', transform: `scale(${1 + 0.03 * Math.sin(t * 6)})`}}>
              <div style={{...label(76, NAVY, 800), whiteSpace: 'nowrap'}}>{X.cta}</div>
            </Gloss>
          </SpringIn>
        </Abs>
        <Abs x={540} y={940} center>
          <SpringIn at={c.site} level={SP} from={{y: 60, scale: 0.6}}>
            <div style={{...CARD, borderRadius: 60, padding: '22px 56px', display: 'flex', alignItems: 'center', gap: 22}}>
              <Orb c={BLUE} size={64} label="W" />
              <div style={{...label(80, DEEP, 800), whiteSpace: 'nowrap'}}>{X.site}</div>
            </div>
          </SpringIn>
        </Abs>
        <div style={{position: 'absolute', left: 40, top: 1300, width: 1440, height: 480, transform: `scale(${s})`, transformOrigin: '0 0', borderRadius: 80, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,0.35)', opacity: eo(P(t, c.logo - 0.3, 0.4))}}>
          <Sequence from={Math.round(c.logo * fps)} layout="none" name="logo"><LogoAnim /></Sequence>
        </div>
      </CameraRig>
    </AbsoluteFill>
  );
};

const SCENES: Record<SceneKey, React.FC> = {hook: Hook, ads: Ads, follow: Follow, example: Example, waste: Waste, wayCrm: WayCrm, features: Features, result: Result, end: End};

export const LeadsVideo: React.FC = () => (
  <AbsoluteFill style={{background: NAVY}}>
    {ORDER.map((k, i) => {
      const Scene = SCENES[k];
      return (
        <SceneSeq key={k} name={k} start={START[k]} dur={S[k].dur} first={i === 0} last={i === ORDER.length - 1} {...transitionFor(i, LEVEL.transition)}>
          <Scene />
        </SceneSeq>
      );
    })}
  </AbsoluteFill>
);
