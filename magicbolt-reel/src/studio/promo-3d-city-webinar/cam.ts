// Camera path for the 3D city, plus a projector so 2D labels can stick to 3D points.
// The canvas and the HTML overlay both read the camera from here, so they always agree.
import * as THREE from 'three';
import {SHOPS, T} from './cityConfig';

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
  [0, -34, 44, 52, 0.7], // hook
  [3.2, -24, 40, 46, 0.7],
  [T.example, -12, 52, 56, 0.7], // example: high over the city (rings = the ad)
  [T.wayCrm, 8, 36, 46, 0.7],
  [T.wayCrm + 2, 26, 28, 34, 1.0], // pin drops
  [T.wayCrm + 4.6, 34, 26, 36, 2.6], // Way CRM HQ rises
  [T.features + 1.5, 28, 30, 46, 0.9], // arcs link every lead
  [T.result, -14, 32, 48, 0.9],
  [T.end, -30, 34, 52, 0.9],
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
