// The soundtrack of every studio video. Settings live in src/studio/<id>/audio.json, which the Video Studio's
// Audio tab edits; the generated registry.tsx wraps the video with <StudioAudio/> when that file exists, so a
// video's own code must NOT render <Audio> for its voiceover or music.
// All numbers are seconds on the video timeline unless named *Sec of the source file.
import React from 'react';
import {Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type AudioTrack = {
  src: string | null; // path under public/, e.g. "studio/<id>/vo.mp3"
  volume: number; // 0..1
  muted: boolean;
  startSec: number; // where the track starts on the video timeline
  trimStartSec: number; // skip this much of the file
  trimEndSec: number | null; // stop at this point of the file (null = play to its end)
  durationSec: number | null; // length of the file (filled in by the studio)
};
export type MusicTrack = AudioTrack & {
  loop: boolean;
  fadeInSec: number;
  fadeOutSec: number;
  duck: boolean; // lower the music while the voiceover speaks
  duckLevel: number; // music level during the voiceover, as a fraction of its volume
};
export type AudioConfig = {voiceover?: AudioTrack; music?: MusicTrack};

const ramp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const k = ramp(x); return k * k * (3 - 2 * k); };

// [start, end] of one pass of the track on the timeline
const pass = (t: AudioTrack, totalSec: number): [number, number] => {
  const from = Math.max(0, t.startSec ?? 0);
  const srcEnd = t.trimEndSec ?? t.durationSec;
  const len = srcEnd == null ? totalSec - from : Math.max(0, srcEnd - (t.trimStartSec ?? 0));
  return [from, from + len];
};

const Track: React.FC<{track: AudioTrack; totalSec: number; gain: (tSec: number) => number; loop?: boolean}> = ({track, totalSec, gain, loop}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!track.src || track.muted) return null;
  const [start, end] = pass(track, totalSec);
  const len = end - start;
  if (len <= 0) return null;
  const srcEnd = track.trimEndSec ?? track.durationSec;
  const repeats = loop && srcEnd != null ? Math.max(1, Math.ceil((totalSec - start) / len)) : 1;
  const vol = Math.max(0, Math.min(1, gain(frame / fps)));
  return (
    <>
      {Array.from({length: repeats}, (_, i) => {
        const from = start + i * len;
        if (from >= totalSec) return null;
        return (
          <Sequence key={i} layout="none" from={Math.round(from * fps)} durationInFrames={Math.max(1, Math.round(Math.min(len, totalSec - from + 0.5) * fps))}>
            <Audio src={staticFile(track.src!)} volume={vol} trimBefore={Math.round((track.trimStartSec ?? 0) * fps) || undefined} trimAfter={srcEnd != null ? Math.round(srcEnd * fps) : undefined} />
          </Sequence>
        );
      })}
    </>
  );
};

export const StudioAudio: React.FC<{config: AudioConfig}> = ({config}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const total = durationInFrames / fps;
  const vo = config.voiceover;
  const mu = config.music;
  const voLive = !!vo?.src && !vo.muted;
  const [vs, ve] = vo && voLive ? pass(vo, total) : [0, 0];

  const musicGain = (t: number) => {
    if (!mu) return 0;
    const [ms, me] = pass(mu, total);
    const endT = mu.loop ? total : Math.min(total, me);
    let g = mu.volume;
    if (mu.fadeInSec > 0) g *= smooth((t - ms) / mu.fadeInSec);
    if (mu.fadeOutSec > 0) g *= smooth((endT - t) / mu.fadeOutSec);
    if (mu.duck && voLive && ve > vs) {
      const speech = smooth((t - (vs - 0.4)) / 0.4) * (1 - smooth((t - ve) / 0.8)); // dip just before the voice, recover just after
      g *= 1 - (1 - mu.duckLevel) * speech;
    }
    return g;
  };

  return (
    <>
      {vo && <Track track={vo} totalSec={total} gain={() => vo.volume} />}
      {mu && <Track track={mu} totalSec={total} gain={musicGain} loop={mu.loop} />}
    </>
  );
};

// registry.tsx uses this to add the soundtrack to a project's main composition
export const withStudioAudio = (Comp: React.FC<any>, config: AudioConfig): React.FC<any> => {
  const Wrapped: React.FC<any> = (props) => (
    <>
      <Comp {...props} />
      <StudioAudio config={config} />
    </>
  );
  return Wrapped;
};
