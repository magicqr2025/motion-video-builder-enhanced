import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TimeCtx, fontFamily} from '../components/kit';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, M, VIDEO} from './config';
import {Iris, Shot, Sky} from './kit';
import {Bored, Hook, RateBill, Swap, Versus, Wow} from './ScenesA';
import {Cta, Dashboard, Identity, NoCode, Offer, WhiteLabel} from './ScenesB';

// Scene order. Starts are derived from each scene's `dur`.
const SHOTS: {dur: number; El: React.FC}[] = [
  {dur: S1.dur, El: Hook},
  {dur: S2.dur, El: Swap},
  {dur: S3.dur, El: Bored},
  {dur: S4.dur, El: Wow},
  {dur: S5.dur, El: Versus},
  {dur: S6.dur, El: RateBill},
  {dur: S7.dur, El: NoCode},
  {dur: S8.dur, El: WhiteLabel},
  {dur: S9.dur, El: Dashboard},
  {dur: S10.dur, El: Identity},
  {dur: S11.dur, El: Offer},
  {dur: S12.dur, El: Cta},
];
const TIMELINE = SHOTS.reduce<{start: number; dur: number; El: React.FC}[]>(
  (acc, s) => [...acc, {start: acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].dur : 0, dur: s.dur, El: s.El}], []);

export const SAAS_DURATION = TIMELINE.reduce((sum, s) => sum + s.dur, 0);

const IRIS = [M.blue, M.gold, M.pink];

export const SaasReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill style={{fontFamily, overflow: 'hidden'}}>
        <Sky />
        {TIMELINE.map(({start, dur, El}, i) => (
          <Shot key={i} start={start} dur={dur} first={i === 0} last={i === TIMELINE.length - 1}><El /></Shot>
        ))}
        {TIMELINE.slice(1).map(({start}, i) => <Iris key={i} at={start} color={IRIS[i % IRIS.length]} />)}
        {VIDEO.voiceover && <Audio src={staticFile(VIDEO.voiceover)} />}
        {VIDEO.music && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} />}
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
