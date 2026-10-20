// DNS setup tutorial: branded intro/overview/summary/outro + the screen recording in a glossy frame
// with live rails (which record, which step), captions, a Proxy-OFF widget and "added" toasts.
import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {TitleCard, EndLogo} from '../tutorial/brand';
import {Chip} from '../glow/parts';
import {VIDEO, D, RECORDS, ACTIONS, REC_CUES, CLIPS, OPEN_CAPS, R1_INTRO_CAP, CF_RANGES, BLUR_BOX, SCENES, RecKey, ActKey} from './config';
import {useSec, P, eo, eb, lerp, Tx, Pop, Words, Backdrop, Card, IconChip, Glyph, RailItem, Caption, ProxyWidget, Toast, Spark, REC_GLYPH, ACT_GLYPH} from './ui';

// ---------- timeline (output seconds) ----------
type ClipKey = keyof typeof CLIPS;
const len = (k: ClipKey) => (CLIPS[k].src[1] - CLIPS[k].src[0]) / CLIPS[k].rate;
const T = (() => {
  const overview = SCENES.intro;
  const open = overview + SCENES.overview;
  const r1 = open + len('open');
  const repeat = r1 + len('r1');
  const r2 = repeat + SCENES.repeat;
  const r3 = r2 + len('r2');
  const r4 = r3 + len('r3');
  const summary = r4 + len('r4');
  const outro = summary + SCENES.summary;
  return {overview, open, r1, repeat, r2, r3, r4, summary, outro, end: outro + SCENES.outro};
})();
export const DNS_DURATION = T.end;

const SEGS: {key: ClipKey; out: number; rec: number}[] = [
  {key: 'open', out: T.open, rec: -1},
  {key: 'r1', out: T.r1, rec: 0},
  {key: 'r2', out: T.r2, rec: 1},
  {key: 'r3', out: T.r3, rec: 2},
  {key: 'r4', out: T.r4, rec: 3},
];
const toOut = (seg: (typeof SEGS)[number], src: number) => seg.out + Math.max(0, src - CLIPS[seg.key].src[0]) / CLIPS[seg.key].rate;

// What is on screen at output time t
const stateAt = (t: number) => {
  if (t >= T.repeat && t < T.r2) return {seg: null, src: CLIPS.r1.src[1], rec: 0, repeat: true};
  let seg = SEGS[0];
  for (const s of SEGS) if (t >= s.out) seg = s;
  const src = CLIPS[seg.key].src[0] + (t - seg.out) * CLIPS[seg.key].rate;
  return {seg, src, rec: seg.rec, repeat: false};
};

const ACT_TEXT = (a: ActKey, key: RecKey) => ({
  cname: 'In Cloudflare: DNS → Records → Add record → CNAME',
  name: `Copy the Name  “${key}”  → paste it in Name`,
  target: 'Copy the Target value → paste it in Target',
  dns: 'Turn Proxy OFF → grey cloud, “DNS only”',
  save: 'Click Save',
}[a]);

// ---------- 1 · Title card: shared, see ../tutorial/brand ----------

// ---------- 2 · Overview: 4 records, 5 steps ----------
const Overview: React.FC = () => {
  const t = useSec();
  const out = P(t, SCENES.overview - 0.45, 0.45);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - 0.04 * out})`}}>
      <Pop t={t} at={0.1} x={960} y={150}>
        <Words t={t} at={0.1} text="4 records. Same 5 steps each." size={78} g={[D.navy, D.deep]} hi={{0: [D.blue, D.deep], 3: [D.orange, D.gold]}} />
      </Pop>
      <div style={{position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center', gap: 34}}>
        {RECORDS.map((r, i) => {
          const k = P(t, 0.6 + i * 0.18, 0.55);
          return (
            <div key={r.key} style={{opacity: Math.min(1, k * 2), transform: `translateY(${(1 - eo(k)) * 70}px) rotate(${(1 - eo(k)) * (i % 2 ? 4 : -4)}deg)`}}>
              <Card w={392} h={300} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
                <div style={{transform: `translateY(${Math.sin(t * 2 + i) * 5}px)`}}><IconChip name={REC_GLYPH[r.key]} size={108} c={r.color} /></div>
                <Tx size={34}>{r.label}</Tx>
                <Tx size={26} w={400} color={D.slate}><b style={{color: r.color}}>{r.key}</b>.yourbrand.com</Tx>
              </Card>
            </div>
          );
        })}
      </div>
      {/* five-step flow */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 18}}>
        {ACTIONS.map((a, i) => {
          const k = P(t, 2.0 + i * 0.35, 0.5);
          const hot = a.key === 'dns';
          const pulse = hot && t > 4.2 ? 1 + 0.05 * Math.sin(t * 6) : 1;
          return (
            <React.Fragment key={a.key}>
              {i > 0 && <div style={{marginTop: 42, opacity: P(t, 1.85 + i * 0.35, 0.3)}}><Tx size={44} color="#AAB6D3">→</Tx></div>}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 190, opacity: Math.min(1, k * 2), transform: `scale(${lerp(0.4, 1, eb(k, 2.4)) * pulse})`}}>
                <div style={{position: 'relative'}}>
                  {hot && <div style={{position: 'absolute', inset: -16, borderRadius: 44, border: `5px solid ${D.orange}`, opacity: P(t, 4.2, 0.3)}} />}
                  <IconChip name={ACT_GLYPH[a.key]} size={110} c={hot ? D.orange : D.deep} />
                </div>
                <Tx size={30}>{a.label}</Tx>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <Pop t={t} at={4.3} x={960} y={980}>
        <Chip w="auto" h={72} r={36} c={D.orange} depth={6} style={{padding: '0 34px'}}><Glyph name="dns" size={40} /><Tx size={32} color="#fff">Proxy must be OFF — grey cloud</Tx></Chip>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------- 3 · Footage stage ----------
const WIN = {x: 192, y: 36, s: 0.8}; // the recording drawn at 1536 x 864
const inCF = (src: number) => CF_RANGES.some(([a, b]) => src >= a - 0.35 && src <= b + 0.35);

const Clip: React.FC<{k: ClipKey}> = ({k}) => {
  const {fps} = useVideoConfig();
  const [a, b] = CLIPS[k].src;
  return <OffthreadVideo src={staticFile(VIDEO.src)} trimBefore={Math.round(a * fps)} trimAfter={Math.round(b * fps)} playbackRate={CLIPS[k].rate} muted style={{width: 1920, height: 1080}} />;
};

const Stage: React.FC = () => {
  const t0 = useSec(); // seconds since T.open
  const {fps} = useVideoConfig();
  const t = t0 + T.open; // global seconds
  const st = stateAt(t);
  const kin = eo(P(t0, 0, 0.7));
  const kout = P(t, T.summary - 0.5, 0.5);
  const rec = st.rec;
  const recKey = rec >= 0 ? RECORDS[rec].key : null;
  const cues = recKey ? REC_CUES[recKey] : null;
  const recDone = cues ? st.src >= cues.done && !st.repeat : false;
  let act = -1;
  if (cues && !st.repeat) ACTIONS.forEach((a, i) => { if (st.src >= cues[a.key]) act = i; });
  if (st.repeat) act = 5;

  // caption
  let cap = '', capSince = T.open, badge = 'Start', capC = D.deep;
  if (st.seg && st.seg.key === 'open') {
    for (const [txt, at] of OPEN_CAPS) if (st.src >= at) { cap = txt; capSince = toOut(st.seg, at); }
  } else if (st.repeat) {
    cap = 'Now repeat the same steps for qr, app and crm'; capSince = T.repeat; badge = 'Next'; capC = D.violet;
  } else if (st.seg && recKey && cues) {
    badge = `Record ${rec + 1}/4`; capC = RECORDS[rec].color;
    if (act < 0) { cap = R1_INTRO_CAP[0]; capSince = toOut(st.seg, R1_INTRO_CAP[1]); }
    else if (recDone) { cap = `“${recKey}” record added`; capSince = toOut(st.seg, cues.done); }
    else { const a = ACTIONS[act].key; cap = ACT_TEXT(a, recKey); capSince = toOut(st.seg, cues[a]); }
  }
  if (capSince < T.open + 0.6) capSince = T.open + 0.6;

  // widgets
  const seg = st.seg;
  const dnsOut = seg && cues ? toOut(seg, cues.dns) : -99;
  const saveOut = seg && cues ? toOut(seg, cues.save) : -99;
  const doneOut = seg && cues ? toOut(seg, cues.done) : -99;
  const wEnd = Math.max(saveOut, dnsOut + 2.4) + 0.5;
  const kW = t >= dnsOut - 0.3 && t < wEnd + 0.3 ? P(t, dnsOut - 0.3, 0.45) * (1 - P(t, wEnd, 0.3)) : 0;
  const kToast = t >= doneOut && t < doneOut + 2.6 ? P(t, doneOut, 0.4) * (1 - P(t, doneOut + 2.2, 0.35)) : 0;
  const fast = seg && CLIPS[seg.key].rate > 1.5;
  const flash = SEGS.some((s) => s.key !== 'open' && t >= s.out && t < s.out + 0.25) ? 1 - P(t, Math.max(...SEGS.filter((s) => t >= s.out).map((s) => s.out)), 0.25) : 0;
  const repK = st.repeat ? P(t, T.repeat, 0.4) * (1 - P(t, T.r2 - 0.35, 0.35)) : 0;

  return (
    <AbsoluteFill style={{opacity: 1 - kout}}>
      {/* video window */}
      <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: 1920 * WIN.s, height: 1080 * WIN.s, borderRadius: 26, padding: 0, transform: `translateY(${(1 - kin) * 80}px) scale(${lerp(0.88, 1, kin) * (1 - 0.04 * kout)})`, opacity: Math.min(1, kin * 1.5),
        boxShadow: '0 10px 0 #CBD6F0, 0 40px 80px rgba(19,40,120,0.28)', outline: '6px solid #fff', overflow: 'hidden', background: '#fff'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${WIN.s})`, transformOrigin: '0 0'}}>
          {SEGS.map((s) => (
            <Sequence key={s.key} from={Math.round((s.out - T.open) * fps)} durationInFrames={Math.round(len(s.key) * fps)} layout="none">
              <Clip k={s.key} />
            </Sequence>
          ))}
          {/* hold on the first frame of record 2 during the "repeat" card */}
          <Sequence from={Math.round((T.repeat - T.open) * fps)} durationInFrames={Math.round(SCENES.repeat * fps)} layout="none">
            <Freeze frame={0}><OffthreadVideo src={staticFile(VIDEO.src)} trimBefore={Math.round(CLIPS.r2.src[0] * fps)} muted style={{width: 1920, height: 1080}} /></Freeze>
          </Sequence>
          {/* privacy: blur the Cloudflare account e-mail */}
          {inCF(st.src) && (
            <div style={{position: 'absolute', left: BLUR_BOX[0], top: BLUR_BOX[1], width: BLUR_BOX[2], height: BLUR_BOX[3], borderRadius: 10, backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)', background: 'rgba(240,243,250,0.35)'}} />
          )}
        </div>
        {flash > 0 && <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.7}} />}
        {/* repeat card over the frozen frame */}
        {repK > 0 && (
          <div style={{position: 'absolute', inset: 0, backdropFilter: `blur(${10 * repK}px)`, background: `rgba(238,243,255,${0.55 * repK})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{opacity: repK, transform: `scale(${lerp(0.8, 1, eb(repK, 2))})`}}>
              <Card style={{padding: '44px 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
                <Tx size={64} g={[D.navy, D.deep]}>Same steps × 3 more</Tx>
                <div style={{display: 'flex', gap: 26}}>
                  {RECORDS.slice(1).map((r, i) => {
                    const k = P(t, T.repeat + 0.4 + i * 0.18, 0.45);
                    return (
                      <div key={r.key} style={{opacity: Math.min(1, k * 2), transform: `scale(${lerp(0.4, 1, eb(k, 2.4))})`}}>
                        <Chip w="auto" h={78} r={39} c={r.color} depth={6} style={{padding: '0 30px 0 14px'}}><Glyph name={REC_GLYPH[r.key]} size={44} /><Tx size={36} color="#fff">{r.key}</Tx></Chip>
                      </div>
                    );
                  })}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: P(t, T.repeat + 1.2, 0.4)}}>
                  <Glyph name="ff" size={40} color={D.orange} />
                  <Tx size={32} color={D.slate} w={400}>Sped up 2.5× — you have seen how it works</Tx>
                </div>
              </Card>
            </div>
          </div>
        )}
        {/* "added" toast */}
        {kToast > 0 && recKey && (
          <div style={{position: 'absolute', left: '50%', top: 110, transform: `translate(-50%, ${(1 - eo(kToast)) * -40}px) scale(${lerp(0.6, 1, eb(Math.min(1, kToast), 2))})`, opacity: Math.min(1, kToast * 2)}}>
            <Toast text={`${recKey} record added`} />
          </div>
        )}
        {/* proxy widget */}
        {kW > 0 && (
          <div style={{position: 'absolute', right: 30, bottom: 34}}>
            <ProxyWidget k={kW} flip={P(t, dnsOut + 0.35, 0.5)} />
          </div>
        )}
      </div>

      {/* left rail: records */}
      <div style={{position: 'absolute', left: 0, width: WIN.x, top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46}}>
        <Tx size={18} color={D.slate} style={{letterSpacing: 2, opacity: P(t0, 0.5, 0.4)}}>RECORD</Tx>
        {RECORDS.map((r, i) => {
          const s = i < rec || (i === rec && recDone) || (st.repeat && i === 0) ? 2 : i === rec ? 1 : 0;
          return <RailItem key={r.key} icon={REC_GLYPH[r.key]} label={r.key} c={r.color} state={s} k={P(t0, 0.5 + i * 0.12, 0.5)} />;
        })}
      </div>
      {/* right rail: steps */}
      <div style={{position: 'absolute', right: 0, width: WIN.x, top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <Tx size={18} color={D.slate} style={{letterSpacing: 2, opacity: P(t0, 0.7, 0.4)}}>STEP</Tx>
        {ACTIONS.map((a, i) => {
          const s = recDone || i < act ? 2 : i === act ? 1 : 0;
          return <RailItem key={a.key} icon={ACT_GLYPH[a.key]} label={a.label} c={a.key === 'dns' ? D.orange : D.deep} state={rec < 0 ? 0 : s} k={P(t0, 0.7 + i * 0.1, 0.5)} size={66} />;
        })}
      </div>

      {/* speed badge */}
        {fast && (
          <div style={{position: 'absolute', right: WIN.x / 2, top: 900, transformOrigin: '50% 50%', translate: '50% 0', transform: `scale(${eb(P(t, seg!.out, 0.4), 2.2) * (1 + 0.04 * Math.sin(t * 6))})`}}>
            <Chip w="auto" h={60} r={30} c={D.orange} depth={5} style={{padding: '0 22px'}}><Glyph name="ff" size={30} /><Tx size={28} color="#fff">2.5×</Tx></Chip>
          </div>
        )}
      {cap && <Caption key={cap} text={cap} since={capSince - T.open} badge={badge} c={capC} k={kin} />}
    </AbsoluteFill>
  );
};

// ---------- 4 · Summary ----------
const Summary: React.FC = () => {
  const t = useSec();
  const out = P(t, SCENES.summary - 0.4, 0.4);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Pop t={t} at={0.1} x={960} y={130}>
        <Words t={t} at={0.1} text="All 4 records added" size={84} g={[D.navy, D.deep]} hi={{1: [D.green, '#0E9A5C']}} />
      </Pop>
      <Pop t={t} at={0.4} x={960} y={440} dy={60}>
        <Card w={1320} style={{padding: '26px 40px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '160px 180px 1fr 230px 60px', alignItems: 'center', rowGap: 6}}>
            {['Type', 'Name', 'Target', 'Proxy', ''].map((h) => <Tx key={h} size={22} color={D.slate} style={{paddingBottom: 10}}>{h.toUpperCase()}</Tx>)}
            {RECORDS.map((r, i) => {
              const k = P(t, 0.8 + i * 0.3, 0.45);
              const tk = P(t, 1.1 + i * 0.3, 0.4);
              const cell: React.CSSProperties = {opacity: Math.min(1, k * 2), transform: `translateX(${(1 - eo(k)) * -40}px)`, padding: '14px 0', borderTop: `2px solid ${D.line}`};
              return (
                <React.Fragment key={r.key}>
                  <div style={cell}><Tx size={30} color={D.deep}>CNAME</Tx></div>
                  <div style={cell}><Tx size={30} color={r.color}>{r.key}</Tx></div>
                  <div style={cell}><Tx size={28} w={400} color={D.slate}>xxxxxxxx.vercel-dns-016.com</Tx></div>
                  <div style={{...cell, display: 'flex', alignItems: 'center', gap: 10}}><Glyph name="cloud" size={36} color="#AAB3C8" /><Tx size={28} color={D.ink}>DNS only</Tx></div>
                  <div style={{...cell, transform: `scale(${eb(tk, 2.6)})`}}><Chip w={44} h={44} r={22} c={D.green} depth={4}><Glyph name="check" size={24} /></Chip></div>
                </React.Fragment>
              );
            })}
          </div>
        </Card>
      </Pop>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 40}}>
        {([['save', 'Click “Save domains” in MagicBolt', D.blue], ['clock', 'DNS can take a few minutes to go live', D.orange]] as const).map(([ic, txt, c], i) => {
          const k = P(t, 2.6 + i * 0.35, 0.5);
          return (
            <div key={ic} style={{opacity: Math.min(1, k * 2), transform: `translateY(${(1 - eo(k)) * 50}px) scale(${lerp(0.7, 1, eb(k, 2))})`}}>
              <Card r={30} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 34px 18px 18px'}}>
                <IconChip name={ic} size={84} c={c} />
                <Tx size={32}>{txt}</Tx>
              </Card>
            </div>
          );
        })}
      </div>
      {t > 1 && [[180, 160, 56, D.gold], [1750, 210, 46, D.green], [1760, 860, 60, D.blue], [150, 880, 44, D.orange]].map(([x, y, s, c], i) => <Spark key={i} x={x as number} y={y as number} s={(s as number) * eo(P(t, 1 + i * 0.2, 0.5))} c={c as string} t={t} i={i} />)}
    </AbsoluteFill>
  );
};

export const DnsTutorial: React.FC = () => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{background: '#F5F8FF'}}>
      <Backdrop />
      <Sequence durationInFrames={f(SCENES.intro)}><TitleCard title="Connect Your Custom Domain" eyebrow="MagicBolt Tutorial · DNS Setup" dur={SCENES.intro} /></Sequence>
      <Sequence from={f(T.overview)} durationInFrames={f(SCENES.overview)}><Overview /></Sequence>
      <Sequence from={f(T.open)} durationInFrames={f(T.summary - T.open)}><Stage /></Sequence>
      <Sequence from={f(T.summary)} durationInFrames={f(SCENES.summary)}><Summary /></Sequence>
      <Sequence from={f(T.outro)} durationInFrames={f(SCENES.outro)}><EndLogo /></Sequence>
      {VIDEO.voiceover && <Audio src={staticFile(VIDEO.voiceover)} />}
      {VIDEO.music && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} loop />}
    </AbsoluteFill>
  );
};

// exported for the script / debugging
export const DNS_TIMELINE = T;
