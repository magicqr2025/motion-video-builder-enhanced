import type {StudioComp} from '../types';
import {LC} from './config';
import {LeadCenterConcepts} from './Concepts';
import {LeadCenterLoop} from './Loop';

export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-lead-center-loop', component: LeadCenterLoop, durationInFrames: LC.fps * LC.dur, fps: LC.fps, width: 1200, height: 1200},
  {id: 'Studio-lead-center-loop-concepts', component: LeadCenterConcepts, durationInFrames: LC.fps * LC.dur, fps: LC.fps, width: 1200, height: 1200, defaultProps: {concept: 'a'}},
];
