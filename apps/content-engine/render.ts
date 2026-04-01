/**
 * Render all reels to MP4 using @remotion/renderer.
 *
 * Usage: npx tsx render.ts
 *
 * Renders each Composition defined in Root.tsx to output/ directory.
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { REEL_CONFIGS } from "./src/data/reel-configs";

const OUTPUT_DIR = path.join(import.meta.dirname, "output");

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

  console.log("Bundle complete. Rendering reels...\n");

  for (const reel of REEL_CONFIGS) {
    const outputPath = path.join(OUTPUT_DIR, `${reel.id}.mp4`);
    console.log(`[${reel.id}] Rendering ${reel.title}...`);

    try {
      const composition = await selectComposition({
        serveUrl: bundled,
        id: reel.id,
      });

      await renderMedia({
        composition,
        serveUrl: bundled,
        codec: "h264",
        outputLocation: outputPath,
      });

      console.log(`  Done: ${outputPath}`);
    } catch (err) {
      console.error(`  Error rendering ${reel.id}:`, err);
    }
  }

  console.log("\nAll renders complete!");
}

main();
