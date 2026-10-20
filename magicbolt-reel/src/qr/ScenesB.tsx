// MagicQR scenes 6–10: high rating → AI review → posted → ranking → who it's for → CTA
import {S6, S7, S8, S9, S10, S11, BRAND, DEMO, Q} from './config';
import {Abs, useT, P, eo, eb, eio, lerp, cl} from '../components/kit';
import {Card, Line, Sparkle, Stars, Stepper, Tap, Twinkle, Tx} from './kit';
import {AiBadge, AiPanel, Biz, BoltLogo, Cursor, GoogleWord, Phone, RateCard, ReviewCard, StandImg} from './objects';

// 6 · 4–5 stars → AI drafts the review
export const High = () => {
  const t = useT();
  const n = S6.stars * P(t, S6.starsAt, 0.7);
  const chip = P(t, S6.chipAt, 0.4);
  const writing = t >= S6.writingAt && t < S6.typeAt;
  const typed = t >= S6.typeAt ? P(t, S6.typeAt, S6.typeDur) : null;
  const ka = P(t, S6.writingAt, 0.5);
  return (
    <>
      <Stepper n={3} />
      <Line text={S6.l1[0]} at={S6.l1[1]} y={315} size={100} color={Q.green} />
      <Line text={S6.l2[0]} at={S6.l2[1]} y={415} size={62} />
      <Line text={S6.l3[0]} at={S6.l3[1]} y={505} size={80} color={Q.purple} mark={`${Q.yellow}99`} />
      <Abs x={540} y={1150} transform="scale(1.02)"><Phone><RateCard n={n} />{t >= S6.chipAt - 0.3 && <AiPanel chip={chip} writing={writing} typed={typed} />}</Phone></Abs>
      {ka > 0 && <Abs x={930} y={870 + 12 * Math.sin(t * 3)} transform={`scale(${eb(ka, 2.2)})`}><AiBadge size={210} spin={12 * Math.sin(t * 2.5)} /></Abs>}
      {ka > 0 && [[150, 980, 70, Q.yellow], [120, 1240, 50, Q.pink], [960, 1180, 60, Q.yellow]].map(([x, y, s, c], i) => (
        <Abs key={i} x={x as number} y={y as number} transform={`rotate(${t * 60 + i * 50}deg) scale(${0.6 + 0.5 * Math.sin(t * 5 + i * 2)})`}><Sparkle size={s as number} color={c as string} /></Abs>
      ))}
    </>
  );
};

// 7 · copy & post → the review is live
export const Post = () => {
  const t = useT();
  const kbtn = P(t, S7.btnAt, 0.4);
  const press = Math.sin(Math.PI * P(t, S7.tapAt, 0.25));
  const kc = P(t, S7.cardAt, 0.6);
  const kp = P(t, S7.posted[1], 0.4);
  return (
    <>
      <Stepper n={4} />
      <Line text={S7.l1[0]} at={S7.l1[1]} y={310} size={76} />
      <Line text={S7.l2[0]} at={S7.l2[1]} y={420} size={80} color={Q.blue} mark={`${Q.yellow}99`} />
      {kbtn > 0 && (
        <Abs x={540} y={640} transform={`scale(${eb(kbtn, 1.8) * (1 - 0.07 * press)})`} opacity={eo(kbtn)}>
          <div style={{padding: '32px 70px', borderRadius: 999, background: `linear-gradient(90deg, ${Q.blue}, #0D47A1)`, boxShadow: `0 24px 60px ${Q.blue}66`}}><Tx size={48} color="#fff">Copy &amp; Post on Google</Tx></div>
        </Abs>
      )}
      <Tap at={S7.tapAt} x={540} y={640} />
      <Twinkle at={S7.cardAt + 0.2} x={540} y={1080} r={560} n={18} />
      {kc > 0 && (
        <Abs x={540} y={1080 + 260 * (1 - eb(kc, 1.4))} opacity={eo(Math.min(1, kc * 2))} transform={`rotate(${lerp(8, -2, eo(kc))}deg)`}>
          <ReviewCard w={920} />
          {kp > 0 && (
            <div style={{position: 'absolute', right: -10, top: -44, transform: `rotate(8deg) scale(${eb(kp, 2.4)})`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 30px', borderRadius: 999, background: Q.green, boxShadow: `0 14px 40px ${Q.green}77`}}>
                <svg width={40} height={40} viewBox="0 0 60 60"><polyline points="12,31 25,44 49,17" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <Tx size={40} color="#fff">{S7.posted[0]}</Tx>
              </div>
            </div>
          )}
        </Abs>
      )}
    </>
  );
};

// 8 · your listing climbs the results
const ROW_H = 170;
export const Rank = () => {
  const t = useT();
  const ks = P(t, S8.searchAt, 0.5);
  const typed = DEMO.search.slice(0, Math.floor(DEMO.search.length * P(t, S8.searchAt + 0.2, 0.7)));
  const climb = eio(P(t, S8.climbAt, 1.3));
  const pos = 3 * (1 - climb); // your row: slot 3 → slot 0
  const top = climb >= 1;
  return (
    <>
      <Line text={S8.l1[0]} at={S8.l1[1]} y={310} size={80} />
      <Line text={S8.l2[0]} at={S8.l2[1]} y={425} size={92} color={Q.green} mark={`${Q.yellow}99`} />
      {ks > 0 && (
        <Abs x={540} y={610} opacity={eo(ks)} transform={`scale(${eb(ks, 1.5)})`}>
          <Card w={900} h={112} r={56} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '0 36px'}}>
            <svg width={48} height={48} viewBox="0 0 48 48"><circle cx="20" cy="20" r="14" fill="none" stroke={Q.blue} strokeWidth={5} /><path d="M31 31l12 12" stroke={Q.blue} strokeWidth={6} strokeLinecap="round" /></svg>
            <Tx size={38} w={400}>{typed}</Tx>
            <div style={{marginLeft: 'auto'}}><GoogleWord size={38} /></div>
          </Card>
        </Abs>
      )}
      {[0, 1, 2].map((i) => {
        const k = eo(P(t, S8.listAt + i * 0.1, 0.4));
        const slot = i + cl(i + 1 - pos); // pushed down one place as your listing passes
        return (
          <div key={i} style={{position: 'absolute', left: 90, top: 730 + slot * ROW_H, opacity: 0.75 * k}}>
            <Card w={900} h={146} r={32} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px'}}>
              <div style={{width: 84, height: 84, borderRadius: 22, background: Q.line}} />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}><div style={{height: 18, width: `${[62, 48, 55][i]}%`, borderRadius: 9, background: Q.line}} /><Stars n={[4, 4, 3][i]} size={30} /></div>
            </Card>
          </div>
        );
      })}
      {P(t, S8.listAt + 0.3, 0.4) > 0 && (
        <div style={{position: 'absolute', left: 70, top: 722 + pos * ROW_H, opacity: eo(P(t, S8.listAt + 0.3, 0.4)), transform: `scale(${1 + 0.03 * Math.sin(Math.PI * climb)})`}}>
          <Card w={940} h={162} r={36} border={top ? Q.green : Q.purple} style={{borderWidth: 5, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px', boxShadow: `0 24px 60px ${top ? Q.green : Q.purple}44`}}>
            <div style={{width: 96, height: 96, borderRadius: 26, background: `linear-gradient(135deg, ${Q.purple}, ${Q.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Sparkle size={60} color="#fff" /></div>
            <div style={{flex: 1}}><Tx size={42}>{S8.you}</Tx><br /><Stars n={5} size={38} /></div>
            <div style={{width: 110, height: 110, borderRadius: '50%', background: top ? Q.green : Q.purple, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={52} color="#fff">#{Math.round(pos) + 1}</Tx></div>
          </Card>
        </div>
      )}
      <Twinkle at={S8.climbAt + 1.3} x={540} y={800} r={520} />
    </>
  );
};

// 9 · who it's for
export const For = () => {
  const t = useT();
  return (
    <>
      <Line text={S9.heading[0]} at={S9.heading[1]} y={330} size={120} color={Q.purple} mark={`${Q.yellow}99`} />
      {S9.items.map((it, i) => {
        const k = P(t, it.at, 0.45);
        if (k <= 0) return null;
        return (
          <div key={it.label} style={{position: 'absolute', left: 70 + (i % 2) * 480, top: 480 + Math.floor(i / 2) * 210, opacity: eo(Math.min(1, k * 2)), transform: `scale(${eb(k, 2)}) rotate(${(1 - eo(k)) * (i % 2 ? 6 : -6)}deg)`}}>
            <Card w={460} h={180} r={40} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '0 28px'}}>
              <Biz icon={it.icon} size={116} color={it.color} />
              <Tx size={it.label.length > 9 ? 38 : 44}>{it.label}</Tx>
            </Card>
          </div>
        );
      })}
    </>
  );
};

// 10 · the product: standee + name
export const Product = () => {
  const t = useT();
  const ks = P(t, S10.standAt, 0.5);
  const kp = P(t, S10.productAt, 0.45);
  return (
    <>
      <Twinkle at={S10.standAt} x={540} y={620} r={560} n={18} />
      {ks > 0 && <Abs x={540} y={620 + 6 * Math.sin(t * 3)} transform={`scale(${eb(ks, 1.8)}) rotate(${-2 + 2 * Math.sin(t * 2)}deg)`} opacity={eo(ks)}><StandImg w={720} /></Abs>}
      <Line text={BRAND.name} at={S10.nameAt} y={1075} size={130} />
      {kp > 0 && (
        <Abs x={540} y={1235} transform={`scale(${eb(kp, 2)})`} opacity={eo(kp)}>
          <div style={{padding: '16px 60px', borderRadius: 999, background: `linear-gradient(90deg, ${Q.purple}, ${Q.pink})`, boxShadow: `0 24px 60px ${Q.pink}55`}}><Tx size={76} color="#fff">{BRAND.product}</Tx></div>
        </Abs>
      )}
      {t >= S10.starsAt && <Abs x={540} y={1395}><Stars n={5 * P(t, S10.starsAt, 0.7)} size={92} /></Abs>}
    </>
  );
};

// 11 · start your own white-label MagicQR business, with MagicBolt AI
const FAN: [number, number, number][] = [[300, 915, -13], [780, 915, 13], [540, 885, 0]];
export const Close = () => {
  const t = useT();
  const kw = P(t, S11.withAt, 0.4);
  const kl = P(t, S11.logoAt, 0.5);
  const kb = P(t, S11.btn[1], 0.5);
  const pulse = 1 + 0.035 * Math.sin((t - S11.btn[1]) * 6) * cl((t - S11.btn[1] - 0.5) * 3);
  const mk = eio(P(t, S11.clickAt - 0.6, 0.55));
  const press = Math.sin(Math.PI * P(t, S11.clickAt, 0.22));
  return (
    <>
      <Line text={S11.l1[0]} at={S11.l1[1]} y={300} size={80} />
      <Line text={S11.l2[0]} at={S11.l2[1]} y={440} size={150} color={Q.pink} mark={`${Q.yellow}99`} />
      <Line text={S11.l3[0]} at={S11.l3[1]} y={595} size={96} color={Q.purple} />
      {FAN.map(([x, y, r], i) => {
        const k = P(t, S11.l3[1] + 0.25 + i * 0.12, 0.5);
        return k > 0 ? <Abs key={i} x={x} y={y + 80 * (1 - eo(k)) + 6 * Math.sin(t * 2.5 + i)} transform={`rotate(${r}deg) scale(${eb(k, 1.6)})`} opacity={eo(k)}><StandImg w={i === 2 ? 400 : 330} /></Abs> : null;
      })}
      {kw > 0 && <Abs x={540} y={1150} opacity={eo(kw)}><Tx size={44} color={Q.slate}>with</Tx></Abs>}
      <Twinkle at={S11.logoAt} x={540} y={1255} r={460} />
      {kl > 0 && <Abs x={540} y={1255} transform={`scale(${eb(kl, 2)})`} opacity={eo(kl)}><BoltLogo size={84} /></Abs>}
      {kb > 0 && (
        <Abs x={540} y={1410} transform={`scale(${eb(kb, 2) * pulse * (1 - 0.06 * press)})`} opacity={eo(kb)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '24px 64px', borderRadius: 999, background: `linear-gradient(90deg, ${Q.pink}, ${Q.purple})`, boxShadow: `0 24px 60px ${Q.pink}66`}}>
            <Tx size={58} color="#fff">{S11.btn[0]}</Tx>
            <svg width={54} height={42} viewBox="0 0 76 60"><path d="M6 30h58M42 8l24 22-24 22" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </Abs>
      )}
      <Tap at={S11.clickAt} x={540} y={1410} color={Q.pink} />
      {t > S11.clickAt - 0.6 && <Cursor x={lerp(1000, 690, mk)} y={lerp(1700, 1420, mk)} press={press} />}
    </>
  );
};
