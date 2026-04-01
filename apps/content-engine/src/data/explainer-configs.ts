/**
 * Explainer reel configurations — V2 with improved scripts and scene design.
 * These replace the previous promo reels with better safe zones,
 * typography, animations, and non-salesy tone.
 */

export interface ExplainerScene {
  type: "typing-hook" | "text" | "big-number" | "heatmap" | "timeline" | "comparison" | "region-bars" | "trend" | "disclaimer" | "outro" | "split-screen";
  durationInFrames: number;
  props: Record<string, unknown>;
}

export interface ExplainerConfig {
  id: string;
  title: string;
  accentColor: string;
  bgMusic: string;
  scenes: ExplainerScene[];
  narration: string;
}

export const EXPLAINER_CONFIGS: ExplainerConfig[] = [
  // ─── WAR DASHBOARD (blue accent) ───
  {
    id: "wd-concept",
    title: "What is War Dashboard?",
    accentColor: "#4A90D9",
    bgMusic: "bg-daily-briefing.mp3",
    scenes: [
      { type: "typing-hook", durationInFrames: 90, props: { text: "DAY {daysOfWar} OF THE CONFLICT" } },
      { type: "text", durationInFrames: 90, props: { line1: "Hundreds of alerts.", line2: "Dozens of regions.", line3: "One question:" } },
      { type: "text", durationInFrames: 90, props: { line1: "What is actually", line2: "happening?", big: true } },
      { type: "heatmap", durationInFrames: 150, props: { caption: "Every alert organized by hour, day, and region" } },
      { type: "timeline", durationInFrames: 150, props: { caption: "Geopolitical events and their impact on attacks" } },
      { type: "trend", durationInFrames: 150, props: { caption: "Historical data — patterns, not noise" } },
      { type: "disclaimer", durationInFrames: 90, props: { text: "Not for life decisions.\nFor staying informed." } },
      { type: "outro", durationInFrames: 90, props: { url: "wardashboard.live", accent: "#4A90D9" } },
    ],
    narration: "Day {daysOfWar} of the Iran-Israel conflict. Hundreds of alerts. Dozens of regions hit. But what's actually happening? War Dashboard takes every alert from the Home Front Command and organizes it. By hour. By day. By region. It tracks geopolitical events and shows how they affect attack patterns. It's historical data, organized so you can see patterns instead of noise. This is not for making life decisions. It's for staying informed. wardashboard.live.",
  },
  {
    id: "wd-how",
    title: "How War Dashboard Works",
    accentColor: "#4A90D9",
    bgMusic: "bg-data-analysis.mp3",
    scenes: [
      { type: "text", durationInFrames: 60, props: { line1: "🔴 ALERT", big: true, flash: true } },
      { type: "text", durationInFrames: 120, props: { line1: "Every siren gets logged", line2: "Timestamp. Location. Threat type." } },
      { type: "heatmap", durationInFrames: 150, props: { caption: "Heatmaps show exactly when and where" } },
      { type: "text", durationInFrames: 90, props: { line1: "Events correlated with data", line2: "Not speculation" } },
      { type: "timeline", durationInFrames: 150, props: { caption: "Impact measured in real numbers" } },
      { type: "comparison", durationInFrames: 120, props: { caption: "Week over week changes" } },
      { type: "text", durationInFrames: 90, props: { line1: "Updated daily.", big: true } },
      { type: "outro", durationInFrames: 120, props: { url: "wardashboard.live", accent: "#4A90D9" } },
    ],
    narration: "Every time a siren sounds in Israel, it gets logged. Timestamp. Location. Threat type. War Dashboard builds heatmaps from this data, showing exactly when and where attacks happen. We correlate events with the data. When a key figure is eliminated or sanctions are announced, we measure the actual impact on alert patterns. Week over week comparisons show whether things are escalating or calming down. All based on data. Not speculation. Updated daily. wardashboard.live.",
  },
  {
    id: "wd-why",
    title: "Why War Dashboard Exists",
    accentColor: "#4A90D9",
    bgMusic: "bg-outro-safe.mp3",
    scenes: [
      { type: "typing-hook", durationInFrames: 90, props: { text: "Built from a shelter in Tel Aviv" } },
      { type: "text", durationInFrames: 90, props: { line1: "When the war started,", line2: "information was scattered" } },
      { type: "text", durationInFrames: 90, props: { line1: "News gives emotions.", line2: "We give organized data." } },
      { type: "text", durationInFrames: 120, props: { line1: "For 9 million people", line2: "who deserve clarity" } },
      { type: "disclaimer", durationInFrames: 120, props: { text: "Free. Open source.\nNo ads. No agenda." } },
      { type: "outro", durationInFrames: 90, props: { url: "wardashboard.live", accent: "#4A90D9" } },
    ],
    narration: "When the war started, information was everywhere and nowhere. News channels gave emotions. Social media gave rumors. Nobody organized the raw data into something a regular person could understand. That's why War Dashboard exists. It takes Home Front Command data and turns it into clear patterns. For nine million people who deserve clarity, not chaos. Free. Open source. No ads. No agenda. Just organized information. wardashboard.live.",
  },

  // ─── MISSILE PROBABILITY (orange accent) ───
  {
    id: "mp-concept",
    title: "What is Missile Probability?",
    accentColor: "#d4822a",
    bgMusic: "bg-breaking-alert.mp3",
    scenes: [
      { type: "big-number", durationInFrames: 90, props: { value: "{gushDanTotal}", label: "ALERTS IN GUSH DAN", color: "#d4822a" } },
      { type: "text", durationInFrames: 90, props: { line1: "But they don't", line2: "happen randomly" } },
      { type: "heatmap", durationInFrames: 150, props: { caption: "Peak hours. Quiet windows. Regional patterns." } },
      { type: "text", durationInFrames: 120, props: { line1: "Check before", line2: "you step outside", big: true } },
      { type: "disclaimer", durationInFrames: 120, props: { text: "Historical patterns, not predictions.\nAlways follow official instructions." } },
      { type: "outro", durationInFrames: 120, props: { url: "missileprobability.com", accent: "#d4822a" } },
    ],
    narration: "{gushDanTotal} missile alerts in the Tel Aviv area since February twenty-eighth. But they don't happen randomly. Missile Probability maps every alert to show you the pattern. Peak hours. Quiet windows. Which days are heavier. Which hours are calmer. So you can check before you step outside. These are historical patterns, not predictions. Always follow Home Front Command instructions. missileprobability.com.",
  },
  {
    id: "mp-heatmap",
    title: "The Heatmap Explained",
    accentColor: "#d4822a",
    bgMusic: "bg-data-analysis.mp3",
    scenes: [
      { type: "heatmap", durationInFrames: 180, props: { caption: "Each cell = one hour of one day" } },
      { type: "text", durationInFrames: 120, props: { line1: "Green = calm", line2: "Yellow = moderate", line3: "Red = high activity" } },
      { type: "text", durationInFrames: 120, props: { line1: "Peak at midday.", line2: "Calmer before dawn." } },
      { type: "text", durationInFrames: 120, props: { line1: "Patterns repeat.", line2: "Data you can use.", big: true } },
      { type: "outro", durationInFrames: 120, props: { url: "missileprobability.com", accent: "#d4822a" } },
    ],
    narration: "This is a heatmap. Each cell is one hour of one day. Watch the data fill in. Green means calm. Yellow, moderate activity. Red, high. See the pattern? Midday tends to be the peak. The hours before dawn are usually calmer. This pattern has repeated across weeks of conflict. It's not a guarantee, but it's data you can use to inform your daily schedule. missileprobability.com.",
  },
  {
    id: "mp-shelter",
    title: "Built During the War",
    accentColor: "#d4822a",
    bgMusic: "bg-outro-safe.mp3",
    scenes: [
      { type: "typing-hook", durationInFrames: 90, props: { text: "3:40 AM. Siren. Shelter." } },
      { type: "text", durationInFrames: 90, props: { line1: "I needed to know:", line2: "Is there a pattern?" } },
      { type: "heatmap", durationInFrames: 150, props: { caption: "Raw data → clear patterns" } },
      { type: "text", durationInFrames: 60, props: { line1: "Turns out,", line2: "there is.", big: true } },
      { type: "text", durationInFrames: 90, props: { line1: "Built for myself.", line2: "Now used by thousands." } },
      { type: "disclaimer", durationInFrames: 120, props: { text: "Open source. Free.\nNo tracking. No ads." } },
      { type: "outro", durationInFrames: 120, props: { url: "missileprobability.com", accent: "#d4822a" } },
    ],
    narration: "Three forty AM. Siren. Run to the shelter. Wait. Again at four forty. Is there a pattern to this? I started logging every alert. Timestamp. Location. And yes, there's a pattern. Clear peak hours. Calmer windows. Regional differences. I built Missile Probability for myself. Now thousands of people use it. Open source. Free. No tracking. No ads. Just a tool built during a war, by someone who needed answers. missileprobability.com.",
  },

  // ─── COMBO (both colors) ───
  {
    id: "combo",
    title: "Two Tools, One Mission",
    accentColor: "#4A90D9",
    bgMusic: "bg-daily-briefing.mp3",
    scenes: [
      { type: "split-screen", durationInFrames: 60, props: {} },
      { type: "text", durationInFrames: 90, props: { line1: "WAR DASHBOARD", line2: "What's happening?", color: "#4A90D9" } },
      { type: "text", durationInFrames: 90, props: { line1: "MISSILE PROBABILITY", line2: "When is it safer?", color: "#d4822a" } },
      { type: "trend", durationInFrames: 120, props: { caption: "Events, trends, weekly patterns" } },
      { type: "heatmap", durationInFrames: 120, props: { caption: "Hour-by-hour personal safety" } },
      { type: "text", durationInFrames: 90, props: { line1: "Organized information", line2: "for civilians under fire" } },
      { type: "disclaimer", durationInFrames: 90, props: { text: "Data tools, not decision makers.\nAlways follow official instructions." } },
      { type: "outro", durationInFrames: 120, props: { url: "wardashboard.live\nmissileprobability.com", accent: "#4A90D9" } },
    ],
    narration: "Two tools. One mission. War Dashboard tells you what's happening in the conflict. The big picture. Events, trends, weekly patterns. Missile Probability tells you when it's historically safer in your area. The hour-by-hour pattern. Together, they give you organized information. Not fear. Not hype. Just data, structured for civilians living under fire. These are information tools, not decision makers. Always follow Home Front Command instructions. wardashboard.live. missileprobability.com.",
  },
];
