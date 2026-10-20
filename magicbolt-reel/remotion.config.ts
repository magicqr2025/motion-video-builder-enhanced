import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
// the 3D city (three.js) needs a GPU-backed GL renderer
Config.setChromiumOpenGlRenderer('angle');
