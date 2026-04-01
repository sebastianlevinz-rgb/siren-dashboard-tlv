/**
 * Generate audio + update Root + render MP4 for the 7 promo reels.
 * Usage: npx tsx generate-promo-7.ts
 */

import fs from "fs";
import path from "path";

// Load .env
const envPath = path.join(import.meta.dirname, ".env");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
}

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
if (!API_KEY) { console.error("Missing ELEVENLABS_API_KEY"); process.exit(1); }

// Load real data for dynamic replacements
const alertsPath = path.join(import.meta.dirname, "..", "wardashboard", "public", "data", "alerts.json");
const alerts = JSON.parse(fs.readFileSync(alertsPath, "utf8"));
const totalAlerts = alerts.length;
const dates = [...new Set(alerts.map((a: { date: string }) => a.date))].sort() as string[];
const daysOfWar = dates.length;
const regionCounts: Record<string, number> = {};
for (const a of alerts) {
  for (const r of (a as { regions: string[] }).regions || []) {
    if (r === "gush_dan" || r === "center") regionCounts["Gush Dan"] = (regionCounts["Gush Dan"] || 0) + 1;
  }
}
const gushDanTotal = regionCounts["Gush Dan"] || 0;

const scripts: Record<string, string> = {
  "wd-concept": `What if you had access to a military-style intelligence briefing, designed for civilians? That's War Dashboard. We track every missile alert, every siren, every pattern in the Iran-Israel conflict. Real data from the Home Front Command, analyzed and visualized so you can understand what's actually happening. Day by day, hour by hour. Not news. Not opinions. Just data. War Dashboard dot live. Your daily intelligence briefing.`,

  "wd-how": `Here's how War Dashboard works. Every alert from every siren in Israel gets logged, timestamped, and categorized. We build heatmaps showing exactly when and where attacks happen. We track geopolitical events and measure their impact on alert patterns. We compare week over week, region by region. The result? A clear picture of the conflict that updates every single day. No guessing. Just patterns in the data. wardashboard.live.`,

  "wd-why": `Since February twenty-eighth, Israel has faced ${totalAlerts} missile alerts. Four million people in the Tel Aviv metro alone live under this threat. Alerts come at three AM. They come at noon. They come during your commute. Your neighbor, your grandmother, your coworker — they all deserve to understand the pattern. Because when you know when and where the danger peaks, you make better decisions. Knowledge is your first layer of protection. War Dashboard. wardashboard.live.`,

  "mp-concept": `${gushDanTotal} missile events in the Tel Aviv area since the war began. But they don't happen randomly. Missile Probability analyzes every alert from the Home Front Command to show you exactly when and where attacks are most likely. Peak hours. Quiet windows. Regional patterns. So you can plan your run, your commute, your grocery trip around the data. Not fear. Data. missileprobability.com.`,

  "mp-heatmap": `This is what war looks like in data. Each cell is one hour of one day. Green means calm. Red means danger. Watch the pattern emerge. The peak hits around two PM, right when you're at lunch. The quietest window? Two to five AM. Thursdays tend to be heavier than Saturdays. This isn't a prediction. This is what actually happened. And patterns tend to repeat. Check the heatmap before you leave the house. missileprobability.com.`,

  "mp-shelter": `This project was built during the war. From a shelter in Tel Aviv. When the sirens started, I needed answers. When are the attacks most likely? Is it safer in the morning or at night? Is Saturday calmer? I couldn't find a clear answer anywhere. So I built it. Open source. Free. No ads. No agenda. Just a civilian who needed to understand the data. And now you can too. missileprobability.com.`,

  "combo": `Two tools. One mission. Keeping civilians informed. Missile Probability answers one question: when is it safest to go outside? It's your personal risk calculator based on real alert data. War Dashboard answers a different question: what is happening in this conflict, and why? It's your daily intelligence briefing with context, events, and trends. Together, they give you the full picture. Real data. Real context. For nine million people who deserve to understand. missileprobability.com. wardashboard.live.`,
};

const REEL_IDS = Object.keys(scripts);
const audioDir = path.join(import.meta.dirname, "public", "audio");
fs.mkdirSync(audioDir, { recursive: true });

const audioDurations: Record<string, number> = {};

async function generateAudio(id: string, text: string): Promise<void> {
  const outputPath = path.join(audioDir, `reel-${id}.mp3`);
  console.log(`\n[${id}] Generating audio...`);
  console.log(`  Script (${text.split(" ").length} words): "${text.slice(0, 80)}..."`);

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
    console.error(`  ElevenLabs error ${response.status}: ${await response.text()}`);
    process.exit(1);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);

  // ElevenLabs typically outputs 128kbps MP3
  const estimatedSeconds = buffer.length / (128 * 1024 / 8);
  audioDurations[id] = Math.ceil(estimatedSeconds);
  console.log(`  Saved: ${(buffer.length / 1024).toFixed(0)} KB, ~${audioDurations[id]}s`);
}

async function main() {
  // Generate all 7 audios
  for (const id of REEL_IDS) {
    await generateAudio(id, scripts[id]);
  }

  console.log("\n=== All 7 audios generated ===\n");

  // Update real-data.ts to include promo audio durations
  const realDataPath = path.join(import.meta.dirname, "src", "data", "real-data.ts");
  let realDataContent = fs.readFileSync(realDataPath, "utf8");

  // Add promo durations to AUDIO_DURATIONS
  const existingDurations = realDataContent.match(/export const AUDIO_DURATIONS[\s\S]*?};/);
  if (existingDurations) {
    const newDurations = `export const AUDIO_DURATIONS: Record<string, number> = {\n` +
      `  "daily-briefing": ${Math.ceil((313 / (128 * 1024 / 8)) + 4) * 30},\n` +
      `  "weekly-comparison": ${Math.ceil((248 / (128 * 1024 / 8)) + 4) * 30},\n` +
      `  "deadliest-hours": ${Math.ceil((267 / (128 * 1024 / 8)) + 4) * 30},\n` +
      REEL_IDS.map(id => `  "${id}": ${(audioDurations[id] + 4) * 30},`).join("\n") + "\n};";
    realDataContent = realDataContent.replace(/export const AUDIO_DURATIONS[\s\S]*?};/, newDurations);
    fs.writeFileSync(realDataPath, realDataContent);
    console.log("Updated AUDIO_DURATIONS in real-data.ts");
  }

  // Also add gushDanTotal to REAL_DATA if not present
  if (!realDataContent.includes("gushDanTotal")) {
    realDataContent = realDataContent.replace(
      "dailyCounts:",
      `gushDanTotal: ${gushDanTotal},\n  dailyCounts:`
    );
    fs.writeFileSync(realDataPath, realDataContent);
  }

  // Update Root.tsx to include promo reels
  const rootPath = path.join(import.meta.dirname, "src", "Root.tsx");
  let rootContent = fs.readFileSync(rootPath, "utf8");

  // Add import for promo configs
  if (!rootContent.includes("promo-reel-configs")) {
    rootContent = rootContent.replace(
      'import { REEL_CONFIGS } from "./data/reel-configs";',
      'import { REEL_CONFIGS } from "./data/reel-configs";\nimport { PROMO_REEL_CONFIGS } from "./data/promo-reel-configs";'
    );
  }

  // Update AUDIO_REELS set to include promo IDs
  const allAudioIds = ["daily-briefing", "weekly-comparison", "deadliest-hours", ...REEL_IDS];
  rootContent = rootContent.replace(
    /const AUDIO_REELS = new Set\(\[.*?\]\);/,
    `const AUDIO_REELS = new Set(${JSON.stringify(allAudioIds)});`
  );

  // Add promo facts to getFact
  const promoFacts: Record<string, string> = {
    wdConcept1Title: "A Civilian Intelligence Briefing",
    wdConcept1Body: "Military-grade data analysis designed for ordinary people",
    wdConcept2Title: "Real Data, Not Speculation",
    wdConcept2Body: "Every alert logged, timestamped, and categorized from official sources",
    wdConcept3Title: "Built by Civilians, for Civilians",
    wdConcept3Body: "No agenda. No ads. Just data you can trust.",
    wdHow1Title: "Updated Daily",
    wdHow1Body: "New data processed every day with automated analysis",
    wdWhy1Title: "4 Million People in Gush Dan",
    wdWhy1Body: "The Tel Aviv metro area lives under constant missile threat",
    wdWhy2Title: "Everyone Deserves to Understand",
    wdWhy2Body: "Your neighbor, your grandmother, your coworker — clarity saves lives",
    wdWhy3Title: "Knowledge is Protection",
    wdWhy3Body: "When you know the pattern, you make better decisions",
    mpConcept1Title: "When is Your Safest Window?",
    mpConcept1Body: "See exactly which hours have the lowest alert frequency",
    mpConcept2Title: "Plan Your Day Around Data",
    mpConcept2Body: "Not fear. Not rumor. Data from the Home Front Command.",
    mpHeatmap1Title: "Peak: 2PM. Quietest: 2-5AM",
    mpHeatmap1Body: "Clear patterns emerge from weeks of alert data",
    mpHeatmap2Title: "Check Before You Leave",
    mpHeatmap2Body: "Patterns tend to repeat. The heatmap is your daily guide.",
    mpShelter1Title: "Built During the War",
    mpShelter1Body: "From a mamad in Tel Aviv, when answers were needed",
    mpShelter2Title: "Open Source. Free. No Ads.",
    mpShelter2Body: "No agenda. Just a civilian project born from necessity.",
    mpShelter3Title: "Now You Can Too",
    mpShelter3Body: "The same tool that helped me is now available to everyone",
    combo1Title: "Two Tools, One Mission",
    combo1Body: "Keeping 9 million Israelis informed with real data",
    combo2Title: "Missile Probability",
    combo2Body: "When is it safest to go outside? Your personal risk calculator.",
    combo3Title: "War Dashboard",
    combo3Body: "What's happening and why? Your daily intelligence briefing.",
  };

  // Append promo facts to the getFact function
  const factsObjMatch = rootContent.match(/const facts: Record<string, string> = \{[\s\S]*?\};/);
  if (factsObjMatch) {
    const existingFacts = factsObjMatch[0];
    const newEntries = Object.entries(promoFacts).map(([k, v]) => `    ${k}: "${v.replace(/"/g, '\\"')}",`).join("\n");
    const updatedFacts = existingFacts.replace("};", newEntries + "\n  };");
    rootContent = rootContent.replace(existingFacts, updatedFacts);
  }

  // Add promo configs to the rendering loop
  if (!rootContent.includes("...PROMO_REEL_CONFIGS")) {
    rootContent = rootContent.replace(
      "{REEL_CONFIGS.map((reel) => {",
      "{[...REEL_CONFIGS, ...PROMO_REEL_CONFIGS].map((reel) => {"
    );
  }

  fs.writeFileSync(rootPath, rootContent);
  console.log("Updated Root.tsx with promo reels\n");

  // Now render all 7 MP4s
  console.log("=== Rendering 7 promo reels ===\n");

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

  for (const id of REEL_IDS) {
    const outputPath = path.join(outputDir, `${id}.mp4`);
    console.log(`[${id}] Rendering...`);
    const start = Date.now();

    try {
      const composition = await selectComposition({ serveUrl: bundled, id });
      console.log(`  ${composition.durationInFrames} frames (${(composition.durationInFrames / 30).toFixed(1)}s)`);
      await renderMedia({ composition, serveUrl: bundled, codec: "h264", outputLocation: outputPath });
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const size = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
      console.log(`  Done: ${size} MB, ${elapsed}s\n`);
    } catch (err) {
      console.error(`  Error:`, err);
    }
  }

  // Update preview.html
  const previewPath = path.join(import.meta.dirname, "preview.html");
  fs.writeFileSync(previewPath, `<!DOCTYPE html>
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
  </style>
</head>
<body>
  <h1>⚔️ WAR DASHBOARD — Reel Preview (10 videos)</h1>

  <div class="section">
    <div class="section-title">DATA REELS</div>
    <div class="grid">
      <div><h3>1. Daily Briefing</h3><video src="output/daily-briefing.mp4" controls></video></div>
      <div><h3>2. Weekly Comparison</h3><video src="output/weekly-comparison.mp4" controls></video></div>
      <div><h3>3. Deadliest Hours</h3><video src="output/deadliest-hours.mp4" controls></video></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">WAR DASHBOARD EXPLAINERS</div>
    <div class="grid">
      <div><h3>A1. What is War Dashboard?</h3><video src="output/wd-concept.mp4" controls></video></div>
      <div><h3>A2. How it Works</h3><video src="output/wd-how.mp4" controls></video></div>
      <div><h3>A3. Why It Matters</h3><video src="output/wd-why.mp4" controls></video></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title orange">MISSILE PROBABILITY EXPLAINERS</div>
    <div class="grid">
      <div><h3>B1. What is Missile Probability?</h3><video src="output/mp-concept.mp4" controls></video></div>
      <div><h3>B2. The Heatmap</h3><video src="output/mp-heatmap.mp4" controls></video></div>
      <div><h3>B3. Built in a Shelter</h3><video src="output/mp-shelter.mp4" controls></video></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">THE COMBINATION</div>
    <div class="grid grid-1">
      <div><h3>C1. Two Tools, One Mission</h3><video src="output/combo.mp4" controls></video></div>
    </div>
  </div>
</body>
</html>
`);

  console.log("\n=== All done! ===");
  console.log("Preview: npx serve . -p 3333");
  console.log("Open: http://localhost:3333/preview.html");
}

main();
