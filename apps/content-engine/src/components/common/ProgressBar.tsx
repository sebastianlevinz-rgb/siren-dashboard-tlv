import { useCurrentFrame, interpolate, Easing } from "remotion";

interface Props {
  progress: number; // 0-100
  color?: string;
  height?: number;
  delay?: number;
}

export function ProgressBar({ progress, color = "#4A90D9", height = 16, delay = 0 }: Props) {
  const frame = useCurrentFrame();
  const width = interpolate(frame - delay, [0, 30], [0, progress], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ width: "100%", height, background: "#1a1a2e", borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ width: `${width}%`, height: "100%", background: color, borderRadius: height / 2, transition: "none" }} />
    </div>
  );
}
