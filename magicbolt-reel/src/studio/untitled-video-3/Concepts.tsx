// Concept samples for the WayCRM icons reel: two looks, 2 key moments of 3 s each.
//   A · Icon Orbit (bright pastel waves, glossy WayCRM icon tiles orbit the logo, real screens swing in)
//   B · Live Pipeline (deep navy glass, robot host, live activity cards stack, bento of feature tiles)
import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import {CameraRig, CountUp, LightSweep, Particles, SpringIn, cl, eo, lerp, P, stagger, useSec} from '../kit';
import {ART, BLUE, CROP, DEEP, FONT, GOLD, GREEN, ICONS, ICON_LIST, ICON_Y, LEVEL, MOMENT, NAVY, ORANGE, Rect, SLATE, Src} from './config';
import TEXT from './text.json';

type Kind = 'a' | 'b';
const SP = LEVEL.spring;

// ---------- shared parts ----------
export const Abs: React.FC<{x: number; y: number; w?: number; center?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, center, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, transform: center ? 'translateX(-50%)' : undefined, ...style}}>{children}</div>
);
export const grad = (cols: string[]): React.CSSProperties => ({background: `linear-gradient(90deg, ${cols.join(', ')})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'});

// A region of a source image, shown at width dw
export const Crop: React.FC<{img: Src; r: Rect; dw: number; radius?: number; style?: React.CSSProperties}> = ({img, r, dw, radius = 0, style}) => {
  const s = dw / r[2];
  return (
    <div style={{width: dw, height: r[3] * s, overflow: 'hidden', borderRadius: radius, position: 'relative', ...style}}>
      <Img src={staticFile(img.src)} style={{position: 'absolute', left: -r[0] * s, top: -r[1] * s, width: img.w * s, height: img.h * s, maxWidth: 'none'}} />
    </div>
  );
};
const iconRect = (cx: number): Rect => [cx - 31, ICON_Y - 31, 62, 62];
export const Icon: React.FC<{cx: number; size: number; glow?: string}> = ({cx, size, glow = 'rgba(14,27,77,0.28)'}) => (
  <Crop img={ART.pack} r={iconRect(cx)} dw={size} radius={size * 0.26} style={{boxShadow: `0 ${size * 0.12}px ${size * 0.3}px ${glow}`}} />
);
export const Pill: React.FC<{c: string; c2: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({c, c2, children, style}) => (
  <div style={{position: 'relative', borderRadius: 80, background: `linear-gradient(180deg, ${c}, ${c2})`, boxShadow: `0 16px 36px ${c2}77, inset 0 2px 0 rgba(255,255,255,0.55)`, overflow: 'hidden', ...style}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.05))'}} />
    <div style={{position: 'relative'}}>{children}</div>
  </div>
);
export const fit = (text: string, base: number, maxChars: number) => (text.length > maxChars ? Math.round(base * maxChars / text.length) : base);

// ---------- Concept A backgrounds ----------
export const PastelBg: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F8FF 60%, #FFF7EA 100%)'}}>
      <Img src={staticFile(ART.bg)} style={{position: 'absolute', left: -30, top: -40, width: 1140, height: 2000, opacity: 0.85, transform: `translate(${12 * Math.sin(t * 0.5)}px, ${16 * Math.cos(t * 0.4)}px) scale(${1.02 + 0.01 * Math.sin(t * 0.3)})`}} />
      <div style={{position: 'absolute', left: -260, top: -200, width: 900, height: 900, borderRadius: 900, background: `radial-gradient(circle, ${BLUE}22, transparent 70%)`}} />
      <Particles level={1} colors={[GOLD, BLUE, GREEN]} shapes={['sparkle', 'dot']} seed={3} opacity={0.6} />
    </AbsoluteFill>
  );
};

// A1 · Hook: icons orbit the WayCRM logo, headline lands
const A1: React.FC = () => {
  const t = useSec();
  const T = TEXT._concepts.A_Hook;
  const n = ICON_LIST.length;
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={MOMENT}>
        {ICON_LIST.map((cx, i) => {
          const a = (i / n) * Math.PI * 2 + t * 0.45 - Math.PI / 2;
          const depth = (Math.sin(a) + 1) / 2; // 0 back (top) .. 1 front (bottom)
          const k = eo(P(t, 0.15 + i * 0.06, 0.5));
          const x = 540 + Math.cos(a) * 430 * lerp(0.2, 1, k);
          const y = 700 + Math.sin(a) * 250 * lerp(0.2, 1, k);
          const size = lerp(96, 150, depth);
          return (
            <div key={cx} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, zIndex: Math.round(depth * 10), opacity: k * lerp(0.75, 1, depth), transform: `scale(${lerp(0.3, 1, k)}) rotate(${(1 - k) * -90}deg)`}}>
              <Icon cx={cx} size={size} />
            </div>
          );
        })}
        <Abs x={540} y={610} center style={{zIndex: 5}}>
          <SpringIn at={0.05} level={SP} from={{scale: 0.4, y: 40}}>
            <div style={{background: 'rgba(255,255,255,0.92)', borderRadius: 48, padding: '34px 50px', boxShadow: '0 30px 70px rgba(14,27,77,0.22), inset 0 2px 0 #fff'}}>
              <Img src={staticFile(ART.logo)} style={{height: 120, display: 'block'}} />
            </div>
          </SpringIn>
        </Abs>
        <Abs x={60} y={1150} w={960}>
          <SpringIn at={0.9} level={SP} from={{y: 70, opacity: 0}}>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: fit(T.line1, 104, 16), lineHeight: 1.1, textAlign: 'center', color: NAVY, letterSpacing: -2}}>{T.line1}</div>
          </SpringIn>
          <SpringIn at={1.15} level={SP} from={{y: 70, opacity: 0}}>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: fit(T.line2, 104, 18), lineHeight: 1.15, textAlign: 'center', letterSpacing: -2, ...grad([DEEP, BLUE, GREEN])}}>{T.line2}</div>
          </SpringIn>
          <div style={{marginTop: 34, fontFamily: FONT, fontWeight: 400, fontSize: 42, lineHeight: 1.3, textAlign: 'center', color: SLATE, opacity: eo(P(t, 1.6, 0.5)), transform: `translateY(${(1 - eo(P(t, 1.6, 0.5))) * 30}px)`}}>{T.sub}</div>
        </Abs>
      </CameraRig>
      <LightSweep at={1.9} />
    </AbsoluteFill>
  );
};

// A2 · Feature: big icon + title on the word, real phone screen swings in, activity chips fly off it
const A2: React.FC = () => {
  const t = useSec();
  const T = TEXT._concepts.A_Feature;
  const sw = eo(P(t, 0.5, 0.8));
  return (
    <AbsoluteFill>
      <PastelBg />
      <CameraRig level={1} dur={MOMENT}>
        <Abs x={80} y={170}>
          <SpringIn at={0.05} level={SP} from={{scale: 0.2, rotate: -40}}>
            <div style={{transform: `translateY(${8 * Math.sin(t * 3)}px)`}}><Icon cx={ICONS.call} size={190} glow={`${ORANGE}88`} /></div>
          </SpringIn>
        </Abs>
        <Abs x={300} y={175} w={720}>
          <SpringIn at={0.2} level={SP} from={{x: 60, opacity: 0}}>
            <div style={{display: 'inline-block', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#fff', background: ORANGE, borderRadius: 30, padding: '6px 22px'}}>{T.tag}</div>
          </SpringIn>
          <SpringIn at={0.35} level={SP} from={{x: 80, opacity: 0}}>
            <div style={{marginTop: 10, fontFamily: FONT, fontWeight: 700, fontSize: fit(T.title, 66, 22), lineHeight: 1.12, color: NAVY, letterSpacing: -1}}>{T.title}</div>
          </SpringIn>
        </Abs>
        <Abs x={80} y={430} w={920}>
          <div style={{fontFamily: FONT, fontSize: 44, color: SLATE, opacity: eo(P(t, 0.8, 0.4))}}>{T.sub}</div>
        </Abs>
        <Abs x={540} y={600} center style={{perspective: 1600}}>
          <div style={{transform: `rotateY(${lerp(-55, -10, sw) + 3 * Math.sin(t * 1.4)}deg) rotateX(${lerp(20, 4, sw)}deg) translateY(${lerp(500, 0, sw)}px)`, opacity: cl(sw * 2)}}>
            <Crop img={ART.pack} r={CROP.aiPhone} dw={520} radius={70} style={{boxShadow: '0 50px 90px rgba(14,27,77,0.4), 0 0 0 10px #E9EEF7, 0 0 0 14px #C5CEDD'}} />
          </div>
        </Abs>
        {[{c: CROP.cards[2], x: 40, y: 1320, at: 1.4, r: -4}, {c: CROP.cards[3], x: 520, y: 1520, at: 1.75, r: 3}].map((k, i) => (
          <Abs key={i} x={k.x} y={k.y}>
            <SpringIn at={k.at} level={SP} from={{scale: 0.3, x: i ? -200 : 200, y: -150}}>
              <div style={{transform: `rotate(${k.r}deg) translateY(${6 * Math.sin(t * 2 + i)}px)`}}>
                <Crop img={ART.pack} r={k.c} dw={520} radius={30} style={{boxShadow: `0 24px 50px rgba(14,27,77,0.25), 0 0 0 5px ${GOLD}`}} />
              </div>
            </SpringIn>
          </Abs>
        ))}
      </CameraRig>
    </AbsoluteFill>
  );
};

// ---------- Concept B ----------
const NavyBg: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 20%, ${DEEP} 0%, ${NAVY} 55%, #070E2B 100%)`}}>
      <div style={{position: 'absolute', inset: -100, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '90px 90px', transform: `translateY(${(t * 20) % 90}px)`}} />
      <div style={{position: 'absolute', right: -300, top: 1100 + 40 * Math.sin(t * 0.5), width: 900, height: 900, borderRadius: 900, background: `radial-gradient(circle, ${GOLD}22, transparent 70%)`}} />
      <Particles level={1} colors={[GOLD, BLUE, '#ffffff']} shapes={['sparkle', 'dot']} seed={7} opacity={0.5} />
    </AbsoluteFill>
  );
};
const Glass: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: 'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))', border: '2px solid rgba(255,255,255,0.22)', borderRadius: 40, boxShadow: '0 30px 70px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.25)', ...style}}>{children}</div>
);

// B1 · Robot host + live activity cards stacking
const B1: React.FC = () => {
  const t = useSec();
  const T = TEXT._concepts.B_Feed;
  const cards = [CROP.cards[0], CROP.cards[1], CROP.cards[2], CROP.cards[4]];
  return (
    <AbsoluteFill>
      <NavyBg />
      <CameraRig level={1} dur={MOMENT}>
        <Abs x={540} y={110} center>
          <SpringIn at={0.05} level={SP} from={{scale: 0.5, y: -60}}>
            <div style={{width: 470, height: 420, borderRadius: 470, background: 'radial-gradient(circle at 50% 45%, #FFFFFF 0%, #EAF2FF 55%, rgba(234,242,255,0) 71%)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${10 * Math.sin(t * 2.4)}px)`}}>
              <Crop img={ART.calling} r={CROP.robot} dw={440} style={{WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)', maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)'}} />
            </div>
          </SpringIn>
        </Abs>
        <Abs x={60} y={560} w={960}>
          <SpringIn at={0.3} level={SP} from={{y: 50, opacity: 0}}>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: fit(T.headline, 88, 22), lineHeight: 1.12, textAlign: 'center', color: '#fff', letterSpacing: -1.5}}>
              {T.headline.split(' ').slice(0, -1).join(' ')} <span style={grad([GOLD, ORANGE])}>{T.headline.split(' ').slice(-1)}</span>
            </div>
          </SpringIn>
          <div style={{marginTop: 16, fontFamily: FONT, fontSize: 40, textAlign: 'center', color: '#B9C6EA', opacity: eo(P(t, 0.7, 0.4))}}>{T.sub}</div>
        </Abs>
        <Abs x={110} y={880} w={860}>
          <Glass style={{padding: '36px 40px 44px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26}}>
              <div style={{width: 22, height: 22, borderRadius: 22, background: GREEN, boxShadow: `0 0 ${14 + 10 * Math.sin(t * 8)}px ${GREEN}`}} />
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#fff'}}>{T.live}</div>
            </div>
            {cards.map((c, i) => {
              const at = stagger(i, 0.8, 0.32);
              return (
                <div key={i} style={{marginTop: i ? -14 : 0, marginLeft: i % 2 ? 250 : 0, position: 'relative', zIndex: i}}>
                  <SpringIn at={at} level={SP} from={{x: i % 2 ? 300 : -300, opacity: 0, scale: 0.8}}>
                    <Crop img={ART.pack} r={c} dw={530} radius={28} style={{boxShadow: '0 16px 36px rgba(0,0,0,0.35)', transform: `rotate(${i % 2 ? 2 : -2}deg) scale(${1 + 0.05 * Math.max(0, 1 - Math.abs(t - at - 0.4) * 3)})`}} />
                  </SpringIn>
                </div>
              );
            })}
          </Glass>
        </Abs>
      </CameraRig>
    </AbsoluteFill>
  );
};

// B2 · Bento: framed pipeline screen with live counters, 4 feature tiles, CTA
const B2: React.FC = () => {
  const t = useSec();
  const T = TEXT._concepts.B_Bento;
  const tiles = [ICONS.call, ICONS.whatsapp, ICONS.funnel, ICONS.team];
  const glow = [ORANGE, GREEN, BLUE, '#8B5CF6'];
  return (
    <AbsoluteFill>
      <NavyBg />
      <CameraRig level={1} dur={MOMENT}>
        <Abs x={60} y={150} w={960}>
          <SpringIn at={0.05} level={SP} from={{y: 120, scale: 0.85, rotate: -4}}>
            <Glass style={{padding: 22}}>
              <Crop img={ART.pack} r={CROP.screen} dw={916} radius={24} />
            </Glass>
          </SpringIn>
        </Abs>
        {[{label: T.newLeads, to: 120, x: 60, c: BLUE}, {label: T.won, to: 19, x: 600, c: GREEN}].map((k, i) => (
          <Abs key={i} x={k.x} y={700}>
            <SpringIn at={0.6 + i * 0.2} level={SP} from={{scale: 0.4, y: 40}}>
              <Pill c="#ffffff" c2="#E3EBFA" style={{padding: '18px 40px', display: 'flex'}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
                  <CountUp to={k.to} at={0.7 + i * 0.2} dur={1.1} style={{fontFamily: FONT, fontWeight: 700, fontSize: 70, color: k.c}} />
                  <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: NAVY}}>{k.label}</span>
                </div>
              </Pill>
            </SpringIn>
          </Abs>
        ))}
        {tiles.map((cx, i) => (
          <Abs key={i} x={60 + (i % 2) * 490} y={900 + Math.floor(i / 2) * 330} w={470}>
            <SpringIn at={stagger(i, 0.9, 0.15)} level={SP} from={{scale: 0.5, y: 80}}>
              <Glass style={{height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, boxShadow: `0 30px 70px rgba(0,0,0,0.35), 0 0 40px ${glow[i]}44, inset 0 2px 0 rgba(255,255,255,0.25)`}}>
                <div style={{transform: `translateY(${6 * Math.sin(t * 2.5 + i)}px)`}}><Icon cx={cx} size={140} glow={`${glow[i]}aa`} /></div>
                <div style={{fontFamily: FONT, fontWeight: 700, fontSize: fit(T.features[i], 40, 16), color: '#fff', textAlign: 'center', padding: '0 20px', whiteSpace: 'nowrap'}}>{T.features[i]}</div>
              </Glass>
            </SpringIn>
          </Abs>
        ))}
        <Abs x={540} y={1610} center>
          <SpringIn at={1.6} level={SP} from={{scale: 0.4, y: 60}}>
            <Pill c={GOLD} c2={ORANGE} style={{padding: '26px 70px', transform: `scale(${1 + 0.03 * Math.sin(t * 6)})`}}>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 56, color: NAVY, whiteSpace: 'nowrap'}}>{T.cta} →</div>
            </Pill>
          </SpringIn>
        </Abs>
      </CameraRig>
      <LightSweep at={2.0} />
    </AbsoluteFill>
  );
};

const SETS: Record<Kind, React.FC[]> = {a: [A1, A2], b: [B1, B2]};

export const WayIconsConcepts: React.FC<{concept?: Kind}> = ({concept = 'a'}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: NAVY}}>
      {SETS[concept].map((M, i) => (
        <Sequence key={i} from={i * MOMENT * fps} durationInFrames={MOMENT * fps}><M /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
