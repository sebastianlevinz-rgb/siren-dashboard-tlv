/**
 * Dark scene with subtle animated noise background and safe zones.
 * Replaces flat black backgrounds with living, breathing dark.
 */
import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { SafeZone } from "../common/SafeZone";
import "../../styles/global.css";

interface Props {
  children: ReactNode;
  accent?: string;
  showGrid?: boolean;
}

export function DarkScene({ children, accent = "#4A90D9", showGrid = false }: Props) {
  const frame = useCurrentFrame();
  // Subtle pulsing background brightness
  const bg = Math.round(10 + Math.sin(frame * 0.05) * 2);

  return (
    <div style={{
      width: 1080, height: 1920,
      background: `rgb(${bg}, ${bg}, ${bg + 5})`,
      position: "relative", overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Subtle radial gradient from accent color */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${accent}08 0%, transparent 60%)`,
      }} />

      {/* Grid overlay for military feel */}
      {showGrid && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`h${i}`} x1="0" x2="1080" y1={i * 96} y2={i * 96} stroke="#fff" strokeWidth="1" />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`} x1={i * 90} x2={i * 90} y1="0" y2="1920" stroke="#fff" strokeWidth="1" />
          ))}
        </svg>
      )}

      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, zIndex: 2 }} />

      <SafeZone>{children}</SafeZone>

      {/* Branding */}
      <div style={{
        position: "absolute", bottom: 180, left: 0, right: 0,
        textAlign: "center", fontSize: 24, color: "#2a2a4a",
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, zIndex: 2,
      }}>
        wardashboard.live
      </div>
    </div>
  );
}
