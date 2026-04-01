import { AnimatedNumber } from "../common/AnimatedNumber";
import { FadeIn } from "../common/FadeIn";
import { ReelLayout } from "../ReelLayout";

interface Props { value: number; label: string; suffix?: string; color?: string; }

export function BigNumberScene({ value, label, suffix = "", color = "#d8dae5" }: Props) {
  return (
    <ReelLayout>
      <FadeIn>
        <div style={{ textAlign: "center", padding: "0 60px" }}>
          <AnimatedNumber value={value} suffix={suffix} fontSize={120} color={color} />
          <div style={{ fontSize: 28, color: "#7b7f9e", marginTop: 16, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
        </div>
      </FadeIn>
    </ReelLayout>
  );
}
