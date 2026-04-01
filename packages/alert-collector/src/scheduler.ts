/**
 * Scheduling logic — polls alerts, fetches history, exports, pushes.
 * All scheduling done via setInterval (no cron dependency).
 */

import { CONFIG } from "../config.js";
import { pollActiveAlerts, fetchHistory } from "./collector.js";
import { exportAll } from "./exporter.js";
import { pushToGithub } from "./pusher.js";

function log(msg: string) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(`[${ts}] Scheduler: ${msg}`);
}

function getIsraelTime(): { hour: number; minute: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONFIG.TZ,
    hour: "numeric", minute: "numeric", hour12: false,
  }).formatToParts(now);

  const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
  const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");
  return { hour, minute };
}

let lastPushKey = "";

function checkPushSchedule(): void {
  const { hour, minute } = getIsraelTime();
  const key = `${hour}:${minute}`;

  // Prevent pushing twice in the same minute
  if (key === lastPushKey) return;

  for (const schedule of CONFIG.PUSH_TIMES) {
    if (hour === schedule.hour && minute === schedule.minute) {
      lastPushKey = key;
      log(`Scheduled push triggered (${hour}:${String(minute).padStart(2, "0")} IST)`);
      try {
        exportAll();
        pushToGithub();
      } catch (err) {
        log(`Push schedule error: ${err instanceof Error ? err.message : String(err)}`);
      }
      break;
    }
  }
}

export function startScheduler(): void {
  const pushTimesStr = CONFIG.PUSH_TIMES.map(t => `${t.hour}:${String(t.minute).padStart(2, "0")}`).join(", ");
  log(`Starting — Poll every ${CONFIG.POLL_INTERVAL_MS / 60000} min, History every ${CONFIG.HISTORY_INTERVAL_MS / 60000} min, Push at ${pushTimesStr} IST`);

  // Immediate first poll
  pollActiveAlerts();

  // Poll active alerts every 3 minutes
  setInterval(() => {
    pollActiveAlerts();
  }, CONFIG.POLL_INTERVAL_MS);

  // Fetch history every hour
  setInterval(() => {
    fetchHistory();
  }, CONFIG.HISTORY_INTERVAL_MS);

  // Check push schedule every minute
  setInterval(() => {
    checkPushSchedule();
  }, 60 * 1000);
}
