/**
 * Process real Tzofar Telegram data into dashboard format.
 * Source: tzofar_daily_hourly.csv (already aggregated by day/hour with TLV columns)
 */

const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "Tzofar Telegram", "tzofar_daily_hourly.csv");
const raw = fs.readFileSync(src, "utf-8");
const lines = raw.trim().split("\n");
const header = lines[0].split(",");
const cols = {};
header.forEach((h, i) => { cols[h.trim()] = i; });

console.log("=== TZOFAR REAL DATA ===\n");

const days = [];
let totalAlerts = 0, totalTLV = 0, totalRocket = 0;

for (let i = 1; i < lines.length; i++) {
  const p = lines[i].split(",");
  const fecha = p[cols["Fecha"]];
  const dia = p[cols["Dia"]];
  const total = parseInt(p[cols["Total_Alertas"]]) || 0;
  const rocket = parseInt(p[cols["Rocket_Missile"]]) || 0;
  const aircraft = parseInt(p[cols["Hostile_Aircraft"]]) || 0;
  const tlv = parseInt(p[cols["Alertas_TLV"]]) || 0;

  // TLV hourly distribution
  const tlvHours = [];
  for (let h = 0; h < 24; h++) {
    tlvHours.push(parseInt(p[cols["H" + String(h).padStart(2, "0") + "_TLV"]]) || 0);
  }

  // Rocket hourly distribution (for type split)
  const rocketHours = [];
  for (let h = 0; h < 24; h++) {
    rocketHours.push(parseInt(p[cols["H" + String(h).padStart(2, "0") + "_rocket"]]) || 0);
  }

  const tlvHourSum = tlvHours.reduce((a, b) => a + b, 0);

  days.push({ fecha, dia, total, rocket, aircraft, tlv, tlvHours, rocketHours, tlvHourSum });
  totalAlerts += total;
  totalTLV += tlv;
  totalRocket += rocket;
}

// Print summary
console.log(`Dias: ${days.length}`);
console.log(`Total alertas (todas zonas): ${totalAlerts}`);
console.log(`TLV alertas: ${totalTLV} (${(totalTLV/totalAlerts*100).toFixed(1)}%)`);
console.log(`Rocket/Missile: ${totalRocket}`);

// Madrugada check
console.log("\n=== MADRUGADA TLV (00-05) ===");
for (const d of days) {
  const night = d.tlvHours.slice(0, 6);
  const nightSum = night.reduce((a, b) => a + b, 0);
  if (nightSum > 0) {
    console.log(`${d.fecha}: ${night.join(",")} = ${nightSum} alertas`);
  }
}

const totalNight = days.reduce((a, d) => a + d.tlvHours.slice(0, 6).reduce((x, y) => x + y, 0), 0);
console.log(`Total madrugada TLV: ${totalNight}`);

// Hourly totals
console.log("\n=== TOTAL TLV POR HORA ===");
for (let h = 0; h < 24; h++) {
  const sum = days.reduce((a, d) => a + d.tlvHours[h], 0);
  const bar = "#".repeat(sum);
  console.log(`${String(h).padStart(2, "0")}:00  ${String(sum).padStart(3)} ${bar}`);
}

// Write dashboard CSV
let csv = "Fecha,Dia,Total,Misiles,Drones";
for (let h = 0; h < 24; h++) csv += "," + String(h).padStart(2, "0") + ":00";
csv += "\n";

for (const d of days) {
  // For TLV: estimate missile vs drone from overall ratio that day
  const rocketRatio = d.total > 0 ? d.rocket / d.total : 0.7;
  const missiles = Math.round(d.tlvHourSum * rocketRatio);
  const drones = d.tlvHourSum - missiles;

  csv += `${d.fecha},${d.dia},${d.tlvHourSum},${missiles},${drones}`;
  for (let h = 0; h < 24; h++) csv += "," + d.tlvHours[h];
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
    const count = d.tlvHours[h];
    for (let i = 0; i < count; i++) {
      // Use rocket hours data for accurate type split
      const rocketInHour = d.rocketHours[h] || 0;
      const totalInHour = d.tlvHours[h] || 1;
      const isMissile = i < Math.round(count * (rocketInHour / Math.max(totalInHour, rocketInHour, 1)));

      const minute = count > 1 ? Math.floor((i / count) * 50) + 5 : 30;
      const ts = `${d.fecha}T${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+02:00`;

      alerts.push({
        id: `tz-${String(id++).padStart(5, "0")}`,
        timestamp: ts,
        unix: Math.floor(new Date(ts).getTime() / 1000),
        cities: [],
        cities_en: ["Tel Aviv / Gush Dan"],
        threat: isMissile ? "missiles" : "hostile_aircraft",
        threat_code: isMissile ? 0 : 5,
        isDrill: false,
        day_of_week: dow,
        hour: h,
        date: d.fecha,
      });
    }
  }
}
alerts.sort((a, b) => a.unix - b.unix);
fs.writeFileSync(
  path.join(__dirname, "..", "public", "data", "alerts.json"),
  JSON.stringify(alerts, null, 2)
);
console.log(`JSON: ${alerts.length} alertas TLV guardadas`);
