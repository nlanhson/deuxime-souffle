# Coach Feedback ↔ WBS Reconciliation — 2026-06-18

Source feedback: `Design_Feedback_Coach_EN.xlsx` (21 cross-cutting decisions DT-01–21, ~18 screen issues, 9 missing screens M1–M9, 11 questions Q1–Q11).
Checked against: WBS `2_Stories`, `Coach Assignment Algorithm`, `Configurable parameter` sheets, and the PRD.

**Stance:** we do not accept the feedback at face value. Each item below carries a verdict and a citation so we can push back with evidence where it diverges from the contracted scope.

Legend:
- ✅ **ALIGNS** — feedback restores the WBS; our current build drifted. Just do it.
- ✅ **CONSISTENT** — not in WBS but no conflict; reasonable.
- ⚠️ **ADJUST** — core is fine, but the ask's details contradict the WBS; build to WBS, not to the note.
- ⛔ **PUSH BACK** — contradicts WBS/scope, or is mis-cited.
- ❓ **WBS-INTERNAL CONFLICT** — the WBS itself is contradictory; needs a client decision.
- 🆕 **NET-NEW** — not in PRD/WBS; needs sign-off (possibly V2).

---

## 1. Where we PUSH BACK (with evidence)

### DT-07 — "Show coach Equity / Reputation / Proximity score (82/91/74)" — ⛔
- **Wrong citation.** DT-07 cites *PLA-09*, but PLA-09 is **Geolocated Check-in**, nothing to do with score transparency.
- **Wrong audience.** The score breakdown (Equity/Reputation/Proximity/EHPAD-Context) is defined in the **Assignment Algorithm §8.1** as displayed **to the admin** during assignment ("system displays total recommendation score and score breakdown by criteria"). The WBS never exposes these sub-scores to the coach.
- **The coach-facing metric already exists and is different:** PLA-11 shows the coach their **"confidence index"** (singular), not the four algorithm sub-scores.
- **The example is also off-spec:** the model has **four** components (Equity 25 / Reputation 20 / Proximity 10 / EHPAD-Context 5 pts) — DT-07 drops EHPAD-Context and rescales to a 0–100 vanity number.
- **It contradicts the feedback's own DT-06** ("no comparison"): publishing equity/reputation/proximity invites exactly the comparison/gaming DT-06 says to avoid.
- **Our position:** keep the coach-facing **confidence index** (per PLA-11). Algorithm sub-scores stay admin-only (§8.1/§8.2). If they want *some* transparency, propose a single plain-language reliability indicator, not the raw algorithm internals.
- **DECISION (2026-06-18):** client/user chose to **keep the 3-signal coach-facing card as-is** (Équité/Réputation/Proximité, 84/100), accepting it as an approved **override** of this push-back — mockup-faithful over WBS. Built as `apps/coach/src/components/ScoreCard.tsx` (on the Badges & level screen). Revisit only if the client reverses.

### DT-18 — "Anton/Oswald in caps" — ⛔ (caps only)
- "Hi, Karim" vs "Bonjour, Karim" is a fine brand/tone call — accept.
- **"in caps" contradicts the standing no-all-caps brand rule** we already adopted across all three apps. Push back on the caps; keep sentence case. (This is the same rule that superseded EHPAD's original Oswald-uppercase spec.)

### M2 — "Write report: 6-step flow (feelings, observations, progress areas, handover)" — ⚠️
- The screen is a real gap (SESS-01 is undelivered), **but the described content is invented.** WBS **SESS-01** is a **3-step** report with specific fields:
  - Step 1 — participant **count** (default 8, names not required), engagement level (4 options), difficulty (3 options), drawback Yes/No + detail, 48h speed-bonus reminder.
  - Step 2 — three optional 200-char messages: to EHPAD coordinator, confidential to DS, **handover note to next coach**.
  - Step 3 — confirmation.
- **Our position:** build M2 to SESS-01's actual fields, not the note's "feelings / observations / progress areas / 6 steps."

### DT-16 / M1 — "address PER time slot, configurable radius" — ⚠️ (split verdict)
- ✅ **The 10–90 min part is exactly right and is a build-deviation fix** — PLA-08 literally states: *"maximum travel duration supports values between **10 and 90 minutes**"* via slider. Our current fixed-45 is the drift. Restore it.
- ⚠️ **"Address per time slot" overstates the WBS.** PLA-08 supports a **primary address + secondary addresses assigned per weekday** — not per time slot. And the Algorithm proximity Q&A explicitly **recommends V1 use a single default address + single default transport mode** for travel calc, deferring per-slot matching to V2.
- ⚠️ "configurable radius" conflates **travel-time duration** (what PLA-08 configures) with a **distance radius** (not a coach-set field).
- **Our position:** ship the 10–90 slider + weekday secondary addresses (PLA-08). Per-slot address-to-session matching for the proximity score is **V2** per the WBS's own recommendation.
- **DECISION (2026-06-19):** client treats this as feedback to implement, not defer — so per-slot **built in full**. The availability store moved from `departures: string[]` to a **primary address + a list of per-slot `DeparturePoint`s** (`lib/availability.ts`), each carrying its **own isochrone radius override** and a **half-day coverage map**; `pointForSlot()` resolves the address+radius the matching algorithm reads per session (first covering point wins, else primary + default travel time). M1 (`UpdateAvailabilityScreen`) gained an **"Adresses par créneau"** section: add/edit/remove points, with address (FieldEditSheet), coverage (the reused half-day grid), and radius (SliderSheet) — adding a point chains straight into the coverage picker. Seeded one example (Thu/Fri afternoons from a 2nd address @ ≤30 min). FR+EN copy added; the old primary/secondary flat model is gone. Type-clean (tsc 0). Granularity is **per half-day slot** (the app's atomic availability unit), which satisfies and exceeds PLA-08's per-weekday. **Needs device QA.** NB: still diverges from the Algorithm proximity Q&A's "single default address for V1" — flag to client that V1 now carries per-slot data the matching backend must consume.

### Q4 — "8 statuses, ref SESS-13" — ⚠️ mis-cited
- SESS-13 is the **EHPAD's post-session coach evaluation**, not a status reference. Coach session statuses are partly defined in **PLA-13** (Cancelled by Coach Early / Late, No-Show) and the algorithm. Need the real status list reconciled, not SESS-13.

---

## 2. Where the FEEDBACK IS RIGHT and our build drifted from the WBS (just do it)

- **DT-04 "Je suis sur place"** — ✅ **DONE (2026-06-18).** PLA-09 AC literally says the button is "I am on site." Reworded every arrival *action button* (FR `checkInCta`/`action.checkin`/`checkInModal.confirm` → "Je suis sur place"; EN → "I'm on site"; + the hardcoded `NotificationCenter` check-in action). Statuses/alerts ("Check-in ouvert", "Checked in", banners) deliberately left as-is per DT-04. Type-clean.
- **DT-19 "Available sessions"** — ✅ PLA-07 is titled *"Raise hand for Available sessions."* That's the canonical term. Standardize.
- **DT-16 (10–90 min)** — ✅ see above; PLA-08 verbatim.
- **DT-09 handover note shown directly** — ✅ SESS-01 Step 2 has a "Note for Next Coach," visible only to the next coach. Surfacing it on next-session detail is correct.
- **M3 declare absence / M4 cancel** — ✅ real gaps; PLA-11 (impact-aware cancel flow) + PLA-13 (time-phase rules) fully spec these.
- **M9 onboarding gaps** (confirmation / under-review / accepted / forgot-pw / email-verify) — ✅ AUTH-01/02/07; PENDING_APPROVAL state is already in scope.
- **Q3 invoice upload** — ✅ **BILL-07 (S131)** confirms the coach PDF-invoice upload screen is contracted scope. Genuine undelivered gap.

---

## 3. Consistent with WBS / reasonable (accept, no conflict)

- **DT-05** rate never shown to coach — ✅ **DONE (2026-06-18).** Removed the **hourly rate** from session detail (the PLA-14 `Wallet` row in `SeancesScreen`), **Profile** (the rate `Row`; section renamed "Objectifs & tarif"→"Objectifs" / "Goals & rate"→"Goals"), and the **Revenus** dashboard (the rate `StatTile`). Removed the **per-session fee** (the dead `pay` mock data + unused `availPay` style on Home; dropped `pay` from `AvailableTodayModal`'s `Item` type). **KEPT** aggregate earnings/revenue (earned/projected totals, sessions, hours) — that's income, not a rate, and DT-15 expands it. Unused rate *copy keys* + the Profile rate edit-case (no entry point) + `s.rate`/`m.rate`/`p.goals.rate` mock fields left as harmless dead code to avoid type churn. Type-clean. PRD basis: "rate management" is admin/EHPAD scope.
- **DT-06** no ranking — no leaderboard anywhere in WBS; algorithm scores are admin-internal.
- **DT-08** no rejection / notify only if selected — WBS never defines a rejection notification; algorithm assigns one coach. *(Open: Q7 — what non-selected coaches see.)*
- **DT-10 / DT-11** no "individual" format, drop fixed group-size block — model is group sessions; SESS-01 requires only a participant **count** (default 8). "Individual" appears nowhere in PRD/WBS.
- **DT-02** red→gold gradient on CTAs — ✅ **DONE (2026-06-18).** "Only on Session_dropdown" was stale; `PrimaryButton` was already a red→ember gradient app-wide. Switched the ember orange→brand gold (`or[500]`) for the literal rouge→or signature, kept it a corner accent (label over red = contrast safe), and restyled the Home next-session card to ink with the gradient CTA. **DT-17** level as gold badge — ✅ DONE (gold LEVEL pill in the hero level card). **DT-13** confirmed-vs-available distinction, **DT-14** urgency on Home (WBS has the D-7/5/3 emergency cascade) — taste/UX, no conflict, still open. *DT-20: still enforce AA contrast on dark badges.*
- **M5** view sent report, **M6** view handover (= SESS-01 note), **M8** application-submitted confirmation (completes PLA-07) — reasonable gaps.
- **Q5** soft delete — algorithm uses "INACTIVE (delete account)" status; URSSAF/invoice retention argues for soft delete. Confirm, then proceed.

---

## 4. Net-new scope / needs client sign-off

- **DT-15 — 3-month rolling revenue forecast (M / M+1 / M+2).** "Projected revenue" *is* a WBS concept (PLA-11 shows projected-revenue impact on cancellation), so a forecast view has grounding — **but** the specific "schedules made 3 months in advance / M+1 / M+2" framing is **not in PRD or WBS**, and it sits in **tension with DT-05** (if no per-session rate is shown, what populates the forecast amounts?). Confirm the 3-month business assumption and the amount source before building.
- **DT-03 "Le Mouvement"** — ✅ **DONE (2026-06-18, user-facing).** Renamed the coach-app community name: splash `auth.splash.tagline` "Le Club" → "Le Mouvement", signup `auth.signup.eyebrow` "Rejoindre le club" → "Rejoindre le Mouvement", + the WelcomeScreen hero comment. (EN falls back to FR for these — auth EN isn't translated yet; the tagline reads correctly either way, the eyebrow shows FR in EN as before — no regression.) **Left as-is:** "Le Club" as the *design-system codename* in the theme-file headers + `design-system/` docs + ehpad/admin Button comments — that's a cross-app rebrand, out of this coach-scoped item. NB: the moodboard PDF in `brief/` still shows "Le Club" (the "updated moodboard" DT-03 cites wasn't provided), so this trusts the feedback's assertion. Open Q: rebrand the design-system codename too?
- **DT-01 cream/ink palette** — ✅ **DONE (2026-06-18, scope settled).** Premise "app is entirely dark" was STALE (coach has been light since 2026-06-16; reviewer saw the old dark build/video). Moodboard p.7 wants the coach app ink-*dominant*; DT-01 asked for the opposite (cream base). Landed via a shared **`InkHeader`** component (`components/InkHeader.tsx`; ink band, rounded bottom, **always a FIXED header placed outside the ScrollView** so it stays pinned while the body scrolls; `variant="tab"` owns the status-bar inset / `variant="sheet"` for pageSheets). Iterated several rounds in-session — **FINAL RULE: ink fixed header on the 3 TABS only (Accueil hero, Séances, Disponibles); every MODAL is cream (Profile, Revenus, Badges).** Clean "ink = tabs, cream = sheets" split. Header internals standardised app-wide (eyebrow Oswald 13/ls1, title Oswald 28/32, row + `gap: sp.sm`, gutter `sp.lg`). Status-bar polarity: the 3 tabs set light-on-focus / dark-on-blur, global default stays dark for the cream auth screens (Splash/Login/SignUp/ForgotPassword/Pending), modals inherit the presenter's light bar on iOS; tab skeletons cover the scroll body only (`HeaderSkeleton` deleted, Home skeleton gained a level-card placeholder, the fixed header is always on screen so no load flash). Type-clean (0 errors); **needs device QA** — sticky-header fill on the tabs, fixed-hero height on Home (greeting + stats pinned). NB: I'd recommended dosed; user steered the final shape — fine.
- **M7 "Report a delay"** — PLA-13 covers cancel/no-show, not a distinct "delay" action. Possible net-new; confirm it's wanted in V1.
- **Q6 filters/search in confirmed list** — not in WBS; minor enhancement, defer unless prioritized.

---

## 5. WBS-internal conflicts to surface (not the feedback's fault)

- **Cancellation penalty model is contradictory inside the WBS itself:**
  - Assignment Algorithm penalty table: *"Cancellation within **48 hours** after assignment → −2.0."*
  - PLA-13: *"> **30 min** before session = −2 (Early); ≤ 30 min = −5 (Late); no-show = −6."*
  - M4 displays the **"< 48h = −2"** framing. These two rules can't both drive the UI. **Client must reconcile** which threshold/penalty the coach sees before M4 is built.
- **DT-05 (hide rate) vs DT-15 (forecast revenue)** — see §4; needs a coherent rule for how revenue is shown without exposing rate.

---

## 6. Open questions to route back to the client (the 11 Q's, triaged)

| Q | Status from WBS | Action |
|---|---|---|
| Q1 "9 open" vs "5 sessions" | Wording/state — not resolvable from WBS | Client to define semantics, then standardize "Available sessions" |
| Q2 Home "1 of 4 sessions" | Wording — not in WBS | Client to clarify before rewording |
| Q3 invoice upload | **BILL-07 confirms in scope** | Build the gap |
| Q4 8 statuses | Mis-cited (SESS-13 ≠ status ref); partial in PLA-13 | Reconcile real status list |
| Q5 soft delete | Algorithm implies soft (INACTIVE) + URSSAF retention | Confirm, then build soft delete |
| Q6 filters/search | Not in WBS | Defer unless prioritized |
| Q7 non-selected status | WBS silent (ties DT-08) | Client decision |
| Q8 handover-note notification | Ties SESS-01/DT-09 | Client confirm |
| Q9 handover line → report | = SESS-01 Step 2 / M2 | Build into M2 |
| Q10 view sent report | = M5 | Build the gap |
| Q11 delay/absence rules | PLA-11/PLA-13 + algorithm penalties (note §5 conflict) | Resolve penalty conflict first |

---

## Recommended order of operations

1. **Send the §1 push-backs + §5 conflicts + §4 sign-offs to the client** — these need their ruling before we burn build time (esp. DT-07, DT-01 theme, M2 report fields, cancellation penalty model, DT-15 vs DT-05).
2. **Execute §2 immediately** — these are WBS-restorations, no debate needed (DT-04, DT-19, DT-16 slider, DT-09, and the undelivered gaps M3/M4/M9/BILL-07).
3. **Then §3** taste/UX items with the AA contrast pass.
