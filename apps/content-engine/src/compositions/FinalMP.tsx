import { Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { DarkScene } from '../components/anim/DarkScene';
import { GlowNumber } from '../components/anim/GlowNumber';
import { AnimatedBars } from '../components/anim/AnimatedBars';
import { SlidingText } from '../components/anim/SlidingText';
import { TypeWriter } from '../components/common/TypeWriter';
import { MusicFadeOut } from '../components/common/MusicFadeOut';
import { HeatmapV2 } from '../components/scenes/v2/HeatmapV2';
import { REAL_DATA } from '../data/real-data';

const A = '#d4822a';
const T = linearTiming({ durationInFrames: 12 });
const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
REAL_DATA.dailyCounts.forEach((c, i) => { const d = (i + 5) % 7; for (let h = 0; h < 24; h++) grid[d][h] += Math.round(c / 24 * (1 + Math.sin(h / 3) * 0.5)); });
const mx = Math.max(...grid.flat());

export function FinalMP() {
  return (<>
    <Audio src={staticFile('audio/final-mp.mp3')} startFrom={15} />
    <MusicFadeOut file='bg-breaking-alert.mp3' baseVolume={0.18} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene accent={A}><GlowNumber value={250} label='ALERTS IN GUSH DAN' color={A} size={140} /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={75}><DarkScene accent={A} showGrid><SlidingText from='left'><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#d8dae5' }}>Since February 28</div></SlidingText><SlidingText from='right' delay={10}><div style={{ fontSize: 36, color: '#7b7f9e', textAlign: 'center', marginTop: 12 }}>33 days of conflict</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={75}><DarkScene accent={A}><SlidingText from='bottom'><div style={{ fontSize: 56, fontWeight: 800, textAlign: 'center', color: A }}>They follow</div></SlidingText><SlidingText from='bottom' delay={10}><div style={{ fontSize: 56, fontWeight: 800, textAlign: 'center', color: '#d8dae5' }}>a pattern.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction:'from-right'})} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene accent={A}><TypeWriter text='MISSILE PROBABILITY' fontSize={48} color={A} /><SlidingText from='bottom' delay={20}><div style={{ fontSize: 32, color: '#7b7f9e', textAlign: 'center', marginTop: 16 }}>Every alert. Mapped.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene><SlidingText from='left'><div style={{ fontSize: 52, fontWeight: 700, color: A, textAlign: 'center' }}>By Hour.</div></SlidingText><SlidingText from='right' delay={10}><div style={{ fontSize: 52, fontWeight: 700, color: '#d8dae5', textAlign: 'center', marginTop: 8 }}>By Day.</div></SlidingText><SlidingText from='left' delay={20}><div style={{ fontSize: 52, fontWeight: 700, color: '#7b7f9e', textAlign: 'center', marginTop: 8 }}>By Region.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={180}><HeatmapV2 grid={grid} maxVal={mx} caption='Peak 14:00 — Calmest 02:00-05:00' accentColor={A} /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction:'from-bottom'})} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene showGrid><AnimatedBars bars={[{label:'Thursday',value:31.8,color:'#c93d3d'},{label:'Sunday',value:32.4,color:A},{label:'Saturday',value:28.6,color:'#7b7f9e'},{label:'Monday',value:24.0,color:'#1a6b4a'}]} maxValue={35} /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={90}><DarkScene accent={A}><GlowNumber value={957} label='EVENTS ANALYZED' color={A} size={120} /></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={120}><DarkScene accent={A}><SlidingText from='bottom'><div style={{ fontSize: 48, fontWeight: 800, textAlign: 'center', color: '#d8dae5' }}>Check before you</div></SlidingText><SlidingText from='bottom' delay={10}><div style={{ fontSize: 48, fontWeight: 800, textAlign: 'center', color: A }}>step outside.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction:'from-left'})} timing={T} />
      <TransitionSeries.Sequence durationInFrames={180}><DarkScene><SlidingText from='left'><div style={{ fontSize: 36, color: '#7b7f9e', textAlign: 'center', lineHeight: 1.6 }}>Built during the war.</div></SlidingText><SlidingText from='right' delay={12}><div style={{ fontSize: 36, color: '#7b7f9e', textAlign: 'center', lineHeight: 1.6 }}>From a shelter in Tel Aviv.</div></SlidingText><SlidingText from='bottom' delay={24}><div style={{ fontSize: 28, color: '#4a4d6a', textAlign: 'center', marginTop: 20 }}>Open source. Free. No ads.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={450}><DarkScene accent={A} showGrid><SlidingText from='bottom'><div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: A, letterSpacing: 2 }}>missileprobability.com</div></SlidingText><SlidingText from='bottom' delay={15}><div style={{ fontSize: 28, color: '#4a4d6a', textAlign: 'center', marginTop: 16 }}>Your daily risk calculator.</div></SlidingText></DarkScene></TransitionSeries.Sequence>
    </TransitionSeries>
  </>);
}
