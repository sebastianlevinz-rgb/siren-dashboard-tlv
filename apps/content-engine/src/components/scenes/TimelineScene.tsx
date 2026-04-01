import { FadeIn } from "../common/FadeIn";
import { ReelLayout } from "../ReelLayout";

interface Props { date: string; title: string; before: number; after: number; changePct: number; }

export function TimelineScene({ date, title, before, after, changePct }: Props) {
  const color = changePct > 0 ? "#c93d3d" : "#1a6b4a";
  const arrow = changePct > 0 ? "↑" : "↓";

  return (
    <ReelLayout>
      <div style={{ padding: "0 70px", textAlign: "center" }}>
        <FadeIn>
          <div style={{ fontSize: 24, color: "#4A90D9", letterSpacing: 2, marginBottom: 20 }}>KEY EVENT</div>
          <div style={{ fontSize: 32, color: "#7b7f9e", marginBottom: 12 }}>{date}</div>
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.3, marginBottom: 40 }}>{title}</div>
        </FadeIn>
        <FadeIn delay={15}>
          <div style={{ display: "flex", justifyContent: "center", gap: 40, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, fontWeight: 700, color: "#7b7f9e" }}>{before.toFixed(0)}</div>
              <div style={{ fontSize: 18, color: "#4a4d6a", marginTop: 4 }}>48H BEFORE</div>
            </div>
            <div style={{ fontSize: 48, color }}>{arrow}</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, fontWeight: 700, color: "#d8dae5" }}>{after.toFixed(0)}</div>
              <div style={{ fontSize: 18, color: "#4a4d6a", marginTop: 4 }}>48H AFTER</div>
            </div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color, marginTop: 24 }}>
            {arrow} {Math.abs(changePct).toFixed(0)}%
          </div>
        </FadeIn>
      </div>
    </ReelLayout>
  );
}
