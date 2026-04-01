import { useCurrentFrame, interpolate, Easing } from "remotion";
import { ReelLayout } from "../ReelLayout";
import { FadeIn } from "../common/FadeIn";

interface Props { dailyCounts: number[]; label?: string; }

export function TrendScene({ dailyCounts, label = "Daily Alert Trend" }: Props) {
  const frame = useCurrentFrame();
  const maxVal = Math.max(...dailyCounts, 1);
  const W = 900, H = 500, PAD = 40;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;

  const revealPct = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const visiblePoints = Math.floor(revealPct * dailyCounts.length);

  const points = dailyCounts.slice(0, visiblePoints).map((v, i) => {
    const x = PAD + (i / Math.max(dailyCounts.length - 1, 1)) * chartW;
    const y = PAD + chartH - (v / maxVal) * chartH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <ReelLayout>
      <FadeIn>
        <div style={{ fontSize: 28, color: "#4A90D9", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>{label}</div>
      </FadeIn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(r => (
          <line key={r} x1={PAD} x2={W - PAD} y1={PAD + chartH - r * chartH} y2={PAD + chartH - r * chartH} stroke="#252840" strokeDasharray="4,4" />
        ))}
        {/* Line */}
        {visiblePoints > 1 && <polyline points={points} fill="none" stroke="#4A90D9" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
        {/* Dots */}
        {dailyCounts.slice(0, visiblePoints).map((v, i) => {
          const x = PAD + (i / Math.max(dailyCounts.length - 1, 1)) * chartW;
          const y = PAD + chartH - (v / maxVal) * chartH;
          return <circle key={i} cx={x} cy={y} r={5} fill="#4A90D9" />;
        })}
      </svg>
    </ReelLayout>
  );
}
