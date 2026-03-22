import { useMemo } from "react";
import type { Alert } from "../types";
import { type Lang, t } from "../i18n";
import { buildDailySummaries } from "../utils/data";

interface Props { alerts: Alert[]; lang: Lang; }

export default function Header({ alerts, lang }: Props) {
  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const total = alerts.length;
  const totalDays = days.length;

  return (
    <header className="dashboard-header">
      <div className="header-top">
        <h1>🚀 MISSILE PROBABILITY</h1>
        <span className="header-subtitle">{t("subtitle", lang)}</span>
      </div>
      <div className="header-stats">
        <div className="stat">
          <span className="stat-value">{total}</span>
          <span className="stat-label">{t("alerts", lang)}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalDays}d</span>
          <span className="stat-label">{t("period", lang)}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{(total / (totalDays || 1)).toFixed(1)}</span>
          <span className="stat-label">{t("avg_day", lang)}</span>
        </div>
        <div className="stat">
          <span className="stat-value small">Mar 23, 01:00</span>
          <span className="stat-label">{t("updated", lang)}</span>
        </div>
      </div>
    </header>
  );
}
