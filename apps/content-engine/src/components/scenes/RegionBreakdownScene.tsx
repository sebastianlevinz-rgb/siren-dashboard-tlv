import { ProgressBar } from "../common/ProgressBar";
import { FadeIn } from "../common/FadeIn";
import { ReelLayout } from "../ReelLayout";

interface Region { name: string; count: number; pct: number; }
interface Props { regions: Region[]; }

const COLORS = ["#c93d3d", "#d4822a", "#b8a02e", "#4A90D9"];

export function RegionBreakdownScene({ regions }: Props) {
  return (
    <ReelLayout>
      <div style={{ width: "100%", padding: "0 80px" }}>
        <FadeIn>
          <div style={{ fontSize: 28, color: "#4A90D9", letterSpacing: 3, textTransform: "uppercase", marginBottom: 40, textAlign: "center" }}>
            Regions Targeted
          </div>
        </FadeIn>
        {regions.map((r, i) => (
          <FadeIn key={r.name} delay={i * 8}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 600 }}>{r.name}</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: COLORS[i] }}>{r.count} ({r.pct.toFixed(0)}%)</span>
              </div>
              <ProgressBar progress={r.pct} color={COLORS[i]} height={20} delay={i * 8} />
            </div>
          </FadeIn>
        ))}
      </div>
    </ReelLayout>
  );
}
