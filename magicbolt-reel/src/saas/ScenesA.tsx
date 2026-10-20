// "Sell SaaS" scenes 1–6: hook → stop posts, sell software → bored client → amazed client → Canva vs SaaS → rate vs bill
import React from 'react';
import {Img, staticFile} from 'remotion';
import {S1, S2, S3, S4, S5, S6, ASSETS, BRAND, M} from './config';
import {Abs, useT, P, eo, eb, eio, lerp} from '../components/kit';
import {Gloss, Halo, Line, MARK, PopIn, Sparkle, Twinkle, Tx} from './kit';
import {AppIcon, Browser, Bubble, Calendar, Dash, Face, Invoice, IgPost, PriceTag, Strike, Typing} from './objects';
import {Ban, Burst} from '../ads/objects';

// Feathered round crop so the site illustrations melt into the background
const Illo: React.FC<{src: string; size: number}> = ({src, size}) => (
  <Img src={staticFile(src)} style={{width: size, height: size, display: 'block', WebkitMaskImage: 'radial-gradient(closest-side, #000 72%, transparent 100%)', maskImage: 'radial-gradient(closest-side, #000 72%, transparent 100%)'}} />
);

// 1 · "Agency chalate ho? Toh... ab Instagram posts mat becho."
const FAN: [number, number, number, number][] = [[-250, -12, 0, 1], [250, 12, 0.12, 2], [0, 0, 0.06, 0]]; // dx, rot, delay, art
export const Hook = () => {
  const t = useT();
  const kb = P(t, S1.banAt, 0.4);
  return (
    <>
      <Line text={S1.l1[0]} at={S1.l1[1]} y={330} size={100} />
      <div style={{position: 'absolute', inset: 0, filter: `grayscale(${eo(kb) * 0.7})`, opacity: 1 - 0.35 * eo(kb)}}>
        {FAN.map(([dx, r, d, v], i) => (
          <PopIn key={i} at={S1.postsAt + d} x={540 + dx} y={900 + (i === 2 ? -30 : 20)} rot={r * 2} float={8}>
            <div style={{transform: `rotate(${r}deg)`}}>
              <IgPost w={330} v={v} likes={[12, 9, 18][i]} />
            </div>
          </PopIn>
        ))}
        {[0, 1, 2].map((i) => (
          <PopIn key={i} at={S1.postsAt + 0.35 + i * 0.12} x={[300, 790, 560][i]} y={[690, 700, 1150][i]} s={2.6}>
            <div style={{transform: `rotate(${[-14, 10, -4][i]}deg)`}}><PriceTag w={210} text={['₹500', '₹700', '₹999'][i]} /></div>
          </PopIn>
        ))}
      </div>
      {kb > 0 && <Abs x={540} y={900} transform={`scale(${lerp(1.8, 1, eo(kb))}) rotate(${lerp(-25, 0, eo(kb))}deg)`} opacity={eo(Math.min(1, kb * 2))}><Ban size={600} /></Abs>}
      <Line text={S1.l2[0]} at={S1.l2[1]} y={1390} size={96} />
      <Line text={S1.l3[0]} at={S1.l3[1]} y={1520} size={108} color={M.pink} mark={MARK} />
    </>
  );
};

// 2 · "Stop selling Instagram posts. Sell your own software instead!"
export const Swap = () => {
  const t = useT();
  const ks = P(t, S2.strikeAt, 0.35);
  const kw = P(t, S2.swapAt, 0.45); // posts out, software in
  const kd = P(t, S2.swapAt + 0.15, 0.6);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - eio(kw), transform: `translateY(${-80 * eio(kw)}px)`}}>
        <Line text={S2.l1[0]} at={S2.l1[1]} y={330} size={96} />
        <PopIn at={0.15} x={540} y={960} float={10}>
          <div style={{position: 'relative', filter: `grayscale(${eo(ks) * 0.6})`}}>
            <Illo src={ASSETS.planner} size={760} />
          </div>
        </PopIn>
        {ks > 0 && <Abs x={540} y={330}><div style={{position: 'relative', width: 900, height: 20}}><Strike w={880} k={ks} /></div></Abs>}
      </div>
      {kd > 0 && (
        <Abs x={540} y={900 + 120 * (1 - eo(kd))} transform={`scale(${lerp(0.7, 1, eb(kd, 1.6))}) rotate(${lerp(8, -2, eo(kd)) + Math.sin(t * 1.6) * 0.8}deg)`} opacity={eo(Math.min(1, kd * 2))}>
          <Browser w={880} h={620} url={BRAND.domain}><Dash w={880} h={542} brand={BRAND.yours} k={P(t, S2.swapAt + 0.4, 1.6)} /></Browser>
        </Abs>
      )}
      {kd > 0 && <Halo x={540} y={900} r={700} c={M.blue} a={0.5 * eo(kd)} />}
      <Twinkle at={S2.swapAt + 0.25} x={540} y={900} r={460} />
      <Line text={S2.l2[0]} at={S2.l2[1]} y={1380} size={92} />
      <Line text={S2.l3[0]} at={S2.l3[1]} y={1530} size={140} color={M.blue} mark={MARK} />
    </>
  );
};

// 3 · "Posts bechoge, client bolega... 'Itna kyun? Canva se ho jata hai.'"
export const Bored = () => {
  const t = useT();
  const kp = P(t, S3.priceAt, 0.5);
  const sway = Math.sin(t * 1.4) * 4;
  return (
    <>
      <Line text={S3.l1[0]} at={S3.l1[1]} y={300} size={96} />
      <PopIn at={0.25} x={320} y={700} float={8}><div style={{transform: 'rotate(-8deg)'}}><IgPost w={330} v={0} likes={7} /></div></PopIn>
      <PopIn at={0.45} x={760} y={640} s={2.6}>
        <div style={{position: 'relative', transform: `rotate(${10 + 26 * eb(kp, 2)}deg) translateY(${70 * eo(kp)}px)`, transformOrigin: '10% 50%'}}>
          <PriceTag w={340} text="₹2,000" />
          {kp > 0 && <Strike w={250} k={kp} h={12} />}
        </div>
      </PopIn>
      {kp > 0 && (
        <Abs x={770} y={900} transform={`scale(${eb(P(t, S3.priceAt + 0.2, 0.4), 2.4)})`}>
          <div style={{padding: '10px 26px', borderRadius: 999, background: `${M.red}18`, border: `4px solid ${M.red}`}}><Tx size={46} color={M.red}>↓ ₹500?</Tx></div>
        </Abs>
      )}
      <PopIn at={S3.faceAt} x={540} y={1090} s={2.2}><div style={{transform: `rotate(${sway}deg)`}}><Face size={300} mood="bored" /></div></PopIn>
      {t >= S3.typingAt && t < S3.bubble[1] && <Abs x={540} y={1340}><Typing /></Abs>}
      <PopIn at={S3.bubble[1]} x={540} y={1340} rise={30} s={2.4}><Bubble size={58}>{S3.bubble[0]}</Bubble></PopIn>
      <PopIn at={S3.bubble2[1]} x={540} y={1500} rise={30} s={2.4}><Bubble size={54} bg={M.ink} color="#fff">{S3.bubble2[0]}</Bubble></PopIn>
    </>
  );
};

// 4 · "Software bechoge, client bolega... 'Wow, ye aapne banaya?'"
export const Wow = () => {
  const t = useT();
  const kd = P(t, S4.dashAt, 0.6);
  const kf = P(t, S4.faceAt, 0.5);
  return (
    <>
      <Line text={S4.l1[0]} at={S4.l1[1]} y={300} size={96} />
      {kd > 0 && <Halo x={540} y={720} r={620} c={M.blue} a={0.45} />}
      {kd > 0 && (
        <Abs x={540} y={720 + 100 * (1 - eo(kd))} transform={`scale(${lerp(0.75, 1, eb(kd, 1.6))}) rotate(${Math.sin(t * 1.5) * 0.8}deg)`} opacity={eo(Math.min(1, kd * 2))}>
          <Browser w={800} h={540} url={BRAND.domain}><Dash w={800} h={462} brand={BRAND.yours} k={P(t, S4.dashAt + 0.3, 1.6)} /></Browser>
        </Abs>
      )}
      {kf > 0 && (
        <Abs x={540} y={1200 + 80 * (1 - eo(kf))} transform={`scale(${eb(kf, 2.6) * (1 + 0.03 * Math.sin(t * 6))})`}>
          <Face size={300} mood="wow" />
        </Abs>
      )}
      {kf > 0 && [0, 1, 2, 3].map((i) => {
        const a = -Math.PI / 2 + (i - 1.5) * 0.7;
        const d = 230 + 14 * Math.sin(t * 4 + i);
        return <Abs key={i} x={540 + d * Math.cos(a) * 1.15} y={1200 + d * Math.sin(a)} transform={`rotate(${t * 60 + i * 30}deg) scale(${eb(P(t, S4.faceAt + 0.2 + i * 0.08, 0.4), 2.4)})`}><Sparkle size={[60, 44, 52, 40][i]} color={[M.gold, M.blue, M.pink, M.orange][i]} /></Abs>;
      })}
      <Twinkle at={S4.bubble[1] - 0.1} x={540} y={1200} r={420} />
      <PopIn at={S4.bubble[1]} x={540} y={1510} rise={30} s={2.4}>
        <Bubble size={60} bg={M.blue} color="#fff">{S4.bubble[0]}</Bubble>
      </PopIn>
    </>
  );
};

// 5 · "Fark samjho... Canva versus SaaS."
const Side: React.FC<{dark?: boolean; icon: 'post' | 'rocket'; title: string; sub: string}> = ({dark, icon, title, sub}) => (
  <div style={{position: 'relative', width: 400, height: 500, borderRadius: 44, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
    background: dark ? `linear-gradient(160deg, ${M.blue}, ${M.navy})` : '#fff', border: dark ? undefined : `3px solid ${M.line}`,
    boxShadow: dark ? `0 40px 80px ${M.deep}66` : '0 26px 60px rgba(30,40,110,0.16)'}}>
    <AppIcon icon={icon} size={170} />
    <Tx size={80} color={dark ? '#fff' : M.navy}>{title}</Tx>
    <Tx size={38} color={dark ? '#BFD6FF' : M.slate} w={400}>{sub}</Tx>
    {dark && <Gloss h="40%" a={0.22} />}
  </div>
);
export const Versus = () => {
  const t = useT();
  const kv = P(t, S5.vsAt, 0.4);
  return (
    <>
      <Line text={S5.l1[0]} at={S5.l1[1]} y={420} size={110} />
      <PopIn at={S5.leftAt} x={300} y={1000} rot={-14} float={8}><div style={{transform: 'rotate(-4deg)'}}><Side icon="post" title="Canva" sub="Posts" /></div></PopIn>
      <PopIn at={S5.rightAt} x={780} y={1000} rot={14} float={8}><div style={{transform: 'rotate(4deg)'}}><Side dark icon="rocket" title="SaaS" sub="Software" /></div></PopIn>
      {kv > 0 && (
        <Abs x={540} y={1000} transform={`scale(${eb(kv, 2.6)}) rotate(${-10 + 6 * Math.sin(t * 3)}deg)`}>
          <Burst size={230} color={M.gold} spin={t * 40}><Tx size={78} color={M.navy}>VS</Tx></Burst>
        </Abs>
      )}
    </>
  );
};

// 6 · "Posts ka rate — har 30 din negotiate hota hai. Software ka bill — har mahine auto-renew hota hai."
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
export const RateBill = () => {
  const t = useT();
  // top: the price gets haggled down
  const kh = P(t, S6.haggleAt, 1.7);
  const price = Math.round(lerp(5000, 2500, eio(kh)) / 100) * 100;
  const shake = kh > 0 && kh < 1 ? 7 * Math.sin(t * 40) : 0;
  // bottom: the bill renews itself every month
  const cyc = Math.max(0, t - S6.renewAt) / 0.5;
  const m = Math.min(MONTHS.length - 1, Math.floor(cyc));
  const paid = t >= S6.renewAt ? P(cyc - Math.floor(cyc), 0, 0.5) : 0;
  const ka = P(t, S6.billAt, 0.5);
  return (
    <>
      {/* top half: posts */}
      <Line text={S6.postLine[0]} at={S6.postLine[1]} y={300} size={80} color={M.pink} />
      <PopIn at={S6.postAt} x={250} y={600} s={2.2}><Calendar size={250} big="30" small="din" /></PopIn>
      <PopIn at={S6.postAt + 0.2} x={710} y={620} s={2.4}>
        <div style={{transform: `rotate(${-6 + shake}deg)`}}><PriceTag w={420} text={`₹${price.toLocaleString('en-IN')}`} c1="#FFC1D4" c2={M.pink} color="#fff" /></div>
      </PopIn>
      {['Thoda kam karo?', 'Discount?'].map((s, i) => (
        <PopIn key={s} at={S6.haggleAt + i * 0.6} x={[700, 770][i]} y={[440, 800][i]} rise={20} s={2.6}><Bubble size={36}>{s}</Bubble></PopIn>
      ))}
      <div style={{position: 'absolute', left: 90, right: 90, top: 948, height: 4, borderRadius: 2, background: M.line, opacity: eo(P(t, S6.billAt - 0.3, 0.4))}} />
      {/* bottom half: software */}
      <Line text={S6.billLine[0]} at={S6.billLine[1]} y={1080} size={80} color={M.green} />
      {ka > 0 && (
        <Abs x={190} y={1400} transform={`scale(${eb(ka, 2.2)}) rotate(${(t - S6.billAt) * 220}deg)`}>
          <svg width={190} height={190} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 14px 22px ${M.green}55)`}}>
            <path d="M80 50a30 30 0 1 1-9-21" stroke={M.green} strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M84 14v22H62z" fill={M.green} strokeLinejoin="round" />
          </svg>
        </Abs>
      )}
      <PopIn at={S6.billAt} x={640} y={1400} s={2}>
        <Invoice w={600} month={MONTHS[m]} on={P(t, S6.billAt + 0.4, 0.3)} paid={paid} />
      </PopIn>
      {t >= S6.renewAt && Array.from({length: m + 1}, (_, i) => {
        const k = P(t, S6.renewAt + i * 0.5, 0.9);
        if (k <= 0 || k >= 1) return null;
        return <Abs key={i} x={880 + (i % 2) * 60} y={1260 - 200 * eo(k)} opacity={1 - k} transform={`scale(${eb(Math.min(1, k * 3), 2)})`}><Tx size={52} color={M.green}>+₹</Tx></Abs>;
      })}
    </>
  );
};
