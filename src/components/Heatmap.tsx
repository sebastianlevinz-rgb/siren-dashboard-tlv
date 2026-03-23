import React, { useState, useMemo } from "react";
import type { Alert, HeatmapCell } from "../types";
import { type Lang, t, dayShort, dayFull } from "../i18n";
import { buildHeatmap, formatHour, getRiskColor } from "../utils/data";

const HOUR_ORDER = [...Array.from({ length: 18 }, (_, i) => i + 6), ...Array.from({ length: 6 }, (_, i) => i)];

// Expandable life tips with rich data-driven facts + extra patterns
function LifeTips({ lifeTips, lang, tl, totalDays, allCells, alerts }: {
  lifeTips: { bestShower: { h: number; score: number }; bestSuper: { h: number; score: number }; worstLunch: { h: number; score: number }; bestEvening: { h: number; score: number } };
  lang: Lang; tl: Record<string, string>; totalDays: number; allCells: HeatmapCell[]; alerts: Alert[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  // Calendar days that had an alert at hour h
  const calDaysAtHour = (h: number) => {
    const dates = new Set<string>();
    for (const a of alerts) { if (a.hour === h) dates.add(a.date); }
    return dates.size;
  };

  // Total alerts at hour h
  const totalAtHour = (h: number) => allCells.filter((c) => c.hour === h).reduce((a, c) => a + c.count, 0);

  // Average alerts per hour across all hours
  const avgPerHour = Math.round(alerts.length / 24);

  // Percentage of safe days at hour h
  const pctSafe = (h: number) => totalDays > 0 ? Math.round(((totalDays - calDaysAtHour(h)) / totalDays) * 100) : 0;

  // Comparison multiplier vs average
  const vsAvg = (score: number) => avgPerHour > 0 ? (score / avgPerHour * 100).toFixed(0) : "0";

  // Extra patterns
  const patterns = useMemo(() => {
    // Safest & most dangerous day of week
    const dayTotals = [0,1,2,3,4,5,6].map(d => ({
      day: d, count: allCells.filter(c => c.day === d).reduce((a, c) => a + c.count, 0)
    }));
    const safestDay = dayTotals.reduce((a, b) => a.count <= b.count ? a : b);
    const dangerDay = dayTotals.reduce((a, b) => a.count >= b.count ? a : b);

    // Quietest 3-hour window (daytime 6-21)
    let bestWindow = { start: 6, total: Infinity };
    for (let s = 6; s <= 19; s++) {
      const tot = [s, s+1, s+2].reduce((sum, h) => sum + totalAtHour(h), 0);
      if (tot < bestWindow.total) bestWindow = { start: s, total: tot };
    }

    // Night safety (0-5)
    const nightTotal = allCells.filter(c => c.hour >= 0 && c.hour < 6).reduce((a, c) => a + c.count, 0);
    const nightPct = alerts.length > 0 ? ((nightTotal / alerts.length) * 100).toFixed(1) : "0";

    // Peak hour overall
    let peakH = 0, peakCount = 0;
    for (let h = 0; h < 24; h++) {
      const t = totalAtHour(h);
      if (t > peakCount) { peakH = h; peakCount = t; }
    }

    // Weekend vs weekday
    const weekdayAlerts = allCells.filter(c => c.day >= 1 && c.day <= 5).reduce((a, c) => a + c.count, 0);
    const weekendAlerts = allCells.filter(c => c.day === 0 || c.day === 6).reduce((a, c) => a + c.count, 0);
    const weekdayAvg = (weekdayAlerts / 5).toFixed(1);
    const weekendAvg = (weekendAlerts / 2).toFixed(1);

    return { safestDay, dangerDay, bestWindow, nightTotal, nightPct, peakH, peakCount, weekdayAvg, weekendAvg };
  }, [allCells, alerts, totalAtHour]);

  const facts: Record<Lang, Record<string, string>> = {
    en: {
      shower: `In the last ${totalDays} days, only ${calDaysAtHour(lifeTips.bestShower.h)} days had alerts at ${formatHour(lifeTips.bestShower.h)} — ${pctSafe(lifeTips.bestShower.h)}% of days were completely safe at this hour. Total: just ${lifeTips.bestShower.score} alerts vs ${avgPerHour} avg/hour. Quick shower, you'll be fine.`,
      super: `Only ${calDaysAtHour(lifeTips.bestSuper.h)} out of ${totalDays} days had any alert at ${formatHour(lifeTips.bestSuper.h)} — ${pctSafe(lifeTips.bestSuper.h)}% safe rate. That's ${vsAvg(lifeTips.bestSuper.score)}% of the average hour. The quietest window for errands.`,
      lunch: `${calDaysAtHour(lifeTips.worstLunch.h)} out of ${totalDays} days had alerts at ${formatHour(lifeTips.worstLunch.h)} — only ${pctSafe(lifeTips.worstLunch.h)}% safe. With ${lifeTips.worstLunch.score} total alerts (${vsAvg(lifeTips.worstLunch.score)}% of avg), it's the riskiest lunch hour. Eat indoors or near a shelter.`,
      evening: `Only ${calDaysAtHour(lifeTips.bestEvening.h)} out of ${totalDays} days had alerts at ${formatHour(lifeTips.bestEvening.h)} — ${pctSafe(lifeTips.bestEvening.h)}% safe. Just ${lifeTips.bestEvening.score} alerts total. Good window for a quick drink nearby.`,
    },
    es: {
      shower: `En los ultimos ${totalDays} dias, solo ${calDaysAtHour(lifeTips.bestShower.h)} dias tuvieron alerta a las ${formatHour(lifeTips.bestShower.h)} — ${pctSafe(lifeTips.bestShower.h)}% de los dias fueron seguros a esta hora. Total: solo ${lifeTips.bestShower.score} alertas vs ${avgPerHour} promedio/hora. Ducha rapida, vas a estar bien.`,
      super: `Solo ${calDaysAtHour(lifeTips.bestSuper.h)} de ${totalDays} dias tuvieron alerta a las ${formatHour(lifeTips.bestSuper.h)} — ${pctSafe(lifeTips.bestSuper.h)}% seguro. Es ${vsAvg(lifeTips.bestSuper.score)}% del promedio por hora. La ventana mas tranquila para mandados.`,
      lunch: `${calDaysAtHour(lifeTips.worstLunch.h)} de ${totalDays} dias tuvieron alerta a las ${formatHour(lifeTips.worstLunch.h)} — solo ${pctSafe(lifeTips.worstLunch.h)}% seguro. Con ${lifeTips.worstLunch.score} alertas totales, es la hora mas peligrosa. Come adentro o cerca de un refugio.`,
      evening: `Solo ${calDaysAtHour(lifeTips.bestEvening.h)} de ${totalDays} dias tuvieron alerta a las ${formatHour(lifeTips.bestEvening.h)} — ${pctSafe(lifeTips.bestEvening.h)}% seguro. Solo ${lifeTips.bestEvening.score} alertas total. Buena ventana para una birra rapida.`,
    },
    he: {
      shower: `ב-${totalDays} הימים האחרונים, רק ב-${calDaysAtHour(lifeTips.bestShower.h)} ימים היו התרעות ב-${formatHour(lifeTips.bestShower.h)} — ${pctSafe(lifeTips.bestShower.h)}% מהימים היו בטוחים לחלוטין. סה"כ: רק ${lifeTips.bestShower.score} התרעות מול ממוצע ${avgPerHour}/שעה. מקלחת מהירה, יהיה בסדר.`,
      super: `רק ב-${calDaysAtHour(lifeTips.bestSuper.h)} מתוך ${totalDays} ימים הייתה התרעה ב-${formatHour(lifeTips.bestSuper.h)} — ${pctSafe(lifeTips.bestSuper.h)}% בטוח. זה ${vsAvg(lifeTips.bestSuper.score)}% מהממוצע לשעה. החלון הכי שקט לסידורים.`,
      lunch: `ב-${calDaysAtHour(lifeTips.worstLunch.h)} מתוך ${totalDays} ימים היו התרעות ב-${formatHour(lifeTips.worstLunch.h)} — רק ${pctSafe(lifeTips.worstLunch.h)}% בטוח. עם ${lifeTips.worstLunch.score} התרעות, זו השעה הכי מסוכנת. תאכל בפנים או קרוב למקלט.`,
      evening: `רק ב-${calDaysAtHour(lifeTips.bestEvening.h)} מתוך ${totalDays} ימים היו התרעות ב-${formatHour(lifeTips.bestEvening.h)} — ${pctSafe(lifeTips.bestEvening.h)}% בטוח. רק ${lifeTips.bestEvening.score} התרעות. חלון טוב לבירה מהירה.`,
    },
  };

  const tipTitle = lang === "he" ? "טיפים לחיי יומיום" : lang === "es" ? "Tips para la vida diaria" : "Daily Life Tips";
  const tapHint = lang === "he" ? "לחץ לפרטים" : lang === "es" ? "Toca para mas info" : "Tap for details";

  const tips = [
    { id: "shower", emoji: "🚿", text: tl.shower, value: formatHour(lifeTips.bestShower.h), type: "ok" as const },
    { id: "super", emoji: "🛒", text: tl.super, value: formatHour(lifeTips.bestSuper.h), type: "ok" as const },
    { id: "lunch", emoji: "🍽️", text: tl.lunch, value: formatHour(lifeTips.worstLunch.h), type: "danger" as const },
    { id: "evening", emoji: "🍻", text: tl.evening, value: formatHour(lifeTips.bestEvening.h), type: "ok" as const },
  ];

  const patternLabels = {
    en: {
      title: "Patterns Found",
      safestDay: "Safest day",
      dangerDay: "Riskiest day",
      quietWindow: "Quietest 3h window",
      nightSafety: "Night (00-05)",
      peakHour: "Peak hour",
      wkVsWknd: "Weekdays vs Weekends",
      alerts: "alerts",
      ofTotal: "of total",
      avgPerDay: "avg/day",
    },
    es: {
      title: "Patrones encontrados",
      safestDay: "Dia mas seguro",
      dangerDay: "Dia mas peligroso",
      quietWindow: "Ventana de 3h mas tranquila",
      nightSafety: "Noche (00-05)",
      peakHour: "Hora pico",
      wkVsWknd: "Semana vs Fin de semana",
      alerts: "alertas",
      ofTotal: "del total",
      avgPerDay: "prom/dia",
    },
    he: {
      title: "דפוסים שנמצאו",
      safestDay: "היום הכי בטוח",
      dangerDay: "היום הכי מסוכן",
      quietWindow: "חלון 3 שעות שקט",
      nightSafety: "לילה (00-05)",
      peakHour: "שעת שיא",
      wkVsWknd: "ימי חול מול סופ\"ש",
      alerts: "התרעות",
      ofTotal: "מהסך",
      avgPerDay: "ממוצע/יום",
    },
  };
  const pl = patternLabels[lang];

  return (
    <div className="life-tips">
      <h3>{tipTitle} <span className="tap-hint">{tapHint}</span></h3>
      <div className="life-tips-grid">
        {tips.map((tip) => (
          <div key={tip.id} className={`life-tip ${tip.type} ${expanded === tip.id ? "expanded" : ""}`} onClick={() => toggle(tip.id)}>
            <span className="tip-emoji">{tip.emoji}</span>
            <span className="tip-text">{tip.text}</span>
            <span className="tip-value">{tip.value}</span>
            <span className={`tip-badge ${tip.type}`}>{tip.type === "ok" ? "✓" : "✗"}</span>
            {expanded === tip.id && (
              <div className="tip-fact">{facts[lang][tip.id]}</div>
            )}
          </div>
        ))}
      </div>

      {/* Extra patterns */}
      <div className="patterns-section">
        <h3>{pl.title}</h3>
        <div className="patterns-grid">
          <div className="pattern-card safe" onClick={() => toggle("safestDay")}>
            <span className="pattern-icon">📅</span>
            <span className="pattern-label">{pl.safestDay}</span>
            <span className="pattern-value">{dayFull(patterns.safestDay.day, lang)}</span>
            <span className="pattern-detail">{patterns.safestDay.count} {pl.alerts}</span>
            {expanded === "safestDay" && (
              <div className="tip-fact">
                {lang === "en" && `${dayFull(patterns.safestDay.day, lang)}s had only ${patterns.safestDay.count} alerts across the entire period. ${dayFull(patterns.dangerDay.day, lang)}s had ${patterns.dangerDay.count} — that's ${((patterns.dangerDay.count / (patterns.safestDay.count || 1))).toFixed(1)}x more. Schedule flexible activities on ${dayFull(patterns.safestDay.day, lang)}s.`}
                {lang === "es" && `Los ${dayFull(patterns.safestDay.day, lang)} tuvieron solo ${patterns.safestDay.count} alertas en todo el periodo. Los ${dayFull(patterns.dangerDay.day, lang)} tuvieron ${patterns.dangerDay.count} — ${((patterns.dangerDay.count / (patterns.safestDay.count || 1))).toFixed(1)}x mas. Programa actividades flexibles los ${dayFull(patterns.safestDay.day, lang)}.`}
                {lang === "he" && `ימי ${dayFull(patterns.safestDay.day, lang)} היו עם רק ${patterns.safestDay.count} התרעות בכל התקופה. ימי ${dayFull(patterns.dangerDay.day, lang)} היו עם ${patterns.dangerDay.count} — פי ${((patterns.dangerDay.count / (patterns.safestDay.count || 1))).toFixed(1)}. תכנן פעילויות גמישות ליום ${dayFull(patterns.safestDay.day, lang)}.`}
              </div>
            )}
          </div>
          <div className="pattern-card danger" onClick={() => toggle("dangerDay")}>
            <span className="pattern-icon">📅</span>
            <span className="pattern-label">{pl.dangerDay}</span>
            <span className="pattern-value">{dayFull(patterns.dangerDay.day, lang)}</span>
            <span className="pattern-detail">{patterns.dangerDay.count} {pl.alerts}</span>
            {expanded === "dangerDay" && (
              <div className="tip-fact">
                {lang === "en" && `${dayFull(patterns.dangerDay.day, lang)}s are the most active day with ${patterns.dangerDay.count} alerts. That's ${((patterns.dangerDay.count / alerts.length) * 100).toFixed(0)}% of all alerts concentrated on one day of the week. Avoid non-essential outdoor plans.`}
                {lang === "es" && `Los ${dayFull(patterns.dangerDay.day, lang)} son el dia mas activo con ${patterns.dangerDay.count} alertas. Eso es ${((patterns.dangerDay.count / alerts.length) * 100).toFixed(0)}% de todas las alertas en un solo dia. Evita planes al aire libre no esenciales.`}
                {lang === "he" && `ימי ${dayFull(patterns.dangerDay.day, lang)} הם היום הכי פעיל עם ${patterns.dangerDay.count} התרעות. זה ${((patterns.dangerDay.count / alerts.length) * 100).toFixed(0)}% מכל ההתרעות ביום אחד. הימנע מתוכניות לא חיוניות בחוץ.`}
              </div>
            )}
          </div>
          <div className="pattern-card safe" onClick={() => toggle("quietWindow")}>
            <span className="pattern-icon">🕐</span>
            <span className="pattern-label">{pl.quietWindow}</span>
            <span className="pattern-value">{formatHour(patterns.bestWindow.start)}–{formatHour(patterns.bestWindow.start + 3)}</span>
            <span className="pattern-detail">{patterns.bestWindow.total} {pl.alerts}</span>
            {expanded === "quietWindow" && (
              <div className="tip-fact">
                {lang === "en" && `The 3-hour block from ${formatHour(patterns.bestWindow.start)} to ${formatHour(patterns.bestWindow.start + 3)} had only ${patterns.bestWindow.total} alerts across ${totalDays} days. Best window for longer errands, gym, or anything that keeps you away from shelter for a while.`}
                {lang === "es" && `El bloque de 3 horas de ${formatHour(patterns.bestWindow.start)} a ${formatHour(patterns.bestWindow.start + 3)} tuvo solo ${patterns.bestWindow.total} alertas en ${totalDays} dias. Mejor ventana para mandados largos, gym, o cualquier cosa que te aleje del refugio.`}
                {lang === "he" && `בלוק 3 השעות מ-${formatHour(patterns.bestWindow.start)} עד ${formatHour(patterns.bestWindow.start + 3)} היה עם רק ${patterns.bestWindow.total} התרעות ב-${totalDays} ימים. החלון הכי טוב לסידורים ארוכים, חדר כושר, או כל דבר שמרחיק אותך מהמקלט.`}
              </div>
            )}
          </div>
          <div className="pattern-card neutral" onClick={() => toggle("nightSafety")}>
            <span className="pattern-icon">🌙</span>
            <span className="pattern-label">{pl.nightSafety}</span>
            <span className="pattern-value">{patterns.nightPct}%</span>
            <span className="pattern-detail">{patterns.nightTotal} {pl.alerts} ({pl.ofTotal})</span>
            {expanded === "nightSafety" && (
              <div className="tip-fact">
                {lang === "en" && `Between midnight and 5 AM there were ${patterns.nightTotal} alerts — ${patterns.nightPct}% of the total. ${patterns.nightTotal < avgPerHour * 3 ? "Nights are relatively calm. You can sleep without too much worry, but keep your phone charged." : "Night attacks are significant. Keep your phone at full volume and know your shelter route in the dark."}`}
                {lang === "es" && `Entre medianoche y las 5 AM hubo ${patterns.nightTotal} alertas — ${patterns.nightPct}% del total. ${patterns.nightTotal < avgPerHour * 3 ? "Las noches son relativamente tranquilas. Podes dormir sin preocuparte demasiado, pero mantene el celular cargado." : "Los ataques nocturnos son significativos. Mantene el celular al maximo volumen y conoce la ruta al refugio en la oscuridad."}`}
                {lang === "he" && `בין חצות ל-5 בבוקר היו ${patterns.nightTotal} התרעות — ${patterns.nightPct}% מהסך. ${patterns.nightTotal < avgPerHour * 3 ? "הלילות יחסית רגועים. אפשר לישון בשקט, אבל תשאיר את הטלפון טעון." : "תקיפות לילה משמעותיות. תשאיר את הטלפון על ווליום מקסימלי ותכיר את המסלול למקלט בחושך."}`}
              </div>
            )}
          </div>
          <div className="pattern-card danger" onClick={() => toggle("peakHour")}>
            <span className="pattern-icon">⚠️</span>
            <span className="pattern-label">{pl.peakHour}</span>
            <span className="pattern-value">{formatHour(patterns.peakH)}</span>
            <span className="pattern-detail">{patterns.peakCount} {pl.alerts}</span>
            {expanded === "peakHour" && (
              <div className="tip-fact">
                {lang === "en" && `${formatHour(patterns.peakH)} is the single most attacked hour with ${patterns.peakCount} alerts — ${((patterns.peakCount / alerts.length) * 100).toFixed(1)}% of all alerts. That's ${(patterns.peakCount / (avgPerHour || 1)).toFixed(1)}x the average hour. Absolutely avoid being far from shelter at this time.`}
                {lang === "es" && `Las ${formatHour(patterns.peakH)} es la hora mas atacada con ${patterns.peakCount} alertas — ${((patterns.peakCount / alerts.length) * 100).toFixed(1)}% del total. Eso es ${(patterns.peakCount / (avgPerHour || 1)).toFixed(1)}x el promedio. Evita absolutamente estar lejos de un refugio a esta hora.`}
                {lang === "he" && `${formatHour(patterns.peakH)} היא השעה הכי מותקפת עם ${patterns.peakCount} התרעות — ${((patterns.peakCount / alerts.length) * 100).toFixed(1)}% מכל ההתרעות. זה פי ${(patterns.peakCount / (avgPerHour || 1)).toFixed(1)} מהממוצע. בשום פנים אל תהיה רחוק ממקלט בשעה הזו.`}
              </div>
            )}
          </div>
          <div className="pattern-card neutral" onClick={() => toggle("wkVsWknd")}>
            <span className="pattern-icon">📊</span>
            <span className="pattern-label">{pl.wkVsWknd}</span>
            <span className="pattern-value">{patterns.weekdayAvg} / {patterns.weekendAvg}</span>
            <span className="pattern-detail">{pl.avgPerDay}</span>
            {expanded === "wkVsWknd" && (
              <div className="tip-fact">
                {lang === "en" && `Weekdays average ${patterns.weekdayAvg} alerts per day vs ${patterns.weekendAvg} on weekends. ${Number(patterns.weekdayAvg) > Number(patterns.weekendAvg) ? "Weekends are calmer — good for outdoor activities." : Number(patterns.weekdayAvg) < Number(patterns.weekendAvg) ? "Weekends are actually more dangerous — be extra careful with plans." : "No significant difference between weekdays and weekends."}`}
                {lang === "es" && `Dias de semana promedian ${patterns.weekdayAvg} alertas/dia vs ${patterns.weekendAvg} los fines de semana. ${Number(patterns.weekdayAvg) > Number(patterns.weekendAvg) ? "Los fines de semana son mas tranquilos — buenos para actividades al aire libre." : Number(patterns.weekdayAvg) < Number(patterns.weekendAvg) ? "Los fines de semana son mas peligrosos — tene cuidado extra con los planes." : "No hay diferencia significativa entre semana y fin de semana."}`}
                {lang === "he" && `ימי חול ממוצעים ${patterns.weekdayAvg} התרעות/יום מול ${patterns.weekendAvg} בסופ"ש. ${Number(patterns.weekdayAvg) > Number(patterns.weekendAvg) ? "סופי שבוע יותר רגועים — טובים לפעילויות בחוץ." : Number(patterns.weekdayAvg) < Number(patterns.weekendAvg) ? "סופי שבוע בעצם יותר מסוכנים — תהיה זהיר יותר עם תוכניות." : "אין הבדל משמעותי בין ימי חול לסופ\"ש."}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  alerts: Alert[];
  lang: Lang;
  total: number;
  totalDays: number;
  avg: string;
}

export default function Heatmap({ alerts, lang, total, totalDays, avg }: Props) {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const grid = useMemo(() => buildHeatmap(alerts), [alerts]);
  const maxCount = useMemo(() => Math.max(...grid.flat().map((c) => c.count), 1), [grid]);

  const allCells = useMemo(() => {
    const cells: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) cells.push(grid[d][h]);
    return cells;
  }, [grid]);

  // Filter out 1-alert cells
  const worstGroups = useMemo(() => {
    const sorted = [...allCells].filter((c) => c.count > 1).sort((a, b) => b.count - a.count);
    const groups: { count: number; cells: HeatmapCell[] }[] = [];
    for (const c of sorted) {
      const g = groups.find((g) => g.count === c.count);
      if (g) g.cells.push(c);
      else groups.push({ count: c.count, cells: [c] });
    }
    return groups.slice(0, 4);
  }, [allCells]);

  // Life tips
  const lifeTips = useMemo(() => {
    const byHour: Record<number, number> = {};
    for (const c of allCells.filter((c) => c.hour >= 6 && c.hour <= 22)) {
      byHour[c.hour] = (byHour[c.hour] || 0) + c.count;
    }
    const findMin = (start: number, end: number) => {
      let best = { h: start, score: Infinity };
      for (let h = start; h <= end; h++) {
        const s = byHour[h] || 0;
        if (s < best.score) best = { h, score: s };
      }
      return best;
    };
    const findMax = (start: number, end: number) => {
      let worst = { h: start, score: 0 };
      for (let h = start; h <= end; h++) {
        const s = byHour[h] || 0;
        if (s > worst.score) worst = { h, score: s };
      }
      return worst;
    };
    return {
      bestShower: findMin(6, 9),
      bestSuper: findMin(8, 20),
      worstLunch: findMax(11, 14),
      bestEvening: findMin(18, 21),
    };
  }, [allCells]);

  const plural = (n: number) => n === 1 ? t("alert_s", lang) : t("alerts_s", lang);

  const tipLabels = {
    en: { shower: "Best time to shower", super: "Safest grocery run", lunch: "Don't eat outside at", evening: "Safest evening out" },
    es: { shower: "Mejor hora para banarse", super: "Mejor hora para el super", lunch: "No salgas a almorzar a las", evening: "Mejor hora para salir" },
    he: { shower: "הזמן הכי בטוח להתקלח", super: "הזמן הכי בטוח לסופר", lunch: "אל תצא לאכול בשעה", evening: "הזמן הכי בטוח לצאת בערב" },
  };
  const tl = tipLabels[lang];

  const statsLabels = {
    en: { totalAlerts: "Total Alerts", period: "Period", avgDay: "Average / Day", days: "days" },
    es: { totalAlerts: "Total Alertas", period: "Periodo", avgDay: "Promedio / Dia", days: "dias" },
    he: { totalAlerts: "סך התרעות", period: "תקופה", avgDay: "ממוצע / יום", days: "ימים" },
  };
  const sl = statsLabels[lang];

  return (
    <div className="panel heatmap-panel">
      <h2>{t("hm_title", lang)}</h2>
      <p className="panel-subtitle">{t("hm_sub", lang)}</p>

      <div className="heatmap-container">
        <div className="heatmap-grid">
          <div className="heatmap-corner" />
          {HOUR_ORDER.map((h) => (
            <div key={h} className={`heatmap-hour-label ${h < 6 ? "night" : ""}`}>{h}</div>
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <React.Fragment key={day}>
              <div className="heatmap-day-label">{dayShort(day, lang)}</div>
              {HOUR_ORDER.map((hour) => {
                const cell = grid[day][hour];
                return (
                  <div key={`${day}-${hour}`}
                    className={`heatmap-cell ${selectedCell?.day === day && selectedCell?.hour === hour ? "selected" : ""} ${hour < 6 ? "night" : ""}`}
                    style={{ backgroundColor: getRiskColor(cell.count, maxCount) }}
                    onClick={() => setSelectedCell(selectedCell?.day === day && selectedCell?.hour === hour ? null : cell)}
                  >
                    {cell.count > 0 && <span className="heatmap-count">{cell.count}</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>{t("safe", lang)}</span>
          <div className="legend-bar">
            {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((r) => (
              <div key={r} className="legend-swatch" style={{ backgroundColor: getRiskColor(r * maxCount, maxCount) }} />
            ))}
          </div>
          <span>{t("danger", lang)}</span>
        </div>
      </div>

      {/* Most dangerous */}
      <div className="top-worst">
        <h3>{t("most_dangerous", lang)}</h3>
        <div className="top-worst-list">
          {worstGroups.map((g, i) => (
            <div key={g.count} className="top5-group">
              <div className="top5-group-header">
                <span className="top5-rank">#{i + 1}</span>
                <span className="top5-count worst">{g.count} {plural(g.count)}</span>
              </div>
              <div className="top5-group-items">
                {g.cells.map((c, j) => (
                  <span key={j} className="top5-tag" onClick={() => setSelectedCell(c)}>
                    {dayShort(c.day, lang)} {formatHour(c.hour)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily life tips with expandable facts */}
      <LifeTips lifeTips={lifeTips} lang={lang} tl={tl} totalDays={totalDays} allCells={allCells} alerts={alerts} />

      {/* Detail panel on cell click */}
      {selectedCell && selectedCell.alerts.length > 0 && (
        <div className="heatmap-detail">
          <h3>{dayShort(selectedCell.day, lang)} {t("at_time", lang)} {formatHour(selectedCell.hour)} — {selectedCell.count} {plural(selectedCell.count)}</h3>
          <div className="detail-list">
            {selectedCell.alerts.slice(0, 20).map((a) => (
              <div key={a.id} className="detail-item">
                <span className="detail-time">{new Date(a.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}</span>
                <span className="detail-cities">{a.cities_en.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats summary at the bottom */}
      <div className="hm-stats-bar">
        <div className="hm-stat">
          <span className="hm-stat-value">{total}</span>
          <span className="hm-stat-label">{sl.totalAlerts}</span>
        </div>
        <div className="hm-stat">
          <span className="hm-stat-value">{totalDays} {sl.days}</span>
          <span className="hm-stat-label">{sl.period}</span>
        </div>
        <div className="hm-stat">
          <span className="hm-stat-value">{avg}</span>
          <span className="hm-stat-label">{sl.avgDay}</span>
        </div>
      </div>
    </div>
  );
}
