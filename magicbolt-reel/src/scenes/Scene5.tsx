// "Get local businesses as clients and build your own digital marketing company in your city"
import {C, S5} from '../config';
import {Abs, Card, Pop, Txt, Words, useT, P, eo, eb, lerp} from '../components/kit';
import {Icon} from '../components/graphics';

export const Scene5 = () => {
  const t = useT();
  const [hx, hy, R] = [540, 860, 330];
  const nodes = S5.clients.map((c, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / S5.clients.length;
    return {...c, x: hx + R * Math.cos(ang) * 1.05, y: hy + R * Math.sin(ang) * 0.95, at: S5.clientsStart + i * S5.clientsGap};
  });
  const kh = P(t, S5.hubAt, 0.6);
  const kc = P(t, S5.city[1], 0.45);
  return (
    <>
      <Words items={S5.heading} y={290} size={70} />
      <Pop at={S5.heading2[1]} x={540} y={385}><Txt size={70} g={[C.blue, C.violet, C.pink]}>{S5.heading2[0]}</Txt></Pop>
      {/* connection lines */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {nodes.map((n, i) => {
          if (t < n.at) return null;
          const lk = eo(P(t, n.at + 0.15, 0.5));
          const fk = ((t - n.at) * 0.7) % 1;
          return (
            <g key={i}>
              <line x1={n.x} y1={n.y} x2={lerp(n.x, hx, lk)} y2={lerp(n.y, hy, lk)} stroke={n.color} strokeOpacity={0.6} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={t * 40} />
              {lk >= 1 && <circle cx={lerp(n.x, hx, fk)} cy={lerp(n.y, hy, fk)} r={10} fill={n.color} />}
            </g>
          );
        })}
        {kh > 0 && [0, 1, 2].map((j) => {
          const rk = ((t - S5.hubAt) * 0.6 + j / 3) % 1;
          return <circle key={j} cx={hx} cy={hy} r={130 + 140 * rk} fill="none" stroke={C.blue} strokeOpacity={0.25 * (1 - rk)} strokeWidth={4} />;
        })}
      </svg>
      {kh > 0 && (
        <Abs x={hx} y={hy} transform={`scale(${eb(kh, 2)})`}>
          <div style={{width: 260, height: 260, borderRadius: '50%', background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Txt size={42} color="#fff">YOUR</Txt><Txt size={42} color="#fff">AGENCY</Txt>
          </div>
        </Abs>
      )}
      {nodes.map((n, i) => {
        const k = P(t, n.at, 0.5);
        if (k <= 0) return null;
        return (
          <Abs key={i} x={n.x} y={n.y + 8 * Math.sin(t * 2 + i)} transform={`scale(${eb(k, 2.2)})`} opacity={eo(k)}>
            <Card r={42} border={`3px solid ${n.color}`} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 30px 14px 20px'}}>
              <div style={{width: 44, height: 44, borderRadius: '50%', background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Txt size={26} color="#fff">{n.name[0]}</Txt>
              </div>
              <Txt size={34}>{n.name}</Txt>
            </Card>
          </Abs>
        );
      })}
      <Pop at={S5.build[1]} x={540} y={1320}><Txt size={52} bold={false}>{S5.build[0]}</Txt></Pop>
      <Pop at={S5.company[1]} x={540} y={1400}><Txt size={60} g={[C.blue, C.violet]}>{S5.company[0]}</Txt></Pop>
      {kc > 0 && (
        <Abs x={540} y={1510} transform={`scale(${eb(kc, 2.2)})`} opacity={eo(kc)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '14px 40px 14px 20px', borderRadius: 999, background: `linear-gradient(90deg, ${C.orange}, ${C.pink})`}}>
            <Icon name="pin" size={60} tint={C.orange} />
            <Txt size={40} color="#fff">{S5.city[0]}</Txt>
          </div>
        </Abs>
      )}
    </>
  );
};
