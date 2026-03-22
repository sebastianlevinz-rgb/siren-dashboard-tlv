import { useState, useEffect, useCallback } from "react";
import type { Alert } from "./types";
import Header from "./components/Header";
import Heatmap from "./components/Heatmap";
import DailyTimeline from "./components/DailyTimeline";
import HourlyHistogram from "./components/HourlyHistogram";
import TrendChart from "./components/TrendChart";
import Recommendations from "./components/Recommendations";
import "./App.css";

const GUSH_DAN_KEYWORDS = [
  "\u05EA\u05DC \u05D0\u05D1\u05D9\u05D1",
  "\u05E8\u05DE\u05EA \u05D2\u05DF",
  "\u05D1\u05E0\u05D9 \u05D1\u05E8\u05E7",
  "\u05D2\u05D1\u05E2\u05EA\u05D9\u05D9\u05DD",
  "\u05D7\u05D5\u05DC\u05D5\u05DF",
  "\u05D1\u05EA \u05D9\u05DD",
  "\u05E4\u05EA\u05D7 \u05EA\u05E7\u05D5\u05D5\u05D4",
  "\u05E8\u05D0\u05E9\u05D5\u05DF \u05DC\u05E6\u05D9\u05D5\u05DF",
  "\u05D4\u05E8\u05E6\u05DC\u05D9\u05D4",
  "\u05D2\u05D1\u05E2\u05EA \u05E9\u05DE\u05D5\u05D0\u05DC",
  "\u05E7\u05E8\u05D9\u05EA \u05D0\u05D5\u05E0\u05D5",
  "\u05D0\u05D5\u05E8 \u05D9\u05D4\u05D5\u05D3\u05D4",
  "\u05D9\u05D4\u05D5\u05D3",
];

function isGushDan(city: string): boolean {
  return GUSH_DAN_KEYWORDS.some((kw) => city.includes(kw));
}

const THREAT_MAP: Record<number, string> = {
  0: "missiles",
  1: "missiles",
  5: "hostile_aircraft",
};

type TabId = "heatmap" | "timeline" | "histogram" | "trend" | "recommendations";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "heatmap", label: "Heatmap", icon: "\u25A6" },
  { id: "timeline", label: "Timeline", icon: "\u2502" },
  { id: "histogram", label: "Prob/Hora", icon: "\u2581" },
  { id: "trend", label: "Tendencia", icon: "\u2191" },
  { id: "recommendations", label: "Tips", icon: "\u2605" },
];

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("\u2014");
  const [activeTab, setActiveTab] = useState<TabId>("heatmap");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/data/alerts.json");
      if (res.ok) {
        const data: Alert[] = await res.json();
        setAlerts(data);
        setLastUpdate(new Date().toLocaleString("es-AR"));
      }
    } catch (e) {
      console.error("Failed to load alerts:", e);
    }
    setLoading(false);
  }, []);

  const fetchLive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.tzevaadom.co.il/alerts-history");
      if (!res.ok) throw new Error("Tzofar API error");
      const data = await res.json();

      const existingIds = new Set(alerts.map((a) => a.id));
      const newAlerts: Alert[] = [];

      for (const group of data) {
        for (const alert of group.alerts) {
          const gushDanCities = alert.cities.filter(isGushDan);
          if (gushDanCities.length === 0) continue;

          const id = `tzofar-${group.id}-${alert.time}`;
          if (existingIds.has(id)) continue;

          const dt = new Date(alert.time * 1000);
          newAlerts.push({
            id,
            timestamp: dt.toISOString(),
            unix: alert.time,
            cities: gushDanCities,
            cities_en: gushDanCities,
            threat: (THREAT_MAP[alert.threat] || "unknown") as Alert["threat"],
            threat_code: alert.threat,
            isDrill: alert.isDrill,
            day_of_week: dt.getDay(),
            hour: dt.getHours(),
            date: dt.toISOString().split("T")[0],
          });
        }
      }

      if (newAlerts.length > 0) {
        const merged = [...alerts, ...newAlerts].sort((a, b) => a.unix - b.unix);
        setAlerts(merged);
      }

      setLastUpdate(new Date().toLocaleString("es-AR"));
    } catch (e) {
      console.error("Live fetch error:", e);
    }
    setLoading(false);
  }, [alerts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="app">
      <Header
        alerts={alerts}
        lastUpdate={lastUpdate}
        onRefresh={fetchLive}
        loading={loading}
      />

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      <main className="dashboard-main">
        {activeTab === "heatmap" && <Heatmap alerts={alerts} />}
        {activeTab === "timeline" && <DailyTimeline alerts={alerts} />}
        {activeTab === "histogram" && <HourlyHistogram alerts={alerts} />}
        {activeTab === "trend" && <TrendChart alerts={alerts} />}
        {activeTab === "recommendations" && <Recommendations alerts={alerts} />}
      </main>

      <footer className="dashboard-footer">
        <span>
          Datos: Tzofar + Pikud HaOref | Stats: Alma Center / ACLED
        </span>
        <span>Dashboard personal — no reemplaza al Pikud HaOref</span>
      </footer>
    </div>
  );
}

export default App;
