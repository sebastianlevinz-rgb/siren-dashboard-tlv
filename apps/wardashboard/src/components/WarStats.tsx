import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { buildDailySummaries } from "@war/shared";

interface Props { alerts: Alert[]; }

function formatDate(d: string): string {
  const [, m, day] = d.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m)]} ${parseInt(day)}`;
}

export default function WarStats({ alerts }: Props) {
  const stats = useMemo(() => {
    const daily = buildDailySummaries(alerts);
    if (daily.length === 0) return null;

    const first = new Date(daily[0].date + "T12:00:00Z");
    const last = new Date(daily[daily.length - 1].date + "T12:00:00Z");
    const daysOfWar = Math.round((last.getTime() - first.getTime()) / 86400000) + 1;

    const deadliest = [...daily].sort((a, b) => b.count - a.count)[0];

    // Longest calm
    const sorted = [...alerts].sort((a, b) => a.unix - b.unix);
    let longestGap = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].unix - sorted[i - 1].unix;
      if (gap > longestGap) longestGap = gap;
    }
    const calmHours = (longestGap / 3600).toFixed(1);

    // Most targeted region
    const regionCounts: Record<string, number> = {};
    for (const a of alerts) {
      for (const r of a.regions || []) {
        if (r === "center") regionCounts["gush_dan"] = (regionCounts["gush_dan"] || 0) + 1;
        else if (r === "haifa") regionCounts["north"] = (regionCounts["north"] || 0) + 1;
        else regionCounts[r] = (regionCounts[r] || 0) + 1;
      }
    }
    const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];
    const topRegionPct = topRegion ? ((topRegion[1] / alerts.length) * 100).toFixed(0) : "0";

    const regionLabels: Record<string, string> = {
      gush_dan: "Gush Dan", north: "North", south: "South", jerusalem: "Jerusalem",
    };

    // Weekly totals for sparkline (last 5 weeks)
    const weeklyTotals: number[] = [];
    const startMs = first.getTime();
    const weekMs = 7 * 86400000;
    for (let w = 0; w < 5; w++) {
      const wStart = startMs + w * weekMs;
      const wEnd = wStart + weekMs;
      const wAlerts = alerts.filter(a => {
        const t = new Date(a.timestamp).getTime();
        return t >= wStart && t < wEnd;
      });
      weeklyTotals.push(wAlerts.length);
    }

    const thisWeek = weeklyTotals[weeklyTotals.length - 1] || 0;
    const lastWeek = weeklyTotals[weeklyTotals.length - 2] || 0;

    return {
      daysOfWar,
      totalAlerts: alerts.length,
      avgPerDay: (alerts.length / daysOfWar).toFixed(1),
      deadliestDay: deadliest,
      calmHours,
      topRegion: regionLabels[topRegion?.[0] || ""] || topRegion?.[0] || "—",
      topRegionPct,
      weeklyTotals,
      thisWeek,
      lastWeek,
    };
  }, [alerts]);

  if (!stats) return null;

  const maxWeekly = Math.max(...stats.weeklyTotals, 1);
  const maxWkCompare = Math.max(stats.thisWeek, stats.lastWeek, 1);

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">SECTION 04</span>
        <span className="wd-section-title">WAR STATS</span>
        <span className="wd-section-line" />
      </div>

      <div className="wd-stats-grid">
        <div className="wd-stat-card">
          <span className="wd-stat-value">{stats.daysOfWar}</span>
          <span className="wd-stat-label">Days of war</span>
        </div>
        <div className="wd-stat-card">
          <span className="wd-stat-value">{stats.totalAlerts}</span>
          <span className="wd-stat-label">Total alerts</span>
        </div>
        <div className="wd-stat-card">
          <span className="wd-stat-value">{stats.avgPerDay}</span>
          <span className="wd-stat-label">Alerts/day avg</span>
        </div>
        <div className="wd-stat-card">
          <span className="wd-stat-value">{formatDate(stats.deadliestDay.date)}</span>
          <span className="wd-stat-label">Deadliest day ({stats.deadliestDay.count})</span>
        </div>
        <div className="wd-stat-card">
          <span className="wd-stat-value">{stats.calmHours}h</span>
          <span className="wd-stat-label">Longest calm</span>
        </div>
        <div className="wd-stat-card">
          <span className="wd-stat-value">{stats.topRegion}</span>
          <span className="wd-stat-label">Most targeted ({stats.topRegionPct}%)</span>
        </div>
      </div>

      {/* Weekly sparkline */}
      <div className="wd-stats-spark-section">
        <h4 className="wd-stats-spark-title">Weekly trend</h4>
        <div className="wd-stats-sparkline">
          {stats.weeklyTotals.map((v, i) => (
            <div key={i} className="wd-spark-col">
              <div className="wd-spark-bar-wrap">
                <div className="wd-spark-bar" style={{ height: `${(v / maxWeekly) * 100}%` }} />
              </div>
              <span className="wd-spark-label">W{i + 1}</span>
              <span className="wd-spark-val">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* This week vs last week */}
      <div className="wd-stats-compare">
        <h4 className="wd-stats-compare-title">This week vs last week</h4>
        <div className="wd-compare-row">
          <span className="wd-compare-label">This week</span>
          <div className="wd-compare-bar-bg">
            <div className="wd-compare-bar this" style={{ width: `${(stats.thisWeek / maxWkCompare) * 100}%` }} />
          </div>
          <span className="wd-compare-val">{stats.thisWeek}</span>
        </div>
        <div className="wd-compare-row">
          <span className="wd-compare-label">Last week</span>
          <div className="wd-compare-bar-bg">
            <div className="wd-compare-bar last" style={{ width: `${(stats.lastWeek / maxWkCompare) * 100}%` }} />
          </div>
          <span className="wd-compare-val">{stats.lastWeek}</span>
        </div>
      </div>
    </section>
  );
}
