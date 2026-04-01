import { useMemo } from "react";
import type { Alert } from "@war/shared";

interface Props { alerts: Alert[]; }

function getHoursAgo(timestamp: string): string {
  const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function intensityColor(count: number, max: number): string {
  if (max === 0) return "var(--risk-calm)";
  const ratio = count / max;
  if (ratio >= 0.6) return "var(--risk-danger)";
  if (ratio >= 0.3) return "var(--risk-medium)";
  return "var(--risk-calm)";
}

export default function SituationNow({ alerts }: Props) {
  const analysis = useMemo(() => {
    const now = Date.now();
    const h24 = 24 * 60 * 60 * 1000;
    const last24 = alerts.filter(a => now - new Date(a.timestamp).getTime() < h24);
    const prev24 = alerts.filter(a => {
      const age = now - new Date(a.timestamp).getTime();
      return age >= h24 && age < h24 * 2;
    });

    const missiles24 = last24.filter(a => a.threat === "missiles").length;
    const drones24 = last24.filter(a => a.threat === "hostile_aircraft").length;

    const regions: Record<string, number> = { gush_dan: 0, north: 0, south: 0, jerusalem: 0 };
    for (const a of last24) {
      for (const r of a.regions || []) {
        if (r === "gush_dan" || r === "center") regions.gush_dan++;
        else if (r === "north" || r === "haifa") regions.north++;
        else if (r === "south") regions.south++;
        else if (r === "jerusalem") regions.jerusalem++;
      }
    }

    const changePct = prev24.length > 0
      ? ((last24.length - prev24.length) / prev24.length) * 100
      : 0;

    const sorted = [...alerts].sort((a, b) => b.unix - a.unix);
    const lastAlert = sorted[0];

    const calmSeconds = lastAlert ? (now - new Date(lastAlert.timestamp).getTime()) / 1000 : 0;
    const calmHours = Math.floor(calmSeconds / 3600);
    const calmMinutes = Math.floor((calmSeconds % 3600) / 60);

    return {
      total24: last24.length,
      missiles24,
      drones24,
      regions,
      changePct,
      lastAlert,
      calmHours,
      calmMinutes,
    };
  }, [alerts]);

  const maxRegion = Math.max(...Object.values(analysis.regions), 1);

  const regionLabels: Record<string, string> = {
    gush_dan: "Dan (TLV)",
    north: "North",
    south: "South",
    jerusalem: "Jerusalem",
  };

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">SECTION 01</span>
        <span className="wd-section-title">SITUATION NOW</span>
        <span className="wd-section-line" />
      </div>

      <div className="wd-sit-hero">
        <div className="wd-sit-big-number">{analysis.total24}</div>
        <div className="wd-sit-big-label">ALERTS IN LAST 24H</div>
        <div className="wd-sit-trend" style={{ color: analysis.changePct > 0 ? "var(--risk-danger)" : analysis.changePct < -5 ? "var(--risk-calm)" : "var(--risk-medium)" }}>
          {analysis.changePct > 0 ? "↑" : analysis.changePct < -5 ? "↓" : "→"} {Math.abs(analysis.changePct).toFixed(0)}% vs yesterday
        </div>
      </div>

      {/* Threat breakdown */}
      <div className="wd-sit-threats">
        <div className="wd-sit-threat-card">
          <span className="wd-sit-threat-icon" style={{ color: "var(--risk-danger)" }}>●</span>
          <span className="wd-sit-threat-count">{analysis.missiles24}</span>
          <span className="wd-sit-threat-label">Missiles</span>
        </div>
        <div className="wd-sit-threat-card">
          <span className="wd-sit-threat-icon" style={{ color: "var(--accent)" }}>●</span>
          <span className="wd-sit-threat-count">{analysis.drones24}</span>
          <span className="wd-sit-threat-label">Hostile Aircraft</span>
        </div>
      </div>

      {/* Region grid */}
      <div className="wd-sit-regions">
        {Object.entries(analysis.regions).map(([key, count]) => (
          <div
            key={key}
            className="wd-sit-region-card"
            style={{ borderColor: intensityColor(count, maxRegion) }}
          >
            <span className="wd-sit-region-count" style={{ color: intensityColor(count, maxRegion) }}>{count}</span>
            <span className="wd-sit-region-name">{regionLabels[key]}</span>
          </div>
        ))}
      </div>

      {/* Last alert & calm streak */}
      <div className="wd-sit-meta">
        {analysis.lastAlert && (
          <div className="wd-sit-meta-row">
            <span className="wd-sit-meta-label">Last alert</span>
            <span className="wd-sit-meta-value">
              {getHoursAgo(analysis.lastAlert.timestamp)} — {analysis.lastAlert.regions?.[0] || "unknown"} region
            </span>
          </div>
        )}
        <div className="wd-sit-meta-row">
          <span className="wd-sit-meta-label">Calm streak</span>
          <span className="wd-sit-meta-value">{analysis.calmHours}h {analysis.calmMinutes}m</span>
        </div>
        <div className="wd-sit-calm-bar">
          <div className="wd-sit-calm-fill" style={{ width: `${Math.min((analysis.calmHours / 12) * 100, 100)}%` }} />
        </div>
      </div>
    </section>
  );
}
