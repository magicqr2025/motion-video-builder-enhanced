// Gallery 2 of the effects kit: text reveals, the extra transitions, layouts. Open "Studio-kit-demo-2" in Remotion Studio.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fontFamily} from '../../components/kit';
import {BentoGrid, CardStack, COLORS, LightSweep, Marquee, SceneSeq, SplitLayout, TextReveal, TransitionType} from '../kit';

export const DEMO2 = {fps: 30, width: 1920, height: 1080, dur: 4, xfade: 0.4, types: ['fade', 'iris', 'split', 'shutter', 'push', 'glitch', 'cube'] as TransitionType[]};
export const DEMO2_TOTAL = 4 * 7;

const Bg: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(160deg, #F4F8FF 0%, #E3EEFF 60%, #FFF3DD 100%)'}} />;
const Panel: React.FC<{c: string; label: string}> = ({c, label}) => (
  <div style={{height: '100%', borderRadius: 36, background: `linear-gradient(160deg, ${c}, ${COLORS.navy})`, boxShadow: '0 14px 0 rgba(14,27,77,0.25), 0 34px 60px rgba(14,27,77,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily, fontWeight: 700, fontSize: 44}}>{label}</div>
);
const T = {fontFamily, fontWeight: 800, fontSize: 92, color: COLORS.navy} as const;

const Text1: React.FC = () => (
  <AbsoluteFill style={{padding: '70px 110px'}}>
    <TextReveal text="Mask reveal lines" at={0.2} variant="mask" level={2} style={T} />
    <div style={{height: 30}} />
    <TextReveal text="Springy letters bounce" at={0.6} variant="letters" level={2} style={{...T, color: COLORS.blue}} />
    <div style={{height: 30}} />
    <TextReveal text="Blur into focus" at={1.0} variant="blur" style={T} />
    <div style={{height: 30}} />
    <TextReveal text="SCRAMBLE DECODE 2026" at={1.4} variant="scramble" style={{...T, color: COLORS.orange}} />
    <div style={{height: 30}} />
    <TextReveal text="Typewriter with caret" at={2.0} variant="type" style={{...T, color: COLORS.deep}} />
    <div style={{height: 30}} />
    <TextReveal text="Rise as one block" at={2.6} variant="rise" style={T} />
  </AbsoluteFill>
);
const Split: React.FC = () => <SplitLayout left={<Panel c={COLORS.deep} label="Left panel" />} right={<Panel c={COLORS.orange} label="Right panel" />} ratio={0.55} level={2} />;
const Bento: React.FC = () => (
  <BentoGrid level={2} cells={[
    {col: 1, row: 1, rowSpan: 2, node: <Panel c={COLORS.deep} label="Tall" />}, {col: 2, row: 1, colSpan: 2, node: <Panel c={COLORS.blue} label="Wide" />},
    {col: 2, row: 2, node: <Panel c={COLORS.orange} label="Small" />}, {col: 3, row: 2, node: <Panel c={COLORS.navy} label="Small" />},
  ]} />
);
const Stack: React.FC = () => (
  <AbsoluteFill>
    <CardStack x={960} y={500} w={620} h={420} hold={1.1} level={2} cards={[COLORS.deep, COLORS.blue, COLORS.orange, COLORS.navy].map((c, i) => <Panel key={i} c={c} label={`Card ${i + 1}`} />)} />
    <Marquee y={860} h={110} itemW={360} items={['WhatsApp', 'Leads', 'Follow-ups', 'Automation'].map((s) => <div key={s} style={{fontFamily, fontWeight: 800, fontSize: 54, color: COLORS.slate}}>{s}</div>)} />
    <LightSweep at={0.6} repeatEvery={2} />
  </AbsoluteFill>
);
const Plain: React.FC<{label: string}> = ({label}) => <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><div style={{width: 1200, height: 640}}><Panel c={COLORS.deep} label={label} /></div></AbsoluteFill>;

export const KitDemo2: React.FC = () => {
  const {types, dur, xfade} = DEMO2;
  const parts = [<Text1 key={0} />, <Split key={1} />, <Bento key={2} />, <Stack key={3} />, <Plain key={4} label="push" />, <Plain key={5} label="glitch" />, <Plain key={6} label="cube" />];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Bg />
      {parts.map((p, i) => <SceneSeq key={i} start={i * dur} dur={dur} xfade={xfade} type={types[i]} dir={i % 2 === 0 ? 1 : -1} first={i === 0} last={i === parts.length - 1} name={types[i]}>{p}</SceneSeq>)}
    </AbsoluteFill>
  );
};
