/**
 * Git commit and push updated data to GitHub.
 */

import { execSync } from "child_process";
import { CONFIG } from "../config.js";

function log(msg: string) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(`[${ts}] Push: ${msg}`);
}

export function pushToGithub(): void {
  const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const cwd = CONFIG.MONOREPO_ROOT;

  try {
    // Stage all data files
    execSync("git add packages/shared/data/*.json apps/missile-probability/public/data/alerts.json apps/wardashboard/public/data/alerts.json", { cwd, stdio: "pipe" });

    // Commit
    execSync(`git commit -m "Auto-update alert data: ${timestamp}"`, { cwd, stdio: "pipe" });

    // Push
    execSync("git push origin main", { cwd, stdio: "pipe", timeout: 30000 });

    log(`Pushed to GitHub — ${timestamp}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("nothing to commit") || msg.includes("no changes")) {
      log("No changes to push");
    } else {
      log(`Push error: ${msg}`);
    }
  }
}
