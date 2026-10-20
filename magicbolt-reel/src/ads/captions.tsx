// Word-timed captions for public/aireviewbooser-magicqr.mp3.
// Each line is shown as one caption; every word is [text, start second in the AUDIO].
// `end` is when the last word finishes. Edit text here to fix spellings.
import React from 'react';
import {useT, P, eb} from '../components/kit';
import {Q} from './config';
import {Tx} from '../qr/kit';

type CapLine = {end: number; words: [string, number][]};
export const CAPTIONS: CapLine[] = [
  {end: 0.82, words: [['Ads', 0.0], ['pe', 0.3], ['paisa', 0.48]]},
  {end: 2.26, words: [['jalana', 0.82], ['band', 1.18], ['karo.', 1.88]]},
  {end: 4.06, words: [['Google', 2.6], ['aapko', 2.98], ['free', 3.42], ['mein', 3.86]]},
  {end: 4.74, words: [['naye', 4.06], ['customers', 4.44]]},
  {end: 5.72, words: [['bhej', 4.74], ['sakta', 5.16], ['hai.', 5.5]]},
  {end: 6.44, words: [['Socho,', 6.06]]},
  {end: 7.38, words: [['koi', 6.78], ['Google', 6.9], ['pe', 7.2]]},
  {end: 8.2, words: [['search', 7.38], ['karta', 7.62], ['hai.', 8.04]]},
  {end: 9.34, words: [['"Salon', 8.46], ['near', 8.86], ['me"', 9.14]]},
  {end: 10.44, words: [['Customer', 9.68], ['sirf', 10.06]]},
  {end: 11.56, words: [['top', 10.44], ['3', 10.74], ['mein', 11.14], ['se', 11.3], ['hi', 11.42]]},
  {end: 12.04, words: [['chunta', 11.56], ['hai.', 11.78]]},
  {end: 13.12, words: [['Aur', 12.34], ['top', 12.42], ['3', 12.66], ['ka', 12.92]]},
  {end: 14.02, words: [['sabse', 13.12], ['bada', 13.5], ['factor?', 13.66]]},
  {end: 15.42, words: [['Reviews.', 14.82]]},
  {end: 16.22, words: [['Aur', 15.7], ['reviews', 15.86]]},
  {end: 17.7, words: [['maangne', 16.22], ['se', 17.1], ['nahi', 17.2], ['aate.', 17.42]]},
  {end: 19.32, words: [['MagicQR', 18.2], ['se', 18.8], ['aate', 18.94], ['hain.', 19.16]]},
  {end: 20.76, words: [['Customer', 19.6], ['MagicQR', 19.94]]},
  {end: 21.56, words: [['scan', 20.76], ['karta', 21.02], ['hai.', 21.38]]},
  {end: 22.42, words: [['Hamara', 21.78], ['AI', 22.06]]},
  {end: 23.58, words: [['SEO-friendly', 22.42], ['review', 23.18]]},
  {end: 24.5, words: [['suggest', 23.58], ['karta', 23.86], ['hai.', 24.26]]},
  {end: 25.76, words: [['Customer', 24.64], ['ka', 24.96], ['ek', 25.18], ['tap,', 25.48]]},
  {end: 26.62, words: [['aur', 25.76], ['review', 26.24]]},
  {end: 27.68, words: [['Google', 26.62], ['pe', 27.04], ['live.', 27.3]]},
  {end: 28.8, words: [['Ads', 27.68], ['band,', 28.34]]},
  {end: 30.02, words: [['customers', 29.0], ['band.', 29.3]]},
  {end: 31.16, words: [['Reviews', 30.16], ['kaam', 30.7]]},
  {end: 31.88, words: [['karte', 31.16], ['rehte', 31.3], ['hain.', 31.62]]},
  {end: 32.8, words: [['Aaj', 32.14], ['hi', 32.44], ['apna', 32.52]]},
  {end: 34.18, words: [['MagicQR', 32.8], ['Review', 33.52], ['Booster', 33.78]]},
  {end: 34.8, words: [['order', 34.18], ['karo.', 34.44]]},
  {end: 35.72, words: [['Ads', 34.96], ['pe', 35.22], ['nahi,', 35.42]]},
  {end: 36.52, words: [['reviews', 35.72], ['pe', 36.26]]},
  {end: 37.18, words: [['dhanda', 36.52], ['badhao!', 36.78]]},
];

// One caption at a time in a white pill; the word being spoken gets a yellow highlight (global time)
export const Captions: React.FC<{y?: number; size?: number}> = ({y = 1580, size = 54}) => {
  const t = useT();
  const i = CAPTIONS.findIndex((l, j) => t >= l.words[0][1] - 0.05 && t < (CAPTIONS[j + 1]?.words[0][1] ?? l.end + 0.5) - 0.05);
  if (i < 0) return null;
  const line = CAPTIONS[i];
  if (t > line.end + 0.6) return null; // long pause: hide
  const kin = P(t, line.words[0][1] - 0.05, 0.18);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: size * 0.1, padding: `${size * 0.22}px ${size * 0.4}px`, borderRadius: size * 0.6, background: '#fff', border: `3px solid ${Q.line}`,
        boxShadow: '0 16px 40px rgba(27,22,64,0.22)', transform: `scale(${eb(kin, 1.6)})`}}>
        {line.words.map(([w, at], j) => {
          const next = line.words[j + 1]?.[1] ?? line.end;
          const said = t >= at, now = said && t < next;
          return (
            <span key={j} style={{display: 'inline-block', padding: `0 ${size * 0.16}px`, borderRadius: size * 0.24, background: now ? Q.yellow : 'transparent', transform: `scale(${now ? 1.06 : 1})`}}>
              <Tx size={size} color={said ? Q.ink : '#B4B0C8'}>{w}</Tx>
            </span>
          );
        })}
      </div>
    </div>
  );
};
