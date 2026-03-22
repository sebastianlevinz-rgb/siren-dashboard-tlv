import { useMemo } from "react";
import type { Alert } from "../types";
import { buildDailySummaries } from "../utils/data";

interface Props {
  alerts: Alert[];
}

export default function Header({ alerts }: Props) {
  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const totalAlerts = alerts.length;
  const totalDays = days.length;
  const missiles = alerts.filter((a) => a.threat === "missiles").length;
  const aircraft = alerts.filter((a) => a.threat === "hostile_aircraft").length;

  const handleShare = async () => {
    const shareText = [
      "🚨 Siren Dashboard — Tel Aviv / Gush Dan",
      "",
      `${totalAlerts} alertas en ${totalDays} dias`,
      `Misiles: ${missiles} | Drones: ${aircraft}`,
      `Promedio: ${(totalAlerts / (totalDays || 1)).toFixed(1)} alertas/dia`,
      "",
      "Heatmap dia x hora, tendencias y recomendaciones",
      "Datos: Tzofar Telegram @tzevaadom_en",
      "",
      "https://www.missileprobability.com",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Siren Dashboard — Tel Aviv",
          text: shareText,
          url: "https://www.missileprobability.com",
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Copiado al portapapeles — pegalo en WhatsApp");
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-top">
        <div className="header-title">
          <h1>
            <span className="title-icon">&#x1F6A8;</span>
            SIREN DASHBOARD
          </h1>
          <span className="header-subtitle">
            Tel Aviv / Gush Dan — Alertas de misiles y drones
          </span>
        </div>
        <button className="btn-share" onClick={handleShare}>
          Compartir
        </button>
      </div>

      <div className="header-stats">
        <div className="stat">
          <span className="stat-value">{totalAlerts}</span>
          <span className="stat-label">Alertas TLV</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalDays}d</span>
          <span className="stat-label">Periodo</span>
        </div>
        <div className="stat">
          <span className="stat-value missiles">{missiles}</span>
          <span className="stat-label">Misiles</span>
        </div>
        <div className="stat">
          <span className="stat-value aircraft">{aircraft}</span>
          <span className="stat-label">Drones</span>
        </div>
        <div className="stat">
          <span className="stat-value">{(totalAlerts / (totalDays || 1)).toFixed(1)}</span>
          <span className="stat-label">Prom/dia</span>
        </div>
        <div className="stat">
          <span className="stat-value small">23/03 01:00</span>
          <span className="stat-label">Actualiz.</span>
        </div>
      </div>
    </header>
  );
}
