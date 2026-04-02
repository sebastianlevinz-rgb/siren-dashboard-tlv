/**
 * "Current Military Situation" — 85 seconds
 * Heavy scene rotation every 2-3s matching narration.
 */
import { Series, Audio, staticFile } from "remotion";
import { ReelLayoutV2 } from "../components/ReelLayoutV2";
import { SpringIn } from "../components/common/SpringIn";
import { AnimatedNumber } from "../components/common/AnimatedNumber";
import { TypeWriter } from "../components/common/TypeWriter";
import { MusicFadeOut } from "../components/common/MusicFadeOut";

const A = "#4A90D9";

function S({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return <ReelLayoutV2 accentColor={accent || A}>{children}</ReelLayoutV2>;
}

function StatRow({ icon, label, value, delay = 0 }: { icon: string; label: string; value: string; delay?: number }) {
  return (
    <SpringIn delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <span style={{ fontSize: 32 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#d8dae5" }}>{value}</div>
          <div style={{ fontSize: 20, color: "#4a4d6a" }}>{label}</div>
        </div>
      </div>
    </SpringIn>
  );
}

export function FinalSituation() {
  return (
    <>
      <Audio src={staticFile("audio/final-situation.mp3")} startFrom={15} />
      <MusicFadeOut file="bg-data-analysis.mp3" baseVolume={0.18} />
      <Series>
        {/* 0-3s: "Here's the current military situation" */}
        <Series.Sequence durationInFrames={90}>
          <S>
            <TypeWriter text="SITUATION REPORT" fontSize={56} color={A} />
            <SpringIn delay={30}><div style={{ fontSize: 28, color: "#c93d3d", textAlign: "center", marginTop: 12, letterSpacing: 2 }}>APRIL 2026</div></SpringIn>
          </S>
        </Series.Sequence>

        {/* 3-7s: "USS Harry Truman... Arabian Sea" */}
        <Series.Sequence durationInFrames={120}>
          <S accent="#c93d3d">
            <SpringIn>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🚢</div>
              <div style={{ fontSize: 36, fontWeight: 800, textAlign: "center", color: "#d8dae5" }}>USS Harry S. Truman</div>
              <div style={{ fontSize: 28, color: "#c93d3d", textAlign: "center", marginTop: 8 }}>CSG-8 — Arabian Sea</div>
              <div style={{ fontSize: 24, color: "#7b7f9e", textAlign: "center", marginTop: 8 }}>South of Strait of Hormuz</div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 7-10s: "second carrier may be en route" */}
        <Series.Sequence durationInFrames={90}>
          <S accent="#d4822a">
            <SpringIn>
              <div style={{ fontSize: 44, fontWeight: 700, textAlign: "center", color: "#d4822a" }}>2nd Carrier</div>
              <div style={{ fontSize: 36, color: "#7b7f9e", textAlign: "center", marginTop: 8 }}>Reported en route</div>
              <div style={{ fontSize: 28, color: "#4a4d6a", textAlign: "center", marginTop: 8 }}>⚠ Unconfirmed by OSINT</div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 10-16s: "Seven US forward bases" — list them */}
        <Series.Sequence durationInFrames={180}>
          <S>
            <div style={{ fontSize: 32, color: A, letterSpacing: 2, textAlign: "center", marginBottom: 16 }}>7 FORWARD BASES</div>
            <StatRow icon="🇶🇦" label="CENTCOM HQ" value="Al Udeid, Qatar" delay={0} />
            <StatRow icon="🇦🇪" label="Stealth base" value="Al Dhafra, UAE" delay={6} />
            <StatRow icon="🇰🇼" label="Ground staging" value="Camp Arifjan, Kuwait" delay={12} />
            <StatRow icon="🇧🇭" label="5th Fleet HQ" value="NSA Bahrain" delay={18} />
          </S>
        </Series.Sequence>

        {/* 16-22s: More bases */}
        <Series.Sequence durationInFrames={180}>
          <S>
            <StatRow icon="🇸🇦" label="Patriots + Fighters" value="Prince Sultan, Saudi Arabia" delay={0} />
            <StatRow icon="🇩🇯" label="SOF + Drones" value="Camp Lemonnier, Djibouti" delay={8} />
            <StatRow icon="🌊" label="B-2 / B-52 Bombers" value="Diego Garcia, Indian Ocean" delay={16} />
          </S>
        </Series.Sequence>

        {/* 22-28s: Force numbers */}
        <Series.Sequence durationInFrames={180}>
          <S>
            <div style={{ fontSize: 32, color: A, letterSpacing: 2, textAlign: "center", marginBottom: 20 }}>FORCE SUMMARY</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <SpringIn delay={0}>
                <div style={{ textAlign: "center" }}>
                  <AnimatedNumber value={45000} fontSize={64} color={A} prefix="~" />
                  <div style={{ fontSize: 24, color: "#7b7f9e", marginTop: 4 }}>CENTCOM Personnel</div>
                </div>
              </SpringIn>
              <SpringIn delay={12}>
                <div style={{ textAlign: "center" }}>
                  <AnimatedNumber value={180} fontSize={64} color="#c93d3d" prefix="~" />
                  <div style={{ fontSize: 24, color: "#7b7f9e", marginTop: 4 }}>Combat Aircraft</div>
                </div>
              </SpringIn>
            </div>
          </S>
        </Series.Sequence>

        {/* 28-35s: "Kharg Island — 90% of Iran's oil" */}
        <Series.Sequence durationInFrames={210}>
          <S accent="#d4822a">
            <SpringIn direction="scale">
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🏝️</div>
              <div style={{ fontSize: 44, fontWeight: 800, textAlign: "center", color: "#d4822a" }}>KHARG ISLAND</div>
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <AnimatedNumber value={90} fontSize={100} color="#d4822a" suffix="%" />
              </div>
              <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 8 }}>of Iran's oil exports</div>
              <div style={{ fontSize: 24, color: "#4a4d6a", textAlign: "center", marginTop: 8 }}>Primary strategic target</div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 35-42s: "Strait of Hormuz — 21% of world oil" */}
        <Series.Sequence durationInFrames={210}>
          <S accent="#c93d3d">
            <SpringIn direction="scale">
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🌊</div>
              <div style={{ fontSize: 44, fontWeight: 800, textAlign: "center", color: "#c93d3d" }}>STRAIT OF HORMUZ</div>
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <AnimatedNumber value={21} fontSize={100} color="#c93d3d" suffix="%" />
              </div>
              <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 8 }}>of global oil transit</div>
              <div style={{ fontSize: 24, color: "#4a4d6a", textAlign: "center", marginTop: 8 }}>33km at narrowest — Iran controls north shore</div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 42-50s: "Ground operation would target chokepoints" */}
        <Series.Sequence durationInFrames={240}>
          <S>
            <SpringIn>
              <div style={{ fontSize: 36, color: A, letterSpacing: 2, textAlign: "center", marginBottom: 20 }}>LIKELY TARGETS</div>
            </SpringIn>
            <SpringIn delay={10}><div style={{ fontSize: 32, color: "#d4822a", textAlign: "center", marginBottom: 12 }}>🏝️ Kharg Island — Oil exports</div></SpringIn>
            <SpringIn delay={20}><div style={{ fontSize: 32, color: "#c93d3d", textAlign: "center", marginBottom: 12 }}>🌊 Strait of Hormuz — Shipping lane</div></SpringIn>
            <SpringIn delay={30}><div style={{ fontSize: 32, color: "#a855f7", textAlign: "center", marginBottom: 12 }}>⚛️ Nuclear sites — Natanz, Fordow</div></SpringIn>
          </S>
        </Series.Sequence>

        {/* 50-58s: "Daily alerts dropped to 17 — lowest since war began" */}
        <Series.Sequence durationInFrames={240}>
          <S accent="#1a6b4a">
            <SpringIn direction="scale">
              <AnimatedNumber value={17} fontSize={140} color="#1a6b4a" />
              <div style={{ fontSize: 32, color: "#7b7f9e", textAlign: "center", marginTop: 12 }}>ALERTS ON APR 1</div>
              <div style={{ fontSize: 28, color: "#1a6b4a", textAlign: "center", marginTop: 8 }}>Lowest since the war began</div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 58-68s: "Pause before escalation or genuine de-escalation?" */}
        <Series.Sequence durationInFrames={300}>
          <S>
            <SpringIn>
              <div style={{ fontSize: 40, fontWeight: 700, textAlign: "center", color: "#d8dae5", lineHeight: 1.4 }}>
                Calm before the storm?
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, textAlign: "center", color: A, lineHeight: 1.4, marginTop: 12 }}>
                Or genuine de-escalation?
              </div>
            </SpringIn>
          </S>
        </Series.Sequence>

        {/* 68-85s: CTA */}
        <Series.Sequence durationInFrames={420}>
          <S>
            <SpringIn direction="scale">
              <div style={{ fontSize: 72, textAlign: "center", marginBottom: 20 }}>⚔️</div>
              <div style={{ fontSize: 44, fontWeight: 700, textAlign: "center", color: A, letterSpacing: 2 }}>wardashboard.live</div>
              <div style={{ fontSize: 28, color: "#4a4d6a", textAlign: "center", marginTop: 12 }}>Follow the data.</div>
            </SpringIn>
          </S>
        </Series.Sequence>
      </Series>
    </>
  );
}
