// Animated background for V2: a dot-matrix world map in the dark, glowing routes with travelling dots, pulsing city nodes,
// a slow scan wave, drifting rings and sparks. One canvas behind everything; ~30 fps; pauses when the tab is hidden;
// a switch in the top bar turns the motion off (a still map stays). It never reads or changes any data.
const KEY = 'studio-v2-motion';
const LS = (v) => { try { if (v === undefined) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); } catch { /* ignore */ } return null; };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// very rough continent outlines in [longitude, latitude]; the dot grid turns them into a map
const LAND = [
  [[-168,66],[-162,70],[-141,70],[-125,70],[-95,72],[-82,69],[-80,62],[-93,59],[-86,55],[-80,52],[-78,58],[-70,60],[-62,57],[-56,52],[-66,45],[-70,42],[-76,38],[-81,31],[-80,26],[-83,29],[-90,30],[-97,27],[-97,21],[-90,21],[-87,21],[-88,16],[-83,15],[-83,9],[-79,9],[-77,8],[-80,7],[-85,10],[-92,14],[-105,20],[-110,24],[-112,29],[-115,30],[-110,23],[-117,32],[-122,37],[-124,42],[-125,49],[-135,58],[-150,60],[-160,58],[-166,60]],
  [[-73,78],[-60,82],[-30,83],[-20,80],[-20,70],[-40,60],[-50,62],[-55,70]],
  [[-77,8],[-72,12],[-62,11],[-52,5],[-50,0],[-45,-3],[-35,-5],[-35,-9],[-39,-14],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-41],[-65,-47],[-69,-52],[-72,-54],[-75,-47],[-73,-38],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-2],[-78,2]],
  [[-10,36],[-9,43],[-2,44],[-1,48],[4,52],[8,54],[9,57],[10,59],[5,62],[14,68],[22,70],[30,70],[40,67],[45,68],[60,69],[70,73],[80,73],[100,77],[113,74],[130,72],[140,72],[160,70],[180,68],[180,65],[170,60],[163,58],[156,51],[142,53],[140,47],[135,43],[130,42],[127,38],[126,35],[122,40],[121,37],[119,31],[122,30],[120,24],[110,21],[106,18],[109,12],[105,9],[101,13],[100,8],[103,1],[98,8],[98,16],[92,22],[89,22],[87,21],[80,15],[77,8],[73,17],[72,21],[67,24],[62,25],[57,26],[56,24],[59,22],[52,16],[43,13],[39,21],[35,28],[34,31],[36,36],[28,36],[26,40],[23,38],[20,40],[16,38],[12,38],[10,44],[3,43],[-2,37],[-6,36]],
  [[-17,21],[-16,28],[-10,30],[-6,35],[10,37],[11,33],[20,31],[32,31],[34,28],[38,20],[43,12],[51,12],[48,5],[40,-3],[40,-12],[35,-20],[33,-27],[27,-34],[19,-35],[15,-26],[12,-15],[13,-6],[9,4],[5,6],[-5,5],[-12,8],[-17,14]],
  [[114,-22],[122,-18],[130,-12],[137,-12],[141,-17],[146,-19],[153,-26],[151,-34],[146,-39],[138,-35],[131,-31],[124,-34],[115,-34],[113,-26]],
  [[-5,50],[1,51],[2,53],[-2,57],[-5,58],[-6,55],[-3,53]],
  [[130,31],[135,34],[141,36],[142,41],[140,43],[145,44],[141,45],[139,40],[135,36],[130,33]],
  [[95,5],[104,-2],[106,-6],[101,-3]], [[109,1],[117,7],[119,1],[116,-4],[110,-3]], [[172,-34],[178,-38],[174,-42],[167,-46],[171,-42]],
];
const CITIES = {mumbai: [72.9, 19.1], delhi: [77.2, 28.6], dubai: [55.3, 25.2], london: [-0.1, 51.5], newyork: [-74, 40.7], singapore: [103.8, 1.35], sydney: [151.2, -33.9], tokyo: [139.7, 35.7], saopaulo: [-46.6, -23.5], joburg: [28, -26]};
const ROUTES = [['mumbai', 'dubai'], ['mumbai', 'singapore'], ['delhi', 'london'], ['london', 'newyork'], ['dubai', 'joburg'], ['singapore', 'sydney'], ['tokyo', 'singapore'], ['newyork', 'saopaulo'], ['mumbai', 'delhi'], ['dubai', 'london']];

const inside = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };

let paused = false; // true while the AI or a render is working
let cv, ctx, W = 0, H = 0, dpr = 1, on = true, raf = 0, last = 0, t0 = 0, mx = 0, my = 0, px = 0, py = 0;
let map = {x: 0, y: 0, w: 0, h: 0}, dots = [], nodes = {}, routes = [], rings = [], sparks = [], waves = [], glints = [], layer = null, glow = null;

const proj = (lon, lat) => [map.x + ((lon + 180) / 360) * map.w, map.y + ((84 - lat) / 142) * map.h];
const rnd = (a, b) => a + Math.random() * (b - a);

const build = () => {
  map.w = Math.max(W * 1.06, 900); map.h = (map.w * 142) / 360; map.x = (W - map.w) / 2; map.y = Math.max(40, (H - map.h) * 0.55);
  const s = W < 700 ? 9 : 12; dots = [];
  for (let row = 0, y = map.y; y < map.y + map.h; y += s * 0.86, row++) for (let x = map.x + (row % 2 ? s / 2 : 0); x < map.x + map.w; x += s) {
    const lon = ((x - map.x) / map.w) * 360 - 180, lat = 84 - ((y - map.y) / map.h) * 142;
    if (LAND.some((p) => inside(p, lon, lat))) dots.push({x, y, k: Math.random()});
  }
  layer = document.createElement('canvas'); layer.width = Math.round(W * dpr); layer.height = Math.round(H * dpr);
  const lc = layer.getContext('2d'); lc.setTransform(dpr, 0, 0, dpr, 0, 0); lc.fillStyle = 'rgba(160,146,255,.30)'; lc.beginPath();
  for (const d of dots) { lc.moveTo(d.x + 1.3, d.y); lc.arc(d.x, d.y, 1.3, 0, 6.2832); }
  lc.fill();
  if (!glow) { glow = document.createElement('canvas'); glow.width = glow.height = 48; const g = glow.getContext('2d'), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, 'rgba(94,242,166,.36)'); gr.addColorStop(0.35, 'rgba(94,242,166,.11)'); gr.addColorStop(1, 'rgba(94,242,166,0)'); g.fillStyle = gr; g.fillRect(0, 0, 48, 48); }
  glints = Array.from({length: Math.min(16, dots.length)}, () => ({i: Math.floor(Math.random() * dots.length), p: rnd(0, 6.28), f: rnd(0.5, 1.4)}));
  nodes = Object.fromEntries(Object.entries(CITIES).map(([k, [lo, la]]) => [k, proj(lo, la)]));
  routes = ROUTES.map(([a, b], i) => {
    const [x1, y1] = nodes[a], [x2, y2] = nodes[b], mxp = (x1 + x2) / 2, myp = (y1 + y2) / 2, d = Math.hypot(x2 - x1, y2 - y1);
    return {x1, y1, x2, y2, cx: mxp - (y2 - y1) * 0.22, cy: myp - Math.abs(x2 - x1) * 0.18 - d * 0.1, period: rnd(7, 12), phase: i * 1.3, a, b};
  });
  rings = Array.from({length: W < 700 ? 4 : 7}, () => ({x: rnd(0, W), y: rnd(0, H), r: rnd(18, 52), vx: rnd(-0.12, 0.12), vy: rnd(-0.1, 0.1), rot: rnd(0, 6.28), vr: rnd(-0.002, 0.002), sides: [0, 6, 0, 3][Math.floor(rnd(0, 4))]}));
  sparks = Array.from({length: W < 700 ? 18 : 34}, () => ({x: rnd(0, W), y: rnd(0, H), r: rnd(0.8, 2.2), vy: rnd(-0.18, -0.04), vx: rnd(-0.05, 0.05), p: rnd(0, 6.28), c: Math.random() > 0.7 ? '94,242,166' : '169,155,255'}));
};

const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.25); W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = `${W}px`; cv.style.height = `${H}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); build(); frame(performance.now(), true); };

const bez = (r, t) => { const u = 1 - t; return [u * u * r.x1 + 2 * u * t * r.cx + t * t * r.x2, u * u * r.y1 + 2 * u * t * r.cy + t * t * r.y2]; };
const poly = (x, y, r, n, rot) => { ctx.beginPath(); for (let i = 0; i <= n; i++) { const a = rot + (i * 6.2832) / n; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); };

function frame(now, still = false) {
  const t = (now - t0) / 1000;
  px += (mx - px) * 0.04; py += (my - py) * 0.04; // gentle pointer parallax
  const ox = px * 10, oy = py * 6;
  ctx.clearRect(0, 0, W, H);

  // the map: drawn once into a layer, then only moved a little with the pointer
  ctx.drawImage(layer, ox, oy, W, H);
  if (!still) {
    // a scan wave brightens the dots it passes over (three brightness levels, one path each)
    for (const w of waves) {
      const buckets = [[], [], []];
      for (const d of dots) { const dx = d.x - w.x, dy = d.y - w.y, dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - w.r); if (dist < 36) buckets[dist < 12 ? 2 : dist < 24 ? 1 : 0].push(d); }
      buckets.forEach((b, k) => { if (!b.length) return; ctx.fillStyle = `rgba(190,182,255,${(0.1 + k * 0.08) * (1 - w.r / 800)})`; ctx.beginPath(); for (const d of b) { ctx.moveTo(d.x + ox + 1.9, d.y + oy); ctx.arc(d.x + ox, d.y + oy, 1.9, 0, 6.2832); } ctx.fill(); });
    }
    ctx.fillStyle = 'rgba(94,242,166,.32)'; ctx.beginPath(); // a few dots glint now and then
    for (const g of glints) { if (Math.sin(t * g.f + g.p) > 0.96) { const d = dots[g.i]; ctx.moveTo(d.x + ox + 1.9, d.y + oy); ctx.arc(d.x + ox, d.y + oy, 1.9, 0, 6.2832); } }
    ctx.fill();
  }

  // routes: a faint dashed arc and a glowing dot with a short trail
  ctx.lineWidth = 1; ctx.setLineDash([3, 6]);
  for (const r of routes) { ctx.strokeStyle = 'rgba(139,124,255,.16)'; ctx.beginPath(); ctx.moveTo(r.x1 + ox, r.y1 + oy); ctx.quadraticCurveTo(r.cx + ox, r.cy + oy, r.x2 + ox, r.y2 + oy); ctx.stroke(); }
  ctx.setLineDash([]);
  if (!still) for (const r of routes) {
    const k = ((t + r.phase) % r.period) / r.period, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [x, y] = bez(r, e), [bx, by] = bez(r, Math.max(0, e - 0.05)), [nx, ny] = bez(r, Math.min(1, e + 0.01));
    const tg = ctx.createLinearGradient(bx + ox, by + oy, x + ox, y + oy); tg.addColorStop(0, 'rgba(94,242,166,0)'); tg.addColorStop(1, 'rgba(94,242,166,.3)');
    ctx.strokeStyle = tg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + ox, by + oy); ctx.lineTo(x + ox, y + oy); ctx.stroke();
    ctx.drawImage(glow, x + ox - 15, y + oy - 15, 30, 30);
    const a = Math.atan2(ny - y, nx - x); ctx.save(); ctx.translate(x + ox, y + oy); ctx.rotate(a); ctx.fillStyle = 'rgba(200,206,240,.46)';
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-1, -2); ctx.lineTo(-3, -6); ctx.lineTo(-4.5, -6); ctx.lineTo(-3.5, -1.6); ctx.lineTo(-6, -1.2); ctx.lineTo(-7, -3.4); ctx.lineTo(-8, -3.4); ctx.lineTo(-7.4, 0);
    ctx.lineTo(-8, 3.4); ctx.lineTo(-7, 3.4); ctx.lineTo(-6, 1.2); ctx.lineTo(-3.5, 1.6); ctx.lineTo(-4.5, 6); ctx.lineTo(-3, 6); ctx.lineTo(-1, 2); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // city nodes with a slow pulse
  Object.values(nodes).forEach(([x, y], i) => {
    ctx.fillStyle = 'rgba(94,242,166,.5)'; ctx.beginPath(); ctx.arc(x + ox, y + oy, 2.4, 0, 6.2832); ctx.fill();
    if (!still) { const p = ((t * 0.5 + i * 0.37) % 1); ctx.strokeStyle = `rgba(94,242,166,${0.22 * (1 - p)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x + ox, y + oy, 3 + p * 18, 0, 6.2832); ctx.stroke(); }
  });

  if (still) return;
  // drifting rings / hexagons / triangles and sparks (they cross the whole screen, in front of the map)
  for (const r of rings) {
    r.x += r.vx; r.y += r.vy; r.rot += r.vr;
    if (r.x < -80) r.x = W + 80; if (r.x > W + 80) r.x = -80; if (r.y < -80) r.y = H + 80; if (r.y > H + 80) r.y = -80;
    ctx.strokeStyle = 'rgba(169,155,255,.1)'; ctx.lineWidth = 1.3;
    if (r.sides) poly(r.x, r.y, r.r, r.sides, r.rot); else { ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.2832); }
    ctx.stroke();
  }
  for (const s of sparks) {
    s.x += s.vx; s.y += s.vy; if (s.y < -10) { s.y = H + 10; s.x = rnd(0, W); }
    const a = 0.1 + 0.16 * Math.sin(t * 1.2 + s.p); ctx.fillStyle = `rgba(${s.c},${Math.max(0.05, a)})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
  }
  waves = waves.filter((w) => w.r < 760); for (const w of waves) w.r += 1.6;
  if (!waves.length || (now - last > 0 && Math.random() < 0.0035 && waves.length < 2)) { const c = Object.values(nodes)[Math.floor(rnd(0, 10))]; waves.push({x: c[0], y: c[1], r: 0}); }
}

const loop = (now) => { raf = requestAnimationFrame(loop); if (now - last < 40) return; last = now; frame(now); };
const start = () => { cancelAnimationFrame(raf); if (on && !paused && !reduced()) { t0 = t0 || performance.now(); raf = requestAnimationFrame(loop); } else frame(performance.now(), true); };

export const motionOn = () => on;
export const motionPaused = () => on && paused;
export const pauseForWork = (v) => { v = !!v; if (v === paused) return false; paused = v; if (cv) start(); return true; };
export const setMotion = (v) => { on = !!v; LS(on ? '1' : '0'); start(); };
export const initBackground = () => {
  cv = document.getElementById('bgfx');
  if (!cv) return;
  ctx = cv.getContext('2d');
  on = LS() === null ? !reduced() : LS() === '1';
  t0 = performance.now();
  size();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); start(); }, 150); });
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, {passive: true});
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else start(); });
  start();
};
