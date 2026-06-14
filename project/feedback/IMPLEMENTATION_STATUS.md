# DS_UI_vs_WBS_Mismatch — implementation status

Source: `DS_UI_vs_WBS_Mismatch.xlsx` (client mismatch analysis, 28 rows) + the client's
back-office "Invite a coach" form (screenshot, 2026-06-12).
Scope decisions: **keep the 4 EXTRA items** (client-accepted enhancements) · **build all 5
missing features**. Last updated: 2026-06-13 — **all actionable items implemented**.
Typecheck: clean (`npx tsc --noEmit`).

## Done ✅

| Item | What was implemented | Where |
|---|---|---|
| Registration form (client request + AUTH-01) | Rebuilt to back-office "Step 1 — Coach's identity" field set: civility, date of birth (DD/MM/YYYY masked), first name/name, email, phone, personal address, SIRET (123 456 789 00012), legal status, INSEE auto-verification note. Password/invite/consent kept for self-serve. | `SignUpScreen.tsx`, new `SelectField.tsx` |
| AUTH-02 Google OAuth on login | Google button + "or" divider above email (stub, same as signup) | `LoginScreen.tsx` |
| AUTH-19 doc statuses | Per-document Received (green) / To add (gold) chips; CV + URSSAF mock-received | `PendingApprovalScreen.tsx` |
| AUTH-19 processing time | "Typical review time: 2–3 working days" line in the hero | `PendingApprovalScreen.tsx` |
| AUTH-14 delete account | Destructive row in Profile → Account; request → confirm → "Deletion requested" state | `ProfileScreen.tsx` |
| PLA-08 transport modes | Car / **Two-wheel vehicle** / Walking / Other | `ProfileScreen.tsx` |
| PLA-08 travel slider | 10–90 min slider (5-min steps, −/+ steppers, adjustable a11y) replaces ≤15/30/45/60 chips | new `SliderSheet.tsx` |
| PLA-08 departure addresses | Primary + optional secondary address | `ProfileScreen.tsx` |
| PLA-09 half-day availability | Mon→Sun grid with Morning/Afternoon toggles (day-label tap = whole day) | new `HalfDayScheduleSheet.tsx` |
| PLA-14 hourly rate | "Your hourly rate" row in confirmed session detail | `SeancesScreen.tsx` |
| PLA-14 Late action | "Running late" in Manage → delay picker (5/10/15/30 min) → acknowledgement | `SeancesScreen.tsx` |
| PLA-11 absence 3-step form | Reason → message to care home → review + confirm (pageSheet, step indicator) | `AbsenceModal.tsx` (rebuilt) |
| PLA-02 copy address | Copy button on the Where row of confirmed session detail (expo-clipboard, inline "Copied") | `SeancesScreen.tsx` |
| PLA-02 month view | List ↔ Month toggle on Confirmed; June grid with dots + per-day session list | `SeancesScreen.tsx` |
| GAME-01/02 badges & levels | Level card with rouge→or progress meter, earned + in-progress badge grid; linked from Profile | new `BadgesScreen.tsx` |
| SESS-05 report history | Chronological list, facility filter chips, "Show more" pagination, review-status chips | new `ReportHistoryScreen.tsx` |
| SESS-06 EHPAD feedback | Average-rating hero + per-session rating/comment cards | new `FeedbackScreen.tsx` |
| PLA-01 dashboard coach badge | Gold "Lv 3" chip in the Accueil header → opens Badges & level | `AccueilScreen.tsx` |
| PLA-01 unit type | Care-unit row ("Protected unit · Ground floor") on the next-session hero + its detail modal | `AccueilScreen.tsx`, `NextSessionDetailModal.tsx` |
| PLA-04 per-day counts | Red count pill on each week-strip day + "· N open" on the selected-day header | `DisponiblesScreen.tsx` |
| PLA-06 travel warning | Aligned the mock max to the Profile default (45 min) and bumped Greenfield Lodge to 21.5 km (~54 min) so the over-limit banner fires; logic was already correct | `DisponiblesScreen.tsx` |
| SESS-01 engagement scale | 5-star "atmosphere" → 4 emoji options (😴 Rather tired / 😐 Average / 🙂 Well engaged / 🔥 Very dynamic) | `ReportScreen.tsx`, `SeancesScreen.tsx`, `copy.report.engagement` |
| SESS-01 difficulty field | New "Perceived session difficulty" question (Easy / Standard / Demanding), shown in the read-only report too | `ReportScreen.tsx`, `SeancesScreen.tsx` |
| No-all-caps sweep | Removed the last `textTransform: 'uppercase'` (Welcome, Splash, CheckInModal demo label) — zero remain app-wide | various |
| EXTRA ×4 | Kept as-is per decision (activities multi-select, facility-ready, access line, application statuses) | — |

## Not tackled — by design ⏳

1. **Simulator / device run**: code typechecks clean but hasn't been run on a device build
   (`npx expo run:ios` is a heavy dev build not set up in this environment). Recommend a visual
   pass before sign-off. Reduced motion is safe by construction — the new sheets ride
   `BottomSheet` (cross-fades, no slide, under reduced motion) and the new pageSheet screens add
   no custom entrance animation.
2. **French translation**: `copy.ts` is still EN-for-review (project-wide, pre-existing — out of
   scope for the mismatch fixes).

## Notes / judgement calls (flag to client if needed)

- DOB, civility and legal status are **optional** (no asterisk on the client's form); DOB is
  validated when filled (real date, 16+).
- "Second Wind training course" rendered as "Deuxième Souffle training course" for brand
  consistency.
- Two-wheel vehicle icon is a ⚡ bolt placeholder — heroicons has no bicycle glyph.
- Month view is a static June 2026 grid (no month paging) — prototype-grade, matches mock data.
- Absence step 2 (message) is optional; only the reason is required.
- PLA-06: the warning logic was already correct; the demo just never tripped it because the two
  mock travel-max values disagreed (Profile 45 min vs Disponibles 30 min). Aligned both to 45 and
  made Greenfield Lodge genuinely far (21.5 km) so it now fires as the client expected.
- PLA-01 coach badge shows level only ("Lv 3"); the full badge collection lives one tap away in
  the Badges & level screen — kept the header chip minimal so it doesn't crowd the greeting.
