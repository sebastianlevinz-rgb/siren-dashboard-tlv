import { useCurrentFrame, interpolate, Easing } from "remotion";
import { ReelLayout } from "../ReelLayout";
import { FadeIn } from "../common/FadeIn";

interface Props { grid: number[][]; maxVal: number; }

function getRiskColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "#111b21";
  const ratio = value / max;
  if (ratio < 0.15) return "#1b5e4a";
  if (ratio < 0.3) return "#3d8b37";
  if (ratio < 0.5) return "#b8a02e";
  if (ratio < 0.75) return "#d4822a";
  return "#c93d3d";
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HeatmapScene({ grid, maxVal }: Props) {
  const frame = useCurrentFrame();
  const revealProgress = interpolate(frame, [0, 90], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const totalCells = 7 * 24;
  const visibleCells = Math.floor(revealProgress * totalCells);

  return (
    <ReelLayout>
      <FadeIn>
        <div style={{ fontSize: 28, color: "#4A90D9", letterSpacing: 3, textTransform: "uppercase", marginBottom: 30, textAlign: "center" }}>
          Threat Heatmap
        </div>
      </FadeIn>
      <div style={{ padding: "0 50px" }}>
        {DAYS.map((day, d) => (
          <div key={day} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 50, fontSize: 16, color: "#7b7f9e", textAlign: "right" }}>{day}</span>
            {Array.from({ length: 24 }, (_, h) => {
              const cellIndex = d * 24 + h;
              const show = cellIndex < visibleCells;
              return (
                <div
                  key={h}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    background: show ? getRiskColor(grid[d][h], maxVal) : "#111b21",
                    transition: "none",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </ReelLayout>
  );
}
