// White Label Setup tutorial: Branding → Domain Connect → DNS Setup.
// Fully animated re-creation of the MagicBolt and Cloudflare screens. Every cue is placed
// relative to the voiceover sentences (VO in ./config), so a new recording only needs new VO times.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Chip} from '../glow/parts';
import {TitleCard, EndLogo, END_LOGO} from '../tutorial/brand';
import {useSec, P, eo, eb, lerp, Tx, Pop, Words, Backdrop, Card, IconChip, Glyph, Caption, Toast, Spark, REC_GLYPH, Gl} from '../dns/ui';
import {VIDEO, VO, VO_END, RECORDS, TARGETS, DOMAIN, END_TEXT, TITLE, D, RecKey} from './config';
import {Browser, MBDash, CFPage, CFModal, Cursor, CursorKey, FlyChip, BASE_ROWS, CFRow} from './mock';
import {WhitelabelMain, ClientLogin, WLState, DomState, WL, WL_POS, BRAND_FIELDS} from './whitelabel';

const S = (n: number) => VO[n - 1]; // start of sentence n (1-based)
const E = (n: number) => (n < VO.length ? VO[n] : VO_END);
const sp = (n: number) => E(n) - S(n);
const F = (n: number, x: number) => S(n) + x * sp(n); // a point x (0–1) through sentence n

export const DNS2_END_LOGO_AT = VO_END + 0.6;
export const DNS2_DURATION = DNS2_END_LOGO_AT + END_LOGO.dur;

// ---------- window placement (mock screens are designed at 1536x864) ----------
const WS = 1.06;
const WIN = {x: (1920 - 1536 * WS) / 2, y: 20};
type XY = readonly [number, number];
const POS = {
  navWhitelabel: [113, 686] as XY, rest: [900, 500] as XY,
  cfDns: [52, 268] as XY, cfRecords: [92, 317] as XY, cfAdd: [1416, 232] as XY,
  type: [403, 352] as XY, cname: [403, 502] as XY, name: [868, 352] as XY, target: [598, 472] as XY, proxy: [905, 466] as XY, save: [410, 554] as XY,
};
const SCROLL = WL.scrollToDomains;
const at = (t: number, p: XY, click = false): CursorKey => [t, p[0], p[1], click];

// ---------- part 1 & 2 cues ----------
const C = {
  wlClick: F(2, 0.62),
  brand: [F(3, 0.05), F(3, 0.95)] as const,
  saveChanges: F(4, 0.5),
  scroll: [F(5, 0.15), F(5, 0.15) + 1.6] as const,
  domType: (i: number) => [F(6, 0.06 + i * 0.23), F(6, 0.06 + i * 0.23) + 0.15 * sp(6)] as const,
  saveDomains: F(7, 0.62),
  cf: F(8, 0.25),
};

// ---------- part 3: one slow pass + three quick ones ----------
type Pass = {rec: number; cname: number; name: number; target: number; dns: number; save: number; done: number; typeOpen: number; addClick: number; nameFly: [number, number]; targetFly: [number, number]};
const slow: Pass = {
  rec: 0, addClick: F(9, 0.42), typeOpen: F(9, 0.62), cname: F(9, 0.8),
  name: F(10, 0.3), nameFly: [F(10, 0.45), F(10, 0.7)],
  target: F(11, 0.2), targetFly: [F(11, 0.4), F(11, 0.75)],
  dns: F(12, 0.35), save: F(13, 0.1), done: F(13, 0.3),
};
const quick = (rec: number, n: number): Pass => {
  const a = S(n), d = sp(n);
  return {rec, addClick: a + 0.06 * d, typeOpen: a + 0.13 * d, cname: a + 0.19 * d, name: a + 0.24 * d, nameFly: [a + 0.24 * d, a + 0.36 * d], target: a + 0.4 * d, targetFly: [a + 0.4 * d, a + 0.54 * d], dns: a + 0.64 * d, save: a + 0.77 * d, done: a + 0.84 * d};
};
const PASSES: Pass[] = [slow, quick(1, 15), quick(2, 16), quick(3, 17)];
const passAt = (t: number) => { let p = t >= C.cf ? 0 : -1; PASSES.forEach((x, i) => { if (i > 0 && t >= x.addClick - 0.6) p = i; }); return p; };

// ---------- which screen the browser shows ----------
type Screen = 'mbHome' | 'wl' | 'cf' | 'login';
const SCREENS: [number, Screen][] = [
  [S(2), 'mbHome'], [C.wlClick + 0.3, 'wl'], [C.cf, 'cf'],
  [S(10), 'wl'], [slow.nameFly[0] - 0.1, 'cf'],
  [S(11), 'wl'], [slow.targetFly[0] - 0.1, 'cf'],
  [S(19), 'wl'], [F(19, 0.45), 'login'],
];
const screenAt = (t: number) => {
  let i = 0;
  SCREENS.forEach(([s], j) => { if (t >= s) i = j; });
  return {cur: SCREENS[i][1], prev: i > 0 ? SCREENS[i - 1][1] : SCREENS[i][1], since: SCREENS[i][0]};
};
const URL: Record<Screen, [string, string, 'mb' | 'cf']> = {
  mbHome: ['magicbolt.ai/agency', 'MagicBolt Agency', 'mb'],
  wl: ['magicbolt.ai/agency/whitelabel', 'Whitelabel · MagicBolt', 'mb'],
  cf: [`dash.cloudflare.com / ${DOMAIN} / dns / records`, 'DNS · Cloudflare', 'cf'],
  login: [`customer.${DOMAIN}`, 'Your Brand Agency', 'mb'],
};

// ---------- cursor path ----------
const CURSOR: CursorKey[] = [
  at(F(2, 0.2), [800, 450]), at(C.wlClick, POS.navWhitelabel, true),
  at(F(3, 0.15), [760, 330]), at(F(4, 0.1), [780, 360]), at(C.saveChanges, WL_POS.saveChanges, true),
  at(F(5, 0.7), POS.rest),
  ...RECORDS.map((_, i) => at(C.domType(i)[0], WL_POS.input(i, SCROLL), true)),
  at(C.saveDomains, WL_POS.saveDomains(SCROLL), true),
  at(F(9, 0.06), POS.cfDns, true), at(F(9, 0.2), POS.cfRecords, true), at(slow.addClick, POS.cfAdd, true),
  at(slow.typeOpen, POS.type, true), at(slow.cname, POS.cname, true),
  at(slow.name, WL_POS.copyName(0, SCROLL), true), at(slow.nameFly[1] + 0.2, POS.name),
  at(slow.target, WL_POS.copyTarget(0, SCROLL), true), at(slow.targetFly[1] + 0.2, POS.target),
  at(slow.dns, POS.proxy, true), at(slow.save, POS.save, true), at(slow.done + 0.8, [1000, 600]),
  ...PASSES.slice(1).flatMap((p) => [at(p.addClick, POS.cfAdd, true), at(p.cname, POS.cname, true), at(p.nameFly[1], POS.name), at(p.targetFly[1], POS.target), at(p.dns, POS.proxy, true), at(p.save, POS.save, true), at(p.done + 0.5, [1100, 640])]),
];

// ---------- captions [time, text, badge, color] ----------
const CAPS: [number, string, string, string][] = [
  [S(2), 'Dashboard → open Whitelabel', 'Start', D.deep],
  [S(3), 'Fill in your branding details', 'Branding', D.blue],
  [S(4), 'Click Save changes', 'Branding', D.blue],
  [S(5), 'Custom domain: choose a subdomain for each app', 'Domain', D.violet],
  [S(6), 'customer · qr · business · crm: one subdomain each', 'Domain', D.violet],
  [S(7), 'DNS records appear → click Save domains', 'Domain', D.violet],
  [S(8), 'Open your DNS provider (we use Cloudflare)', 'DNS 1/4', D.orange],
  [S(9), 'DNS → Records → Add record → Type: CNAME', 'DNS 1/4', D.orange],
  [S(10), 'Copy the Name “customer” → paste it in Name', 'DNS 1/4', D.orange],
  [S(11), 'Copy the Target → paste it in Target', 'DNS 1/4', D.orange],
  [S(12), 'Turn Proxy OFF → grey cloud, “DNS only”', 'DNS 1/4', D.orange],
  [S(13), 'Click Save: customer record added', 'DNS 1/4', D.orange],
  [S(14), 'Same steps for qr, business and crm', 'DNS', D.orange],
  [S(15), 'qr: CNAME, name, target, proxy off, save', 'DNS 2/4', D.orange],
  [S(16), 'business: same steps', 'DNS 3/4', D.orange],
  [S(17), 'crm: same steps', 'DNS 4/4', D.orange],
  [S(18), 'DNS can take 2–8 hours to reflect', 'Done', D.green],
  [S(19), 'Share your subdomains · clients log in with ID & password', 'Live', D.green],
];

// ---------- opening: title, then the three parts (sentence 1) ----------
const PARTS: [Gl, string, string, string][] = [['app', 'Branding', 'Your brand details', D.blue], ['globe', 'Domain Connect', 'A subdomain per app', D.violet], ['dns', 'DNS Setup', 'CNAME records', D.orange]];
const titleDur = () => Math.max(4.6, sp(1) * 0.58);
const Parts: React.FC = () => {
  const t = useSec();
  const len = S(2) - titleDur();
  const out = P(t, len - 0.45, 0.45);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center'}}>
        <Words t={t} at={0.05} text="Three parts" size={72} g={[D.navy, D.deep]} hi={{0: [D.blue, D.deep]}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
        {PARTS.map(([ic, title, sub, c], i) => {
          const k = P(t, 0.3 + i * 0.35, 0.5);
          return (
            <React.Fragment key={title}>
              {i > 0 && <div style={{opacity: P(t, 0.2 + i * 0.35, 0.3)}}><Tx size={52} color="#AAB6D3">→</Tx></div>}
              <div style={{opacity: Math.min(1, k * 2), transform: `translateY(${(1 - eo(k)) * 60}px) scale(${lerp(0.7, 1, eb(k, 2))})`}}>
                <Card w={400} h={300} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
                  <div style={{position: 'absolute', left: 22, top: 18}}><Tx size={22} color={c}>0{i + 1}</Tx></div>
                  <div style={{transform: `translateY(${Math.sin(t * 2 + i) * 5}px)`}}><IconChip name={ic} size={110} c={c} /></div>
                  <Tx size={36}>{title}</Tx>
                  <Tx size={22} w={400} color={D.slate}>{sub}</Tx>
                </Card>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- whitelabel page state at t ----------
const typed = (txt: string, t: number, a: number, b: number) => txt.slice(0, Math.round(txt.length * P(t, a, Math.max(0.01, b - a))));
const wlState = (t: number): WLState => {
  const [b0, b1] = C.brand;
  const seg = (b1 - b0) / BRAND_FIELDS.length;
  let focusField = -1;
  const typedF = BRAND_FIELDS.map(([, v], i) => {
    const a = b0 + i * seg;
    if (t >= a && t < a + seg && t < b1) focusField = i;
    return typed(v, t, a, a + seg * 0.8);
  });
  const scroll = SCROLL * eo(P(t, C.scroll[0], C.scroll[1] - C.scroll[0]));
  const doms: DomState[] = RECORDS.map((r, i) => {
    const [a, b] = C.domType(i);
    const reveal = P(t, b + 0.1, 0.4);
    const connected = t >= S(19) + 0.3 + i * 0.35;
    let hl: DomState['hl'] = null, copied = 0;
    if (i === 0 && t >= S(10) && t < S(11)) { hl = 'name'; copied = P(t, slow.name, 0.35); }
    if (i === 0 && t >= S(11) && t < S(12)) { hl = 'target'; copied = P(t, slow.target, 0.35); }
    return {typed: typed(`${r.key}.${DOMAIN}`, t, a, b), reveal, hl, copied, status: connected ? 'connected' : reveal > 0.5 ? 'pending' : 'notset', focus: t >= a && t < b + 0.2};
  });
  return {
    scroll, typed: typedF, focusField,
    saved: P(t, C.saveChanges + 0.2, 0.3), saveChangesHover: Math.sin(Math.PI * P(t, C.saveChanges, 0.45)),
    doms, saveDomainsHover: Math.sin(Math.PI * P(t, C.saveDomains, 0.45)), domainsSaved: P(t, C.saveDomains + 0.2, 0.3),
  };
};

// ---------- browser content at t ----------
const Screen: React.FC<{which: Screen; t: number}> = ({which, t}) => {
  if (which === 'mbHome') return <MBDash page="home" navHover={P(t, C.wlClick - 0.4, 0.3)} />;
  if (which === 'wl') return <MBDash page="whitelabel" main={<WhitelabelMain s={wlState(t)} />} />;
  if (which === 'login') return <ClientLogin k={P(t, F(19, 0.45) + 0.1, 0.5)} />;
  const rows: CFRow[] = [...BASE_ROWS];
  PASSES.forEach((p) => {
    if (t >= p.done) rows.push({type: 'CNAME', name: RECORDS[p.rec].key, content: TARGETS[RECORDS[p.rec].key], proxy: 'dns', k: P(t, p.done, 0.5), tick: P(t, p.done + 0.4, 0.4)});
  });
  const pi = passAt(t);
  const p = pi >= 0 ? PASSES[pi] : null;
  const key: RecKey = p ? RECORDS[p.rec].key : 'customer';
  const mk = p ? P(t, p.addClick + 0.15, 0.35) * (1 - P(t, p.save + 0.25, 0.3)) : 0;
  return (
    <>
      <CFPage rows={rows} navOn={t >= F(9, 0.2) ? 2 : t >= F(9, 0.06) ? 1 : 0} addHover={p ? Math.sin(Math.PI * P(t, p.addClick, 0.4)) : 0} />
      {p && mk > 0 && (
        <CFModal k={mk} type={t >= p.cname ? 'CNAME' : 'A'} typeOpen={t >= p.typeOpen && t < p.cname + 0.2 ? P(t, p.typeOpen, 0.2) : 0}
          name={t >= p.nameFly[1] ? key : ''} target={t >= p.targetFly[1] ? TARGETS[key] : ''} proxyOff={P(t, p.dns + 0.1, 0.4)}
          focus={t >= p.save - 0.2 ? 'save' : t >= p.dns - 0.4 ? 'proxy' : t >= p.targetFly[0] ? 'target' : t >= p.nameFly[0] ? 'name' : null}
          saveHover={Math.sin(Math.PI * P(t, p.save, 0.4))} />
      )}
    </>
  );
};

// ---------- the browser stage (sentences 2–19) ----------
const Stage: React.FC = () => {
  const t = useSec() + S(2);
  const kin = eo(P(t, S(2), 0.7));
  const kout = P(t, S(20) - 0.5, 0.5);
  const sc = screenAt(t);
  const fade = P(t, sc.since, 0.3);
  const z = eo(P(t, F(12, 0.05), 0.8)) * (1 - eo(P(t, S(13) - 0.3, 0.6)));
  const zoom = 1 + 0.7 * z;
  let cap = CAPS[0];
  CAPS.forEach((c) => { if (t >= c[0]) cap = c; });
  const doneP = PASSES.find((x) => t >= x.done && t < x.done + 2.4);
  const kToast = doneP ? P(t, doneP.done, 0.4) * (1 - P(t, doneP.done + 2.0, 0.35)) : 0;
  const repK = P(t, S(14) + 0.1, 0.4) * (1 - P(t, S(15) - 0.35, 0.35));
  const waitK = P(t, F(18, 0.2), 0.5) * (1 - P(t, S(19) - 0.35, 0.35));
  const liveK = P(t, F(19, 0.55), 0.5);
  const flying = [slow.nameFly, slow.targetFly, ...PASSES.slice(1).flatMap((x) => [x.nameFly, x.targetFly])];
  const flyIdx = flying.findIndex(([a, b]) => t > a && t < b);
  const flyRec = flyIdx < 0 ? null : RECORDS[flyIdx < 2 ? 0 : Math.floor((flyIdx - 2) / 2) + 1].key;
  const flyIsName = flyIdx % 2 === 0;
  const slowFly = flyIdx >= 0 && flyIdx < 2;

  return (
    <AbsoluteFill style={{opacity: 1 - kout}}>
      <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: 1536, height: 864, transformOrigin: '0 0', transform: `translateY(${(1 - kin) * 80}px) scale(${WS * lerp(0.9, 1, kin) * (1 - 0.04 * kout)})`, opacity: Math.min(1, kin * 1.5)}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 26, outline: '6px solid #fff', boxShadow: '0 10px 0 #CBD6F0, 0 40px 80px rgba(19,40,120,0.28)', overflow: 'hidden', background: '#fff'}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${POS.proxy[0] - 220}px ${POS.proxy[1]}px`}}>
            {[sc.prev, sc.cur].map((w, i) => (i === 0 && (fade >= 1 || sc.prev === sc.cur) ? null : (
              <div key={i + w} style={{position: 'absolute', inset: 0, opacity: i === 0 ? 1 : fade}}>
                <Browser url={URL[w][0]} tab={URL[w][1]} tabIcon={URL[w][2]}><Screen which={w} t={t} /></Browser>
              </div>
            )))}
            {flyRec && (
              <FlyChip text={flyIsName ? flyRec : TARGETS[flyRec]} p={P(t, flying[flyIdx][0], flying[flyIdx][1] - flying[flyIdx][0])}
                from={slowFly ? [...(flyIsName ? WL_POS.copyName(0, SCROLL) : WL_POS.copyTarget(0, SCROLL))] as [number, number] : [-120, 240]}
                to={flyIsName ? [POS.name[0], POS.name[1]] : [POS.target[0], POS.target[1]]} />
            )}
            <Cursor t={t} keys={CURSOR} />
          </div>
          {kToast > 0 && doneP && (
            <div style={{position: 'absolute', left: '50%', top: 96, transform: `translate(-50%, ${(1 - eo(kToast)) * -40}px) scale(${lerp(0.6, 1, eb(Math.min(1, kToast), 2))})`, opacity: Math.min(1, kToast * 2)}}>
              <Toast text={`${RECORDS[doneP.rec].key} record added`} />
            </div>
          )}
          {repK > 0 && (
            <div style={{position: 'absolute', inset: 0, backdropFilter: `blur(${8 * repK}px)`, background: `rgba(238,243,255,${0.55 * repK})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{opacity: repK, transform: `scale(${lerp(0.8, 1, eb(repK, 2))})`}}>
                <Card style={{padding: '44px 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
                  <Tx size={60} g={[D.navy, D.deep]}>Same steps × 3 more</Tx>
                  <div style={{display: 'flex', gap: 24}}>
                    {RECORDS.slice(1).map((r, i) => {
                      const k = P(t, S(14) + 0.5 + i * 0.2, 0.45);
                      return <div key={r.key} style={{opacity: Math.min(1, k * 2), transform: `scale(${lerp(0.4, 1, eb(k, 2.4))})`}}><Chip w="auto" h={76} r={38} c={r.color} depth={6} style={{padding: '0 30px 0 14px'}}><Glyph name={REC_GLYPH[r.key]} size={42} /><Tx size={34} color="#fff">{r.key}</Tx></Chip></div>;
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}
          {waitK > 0 && (
            <div style={{position: 'absolute', inset: 0, backdropFilter: `blur(${6 * waitK}px)`, background: `rgba(238,243,255,${0.5 * waitK})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{opacity: waitK, transform: `scale(${lerp(0.8, 1, eb(waitK, 2))})`}}>
                <Card style={{padding: '44px 60px', display: 'flex', alignItems: 'center', gap: 34}}>
                  <div style={{transform: `rotate(${(t * 60) % 360}deg)`}}><IconChip name="clock" size={130} c={D.orange} round /></div>
                  <div>
                    <Tx size={26} color={D.slate} w={400}>All 4 records added</Tx>
                    <div><Tx size={54} g={[D.navy, D.deep]}>DNS reflects in 2–8 hrs</Tx></div>
                    <div style={{marginTop: 8}}><Tx size={24} w={400} color={D.slate}>Then share your subdomains and log in with client ID / password</Tx></div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          {liveK > 0 && (
            <div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', justifyContent: 'center', gap: 16}}>
              {RECORDS.map((r, i) => {
                const k = P(t, F(19, 0.55) + i * 0.15, 0.4);
                return <div key={r.key} style={{opacity: Math.min(1, k * 2), transform: `translateY(${(1 - eo(k)) * -30}px) scale(${lerp(0.6, 1, eb(k, 2))})`}}><Chip w="auto" h={56} r={28} c={r.color} depth={5} style={{padding: '0 22px 0 10px'}}><Glyph name={REC_GLYPH[r.key]} size={30} /><Tx size={22} color="#fff">{r.key}.{DOMAIN}</Tx></Chip></div>;
              })}
            </div>
          )}
        </div>
      </div>
      <Caption key={cap[1]} text={cap[1]} since={Math.max(cap[0], S(2) + 0.6) - S(2)} badge={cap[2]} c={cap[3]} k={kin} />
    </AbsoluteFill>
  );
};

// ---------- closing line (sentence 20) ----------
const Closing: React.FC = () => {
  const t = useSec();
  const out = P(t, VO_END - S(20) + 0.1, 0.5);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Pop t={t} at={0.1} x={960} y={430}><Words t={t} at={0.1} text={END_TEXT.line} size={92} g={[D.navy, D.deep]} hi={{3: [D.blue, D.orange]}} /></Pop>
      <div style={{position: 'absolute', left: 0, right: 0, top: 580, display: 'flex', justifyContent: 'center', gap: 30}}>
        {([['globe', END_TEXT.site, D.blue], ['mail', END_TEXT.mail, D.orange]] as const).map(([ic, txt, c], i) => {
          const k = P(t, 0.8 + i * 0.25, 0.5);
          return <div key={txt} style={{opacity: Math.min(1, k * 2), transform: `translateY(${(1 - eo(k)) * 40}px) scale(${lerp(0.6, 1, eb(k, 2.2))})`}}><Chip w="auto" h={84} r={42} c={c} depth={7} style={{padding: '0 36px 0 18px'}}><Glyph name={ic} size={46} /><Tx size={36} color="#fff">{txt}</Tx></Chip></div>;
        })}
      </div>
      {[[300, 300, 56, D.gold], [1620, 330, 46, D.blue], [360, 760, 44, D.orange], [1580, 780, 60, D.gold]].map(([x, y, s, c], i) => <Spark key={i} x={x as number} y={y as number} s={(s as number) * eo(P(t, 0.4 + i * 0.15, 0.5))} c={c as string} t={t} i={i} />)}
    </AbsoluteFill>
  );
};

export const DnsAnimated: React.FC = () => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const td = titleDur();
  return (
    <AbsoluteFill style={{background: '#F5F8FF'}}>
      <Backdrop />
      <Sequence durationInFrames={f(td)}><TitleCard title={TITLE.title} eyebrow={TITLE.eyebrow} sub={TITLE.sub} dur={td} /></Sequence>
      <Sequence from={f(td)} durationInFrames={f(S(2) - td)}><Parts /></Sequence>
      <Sequence from={f(S(2))} durationInFrames={f(S(20) - S(2))}><Stage /></Sequence>
      <Sequence from={f(S(20))} durationInFrames={f(DNS2_END_LOGO_AT - S(20))}><Closing /></Sequence>
      <Sequence from={f(DNS2_END_LOGO_AT)} durationInFrames={f(END_LOGO.dur)}><EndLogo /></Sequence>
      {VIDEO.voiceover && <Audio src={staticFile(VIDEO.voiceover)} />}
      {VIDEO.music && <Audio src={staticFile(VIDEO.music)} volume={VIDEO.musicVolume} loop />}
    </AbsoluteFill>
  );
};
