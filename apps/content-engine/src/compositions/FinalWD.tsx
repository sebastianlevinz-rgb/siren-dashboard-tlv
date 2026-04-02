/**
 * "What is War Dashboard?" — 66 seconds
 */
import { Series, Audio, staticFile } from "remotion";
import { ReelLayoutV2 } from "../components/ReelLayoutV2";
import { SpringIn } from "../components/common/SpringIn";
import { AnimatedNumber } from "../components/common/AnimatedNumber";
import { TypeWriter } from "../components/common/TypeWriter";
import { MusicFadeOut } from "../components/common/MusicFadeOut";
import { PhotoScene } from "../components/common/PhotoScene";
import { TrendV2 } from "../components/scenes/v2/TrendV2";
import { REAL_DATA } from "../data/real-data";

const A = "#4A90D9";

function S({ children }: { children: React.ReactNode }) {
  return <ReelLayoutV2 accentColor={A}>{children}</ReelLayoutV2>;
}

export function FinalWD() {
  return (
    <>
      <Audio src={staticFile("audio/final-wd.mp3")} startFrom={15} />
      <MusicFadeOut file="bg-daily-briefing.mp3" baseVolume={0.18} />
      <Series>
        {/* 0-3s: "Day 33 of the Iran-Israel conflict" */}
        <Series.Sequence durationInFrames={90}>
          <S>
            <TypeWriter text={`DAY ${REAL_DATA.daysOfWar}`} fontSize={72} color={A} />
            <SpringIn delay={30}><div style={{ fontSize: 32, color: "#7b7f9e", textAlign: "center", marginTop: 12 }}>of the conflict</div></SpringIn>
          </S>
        </Series.Sequence>

        {/* 3-6s: "957 alerts. Dozens of regions hit." */}
        <Series.Sequence durationInFrames={90}>
          <PhotoScene image="explosion.jpg" darken={0.75} zoomDirection="in">
            <SpringIn direction="scale">
              <AnimatedNumber value={REAL_DATA.totalAlerts} fontSize={140} color={A} />
              <div style={{ fontSize: 32, color: "#7b7f9e", textAlign: "center", marginTop: 12 }}>ALERTS</div>
            </SpringIn>
          </PhotoScene>
        </Series.Sequence>

        {/* 6-9s: "But what is actually happening?" */}
        <Series.Sequence durationInFrames={90}>
          <S>
            <SpringIn>
              <div style={{ fontSize: 52, fontWeight: 800, textAlign: "center", color: "#d8dae5", lineHeight: 1.3 }}>
                But what is{"\n"}actually happening?
              </div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 9-12s: "War Dashboard is a civilian intelligence briefing" */}
        <Series.Sequence durationInFrames={90}>
          <S>
            <SpringIn direction="scale">
              <div style={{ fontSize: 60, textAlign: "center" }}>⚔️</div>
              <div style={{ fontSize: 44, fontWeight: 800, textAlign: "center", color: A, letterSpacing: 2, marginTop: 12 }}>WAR DASHBOARD</div>
              <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 8 }}>Civilian Intelligence Briefing</div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 12-16s: "organizes into clear patterns" */}
        <Series.Sequence durationInFrames={120}>
          <S>
            <div style={{ textAlign: "center" }}>
              <SpringIn delay={0}><div style={{ fontSize: 44, fontWeight: 700, color: "#d8dae5" }}>Every alert</div></SpringIn>
              <SpringIn delay={12}><div style={{ fontSize: 44, fontWeight: 700, color: A, marginTop: 8 }}>organized</div></SpringIn>
              <SpringIn delay={24}><div style={{ fontSize: 44, fontWeight: 700, color: "#7b7f9e", marginTop: 8 }}>into clear patterns</div></SpringIn>
            </div>
          </S>
        </Series.Sequence>

        {/* 16-22s: "Weekly evolution" — show trend */}
        <Series.Sequence durationInFrames={180}>
          <TrendV2 dailyCounts={REAL_DATA.dailyCounts} caption="Escalating or calming down?" accentColor={A} />
        </Series.Sequence>

        {/* 22-27s: "Geopolitical timeline" */}
        <Series.Sequence durationInFrames={150}>
          <S>
            <SpringIn>
              <div style={{ fontSize: 36, color: A, letterSpacing: 3, textAlign: "center", marginBottom: 20 }}>WAR TIMELINE</div>
            </SpringIn>
            <SpringIn delay={8}>
              <div style={{ display: "flex", gap: 12, flexDirection: "column", width: "100%" }}>
                {["🎯 IRGC targets struck in Syria", "🕊️ UN calls for ceasefire", "💥 IRGC commander eliminated", "🇺🇸 US carrier near Hormuz"].map((ev, i) => (
                  <SpringIn key={i} delay={i * 8}><div style={{ fontSize: 28, color: i % 2 === 0 ? "#c93d3d" : "#7b7f9e", padding: "8px 0", borderBottom: "1px solid #252840" }}>{ev}</div></SpringIn>
                ))}
              </div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 27-32s: "Situation room — US military positioning" */}
        <Series.Sequence durationInFrames={150}>
          <PhotoScene image="war-room.jpg" darken={0.8} zoomDirection="out">
            <SpringIn direction="scale">
              <div style={{ fontSize: 36, color: A, letterSpacing: 3, textAlign: "center", marginBottom: 16 }}>SITUATION ROOM</div>
              <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", lineHeight: 1.6 }}>
                US military positioning{"\n"}around the Persian Gulf
              </div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 20 }}>
                <SpringIn delay={10}><div style={{ fontSize: 36, textAlign: "center" }}>🚢</div></SpringIn>
                <SpringIn delay={15}><div style={{ fontSize: 36, textAlign: "center" }}>🏗️</div></SpringIn>
                <SpringIn delay={20}><div style={{ fontSize: 36, textAlign: "center" }}>✈️</div></SpringIn>
              </div>
            </SpringIn>
          </PhotoScene>
        </Series.Sequence>

        {/* 32-38s: "Region breakdowns, daily intensity" */}
        <Series.Sequence durationInFrames={180}>
          <S>
            <div style={{ width: "100%" }}>
              {[{ name: "North", pct: 90, color: "#c93d3d" }, { name: "Gush Dan", pct: 27, color: "#d4822a" }, { name: "Jerusalem", pct: 27, color: "#b8a02e" }, { name: "South", pct: 25, color: A }].map((r, i) => (
                <SpringIn key={r.name} delay={i * 10}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, width: 120 }}>{r.name}</span>
                    <div style={{ flex: 1, height: 20, background: "#1a1a2e", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, borderRadius: 10 }} />
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 700, color: r.color, width: 50 }}>{r.pct}%</span>
                  </div>
                </SpringIn>
              ))}
            </div>
          </S>
        </Series.Sequence>

        {/* 38-44s: "Not news. Not speculation. Raw data." */}
        <Series.Sequence durationInFrames={180}>
          <S>
            <div style={{ textAlign: "center" }}>
              <SpringIn delay={0}><div style={{ fontSize: 44, color: "#4a4d6a", textDecoration: "line-through" }}>Not news.</div></SpringIn>
              <SpringIn delay={12}><div style={{ fontSize: 44, color: "#4a4d6a", textDecoration: "line-through", marginTop: 8 }}>Not speculation.</div></SpringIn>
              <SpringIn delay={24}><div style={{ fontSize: 52, fontWeight: 800, color: "#d8dae5", marginTop: 16 }}>Raw data.</div></SpringIn>
            </div>
          </S>
        </Series.Sequence>

        {/* 44-50s: "Free. Open source. Updated daily." */}
        <Series.Sequence durationInFrames={180}>
          <S>
            <div style={{ textAlign: "center" }}>
              <SpringIn><div style={{ fontSize: 40, color: "#7b7f9e", lineHeight: 1.8 }}>Free. Open source.{"\n"}Updated daily.</div></SpringIn>
            </div>
          </S>
        </Series.Sequence>

        {/* 50-66s: CTA */}
        <Series.Sequence durationInFrames={390}>
          <S>
            <SpringIn direction="scale">
              <div style={{ fontSize: 72, textAlign: "center", marginBottom: 20 }}>⚔️</div>
              <div style={{ fontSize: 48, fontWeight: 700, textAlign: "center", color: A, letterSpacing: 2 }}>wardashboard.live</div>
              <div style={{ fontSize: 28, color: "#4a4d6a", textAlign: "center", marginTop: 16 }}>Your daily intelligence briefing.</div>
            </SpringIn>
          </S>
        </Series.Sequence>
      </Series>
    </>
  );
}
