// The 3D toy city (three.js). Everything is driven by `t` = global seconds, passed in as a prop
// because React context does not cross into the canvas.
import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {P, cl, eb, eo, lerp} from '../components/kit';
import {S3, S4, S5, S6, SHOPS, T, W} from './config';
import {CELL, FOV, HQ_H, applyCam, camAt, shopPos} from './cam';

const R = 13; // ground radius
const BUILD_AT = T.s2 + 0.15;
const RINGS_AT = T.s3 + S3.searchAt;
export const PIN_AT = T.s4 + S4.pinAt;
const HQ_AT = T.s5 + S5.hqAt;
const ARCS_AT = T.s6 + S6.arcsAt;
// when shop i becomes a client (its line reaches the agency)
export const linkedAt = (i: number) => ARCS_AT + i * S6.arcGap + 0.7;

const rnd = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const PASTEL = ['#8F74FF', '#FF7DB4', '#FFBE3D', '#5FB8FF', '#5FDDA6', '#FF9670', '#F4F0FF'];

// ---------- layout: every grid cell is a shop, a building, a park, or the plaza ----------
type Bld = {x: number; z: number; w: number; h: number; d: number; c: string; delay: number};
const BUILDINGS: Bld[] = [];
const TREES: {x: number; z: number; s: number; delay: number}[] = [];
for (let i = -3; i <= 3; i++) {
  for (let j = -3; j <= 3; j++) {
    const r = Math.hypot(i, j);
    if (r === 0 || r * CELL > R - 2.2) continue;
    if (SHOPS.some((s) => s.cell[0] === i && s.cell[1] === j)) continue;
    const n = rnd(i * 7.3 + j * 13.7 + 5), x = i * CELL, z = j * CELL, delay = r * 0.16;
    if (i === 0 && j === 1) continue; // open path in front of the plaza
    if ((j >= 2 && Math.abs(i) <= 1) || (j === 0 && Math.abs(i) === 1)) {
      // parks: keep the middle of the city open so the camera sees the plaza
      for (let k = 0; k < 4; k++) TREES.push({x: x + (rnd(n + k) - 0.5) * 2, z: z + (rnd(n + k * 3.1) - 0.5) * 2, s: 0.8 + rnd(n * k + 2) * 0.6, delay: delay + k * 0.05});
      continue;
    }
    BUILDINGS.push({x, z, w: 1.9 + n * 0.5, d: 1.9 + rnd(n * 9) * 0.5, h: j < 0 ? 2.4 + n * 3.6 : 1.3 + n * 1.5, c: PASTEL[Math.floor(rnd(n * 31) * PASTEL.length)], delay});
  }
}

// shared geometry / materials
const WIN_GEO = new THREE.BoxGeometry(0.42, 0.42, 0.05);
const WIN_MAT = new THREE.MeshPhysicalMaterial({color: '#CDE9FF', roughness: 0.05, metalness: 0.35, clearcoat: 1});
const WHITE = new THREE.MeshPhysicalMaterial({color: '#FFFFFF', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25});
const GOLD = new THREE.MeshPhysicalMaterial({color: W.yellow, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15});
const LEAF = new THREE.MeshPhysicalMaterial({color: '#2FD277', roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3});
const TRUNK = new THREE.MeshStandardMaterial({color: '#B98A5A', roughness: 0.8});
const SPHERE = new THREE.SphereGeometry(1, 24, 16);

// window grid on the front and both sides of a box
const Windows: React.FC<{w: number; h: number; d: number; cols?: number}> = ({w, h, d, cols = 2}) => {
  const floors = Math.max(1, Math.floor((h - 0.5) / 0.8));
  const out: React.ReactNode[] = [];
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const y = 0.65 + f * 0.8, u = (c - (cols - 1) / 2) * 0.72;
      out.push(<mesh key={`f${f}${c}`} geometry={WIN_GEO} material={WIN_MAT} position={[u, y, d / 2 + 0.01]} />);
      out.push(<mesh key={`l${f}${c}`} geometry={WIN_GEO} material={WIN_MAT} position={[-w / 2 - 0.01, y, u]} rotation={[0, Math.PI / 2, 0]} />);
      out.push(<mesh key={`r${f}${c}`} geometry={WIN_GEO} material={WIN_MAT} position={[w / 2 + 0.01, y, u]} rotation={[0, Math.PI / 2, 0]} />);
    }
  }
  return <>{out}</>;
};

// pop a group out of the ground
const popScale = (k: number): [number, number, number] => [lerp(0.6, 1, eo(k)), Math.max(0.001, eb(k, 1.4)), lerp(0.6, 1, eo(k))];

const Building: React.FC<{b: Bld; t: number}> = ({b, t}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(b.w, b.h, b.d, 3, 0.16), [b]);
  const k = P(t, BUILD_AT + b.delay, 0.6);
  if (k <= 0) return null;
  return (
    <group position={[b.x, 0, b.z]} scale={popScale(k)}>
      <mesh geometry={geo} position={[0, b.h / 2, 0]} castShadow receiveShadow><meshPhysicalMaterial color={b.c} roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.18} /></mesh>
      <mesh position={[0, b.h + 0.06, 0]} material={WHITE} castShadow><boxGeometry args={[b.w * 0.8, 0.14, b.d * 0.8]} /></mesh>
      <Windows w={b.w} h={b.h} d={b.d} />
    </group>
  );
};

const Tree: React.FC<{x: number; z: number; s: number; k: number}> = ({x, z, s, k}) => k <= 0 ? null : (
  <group position={[x, 0, z]} scale={s * eb(k, 2)}>
    <mesh position={[0, 0.25, 0]} material={TRUNK}><cylinderGeometry args={[0.07, 0.1, 0.5, 8]} /></mesh>
    <mesh geometry={SPHERE} material={LEAF} position={[0, 0.8, 0]} scale={0.48} castShadow />
    <mesh geometry={SPHERE} material={LEAF} position={[0.22, 0.58, 0.1]} scale={0.3} castShadow />
  </group>
);

// A local shop: striped awning, sign, and a little bar chart on the roof that only grows once it is a client
const SHOP_GEO = new RoundedBoxGeometry(2.3, 1.5, 2, 3, 0.14);
const Shop: React.FC<{i: number; t: number}> = ({i, t}) => {
  const s = SHOPS[i], [x, , z] = shopPos(i);
  const k = P(t, BUILD_AT + 0.25 + i * 0.12, 0.6);
  if (k <= 0) return null;
  const grow = eo(P(t, linkedAt(i), 0.9));
  const bump = Math.sin(Math.PI * P(t, linkedAt(i), 0.5)) * 0.12; // little hop when it becomes a client
  return (
    <group position={[x, bump * 3, z]} scale={popScale(k).map((v) => v * (1 + bump)) as [number, number, number]}>
      <mesh geometry={SHOP_GEO} material={WHITE} position={[0, 0.75, 0]} castShadow receiveShadow />
      {/* sign board */}
      <mesh position={[0, 1.72, 0]} castShadow><boxGeometry args={[2.4, 0.46, 2.1]} /><meshPhysicalMaterial color={s.color} roughness={0.3} clearcoat={1} /></mesh>
      {/* awning stripes */}
      {[0, 1, 2, 3, 4].map((n) => (
        <mesh key={n} position={[(n - 2) * 0.46, 1.32, 1.22]} rotation={[0.55, 0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.09, 0.72]} />
          {n % 2 ? <meshStandardMaterial color="#FFFFFF" roughness={0.5} /> : <meshStandardMaterial color={s.color} roughness={0.4} />}
        </mesh>
      ))}
      {/* door + window */}
      <mesh position={[-0.55, 0.5, 1.01]}><boxGeometry args={[0.55, 1, 0.05]} /><meshStandardMaterial color={s.color} roughness={0.4} /></mesh>
      <mesh position={[0.45, 0.62, 1.01]}><boxGeometry args={[0.85, 0.62, 0.05]} /><meshStandardMaterial color="#9ED8FF" roughness={0.15} /></mesh>
      {/* roof chart: flat and struggling, then rising */}
      {[0, 1, 2].map((n) => {
        const flat = 0.16 + 0.07 * Math.sin(t * 3 + n * 1.3 + i);
        const h = lerp(flat, 0.55 + n * 0.5, grow);
        return (
          <mesh key={n} position={[(n - 1) * 0.5, 1.95 + h / 2, 0]} castShadow>
            <boxGeometry args={[0.34, h, 0.34]} />
            <meshPhysicalMaterial color={grow > 0.05 ? W.green : '#C9C3E3'} roughness={0.3} clearcoat={1} />
          </mesh>
        );
      })}
    </group>
  );
};

// Radar pulses: each shop is searching for help
const RING_GEO = new THREE.RingGeometry(0.9, 1, 64);
const Ring: React.FC<{x: number; z: number; r: number; a: number; c: string}> = ({x, z, r, a, c}) => a <= 0.01 ? null : (
  <mesh geometry={RING_GEO} position={[x, 0.06, z]} rotation={[-Math.PI / 2, 0, 0]} scale={r}>
    <meshBasicMaterial color={c} transparent opacity={a} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>
);
const Rings: React.FC<{t: number}> = ({t}) => {
  const on = eo(P(t, RINGS_AT, 0.4)) * (1 - P(t, PIN_AT + 0.3, 0.5));
  const land = P(t, PIN_AT + 0.25, 1.3); // shockwave when the pin lands
  return (
    <>
      {on > 0 && SHOPS.map((s, i) => [0, 1, 2].map((j) => {
        const k = ((t - RINGS_AT) * 0.75 + j / 3 + i * 0.13) % 1;
        const [x, , z] = shopPos(i);
        return <Ring key={`${i}${j}`} x={x} z={z} r={1.3 + 3.4 * k} a={on * (1 - k) * 0.85} c={s.color} />;
      }))}
      {land > 0 && land < 1 && [0, 1].map((j) => {
        const k = cl(land * 1.3 - j * 0.22);
        return <Ring key={j} x={0} z={0} r={0.5 + 10 * eo(k)} a={(1 - k) * 0.9} c={j ? W.yellow : W.pink} />;
      })}
    </>
  );
};

// The "you are here" pin: a glossy teardrop that drops onto the plaza
const PIN_R = 0.78, PIN_H = 1.95;
const PIN_GEO = (() => {
  const a = Math.asin(PIN_R / PIN_H), pts = [new THREE.Vector2(0, 0)];
  for (let n = 0; n <= 24; n++) { const f = -a + ((Math.PI / 2 + a) * n) / 24; pts.push(new THREE.Vector2(PIN_R * Math.cos(f), PIN_H + PIN_R * Math.sin(f))); }
  return new THREE.LatheGeometry(pts, 48);
})();
const bounce = (x: number) => { // easeOutBounce
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};
// height of the pin's tip above the ground at time t (also used by the 2D label)
export const pinY = (t: number) => {
  const drop = bounce(P(t, PIN_AT, 0.7));
  const base = 0.12 + (HQ_H + 0.3) * eb(P(t, HQ_AT, 0.9), 1.2) * (t > HQ_AT ? 1 : 0);
  return base + 12 * (1 - drop) + (t > PIN_AT + 1 ? 0.14 * Math.sin((t - PIN_AT) * 2.6) + 0.14 : 0);
};
const Pin: React.FC<{t: number}> = ({t}) => {
  if (t < PIN_AT) return null;
  const {pos} = camAt(t);
  const squash = Math.sin(Math.PI * P(t, PIN_AT + 0.22, 0.3)) * 0.18;
  return (
    <group position={[0, pinY(t), 0]} rotation={[0, Math.atan2(pos[0], pos[2]), 0]} scale={[1 + squash, 1 - squash, 1 + squash]}>
      <mesh geometry={PIN_GEO} castShadow><meshPhysicalMaterial color={W.pink} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
      <mesh position={[0, PIN_H, 0]} rotation={[Math.PI / 2, 0, 0]} material={WHITE}><cylinderGeometry args={[0.33, 0.33, PIN_R * 2 - 0.04, 32]} /></mesh>
    </group>
  );
};

// The agency building that rises on the plaza
const HQ_GEO = new RoundedBoxGeometry(2.7, HQ_H, 2.7, 4, 0.22);
const Hq: React.FC<{t: number}> = ({t}) => {
  const k = P(t, HQ_AT, 0.9);
  if (k <= 0) return null;
  return (
    <group scale={popScale(k)}>
      <mesh position={[0, 0.12, 0]} material={GOLD} castShadow receiveShadow><cylinderGeometry args={[2.25, 2.4, 0.24, 48]} /></mesh>
      <mesh geometry={HQ_GEO} position={[0, HQ_H / 2 + 0.2, 0]} castShadow receiveShadow><meshPhysicalMaterial color={W.blue} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
      <mesh position={[0, HQ_H + 0.28, 0]} material={GOLD} castShadow><boxGeometry args={[2.9, 0.2, 2.9]} /></mesh>
      <group position={[0, 0.3, 0]}><Windows w={2.7} h={HQ_H} d={2.7} cols={3} /></group>
    </group>
  );
};

// Client lines from each shop to the agency, with coins travelling along them
const Arc: React.FC<{i: number; t: number}> = ({i, t}) => {
  const curve = useMemo(() => {
    const [x, , z] = shopPos(i);
    return new THREE.QuadraticBezierCurve3(new THREE.Vector3(x, 2.4, z), new THREE.Vector3(x * 0.5, 7.2, z * 0.5), new THREE.Vector3(0, HQ_H + 0.6, 0));
  }, [i]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.075, 8, false), [curve]);
  const k = eo(P(t, ARCS_AT + i * S6.arcGap, 0.7));
  if (k <= 0) return null;
  geo.setDrawRange(0, Math.floor(48 * k) * 8 * 6);
  return (
    <>
      <mesh geometry={geo}><meshBasicMaterial color={SHOPS[i].color} /></mesh>
      {k >= 1 && [0, 1, 2].map((n) => {
        const u = ((t - ARCS_AT) * 0.55 + n / 3 + i * 0.17) % 1, p = curve.getPoint(u);
        return <mesh key={n} geometry={SPHERE} material={GOLD} position={[p.x, p.y, p.z]} scale={0.2 * Math.min(1, Math.sin(Math.PI * u) * 4)} />;
      })}
    </>
  );
};

const Rig: React.FC<{t: number}> = ({t}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // layout effect: must run before Remotion's frame renderer draws this frame
  useLayoutEffect(() => { applyCam(camera, t); }, [camera, t]);
  return null;
};

// Soft studio reflections so the clear-coated surfaces actually look glossy
const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = 0.2;
    return () => { scene.environment = null; tex.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
};

const ROADS = [-3, -2, -1, 0, 1, 2].map((n) => (n + 0.5) * CELL);

const Scene: React.FC<{t: number}> = ({t}) => {
  const land = eo(P(t, BUILD_AT - 0.3, 0.7));
  return (
    <>
      <Rig t={t} />
      <Env />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={['#FFFFFF', '#CDB8FF', 0.42]} />
      <directionalLight position={[11, 22, 13]} intensity={1.55} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}
        shadow-camera-left={-17} shadow-camera-right={17} shadow-camera-top={17} shadow-camera-bottom={-17} shadow-camera-near={1} shadow-camera-far={70} />
      <directionalLight position={[-14, 8, -10]} intensity={0.7} color="#FF9CCB" />
      {/* island */}
      <group scale={[land, 1, land]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[R, R, 0.6, 96]} /><meshStandardMaterial color="#F6F2FF" roughness={0.7} /></mesh>
        <mesh position={[0, -0.9, 0]}><cylinderGeometry args={[R + 0.45, R + 0.2, 0.7, 96]} /><meshPhysicalMaterial color={W.purple} roughness={0.3} clearcoat={1} /></mesh>
        {ROADS.map((x) => { const len = 2 * Math.sqrt(R * R - x * x) - 0.6; return (
          <React.Fragment key={x}>
            <mesh position={[x, 0.01, 0]} receiveShadow><boxGeometry args={[0.62, 0.02, len]} /><meshStandardMaterial color="#DDD4F6" roughness={0.8} /></mesh>
            <mesh position={[0, 0.012, x]} receiveShadow><boxGeometry args={[len, 0.02, 0.62]} /><meshStandardMaterial color="#DDD4F6" roughness={0.8} /></mesh>
          </React.Fragment>
        ); })}
        <mesh position={[0, 0.03, 0]} receiveShadow><cylinderGeometry args={[2.1, 2.1, 0.06, 48]} /><meshStandardMaterial color="#FFE0EE" roughness={0.6} /></mesh>
      </group>
      {BUILDINGS.map((b, i) => <Building key={i} b={b} t={t} />)}
      {TREES.map((tr, i) => <Tree key={i} x={tr.x} z={tr.z} s={tr.s} k={P(t, BUILD_AT + 0.3 + tr.delay, 0.5)} />)}
      {SHOPS.map((_, i) => <Shop key={i} i={i} t={t} />)}
      <Rings t={t} />
      <Hq t={t} />
      <Pin t={t} />
      {SHOPS.map((_, i) => <Arc key={i} i={i} t={t} />)}
    </>
  );
};

export const City: React.FC<{t: number}> = ({t}) => (
  <ThreeCanvas width={1080} height={1920} shadows flat style={{position: 'absolute', left: 0, top: 0}} camera={{fov: FOV, near: 0.1, far: 400, position: [0, 30, 40]}}>
    <Scene t={t} />
  </ThreeCanvas>
);
