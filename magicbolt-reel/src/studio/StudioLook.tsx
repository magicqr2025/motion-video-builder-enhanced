// Finishing layer over a studio video, set in the Studio's "Look & feel" tab (src/studio/<id>/look.json).
// registry.tsx wraps the project's compositions with it. Levels: 0 off, 1 light, 2 full.
// Motion blur and sound effects only apply to a real render (not the live preview, concept stills or draft renders).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, getRemotionEnvironment, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';

export type LookConfig = {
  grain: number;
  vignette: number;
  grade: number;
  gradeMood: string;
  leaks: number;
  motionBlur: number;
  sfx: number;
  sceneStarts: number[]; // seconds, from the storyboard
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const GRADE: Record<string, {filter: (l: number) => string; tint?: string; blend?: string}> = {
  neutral: {filter: (l) => `contrast(${1 + 0.04 * l}) saturate(${1 + 0.06 * l})`},
  warm: {filter: (l) => `contrast(${1 + 0.04 * l}) saturate(${1 + 0.08 * l}) sepia(${0.05 * l})`, tint: '#FF9A4D'},
  cool: {filter: (l) => `contrast(${1 + 0.04 * l}) saturate(${1 + 0.05 * l})`, tint: '#4D8DFF'},
  cinematic: {filter: (l) => `contrast(${1 + 0.07 * l}) saturate(${1 - 0.04 * l})`, tint: 'linear-gradient(180deg, #0B6B8A 0%, #FF8A3D 100%)'},
};

const Grain: React.FC<{level: number}> = ({level}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: level >= 2 ? 0.16 : 0.08, pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        <filter id="studio-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(frame / 2) % 60} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#studio-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{level: number}> = ({level}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(6,10,30,${level >= 2 ? 0.5 : 0.28}) 100%)`}} />
);

const LEAK_SEC = 1.3;
const Leaks: React.FC<{level: number; starts: number[]}> = ({level, starts}) => {
  const frame = useCurrentFrame();
  const {fps, width, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const real = starts.filter((s) => s > 0.5);
  const times = real.length ? real.filter((_, i) => level >= 2 || i % 2 === 0) : Array.from({length: Math.floor(durationInFrames / fps / 6)}, (_, i) => (i + 1) * 6);
  const leak = times.map((s) => ({s, p: (t - (s - 0.2)) / LEAK_SEC})).find((x) => x.p >= 0 && x.p <= 1);
  if (!leak) return null;
  const alpha = Math.sin(Math.PI * leak.p) * (level >= 2 ? 0.55 : 0.32);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', opacity: alpha}}>
      <div style={{position: 'absolute', top: '-10%', bottom: '-10%', width: width * 0.7, left: lerp(-width * 0.8, width * 1.1, leak.p), transform: 'skewX(-14deg)', filter: 'blur(60px)', background: 'linear-gradient(90deg, rgba(255,120,60,0) 0%, rgba(255,105,70,0.85) 38%, rgba(255,170,90,0.85) 58%, rgba(255,150,190,0) 100%)'}} />
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{level: number; starts: number[]}> = ({level, starts}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const real = starts.filter((s) => s > 0.5);
  const hit = (file: string, at: number, volume: number, sec: number) => {
    const from = Math.max(0, Math.round(at * fps));
    if (from >= durationInFrames) return null;
    return <Sequence key={`${file}-${at}`} layout="none" from={from} durationInFrames={Math.round(sec * fps)}><Audio src={staticFile(`sfx/${file}`)} volume={volume} /></Sequence>;
  };
  return (
    <>
      {real.map((s) => hit('whoosh.wav', s - 0.12, level >= 2 ? 0.45 : 0.3, 0.9))}
      {level >= 2 && real.map((s) => hit('pop.wav', s + 0.35, 0.3, 0.3))}
      {level >= 2 && real.length > 0 && hit('chime.wav', real[real.length - 1] + 0.3, 0.35, 1.5)}
    </>
  );
};

const StudioLook: React.FC<{look: LookConfig; still: boolean; draft: boolean; children: React.ReactNode}> = ({look, still, draft, children}) => {
  const rendering = getRemotionEnvironment().isRendering;
  const blur = !still && !draft && rendering && look.motionBlur > 0;
  const grade = look.grade > 0 ? GRADE[look.gradeMood] ?? GRADE.neutral : null;
  const inner = blur
    ? <CameraMotionBlur shutterAngle={look.motionBlur >= 2 ? 180 : 100} samples={look.motionBlur >= 2 ? 10 : 6}>{children}</CameraMotionBlur>
    : children;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={grade ? {filter: grade.filter(look.grade)} : undefined}>{inner}</AbsoluteFill>
      {grade?.tint && <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'soft-light', opacity: 0.22 * look.grade, background: grade.tint}} />}
      {look.leaks > 0 && <Leaks level={look.leaks} starts={look.sceneStarts ?? []} />}
      {look.vignette > 0 && <Vignette level={look.vignette} />}
      {look.grain > 0 && <Grain level={look.grain} />}
      {look.sfx > 0 && !still && !draft && <Sfx level={look.sfx} starts={look.sceneStarts ?? []} />}
    </AbsoluteFill>
  );
};

// registry.tsx wraps every composition of a project with this
export const withStudioLook = (Comp: React.FC<any>, look: LookConfig, still: boolean): React.FC<any> => {
  const Wrapped: React.FC<any> = (props) => (
    <StudioLook look={look} still={still} draft={!!props.lookDraft}>
      <Comp {...props} />
    </StudioLook>
  );
  return Wrapped;
};
