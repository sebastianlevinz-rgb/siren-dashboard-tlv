/**
 * Animated week bar for weekly recap — fills with spring, shows alert count.
 */
import { useCurrentFrame, spring, useVideoConfig } from "remotion";

interface Props {
  weekNum: number;
  dates: string;
  alerts: number;
  maxAlerts: number;
  event: string;
  color: string;
}

export function WeekBar({ weekNum, dates, alerts, maxAlerts, event, color }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 80 } });
  const width = (alerts / maxAlerts) * 100 * progress;
  const num = Math.round(alerts * progress);

  return (
    <div style={{ width: "100%", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color }}>W{weekNum} <span style={{ fontWeight: 400, color: "#4a4d6a", fontSize: 16 }}>{dates}</span></span>
        <span style={{ fontSize: 28, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{num}</span>
      </div>
      <div style={{ height: 20, background: "#111b21", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: `${width}%`, height: "100%", background: color, borderRadius: 10, boxShadow: `0 0 12px ${color}30` }} />
      </div>
      <div style={{ fontSize: 16, color: "#7b7f9e", marginTop: 4 }}>{event}</div>
    </div>
  );
}
