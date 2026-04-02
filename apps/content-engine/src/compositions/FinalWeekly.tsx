import { Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { DarkScene } from '../components/anim/DarkScene';
import { GlowNumber } from '../components/anim/GlowNumber';
import { WeekBar } from '../components/anim/WeekBar';
import { SlidingText } from '../components/anim/SlidingText';
import { TypeWriter } from '../components/common/TypeWriter';
import { MusicFadeOut } from '../components/common/MusicFadeOut';

const A = '#4A90D9';
const T = linearTiming({ durationInFrames: 12 });
const MX = 229;

export function FinalWeekly() {
  return (<>
    <Audio src={staticFile('audio/final-weekly.mp3')} startFrom={15} />
    <MusicFadeOut file='bg-outro-safe.mp3' baseVolume={0.18} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene accent={A} showGrid><TypeWriter text='5 WEEKS OF WAR' fontSize={56} color={A} /><SlidingText from='bottom' delay={30}><div style={{ fontSize: 28, color: '#7b7f9e', textAlign: 'center', marginTop: 12 }}>Week-by-week recap</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene><SlidingText from='bottom'><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#d8dae5' }}>Here is what happened.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction:'from-right'})} timing={T} />
      <TransitionSeries.Sequence durationInFrames={300}><DarkScene accent='#c93d3d' showGrid><WeekBar weekNum={1} dates='Feb 28 - Mar 6' alerts={198} maxAlerts={MX} event='First barrage. Israel strikes Syria.' color='#c93d3d' /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={300}><DarkScene accent='#d4822a' showGrid><WeekBar weekNum={2} dates='Mar 7 - Mar 13' alerts={204} maxAlerts={MX} event='Iran retaliates. UN ceasefire call.' color='#d4822a' /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction:'from-left'})} timing={T} />
      <TransitionSeries.Sequence durationInFrames={330}><DarkScene accent='#b8a02e' showGrid><WeekBar weekNum={3} dates='Mar 14 - Mar 20' alerts={199} maxAlerts={MX} event='Sanctions. IRGC commander eliminated.' color='#b8a02e' /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={420}><DarkScene accent='#c93d3d' showGrid><WeekBar weekNum={4} dates='Mar 21 - Mar 27' alerts={229} maxAlerts={MX} event='HEAVIEST WEEK. 42 alerts in one day.' color='#c93d3d' /><SlidingText from='bottom' delay={30}><div style={{ fontSize: 24, color: '#c93d3d', textAlign: 'center', marginTop: 12 }}>Arrow defense system tested like never before</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={360}><DarkScene accent='#1a6b4a' showGrid><WeekBar weekNum={5} dates='Mar 28 - Apr 1' alerts={127} maxAlerts={MX} event='Intensity drops. US carrier near Hormuz.' color='#1a6b4a' /><SlidingText from='bottom' delay={25}><GlowNumber value={17} label='LOWEST DAY' color='#1a6b4a' size={64} /></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={210}><DarkScene><SlidingText from='left'><div style={{ fontSize: 44, fontWeight: 700, textAlign: 'center', color: '#d8dae5', lineHeight: 1.4 }}>Is this the calm</div></SlidingText><SlidingText from='right' delay={12}><div style={{ fontSize: 44, fontWeight: 700, textAlign: 'center', color: A, lineHeight: 1.4, marginTop: 12 }}>before the storm?</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={120}><DarkScene><SlidingText from='bottom'><div style={{ fontSize: 48, fontWeight: 800, textAlign: 'center', color: '#d8dae5' }}>The data will tell us.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={330}><DarkScene accent={A} showGrid><SlidingText from='bottom'><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: A, letterSpacing: 2 }}>wardashboard.live</div></SlidingText><SlidingText from='bottom' delay={15}><div style={{ fontSize: 28, color: '#4a4d6a', textAlign: 'center', marginTop: 16 }}>Follow the conflict.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
    </TransitionSeries>
  </>);
}
