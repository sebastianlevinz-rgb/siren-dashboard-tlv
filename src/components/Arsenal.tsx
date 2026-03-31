import { type Lang } from "../i18n";

interface Weapon {
  name: string;
  type: "drone" | "ballistic" | "cruise" | "hypersonic";
  typeLabel: { en: string; es: string; he: string };
  range: string;
  speed: string;
  warhead: string;
  fact: { en: string; es: string; he: string };
  used: string[]; // attack labels
}

const WEAPONS: Weapon[] = [
  {
    name: "Shahed-136",
    type: "drone",
    typeLabel: { en: "Attack Drone", es: "Dron de Ataque", he: "מל\"ט תקיפה" },
    range: "2,000 km",
    speed: "185 km/h",
    warhead: "40-50 kg",
    fact: {
      en: "Costs only $20,000-$50,000 per unit — one of the cheapest precision weapons in the world. Also supplied to Russia for use in Ukraine.",
      es: "Cuesta solo $20,000-$50,000 por unidad — una de las armas de precision mas baratas del mundo. Tambien suministrado a Rusia para uso en Ucrania.",
      he: "עולה רק 20,000-50,000$ ליחידה — אחד כלי הנשק המדויקים הזולים בעולם. גם סופק לרוסיה לשימוש באוקראינה.",
    },

    used: ["Apr 2024", "Oct 2024"],
  },
  {
    name: "Shahed-131",
    type: "drone",
    typeLabel: { en: "Attack Drone", es: "Dron de Ataque", he: "מל\"ט תקיפה" },
    range: "900 km",
    speed: "185 km/h",
    warhead: "10-15 kg",
    fact: {
      en: "Smaller sibling of the Shahed-136. Its compact size makes it harder to detect on radar, often launched in swarms alongside its bigger brother.",
      es: "Hermano menor del Shahed-136. Su tamano compacto lo hace mas dificil de detectar en radar, a menudo lanzado en enjambres junto a su hermano mayor.",
      he: "האח הקטן של שאהד-136. גודלו הקומפקטי מקשה על זיהויו ברדאר, ולרוב משוגר בנחילים יחד עם אחיו הגדול.",
    },

    used: ["Apr 2024"],
  },
  {
    name: "Kheibar Shekan",
    type: "ballistic",
    typeLabel: { en: "Ballistic Missile", es: "Misil Balistico", he: "טיל בליסטי" },
    range: "1,450 km",
    speed: "Mach 8-10",
    warhead: "450-500 kg",
    fact: {
      en: "Uses solid fuel — can launch in minutes with zero prep time. Name means \"Castle Buster\". Reportedly penetrated Israeli defenses and struck Nevatim Air Base in Oct 2024.",
      es: "Usa combustible solido — puede lanzarse en minutos sin preparacion. Su nombre significa \"Destructor de Castillos\". Reportaron que penetro las defensas israelies e impacto la base aerea Nevatim en oct 2024.",
      he: "משתמש בדלק מוצק — יכול לשיגור תוך דקות ללא הכנה. השם פירושו \"שובר מבצרים\". לפי דיווחים חדר את ההגנות הישראליות ופגע בבסיס נבטים באוקטובר 2024.",
    },

    used: ["Apr 2024", "Oct 2024"],
  },
  {
    name: "Emad",
    type: "ballistic",
    typeLabel: { en: "Ballistic Missile", es: "Misil Balistico", he: "טיל בליסטי" },
    range: "1,700 km",
    speed: "Mach 5+",
    warhead: "~750 kg",
    fact: {
      en: "Iran's first missile with a maneuverable reentry vehicle (MaRV) — it can steer during its final dive, making it far more accurate than its Shahab-3 ancestor. \"Emad\" means \"pillar\" in Farsi.",
      es: "El primer misil de Iran con vehiculo de reentrada maniobrable (MaRV) — puede dirigirse durante su caida final, haciendolo mucho mas preciso que su ancestro Shahab-3. \"Emad\" significa \"pilar\" en farsi.",
      he: "הטיל הראשון של איראן עם ראש חוזר מתמרן (MaRV) — יכול לכוון את עצמו בצלילה האחרונה, מה שהופך אותו למדויק הרבה יותר מקודמו שהאב-3. \"עמאד\" פירושו \"עמוד\" בפרסית.",
    },

    used: ["Apr 2024", "Oct 2024"],
  },
  {
    name: "Fattah-1",
    type: "hypersonic",
    typeLabel: { en: "Hypersonic Missile", es: "Misil Hipersonico", he: "טיל היפרסוני" },
    range: "1,400 km",
    speed: "Mach 13-15*",
    warhead: "~450 kg",
    fact: {
      en: "Iran claims it's their first hypersonic missile with a \"movable nozzle\" designed to defeat Arrow & David's Sling. Western analysts are skeptical of the Mach 15 claim. First combat use: Oct 2024.",
      es: "Iran afirma que es su primer misil hipersonico con \"tobera movil\" disenado para derrotar Arrow y Honda de David. Analistas occidentales son escepticos sobre la velocidad Mach 15. Primer uso en combate: oct 2024.",
      he: "איראן טוענת שזהו הטיל ההיפרסוני הראשון שלהם עם \"פיית מנוע ניתנת לכיוון\" שתוכנן לנצח את חץ וקלע דוד. מומחים מערביים מפקפקים בטענת מאך 15. שימוש קרבי ראשון: אוקטובר 2024.",
    },

    used: ["Oct 2024"],
  },
  {
    name: "Ghadr",
    type: "ballistic",
    typeLabel: { en: "Ballistic Missile", es: "Misil Balistico", he: "טיל בליסטי" },
    range: "1,950 km",
    speed: "Mach 5+",
    warhead: "650-750 kg",
    fact: {
      en: "Achieved longer range than the Shahab-3 by using a smaller \"baby bottle\"-shaped reentry vehicle that reduces weight and drag. One of the first Iranian missiles able to reach Israel from Iranian soil.",
      es: "Logro mayor alcance que el Shahab-3 usando un vehiculo de reentrada con forma de \"biberon\" que reduce peso y resistencia. Uno de los primeros misiles iranies capaces de alcanzar Israel desde territorio irani.",
      he: "השיג טווח ארוך יותר מהשהאב-3 באמצעות ראש חוזר קטן בצורת \"בקבוק תינוק\" שמפחית משקל והתנגדות. אחד הטילים האיראניים הראשונים שהצליחו להגיע לישראל מאדמת איראן.",
    },

    used: ["Apr 2024"],
  },
  {
    name: "Paveh \"351\"",
    type: "cruise",
    typeLabel: { en: "Cruise Missile", es: "Misil Crucero", he: "טיל שיוט" },
    range: "1,650 km",
    speed: "~900 km/h",
    warhead: "150-200 kg",
    fact: {
      en: "Flies at very low altitude using terrain-following navigation to sneak under radar. The \"351\" name became public when debris was recovered after the April 2024 attack — its first confirmed combat use.",
      es: "Vuela a muy baja altitud usando navegacion de seguimiento de terreno para escabullirse bajo el radar. El nombre \"351\" se hizo publico cuando se recuperaron restos tras el ataque de abril 2024 — su primer uso en combate confirmado.",
      he: "טס בגובה נמוך מאוד תוך שימוש בניווט עוקב שטח כדי לחמוק מתחת לרדאר. השם \"351\" נודע לציבור כשנמצאו שרידים לאחר מתקפת אפריל 2024 — השימוש הקרבי המאושר הראשון שלו.",
    },

    used: ["Apr 2024"],
  },
  {
    name: "Shahab-3",
    type: "ballistic",
    typeLabel: { en: "Ballistic Missile", es: "Misil Balistico", he: "טיל בליסטי" },
    range: "1,300-1,500 km",
    speed: "Mach 5+",
    warhead: "750-1,000 kg",
    fact: {
      en: "The \"grandfather\" of Iran's modern missile family. Based on the North Korean Nodong-1 (itself from Soviet Scud tech). First tested in 1998. The Emad, Ghadr, and Kheibar Shekan all evolved from this platform.",
      es: "El \"abuelo\" de la familia moderna de misiles de Iran. Basado en el norcoreano Nodong-1 (derivado de tecnologia Scud sovietica). Probado por primera vez en 1998. El Emad, Ghadr y Kheibar Shekan evolucionaron de esta plataforma.",
      he: "ה\"סבא\" של משפחת הטילים המודרנית של איראן. מבוסס על הנודונג-1 הצפון קוריאני (שהוא עצמו מטכנולוגיית סקאד סובייטית). נבדק לראשונה ב-1998. העמאד, גדר וחייבר שכן התפתחו מפלטפורמה זו.",
    },

    used: ["Apr 2024"],
  },
];

const TYPE_COLORS: Record<string, string> = {
  drone: "#4a9eda",
  ballistic: "#e05555",
  cruise: "#d4a22a",
  hypersonic: "#a855f7",
};

const TYPE_ICONS: Record<string, string> = {
  drone: "M12 8 L20 4 L20 12 Z M20 8 L32 8 M28 4 L28 12",
  ballistic: "M16 4 L20 4 L20 24 L16 24 Z M12 20 L24 20 L22 28 L14 28 Z",
  cruise: "M4 14 L28 12 L32 10 L32 18 L28 16 L4 14 M14 12 L12 6 L18 6 L14 12",
  hypersonic: "M16 2 L20 2 L21 24 L15 24 Z M10 18 L26 18 L24 28 L12 28 Z M14 2 L22 2 L20 0 L16 0 Z",
};

function WeaponSilhouette({ type, size = 60 }: { type: string; size?: number }) {
  const color = TYPE_COLORS[type] || "#6ea8d7";
  const icon = TYPE_ICONS[type];
  if (!icon) return null;

  return (
    <svg width={size} height={size} viewBox="0 0 36 32" fill="none" style={{ opacity: 0.85 }}>
      <path d={icon} fill={color} stroke={color} strokeWidth="0.5" />
    </svg>
  );
}

interface Props {
  lang: Lang;
}

const TEXT = {
  title: { en: "Iranian Arsenal", es: "Arsenal Irani", he: "ארסנל איראני" },
  sub: {
    en: "Missiles and drones used against Israel (2024-2026). Specs are estimates from open-source intelligence.",
    es: "Misiles y drones usados contra Israel (2024-2026). Especificaciones estimadas de inteligencia de fuentes abiertas.",
    he: "טילים ומל\"טים ששימשו נגד ישראל (2024-2026). המפרטים הם הערכות ממודיעין גלוי.",
  },
  range: { en: "Range", es: "Alcance", he: "טווח" },
  speed: { en: "Speed", es: "Velocidad", he: "מהירות" },
  warhead: { en: "Warhead", es: "Ojiva", he: "ראש קרבי" },
  fact: { en: "Fun fact", es: "Dato", he: "עובדה מעניינת" },
  used_in: { en: "Used in", es: "Usado en", he: "שימוש ב" },
  disclaimer: {
    en: "* Specifications are approximate, based on public defense analysis (CSIS, IISS, Jane's). Iran does not publish official specs.",
    es: "* Las especificaciones son aproximadas, basadas en analisis de defensa publico (CSIS, IISS, Jane's). Iran no publica especificaciones oficiales.",
    he: "* המפרטים משוערים, מבוססים על ניתוחי ביטחון פומביים (CSIS, IISS, Jane's). איראן אינה מפרסמת מפרטים רשמיים.",
  },
};

export default function Arsenal({ lang }: Props) {
  return (
    <div className="panel">
      <h2>{TEXT.title[lang]}</h2>
      <p className="panel-sub">{TEXT.sub[lang]}</p>

      <div className="arsenal-grid">
        {WEAPONS.map((w) => (
          <div key={w.name} className="weapon-card">
            <div className="weapon-header">
              <div className="weapon-icon">
                <WeaponSilhouette type={w.type} size={52} />
              </div>
              <div className="weapon-title">
                <span className="weapon-name">{w.name}</span>
                <span className="weapon-type-badge" style={{ background: TYPE_COLORS[w.type] }}>
                  {w.typeLabel[lang]}
                </span>
              </div>
            </div>

            <div className="weapon-specs">
              <div className="weapon-spec">
                <span className="spec-label">{TEXT.range[lang]}</span>
                <span className="spec-value">{w.range}</span>
              </div>
              <div className="weapon-spec">
                <span className="spec-label">{TEXT.speed[lang]}</span>
                <span className="spec-value">{w.speed}</span>
              </div>
              <div className="weapon-spec">
                <span className="spec-label">{TEXT.warhead[lang]}</span>
                <span className="spec-value">{w.warhead}</span>
              </div>
            </div>

            <div className="weapon-fact">
              <span className="fact-label">{TEXT.fact[lang]}:</span> {w.fact[lang]}
            </div>

            <div className="weapon-used">
              <span className="used-label">{TEXT.used_in[lang]}:</span>
              {w.used.map((u) => (
                <span key={u} className="used-tag">{u}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="arsenal-disclaimer">{TEXT.disclaimer[lang]}</p>
    </div>
  );
}
