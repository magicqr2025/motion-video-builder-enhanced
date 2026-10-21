import type {StudioComp} from '../types';
import {DEMO, DEMO_TOTAL, KitDemo} from './Demo';

// Not a project of the Video Studio app: a gallery of src/studio/kit for Remotion Studio and for checking the kit.
export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-kit-demo', component: KitDemo, durationInFrames: DEMO_TOTAL * DEMO.fps, fps: DEMO.fps, width: DEMO.width, height: DEMO.height},
];
