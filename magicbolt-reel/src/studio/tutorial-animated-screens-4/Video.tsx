// Full video (approved concept B "Feature Spotlight"): dark stage, feature headline on the left,
// the re-created Agency OS panel on the right, every beat cued to the voiceover word times in config.ts.
import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Backdrop, Caption, IconChip, Gl, Glyph, Tx, useSec, P} from '../../dns/ui';
import {TitleCard, EndLogo} from '../../tutorial/brand';
import {CameraRig, CountUp, CursorPath, Notification, ProgressBar, SceneSeq, Spotlight, SpringIn, Toggle, stagger, transitionFor} from '../kit';
import {Abs, Badge, Btn, DATA, Feature, Field, In, L, Panel, Placed, SB, STATUS_C, Shell, Stage, ek, typed} from './Concepts';
import {BROWSER_B, DURATION, END_START, ORDER, SCENES, SceneKey, VIDEO, sceneEnd, NAVY, DEEP, BLUE, GOLD, ORANGE, SLATE, GREEN, RED, LINE, MUTED} from './config';
import TEXT from './text.json';

type Rect = {x: number; y: number; w: number; h: number};
const rel = (start: number) => (abs: number) => abs - start;
const Note: React.FC<{at: number; title: string; sub?: string; icon?: Gl; c?: string}> = ({at, title, sub, icon = 'check', c = GREEN}) => (
  <Abs x={1340} y={52} w={540} h={140}><Notification at={at} title={title} sub={sub} w={520} icon={<IconChip name={icon} size={50} c={c} round />} /></Abs>
);
const Screen: React.FC<{f: {eyebrow: string; headline: string; sub: string; points: string[]}; icon: Gl; icons: Gl[]; cues: number[]; active: number; client?: number; bare?: boolean; children?: React.ReactNode}> = ({f, icon, icons, cues, active, client, bare, children}) => <>
  <Feature eyebrow={f.eyebrow} icon={icon} headline={f.headline} sub={f.sub} points={f.points} icons={icons} cues={cues} />
  <Placed b={BROWSER_B}>{bare ? <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#F7F9FF,#EAF1FF)'}}>{children}</div> : <Shell active={active} client={client}>{children}</Shell>}</Placed>
</>;
const Pt = (r: Rect, t: number) => ({t, ...r});

// ---------- 1. sign up + log in ----------
const SignUp: React.FC = () => {
  const S = SCENES.signup, r = rel(S.start), T = TEXT.SignUp, t = useSec();
  const login = t > r(S.login) ? 1 : 0;
  const btn = SB(768, 560), tab = SB(920, 225);
  return <>
    <Screen f={T} icon="login" icons={['globe', 'login', 'mail']} cues={[r(S.site), r(S.signup), r(S.email)]} active={-1} bare>
      <In at={0.3} x={458} y={70}><Panel w={620} h={660} style={{padding: '34px 44px'}}>
        <div style={{textAlign: 'center'}}><Img src={staticFile('magicbolt-logo.png')} style={{height: 58}} /></div>
        <div style={{textAlign: 'center', marginTop: 10}}><Tx size={30} color={NAVY}>{T.cardTitle}</Tx><div><Tx size={19} color={SLATE} w={400}>{T.cardSub}</Tx></div></div>
        <div style={{position: 'relative', display: 'flex', marginTop: 24, padding: 5, borderRadius: 14, background: '#EEF2FA'}}>
          <div style={{position: 'absolute', left: 5 + login * 263, top: 5, width: 258, height: 46, borderRadius: 10, background: `linear-gradient(145deg,${BLUE},${DEEP})`}} />
          {T.tabs.map((n, i) => <div key={n} style={{position: 'relative', flex: 1, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={20} color={i === login ? '#fff' : SLATE}>{n}</Tx></div>)}
        </div>
        <div style={{marginTop: 26}}><Field label={T.emailLabel} value={T.email} w={532} at={r(S.email)} active={t > r(S.email) && t < r(S.password)} /></div>
        <div style={{marginTop: 18}}><Field label={T.passwordLabel} value={T.password} w={532} at={r(S.password)} active={t > r(S.password)} /></div>
        <div style={{marginTop: 30, textAlign: 'center'}}><Btn label={login ? T.loginBtn : T.signupBtn} gold size={24} hover={ek(t, r(S.submit), 0.2)} /></div>
      </Panel></In>
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(458, 70, 620, 660), r(S.signup))]} />
    <CursorPath keys={[{t: 0, x: 1700, y: 900}, {t: r(S.signup) - 0.3, x: btn.x, y: btn.y}, {t: r(S.signup), x: btn.x, y: btn.y, click: true}, {t: r(S.login) - 0.25, x: tab.x, y: tab.y}, {t: r(S.login), x: tab.x, y: tab.y, click: true}, {t: r(S.submit) - 0.3, x: btn.x, y: btn.y}, {t: r(S.submit), x: btn.x, y: btn.y, click: true}]} />
  </>;
};

// ---------- 2. two dashboards ----------
const Dashboards: React.FC = () => {
  const S = SCENES.dashboards, r = rel(S.start), T = TEXT.Dashboards, t = useSec();
  const client = ek(t, r(S.client), 0.4);
  const tabC = SB(195, 135);
  return <>
    <Screen f={{...T, points: T.points}} icon="app" icons={['app', 'login']} cues={[r(S.agency), r(S.client)]} active={client > 0.5 ? -1 : 0} client={client}>
      {T.cards.map((c, i) => <In key={c.title} at={0.5 + i * 0.2} x={300 + i * 616} y={110}><Panel w={590} h={600} style={{padding: 40, background: i === 0 ? 'linear-gradient(160deg,#fff,#EEF4FF)' : 'linear-gradient(160deg,#fff,#FFF6E6)'}}>
        <IconChip name={i === 0 ? 'app' : 'login'} size={110} c={i === 0 ? BLUE : ORANGE} />
        <div style={{marginTop: 30}}><Tx size={38} color={NAVY}>{c.title}</Tx></div>
        {c.items.map((it, j) => <div key={it} style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 16, opacity: ek(t, r(i === 0 ? S.agency : S.client) + j * 0.15)}}>
          <div style={{width: 34, height: 34, borderRadius: 10, background: i === 0 ? `${BLUE}22` : `${ORANGE}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Glyph name="check" size={20} color={i === 0 ? DEEP : ORANGE} /></div>
          <Tx size={24} color={SLATE}>{it}</Tx>
        </div>)}
      </Panel></In>)}
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(300, 110, 590, 600), r(S.agency)), Pt(SB(300, 110, 590, 600), r(S.client) - 0.3), Pt(SB(916, 110, 590, 600), r(S.client))]} />
    <CursorPath keys={[{t: 0, x: 1300, y: 900}, {t: r(S.client) - 0.4, x: tabC.x, y: tabC.y}, {t: r(S.client), x: tabC.x, y: tabC.y, click: true}, {t: r(S.client) + 1.2, x: tabC.x + 30, y: tabC.y + 40}]} />
  </>;
};

// ---------- 3. agency dashboard ----------
const STAT_C = [GREEN, BLUE, ORANGE, DEEP];
const STAT_G: Gl[] = ['ff', 'login', 'globe', 'check'];
const Dashboard: React.FC = () => {
  const S = SCENES.dashboard, r = rel(S.start), T = TEXT.Dashboard, t = useSec();
  const vals = [DATA.mrr, DATA.clients, DATA.profiles, DATA.subs];
  return <>
    <Screen f={T} icon="app" icons={['login', 'globe', 'app']} cues={[r(S.clients), r(S.profiles), r(S.recent)]} active={0}>
      <In at={0.3} x={300} y={88}><div style={{width: 1206, height: 150, borderRadius: 22, background: `linear-gradient(120deg,${NAVY},${DEEP} 55%,${BLUE})`, position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', right: -60, top: -80, width: 300, height: 300, borderRadius: 300, background: 'radial-gradient(closest-side,#FDC60B55,#FDC60B00)'}} />
        <Abs x={40} y={34}><Tx size={40} color="#fff">{T.welcome}</Tx><div style={{marginTop: 6}}><Tx size={20} color="#C9DAFF" w={400}>{T.welcomeSub}</Tx></div></Abs>
        <Abs x={830} y={46}><div style={{display: 'flex', gap: 16}}><Btn label={T.addClient} gold /><Btn label={T.addBusiness} /></div></Abs>
      </div></In>
      {T.stats.map((s, i) => <In key={i} at={stagger(i, 0.55, 0.12)} x={300 + i * 307} y={262}><Panel w={285} h={170}>
        <Abs x={22} y={20}><IconChip name={STAT_G[i]} size={46} c={STAT_C[i]} /></Abs>
        <Abs x={22} y={78}><Tx size={16} color={SLATE} w={400}>{s.label}</Tx></Abs>
        <Abs x={22} y={100}><CountUp to={vals[i]} at={[0.7, r(S.clients), r(S.profiles), 0.9][i]} dur={1} prefix={s.prefix} style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 38, color: NAVY}} /></Abs>
        <Abs x={22} y={146}><Tx size={14} color={MUTED} w={400}>{s.foot}</Tx></Abs>
      </Panel></In>)}
      {[T.recentClients, T.recentBusinesses].map((title, c) => <In key={c} at={1.0 + c * 0.15} x={300 + c * 614} y={456}><Panel w={592} h={330}>
        <Abs x={26} y={22}><Tx size={22} color={NAVY}>{title}</Tx></Abs>
        {(c === 0 ? T.clients : T.businesses).map((n, i) => <Abs key={n} x={26} y={78 + i * 80} w={540}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: ek(t, (c === 0 ? 1.2 : r(S.recent)) + i * 0.12)}}>
            <div style={{width: 46, height: 46, borderRadius: 14, background: `linear-gradient(145deg,${[BLUE, ORANGE, GREEN][i]},${DEEP})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={20} color="#fff">{n[0]}</Tx></div>
            <Tx size={19} color={NAVY}>{n}</Tx><div style={{flex: 1}} />
            {c === 0 ? <Btn label={T.login} size={16} /> : <Badge label={T.active} c={GREEN} size={15} />}
          </div>
        </Abs>)}
      </Panel></In>)}
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(607, 262, 285, 170), r(S.clients)), Pt(SB(914, 262, 285, 170), r(S.profiles)), Pt(SB(914, 262, 285, 170), r(S.recent) - 0.35), Pt(SB(914, 456, 592, 330), r(S.recent))]} />
  </>;
};

// ---------- 4. clients ----------
const Clients: React.FC = () => {
  const S = SCENES.clients, r = rel(S.start), T = TEXT.Clients, t = useSec();
  const gone = ek(t, r(S.disconnect) + 0.25, 0.5);
  const lg = SB(1130 + 50, 190 + 40), dc = SB(1290 + 70, 190 + 2 * 112 + 40);
  return <>
    <Screen f={T} icon="login" icons={['login', 'save']} cues={[r(S.login), r(S.disconnect)]} active={1}>
      <In at={0.3} x={300} y={92}><Tx size={34} color={NAVY}>{T.title}</Tx></In>
      {T.columns.map((c, i) => <In key={c} at={0.4} x={[330, 760, 920][i]} y={150}><Tx size={17} color={MUTED}>{c}</Tx></In>)}
      {T.rows.map((row, i) => {
        const k = ek(t, r(S.list) + i * 0.12, 0.4);
        const out = i === 2 ? gone : 0;
        const lift = i === 3 ? gone * 112 : 0;
        return <Abs key={row.name} x={300} y={190 + i * 112 - lift} w={1206}><div style={{opacity: k * (1 - out), transform: `translateX(${(1 - k) * 30 + out * 60}px)`}}><Panel w={1206} h={96} style={{display: 'flex', alignItems: 'center', padding: '0 26px'}}>
          <div style={{width: 46, height: 46, borderRadius: 14, background: `linear-gradient(145deg,${[BLUE, ORANGE, GREEN, GOLD][i]},${DEEP})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16}}><Tx size={20} color="#fff">{row.name[0]}</Tx></div>
          <div style={{width: 398}}><Tx size={22} color={NAVY}>{row.name}</Tx></div>
          <div style={{width: 160}}><Tx size={22} color={SLATE}>{row.count}</Tx></div>
          <Badge label={T.active} c={GREEN} size={16} />
          <div style={{flex: 1}} />
          <div style={{display: 'flex', gap: 14}}>
            <Btn label={T.login} size={18} hover={i === 0 ? ek(t, r(S.login), 0.2) : 0} />
            <div style={{padding: '10px 20px', borderRadius: 12, border: `2px solid ${RED}66`, background: i === 2 ? `rgba(229,72,77,${0.12 * ek(t, r(S.disconnect), 0.2)})` : '#fff'}}><Tx size={18} color={RED}>{T.disconnect}</Tx></div>
          </div>
        </Panel></div></Abs>;
      })}
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(1110, 190, 130, 96), r(S.login) - 0.2), Pt(SB(1110, 190, 130, 96), r(S.disconnect) - 0.8), Pt(SB(1250, 190 + 224, 236, 96), r(S.disconnect) - 0.2)]} />
    <Note at={r(S.login) + 0.3} title={T.opened} sub={T.openedSub} icon="login" c={BLUE} />
    <CursorPath keys={[{t: 0, x: 1500, y: 900}, {t: r(S.login) - 0.35, x: lg.x, y: lg.y}, {t: r(S.login), x: lg.x, y: lg.y, click: true}, {t: r(S.disconnect) - 0.4, x: dc.x, y: dc.y}, {t: r(S.disconnect), x: dc.x, y: dc.y, click: true}, {t: r(S.disconnect) + 1.5, x: dc.x + 20, y: dc.y + 60}]} />
  </>;
};

// ---------- 5. connections ----------
const ServiceChip: React.FC<{kind: 'g' | 'm'; label: string; on: number}> = ({kind, label, on}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 16px 7px 7px', borderRadius: 99, background: '#fff', border: `1.5px solid ${LINE}`, boxShadow: '0 3px 0 #E4EAF6', opacity: on, transform: `scale(${0.85 + 0.15 * on})`}}>
    <div style={{width: 34, height: 34, borderRadius: 17, background: kind === 'g' ? 'conic-gradient(#EA4335 0 25%,#FBBC05 0 50%,#34A853 0 75%,#4285F4 0)' : 'linear-gradient(145deg,#2D8CFF,#0866FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 0 rgba(255,255,255,.4)'}}>
      <div style={{width: 22, height: 22, borderRadius: 11, background: kind === 'g' ? '#fff' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={kind === 'g' ? 15 : 18} color={kind === 'g' ? '#4285F4' : '#fff'}>{kind === 'g' ? 'G' : '∞'}</Tx></div>
    </div>
    <Tx size={17} color={NAVY}>{label}</Tx>
  </div>
);
const Connections: React.FC = () => {
  const S = SCENES.connections, r = rel(S.start), T = TEXT.Connections, t = useSec();
  const has = [[1, 1], [1, 0], [1, 1], [0, 1]];
  return <>
    <Screen f={T} icon="cname" icons={['globe', 'crm']} cues={[r(S.google), r(S.meta)]} active={3}>
      <In at={0.3} x={300} y={92}><Tx size={34} color={NAVY}>{T.title}</Tx></In>
      {T.columns.map((c, i) => <In key={c} at={0.4} x={[330, 760][i]} y={150}><Tx size={17} color={MUTED}>{c}</Tx></In>)}
      {T.rows.map((n, i) => {
        const k = ek(t, 0.6 + i * 0.12, 0.4);
        return <Abs key={n} x={300} y={190 + i * 112} w={1206}><div style={{opacity: k, transform: `translateY(${(1 - k) * 20}px)`}}><Panel w={1206} h={96} style={{display: 'flex', alignItems: 'center', padding: '0 26px', gap: 16}}>
          <IconChip name="globe" size={48} c={[BLUE, ORANGE, GREEN, DEEP][i]} />
          <div style={{width: 390}}><Tx size={22} color={NAVY}>{n}</Tx></div>
          <div style={{display: 'flex', gap: 12, width: 560}}>
            {has[i][0] ? <ServiceChip kind="g" label={T.google} on={ek(t, r(S.services) + i * 0.15, 0.35)} /> : null}
            {has[i][1] ? <ServiceChip kind="m" label={T.meta} on={ek(t, r(S.services) + 0.3 + i * 0.15, 0.35)} /> : null}
          </div>
          <Badge label={T.connected} c={GREEN} size={15} />
        </Panel></div></Abs>;
      })}
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(740, 190, 560, 432), r(S.google))]} />
  </>;
};

// ---------- 6. AI content ----------
const AIContent: React.FC = () => {
  const S = SCENES.ai, r = rel(S.start), T = TEXT.AI, t = useSec();
  const shown = typed(T.result, t, r(S.result), 0.02);
  const btn = SB(1300 + 80, 186 + 30);
  return <>
    <Screen f={T} icon="ff" icons={['name', 'ff']} cues={[0.6, r(S.generate)]} active={4}>
      <In at={0.2} x={300} y={92}><Tx size={34} color={NAVY}>{T.title}</Tx></In>
      <In at={0.3} x={300} y={150}><Field label={T.promptLabel} value={T.prompt} w={960} at={0.4} active={t < r(S.generate)} /></In>
      <In at={0.4} x={1290} y={180}><Btn label={`✦ ${T.generate}`} gold size={22} hover={ek(t, r(S.generate), 0.2)} /></In>
      <In at={0.5} x={300} y={290}><Panel w={1206} h={420} style={{padding: 34, background: 'linear-gradient(160deg,#fff,#F3F0FF)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}><IconChip name="ff" size={52} c={DEEP} /><Tx size={26} color={NAVY}>{T.resultTitle}</Tx></div>
        <div style={{marginTop: 20}}><ProgressBar at={r(S.generate) + 0.1} dur={0.6} w={1130} h={10} colors={[BLUE, GOLD]} /></div>
        <div style={{marginTop: 26, width: 1120}}><Tx size={30} color={NAVY} w={400} style={{whiteSpace: 'normal', lineHeight: 1.4}}>{shown}</Tx></div>
      </Panel></In>
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(300, 290, 1206, 420), r(S.result))]} />
    <CursorPath keys={[{t: 0, x: 1700, y: 950}, {t: r(S.generate) - 0.35, x: btn.x, y: btn.y}, {t: r(S.generate), x: btn.x, y: btn.y, click: true}, {t: 2.9, x: btn.x + 30, y: btn.y + 80}]} />
  </>;
};

// ---------- 7. subscriptions: plan builder ----------
const Plans: React.FC = () => {
  const S = SCENES.plans, r = rel(S.start), T = TEXT.Plans, t = useSec();
  const pickAt = r(S.interval) + 0.55;
  const open = ek(t, r(S.interval), 0.25) * (1 - ek(t, pickAt + 0.25, 0.2));
  const chosen = t > pickAt ? 1 : 0;
  const drop = SB(560, 280), pick = SB(300 + 140, 250 + 92 + 56 + 28), tog = SB(1440, 304);
  return <>
    <Screen f={T} icon="clock" icons={['name', 'clock', 'target']} cues={[r(S.pricing), r(S.interval), r(S.limits)]} active={5}>
      <In at={0.3} x={300} y={92}><Tx size={34} color={NAVY}>{T.formTitle}</Tx></In>
      <In at={0.4} x={300} y={150}><Field label={T.nameLabel} value={T.name} w={560} at={r(S.build)} active={t < r(S.pricing)} /></In>
      <In at={0.5} x={890} y={150}><Field label={T.priceLabel} value={`₹ ${T.price}`} w={290} at={r(S.pricing)} active={t > r(S.pricing) && t < r(S.currency)} /></In>
      <In at={0.6} x={1206} y={150}><Field label={T.currencyLabel} value={T.currency} w={290} at={r(S.currency)} active={t > r(S.currency) && t < r(S.interval)} /></In>
      <In at={0.7} x={300} y={250}><Field label={T.intervalLabel} value={`${T.intervals[chosen]}  ▾`} w={560} at={0} active={open > 0.1} /></In>
      <In at={0.8} x={890} y={262}><Panel w={606} h={84} style={{display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between'}}><Tx size={22} color={NAVY}>{T.trialLabel}</Tx><Toggle at={r(S.trial)} w={100} /></Panel></In>
      <In at={0.9} x={890} y={410}><Panel w={606} h={230} style={{padding: 26}}>
        <Tx size={22} color={NAVY}>{T.limitsTitle}</Tx>
        {T.limits.map((l, i) => <div key={l} style={{marginTop: 22}}><div style={{marginBottom: 8}}><Tx size={18} color={SLATE} w={400}>{l}</Tx></div><ProgressBar at={r(S.limits) + i * 0.2} dur={0.8} to={[0.55, 0.8][i]} w={550} h={18} /></div>)}
      </Panel></In>
      <In at={1.0} x={300} y={690}><Btn label={T.save} gold size={24} /></In>
      {open > 0 && <Abs x={300} y={342} w={560}><div style={{opacity: open, transform: `translateY(${(1 - open) * -12}px)`, background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`, boxShadow: '0 20px 40px rgba(14,27,77,.18)', padding: 6}}>
        {T.intervals.map((n, i) => <div key={n} style={{height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: 10, background: i === 1 && t > pickAt - 0.3 ? '#E6F0FF' : 'transparent'}}><Tx size={22} color={i === chosen ? DEEP : NAVY} w={i === chosen ? 700 : 400}>{(i === chosen ? '✓ ' : '') + n}</Tx></div>)}
      </div></Abs>}
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(890, 150, 606, 90), r(S.pricing)), Pt(SB(300, 250, 560, 90), r(S.interval)), Pt(SB(890, 262, 606, 84), r(S.trial)), Pt(SB(890, 410, 606, 230), r(S.limits))]} />
    <CursorPath keys={[{t: 0, x: 1700, y: 900}, {t: r(S.interval) - 0.35, x: drop.x, y: drop.y}, {t: r(S.interval), x: drop.x, y: drop.y, click: true}, {t: pickAt - 0.2, x: pick.x, y: pick.y}, {t: pickAt, x: pick.x, y: pick.y, click: true}, {t: r(S.trial) - 0.3, x: tog.x, y: tog.y}, {t: r(S.trial), x: tog.x, y: tog.y, click: true}, {t: r(S.limits) + 0.8, x: tog.x + 20, y: tog.y + 120}]} />
  </>;
};

// ---------- 8. tiers + assign ----------
const Tiers: React.FC = () => {
  const S = SCENES.tiers, r = rel(S.start), T = TEXT.Tiers, t = useSec();
  const btn = SB(1380, 640);
  return <>
    <Screen f={T} icon="target" icons={['target', 'ff', 'login']} cues={[0.6, r(S.higher), r(S.assign)]} active={5}>
      {T.plans.map((p, i) => <In key={p.name} at={stagger(i, r(S.higher) - 0.5, 0.25)} x={300 + i * 412} y={92 - i * 14}><Panel w={382} h={400 + i * 14} style={{padding: 30, background: i === 1 ? `linear-gradient(160deg,${DEEP},${BLUE})` : '#fff', border: i === 1 ? 'none' : undefined}}>
        <Tx size={26} color={i === 1 ? GOLD : DEEP}>{p.name}</Tx>
        <div style={{marginTop: 10}}><Tx size={52} color={i === 1 ? '#fff' : NAVY}>{p.price}</Tx> <Tx size={18} color={i === 1 ? '#D6E5FF' : SLATE} w={400}>{T.perMonth}</Tx></div>
        {p.limits.map((l, j) => <div key={l} style={{marginTop: 20}}><div style={{marginBottom: 8}}><Tx size={19} color={i === 1 ? '#fff' : SLATE}>{l}</Tx></div><ProgressBar at={r(S.higher) + i * 0.25 + j * 0.1} dur={0.7} to={[0.2, 0.55, 1][i]} w={320} h={14} /></div>)}
      </Panel></In>)}
      <In at={r(S.assign) - 0.4} x={300} y={540}><Panel w={1206} h={170} style={{padding: '24px 30px', display: 'flex', alignItems: 'flex-end', gap: 30}}>
        <div style={{position: 'absolute', left: 30, top: 18}}><Tx size={22} color={NAVY}>{T.assignTitle}</Tx></div>
        <Field label={T.customerLabel} value={T.customer} w={440} at={r(S.assign)} active={t > r(S.assign) && t < r(S.customer)} />
        <Field label={T.planLabel} value={T.plan} w={300} at={r(S.assign) + 0.5} />
        <Btn label={T.assign} gold size={24} hover={ek(t, r(S.customer), 0.2)} />
      </Panel></In>
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(300, 50, 1206, 460), r(S.higher)), Pt(SB(300, 540, 1206, 170), r(S.assign))]} />
    <Note at={r(S.customer) + 0.3} title={T.done} sub={T.doneSub} />
    <CursorPath keys={[{t: 0, x: 1650, y: 950}, {t: r(S.customer) - 0.4, x: btn.x, y: btn.y}, {t: r(S.customer), x: btn.x, y: btn.y, click: true}]} />
  </>;
};

// ---------- 9. billing ----------
const Billing: React.FC = () => {
  const S = SCENES.billing, r = rel(S.start), T = TEXT.Billing, t = useSec();
  const vals = [DATA.mrr, DATA.arpu, DATA.subs, DATA.overdue];
  const at = [r(S.mrr), r(S.arpu), r(S.subs), r(S.overdue)];
  const statusAt: Record<string, number> = {Paid: r(S.paid), Partial: r(S.partial), Overdue: r(S.overdue)};
  return <>
    <Screen f={T} icon="copy" icons={['ff', 'check', 'copy']} cues={[r(S.mrr), r(S.subs), r(S.paid)]} active={6}>
      <In at={0.2} x={300} y={84}><Tx size={36} color={NAVY}>{T.title}</Tx><div><Tx size={19} color={SLATE} w={400}>{T.sub}</Tx></div></In>
      {T.metrics.map((m, i) => <In key={i} at={stagger(i, 0.4, 0.1)} x={300 + i * 307} y={180}><Panel w={285} h={150} style={i === 0 ? {background: `linear-gradient(145deg,${DEEP},${BLUE})`, border: 'none'} : undefined}>
        <Abs x={24} y={22}><Tx size={18} color={i === 0 ? '#D6E5FF' : SLATE} w={400}>{m.label}</Tx></Abs>
        <Abs x={24} y={56}><CountUp to={vals[i]} at={at[i] - 0.3} dur={1} prefix={m.prefix} style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 44, color: i === 0 ? '#fff' : i === 3 ? RED : NAVY}} /></Abs>
        <Abs x={24} y={118} w={237}><div style={{height: 6, borderRadius: 6, background: i === 0 ? 'rgba(255,255,255,.25)' : '#EEF2FA', overflow: 'hidden'}}><div style={{height: '100%', width: `${ek(t, at[i], 1) * [82, 64, 72, 30][i]}%`, background: i === 0 ? GOLD : [GREEN, BLUE, BLUE, RED][i]}} /></div></Abs>
      </Panel></In>)}
      <In at={r(S.subs)} x={300} y={360}><Panel w={1206} h={420}>
        <Abs x={30} y={22}><Tx size={24} color={NAVY}>{T.invoicesTitle}</Tx></Abs>
        {T.columns.map((c, i) => <Abs key={c} x={[30, 280, 700, 936][i]} y={76}><Tx size={16} color={MUTED}>{c}</Tx></Abs>)}
        <Abs x={20} y={104} w={1166} h={1}><div style={{height: 1, background: LINE}} /></Abs>
        {T.invoices.map((row, i) => {
          const k = ek(t, r(S.invoices) - 0.6 + i * 0.12, 0.4);
          const b = ek(t, statusAt[row.status] ?? r(S.paid), 0.3);
          return <Abs key={row.id} x={30} y={118 + i * 72} w={1146}><div style={{display: 'flex', alignItems: 'center', height: 60, opacity: k, transform: `translateX(${(1 - k) * 30}px)`}}>
            <div style={{width: 250}}><Tx size={19} color={DEEP}>{row.id}</Tx></div>
            <div style={{width: 420}}><Tx size={19} color={NAVY} w={400}>{row.client}</Tx></div>
            <div style={{width: 236}}><Tx size={19} color={NAVY}>{row.amount}</Tx></div>
            <div style={{opacity: b, transform: `scale(${0.7 + 0.3 * b})`}}><Badge label={row.status} c={STATUS_C[row.status] ?? BLUE} /></div>
          </div></Abs>;
        })}
      </Panel></In>
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(300, 180, 285, 150), r(S.mrr)), Pt(SB(607, 180, 285, 150), r(S.arpu)), Pt(SB(914, 180, 285, 150), r(S.subs)), Pt(SB(914, 180, 285, 150), r(S.paid) - 0.5), Pt(SB(1236, 470, 250, 300), r(S.paid))]} />
  </>;
};

// ---------- 10. lead center ----------
const Leads: React.FC = () => {
  const S = SCENES.leads, r = rel(S.start), T = TEXT.Leads, t = useSec();
  const call = SB(1330 + 60, 190 + 50);
  const res = r(S.location) + 0.35;
  return <>
    <Screen f={T} icon="target" icons={['name', 'globe', 'crm']} cues={[r(S.category), r(S.location), r(S.call)]} active={7}>
      <In at={0.3} x={300} y={86}><Field label={T.categoryLabel} value={T.category} w={420} at={r(S.category)} active={t < r(S.location)} /></In>
      <In at={0.4} x={740} y={86}><Field label={T.locationLabel} value={T.location} w={480} at={r(S.location)} active={t > r(S.location) && t < res} /></In>
      <In at={0.5} x={1250} y={116}><Btn label={T.search} size={22} hover={ek(t, res - 0.15, 0.2)} /></In>
      {T.results.map((n, i) => {
        const k = ek(t, res + i * 0.1, 0.35);
        return <Abs key={n} x={300} y={196 + i * 124} w={1206}><div style={{opacity: k, transform: `translateY(${(1 - k) * 24}px)`}}><Panel w={1206} h={108} style={{display: 'flex', alignItems: 'center', padding: '0 26px', gap: 22}}>
          <IconChip name="globe" size={56} c={[BLUE, ORANGE, GREEN, DEEP][i]} />
          <div style={{width: 520}}><Tx size={23} color={NAVY}>{n}</Tx><div><Tx size={17} color={SLATE} w={400}>{T.category} · {T.areas[i]}</Tx></div></div>
          <Tx size={20} color={GOLD}>★★★★★</Tx><Tx size={19} color={NAVY}>{['4.8', '4.6', '4.7', '4.5'][i]}</Tx>
          <div style={{flex: 1}} />
          <Btn label={`✆ ${T.call}`} gold size={20} hover={i === 0 ? ek(t, r(S.call), 0.2) : 0} />
        </Panel></div></Abs>;
      })}
    </Screen>
    <Spotlight level={L} keys={[Pt(SB(300, 86, 920, 90), r(S.category)), Pt(SB(1300, 180, 200, 470), r(S.call) - 0.3)]} />
    <Note at={res + 0.3} title={T.notify} sub={T.notifySub} icon="target" c={BLUE} />
    <CursorPath keys={[{t: 0, x: 1100, y: 900}, {t: r(S.call) - 0.4, x: call.x, y: call.y}, {t: r(S.call), x: call.x, y: call.y, click: true}]} />
  </>;
};

// ---------- 11. bulk messaging ----------
const Bulk: React.FC = () => {
  const S = SCENES.bulk, r = rel(S.start), T = TEXT.Bulk, t = useSec();
  const send = SB(300 + 130, 640 + 30);
  return <>
    <Screen f={T} icon="mail" icons={['login', 'name', 'mail']} cues={[0.35, 0.8, r(S.broadcast)]} active={8}>
      <In at={0.2} x={300} y={92}><Tx size={34} color={NAVY}>{T.title}</Tx></In>
      <In at={0.3} x={300} y={152}><Tx size={18} color={SLATE}>{T.toLabel}</Tx><div style={{display: 'flex', gap: 12, marginTop: 8}}>{T.audience.map((a, i) => <Badge key={a} label={a} c={i === 0 ? BLUE : GREEN} size={20} />)}</div></In>
      <In at={0.4} x={300} y={250}><Panel w={1206} h={340} style={{padding: 28}}>
        <Tx size={18} color={SLATE}>{T.messageLabel}</Tx>
        <div style={{marginTop: 14, width: 1140}}><Tx size={30} color={NAVY} w={400} style={{whiteSpace: 'normal', lineHeight: 1.4}}>{typed(T.message, t, 0.5, 0.018)}</Tx></div>
        <div style={{position: 'absolute', left: 28, bottom: 28}}><ProgressBar at={r(S.broadcast) + 0.15} dur={0.8} w={1150} h={14} colors={[GREEN, BLUE]} /></div>
      </Panel></In>
      <In at={0.5} x={300} y={640}><Btn label={T.send} gold size={24} hover={ek(t, r(S.broadcast), 0.2)} /></In>
    </Screen>
    <Note at={r(S.customers) - 0.3} title={T.sent} sub={T.sentSub} icon="mail" />
    <CursorPath keys={[{t: 0, x: 1650, y: 950}, {t: r(S.broadcast) - 0.4, x: send.x, y: send.y}, {t: r(S.broadcast), x: send.x, y: send.y, click: true}]} />
  </>;
};

// ---------- 12. integrations ----------
const ITEM_C = [BLUE, '#0866FF', GREEN, NAVY, RED, ORANGE];
const Integrations: React.FC = () => {
  const S = SCENES.integrations, r = rel(S.start), T = TEXT.Integrations, t = useSec();
  return <>
    <Screen f={T} icon="dns" icons={['ff']} cues={[r(S.videos) - 0.4]} active={9}>
      {T.items.map((n, i) => <In key={n} at={stagger(i, 0.25, 0.08)} x={300 + (i % 3) * 412} y={100 + Math.floor(i / 3) * 320}><Panel w={382} h={290} style={{padding: 28}}>
        <IconChip name={(['globe', 'crm', 'crm', 'app', 'name', 'cloud'] as Gl[])[i]} size={72} c={ITEM_C[i]} />
        <div style={{marginTop: 22}}><Tx size={24} color={NAVY} style={{whiteSpace: 'normal'}}>{n}</Tx></div>
        <div style={{position: 'absolute', left: 28, bottom: 26, opacity: ek(t, r(S.videos) + i * 0.06, 0.3), transform: `scale(${0.8 + 0.2 * ek(t, r(S.videos) + i * 0.06, 0.3)})`}}><Badge label={`▶ ${T.watch}`} c={ORANGE} size={17} /></div>
      </Panel></In>)}
    </Screen>
  </>;
};

// ---------- 13. help ----------
const Help: React.FC = () => {
  const S = SCENES.help, r = rel(S.start), T = TEXT.Help;
  return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26}}>
    <SpringIn at={0.05} level={L} from={{scale: 0.6, opacity: 0}}><IconChip name="mail" size={150} c={BLUE} round /></SpringIn>
    <SpringIn at={0.2} level={L} from={{y: 30, opacity: 0}}><Tx size={104} color="#fff">{T.headline}</Tx></SpringIn>
    <SpringIn at={r(S.reach)} level={L} from={{y: 24, opacity: 0}}><Tx size={46} g={[GOLD, ORANGE]}>{T.sub}</Tx></SpringIn>
    <SpringIn at={r(S.reach) + 0.4} level={L} from={{y: 20, opacity: 0}}><div style={{display: 'flex', gap: 22, marginTop: 14}}>
      {[T.email, T.site].map((s, i) => <div key={s} style={{padding: '16px 32px', borderRadius: 99, background: 'rgba(255,255,255,.12)', border: '2px solid rgba(255,255,255,.22)'}}><Tx size={32} color={i === 0 ? '#fff' : '#C9DAFF'}>{s}</Tx></div>)}
    </div></SpringIn>
  </AbsoluteFill>;
};

const PARTS: Record<Exclude<SceneKey, 'title'>, React.FC> = {signup: SignUp, dashboards: Dashboards, dashboard: Dashboard, clients: Clients, connections: Connections, ai: AIContent, plans: Plans, tiers: Tiers, billing: Billing, leads: Leads, bulk: Bulk, integrations: Integrations, help: Help};
const CAPTIONS: Record<Exclude<SceneKey, 'title' | 'help'>, {caption: string; badge: string}> = {signup: TEXT.SignUp, dashboards: TEXT.Dashboards, dashboard: TEXT.Dashboard, clients: TEXT.Clients, connections: TEXT.Connections, ai: TEXT.AI, plans: TEXT.Plans, tiers: TEXT.Tiers, billing: TEXT.Billing, leads: TEXT.Leads, bulk: TEXT.Bulk, integrations: TEXT.Integrations};
const CAP_C = [BLUE, DEEP, BLUE, ORANGE, GREEN, DEEP, ORANGE, GOLD, GREEN, DEEP, GREEN, ORANGE];

export const AgencyVideo: React.FC = () => {
  const {fps} = useVideoConfig();
  const t = useSec();
  const titleEnd = sceneEnd('title');
  return <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
    <Stage />
    <SceneSeq start={0} dur={titleEnd} first name="Title"><Backdrop /><TitleCard title={TEXT.Title.title} eyebrow={TEXT.Title.eyebrow} sub={TEXT.Title.sub} dur={titleEnd + VIDEO.xfade} /></SceneSeq>
    {ORDER.slice(1).map((k, i) => {
      const Part = PARTS[k as Exclude<SceneKey, 'title'>];
      const start = SCENES[k].start, dur = sceneEnd(k) - start;
      return <SceneSeq key={k} start={start} dur={dur} xfade={VIDEO.xfade} {...transitionFor(i + 1, L)} name={k}>
        <CameraRig level={L} dur={dur}><Part /></CameraRig>
      </SceneSeq>;
    })}
    {ORDER.slice(1, -1).map((k, i) => {
      const c = CAPTIONS[k as keyof typeof CAPTIONS];
      const start = SCENES[k].start, dur = sceneEnd(k) - start;
      const out = P(t, sceneEnd(k) - 0.1, 0.25);
      return <Sequence key={`cap-${k}`} from={Math.round(start * fps)} durationInFrames={Math.round(dur * fps)} name={`caption ${k}`}>
        <Caption text={c.caption} since={0.25} badge={c.badge} c={CAP_C[i]} k={1 - out} />
      </Sequence>;
    })}
    <SceneSeq start={END_START} dur={DURATION - END_START} last name="EndLogo"><EndLogo /></SceneSeq>
  </AbsoluteFill>;
};
