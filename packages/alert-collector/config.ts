import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CONFIG = {
  // Polling intervals
  POLL_INTERVAL_MS: 3 * 60 * 1000,         // 3 minutes
  HISTORY_INTERVAL_MS: 60 * 60 * 1000,     // 1 hour

  // Push schedule (Israel time, 24h format)
  PUSH_TIMES: [
    { hour: 11, minute: 30 },
    { hour: 17, minute: 0 },
  ],

  // Paths
  DB_PATH: path.join(__dirname, "data", "alerts.db"),
  MONOREPO_ROOT: path.join(__dirname, "..", ".."),
  SHARED_DATA_PATH: path.join(__dirname, "..", "shared", "data"),
  MP_DATA_PATH: path.join(__dirname, "..", "..", "apps", "missile-probability", "public", "data"),
  WD_DATA_PATH: path.join(__dirname, "..", "..", "apps", "wardashboard", "public", "data"),

  // Pikud HaOref API
  OREF_ALERTS_URL: "https://www.oref.org.il/WarningMessages/alert/alerts.json",
  OREF_HISTORY_URL: "https://www.oref.org.il/WarningMessages/History/AlertsHistory.json",
  OREF_HEADERS: {
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.oref.org.il/",
    "User-Agent": "Mozilla/5.0",
  },

  // War start date
  WAR_START: "2026-02-28",

  // Israel timezone
  TZ: "Asia/Jerusalem",
};
