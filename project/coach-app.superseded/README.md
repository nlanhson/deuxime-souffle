# Coach app — `Salut, Karim` (RN prototype)

React Native (Expo SDK 56) Coach home — the Coach's first screen, on the production stack. Runs on
the iOS Simulator. Built on the Le Club design tokens. (A throwaway HTML prototype was used to
pressure-test the tokens first and has since been retired; this app is the source of truth.)

- **Screen:** [App.tsx](App.tsx) — Coach · Accueil, surface = coach (ink), MVP scope only.
- **Tokens:** [theme.ts](theme.ts) — a **copy** of `project/design-system/theme.ts`. Canonical source
  stays in `design-system/`; this copy is what folds into `packages/shared/theme` once the Turborepo lands.
- **Fonts:** Anton · Oswald · Inter via `@expo-google-fonts/*` (loaded at runtime with `useFonts`).
- **Nav:** 4 tabs — Accueil · Séances · Disponibles · Revenus (per STATE.md decision). Profile +
  notifications top-right in the header.

## Run it on the iPhone simulator

```bash
cd project/coach-app
npm install                 # first time only
npx expo start --ios        # boots Metro + opens Expo Go on the booted simulator
```

Notes:
- If port 8081 is taken (another Expo project), add `--port 8082`.
- Needs a booted simulator: `xcrun simctl boot "iPhone 17 Pro"` then `open -a Simulator`.
- First launch installs **Expo Go** into the simulator (one-time download).
- Press `r` in the Metro terminal to reload; edits hot-refresh automatically.

## Scope

MVP coach features only (C09/C11/C16/C21/C22/C35 + notifications). **No gamification** — the PRD
defers it to V2 and it's absent from the Coach feature list. See [SPEC.md](SPEC.md) for the full
block→story map, the gamification rationale, and the token-gap findings (on-ink status colors,
raised-card text polarity).

> This is a JS-only Expo Go prototype (no custom native code), so it runs without a dev build.
> A production build would embed fonts via the `expo-font` config plugin and add navigation,
> data, and the screens behind the four tabs.
