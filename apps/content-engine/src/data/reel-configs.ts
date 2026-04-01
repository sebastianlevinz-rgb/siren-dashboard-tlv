import type { ReelConfig } from "../types";

export const REEL_CONFIGS: ReelConfig[] = [
  {
    id: "daily-briefing",
    title: "Today's Briefing",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "Daily Briefing" } },
      { type: "big-number", durationInFrames: 90, props: { dataKey: "todayAlerts", label: "ALERTS TODAY" } },
      { type: "comparison", durationInFrames: 90, props: { leftKey: "yesterdayAlerts", leftLabel: "Yesterday", rightKey: "todayAlerts", rightLabel: "Today", changeKey: "todayVsYesterday" } },
      { type: "region-breakdown", durationInFrames: 90, props: {} },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "Here's your daily briefing. In the last 24 hours, Israel recorded [todayAlerts] missile alerts. That's [todayVsYesterdayDir] [todayVsYesterdayAbs]% from yesterday. The [topRegion] region saw [topRegionCount] alerts, making it the most targeted area. Stay safe, stay informed.",
  },
  {
    id: "weekly-comparison",
    title: "This Week vs Last Week",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "Weekly Report" } },
      { type: "comparison", durationInFrames: 120, props: { leftKey: "lastWeekTotal", leftLabel: "Last Week", rightKey: "thisWeekTotal", rightLabel: "This Week", changeKey: "weekChange" } },
      { type: "trend", durationInFrames: 90, props: {} },
      { type: "stat-card", durationInFrames: 90, props: { statsKeys: ["mostAlertsDay", "avgPerDay"] } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "Week [weekNumber] of the Iran-Israel conflict. [thisWeekTotal] alerts this week, [weekChangeDir] [weekChangeAbs]% from last week. [mostAlertsDate] was the most intense day with [mostAlertsCount] alerts.",
  },
  {
    id: "deadliest-hours",
    title: "Deadliest Hours",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "Threat Analysis" } },
      { type: "heatmap", durationInFrames: 150, props: {} },
      { type: "big-number", durationInFrames: 90, props: { dataKey: "peakHour", label: "PEAK HOUR", suffix: ":00" } },
      { type: "fact", durationInFrames: 90, props: { icon: "🛡️", titleKey: "safestWindow", bodyKey: "safestWindowBody" } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "When do missiles hit? Our data from [daysOfWar] days of war shows the peak at [peakHour] hundred hours. Your safest window is [quietestHourStart] to [quietestHourEnd]. Plan your outdoor activities accordingly.",
  },
  {
    id: "shabbat-effect",
    title: "The Shabbat Effect",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "Pattern Analysis" } },
      { type: "fact", durationInFrames: 120, props: { icon: "✡️", titleKey: "shabbatTitle", bodyKey: "shabbatBody" } },
      { type: "comparison", durationInFrames: 120, props: { leftKey: "shabatAvg", leftLabel: "Shabbat Avg", rightKey: "weekdayAvg", rightLabel: "Weekday Avg", changeKey: "shabbatDiff" } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "Is Shabbat safer? Our data shows [shabatAvg] average alerts on Saturday versus [weekdayAvg] on weekdays. [shabbatInterpretation].",
  },
  {
    id: "gush-dan-focus",
    title: "Gush Dan Under Fire",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "Regional Focus" } },
      { type: "big-number", durationInFrames: 90, props: { dataKey: "gushDanTotal", label: "DAN REGION ALERTS", color: "#c93d3d" } },
      { type: "region-breakdown", durationInFrames: 90, props: {} },
      { type: "trend", durationInFrames: 90, props: { label: "Gush Dan Weekly Trend" } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "The Dan metropolitan area, home to 4 million Israelis, has seen [gushDanTotal] missile alerts since February 28th. That's [gushDanPct]% of all alerts nationwide.",
  },
  {
    id: "war-by-numbers",
    title: "War by the Numbers",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "War Statistics" } },
      { type: "stat-card", durationInFrames: 90, props: { statsKeys: ["daysOfWar", "totalAlerts", "avgPerDay"] } },
      { type: "stat-card", durationInFrames: 90, props: { statsKeys: ["missiles", "drones"] } },
      { type: "big-number", durationInFrames: 90, props: { dataKey: "longestCalmHours", label: "LONGEST CALM (HOURS)", suffix: "h" } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "Day [daysOfWar] of the Iran-Israel war. [totalAlerts] total alerts. [avgPerDay] per day on average. [missiles] missiles. [drones] drones. The longest period without a single alert was [longestCalmHours] hours.",
  },
  {
    id: "night-vs-day",
    title: "Night vs Day",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "Time Analysis" } },
      { type: "comparison", durationInFrames: 120, props: { leftKey: "nightPctMissiles", leftLabel: "Night (22-06)", rightKey: "dayPctMissiles", rightLabel: "Day (06-22)", changeKey: "zero", suffix: "%" } },
      { type: "fact", durationInFrames: 120, props: { icon: "🌙", titleKey: "nightTitle", bodyKey: "nightBody" } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "[dayPctMissiles]% of rocket alerts come during daylight hours. But [nightPctMissiles]% of overnight alerts mean you can't let your guard down at night.",
  },
  {
    id: "event-impact",
    title: "Key Event Impact",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "Event Analysis" } },
      { type: "timeline", durationInFrames: 90, props: {} },
      { type: "comparison", durationInFrames: 120, props: { leftKey: "eventBefore", leftLabel: "48h Before", rightKey: "eventAfter", rightLabel: "48h After", changeKey: "eventChange" } },
      { type: "big-number", durationInFrames: 90, props: { dataKey: "eventChangePct", label: "IMPACT", suffix: "%" } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "On [eventDate], [eventTitle]. In the 48 hours that followed, alerts [eventDir] by [eventChangeAbs]%. Here's how geopolitics directly impacts your daily safety.",
  },
  {
    id: "calm-streaks",
    title: "Calm Streaks",
    scenes: [
      { type: "intro", durationInFrames: 60, props: { subtitle: "Safety Windows" } },
      { type: "big-number", durationInFrames: 90, props: { dataKey: "longestCalmHours", label: "LONGEST CALM", suffix: "h", color: "#1a6b4a" } },
      { type: "trend", durationInFrames: 90, props: { label: "Alert Frequency" } },
      { type: "fact", durationInFrames: 90, props: { icon: "🕊️", titleKey: "calmTitle", bodyKey: "calmBody" } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "The longest streak without alerts was [longestCalmHours] hours. Your safest daily window starts at [quietestHourStart] hundred hours. Use calm periods wisely.",
  },
  {
    id: "safety-brief",
    title: "30 Second Safety Brief",
    scenes: [
      { type: "intro", durationInFrames: 30, props: { subtitle: "Safety Brief" } },
      { type: "big-number", durationInFrames: 60, props: { dataKey: "todayAlerts", label: "ALERTS TODAY" } },
      { type: "stat-card", durationInFrames: 60, props: { statsKeys: ["peakHour", "quietestHour"] } },
      { type: "fact", durationInFrames: 90, props: { icon: "🚨", titleKey: "sirenTitle", bodyKey: "sirenBody" } },
      { type: "outro", durationInFrames: 60, props: {} },
    ],
    narrationTemplate: "[todayAlerts] alerts today. Peak danger at [peakHour] hundred hours. Safest window at [quietestHourStart] hundred. When the siren sounds: shelter immediately, stay 10 minutes. This is your 30-second safety brief.",
  },
];
