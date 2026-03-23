import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import type { Alert } from "./types";
import { type Lang, t } from "./i18n";
import Header from "./components/Header";
import { fetchFromLocalCSV } from "./utils/sheets";
import "./App.css";

// Lazy-loaded tabs
const Now = lazy(() => import("./components/Now"));
const Heatmap = lazy(() => import("./components/Heatmap"));
const DailyTimeline = lazy(() => import("./components/DailyTimeline"));
const HourlyHistogram = lazy(() => import("./components/HourlyHistogram"));
const TrendChart = lazy(() => import("./components/TrendChart"));
const Recommendations = lazy(() => import("./components/Recommendations"));

type TabId = "now" | "heatmap" | "timeline" | "histogram" | "trend" | "tips";

const TAB_KEYS: { id: TabId; key: "tab_now" | "tab_heatmap" | "tab_timeline" | "tab_byhour" | "tab_trend" | "tab_tips" }[] = [
  { id: "now", key: "tab_now" },
  { id: "heatmap", key: "tab_heatmap" },
  { id: "timeline", key: "tab_timeline" },
  { id: "histogram", key: "tab_byhour" },
  { id: "trend", key: "tab_trend" },
  { id: "tips", key: "tab_tips" },
];

const LANGS: Lang[] = ["en", "es", "he"];

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("now");
  const [lang, setLang] = useState<Lang>("en");
  const mainRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

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

  // RTL for Hebrew
  useEffect(() => {
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  // Swipe between tabs
  const tabIds = TAB_KEYS.map((t) => t.id);
  const currentIdx = tabIds.indexOf(activeTab);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    touchStart.current = null;

    if (Math.abs(diff) < 60) return; // too small

    if (diff > 0 && currentIdx < tabIds.length - 1) {
      // Swipe left -> next tab
      setActiveTab(tabIds[currentIdx + 1]);
    } else if (diff < 0 && currentIdx > 0) {
      // Swipe right -> prev tab
      setActiveTab(tabIds[currentIdx - 1]);
    }
  };

  const showHeader = activeTab === "now" || activeTab === "heatmap";

  return (
    <div className="app">
      <div className="lang-bar">
        {LANGS.map((l) => (
          <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {showHeader && <Header alerts={alerts} lang={lang} />}

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

      <main
        className="dashboard-main"
        ref={mainRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Suspense fallback={<div className="loading-tab">...</div>}>
          {activeTab === "now" && <Now alerts={alerts} lang={lang} />}
          {activeTab === "heatmap" && <Heatmap alerts={alerts} lang={lang} />}
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
