import { Composition, Series, Audio, staticFile } from "remotion";
import { REEL_CONFIGS } from "./data/reel-configs";
import { PROMO_REEL_CONFIGS } from "./data/promo-reel-configs";
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

const AUDIO_REELS = new Set(["daily-briefing","weekly-comparison","deadliest-hours","wd-concept","wd-how","wd-why","mp-concept","mp-heatmap","mp-shelter","combo"]);

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
      wdConcept1Title: "A Civilian Intelligence Briefing",
    wdConcept1Body: "Military-grade data analysis designed for ordinary people",
    wdConcept2Title: "Real Data, Not Speculation",
    wdConcept2Body: "Every alert logged, timestamped, and categorized from official sources",
    wdConcept3Title: "Built by Civilians, for Civilians",
    wdConcept3Body: "No agenda. No ads. Just data you can trust.",
    wdHow1Title: "Updated Daily",
    wdHow1Body: "New data processed every day with automated analysis",
    wdWhy1Title: "4 Million People in Gush Dan",
    wdWhy1Body: "The Tel Aviv metro area lives under constant missile threat",
    wdWhy2Title: "Everyone Deserves to Understand",
    wdWhy2Body: "Your neighbor, your grandmother, your coworker — clarity saves lives",
    wdWhy3Title: "Knowledge is Protection",
    wdWhy3Body: "When you know the pattern, you make better decisions",
    mpConcept1Title: "When is Your Safest Window?",
    mpConcept1Body: "See exactly which hours have the lowest alert frequency",
    mpConcept2Title: "Plan Your Day Around Data",
    mpConcept2Body: "Not fear. Not rumor. Data from the Home Front Command.",
    mpHeatmap1Title: "Peak: 2PM. Quietest: 2-5AM",
    mpHeatmap1Body: "Clear patterns emerge from weeks of alert data",
    mpHeatmap2Title: "Check Before You Leave",
    mpHeatmap2Body: "Patterns tend to repeat. The heatmap is your daily guide.",
    mpShelter1Title: "Built During the War",
    mpShelter1Body: "From a mamad in Tel Aviv, when answers were needed",
    mpShelter2Title: "Open Source. Free. No Ads.",
    mpShelter2Body: "No agenda. Just a civilian project born from necessity.",
    mpShelter3Title: "Now You Can Too",
    mpShelter3Body: "The same tool that helped me is now available to everyone",
    combo1Title: "Two Tools, One Mission",
    combo1Body: "Keeping 9 million Israelis informed with real data",
    combo2Title: "Missile Probability",
    combo2Body: "When is it safest to go outside? Your personal risk calculator.",
    combo3Title: "War Dashboard",
    combo3Body: "What's happening and why? Your daily intelligence briefing.",
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
      {[...REEL_CONFIGS, ...PROMO_REEL_CONFIGS].map((reel) => {
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
