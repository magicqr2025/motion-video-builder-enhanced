// Layout and polish pieces, pick-by-name from the motion catalog: SplitLayout, BentoGrid, CardStack, Marquee, LightSweep.
// All fill their parent (position: absolute / AbsoluteFill) and animate from scene time like the rest of the kit.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Level, P, eio, lerp, useSec} from './core';
import {SpringIn, stagger} from './physics';

/** two panels side by side that spring in from opposite edges. ratio = share of the width for `left`. Use dir -1 to swap the entrance sides. */
export const SplitLayout: React.FC<{left: React.ReactNode; right: React.ReactNode; ratio?: number; at?: number; level?: Level; gap?: number; pad?: number; dir?: 1 | -1}> = ({left, right, ratio = 0.5, at = 0, level = 1, gap = 40, pad = 80, dir = 1}) => (
  <AbsoluteFill style={{display: 'flex', flexDirection: 'row', gap, padding: pad, alignItems: 'stretch'}}>
    <div style={{flex: ratio, minWidth: 0}}><SpringIn at={at} level={level} from={{x: -140 * dir, y: 0, scale: 0.96}} style={{height: '100%'}}>{left}</SpringIn></div>
    <div style={{flex: 1 - ratio, minWidth: 0}}><SpringIn at={at + 0.15} level={level} from={{x: 140 * dir, y: 0, scale: 0.96}} style={{height: '100%'}}>{right}</SpringIn></div>
  </AbsoluteFill>
);

export type BentoCell = {col: number; row: number; colSpan?: number; rowSpan?: number; node: React.ReactNode};

/** a grid of cells of different sizes that pop in one after another (1-based col/row). Each cell's node should fill its box (height: 100%). */
export const BentoGrid: React.FC<{cells: BentoCell[]; cols?: number; rows?: number; gap?: number; pad?: number; at?: number; step?: number; level?: Level}> = ({cells, cols = 3, rows = 2, gap = 28, pad = 80, at = 0, step = 0.14, level = 1}) => (
  <AbsoluteFill style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, gap, padding: pad}}>
    {cells.map((c, i) => (
      <div key={i} style={{gridColumn: `${c.col} / span ${c.colSpan ?? 1}`, gridRow: `${c.row} / span ${c.rowSpan ?? 1}`, minWidth: 0, minHeight: 0}}>
        <SpringIn at={stagger(i, at, step)} level={level} from={{y: 50, scale: 0.8}} style={{height: '100%'}}>{c.node}</SpringIn>
      </div>
    ))}
  </AbsoluteFill>
);

/** cards stacked and fanned; every `hold` seconds the front card flies off and the stack moves up. Cards are w x h px, centred at (x, y). */
export const CardStack: React.FC<{cards: React.ReactNode[]; w: number; h: number; x: number; y: number; at?: number; hold?: number; level?: Level}> = ({cards, w, h, x, y, at = 0, hold = 1.3, level = 1}) => {
  const t = useSec();
  const n = cards.length;
  const u = Math.max(0, (t - at) / hold);
  const us = Math.floor(u) + eio(u - Math.floor(u)); // steps with an ease at every card change
  const enter = P(t, at, 0.6);
  return (
    <>
      {cards.map((card, i) => {
        const d0 = i - us;
        const d = d0 - n * Math.floor((d0 + 1) / n); // -1 <= d < n-1; d < 0 = flying off the front
        const out = d < 0;
        const depth = Math.max(0, d);
        const opacity = out ? 1 + d : Math.max(0.35, 1 - depth * 0.2) * (d > n - 2 ? P(n - 1 - d, 0, 1) : 1);
        const tx = out ? d * (w * 0.9) : depth * 34;
        const ty = out ? 0 : -depth * 26 + (1 - enter) * 120;
        const rot = out ? d * 14 : depth * 2.2 - 2;
        const sc = out ? 1 + d * 0.06 : 1 - depth * 0.06;
        return (
          <div key={i} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: opacity * enter, zIndex: out ? n + 1 : n - Math.round(depth), transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${level >= 2 ? sc * lerp(0.94, 1, enter) : sc})`, transformOrigin: '50% 100%'}}>
            {card}
          </div>
        );
      })}
    </>
  );
};

/** a band of items scrolling sideways forever (logos, keywords, features). itemW = width of one item in px (all equal). */
export const Marquee: React.FC<{items: React.ReactNode[]; itemW: number; y: number; h?: number; speed?: number; gap?: number; reverse?: boolean; style?: React.CSSProperties}> = ({items, itemW, y, h = 120, speed = 140, gap = 48, reverse, style}) => {
  const t = useSec();
  const {width} = useVideoConfig();
  const loop = items.length * (itemW + gap);
  const shift = (t * speed) % loop;
  const copies = Math.ceil((width * 2) / loop) + 2;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, height: h, overflow: 'hidden', ...style}}>
      <div style={{display: 'flex', gap, width: 'max-content', transform: `translateX(${reverse ? shift - loop : -shift}px)`}}>
        {Array.from({length: copies}).flatMap((_, c) => items.map((it, i) => <div key={`${c}-${i}`} style={{width: itemW, height: h, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{it}</div>))}
      </div>
    </div>
  );
};

/** a soft diagonal shine that sweeps across everything beneath it (premium "glint"). Place it above the content. repeatEvery > 0 repeats it. */
export const LightSweep: React.FC<{at: number; dur?: number; angle?: number; color?: string; width?: number; repeatEvery?: number}> = ({at, dur = 0.9, angle = 18, color = 'rgba(255,255,255,0.5)', width = 0.22, repeatEvery = 0}) => {
  const t = useSec();
  const local = repeatEvery > 0 && t > at ? (t - at) % repeatEvery : t - at;
  const k = eio(P(local, 0, dur));
  if (local < 0 || local > dur) return null;
  const pos = lerp(-width * 100 - 10, 110, k);
  return <AbsoluteFill style={{pointerEvents: 'none', background: `linear-gradient(${90 + angle}deg, transparent ${pos}%, ${color} ${pos + width * 50}%, transparent ${pos + width * 100}%)`}} />;
};
