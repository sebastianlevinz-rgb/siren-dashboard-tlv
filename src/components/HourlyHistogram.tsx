import { useState, useMemo } from "react";
import type { Alert, RoutineWindow } from "../types";
import { type Lang, t, tryT } from "../i18n";
import { buildHourlyDistribution, formatHour } from "../utils/data";

const HOUR_ORDER = [...Array.from({ length: 18 }, (_, i) => i + 6), ...Array.from({ length: 6 }, (_, i) => i)];

function riskColor(risk: string): string {
  switch (risk) {
    case "extreme": return "#c93d3d";
    case "high": return "#d4822a";
    case "medium": return "#b8a02e";
    default: return "#1a6b4a";
  }
}

interface Props { alerts: Alert[]; lang: Lang; }

export default function HourlyHistogram({ alerts, lang }: Props) {
  const [routine, setRoutine] = useState<RoutineWindow[]>([
    { label: "commute_to", startHour: 7, endHour: 9 },
    { label: "commute_home", startHour: 17, endHour: 19 },
  ]);
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
      <h2>{t("hist_title", lang)}</h2>
      <p className="panel-subtitle">{t("hist_sub", lang)}</p>

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
        {(["low", "medium", "high", "extreme"] as const).map((level) => (
          <span key={level} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: riskColor(level) }} />
            {t(level, lang)}
          </span>
        ))}
        <span className="legend-item"><span className="legend-dot routine-dot" />{t("your_routine", lang)}</span>
      </div>

      <div className="routine-section">
        <h3>{t("my_routine", lang)}</h3>
        <div className="routine-windows">
          {routineRisks.map((w, i) => (
            <div key={i} className="routine-card">
              <div className="routine-label">{tryT(w.label, lang)}</div>
              <div className="routine-time">{formatHour(w.startHour)} - {formatHour(w.endHour)}</div>
              <div className="routine-risk">{t("cumulative_risk", lang)}: {w.totalPct.toFixed(1)}%</div>
              <button className="routine-remove" onClick={() => setRoutine(routine.filter((_, j) => j !== i))}>x</button>
            </div>
          ))}
        </div>
        {editingRoutine ? (
          <div className="routine-form">
            <input type="text" placeholder={t("label", lang)} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
            <select value={newStart} onChange={(e) => setNewStart(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{formatHour(h)}</option>)}
            </select>
            <span>{t("to", lang)}</span>
            <select value={newEnd} onChange={(e) => setNewEnd(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{formatHour(h)}</option>)}
            </select>
            <button className="btn-add" onClick={() => {
              if (newLabel && newEnd > newStart) { setRoutine([...routine, { label: newLabel, startHour: newStart, endHour: newEnd }]); setNewLabel(""); setEditingRoutine(false); }
            }}>{t("add", lang)}</button>
            <button className="btn-cancel" onClick={() => setEditingRoutine(false)}>{t("cancel", lang)}</button>
          </div>
        ) : (
          <button className="btn-add-routine" onClick={() => setEditingRoutine(true)}>{t("add_window", lang)}</button>
        )}
      </div>
    </div>
  );
}
