import { type Lang, t } from "../i18n";

interface Props { lang: Lang; }

const RESOURCES = [
  { icon: "🚨", name: { en: "Pikud HaOref", es: "Pikud HaOref", he: "פיקוד העורף" }, desc: { en: "Official alerts & shelters", es: "Alertas oficiales y refugios", he: "התרעות רשמיות ומקלטים" }, url: "https://www.oref.org.il/en" },
  { icon: "📱", name: { en: "Tzofar App", es: "App Tzofar", he: "אפליקציית צופר" }, desc: { en: "Real-time siren alerts", es: "Alertas de sirena en tiempo real", he: "התרעות צפירה בזמן אמת" }, url: "https://www.tzofar.com" },
  { icon: "🏥", name: { en: "MDA — Call 101", es: "MDA — Llamar 101", he: "מד\"א — חייג 101" }, desc: { en: "Emergency medical services", es: "Servicios medicos de emergencia", he: "שירותי רפואת חירום" }, url: "https://www.mdais.org" },
  { icon: "📞", name: { en: "ERAN — 1201", es: "ERAN — 1201", he: "ער\"ן — 1201" }, desc: { en: "Mental health 24/7", es: "Salud mental 24/7", he: "סיוע נפשי 24/7" }, url: "https://en.eran.org.il" },
  { icon: "🗺️", name: { en: "Find Shelter", es: "Buscar Refugio", he: "מצא מקלט" }, desc: { en: "Nearest public shelter", es: "Refugio publico mas cercano", he: "המקלט הציבורי הקרוב" }, url: "https://www.oref.org.il/en/shelters" },
];

export default function EmergencyResources({ lang }: Props) {
  return (
    <section className="wd-section wd-section-emergency">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">{t("sec06", lang)}</span>
        <span className="wd-section-title">{t("emergency", lang)}</span>
        <span className="wd-section-line" />
      </div>

      <div className="wd-emergency-alert">
        {t("emergency_alert", lang)}
      </div>

      <div className="wd-emergency-grid">
        {RESOURCES.map(r => (
          <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="wd-emergency-card">
            <span className="wd-emergency-icon">{r.icon}</span>
            <div>
              <div className="wd-emergency-name">{r.name[lang]}</div>
              <div className="wd-emergency-desc">{r.desc[lang]}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
