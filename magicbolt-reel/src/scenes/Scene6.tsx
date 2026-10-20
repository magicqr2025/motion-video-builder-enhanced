// "Sell software and services together without building the technology yourself"
import {C, S6} from '../config';
import {Abs, Card, Pop, Txt, Words, useT, P, eo, eb, eio, lerp} from '../components/kit';
import {IconTile} from '../components/graphics';

export const Scene6 = () => {
  const t = useT();
  const together = eio(P(t, S6.togetherAt, 0.5));
  const kp = P(t, S6.plusAt, 0.4);
  const kn = P(t, S6.noTechAt, 0.5);
  const sk = eo(P(t, S6.strikeAt, 0.35));
  const sides = [
    {side: -1, ...S6.software, color: C.blue, icon: 'dash' as const},
    {side: 1, ...S6.services, color: C.pink, icon: 'people' as const},
  ];
  return (
    <>
      <Words items={S6.line1} y={300} size={78} />
      <Words items={S6.line2} y={395} size={78} g={[C.pink, C.orange]} />
      {sides.map((s) => {
        const k = P(t, s.at, 0.55);
        if (k <= 0) return null;
        const x = 540 + s.side * (235 - 20 * together) + s.side * (1 - eo(k)) * 600;
        return (
          <Abs key={s.title} x={x} y={760} transform={`rotate(${s.side * 2.9 * (1 - together)}deg)`} opacity={eo(Math.min(1, k * 1.5))}>
            <Card w={400} h={400} r={48} border={`4px solid ${s.color}`} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 50, gap: 22}}>
              <IconTile name={s.icon} size={150} color={s.color} radius={40} />
              <Txt size={52}>{s.title}</Txt>
              <Txt size={30} color={C.slate} bold={false} style={{marginTop: -12}}>{s.sub}</Txt>
            </Card>
          </Abs>
        );
      })}
      {kp > 0 && (
        <Abs x={540} y={760} transform={`scale(${eb(kp, 2.5) * (1 + 0.15 * together)})`}>
          <div style={{width: 100, height: 100, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={50} height={50} viewBox="0 0 50 50"><path d="M5 25h40M25 5v40" stroke="#fff" strokeWidth={10} strokeLinecap="round" /></svg>
          </div>
        </Abs>
      )}
      {kn > 0 && (
        <div style={{position: 'absolute', left: 110, top: 1050, opacity: eo(kn), transform: `translateY(${60 * (1 - eo(kn))}px)`}}>
          <Card w={860} h={260} r={48} style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
            <div style={{width: 320, textAlign: 'center', position: 'relative'}}>
              <Txt size={110} color={C.slate}>{'</>'}</Txt>
              <svg width={320} height={260} style={{position: 'absolute', left: 0, top: -60}}>
                {sk > 0 && <line x1={70} y1={190} x2={lerp(70, 250, sk)} y2={lerp(190, 70, sk)} stroke={C.red} strokeWidth={12} strokeLinecap="round" />}
              </svg>
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <Txt size={52}>{S6.noCode}</Txt>
              <Txt size={52} style={{opacity: eo(P(t, S6.noDev[1], 0.4))}}>{S6.noDev[0]}</Txt>
            </div>
          </Card>
        </div>
      )}
      <Pop at={S6.tagline[1]} x={540} y={1430}><Txt size={44} color={C.violet}>{S6.tagline[0]}</Txt></Pop>
    </>
  );
};
