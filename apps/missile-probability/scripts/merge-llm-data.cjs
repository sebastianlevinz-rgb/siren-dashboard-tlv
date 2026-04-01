/**
 * Merge 3 LLM datasets (Claude, Gemini, ChatGPT) into averaged data.
 * Uses ChatGPT as primary source for madrugada (00-05) since Claude/Gemini
 * under-reported nighttime alerts.
 * Run: node scripts/merge-llm-data.cjs
 */

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "Data llms 22 03");

function parseCSV(file) {
  const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
  const lines = raw.trim().split("\n");
  const header = lines[0].split(",");
  const cols = {};
  header.forEach((h, i) => { cols[h.trim()] = i; });

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = [];
    let current = "", inQ = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { parts.push(current); current = ""; continue; }
      current += ch;
    }
    parts.push(current);

    const fecha = parts[cols["Fecha"]]?.trim();
    if (!fecha || fecha === "TOTAL") continue;

    const hours = [];
    for (let h = 0; h < 24; h++) {
      hours.push(parseInt(parts[cols["H" + String(h).padStart(2, "0")]]) || 0);
    }

    rows.push({
      fecha,
      dia: parts[cols["Dia"]]?.trim(),
      total: parseInt(parts[cols["Oleadas_Iran_Total"]]) || 0,
      tlv: parseInt(parts[cols["Oleadas_TLV"]]) || 0,
      sur: parseInt(parts[cols["Oleadas_Sur"]]) || 0,
      norte: parseInt(parts[cols["Oleadas_Norte"]]) || 0,
      jerusalem: parseInt(parts[cols["Oleadas_Jerusalem"]]) || 0,
      muertos: parseInt(parts[cols["Muertos"]] || parts[cols["Muertos_Dia"]]) || 0,
      heridos: parseInt(parts[cols["Heridos"]] || parts[cols["Heridos_Dia"]]) || 0,
      hours,
    });
  }
  return rows;
}

const claude = parseCSV("iran_attacks_data - Claude Scrape 22.03 23hs.csv");
const gemini = parseCSV("iran_attacks_data - Gemini Scrape 22.03 23hs.csv");
const chatgpt = parseCSV("missileprobability_iran_israel_2026-02-28_to_2026-03-22 - CHATGPT.csv");

const allDates = [...new Set([...claude, ...gemini, ...chatgpt].map(r => r.fecha))].sort();
const merged = [];

for (const fecha of allDates) {
  const c = claude.find(r => r.fecha === fecha);
  const g = gemini.find(r => r.fecha === fecha);
  const p = chatgpt.find(r => r.fecha === fecha);
  const sources = [c, g, p].filter(Boolean);
  if (sources.length === 0) continue;

  const avg = (field) => Math.round(sources.reduce((a, s) => a + s[field], 0) / sources.length);

  // Hourly: use ChatGPT for madrugada (00-05), average for rest (06-23)
  const avgHours = [];
  for (let h = 0; h < 24; h++) {
    if (h < 6) {
      // ChatGPT is the only source that captured nighttime alerts
      avgHours.push(p ? p.hours[h] : 0);
    } else {
      const vals = sources.map(s => s.hours[h]);
      avgHours.push(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
    }
  }

  // Recalculate TLV to match hourly sum
  const hourSum = avgHours.reduce((a, b) => a + b, 0);

  merged.push({
    fecha,
    dia: (c || g || p).dia,
    total: avg("total"),
    tlv: hourSum, // match hourly data
    sur: avg("sur"),
    norte: avg("norte"),
    jerusalem: avg("jerusalem"),
    muertos: avg("muertos"),
    heridos: avg("heridos"),
    hours: avgHours,
  });
}

// Print summary
const totalOleadas = merged.reduce((a, r) => a + r.total, 0);
const totalTlv = merged.reduce((a, r) => a + r.tlv, 0);
console.log(`Merged: ${merged.length} days, ${totalOleadas} total waves, ${totalTlv} TLV waves`);
console.log(`Madrugada (00-05): ${merged.reduce((a,r) => a + r.hours.slice(0,6).reduce((x,y)=>x+y,0), 0)} alerts`);

// Write pivot CSV
let csv = "Fecha,Dia,Total,Misiles,Drones";
for (let h = 0; h < 24; h++) csv += "," + String(h).padStart(2, "0") + ":00";
csv += "\n";

for (const r of merged) {
  const missiles = Math.round(r.tlv * 0.65);
  const drones = r.tlv - missiles;
  csv += `${r.fecha},${r.dia},${r.tlv},${missiles},${drones}`;
  for (let h = 0; h < 24; h++) csv += "," + r.hours[h];
  csv += "\n";
}
fs.writeFileSync(path.join(__dirname, "..", "public", "data", "alerts-by-day-hour.csv"), csv);

// Write alerts.json
const dayMap = { Dom: 0, Lun: 1, Mar: 2, Mie: 3, "Mié": 3, Jue: 4, Vie: 5, Sab: 6, "Sáb": 6 };
const alerts = [];
let id = 1;
for (const r of merged) {
  const dow = dayMap[r.dia] ?? new Date(r.fecha + "T12:00:00+02:00").getDay();
  const missileFrac = 0.65;
  for (let h = 0; h < 24; h++) {
    for (let i = 0; i < r.hours[h]; i++) {
      const isMissile = i < Math.round(r.hours[h] * missileFrac);
      const minute = r.hours[h] > 1 ? Math.floor((i / r.hours[h]) * 50) + 5 : 30;
      const ts = `${r.fecha}T${String(h).padStart(2,"0")}:${String(minute).padStart(2,"0")}:00+02:00`;
      alerts.push({
        id: `avg-${String(id++).padStart(5, "0")}`,
        timestamp: ts,
        unix: Math.floor(new Date(ts).getTime() / 1000),
        cities: [], cities_en: ["Tel Aviv / Gush Dan"],
        threat: isMissile ? "missiles" : "hostile_aircraft",
        threat_code: isMissile ? 0 : 5,
        isDrill: false, day_of_week: dow, hour: h, date: r.fecha,
      });
    }
  }
}
alerts.sort((a, b) => a.unix - b.unix);
fs.writeFileSync(path.join(__dirname, "..", "public", "data", "alerts.json"), JSON.stringify(alerts, null, 2));
console.log(`JSON: ${alerts.length} alerts saved`);
