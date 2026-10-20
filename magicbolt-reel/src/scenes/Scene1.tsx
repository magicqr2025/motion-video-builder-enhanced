// "Want to start your own business? But don't know what to start?"
import {C, S1} from '../config';
import {Abs, Card, Pop, Txt, Words, useT, P, eo, eb, eio} from '../components/kit';

export const Scene1 = () => {
  const t = useT();
  const up = eio(P(t, 1.55, 0.5)) * 170;
  const q = P(t, 2.0, 0.6);
  return (
    <>
      {q > 0 && (<>
        <Abs x={860} y={760 + 14 * Math.sin(t * 2)} transform={`rotate(10deg) scale(${eb(q)})`} opacity={0.22 * eo(q)}><Txt size={260} g={[C.orange, C.pink]}>?</Txt></Abs>
        <Abs x={190} y={820 + 14 * Math.sin(t * 2 + 1)} transform={`rotate(-11deg) scale(${eb(q)})`} opacity={0.22 * eo(q)}><Txt size={180} g={[C.blue, C.cyan]}>?</Txt></Abs>
      </>)}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-up}px)`}}>
        <Words items={S1.line1} y={640} size={104} />
        <Words items={S1.line2} y={770} size={104} />
        <Pop at={S1.big[1]} x={540} y={920} rise={70}><Txt size={150} g={[C.blue, C.violet, C.pink]}>{S1.big[0]}</Txt></Pop>
      </div>
      <Words items={S1.sub1} y={990} size={64} color={C.slate} />
      <Words items={S1.sub2} y={1080} size={64} color={C.slate} />
      {S1.chips.map((ch, i) => {
        const k = P(t, ch.at, 0.5);
        if (k <= 0) return null;
        return (
          <Abs key={i} x={ch.x} y={ch.y + 12 * Math.sin(t * 2.4 + ch.x)} transform={`rotate(${ch.rot}rad) scale(${eb(k, 2.2)})`} opacity={eo(k)}>
            <Card r={48} border={`4px solid ${ch.color}`} style={{padding: '18px 35px'}}><Txt size={44} color={ch.color}>{ch.text}</Txt></Card>
          </Abs>
        );
      })}
    </>
  );
};
