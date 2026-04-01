import { useState, lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

const DailyBriefing = lazy(() => import("./components/DailyBriefing"));
const WeeklySummary = lazy(() => import("./components/WeeklySummary"));
const EventTimeline = lazy(() => import("./components/EventTimeline"));
const ContentLab = lazy(() => import("./components/ContentLab"));

type TabId = "today" | "week" | "timeline" | "content";

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "today", icon: "📋", label: "Today" },
  { id: "week", icon: "📊", label: "This Week" },
  { id: "timeline", icon: "⏳", label: "Timeline" },
  { id: "content", icon: "🎬", label: "Content Lab" },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("today");

  return (
    <div className="app">
      <div className="header-bar">
        <div>
          <div className="header-brand">⚔️ WAR DASHBOARD</div>
          <div className="header-tagline">Daily intelligence briefing on the Iran-Israel conflict</div>
        </div>
      </div>

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`top-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="dashboard-main">
        <Suspense fallback={<div className="panel"><p className="text-secondary">Loading...</p></div>}>
          {activeTab === "today" && <DailyBriefing />}
          {activeTab === "week" && <WeeklySummary />}
          {activeTab === "timeline" && <EventTimeline />}
          {activeTab === "content" && <ContentLab />}
        </Suspense>
      </main>

      <footer className="dashboard-footer">
        <span>Data: Tzofar Telegram @tzevaadom_en</span>
        <span>By Sebastian Levin Z · <a href="mailto:sebastianlevinz@gmail.com">Contact</a></span>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
