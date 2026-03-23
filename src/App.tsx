import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import type { Alert } from "./types";
import { type Lang, t } from "./i18n";
import { buildDailySummaries } from "./utils/data";
// Header removed — stats now in stats-bar
import { fetchFromLocalCSV } from "./utils/sheets";
import "./App.css";

const Now = lazy(() => import("./components/Now"));
const Heatmap = lazy(() => import("./components/Heatmap"));
const DailyTimeline = lazy(() => import("./components/DailyTimeline"));
const HourlyHistogram = lazy(() => import("./components/HourlyHistogram"));
const TrendChart = lazy(() => import("./components/TrendChart"));
const Recommendations = lazy(() => import("./components/Recommendations"));

type TabId = "now" | "heatmap" | "timeline" | "histogram" | "trend" | "tips";

const TABS: { id: TabId; icon: string; key: "tab_now" | "tab_heatmap" | "tab_timeline" | "tab_byhour" | "tab_trend" | "tab_tips" }[] = [
  { id: "now", icon: "⚡", key: "tab_now" },
  { id: "heatmap", icon: "🟧", key: "tab_heatmap" },
  { id: "timeline", icon: "📊", key: "tab_timeline" },
  { id: "histogram", icon: "🕐", key: "tab_byhour" },
  { id: "trend", icon: "📈", key: "tab_trend" },
  { id: "tips", icon: "💡", key: "tab_tips" },
];

const LANGS: Lang[] = ["en", "es", "he"];

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("now");
  const [lang, setLang] = useState<Lang>("en");
  const touchStart = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchFromLocalCSV();
      if (data.length > 0) { setAlerts(data); return; }
    } catch { /* fallback */ }
    try {
      const res = await fetch("/data/alerts.json");
      if (res.ok) setAlerts(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { document.documentElement.dir = lang === "he" ? "rtl" : "ltr"; }, [lang]);

  // Swipe
  const tabIds = TABS.map((t) => t.id);
  const currentIdx = tabIds.indexOf(activeTab);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    touchStart.current = null;
    if (Math.abs(diff) < 60) return;
    if (diff > 0 && currentIdx < tabIds.length - 1) setActiveTab(tabIds[currentIdx + 1]);
    else if (diff < 0 && currentIdx > 0) setActiveTab(tabIds[currentIdx - 1]);
  };

  // Stats
  const days = buildDailySummaries(alerts);
  const total = alerts.length;
  const totalDays = days.length;
  const avg = (total / (totalDays || 1)).toFixed(1);

  // Stat navigation map
  const statNav: { value: string; label: string; tab: TabId }[] = [
    { value: String(total), label: t("alerts", lang), tab: "heatmap" },
    { value: `${totalDays}d`, label: t("period", lang), tab: "timeline" },
    { value: avg, label: t("avg_day", lang), tab: "trend" },
  ];

  return (
    <div className="app">
      {/* Top bar: lang + title */}
      <div className="top-bar">
        <span className="top-brand">🚀 MISSILE PROBABILITY</span>
        <div className="lang-bar">
          {LANGS.map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Compact stats bar — always visible, tappable */}
      <div className="stats-bar">
        {statNav.map((s) => (
          <button key={s.label} className="stat-btn" onClick={() => setActiveTab(s.tab)}>
            <span className="stat-btn-value">{s.value}</span>
            <span className="stat-btn-label">{s.label}</span>
          </button>
        ))}
        <div className="stat-updated">
          <span className="stat-btn-value small">Mar 23</span>
          <span className="stat-btn-label">{t("updated", lang)}</span>
        </div>
      </div>

      {/* Swipe indicator dots */}
      <div className="swipe-dots">
        {TABS.map((tab, i) => (
          <div key={tab.id} className={`swipe-dot ${i === currentIdx ? "active" : ""}`} />
        ))}
      </div>

      {/* Main content */}
      <main className="dashboard-main" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <Suspense fallback={<div className="loading-tab">...</div>}>
          {activeTab === "now" && <Now alerts={alerts} lang={lang} />}
          {activeTab === "heatmap" && <Heatmap alerts={alerts} lang={lang} />}
          {activeTab === "timeline" && <DailyTimeline alerts={alerts} lang={lang} />}
          {activeTab === "histogram" && <HourlyHistogram alerts={alerts} lang={lang} />}
          {activeTab === "trend" && <TrendChart alerts={alerts} lang={lang} />}
          {activeTab === "tips" && <Recommendations alerts={alerts} lang={lang} />}
        </Suspense>
      </main>

      {/* Bottom nav bar */}
      <nav className="bottom-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="bottom-tab-icon">{tab.icon}</span>
            <span className="bottom-tab-label">{t(tab.key, lang)}</span>
          </button>
        ))}
      </nav>

      <footer className="dashboard-footer">
        <span>Data: Tzofar Telegram @tzevaadom_en | Gush Dan only</span>
        <span>Desarrollado por Sebastian Levin Z 🇦🇷</span>
      </footer>
    </div>
  );
}

export default App;
