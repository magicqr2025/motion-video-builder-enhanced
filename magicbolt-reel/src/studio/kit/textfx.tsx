// Text reveals. Look option "Kinetic text" (pick-by-name from the motion catalog). Deterministic, no CSS transitions.
//   <TextReveal text="Grow faster" at={0.4} variant="mask" style={{fontSize: 120, fontWeight: 800}} />
import React from 'react';
import {Level, P, eo, lerp, seeded, useSec, useSpringK} from './core';

export type TextVariant = 'mask' | 'words' | 'letters' | 'blur' | 'scramble' | 'type' | 'rise';

const GAP: Record<TextVariant, number> = {mask: 0.09, words: 0.08, letters: 0.03, blur: 0.09, scramble: 0.035, type: 0.045, rise: 0};
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$';

// one animated unit (a word or a letter): its own spring, so hooks stay out of loops
const Unit: React.FC<{at: number; level: Level; variant: TextVariant; children: string}> = ({at, level, variant, children}) => {
  const k = useSpringK(at, level);
  const kc = Math.max(0, Math.min(1, k)), inv = 1 - k;
  if (variant === 'mask') {
    return (
      <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.14em', marginBottom: '-0.14em'}}>
        <span style={{display: 'inline-block', transform: `translateY(${inv * 112}%)`}}>{children}</span>
      </span>
    );
  }
  if (variant === 'letters') return <span style={{display: 'inline-block', opacity: Math.min(1, kc * 2), transform: `translateY(${inv * 0.5}em) rotate(${inv * 12}deg) scale(${lerp(0.6, 1, k)})`, transformOrigin: '50% 100%'}}>{children}</span>;
  if (variant === 'blur') return <span style={{display: 'inline-block', opacity: kc, filter: `blur(${(1 - kc) * 18}px)`, transform: `scale(${lerp(1.25, 1, kc)})`}}>{children}</span>;
  return <span style={{display: 'inline-block', opacity: Math.min(1, kc * 2), transform: `translateY(${inv * 0.45}em) scale(${lerp(0.85, 1, k)})`}}>{children}</span>; // words
};

/**
 * text appears from `at` seconds (scene time). variant: mask (lines rise out of a mask), words (word stagger), letters (springy per letter),
 * blur (words focus in), scramble (random glyphs resolve into the text), type (typewriter with caret), rise (whole block floats up).
 * `gap` = seconds between units (defaults per variant). Put font size / weight / colour in `style`.
 */
export const TextReveal: React.FC<{text: string; at: number; variant?: TextVariant; level?: Level; gap?: number; caret?: boolean; style?: React.CSSProperties}> = ({text, at, variant = 'words', level = 1, gap, caret = true, style}) => {
  const t = useSec();
  const g = gap ?? GAP[variant];
  const words = text.split(' ');
  const wrap: React.CSSProperties = {display: 'inline-block', lineHeight: 1.1, ...style};

  if (variant === 'rise') {
    const k = P(t, at, 0.7), e = eo(k);
    return <div style={{...wrap, opacity: e, transform: `translateY(${(1 - e) * 60}px)`, filter: `blur(${(1 - e) * 8}px)`}}>{text}</div>;
  }
  if (variant === 'scramble' || variant === 'type') {
    const chars = [...text];
    const frame = Math.floor(t * 30);
    const shown = chars.map((c, i) => {
      const start = at + i * g;
      if (variant === 'type') return t >= start ? c : '';
      if (c === ' ' || t < at) return t >= at ? c : '';
      if (t >= start + 0.28) return c;
      return t >= at ? GLYPHS[Math.floor(seeded(i * 131 + Math.floor(frame / 2) * 17)() * GLYPHS.length)] : '';
    });
    const typed = variant === 'type';
    const caretOn = typed && caret && t >= at && (t < at + chars.length * g + 0.8 || Math.floor(t * 2) % 2 === 0);
    return (
      <div style={{...wrap, whiteSpace: 'pre-wrap'}}>
        {shown.join('')}
        {typed && caret ? <span style={{opacity: caretOn ? 1 : 0, fontWeight: 300}}>|</span> : null}
      </div>
    );
  }
  let n = 0;
  return (
    <div style={wrap}>
      {words.map((w, wi) => (
        <span key={wi} style={{display: 'inline-block', whiteSpace: 'nowrap', marginRight: wi < words.length - 1 ? '0.28em' : 0}}>
          {variant === 'letters'
            ? [...w].map((c, ci) => <Unit key={ci} at={at + n++ * g} level={level} variant="letters">{c}</Unit>)
            : <Unit at={at + n++ * g} level={level} variant={variant}>{w}</Unit>}
        </span>
      ))}
    </div>
  );
};
