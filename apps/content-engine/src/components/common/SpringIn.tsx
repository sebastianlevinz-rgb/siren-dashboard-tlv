import type { ReactNode } from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  distance?: number;
}

/**
 * Spring-based entrance animation.
 * Uses organic spring() instead of linear interpolate().
 */
export function SpringIn({ children, delay = 0, direction = "up", distance = 60 }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });

  let transform = "";
  switch (direction) {
    case "up": transform = `translateY(${(1 - progress) * distance}px)`; break;
    case "down": transform = `translateY(${(1 - progress) * -distance}px)`; break;
    case "left": transform = `translateX(${(1 - progress) * distance}px)`; break;
    case "right": transform = `translateX(${(1 - progress) * -distance}px)`; break;
    case "scale": transform = `scale(${0.8 + progress * 0.2})`; break;
  }

  return (
    <div style={{ opacity: progress, transform }}>
      {children}
    </div>
  );
}
