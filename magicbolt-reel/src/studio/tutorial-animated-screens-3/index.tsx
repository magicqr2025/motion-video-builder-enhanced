import type {StudioComp} from '../types';
import {TUT} from './config';
import {TutorialConcepts, TutorialFull} from './Concepts';
import {FULL} from './config';

export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-tutorial-animated-screens-3', component: TutorialFull, durationInFrames: Math.ceil(FULL.durationSec * TUT.fps), fps: TUT.fps, width: TUT.width, height: TUT.height},
  {id: 'Studio-tutorial-animated-screens-3-concepts', component: TutorialConcepts, durationInFrames: TUT.moment * TUT.moments * TUT.fps, fps: TUT.fps, width: TUT.width, height: TUT.height, defaultProps: {concept: 'a'}},
];
