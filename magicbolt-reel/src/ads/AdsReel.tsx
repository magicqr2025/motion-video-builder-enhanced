import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TimeCtx, fontFamily} from '../components/kit';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, Q, VIDEO} from './config';
import {Iris, Shot, Sky} from '../qr/kit';
import {Captions} from './captions';
import {Ask, Factor, Free, Hook, Search, Top3} from './ScenesA';
import {Compare, OneTap, Order, Scan, Suggest, Tagline} from './ScenesB';

// Scene order. Starts are derived from each scene's `dur`.
const SHOTS: {dur: number; El: React.FC}[] = [
  {dur: S1.dur, El: Hook},
  {dur: S2.dur, El: Free},
  {dur: S3.dur, El: Search},
  {dur: S4.dur, El: Top3},
  {dur: S5.dur, El: Factor},
  {dur: S6.dur, El: Ask},
  {dur: S7.dur, El: Scan},
  {dur: S8.dur, El: Suggest},
  {dur: S9.dur, El: OneTap},
  {dur: S10.dur, El: Compare},
  {dur: S11.dur, El: Order},
  {dur: S12.dur, El: Tagline},
];
const TIMELINE = SHOTS.reduce<{start: number; dur: number; El: React.FC}[]>(
  (acc, s) => [...acc, {start: acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].dur : 0, dur: s.dur, El: s.El}], []);

export const ADS_DURATION = TIMELINE.reduce((sum, s) => sum + s.dur, 0);

const IRIS = [Q.purple, Q.pink, Q.yellow];

export const AdsReel: React.FC = () => {
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
        {VIDEO.captions && <Captions />}
        {VIDEO.voiceover && <Audio src={staticFile(VIDEO.voiceover)} />}
        {VIDEO.music && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} />}
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
