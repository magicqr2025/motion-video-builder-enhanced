// Guided focus: dim everything except the part being explained. Look option "Guided focus".
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, Level, P, keyframed, useSec} from './core';

type Rect = {t: number; x: number; y: number; w: number; h: number};

/**
 * Dims the scene and glows around a rectangle that glides between keys (scene px, scene seconds).
 *   <Spotlight keys={[{t: 1, x: 300, y: 250, w: 500, h: 220}, {t: 3, x: 900, y: 400, w: 600, h: 300}]} />
 * Put it above the content it explains. Light dims a little, Full dims strongly.
 */
export const Spotlight: React.FC<{keys: Rect[]; level?: Level; color?: string; radius?: number; pad?: number}> = ({keys, level = 1, color = COLORS.gold, radius = 24, pad = 14}) => {
  const t = useSec();
  const appear = P(t, keys[0].t - 0.4, 0.4);
  if (appear <= 0) return null;
  const r = keyframed(keys, t);
  const dim = (level >= 2 ? 0.62 : 0.4) * appear;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: r.x - pad, top: r.y - pad, width: r.w + pad * 2, height: r.h + pad * 2, borderRadius: radius, border: `5px solid ${color}`, boxShadow: `0 0 0 4000px rgba(8,14,40,${dim}), 0 0 36px ${color}`, opacity: appear}} />
    </AbsoluteFill>
  );
};
