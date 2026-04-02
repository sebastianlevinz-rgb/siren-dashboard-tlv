import { useState } from "react";
import { type Lang } from "../i18n";
import { COUNTRY_PATHS } from "../data/country-paths";

interface Props { lang: Lang; }

interface CarrierGroup {
  name: string;
  tag: string;
  pos: [number, number]; // SVG x,y
  location: Record<string, string>;
  confirmed: boolean;
}

interface Base {
  name: string;
  country: string;
  pos: [number, number];
  role: Record<string, string>;
}

interface POI {
  name: string;
  pos: [number, number];
  type: "island" | "strait" | "nuclear" | "city";
  info: Record<string, string>;
}

const CARRIERS: CarrierGroup[] = [
  { name: "USS Harry S. Truman (CVN-75)", tag: "CSG-8", pos: [560, 480], location: { en: "Arabian Sea — South of Hormuz", es: "Mar Arabigo — Sur de Hormuz", he: "ים ערב — דרום הורמוז" }, confirmed: true },
  { name: "2nd CSG (unconfirmed)", tag: "CSG-?", pos: [520, 540], location: { en: "Gulf of Oman — Unconfirmed by OSINT", es: "Golfo de Oman — No confirmado", he: "מפרץ עומאן — לא מאושר" }, confirmed: false },
];

const BASES: Base[] = [
  { name: "Al Udeid", country: "QAT", pos: [372, 540], role: { en: "CENTCOM HQ — CAOC air ops", es: "Cuartel CENTCOM — Ops aereas", he: "מפקדת CENTCOM — אוויר" } },
  { name: "Al Dhafra", country: "UAE", pos: [420, 560], role: { en: "F-35, F-22, ISR — Stealth base", es: "F-35, F-22, ISR — Base stealth", he: "F-35, F-22 — בסיס חמקני" } },
  { name: "Arifjan", country: "KWT", pos: [275, 435], role: { en: "Army logistics — Ground staging", es: "Logistica ejercito", he: "לוגיסטיקה יבשתית" } },
  { name: "5th Fleet", country: "BHR", pos: [350, 510], role: { en: "US 5th Fleet HQ — Naval command", es: "5ta Flota — Comando naval", he: "צי 5 — פיקוד ימי" } },
  { name: "Prince Sultan", country: "SAU", pos: [180, 530], role: { en: "Patriots, fighters", es: "Patriot, cazas", he: "פטריוט, קרב" } },
  { name: "Diego Garcia", country: "BIOT", pos: [740, 710], role: { en: "B-2/B-52 bombers — Indian Ocean", es: "B-2/B-52 — Oceano Indico", he: "מפציצי B-2/B-52" } },
];

const POIS: POI[] = [
  { name: "Kharg Island", pos: [350, 395], type: "island", info: { en: "90% of Iran's oil exports", es: "90% del petroleo irani", he: "90% מיצוא הנפט" } },
  { name: "Strait of Hormuz", pos: [480, 505], type: "strait", info: { en: "21% global oil transit — 33km wide", es: "21% transito mundial — 33km", he: "21% מהנפט העולמי — 33 ק\"מ" } },
  { name: "Tehran", pos: [390, 220], type: "city", info: { en: "Capital — Command center", es: "Capital", he: "בירה — מרכז פיקוד" } },
  { name: "Natanz", pos: [380, 280], type: "nuclear", info: { en: "Centrifuge site — Fortified underground", es: "Centrifugas — Subterraneo fortificado", he: "צנטריפוגות — תת-קרקעי מבוצר" } },
  { name: "Isfahan", pos: [370, 300], type: "nuclear", info: { en: "Uranium enrichment — Underground", es: "Enriquecimiento — Subterraneo", he: "העשרת אורניום — תת-קרקעי" } },
  { name: "Bushehr", pos: [335, 430], type: "nuclear", info: { en: "Nuclear reactor — Russian-built", es: "Reactor nuclear — Ruso", he: "כור גרעיני — רוסי" } },
  { name: "Fordow", pos: [370, 260], type: "nuclear", info: { en: "Deep underground enrichment", es: "Enriquecimiento profundo", he: "העשרה עמוק תת-קרקעית" } },
];

const COUNTRY_LABELS: Record<string, { pos: [number, number]; name: string }> = {
  IRN: { pos: [420, 320], name: "IRAN" },
  IRQ: { pos: [170, 310], name: "IRAQ" },
  SAU: { pos: [180, 650], name: "SAUDI ARABIA" },
  PAK: { pos: [700, 400], name: "PAKISTAN" },
  TUR: { pos: [80, 130], name: "TURKEY" },
  OMN: { pos: [500, 660], name: "OMAN" },
};

const WATER_LABELS = [
  { pos: [370, 470], name: "Persian Gulf" },
  { pos: [540, 600], name: "Arabian Sea" },
  { pos: [580, 440], name: "Gulf of Oman" },
];

const TEXT = {
  title: { en: "SITUATION ROOM", es: "SALA DE SITUACION", he: "חדר מצב" },
  sub: { en: "US military positioning — Iran–Israel–US Conflict", es: "Posicionamiento militar — Conflicto Iran–Israel–EEUU", he: "מערך צבאי — עימות איראן–ישראל–ארה\"ב" },
  updated: { en: `Last updated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, es: `Actualizado: ${new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`, he: `עדכון אחרון: ${new Date().toLocaleDateString("he-IL")}` },
  disclaimer: { en: "Based on OSINT and public reports. Positions approximate.", es: "Basado en OSINT y reportes publicos. Posiciones aproximadas.", he: "מבוסס על מודיעין גלוי. מיקומים משוערים." },
  carriers: { en: "CARRIERS", es: "PORTAAVIONES", he: "נושאות מטוסים" },
  bases: { en: "US BASES", es: "BASES EEUU", he: "בסיסים אמריקאיים" },
  nuclear: { en: "NUCLEAR SITES", es: "SITIOS NUCLEARES", he: "אתרים גרעיניים" },
  oil: { en: "OIL / STRATEGIC", es: "PETROLEO / ESTRATEGICO", he: "נפט / אסטרטגי" },
  moon: { en: "Waxing Gibbous ~80% — good night visibility", es: "Gibosa creciente ~80% — buena visibilidad", he: "ירח גדל ~80% — ראות לילה טובה" },
  force: { en: "~45,000 CENTCOM personnel · 1-2 CSGs · 7 forward bases · ~180 aircraft", es: "~45,000 personal CENTCOM · 1-2 grupos · 7 bases · ~180 aviones", he: "~45,000 אנשי CENTCOM · 1-2 כוחות שייט · 7 בסיסים · ~180 מטוסים" },
};

export default function SituationRoom({ lang }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const selCarrier = CARRIERS.find(c => c.name === selected);
  const selBase = BASES.find(b => b.name === selected);
  const selPOI = POIS.find(p => p.name === selected);

  return (
    <section className="wd-section wd-sitroom">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">CLASSIFIED</span>
        <span className="wd-section-title">{TEXT.title[lang]}</span>
        <span className="wd-section-line" />
      </div>
      <p className="wd-subtitle">{TEXT.sub[lang]} · <span style={{ color: "var(--text-muted)" }}>{TEXT.updated[lang]}</span></p>

      {/* Force summary one-liner */}
      <div className="sr-force-bar">{TEXT.force[lang]}</div>

      {/* Moon */}
      <div className="sr-moon-alert">🌔 {TEXT.moon[lang]}</div>

      {/* SVG Map with real geography */}
      <div className="sr-map-wrap">
        <svg viewBox="-120 0 900 760" className="sr-map">
          {/* Ocean background */}
          <rect x="-120" y="0" width="900" height="760" fill="#071220" />

          {/* Country shapes — real GeoJSON outlines */}
          {Object.entries(COUNTRY_PATHS).map(([code, path]) => (
            <path key={code} d={path}
              fill={code === "IRN" ? "#1a1a2e" : "#0f1118"}
              stroke={code === "IRN" ? "#3a3a5e" : "#1a2030"}
              strokeWidth={code === "IRN" ? 1.5 : 0.8}
            />
          ))}

          {/* Country labels */}
          {Object.entries(COUNTRY_LABELS).map(([, { pos, name }]) => (
            <text key={name} x={pos[0]} y={pos[1]} fill="#2a2a4a" fontSize="13" textAnchor="middle" fontWeight="600" fontFamily="monospace">{name}</text>
          ))}

          {/* Water labels */}
          {WATER_LABELS.map(w => (
            <text key={w.name} x={w.pos[0]} y={w.pos[1]} fill="#0d2a4a" fontSize="11" textAnchor="middle" fontStyle="italic" fontFamily="monospace">{w.name}</text>
          ))}

          {/* Strait of Hormuz marker */}
          <circle cx={480} cy={505} r={14} fill="none" stroke="#c93d3d" strokeWidth={1.5} strokeDasharray="4,2" />

          {/* Kharg Island */}
          <circle cx={350} cy={395} r={5} fill="#d4822a" stroke="#fff" strokeWidth={1} />
          <text x={350} y={385} fill="#d4822a" fontSize="8" textAnchor="middle" fontWeight="700" fontFamily="monospace">KHARG</text>

          {/* Nuclear sites */}
          {POIS.filter(p => p.type === "nuclear").map(p => (
            <g key={p.name} onClick={() => setSelected(p.name)} style={{ cursor: "pointer" }}>
              <circle cx={p.pos[0]} cy={p.pos[1]} r={4} fill="#a855f7" opacity={0.8} />
              <text x={p.pos[0] + 8} y={p.pos[1] + 3} fill="#7b7f9e" fontSize="7" fontFamily="monospace">{p.name}</text>
            </g>
          ))}

          {/* Tehran */}
          <g onClick={() => setSelected("Tehran")} style={{ cursor: "pointer" }}>
            <circle cx={390} cy={220} r={5} fill="#7b7f9e" />
            <text x={390} y={210} fill="#9b9fbe" fontSize="9" textAnchor="middle" fontWeight="600" fontFamily="monospace">TEHRAN</text>
          </g>

          {/* US Bases */}
          {BASES.map(b => (
            <g key={b.name} onClick={() => setSelected(b.name)} style={{ cursor: "pointer" }}>
              <rect x={b.pos[0] - 5} y={b.pos[1] - 5} width={10} height={10} rx={2}
                fill="#4A90D9" opacity={selected === b.name ? 1 : 0.7}
                stroke={selected === b.name ? "#fff" : "#4A90D9"} strokeWidth={selected === b.name ? 1.5 : 0.5} />
              <text x={b.pos[0]} y={b.pos[1] - 10} fill="#4A90D9" fontSize="7" textAnchor="middle" fontWeight="600" fontFamily="monospace">{b.name}</text>
            </g>
          ))}

          {/* Carrier Strike Groups */}
          {CARRIERS.map(c => (
            <g key={c.name} onClick={() => setSelected(c.name)} style={{ cursor: "pointer" }}>
              <circle cx={c.pos[0]} cy={c.pos[1]} r={18} fill="none" stroke="#c93d3d" strokeWidth={1} opacity={0.4}>
                <animate attributeName="r" values="18;26;18" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <polygon
                points={`${c.pos[0] - 12},${c.pos[1] + 2} ${c.pos[0] + 12},${c.pos[1] + 2} ${c.pos[0] + 14},${c.pos[1] - 2} ${c.pos[0] - 14},${c.pos[1] - 2}`}
                fill={selected === c.name ? "#c93d3d" : "#6b1a1a"} stroke="#c93d3d" strokeWidth={1} />
              <text x={c.pos[0]} y={c.pos[1] - 18} fill="#c93d3d" fontSize="8" textAnchor="middle" fontWeight="700" fontFamily="monospace">
                {c.tag}{!c.confirmed ? " ?" : ""}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Selected detail */}
      {selCarrier && (
        <div className="sr-detail">
          <span className="sr-detail-icon">🚢</span>
          <div>
            <div className="sr-detail-name">{selCarrier.name}</div>
            <div className="sr-detail-sub">{selCarrier.location[lang]}</div>
            {!selCarrier.confirmed && <div className="sr-detail-warn">⚠ Unconfirmed — based on reports</div>}
          </div>
        </div>
      )}
      {selBase && (
        <div className="sr-detail">
          <span className="sr-detail-icon">🏗️</span>
          <div>
            <div className="sr-detail-name">{selBase.name} — {selBase.country}</div>
            <div className="sr-detail-sub">{selBase.role[lang]}</div>
          </div>
        </div>
      )}
      {selPOI && (
        <div className="sr-detail">
          <span className="sr-detail-icon">{selPOI.type === "nuclear" ? "⚛️" : selPOI.type === "island" ? "🏝️" : selPOI.type === "strait" ? "🌊" : "🏙️"}</span>
          <div>
            <div className="sr-detail-name">{selPOI.name}</div>
            <div className="sr-detail-sub">{selPOI.info[lang]}</div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="sr-legend">
        <span className="sr-legend-item"><span className="sr-legend-dot" style={{ background: "#c93d3d" }} /> {TEXT.carriers[lang]}</span>
        <span className="sr-legend-item"><span className="sr-legend-dot" style={{ background: "#4A90D9", borderRadius: 2 }} /> {TEXT.bases[lang]}</span>
        <span className="sr-legend-item"><span className="sr-legend-dot" style={{ background: "#a855f7" }} /> {TEXT.nuclear[lang]}</span>
        <span className="sr-legend-item"><span className="sr-legend-dot" style={{ background: "#d4822a" }} /> {TEXT.oil[lang]}</span>
      </div>

      <p className="sr-disclaimer">{TEXT.disclaimer[lang]}</p>
    </section>
  );
}
