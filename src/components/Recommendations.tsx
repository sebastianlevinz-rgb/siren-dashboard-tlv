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
  lang?: string;
}

export default function Recommendations({ alerts }: Props) {
  const rec = useMemo(() => getRecommendations(alerts), [alerts]);
  const hourly = useMemo(() => buildHourlyDistribution(alerts), [alerts]);
  const daily = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const maxHourly = Math.max(...hourly.map((h) => h.count), 1);

  // Best 2-hour window within waking hours (06-22)
  const windows: { start: number; avg: number }[] = [];
  for (let i = 6; i <= 20; i++) {
    const avg = [i, i + 1].reduce((a, h) => a + hourly[h].percentage, 0) / 2;
    windows.push({ start: i, avg });
  }
  windows.sort((a, b) => a.avg - b.avg);
  const bestWindow = windows[0];
  const worstWindow = windows[windows.length - 1];

  const trendArrow = rec.trend === "up" ? "\u2191" : rec.trend === "down" ? "\u2193" : "\u2192";
  const trendColor = rec.trend === "up" ? "#c93d3d" : rec.trend === "down" ? "#1a6b4a" : "#b8a02e";

  const todayAlerts = daily.length > 0 ? daily[daily.length - 1].count : 0;
  const yesterdayAlerts = daily.length > 1 ? daily[daily.length - 2].count : 0;

  return (
    <div className="panel rec-panel">
      <h2>Recommendations</h2>
      <p className="panel-subtitle">Based on 24 days of conflict data (daytime hours 06-22h)</p>

      <div className="rec-grid">
        <div className="rec-card best">
          <div className="rec-icon">&#x2714;</div>
          <div className="rec-content">
            <div className="rec-title">Safest window to go out</div>
            <div className="rec-value">{formatHour(bestWindow.start)} - {formatHour(bestWindow.start + 2)}</div>
            <div className="rec-detail">{bestWindow.avg.toFixed(1)}% avg risk/hour (daytime)</div>
          </div>
        </div>

        <div className="rec-card worst">
          <div className="rec-icon">&#x26A0;</div>
          <div className="rec-content">
            <div className="rec-title">Most dangerous window</div>
            <div className="rec-value">{formatHour(worstWindow.start)} - {formatHour(worstWindow.start + 2)}</div>
            <div className="rec-detail">{worstWindow.avg.toFixed(1)}% avg risk/hour</div>
          </div>
        </div>

        <div className="rec-card trend">
          <div className="rec-icon" style={{ color: trendColor }}>{trendArrow}</div>
          <div className="rec-content">
            <div className="rec-title">Last 3 days trend</div>
            <div className="rec-value" style={{ color: trendColor }}>
              {rec.trend === "up" ? "Increasing" : rec.trend === "down" ? "Decreasing" : "Stable"}
            </div>
            <div className="rec-detail">{Math.abs(rec.trendValue).toFixed(0)}% vs previous 3 days</div>
          </div>
        </div>

        <div className="rec-card avg">
          <div className="rec-icon">&#x1D4D3;</div>
          <div className="rec-content">
            <div className="rec-title">Daily average</div>
            <div className="rec-value">{rec.avgDaily.toFixed(1)} alerts/day</div>
            <div className="rec-detail">Today: {todayAlerts} | Yesterday: {yesterdayAlerts}</div>
          </div>
        </div>
      </div>

      <div className="rec-hourly-summary">
        <h3>Risk by Time Slot</h3>
        <div className="rec-franja-grid">
          {[
            { label: "Night", start: 0, end: 6 },
            { label: "Morning", start: 6, end: 10 },
            { label: "Midday", start: 10, end: 14 },
            { label: "Afternoon", start: 14, end: 18 },
            { label: "Evening", start: 18, end: 24 },
          ].map((slot) => {
            const hours = hourly.filter((h) => h.hour >= slot.start && h.hour < slot.end);
            const totalPct = hours.reduce((a, h) => a + h.percentage, 0);
            const avgCount = hours.reduce((a, h) => a + h.count, 0) / (hours.length || 1);
            const risk = getRiskLevel(avgCount / maxHourly);
            return (
              <div key={slot.label} className="franja-card">
                <div className="franja-label">{slot.label}</div>
                <div className="franja-hours">{formatHour(slot.start)}-{formatHour(slot.end)}</div>
                <div className="franja-risk" style={{ color: getRiskBadgeColor(risk) }}>{risk}</div>
                <div className="franja-pct">{totalPct.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
