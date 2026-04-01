/**
 * SQLite database wrapper for alert storage.
 */

import Database from "better-sqlite3";
import { CONFIG } from "../config.js";
import type { ParsedAlert } from "./parser.js";
import fs from "fs";
import path from "path";

let db: Database.Database;

export function initDB(): void {
  // Ensure data directory exists
  fs.mkdirSync(path.dirname(CONFIG.DB_PATH), { recursive: true });

  db = new Database(CONFIG.DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datetime TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      hour INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      threat TEXT NOT NULL,
      regions TEXT NOT NULL,
      cities_he TEXT NOT NULL,
      oref_id TEXT,
      raw_cat TEXT,
      UNIQUE(datetime, cities_he)
    );
    CREATE INDEX IF NOT EXISTS idx_date ON alerts(date);
    CREATE INDEX IF NOT EXISTS idx_threat ON alerts(threat);
  `);

  log("Database initialized");
}

export function insertAlert(alert: ParsedAlert): boolean {
  try {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO alerts (datetime, date, time, hour, day_of_week, threat, regions, cities_he, oref_id, raw_cat)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      alert.datetime,
      alert.date,
      alert.time,
      alert.hour,
      alert.day_of_week,
      alert.threat,
      JSON.stringify(alert.regions),
      JSON.stringify(alert.cities_he),
      alert.oref_id,
      alert.raw_cat,
    );
    return result.changes > 0;
  } catch {
    return false;
  }
}

export function hasAlert(orefId: string): boolean {
  const row = db.prepare("SELECT 1 FROM alerts WHERE oref_id = ?").get(orefId);
  return !!row;
}

export function getAllAlerts(): ParsedAlert[] {
  const rows = db.prepare("SELECT * FROM alerts WHERE date >= ? ORDER BY datetime ASC").all(CONFIG.WAR_START) as {
    datetime: string; date: string; time: string; hour: number; day_of_week: number;
    threat: string; regions: string; cities_he: string; oref_id: string; raw_cat: string;
  }[];

  return rows.map(r => ({
    datetime: r.datetime,
    date: r.date,
    time: r.time,
    hour: r.hour,
    day_of_week: r.day_of_week,
    threat: r.threat as ParsedAlert["threat"],
    regions: JSON.parse(r.regions),
    cities_he: JSON.parse(r.cities_he),
    oref_id: r.oref_id,
    raw_cat: r.raw_cat,
  }));
}

export function getAlertCount(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM alerts WHERE date >= ?").get(CONFIG.WAR_START) as { count: number };
  return row.count;
}

function log(msg: string) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(`[${ts}] DB: ${msg}`);
}
