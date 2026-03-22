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

// Start at 06:00 like the heatmap
const HOUR_ORDER = [...Array.from({ length: 18 }, (_, i) => i + 6), ...Array.from({ length: 6 }, (_, i) => i)];

function riskColor(risk: string): string {
  switch (risk) {
    case "extreme": return "#c93d3d";
    case "high": return "#d4822a";
    case "medium": return "#b8a02e";
    default: return "#1a6b4a";
  }
}

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

  const routineRisks = routine.map((w) => {
    const hours = hourly.filter((h) => h.hour >= w.startHour && h.hour < w.endHour);
    const totalPct = hours.reduce((a, h) => a + h.percentage, 0);
    return { ...w, totalPct };
  });

  return (
    <div className="panel histogram-panel">
      <h2>Probabilidad por Hora</h2>
      <p className="panel-subtitle">
        % del total de alertas TLV en cada hora. Empieza a las 06:00.
      </p>

      {/* Horizontal bar chart — works great on mobile */}
      <div className="h-histogram">
        {HOUR_ORDER.map((h) => {
          const data = hourly[h];
          const isInRoutine = routine.some(
            (w) => h >= w.startHour && h < w.endHour
          );
          const isNight = h < 6;

          return (
            <div key={h} className={`h-bar-row ${isNight ? "night" : ""} ${isInRoutine ? "routine" : ""}`}>
              <span className="h-bar-hour">{formatHour(h)}</span>
              <div className="h-bar-track">
                <div
                  className="h-bar-fill"
                  style={{
                    width: `${(data.percentage / maxPct) * 100}%`,
                    backgroundColor: riskColor(data.risk),
                  }}
                />
                {isInRoutine && <div className="h-bar-routine-dot" />}
              </div>
              <span className="h-bar-pct">{data.percentage.toFixed(1)}%</span>
              <span className="h-bar-count">({data.count})</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="histogram-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#1a6b4a" }} />Bajo
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#b8a02e" }} />Medio
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#d4822a" }} />Alto
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#c93d3d" }} />Extremo
        </span>
        <span className="legend-item">
          <span className="legend-dot routine-dot" />Tu rutina
        </span>
      </div>

      {/* Routine */}
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
              <button className="routine-remove" onClick={() => setRoutine(routine.filter((_, j) => j !== i))}>
                x
              </button>
            </div>
          ))}
        </div>

        {editingRoutine ? (
          <div className="routine-form">
            <input type="text" placeholder="Etiqueta" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
            <select value={newStart} onChange={(e) => setNewStart(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{formatHour(h)}</option>
              ))}
            </select>
            <span>a</span>
            <select value={newEnd} onChange={(e) => setNewEnd(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{formatHour(h)}</option>
              ))}
            </select>
            <button className="btn-add" onClick={() => {
              if (newLabel && newEnd > newStart) {
                setRoutine([...routine, { label: newLabel, startHour: newStart, endHour: newEnd }]);
                setNewLabel("");
                setEditingRoutine(false);
              }
            }}>Agregar</button>
            <button className="btn-cancel" onClick={() => setEditingRoutine(false)}>Cancelar</button>
          </div>
        ) : (
          <button className="btn-add-routine" onClick={() => setEditingRoutine(true)}>
            + Agregar ventana horaria
          </button>
        )}
      </div>
    </div>
  );
}
