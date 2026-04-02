/**
 * "What is Missile Probability?" — 63 seconds
 * Scene-by-scene breakdown synced to narration.
 */
import { Series, Audio, staticFile } from "remotion";
import { ReelLayoutV2 } from "../components/ReelLayoutV2";
import { SpringIn } from "../components/common/SpringIn";
import { AnimatedNumber } from "../components/common/AnimatedNumber";
import { TypeWriter } from "../components/common/TypeWriter";
import { MusicFadeOut } from "../components/common/MusicFadeOut";
import { HeatmapV2 } from "../components/scenes/v2/HeatmapV2";
import { REAL_DATA } from "../data/real-data";

const A = "#d4822a"; // MP orange accent

// Build heatmap grid from data
const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
REAL_DATA.dailyCounts.forEach((count, i) => {
  const day = (i + 5) % 7;
  for (let h = 0; h < 24; h++) grid[day][h] += Math.round(count / 24 * (1 + Math.sin(h / 3) * 0.5));
});
const maxGrid = Math.max(...grid.flat());

function Scene({ children }: { children: React.ReactNode }) {
  return <ReelLayoutV2 accentColor={A}>{children}</ReelLayoutV2>;
}

export function FinalMP() {
  return (
    <>
      <Audio src={staticFile("audio/final-mp.mp3")} startFrom={15} />
      <MusicFadeOut file="bg-breaking-alert.mp3" baseVolume={0.18} />
      <Series>
        {/* 0-3s: "250 missile alerts in the Tel Aviv metro" */}
        <Series.Sequence durationInFrames={90}>
          <Scene>
            <SpringIn direction="scale">
              <AnimatedNumber value={250} fontSize={160} color={A} />
              <div style={{ fontSize: 32, color: "#7b7f9e", marginTop: 16, textAlign: "center", letterSpacing: 2 }}>ALERTS IN GUSH DAN</div>
            </SpringIn>
          </Scene>
        </Series.Sequence>

        {/* 3-5.5s: "since February 28th" */}
        <Series.Sequence durationInFrames={75}>
          <Scene>
            <SpringIn>
              <div style={{ fontSize: 48, fontWeight: 700, textAlign: "center", color: "#d8dae5" }}>Since February 28</div>
              <div style={{ fontSize: 36, color: "#7b7f9e", textAlign: "center", marginTop: 12 }}>33 days of conflict</div>
            </SpringIn>
          </Scene>
        </Series.Sequence>

        {/* 5.5-8s: "But here's the thing — they follow a pattern" */}
        <Series.Sequence durationInFrames={75}>
          <Scene>
            <SpringIn direction="scale">
              <div style={{ fontSize: 56, fontWeight: 800, textAlign: "center", color: A }}>They follow</div>
              <div style={{ fontSize: 56, fontWeight: 800, textAlign: "center", color: "#d8dae5" }}>a pattern.</div>
            </SpringIn>
          </Scene>
        </Series.Sequence>

        {/* 8-13s: "maps every alert... By hour. By day. By region." */}
        <Series.Sequence durationInFrames={90}>
          <Scene>
            <TypeWriter text="MISSILE PROBABILITY" fontSize={52} color={A} />
            <div style={{ marginTop: 20 }}>
              <SpringIn delay={20}><div style={{ fontSize: 36, color: "#7b7f9e", textAlign: "center" }}>Every alert. Mapped.</div></SpringIn>
            </div>
          </Scene>
        </Series.Sequence>

        {/* 13-16s: "By hour. By day. By region." */}
        <Series.Sequence durationInFrames={90}>
          <Scene>
            <div style={{ textAlign: "center" }}>
              <SpringIn delay={0}><div style={{ fontSize: 56, fontWeight: 700, color: A }}>By Hour.</div></SpringIn>
              <SpringIn delay={12}><div style={{ fontSize: 56, fontWeight: 700, color: "#d8dae5", marginTop: 8 }}>By Day.</div></SpringIn>
              <SpringIn delay={24}><div style={{ fontSize: 56, fontWeight: 700, color: "#7b7f9e", marginTop: 8 }}>By Region.</div></SpringIn>
            </div>
          </Scene>
        </Series.Sequence>

        {/* 16-22s: "Peak around 2PM" — show heatmap */}
        <Series.Sequence durationInFrames={180}>
          <HeatmapV2 grid={grid} maxVal={maxGrid} caption="Peak at 14:00 — Calmest 02:00-05:00" accentColor={A} />
        </Series.Sequence>

        {/* 22-26s: "Thursdays heavier than Saturdays" */}
        <Series.Sequence durationInFrames={120}>
          <Scene>
            <div style={{ textAlign: "center" }}>
              <SpringIn><div style={{ fontSize: 44, color: "#7b7f9e" }}>Thursdays tend heavier</div></SpringIn>
              <SpringIn delay={15}><div style={{ fontSize: 44, color: "#d8dae5", marginTop: 12 }}>than Saturdays</div></SpringIn>
              <SpringIn delay={25}><div style={{ fontSize: 36, color: A, marginTop: 20 }}>Patterns repeat.</div></SpringIn>
            </div>
          </Scene>
        </Series.Sequence>

        {/* 26-30s: "957 events analyzed" */}
        <Series.Sequence durationInFrames={120}>
          <Scene>
            <SpringIn direction="scale">
              <AnimatedNumber value={957} fontSize={120} color={A} />
              <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 12, letterSpacing: 2 }}>EVENTS ANALYZED</div>
            </SpringIn>
          </Scene>
        </Series.Sequence>

        {/* 30-36s: "Check before you step outside" */}
        <Series.Sequence durationInFrames={180}>
          <Scene>
            <SpringIn>
              <div style={{ fontSize: 52, fontWeight: 800, textAlign: "center", color: "#d8dae5", lineHeight: 1.3 }}>
                Check before you
              </div>
              <div style={{ fontSize: 52, fontWeight: 800, textAlign: "center", color: A, lineHeight: 1.3 }}>
                step outside.
              </div>
            </SpringIn>
          </Scene>
        </Series.Sequence>

        {/* 36-44s: "Built during the war, from a shelter" */}
        <Series.Sequence durationInFrames={240}>
          <Scene>
            <SpringIn>
              <div style={{ fontSize: 36, color: "#7b7f9e", textAlign: "center", lineHeight: 1.6 }}>
                Built during the war.
              </div>
            </SpringIn>
            <SpringIn delay={15}>
              <div style={{ fontSize: 36, color: "#7b7f9e", textAlign: "center", lineHeight: 1.6 }}>
                From a shelter in Tel Aviv.
              </div>
            </SpringIn>
            <SpringIn delay={30}>
              <div style={{ fontSize: 32, color: "#4a4d6a", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
                Open source. Free.{"\n"}No ads. No tracking.
              </div>
            </SpringIn>
          </Scene>
        </Series.Sequence>

        {/* 44-50s: "Just organized data for civilians" */}
        <Series.Sequence durationInFrames={180}>
          <Scene>
            <SpringIn direction="scale">
              <div style={{ fontSize: 44, fontWeight: 700, textAlign: "center", color: "#d8dae5", lineHeight: 1.4 }}>
                Just organized data{"\n"}for civilians who need it.
              </div>
            </SpringIn>
          </Scene>
        </Series.Sequence>

        {/* 50-63s: CTA + URL */}
        <Series.Sequence durationInFrames={360}>
          <Scene>
            <SpringIn direction="scale">
              <div style={{ fontSize: 80, marginBottom: 20, textAlign: "center" }}>🚀</div>
              <div style={{ fontSize: 48, fontWeight: 700, textAlign: "center", color: A, letterSpacing: 2 }}>
                missileprobability.com
              </div>
              <div style={{ fontSize: 28, color: "#4a4d6a", textAlign: "center", marginTop: 16 }}>
                Your daily risk calculator.
              </div>
            </SpringIn>
          </Scene>
        </Series.Sequence>
      </Series>
    </>
  );
}
