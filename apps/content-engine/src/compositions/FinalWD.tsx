import { Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { DarkScene } from '../components/anim/DarkScene';
import { GlowNumber } from '../components/anim/GlowNumber';
import { AnimatedBars } from '../components/anim/AnimatedBars';
import { AnimatedMap } from '../components/anim/AnimatedMap';
import { SlidingText } from '../components/anim/SlidingText';
import { TypeWriter } from '../components/common/TypeWriter';
import { MusicFadeOut } from '../components/common/MusicFadeOut';
import { TrendV2 } from '../components/scenes/v2/TrendV2';
import { REAL_DATA } from '../data/real-data';

const A = '#4A90D9';
const T = linearTiming({ durationInFrames: 12 });

export function FinalWD() {
  return (<>
    <Audio src={staticFile('audio/final-wd.mp3')} startFrom={15} />
    <MusicFadeOut file='bg-daily-briefing.mp3' baseVolume={0.18} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene accent={A} showGrid><TypeWriter text={'DAY ' + REAL_DATA.daysOfWar} fontSize={72} color={A} /><SlidingText from='bottom' delay={30}><div style={{ fontSize: 32, color: '#7b7f9e', textAlign: 'center', marginTop: 12 }}>of the conflict</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene accent='#c93d3d'><GlowNumber value={REAL_DATA.totalAlerts} label='TOTAL ALERTS' color='#c93d3d' size={120} /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene><SlidingText from='left'><div style={{ fontSize: 52, fontWeight: 800, textAlign: 'center', color: '#d8dae5', lineHeight: 1.3 }}>But what is</div></SlidingText><SlidingText from='right' delay={10}><div style={{ fontSize: 52, fontWeight: 800, textAlign: 'center', color: A, lineHeight: 1.3 }}>actually happening?</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction:'from-right'})} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene accent={A}><SlidingText from='bottom'><div style={{ fontSize: 36, textAlign: 'center', color: A, letterSpacing: 2 }}>WAR DASHBOARD</div></SlidingText><SlidingText from='bottom' delay={10}><div style={{ fontSize: 28, color: '#7b7f9e', textAlign: 'center', marginTop: 8 }}>Civilian Intelligence Briefing</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene showGrid><SlidingText from='left'><div style={{ fontSize: 44, fontWeight: 700, color: '#d8dae5', textAlign: 'center' }}>Every alert</div></SlidingText><SlidingText from='right' delay={8}><div style={{ fontSize: 44, fontWeight: 700, color: A, textAlign: 'center', marginTop: 8 }}>organized</div></SlidingText><SlidingText from='left' delay={16}><div style={{ fontSize: 44, fontWeight: 700, color: '#7b7f9e', textAlign: 'center', marginTop: 8 }}>into clear patterns</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={180}><TrendV2 dailyCounts={REAL_DATA.dailyCounts} caption='Escalating or calming down?' accentColor={A} /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction:'from-left'})} timing={T} />
      <TransitionSeries.Sequence durationInFrames={150}><DarkScene showGrid><SlidingText from='top'><div style={{ fontSize: 28, color: A, letterSpacing: 3, textAlign: 'center', marginBottom: 16 }}>WAR TIMELINE</div></SlidingText><AnimatedBars bars={[{label:'IRGC targets struck',value:80,color:'#c93d3d'},{label:'UN ceasefire call',value:50,color:A},{label:'Commander eliminated',value:95,color:'#c93d3d'},{label:'US carrier deployed',value:70,color:A}]} /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={120}><DarkScene showGrid><AnimatedMap showCarriers carrierPosition='arrived' showBases showHormuz label='SITUATION ROOM' /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={150}><DarkScene showGrid><SlidingText from='top'><div style={{ fontSize: 28, color: A, letterSpacing: 3, textAlign: 'center', marginBottom: 16 }}>REGIONS TARGETED</div></SlidingText><AnimatedBars bars={[{label:'North',value:90,color:'#c93d3d'},{label:'Gush Dan',value:27,color:'#d4822a'},{label:'Jerusalem',value:27,color:'#b8a02e'},{label:'South',value:25,color:A}]} /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction:'from-bottom'})} timing={T} />
      <TransitionSeries.Sequence durationInFrames={150}><DarkScene><SlidingText from='left'><div style={{ fontSize: 44, color: '#4a4d6a', textAlign: 'center', textDecoration: 'line-through' }}>Not news.</div></SlidingText><SlidingText from='right' delay={10}><div style={{ fontSize: 44, color: '#4a4d6a', textAlign: 'center', textDecoration: 'line-through', marginTop: 8 }}>Not speculation.</div></SlidingText><SlidingText from='bottom' delay={20}><div style={{ fontSize: 56, fontWeight: 800, color: '#d8dae5', textAlign: 'center', marginTop: 16 }}>Raw data.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={120}><DarkScene><SlidingText from='bottom'><div style={{ fontSize: 36, color: '#7b7f9e', textAlign: 'center', lineHeight: 1.8 }}>Free. Open source. Updated daily.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={450}><DarkScene accent={A} showGrid><SlidingText from='bottom'><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: A, letterSpacing: 2 }}>wardashboard.live</div></SlidingText><SlidingText from='bottom' delay={15}><div style={{ fontSize: 28, color: '#4a4d6a', textAlign: 'center', marginTop: 16 }}>Your daily intelligence briefing.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
    </TransitionSeries>
  </>);
}
