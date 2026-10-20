// Four more square, transparent, seamlessly looping feature animations:
// Facebook automation, Instagram automation, white-label agency platform, AI agent & autopilot.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fontFamily} from '../components/kit';
import {Tx} from '../qr/kit';
import {LOOPS} from './Loops';
import {At, Av, Badge, Bar, G, GName, GREEN, OL, Panel, PhoneF, Plane, Q, SH, Twinks, useLoop} from './parts';

const Stage: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{fontFamily}}>{children}</AbsoluteFill>;
const FB_BLUE = '#1877F2';
const cl = (x: number) => Math.max(0, Math.min(1, x));

// ---------- small shared drawings ----------
// 8-tooth gear: turning it 45° lands it on itself, so rot = p * 90 loops cleanly
const Gear: React.FC<{size: number; color: string; rot: number}> = ({size, color, rot}) => (
  <svg width={size} height={size} viewBox="-104 -104 208 208" style={{transform: `rotate(${rot}deg)`}}>
    {Array.from({length: 8}, (_, i) => <rect key={i} x={-21} y={-98} width={42} height={52} rx={9} fill={color} stroke={OL} strokeWidth={8} transform={`rotate(${i * 45})`} />)}
    <circle r={68} fill={color} stroke={OL} strokeWidth={8} /><circle r={25} fill="#fff" stroke={OL} strokeWidth={8} />
  </svg>
);
const Gears: React.FC = () => {
  const {p} = useLoop();
  return (
    <>
      <At x={210} y={880}><Gear size={250} color={Q.purple} rot={p * 90} /></At>
      <At x={372} y={1010}><Gear size={160} color={Q.yellow} rot={-p * 90 + 22} /></At>
    </>
  );
};
const Bolt: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><polygon points="56,4 16,56 44,56 36,96 84,42 56,42" fill={Q.yellow} stroke={OL} strokeWidth={8} strokeLinejoin="round" /></svg>
);
const Thumb: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="8" y="44" width="20" height="46" rx="6" fill={color} />
    <path d="M34 46h8l14-32c9 0 13 7 11 15l-4 15h20c7 0 11 6 9 13l-8 25c-2 5-6 8-11 8H34z" fill={color} />
  </svg>
);
const Round: React.FC<{size: number; color: string; children?: React.ReactNode}> = ({size, color, children}) => (
  <div style={{width: size, height: size, borderRadius: '50%', background: color, border: `7px solid ${OL}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
);
const Tick: React.FC<{size: number}> = ({size}) => (
  <Round size={size} color={GREEN}><svg width={size * 0.56} height={size * 0.56} viewBox="0 0 60 60"><polyline points="12,31 25,44 49,17" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /></svg></Round>
);
// Reactions drifting upward in a column
const Rising: React.FC<{x: number; kinds: ('like' | 'heart')[]}> = ({x, kinds}) => {
  const {p} = useLoop();
  return (
    <>
      {kinds.map((kind, i) => {
        const r = (p + i / kinds.length) % 1;
        return (
          <At key={i} x={x + 46 * Math.sin(r * 9 + i)} y={960 - 720 * r} scale={Math.sin(Math.PI * r) * 1.1} rot={12 * Math.sin(r * 7 + i)}>
            <Round size={120} color={kind === 'like' ? FB_BLUE : Q.pink}>{kind === 'like' ? <Thumb size={68} /> : <G name="heart" size={66} />}</Round>
          </At>
        );
      })}
    </>
  );
};

// ---------- 9 · Facebook automation ----------
export const FacebookAuto: React.FC = () => {
  const {p, osc, on} = useLoop();
  return (
    <Stage>
      <Twinks pts={[[1090, 1090, 60, Q.yellow], [560, 130, 60, Q.pink], [80, 560, 54, Q.yellow]]} />
      <Gears />
      <At x={300} y={640} scale={0.85 + 0.2 * Math.abs(osc(2))} rot={-8}><Bolt size={150} /></At>
      <At x={640} y={640 + 8 * osc()} rot={3}>
        <Panel w={540} h={610} r={46} sh={18} style={{padding: 26, display: 'flex', flexDirection: 'column', gap: 18}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}><Av size={86} bg={Q.yellow} /><div style={{display: 'flex', flexDirection: 'column', gap: 10}}><Bar w={220} h={20} c={OL} /><Bar w={130} h={14} /></div></div>
          <div style={{flex: 1, borderRadius: 26, background: '#E4EEFF', border: `6px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><G name="img" size={170} color={FB_BLUE} /></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
            <div style={{transform: `scale(${1 + 0.25 * Math.abs(osc(2))})`}}><Round size={84} color={FB_BLUE}><Thumb size={46} /></Round></div>
            <Round size={84} color="#EFEAFB"><G name="chat" size={44} color={Q.purple} /></Round>
            <div style={{transform: 'rotate(-10deg)'}}><Plane size={84} /></div>
          </div>
        </Panel>
      </At>
      <At x={205} y={300 + 12 * osc(1, 0.2)} rot={-10 + 4 * osc()}>
        <div style={{width: 230, height: 230, borderRadius: 64, background: FB_BLUE, border: `8px solid ${OL}`, boxShadow: `14px 14px 0 ${SH}`, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden'}}>
          <Tx size={230} color="#fff" style={{lineHeight: 0.95, transform: 'translateX(14px)'}}>f</Tx>
        </div>
      </At>
      {/* auto-reply bubble */}
      <At x={985} y={300 + 8 * osc(1, 0.4)} scale={on(0.18)} rot={6}>
        <Panel w={280} h={150} r={60} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          {[0, 1, 2].map((i) => <div key={i} style={{width: 36, height: 36, borderRadius: '50%', background: Q.purple, transform: `translateY(${-16 * Math.max(0, Math.sin(Math.PI * 2 * (p * 4 - i * 0.14)))}px)`}} />)}
        </Panel>
      </At>
      <Rising x={1050} kinds={['like', 'heart', 'like', 'heart']} />
    </Stage>
  );
};

// ---------- 10 · Instagram automation ----------
const IG = `linear-gradient(45deg, ${Q.yellow}, ${Q.pink} 50%, #7B3FF2)`;
const TILES = [Q.pink, '#9BD3FF', Q.yellow, '#C9B8FF', '#FFC48A', Q.pink, '#A8E6B0', Q.purple, '#9BD3FF'];
export const InstagramAuto: React.FC = () => {
  const {p, osc, on} = useLoop();
  const story = Math.floor(p * 4);
  return (
    <Stage>
      <Twinks pts={[[1090, 1090, 60, Q.yellow], [520, 110, 60, Q.pink], [80, 580, 54, Q.yellow]]} />
      <Gears />
      <At x={620} y={610 + 8 * osc()} rot={3}>
        <PhoneF>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 58, gap: 18}}>
            <div style={{display: 'flex', gap: 12}}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{width: 78, height: 78, borderRadius: '50%', background: IG, padding: 6, boxSizing: 'border-box', transform: `scale(${i === story ? 1.16 : 1})`}}>
                  <div style={{width: '100%', height: '100%', borderRadius: '50%', background: ['#FFD9B8', '#C9B8FF', '#9BD3FF', '#A8E6B0'][i], border: '4px solid #fff', boxSizing: 'border-box'}} />
                </div>
              ))}
            </div>
            <div style={{width: 344, height: 5, background: '#E4E0F3'}} />
            <div style={{position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 108px)', gap: 10}}>
              {TILES.map((c, i) => (
                <div key={i} style={{width: 108, height: 108, borderRadius: 18, background: '#EFEAFB'}}>
                  <div style={{width: '100%', height: '100%', borderRadius: 18, background: c, border: `5px solid ${OL}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on(0.05 + i * 0.075)})`}}>
                    <G name={i % 3 === 1 ? 'play' : 'img'} size={50} />
                  </div>
                </div>
              ))}
              <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${on(0.78, 0.06)})`}}>
                <svg width={190} height={190} viewBox="0 0 100 100"><path d="M50 86C12 58 8 36 22 22c11-10 23-4 28 8c5-12 17-18 28-8c14 14 10 36-28 64z" fill={Q.pink} stroke="#fff" strokeWidth={7} strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
        </PhoneF>
      </At>
      <At x={200} y={300 + 12 * osc(1, 0.2)} rot={-10 + 4 * osc()}>
        <div style={{width: 230, height: 230, borderRadius: 64, background: IG, border: `8px solid ${OL}`, boxShadow: `14px 14px 0 ${SH}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><G name="cam" size={150} /></div>
      </At>
      <At x={470} y={790} scale={0.85 + 0.2 * Math.abs(osc(2))} rot={-8}><Bolt size={140} /></At>
      {/* auto DM */}
      <At x={1000} y={310 + 8 * osc(1, 0.4)} scale={on(0.22)} rot={6}>
        <Panel w={250} h={170} r={60} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Plane size={110} /></Panel>
      </At>
      <Rising x={1055} kinds={['heart', 'heart', 'heart', 'heart']} />
    </Stage>
  );
};

// ---------- 11 · White-label agency platform ----------
const BRANDS = [Q.purple, Q.pink, '#F59E0B'];
const Mark: React.FC<{i: number; size: number; color: string}> = ({i, size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {i === 0 && <circle cx="50" cy="50" r="40" fill={color} stroke={OL} strokeWidth={9} />}
    {i === 1 && <rect x="12" y="12" width="76" height="76" rx="18" fill={color} stroke={OL} strokeWidth={9} />}
    {i === 2 && <polygon points="50,8 92,86 8,86" fill={color} stroke={OL} strokeWidth={9} strokeLinejoin="round" />}
  </svg>
);
export const WhiteLabel: React.FC = () => {
  const {p, osc} = useLoop();
  const idx = Math.floor(p * 3) % 3;
  const k = (p * 3) % 1;
  const flip = cl(k / 0.12); // the brand mark flips in at the start of each third
  const c = BRANDS[idx];
  const xs = [280, 600, 920];
  return (
    <Stage>
      <Twinks pts={[[110, 300, 64, Q.yellow], [1100, 330, 60, Q.pink], [110, 800, 54, Q.pink], [1100, 790, 54, Q.yellow]]} />
      <svg width={1200} height={1200} style={{position: 'absolute', left: 0, top: 0}}>
        {xs.map((x, i) => <line key={i} x1={600} y1={800} x2={x} y2={940} stroke={i === idx ? c : '#B9AFEA'} strokeWidth={9} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={-p * 120} />)}
      </svg>
      <At x={600} y={190 + 12 * osc()} rot={4 * osc(1, 0.25)}>
        <svg width={210} height={160} viewBox="0 0 210 160"><path d="M20 140L10 40l52 44l43-70l43 70l52-44l-10 100z" fill={Q.yellow} stroke={OL} strokeWidth={10} strokeLinejoin="round" />{[10, 105, 200].map((x, i) => <circle key={i} cx={x} cy={i === 1 ? 14 : 40} r={13} fill={Q.pink} stroke={OL} strokeWidth={7} />)}</svg>
      </At>
      <At x={600} y={550 + 6 * osc()}>
        <Panel w={800} h={520} r={48} sh={18} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 104, flexShrink: 0, borderBottom: `8px solid ${OL}`, display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px'}}>
            <div style={{transform: `scaleY(${flip})`}}><Mark i={idx} size={64} color={c} /></div>
            <div style={{transform: `scaleX(${flip})`, transformOrigin: '0 50%'}}><Bar w={200} h={24} c={c} /></div>
            <div style={{marginLeft: 'auto'}}><Av size={64} bg={Q.yellow} /></div>
          </div>
          <div style={{flex: 1, display: 'flex', minHeight: 0}}>
            <div style={{width: 190, borderRight: `8px solid ${OL}`, padding: '26px 22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 22, background: '#F6F2FF'}}>
              {[0, 1, 2, 3].map((i) => <Bar key={i} w={i === 0 ? '100%' : `${[0, 70, 86, 60][i]}%`} h={i === 0 ? 34 : 20} c={i === 0 ? c : '#CFC8EA'} />)}
            </div>
            <div style={{flex: 1, padding: 26, display: 'flex', flexDirection: 'column', gap: 22}}>
              <div style={{display: 'flex', gap: 18}}>
                {[0, 1, 2].map((i) => <div key={i} style={{flex: 1, height: 96, borderRadius: 20, border: `6px solid ${OL}`, boxSizing: 'border-box', padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}><Bar w="60%" h={12} /><Bar w={`${[80, 55, 70][i]}%`} h={22} c={i === 0 ? c : '#B9AFEA'} /></div>)}
              </div>
              <div style={{flex: 1, borderRadius: 20, border: `6px solid ${OL}`, display: 'flex', alignItems: 'flex-end', gap: 14, padding: 16}}>
                {[0.4, 0.55, 0.45, 0.7, 0.62, 0.85, 1].map((h, i) => <div key={i} style={{flex: 1, height: `${h * (82 + 18 * osc(1, -i * 0.06))}%`, borderRadius: 8, background: i === 6 ? c : '#CFC8EA'}} />)}
              </div>
            </div>
          </div>
        </Panel>
      </At>
      {xs.map((x, i) => {
        const hit = i === idx ? Math.sin(Math.PI * cl(k / 0.5)) * 0.5 + (k > 0.25 ? 0.5 : 0) : 0;
        const lift = i === idx ? 1 : 0;
        return (
          <At key={i} x={x} y={1030 - 24 * lift + 6 * osc(1, i * 0.3)} scale={1 + 0.1 * lift + 0.04 * hit}>
            <Panel w={250} h={200} r={36} sh={lift ? 14 : 0} style={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              <div style={{height: 84, flexShrink: 0, background: BRANDS[i], borderBottom: `7px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Mark i={i} size={50} color="#fff" /></div>
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: '0 22px'}}><Bar w="86%" h={16} /><Bar w="56%" h={16} c={BRANDS[i]} /></div>
            </Panel>
          </At>
        );
      })}
    </Stage>
  );
};

// ---------- 12 · AI agent & autopilot ----------
const TASKS: [number, number, GName, string][] = [[170, 720, 'mail', Q.pink], [235, 350, 'chat', GREEN], [600, 150, 'img', Q.purple], [965, 350, 'heart', '#EF4444'], [1030, 720, 'call', '#2B7BFF']];
export const AiAgent: React.FC = () => {
  const {p, osc, on} = useLoop();
  const blink = (p * 2) % 1 > 0.93 ? 0.15 : 1;
  const sw = cl(on(0.04, 0.08)); // autopilot switch position
  return (
    <Stage>
      <Twinks pts={[[110, 1010, 60, Q.yellow], [1090, 1010, 60, Q.pink], [400, 120, 50, Q.pink], [800, 120, 50, Q.yellow]]} />
      <svg width={1200} height={1200} style={{position: 'absolute', left: 0, top: 0}}>
        {TASKS.map(([x, y, , c], i) => <line key={i} x1={600} y1={600} x2={x} y2={y} stroke={c} strokeWidth={9} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={-p * 120} />)}
      </svg>
      {TASKS.map(([x, y, g, c], i) => (
        <At key={i} x={x} y={y + 8 * osc(1, i * 0.17)}>
          <div style={{position: 'relative'}}>
            <Badge name={g} size={170} color={c} square />
            <div style={{position: 'absolute', right: -30, top: -30, transform: `scale(${on(0.12 + i * 0.14)})`}}><Tick size={84} /></div>
          </div>
        </At>
      ))}
      {/* agent */}
      <At x={600} y={610 + 10 * osc()} rot={2 * osc(1, 0.25)} scale={0.86}>
        <div style={{position: 'relative', width: 480, height: 520}}>
          <div style={{position: 'absolute', left: 226, top: 0, width: 28, height: 80, background: OL}} />
          <div style={{position: 'absolute', left: 204, top: -36, width: 72, height: 72, borderRadius: '50%', background: Q.pink, border: `8px solid ${OL}`, boxSizing: 'border-box', transform: `scale(${0.85 + 0.15 * Math.abs(osc(2))})`}} />
          {[0, 388].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 150, width: 92, height: 150, borderRadius: 40, background: Q.purple, border: `8px solid ${OL}`, boxSizing: 'border-box'}} />)}
          <Panel w={400} h={320} r={120} sh={0} style={{position: 'absolute', left: 40, top: 66, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 300, height: 190, borderRadius: 80, background: OL, position: 'relative'}}>
              {[72, 188].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 54, width: 44, height: 56 * blink, borderRadius: 22, background: Q.pink, transform: `translateY(${(1 - blink) * 28}px)`}} />)}
              <svg width={110} height={50} viewBox="0 0 110 50" style={{position: 'absolute', left: 95, top: 124}}><path d="M10 8q45 44 90 0" fill="none" stroke={Q.pink} strokeWidth={12} strokeLinecap="round" /></svg>
            </div>
          </Panel>
          <Panel w={250} h={150} r={60} bg={Q.purple} sh={0} style={{position: 'absolute', left: 115, top: 370, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{transform: `scale(${0.9 + 0.2 * Math.abs(osc(2))})`}}><Bolt size={90} /></div>
          </Panel>
        </div>
      </At>
      {/* autopilot switch: slides on, stays on, resets with the loop */}
      <At x={600} y={1040}>
        <div style={{width: 360, height: 150, borderRadius: 75, background: sw > 0.5 ? GREEN : '#CFC8EA', border: `8px solid ${OL}`, boxShadow: `14px 14px 0 ${SH}`, boxSizing: 'border-box', position: 'relative'}}>
          <div style={{position: 'absolute', top: 9, left: 9 + 210 * sw, width: 116, height: 116, borderRadius: '50%', background: '#fff', border: `8px solid ${OL}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Bolt size={66} /></div>
        </div>
      </At>
    </Stage>
  );
};

LOOPS.push(
  ['Gif-FacebookAuto', FacebookAuto],
  ['Gif-InstagramAuto', InstagramAuto],
  ['Gif-WhiteLabel', WhiteLabel],
  ['Gif-AiAgent', AiAgent],
);
