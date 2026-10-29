// Scene transitions. Look option "Scene transitions". Replaces a hand-written Sequence + fade wrapper:
//   <SceneSeq start={SCENES.hook.start} dur={SCENES.hook.dur} type="slide" first><Hook/></SceneSeq>
// Each scene overlaps the next by `xfade` seconds, exactly like the existing videos.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {P, eio, eo, lerp, seeded, useSec} from './core';

/** fade..blur are the original six (transitionFor rotates through them); the rest are pick-by-name (see catalog) */
export type TransitionType = 'fade' | 'slide' | 'wipe' | 'flip' | 'zoom' | 'blur' | 'iris' | 'split' | 'shutter' | 'push' | 'glitch' | 'cube';

/** Light = polished fades; Full = a designed rotation of transitions (alternating slide direction) */
export const transitionFor = (i: number, level: 1 | 2): {type: TransitionType; dir: 1 | -1} =>
  level === 1 ? {type: 'fade', dir: 1} : {type: (['slide', 'zoom', 'wipe', 'flip', 'blur'] as const)[i % 5], dir: i % 2 === 0 ? 1 : -1};

const Trans: React.FC<{dur: number; xfade: number; type: TransitionType; dir: 1 | -1; first?: boolean; last?: boolean; children?: React.ReactNode}> = ({dur, xfade, type, dir, first, last, children}) => {
  const t = useSec();
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const kin = first ? 1 : eo(P(t, 0, xfade));
  const kout = last ? 0 : eio(P(t, dur, xfade));
  let style: React.CSSProperties;
  switch (type) {
    case 'slide':
      style = {transform: `translateX(${(1 - kin) * width * 0.5 * dir - kout * width * 0.18 * dir}px)`, opacity: Math.min(1, kin * 1.6) * (1 - kout * 0.9)};
      break;
    case 'wipe': // the new scene is revealed over the old one, which stays put underneath
      style = {clipPath: `inset(0 ${(1 - kin) * 100 * (dir > 0 ? 1 : 0)}% 0 ${(1 - kin) * 100 * (dir > 0 ? 0 : 1)}%)`};
      break;
    case 'flip':
      style = {transform: `perspective(2200px) rotateY(${(1 - kin) * -70 * dir + kout * 70 * dir}deg)`, opacity: Math.min(1, kin * 1.8) * (1 - kout), transformOrigin: '50% 50%'};
      break;
    case 'zoom':
      style = {transform: `scale(${lerp(1.35, 1, kin) * lerp(1, 0.75, kout)})`, opacity: Math.min(1, kin * 1.6) * (1 - kout)};
      break;
    case 'blur':
      style = {filter: `blur(${(1 - kin) * 22 + kout * 22}px)`, opacity: Math.min(1, kin * 1.5) * (1 - kout), transform: `scale(${lerp(1.04, 1, kin)})`};
      break;
    case 'iris': // the new scene opens as a circle from the centre
      style = {clipPath: `circle(${kin * 75}% at 50% 50%)`, opacity: 1 - kout * 0.6, transform: `scale(${lerp(1, 0.94, kout)})`};
      break;
    case 'split': // the new scene opens from the middle outwards
      style = {clipPath: `inset(0 ${(1 - kin) * 50}% 0 ${(1 - kin) * 50}%)`, opacity: 1 - kout * 0.6};
      break;
    case 'shutter': { // horizontal blinds open to reveal the new scene
      const band = height / 8, mask = `repeating-linear-gradient(180deg, #000 0px, #000 ${kin * band}px, transparent ${kin * band}px, transparent ${band}px)`;
      style = {WebkitMaskImage: mask, maskImage: mask, opacity: 1 - kout * 0.6};
      break;
    }
    case 'push': // the new scene pushes the old one out, both at full opacity
      style = {transform: `translateX(${(1 - kin) * width * dir - kout * width * dir}px)`};
      break;
    case 'glitch': { // RGB split and jitter that settle (scene change only, so the first scene stays clean)
      const rnd = seeded(frame * 7919 + 13), s = (1 - kin + kout) * 26, j = (rnd() - 0.5) * 2;
      style = {transform: `translateX(${j * s}px) skewX(${j * s * 0.15}deg)`, filter: `drop-shadow(${s * 0.8}px 0 0 rgba(255,0,90,0.65)) drop-shadow(${-s * 0.8}px 0 0 rgba(0,220,255,0.65))`, opacity: kin > 0.99 && kout < 0.01 ? 1 : Math.min(1, 0.35 + kin * 0.65) * (1 - kout * 0.7)};
      break;
    }
    case 'cube': // a quarter-turn around the shared edge
      style = {transform: `perspective(2400px) rotateY(${(1 - kin) * 90 * dir - kout * 90 * dir}deg)`, transformOrigin: `${dir > 0 ? 0 : 100}% 50%`, opacity: Math.min(1, kin * 2) * (1 - kout * 0.8)};
      break;
    default: // fade
      style = {opacity: kin * (1 - kout), transform: `scale(${lerp(1.05, 1, kin) * lerp(1, 0.97, kout)})`};
  }
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const SceneSeq: React.FC<{start: number; dur: number; xfade?: number; type?: TransitionType; dir?: 1 | -1; first?: boolean; last?: boolean; name?: string; children?: React.ReactNode}> = ({start, dur, xfade = 0.35, type = 'fade', dir = 1, first, last, name, children}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={Math.round(start * fps)} durationInFrames={Math.round((dur + (last ? 0 : xfade)) * fps)} name={name}>
      <Trans dur={dur} xfade={xfade} type={type} dir={dir} first={first} last={last}>{children}</Trans>
    </Sequence>
  );
};
