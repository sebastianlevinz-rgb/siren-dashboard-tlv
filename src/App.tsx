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
type Lang = "en" | "es" | "he";

const TABS: Record<Lang, { id: TabId; label: string }[]> = {
  en: [
    { id: "heatmap", label: "Heatmap" },
    { id: "timeline", label: "Timeline" },
    { id: "histogram", label: "By Hour" },
    { id: "trend", label: "Trend" },
    { id: "tips", label: "Tips" },
  ],
  es: [
    { id: "heatmap", label: "Heatmap" },
    { id: "timeline", label: "Timeline" },
    { id: "histogram", label: "Por Hora" },
    { id: "trend", label: "Tendencia" },
    { id: "tips", label: "Tips" },
  ],
  he: [
    { id: "heatmap", label: "Heatmap" },
    { id: "timeline", label: "Timeline" },
    { id: "histogram", label: "לפי שעה" },
    { id: "trend", label: "מגמה" },
    { id: "tips", label: "טיפים" },
  ],
};

const LANG_LABELS: Record<Lang, string> = { en: "EN", es: "ES", he: "HE" };
const LANG_ORDER: Lang[] = ["en", "es", "he"];

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("heatmap");
  const [lang, setLang] = useState<Lang>("en");

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
      {showHeader && <Header alerts={alerts} lang={lang} />}

      <nav className="tab-nav">
        {TABS[lang].map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <div className="lang-toggle">
          {LANG_ORDER.map((l) => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? "active" : ""}`}
              onClick={() => setLang(l)}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </nav>

      <main className="dashboard-main">
        {activeTab === "heatmap" && <Heatmap alerts={alerts} lang={lang} />}
        {activeTab === "timeline" && <DailyTimeline alerts={alerts} lang={lang} />}
        {activeTab === "histogram" && <HourlyHistogram alerts={alerts} lang={lang} />}
        {activeTab === "trend" && <TrendChart alerts={alerts} />}
        {activeTab === "tips" && <Recommendations alerts={alerts} lang={lang} />}
      </main>

      <footer className="dashboard-footer">
        <span>Data: Tzofar Telegram @tzevaadom_en | Gush Dan only</span>
        <span>Desarrollado por Sebastian Levin Z 🇦🇷</span>
      </footer>
    </div>
  );
}

export default App;
