// Floating particles behind the content. Look option "Particles & floating objects". Fully seeded (deterministic).
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {COLORS, Level, seeded, useSec} from './core';

type Shape = 'sparkle' | 'dot' | 'ring' | 'pill';

const Star: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><path d="M50 0C54 32 68 46 100 50C68 54 54 68 50 100C46 68 32 54 0 50C32 46 46 32 50 0Z" fill={color} /></svg>
);

/**
 * Drifting sparkles / glows. Light ≈ 8 subtle ones, Full ≈ 24 richer ones.
 * `avoid` keeps them out of a rectangle (px) where the content is, e.g. avoid={{x: 300, y: 200, w: 1300, h: 700}}.
 */
export const Particles: React.FC<{level?: Level; colors?: string[]; shapes?: Shape[]; seed?: number; opacity?: number; speed?: number; avoid?: {x: number; y: number; w: number; h: number}}> = ({
  level = 1, colors = [COLORS.gold, COLORS.blue, COLORS.orange, COLORS.white], shapes = ['sparkle', 'dot'], seed = 7, opacity = 1, speed = 1, avoid,
}) => {
  const t = useSec() * speed;
  const {width, height} = useVideoConfig();
  const rnd = seeded(seed);
  const count = level >= 2 ? 24 : 8;
  const items = Array.from({length: count}, (_, i) => {
    let x = rnd() * width, y = rnd() * height;
    for (let tries = 0; avoid && tries < 6 && x > avoid.x && x < avoid.x + avoid.w && y > avoid.y && y < avoid.y + avoid.h; tries++) { x = rnd() * width; y = rnd() * height; }
    return {x, y, size: 14 + rnd() * (level >= 2 ? 46 : 30), speed: 14 + rnd() * 26, phase: rnd() * 6.28, color: colors[i % colors.length], shape: shapes[i % shapes.length]};
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', opacity}}>
      {items.map((p, i) => {
        const yy = (((p.y - t * p.speed) % (height + 120)) + height + 120) % (height + 120) - 60; // drifts up and wraps
        const xx = p.x + Math.sin(t * 0.6 + p.phase) * 24;
        const a = (0.35 + 0.35 * Math.sin(t * 1.4 + p.phase)) * (level >= 2 ? 1 : 0.8);
        const common: React.CSSProperties = {position: 'absolute', left: xx, top: yy, opacity: a, transform: `rotate(${Math.sin(t + p.phase) * 25}deg)`};
        if (p.shape === 'sparkle') return <div key={i} style={common}><Star size={p.size} color={p.color} /></div>;
        if (p.shape === 'ring') return <div key={i} style={{...common, width: p.size, height: p.size, borderRadius: '50%', border: `${Math.max(2, p.size / 9)}px solid ${p.color}`}} />;
        if (p.shape === 'pill') return <div key={i} style={{...common, width: p.size * 1.8, height: p.size * 0.6, borderRadius: 99, background: p.color}} />;
        return <div key={i} style={{...common, width: p.size, height: p.size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #fff, ${p.color} 55%, ${p.color}00)`}} />;
      })}
    </AbsoluteFill>
  );
};
