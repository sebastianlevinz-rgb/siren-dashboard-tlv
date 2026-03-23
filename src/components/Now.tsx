import { useMemo } from "react";
import type { Alert } from "../types";
import { type Lang, t, dayShort, dayFull } from "../i18n";
import { buildHeatmap, buildHourlyDistribution, formatHour, getRiskColor } from "../utils/data";

interface Props { alerts: Alert[]; lang: Lang; }

const LABELS: Record<Lang, Record<string, string>> = {
  en: { now: "Right Now", risk: "Risk Level", next: "Next Hours", today_forecast: "Today's Forecast", low: "LOW RISK", medium: "MODERATE", high: "HIGH RISK", extreme: "DANGER", go: "Good time to go out", caution: "Be cautious", avoid: "Avoid going out if possible", shelter: "Stay near shelter" },
  es: { now: "Ahora", risk: "Nivel de Riesgo", next: "Proximas Horas", today_forecast: "Pronostico de Hoy", low: "RIESGO BAJO", medium: "MODERADO", high: "RIESGO ALTO", extreme: "PELIGRO", go: "Buen momento para salir", caution: "Tene precaucion", avoid: "Evita salir si podes", shelter: "Quedate cerca de un refugio" },
  he: { now: "עכשיו", risk: "רמת סיכון", next: "השעות הבאות", today_forecast: "תחזית להיום", low: "סיכון נמוך", medium: "בינוני", high: "סיכון גבוה", extreme: "סכנה", go: "זמן טוב לצאת", caution: "היזהר", avoid: "הימנע מיציאה אם אפשר", shelter: "הישאר קרוב למקלט" },
};

export default function Now({ alerts, lang }: Props) {
  const l = LABELS[lang];
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0=Sunday

  const grid = useMemo(() => buildHeatmap(alerts), [alerts]);
  const hourly = useMemo(() => buildHourlyDistribution(alerts), [alerts]);
  const maxHourly = Math.max(...hourly.map((h) => h.count), 1);

  // Current cell
  const currentCell = grid[currentDay][currentHour];
  const maxCount = Math.max(...grid.flat().map((c) => c.count), 1);
  const currentRatio = currentCell.count / maxCount;

  // Risk level
  let riskLabel: string;
  let riskAdvice: string;
  let riskColorBg: string;
  if (currentRatio >= 0.75) {
    riskLabel = l.extreme; riskAdvice = l.shelter; riskColorBg = "#8b1a1a";
  } else if (currentRatio >= 0.5) {
    riskLabel = l.high; riskAdvice = l.avoid; riskColorBg = "#c93d3d";
  } else if (currentRatio >= 0.25) {
    riskLabel = l.medium; riskAdvice = l.caution; riskColorBg = "#b8a02e";
  } else {
    riskLabel = l.low; riskAdvice = l.go; riskColorBg = "#1a6b4a";
  }

  // Next 12 hours forecast
  const forecast = Array.from({ length: 12 }, (_, i) => {
    const h = (currentHour + i) % 24;
    const d = (currentDay + (currentHour + i >= 24 ? 1 : 0)) % 7;
    const cell = grid[d][h];
    const ratio = cell.count / maxCount;
    return { hour: h, day: d, count: cell.count, ratio, color: getRiskColor(cell.count, maxCount) };
  });

  // Today's hour-by-hour
  const todayHours = Array.from({ length: 24 }, (_, h) => {
    const cell = grid[currentDay][h];
    return { hour: h, count: cell.count, color: getRiskColor(cell.count, maxCount), isCurrent: h === currentHour };
  });

  return (
    <div className="panel now-panel">
      {/* Big risk indicator */}
      <div className="now-hero" style={{ background: `linear-gradient(135deg, ${riskColorBg}, ${riskColorBg}88)` }}>
        <div className="now-time">{formatHour(currentHour)} — {dayFull(currentDay, lang)}</div>
        <div className="now-risk-label">{riskLabel}</div>
        <div className="now-advice">{riskAdvice}</div>
        <div className="now-stat">{currentCell.count} {t("alerts_s", lang)} {t("at_time", lang)} {dayShort(currentDay, lang)} {formatHour(currentHour)}</div>
      </div>

      {/* Next 12 hours */}
      <div className="now-section">
        <h3>{l.next}</h3>
        <div className="now-forecast">
          {forecast.map((f, i) => (
            <div key={i} className={`forecast-cell ${i === 0 ? "current" : ""}`}>
              <span className="forecast-hour">{formatHour(f.hour)}</span>
              <div className="forecast-bar" style={{ backgroundColor: f.color, height: `${Math.max(4, (f.count / maxCount) * 48)}px` }} />
              <span className="forecast-count">{f.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today full day */}
      <div className="now-section">
        <h3>{l.today_forecast}</h3>
        <div className="now-today">
          {todayHours.map((h) => (
            <div key={h.hour} className={`today-row ${h.isCurrent ? "current" : ""}`}>
              <span className="today-hour">{formatHour(h.hour)}</span>
              <div className="today-bar-track">
                <div className="today-bar-fill" style={{ width: `${(h.count / maxCount) * 100}%`, backgroundColor: h.color }} />
              </div>
              <span className="today-count">{h.count}</span>
              {h.isCurrent && <span className="today-now-badge">{l.now}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
