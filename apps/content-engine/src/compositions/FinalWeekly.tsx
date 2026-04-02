/**
 * "5 Weeks of War — Weekly Recap" — 92 seconds
 * Each week gets its own visual block with key stats.
 */
import { Series, Audio, staticFile } from "remotion";
import { ReelLayoutV2 } from "../components/ReelLayoutV2";
import { SpringIn } from "../components/common/SpringIn";
import { AnimatedNumber } from "../components/common/AnimatedNumber";
import { TypeWriter } from "../components/common/TypeWriter";
import { MusicFadeOut } from "../components/common/MusicFadeOut";
import { ProgressBar } from "../components/common/ProgressBar";

const A = "#4A90D9";
const RED = "#c93d3d";
const GREEN = "#1a6b4a";

function S({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return <ReelLayoutV2 accentColor={accent || A}>{children}</ReelLayoutV2>;
}

function WeekCard({ num, dates, alerts, maxAlerts, event, eventIcon, color, delay = 0 }: {
  num: number; dates: string; alerts: number; maxAlerts: number; event: string; eventIcon: string; color: string; delay?: number;
}) {
  return (
    <S accent={color}>
      <SpringIn>
        <div style={{ fontSize: 28, color: "#4a4d6a", letterSpacing: 2, textAlign: "center" }}>WEEK {num}</div>
        <div style={{ fontSize: 24, color: "#7b7f9e", textAlign: "center", marginTop: 4 }}>{dates}</div>
      </SpringIn>
      <SpringIn delay={10}>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <AnimatedNumber value={alerts} fontSize={100} color={color} delay={10} />
          <div style={{ fontSize: 24, color: "#7b7f9e", marginTop: 4 }}>ALERTS</div>
        </div>
      </SpringIn>
      <SpringIn delay={20}>
        <div style={{ width: "100%", marginTop: 20 }}>
          <ProgressBar progress={(alerts / maxAlerts) * 100} color={color} height={20} delay={20} />
        </div>
      </SpringIn>
      <SpringIn delay={30}>
        <div style={{ fontSize: 28, textAlign: "center", marginTop: 20, color: "#d8dae5", lineHeight: 1.4 }}>
          {eventIcon} {event}
        </div>
      </SpringIn>
    </S>
  );
}

export function FinalWeekly() {
  const maxAlerts = 229; // Week 4 was heaviest

  return (
    <>
      <Audio src={staticFile("audio/final-weekly.mp3")} startFrom={15} />
      <MusicFadeOut file="bg-outro-safe.mp3" baseVolume={0.18} />
      <Series>
        {/* 0-3s: "Five weeks of the Iran-Israel conflict" */}
        <Series.Sequence durationInFrames={90}>
          <S>
            <TypeWriter text="5 WEEKS OF WAR" fontSize={56} color={A} />
            <SpringIn delay={30}><div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 12 }}>Week-by-week recap</div></SpringIn>
          </S>
        </Series.Sequence>

        {/* 3-6s: Intro "Here's what happened" */}
        <Series.Sequence durationInFrames={90}>
          <S>
            <SpringIn>
              <div style={{ fontSize: 44, fontWeight: 700, textAlign: "center", color: "#d8dae5" }}>Here's what happened.</div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 6-17s: WEEK 1 */}
        <Series.Sequence durationInFrames={330}>
          <WeekCard num={1} dates="Feb 28 — Mar 6" alerts={198} maxAlerts={maxAlerts} event="First direct barrage since Oct 2024. Israel strikes Syria." eventIcon="💥" color={RED} />
        </Series.Sequence>

        {/* 17-28s: WEEK 2 */}
        <Series.Sequence durationInFrames={330}>
          <WeekCard num={2} dates="Mar 7 — Mar 13" alerts={204} maxAlerts={maxAlerts} event="Iran retaliates multi-front. UN calls ceasefire." eventIcon="🕊️" color="#d4822a" />
        </Series.Sequence>

        {/* 28-40s: WEEK 3 */}
        <Series.Sequence durationInFrames={360}>
          <WeekCard num={3} dates="Mar 14 — Mar 20" alerts={199} maxAlerts={maxAlerts} event="Sanctions expand. IRGC commander eliminated." eventIcon="🎯" color="#b8a02e" />
        </Series.Sequence>

        {/* 40-55s: WEEK 4 — THE HEAVIEST */}
        <Series.Sequence durationInFrames={450}>
          <WeekCard num={4} dates="Mar 21 — Mar 27" alerts={229} maxAlerts={maxAlerts} event="Retaliation peaks. 42 alerts in one day. Heaviest week." eventIcon="🔥" color={RED} />
        </Series.Sequence>

        {/* 55-68s: WEEK 5 */}
        <Series.Sequence durationInFrames={390}>
          <WeekCard num={5} dates="Mar 28 — Apr 1" alerts={127} maxAlerts={maxAlerts} event="Intensity drops. US carrier near Hormuz. 17 alerts — lowest day." eventIcon="🇺🇸" color={GREEN} />
        </Series.Sequence>

        {/* 68-76s: "Calm before the storm?" */}
        <Series.Sequence durationInFrames={240}>
          <S>
            <SpringIn>
              <div style={{ fontSize: 44, fontWeight: 700, textAlign: "center", color: "#d8dae5", lineHeight: 1.4 }}>
                Is this the calm{"\n"}before the storm?
              </div>
            </SpringIn>
            <SpringIn delay={20}>
              <div style={{ fontSize: 36, color: A, textAlign: "center", marginTop: 20 }}>
                Or the beginning of the end?
              </div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 76-82s: "The data will tell us" */}
        <Series.Sequence durationInFrames={180}>
          <S>
            <SpringIn direction="scale">
              <div style={{ fontSize: 48, fontWeight: 800, textAlign: "center", color: "#d8dae5" }}>
                The data will tell us.
              </div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 82-92s: CTA */}
        <Series.Sequence durationInFrames={300}>
          <S>
            <SpringIn direction="scale">
              <div style={{ fontSize: 72, textAlign: "center", marginBottom: 20 }}>⚔️</div>
              <div style={{ fontSize: 44, fontWeight: 700, textAlign: "center", color: A, letterSpacing: 2 }}>wardashboard.live</div>
              <div style={{ fontSize: 28, color: "#4a4d6a", textAlign: "center", marginTop: 12 }}>Follow the conflict. Stay informed.</div>
            </SpringIn>
          </S>
        </Series.Sequence>
      </Series>
    </>
  );
}
