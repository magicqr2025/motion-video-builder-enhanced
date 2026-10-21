// MagicBolt AI agency intro (1920x1080 @ 24 fps): colours, screenshot crops and concept-sample timing.
// All on-screen text lives in text.json (editable from the browser).
// Screenshots are 1920x1080; crops below are in screenshot pixels.

export const W = {fps: 24, width: 1920, height: 1080};
export const SHOT_W = 1920;
export const SHOT_H = 1080;

import STYLE from './style.json';
const C = STYLE.colors; // editable in the Studio's Style tab
export const NAVY = C.NAVY;
export const DEEP = C.DEEP;
export const BLUE = C.BLUE;
export const GOLD = C.GOLD;
export const ORANGE = C.ORANGE;
export const SLATE = C.SLATE;

const D = 'studio/intro-waycrm-1m-style-2/';
export const SHOT = {
  dashboard: D + 'agency-01-dashboard.png',
  clients: D + 'agency-02-clients.png',
  businesses: D + 'agency-03-all-businesses.png',
  plans: D + 'agency-04-plans.png',
  allot: D + 'agency-05-subscriptions-allot-plan.png',
  whitelabel: D + 'agency-06-whitelabel.png',
  integrations: D + 'agency-07-integrations.png',
  mailing: D + 'agency-08-bulk-mailing.png',
  leads: D + 'agency-09-lead-center.png',
  billing: D + 'agency-10-billing.png',
  clientDash: D + 'client-01-dashboard.png',
  smartCard: D + 'client-02-smart-card.png',
  reviews: D + 'client-03-review-booster.png',
  menu: D + 'client-04-smart-menu-and-website.png',
  composer: D + 'client-05-post-composer.png',
  calendar: D + 'client-06-content-calendar.png',
  inbox: D + 'client-07-reviews-and-messages.png',
  agent: D + 'client-08-ai-agent.png',
  audit: D + 'client-09-google-profile-audit.png',
  rank: D + 'client-10-keyword-rank-and-competitors.png',
  aeo: D + 'client-11-ai-search-aeo-geo.png',
  channels: D + 'client-12-all-channels.png',
};
export type ShotName = keyof typeof SHOT;

// [x, y, w, h] in screenshot pixels
export type Rect = [number, number, number, number];
export const CROP: Record<string, Rect> = {
  heroStats: [1418, 266, 427, 102], // dashboard: 48 clients · 73 businesses · ₹1.2L
  loginCard: [1337, 277, 340, 327], // whitelabel: client login preview
  domain: [329, 733, 783, 185], // whitelabel: custom domain, verified
  brandColour: [329, 558, 783, 152],
  clientPreview: [1135, 658, 745, 298],
  dayCard: [1501, 200, 379, 371], // calendar: Fri Oct 24, 3 posts
  sendTo: [329, 200, 1149, 138], // composer: channel picker
  phone: [1520, 200, 340, 698], // composer: Instagram preview
  rankGrid: [351, 286, 769, 470],
  tracked: [329, 836, 1551, 156],
  tiers: [329, 190, 823, 354], // plans: Starter / Growth / Pro
  growthCard: [610, 190, 262, 354],
  phones: [497, 452, 1214, 574], // review booster flow
  reviewStats: [329, 268, 1551, 124],
};

CROP.aiDraft = [1152, 200, 728, 484]; // AI agent: Instagram draft ready for approval
CROP.reviewDraft = [401, 407, 749, 154]; // reviews: AI draft reply to Priya
CROP.auditScore = [329, 200, 468, 410]; // audit: 82 / 100 gauge
CROP.headToHead = [1166, 200, 713, 500]; // rank: you vs Roast Republic
CROP.qrCard = [1550, 268, 330, 476]; // smart card: QR code
CROP.website = [713, 240, 1167, 548]; // instant website preview
CROP.signup = [328, 199, 884, 159]; // clients: your signup link
CROP.revenue = [1282, 350, 597, 374]; // billing: revenue last 6 months
CROP.collected = [329, 200, 370, 126]; // billing: collected this month
CROP.weekStats = [329, 720, 1551, 192]; // channels: this week across all channels

// ================= Full video (concept A "Glass Showroom") =================
export const AUDIO = {src: 'studio/intro-waycrm-1m-style-2/ElevenLabs_2026-10-20T20_45_11_vijay-a-mqrvoice_ivc_sp100_s50_sb75_v4.mp3', trimAfter: 76.8}; // cut the stray "How to use it?" at 77.2
export const XFADE = 0.35; // each scene overlaps the next by this much

// Scene starts follow the voiceover sentences. `dur` in seconds.
export const SCENES = {
  hook: {start: 0, dur: 7.5}, // VO 0.06 "Running a digital marketing agency means juggling…"
  meet: {start: 7.5, dur: 3.45}, // VO 7.56 "MagicBolt AI brings it all into one white label platform"
  white: {start: 10.95, dur: 3.45}, // VO 11.39 "…with your brand, your domain, and your pricing."
  channels: {start: 14.4, dur: 7.05}, // VO 14.45 "For every client, manage Google Business Profile…"
  calendar: {start: 21.45, dur: 5.3}, // VO 21.50 "Write one post, schedule it for each channel…"
  ai: {start: 26.75, dur: 4.2}, // VO 26.79 "Our AI assistant drafts the post…"
  rank: {start: 30.95, dur: 6.0}, // VO 31.03 "Track local rankings on the map…"
  qr: {start: 36.95, dur: 7.15}, // VO 37.01 "Add magic QR cards and review collection…"
  agency: {start: 44.1, dur: 11.9}, // VO 44.19 "Then run the agency itself…"
  brand: {start: 56.0, dur: 4.65}, // VO 56.05 "Your clients log into your brand…"
  revenue: {start: 60.65, dur: 5.5}, // VO 60.72 "Turn everyday marketing tasks into scalable services…"
  tagline: {start: 66.15, dur: 6.7}, // VO 66.21 "MagicBolt AI, your brand, your platform, your growth."
  cta: {start: 72.85, dur: 7.15}, // VO 72.88 "Visit magicbolt.ai and build your white label business today." (VO ends 76.4, hold)
};
export type SceneKey = keyof typeof SCENES;
export const TOTAL = SCENES.cta.start + SCENES.cta.dur;

// VO word times (absolute) -> cue relative to the scene start
const rel = <T extends Record<string, number>>(k: SceneKey, vo: T) => Object.fromEntries(Object.entries(vo).map(([n, v]) => [n, +(v - SCENES[k].start).toFixed(2)])) as T;
export const CUE = {
  hook: rel('hook', {kicker: 0.1, chips: 2.41, line0: 3.05, line1: 4.83, screens: 4.4, pressure: 5.75, collapse: 7.05}),
  meet: rel('meet', {meet: 7.5, name: 7.7, into: 9.18, lead: 9.68, screen: 8.0}),
  white: rel('white', {screen: 10.95, w0: 11.61, w1: 11.8, w2: 12.34, w3: 12.53, w4: 13.26, w5: 13.6}),
  channels: rel('channels', {title: 14.45, screen: 14.5, c0: 15.81, c1: 17.23, c2: 17.88, c3: 18.59, single: 20.28}),
  calendar: rel('calendar', {title: 21.5, screen: 21.5, chips: 23.33, swap: 24.3, day: 25.34}),
  ai: rel('ai', {title: 26.79, screen: 26.8, post: 27.78, reply: 29.12}),
  rank: rel('rank', {title: 31.03, screen: 31.0, map: 31.25, audit: 32.81, compete: 34.14}),
  qr: rel('qr', {title: 37.01, screen: 37.0, qr: 37.51, reviews: 38.25, web: 41.34}),
  agency: rel('agency', {title: 44.19, screen: 44.2, s0: 46.25, s1: 48.43, s2: 49.11, s3: 50.66, s4: 51.81, all: 54.24}),
  brand: rel('brand', {card: 56.05, brand: 57.56, domain: 58.51, prices: 59.83}),
  revenue: rel('revenue', {chart: 60.9, services: 62.85, recurring: 64.11, revenue: 65.76}),
  tagline: rel('tagline', {name: 66.21, l0: 68.92, l1: 70.2, l2: 71.95}),
  cta: rel('cta', {site: 73.25, cta: 74.73}),
};

// Concept samples: 4 moments of MOMENT seconds each; samples are taken at SAMPLE_AT into each moment
export const MOMENT = 3;
export const MOMENTS = 4;
export const SAMPLE_AT = 2.3;
