import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { buildDailySummaries } from "@war/shared";
import { type Lang, t } from "../i18n";

interface GeoEvent {
  date: string;
  category: string;
  icon: string;
  title: Record<string, string>;
  detail: Record<string, string>;
}

interface Props { alerts: Alert[]; events: GeoEvent[]; lang: Lang; }

const CAT_COLORS: Record<string, string> = {
  escalation: "#c93d3d",
  retaliation: "#d4822a",
  diplomacy: "#4A90D9",
};

function formatDate(d: string): string {
  const [, m, day] = d.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m)]} ${parseInt(day)}`;
}

export default function WarTimeline({ alerts, events, lang }: Props) {
  const byDate = useMemo(() => {
    const daily = buildDailySummaries(alerts);
    const map = new Map<string, number>();
    for (const d of daily) map.set(d.date, d.count);
    return map;
  }, [alerts]);

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

  const catKey = (c: string) => {
    if (c === "escalation") return t("escalation", lang);
    if (c === "retaliation") return t("retaliation", lang);
    if (c === "diplomacy") return t("diplomacy", lang);
    return c.toUpperCase();
  };

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">{t("sec05", lang)}</span>
        <span className="wd-section-title">{t("war_timeline", lang)}</span>
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
              <div className="wd-tl-date"><time>{formatDate(ev.date)}</time></div>
              <div className="wd-tl-line">
                <div className="wd-tl-dot" style={{ background: color }} />
                {i < sorted.length - 1 && <div className="wd-tl-connector" />}
              </div>
              <div className="wd-tl-card">
                <div className="wd-tl-card-header">
                  <span className="wd-tl-icon">{ev.icon}</span>
                  <span className="wd-tl-cat" style={{ background: color }}>{catKey(ev.category)}</span>
                </div>
                <h3 className="wd-tl-title">{ev.title[lang] || ev.title.en}</h3>
                <p className="wd-tl-detail">{ev.detail[lang] || ev.detail.en}</p>
                <div className="wd-tl-impact">
                  <span className="wd-tl-impact-item">{t("day_label", lang)}: {dayCount} {t("alerts", lang)}</span>
                  {before > 0 && (
                    <span className="wd-tl-impact-item">{t("before_48h", lang)}: {before.toFixed(0)} → {t("after_48h", lang)}: {after.toFixed(0)}</span>
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
