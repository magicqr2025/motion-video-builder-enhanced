import type {StudioComp} from '../types';
import {MOMENT, MOMENTS, TOTAL, W} from './config';
import {AgencyConcepts} from './Concepts';
import {AgencyVideo} from './Video';

export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-intro-waycrm-1m-style-2', component: AgencyVideo, durationInFrames: Math.round(TOTAL * W.fps), fps: W.fps, width: W.width, height: W.height},
  {id: 'Studio-intro-waycrm-1m-style-2-concepts', component: AgencyConcepts, durationInFrames: W.fps * MOMENT * MOMENTS, fps: W.fps, width: W.width, height: W.height, defaultProps: {concept: 'a'}},
];
