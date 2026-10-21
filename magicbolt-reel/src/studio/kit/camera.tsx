// Camera moves: wrap a scene's content. Look option "Camera moves".
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Level, eio, keyframed, lerp, useSec} from './core';

type Key = {t: number; x: number; y: number; scale: number}; // focus point (px) and zoom at time t (scene seconds)

/**
 * Slow push-in (Light) or push-in with drift (Full). Pass `keys` to glide to specific parts instead:
 *   <CameraRig keys={[{t: 0, x: 960, y: 540, scale: 1}, {t: 2, x: 1300, y: 400, scale: 1.6}]}>
 */
export const CameraRig: React.FC<{level?: Level; dur?: number; keys?: Key[]; children?: React.ReactNode}> = ({level = 1, dur = 6, keys, children}) => {
  const t = useSec();
  const {width, height} = useVideoConfig();
  let transform: string;
  if (keys?.length) {
    const k = keyframed(keys, t);
    transform = `translate(${width / 2 - k.x * k.scale}px, ${height / 2 - k.y * k.scale}px) scale(${k.scale})`;
  } else {
    const p = eio(Math.min(1, t / dur));
    const s = lerp(1, level >= 2 ? 1.08 : 1.04, p);
    const dx = level >= 2 ? lerp(18, -18, p) : 0;
    transform = `translate(${dx}px, 0) scale(${s})`;
  }
  return <AbsoluteFill style={{transform, transformOrigin: keys?.length ? '0 0' : '50% 50%'}}>{children}</AbsoluteFill>;
};

/** A layer that drifts at its own speed so layers separate in depth. depth: 0 = far (slow) .. 1 = near (fast) */
export const Parallax: React.FC<{depth?: number; children?: React.ReactNode}> = ({depth = 0.5, children}) => {
  const t = useSec();
  return <AbsoluteFill style={{transform: `translate(${-t * depth * 14}px, ${Math.sin(t * 0.5) * depth * 8}px) scale(${1 + depth * 0.02})`}}>{children}</AbsoluteFill>;
};
