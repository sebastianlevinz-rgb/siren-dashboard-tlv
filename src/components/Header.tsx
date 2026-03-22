import { useMemo } from "react";
import type { Alert } from "../types";
import { buildDailySummaries } from "../utils/data";

interface Props {
  alerts: Alert[];
  lastUpdate: string;
  onRefresh: () => void;
  loading: boolean;
}

export default function Header({
  alerts,
  lastUpdate,
  onRefresh,
  loading,
}: Props) {
  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const totalAlerts = alerts.length;
  const totalDays = days.length;
  const missiles = alerts.filter((a) => a.threat === "missiles").length;
  const aircraft = alerts.filter((a) => a.threat === "hostile_aircraft").length;

  const dateRange =
    days.length > 0
      ? `${days[0].date.split("-").reverse().join("/")} - ${days[days.length - 1].date.split("-").reverse().join("/")}`
      : "-";

  const handleShare = async () => {
    const text = `Siren Dashboard TLV: ${totalAlerts} alertas en ${totalDays} dias (${dateRange})`;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Siren Dashboard - Tel Aviv", text, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Link copiado al portapapeles");
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
        <div className="header-controls">
          <button className="btn-share" onClick={handleShare}>
            Compartir
          </button>
          <button
            className={`btn-refresh ${loading ? "loading" : ""}`}
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? "..." : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat">
          <span className="stat-value">{totalAlerts}</span>
          <span className="stat-label">Alertas</span>
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
          <span className="stat-value small">{lastUpdate}</span>
          <span className="stat-label">Actualiz.</span>
        </div>
      </div>
    </header>
  );
}
