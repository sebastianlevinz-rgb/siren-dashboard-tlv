import type { Alert, HeatmapCell, DailySummary, HourlyDistribution } from "../types";

export const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
export const DAY_NAMES_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

export function buildHeatmap(alerts: Alert[]): HeatmapCell[][] {
  const grid: HeatmapCell[][] = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      count: 0,
      alerts: [],
    }))
  );

  for (const alert of alerts) {
    const cell = grid[alert.day_of_week][alert.hour];
    cell.count++;
    cell.alerts.push(alert);
  }

  return grid;
}

export function buildDailySummaries(alerts: Alert[]): DailySummary[] {
  const byDate = new Map<string, Alert[]>();

  for (const alert of alerts) {
    const existing = byDate.get(alert.date) || [];
    existing.push(alert);
    byDate.set(alert.date, existing);
  }

  return Array.from(byDate.entries())
    .map(([date, dayAlerts]) => ({
      date,
      count: dayAlerts.length,
      missiles: dayAlerts.filter((a) => a.threat === "missiles").length,
      hostile_aircraft: dayAlerts.filter((a) => a.threat === "hostile_aircraft").length,
      alerts: dayAlerts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildHourlyDistribution(alerts: Alert[]): HourlyDistribution[] {
  const counts = new Array(24).fill(0);
  for (const alert of alerts) {
    counts[alert.hour]++;
  }

  const total = alerts.length || 1;
  const maxCount = Math.max(...counts);

  return counts.map((count, hour) => {
    const percentage = (count / total) * 100;
    const ratio = count / (maxCount || 1);
    let risk: HourlyDistribution["risk"];
    if (ratio >= 0.75) risk = "extreme";
    else if (ratio >= 0.5) risk = "high";
    else if (ratio >= 0.25) risk = "medium";
    else risk = "low";

    return { hour, count, percentage, risk };
  });
}

// Color scale: brighter at low end for better visibility
export function getRiskColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "#111b21";
  const ratio = value / max;

  if (ratio < 0.1) return "#1b5e4a";  // visible teal (was too dark before)
  if (ratio < 0.2) return "#25795a";  // brighter teal
  if (ratio < 0.35) return "#3d8b37"; // green
  if (ratio < 0.5) return "#7da032";  // yellow-green
  if (ratio < 0.65) return "#b8a02e"; // yellow
  if (ratio < 0.8) return "#d4822a";  // orange
  if (ratio < 0.9) return "#c93d3d";  // red
  return "#8b1a1a";                    // dark red
}

export function getRiskLevel(ratio: number): string {
  if (ratio >= 0.75) return "EXTREME";
  if (ratio >= 0.5) return "HIGH";
  if (ratio >= 0.25) return "MEDIUM";
  return "LOW";
}

export function getRiskBadgeColor(risk: string): string {
  switch (risk) {
    case "EXTREME":
      return "#c93d3d";
    case "HIGH":
      return "#d4822a";
    case "MEDIUM":
      return "#b8a02e";
    default:
      return "#1a6b4a";
  }
}

export function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

export function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

export function movingAverage(data: number[], window: number): number[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

/** Count how many times each day-of-week appears in the date range covered by alerts */
export function getDayOfWeekOccurrences(alerts: Alert[]): number[] {
  const dates = [...new Set(alerts.map(a => a.date))].sort();
  if (dates.length === 0) return new Array(7).fill(1);
  const first = new Date(dates[0] + "T12:00:00+02:00");
  const last = new Date(dates[dates.length - 1] + "T12:00:00+02:00");
  const totalDays = Math.round((last.getTime() - first.getTime()) / 86400000) + 1;
  const counts = new Array(7).fill(0);
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(first.getTime() + i * 86400000);
    counts[d.getDay()]++;
  }
  return counts;
}

export function getRecommendations(alerts: Alert[]): {
  bestHour: { hour: number; percentage: number };
  worstHour: { hour: number; percentage: number };
  trend: "up" | "down" | "stable";
  trendValue: number;
  avgDaily: number;
} {
  const hourly = buildHourlyDistribution(alerts);
  const daily = buildDailySummaries(alerts);

  const sorted = [...hourly].sort((a, b) => a.count - b.count);
  const bestHour = sorted[0];
  const worstHour = sorted[sorted.length - 1];

  const last3 = daily.slice(-3);
  const prev3 = daily.slice(-6, -3);

  const avgLast3 = last3.reduce((a, d) => a + d.count, 0) / (last3.length || 1);
  const avgPrev3 = prev3.reduce((a, d) => a + d.count, 0) / (prev3.length || 1);

  const trendValue = avgPrev3 > 0 ? ((avgLast3 - avgPrev3) / avgPrev3) * 100 : 0;
  let trend: "up" | "down" | "stable";
  if (trendValue > 10) trend = "up";
  else if (trendValue < -10) trend = "down";
  else trend = "stable";

  const avgDaily = alerts.length / (daily.length || 1);

  return {
    bestHour: { hour: bestHour.hour, percentage: bestHour.percentage },
    worstHour: { hour: worstHour.hour, percentage: worstHour.percentage },
    trend,
    trendValue,
    avgDaily,
  };
}
