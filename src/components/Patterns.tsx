import { useMemo } from "react";
import type { Alert } from "../types";
import { type Lang, dayFull } from "../i18n";

interface Props { alerts: Alert[]; lang: Lang; }

const TEXT = {
  title: { en: "Patterns & Insights", es: "Patrones y Hallazgos", he: "תבניות ותובנות" },
  sub: {
    en: "Curious patterns extracted from the data",
    es: "Patrones curiosos extraidos de los datos",
    he: "תבניות מעניינות שחולצו מהנתונים",
  },
  shabat_title: { en: "Shabbat Effect", es: "Efecto Shabat", he: "אפקט השבת" },
  shabat_desc: {
    en: "Do they attack more on Shabbat (Sat) or Muslim Friday?",
    es: "Atacan mas en Shabat (Sab) o en el viernes musulman?",
    he: "?האם תוקפים יותר בשבת או ביום שישי המוסלמי",
  },
  night_title: { en: "Night vs Day", es: "Noche vs Dia", he: "לילה מול יום" },
  night_desc: {
    en: "Drones prefer night (slow, avoid visual detection). Missiles don't care.",
    es: "Los drones prefieren la noche (lentos, evitan deteccion visual). A los misiles no les importa.",
    he: "מל\"טים מעדיפים לילה (איטיים, נמנעים מזיהוי חזותי). לטילים זה לא משנה.",
  },
  response_title: { en: "Retaliation Speed", es: "Velocidad de Represalia", he: "מהירות תגמול" },
  response_desc: {
    en: "How quickly does intensity spike after a major event?",
    es: "Que tan rapido sube la intensidad tras un evento importante?",
    he: "?כמה מהר עולה העוצמה לאחר אירוע משמעותי",
  },
  streak_title: { en: "Quiet Streaks", es: "Rachas de Calma", he: "רצפי שקט" },
  streak_desc: {
    en: "Longest gaps between alerts — when you could breathe",
    es: "Brechas mas largas entre alertas — cuando se podia respirar",
    he: "הפערים הארוכים ביותר בין התרעות — כשאפשר היה לנשום",
  },
  wave_title: { en: "Wave Duration", es: "Duracion de Olas", he: "משך גלים" },
  wave_desc: {
    en: "How long do high-intensity periods last before returning to baseline?",
    es: "Cuanto duran los periodos de alta intensidad antes de volver a la linea base?",
    he: "?כמה זמן נמשכים תקופות עוצמה גבוהה לפני חזרה לקו הבסיס",
  },
  alerts_day: { en: "alerts/day", es: "alertas/dia", he: "התרעות/יום" },
  night: { en: "Night (22-06)", es: "Noche (22-06)", he: "לילה (22-06)" },
  day: { en: "Day (06-22)", es: "Dia (06-22)", he: "יום (06-22)" },
  of_missiles: { en: "of missiles", es: "de misiles", he: "מטילים" },
  of_drones: { en: "of drones", es: "de drones", he: "ממל\"טים" },
  hours: { en: "hours", es: "horas", he: "שעות" },
  days: { en: "days", es: "dias", he: "ימים" },
  longest_quiet: { en: "Longest quiet period", es: "Periodo de calma mas largo", he: "תקופת השקט הארוכה ביותר" },
  avg_above: { en: "Avg spike duration (above 30/day)", es: "Duracion prom de picos (mas de 30/dia)", he: "משך ממוצע של שיאים (מעל 30/יום)" },
};

interface PatternData {
  dayOfWeekAvg: { day: number; avg: number }[];
  nightMissiles: number;
  dayMissiles: number;
  nightDrones: number;
  dayDrones: number;
  nightPctMissiles: number;
  nightPctDrones: number;
  longestQuietHours: number;
  longestQuietStart: string;
  avgSpikeDays: number;
}

function analyze(alerts: Alert[]): PatternData {
  // Day of week average
  const dayTotals = new Array(7).fill(0);
  const dayCounts = new Array(7).fill(0);
  const byDate = new Map<string, Alert[]>();
  for (const a of alerts) {
    const arr = byDate.get(a.date) || [];
    arr.push(a);
    byDate.set(a.date, arr);
  }
  for (const [dateStr, dateAlerts] of byDate) {
    const d = new Date(dateStr + "T12:00:00Z");
    const dow = d.getDay();
    dayTotals[dow] += dateAlerts.length;
    dayCounts[dow]++;
  }
  const dayOfWeekAvg = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    avg: dayCounts[i] > 0 ? dayTotals[i] / dayCounts[i] : 0,
  }));

  // Night vs day by threat type
  const isNight = (h: number) => h >= 22 || h < 6;
  let nightMissiles = 0, dayMissiles = 0, nightDrones = 0, dayDrones = 0;
  for (const a of alerts) {
    if (a.threat === "missiles") {
      if (isNight(a.hour)) nightMissiles++; else dayMissiles++;
    } else {
      if (isNight(a.hour)) nightDrones++; else dayDrones++;
    }
  }
  const nightPctMissiles = (nightMissiles / (nightMissiles + dayMissiles || 1)) * 100;
  const nightPctDrones = (nightDrones / (nightDrones + dayDrones || 1)) * 100;

  // Longest quiet period
  const sorted = [...alerts].sort((a, b) => a.unix - b.unix);
  let longestGap = 0, longestGapStart = "";
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].unix - sorted[i - 1].unix;
    if (gap > longestGap) {
      longestGap = gap;
      longestGapStart = sorted[i - 1].timestamp;
    }
  }
  const longestQuietHours = longestGap / 3600;

  // Average spike duration (days above 30 alerts)
  const dailyCounts = [...byDate.entries()].map(([d, a]) => ({ date: d, count: a.length })).sort((a, b) => a.date.localeCompare(b.date));
  let spikeLengths: number[] = [];
  let currentSpike = 0;
  for (const d of dailyCounts) {
    if (d.count >= 30) {
      currentSpike++;
    } else if (currentSpike > 0) {
      spikeLengths.push(currentSpike);
      currentSpike = 0;
    }
  }
  if (currentSpike > 0) spikeLengths.push(currentSpike);
  const avgSpikeDays = spikeLengths.length > 0 ? spikeLengths.reduce((a, b) => a + b, 0) / spikeLengths.length : 0;

  return {
    dayOfWeekAvg,
    nightMissiles, dayMissiles, nightDrones, dayDrones,
    nightPctMissiles, nightPctDrones,
    longestQuietHours,
    longestQuietStart: longestGapStart,
    avgSpikeDays,
  };
}

export default function Patterns({ alerts, lang }: Props) {
  const data = useMemo(() => analyze(alerts), [alerts]);
  const maxDowAvg = Math.max(...data.dayOfWeekAvg.map(d => d.avg), 1);

  return (
    <div className="panel patterns-panel">
      <h2>{TEXT.title[lang]}</h2>
      <p className="panel-subtitle">{TEXT.sub[lang]}</p>

      <div className="patterns-grid">
        {/* Shabbat Effect */}
        <div className="pattern-card">
          <h3>{TEXT.shabat_title[lang]}</h3>
          <p className="pattern-desc">{TEXT.shabat_desc[lang]}</p>
          <div className="pattern-dow-chart">
            {data.dayOfWeekAvg.map((d) => (
              <div key={d.day} className="pattern-dow-col">
                <div className="pattern-dow-bar-wrap">
                  <div
                    className="pattern-dow-bar"
                    style={{
                      height: `${(d.avg / maxDowAvg) * 100}%`,
                      background: d.day === 6 ? "#d4822a" : d.day === 5 ? "#6ea8d7" : "var(--text-muted)",
                    }}
                  />
                </div>
                <span className="pattern-dow-label" style={{
                  color: d.day === 6 ? "#d4822a" : d.day === 5 ? "#6ea8d7" : "var(--text-secondary)",
                  fontWeight: d.day === 5 || d.day === 6 ? 700 : 400,
                }}>
                  {dayFull(d.day, lang).slice(0, 3)}
                </span>
                <span className="pattern-dow-val">{d.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Night vs Day */}
        <div className="pattern-card">
          <h3>{TEXT.night_title[lang]}</h3>
          <p className="pattern-desc">{TEXT.night_desc[lang]}</p>
          <div className="pattern-nightday">
            <div className="pattern-nd-row">
              <span className="pattern-nd-label">{TEXT.of_missiles[lang]}</span>
              <div className="pattern-nd-bar-bg">
                <div className="pattern-nd-bar night" style={{ width: `${data.nightPctMissiles}%` }} />
                <div className="pattern-nd-bar day" style={{ width: `${100 - data.nightPctMissiles}%` }} />
              </div>
              <span className="pattern-nd-pct">{data.nightPctMissiles.toFixed(0)}% {TEXT.night[lang].split(" ")[0].toLowerCase()}</span>
            </div>
            <div className="pattern-nd-row">
              <span className="pattern-nd-label">{TEXT.of_drones[lang]}</span>
              <div className="pattern-nd-bar-bg">
                <div className="pattern-nd-bar night" style={{ width: `${data.nightPctDrones}%` }} />
                <div className="pattern-nd-bar day" style={{ width: `${100 - data.nightPctDrones}%` }} />
              </div>
              <span className="pattern-nd-pct">{data.nightPctDrones.toFixed(0)}% {TEXT.night[lang].split(" ")[0].toLowerCase()}</span>
            </div>
            <div className="pattern-nd-legend">
              <span><span className="war-legend-dot" style={{ background: "#2a2a5a" }} />{TEXT.night[lang]}</span>
              <span><span className="war-legend-dot" style={{ background: "#b8a02e" }} />{TEXT.day[lang]}</span>
            </div>
          </div>
        </div>

        {/* Quiet Streaks */}
        <div className="pattern-card">
          <h3>{TEXT.streak_title[lang]}</h3>
          <p className="pattern-desc">{TEXT.streak_desc[lang]}</p>
          <div className="pattern-stat-big">
            <span className="pattern-big-val">{data.longestQuietHours.toFixed(1)}</span>
            <span className="pattern-big-unit">{TEXT.hours[lang]}</span>
          </div>
          <p className="pattern-stat-sub">{TEXT.longest_quiet[lang]}</p>
        </div>

        {/* Wave Duration */}
        <div className="pattern-card">
          <h3>{TEXT.wave_title[lang]}</h3>
          <p className="pattern-desc">{TEXT.wave_desc[lang]}</p>
          <div className="pattern-stat-big">
            <span className="pattern-big-val">{data.avgSpikeDays.toFixed(1)}</span>
            <span className="pattern-big-unit">{TEXT.days[lang]}</span>
          </div>
          <p className="pattern-stat-sub">{TEXT.avg_above[lang]}</p>
        </div>
      </div>
    </div>
  );
}
