// Gallery of the effects kit (src/studio/kit). Open "Studio-kit-demo" in Remotion Studio to see every piece in motion.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fontFamily} from '../../components/kit';
import {
  CameraRig, COLORS, CountUp, Cursor, CursorPath, KineticCaptions, Notification, Obj3D, Particles, ProgressBar, SceneSeq, Spotlight, SpringIn, Toggle, Word,
  stagger, transitionFor, useSec,
} from '../kit';
import WORDS from '../../../public/studio/intro-waycrm-1m-style-2/ElevenLabs_2026-10-20T20_45_11_vijay-a-mqrvoice_ivc_sp100_s50_sb75_v4.mp3.words.json';

export const DEMO = {fps: 30, width: 1920, height: 1080, scenes: [{start: 0, dur: 4}, {start: 4, dur: 4}, {start: 8, dur: 4}, {start: 12, dur: 4}], xfade: 0.4};
export const DEMO_TOTAL = 16;

const Bg: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(160deg, #F4F8FF 0%, #E3EEFF 60%, #FFF3DD 100%)'}} />;
const Title: React.FC<{children: string; sub: string}> = ({children, sub}) => (
  <div style={{position: 'absolute', left: 110, top: 70, fontFamily}}>
    <div style={{fontWeight: 700, fontSize: 76, color: COLORS.navy, lineHeight: 1.05}}>{children}</div>
    <div style={{fontSize: 34, color: COLORS.slate, marginTop: 8}}>{sub}</div>
  </div>
);
const Card: React.FC<{w: number; h: number; c: string; label: string}> = ({w, h, c, label}) => (
  <div style={{width: w, height: h, borderRadius: 36, background: `linear-gradient(160deg, ${c}, ${COLORS.navy})`, boxShadow: '0 14px 0 rgba(14,27,77,0.25), 0 34px 60px rgba(14,27,77,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily, fontWeight: 700, fontSize: 44}}>{label}</div>
);

// 1 · camera push-in + spring physics + particles
const Motion: React.FC = () => (
  <AbsoluteFill>
    <Particles level={2} avoid={{x: 300, y: 330, w: 1320, h: 560}} />
    <CameraRig level={2} dur={4}>
      <Title sub="CameraRig · SpringIn · Particles">Motion</Title>
      <div style={{position: 'absolute', left: 300, top: 420, display: 'flex', gap: 50}}>
        {[COLORS.deep, COLORS.blue, COLORS.orange].map((c, i) => (
          <SpringIn key={i} at={stagger(i, 0.4, 0.18)} level={2} from={{y: 120, scale: 0.6, rotate: -8}}><Card w={380} h={360} c={c} label={['Spring', 'Settle', 'Bounce'][i]} /></SpringIn>
        ))}
      </div>
    </CameraRig>
  </AbsoluteFill>
);

// 2 · cursor, toggle, count-up, progress, notification, spotlight
const Actions: React.FC = () => (
  <AbsoluteFill>
    <Title sub="CursorPath · Toggle · CountUp · ProgressBar · Notification · Spotlight">Actions</Title>
    <div style={{position: 'absolute', left: 300, top: 330, width: 1320, height: 560, borderRadius: 40, background: '#fff', boxShadow: '0 14px 0 #C3D5F3, 0 40px 70px rgba(14,27,77,0.25)', fontFamily}}>
      <div style={{position: 'absolute', left: 80, top: 70, fontSize: 34, color: COLORS.slate}}>Auto-reply</div>
      <div style={{position: 'absolute', left: 80, top: 130}}><Toggle at={1.6} /></div>
      <div style={{position: 'absolute', left: 520, top: 70, fontSize: 34, color: COLORS.slate}}>Messages answered</div>
      <div style={{position: 'absolute', left: 520, top: 120, fontSize: 96, fontWeight: 700, color: COLORS.navy}}><CountUp to={12480} at={1.8} dur={1.6} /></div>
      <div style={{position: 'absolute', left: 520, top: 270}}><ProgressBar at={1.8} dur={1.6} to={0.82} w={560} /></div>
    </div>
    <div style={{position: 'absolute', left: 1180, top: 700}}><Notification at={2.6} hold={1} title="New lead" sub="Kavya Reddy · 2BHK" icon={<div style={{width: 56, height: 56, borderRadius: 16, background: '#25D366'}} />} /></div>
    <Spotlight level={2} keys={[{t: 1.4, x: 380, y: 460, w: 120, h: 65}, {t: 3, x: 800, y: 395, w: 600, h: 185}]} />
    <CursorPath keys={[{t: 0.4, x: 900, y: 700}, {t: 1.5, x: 440, y: 492, click: true}, {t: 3, x: 1100, y: 500}]} />
  </AbsoluteFill>
);

// 3 · real 3D objects
const Objects: React.FC = () => (
  <AbsoluteFill>
    <Title sub="Obj3D: coin · bubble · phone · card">Objects</Title>
    {(['coin', 'bubble', 'phone', 'card'] as const).map((k, i) => <Obj3D key={k} kind={k} x={330 + i * 420} y={600} size={400} at={stagger(i, 0.3, 0.25)} level={2} />)}
  </AbsoluteFill>
);

const Captions: React.FC = () => (
  <AbsoluteFill>
    <Title sub="KineticCaptions follow the voice (top level, video time)">Captions</Title>
  </AbsoluteFill>
);

export const KitDemo: React.FC = () => {
  const shifted: Word[] = (WORDS as {words: Word[]}).words.slice(0, 18).map((w) => ({...w, start: w.start + 12.3, end: w.end + 12.3}));
  const S = DEMO.scenes;
  const parts = [<Motion key={0} />, <Actions key={1} />, <Objects key={2} />, <Captions key={3} />];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Bg />
      {parts.map((p, i) => {
        const tr = transitionFor(i, 2);
        return <SceneSeq key={i} start={S[i].start} dur={S[i].dur} xfade={DEMO.xfade} type={tr.type} dir={tr.dir} first={i === 0} last={i === parts.length - 1} name={tr.type}>{p}</SceneSeq>;
      })}
      <KineticCaptions words={shifted} level={2} y={800} />
    </AbsoluteFill>
  );
};
