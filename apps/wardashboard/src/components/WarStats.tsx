import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { buildDailySummaries } from "@war/shared";
import { type Lang, t } from "../i18n";

interface Props { alerts: Alert[]; lang: Lang; }

function fmtDate(d: string): string {
  const [, m, day] = d.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m)]} ${parseInt(day)}`;
}

function fmtDateRange(start: string, end: string): string {
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

export default function WarStats({ alerts, lang }: Props) {
  const stats = useMemo(() => {
    const daily = buildDailySummaries(alerts);
    if (daily.length === 0) return null;

    const first = new Date(daily[0].date + "T12:00:00Z");
    const last = new Date(daily[daily.length - 1].date + "T12:00:00Z");
    const daysOfWar = Math.round((last.getTime() - first.getTime()) / 86400000) + 1;
    const sortedByCount = [...daily].sort((a, b) => b.count - a.count);
    const mostAlerts = sortedByCount[0];
    const fewestAlerts = sortedByCount[sortedByCount.length - 1];
    const missiles = alerts.filter(a => a.threat === "missiles").length;
    const drones = alerts.filter(a => a.threat === "hostile_aircraft").length;

    const sorted = [...alerts].sort((a, b) => a.unix - b.unix);
    let longestGap = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].unix - sorted[i - 1].unix;
      if (gap > longestGap) longestGap = gap;
    }

    // Weekly data
    const weeks: { start: string; end: string; total: number; days: number; missiles: number; drones: number }[] = [];
    for (let w = 0; ; w++) {
      const wStartDate = new Date(first.getTime() + w * 7 * 86400000);
      const wEndDate = new Date(wStartDate.getTime() + 6 * 86400000);
      const wStartStr = wStartDate.toISOString().slice(0, 10);
      if (wStartStr > daily[daily.length - 1].date) break;
      const endCap = wEndDate.toISOString().slice(0, 10) > daily[daily.length - 1].date ? daily[daily.length - 1].date : wEndDate.toISOString().slice(0, 10);
      const wAlerts = alerts.filter(a => a.date >= wStartStr && a.date <= endCap);
      const wDays = daily.filter(d => d.date >= wStartStr && d.date <= endCap).length;
      weeks.push({
        start: wStartStr, end: endCap, total: wAlerts.length, days: wDays,
        missiles: wAlerts.filter(a => a.threat === "missiles").length,
        drones: wAlerts.filter(a => a.threat === "hostile_aircraft").length,
      });
    }

    const thisWeek = weeks[weeks.length - 1];
    const lastWeek = weeks.length >= 2 ? weeks[weeks.length - 2] : null;

    // Proportional comparison: compare same number of days
    // If this week has 4 days, compare against the first 4 days of last week
    let weekChange: number | null = null;
    let lastWeekProportional: number | null = null;
    if (lastWeek && thisWeek.days < 7 && thisWeek.days > 0) {
      // Get first N days of last week to match
      const lwDays = daily
        .filter(d => d.date >= lastWeek.start && d.date <= lastWeek.end)
        .slice(0, thisWeek.days);
      lastWeekProportional = lwDays.reduce((s, d) => s + d.count, 0);
      if (lastWeekProportional > 0) {
        weekChange = ((thisWeek.total - lastWeekProportional) / lastWeekProportional) * 100;
      }
    } else if (lastWeek && lastWeek.total > 0) {
      lastWeekProportional = lastWeek.total;
      weekChange = ((thisWeek.total - lastWeek.total) / lastWeek.total) * 100;
    }

    const latestDay = daily[daily.length - 1];

    return {
      daysOfWar, totalAlerts: alerts.length,
      avgPerDay: (alerts.length / daysOfWar).toFixed(1),
      mostAlerts, fewestAlerts,
      calmHours: (longestGap / 3600).toFixed(1),
      missiles, drones,
      missilesPct: ((missiles / alerts.length) * 100).toFixed(0),
      weeks, thisWeek, lastWeek, lastWeekProportional, weekChange, latestDay,
    };
  }, [alerts]);

  if (!stats) return null;

  const maxWeekly = Math.max(...stats.weeks.map(w => w.total), 1);
  const maxWkCompare = Math.max(stats.thisWeek.total, stats.lastWeekProportional || 0, 1);

  function handleShare() {
    const text = `⚔️ War Dashboard — Day ${stats!.daysOfWar}\n${stats!.totalAlerts} alerts | ${stats!.avgPerDay}/day avg\n${stats!.missiles} missiles, ${stats!.drones} drones\n\nhttps://wardashboard.live`;
    if (navigator.share) {
      navigator.share({ title: "War Dashboard", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  const compareLabel = stats.thisWeek.days < 7
    ? `${t("this_week", lang)} (${stats.thisWeek.days}d) vs ${t("last_week", lang)} (${stats.thisWeek.days}d)`
    : t("this_week_vs_last", lang);

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">{t("sec01", lang)}</span>
        <span className="wd-section-title">{t("war_overview", lang)}</span>
        <span className="wd-section-line" />
        <button className="wd-share-btn" onClick={handleShare} title={t("share", lang)}>↗ {t("share", lang)}</button>
      </div>

      <div className="wd-hero-row">
        <div className="wd-hero-card">
          <span className="wd-hero-value">{stats.daysOfWar}</span>
          <span className="wd-hero-label">{t("days_of_conflict", lang)}</span>
        </div>
        <div className="wd-hero-card wd-hero-primary">
          <span className="wd-hero-value">{stats.totalAlerts}</span>
          <span className="wd-hero-label">{t("total_alerts", lang)}</span>
        </div>
        <div className="wd-hero-card">
          <span className="wd-hero-value">{stats.avgPerDay}</span>
          <span className="wd-hero-label">{t("per_day_avg", lang)}</span>
        </div>
      </div>

      <div className="wd-threat-split">
        <div className="wd-threat-split-bar">
          <div className="wd-threat-bar-missiles" style={{ width: `${stats.missilesPct}%` }} />
          <div className="wd-threat-bar-drones" />
        </div>
        <div className="wd-threat-split-labels">
          <span><span className="wd-dot" style={{ background: "#c93d3d" }} /> {t("missiles", lang)} {stats.missiles} ({stats.missilesPct}%)</span>
          <span><span className="wd-dot" style={{ background: "var(--accent)" }} /> {t("drones", lang)} {stats.drones} ({100 - parseInt(stats.missilesPct)}%)</span>
        </div>
      </div>

      <div className="wd-latest-day">
        <span className="wd-latest-label">{t("latest_data", lang)} — {fmtDate(stats.latestDay.date)}</span>
        <span className="wd-latest-count">{stats.latestDay.count} {t("alerts", lang)}</span>
        <span className="wd-latest-breakdown">{stats.latestDay.missiles} {t("missiles", lang).toLowerCase()} · {stats.latestDay.hostile_aircraft} {t("drones", lang).toLowerCase()}</span>
      </div>

      <div className="wd-facts-row">
        <div className="wd-fact">
          <span className="wd-fact-icon">📈</span>
          <div>
            <span className="wd-fact-value">{fmtDate(stats.mostAlerts.date)} — {stats.mostAlerts.count} {t("alerts", lang)}</span>
            <span className="wd-fact-label">{t("most_alerts_day", lang)}</span>
          </div>
        </div>
        <div className="wd-fact">
          <span className="wd-fact-icon">📉</span>
          <div>
            <span className="wd-fact-value">{fmtDate(stats.fewestAlerts.date)} — {stats.fewestAlerts.count} {t("alerts", lang)}</span>
            <span className="wd-fact-label">{t("fewest_alerts_day", lang)}</span>
          </div>
        </div>
        <div className="wd-fact">
          <span className="wd-fact-icon">🕊️</span>
          <div>
            <span className="wd-fact-value">{stats.calmHours} {t("hours", lang)}</span>
            <span className="wd-fact-label">{t("longest_calm", lang)}</span>
          </div>
        </div>
      </div>

      <div className="wd-weekly-section">
        <h4 className="wd-weekly-title">{t("weekly_evolution", lang)}</h4>
        <div className="wd-weekly-bars">
          {stats.weeks.map((w, i) => {
            const missilePct = w.total > 0 ? (w.missiles / w.total) * 100 : 0;
            return (
              <div key={i} className="wd-wk-row">
                <span className="wd-wk-dates">{fmtDateRange(w.start, w.end)}{w.days < 7 ? ` (${w.days}d)` : ""}</span>
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
          <span><span className="wd-dot" style={{ background: "#c93d3d" }} /> {t("missiles", lang)}</span>
          <span><span className="wd-dot" style={{ background: "var(--accent)" }} /> {t("drones", lang)}</span>
        </div>
      </div>

      {stats.lastWeekProportional !== null && (
        <div className="wd-compare-section">
          <div className="wd-compare-header">
            <span>{compareLabel}</span>
            {stats.weekChange !== null && (
              <span className="wd-compare-badge" style={{ color: stats.weekChange > 0 ? "var(--risk-danger)" : stats.weekChange < -5 ? "var(--risk-calm)" : "var(--risk-medium)" }}>
                {stats.weekChange > 0 ? "↑" : stats.weekChange < -5 ? "↓" : "→"} {Math.abs(stats.weekChange).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="wd-compare-bars">
            <div className="wd-compare-row">
              <span className="wd-compare-label">{t("this_week", lang)}</span>
              <div className="wd-compare-bar-bg"><div className="wd-compare-bar this" style={{ width: `${(stats.thisWeek.total / maxWkCompare) * 100}%` }} /></div>
              <span className="wd-compare-val">{stats.thisWeek.total}</span>
            </div>
            <div className="wd-compare-row">
              <span className="wd-compare-label">{t("last_week", lang)}</span>
              <div className="wd-compare-bar-bg"><div className="wd-compare-bar last" style={{ width: `${(stats.lastWeekProportional / maxWkCompare) * 100}%` }} /></div>
              <span className="wd-compare-val">{stats.lastWeekProportional}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
