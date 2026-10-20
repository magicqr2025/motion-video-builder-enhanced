// Scenes 5–8: the product
import {S5, S6, S7, S8, T} from './config';
import {Abs, Pop, Txt, useT, P, eo, eb, eio, lerp} from '../components/kit';
import {Box, BrandChip, Burst, Confetti, Dash, Logo, Mark, Shake, Swipe, Tick, Tile, TOOL_COLORS, TOOL_GLYPHS} from './ui';

// 5 · the ten tools spiral into one logo → dashboard
export const Reveal = () => {
  const t = useT();
  const kg = P(t, 0.1, S5.logoAt - 0.1); // tools gathering
  const kl = P(t, S5.logoAt, 0.6);
  const km = eio(P(t, S5.tagline[1] - 0.35, 0.5)); // logo moves up to make room
  const kd = P(t, S5.dashAt, 0.6);
  const ly = lerp(660, 400, km);
  return (
    <Shake cues={[S5.logoAt]} amp={18}>
      {km < 1 && <div style={{opacity: 1 - km}}><Pop at={S5.intro[1]} x={540} y={250}><Txt size={56} color={T.slate}>{S5.intro[0]}</Txt></Pop></div>}
      {kg < 1 && TOOL_GLYPHS.map((g, i) => {
        const kp = P(t, 0.1 + i * 0.05, 0.3);
        if (kp <= 0) return null;
        const ang = (i * 2 * Math.PI) / TOOL_GLYPHS.length + t * 2.4 + eio(kg) * 3;
        const r = 1 - eio(kg);
        return (
          <Abs key={i} x={540 + 400 * r * Math.cos(ang)} y={660 + 290 * r * Math.sin(ang)} transform={`scale(${eb(kp, 2) * lerp(0.35, 1, r)}) rotate(${ang * 30}deg)`} opacity={kg > 0.9 ? 1 - (kg - 0.9) * 10 : 1}>
            <Tile name={g} size={120} color={TOOL_COLORS[i]} sh={6} />
          </Abs>
        );
      })}
      {kl > 0 && <Abs x={540} y={ly} transform={`scale(${eb(Math.min(1, kl * 1.5), 1.6) * lerp(1.5, 0.9, km)})`} opacity={eo(kl) * lerp(1, 0.55, km)}><Burst size={900} /></Abs>}
      <Confetti at={S5.logoAt} x={540} y={660} />
      {kl > 0 && <Abs x={540} y={ly} transform={`scale(${eb(kl, 2.4) * lerp(1.2, 1, km)}) rotate(${(1 - eo(kl)) * -10}deg)`} opacity={eo(kl)}><Logo size={84} /></Abs>}
      <Swipe at={S5.tagline[1]} x={540} y={580} size={84} rot={-2}>{S5.tagline[0]}</Swipe>
      {kd > 0 && <Abs x={540} y={1070 + 120 * (1 - eo(kd))} opacity={eo(kd)} transform={`rotate(${lerp(4, -1.5, eo(kd))}deg)`}><Dash /></Abs>}
    </Shake>
  );
};

// 6 · feature words drop in one by one
export const Features = () => {
  const t = useT();
  return (
    <Shake cues={S6.features.map((f) => f.at + 0.25)} amp={8}>
      {S6.features.map((f, i) => {
        const k = P(t, f.at, 0.5);
        if (k <= 0) return null;
        const ck = P(t, f.at + 0.35, 0.4);
        return (
          <div key={f.title} style={{position: 'absolute', left: 90, top: 340 + i * 206, opacity: eo(Math.min(1, k * 2)), transform: `translateY(${(1 - eb(k, 1.6)) * -220}px) rotate(${(1 - eo(k)) * (i % 2 ? 3 : -3)}deg)`}}>
            <Box w={900} h={170} r={40} sh={10} shc={f.color} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '0 30px'}}>
              <Tile name={f.icon} size={110} color={f.color} />
              <div style={{flex: 1, whiteSpace: 'nowrap'}}><Txt size={52}>{f.title}</Txt></div>
              <div style={{transform: `scale(${ck > 0 ? eb(ck, 2.5) : 0})`}}><Tick size={66} /></div>
            </Box>
          </div>
        );
      })}
      <Swipe at={S6.closer[1]} x={540} y={1290} size={66} rot={-1.5}>{S6.closer[0]}</Swipe>
    </Shake>
  );
};

// 7 · the dashboard logo swaps to the agency's own brand
export const WhiteLabel = () => {
  const t = useT();
  const kd = P(t, S7.dashAt, 0.5);
  const swap = eio(P(t, S7.swapAt, 0.5));
  const bump = Math.sin(Math.PI * P(t, S7.swapAt, 0.5));
  const ks = P(t, S7.stamp[1], 0.35);
  return (
    <Shake cues={[S7.stamp[1] + 0.25]} amp={22}>
      <Pop at={S7.line[1]} x={540} y={350}><Txt size={74}>{S7.line[0]}</Txt></Pop>
      {kd > 0 && <Abs x={540} y={940 + 80 * (1 - eo(kd))} opacity={eo(kd)}><Dash k={swap} /></Abs>}
      {kd > 0 && bump > 0 && <Abs x={330} y={545} opacity={bump} transform={`scale(${0.6 + 0.6 * bump})`}><Burst size={500} color={T.pink} speed={60} /></Abs>}
      {kd > 0 && (
        <div style={{position: 'absolute', left: 54, top: 478, opacity: eo(kd), transform: `rotate(-3deg) scale(${1 + 0.1 * bump})`, transformOrigin: '0 50%'}}>
          <Box r={34} sh={10} bg={T.yellow} style={{padding: '20px 34px'}}><BrandChip size={56} k={swap} /></Box>
        </div>
      )}
      {ks > 0 && (
        <Abs x={540} y={1370} transform={`rotate(-5deg) scale(${lerp(2.6, 1, eo(ks))})`} opacity={eo(Math.min(1, ks * 2))}>
          <div style={{border: `10px solid ${T.violet}`, borderRadius: 28, padding: '6px 44px', background: '#fff', boxShadow: `10px 10px 0 ${T.violet}`}}>
            <Txt size={96} color={T.violet}>{S7.stamp[0]}</Txt>
          </div>
        </Abs>
      )}
    </Shake>
  );
};

// 8 · proof numbers (off unless S8.on)
export const Stats = () => {
  const t = useT();
  const rows = [
    {n: S8.agencies, label: S8.agenciesLabel, at: S8.agenciesAt, y: 520, plus: false},
    {n: S8.clients, label: S8.clientsLabel, at: S8.clientsAt, y: 1040, plus: true},
  ];
  return (
    <>
      {rows.map((r) => {
        const k = P(t, r.at, 1.4);
        if (k <= 0) return null;
        return (
          <div key={r.label}>
            <Abs x={540} y={r.y} transform={`scale(${eb(Math.min(1, k * 3), 1.8)})`}>
              <Txt size={230} color={T.violet}>{Math.round(r.n * eo(k)).toLocaleString('en-IN')}{r.plus ? '+' : ''}</Txt>
            </Abs>
            <Pop at={r.at + 0.3} x={540} y={r.y + 190}><Mark size={66}>{r.label}</Mark></Pop>
          </div>
        );
      })}
    </>
  );
};
