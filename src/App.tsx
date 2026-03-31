import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import type { Alert, RegionId } from "./types";
import { type Lang, t } from "./i18n";
import { buildDailySummaries } from "./utils/data";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

const CACHE_KEY = "missilecast-alerts";

const Heatmap = lazy(() => import("./components/Heatmap"));
const Now = lazy(() => import("./components/Now"));
const DailyTimeline = lazy(() => import("./components/DailyTimeline"));
const HourlyHistogram = lazy(() => import("./components/HourlyHistogram"));
const TrendChart = lazy(() => import("./components/TrendChart"));
const Recommendations = lazy(() => import("./components/Recommendations"));
const Arsenal = lazy(() => import("./components/Arsenal"));

type TabId = "heatmap" | "now" | "timeline" | "histogram" | "trend" | "tips" | "arsenal";

const TABS: { id: TabId; icon: string; key: "tab_heatmap" | "tab_now" | "tab_timeline" | "tab_byhour" | "tab_trend" | "tab_tips" | "tab_arsenal" }[] = [
  { id: "heatmap", icon: "🟧", key: "tab_heatmap" },
  { id: "now", icon: "⚡", key: "tab_now" },
  { id: "timeline", icon: "📊", key: "tab_timeline" },
  { id: "histogram", icon: "🕐", key: "tab_byhour" },
  { id: "trend", icon: "📈", key: "tab_trend" },
  { id: "tips", icon: "💡", key: "tab_tips" },
  { id: "arsenal", icon: "🎯", key: "tab_arsenal" },
];

const LANGS: Lang[] = ["en", "es", "he"];

const REGIONS: { id: RegionId; key: "region_all" | "region_north" | "region_center" | "region_gush_dan" | "region_jerusalem" | "region_south" }[] = [
  { id: "all", key: "region_all" },
  { id: "north", key: "region_north" },
  { id: "center", key: "region_center" },
  { id: "gush_dan", key: "region_gush_dan" },
  { id: "jerusalem", key: "region_jerusalem" },
  { id: "south", key: "region_south" },
];

function filterByRegion(alerts: Alert[], region: RegionId): Alert[] {
  if (region === "all") return alerts;
  // "north" includes both north and haifa macro-regions
  if (region === "north") return alerts.filter(a => a.regions?.includes("north") || a.regions?.includes("haifa"));
  return alerts.filter(a => a.regions?.includes(region));
}

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("heatmap");
  const [lang, setLang] = useState<Lang>("en");
  const [region, setRegion] = useState<RegionId>("all");

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
      const res = await fetch("/data/alerts.json");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setAlerts(data);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));

          } catch { /* storage full */ }
        }
      }
    } catch { /* offline — cached data already shown */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { document.documentElement.dir = lang === "he" ? "rtl" : "ltr"; }, [lang]);

  const filtered = useMemo(() => filterByRegion(alerts, region), [alerts, region]);
  const days = useMemo(() => buildDailySummaries(filtered), [filtered]);
  const total = filtered.length;
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

      {/* Region selector */}
      <div className="region-nav">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            className={`region-btn ${region === r.id ? "active" : ""}`}
            onClick={() => setRegion(r.id)}
          >
            {t(r.key, lang)}
          </button>
        ))}
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
          {activeTab === "heatmap" && <Heatmap alerts={filtered} lang={lang} total={total} totalDays={totalDays} avg={avg} />}
          {activeTab === "now" && <Now alerts={filtered} lang={lang} />}
          {activeTab === "timeline" && <DailyTimeline alerts={filtered} lang={lang} />}
          {activeTab === "histogram" && <HourlyHistogram alerts={filtered} lang={lang} />}
          {activeTab === "trend" && <TrendChart alerts={filtered} lang={lang} />}
          {activeTab === "tips" && <Recommendations alerts={filtered} lang={lang} />}
          {activeTab === "arsenal" && <Arsenal lang={lang} />}
        </Suspense>
      </main>

      <footer className="dashboard-footer">
        <span>Data: Tzofar Telegram @tzevaadom_en</span>
        <span>Desarrollado por Sebastian Levin Z 🇦🇷</span>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
