/**
 * Parse Pikud HaOref alert format into our app format.
 */

export interface ParsedAlert {
  datetime: string;
  date: string;
  time: string;
  hour: number;
  day_of_week: number;
  threat: "missiles" | "hostile_aircraft" | "unknown";
  regions: string[];
  cities_he: string[];
  oref_id: string;
  raw_cat: string;
}

// Dan region cities (Hebrew names from Pikud HaOref)
const DAN_CITIES = [
  "תל אביב", "רמת גן", "גבעתיים", "בני ברק", "חולון", "בת ים",
  "פתח תקווה", "הרצליה", "ראשון לציון", "כפר סבא", "רעננה",
  "הוד השרון", "רמת השרון", "אור יהודה", "יהוד", "קרית אונו",
  "אזור", "גבעת שמואל", "נתניה", "שוהם", "לוד", "רמלה",
  "מודיעין", "ירקון", "דן",
];

const NORTH_CITIES = [
  "חיפה", "עכו", "נהריה", "קריית שמונה", "צפת", "טבריה",
  "כרמיאל", "מגדל העמק", "עפולה", "בית שאן", "קו העימות",
  "גליל עליון", "גליל תחתון", "מרכז הגליל", "גולן", "העמקים",
  "חוף הכרמל", "קריות", "המפרץ",
];

const SOUTH_CITIES = [
  "באר שבע", "אשדוד", "אשקלון", "שדרות", "נתיבות", "אופקים",
  "עוטף עזה", "לכיש", "נגב", "ערד", "דימונה", "אילת", "ערבה",
];

const JERUSALEM_CITIES = [
  "ירושלים", "בית שמש", "מודיעין עילית", "שומרון", "יהודה", "בקעה",
];

function classifyCities(cities: string[]): string[] {
  const regions = new Set<string>();
  for (const city of cities) {
    const c = city.trim();
    if (DAN_CITIES.some(d => c.includes(d))) regions.add("gush_dan");
    if (NORTH_CITIES.some(d => c.includes(d))) regions.add("north");
    if (SOUTH_CITIES.some(d => c.includes(d))) regions.add("south");
    if (JERUSALEM_CITIES.some(d => c.includes(d))) regions.add("jerusalem");
  }
  // If no region matched, try to infer from common patterns
  if (regions.size === 0) {
    const joined = cities.join(" ");
    if (joined.includes("צפון") || joined.includes("גליל")) regions.add("north");
    if (joined.includes("דרום") || joined.includes("נגב")) regions.add("south");
    if (joined.includes("דן") || joined.includes("שרון")) regions.add("gush_dan");
    if (joined.includes("ירושלים") || joined.includes("יהודה")) regions.add("jerusalem");
  }
  return [...regions];
}

function mapThreat(cat: string): "missiles" | "hostile_aircraft" | "unknown" {
  switch (cat) {
    case "1": return "missiles";
    case "2": return "hostile_aircraft";
    default: return "unknown";
  }
}

export function parseOrefAlert(raw: { id?: string; cat?: string; data?: string[]; title?: string }, timestamp?: Date): ParsedAlert {
  const now = timestamp || new Date();
  const israelTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).format(now);

  // Parse "2026-04-02, 14:30:25" format
  const [datePart, timePart] = israelTime.split(", ");
  const hour = parseInt(timePart.split(":")[0]);
  const dayOfWeek = now.getDay();

  const cities = raw.data || [];
  const regions = classifyCities(cities);

  return {
    datetime: now.toISOString(),
    date: datePart,
    time: timePart,
    hour,
    day_of_week: dayOfWeek,
    threat: mapThreat(raw.cat || "0"),
    regions,
    cities_he: cities,
    oref_id: raw.id || "",
    raw_cat: raw.cat || "",
  };
}
