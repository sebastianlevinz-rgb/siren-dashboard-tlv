import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { SpringIn } from "../../common/SpringIn";

interface Props { text: string; accentColor?: string; }

export function DisclaimerScene({ text, accentColor = "#4A90D9" }: Props) {
  return (
    <ReelLayoutV2 accentColor={accentColor}>
      <SpringIn direction="scale">
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          border: "1px solid #252840",
          borderRadius: 16,
          background: "rgba(18, 19, 28, 0.8)",
        }}>
          <div style={{ fontSize: 36, color: "#7b7f9e", lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {text}
          </div>
        </div>
      </SpringIn>
    </ReelLayoutV2>
  );
}
