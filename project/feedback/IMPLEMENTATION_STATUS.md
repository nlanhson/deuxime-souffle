# DS_UI_vs_WBS_Mismatch — implementation status

Source: `DS_UI_vs_WBS_Mismatch.xlsx` (client mismatch analysis, 28 rows) + the client's
back-office "Invite a coach" form (screenshot, 2026-06-12).
Scope decisions: **keep the 4 EXTRA items** (client-accepted enhancements) · **build all 5
missing features**. Last updated: 2026-06-12. Typecheck: clean (`npx tsc --noEmit`).

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
| EXTRA ×4 | Kept as-is per decision (activities multi-select, facility-ready, access line, application statuses) | — |

## Not tackled yet ⏳

1. **PLA-01 — dashboard coach badge**: `BadgesScreen` exists and exports `CURRENT_LEVEL`, but
   the level/badge chip is **not yet added to the Accueil header**, and tapping it should open
   BadgesScreen. (`AccueilScreen.tsx` untouched.)
2. **PLA-01 — unit type on next-session card**: the hero card on Accueil doesn't show the care
   unit yet (the data exists on the Disponibles `Avail.unit` model).
3. **PLA-04 — per-day session counts**: Available weekly view still shows dots only; the WBS
   wants an explicit count per day.
4. **PLA-06 — travel-time warning**: copy + helpers exist in `copy.ts`
   (`availableScreen.travel.overLimit…`) and DisponiblesScreen has estimate plumbing, but per
   the client's video the warning never fires (e.g. Greenfield Lodge 15.4 km vs 45-min max) —
   the trigger logic needs verifying/fixing in `DisponiblesScreen.tsx` / `AvailableDetailModal`.
5. **SESS-01 — engagement scale**: report still uses the 5-point star "Session atmosphere";
   WBS wants 4 emoji options (😴 Rather tired / 😐 Average / 🙂 Well engaged / 🔥 Very dynamic).
   Touches `ReportScreen.tsx`, the read-only `ReportView` in `SeancesScreen.tsx`, and
   `copy.report.atmosphere`.
6. **SESS-01 — difficulty field**: Easy / Standard / Demanding single-select not yet added to
   the report form (would become a 7th step or fold into the existing numbering).
7. **QA pass (not run)**: no-all-caps sweep on the untouched screens (Accueil, Disponibles,
   Welcome, Splash still have `textTransform: 'uppercase'` eyebrows; Login/SignUp/Pending were
   fixed), reduced-motion review of the new sheets, and a visual run in the simulator/web.
8. **French translation**: copy.ts is still EN-for-review (project-wide, pre-existing).

## Notes / judgement calls (flag to client if needed)

- DOB, civility and legal status are **optional** (no asterisk on the client's form); DOB is
  validated when filled (real date, 16+).
- "Second Wind training course" rendered as "Deuxième Souffle training course" for brand
  consistency.
- Two-wheel vehicle icon is a ⚡ bolt placeholder — heroicons has no bicycle glyph.
- Month view is a static June 2026 grid (no month paging) — prototype-grade, matches mock data.
- Absence step 2 (message) is optional; only the reason is required.
