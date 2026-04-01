import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { buildDailySummaries } from "@war/shared";

interface GeoEvent {
  date: string;
  category: string;
  icon: string;
  title: Record<string, string>;
  detail: Record<string, string>;
}

interface Props { alerts: Alert[]; events: GeoEvent[]; }

const CAT_COLORS: Record<string, string> = {
  escalation: "#c93d3d",
  retaliation: "#d4822a",
  diplomacy: "#4A90D9",
};

const CAT_LABELS: Record<string, string> = {
  escalation: "ESCALATION",
  retaliation: "RETALIATION",
  diplomacy: "DIPLOMACY",
};

function formatDate(d: string): string {
  const [, m, day] = d.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m)]} ${parseInt(day)}`;
}

export default function WarTimeline({ alerts, events }: Props) {
  const byDate = useMemo(() => {
    const daily = buildDailySummaries(alerts);
    const map = new Map<string, number>();
    for (const d of daily) map.set(d.date, d.count);
    return map;
  }, [alerts]);

  // Most recent first
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));

  function get48hAvg(dateStr: string, direction: "before" | "after"): number {
    const d = new Date(dateStr + "T12:00:00Z");
    let sum = 0, count = 0;
    for (let i = 1; i <= 2; i++) {
      const offset = direction === "before" ? -i : i;
      const target = new Date(d.getTime() + offset * 86400000).toISOString().slice(0, 10);
      const val = byDate.get(target);
      if (val !== undefined) { sum += val; count++; }
    }
    return count > 0 ? sum / count : 0;
  }

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">SECTION 03</span>
        <span className="wd-section-title">WAR TIMELINE</span>
        <span className="wd-section-line" />
      </div>

      <div className="wd-timeline">
        {sorted.map((ev, i) => {
          const before = get48hAvg(ev.date, "before");
          const after = get48hAvg(ev.date, "after");
          const dayCount = byDate.get(ev.date) || 0;
          const color = CAT_COLORS[ev.category] || "#555";

          return (
            <article key={ev.date} className="wd-tl-item">
              {/* Date column */}
              <div className="wd-tl-date">
                <time>{formatDate(ev.date)}</time>
              </div>

              {/* Vertical line + dot */}
              <div className="wd-tl-line">
                <div className="wd-tl-dot" style={{ background: color }} />
                {i < sorted.length - 1 && <div className="wd-tl-connector" />}
              </div>

              {/* Content card */}
              <div className="wd-tl-card">
                <div className="wd-tl-card-header">
                  <span className="wd-tl-icon">{ev.icon}</span>
                  <span className="wd-tl-cat" style={{ background: color }}>{CAT_LABELS[ev.category] || ev.category.toUpperCase()}</span>
                </div>
                <h3 className="wd-tl-title">{ev.title.en}</h3>
                <p className="wd-tl-detail">{ev.detail.en}</p>
                <div className="wd-tl-impact">
                  <span className="wd-tl-impact-item">Day: {dayCount} alerts</span>
                  {before > 0 && (
                    <span className="wd-tl-impact-item">48h before: {before.toFixed(0)} → after: {after.toFixed(0)}</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
