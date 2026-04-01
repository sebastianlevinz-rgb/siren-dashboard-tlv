import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { type Lang, t } from "../i18n";
import { getRecommendations, formatHour, buildDailySummaries, getRiskBadgeColor, getRiskLevel, buildHourlyDistribution } from "@war/shared";

interface Props { alerts: Alert[]; lang: Lang; }

const SLOTS: { key: "slot_night" | "slot_morning" | "slot_midday" | "slot_afternoon" | "slot_evening"; start: number; end: number }[] = [
  { key: "slot_night", start: 0, end: 6 },
  { key: "slot_morning", start: 6, end: 10 },
  { key: "slot_midday", start: 10, end: 14 },
  { key: "slot_afternoon", start: 14, end: 18 },
  { key: "slot_evening", start: 18, end: 24 },
];

export default function Recommendations({ alerts, lang }: Props) {
  const rec = useMemo(() => getRecommendations(alerts), [alerts]);
  const hourly = useMemo(() => buildHourlyDistribution(alerts), [alerts]);
  const daily = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const maxHourly = Math.max(...hourly.map((h) => h.count), 1);

  const windows: { start: number; avg: number }[] = [];
  for (let i = 6; i <= 20; i++) {
    windows.push({ start: i, avg: [i, i + 1].reduce((a, h) => a + hourly[h].percentage, 0) / 2 });
  }
  windows.sort((a, b) => a.avg - b.avg);
  const bestWindow = windows[0];
  const worstWindow = windows[windows.length - 1];

  const trendArrow = rec.trend === "up" ? "\u2191" : rec.trend === "down" ? "\u2193" : "\u2192";
  const trendColor = rec.trend === "up" ? "#c93d3d" : rec.trend === "down" ? "#1a6b4a" : "#b8a02e";
  const trendLabel = rec.trend === "up" ? t("increasing", lang) : rec.trend === "down" ? t("decreasing", lang) : t("stable", lang);

  // Use Israel time (UTC+2/+3) for "today" — toISOString is UTC and wrong after midnight
  const now = new Date();
  const israelOffset = 2 * 60; // IST minimum; close enough for date boundary
  const israelNow = new Date(now.getTime() + (israelOffset + now.getTimezoneOffset()) * 60000);
  const todayStr = israelNow.toISOString().slice(0, 10);
  const yesterdayIsrael = new Date(israelNow.getTime() - 86400000);
  const yesterday = yesterdayIsrael.toISOString().slice(0, 10);
  const todayAlerts = daily.find(d => d.date === todayStr)?.count ?? 0;
  const yesterdayAlerts = daily.find(d => d.date === yesterday)?.count ?? 0;

  return (
    <div className="panel rec-panel">
      <h2>{t("tips_title", lang)}</h2>
      <p className="panel-subtitle">{t("tips_sub", lang).replace("{N}", String(daily.length))}</p>

      <div className="rec-grid">
        <div className="rec-card best">
          <div className="rec-icon">&#x2714;</div>
          <div className="rec-content">
            <div className="rec-title">{t("safest_window", lang)}</div>
            <div className="rec-value">{formatHour(bestWindow.start)} - {formatHour(bestWindow.start + 2)}</div>
            <div className="rec-detail">{bestWindow.avg.toFixed(1)}% {t("avg_risk_hour", lang)}</div>
          </div>
        </div>

        <div className="rec-card worst">
          <div className="rec-icon">&#x26A0;</div>
          <div className="rec-content">
            <div className="rec-title">{t("most_dangerous_window", lang)}</div>
            <div className="rec-value">{formatHour(worstWindow.start)} - {formatHour(worstWindow.start + 2)}</div>
            <div className="rec-detail">{worstWindow.avg.toFixed(1)}% {t("avg_risk", lang)}</div>
          </div>
        </div>

        <div className="rec-card trend">
          <div className="rec-icon" style={{ color: trendColor }}>{trendArrow}</div>
          <div className="rec-content">
            <div className="rec-title">{t("last_3_trend", lang)}</div>
            <div className="rec-value" style={{ color: trendColor }}>{trendLabel}</div>
            <div className="rec-detail">{Math.abs(rec.trendValue).toFixed(0)}% {t("vs_prev", lang)}</div>
          </div>
        </div>

        <div className="rec-card avg">
          <div className="rec-icon">&#x1D4D3;</div>
          <div className="rec-content">
            <div className="rec-title">{t("daily_avg", lang)}</div>
            <div className="rec-value">{rec.avgDaily.toFixed(1)} {t("alerts_day", lang)}</div>
            <div className="rec-detail">{t("today", lang)}: {todayAlerts} | {t("yesterday", lang)}: {yesterdayAlerts}</div>
          </div>
        </div>
      </div>

      <div className="rec-hourly-summary">
        <h3>{t("risk_by_slot", lang)}</h3>
        <div className="rec-franja-grid">
          {SLOTS.map((slot) => {
            const hours = hourly.filter((h) => h.hour >= slot.start && h.hour < slot.end);
            const totalPct = hours.reduce((a, h) => a + h.percentage, 0);
            const avgPctPerHour = totalPct / (hours.length || 1);
            const avgCount = hours.reduce((a, h) => a + h.count, 0) / (hours.length || 1);
            const risk = getRiskLevel(avgCount / maxHourly);
            return (
              <div key={slot.key} className="franja-card">
                <div className="franja-label">{t(slot.key, lang)}</div>
                <div className="franja-hours">{formatHour(slot.start)}-{formatHour(slot.end)}</div>
                <div className="franja-risk" style={{ color: getRiskBadgeColor(risk) }}>{risk}</div>
                <div className="franja-pct">{avgPctPerHour.toFixed(1)}% <span style={{ opacity: 0.5, fontSize: "0.85em" }}>/h</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
