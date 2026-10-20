import * as THREE from 'three';

// ---------- 3D background ----------
const COLORS = [0xf0428d, 0xffc61a, 0x7b3ff2, 0x2b7bff, 0xff7a3d, 0x19c37d];
const FOV = 40, CAM_Z = 14;
let Ws = 9, Hs = 5;

const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

// Each formation keeps the shapes around the edges so the slide text stays clear.
const FORMS = {
  frame(o, t) {
    const p = ((o.u + t * 0.006) % 1) * 4, side = Math.floor(p), f = (p - side) * 2 - 1;
    const x = Ws * (0.9 + 0.1 * o.r1), y = Hs * (0.88 + 0.12 * o.r2);
    return side === 0 ? [f * x, y] : side === 1 ? [x, -f * y] : side === 2 ? [-f * x, -y] : [-x, f * y];
  },
  sides(o, t) {
    return [(o.i % 2 ? 1 : -1) * Ws * (0.88 + 0.14 * o.r1), (((o.r2 + t * 0.015 * (0.5 + o.r3)) % 1) * 2 - 1) * Hs * 1.15];
  },
  corners(o, t) {
    const c = o.i % 4, a = o.r1 * 6.283 + t * 0.25, r = 0.5 + 1.6 * o.r2;
    return [(c % 2 ? 1 : -1) * Ws * 0.9 + Math.cos(a) * r, (c < 2 ? 1 : -1) * Hs * 0.86 + Math.sin(a) * r];
  },
  topbot(o, t) {
    return [(((o.u * 2 + t * 0.012) % 1) * 2 - 1) * Ws * 1.05, (o.i % 2 ? 1 : -1) * Hs * (0.9 + 0.1 * o.r1)];
  },
  ring(o, t) {
    const a = o.u * 6.283 + t * 0.09;
    return [Math.cos(a) * Ws * 0.95, Math.sin(a) * Hs * 0.93];
  },
  burst(o, t) {
    const a = o.r1 * 6.283 + t * 0.04, r = 0.86 + 0.2 * o.r2;
    return [Math.cos(a) * Ws * r, Math.sin(a) * Hs * r];
  },
  wave(o, t) {
    const x = (o.u * 2 - 1) * Ws * 1.05;
    return [x, -Hs * 0.92 + Math.sin(x * 0.7 + t * 0.9) * 0.45];
  },
};

export function initShapes(canvas, slides, state) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAM_Z;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9c8ff, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(4, 8, 10);
  scene.add(sun);

  const geos = [
    new THREE.IcosahedronGeometry(1, 0), new THREE.TorusGeometry(0.8, 0.32, 20, 48), new THREE.SphereGeometry(0.9, 32, 24),
    new THREE.OctahedronGeometry(1, 0), new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.ConeGeometry(0.8, 1.5, 5),
    new THREE.TorusKnotGeometry(0.6, 0.22, 90, 14), new THREE.CylinderGeometry(0.8, 0.8, 0.25, 40),
  ];
  const mats = COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.05 }));
  const N = 26;
  const objs = [];
  for (let i = 0; i < N; i++) {
    const mesh = new THREE.Mesh(geos[i % geos.length], mats[i % mats.length]);
    const o = { i, u: i / N, r1: rnd(), r2: rnd(), r3: rnd(), mesh, x: 0, y: 0, z: -3 + rnd() * 3.5, s: 0.14 + rnd() * 0.22 };
    o.x = (rnd() * 2 - 1) * 12; o.y = (rnd() * 2 - 1) * 8;
    mesh.rotation.set(rnd() * 6, rnd() * 6, 0);
    mesh.scale.setScalar(o.s);
    scene.add(mesh);
    objs.push(o);
  }

  // extruded lightning bolt, shown on the title, bundle and closing slides
  const sh = new THREE.Shape();
  [[0.3, 1.6], [-0.7, -0.1], [-0.05, -0.1], [-0.35, -1.6], [0.75, 0.25], [0.1, 0.25], [0.55, 1.6]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const boltGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.09, bevelSegments: 4 });
  boltGeo.center();
  const bolt = new THREE.Mesh(boltGeo, new THREE.MeshStandardMaterial({ color: 0xffc61a, roughness: 0.25, metalness: 0.1, emissive: 0xff7a3d, emissiveIntensity: 0.25 }));
  bolt.scale.setScalar(0.001);
  scene.add(bolt);
  const b = { x: 0, y: 0, s: 0 };

  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    // half extents of the 16:9 stage at z = 0
    const H = Math.tan((FOV * Math.PI) / 360) * CAM_Z, W = H * camera.aspect;
    if (camera.aspect > 16 / 9) { Hs = H; Ws = (H * 16) / 9; } else { Ws = W; Hs = (W * 9) / 16; }
  };

  let last = performance.now(), first = true;
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000;
    last = now;
    const form = FORMS[slides[Math.max(state.cur, 0)].form] || FORMS.frame;
    const ease = first ? 1 : 1 - Math.exp(-dt * 2.4); // first frame snaps into place
    first = false;
    state.kick *= Math.exp(-dt * 2);
    for (const o of objs) {
      const [tx, ty] = form(o, t);
      o.x += (tx - o.x) * ease; o.y += (ty - o.y) * ease;
      o.mesh.position.set(o.x, o.y + Math.sin(t * (0.6 + o.r3) + o.r1 * 6) * 0.18, o.z);
      const sp = dt * (0.25 + o.r2 * 0.5 + state.kick * 5);
      o.mesh.rotation.x += sp; o.mesh.rotation.y += sp * 0.8;
    }
    const bt = slides[Math.max(state.cur, 0)].bolt;
    b.x += ((bt ? bt[0] * Ws : b.x) - b.x) * ease; b.y += ((bt ? bt[1] * Hs : b.y) - b.y) * ease; b.s += ((bt ? bt[2] : 0) - b.s) * ease;
    bolt.position.set(b.x, b.y + Math.sin(t * 1.2) * 0.2, 0);
    bolt.rotation.y = Math.sin(t * 0.7) * 0.7 + state.kick * 6;
    bolt.rotation.z = Math.sin(t * 0.5) * 0.08;
    bolt.scale.setScalar(Math.max(0.001, b.s));
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  resize();
  requestAnimationFrame(frame);
  return { resize };
}
