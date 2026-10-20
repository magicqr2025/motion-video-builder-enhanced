// Ads-vs-reviews scenes 1–6: stop burning money → Google is free → search → top 3 → reviews → asking doesn't work
import React from 'react';
import {S1, S2, S3, S4, S5, S6, DEMO, Q} from './config';
import {Abs, useT, P, eo, eb, eio, lerp} from '../components/kit';
import {Card, Line, Stars, Tap, Twinkle, Tx} from '../qr/kit';
import {Cursor, GoogleWord, StandImg} from '../qr/objects';
import {AdTile, Ban, Burst, FactorGlyph, Flame, Gloss, Listing, Magnifier, Note, Person, Pin, SearchBar, Shop} from './objects';

const MARK = `${Q.yellow}99`;

// 1 · money burning on ads → STOP
const NOTES: [number, number, number][] = [[-175, -12, 0], [175, 12, 0.15], [0, -3, 0.07]]; // dx, rotation, delay
export const Hook = () => {
  const t = useT();
  const ka = P(t, S1.notesAt, 0.5);
  const ks = P(t, S1.stopAt, 0.4);
  const out = P(t, S1.stopAt, 0.45); // flames die once the ban lands
  const fire = (t >= S1.notesAt + 0.3 ? 1 : 0) * (1 - out);
  return (
    <>
      <Line text={S1.l1[0]} at={S1.l1[1]} y={320} size={100} />
      <Line text={S1.l2[0]} at={S1.l2[1]} y={455} size={104} color={Q.pink} mark={MARK} />
      {ka > 0 && <Abs x={540} y={800 + 8 * Math.sin(t * 3)} transform={`scale(${eb(ka, 2)}) rotate(${-6 + 3 * Math.sin(t * 4)}deg)`} opacity={eo(ka)}><AdTile size={250} /></Abs>}
      {NOTES.map(([dx, r, d], i) => {
        const kn = P(t, S1.notesAt + 0.1 + d, 0.45);
        if (kn <= 0) return null;
        const b = P(Math.min(t, S1.stopAt), S1.notesAt + 0.35 + d, 1.6); // burn progress, frozen at the stop
        const W = 380, H = 190, edge = H * 0.62 * b;
        const kf = P(t, S1.notesAt + 0.3 + d, 0.3) * (1 - out);
        return (
          <Abs key={i} x={540 + dx} y={1180 + 70 * (1 - eo(kn)) + 5 * Math.sin(t * 3 + i)} transform={`rotate(${r}deg) scale(${eb(kn, 1.6)})`} opacity={eo(kn)}>
            <div style={{position: 'relative', width: W, height: H}}>
              <Note w={W} style={{clipPath: `inset(${edge}px 0 0 0 round 18px)`, filter: `brightness(${1 - 0.25 * b})`}} />
              {b > 0 && <div style={{position: 'absolute', left: 6, right: 6, top: edge - 4, height: 26, borderRadius: 10, background: 'linear-gradient(180deg, #2A1A10, rgba(42,26,16,0))', opacity: 0.85}} />}
              {kf > 0 && [0.18, 0.5, 0.8].map((fx, j) => (
                <div key={j} style={{position: 'absolute', left: W * fx - 50, top: edge - 112, transform: `scale(${eo(kf) * (j === 1 ? 1.15 : 0.9)})`, transformOrigin: '50% 100%'}}><Flame size={100} ph={i * 2 + j} /></div>
              ))}
            </div>
          </Abs>
        );
      })}
      {fire > 0 && Array.from({length: 14}, (_, i) => {
        const k = (t * 0.9 + i * 0.137) % 1;
        const x = 540 + (((i * 173) % 640) - 320) + 30 * Math.sin(t * 4 + i);
        return <div key={i} style={{position: 'absolute', left: x, top: 1130 - 480 * k, width: 10 + (i % 3) * 5, height: 10 + (i % 3) * 5, borderRadius: '50%', background: i % 2 ? '#FDBA17' : '#F97316', opacity: fire * (1 - k), boxShadow: '0 0 12px #F97316'}} />;
      })}
      {ks > 0 && (
        <Abs x={540} y={1000} transform={`scale(${lerp(1.9, 1, eo(ks))}) rotate(${lerp(-25, 0, eo(ks))}deg)`} opacity={eo(Math.min(1, ks * 2))}>
          <Ban size={640} />
        </Abs>
      )}
      {ks > 0 && (
        <Abs x={540} y={1400} transform={`scale(${eb(P(t, S1.stopAt + 0.2, 0.4), 2.4)}) rotate(-4deg)`}>
          <div style={{position: 'relative', padding: '16px 56px', borderRadius: 999, background: 'linear-gradient(180deg, #FF6B6B, #C81E1E)', boxShadow: '0 20px 50px rgba(200,30,30,0.45)', overflow: 'hidden'}}>
            <Tx size={64} color="#fff">STOP</Tx><Gloss />
          </div>
        </Abs>
      )}
    </>
  );
};

// 2 · Google sends free customers to your shop
const WALK: [number, number][] = [[-90, 1380], [1170, 1330], [-90, 930], [1170, 980], [260, 1760], [860, 1760]];
const PEOPLE = [Q.pink, Q.purple, Q.blue, Q.green, '#FF8A3D', Q.pink];
const DOOR: [number, number] = [617, 1180];
export const Free = () => {
  const t = useT();
  const kg = P(t, S2.googleAt, 0.5);
  const ksh = P(t, S2.shopAt, 0.5);
  const kfr = P(t, S2.freeAt, 0.45);
  const arrived = WALK.filter((_, i) => t >= S2.walkAt + i * S2.walkGap + 0.75).length;
  return (
    <>
      {kg > 0 && <Abs x={540} y={320} transform={`scale(${eb(kg, 2)})`} opacity={eo(kg)}><GoogleWord size={160} /></Abs>}
      <Line text={S2.l1[0]} at={S2.l1[1]} y={490} size={104} color={Q.pink} mark={MARK} />
      {ksh > 0 && <Abs x={540} y={1080 + 60 * (1 - eo(ksh))} transform={`scale(${eb(ksh, 1.6)})`} opacity={eo(ksh)}><Shop w={440} /></Abs>}
      {ksh > 0 && <Abs x={540} y={lerp(560, 770, eb(P(t, S2.shopAt + 0.2, 0.5), 2.2)) + 10 * Math.sin(t * 4)} opacity={eo(P(t, S2.shopAt + 0.2, 0.2))}><Pin size={130} /></Abs>}
      {kfr > 0 && (
        <Abs x={860} y={720 + 8 * Math.sin(t * 3)} transform={`scale(${eb(kfr, 2.4)}) rotate(${12 + 4 * Math.sin(t * 2)}deg)`}>
          <Burst size={250} spin={t * 30}><Tx size={58} color={Q.ink}>FREE</Tx></Burst>
        </Abs>
      )}
      {WALK.map(([sx, sy], i) => {
        const at = S2.walkAt + i * S2.walkGap;
        const k = eio(P(t, at, 0.75));
        if (k <= 0 || k >= 1) return null;
        const x = lerp(sx, DOOR[0], k), y = lerp(sy, DOOR[1], k) - 140 * Math.sin(Math.PI * k);
        return <Abs key={i} x={x} y={y} transform={`scale(${lerp(1, 0.4, k)}) rotate(${10 * Math.sin(t * 12 + i)}deg)`} opacity={k > 0.85 ? (1 - k) / 0.15 : 1}><Person size={120} color={PEOPLE[i]} /></Abs>;
      })}
      {WALK.map((_, i) => {
        const k = P(t, S2.walkAt + i * S2.walkGap + 0.75, 0.6);
        return k > 0 && k < 1 ? <Abs key={i} x={DOOR[0] + 70} y={DOOR[1] - 90 - 140 * eo(k)} opacity={1 - k}><Tx size={56} color={Q.green}>+1</Tx></Abs> : null;
      })}
      {arrived > 0 && (
        <Abs x={540} y={1400} transform={`scale(${eb(P(t, S2.walkAt + 0.75, 0.4), 2)})`}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 40px', borderRadius: 999, background: `linear-gradient(180deg, #34D27A, ${Q.green})`, boxShadow: `0 18px 44px ${Q.green}66`, overflow: 'hidden'}}>
            <Tx size={48} color="#fff">+{arrived} new customers</Tx><Gloss />
          </div>
        </Abs>
      )}
    </>
  );
};

// 3 · someone searches "salon near me"
export const Search = () => {
  const t = useT();
  const kb = P(t, S3.barAt, 0.5);
  const typed = DEMO.search.slice(0, Math.floor(DEMO.search.length * P(t, S3.typeAt, S3.typeDur)));
  const caret = t < S3.sugAt && Math.floor(t * 2.6) % 2 === 0;
  const ks = P(t, S3.sugAt, 0.4);
  const mk = eio(P(t, S3.tapAt - 0.55, 0.5));
  const press = Math.sin(Math.PI * P(t, S3.tapAt, 0.22));
  const sel = t >= S3.tapAt;
  return (
    <>
      <Line text={S3.l1[0]} at={S3.l1[1]} y={320} size={92} />
      {kb > 0 && <Abs x={540} y={500} transform={`scale(${eb(kb, 2)})`} opacity={eo(kb)}><GoogleWord size={130} /></Abs>}
      {kb > 0 && <Abs x={540} y={690 + 50 * (1 - eo(kb))} opacity={eo(kb)} transform={`scale(${sel ? 1 + 0.03 * Math.sin(Math.PI * P(t, S3.tapAt, 0.3)) : 1})`}><SearchBar text={typed} caret={caret} /></Abs>}
      {ks > 0 && (
        <div style={{position: 'absolute', left: 90, top: 790, transformOrigin: '50% 0', transform: `scaleY(${eo(ks)})`, opacity: eo(ks)}}>
          <Card w={900} r={36} style={{padding: '14px 0'}}>
            {DEMO.suggestions.map((s, i) => (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 22, height: 100, padding: '0 40px', background: i === 0 && sel ? '#EEF5FF' : 'transparent'}}>
                <svg width={34} height={34} viewBox="0 0 48 48"><circle cx="20" cy="20" r="14" fill="none" stroke={Q.slate} strokeWidth={5} /><path d="M31 31l12 12" stroke={Q.slate} strokeWidth={6} strokeLinecap="round" /></svg>
                <span><Tx size={40} w={400}>{DEMO.search}</Tx><Tx size={40}>{' ' + s.slice(DEMO.search.length + 1)}</Tx></span>
              </div>
            ))}
          </Card>
        </div>
      )}
      <Tap at={S3.tapAt} x={420} y={855} />
      {t > S3.tapAt - 0.55 && <Cursor x={lerp(900, 420, mk)} y={lerp(1400, 855, mk)} press={press} />}
      {kb > 0 && <Abs x={850} y={1260 + 14 * Math.sin(t * 2.4)} transform={`rotate(${-12 + 6 * Math.sin(t * 2)}deg) scale(${eb(P(t, S3.barAt + 0.3, 0.5), 2)})`}><Magnifier size={250} /></Abs>}
      {kb > 0 && <Abs x={220} y={1290 + 12 * Math.sin(t * 2.8 + 1)} transform={`scale(${eb(P(t, S3.barAt + 0.45, 0.5), 2.2)})`}><Pin size={140} color={Q.pink} /></Abs>}
    </>
  );
};

// 4 · customers only pick from the top 3
const LIST = [
  {name: 'Style Studio', r: 4.9, c: 412, hue: Q.pink},
  {name: 'Looks Lounge', r: 4.8, c: 287, hue: '#FF8A3D'},
  {name: 'Glow Salon', r: 4.7, c: 196, hue: Q.blue},
  {name: 'Hair Hub', r: 4.1, c: 18, hue: Q.green},
  {name: 'Trendz', r: 3.9, c: 9, hue: Q.yellow},
  {name: 'Cut & Curl', r: 3.6, c: 4, hue: Q.purple},
];
const ROW = 148, TOP = 540;
export const Top3 = () => {
  const t = useT();
  const kt = P(t, S4.top3At, 0.45);
  const dim = eo(P(t, S4.top3At + 0.15, 0.45));
  return (
    <>
      <Line text={S4.l1[0]} at={S4.l1[1]} y={300} size={84} />
      <Line text={S4.l2[0]} at={S4.l2[1]} y={420} size={112} color={Q.green} mark={MARK} />
      {LIST.map((l, i) => {
        const k = eo(P(t, S4.listAt + i * 0.08, 0.45));
        if (k <= 0) return null;
        const low = i >= 3;
        return (
          <div key={l.name} style={{position: 'absolute', left: 90 + 200 * (1 - k) + (low ? 20 * dim : 0), top: TOP + i * ROW, opacity: k * (low ? 1 - 0.65 * dim : 1), filter: low ? `grayscale(${dim})` : undefined,
            transform: `scale(${!low && kt > 0 ? 1 + 0.03 * Math.sin(Math.PI * P(t, S4.top3At + i * 0.08, 0.35)) : 1})`}}>
            <Listing rank={i + 1} name={l.name} rating={l.r} count={l.c} hue={l.hue} badge={!low && t > S4.top3At + 0.1 + i * 0.08} />
          </div>
        );
      })}
      {kt > 0 && (
        <div style={{position: 'absolute', left: 66, top: TOP - 16, width: 948, height: 3 * ROW + 16, borderRadius: 46, border: `7px solid ${Q.green}`, boxShadow: `0 0 40px ${Q.green}55`,
          opacity: eo(kt), transform: `scale(${lerp(1.08, 1, eo(kt))})`}} />
      )}
      {kt > 0 && (
        <Abs x={900} y={TOP - 16} transform={`rotate(6deg) scale(${eb(kt, 2.4)})`}>
          <div style={{position: 'relative', padding: '12px 34px', borderRadius: 999, background: `linear-gradient(180deg, #34D27A, ${Q.green})`, boxShadow: `0 14px 36px ${Q.green}77`, overflow: 'hidden'}}>
            <Tx size={44} color="#fff">TOP 3</Tx><Gloss />
          </div>
        </Abs>
      )}
    </>
  );
};

// 5 · the biggest factor? Reviews.
const CHIPS: [number, number][] = [[300, 700], [780, 700], [300, 935], [780, 935]];
const CHIP_C = [Q.blue, Q.green, Q.star, Q.pink];
export const Factor = () => {
  const t = useT();
  const pick = t >= S5.pickAt;
  const hi = pick ? 2 : Math.floor(Math.max(0, t - S5.chipsAt - 0.3) * 9) % 4;
  const pk = eio(P(t, S5.pickAt, 0.5));
  const kr = P(t, S5.pickAt + 0.2, 0.4);
  const count = Math.round(S5.count * eo(P(t, S5.pickAt + 0.2, 0.5)));
  return (
    <>
      <Line text={S5.l1[0]} at={S5.l1[1]} y={300} size={92} />
      <Line text={S5.l2[0]} at={S5.l2[1]} y={425} size={100} color={Q.purple} mark={MARK} />
      {S5.factors.map((f, i) => {
        const k = P(t, S5.chipsAt + i * 0.08, 0.4);
        if (k <= 0) return null;
        const me = i === 2;
        const [cx, cy] = CHIPS[i];
        const x = me ? lerp(cx, 540, pk) : cx, y = me ? lerp(cy, 960, pk) : cy;
        const s = eb(k, 2) * (me ? lerp(1, 1.45, pk) : 1 - 0.4 * pk) * (hi === i ? 1.06 : 1);
        return (
          <Abs key={f} x={x} y={y} transform={`scale(${s})`} opacity={me ? 1 : 1 - pk}>
            <Card w={420} h={180} r={40} border={hi === i ? Q.purple : Q.line} style={{borderWidth: hi === i ? 6 : 2, display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px'}}>
              <div style={{position: 'relative', width: 116, height: 116, borderRadius: 32, background: `linear-gradient(145deg, ${CHIP_C[i]}, ${CHIP_C[i]}bb)`, boxShadow: `0 12px 28px ${CHIP_C[i]}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                <FactorGlyph name={f} size={74} /><Gloss />
              </div>
              <Tx size={46}>{f}</Tx>
            </Card>
          </Abs>
        );
      })}
      <Twinkle at={S5.pickAt + 0.2} x={540} y={960} r={520} n={18} />
      {kr > 0 && (
        <Abs x={540} y={1290} transform={`scale(${eb(kr, 2)})`} opacity={eo(kr)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <Tx size={120}>{S5.rating.toFixed(1)}</Tx>
            <div><Stars n={5 * eo(P(t, S5.pickAt + 0.3, 0.4))} size={72} /><br /><Tx size={38} color={Q.slate} w={400}>{count} reviews</Tx></div>
          </div>
        </Abs>
      )}
    </>
  );
};

// 6 · asking doesn't bring reviews → MagicQR does
const MINI: [number, number, number][] = [[205, 820, -8], [875, 850, 7], [195, 1250, 6], [885, 1230, -6]];
export const Ask = () => {
  const t = useT();
  const out = eio(P(t, S6.swapAt, 0.35));
  const ka = P(t, S6.ask[1], 0.4);
  const kr = P(t, S6.reply[1], 0.4);
  const walk = eio(P(t, S6.reply[1] + 0.45, 0.7));
  const kx = P(t, S6.crossAt, 0.4);
  const ks = P(t, S6.swapAt + 0.05, 0.55);
  return (
    <>
      {out < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `scale(${lerp(1, 0.9, out)})`, transformOrigin: '540px 960px'}}>
          <Line text={S6.l1[0]} at={S6.l1[1]} y={320} size={90} />
          <Line text={S6.l2[0]} at={S6.l2[1]} y={445} size={112} color={Q.red} mark={MARK} />
          <Abs x={260} y={1030 + 6 * Math.sin(t * 3)} transform={`scale(${eb(P(t, 0.05, 0.4), 1.8)})`}><Person size={240} color={Q.purple} /></Abs>
          <Abs x={260} y={1185}><Tx size={34} color={Q.slate}>Owner</Tx></Abs>
          {ka > 0 && (
            <Abs x={470} y={720} transform={`scale(${eb(ka, 2)})`}>
              <Card r={40} style={{padding: '22px 36px', position: 'relative'}}><Tx size={42}>{S6.ask[0]}</Tx>
                <div style={{position: 'absolute', left: 90, bottom: -22, width: 40, height: 40, background: '#fff', transform: 'rotate(45deg)', borderRight: `2px solid ${Q.line}`, borderBottom: `2px solid ${Q.line}`}} />
              </Card>
            </Abs>
          )}
          <Abs x={800 + 420 * walk} y={1060 + 14 * Math.abs(Math.sin(t * 10)) * walk} transform={`scale(${eb(P(t, 0.15, 0.4), 1.8)}) rotate(${walk * 8}deg)`} opacity={1 - walk}><Person size={210} color={Q.pink} /></Abs>
          {kr > 0 && (
            <Abs x={760 + 300 * walk} y={1290} transform={`scale(${eb(kr, 2)})`} opacity={1 - walk}>
              <Card r={40} style={{padding: '18px 34px'}}><Tx size={40} color={Q.slate}>{S6.reply[0]}</Tx></Card>
            </Abs>
          )}
          {kx > 0 && (
            <Abs x={540} y={1400} transform={`rotate(-4deg) scale(${lerp(1.8, 1, eo(kx))})`} opacity={eo(Math.min(1, kx * 2))}>
              <Card r={34} border={Q.red} style={{borderWidth: 5, padding: '16px 44px'}}><Tx size={52} color={Q.red}>0 new reviews</Tx></Card>
            </Abs>
          )}
        </div>
      )}
      {ks > 0 && (<>
        <Line text={S6.l3[0]} at={S6.l3[1]} y={320} size={112} color={Q.purple} />
        <Line text={S6.l4[0]} at={S6.l4[1]} y={465} size={120} color={Q.pink} mark={MARK} />
        <Twinkle at={S6.swapAt + 0.1} x={540} y={1030} r={560} n={18} />
        <Abs x={540} y={1040 + 8 * Math.sin(t * 3)} transform={`scale(${eb(ks, 1.8)}) rotate(${-2 + 2 * Math.sin(t * 2)}deg)`} opacity={eo(ks)}><StandImg w={620} /></Abs>
        {MINI.map(([x, y, r], i) => {
          const k = P(t, S6.swapAt + 0.55 + i * 0.16, 0.45);
          return k > 0 ? (
            <Abs key={i} x={x} y={y + 8 * Math.sin(t * 2.6 + i)} transform={`rotate(${r}deg) scale(${eb(k, 2)})`} opacity={eo(k)}>
              <Card r={26} style={{padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14}}>
                <Person size={58} color={PEOPLE[i]} /><Stars n={5} size={30} gap={2} />
              </Card>
            </Abs>
          ) : null;
        })}
      </>)}
    </>
  );
};
