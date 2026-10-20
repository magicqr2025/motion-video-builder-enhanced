import * as THREE from 'three';

// Night theme background: thousands of points of light (each one a local business coming online)
// that regroup into a different figure on every slide.
const N = 5200;
const FOV = 40, CAM_Z = 14;
const COLORS = [0x35c8ff, 0xffc83d, 0xff8a2b, 0xff5ca8, 0x9b7bff, 0xffffff];
const BOLT = [[0.3, 1.6], [-0.7, -0.1], [-0.05, -0.1], [-0.35, -1.6], [0.75, 0.25], [0.1, 0.25], [0.55, 1.6]];

const rnd = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;

const inPoly = (x, y, p) => {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if ((p[i][1] > y) !== (p[j][1] > y) && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) inside = !inside;
  }
  return inside;
};

// Each figure returns [x, y, z] for particle i.
const FIGURES = {
  globe: (i) => {
    const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), a = i * 2.39996;
    return [Math.cos(a) * r * 3.3, y * 3.3, Math.sin(a) * r * 3.3];
  },
  rings: (i) => {
    const k = i % 3, a = rnd() * 6.283, r = 2.1 + k * 0.85 + gauss() * 0.07;
    return [Math.cos(a) * r, (k - 1) * 0.55 + gauss() * 0.05, Math.sin(a) * r];
  },
  city: (() => {
    const blocks = [];
    for (let gx = -6; gx <= 6; gx++) for (let gz = -6; gz <= 6; gz++) {
      const d = Math.hypot(gx, gz) / 8.5;
      blocks.push([gx * 0.55, gz * 0.55, 0.4 + rnd() * 3.6 * (1 - d) * (rnd() > 0.25 ? 1 : 0.3)]);
    }
    return (i) => {
      const [bx, bz, h] = blocks[i % blocks.length];
      const side = rnd() > 0.5 ? 1 : -1, face = rnd() > 0.5;
      return [bx + (face ? side * 0.19 : (rnd() - 0.5) * 0.38), -2.4 + Math.floor(rnd() * h * 6) / 6, bz + (face ? (rnd() - 0.5) * 0.38 : side * 0.19)];
    };
  })(),
  bars: (i) => {
    const k = i % 7, h = 0.9 + k * 0.62;
    return [(k - 3) * 1.0 + (rnd() - 0.5) * 0.62, -2.4 + rnd() * h, (rnd() - 0.5) * 0.62];
  },
  wave: (i) => {
    const gx = (i % 72) / 71 - 0.5, gz = Math.floor(i / 72) / 72 - 0.5;
    const x = gx * 9, z = gz * 9;
    return [x, Math.sin(x * 1.25) * Math.cos(z * 1.25) * 0.7 - 1.1, z];
  },
  bolt: () => {
    let x, y;
    do { x = rnd() * 1.6 - 0.8; y = rnd() * 3.4 - 1.7; } while (!inPoly(x, y, BOLT));
    return [x * 1.95, y * 1.95, (rnd() - 0.5) * 0.5];
  },
  net: (() => {
    const hubs = Array.from({ length: 11 }, () => [gauss() * 3.4, gauss() * 2.6, gauss() * 2.2]);
    return (i) => {
      const h = hubs[i % hubs.length];
      if (i % 5 === 0) { const g = hubs[(i * 7) % hubs.length], t = rnd(); return [h[0] + (g[0] - h[0]) * t, h[1] + (g[1] - h[1]) * t, h[2] + (g[2] - h[2]) * t]; }
      return [h[0] + gauss() * 0.45, h[1] + gauss() * 0.45, h[2] + gauss() * 0.45];
    };
  })(),
  helix: (i) => {
    const t = rnd() * 6.8 - 3.4, strand = i % 2;
    if (i % 6 === 0) { const a = Math.round(t * 3) / 3 * 2.2, k = rnd() * 2 - 1; return [Math.cos(a) * 1.5 * k, Math.round(t * 3) / 3, Math.sin(a) * 1.5 * k]; }
    const a = t * 2.2 + strand * Math.PI;
    return [Math.cos(a) * 1.5 + gauss() * 0.05, t, Math.sin(a) * 1.5 + gauss() * 0.05];
  },
};
// which figure each slide formation name maps to
const BY_FORM = { burst: 'bolt', frame: 'city', ring: 'rings', sides: 'wave', corners: 'globe', topbot: 'net', wave: 'bars' };

export function initLights(canvas, slides, state) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAM_Z;

  const targets = {};
  for (const name in FIGURES) {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) arr.set(FIGURES[name](i), i * 3);
    targets[name] = arr;
  }

  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    pos.set([gauss() * 9, gauss() * 6, gauss() * 5], i * 3);
    c.setHex(COLORS[Math.floor(rnd() * rnd() * COLORS.length)]);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  // soft round sprite so every point glows
  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const g = dot.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.13, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  const group = new THREE.Group();
  group.add(points);
  group.rotation.x = 0.28;
  scene.add(group);

  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

  let halfW = 9;
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    halfW = Math.tan((FOV * Math.PI) / 360) * CAM_Z * Math.min(camera.aspect, 16 / 9);
  };

  let last = performance.now(), shown = -1, first = true, gx = 0;
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000;
    last = now;
    const slide = slides[Math.max(state.cur, 0)];
    const target = targets[BY_FORM[slide.form] || 'globe'];
    // on a slide change the lights scatter, then settle into the new figure
    if (shown !== state.cur && !first) for (let i = 0; i < N * 3; i++) pos[i] += gauss() * 1.6;
    shown = state.cur;
    const ease = first ? 1 : 1 - Math.exp(-dt * 2.6);
    first = false;
    for (let i = 0; i < N * 3; i++) pos[i] += (target[i] - pos[i]) * ease;
    geo.attributes.position.needsUpdate = true;
    state.kick *= Math.exp(-dt * 2);
    // centred slides keep the figure in the middle; the rest push it to the right, behind the content edge
    const wantX = (slide.cls || '').includes('mid') ? 0 : halfW * 0.46;
    gx += (wantX - gx) * (ease === 1 ? 1 : 1 - Math.exp(-dt * 2));
    group.position.x = gx;
    group.rotation.y = t * 0.1 + mouse.x * 0.5 + state.kick * 1.2;
    group.rotation.x = 0.28 + mouse.y * 0.25;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  resize();
  requestAnimationFrame(frame);
  return { resize };
}
