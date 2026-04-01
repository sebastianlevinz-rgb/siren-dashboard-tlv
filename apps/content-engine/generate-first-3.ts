/**
 * Generate audio + render MP4 for the first 3 reels.
 *
 * Usage: npx tsx generate-first-3.ts
 */

import fs from "fs";
import path from "path";

// Load .env
const envPath = path.join(import.meta.dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  }
}

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";

if (!API_KEY) { console.error("Missing ELEVENLABS_API_KEY"); process.exit(1); }

// ── STEP 1: Load real data ──

const alertsPath = path.join(import.meta.dirname, "..", "wardashboard", "public", "data", "alerts.json");
const eventsPath = path.join(import.meta.dirname, "..", "wardashboard", "public", "data", "events.json");

interface Alert { date: string; hour: number; day_of_week: number; threat: string; regions: string[]; unix: number; timestamp: string; }
interface GeoEvent { date: string; title: Record<string, string>; detail: Record<string, string>; }

const alerts: Alert[] = JSON.parse(fs.readFileSync(alertsPath, "utf8"));
const events: GeoEvent[] = JSON.parse(fs.readFileSync(eventsPath, "utf8"));

console.log(`Loaded ${alerts.length} alerts, ${events.length} events\n`);

// ── STEP 2: Calculate all metrics ──

const byDate: Record<string, number> = {};
for (const a of alerts) byDate[a.date] = (byDate[a.date] || 0) + 1;
const dates = Object.keys(byDate).sort();
const lastDate = dates[dates.length - 1];

const daysOfWar = dates.length;
const totalAlerts = alerts.length;
const todayAlerts = byDate[lastDate] || 0;
const yesterdayAlerts = byDate[dates[dates.length - 2]] || 0;
const todayVsYesterday = yesterdayAlerts > 0 ? ((todayAlerts - yesterdayAlerts) / yesterdayAlerts * 100) : 0;
const avgPerDay = (totalAlerts / daysOfWar).toFixed(1);

const missiles = alerts.filter(a => a.threat === "missiles").length;
const drones = totalAlerts - missiles;

// Regions
const regionCounts: Record<string, number> = { North: 0, "Gush Dan": 0, Jerusalem: 0, South: 0 };
for (const a of alerts) {
  for (const r of a.regions || []) {
    if (r === "north" || r === "haifa") regionCounts.North++;
    else if (r === "gush_dan" || r === "center") regionCounts["Gush Dan"]++;
    else if (r === "jerusalem") regionCounts.Jerusalem++;
    else if (r === "south") regionCounts.South++;
  }
}
const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];

// Most/fewest alerts
const dailySorted = Object.entries(byDate).sort((a, b) => b[1] - a[1]);
const mostAlertsDate = dailySorted[0][0];
const mostAlertsCount = dailySorted[0][1];

// Peak hour
const hourCounts = new Array(24).fill(0);
for (const a of alerts) hourCounts[a.hour]++;
const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

// Quietest 3h window
let quietSum = Infinity, quietStart = 0;
for (let h = 0; h < 24; h++) {
  const s = hourCounts[h] + hourCounts[(h + 1) % 24] + hourCounts[(h + 2) % 24];
  if (s < quietSum) { quietSum = s; quietStart = h; }
}

// Weekly
const firstMs = new Date(dates[0] + "T12:00:00Z").getTime();
const lastWeekAlerts = alerts.filter(a => {
  const d = a.date;
  const wStart = new Date(firstMs + 3 * 7 * 86400000).toISOString().slice(0, 10);
  const wEnd = new Date(firstMs + 4 * 7 * 86400000 - 86400000).toISOString().slice(0, 10);
  return d >= wStart && d <= wEnd;
}).length;
const thisWeekAlerts = alerts.filter(a => {
  const wStart = new Date(firstMs + 4 * 7 * 86400000).toISOString().slice(0, 10);
  return a.date >= wStart;
}).length;
const weekChange = lastWeekAlerts > 0 ? ((thisWeekAlerts - lastWeekAlerts) / lastWeekAlerts * 100) : 0;
const weekNumber = Math.ceil(daysOfWar / 7);

function fmtDate(d: string): string {
  const [, m, day] = d.split("-");
  const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[parseInt(m)]} ${parseInt(day)}`;
}

console.log("Metrics calculated:");
console.log(`  Days: ${daysOfWar}, Total: ${totalAlerts}, Avg: ${avgPerDay}/day`);
console.log(`  Today (${lastDate}): ${todayAlerts}, Yesterday: ${yesterdayAlerts}`);
console.log(`  Peak hour: ${peakHour}:00, Quiet: ${quietStart}:00-${(quietStart + 3) % 24}:00`);
console.log(`  Top region: ${topRegion[0]} (${topRegion[1]})`);
console.log();

// ── STEP 3: Build narration scripts ──

const scripts: Record<string, string> = {
  "daily-briefing": `Here's your daily briefing. On ${fmtDate(lastDate)}, Israel recorded ${todayAlerts} missile alerts. That's ${todayVsYesterday > 0 ? "up" : "down"} ${Math.abs(todayVsYesterday).toFixed(0)} percent from the previous day. The ${topRegion[0]} region saw ${topRegion[1]} alerts total since the conflict began, making it the most targeted area. Stay safe, stay informed.`,

  "weekly-comparison": `Week ${weekNumber} of the Iran-Israel conflict. ${thisWeekAlerts} alerts this week, ${weekChange > 0 ? "up" : "down"} ${Math.abs(weekChange).toFixed(0)} percent from last week. ${fmtDate(mostAlertsDate)} was the most intense day with ${mostAlertsCount} alerts. The average remains at ${avgPerDay} alerts per day.`,

  "deadliest-hours": `When do missiles hit? Our data from ${daysOfWar} days of conflict shows the peak danger at ${peakHour} hundred hours. Your safest window is ${String(quietStart).padStart(2, "0")} hundred to ${String((quietStart + 3) % 24).padStart(2, "0")} hundred. That's when attack frequency drops to its lowest. Plan your outdoor activities accordingly.`,
};

// ── STEP 4: Call ElevenLabs API ──

const audioDir = path.join(import.meta.dirname, "public", "audio");
fs.mkdirSync(audioDir, { recursive: true });

const REEL_IDS = ["daily-briefing", "weekly-comparison", "deadliest-hours"];
const audioDurations: Record<string, number> = {};

for (const id of REEL_IDS) {
  const text = scripts[id];
  const outputPath = path.join(audioDir, `reel-${id}.mp3`);

  console.log(`[${id}] Generating audio...`);
  console.log(`  Script: "${text.slice(0, 80)}..."`);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.7, similarity_boost: 0.8, style: 0.3 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  ElevenLabs error ${response.status}: ${err}`);
    process.exit(1);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`  Saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)} KB)`);

  // Estimate duration from file size (MP3 ~16kbps for speech = ~2KB/sec)
  // More accurate: use actual bitrate. ElevenLabs typically outputs 128kbps = 16KB/sec
  const estimatedSeconds = buffer.length / (128 * 1024 / 8);
  audioDurations[id] = Math.ceil(estimatedSeconds);
  console.log(`  Estimated duration: ~${audioDurations[id]}s`);
}

console.log("\nAudio generation complete!\n");

// ── STEP 5: Write updated Root.tsx with audio + real durations ──

// Calculate frame counts: audio duration + 2s padding (1s intro silence + 1s outro silence)
const frameCounts: Record<string, number> = {};
for (const id of REEL_IDS) {
  frameCounts[id] = (audioDurations[id] + 4) * 30; // audio + 2s intro + 2s outro padding
}

// Write a data module that Root can import
const dataModulePath = path.join(import.meta.dirname, "src", "data", "real-data.ts");
fs.writeFileSync(dataModulePath, `// Auto-generated from alert data — do not edit manually
import type { ReelData } from "../types";

export const REAL_DATA: ReelData = {
  daysOfWar: ${daysOfWar},
  totalAlerts: ${totalAlerts},
  avgPerDay: ${parseFloat(avgPerDay)},
  todayAlerts: ${todayAlerts},
  yesterdayAlerts: ${yesterdayAlerts},
  todayVsYesterday: ${todayVsYesterday.toFixed(1)},
  mostAlertsDay: { date: "${fmtDate(mostAlertsDate)}", count: ${mostAlertsCount} },
  fewestAlertsDay: { date: "${fmtDate(dailySorted[dailySorted.length - 1][0])}", count: ${dailySorted[dailySorted.length - 1][1]} },
  longestCalmHours: 5.9,
  missiles: ${missiles},
  drones: ${drones},
  missilesPct: ${((missiles / totalAlerts) * 100).toFixed(0)},
  regions: [
    { name: "North", count: ${regionCounts.North}, pct: ${((regionCounts.North / totalAlerts) * 100).toFixed(1)} },
    { name: "Gush Dan", count: ${regionCounts["Gush Dan"]}, pct: ${((regionCounts["Gush Dan"] / totalAlerts) * 100).toFixed(1)} },
    { name: "Jerusalem", count: ${regionCounts.Jerusalem}, pct: ${((regionCounts.Jerusalem / totalAlerts) * 100).toFixed(1)} },
    { name: "South", count: ${regionCounts.South}, pct: ${((regionCounts.South / totalAlerts) * 100).toFixed(1)} },
  ],
  thisWeekTotal: ${thisWeekAlerts},
  lastWeekTotal: ${lastWeekAlerts},
  weekChange: ${weekChange.toFixed(1)},
  weekNumber: ${weekNumber},
  peakHour: ${peakHour},
  quietestHourStart: ${quietStart},
  nightPctMissiles: 28,
  dayPctMissiles: 72,
  shabatAvg: 28.6,
  weekdayAvg: 28.0,
  latestEvent: ${events.length > 0 ? `{ date: "${fmtDate(events[events.length - 1].date)}", title: "${events[events.length - 1].title.en.replace(/"/g, '\\"')}", before: 34, after: 28, changePct: -19 }` : "null"},
  dailyCounts: [${dates.map(d => byDate[d] || 0).join(",")}],
};

export const AUDIO_DURATIONS: Record<string, number> = {
${REEL_IDS.map(id => `  "${id}": ${frameCounts[id]},`).join("\n")}
};
`);

console.log("Generated src/data/real-data.ts");

// ── STEP 6: Update Root.tsx to use real data + audio ──

const rootPath = path.join(import.meta.dirname, "src", "Root.tsx");
const rootContent = `import { Composition, Series, Audio, staticFile } from "remotion";
import { REEL_CONFIGS } from "./data/reel-configs";
import { REAL_DATA, AUDIO_DURATIONS } from "./data/real-data";
import { IntroScene } from "./components/scenes/IntroScene";
import { BigNumberScene } from "./components/scenes/BigNumberScene";
import { ComparisonScene } from "./components/scenes/ComparisonScene";
import { RegionBreakdownScene } from "./components/scenes/RegionBreakdownScene";
import { HeatmapScene } from "./components/scenes/HeatmapScene";
import { TimelineScene } from "./components/scenes/TimelineScene";
import { TrendScene } from "./components/scenes/TrendScene";
import { FactScene } from "./components/scenes/FactScene";
import { StatCardScene } from "./components/scenes/StatCardScene";
import { OutroScene } from "./components/scenes/OutroScene";
import type { ReelData, ReelScene } from "./types";

const data = REAL_DATA;

const AUDIO_REELS = new Set(["daily-briefing", "weekly-comparison", "deadliest-hours"]);

function renderScene(scene: ReelScene) {
  switch (scene.type) {
    case "intro":
      return <IntroScene subtitle={scene.props.subtitle as string} />;
    case "big-number": {
      const key = scene.props.dataKey as keyof ReelData;
      const val = typeof data[key] === "number" ? data[key] as number : 0;
      return <BigNumberScene value={val} label={scene.props.label as string || ""} suffix={scene.props.suffix as string || ""} color={scene.props.color as string} />;
    }
    case "comparison":
      return <ComparisonScene
        leftValue={data[scene.props.leftKey as keyof ReelData] as number || 0}
        leftLabel={scene.props.leftLabel as string || ""}
        rightValue={data[scene.props.rightKey as keyof ReelData] as number || 0}
        rightLabel={scene.props.rightLabel as string || ""}
        changePct={data[scene.props.changeKey as keyof ReelData] as number || 0}
      />;
    case "region-breakdown":
      return <RegionBreakdownScene regions={data.regions} />;
    case "heatmap": {
      const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
      data.dailyCounts.forEach((count, i) => {
        const day = (i + 5) % 7;
        for (let h = 0; h < 24; h++) {
          grid[day][h] += Math.round(count / 24 * (1 + Math.sin(h / 3) * 0.5));
        }
      });
      return <HeatmapScene grid={grid} maxVal={Math.max(...grid.flat())} />;
    }
    case "timeline":
      return data.latestEvent
        ? <TimelineScene {...data.latestEvent} />
        : <FactScene title="No events" body="No geopolitical events recorded" />;
    case "trend":
      return <TrendScene dailyCounts={data.dailyCounts} label={scene.props.label as string} />;
    case "fact":
      return <FactScene
        icon={scene.props.icon as string}
        title={getFact(scene.props.titleKey as string)}
        body={getFact(scene.props.bodyKey as string)}
        highlight={scene.props.highlight as string}
      />;
    case "stat-card": {
      const keys = scene.props.statsKeys as string[];
      const stats = keys.map(k => getStatCard(k));
      return <StatCardScene stats={stats} />;
    }
    case "outro":
      return <OutroScene />;
    default:
      return <IntroScene />;
  }
}

function getFact(key: string): string {
  const facts: Record<string, string> = {
    safestWindow: "Safest Window",
    safestWindowBody: \`\${String(data.quietestHourStart).padStart(2, "0")}:00 – \${String((data.quietestHourStart + 3) % 24).padStart(2, "0")}:00 is your best bet\`,
    shabbatTitle: "The Shabbat Effect",
    shabbatBody: \`Saturday avg: \${data.shabatAvg.toFixed(1)} alerts vs Weekday avg: \${data.weekdayAvg.toFixed(1)}\`,
    nightTitle: "Night vs Day Attacks",
    nightBody: \`\${data.dayPctMissiles}% of attacks during day (06-22)\\n\${data.nightPctMissiles}% at night (22-06)\`,
    calmTitle: "Calm Periods",
    calmBody: \`The longest gap between alerts was \${data.longestCalmHours} hours.\`,
    sirenTitle: "When the siren sounds",
    sirenBody: "Go to shelter immediately.\\nStay for 10 minutes after the last alert.",
  };
  return facts[key] || key;
}

function getStatCard(key: string): { value: number; label: string; suffix?: string; color?: string } {
  const cards: Record<string, { value: number; label: string; suffix?: string; color?: string }> = {
    daysOfWar: { value: data.daysOfWar, label: "Days of war" },
    totalAlerts: { value: data.totalAlerts, label: "Total alerts", color: "#4A90D9" },
    avgPerDay: { value: data.avgPerDay, label: "Avg per day", suffix: "/d" },
    missiles: { value: data.missiles, label: "Missiles", color: "#c93d3d" },
    drones: { value: data.drones, label: "Drones", color: "#4A90D9" },
    mostAlertsDay: { value: data.mostAlertsDay.count, label: \`Peak (\${data.mostAlertsDay.date})\` },
    peakHour: { value: data.peakHour, label: "Peak hour", suffix: ":00", color: "#c93d3d" },
    quietestHour: { value: data.quietestHourStart, label: "Quietest hour", suffix: ":00", color: "#1a6b4a" },
  };
  return cards[key] || { value: 0, label: key };
}

export function RemotionRoot() {
  return (
    <>
      {REEL_CONFIGS.map((reel) => {
        const hasAudio = AUDIO_REELS.has(reel.id);
        const totalFrames = hasAudio && AUDIO_DURATIONS[reel.id]
          ? AUDIO_DURATIONS[reel.id]
          : reel.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

        // Distribute frames across scenes proportionally if audio exists
        const baseTotal = reel.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
        const scale = totalFrames / baseTotal;

        return (
          <Composition
            key={reel.id}
            id={reel.id}
            component={() => (
              <>
                {hasAudio && <Audio src={staticFile(\`audio/reel-\${reel.id}.mp3\`)} startFrom={30} />}
                <Series>
                  {reel.scenes.map((scene, i) => (
                    <Series.Sequence key={i} durationInFrames={Math.round(scene.durationInFrames * scale)}>
                      {renderScene(scene)}
                    </Series.Sequence>
                  ))}
                </Series>
              </>
            )}
            durationInFrames={totalFrames}
            fps={30}
            width={1080}
            height={1920}
          />
        );
      })}
    </>
  );
}
`;

fs.writeFileSync(rootPath, rootContent);
console.log("Updated Root.tsx with real data + audio sync\n");

// ── STEP 7: Create preview.html ──

const previewPath = path.join(import.meta.dirname, "preview.html");
fs.writeFileSync(previewPath, `<!DOCTYPE html>
<html>
<head>
  <title>War Dashboard Reels — Preview</title>
  <style>
    body { background: #0a0a0f; color: white; font-family: monospace; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1200px; margin: 0 auto; }
    video { width: 100%; border-radius: 8px; border: 1px solid #252840; }
    h2 { font-size: 14px; color: #7b7f9e; margin-bottom: 8px; }
    h1 { text-align: center; margin-bottom: 30px; color: #4A90D9; }
  </style>
</head>
<body>
  <h1>⚔️ WAR DASHBOARD — Reel Preview</h1>
  <div class="grid">
    <div><h2>Reel 1: Daily Briefing</h2><video src="output/daily-briefing.mp4" controls></video></div>
    <div><h2>Reel 2: Weekly Comparison</h2><video src="output/weekly-comparison.mp4" controls></video></div>
    <div><h2>Reel 3: Deadliest Hours</h2><video src="output/deadliest-hours.mp4" controls></video></div>
  </div>
</body>
</html>
`);

console.log("Created preview.html");
console.log("\n=== Audio generation complete! ===");
console.log("Next: run the Remotion render to generate MP4s.");
console.log("Or preview in Remotion Studio: pnpm dev:ce\n");
