import type { ReactNode } from "react";

/**
 * Safe zone wrapper for Reels/TikTok.
 * Keeps content within the visible area (not hidden by platform UI).
 * Top: 150px, Bottom: 170px, Sides: 60px.
 */
export function SafeZone({ children }: { children: ReactNode }) {
  return (
    <div style={{
      position: "absolute",
      top: 150,
      bottom: 170,
      left: 60,
      right: 60,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}>
      {children}
    </div>
  );
}
