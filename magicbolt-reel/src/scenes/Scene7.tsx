// "Build recurring monthly revenue as your client base grows"
import {C, S7} from '../config';
import {Card, Pill, Pop, Txt, useT, P, eo} from '../components/kit';

export const Scene7 = () => {
  const t = useT();
  const k = P(t, S7.chartAt, 0.5);
  const [x, y, w, h] = [90, 600, 900, 700];
  const base = h - 110, ch = 430, bw = 92, gap = (w - 120 - 6 * bw) / 5;
  const cols = [C.cyan, C.cyan, C.blue, C.blue, C.violet, C.violet];
  const tops = S7.bars.map((hh, i) => [60 + i * (bw + gap) + bw / 2, base - ch * hh - 30]);
  const lk = eo(P(t, S7.lineAt, 0.9));
  // build partial polyline
  const n = (tops.length - 1) * lk;
  const pts: number[][] = [tops[0]];
  for (let i = 1; i < tops.length; i++) {
    if (i <= n) pts.push(tops[i]);
    else { const f = n - (i - 1); pts.push([tops[i - 1][0] + (tops[i][0] - tops[i - 1][0]) * f, tops[i - 1][1] + (tops[i][1] - tops[i - 1][1]) * f]); break; }
  }
  return (
    <>
      <Pop at={S7.big[1]} x={540} y={360}><Txt size={108} g={[C.green, C.cyan, C.blue]}>{S7.big[0]}</Txt></Pop>
      <Pop at={S7.sub[1]} x={540} y={480}><Txt size={80}>{S7.sub[0]}</Txt></Pop>
      {k > 0 && (
        <div style={{position: 'absolute', left: x, top: y, opacity: eo(k), transform: `translateY(${80 * (1 - eo(k))}px)`}}>
          <Card w={w} h={h} r={52} style={{position: 'relative'}}>
            <div style={{position: 'absolute', left: 60, top: 56}}><Txt size={36} color={C.slate} bold={false}>Monthly revenue</Txt></div>
            <div style={{position: 'absolute', right: 50, top: 44, opacity: eo(P(t, 27.8, 0.4))}}><Pill size={30} bg={C.green} padX={26} padY={12}>{S7.badge}</Pill></div>
            {S7.bars.map((hh, i) => {
              const bk = eo(P(t, S7.barsAt + i * 0.13, 0.5));
              return (
                <div key={i}>
                  <div style={{position: 'absolute', left: 60 + i * (bw + gap), top: base - ch * hh * bk, width: bw, height: ch * hh * bk, borderRadius: 20,
                    background: `linear-gradient(180deg, ${cols[i]}, ${cols[i]}99)`}} />
                  <div style={{position: 'absolute', left: 60 + i * (bw + gap), top: base + 30, width: bw, textAlign: 'center'}}>
                    <Txt size={28} color={C.slate} bold={false}>{S7.labels[i]}</Txt>
                  </div>
                </div>
              );
            })}
            {lk > 0 && (
              <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
                <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.orange} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                {lk >= 1 && <circle cx={tops[5][0]} cy={tops[5][1]} r={16} fill={C.orange} />}
              </svg>
            )}
          </Card>
        </div>
      )}
      <Pop at={S7.footer[1]} x={540} y={1410}><Txt size={46} color={C.violet}>{S7.footer[0]}</Txt></Pop>
    </>
  );
};
