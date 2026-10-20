// MagicBolt Whitelabel page (main area): 1 · Branding details, 2 · Custom domain.
// Layout constants are exported so the timeline can aim the cursor at fields and buttons.
import React from 'react';
import {Chip} from '../glow/parts';
import {D, RECORDS, RecKey, DOMAIN, TARGETS} from './config';
import {Glyph, Gl, IconChip, Tx, REC_GLYPH, fontFamily} from '../dns/ui';
import {FM} from './mock';

const LINE = '#E3E8F4';
const MUTED = '#7A84A3';

// ---------- layout (main-area px; main starts at x=290 of the 1536 window, content y starts below the 58px browser bar) ----------
export const WL = {
  mainX: 326, mainW: 1174,
  brandTop: 112, brandH: 600,
  domTop: 742, scrollToDomains: 736,
  cardW: 555, cardH: 270, gridTop: 156, gap: 20,
};
const DOM_H = WL.gridTop + 2 * WL.cardH + WL.gap + 80;
const cardXY = (i: number, scroll: number) => {
  const x = WL.mainX + 22 + (i % 2) * (WL.cardW + WL.gap);
  const y = WL.domTop - scroll + WL.gridTop + Math.floor(i / 2) * (WL.cardH + WL.gap);
  return [x, y] as const;
};
// window-coordinate targets for the cursor (window = browser incl. its 58px top bar)
export const WL_POS = {
  saveChanges: [WL.mainX + WL.mainW - 113, 58 + WL.brandTop + WL.brandH - 45] as const,
  input: (i: number, scroll: number) => { const [x, y] = cardXY(i, scroll); return [x + 300, 58 + y + 100] as const; },
  copyName: (i: number, scroll: number) => { const [x, y] = cardXY(i, scroll); return [x + WL.cardW - 45, 58 + y + 202] as const; },
  copyTarget: (i: number, scroll: number) => { const [x, y] = cardXY(i, scroll); return [x + WL.cardW - 45, 58 + y + 246] as const; },
  saveDomains: (scroll: number) => [WL.mainX + WL.mainW - 22 - 82, 58 + WL.domTop - scroll + DOM_H - 45] as const,
};

export const BRAND_FIELDS: [string, string, boolean][] = [
  ['BRAND NAME', 'Your Brand Agency', true],
  ['BRAND SUBHEADING', 'Your Growth Partner', false],
  ['WEBSITE URL', `https://${DOMAIN}`, true],
  ['MAIL ID', `hello@${DOMAIN}`, true],
  ['SUPPORT NUMBER', '+91 98765 43210', true],
  ['SUPPORT EMAIL', `support@${DOMAIN}`, true],
  ['WHATSAPP SUPPORT', '+91 98765 43210', true],
  ['SUPPORT TICKET LINK', `https://help.${DOMAIN}`, false],
];

export type DomState = {typed: string; reveal: number; hl?: 'name' | 'target' | null; copied?: number; status: 'notset' | 'pending' | 'connected'; focus?: boolean};
export type WLState = {scroll: number; typed: string[]; focusField: number; saved: number; saveChangesHover: number; doms: DomState[]; saveDomainsHover: number; domainsSaved: number};

const Field: React.FC<{label: string; req: boolean; value: string; ph: string; on: boolean; caret: boolean}> = ({label, req, value, ph, on, caret}) => (
  <div>
    <div style={{display: 'flex', gap: 4}}><Tx size={14} color={D.slate} style={{letterSpacing: 1}}>{label}</Tx>{req && <Tx size={14} color={D.red}>*</Tx>}</div>
    <div style={{marginTop: 8, height: 50, borderRadius: 12, border: `2px solid ${on ? D.blue : LINE}`, boxShadow: on ? '0 0 0 4px rgba(21,130,213,0.14)' : 'none', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px'}}>
      {value ? <Tx size={18} w={400} color={D.ink}>{value}{caret && <span style={{color: D.blue}}>|</span>}</Tx> : <Tx size={18} w={400} color="#B3BACB">{ph}</Tx>}
    </div>
  </div>
);

const SectionHead: React.FC<{icon: Gl; title: string; sub: string; n: number}> = ({icon, title, sub, n}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
    <IconChip name={icon} size={52} c={D.blue} round />
    <div style={{flex: 1}}>
      <Tx size={24}>{title}</Tx>
      <div><Tx size={16} w={400} color={D.slate}>{sub}</Tx></div>
    </div>
    <div style={{padding: '6px 16px', borderRadius: 20, background: '#EEF4FF'}}><Tx size={15} color={D.blue}>Section {n}</Tx></div>
  </div>
);

const DomainCard: React.FC<{rec: RecKey; s: DomState}> = ({rec, s}) => {
  const r = RECORDS.find((x) => x.key === rec)!;
  const pill = {notset: ['Not set', '#EEF1F7', D.slate, '#A9B1C4'], pending: ['DNS not connected yet', '#FFF1DE', '#C46A00', D.orange], connected: ['Connected', '#E2F7EC', '#0E9A5C', D.green]}[s.status];
  const row = (label: string, value: React.ReactNode, key: 'type' | 'name' | 'target') => {
    const on = s.hl === key;
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44, padding: '0 12px', borderRadius: 10, background: on ? '#FFF6DF' : 'transparent', boxShadow: on ? `0 0 0 3px ${D.gold}` : 'none'}}>
        <span style={{fontFamily, fontSize: 13, fontWeight: 700, letterSpacing: 1.4, color: MUTED}}>{label}</span>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          {value}
          {key !== 'type' && (
            <div style={{width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on && (s.copied ?? 0) > 0 ? D.green : '#EEF2FA'}}>
              <Glyph name={on && (s.copied ?? 0) > 0.5 ? 'check' : 'copy'} size={16} color={on && (s.copied ?? 0) > 0 ? '#fff' : D.slate} />
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div style={{width: WL.cardW, height: WL.cardH, borderRadius: 20, background: '#fff', border: `2px solid ${s.focus ? D.blue : LINE}`, padding: 18, boxSizing: 'border-box', boxShadow: '0 8px 24px rgba(19,40,120,0.06)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 48}}>
        <IconChip name={REC_GLYPH[rec]} size={42} c={r.color} />
        <div style={{flex: 1}}><Tx size={19}>{r.label}</Tx><div><Tx size={13} w={400} color={MUTED}>{r.use}</Tx></div></div>
        <div style={{padding: '5px 12px', borderRadius: 16, background: pill[1], display: 'flex', alignItems: 'center', gap: 7}}>
          <div style={{width: 8, height: 8, borderRadius: 4, background: pill[3]}} />
          <Tx size={13} color={pill[2]}>{pill[0]}</Tx>
        </div>
      </div>
      <div style={{marginTop: 10, height: 48, borderRadius: 12, border: `2px solid ${s.focus ? D.blue : LINE}`, background: '#F8FAFE', display: 'flex', alignItems: 'center', padding: '0 14px'}}>
        {s.typed ? <span style={{fontFamily: FM, fontSize: 18, color: D.blue}}>{s.typed}{s.focus && <span style={{color: D.ink}}>|</span>}</span>
          : <span style={{fontFamily: FM, fontSize: 17, color: '#B3BACB'}}>{rec}.{DOMAIN}</span>}
      </div>
      <div style={{marginTop: 12, height: 132, position: 'relative'}}>
        {s.reveal < 1 && (
          <div style={{position: 'absolute', inset: 0, borderRadius: 12, border: `2px dashed ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - s.reveal}}>
            <Tx size={15} w={400} color={MUTED}>Enter a subdomain to see the DNS record to add</Tx>
          </div>
        )}
        {s.reveal > 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: s.reveal, transform: `translateY(${(1 - s.reveal) * 14}px)`}}>
            {row('TYPE', <span style={{fontFamily: FM, fontSize: 16, fontWeight: 700, color: D.deep}}>CNAME</span>, 'type')}
            {row('NAME / HOST', <span style={{fontFamily: FM, fontSize: 16, fontWeight: 700, color: D.ink}}>{rec}</span>, 'name')}
            {row('VALUE / TARGET', <span style={{fontFamily: FM, fontSize: 16, color: D.ink}}>{TARGETS[rec]}</span>, 'target')}
          </div>
        )}
      </div>
    </div>
  );
};

const Btn: React.FC<{text: string; hover: number}> = ({text, hover}) => (
  <Chip w="auto" h={50} r={14} c={D.blue} depth={4} style={{padding: '0 26px', transform: `scale(${1 + 0.06 * hover})`}}><Tx size={18} color="#fff">{text}</Tx></Chip>
);

export const WhitelabelMain: React.FC<{s: WLState}> = ({s}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 36, right: 36, top: -s.scroll}}>
      {/* page header */}
      <div style={{position: 'absolute', top: 26, left: 0, right: 0, display: 'flex', alignItems: 'baseline', gap: 14}}>
        <Tx size={30}>Whitelabel</Tx><Tx size={16} w={400} color={MUTED}>Branding and domains shown to your clients</Tx>
      </div>
      {/* 1 · Branding details */}
      <div style={{position: 'absolute', top: WL.brandTop, left: 0, right: 0, height: WL.brandH, borderRadius: 22, background: '#fff', border: `2px solid ${LINE}`, padding: '24px 28px', boxSizing: 'border-box'}}>
        <SectionHead icon="app" title="Branding details" sub="How your brand and support appear to your clients" n={1} />
        <div style={{marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 22, rowGap: 14}}>
          {BRAND_FIELDS.map(([l, v, req], i) => (
            <React.Fragment key={l}>
              {i === 4 && <div style={{gridColumn: '1 / 3', height: 2, background: LINE, margin: '4px 0'}} />}
              <Field label={l} req={req} value={s.typed[i] ?? ''} ph={v.startsWith('http') ? 'https://' : ''} on={s.focusField === i} caret={s.focusField === i} />
            </React.Fragment>
          ))}
        </div>
        <div style={{position: 'absolute', left: 28, right: 28, bottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, opacity: s.saved}}><Glyph name="check" size={18} color={D.green} /><Tx size={16} w={400} color="#0E9A5C">All changes saved</Tx></div>
          <Btn text="Save changes" hover={s.saveChangesHover} />
        </div>
      </div>
      {/* 2 · Custom domain */}
      <div style={{position: 'absolute', top: WL.domTop, left: 0, right: 0, height: DOM_H, borderRadius: 22, background: '#fff', border: `2px solid ${LINE}`, padding: '22px 22px', boxSizing: 'border-box'}}>
        <SectionHead icon="globe" title="Custom domain" sub="Choose a subdomain for each application, then add its DNS record" n={2} />
        <div style={{marginTop: 14, display: 'flex', gap: 14}}>
          {['Enter a subdomain', 'Add the CNAME record at your DNS provider', 'Save — DNS can take a few hours'].map((x, i) => (
            <div key={x} style={{flex: 1, height: 42, borderRadius: 12, background: '#F6F8FD', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px'}}>
              <div style={{width: 24, height: 24, borderRadius: 12, background: '#DCE8FF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Tx size={13} color={D.blue}>{i + 1}</Tx></div>
              <Tx size={14} w={400} color={D.slate}>{x}</Tx>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 22, top: WL.gridTop, display: 'grid', gridTemplateColumns: `${WL.cardW}px ${WL.cardW}px`, gap: WL.gap}}>
          {RECORDS.map((r, i) => <DomainCard key={r.key} rec={r.key} s={s.doms[i]} />)}
        </div>
        <div style={{position: 'absolute', left: 22, right: 22, bottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, opacity: s.domainsSaved}}><Glyph name="check" size={18} color={D.green} /><Tx size={16} w={400} color="#0E9A5C">Domains saved — now add the DNS records</Tx></div>
          <Btn text="Save domains" hover={s.saveDomainsHover} />
        </div>
      </div>
    </div>
  </div>
);

// Branded client login page (shown once DNS is live)
export const ClientLogin: React.FC<{k: number}> = ({k}) => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #EEF4FF, #FFF6E8)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: 520, borderRadius: 26, background: '#fff', padding: '40px 46px', boxSizing: 'border-box', boxShadow: '0 30px 70px rgba(19,40,120,0.18)', opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 30}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <IconChip name="globe" size={56} c={D.violet} />
        <div><Tx size={26}>Your Brand Agency</Tx><div><Tx size={15} w={400} color={MUTED}>Your Growth Partner</Tx></div></div>
      </div>
      <div style={{marginTop: 30}}><Tx size={22}>Sign in to your dashboard</Tx></div>
      {[['CLIENT ID', 'client@business.com'], ['PASSWORD', '••••••••••']].map(([l, v]) => (
        <div key={l} style={{marginTop: 18}}>
          <Tx size={13} color={D.slate} style={{letterSpacing: 1}}>{l}</Tx>
          <div style={{marginTop: 8, height: 52, borderRadius: 12, border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 16px'}}><Tx size={18} w={400}>{v}</Tx></div>
        </div>
      ))}
      <div style={{marginTop: 26}}><Chip w="100%" h={56} r={14} c={D.violet} depth={4}><Tx size={19} color="#fff">Sign in</Tx></Chip></div>
    </div>
  </div>
);
