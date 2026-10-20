// Neon scenes 9–12: the offer and CTA
import {BRAND, S9, S10, S11, S12, N} from './config';
import {Abs, Pop, useT, P, eo, eb, eio, lerp} from '../components/kit';
import {B, Flash, Glass, H, Kin, M, Shake, Tag} from './kit';
import {Cursor, Logo} from './objects';

// 9 · three offer rows: NO lock-in, NO setup fee, cancel switch
export const Offer = () => {
  const t = useT();
  return (
    <Shake cues={S9.rows.map((r) => r.at + 0.1)} amp={10}>
      <Tag n="03" label="The offer" />
      <Kin text={S9.heading[0]} at={S9.heading[1]} y={370} size={112} accent={N.lime} />
      {S9.rows.map((r, i) => {
        const k = P(t, r.at, 0.45);
        if (k <= 0) return null;
        const on = eo(P(t, r.at + 0.25, 0.3));
        return (
          <div key={r.text} style={{position: 'absolute', left: 90, top: 520 + i * 240, opacity: eo(Math.min(1, k * 2)), transform: `translateX(${(1 - eb(k, 1.4)) * 320}px)`}}>
            <Glass w={900} h={200} r={44} glow={on > 0.5 ? N.lime : undefined} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '0 40px'}}>
              {r.no && <div style={{background: N.lime, borderRadius: 22, padding: '2px 28px', transform: `scale(${eb(P(t, r.at + 0.1, 0.35), 2.4)})`}}><H size={96} color={N.bg}>No</H></div>}
              <H size={r.no ? 112 : 100}>{r.text}</H>
              {!r.no && (
                <div style={{marginLeft: 'auto', width: 150, height: 84, borderRadius: 42, background: on > 0.5 ? N.lime : 'rgba(255,255,255,0.14)', boxShadow: on > 0.5 ? `0 0 40px ${N.lime}` : undefined, position: 'relative'}}>
                  <div style={{position: 'absolute', top: 10, left: 10 + 66 * on, width: 64, height: 64, borderRadius: '50%', background: on > 0.5 ? N.bg : '#fff'}} />
                </div>
              )}
            </Glass>
          </div>
        );
      })}
    </Shake>
  );
};

// 10 · a free-trial pass
export const Trial = () => {
  const t = useT();
  const kt = P(t, S10.ticketAt, 0.55);
  const shine = P(t, S10.ticketAt + 0.5, 0.9);
  return (
    <>
      <Tag n="03" label="The offer" />
      <Kin text={S10.l1[0]} at={S10.l1[1]} y={340} size={90} color={N.dim} />
      <Kin text={S10.l2[0]} at={S10.l2[1]} y={460} size={132} color={N.lime} />
      {kt > 0 && (
        <Abs x={540} y={850} opacity={eo(kt)} transform={`perspective(1200px) rotateY(${14 * Math.sin(t * 1.8)}deg) rotate(-5deg) scale(${eb(kt, 1.8)})`}>
          <div style={{position: 'relative', width: 820, height: 370, borderRadius: 40, background: `linear-gradient(120deg, ${N.lime}, ${N.cyan})`, boxShadow: `0 0 90px ${N.lime}77, 0 40px 90px rgba(0,0,0,0.6)`, display: 'flex', overflow: 'hidden'}}>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 50}}>
              <M size={24} color={N.bg} w={800}>{BRAND.name} {BRAND.suffix} · trial pass</M>
              <H size={230} color={N.bg} style={{lineHeight: 1}}>Free</H>
            </div>
            <div style={{width: 210, borderLeft: `6px dashed ${N.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7}}>
              {[10, 4, 8, 3, 12, 5, 9, 4, 10].map((w, i) => <div key={i} style={{width: w, height: 230, background: N.bg}} />)}
            </div>
            {[-30, 340].map((y) => <div key={y} style={{position: 'absolute', left: 580, top: y, width: 60, height: 60, borderRadius: '50%', background: N.bg}} />)}
            {shine > 0 && shine < 1 && <div style={{position: 'absolute', top: -40, left: lerp(-300, 900, shine), width: 180, height: 460, background: 'rgba(255,255,255,0.55)', transform: 'skewX(-20deg)'}} />}
          </div>
        </Abs>
      )}
      <Pop at={S10.m1[1]} x={540} y={1180}><B size={62} color={N.dim}>{S10.m1[0]}</B></Pop>
      <Kin text={S10.m2[0]} at={S10.m2[1]} y={1300} size={124} color={N.cyan} />
    </>
  );
};

// 11 · risk gauge drops to zero
export const Risk = () => {
  const t = useT();
  const kg = eo(P(t, S11.gaugeAt, 0.5));
  const drop = eb(P(t, S11.zeroAt, 0.5), 1.4);
  const v = lerp(0.82 + 0.05 * Math.sin(t * 11), 0, drop); // 1 = max risk, 0 = none
  const th = Math.PI * (1 - v);
  const [cx, cy, R] = [450, 440, 360];
  const zero = t >= S11.zeroAt + 0.2;
  return (
    <Shake cues={[S11.zeroAt + 0.2]} amp={26}>
      <Tag n="03" label="The offer" />
      <Kin text={S11.q[0]} at={S11.q[1]} y={410} size={230} />
      <Flash at={S11.zeroAt + 0.2} x={540} y={1000} r={900} />
      <Abs x={540} y={900 + 60 * (1 - kg)} opacity={kg}>
        <svg width={900} height={520} viewBox="0 0 900 520">
          <defs><linearGradient id="riskG" x1="0" x2="1"><stop offset="0" stopColor={N.lime} /><stop offset="0.55" stopColor={N.amber} /><stop offset="1" stopColor={N.red} /></linearGradient></defs>
          <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={64} strokeLinecap="round" />
          <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="url(#riskG)" strokeWidth={44} strokeLinecap="round" />
          {Array.from({length: 11}, (_, i) => {
            const a = Math.PI * (1 - i / 10);
            return <line key={i} x1={cx + (R - 60) * Math.cos(a)} y1={cy - (R - 60) * Math.sin(a)} x2={cx + (R - 90) * Math.cos(a)} y2={cy - (R - 90) * Math.sin(a)} stroke={N.dim} strokeWidth={5} strokeLinecap="round" />;
          })}
          <line x1={cx} y1={cy} x2={cx + 290 * Math.cos(th)} y2={cy - 290 * Math.sin(th)} stroke="#fff" strokeWidth={16} strokeLinecap="round" style={{filter: `drop-shadow(0 0 16px ${zero ? N.lime : N.red})`}} />
          <circle cx={cx} cy={cy} r={38} fill={zero ? N.lime : N.red} stroke={N.bg} strokeWidth={10} />
        </svg>
      </Abs>
      <Abs x={170} y={1190} opacity={kg}><M size={32} color={N.lime} w={700}>0</M></Abs>
      <Abs x={910} y={1190} opacity={kg}><M size={32} color={N.red} w={700}>100</M></Abs>
      <Kin text={S11.a[0]} at={S11.a[1]} y={1350} size={250} color={N.lime} />
    </Shake>
  );
};

// 12 · CTA
export const Cta = () => {
  const t = useT();
  const kl = P(t, S12.logoAt, 0.5);
  const ku = P(t, S12.urlAt, 0.5);
  const mk = eio(P(t, S12.urlAt + 0.15, 0.6));
  const press = Math.sin(Math.PI * P(t, S12.clickAt, 0.22));
  const rip = P(t, S12.clickAt + 0.08, 0.5);
  const [bw, bh] = [760, 120];
  return (
    <>
      <Tag n="04" label="Start" />
      <Kin text={S12.l1[0]} at={S12.l1[1]} y={380} size={120} />
      <Kin text={S12.big1[0]} at={S12.big1[1]} y={570} size={200} color={N.lime} />
      <Kin text={S12.big2[0]} at={S12.big2[1]} y={780} size={200} />
      <Kin text={S12.l3[0]} at={S12.l3[1]} y={960} size={120} color={N.cyan} />
      <Pop at={S12.withAt} x={540} y={1085}><M size={30}>with</M></Pop>
      <Flash at={S12.logoAt} x={540} y={1190} color={N.violet} r={520} />
      {kl > 0 && <Abs x={540} y={1190} transform={`scale(${eb(kl, 2)})`} opacity={eo(kl)}><Logo size={84} /></Abs>}
      {ku > 0 && (
        <Abs x={540} y={1380} opacity={eo(ku)} transform={`scale(${eb(ku, 1.8) * (1 - 0.05 * press)})`}>
          <div style={{position: 'relative', width: bw, height: bh, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, background: `${N.lime}1F`, borderRadius: 24}}>
            <svg width={bw} height={bh} style={{position: 'absolute', left: 0, top: 0}}>
              <rect x={3} y={3} width={bw - 6} height={bh - 6} rx={22} fill="none" stroke={N.lime} strokeWidth={5} strokeDasharray="22 14" strokeDashoffset={-t * 50} />
            </svg>
            <M size={46} color={N.lime} w={700} style={{textTransform: 'none', letterSpacing: 1}}>{BRAND.url}</M>
            <svg width={56} height={44} viewBox="0 0 76 60" style={{transform: `translateX(${6 * Math.sin(t * 7)}px)`}}>
              <path d="M6 30h58M42 8l24 22-24 22" stroke={N.lime} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {rip > 0 && rip < 1 && <div style={{position: 'absolute', left: bw / 2 - 60 - 400 * eo(rip), top: bh / 2 - 60 - 400 * eo(rip), width: 120 + 800 * eo(rip), height: 120 + 800 * eo(rip), borderRadius: '50%', border: `5px solid ${N.lime}`, opacity: 1 - rip, boxSizing: 'border-box'}} />}
          </div>
        </Abs>
      )}
      {t > S12.urlAt + 0.15 && <Cursor x={lerp(1000, 760, mk)} y={lerp(1640, 1392, mk)} press={press} />}
    </>
  );
};
