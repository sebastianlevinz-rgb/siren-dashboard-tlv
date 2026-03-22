import { useState, useEffect, useCallback } from "react";
import type { Alert } from "./types";
import { type Lang, t } from "./i18n";
import Header from "./components/Header";
import Heatmap from "./components/Heatmap";
import DailyTimeline from "./components/DailyTimeline";
import HourlyHistogram from "./components/HourlyHistogram";
import TrendChart from "./components/TrendChart";
import Recommendations from "./components/Recommendations";
import { fetchFromLocalCSV } from "./utils/sheets";
import "./App.css";

type TabId = "heatmap" | "timeline" | "histogram" | "trend" | "tips";

const TAB_KEYS: { id: TabId; key: "tab_heatmap" | "tab_timeline" | "tab_byhour" | "tab_trend" | "tab_tips" }[] = [
  { id: "heatmap", key: "tab_heatmap" },
  { id: "timeline", key: "tab_timeline" },
  { id: "histogram", key: "tab_byhour" },
  { id: "trend", key: "tab_trend" },
  { id: "tips", key: "tab_tips" },
];

const LANGS: Lang[] = ["en", "es", "he"];

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

  return (
    <div className="app">
      {/* Language toggle at the very top */}
      <div className="lang-bar">
        {LANGS.map((l) => (
          <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === "heatmap" && <Header alerts={alerts} lang={lang} />}

      <nav className="tab-nav">
        {TAB_KEYS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {t(tab.key, lang)}
          </button>
        ))}
      </nav>

      <main className="dashboard-main">
        {activeTab === "heatmap" && <Heatmap alerts={alerts} lang={lang} />}
        {activeTab === "timeline" && <DailyTimeline alerts={alerts} lang={lang} />}
        {activeTab === "histogram" && <HourlyHistogram alerts={alerts} lang={lang} />}
        {activeTab === "trend" && <TrendChart alerts={alerts} lang={lang} />}
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
