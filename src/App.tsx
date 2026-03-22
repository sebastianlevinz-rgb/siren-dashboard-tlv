import { useState, useEffect, useCallback } from "react";
import type { Alert } from "./types";
import Header from "./components/Header";
import Heatmap from "./components/Heatmap";
import DailyTimeline from "./components/DailyTimeline";
import HourlyHistogram from "./components/HourlyHistogram";
import TrendChart from "./components/TrendChart";
import Recommendations from "./components/Recommendations";
import { fetchFromLocalCSV } from "./utils/sheets";
import "./App.css";

type TabId = "heatmap" | "timeline" | "histogram" | "trend" | "tips";

const TABS: { id: TabId; label: string }[] = [
  { id: "heatmap", label: "Heatmap" },
  { id: "timeline", label: "Timeline" },
  { id: "histogram", label: "By Hour" },
  { id: "trend", label: "Trend" },
  { id: "tips", label: "Tips" },
];

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("heatmap");

  const loadData = useCallback(async () => {
    try {
      const data = await fetchFromLocalCSV();
      if (data.length > 0) { setAlerts(data); return; }
    } catch { /* fallback */ }
    try {
      const res = await fetch("/data/alerts.json");
      if (res.ok) setAlerts(await res.json());
    } catch (e) { console.error("Data load failed:", e); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showHeader = activeTab === "heatmap";

  return (
    <div className="app">
      {showHeader && <Header alerts={alerts} />}

      <nav className="tab-nav">
        <span className="tab-brand">MISSILE PROBABILITY</span>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="dashboard-main">
        {activeTab === "heatmap" && <Heatmap alerts={alerts} />}
        {activeTab === "timeline" && <DailyTimeline alerts={alerts} />}
        {activeTab === "histogram" && <HourlyHistogram alerts={alerts} />}
        {activeTab === "trend" && <TrendChart alerts={alerts} />}
        {activeTab === "tips" && <Recommendations alerts={alerts} />}
      </main>

      <footer className="dashboard-footer">
        <span>Data: Tzofar Telegram @tzevaadom_en | Gush Dan only</span>
        <span>Made by Sebastian Levin Z</span>
        <span>Personal dashboard — does not replace Pikud HaOref</span>
      </footer>
    </div>
  );
}

export default App;
