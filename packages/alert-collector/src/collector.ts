/**
 * Polls Pikud HaOref API for active alerts and history.
 */

import { CONFIG } from "../config.js";
import { parseOrefAlert } from "./parser.js";
import { insertAlert, hasAlert } from "./db.js";

function log(msg: string) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(`[${ts}] ${msg}`);
}

export async function pollActiveAlerts(): Promise<number> {
  try {
    const res = await fetch(CONFIG.OREF_ALERTS_URL, { headers: CONFIG.OREF_HEADERS });
    const text = await res.text();

    // Empty response = no active alerts
    if (!text || text.trim() === "" || text.trim() === "[]") {
      log("No active alerts");
      return 0;
    }

    const data = JSON.parse(text);
    // Can be a single object or an array
    const alerts = Array.isArray(data) ? data : [data];

    let newCount = 0;
    for (const raw of alerts) {
      if (!raw.id && !raw.data) continue;

      // Skip if we already have this alert
      if (raw.id && hasAlert(raw.id)) continue;

      const parsed = parseOrefAlert(raw);
      const inserted = insertAlert(parsed);
      if (inserted) {
        newCount++;
        const cities = (raw.data || []).slice(0, 3).join(", ");
        log(`New alert: ${parsed.threat} — ${cities} (ID: ${raw.id || "N/A"})`);
      }
    }

    if (newCount > 0) {
      log(`${newCount} new alert(s) stored`);
    }
    return newCount;
  } catch (err) {
    log(`Poll error: ${err instanceof Error ? err.message : String(err)}`);
    return 0;
  }
}

export async function fetchHistory(): Promise<number> {
  try {
    const res = await fetch(CONFIG.OREF_HISTORY_URL, { headers: CONFIG.OREF_HEADERS });
    const text = await res.text();

    if (!text || text.trim() === "" || text.trim() === "[]") {
      log("History: empty response");
      return 0;
    }

    // Guard: if server returned HTML instead of JSON, skip
    if (text.trim().startsWith("<")) {
      log("History: received HTML instead of JSON — endpoint may require auth");
      return 0;
    }

    const data = JSON.parse(text);
    const entries = Array.isArray(data) ? data : [data];

    // Filter to relevant categories (1=rockets, 2=hostile aircraft)
    const relevant = entries.filter((e: { category: number }) => e.category === 1 || e.category === 2);

    // Group by timestamp (entries in same minute = same event)
    const groups = new Map<string, { alertDate: string; category: number; cities: string[] }>();
    for (const entry of relevant) {
      // Round to minute for grouping
      const key = entry.alertDate.slice(0, 16) + "|" + entry.category;
      const existing = groups.get(key);
      if (existing) {
        existing.cities.push(entry.data);
      } else {
        groups.set(key, { alertDate: entry.alertDate, category: entry.category, cities: [entry.data] });
      }
    }

    let recovered = 0;
    for (const [, group] of groups) {
      const timestamp = new Date(group.alertDate.replace(" ", "T") + "+03:00"); // Israel time
      const parsed = parseOrefAlert(
        { cat: String(group.category), data: group.cities },
        timestamp
      );

      if (parsed.date < CONFIG.WAR_START) continue;

      const inserted = insertAlert(parsed);
      if (inserted) recovered++;
    }

    if (recovered > 0) {
      log(`History: recovered ${recovered} alert(s)`);
    } else {
      log("History: no new alerts to recover");
    }
    return recovered;
  } catch (err) {
    log(`History error: ${err instanceof Error ? err.message : String(err)}`);
    return 0;
  }
}
