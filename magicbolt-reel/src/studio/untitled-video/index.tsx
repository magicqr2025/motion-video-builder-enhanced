import type {StudioComp} from '../types';
import {MOMENT, MOMENTS, TOTAL, W} from './config';
import {WayCrmConcepts} from './Concepts';
import {WayCrmVideo} from './Video';

export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-untitled-video', component: WayCrmVideo, durationInFrames: Math.round(TOTAL * W.fps), fps: W.fps, width: W.width, height: W.height},
  {id: 'Studio-untitled-video-concepts', component: WayCrmConcepts, durationInFrames: W.fps * MOMENT * MOMENTS, fps: W.fps, width: W.width, height: W.height, defaultProps: {concept: 'a'}},
];
