import type {StudioComp} from '../types';
import {TUT} from './config';
import {TutorialConcepts} from './Concepts';

export const COMPOSITIONS: StudioComp[] = [
  {id: 'Studio-tutorial-animated-screens-2-concepts', component: TutorialConcepts, durationInFrames: TUT.moment * TUT.moments * TUT.fps, fps: TUT.fps, width: TUT.width, height: TUT.height, defaultProps: {concept: 'a'}},
];
