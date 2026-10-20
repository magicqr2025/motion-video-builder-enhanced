// Scenes 1–4: the problem
import {S1, S2, S3, S4, T} from './config';
import {Abs, Pop, Txt, useT, P, eo, eb, lerp} from '../components/kit';
import {Box, Mark, Owner, Shake, Swipe, Tile, TOOL_COLORS, TOOL_GLYPHS} from './ui';

// 1 · "If you run a Digital Marketing Agency"
export const Hook = () => {
  const t = useT();
  const k = P(t, S1.artAt, 0.6);
  return (
    <>
      <Pop at={S1.l1[1]} x={540} y={320}><Txt size={64} color={T.slate}>{S1.l1[0]}</Txt></Pop>
      <Pop at={S1.l2[1]} x={540} y={430}><Txt size={92}>{S1.l2[0]}</Txt></Pop>
      <Swipe at={S1.big[1]} x={540} y={600} size={140} rot={-2}>{S1.big[0]}</Swipe>
      {k > 0 && <Abs x={540} y={1120 + 60 * (1 - eo(k))} opacity={eo(k)} transform={`scale(${lerp(0.9, 1, eb(k))})`}><Owner /></Abs>}
    </>
  );
};

// 2 · "10 tools. 10 logins. 10 bills."
const PILE: [number, number, number][] = [
  [270, 1400, -4], [450, 1400, 3], [630, 1400, -2], [810, 1400, 5],
  [360, 1250, 6], [540, 1250, -5], [720, 1250, 3],
  [450, 1100, -3], [630, 1100, 7],
  [540, 950, -6],
];
const BADGES: Record<number, number> = {1: 3, 4: 12, 6: 9, 9: 5};

export const Tools = () => {
  const t = useT();
  const A = 7 * P(t, S2.shakeAt, 1.2);
  return (
    <Shake cues={S2.lines.map(([, at]) => at)} amp={10}>
      {PILE.map(([x, y, rot], i) => {
        const k = P(t, S2.iconsAt + i * S2.iconGap, 0.45);
        if (k <= 0) return null;
        const dx = A * Math.sin(t * 38 + i * 2.1), dy = A * Math.cos(t * 31 + i * 1.3);
        const kb = P(t, S2.shakeAt - 0.6 + i * 0.12, 0.4);
        return (
          <Abs key={i} x={x + dx} y={y - (1 - eo(k)) * 1100 + dy} transform={`rotate(${rot + A * 0.5 * Math.sin(t * 35 + i)}deg)`}>
            <Tile name={TOOL_GLYPHS[i]} size={160} color={TOOL_COLORS[i]} sh={8} />
            {BADGES[i] && kb > 0 && (
              <div style={{position: 'absolute', right: -18, top: -18, width: 62, height: 62, borderRadius: '50%', background: T.red, border: `5px solid ${T.ink}`, boxSizing: 'border-box',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${eb(kb, 2.6)})`}}>
                <Txt size={30} color="#fff">{BADGES[i]}</Txt>
              </div>
            )}
          </Abs>
        );
      })}
      {S2.chaos.map((c, i) => {
        const k = P(t, c.at, 0.4);
        return k > 0 ? (
          <Abs key={c.text} x={c.x} y={c.y + 8 * Math.sin(t * 3 + i)} transform={`rotate(${c.rot}deg) scale(${eb(k, 2.4)})`}>
            <Box r={30} sh={6} style={{padding: '10px 24px'}}><Txt size={38}>{c.text}</Txt></Box>
          </Abs>
        ) : null;
      })}
      {S2.lines.map(([s, at], i) => {
        const [n, ...rest] = s.split(' ');
        return (
          <Pop key={i} at={at} x={540} y={320 + i * 150} d={0.3}>
            <Txt size={124} color={T.red}>{n}</Txt><Txt size={124} style={{marginLeft: 30}}>{rest.join(' ')}</Txt>
          </Pop>
        );
      })}
    </Shake>
  );
};

// 3 · four boxes splitting apart
const QUAD = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
export const Split = () => {
  const t = useT();
  const kin = P(t, 0.05, 0.45);
  return (
    <Shake cues={S3.boxes.map((b) => b.at)} amp={12}>
      <Swipe at={S3.closer[1]} x={540} y={1370} size={60} bg={T.red} color="#fff" rot={-2}>{S3.closer[0]}</Swipe>
      <Abs x={540} y={880} transform={`scale(${kin > 0 ? eb(kin, 1.4) : 0})`}>
        <div style={{position: 'relative', width: 0, height: 0}}>
          {S3.boxes.map((b, i) => {
            const [sx, sy] = QUAD[i];
            const k = eb(P(t, b.at, 0.45), 2.2);
            const kt = P(t, b.at + 0.1, 0.4);
            return (
              <div key={b.title} style={{position: 'absolute', left: sx * 215 - 205 + sx * 50 * k, top: sy * 165 - 155 + sy * 60 * k, transform: `rotate(${sx * sy * -4 * k}deg)`}}>
                <Box w={410} h={310} r={40} sh={10} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
                  <Tile name={b.icon} size={120} color={b.color} />
                  <Txt size={60}>{b.title}</Txt>
                </Box>
                {kt > 0 && (
                  <div style={{position: 'absolute', right: -26, top: -30, transform: `scale(${eb(kt, 2.4)})`}}>
                    <Mark size={44} bg={T.red} color="#fff" rot={6}>{S3.tag}</Mark>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Abs>
    </Shake>
  );
};

// 4 · client chat bubble (plays on a dark full-bleed background)
export const Client = () => {
  const t = useT();
  const ka = P(t, S4.typingAt - 0.3, 0.4);
  const typing = t >= S4.typingAt && t < S4.bubble[1];
  const kb = P(t, S4.bubble[1], 0.45);
  const wob = kb >= 1 ? 1.2 * Math.sin((t - S4.bubble[1]) * 5) : 0;
  return (
    <Shake cues={[S4.bubble[1]]} amp={18}>
      <Pop at={S4.line[1]} x={540} y={470}><Txt size={70} color="#fff">{S4.line[0]}</Txt></Pop>
      {ka > 0 && (
        <div style={{position: 'absolute', left: 80, top: 790, transform: `scale(${eb(ka, 2)})`}}>
          <div style={{width: 130, height: 130, borderRadius: '50%', background: T.violet, border: '5px solid #fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Txt size={64} color="#fff">{S4.from[0]}</Txt>
          </div>
          <div style={{position: 'absolute', left: 170, top: -62, opacity: eo(ka)}}><Txt size={38} color={T.mute}>{S4.from}</Txt></div>
        </div>
      )}
      {typing && (
        <div style={{position: 'absolute', left: 240, top: 800}}>
          <Box w={220} h={110} r={55} sh={8} shc={T.violet} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
            {[0, 1, 2].map((i) => <div key={i} style={{width: 24, height: 24, borderRadius: '50%', background: T.slate, transform: `translateY(${-10 * Math.max(0, Math.sin(t * 9 - i * 0.9))}px)`}} />)}
          </Box>
        </div>
      )}
      {kb > 0 && (
        <div style={{position: 'absolute', left: 240, top: 770, transform: `scale(${eb(kb, 2.2)}) rotate(${wob}deg)`, transformOrigin: '0 50%'}}>
          <Box r={56} sh={12} shc={T.violet} style={{padding: '38px 46px', borderTopLeftRadius: 10, whiteSpace: 'nowrap'}}><Txt size={72}>{S4.bubble[0]}</Txt></Box>
        </div>
      )}
      {[[830, 1220, 220, 12, 0.2], [230, 1290, 150, -14, 0.35]].map(([x, y, size, rot, d], i) => {
        const kq = P(t, S4.bubble[1] + d, 0.5);
        return kq > 0 ? <Abs key={i} x={x} y={y + 12 * Math.sin(t * 2.4 + i)} transform={`rotate(${rot}deg) scale(${eb(kq, 2)})`}><Txt size={size} color={T.yellow}>?</Txt></Abs> : null;
      })}
    </Shake>
  );
};
