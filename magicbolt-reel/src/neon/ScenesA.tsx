// Neon scenes 1–4: the problem
import {S1, S2, S3, S4, N} from './config';
import {Abs, Pop, useT, P, eo, eb, lerp} from '../components/kit';
import {B, Glass, H, Kin, M, Shake, Tag} from './kit';
import {Chip, Dots3, Ico, Mini, MiniWin} from './objects';

// 1 · "If you run a Digital Marketing Agency"
const DRIFT: [number, number, number, number, number, string][] = [
  [150, 330, -10, 200, 140, N.cyan], [940, 440, 8, 220, 150, N.pink], [130, 1270, 7, 230, 160, N.lime], [950, 1200, -9, 210, 150, N.amber], [560, 1440, 3, 250, 130, N.violet],
];
const HOOK = [{y: 600, size: 230, color: N.text}, {y: 810, size: 190, color: N.text}, {y: 1050, size: 300, color: N.lime}];
export const Hook = () => {
  const t = useT();
  const ku = eo(P(t, S1.lines[2][1] + 0.3, 0.4));
  return (
    <>
      <Tag n="01" label="The problem" />
      {DRIFT.map(([x, y, r, w, h, c], i) => {
        const k = eo(P(t, 0.1 + i * 0.12, 0.6));
        return <Abs key={i} x={x + 14 * Math.sin(t * 1.3 + i)} y={y + 18 * Math.cos(t * 1.1 + i * 2)} transform={`rotate(${r}deg) scale(${k})`} opacity={0.55 * k}><MiniWin w={w} h={h} c={c} /></Abs>;
      })}
      <Kin text={S1.pre[0]} at={S1.pre[1]} y={440} size={58} font="b" color={N.dim} />
      {S1.lines.map(([s, at], i) => <Kin key={s} text={s} at={at} {...HOOK[i]} />)}
      <div style={{position: 'absolute', left: 150, top: 1228, width: 780 * ku, height: 16, borderRadius: 8, background: N.lime, boxShadow: `0 0 30px ${N.lime}`}} />
    </>
  );
};

// 2 · "10 tools. 10 logins. 10 bills." — a strip of ten of each
const ROW_Y = [480, 800, 1120];
export const Tools = () => {
  const t = useT();
  const kt = P(t, S2.tail[1], 0.4);
  return (
    <Shake cues={S2.rows.map((r) => r.at)} amp={12}>
      <Tag n="01" label="The problem" />
      <Kin text={S2.pre[0]} at={S2.pre[1]} y={320} size={52} font="b" color={N.dim} />
      {S2.rows.map((r, i) => {
        const k = P(t, r.at, 0.4);
        if (k <= 0) return null;
        const n = Math.max(1, Math.ceil(S2.count * P(t, r.at, 0.45)));
        return (
          <div key={r.word}>
            <Abs x={540} y={ROW_Y[i]} transform={`scale(${lerp(1.3, 1, eo(k))})`} opacity={eo(k)}>
              <H size={200} color={r.color} style={{textShadow: `0 0 50px ${r.color}88`}}>{n}</H><H size={200} style={{marginLeft: 36}}>{r.word}.</H>
            </Abs>
            {Array.from({length: S2.count}, (_, j) => {
              const kj = P(t, r.at + 0.12 + j * 0.045, 0.3);
              return kj > 0 ? (
                <Abs key={j} x={105 + j * 96.6} y={ROW_Y[i] + 150 + 5 * Math.sin(t * 9 + j * 1.7 + i)} transform={`scale(${eb(kj, 2.2)}) rotate(${4 * Math.sin(t * 7 + j)}deg)`}>
                  <Mini kind={r.kind} color={r.color} n={j + 1} />
                </Abs>
              ) : null;
            })}
          </div>
        );
      })}
      {kt > 0 && <Abs x={540} y={1390} transform={`scale(${eb(kt, 2.2)})`}><M size={46} color={N.lime} w={700} style={{textTransform: 'none'}}>{S2.tail[0]}</M></Abs>}
    </Shake>
  );
};

// 3 · four app windows fly apart, then the week strip loses its Sunday
const SLOT = [[290, 640, -4], [790, 640, 3], [290, 1010, 3], [790, 1010, -4]];
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
export const Split = () => {
  const t = useT();
  const kw = P(t, S3.weekAt, 0.5);
  const sun = P(t, S3.weekAt + 0.55, 0.3);
  return (
    <Shake cues={[...S3.wins.map((w) => w.at), S3.weekAt + 0.55]} amp={12}>
      <Tag n="01" label="The problem" />
      {S3.wins.map((w, i) => {
        const kin = eo(P(t, 0.05 + i * 0.06, 0.4));
        const k = eb(P(t, w.at, 0.5), 1.6);
        const lit = t >= w.at;
        const ktag = P(t, w.at + 0.15, 0.4);
        const [sx, sy, sr] = SLOT[i];
        return (
          <Abs key={w.title} x={lerp(540 + (i - 1.5) * 16, sx, k)} y={lerp(825 + (i - 1.5) * 16, sy, k)} transform={`rotate(${lerp((i - 1.5) * 3, sr, k)}deg) scale(${kin * lerp(0.92, 1, k)})`} style={{zIndex: 10 - i}}>
            <Glass w={440} h={330} glow={lit ? w.color : undefined} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              <div style={{height: 54, flexShrink: 0, borderBottom: `2px solid ${N.line}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px'}}><Dots3 /><M size={20}>app_{i + 1}.exe</M></div>
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
                <Ico name={w.icon} size={120} color={w.color} />
                <H size={76}>{w.title}</H>
              </div>
            </Glass>
            {ktag > 0 && <div style={{position: 'absolute', right: -22, top: -22, transform: `rotate(8deg) scale(${eb(ktag, 2.4)})`}}><Chip color={N.red} size={30}>{S3.tag}</Chip></div>}
          </Abs>
        );
      })}
      {kw > 0 && WEEK.map((d, i) => {
        const kd = eo(P(t, S3.weekAt + i * 0.05, 0.3));
        const hit = i === 6 ? eo(sun) : 0;
        return (
          <Abs key={i} x={162 + i * 126} y={1320 + 40 * (1 - kd)} opacity={kd} transform={`scale(${1 + 0.18 * hit})`}>
            <div style={{width: 110, height: 110, borderRadius: 24, boxSizing: 'border-box', border: `2px solid ${hit > 0 ? N.red : N.line}`, background: hit > 0 ? N.red : 'rgba(255,255,255,0.05)',
              boxShadow: hit > 0 ? `0 0 50px ${N.red}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <H size={64} color={hit > 0 ? N.bg : N.dim}>{d}</H>
            </div>
          </Abs>
        );
      })}
      <Pop at={S3.weekAt + 0.7} x={540} y={1440}><M size={36} color={N.red} w={700}>{S3.week}</M></Pop>
    </Shake>
  );
};

// 4 · a phone, then the notification that is too big for it
export const Client = () => {
  const t = useT();
  const kp = eo(P(t, 0.1, 0.5));
  const typing = t >= S4.typingAt && t < S4.bubble[1];
  const kb = P(t, S4.bubble[1], 0.45);
  const buzz = kb > 0 ? 3 * Math.sin(t * 60) * Math.max(0, 1 - (t - S4.bubble[1]) / 0.7) : 0;
  return (
    <Shake cues={[S4.bubble[1]]} amp={20}>
      <Tag n="01" label="The problem" />
      <Kin text={S4.line[0]} at={S4.line[1]} y={350} size={88} />
      <Abs x={540} y={1000 + 80 * (1 - kp)} opacity={kp} transform={`rotate(${-4 + buzz}deg)`}>
        <div style={{width: 520, height: 880, borderRadius: 80, border: `6px solid ${N.line}`, background: '#0B0D15', boxSizing: 'border-box', boxShadow: '0 40px 100px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 26}}>
          <div style={{width: 150, height: 36, borderRadius: 18, background: '#000'}} />
          <H size={170} color="rgba(255,255,255,0.22)" style={{marginTop: 60}}>9:41</H>
          {typing && (
            <Glass w={440} h={110} r={30} style={{marginTop: 40, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px'}}>
              <div style={{width: 60, height: 60, borderRadius: '50%', background: N.pink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><B size={30} w={700}>{S4.from[0]}</B></div>
              <B size={30}>{S4.from}</B>
              <div style={{display: 'flex', gap: 8, marginLeft: 'auto'}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 14, height: 14, borderRadius: '50%', background: N.dim, transform: `translateY(${-8 * Math.max(0, Math.sin(t * 9 - i * 0.9))}px)`}} />)}</div>
            </Glass>
          )}
        </div>
      </Abs>
      {kb > 0 && (
        <Abs x={540} y={1010} transform={`scale(${eb(kb, 2.2)}) rotate(${-2 + 1.2 * Math.sin((t - S4.bubble[1]) * 5)}deg)`}>
          <Glass w={960} r={48} glow={N.pink} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '34px 40px'}}>
            <div style={{width: 120, height: 120, borderRadius: '50%', background: N.pink, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><B size={60} w={700}>{S4.from[0]}</B></div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <M size={26} color={N.pink} w={700}>{S4.from} · now</M>
              <H size={112}>{S4.bubble[0]}</H>
            </div>
          </Glass>
          <div style={{position: 'absolute', right: -20, top: -24, width: 76, height: 76, borderRadius: '50%', background: N.red, boxShadow: `0 0 40px ${N.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><B size={40} w={700}>1</B></div>
        </Abs>
      )}
    </Shake>
  );
};
