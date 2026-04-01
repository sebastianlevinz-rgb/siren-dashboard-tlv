const RESOURCES = [
  { icon: "🚨", name: "Pikud HaOref", desc: "Official alerts & shelters", url: "https://www.oref.org.il/en" },
  { icon: "📱", name: "Tzofar App", desc: "Real-time siren alerts", url: "https://www.tzofar.com" },
  { icon: "🏥", name: "MDA — Call 101", desc: "Emergency medical services", url: "https://www.mdais.org" },
  { icon: "📞", name: "ERAN — 1201", desc: "Mental health 24/7", url: "https://en.eran.org.il" },
  { icon: "🗺️", name: "Find Shelter", desc: "Nearest public shelter", url: "https://www.oref.org.il/en/shelters" },
];

export default function EmergencyResources() {
  return (
    <section className="wd-section wd-section-emergency">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">SECTION 05</span>
        <span className="wd-section-title">EMERGENCY</span>
        <span className="wd-section-line" />
      </div>

      <div className="wd-emergency-alert">
        When the siren sounds: go to shelter immediately. Stay for 10 minutes after the last alert.
      </div>

      <div className="wd-emergency-grid">
        {RESOURCES.map(r => (
          <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="wd-emergency-card">
            <span className="wd-emergency-icon">{r.icon}</span>
            <div>
              <div className="wd-emergency-name">{r.name}</div>
              <div className="wd-emergency-desc">{r.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
