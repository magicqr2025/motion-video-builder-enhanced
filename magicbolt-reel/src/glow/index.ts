// id → component for the glossy feature loops; Root.tsx registers one composition per entry
import React from 'react';
import {AeoGeo, BioLink, ReviewBooster, SmartCard, SmartMenu, WhatsappCrm} from './ScenesA';
import {AiAgent, FacebookAuto, InstagramAuto, ProfileGrowth, SocialPlanner, WhiteLabel} from './ScenesB';
import {Appointments, ManyMore, WordpressAuto} from './ScenesC';

export const GLOW: [string, React.FC][] = [
  ['Glow-ReviewBooster', ReviewBooster],
  ['Glow-SmartMenu', SmartMenu],
  ['Glow-SmartCard', SmartCard],
  ['Glow-BioLink', BioLink],
  ['Glow-AeoGeo', AeoGeo],
  ['Glow-WhatsappCrm', WhatsappCrm],
  ['Glow-SocialPlanner', SocialPlanner],
  ['Glow-ProfileGrowth', ProfileGrowth],
  ['Glow-FacebookAuto', FacebookAuto],
  ['Glow-InstagramAuto', InstagramAuto],
  ['Glow-WhiteLabel', WhiteLabel],
  ['Glow-AiAgent', AiAgent],
  ['Glow-WordpressAuto', WordpressAuto],
  ['Glow-Appointments', Appointments],
  ['Glow-ManyMore', ManyMore],
];
