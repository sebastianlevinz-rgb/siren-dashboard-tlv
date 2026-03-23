import React, { useState, useMemo } from "react";
import type { Alert, HeatmapCell } from "../types";
import { type Lang, t, dayShort } from "../i18n";
import { buildHeatmap, formatHour, getRiskColor } from "../utils/data";

const HOUR_ORDER = [...Array.from({ length: 18 }, (_, i) => i + 6), ...Array.from({ length: 6 }, (_, i) => i)];

interface Props { alerts: Alert[]; lang: Lang; }

export default function Heatmap({ alerts, lang }: Props) {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const grid = useMemo(() => buildHeatmap(alerts), [alerts]);
  const maxCount = useMemo(() => Math.max(...grid.flat().map((c) => c.count), 1), [grid]);

  const allCells = useMemo(() => {
    const cells: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) cells.push(grid[d][h]);
    return cells;
  }, [grid]);

  // Filter out 1-alert cells — not meaningful
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

  // Life tips based on safest windows (waking hours, 06-22)
  const lifeTips = useMemo(() => {
    const wakingCells = allCells.filter((c) => c.hour >= 6 && c.hour <= 22);
    const byHour: Record<number, number> = {};
    for (const c of wakingCells) {
      byHour[c.hour] = (byHour[c.hour] || 0) + c.count;
    }

    // Find safest 2-hour windows for each activity
    const windowScore = (start: number, end: number) => {
      let total = 0;
      for (let h = start; h < end; h++) total += byHour[h] || 0;
      return total;
    };

    // Best shower time (morning 06-10)
    let bestShower = { h: 6, score: Infinity };
    for (let h = 6; h <= 9; h++) {
      const s = (byHour[h] || 0);
      if (s < bestShower.score) bestShower = { h, score: s };
    }

    // Best grocery/super time (avoid peak)
    let bestSuper = { h: 8, score: Infinity };
    for (let h = 8; h <= 20; h++) {
      const s = windowScore(h, h + 1);
      if (s < bestSuper.score) bestSuper = { h, score: s };
    }

    // Worst lunch time
    let worstLunch = { h: 12, score: 0 };
    for (let h = 11; h <= 14; h++) {
      const s = (byHour[h] || 0);
      if (s > worstLunch.score) worstLunch = { h, score: s };
    }

    // Best evening out (18-22)
    let bestEvening = { h: 18, score: Infinity };
    for (let h = 18; h <= 21; h++) {
      const s = (byHour[h] || 0);
      if (s < bestEvening.score) bestEvening = { h, score: s };
    }

    return { bestShower, bestSuper, worstLunch, bestEvening };
  }, [allCells]);

  const plural = (n: number) => n === 1 ? t("alert_s", lang) : t("alerts_s", lang);

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

      {/* Life tips with humor */}
      <div className="life-tips">
        <h3>{lang === "he" ? "טיפים לחיי יומיום" : lang === "es" ? "Tips para la vida diaria" : "Daily Life Tips"}</h3>
        <div className="life-tips-grid">
          <div className="life-tip">
            <span className="tip-emoji">🚿</span>
            <span className="tip-text">
              {lang === "he" ? "הזמן הכי בטוח להתקלח" : lang === "es" ? "Mejor hora para banarse" : "Best time to shower"}
            </span>
            <span className="tip-value">{formatHour(lifeTips.bestShower.h)}</span>
          </div>
          <div className="life-tip">
            <span className="tip-emoji">🛒</span>
            <span className="tip-text">
              {lang === "he" ? "הזמן הכי בטוח לסופר" : lang === "es" ? "Mejor hora para el super" : "Safest grocery run"}
            </span>
            <span className="tip-value">{formatHour(lifeTips.bestSuper.h)}</span>
          </div>
          <div className="life-tip warning">
            <span className="tip-emoji">🍽️</span>
            <span className="tip-text">
              {lang === "he" ? "אל תצא לאכול בשעה" : lang === "es" ? "No salgas a almorzar a las" : "Skip outdoor lunch at"}
            </span>
            <span className="tip-value">{formatHour(lifeTips.worstLunch.h)}</span>
          </div>
          <div className="life-tip">
            <span className="tip-emoji">🍻</span>
            <span className="tip-text">
              {lang === "he" ? "הזמן הכי בטוח לצאת בערב" : lang === "es" ? "Mejor hora para salir de noche" : "Safest evening out"}
            </span>
            <span className="tip-value">{formatHour(lifeTips.bestEvening.h)}</span>
          </div>
        </div>
      </div>

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
    </div>
  );
}
