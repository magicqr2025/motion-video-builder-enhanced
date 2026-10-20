import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TimeCtx, fontFamily} from '../components/kit';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, T, VIDEO} from './config';
import {Paper, Shot, Wipe} from './ui';
import {Client, Hook, Split, Tools} from './ScenesPain';
import {Features, Reveal, Stats, WhiteLabel} from './ScenesProduct';
import {Cta, Offer, Risk, Trial} from './ScenesOffer';

// Scene order. Starts are derived from each scene's `dur`; scenes with on: false are skipped.
// `bg` gives a scene a full-bleed colour instead of the grid paper.
const SHOTS: {dur: number; on?: boolean; bg?: string; El: React.FC}[] = [
  {dur: S1.dur, El: Hook},
  {dur: S2.dur, El: Tools},
  {dur: S3.dur, El: Split},
  {dur: S4.dur, El: Client, bg: T.ink},
  {dur: S5.dur, El: Reveal},
  {dur: S6.dur, El: Features},
  {dur: S7.dur, El: WhiteLabel},
  {dur: S8.dur, on: S8.on, El: Stats},
  {dur: S9.dur, El: Offer},
  {dur: S10.dur, El: Trial},
  {dur: S11.dur, El: Risk, bg: T.violet},
  {dur: S12.dur, El: Cta},
];
const TIMELINE = SHOTS.filter((s) => s.on !== false).reduce<{start: number; dur: number; bg?: string; El: React.FC}[]>(
  (acc, s) => [...acc, {start: acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].dur : 0, dur: s.dur, bg: s.bg, El: s.El}], []);

export const AGENCY_DURATION = TIMELINE.reduce((sum, s) => sum + s.dur, 0);

const WIPES = [T.violet, T.yellow, T.pink, T.blue];

export const AgencyReel = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill style={{fontFamily, overflow: 'hidden'}}>
        <Paper />
        {TIMELINE.map(({start, dur, bg, El}, i) => (
          <Shot key={i} start={start} dur={dur} bg={bg} first={i === 0} last={i === TIMELINE.length - 1}><El /></Shot>
        ))}
        {TIMELINE.slice(1).map(({start}, i) => <Wipe key={i} at={start} color={WIPES[i % WIPES.length]} />)}
        <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: `${(t / AGENCY_DURATION) * 100}%`, background: T.violet, borderRight: `6px solid ${T.ink}`}} />
        {VIDEO.voiceover && <Audio src={staticFile(VIDEO.voiceover)} />}
        {VIDEO.music && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} />}
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
