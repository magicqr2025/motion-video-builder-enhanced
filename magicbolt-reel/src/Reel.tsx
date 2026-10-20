import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {SCENES, VIDEO} from './config';
import {TimeCtx, P, fontFamily} from './components/kit';
import {Background} from './components/graphics';
import {Scene1} from './scenes/Scene1';
import {Scene2} from './scenes/Scene2';
import {Scene3} from './scenes/Scene3';
import {Scene4} from './scenes/Scene4';
import {Scene5} from './scenes/Scene5';
import {Scene6} from './scenes/Scene6';
import {Scene7} from './scenes/Scene7';
import {Scene8} from './scenes/Scene8';
import {Scene} from './components/kit';

export const Reel = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps; // global seconds — all config times are in seconds
  const flash = P(t, 5.82, 0.35);
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill style={{fontFamily, overflow: 'hidden'}}>
        <Background />
        <Scene start={SCENES.s1[0]} end={SCENES.s1[1]} first><Scene1 /></Scene>
        <Scene start={SCENES.s2[0]} end={SCENES.s2[1]}><Scene2 /></Scene>
        <Scene start={SCENES.s3[0]} end={SCENES.s3[1]}><Scene3 /></Scene>
        <Scene start={SCENES.s4[0]} end={SCENES.s4[1]}><Scene4 /></Scene>
        <Scene start={SCENES.s5[0]} end={SCENES.s5[1]}><Scene5 /></Scene>
        <Scene start={SCENES.s6[0]} end={SCENES.s6[1]}><Scene6 /></Scene>
        <Scene start={SCENES.s7[0]} end={SCENES.s7[1]}><Scene7 /></Scene>
        <Scene start={SCENES.s8[0]} end={SCENES.s8[1]} last><Scene8 /></Scene>
        {flash > 0 && flash < 1 && <AbsoluteFill style={{background: '#fff', opacity: 0.7 * Math.sin(Math.PI * flash)}} />}
        <Audio src={staticFile(VIDEO.voiceover)} />
        {VIDEO.sfx && <Audio src={staticFile(VIDEO.sfx)} volume={0.9} />}
        {VIDEO.music && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} />}
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
