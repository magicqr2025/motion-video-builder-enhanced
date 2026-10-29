// WayCRM icons reel (concept A · Icon Orbit): pastel waves, glossy WayCRM icon tiles, real screens swing in.
// Scenes follow the voiceover (config.ts S/START); every string comes from text.json.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {LogoAnim} from '../../logo/LogoAnim';
import {CameraRig, CountUp, LightSweep, Obj3D, Particles, SceneSeq, SpringIn, cl, eo, lerp, P, stagger, transitionFor, useSec} from '../kit';
import {Abs, Crop, fit, grad, Icon, PastelBg, Pill} from './Concepts';
import {ART, BLUE, CROP, DEEP, FONT, GOLD, GREEN, ICONS, ICON_LIST, LEVEL, LEVEL_T, MB_LOGO, NAVY, ORANGE, ORDER, RED, S, SceneKey, SLATE, START} from './config';
import TEXT from './text.json';

const SP = LEVEL.spring;
const rise = (t: number, at: number, d = 40): React.CSSProperties => {
  const k = eo(P(t, at, 0.45));
  return {opacity: k, transform: `translateY(${(1 - k) * d}px)`};
};
const H: React.FC<{size: number; color?: string; cols?: string[]; align?: 'center' | 'left'; children?: React.ReactNode}> = ({size, color = NAVY, cols, align = 'center', children}) => (
  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.12, letterSpacing: -size * 0.018, textAlign: align, color, ...(cols ? grad(cols) : {})}}>{children}</div>
);
const Sub: React.FC<{size?: number; color?: string; align?: 'center' | 'left'; children?: React.ReactNode}> = ({size = 44, color = SLATE, align = 'center', children}) => (
  <div style={{fontFamily: FONT, fontSize: size, lineHeight: 1.3, color, textAlign: align}}>{children}</div>
);
const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: 'rgba(255,255,255,0.93)', borderRadius: 40, boxShadow: '0 30px 70px rgba(14,27,77,0.18), inset 0 2px 0 #fff', ...style}}>{children}</div>
);

// Glossy WayCRM icon tiles orbiting a centre point (dim = desaturated, for the problem scenes)
const Orbit: React.FC<{cx: number; cy: number; rx?: number; ry?: number; at: number; dim?: boolean; speed?: number}> = ({cx, cy, rx = 430, ry = 250, at, dim, speed = 0.45}) => {
  const t = useSec();
  const n = ICON_LIST.length;
  return (
    <>
      {ICON_LIST.map((ic, i) => {
        const a = (i / n) * Math.PI * 2 + t * speed - Math.PI / 2;
        const depth = (Math.sin(a) + 1) / 2;
        const k = eo(P(t, at + i * 0.06, 0.5));
        const x = cx + Math.cos(a) * rx * lerp(0.2, 1, k);
        const y = cy + Math.sin(a) * ry * lerp(0.2, 1, k);
        const size = lerp(96, 150, depth);
        return (
          <div key={ic} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, zIndex: depth > 0.5 ? 6 : 1, opacity: k * lerp(0.75, 1, depth) * (dim ? 0.55 : 1), filter: dim ? 'grayscale(0.9)' : undefined, transform: `scale(${lerp(0.3, 1, k)}) rotate(${(1 - k) * -90}deg)`}}>
            <Icon cx={ic} size={size} />
          </div>
        );
      })}
    </>
  );
};

// Glossy person sphere (lead avatar)
const Lead: React.FC<{c: string; size?: number; check?: number}> = ({c, size = 130, check = 0}) => (
  <div style={{position: 'relative', width: size, height: size, borderRadius: size, overflow: 'visible', background: `radial-gradient(circle at 32% 28%, #fff 0%, ${c} 36%, ${c} 64%, rgba(0,0,0,0.35) 100%)`, boxShadow: `0 12px 26px ${c}66, inset 0 -8px 14px rgba(0,0,0,0.18)`}}>
    <div style={{position: 'absolute', left: '50%', top: '22%', width: size * 0.28, height: size * 0.28, marginLeft: -size * 0.14, borderRadius: size, background: 'rgba(255,255,255,0.92)'}} />
    <div style={{position: 'absolute', left: '50%', top: '54%', width: size * 0.5, height: size * 0.24, marginLeft: -size * 0.25, borderRadius: `${size * 0.25}px ${size * 0.25}px ${size * 0.08}px ${size * 0.08}px`, background: 'rgba(255,255,255,0.92)'}} />
    {check > 0 && (
      <div style={{position: 'absolute', right: -size * 0.08, bottom: -size * 0.06, width: size * 0.42, height: size * 0.42, borderRadius: size, background: `linear-gradient(180deg, #4ADE80, ${GREEN})`, border: '4px solid #fff', transform: `scale(${eo(check)})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: size * 0.18, height: size * 0.09, borderLeft: '6px solid #fff', borderBottom: '6px solid #fff', transform: 'rotate(-45deg) translate(1px, -2px)'}} />
      </div>
    )}
  </div>
);
const LEAD_C = [BLUE, ORANGE, '#8B5CF6', DEEP, '#14B8A6', '#EC4899', BLUE, ORANGE, '#8B5CF6', DEEP];

// Glossy spreadsheet card for the hook
const Sheet: React.FC<{name: string}> = ({name}) => (
  <Card style={{width: 700, overflow: 'hidden', borderRadius: 34}}>
    <div style={{background: 'linear-gradient(180deg, #2BB673, #18894F)', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{width: 44, height: 44, borderRadius: 10, background: '#fff', color: '#18894F', fontFamily: FONT, fontWeight: 700, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>X</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#fff'}}>{name}</div>
    </div>
    {Array.from({length: 6}, (_, r) => (
      <div key={r} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '16px 30px', borderBottom: '2px solid #E8EDF5', background: r % 2 ? '#F7F9FC' : '#fff'}}>
        <Lead c={LEAD_C[r]} size={46} />
        <div style={{height: 16, width: 180 + ((r * 37) % 90), borderRadius: 8, background: '#D5DCE8'}} />
        <div style={{height: 16, width: 110, borderRadius: 8, background: '#E4E9F1', marginLeft: 'auto'}} />
      </div>
    ))}
  </Card>
);

// ---------- 1 · Hook ----------
const Hook: React.FC = () => {
  const t = useSec();
  const c = S.hook;
  const T = TEXT.Hook;
  const ex = eo(P(t, c.excel, 0.4));
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={c.dur}>
        <Orbit cx={540} cy={1120} rx={470} ry={330} at={0.2} dim speed={0.3} />
        <Abs x={540} y={800} center style={{perspective: 1600, zIndex: 3}}>
          <SpringIn at={c.sheet} level={SP} from={{y: 200, scale: 0.7}}>
            <div style={{transform: `rotateX(16deg) rotateZ(${-4 + 1.5 * Math.sin(t * 1.5)}deg)`}}><Sheet name={T.sheet} /></div>
          </SpringIn>
        </Abs>
        <Abs x={60} y={210} w={960}>
          <SpringIn at={c.head} level={SP} from={{y: 60, opacity: 0}}><H size={fit(T.line1, 100, 16)}>{T.line1}</H></SpringIn>
          <div style={{transform: `scale(${lerp(0.7, 1, ex) + 0.08 * Math.sin(ex * Math.PI)})`, opacity: ex}}>
            <H size={fit(T.line2, 116, 15)} cols={['#18894F', GREEN]}>{T.line2}</H>
          </div>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 2 · Ads ----------
const Ads: React.FC = () => {
  const t = useSec();
  const c = S.ads;
  const T = TEXT.Ads;
  const end = eo(P(t, c.ended, 0.4));
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={c.dur}>
        <Abs x={60} y={200} w={960}><SpringIn at={c.head} level={SP} from={{y: 60, opacity: 0}}><H size={fit(T.headline, 104, 16)} cols={[DEEP, BLUE]}>{T.headline}</H></SpringIn></Abs>
        <Obj3D kind="coin" x={540} y={600} size={400} at={c.coin} level={1} />
        <Abs x={540} y={900} center style={{opacity: lerp(1, 0.55, end)}}>
          <Sub size={40}><span style={{...rise(t, c.lead - 0.2), display: 'inline-block', fontWeight: 700, color: NAVY}}>{T.lead}</span></Sub>
          <div style={{height: 20}} />
          <SpringIn at={c.lead} level={SP} from={{x: 400, scale: 0.6, rotate: 8}}>
            <div style={{transform: `translateY(${6 * Math.sin(t * 2)}px)`}}><Crop img={ART.pack} r={CROP.cards[0]} dw={600} radius={34} style={{boxShadow: `0 24px 50px rgba(14,27,77,0.25), 0 0 0 5px ${GOLD}`}} /></div>
          </SpringIn>
        </Abs>
        <Abs x={140} y={1390} w={800} style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <SpringIn at={c.call} level={SP} from={{scale: 0.2, rotate: -40}}>
            <div style={{filter: `grayscale(${end})`, transform: `rotate(${end ? 0 : 8 * Math.sin(t * 20)}deg)`}}><Icon cx={ICONS.call} size={170} glow={`${ORANGE}88`} /></div>
          </SpringIn>
          <div>
            <div style={rise(t, c.call + 0.15)}><H size={fit(T.call, 72, 12)} align="left">{T.call}</H></div>
            <div style={{marginTop: 16, opacity: end, transform: `scale(${lerp(0.6, 1, end)})`, transformOrigin: 'left center'}}>
              <Pill c="#FF7B7B" c2={RED} style={{padding: '12px 34px', display: 'inline-block'}}><span style={{fontFamily: FONT, fontWeight: 700, fontSize: fit(T.ended, 46, 15), color: '#fff', whiteSpace: 'nowrap'}}>{T.ended}</span></Pill>
            </div>
          </div>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 3 · Follow-ups ----------
const STEP_ICONS = [ICONS.call, ICONS.whatsapp, ICONS.calendar, ICONS.notes];
const STEP_X = [175, 418, 661, 904];
const Follow: React.FC = () => {
  const t = useSec();
  const c = S.follow;
  const T = TEXT.FollowUps;
  const four = eo(P(t, c.four, 0.5));
  const dot = cl((t - 0.8) / (c.four - 0.8)) * 3; // lead travels along the steps
  const cross = eo(P(t, c.cross, 0.35));
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={c.dur}>
        <Abs x={60} y={190} w={960}>
          <div style={rise(t, c.intro)}><Sub size={52} color={NAVY}>{T.intro}</Sub></div>
          <div style={{opacity: four, transform: `scale(${lerp(0.6, 1, four) + 0.1 * Math.sin(four * Math.PI)})`}}>
            <H size={fit(T.big, 124, 13)} cols={[ORANGE, GOLD]}>{T.big}</H>
          </div>
        </Abs>
        <Abs x={STEP_X[0]} y={706} w={STEP_X[3] - STEP_X[0]} style={{height: 10, borderRadius: 10, background: '#DCE4F2'}}>
          <div style={{width: `${(Math.min(dot, 3) / 3) * 100}%`, height: '100%', borderRadius: 10, background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`}} />
        </Abs>
        {STEP_ICONS.map((ic, i) => {
          const on = eo(P(t, stagger(i, c.four, 0.18), 0.4));
          const reached = dot >= i - 0.05;
          return (
            <Abs key={i} x={STEP_X[i] - 90} y={620} w={180} style={{textAlign: 'center'}}>
              <SpringIn at={0.3 + i * 0.12} level={SP} from={{scale: 0.3, y: 60}}>
                <div style={{display: 'inline-block', position: 'relative', filter: reached || on ? undefined : 'grayscale(0.8)', opacity: reached || on ? 1 : 0.6, transform: `scale(${1 + 0.12 * Math.sin(on * Math.PI)})`}}>
                  <Icon cx={ic} size={150} />
                  <div style={{position: 'absolute', right: -14, top: -14, width: 54, height: 54, borderRadius: 54, background: `linear-gradient(180deg, #FFE27A, ${GOLD})`, border: '4px solid #fff', fontFamily: FONT, fontWeight: 700, fontSize: 28, color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on})`}}>{i + 1}</div>
                </div>
                <div style={{marginTop: 14, fontFamily: FONT, fontWeight: 700, fontSize: fit(T.steps[i], 36, 9), color: NAVY}}>{T.steps[i]}</div>
              </SpringIn>
            </Abs>
          );
        })}
        {t < c.four + 0.3 && (
          <Abs x={STEP_X[0] + (dot / 3) * (STEP_X[3] - STEP_X[0]) - 40} y={530} style={{opacity: 1 - P(t, c.four, 0.3), transform: `translateY(${-10 * Math.abs(Math.sin(t * 6))}px)`}}><Lead c={BLUE} size={80} /></Abs>
        )}
        <Abs x={80} y={1060} w={920}>
          <SpringIn at={c.once} level={SP} from={{y: 200, scale: 0.8, opacity: 0}}>
            <Card style={{padding: '50px 50px', display: 'flex', alignItems: 'center', gap: 44}}>
              <div style={{position: 'relative'}}>
                <Icon cx={ICONS.target} size={210} glow={`${RED}66`} />
                {[45, -45].map((r) => (
                  <div key={r} style={{position: 'absolute', left: -10, top: 95, width: 230 * cross, height: 22, borderRadius: 12, background: RED, boxShadow: '0 4px 12px rgba(239,68,68,0.5)', transform: `rotate(${r}deg)`, transformOrigin: '115px 11px'}} />
                ))}
              </div>
              <div style={{flex: 1}}>
                <H size={fit(T.once, 62, 15)} align="left">{T.once}</H>
                <div style={{marginTop: 14, ...rise(t, c.cross)}}><H size={fit(T.noRetarget, 50, 18)} color={RED} align="left">{T.noRetarget}</H></div>
              </div>
            </Card>
          </SpringIn>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 4 · Example: 10 leads, 3 converted, 7 lost ----------
const gx = (i: number) => 540 + ((i % 5) - 2) * 185;
const gy = (i: number) => 600 + Math.floor(i / 5) * 190;
const BIN = {excel: {x: 290, y: 1380}, phone: {x: 790, y: 1380}};
const Example: React.FC = () => {
  const t = useSec();
  const c = S.example;
  const T = TEXT.Example;
  const conv = P(t, c.three, 0.4);
  const lost = eo(P(t, c.seven, 0.4));
  const wasted = eo(P(t, c.wasted, 0.35));
  const shake = t > c.wasted && t < c.wasted + 0.5 ? 10 * Math.sin(t * 70) * (1 - (t - c.wasted) / 0.5) : 0;
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={c.dur}>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
          <Abs x={540} y={150} center><SpringIn at={c.tag} level={SP} from={{scale: 0.4}}><Pill c="#5DA9F0" c2={DEEP} style={{padding: '10px 40px'}}><span style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: '#fff'}}>{T.tag}</span></Pill></SpringIn></Abs>
          <Abs x={60} y={260} w={960}><SpringIn at={c.ad} level={SP} from={{y: 60, opacity: 0}}><H size={fit(T.headline, 100, 15)}>{T.headline}</H></SpringIn></Abs>
          {Array.from({length: 10}, (_, i) => {
            const isConv = i < 3;
            const toExcel = i >= 3 && i < 7;
            const flyAt = toExcel ? c.excel + 0.25 + (i - 3) * 0.1 : c.phone + 0.25 + (i - 7) * 0.1;
            const fly = isConv ? 0 : eo(P(t, flyAt, 0.6));
            const j = toExcel ? i - 3 : i - 7;
            const bin = toExcel ? BIN.excel : BIN.phone;
            const tx = bin.x + (j - (toExcel ? 1.5 : 1)) * 62;
            const x = lerp(gx(i), tx, fly);
            const y = lerp(gy(i), bin.y + 70, fly) - Math.sin(fly * Math.PI) * 160;
            const size = lerp(140, 70, fly);
            const k = eo(P(t, stagger(i, c.ten, 0.07), 0.4));
            return (
              <div key={i} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, zIndex: 5, opacity: k, transform: `scale(${lerp(0.2, 1, k) * (isConv ? 1 + 0.12 * Math.sin(conv * Math.PI) : 1)})`, filter: !isConv && lost > 0 ? `grayscale(${lost}) opacity(${lerp(1, 0.7, lost)})` : undefined}}>
                <Lead c={isConv && conv > 0 ? GREEN : LEAD_C[i]} size={size} check={isConv ? conv : 0} />
              </div>
            );
          })}
          <Abs x={70} y={930} w={940} style={{display: 'flex', justifyContent: 'center', gap: 22}}>
            <SpringIn at={c.three + 0.2} level={SP} from={{scale: 0.3, y: 40}}><Pill c="#4ADE80" c2={GREEN} style={{padding: '14px 30px'}}><span style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: '#fff', whiteSpace: 'nowrap'}}>{T.converted}</span></Pill></SpringIn>
            <SpringIn at={c.paid} level={SP} from={{scale: 0.3, y: 40}}><Pill c="#FFE27A" c2={GOLD} style={{padding: '14px 30px'}}><span style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: NAVY, whiteSpace: 'nowrap'}}>{T.paid}</span></Pill></SpringIn>
            <SpringIn at={c.seven + 0.2} level={SP} from={{scale: 0.3, y: 40}}><Pill c="#FF8A8A" c2={RED} style={{padding: '14px 30px'}}><span style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: '#fff', whiteSpace: 'nowrap'}}>{T.lost}</span></Pill></SpringIn>
          </Abs>
          {[{b: BIN.excel, at: c.excel, ic: ICONS.notes, label: T.excel}, {b: BIN.phone, at: c.phone, ic: ICONS.contact, label: T.phone}].map((k, i) => (
            <Abs key={i} x={k.b.x - 215} y={k.b.y - 190} w={430}>
              <SpringIn at={k.at} level={SP} from={{y: 200, scale: 0.6, opacity: 0}}>
                <Card style={{height: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 34, gap: 14}}>
                  <Icon cx={k.ic} size={110} />
                  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: fit(k.label, 40, 12), color: NAVY}}>{k.label}</div>
                </Card>
              </SpringIn>
            </Abs>
          ))}
          <Abs x={540} y={1640} center style={{zIndex: 8}}>
            <div style={{opacity: wasted, transform: `scale(${lerp(2.2, 1, wasted)}) rotate(-6deg)`}}>
              <div style={{border: `8px solid ${RED}`, borderRadius: 30, padding: '14px 46px', background: 'rgba(255,255,255,0.9)', boxShadow: '0 20px 50px rgba(239,68,68,0.35)'}}>
                <div style={{whiteSpace: 'nowrap'}}><H size={fit(T.wasted, 96, 13)} color={RED}>{T.wasted}</H></div>
              </div>
            </div>
          </Abs>
        </div>
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- 5 · Reveal ----------
const LogoCard: React.FC<{h?: number}> = ({h = 120}) => (
  <div style={{background: 'rgba(255,255,255,0.94)', borderRadius: 48, padding: '34px 50px', boxShadow: '0 30px 70px rgba(14,27,77,0.22), inset 0 2px 0 #fff'}}>
    <Img src={staticFile(ART.logo)} style={{height: h, display: 'block'}} />
  </div>
);
const Reveal: React.FC = () => {
  const t = useSec();
  const c = S.reveal;
  const T = TEXT.Reveal;
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={c.dur}>
        <Abs x={60} y={230} w={960}><SpringIn at={c.head} level={SP} from={{y: 60, opacity: 0}}><H size={fit(T.headline, 110, 14)} cols={[DEEP, BLUE, GREEN]}>{T.headline}</H></SpringIn></Abs>
        <Orbit cx={540} cy={900} at={c.brand + 0.1} />
        <Abs x={540} y={810} center style={{zIndex: 5}}><SpringIn at={c.brand} level={SP} from={{scale: 0.3, y: 60}}><LogoCard /></SpringIn></Abs>
        <Abs x={60} y={1330} w={960}><div style={rise(t, c.sub)}><H size={fit(T.sub, 64, 24)} color={NAVY}>{T.sub}</H></div></Abs>
      </CameraRig>
      <LightSweep at={c.sub + 0.3} />
    </AbsoluteFill>
  );
};

// ---------- 6-8 · Features ----------
type Chip = {r: number; x: number; y: number; at: number; rot: number; from: number};
const Feature: React.FC<{dur: number; icon: number; iconAt: number; glow: string; tag: string; title: string; titleAt: number; sub?: string; subAt?: number; children?: React.ReactNode; chips?: Chip[]}> = ({dur, icon, iconAt, glow, tag, title, titleAt, sub, subAt = 99, children, chips = []}) => {
  const t = useSec();
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={dur}>
        <Abs x={70} y={170}>
          <SpringIn at={iconAt} level={SP} from={{scale: 0.2, rotate: -40}}>
            <div style={{transform: `translateY(${8 * Math.sin(t * 3)}px)`}}><Icon cx={icon} size={190} glow={`${glow}88`} /></div>
          </SpringIn>
        </Abs>
        <Abs x={295} y={172} w={740}>
          <SpringIn at={iconAt + 0.1} level={SP} from={{x: 60, opacity: 0}}>
            <div style={{display: 'inline-block', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#fff', background: glow, borderRadius: 30, padding: '6px 22px'}}>{tag}</div>
          </SpringIn>
          <SpringIn at={titleAt} level={SP} from={{x: 80, opacity: 0}}>
            <div style={{marginTop: 10}}><H size={fit(title, 64, 22)} align="left">{title}</H></div>
          </SpringIn>
        </Abs>
        {sub && <Abs x={70} y={430} w={940}><div style={rise(t, subAt)}><Sub size={44} align="left">{sub}</Sub></div></Abs>}
        {children}
        {chips.map((k, i) => (
          <Abs key={i} x={k.x} y={k.y} style={{zIndex: 7}}>
            <SpringIn at={k.at} level={SP} from={{scale: 0.3, x: k.from, y: -150}}>
              <div style={{transform: `rotate(${k.rot}deg) translateY(${6 * Math.sin(t * 2 + i)}px)`}}>
                <Crop img={ART.pack} r={CROP.cards[k.r]} dw={520} radius={30} style={{boxShadow: `0 24px 50px rgba(14,27,77,0.25), 0 0 0 5px ${GOLD}`}} />
              </div>
            </SpringIn>
          </Abs>
        ))}
      </CameraRig>
    </AbsoluteFill>
  );
};
const PhoneHero: React.FC<{r: typeof CROP.aiPhone; at: number}> = ({r, at}) => {
  const t = useSec();
  const sw = eo(P(t, at, 0.8));
  return (
    <Abs x={540} y={590} center style={{perspective: 1600}}>
      <div style={{transform: `rotateY(${lerp(-55, -10, sw) + 3 * Math.sin(t * 1.4)}deg) rotateX(${lerp(20, 4, sw)}deg) translateY(${lerp(500, 0, sw)}px)`, opacity: cl(sw * 2)}}>
        <Crop img={ART.pack} r={r} dw={500} radius={68} style={{boxShadow: '0 50px 90px rgba(14,27,77,0.4), 0 0 0 10px #E9EEF7, 0 0 0 14px #C5CEDD'}} />
      </div>
    </Abs>
  );
};
const WhatsApp: React.FC = () => {
  const c = S.whatsapp;
  const T = TEXT.WhatsApp;
  return (
    <Feature dur={c.dur} icon={ICONS.whatsapp} iconAt={c.icon} glow={GREEN} tag={T.tag} title={T.title} titleAt={c.title} sub={T.sub} subAt={c.sub}
      chips={[{r: 0, x: 30, y: 1180, at: c.lead, rot: -4, from: 200}, {r: 1, x: 520, y: 1500, at: c.card, rot: 3, from: -200}]}>
      <PhoneHero r={CROP.waPhone} at={c.phone} />
    </Feature>
  );
};
const Calling: React.FC = () => {
  const c = S.calling;
  const T = TEXT.Calling;
  return (
    <Feature dur={c.dur} icon={ICONS.call} iconAt={c.icon} glow={ORANGE} tag={T.tag} title={T.title} titleAt={c.title} sub={T.sub} subAt={c.sub}
      chips={[{r: 2, x: 30, y: 1320, at: c.card, rot: -4, from: 200}, {r: 3, x: 520, y: 1520, at: c.card2, rot: 3, from: -200}]}>
      <PhoneHero r={CROP.aiPhone} at={c.phone} />
    </Feature>
  );
};
const Pipeline: React.FC = () => {
  const t = useSec();
  const c = S.pipeline;
  const T = TEXT.Pipeline;
  const sw = eo(P(t, c.screen, 0.9));
  return (
    <Feature dur={c.dur} icon={ICONS.funnel} iconAt={c.icon} glow={BLUE} tag={T.tag} title={T.title} titleAt={c.title}>
      <Abs x={540} y={470} center style={{perspective: 1800}}>
        <div style={{transform: `rotateY(${lerp(40, -6, sw) + 2 * Math.sin(t * 1.2)}deg) rotateX(${lerp(25, 6, sw)}deg) translateY(${lerp(600, 0, sw)}px) scale(${lerp(0.8, 1, sw)})`, opacity: cl(sw * 2)}}>
          <div style={{background: 'linear-gradient(180deg, #FFFFFF, #E6ECF6)', padding: 18, borderRadius: 40, boxShadow: '0 50px 100px rgba(14,27,77,0.35), inset 0 2px 0 #fff'}}>
            <Crop img={ART.pack} r={CROP.screen} dw={920} radius={24} />
          </div>
        </div>
      </Abs>
      {[{label: T.newLeads, to: 120, x: 90, c: BLUE}, {label: T.won, to: 19, x: 610, c: GREEN}].map((k, i) => (
        <Abs key={i} x={k.x} y={1100}>
          <SpringIn at={c.counters + i * 0.2} level={SP} from={{scale: 0.4, y: 40}}>
            <Pill c="#ffffff" c2="#E3EBFA" style={{padding: '18px 40px', boxShadow: `0 16px 36px rgba(14,27,77,0.2), 0 0 0 5px ${GOLD}`}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
                <CountUp to={k.to} at={c.counters + 0.1 + i * 0.2} dur={1.1} style={{fontFamily: FONT, fontWeight: 700, fontSize: 76, color: k.c}} />
                <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 36, color: NAVY, whiteSpace: 'nowrap'}}>{k.label}</span>
              </div>
            </Pill>
          </SpringIn>
        </Abs>
      ))}
      <Abs x={80} y={1380} w={920}>
        <SpringIn at={c.sub} level={SP} from={{y: 160, scale: 0.8, opacity: 0}}>
          <Card style={{padding: '40px 44px', display: 'flex', alignItems: 'center', gap: 36}}>
            <div style={{transform: `rotate(${6 * Math.sin(t * 3)}deg)`}}><Icon cx={ICONS.target} size={160} glow={`${RED}66`} /></div>
            <H size={fit(T.sub, 54, 22)} align="left">{T.sub}</H>
          </Card>
        </SpringIn>
      </Abs>
    </Feature>
  );
};

// ---------- 9 · Result ----------
const Result: React.FC = () => {
  const t = useSec();
  const c = S.result;
  const T = TEXT.Result;
  const tenx = eo(P(t, c.tenx, 0.5));
  return (
    <AbsoluteFill>
      <PastelBg />
      <Particles level={2} colors={[GOLD, ORANGE, GREEN, BLUE]} shapes={['sparkle', 'dot']} seed={11} opacity={0.7} avoid={{x: 80, y: 300, w: 920, h: 1300}} />
      <CameraRig level={1} dur={c.dur}>
        <Abs x={540} y={160} center><SpringIn at={c.label} level={SP} from={{scale: 0.3}}><Pill c="#FFE27A" c2={ORANGE} style={{padding: '12px 50px'}}><span style={{fontFamily: FONT, fontWeight: 700, fontSize: 48, color: NAVY}}>{T.label}</span></Pill></SpringIn></Abs>
        {T.items.map((s, i) => (
          <Abs key={i} x={130} y={330 + i * 160} w={860}>
            <SpringIn at={c.items[i]} level={SP} from={{x: -300, opacity: 0}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 34}}>
                <Icon cx={ICONS.chart} size={120} glow={`${GREEN}88`} />
                <H size={fit(s, 64, 17)} align="left">{s}</H>
              </div>
            </SpringIn>
          </Abs>
        ))}
        <Abs x={60} y={830} w={960} style={{textAlign: 'center', opacity: tenx, transform: `scale(${lerp(0.5, 1, tenx) + 0.08 * Math.sin(tenx * Math.PI)})`}}>
          <Sub size={56} color={NAVY}>{T.upTo}</Sub>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 230, lineHeight: 1, color: ORANGE, textShadow: `0 14px 40px ${ORANGE}66`}}>
            <CountUp to={10} at={c.tenx} dur={0.9} style={{}} />
            <span style={{fontSize: fit(T.growth, 110, 9)}}>{T.growth}</span>
          </div>
        </Abs>
        <Abs x={80} y={1380} w={920}>
          <SpringIn at={c.team} level={SP} from={{y: 160, scale: 0.8, opacity: 0}}>
            <Card style={{padding: '40px 44px', display: 'flex', alignItems: 'center', gap: 36}}>
              <div style={{transform: `translateY(${6 * Math.sin(t * 3)}px)`}}><Icon cx={ICONS.team} size={160} glow="#8B5CF688" /></div>
              <H size={fit(T.team, 58, 18)} align="left">{T.team}</H>
            </Card>
          </SpringIn>
        </Abs>
      </CameraRig>
      <LightSweep at={c.tenx + 0.4} />
    </AbsoluteFill>
  );
};

// ---------- 10 · CTA ----------
const Cta: React.FC = () => {
  const t = useSec();
  const c = S.cta;
  const T = TEXT.CTA;
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={c.dur}>
        <Orbit cx={540} cy={640} at={c.brand} />
        <Abs x={540} y={550} center style={{zIndex: 5}}><SpringIn at={c.brand} level={SP} from={{scale: 0.3, y: 60}}><LogoCard /></SpringIn></Abs>
        <Abs x={540} y={1030} center>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, ...rise(t, c.by)}}>
            <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 46, color: SLATE}}>{T.by}</span>
            <Img src={staticFile(MB_LOGO)} style={{height: 78}} />
          </div>
        </Abs>
        <Abs x={540} y={1260} center>
          <SpringIn at={c.signup} level={SP} from={{scale: 0.4, y: 60}}>
            <Pill c={GOLD} c2={ORANGE} style={{padding: '30px 80px', transform: `scale(${1 + 0.03 * Math.sin(t * 6)})`}}>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: fit(T.signup, 72, 12), color: NAVY, whiteSpace: 'nowrap'}}>{T.signup} →</div>
            </Pill>
          </SpringIn>
        </Abs>
        <Abs x={60} y={1480} w={960}><div style={rise(t, c.site)}><H size={fit(T.site, 84, 14)} cols={[DEEP, BLUE, GREEN]}>{T.site}</H></div></Abs>
      </CameraRig>
      <LightSweep at={c.signup + 0.4} />
    </AbsoluteFill>
  );
};

// ---------- 11 · MagicBolt logo build ----------
const EndLogo: React.FC = () => (
  <AbsoluteFill>
    <PastelBg />
    <div style={{position: 'absolute', left: (1080 - 1440 * 0.72) / 2, top: 960 - 240 * 0.72, width: 1440, height: 480, transform: 'scale(0.72)', transformOrigin: 'top left'}}>
      <LogoAnim />
    </div>
  </AbsoluteFill>
);

const SCENES: Record<SceneKey, React.FC> = {hook: Hook, ads: Ads, follow: Follow, example: Example, reveal: Reveal, whatsapp: WhatsApp, calling: Calling, pipeline: Pipeline, result: Result, cta: Cta, logo: EndLogo};

export const WayIconsVideo: React.FC = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    {ORDER.map((k, i) => {
      const Scene = SCENES[k];
      return (
        <SceneSeq key={k} name={k} start={START[k]} dur={S[k].dur} first={i === 0} last={i === ORDER.length - 1} {...transitionFor(i, LEVEL_T)}>
          <Scene />
        </SceneSeq>
      );
    })}
  </AbsoluteFill>
);
