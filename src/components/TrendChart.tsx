import { useMemo, useState, useEffect } from "react";
import type { Alert } from "../types";
import { type Lang, t } from "../i18n";
import { buildDailySummaries, movingAverage, formatDate } from "../utils/data";

interface GeoEvent {
  date: string;
  category: string;
  icon: string;
  title: Record<string, string>;
  detail: Record<string, string>;
}

interface Props { alerts: Alert[]; lang: Lang; }

const RANGE_LABELS: Record<Lang, Record<string, string>> = {
  en: { all: "All", last7: "Last 7 days" },
  es: { all: "Todo", last7: "Ultimos 7 dias" },
  he: { all: "הכל", last7: "7 ימים אחרונים" },
};

const CATEGORY_COLORS: Record<string, string> = {
  escalation: "#c93d3d",
  retaliation: "#d4822a",
  diplomacy: "#6ea8d7",
};

export default function TrendChart({ alerts, lang }: Props) {
  const [showAll, setShowAll] = useState(true);
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const allDays = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const days = showAll ? allDays : allDays.slice(-7);

  useEffect(() => {
    fetch("/data/events.json").then(r => r.json()).then(setEvents).catch(() => {});
  }, []);

  const counts = days.map((d) => d.count);
  const ma3 = movingAverage(counts, 3);
  const maxVal = Math.max(...counts, 1);

  const W = 600, H = 250, PAD = 35, PADBOT = 55;
  const chartW = W - PAD * 2, chartH = H - PAD - PADBOT;
  const xScale = (i: number) => PAD + (i / Math.max(days.length - 1, 1)) * chartW;
  const yScale = (v: number) => PAD + chartH - (v / maxVal) * chartH;
  const makePath = (data: number[]) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`).join(" ");

  // Map events to chart positions
  const dateToIndex = new Map(days.map((d, i) => [d.date, i]));
  const eventMarkers = events
    .filter(ev => dateToIndex.has(ev.date))
    .map(ev => {
      const idx = dateToIndex.get(ev.date)!;
      return { ...ev, x: xScale(idx), y: yScale(counts[idx]), count: counts[idx] };
    });

  const rl = RANGE_LABELS[lang];

  return (
    <div className="panel trend-panel">
      <div className="trend-header">
        <div>
          <h2>{t("trend_title", lang)}</h2>
          <p className="panel-subtitle">{t("trend_sub", lang)}</p>
        </div>
        <div className="trend-range-toggle">
          <button className={`range-btn ${showAll ? "active" : ""}`} onClick={() => setShowAll(true)}>{rl.all}</button>
          <button className={`range-btn ${!showAll ? "active" : ""}`} onClick={() => setShowAll(false)}>{rl.last7}</button>
        </div>
      </div>

      <div className="trend-chart-container">
        <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <g key={r}>
              <line x1={PAD} x2={W - PAD} y1={yScale(r * maxVal)} y2={yScale(r * maxVal)} stroke="#333" strokeDasharray="4,4" />
              <text x={PAD - 5} y={yScale(r * maxVal) + 4} fill="#888" fontSize="10" textAnchor="end">{Math.round(r * maxVal)}</text>
            </g>
          ))}

          {/* Date labels */}
          {days.map((d, i) => {
            if (days.length <= 7 || i % Math.max(1, Math.floor(days.length / 10)) === 0) {
              return <text key={d.date} x={xScale(i)} y={H - PADBOT + 15} fill="#888" fontSize="9" textAnchor="middle">{formatDate(d.date)}</text>;
            }
            return null;
          })}

          {/* Event vertical markers */}
          {eventMarkers.map((ev) => (
            <g key={ev.date}>
              <line
                x1={ev.x} x2={ev.x}
                y1={PAD} y2={PAD + chartH}
                stroke={CATEGORY_COLORS[ev.category] || "#555"}
                strokeWidth={hoveredEvent === ev.date ? 2 : 1}
                strokeDasharray="3,3"
                opacity={hoveredEvent === ev.date ? 0.9 : 0.5}
              />
            </g>
          ))}

          {/* Data lines */}
          <path d={makePath(counts)} fill="none" stroke="#6ea8d7" strokeWidth={2} />
          <path d={makePath(ma3)} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="6,3" />
          {counts.map((v, i) => (
            <circle key={i} cx={xScale(i)} cy={yScale(v)} r={3} fill="#6ea8d7">
              <title>{formatDate(days[i].date)}: {v}</title>
            </circle>
          ))}

          {/* Event icon markers on the line */}
          {eventMarkers.map((ev) => (
            <g
              key={`icon-${ev.date}`}
              onMouseEnter={() => setHoveredEvent(ev.date)}
              onMouseLeave={() => setHoveredEvent(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={ev.x} cy={ev.y} r={10} fill={CATEGORY_COLORS[ev.category] || "#555"} opacity={0.3} />
              <text x={ev.x} y={ev.y + 4} textAnchor="middle" fontSize="11">{ev.icon}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Event annotations below chart */}
      {eventMarkers.length > 0 && (
        <div className="trend-events">
          {eventMarkers.map((ev) => (
            <div
              key={ev.date}
              className={`trend-event-tag ${hoveredEvent === ev.date ? "active" : ""}`}
              style={{ borderColor: CATEGORY_COLORS[ev.category] || "#555" }}
              onMouseEnter={() => setHoveredEvent(ev.date)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <span className="trend-event-icon">{ev.icon}</span>
              <span className="trend-event-text">
                <strong>{formatDate(ev.date)}</strong> {(ev.title[lang] || ev.title.en).slice(0, 60)}{(ev.title[lang] || ev.title.en).length > 60 ? "..." : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="trend-legend">
        <span className="legend-item"><span className="legend-line total" />{t("total_alerts", lang)}</span>
        <span className="legend-item"><span className="legend-line ma" />{t("three_day_avg", lang)}</span>
      </div>
    </div>
  );
}
