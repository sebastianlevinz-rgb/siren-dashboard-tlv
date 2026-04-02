/**
 * Animated SVG map of the Persian Gulf region.
 * Shows carrier movement, attack lines, zone highlights.
 */
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from "remotion";

// Simplified but recognizable country outlines (hand-tuned for 800x600 viewport)
const IRAN = "M 350,80 L 420,60 L 500,80 L 560,120 L 540,200 L 550,260 L 580,310 L 560,370 L 520,400 L 460,380 L 400,360 L 350,310 L 320,280 L 280,240 L 260,180 L 280,120 L 310,100 Z";
const IRAQ = "M 200,100 L 260,100 L 280,120 L 260,180 L 250,220 L 270,260 L 280,280 L 220,280 L 180,240 L 170,180 L 180,130 Z";
const SAUDI = "M 160,280 L 220,280 L 280,280 L 320,310 L 350,340 L 370,380 L 380,420 L 340,460 L 280,480 L 220,470 L 160,440 L 130,380 L 120,320 Z";
const OMAN = "M 460,380 L 520,400 L 540,440 L 520,480 L 480,500 L 440,480 L 430,440 L 440,400 Z";
const UAE = "M 400,360 L 430,360 L 440,400 L 430,420 L 400,420 L 380,400 L 380,380 Z";
const PAKISTAN = "M 560,120 L 640,100 L 700,140 L 680,220 L 640,300 L 600,340 L 560,370 L 540,340 L 550,260 L 540,200 Z";

interface Props {
  showCarriers?: boolean;
  showBases?: boolean;
  showAttackLines?: boolean;
  showKharg?: boolean;
  showHormuz?: boolean;
  highlightRegion?: "iran" | "hormuz" | "kharg" | null;
  carrierPosition?: "start" | "approaching" | "arrived";
  label?: string;
}

export function AnimatedMap({
  showCarriers = false,
  showBases = false,
  showAttackLines = false,
  showKharg = false,
  showHormuz = false,
  highlightRegion = null,
  carrierPosition = "start",
  label,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Carrier animation: moves from bottom-right toward Hormuz
  const carrierProgress = spring({ frame, fps, config: { damping: 30, mass: 1.5, stiffness: 40 } });
  const carrierX = interpolate(carrierProgress, [0, 1], [650, carrierPosition === "arrived" ? 500 : carrierPosition === "approaching" ? 560 : 650]);
  const carrierY = interpolate(carrierProgress, [0, 1], [450, carrierPosition === "arrived" ? 380 : carrierPosition === "approaching" ? 410 : 450]);

  // Pulse for highlighted elements
  const pulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  // Attack lines drawing
  const lineProgress = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Kharg glow
  const khargGlow = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {label && (
        <div style={{ fontSize: 28, color: "#4A90D9", letterSpacing: 3, textAlign: "center", marginBottom: 12, fontWeight: 700 }}>
          {label}
        </div>
      )}
      <svg viewBox="80 40 680 480" style={{ width: "100%", maxWidth: 800 }}>
        {/* Ocean */}
        <rect x="80" y="40" width="680" height="480" fill="#071220" rx="8" />

        {/* Grid lines for military feel */}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`h${i}`} x1="80" x2="760" y1={40 + i * 120} y2={40 + i * 120} stroke="#0d1a2a" strokeWidth="0.5" />
        ))}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={`v${i}`} x1={80 + i * 136} x2={80 + i * 136} y1="40" y2="520" stroke="#0d1a2a" strokeWidth="0.5" />
        ))}

        {/* Countries */}
        <path d={IRAN} fill={highlightRegion === "iran" ? "#2a1a1a" : "#1a1a2e"} stroke={highlightRegion === "iran" ? "#c93d3d" : "#2a2a4a"} strokeWidth={highlightRegion === "iran" ? 2 : 1} />
        <path d={IRAQ} fill="#0f1118" stroke="#1a2030" strokeWidth="0.8" />
        <path d={SAUDI} fill="#0f1118" stroke="#1a2030" strokeWidth="0.8" />
        <path d={OMAN} fill="#0f1118" stroke="#1a2030" strokeWidth="0.8" />
        <path d={UAE} fill="#0f1118" stroke="#1a2030" strokeWidth="0.8" />
        <path d={PAKISTAN} fill="#0f1118" stroke="#1a2030" strokeWidth="0.8" />

        {/* Country labels */}
        <text x="400" y="220" fill="#2a2a4a" fontSize="16" textAnchor="middle" fontWeight="700" fontFamily="monospace">IRAN</text>
        <text x="220" y="190" fill="#1a2030" fontSize="10" textAnchor="middle" fontFamily="monospace">IRAQ</text>
        <text x="240" y="400" fill="#1a2030" fontSize="10" textAnchor="middle" fontFamily="monospace">SAUDI ARABIA</text>

        {/* Water labels */}
        <text x="360" y="340" fill="#0d2a4a" fontSize="11" textAnchor="middle" fontStyle="italic" fontFamily="monospace">Persian Gulf</text>
        <text x="550" y="450" fill="#0d2a4a" fontSize="11" textAnchor="middle" fontStyle="italic" fontFamily="monospace">Arabian Sea</text>

        {/* Strait of Hormuz */}
        {showHormuz && (
          <g>
            <circle cx="470" cy="370" r={18} fill="none" stroke="#c93d3d" strokeWidth={2} opacity={pulse} strokeDasharray="4,3" />
            <text x="470" y="395" fill="#c93d3d" fontSize="8" textAnchor="middle" fontWeight="700" fontFamily="monospace">HORMUZ</text>
          </g>
        )}

        {/* Kharg Island */}
        {showKharg && (
          <g>
            <circle cx="340" cy="290" r={6 + khargGlow * 4} fill="none" stroke="#d4822a" strokeWidth={2} opacity={khargGlow * pulse} />
            <circle cx="340" cy="290" r="4" fill="#d4822a" opacity={khargGlow} />
            <text x="340" y="278" fill="#d4822a" fontSize="9" textAnchor="middle" fontWeight="700" fontFamily="monospace">KHARG</text>
          </g>
        )}

        {/* US Bases */}
        {showBases && (
          <g>
            {[
              { x: 365, y: 340, name: "AL UDEID" },
              { x: 410, y: 370, name: "AL DHAFRA" },
              { x: 290, y: 280, name: "ARIFJAN" },
              { x: 380, y: 355, name: "5TH FLEET" },
            ].map((base, i) => {
              const baseOpacity = interpolate(frame, [i * 8, i * 8 + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <g key={base.name} opacity={baseOpacity}>
                  <rect x={base.x - 4} y={base.y - 4} width="8" height="8" fill="#4A90D9" rx="2" />
                  <text x={base.x} y={base.y - 8} fill="#4A90D9" fontSize="6" textAnchor="middle" fontWeight="600" fontFamily="monospace">{base.name}</text>
                </g>
              );
            })}
          </g>
        )}

        {/* Attack lines from Iran outward */}
        {showAttackLines && (
          <g>
            {[
              { x1: 400, y1: 200, x2: 300, y2: 300, color: "#c93d3d" }, // toward Israel direction
              { x1: 420, y1: 240, x2: 340, y2: 290, color: "#d4822a" }, // toward Kharg
              { x1: 460, y1: 300, x2: 470, y2: 370, color: "#c93d3d" }, // toward Hormuz
            ].map((line, i) => {
              const x = interpolate(lineProgress, [0, 1], [line.x1, line.x2]);
              const y = interpolate(lineProgress, [0, 1], [line.y1, line.y2]);
              return (
                <g key={i}>
                  <line x1={line.x1} y1={line.y1} x2={x} y2={y} stroke={line.color} strokeWidth="2" strokeDasharray="6,3" opacity={0.7} />
                  <circle cx={x} cy={y} r="3" fill={line.color}>
                    <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}
          </g>
        )}

        {/* Carrier Strike Group — animated movement */}
        {showCarriers && (
          <g>
            {/* Carrier icon (simplified ship shape) */}
            <g transform={`translate(${carrierX}, ${carrierY})`}>
              {/* Radar pulse */}
              <circle cx="0" cy="0" r={20 * pulse} fill="none" stroke="#c93d3d" strokeWidth="1" opacity={0.3} />
              <circle cx="0" cy="0" r={30 * pulse} fill="none" stroke="#c93d3d" strokeWidth="0.5" opacity={0.15} />
              {/* Ship body */}
              <polygon points="-14,3 14,3 16,-1 -16,-1" fill="#8b1a1a" stroke="#c93d3d" strokeWidth="1.5" />
              {/* Flight deck line */}
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#c93d3d" strokeWidth="1" />
              {/* Label */}
              <text x="0" y="-16" fill="#c93d3d" fontSize="8" textAnchor="middle" fontWeight="700" fontFamily="monospace">CSG-8</text>
            </g>

            {/* Wake trail */}
            <line x1={carrierX + 16} y1={carrierY + 2} x2={carrierX + 40} y2={carrierY + 15}
              stroke="#1a3a5a" strokeWidth="1" strokeDasharray="3,2" opacity={0.5} />
          </g>
        )}
      </svg>
    </div>
  );
}
