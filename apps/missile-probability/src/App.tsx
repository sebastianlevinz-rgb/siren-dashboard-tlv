import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import type { Alert, RegionId } from "@war/shared";
import { type Lang, t, tryT } from "./i18n";
import { buildDailySummaries } from "@war/shared";
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
const Patterns = lazy(() => import("./components/Patterns"));
const Resources = lazy(() => import("./components/Resources"));

type TabId = "heatmap" | "now" | "war" | "timeline" | "histogram" | "trend" | "patterns" | "tips" | "arsenal" | "resources";

const TABS: { id: TabId; icon: string; key: string; href?: string }[] = [
  { id: "heatmap", icon: "🟧", key: "tab_heatmap" },
  { id: "now", icon: "⚡", key: "tab_now" },
  { id: "war", icon: "⚔️", key: "tab_war", href: "https://wardashboard.live" },
  { id: "timeline", icon: "📊", key: "tab_timeline" },
  { id: "histogram", icon: "🕐", key: "tab_byhour" },
  { id: "trend", icon: "📈", key: "tab_trend" },
  { id: "patterns", icon: "🔍", key: "tab_patterns" },
  { id: "tips", icon: "💡", key: "tab_tips" },
  { id: "arsenal", icon: "🎯", key: "tab_arsenal" },
  { id: "resources", icon: "🆘", key: "tab_resources" },
];

const LANGS: Lang[] = ["en", "es", "he"];

const REGIONS: { id: RegionId; key: "region_all" | "region_north" | "region_gush_dan" | "region_jerusalem" | "region_south" }[] = [
  { id: "all", key: "region_all" },
  { id: "north", key: "region_north" },
  { id: "gush_dan", key: "region_gush_dan" },
  { id: "jerusalem", key: "region_jerusalem" },
  { id: "south", key: "region_south" },
];

function filterByRegion(alerts: Alert[], region: RegionId): Alert[] {
  if (region === "all") return alerts;
  if (region === "north") return alerts.filter(a => a.regions?.includes("north") || a.regions?.includes("haifa"));
  if (region === "gush_dan") return alerts.filter(a => a.regions?.includes("gush_dan") || a.regions?.includes("center"));
  return alerts.filter(a => a.regions?.includes(region));
}

function getRegionCounts(alerts: Alert[]): Record<RegionId, number> {
  return {
    all: alerts.length,
    north: alerts.filter(a => a.regions?.includes("north") || a.regions?.includes("haifa")).length,
    gush_dan: alerts.filter(a => a.regions?.includes("gush_dan") || a.regions?.includes("center")).length,
    jerusalem: alerts.filter(a => a.regions?.includes("jerusalem")).length,
    south: alerts.filter(a => a.regions?.includes("south")).length,
  };
}

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("heatmap");
  const [lang, setLang] = useState<Lang>("en");
  const [region, setRegion] = useState<RegionId>("all");

  const loadData = useCallback(async () => {
    // Show cached data instantly (invalidate if missing regions field)
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Alert[];
        if (parsed.length > 0 && parsed[0].regions) setAlerts(parsed);
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

  const regionCounts = useMemo(() => getRegionCounts(alerts), [alerts]);
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
            {t(r.key, lang)} <span className="region-count">{regionCounts[r.id]}</span>
          </button>
        ))}
      </div>

      {/* Tab nav */}
      <nav className="tab-nav">
        {TABS.map((tab) => (
          tab.href ? (
            <a key={tab.id} className="top-tab external-tab" href={tab.href} target="_blank" rel="noopener noreferrer">
              <span className="top-tab-icon">{tab.icon}</span>
              <span className="top-tab-label">{tryT(tab.key, lang)} ↗</span>
            </a>
          ) : (
            <button
              key={tab.id}
              className={`top-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="top-tab-icon">{tab.icon}</span>
              <span className="top-tab-label">{tryT(tab.key, lang)}</span>
            </button>
          )
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
          {activeTab === "patterns" && <Patterns alerts={filtered} lang={lang} />}
          {activeTab === "tips" && <Recommendations alerts={filtered} lang={lang} />}
          {activeTab === "arsenal" && <Arsenal lang={lang} />}
          {activeTab === "resources" && <Resources lang={lang} />}
        </Suspense>
      </main>

      {/* Sticky shelter banner */}
      <div className="mp-sticky-banner" onClick={() => window.open("https://www.google.com/maps/search/public+shelter+miklat+near+me", "_blank")}>
        <span className="mp-banner-dot" />
        {t("shelter_banner", lang)}
      </div>

      <footer className="dashboard-footer">
        <span>Data: Tzofar Telegram @tzevaadom_en</span>
        <span>Desarrollado por Sebastian Levin Z 🇦🇷 · <a href="mailto:sebastianlevinz@gmail.com">Contact</a></span>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
