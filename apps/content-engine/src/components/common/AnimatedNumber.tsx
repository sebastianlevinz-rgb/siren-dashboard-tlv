import { useCurrentFrame, interpolate, Easing } from "remotion";

interface Props {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  fontSize?: number;
  color?: string;
  delay?: number;
}

export function AnimatedNumber({ value, decimals = 0, suffix = "", prefix = "", fontSize = 72, color = "#d8dae5", delay = 0 }: Props) {
  const frame = useCurrentFrame();
  const num = interpolate(frame - delay, [0, 40], [0, value], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <span style={{ fontSize, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>
      {prefix}{num.toFixed(decimals)}{suffix}
    </span>
  );
}
