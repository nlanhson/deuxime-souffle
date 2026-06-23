# Deuxième Souffle — Coach app

React Native (Expo) app for the APA coach. First slice: the **native bottom navigation**.

## Stack
- **Expo SDK 56** · React Native 0.85 · React 19 · TypeScript
- **Navigation:** `@react-navigation/native` + **`react-native-bottom-tabs`** via
  `@bottom-tabs/react-navigation` — real native tab controllers
  (`UITabBarController` on iOS, `BottomNavigationView` on Android), **not** a JS-drawn bar.
- **Theme:** `src/theme/theme.ts` — vendored copy of `project/design-system/theme.ts`
  (canonical). Moves to `packages/shared/theme` when the Turborepo lands.

## Navigation IA (locked)
Bottom nav = **4 tabs**: `Accueil · Séances · Disponibles · Revenus`.
Profil + notifications live top-right in the screen header, **not** in the tab bar.
Coach surface is **dark (ink)**; active tab tint = `action` red (`#E1322B`).
Tab icons are SF Symbols on iOS (`house`, `calendar`, `hand.raised`, `eurosign.circle`).

### Adaptive nav bar (native ⇄ JS fallback)
The tab bar swaps implementation based on whether the **native module is available**:

| Environment | Renders |
|---|---|
| iOS / Android **dev or standalone build** | **Native** — `react-native-bottom-tabs` (`UITabBarController` / `BottomNavigationView`) |
| **Expo Go**, **web**, iOS < 13 | **JS fallback** — `@react-navigation/bottom-tabs` (themed to match) |

The choice is a **runtime check** ([`supportsNativeTabs.ts`](src/navigation/supportsNativeTabs.ts)), not a
`.ios.tsx`/`.android.tsx` file extension — because **Expo Go also runs on iOS/Android**, so a platform
extension would still try (and fail) to load the native module there. Both navigators read one shared
[`tabs.tsx`](src/navigation/tabs.tsx) config so they never drift.

**Test the fallback:** open the project in **Expo Go** (`npx expo start`, press `i`) — it renders the JS bar.
**Test native:** `npx expo run:ios` (a dev build) — it renders the native bar.

## Run
This uses a native module, so it needs a **dev build** (not Expo Go):

```bash
cd apps/coach
npx expo run:ios       # builds & launches on the iOS simulator (or a connected device)
npx expo run:android   # Android equivalent
```

After the first native build, day-to-day you can just start the bundler:

```bash
npx expo start --dev-client
```

Real device: run `npx expo run:ios --device` (iOS) with the device connected, or build
once and open the app over the LAN with `npx expo start --dev-client`.

## Layout
```
App.tsx                            NavigationContainer (Le Mouvement dark theme) → RootTabs
src/navigation/
  RootTabs.tsx                     adaptive resolver — picks native or JS at runtime
  supportsNativeTabs.ts            capability check (native module? Expo Go? web? iOS version?)
  tabs.tsx                         shared 4-tab config (one source of truth)
  NativeBottomTabs.tsx             react-native-bottom-tabs (native system component)
  JsBottomTabs.tsx                 @react-navigation/bottom-tabs (themed JS fallback)
src/screens/AccueilScreen.tsx      the Coach Home (Accueil tab)
src/screens/{Seances,Disponibles,Revenus}Screen.tsx   placeholder tabs
src/screens/ScreenScaffold.tsx     shared on-brand placeholder
src/copy.ts                        localization seam (English now, French to ship)
src/theme/theme.ts                 vendored Le Mouvement tokens
```

## Next
- Swap placeholders for the real screens (Accueil hub first, then Séances → check-in → report).
- Wire the header: profile avatar + notifications bell (top-right), per the locked IA.
- Load Oswald for tab labels via an expo-font config plugin (currently system font).
- Fold into the Turborepo + `packages/shared` when the technical foundation track starts.
