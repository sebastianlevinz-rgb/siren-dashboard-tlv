import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import type { Alert } from "./types";
import { type Lang, t } from "./i18n";
import { buildDailySummaries } from "./utils/data";
import { fetchFromLocalCSV } from "./utils/sheets";
import "./App.css";

const CACHE_KEY = "missilecast-alerts";
const CACHE_TS_KEY = "missilecast-alerts-ts";

const Heatmap = lazy(() => import("./components/Heatmap"));
const Now = lazy(() => import("./components/Now"));
const DailyTimeline = lazy(() => import("./components/DailyTimeline"));
const HourlyHistogram = lazy(() => import("./components/HourlyHistogram"));
const TrendChart = lazy(() => import("./components/TrendChart"));
const Recommendations = lazy(() => import("./components/Recommendations"));

type TabId = "heatmap" | "now" | "timeline" | "histogram" | "trend" | "tips";

const TABS: { id: TabId; icon: string; key: "tab_heatmap" | "tab_now" | "tab_timeline" | "tab_byhour" | "tab_trend" | "tab_tips" }[] = [
  { id: "heatmap", icon: "🟧", key: "tab_heatmap" },
  { id: "now", icon: "⚡", key: "tab_now" },
  { id: "timeline", icon: "📊", key: "tab_timeline" },
  { id: "histogram", icon: "🕐", key: "tab_byhour" },
  { id: "trend", icon: "📈", key: "tab_trend" },
  { id: "tips", icon: "💡", key: "tab_tips" },
];

const LANGS: Lang[] = ["en", "es", "he"];

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("heatmap");
  const [lang, setLang] = useState<Lang>("en");

  const loadData = useCallback(async () => {
    // Show cached data instantly
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Alert[];
        if (parsed.length > 0) setAlerts(parsed);
      }
    } catch { /* ignore corrupt cache */ }

    // Fetch fresh data in background
    try {
      const data = await fetchFromLocalCSV();
      if (data.length > 0) {
        setAlerts(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
        } catch { /* storage full */ }
        return;
      }
    } catch { /* fallback */ }
    try {
      const res = await fetch("/data/alerts.json");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
        } catch { /* storage full */ }
      }
    } catch { /* offline — cached data already shown */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { document.documentElement.dir = lang === "he" ? "rtl" : "ltr"; }, [lang]);

  const days = useMemo(() => buildDailySummaries(alerts), [alerts]);
  const total = alerts.length;
  const totalDays = days.length;
  const avg = (total / (totalDays || 1)).toFixed(1);

  return (
    <div className="app">
      {/* Header bar: brand + lang */}
      <div className="header-bar">
        <span className="header-brand">🚀 MISSILE PROBABILITY</span>
        <div className="header-lang">
          {LANGS.map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`top-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="top-tab-icon">{tab.icon}</span>
            <span className="top-tab-label">{t(tab.key, lang)}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="dashboard-main">
        <Suspense fallback={
          <div className="loading-skeleton">
            <div className="skel-block skel-hero" />
            <div className="skel-block skel-row" />
            <div className="skel-block skel-row" />
            <div className="skel-block skel-row short" />
          </div>
        }>
          {activeTab === "heatmap" && <Heatmap alerts={alerts} lang={lang} total={total} totalDays={totalDays} avg={avg} />}
          {activeTab === "now" && <Now alerts={alerts} lang={lang} />}
          {activeTab === "timeline" && <DailyTimeline alerts={alerts} lang={lang} />}
          {activeTab === "histogram" && <HourlyHistogram alerts={alerts} lang={lang} />}
          {activeTab === "trend" && <TrendChart alerts={alerts} lang={lang} />}
          {activeTab === "tips" && <Recommendations alerts={alerts} lang={lang} />}
        </Suspense>
      </main>

      <footer className="dashboard-footer">
        <span>Data: Tzofar Telegram @tzevaadom_en | Gush Dan only</span>
        <span>Desarrollado por Sebastian Levin Z 🇦🇷</span>
      </footer>
    </div>
  );
}

export default App;
