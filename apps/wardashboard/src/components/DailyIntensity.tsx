import { useMemo } from "react";
import type { Alert } from "@war/shared";
import { buildDailySummaries, getRiskColor } from "@war/shared";
import { type Lang, t } from "../i18n";

interface Props { alerts: Alert[]; lang: Lang; }

function fmtDate(d: string): string {
  const [, m, day] = d.split("-");
  return `${parseInt(day)}/${parseInt(m)}`;
}

export default function DailyIntensity({ alerts, lang }: Props) {
  const { days, maxCount } = useMemo(() => {
    const d = buildDailySummaries(alerts);
    const mx = Math.max(...d.map(x => x.count), 1);
    return { days: d, maxCount: mx };
  }, [alerts]);

  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">{t("sec02", lang)}</span>
        <span className="wd-section-title">{t("daily_intensity", lang)}</span>
        <span className="wd-section-line" />
      </div>
      <p className="wd-subtitle">{t("daily_sub", lang)}</p>

      <div className="wd-daily-chart">
        {days.map((d) => {
          const pct = (d.count / maxCount) * 100;
          const showLabel = days.length <= 14 || days.indexOf(d) % Math.max(1, Math.floor(days.length / 8)) === 0;
          return (
            <div key={d.date} className="wd-daily-col" title={`${fmtDate(d.date)}: ${d.count} ${t("alerts", lang)}`}>
              <div className="wd-daily-bar-wrap">
                <div className="wd-daily-bar" style={{ height: `${pct}%`, background: getRiskColor(d.count, maxCount) }} />
              </div>
              {showLabel && <span className="wd-daily-label">{fmtDate(d.date)}</span>}
              {d.count >= maxCount * 0.85 && <span className="wd-daily-peak">{d.count}</span>}
            </div>
          );
        })}
      </div>

      <div className="wd-daily-scale">
        <span className="wd-scale-item"><span className="wd-scale-dot" style={{ background: "#1b5e4a" }} /> {t("low", lang)}</span>
        <span className="wd-scale-item"><span className="wd-scale-dot" style={{ background: "#b8a02e" }} /> {t("medium", lang)}</span>
        <span className="wd-scale-item"><span className="wd-scale-dot" style={{ background: "#c93d3d" }} /> {t("high", lang)}</span>
        <span className="wd-scale-item"><span className="wd-scale-dot" style={{ background: "#8b1a1a" }} /> {t("extreme", lang)}</span>
      </div>
    </section>
  );
}
