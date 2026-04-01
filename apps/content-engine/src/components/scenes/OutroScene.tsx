import { FadeIn } from "../common/FadeIn";
import { ReelLayout } from "../ReelLayout";

export function OutroScene() {
  return (
    <ReelLayout>
      <FadeIn>
        <div style={{ textAlign: "center", padding: "0 60px" }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>⚔️</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Stay informed. Stay safe.</div>
          <div style={{ fontSize: 28, color: "#4A90D9", letterSpacing: 2, marginBottom: 32 }}>wardashboard.live</div>
          <div style={{ width: 80, height: 3, background: "#252840", margin: "0 auto", borderRadius: 2 }} />
          <div style={{ fontSize: 20, color: "#4a4d6a", marginTop: 24 }}>Follow for daily intel briefings</div>
        </div>
      </FadeIn>
    </ReelLayout>
  );
}
