import { useMemo } from "react";
import type { Alert } from "@war/shared";

interface Props { alerts: Alert[]; }

const REGION_META: Record<string, { label: string; emoji: string }> = {
  north: { label: "North", emoji: "🏔️" },
  gush_dan: { label: "Gush Dan (TLV)", emoji: "🏙️" },
  jerusalem: { label: "Jerusalem", emoji: "🕌" },
  south: { label: "South", emoji: "🏜️" },
};

export default function RegionBreakdown({ alerts }: Props) {
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
      .map(([key, count]) => ({
        key,
        ...REGION_META[key],
        count,
        pct: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [alerts]);

  const maxCount = Math.max(...regions.map(r => r.count), 1);

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">SECTION 03</span>
        <span className="wd-section-title">REGIONS TARGETED</span>
        <span className="wd-section-line" />
      </div>
      <p className="wd-subtitle">Alert distribution by region — one alert can affect multiple regions</p>

      <div className="wd-regions-list">
        {regions.map((r, i) => (
          <div key={r.key} className="wd-region-row">
            <span className="wd-region-rank">#{i + 1}</span>
            <span className="wd-region-emoji">{r.emoji}</span>
            <span className="wd-region-name">{r.label}</span>
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
