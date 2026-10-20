// Scenes 2–6: the 2D layer on top of the 3D city. Labels stick to buildings through <Anchor>.
import React from 'react';
import {Abs, useT, P, cl, eo, eb, lerp} from '../components/kit';
import {S2, S3, S4, S5, S6, SHOPS, T, W} from './config';
import {HQ_H, project, shopPos} from './cam';
import {PIN_AT, linkedAt, pinY} from './city';
import {Anchor, Big, Burst, Gloss, Line, Pop, Seg, Sparkle, Tx, useG} from './kit';
import {Badge, Bubble, Chip, Earnings, Ico, LogoCard, OfferCard, SearchBar} from './ui';

const HQ_AT = T.s5 + S5.hqAt;

// Name tags over the shops. In scene 6 each one flips to "New client" when its line connects.
const ShopTags: React.FC = () => {
  const t = useG();
  const hide = eo(P(t, T.s5 + 0.1, 0.3)) * (1 - eo(P(t, T.s6, 0.3))); // out of the way during the offer
  return (
    <>
      {SHOPS.map((s, i) => {
        const k = P(t, T.s2 + S2.chipsAt + i * S2.chipGap, 0.45);
        if (k <= 0) return null;
        const [x, , z] = shopPos(i);
        const won = P(t, linkedAt(i), 0.45);
        return (
          <Anchor key={i} p={[x, 3.5 + 0.9 * eo(won), z]} s={eb(k, 2.2) * (1 + 0.25 * Math.sin(Math.PI * won))} dy={6 * Math.sin(t * 2 + i)} opacity={1 - hide}>
            {won > 0.3 ? <Chip icon="check" text={S6.toast} color={W.green} size={32} /> : <Chip icon={s.icon} text={s.name} color={s.color} size={32} />}
          </Anchor>
        );
      })}
    </>
  );
};

// Scene 3: every shop is thinking about AI, and does not know how
const Bubbles: React.FC = () => {
  const t = useG() - T.s3;
  if (t < S3.bubblesAt || t > S3.searchAt + 0.2) return null;
  const out = P(t, S3.searchAt - 0.15, 0.3); // the search takes over
  return (
    <>
      {SHOPS.map((s, i) => {
        const k = P(t, S3.bubblesAt + i * 0.22, 0.4);
        if (k <= 0) return null;
        const how = t >= S3.howAt + i * 0.08;
        const flip = P(t, S3.howAt + i * 0.08, 0.35);
        const [x, , z] = shopPos(i);
        return (
          <Anchor key={i} p={[x, 5.3, z]} s={eb(k, 2.4) * (1 + 0.3 * Math.sin(Math.PI * flip)) * (1 - out)} dy={8 * Math.sin(t * 2.6 + i * 1.7)}>
            <div style={{transform: `rotate(${how ? 5 * Math.sin(t * 9 + i) : 0}deg)`}}>
              <Bubble text={how ? S3.bubble2 : S3.bubble1} color={how ? W.pink : W.purple} spark={!how} />
            </div>
          </Anchor>
        );
      })}
    </>
  );
};

// "AAP" label riding on the pin, then the agency sign and its badges
const PinAndAgency: React.FC = () => {
  const t = useG();
  if (t < PIN_AT + 0.4 || t >= T.s7) return null;
  const kl = P(t, PIN_AT + 0.5, 0.4);
  const hq = project(t, [0, HQ_H * 0.75, 0]);
  const kb = t - (T.s5 + S5.badgesAt);
  const fade = 1 - eo(P(t, T.s6 - 0.2, 0.3)); // badges leave before the money scene
  // badge slots fanned around the building (screen offsets from the building)
  const SLOTS: [number, number][] = [[-390, 70], [-350, -90], [-215, -215], [215, -215], [350, -90], [390, 70]];
  return (
    <>
      {kb > 0 && fade > 0 && S5.badges.map((b, i) => {
        const k = P(kb, i * 0.13, 0.5);
        if (k <= 0) return null;
        const e = eo(k), [ox, oy] = SLOTS[i];
        const x = hq.x + ox * e * hq.k, y = hq.y + oy * e * hq.k + 12 * Math.sin(t * 2.2 + i * 1.3);
        return (
          <React.Fragment key={i}>
            <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 0.7 * e * fade}}>
              <line x1={hq.x} y1={hq.y} x2={x} y2={y} stroke={b.color} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
            </svg>
            <Abs x={x} y={y} transform={`rotate(${(i - 2.5) * 4}deg) scale(${eb(k, 2.4) * hq.k * fade})`}><Badge text={b.text} color={b.color} size={40} /></Abs>
          </React.Fragment>
        );
      })}
      {kl > 0 && (
        <Anchor p={[0, pinY(t) + 3.75, 0]} s={eb(kl, 2.6)}>
          <Gloss c={W.yellow} c2={W.orange} r={34} style={{padding: '8px 30px', border: '5px solid #fff'}}><Tx size={52} color={W.ink}>{S4.pinLabel}</Tx></Gloss>
        </Anchor>
      )}
    </>
  );
};

// ---------- per-scene text and UI (scene-local time inside each Seg) ----------
const Look: React.FC = () => (
  <>
    <Line text={S2.l1[0]} at={S2.l1[1]} out={S2.swapAt - 0.15} y={260} size={82} halo mark={`${W.yellow}cc`} />
    <Line text={S2.l2[0]} at={S2.l2[1]} y={225} size={92} halo />
    <Line text={S2.l3[0]} at={S2.l3[1]} y={345} size={72} halo hi={{0: [W.green, W.cyan]}} />
  </>
);

const Need: React.FC = () => {
  const t = useT();
  return (
    <>
      <Line text={S3.l1[0]} at={S3.l1[1]} out={S3.howAt - 0.15} y={260} size={70} halo hi={{0: [W.purple, W.pink]}} />
      <Line text={S3.l2[0]} at={S3.l2[1]} out={S3.searchAt - 0.15} y={215} size={62} color={W.slate} halo />
      <Line text={S3.how[0]} at={S3.how[1]} out={S3.searchAt - 0.15} y={365} size={210} big g={[W.pink, W.orange]} halo />
      {t >= S3.need[1] && <Line text={S3.need[0]} at={S3.need[1]} y={415} size={98} g={[W.purple, W.pink]} halo />}
      <Line text={S3.needSub[0]} at={S3.needSub[1]} y={525} size={56} color={W.ink} halo />
    </>
  );
};

// search bar lives across scenes 3 → 4: it searches, then finds "you"
const Search: React.FC = () => (
  <Pop at={0} x={540} y={245} from={[0, -160]}>
    <SearchBar query={S3.query} typeAt={0.25} typeDur={1.3} foundAt={S3.dur - S3.searchAt + S4.pinAt + 0.3} found={S4.result} />
  </Pop>
);

const You: React.FC = () => {
  const land = project(T.s4 + S4.pinAt + 0.3, [0, 0.5, 0]);
  return (
  <>
    <Line text={S4.l1[0]} at={S4.l1[1]} y={410} size={76} halo />
    <Line text={S4.l2[0]} at={S4.l2[1]} y={525} size={96} halo hi={{0: [W.pink, W.orange]}} />
    <Burst at={S4.pinAt + 0.25} x={land.x} y={land.y} r={480} n={20} />
  </>
  );
};

const Offer: React.FC = () => {
  const t = useT();
  const m = eo(P(t, S5.hqAt - 0.1, 0.55)); // logo moves up and shrinks when the agency rises
  return (
    <>
      <Pop at={S5.logoAt} x={540} y={lerp(360, 185, m)} s={lerp(1, 0.5, m)} from={[0, -120]}><LogoCard w={800} sweepAt={S5.logoAt + 0.55} /></Pop>
      <Burst at={S5.logoAt + 0.1} x={540} y={360} r={520} />
      <Line text={S5.l1[0]} at={S5.l1[1]} out={S5.hqAt - 0.2} y={580} size={70} halo />
      <Line text={S5.l2[0]} at={S5.l2[1]} out={S5.hqAt - 0.2} y={700} size={104} halo hi={{1: [W.blue, W.purple, W.pink]}} />
      <Line text={S5.pre[0]} at={S5.pre[1]} y={305} size={46} color={W.slate} halo />
      <Line text={S5.head1[0]} at={S5.head1[1]} y={395} size={88} halo hi={{1: [W.purple, W.pink]}} />
      <Line text={S5.head2[0]} at={S5.head2[1]} y={500} size={88} g={[W.blue, W.purple]} halo />
      {S5.cards.map((c, i) => (
        <Pop key={i} at={c.at} x={540} y={1045 + i * 156} from={[i % 2 ? -700 : 700, 0]}><OfferCard {...c} /></Pop>
      ))}
    </>
  );
};

const Earn: React.FC = () => {
  const t = useT();
  const ks = P(t, S6.stamp[1], 0.45);
  return (
    <>
      <Pop at={S6.cardAt} x={540} y={340} from={[0, -200]}>
        <Earnings label={S6.label} amount={S6.amount} from={S6.countFrom} dur={S6.countDur} range={S6.range} rangeSub={S6.rangeSub} />
      </Pop>
      <Burst at={S6.countFrom + S6.countDur} x={300} y={340} r={380} n={14} />
      {/* coins popping out of the counter */}
      {Array.from({length: 7}, (_, i) => {
        const k = cl((t - S6.countFrom - i * 0.3) / 1.1);
        if (k <= 0 || k >= 1) return null;
        return <Abs key={i} x={170 + i * 120} y={560 - 130 * Math.sin(Math.PI * k)} transform={`scale(${Math.sin(Math.PI * k)})`}>
          <Gloss c={W.yellow} c2={W.orange} r={999} style={{width: 70, height: 70, border: '4px solid #fff'}}><Tx size={40} color={W.ink}>₹</Tx></Gloss>
        </Abs>;
      })}
      {ks > 0 && (
        <Abs x={540} y={1330} transform={`rotate(${lerp(-14, -4, eo(ks))}deg) scale(${lerp(2.2, 1, eo(ks))})`} opacity={Math.min(1, ks * 2.5)}>
          <Gloss c={W.purple} c2={W.pink} r={40} style={{padding: '20px 44px', border: '7px solid #fff', boxShadow: `0 26px 60px ${W.purple}88`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}><Sparkle size={54} /><Big size={84} color="#fff">{S6.stamp[0]}</Big><Sparkle size={54} /></div>
          </Gloss>
        </Abs>
      )}
      <Burst at={S6.stamp[1] + 0.25} x={540} y={1330} r={460} n={16} />
      <Abs x={540} y={1515} opacity={eo(P(t, S6.countFrom + S6.countDur, 0.4))}>
        <div style={{padding: '8px 26px', borderRadius: 999, background: 'rgba(255,255,255,0.9)'}}><Tx size={26} color={W.slate} w={400}>{S6.note}</Tx></div>
      </Abs>
    </>
  );
};

export const CityOverlay: React.FC = () => (
  <>
    <ShopTags />
    <Bubbles />
    <PinAndAgency />
    <Seg start={T.s2} dur={S2.dur}><Look /></Seg>
    <Seg start={T.s3} dur={S3.dur}><Need /></Seg>
    <Seg start={T.s3 + S3.searchAt} dur={S3.dur - S3.searchAt + S4.dur}><Search /></Seg>
    <Seg start={T.s4} dur={S4.dur}><You /></Seg>
    <Seg start={T.s5} dur={S5.dur}><Offer /></Seg>
    <Seg start={T.s6} dur={S6.dur}><Earn /></Seg>
  </>
);
