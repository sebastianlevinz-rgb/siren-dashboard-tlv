export interface Alert {
  id: string;
  timestamp: string;
  unix: number;
  cities: string[];
  cities_en: string[];
  threat: "missiles" | "hostile_aircraft" | "unknown";
  threat_code: number;
  isDrill: boolean;
  day_of_week: number; // 0=Sunday
  hour: number; // 0-23
  date: string; // YYYY-MM-DD
}

export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
  alerts: Alert[];
}

export interface DailySummary {
  date: string;
  count: number;
  missiles: number;
  hostile_aircraft: number;
  alerts: Alert[];
}

export interface HourlyDistribution {
  hour: number;
  count: number;
  percentage: number;
  risk: "low" | "medium" | "high" | "extreme";
}

export type ThemeMode = "dark" | "light";

export interface RoutineWindow {
  label: string;
  startHour: number;
  endHour: number;
}
