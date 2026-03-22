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

  // Best 3-hour window
  const windows: { start: number; avg: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const hours = [i, (i + 1) % 24, (i + 2) % 24];
    const avg =
      hours.reduce((a, h) => a + hourly[h].percentage, 0) / 3;
    windows.push({ start: i, avg });
  }
  windows.sort((a, b) => a.avg - b.avg);
  const bestWindow = windows[0];
  const _worstWindow = windows[windows.length - 1];

  const trendArrow =
    rec.trend === "up" ? "↑" : rec.trend === "down" ? "↓" : "→";
  const trendColor =
    rec.trend === "up" ? "#E24B4A" : rec.trend === "down" ? "#2d6a4f" : "#EF9F27";

  const todayAlerts = daily.length > 0 ? daily[daily.length - 1].count : 0;
  const yesterdayAlerts = daily.length > 1 ? daily[daily.length - 2].count : 0;

  return (
    <div className="panel rec-panel">
      <h2>Recomendación</h2>

      <div className="rec-grid">
        {/* Best hour */}
        <div className="rec-card best">
          <div className="rec-icon">&#x2714;</div>
          <div className="rec-content">
            <div className="rec-title">Mejor ventana para salir</div>
            <div className="rec-value">
              {formatHour(bestWindow.start)} -{" "}
              {formatHour((bestWindow.start + 3) % 24)}
            </div>
            <div className="rec-detail">
              {bestWindow.avg.toFixed(1)}% promedio de riesgo por hora
            </div>
          </div>
        </div>

        {/* Worst hour */}
        <div className="rec-card worst">
          <div className="rec-icon">&#x26A0;</div>
          <div className="rec-content">
            <div className="rec-title">Peor hora</div>
            <div className="rec-value">{formatHour(rec.worstHour.hour)}</div>
            <div className="rec-detail">
              {rec.worstHour.percentage.toFixed(1)}% del total de alertas
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="rec-card trend">
          <div className="rec-icon" style={{ color: trendColor }}>
            {trendArrow}
          </div>
          <div className="rec-content">
            <div className="rec-title">Tendencia últimos 3 días</div>
            <div className="rec-value" style={{ color: trendColor }}>
              {rec.trend === "up"
                ? "Subiendo"
                : rec.trend === "down"
                ? "Bajando"
                : "Estable"}
            </div>
            <div className="rec-detail">
              {Math.abs(rec.trendValue).toFixed(0)}% vs 3 días anteriores
            </div>
          </div>
        </div>

        {/* Daily average */}
        <div className="rec-card avg">
          <div className="rec-icon">&#x1D4D3;</div>
          <div className="rec-content">
            <div className="rec-title">Promedio diario</div>
            <div className="rec-value">
              {rec.avgDaily.toFixed(1)} alertas/día
            </div>
            <div className="rec-detail">
              Hoy: {todayAlerts} | Ayer: {yesterdayAlerts}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly risk summary */}
      <div className="rec-hourly-summary">
        <h3>Resumen por Franja Horaria</h3>
        <div className="rec-franja-grid">
          {[
            { label: "Madrugada", start: 0, end: 6 },
            { label: "Mañana", start: 6, end: 12 },
            { label: "Mediodía", start: 12, end: 14 },
            { label: "Tarde", start: 14, end: 18 },
            { label: "Noche", start: 18, end: 24 },
          ].map((franja) => {
            const hours = hourly.filter(
              (h) => h.hour >= franja.start && h.hour < franja.end
            );
            const totalPct = hours.reduce((a, h) => a + h.percentage, 0);
            const avgCount =
              hours.reduce((a, h) => a + h.count, 0) / (hours.length || 1);
            const risk = getRiskLevel(avgCount / maxHourly);

            return (
              <div key={franja.label} className="franja-card">
                <div className="franja-label">{franja.label}</div>
                <div className="franja-hours">
                  {formatHour(franja.start)}-{formatHour(franja.end)}
                </div>
                <div
                  className="franja-risk"
                  style={{ color: getRiskBadgeColor(risk) }}
                >
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
