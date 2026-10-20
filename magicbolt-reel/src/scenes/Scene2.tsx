// "What if you could start your own digital marketing business" — typing prompt bar
import {BG, C, S2} from '../config';
import {Card, Glow, Pop, Txt, useT, P, eo, eio, lerp} from '../components/kit';
import {Cursor} from '../components/graphics';

export const Scene2 = () => {
  const t = useT();
  const k = P(t, 3.35, 0.6);
  const [bx, by, bw, bh] = [80, 820, 920, 360];
  const full = S2.typed.join('\n');
  const typing = P(t, S2.typeStart, S2.typeDur);
  const typed = full.slice(0, Math.floor(full.length * typing));
  const [l1, l2] = typed.split('\n');
  const caretOn = typing < 1 || Math.floor(t * 2.4) % 2 === 0;
  const press = Math.sin(Math.PI * P(t, S2.click, 0.22));
  const sbx = bx + bw - 90, sby = by + bh - 70;
  const rk = P(t, S2.click + 0.06, 0.6);
  const mk = eio(P(t, 4.9, 0.7));
  return (
    <>
      <Pop at={S2.heading[1]} x={540} y={660}><Txt size={70} bold={false}>{S2.heading[0]}</Txt></Pop>
      <Glow x={540} y={by + bh + 20} rx={620} ry={260} c1={C.blue} c2={C.violet} a={eo(k)} />
      <div style={{position: 'absolute', left: bx, top: by, opacity: eo(k), transform: `translateY(${80 * (1 - eo(k))}px)`}}>
        <Card w={bw} h={bh} r={56} border={`2px solid ${BG.line}`} style={{position: 'relative', padding: '58px 64px'}}>
          <div style={{lineHeight: 1}}>
            <Txt size={54} bold={false}>{l1}{l2 === undefined && caretOn ? <Caret /> : null}</Txt><br />
            {l2 !== undefined && <Txt size={54} bold={false} style={{marginTop: 14}}>{l2}{caretOn ? <Caret /> : null}</Txt>}
          </div>
          <div style={{position: 'absolute', left: 58, bottom: 44}}><Txt size={64} color={C.slate} bold={false}>+</Txt></div>
          <div style={{position: 'absolute', right: 170, bottom: 56}}><Txt size={32} color={C.slate} bold={false}>{S2.hint}</Txt></div>
          {rk > 0 && rk < 1 && (
            <div style={{position: 'absolute', left: sbx - bx - (46 + 120 * eo(rk)), top: sby - by - (46 + 120 * eo(rk)), width: 2 * (46 + 120 * eo(rk)), height: 2 * (46 + 120 * eo(rk)),
              borderRadius: '50%', border: `6px solid ${C.blue}`, opacity: 0.5 * (1 - rk), boxSizing: 'border-box'}} />
          )}
          <div style={{position: 'absolute', left: sbx - bx - 46, top: sby - by - 46, width: 92, height: 92, borderRadius: '50%', transform: `scale(${1 - 0.12 * press})`,
            background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={44} height={44} viewBox="0 0 44 44"><path d="M22 38V6M7 21L22 6l15 15" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </Card>
      </div>
      {t > 4.6 && <Cursor x={lerp(980, sbx - 4, mk)} y={lerp(1500, sby - 4, mk)} press={press} />}
    </>
  );
};

const Caret = () => <span style={{display: 'inline-block', width: 4, height: 62, background: C.blue, marginLeft: 6, verticalAlign: 'middle'}} />;
