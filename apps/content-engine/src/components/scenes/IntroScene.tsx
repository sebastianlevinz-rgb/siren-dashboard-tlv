import { FadeIn } from "../common/FadeIn";
import { ReelLayout } from "../ReelLayout";

interface Props { title?: string; subtitle?: string; }

export function IntroScene({ title = "WAR DASHBOARD", subtitle = "Daily Briefing" }: Props) {
  return (
    <ReelLayout>
      <FadeIn>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>⚔️</div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: 4, color: "#d8dae5" }}>{title}</div>
          <div style={{ fontSize: 24, color: "#4A90D9", letterSpacing: 3, marginTop: 12, textTransform: "uppercase" }}>{subtitle}</div>
          <div style={{ width: 120, height: 3, background: "#4A90D9", margin: "24px auto 0", borderRadius: 2 }} />
        </div>
      </FadeIn>
    </ReelLayout>
  );
}
