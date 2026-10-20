// Services list — each card enters exactly when the VO says it
import {C, S4} from '../config';
import {Card, Glow, Txt, Words, useT, P, eo, eb} from '../components/kit';
import {Check, IconTile} from '../components/graphics';

const SPARKS = [
  {x: 960, y: 1250, s: 40, c: C.violet},
  {x: 120, y: 1300, s: 30, c: C.pink},
  {x: 900, y: 1440, s: 26, c: C.amber},
];

export const Scene4 = () => {
  const t = useT();
  const [y0, h, gap, x, w] = [430, 172, 30, 70, 940];
  const active = S4.services.reduce((acc, s, i) => (t >= s.at ? i : acc), -1);
  const sp = P(t, S4.services[S4.services.length - 1].at + 0.05, 0.8);
  return (
    <>
      <Words items={S4.heading} y={300} size={76} />
      {S4.services.map((s, i) => {
        const k = P(t, s.at, 0.55);
        if (k <= 0) return null;
        const hl = i === active;
        const a = eo(Math.min(1, k * 1.5));
        const ck = P(t, s.at + 0.35, 0.4);
        const sc = hl ? 1 + 0.025 * eo(P(t, s.at, 0.4)) : 1;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y0 + i * (h + gap), width: w, height: h, opacity: a,
            transform: `translateX(${(1 - eo(k)) * 700}px) rotate(${(1 - eo(k)) * 4.6}deg) scale(${sc})`}}>
            {hl && <Glow x={w / 2} y={h / 2 + 20} rx={520} ry={140} c1={s.color} c2={s.color} a={0.5} />}
            <Card w={w} h={h} r={42} border={`${hl ? 4 : 2}px solid ${s.color}${hl ? 'F2' : '2E'}`}
              style={{position: 'relative', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 30}}>
              <IconTile name={s.icon} size={112} color={s.color} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0}}>
                <Txt size={s.title.length > 24 ? 40 : 42}>{s.title}</Txt>
                <Txt size={30} color={C.slate} bold={false}>{s.sub}</Txt>
              </div>
              <div style={{transform: `scale(${ck > 0 ? eb(ck, 2.5) : 0})`, marginRight: 4}}><Check size={60} /></div>
            </Card>
          </div>
        );
      })}
      {sp > 0 && SPARKS.map((p, j) => (
        <svg key={j} width={p.s * 2.4} height={p.s * 2.4} viewBox="0 0 100 100"
          style={{position: 'absolute', left: p.x - p.s * 1.2, top: p.y - p.s * 1.2,
            transform: `rotate(${(t * 1.5 + j) * 57}deg) scale(${eb(Math.min(1, sp * 1.3)) * (0.8 + 0.2 * Math.sin(t * 6 + j))})`}}>
          <polygon points="50,0 60,40 100,50 60,60 50,100 40,60 0,50 40,40" fill={p.c} />
        </svg>
      ))}
    </>
  );
};
