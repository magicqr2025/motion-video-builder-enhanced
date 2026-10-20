// =====================================================================
//  WHITE LABEL SETUP TUTORIAL: Branding, Domain Connect, DNS Setup.
//  Fully animated (no screen recording). Everything is timed from the voiceover:
//  LINES is the script (one entry per sentence). Until the voiceover is recorded,
//  sentence starts are estimated from word counts. After recording, put the file in
//  /public, set VIDEO.voiceover, and fill VO_MEASURED with each sentence's start time.
// =====================================================================
import {D} from '../dns/config';

export {D};

export const VIDEO = {fps: 30, voiceover: '', music: '', musicVolume: 0.08};

export const TITLE = {eyebrow: 'MagicBolt Tutorial', title: 'White Label Setup', sub: 'Branding · Domain Connect · DNS Setup'};

export const LINES: string[] = [
  /* 1 */ "Welcome! In this video we'll set up your white label in three parts: branding, domain connect, and DNS setup.",
  /* 2 */ 'In your MagicBolt dashboard, your setup checklist is complete, so open Whitelabel from the menu.',
  /* 3 */ 'First, fill in your branding details: brand name, website, mail ID, and your support contacts.',
  /* 4 */ 'Your clients see these details everywhere, so click Save changes.',
  /* 5 */ 'Next, scroll down to Custom domain. It starts empty, so you can choose any subdomain for each application.',
  /* 6 */ 'Every supporting application connects to its own branded address: customer for client login, qr for your QR suite and website, business for business software, and crm for CRM and WhatsApp.',
  /* 7 */ 'As you enter each subdomain, MagicBolt shows the DNS record to add. Click Save domains.',
  /* 8 */ "Now let's set up DNS. Open your domain provider; we're using Cloudflare.",
  /* 9 */ 'Go to DNS, then Records, click Add record, and set the type to CNAME.',
  /* 10 */ "Back in MagicBolt, copy the name from the Customer Login card, that's customer, and paste it into the Name field.",
  /* 11 */ 'Then copy the target value and paste it into Target.',
  /* 12 */ "Here's the important part: switch the proxy off, so the cloud turns grey and says DNS only.",
  /* 13 */ 'Click Save, and your customer record is done.',
  /* 14 */ 'Now repeat the same steps for qr, business, and crm.',
  /* 15 */ 'qr: add a CNAME, paste the name and target, proxy off, and save.',
  /* 16 */ 'business: same steps. CNAME, name, target, proxy off, save.',
  /* 17 */ 'And crm: copy, paste, proxy off, and save.',
  /* 18 */ 'All four records are added. DNS changes can take two to eight hours to reflect.',
  /* 19 */ 'After that, start sharing your subdomains, and your clients can log in with their client ID and password.',
  /* 20 */ 'Your brand, your domain. Need help? Write to contact at magicbolt dot ai.',
];

// Measured sentence starts (seconds) from the recorded voiceover; leave null to use estimates.
export const VO_MEASURED: number[] | null = null;
export const VO_END_MEASURED: number | null = null;

// estimate: ~2.5 words/s, a short breath between lines, and a floor so busy scenes have room
const MIN: Record<number, number> = {3: 6.5, 6: 13, 9: 6.5, 12: 7, 15: 5.5, 16: 5.5, 17: 5.5, 18: 6, 19: 7.5};
const est = (() => {
  const starts: number[] = [];
  let t = 0;
  LINES.forEach((l, i) => {
    starts.push(t);
    const words = l.split(/\s+/).length;
    t += Math.max(words / 2.5, MIN[i + 1] ?? 3) + 0.45;
  });
  return {starts, end: t};
})();
export const VO = VO_MEASURED ?? est.starts;
export const VO_END = VO_END_MEASURED ?? est.end;

export type RecKey = 'customer' | 'qr' | 'business' | 'crm';
export const RECORDS: {key: RecKey; label: string; use: string; color: string}[] = [
  {key: 'customer', label: 'Customer Login', use: 'Where clients sign in', color: D.blue},
  {key: 'qr', label: 'QR Suite & Website', use: 'QR, short links & website', color: D.violet},
  {key: 'business', label: 'Business Software', use: 'Your branded software', color: D.orange},
  {key: 'crm', label: 'CRM / WhatsApp API', use: 'CRM & WhatsApp endpoint', color: D.green},
];

export const DOMAIN = 'yourbrand.com';
// never show real DNS targets
export const TARGETS: Record<RecKey, string> = {customer: 'xxxx.dns.com', qr: 'xxxx.dns.com', business: 'xxxx.dns.com', crm: 'xxxx.dns.com'};

export const END_TEXT = {line: 'Your brand. Your domain.', site: 'www.magicbolt.ai', mail: 'contact@magicbolt.ai'};
