/**
 * Animated horizontal bar chart that fills in with spring physics.
 */
import { useCurrentFrame, spring, useVideoConfig } from "remotion";

interface Bar {
  label: string;
  value: number;
  color: string;
}

interface Props {
  bars: Bar[];
  maxValue?: number;
}

export function AnimatedBars({ bars, maxValue }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = maxValue || Math.max(...bars.map(b => b.value));

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {bars.map((bar, i) => {
        const progress = spring({ frame: frame - i * 6, fps, config: { damping: 18, mass: 0.8, stiffness: 100 } });
        const width = (bar.value / max) * 100 * progress;
        const numVal = Math.round(bar.value * progress);

        return (
          <div key={bar.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: "#d8dae5" }}>{bar.label}</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: bar.color, fontVariantNumeric: "tabular-nums" }}>{numVal}</span>
            </div>
            <div style={{ height: 16, background: "#111b21", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ width: `${width}%`, height: "100%", background: bar.color, borderRadius: 8, boxShadow: `0 0 8px ${bar.color}40` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
