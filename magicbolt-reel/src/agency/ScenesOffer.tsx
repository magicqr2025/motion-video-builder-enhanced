// Scenes 9–12: the offer and CTA
import {BRAND, S9, S10, S11, S12, T} from './config';
import {Abs, Pop, Txt, useT, P, eo, eb, cl} from '../components/kit';
import {Box, Burst, Confetti, Dots, Logo, Mark, Shake, Swipe, Tick} from './ui';

// 9 · dashed offer box
export const Offer = () => {
  const t = useT();
  const kb = P(t, S9.boxAt, 0.5);
  const [w, h] = [900, 620];
  return (
    <Shake cues={S9.terms.map(([, at]) => at + 0.1)} amp={9}>
      <Pop at={S9.heading[1]} x={540} y={390}><Txt size={80}>{S9.heading[0]}</Txt></Pop>
      {kb > 0 && (
        <div style={{position: 'absolute', left: 90, top: 540, width: w, height: h, opacity: eo(kb), transform: `scale(${eb(kb, 1.4)})`}}>
          <Dots color={T.violet} gap={18} r={5} style={{left: 26, top: 26, width: w, height: h, borderRadius: 48}} />
          <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
            <rect x={5} y={5} width={w - 10} height={h - 10} rx={46} fill="#fff" stroke={T.ink} strokeWidth={8} strokeDasharray="30 20" strokeLinecap="round" strokeDashoffset={-t * 40} />
          </svg>
          <div style={{position: 'absolute', left: -30, top: -44, transform: `rotate(-8deg) scale(${eb(P(t, S9.boxAt + 0.2, 0.4), 2.4)})`}}><Mark size={46} bg={T.pink} color="#fff" rot={0}>OFFER</Mark></div>
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 56, paddingLeft: 76}}>
            {S9.terms.map(([s, at]) => {
              const k = P(t, at, 0.45);
              return (
                <div key={s} style={{display: 'flex', alignItems: 'center', gap: 30, opacity: eo(Math.min(1, k * 2)), transform: `translateX(${(1 - eo(k)) * -80}px)`}}>
                  <div style={{transform: `scale(${k > 0 ? eb(k, 2.5) : 0})`}}><Tick size={84} /></div>
                  <Txt size={70}>{s}</Txt>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Shake>
  );
};

// 10 · free-trial calendar (counts up if S10.days is set)
export const Trial = () => {
  const t = useT();
  const kc = P(t, S10.calAt, 0.5);
  const counting = S10.days > 0;
  const prog = P(t, S10.calAt + 0.2, S10.countDur) * S10.days;
  const day = Math.max(1, Math.min(S10.days, Math.ceil(prog)));
  const flip = !counting || day >= S10.days ? 1 : prog % 1;
  const kt = P(t, S10.calAt + 0.35, 0.45);
  return (
    <>
      {kc > 0 && <Abs x={540} y={650} opacity={0.7 * eo(kc)}><Burst size={1000} color={`${T.violet}55`} speed={10} /></Abs>}
      {kc > 0 && (
        <Abs x={540} y={650 + 60 * (1 - eo(kc))} opacity={eo(kc)} transform={`rotate(${-3 + 1.5 * Math.sin(t * 2.5)}deg) scale(${eb(kc, 1.6)})`}>
          <div style={{position: 'relative'}}>
            <Dots color={T.violet} gap={18} r={5} style={{left: 26, top: 26, width: 560, height: 540, borderRadius: 48}} />
            <Box w={560} h={540} r={48} sh={0} style={{position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              <div style={{height: 130, flexShrink: 0, background: T.violet, borderBottom: `5px solid ${T.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Txt size={50} color="#fff" style={{letterSpacing: 4}}>FREE TRIAL</Txt>
              </div>
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - eo(flip)) * -30}px)`, opacity: 0.4 + 0.6 * eo(flip)}}>
                {counting ? <Txt size={300} style={{lineHeight: 1}}>{day}</Txt> : <div style={{transform: `scale(${kt > 0 ? eb(kt, 2.4) : 0})`}}><Tick size={250} /></div>}
              </div>
            </Box>
            {[150, 410].map((x) => <div key={x} style={{position: 'absolute', left: x - 13, top: -34, width: 26, height: 76, borderRadius: 13, background: T.ink}} />)}
          </div>
        </Abs>
      )}
      {counting
        ? <Swipe at={S10.badgeAt} x={540} y={1080} size={100} rot={2}>{S10.days} {S10.daysBadge}</Swipe>
        : <Swipe at={S10.badgeAt} x={540} y={1080} size={66} rot={2}>{S10.badge}</Swipe>}
      <Pop at={S10.l1[1]} x={540} y={1270}><Txt size={70}>{S10.l1[0]}</Txt></Pop>
      <Pop at={S10.l2[1]} x={540} y={1365}><Txt size={70} color={T.violet}>{S10.l2[0]}</Txt></Pop>
    </>
  );
};

// 11 · "Risk? Zero." (plays on a violet full-bleed background)
export const Risk = () => {
  const t = useT();
  const kc = P(t, S11.circleAt, 0.5);
  const kz = P(t, S11.zeroAt, 0.45);
  return (
    <Shake cues={[S11.zeroAt + 0.1]} amp={26}>
      <Pop at={S11.q[1]} x={540} y={400} rise={60}><Txt size={160} color="#fff">{S11.q[0]}</Txt></Pop>
      {kz > 0 && <Abs x={540} y={890} opacity={eo(kz)} transform={`scale(${eb(kz, 1.6)})`}><Burst size={1300} color="rgba(255,255,255,0.22)" speed={30} /></Abs>}
      {kc > 0 && (
        <Abs x={540} y={890} transform={`scale(${eb(kc, 1.6)})`} opacity={eo(kc)}>
          <div style={{position: 'relative', width: 580, height: 580}}>
            <Dots color={T.ink} gap={18} r={5} style={{left: 30, top: 30, width: 580, height: 580, borderRadius: '50%'}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: T.yellow, border: `10px solid ${T.ink}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{transform: `scale(${kz > 0 ? eb(kz, 2.4) : 0})`}}><Txt size={430} style={{lineHeight: 1}}>0</Txt></div>
            </div>
          </div>
        </Abs>
      )}
      <Confetti at={S11.zeroAt} x={540} y={890} r={520} />
      <Swipe at={S11.a[1]} x={540} y={1350} size={120} rot={-3}>{S11.a[0]}</Swipe>
    </Shake>
  );
};

// 12 · CTA
export const Cta = () => {
  const t = useT();
  const kl = P(t, S12.logoAt, 0.5);
  const ku = P(t, S12.urlAt, 0.5);
  const pulse = 1 + 0.03 * Math.sin((t - S12.urlAt) * 6) * cl((t - S12.urlAt - 0.5) * 3);
  return (
    <Shake cues={[S12.logoAt + 0.1]} amp={14}>
      <Pop at={S12.l1[1]} x={540} y={370}><Txt size={86}>{S12.l1[0]}</Txt></Pop>
      <Swipe at={S12.big[1]} x={540} y={530} size={76} rot={-2}>{S12.big[0]}</Swipe>
      <Pop at={S12.l3[1]} x={540} y={690}><Txt size={86}>{S12.l3[0]}</Txt></Pop>
      <Pop at={S12.withAt} x={540} y={870}><Txt size={46} color={T.slate}>with</Txt></Pop>
      {kl > 0 && <Abs x={540} y={1000} opacity={0.6 * eo(kl)} transform={`scale(${eb(kl, 1.6)})`}><Burst size={900} /></Abs>}
      <Confetti at={S12.logoAt} x={540} y={1000} />
      {kl > 0 && <Abs x={540} y={1000} transform={`scale(${eb(kl, 2)})`} opacity={eo(kl)}><Logo size={88} /></Abs>}
      {ku > 0 && (
        <Abs x={540} y={1210} transform={`scale(${eb(ku, 2) * pulse})`} opacity={eo(ku)}>
          <Box r={999} sh={12} bg={T.violet} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '26px 54px'}}>
            <Txt size={56} color="#fff">{BRAND.url}</Txt>
            <svg width={60} height={48} viewBox="0 0 76 60" style={{transform: `translateX(${6 * Math.sin(t * 7)}px)`}}>
              <path d="M6 30h58M42 8l24 22-24 22" stroke={T.yellow} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        </Abs>
      )}
    </Shake>
  );
};
