import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {Backdrop, IconChip, Tx, useSec, P, eo, eb, lerp} from '../../dns/ui';
import {Chip} from '../../glow/parts';
import {TUT} from './config';
import TEXT from './text.json';
import {CameraRig, Obj3D, Particles, SceneSeq, SpringIn, transitionFor} from '../kit';
import {TitleCard, EndLogo} from '../../tutorial/brand';
import {FULL} from './config';

loadFont({family: 'JetBrains Mono', url: staticFile('fonts/JetBrainsMono.ttf'), weight: '100 800'});

type Kind = 'a' | 'b';
const ease = (t: number, start: number, dur = 0.45) => eo(P(t, start, dur));
const fit = (s: string, size: number, max: number) => Math.min(size, max / Math.max(1, s.length) * 1.7);

const Glow: React.FC<{x: number; y: number; color: string; size?: number}> = ({x, y, color, size = 240}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, ${color}35 0%, ${color}12 42%, transparent 72%)`}} />
);

const Heading: React.FC<{title: string; sub?: string; dark?: boolean}> = ({title, sub, dark = false}) => {
  const t = useSec();
  const k = ease(t, 0.12, 0.55);
  return <div style={{position: 'absolute', left: 110, top: 105, opacity: k, transform: `translateY(${(1 - k) * 24}px)`}}>
    <Tx size={54} color={dark ? '#fff' : TUT.navy}>{title}</Tx>
    {sub && <div style={{marginTop: 10}}><Tx size={27} color={dark ? '#C7D7FF' : TUT.slate} w={400}>{sub}</Tx></div>}
  </div>;
};

const StepPill: React.FC<{label: string; dark?: boolean; color?: string}> = ({label, dark = false, color = TUT.deep}) => (
  <div style={{position: 'absolute', left: 110, bottom: 54, padding: '14px 30px', borderRadius: 99, background: dark ? 'rgba(255,255,255,0.12)' : 'linear-gradient(180deg,#fff,#EAF1FF)', border: `2px solid ${dark ? 'rgba(255,255,255,0.2)' : '#fff'}`, boxShadow: dark ? '0 10px 32px rgba(0,0,0,.25)' : '0 8px 0 #D5DEF3,0 20px 34px rgba(14,27,77,.13)', display: 'flex', alignItems: 'center', gap: 14}}>
    <span style={{width: 15, height: 15, borderRadius: 10, background: color, boxShadow: `0 0 18px ${color}`}} />
    <Tx size={25} color={dark ? '#fff' : TUT.navy}>{label}</Tx>
  </div>
);

const Window: React.FC<{title: string; dark?: boolean; x?: number; y?: number; w?: number; h?: number; children?: React.ReactNode}> = ({title, dark = false, x = 330, y = 255, w = 1260, h = 680, children}) => {
  const t = useSec();
  const k = ease(t, 0.12, 0.6);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28, overflow: 'hidden', background: dark ? 'linear-gradient(145deg,#182B68,#0B1746)' : 'linear-gradient(180deg,#fff,#F6F8FE)', border: `3px solid ${dark ? 'rgba(255,255,255,.2)' : '#fff'}`, boxShadow: dark ? '0 34px 90px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.2)' : '0 10px 0 #CED8EF,0 38px 80px rgba(14,27,77,.24)', opacity: k, transform: `translateY(${(1 - k) * 34}px) scale(${lerp(.96, 1, k)})`}}>
    <div style={{height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', background: dark ? 'rgba(255,255,255,.06)' : '#EEF2FA', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,.1)' : '#E3E8F4'}`}}>
      {[TUT.orange, TUT.gold, TUT.green].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 9, background: c}} />)}
      <div style={{marginLeft: 14, padding: '8px 20px', borderRadius: 12, background: dark ? 'rgba(255,255,255,.1)' : '#fff'}}><Tx size={19} color={dark ? '#E4ECFF' : TUT.slate} w={400}>{title}</Tx></div>
      <div style={{flex: 1}} />
      <div style={{width: 12, height: 12, borderRadius: 12, background: dark ? TUT.green : '#4BC58B', boxShadow: '0 0 12px #4BC58B'}} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 64, bottom: 0}}>{children}</div>
  </div>;
};

const Field: React.FC<{label: string; value: string; x: number; y: number; w: number; active?: boolean; mono?: boolean; dark?: boolean; delay?: number}> = ({label, value, x, y, w, active = false, mono = false, dark = false, delay = 0.35}) => {
  const t = useSec();
  const k = ease(t, delay, 0.34);
  const typing = Math.min(1, Math.max(0, (t - delay - 0.15) / Math.max(0.45, value.length * 0.025)));
  const visible = value.slice(0, Math.ceil(value.length * typing));
  return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k, transform: `translateY(${(1 - k) * 14}px)`}}>
    <div style={{marginBottom: 9}}><Tx size={19} color={dark ? '#AEBDE4' : TUT.slate} w={400}>{label}</Tx></div>
    <div style={{height: 60, borderRadius: 13, background: dark ? 'rgba(6,15,48,.58)' : '#fff', border: `2px solid ${active ? TUT.blue : dark ? 'rgba(255,255,255,.16)' : '#E0E7F4'}`, boxShadow: active ? `0 0 0 5px ${TUT.blue}25` : '0 4px 12px rgba(14,27,77,.04)', display: 'flex', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box'}}>
      <span style={{fontFamily: mono ? 'JetBrains Mono' : undefined, fontSize: fit(visible || value, 22, w - 40), color: dark ? '#fff' : TUT.navy, whiteSpace: 'nowrap'}}>{visible || (t >= delay ? '' : value)}</span>
      {active && <span style={{marginLeft: 3, width: 2, height: 24, background: TUT.blue, opacity: 0.5 + 0.5 * Math.sin(t * 8)}} />}
    </div>
  </div>;
};

const Check: React.FC<{label: string; x: number; y: number; delay?: number}> = ({label, x, y, delay = 0.3}) => {
  const t = useSec(); const k = ease(t, delay, 0.35);
  return <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 12, opacity: k, transform: `scale(${lerp(.85, 1, k)})`}}>
    <div style={{width: 30, height: 30, borderRadius: 10, background: `linear-gradient(145deg,${TUT.green},#0D8A5B)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 #08734B'}}><span style={{fontSize: 20, color: '#fff', fontWeight: 700}}>✓</span></div>
    <Tx size={19} color={TUT.slate} w={400}>{label}</Tx>
  </div>;
};

const Button: React.FC<{label: string; x: number; y: number; gold?: boolean}> = ({label, x, y, gold = false}) => {
  const t = useSec(); const k = ease(t, 1.1, 0.4);
  return <div style={{position: 'absolute', left: x, top: y, opacity: k, transform: `translateY(${(1 - k) * 14}px) scale(${.95 + .05 * k})`, padding: '15px 26px', borderRadius: 12, background: gold ? `linear-gradient(145deg,${TUT.gold},${TUT.orange})` : `linear-gradient(145deg,${TUT.blue},${TUT.deep})`, boxShadow: `0 5px 0 ${gold ? '#D07A0B' : '#0D3D99'},0 12px 22px rgba(14,27,77,.16)`}}><Tx size={20} color={gold ? TUT.navy : '#fff'}>{label}</Tx></div>;
};

const CloudMark: React.FC<{size?: number; color?: string}> = ({size = 80, color = TUT.orange}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 8px 10px ${color}55)`}}><path d="M25 77a22 22 0 0 1-2-44 28 28 0 0 1 53 8 18 18 0 0 1-2 36z" fill={`url(#cloud-${size})`} /><defs><linearGradient id={`cloud-${size}`} x1="0" x2=".9" y1="0" y2="1"><stop stopColor="#fff" stopOpacity=".9"/><stop offset=".38" stopColor={color}/><stop offset="1" stopColor={TUT.orange}/></linearGradient></defs></svg>
);

const BoltMark: React.FC<{size?: number}> = ({size = 70}) => <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 6px 8px #FDC60B66)'}}><path d="M57 4 19 56h27l-5 40 41-57H54z" fill={`url(#bolt-${size})`} stroke="#F7941D" strokeWidth="4" strokeLinejoin="round"/><defs><linearGradient id={`bolt-${size}`} x1="0" x2=".8" y1="0" y2="1"><stop stopColor="#FFF49B"/><stop offset=".55" stopColor={TUT.gold}/><stop offset="1" stopColor={TUT.orange}/></linearGradient></defs></svg>;

const AOverview: React.FC = () => <>
  <Heading title={TEXT.A.hook} sub={TEXT.A.sub} />
  <Window title={TEXT.A.browser}>
    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 240, background: '#F8FAFE', borderRight: '1px solid #E7ECF5', padding: '30px 22px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', gap: 10, alignItems: 'center', marginBottom: 30}}><IconChip name="cloud" size={46} c={TUT.orange} /><Tx size={20} color={TUT.navy}>{TEXT.A.storageNav}</Tx></div>
      {TEXT.A.nav.map((n, i) => <div key={n} style={{marginBottom: 12, padding: '13px 14px', borderRadius: 10, background: i === 1 ? '#E8F2FF' : 'transparent', borderLeft: i === 1 ? `4px solid ${TUT.blue}` : '4px solid transparent'}}><Tx size={18} color={i === 1 ? TUT.deep : TUT.slate} w={i === 1 ? 700 : 400}>{n}</Tx></div>)}
    </div>
    <div style={{position: 'absolute', left: 290, top: 36}}>
      <Tx size={32} color={TUT.navy}>{TEXT.A.create}</Tx>
      <div style={{marginTop: 12}}><Tx size={20} color={TUT.slate} w={400}>{TEXT.A.storageIntro}</Tx></div>
    </div>
    <div style={{position: 'absolute', left: 300, top: 145, width: 600, height: 225, borderRadius: 24, background: 'linear-gradient(145deg,#F2F8FF,#E5F0FF)', boxShadow: 'inset 0 0 0 1px #D8E8FF'}}><Glow x={300} y={120} color={TUT.blue} size={220} /><div style={{position: 'absolute', left: 48, top: 42}}><IconChip name="cloud" size={84} c={TUT.blue} /></div><div style={{position: 'absolute', left: 150, top: 54}}><Tx size={26} color={TUT.navy}>{TEXT.A.storageTitle}</Tx><br/><Tx size={18} color={TUT.slate} w={400}>{TEXT.A.storageSub}</Tx></div><div style={{position: 'absolute', right: 34, top: 58}}><Button label={TEXT.A.createAction} x={0} y={0} /></div></div>
    <Check label={TEXT.A.accessCheck} x={320} y={414} delay={0.65}/>
    <Check label={TEXT.A.permissionCheck} x={680} y={414} delay={0.85}/>
  </Window>
  <StepPill label={TEXT.A.captions[0]} />
</>;

const ABucket: React.FC = () => <>
  <Heading title={TEXT.A.create} sub={TEXT.A.sub} />
  <Window title={TEXT.A.browser}>
    <div style={{position: 'absolute', left: 70, top: 52, width: 1080, height: 490, borderRadius: 22, background: '#fff', border: '1px solid #E1E8F4', boxShadow: '0 16px 34px rgba(14,27,77,.08)'}}>
      <div style={{position: 'absolute', left: 42, top: 28}}><Tx size={28} color={TUT.navy}>{TEXT.A.create}</Tx></div>
      <Field label={TEXT.A.bucketLabel} value={TEXT.A.bucket} x={44} y={104} w={650} active delay={0.2}/>
      <Field label={TEXT.A.regionLabel} value={TEXT.A.region} x={44} y={240} w={650} delay={0.55}/>
      <div style={{position: 'absolute', right: 54, top: 115, width: 240, height: 180, borderRadius: 22, background: 'linear-gradient(145deg,#EEF7FF,#DFEBFF)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><IconChip name="cloud" size={124} c={TUT.blue}/></div>
      <Button label={TEXT.A.createAction} x={44} y={370} gold/>
      <div style={{position: 'absolute', right: 60, bottom: 38, opacity: ease(useSec(), 1.4, .5)}}><Tx size={18} color={TUT.slate} w={400}>{TEXT.A.storageFoot}</Tx></div>
    </div>
    <div style={{position: 'absolute', right: 70, top: 165, padding: '16px 22px', borderRadius: 20, background: '#E5F8EF', boxShadow: '0 5px 0 #A8E4C6', opacity: ease(useSec(), 1.4, .4), transform: `translateY(${(1 - ease(useSec(), 1.4, .4)) * -20}px)`}}><Tx size={20} color="#118454">{TEXT.A.created}</Tx></div>
  </Window>
  <StepPill label={TEXT.A.captions[1]} color={TUT.gold}/>
</>;

const AToken: React.FC = () => <>
  <Heading title={TEXT.A.credentials} sub={TEXT.A.permission} />
  <Window title={TEXT.A.browser}>
    <div style={{position: 'absolute', left: 80, top: 52, width: 760, height: 500, borderRadius: 22, background: '#fff', border: '1px solid #E1E8F4', boxShadow: '0 16px 34px rgba(14,27,77,.08)'}}>
      <div style={{position: 'absolute', left: 34, top: 27, display: 'flex', gap: 12, alignItems: 'center'}}><IconChip name="save" size={42} c={TUT.green}/><Tx size={24} color={TUT.navy}>{TEXT.A.credentials}</Tx></div>
      <Check label={TEXT.A.scope} x={36} y={98}/>
      <Field label={TEXT.A.accessLabel} value={TEXT.A.key} x={36} y={160} w={660} mono delay={0.2}/>
      <Field label={TEXT.A.secretLabel} value={TEXT.A.secret} x={36} y={294} w={660} mono delay={0.45}/>
      <div style={{position: 'absolute', left: 36, top: 426, padding: '10px 18px', borderRadius: 11, background: '#E8F8F0', opacity: ease(useSec(), 1.2, .4)}}><Tx size={17} color="#118454">{TEXT.A.copy}</Tx></div>
    </div>
    <div style={{position: 'absolute', left: 900, top: 185, width: 255, height: 210, borderRadius: 30, background: 'linear-gradient(145deg,#E7F4FF,#D6E9FF)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 0 #C1D8F5'}}><IconChip name="copy" size={82} c={TUT.deep}/><div style={{marginTop: 16}}><Tx size={20} color={TUT.deep}>{TEXT.A.copy}</Tx></div></div>
    <div style={{position: 'absolute', right: 55, top: 430, opacity: ease(useSec(), .8, .4), transform: `translateX(${(1 - ease(useSec(), .8, .5)) * 100}px)`}}><Chip w={210} h={66} r={30} c={TUT.blue} depth={8}><Tx size={20} color="#fff">{TEXT.A.key}</Tx></Chip></div>
  </Window>
  <StepPill label={TEXT.A.captions[2]} color={TUT.orange}/>
</>;

const AConnect: React.FC = () => <>
  <Heading title={TEXT.A.magicbolt} sub={TEXT.A.integration} />
  <Window title={TEXT.A.magicbolt}>
    <div style={{position: 'absolute', left: 72, top: 40, width: 1100, height: 500, borderRadius: 22, background: '#fff', border: '1px solid #E1E8F4', boxShadow: '0 16px 34px rgba(14,27,77,.08)'}}>
      <div style={{position: 'absolute', left: 44, top: 28, display: 'flex', alignItems: 'center', gap: 16}}><IconChip name="cloud" size={50} c={TUT.blue}/><Tx size={26} color={TUT.navy}>{TEXT.A.integration}</Tx></div>
      <Field label={TEXT.A.bucketLabel} value={TEXT.A.bucket} x={44} y={106} w={470} delay={0.15}/>
      <Field label={TEXT.A.accessLabel} value={TEXT.A.key} x={570} y={106} w={460} mono delay={0.3}/>
      <Field label={TEXT.A.secretLabel} value={TEXT.A.secret} x={44} y={242} w={470} mono delay={0.45}/>
      <Field label={TEXT.A.endpointLabel} value={TEXT.A.endpoint} x={570} y={242} w={460} mono delay={0.6}/>
      <Button label={TEXT.A.save} x={44} y={385}/>
    </div>
    <div style={{position: 'absolute', right: 70, top: 90, opacity: ease(useSec(), 1.35, .45), transform: `scale(${.8 + .2 * ease(useSec(), 1.35, .45)})`}}><Chip w={68} h={68} r={34} c={TUT.green} depth={7}><Tx size={38} color="#fff">✓</Tx></Chip></div>
    <div style={{position: 'absolute', left: 790, bottom: 30, opacity: ease(useSec(), 1.55, .35)}}><Tx size={24} color="#118454">{TEXT.A.success}</Tx></div>
  </Window>
  <StepPill label={TEXT.A.captions[3]} color={TUT.green}/>
</>;

const BOverview: React.FC = () => <>
  <Heading title={TEXT.B.hook} sub={TEXT.B.sub} dark />
  <div style={{position: 'absolute', left: 320, top: 300, display: 'flex', gap: 40, alignItems: 'center'}}>
    {[TEXT.B.step1, TEXT.B.step2, TEXT.B.step3].map((s, i) => {
      const k = ease(useSec(), .25 + i * .25, .5);
      return <React.Fragment key={s}><div style={{width: 360, height: 260, borderRadius: 32, background: 'linear-gradient(145deg,rgba(255,255,255,.18),rgba(255,255,255,.06))', border: '2px solid rgba(255,255,255,.2)', boxShadow: '0 28px 48px rgba(0,0,0,.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: k, transform: `translateY(${(1-k)*50}px) scale(${.92+.08*k})`}}>
        <IconChip name={i === 0 ? 'cloud' : i === 1 ? 'copy' : 'save'} size={96} c={i === 1 ? TUT.gold : i === 2 ? TUT.blue : TUT.orange}/>
        <Tx size={25} color="#fff">{s}</Tx>
      </div>{i < 2 && <div style={{margin: -28, opacity: k, color: TUT.gold, fontSize: 46, fontWeight: 700}}>›</div>}</React.Fragment>;
    })}
  </div>
  <div style={{position: 'absolute', right: 128, top: 160, opacity: ease(useSec(), .6, .5), transform: `rotate(${useSec()*4}deg)`}}><CloudMark size={150}/></div>
  <StepPill label={TEXT.B.captions[0]} dark color={TUT.gold}/>
</>;

const BBucket: React.FC = () => <>
  <Heading title={TEXT.B.step1} dark />
  <div style={{position: 'absolute', left: 180, top: 280}}>
    <Window title={TEXT.B.cloud} dark x={0} y={0} w={790} h={540}>
      <div style={{position: 'absolute', left: 42, top: 32}}><Tx size={26} color="#fff">{TEXT.B.bucketLabel}</Tx></div>
      <Field label={TEXT.B.bucketLabel} value={TEXT.B.bucket} x={42} y={96} w={470} dark active delay={.3}/>
      <div style={{position: 'absolute', left: 42, top: 228, padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,.1)'}}><Tx size={18} color="#D8E3FF" w={400}>{TEXT.B.region}</Tx></div>
      <Button label={TEXT.A.createAction} x={42} y={326} gold/>
      <div style={{position: 'absolute', right: 55, bottom: 38, opacity: ease(useSec(), 1.45, .4)}}><Tx size={20} color="#A9F0D0">{TEXT.B.created}</Tx></div>
    </Window>
    <div style={{position: 'absolute', left: 515, top: 100, transform: `translateY(${Math.sin(useSec()*2)*6}px)`}}><CloudMark size={210}/></div>
  </div>
  <StepPill label={TEXT.B.captions[1]} dark color={TUT.blue}/>
</>;

const BCredentials: React.FC = () => {
  const t = useSec();
  const fly = ease(t, .85, .8);
  return <>
    <Heading title={TEXT.B.step2} dark />
    <Window title={TEXT.B.cloud} dark x={135} y={290} w={770} h={530}>
      <div style={{position: 'absolute', left: 38, top: 32}}><Tx size={25} color="#fff">{TEXT.B.token}</Tx></div>
      <Field label={TEXT.B.scope} value={TEXT.B.bucket} x={38} y={100} w={660} dark delay={.2}/>
      <Field label={TEXT.B.keyLabel} value={TEXT.B.key} x={38} y={230} w={660} dark mono delay={.35}/>
      <Field label={TEXT.B.secretLabel} value={TEXT.B.secret} x={38} y={360} w={660} dark mono delay={.5}/>
    </Window>
    <svg width="450" height="260" viewBox="0 0 450 260" style={{position: 'absolute', left: 710, top: 490, overflow: 'visible'}}><path d="M0 180C120 20 290 20 430 115" fill="none" stroke={`url(#beam-${Math.round(t*24)})`} strokeWidth="8" strokeDasharray="12 17" strokeDashoffset={-t*120} opacity={.65}/><defs><linearGradient id={`beam-${Math.round(t*24)}`}><stop stopColor={TUT.gold}/><stop offset="1" stopColor={TUT.blue}/></linearGradient></defs></svg>
    <div style={{position: 'absolute', left: 965, top: 410, transform: `translate(${(1-fly)*-120}px,${(1-fly)*40}px) scale(${.7+.3*fly})`, opacity: fly}}><Chip w={360} h={132} r={28} c={TUT.deep} depth={12}><div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center'}}><Tx size={17} color="#DCE9FF">{TEXT.B.keyLabel}</Tx><Tx size={21} color="#fff">{TEXT.B.key}</Tx></div></Chip></div>
    <div style={{position: 'absolute', right: 120, top: 330, width: 440, height: 420, borderRadius: 40, background: 'linear-gradient(145deg,#fff,#E8F1FF)', border: '3px solid rgba(255,255,255,.6)', boxShadow: '0 30px 70px rgba(0,0,0,.38)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, transform: `translateY(${(1-ease(t,.3,.5))*34}px)`, opacity: ease(t,.3,.5)}}>
      <BoltMark size={105}/><Tx size={23} color={TUT.navy}>{TEXT.B.bolt}</Tx><Tx size={17} color={TUT.slate}>{TEXT.B.integration}</Tx>
    </div>
    <StepPill label={TEXT.B.captions[2]} dark color={TUT.gold}/>
  </>;
};

const BConnect: React.FC = () => {
  const t = useSec(); const k = ease(t, .25, .5); const success = ease(t, 1.55, .35);
  return <>
    <Heading title={TEXT.B.step3} dark />
    <div style={{position: 'absolute', left: 180, top: 300, width: 1560, height: 510, borderRadius: 40, background: 'linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.04))', border: '2px solid rgba(255,255,255,.17)', boxShadow: '0 34px 80px rgba(0,0,0,.33)', opacity: k}}>
      <div style={{position: 'absolute', left: 50, top: 42, display: 'flex', alignItems: 'center', gap: 16}}><CloudMark size={70}/><Tx size={24} color="#fff">{TEXT.B.cloud}</Tx></div>
      <div style={{position: 'absolute', right: 52, top: 42, display: 'flex', alignItems: 'center', gap: 10}}><BoltMark size={58}/><Tx size={24} color="#fff">{TEXT.B.bolt}</Tx></div>
      <div style={{position: 'absolute', left: 50, top: 145, width: 570, height: 282, borderRadius: 26, background: 'rgba(9,20,59,.7)', border: '1px solid rgba(255,255,255,.13)'}}>
        <Field label={TEXT.B.bucketLabel} value={TEXT.B.bucket} x={28} y={30} w={500} dark mono delay={.2}/>
        <Field label={TEXT.B.keyLabel} value={TEXT.B.key} x={28} y={140} w={500} dark mono delay={.4}/>
      </div>
      <div style={{position: 'absolute', right: 50, top: 145, width: 570, height: 282, borderRadius: 26, background: 'linear-gradient(150deg,#fff,#E9F1FF)', boxShadow: '0 8px 0 #C8D8F2'}}>
        <div style={{position: 'absolute', left: 28, top: 22}}><Tx size={22} color={TUT.navy}>{TEXT.B.integration}</Tx></div>
        <Field label={TEXT.B.bucketLabel} value={TEXT.B.bucket} x={28} y={90} w={500} mono delay={.5}/>
        <Button label={TEXT.B.save} x={28} y={205}/>
      </div>
      <div style={{position: 'absolute', left: 650, top: 230, width: 260, height: 100, borderRadius: 50, background: 'linear-gradient(90deg,#FDC60B,#1582D5)', boxShadow: '0 0 45px #46A9FF77', opacity: success, transform: `scaleX(${.7 + .3 * success})`}} />
      <div style={{position: 'absolute', left: 670, bottom: 24, opacity: success, transform: `translateY(${(1-success)*20}px)`}}><Chip w={280} h={62} r={31} c={TUT.green} depth={7}><Tx size={21} color="#fff">{TEXT.B.success}</Tx></Chip></div>
    </div>
    <StepPill label={TEXT.B.captions[3]} dark color={TUT.green}/>
  </>;
};

const Moment: React.FC<{kind: Kind; scene: number}> = ({kind, scene}) => {
  const t = useSec();
  const Component = kind === 'a' ? [AOverview, ABucket, AToken, AConnect][scene] : [BOverview, BBucket, BCredentials, BConnect][scene];
  const out = P(t, TUT.moment - .38, .38);
  return <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 + .018 * out})`}}><Component/></AbsoluteFill>;
};

export const TutorialConcepts: React.FC<{concept?: Kind}> = ({concept = 'a'}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const kind: Kind = concept === 'b' ? 'b' : 'a';
  const dark = kind === 'b';
  const scene = Math.min(1, Math.floor(frame / (TUT.moment * fps)));
  const moments = kind === 'a' ? [0, 3] : [0, 3];
  return <AbsoluteFill style={{overflow: 'hidden', background: dark ? `radial-gradient(ellipse at 50% 0%,#1A3B86,#0E1B4D 60%,#081238)` : undefined}}>
    {!dark && <Backdrop/>}
    {dark && <><Glow x={310} y={330} color={TUT.blue} size={740}/><Glow x={1630} y={790} color={TUT.orange} size={660}/><div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,255,255,.08) 1.5px,transparent 2px)',backgroundSize:'42px 42px',opacity:.3}}/></>}
    {[0, 1].map((i) => <SceneSeq key={i} start={i * TUT.moment} dur={TUT.moment} xfade={0.35} {...transitionFor(i, 2)}>
      <CameraRig level={1} dur={TUT.moment}><SpringIn at={0.1} level={2}><Moment kind={kind} scene={moments[i]}/></SpringIn></CameraRig>
    </SceneSeq>)}
    <Sequence from={0} durationInFrames={TUT.moment * TUT.moments * fps}>
      <Particles level={1} colors={[TUT.blue, TUT.gold, TUT.orange]} seed={23}/>
      <Obj3D kind="bubble" x={1710} y={240} size={120} at={0.4} level={1}/>
    </Sequence>
  </AbsoluteFill>;
};

/** Full approved concept A: title, four tutorial beats, then the unedited logo ending. */
export const TutorialFull: React.FC = () => {
  const {fps} = useVideoConfig();
  const frames = (s: number) => Math.round(s * fps);
  const names = ['Overview', 'Create bucket', 'Create scoped token', 'Connect storage'];
  const components = [AOverview, ABucket, AToken, AConnect];
  let start = FULL.titleSec;
  const stages = components.map((Component, i) => {
    const scene = FULL.scenes[i];
    const at = start;
    start += scene.dur;
    return <SceneSeq key={scene.name} start={at} dur={scene.dur} xfade={0.35} {...transitionFor(i, 2)} name={names[i]}>
      <CameraRig level={1} dur={scene.dur}><SpringIn at={0.12} level={2}><Component/></SpringIn></CameraRig>
    </SceneSeq>;
  });
  const captionStages = FULL.scenes.map((scene, i) => {
    const at = FULL.titleSec + FULL.scenes.slice(0, i).reduce((sum, s) => sum + s.dur, 0);
    return <Sequence key={`caption-${i}`} from={frames(at)} durationInFrames={frames(scene.dur)}>
      <StepPill label={TEXT.A.captions[i]} color={[TUT.deep, TUT.gold, TUT.orange, TUT.green][i]}/>
    </Sequence>;
  });
  return <AbsoluteFill style={{background: '#F5F8FF', overflow: 'hidden'}}>
    <Backdrop/>
    <SceneSeq start={0} dur={FULL.titleSec} first name="Title"><TitleCard title={TEXT.A.title} eyebrow={TEXT.A.eyebrow} sub={TEXT.A.titleSub} dur={FULL.titleSec}/></SceneSeq>
    {stages}
    {captionStages}
    <Sequence from={frames(FULL.titleSec)} durationInFrames={frames(FULL.middleSec)}>
      <Particles level={1} colors={[TUT.blue, TUT.gold, TUT.orange]} seed={23}/>
      <Obj3D kind="bubble" x={1700} y={180} size={112} at={0.4} level={1}/>
    </Sequence>
    <SceneSeq start={FULL.endStartSec} dur={FULL.endSec} last name="EndLogo"><EndLogo/></SceneSeq>
  </AbsoluteFill>;
};
