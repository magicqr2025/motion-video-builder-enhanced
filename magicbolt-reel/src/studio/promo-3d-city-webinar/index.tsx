import type {StudioComp} from '../types';
import {MOMENT, MOMENTS, TOTAL, W} from './config';
import {LeadsConcepts} from './Concepts';
import {LeadsVideo} from './Video';

export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-promo-3d-city-webinar', component: LeadsVideo, durationInFrames: Math.round(TOTAL * W.fps), fps: W.fps, width: W.width, height: W.height},
  {id: 'Studio-promo-3d-city-webinar-concepts', component: LeadsConcepts, durationInFrames: W.fps * MOMENT * MOMENTS, fps: W.fps, width: W.width, height: W.height, defaultProps: {concept: 'a'}},
];
