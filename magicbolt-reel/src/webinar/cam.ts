// Camera path for the 3D city, plus a projector so 2D labels can stick to 3D points.
// The canvas and the HTML overlay both read the camera from here, so they always agree.
import * as THREE from 'three';
import {SHOPS, T} from './config';

export const FOV = 40;
export const CELL = 3.2; // city grid spacing
export const HQ_H = 3.4; // height of the agency building
// Camera and target are both raised by this much, which moves the whole city DOWN in the frame (~65 px per unit)
const DROP = 2.8;
export type V3 = [number, number, number];

export const shopPos = (i: number): V3 => [SHOPS[i].cell[0] * CELL, 0, SHOPS[i].cell[1] * CELL];

// [time, azimuth°, elevation°, distance, target height]. A lower target lifts the city in the frame.
type Key = [number, number, number, number, number];
const KEYS: Key[] = [
  [T.s2 - 0.4, -58, 76, 76, 0.7],
  [T.s2 + 2.4, -22, 40, 46, 0.7],
  [T.s3, -10, 34, 42, 0.7],
  [T.s4, 20, 31, 40, 0.7],
  [T.s4 + 1.5, 28, 27, 32, 1.0],
  [T.s5 + 0.2, 30, 26, 32, 1.4],
  [T.s5 + 2.4, 36, 26, 38, 3.0],
  [T.s5 + 5.2, 46, 27, 40, 2.6],
  [T.s5 + 7.6, 34, 28, 46, 0.2],
  [T.s6 + 0.8, 24, 29, 42, 0.9],
  [T.end, -14, 30, 40, 0.9],
];

const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const D2R = Math.PI / 180;

export const camAt = (t: number): {pos: V3; target: V3} => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const k = eio(Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))));
  const m = (n: 1 | 2 | 3 | 4) => a[n] + (b[n] - a[n]) * k;
  const az = (m(1) + 1.4 * Math.sin(t * 0.7)) * D2R, el = (m(2) + 0.5 * Math.sin(t * 0.9 + 1)) * D2R, dist = m(3), ty = m(4) + DROP;
  return {
    pos: [dist * Math.cos(el) * Math.sin(az), ty + dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az)],
    target: [0, ty, 0],
  };
};

export const applyCam = (cam: THREE.PerspectiveCamera, t: number) => {
  const {pos, target} = camAt(t);
  cam.fov = FOV;
  cam.aspect = 1080 / 1920;
  cam.position.set(...pos);
  cam.lookAt(...target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
};

const probe = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 400);
const v = new THREE.Vector3();
// World point → screen pixels. `k` is a size factor: nearer points are bigger.
export const project = (t: number, p: V3): {x: number; y: number; k: number} => {
  applyCam(probe, t);
  v.set(...p);
  const d = v.distanceTo(probe.position);
  v.project(probe);
  return {x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, k: Math.max(0.55, Math.min(1.7, 40 / d))};
};
