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

  const handleShare = async () => {
    const shareText = [
      "Missile Probability — Tel Aviv / Gush Dan",
      "",
      `${totalAlerts} alerts in ${totalDays} days`,
      `Avg: ${(totalAlerts / (totalDays || 1)).toFixed(1)} alerts/day`,
      "",
      "Day x Hour heatmap, trends & recommendations",
      "Data: Tzofar Telegram @tzevaadom_en",
      "",
      "https://www.missileprobability.com",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Missile Probability — Tel Aviv",
          text: shareText,
          url: "https://www.missileprobability.com",
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Copied to clipboard");
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-top">
        <div className="header-title">
          <h1>MISSILE PROBABILITY</h1>
          <span className="header-subtitle">
            Tel Aviv / Gush Dan — Feb 28 to Mar 23, 2026
          </span>
        </div>
        <button className="btn-share" onClick={handleShare}>
          Share
        </button>
      </div>

      <div className="header-stats">
        <div className="stat">
          <span className="stat-value">{totalAlerts}</span>
          <span className="stat-label">Alerts</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalDays}d</span>
          <span className="stat-label">Period</span>
        </div>
        <div className="stat">
          <span className="stat-value">{(totalAlerts / (totalDays || 1)).toFixed(1)}</span>
          <span className="stat-label">Avg/day</span>
        </div>
        <div className="stat">
          <span className="stat-value small">Mar 23, 01:00</span>
          <span className="stat-label">Updated</span>
        </div>
      </div>
    </header>
  );
}
