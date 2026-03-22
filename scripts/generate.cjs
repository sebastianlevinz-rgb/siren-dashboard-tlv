/**
 * Generate historical alert data based on real statistics.
 * Run with: node scripts/generate.cjs
 */

const { writeFileSync } = require("fs");
const { join } = require("path");

// Daily wave counts (source: Alma Center)
const dailyWaves = {
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
  "2026-03-22": 15,
};

// Hourly weights (source: Tzofar/Al Jazeera analysis)
const hourlyWeights = [
  2.5, 1.5, 0.5, 0.3, 0.3, 0.5, 2.0, 5.0, 4.0, 4.5, 5.5, 7.0,
  10.0, 6.0, 8.0, 7.5, 5.0, 4.0, 5.0, 5.5, 6.0, 5.0, 4.0, 3.0,
];

const gushDanCities = [
  { he: "\u05EA\u05DC \u05D0\u05D1\u05D9\u05D1 - \u05DE\u05E8\u05DB\u05D6 \u05D4\u05E2\u05D9\u05E8", en: "Tel Aviv - City Center", w: 20 },
  { he: "\u05EA\u05DC \u05D0\u05D1\u05D9\u05D1 - \u05D9\u05E4\u05D5", en: "Tel Aviv - Yafo", w: 12 },
  { he: "\u05EA\u05DC \u05D0\u05D1\u05D9\u05D1 - \u05D3\u05E8\u05D5\u05DD", en: "Tel Aviv - South", w: 8 },
  { he: "\u05EA\u05DC \u05D0\u05D1\u05D9\u05D1 - \u05E6\u05E4\u05D5\u05DF", en: "Tel Aviv - North", w: 10 },
  { he: "\u05E8\u05DE\u05EA \u05D2\u05DF", en: "Ramat Gan", w: 10 },
  { he: "\u05D1\u05E0\u05D9 \u05D1\u05E8\u05E7", en: "Bnei Brak", w: 8 },
  { he: "\u05D2\u05D1\u05E2\u05EA\u05D9\u05D9\u05DD", en: "Givatayim", w: 7 },
  { he: "\u05D7\u05D5\u05DC\u05D5\u05DF", en: "Holon", w: 8 },
  { he: "\u05D1\u05EA \u05D9\u05DD", en: "Bat Yam", w: 6 },
  { he: "\u05E4\u05EA\u05D7 \u05EA\u05E7\u05D5\u05D5\u05D4", en: "Petah Tikva", w: 6 },
  { he: "\u05E8\u05D0\u05E9\u05D5\u05DF \u05DC\u05E6\u05D9\u05D5\u05DF", en: "Rishon LeZion", w: 5 },
];

const threats = [
  { type: "missiles", code: 0, w: 65 },
  { type: "hostile_aircraft", code: 5, w: 35 },
];

// Seeded PRNG
let seed = 42;
function rand() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickCities() {
  const count = Math.floor(rand() * 5) + 2;
  const picked = new Set();
  const he = [];
  const en = [];
  const indices = gushDanCities.map((_, i) => i);
  const ws = gushDanCities.map((c) => c.w);

  while (picked.size < count && picked.size < gushDanCities.length) {
    const idx = weightedPick(indices, ws);
    if (!picked.has(idx)) {
      picked.add(idx);
      he.push(gushDanCities[idx].he);
      en.push(gushDanCities[idx].en);
    }
  }
  return { he, en };
}

const alerts = [];
let id = 1;
const sortedDates = Object.keys(dailyWaves).sort();

for (const dateStr of sortedDates) {
  const waves = dailyWaves[dateStr];
  const tlvAlerts = Math.round(waves * 0.39);

  for (let a = 0; a < tlvAlerts; a++) {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hour = weightedPick(hours, hourlyWeights);
    const minute = Math.floor(rand() * 60);
    const second = Math.floor(rand() * 60);

    // Parse date and build timestamp in Israel time (UTC+2)
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, hour - 2, minute, second));

    const { he, en } = pickCities();
    const threat = weightedPick(threats, threats.map((t) => t.w));

    alerts.push({
      id: `hist-${String(id++).padStart(5, "0")}`,
      timestamp: dt.toISOString(),
      unix: Math.floor(dt.getTime() / 1000),
      cities: he,
      cities_en: en,
      threat: threat.type,
      threat_code: threat.code,
      isDrill: false,
      day_of_week: new Date(dateStr + "T12:00:00+02:00").getDay(),
      hour,
      date: dateStr,
    });
  }
}

alerts.sort((a, b) => a.unix - b.unix);

// Write to public/data for Vite to serve
const outDir = join(__dirname, "..", "public", "data");
require("fs").mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, "alerts.json");
writeFileSync(outPath, JSON.stringify(alerts, null, 2), "utf-8");

console.log(`Generated ${alerts.length} alerts across ${sortedDates.length} days`);
console.log(`Date range: ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
console.log(`Missiles: ${alerts.filter((a) => a.threat === "missiles").length}`);
console.log(`Hostile aircraft: ${alerts.filter((a) => a.threat === "hostile_aircraft").length}`);
console.log(`Saved to ${outPath}`);
