import { Composition, Series, Audio, staticFile } from "remotion";
import { REEL_CONFIGS } from "./data/reel-configs";
import { REAL_DATA, AUDIO_DURATIONS } from "./data/real-data";
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

const data = REAL_DATA;

const AUDIO_REELS = new Set(["daily-briefing", "weekly-comparison", "deadliest-hours"]);

function renderScene(scene: ReelScene) {
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
      const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
      data.dailyCounts.forEach((count, i) => {
        const day = (i + 5) % 7;
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
        title={getFact(scene.props.titleKey as string)}
        body={getFact(scene.props.bodyKey as string)}
        highlight={scene.props.highlight as string}
      />;
    case "stat-card": {
      const keys = scene.props.statsKeys as string[];
      const stats = keys.map(k => getStatCard(k));
      return <StatCardScene stats={stats} />;
    }
    case "outro":
      return <OutroScene />;
    default:
      return <IntroScene />;
  }
}

function getFact(key: string): string {
  const facts: Record<string, string> = {
    safestWindow: "Safest Window",
    safestWindowBody: `${String(data.quietestHourStart).padStart(2, "0")}:00 – ${String((data.quietestHourStart + 3) % 24).padStart(2, "0")}:00 is your best bet`,
    shabbatTitle: "The Shabbat Effect",
    shabbatBody: `Saturday avg: ${data.shabatAvg.toFixed(1)} alerts vs Weekday avg: ${data.weekdayAvg.toFixed(1)}`,
    nightTitle: "Night vs Day Attacks",
    nightBody: `${data.dayPctMissiles}% of attacks during day (06-22)\n${data.nightPctMissiles}% at night (22-06)`,
    calmTitle: "Calm Periods",
    calmBody: `The longest gap between alerts was ${data.longestCalmHours} hours.`,
    sirenTitle: "When the siren sounds",
    sirenBody: "Go to shelter immediately.\nStay for 10 minutes after the last alert.",
  };
  return facts[key] || key;
}

function getStatCard(key: string): { value: number; label: string; suffix?: string; color?: string } {
  const cards: Record<string, { value: number; label: string; suffix?: string; color?: string }> = {
    daysOfWar: { value: data.daysOfWar, label: "Days of war" },
    totalAlerts: { value: data.totalAlerts, label: "Total alerts", color: "#4A90D9" },
    avgPerDay: { value: data.avgPerDay, label: "Avg per day", suffix: "/d" },
    missiles: { value: data.missiles, label: "Missiles", color: "#c93d3d" },
    drones: { value: data.drones, label: "Drones", color: "#4A90D9" },
    mostAlertsDay: { value: data.mostAlertsDay.count, label: `Peak (${data.mostAlertsDay.date})` },
    peakHour: { value: data.peakHour, label: "Peak hour", suffix: ":00", color: "#c93d3d" },
    quietestHour: { value: data.quietestHourStart, label: "Quietest hour", suffix: ":00", color: "#1a6b4a" },
  };
  return cards[key] || { value: 0, label: key };
}

export function RemotionRoot() {
  return (
    <>
      {REEL_CONFIGS.map((reel) => {
        const hasAudio = AUDIO_REELS.has(reel.id);
        const totalFrames = hasAudio && AUDIO_DURATIONS[reel.id]
          ? AUDIO_DURATIONS[reel.id]
          : reel.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

        // Distribute frames across scenes proportionally if audio exists
        const baseTotal = reel.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
        const scale = totalFrames / baseTotal;

        return (
          <Composition
            key={reel.id}
            id={reel.id}
            component={() => (
              <>
                {hasAudio && <Audio src={staticFile(`audio/reel-${reel.id}.mp3`)} startFrom={30} />}
                <Series>
                  {reel.scenes.map((scene, i) => (
                    <Series.Sequence key={i} durationInFrames={Math.round(scene.durationInFrames * scale)}>
                      {renderScene(scene)}
                    </Series.Sequence>
                  ))}
                </Series>
              </>
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
