/**
 * Merge 3 LLM datasets (Claude, Gemini, ChatGPT) into averaged data.
 * Run: node scripts/merge-llm-data.cjs
 */

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "Data llms 22 03");

function parseCSV(file) {
  const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
  const lines = raw.trim().split("\n");
  const header = lines[0].split(",");

  // Find column indices
  const cols = {};
  header.forEach((h, i) => { cols[h.trim()] = i; });

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted fields
    const line = lines[i];
    const parts = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { parts.push(current); current = ""; continue; }
      current += ch;
    }
    parts.push(current);

    const fecha = parts[cols["Fecha"]]?.trim();
    if (!fecha || fecha === "TOTAL") continue;

    const hours = [];
    for (let h = 0; h < 24; h++) {
      const key = "H" + String(h).padStart(2, "0");
      hours.push(parseInt(parts[cols[key]]) || 0);
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

// Parse all 3
const claude = parseCSV("iran_attacks_data - Claude Scrape 22.03 23hs.csv");
const gemini = parseCSV("iran_attacks_data - Gemini Scrape 22.03 23hs.csv");
const chatgpt = parseCSV("missileprobability_iran_israel_2026-02-28_to_2026-03-22 - CHATGPT.csv");

console.log(`Claude: ${claude.length} days, Gemini: ${gemini.length} days, ChatGPT: ${chatgpt.length} days\n`);

// Merge by date
const allDates = [...new Set([...claude, ...gemini, ...chatgpt].map(r => r.fecha))].sort();

const merged = [];
const comparison = [];

for (const fecha of allDates) {
  const c = claude.find(r => r.fecha === fecha);
  const g = gemini.find(r => r.fecha === fecha);
  const p = chatgpt.find(r => r.fecha === fecha);

  const sources = [c, g, p].filter(Boolean);
  if (sources.length === 0) continue;

  const avg = (field) => Math.round(sources.reduce((a, s) => a + s[field], 0) / sources.length);

  // Average hourly distribution
  const avgHours = [];
  for (let h = 0; h < 24; h++) {
    const vals = sources.map(s => s.hours[h]);
    avgHours.push(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
  }

  // Make sure hourly sum matches TLV oleadas average
  const avgTlv = avg("tlv");
  const hourSum = avgHours.reduce((a, b) => a + b, 0);

  // Scale hours to match TLV total if needed
  const scaledHours = [...avgHours];
  if (hourSum > 0 && hourSum !== avgTlv) {
    const scale = avgTlv / hourSum;
    let remaining = avgTlv;
    for (let h = 0; h < 24; h++) {
      if (h === 23) {
        scaledHours[h] = Math.max(0, remaining);
      } else {
        scaledHours[h] = Math.round(avgHours[h] * scale);
        remaining -= scaledHours[h];
      }
    }
  }

  const row = {
    fecha,
    dia: (c || g || p).dia,
    total: avg("total"),
    tlv: avgTlv,
    sur: avg("sur"),
    norte: avg("norte"),
    jerusalem: avg("jerusalem"),
    muertos: avg("muertos"),
    heridos: avg("heridos"),
    hours: scaledHours,
  };

  merged.push(row);

  comparison.push({
    fecha,
    total: { claude: c?.total, gemini: g?.total, chatgpt: p?.total, avg: row.total },
    tlv: { claude: c?.tlv, gemini: g?.tlv, chatgpt: p?.tlv, avg: row.tlv },
  });
}

// Print comparison
console.log("=== COMPARACION POR DIA ===");
console.log("Fecha       | Total (C/G/P→Avg) | TLV (C/G/P→Avg)");
console.log("------------|-------------------|------------------");
for (const c of comparison) {
  const t = c.total;
  const l = c.tlv;
  console.log(
    `${c.fecha} | ${String(t.claude||0).padStart(2)} / ${String(t.gemini||0).padStart(2)} / ${String(t.chatgpt||0).padStart(2)} → ${String(t.avg).padStart(2)} | ${String(l.claude||0).padStart(2)} / ${String(l.gemini||0).padStart(2)} / ${String(l.chatgpt||0).padStart(2)} → ${String(l.avg).padStart(2)}`
  );
}

// Summary stats
const totalOleadas = merged.reduce((a, r) => a + r.total, 0);
const totalTlv = merged.reduce((a, r) => a + r.tlv, 0);
const totalMuertos = merged.reduce((a, r) => a + r.muertos, 0);
const totalHeridos = merged.reduce((a, r) => a + r.heridos, 0);

console.log(`\n=== TOTALES PROMEDIADOS ===`);
console.log(`Oleadas totales: ${totalOleadas}`);
console.log(`Oleadas TLV: ${totalTlv} (${(totalTlv/totalOleadas*100).toFixed(1)}%)`);
console.log(`Muertos: ${totalMuertos}`);
console.log(`Heridos: ${totalHeridos}`);

// Write pivot CSV for the dashboard
let csv = "Fecha,Dia,Total,Misiles,Drones";
for (let h = 0; h < 24; h++) csv += "," + String(h).padStart(2, "0") + ":00";
csv += "\n";

for (const r of merged) {
  // Estimate missiles vs drones at ~65/35 split
  const missiles = Math.round(r.tlv * 0.65);
  const drones = r.tlv - missiles;
  csv += `${r.fecha},${r.dia},${r.tlv},${missiles},${drones}`;
  for (let h = 0; h < 24; h++) csv += "," + r.hours[h];
  csv += "\n";
}

// TOTAL row
const totalRow = merged.reduce((acc, r) => {
  acc.tlv += r.tlv;
  acc.missiles += Math.round(r.tlv * 0.65);
  acc.drones += r.tlv - Math.round(r.tlv * 0.65);
  for (let h = 0; h < 24; h++) acc.hours[h] += r.hours[h];
  return acc;
}, { tlv: 0, missiles: 0, drones: 0, hours: new Array(24).fill(0) });

csv += `TOTAL,,${totalRow.tlv},${totalRow.missiles},${totalRow.drones}`;
for (let h = 0; h < 24; h++) csv += "," + totalRow.hours[h];
csv += "\n";

fs.writeFileSync(path.join(__dirname, "..", "public", "data", "alerts-by-day-hour.csv"), csv);
console.log(`\nCSV pivot guardado en public/data/alerts-by-day-hour.csv`);

// Also generate the alerts.json for the dashboard
const dayMap = { Dom: 0, Lun: 1, Mar: 2, Mie: 3, Mié: 3, Jue: 4, Vie: 5, Sab: 6, Sáb: 6 };
const alerts = [];
let id = 1;

for (const r of merged) {
  const dow = dayMap[r.dia] ?? new Date(r.fecha + "T12:00:00+02:00").getDay();
  const missiles = Math.round(r.tlv * 0.65);

  for (let h = 0; h < 24; h++) {
    const count = r.hours[h];
    for (let i = 0; i < count; i++) {
      const isMissile = i < Math.round(count * (missiles / (r.tlv || 1)));
      const minute = count > 1 ? Math.floor((i / count) * 50) + 5 : 30;
      const ts = `${r.fecha}T${String(h).padStart(2,"0")}:${String(minute).padStart(2,"0")}:00+02:00`;

      alerts.push({
        id: `avg-${String(id++).padStart(5, "0")}`,
        timestamp: ts,
        unix: Math.floor(new Date(ts).getTime() / 1000),
        cities: [],
        cities_en: ["Tel Aviv / Gush Dan"],
        threat: isMissile ? "missiles" : "hostile_aircraft",
        threat_code: isMissile ? 0 : 5,
        isDrill: false,
        day_of_week: dow,
        hour: h,
        date: r.fecha,
      });
    }
  }
}

alerts.sort((a, b) => a.unix - b.unix);
fs.writeFileSync(
  path.join(__dirname, "..", "public", "data", "alerts.json"),
  JSON.stringify(alerts, null, 2)
);
console.log(`JSON alerts guardado: ${alerts.length} alertas`);

// Save full merged data with all fields for reference
const fullCSV = "Fecha,Dia,Total_Oleadas,TLV,Sur,Norte,Jerusalem,Muertos,Heridos," +
  Array.from({length:24},(_,h)=>"H"+String(h).padStart(2,"0")).join(",") +
  ",Claude_Total,Gemini_Total,ChatGPT_Total\n" +
  merged.map((r, i) => {
    const c = claude.find(x => x.fecha === r.fecha);
    const g = gemini.find(x => x.fecha === r.fecha);
    const p = chatgpt.find(x => x.fecha === r.fecha);
    return [r.fecha, r.dia, r.total, r.tlv, r.sur, r.norte, r.jerusalem, r.muertos, r.heridos,
      ...r.hours, c?.total||"", g?.total||"", p?.total||""].join(",");
  }).join("\n");

fs.writeFileSync(path.join(__dirname, "..", "public", "data", "merged-full.csv"), fullCSV);
console.log("Full merged CSV guardado en public/data/merged-full.csv");
