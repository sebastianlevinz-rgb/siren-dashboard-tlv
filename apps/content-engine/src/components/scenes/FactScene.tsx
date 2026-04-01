import { FadeIn } from "../common/FadeIn";
import { ReelLayout } from "../ReelLayout";

interface Props { icon?: string; title: string; body: string; highlight?: string; }

export function FactScene({ icon = "📊", title, body, highlight }: Props) {
  return (
    <ReelLayout>
      <div style={{ padding: "0 80px", textAlign: "center" }}>
        <FadeIn>
          <div style={{ fontSize: 80, marginBottom: 20 }}>{icon}</div>
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.3, marginBottom: 24 }}>{title}</div>
        </FadeIn>
        <FadeIn delay={10}>
          <div style={{ fontSize: 26, color: "#7b7f9e", lineHeight: 1.6 }}>{body}</div>
        </FadeIn>
        {highlight && (
          <FadeIn delay={20}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#4A90D9", marginTop: 32 }}>{highlight}</div>
          </FadeIn>
        )}
      </div>
    </ReelLayout>
  );
}
