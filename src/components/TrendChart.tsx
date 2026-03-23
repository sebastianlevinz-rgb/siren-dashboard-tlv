import { useMemo, useState } from "react";
import type { Alert } from "../types";
import { type Lang, t } from "../i18n";
import { buildDailySummaries, movingAverage, formatDate } from "../utils/data";

interface Props { alerts: Alert[]; lang: Lang; }

const RANGE_LABELS: Record<Lang, Record<string, string>> = {
  en: { all: "All", last7: "Last 7 days" },
  es: { all: "Todo", last7: "Ultimos 7 dias" },
  he: { all: "הכל", last7: "7 ימים אחרונים" },
};

export default function TrendChart({ alerts, lang }: Props) {
  const [showAll, setShowAll] = useState(true);
  const allDays = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const days = showAll ? allDays : allDays.slice(-7);

  const counts = days.map((d) => d.count);
  const ma3 = movingAverage(counts, 3);
  const maxVal = Math.max(...counts, 1);

  const W = 600, H = 220, PAD = 35;
  const chartW = W - PAD * 2, chartH = H - PAD * 2;
  const xScale = (i: number) => PAD + (i / Math.max(days.length - 1, 1)) * chartW;
  const yScale = (v: number) => PAD + chartH - (v / maxVal) * chartH;
  const makePath = (data: number[]) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`).join(" ");

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
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <g key={r}>
              <line x1={PAD} x2={W - PAD} y1={yScale(r * maxVal)} y2={yScale(r * maxVal)} stroke="#333" strokeDasharray="4,4" />
              <text x={PAD - 5} y={yScale(r * maxVal) + 4} fill="#888" fontSize="10" textAnchor="end">{Math.round(r * maxVal)}</text>
            </g>
          ))}
          {days.map((d, i) => {
            if (days.length <= 7 || i % Math.max(1, Math.floor(days.length / 10)) === 0) {
              return <text key={d.date} x={xScale(i)} y={H - 5} fill="#888" fontSize="9" textAnchor="middle">{formatDate(d.date)}</text>;
            }
            return null;
          })}
          <path d={makePath(counts)} fill="none" stroke="#6ea8d7" strokeWidth={2} />
          <path d={makePath(ma3)} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="6,3" />
          {counts.map((v, i) => (
            <circle key={i} cx={xScale(i)} cy={yScale(v)} r={3} fill="#6ea8d7">
              <title>{formatDate(days[i].date)}: {v}</title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="trend-legend">
        <span className="legend-item"><span className="legend-line total" />{t("total_alerts", lang)}</span>
        <span className="legend-item"><span className="legend-line ma" />{t("three_day_avg", lang)}</span>
      </div>
    </div>
  );
}
