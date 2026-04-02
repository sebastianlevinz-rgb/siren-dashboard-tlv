/**
 * Full-screen photo with Ken Burns zoom effect + dark overlay + text.
 * This makes scenes feel cinematic instead of static.
 */
import type { ReactNode } from "react";
import { Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { SafeZone } from "./SafeZone";

interface Props {
  image: string; // filename in public/images/
  children: ReactNode;
  darken?: number; // 0-1, default 0.7
  zoomDirection?: "in" | "out";
  panDirection?: "left" | "right" | "up" | "none";
}

export function PhotoScene({ image, children, darken = 0.7, zoomDirection = "in", panDirection = "none" }: Props) {
  const frame = useCurrentFrame();

  const scale = zoomDirection === "in"
    ? interpolate(frame, [0, 120], [1, 1.15], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })
    : interpolate(frame, [0, 120], [1.15, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const panX = panDirection === "left" ? interpolate(frame, [0, 120], [0, -30], { extrapolateRight: "clamp" })
    : panDirection === "right" ? interpolate(frame, [0, 120], [-30, 0], { extrapolateRight: "clamp" })
    : 0;

  const panY = panDirection === "up" ? interpolate(frame, [0, 120], [0, -20], { extrapolateRight: "clamp" }) : 0;

  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden" }}>
      {/* Background image with Ken Burns */}
      <div style={{ position: "absolute", inset: -60, transform: `scale(${scale}) translate(${panX}px, ${panY}px)` }}>
        <Img src={staticFile(`images/${image}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: `rgba(10, 10, 15, ${darken})` }} />

      {/* Accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#4A90D9", zIndex: 2 }} />

      {/* Content in safe zone */}
      <SafeZone>{children}</SafeZone>

      {/* Branding */}
      <div style={{
        position: "absolute", bottom: 180, left: 0, right: 0,
        textAlign: "center", fontSize: 24, color: "#4a4d6a",
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, zIndex: 2,
      }}>
        wardashboard.live
      </div>
    </div>
  );
}
