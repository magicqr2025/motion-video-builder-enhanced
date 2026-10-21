// Spring physics: things overshoot and settle instead of sliding. Look option "Spring physics".
import React from 'react';
import {Level, useSpringK} from './core';

type From = {x?: number; y?: number; scale?: number; rotate?: number; opacity?: number};

/** Wrap anything: it springs in from `from` to its place starting at `at` seconds. */
export const SpringIn: React.FC<{at: number; level?: Level; from?: From; style?: React.CSSProperties; children?: React.ReactNode}> = ({at, level = 1, from, style, children}) => {
  const k = useSpringK(at, level);
  const f = {x: 0, y: 40, scale: 0.85, rotate: 0, opacity: 0, ...from};
  const inv = 1 - k;
  return (
    <div style={{opacity: f.opacity + (1 - f.opacity) * Math.max(0, Math.min(1, k * 1.5)), transform: `translate(${f.x * inv}px, ${f.y * inv}px) scale(${1 - (1 - f.scale) * inv}) rotate(${f.rotate * inv}deg)`, ...style}}>
      {children}
    </div>
  );
};

/** start time of item i in a staggered list */
export const stagger = (i: number, base: number, gap = 0.12) => base + i * gap;
