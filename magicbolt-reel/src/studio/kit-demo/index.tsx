import type {StudioComp} from '../types';
import {DEMO, DEMO_TOTAL, KitDemo} from './Demo';
import {DEMO2, DEMO2_TOTAL, KitDemo2} from './Demo2';

// Not a project of the MotionStudio app: galleries of src/studio/kit for Remotion Studio and for checking the kit.
export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-kit-demo', component: KitDemo, durationInFrames: DEMO_TOTAL * DEMO.fps, fps: DEMO.fps, width: DEMO.width, height: DEMO.height},
  {id: 'Studio-kit-demo-2', component: KitDemo2, durationInFrames: DEMO2_TOTAL * DEMO2.fps, fps: DEMO2.fps, width: DEMO2.width, height: DEMO2.height},
];
