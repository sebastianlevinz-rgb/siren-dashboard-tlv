import React, { useState, useMemo } from "react";
import type { Alert, HeatmapCell } from "../types";
import { type Lang, t, dayShort } from "../i18n";
import { buildHeatmap, formatHour, getRiskColor } from "../utils/data";

const HOUR_ORDER = [...Array.from({ length: 18 }, (_, i) => i + 6), ...Array.from({ length: 6 }, (_, i) => i)];

interface Props {
  alerts: Alert[];
  lang: Lang;
  total: number;
  totalDays: number;
  avg: string;
}

export default function Heatmap({ alerts, lang, total, totalDays, avg }: Props) {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const grid = useMemo(() => buildHeatmap(alerts), [alerts]);
  const maxCount = useMemo(() => Math.max(...grid.flat().map((c) => c.count), 1), [grid]);

  const allCells = useMemo(() => {
    const cells: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) cells.push(grid[d][h]);
    return cells;
  }, [grid]);

  // Filter out 1-alert cells
  const worstGroups = useMemo(() => {
    const sorted = [...allCells].filter((c) => c.count > 1).sort((a, b) => b.count - a.count);
    const groups: { count: number; cells: HeatmapCell[] }[] = [];
    for (const c of sorted) {
      const g = groups.find((g) => g.count === c.count);
      if (g) g.cells.push(c);
      else groups.push({ count: c.count, cells: [c] });
    }
    return groups.slice(0, 4);
  }, [allCells]);

  // Life tips
  const lifeTips = useMemo(() => {
    const byHour: Record<number, number> = {};
    for (const c of allCells.filter((c) => c.hour >= 6 && c.hour <= 22)) {
      byHour[c.hour] = (byHour[c.hour] || 0) + c.count;
    }
    const findMin = (start: number, end: number) => {
      let best = { h: start, score: Infinity };
      for (let h = start; h <= end; h++) {
        const s = byHour[h] || 0;
        if (s < best.score) best = { h, score: s };
      }
      return best;
    };
    const findMax = (start: number, end: number) => {
      let worst = { h: start, score: 0 };
      for (let h = start; h <= end; h++) {
        const s = byHour[h] || 0;
        if (s > worst.score) worst = { h, score: s };
      }
      return worst;
    };
    return {
      bestShower: findMin(6, 9),
      bestSuper: findMin(8, 20),
      worstLunch: findMax(11, 14),
      bestEvening: findMin(18, 21),
    };
  }, [allCells]);

  const plural = (n: number) => n === 1 ? t("alert_s", lang) : t("alerts_s", lang);

  const tipLabels = {
    en: { shower: "Best time to shower", super: "Safest grocery run", lunch: "Don't eat outside at", evening: "Safest evening out" },
    es: { shower: "Mejor hora para banarse", super: "Mejor hora para el super", lunch: "No salgas a almorzar a las", evening: "Mejor hora para salir" },
    he: { shower: "הזמן הכי בטוח להתקלח", super: "הזמן הכי בטוח לסופר", lunch: "אל תצא לאכול בשעה", evening: "הזמן הכי בטוח לצאת בערב" },
  };
  const tl = tipLabels[lang];

  const statsLabels = {
    en: { totalAlerts: "Total Alerts", period: "Period", avgDay: "Average / Day", days: "days" },
    es: { totalAlerts: "Total Alertas", period: "Periodo", avgDay: "Promedio / Dia", days: "dias" },
    he: { totalAlerts: "סך התרעות", period: "תקופה", avgDay: "ממוצע / יום", days: "ימים" },
  };
  const sl = statsLabels[lang];

  return (
    <div className="panel heatmap-panel">
      <h2>{t("hm_title", lang)}</h2>
      <p className="panel-subtitle">{t("hm_sub", lang)}</p>

      <div className="heatmap-container">
        <div className="heatmap-grid">
          <div className="heatmap-corner" />
          {HOUR_ORDER.map((h) => (
            <div key={h} className={`heatmap-hour-label ${h < 6 ? "night" : ""}`}>{h}</div>
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <React.Fragment key={day}>
              <div className="heatmap-day-label">{dayShort(day, lang)}</div>
              {HOUR_ORDER.map((hour) => {
                const cell = grid[day][hour];
                return (
                  <div key={`${day}-${hour}`}
                    className={`heatmap-cell ${selectedCell?.day === day && selectedCell?.hour === hour ? "selected" : ""} ${hour < 6 ? "night" : ""}`}
                    style={{ backgroundColor: getRiskColor(cell.count, maxCount) }}
                    onClick={() => setSelectedCell(selectedCell?.day === day && selectedCell?.hour === hour ? null : cell)}
                  >
                    {cell.count > 0 && <span className="heatmap-count">{cell.count}</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>{t("safe", lang)}</span>
          <div className="legend-bar">
            {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((r) => (
              <div key={r} className="legend-swatch" style={{ backgroundColor: getRiskColor(r * maxCount, maxCount) }} />
            ))}
          </div>
          <span>{t("danger", lang)}</span>
        </div>
      </div>

      {/* Most dangerous */}
      <div className="top-worst">
        <h3>{t("most_dangerous", lang)}</h3>
        <div className="top-worst-list">
          {worstGroups.map((g, i) => (
            <div key={g.count} className="top5-group">
              <div className="top5-group-header">
                <span className="top5-rank">#{i + 1}</span>
                <span className="top5-count worst">{g.count} {plural(g.count)}</span>
              </div>
              <div className="top5-group-items">
                {g.cells.map((c, j) => (
                  <span key={j} className="top5-tag" onClick={() => setSelectedCell(c)}>
                    {dayShort(c.day, lang)} {formatHour(c.hour)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily life tips */}
      <div className="life-tips">
        <h3>{lang === "he" ? "טיפים לחיי יומיום" : lang === "es" ? "Tips para la vida diaria" : "Daily Life Tips"}</h3>
        <div className="life-tips-grid">
          <div className="life-tip ok">
            <span className="tip-emoji">🚿</span>
            <span className="tip-text">{tl.shower}</span>
            <span className="tip-value">{formatHour(lifeTips.bestShower.h)}</span>
            <span className="tip-badge ok">✓</span>
          </div>
          <div className="life-tip ok">
            <span className="tip-emoji">🛒</span>
            <span className="tip-text">{tl.super}</span>
            <span className="tip-value">{formatHour(lifeTips.bestSuper.h)}</span>
            <span className="tip-badge ok">✓</span>
          </div>
          <div className="life-tip danger">
            <span className="tip-emoji">🍽️</span>
            <span className="tip-text">{tl.lunch}</span>
            <span className="tip-value">{formatHour(lifeTips.worstLunch.h)}</span>
            <span className="tip-badge danger">✕</span>
          </div>
          <div className="life-tip ok">
            <span className="tip-emoji">🍻</span>
            <span className="tip-text">{tl.evening}</span>
            <span className="tip-value">{formatHour(lifeTips.bestEvening.h)}</span>
            <span className="tip-badge ok">✓</span>
          </div>
        </div>
      </div>

      {/* Detail panel on cell click */}
      {selectedCell && selectedCell.alerts.length > 0 && (
        <div className="heatmap-detail">
          <h3>{dayShort(selectedCell.day, lang)} {t("at_time", lang)} {formatHour(selectedCell.hour)} — {selectedCell.count} {plural(selectedCell.count)}</h3>
          <div className="detail-list">
            {selectedCell.alerts.slice(0, 20).map((a) => (
              <div key={a.id} className="detail-item">
                <span className="detail-time">{new Date(a.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}</span>
                <span className="detail-cities">{a.cities_en.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats summary at the bottom */}
      <div className="hm-stats-bar">
        <div className="hm-stat">
          <span className="hm-stat-value">{total}</span>
          <span className="hm-stat-label">{sl.totalAlerts}</span>
        </div>
        <div className="hm-stat">
          <span className="hm-stat-value">{totalDays} {sl.days}</span>
          <span className="hm-stat-label">{sl.period}</span>
        </div>
        <div className="hm-stat">
          <span className="hm-stat-value">{avg}</span>
          <span className="hm-stat-label">{sl.avgDay}</span>
        </div>
      </div>
    </div>
  );
}
