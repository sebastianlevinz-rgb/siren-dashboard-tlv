import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { SpringIn } from "../../common/SpringIn";

interface Props { date: string; title: string; before: number; after: number; changePct: number; caption: string; accentColor?: string; }

export function TimelineV2({ date, title, before, after, changePct, caption, accentColor = "#4A90D9" }: Props) {
  const color = changePct > 0 ? "#c93d3d" : "#1a6b4a";
  const arrow = changePct > 0 ? "↑" : "↓";

  return (
    <ReelLayoutV2 accentColor={accentColor}>
      <SpringIn>
        <div style={{ fontSize: 32, color: accentColor, letterSpacing: 3, textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
          KEY EVENT
        </div>
      </SpringIn>
      <SpringIn delay={8}>
        <div style={{ fontSize: 36, color: "#7b7f9e", textAlign: "center", marginBottom: 12 }}>{date}</div>
        <div style={{ fontSize: 40, fontWeight: 700, textAlign: "center", lineHeight: 1.3, marginBottom: 32, padding: "0 10px" }}>{title}</div>
      </SpringIn>
      <SpringIn delay={16}>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: "#7b7f9e" }}>{before.toFixed(0)}</div>
            <div style={{ fontSize: 28, color: "#4a4d6a", marginTop: 4 }}>48H BEFORE</div>
          </div>
          <div style={{ fontSize: 56, color }}>{arrow}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, fontWeight: 700 }}>{after.toFixed(0)}</div>
            <div style={{ fontSize: 28, color: "#4a4d6a", marginTop: 4 }}>48H AFTER</div>
          </div>
        </div>
      </SpringIn>
      <SpringIn delay={24}>
        <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 24 }}>{caption}</div>
      </SpringIn>
    </ReelLayoutV2>
  );
}
