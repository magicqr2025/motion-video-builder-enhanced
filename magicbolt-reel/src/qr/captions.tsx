// Word-timed captions for public/magicqr-whitelabel.mp3.
// Each line is shown as one caption; every word is [text, start second in the AUDIO].
// `end` is when the last word finishes. Edit text here to fix spellings.
import React from 'react';
import {useT, P, eb} from '../components/kit';
import {Q} from './config';
import {Tx} from './kit';

type CapLine = {end: number; words: [string, number][]};
export const CAPTIONS: CapLine[] = [
  {end: 1.32, words: [['Customer', 0.33], ['khush', 0.78], ['hai,', 1.12]]},
  {end: 2.38, words: [['par', 1.34], ['Google', 1.72], ['par', 2.14]]},
  {end: 3.29, words: [['review', 2.4], ['nahi', 2.66], ['dete?', 2.92]]},
  {end: 4.34, words: [['Kyunki', 3.72], ['unhe', 3.98], ['pata', 4.1]]},
  {end: 5.26, words: [['nahi', 4.36], ['hai,', 4.58], ['kya', 4.74], ['likhna', 4.88], ['hai.', 5.08]]},
  {end: 6.05, words: [['Dekhiye,', 5.7]]},
  {end: 7.34, words: [['Magic', 6.41], ['QR', 6.68], ['kaise', 7.0]]},
  {end: 8.0, words: [['kaam', 7.36], ['karta', 7.62], ['hai.', 7.8]]},
  {end: 9.09, words: [['Step', 8.43], ['one:', 8.68]]},
  {end: 10.05, words: [['customer', 9.44], ['aapka', 9.76]]},
  {end: 11.02, words: [['Magic', 10.08], ['QR', 10.36], ['scan', 10.7]]},
  {end: 11.6, words: [['karta', 11.04], ['hai.', 11.42]]},
  {end: 12.73, words: [['Step', 12.05], ['two:', 12.48]]},
  {end: 13.56, words: [['woh', 13.01], ['apna', 13.12], ['star', 13.3]]},
  {end: 14.31, words: [['rating', 13.58], ['deta', 13.88], ['hai.', 14.14]]},
  {end: 15.72, words: [['Agar', 14.84], ['1,', 15.24], ['2', 15.6]]},
  {end: 16.92, words: [['ya', 15.74], ['3', 15.98], ['star', 16.22], ['diye,', 16.52]]},
  {end: 17.9, words: [['toh', 17.17], ['feedback', 17.28], ['private', 17.62]]},
  {end: 19.06, words: [['aapke', 18.05], ['paas', 18.54], ['aata', 18.76], ['hai.', 18.98]]},
  {end: 20.04, words: [['Google', 19.38], ['par', 19.56], ['publish', 19.8]]},
  {end: 20.63, words: [['nahi', 20.06], ['hota.', 20.36]]},
  {end: 21.58, words: [['Aur', 21.21], ['agar', 21.38]]},
  {end: 23.01, words: [['4', 21.6], ['ya', 21.8], ['5', 22.08], ['star', 22.28], ['diye,', 22.58]]},
  {end: 24.0, words: [['toh', 23.34], ['AI', 23.46], ['ek', 23.74]]},
  {end: 25.22, words: [['SEO-friendly', 24.02], ['review', 24.76]]},
  {end: 25.87, words: [['likh', 25.24], ['deta', 25.5], ['hai.', 25.66]]},
  {end: 26.9, words: [['Customer', 26.33], ['bas', 26.72]]},
  {end: 27.58, words: [['ek', 26.92], ['tap', 27.14], ['mein', 27.4]]},
  {end: 28.22, words: [['use', 27.6], ['Google', 27.78], ['par', 28.04]]},
  {end: 29.08, words: [['post', 28.24], ['kar', 28.54], ['deta hai.', 28.72]]},
  {end: 30.34, words: [['Zyada', 29.51], ['reviews,', 29.82]]},
  {end: 31.34, words: [['matlab', 30.6], ['Google', 30.84], ['par', 31.1]]},
  {end: 32.15, words: [['behtar', 31.36], ['ranking.', 31.76]]},
  {end: 33.84, words: [['Perfect', 32.7], ['for', 32.92], ['restaurants,', 33.2]]},
  {end: 34.78, words: [['salons,', 33.86], ['clinics,', 34.32]]},
  {end: 35.93, words: [['hotels,', 34.8], ['gyms,', 35.3], ['spa,', 35.74]]},
  {end: 37.82, words: [['retail', 36.24], ['and', 36.52], ['service', 36.84], ['businesses.', 37.12]]},
  {end: 39.02, words: [['Magic', 38.34], ['QR', 38.68]]},
  {end: 39.96, words: [['Review', 39.04], ['Booster.', 39.46]]},
  {end: 41.16, words: [['Aaj', 40.54], ['hi', 40.84], ['apna', 40.94]]},
  {end: 42.5, words: [['white-label', 41.18], ['MagicQR', 41.76]]},
  {end: 43.4, words: [['business', 42.52], ['shuru', 42.78], ['karen,', 43.08]]},
  {end: 44.95, words: [['MagicBolt', 43.84], ['AI', 44.32], ['ke', 44.58], ['saath.', 44.78]]},
  {end: 45.98, words: [['Signup', 45.38], ['today!', 45.68]]},
];

// One caption at a time in a white pill; the word being spoken gets a yellow highlight.
// Uses global time (place outside the Shots).
export const Captions: React.FC<{y?: number; size?: number}> = ({y = 1545, size = 54}) => {
  const t = useT();
  const i = CAPTIONS.findIndex((l, j) => t >= l.words[0][1] - 0.05 && t < (CAPTIONS[j + 1]?.words[0][1] ?? l.end + 0.5) - 0.05);
  if (i < 0) return null;
  const line = CAPTIONS[i];
  if (t > line.end + 0.5) return null; // long pause: hide
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
