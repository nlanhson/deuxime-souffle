---
name: coach-redesign-session
description: "Where the coach-app screen redesign stands (Welcome done) and what's next (Login, then Home), plus the Mobbin references already gathered"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2b515d1e-5ec9-45d7-b7c3-ea90fb5ac8f1
---

Mobbin-MCP-driven redesign of the **Coach mobile app** (`apps/coach/`, React Native / Expo SDK 56, iOS, dark "Le Club" theme — see [[brand-logo]], [[avoid-ai-look]], [[no-em-dash-copy]]). Goal: fix the screens that felt "off/sloped" by matching strong patterns from dark sporty coaching apps (**Future, Centr, Gymshark, Runna, Fitbod**).

**DONE — Welcome screen** ([apps/coach/src/screens/WelcomeScreen.tsx](apps/coach/src/screens/WelcomeScreen.tsx)): rebuilt to a **contained looping video hero** (Centr/Future pattern). Top = rounded video card; bottom = ink canvas with Anton headline + Rouge `PrimaryButton` + "Apply to join" link. Video = the brand's **own** seniors-boxing film (self-hosted at `deuxieme-souffle.com/wp-content/uploads/2024/04/2e-souffle-30-SEC-online-video-cutter.com_.mp4`), transcoded with ffmpeg to `apps/coach/assets/hero/welcome.mp4` (12s loop, 720×900, ~0.7 MB, cut from t=11.5, 4:5 centre-crop). Poster + reduced-motion fallback = `apps/coach/assets/hero/welcome.jpg` (Pexels 6922177, free licence). Recipe in `apps/coach/assets/hero/README.md`. tsc clean.

**BLOCKER / why the app crashed:** adding `expo-video` pulled in a **native module + config plugin**, so the existing dev client is stale → the macOS "DeuximeSouffle cannot be opened" crash. Must rebuild before video runs: `cd apps/coach && npx expo run:ios`. (User said do NOT open the broken build.) `HERO_VIDEO` was briefly set to `null` to avoid a launch crash, then restored to the `require` once the mp4 was placed.

**NEXT STEPS (user's stated order):**
1. **Improve Login** ([apps/coach/src/screens/LoginScreen.tsx](apps/coach/src/screens/LoginScreen.tsx)) to share the new hero language. Mobbin refs: Yamibuy (Sign In/Sign Up underlined tab toggle, red CTA), Duolingo (Apple/Google stacked — note Apple sign-in is required if any social login is offered), DailyArt (sheet style).
2. **Improve Home page** ([apps/coach/src/screens/AccueilScreen.tsx](apps/coach/src/screens/AccueilScreen.tsx)) — user wants good home examples from Mobbin. Already found (iOS): **Runna = best match** (day strip + "today" hero card + week-overview progress bar + sticky CTA) https://mobbin.com/screens/eb878d51-4650-4252-80a8-62e0b2465ec1 ; **Fitbod** (dark dashboard, big Anton-style stat row, floating action) https://mobbin.com/screens/184905ea-43af-4f0b-a3e3-cc5b67a343c4 ; **Future** ("Your Coach" card + consistency calendar) https://mobbin.com/screens/b1287e25-67a4-43e4-b75c-0eeaf4aa1ec2 .

**Other screens still queued:** Sign up (Preply/Speak 3-field + inline validation), Sessions (Opal dark Today/Upcoming list), Settings/Profile (CVS/Cash App/Freenow grouped rows). Full pattern board was delivered earlier in the session.

**Suggested polish (non-blocking):** swap the poster to a frame from welcome.mp4 (`ffmpeg -ss 3 -i welcome.mp4 -frames:v 1 welcome.jpg`) so the loading still matches the film.
