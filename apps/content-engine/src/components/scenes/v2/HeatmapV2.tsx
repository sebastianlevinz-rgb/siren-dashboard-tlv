import { useCurrentFrame, interpolate, Easing } from "remotion";
import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { SpringIn } from "../../common/SpringIn";

interface Props { grid: number[][]; maxVal: number; caption: string; accentColor?: string; }

function riskColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "#111b21";
  const r = value / max;
  if (r < 0.15) return "#1b5e4a";
  if (r < 0.3) return "#3d8b37";
  if (r < 0.5) return "#b8a02e";
  if (r < 0.75) return "#d4822a";
  return "#c93d3d";
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HeatmapV2({ grid, maxVal, caption, accentColor = "#4A90D9" }: Props) {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 90], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const total = 7 * 24;
  const visible = Math.floor(reveal * total);

  return (
    <ReelLayoutV2 accentColor={accentColor}>
      <SpringIn delay={0}>
        <div style={{ fontSize: 32, color: accentColor, letterSpacing: 3, textTransform: "uppercase", marginBottom: 30, textAlign: "center" }}>
          THREAT HEATMAP
        </div>
      </SpringIn>
      <div style={{ padding: "0 10px" }}>
        {DAYS.map((day, d) => (
          <div key={day} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ width: 48, fontSize: 28, color: "#7b7f9e", textAlign: "right" }}>{day}</span>
            {Array.from({ length: 24 }, (_, h) => {
              const idx = d * 24 + h;
              return (
                <div key={h} style={{
                  width: 32, height: 32, borderRadius: 4,
                  background: idx < visible ? riskColor(grid[d][h], maxVal) : "#111b21",
                }} />
              );
            })}
          </div>
        ))}
      </div>
      <SpringIn delay={30}>
        <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 24 }}>{caption}</div>
      </SpringIn>
    </ReelLayoutV2>
  );
}
