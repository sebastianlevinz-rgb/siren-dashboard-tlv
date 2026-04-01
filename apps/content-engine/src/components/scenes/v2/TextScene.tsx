import { useCurrentFrame } from "remotion";
import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { SpringIn } from "../../common/SpringIn";

interface Props {
  line1: string;
  line2?: string;
  line3?: string;
  big?: boolean;
  flash?: boolean;
  color?: string;
  accentColor?: string;
}

export function TextScene({ line1, line2, line3, big, flash, color, accentColor = "#4A90D9" }: Props) {
  const frame = useCurrentFrame();
  const flashVisible = flash ? frame % 30 < 20 : true;

  return (
    <ReelLayoutV2 accentColor={accentColor}>
      <div style={{ textAlign: "center", width: "100%", padding: "0 20px" }}>
        <SpringIn delay={0} direction="up">
          <div style={{
            fontSize: big ? 64 : 48,
            fontWeight: 800,
            color: color || (flash ? "#c93d3d" : "#d8dae5"),
            lineHeight: 1.3,
            opacity: flashVisible ? 1 : 0.3,
          }}>
            {line1}
          </div>
        </SpringIn>
        {line2 && (
          <SpringIn delay={8} direction="up">
            <div style={{
              fontSize: big ? 64 : 44,
              fontWeight: 700,
              color: color || accentColor,
              lineHeight: 1.3,
              marginTop: 16,
            }}>
              {line2}
            </div>
          </SpringIn>
        )}
        {line3 && (
          <SpringIn delay={16} direction="up">
            <div style={{
              fontSize: 40,
              fontWeight: 600,
              color: "#7b7f9e",
              lineHeight: 1.3,
              marginTop: 12,
            }}>
              {line3}
            </div>
          </SpringIn>
        )}
      </div>
    </ReelLayoutV2>
  );
}
