/**
 * Alert Collector — Entry point.
 *
 * Polls Pikud HaOref every 3 minutes, stores in SQLite,
 * exports and pushes to GitHub at scheduled times.
 *
 * Usage: npx tsx src/start.ts
 */

import { initDB, getAlertCount } from "./db.js";
import { fetchHistory } from "./collector.js";
import { startScheduler } from "./scheduler.js";

function log(msg: string) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(`[${ts}] ${msg}`);
}

async function main() {
  log("═══════════════════════════════════════════════");
  log("  WAR DASHBOARD — Alert Collector");
  log("  Pikud HaOref API → SQLite → GitHub → Vercel");
  log("═══════════════════════════════════════════════");

  // 1. Initialize database
  initDB();
  log(`Database has ${getAlertCount()} alerts`);

  // 2. Fetch history to recover any missed alerts
  log("Fetching 24h history to recover missed alerts...");
  await fetchHistory();
  log(`Database now has ${getAlertCount()} alerts`);

  // 3. Start the scheduler (polling + push)
  startScheduler();

  log("Alert collector running. Press Ctrl+C to stop.");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
