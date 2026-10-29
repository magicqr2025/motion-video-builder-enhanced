import type {StudioComp} from '../types';
import {MOMENT, MOMENTS, TOTAL, W} from './config';
import {WayIconsConcepts} from './Concepts';
import {WayIconsVideo} from './Video';

export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-untitled-video-3', component: WayIconsVideo, durationInFrames: Math.round(TOTAL * W.fps), fps: W.fps, width: W.width, height: W.height},
  {id: 'Studio-untitled-video-3-concepts', component: WayIconsConcepts, durationInFrames: W.fps * MOMENT * MOMENTS, fps: W.fps, width: W.width, height: W.height, defaultProps: {concept: 'a'}},
];
