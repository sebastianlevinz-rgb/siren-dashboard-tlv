/**
 * Process real Tzofar Telegram data (strict Gush Dan filter) into dashboard format.
 * Source: tzofar_daily_hourly_strict.csv
 */

const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "Tzofar Telegram", "tzofar_daily_hourly_strict.csv");
const raw = fs.readFileSync(src, "utf-8");
const lines = raw.trim().split("\n");
const header = lines[0].split(",");
const cols = {};
header.forEach((h, i) => { cols[h.trim()] = i; });

console.log("Columns:", Object.keys(cols).join(", "));
console.log("");

const days = [];
let totalAll = 0, totalDan = 0, totalRocket = 0;

for (let i = 1; i < lines.length; i++) {
  const p = lines[i].split(",");
  const fecha = p[cols["Fecha"]];
  const dia = p[cols["Dia"]];
  const total = parseInt(p[cols["Total_Eventos"]]) || 0;
  const rocket = parseInt(p[cols["Rocket_Missile"]]) || 0;
  const aircraft = parseInt(p[cols["Hostile_Aircraft"]]) || 0;
  const dan = parseInt(p[cols["Eventos_Dan"]]) || 0;

  // Dan rocket hourly distribution
  const danRocketHours = [];
  for (let h = 0; h < 24; h++) {
    const col = "H" + String(h).padStart(2, "0") + "_Dan_rocket";
    danRocketHours.push(parseInt(p[cols[col]]) || 0);
  }

  const danHourSum = danRocketHours.reduce((a, b) => a + b, 0);

  days.push({ fecha, dia, total, rocket, aircraft, dan, danRocketHours, danHourSum });
  totalAll += total;
  totalDan += dan;
  totalRocket += rocket;
}

console.log(`=== TZOFAR GUSH DAN (STRICT) ===`);
console.log(`Dias: ${days.length}`);
console.log(`Total eventos (todas zonas): ${totalAll}`);
console.log(`Eventos Gush Dan: ${totalDan} (${(totalDan/totalAll*100).toFixed(1)}%)`);
console.log(`Rockets totales: ${totalRocket}`);

const totalDanRockets = days.reduce((a, d) => a + d.danHourSum, 0);
console.log(`Dan rockets (hourly sum): ${totalDanRockets}`);

// Madrugada
const nightTotal = days.reduce((a, d) => a + d.danRocketHours.slice(0, 6).reduce((x, y) => x + y, 0), 0);
console.log(`Madrugada Dan rockets (00-05): ${nightTotal}`);

// Hourly totals
console.log("\n=== DAN ROCKETS POR HORA ===");
for (let h = 0; h < 24; h++) {
  const sum = days.reduce((a, d) => a + d.danRocketHours[h], 0);
  const bar = "#".repeat(sum);
  console.log(`${String(h).padStart(2, "0")}:00  ${String(sum).padStart(3)} ${bar}`);
}

// Write dashboard CSV — using Dan rocket hours as the alert count
let csv = "Fecha,Dia,Total,Misiles,Drones";
for (let h = 0; h < 24; h++) csv += "," + String(h).padStart(2, "0") + ":00";
csv += "\n";

for (const d of days) {
  const rocketRatio = d.total > 0 ? d.rocket / d.total : 0.7;
  const missiles = Math.round(d.danHourSum * rocketRatio);
  const drones = d.danHourSum - missiles;

  csv += `${d.fecha},${d.dia},${d.danHourSum},${missiles},${drones}`;
  for (let h = 0; h < 24; h++) csv += "," + d.danRocketHours[h];
  csv += "\n";
}
fs.writeFileSync(path.join(__dirname, "..", "public", "data", "alerts-by-day-hour.csv"), csv);
console.log("\nCSV guardado");

// Write alerts.json
const dayMap = { Dom: 0, Lun: 1, Mar: 2, Mie: 3, Jue: 4, Vie: 5, Sab: 6 };
const alerts = [];
let id = 1;
for (const d of days) {
  const dow = dayMap[d.dia] ?? new Date(d.fecha + "T12:00:00+02:00").getDay();
  const rocketRatio = d.total > 0 ? d.rocket / d.total : 0.7;

  for (let h = 0; h < 24; h++) {
    const count = d.danRocketHours[h];
    for (let i = 0; i < count; i++) {
      const isMissile = i < Math.round(count * rocketRatio);
      const minute = count > 1 ? Math.floor((i / count) * 50) + 5 : 30;
      const ts = `${d.fecha}T${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+02:00`;

      alerts.push({
        id: `tz-${String(id++).padStart(5, "0")}`,
        timestamp: ts,
        unix: Math.floor(new Date(ts).getTime() / 1000),
        cities: [], cities_en: ["Gush Dan"],
        threat: isMissile ? "missiles" : "hostile_aircraft",
        threat_code: isMissile ? 0 : 5,
        isDrill: false, day_of_week: dow, hour: h, date: d.fecha,
      });
    }
  }
}
alerts.sort((a, b) => a.unix - b.unix);
fs.writeFileSync(path.join(__dirname, "..", "public", "data", "alerts.json"), JSON.stringify(alerts, null, 2));
console.log(`JSON: ${alerts.length} alertas Gush Dan guardadas`);
