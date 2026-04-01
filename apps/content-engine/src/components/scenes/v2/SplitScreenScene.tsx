import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { SpringIn } from "../../common/SpringIn";

export function SplitScreenScene() {
  return (
    <ReelLayoutV2 accentColor="#4A90D9">
      <div style={{ display: "flex", width: "100%", height: "100%", gap: 4 }}>
        <SpringIn delay={0} direction="left">
          <div style={{
            flex: 1, background: "rgba(74, 144, 217, 0.08)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            borderRight: "2px solid #4A90D9", padding: 20,
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>⚔️</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#4A90D9" }}>WAR</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#4A90D9" }}>DASHBOARD</div>
          </div>
        </SpringIn>
        <SpringIn delay={8} direction="right">
          <div style={{
            flex: 1, background: "rgba(212, 130, 42, 0.08)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            borderLeft: "2px solid #d4822a", padding: 20,
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🚀</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#d4822a" }}>MISSILE</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#d4822a" }}>PROBABILITY</div>
          </div>
        </SpringIn>
      </div>
    </ReelLayoutV2>
  );
}
