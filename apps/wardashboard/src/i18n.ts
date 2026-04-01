export type Lang = "en" | "es" | "he";

const T = {
  // Header
  tagline: { en: "Civilian Intelligence Briefing", es: "Informe de Inteligencia Civil", he: "תדריך מודיעין לאזרחים" },
  war_name: { en: "Iran–Israel–US Conflict 2026", es: "Conflicto Iran–Israel–EEUU 2026", he: "עימות איראן–ישראל–ארה\"ב 2026" },
  active_conflict: { en: "ACTIVE CONFLICT", es: "CONFLICTO ACTIVO", he: "עימות פעיל" },
  missile_data: { en: "Missile Data", es: "Data Misiles", he: "נתוני טילים" },
  loading: { en: "Loading intelligence data...", es: "Cargando datos de inteligencia...", he: "...טוען נתוני מודיעין" },

  // Section headers
  sec01: { en: "SECTION 01", es: "SECCION 01", he: "סעיף 01" },
  sec02: { en: "SECTION 02", es: "SECCION 02", he: "סעיף 02" },
  sec03: { en: "SECTION 03", es: "SECCION 03", he: "סעיף 03" },
  sec04: { en: "SECTION 04", es: "SECCION 04", he: "סעיף 04" },
  sec05: { en: "SECTION 05", es: "SECCION 05", he: "סעיף 05" },
  sec06: { en: "SECTION 06", es: "SECCION 06", he: "סעיף 06" },
  war_overview: { en: "WAR OVERVIEW", es: "RESUMEN DE GUERRA", he: "סקירת מלחמה" },
  daily_intensity: { en: "DAILY INTENSITY", es: "INTENSIDAD DIARIA", he: "עוצמה יומית" },
  regions_targeted: { en: "REGIONS TARGETED", es: "REGIONES ATACADAS", he: "אזורים מותקפים" },
  threat_pattern: { en: "THREAT PATTERN", es: "PATRON DE AMENAZA", he: "תבנית איום" },
  war_timeline: { en: "WAR TIMELINE", es: "LINEA DE TIEMPO", he: "ציר זמן מלחמה" },
  emergency: { en: "EMERGENCY", es: "EMERGENCIA", he: "חירום" },

  // War overview
  days_of_conflict: { en: "Days of conflict", es: "Dias de conflicto", he: "ימי עימות" },
  total_alerts: { en: "Total alerts", es: "Total alertas", he: "סך התרעות" },
  per_day_avg: { en: "Per day avg", es: "Promedio/dia", he: "ממוצע/יום" },
  missiles: { en: "Missiles", es: "Misiles", he: "טילים" },
  drones: { en: "Drones", es: "Drones", he: 'מל"טים' },
  latest_data: { en: "Latest data", es: "Ultimo dato", he: "נתון אחרון" },
  alerts: { en: "alerts", es: "alertas", he: "התרעות" },
  most_alerts_day: { en: "Day with most alerts", es: "Dia con mas alertas", he: "היום עם הכי הרבה התרעות" },
  fewest_alerts_day: { en: "Day with fewest alerts", es: "Dia con menos alertas", he: "היום עם הכי מעט התרעות" },
  longest_calm: { en: "Longest calm", es: "Calma mas larga", he: "השקט הארוך ביותר" },
  hours: { en: "hours", es: "horas", he: "שעות" },
  weekly_evolution: { en: "WEEKLY EVOLUTION", es: "EVOLUCION SEMANAL", he: "התפתחות שבועית" },
  this_week_vs_last: { en: "This week vs last week", es: "Esta semana vs anterior", he: "השבוע לעומת הקודם" },
  this_week: { en: "This week", es: "Esta semana", he: "השבוע" },
  last_week: { en: "Last week", es: "Semana pasada", he: "שבוע שעבר" },
  vs_yesterday: { en: "vs yesterday", es: "vs ayer", he: "לעומת אתמול" },
  share: { en: "Share", es: "Compartir", he: "שתף" },

  // Daily intensity
  daily_sub: { en: "Every day of the conflict — alerts per day", es: "Cada dia del conflicto — alertas por dia", he: "כל יום של העימות — התרעות ליום" },
  low: { en: "Low", es: "Bajo", he: "נמוך" },
  medium: { en: "Medium", es: "Medio", he: "בינוני" },
  high: { en: "High", es: "Alto", he: "גבוה" },
  extreme: { en: "Extreme", es: "Extremo", he: "קיצוני" },

  // Regions
  north: { en: "North", es: "Norte", he: "צפון" },
  gush_dan: { en: "Gush Dan (TLV)", es: "Gush Dan (TLV)", he: "גוש דן (ת״א)" },
  jerusalem: { en: "Jerusalem", es: "Jerusalem", he: "ירושלים" },
  south: { en: "South", es: "Sur", he: "דרום" },
  region_sub: { en: "Alert distribution by region — one alert can affect multiple regions", es: "Distribucion de alertas por region — una alerta puede afectar multiples regiones", he: "התפלגות התרעות לפי אזור — התרעה אחת יכולה להשפיע על מספר אזורים" },

  // Heatmap
  heatmap_sub: { en: "Alerts by day and hour — last 7 days of data", es: "Alertas por dia y hora — ultimos 7 dias de datos", he: "התרעות לפי יום ושעה — 7 ימי נתונים אחרונים" },
  peak_hours: { en: "Peak hours", es: "Horas pico", he: "שעות שיא" },
  quietest: { en: "Quietest window", es: "Ventana mas tranquila", he: "החלון השקט ביותר" },
  detailed_stats: { en: "detailed hourly stats & probabilities", es: "estadisticas y probabilidades por hora", he: "סטטיסטיקות והסתברויות שעתיות" },

  // Timeline
  day_label: { en: "Day", es: "Dia", he: "יום" },
  before_48h: { en: "48h before", es: "48h antes", he: "48 שעות לפני" },
  after_48h: { en: "after", es: "despues", he: "אחרי" },
  escalation: { en: "ESCALATION", es: "ESCALADA", he: "הסלמה" },
  retaliation: { en: "RETALIATION", es: "REPRESALIA", he: "תגמול" },
  diplomacy: { en: "DIPLOMACY", es: "DIPLOMACIA", he: "דיפלומטיה" },

  // Emergency
  emergency_alert: {
    en: "When the siren sounds: go to shelter immediately. Stay for 10 minutes after the last alert.",
    es: "Cuando suena la sirena: andá al refugio inmediatamente. Quedáte 10 minutos despues de la ultima alerta.",
    he: "כששומעים צפירה: גשו למקלט מיד. הישארו 10 דקות לאחר ההתרעה האחרונה.",
  },
  shelter_banner: {
    en: "KNOW YOUR NEAREST SHELTER",
    es: "CONOCE TU REFUGIO MAS CERCANO",
    he: "דע את המקלט הקרוב אליך",
  },

  // Days
  sun: { en: "Sun", es: "Dom", he: "ראש" },
  mon: { en: "Mon", es: "Lun", he: "שני" },
  tue: { en: "Tue", es: "Mar", he: "שלי" },
  wed: { en: "Wed", es: "Mie", he: "רבי" },
  thu: { en: "Thu", es: "Jue", he: "חמי" },
  fri: { en: "Fri", es: "Vie", he: "שיש" },
  sat: { en: "Sat", es: "Sab", he: "שבת" },

  // Footer
  data_source: { en: "Data: Tzofar Telegram @tzevaadom_en", es: "Datos: Tzofar Telegram @tzevaadom_en", he: "מקור: טלגרם צופר @tzevaadom_en" },
  through: { en: "Through", es: "Hasta", he: "עד" },
} as const;

type Key = keyof typeof T;

export function t(key: Key, lang: Lang): string {
  return T[key][lang];
}

export function dayLabel(i: number, lang: Lang): string {
  const keys: Key[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return T[keys[i]][lang];
}
