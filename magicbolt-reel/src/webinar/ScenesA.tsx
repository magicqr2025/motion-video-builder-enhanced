// The two scenes without the city: 1 Hook and 7 CTA
import React from 'react';
import {Img, staticFile} from 'remotion';
import {Abs, useT, P, eo, eio, eb, lerp} from '../components/kit';
import {ART, S1, S7, W} from './config';
import {Big, Burst, FlashW, Gloss, Line, Pop, Rays, Shake, Sparkle, Tap, Tx} from './kit';
import {Crown, Cursor, Ico, LogoCard, Profile, Ticket} from './ui';

// 1 · "AI aapki job nahi lega… Toh aap boss baniye."
export const Hook: React.FC = () => {
  const t = useT();
  const up = eio(P(t, S1.cardsAt - 0.15, 0.55)); // headline shrinks to the top to make room for the cards
  const boss = t >= S1.bossAt;
  const sw = P(t, S1.swapAt, 0.5), swapped = t >= S1.swapAt;
  const kb = P(t, S1.bossAt, 0.5);
  // the "JOB" token flies from the left card to the right one
  const jx = lerp(290, 790, eio(sw)), jy = 1330 - 150 * Math.sin(Math.PI * sw);
  return (
    <Shake cues={[S1.swapAt + 0.3, S1.bossAt]}>
      {!boss && (
        <>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${-330 * up}px) scale(${lerp(1, 0.58, up)})`, transformOrigin: '540px 700px'}}>
            <Pop at={0.25} x={840} y={330} rot={8} from={[120, -60]}>
              <div style={{width: 270, height: 270, borderRadius: 76, position: 'relative', overflow: 'hidden', border: '10px solid #fff', boxSizing: 'border-box', transform: `translateY(${10 * Math.sin(t * 2.4)}px)`,
                background: `linear-gradient(150deg, #B893FF, ${W.purple} 45%, ${W.pink})`, boxShadow: `0 12px 0 #4420B8, 0 34px 60px ${W.purple}88, inset 0 6px 12px rgba(255,255,255,0.6)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{position: 'absolute', left: '6%', right: '6%', top: '4%', height: '44%', borderRadius: '60px 60px 50% 50%', background: 'linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0))'}} />
                <div style={{position: 'relative', width: 150, height: 104}}>
                  <Sparkle size={104} color="#fff" style={{position: 'absolute', left: 10, top: 0, transform: `rotate(${t * 40}deg) scale(${0.88 + 0.12 * Math.sin(t * 4)})`, filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.9))'}} />
                  <Sparkle size={46} color={W.yellow} style={{position: 'absolute', right: 0, top: -4, transform: `rotate(${-t * 60}deg) scale(${0.8 + 0.2 * Math.sin(t * 5 + 1)})`, filter: `drop-shadow(0 0 10px ${W.yellow})`}} />
                </div>
                <Tx size={96} color="#fff" style={{position: 'relative', lineHeight: 1, textShadow: '0 5px 0 rgba(40,10,120,0.35)'}}>AI</Tx>
              </div>
            </Pop>
            <Line text={S1.l1[0]} at={S1.l1[1]} y={520} size={124} />
            <Pop at={S1.big[1]} x={540} y={715} rot={-3}><Big size={300} g={[W.pink, W.orange]} style={{filter: `drop-shadow(0 16px 0 ${W.ink}18)`}}>{S1.big[0]}</Big></Pop>
            <Line text={S1.l2[0]} at={S1.l2[1]} y={915} size={124} mark={W.yellow} />
          </div>
          <Line text={S1.line[0]} at={S1.line[1]} y={740} size={56} color={W.slate} />
          <Pop at={S1.cardsAt} x={290} y={1040} from={[-200, 0]} rot={swapped ? -7 * eo(sw) : 0} s={swapped ? lerp(1, 0.9, eo(sw)) : 1}>
            <Profile tag={S1.left.tag} status={swapped ? S1.left.after : S1.left.before} state={swapped ? 'lose' : 'idle'} />
          </Pop>
          <Pop at={S1.cardsAt + 0.15} x={790} y={1040} from={[200, 0]} s={swapped ? lerp(1, 1.08, eb(sw, 3)) : 1}>
            <Profile ai tag={S1.right.tag} status={swapped ? S1.right.after : S1.right.before} state={swapped ? 'win' : 'idle'} />
          </Pop>
          <Pop at={S1.cardsAt + 0.5} x={jx} y={jy} rot={sw * 360}>
            <Gloss c={W.yellow} c2={W.orange} r={30} style={{padding: '14px 30px', gap: 14, border: '5px solid #fff'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Ico name="case" size={46} color={W.ink} /><Tx size={46} color={W.ink}>JOB</Tx></div>
            </Gloss>
          </Pop>
          <Burst at={S1.swapAt + 0.3} x={790} y={1040} r={360} n={14} />
          <Line text={S1.line2[0]} at={S1.line2[1]} y={1420} size={64} color={W.pink} />
        </>
      )}
      {boss && (
        <>
          <Rays x={540} y={900} r={1100} c={W.yellow} a={eo(kb)} />
          <Line text={S1.boss[0]} at={S1.bossAt} y={570} size={110} />
          <Abs x={540} y={900} transform={`scale(${eb(kb, 2.6)}) rotate(${-4 + 4 * eo(kb)}deg)`}>
            <Big size={470} g={['#FFD84A', W.orange, W.pink]} style={{filter: `drop-shadow(0 18px 0 ${W.ink}) drop-shadow(0 40px 50px ${W.orange}88)`}}>{S1.boss[1]}</Big>
          </Abs>
          <Pop at={S1.bossAt + 0.25} x={290} y={650} rot={-20} from={[0, -200]}><Crown size={230} /></Pop>
          <Line text={S1.boss[2]} at={S1.bossAt + 0.3} y={1215} size={150} mark={`${W.cyan}aa`} />
          <Burst at={S1.bossAt + 0.05} x={540} y={900} r={620} n={22} />
        </>
      )}
      <FlashW at={S1.bossAt - 0.05} />
    </Shake>
  );
};

// 7 · "Toh phir kya soch rahe hain?… Join kijiye hamara free webinar."
export const Cta: React.FC = () => {
  const t = useT();
  const kq = P(t, 0.3, 0.6);
  const bx = 540, by = 1330;
  const tap = P(t, S7.tapAt, 0.3);
  const press = 1 - 0.07 * Math.sin(Math.PI * tap);
  const pulse = t > S7.buttonAt + 0.6 ? 1 + 0.025 * Math.sin((t - S7.buttonAt) * 7) : 1;
  const kc = eo(P(t, S7.tapAt - 0.9, 0.8)); // cursor glides in
  return (
    <Shake cues={[S7.b2[1] + 0.1]} amp={12}>
      {/* question */}
      {t < S7.bigAt + 0.3 && (
        <>
          {[[220, 420, 300, -14, W.purple], [880, 900, 240, 12, W.pink], [200, 1180, 190, 8, W.orange]].map(([x, y, s, r, c], i) => (
            <Abs key={i} x={x as number} y={(y as number) + 16 * Math.sin(t * 2 + i)} transform={`rotate(${r}deg) scale(${eb(kq, 2.2)})`} opacity={0.3 * (1 - P(t, S7.bigAt - 0.1, 0.25))}>
              <Big size={s as number} g={[c as string, W.yellow]}>?</Big>
            </Abs>
          ))}
          <Line text={S7.q1[0]} at={S7.q1[1]} out={S7.bigAt - 0.1} y={680} size={112} />
          <Line text={S7.q2[0]} at={S7.q2[1]} out={S7.bigAt - 0.1} y={830} size={112} g={[W.purple, W.pink]} />
        </>
      )}
      {/* answer */}
      <Pop at={S7.logoAt} x={540} y={205} from={[0, -80]}><LogoCard w={470} sweepAt={S7.logoAt + 0.5} /></Pop>
      <Line text={S7.b1[0]} at={S7.b1[1]} y={410} size={84} />
      {t >= S7.b2[1] && <Rays x={540} y={585} r={620} c={W.pink} a={0.5 * eo(P(t, S7.b2[1], 0.5))} />}
      <Line text={S7.b2[0]} at={S7.b2[1]} y={585} size={230} big g={[W.purple, W.pink, W.orange]} />
      <Line text={S7.b3[0]} at={S7.b3[1]} y={770} size={100} mark={W.yellow} />
      <Burst at={S7.b2[1] + 0.1} x={540} y={585} r={520} />
      <Pop at={S7.ticketAt} x={540} y={1020} from={[0, 140]} rot={-2}>
        <Ticket {...S7.ticket} art={ART.growth} />
      </Pop>
      {/* button */}
      <Pop at={S7.buttonAt} x={bx} y={by} s={press * pulse}>
        <Gloss c={W.purple} c2={W.pink} r={70} style={{padding: '30px 60px', border: '6px solid #fff', boxShadow: `0 0 0 ${14 + 10 * Math.sin(t * 7)}px ${W.pink}33, 0 26px 50px ${W.purple}77`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Tx size={62} color="#fff">{S7.button}</Tx><Ico name="arrow" size={54} /></div>
        </Gloss>
      </Pop>
      <Tap at={S7.tapAt + 0.12} x={bx + 250} y={by + 10} color={W.yellow} />
      <Burst at={S7.tapAt + 0.15} x={bx} y={by} r={460} n={16} />
      {kc > 0 && <Abs x={lerp(1000, bx + 270, kc)} y={lerp(1720, by + 50, kc)} transform={`scale(${1 - 0.14 * Math.sin(Math.PI * tap)})`}><Cursor size={110} /></Abs>}
      {[[130, 560, 64, W.yellow], [960, 640, 50, W.cyan], [930, 1190, 58, W.yellow]].map(([x, y, s, c], i) => (
        <Abs key={i} x={x as number} y={y as number} transform={`rotate(${t * 60 + i * 40}deg) scale(${t > S7.bigAt ? 0.7 + 0.4 * Math.sin(t * 4 + i * 2) : 0})`}><Sparkle size={s as number} color={c as string} /></Abs>
      ))}
    </Shake>
  );
};
