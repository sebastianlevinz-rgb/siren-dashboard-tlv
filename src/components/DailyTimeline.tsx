import { useState, useMemo } from "react";
import type { Alert, DailySummary } from "../types";
import { buildDailySummaries, formatDate, getRiskColor } from "../utils/data";

interface Props {
  alerts: Alert[];
}

export default function DailyTimeline({ alerts }: Props) {
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);
  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const maxCount = useMemo(
    () => Math.max(...days.map((d) => d.count), 1),
    [days]
  );

  return (
    <div className="panel timeline-panel">
      <h2>Día por Día</h2>
      <p className="panel-subtitle">
        Cada barra = alertas Gush Dan ese día. Click para ver desglose por hora.
      </p>

      <div className="timeline-bars">
        {days.map((day) => {
          const heightPct = (day.count / maxCount) * 100;
          const missilePct = day.count > 0 ? (day.missiles / day.count) * 100 : 0;

          return (
            <div
              key={day.date}
              className={`timeline-bar-wrapper ${
                selectedDay?.date === day.date ? "selected" : ""
              }`}
              onClick={() =>
                setSelectedDay(
                  selectedDay?.date === day.date ? null : day
                )
              }
            >
              <div className="bar-count">{day.count}</div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: getRiskColor(day.count, maxCount),
                  }}
                >
                  <div
                    className="bar-missiles"
                    style={{ height: `${missilePct}%` }}
                  />
                </div>
              </div>
              <div className="bar-date">{formatDate(day.date)}</div>
            </div>
          );
        })}
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div className="timeline-detail">
          <h3>
            {new Date(selectedDay.date + "T00:00:00").toLocaleDateString(
              "es-AR",
              {
                weekday: "long",
                day: "numeric",
                month: "long",
              }
            )}{" "}
            — {selectedDay.count} alertas
          </h3>
          <div className="detail-breakdown">
            <span className="missiles-badge">
              Misiles: {selectedDay.missiles}
            </span>
            <span className="aircraft-badge">
              Drones/Aviones: {selectedDay.hostile_aircraft}
            </span>
          </div>

          {/* Hourly breakdown for selected day */}
          <div className="hourly-breakdown">
            {Array.from({ length: 24 }, (_, h) => {
              const hourAlerts = selectedDay.alerts.filter(
                (a) => a.hour === h
              );
              if (hourAlerts.length === 0) return null;
              return (
                <div key={h} className="hourly-row">
                  <span className="hourly-time">
                    {String(h).padStart(2, "0")}:00
                  </span>
                  <div className="hourly-bar-container">
                    <div
                      className="hourly-bar"
                      style={{
                        width: `${
                          (hourAlerts.length /
                            Math.max(
                              ...Array.from({ length: 24 }, (_, hh) =>
                                selectedDay.alerts.filter((a) => a.hour === hh)
                                  .length
                              )
                            )) *
                          100
                        }%`,
                        backgroundColor: getRiskColor(
                          hourAlerts.length,
                          Math.max(
                            ...Array.from({ length: 24 }, (_, hh) =>
                              selectedDay.alerts.filter((a) => a.hour === hh)
                                .length
                            )
                          )
                        ),
                      }}
                    />
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
