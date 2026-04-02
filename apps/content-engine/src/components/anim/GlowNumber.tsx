/**
 * Big number with pulsing glow effect — more dramatic than plain AnimatedNumber.
 */
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from "remotion";

interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: string;
  size?: number;
}

export function GlowNumber({ value, suffix = "", prefix = "", label, color = "#4A90D9", size = 120 }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 20, mass: 1, stiffness: 80 } });
  const num = interpolate(progress, [0, 1], [0, value]);
  const glow = Math.sin(frame * 0.1) * 10 + 15;
  const scale = interpolate(progress, [0, 0.5, 1], [0.5, 1.1, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
      <div style={{
        fontSize: size, fontWeight: 800, color,
        fontFamily: "'JetBrains Mono', monospace",
        textShadow: `0 0 ${glow}px ${color}40, 0 0 ${glow * 2}px ${color}20`,
        fontVariantNumeric: "tabular-nums",
      }}>
        {prefix}{Math.round(num).toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 28, color: "#7b7f9e", marginTop: 8, letterSpacing: 3, textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}
