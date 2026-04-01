import { type Lang } from "../i18n";

interface Props { lang: Lang; }

interface Resource {
  icon: string;
  title: Record<string, string>;
  desc: Record<string, string>;
  url: string;
  urgency: "critical" | "important" | "useful";
}

const TEXT = {
  title: { en: "Emergency Resources", es: "Recursos de Emergencia", he: "משאבי חירום" },
  sub: {
    en: "Essential links and information for your safety",
    es: "Links esenciales e informacion para tu seguridad",
    he: "קישורים ומידע חיוניים לביטחונך",
  },
  instructions_title: { en: "What to do when the siren sounds", es: "Que hacer cuando suena la sirena", he: "מה לעשות כששומעים צפירה" },
  step1: {
    en: "You have 90 seconds (north) to 15 seconds (Gush Dan) to reach shelter",
    es: "Tenes 90 segundos (norte) a 15 segundos (Gush Dan) para llegar a un refugio",
    he: "יש לך 90 שניות (צפון) עד 15 שניות (גוש דן) להגיע למקלט",
  },
  step2: {
    en: "Enter the nearest shelter, mamad (safe room), or stairwell",
    es: "Entra al refugio mas cercano, mamad (cuarto seguro) o escalera",
    he: "היכנס למקלט, ממ\"ד או חדר מדרגות הקרוב",
  },
  step3: {
    en: "Stay inside for 10 minutes after the last siren",
    es: "Qudate adentro 10 minutos despues de la ultima sirena",
    he: "הישאר בפנים 10 דקות לאחר הצפירה האחרונה",
  },
  step4: {
    en: "If caught outside: lie flat on the ground, cover your head",
    es: "Si te agarra afuera: tirate al piso, cubrite la cabeza",
    he: "אם נתפסת בחוץ: שכב על הרצפה, כסה את הראש",
  },
  time_by_region: { en: "Time to shelter by region", es: "Tiempo para refugiarse por region", he: "זמן להגעה למקלט לפי אזור" },
  seconds: { en: "sec", es: "seg", he: "שנ'" },
};

const RESOURCES: Resource[] = [
  {
    icon: "🚨",
    title: { en: "Pikud HaOref (Home Front Command)", es: "Pikud HaOref (Comando del Frente Interno)", he: "פיקוד העורף" },
    desc: { en: "Official government alert system — real-time sirens and instructions", es: "Sistema oficial de alertas del gobierno — sirenas e instrucciones en tiempo real", he: "מערכת ההתרעה הרשמית — צפירות והנחיות בזמן אמת" },
    url: "https://www.oref.org.il/en",
    urgency: "critical",
  },
  {
    icon: "📱",
    title: { en: "Tzofar / Red Alert App", es: "App Tzofar / Red Alert", he: "אפליקציית צופר" },
    desc: { en: "Real-time push notifications for missile alerts by location", es: "Notificaciones push en tiempo real de alertas de misiles por ubicacion", he: "התראות בזמן אמת לפי מיקום" },
    url: "https://www.tzofar.com",
    urgency: "critical",
  },
  {
    icon: "🗺️",
    title: { en: "Public Shelter Finder", es: "Buscador de Refugios Publicos", he: "מאתר מקלטים ציבוריים" },
    desc: { en: "Find the nearest public shelter (mamad) on the map", es: "Encuentra el refugio publico (mamad) mas cercano en el mapa", he: "מצא את המקלט הציבורי הקרוב על המפה" },
    url: "https://www.oref.org.il/en/shelters",
    urgency: "critical",
  },
  {
    icon: "🏥",
    title: { en: "Magen David Adom (MDA)", es: "Magen David Adom (MDA)", he: "מגן דוד אדום" },
    desc: { en: "Emergency medical services — Call 101", es: "Servicios medicos de emergencia — Llama al 101", he: "שירותי רפואת חירום — חייג 101" },
    url: "https://www.mdais.org",
    urgency: "important",
  },
  {
    icon: "🔥",
    title: { en: "Fire & Rescue — Call 102", es: "Bomberos — Llama al 102", he: "כיבוי והצלה — חייג 102" },
    desc: { en: "Israel Fire and Rescue Services", es: "Servicios de Bomberos y Rescate de Israel", he: "שירותי כיבוי והצלה" },
    url: "https://www.102.gov.il",
    urgency: "important",
  },
  {
    icon: "📞",
    title: { en: "ERAN — Emotional Support (1201)", es: "ERAN — Apoyo Emocional (1201)", he: "ער\"ן — עזרה ראשונה נפשית (1201)" },
    desc: { en: "24/7 mental health helpline for trauma and anxiety", es: "Linea de ayuda 24/7 para trauma y ansiedad", he: "קו סיוע נפשי 24/7 לטראומה וחרדה" },
    url: "https://en.eran.org.il",
    urgency: "useful",
  },
  {
    icon: "🌐",
    title: { en: "Telegram: Sirens in Israel", es: "Telegram: Sirens in Israel", he: "טלגרם: צפירות בישראל" },
    desc: { en: "Real-time Telegram channel with siren alerts — our data source", es: "Canal de Telegram en tiempo real con alertas de sirenas — nuestra fuente de datos", he: "ערוץ טלגרם בזמן אמת עם התרעות צפירה — מקור הנתונים שלנו" },
    url: "https://t.me/tzevaadom_en",
    urgency: "useful",
  },
];

const SHELTER_TIMES = [
  { region: { en: "North (border)", es: "Norte (frontera)", he: "צפון (גבול)" }, seconds: 0, note: { en: "Immediate", es: "Inmediato", he: "מיידי" } },
  { region: { en: "Haifa", es: "Haifa", he: "חיפה" }, seconds: 60, note: null },
  { region: { en: "Gush Dan", es: "Gush Dan", he: "גוש דן" }, seconds: 15, note: null },
  { region: { en: "Jerusalem", es: "Jerusalem", he: "ירושלים" }, seconds: 90, note: null },
  { region: { en: "South (border)", es: "Sur (frontera)", he: "דרום (גבול)" }, seconds: 15, note: null },
];

const URGENCY_COLORS: Record<string, string> = {
  critical: "#c93d3d",
  important: "#d4822a",
  useful: "#6ea8d7",
};

export default function Resources({ lang }: Props) {
  return (
    <div className="panel resources-panel">
      <h2>{TEXT.title[lang]}</h2>
      <p className="panel-subtitle">{TEXT.sub[lang]}</p>

      {/* Instructions card */}
      <div className="res-instructions">
        <h3>{TEXT.instructions_title[lang]}</h3>
        <ol className="res-steps">
          <li>{TEXT.step1[lang]}</li>
          <li>{TEXT.step2[lang]}</li>
          <li>{TEXT.step3[lang]}</li>
          <li>{TEXT.step4[lang]}</li>
        </ol>

        {/* Shelter times */}
        <h4>{TEXT.time_by_region[lang]}</h4>
        <div className="res-times">
          {SHELTER_TIMES.map((s) => (
            <div key={s.region.en} className="res-time-row">
              <span className="res-time-region">{s.region[lang]}</span>
              <div className="res-time-bar-bg">
                <div className="res-time-bar" style={{ width: `${Math.max((s.seconds / 90) * 100, 8)}%` }} />
              </div>
              <span className="res-time-val">{s.note ? s.note[lang] : `${s.seconds} ${TEXT.seconds[lang]}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource links */}
      <div className="res-grid">
        {RESOURCES.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="res-card">
            <div className="res-card-header">
              <span className="res-icon">{r.icon}</span>
              <span className="res-urgency-dot" style={{ background: URGENCY_COLORS[r.urgency] }} />
            </div>
            <span className="res-card-title">{r.title[lang]}</span>
            <span className="res-card-desc">{r.desc[lang]}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
