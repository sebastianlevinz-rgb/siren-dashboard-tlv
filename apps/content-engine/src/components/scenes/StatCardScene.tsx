import { AnimatedNumber } from "../common/AnimatedNumber";
import { FadeIn } from "../common/FadeIn";
import { ReelLayout } from "../ReelLayout";

interface Stat { value: number; label: string; suffix?: string; color?: string; }
interface Props { stats: Stat[]; }

export function StatCardScene({ stats }: Props) {
  return (
    <ReelLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "0 80px", width: "100%" }}>
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 10}>
            <div style={{
              background: "#12131c",
              border: "1px solid #252840",
              borderRadius: 16,
              padding: "24px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 22, color: "#7b7f9e", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</span>
              <AnimatedNumber value={s.value} suffix={s.suffix || ""} fontSize={48} color={s.color || "#d8dae5"} delay={i * 10} />
            </div>
          </FadeIn>
        ))}
      </div>
    </ReelLayout>
  );
}
