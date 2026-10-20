// MagicQR scenes 1–5: problem → meet → scan → low rating stays private
import {S1, S2, S3, S4, SR, S5, BRAND, Q} from './config';
import {Abs, useT, P, eo, eb, eio, lerp} from '../components/kit';
import {Card, Line, Se, Stars, Stepper, Tap, Twinkle, Tx} from './kit';
import {Face, FeedbackForm, GoogleWord, Heart, Lock, Phone, RateCard, StandImg} from './objects';

// 1 · happy customer, empty stars
export const Hook = () => {
  const t = useT();
  const kf = P(t, S1.faceAt, 0.5);
  const ks = P(t, S1.starsAt, 0.5);
  return (
    <>
      <Line text={S1.l1[0]} at={S1.l1[1]} y={330} size={88} />
      <Line text={S1.l2[0]} at={S1.l2[1]} y={455} size={88} />
      <Line text={S1.l3[0]} at={S1.l3[1]} y={585} size={100} color={Q.pink} mark={`${Q.yellow}99`} />
      {kf > 0 && <Abs x={540} y={920 + 10 * Math.sin(t * 3)} transform={`scale(${eb(kf, 2)}) rotate(${4 * Math.sin(t * 2)}deg)`}><Face size={330} /></Abs>}
      {kf > 0 && [[330, 800, 70, 0], [760, 760, 90, 1.2], [790, 1010, 56, 2.2]].map(([x, y, s, ph], i) => {
        const k = ((t - S1.faceAt) * 0.6 + ph / 3) % 1;
        return <Abs key={i} x={x} y={y - 120 * k} opacity={1 - k} transform={`scale(${0.6 + 0.6 * k})`}><Heart size={s} /></Abs>;
      })}
      {ks > 0 && (
        <Abs x={540} y={1250} transform={`scale(${eb(ks, 1.8)}) rotate(${1.5 * Math.sin(t * 14)}deg)`}>
          <Card r={40} style={{padding: '26px 40px'}}><Stars n={0} size={112} /></Card>
        </Abs>
      )}
      {ks > 0 && <Abs x={900} y={1130} transform={`rotate(14deg) scale(${eb(P(t, S1.starsAt + 0.3, 0.4), 2.4)})`}><Se size={170} color={Q.pink}>?</Se></Abs>}
    </>
  );
};

// 2 · the empty review box
export const Why = () => {
  const t = useT();
  const kb = P(t, S2.boxAt, 0.5);
  const kt = P(t, S2.thought[1], 0.45);
  const typed = 'Umm…'.slice(0, Math.max(0, Math.round(4 * Math.sin(Math.PI * P(t, 0.3, 1.3)))));
  const caret = Math.floor(t * 2.4) % 2 === 0;
  return (
    <>
      <Line text={S2.l1[0]} at={S2.l1[1]} y={330} size={84} />
      <Line text={S2.l2[0]} at={S2.l2[1]} y={455} size={100} color={Q.purple} mark={`${Q.yellow}99`} />
      {kb > 0 && (
        <Abs x={540} y={900 + 60 * (1 - eo(kb))} opacity={eo(kb)}>
          <Card w={900} h={470} r={44} style={{padding: '34px 38px', display: 'flex', flexDirection: 'column', gap: 20}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <div style={{width: 80, height: 80, borderRadius: '50%', background: Q.line}} />
              <Stars n={5} size={64} /><div style={{marginLeft: 'auto'}}><GoogleWord size={40} /></div>
            </div>
            <div style={{flex: 1, borderRadius: 22, border: `3px solid ${Q.blue}`, padding: '22px 26px'}}>
              <Tx size={36} color={typed ? Q.ink : Q.slate} w={400}>{typed || 'Share details of your experience…'}</Tx>
              {caret && <span style={{display: 'inline-block', width: 4, height: 44, background: Q.blue, marginLeft: 6, verticalAlign: 'middle'}} />}
            </div>
            <div style={{alignSelf: 'flex-end', padding: '14px 46px', borderRadius: 40, background: Q.line}}><Tx size={30} color={Q.slate}>Post</Tx></div>
          </Card>
        </Abs>
      )}
      {kt > 0 && (<>
        {[[640, 1190, 22], [690, 1240, 32]].map(([x, y, s], i) => <Abs key={i} x={x} y={y} transform={`scale(${eb(P(t, S2.thought[1] + i * 0.08, 0.3), 2)})`}><div style={{width: s, height: s, borderRadius: '50%', background: '#fff', border: `3px solid ${Q.purple}`}} /></Abs>)}
        <Abs x={790} y={1340 + 8 * Math.sin(t * 3)} transform={`rotate(4deg) scale(${eb(kt, 2.2)})`}>
          <Card r={60} border={Q.purple} style={{padding: '24px 46px', borderWidth: 4}}><Se size={66} color={Q.purple}>{S2.thought[0]}</Se></Card>
        </Abs>
      </>)}
    </>
  );
};

// 3 · title card: "How Magic QR Works"
export const Title = () => {
  const t = useT();
  const kl = P(t, S3.standAt, 0.6);
  const kp = P(t, S3.productAt, 0.5);
  return (
    <>
      <Twinkle at={S3.standAt} x={540} y={500} r={520} n={18} />
      {kl > 0 && <Abs x={540} y={500 + 6 * Math.sin(t * 3)} transform={`scale(${eb(kl, 1.8)}) rotate(${(1 - eo(kl)) * -8 - 2}deg)`} opacity={eo(kl)}><StandImg w={580} /></Abs>}
      <Line text={S3.l1[0]} at={S3.l1[1]} y={860} size={124} />
      <Line text={S3.l2[0]} at={S3.l2[1]} y={1020} size={170} color={Q.pink} mark={`${Q.yellow}99`} />
      {kp > 0 && (
        <Abs x={540} y={1250} transform={`scale(${eb(kp, 2)})`} opacity={eo(kp)}>
          <div style={{padding: '16px 56px', borderRadius: 999, background: `linear-gradient(90deg, ${Q.purple}, ${Q.pink})`, boxShadow: `0 24px 60px ${Q.pink}55`}}><Tx size={60} color="#fff">{BRAND.product}</Tx></div>
        </Abs>
      )}
    </>
  );
};

// Step 2 · customer taps a star rating
export const Rate = () => {
  const t = useT();
  const n = Array.from({length: SR.stars}, (_, i) => P(t, SR.tapsAt + i * SR.tapGap, 0.25)).reduce((a, b) => a + b, 0);
  return (
    <>
      <Stepper n={2} />
      <Line text={SR.l1[0]} at={SR.l1[1]} y={320} size={88} />
      <Line text={SR.l2[0]} at={SR.l2[1]} y={445} size={104} color={Q.pink} mark={`${Q.yellow}99`} />
      <Abs x={540} y={1190} transform="scale(1.12)"><Phone><RateCard n={n} /></Phone></Abs>
      {Array.from({length: SR.stars}, (_, i) => <Tap key={i} at={SR.tapsAt + i * SR.tapGap} x={393 + i * 73.5} y={1010} color={Q.pink} />)}
    </>
  );
};

// 4 · customer scans the QR stand
export const Scan = () => {
  const t = useT();
  const ks = P(t, S4.standAt, 0.5);
  const scanning = t >= S4.scanAt && t < S4.doneAt;
  const sweep = ((t - S4.scanAt) * 1.6) % 1;
  const kd = P(t, S4.doneAt, 0.4);
  const kp = eo(P(t, S4.phoneAt, 0.6));
  const [qx, qy, qs] = [536, 1130, 300]; // QR centre on the standee photo + scan frame size
  return (
    <>
      <Stepper n={1} />
      <Line text={S4.l1[0]} at={S4.l1[1]} y={320} size={88} />
      <Line text={S4.l2[0]} at={S4.l2[1]} y={445} size={104} color={Q.pink} mark={`${Q.yellow}99`} />
      {ks > 0 && <Abs x={lerp(540, 380, kp)} y={980 + 80 * (1 - eo(ks))} opacity={eo(ks)} transform={`rotate(${lerp(0, -5, kp)}deg) scale(${lerp(1, 0.86, kp)})`}><StandImg w={760} /></Abs>}
      {t >= S4.scanAt && kp <= 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => (
            <path key={i} d={`M${qx + sx * qs / 2} ${qy + sy * (qs / 2 - 70)}V${qy + sy * qs / 2}H${qx + sx * (qs / 2 - 70)}`} fill="none" stroke={kd > 0 ? Q.green : Q.pink} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {scanning && <rect x={qx - qs / 2 + 10} y={qy - qs / 2 + qs * sweep} width={qs - 20} height={10} rx={5} fill={Q.pink} opacity={0.9} />}
        </svg>
      )}
      {kd > 0 && kp < 1 && (
        <Abs x={qx} y={qy} transform={`scale(${eb(kd, 2.4)})`} opacity={1 - kp}>
          <div style={{width: 170, height: 170, borderRadius: '50%', background: Q.green, border: '10px solid #fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${Q.green}`}}>
            <svg width={90} height={90} viewBox="0 0 60 60"><polyline points="14,31 26,43 47,19" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </Abs>
      )}
      {kp > 0 && <Abs x={lerp(1300, 760, kp)} y={1170} transform={`rotate(${lerp(20, 7, kp)}deg) scale(0.74)`}><Phone><RateCard n={0} /></Phone></Abs>}
    </>
  );
};

// 5 · 1–3 stars → private feedback, never on Google
export const Low = () => {
  const t = useT();
  const n = S5.stars * P(t, S5.starsAt, 0.7);
  const form = t >= S5.formAt;
  const fly = eio(P(t, S5.flyAt, 0.7));
  const ki = P(t, S5.flyAt - 0.3, 0.5);
  const landed = fly >= 1;
  const kb = P(t, S5.blocked[1], 0.45);
  return (
    <>
      <Stepper n={3} />
      <Line text={S5.l1[0]} at={S5.l1[1]} y={320} size={104} color={Q.red} />
      <Line text={S5.l2[0]} at={S5.l2[1]} y={440} size={62} color={Q.purple} mark={`${Q.yellow}99`} />
      <Abs x={320} y={1090} transform="scale(0.9)"><Phone><RateCard n={n} />{form && <FeedbackForm k={P(t, S5.formAt + 0.2, 0.9)} />}</Phone></Abs>
      {ki > 0 && (
        <Abs x={810} y={840} transform={`scale(${eb(ki, 1.8) * (landed ? 1 + 0.08 * Math.sin(Math.PI * P(t, S5.flyAt + 0.7, 0.3)) : 1)})`} opacity={eo(ki)}>
          <Card w={400} h={330} r={40} border={Q.purple} style={{borderWidth: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, position: 'relative'}}>
            <Lock size={120} color={Q.purple} />
            <Tx size={34} color={Q.purple}>{S5.inbox}</Tx>
            <Tx size={22} color={Q.slate} w={400}>Only you can see it</Tx>
            {landed && <div style={{position: 'absolute', right: -18, top: -18, width: 70, height: 70, borderRadius: '50%', background: Q.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${eb(P(t, S5.flyAt + 0.7, 0.35), 2.6)})`}}><Tx size={36} color="#fff">1</Tx></div>}
          </Card>
        </Abs>
      )}
      {fly > 0 && !landed && (
        <Abs x={lerp(320, 810, fly)} y={lerp(1250, 840, fly) - 160 * Math.sin(Math.PI * fly)} transform={`rotate(${fly * 14}deg) scale(${lerp(1, 0.5, fly)})`}>
          <Card w={330} h={150} r={24} style={{padding: 20, display: 'flex', flexDirection: 'column', gap: 12}}>
            <Stars n={S5.stars} size={34} />
            <div style={{height: 12, width: '90%', borderRadius: 6, background: Q.line}} /><div style={{height: 12, width: '60%', borderRadius: 6, background: Q.line}} />
          </Card>
        </Abs>
      )}
      {kb > 0 && (
        <Abs x={810} y={1240} transform={`rotate(-4deg) scale(${lerp(1.8, 1, eo(kb))})`} opacity={eo(Math.min(1, kb * 2))}>
          <Card w={420} r={34} border={Q.red} style={{borderWidth: 5, padding: '22px 10px', textAlign: 'center'}}>
            <Tx size={32} color={Q.red}>Not published</Tx><br />
            <Tx size={32} color={Q.red}>on</Tx> <GoogleWord size={38} />
          </Card>
        </Abs>
      )}
    </>
  );
};
