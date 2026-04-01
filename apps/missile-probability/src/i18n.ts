export type Lang = "en" | "es" | "he";

const translations = {
  // Days
  day_sun: { en: "Sun", es: "Dom", he: "ראש" },
  day_mon: { en: "Mon", es: "Lun", he: "שני" },
  day_tue: { en: "Tue", es: "Mar", he: "שלי" },
  day_wed: { en: "Wed", es: "Mie", he: "רבי" },
  day_thu: { en: "Thu", es: "Jue", he: "חמי" },
  day_fri: { en: "Fri", es: "Vie", he: "שיש" },
  day_sat: { en: "Sat", es: "Sab", he: "שבת" },

  day_sunday: { en: "Sunday", es: "Domingo", he: "יום ראשון" },
  day_monday: { en: "Monday", es: "Lunes", he: "יום שני" },
  day_tuesday: { en: "Tuesday", es: "Martes", he: "יום שלישי" },
  day_wednesday: { en: "Wednesday", es: "Miercoles", he: "יום רביעי" },
  day_thursday: { en: "Thursday", es: "Jueves", he: "יום חמישי" },
  day_friday: { en: "Friday", es: "Viernes", he: "יום שישי" },
  day_saturday: { en: "Saturday", es: "Sabado", he: "שבת" },

  // Tabs
  tab_now: { en: "Now", es: "Ahora", he: "עכשיו" },
  tab_heatmap: { en: "Heatmap", es: "Heatmap", he: "מפת חום" },
  tab_timeline: { en: "Timeline", es: "Timeline", he: "ציר זמן" },
  tab_byhour: { en: "By Hour", es: "Por Hora", he: "לפי שעה" },
  tab_trend: { en: "Trend", es: "Tendencia", he: "מגמה" },
  tab_war: { en: "War", es: "Guerra", he: "מלחמה" },
  tab_insights: { en: "Insights", es: "Analisis", he: "תובנות" },
  tab_info: { en: "Info", es: "Info", he: "מידע" },

  // Regions
  region_all: { en: "All Israel", es: "Todo Israel", he: "כל ישראל" },
  region_north: { en: "North", es: "Norte", he: "צפון" },
  region_gush_dan: { en: "Gush Dan", es: "Gush Dan", he: "גוש דן" },
  region_jerusalem: { en: "Jerusalem", es: "Jerusalem", he: "ירושלים" },
  region_south: { en: "South", es: "Sur", he: "דרום" },

  // Heatmap
  hm_title: { en: "Alerts by Day x Hour", es: "Alertas por Dia x Hora", he: "התרעות לפי יום x שעה" },
  hm_sub: { en: "Cumulative total. Starts at 06:00.", es: "Acumulado total. Empieza a las 06:00.", he: "סך מצטבר. מתחיל ב-06:00." },
  safe: { en: "Safe", es: "Calma", he: "בטוח" },
  danger: { en: "Danger", es: "Peligro", he: "סכנה" },
  most_dangerous: { en: "Most dangerous", es: "Mas peligrosos", he: "הכי מסוכן" },
  alert_s: { en: "alert", es: "alerta", he: "התרעה" },
  alerts_s: { en: "alerts", es: "alertas", he: "התרעות" },
  at_time: { en: "at", es: "a las", he: "ב-" },

  // Timeline
  tl_title: { en: "Daily Timeline", es: "Timeline Diario", he: "ציר זמן יומי" },
  tl_sub: { en: "Each row = one day. Tap for hourly breakdown.", es: "Cada fila = un dia. Toca para ver por hora.", he: "כל שורה = יום אחד. לחץ לפירוט שעתי." },

  // Histogram
  hist_title: { en: "Probability by Hour", es: "Probabilidad por Hora", he: "הסתברות לפי שעה" },
  hist_sub: { en: "% of total alerts per hour. Starts at 06:00.", es: "% del total de alertas por hora. Empieza a las 06:00.", he: "% מסך ההתרעות לפי שעה. מתחיל ב-06:00." },
  low: { en: "Low", es: "Bajo", he: "נמוך" },
  medium: { en: "Medium", es: "Medio", he: "בינוני" },
  high: { en: "High", es: "Alto", he: "גבוה" },
  extreme: { en: "Extreme", es: "Extremo", he: "קיצוני" },
  your_routine: { en: "Your routine", es: "Tu rutina", he: "השגרה שלך" },
  my_routine: { en: "My Routine", es: "Mi Rutina", he: "השגרה שלי" },
  commute_to: { en: "Commute to work", es: "Ida al trabajo", he: "נסיעה לעבודה" },
  commute_home: { en: "Commute home", es: "Vuelta a casa", he: "חזרה הביתה" },
  cumulative_risk: { en: "Cumulative risk", es: "Riesgo acumulado", he: "סיכון מצטבר" },
  add_window: { en: "+ Add time window", es: "+ Agregar ventana", he: "+ הוסף חלון זמן" },
  add: { en: "Add", es: "Agregar", he: "הוסף" },
  cancel: { en: "Cancel", es: "Cancelar", he: "ביטול" },
  label: { en: "Label", es: "Etiqueta", he: "תווית" },
  to: { en: "to", es: "a", he: "עד" },

  // Trend
  trend_title: { en: "Trend", es: "Tendencia", he: "מגמה" },
  trend_sub: { en: "Alerts/day with 3-day moving average.", es: "Alertas/dia con media movil de 3 dias.", he: "התרעות/יום עם ממוצע נע של 3 ימים." },
  total_alerts: { en: "Total alerts", es: "Total alertas", he: "סך התרעות" },
  three_day_avg: { en: "3-day avg", es: "Media 3d", he: "ממוצע 3 ימים" },

  // Tips
  tips_title: { en: "Recommendations", es: "Recomendaciones", he: "המלצות" },
  tips_sub: { en: "Based on {N} days of conflict data (daytime 06-22h)", es: "Basado en {N} dias de conflicto (horario diurno 06-22h)", he: "מבוסס על {N} ימי עימות (שעות יום 06-22)" },
  safest_window: { en: "Safest window to go out", es: "Mejor ventana para salir", he: "החלון הבטוח ביותר לצאת" },
  most_dangerous_window: { en: "Most dangerous window", es: "Ventana mas peligrosa", he: "החלון המסוכן ביותר" },
  last_3_trend: { en: "Last 3 days trend", es: "Tendencia ultimos 3 dias", he: "מגמת 3 ימים אחרונים" },
  increasing: { en: "Increasing", es: "Subiendo", he: "עולה" },
  decreasing: { en: "Decreasing", es: "Bajando", he: "יורד" },
  stable: { en: "Stable", es: "Estable", he: "יציב" },
  vs_prev: { en: "vs previous 3 days", es: "vs 3 dias anteriores", he: "לעומת 3 ימים קודמים" },
  daily_avg: { en: "Daily average", es: "Promedio diario", he: "ממוצע יומי" },
  alerts_day: { en: "alerts/day", es: "alertas/dia", he: "התרעות/יום" },
  today: { en: "Today", es: "Hoy", he: "היום" },
  yesterday: { en: "Yesterday", es: "Ayer", he: "אתמול" },
  risk_by_slot: { en: "Risk by Time Slot", es: "Riesgo por Franja Horaria", he: "סיכון לפי משבצת זמן" },
  slot_night: { en: "Night", es: "Noche", he: "לילה" },
  slot_morning: { en: "Morning", es: "Manana", he: "בוקר" },
  slot_midday: { en: "Midday", es: "Mediodia", he: "צהריים" },
  slot_afternoon: { en: "Afternoon", es: "Tarde", he: "אחה״צ" },
  slot_evening: { en: "Evening", es: "Noche", he: "ערב" },
  avg_risk_hour: { en: "avg risk/hour (daytime)", es: "riesgo prom/hora (diurno)", he: "סיכון ממוצע/שעה (יום)" },
  avg_risk: { en: "avg risk/hour", es: "riesgo prom/hora", he: "סיכון ממוצע/שעה" },
  shelter_banner: { en: "KNOW YOUR NEAREST SHELTER", es: "CONOCE TU REFUGIO MAS CERCANO", he: "דע את המקלט הקרוב אליך" },
} as const;

type Key = keyof typeof translations;

export function t(key: Key, lang: Lang): string {
  return translations[key][lang];
}

export function tryT(key: string, lang: Lang): string {
  const entry = translations[key as Key];
  return entry ? entry[lang] : key;
}

export function dayShort(dayIndex: number, lang: Lang): string {
  const keys: Key[] = ["day_sun", "day_mon", "day_tue", "day_wed", "day_thu", "day_fri", "day_sat"];
  return translations[keys[dayIndex]][lang];
}

export function dayFull(dayIndex: number, lang: Lang): string {
  const keys: Key[] = ["day_sunday", "day_monday", "day_tuesday", "day_wednesday", "day_thursday", "day_friday", "day_saturday"];
  return translations[keys[dayIndex]][lang];
}
