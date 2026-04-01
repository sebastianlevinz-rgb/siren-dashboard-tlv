import { useState } from "react";
import { type Lang } from "../i18n";

interface Props { lang: Lang; }

// ── FORCE DATA (will be updated with research) ──

interface CarrierGroup {
  name: string;
  strikeGroup: string;
  position: { x: number; y: number }; // SVG coordinates on the map
  location: Record<string, string>;
  aircraft: number;
  personnel: number;
  escorts: string;
}

interface MilitaryBase {
  name: string;
  country: string;
  position: { x: number; y: number };
  role: Record<string, string>;
}

interface KeyLocation {
  name: string;
  position: { x: number; y: number };
  info: Record<string, string>;
  type: "island" | "strait" | "target" | "city";
}

const CARRIERS: CarrierGroup[] = [
  {
    name: "USS Harry S. Truman (CVN-75)",
    strikeGroup: "CSG-8",
    position: { x: 520, y: 340 },
    location: { en: "Arabian Sea — South of Strait of Hormuz", es: "Mar Arabigo — Sur del Estrecho de Hormuz", he: "הים הערבי — דרום מיצר הורמוז" },
    aircraft: 90,
    personnel: 7500,
    escorts: "2 destroyers, 1 cruiser, 1 submarine (est.)",
  },
  {
    name: "USS Carl Vinson (CVN-70)",
    strikeGroup: "CSG-1",
    position: { x: 390, y: 280 },
    location: { en: "Persian Gulf — Central", es: "Golfo Persico — Centro", he: "המפרץ הפרסי — מרכז" },
    aircraft: 90,
    personnel: 7500,
    escorts: "2 destroyers, 1 cruiser",
  },
  {
    name: "USS Abraham Lincoln (CVN-72)",
    strikeGroup: "CSG-3",
    position: { x: 160, y: 250 },
    location: { en: "Red Sea / Suez approach", es: "Mar Rojo / Acceso a Suez", he: "ים סוף / גישה לסואץ" },
    aircraft: 90,
    personnel: 7500,
    escorts: "3 destroyers, 1 cruiser",
  },
];

const BASES: MilitaryBase[] = [
  { name: "Al Udeid", country: "Qatar", position: { x: 410, y: 290 }, role: { en: "CENTCOM Forward HQ — Air operations center", es: "Cuartel avanzado CENTCOM — Centro de operaciones aereas", he: "מפקדה קדמית CENTCOM — מרכז פעולות אוויריות" } },
  { name: "Al Dhafra", country: "UAE", position: { x: 430, y: 305 }, role: { en: "F-35 & B-2 forward base — Stealth operations", es: "Base avanzada F-35 y B-2 — Operaciones stealth", he: "בסיס קדמי F-35 ו-B-2 — פעולות חמקניות" } },
  { name: "Camp Arifjan", country: "Kuwait", position: { x: 370, y: 240 }, role: { en: "Army forward base — 15,000 troops", es: "Base avanzada del ejercito — 15,000 tropas", he: "בסיס קדמי צבאי — 15,000 חיילים" } },
  { name: "NSA Bahrain", country: "Bahrain", position: { x: 400, y: 270 }, role: { en: "US 5th Fleet HQ — Naval command center", es: "Cuartel de la 5ta Flota — Centro de comando naval", he: "מפקדת הצי ה-5 — מרכז פיקוד ימי" } },
  { name: "Diego Garcia", country: "BIOT", position: { x: 600, y: 520 }, role: { en: "B-2/B-52 bomber staging — Indian Ocean", es: "Base de bombarderos B-2/B-52 — Oceano Indico", he: "בסיס מפציצי B-2/B-52 — האוקיינוס ההודי" } },
];

const KEY_LOCATIONS: KeyLocation[] = [
  { name: "Kharg Island", position: { x: 365, y: 250 }, type: "island", info: { en: "90% of Iran's oil exports. Primary strategic target.", es: "90% de las exportaciones de petroleo de Iran. Objetivo estrategico primario.", he: "90% מיצוא הנפט של איראן. יעד אסטרטגי עיקרי." } },
  { name: "Strait of Hormuz", position: { x: 445, y: 310 }, type: "strait", info: { en: "21% of global oil transit. 33km wide at narrowest. Iran controls north shore.", es: "21% del transito mundial de petroleo. 33km de ancho minimo. Iran controla la costa norte.", he: "21% מהובלת הנפט העולמית. 33 ק\"מ ברוחב המינימלי. איראן שולטת בחוף הצפוני." } },
  { name: "Tehran", position: { x: 420, y: 190 }, type: "city", info: { en: "Capital — Political command center", es: "Capital — Centro de comando politico", he: "בירה — מרכז פיקוד מדיני" } },
  { name: "Bushehr", position: { x: 380, y: 265 }, type: "target", info: { en: "Nuclear power plant — Russian-built", es: "Planta nuclear — Construida por Rusia", he: "כור גרעיני — בניית רוסיה" } },
  { name: "Isfahan", position: { x: 410, y: 220 }, type: "target", info: { en: "Uranium enrichment facility — Underground", es: "Instalacion de enriquecimiento de uranio — Subterranea", he: "מתקן העשרת אורניום — תת-קרקעי" } },
  { name: "Natanz", position: { x: 405, y: 210 }, type: "target", info: { en: "Nuclear centrifuge site — Heavily fortified", es: "Sitio de centrifugas nucleares — Fuertemente fortificado", he: "אתר צנטריפוגות — מבוצר מאוד" } },
];

const TEXT = {
  title: { en: "SITUATION ROOM", es: "SALA DE SITUACION", he: "חדר מצב" },
  sub: {
    en: "US military positioning around Iran — April 2026",
    es: "Posicionamiento militar de EEUU alrededor de Iran — Abril 2026",
    he: "מערך צבאי אמריקאי סביב איראן — אפריל 2026",
  },
  disclaimer: {
    en: "Based on open-source intelligence (OSINT) and public reports. Positions are approximate. Not official military data.",
    es: "Basado en inteligencia de fuentes abiertas (OSINT) y reportes publicos. Posiciones son aproximadas. No son datos militares oficiales.",
    he: "מבוסס על מודיעין גלוי (OSINT) ודיווחים פומביים. המיקומים משוערים. אלו אינם נתונים צבאיים רשמיים.",
  },
  carriers: { en: "CARRIER STRIKE GROUPS", es: "GRUPOS DE ATAQUE DE PORTAAVIONES", he: "כוחות שייט מוטסים" },
  bases: { en: "US MILITARY BASES", es: "BASES MILITARES DE EEUU", he: "בסיסים צבאיים אמריקאיים" },
  key_targets: { en: "KEY LOCATIONS", es: "UBICACIONES CLAVE", he: "מיקומים מרכזיים" },
  personnel: { en: "personnel", es: "personal", he: "אנשי צוות" },
  aircraft: { en: "aircraft", es: "aeronaves", he: "כלי טיס" },
  force_summary: { en: "FORCE SUMMARY", es: "RESUMEN DE FUERZAS", he: "סיכום כוחות" },
  total_carriers: { en: "Carrier Strike Groups", es: "Grupos de Portaaviones", he: "כוחות שייט מוטסים" },
  total_aircraft: { en: "Combat Aircraft (est.)", es: "Aviones de Combate (est.)", he: "מטוסי קרב (הערכה)" },
  total_personnel: { en: "Naval Personnel (est.)", es: "Personal Naval (est.)", he: "אנשי צי (הערכה)" },
  total_bases: { en: "Forward Bases", es: "Bases Avanzadas", he: "בסיסים קדמיים" },
  moon: { en: "Full Moon: Apr 2-3 — Optimal for night operations", es: "Luna Llena: Abr 2-3 — Optimo para operaciones nocturnas", he: "ירח מלא: 2-3 באפריל — אופטימלי לפעולות לילה" },
  kharg: { en: "KHARG ISLAND — 90% of Iran's oil exports", es: "ISLA KHARG — 90% de las exportaciones petroleras de Iran", he: "אי חארג — 90% מיצוא הנפט של איראן" },
  hormuz: { en: "STRAIT OF HORMUZ — 21% of global oil transit", es: "ESTRECHO DE HORMUZ — 21% del transito mundial de petroleo", he: "מיצר הורמוז — 21% מהובלת הנפט העולמית" },
};

export default function SituationRoom({ lang }: Props) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const selectedCarrier = CARRIERS.find(c => c.name === selectedItem);
  const selectedBase = BASES.find(b => b.name === selectedItem);
  const selectedLocation = KEY_LOCATIONS.find(l => l.name === selectedItem);

  return (
    <section className="wd-section wd-sitroom">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">CLASSIFIED</span>
        <span className="wd-section-title">{TEXT.title[lang]}</span>
        <span className="wd-section-line" />
      </div>
      <p className="wd-subtitle">{TEXT.sub[lang]}</p>

      {/* Force Summary Cards */}
      <div className="sr-summary">
        <div className="sr-stat"><span className="sr-stat-val">3</span><span className="sr-stat-label">{TEXT.total_carriers[lang]}</span></div>
        <div className="sr-stat"><span className="sr-stat-val">~270</span><span className="sr-stat-label">{TEXT.total_aircraft[lang]}</span></div>
        <div className="sr-stat"><span className="sr-stat-val">~22,500</span><span className="sr-stat-label">{TEXT.total_personnel[lang]}</span></div>
        <div className="sr-stat"><span className="sr-stat-val">5</span><span className="sr-stat-label">{TEXT.total_bases[lang]}</span></div>
      </div>

      {/* Moon phase alert */}
      <div className="sr-moon-alert">
        🌕 {TEXT.moon[lang]}
      </div>

      {/* SVG Map */}
      <div className="sr-map-wrap">
        <svg viewBox="100 100 600 500" className="sr-map">
          {/* Water */}
          <rect x="100" y="100" width="600" height="500" fill="#0a1628" />

          {/* Simplified land masses */}
          {/* Iran */}
          <path d="M300,140 L480,140 L500,180 L490,220 L470,260 L450,300 L440,320 L430,310 L400,290 L380,270 L350,260 L330,240 L310,220 L290,200 L280,170 Z"
            fill="#1a1a2e" stroke="#252840" strokeWidth="1.5" />
          <text x="390" y="200" fill="#4a4d6a" fontSize="14" textAnchor="middle" fontWeight="600">IRAN</text>

          {/* Arabian Peninsula (Saudi, UAE, Oman, Qatar) */}
          <path d="M250,280 L350,260 L380,270 L400,290 L430,310 L440,320 L450,340 L460,380 L440,420 L400,460 L350,480 L300,480 L260,450 L240,400 L230,350 L240,300 Z"
            fill="#12131c" stroke="#252840" strokeWidth="1.5" />
          <text x="330" y="400" fill="#4a4d6a" fontSize="12" textAnchor="middle">SAUDI ARABIA</text>

          {/* Iraq */}
          <path d="M250,140 L300,140 L290,200 L280,230 L260,250 L250,280 L230,260 L220,220 L220,180 L230,150 Z"
            fill="#12131c" stroke="#252840" strokeWidth="1.5" />
          <text x="255" y="200" fill="#4a4d6a" fontSize="10" textAnchor="middle">IRAQ</text>

          {/* Pakistan */}
          <path d="M500,180 L580,160 L620,200 L610,280 L570,340 L530,360 L490,340 L460,380 L450,340 L440,320 L450,300 L470,260 L490,220 Z"
            fill="#12131c" stroke="#252840" strokeWidth="1.5" />
          <text x="550" y="260" fill="#4a4d6a" fontSize="10" textAnchor="middle">PAKISTAN</text>

          {/* Persian Gulf water label */}
          <text x="390" y="280" fill="#1a3a5c" fontSize="10" textAnchor="middle" fontStyle="italic">Persian Gulf</text>

          {/* Arabian Sea water label */}
          <text x="520" y="420" fill="#1a3a5c" fontSize="10" textAnchor="middle" fontStyle="italic">Arabian Sea</text>

          {/* Strait of Hormuz indicator */}
          <line x1="435" y1="305" x2="455" y2="325" stroke="#c93d3d" strokeWidth="2" strokeDasharray="4,2" />
          <circle cx="445" cy="315" r="12" fill="none" stroke="#c93d3d" strokeWidth="1.5" strokeDasharray="3,2" />

          {/* Kharg Island */}
          <circle cx="365" cy="252" r="6" fill="#d4822a" stroke="#fff" strokeWidth="1" />
          <text x="365" y="243" fill="#d4822a" fontSize="8" textAnchor="middle" fontWeight="700">KHARG</text>

          {/* Key Locations */}
          {KEY_LOCATIONS.filter(l => l.type === "target" || l.type === "city").map(loc => (
            <g key={loc.name} onClick={() => setSelectedItem(loc.name)} style={{ cursor: "pointer" }}>
              <circle cx={loc.position.x} cy={loc.position.y} r={loc.type === "city" ? 5 : 4}
                fill={loc.type === "city" ? "#7b7f9e" : "#c93d3d"} opacity={0.8} />
              <text x={loc.position.x} y={loc.position.y - 8} fill="#7b7f9e" fontSize="7" textAnchor="middle">
                {loc.name}
              </text>
            </g>
          ))}

          {/* Military Bases */}
          {BASES.map(base => (
            <g key={base.name} onClick={() => setSelectedItem(base.name)} style={{ cursor: "pointer" }}>
              <rect x={base.position.x - 5} y={base.position.y - 5} width="10" height="10"
                fill="#4A90D9" opacity={selectedItem === base.name ? 1 : 0.7}
                stroke="#fff" strokeWidth={selectedItem === base.name ? 1.5 : 0.5}
                rx="2" />
              <text x={base.position.x} y={base.position.y - 9} fill="#4A90D9" fontSize="7" textAnchor="middle" fontWeight="600">
                {base.name}
              </text>
            </g>
          ))}

          {/* Carrier Strike Groups */}
          {CARRIERS.map(carrier => (
            <g key={carrier.name} onClick={() => setSelectedItem(carrier.name)} style={{ cursor: "pointer" }}>
              {/* Pulsing circle */}
              <circle cx={carrier.position.x} cy={carrier.position.y} r="18"
                fill="none" stroke="#c93d3d" strokeWidth="1" opacity="0.4">
                <animate attributeName="r" values="18;24;18" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Carrier icon */}
              <polygon points={`${carrier.position.x - 10},${carrier.position.y} ${carrier.position.x + 10},${carrier.position.y} ${carrier.position.x + 12},${carrier.position.y - 3} ${carrier.position.x - 12},${carrier.position.y - 3}`}
                fill={selectedItem === carrier.name ? "#c93d3d" : "#8b1a1a"} stroke="#c93d3d" strokeWidth="1" />
              <text x={carrier.position.x} y={carrier.position.y - 16} fill="#c93d3d" fontSize="7" textAnchor="middle" fontWeight="700">
                {carrier.strikeGroup}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Selection detail panel */}
      {selectedCarrier && (
        <div className="sr-detail">
          <div className="sr-detail-header">
            <span className="sr-detail-icon">🚢</span>
            <div>
              <div className="sr-detail-name">{selectedCarrier.name}</div>
              <div className="sr-detail-sub">{selectedCarrier.strikeGroup} — {selectedCarrier.location[lang]}</div>
            </div>
          </div>
          <div className="sr-detail-stats">
            <span>~{selectedCarrier.aircraft} {TEXT.aircraft[lang]}</span>
            <span>~{selectedCarrier.personnel.toLocaleString()} {TEXT.personnel[lang]}</span>
            <span>{selectedCarrier.escorts}</span>
          </div>
        </div>
      )}
      {selectedBase && (
        <div className="sr-detail">
          <div className="sr-detail-header">
            <span className="sr-detail-icon">🏗️</span>
            <div>
              <div className="sr-detail-name">{selectedBase.name} — {selectedBase.country}</div>
              <div className="sr-detail-sub">{selectedBase.role[lang]}</div>
            </div>
          </div>
        </div>
      )}
      {selectedLocation && (
        <div className="sr-detail">
          <div className="sr-detail-header">
            <span className="sr-detail-icon">{selectedLocation.type === "island" ? "🏝️" : selectedLocation.type === "strait" ? "🌊" : selectedLocation.type === "city" ? "🏙️" : "⚛️"}</span>
            <div>
              <div className="sr-detail-name">{selectedLocation.name}</div>
              <div className="sr-detail-sub">{selectedLocation.info[lang]}</div>
            </div>
          </div>
        </div>
      )}

      {/* Key intel callouts */}
      <div className="sr-intel-cards">
        <div className="sr-intel-card sr-intel-orange">
          <span className="sr-intel-icon">🏝️</span>
          <span className="sr-intel-text">{TEXT.kharg[lang]}</span>
        </div>
        <div className="sr-intel-card sr-intel-red">
          <span className="sr-intel-icon">🌊</span>
          <span className="sr-intel-text">{TEXT.hormuz[lang]}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="sr-legend">
        <span className="sr-legend-item"><span className="sr-legend-dot" style={{ background: "#c93d3d" }} /> {TEXT.carriers[lang]}</span>
        <span className="sr-legend-item"><span className="sr-legend-dot" style={{ background: "#4A90D9", borderRadius: 2 }} /> {TEXT.bases[lang]}</span>
        <span className="sr-legend-item"><span className="sr-legend-dot" style={{ background: "#d4822a" }} /> {TEXT.key_targets[lang]}</span>
      </div>

      <p className="sr-disclaimer">{TEXT.disclaimer[lang]}</p>
    </section>
  );
}
