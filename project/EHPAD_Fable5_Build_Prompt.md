# BUILD PROMPT — EHPAD Manager Web App ("Deuxième Souffle")

## ROLE
You are an **exprienced UI/UX Designer**, building a high-fidelity, runnable **prototype** web app. You write precise, production-grade React/TypeScript and you follow the design system and scope exactly. When a layout is ambiguous, you choose the **calmer, larger, lower-color-saturation** option — never the flashier one.

## MISSION
Build the **EHPAD Manager web app** for **Deuxième Souffle**: the client space where a French nursing-home (EHPAD) manager monitors APA (adapted physical activity) coaching, manages contracts, evaluates coaches, tracks invoices, and maintains their facility profile. Deliver all **27 user stories** below as runnable screens with realistic French mock data and all four screen states (populated / empty / loading / error).

## CONTEXT (do not contradict)
- **Product:** "Deuxième Souffle" — APA coaching coordination for French EHPADs. This app is the **2nd of 3 audiences**. The **Coach mobile app** already exists (`apps/coach`, React Native/Expo); the **DS Admin back-office** is a later audience — **do not build either here**.
- **Intensity = "apaisée" (le soin):** reassuring, clinical-warm. Crème/white canvas, **blue leads**, **green = santé/progrès**, **red near-absent** (primary CTAs only). The opposite mood from the coach app's punchy ink-and-red room.
- **Persona is non-technical and often older** (director / *animatrice*, on a tablet, sometimes with reading glasses, sometimes mid-corridor). One task at a time, plain French, zero jargon. Optimize for *calme, clarté, zéro surprise*.
- **Language:** FR-only this phase. **All UI copy in French.** No locale switcher.
- **Platform:** **V1 = web only**, tablet-first responsive (must also work desktop + mobile browser). The EHPAD mobile app is V2.
- **Data:** high-fidelity runnable prototype on realistic **MOCK/SEED** data — **no live backend**. Every "system sends / validates / generates / approves" rule is **simulated client-side**.
- **Roles:** several staff share **one** EHPAD account (high turnover). Two roles — **Admin (Main Contact)** vs **User (Other Contact)**. **Read is always shared** across the EHPAD; **write is role-gated** (see §4 + §6).

**Read these repo files before building — do not guess their contents:**
| File | What it gives you |
|---|---|
| `project/ehpad_wbs_context.md` | The 27 user stories + acceptance criteria — **authoritative scope**. |
| `/Users/du-mac/UnicornProjects/deuxime-souffle/project/design-system/README.md` | "Le Club" palette, type, the "une base, trois intensités" model. |
| `/Users/du-mac/UnicornProjects/deuxime-souffle/project/design-system/theme.ts` | Typed tokens; the `surfaces.ehpad` definition (light, accent = info blue, accentSecondary = progress green). |
| `/Users/du-mac/UnicornProjects/deuxime-souffle/project/design-system/tokens.css` | CSS custom properties for the web apps; surface set via `<body data-surface="ehpad">`. |
| `/Users/du-mac/UnicornProjects/deuxime-souffle/project/design-system/components.md` | Workhorse component specs (forms, structure, nav, feedback). |
| `/Users/du-mac/UnicornProjects/deuxime-souffle/project/STATE.md` | Project decisions (locked light scheme, gamification-OUT, coach staleness-clock pattern). |
| `/Users/du-mac/UnicornProjects/deuxime-souffle/apps/coach` | Convention reference (folder layout, strict TS, theme copied locally). |

---

# 1 · TECH STACK & PROJECT SETUP

## 1.1 Stack (locked)

Build a **Vite 5 + React 18 + TypeScript + React Router v6** single-page app, styled with the design-system **`tokens.css` + CSS Modules**. **Do not add a heavy UI kit** (no MUI, Chakra, Ant, Mantine) — they ship their own token/theming systems that fight "Le Club"; you would spend more effort overriding them than you save. Build the workhorse primitives yourself from `components.md`, bound to the CSS variables.

| Concern | Choice | Why |
|---|---|---|
| Bundler / dev server | **Vite 5** | Instant HMR, zero-config TS; fastest path to a runnable prototype. |
| UI / language | **React 18 + TypeScript** | Matches PRD ("React for admin/EHPAD web") and the coach app. |
| Routing | **React Router v6** (`createBrowserRouter`, data routers) | Deeply route-driven; a layout route + `<Outlet/>` gives the persistent shell for free. |
| Styling | **`tokens.css` + CSS Modules** (`*.module.css`) | One source of truth for color/space/type; component scoping without a runtime; honours `[data-surface="ehpad"]`. |
| State | **React local state + Context** (§1.6) | No server, small surface — Redux/Zustand/React-Query are overkill. |
| Dates | **`date-fns` + `date-fns/locale/fr`** | Tree-shakeable, French locale. Calendar grid is hand-built (no calendar lib). |
| Icons | **`lucide-react`** | Outline, neutral, scalable; matches the calm EHPAD register. |
| Mock data | plain TS modules under `src/data` | Deterministic seed; no faker at runtime. |

> **Not chosen (noted):** Next.js. It is the better long-term home (SSR, route handlers when Supabase/Pennylane land), but this phase has **no backend, no SSR, no SEO need** — a client-only SPA is simpler to build, run, and hand off, and the folder structure below maps 1:1 onto `app/` segments if the team migrates later.

## 1.2 Location & theme delivery

- App lives at **`apps/ehpad/`** — sibling of `apps/coach`, Turborepo-ready. **Do not** scaffold `packages/shared` or `turbo.json` now (later consolidation, out of scope).
- **Copy** `project/design-system/tokens.css` into `apps/ehpad/src/theme/tokens.css` **verbatim** and import it once at the app root, before any component styles. Also copy `theme.ts` into `src/theme/theme.ts` for any TS that needs typed tokens (e.g. a value JS must read that CSS vars can't supply). **The CSS file is authoritative for styling; never let the two drift, and never edit token values — consume variables only.**
- Set the surface globally: `<body data-surface="ehpad">`.

## 1.3 Folder structure

```
apps/ehpad/
├── index.html
├── vite.config.ts
├── tsconfig.json                 # strict (see §1.7)
├── package.json
└── src/
    ├── main.tsx                  # mounts <App/>, imports tokens.css + fonts
    ├── App.tsx                   # RouterProvider
    ├── routes.tsx                # route tree (§3 IA / §1.5)
    ├── theme/                    # tokens.css + theme.ts (copied from design-system)
    ├── styles/
    │   ├── global.css            # resets, body data-surface base, :focus-visible ring, .sr-only
    │   └── utilities.module.css  # stack/cluster/grid helpers from --space-*
    ├── layout/
    │   ├── AppShell.tsx          # persistent shell: Sidebar + TopBar + <Outlet/>
    │   ├── Sidebar.tsx           # 9-item NavRail, collapsible
    │   ├── TopBar.tsx            # facility name, notifications bell, account menu
    │   └── *.module.css
    ├── components/               # workhorse + expressive primitives (§2.5)
    │   ├── Button/ TextField/ Textarea/ Select/ Checkbox/ Radio/ Toggle/
    │   ├── Rating/ Card/ ListItem/ Avatar/ Badge/ StatusPill/ Chip/ ProgressBar/
    │   ├── InlineAlert/ Banner/ Toast/ Modal/ Sheet/ EmptyState/ Skeleton/
    │   ├── KpiCard/ DataTable/ Tabs/ SegmentedControl/ Calendar/ Wizard/
    │   │   DatePicker/ TimePicker/
    │   └── index.ts
    ├── screens/                  # one folder per route screen (auth, dashboard, sessions,
    │                             #   contracts, contacts, invoices, facility, account,
    │                             #   notifications, support)
    ├── data/                     # MOCK layer — the only "backend"
    │   ├── seed/                 # one file per entity + a second "empty" fixture
    │   ├── store.ts              # in-memory mutable store + subscribers
    │   ├── api.ts                # async getters/mutations → Promises w/ 150–400ms latency
    │   └── index.ts
    ├── hooks/                    # useAsync, useAuth, useToast, useMediaQuery
    ├── context/                  # AuthContext, DataContext, ToastContext
    ├── i18n/fr.ts                # ALL user-facing copy (§1.4)
    ├── types/models.ts           # all domain types (§1.8)
    └── lib/                      # format.ts (fr-FR), pdf.ts (download stub), calendar.ts (grids)
```

## 1.4 i18n / French copy

- **All user-facing strings live in `src/i18n/fr.ts`** as a typed nested object (`fr.sessions.empty`, `fr.invoices.overdueBanner`, …). **No hard-coded French strings in JSX.** A thin `t()` helper or direct object access — no i18n runtime library for a single locale. **fr-FR only this phase; build no locale switcher.**
- **Formatting via `Intl`, centralised in `lib/format.ts`:** dates `fr-FR` (`14 mars 2026`, `mardi 16 juin · 14 h 30`), currency `Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'})` (`1 240,00 €`), phone grouped `06 12 34 56 78`. Durations in words (`1 h 30`, not `90 min`).
- **Copy register:** plain French, **vouvoiement**, zero jargon, reassuring (*le soin*). No anglicisms, no tech terms ("instance", "occurrence", "render", "payload", "endpoint", "submit", "OK", "loading", "error 500"). Status labels always full French words (À venir · Terminée · En retard · En attente de validation), never abbreviations. Empty states are warm and never blame the user; errors say **what to do** ("Choisissez une date à partir de demain", not "Date invalide").

## 1.5 Routing map

```
/connexion                       AUTH-05   login
/activer/:token                  AUTH-04   activation (valid → form; invalid/expired/used → error)
/mot-de-passe-oublie             AUTH-07   request reset
/reinitialiser/:token            AUTH-07   set new password
──────────────  AppShell (auth-gated)  ──────────────
/                                SESS-08   Dashboard (default landing)
/sessions                        SESS-11   tabs À venir / Passées; filters period + coach
/sessions/:id                    SESS-09   detail (+ report SESS-04, evaluate SESS-13, postpone SESS-12, edit SESS-10)
/sessions/:id/modifier           SESS-10   edit a future unassigned occurrence
/evaluations                     SESS-13   pending-evaluations list
/evaluations/:sessionId          SESS-13   evaluate a session
/contrats                        CON-03    contract list
/contrats/nouveau                CON-01/02/08  creation wizard
/contrats/:id                    CON-03    contract detail
/contrats/:id/modifier           CON-04    edit wizard (minor vs major)
/contrats/:id/resoumettre        CON-06    rejected → correct → resubmit
/contrats/:id/renouveler         CON-15    renewal
/contrats/:id/non-renouvellement CON-16    3-step non-renewal flow
/contacts                        AUTH-21   contact management
/factures                        BILL-01   overdue banner + KPI summary + list/search
/factures/:id                    BILL-01   invoice detail + PDF download
/etablissement                   AUTH-10   facility profile (+ group read-only EST-09)
/etablissement/modifier          AUTH-11   edit profile — Admin-gated
/mon-compte                      AUTH-11   my account (name/roles) + AUTH-14 delete request
/notifications                   NOTI-04   notification center (+ NOTI-03 coach-delay alerts)
/contact                         —         "Nous contacter"
```

Auth routes render **standalone** (no shell). Authenticated routes render inside `AppShell`. Default landing after login → `/`. Use **role-aware route guards** from `useAuth`: an Other Contact (`user`) who reaches an Admin-gated write route gets a read-only view + an InlineAlert "Action réservée au contact principal" — never a permission wall after filling a form.

## 1.6 State management

Keep it **simple and local-first**. Three contexts only: **`AuthContext`** (current user, role, login/logout), **`DataContext`** (wraps the in-memory store + typed mutations), **`ToastContext`**. Screen-level state (filters, form fields) is `useState`/`useReducer` inside the screen; each wizard uses a single `useReducer`. All reads/writes go through **`src/data/api.ts`**, which returns Promises with **150–400ms simulated latency** so loading skeletons are real; mutations update the in-memory store and notify subscribers so lists refresh. **A page reload resets to seed — acceptable and expected for a prototype.** No Redux, no Zustand, no React Query; a tiny `useAsync` (`{data, loading, error}`) is the ceiling.

## 1.7 TypeScript strictness

`tsconfig.json`: `"strict": true` plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`. Path alias `@/*` → `src/*`. All domain shapes from `types/models.ts`; seed data typed against them so model and fixtures can't drift. **No `any`** — use `unknown` + narrowing. `npm run typecheck` (`tsc --noEmit`) must be clean; ESLint (`@typescript-eslint`, `react-hooks`, `jsx-a11y`) wired and clean.

## 1.8 Domain model (`src/types/models.ts`)

IDs are stable string slugs so cross-references read clearly. Build these as written.

```ts
type Role = 'admin' | 'user';                 // admin = Main Contact, user = Other Contact
type UnitType = 'UC' | 'UP_UHR' | 'AIDANTS' | 'SOIGNANTS' | 'AUTRE';
type SessionStatus = 'a_venir' | 'terminee' | 'annulee' | 'reportee';
type ContractStatus = 'active' | 'a_renouveler' | 'en_attente_validation'
                    | 'expire' | 'rejete' | 'modification_en_attente' | 'non_renouvele';
type InvoiceStatus = 'en_attente' | 'en_retard' | 'payee';
type Frequency = 'hebdo' | 'bihebdo' | 'bimensuel' | 'mensuel' | 'ponctuel';
type SessionType = 'collective' | 'individuelle';  // CON-01/04 "type de séance" — see §3.5.3 Step 1

interface Facility {              // AUTH-10/11, EST-09 — exactly one
  id: string; tradeName: string; companyName: string; siret: string; vatNumber: string;
  category: string;
  group?: { id: string; name: string };       // AUTH-10 "Band/Group" = ONE field; EST-09 read-only on
                                               //   EHPAD side; absent ⇒ "non rattaché" indicator
  status: 'actif' | 'inactif'; units: UnitType[];
  addresses: { main: Address; billing: Address; sessionLocation?: Address };
  defaultSessionRate: number; markers: string[]; standardSessions: StandardSession[];
  stats: { totalCompleted: number; thisMonth: number; coachCount: number; upcoming: number };
}
interface Contact {               // AUTH-21
  id: string; civility: 'M' | 'Mme' | 'Mlle'; firstName: string; lastName: string;
  email: string; phone: string; type: 'principal' | 'additionnel';
  isSessionCoordinator: boolean; roles: ContactRole[]; otherRoleLabel?: string;
  account?: { role: Role; active: boolean };
}
interface Contract {              // CON-01..16
  id: string; reference: string;  // "CT-2026-014"
  status: ContractStatus; units: UnitType[]; frequency: Frequency; sessionType: SessionType; // CON-01/04
  startDate: string; endDate: string; availabilityNotes?: string;
  excludedSlots: ExcludedSlot[];  // CON-02
  rejectionReason?: string;       // CON-06
  generatedSessionCount: number; completedSessionCount: number; rate: number;
  avgRatingFromFacility?: number; // CON-03: contract-level overall average of ratings this facility gave
  history: ContractHistoryEntry[];
}
interface Coach {
  id: string; firstName: string; lastName: string; avatarUrl?: string;
  avgRatingFromFacility?: number; // CON-03: per-coach avg rating this facility gave
}
interface Session {               // SESS-04/08/09/10/11/12/13
  id: string; contractId: string; coachId: string | null;   // null ⇒ unassigned (editable, SESS-10)
  date: string; time: string; durationMin: number; unitType: UnitType;  // unitType drives calendar colour
  status: SessionStatus; isFirstTogether?: boolean;          // SESS-04
  report?: SessionReport; evaluation?: Evaluation; coachMessage?: string; // SESS-09
  modificationHistory: { at: string; by: string; change: string }[];
  events: SessionEvent[];          // NOTI-03 journal des événements (delays, postpones, edits) — §3.3.3
}
interface SessionEvent {          // NOTI-03 + audit — renders in the session "Journal des événements"
  id: string; at: string;
  kind: 'retard' | 'report' | 'modification' | 'annulation' | 'rapport_remis' | 'evaluation';
  label: string;                  // plain-French line, e.g. "Le coach a signalé un retard de 10 min"
}
interface SessionReport {         // SESS-04
  participantCount: number; atmosphere: { stars: number; emoji: string };
  hadDifficulties: boolean; difficultiesNote?: string; evaluationSummary: string;
}
interface Evaluation {            // SESS-13
  stars: number; impression: 'tres_bien' | 'bien' | 'correct' | 'a_ameliorer';
  comment?: string; submittedAt: string; submittedBy: string;
}
interface Invoice {               // BILL-01 — all amounts are HT (hors taxes)
  id: string; number: string; period: string; sessionCount: number; amountHT: number;
  status: InvoiceStatus; dueDate: string; paymentDate?: string;
}
interface AppNotification {       // NOTI-03/04
  id: string; type: 'coach_retard' | 'eval_due' | 'contrat_renouvellement' | 'facture' | 'contacts' | 'systeme';
  title: string; body: string; createdAt: string; read: boolean; link?: string;
}
```

**Seed data (rich fixture) must include:** facility **"EHPAD Les Tilleuls"** (Lyon), group **"Groupe Harmonie Soins"**; **≥2 logins** — Mme Sophie Mercier (Directrice, *principal*, coordinatrice → `admin`) and M. Thomas Lefèvre (Animateur → `user`), plus Mme Claire Dubois (Ergothérapeute, *additionnel*); coaches Karim Belkacem, Julie Renard, Marc Petit (per-coach avg from this facility 4.8 / 4.5 / 4.2); ~24 sessions across **past + upcoming + 1 annulée + 1 reportée**, assigned and **≥1 future-unassigned**, across unit types; **contracts in all statuses** — ≥1 `active`, 1 `a_renouveler` ending <90 days, 1 `en_attente_validation`, 1 `expire`, **1 `rejete` with reason** "Créneaux incompatibles avec la disponibilité du coach", **1 `modification_en_attente`** (so CON-04's major-change state is demoable), **1 `non_renouvele`** (so CON-16's outcome is demoable); each contract carries a `sessionType` and a contract-level `avgRatingFromFacility`; pending + completed evaluations; coach reports incl. a **first-session flag**; **6 invoices** (4 `payee`, 1 `en_attente`, **≥1 `en_retard`** to fire the overdue banner) — all `amountHT`; 3 contacts; a **`coach_retard`** notification whose body is the canonical NOTI-03 string **"Le coach est en retard pour la séance de 14 h 00"** (§3.10), and a matching `SessionEvent` of kind `retard` on that session's journal; the **group-attached** state and a way to demo the **not-attached** indicator. Provide a **second "empty" fixture** (or `?state=empty` toggle) with zero sessions/contracts/invoices so every list, KPI, and calendar can render its empty state on demand.

## 1.9 Dates, calendar, exports

- **Calendar (SESS-08):** hand-built Month / Week / List views in `components/Calendar` using `date-fns` (`fr`) helpers in `lib/calendar.ts`.
- **`.xlsx` / `.pdf` exports are mocked** (Excel calendar export SESS-08; coach-report PDF SESS-04; invoice PDF BILL-01). `lib/pdf.ts` exposes a `downloadStub(filename, label)` that generates a **real client-side Blob** (a one-page placeholder with the correct filename, e.g. `Rapport_seance_Karim_2026-03-14.pdf`) and triggers a genuine browser download, so the button is satisfyingly real. **Do not build server-side rendering.** Mark every stub with `// STUB:`.

## 1.10 Local dev server — the app MUST run and be viewable in a browser

This is a hard requirement, not a nice-to-have. The whole point is that the user can **open a URL and click through the app**. When you finish, the app must launch with a single command and be viewable at a local URL.

- **`package.json` scripts (provide all four):**
  - `"dev": "vite"` — starts the dev server with HMR. **This is the command the user runs to view the app.**
  - `"build": "tsc -b && vite build"` — production build to `dist/`.
  - `"preview": "vite preview"` — serves the production `dist/` build locally to verify it.
  - `"typecheck": "tsc --noEmit"` — see §1.7 / §8.
- **Served URL:** configure `vite.config.ts` with `server: { port: 5173, open: true, host: true }` so `npm run dev` **auto-opens the browser** at **`http://localhost:5173/`**, and `host: true` also exposes it on the LAN (handy for viewing on a real tablet — the EHPAD target device). If 5173 is taken, Vite will pick the next free port and print it; that's fine.
- **It must actually start clean:** `npm install` then `npm run dev` boots with **zero console errors**, lands on the dashboard (`/`), and every sidebar route renders. Do not ship a build that only typechecks but fails to boot.
- **Write `apps/ehpad/README.md`** with copy-paste run instructions:
  ```bash
  cd apps/ehpad
  npm install
  npm run dev      # opens http://localhost:5173
  ```
  Include: the URL, how to switch the seeded **Admin vs Other-Contact** role (a dev toggle in the TopBar or a `?role=` query param — your choice, but document it), how to switch the **rich vs empty** seed fixture (§1.8 `?state=empty`), and how to trigger the **error/loading** debug states (§8). Keep it short and non-technical-friendly.
- **No backend to start.** There is no API server, no `.env`, no database step — `npm run dev` is the only thing required to see the full app. If you add any optional tooling, it must never be needed just to view the app.

---

# 2 · DESIGN SYSTEM & VISUAL DIRECTION (ehpad)

This is the **EHPAD face of "Le Club"** — the **apaisée** intensity (*rassurant, le soin*). Same tokens, same components, same grammar as the coach app; only the **dosage** changes. Where the coach app is a dark room with red as its engine, this is a calm, crème-lit, white-carded, **blue-led** clinical-warm web surface where **green marks what's healthy/done** and **red is rationed to a single CTA**.

> **Non-negotiable rules baked into every component:** body ≥ 16px · touch/click targets ≥ 44px · WCAG AA contrast · **color is never the only signal** (always pair with icon + text) · all motion respects `prefers-reduced-motion`.

## 2.1 Token wiring (do this first, exactly)

1. Import `tokens.css` once at the app root, before any component styles. It defines three tiers: global ramps (`--lc-*`) → semantic aliases (`--color-*`, `--text-*`, `--space-*`, …) → per-surface overrides under `[data-surface="…"]`.
2. Set the surface: `<body data-surface="ehpad">`. This rebinds the theme so `--color-accent` → `--color-info` (blue `#1F3B73`, **the lead accent**) and `--color-accent-secondary` → `--color-progress` (green `#2F9E6B`, **santé/progrès**); canvas → crème `#F7F4EF`, surface → white `#FFFFFF`, text → noir `#181715`.
3. **Components reference semantic/theme tokens only — never raw hex.** Style with `var(--color-accent)`, `var(--space-md)`, `var(--radius-xl)`, etc. The only place hex appears is `tokens.css`. If a value isn't tokenized, derive it from an existing token; do not invent a hex.
4. **Reduced motion is already wired** at the bottom of `tokens.css`. Build all animation through `var(--duration-*)` / `var(--ease-*)` so it auto-disables. **Never hardcode a duration.**

## 2.2 Palette dosage

| Role | Token (CSS var) | Hex | EHPAD usage |
|---|---|---|---|
| **Canvas** | `--color-canvas` | `#F7F4EF` crème | App background. Warm, never stark white. |
| **Surface / cards** | `--color-surface` | `#FFFFFF` | Cards, panels, table bodies, modals, sidebar. White floats calmly on crème. |
| **Lead accent — BLUE** | `--color-accent` → `--color-info` | `#1F3B73` | The dominant accent: active nav, KPI numbers, links, focus rings, selected states, info, "on" fills for toggles/checkboxes, chart primary, default calendar events, **average-rating star fills**. **This is what the coach's red is — but blue.** |
| **Santé / progrès — GREEN** | `--color-accent-secondary` → `--color-progress` | `#2F9E6B` | Completed sessions, positive deltas, progress bars, "Payée à DS" status, success. Use `--color-progress-strong` `#268158` for green **text/icons** on light (AA); `#2F9E6B` for fills/bars only. |
| **Red — CTA ONLY** | `--color-action` | `#E1322B` | **Near-absent.** Reserved for the **single primary CTA** per view. Not nav, not decoration, not generic buttons. White text on red only at ≥16px bold. |
| **Danger (destructive)** | `--color-danger` | `#9E1E19` | A **darker** red than `action`, always with the ⊗ icon + the word "Erreur"/"Supprimer". The darkness + icon + word is how danger reads as danger and not as a CTA — critical because they share the red family. |
| **Warning** | `--color-warning` / `-soft` | `#CCA300` / `#FEF9E0` | Overdue-invoice banner, expiring contract — always with ⚠ + text. |
| **Text** | `--color-text-primary/-secondary/-muted` | `#181715` / `#6B655B` / `#8A8377` | Noir on crème ≈ 16:1. |
| **Borders** | `--color-border-subtle/-strong` | `#DED7CB` / `#C6BDAE` | Hairlines, dividers, field borders, table rules. |

> **Reward-gold is deliberately absent on this surface.** The `--color-reward` / Medal gold tokens are coach-side and do **not** appear here (see §6). **Average-rating stars use BLUE (`--color-accent`)** fills with a neutral empty-star outline — never gold. This keeps §2.2, §2.5, and §6 in agreement: one rule, no gold.

**Dosage discipline (most important paragraph):** a typical EHPAD screen is crème canvas + white cards + noir text + **blue** as the only saturated color, with **green** where something is healthy/done/positive. **Red should be almost invisible** — if you can see more than one red element on a screen, you've over-dosed. **Do not use** the `--lc-gradient-movement` (rouge→or) or `--elevation-glow-action` — they are coach signatures.

## 2.3 Typography mapping (web)

Three families, three jobs. Load via Google Fonts (all OFL): **Anton** (one weight), **Oswald** (600), **Inter** (400/600).

| Role | Family / weight | Size token | EHPAD application |
|---|---|---|---|
| **Big numbers only** | **Anton** 400 UPPERCASE | `--text-h2` (32) for KPI / `--text-display` (48) sparingly | **Display-only:** KPI/stat figures, average-rating value. **Never** body, a sentence, or a label. |
| **Titles h1–h3** | **Oswald** 600 | 40 → 32 → 24 | Page titles, section headers, modal/card titles. Scale down one step on mobile browser. |
| **Labels / buttons / nav / eyebrows** | **Oswald** 600 UPPERCASE, `--ls-label` (0.06em) | 14 → 16 | Sidebar labels, button text, table column headers, chip/field/tab labels. The structural voice. |
| **Body / data** | **Inter** 400 / 600 | `--text-body` **16 (floor, always)**, `--text-body-lg` 18 for primary reading | Paragraphs, helper text, form values, table cells, list text. LH `--lh-body` (1.5). |
| **Caption** | **Inter** 400 | 12 | Metadata only (timestamps, counters). Never for anything the user must read to act. |

**Rules:** Anton is display-only — never running text. **Body 16px floor, no exceptions; prefer 18px** for the main reading column given the audience. Uppercase only on Oswald structural elements (labels/buttons/nav), **never** body sentences (hurts low-literacy/dyslexic readers).

## 2.4 Spacing, radius, elevation

- **Spacing (4px base):** `xs 4 · sm 8 · md 16 · lg 24 · xl 32 · 2xl 48 · 3xl 64`. EHPAD leans **generous** — `lg`/`xl` for card padding and section gaps; default card padding `--space-lg` (24).
- **Radius:** `sm 8 · md 12 (fields) · lg 16 · xl 24 (cards) · 2xl 32 (modals) · pill 999 (chips, pill buttons)`.
- **Targets ≥ 44px, always; EHPAD prefers larger** — 52px-tall form fields and primary buttons for tablet-at-arm's-length.
- **Elevation (soft on crème):** `--elevation-1` (resting cards) · `-2` (hover, modals, toasts) · `-3` (overlays). Keep it soft and low — a calm surface, not a punchy one. **No `--elevation-glow-action`** (coach signature).

## 2.5 Component vocabulary to build

Build from `components.md` (workhorse set) and `README.md §5` (expressive set), bound to `theme.ts` `surfaces.ehpad`. Components marked ⏳ in `components.md §15` are **required for this app** and must be specced+built here.

**Actions**
- **Button** — `primary` (solid `--color-action` red, white bold text, **one per view max**, no glow), `secondary` (transparent, `--color-border-strong` border, noir text — *the default button here* since red is rationed), `ghost` (text-only, blue), `danger` (dark red + ⊗ + verb). All ≥44px (prefer 52px), `--radius-md` or `pill`, Oswald-600 UPPERCASE label, 2px **blue** focus ring at 2px offset. Loading = spinner replaces icon, label stays.
- **Chip / Badge** — always **icon/dot + text**: `info` (blue outline), `progress` (green soft — "Terminée", "Payée"), `warning` (gold soft — "En retard"), `pending` (crème + dot — "À évaluer", "En attente de validation"), `neutral` (gray — "Annulée"). Pill radius, Oswald label.

**Data display**
- **Card** — white on crème, `--radius-xl`, `--elevation-1`, `--space-lg` padding. `static` / `interactive` (whole card a link, hover → `-2`, blue focus ring) / `inline` (no shadow, `--border-subtle`). Optional blue accent edge. No gradient.
- **KpiCard / StatCard** — eyebrow (Oswald label) + **Anton** number (blue, oversized) + unit + optional delta chip. Delta announces direction **in words** ("+18 %, en hausse"), never arrow/color alone. Powers SESS-08 + BILL-01 KPIs.
- **DataTable** ⏳ — Sessions (SESS-11), Contracts (CON-03), Invoices (BILL-01), Contacts. Sticky white header (Oswald-600 UPPERCASE), `--border-subtle` row rules (no zebra), sortable headers, row-level action buttons (≥44px), status cells = chip (icon+text). Tabs above the table where the WBS specifies.
- **Tabs** ⏳ — segmented, blue active indicator + Oswald label, `role="tablist"`, `aria-current`. Used by SESS-11 and profile/contract-detail sections. **SegmentedControl** is the calendar Mois/Semaine/Liste switch.

**Navigation & structure**
- **Sidebar / NavRail** ⏳ — left vertical rail on white, tablet-first. Each item: icon (`--icon-md`) + **always-visible** Oswald-600 UPPERCASE label (icon-only fails the recognition bar for this persona). Active item: **blue** fill/left-rail indicator + filled icon + `aria-current="page"` (never color alone). Notifications item carries an **unread badge** with `aria-label` ("3 notifications non lues"), never a bare dot. Collapses to top bar + drawer on mobile browser. Exact items/order in §3.0.
- **AppHeader / TopBar** — EHPAD name + read-only group chip left; right = notifications bell (unread badge) + avatar menu (**Mon compte · Déconnexion · Demander la suppression du compte**). Calmer than coach: no gradient, blue accent, larger type.
- **Avatar** — image / deterministic-tone initials / icon fallback. Status dot carries `aria-label`.

**Calendar** ⏳ (SESS-08) — Month / Week / List, prev/next, "Aujourd'hui". Events show date, time, assigned coach, unit type, **color-coded by unit type** with a **text unit label** too (color never alone); colors **identical across all three views**. Next upcoming session highlighted (blue ring + "Prochaine" label). Click event → session detail. Unit-type colors pulled from the brand ramps, kept muted/distinguishable, AA on white event cards, **verified for color-blind separability** (no red/green-only pairing).

**Forms & input** (EHPAD dosage = 18px body, ~52px containers)
- **TextField / Textarea** — visible Oswald label **above** (never placeholder-as-label), `--radius-md`, `--border-subtle`, ≥52px. Focus → 2px blue ring + `--border-strong`. Error → `--color-danger` border **+ ⚠ icon + message** (never red border alone), `aria-invalid` + `aria-describedby`, message in `aria-live="polite"`. Validate **on blur**; clear error as the user fixes. Includes `read-only`, `password` (reveal toggle, `aria-pressed`), and `search` variants.
- **Select / Dropdown** — combobox+listbox; single/multi (multi for AUTH-21 contact roles); selected row carries ✓ (not color alone). On mobile browser, opens a bottom sheet.
- **Checkbox / Radio / Toggle** — control ≥24px visual / ≥44px hit area; **"on" fill = blue**. Checked shows fill **and** glyph/knob position. Groups in `fieldset`/`legend`.
- **Rating** — 1–5 stars, ≥44px each, value **in words** ("Note : 4 sur 5"), `radiogroup`. **Star fills use blue (`--color-accent`)**, empty stars a neutral outline — never gold. Powers SESS-13 input and SESS-04/08 read-only display (stars + emoji + text).

**Feedback & system**
- **InlineAlert / Banner** — soft tinted bg + **mandatory leading icon** + title + body. `info` (blue, `role="status"`), `success` (green ✓, `role="status"`), `warning` (gold ⚠, `role="alert"`), `danger` (dark red ⊗ + word "Erreur", `role="alert"`).
- **Toast** — transient confirmations only, bottom-left, icon-led, `role="status"`/`aria-live`. **Never** for errors that need action, and **never** for must-read content (use a Modal).
- **Modal / Sheet** — centered dialog (`--radius-xl`, max-width ~480), focus-trapped, returns focus to trigger, `Esc` closes — **except destructive confirms**, which require an explicit choice (no scrim-dismiss).
- **EmptyState** — warm, non-blaming title (Oswald h3) + one line + optional next-step action. `first-run` / `no-results` / `error` variants.
- **Skeleton** — shaped placeholders mirroring final layout, subtle shimmer (`--duration-slow`, **static under reduced-motion**), shown only past ~300ms. `aria-busy` + "Chargement…".
- **Wizard / Stepper** ⏳ — multi-step shell for CON-01 create, CON-04 edit, CON-15 renewal, CON-16 non-renewal. Visible numbered+named step progress (blue), Back/Next, save-draft, plain-French step titles.
- **DatePicker / TimePicker** ⏳ — constrain inputs: disable past dates for new sessions; grey-out excluded/closed days with a tooltip "Établissement fermé". Used in SESS-10 and the contract wizards.

---

# 3 · INFORMATION ARCHITECTURE & SCREEN-BY-SCREEN SPEC (the WBS-faithful core)

> **Cross-cutting build rules (apply to every data screen, do not skip):**
> - Every list/data screen ships **three non-happy states** — loading (Skeleton, `aria-busy`), empty (EmptyState, warm French, next-step CTA), error (`role="alert"` + "Réessayer").
> - **Color-never-alone everywhere:** unit-type colors, contract/invoice/session statuses, evaluation stars, ambiance emoji, recommended-date highlight, suitability badges — all carry an icon/label/text in addition to color.
> - **Role gating:** read is always shared (CON-03 multi-user). Write gating is a **single `role` flag** on the seeded user (see §6) — Admin-only writes show disabled controls + tooltip **"Réservé au contact principal"** for Other Contact, never a hidden control or a post-submit wall.

## 3.0 — Global frame & navigation shell

The persistent **`AppShell`** wraps every authenticated route (not auth routes).

- **Sidebar (NavRail)** — vertical, on white, blue active indicator, icon + **always-visible** French label, in this **WBS-faithful order** (E05: Home · Sessions · Rate · Contracts · Contacts · Invoices · Your information · Contact us · Notifications — Notifications is intentionally last, a utility/operational inbox, *not* an error):
  1. **Accueil** → `/` · 2. **Séances** → `/sessions` · 3. **Évaluations** → `/evaluations` · 4. **Contrats** → `/contrats` · 5. **Contacts** → `/contacts` · 6. **Factures** → `/factures` · 7. **Mon établissement** → `/etablissement` · 8. **Nous contacter** → `/contact` · 9. **Notifications** → `/notifications` (also a bell in the AppHeader).
- Active item: `aria-current="page"` + blue accent bar + filled icon. Collapses to a top bar / hamburger drawer on mobile-browser widths (reflow at 320px, no horizontal scroll, 200%-zoom safe).
- **AppHeader** — EHPAD name + read-only group chip (left); bell with unread badge + avatar menu (Mon compte · Déconnexion · Demander la suppression du compte) (right).
- **Landmarks:** `<nav>` sidebar, `<header>` AppHeader, `<main>` content, **skip-link "Aller au contenu"** first in tab order.
- **Wayfinding:** the page `<h1>` matches the nav label **exactly** (no clever renaming). **Breadcrumbs on every page deeper than one level** (e.g. "Contrats › Contrat UC — hebdo › Détail"; "Séances › Séance du 16 juin"), with real link-up segments — the primary "how do I get back" affordance. **Back is always top-left, Close (×) always top-right** — never both, never swapped. **No dead ends:** every empty state offers the next step.

## 3.1 — AUTHENTICATION & ACCOUNT (no shell)

### 3.1.1 Account activation via invite — `/activer/:token` *(AUTH-04, AUTH-05 context)*
A newly-invited contact activates from the back-office invite link, sets a password, is linked to the establishment.
- **Fields (AC4):** Prénom · Nom · Téléphone · Rôle(s) · Mot de passe · Confirmer le mot de passe. **Email is prefilled from the invite and read-only/disabled** (AC3) — TextField `read-only` + helper "Lié à votre invitation". Keep roles to what the invite carries; do not invent.
- **Password rules** (shared with AUTH-07 AC7): min 8 chars, ≥1 uppercase, ≥1 number; confirm must match. `password` variant with reveal toggle. **Live plain-French rule checklist** under the field that ticks as satisfied. Mismatch → "Les mots de passe ne sont pas identiques." Rules unmet → "Le mot de passe ne respecte pas les règles de sécurité." (validate on blur; clear on fix).
- **Action:** primary **"Activer mon compte"** (the rare red on this surface).
- **States:** token-verification skeleton; success (AC8/AC9) "Votre compte est activé." → route to login (or auto-authenticate into Dashboard for the prototype); expired/invalid/already-used (AC6/AC7) → full-page InlineAlert `danger` "Ce lien d'invitation est expiré, invalide ou déjà utilisé." + "Contacter l'équipe DS" link, **no form shown**.

### 3.1.2 Login — `/connexion` *(AUTH-05)*
- **Fields:** Email (`email`) · Mot de passe (`password`, reveal). "Mot de passe oublié ?" link → reset. **Action "Se connecter".** Persistent session (mock).
- **States:** invalid credentials (AC3) → "Email ou mot de passe incorrect", stays on screen; inactive user → "Votre compte n'est pas actif."; success (AC4) → redirect to `/`.
- **Seed two logins** (Admin + Other Contact) so role differences are demoable.

### 3.1.3 Password reset — `/mot-de-passe-oublie` + `/reinitialiser/:token` *(AUTH-07)*
- **Request:** Email. Empty → "Ce champ est obligatoire" (AC1). Bad format → "Format d'email invalide" (AC2). Valid → "Si un compte existe, un lien de réinitialisation a été envoyé." (1-hour link, mocked).
- **Set-new-password:** New + Confirm. Rules (AC7) → "Le mot de passe ne respecte pas les règles de sécurité." Mismatch (AC8) → "Les mots de passe ne sont pas identiques." Success (AC10) "Mot de passe réinitialisé avec succès" → redirect to `/connexion`. Expired (AC4) "Lien expiré" + "Demander un nouveau lien". Invalid/used (AC11) "Lien invalide ou déjà utilisé".

### 3.1.4 Logout *(AUTH-13)*
"Déconnexion" in the AppHeader avatar menu (all authenticated users). Optional confirm Modal. Terminate session (mock) → `/connexion`.

### 3.1.5 Mon compte — `/mon-compte` *(AUTH-11 own-account clause, AUTH-14 entry)*
The logged-in user edits **their own** account, independent of shared facility data.
- **Editable:** Prénom · Nom · Téléphone · Rôle(s). **Email read-only.**
- **Action "Enregistrer"** → toast "Modifications enregistrées." / "Aucune modification détectée" if unchanged. Contains the delete-account request entry (3.1.6). **Open to both roles** (it's the user's own account).

### 3.1.6 Delete-account request (Modal) — from `/mon-compte` *(AUTH-14)*
Submit a deletion request for DS Admin review; the user can **never** self-delete (AC6).
- **Entry (AC1):** "Demander la suppression de mon compte" (also reachable from the AppHeader avatar menu).
- **Modal:** explanatory copy + **optional** "Motif / commentaire" textarea (AC3) + **mandatory confirmation** (AC2) before submit (destructive-confirm pattern, no scrim-dismiss).
- **States:** success (AC8) InlineAlert/toast **"Votre demande de suppression de compte a été envoyée."** (account stays active, AC5); failure (AC9) **"Une erreur s'est produite. Veuillez réessayer."** Any authenticated user may submit.

## 3.2 — DASHBOARD / ACCUEIL — `/` *(SESS-08; entry points to SESS-13/04/09, CON-01/03, NOTI-04)*

Default landing; an at-a-glance "state of my EHPAD", readable in 5 seconds. **It answers "is anything waiting on me?" before anything else.** Top → bottom:

1. **KPI cards row** (KpiCard, Anton numbers, blue/green, never color-alone):
   - **Séances ce mois** — total + "réalisées" / "à venir".
   - **Contrats actifs** — count + contract types (**Active-status contracts only**).
   - **Évaluations en attente** — count **+ inline "Évaluer" action** → routes to the rate flow (SESS-13); this card is a **nudge, the most prominent pending-action when count > 0**; at 0 it goes quiet ("Tout est à jour ✓"), never a red zero.
   - **Note moyenne des coachs** — average from **submitted evaluations only** (number + blue stars; star count is the secondary signal).
2. **Primary CTAs (exactly two):** **"Planifier une séance"** (red primary) → one-off session from an Active contract (contract picker), and **"Exporter mon calendrier Excel"** (secondary) → mock `.xlsx` of the current period's sessions. No invented third CTA.
3. **Calendar:** SegmentedControl **Mois · Semaine · Liste** (selection persists; default Mois on tablet, List on mobile) · ‹ Précédent / Suivant › · **"Aujourd'hui"**. Events show date · heure · coach assigné · type d'unité, **color-coded by unit type + text label**, colors consistent across views; **next upcoming highlighted ("Prochaine")**; a **visible legend** maps color → unit type. Click event → `/sessions/:id`.
4. **Widgets row:** **Séances réalisées** · **Séances à venir** · **Séances en attente d'évaluation** (links to Evaluations).

**States:** KPI + calendar skeletons; empty (new facility) → calendar EmptyState "Aucune séance planifiée pour l'instant." + CTA, KPIs at 0, encouraging zero-state for pending evals; error → `role="alert"` + "Réessayer". **Role:** identical for both (shared data); keep "Planifier une séance" enabled for both (WBS does not restrict scheduling).

## 3.3 — SESSIONS / SÉANCES

### 3.3.1 Session list & filtering — `/sessions` *(SESS-11; SESS-04/12/13 entries)*
- **Tabs:** **"Séances à venir"** / **"Séances passées"**.
- **Filters:** **"Filtrer par période"** (range/preset) + **"Filtrer par coach"** (Select from seed coaches).
- **Table:** **Date · Heure · Animée par** (coach) + status/action column.
- **Status (text + icon, never color alone):** **"Évaluer la séance"** (pending → rate flow), **"Voir mon évaluation"** (evaluated → read-only), **"Séance annulée"** (grey + label/icon, not grey alone).
- **Per-row:** **"Rapport du coach"** → Coach Report modal (3.3.6).
- **States:** row skeletons; empty per tab; no-results → "Aucune séance ne correspond à vos filtres." + "Effacer les filtres". Identical for both roles. Row click → detail (3.3.2).

### 3.3.2 Session detail — `/sessions/:id` *(SESS-09; SESS-04/10/12/13 actions)*
- **Header:** Date & heure · Statut · Type d'unité · Coach assigné (Avatar). First-session indicator **"C'est votre première séance ensemble !"** if applicable.
- **Body:** intervention info submitted by the coach; **évaluation & note** (read-only if submitted, else "Évaluer" CTA); **message from the coach** to the EHPAD if any.
- **Journal des événements de la séance:** a chronological list (newest first) of this session's `events` (`SessionEvent[]`) — coach delays (NOTI-03), postpones (SESS-12), occurrence edits (SESS-10), report-remis, evaluation. Each row = icon + plain-French label + timestamp (e.g. "Le coach a signalé un retard de 10 min — 14 h 10"). This is the concrete render target for the NOTI-03 delay record; the `coach_retard` notification deep-links here. Empty → "Aucun événement pour cette séance."
- **Contextual actions (conditional):** **"Voir le rapport du coach"** (→ modal SESS-04) · **"Modifier la séance"** (SESS-10 — **only if future AND unassigned**) · **"Reporter la séance"** (SESS-12 — only future) · **"Évaluer la séance"** (SESS-13 — only completed & not-yet-evaluated).
- **States:** skeleton; not-found → EmptyState "Séance introuvable"; error. View identical for both roles; keep edit/postpone enabled for both (WBS requires no DS approval and doesn't restrict by EHPAD role).

### 3.3.3 Edit session occurrence — `/sessions/:id/modifier` *(SESS-10, CON-04 one-off-reschedule clause)*
Move the **date/time of a single future, unassigned session** without touching the recurring contract.
- **Precondition:** future + unassigned. If assigned/past, action isn't offered; if reached directly → InlineAlert "Cette séance ne peut pas être modifiée ici. Utilisez 'Reporter la séance'."
- **Fields:** new **Date** (DatePicker, disables excluded/closed days) + new **Heure** (TimePicker). Applies to **this occurrence only**; contract + other sessions unchanged; **logged in modification history + the session journal**; **no DS approval**.
- **Action "Enregistrer la modification"** → toast "Séance modifiée." + timestamped history/journal entry. Conflict (date excluded by contract) → warning InlineAlert.

### 3.3.4 Postpone session — Modal/flow from detail or list *(SESS-12 — postpone, never cancel)*
- **Entry "Reporter la séance"** on a future session.
- **Suggested dates** (mock generator over coach + EHPAD availability): alternative slots **grouped "Dans les 2 semaines" / "2 à 6 semaines"**, with **one recommended highlighted** (badge "Recommandé" + text, not color alone).
- **Action:** select a slot → confirm → session updated; **history + journal retained**; "Séance reportée au {date} à {heure}." Offer an **Undo** toast after confirm.
- **Cancellation note (must show):** InlineAlert "L'annulation définitive n'est pas disponible ici. Pour annuler une séance, contactez l'équipe DS par e-mail."
- **States:** suggestions skeleton; none available → EmptyState "Aucune date disponible pour le moment — contactez l'équipe DS." ; confirm success/failure.

### 3.3.5 Coach Report modal + PDF — overlay *(SESS-04)*
- **Modal "Rapport du coach":** nom du coach · date · heure · durée · type. **Metrics:** nombre de participants · ambiance générale (étoiles + emoji) · difficultés (Oui/Non) · évaluation de la séance. **Emoji always paired with text.** First-session indicator when applicable.
- **Buttons:** **"Télécharger le PDF"** (mock PDF from seed) · **"Rapport de séance"** (→ session detail 3.3.2).
- **States:** loading; report-not-yet-submitted → EmptyState inside modal "Le rapport n'a pas encore été remis par le coach."
- **A11y:** `role="dialog"`, focus trapped, `Esc` closes, focus returns to trigger.

## 3.4 — RATE SESSIONS / ÉVALUATIONS

### 3.4.1 Pending evaluations — `/evaluations` *(SESS-13; SESS-08 KPI source)*
- **Pending list** (ListItem): session date/time, coach, unit; trailing **"Évaluer"**.
- **States:** empty "Aucune évaluation en attente — tout est à jour !" (positive, never blaming); skeleton; error. Both roles can evaluate.
- **(Optional, secondary)** An "Évaluées" read-back view is **not required** — submitted evaluations are already reachable via SESS-11 "Voir mon évaluation" and the session detail (3.3.2). Only add it if trivial; otherwise omit.

### 3.4.2 Evaluate a session — `/evaluations/:sessionId` *(SESS-13)* — the **low-friction "3-tap" flow**
Make this feel fast and frictionless to maximize evaluation rate. Reachable from the dashboard "Évaluer", the Évaluations sidebar item, the session-list status button, and the session detail — **one destination, many on-ramps**.
- **Read-only session info first:** date & heure (+ coach). Surface the first-session warmth if SESS-04's flag is set.
- **Tap 1 — Star rating** 1–5 (Rating, `radiogroup`, each ≥44px, "Note : 4 sur 5", blue star fills).
- **Tap 2 — Overall impression** — pick exactly one (radio group as big tappable cards), the four WBS options **verbatim**:
  1. "Cela s'est très bien passé — le coach a su impliquer les résidents"
  2. "Cela s'est bien passé — la séance s'est déroulée sans encombre"
  3. "Correct — sans plus"
  4. "Points à améliorer (coach ou organisation)"
- **Optional comment** — Textarea "Ajouter un commentaire (facultatif)", visually de-emphasized, with helper "Votre commentaire est partagé avec l'équipe DS." (SESS-13: comments are visible to DS Administrators — be transparent, never present it as purely private).
- **Tap 3 — "Envoyer mon évaluation".**
- **Rules:** only **completed** sessions are evaluable; **once per session** — after submit, status → **"Évaluée"**, action becomes "Voir mon évaluation", the row leaves the pending list, KPI decrements, and the submission feeds the coach's overall rating + the facility average. Logged with timestamp + evaluator (mock) and added to the session journal.
- **States:** already-evaluated → read-only prior submission; not-completed → blocked InlineAlert; success toast "Évaluation envoyée — merci !" / failure.

## 3.5 — CONTRACTS / CONTRATS

### 3.5.1 Contract list — `/contrats` *(CON-03; CON-01/04/06/15/16 entries)*
- **List** — every contract for the EHPAD (multi-user: same list for all). Per contract: **Statut · Type(s) d'unité · Fréquence · Date de début · Date de fin · Notes de disponibilité · Nombre de séances générées · Nombre de séances réalisées.**
- **Unit-type labels:** Unité Standard · Unité Protégée · UHR · Aidants · Infirmiers · Autre.
- **Status filter & badges — enumerate all SEVEN `ContractStatus` values** (text + icon/badge, never color alone). CON-03 displays five; CON-04 adds **Modification en attente**; CON-16 adds **Non reconduit** — the extra two are **in scope**, not out:
  - **Actif** (today between start & end).
  - **À renouveler** (end within next 90 days → shows "Renouveler ce contrat").
  - **En attente de validation** (cannot be used for scheduling).
  - **Expiré** (end passed).
  - **Rejeté** (rejection reason displayed + "Modifier et resoumettre").
  - **Modification en attente** (a major edit awaits DS validation — CON-04).
  - **Non reconduit** (non-renewal confirmed; contract runs to its end date — CON-16).
- **Actions per contract (conditional):** **"Voir le détail"** · **"Créer une séance ponctuelle"** (from an **Active** contract) · **"Renouveler ce contrat"** (only **À renouveler**) · **"Modifier"** (editable contracts) · **"Modifier et resoumettre"** (only **Rejeté**).
- **Page CTA:** **"Demander un nouveau contrat"** → create wizard.
- **States:** skeleton; empty "Aucun contrat — créez votre premier contrat" + CTA; error. **Role:** both **see** the same list/details (CON-03); create/edit/renew/resubmit/non-renew are **Admin-gated** (disabled + tooltip for Other Contact); **viewing always shared**.

### 3.5.2 Contract detail — `/contrats/:id` *(CON-03; CON-04/06/15/16 entries)*
- **Summary:** status, unit types, frequency, **type de séance**, start/end, availability notes, generated/completed counts, default rate.
- **Generated sessions list:** past + upcoming + cancelled (each → session detail).
- **Participating coaches:** with **average rating given by this nursing home** per coach (`Coach.avgRatingFromFacility`, blue stars); plus the **overall average for the contract** (`Contract.avgRatingFromFacility`) shown once as a contract-level figure.
- **Contract modification history** (audit trail of minor + major changes, timestamped) — surface **"Modifié par {nom} le {date}"** so the next colleague has context.
- **Rejected:** show rejection reason prominently (InlineAlert `warning`) + resubmit CTA. **À renouveler:** renew/non-renew entry lives here too.
- **States:** loading; not-found; error.

### 3.5.3 Create contract — wizard `/contrats/nouveau` *(CON-01, CON-02, CON-08)*
Multi-step request ending in "En attente de validation". **Persistent numbered+named progress** ("Étape 2 sur 5 — Disponibilités"), a **carry-forward running summary** of choices made, **non-destructive Back**, and **save-draft/resume** (persist wizard state to the mock store so a colleague on the shared account can resume, AUTH-05). Steps:

- **Step 1 — Fréquence, type & unités:** Fréquence (radio): Une fois par semaine · Deux fois par semaine · Une fois toutes les deux semaines · Une fois par mois · Événement ponctuel. **Type de séance (radio, sets `Contract.sessionType`):** Séance collective · Séance individuelle — this is the field CON-04 can later edit as a **major** change. Unité(s) cible(s) (multi-select): UC · UP/UHR · Aidants/Familles · Personnel soignant · Autre — **"Autre" reveals a custom-name TextField inline**. Multi-unit planning: "Le même jour, à la suite" vs "Sur des jours séparés".
- **Step 2 — Disponibilités & exclusions (CON-02):** weekday × AM/PM grid (tap to block a half-day, blocked = struck/greyed + label); **quick presets** "Pas le mercredi" · "Pas le matin" · "Lundi & vendredi matin off"; **special periods** (fermeture continue / indisponibilité d'un jour / périodes récurrentes), each Toute la journée / Matin / Après-midi, editable + deletable; **"Réinitialiser toutes les exclusions"**; **notes de planification (facultatif)** for DS; a **"Récapitulatif des exclusions"** review before continuing.
- **Step 3 — Période:** Date de début + Date de fin (or a predefined-duration option, e.g. "12 mois").
- **Step 4 — Créneaux suggérés (CON-08):** system shows the **Top 4** suggested recurring slots (day + time), ranked most→least suitable (considering coach availability in the area, facility constraints, session-continuity to reduce coach travel). Each shows a **suitability badge — "Idéal" / "Bon" / "Acceptable" (icon + word, never color alone)** with the best pre-highlighted. User **selects one** → schedule generated; user can **remove/modify unsuitable dates**.
- **Step 5 — Récapitulatif & envoi:** review → **"Soumettre le contrat"**.
- **On submit:** status → **"En attente de validation"**; **cannot be used for scheduling until DS approves**; honest confirmation "Votre demande est envoyée. Elle sera planifiable une fois validée par l'équipe DS." (no false "C'est fait !").
- **States:** per-step validation (mandatory fields block Next with plain errors; **disable Next until submittable and say why** — "Sélectionnez au moins une unité pour continuer"); save-draft restore; suggestion-generation skeleton; no-suggestions edge → message + "Notes pour l'équipe DS". If write is Admin-gated, only Admin reaches this wizard.

### 3.5.4 Edit contract — wizard `/contrats/:id/modifier` *(CON-04)*
- **Minor (no DS validation):** one-off reschedule · exceptional/temporary changes · holiday adjustments · one-time operational constraints. Applied directly; **logged + timestamped + visible to DS Admin**.
- **Major (require DS validation):** **fréquence · jours/créneaux récurrents · type de séance · période** — each of these maps to a field set in the create wizard (§3.5.3: fréquence + type de séance in Step 1, créneaux récurrents in Step 4, période in Step 3), so every major category is a value the user could actually have chosen. On submit → status **"Modification en attente"**; applies only after DS validates.
- **UX:** the wizard must clearly tell the user **which changes are minor vs major before submit** (InlineAlert "Cette modification nécessite la validation de l'équipe DS et sera appliquée après approbation.").
- **States:** minor → applied toast; major → "Modification soumise, en attente de validation"; no-change info; error.

### 3.5.5 Resubmit rejected — `/contrats/:id/resoumettre` *(CON-06)*
Show status **"Rejeté"** + the **rejection reason** prominently (InlineAlert `warning`) at the top of the reopened wizard. **Reuse the create wizard prefilled** with the rejected contract's data, editable. Resubmit → **"En attente de validation"**. (Rejected contracts generate **no** sessions and don't affect scheduling.)

### 3.5.6 Renew contract — `/contrats/:id/renouveler` *(CON-15; CON-03 entry)* — the **low-friction happy path**
- **Side-by-side:** current contract vs **proposed renewal** (auto-generated from current config + latest availability) — proposed période, fréquence, unités, type de séance, tarification, nombre estimé de séances, and the **list of auto-generated sessions**.
- **Renewal reminder timeline** + milestones (90 / 60 / 30 jours before end).
- **"Personnaliser"** → opens the **create wizard prefilled** from the current contract (show "Repris de votre contrat actuel" so the prefill is trusted); user may modify frequency, units, type, availability, excluded slots, period, schedules before submitting. Defaults preserved by default; preferred recurring slots stay reserved until the renewal deadline.
- **Outcomes:** **Confirm renewal** → new contract for next period with **PENDING** status (active only after DS approval). **Decline** → routes into the Non-Renewal flow (3.5.7). All actions recorded in history.
- **States:** loading proposal; confirm/decline success/failure.

### 3.5.7 Non-renewal — 3-step flow `/contrats/:id/non-renouvellement` *(CON-16)* — the **deliberate high-friction flow**
Deliberately the opposite of evaluation: a business-loss event the product makes easy to reconsider. **Every step offers an escape back to renewal, and "Finalement, je renouvelle" is always the visually dominant (blue, large) choice; "Confirmer la non-reconduction" is the quiet, deliberate secondary.** No red here either — even confirming is a calm secondary action, not a danger CTA.

- **Step 1 — Prise de conscience:** show the **impact** (sessions end, residents lose the activity). Primary **"Finalement, je renouvelle"** (exits → renewal). Secondary **"Continuer la non-reconduction"**.
- **Step 2 — Motif:** select a reason — Budget réduit · Réorganisation interne / autre prestataire · Insatisfait du service · Fermeture / déménagement de l'établissement · Autre raison (optional comment). Offer **"Être rappelé par l'équipe DS avant de décider"** (callback → routes to Nous contacter, CON-16). Primary **"Finalement, je renouvelle"** · Secondary **"Confirmer"**.
- **Step 3 — Confirmation finale:** show **consequences**; **mandatory checkbox** "Je comprends les conséquences" — submit **disabled** until checked. Primary **"Finalement, je renouvelle"** · Secondary **"Confirmer la non-reconduction"**.
- **On confirm:** current contract stays active until its end date; **no** renewal created; status → **"Non reconduit"**; logged with timestamp + user. Plain-French consequence copy, **no dark patterns** — both paths equally legible.

## 3.6 — CONTACTS — `/contacts` *(AUTH-21)*

Manage facility contacts by role so communications reach the right people.
- **Contact cards** (3 visible by default), each: **Civility tabs** M. / Mme / Mlle · **Fields** prénom · nom · email · téléphone · **type** (contact principal / contact additionnel) · **Checkbox** "Coordinateur des séances" · **Multi-select role** Comptable · Coordinateur·rice d'animation · Directeur·rice · Psychomotricien·ne · Ergothérapeute · Psychologue · Spécialiste APA · Directeur·rice adjoint·e · Autre (préciser) · **Delete** with confirmation (destructive Modal).
- **Status banner:** **"Tous les contacts sont à jour"** (success InlineAlert) when fresh. **Bimonthly refresh nudge** (calm info, not a nag): when contacts haven't been confirmed in 2 months → InlineAlert "Vos contacts sont-ils toujours à jour ? Dernière vérification il y a X" with a one-tap **"Tout est à jour ✓"** that resets the clock (mirror the coach staleness-clock pattern) + "Mettre à jour" — also surfaced in Notifications, **targeting the Administrator**.
- **States:** loading; empty EmptyState + "Ajouter un contact"; delete-confirm; save toast.
- **Role (explicit in AUTH-21):** **only the Administrator (Main Contact) can edit the contact list** — Other Contact gets **read-only** cards (add/edit/delete disabled + "Réservé au contact principal"). The 2-month notification targets the Administrator.

## 3.7 — INVOICES / FACTURES — `/factures` *(BILL-01)*

**All invoice amounts and every total on this screen are HT (montants hors taxes), consistent with `Invoice.amountHT`.** There is no TTC anywhere — never sum against a TTC field; the overdue total and "montant total impayé" are sums of `amountHT`.
- **Overdue banner** (when ≥1 overdue): **`warning` (amber) InlineAlert** with ⚠ + the word "En retard" + **number of overdue invoices** + **total overdue amount (HT)** + **CTA "Contacter l'équipe DS"** (→ Nous contacter). **Not red** — red stays reserved for CTAs and danger-red would read as alarming. Icon + word + amount = three signals.
- **KPI summary** (KpiCards, factual/unalarming): **montant total impayé (HT) · nombre de factures en attente · délai moyen de paiement (jours) · prochaine échéance.**
- **Invoice table:** **Numéro · Période · Nombre de séances · Montant HT · Statut (En attente / En retard / Payée à DS) · Date de paiement.** **Default sort: period descending.** **Search by invoice number.** Statuses as text + icon/badge.
- **Detail:** open an invoice → details; **"Télécharger le PDF"** (mock).
- **States:** table skeleton; empty EmptyState; no-search-results "Aucune facture ne correspond." + clear; error. Both roles view + download.

## 3.8 — FACILITY PROFILE / MON ÉTABLISSEMENT — `/etablissement` *(AUTH-10 view, AUTH-11 edit, EST-09 group)*

Central record, organized as in-page tabs/sections:
- **Informations générales:** Nom commercial · Raison sociale · SIRET · N° TVA · Catégorie · **Groupe** · Statut · Unité(s) prise(s) en charge. **"Groupe" maps the WBS AUTH-10 "Band/Group" field — it is a single field, not two.** **Group (EST-09):** **read-only on the EHPAD side**, with a **visual indicator when not attached** ("Non rattaché à un groupe"). The admin-only link-to-group-profile and group filtering are **NOT** in this app.
- **Adresses:** Adresse principale · Adresse de facturation · Lieu des séances (si différent).
- **Contacts:** Contact principal (rôle, email, téléphone) + additional contacts (read summary; full management in /contacts).
- **Séances standard:** the facility's standard sessions (view + edit).
- **Tarification:** Prix de séance par défaut · Marqueurs appliqués.
- **Statistiques opérationnelles (read-only):** Total séances réalisées · Séances du mois en cours · Nombre de coachs participants · Séances à venir.
- **Contrats (read summary):** statut · date de début · date de fin · tarif par défaut (links into /contrats).
- **Edit behavior (AUTH-11):** editable = general info, addresses, contacts, standard sessions, default rate, markers. **Validate mandatory fields**; success confirmation; **"Aucune modification détectée"** if unchanged; **audit trail** of modifications (mock).
- **Group editability — resolved:** **"Groupe" is READ-ONLY on the EHPAD side per EST-09. This intentionally overrides AUTH-11's generic "can edit … Group". Do NOT make Group editable** and do NOT include it among the editable fields — group attachment is a commercial/DS-side decision the EHPAD only consumes.
- **Role (AUTH-11):** edits only for the Admin (Main Contact) → **Other Contact = read-only** facility data (controls disabled + "Réservé au contact principal"). Statistics + Group read-only for everyone. (Per-user account edit lives at /mon-compte.)
- **States:** per-section skeleton; save success/no-change/error; read-only render for Other Contact.

## 3.9 — CONTACT US / NOUS CONTACTER — `/contact`

Destination for the BILL-01 overdue CTA, SESS-12 cancellation routing, CON-16 callback. (Not its own acceptance criterion — keep it **minimal**: contact info + a thin form. Do **not** expand into a ticketing/inbox feature.)
- **Content:** DS contact info (email, phone) + a simple **message form** (sujet · message; optionally prefilled context when arriving from "Contacter l'équipe DS", a cancellation, or a CON-16 callback request).
- **States:** success toast "Votre message a été envoyé." / failure InlineAlert (mocked send). Available to both roles.

## 3.10 — NOTIFICATIONS — `/notifications` *(NOTI-04 view, NOTI-03 coach-delay)*

Notification center for operational alerts + platform updates; reachable from the sidebar item and the AppHeader bell.
- **List** (ListItem, newest first), unread vs read by **text/weight + dot** (never color alone). **Read notifications stay in history.**
- **Types to seed:**
  - **Coach delay (NOTI-03):** canonical rendered string **"Le coach est en retard pour la séance de 14 h 00"** (the seed instance; the template is "Le coach est en retard pour la séance de XX h 00" with XX = the session start) — fired when a coach hasn't checked in within the threshold; **thresholds 5 / 10 / 30 min (30 = séance annulée)**; the delay is **recorded as a `SessionEvent` (kind `retard`) in the session's "Journal des événements"** (§3.3.2), and this notification deep-links there. Goes to **manager + admin** — show on the EHPAD side.
  - **Bimonthly contact-refresh nudge (AUTH-21)** — to the Administrator every 2 months.
  - **Contract milestones (CON-15)** — renewal reminders at 90 / 60 / 30 days.
  - **Evaluation-pending / report-ready / invoice-overdue** cross-links (optional, from their KPIs).
- **Item actions:** tap → mark read + navigate to the relevant screen. AppHeader bell badge mirrors the unread count.
- **States:** row skeletons; empty "Aucune notification"; error. Both roles have an inbox (shared account); coach-delay and contact-refresh are addressed per the WBS above.

## 3.11 — STORY → SCREEN COVERAGE (27/27)

| Story | Screen(s) | Story | Screen(s) |
|---|---|---|---|
| AUTH-04 | 3.1.1 Activation | CON-01 | 3.5.3 Create wizard |
| AUTH-05 | 3.1.2 Login (+3.1.1 context) | CON-02 | 3.5.3 Step 2 |
| AUTH-07 | 3.1.3 Reset | CON-03 | 3.5.1 List + 3.5.2 Detail |
| AUTH-10 | 3.8 Mon établissement | CON-04 | 3.5.4 Edit wizard |
| AUTH-11 | 3.8 edit + 3.1.5 Mon compte | CON-06 | 3.5.5 Resubmit |
| AUTH-13 | 3.1.4 Logout | CON-08 | 3.5.3 Step 4 |
| AUTH-14 | 3.1.6 Delete-request modal | CON-15 | 3.5.6 Renew |
| AUTH-21 | 3.6 Contacts | CON-16 | 3.5.7 Non-renewal |
| SESS-04 | 3.3.5 Coach Report modal | BILL-01 | 3.7 Factures |
| SESS-08 | 3.2 Accueil | NOTI-03 | 3.10 + 3.3.2 journal des événements |
| SESS-09 | 3.3.2 Session detail | NOTI-04 | 3.10 Notifications |
| SESS-10 | 3.3.3 Edit occurrence | EST-09 | 3.8 Groupe (read-only + not-attached) |
| SESS-11 | 3.3.1 Session list | | |
| SESS-12 | 3.3.4 Postpone | | |
| SESS-13 | 3.4.2 Evaluate (+3.4.1 list) | | |

---

# 4 · UX PRINCIPLES & "GOOD IDEAS TO IMPLEMENT"

> **North star for every screen:** *Une seule action évidente, en français simple, sur fond clair, avec du bleu qui guide et du vert pour la santé — rien ne surprend, rien ne presse, et on peut toujours revenir en arrière.* Everything here sharpens the 27 stories; **none of it adds scope.**

**Build these into shared components once, not per-screen:**

- **One primary action per screen** — exactly one visually dominant CTA (the only place red appears). Everything else is secondary/tertiary.
- **Progressive disclosure** — show the summary; reveal detail on demand. Contract cards show status/units/frequency/dates; history, coach roster, and generated-session list live on the **detail page**. The coach report opens as a modal *over* the session, not a fifth column.
- **Chunking** — group the facility profile into titled Cards (Informations · Adresses · Contacts · Tarification & statistiques), never one 30-field wall.
- **Recognition over recall** — never make the user remember a code, a status meaning, or a choice from two steps ago; re-show it. Across **people too** (shared account): surface "Modifié par {nom} le {date}" on profile/contract history.
- **Plain-language microcopy** — domain words (séance, unité, coach, contrat, facture, créneau); buttons are plain-French verbs; ~16 words/sentence max, active voice; helper text says **what to do**; numbers/dates/durations written for humans.
- **Error prevention over messages** — constrain inputs (date pickers that disable impossible/closed days; Select/Radio from the WBS enums, never free text); **on-blur** validation that clears as the user fixes (never per-keystroke, never submit-only); **disable the primary action until genuinely submittable and say why**; **confirm before anything irreversible** with the consequence restated; password rules shown up front as a live checklist; "Aucune modification détectée" is a prevention, not an error.
- **Memory-load reduction in wizards** (contract create/edit/renew, postpone) — persistent named+numbered progress, a carry-forward running summary, non-destructive Back, save-draft/resume, renewal preloads everything ("Repris de votre contrat actuel"), prefill-from-context-and-lock (the invite email).
- **Generous, forgiving targets** — ≥44px (52px on ehpad), body ≥16px (18px primary), LH 1.5; whole rows/cards are the tap target; ≥8px between distinct targets; **Undo where possible** (postpone), **confirm where undo isn't** (delete contact, non-renewal); never log out mid-form without warning.
- **Wayfinding** — persistent sidebar with "vous êtes ici" (bold + blue left-bar + `aria-current`), `<h1>` = nav label, breadcrumbs deeper than one level, Back top-left / Close top-right, no dead ends.
- **Glanceability** — the dashboard answers "is anything waiting on me?" first; pending evaluations + any overdue-invoice banner surface at the top.
- **Multi-user awareness is a feature** — all same-EHPAD users see the same contracts/sessions/invoices (CON-03); make that obvious so a new staff member trusts the data is the establishment's. Roles gate actions **visibly** (disabled + "Réservé au contact principal"), never silently.
- **Two intentional friction asymmetries** — the **coach evaluation (3.4.2)** is the *frictionless* 3-tap flow (maximize evaluation rate); the **non-renewal (3.5.7)** is the *speed-bumped* flow with three "Finalement, je renouvelle" off-ramps (business-loss reconsideration). Same data discipline, opposite ergonomics — that asymmetry *is* the feature.

**Motion taste (apaisée — subtle, reduced-motion-safe):**
- Durations from the token scale, **biased slow-and-gentle** (`--duration-fast 120 / base 200 / slow 320`), `ease-standard`/`decelerate`. **No spring/bounce on this surface** — bounce reads as toy-like.
- **Animate to explain, not to impress** — a sheet sliding up from where it came (postpone, report), a calendar cross-fade on view switch, a toast easing in, a gentle wizard-step transition. **Not allowed:** parallax, looping ambient motion, attention pulses, confetti, anything gamified.
- **`prefers-reduced-motion` honoured everywhere** — every transition degrades to an instant state change or simple opacity fade; skeleton shimmer goes static; ProgressBar/Toggle snap to value. This is vestibular harm-prevention for an older audience, non-negotiable.
- **Feedback is immediate and multi-channel** — instant press state (within `fast`); status changes announce via `aria-live` (Toast `role="status"`, errors `role="alert"`) so screen-reader users get them too; never rely on animation alone. Motion never gates interaction; auto-dismiss toasts pause on hover/focus so a slow reader isn't rushed.

---

# 5 · ACCESSIBILITY CONTRACT (enforce on every screen)

This persona is non-technical and often older; accessibility here is **core function, not polish**.

1. **Contrast (AA — verified pairings):** noir on crème (`#181715`/`#F7F4EF`) ≈ 16:1 (default text); white on red (`#FFFFFF`/`#E1322B`) ≈ 4.0:1 **only** on the bold ≥16px primary CTA (AA-large), never normal text; green **text/icons** use `--color-progress-strong` `#268158` (`#2F9E6B` for fills/bars only); blue `#1F3B73` on white/crème passes AA for text and large UI (and is the average-rating star fill). No gold/reward on this surface.
2. **Color is never the only signal** — every status, chip, badge, calendar event, validation state, banner, suitability level carries an **icon and/or text** alongside color. Doubly important here because danger and the action CTA share the red family — disambiguate danger with the **darker** red + a distinct icon + the explicit word.
3. **Targets ≥ 44px** (prefer 52px); whole rows/cards are the tap target where appropriate; nested actions stay separately reachable.
4. **Focus always visible** — 2px **blue** `:focus-visible` ring at 2px offset on every interactive element; never remove an outline without replacing it. Full keyboard operability: logical tab order, focus traps in modals **with focus return**, `Esc` to dismiss, arrow-key navigation in radio groups/tabs/menus, **skip-to-content** link first.
5. **`prefers-reduced-motion`** — zeroes durations (already wired); additionally disable shimmer, progress-fill, modal slide (fade-only / snap). Build all motion through `var(--duration-*)`.
6. **Plain French, zero jargon** in every label, error, and empty state; errors say what to do; required fields marked with the **word "obligatoire"**, not `*` alone; labels visible and tied to inputs (`<label for>`), **never placeholder-only**.
7. **Responsive accessibility** — verified at mobile / tablet / desktop; **no horizontal scroll at 320px and at 200% zoom**; semantic landmarks (`<nav> <main> <header>`); `aria-live` for toasts and async results; `aria-busy` during loading.
8. **Don't hide essential info in tooltips/hover** — tablet has no hover; essential info lives on the page. Use a **Modal, not a Toast, for must-read content.**

---

# 6 · ANTI-PATTERNS / OUT-OF-SCOPE GUARDRAILS (build-blocking)

**Scope**
- **Do NOT invent fields, screens, statuses, or capabilities beyond the 27 stories.** No messages/chat, no in-app payment, no analytics dashboards, no resident-level records, no coach-search/booking marketplace, no settings the WBS doesn't list. If it's not in the stories, it doesn't exist in V1.
- **Do NOT build Admin or Coach features.** This is the EHPAD Manager web app only. Anything marked role = DS Admin is *their* screen — the EHPAD sees only its read-only/consumer side (e.g. EST-09 "Group" is **read-only** for EHPAD; the group-profile link and EHPAD-list filter are **admin-only**, absent here).
- **Do NOT add a color-scheme toggle / dark mode.** The ehpad scheme is **LOCKED LIGHT** (theme.ts, 2026-06-08).
- **Do NOT build a native mobile app.** V1 is **web only**, tablet-first responsive.

**The two flagged behavioural guardrails**
- **Do NOT add gamification.** Points, badges, streaks, levels, confetti, leaderboards, medals are coach-only and deferred even there (STATE.md; PRD defers E12). Brand energy comes from clean Anton numerals on **real in-scope data** (séance counts, euros, ratings), never game mechanics. The **Medal / reward-gold tokens do not appear on this surface at all** — including average-rating stars, which use **blue**, not gold (see §2.2 / §2.5).
- **Do NOT allow in-app session cancellation. Postpone only** (SESS-12). The only schedule-change action is **"Reporter la séance"**; **no "Annuler la séance" anywhere.** Permanent cancellation is out-of-app → email DS ("Les annulations définitives se font auprès de l'équipe DS par e-mail"). Likewise **account/contract removal is request-only** — "Demander la suppression du compte" submits a request (AUTH-14, never a hard delete); contracts can't be deleted, only renewed / not-renewed / edited (CON-04/15/16).

**Visual / color**
- **Do NOT use the coach's dark ink theme** — crème/white canvas, dark ink text, no dark surfaces, no `gradient.movement`, no `glow-action`.
- **Keep red near-absent** — `action` red on the **single primary CTA** only; **blue leads, green = santé/progrès.** Status, warnings, calendar coding, badges, non-renewal confirms — **none use red.** Overdue invoices use **amber `warning`**. Errors use the **darker `danger` red + ⊗ + the word "Erreur"** (and should be rare, because the error was prevented).
- **Do NOT signal anything by color alone** — every status/badge/suitability/unit-type/validation carries icon and/or text; the calendar legend is mandatory.

**Microcopy / interaction**
- **No jargon, English, or tech terms** in UI copy. **No placeholder-as-label.** **No icon-only nav or icon-only primary actions** (always a visible word). **No essential info in tooltips/hover.** **No dead ends / traps** — every screen has a way back, every empty state a next step, every error a what-to-do, every wizard a non-destructive Back. **No auto-logout / auto-expire mid-task** without warning. **No faking success** — "En attente de validation" says so, "Aucune modification détectée" says so, a request to DS says "envoyée", not "fait".

**Engineering NON-GOALS (stub, mark `// STUB:`, centralise in `data/` + `lib/` so the swap to a real backend is clean):**
- No real auth/backend/DB — login accepts a seed credential (or any input) and sets a mock session; invite/reset tokens validated against a hardcoded list so valid/expired/used states all demo; reload resets to seed.
- No Pennylane/billing integration — invoices are seed (HT amounts); PDF via the stub.
- No live geolocation/Maps/check-in — NOTI-03 coach-delay alerts are **seeded notifications + seeded session-journal events**, not real check-ins; any "Voir sur la carte" is a static placeholder.
- No real email/SMS/push — Nous contacter, callback requests, delete-account requests show a success toast + console log; nothing is sent.
- No DS-Admin side, no contract-approval engine, no matching algorithm, no real Excel/PDF pipeline — "En attente de validation" / "Modification en attente" are seeded statuses that never actually flip; suggested time slots (CON-08) are **precomputed seed suggestions**, not generated.
- No analytics, no service worker/PWA, no i18n beyond fr-FR.

---

# 7 · SUGGESTED BUILD ORDER (incremental, screen-by-screen)

Build and verify each step before the next; every screen ships its four states (§8) as you go.

1. **Foundation** — scaffold `apps/ehpad` (Vite + React + TS + Router), strict `tsconfig`, ESLint/jsx-a11y; copy `tokens.css` + `theme.ts`; load Anton/Oswald/Inter; `<body data-surface="ehpad">`; `global.css` (resets, `:focus-visible` ring, `.sr-only`). **Get `npm run dev` serving a "Hello" page at `http://localhost:5173` (§1.10) before writing any feature code** — confirm the local site loads first, then build onto it.
2. **Mock layer** — `types/models.ts`, the rich seed + the empty fixture, `store.ts` (subscribers), `api.ts` (latency), the three contexts, `i18n/fr.ts`, `lib/format.ts`.
3. **Primitives** — Button, TextField/Textarea, Select, Checkbox/Radio/Toggle, Rating, Card, ListItem, Avatar, Badge/StatusPill/Chip, InlineAlert/Banner, Toast, Modal/Sheet, EmptyState, Skeleton, KpiCard. Then the ⏳ set: NavRail, DataTable, Tabs/SegmentedControl, DatePicker/TimePicker, Wizard, Calendar.
4. **Shell** — `AppShell` (Sidebar + TopBar + `<Outlet/>`), responsive collapse, skip-link, breadcrumbs.
5. **Auth** — Login, Activation, Forgot/Reset, with all token/error states + the two seeded logins.
6. **Dashboard (3.2)** — KPIs, two CTAs, **Calendar** (Mois/Semaine/Liste + legend + highlight), widgets. (Highest-value screen; exercises the Calendar early.)
7. **Sessions (3.3)** — list+filters → detail (incl. journal des événements) → Coach Report modal → Edit occurrence → Postpone.
8. **Evaluations (3.4)** — pending list → the 3-tap evaluate flow (wire all on-ramps).
9. **Contracts (3.5)** — list (7 statuses) → detail → **create wizard** (incl. type de séance, exclusions, suggested slots) → edit (minor/major) → resubmit → renew → non-renewal. (Largest area; the wizard is the core reusable.)
10. **Invoices (3.7)** — overdue banner + KPIs + table/search + detail + PDF stub (all HT).
11. **Contacts (3.6)** — cards, civility tabs, roles, delete-confirm, refresh-nudge + role gating.
12. **Facility (3.8)** — profile sections (incl. read-only Groupe + EST-09 indicator) → edit (Admin-gated) → Mon compte + delete-request.
13. **Notifications (3.10) + Nous contacter (3.9)** — center with coach-delay seed + deep-links; minimal contact form.
14. **Polish pass** — role-gating sweep, color-never-alone sweep, reduced-motion sweep, responsive (320px / 200% zoom), keyboard + focus-return sweep; `tsc --noEmit` + ESLint clean.
15. **Run & view** — confirm a clean-clone `npm install && npm run dev` boots with **zero console errors**, auto-opens **`http://localhost:5173/`** on the dashboard, every sidebar route renders, and `apps/ehpad/README.md` run instructions are accurate (§1.10).

---

# 8 · DEFINITION OF DONE

**Every screen ships only when it renders all four states and passes the a11y bar:**

1. **Populated** — rich seed fixture, realistic French data, **no lorem**.
2. **Empty** — purposeful `EmptyState` (icon + plain-French explanation + a primary next action), from the empty fixture.
3. **Loading** — `Skeleton` placeholders matching the populated layout (via `api.ts` latency), **no layout shift on resolve**.
4. **Error** — `InlineAlert`/error state with a retry affordance when an `api.ts` call rejects (simulate via a debug toggle).

**Plus, for every screen:**
- **Keyboard-navigable** — logical tab order, visible token-based `:focus-visible` ring, `Esc` closes modals/sheets/drawer, focus trapped in modals and returned on close, skip-link to main.
- **WCAG AA** — ≥4.5:1 text contrast, color never the sole signal (status = icon + label + color), targets ≥44px, body ≥16px, semantic landmarks, labelled form controls, `aria-live` for toasts and async results.
- **Responsive** — verified mobile / tablet / desktop; no horizontal scroll at 320px or 200% zoom.
- **Reduced motion** respected.

**Project-level DoD:**
- **27/27 stories** present and mapped (§3.11).
- All UI copy in **French**, sourced from `i18n/fr.ts` (no hard-coded JSX strings).
- **No color-scheme toggle, no gamification, no in-app cancellation, no hard-delete, no reward-gold** — guardrails (§6) hold.
- All backend/integration seams are **stubbed and marked `// STUB:`**, centralised in `data/` + `lib/`.
- `npm run typecheck` (`tsc --noEmit`) clean, **no `any`**; ESLint (incl. `jsx-a11y`) clean.
- The app is **viewable on localhost (§1.10):** a fresh `npm install && npm run dev` boots with **zero console errors** and auto-opens **`http://localhost:5173/`** on the dashboard; every sidebar route renders; both seeded roles are demoable (Admin sees write actions; Other Contact sees them disabled with "Réservé au contact principal"); `apps/ehpad/README.md` documents how to run, switch role, switch seed fixture, and trigger loading/error states.
