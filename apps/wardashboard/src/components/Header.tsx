export default function Header() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="wd-header">
      <div className="wd-header-left">
        <div className="wd-brand">⚔️ WAR DASHBOARD</div>
        <div className="wd-tagline">Civilian Intelligence Briefing</div>
      </div>
      <div className="wd-header-right">
        <a href="https://missileprobability.com" target="_blank" rel="noopener noreferrer" className="wd-crosslink">
          🚀 Missile Data ↗
        </a>
        <time className="wd-date">{dateStr}</time>
        <span className="wd-status">
          <span className="wd-status-dot" />
          ACTIVE CONFLICT
        </span>
      </div>
    </header>
  );
}
