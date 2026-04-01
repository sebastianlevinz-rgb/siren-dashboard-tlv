import { Composition, Series, Audio, staticFile } from "remotion";
import { FINAL_VIDEOS } from "./data/final-videos";
import { REEL_CONFIGS } from "./data/reel-configs";
import { PROMO_REEL_CONFIGS } from "./data/promo-reel-configs";
import { EXPLAINER_CONFIGS, type ExplainerScene } from "./data/explainer-configs";
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

// V2 explainer scene components
import { TypingHookScene } from "./components/scenes/v2/TypingHookScene";
import { TextScene } from "./components/scenes/v2/TextScene";
import { BigNumberV2 } from "./components/scenes/v2/BigNumberV2";
import { HeatmapV2 } from "./components/scenes/v2/HeatmapV2";
import { TimelineV2 } from "./components/scenes/v2/TimelineV2";
import { ComparisonV2 } from "./components/scenes/v2/ComparisonV2";
import { TrendV2 } from "./components/scenes/v2/TrendV2";
import { DisclaimerScene } from "./components/scenes/v2/DisclaimerScene";
import { OutroV2 } from "./components/scenes/v2/OutroV2";
import { SplitScreenScene } from "./components/scenes/v2/SplitScreenScene";
import { MusicFadeOut } from "./components/common/MusicFadeOut";

const data = REAL_DATA;

const AUDIO_REELS = new Set(["daily-briefing","weekly-comparison","deadliest-hours","wd-concept","wd-how","wd-why","mp-concept","mp-heatmap","mp-shelter","combo"]);

// Background music mapping: reel ID → bg audio file + volume (0-1)
const BG_MUSIC: Record<string, { file: string; volume: number }> = {
  "daily-briefing": { file: "bg-data-analysis.mp3", volume: 0.12 },
  "weekly-comparison": { file: "bg-data-analysis.mp3", volume: 0.12 },
  "deadliest-hours": { file: "bg-data-analysis.mp3", volume: 0.12 },
  "wd-concept": { file: "bg-daily-briefing.mp3", volume: 0.2 },
  "wd-how": { file: "bg-data-analysis.mp3", volume: 0.2 },
  "wd-why": { file: "bg-outro-safe.mp3", volume: 0.2 },
  "mp-concept": { file: "bg-breaking-alert.mp3", volume: 0.2 },
  "mp-heatmap": { file: "bg-data-analysis.mp3", volume: 0.2 },
  "mp-shelter": { file: "bg-outro-safe.mp3", volume: 0.2 },
  "combo": { file: "bg-daily-briefing.mp3", volume: 0.2 },
};

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
      {/* Original data reels only — promo IDs now handled by V2 explainers */}
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
                {BG_MUSIC[reel.id] && <Audio src={staticFile(`audio/${BG_MUSIC[reel.id].file}`)} volume={BG_MUSIC[reel.id].volume} />}
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
      {/* V2 Explainer compositions */}
      {EXPLAINER_CONFIGS.map((cfg) => {
        const hasAudio = AUDIO_REELS.has(cfg.id);
        const totalFrames = hasAudio && AUDIO_DURATIONS[cfg.id]
          ? AUDIO_DURATIONS[cfg.id]
          : cfg.scenes.reduce((s, sc) => s + sc.durationInFrames, 0);
        const baseTotal = cfg.scenes.reduce((s, sc) => s + sc.durationInFrames, 0);
        const scale = totalFrames / baseTotal;

        return (
          <Composition
            key={`v2-${cfg.id}`}
            id={cfg.id}
            component={() => (
              <>
                {hasAudio && <Audio src={staticFile(`audio/reel-${cfg.id}.mp3`)} startFrom={30} />}
                <MusicFadeOut file={cfg.bgMusic} baseVolume={0.2} />
                <Series>
                  {cfg.scenes.map((scene, i) => (
                    <Series.Sequence key={i} durationInFrames={Math.round(scene.durationInFrames * scale)}>
                      {renderExplainerScene(scene, cfg.accentColor)}
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
      {/* Final 4 videos */}
      {FINAL_VIDEOS.map((vid) => (
        <Composition
          key={vid.id}
          id={vid.id}
          component={() => {
            const scenes = [
              { type: "typing-hook" as const, durationInFrames: 90, props: { text: vid.title } },
              { type: "heatmap" as const, durationInFrames: Math.round(vid.frames * 0.2), props: { caption: "" } },
              { type: "trend" as const, durationInFrames: Math.round(vid.frames * 0.2), props: { caption: "" } },
              { type: "text" as const, durationInFrames: Math.round(vid.frames * 0.2), props: { line1: "Data-driven.", line2: "Not speculation." } },
              { type: "disclaimer" as const, durationInFrames: Math.round(vid.frames * 0.15), props: { text: "wardashboard.live\nmissileprobability.com" } },
              { type: "outro" as const, durationInFrames: Math.round(vid.frames * 0.15), props: { url: "wardashboard.live", accent: "#4A90D9" } },
            ];
            const totalSceneFrames = scenes.reduce((s, sc) => s + sc.durationInFrames, 0);
            const scale = vid.frames / totalSceneFrames;
            return (
              <>
                <Audio src={staticFile(`audio/${vid.id}.mp3`)} startFrom={30} />
                <MusicFadeOut file={vid.music} baseVolume={0.2} />
                <Series>
                  {scenes.map((scene, i) => (
                    <Series.Sequence key={i} durationInFrames={Math.round(scene.durationInFrames * scale)}>
                      {renderExplainerScene(scene, "#4A90D9")}
                    </Series.Sequence>
                  ))}
                </Series>
              </>
            );
          }}
          durationInFrames={vid.frames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}
    </>
  );
}
// Heatmap grid for V2 scenes
const heatGrid = (() => {
  const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
  REAL_DATA.dailyCounts.forEach((count, i) => {
    const day = (i + 5) % 7;
    for (let h = 0; h < 24; h++) {
      grid[day][h] += Math.round(count / 24 * (1 + Math.sin(h / 3) * 0.5));
    }
  });
  return grid;
})();
const heatMax = Math.max(...heatGrid.flat());

function renderExplainerScene(scene: ExplainerScene, accentColor: string) {
  const d = data;
  const fillText = (t: string) => t.replace(/\{daysOfWar\}/g, String(d.daysOfWar)).replace(/\{totalAlerts\}/g, String(d.totalAlerts)).replace(/\{gushDanTotal\}/g, String(d.gushDanTotal));

  switch (scene.type) {
    case "typing-hook":
      return <TypingHookScene text={fillText(scene.props.text as string)} accentColor={accentColor} />;
    case "text":
      return <TextScene
        line1={fillText(scene.props.line1 as string)}
        line2={scene.props.line2 ? fillText(scene.props.line2 as string) : undefined}
        line3={scene.props.line3 ? fillText(scene.props.line3 as string) : undefined}
        big={scene.props.big as boolean}
        flash={scene.props.flash as boolean}
        color={scene.props.color as string}
        accentColor={accentColor}
      />;
    case "big-number": {
      const val = typeof scene.props.value === "string" ? parseInt(fillText(scene.props.value as string)) : (scene.props.value as number);
      return <BigNumberV2 value={val} label={scene.props.label as string} suffix={scene.props.suffix as string} color={scene.props.color as string} accentColor={accentColor} />;
    }
    case "heatmap":
      return <HeatmapV2 grid={heatGrid} maxVal={heatMax} caption={scene.props.caption as string} accentColor={accentColor} />;
    case "timeline":
      return d.latestEvent
        ? <TimelineV2 {...d.latestEvent} caption={scene.props.caption as string} accentColor={accentColor} />
        : <TextScene line1="Events tracked" line2="in real time" accentColor={accentColor} />;
    case "comparison":
      return <ComparisonV2 leftValue={d.lastWeekTotal} leftLabel="Last Week" rightValue={d.thisWeekTotal} rightLabel="This Week" changePct={d.weekChange} caption={scene.props.caption as string} accentColor={accentColor} />;
    case "trend":
      return <TrendV2 dailyCounts={d.dailyCounts} caption={scene.props.caption as string} accentColor={accentColor} />;
    case "disclaimer":
      return <DisclaimerScene text={scene.props.text as string} accentColor={accentColor} />;
    case "outro":
      return <OutroV2 url={scene.props.url as string} accent={scene.props.accent as string || accentColor} />;
    case "split-screen":
      return <SplitScreenScene />;
    case "region-bars":
      return <TextScene line1="North: 90%" line2="Gush Dan: 27%" line3="South: 25%" accentColor={accentColor} />;
    default:
      return <TextScene line1="..." accentColor={accentColor} />;
  }
}
