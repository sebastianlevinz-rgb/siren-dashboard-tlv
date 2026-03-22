import type { Alert } from "../types";

/**
 * Parse the pivot CSV (from Google Sheets published CSV or local file).
 * Format: Fecha,Dia,Total,Misiles,Drones,00:00,01:00,...,23:00
 *
 * Each row becomes multiple Alert objects (one per hour with count > 0).
 */

const DAY_MAP: Record<string, number> = {
  Dom: 0, Lun: 1, Mar: 2, Mie: 3, Jue: 4, Vie: 5, Sab: 6,
};

export function parsePivotCSV(csv: string): Alert[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const alerts: Alert[] = [];
  let id = 1;

  // Skip header, skip TOTAL row
  for (let row = 1; row < lines.length; row++) {
    const cols = lines[row].split(",");
    const date = cols[0]?.trim();
    if (!date || date === "TOTAL") continue;

    const dayName = cols[1]?.trim() || "";
    const dayOfWeek = DAY_MAP[dayName] ?? new Date(date + "T12:00:00+02:00").getDay();
    const totalMissiles = parseInt(cols[3]) || 0;
    const totalDrones = parseInt(cols[4]) || 0;
    const totalAlerts = totalMissiles + totalDrones;

    // Hours start at column 5
    for (let h = 0; h < 24; h++) {
      const count = parseInt(cols[5 + h]) || 0;
      if (count === 0) continue;

      // Distribute missiles vs drones proportionally
      const missileFraction = totalAlerts > 0 ? totalMissiles / totalAlerts : 0.65;

      for (let i = 0; i < count; i++) {
        const isMissile = i < Math.round(count * missileFraction);
        const minute = Math.floor((i / count) * 50) + 5; // spread across the hour

        alerts.push({
          id: `sheet-${String(id++).padStart(5, "0")}`,
          timestamp: `${date}T${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+02:00`,
          unix: Math.floor(new Date(`${date}T${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+02:00`).getTime() / 1000),
          cities: [],
          cities_en: ["Tel Aviv / Gush Dan"],
          threat: isMissile ? "missiles" : "hostile_aircraft",
          threat_code: isMissile ? 0 : 5,
          isDrill: false,
          day_of_week: dayOfWeek,
          hour: h,
          date,
        });
      }
    }
  }

  alerts.sort((a, b) => a.unix - b.unix);
  return alerts;
}

/**
 * Fetch alerts from a Google Sheets published CSV URL.
 * The URL should be the "Publish to web" CSV link.
 */
export async function fetchFromGoogleSheet(url: string): Promise<Alert[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
  const csv = await res.text();
  return parsePivotCSV(csv);
}

/**
 * Fetch alerts from local CSV file.
 */
export async function fetchFromLocalCSV(): Promise<Alert[]> {
  const res = await fetch("/data/alerts-by-day-hour.csv");
  if (!res.ok) throw new Error("No local CSV found");
  const csv = await res.text();
  return parsePivotCSV(csv);
}
