/**
 * One-shot update: poll → export → push.
 * Usage: npx tsx src/update-now.ts
 */

import { initDB, getAlertCount } from "./db.js";
import { pollActiveAlerts, fetchHistory } from "./collector.js";
import { exportAll } from "./exporter.js";
import { pushToGithub } from "./pusher.js";

async function main() {
  initDB();
  console.log(`DB: ${getAlertCount()} alerts`);

  console.log("Polling Pikud HaOref...");
  const newActive = await pollActiveAlerts();

  console.log("Fetching 24h history...");
  const recovered = await fetchHistory();

  console.log("Exporting to all apps...");
  exportAll();

  console.log("Pushing to GitHub...");
  pushToGithub();

  console.log(`\nDone. New: ${newActive} | Recovered: ${recovered} | Total: ${getAlertCount()}`);
}

main();
