// =====================================================================
//  DNS SETUP TUTORIAL — motion graphics over the screen recording
//  public/dns-setup.mp4 (copy of "DNS Setup Videos.mp4", 1920x1080, silent).
//  All `src*` times are seconds in the SOURCE recording. Scene durations are
//  output seconds. Change a duration or a speed and everything after shifts.
// =====================================================================

export const VIDEO = {
  fps: 30,
  src: 'dns-setup.mp4',
  voiceover: '', // e.g. 'dns-voiceover.mp3' in /public, recorded from SCRIPT.md
  music: '', // e.g. 'music.mp3' in /public
  musicVolume: 0.1,
};

export const D = {
  navy: '#0E1B4D',
  ink: '#1B2350',
  slate: '#5A6488',
  blue: '#1582D5',
  deep: '#1354BC',
  gold: '#FDC60B',
  orange: '#F7941D',
  cf: '#F38020', // Cloudflare orange
  green: '#1FBF75',
  red: '#F0455A',
  violet: '#6C4BFF',
  line: '#DCE5F7',
};

// The four records, in the order the video adds them
export type RecKey = 'login' | 'qr' | 'app' | 'crm';
export const RECORDS: {key: RecKey; label: string; use: string; color: string}[] = [
  {key: 'login', label: 'Customer Login', use: 'Where clients sign in', color: D.blue},
  {key: 'qr', label: 'QR Suite & Website', use: 'QR, short links & site', color: D.violet},
  {key: 'app', label: 'Business Software', use: 'Your branded app', color: D.orange},
  {key: 'crm', label: 'CRM / WhatsApp API', use: 'CRM & WhatsApp endpoint', color: D.green},
];

// The five actions repeated for every record
export type ActKey = 'cname' | 'name' | 'target' | 'dns' | 'save';
export const ACTIONS: {key: ActKey; label: string}[] = [
  {key: 'cname', label: 'CNAME'},
  {key: 'name', label: 'Name'},
  {key: 'target', label: 'Target'},
  {key: 'dns', label: 'DNS only'},
  {key: 'save', label: 'Save'},
];

// Source-time cue for each action of each record; `done` = record visible in the Cloudflare list
export const REC_CUES: Record<RecKey, Record<ActKey | 'done', number>> = {
  login: {cname: 28.75, name: 40.75, target: 55.25, dns: 70.6, save: 72.2, done: 73.0},
  qr: {cname: 77.0, name: 84.25, target: 103.75, dns: 121.0, save: 126.5, done: 129.0},
  app: {cname: 133.5, name: 144.75, target: 170.0, dns: 191.0, save: 196.0, done: 198.5},
  crm: {cname: 201.5, name: 208.5, target: 230.5, dns: 250.0, save: 253.5, done: 255.0},
};

// Footage segments (source in/out + playback speed)
export const CLIPS = {
  open: {src: [8.8, 23.5] as [number, number], rate: 1.25},
  r1: {src: [27.5, 77.0] as [number, number], rate: 1},
  r2: {src: [77.0, 133.5] as [number, number], rate: 2.5},
  r3: {src: [133.5, 201.5] as [number, number], rate: 2.5},
  r4: {src: [201.5, 259.2] as [number, number], rate: 2.5},
};

// Source-time captions for the opening segment (the record segments build theirs from the actions)
export const OPEN_CAPS: [string, number][] = [
  ['Open your MagicBolt dashboard → Whitelabel', 8.8],
  ['Scroll to Domain connection — 4 records to add', 14.5],
];
export const R1_INTRO_CAP: [string, number] = ['Each card shows Type, Name and Target', 27.5];

// Cloudflare is on screen in these source ranges: the account e-mail in its header is blurred
export const CF_RANGES: [number, number][] = [
  [28.5, 40.75], [49.5, 55.25], [65.0, 67.75], [69.75, 84.25], [96.25, 103.75], [117.25, 120.75], [124.0, 144.75],
  [165.5, 170.0], [184.25, 189.25], [194.0, 208.5], [224.5, 230.5], [243.5, 247.0], [251.0, 256.75],
];
// e-mail box in source pixels [x, y, w, h]
export const BLUR_BOX = [76, 172, 230, 44];

// Output scene lengths (seconds)
export const SCENES = {intro: 5.5, overview: 8, repeat: 4, summary: 7.5, outro: 10.04}; // outro = public/logo-animation.mp4

export const SITE = 'www.magicbolt.ai';
export const MAIL = 'contact@magicbolt.ai';
