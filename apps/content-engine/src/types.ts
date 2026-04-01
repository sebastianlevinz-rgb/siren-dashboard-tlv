export interface ReelScene {
  type: "intro" | "big-number" | "comparison" | "heatmap" | "timeline" | "region-breakdown" | "trend" | "fact" | "outro" | "stat-card";
  durationInFrames: number;
  props: Record<string, unknown>;
}

export interface ReelConfig {
  id: string;
  title: string;
  scenes: ReelScene[];
  narrationTemplate: string;
}

export interface ReelData {
  daysOfWar: number;
  totalAlerts: number;
  avgPerDay: number;
  todayAlerts: number;
  yesterdayAlerts: number;
  todayVsYesterday: number;
  mostAlertsDay: { date: string; count: number };
  fewestAlertsDay: { date: string; count: number };
  longestCalmHours: number;
  missiles: number;
  drones: number;
  missilesPct: number;
  regions: { name: string; count: number; pct: number }[];
  thisWeekTotal: number;
  lastWeekTotal: number;
  weekChange: number;
  weekNumber: number;
  peakHour: number;
  quietestHourStart: number;
  nightPctMissiles: number;
  dayPctMissiles: number;
  shabatAvg: number;
  weekdayAvg: number;
  latestEvent: { date: string; title: string; before: number; after: number; changePct: number } | null;
  dailyCounts: number[];
}
