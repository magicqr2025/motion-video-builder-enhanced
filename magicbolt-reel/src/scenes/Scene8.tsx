// End card: "Launch your own digital marketing business with MagicBolt"
import {BRAND, C, S8} from '../config';
import {Abs, Glow, Pop, Txt, useT, P, eo, eb, eio, cl, lerp} from '../components/kit';
import {Cursor, Logo} from '../components/graphics';

const BURST = [C.yellow, C.pink, C.blue, C.green, C.orange, C.violet];

export const Scene8 = () => {
  const t = useT();
  const bk = P(t, S8.logoAt + 0.07, 1.1);
  const k = P(t, S8.ctaAt, 0.5);
  const pulse = 1 + 0.035 * Math.sin((t - S8.ctaAt) * 6) * cl((t - S8.ctaAt - 0.5) * 3);
  const mk = eio(P(t, S8.cursorAt, 0.6));
  const press = Math.sin(Math.PI * P(t, S8.cursorAt + 0.65, 0.22));
  return (
    <>
      <Pop at={S8.l1[1]} x={540} y={440}><Txt size={70}>{S8.l1[0]}</Txt></Pop>
      <Pop at={S8.l2[1]} x={540} y={560}><Txt size={96} g={[C.blue, C.violet, C.pink]}>{S8.l2[0]}</Txt></Pop>
      <Pop at={S8.l3[1]} x={540} y={680} rise={60}><Txt size={110} g={[C.pink, C.orange]}>{S8.l3[0]}</Txt></Pop>
      <Pop at={S8.withAt} x={540} y={830}><Txt size={46} color={C.slate} bold={false}>with</Txt></Pop>
      <Glow x={540} y={990} rx={520} ry={220} c1={C.violet} c2={C.blue} a={eo(P(t, S8.logoAt, 0.6))} />
      <Abs x={540} y={980}><Logo at={S8.logoAt} size={108} /></Abs>
      {bk > 0 && bk < 1 && Array.from({length: 18}, (_, i) => {
        const ang = (i * 2 * Math.PI) / 18 + 0.3;
        const r = 150 + 360 * eo(bk);
        const sz = 26 * (1 - bk);
        return (
          <Abs key={i} x={540 + r * Math.cos(ang)} y={980 + r * Math.sin(ang) * 0.7} transform={`rotate(${(ang + bk * 3) * 57}deg)`} opacity={1 - bk}>
            {i % 2
              ? <svg width={sz * 2} height={sz * 2} viewBox="0 0 100 100"><polygon points="50,0 60,40 100,50 60,60 50,100 40,60 0,50 40,40" fill={BURST[i % 6]} /></svg>
              : <div style={{width: sz, height: sz, borderRadius: '50%', background: BURST[i % 6]}} />}
          </Abs>
        );
      })}
      {k > 0 && (
        <Abs x={540} y={1230} transform={`scale(${eb(k, 2) * pulse})`} opacity={eo(k)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '34px 60px', borderRadius: 999, background: `linear-gradient(90deg, ${C.blue}, ${C.violet}, ${C.pink})`,
            boxShadow: '0 20px 40px rgba(123,63,242,0.35)'}}>
            <Txt size={46} color="#fff">{BRAND.cta}</Txt>
            <svg width={44} height={36} viewBox="0 0 44 36"><path d="M4 18h34M24 4l14 14-14 14" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </Abs>
      )}
      <Pop at={S8.urlAt} x={540} y={1370}><Txt size={40} color={C.slate} bold={false}>{BRAND.url}</Txt></Pop>
      {t > S8.cursorAt && <Cursor x={lerp(1000, 710, mk)} y={lerp(1600, 1245, mk)} press={press} />}
    </>
  );
};
