import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {CameraRig, KineticCaptions, Obj3D, Parallax, Particles, SceneSeq, SpringIn, transitionFor} from '../kit';
import {fontFamily} from '../../components/kit';
import TEXT from './text.json';
import {BLUE, DEEP, GOLD, MOMENT, NAVY, ORANGE, SLATE, TOTAL, W, XFADE} from './config';

type Concept = 'a'|'b';
const Caption: React.FC<{words:string[]; start:number; y:number; color:string}> = ({words,start,y,color}) => {
  const {fps}=useVideoConfig();
  const timed=words.map((text,i)=>({text,start:start+i*0.42,end:start+i*0.42+0.55}));
  return <KineticCaptions words={timed} level={1} y={y} color={color} />;
};
const Copy: React.FC<{title:string; sub:string; light?:boolean; left?:number}> = ({title,sub,light=false,left=68}) => <div style={{position:'absolute',left,top:190,width:930,fontFamily,textAlign:left===68?'left':'center'}}>
  <div style={{fontWeight:700,fontSize:74,lineHeight:1.08,letterSpacing:-2,color:light?'#fff':NAVY,textShadow:light?'0 5px 24px #06113266':undefined}}>{title}</div>
  <div style={{marginTop:30,fontWeight:500,fontSize:34,lineHeight:1.3,color:light?'#EAF4FF':SLATE}}>{sub}</div>
</div>;

const AHook:React.FC=()=> <AbsoluteFill style={{background:'linear-gradient(145deg,#F7FAFF 0%,#E8F2FF 52%,#FFF3D2 100%)'}}>
  <Particles level={1} colors={[BLUE,GOLD]} shapes={['sparkle','dot']} seed={15} avoid={{x:80,y:170,w:920,h:560}} />
  <CameraRig level={1} dur={MOMENT}>
    <Parallax depth={0.2}><Copy title={TEXT.Hook.headline} sub={TEXT.Hook.sub}/></Parallax>
    <SpringIn at={0.35} level={2}><Img src={staticFile('AI Robot Recommends a Local Shop.png')} style={{position:'absolute',width:800,height:900,objectFit:'contain',left:145,top:750,filter:'drop-shadow(0 35px 38px #173D7940)'}} /></SpringIn>
    <Obj3D kind="bubble" x={840} y={1060} size={230} at={0.9} level={1}/>
    <SpringIn at={0.7} level={2}><div style={{position:'absolute',left:110,top:1460,width:860,padding:'25px 28px',borderRadius:38,background:'linear-gradient(145deg,#fff,#eef5ff)',boxShadow:'0 14px 0 #CCDCF4,0 28px 60px #18345C33',fontFamily,fontSize:33,fontWeight:700,color:NAVY,textAlign:'center'}}>Reply • Follow up • Grow</div></SpringIn>
  </CameraRig><Caption words={TEXT.Hook.caption} start={0.35} y={1660} color={NAVY}/>
</AbsoluteFill>;

const AAI:React.FC=()=> <AbsoluteFill style={{background:'radial-gradient(ellipse at 75% 24%,#318BE8 0%,#1354BC 28%,#0E1B4D 78%)'}}>
  <Particles level={1} colors={[GOLD,'#FFFFFF']} shapes={['sparkle','ring']} seed={29} avoid={{x:50,y:150,w:970,h:580}} />
  <CameraRig level={1} dur={MOMENT}><Copy title={TEXT.AI.headline} sub={TEXT.AI.sub} light />
    <SpringIn at={0.25} level={2}><Img src={staticFile('Playful Local Business Growth Dashboard.png')} style={{position:'absolute',width:900,height:880,objectFit:'contain',left:90,top:760,filter:'drop-shadow(0 36px 38px #020A2466)'}}/></SpringIn>
    <Obj3D kind="phone" x={860} y={1250} size={270} at={0.7} level={1}/>
  </CameraRig><Caption words={TEXT.AI.caption} start={3.35} y={1670} color="#fff"/>
</AbsoluteFill>;

const BHook:React.FC=()=> <AbsoluteFill style={{background:'linear-gradient(155deg,#0B163E,#124BA8 65%,#1582D5)'}}>
  <Particles level={1} colors={[GOLD,'#8DC9FF']} seed={57} avoid={{x:55,y:160,w:970,h:680}} />
  <CameraRig level={1} dur={MOMENT}><Copy title={TEXT.Unified.headline} sub={TEXT.Unified.sub} light />
    <SpringIn at={0.25} level={2}><Img src={staticFile('Glossy WhatsApp Broadcast Network.png')} style={{position:'absolute',width:980,height:1020,objectFit:'contain',left:50,top:700,filter:'drop-shadow(0 38px 40px #0006)'}}/></SpringIn>
    <Obj3D kind="card" x={535} y={1400} size={250} at={0.85} level={1}/>
  </CameraRig><Caption words={TEXT.Unified.caption} start={0.35} y={1670} color="#fff"/>
</AbsoluteFill>;

const BAI:React.FC=()=> <AbsoluteFill style={{background:'linear-gradient(150deg,#FFF9E8,#FFF 46%,#E6F3FF)'}}>
  <Particles level={1} colors={[GOLD,BLUE]} seed={73} avoid={{x:45,y:150,w:990,h:680}} />
  <CameraRig level={1} dur={MOMENT}><Copy title={TEXT.AI.headline} sub={TEXT.AI.sub}/>
    <SpringIn at={0.3} level={2}><Img src={staticFile('AI Robot Recommends a Local Shop.png')} style={{position:'absolute',width:780,height:900,objectFit:'contain',left:150,top:750,filter:'drop-shadow(0 32px 40px #122A4A40)'}}/></SpringIn>
    <div style={{position:'absolute',left:150,top:1460,width:780,height:104,borderRadius:60,background:`linear-gradient(90deg,${DEEP},${BLUE})`,boxShadow:'0 12px 0 #0D3F8C,0 24px 40px #12345A55',display:'flex',alignItems:'center',justifyContent:'center',fontFamily,fontSize:36,fontWeight:700,color:'#fff'}}>{TEXT.Brand.name} · {TEXT.Brand.byline}</div>
  </CameraRig><Caption words={TEXT.AI.caption} start={3.35} y={1670} color={NAVY}/>
</AbsoluteFill>;

export const CRMConcepts:React.FC<{concept?:Concept}> = ({concept='a'})=>{
  const kind:Concept=concept==='b'?'b':'a';
  const scenes=kind==='a'?[<AHook key="ah"/>,<AAI key="aa"/>]:[<BHook key="bh"/>,<BAI key="ba"/>];
  return <AbsoluteFill style={{overflow:'hidden',background:NAVY}}>{scenes.map((scene,i)=>{const tr=transitionFor(i,2);return <SceneSeq key={i} start={i*MOMENT} dur={MOMENT} xfade={XFADE} type={tr.type} dir={tr.dir} first={i===0} last={i===1} name={tr.type}>{scene}</SceneSeq>;})}</AbsoluteFill>;
};
