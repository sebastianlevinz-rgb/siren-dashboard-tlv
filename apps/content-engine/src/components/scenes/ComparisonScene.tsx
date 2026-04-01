import { AnimatedNumber } from "../common/AnimatedNumber";
import { FadeIn } from "../common/FadeIn";
import { ReelLayout } from "../ReelLayout";

interface Props {
  leftValue: number;
  leftLabel: string;
  rightValue: number;
  rightLabel: string;
  changePct: number;
}

export function ComparisonScene({ leftValue, leftLabel, rightValue, rightLabel, changePct }: Props) {
  const changeColor = changePct > 0 ? "#c93d3d" : changePct < -5 ? "#1a6b4a" : "#b8a02e";
  const arrow = changePct > 0 ? "↑" : changePct < -5 ? "↓" : "→";

  return (
    <ReelLayout>
      <FadeIn>
        <div style={{ display: "flex", gap: 40, alignItems: "center", padding: "0 60px" }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <AnimatedNumber value={leftValue} fontSize={80} color="#7b7f9e" />
            <div style={{ fontSize: 20, color: "#4a4d6a", marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>{leftLabel}</div>
          </div>
          <div style={{ fontSize: 60, color: changeColor }}>{arrow}</div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <AnimatedNumber value={rightValue} fontSize={80} color="#d8dae5" delay={10} />
            <div style={{ fontSize: 20, color: "#4a4d6a", marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>{rightLabel}</div>
          </div>
        </div>
        <FadeIn delay={20}>
          <div style={{ textAlign: "center", marginTop: 40, fontSize: 36, fontWeight: 700, color: changeColor }}>
            {arrow} {Math.abs(changePct).toFixed(0)}%
          </div>
        </FadeIn>
      </FadeIn>
    </ReelLayout>
  );
}
