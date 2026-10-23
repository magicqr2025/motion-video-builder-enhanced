// Concept samples for the Agency panel tutorial.
// A "Live Agency OS": the full panel re-created in one big centred browser, guided by cursor + spotlight.
// B "Feature Spotlight": dark stage, bold feature headline on the left, a smaller live browser on the right.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Backdrop, Caption, IconChip, Gl, Glyph, Tx, useSec, P, eo} from '../../dns/ui';
import {BW, BH} from '../../dns2/mock';
import {CameraRig, CountUp, CursorPath, Notification, ProgressBar, SceneSeq, Spotlight, SpringIn, Toggle, stagger, transitionFor} from '../kit';
import {CONCEPTS, BROWSER_A, BROWSER_B, SIDEBAR_W, NAVY, DEEP, BLUE, GOLD, ORANGE, SLATE, GREEN, RED, LINE, MUTED} from './config';
import TEXT from './text.json';

type Kind = 'a' | 'b';
export const L = CONCEPTS.level;
export const ek = (t: number, at: number, d = 0.45) => eo(P(t, at, d));
export const typed = (s: string, t: number, at: number, rate = 0.07) => s.slice(0, Math.max(0, Math.floor((t - at) / rate)));
// demo numbers (not real account data)
export const DATA = {mrr: 22580, clients: 37, profiles: 37, subs: 13, arpu: 1737, overdue: 4998};

// content px inside a scaled browser -> composition px
export const toScreen = (b: {x: number; y: number; scale: number}) => (x: number, y: number, w = 0, h = 0) => ({x: b.x + x * b.scale, y: b.y + (58 + y) * b.scale, w: w * b.scale, h: h * b.scale});
export const SA = toScreen(BROWSER_A), SB = toScreen(BROWSER_B);

export const Abs: React.FC<{x: number; y: number; w?: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);
export const In: React.FC<{at: number; x: number; y: number; w?: number; h?: number; children?: React.ReactNode}> = ({at, x, y, w, h, children}) => (
  <Abs x={x} y={y} w={w} h={h}><SpringIn at={at} level={L} from={{y: 26, opacity: 0}}>{children}</SpringIn></Abs>
);
export const Panel: React.FC<{w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, children, style}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: 20, background: '#fff', border: `1px solid ${LINE}`, boxShadow: '0 4px 0 #E4EAF6, 0 14px 30px rgba(14,27,77,.07)', boxSizing: 'border-box', ...style}}>{children}</div>
);
export const Badge: React.FC<{label: string; c: string; size?: number}> = ({label, c, size = 18}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: `${c}1C`, border: `1.5px solid ${c}55`}}>
    <span style={{width: 9, height: 9, borderRadius: 9, background: c}} /><Tx size={size} color={c}>{label}</Tx>
  </div>
);
export const Btn: React.FC<{label: string; gold?: boolean; size?: number; hover?: number}> = ({label, gold, size = 20, hover = 0}) => (
  <div style={{display: 'inline-block', padding: `${size * 0.55}px ${size * 1.2}px`, borderRadius: 12, transform: `scale(${1 + 0.05 * hover})`, background: gold ? `linear-gradient(145deg,${GOLD},${ORANGE})` : `linear-gradient(145deg,${BLUE},${DEEP})`, boxShadow: `0 4px 0 ${gold ? '#C9780B' : '#0D3D99'}, 0 10px 18px rgba(14,27,77,.16)`}}>
    <Tx size={size} color={gold ? NAVY : '#fff'}>{label}</Tx>
  </div>
);

// App window: no URL, just the "Agency OS Panel" title (58 px bar, like the Browser mock)
export const PanelWindow: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{position: 'relative', width: BW, height: BH, borderRadius: 26, overflow: 'hidden', background: '#fff'}}>
    <div style={{height: 58, background: 'linear-gradient(180deg,#EEF2FA,#E6EBF6)', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 22px', position: 'relative'}}>
      <div style={{display: 'flex', gap: 9}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 10, display: 'flex', justifyContent: 'center'}}><div style={{height: 38, padding: '0 22px', borderRadius: 19, background: '#fff', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,.06)'}}>
        <svg width={18} height={22} viewBox="0 0 18 22"><path d="M11 0L1 13h7l-2 9 11-13h-7z" fill={GOLD} stroke={ORANGE} strokeWidth={1} /></svg><Tx size={19} color={NAVY}>{TEXT.Browser.title}</Tx>
      </div></div>
    </div>
    <div style={{position: 'absolute', top: 58, left: 0, right: 0, bottom: 0}}>{children}</div>
  </div>
);

// ---------- the agency panel shell (sidebar + top bar) ----------
export const NAV_ICON: Gl[] = ['app', 'login', 'globe', 'cname', 'ff', 'clock', 'copy', 'target', 'mail', 'dns'];
export const Shell: React.FC<{active: number; client?: number; children?: React.ReactNode}> = ({active, client = 0, children}) => (
  <div style={{position: 'absolute', inset: 0, background: '#F5F7FC'}}>
    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR_W, background: '#fff', borderRight: `1px solid ${LINE}`, padding: '22px 18px', boxSizing: 'border-box'}}>
      <Img src={staticFile('magicbolt-logo.png')} style={{height: 44, marginBottom: 20}} />
      <div style={{position: 'relative', display: 'flex', gap: 6, padding: 5, borderRadius: 14, background: '#EEF2FA', marginBottom: 18, isolation: 'isolate'}}>
        <div style={{position: 'relative', zIndex: 1, flex: 1, textAlign: 'center', padding: '8px 0'}}><Tx size={17} color={client > 0.5 ? SLATE : '#fff'}>{TEXT.Browser.agencyTab}</Tx></div>
        <div style={{position: 'relative', zIndex: 1, flex: 1, textAlign: 'center', padding: '8px 0'}}><Tx size={17} color={client > 0.5 ? '#fff' : SLATE}>{TEXT.Browser.clientTab}</Tx></div>
        <div style={{position: 'absolute', left: 5 + client * 117, top: 5, width: 112, height: 39, borderRadius: 10, background: `linear-gradient(145deg,${BLUE},${DEEP})`, zIndex: 0}} />
      </div>
      {TEXT.Nav.map((n, i) => (
        <div key={n} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px', marginBottom: 4, borderRadius: 12, background: i === active ? '#E6F0FF' : 'transparent', borderLeft: `4px solid ${i === active ? BLUE : 'transparent'}`}}>
          <div style={{width: 30, height: 30, borderRadius: 9, background: i === active ? `linear-gradient(145deg,${BLUE},${DEEP})` : '#E9EEF8', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Glyph name={NAV_ICON[i]} size={17} color={i === active ? '#fff' : MUTED} /></div>
          <Tx size={18} color={i === active ? DEEP : SLATE} w={i === active ? 700 : 400}>{n}</Tx>
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: SIDEBAR_W, right: 0, top: 0, height: 64, background: '#fff', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 30px', gap: 16}}>
      <div style={{padding: '8px 18px', borderRadius: 12, border: `1.5px solid ${LINE}`, display: 'flex', gap: 12, alignItems: 'center'}}><Glyph name="globe" size={20} color={BLUE} /><Tx size={18} color={NAVY}>{TEXT.Browser.business}</Tx><Tx size={16} color={MUTED} w={400}>▾</Tx></div>
      <div style={{flex: 1}} />
      <div style={{width: 40, height: 40, borderRadius: 20, background: `linear-gradient(145deg,${GOLD},${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={18} color={NAVY}>Y</Tx></div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}>{children}</div>
  </div>
);

export const Placed: React.FC<{b: {x: number; y: number; scale: number}; children?: React.ReactNode}> = ({b, children}) => {
  const t = useSec();
  const k = ek(t, 0, 0.6);
  return <div style={{position: 'absolute', left: b.x, top: b.y, transformOrigin: 'top left', transform: `scale(${b.scale}) translateY(${(1 - k) * 30}px)`, opacity: k, borderRadius: 26, boxShadow: '0 12px 0 rgba(206,216,239,.9), 0 40px 90px rgba(14,27,77,.28)'}}>
    <PanelWindow>{children}</PanelWindow>
  </div>;
};

// ---------- A1: agency dashboard ----------
const STAT_C = [GREEN, BLUE, ORANGE, DEEP];
const STAT_G: Gl[] = ['ff', 'login', 'globe', 'check'];
const ADashboard: React.FC = () => {
  const t = useSec();
  const vals = [DATA.mrr, DATA.clients, DATA.profiles, DATA.subs];
  const stat = SA(300, 262, 1206, 170);
  const card = SA(607 + 142, 262 + 92);
  return <>
    <Placed b={BROWSER_A}><Shell active={0}>
      <In at={0.2} x={300} y={88}><div style={{width: 1206, height: 150, borderRadius: 22, background: `linear-gradient(120deg,${NAVY},${DEEP} 55%,${BLUE})`, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 24px rgba(19,84,188,.25)'}}>
        <div style={{position: 'absolute', right: -60, top: -80, width: 300, height: 300, borderRadius: 300, background: 'radial-gradient(closest-side,#FDC60B55,#FDC60B00)'}} />
        <Abs x={40} y={34}><Tx size={40} color="#fff">{TEXT.Dashboard.welcome}</Tx><div style={{marginTop: 6}}><Tx size={20} color="#C9DAFF" w={400}>{TEXT.Dashboard.welcomeSub}</Tx></div></Abs>
        <Abs x={830} y={46}><div style={{display: 'flex', gap: 16}}><Btn label={TEXT.Dashboard.addClient} gold /><Btn label={TEXT.Dashboard.addBusiness} /></div></Abs>
      </div></In>
      {TEXT.Dashboard.stats.map((s, i) => <In key={i} at={stagger(i, 0.45, 0.12)} x={300 + i * 307} y={262}><Panel w={285} h={170}>
        <Abs x={22} y={20}><IconChip name={STAT_G[i]} size={46} c={STAT_C[i]} /></Abs>
        <Abs x={22} y={78}><Tx size={16} color={SLATE} w={400}>{s.label}</Tx></Abs>
        <Abs x={22} y={100}><CountUp to={vals[i]} at={0.6 + i * 0.12} dur={1.1} prefix={s.prefix} style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 38, color: NAVY}} /></Abs>
        <Abs x={22} y={146}><Tx size={14} color={MUTED} w={400}>{s.foot}</Tx></Abs>
      </Panel></In>)}
      {[TEXT.Dashboard.recentClients, TEXT.Dashboard.recentBusinesses].map((title, c) => <In key={c} at={0.9 + c * 0.15} x={300 + c * 614} y={456}><Panel w={592} h={330}>
        <Abs x={26} y={22}><Tx size={22} color={NAVY}>{title}</Tx></Abs>
        {(c === 0 ? TEXT.Dashboard.clients : TEXT.Dashboard.businesses).map((n, i) => <Abs key={n} x={26} y={78 + i * 80} w={540}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: ek(t, 1.1 + i * 0.1 + c * 0.1)}}>
            <div style={{width: 46, height: 46, borderRadius: 14, background: `linear-gradient(145deg,${[BLUE, ORANGE, GREEN][i]},${DEEP})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={20} color="#fff">{n[0]}</Tx></div>
            <Tx size={19} color={NAVY}>{n}</Tx><div style={{flex: 1}} />
            {c === 0 ? <Btn label={TEXT.Dashboard.login} size={16} /> : <Badge label={TEXT.Dashboard.active} c={GREEN} size={15} />}
          </div>
        </Abs>)}
      </Panel></In>)}
    </Shell></Placed>
    <Spotlight level={L} keys={[{t: 1.5, ...stat}]} />
    <CursorPath keys={[{t: 0, x: 1500, y: 860}, {t: 1.3, x: card.x, y: card.y}, {t: 1.6, x: card.x, y: card.y, click: true}, {t: 3.4, x: card.x + 20, y: card.y + 14}]} />
    <Caption text={TEXT.Dashboard.caption} since={0.3} badge={TEXT.Dashboard.badge} c={BLUE} />
  </>;
};

// ---------- A2: billing ----------
export const STATUS_C: Record<string, string> = {Paid: GREEN, Partial: ORANGE, Overdue: RED};
const ABilling: React.FC = () => {
  const t = useSec();
  const vals = [DATA.mrr, DATA.arpu, DATA.subs, DATA.overdue];
  const col = SA(1236, 470, 250, 300);
  const over = SA(1400, 470 + 2 * 72 + 34);
  return <>
    <Placed b={BROWSER_A}><Shell active={6}>
      <In at={0.15} x={300} y={84}><Tx size={36} color={NAVY}>{TEXT.Billing.title}</Tx><div><Tx size={19} color={SLATE} w={400}>{TEXT.Billing.sub}</Tx></div></In>
      {TEXT.Billing.metrics.map((m, i) => <In key={i} at={stagger(i, 0.3, 0.1)} x={300 + i * 307} y={180}><Panel w={285} h={150} style={i === 0 ? {background: `linear-gradient(145deg,${DEEP},${BLUE})`, border: 'none'} : undefined}>
        <Abs x={24} y={22}><Tx size={18} color={i === 0 ? '#D6E5FF' : SLATE} w={400}>{m.label}</Tx></Abs>
        <Abs x={24} y={56}><CountUp to={vals[i]} at={0.5 + i * 0.1} dur={1.2} prefix={m.prefix} style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 44, color: i === 0 ? '#fff' : i === 3 ? RED : NAVY}} /></Abs>
        <Abs x={24} y={118} w={237}><div style={{height: 6, borderRadius: 6, background: i === 0 ? 'rgba(255,255,255,.25)' : '#EEF2FA', overflow: 'hidden'}}><div style={{height: '100%', width: `${ek(t, 0.7 + i * 0.1, 1) * [82, 64, 72, 30][i]}%`, background: i === 0 ? GOLD : [GREEN, BLUE, BLUE, RED][i]}} /></div></Abs>
      </Panel></In>)}
      <In at={0.7} x={300} y={360}><Panel w={1206} h={420}>
        <Abs x={30} y={22}><Tx size={24} color={NAVY}>{TEXT.Billing.invoicesTitle}</Tx></Abs>
        {TEXT.Billing.columns.map((c, i) => <Abs key={c} x={[30, 280, 700, 936][i]} y={76}><Tx size={16} color={MUTED}>{c}</Tx></Abs>)}
        <Abs x={20} y={104} w={1166} h={1}><div style={{height: 1, background: LINE}} /></Abs>
        {TEXT.Billing.invoices.map((r, i) => {
          const k = ek(t, 0.95 + i * 0.12, 0.4);
          return <Abs key={r.id} x={30} y={118 + i * 72} w={1146}><div style={{display: 'flex', alignItems: 'center', height: 60, opacity: k, transform: `translateX(${(1 - k) * 30}px)`}}>
            <div style={{width: 250}}><Tx size={19} color={DEEP}>{r.id}</Tx></div>
            <div style={{width: 420}}><Tx size={19} color={NAVY} w={400}>{r.client}</Tx></div>
            <div style={{width: 236}}><Tx size={19} color={NAVY}>{r.amount}</Tx></div>
            <Badge label={r.status} c={STATUS_C[r.status] ?? BLUE} />
          </div></Abs>;
        })}
      </Panel></In>
    </Shell></Placed>
    <Spotlight level={L} keys={[{t: 1.5, ...col}]} />
    <CursorPath keys={[{t: 0, x: 900, y: 860}, {t: 1.5, x: over.x, y: over.y}, {t: 1.8, x: over.x, y: over.y, click: true}, {t: 3.4, x: over.x + 16, y: over.y + 10}]} />
    <Caption text={TEXT.Billing.caption} since={0.3} badge={TEXT.Billing.badge} c={GREEN} />
  </>;
};

// ---------- B: left feature column on the dark stage ----------
export const Feature: React.FC<{eyebrow: string; icon: Gl; headline: string; sub: string; points: string[]; icons: Gl[]; cues?: number[]}> = ({eyebrow, icon, headline, sub, points, icons, cues}) => (
  <Abs x={110} y={190} w={590}>
    <SpringIn at={0.1} level={L} from={{y: 20, opacity: 0}}><div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '8px 22px 8px 8px', borderRadius: 99, background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.18)'}}><IconChip name={icon} size={50} c={BLUE} round /><Tx size={24} color={GOLD}>{eyebrow}</Tx></div></SpringIn>
    <SpringIn at={0.25} level={L} from={{y: 30, opacity: 0}}><div style={{marginTop: 28}}><Tx size={headline.length > 18 ? 64 : 76} color="#fff" style={{whiteSpace: 'normal', lineHeight: 1.05}}>{headline}</Tx></div></SpringIn>
    <SpringIn at={0.4} level={L} from={{y: 20, opacity: 0}}><div style={{marginTop: 18}}><Tx size={28} color="#B9CCF5" w={400} style={{whiteSpace: 'normal'}}>{sub}</Tx></div></SpringIn>
    <div style={{marginTop: 44, width: 600, display: 'flex', flexDirection: 'column', gap: 22}}>
      {points.map((p, i) => <SpringIn key={p} at={cues?.[i] ?? stagger(i, 0.7, 0.18)} level={L} from={{x: -30, opacity: 0}}><div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <IconChip name={icons[i]} size={56} c={[GOLD, ORANGE, BLUE][i]} /><Tx size={27} color="#fff" style={{whiteSpace: 'normal'}}>{p}</Tx>
      </div></SpringIn>)}
    </div>
  </Abs>
);

export const Field: React.FC<{label: string; value: string; w: number; at: number; active?: boolean}> = ({label, value, w, at, active}) => {
  const t = useSec();
  const v = typed(value, t, at);
  return <div style={{width: w}}>
    <div style={{marginBottom: 8}}><Tx size={18} color={SLATE}>{label}</Tx></div>
    <div style={{height: 60, borderRadius: 13, background: '#fff', border: `2px solid ${active ? BLUE : LINE}`, boxShadow: active ? `0 0 0 5px ${BLUE}22` : undefined, display: 'flex', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box'}}>
      <Tx size={24} color={NAVY}>{v}</Tx>{active && v.length < value.length && <span style={{marginLeft: 3, width: 2, height: 26, background: BLUE}} />}
    </div>
  </div>;
};

// ---------- B1: subscription plan builder ----------
const BPlans: React.FC = () => {
  const t = useSec();
  const open = ek(t, 0.9, 0.3);
  const pick = SB(300 + 140, 250 + 92 + 56 + 28);
  const tog = SB(1370, 290);
  const lim = SB(890, 410, 606, 230);
  const chosen = t > 1.45 ? 1 : 0;
  return <>
    <Feature eyebrow={TEXT.Plans.eyebrow} icon="clock" headline={TEXT.Plans.headline} sub={TEXT.Plans.sub} points={TEXT.Plans.points} icons={['name', 'clock', 'target']} />
    <Placed b={BROWSER_B}><Shell active={5}>
      <In at={0.3} x={300} y={92}><Tx size={34} color={NAVY}>{TEXT.Plans.formTitle}</Tx></In>
      <In at={0.4} x={300} y={150}><Field label={TEXT.Plans.nameLabel} value={TEXT.Plans.name} w={560} at={0.5} active /></In>
      <In at={0.5} x={890} y={150}><Field label={TEXT.Plans.priceLabel} value={`₹ ${TEXT.Plans.price}`} w={290} at={0.8} /></In>
      <In at={0.6} x={1206} y={150}><Field label={TEXT.Plans.currencyLabel} value={TEXT.Plans.currency} w={290} at={0.9} /></In>
      <In at={0.7} x={300} y={250}><Field label={TEXT.Plans.intervalLabel} value={`${TEXT.Plans.intervals[chosen]}  ▾`} w={560} at={0} /></In>
      <In at={0.8} x={890} y={262}><Panel w={606} h={84} style={{display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between'}}><Tx size={22} color={NAVY}>{TEXT.Plans.trialLabel}</Tx><Toggle at={2.0} w={100} /></Panel></In>
      <In at={0.9} x={890} y={410}><Panel w={606} h={230} style={{padding: 26}}>
        <Tx size={22} color={NAVY}>{TEXT.Plans.limitsTitle}</Tx>
        {TEXT.Plans.limits.map((l, i) => <div key={l} style={{marginTop: 22}}><div style={{marginBottom: 8}}><Tx size={18} color={SLATE} w={400}>{l}</Tx></div><ProgressBar at={1.2 + i * 0.25} dur={1} to={[0.55, 0.8][i]} w={550} h={18} /></div>)}
      </Panel></In>
      <In at={1.0} x={300} y={690}><Btn label={TEXT.Plans.save} gold size={24} /></In>
      {open > 0 && <Abs x={300} y={342} w={560}><div style={{opacity: open, transform: `translateY(${(1 - open) * -12}px)`, background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`, boxShadow: '0 20px 40px rgba(14,27,77,.18)', padding: 6}}>
        {TEXT.Plans.intervals.map((n, i) => <div key={n} style={{height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: 10, background: i === 1 && t > 1.2 ? '#E6F0FF' : 'transparent'}}><Tx size={22} color={i === chosen ? DEEP : NAVY} w={i === chosen ? 700 : 400}>{(i === chosen ? '✓ ' : '') + n}</Tx></div>)}
      </div></Abs>}
    </Shell></Placed>
    <Spotlight level={L} keys={[{t: 2.35, ...lim}]} />
    <CursorPath keys={[{t: 0, x: 1700, y: 900}, {t: 1.15, x: pick.x, y: pick.y}, {t: 1.4, x: pick.x, y: pick.y, click: true}, {t: 1.8, x: tog.x, y: tog.y}, {t: 2.0, x: tog.x, y: tog.y, click: true}, {t: 3.4, x: tog.x + 30, y: tog.y + 60}]} />
    <Caption text={TEXT.Plans.caption} since={0.3} badge={TEXT.Plans.badge} c={ORANGE} />
  </>;
};

// ---------- B2: lead center ----------
const BLeads: React.FC = () => {
  const t = useSec();
  const call = SB(1330 + 60, 190 + 50);
  const callCol = SB(1300, 180, 200, 470);
  return <>
    <Feature eyebrow={TEXT.Leads.eyebrow} icon="target" headline={TEXT.Leads.headline} sub={TEXT.Leads.sub} points={TEXT.Leads.points} icons={['name', 'globe', 'crm']} />
    <Placed b={BROWSER_B}><Shell active={7}>
      <In at={0.3} x={300} y={86}><Field label={TEXT.Leads.categoryLabel} value={TEXT.Leads.category} w={420} at={0.4} active /></In>
      <In at={0.4} x={740} y={86}><Field label={TEXT.Leads.locationLabel} value={TEXT.Leads.location} w={480} at={0.7} /></In>
      <In at={0.5} x={1250} y={116}><Btn label={TEXT.Leads.search} size={22} /></In>
      {TEXT.Leads.results.map((n, i) => {
        const k = ek(t, 1.3 + i * 0.12, 0.4);
        return <Abs key={n} x={300} y={196 + i * 124} w={1206}><div style={{opacity: k, transform: `translateY(${(1 - k) * 24}px)`}}><Panel w={1206} h={108} style={{display: 'flex', alignItems: 'center', padding: '0 26px', gap: 22}}>
          <IconChip name="globe" size={56} c={[BLUE, ORANGE, GREEN, DEEP][i]} />
          <div style={{width: 520}}><Tx size={23} color={NAVY}>{n}</Tx><div><Tx size={17} color={SLATE} w={400}>{TEXT.Leads.category} · {TEXT.Leads.areas[i]}</Tx></div></div>
          <Tx size={20} color={GOLD}>★★★★★</Tx><Tx size={19} color={NAVY}>{['4.8', '4.6', '4.7', '4.5'][i]}</Tx>
          <div style={{flex: 1}} />
          <Btn label={`✆ ${TEXT.Leads.call}`} gold size={20} hover={i === 0 ? ek(t, 2.3, 0.2) : 0} />
        </Panel></div></Abs>;
      })}
    </Shell></Placed>
    <Spotlight level={L} keys={[{t: 2.0, ...callCol}]} />
    <Abs x={1360} y={60} w={520} h={140}><Notification at={1.6} title={TEXT.Leads.notify} sub={TEXT.Leads.notifySub} icon={<IconChip name="check" size={44} c={GREEN} round />} /></Abs>
    <CursorPath keys={[{t: 0, x: 1100, y: 900}, {t: 2.1, x: call.x, y: call.y}, {t: 2.35, x: call.x, y: call.y, click: true}, {t: 3.4, x: call.x + 18, y: call.y + 12}]} />
    <Caption text={TEXT.Leads.caption} since={0.3} badge={TEXT.Leads.badge} c={DEEP} />
  </>;
};

// ---------- dark stage for concept B ----------
export const Stage: React.FC = () => {
  const t = useSec();
  return <AbsoluteFill style={{background: `radial-gradient(ellipse at 30% 10%,#1E3F8F,${NAVY} 55%,#081238)`}}>
    {[[320, 300, 820, BLUE], [1650, 850, 700, ORANGE], [1500, 160, 520, GOLD]].map(([x, y, s, c], i) => (
      <div key={i} style={{position: 'absolute', left: (x as number) - (s as number) / 2 + 50 * Math.sin(t * 0.3 + i * 2), top: (y as number) - (s as number) / 2 + 30 * Math.cos(t * 0.25 + i), width: s as number, height: s as number, borderRadius: '50%', background: `radial-gradient(closest-side,${c}30,${c}00)`}} />
    ))}
    <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.09) 1.5px,transparent 2px)', backgroundSize: '40px 40px', backgroundPosition: `${(t * 6) % 40}px 0`, opacity: 0.5}} />
  </AbsoluteFill>;
};

const MOMENTS: Record<Kind, React.FC[]> = {a: [ADashboard, ABilling], b: [BPlans, BLeads]};

export const AgencyConcepts: React.FC<{concept?: Kind}> = ({concept = 'a'}) => {
  const kind: Kind = concept === 'b' ? 'b' : 'a';
  return <AbsoluteFill style={{overflow: 'hidden', background: '#F5F8FF'}}>
    {kind === 'a' ? <Backdrop /> : <Stage />}
    {MOMENTS[kind].map((Moment, i) => <SceneSeq key={i} start={i * CONCEPTS.moment} dur={CONCEPTS.moment} first={i === 0} last={i === CONCEPTS.moments - 1} {...transitionFor(i, L)}>
      <CameraRig level={L} dur={CONCEPTS.moment}><Moment /></CameraRig>
    </SceneSeq>)}
  </AbsoluteFill>;
};

