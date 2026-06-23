# design-sync notes — Deuxième Souffle · Coach

## What this sync is
- Repo is a product monorepo (no Storybook, no shared DS package). User scoped the sync to **apps/coach** (the React Native / Expo app), NOT the web apps (admin/ehpad).
- Project: **Deuxième Souffle — Coach** (`bb5f11e1-1c80-4e88-b502-ed6c7fa6da1f`). Shape: `package`.
- Coach renders on web via **react-native-web** (already a dep). This is firmly OFF the converter's default envelope, so we feed the converter a **pre-built web dist** instead of letting it bundle source.

## The off-envelope build (apps/coach/.ds-dist/, run via cfg.buildCmd = build-all.mjs)
The converter's esbuild has no RN-web aliasing and `lib/bundle.mjs` is fork-banned, so a wrapper pre-bundles first:
1. `gen-barrel.mjs` → `index.tsx` (re-exports every component) + `component-src-map.json`.
2. `gen-fonts.mjs` → copies the 9 brand TTFs from `@expo-google-fonts/{anton,oswald,inter}` and writes `fonts.css` (@font-face whose family names === the `Inter_600SemiBold`-style strings react-native-web emits for `fontFamily`). Wired via `cfg.extraFonts`.
3. `gen-docs.mjs` → `.design-sync/docs/<Name>.md` with `category` frontmatter (→ DS-pane group) + the real component JSDoc (→ prompt.md). Wired via `cfg.docsDir`.
4. `gen-props.mjs` → `apps/coach/ds-sync-types/<Name>.d.ts` — per-component `<Name>Props` extracted from source via ts-morph, RN style/animated types sanitized to `unknown`, undeclared local/generic types collapsed to `unknown` (so emitted .d.ts is self-contained valid TS).
5. `prebundle.mjs` → esbuild bundles `index.tsx` → `.ds-dist/web-dist.mjs`: `react-native`→`react-native-web`, web-first `resolveExtensions`, `mainFields:[browser,module,main]`, react/react-dom EXTERNAL (so the converter shims them to window.React, single instance). A **banner** shims `globalThis.process`/`__DEV__` so the IIFE doesn't throw `process is not defined` at eval.

Converter invocation (from repo root):
```
node apps/coach/.ds-dist/build-all.mjs   # = cfg.buildCmd; rebuilds web-dist + types + docs + fonts
node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules apps/coach/node_modules --entry apps/coach/.ds-dist/web-dist.mjs --out ./ds-bundle
DS_CHROMIUM_PATH=<cached headless shell> node .ds-sync/package-validate.mjs ./ds-bundle
```

## Gotchas (must-know for re-sync)
- **Generated `.d.ts` must live in a NON-hidden dir.** `projectFor`'s `**/*.d.ts` glob (fast-glob) skips dot-dirs, so types in `.ds-dist/` were invisible → empty props. They are emitted to `apps/coach/ds-sync-types/` (non-hidden, gitignored) on purpose. Do not move them under a dot-dir.
- **esbuild stubs** (`.ds-dist/stubs/`, aliased in prebundle.mjs): `@react-native-segmented-control/segmented-control` (Flow-typed, native-only; web uses the JS pills) and `react-native-safe-area-context` (its `useSafeAreaInsets()` THROWS on web with no provider — the stub returns zero insets + passthrough Provider/View deterministically, fixing InkHeader/NotificationCenter and any transitive consumer). Prefer this stub over `cfg.provider` (handles transitive use, no async measurement).
- **No static component CSS** — RN-web injects styles at runtime (`[CSS_RUNTIME]`, non-blocking). Fonts are the only static styling shipped.
- **No provider needed for i18n** — `useCopy()` falls back to FR copy, so cards render without an i18n provider.
- **Grouping via gen-docs** — all components are flat in `src/components/`, so the converter would group everything as `general`. gen-docs assigns 8 groups (Buttons & Actions, Controls & Inputs, Cards & Display, Brand, Feedback & Motion, Modals, Sheets, Map) via the GROUP map in gen-docs.mjs. Edit that map to regroup.
- **SkeletonProvider** is excluded from cards (`componentSrcMap.SkeletonProvider = null`) — it's infrastructure, still exported in the bundle for Skeleton/SkeletonCircle/Reveal to use.

## Preview authoring pattern
Previews import components from `'coach'` (shimmed to window.CoachDS). Layout glue is plain web HTML (`<div>`) — NEVER import react-native in a preview. Skeleton props are `w`/`h`/`r`; SkeletonCircle is `d`; GradientFill is an absolute fill (host needs position:relative + fixed size + overflow:hidden); Reveal uses flex:1 (host needs height + display:flex); BlankScreen/NotificationCenter are pageSheet Modals (wrap in a fixed phone-sized stage). SVG marks (Logo/GoogleMark) need an explicit `size`.

## Playwright / render check
No system Chrome. A cached playwright chromium build **1223** lives at `~/Library/Caches/ms-playwright/`. validate honors `DS_CHROMIUM_PATH`; point it at `chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell`. Installed playwright-core/playwright 1.61 (pins 1228) but the executablePath override makes the version mismatch irrelevant — it renders fine.

## Known render warns (triaged, not new)
- (none currently — Logo/GoogleMark RENDER_THIN was resolved by authored previews with explicit size.)

## Preview scope (this run)
Authored + graded good: 20 components (all buttons/controls/inputs/cards/brand/feedback). The 14 modals/sheets/map ship functional with auto/floor cards (user deprioritized; authorable on any re-sync — authored files + grades carry forward).

## Re-sync risks (watch-list)
- **react-native-web / expo version bumps** can break the prebundle (new Flow-typed deps, changed export conditions). If prebundle fails, check for new native-only packages needing a stub in `.ds-dist/stubs/` + an alias in prebundle.mjs.
- **The safe-area & segmented stubs are pinned to current APIs** — if a component starts using a new export from those packages, extend the stub.
- **Generated types/docs are regenerated from source** by build-all — if a component's `type Props` changes, props/docs update automatically; if extraction degrades for a component, add `cfg.dtsPropsFor.<Name>`.
- **Fonts** are copied from node_modules at build time — a dependency change to `@expo-google-fonts/*` paths would need gen-fonts.mjs updating.
- **Modals/sheets** were NOT visually verified beyond the render check (auto-render). If authored later, several are full-screen Modals needing a phone-stage wrapper.
- **Playwright build 1223** is machine-local cache; a fresh machine needs `npx playwright install chromium` (then update DS_CHROMIUM_PATH or drop it once the version matches).
