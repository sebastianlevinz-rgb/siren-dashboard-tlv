import type { ReactNode } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface Props {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, delay = 0, duration = 15 }: Props) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const scale = interpolate(frame - delay, [0, duration], [0.95, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </div>
  );
}
