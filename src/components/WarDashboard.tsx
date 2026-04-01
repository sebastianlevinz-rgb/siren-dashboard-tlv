import { useMemo, useState, useEffect } from "react";
import type { Alert } from "../types";
import { type Lang } from "../i18n";
import { buildDailySummaries, formatDate } from "../utils/data";

interface GeoEvent {
  date: string;
  category: string;
  icon: string;
  title: Record<string, string>;
  detail: Record<string, string>;
}

interface Props { alerts: Alert[]; lang: Lang; }

const TEXT = {
  title: { en: "War Progress", es: "Progreso de la Guerra", he: "התקדמות המלחמה" },
  sub: {
    en: "Week-by-week evolution of the conflict",
    es: "Evolucion semana a semana del conflicto",
    he: "התפתחות העימות שבוע אחר שבוע",
  },
  week: { en: "Week", es: "Semana", he: "שבוע" },
  alerts: { en: "alerts", es: "alertas", he: "התרעות" },
  missiles: { en: "Missiles", es: "Misiles", he: "טילים" },
  drones: { en: "Drones", es: "Drones", he: "מל\"טים" },
  avg_day: { en: "avg/day", es: "prom/dia", he: "ממוצע/יום" },
  vs_prev: { en: "vs prev week", es: "vs semana ant.", he: "לעומת שבוע קודם" },
  hottest_region: { en: "Hottest region", es: "Region mas activa", he: "האזור הפעיל ביותר" },
  heaviest_day: { en: "Peak day", es: "Dia pico", he: "יום שיא" },
  key_events: { en: "Key Events", es: "Eventos Clave", he: "אירועים מרכזיים" },
  impact: { en: "Impact", es: "Impacto", he: "השפעה" },
  before: { en: "48h before", es: "48h antes", he: "48 שעות לפני" },
  after: { en: "48h after", es: "48h despues", he: "48 שעות אחרי" },
  change: { en: "Change", es: "Cambio", he: "שינוי" },
  region_north: { en: "North", es: "Norte", he: "צפון" },
  region_gush_dan: { en: "Gush Dan", es: "Gush Dan", he: "גוש דן" },
  region_jerusalem: { en: "Jerusalem", es: "Jerusalem", he: "ירושלים" },
  region_south: { en: "South", es: "Sur", he: "דרום" },
  escalation: { en: "Escalation", es: "Escalada", he: "הסלמה" },
  retaliation: { en: "Retaliation", es: "Represalia", he: "תגמול" },
  diplomacy: { en: "Diplomacy", es: "Diplomacia", he: "דיפלומטיה" },
  weekly_view: { en: "Weekly", es: "Semanal", he: "שבועי" },
  events_view: { en: "Events", es: "Eventos", he: "אירועים" },
};

const CATEGORY_COLORS: Record<string, string> = {
  escalation: "#c93d3d",
  retaliation: "#d4822a",
  diplomacy: "#6ea8d7",
};

function getWeekNumber(dateStr: string, startDate: string): number {
  const d = new Date(dateStr + "T12:00:00Z");
  const s = new Date(startDate + "T12:00:00Z");
  return Math.floor((d.getTime() - s.getTime()) / (7 * 86400000)) + 1;
}

function getRegionName(region: string, lang: Lang): string {
  const key = `region_${region}` as keyof typeof TEXT;
  const entry = TEXT[key] as Record<string, string> | undefined;
  return entry?.[lang] || region;
}

interface WeekData {
  weekNum: number;
  startDate: string;
  endDate: string;
  total: number;
  missiles: number;
  drones: number;
  avgPerDay: number;
  changeVsPrev: number | null;
  hottestRegion: string;
  heaviestDay: { date: string; count: number };
  days: { date: string; count: number; missiles: number; drones: number }[];
}

function buildWeeks(alerts: Alert[]): WeekData[] {
  if (alerts.length === 0) return [];
  const daily = buildDailySummaries(alerts);
  if (daily.length === 0) return [];

  const startDate = daily[0].date;
  const weekMap = new Map<number, typeof daily>();

  for (const d of daily) {
    const wn = getWeekNumber(d.date, startDate);
    const existing = weekMap.get(wn) || [];
    existing.push(d);
    weekMap.set(wn, existing);
  }

  const weeks: WeekData[] = [];
  const sorted = [...weekMap.entries()].sort((a, b) => a[0] - b[0]);

  for (const [weekNum, wDays] of sorted) {
    const total = wDays.reduce((s, d) => s + d.count, 0);
    const missiles = wDays.reduce((s, d) => s + d.missiles, 0);
    const drones = wDays.reduce((s, d) => s + d.hostile_aircraft, 0);
    const avgPerDay = total / wDays.length;

    // Hottest region
    const regionCounts: Record<string, number> = {};
    for (const d of wDays) {
      for (const a of d.alerts) {
        for (const r of a.regions || []) {
          if (r !== "haifa" && r !== "center") {
            regionCounts[r] = (regionCounts[r] || 0) + 1;
          }
        }
      }
    }
    const hottestRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "north";

    // Heaviest day
    const heaviest = [...wDays].sort((a, b) => b.count - a.count)[0];

    const prevWeek = weeks[weeks.length - 1];
    const changeVsPrev = prevWeek ? ((total - prevWeek.total) / (prevWeek.total || 1)) * 100 : null;

    weeks.push({
      weekNum,
      startDate: wDays[0].date,
      endDate: wDays[wDays.length - 1].date,
      total,
      missiles,
      drones,
      avgPerDay,
      changeVsPrev,
      hottestRegion,
      heaviestDay: { date: heaviest.date, count: heaviest.count },
      days: wDays.map(d => ({ date: d.date, count: d.count, missiles: d.missiles, drones: d.hostile_aircraft })),
    });
  }

  return weeks;
}

function WeeklyView({ alerts, lang }: Props) {
  const weeks = useMemo(() => buildWeeks(alerts), [alerts]);
  const maxWeekTotal = Math.max(...weeks.map(w => w.total), 1);

  return (
    <div className="war-weeks">
      {weeks.map((w) => {
        const missilePct = (w.missiles / (w.total || 1)) * 100;
        const dronePct = (w.drones / (w.total || 1)) * 100;
        const barWidth = (w.total / maxWeekTotal) * 100;
        const maxDayCount = Math.max(...w.days.map(d => d.count), 1);

        return (
          <div key={w.weekNum} className="war-week-card">
            <div className="war-week-header">
              <span className="war-week-num">{TEXT.week[lang]} {w.weekNum}</span>
              <span className="war-week-dates">{formatDate(w.startDate)} — {formatDate(w.endDate)}</span>
              <span className="war-week-total">{w.total} {TEXT.alerts[lang]}</span>
            </div>

            {/* Stacked bar */}
            <div className="war-stacked-bar-bg">
              <div className="war-stacked-bar" style={{ width: `${barWidth}%` }}>
                <div className="war-bar-missiles" style={{ width: `${missilePct}%` }} />
                <div className="war-bar-drones" style={{ width: `${dronePct}%` }} />
              </div>
            </div>

            {/* Mini sparkline for daily counts */}
            <div className="war-week-sparkline">
              {w.days.map((d) => (
                <div key={d.date} className="war-spark-col">
                  <div className="war-spark-bar-wrap">
                    <div
                      className="war-spark-bar"
                      style={{ height: `${(d.count / maxDayCount) * 100}%` }}
                      title={`${formatDate(d.date)}: ${d.count}`}
                    />
                  </div>
                  <span className="war-spark-label">{formatDate(d.date).slice(0, 2)}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="war-week-stats">
              <div className="war-stat">
                <span className="war-stat-val">{w.avgPerDay.toFixed(1)}</span>
                <span className="war-stat-label">{TEXT.avg_day[lang]}</span>
              </div>
              <div className="war-stat">
                <span className="war-stat-val" style={{ color: w.changeVsPrev !== null ? (w.changeVsPrev > 0 ? "#c93d3d" : w.changeVsPrev < -5 ? "#3d8b37" : "#b8a02e") : "var(--text-secondary)" }}>
                  {w.changeVsPrev !== null ? `${w.changeVsPrev > 0 ? "+" : ""}${w.changeVsPrev.toFixed(0)}%` : "—"}
                </span>
                <span className="war-stat-label">{TEXT.vs_prev[lang]}</span>
              </div>
              <div className="war-stat">
                <span className="war-stat-val">{getRegionName(w.hottestRegion, lang)}</span>
                <span className="war-stat-label">{TEXT.hottest_region[lang]}</span>
              </div>
              <div className="war-stat">
                <span className="war-stat-val">{formatDate(w.heaviestDay.date)} ({w.heaviestDay.count})</span>
                <span className="war-stat-label">{TEXT.heaviest_day[lang]}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="war-legend">
        <span className="war-legend-item"><span className="war-legend-dot" style={{ background: "#c93d3d" }} />{TEXT.missiles[lang]}</span>
        <span className="war-legend-item"><span className="war-legend-dot" style={{ background: "#6ea8d7" }} />{TEXT.drones[lang]}</span>
      </div>
    </div>
  );
}

function EventsView({ alerts, lang }: { alerts: Alert[]; lang: Lang }) {
  const [events, setEvents] = useState<GeoEvent[]>([]);
  useEffect(() => {
    fetch("/data/events.json").then(r => r.json()).then(setEvents).catch(() => {});
  }, []);

  const daily = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of daily) map.set(d.date, d.count);
    return map;
  }, [daily]);

  function get48hAvg(dateStr: string, direction: "before" | "after"): number {
    const d = new Date(dateStr + "T12:00:00Z");
    let sum = 0, count = 0;
    for (let i = 1; i <= 2; i++) {
      const offset = direction === "before" ? -i : i;
      const target = new Date(d.getTime() + offset * 86400000).toISOString().slice(0, 10);
      const val = byDate.get(target);
      if (val !== undefined) { sum += val; count++; }
    }
    return count > 0 ? sum / count : 0;
  }

  return (
    <div className="war-events">
      {events.map((ev) => {
        const before = get48hAvg(ev.date, "before");
        const after = get48hAvg(ev.date, "after");
        const change = before > 0 ? ((after - before) / before) * 100 : 0;
        const dayCount = byDate.get(ev.date) || 0;

        return (
          <div key={ev.date} className="war-event-card">
            <div className="war-event-header">
              <span className="war-event-icon">{ev.icon}</span>
              <div className="war-event-title-wrap">
                <span className="war-event-title">{ev.title[lang] || ev.title.en}</span>
                <span className="war-event-date">{formatDate(ev.date)} — {dayCount} {TEXT.alerts[lang]}</span>
              </div>
              <span className="war-event-cat" style={{ background: CATEGORY_COLORS[ev.category] || "#555" }}>
                {(TEXT as Record<string, Record<string, string>>)[ev.category]?.[lang] || ev.category}
              </span>
            </div>

            <p className="war-event-detail">{ev.detail[lang] || ev.detail.en}</p>

            {/* Before/After impact card */}
            <div className="war-impact">
              <div className="war-impact-box">
                <span className="war-impact-val">{before.toFixed(1)}</span>
                <span className="war-impact-label">{TEXT.before[lang]}</span>
              </div>
              <div className="war-impact-arrow">
                <span style={{ color: change > 0 ? "#c93d3d" : change < -5 ? "#3d8b37" : "#b8a02e", fontSize: "18px" }}>
                  {change > 5 ? "→" : change < -5 ? "→" : "→"}
                </span>
                <span className="war-impact-change" style={{ color: change > 0 ? "#c93d3d" : change < -5 ? "#3d8b37" : "#b8a02e" }}>
                  {change > 0 ? "+" : ""}{change.toFixed(0)}%
                </span>
              </div>
              <div className="war-impact-box">
                <span className="war-impact-val">{after.toFixed(1)}</span>
                <span className="war-impact-label">{TEXT.after[lang]}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WarDashboard({ alerts, lang }: Props) {
  const [view, setView] = useState<"weekly" | "events">("weekly");

  return (
    <div className="panel war-panel">
      <div className="war-header">
        <div>
          <h2>{TEXT.title[lang]}</h2>
          <p className="panel-subtitle">{TEXT.sub[lang]}</p>
        </div>
        <div className="war-view-toggle">
          <button className={`view-btn ${view === "weekly" ? "active" : ""}`} onClick={() => setView("weekly")}>{TEXT.weekly_view[lang]}</button>
          <button className={`view-btn ${view === "events" ? "active" : ""}`} onClick={() => setView("events")}>{TEXT.events_view[lang]}</button>
        </div>
      </div>

      {view === "weekly" ? <WeeklyView alerts={alerts} lang={lang} /> : <EventsView alerts={alerts} lang={lang} />}
    </div>
  );
}
