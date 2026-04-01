export type Lang = "en" | "es" | "he";

export const sharedTranslations = {
  // Days (short)
  day_sun: { en: "Sun", es: "Dom", he: "ראש" },
  day_mon: { en: "Mon", es: "Lun", he: "שני" },
  day_tue: { en: "Tue", es: "Mar", he: "שלי" },
  day_wed: { en: "Wed", es: "Mie", he: "רבי" },
  day_thu: { en: "Thu", es: "Jue", he: "חמי" },
  day_fri: { en: "Fri", es: "Vie", he: "שיש" },
  day_sat: { en: "Sat", es: "Sab", he: "שבת" },

  // Days (full)
  day_sunday: { en: "Sunday", es: "Domingo", he: "יום ראשון" },
  day_monday: { en: "Monday", es: "Lunes", he: "יום שני" },
  day_tuesday: { en: "Tuesday", es: "Martes", he: "יום שלישי" },
  day_wednesday: { en: "Wednesday", es: "Miercoles", he: "יום רביעי" },
  day_thursday: { en: "Thursday", es: "Jueves", he: "יום חמישי" },
  day_friday: { en: "Friday", es: "Viernes", he: "יום שישי" },
  day_saturday: { en: "Saturday", es: "Sabado", he: "שבת" },

  // Regions
  region_all: { en: "All Israel", es: "Todo Israel", he: "כל ישראל" },
  region_north: { en: "North", es: "Norte", he: "צפון" },
  region_gush_dan: { en: "Gush Dan", es: "Gush Dan", he: "גוש דן" },
  region_jerusalem: { en: "Jerusalem", es: "Jerusalem", he: "ירושלים" },
  region_south: { en: "South", es: "Sur", he: "דרום" },

  // Common
  total_alerts: { en: "Total alerts", es: "Total alertas", he: "סך התרעות" },
  alerts_s: { en: "alerts", es: "alertas", he: "התרעות" },
  alert_s: { en: "alert", es: "alerta", he: "התרעה" },
  missiles: { en: "Missiles", es: "Misiles", he: "טילים" },
  drones: { en: "Drones", es: "Drones", he: 'מל"טים' },
  today: { en: "Today", es: "Hoy", he: "היום" },
  yesterday: { en: "Yesterday", es: "Ayer", he: "אתמול" },
} as const;

export type SharedKey = keyof typeof sharedTranslations;

export function sharedT(key: SharedKey, lang: Lang): string {
  return sharedTranslations[key][lang];
}

export function dayShort(dayIndex: number, lang: Lang): string {
  const keys: SharedKey[] = ["day_sun", "day_mon", "day_tue", "day_wed", "day_thu", "day_fri", "day_sat"];
  return sharedTranslations[keys[dayIndex]][lang];
}

export function dayFull(dayIndex: number, lang: Lang): string {
  const keys: SharedKey[] = ["day_sunday", "day_monday", "day_tuesday", "day_wednesday", "day_thursday", "day_friday", "day_saturday"];
  return sharedTranslations[keys[dayIndex]][lang];
}
