// Real glossy 3D objects (three.js) placed over a scene. Look option "Real 3D objects".
//   <Obj3D kind="coin" x={1500} y={300} size={420} at={0.6} level={2} />
// kind: coin | bubble | phone | card (QR card). x/y = centre in px, size = canvas box in px. Transparent background.
import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {COLORS, Level, seeded, useSec, useSpringK} from './core';

export type Obj3DKind = 'coin' | 'bubble' | 'phone' | 'card';

const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = 0.9;
    return () => { scene.environment = null; tex.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
};

const gloss = (color: string, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) => ({color, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12, ...extra});

// ---------- canvas textures (drawn synchronously, so they are deterministic) ----------
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const phoneScreen = (c1: string, c2: string) => canvasTex(512, 1024, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 1024); g.addColorStop(0, c1); g.addColorStop(1, c2);
  c.fillStyle = g; c.fillRect(0, 0, 512, 1024);
  const bubble = (y: number, w: number, right: boolean, col: string) => { c.fillStyle = col; c.beginPath(); c.roundRect(right ? 512 - 40 - w : 40, y, w, 96, 36); c.fill(); };
  bubble(200, 300, false, 'rgba(255,255,255,0.95)'); bubble(330, 250, true, '#25D366'); bubble(460, 330, false, 'rgba(255,255,255,0.95)');
  bubble(590, 280, true, '#25D366'); bubble(720, 220, false, 'rgba(255,255,255,0.95)');
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(60, 60, 392, 70, 35); c.fill();
});
const qrTex = (seed: number, ink: string) => canvasTex(512, 512, (c) => {
  c.fillStyle = '#fff'; c.fillRect(0, 0, 512, 512);
  const n = 21, s = 512 / (n + 2), r = seeded(seed);
  const finder = (ox: number, oy: number) => { c.fillStyle = ink; c.fillRect((ox + 1) * s, (oy + 1) * s, 7 * s, 7 * s); c.fillStyle = '#fff'; c.fillRect((ox + 2) * s, (oy + 2) * s, 5 * s, 5 * s); c.fillStyle = ink; c.fillRect((ox + 3) * s, (oy + 3) * s, 3 * s, 3 * s); };
  c.fillStyle = ink;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const inFinder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    if (!inFinder && r() > 0.52) c.fillRect((x + 1) * s, (y + 1) * s, s, s);
  }
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
});

// ---------- the four objects ----------
const Coin: React.FC<{t: number}> = ({t}) => (
  <group rotation={[0, t * 1.6, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1, 1, 0.22, 72]} /><meshPhysicalMaterial {...gloss(COLORS.gold, {metalness: 0.85, roughness: 0.25})} /></mesh>
    <mesh><torusGeometry args={[0.99, 0.1, 24, 72]} /><meshPhysicalMaterial {...gloss('#FFE27A', {metalness: 0.9, roughness: 0.18})} /></mesh>
    <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.68, 0.68, 0.06, 64]} /><meshPhysicalMaterial {...gloss('#F7B500', {metalness: 0.9, roughness: 0.3})} /></mesh>
    <mesh position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.68, 0.68, 0.06, 64]} /><meshPhysicalMaterial {...gloss('#F7B500', {metalness: 0.9, roughness: 0.3})} /></mesh>
  </group>
);
const Bubble: React.FC<{t: number}> = ({t}) => {
  const geo = useMemo(() => new RoundedBoxGeometry(2, 1.35, 0.55, 8, 0.32), []);
  return (
    <group rotation={[0.1, Math.sin(t * 1.2) * 0.45, Math.sin(t * 0.9) * 0.06]}>
      <mesh geometry={geo}><meshPhysicalMaterial {...gloss(COLORS.blue)} /></mesh>
      <mesh position={[-0.55, -0.85, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.32, 0.5, 4]} /><meshPhysicalMaterial {...gloss(COLORS.blue)} /></mesh>
      {[-0.45, 0, 0.45].map((x, i) => <mesh key={i} position={[x, 0, 0.3]}><sphereGeometry args={[0.13, 24, 24]} /><meshPhysicalMaterial {...gloss('#fff')} /></mesh>)}
    </group>
  );
};
const Phone: React.FC<{t: number}> = ({t}) => {
  const body = useMemo(() => new RoundedBoxGeometry(1.15, 2.3, 0.16, 8, 0.16), []);
  const tex = useMemo(() => phoneScreen('#1354BC', '#0E1B4D'), []);
  return (
    <group rotation={[0.08, Math.sin(t * 1.1) * 0.55 - 0.2, 0]}>
      <mesh geometry={body}><meshPhysicalMaterial {...gloss('#12162E', {metalness: 0.6, roughness: 0.3})} /></mesh>
      <mesh position={[0, 0, 0.085]}><planeGeometry args={[1.02, 2.12]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
};
const QrCard: React.FC<{t: number}> = ({t}) => {
  const body = useMemo(() => new RoundedBoxGeometry(1.9, 1.9, 0.14, 8, 0.18), []);
  const tex = useMemo(() => qrTex(11, COLORS.navy), []);
  return (
    <group rotation={[0.12, Math.sin(t * 1.0) * 0.6, Math.sin(t * 0.7) * 0.05]}>
      <mesh geometry={body}><meshPhysicalMaterial {...gloss('#FFFFFF')} /></mesh>
      <mesh position={[0, 0, 0.075]}><planeGeometry args={[1.62, 1.62]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
};

const Scene3D: React.FC<{kind: Obj3DKind; t: number; k: number}> = ({kind, t, k}) => (
  <>
    <Env />
    <ambientLight intensity={0.5} />
    <directionalLight position={[3, 5, 6]} intensity={2.2} />
    <directionalLight position={[-4, -1, 3]} intensity={0.8} color="#9CC8FF" />
    <group scale={Math.max(0.0001, k)} position={[0, Math.sin(t * 1.4) * 0.07, 0]}>
      {kind === 'coin' && <Coin t={t} />}
      {kind === 'bubble' && <Bubble t={t} />}
      {kind === 'phone' && <Phone t={t} />}
      {kind === 'card' && <QrCard t={t} />}
    </group>
  </>
);

export const Obj3D: React.FC<{kind: Obj3DKind; x: number; y: number; size?: number; at?: number; level?: Level; style?: React.CSSProperties}> = ({kind, x, y, size = 420, at = 0, level = 1, style}) => {
  const t = useSec();
  const k = useSpringK(at, level);
  if (t < at) return null;
  return (
    <ThreeCanvas width={size} height={size} flat style={{position: 'absolute', left: x - size / 2, top: y - size / 2, ...style}} camera={{fov: 32, near: 0.1, far: 50, position: [0, 0, 5.2]}}>
      <Scene3D kind={kind} t={t} k={k} />
    </ThreeCanvas>
  );
};
