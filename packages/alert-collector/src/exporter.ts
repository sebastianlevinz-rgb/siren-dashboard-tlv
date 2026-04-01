/**
 * Export alerts from SQLite to JSON files consumed by the apps.
 */

import fs from "fs";
import path from "path";
import { CONFIG } from "../config.js";
import { getAllAlerts, getAlertCount } from "./db.js";

function log(msg: string) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(`[${ts}] Export: ${msg}`);
}

export function exportAll(): void {
  const alerts = getAllAlerts();
  log(`Exporting ${alerts.length} alerts...`);

  // Build the JSON format that apps expect
  const appAlerts = alerts.map((a, i) => ({
    id: `oref-${String(i + 1).padStart(5, "0")}`,
    timestamp: a.datetime,
    unix: Math.floor(new Date(a.datetime).getTime() / 1000),
    cities: a.cities_he,
    cities_en: a.cities_he, // Hebrew names (translation would need a map)
    threat: a.threat,
    threat_code: a.threat === "missiles" ? 0 : a.threat === "hostile_aircraft" ? 5 : 99,
    isDrill: false,
    day_of_week: a.day_of_week,
    hour: a.hour,
    date: a.date,
    regions: a.regions,
  }));

  // Ensure output directories exist
  for (const dir of [CONFIG.SHARED_DATA_PATH, CONFIG.MP_DATA_PATH, CONFIG.WD_DATA_PATH]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const jsonStr = JSON.stringify(appAlerts, null, 2);

  // Write to all locations
  const targets = [
    path.join(CONFIG.SHARED_DATA_PATH, "alerts.json"),
    path.join(CONFIG.MP_DATA_PATH, "alerts.json"),
    path.join(CONFIG.WD_DATA_PATH, "alerts.json"),
  ];

  for (const target of targets) {
    fs.writeFileSync(target, jsonStr, "utf8");
  }

  log(`Wrote ${appAlerts.length} alerts to ${targets.length} locations`);

  // Also write a stats summary
  const stats = buildStats(appAlerts);
  const statsStr = JSON.stringify(stats, null, 2);
  fs.writeFileSync(path.join(CONFIG.SHARED_DATA_PATH, "stats.json"), statsStr, "utf8");
  log("Wrote stats.json");
}

function buildStats(alerts: { date: string; threat: string; hour: number; regions: string[] }[]) {
  const byDate: Record<string, number> = {};
  for (const a of alerts) byDate[a.date] = (byDate[a.date] || 0) + 1;
  const dates = Object.keys(byDate).sort();

  const totalDays = dates.length;
  const totalAlerts = alerts.length;
  const avgPerDay = totalDays > 0 ? totalAlerts / totalDays : 0;
  const deadliest = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];

  const byRegion: Record<string, number> = {};
  for (const a of alerts) {
    for (const r of a.regions) byRegion[r] = (byRegion[r] || 0) + 1;
  }

  const byHour = new Array(24).fill(0);
  for (const a of alerts) byHour[a.hour]++;

  return {
    lastUpdated: new Date().toISOString(),
    totalAlerts,
    totalDays,
    avgPerDay: Math.round(avgPerDay * 10) / 10,
    dateRange: { start: dates[0], end: dates[dates.length - 1] },
    deadliestDay: deadliest ? { date: deadliest[0], count: deadliest[1] } : null,
    missiles: alerts.filter(a => a.threat === "missiles").length,
    drones: alerts.filter(a => a.threat === "hostile_aircraft").length,
    byRegion,
    byHour,
  };
}
