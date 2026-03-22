import { useMemo } from "react";
import type { Alert } from "../types";
import { buildDailySummaries } from "../utils/data";

type Lang = "en" | "es" | "he";

const T: Record<Lang, Record<string, string>> = {
  en: { alerts: "Alerts", period: "Period", avg: "Avg/day", updated: "Updated", subtitle: "Tel Aviv / Gush Dan — Feb 28 to Mar 23, 2026" },
  es: { alerts: "Alertas", period: "Periodo", avg: "Prom/dia", updated: "Actualiz.", subtitle: "Tel Aviv / Gush Dan — 28 Feb al 23 Mar, 2026" },
  he: { alerts: "התרעות", period: "תקופה", avg: "ממוצע/יום", updated: "עדכון", subtitle: "תל אביב / גוש דן — 28 בפבר׳ עד 23 במרץ 2026" },
};

interface Props {
  alerts: Alert[];
  lang: Lang;
}

export default function Header({ alerts, lang }: Props) {
  const t = T[lang];
  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const totalAlerts = alerts.length;
  const totalDays = days.length;

  return (
    <header className="dashboard-header">
      <div className="header-top">
        <div className="header-title">
          <h1>🚀 MISSILE PROBABILITY</h1>
          <span className="header-subtitle">{t.subtitle}</span>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat">
          <span className="stat-value">{totalAlerts}</span>
          <span className="stat-label">{t.alerts}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalDays}d</span>
          <span className="stat-label">{t.period}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{(totalAlerts / (totalDays || 1)).toFixed(1)}</span>
          <span className="stat-label">{t.avg}</span>
        </div>
        <div className="stat">
          <span className="stat-value small">Mar 23, 01:00</span>
          <span className="stat-label">{t.updated}</span>
        </div>
      </div>
    </header>
  );
}
