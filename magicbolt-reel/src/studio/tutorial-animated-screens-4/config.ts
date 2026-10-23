import STYLE from './style.json';
const C = STYLE.colors;
export const NAVY = C.NAVY, DEEP = C.DEEP, BLUE = C.BLUE, GOLD = C.GOLD, ORANGE = C.ORANGE, SLATE = C.SLATE;
export const GREEN = '#19A974', RED = '#E5484D', LINE = '#E3E8F4', MUTED = '#7A84A3';

// Concept samples: two moments per concept, each `moment` seconds long.
export const CONCEPTS = {fps: 24, width: 1920, height: 1080, moment: 3.5, moments: 2, level: 1 as const};

// Browser placement (concept A: centred at scale 1.06; concept B: smaller on the right)
export const BROWSER_A = {x: 146, y: 30, scale: 1.06};
export const BROWSER_B = {x: 740, y: 190, scale: 0.74};
export const SIDEBAR_W = 270;

// ---------- full video: synced to the voiceover (agency-panell-trainin1.mp3, 69.15 s) ----------
// Every scene starts on its sentence start; cues are absolute voiceover seconds (the scene subtracts its start).
// voEnd = 69.0 in the current recording + 5 s for the inserted whitelabel scene (needs a new voiceover + Re-sync).
export const VIDEO = {fps: 24, width: 1920, height: 1080, xfade: 0.35, endGap: 0.6, endSec: 10.04, voEnd: 74.0};
export const SCENES = {
  title:        {start: 0},                                                                   // VO 0.06  "Want to run your entire agency…" + "quick walkthrough"
  signup:       {start: 6.78, site: 7.89, signup: 9.41, login: 10.11, email: 10.85, password: 11.42, submit: 11.9}, // VO 6.78
  dashboards:   {start: 12.43, two: 13.32, agency: 14.76, client: 15.84},                     // VO 12.43
  dashboard:    {start: 17.1, clients: 18.78, profiles: 19.88, recent: 22.02},                // VO 17.10
  clients:      {start: 23.32, list: 23.62, login: 24.64, disconnect: 26.85},                 // VO 23.32
  connections:  {start: 29.27, services: 30.45, google: 32.5, meta: 33.78},                   // VO 29.27
  ai:           {start: 34.33, generate: 35.01, result: 35.78},                               // VO 34.33
  plans:        {start: 37.37, build: 38.89, pricing: 40.53, currency: 41.14, interval: 41.93, trial: 42.89, limits: 44.07}, // VO 37.37
  tiers:        {start: 44.96, higher: 45.92, assign: 47.44, customer: 48.57},                // VO 44.96
  billing:      {start: 49.41, mrr: 50.63, arpu: 51.1, subs: 52.1, invoices: 53.84, paid: 54.63, partial: 55.17, overdue: 55.71}, // VO 49.41
  leads:        {start: 56.63, google: 58.56, category: 59.16, location: 59.81, call: 61.02}, // VO 56.63
  bulk:         {start: 61.67, broadcast: 62.87, customers: 63.66},                           // VO 61.67
  integrations: {start: 64.49, videos: 66.05},                                                // VO 64.49
  whitelabel:   {start: 66.84, brand: 67.3, domain: 68.1, save: 68.95, dns: 69.25, copy: 69.95, connected: 70.85}, // NEW, 5 s, no VO yet (proposed line in storyboard)
  help:         {start: 71.84, reach: 72.6},                                                  // VO 66.84 in the current recording (+5 s)
};
export const ORDER = ['title', 'signup', 'dashboards', 'dashboard', 'clients', 'connections', 'ai', 'plans', 'tiers', 'billing', 'leads', 'bulk', 'integrations', 'whitelabel', 'help'] as const;
export type SceneKey = typeof ORDER[number];
export const END_START = VIDEO.voEnd + VIDEO.endGap;              // EndLogo after the last sentence + 0.6 s
export const DURATION = END_START + VIDEO.endSec;
export const sceneEnd = (k: SceneKey) => {
  const i = ORDER.indexOf(k);
  return i < ORDER.length - 1 ? SCENES[ORDER[i + 1]].start : END_START;
};
