import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { type Lang, t } from "../i18n";

interface Props { alerts: Alert[]; lang: Lang; }

const REGION_KEYS: Record<string, { key: "north" | "gush_dan" | "jerusalem" | "south"; emoji: string }> = {
  north: { key: "north", emoji: "🏔️" },
  gush_dan: { key: "gush_dan", emoji: "🏙️" },
  jerusalem: { key: "jerusalem", emoji: "🕌" },
  south: { key: "south", emoji: "🏜️" },
};

export default function RegionBreakdown({ alerts, lang }: Props) {
  const regions = useMemo(() => {
    const counts: Record<string, number> = { north: 0, gush_dan: 0, jerusalem: 0, south: 0 };
    for (const a of alerts) {
      for (const r of a.regions || []) {
        if (r === "north" || r === "haifa") counts.north++;
        else if (r === "gush_dan" || r === "center") counts.gush_dan++;
        else if (r === "jerusalem") counts.jerusalem++;
        else if (r === "south") counts.south++;
      }
    }
    const total = alerts.length || 1;
    return Object.entries(counts)
      .map(([key, count]) => ({ regionKey: key, emoji: REGION_KEYS[key].emoji, count, pct: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [alerts]);

  const maxCount = Math.max(...regions.map(r => r.count), 1);

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">{t("sec03", lang)}</span>
        <span className="wd-section-title">{t("regions_targeted", lang)}</span>
        <span className="wd-section-line" />
      </div>
      <p className="wd-subtitle">{t("region_sub", lang)}</p>

      <div className="wd-regions-list">
        {regions.map((r, i) => (
          <div key={r.regionKey} className="wd-region-row">
            <span className="wd-region-rank">#{i + 1}</span>
            <span className="wd-region-emoji">{r.emoji}</span>
            <span className="wd-region-name">{t(r.regionKey as "north" | "gush_dan" | "jerusalem" | "south", lang)}</span>
            <div className="wd-region-bar-bg">
              <div className="wd-region-bar" style={{
                width: `${(r.count / maxCount) * 100}%`,
                background: i === 0 ? "var(--risk-danger)" : i === 1 ? "var(--risk-high)" : i === 2 ? "var(--risk-medium)" : "var(--accent)",
              }} />
            </div>
            <span className="wd-region-count">{r.count}</span>
            <span className="wd-region-pct">{r.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
