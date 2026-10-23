import type {StudioComp} from '../types';
import {CONCEPTS, DURATION, VIDEO} from './config';
import {AgencyConcepts} from './Concepts';
import {AgencyVideo} from './Video';

export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-tutorial-animated-screens-4', component: AgencyVideo, durationInFrames: Math.ceil(DURATION * VIDEO.fps), fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height},
  {id: 'Studio-tutorial-animated-screens-4-concepts', component: AgencyConcepts, durationInFrames: Math.round(CONCEPTS.moment * CONCEPTS.moments * CONCEPTS.fps), fps: CONCEPTS.fps, width: CONCEPTS.width, height: CONCEPTS.height, defaultProps: {concept: 'a'}},
];
