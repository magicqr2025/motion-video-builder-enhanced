// "Sell SaaS" scenes 7–12: no code → white-label → dashboard + features → SaaS company → offer → CTA
import React from 'react';
import {Img, staticFile} from 'remotion';
import {S7, S8, S9, S10, S11, S12, ASSETS, BRAND, M} from './config';
import {Abs, useT, P, eo, eb, eio, lerp} from '../components/kit';
import {Halo, Line, LogoBuild, LogoImg, MARK, PopIn, Sparkle, Tap, Twinkle, Tx} from './kit';
import {AppIcon, BrandMark, Browser, CodeWin, Dash, GPill, Mark, Strike, SHADOW} from './objects';
import {Ban} from '../ads/objects';
import {Cursor} from '../qr/objects';

// 7 · "Aur haan... code likhne ki koi zaroorat nahi."
export const NoCode = () => {
  const t = useT();
  const kb = P(t, S7.banAt, 0.4);
  return (
    <>
      <PopIn at={S7.codeAt} x={540} y={760} s={1.6} float={8}>
        <div style={{opacity: 1 - 0.4 * eo(kb), filter: `grayscale(${0.6 * eo(kb)})`}}><CodeWin w={780} k={P(t, S7.codeAt + 0.2, 1.3)} /></div>
      </PopIn>
      {kb > 0 && <Abs x={540} y={760} transform={`scale(${lerp(1.8, 1, eo(kb))}) rotate(${lerp(-25, 0, eo(kb))}deg)`} opacity={eo(Math.min(1, kb * 2))}><Ban size={620} /></Abs>}
      <Line text={S7.l1[0]} at={S7.l1[1]} y={1330} size={92} />
      <Line text={S7.l2[0]} at={S7.l2[1]} y={1460} size={108} color={M.pink} mark={MARK} />
    </>
  );
};

// 8 · "Magic Bolt AI ka white-label SaaS — aapka logo... aapka domain."
const DOM_OLD = 'app.magicbolt.ai';
export const WhiteLabel = () => {
  const t = useT();
  const ksw = P(t, S8.swapAt, 0.5); // logo flips to "Your Agency"
  const flip = Math.cos(Math.PI * eio(ksw)); // 1 → -1
  // domain: erase the old one, then type the new one
  const er = P(t, S8.urlAt, 0.25), ty = P(t, S8.urlAt + 0.25, 0.45);
  const url = t < S8.urlAt ? DOM_OLD : er < 1 ? DOM_OLD.slice(0, Math.round(DOM_OLD.length * (1 - er))) : BRAND.domain.slice(0, Math.round(BRAND.domain.length * ty));
  const typing = t >= S8.urlAt && ty < 1;
  return (
    <>
      <LogoBuild at={S8.logoAt} x={540} y={330} w={980} />
      <Line text={S8.l1[0]} at={S8.l1[1]} y={600} size={96} color={M.deep} mark={MARK} />
      <PopIn at={0.5} x={540} y={1060} s={1.6} float={6}>
        <Browser w={900} h={560} url={url} urlK={typing ? 0.999 : 1}>
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 50px', gap: 30, boxSizing: 'border-box'}}>
            <div style={{height: 150, display: 'flex', alignItems: 'center', transform: `scaleY(${Math.abs(flip)})`}}>
              {flip > 0 ? <LogoImg w={560} /> : <BrandMark size={120} name={BRAND.yours} />}
            </div>
            <div style={{display: 'flex', gap: 22, width: '100%'}}>
              {['post', 'pin', 'star', 'chart'].map((ic) => (
                <div key={ic} style={{flex: 1, height: 170, borderRadius: 24, border: `2px solid ${M.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFE'}}>
                  <AppIcon icon={ic as 'post'} size={84} />
                </div>
              ))}
            </div>
          </div>
        </Browser>
      </PopIn>
      <Twinkle at={S8.swapAt + 0.25} x={540} y={980} r={360} />
      <PopIn at={S8.logoLine[1]} x={540} y={1470} s={2.4}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 34px', borderRadius: 999, background: '#fff', boxShadow: SHADOW, border: `3px solid ${M.line}`}}><Mark ok size={60} /><Tx size={46} color={M.navy}>{S8.logoLine[0]}</Tx></div>
      </PopIn>
      <PopIn at={S8.urlLine[1]} x={540} y={1610} s={2.4}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 34px', borderRadius: 999, background: '#fff', boxShadow: SHADOW, border: `3px solid ${M.line}`}}><Mark ok size={60} /><Tx size={46} color={M.navy}>{S8.urlLine[0]}</Tx></div>
      </PopIn>
    </>
  );
};

// 9 · "Client ko dikhega... aapka dashboard. Social posting, Google profile, reviews, reports — sab usme."
const TILE_POS: [number, number][] = [[290, 1330], [790, 1330], [290, 1500], [790, 1500]];
export const Dashboard = () => {
  const t = useT();
  const kd = P(t, S9.dashAt, 0.6);
  const ks = P(t, S9.l3[1], 0.5); // "sab usme": tiles pulse into the dashboard
  return (
    <>
      <Line text={S9.l1[0]} at={S9.l1[1]} y={260} size={80} />
      <Line text={S9.l2[0]} at={S9.l2[1]} y={370} size={100} color={M.blue} mark={MARK} />
      {kd > 0 && <Halo x={540} y={830} r={640} c={M.blue} a={0.4 * eo(kd)} />}
      {kd > 0 && (
        <Abs x={540} y={830 + 100 * (1 - eo(kd))} transform={`scale(${lerp(0.75, 1, eb(kd, 1.5)) * (1 + 0.025 * Math.sin(Math.PI * ks))}) rotate(${Math.sin(t * 1.3) * 0.7}deg)`} opacity={eo(Math.min(1, kd * 2))}>
          <Browser w={900} h={600} url={BRAND.domain}><Dash w={900} h={522} brand={BRAND.yours} k={P(t, S9.dashAt + 0.3, 1.8)} /></Browser>
        </Abs>
      )}
      {S9.tiles.map(({label, icon, at}, i) => {
        const [x, y] = TILE_POS[i];
        const pulse = 1 + 0.06 * Math.sin(Math.PI * P(t, S9.l3[1] + i * 0.08, 0.4));
        return (
          <PopIn key={label} at={at} x={x} y={y} s={2.4} rot={i % 2 ? 10 : -10}>
            <div style={{transform: `scale(${pulse})`, display: 'flex', alignItems: 'center', gap: 20, width: 460, height: 140, padding: '0 24px', boxSizing: 'border-box', borderRadius: 34, background: '#fff', boxShadow: SHADOW, border: `3px solid ${M.line}`}}>
              <AppIcon icon={icon} size={92} />
              <Tx size={42} color={M.navy}>{label}</Tx>
            </div>
          </PopIn>
        );
      })}
      <Line text={S9.l3[0]} at={S9.l3[1]} y={1700} size={100} color={M.pink} mark={MARK} />
    </>
  );
};

// 10 · "Ab aap service agency nahi... Aap SaaS company ho."
export const Identity = () => {
  const t = useT();
  const ko = P(t, S10.oldAt, 0.45);
  const ks = P(t, S10.strikeAt, 0.4);
  const kn = P(t, S10.newAt, 0.5);
  return (
    <>
      <Line text={S10.l1[0]} at={S10.l1[1]} y={330} size={96} />
      {ko > 0 && (
        <Abs x={540} y={530} transform={`scale(${eb(ko, 2) * lerp(1, 0.86, eo(ks))}) rotate(${-2 * eo(ks)}deg)`} opacity={lerp(1, 0.55, eo(ks))}>
          <div style={{position: 'relative', filter: `grayscale(${eo(ks)})`}}>
            <GPill size={74} c1="#9AA3C2" c2="#5B6585">Service Agency</GPill>
            {ks > 0 && <Strike w={720} k={ks} h={16} />}
          </div>
        </Abs>
      )}
      <Line text={S10.l2[0]} at={S10.l2[1]} y={790} size={96} />
      {kn > 0 && <Halo x={540} y={960} r={560} c={M.gold} a={0.6 * eo(kn)} />}
      {kn > 0 && (
        <Abs x={540} y={960} transform={`scale(${eb(kn, 2.6) * (1 + 0.02 * Math.sin(t * 5))}) rotate(${lerp(-12, -2, eo(kn))}deg)`}>
          <GPill size={104} c1="#FFE27A" c2={M.orange} color={M.navy} padX={0.8}>SaaS Company</GPill>
        </Abs>
      )}
      <Twinkle at={S10.newAt + 0.1} x={540} y={960} r={480} n={16} />
      <PopIn at={S10.newAt + 0.3} x={540} y={1430} s={1.8} float={10}>
        <Img src={staticFile(ASSETS.growth)} style={{width: 620, height: 620, display: 'block', WebkitMaskImage: 'radial-gradient(closest-side, #000 72%, transparent 100%)', maskImage: 'radial-gradient(closest-side, #000 72%, transparent 100%)'}} />
      </PopIn>
    </>
  );
};

// 11 · "No setup fee. No lock-in. Free trial."
export const Offer = () => {
  const t = useT();
  return (
    <>
      <PopIn at={0.05} x={540} y={380} s={1.6}><LogoImg w={620} /></PopIn>
      {S11.rows.map(({no, text, at}, i) => {
        const hi = !no;
        const glow = hi ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
        return (
          <PopIn key={text} at={at} x={540} y={720 + i * 250} rot={i % 2 ? 6 : -6} s={2.2}>
            <div style={{display: 'flex', alignItems: 'center', gap: 34, width: 860, height: 190, padding: '0 40px', boxSizing: 'border-box', borderRadius: 48,
              background: hi ? `linear-gradient(180deg, #FFF8DC, #FFEFC2)` : '#fff', border: `4px solid ${hi ? M.gold : M.line}`,
              boxShadow: hi ? `0 30px 70px ${M.orange}${Math.round(0x44 + glow * 0x30).toString(16)}` : SHADOW}}>
              <Mark ok={!no} size={120} />
              <Tx size={78} color={M.navy}>{no ? <><span style={{color: M.red}}>No</span> {text.toLowerCase()}</> : text}</Tx>
              {hi && <Sparkle size={70} color={M.gold} style={{marginLeft: 'auto', transform: `rotate(${t * 60}deg)`}} />}
            </div>
          </PopIn>
        );
      })}
      <Twinkle at={S11.rows[2].at + 0.2} x={540} y={1220} r={420} />
    </>
  );
};

// 12 · "Bas signup karo... ya webinar join karo!"
export const Cta = () => {
  const t = useT();
  const press1 = Math.sin(Math.PI * P(t, S12.clickAt, 0.25));
  const press2 = Math.sin(Math.PI * P(t, S12.click2At, 0.25));
  // cursor glides to "Sign up", then down to "Join Webinar"
  const k1 = eio(P(t, S12.clickAt - 0.55, 0.5)), k2 = eio(P(t, S12.click2At - 0.6, 0.55));
  const cx = lerp(lerp(900, 640, k1), 700, k2), cy = lerp(lerp(1300, 900, k1), 1180, k2);
  const showCur = t >= S12.clickAt - 0.6;
  return (
    <>
      <LogoBuild at={S12.logoAt} x={540} y={360} w={980} />
      <PopIn at={S12.signup[1]} x={540} y={880} s={2.4}>
        <GPill size={88} c1="#4FA8F0" c2={M.deep} press={press1} padX={1.1}>{S12.signup[0]}</GPill>
      </PopIn>
      <Tap at={S12.clickAt} x={620} y={890} color={M.blue} />
      <PopIn at={S12.or[1]} x={540} y={1030} rise={20}><Tx size={56} color={M.slate} w={400}>{S12.or[0]}</Tx></PopIn>
      <PopIn at={S12.webinar[1]} x={540} y={1170} s={2.4}>
        <GPill size={80} c1="#FFE27A" c2={M.orange} color={M.navy} press={press2}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 22}}>
            <svg width={72} height={56} viewBox="0 0 72 56"><rect x="2" y="6" width="46" height="44" rx="10" fill={M.navy} /><path d="M52 20l18-10v36L52 36z" fill={M.navy} /><circle cx="25" cy="28" r="8" fill="#FFE27A" /></svg>
            {S12.webinar[0]}
          </span>
        </GPill>
      </PopIn>
      <Tap at={S12.click2At} x={680} y={1180} color={M.orange} />
      {showCur && <Cursor x={cx} y={cy} press={Math.max(press1, press2)} />}
      <PopIn at={S12.siteAt} x={540} y={1440} rise={30}>
        <div style={{padding: '18px 44px', borderRadius: 999, background: M.navy, boxShadow: SHADOW}}><Tx size={54} color="#fff">{BRAND.site}</Tx></div>
      </PopIn>
    </>
  );
};
