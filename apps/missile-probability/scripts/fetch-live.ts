/**
 * Fetch live alert data from Tzofar API and Oref API.
 * Appends new alerts to data/alerts.json.
 * Run from Israel (Oref is geo-blocked outside IL).
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import https from "https";

const DATA_PATH = join(__dirname, "..", "data", "alerts.json");

// Gush Dan cities to filter for
const GUSH_DAN_KEYWORDS = [
  "תל אביב",
  "רמת גן",
  "בני ברק",
  "גבעתיים",
  "חולון",
  "בת ים",
  "פתח תקווה",
  "ראשון לציון",
  "הרצליה",
  "גבעת שמואל",
  "קרית אונו",
  "אור יהודה",
  "יהוד",
  "Tel Aviv",
  "Ramat Gan",
  "Bnei Brak",
];

// City name translations
const CITY_TRANSLATIONS: Record<string, string> = {
  "תל אביב - מרכז העיר": "Tel Aviv - City Center",
  "תל אביב - יפו": "Tel Aviv - Yafo",
  "תל אביב - דרום העיר": "Tel Aviv - South",
  "תל אביב - צפון העיר": "Tel Aviv - North",
  "תל אביב - עבר הירקון": "Tel Aviv - North (Yarkon)",
  "רמת גן - מערב": "Ramat Gan - West",
  "רמת גן - מזרח": "Ramat Gan - East",
  "רמת גן": "Ramat Gan",
  "בני ברק": "Bnei Brak",
  "גבעתיים": "Givatayim",
  "חולון": "Holon",
  "בת ים": "Bat Yam",
  "פתח תקווה": "Petah Tikva",
  "ראשון לציון": "Rishon LeZion",
  "הרצליה": "Herzliya",
  "גבעת שמואל": "Givat Shmuel",
  "קרית אונו": "Kiryat Ono",
  "אור יהודה": "Or Yehuda",
  "יהוד": "Yehud",
};

const THREAT_MAP: Record<number, string> = {
  0: "missiles",
  1: "missiles",
  5: "hostile_aircraft",
};

function translateCity(he: string): string {
  return CITY_TRANSLATIONS[he] || he;
}

function isGushDan(city: string): boolean {
  return GUSH_DAN_KEYWORDS.some((kw) => city.includes(kw));
}

function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "SirenDashboard/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Failed to parse JSON from ${url}: ${data.substring(0, 200)}`));
          }
        });
      })
      .on("error", reject);
  });
}

interface ExistingAlert {
  id: string;
  unix: number;
  [key: string]: any;
}

async function fetchTzofar(): Promise<ExistingAlert[]> {
  console.log("Fetching from Tzofar API...");
  try {
    const data = await fetchJSON("https://api.tzevaadom.co.il/alerts-history");
    const alerts: ExistingAlert[] = [];

    for (const group of data) {
      for (const alert of group.alerts) {
        const gushDanCities = alert.cities.filter(isGushDan);
        if (gushDanCities.length === 0) continue;

        const dt = new Date(alert.time * 1000);
        const dateStr = dt.toISOString().split("T")[0];

        alerts.push({
          id: `tzofar-${group.id}-${alert.time}`,
          timestamp: dt.toISOString(),
          unix: alert.time,
          cities: gushDanCities,
          cities_en: gushDanCities.map(translateCity),
          threat: THREAT_MAP[alert.threat] || "unknown",
          threat_code: alert.threat,
          isDrill: alert.isDrill,
          day_of_week: dt.getDay(),
          hour: dt.getHours(),
          date: dateStr,
        });
      }
    }

    console.log(`  Tzofar: ${alerts.length} Gush Dan alerts from ${data.length} groups`);
    return alerts;
  } catch (e: any) {
    console.error(`  Tzofar error: ${e.message}`);
    return [];
  }
}

async function fetchOref(): Promise<ExistingAlert[]> {
  console.log("Fetching from Oref API (requires Israeli IP)...");
  try {
    const data = await fetchJSON(
      "https://www.oref.org.il/WarningMessages/alert/History/AlertsHistory.json"
    );
    const alerts: ExistingAlert[] = [];

    for (const entry of data) {
      const cities = entry.data.split(",").map((s: string) => s.trim());
      const gushDanCities = cities.filter(isGushDan);
      if (gushDanCities.length === 0) continue;

      const dt = new Date(entry.alertDate.replace(" ", "T") + "+02:00");
      const dateStr = dt.toISOString().split("T")[0];

      // category 1 = missiles, 2 = hostile aircraft, 13 = event ended
      const threat =
        entry.category === 1
          ? "missiles"
          : entry.category === 2
          ? "hostile_aircraft"
          : "other";

      if (threat === "other") continue;

      alerts.push({
        id: `oref-${dt.getTime()}`,
        timestamp: dt.toISOString(),
        unix: Math.floor(dt.getTime() / 1000),
        cities: gushDanCities,
        cities_en: gushDanCities.map(translateCity),
        threat,
        threat_code: entry.category,
        isDrill: false,
        day_of_week: dt.getDay(),
        hour: dt.getHours(),
        date: dateStr,
      });
    }

    console.log(`  Oref: ${alerts.length} Gush Dan alerts`);
    return alerts;
  } catch (e: any) {
    console.error(`  Oref error: ${e.message} (geo-blocked outside Israel?)`);
    return [];
  }
}

async function main() {
  // Load existing data
  let existing: ExistingAlert[] = [];
  if (existsSync(DATA_PATH)) {
    existing = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
    console.log(`Loaded ${existing.length} existing alerts`);
  }

  const existingIds = new Set(existing.map((a) => a.id));
  const existingUnix = new Set(existing.map((a) => a.unix));

  // Fetch from both sources
  const [tzofar, oref] = await Promise.all([fetchTzofar(), fetchOref()]);

  const newAlerts = [...tzofar, ...oref].filter(
    (a) => !existingIds.has(a.id) && !existingUnix.has(a.unix)
  );

  if (newAlerts.length === 0) {
    console.log("\nNo new Gush Dan alerts found.");
    return;
  }

  // Merge and sort
  const merged = [...existing, ...newAlerts].sort((a, b) => a.unix - b.unix);

  writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`\nAdded ${newAlerts.length} new alerts. Total: ${merged.length}`);
}

main().catch(console.error);
