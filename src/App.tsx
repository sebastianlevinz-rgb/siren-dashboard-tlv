import { useState, useEffect, useCallback } from "react";
import type { Alert } from "./types";
import Header from "./components/Header";
import Heatmap from "./components/Heatmap";
import DailyTimeline from "./components/DailyTimeline";
import HourlyHistogram from "./components/HourlyHistogram";
import TrendChart from "./components/TrendChart";
import Recommendations from "./components/Recommendations";
import { fetchFromGoogleSheet, fetchFromLocalCSV } from "./utils/sheets";
import "./App.css";

/**
 * DATA SOURCE PRIORITY:
 * 1. Google Sheets (if SHEET_URL is set) — you edit the sheet, dashboard updates
 * 2. Local CSV (public/data/alerts-by-day-hour.csv)
 * 3. Local JSON (public/data/alerts.json) — original generated data
 */

// To connect Google Sheets: paste your published CSV URL here
// Instructions in the README / at the bottom of this file
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYIajuxSFPt3EX788gFhFxgbrulyQYM6myZWmeoI9OgLV0xH1QrqNQNg0vb71OSDmgutbPCzup07qw/pub?gid=1228521043&single=true&output=csv";

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
  const [dataSource, setDataSource] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("heatmap");

  const loadData = useCallback(async () => {
    setLoading(true);

    // 1. Try Google Sheets
    if (SHEET_URL) {
      try {
        const data = await fetchFromGoogleSheet(SHEET_URL);
        if (data.length > 0) {
          setAlerts(data);
          setDataSource("Google Sheets");
          setLastUpdate(new Date().toLocaleString("es-AR"));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Google Sheets fetch failed, trying local CSV:", e);
      }
    }

    // 2. Try local CSV
    try {
      const data = await fetchFromLocalCSV();
      if (data.length > 0) {
        setAlerts(data);
        setDataSource("CSV local");
        setLastUpdate(new Date().toLocaleString("es-AR"));
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Local CSV failed, trying JSON:", e);
    }

    // 3. Fallback to JSON
    try {
      const res = await fetch("/data/alerts.json");
      if (res.ok) {
        const data: Alert[] = await res.json();
        setAlerts(data);
        setDataSource("JSON local");
        setLastUpdate(new Date().toLocaleString("es-AR"));
      }
    } catch (e) {
      console.error("All data sources failed:", e);
    }

    setLoading(false);
  }, []);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="app">
      <Header
        alerts={alerts}
        lastUpdate={lastUpdate}
        dataSource={dataSource}
        onRefresh={refreshData}
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
          Fuente: Tzofar Telegram (tzevaadom.co.il) | {dataSource || "cargando..."}
        </span>
        <span>Dashboard personal — no reemplaza al Pikud HaOref</span>
      </footer>
    </div>
  );
}

export default App;
