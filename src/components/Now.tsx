import { useMemo } from "react";
import type { Alert } from "../types";
import { type Lang, dayFull } from "../i18n";
import { formatHour, getRiskColor, getDayOfWeekOccurrences } from "../utils/data";

interface Props { alerts: Alert[]; lang: Lang; }

const L: Record<Lang, Record<string, string>> = {
  en: {
    prob: "probability of alert",
    expected: "expected missiles",
    total_today: "Total expected today",
    hourly: "Hour-by-Hour Forecast",
    based_on: "Based on {W} previous {DAY}s",
    now: "NOW",
    missiles: "missiles",
  },
  es: {
    prob: "probabilidad de alerta",
    expected: "misiles esperados",
    total_today: "Total esperado hoy",
    hourly: "Pronostico Hora por Hora",
    based_on: "Basado en {W} {DAY} anteriores",
    now: "AHORA",
    missiles: "misiles",
  },
  he: {
    prob: "הסתברות להתרעה",
    expected: "טילים צפויים",
    total_today: "סה\"כ צפוי היום",
    hourly: "תחזית שעה אחר שעה",
    based_on: "מבוסס על {W} ימי {DAY} קודמים",
    now: "עכשיו",
    missiles: "טילים",
  },
};

export default function Now({ alerts, lang }: Props) {
  const l = L[lang];
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  const dowOccurrences = useMemo(() => getDayOfWeekOccurrences(alerts), [alerts]);
  const weeks = dowOccurrences[currentDay] || 1;

  // Filter alerts for this day of week only
  const dayAlerts = useMemo(() => alerts.filter(a => a.day_of_week === currentDay), [alerts, currentDay]);

  // Count total alerts per hour on this day of week
  const hourlyCounts = useMemo(() => {
    const counts = new Array(24).fill(0);
    for (const a of dayAlerts) counts[a.hour]++;
    return counts;
  }, [dayAlerts]);

  // Count distinct dates with at least one alert per hour (for probability)
  const hourlyDatesWithAlerts = useMemo(() => {
    const sets: Set<string>[] = Array.from({ length: 24 }, () => new Set());
    for (const a of dayAlerts) sets[a.hour].add(a.date);
    return sets.map(s => s.size);
  }, [dayAlerts]);

  // Build forecast
  const forecast = Array.from({ length: 24 }, (_, h) => {
    const expected = hourlyCounts[h] / weeks;
    const probability = (hourlyDatesWithAlerts[h] / weeks) * 100;
    return { hour: h, expected, probability };
  });

  const totalExpected = forecast.reduce((s, f) => s + f.expected, 0);
  const maxExpected = Math.max(...forecast.map(f => f.expected), 0.01);

  // Current hour
  const cur = forecast[currentHour];
  const riskRatio = cur.probability / 100;
  let riskBg: string;
  if (riskRatio >= 0.75) riskBg = "#8b1a1a";
  else if (riskRatio >= 0.5) riskBg = "#c93d3d";
  else if (riskRatio >= 0.25) riskBg = "#b8a02e";
  else riskBg = "#1a6b4a";

  const basedOn = l.based_on
    .replace("{W}", String(weeks))
    .replace("{DAY}", dayFull(currentDay, lang));

  return (
    <div className="panel now-panel">
      {/* Hero */}
      <div className="now-hero" style={{ background: `linear-gradient(135deg, ${riskBg}, ${riskBg}88)` }}>
        <div className="now-time">{dayFull(currentDay, lang)} — {formatHour(currentHour)}</div>
        <div className="now-risk-label">{cur.probability.toFixed(0)}%</div>
        <div className="now-advice">{l.prob}</div>
        <div className="now-stat">~{cur.expected.toFixed(1)} {l.expected} | {l.total_today}: ~{totalExpected.toFixed(0)}</div>
        <div className="now-stat" style={{ marginTop: 4 }}>{basedOn}</div>
      </div>

      {/* Hour by hour */}
      <div className="now-section">
        <h3>{l.hourly}</h3>
        <div className="now-today">
          {forecast.map((f) => (
            <div key={f.hour} className={`today-row ${f.hour === currentHour ? "current" : ""}`}>
              <span className="today-hour">{formatHour(f.hour)}</span>
              <div className="today-bar-track">
                <div
                  className="today-bar-fill"
                  style={{
                    width: `${(f.expected / maxExpected) * 100}%`,
                    backgroundColor: getRiskColor(f.expected, maxExpected),
                  }}
                />
              </div>
              <span className="today-count" style={{ minWidth: 32 }}>{f.probability.toFixed(0)}%</span>
              <span className="today-count" style={{ minWidth: 28, opacity: 0.7 }}>~{f.expected.toFixed(1)}</span>
              {f.hour === currentHour && <span className="today-now-badge">{l.now}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
