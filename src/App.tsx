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

  return (
    <div className="app">
      <Header alerts={alerts} />

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
        <span>Datos: Tzofar Telegram @tzevaadom_en | Solo Gush Dan/TLV</span>
        <span>Dashboard personal — no reemplaza al Pikud HaOref</span>
      </footer>
    </div>
  );
}

export default App;
