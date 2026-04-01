import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { buildDailySummaries } from "@war/shared";

interface Props { alerts: Alert[]; }

function fmtDate(d: string): string {
  const [, m, day] = d.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m)]} ${parseInt(day)}`;
}

function fmtDateRange(start: string, end: string): string {
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

export default function WarStats({ alerts }: Props) {
  const stats = useMemo(() => {
    const daily = buildDailySummaries(alerts);
    if (daily.length === 0) return null;

    const first = new Date(daily[0].date + "T12:00:00Z");
    const last = new Date(daily[daily.length - 1].date + "T12:00:00Z");
    const daysOfWar = Math.round((last.getTime() - first.getTime()) / 86400000) + 1;
    const deadliest = [...daily].sort((a, b) => b.count - a.count)[0];
    const missiles = alerts.filter(a => a.threat === "missiles").length;
    const drones = alerts.filter(a => a.threat === "hostile_aircraft").length;

    // Longest calm
    const sorted = [...alerts].sort((a, b) => a.unix - b.unix);
    let longestGap = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].unix - sorted[i - 1].unix;
      if (gap > longestGap) longestGap = gap;
    }

    // Weekly data with date ranges
    const weekMs = 7 * 86400000;
    const startMs = first.getTime();
    const numWeeks = Math.ceil((last.getTime() - startMs) / weekMs) + 1;
    const weeks: { start: string; end: string; total: number; missiles: number; drones: number }[] = [];
    for (let w = 0; w < numWeeks; w++) {
      const wStart = startMs + w * weekMs;
      const wEnd = Math.min(wStart + weekMs - 86400000, last.getTime());
      const wAlerts = alerts.filter(a => {
        const t = new Date(a.timestamp).getTime();
        return t >= wStart && t < wStart + weekMs;
      });
      weeks.push({
        start: new Date(wStart).toISOString().slice(0, 10),
        end: new Date(wEnd).toISOString().slice(0, 10),
        total: wAlerts.length,
        missiles: wAlerts.filter(a => a.threat === "missiles").length,
        drones: wAlerts.filter(a => a.threat === "hostile_aircraft").length,
      });
    }

    const thisWeek = weeks[weeks.length - 1];
    const lastWeek = weeks.length >= 2 ? weeks[weeks.length - 2] : null;
    const weekChange = lastWeek && lastWeek.total > 0
      ? ((thisWeek.total - lastWeek.total) / lastWeek.total * 100)
      : null;

    return {
      daysOfWar,
      totalAlerts: alerts.length,
      avgPerDay: (alerts.length / daysOfWar).toFixed(1),
      deadliestDay: deadliest,
      calmHours: (longestGap / 3600).toFixed(1),
      missiles,
      drones,
      missilesPct: ((missiles / alerts.length) * 100).toFixed(0),
      weeks,
      thisWeek,
      lastWeek,
      weekChange,
    };
  }, [alerts]);

  if (!stats) return null;

  const maxWeekly = Math.max(...stats.weeks.map(w => w.total), 1);
  const maxWkCompare = Math.max(stats.thisWeek.total, stats.lastWeek?.total || 0, 1);

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">SECTION 01</span>
        <span className="wd-section-title">WAR OVERVIEW</span>
        <span className="wd-section-line" />
      </div>

      {/* Hero row: 3 big numbers */}
      <div className="wd-hero-row">
        <div className="wd-hero-card">
          <span className="wd-hero-value">{stats.daysOfWar}</span>
          <span className="wd-hero-label">Days of conflict</span>
        </div>
        <div className="wd-hero-card wd-hero-primary">
          <span className="wd-hero-value">{stats.totalAlerts}</span>
          <span className="wd-hero-label">Total alerts</span>
        </div>
        <div className="wd-hero-card">
          <span className="wd-hero-value">{stats.avgPerDay}</span>
          <span className="wd-hero-label">Per day avg</span>
        </div>
      </div>

      {/* Threat breakdown bar */}
      <div className="wd-threat-split">
        <div className="wd-threat-split-bar">
          <div className="wd-threat-bar-missiles" style={{ width: `${stats.missilesPct}%` }} />
          <div className="wd-threat-bar-drones" />
        </div>
        <div className="wd-threat-split-labels">
          <span><span className="wd-dot" style={{ background: "#c93d3d" }} /> Missiles {stats.missiles} ({stats.missilesPct}%)</span>
          <span><span className="wd-dot" style={{ background: "var(--accent)" }} /> Drones {stats.drones} ({100 - parseInt(stats.missilesPct)}%)</span>
        </div>
      </div>

      {/* Key facts row */}
      <div className="wd-facts-row">
        <div className="wd-fact">
          <span className="wd-fact-icon">💀</span>
          <div>
            <span className="wd-fact-value">{fmtDate(stats.deadliestDay.date)} — {stats.deadliestDay.count} alerts</span>
            <span className="wd-fact-label">Deadliest day</span>
          </div>
        </div>
        <div className="wd-fact">
          <span className="wd-fact-icon">🕊️</span>
          <div>
            <span className="wd-fact-value">{stats.calmHours} hours</span>
            <span className="wd-fact-label">Longest calm</span>
          </div>
        </div>
      </div>

      {/* Weekly trend with date ranges */}
      <div className="wd-weekly-section">
        <h4 className="wd-weekly-title">WEEKLY EVOLUTION</h4>
        <div className="wd-weekly-bars">
          {stats.weeks.map((w, i) => {
            const missilePct = w.total > 0 ? (w.missiles / w.total) * 100 : 0;
            return (
              <div key={i} className="wd-wk-row">
                <span className="wd-wk-dates">{fmtDateRange(w.start, w.end)}</span>
                <div className="wd-wk-bar-bg">
                  <div className="wd-wk-bar" style={{ width: `${(w.total / maxWeekly) * 100}%` }}>
                    <div className="wd-wk-bar-m" style={{ width: `${missilePct}%` }} />
                    <div className="wd-wk-bar-d" style={{ width: `${100 - missilePct}%` }} />
                  </div>
                </div>
                <span className="wd-wk-total">{w.total}</span>
              </div>
            );
          })}
        </div>
        <div className="wd-wk-legend">
          <span><span className="wd-dot" style={{ background: "#c93d3d" }} /> Missiles</span>
          <span><span className="wd-dot" style={{ background: "var(--accent)" }} /> Drones</span>
        </div>
      </div>

      {/* This week vs last */}
      {stats.lastWeek && (
        <div className="wd-compare-section">
          <div className="wd-compare-header">
            <span>This week vs last week</span>
            {stats.weekChange !== null && (
              <span className="wd-compare-badge" style={{
                color: stats.weekChange > 0 ? "var(--risk-danger)" : stats.weekChange < -5 ? "var(--risk-calm)" : "var(--risk-medium)"
              }}>
                {stats.weekChange > 0 ? "↑" : stats.weekChange < -5 ? "↓" : "→"} {Math.abs(stats.weekChange).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="wd-compare-bars">
            <div className="wd-compare-row">
              <span className="wd-compare-label">This week</span>
              <div className="wd-compare-bar-bg">
                <div className="wd-compare-bar this" style={{ width: `${(stats.thisWeek.total / maxWkCompare) * 100}%` }} />
              </div>
              <span className="wd-compare-val">{stats.thisWeek.total}</span>
            </div>
            <div className="wd-compare-row">
              <span className="wd-compare-label">Last week</span>
              <div className="wd-compare-bar-bg">
                <div className="wd-compare-bar last" style={{ width: `${(stats.lastWeek.total / maxWkCompare) * 100}%` }} />
              </div>
              <span className="wd-compare-val">{stats.lastWeek.total}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
