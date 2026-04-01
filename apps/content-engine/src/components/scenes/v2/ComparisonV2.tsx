import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { SpringIn } from "../../common/SpringIn";
import { AnimatedNumber } from "../../common/AnimatedNumber";

interface Props { leftValue: number; leftLabel: string; rightValue: number; rightLabel: string; changePct: number; caption: string; accentColor?: string; }

export function ComparisonV2({ leftValue, leftLabel, rightValue, rightLabel, changePct, caption, accentColor = "#4A90D9" }: Props) {
  const color = changePct > 0 ? "#c93d3d" : changePct < -5 ? "#1a6b4a" : "#b8a02e";
  const arrow = changePct > 0 ? "↑" : changePct < -5 ? "↓" : "→";

  return (
    <ReelLayoutV2 accentColor={accentColor}>
      <SpringIn>
        <div style={{ display: "flex", gap: 40, alignItems: "center", width: "100%" }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <AnimatedNumber value={leftValue} fontSize={80} color="#7b7f9e" />
            <div style={{ fontSize: 28, color: "#4a4d6a", marginTop: 10, textTransform: "uppercase" }}>{leftLabel}</div>
          </div>
          <div style={{ fontSize: 64, color }}>{arrow}</div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <AnimatedNumber value={rightValue} fontSize={80} delay={10} />
            <div style={{ fontSize: 28, color: "#4a4d6a", marginTop: 10, textTransform: "uppercase" }}>{rightLabel}</div>
          </div>
        </div>
      </SpringIn>
      <SpringIn delay={20}>
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 44, fontWeight: 700, color }}>
          {arrow} {Math.abs(changePct).toFixed(0)}%
        </div>
        <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 16 }}>{caption}</div>
      </SpringIn>
    </ReelLayoutV2>
  );
}
