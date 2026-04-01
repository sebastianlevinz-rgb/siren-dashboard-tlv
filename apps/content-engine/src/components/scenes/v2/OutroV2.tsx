import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { SpringIn } from "../../common/SpringIn";

interface Props { url: string; accent?: string; }

export function OutroV2({ url, accent = "#4A90D9" }: Props) {
  return (
    <ReelLayoutV2 accentColor={accent} showBranding={false}>
      <SpringIn direction="scale">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>⚔️</div>
          <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 20, color: "#d8dae5" }}>Stay informed. Stay safe.</div>
          <div style={{ fontSize: 40, color: accent, letterSpacing: 2, whiteSpace: "pre-line", lineHeight: 1.6 }}>{url}</div>
          <div style={{ width: 80, height: 3, background: "#252840", margin: "28px auto 0", borderRadius: 2 }} />
        </div>
      </SpringIn>
    </ReelLayoutV2>
  );
}
