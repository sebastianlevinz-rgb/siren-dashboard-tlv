import type { ReactNode } from "react";
import { SafeZone } from "./common/SafeZone";
import "../styles/global.css";

interface Props {
  children: ReactNode;
  accentColor?: string;
  showBranding?: boolean;
}

/**
 * V2 layout: enforces safe zones, consistent branding.
 * All content stays within 150px top / 170px bottom / 60px sides.
 */
export function ReelLayoutV2({ children, accentColor = "#4A90D9", showBranding = true }: Props) {
  return (
    <div style={{
      width: 1080,
      height: 1920,
      background: "#0a0a0f",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Subtle gradient overlay at top and bottom for depth */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(to bottom, rgba(10,10,15,0.8), transparent)",
        zIndex: 1, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(to top, rgba(10,10,15,0.8), transparent)",
        zIndex: 1, pointerEvents: "none",
      }} />

      {/* Accent line at top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: accentColor, zIndex: 2,
      }} />

      {/* Content within safe zone */}
      <SafeZone>
        {children}
      </SafeZone>

      {/* Branding watermark — always in safe zone */}
      {showBranding && (
        <div style={{
          position: "absolute",
          bottom: 180,
          left: 0, right: 0,
          textAlign: "center",
          fontSize: 28,
          color: "#4a4d6a",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 2,
          zIndex: 2,
        }}>
          wardashboard.live
        </div>
      )}
    </div>
  );
}
