import React, { useState, useMemo } from "react";
import type { Alert, HeatmapCell } from "../types";
import { buildHeatmap, DAY_NAMES, DAY_NAMES_FULL, formatHour, getRiskColor } from "../utils/data";

interface Props {
  alerts: Alert[];
}

const HOUR_ORDER = [...Array.from({ length: 18 }, (_, i) => i + 6), ...Array.from({ length: 6 }, (_, i) => i)];

export default function Heatmap({ alerts }: Props) {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const grid = useMemo(() => buildHeatmap(alerts), [alerts]);
  const maxCount = useMemo(
    () => Math.max(...grid.flat().map((c) => c.count), 1),
    [grid]
  );

  // Top 5 worst and best (only cells with data, for best filter waking hours 06-22)
  const allCells = useMemo(() => {
    const cells: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        cells.push(grid[d][h]);
      }
    }
    return cells;
  }, [grid]);

  const worst5 = useMemo(
    () => [...allCells].filter((c) => c.count > 0).sort((a, b) => b.count - a.count).slice(0, 5),
    [allCells]
  );

  const best5 = useMemo(
    () => [...allCells]
      .filter((c) => c.hour >= 6 && c.hour <= 22) // waking hours only
      .sort((a, b) => a.count - b.count)
      .slice(0, 5),
    [allCells]
  );

  const dayOrder = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="panel heatmap-panel">
      <h2>Alertas por Dia x Hora</h2>
      <p className="panel-subtitle">
        Acumulado total — cada celda suma todas las alertas. Empieza a las 06:00.
      </p>

      <div className="heatmap-container">
        <div className="heatmap-grid">
          <div className="heatmap-corner" />
          {HOUR_ORDER.map((h) => (
            <div key={h} className={`heatmap-hour-label ${h < 6 ? "night" : ""}`}>
              {h}
            </div>
          ))}

          {dayOrder.map((day) => (
            <React.Fragment key={day}>
              <div className="heatmap-day-label">
                {DAY_NAMES[day]}
              </div>
              {HOUR_ORDER.map((hour) => {
                const cell = grid[day][hour];
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`heatmap-cell ${
                      selectedCell?.day === day && selectedCell?.hour === hour ? "selected" : ""
                    } ${hour < 6 ? "night" : ""}`}
                    style={{ backgroundColor: getRiskColor(cell.count, maxCount) }}
                    onClick={() =>
                      setSelectedCell(
                        selectedCell?.day === day && selectedCell?.hour === hour ? null : cell
                      )
                    }
                    title={`${DAY_NAMES[day]} ${formatHour(hour)}: ${cell.count} alertas`}
                  >
                    {cell.count > 0 && (
                      <span className="heatmap-count">{cell.count}</span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="heatmap-legend">
          <span>Calma</span>
          <div className="legend-bar">
            {[0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((r) => (
              <div
                key={r}
                className="legend-swatch"
                style={{ backgroundColor: getRiskColor(r * maxCount, maxCount) }}
              />
            ))}
          </div>
          <span>Peligro</span>
        </div>
      </div>

      {/* TOP WORST + BEST — grouped by count */}
      <div className="top5-container">
        <div className="top5-col worst">
          <h3>Peores momentos</h3>
          {(() => {
            const groups: { count: number; cells: HeatmapCell[] }[] = [];
            for (const c of worst5) {
              const g = groups.find((g) => g.count === c.count);
              if (g) g.cells.push(c);
              else groups.push({ count: c.count, cells: [c] });
            }
            let rank = 1;
            return groups.map((g) => {
              const r = rank;
              rank += g.cells.length;
              return (
                <div key={g.count} className="top5-group">
                  <div className="top5-group-header">
                    <span className="top5-rank">#{r}</span>
                    <span className="top5-count worst">{g.count} alertas</span>
                  </div>
                  <div className="top5-group-items">
                    {g.cells.map((c, j) => (
                      <span key={j} className="top5-tag" onClick={() => setSelectedCell(c)}>
                        {DAY_NAMES[c.day]} {formatHour(c.hour)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
        <div className="top5-col best">
          <h3>Mejores momentos</h3>
          <p className="top5-note">Horario diurno (06-22hs)</p>
          {(() => {
            const groups: { count: number; cells: HeatmapCell[] }[] = [];
            for (const c of best5) {
              const g = groups.find((g) => g.count === c.count);
              if (g) g.cells.push(c);
              else groups.push({ count: c.count, cells: [c] });
            }
            let rank = 1;
            return groups.map((g) => {
              const r = rank;
              rank += g.cells.length;
              return (
                <div key={g.count} className="top5-group">
                  <div className="top5-group-header">
                    <span className="top5-rank">#{r}</span>
                    <span className="top5-count best">{g.count} alertas</span>
                  </div>
                  <div className="top5-group-items">
                    {g.cells.map((c, j) => (
                      <span key={j} className="top5-tag" onClick={() => setSelectedCell(c)}>
                        {DAY_NAMES[c.day]} {formatHour(c.hour)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Detail panel on cell click */}
      {selectedCell && selectedCell.alerts.length > 0 && (
        <div className="heatmap-detail">
          <h3>
            {DAY_NAMES_FULL[selectedCell.day]} a las {formatHour(selectedCell.hour)} — {selectedCell.count} alertas
          </h3>
          <div className="detail-list">
            {selectedCell.alerts.slice(0, 20).map((a) => (
              <div key={a.id} className="detail-item">
                <span className="detail-time">
                  {new Date(a.timestamp).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                </span>
                <span className={`detail-threat ${a.threat}`}>
                  {a.threat === "missiles" ? "MISIL" : "DRONE"}
                </span>
                <span className="detail-cities">
                  {a.cities_en.slice(0, 3).join(", ")}
                </span>
              </div>
            ))}
            {selectedCell.alerts.length > 20 && (
              <div className="detail-more">+{selectedCell.alerts.length - 20} mas</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
