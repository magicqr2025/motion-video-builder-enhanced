// Captions that follow the voice word by word. Look option "Kinetic captions".
// Put it at the TOP LEVEL of the video (outside scene Sequences) so its clock is video time, like the voiceover.
// words come from the transcript: import WORDS from '<audio>.words.json'; <KineticCaptions words={WORDS.words} />
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fontFamily} from '../../components/kit';
import {COLORS, Level, P, eb, lerp, useSec} from './core';

export type Word = {text: string; start: number; end: number};

// group words into short lines: break at ~4 words, a pause, or sentence punctuation
const lines = (words: Word[], max: number): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (cur.length >= max || !next || next.start - w.end > 0.35 || /[.!?,]$/.test(w.text)) { out.push(cur); cur = []; }
  });
  return out;
};

export const KineticCaptions: React.FC<{words: Word[]; level?: Level; y?: number; accent?: string; color?: string; size?: number}> = ({words, level = 1, y = 860, accent = COLORS.gold, color = '#fff', size}) => {
  const t = useSec();
  const groups = React.useMemo(() => lines(words, level >= 2 ? 3 : 4), [words, level]);
  const g = groups.find((ws) => t >= ws[0].start - 0.05 && t < ws[ws.length - 1].end + 0.25);
  if (!g) return null;
  const fs = size ?? (level >= 2 ? 92 : 56);
  const appear = P(t, g[0].start - 0.05, 0.2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', alignItems: 'center'}}>
      <div style={{position: 'absolute', top: y, transform: `translateY(-50%) scale(${lerp(0.92, 1, appear)})`, opacity: appear, display: 'flex', gap: fs * (level >= 2 ? 0.36 : 0.28), padding: level >= 2 ? 0 : `${fs * 0.22}px ${fs * 0.5}px`, borderRadius: 999, background: level >= 2 ? 'transparent' : 'rgba(14,27,77,0.72)', fontFamily, fontWeight: 700, fontSize: fs, lineHeight: 1.1, textShadow: level >= 2 ? '0 6px 18px rgba(0,0,0,0.45)' : undefined}}>
        {g.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const pop = P(t, w.start, 0.22);
          return <span key={i} style={{color: active ? accent : color, display: 'inline-block', transform: level >= 2 ? `scale(${active ? lerp(1, 1.1, eb(pop)) : 1})` : undefined}}>{w.text}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
