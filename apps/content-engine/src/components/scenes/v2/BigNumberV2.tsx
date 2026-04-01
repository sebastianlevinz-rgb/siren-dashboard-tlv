import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { AnimatedNumber } from "../../common/AnimatedNumber";
import { SpringIn } from "../../common/SpringIn";

interface Props { value: number; label: string; suffix?: string; color?: string; accentColor?: string; }

export function BigNumberV2({ value, label, suffix = "", color = "#d8dae5", accentColor = "#4A90D9" }: Props) {
  return (
    <ReelLayoutV2 accentColor={accentColor}>
      <SpringIn direction="scale">
        <div style={{ textAlign: "center" }}>
          <AnimatedNumber value={value} suffix={suffix} fontSize={140} color={color} />
          <div style={{ fontSize: 32, color: "#7b7f9e", marginTop: 20, letterSpacing: 3, textTransform: "uppercase" }}>{label}</div>
        </div>
      </SpringIn>
    </ReelLayoutV2>
  );
}
