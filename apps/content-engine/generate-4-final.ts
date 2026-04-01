/**
 * Generate 4 final videos: MP explainer, WD explainer, Current situation, Weekly recap.
 * Usage: npx tsx generate-4-final.ts
 */
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

// Load .env
const envPath = path.join(import.meta.dirname, ".env");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
}
const API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
if (!API_KEY) { console.error("Missing ELEVENLABS_API_KEY"); process.exit(1); }

const audioDir = path.join(import.meta.dirname, "public", "audio");
const outputDir = path.join(import.meta.dirname, "output");
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

// ── SCRIPTS ──

const VIDEOS = [
  {
    id: "final-mp",
    title: "What is Missile Probability?",
    music: "bg-breaking-alert.mp3",
    script: `Two hundred and fifty missile alerts in the Tel Aviv metro since February twenty-eighth. But here's the thing — they follow a pattern. Missile Probability is a free, open-source tool that maps every single alert from Israel's Home Front Command. By hour. By day. By region. It shows you when alerts peak — around two PM — and when they're calmest — between two and five AM. It tracks whether Thursdays are heavier than Saturdays. Whether the North gets hit more than the South. This isn't prediction. This is what actually happened across thirty-three days of war. Nine hundred fifty-seven events, analyzed and visualized. So you can check before you step outside. Built during the war, from a shelter in Tel Aviv. Open source. Free. No ads. No tracking. Just organized data for civilians who need it. missileprobability.com.`,
  },
  {
    id: "final-wd",
    title: "What is War Dashboard?",
    music: "bg-daily-briefing.mp3",
    script: `Day thirty-three of the Iran-Israel conflict. Nine hundred and fifty-seven alerts. Dozens of regions hit. But what is actually happening? War Dashboard is a civilian intelligence briefing. It takes every alert from the Home Front Command and organizes it into clear patterns. Weekly evolution — is the conflict escalating or calming down? A geopolitical timeline showing how events like sanctions, eliminations, and diplomatic talks directly affect attack intensity. A situation room tracking US military positioning around the Persian Gulf. Region breakdowns, daily intensity charts, and historical data going back to day one. This isn't news. It's not speculation. It's raw data, structured for nine million people who deserve clarity. Free. Open source. Updated daily. wardashboard.live.`,
  },
  {
    id: "final-situation",
    title: "Current Military Situation",
    music: "bg-data-analysis.mp3",
    script: `Here's the current military situation around Iran. The USS Harry Truman carrier strike group is confirmed in the Arabian Sea, south of the Strait of Hormuz. Reports suggest a second carrier may be en route. Seven US forward bases surround Iran — Al Udeid in Qatar, Al Dhafra in the UAE, Camp Arifjan in Kuwait, the Fifth Fleet headquarters in Bahrain, Prince Sultan Air Base in Saudi Arabia, Camp Lemonnier in Djibouti, and Diego Garcia in the Indian Ocean where B-2 stealth bombers are staged. In total, approximately forty-five thousand US military personnel are deployed across the region with an estimated one hundred eighty combat aircraft. On the Iranian side, Kharg Island handles ninety percent of Iran's oil exports — making it the primary strategic target. The Strait of Hormuz carries twenty-one percent of the world's oil. Any ground operation would likely target these chokepoints first. Daily alerts have dropped to seventeen — the lowest since the war began. Whether this signals a pause before escalation or genuine de-escalation remains the key question. wardashboard.live.`,
  },
  {
    id: "final-weekly",
    title: "5 Weeks of War — Weekly Recap",
    music: "bg-outro-safe.mp3",
    script: `Five weeks of the Iran-Israel conflict. Here's what happened, week by week. Week one, February twenty-eighth to March sixth: one hundred ninety-eight alerts. Iran launches the first direct barrage since October twenty twenty-four. Sirens across all regions. Israel strikes back at IRGC targets in Syria. Week two, March seventh to thirteenth: two hundred four alerts. Iran retaliates with a multi-front barrage. The UN Security Council calls for a ceasefire. Brief de-escalation. Week three, March fourteenth to twentieth: one hundred ninety-nine alerts. Trump expands sanctions. Backchannel talks through Oman. Then an IRGC commander is eliminated — alerts spike immediately. Week four, March twenty-first to twenty-seventh: two hundred twenty-nine alerts. The heaviest week. Retaliation waves peak at forty-two alerts in a single day. Arrow defense system tested like never before. Week five, March twenty-eighth to April first: one hundred twenty-seven alerts across five days. Intensity drops. US carrier positioned near Hormuz. Daily alerts fall to seventeen — the lowest since day one. Is this the calm before the storm, or the beginning of the end? The data will tell us. wardashboard.live.`,
  },
];

// ── GENERATE AUDIO ──

const audioDurations: Record<string, number> = {};

async function genAudio(id: string, text: string) {
  const out = path.join(audioDir, `${id}.mp3`);
  console.log(`[${id}] Generating audio (${text.split(" ").length} words)...`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": API_KEY },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.7, similarity_boost: 0.8, style: 0.3 } }),
  });
  if (!res.ok) { console.error(`  Error ${res.status}: ${await res.text()}`); process.exit(1); }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  const secs = buf.length / (128 * 1024 / 8);
  audioDurations[id] = Math.ceil(secs);
  console.log(`  ${(buf.length/1024).toFixed(0)} KB, ~${audioDurations[id]}s`);
}

// ── WRITE ROOT ENTRIES ──

function writeCompositions() {
  // Write a dedicated Root file for these 4 videos
  const rootAddPath = path.join(import.meta.dirname, "src", "data", "final-videos.ts");

  const entries = VIDEOS.map(v => {
    const frames = (audioDurations[v.id] + 3) * 30; // audio + 1.5s padding each side
    return `  { id: "${v.id}", title: "${v.title}", music: "${v.music}", frames: ${frames} },`;
  });

  fs.writeFileSync(rootAddPath, `export const FINAL_VIDEOS = [\n${entries.join("\n")}\n];\n`);
  console.log("\nWrote final-videos.ts");

  // Update Root.tsx to include the 4 final videos
  const rootPath = path.join(import.meta.dirname, "src", "Root.tsx");
  let root = fs.readFileSync(rootPath, "utf8");

  if (!root.includes("final-videos")) {
    // Add import
    root = root.replace(
      'import { REEL_CONFIGS }',
      'import { FINAL_VIDEOS } from "./data/final-videos";\nimport { REEL_CONFIGS }'
    );

    // Add compositions before the closing </>
    const finalComps = `
      {/* Final 4 videos */}
      {FINAL_VIDEOS.map((vid) => (
        <Composition
          key={vid.id}
          id={vid.id}
          component={() => {
            const scenes = [
              { type: "typing-hook" as const, durationInFrames: 90, props: { text: vid.title } },
              { type: "heatmap" as const, durationInFrames: Math.round(vid.frames * 0.2), props: { caption: "" } },
              { type: "trend" as const, durationInFrames: Math.round(vid.frames * 0.2), props: { caption: "" } },
              { type: "text" as const, durationInFrames: Math.round(vid.frames * 0.2), props: { line1: "Data-driven.", line2: "Not speculation." } },
              { type: "disclaimer" as const, durationInFrames: Math.round(vid.frames * 0.15), props: { text: "wardashboard.live\\nmissileprobability.com" } },
              { type: "outro" as const, durationInFrames: Math.round(vid.frames * 0.15), props: { url: "wardashboard.live", accent: "#4A90D9" } },
            ];
            const totalSceneFrames = scenes.reduce((s, sc) => s + sc.durationInFrames, 0);
            const scale = vid.frames / totalSceneFrames;
            return (
              <>
                <Audio src={staticFile(\`audio/\${vid.id}.mp3\`)} startFrom={30} />
                <MusicFadeOut file={vid.music} baseVolume={0.2} />
                <Series>
                  {scenes.map((scene, i) => (
                    <Series.Sequence key={i} durationInFrames={Math.round(scene.durationInFrames * scale)}>
                      {renderExplainerScene(scene, "#4A90D9")}
                    </Series.Sequence>
                  ))}
                </Series>
              </>
            );
          }}
          durationInFrames={vid.frames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}`;

    root = root.replace(
      /(\s*)<\/>\s*\);\s*\}\s*$/m,
      `${finalComps}\n    </>\n  );\n}`
    );

    fs.writeFileSync(rootPath, root);
    console.log("Updated Root.tsx with 4 final video compositions");
  }
}

// ── RENDER ──

async function renderVideos() {
  console.log("\nBundling...");
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

  for (const vid of VIDEOS) {
    const outPath = path.join(outputDir, `${vid.id}.mp4`);
    console.log(`[${vid.id}] Rendering "${vid.title}"...`);
    const start = Date.now();
    try {
      const comp = await selectComposition({ serveUrl: bundled, id: vid.id });
      console.log(`  ${comp.durationInFrames} frames (${(comp.durationInFrames / 30).toFixed(1)}s)`);
      await renderMedia({ composition: comp, serveUrl: bundled, codec: "h264", outputLocation: outPath });
      const size = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(1);
      console.log(`  Done: ${size} MB, ${((Date.now() - start) / 1000).toFixed(0)}s\n`);
    } catch (err) {
      console.error(`  Error:`, err);
    }
  }
}

// ── MAIN ──

async function main() {
  // 1. Generate all 4 audios
  for (const v of VIDEOS) await genAudio(v.id, v.script);

  // 2. Write compositions
  writeCompositions();

  // 3. Render
  await renderVideos();

  console.log("\n=== 4 videos complete! ===");
  console.log("Output: apps/content-engine/output/final-*.mp4");
}

main();
