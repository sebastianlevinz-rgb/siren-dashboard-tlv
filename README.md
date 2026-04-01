# War Monorepo

Two apps + shared code for tracking and analyzing the Iran-Israel conflict.

## Apps

### [missileprobability.com](https://missileprobability.com) — `apps/missile-probability/`
Civilian data tool. Heatmaps, trends, probability forecasts, and pattern analysis for missile alerts across Israel. Live since Feb 2026.

### wardashboard.live — `apps/wardashboard/`
Daily intelligence briefing + content machine. Weekly summaries, geopolitical event timeline, and auto-generated content. In development.

## Shared — `packages/shared/`
Types, data utilities, i18n keys, and CSS variables shared between both apps.

## Stack
Vite, React 19, TypeScript, pnpm workspaces.

## Getting started

```bash
pnpm install
pnpm dev:mp    # missile-probability on localhost:5173
pnpm dev:wd    # wardashboard on localhost:5174
pnpm build:all # build both apps
```

## Wardashboard roadmap
1. Data pipeline (auto-fetch alerts, generate daily summaries)
2. Script writer (AI-generated daily briefing scripts)
3. Remotion (auto-render video briefings)
4. ElevenLabs (text-to-speech narration)
5. Daily automated content publishing
