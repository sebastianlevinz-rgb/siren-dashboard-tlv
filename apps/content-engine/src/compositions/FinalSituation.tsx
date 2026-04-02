import { Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { DarkScene } from '../components/anim/DarkScene';
import { AnimatedMap } from '../components/anim/AnimatedMap';
import { GlowNumber } from '../components/anim/GlowNumber';
import { AnimatedBars } from '../components/anim/AnimatedBars';
import { SlidingText } from '../components/anim/SlidingText';
import { TypeWriter } from '../components/common/TypeWriter';
import { MusicFadeOut } from '../components/common/MusicFadeOut';

const A = '#4A90D9';
const T = linearTiming({ durationInFrames: 12 });

export function FinalSituation() {
  return (<>
    <Audio src={staticFile('audio/final-situation.mp3')} startFrom={15} />
    <MusicFadeOut file='bg-data-analysis.mp3' baseVolume={0.18} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene accent='#c93d3d' showGrid><TypeWriter text='SITUATION REPORT' fontSize={56} color='#c93d3d' /><SlidingText from='bottom' delay={30}><div style={{ fontSize: 32, color: A, textAlign: 'center', marginTop: 12, letterSpacing: 3 }}>APRIL 2026</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={120}><DarkScene showGrid><AnimatedMap showCarriers carrierPosition='approaching' showHormuz label='USS TRUMAN APPROACHING' /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene showGrid><AnimatedMap showCarriers carrierPosition='arrived' showHormuz showKharg label='ARABIAN SEA' /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-left' })} timing={T} />
      <TransitionSeries.Sequence durationInFrames={120}><DarkScene accent='#d4822a'><SlidingText from='left'><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#d4822a' }}>2nd Carrier</div></SlidingText><SlidingText from='right' delay={10}><div style={{ fontSize: 36, color: '#7b7f9e', textAlign: 'center', marginTop: 8 }}>Reported en route</div></SlidingText><SlidingText from='bottom' delay={20}><div style={{ fontSize: 24, color: '#d4822a', textAlign: 'center', marginTop: 16 }}>UNCONFIRMED</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={180}><DarkScene showGrid><SlidingText from='top'><div style={{ fontSize: 32, color: A, letterSpacing: 3, textAlign: 'center', marginBottom: 16 }}>7 FORWARD BASES</div></SlidingText><AnimatedBars bars={[{label:'Al Udeid QAT',value:100,color:A},{label:'Al Dhafra UAE',value:85,color:A},{label:'Arifjan KWT',value:70,color:A},{label:'5th Fleet BHR',value:90,color:A},{label:'Prince Sultan SAU',value:60,color:A},{label:'Lemonnier DJI',value:45,color:A}]} /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={120}><DarkScene accent='#c93d3d'><SlidingText from='bottom'><div style={{ fontSize: 40, fontWeight: 800, textAlign: 'center', color: '#c93d3d' }}>DIEGO GARCIA</div></SlidingText><SlidingText from='bottom' delay={10}><div style={{ fontSize: 28, color: '#7b7f9e', textAlign: 'center', marginTop: 8 }}>B-2 Stealth Bombers</div></SlidingText><SlidingText from='bottom' delay={20}><div style={{ fontSize: 24, color: '#4a4d6a', textAlign: 'center', marginTop: 4 }}>Indian Ocean Strike Range</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={T} />
      <TransitionSeries.Sequence durationInFrames={120}><DarkScene showGrid><div style={{display:'flex',flexDirection:'column',gap:30,alignItems:'center'}}><GlowNumber value={45000} label='CENTCOM PERSONNEL' color={A} size={72} prefix='~' /><GlowNumber value={180} label='COMBAT AIRCRAFT' color='#c93d3d' size={72} prefix='~' /></div></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={180}><DarkScene showGrid accent='#d4822a'><AnimatedMap showKharg highlightRegion='kharg' label='KHARG ISLAND' /><SlidingText from='bottom' delay={20}><div style={{ fontSize: 28, color: '#d4822a', textAlign: 'center', marginTop: 12 }}>90% of Iran oil exports</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={180}><DarkScene showGrid accent='#c93d3d'><AnimatedMap showHormuz highlightRegion='hormuz' label='STRAIT OF HORMUZ' /><SlidingText from='bottom' delay={20}><div style={{ fontSize: 28, color: '#c93d3d', textAlign: 'center', marginTop: 12 }}>21% of global oil transit</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-bottom' })} timing={T} />
      <TransitionSeries.Sequence durationInFrames={240}><DarkScene showGrid><AnimatedMap showCarriers carrierPosition='arrived' showBases showKharg showHormuz showAttackLines highlightRegion='iran' label='IRAN SURROUNDED' /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={180}><DarkScene accent='#1a6b4a'><GlowNumber value={17} label='ALERTS APR 1' color='#1a6b4a' size={140} /><SlidingText from='bottom' delay={20}><div style={{ fontSize: 32, color: '#1a6b4a', textAlign: 'center', marginTop: 12 }}>Lowest since war began</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={240}><DarkScene><SlidingText from='left'><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#d8dae5', lineHeight: 1.4 }}>Calm before the storm?</div></SlidingText><SlidingText from='right' delay={15}><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: A, lineHeight: 1.4, marginTop: 16 }}>Or genuine de-escalation?</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={510}><DarkScene showGrid><SlidingText from='bottom'><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: A, letterSpacing: 2, marginTop: 30 }}>wardashboard.live</div></SlidingText></DarkScene></TransitionSeries.Sequence>
    </TransitionSeries>
  </>);
}
