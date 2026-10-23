// Shared look for every MagicBolt tutorial video (16:9):
//  - TitleCard: the animated MagicBolt logo, then one clean title + a small eyebrow line
//  - EndLogo: public/logo-animation.mp4 played as it is (10 s)
// Use with the soft Backdrop from ../dns/ui.
import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, staticFile} from 'remotion';
import {LogoAnim} from '../logo/LogoAnim';
import {useSec, P, eo, lerp, Tx} from '../dns/ui';

export const END_LOGO = {src: 'logo-animation.mp4', dur: 10.04};
export const TITLE_DUR = 5.5;

const NAVY = '#0E1B4D', DEEP = '#1354BC', BLUE = '#1582D5', GOLD = '#FDC60B', ORANGE = '#F7941D', SLATE = '#5A6488';

export const TitleCard: React.FC<{title: string; eyebrow?: string; sub?: string; dur?: number}> = ({title, eyebrow = 'MagicBolt Tutorial', sub, dur = TITLE_DUR}) => {
  const t = useSec();
  const move = eo(P(t, 1.9, 0.9)); // logo rises once built
  const kT = eo(P(t, 2.3, 0.7));
  const kL = eo(P(t, 2.7, 0.7));
  const kS = eo(P(t, 3.0, 0.7));
  const kE = eo(P(t, 2.1, 0.6));
  const out = P(t, dur - 0.5, 0.5);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 960 - 720, top: lerp(540, 330, move) - 240, width: 1440, height: 480, transform: `scale(${lerp(0.8, 0.58, move)})`}}>
        {t < 3.3 ? <LogoAnim /> : <Freeze frame={99}><LogoAnim /></Freeze>}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{opacity: kE, transform: `translateY(${(1 - kE) * 14}px)`}}>
          <Tx size={26} color={SLATE} w={400} style={{letterSpacing: 7, textTransform: 'uppercase'}}>{eyebrow}</Tx>
        </div>
        <div style={{opacity: kT, transform: `translateY(${(1 - kT) * 30}px)`, filter: `blur(${(1 - kT) * 8}px)`}}>
          <Tx size={Math.min(92, Math.floor(1700 / (title.length * 0.6)))} g={[NAVY, DEEP, BLUE]}>{title}</Tx>
        </div>
        <div style={{width: 360 * kL, height: 5, borderRadius: 3, background: `linear-gradient(90deg, ${DEEP}, ${BLUE} 45%, ${GOLD} 75%, ${ORANGE})`}} />
        {sub && (
          <div style={{opacity: kS, transform: `translateY(${(1 - kS) * 16}px)`}}>
            <Tx size={40} color={SLATE} w={400}>{sub}</Tx>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const EndLogo: React.FC = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    <OffthreadVideo src={staticFile(END_LOGO.src)} muted={false} style={{width: 1920, height: 1080}} />
  </AbsoluteFill>
);
