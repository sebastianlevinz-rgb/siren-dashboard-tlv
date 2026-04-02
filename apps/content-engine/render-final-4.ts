import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const IDS = ["final-mp", "final-wd", "final-situation", "final-weekly"];
const OUT = path.join(import.meta.dirname, "output");
fs.mkdirSync(OUT, { recursive: true });

async function main() {
  console.log("Bundling...");
  const bundled = await bundle({
    entryPoint: path.join(import.meta.dirname, "src", "index.ts"),
    webpackOverride: (c) => ({
      ...c,
      resolve: { ...c.resolve, alias: { ...(c.resolve?.alias as Record<string, string>), "@war/shared": path.resolve(import.meta.dirname, "../../packages/shared") } },
    }),
  });
  console.log("Bundle complete.\n");
  for (const id of IDS) {
    const out = path.join(OUT, id + ".mp4");
    console.log("[" + id + "] Rendering...");
    const s = Date.now();
    try {
      const comp = await selectComposition({ serveUrl: bundled, id });
      console.log("  " + comp.durationInFrames + " frames (" + (comp.durationInFrames / 30).toFixed(1) + "s)");
      await renderMedia({ composition: comp, serveUrl: bundled, codec: "h264", outputLocation: out });
      console.log("  Done: " + (fs.statSync(out).size / 1024 / 1024).toFixed(1) + " MB, " + ((Date.now() - s) / 1000).toFixed(0) + "s\n");
    } catch (err) { console.error("  Error:", err); }
  }
  console.log("All 4 done!");
}
main();
