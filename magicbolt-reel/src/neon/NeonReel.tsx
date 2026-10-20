import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TimeCtx} from '../components/kit';
import {S1, S2, S3, S4, S5, S6, S7, S9, S10, S11, S12, N, VIDEO} from './config';
import {FB, Shot, Shutter, Stage} from './kit';
import {Client, Hook, Split, Tools} from './ScenesA';
import {Features, Reveal, WhiteLabel} from './ScenesB';
import {Cta, Offer, Risk, Trial} from './ScenesC';

// Scene order. Starts are derived from each scene's `dur`.
const SHOTS: {dur: number; El: React.FC}[] = [
  {dur: S1.dur, El: Hook},
  {dur: S2.dur, El: Tools},
  {dur: S3.dur, El: Split},
  {dur: S4.dur, El: Client},
  {dur: S5.dur, El: Reveal},
  {dur: S6.dur, El: Features},
  {dur: S7.dur, El: WhiteLabel},
  {dur: S9.dur, El: Offer},
  {dur: S10.dur, El: Trial},
  {dur: S11.dur, El: Risk},
  {dur: S12.dur, El: Cta},
];
const TIMELINE = SHOTS.reduce<{start: number; dur: number; El: React.FC}[]>(
  (acc, s) => [...acc, {start: acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].dur : 0, dur: s.dur, El: s.El}], []);

export const NEON_DURATION = TIMELINE.reduce((sum, s) => sum + s.dur, 0);

export const NeonReel = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill style={{fontFamily: FB, overflow: 'hidden'}}>
        <Stage />
        {TIMELINE.map(({start, dur, El}, i) => (
          <Shot key={i} start={start} dur={dur} first={i === 0} last={i === TIMELINE.length - 1}><El /></Shot>
        ))}
        {TIMELINE.slice(1).map(({start}, i) => <Shutter key={i} at={start} />)}
        <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: `${(t / NEON_DURATION) * 100}%`, background: N.lime, boxShadow: `0 0 24px ${N.lime}`}} />
        {VIDEO.voiceover && <Audio src={staticFile(VIDEO.voiceover)} />}
        {VIDEO.music && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} />}
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
