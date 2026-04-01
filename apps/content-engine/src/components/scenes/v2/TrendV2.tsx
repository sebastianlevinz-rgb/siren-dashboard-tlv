import { useCurrentFrame, interpolate, Easing } from "remotion";
import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { SpringIn } from "../../common/SpringIn";

interface Props { dailyCounts: number[]; caption: string; accentColor?: string; }

export function TrendV2({ dailyCounts, caption, accentColor = "#4A90D9" }: Props) {
  const frame = useCurrentFrame();
  const maxVal = Math.max(...dailyCounts, 1);
  const W = 900, H = 500, PAD = 40;
  const chartW = W - PAD * 2, chartH = H - PAD * 2;

  const reveal = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const pts = Math.floor(reveal * dailyCounts.length);

  const points = dailyCounts.slice(0, pts).map((v, i) => {
    const x = PAD + (i / Math.max(dailyCounts.length - 1, 1)) * chartW;
    const y = PAD + chartH - (v / maxVal) * chartH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <ReelLayoutV2 accentColor={accentColor}>
      <SpringIn>
        <div style={{ fontSize: 32, color: accentColor, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>
          DAILY TREND
        </div>
      </SpringIn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[0, 0.25, 0.5, 0.75, 1].map(r => (
          <line key={r} x1={PAD} x2={W - PAD} y1={PAD + chartH - r * chartH} y2={PAD + chartH - r * chartH} stroke="#252840" strokeDasharray="4,4" />
        ))}
        {pts > 1 && <polyline points={points} fill="none" stroke={accentColor} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
        {dailyCounts.slice(0, pts).map((v, i) => {
          const x = PAD + (i / Math.max(dailyCounts.length - 1, 1)) * chartW;
          const y = PAD + chartH - (v / maxVal) * chartH;
          return <circle key={i} cx={x} cy={y} r={6} fill={accentColor} />;
        })}
      </svg>
      <SpringIn delay={20}>
        <div style={{ fontSize: 28, color: "#7b7f9e", textAlign: "center", marginTop: 16 }}>{caption}</div>
      </SpringIn>
    </ReelLayoutV2>
  );
}
