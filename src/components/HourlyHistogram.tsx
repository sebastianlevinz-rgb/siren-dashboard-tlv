import { useState, useMemo } from "react";
import type { Alert, RoutineWindow } from "../types";
import { buildHourlyDistribution, formatHour } from "../utils/data";

interface Props {
  alerts: Alert[];
  lang?: string;
}

const DEFAULT_ROUTINE: RoutineWindow[] = [
  { label: "Commute to work", startHour: 7, endHour: 9 },
  { label: "Commute home", startHour: 17, endHour: 19 },
];

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
  const maxPct = useMemo(() => Math.max(...hourly.map((h) => h.percentage), 1), [hourly]);

  const routineRisks = routine.map((w) => {
    const hours = hourly.filter((h) => h.hour >= w.startHour && h.hour < w.endHour);
    return { ...w, totalPct: hours.reduce((a, h) => a + h.percentage, 0) };
  });

  return (
    <div className="panel histogram-panel">
      <h2>Probability by Hour</h2>
      <p className="panel-subtitle">% of total alerts per hour. Starts at 06:00.</p>

      <div className="h-histogram">
        {HOUR_ORDER.map((h) => {
          const data = hourly[h];
          const isInRoutine = routine.some((w) => h >= w.startHour && h < w.endHour);
          return (
            <div key={h} className={`h-bar-row ${h < 6 ? "night" : ""} ${isInRoutine ? "routine" : ""}`}>
              <span className="h-bar-hour">{formatHour(h)}</span>
              <div className="h-bar-track">
                <div className="h-bar-fill" style={{ width: `${(data.percentage / maxPct) * 100}%`, backgroundColor: riskColor(data.risk) }} />
                {isInRoutine && <div className="h-bar-routine-dot" />}
              </div>
              <span className="h-bar-pct">{data.percentage.toFixed(1)}%</span>
              <span className="h-bar-count">({data.count})</span>
            </div>
          );
        })}
      </div>

      <div className="histogram-legend">
        <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#1a6b4a" }} />Low</span>
        <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#b8a02e" }} />Medium</span>
        <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#d4822a" }} />High</span>
        <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#c93d3d" }} />Extreme</span>
        <span className="legend-item"><span className="legend-dot routine-dot" />Your routine</span>
      </div>

      <div className="routine-section">
        <h3>My Routine</h3>
        <div className="routine-windows">
          {routineRisks.map((w, i) => (
            <div key={i} className="routine-card">
              <div className="routine-label">{w.label}</div>
              <div className="routine-time">{formatHour(w.startHour)} - {formatHour(w.endHour)}</div>
              <div className="routine-risk">Cumulative risk: {w.totalPct.toFixed(1)}%</div>
              <button className="routine-remove" onClick={() => setRoutine(routine.filter((_, j) => j !== i))}>x</button>
            </div>
          ))}
        </div>

        {editingRoutine ? (
          <div className="routine-form">
            <input type="text" placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
            <select value={newStart} onChange={(e) => setNewStart(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{formatHour(h)}</option>)}
            </select>
            <span>to</span>
            <select value={newEnd} onChange={(e) => setNewEnd(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{formatHour(h)}</option>)}
            </select>
            <button className="btn-add" onClick={() => {
              if (newLabel && newEnd > newStart) { setRoutine([...routine, { label: newLabel, startHour: newStart, endHour: newEnd }]); setNewLabel(""); setEditingRoutine(false); }
            }}>Add</button>
            <button className="btn-cancel" onClick={() => setEditingRoutine(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn-add-routine" onClick={() => setEditingRoutine(true)}>+ Add time window</button>
        )}
      </div>
    </div>
  );
}
