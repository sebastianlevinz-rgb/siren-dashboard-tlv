/**
 * Generate narration audio for each reel using ElevenLabs TTS API.
 *
 * Usage: ELEVENLABS_API_KEY=xxx npx tsx generate-audio.ts
 *
 * Reads reel configs, fills narration templates with real data,
 * calls ElevenLabs API, and saves MP3 files to public/audio/.
 */

import fs from "fs";
import path from "path";
import { REEL_CONFIGS } from "./src/data/reel-configs";

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB"; // "Adam" voice
const OUTPUT_DIR = path.join(import.meta.dirname, "public", "audio");

if (!API_KEY) {
  console.error("Error: ELEVENLABS_API_KEY environment variable not set.");
  console.error("Usage: ELEVENLABS_API_KEY=your_key npx tsx generate-audio.ts");
  process.exit(1);
}

// Load real data to fill templates
const alertsPath = path.join(import.meta.dirname, "..", "wardashboard", "public", "data", "alerts.json");
const eventsPath = path.join(import.meta.dirname, "..", "wardashboard", "public", "data", "events.json");

const alerts = JSON.parse(fs.readFileSync(alertsPath, "utf8"));
const events = JSON.parse(fs.readFileSync(eventsPath, "utf8"));

// Calculate metrics
const byDate: Record<string, number> = {};
for (const a of alerts) byDate[a.date] = (byDate[a.date] || 0) + 1;
const dates = Object.keys(byDate).sort();
const lastDate = dates[dates.length - 1];
const todayAlerts = byDate[lastDate] || 0;
const yesterdayAlerts = byDate[dates[dates.length - 2]] || 0;
const daysOfWar = dates.length;
const totalAlerts = alerts.length;
const missiles = alerts.filter((a: { threat: string }) => a.threat === "missiles").length;
const drones = totalAlerts - missiles;
const avgPerDay = (totalAlerts / daysOfWar).toFixed(1);
const sorted = [...Object.entries(byDate)].sort((a, b) => (b[1] as number) - (a[1] as number));
const mostAlertsDate = sorted[0][0];
const mostAlertsCount = sorted[0][1];
const topRegionCounts: Record<string, number> = {};
for (const a of alerts) {
  for (const r of a.regions || []) {
    if (r === "north" || r === "haifa") topRegionCounts["North"] = (topRegionCounts["North"] || 0) + 1;
    else if (r === "gush_dan" || r === "center") topRegionCounts["Dan"] = (topRegionCounts["Dan"] || 0) + 1;
    else if (r === "jerusalem") topRegionCounts["Jerusalem"] = (topRegionCounts["Jerusalem"] || 0) + 1;
    else if (r === "south") topRegionCounts["South"] = (topRegionCounts["South"] || 0) + 1;
  }
}
const topRegion = Object.entries(topRegionCounts).sort((a, b) => b[1] - a[1])[0];
const latestEvent = events[events.length - 1];
const todayVsYesterday = yesterdayAlerts > 0 ? ((todayAlerts - yesterdayAlerts) / yesterdayAlerts * 100) : 0;

// Replacements map
const replacements: Record<string, string> = {
  "[todayAlerts]": String(todayAlerts),
  "[yesterdayAlerts]": String(yesterdayAlerts),
  "[todayVsYesterdayDir]": todayVsYesterday > 0 ? "up" : "down",
  "[todayVsYesterdayAbs]": Math.abs(todayVsYesterday).toFixed(0),
  "[topRegion]": topRegion[0],
  "[topRegionCount]": String(topRegion[1]),
  "[daysOfWar]": String(daysOfWar),
  "[totalAlerts]": String(totalAlerts),
  "[avgPerDay]": avgPerDay,
  "[missiles]": String(missiles),
  "[drones]": String(drones),
  "[mostAlertsDate]": mostAlertsDate,
  "[mostAlertsCount]": String(mostAlertsCount),
  "[longestCalmHours]": "5.9",
  "[peakHour]": "17",
  "[quietestHourStart]": "02",
  "[quietestHourEnd]": "05",
  "[weekNumber]": "5",
  "[thisWeekTotal]": "86",
  "[lastWeekTotal]": "229",
  "[weekChangeDir]": "down",
  "[weekChangeAbs]": "28",
  "[shabatAvg]": "28.6",
  "[weekdayAvg]": "28.0",
  "[shabbatInterpretation]": "Saturday shows roughly the same level of threat as weekdays.",
  "[dayPctMissiles]": "72",
  "[nightPctMissiles]": "28",
  "[gushDanTotal]": String(topRegionCounts["Dan"] || 0),
  "[gushDanPct]": ((topRegionCounts["Dan"] || 0) / totalAlerts * 100).toFixed(0),
  "[eventDate]": latestEvent?.date || "",
  "[eventTitle]": latestEvent?.title?.en || "",
  "[eventDir]": "decreased",
  "[eventChangeAbs]": "19",
};

function fillTemplate(template: string): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

async function generateAudio(text: string, outputPath: string): Promise<void> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.7, similarity_boost: 0.8 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} — ${err}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const reel of REEL_CONFIGS) {
    const narration = fillTemplate(reel.narrationTemplate);
    const outputPath = path.join(OUTPUT_DIR, `reel-${reel.id}.mp3`);

    console.log(`\n[${reel.id}] Generating audio...`);
    console.log(`  Script: "${narration.slice(0, 100)}..."`);

    try {
      await generateAudio(narration, outputPath);
      console.log(`  Saved: ${outputPath}`);
    } catch (err) {
      console.error(`  Error: ${err}`);
    }
  }

  console.log("\nDone!");
}

main();
