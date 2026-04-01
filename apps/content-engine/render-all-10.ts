/**
 * Re-render all 10 reels with background music.
 * Usage: npx tsx render-all-10.ts
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.join(import.meta.dirname, "output");
const ALL_IDS = [
  "daily-briefing", "weekly-comparison", "deadliest-hours",
  "wd-concept", "wd-how", "wd-why",
  "mp-concept", "mp-heatmap", "mp-shelter",
  "combo",
];

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Bundling Remotion project...");
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

  let totalTime = 0;
  for (const id of ALL_IDS) {
    const outputPath = path.join(OUTPUT_DIR, `${id}.mp4`);
    console.log(`[${id}] Rendering...`);
    const start = Date.now();

    try {
      const composition = await selectComposition({ serveUrl: bundled, id });
      console.log(`  ${composition.durationInFrames} frames (${(composition.durationInFrames / 30).toFixed(1)}s)`);
      await renderMedia({ composition, serveUrl: bundled, codec: "h264", outputLocation: outputPath });
      const elapsed = (Date.now() - start) / 1000;
      totalTime += elapsed;
      const size = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
      console.log(`  Done: ${size} MB, ${elapsed.toFixed(1)}s\n`);
    } catch (err) {
      console.error(`  Error:`, err);
    }
  }

  console.log(`\n=== All 10 reels rendered in ${(totalTime / 60).toFixed(1)} minutes ===`);
  console.log("Preview: npx serve . -p 3333 → http://localhost:3333/preview.html");
}

main();
