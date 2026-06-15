# EHPAD web app — changelog & decisions log

Running log of work on the EHPAD manager web app (`apps/ehpad`). **Newest first.**
Maintained as we go — every meaningful change and every decision lands here.

**How to read**
- **Changes** = what was built or modified (with the files touched).
- **Decisions** = a choice made and *why*, so we don't relitigate it later.

---

## 2026-06-15 — Brand lockup proportions: smaller picto, larger title

### Changes
- **Sidebar**: picto 48→40px ([Sidebar.tsx](src/layout/Sidebar.tsx)); "Espace EHPAD" title 16→18px (`--text-body` → `--text-body-lg`, [Sidebar.module.css](src/layout/Sidebar.module.css)).
- **Auth/login lockup**: picto 56→48px ([AuthLayout.tsx](src/screens/auth/AuthLayout.tsx)); brand title 20→24px (`--text-subheading` → `--text-h3`, [auth.module.css](src/screens/auth/auth.module.css)) — kept below the `h1` page title so hierarchy holds.

### Decisions
- **One type-scale step each, picto down ~15%.** Title leans on the brand wordmark, picto recedes to a supporting mark — per "logo a bit smaller, title a bit bigger". Mirrored across sidebar + login so the brand moment stays consistent.

---

## 2026-06-15 — Logo recolored to the official site picto (black)

### Changes
- **`Logo` default colour changed from brand-red (`--lc-rouge-500`) to `--color-text-primary`** ([src/components/Logo/index.tsx](src/components/Logo/index.tsx)) so the picto renders in ink-black on the light canvas — matching the picto the live site (deuxieme-souffle.com) ships as `picto-black-deuxiemesouffle.svg`. The path data was already byte-for-byte the official picto; only the fill was off. Affects the sidebar (size 48) and the auth/login screen (size 56), neither of which overrides `color`.

### Decisions
- **Use `--color-text-primary`, not a hard-coded `#000`.** It already resolves to near-black on light and flips to near-white on dark, so the logo stays correct in dark mode for free (previously it would have stayed red). Kept the "Espace EHPAD" wordmark label beside the picto rather than swapping in the site's full horizontal lockup — user chose "official picto + keep label".

---

## 2026-06-14 — App-wide loading skeletons rebuilt to mirror real content (every screen) + responsive pass

### Changes
- **Every data-loading screen's skeleton now mirrors its real layout** so nothing shifts when data arrives, and reflows on tablet/phone exactly like its content (each skeleton reuses the screen's OWN CSS-module classes as the single source of truth). Audited all 22 screens — 4 already correct (Postpone modal, Evaluate, the peek/report modals); rebuilt 18:
  - **Dashboard** → hero next-session band + unified `statBand` (4 cells, internal filets, 4→2-col at ≤719px — no more "4 floating cards") + calendar toolbar+grid. _(DashboardScreen.tsx)_
  - **Sessions list** → day-grouped single-column stack (day header + cards), not a multi-col grid. _(SessionsScreen.tsx)_
  - **Session detail** → flat cardless header + actions row + hairline sections incl. a journal list. _(SessionDetailScreen.tsx)_
  - **Evaluations** → single-column `entryList` rows (~68px), not a 4-up grid. _(EvaluationsScreen.tsx)_
  - **Contract detail** → 4 hairline sections (Summary field-grid+progress, Coach rows, Sessions list, History) + status pill + action row. _(ContractDetailScreen.tsx)_
  - **Contract wizard / Edit contract** → progress band (step bullets) + content card + footer bar. _(ContractWizard.tsx, EditContractScreen.tsx)_
  - **Contacts** → full-width hero card + section title + secondary grid. _(ContactsScreen.tsx)_
  - **Invoices** → unified `statBand` + table toolbar + table; **Invoice detail** → CardSection with detail grid (KPI value) + button. _(InvoicesScreen.tsx, InvoiceDetailScreen.tsx)_
  - **Facility** → single-column sectioned sheet (identity banner + 7 two-pane sections), not a card wall; **Facility edit** → 4 titled form sections + actions. _(FacilityScreen.tsx, FacilityEditScreen.tsx)_
  - **Account** → two bordered CardSection cards (info + danger); **Notifications** → bordered list card with circle+2-line+pill rows; **Edit session** → card + 480px-capped `editForm` field rows. _(AccountScreen.tsx, NotificationsScreen.tsx, EditSessionScreen.tsx)_
- **Shared `DataTableSkeleton` enhanced**: optional `footer` prop (pagination + summary placeholder) and **responsive card-reflow** at ≤1099px so it stacks like the real table on tablet/phone. Contracts + Invoices use it. _(DataTable/DataTableSkeleton.tsx, DataTable.module.css, ContractsScreen.tsx)_
- **Verified**: `tsc` + eslint clean; skeletons captured at 1440/768/390 via `?debug=slow`; loaded pages show **zero horizontal overflow at 390 + 768** (responsiveness intact across desktop/tablet/phone).

### Decisions
- **Skeletons reuse each screen's own layout classes** (`statBand`, `groupedList`, `fieldGrid`, `compareGrid`, `nrWrap`, `sheet`, `pane`, `detailFlow`, `entryList`, `listCard`…) rather than generic primitives — loading and loaded share one source of truth and reflow identically. Dropped `SkeletonCards`/`SkeletonRows` wherever they forced a layout the screen never uses (esp. the "4 floating cards" the stat-band design rejects).
- Detailed per-screen notes for Dashboard / Contacts / Renew are kept in the entries below.

## 2026-06-14 — Translation made fully reactive: locale-aware formatters + seeded data from discriminants

### Changes
- **`lib/format.ts` is locale-aware**: Intl formatters resolve per call from the active locale (`fr`→`fr-FR`, `en`→`en-GB`, cached per locale) instead of being frozen to `fr-FR` at module load — fixes dates/times/relative-time/month-year/currency staying French after the FR⇄EN toggle. The `à`/`at` connector + duration units localize too. _(lib/format.ts)_
- **Seeded & API-created data renders from a discriminant + params, not a baked string**: session events, contract history and notifications store `kind`/`type` + params; new `lib/labels.ts` (`eventText`/`historyText`/`notificationContent`) composes the localized text at render. Invoice `period` stores an ISO month anchor formatted via `formatMonthYear`. New i18n: `notifications.types.*`, `history.validation`/detail keys, `contracts.detail.sessionsProgress`. _(types/models.ts, data/seed/rich.ts, data/api.ts, lib/labels.ts, i18n fr/en, SessionDetailBody/ContractDetailScreen/NotificationsScreen/TopBar/Invoice screens)_
- **Fixed a stale-memo leak**: DashboardScreen's `kpis` `useMemo` now depends on the strings object, so unit labels retranslate on toggle. _(DashboardScreen.tsx)_

### Decisions
- **Free-text fields (`availabilityNotes`) and author names (`Équipe DS`) are intentionally NOT auto-translated** — user-entered content is left as authored.

## 2026-06-14 — Layout: wider content column + sidebar/toggle polish

### Changes
- **Content column widened 1240 → 1440px** (`.contentInner`) to cut the side gutters on wide screens; applies to every page. _(AppShell.module.css)_
- **Sidebar**: more breathing room between the logo and the nav stack (`.brandRow` margin-bottom). _(Sidebar.module.css)_
- **FR/EN toggle** height reduced (option 32px / ~38px outer), still ≥ the WCAG AA target-size floor. _(LanguageSwitcher.module.css)_

---

## 2026-06-14 — Renew-contract loading skeleton mirrors the compare grid + timeline + actions (no load jump)

### Changes
- **Loading branch now reproduces the three real regions** instead of a single flat 420px block. (1) `styles.compareGrid` holding two `Card variant="static"` skeletons (so they inherit the `auto-fit minmax(380px,1fr)` 2→1-col reflow and the `:last-child` 4px accent on the proposal card): each card = a header row (`20×45%` title bar; the proposal also gets a `radius-pill` 24×120 chip stand-in) + a `styles.fieldGrid` of six `styles.skeletonField` dt/dd pairs (`12×60%` + `16×80%`); the proposal card adds a `styles.subBlock` with a label bar + a `styles.skeletonStack` of seven `14×70%` session-preview rows. (2) A full-width `Card variant="static"` timeline stand-in: a `20×30%` title + a `skeletonStack` of four rows (each a `radius-pill` 24×90 chip + `14×55%` text) and a `12×45%` note. (3) A `styles.actionRow` with three `40×150` `radius-md` button placeholders. _(RenewScreen.tsx)_
- **Added `Card` to the `@/components` import** to reuse the real flat card surface (radius-lg, subtle border, padding) for the skeletons. _(RenewScreen.tsx)_

### Decisions
- **Render the real `Card` component + the screen's own `compareGrid`/`fieldGrid`/`skeletonField`/`subBlock`/`skeletonStack`/`actionRow` classes** for the skeleton, rather than the non-existent `styles.card`, so layout + responsive reflow + the proposal accent all come from one source of truth. Inter-block spacing (`space-md`) is applied via inline token margins because the three regions live inside `SkeletonGroup` and so do not receive the parent `.contentInner` flex gap that the loaded blocks get.

## 2026-06-14 — Contacts loading skeleton mirrors hero + "other contacts" grid (no load jump)

### Changes
- **Loading branch now reproduces the real two-part structure** instead of a flat band of 3 equal cards. (1) Full-width hero stand-in: one `radius-lg` `Skeleton` at `width:100%` height 220 reserving the principal-contact bande. (2) A `styles.section` wrapper (so the `space-xl` top margin separating hero from the rest is preserved) holding a ~140×20 `radius-pill` section-title bar then a `styles.grid` of three height-180 `radius-lg` card skeletons. _(ContactsScreen.tsx)_
- **Dropped `SkeletonCards`** from the loading branch and its import — it rendered 3 uniform `auto-fit minmax(220px,1fr)` cards that reflowed at the wrong widths and had no hero/section structure, so the page jumped on load. Now reuses the screen's own `styles.section`/`styles.grid` so the skeleton inherits the exact `repeat(3)→2 (≤900px)→1 (≤560px)` reflow. _(ContactsScreen.tsx)_

### Decisions
- **Reuse `styles.section` + `styles.grid` for the skeleton** rather than primitives so layout + responsive breakpoints come from one source of truth; hero is intentionally taller (~220) than the secondary cards (~180) to mirror the real proportions. The freshness/refresh-nudge line stays out of the skeleton — it is data-derived and correctly absent until load.

## 2026-06-14 — Dashboard loading skeleton rebuilt to mirror real content (no load jump)

### Changes
- **Loading branch now mirrors the three real sections in order** instead of generic blocks. (1) Hero stand-in reuses `styles.hero` + `styles.heroBody` (48px chip + two text lines + chevron) so the next-session card's ~88px is reserved. (2) KPI band reuses `styles.statBand` + `styles.stat` for 4 cells (eyebrow / number / detail skeletons) — the unified bordered grid with internal filets and the 4→2-col reflow at ≤719px now match exactly. (3) Calendar stand-in adds a toolbar row (two pill skeletons) above a `radius-lg` 520px grid block. _(DashboardScreen.tsx)_
- **Dropped `SkeletonCards`** from the loading branch and its import — it rendered 4 separate floating `radius-lg` cards (the very "quatre cartes flottantes" anti-pattern the statBand design rejects) and reflowed via `auto-fit` rather than the real 4→2 grid. _(DashboardScreen.tsx)_

### Decisions
- **Reuse the screen's own `statBand`/`stat`/`hero` classes for skeleton divs** rather than approximating with primitives, so the skeleton inherits the exact layout + responsive reflow from one source of truth. Calendar toolbar/grid uses inline token styles (no shared class exists). Hero is always shown in loading (real one is conditional) to reserve its space and avoid the worst jump.

---

## 2026-06-14 — Invoices table: left-align all columns for equal column gaps (BILL-01)

### Changes
- **Dropped right-alignment on `sessions` and `amount`; all six columns now left-aligned.** Right-aligned content sits at the cell's right edge, which opens a large gap *before* that column and collapses the one after — so even with content-sized widths the five inter-column gaps read unevenly. With uniform left alignment, each gap equals `column width − content width`, so the content-sized widths now produce **five visually-equal gaps** (the user's goal: "columns hug content, the five gaps equal"). _(InvoicesScreen.tsx)_
- **Width nudge** `period 16→17`, `sessions 12→11` (now `18/17/11/16/20/18`) so the session column — whose content is just a 1–2 digit count — doesn't leave a wider gap than its neighbours. _(InvoicesScreen.tsx)_

### Decisions
- **Equal gaps require a single, consistent alignment — chose left (matches contracts).** Reverses the prior "amount + sessions stay right-aligned (financial convention)" decision: you can't have right-aligned numeric columns *and* equal gaps, because right-align flips where the dead space falls. Equal gaps won, per the explicit request. _If amount really wants right-alignment back for magnitude scanning, that one column's gap will differ — easy to restore on request._
- **Columns are sized "content + equal slack", not hugged tight.** True hugging would shrink the table to ~690px and leave ~450px empty on the right under the full-width KPI band; instead each column carries an equal share of the leftover so the table fills the width *and* the gaps stay equal.

---

## 2026-06-14 — Contacts: two breathing-room gaps + name kept (AUTH-21)

**Changes**
- **Principal ↔ "Autres contacts" separation widened.** Added `margin-top: --space-xl` (32px) to `.section`, so the gap from the main-contact strip to the "Autres contacts" block is now ~48px (page gap 16px + 32px) instead of a flat 16px — the hero and the grid now read as two distinct blocks, not one compacted pavé. _(contacts.module.css)_
- **Name ↔ contact-info gap widened in the stacked cards.** Added `.card > .channels { margin-top: --space-sm }` (8px → ~16px from the name to the email/phone/access stack). Scoped via the direct-child combinator so it hits only the stacked "Autres contacts" cards; the hero is untouched (its coordinates sit in a neighbouring column, nested, not as a direct child). _(contacts.module.css)_

**Decisions**
- **Hero excluded from the name↔info gap on purpose.** In the principal strip, identity and coordinates are side-by-side columns, so "right under it" doesn't apply — the `> .channels` selector naturally skips it rather than needing a modifier class.
- **Page name stays "Contacts" — settled, do not relitigate.** "Interlocuteurs" was rejected (too formal, hard to read); "Équipe" / "Référents" considered but not chosen. The earlier "looks like *contract*" concern was an English-reading artifact (*contact* vs *contract*) that doesn't affect French users, for whom "Contacts" reads cleanly as "people to reach."

---

## 2026-06-14 — Invoices: section break between the overview band and the table (BILL-01)

**Changes**
- Wrapped the loaded invoices view (overview band + overdue note + table block) in a single `.pageBody` container. The space **below the `Factures` title stays at the standard 40px** (no added margin) — the extra air now sits **between the overview band and the table**: `.tableBlock` gets `margin-top: calc(--space-lg + --space-md)` (40px), which adds to `.pageBody`'s 16px gap for a **~56px** section break. The overdue note stays tucked tight (16px) under the band as its footnote. Files: `InvoicesScreen.tsx`, `invoices.module.css`.
- Added `padding-bottom: --space-xl` (32px) to `.pageBody` for more breathing room at the bottom of the page when it scrolls (on top of `.contentInner`'s 24px).

**Decisions**
- Corrected an earlier misread: the requested gap was **forecard ↔ table**, not title ↔ forecard. Reverted the title margin to normal and moved the spacing to `.tableBlock`'s top edge so the overview (band + its overdue-note footnote) and the table read as two distinct sections.
- Scoped to the invoices page via the local `.pageBody` wrapper rather than touching the shared `PageHeader`/`.contentInner`, which would have shifted every screen. `.pageBody` keeps `flex: 1; min-height: 0` to preserve the flex-grow chain for the table's `fillHeight`.

---

## 2026-06-14 — Invoices table aligned to the contracts "system" (BILL-01)

Brought the invoices table in line with the contracts table (the user's "apply the same system here").

### Changes
- **Shared `DataTableSkeleton`.** Extracted the table-shaped loading skeleton (bordered panel + header strip + flush 52px rows, columns laid out from the real `width`/`align` config) into the `DataTable` folder as a reusable component. **Contracts migrated onto it** (its bespoke `.tableSkeleton*` CSS + inline JSX removed); **invoices now uses it too** (was a generic `SkeletonRows` block — the KPI-band `SkeletonCards` above it is kept). One skeleton system for both tables. _(DataTable/DataTableSkeleton.tsx, DataTable.module.css, components/index.ts, ContractsScreen.tsx, contracts.module.css, InvoicesScreen.tsx)_
- **Invoices table gets `fillHeight`** → the dense, fixed **52px rows + pinned header** (16px body type), matching contracts (it was taller `body-lg` rows). _(InvoicesScreen.tsx)_
- **Invoices columns: equal 16.66% → content-sized for even gaps.** `number 18 · period 16 · sessions 12 · amount 16 · status 20 · payment 18`. The uniform sixths left the tiny **sessions** count column far too wide (huge gap) and the **status** column tight for its chip; sizing each to its content makes the end-of-column→start-of-next gaps read evenly, same philosophy as the contracts rebalance. _(InvoicesScreen.tsx, invoices.module.css comment)_

### Decisions
- **Same column philosophy as contracts: size to content for even gaps, don't force equal widths.** Directly supersedes the previous "six strictly-equal columns" entry below — equal sixths looked uneven precisely because the content (a 1–2 digit session count vs a status chip) differs so much.
- **Amount + sessions stay right-aligned** (numeric/financial convention). Right-aligned numeric columns are the one spot where the gap rhythm legitimately differs from the left-aligned columns — accepted, not a defect.
- **One shared skeleton rather than per-screen copies.** Both tables already share `DataTable`; the loading state belongs to that same system, so a divergent second copy would just drift. Driven by the column config so each table's skeleton auto-matches its own widths/alignment.

### Changes
- **All six columns now equal width (1/6 each).** Replaced the content-balanced widths (14/18/12/16/21/19) with `16.66%` across the board → `table-layout: fixed` spaces every column identically, the look the user asked for. _(InvoicesScreen.tsx)_
- **Date-like columns compacted so nothing wraps in the equal cells** (the contracts table already abbreviates its dates): Période now uses a new `formatShortMonthYear` ("Sept. 2025" instead of "Septembre 2025"); the payment column switches to the existing `formatShortDateYear` ("27 avr. 2026"). New formatter `formatShortMonthYear` + `shortMonthYear` in the `Formatters` type. _(lib/format.ts, InvoicesScreen.tsx)_
- **Status-chip floor 130px → 120px** so the uniform chip fits the now-narrower equal status column at common desktop widths. _(invoices.module.css)_

### Decisions
- **Strictly equal over balanced-fill — the user's explicit choice** (offered both; they picked equal). Trade-off accepted: the Séances column (just a count) carries visible empty space, and on sub-1200px laptops the layout is tight. Compacting the dates is what keeps the equal cells wrap-free down to typical laptop widths.
- **Search & detail keep the FULL formats.** The free-text haystack still indexes `formatMonthYear`/`formatDate` (so typing "septembre" or "février" still matches even though the column shows "Sept."/"févr."), and the invoice detail screen keeps the full month — only the dense list columns abbreviate. _(InvoicesScreen.tsx)_

---

## 2026-06-14 — Contracts: loading skeletons + even column gaps + summary spacing (CON-03)

### Changes
- **Detail loading skeleton now matches the de-boxed page.** It used to draw two big rounded **card** rectangles (180 + 320px) — leftover from before the detail page was de-boxed — so on load you saw cards that then dissolved into borderless text. Reshaped to preview the real shape: hairline-separated sections (title bar + a field grid of label/value pairs + a progress line, then two more titled sections). _(ContractDetailScreen.tsx, contracts.module.css `.skeletonField`)_
- **List loading skeleton now matches the table.** Was `SkeletonRows` (floating rounded bars); now a **bordered panel (radius-lg) with a header strip + flush 52px rows** separated by hairlines, columns aligned to the real widths — so load → table no longer changes shape. _(ContractsScreen.tsx, contracts.module.css `.tableSkeleton*`)_
- **Summary field rows breathe.** `.fieldGrid` row-gap `--space-sm` → `--space-md` (8 → 16px) so the units / rate-per-session / availability-notes rows aren't cramped. _(contracts.module.css)_
- **Table column gaps evened out.** Widths re-sized from `16/26/16/18/24` to **`16/22/23/16/23`** — each column now ≈ its content + an equal slice of slack, so the *gap from the end of one column to the start of the next* is consistent (progress was cramped for its 160px bar; units was over-wide for 1–2 unit labels). Still full-width, status flush-right, uniform chips, units truncation intact. _(ContractsScreen.tsx)_
- `SkeletonGroup` prop typed `className?: string | undefined` (matches the repo's `exactOptionalPropertyTypes` convention) so it can take a CSS-module class. _(Skeleton/index.tsx)_

### Decisions
- **Column sizing targets equal *gaps*, not equal *widths*.** Per the brief: columns should differ in size because the content type differs (refs/dates short, units/progress/status wide); what should be even is the end-of-column→start-of-next gap. Equal-width (20% each) was rejected — it clipped the uniform status chip on windows < ~1300px and wasted space on the short columns. Sizing each column to content + equal slack gives even gaps while staying robust at narrow widths. _Residual: the units column's gap still varies row-to-row because a 1-unit row vs a 3-unit row genuinely differ — inherent to left-aligned variable content._

### Changes
- **Removed `min-height: 48px` from `.channel` and `.account`; rows now hug their content (`line-height: --lh-snug`); gap set to `--space-md` (16px).** The 48px row height (content vertically centred) had been adding ~24px of dead space per gap — that's why earlier gap values (6px etc.) still read as ~30px. With content-height rows the gap actually drives the spacing. After bouncing tight (4px → ~8px visible, felt cramped), it landed at a **comfortable ~20px visible** ("more breathing room" — a calm, scannable rhythm between cramped and airy). _(contacts.module.css)_

### Decisions
- **Land on a comfortable middle, not an extreme.** ~8px read cramped; ~30px read airy. With compact (content-height) rows + a 16px gap, the spacing reads calm and scannable without the old tall-row bloat.
- **Tap target not restored to 48px.** Rows are content-height (~20px), so the e-mail/phone links are smaller to click than the old 48px — the trade for predictable gap-driven spacing. Reversible via `min-height` if click size matters more than the rhythm.

---

## 2026-06-14 — Contact us: blank section at the bottom of the page

### Changes
- **Added a generous blank band under the form** so the page no longer ends flush with the "Envoyer" button. `.panel` gains `padding-bottom: calc(var(--space-3xl) * 1.5)` (96px); since the panel is the page's last element, this reads as a white section beneath the content. _(ContactScreen.module.css)_

### Decisions
- **Scoped to the contact page, not the global `.contentInner`.** A global bottom-padding bump would also push down full-height layouts (the dashboard calendar fills the viewport via `flex:1`/`min-height:100%`), so the spacer lives on the contact panel where the breathing room was asked for. Trivial to promote app-wide if every page should get it.

---

## 2026-06-14 — Contacts page: narrower content, 3 other-contact cards per row (AUTH-21)

### Changes
- **Content width capped + centred.** New `.page` wrapper (`max-width: 1100px; margin-inline: auto`, flex-column `gap: --space-md`) around all non-modal content — bigger side gutters (~145px each side at 1440), and the whole layout reads a touch narrower. The main contact stays a full-width-of-container strip at the top. _(ContactsScreen.tsx, contacts.module.css)_
- **Other-contacts grid: 4 → 3 per row.** `.grid` changed from `repeat(auto-fill, minmax(320px, 1fr))` (which fanned to 4 on a wide page) to a fixed `repeat(3, minmax(0, 1fr))`, stepping down to 2 under 900px and 1 under 560px. Cards land ~355px wide (slightly larger than the old 4-up ~340px). _(contacts.module.css)_

### Decisions
- **Demote width via a page `max-width`, not per-element.** Wrapping everything (header, freshness, hero, grid) keeps them aligned to the same gutters; the wrapper re-creates the shell's flex-column gap so vertical rhythm is unchanged.
- **Interpreted "shorten the card" as narrower (width), not shorter (height).** The user wants the main contact to stay "a very long strip," so height is untouched; the 1100px cap is what makes it (and the page) read narrower with more side padding. Bump the cap if "a little bit" should be less aggressive.

---

## 2026-06-14 — Contact us: coordinates icon aligned to the label line

### Changes
- **The Mail/Phone icon now aligns with its title** ("Email"/"Téléphone") instead of floating at the vertical centre of the label+value block. `.method` switched from `align-items: center` to `flex-start`, and `.badge` got a fixed height equal to the label's line box (`calc(var(--text-body) * var(--lh-body))` = 24px) with the 18px glyph centred inside it. `.methodLabel` now states `line-height: var(--lh-body)` so the badge height matches the label exactly. _(ContactScreen.module.css)_

---

## 2026-06-14 — Invoices search pill dropped onto the table toolbar (BILL-01)

### Changes
- **Search moved down to hug the table's top-right corner.** It used to float in its own row well above the table (a 16px gap + the HT-note line sat between it and the table). Now the HT-note (left) and the search pill (right) share **one toolbar row (`.tableTop`) inside `.tableBlock`, directly above the table** (`gap` tightened to `--space-sm`), so the pill lands at the table's top-right corner. _(InvoicesScreen.tsx, invoices.module.css)_
- The toolbar is **always rendered** (above the table/empty-state branch), so the search stays visible and clearable even when a query returns no results. Removed the old standalone `.tableToolbar`. _(InvoicesScreen.tsx, invoices.module.css)_

### Decisions
- **Pair the search with the HT-note rather than give it its own band.** The HT-note already hugged the table; folding the search onto that same row removes the floating-too-high feel in one move and reads as a proper table toolbar (caption left, control right) — no extra vertical band.

---

## 2026-06-14 — Textarea resize grip sits in the corner (app-wide)

### Changes
- **The native resize handle now nestles in the textarea's bottom-right corner** instead of floating ~16px in from the right edge. For textarea fields the shared `.control` drops its horizontal padding (`.control:has(textarea) { padding: 0 }`) and the `textarea.input` takes full `var(--space-md)` padding on all four sides + matching `--radius-md` corners, so the field spans the bordered box edge-to-edge and the browser draws the grip at the true corner. _(components/forms.module.css)_

### Decisions
- **Scoped via `:has(textarea)`, not a new class.** The same `:has()` is already used for focus styling in this file, so single-line inputs/selects keep their `0 var(--space-md)` padding untouched; only multiline fields span full-width — exactly where the grip offset showed.

---

## 2026-06-14 — Contact form: back to strict two-per-row (fixed civility 3-col slip) (AUTH-21)

### Changes
- **Dropped the 3-column name row.** The prior "demote civility" change had put Civilité · Prénom · Nom on one line — three fields, violating the two-max-per-row rule and risking horizontal overflow in the modal. Removed `.nameRow`; the form is now strictly ≤2 per row:
  - `[Prénom | Nom]` · `[Email | Téléphone]` · `[Civilité | Type de contact]` · Coordinateur (checkbox) · Rôles (searchable).
  - Civility stays demoted — it's now paired with **Type de contact** (two small selects) on a lower row, never in the lead. _(ContactsScreen.tsx, contacts.module.css)_

### Decisions
- **Demote civility by *position*, not by a third narrow column.** The earlier narrow-inline approach broke the column rule; pairing civility with the type select keeps it subordinate (lower, paired) while honouring two-per-row and guaranteeing no horizontal scroll (`.formGrid` uses `minmax(0, 1fr)`, so columns shrink instead of overflowing).

---

## 2026-06-14 — Contact us: more breathable spacing

### Changes
- **Bigger gap between the coordinates band and the form.** `.panel` gap `lg` → `2xl` (24 → 48px), so the email/phone section sits in an open band well clear of the form below it ("wide section right under the info"). _(ContactScreen.module.css)_
- **More air between form fields.** `.form` gap `lg` → `xl` (24 → 32px). _(ContactScreen.module.css)_

### Decisions
- **The generous separation lives between info and form, not between every field.** Fields stepped up one notch (xl); the info↔form break got the larger `2xl` so the page reads as two distinct zones with room to breathe, rather than uniform airiness that loosens the form's grouping.

---

## 2026-06-14 — Ghost button: underline on hover/focus only (app-wide)

### Changes
- **`ghost` buttons (e.g. modal "Annuler") lose their resting underline.** At rest they're now plain blue text; the underline appears on `:hover` **and** `:focus-visible` (keyboard), alongside the darker blue. App-wide — every "Annuler"/ghost text action. _(Button.module.css)_

### Decisions
- **Reverses the earlier "underline at rest" a11y choice — deliberately.** That choice underlined ghost links at rest so the affordance didn't depend on hover. We now lean on the surface's **"blue = interactive"** convention to carry the rest-state affordance (same call already made for the contacts freshness link and the e-mail/phone values), and crucially keep the underline on **`:focus-visible`** so keyboard users (who can't hover) still get it. Consistent text-link behaviour across the app.

---

## 2026-06-14 — Field borders softened (250, not 300) app-wide

### Changes
- **Input field border dimmed from `--lc-neutral-300` (#BBBBBB) to a new `--lc-neutral-250` (#D4D4D4).** The resting `#BBBBBB` field outline read as too sharp/hard; the new step is softer but still more present than the `#E5E5E5` card border, so fields keep their "you write here" affordance. _(theme/tokens.css)_
- **New semantic token `--color-border-field`** points at neutral-250; `.control` now uses it at rest **and** under focus (so the border no longer darkens to `strong` when focused, under the accent ring). Covers every field via the shared control: `TextField`, `Textarea`, `Select`, `MultiSelect`. _(theme/tokens.css, components/forms.module.css)_

### Decisions
- **Scoped to the field token, not `--color-border-strong` globally.** `border-strong` is also used by the Calendar, Toggle, Rating, Button outline, and DataTable — dimming the token itself would soften all of those too. A dedicated `--color-border-field` changes only input borders, which is what "every field" meant.
- **New 250 step rather than reusing `subtle` (200).** Jumping straight to the card-border value would erase the intentional contrast between writable fields and static cards; 250 is the in-between that softens without flattening that distinction.

---

## 2026-06-14 — Contact form: civility demoted, searchable roles (AUTH-21)

### Changes
- **Civility demoted from a full-width top line to a narrow field on the name row.** New `.nameRow` grid (`7.5rem 1fr 1fr`) puts **Civilité (narrow) · Prénom · Nom** together; e-mail/phone stay in the 2-col `.formGrid` below. The name now leads the form; civility reads as the secondary courtesy field it is. Collapses to one column under 480px. _(ContactsScreen.tsx, contacts.module.css)_
- **Roles field is now searchable.** `MultiSelect` gains an opt-in **`searchable`** prop: a sticky search input at the top of the popover filters options by label (case-insensitive), with a "Aucun résultat" empty state and auto-focus on open. Used on the contact roles field; the other two `MultiSelect` callers (facility units, account) are untouched. New `common.noResults` i18n (fr/en); placeholder reuses `common.search`. _(Select/index.tsx, Select.module.css, ContactsScreen.tsx, i18n fr/en)_

### Decisions
- **Civility kept (not removed) but subordinated.** It's still needed for correct address ("M./Mme … Nom" on the card), so the fix is hierarchy, not deletion — narrow + grouped with the name it modifies. Label wording left as "Civilité"/"Title" (the user floated changing it — open to a different term).
- **`searchable` is opt-in.** Search on a 9-item list isn't strictly needed, but the user wants the interaction; gating it behind a prop keeps the other MultiSelect usages visually unchanged and avoids imposing a search box on short lists elsewhere.

---

## 2026-06-14 — Contact us: single centred column, email+phone on one row, submit right-aligned

### Changes
- **Two-column grid → one centred panel.** The left coordinates rail + right form layout is replaced by a single `.panel` (`max-width: 600px; margin: 0 auto`), so the page now sits compact and centred with whitespace gutters on both sides. _(ContactScreen.tsx, ContactScreen.module.css)_
- **Email + phone now share one line.** `.methods` switched from a vertical column to a horizontal `flex-wrap` row (`gap: var(--space-2xl)`), with a `1px` `--color-border-subtle` divider below it separating the coordinates from the form. _(ContactScreen.module.css)_
- **Request type sits directly under the coordinates,** as the first form field (order unchanged within the form; it just follows the email/phone row now that the columns are merged). _(ContactScreen.tsx)_
- **"Envoyer le message" moved to the right.** `.submit` is now `display: flex; justify-content: flex-end`. _(ContactScreen.module.css)_
- Removed the now-unused `.grid`, `.info`, and `.formCol` rules. _(ContactScreen.module.css)_

### Decisions
- **Centred narrow panel reads as "more padding on both sides."** Rather than literal side `padding` (which would just shrink the inputs), a `600px` max-width with auto margins produces the compact, centred form the request described while keeping fields a comfortable width.
- **Kept the existing field components and prefill logic untouched** — purely a layout restructure, so all the SESS-12/BILL-01/CON-16 deep-link prefills still apply.

---

## 2026-06-14 — Establishment contacts: name+role only, click → compact detail modal (AUTH-10)

### Changes
- **Inline contact rows slimmed to name + fonction.** Email/phone are no longer shown inline; each contact is now `[sm avatar] {Civility Nom}` + a muted role line (`Directrice · Contact principal`). _(FacilityScreen.tsx, facility.module.css)_
- **Each contact is a button → opens a compact `Modal`** (default 520px, focus-trapped, Esc/scrim close) titled with the person's name, listing **Type · Rôle · (Coordinateur de séance) · E-mail · Téléphone**, with email/phone as `mailto:`/`tel:` links. New `activeContact` state. _(FacilityScreen.tsx)_
- **New i18n `facility.contactModal` group** (type/additional/role/coordinator/email/phone, fr+en). _(i18n fr/en)_

### Decisions
- **Contacts are clickable now → they're blue again (colour = clickable).** Two turns ago they were neutralised to signal "not a link"; now that clicking opens a detail modal, the name returns to accent + hover-underline + focus ring, consistent with the contract rows. The affordance matches the behaviour both ways.
- **Detail in a modal, not inline.** Keeps the section scannable (just who's who) while still exposing "all the information" on demand — and the modal reuses the same `Field` label/value rows as the page, so it reads as part of the same system. The dedicated /contacts page remains the place to *edit*.
- **Per-contact modal, not a link to /contacts.** There's no per-contact route, and the ask was an at-a-glance detail peek, not a navigation; the modal answers "who is this person" without leaving the profile.

---

## 2026-06-14 — Invoices table brought up to the contracts table standard (BILL-01)

### Changes
- **Balanced, fixed columns (fixes the "cramped here, spacious there" feel).** Every invoice column now has a `%` width (number 14 / period 18 / sessions 12 / amount 16 / status 21 / payment 19), which flips `DataTable` into `table-layout: fixed` — columns align to the pixel row-to-row instead of the browser's content-driven auto sizing. _(InvoicesScreen.tsx)_
- **Uniform status chips.** The status cell is wrapped in `.statusCell` with `min-width: 130px; justify-content: flex-start` (same idea as contracts) so "En attente / En retard / Payée à DS" all share one footprint and left-align. **130px, not contracts' 150px** — the invoices status column is 21% (vs 24%) with short labels, so 150px bled the pill past the cell in the ~1100–1163px desktop band (caught by the review). _(InvoicesScreen.tsx, invoices.module.css)_
- **Pagination with page indicator + prev/next.** `DataTable` now gets `pageSize={6}` and `summary={count}` → the shared footer shows **"‹ Page X sur Y ›"** centered + **"N factures"** right (same grammar as contracts; arrows `aria-disabled` at the ends, `aria-live` page status). _(InvoicesScreen.tsx)_
- **Header/wrap polish.** New short column header `invoices.table.sessionsShort` ("Séances"/"Sessions") so "Nombre de séances" no longer wraps to two lines (the long label stays for the detail screen); `.numberLink` is `white-space: nowrap` so "F-2026-052" never breaks at the hyphen. _(InvoicesScreen.tsx, invoices.module.css, i18n fr/en)_
- **Seed: 6 more historical *paid* invoices** (months -7…-12, all `payee`) → 12 total, so pagination is actually demonstrable (2 pages of 6). _(data/seed/rich.ts)_

### Decisions
- **Reused the contracts table, didn't reinvent it.** The list already used the shared `DataTable`; this just opts into the same capabilities contracts uses (`width`, `pageSize`, `summary`, `.statusCell`). No component changes — purely per-call props + screen CSS — so contracts is untouched.
- **Seed additions are all `payee` on purpose.** Pagination needed more rows, but the KPI band (unpaid total, awaiting, next due) and the overdue signal must stay exactly as tuned — paid history only feeds the table and the avg-delay sample, leaving every other KPI byte-identical (verified: still 1 105,00 € / 1 / 30 j / 26 juin).
- **`pageSize = 6`** matches the contracts page size; `defaultSort="-period"` keeps newest first, so page 1 is the current/actionable invoices and the paid archive falls to page 2.
- **Card reflow already covered** — `DataTable` stacks to label/value cards below 1099px globally, so the new fixed widths only apply on desktop; mobile is unaffected.

---

## 2026-06-14 — « Mon établissement »: all contacts shown, contracts back to identifiable clickable rows (AUTH-10)

### Changes
- **Contacts: prominent-main + "+N autres" teaser → all contacts at equal hierarchy.** The count line *looked* clickable (users hovered the "+2 autres" expecting to open them) but wasn't. Now every contact renders the same way (sm avatar · name · role · email/phone) via a new `ContactItem`; the principal carries a subtle "· Contact principal" marker. Neutral ink — they read as info, not links (there's no per-contact detail page; editing is the "Gérer les contacts" link). Removed the `moreContacts` i18n. _(FacilityScreen.tsx, facility.module.css, i18n fr/en)_
- **Contracts: status-count summary → identifiable, clickable rows.** `Actif (2) · …` told you *how many* but not *which one* or *how to open it*. Now each row is **reference (accent blue) · status · `jusqu’au {end}`**, linking to `/contrats/:id`; sorted by status relevance (active / à-renouveler first), capped at 5, with the existing "Voir tous les contrats" link for the rest. New `contractUntil` i18n; new `.contractList/.contractRow/.contractRef/.contractMeta`; removed `.summary`. _(FacilityScreen.tsx, facility.module.css, i18n fr/en)_

### Decisions
- **Honest affordance via the house "colour = clickable" rule.** Contacts stay neutral (no link target → must not look like one); contract references are blue + hover-underline + focus ring (real links → must look like one). This is the direct fix for "I hovered expecting to click and couldn't."
- **The count summary was over-minimized — reversed.** "1 active contract" answers *how many*, not the user's actual questions (*whose? how do I see it?*). Identifiable + clickable rows answer both. Kept the demotion *principle* (profile = read summary + deep-link, not the full CON-03 table): only reference + status + end date, capped at 5, sorted to surface live contracts — not a re-host of the contracts page.
- **All three contacts now shown (not just the main).** This is *more* AUTH-10-faithful, not less — the story lists "main contact (role/email/phone)" **and** "additional contacts"; showing them all satisfies both bullets and removes the dead teaser.

---

## 2026-06-14 — Contact us page: de-boxed, grayscale icons, expanded form (support)

### Changes
- **Dropped the box.** Removed the bordered `.panel` card — the DS coordinates + form now sit flat on the page, two columns separated by a single vertical **hairline** (`.formCol` border-left) on ≥860px, stacking under that. _(ContactScreen.module.css, ContactScreen.tsx)_
- **Channel icons → plain grayscale.** `.badge` loses its blue-soft background pill and blue icon colour — now a bare `--color-text-secondary` glyph (24px). DS email/phone link values also de-blued to `--color-text-primary` with hover-underline, matching the Contacts page. _(ContactScreen.module.css)_
- **Expanded the form.** Added (a) a read-only **"Vous écrivez en tant que {name} ({email})"** identity line, (b) a **"Type de demande"** Select (Facturation / Planning des séances / Contrat / Compte & accès / Autre — optional, placeholder), (c) a **"Préférence de réponse"** Select (e-mail / téléphone). Funnel prefills now also set the request type; `?sujet=rappel` (CON-16 callback) presets reply = téléphone. _(ContactScreen.tsx, i18n fr/en)_
- **API refactor:** `sendSupportMessage(subject, message, by)` → single `SupportMessage` payload (`+ requestType?, replyPreference?`). Only caller updated. _(api.ts)_
- **Removed the dead `invitation` prefill** (screen branch + `support.prefills.invitation` in fr/en) — its sole caller, ActivateScreen, uses `mailto:` pre-auth. _(ContactScreen.tsx, i18n fr/en)_

### Decisions
- **No dedicated WBS story for this page** — it's a required nav item (E05/video) and the shared funnel target for BILL-01 / SESS-12 / CON-16. So content is a design call; the additions (request type for triage, reply preference, identity) make it a more useful support channel without exceeding scope (no FAQ/attachments).
- **Email/phone neutral, not blue** — consistent with the Contacts page direction ("blue as fill/accent fights the palette"); hover-underline carries the affordance. Knowingly diverges from the old "blue = clickable" note on this page.
- **Request type is optional** (placeholder, no validation) to keep submission friction low; sent as `undefined` when untouched.

---

## 2026-06-14 — Contact rows: fixed the *gap* control, landed at 6px (AUTH-21)

### Changes
- **`.channels` gap is now the real spacing dial — set to `6px`.** Earlier a "48" request had been applied to the row `min-height` (tap target), not the inter-row *gap*, so spacing between e-mail / phone / access pill barely moved. Corrected to drive the actual `gap`; after 48px → 10px it settled at **`6px`** at the user's request. _(contacts.module.css)_

### Decisions
- **`6px` is a literal, off-scale value.** The spacing token scale jumps 4 (`--space-xs`) → 8 (`--space-sm`); 6px was requested explicitly, so it's a raw value with a comment flagging it as intentional rather than a token.
- **Row `min-height: 48px` kept** (the tap target) — independent of the gap, so the *visible* spacing between rows is still ~24px (row padding) + 6px ≈ **~30px**.

---

## 2026-06-14 — Contact add/edit moved into a centered modal (AUTH-21)

### Changes
- **Edit & add now open a centered `Modal`** (the same component as the delete dialog — focus-trapped, Escape/scrim to close, scroll-locked) instead of swapping a card for an inline form. Opens on `draft !== null`; `wide` (720px) so the 2-column form breathes. Title switches on a new `editingNew` flag (temp `c-nouveau-…` id) → "Ajouter un contact" vs new `editTitle` "Modifier le contact". _(ContactsScreen.tsx, i18n fr/en)_
- **Form actions relocated to the modal footer.** `editForm` no longer renders its own Annuler/Enregistrer row; the buttons live in the `Modal` `footer` (Annuler ghost, Enregistrer primary w/ `loading=busy`). Removed `.formActions` CSS. _(ContactsScreen.tsx, contacts.module.css)_
- **Save errors now surface inside the modal.** Added the `failed` `InlineAlert` to the modal body and guarded the page-level one with `draft === null`, so a failed save isn't hidden behind the dialog (and its `autoFocus` can't fight the modal focus trap). _(ContactsScreen.tsx)_
- Removed the inline-form branches from `contactCard` and the others-grid (`addingNew` dead, dropped). _(ContactsScreen.tsx)_

### Decisions
- **Add uses the modal too, not just edit.** They share one `draft`/`editForm`; routing only edit through the modal would leave add inline and inconsistent. One surface for both.
- **Edit modal is not `destructive`** (Escape/scrim close, discarding the draft) — a contact form is low-stakes; no discard-confirm for now. The delete modal stays `destructive` (explicit choice required).
- **Delete left as-is for now**, per the user ("delete is good for now").

---

## 2026-06-14 — Invoices overdue alert demoted to a two-tier signal (BILL-01)

### Changes
- **Overdue stopped hijacking the page.** The loud amber `InlineAlert` banner was pinned above everything, so a user who came to read their **total unpaid** got "hit" by a one-invoice overdue alert first. Now the **stat band is the first content** under the header (the total answers the visit immediately), and overdue is a **two-tier signal** modelled on the contacts freshness pattern. _(InvoicesScreen.tsx, invoices.module.css, i18n fr/en)_
  - **Mild (default):** a quiet `.overdueNote` meta line *below* the band — 18px amber `TriangleAlert` (`--lc-or-700`, the same AA-safe tint the warning alert icon uses) + muted-grey "dont 1 facture en retard · **520,00 € HT**" (the overdue figure in full ink) + a blue underlined `Contacter l'équipe DS` link. `role="status"`. Reuses the contacts `.freshnessAction` recipe.
  - **Severe (escalation):** the original loud banner returns *above* the band, with the same `TriangleAlert` icon + "en retard" phrasing so it reads as the same concept, louder.
- **Severity model** — 3 tunable consts: `OVERDUE_SEVERE_DAYS=30` (a full net-30 cycle past due), `OVERDUE_SEVERE_AMOUNT_HT=1000`, `OVERDUE_SEVERE_COUNT=3`; severe if any trips. Computed once in the existing `computed` memo (`overdueAmount`, `oldestDaysPastDue`, `severity`). Seed (1 invoice, ~15 days, 520 €) → **mild**, so the demo shows the demoted state. _(InvoicesScreen.tsx)_
- New i18n `invoices.overdueMild(n)` + `invoices.vatShort` (fr/en); severe reuses `overdueBanner`/`overdueTitle`/`contactDs`. The `·`+amount unit is `white-space: nowrap` so the separator never strands at a line end when the note wraps on mobile.

### Decisions
- **Match visual weight to urgency, "floor vs ceiling" (same call as the search broadening).** WBS BILL-01 says "display an overdue **banner** when ≥1 overdue" — we keep that as the floor: both tiers surface the WBS triplet (count + total **overdue** amount + contact-DS path); only the *loudness* changes with severity, and the literal banner still appears once it's genuinely serious. Reversible via the three consts.
- **Overdue lives below the band, not inside the unpaid-total cell.** A design panel weighed co-locating "dont 520 € en retard" under the "Montant total impayé" cell, but the figures differ (overdue 520 HT vs unpaid-total 1 105 HT incl. *en attente*) — stacking them invites a money-misread, and editing a `.stat` cell would break the band's equal-height parity with the home dashboard. The subset relationship is carried by the word **"dont"** ("including") instead of by layout.
- **Both tiers independent of the table filter** — rendered from `computed.overdue` (account-level), never gated on `rows`, so searching the table never hides an overdue signal.
- Validated by an adversarial review panel (4 dimensions → per-finding verification): 1 confirmed nit (the separator-orphan, fixed); 3 refuted (role="status" double-announce — can't fire, content is static; band 32px vs dashboard 40px — the intentional content-driven sizing).
- **Fast-follow noted:** the quiet line now duplicates the contacts `.freshness` recipe across two screens. If a third use appears, extract a shared `MetaNotice { icon, tone, action }` (the way `SearchInput` was promoted) so they can't drift.

---

## 2026-06-14 — « Mon établissement »: full-width, no descriptions, contacts/contracts demoted, separator rule, calmed hero numbers (AUTH-10)

### Changes
- **Full-width like every other page.** Dropped `.sheet`'s own `max-width: 920px` (it pinned content left with a dead right gutter); the page now fills the shell's `.contentInner` (1440px / `--space-lg`) like dashboard, sessions, contracts, invoices. _(facility.module.css)_
- **Removed the per-section description lines.** The left rail now shows just the section title (+ action link). Dropped the `desc` prop from `Pane`, the `.railDesc` style, and 7 unused i18n keys. _(FacilityScreen.tsx, facility.module.css, i18n fr/en)_
- **Contacts demoted** — main contact kept (it's establishment identity); the additional-contact avatar chips collapsed to a count line (`+N autres contacts`, new `moreContacts` i18n) with the existing "Gérer les contacts" link. _(FacilityScreen.tsx, i18n fr/en)_
- **Contracts demoted** — the 5-row re-list replaced by a one-line **status summary** (`Actif (2) · À renouveler (1)…`) + the existing "Voir les contrats" link. Removed the now-unused `.lines/.lineLink/.lineMain/.lineMeta` styles and `capitalize`/`formatDate` imports. _(FacilityScreen.tsx, facility.module.css)_
- **Separator discipline:** line-dividers are now reserved for **big-section boundaries** (`.pane` border) only; **inside** a section, items are separated by whitespace. Standard sessions switched from per-row hairlines to a `gap`-separated stack (matching the addresses blocks). _(facility.module.css)_
- **Pricing & stats numbers calmed.** The two hero figures (pricing `h3/700`, stats `h2/700`) were involuntary focal points on a page people scan for small details — both now render with the standard label/value treatment (`Field`); `.fieldVal` gained `tabular-nums` so numerals stay neat. Removed `.rateNum/.figures/.figureNum/.figureLabel`. _(FacilityScreen.tsx, facility.module.css)_

### Decisions
- **Demote, don't delete (contacts + contracts).** AUTH-10 explicitly lists contact info *and* contract-list info as profile content, and DS audits UI-vs-WBS — so removal is a flaggable deviation, but a *summary* still "displays" them and stays compliant. The dedicated pages (AUTH-21, CON-03) remain the manage surfaces; the profile keeps only a glanceable read + deep-link. Same rule will apply to stats (→ dashboard) when we get a nod to trim those.
- **One separator language.** Using the same hairline for section boundaries *and* for rows inside a list reads as visual noise — the divider stops meaning "section." Line = section frontier; whitespace = within. Addresses already did this; sessions now match.
- **Contract summary by status, not by row.** Status is the most useful glance and avoids re-hosting the contracts table; formatted `Label (n)` to sidestep FR/EN pluralisation of status words.
- **No focal magnets on a reference page.** A lone bold 32px number pulls the eye off the small text users actually came for (billing address, SIRET). After this change the only deliberate emphasis is the identity band (name + monogram); all data reads at one even weight, with tabular figures keeping numbers legible without adding weight.

---

## 2026-06-14 — Contact form: 2-column max, civility dropdown; 48px contact rows (AUTH-21)

### Changes
- **Add/edit form capped at two columns.** `.formGrid` was `repeat(auto-fit, minmax(200px, 1fr))` — which fanned prénom/nom/e-mail/téléphone into **four columns** on a wide modal. Now `repeat(2, minmax(0, 1fr))` → fixed 2-up pairs (prénom|nom, e-mail|téléphone), collapsing to 1 column under 480px. Mirrors the supplied reference layout. _(contacts.module.css)_
- **Civility: segmented control → dropdown.** Swapped `SegmentedControl` for the native-styled `Select` (same options M/Mme/Mlle), consistent with the existing "Type de contact" select; removed the now-unused `SegmentedControl` import. _(ContactsScreen.tsx)_
- **Contact rows back to a tap target, at 48px.** Re-added `min-height` to the e-mail / phone / access rows — `48px` (one notch above the 44px floor removed last change) — applied to **all three** rows so the column stays uniform and the gaps stay equal. _(contacts.module.css)_

### Decisions
- **Civility stays full-width (like "Type de contact"), not forced into the grid.** Four name/contact fields make a clean 2×2; dropping a 5th (civility) into the grid would orphan "Téléphone" in a half-empty row. Pairing civility↔type is a possible follow-up if a fully-paired form is wanted.
- **48px applied to the meta access row too, not just the links.** Equal row heights = equal *visual* gaps (the thing the user asked to harmonise); giving only the links a min-height would re-create the uneven rhythm we'd just fixed.
- **Interpreted "44 → 48" as the card contact rows**, not the form fields (44px was the channel touch-target discussed last change). If the intent was taller *form inputs*, that's a shared-component change (TextField/Select) — say so and I'll do it.

---

## 2026-06-14 — Contact cards: bordered edit button, neutral channels, uniform rhythm (AUTH-21)

### Changes
- **Edit button back to bordered (`secondary`).** Reverted the card "Modifier" from `ghost` (text) to `secondary` so it shares the **bordered-pill layout** of the "Supprimer" (`danger`) button — neutral grey border/text next to the red destructive one. _(ContactsScreen.tsx)_
- **E-mail & phone are no longer blue.** `.channel` text → `--color-text-primary`, leading icon → `--color-text-secondary`; the underline-on-hover (kept) now carries the link affordance instead of an accent colour. One less blue competing on the card. _(contacts.module.css)_
- **Uniform vertical rhythm for the contact block.** E-mail, phone and the access pill now sit in **one flex column with a single `gap` (`--space-sm`)** — equal spacing between all three (was: 44px channel rows butted together + a 4px `margin-top` on the pill = visibly uneven). The access pill's leading icon is bumped 16→18px to align the icon column. _(ContactsScreen.tsx markup regrouped, contacts.module.css)_

### Decisions
- **Dropped the 44px `min-height` on channel rows.** It was the cause of the uneven gaps (tall rows vs a short meta line). Natural row heights + one gap give the harmonised rhythm the user asked for; on a desktop-first manager app the slightly smaller click area for these secondary info-links is an acceptable trade. Re-add equal `padding-block` to all three rows if bigger targets are wanted.
- **Edit stays neutral, delete stays red.** Matching the *layout* (both bordered) while keeping colour to mean something — neutral edit, red destructive — avoids the blue-next-to-red clash flagged earlier.

---

## 2026-06-14 — Contacts freshness: corrections auto-verify + lighter confirm link (AUTH-21)

### Changes
- **Any contact change now resets the freshness clock.** New private `markContactsReviewed(db)` (sets `contactsLastConfirmedAt = now`, marks `contacts` notifications read) is called from `upsertContact`, `deleteContact`, **and** `confirmContactsFresh`. Previously only the explicit "Tout est à jour ✓" click reset it — so fixing a phone number left the "are your contacts up to date?" nudge still showing. Now editing/adding/removing a contact *is* the verification. _(api.ts)_
- **Freshness confirm link: underline on hover/focus only.** `.freshnessAction` drops its rest-state underline (the blue colour already signals "interactive" per the surface convention); the underline now appears on `:hover`/`:focus-visible` alongside the darker blue. _(contacts.module.css)_

### Decisions
- **There is no single "update" action — and there shouldn't be.** "Not up to date" is three different corrections (edit one field / add a person / remove a person), each already supported inline on the page (per-card Modifier/Supprimer, header Ajouter). The fix wasn't a new monolithic button or a "what changed?" wizard; it was **closing the loop** so a correction satisfies the nudge instead of dead-ending it. Model: **Verify = 1 click; Correct = the granular inline action, which auto-verifies.**
- **Single-field edits stay on the inline form** — Modifier opens the form in place, change just the phone, Save. No separate "quick edit" surface needed for a 3–6 person list.
- **Open follow-up:** stale-line copy still only voices the "yes" path; a quiet "…sinon, modifiez la fiche ci-dessous" half-line would name the correction path without adding a control (not yet done).

---

## 2026-06-14 — Ghost button hover: underline emphasis, not a blue fill (app-wide)

### Changes
- **`ghost` hover no longer paints a light-blue background.** Replaced `background: var(--color-info-soft)` with an **underline emphasis** (`text-decoration-thickness` 1px→2px) + a darker text colour (`--lc-bleu-700`). The link affordance is unchanged at rest (underline kept — documented a11y choice for low-mouse-confidence users); only the hover stops boxing blue. **App-wide** (~25 ghost buttons, incl. every "Annuler"). _(Button.module.css)_
- **Contacts "Modifier" edit button → `ghost`.** The card edit action was the default `secondary` variant (bordered white box); it now uses the same quiet text style as the cancel button. _(ContactsScreen.tsx)_

### Decisions
- **Blue as a *fill* fights the rest of the palette; blue as *text + underline* doesn't.** A secondary/tertiary action shouldn't carry a filled background (least of all the accent colour) — it competes with the primary CTA and clashes next to status colours. Hover now reads as a strengthening link, which is the correct weight for a non-primary action.
- **Kept underline-at-rest on `ghost`.** The request mentioned "underline on hover"; ghost already underlines at rest by design (affordance must not depend on hovering — elderly audience). Hover now *thickens* that underline, so the hover feedback is real without re-introducing a fill. A true underline-only-on-hover would need a separate variant — deferred unless wanted.
- **Edit button kept blue (ghost), not neutralised.** It matches the cited cancel-button style; if blue "Modifier" sitting next to the red "Supprimer" reads as a clash, neutralising the edit text is a one-line follow-up.

---

## 2026-06-14 — « Mon établissement » rebuilt as a two-pane account profile (AUTH-10)

### Changes
- **Flat field-ladder → identity band + two-pane "settings" sections.** The page no longer renders every block with the same label→value row (the "AI-generated" uniformity). Top: an **identity band** — monogram + trade name + registered name, with status dot, group, and the DS-managed note on the right. Below: each section is a **two-pane row** (title + one-line description in a left rail, content on the right), separated by hairlines — no boxes. _(FacilityScreen.tsx, facility.module.css)_
- **Content shaped to its data type, not one primitive.** Identity = legal fields in a fluid grid; Addresses = side-by-side blocks; Contacts = a people roster (Avatar + name/role/contact, additional contacts as avatar chips); Pricing = a lead figure; Standard sessions = a timetable; Statistics = a figures strip; Contracts = link-rows. _(FacilityScreen.tsx)_
- **Surgical "contact DS" link** woven into the read-only Group note (the one truly DS-owned field, EST-09) — `groupHelp` + an inline link to `/contact`. _(FacilityScreen.tsx)_
- **New i18n** — section descriptions + `legalTitle` + `contactDsLink` (fr + en). _(i18n/fr.ts, i18n/en.ts)_
- Edit-screen classes (`.section*`, `.formGrid`, `.standardRow`, `.fieldLabel`, …) preserved verbatim; `FacilityEditScreen` untouched.

### Decisions
- **Page stays a distinct destination, titled "Mon établissement" (not "Mes informations").** Per WBS, the nav item is specified by E05 + the client video as its own entry, and DS audits UI-vs-WBS — so we keep it separate. "Mes informations" was rejected: it collides with the existing **"Mon compte"** (personal account); "établissement" names the org profile unambiguously and matches the app's first-person voice. No string change needed (already correct).
- **Don't merge with "Contact us."** The two point in opposite directions — Establishment = the EHPAD's own info (inbound), Contact us = reaching DS support (outbound). The WBS keeps them as separate nav items and the facility profile contains zero DS contact data. The contact relationship is instead woven in *surgically* at the DS-locked fields.
- **Whose data is it?** Per AUTH-10/AUTH-11 the page is **the EHPAD's own** information, owned/edited by the manager (the user). DS only *controls* three slivers: Group (read-only, EST-09), status, and contract-approval state. The WBS even labels the nav item "Your information."
- **Two-pane chosen for the data type.** Internal layout is fully ours (WBS fixes fields, not arrangement). An account/org profile is best served by the proven settings pattern (Stripe/Linear) — the left-rail descriptions give grouping and a reason to read, killing the flat-ladder look — and it stays box-free, consistent with the earlier "remove the boxed design" call.
- **Stats kept, flagged not cut.** Operational statistics duplicate the dashboard KPI band, but the duplication is *in the WBS* (AUTH-10 lists them too), so they stay here as a compact figures strip pending a client nod to drop them — not removed silently.

---

## 2026-06-14 — Invoices search: subtle shared pill + broadened to all columns (BILL-01)

### Changes
- **Loud labelled search field → the contracts' quiet grey pill, reused.** Extracted the contracts search-pill into a shared **`<SearchInput>`** component (recessed grey, no border at rest, focus ring only; `min(260px,100%)`, pill shape) and used it on **both** pages. Invoices' big `TextField` (visible label, 420px) is gone; the pill sits **top-right above the table** in a new `.tableToolbar`. _(new components/SearchInput/, components/index.ts, InvoicesScreen.tsx, ContractsScreen.tsx, invoices.module.css, contracts.module.css)_
- **Search broadened from number-only to every column shown in the row** — number, period, amount, session count, status label, payment date (same free-text haystack approach as contracts). Placeholder/label updated; **new `invoices.count(n)`** string (fr+en) feeds an `sr-only` `aria-live` result count, matching the contracts a11y pattern. _(InvoicesScreen.tsx, i18n fr/en)_

### Decisions
- **WBS BILL-01 names "search by invoice number" — we treat that as the floor, not the ceiling.** Broadening to period/amount/status/date is strictly **additive** (number still matches) and mirrors what the contracts list already does (its WBS didn't mention search at all — that multi-field search was a design call). The two tables now behave consistently, not just look alike. Narrowing back to number-only is a one-line change if the client insists.
- **Search pill extracted, not copied.** The user asked to "reuse that element"; a shared `<SearchInput>` is the literal reuse — single source of truth, so the two tables can't drift. Contracts migrated to it with zero visual change; its bespoke `.searchBox/.searchIcon/.searchInput` CSS was deleted.
- **Subtle by intent.** A search field that's the loudest thing under the KPI band over-signals "fill me in"; the recessed pill *helps without competing* — same rationale the contracts page already documented.

---

## 2026-06-14 — Contacts freshness nudge: demoted + escalation tier (AUTH-21)

### Changes
- **Blue "are your contacts up to date?" `InlineAlert` → a quiet grey meta line.** No fill, no border, muted (`--color-text-muted`) `text-body-sm` with a small `Clock` icon and an inline **underlined text-link** action ("Tout est à jour ✓") — reads as page metadata, not an alarm. _(ContactsScreen.tsx, contacts.module.css)_
- **Green "all up to date" success banner removed.** Replaced by a tiny muted caption with a faint-green `CheckCircle2` — reassurance without celebrating a non-event on every visit. _(ContactsScreen.tsx)_
- **Escalation tier added.** The loud treatment isn't deleted, just gated: only past **~5 months** (`OVERDUE_AFTER_MS`) does it return to the soft blue `InlineAlert` banner with the prominent confirm button. Between ~2 and ~5 months it's the quiet line. `TWO_MONTHS_MS` → `NUDGE_AFTER_MS` (61d) + new `OVERDUE_AFTER_MS` (150d). _(ContactsScreen.tsx)_
- Freshness UI is now **admin-only** (non-admins can't confirm anyway); reuses existing strings (`refreshNudge`, `confirmFresh`, `upToDate`) — no new i18n. `confirmContactsFresh()` already `commit()`s, so the line refreshes itself. _(ContactsScreen.tsx)_

### Decisions
- **Match visual weight to urgency.** A bimonthly "still accurate?" is the lowest-urgency, recurring-maintenance message — it shouldn't borrow the alert vocabulary (fill + border + 22px coloured icon, above content) reserved for errors/actions-needed-now. Demoted to ambient metadata.
- **Quiet by default, loud only when earned.** Rather than delete the attention-grabber, it now has to wait until genuinely overdue (~5 months). Seed sits at 65 days → the demo shows the *quiet* state, which is the point.

---

## 2026-06-14 — Invoices overview matches the Accueil stat band (BILL-01)

### Changes
- **Invoices KPIs → the same editorial stat band as the home screen.** Replaced the four floating `KpiCard`s (`.kpiGrid`) with **one bordered white sheet divided by hairline internal rules** — the exact pattern the Accueil band uses (and that `Dashboard.module.css` explicitly calls the "*tic tableau de bord généré*" to avoid). Four cells: **Montant total impayé · Factures en attente · Délai moyen de paiement · Prochaine échéance**, each = secondary-grey eyebrow + Inter "display" number (`font-display`, **600**, tabular-nums, `ls-tight`), calm/non-clickable. Removed the now-unused `KpiCard` import. _(InvoicesScreen.tsx, invoices.module.css)_
- **Responsive reflow mirrors the home band** — 4 columns → **2 columns under 720px** with the dividing rules recomposed (vertical between the pair, horizontal between rows). _(invoices.module.css)_

### Decisions
- **Number tier is 32px (`--text-h2`), not the dashboard band's 40px (`--text-h1`).** The home band holds short scalars ("20", "4,5"); the invoice cells hold a **currency and a date** ("1 105,00 €", "26 juin 2026") that wrap at 40px even on a standard desktop. 32px is the house "KPI tier" and keeps every value on one line on desktop; the **weight (600), font, tabular figures, tracking, eyebrow style, and the unified-sheet layout all match Accueil exactly** — the size is the one content-driven adaptation. On mobile the number steps down a further notch (h3) so the long date still fits the half-width cell.
- **Kept the overdue `InlineAlert` banner above the band** (unchanged) — it's the page's contextual focal point, the counterpart to Accueil's "prochaine séance" hero.
- **`KpiCard` component left in place** though now unused — it's a generic, reusable single-KPI primitive, not screen-specific dead code.

---

## 2026-06-14 — Contacts page: tiered, function-first redesign (AUTH-21)

### Changes
- **Flat card grid → tiered layout.** The page now splits into a single elevated **contact principal** card (full-width, identity left / contact channels right on ≥720px) above an **"Autres contacts"** grid. Hierarchy is carried by **size + position**, not colour (no shadow, no blue/red fill — house style intact). _(ContactsScreen.tsx, contacts.module.css)_
- **Cards now lead with the FUNCTION, not the face.** Each secondary card's headline is the person's role (Facturation, Coordination des séances, Direction…) with a **per-function lucide icon**, name underneath. The decorative initials `Avatar` is **removed** — initials didn't aid the "who handles X?" lookup; a role icon does double duty. _(ContactsScreen.tsx)_
- **Email + phone are now actionable.** Plain `<p>` text → `mailto:` / `tel:` links with per-person `aria-label`s ("Appeler …", "Envoyer un e-mail à …"). Phone strips spaces for the `tel:` href, still shows `formatPhone()`. 44px min row height (touch target). _(ContactsScreen.tsx, contacts.module.css)_
- **Chip soup → one calm role line.** The principal eyebrow uses a **gold star** (signals "pivot" without implying clickable/action); extra roles beyond the headline collapse to a single muted `·`-joined line; account-access drops to a quiet `ShieldCheck`/`ShieldAlert` meta line. The redundant "Contact additionnel" label is gone — the grid placement already says it. _(ContactsScreen.tsx, contacts.module.css)_
- New i18n: `contactsPage.othersTitle`, `noOthers`, `callLabel(name)`, `emailLabel(name)` (fr + en). _(i18n fr/en)_

### Decisions
- **Function-first, not person-first.** Nobody opens this page thinking "show me Thomas" — they think "who handles billing?". So the role is the headline and the name is secondary; the page is organised by primacy (principal hero) rather than by function *sections*, which would leave mostly-empty bins for a 3–6 person list.
- **Gold star for the principal, never blue/red.** Blue = interactive and red = action in this surface; a gold (`reward`) star marks "the key contact" without colliding with either affordance.
- **Page NOT renamed (yet).** "Contacts" still collides with "Contrats" and "Nous contacter" in the nav; the recommended rename to **« Interlocuteurs »** is a separate, unconfirmed decision — only the information display was reworked here.

---

## 2026-06-13 — Evaluations page: session-style cards, polish, + history tab (SESS-13)

### Changes
- **Pending list → session-style entry cards.** Replaced `List`/`ListItem` with the sessions card (reused via cross-file CSS `composes`). Card is a **3-column grid**: `[unit title + gray small date·time] | [coach avatar+name] | [status chip]`, **whole card clickable** (stretched `::after` over the `<Link>` to `/evaluations/:id`), chevron affordance, **uniform neutral border** (no unit colour). The coach sits in a **fixed 16rem left column** so avatars align in a straight column down the list (was floating after the variable-width date). _(EvaluationsScreen.tsx, evaluations.module.css)_
- **New "Historique" tab** — past evaluations (WBS "Voir mon évaluation"), most-recently-evaluated first, each card showing the **star rating** in the right zone; opens the existing read-only detail. Tabs **À évaluer / Historique** (`?onglet=historique`), shared card renderer, per-tab empty states. New `api.listSubmittedEvaluations()` (sessions with `evaluation`, sorted by `submittedAt` desc). Seed already has 8 evaluated sessions. _(EvaluationsScreen.tsx, api.ts, evaluations.module.css, i18n fr/en)_
- **Evaluate form** wrapped in a real `<form>` (onSubmit + `type="submit"`); **sr-only `<h2>` headings** on the recap + form sections (restores h1→h2); RatingInput legend levelled 20px→16px to match sibling field legends. _(EvaluateScreen.tsx, Rating.module.css)_
- **Button `:disabled` → flat gray fill** (`--lc-neutral-200` + muted text) instead of an opacity veil over the red gradient (which read as a "milky" overlay); loading/busy keeps the colour + spinner. **App-wide.** _(Button.module.css)_
- **InlineAlert** gets a visible `:focus` ring (focus-to-error, WCAG 2.4.7, fires on programmatic `.focus()`). **App-wide.** _(InlineAlert.module.css)_
- Mobile (`<600px`) eval card reflow fixed so visual order matches DOM (WCAG 1.3.2). Removed dead `impressionsShort` i18n (both locales). _(evaluations.module.css, i18n fr/en)_
- eslint `jsx-a11y/no-autofocus` → `{ ignoreNonDOM: true }` — InlineAlert's `autoFocus` is a custom prop, not the DOM attribute; clears **17** false-positives app-wide while still catching native `<input autoFocus>`. _(eslint.config.js)_

### Decisions
- **Eval list cards reuse the sessions card via cross-file `composes`** — but the two have **diverged** (sessions = `<button>` opening the peek modal; eval = `<a>` navigating to the form). Kept the coupling for now (rule-of-three before extracting a shared `EntryCard`); **re-check the eval list after touching the sessions card** (it already caused one silent underline regression).
- **Unit colour dropped from eval cards.** Colour-coding is a *calendar* requirement in the WBS (where a legend makes it legible); on a short, legend-less list it was noise competing with the blue interactive accent. Uniform neutral border instead.
- **History card right zone shows the star rating, not a redundant "Évaluée" chip** — the rating is the useful at-a-glance outcome; the whole card opens the read-only detail for the impression + comment.

---

## 2026-06-13 — Contracts list & detail redesign (CON-03)

### Changes
- **Contracts list: 2-column card grid → compact `DataTable`** (Intercom-inbox style). Columns **reference · units · progress · end date · status**, balanced-fill **percentage widths** (`table-layout: fixed`, align to the pixel), **status last**. Removed the horizontal scrollbar and the Actions/chevron column (row hover already signals clickability). _(ContractsScreen.tsx, contracts.module.css, DataTable)_
- **New `fillHeight` mode on `DataTable`** — the panel becomes the scroll container so the **header pins** and rows scroll internally (fixed 52px row rhythm). Opt-in; Invoices untouched. Below **1099px** the table reflows to **stacked cards** (no horizontal scroll). _(DataTable/index.tsx, DataTable.module.css)_
- **`MiniProgress`** one-line bar+count, width-capped (160px) so it never stretches; em-dash when no sessions generated (no degenerate `progressbar`). Fill uses `--color-progress-strong` (AA-safe on the light track). _(ContractsScreen.tsx, contracts.module.css)_
- **Status chips uniform & left-aligned** (`min-width:150px`, `justify-content:flex-start`); the **"pending" chip lost its white-bg+border** (now borderless `--lc-bleu-50`/`-700`, like the others); **"Actif" green lightened** `vert-100 → vert-50`. "En attente de validation" → **"En attente"** / "Pending". All column headers share the same secondary grey (no heavy-blue active-sort color). _(Chip.module.css, ContractsScreen.tsx, i18n fr/en)_
- **Tertiary search** (reference / unit / date / status) — a quiet, recessed **pill** input parked at the right end of the filter row. _(ContractsScreen.tsx, contracts.module.css)_
- **Header → content gap standardized to 24px (`--space-lg`) on every page** — first opened up on contracts via a `.filterRow` margin (tried 48 → 32), then **moved onto the shared `PageHeader`** (`margin-bottom`) and settled at **24px** so all pages breathe identically below the title + CTA. The contracts-only hack was removed (no other screen had a header-gap hack, so nothing doubles up). _(PageHeader.module.css, contracts.module.css)_
- **Pagination** (`CONTRACTS_PER_PAGE = 6`) — **integrated into `DataTable`** via a new opt-in `pageSize` prop (sorts all rows, then slices), plus a `summary` slot. New **`plain` (borderless) variant** on the shared `Pagination`. Footer is a 3-column grid: **pagination centered, result count pinned right**. _(DataTable, Pagination, ContractsScreen.tsx)_
- **Contract detail de-boxed** — four stacked `CardSection` frames replaced by **one flowing column** of hairline-separated `<section>`s with quiet 20px/600 titles; reads top-to-bottom as a document. _(ContractDetailScreen.tsx, contracts.module.css)_

### Decisions
- **Pagination lives INSIDE `DataTable`, not in the screen.** `DataTable` owns sorting (default + clickable headers), so slicing *outside* it would sort only the current page. Integrating keeps **sort global, then paginate**. Made fully opt-in (`pageSize`/`summary`) so **Invoices** — the other consumer — is unchanged.
- **`pageSize = 6` (deliberately low).** Keeps the dense list scannable at a glance *and* makes pagination visible with the 7-contract seed (2 pages). One-line knob in `ContractsScreen`.
- **Result count → table footer, right-aligned; pagination centered.** A count is reference info, not a control — it doesn't belong in the filter row next to the search. The 3-col footer grid centers the pager while keeping the count hard-right even on a single page (when the pager renders nothing).
- **Borderless pager arrows (`plain` variant) on both Contracts and Sessions.** The bordered square buttons read heavy next to the pages' pill controls; the `plain` variant swaps the frame for a soft hover fill (focus ring intact). Applied to the contracts footer first, then the Sessions pager on request so the two match. (`bordered` remains the default for any future table.)

---

## 2026-06-13 — Home dashboard / calendar polish + scope audit

### Changes
- **Next-session hero card** now opens the full session **peek modal** (`SessionPeekModal` → `SessionDetailBody`) instead of navigating away — the same modal calendar events use. _(DashboardScreen.tsx, Dashboard.module.css)_
- **Next-session card chip** recolored navy-on-blue → **brand orange on a light-orange background** (icon `--lc-cta-ember`, bg new `--lc-cta-ember-soft` #FDEBDC), echoing the orange "Planifier une séance" CTA. Added `--lc-cta-ember-soft` to tokens as the warm `*-soft` companion. _(tokens.css, Dashboard.module.css)_
- **KPI band typography**: big numbers set to **600/semibold** at 40px (iterated 700 → 500 → 400 → 600 on request). Pending-evaluations number recolored **navy → black**; the action color now lives only on the "Évaluer →" link. _(Dashboard.module.css, DashboardScreen.tsx)_
- **`RatingDisplay` half-star fix**: was `Math.round(value)`, so 4.5 rendered **5 full stars**. Now a full-size filled star is overlaid on the outline and **clipped via `clip-path: inset(0 X% 0 0)`** to the fill fraction → 4.5 shows a clean **4½ stars** (no scaling — an earlier flex-width clip let the SVG shrink). App-wide fix (dashboard avg-rating KPI, session detail, evaluations). Also nudged the avg-rating star row down (`.statRating` margin) to clear the comma of "4,5" above. _(Rating/index.tsx, Rating.module.css, DashboardScreen.tsx, Dashboard.module.css)_
- **"X réalisées"** on the "Séances ce mois" card is now a **positive green** (`--color-progress-strong`, AA-safe on white). Split the detail string into `sessionsDone` / `sessionsUpcoming` so only the completed count is colored. _(i18n fr/en, DashboardScreen.tsx, Dashboard.module.css)_
- **KPI + hero vertical padding** raised to **20px** (literal — no token between 16 and 24). _(Dashboard.module.css)_
- **Calendar — List view** redesigned:
  - Fixed a **dead divider selector** — rows live inside `<li>`, so `.listRow + .listRow` never matched; now `.list li + li .listRow`.
  - **Removed the left color strip**; unit category is now a soft colored **pill** pinned far-right, using the same `--unit-*` colors as the Month chips (color stays consistent across views).
  - **Unified date + coach name** to one size/weight (14px / regular), differentiated only by color (date = primary, name = muted); widened the date column to push the name right.
  - **Next session now pops at a glance**: the whole next-session row gets a soft blue tint (`#f2f5fc` — dimmed a notch below `--lc-bleu-50` so it doesn't compete with the orange label / unit pill; hover `--lc-bleu-50`) with an **orange "Prochaine séance"** eyebrow (700, `--lc-cta-ember`) above the date (new `.listWhen` wrapper). Replaces the old red "Prochaine" badge, which was buried among the trailing chips — invisible mid-list (the list is chronological and includes past sessions). Orange (vs navy) is a *warm* hue that separates from the black body text and ties to the orange "Prochaine séance" hero icon → **orange = next session across the page**. The `nextBadge` string is now "Prochaine séance" / "Next session". ⚠️ **Contrast caveat:** ember orange on the light tint is ~2.3:1 — below AA for text; an accepted exception like the today-circle (deeper burnt-orange available if AA is required). _(Calendar/index.tsx, Calendar.module.css, i18n fr/en)_
- **Unit legend** changed from a pill-with-dot (read as an iOS toggle) to **rounded-square chips** carrying color + label together. _(Calendar/index.tsx, Calendar.module.css)_
- **Calendar toolbar**: period label now **18px / regular** (was 24px / bold); tightened the gap between ‹ · label · ›, pushed "Aujourd'hui" out with a left margin. _(Calendar.module.css)_
- **Week-range label** now has a comma after the weekday — "Lundi, 8 juin – dimanche, 14 juin" — an intentional style choice (standard French omits it). Scoped to this label only, via a local `replace(' ', ', ')`; other date displays unchanged. _(Calendar/index.tsx)_
- **Summary widgets below the calendar** (SESS-08): built, then **removed** — see Decisions. Dead i18n (`completed/upcoming/awaitingEvaluation/seeEvaluations`) deleted; only `widgets.seeAll` kept (reused by ContractDetailScreen).

### Decisions
- **SESS-08 "summary widgets below the calendar" → not built.** The top **KPI band already surfaces** completed / upcoming / awaiting-evaluation above the fold. The bottom widgets sat below the fold and duplicated the KPI band — notably "awaiting evaluation" == the "Évaluations en attente · Évaluer →" card, both linking `/evaluations`. **Treat the KPI band as fulfilling the clause; do not re-flag as a gap or rebuild** unless the client insists on the literal placement.
- **Calendar event / next-session click → peek modal, not a full page.** Minor deviation from SESS-08's "open the session details *page*"; the full page is one click away via "Voir la fiche complète", and modifier-click falls through to the real link. **Accepted.**
- **Quick-create popover (Google-Calendar-style click-to-create) → KEEP.** Pointer-only interaction not in the brief, but judged a good feature; the keyboard/primary path is the "Planifier une séance" CTA → `PlanSessionModal` (and "Plus d'options" escalates to it). To be reviewed with the client; remove later only if they reject it.
- **Excel export stub → KEEP as-is for the prototype.** `downloadStub` (semicolon-delimited) is intentionally a mock — this build is a clickable demo of look-and-feel, so a real `.xlsx` engine is deferred to production, not a blocker now.

### Scope status (home screen vs WBS SESS-08)
Audited 2026-06-13 (re-confirmed after widget removal): all 5 KPIs, both CTAs, full Month/Week/List calendar (color-coded, next-session highlighted, consistent colors, prev/next/today), default-landing-after-login, and the complete SESS-09 detail field set are **implemented**. **No scope gaps; nothing to remove.** Both prior flagged items (quick-create, export stub) are decided: **keep both** (above). Typecheck green.
- _Known prototype limitation (accepted):_ dates/numbers are hard-wired to `fr-FR` in `lib/format.ts`, so the EN toggle translates UI labels but not dates — fine for the demo; would need locale-aware formatters for a real EN release.

---

## 2026-06-13 — « Papier calme » → white canvas + Inter _(earlier same day)_
- Aesthetic landed on **all-white canvas + Inter everywhere** (serif / warm-paper directions were tried and reverted the same day). Kept: editorial stat band, blue = interactive, focus management. Today-circle keeps a red→orange gradient (a **user-accepted sub-AA exception**). Clock shows 12h am/pm.

## 2026-06-11 — EHPAD web app built
- **27/27 WBS stories**, mock backend (`src/data`). Demo knobs `?role` / `?state` / `?debug` (see `README.md`).

---

## Standing design rules (apply to everything here)
- **No all-caps** anywhere (brand rule).
- **WCAG AA minimum**; color is never the only signal (unit legend always visible).
- **Color = clickable** — info surfaces stay neutral; the action color rides on the link/button.
- **Flat bordered cards**; shadow only on overlays.
- **Design tokens over raw values** wherever a token exists.
