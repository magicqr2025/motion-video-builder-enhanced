// Neon scenes 5–7: the product
import {S5, S6, S7, IcoName, N} from './config';
import {Abs, useT, P, eo, eb, eio, lerp} from '../components/kit';
import {B, Flash, Glass, H, Kin, M, Shake, Tag} from './kit';
import {BrandChip, Dash, Ico, Logo} from './objects';

// 5 · neon rings → logo → "Your Agency OS" → tilted dashboard
export const Reveal = () => {
  const t = useT();
  const kl = P(t, S5.logoAt, 0.6);
  const km = eio(P(t, S5.tagline[1] - 0.35, 0.5));
  const kd = eo(P(t, S5.dashAt, 0.7));
  const ly = lerp(700, 400, km);
  return (
    <Shake cues={[S5.logoAt]} amp={20}>
      <Tag n="02" label="The fix" />
      {km < 1 && <div style={{opacity: 1 - km}}><Kin text={S5.intro[0]} at={S5.intro[1]} y={420} size={60} font="b" color={N.dim} /></div>}
      {/* charging ring before the reveal, pulse rings after */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - km}}>
        {t < S5.logoAt && <circle cx={540} cy={700} r={150} fill="none" stroke={N.lime} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${942 * P(t, 0.2, S5.logoAt - 0.2)} 942`} transform="rotate(-90 540 700)" />}
        {kl > 0 && [0, 1, 2].map((j) => {
          const r = ((t - S5.logoAt) * 0.55 + j / 3) % 1;
          return <circle key={j} cx={540} cy={ly} r={150 + 520 * r} fill="none" stroke={j % 2 ? N.cyan : N.lime} strokeOpacity={0.6 * (1 - r)} strokeWidth={5} />;
        })}
      </svg>
      <Flash at={S5.logoAt} x={540} y={700} />
      {kl > 0 && <Abs x={540} y={ly} transform={`scale(${eb(kl, 2.4) * lerp(1.15, 0.9, km)})`} opacity={eo(kl)}><Logo size={92} /></Abs>}
      <Kin text={S5.tagline[0]} at={S5.tagline[1]} y={600} size={150} accent={N.lime} />
      {kd > 0 && (
        <Abs x={540} y={1110 + 200 * (1 - kd)} opacity={kd} transform={`perspective(1500px) rotateX(${lerp(48, 14, kd)}deg) rotateY(${lerp(-22, -8, kd)}deg) rotate(-2deg)`}>
          <Dash at={S5.dashAt} />
        </Abs>
      )}
    </Shake>
  );
};

// Little animated visual inside each bento card (300x170)
const Viz: React.FC<{kind: IcoName; color: string; at: number}> = ({kind, color, at}) => {
  const t = useT();
  if (kind === 'post') {
    return (
      <div style={{display: 'flex', gap: 16}}>
        {[0, 1, 2].map((j) => {
          const k = eo(P(t, at + 0.2 + j * 0.18, 0.3));
          return <div key={j} style={{width: 92, height: 120, borderRadius: 16, border: `2px solid ${color}`, background: `${color}${k > 0.5 ? 'CC' : '22'}`, transform: `translateY(${(1 - k) * 30}px)`, opacity: 0.3 + 0.7 * k, boxShadow: k > 0.5 ? `0 0 26px ${color}99` : undefined}} />;
        })}
      </div>
    );
  }
  if (kind === 'pin') {
    const r = ((t - at) * 0.8) % 1;
    return (
      <div style={{position: 'relative', width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {t > at && <div style={{position: 'absolute', width: 60 + 130 * r, height: 60 + 130 * r, borderRadius: '50%', border: `4px solid ${color}`, opacity: 1 - r}} />}
        <Ico name="pin" size={130} color={color} />
      </div>
    );
  }
  if (kind === 'star') {
    return (
      <div style={{display: 'flex', gap: 6}}>
        {[0, 1, 2, 3, 4].map((j) => {
          const k = P(t, at + 0.2 + j * 0.12, 0.3);
          return <div key={j} style={{transform: `scale(${k > 0 ? eb(k, 2.6) : 0.6})`, opacity: k > 0 ? 1 : 0.25}}><Ico name="star" size={62} color={color} sw={9} /></div>;
        })}
      </div>
    );
  }
  const k = eo(P(t, at + 0.2, 0.8));
  return (
    <svg width={300} height={170} viewBox="0 0 300 170" style={{filter: `drop-shadow(0 0 14px ${color}99)`}}>
      <polyline points="10,150 70,110 120,128 180,70 230,88 290,18" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${520 * k} 520`} />
      {k >= 1 && <circle cx={290} cy={18} r={13} fill={color} />}
    </svg>
  );
};

// 6 · bento grid lights up one cell at a time
const CELL = [[80, 330], [560, 330], [80, 770], [560, 770]];
export const Features = () => {
  const t = useT();
  return (
    <Shake cues={S6.cards.map((c) => c.at)} amp={8}>
      <Tag n="02" label="The fix" />
      {S6.cards.map((c, i) => {
        const k = P(t, c.at, 0.45);
        const on = k > 0;
        const [l, tp] = CELL[i];
        return (
          <div key={c.title} style={{position: 'absolute', left: l, top: tp, opacity: on ? 1 : 0.3, transform: `scale(${on ? lerp(0.88, 1, eb(k, 2)) : 0.96})`}}>
            <Glass w={440} h={400} glow={on ? c.color : undefined} style={{padding: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <M size={28} color={on ? c.color : N.dim} w={700}>0{i + 1}</M>
              <div style={{height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on && <Viz kind={c.icon} color={c.color} at={c.at} />}</div>
              <B size={46} w={700} color={on ? N.text : N.dim} style={{whiteSpace: 'normal', lineHeight: 1.05}}>{c.title.split(' ')[0]}<br />{c.title.split(' ').slice(1).join(' ')}</B>
            </Glass>
          </div>
        );
      })}
      <Kin text={S6.closer[0]} at={S6.closer[1]} y={1310} size={96} color={N.lime} />
    </Shake>
  );
};

// 7 · MagicBolt gets struck out, the agency's own brand takes over
export const WhiteLabel = () => {
  const t = useT();
  const kc = eo(P(t, S7.cardAt, 0.5));
  const strike = eo(P(t, S7.strikeAt, 0.35));
  const swap = eio(P(t, S7.swapAt, 0.5));
  const yours = swap > 0.5;
  const bump = Math.sin(Math.PI * P(t, S7.swapAt, 0.5));
  const ks = P(t, S7.stamp[1], 0.35);
  const solid = t > S7.stamp[1] + 0.45;
  return (
    <Shake cues={[S7.strikeAt, S7.stamp[1] + 0.25]} amp={20}>
      <Tag n="02" label="The fix" />
      <Kin text={S7.line[0]} at={S7.line[1]} y={350} size={96} />
      <Abs x={540} y={590 + 60 * (1 - kc)} opacity={kc} transform={`scale(${1 + 0.08 * bump})`}>
        <Glass w={840} h={190} r={44} glow={yours ? N.pink : undefined} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <BrandChip size={76} k={swap} />
          {!yours && strike > 0 && <div style={{position: 'absolute', left: 70, top: 88, width: 700 * strike, height: 12, borderRadius: 6, background: N.red, boxShadow: `0 0 30px ${N.red}`, transform: 'rotate(-3deg)', transformOrigin: '0 50%', opacity: 1 - swap * 2}} />}
        </Glass>
      </Abs>
      <Abs x={540} y={1000 + 80 * (1 - kc)} opacity={kc} transform="scale(0.82)"><Dash k={swap} accent={yours ? N.pink : N.cyan} at={S7.cardAt} /></Abs>
      {ks > 0 && (
        <Abs x={540} y={1390} transform={`rotate(-4deg) scale(${lerp(2.6, 1, eo(ks))})`} opacity={eo(Math.min(1, ks * 2))}>
          <H size={170} color={solid ? N.lime : 'transparent'} style={{WebkitTextStroke: `5px ${N.lime}`, textShadow: `0 0 60px ${N.lime}AA`}}>{S7.stamp[0]}</H>
        </Abs>
      )}
    </Shake>
  );
};
