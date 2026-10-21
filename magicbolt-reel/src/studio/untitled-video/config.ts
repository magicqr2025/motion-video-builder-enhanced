// Way CRM intro (1920x1080 @ 24 fps): colours, screenshot crops and concept-sample timing.
// All on-screen text lives in text.json (editable from the browser).
// Screenshots are 2880x1800; crops below are in "D units" = a 2000x1250 view of the screenshot.

export const W = {fps: 24, width: 1920, height: 1080};

import STYLE from './style.json';
const C = STYLE.colors; // editable in the Studio's Style tab
export const NAVY = C.NAVY;
export const DEEP = C.DEEP;
export const BLUE = C.BLUE;
export const GOLD = C.GOLD;
export const ORANGE = C.ORANGE;
export const SLATE = C.SLATE;
export const WA = C.WA;

export const SHOT = {
  dashboard: 'studio/untitled-video/01-dashboard.png',
  inbox: 'studio/untitled-video/02-shared-inbox.png',
  alert: 'studio/untitled-video/03-live-message-alert.png',
  bot: 'studio/untitled-video/04-bot-flow-test-flow.png',
  broadcast: 'studio/untitled-video/05-broadcast-report.png',
  pipeline: 'studio/untitled-video/06-sales-pipeline.png',
  board: 'studio/untitled-video/07-lead-board.png',
  meeting: 'studio/untitled-video/08-complete-meeting.png',
  tasks: 'studio/untitled-video/09-task-board.png',
  members: 'studio/untitled-video/10-project-members.png',
  chat: 'studio/untitled-video/11-team-chat.png',
  performance: 'studio/untitled-video/12-performance.png',
  staff: 'studio/untitled-video/13-staff-control.png',
};
export type ShotName = keyof typeof SHOT;

// [x, y, w, h] in D units
export type Rect = [number, number, number, number];
export const CROP: Record<string, Rect> = {
  chatRow1: [322, 180, 500, 94], // Kavya Reddy
  chatRow2: [322, 274, 500, 94], // Ankit Mehta
  chatRow3: [322, 368, 500, 94], // Rohan Das
  chatRow4: [322, 462, 500, 94], // Meera Joshi
  chatRow5: [322, 556, 500, 94], // Arjun Nair
  alertCard: [1440, 106, 526, 188], // live WhatsApp alert
  desktopToast: [1428, 1108, 540, 110],
  dragCard: [1026, 408, 330, 140], // Ankit Mehta being dragged
  boardCols: [356, 204, 1612, 580],
  testPhone: [1510, 265, 425, 865],
  welcomeNode: [778, 168, 336, 300],
  readStat: [1332, 234, 306, 142],
  deliveredStat: [1008, 234, 306, 142],
  taskReview: [1212, 175, 354, 140], // approve card
  chatTask: [574, 382, 622, 122],
  perfRows: [362, 342, 1598, 460],
  salesTarget: [1574, 208, 386, 112],
  dashStats: [360, 216, 1602, 188],
  pipeTotal: [360, 598, 390, 116],
};

CROP.profilePanel = [1584, 0, 416, 760];
CROP.sequenceNode = [862, 862, 306, 162];
CROP.recipientsStat = [362, 234, 306, 142];
CROP.callsStat = [766, 208, 386, 112];
CROP.meetingsStat = [1170, 208, 386, 112];
CROP.staffToast = [1388, 1094, 572, 116];
CROP.chatThread = [476, 90, 1524, 440];

// ================= Full video (concept A "Glass Showroom") =================
export const AUDIO = {src: 'studio/untitled-video/waycrm-vo.mp3', dur: 63.4};
export const XFADE = 0.35; // each scene overlaps the next by this much

// Scene starts follow the voiceover sentences. `dur` in seconds; cues in seconds from the scene start.
export const SCENES = {
  hook: {start: 0, dur: 4.72}, // VO 0.10 "Customers message you…"
  meet: {start: 4.72, dur: 3.04}, // VO 4.77 "Meet WayCRM…"
  inbox: {start: 7.76, dur: 6.4}, // VO 7.83 "Every chat on your business number…"
  bots: {start: 14.16, dur: 7.0}, // VO 14.25 "Chatbots answer questions…"
  broadcast: {start: 21.16, dur: 4.84}, // VO 21.41 "…and broadcasts reach hundreds…"
  leads: {start: 26.0, dur: 8.12}, // VO 26.06 "Every lead from Facebook ads…"
  profile: {start: 34.12, dur: 7.28}, // VO 34.18 "Follow-ups, meetings…"
  team: {start: 41.4, dur: 5.8}, // VO 41.46 "Run your team's work…"
  perf: {start: 47.2, dur: 4.14}, // VO 47.27 "See every staff member's…"
  control: {start: 51.34, dur: 4.22}, // VO 51.41 "Control who sees what…"
  tagline: {start: 55.56, dur: 3.68}, // VO 55.62 "Reply faster…"
  cta: {start: 59.24, dur: 7.26}, // VO 59.31 "WayCRM by MagicBolt AI — book your free demo today." (hold after VO ends 63.15)
};
export type SceneKey = keyof typeof SCENES;
export const TOTAL = SCENES.cta.start + SCENES.cta.dur;

// VO word times (absolute) → cue relative to the scene start
const rel = <T extends Record<string, number>>(k: SceneKey, vo: T) => Object.fromEntries(Object.entries(vo).map(([n, v]) => [n, +(v - SCENES[k].start).toFixed(2)])) as T;
export const CUE = {
  hook: rel('hook', {kicker: 0.1, wa: 1.54, question: 2.89, slip: 3.38}),
  meet: rel('meet', {meet: 4.77, name: 5.2, by: 5.89, screen: 4.9}),
  inbox: rel('inbox', {screen: 7.8, ring: 8.06, title: 10.0, alert: 11.59, toast: 12.75}),
  bots: rel('bots', {title: 14.25, screen: 14.3, phone: 15.19, badge: 16.86, drip: 18.3}),
  broadcast: rel('broadcast', {title: 21.41, screen: 21.3, recipients: 22.42, delivered: 24.12, read: 25.02}),
  leads: rel('leads', {title: 26.06, src0: 26.99, src1: 28.24, src2: 29.0, into: 29.7, total: 30.35, board: 31.3, assigned: 31.54, move: 32.33}),
  profile: rel('profile', {title: 34.3, card: 34.2, i0: 34.18, i1: 34.89, i2: 35.66, i3: 36.52, i4: 37.19, i5: 37.76, tracked: 38.98}),
  team: rel('team', {title: 41.5, screen: 41.46, approve: 44.85, chat: 45.69}),
  perf: rel('perf', {title: 47.27, screen: 47.3, calls: 48.68, meetings: 49.28, sales: 49.97}),
  control: rel('control', {title: 51.41, screen: 51.4, toast: 52.1, ai: 53.33, answer: 54.44}),
  tagline: rel('tagline', {l0: 55.62, l1: 57.06, l2: 57.86}),
  cta: rel('cta', {name: 59.86, cta: 61.89}),
};

// Concept samples: 4 moments of MOMENT seconds each; samples are taken at SAMPLE_AT into each moment
export const MOMENT = 3;
export const MOMENTS = 4;
export const SAMPLE_AT = 2.3;
