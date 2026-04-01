import { Composition, Series } from "remotion";
import { REEL_CONFIGS } from "./data/reel-configs";
import { IntroScene } from "./components/scenes/IntroScene";
import { BigNumberScene } from "./components/scenes/BigNumberScene";
import { ComparisonScene } from "./components/scenes/ComparisonScene";
import { RegionBreakdownScene } from "./components/scenes/RegionBreakdownScene";
import { HeatmapScene } from "./components/scenes/HeatmapScene";
import { TimelineScene } from "./components/scenes/TimelineScene";
import { TrendScene } from "./components/scenes/TrendScene";
import { FactScene } from "./components/scenes/FactScene";
import { StatCardScene } from "./components/scenes/StatCardScene";
import { OutroScene } from "./components/scenes/OutroScene";
import type { ReelData, ReelScene } from "./types";

// Static demo data for Remotion Studio preview
const DEMO_DATA: ReelData = {
  daysOfWar: 32,
  totalAlerts: 916,
  avgPerDay: 28.6,
  todayAlerts: 4,
  yesterdayAlerts: 24,
  todayVsYesterday: -83,
  mostAlertsDay: { date: "Mar 25", count: 42 },
  fewestAlertsDay: { date: "Mar 31", count: 4 },
  longestCalmHours: 5.9,
  missiles: 770,
  drones: 146,
  missilesPct: 84,
  regions: [
    { name: "North", count: 826, pct: 90 },
    { name: "Gush Dan", count: 243, pct: 27 },
    { name: "Jerusalem", count: 251, pct: 27 },
    { name: "South", count: 229, pct: 25 },
  ],
  thisWeekTotal: 86,
  lastWeekTotal: 229,
  weekChange: -28,
  weekNumber: 5,
  peakHour: 17,
  quietestHourStart: 2,
  nightPctMissiles: 28,
  dayPctMissiles: 72,
  shabatAvg: 28.6,
  weekdayAvg: 28.0,
  latestEvent: { date: "Mar 28", title: "Relative calm — attack intensity drops 35%", before: 34, after: 28, changePct: -19 },
  dailyCounts: [24,33,18,29,37,26,31,36,32,28,23,29,27,29,29,28,27,23,24,30,38,27,38,23,31,42,44,24,27,31,24,4],
};

function renderScene(scene: ReelScene, data: ReelData) {
  switch (scene.type) {
    case "intro":
      return <IntroScene subtitle={scene.props.subtitle as string} />;
    case "big-number": {
      const key = scene.props.dataKey as keyof ReelData;
      const val = typeof data[key] === "number" ? data[key] as number : 0;
      return <BigNumberScene value={val} label={scene.props.label as string || ""} suffix={scene.props.suffix as string || ""} color={scene.props.color as string} />;
    }
    case "comparison":
      return <ComparisonScene
        leftValue={data[scene.props.leftKey as keyof ReelData] as number || 0}
        leftLabel={scene.props.leftLabel as string || ""}
        rightValue={data[scene.props.rightKey as keyof ReelData] as number || 0}
        rightLabel={scene.props.rightLabel as string || ""}
        changePct={data[scene.props.changeKey as keyof ReelData] as number || 0}
      />;
    case "region-breakdown":
      return <RegionBreakdownScene regions={data.regions} />;
    case "heatmap": {
      // Generate a simple grid from daily counts
      const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
      data.dailyCounts.forEach((count, i) => {
        const day = (i + 5) % 7; // Feb 28 = Friday = 5
        for (let h = 0; h < 24; h++) {
          grid[day][h] += Math.round(count / 24 * (1 + Math.sin(h / 3) * 0.5));
        }
      });
      return <HeatmapScene grid={grid} maxVal={Math.max(...grid.flat())} />;
    }
    case "timeline":
      return data.latestEvent
        ? <TimelineScene {...data.latestEvent} />
        : <FactScene title="No events" body="No geopolitical events recorded" />;
    case "trend":
      return <TrendScene dailyCounts={data.dailyCounts} label={scene.props.label as string} />;
    case "fact":
      return <FactScene
        icon={scene.props.icon as string}
        title={getFact(scene.props.titleKey as string, data)}
        body={getFact(scene.props.bodyKey as string, data)}
        highlight={scene.props.highlight as string}
      />;
    case "stat-card": {
      const keys = scene.props.statsKeys as string[];
      const stats = keys.map(k => getStatCard(k, data));
      return <StatCardScene stats={stats} />;
    }
    case "outro":
      return <OutroScene />;
    default:
      return <IntroScene />;
  }
}

function getFact(key: string, data: ReelData): string {
  const facts: Record<string, string> = {
    safestWindow: "Safest Window",
    safestWindowBody: `${String(data.quietestHourStart).padStart(2, "0")}:00 – ${String((data.quietestHourStart + 3) % 24).padStart(2, "0")}:00 is your best bet`,
    shabbatTitle: "The Shabbat Effect",
    shabbatBody: `Saturday avg: ${data.shabatAvg.toFixed(1)} alerts vs Weekday avg: ${data.weekdayAvg.toFixed(1)}`,
    nightTitle: "Night vs Day Attacks",
    nightBody: `${data.dayPctMissiles}% of attacks during day (06-22)\n${data.nightPctMissiles}% at night (22-06)`,
    calmTitle: "Calm Periods",
    calmBody: `The longest gap between alerts was ${data.longestCalmHours} hours. Use calm windows wisely.`,
    sirenTitle: "When the siren sounds",
    sirenBody: "Go to shelter immediately.\nStay for 10 minutes after the last alert.\nDon't go outside until all clear.",
  };
  return facts[key] || key;
}

function getStatCard(key: string, data: ReelData): { value: number; label: string; suffix?: string; color?: string } {
  const cards: Record<string, { value: number; label: string; suffix?: string; color?: string }> = {
    daysOfWar: { value: data.daysOfWar, label: "Days of war" },
    totalAlerts: { value: data.totalAlerts, label: "Total alerts", color: "#4A90D9" },
    avgPerDay: { value: data.avgPerDay, label: "Avg per day", suffix: "/d" },
    missiles: { value: data.missiles, label: "Missiles", color: "#c93d3d" },
    drones: { value: data.drones, label: "Drones", color: "#4A90D9" },
    mostAlertsDay: { value: data.mostAlertsDay.count, label: `Peak day (${data.mostAlertsDay.date})` },
    peakHour: { value: data.peakHour, label: "Peak hour", suffix: ":00", color: "#c93d3d" },
    quietestHour: { value: data.quietestHourStart, label: "Quietest hour", suffix: ":00", color: "#1a6b4a" },
  };
  return cards[key] || { value: 0, label: key };
}

export function RemotionRoot() {
  return (
    <>
      {REEL_CONFIGS.map((reel) => {
        const totalFrames = reel.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
        return (
          <Composition
            key={reel.id}
            id={reel.id}
            component={() => (
              <Series>
                {reel.scenes.map((scene, i) => (
                  <Series.Sequence key={i} durationInFrames={scene.durationInFrames}>
                    {renderScene(scene, DEMO_DATA)}
                  </Series.Sequence>
                ))}
              </Series>
            )}
            durationInFrames={totalFrames}
            fps={30}
            width={1080}
            height={1920}
          />
        );
      })}
    </>
  );
}
