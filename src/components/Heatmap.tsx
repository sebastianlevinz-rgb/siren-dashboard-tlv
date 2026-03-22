import React, { useState, useMemo } from "react";
import type { Alert, HeatmapCell } from "../types";
import { buildHeatmap, DAY_NAMES, formatHour, getRiskColor } from "../utils/data";

interface Props {
  alerts: Alert[];
}

export default function Heatmap({ alerts }: Props) {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const grid = useMemo(() => buildHeatmap(alerts), [alerts]);
  const maxCount = useMemo(
    () => Math.max(...grid.flat().map((c) => c.count), 1),
    [grid]
  );

  // Israel order: Sunday first
  const dayOrder = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="panel heatmap-panel">
      <h2>Alertas por Día × Hora</h2>
      <p className="panel-subtitle">
        Acumulado total — cada celda suma todas las alertas para esa combinación
        día/hora
      </p>

      <div className="heatmap-container">
        {/* Hour labels on top */}
        <div className="heatmap-grid">
          <div className="heatmap-corner" />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="heatmap-hour-label">
              {h}
            </div>
          ))}

          {dayOrder.map((day) => (
            <React.Fragment key={day}>
              <div className="heatmap-day-label">
                {DAY_NAMES[day]}
              </div>
              {Array.from({ length: 24 }, (_, hour) => {
                const cell = grid[day][hour];
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`heatmap-cell ${
                      selectedCell?.day === day && selectedCell?.hour === hour
                        ? "selected"
                        : ""
                    }`}
                    style={{
                      backgroundColor: getRiskColor(cell.count, maxCount),
                    }}
                    onClick={() =>
                      setSelectedCell(
                        selectedCell?.day === day && selectedCell?.hour === hour
                          ? null
                          : cell
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

        {/* Color legend */}
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

      {/* Detail panel */}
      {selectedCell && selectedCell.alerts.length > 0 && (
        <div className="heatmap-detail">
          <h3>
            {DAY_NAMES[selectedCell.day]} a las {formatHour(selectedCell.hour)} —{" "}
            {selectedCell.count} alertas
          </h3>
          <div className="detail-list">
            {selectedCell.alerts.slice(0, 20).map((a) => (
              <div key={a.id} className="detail-item">
                <span className="detail-time">
                  {new Date(a.timestamp).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
                <span
                  className={`detail-threat ${a.threat}`}
                >
                  {a.threat === "missiles" ? "MISIL" : "DRONE"}
                </span>
                <span className="detail-cities">
                  {a.cities_en.slice(0, 3).join(", ")}
                </span>
              </div>
            ))}
            {selectedCell.alerts.length > 20 && (
              <div className="detail-more">
                +{selectedCell.alerts.length - 20} más
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
