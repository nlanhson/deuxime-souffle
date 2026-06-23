# Coach · Accueil (`Salut, Karim`) — screen spec

> **Status:** functional first draft (v0.1) · **Surface:** Coach (mobile, ink intensity)
> **Implemented in:** React Native (Expo SDK 56) — [App.tsx](App.tsx), runs on the iOS Simulator.
> Consumes the Le Mouvement tokens from [theme.ts](theme.ts). MVP scope only.
>
> *(A throwaway HTML/CSS prototype was used to pressure-test the tokens first; it has been retired
> now that the RN app is the source of truth. This spec is implementation-agnostic — the story map,
> scope decisions, and token findings below stand regardless of stack.)*

---

## 1. Purpose

First screen built on Le Mouvement. Goals, in order:
1. Surface the Coach's **daily job** (get to the next session, check in) above everything else.
2. Prove the **ink / red-dominant** coach intensity reads well and stays AA.
3. **Pressure-test the tokens** — find what's missing before it's expensive (see §4).
4. Stay strictly inside **MVP scope** (see §3).

Not a goal yet: visual polish, motion design, empty/loading/error states, real data, navigation
between tabs.

---

## 2. What's on the screen → user-story mapping

Every block traces to a Coach feature (`C…` = `2_Stories` / "Coach – Feature list" tab) or a
PRD §3.1 persona goal. Nothing here is invented outside the backlog.

| # | Block | Serves | Story / source |
|---|-------|--------|----------------|
| 1 | **App header** — greeting + date left; notification bell (unread dot) + profile avatar top-right | Identity + alerts entry | `C32` notifications · `C06` profile |
| 2 | **Report-due banner** (conditional) — "Rapport à compléter · Résidence Bellevue" | Surfaces an unwritten report from a finished session | `C25` Write report · `C26` Submit report |
| 3 | **Hero: next session** — EHPAD name, time, address, **contact person**, status chip, **Check-in** + Itinéraire | The #1 field action: get there, check in | `C21`/`C22`/`C23` view assigned/details/status · **`C16` Check-in** · persona "check in on site" |
| 4 | **This week** — day strip (today marked), "5 séances · 7 h 30" | Schedule at a glance | `C09` weekly · `C10` monthly · persona "schedule at a glance" |

> **Block 3 field list = the client's spec, not invention.** WBS *Coach Planning & Check-in* defines the session-detail view verbatim as **"EHPAD name, time, address, contact person"**; status (confirmed/pending/canceled) and the geolocated check-in CTA (C16, "I am on site") are from the same epic. An earlier draft showed *"Group session · 8 residents"* — **dropped**: participant count is a *post-session report* field (report step 1), not a pre-session detail. Distance is kept as a defensible extension of the matching/travel-time feature. The real visual reference is the **coach video / approved Figma screens** the PRD lists as deliverables — match those when available rather than improvising layout.
| 5 | **Séances disponibles** — count + 2 rows, each **Postuler** | Grab open sessions nearby | `C11` view available · `C12` apply · persona "position on available sessions" |
| 6 | **Ce mois-ci** — Validé `840 €` / Prévisionnel `1 260 €` | Revenue transparency | `C35` financial dashboard · persona "track projected & actual revenue" |
| 7 | **Tab bar** — Accueil · Séances · Disponibles · Revenus (4 tabs) | App shell / nav to the coach domains | per STATE.md nav decision |

The home is a **hub**, not its own story — it aggregates the highest-value entry points and
defers the depth (full calendar, the 6-step report form, the available-sessions list, the
revenue breakdown) to the screens behind the tabs. Check-in (`C16`) and the report (`C25`) are
**contextual actions inside Séances**, not tabs.

---

## 3. Scope decisions (read this before adding anything)

### ⚠️ Gamification is intentionally absent
The "Le Mouvement" moodboard leans hard into game mechanics — points, séries, médailles, levels,
leaderboards. **The PRD explicitly defers gamification to V2** ("Gamification … explicitly
deferred to later product iterations", MoSCoW note) and **there is no gamification epic in the
Coach feature list (C01–C35).** So this screen has **no badges, no points, no streak, no level**.

How we keep the brand energy *without* the deferred features:
- **Ink canvas + red as the action engine** (the dosage that makes Coach feel "punchy").
- **Anton numerals on data that IS in scope** — session counts and **euros**. The big confident
  number is the moodboard's energy, redirected from "1 240 PTS" to "5 séances" and "840 €".
- **Gradient + glow reserved for the one true CTA** (Démarrer) and the avatar.

> If gamification is later pulled into MVP, the natural slots are: a strip under the greeting,
> and a `reward`-chip on the revenue card. Designed-around, not designed-out.

### Other scope calls
- **Check-in shown in its "window open" state** (`C16`) because it's the screen's signature
  moment. Pre-window this hero shows a countdown + "Itinéraire" only; that's a state variant for
  the next iteration, not a different screen.
- **Report banner is conditional** — only appears when a completed session has no submitted
  report. Default/empty state (no banner) is the common case.
- **FR-only** copy, per this phase.

---

## 4. Token pressure-test — findings to fold back into the system

The real output of the slice. Both the (retired) web prototype **and** the RN port hit the same
gaps — which confirms they're token-layer issues, not a CSS/RN quirk. Fix in `tokens.json` →
`theme.ts` (`surfaces.coach`) [→ `tokens.css` when web resumes]:

1. **Missing: on-ink status colors.** The semantic status tokens (`action`, `reward`, `info`,
   `progress`, `warning`) are tuned for **light** surfaces. On the ink canvas they feel muddy, so
   the app reaches into the **global ramp** (`palette.vert[300]`, `or[300]`, `bleu[200]`) for
   legible chips/text — breaking the "components reference semantic/theme tokens only" rule.
   **→ Add coach-theme tokens:** `successOnInk`, `pendingOnInk`, `infoOnInk` (+ soft backgrounds).
   Contrast on `#181715` checked: vert-300 ≈ 8.3:1, or-300 ≈ 13:1, bleu-200 ≈ 7:1 — all AA. ✅

2. **Missing: text polarity for raised cards.** The white **hero card** sits on the dark canvas,
   so its text must flip to dark ink — but `surfaces.coach.textPrimary` is crème. The app
   hardcodes `palette.neutral[900]/[600]` inside the card.
   **→ Add:** `textOnRaised` / `textOnRaisedSecondary` to `surfaces.coach`.

3. **Confirmed working:** `surfaces.coach.surfaceRaised` (white) was needed and present;
   `gradient.movement` works on both avatar and CTA; `elevation.glowAction` does the moodboard
   "red glow under DÉMARRER" job (RN `shadowColor` rouge).

4. **Constraint reconfirmed:** white-on-gradient at the red end is ~4.0:1 → **AA-large only**. Our
   CTA label (Oswald 600, uppercase, ≥16px) qualifies. Keep primary CTA labels bold + ≥16px.

5. **Component-spec note — CTA label length:** "DÉMARRER LE CHECK-IN" overflowed the pill;
   shortened to "DÉMARRER". Target **≤ ~12 chars** for primary CTAs in the pill + Oswald caps.

6. **Type scale gap:** the hero session time uses a 50px Anton (between `stat` 32 and `display`
   48). Decide whether "hero session time" earns a named style or snaps to `display`.

7. **Ghost button on ink:** a tappable chip sitting inside a `surface` (neutral-800) card needs a
   step of contrast — settled on `neutral[700]`. Worth a `surface-interactive` token for coach.

---

## 5. Accessibility (WCAG AA — project minimum)

- **Touch targets ≥ 44px** — avatar 48, bell 44, all buttons 44, tabs 44, ghost buttons 44. ✅
- **Body / metadata sizes** — headings & numbers large (Anton 50/34/32, Oswald 28/20/18); reading
  metadata (addresses, descriptions) at 14 (Inter); 10–13 reserved for nav labels & eyebrows only. ✅
- **Never colour alone** — every status carries an icon **and** a word: "Confirmée" + dot,
  "Check-in ouvert" + pin, report banner = warning icon + text, revenue "Validé" chip + label. ✅
- **Contrast** — crème-on-ink ≈ 16:1; all status tints AA on their backgrounds (see §4.1).
- **Semantics (RN)** — `accessibilityLabel` on the bell ("Notifications, 2 non lues") and avatar
  ("Profil de Karim"); `accessibilityRole="button"` on buttons/tabs; `accessibilityState.selected`
  on the active tab; the banner is `accessibilityRole="alert"`.

### Still to do (next iteration)
- **Reduced motion** — wire `AccessibilityInfo.isReduceMotionEnabled` before any animation lands
  (none yet; press feedback is opacity-only). `inclusive-interaction--motion-sensitivity` pass.
- Screen-reader pass on the revenue group (number + unit + label should read as one phrase,
  delta in words). Run `accessible-content--review` + `adaptive-interfaces--colour-independence`.
- Section "Tout voir / Séances / Revenus" header links: confirm a 44px hit area.

---

## 6. How this was verified
Run in **Expo Go on the iPhone 17 Pro simulator** (iOS 26.5, Expo SDK 56). Brand fonts load via
`@expo-google-fonts/*`. Header, hero, week strip, available rows, and revenue cards captured top
and bottom and reviewed. See [README.md](README.md) to run it yourself.

## 7. Next steps
1. Get a **read** on this draft (scope, hierarchy, the gamification call).
2. Fold §4 token gaps back into `tokens.json` + `theme.ts` (coach surface).
3. Build the screens behind the four tabs — start with **Séances** (where check-in `C16` + the
   6-step report `C25` live) or **Disponibles** (`C11`/`C12`).
4. Mirror tokens into **Figma** as variables when the design system goes there.
