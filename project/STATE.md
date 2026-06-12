# Project State — Deuxième Souffle

> APA coaching coordination platform for EHPADs. Replaces a Bubble prototype with a
> production-grade system for three audiences: **Coach** (mobile), **EHPAD manager**
> (web), **DS admin** (web back-office). FR-only this phase; France launch, then national.

**Last updated:** 2026-06-11

---

## Current stage

**Phase 1 — Design & MVP Build: 🟡 in progress. Mobile-first — the Coach app is the priority.**

> **Focus (2026-06-08):** all effort on the **Coach mobile app** (`apps/coach/` — monorepo-ready).
> Web apps (EHPAD / admin) are parked for now — the HTML coach prototype has been retired; the design
> system stays as the shared, multi-surface foundation.
>
> **App location consolidated (2026-06-08):** the coach app now lives at **`apps/coach/`** (the
> monorepo-ready layout). The earlier single-screen prototype `project/coach-app/` was merged in
> as the **Accueil** tab and retired → `project/coach-app.superseded/` (safe to delete). Its design
> spec is preserved at [apps/coach/ACCUEIL_SPEC.md](../apps/coach/ACCUEIL_SPEC.md).

Phase 0 (Discovery & Scoping) ✅ complete. All three foundational inputs in and reviewed:
- **PRD** v0.2 (2026-05-21) — [project/brief/PRD_Deuxieme_Souffle (docx).docx](brief/)
- **WBS** — 14 epics / ~155 user stories, ~14-week plan — [project/brief/WBS - Deuxième Souffle (eng).xlsx](brief/)
- **Moodboard** "Le Club" — visual language defined — [project/brief/Moodboard 1 App · Deuxième Souffle.pdf](brief/)

Design-system foundation codified from the moodboard → [project/design-system/](design-system/).
Component specs deepened (2026-06-08) → [design-system/components.md](design-system/components.md):
14 workhorse primitives (forms, structure, nav, feedback) on top of the README §5 expressive set,
all bound to `theme.ts` tokens; 9 more queued (§15) for when their epics land.

**Coach home (`Salut, Karim`)** — first screen, built on the production stack → [project/coach-app/](coach-app/):
**React Native (Expo SDK 56), running on the iOS Simulator**, consuming `theme.ts`. Story map, scope
decisions (incl. no-gamification), and token-gap findings in [coach-app/SPEC.md](coach-app/SPEC.md);
run instructions in [coach-app/README.md](coach-app/README.md). 4-tab nav per the decision below. **Awaiting review.**

---

## Decisions log

| Date | Decision |
|------|----------|
| 2026-06-08 | Visual language locked as **"Le Club"**: palette (Rouge `#E1322B`, Or `#F2C200`, Bleu `#1F3B73`, Vert `#2F9E6B`, Noir `#181715`, Crème `#F7F4EF`), fonts Anton / Oswald / Inter. |
| 2026-06-08 | Design model = **"une base, trois intensités"** — one token set, three surface themes (coach=ink/red-dominant, admin=cream/red-rare, ehpad=cream/red-absent + blue·green). |
| 2026-06-08 | Design tokens authored as `tokens.json` + `tokens.css` (web) + `theme.ts` (RN+React, destined for `packages/shared`). |
| — | **MVP Must-haves** (PRD MoSCoW): matching algorithm, geolocated check-in, 6-step post-session report, automated Pennylane billing. |
| — | **Deferred to V2:** gamification (E12), geographic-coverage analytics (E13), native EHPAD mobile app. |
| 2026-06-08 | **Coach home v0.1** designed. Home = hub aggregating the highest-value coach entry points (next session + check-in, week, available sessions, revenue), depth deferred to the tab screens. |
| 2026-06-08 | **Gamification stays OUT of the Coach home** (PRD defers it; no gamification story in C01–C35). Brand energy kept via ink+red dosage and Anton numerals on *in-scope* data (séance counts, euros) — not points/badges. |
| 2026-06-08 | **Coach bottom nav = 4 tabs: Accueil · Séances · Disponibles · Revenus.** Extends the WBS E02 three-tab spec (Home/Available/Planned) by promoting the revenue dashboard (C35) to a tab. **Profil + notifications live top-right in the AppHeader, not in the bottom nav.** Check-in (C16) & 6-step report (C25) are contextual actions inside Séances, not tabs. Follow-up: availability (C15) now sits under Profil → add a Home nudge when it goes stale (matching depends on it, E05). |
| 2026-06-08 | **Coach home ported to React Native** (Expo SDK 56, RN 0.85). Validates `theme.ts` on the real stack: tokens, gradient+glow, Anton/Oswald/Inter via `@expo-google-fonts`, safe-area. `theme.ts` is copied into the app for now (→ `packages/shared` when the Turborepo exists). |
| 2026-06-08 | **Native nav bar built & verified on the iOS Simulator** → [apps/coach/](../apps/coach/). 4-tab bottom nav via **`react-native-bottom-tabs`** (`@bottom-tabs/react-navigation`) = real `UITabBarController` (the "native system component"), SF Symbol icons, ink theme, Accueil active = red. Coach home is the **Accueil** tab; Séances/Disponibles/Revenus are placeholders. Verified via a **Release build** (embedded JS) after the dev-client/Metro dance — see workflow note below. |
| 2026-06-08 | **Nav bar made adaptive** — `RootTabs` is now a runtime resolver ([supportsNativeTabs.ts](../apps/coach/src/navigation/supportsNativeTabs.ts)): **native** tab controller on iOS/Android dev/standalone builds, **JS fallback** (`@react-navigation/bottom-tabs`, themed) in Expo Go / web / iOS < 13. Both navigators share one [tabs.tsx](../apps/coach/src/navigation/tabs.tsx) config. A `.ios/.android` file extension can't do this (Expo Go runs on iOS/Android too) — hence the capability check. |
| 2026-06-08 | **Profil (C06) built** → [apps/coach/src/screens/ProfileScreen.tsx](../apps/coach/src/screens/ProfileScreen.tsx). Presented as an iOS **pageSheet modal from the header avatar** (mirrors the Notification-center pattern), per the locked IA (Profil top-right, not a tab); avatar `onPress` wired across all four tab screens. Content = the coach's hub: identity + account status (E01) · **Availability & travel preferences (C15 / PLA-08) with an in-screen staleness nudge** when last-updated > 3 days (matching dep, E05) · Goals & rate (target volume + flexibility, default rate) · My documents (CV · URSSAF · insurance · APA diploma) · Account (personal info · Google Calendar sync · password) · Support · Log out. Gamification stays OUT. Field lists trace to the WBS; **layout is a synthesis pending the coach video + approved Figma**. Verified on the iOS Simulator. **Scope-fidelity pass (vs PRD):** added an editable **avatar** (photo + camera badge, gradient-initials fallback) — PRD §5 stores coach avatars; **removed** the at-a-glance Rating/Sessions/Since strip — rating is the admin-side *confidence index* (PRD §5 data flow), and a lifetime session count only appears in the *deferred* gamification stories, so neither is an in-scope coach-profile field. **Visual-style alignment pass (2026-06-10):** brought Profil in line with the now-shared component vocabulary — canonical **eyebrow+title** hub-modal header (`Your account` / Profile, Oswald 28/32), **`../icons` Heroicons-outline** set, row labels → **Inter** (`F.bodyS`), the **raised gradient card** idiom (`cardGradient` overlay · 0.07 hairline · soft shadow), canonical chip padding, and — the headline change — the identity avatar swapped from the bespoke rouge→or **monogram to the shared `ProfileAvatar` silhouette** (photo branch + camera-edit badge kept), so the no-photo state matches every header avatar in the app. Derived via a parallel map→synthesize workflow over theme/icons/shared-components/NotificationCenter/Revenus/Séances; deliberately **overrode** the synthesis' "keep the monogram" call because the gradient avatar was the single biggest clash with the app. Verified on the iOS Simulator. **Functional pass (2026-06-10):** every row now works off local `useState` (edits reflect live). Two reusable sheets added — [OptionSheet](../apps/coach/src/components/OptionSheet.tsx) (single-select on the shared BottomSheet → transport · max-travel · photo source) and [FieldEditSheet](../apps/coach/src/components/FieldEditSheet.tsx) (keyboard-safe form via AuthTextField + an optional segmented choice → departure · areas · schedule · unavailability · rate · monthly target+flexibility · personal info · change-password w/ validation). Confirms reuse `ActionModal` (availability "still current?", Google-Calendar connect/disconnect, document replace→Pending, log-out, about). Help/Contact open via RN `Linking` (URL / mailto). **Editing or confirming availability resets the staleness clock** (the matching-freshness loop — nudge clears, "Updated just now"). Mocked where the prototype has no native/backend: photo pick sets a demo portrait (no expo-image-picker), document "replace" flips status to *Pending review*. Whole app type-clean (0 tsc errors); all three sheet types verified rendering on the iOS Simulator. |
| 2026-06-08 | **Colour scheme reversed: coach = LIGHT app (cream) with DARK ink cards** (supersedes "mobile = dark"), per client moodboard p.11. Flipped `surfaces.coach` (canvas `neutral[50]`, surface/raised `neutral[900]/[800]`, `textPrimary neutral[900]`, + `textOnCard*` for in-card text), nav theme → light + StatusBar dark, tab bar inactive tint bumped for cream contrast. Verified on the iOS Simulator. Re-applied the Anton time-clip fix (lineHeight ≥1.2×) lost in the consolidation. Canonical `design-system/theme.ts` synced. **→ REVERTED same day at the user's request — back to the dark "first design"** (ink canvas, white hero card); all of the above flipped back in `apps/coach` + canonical theme, **kept** the Anton time-clip fix. Net: coach is **DARK** again. See [[color-scheme-decision]] for the dark→light→dark history. |

| 2026-06-08 | **Home scope pass (audit-driven).** (1) **Availability nudge added to Accueil (C15)** — blue/info banner under the report banner prompting availability confirmation; closes the one real Home gap (matching depends on fresh availability, E05). Links to the C15 editor already in Profil. (2) **Report banner confirmed always-on** (product decision) — kept persistent rather than the WBS anomaly-only notification rule (<4 / >10 residents / a "No"), so an unwritten report is never missed; the anomaly rule still governs *push* notifications. (3) **Tab order kept** `Accueil · Séances · Disponibles · Revenus` — WBS lists "Home · Available · Planned" but Séances (Planned) is the daily driver (check-in + report), so it holds the primary post-Home slot; minor logged divergence, swap on request. (4) Earlier: removed the invented "8 residents" and the contact-person line; added a *This-week done-so-far progress bar* (in-scope data, design addition). |
| 2026-06-08 | **Home banners REVERSED — strict WBS (user call).** Both the report-due banner and the availability nudge **removed from Accueil**: the WBS routes both through the **notification center / coach inbox** (report alerts are anomaly-only; availability reminders live in the inbox), and our bell already carries both (NotificationCenter SEED has `reportDue` + `availability`). Home is leaner for it. **Components kept, not deleted:** `ReportScreen` (the C25 6-step form) and `ActionModal` still exist but are now **unwired** — their WBS-faithful entries are **Séances "Write report"** + the **report-due notification** (report), and **Profil** + the **availability notification** (availability). **Follow-up:** wire those triggers, and prune now-dead copy keys (`reportBanner`, `availabilityBanner`, `reportModal`, `availabilityModal`). |
| 2026-06-11 | **EHPAD Manager web app v0.1 built** → [apps/ehpad/](../apps/ehpad/) (Vite 5 + React 18 + TS strict + Router v6, CSS Modules over `tokens.css`, surface `ehpad` apaisée — blue leads, green = santé, red = single CTA). All **27 WBS stories** shipped as runnable screens on a simulated client-side backend (`src/data/` — 150–400 ms latency, rich + empty fixtures, `// STUB:` seams): auth (login/activation/reset incl. expired/used token states), dashboard SESS-08 (KPIs, 2 CTAs, hand-built Mois/Semaine/Liste calendar w/ unit-colour legend + « Prochaine »), sessions (list+filters, detail w/ **journal des événements** NOTI-03, coach-report modal + PDF stub, edit-occurrence SESS-10, postpone-only SESS-12 w/ Undo), 3-tap evaluation SESS-13, contracts (7 statuses, 5-step wizard CON-01/02/08 w/ shared draft, minor/major edit CON-04, resubmit CON-06, renew CON-15, 3-step speed-bumped non-renewal CON-16), invoices BILL-01 (amber overdue banner, HT everywhere), contacts AUTH-21 (staleness clock), facility profile (Groupe read-only EST-09), delete-request AUTH-14, notification centre NOTI-04. Role gating Admin/User visible (disabled + « Réservé au contact principal »). Verified headless-Chromium: 46 route visits × 5 contexts (admin/user/auth/empty/mobile-320px) — **0 console errors**, 26/26 interactive flow checks; `tsc --noEmit`, ESLint (jsx-a11y) and `npm run build` clean. Run: `cd apps/ehpad && npm install && npm run dev` (→ localhost:5173; `?role=`, `?state=empty`, `?debug=` documented in [apps/ehpad/README.md](../apps/ehpad/README.md)). Spec source: [EHPAD_Fable5_Build_Prompt.md](EHPAD_Fable5_Build_Prompt.md). |
| 2026-06-08 | **Bottom nav reduced 4 → 3 tabs — strict WBS (user call).** WBS coach nav is verbatim 3: *"Home · Available Sessions · Planned Sessions."* Dropped the **Revenus** tab (our C35 addition); tabs are now **Accueil · Séances · Disponibles**. **Revenue dashboard kept in full** — `RevenusScreen` refactored from a tab into a **pageSheet modal** (same pattern as Profil/Notifications: close-X top bar, no in-screen bell/avatar), opened from the **"Earnings" button on Home's "This month" card** (`onLink` → `setRevenusOpen`). C35 fully intact, just one tap from Home instead of a tab. `tabs.tsx` TabName/TABS/`Euro` icon trimmed; `RevenusScreen` lost `useTabBarInset`/SafeAreaView (modal handles insets). Tab order question (WBS lists Available before Planned; we keep Séances before Disponibles for daily-driver frequency) still open, unchanged. |

## Open questions / to confirm
- Fonts: confirm licensing for Anton / Oswald / Inter (all OFL — expected fine). *Loaded in `apps/coach` via `@expo-google-fonts/*`.*
- PRD-flagged: post-session report step 6 (desired session volume) inclusion TBC; Pennylane bidirectional sync capabilities to verify; Facebook social login pending client validation.
- **From the slice:** is the hero check-in shown only in its "window-open" state enough for v0.1, or design the pre-window countdown state now? Does "hero session time" earn a named type style or snap to `display` (48)?
- **Next-session card aligned to WBS (2026-06-08):** card fields now = the client's verbatim session-detail spec (EHPAD name, time, address, **contact person**, status) + C16 check-in CTA. Dropped the invented "Group session · 8 residents" (participant count is a *post-session report* field, not a pre-session detail). **Bigger gap:** the PRD names a **coach video + approved Figma screens** as deliverables — the actual Home-screen *layout* was never written in text, so our composition is a reasoned synthesis of in-scope features, not a client-drawn screen. **Get that video / Figma and match it** before treating any screen layout as final.

---

## Tech stack (PRD §5)
Turborepo monorepo · **React Native** (coach) · **React** (admin/EHPAD web) · **Supabase** self-hosted (Postgres/auth/storage/realtime) · **Bun** · GitLab CI.
Integrations: Pennylane (billing, critical), Google Calendar (1-way sync), DU/Google Maps (matching + check-in, critical), Brevo (email), Telnyx (SMS), FCM/APNS (push).

## Roadmap (~14 wks)
Discovery & Design (W1–6) → Technical Foundation (W4–6) → Feature Dev (W6–11) → QA (W12) → Staging/Acceptance + Production (W13–14).

---

## Next step
**Review the Coach app** in [apps/coach/](../apps/coach/) (`npx expo run:ios`) — the native nav bar + Accueil tab. Then, mobile-first:
1. Fold the [SPEC §4](../apps/coach/ACCUEIL_SPEC.md) token gaps back into `tokens.json` + `theme.ts` — on-ink status colors + raised-card text polarity for the coach surface.
2. Build the next coach screen — **Séances** (check-in `C16` + 6-step report `C25` live here) or **Disponibles** (`C11`/`C12`); both are placeholder tabs now.
3. ✅ Header avatar → **Profil** and bell → notifications now wired (top-right, per the locked IA). Remaining header polish: the native tab bar's Oswald labels need an expo-font tab-label wiring — currently system font. **Build the deeper Profil sub-flows** the hub stubs out: the availability editor (PLA-08 — day/time/slot config, map "View on map", transport, unavailability periods), document upload/view, change-password. Add the matching **Home staleness nudge** for availability (the in-Profil nudge already exists).
4. Iterate home states (pre-window check-in, empty/loading) as needed.
(Deferred for now: web EHPAD/admin apps, Figma mirroring, full Turborepo setup. `project/coach-app.superseded/` can be deleted once the merge is reviewed.)

## Dev workflow note (RN) — avoid the Metro/dev-client trap
- **`react-native-bottom-tabs` is a native module** → needs a **dev build**, not Expo Go. Run `npx expo run:ios`.
- The simulator dev client downloads JS from Metro. If you reconnect it by hand, the bundler URL in the deep link **must be percent-encoded**, or you get a `No script URL provided` RedBox:
  `xcrun simctl openurl booted "dscoach://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"` (✅ encoded), not `...url=http://localhost:8081` (❌ drops the URL).
- For a quick, dependency-free check (no Metro at all), build with the **JS embedded**: `npx expo run:ios --configuration Release`, then `xcrun simctl launch booted fr.deuxiemesouffle.coach`.
- One bundler per port — don't leave stray `expo start` instances squatting 8081/8082.
