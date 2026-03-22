import React, { useState, useMemo } from "react";
import type { Alert, HeatmapCell } from "../types";
import { buildHeatmap, DAY_NAMES, formatHour, getRiskColor } from "../utils/data";

type Lang = "en" | "es" | "he";

const T: Record<Lang, Record<string, string>> = {
  en: { title: "Alerts by Day x Hour", sub: "Cumulative total. Starts at 06:00.", safe: "Safe", danger: "Danger", worst: "Most dangerous", alerts: "alerts", alert: "alert", at: "at" },
  es: { title: "Alertas por Dia x Hora", sub: "Acumulado total. Empieza a las 06:00.", safe: "Calma", danger: "Peligro", worst: "Mas peligrosos", alerts: "alertas", alert: "alerta", at: "a las" },
  he: { title: "התרעות לפי יום x שעה", sub: "סך מצטבר. מתחיל ב-06:00.", safe: "בטוח", danger: "סכנה", worst: "הכי מסוכן", alerts: "התרעות", alert: "התרעה", at: "ב-" },
};

const HOUR_ORDER = [...Array.from({ length: 18 }, (_, i) => i + 6), ...Array.from({ length: 6 }, (_, i) => i)];

interface Props {
  alerts: Alert[];
  lang: Lang;
}

export default function Heatmap({ alerts, lang }: Props) {
  const t = T[lang];
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const grid = useMemo(() => buildHeatmap(alerts), [alerts]);
  const maxCount = useMemo(() => Math.max(...grid.flat().map((c) => c.count), 1), [grid]);

  const allCells = useMemo(() => {
    const cells: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) cells.push(grid[d][h]);
    return cells;
  }, [grid]);

  // Top worst: 5 distinct count levels
  const worstGroups = useMemo(() => {
    const sorted = [...allCells].filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
    const groups: { count: number; cells: HeatmapCell[] }[] = [];
    for (const c of sorted) {
      const g = groups.find((g) => g.count === c.count);
      if (g) g.cells.push(c);
      else groups.push({ count: c.count, cells: [c] });
    }
    return groups.slice(0, 5);
  }, [allCells]);

  return (
    <div className="panel heatmap-panel">
      <h2>{t.title}</h2>
      <p className="panel-subtitle">{t.sub}</p>

      <div className="heatmap-container">
        <div className="heatmap-grid">
          <div className="heatmap-corner" />
          {HOUR_ORDER.map((h) => (
            <div key={h} className={`heatmap-hour-label ${h < 6 ? "night" : ""}`}>{h}</div>
          ))}

          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <React.Fragment key={day}>
              <div className="heatmap-day-label">{DAY_NAMES[day]}</div>
              {HOUR_ORDER.map((hour) => {
                const cell = grid[day][hour];
                return (
                  <div
                    key={`${day}-${hour}`}
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
          <span>{t.safe}</span>
          <div className="legend-bar">
            {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((r) => (
              <div key={r} className="legend-swatch" style={{ backgroundColor: getRiskColor(r * maxCount, maxCount) }} />
            ))}
          </div>
          <span>{t.danger}</span>
        </div>
      </div>

      {/* TOP WORST ONLY */}
      <div className="top-worst">
        <h3>{t.worst}</h3>
        <div className="top-worst-list">
          {worstGroups.map((g, i) => (
            <div key={g.count} className="top5-group">
              <div className="top5-group-header">
                <span className="top5-rank">#{i + 1}</span>
                <span className="top5-count worst">{g.count} {g.count === 1 ? t.alert : t.alerts}</span>
              </div>
              <div className="top5-group-items">
                {g.cells.map((c, j) => (
                  <span key={j} className="top5-tag" onClick={() => setSelectedCell(c)}>
                    {DAY_NAMES[c.day]} {formatHour(c.hour)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCell && selectedCell.alerts.length > 0 && (
        <div className="heatmap-detail">
          <h3>{DAY_NAMES[selectedCell.day]} {t.at} {formatHour(selectedCell.hour)} — {selectedCell.count} {t.alerts}</h3>
          <div className="detail-list">
            {selectedCell.alerts.slice(0, 20).map((a) => (
              <div key={a.id} className="detail-item">
                <span className="detail-time">
                  {new Date(a.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}
                </span>
                <span className="detail-cities">{a.cities_en.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
