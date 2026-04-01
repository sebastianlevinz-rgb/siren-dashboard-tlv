import type { ReactNode } from "react";
import { Branding } from "./common/Branding";
import "../styles/global.css";

interface Props { children: ReactNode; }

export function ReelLayout({ children }: Props) {
  return (
    <div style={{
      width: 1080,
      height: 1920,
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {children}
      <Branding />
    </div>
  );
}
