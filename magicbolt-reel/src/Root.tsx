import {Composition} from 'remotion';
import {Reel} from './Reel';
import {VIDEO} from './config';
import {AgencyReel, AGENCY_DURATION} from './agency/AgencyReel';
import {VIDEO as AGENCY_VIDEO} from './agency/config';
import {NeonReel, NEON_DURATION} from './neon/NeonReel';
import {VIDEO as NEON_VIDEO} from './neon/config';
import {QrReel, QR_DURATION} from './qr/QrReel';
import {VIDEO as QR_VIDEO} from './qr/config';
import {LOOPS} from './loops/Loops';
import './loops/Loops2'; // adds four more loops to LOOPS
import {GLOW} from './glow';
import {LogoAnim} from './logo/LogoAnim';
import {WebinarReel, WEBINAR_DURATION} from './webinar/WebinarReel';
import {AdsReel, ADS_DURATION} from './ads/AdsReel';
import {VIDEO as ADS_VIDEO} from './ads/config';
import {VIDEO as WEBINAR_VIDEO} from './webinar/config';
import {SaasReel, SAAS_DURATION} from './saas/SaasReel';
import {VIDEO as SAAS_VIDEO} from './saas/config';
import {DnsTutorial, DNS_DURATION} from './dns/DnsTutorial';
import {VIDEO as DNS_VIDEO} from './dns/config';
import {DnsAnimated, DNS2_DURATION} from './dns2/DnsAnimated';
import {StudioCompositions} from './studio/registry';

export const RemotionRoot = () => (
  <>
    <Composition
      id="MagicBoltReel"
      component={Reel}
      durationInFrames={Math.round(VIDEO.duration * VIDEO.fps)}
      fps={VIDEO.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="AgencyOSReel"
      component={AgencyReel}
      durationInFrames={Math.round(AGENCY_DURATION * AGENCY_VIDEO.fps)}
      fps={AGENCY_VIDEO.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="MagicQRReview"
      component={QrReel}
      durationInFrames={Math.round(QR_DURATION * QR_VIDEO.fps)}
      fps={QR_VIDEO.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="MagicQRSteps"
      component={QrReel}
      defaultProps={{clean: true}}
      durationInFrames={Math.round(QR_DURATION * QR_VIDEO.fps)}
      fps={QR_VIDEO.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="MagicQRAdsVsReviews"
      component={AdsReel}
      durationInFrames={Math.round(ADS_DURATION * ADS_VIDEO.fps)}
      fps={ADS_VIDEO.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="AgencyOSReelNeon"
      component={NeonReel}
      durationInFrames={Math.round(NEON_DURATION * NEON_VIDEO.fps)}
      fps={NEON_VIDEO.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="AIAgencyWebinar"
      component={WebinarReel}
      durationInFrames={Math.round(WEBINAR_DURATION * WEBINAR_VIDEO.fps)}
      fps={WEBINAR_VIDEO.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="SellSaaSReel"
      component={SaasReel}
      durationInFrames={Math.round(SAAS_DURATION * SAAS_VIDEO.fps)}
      fps={SAAS_VIDEO.fps}
      width={1080}
      height={1920}
    />
    {/* DNS setup tutorial: motion graphics over the screen recording (16:9) */}
    <Composition
      id="DnsSetupTutorial"
      component={DnsTutorial}
      durationInFrames={Math.round(DNS_DURATION * DNS_VIDEO.fps)}
      fps={DNS_VIDEO.fps}
      width={1920}
      height={1080}
    />
    {/* DNS setup tutorial v2: fully animated, synced to public/dns-voiceover.mp3 */}
    <Composition id="DnsSetupAnimated" component={DnsAnimated} durationInFrames={Math.round(DNS2_DURATION * 30)} fps={30} width={1920} height={1080} />
    {/* square transparent loops for feature GIFs: 4 seconds each */}
    {LOOPS.map(([id, C]) => <Composition key={id} id={id} component={C} durationInFrames={120} fps={30} width={1200} height={1200} />)}
    {/* glossy versions of the same loops */}
    {GLOW.map(([id, C]) => <Composition key={id} id={id} component={C} durationInFrames={120} fps={30} width={1200} height={1200} />)}
    {/* MagicBolt AI logo animation: transparent, and on white */}
    <Composition id="LogoAnim" component={LogoAnim} defaultProps={{}} durationInFrames={150} fps={30} width={1440} height={480} />
    <Composition id="LogoAnimWhite" component={LogoAnim} defaultProps={{bg: '#ffffff'}} durationInFrames={150} fps={30} width={1440} height={480} />
    {/* videos built by the MotionStudio app (../studio) */}
    <StudioCompositions />
  </>
);
