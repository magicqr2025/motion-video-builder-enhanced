// Captions: one line at a time in a white pill; the word being spoken gets a yellow highlight.
// Lines come from each scene's `caps` in config.ts. Word timing inside a line is spread by word length.
import React from 'react';
import {P, eb} from '../components/kit';
import {Cap, S1, S2, S3, S4, S5, S6, S7, T, W} from './config';
import {Tx, useG} from './kit';

const toGlobal = (start: number, caps: Cap[]) => caps.map(([text, a, b]) => ({text, a: start + a, b: start + b}));
const LINES = [
  ...toGlobal(T.s1, S1.caps), ...toGlobal(T.s2, S2.caps), ...toGlobal(T.s3, S3.caps), ...toGlobal(T.s4, S4.caps),
  ...toGlobal(T.s5, S5.caps), ...toGlobal(T.s6, S6.caps), ...toGlobal(T.s7, S7.caps),
];

export const Captions: React.FC<{y?: number; size?: number}> = ({y = 1545, size = 48}) => {
  const t = useG();
  const i = LINES.findIndex((l, j) => t >= l.a - 0.05 && t < (LINES[j + 1]?.a ?? l.b + 0.4) - 0.05);
  if (i < 0) return null;
  const line = LINES[i];
  if (t > line.b + 0.4) return null; // long pause: hide
  const words = line.text.split(' ');
  const total = words.reduce((n, w) => n + w.length + 1, 0);
  let acc = 0;
  const kin = P(t, line.a - 0.05, 0.18);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: size * 0.08, padding: `${size * 0.24}px ${size * 0.42}px`, borderRadius: size * 0.62, background: '#fff', border: `4px solid ${W.purple}`,
        boxShadow: `0 18px 44px ${W.purple}55`, transform: `scale(${eb(kin, 1.6)})`}}>
        {words.map((w, j) => {
          const at = line.a + ((line.b - line.a) * acc) / total;
          acc += w.length + 1;
          const next = line.a + ((line.b - line.a) * acc) / total;
          const said = t >= at, now = said && t < next;
          return (
            <span key={j} style={{display: 'inline-block', padding: `0 ${size * 0.14}px`, borderRadius: size * 0.24, background: now ? W.yellow : 'transparent', transform: `scale(${now ? 1.07 : 1})`}}>
              <Tx size={size} color={said ? W.ink : '#B4AED0'}>{w}</Tx>
            </span>
          );
        })}
      </div>
    </div>
  );
};
