/**
 * Text that slides in from a direction with spring physics.
 * More dynamic than SpringIn — enters and has subtle glow.
 */
import type { ReactNode } from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

interface Props {
  children: ReactNode;
  from?: "left" | "right" | "bottom" | "top";
  delay?: number;
}

export function SlidingText({ children, from = "bottom", delay = 0 }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 15, mass: 0.6, stiffness: 120 } });

  const distance = 80;
  const translate = from === "left" ? `translateX(${(1 - progress) * -distance}px)`
    : from === "right" ? `translateX(${(1 - progress) * distance}px)`
    : from === "bottom" ? `translateY(${(1 - progress) * distance}px)`
    : `translateY(${(1 - progress) * -distance}px)`;

  const blur = interpolate(progress, [0, 0.5], [4, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ opacity: progress, transform: translate, filter: `blur(${blur}px)` }}>
      {children}
    </div>
  );
}
