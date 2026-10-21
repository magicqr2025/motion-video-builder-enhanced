// Concept samples for the MagicBolt AI agency intro: two looks, each shown as 4 key moments of 3 s.
//   A · Glass Showroom (the preset: swinging screens + gold-ringed lifts)
//   B · Your Brand, Live (everything inside a white-labelled browser that repaints in the agency's colours)
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {LogoAnim} from '../../logo/LogoAnim';
import {BLUE, CROP, DEEP, GOLD, MOMENT, NAVY, ORANGE, SLATE, ShotName} from './config';
import TEXT from './text.json';
import {Abs, bob, Browser, ChannelChip, CtaButton, Feature, Gl, IconChip, In, Lift, LogoImg, Screen, SkyBG, Sparkle, StudioBG, Tx, Words, cl, eb, eo, fit, lerp, P, useSec} from './parts';

type Kind = 'a' | 'b';

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
  const k = eo(P(t, 0, 0.4));
  const tf = kind === 'a' ? `scale(${lerp(1.05, 1, k)})` : `translateX(${(1 - k) * 240}px)`;
  return <AbsoluteFill style={{opacity: Math.min(1, k * 1.5), transform: tf}}>{children}</AbsoluteFill>;
};

// Screenshot swinging in with a 3D tilt from the right
// `out` (optional) = when it swings away again
export const Swing: React.FC<{name: ShotName; x: number; y: number; w: number; at?: number; ry?: number; out?: number; children?: React.ReactNode}> = ({name, x, y, w, at = 0, ry = 9, out, children}) => {
  const t = useSec();
  const k = eo(P(t, at, 0.8));
  const ko = out === undefined ? 0 : eo(P(t, out, 0.4));
  return (
    <div style={{position: 'absolute', left: x, top: y, perspective: 2400, opacity: k * (1 - ko), transform: `translateX(${-200 * ko}px)`}}>
      <div style={{transform: `translateX(${(1 - k) * 300}px) rotateY(${-lerp(26, ry, k)}deg) rotateX(3deg) scale(${1 + 0.025 * P(t, at + 0.8, 5)})`, transformOrigin: '0% 50%'}}>
        <Screen name={name} w={w}>{children}</Screen>
      </div>
    </div>
  );
};

// gold ring drawn inside a screen around a screenshot rect (s = screen px per screenshot px)
export const Ring: React.FC<{r: [number, number, number, number]; s: number; at: number; out?: number}> = ({r, s, at, out}) => {
  const t = useSec();
  const k = eb(P(t, at, 0.5));
  const ko = out === undefined ? 0 : P(t, out, 0.3);
  return <div style={{position: 'absolute', left: r[0] * s - 6, top: r[1] * s - 6, width: r[2] * s + 12, height: r[3] * s + 12, borderRadius: 18, border: `5px solid ${GOLD}`, boxShadow: `0 0 26px ${GOLD}, inset 0 0 18px ${GOLD}66`, opacity: cl(P(t, at, 0.3) * 1.5) * (1 - ko), transform: `scale(${lerp(1.25, 1, k)})`}} />;
};

// ============================ A · Glass Showroom ============================
export const JUGGLE: {id?: string; icon?: Gl; c?: string; n?: string}[] = [
  {id: 'google', n: '9'}, {id: 'facebook'}, {id: 'instagram', n: '24'}, {id: 'whatsapp', n: '17'},
  {id: 'sheets'}, {id: 'invoice', n: '3'}, {icon: 'cal', c: DEEP}, {icon: 'star', c: GOLD},
];

const A1: React.FC = () => {
  const t = useSec();
  const minis: [ShotName, number, number, number][] = [['calendar', 1180, 260, -8], ['billing', 1470, 470, 7], ['inbox', 1210, 620, -4]];
  return (
    <AbsoluteFill>
      <Abs x={130} y={330}>
        <In at={0.05} dy={20} s0={1}><Tx size={40} color={SLATE} w={400}>{TEXT.Hook.kicker}</Tx></In>
        <div style={{height: 22}} />
        <Words text={TEXT.Hook.lines.join(' ')} at={0.3} size={fit(TEXT.Hook.lines.join(' '), 100, 1500)} hi={[2, 5]} maxW={820} step={0.09} />
      </Abs>
      {/* client screens piling up behind */}
      {minis.map(([n, x, y, r], i) => (
        <Abs key={n} x={x + 8 * Math.sin(t * 2.3 + i)} y={y + bob(t, i, 6)} style={{transform: `rotate(${r + 2 * Math.sin(t * 1.7 + i)}deg)`}}>
          <In at={0.1 + i * 0.15} s0={0.6} dy={80}><Screen name={n} w={420} /></In>
        </Abs>
      ))}
      {/* platform icons juggled in a loop around the pile */}
      {JUGGLE.map((j, i) => {
        const a = t * 1.25 + (i * Math.PI * 2) / JUGGLE.length;
        const x = 1440 + 400 * Math.cos(a), y = 520 + 330 * Math.sin(a) - 50 * Math.abs(Math.sin(a * 2 + t));
        const k = eb(P(t, 0.2 + i * 0.08, 0.5));
        return (
          <Abs key={i} x={x - 60} y={y - 60} style={{transform: `scale(${k}) rotate(${18 * Math.sin(a * 1.5)}deg)`, zIndex: Math.sin(a) > 0 ? 3 : 1}}>
            {j.id ? <ChannelChip id={j.id} size={120} /> : <IconChip name={j.icon!} size={120} c={j.c!} />}
            {j.n && <div style={{position: 'absolute', right: -14, top: -14, minWidth: 44, height: 44, padding: '0 8px', borderRadius: 99, background: 'linear-gradient(180deg, #FF7A59, #E5352B)', boxShadow: '0 4px 0 #A51F17, 0 8px 14px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={24} color="#fff">{j.n}</Tx></div>}
          </Abs>
        );
      })}
      <Sparkle x={1000} y={130} size={56} c={GOLD} />
      <Sparkle x={1860} y={990} size={44} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

const A2: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="globe" c={DEEP} title={TEXT.WhiteLabel.title} sub={TEXT.WhiteLabel.sub} maxW={1000} /></Abs>
      <Swing name="whitelabel" x={560} y={330} w={1180} />
      <Abs x={1440} y={250} style={{transform: `translateY(${bob(t, 0, 7)}px) rotate(2deg)`}}>
        <In at={0.8} s0={0.5} dx={120} dy={0}><Lift name="whitelabel" r={CROP.loginCard} s={1.05} glow /></In>
      </Abs>
      <Abs x={70} y={720} style={{transform: `translateY(${bob(t, 1, 6)}px) rotate(-2deg)`}}>
        <In at={1.1} s0={0.5} dx={-140} dy={0}><Lift name="whitelabel" r={CROP.domain} s={0.82} /></In>
      </Abs>
      <Sparkle x={1430} y={240} size={54} c={GOLD} ph={1} />
    </AbsoluteFill>
  );
};

const A3: React.FC = () => {
  const t = useSec();
  const ids = ['google', 'facebook', 'instagram', 'whatsapp'];
  const s = 1150 / 1920;
  return (
    <AbsoluteFill>
      <Abs x={110} y={70}><Feature icon="send" c={BLUE} title={TEXT.Channels.title} sub={TEXT.Channels.sub} maxW={980} /></Abs>
      <Swing name="channels" x={640} y={330} w={1150}>
        <Ring r={[329, 200, 370, 236]} s={s} at={0.7} />
      </Swing>
      {TEXT.Channels.items.map((label, i) => (
        <Abs key={i} x={70} y={380 + i * 150} style={{transform: `translateY(${bob(t, i, 5)}px)`, zIndex: 5}}>
          <In at={0.45 + i * 0.2} dx={-160} dy={0} s0={0.6}>
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

const CtaBlock: React.FC<{at?: number}> = ({at = 1.0}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
    <In at={at} dy={30}><CtaButton text={TEXT.End.cta} size={52} /></In>
    <In at={at + 0.35} dy={16} s0={1}><Tx size={36} color={SLATE} w={400}>{TEXT.Brand.site}</Tx></In>
  </div>
);

const A4: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      {(['dashboard', 'calendar'] as ShotName[]).map((n, i) => (
        <div key={n} style={{position: 'absolute', left: i ? 1500 : -560, top: 300 + bob(t, i, 10), perspective: 2000, opacity: 0.55 * eo(P(t, 0.2, 0.6))}}>
          <div style={{transform: `rotateY(${i ? -28 : 28}deg)`}}><Screen name={n} w={960} /></div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 240, top: 20, width: 1440, height: 480}}><LogoAnim /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 450, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
        <Words text={TEXT.Tagline.join(' ')} at={0.6} size={fit(TEXT.Tagline.join(' '), 76, 1250)} hi={[1, 3, 5]} step={0.1} center />
        <CtaBlock at={1.1} />
      </div>
      <Sparkle x={1500} y={760} size={60} c={GOLD} />
      <Sparkle x={420} y={820} size={46} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

// ============================ B · Your Brand, Live ============================
const TAB_IDS = ['google', 'facebook', 'instagram', 'whatsapp', 'sheets', 'invoice'];

const B1: React.FC = () => {
  const t = useSec();
  const kb = eo(P(t, 0.1, 0.7));
  const km = eo(P(t, 0.9, 0.8)); // tabs merge into one
  const bx = 340, by = 260, bw = 1240;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center'}}>
        <Words text={TEXT.Hook.headline} at={1.4} size={fit(TEXT.Hook.headline, 84, 1700)} hi={[1]} hiG={[DEEP, BLUE]} />
      </div>
      <div style={{position: 'absolute', left: bx, top: by + (1 - kb) * 200, opacity: kb, transform: `scale(${lerp(0.92, 1, kb)})`}}>
        <Browser name="dashboard" w={bw} url={TEXT.Brand.domain} tab={TEXT.Brand.agency} urlK={P(t, 1.3, 0.9)} />
      </div>
      {/* the cluttered tab strip flies into the single white-label tab */}
      {TEXT.Hook.tabs.map((label, i) => {
        const x0 = 70 + i * 300, y0 = 150 + 20 * Math.sin(t * 3 + i);
        const x1 = bx + 150, y1 = by + 8;
        const k = cl(km * 1.25 - i * 0.05);
        return (
          <Abs key={i} x={lerp(x0, x1, k)} y={lerp(y0, y1, k) - 60 * Math.sin(Math.PI * k)} style={{opacity: 1 - eo(cl((k - 0.7) / 0.3)), transform: `scale(${lerp(1, 0.4, k)}) rotate(${lerp((i % 2 ? 4 : -4), 0, k)}deg)`}}>
            <In at={0.05 + i * 0.07} s0={0.5} dy={-40}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px 10px 10px', borderRadius: '20px 20px 8px 8px', background: 'linear-gradient(180deg, #FFFFFF, #EAF2FF)', boxShadow: '0 6px 0 #C3D5F3, 0 18px 30px rgba(14,27,77,0.22)'}}>
                <ChannelChip id={TAB_IDS[i]} size={52} />
                <Tx size={fit(label, 26, 180)}>{label}</Tx>
              </div>
            </In>
          </Abs>
        );
      })}
      <Sparkle x={bx + 200} y={by + 20} size={70 * Math.sin(Math.PI * P(t, 1.6, 0.8))} c={GOLD} />
    </AbsoluteFill>
  );
};

const SWATCH: [string, number][] = [['#6F5DE8', 0], ['#1582D5', -40], ['#22A45D', -105], ['#F7941D', 175], ['#E5356F', 95]];

const BrandField: React.FC<{label: string; children?: React.ReactNode}> = ({label, children}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
    <Tx size={24} color={SLATE} w={400}>{label}</Tx>
    {children}
  </div>
);

const B2: React.FC = () => {
  const t = useSec();
  const pos = Math.min(3, Math.max(0, (t - 0.8) / 0.4)); // settles on orange
  const i0 = Math.floor(pos), i1 = Math.min(SWATCH.length - 1, i0 + 1);
  const hue = lerp(SWATCH[i0][1], SWATCH[i1][1], eo(pos - i0));
  const name = TEXT.Brand.agency.slice(0, Math.round(TEXT.Brand.agency.length * P(t, 0.4, 0.6)));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center'}}>
        <Words text={TEXT.WhiteLabel.title} at={0.15} size={fit(TEXT.WhiteLabel.title, 80, 1750)} hi={[1, 3, 5]} step={0.1} />
      </div>
      <Abs x={90} y={250} style={{transform: `translateY(${bob(t, 0, 5)}px)`}}>
        <In at={0.2} dx={-160} dy={0} s0={0.85}>
          <div style={{width: 560, padding: 40, boxSizing: 'border-box', borderRadius: 36, display: 'flex', flexDirection: 'column', gap: 30, background: 'linear-gradient(180deg, #FFFFFF, #EEF4FF)', boxShadow: `0 0 0 5px ${GOLD}, 0 12px 0 #C3D5F3, 0 40px 70px rgba(14,27,77,0.3)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <IconChip name="brush" size={74} c={ORANGE} />
              <Tx size={44}>{TEXT.WhiteLabel.kit}</Tx>
            </div>
            <BrandField label={TEXT.WhiteLabel.nameLabel}>
              <div style={{height: 70, borderRadius: 18, background: '#fff', boxShadow: 'inset 0 0 0 2px #D9E3F5', display: 'flex', alignItems: 'center', padding: '0 22px'}}>
                <Tx size={32} w={400}>{name}<span style={{color: BLUE, opacity: Math.sin(t * 12) > 0 && t < 1.2 ? 1 : 0}}>|</span></Tx>
              </div>
            </BrandField>
            <BrandField label={TEXT.WhiteLabel.colourLabel}>
              <div style={{display: 'flex', gap: 18}}>
                {SWATCH.map(([c], i) => {
                  const on = Math.max(0, 1 - Math.abs(pos - i));
                  return <div key={c} style={{width: 66, height: 66, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #fff8, ${c} 45%)`, boxShadow: `0 0 0 ${3 + 4 * on}px #fff, 0 0 0 ${5 + 6 * on}px ${on > 0.5 ? c : 'transparent'}, 0 8px 14px rgba(14,27,77,0.25)`, transform: `scale(${1 + 0.15 * on})`}} />;
                })}
              </div>
            </BrandField>
            <BrandField label={TEXT.WhiteLabel.domainLabel}>
              <div style={{height: 70, borderRadius: 18, background: '#fff', boxShadow: 'inset 0 0 0 2px #D9E3F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px 0 22px'}}>
                <Tx size={fit(TEXT.Brand.domain, 30, 300)} w={400}>{TEXT.Brand.domain}</Tx>
                <In at={1.6} s0={0.3} dy={0}>
                  <div style={{padding: '8px 18px', borderRadius: 99, background: 'linear-gradient(180deg, #4ADE80, #16A34A)', boxShadow: '0 4px 0 #0F7A36'}}><Tx size={22} color="#fff">{TEXT.WhiteLabel.verified}</Tx></div>
                </In>
              </div>
            </BrandField>
          </div>
        </In>
      </Abs>
      <div style={{position: 'absolute', left: 730, top: 260, perspective: 2400}}>
        <In at={0.1} dx={200} dy={0} s0={0.9}>
          <div style={{transform: 'rotateY(-7deg)', transformOrigin: '0% 50%'}}>
            <Browser name="clientDash" w={1100} url={TEXT.Brand.domain} tab={TEXT.Brand.agency} filter={`hue-rotate(${hue}deg)`} />
          </div>
        </In>
      </div>
      <Sparkle x={650} y={270} size={56} c={GOLD} />
    </AbsoluteFill>
  );
};

const B3: React.FC = () => {
  const t = useSec();
  const k = eo(P(t, 0, 1.1));
  const side: [ShotName, number, number][] = [['composer', -170, 26], ['rank', 1330, -26]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - k) * 600}px)`}}>
        {side.map(([n, x, ry]) => (
          <div key={n} style={{position: 'absolute', left: x, top: 230, perspective: 2000, opacity: 0.9}}>
            <div style={{transform: `rotateY(${ry}deg) scale(0.92)`}}><Browser name={n} w={760} url={TEXT.Brand.domain} tab={TEXT.Brand.agency} /></div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 430, top: 150 + bob(t, 0, 4)}}>
          <Browser name="calendar" w={1060} url={TEXT.Brand.domain} tab={TEXT.Brand.agency} />
        </div>
      </div>
      <Abs x={1240} y={170} style={{transform: `translateY(${bob(t, 1, 7)}px) rotate(3deg)`}}>
        <In at={1.0} s0={0.5} dy={60}><Lift name="calendar" r={CROP.dayCard} s={1.0} glow /></In>
      </Abs>
      <div style={{position: 'absolute', left: 0, right: 0, top: 870, display: 'flex', justifyContent: 'center'}}>
        <In at={0.7} dy={50} s0={0.8}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '16px 46px 16px 16px', borderRadius: 99, background: 'linear-gradient(180deg, #FFFFFF, #EAF2FF)', boxShadow: '0 10px 0 #C3D5F3, 0 30px 50px rgba(14,27,77,0.28)'}}>
            <IconChip name="cal" size={100} c={DEEP} round />
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <Tx size={fit(TEXT.Calendar.title, 56, 760)}>{TEXT.Calendar.title}</Tx>
              <Tx size={fit(TEXT.Calendar.sub, 30, 760)} color={SLATE} w={400}>{TEXT.Calendar.sub}</Tx>
            </div>
            <div style={{display: 'flex', gap: 10, marginLeft: 10}}>
              {['google', 'facebook', 'instagram', 'whatsapp'].map((id, i) => <In key={id} at={1.2 + i * 0.1} s0={0.2} dy={0}><ChannelChip id={id} size={60} /></In>)}
            </div>
          </div>
        </In>
      </div>
    </AbsoluteFill>
  );
};

const LINE_ICON: [Gl, string][] = [['brush', ORANGE], ['globe', DEEP], ['chart', BLUE]];

const B4: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 34}}>
        {TEXT.Tagline.map((line, i) => {
          const at = 0.15 + i * 0.55;
          const k = P(t, at, 0.4);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 40, opacity: cl(k * 3), transform: `scale(${lerp(1.5, 1, eb(k, 1.2))})`, filter: `blur(${(1 - eo(k)) * 10}px)`}}>
              <div style={{transform: `rotate(${(1 - eo(k)) * -30}deg) translateY(${bob(t, i, 5)}px)`}}><IconChip name={LINE_ICON[i][0]} size={130} c={LINE_ICON[i][1]} /></div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <Tx size={fit(line, 150, 1250)} g={i === 2 ? [ORANGE, GOLD] : [NAVY, DEEP]} style={i === 2 ? {filter: 'drop-shadow(0 6px 0 rgba(184,101,12,0.25))'} : undefined}>{line}</Tx>
                <div style={{width: `${100 * eo(P(t, at + 0.25, 0.4))}%`, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${GOLD}, ${ORANGE})`, opacity: i === 2 ? 1 : 0.5}} />
              </div>
            </div>
          );
        })}
      </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 920, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40}}>
        <In at={1.8} dy={30}><LogoImg w={360} /></In>
        <In at={2.0} dy={30} s0={1}><Tx size={36} color={SLATE} w={400}>{TEXT.Brand.site}</Tx></In>
      </div>
      <Sparkle x={1640} y={240} size={70} c={GOLD} />
      <Sparkle x={260} y={760} size={50} c={BLUE} ph={2} />
    </AbsoluteFill>
  );
};

const BBG: React.FC = () => <StudioBG />;

export const AgencyConcepts: React.FC<{concept?: Kind | 'c'}> = ({concept = 'a'}) => {
  const kind: Kind = concept === 'b' ? 'b' : 'a';
  const BG = kind === 'a' ? SkyBG : BBG;
  const items = kind === 'a' ? [A1, A2, A3, A4] : [B1, B2, B3, B4];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <BG />
      <Moments kind={kind} items={items} />
    </AbsoluteFill>
  );
};
