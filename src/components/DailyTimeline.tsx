import { useState, useMemo } from "react";
import type { Alert, DailySummary } from "../types";
import { buildDailySummaries, formatDate, getRiskColor } from "../utils/data";

interface Props {
  alerts: Alert[];
}

export default function DailyTimeline({ alerts }: Props) {
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);
  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const maxCount = useMemo(() => Math.max(...days.map((d) => d.count), 1), [days]);

  const dayNames: Record<string, string> = {
    "0": "Sun", "1": "Mon", "2": "Tue", "3": "Wed", "4": "Thu", "5": "Fri", "6": "Sat",
  };

  return (
    <div className="panel timeline-panel">
      <h2>Daily Timeline</h2>
      <p className="panel-subtitle">Each row = one day. Tap for hourly breakdown.</p>

      <div className="v-timeline">
        {days.map((day) => {
          const widthPct = (day.count / maxCount) * 100;
          const dow = new Date(day.date + "T12:00:00+02:00").getDay();
          const isSelected = selectedDay?.date === day.date;

          return (
            <div
              key={day.date}
              className={`v-timeline-row ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedDay(isSelected ? null : day)}
            >
              <span className="v-tl-date">{formatDate(day.date)}</span>
              <span className="v-tl-day">{dayNames[String(dow)]}</span>
              <div className="v-tl-bar-track">
                <div
                  className="v-tl-bar-fill"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: getRiskColor(day.count, maxCount),
                  }}
                />
              </div>
              <span className="v-tl-count">{day.count}</span>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="timeline-detail">
          <h3>
            {new Date(selectedDay.date + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long", day: "numeric", month: "long",
            })} — {selectedDay.count} alerts
          </h3>
          <div className="hourly-breakdown">
            {Array.from({ length: 24 }, (_, h) => {
              const hourAlerts = selectedDay.alerts.filter((a) => a.hour === h);
              if (hourAlerts.length === 0) return null;
              const maxH = Math.max(...Array.from({ length: 24 }, (_, hh) =>
                selectedDay.alerts.filter((a) => a.hour === hh).length));
              return (
                <div key={h} className="hourly-row">
                  <span className="hourly-time">{String(h).padStart(2, "0")}:00</span>
                  <div className="hourly-bar-container">
                    <div className="hourly-bar" style={{
                      width: `${(hourAlerts.length / maxH) * 100}%`,
                      backgroundColor: getRiskColor(hourAlerts.length, maxH),
                    }} />
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
