import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { getRiskColor } from "@war/shared";
import { type Lang, t, dayLabel } from "../i18n";

interface Props { alerts: Alert[]; lang: Lang; }

function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}`;
}

export default function WeeklyHeatmap({ alerts, lang }: Props) {
  const { grid, maxVal, peakHours, quietHours } = useMemo(() => {
    const dates = [...new Set(alerts.map(a => a.date))].sort();
    const last7dates = new Set(dates.slice(-7));
    const recent = alerts.filter(a => last7dates.has(a.date));

    const g: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
    for (const a of recent) g[a.day_of_week][a.hour]++;

    let mx = 0;
    for (const row of g) for (const v of row) if (v > mx) mx = v;

    const hourTotals = new Array(24).fill(0);
    for (const row of g) row.forEach((v, h) => { hourTotals[h] += v; });

    let peakSum = -1, peakStart = 0, quietSum = Infinity, quietStart = 0;
    for (let h = 0; h < 24; h++) {
      const sum3 = hourTotals[h] + hourTotals[(h + 1) % 24] + hourTotals[(h + 2) % 24];
      if (sum3 > peakSum) { peakSum = sum3; peakStart = h; }
      if (sum3 < quietSum) { quietSum = sum3; quietStart = h; }
    }

    return {
      grid: g, maxVal: mx,
      peakHours: `${formatHour(peakStart)}:00-${formatHour((peakStart + 3) % 24)}:00`,
      quietHours: `${formatHour(quietStart)}:00-${formatHour((quietStart + 3) % 24)}:00`,
    };
  }, [alerts]);

  const hourOrder = Array.from({ length: 24 }, (_, i) => (i + 6) % 24);

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">{t("sec04", lang)}</span>
        <span className="wd-section-title">{t("threat_pattern", lang)}</span>
        <span className="wd-section-line" />
      </div>
      <p className="wd-subtitle">{t("heatmap_sub", lang)}</p>

      <div className="wd-heatmap-wrap">
        <div className="wd-heatmap">
          <div className="wd-hm-row wd-hm-header">
            <div className="wd-hm-day-label" />
            {hourOrder.map(h => (
              <div key={h} className="wd-hm-cell wd-hm-hour-label">{h % 3 === 0 ? formatHour(h) : ""}</div>
            ))}
          </div>
          {[0,1,2,3,4,5,6].map(day => (
            <div key={day} className="wd-hm-row">
              <div className="wd-hm-day-label">{dayLabel(day, lang)}</div>
              {hourOrder.map(h => (
                <div key={h} className="wd-hm-cell" style={{ background: getRiskColor(grid[day][h], maxVal) }}
                  title={`${dayLabel(day, lang)} ${formatHour(h)}:00 — ${grid[day][h]} ${t("alerts", lang) }`} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="wd-hm-insights">
        <div className="wd-hm-insight">
          <span className="wd-hm-insight-label">{t("peak_hours", lang)}</span>
          <span className="wd-hm-insight-value" style={{ color: "var(--risk-danger)" }}>{peakHours}</span>
        </div>
        <div className="wd-hm-insight">
          <span className="wd-hm-insight-label">{t("quietest", lang)}</span>
          <span className="wd-hm-insight-value" style={{ color: "var(--risk-calm)" }}>{quietHours}</span>
        </div>
      </div>
    </section>
  );
}
