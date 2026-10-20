import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TimeCtx, fontFamily} from '../components/kit';
import {S1, S2, S3, S4, SR, S5, S6, S7, S8, S9, S10, S11, Q, VIDEO} from './config';
import {Iris, Shot, Sky} from './kit';
import {Captions} from './captions';
import {Hook, Low, Rate, Scan, Title, Why} from './ScenesA';
import {Close, For, High, Post, Product, Rank} from './ScenesB';

// Scene order. Starts are derived from each scene's `dur`.
const SHOTS: {dur: number; El: React.FC}[] = [
  {dur: S1.dur, El: Hook},
  {dur: S2.dur, El: Why},
  {dur: S3.dur, El: Title},
  {dur: S4.dur, El: Scan},
  {dur: SR.dur, El: Rate},
  {dur: S5.dur, El: Low},
  {dur: S6.dur, El: High},
  {dur: S7.dur, El: Post},
  {dur: S8.dur, El: Rank},
  {dur: S9.dur, El: For},
  {dur: S10.dur, El: Product},
  {dur: S11.dur, El: Close},
];
const TIMELINE = SHOTS.reduce<{start: number; dur: number; El: React.FC}[]>(
  (acc, s) => [...acc, {start: acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].dur : 0, dur: s.dur, El: s.El}], []);

export const QR_DURATION = TIMELINE.reduce((sum, s) => sum + s.dur, 0);

const IRIS = [Q.purple, Q.pink, Q.yellow];

// clean: no captions and no cut transitions — used for exporting single steps as GIFs
export const QrReel: React.FC<{clean?: boolean}> = ({clean}) => {
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
        {!clean && TIMELINE.slice(1).map(({start}, i) => <Iris key={i} at={start} color={IRIS[i % IRIS.length]} />)}
        {!clean && VIDEO.captions && <Captions />}
        {VIDEO.voiceover && <Audio src={staticFile(VIDEO.voiceover)} />}
        {VIDEO.music && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} />}
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
