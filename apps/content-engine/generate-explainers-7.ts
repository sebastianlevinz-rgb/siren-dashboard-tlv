/**
 * Generate 7 explainer reels V2: audio + render.
 * Usage: npx tsx generate-explainers-7.ts
 */

import fs from "fs";
import path from "path";
import { EXPLAINER_CONFIGS } from "./src/data/explainer-configs";

// Load .env
const envPath = path.join(import.meta.dirname, ".env");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
}

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
if (!API_KEY) { console.error("Missing ELEVENLABS_API_KEY"); process.exit(1); }

// Load data
const alertsPath = path.join(import.meta.dirname, "public", "data", "alerts.json");
const alerts = JSON.parse(fs.readFileSync(alertsPath, "utf8"));
const totalAlerts = alerts.length;
const dates = [...new Set(alerts.map((a: { date: string }) => a.date))].sort() as string[];
const daysOfWar = dates.length;
const regionCounts: Record<string, number> = {};
for (const a of alerts) {
  for (const r of (a as { regions: string[] }).regions || []) {
    if (r === "gush_dan" || r === "center") regionCounts["gush_dan"] = (regionCounts["gush_dan"] || 0) + 1;
  }
}
const gushDanTotal = regionCounts["gush_dan"] || 0;

console.log(`Data: ${totalAlerts} alerts, ${daysOfWar} days, ${gushDanTotal} Gush Dan\n`);

const audioDir = path.join(import.meta.dirname, "public", "audio");
fs.mkdirSync(audioDir, { recursive: true });

const audioDurations: Record<string, number> = {};

// Fill placeholders in narration
function fill(text: string): string {
  return text
    .replace(/\{daysOfWar\}/g, String(daysOfWar))
    .replace(/\{totalAlerts\}/g, String(totalAlerts))
    .replace(/\{gushDanTotal\}/g, String(gushDanTotal));
}

async function generateAudio(id: string, text: string): Promise<void> {
  const outputPath = path.join(audioDir, `reel-${id}.mp3`);
  console.log(`[${id}] Generating audio (${text.split(" ").length} words)...`);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": API_KEY },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.7, similarity_boost: 0.8, style: 0.3 },
    }),
  });

  if (!response.ok) {
    console.error(`  Error ${response.status}: ${await response.text()}`);
    process.exit(1);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  const seconds = buffer.length / (128 * 1024 / 8);
  audioDurations[id] = Math.ceil(seconds);
  console.log(`  ${(buffer.length / 1024).toFixed(0)} KB, ~${audioDurations[id]}s`);
}

async function main() {
  // 1. Generate all 7 audios
  for (const cfg of EXPLAINER_CONFIGS) {
    await generateAudio(cfg.id, fill(cfg.narration));
  }
  console.log("\nAll 7 audios generated.\n");

  // 2. Update real-data.ts with new durations and fresh data
  const realDataPath = path.join(import.meta.dirname, "src", "data", "real-data.ts");
  let realData = fs.readFileSync(realDataPath, "utf8");

  // Update AUDIO_DURATIONS with explainer durations (frames = (seconds + 4) * 30)
  const durEntries = Object.entries(audioDurations)
    .map(([id, sec]) => `  "${id}": ${(sec + 4) * 30},`)
    .join("\n");

  // Keep existing data reel durations, add/replace explainer ones
  const existingMatch = realData.match(/export const AUDIO_DURATIONS[\s\S]*?};/);
  if (existingMatch) {
    // Parse existing entries
    const existingEntries = existingMatch[0]
      .match(/"[^"]+": \d+/g)
      ?.filter(e => !EXPLAINER_CONFIGS.some(c => e.includes(c.id)))
      ?.map(e => `  ${e},`)
      .join("\n") || "";

    const newBlock = `export const AUDIO_DURATIONS: Record<string, number> = {\n${existingEntries}\n${durEntries}\n};`;
    realData = realData.replace(/export const AUDIO_DURATIONS[\s\S]*?};/, newBlock);
  }

  // Update gushDanTotal
  realData = realData.replace(/gushDanTotal: \d+/, `gushDanTotal: ${gushDanTotal}`);
  realData = realData.replace(/daysOfWar: \d+/, `daysOfWar: ${daysOfWar}`);
  realData = realData.replace(/totalAlerts: \d+/, `totalAlerts: ${totalAlerts}`);

  fs.writeFileSync(realDataPath, realData);
  console.log("Updated real-data.ts\n");

  // 3. Update Root.tsx to include explainer compositions
  const rootPath = path.join(import.meta.dirname, "src", "Root.tsx");
  let root = fs.readFileSync(rootPath, "utf8");

  // Add explainer imports if not present
  if (!root.includes("explainer-configs")) {
    root = root.replace(
      'import { REEL_CONFIGS } from "./data/reel-configs";',
      'import { REEL_CONFIGS } from "./data/reel-configs";\nimport { EXPLAINER_CONFIGS } from "./data/explainer-configs";'
    );
  }

  // Add all explainer IDs to AUDIO_REELS
  const allAudioIds = [
    "daily-briefing", "weekly-comparison", "deadliest-hours",
    "wd-concept", "wd-how", "wd-why", "mp-concept", "mp-heatmap", "mp-shelter", "combo",
  ];
  root = root.replace(
    /const AUDIO_REELS = new Set\([^)]+\);/,
    `const AUDIO_REELS = new Set(${JSON.stringify(allAudioIds)});`
  );

  // Update BG_MUSIC for new configs
  const bgMusicMap = EXPLAINER_CONFIGS.reduce((acc, c) => {
    acc[c.id] = { file: c.bgMusic, volume: 0.2 };
    return acc;
  }, {} as Record<string, { file: string; volume: number }>);

  const existingBgMusic = root.match(/const BG_MUSIC[\s\S]*?};/);
  if (existingBgMusic) {
    // Rebuild BG_MUSIC with all entries
    const allBgEntries = {
      "daily-briefing": { file: "bg-data-analysis.mp3", volume: 0.12 },
      "weekly-comparison": { file: "bg-data-analysis.mp3", volume: 0.12 },
      "deadliest-hours": { file: "bg-data-analysis.mp3", volume: 0.12 },
      ...bgMusicMap,
    };
    const bgBlock = `const BG_MUSIC: Record<string, { file: string; volume: number }> = {\n` +
      Object.entries(allBgEntries).map(([k, v]) => `  "${k}": { file: "${v.file}", volume: ${v.volume} },`).join("\n") +
      "\n};";
    root = root.replace(/const BG_MUSIC[\s\S]*?};/, bgBlock);
  }

  fs.writeFileSync(rootPath, root);
  console.log("Updated Root.tsx\n");

  // 4. Render all 7 explainer MP4s
  console.log("=== Rendering 7 explainer reels ===\n");

  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  const outputDir = path.join(import.meta.dirname, "output");
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("Bundling...");
  const bundled = await bundle({
    entryPoint: path.join(import.meta.dirname, "src", "index.ts"),
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias as Record<string, string>),
          "@war/shared": path.resolve(import.meta.dirname, "../../packages/shared"),
        },
      },
    }),
  });
  console.log("Bundle complete.\n");

  for (const cfg of EXPLAINER_CONFIGS) {
    const outputPath = path.join(outputDir, `${cfg.id}.mp4`);
    console.log(`[${cfg.id}] Rendering "${cfg.title}"...`);
    const start = Date.now();

    try {
      const composition = await selectComposition({ serveUrl: bundled, id: cfg.id });
      console.log(`  ${composition.durationInFrames} frames (${(composition.durationInFrames / 30).toFixed(1)}s)`);
      await renderMedia({ composition, serveUrl: bundled, codec: "h264", outputLocation: outputPath });
      const size = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
      console.log(`  Done: ${size} MB, ${((Date.now() - start) / 1000).toFixed(1)}s\n`);
    } catch (err) {
      console.error(`  Error:`, err);
    }
  }

  // 5. Update preview.html
  fs.writeFileSync(path.join(import.meta.dirname, "preview.html"), `<!DOCTYPE html>
<html>
<head>
  <title>War Dashboard Reels — Preview</title>
  <style>
    body { background: #0a0a0f; color: white; font-family: monospace; padding: 20px; }
    .section { max-width: 1200px; margin: 0 auto 40px; }
    .section-title { font-size: 18px; color: #4A90D9; margin-bottom: 16px; letter-spacing: 2px; border-bottom: 1px solid #252840; padding-bottom: 8px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .grid-1 { grid-template-columns: 1fr; max-width: 400px; }
    video { width: 100%; border-radius: 8px; border: 1px solid #252840; }
    h3 { font-size: 12px; color: #7b7f9e; margin-bottom: 8px; }
    h1 { text-align: center; margin-bottom: 40px; color: #4A90D9; font-size: 24px; }
    .orange { color: #d4822a; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: 6px; }
    .tag-v2 { background: #4A90D9; color: white; }
  </style>
</head>
<body>
  <h1>⚔️ WAR DASHBOARD — All Reels</h1>

  <div class="section">
    <div class="section-title">WAR DASHBOARD EXPLAINERS <span class="tag tag-v2">V2</span></div>
    <div class="grid">
      <div><h3>WD-1: What is War Dashboard?</h3><video src="output/wd-concept.mp4" controls></video></div>
      <div><h3>WD-2: How it Works</h3><video src="output/wd-how.mp4" controls></video></div>
      <div><h3>WD-3: Why It Exists</h3><video src="output/wd-why.mp4" controls></video></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title orange">MISSILE PROBABILITY EXPLAINERS <span class="tag tag-v2">V2</span></div>
    <div class="grid">
      <div><h3>MP-1: What is Missile Probability?</h3><video src="output/mp-concept.mp4" controls></video></div>
      <div><h3>MP-2: The Heatmap Explained</h3><video src="output/mp-heatmap.mp4" controls></video></div>
      <div><h3>MP-3: Built During the War</h3><video src="output/mp-shelter.mp4" controls></video></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">THE COMBINATION <span class="tag tag-v2">V2</span></div>
    <div class="grid grid-1">
      <div><h3>COMBO: Two Tools, One Mission</h3><video src="output/combo.mp4" controls></video></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title" style="color: #7b7f9e">DATA REELS (original)</div>
    <div class="grid">
      <div><h3>1. Daily Briefing</h3><video src="output/daily-briefing.mp4" controls></video></div>
      <div><h3>2. Weekly Comparison</h3><video src="output/weekly-comparison.mp4" controls></video></div>
      <div><h3>3. Deadliest Hours</h3><video src="output/deadliest-hours.mp4" controls></video></div>
    </div>
  </div>
</body>
</html>`);

  console.log("\n=== All done! ===");
  console.log("npx serve . -p 3333 → http://localhost:3333/preview.html");
}

main();
