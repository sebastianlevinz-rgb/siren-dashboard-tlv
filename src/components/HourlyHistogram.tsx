import { useState, useMemo } from "react";
import type { Alert, RoutineWindow } from "../types";
import { buildHourlyDistribution, formatHour } from "../utils/data";

interface Props {
  alerts: Alert[];
}

const DEFAULT_ROUTINE: RoutineWindow[] = [
  { label: "Ida al trabajo", startHour: 7, endHour: 9 },
  { label: "Vuelta a casa", startHour: 17, endHour: 19 },
];

export default function HourlyHistogram({ alerts }: Props) {
  const [routine, setRoutine] = useState<RoutineWindow[]>(DEFAULT_ROUTINE);
  const [editingRoutine, setEditingRoutine] = useState(false);
  const [newStart, setNewStart] = useState(8);
  const [newEnd, setNewEnd] = useState(17);
  const [newLabel, setNewLabel] = useState("");

  const hourly = useMemo(() => buildHourlyDistribution(alerts), [alerts]);
  const maxPct = useMemo(
    () => Math.max(...hourly.map((h) => h.percentage), 1),
    [hourly]
  );

  // Green-to-red risk colors matching new palette
  const riskColors: Record<string, string> = {
    low: "#1a6b4a",
    medium: "#b8a02e",
    high: "#d4822a",
    extreme: "#c93d3d",
  };

  const routineRisks = routine.map((w) => {
    const hours = hourly.filter(
      (h) => h.hour >= w.startHour && h.hour < w.endHour
    );
    const totalPct = hours.reduce((a, h) => a + h.percentage, 0);
    return { ...w, totalPct };
  });

  return (
    <div className="panel histogram-panel">
      <h2>Probabilidad por Hora</h2>
      <p className="panel-subtitle">
        % del total de alertas que caen en cada hora del dia
      </p>

      <div className="histogram-chart">
        {hourly.map((h) => {
          const isInRoutine = routine.some(
            (w) => h.hour >= w.startHour && h.hour < w.endHour
          );

          return (
            <div key={h.hour} className="histogram-bar-wrapper">
              <div className="histogram-pct">
                {h.percentage.toFixed(1)}%
              </div>
              <div className="histogram-bar-container">
                <div
                  className={`histogram-bar ${isInRoutine ? "routine" : ""}`}
                  style={{
                    height: `${(h.percentage / maxPct) * 100}%`,
                    backgroundColor: riskColors[h.risk],
                  }}
                />
                {isInRoutine && <div className="routine-marker" />}
              </div>
              <div className="histogram-hour">{formatHour(h.hour)}</div>
            </div>
          );
        })}
      </div>

      <div className="histogram-legend">
        {(["low", "medium", "high", "extreme"] as const).map((level) => (
          <span key={level} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: riskColors[level] }}
            />
            {level === "low"
              ? "Bajo"
              : level === "medium"
              ? "Medio"
              : level === "high"
              ? "Alto"
              : "Extremo"}
          </span>
        ))}
        <span className="legend-item">
          <span className="legend-dot routine-dot" />
          Tu rutina
        </span>
      </div>

      <div className="routine-section">
        <h3>Mi Rutina</h3>
        <div className="routine-windows">
          {routineRisks.map((w, i) => (
            <div key={i} className="routine-card">
              <div className="routine-label">{w.label}</div>
              <div className="routine-time">
                {formatHour(w.startHour)} - {formatHour(w.endHour)}
              </div>
              <div className="routine-risk">
                Riesgo acumulado: {w.totalPct.toFixed(1)}%
              </div>
              <button
                className="routine-remove"
                onClick={() =>
                  setRoutine(routine.filter((_, j) => j !== i))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {editingRoutine ? (
          <div className="routine-form">
            <input
              type="text"
              placeholder="Etiqueta (ej: Gimnasio)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <select
              value={newStart}
              onChange={(e) => setNewStart(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
            <span>a</span>
            <select
              value={newEnd}
              onChange={(e) => setNewEnd(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
            <button
              className="btn-add"
              onClick={() => {
                if (newLabel && newEnd > newStart) {
                  setRoutine([
                    ...routine,
                    {
                      label: newLabel,
                      startHour: newStart,
                      endHour: newEnd,
                    },
                  ]);
                  setNewLabel("");
                  setEditingRoutine(false);
                }
              }}
            >
              Agregar
            </button>
            <button
              className="btn-cancel"
              onClick={() => setEditingRoutine(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            className="btn-add-routine"
            onClick={() => setEditingRoutine(true)}
          >
            + Agregar ventana horaria
          </button>
        )}
      </div>
    </div>
  );
}
