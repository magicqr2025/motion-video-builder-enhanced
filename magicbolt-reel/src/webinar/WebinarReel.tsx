import React from 'react';
import {AbsoluteFill, Audio, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TimeCtx, fontFamily} from '../components/kit';
import {S1, S7, T, VIDEO, W} from './config';
import {GCtx, Shot, Sky, Swipe} from './kit';
import {City} from './city';
import {Captions} from './captions';
import {Hook, Cta} from './ScenesA';
import {CityOverlay} from './ScenesCity';

export const WEBINAR_DURATION = T.end;

// The voiceover is optional: the reel plays silent until the file is dropped into /public
const has = (name: string) => Boolean(name) && getStaticFiles().some((f) => f.name === name);

export const WebinarReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const city = t >= T.s2 - 0.4 && t < T.s7 + 0.1;
  return (
    <GCtx.Provider value={t}>
      <TimeCtx.Provider value={t}>
        <AbsoluteFill style={{fontFamily, overflow: 'hidden'}}>
          <Sky />
          <Shot start={T.s1} dur={S1.dur} first><Hook /></Shot>
          {city && <City t={t} />}
          {city && <CityOverlay />}
          <Shot start={T.s7} dur={S7.dur} last><Cta /></Shot>
          <Swipe at={T.s2} />
          <Swipe at={T.s7} />
          {VIDEO.captions && <Captions />}
          <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: `${(t / WEBINAR_DURATION) * 100}%`, background: `linear-gradient(90deg, ${W.purple}, ${W.pink}, ${W.yellow})`}} />
          {has(VIDEO.voiceover) && <Audio src={staticFile(VIDEO.voiceover)} />}
          {has(VIDEO.music) && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} />}
        </AbsoluteFill>
      </TimeCtx.Provider>
    </GCtx.Provider>
  );
};
