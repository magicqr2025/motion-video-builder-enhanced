// Clean, readable re-creations of the two screens in the DNS tutorial:
// the MagicBolt Whitelabel → Domain connection page and a Cloudflare-style DNS records page.
// Every component is driven by plain props (0–1 progress values), so the timeline decides the motion.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Chip} from '../glow/parts';
import {D, RECORDS, RecKey, DOMAIN, TARGETS} from './config';
import {Glyph, Gl, IconChip, Tx, REC_GLYPH, eo, eb, lerp, P, fontFamily} from '../dns/ui';

export const FM = 'JetBrains Mono';
loadFont({family: FM, url: staticFile('fonts/JetBrainsMono.ttf'), weight: '100 800'});

export const BW = 1536, BH = 864; // browser window size (same frame as the footage version)
export {DOMAIN, TARGETS};
const CF = D.cf;
const LINE = '#E3E8F4';
const MUTED = '#7A84A3';

// ---------- browser window ----------
export const Browser: React.FC<{url: string; tab: string; tabIcon?: 'mb' | 'cf'; children?: React.ReactNode}> = ({url, tab, tabIcon = 'mb', children}) => (
  <div style={{position: 'relative', width: BW, height: BH, borderRadius: 26, overflow: 'hidden', background: '#fff', fontFamily}}>
    <div style={{height: 58, background: 'linear-gradient(180deg, #EEF2FA, #E6EBF6)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', borderBottom: `1px solid ${LINE}`}}>
      <div style={{display: 'flex', gap: 9}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}</div>
      <div style={{height: 38, padding: '0 18px', borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)'}}>
        {tabIcon === 'mb' ? <svg width={18} height={22} viewBox="0 0 18 22"><path d="M11 0L1 13h7l-2 9 11-13h-7z" fill={D.gold} stroke={D.orange} strokeWidth={1} /></svg> : <Glyph name="cloud" size={22} color={CF} />}
        <Tx size={17} w={400} color={D.ink}>{tab}</Tx>
      </div>
      <div style={{flex: 1, height: 38, borderRadius: 19, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10}}>
        <svg width={14} height={16} viewBox="0 0 14 16"><rect x="1" y="7" width="12" height="9" rx="2" fill={MUTED} /><path d="M4 7V5a3 3 0 0 1 6 0v2" stroke={MUTED} strokeWidth={2} fill="none" /></svg>
        <span style={{fontFamily, fontSize: 18, color: D.slate}}>{url}</span>
      </div>
    </div>
    <div style={{position: 'absolute', top: 58, left: 0, right: 0, bottom: 0}}>{children}</div>
  </div>
);

// ---------- mouse pointer: keyframes [t, x, y, click?] ----------
export type CursorKey = [number, number, number, boolean?];
export const Cursor: React.FC<{t: number; keys: CursorKey[]}> = ({t, keys}) => {
  if (!keys.length || t < keys[0][0] - 0.3) return null;
  let x = keys[0][1], y = keys[0][2];
  for (let i = 1; i < keys.length; i++) {
    const [ta0, xa, ya, clicked] = keys[i - 1];
    const [tb, xb, yb] = keys[i];
    if (t >= tb) { x = xb; y = yb; continue; }
    const ta = ta0 + (clicked ? Math.min(0.4, (tb - ta0) * 0.3) : 0); // linger after a click
    if (t > ta) { const k = eo(Math.min(1, (t - ta) / Math.min(0.7, tb - ta))); x = lerp(xa, xb, k); y = lerp(ya, yb, k); }
    break;
  }
  const click = keys.find((k) => k[3] && t >= k[0] && t < k[0] + 0.5);
  const ck = click ? (t - click[0]) / 0.5 : 0;
  const press = click ? 1 - 0.15 * Math.sin(Math.PI * Math.min(1, ck * 2)) : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 50, opacity: P(t, keys[0][0] - 0.3, 0.3)}}>
      {click && <div style={{position: 'absolute', left: -34, top: -34, width: 68, height: 68, borderRadius: 34, border: `4px solid ${D.blue}`, opacity: 1 - ck, transform: `scale(${0.4 + ck})`}} />}
      <svg width={38} height={46} viewBox="0 0 38 46" style={{position: 'absolute', left: -6, top: -4, transform: `scale(${press})`, transformOrigin: '6px 4px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'}}>
        <path d="M6 4L6 36L14 28L20 42L26 39L20 26L31 26Z" fill={D.navy} stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// small copy button
const CopyBtn: React.FC<{on?: number}> = ({on = 0}) => (
  <div style={{width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on > 0 ? D.green : '#EEF2FA', transform: `scale(${1 + 0.25 * Math.sin(Math.PI * Math.min(1, on * 2))})`}}>
    <Glyph name={on > 0.5 ? 'check' : 'copy'} size={18} color={on > 0 ? '#fff' : D.slate} />
  </div>
);

// ---------- MagicBolt: one record card in Domain connection ----------
export const RecordCard: React.FC<{rec: RecKey; w: number; hl?: 'name' | 'target' | null; copied?: number; connected?: number}> = ({rec, w, hl, copied = 0, connected = 0}) => {
  const r = RECORDS.find((x) => x.key === rec)!;
  const row = (label: string, value: React.ReactNode, key: 'type' | 'name' | 'target') => {
    const on = hl === key;
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 50, padding: '0 14px', borderRadius: 12, background: on ? '#FFF6DF' : 'transparent', boxShadow: on ? `0 0 0 3px ${D.gold}` : 'none'}}>
        <span style={{fontFamily, fontSize: 15, fontWeight: 700, letterSpacing: 1.5, color: MUTED}}>{label}</span>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>{value}{key !== 'type' && <CopyBtn on={on ? copied : 0} />}</div>
      </div>
    );
  };
  return (
    <div style={{width: w, borderRadius: 22, background: '#fff', border: `2px solid ${LINE}`, padding: 22, boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(19,40,120,0.07)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <IconChip name={REC_GLYPH[rec]} size={50} c={r.color} />
        <div style={{flex: 1}}>
          <Tx size={22}>{r.label}</Tx>
          <div><Tx size={15} w={400} color={MUTED}>{r.use}</Tx></div>
        </div>
        <div style={{padding: '6px 14px', borderRadius: 20, background: connected > 0.5 ? '#E2F7EC' : '#FFF1DE', display: 'flex', alignItems: 'center', gap: 8}}>
          <div style={{width: 9, height: 9, borderRadius: 5, background: connected > 0.5 ? D.green : D.orange}} />
          <Tx size={15} color={connected > 0.5 ? '#0E9A5C' : '#C46A00'}>{connected > 0.5 ? 'Connected' : 'Pending'}</Tx>
        </div>
      </div>
      <div style={{marginTop: 16, height: 46, borderRadius: 12, background: '#F5F8FE', border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 16px'}}>
        <span style={{fontFamily: FM, fontSize: 18, color: D.blue}}>{rec}.{DOMAIN}</span>
      </div>
      <div style={{marginTop: 10}}>
        {row('TYPE', <span style={{fontFamily: FM, fontSize: 18, fontWeight: 700, color: D.deep}}>CNAME</span>, 'type')}
        {row('NAME', <span style={{fontFamily: FM, fontSize: 18, fontWeight: 700, color: D.ink}}>{rec}</span>, 'name')}
        {row('TARGET', <span style={{fontFamily: FM, fontSize: 16, color: D.ink}}>{TARGETS[rec]}</span>, 'target')}
      </div>
    </div>
  );
};

// ---------- MagicBolt dashboard ----------
const NAV: [string, Gl][] = [['Agency Dashboard', 'app'], ['Clients / Signup', 'login'], ['All Businesses', 'app'], ['Connections', 'cname'], ['AI Content', 'name']];
const TOOLS: [string, Gl][] = [['Subscriptions', 'save'], ['Billing', 'copy'], ['Lead Center', 'target'], ['Whitelabel', 'globe'], ['Integrations', 'cname']];
export const MB_NAV_Y = (label: string) => {
  const i = NAV.findIndex((n) => n[0] === label);
  if (i >= 0) return 58 + 150 + i * 50 + 22;
  return 58 + 150 + NAV.length * 50 + 52 + TOOLS.findIndex((n) => n[0] === label) * 50 + 22;
};
export const MBDash: React.FC<{page: 'home' | 'whitelabel'; navHover?: number; main?: React.ReactNode}> = ({page, navHover = 0, main}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', background: '#F6F8FD'}}>
    <div style={{width: 290, background: '#fff', borderRight: `1px solid ${LINE}`, padding: '26px 20px', boxSizing: 'border-box'}}>
      <Img src={staticFile('magicbolt-logo.png')} style={{width: 210}} />
      <div style={{marginTop: 22, height: 44, borderRadius: 14, background: '#F1F0FF', display: 'flex', padding: 4, gap: 4}}>
        <div style={{flex: 1, borderRadius: 11, background: D.violet, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={16} color="#fff">Agency</Tx></div>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={16} w={400} color={D.slate}>Client</Tx></div>
      </div>
      <div style={{marginTop: 14}}>
        {NAV.map(([l, g], i) => (
          <div key={l} style={{height: 50, display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', borderRadius: 12, background: page === 'home' && i === 0 ? '#EEF4FF' : 'transparent'}}>
            <Glyph name={g} size={20} color={page === 'home' && i === 0 ? D.blue : MUTED} /><Tx size={17} w={400} color={D.ink}>{l}</Tx>
          </div>
        ))}
        <div style={{height: 52, display: 'flex', alignItems: 'flex-end', padding: '0 12px 8px'}}><Tx size={13} color={MUTED} style={{letterSpacing: 2}}>AGENCY TOOLS</Tx></div>
        {TOOLS.map(([l, g]) => {
          const wl = l === 'Whitelabel';
          const on = wl && (page === 'whitelabel' || navHover > 0);
          return (
            <div key={l} style={{height: 50, display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', borderRadius: 12, background: on ? '#EEF4FF' : 'transparent', boxShadow: wl && navHover > 0 && page === 'home' ? `0 0 0 3px ${D.gold}` : 'none'}}>
              <Glyph name={g} size={20} color={on ? D.blue : MUTED} /><Tx size={17} w={on ? 700 : 400} color={on ? D.blue : D.ink}>{l}</Tx>
            </div>
          );
        })}
      </div>
    </div>
    <div style={{flex: 1, padding: '30px 36px', boxSizing: 'border-box', position: 'relative'}}>
      {page === 'home' ? (
        <>
          <Tx size={30}>Agency Dashboard</Tx>
          <div style={{marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20}}>
            {[['Clients', '24', D.blue], ['Businesses', '61', D.violet], ['Revenue', '₹1.2L', D.green]].map(([a, b, c]) => (
              <div key={a} style={{height: 130, borderRadius: 20, background: '#fff', border: `2px solid ${LINE}`, padding: 22, boxSizing: 'border-box'}}>
                <Tx size={16} w={400} color={MUTED}>{a}</Tx><div><Tx size={40} color={c}>{b}</Tx></div>
              </div>
            ))}
          </div>
          <div style={{marginTop: 20, height: 420, borderRadius: 20, background: '#fff', border: `2px solid ${LINE}`, padding: 24, boxSizing: 'border-box'}}>
            <Tx size={20}>Setup checklist</Tx>
            {['Add your whitelabel details', 'Connect your domains', 'Create a pricing plan', 'Add your first client'].map((s, i) => (
              <div key={s} style={{marginTop: 18, height: 60, borderRadius: 14, background: '#F2FBF6', display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px'}}>
                <div style={{width: 30, height: 30, borderRadius: 15, background: D.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Glyph name="check" size={16} /></div>
                <Tx size={18} w={400}>{s}</Tx>
              </div>
            ))}
          </div>
        </>
      ) : main}
    </div>
  </div>
);

// ---------- Cloudflare-style DNS records page ----------
export type CFRow = {type: string; name: string; content: string; proxy: 'dns' | 'proxied' | 'local'; k?: number; tick?: number};
export const BASE_ROWS: CFRow[] = [
  {type: 'A', name: DOMAIN, content: '192.0.2.10', proxy: 'proxied'},
  {type: 'A', name: `www.${DOMAIN}`, content: '192.0.2.10', proxy: 'proxied'},
];
const CF_NAV = ['Overview', 'Analytics', 'DNS', 'Records', 'Settings', 'SSL/TLS', 'Security', 'Speed', 'Caching'];
export const CF_NAV_Y = (label: string) => 58 + 110 + CF_NAV.indexOf(label) * 48 + 22;
export const CF_ADD_BTN = {x: 1360, y: 58 + 222};

export const CFPage: React.FC<{rows: CFRow[]; navOn?: number; addHover?: number}> = ({rows, navOn = 1, addHover = 0}) => (
  <div style={{position: 'absolute', inset: 0, background: '#F7F8FA'}}>
    <div style={{height: 64, background: '#fff', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px'}}>
      <Glyph name="cloud" size={40} color={CF} />
      <Tx size={20}>Cloudflare</Tx>
      <div style={{width: 1, height: 28, background: LINE, margin: '0 8px'}} />
      <Tx size={18} w={400} color={D.slate}>{DOMAIN}</Tx>
      <div style={{flex: 1}} />
      <div style={{width: 160, height: 14, borderRadius: 7, background: '#E6E9F0'}} />
      <div style={{width: 34, height: 34, borderRadius: 17, background: '#E6E9F0'}} />
    </div>
    <div style={{position: 'absolute', top: 64, bottom: 0, left: 0, width: 250, background: '#fff', borderRight: `1px solid ${LINE}`, padding: '28px 16px', boxSizing: 'border-box'}}>
      {CF_NAV.map((l) => {
        const sub = l === 'Records' || l === 'Settings';
        const on = (l === 'DNS' && navOn > 0) || (l === 'Records' && navOn > 1);
        return (
          <div key={l} style={{height: 48, display: 'flex', alignItems: 'center', padding: sub ? '0 0 0 42px' : '0 14px', borderRadius: 10, background: l === 'Records' && navOn > 1 ? '#FFF1E5' : 'transparent'}}>
            <Tx size={sub ? 16 : 17} w={on ? 700 : 400} color={on ? (sub ? CF : D.ink) : D.slate}>{l}</Tx>
          </div>
        );
      })}
    </div>
    <div style={{position: 'absolute', top: 64, left: 250, right: 0, bottom: 0, padding: '30px 40px', boxSizing: 'border-box'}}>
      <Tx size={30}>DNS records for {DOMAIN}</Tx>
      <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{flex: 1, height: 48, borderRadius: 10, border: `1px solid ${LINE}`, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px'}}><Tx size={16} w={400} color={MUTED}>Search DNS records</Tx></div>
        <div style={{height: 48, padding: '0 22px', borderRadius: 10, background: '#2F6FEB', display: 'flex', alignItems: 'center', gap: 8, transform: `scale(${1 + 0.06 * addHover})`, boxShadow: addHover > 0 ? `0 0 0 4px ${D.gold}` : 'none'}}>
          <Tx size={22} color="#fff">+</Tx><Tx size={17} color="#fff">Add record</Tx>
        </div>
      </div>
      <div style={{marginTop: 20, borderRadius: 14, background: '#fff', border: `1px solid ${LINE}`, overflow: 'hidden'}}>
        <div style={{display: 'grid', gridTemplateColumns: '120px 260px 1fr 190px 90px 50px', height: 50, alignItems: 'center', padding: '0 22px', background: '#FAFBFD', borderBottom: `1px solid ${LINE}`}}>
          {['Type', 'Name', 'Content', 'Proxy status', 'TTL', ''].map((h) => <Tx key={h} size={15} color={MUTED}>{h}</Tx>)}
        </div>
        {rows.map((r, i) => {
          const k = r.k ?? 1;
          if (k <= 0) return null;
          return (
            <div key={i} style={{display: 'grid', gridTemplateColumns: '120px 260px 1fr 190px 90px 50px', height: 58, alignItems: 'center', padding: '0 22px', borderBottom: `1px solid ${LINE}`, opacity: Math.min(1, k * 2),
              background: k < 1 ? `rgba(255,214,120,${0.35 * (1 - k)})` : r.tick ? `rgba(31,191,117,${0.08})` : '#fff', transform: `translateX(${(1 - eo(k)) * -30}px)`}}>
              <span style={{fontFamily: FM, fontSize: 17, fontWeight: 700, color: D.deep}}>{r.type}</span>
              <span style={{fontFamily: FM, fontSize: 17, color: D.ink}}>{r.name}</span>
              <span style={{fontFamily: FM, fontSize: 16, color: D.slate}}>{r.content}</span>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}><Glyph name="cloud" size={24} color={r.proxy === 'proxied' ? CF : '#A9B1C4'} /><Tx size={15} w={400} color={D.slate}>{r.proxy === 'proxied' ? 'Proxied' : 'DNS only'}</Tx></div>
              <Tx size={15} w={400} color={D.slate}>Auto</Tx>
              {r.tick ? <div style={{transform: `scale(${eb(Math.min(1, r.tick), 2.4)})`}}><Chip w={32} h={32} r={16} c={D.green} depth={3}><Glyph name="check" size={18} /></Chip></div> : <span />}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ---------- Add record modal ----------
export const MODAL = {x: 318, y: 150, w: 900}; // in window px
export const MODAL_FIELDS = {type: {x: 318 + 40 + 100, y: 150 + 150}, name: {x: 318 + 40 + 470, y: 150 + 150}, target: {x: 318 + 40 + 270, y: 150 + 262}, proxy: {x: 318 + 40 + 640, y: 150 + 262}, save: {x: 318 + 40 + 60, y: 150 + 380}};
export const CFModal: React.FC<{k: number; type: 'A' | 'CNAME'; typeOpen?: number; name: string; target: string; proxyOff: number; focus?: 'name' | 'target' | 'proxy' | 'save' | null; saveHover?: number}> = ({k, type, typeOpen = 0, name, target, proxyOff, focus, saveHover = 0}) => {
  if (k <= 0) return null;
  const field = (label: string, value: React.ReactNode, w: number | string, on: boolean, ph?: string) => (
    <div style={{width: w}}>
      <Tx size={16} color={D.slate}>{label}</Tx>
      <div style={{marginTop: 8, height: 54, borderRadius: 10, border: `2px solid ${on ? '#2F6FEB' : LINE}`, boxShadow: on ? '0 0 0 4px rgba(47,111,235,0.15)' : 'none', display: 'flex', alignItems: 'center', padding: '0 16px', background: '#fff'}}>
        {value || <Tx size={17} w={400} color="#B3BACB">{ph}</Tx>}
      </div>
    </div>
  );
  const off = eo(proxyOff);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `rgba(20,28,60,${0.35 * Math.min(1, k)})`}} />
      <div style={{position: 'absolute', left: MODAL.x, top: MODAL.y, width: MODAL.w, borderRadius: 20, background: '#fff', padding: '30px 40px', boxSizing: 'border-box', boxShadow: '0 30px 80px rgba(10,20,60,0.35)',
        opacity: Math.min(1, k * 2), transform: `translateY(${(1 - eo(k)) * 30}px) scale(${lerp(0.94, 1, eo(k))})`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><Tx size={28}>Add record</Tx><Tx size={26} w={400} color={MUTED}>×</Tx></div>
        <div style={{marginTop: 22, display: 'flex', gap: 24}}>
          <div style={{position: 'relative'}}>
            {field('Type', <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}><span style={{fontFamily: FM, fontSize: 18, fontWeight: 700, color: D.deep}}>{type}</span><Tx size={16} color={MUTED}>▾</Tx></div>, 200, typeOpen > 0)}
            {typeOpen > 0 && (
              <div style={{position: 'absolute', left: 0, top: 96, width: 200, borderRadius: 12, background: '#fff', boxShadow: '0 16px 40px rgba(10,20,60,0.25)', overflow: 'hidden', zIndex: 5, opacity: Math.min(1, typeOpen * 2)}}>
                {['A', 'AAAA', 'CNAME', 'MX', 'TXT'].map((o) => (
                  <div key={o} style={{height: 44, display: 'flex', alignItems: 'center', padding: '0 16px', background: o === 'CNAME' && typeOpen > 0.5 ? '#EAF1FF' : '#fff'}}><span style={{fontFamily: FM, fontSize: 17, fontWeight: o === 'CNAME' ? 700 : 400, color: D.ink}}>{o}</span></div>
                ))}
              </div>
            )}
          </div>
          {field('Name', name && <span style={{fontFamily: FM, fontSize: 18, fontWeight: 700, color: D.ink}}>{name}</span>, 576, focus === 'name', 'Use @ for root')}
        </div>
        <div style={{marginTop: 22, display: 'flex', gap: 24, alignItems: 'flex-end'}}>
          {field('Target', target && <span style={{fontFamily: FM, fontSize: 17, color: D.ink}}>{target}</span>, 480, focus === 'target', 'e.g. www.example.com')}
          <div style={{width: 296, borderRadius: 12, padding: '6px 10px', boxShadow: focus === 'proxy' ? `0 0 0 3px ${D.gold}` : 'none'}}>
            <Tx size={16} color={D.slate}>Proxy status</Tx>
            <div style={{marginTop: 8, height: 54, display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{position: 'relative', width: 66, height: 36, borderRadius: 18, background: off > 0.5 ? '#C9D1E3' : '#2F6FEB'}}>
                <div style={{position: 'absolute', left: lerp(33, 3, off), top: 3, width: 30, height: 30, borderRadius: 15, background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.25)'}} />
              </div>
              <Glyph name="cloud" size={30} color={off > 0.5 ? '#A9B1C4' : CF} />
              <Tx size={18} color={off > 0.5 ? D.ink : CF}>{off > 0.5 ? 'DNS only' : 'Proxied'}</Tx>
            </div>
          </div>
        </div>
        <div style={{marginTop: 30, display: 'flex', gap: 14}}>
          <div style={{height: 50, padding: '0 30px', borderRadius: 10, background: '#2F6FEB', display: 'flex', alignItems: 'center', transform: `scale(${1 + 0.07 * saveHover})`, boxShadow: focus === 'save' ? `0 0 0 4px ${D.gold}` : 'none'}}><Tx size={18} color="#fff">Save</Tx></div>
          <div style={{height: 50, padding: '0 26px', borderRadius: 10, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center'}}><Tx size={18} w={400} color={D.slate}>Cancel</Tx></div>
        </div>
      </div>
    </>
  );
};

// A value chip flying between two points (copy → paste)
export const FlyChip: React.FC<{text: string; p: number; from: [number, number]; to: [number, number]; c?: string}> = ({text, p, from, to, c = D.gold}) => {
  if (p <= 0 || p >= 1) return null;
  const e = eo(p);
  const x = lerp(from[0], to[0], e), y = lerp(from[1], to[1], e) - Math.sin(Math.PI * p) * 120;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${1 + 0.15 * Math.sin(Math.PI * p)}) rotate(${(1 - p) * -6}deg)`, zIndex: 60}}>
      <Chip w="auto" h={56} r={16} c={c} depth={5} style={{padding: '0 22px'}}><Glyph name="copy" size={24} color={D.navy} /><span style={{fontFamily: FM, fontSize: 20, fontWeight: 700, color: D.navy}}>{text}</span></Chip>
    </div>
  );
};
