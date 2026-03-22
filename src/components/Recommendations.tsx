import { useMemo } from "react";
import type { Alert } from "../types";
import {
  getRecommendations,
  formatHour,
  buildDailySummaries,
  getRiskBadgeColor,
  getRiskLevel,
  buildHourlyDistribution,
} from "../utils/data";

interface Props {
  alerts: Alert[];
}

export default function Recommendations({ alerts }: Props) {
  const rec = useMemo(() => getRecommendations(alerts), [alerts]);
  const hourly = useMemo(() => buildHourlyDistribution(alerts), [alerts]);
  const daily = useMemo(() => buildDailySummaries(alerts), [alerts]);

  const maxHourly = Math.max(...hourly.map((h) => h.count), 1);

  // Best 2-hour window WITHIN WAKING HOURS (06:00 - 22:00)
  const windows: { start: number; avg: number }[] = [];
  for (let i = 6; i <= 20; i++) {
    const hours = [i, i + 1];
    const avg = hours.reduce((a, h) => a + hourly[h].percentage, 0) / 2;
    windows.push({ start: i, avg });
  }
  windows.sort((a, b) => a.avg - b.avg);
  const bestWindow = windows[0];
  const worstWindow = windows[windows.length - 1];

  const trendArrow =
    rec.trend === "up" ? "\u2191" : rec.trend === "down" ? "\u2193" : "\u2192";
  const trendColor =
    rec.trend === "up" ? "#c93d3d" : rec.trend === "down" ? "#1a6b4a" : "#b8a02e";

  const todayAlerts = daily.length > 0 ? daily[daily.length - 1].count : 0;
  const yesterdayAlerts = daily.length > 1 ? daily[daily.length - 2].count : 0;

  return (
    <div className="panel rec-panel">
      <h2>Recomendacion</h2>
      <p className="panel-subtitle">Basado en datos de 23 dias de conflicto (horario diurno 06-22hs)</p>

      <div className="rec-grid">
        <div className="rec-card best">
          <div className="rec-icon">&#x2714;</div>
          <div className="rec-content">
            <div className="rec-title">Mejor ventana para salir</div>
            <div className="rec-value">
              {formatHour(bestWindow.start)} - {formatHour(bestWindow.start + 2)}
            </div>
            <div className="rec-detail">
              {bestWindow.avg.toFixed(1)}% riesgo promedio/hora (en horario diurno)
            </div>
          </div>
        </div>

        <div className="rec-card worst">
          <div className="rec-icon">&#x26A0;</div>
          <div className="rec-content">
            <div className="rec-title">Peor ventana</div>
            <div className="rec-value">
              {formatHour(worstWindow.start)} - {formatHour(worstWindow.start + 2)}
            </div>
            <div className="rec-detail">
              {worstWindow.avg.toFixed(1)}% riesgo promedio/hora
            </div>
          </div>
        </div>

        <div className="rec-card trend">
          <div className="rec-icon" style={{ color: trendColor }}>
            {trendArrow}
          </div>
          <div className="rec-content">
            <div className="rec-title">Tendencia ultimos 3 dias</div>
            <div className="rec-value" style={{ color: trendColor }}>
              {rec.trend === "up" ? "Subiendo" : rec.trend === "down" ? "Bajando" : "Estable"}
            </div>
            <div className="rec-detail">
              {Math.abs(rec.trendValue).toFixed(0)}% vs 3 dias anteriores
            </div>
          </div>
        </div>

        <div className="rec-card avg">
          <div className="rec-icon">&#x1D4D3;</div>
          <div className="rec-content">
            <div className="rec-title">Promedio diario</div>
            <div className="rec-value">{rec.avgDaily.toFixed(1)} alertas/dia</div>
            <div className="rec-detail">
              Hoy: {todayAlerts} | Ayer: {yesterdayAlerts}
            </div>
          </div>
        </div>
      </div>

      <div className="rec-hourly-summary">
        <h3>Resumen por Franja Horaria</h3>
        <div className="rec-franja-grid">
          {[
            { label: "Madrugada", start: 0, end: 6 },
            { label: "Manana", start: 6, end: 10 },
            { label: "Mediodia", start: 10, end: 14 },
            { label: "Tarde", start: 14, end: 18 },
            { label: "Noche", start: 18, end: 24 },
          ].map((franja) => {
            const hours = hourly.filter((h) => h.hour >= franja.start && h.hour < franja.end);
            const totalPct = hours.reduce((a, h) => a + h.percentage, 0);
            const avgCount = hours.reduce((a, h) => a + h.count, 0) / (hours.length || 1);
            const risk = getRiskLevel(avgCount / maxHourly);

            return (
              <div key={franja.label} className="franja-card">
                <div className="franja-label">{franja.label}</div>
                <div className="franja-hours">
                  {formatHour(franja.start)}-{formatHour(franja.end)}
                </div>
                <div className="franja-risk" style={{ color: getRiskBadgeColor(risk) }}>
                  {risk}
                </div>
                <div className="franja-pct">{totalPct.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
