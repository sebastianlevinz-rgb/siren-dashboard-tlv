import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useAlerts } from "./hooks/useAlerts";
import Header from "./components/Header";
import SituationNow from "./components/SituationNow";
import "./App.css";

const WeeklyHeatmap = lazy(() => import("./components/WeeklyHeatmap"));
const WarTimeline = lazy(() => import("./components/WarTimeline"));
const WarStats = lazy(() => import("./components/WarStats"));
const EmergencyResources = lazy(() => import("./components/EmergencyResources"));

function App() {
  const { alerts, events, loading } = useAlerts();

  return (
    <div className="app">
      <Header />

      <main className="wd-main">
        {loading ? (
          <div className="wd-loading">
            <div className="wd-loading-pulse" />
            <span>Loading intelligence data...</span>
          </div>
        ) : (
          <>
            <SituationNow alerts={alerts} />

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <WeeklyHeatmap alerts={alerts} />
            </Suspense>

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <WarTimeline alerts={alerts} events={events} />
            </Suspense>

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <WarStats alerts={alerts} />
            </Suspense>

            <Suspense fallback={<div className="wd-section-skeleton" />}>
              <EmergencyResources />
            </Suspense>
          </>
        )}
      </main>

      <footer className="wd-footer">
        <span>Data: Tzofar Telegram @tzevaadom_en</span>
        <span>By Sebastian Levin Z · <a href="mailto:sebastianlevinz@gmail.com">Contact</a></span>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
