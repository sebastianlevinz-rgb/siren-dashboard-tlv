/**
 * Render the first 3 reels to MP4.
 * Usage: npx tsx render-first-3.ts
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.join(import.meta.dirname, "output");
const REEL_IDS = ["daily-briefing", "weekly-comparison", "deadliest-hours"];

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
          ...config.resolve?.alias,
          "@war/shared": path.resolve(import.meta.dirname, "../../packages/shared"),
        },
      },
    }),
  });
  console.log("Bundle complete.\n");

  for (const id of REEL_IDS) {
    const outputPath = path.join(OUTPUT_DIR, `${id}.mp4`);
    console.log(`[${id}] Rendering...`);
    const start = Date.now();

    try {
      const composition = await selectComposition({
        serveUrl: bundled,
        id,
      });

      console.log(`  Duration: ${composition.durationInFrames} frames (${(composition.durationInFrames / 30).toFixed(1)}s)`);

      await renderMedia({
        composition,
        serveUrl: bundled,
        codec: "h264",
        outputLocation: outputPath,
      });

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const size = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
      console.log(`  Done: ${outputPath} (${size} MB, ${elapsed}s)\n`);
    } catch (err) {
      console.error(`  Error rendering ${id}:`, err);
    }
  }

  console.log("All 3 reels rendered!");
  console.log("\nTo preview: npx serve . -p 3333");
  console.log("Then open: http://localhost:3333/preview.html");
}

main();
