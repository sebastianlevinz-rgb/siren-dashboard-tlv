import { useState, useEffect, lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useAlerts } from "./hooks/useAlerts";
import { type Lang, t } from "./i18n";
import Header from "./components/Header";
import WarStats from "./components/WarStats";
import "./App.css";

const DailyIntensity = lazy(() => import("./components/DailyIntensity"));
const RegionBreakdown = lazy(() => import("./components/RegionBreakdown"));
const WeeklyHeatmap = lazy(() => import("./components/WeeklyHeatmap"));
const WarTimeline = lazy(() => import("./components/WarTimeline"));
const EmergencyResources = lazy(() => import("./components/EmergencyResources"));
const ReelsGallery = lazy(() => import("./components/ReelsGallery"));

function App() {
  const { alerts, events, loading } = useAlerts();
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => { document.documentElement.dir = lang === "he" ? "rtl" : "ltr"; }, [lang]);

  const lastDate = alerts.length > 0
    ? [...alerts].sort((a, b) => b.date.localeCompare(a.date))[0].date
    : "";

  return (
    <div className="app">
      <Header lang={lang} onLangChange={setLang} />

      <main className="wd-main">
        {loading ? (
          <div className="wd-loading">
            <div className="wd-loading-pulse" />
            <span>{t("loading", lang)}</span>
          </div>
        ) : (
          <>
            <WarStats alerts={alerts} lang={lang} />

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <DailyIntensity alerts={alerts} lang={lang} />
            </Suspense>

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <RegionBreakdown alerts={alerts} lang={lang} />
            </Suspense>

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <WeeklyHeatmap alerts={alerts} lang={lang} />
            </Suspense>

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <WarTimeline alerts={alerts} events={events} lang={lang} />
            </Suspense>

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <ReelsGallery lang={lang} />
            </Suspense>

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <EmergencyResources lang={lang} />
            </Suspense>
          </>
        )}
      </main>

      {/* Sticky emergency banner */}
      <div className="wd-sticky-banner" onClick={() => window.open("https://www.google.com/maps/search/public+shelter+miklat+near+me", "_blank")}>
        <span className="wd-banner-dot" />
        {t("shelter_banner", lang)}
      </div>

      <footer className="wd-footer">
        <span>{t("data_source", lang)}{lastDate && ` · ${t("through", lang)} ${lastDate}`}</span>
        <span>By Sebastian Levin Z · <a href="mailto:sebastianlevinz@gmail.com">Contact</a></span>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
