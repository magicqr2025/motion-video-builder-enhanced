// "With MagicBolt, launch your own 100% white label digital marketing business"
import {C, S3} from '../config';
import {Abs, Pill, Pop, Txt, useT, P, eo, eb, lerp} from '../components/kit';
import {Logo} from '../components/graphics';

export const Scene3 = () => {
  const t = useT();
  const k = P(t, S3.percentAt, 0.62);
  const ks = P(t, S3.stamp[1], 0.4);
  return (
    <>
      <Pop at={S3.withAt} x={540} y={420}><Txt size={52} color={C.slate} bold={false}>With</Txt></Pop>
      <Abs x={540} y={560}><Logo at={S3.logoAt} size={96} /></Abs>
      <Pop at={S3.launch[1]} x={540} y={790}><Txt size={62}>{S3.launch[0]}</Txt></Pop>
      {k > 0 && (
        <Abs x={540} y={990} transform={`scale(${eb(P(t, S3.percentAt, 0.45), 1.8)})`}>
          <Txt size={250} g={[C.pink, C.orange, C.amber]}>{Math.round(100 * eo(k))}%</Txt>
        </Abs>
      )}
      {ks > 0 && (
        <Abs x={540} y={1170} transform={`scale(${lerp(1.6, 1, eo(ks))}) rotate(${-2.3 * eo(ks)}deg)`} opacity={eo(Math.min(1, ks * 2))}>
          <Pill size={62} padX={56} padY={26}>{S3.stamp[0]}</Pill>
        </Abs>
      )}
      <Pop at={S3.line[1]} x={540} y={1320}><Txt size={60} g={[C.blue, C.violet]}>{S3.line[0]}</Txt></Pop>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1450, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', gap: 22}}>
        {S3.chips.map((ch) => {
          const kc = P(t, ch.at, 0.45);
          return (
            <div key={ch.text} style={{opacity: eo(kc), transform: `scale(${kc > 0 ? eb(kc, 2) : 0})`}}>
              <Pill size={36} bg={ch.color} padX={32} padY={18}>{ch.text}</Pill>
            </div>
          );
        })}
      </div>
    </>
  );
};
