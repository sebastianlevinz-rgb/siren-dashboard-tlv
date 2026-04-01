/**
 * Import historical alerts from the Telegram HTML exports into SQLite.
 * This bootstraps the database with all data from Feb 28 onwards.
 *
 * Usage: npx tsx src/import-telegram.ts
 */

import fs from "fs";
import path from "path";
import { initDB, insertAlert, getAlertCount } from "./db.js";

function log(msg: string) {
  console.log(`[Import] ${msg}`);
}

// Import from the existing alerts.json that was parsed from Telegram
function importFromAlertsJson(): void {
  const alertsPath = path.join(import.meta.dirname, "..", "..", "..", "apps", "missile-probability", "public", "data", "alerts.json");

  if (!fs.existsSync(alertsPath)) {
    log("alerts.json not found at " + alertsPath);
    return;
  }

  const alerts = JSON.parse(fs.readFileSync(alertsPath, "utf8")) as {
    id: string; timestamp: string; date: string; hour: number; day_of_week: number;
    threat: string; regions: string[]; cities_en: string[];
  }[];

  log(`Found ${alerts.length} alerts in alerts.json`);

  let imported = 0;
  for (const a of alerts) {
    const inserted = insertAlert({
      datetime: a.timestamp,
      date: a.date,
      time: a.timestamp.split("T")[1]?.slice(0, 8) || "00:00:00",
      hour: a.hour,
      day_of_week: a.day_of_week,
      threat: a.threat as "missiles" | "hostile_aircraft" | "unknown",
      regions: a.regions,
      cities_he: a.cities_en, // They're actually transliterated, but close enough
      oref_id: a.id,
      raw_cat: a.threat === "missiles" ? "1" : "2",
    });
    if (inserted) imported++;
  }

  log(`Imported ${imported} new alerts (${alerts.length - imported} already existed)`);
  log(`Total in DB: ${getAlertCount()}`);
}

// Main
initDB();
importFromAlertsJson();
