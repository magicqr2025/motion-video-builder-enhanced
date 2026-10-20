// Ads-vs-reviews scenes 7–12: scan → AI SEO review → 1 tap, live → ads stop, reviews don't → order → tagline
import React from 'react';
import {Img, staticFile} from 'remotion';
import {S7, S8, S9, S10, S11, S12, ASSETS, DEMO, Q} from './config';
import {BRAND} from '../qr/config';
import {Abs, useT, P, eo, eb, eio, lerp, cl} from '../components/kit';
import {Card, Line, Sparkle, Stars, Stepper, Tap, Twinkle, Tx} from '../qr/kit';
import {AiBadge, Cursor, GoogleWord, Phone, RateCard, StandImg} from '../qr/objects';
import {AdTile, Chart, Gloss, Person, Toggle} from './objects';

const MARK = `${Q.yellow}99`;

// ---------- the AI's SEO review: first `chars` characters, keyword highlighted ----------
const SeoReview: React.FC<{chars: number; size: number}> = ({chars, size}) => {
  const full = DEMO.review, k = DEMO.keyword.length; // review starts with the keyword
  const st: React.CSSProperties = {whiteSpace: 'normal', display: 'inline', lineHeight: 1.45};
  return (<>
    <Tx size={size} style={{...st, background: `${Q.yellow}88`, borderRadius: 6}}>{full.slice(0, Math.min(k, chars))}</Tx>
    <Tx size={size} w={400} style={st}>{full.slice(k, Math.max(k, chars))}</Tx>
  </>);
};

// ---------- AI suggestion panel inside the phone (typed: share of the review shown) ----------
const AiSuggest: React.FC<{writing?: boolean; typed: number; press?: number}> = ({writing, typed, press = 0}) => {
  const t = useT();
  const caret = typed < 1 && Math.floor(t * 2.6) % 2 === 0;
  return (
    <div style={{margin: '0 22px 18px', borderRadius: 26, background: '#fff', boxShadow: '0 10px 30px rgba(79,66,154,0.12)', padding: '22px 22px 24px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <Sparkle size={30} color={Q.purple} /><Tx size={22} color={Q.purple}>AI SEO review</Tx>
      </div>
      <div style={{marginTop: 14, borderRadius: 18, border: `2px solid ${Q.purple}55`, background: '#F7F4FF', padding: '16px 18px', minHeight: 180, textAlign: 'left', boxSizing: 'border-box'}}>
        {writing ? (
          <div style={{display: 'flex', gap: 10, padding: '55px 0', justifyContent: 'center'}}>{[0, 1, 2, 3].map((i) => <div key={i} style={{width: 14, height: 14, borderRadius: '50%', background: Q.purple, transform: `translateY(${-8 * Math.max(0, Math.sin(t * 9 - i * 0.8))}px)`}} />)}</div>
        ) : (<>
          <SeoReview chars={Math.floor(DEMO.review.length * typed)} size={21} />
          {caret && <span style={{display: 'inline-block', width: 3, height: 26, background: Q.purple, marginLeft: 3, verticalAlign: 'middle'}} />}
        </>)}
      </div>
      <div style={{height: 62, borderRadius: 31, background: `linear-gradient(90deg, ${Q.blue}, #0D47A1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16, transform: `scale(${1 - 0.06 * press})`}}>
        <Tx size={20} color="#fff">Post on Google</Tx>
      </div>
    </div>
  );
};

// Step 1 · customer scans the QR standee
export const Scan = () => {
  const t = useT();
  const ks = P(t, 0, 0.5);
  const scanning = t >= S7.scanAt && t < S7.doneAt;
  const sweep = ((t - S7.scanAt) * 1.6) % 1;
  const kd = P(t, S7.doneAt, 0.4);
  const [qx, qy, qs] = [536, 1150, 300]; // QR centre on the standee photo at w=760 + scan frame size
  return (
    <>
      <Stepper n={1} total={3} />
      <Line text={S7.l1[0]} at={S7.l1[1]} y={320} size={90} />
      <Line text={S7.l2[0]} at={S7.l2[1]} y={445} size={106} color={Q.pink} mark={MARK} />
      <Abs x={540} y={1000 + 80 * (1 - eo(ks))} opacity={eo(ks)}><StandImg w={760} /></Abs>
      {t >= S7.scanAt && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => (
            <path key={i} d={`M${qx + sx * qs / 2} ${qy + sy * (qs / 2 - 70)}V${qy + sy * qs / 2}H${qx + sx * (qs / 2 - 70)}`} fill="none" stroke={kd > 0 ? Q.green : Q.pink} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {scanning && <rect x={qx - qs / 2 + 10} y={qy - qs / 2 + qs * sweep} width={qs - 20} height={10} rx={5} fill={Q.pink} opacity={0.9} />}
        </svg>
      )}
      {kd > 0 && (
        <Abs x={qx} y={qy} transform={`scale(${eb(kd, 2.4)})`}>
          <div style={{width: 170, height: 170, borderRadius: '50%', background: Q.green, border: '10px solid #fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${Q.green}`}}>
            <svg width={90} height={90} viewBox="0 0 60 60"><polyline points="14,31 26,43 47,19" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </Abs>
      )}
      <Twinkle at={S7.doneAt} x={qx} y={qy} r={420} />
    </>
  );
};

// Step 2 · AI suggests an SEO-friendly review
export const Suggest = () => {
  const t = useT();
  const kr = P(t, S8.robotAt, 0.5);
  const ka = P(t, S8.writingAt, 0.5);
  const typed = P(t, S8.typeAt, S8.typeDur);
  return (
    <>
      <Stepper n={2} total={3} />
      <Line text={S8.l1[0]} at={S8.l1[1]} y={320} size={100} color={Q.purple} />
      <Line text={S8.l2[0]} at={S8.l2[1]} y={445} size={100} mark={MARK} />
      <Abs x={650} y={1130 + 40 * (1 - eo(P(t, 0, 0.5)))} transform="scale(0.84)" opacity={eo(P(t, 0, 0.4))}>
        <Phone name={DEMO.name} address={DEMO.address}><RateCard n={5} /><AiSuggest writing={t < S8.typeAt} typed={typed} /></Phone>
      </Abs>
      {kr > 0 && (
        <Abs x={215} y={790 + 10 * Math.sin(t * 2.6)} transform={`rotate(${-7 + 2 * Math.sin(t * 2)}deg) scale(${eb(kr, 1.8)})`} opacity={eo(kr)}>
          <div style={{width: 330, height: 330, borderRadius: 48, overflow: 'hidden', border: '8px solid #fff', boxShadow: '0 30px 60px rgba(79,66,154,0.3)'}}>
            <Img src={staticFile(ASSETS.robot)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </Abs>
      )}
      {ka > 0 && <Abs x={950} y={700 + 12 * Math.sin(t * 3)} transform={`scale(${eb(ka, 2.2)})`}><AiBadge size={190} spin={12 * Math.sin(t * 2.5)} /></Abs>}
      {ka > 0 && [[150, 1080, 70, Q.yellow], [120, 1330, 50, Q.pink], [990, 1050, 60, Q.yellow]].map(([x, y, s, c], i) => (
        <Abs key={i} x={x as number} y={y as number} transform={`rotate(${t * 60 + i * 50}deg) scale(${0.6 + 0.5 * Math.sin(t * 5 + i * 2)})`}><Sparkle size={s as number} color={c as string} /></Abs>
      ))}
    </>
  );
};

// Step 3 · one tap and the review is live on Google
export const OneTap = () => {
  const t = useT();
  const press = Math.sin(Math.PI * P(t, S9.tapAt, 0.25));
  const gone = eio(P(t, S9.cardAt, 0.5));
  const kc = P(t, S9.cardAt + 0.1, 0.6);
  const kl = P(t, S9.liveAt, 0.4);
  const mk = eio(P(t, S9.tapAt - 0.55, 0.5));
  const [bx, by] = [540, 1262]; // the phone's "Post on Google" button
  return (
    <>
      <Stepper n={3} total={3} />
      <Line text={S9.l1[0]} at={S9.l1[1]} y={320} size={100} />
      <Line text={S9.l2[0]} at={S9.l2[1]} y={445} size={104} color={Q.blue} mark={MARK} />
      {gone < 1 && (
        <Abs x={540} y={1130 + 600 * gone} transform={`scale(${0.84 * (1 - 0.15 * gone)})`} opacity={1 - gone}>
          <Phone name={DEMO.name} address={DEMO.address}><RateCard n={5} /><AiSuggest typed={1} press={press} /></Phone>
        </Abs>
      )}
      <Tap at={S9.tapAt} x={bx} y={by} />
      {t > S9.tapAt - 0.55 && gone < 1 && <Cursor x={lerp(930, bx, mk)} y={lerp(1700, by, mk)} press={press} />}
      <Twinkle at={S9.cardAt + 0.3} x={540} y={980} r={560} n={18} />
      {kc > 0 && (
        <Abs x={540} y={1000 + 260 * (1 - eb(kc, 1.4))} opacity={eo(Math.min(1, kc * 2))} transform={`rotate(${lerp(8, -2, eo(kc))}deg)`}>
          <Card w={930} r={40} style={{padding: '36px 40px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <Person size={96} color={Q.pink} />
              <div style={{flex: 1}}><Tx size={36}>{DEMO.reviewer}</Tx><br /><Stars n={5} size={44} /></div>
              <GoogleWord size={42} />
            </div>
            <div style={{marginTop: 22}}><SeoReview chars={DEMO.review.length} size={33} /></div>
          </Card>
          {kl > 0 && (
            <div style={{position: 'absolute', right: -10, top: -48, transform: `rotate(8deg) scale(${eb(kl, 2.4)})`}}>
              <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 30px', borderRadius: 999, background: `linear-gradient(180deg, #34D27A, ${Q.green})`, boxShadow: `0 14px 40px ${Q.green}77`, overflow: 'hidden'}}>
                <div style={{width: 22, height: 22, borderRadius: '50%', background: '#fff', opacity: 0.6 + 0.4 * Math.sin(t * 10)}} />
                <Tx size={40} color="#fff">Live on Google</Tx><Gloss />
              </div>
            </div>
          )}
        </Abs>
      )}
    </>
  );
};

// 10 · ads off → customers off; reviews keep working
const fAds = (x: number) => (x < 0.4 ? 0.72 + 0.07 * Math.sin(x * 34) : 0.04 + 0.68 * (1 - eo(cl((x - 0.4) / 0.2))));
const fRev = (x: number) => 0.1 + 0.78 * x + 0.04 * Math.sin(x * 22);
const Panel: React.FC<{icon: React.ReactNode; label: string; right?: React.ReactNode; value: number; color: string; f: (x: number) => number; p: number}> = ({icon, label, right, value, color, f, p}) => (
  <Card w={940} h={340} r={44} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '0 40px'}}>
    <div style={{width: 280, display: 'flex', flexDirection: 'column', gap: 14}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>{icon}<Tx size={44}>{label}</Tx></div>
      {right}
      <div><Tx size={26} color={Q.slate} w={400}>Customers</Tx><br /><Tx size={64} color={color}>{value}</Tx></div>
    </div>
    <Chart f={f} p={p} w={540} h={220} color={color} />
  </Card>
);
export const Compare = () => {
  const t = useT();
  const ka = P(t, S10.adsAt, 0.45);
  const pa = P(t, S10.adsAt + 0.15, 1.3);
  const on = 1 - eo(P(pa, 0.36, 0.06));
  const kr = P(t, S10.revAt, 0.45);
  const pr = P(t, S10.revAt + 0.15, 1.8);
  return (
    <>
      <Line text={S10.l1[0]} at={S10.l1[1]} y={300} size={96} />
      <Line text={S10.l2[0]} at={S10.l2[1]} y={420} size={100} color={Q.red} mark={MARK} />
      {ka > 0 && (
        <Abs x={540} y={705 + 60 * (1 - eo(ka))} opacity={eo(ka) * (pa >= 1 ? 0.75 : 1)} transform={`scale(${eb(ka, 1.5)})`}>
          <Panel icon={<AdTile size={84} />} label="Ads" right={<Toggle on={on} />} value={Math.round(240 * fAds(pa) / 0.79)} color={Q.red} f={fAds} p={pa} />
        </Abs>
      )}
      <Line text={S10.l3[0]} at={S10.l3[1]} y={985} size={56} color={Q.green} mark={MARK} sans />
      {kr > 0 && (
        <Abs x={540} y={1265 + 60 * (1 - eo(kr))} opacity={eo(kr)} transform={`scale(${eb(kr, 1.5)})`}>
          <Panel
            icon={<div style={{position: 'relative', width: 84, height: 84, borderRadius: 24, background: `linear-gradient(145deg, ${Q.yellow}, #F59E0B)`, boxShadow: `0 12px 28px ${Q.yellow}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}><Stars n={1} size={54} /><Gloss /></div>}
            label="Reviews"
            right={<div style={{alignSelf: 'flex-start', padding: '6px 20px', borderRadius: 999, background: `${Q.green}22`, border: `3px solid ${Q.green}`}}><Tx size={28} color={Q.green}>24×7 ON</Tx></div>}
            value={Math.round(260 * fRev(pr) * pr)} color={Q.green} f={fRev} p={pr}
          />
        </Abs>
      )}
    </>
  );
};

// 11 · order the MagicQR Review Booster
export const Order = () => {
  const t = useT();
  const ks = P(t, S11.standAt, 0.5);
  const kp = P(t, S11.productAt, 0.45);
  const kb = P(t, S11.btn[1], 0.5);
  const pulse = 1 + 0.035 * Math.sin((t - S11.btn[1]) * 6) * cl((t - S11.btn[1] - 0.5) * 3);
  const mk = eio(P(t, S11.clickAt - 0.55, 0.5));
  const press = Math.sin(Math.PI * P(t, S11.clickAt, 0.22));
  return (
    <>
      <Twinkle at={S11.standAt} x={540} y={600} r={560} n={18} />
      {ks > 0 && <Abs x={540} y={600 + 6 * Math.sin(t * 3)} transform={`scale(${eb(ks, 1.8)}) rotate(${-2 + 2 * Math.sin(t * 2)}deg)`} opacity={eo(ks)}><StandImg w={660} /></Abs>}
      <Line text={BRAND.name} at={S11.nameAt} y={1010} size={128} />
      {kp > 0 && (
        <Abs x={540} y={1165} transform={`scale(${eb(kp, 2)})`} opacity={eo(kp)}>
          <div style={{position: 'relative', padding: '16px 60px', borderRadius: 999, background: `linear-gradient(90deg, ${Q.purple}, ${Q.pink})`, boxShadow: `0 24px 60px ${Q.pink}55`, overflow: 'hidden'}}><Tx size={74} color="#fff">{BRAND.product}</Tx><Gloss /></div>
        </Abs>
      )}
      {kb > 0 && (
        <Abs x={540} y={1350} transform={`scale(${eb(kb, 2) * pulse * (1 - 0.06 * press)})`} opacity={eo(kb)}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 22, padding: '24px 64px', borderRadius: 999, background: `linear-gradient(180deg, #FFD15C, ${Q.yellow})`, boxShadow: `0 24px 60px ${Q.yellow}99`, overflow: 'hidden'}}>
            <svg width={58} height={54} viewBox="0 0 64 60"><path d="M4 6h10l8 34h32l6-24H18" fill="none" stroke={Q.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /><circle cx="26" cy="52" r="5" fill={Q.ink} /><circle cx="50" cy="52" r="5" fill={Q.ink} /></svg>
            <Tx size={58} color={Q.ink}>{S11.btn[0]}</Tx><Gloss />
          </div>
        </Abs>
      )}
      <Tap at={S11.clickAt} x={540} y={1350} color={Q.pink} />
      {t > S11.clickAt - 0.55 && <Cursor x={lerp(1000, 690, mk)} y={lerp(1750, 1365, mk)} press={press} />}
    </>
  );
};

// 12 · "Ads pe nahi, reviews pe dhanda badhao"
export const Tagline = () => {
  const t = useT();
  const kx = eo(P(t, S12.strikeAt, 0.35));
  const kl = P(t, S12.logoAt, 0.5);
  return (
    <>
      <Line text={S12.l1[0]} at={S12.l1[1]} y={360} size={112} color={Q.slate} />
      {kx > 0 && <Abs x={540} y={372} transform={`rotate(-4deg) scaleX(${kx})`}><div style={{width: 700, height: 16, borderRadius: 8, background: Q.red, transformOrigin: '0 50%'}} /></Abs>}
      <Line text={S12.l2[0]} at={S12.l2[1]} y={525} size={112} color={Q.purple} />
      <Line text={S12.l3[0]} at={S12.l3[1]} y={690} size={132} color={Q.pink} mark={MARK} />
      <Twinkle at={S12.logoAt} x={540} y={1010} r={560} n={18} />
      {kl > 0 && <Abs x={540} y={1010 + 8 * Math.sin(t * 2.4)} transform={`scale(${eb(kl, 2)})`} opacity={eo(kl)}><Img src={staticFile(ASSETS.logo)} style={{width: 620, display: 'block'}} /></Abs>}
      {t >= S12.logoAt + 0.3 && <Abs x={540} y={1265}><Stars n={5 * P(t, S12.logoAt + 0.3, 0.7)} size={96} /></Abs>}
      {kl > 0 && <Abs x={540} y={1400} opacity={eo(P(t, S12.logoAt + 0.6, 0.4))}><Tx size={40} color={Q.slate}>{BRAND.product}</Tx></Abs>}
    </>
  );
};
