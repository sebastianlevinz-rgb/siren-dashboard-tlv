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
          const dow = new Date(day.date + "T12:00:00+02:00").getDay();
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

      {selectedDay && (
        <div className="timeline-detail">
          <h3>{selectedDay.date} — {selectedDay.count} {t("alerts_s", lang)}</h3>
          <div className="hourly-breakdown">
            {Array.from({ length: 24 }, (_, h) => {
              const hourAlerts = selectedDay.alerts.filter((a) => a.hour === h);
              if (hourAlerts.length === 0) return null;
              const maxH = Math.max(...Array.from({ length: 24 }, (_, hh) => selectedDay.alerts.filter((a) => a.hour === hh).length));
              return (
                <div key={h} className="hourly-row">
                  <span className="hourly-time">{String(h).padStart(2, "0")}:00</span>
                  <div className="hourly-bar-container">
                    <div className="hourly-bar" style={{ width: `${(hourAlerts.length / maxH) * 100}%`, backgroundColor: getRiskColor(hourAlerts.length, maxH) }} />
                  </div>
                  <span className="hourly-count">{hourAlerts.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
