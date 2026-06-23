# Le Mouvement — Component Specs (deepened set)

Companion to [`README.md` §5](README.md#L96), which specs the **expressive** starter set
(Button, Chip/Badge, StatCard, ProgressBar, Medal). This doc specs the **workhorse**
primitives every screen reuses — forms, structure, navigation, feedback — bound to the
tokens in [`theme.ts`](theme.ts) / [`tokens.json`](tokens.json).

> **Rules baked in (non-negotiable):** body ≥ 16px · touch target ≥ 44px · contrast AA ·
> never colour alone · motion respects `prefers-reduced-motion`. Components reference
> **semantic / theme tokens only** — never raw hex.

Each surface dials the same component to a different **intensité**
(`coach` = ink canvas / red-dominant · `admin` = cream / red-rare · `ehpad` = cream / blue·green).
Where a component changes meaningfully by surface, a **Dosage** line says how.

Status legend: ✅ specced here · 🔗 see README §5 · ⏳ queued (listed in §15).

---

## A. Forms & input

The post-session **6-step report** (coach), plus all admin/EHPAD data entry, lean on these.
Forms-first principle: *lisible pour les non-tech* — every field has a visible label, generous
hit areas, plain-French helper text, and errors that say what to do.

### 1. TextField ✅

- **Overview.** Single-line text entry. Use for names, email, search, numeric values.
  For multi-line (report notes, observations) use the **Textarea** variant. Don't use a
  TextField where a Select, Stepper, or date picker fits the data better.
- **Anatomy.** Label (`label` style, above field — never placeholder-as-label) · optional
  helper text · input container (height ≥ 44, `radius.md`, `borderSubtle` 1px, padding `md`) ·
  optional leading icon / trailing affix (unit, clear, reveal) · error/success message slot.
- **Variants.** `text` · `email` · `tel` · `number` · `password` (trailing reveal toggle) ·
  `search` (leading magnifier + trailing clear) · `textarea` (min 3 rows, auto-grow, vertical resize).
- **Props.** `label` (req) · `value` · `onChange` · `placeholder` (hint only, optional) ·
  `helperText` · `error` (string) · `required` · `disabled` · `leadingIcon` · `affix` · `maxLength`.
- **States.** default · focus (2px `info` ring, 2px offset, border → `borderStrong`) ·
  filled · error (border + message `danger`, ⚠ icon + text — never red border alone) ·
  success (border `progressStrong`, ✓) · disabled (`actionDisabled` text, muted bg, no ring) ·
  read-only (no border, bg = surface).
- **Behavior.** Validate on blur, not per-keystroke; clear the error the moment the user starts
  fixing it. `maxLength` shows a live `n/max` counter only past 80%. Number field uses
  `inputMode="numeric"`. Mobile (coach): label stays visible above the keyboard.
- **A11y.** `<label for>` tied to the input (not `aria-label` — the label is visible). Error
  wired via `aria-describedby` + `aria-invalid`; message in an `aria-live="polite"` region.
  Required marked in text ("obligatoire"), not by `*` alone. Reveal toggle is a real `<button>`
  with `aria-pressed`. Placeholder is never the only label (fails cognitive + low-vision).
- **Dosage.** coach: field on `surfaceRaised` (white card) over ink canvas; ehpad: 18px body,
  taller 52px container for tablet-at-arms-length.

### 2. Select / Dropdown ✅

- **Overview.** Choose one (or a few) from a known list. ≤ 5 mutually-exclusive options →
  prefer Radio or Segmented; > ~7 → add type-to-filter. Never use a Select for yes/no (use Toggle).
- **Anatomy.** Label + trigger (looks like a TextField, trailing chevron) + popover/sheet list
  (each row ≥ 44, check/■ for selected) + optional search input at top.
- **Variants.** `single` · `multi` (checkbox rows, trigger shows "n sélectionnés") ·
  `searchable` · native fallback (`<select>`) for simple single on web where it's lighter.
- **States.** trigger: default · focus (`info` ring) · open (chevron rotates, border `borderStrong`) ·
  error · disabled. Option: default · hover/active · selected (✓ + `infoSoft` bg) · focused (roving).
- **Behavior.** Mobile (coach) opens a **bottom sheet**, not a tiny popover. Selecting in single
  mode closes + returns focus to trigger; multi keeps open. Empty-list state shows "Aucun résultat".
- **A11y.** Pattern = `combobox` + `listbox`; `aria-expanded`, `aria-activedescendant`.
  Keyboard: `↑/↓` move, `Enter/Space` select, `Esc` close + restore focus, type-ahead jumps.
  Selected state carries ✓ icon, never colour alone.

### 3. Selection controls — Checkbox · Radio · Toggle ✅

- **Overview.** Checkbox = independent on/off or multi-pick. Radio = exactly one from a set
  (always in a group, default selected). Toggle = an *immediate* binary setting (no Save needed).
- **Anatomy.** Control (≥ 24px visual, ≥ 44px hit area) + label to the right (whole row is the
  target) + optional helper line. Radio/Checkbox groups sit in a `fieldset` with a `legend`.
- **Variants.** checkbox: `unchecked` · `checked` · `indeterminate` (parent of mixed children).
  toggle: `off` · `on`. Size `md` (default) · `lg` (ehpad).
- **States.** default · hover · focus (`info` ring on the control) · checked/on (`action` fill +
  ✓ / knob slide) · disabled · error (group-level message). Checked uses fill **and** glyph/position.
- **Behavior.** Click anywhere on the row toggles. Toggle animates the knob `motion.duration.fast`
  / `easing.standard`; **snaps** under reduced-motion. Toggle reflects state instantly and, if it
  triggers async work, shows a pending spinner in the knob — never a silent optimistic lie.
- **A11y.** Native `<input type=checkbox|radio>` / `role="switch"` with `aria-checked`. Group =
  `fieldset`/`legend`. Radio arrow-keys move + select within group; Tab enters/exits the group.
  Label is the accessible name and is clickable.
- **Dosage.** coach: `action` (red) as the "on" fill; ehpad: `info` (blue) "on" fill — red near-absent.

### 4. Rating / Stepper scale ✅  *(powers the 6-step post-session report)*

- **Overview.** Capture a bounded ordinal value — effort, mobility, mood, pain — on the coach's
  post-session report and EHPAD assessments. Big, thumb-friendly, one tap. Not for free counts
  (use a number field) or unbounded ranges.
- **Anatomy.** Question (`h3`/`subheading`) + scale row of segments/dots (each ≥ 44px) +
  end-anchor labels ("Facile" … "Très dur") + selected-value readout in words.
- **Variants.** `segmented` (1–5 / 1–10 pills) · `emoji` (faces for mood — paired with text) ·
  `stepper` (− value + for quantities like séance count, the PRD step-6 TBC).
- **States.** unselected · hover/press · selected (`reward` or surface accent fill + bold) ·
  disabled. Selected value always shown as text, not position alone.
- **Behavior.** Single tap commits; tapping another moves it. Stepper clamps at min/max and
  disables the spent button. No animation needed beyond a `fast` press feedback.
- **A11y.** `radiogroup` (rating) with each segment a radio carrying a full `aria-label`
  ("Effort : 4 sur 5"); arrow keys adjust. Stepper = two buttons around an `aria-live` value.
  Emoji faces get text labels — emoji is never the sole signal.

---

## B. Structure & navigation

### 5. Card ✅  *(generic surface — distinct from the data-only StatCard 🔗)*

- **Overview.** A grouped, optionally-tappable surface holding mixed content — the Coach Home
  "next session" card, a resident summary, a coach row-card. Use StatCard 🔗 when it's a single
  hero number; use Card for composed content.
- **Anatomy.** Container (`radius.xl`, padding `lg`, `elevation.level1`) + optional media/avatar +
  header (title + optional eyebrow chip) + body + optional footer actions. Optional accent
  edge/bar in the surface accent.
- **Variants.** `static` · `interactive` (whole card is a link/button — hover lift, press scale) ·
  `raised` (`level2`) · `inline` (no shadow, `borderSubtle`, for dense lists/admin tables).
- **States.** default · hover (interactive: `level2` + 1px rise) · focus-visible (`info` ring on
  the card) · active (scale .99) · selected (accent border + `aria-pressed`/`aria-current`).
- **Behavior.** Interactive cards: one primary tap target = the card; nested buttons (e.g. a
  "DÉMARRER" CTA) stop propagation and are reachable separately. Lift/scale runs `fast`; disabled
  under reduced-motion. Don't nest interactive cards inside interactive cards.
- **A11y.** Interactive card = a single `<a>`/`<button>` wrapping the content, with a meaningful
  accessible name (not "card"). Decorative media `aria-hidden`. Nested actions are separately
  tabbable and labelled.
- **Dosage.** coach: card = `surfaceRaised` (white) floating on ink canvas, the bright object in
  a dark room; admin/ehpad: white card on cream, `level1`, calmer.

### 6. ListItem / Row ✅

- **Overview.** One repeating record in a vertical list — a session, a resident, a coach, a
  notification. The atom of every list, inbox, and feed across all three surfaces.
- **Anatomy.** Leading slot (avatar / icon / checkbox) + primary text (`body-strong`) +
  secondary text (`caption`, `textSecondary`) + trailing slot (chip, time, chevron, action).
  Min height 56 (one line) / 72 (two lines); full-width separator `borderSubtle`.
- **Variants.** `navigation` (trailing chevron, whole row taps) · `action` (trailing button) ·
  `selectable` (leading checkbox/radio) · `swipeable` (mobile — reveal actions; **must** have a
  non-gesture equivalent, e.g. trailing overflow ⋯).
- **States.** default · hover · focus-visible · pressed · selected (`infoSoft` bg + ✓) · disabled.
- **Behavior.** Swipe actions (coach) always mirror to a visible overflow menu — swipe is never the
  only path. Long lists virtualize (RN: FlashList per `vercel-react-native-skills`). Destructive
  swipe (e.g. annuler) asks for confirm, never fires on release alone.
- **A11y.** Semantic `<li>` in a `<ul>`/`role=list`; the row's tap = one named control. Swipe
  actions exposed as real buttons to AT. Selected = `aria-selected`/checkbox state + ✓.

### 7. TabBar (bottom navigation — coach mobile) ✅

- **Overview.** Top-level switch between the coach's primary destinations. **Locked IA (4 tabs):**
  **Accueil · Séances · Disponibles · Revenus**. Profil + notifications do **not** take a tab — they
  live top-right in the AppHeader (§9). Mobile/coach only; admin/ehpad use a side/top nav (⏳ NavRail, §15).
- **Anatomy.** Fixed bottom bar on `canvas`/`surface`, safe-area inset, 3–5 items: icon (`iconMd`)
  + `label` (UPPERCASE, ≤ 1 word) stacked; each item ≥ 44×44. Optional center FAB-style primary.
- **States (per item).** active (`action` icon+label, optional top indicator) · inactive
  (`textSecondary`) · focus-visible · pressed · badge (unread count dot+number).
- **Behavior.** Tap switches instantly + resets that tab's scroll/stack to root on re-tap of the
  active item. Bar hides on keyboard open. No transition heavier than a `fast` cross-fade.
- **A11y.** `role="tablist"` / nav landmark; active item `aria-current="page"`. Labels always
  visible (icon-only nav fails cognitive + recognition). Badge has an `aria-label`
  ("3 séances à confirmer"), not a bare dot.
- **Dosage.** coach: ink bar, active item glows `action` red — the engine is always one tap away.

### 8. Avatar ✅

- **Overview.** Visual identity for a coach, resident, or EHPAD. Appears in the header greeting,
  list rows, assignment cards.
- **Anatomy.** Circle (`avatarSm` 32 / `avatarMd` 48 / `lg` 64) — image, or initials on a
  deterministic tone from the neutral/accent ramp, or a fallback person glyph.
- **Variants.** `image` · `initials` · `icon` · with status dot (présent/confirmé — dot + label) ·
  `group` (stacked, "+3").
- **States.** default · loading (skeleton circle) · error (→ initials/glyph fallback).
- **A11y.** Meaningful avatar has `alt` = the person's name; purely decorative repeat (name already
  in adjacent text) is `aria-hidden`. Status dot carries an `aria-label`, never colour alone.

### 9. AppHeader / greeting bar ✅  *(Coach Home `Salut, Karim`)*

- **Overview.** Top region of a screen: identity + context + a primary action. The Coach Home's
  "Salut, Karim 👋" lives here.
- **Anatomy.** Avatar + greeting (`h2`/`h3`) + optional subtitle (date, streak chip 🔗) +
  trailing actions (top-right): notifications **bell** w/ badge + **avatar → Profil** menu (account,
  availability & service area, history, settings, logout). Optional integrated hero stat/gradient.
  *Coach IA: Profil is reached here, not via a bottom tab (see TabBar §7).*
- **Variants.** `home` (large, greeting + gradient accent) · `section` (compact title + back) ·
  `modal` (title + close).
- **Behavior.** `section`/`modal` headers can pin/condense on scroll (title shrinks `h1→h3`);
  condense is a `standard` ease, skipped under reduced-motion. Back/close always top-left/right
  per platform convention.
- **A11y.** Greeting is the screen's `<h1>`. Bell/settings are labelled icon-buttons with badge
  `aria-label`. Back button labelled "Retour", not just a glyph.
- **Dosage.** coach: greeting on ink, name can ride the `gradient.movement`; ehpad: larger, calmer,
  no gradient — blue accent.

---

## C. Feedback & system

*Directly serves the README's "never colour alone" rule and the flagged **danger ≈ action-red collision**.*

### 10. InlineAlert / Banner ✅  *(resolves the red-on-red ambiguity)*

- **Overview.** Persistent, in-context message tied to a region — a form-level error, an EHPAD
  capacity warning, a billing-sync notice. Not for transient confirmations (use Toast §11) or
  decisions (use Modal §12).
- **Anatomy.** Container (soft tinted bg + 1px border or leading accent bar, `radius.md`,
  padding `md`) + **mandatory leading icon** + title + body + optional action link + optional dismiss.
- **Variants & tokens (icon is what disambiguates, since danger & action share the red family):**
  - `info` — `infoSoft` bg / `info` accent / ℹ icon.
  - `success` — `progressSoft` / `progressStrong` / ✓.
  - `warning` — `warningSoft` / `warning` / ⚠.
  - `danger` — `dangerSoft` / `danger` (`rouge.700`, **darker than `action`**) / ⊗ icon + the word
    "Erreur". The darker red **plus** a distinct icon+label is how danger reads as danger and not
    as a CTA. Never a plain `action`-red bar.
- **States.** static · dismissible (× returns focus sensibly) · with-action (inline button/link).
- **A11y.** `role="status"` (info/success) or `role="alert"` (warning/danger) so AT announces it.
  Icon is decorative *if* the variant word is in the text ("Erreur :", "Attention :"); otherwise the
  icon carries an `aria-label`. Colour is never the only signal — icon + word always present.

### 11. Toast / Snackbar ✅

- **Overview.** Brief, transient confirmation of a completed action — "Séance confirmée",
  "Rapport envoyé", "Hors ligne". Auto-dismisses. Never for errors that need action (→ InlineAlert)
  or anything the user must read to proceed (→ Modal).
- **Anatomy.** Floating pill/card (`elevation.level2`, `radius.lg`) + leading status icon + message
  + optional single action ("Annuler"). One at a time; queue the rest.
- **Variants.** `neutral` · `success` · `danger` (with retry) — each icon-led.
- **Behavior.** Slides in `base`/`decelerate`, holds ~4s (longer if it has an action; pauses on
  hover/focus), slides out. Reduced-motion → fade only. An action toast ("Annuler") stays until
  acted or a longer timeout. Position: coach bottom (above TabBar), web bottom-left.
- **A11y.** `role="status"` `aria-live="polite"` (errors `assertive`). Must **not** trap focus, but
  its action must be keyboard-reachable before it dismisses — so auto-dismiss pauses while focused.
  Don't put critical-only info in a toast (it vanishes; fails memory/cognitive).

### 12. Modal / Sheet ✅

- **Overview.** Block the flow for a focused decision or sub-task — confirm a check-in, the Select
  bottom-sheet, a destructive confirm. Use sparingly; prefer inline where the task isn't truly modal.
- **Anatomy.** Scrim (`rgba(24,23,21,.5)`) + container — **bottom sheet** on mobile/coach
  (`radius.2xl` top, drag handle), **centered dialog** on web (`radius.xl`, max-width ~480) —
  header (title + close) + body (scrolls) + footer actions (primary right, secondary left).
- **Variants.** `dialog` · `bottom-sheet` (mobile, optional snap points) · `confirm`
  (destructive = `danger` primary + explicit verb "Annuler la séance", never "OK").
- **States.** entering · open · exiting · loading (footer primary → spinner, actions disabled).
- **Behavior.** Sheet slides up `slow`/`decelerate`; dialog fades+scales `base`. Reduced-motion →
  fade only. Dismiss via close, scrim tap, `Esc`, or sheet swipe-down — **except** destructive
  confirms, which require an explicit choice (no scrim-dismiss). Body scroll locks behind.
- **A11y.** `role="dialog"` `aria-modal="true"` + `aria-labelledby` (title). **Focus trapped**
  inside; focus moves to the dialog on open and **returns to the trigger** on close. `Esc` closes
  (non-destructive). First focus = first interactive element or the heading, not the close ×.

### 13. EmptyState ✅

- **Overview.** What a list/section shows with no data — no sessions today, no residents yet, no
  search results. Turns a dead end into a next step.
- **Anatomy.** Centered: illustration/icon (decorative) + title (`h3`, plain & warm) + one line of
  body + optional primary action. Short, encouraging, never blaming.
- **Variants.** `first-run` ("Aucune séance pour l'instant" + CTA to plan one) · `no-results`
  (search/filter — offer "Effacer les filtres") · `error` (load failed — `danger` tone + "Réessayer").
- **A11y.** Title is a real heading in the region's outline. Illustration `aria-hidden`. Action is a
  proper button. Error empty-state announces via `role="alert"`.

### 14. Skeleton / Loading ✅

- **Overview.** Placeholder while content loads — mirrors the final layout (a Card skeleton, a list
  of row skeletons) so nothing jumps. Use for content; use an inline spinner for a button's own work.
- **Anatomy.** Neutral blocks (`neutral.100/200`, component radii) at the size of the real content.
- **Variants.** `skeleton` (shaped placeholders — default for predictable layouts) · `spinner`
  (indeterminate, unknown shape) · `progress` (determinate → use ProgressBar 🔗).
- **Behavior.** Subtle shimmer `slow` loop; **static (no shimmer) under reduced-motion**. Show only
  past ~300ms to avoid a flash on fast loads. Skeleton count ≈ expected items, capped.
- **A11y.** Loading region `aria-busy="true"`; announce "Chargement…" via `aria-live` and the
  resolution ("3 séances") when done. Spinner has an accessible label; decorative shimmer is hidden.

---

## 15. Queued (⏳ — next tranche, when their epics land)

Lower-frequency or surface-specific; spec when the owning epic starts so they're grounded in real flows:

- **NavRail / TopNav** — admin/EHPAD primary nav (the web counterpart to TabBar §7).
- **DataTable** — admin coach/EHPAD/billing tables (sort, paginate, row-select, sticky header).
- **DatePicker / TimePicker / Calendar** — scheduling & Google-Calendar-synced session planning.
- **Stepper / Wizard** — the 6-step post-session report shell (progress + back/next + save-draft).
- **Tabs (in-page)** — sectioning within a screen (distinct from bottom TabBar).
- **Tooltip / Popover** — sparingly; never the only home for essential info.
- **FileUpload / Photo capture** — report photos, EHPAD docs.
- **Map + check-in marker** — geolocated check-in (DU/Google Maps, PRD-critical).
- **Pagination · Accordion · Breadcrumb · SegmentedControl (top-level) · Notification center**.

---

## Component → surface coverage

| Component | coach 📱 | admin 🖥️ | ehpad 📋 | Status |
|---|:--:|:--:|:--:|:--|
| Button · Chip · StatCard · ProgressBar · Medal | ● | ● | ● | 🔗 README §5 |
| TextField · Select · Checkbox/Radio/Toggle · Rating | ● | ● | ● | ✅ §1–4 |
| Card · ListItem · Avatar · AppHeader | ● | ● | ● | ✅ §5,6,8,9 |
| TabBar (bottom nav) | ● | — | — | ✅ §7 |
| InlineAlert · Toast · Modal · EmptyState · Skeleton | ● | ● | ● | ✅ §10–14 |
| NavRail · DataTable · DatePicker · Wizard … | ◐ | ● | ● | ⏳ §15 |

● primary · ◐ partial · — n/a
