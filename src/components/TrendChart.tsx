import { useMemo } from "react";
import type { Alert } from "../types";
import { buildDailySummaries, movingAverage, formatDate } from "../utils/data";

interface Props {
  alerts: Alert[];
}

export default function TrendChart({ alerts }: Props) {
  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);

  const counts = days.map((d) => d.count);
  const missileCounts = days.map((d) => d.missiles);
  const aircraftCounts = days.map((d) => d.hostile_aircraft);
  const ma3 = movingAverage(counts, 3);
  const maxVal = Math.max(...counts, 1);

  // SVG dimensions — compact for mobile
  const W = 600;
  const H = 220;
  const PAD = 35;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;

  const xScale = (i: number) => PAD + (i / Math.max(days.length - 1, 1)) * chartW;
  const yScale = (v: number) => PAD + chartH - (v / maxVal) * chartH;

  const makePath = (data: number[]) =>
    data
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`)
      .join(" ");

  // Area under missiles
  const missileArea =
    makePath(missileCounts) +
    ` L ${xScale(missileCounts.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

  const aircraftArea =
    makePath(aircraftCounts) +
    ` L ${xScale(aircraftCounts.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

  return (
    <div className="panel trend-panel">
      <h2>Tendencia</h2>
      <p className="panel-subtitle">
        Alertas/día con media móvil de 3 días. Separado por tipo.
      </p>

      <div className="trend-chart-container">
        <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <g key={r}>
              <line
                x1={PAD}
                x2={W - PAD}
                y1={yScale(r * maxVal)}
                y2={yScale(r * maxVal)}
                stroke="#333"
                strokeDasharray="4,4"
              />
              <text
                x={PAD - 5}
                y={yScale(r * maxVal) + 4}
                fill="#888"
                fontSize="10"
                textAnchor="end"
              >
                {Math.round(r * maxVal)}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {days.map((d, i) => {
            if (i % Math.max(1, Math.floor(days.length / 10)) !== 0) return null;
            return (
              <text
                key={d.date}
                x={xScale(i)}
                y={H - 5}
                fill="#888"
                fontSize="9"
                textAnchor="middle"
              >
                {formatDate(d.date)}
              </text>
            );
          })}

          {/* Areas */}
          <path d={missileArea} fill="#c93d3d" opacity={0.12} />
          <path d={aircraftArea} fill="#d4822a" opacity={0.12} />

          {/* Lines */}
          <path
            d={makePath(missileCounts)}
            fill="none"
            stroke="#c93d3d"
            strokeWidth={1.5}
            opacity={0.6}
          />
          <path
            d={makePath(aircraftCounts)}
            fill="none"
            stroke="#d4822a"
            strokeWidth={1.5}
            opacity={0.6}
          />

          {/* Total line */}
          <path
            d={makePath(counts)}
            fill="none"
            stroke="#6ea8d7"
            strokeWidth={2}
          />

          {/* Moving average */}
          <path
            d={makePath(ma3)}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeDasharray="6,3"
          />

          {/* Data points */}
          {counts.map((v, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(v)}
              r={3}
              fill="#6ea8d7"
            >
              <title>
                {formatDate(days[i].date)}: {v} alertas
              </title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="trend-legend">
        <span className="legend-item">
          <span className="legend-line total" />
          Total alertas
        </span>
        <span className="legend-item">
          <span className="legend-line ma" />
          Media móvil 3d
        </span>
        <span className="legend-item">
          <span className="legend-line missiles" />
          Misiles
        </span>
        <span className="legend-item">
          <span className="legend-line aircraft" />
          Drones/Aviones
        </span>
      </div>
    </div>
  );
}
