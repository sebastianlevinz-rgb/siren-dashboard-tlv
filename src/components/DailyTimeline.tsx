import { useState, useMemo } from "react";
import type { Alert, DailySummary } from "../types";
import { type Lang, t, dayShort } from "../i18n";
import { buildDailySummaries, formatDate, getRiskColor } from "../utils/data";

interface Props { alerts: Alert[]; lang: Lang; }

export default function DailyTimeline({ alerts, lang }: Props) {
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);
  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const maxCount = useMemo(() => Math.max(...days.map((d) => d.count), 1), [days]);

  return (
    <div className="panel timeline-panel">
      <h2>{t("tl_title", lang)}</h2>
      <p className="panel-subtitle">{t("tl_sub", lang)}</p>

      <div className="v-timeline">
        {days.map((day) => {
          const widthPct = (day.count / maxCount) * 100;
          const dow = day.alerts.length > 0 ? day.alerts[0].day_of_week : new Date(day.date + "T12:00:00Z").getDay();
          const isSelected = selectedDay?.date === day.date;
          return (
            <div key={day.date} className={`v-timeline-row ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedDay(isSelected ? null : day)}>
              <span className="v-tl-date">{formatDate(day.date)}</span>
              <span className="v-tl-day">{dayShort(dow, lang)}</span>
              <div className="v-tl-bar-track">
                <div className="v-tl-bar-fill" style={{ width: `${widthPct}%`, backgroundColor: getRiskColor(day.count, maxCount) }} />
              </div>
              <span className="v-tl-count">{day.count}</span>
            </div>
          );
        })}
      </div>

      {selectedDay && selectedDay.alerts.length > 0 && (() => {
          const hourCounts = new Array(24).fill(0);
          for (const a of selectedDay.alerts) hourCounts[a.hour]++;
          const maxH = Math.max(...hourCounts);
          return (
            <div className="timeline-detail">
              <h3>{selectedDay.date} — {selectedDay.count} {t("alerts_s", lang)}</h3>
              <div className="hourly-breakdown">
                {hourCounts.map((count, h) => {
                  if (count === 0) return null;
                  return (
                    <div key={h} className="hourly-row">
                      <span className="hourly-time">{String(h).padStart(2, "0")}:00</span>
                      <div className="hourly-bar-container">
                        <div className="hourly-bar" style={{ width: `${(count / maxH) * 100}%`, backgroundColor: getRiskColor(count, maxH) }} />
                      </div>
                      <span className="hourly-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
