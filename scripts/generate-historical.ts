/**
 * Generate historical alert data based on real statistics from the
 * Iran-Israel conflict starting Feb 28, 2026.
 *
 * Sources: Alma Center daily wave counts, Tzofar hourly distribution,
 * Al Jazeera analysis, ACLED geographic distribution.
 */

import { writeFileSync } from "fs";
import { join } from "path";

// --- Real data from user's research ---

// Daily wave counts (source: Alma Center)
const dailyWaves: Record<string, number> = {
  "2026-02-28": 44,
  "2026-03-01": 55,
  "2026-03-02": 18,
  "2026-03-03": 15,
  "2026-03-04": 13,
  "2026-03-05": 11,
  "2026-03-06": 7,
  "2026-03-07": 12,
  "2026-03-08": 10,
  "2026-03-09": 12,
  "2026-03-10": 10,
  "2026-03-11": 10,
  "2026-03-12": 10,
  "2026-03-13": 10,
  "2026-03-14": 12,
  "2026-03-15": 10,
  "2026-03-16": 12,
  "2026-03-17": 12,
  "2026-03-18": 11,
  "2026-03-19": 13,
  "2026-03-20": 19,
  "2026-03-21": 18,
  "2026-03-22": 15, // estimate for today
};

// Hourly distribution weights (source: Tzofar/Al Jazeera analysis)
// Peak at 12:00, secondary peaks at 7, 14, 15. Quiet 2-6 AM.
const hourlyWeights: number[] = [
  2.5, // 00
  1.5, // 01
  0.5, // 02
  0.3, // 03
  0.3, // 04
  0.5, // 05
  2.0, // 06
  5.0, // 07 - secondary peak
  4.0, // 08
  4.5, // 09
  5.5, // 10
  7.0, // 11
  10.0, // 12 - PRIMARY PEAK
  6.0, // 13
  8.0, // 14 - secondary peak
  7.5, // 15 - secondary peak
  5.0, // 16
  4.0, // 17
  5.0, // 18
  5.5, // 19
  6.0, // 20
  5.0, // 21
  4.0, // 22
  3.0, // 23
];

// Normalize hourly weights to probabilities
const totalWeight = hourlyWeights.reduce((a, b) => a + b, 0);
const hourlyProbs = hourlyWeights.map((w) => w / totalWeight);

// Geographic distribution for Tel Aviv area (39% of all alerts)
// Within Tel Aviv/Gush Dan area:
const gushDanCities = [
  { name_he: "תל אביב - מרכז העיר", name_en: "Tel Aviv - City Center", weight: 20 },
  { name_he: "תל אביב - יפו", name_en: "Tel Aviv - Yafo", weight: 12 },
  { name_he: "תל אביב - דרום", name_en: "Tel Aviv - South", weight: 8 },
  { name_he: "תל אביב - צפון", name_en: "Tel Aviv - North", weight: 10 },
  { name_he: "רמת גן", name_en: "Ramat Gan", weight: 10 },
  { name_he: "בני ברק", name_en: "Bnei Brak", weight: 8 },
  { name_he: "גבעתיים", name_en: "Givatayim", weight: 7 },
  { name_he: "חולון", name_en: "Holon", weight: 8 },
  { name_he: "בת ים", name_en: "Bat Yam", weight: 6 },
  { name_he: "פתח תקווה", name_en: "Petah Tikva", weight: 6 },
  { name_he: "ראשון לציון", name_en: "Rishon LeZion", weight: 5 },
];

const totalCityWeight = gushDanCities.reduce((a, c) => a + c.weight, 0);

// Threat types
const threats = [
  { type: "missiles", threat_code: 0, weight: 65 },
  { type: "hostile_aircraft", threat_code: 5, weight: 35 },
];

interface Alert {
  id: string;
  timestamp: string;
  unix: number;
  cities: string[];
  cities_en: string[];
  threat: string;
  threat_code: number;
  isDrill: false;
  day_of_week: number;
  hour: number;
  date: string;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function weightedPick<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickCities(rand: () => number): { he: string[]; en: string[] } {
  // Each alert hits 2-6 cities in the area
  const count = Math.floor(rand() * 5) + 2;
  const picked = new Set<number>();
  const he: string[] = [];
  const en: string[] = [];

  while (picked.size < count && picked.size < gushDanCities.length) {
    const idx = weightedPick(
      gushDanCities.map((_, i) => i),
      gushDanCities.map((c) => c.weight),
      rand
    );
    if (!picked.has(idx)) {
      picked.add(idx);
      he.push(gushDanCities[idx].name_he);
      en.push(gushDanCities[idx].name_en);
    }
  }
  return { he, en };
}

function generateAlerts(): Alert[] {
  const rand = seededRandom(42);
  const alerts: Alert[] = [];
  let id = 1;

  const sortedDates = Object.keys(dailyWaves).sort();

  for (const dateStr of sortedDates) {
    const waves = dailyWaves[dateStr];
    // Tel Aviv gets ~39% of all waves
    const tlvAlerts = Math.round(waves * 0.39);

    // Distribute alerts across hours using hourly weights
    for (let a = 0; a < tlvAlerts; a++) {
      // Pick hour based on weights
      const hour = weightedPick(
        Array.from({ length: 24 }, (_, i) => i),
        hourlyWeights,
        rand
      );

      // Random minute and second
      const minute = Math.floor(rand() * 60);
      const second = Math.floor(rand() * 60);

      // Build timestamp
      const dt = new Date(`${dateStr}T00:00:00+02:00`);
      dt.setHours(hour, minute, second);

      const { he, en } = pickCities(rand);

      // Pick threat type
      const threat = weightedPick(
        threats,
        threats.map((t) => t.weight),
        rand
      );

      const dayOfWeek = dt.getDay(); // 0=Sunday (Israeli work week starts Sunday)

      alerts.push({
        id: `hist-${String(id++).padStart(5, "0")}`,
        timestamp: dt.toISOString(),
        unix: Math.floor(dt.getTime() / 1000),
        cities: he,
        cities_en: en,
        threat: threat.type,
        threat_code: threat.threat_code,
        isDrill: false,
        day_of_week: dayOfWeek,
        hour,
        date: dateStr,
      });
    }
  }

  // Sort by timestamp
  alerts.sort((a, b) => a.unix - b.unix);
  return alerts;
}

const alerts = generateAlerts();

const outputPath = join(__dirname, "..", "data", "alerts.json");
writeFileSync(outputPath, JSON.stringify(alerts, null, 2), "utf-8");

console.log(`Generated ${alerts.length} alerts across ${Object.keys(dailyWaves).length} days`);
console.log(`Date range: ${alerts[0].date} to ${alerts[alerts.length - 1].date}`);
console.log(`Saved to ${outputPath}`);

// Also generate summary stats
const stats = {
  total_alerts: alerts.length,
  date_range: { from: alerts[0].date, to: alerts[alerts.length - 1].date },
  total_days: Object.keys(dailyWaves).length,
  by_threat: {
    missiles: alerts.filter((a) => a.threat === "missiles").length,
    hostile_aircraft: alerts.filter((a) => a.threat === "hostile_aircraft").length,
  },
  source: "generated_from_alma_center_and_tzofar_statistics",
  generated_at: new Date().toISOString(),
};

const statsPath = join(__dirname, "..", "data", "stats.json");
writeFileSync(statsPath, JSON.stringify(stats, null, 2), "utf-8");
console.log("\nStats:", JSON.stringify(stats, null, 2));
