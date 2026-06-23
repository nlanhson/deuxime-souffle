# Le Mouvement — Design System Foundation

Design-token foundation for **Deuxième Souffle**, codified from the moodboard
([`project/brief/Moodboard 1 App · Deuxième Souffle.pdf`](../brief/)).

> **Un produit. Trois visages. Une énergie.**
> One design base, played at three intensities — **punchy** for the Coach,
> **structurée** for the Admin, **apaisée** for the EHPAD.

## Files
| File | Use |
|------|-----|
| [`tokens.json`](tokens.json) | Canonical, machine-readable source of truth (3 tiers + themes). |
| [`tokens.css`](tokens.css) | CSS custom properties for the React web apps (admin / EHPAD). |
| [`theme.ts`](theme.ts) | Typed export for React Native (coach) **and** React — destined for `packages/shared`. |
| [`components.md`](components.md) | Deepened component specs — forms, structure, nav, feedback (the workhorse set beyond §5). |
| `README.md` | This doc: palette, type, components, the three intensities. |

Token tiers: **global** (raw ramps) → **semantic** (aliases like `action`, `reward`) → **theme** (`coach` / `admin` / `ehpad`). **Components reference semantic/theme tokens only — never raw hex.**

---

## 1. Palette

| Role | Token | Hex | Notes |
|------|-------|-----|-------|
| Action / primary | `action` | `#E1322B` Rouge Ring | "Le rouge agit." CTAs, the matching engine. |
| Reward | `reward` | `#F2C200` Or Punchy | Badges, scores, gamification. |
| Info / data | `info` | `#1F3B73` Bleu | Data, KPIs, EHPAD primary accent. |
| Progress / santé | `progress` | `#2F9E6B` Vert | Progress bars, health/mobility gains. |
| Ink / text | `neutral.900` | `#181715` Noir Ring | Body text, coach dark canvas. |
| Secondary | `neutral.500` | `#8A8377` Taupe | Muted text, inactive. |
| Breathing | `neutral.50` | `#F7F4EF` Crème | Default canvas (admin / EHPAD). |
| Signature gradient | `gradient.movement` | `#E1322B → #F2C200` | 135°. Hero CTAs, medals, progress. The "mouvement." |

Each hue ships a full **50–950 tonal ramp** (see `tokens.json`).

### Contrast rules (AA — non-negotiable, PRD §5.4 + inclusive-design)
- **Noir on Crème** (`#181715` on `#F7F4EF`) → ~16:1. Default text pairing. ✅
- **White on Rouge** (`#FFFFFF` on `#E1322B`) → ~4.0:1. **Only for bold ≥16px** (AA large ✅, AA normal ✗). Used on primary CTAs.
- **Or buttons use noir text** (`#181715` on `#F2C200`) → high ✅. White on gold ✗ — never.
- **Vert with text** → use `progress.strong` (`#268158`) for text/icons on light; `#2F9E6B` is for fills/bars.
- **Never color alone**: pair every status color with an icon or label (danger overlaps with the action red).

---

## 2. Typography

Three families, three jobs:

| Style | Family | Size / LH | Use |
|-------|--------|-----------|-----|
| `display-hero` | **Anton** | 64 / 1.0, UPPERCASE | Hero scores, medal counts — `1 240 PTS` |
| `stat` | **Anton** | 32 / 1.0 | KPI & card numbers |
| `h1`–`h3` | **Oswald 600** | 40→24 | Titles (mobile scales down one step) |
| `label` / `button` | **Oswald 600** | 13–16, UPPERCASE, +0.06em | Nav, eyebrows, chips, CTAs |
| `body` / `body-strong` | **Inter 400 / 600** | 16 / 1.5 | Text, forms, data |
| `caption` | **Inter 400** | 12 / 1.4 | Metadata |

**Body is 16px minimum, always** — "on parle à des seniors et des soignants, jamais de texte minuscule." Anton is display-only (one weight, caps); never set body copy in it.

---

## 3. Spacing, radius, sizing

- **Spacing** — 4px base: `xs 4 · sm 8 · md 16 · lg 24 · xl 32 · 2xl 48 · 3xl 64`.
- **Radius** — `sm 8 · md 12 · lg 16 · xl 24 (cards) · 2xl 32 (hero / device frame) · pill 999 (chips, CTAs)`.
- **Touch targets — `≥ 44px`, always.** "Boutons généreux, faciles à viser sur tablette comme au doigt."
- **Elevation** — soft shadows on cream (`level1–3`) + `glow-action` (red glow under primary CTAs, as in the moodboard `DÉMARRER` button).

---

## 4. The three intensités

Same tokens, different **dosage**. What changes is the canvas, the type density, and how much red.

| | **Coach** 📱 | **Admin** 🖥️ | **EHPAD** 📋 |
|---|---|---|---|
| Platform | Mobile (React Native) | Desktop web | Tablet-first web |
| Canvas | **Ink** `#181715` | Crème `#F7F4EF` | Crème / white |
| Red usage | **Everywhere** — the engine | **Rare** — active nav + alerts | **Near-absent** — CTAs only |
| Lead accent | Rouge + gradient | Or (data) | Bleu + Vert (santé) |
| Type | Big Anton, expressive | Dense, tabular | Comfortable, larger |
| Mood | Punchy, gamified | Calme du pro, piloté data | Rassurant, le soin |

**Web:** set the surface with a data attribute — `<body data-surface="coach|admin|ehpad">` — and the theme block in `tokens.css` rebinds `--color-canvas`, `--color-accent`, etc.
**React Native:** import `surfaces.coach` from `theme.ts`.

### Four governing principles (from the moodboard)
1. **Gamifier sans infantiliser** — points, séries, médailles, but a sporty *adult* aesthetic.
2. **Lisible pour les non-tech** — seniors & soignants first; ≥16px, big buttons, plain French, zero jargon.
3. **Une énergie maîtrisée** — red *acts*, it doesn't shout; intensity follows context.
4. **Une base, trois intensités** — same tokens, same components, same grammar; only the dosage changes.

---

## 5. Core component specs

Specs follow the repo's `design-systems--component-spec` structure (anatomy → variants → states → a11y). Below is the **expressive** starter set seen across the three surfaces. The **workhorse** set — forms, structure, navigation, feedback — is specced in [`components.md`](components.md). Expand per epic.

### Button
- **Anatomy:** label (`button` style, UPPERCASE) + optional leading icon, inside a pill/`md`-radius container; min height **44px**, horizontal padding `lg`.
- **Variants:**
  - `primary` — gradient or solid `action`, text `on-action` (white, bold), `glow-action` shadow. The hero CTA (`DÉMARRER LA SÉANCE`).
  - `solid-ink` — `neutral.900` fill, white text (`MOUVEMENT`, `CONFIRMÉ`).
  - `reward` — `reward` fill, `neutral.900` text (`RÉCOMPENSE`).
  - `secondary` — transparent fill, `border-strong`, `text-primary`.
  - `disabled` — `action-disabled` fill, no shadow, `aria-disabled`.
- **States:** default · hover (`action-hover`) · active (`action-active`) · focus (2px `info` focus ring, 2px offset) · disabled · loading (spinner replaces icon, label stays).
- **A11y:** real `<button>`; label is the accessible name; focus-visible ring always; ≥44px hit area even when visually smaller.

### Chip / Badge
- **Anatomy:** `label` style text + optional leading icon/emoji, pill radius, compact padding.
- **Variants:** `reward` (gold — `TOP SECTEUR`), `action` (red — `SÉRIE ×5`), `info` (blue outline — `NIVEAU 4`), `progress` (green soft — `↑ +18%`), `ink` (`CONFIRMÉ`), `pending` (cream + dot — `À CONFIRMER`).
- **States:** static by default; if interactive (filter), add hover + `aria-pressed`.
- **A11y:** never rely on color — every chip carries text/icon. Status dots get an `aria-label`.

### StatCard
- **Anatomy:** eyebrow `label` + big `stat`/`display-hero` number (Anton) + unit + optional delta chip.
- **Variants:** `coach` (on ink, can use gradient highlight), `admin` (on white, sober, gold accent), `ehpad` (on white, blue/green, oversized for readability).
- **A11y:** number + unit + label read as one group; delta announces direction in words ("+18%, en hausse"), not arrow alone.

### ProgressBar
- **Anatomy:** track (`neutral.200`) + fill; label + percentage.
- **Variants:** `movement` (rouge→or gradient — coach level/gauge), `progress` (vert — EHPAD santé/mobility).
- **Behavior:** fill animates `base`/`standard`; **disabled under prefers-reduced-motion** (snap to value).
- **A11y:** `role="progressbar"` with `aria-valuenow/min/max`; never percentage-by-color alone.

### Medal / Level token
- **Anatomy:** circular, gradient or solid accent, icon (trophy / flame / star), optional level number.
- **States:** earned (full color) vs locked (`neutral.300`, outline).
- **A11y:** descriptive `aria-label` ("Médaille série ×5, obtenue"); decorative sparkle hidden from AT.

---

## 6. Next steps from here
1. **Fonts** — confirm/license Anton, Oswald, Inter (all Google Fonts / OFL); wire into RN + web.
2. **Figma** — mirror these tokens as Figma variables (`figma-generate-library-new` / `figma-create-design-system-rules-new`), then build components.
3. **Accessibility pass** — run `design-systems--accessibility-audit` + `adaptive-interfaces--colour-independence` over the palette.
4. **First vertical slice** — design the Coach home (`Salut, Karim`) against these tokens to pressure-test the system before scaling to all 14 epics.
