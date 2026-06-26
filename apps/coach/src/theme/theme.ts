/**
 * Le Mouvement — Deuxième Souffle · Typed design tokens
 *
 * ⚠️ VENDORED COPY of project/design-system/theme.ts (canonical source).
 *    When the Turborepo lands, delete this and import from packages/shared/theme.
 *    Keep in sync with the canonical file until then.
 *
 * Shared across React Native (coach) and React (admin / EHPAD).
 * Destination once the Turborepo exists: packages/shared/theme.
 *
 * Principle: "une base, trois intensités" — one token set, three surface themes.
 * Rules baked in: body >= 16, touch targets >= 44, contrast AA.
 *
 * COLOUR SCHEME (updated 2026-06-16) — fixed per product, no user toggle in MVP:
 *   coach (mobile)  -> LIGHT   (flipped from dark on 2026-06-16)
 *   ehpad (web)     -> LIGHT
 *   admin/DS (web)  -> LIGHT
 * All three surfaces now sit on the warm-paper light canvas. Revisit only if the client
 * requests a toggle.
 */

export const palette = {
  // 500 re-anchored to the BRAND CHART RED #EA3829 (Coach v2 — 2026-06-26). The ramp stays
  // monotonic (400 lighter, 600+ darker) so the action/hover/active chain and the on-paper danger
  // step (rouge[600]) remain AA. ⚠️ COACH-ONLY divergence: admin / ehpad / project/design-system
  // theme.ts still hold #E1322B — do NOT "re-sync" this back; brand-wide adoption is a separate,
  // QA'd pass (EHPAD today-circle gradient + admin destructive reds need their own review).
  rouge: { 50:'#FDECEA',100:'#FACFCB',200:'#F4A8A1',300:'#EE7B72',400:'#E85248',500:'#EA3829',600:'#C32721',700:'#9E1E19',800:'#771613',900:'#4F0E0C' },
  or:    { 50:'#FEF9E0',100:'#FDEFB0',200:'#FBE27A',300:'#F8D544',400:'#F5CB1F',500:'#F2C200',600:'#CCA300',700:'#9E7E00',800:'#6E5800',900:'#463800' },
  bleu:  { 50:'#ECF0F8',100:'#CDD8EC',200:'#A6B7DB',300:'#7B93C7',400:'#4F6DAE',500:'#2F4F92',600:'#1F3B73',700:'#182E5A',800:'#122242',900:'#0B152A' },
  vert:  { 50:'#E8F7EF',100:'#C2EAD4',200:'#93D9B5',300:'#62C795',400:'#41B47E',500:'#2F9E6B',600:'#268158',700:'#1D6444',800:'#154A32',900:'#0D2F20' },
  // Warm "paper" ramp — the brand light system (matches admin / ehpad and the brand palette:
  // CREAM #F7F4EF = breathing/canvas, MOLE #8A8377 = secondary at 500, BLACK RING #181715 = text
  // at 900). Now that coach is LIGHT (not dark), it shares this warm taupe ramp end-to-end rather
  // than the cool true-greys the dark build used.
  neutral:{ 0:'#FFFFFF',50:'#F7F4EF',100:'#EDE8E0',200:'#DED7CB',300:'#C6BDAE',400:'#A89E8D',500:'#8A8377',600:'#6B655B',700:'#4D4842',800:'#2E2B27',900:'#181715' },
} as const;

export const gradient = {
  // 135deg rouge -> or; signature, used on hero CTAs / medals / progress. Wired to palette refs
  // (was a hard-coded ['#E1322B','#F2C200']) so it follows the brand-red anchor and never drifts
  // from the ~8 local MOVEMENT=[rouge[500],or[500]] re-declarations across the app.
  movement: [palette.rouge[500], palette.or[500]] as const,
  // Primary-CTA fill (DT-02): rouge holds 0→70% of the diagonal, then a soft ramp into the brand
  // gold in the bottom-right corner. A centred white label sits over the rouge field, so contrast
  // holds. SINGLE SOURCE for every primary action button — consumed by <PrimaryButton/> and
  // <GradientFill/>. Same rouge/or pair as `movement`, but corner-weighted for buttons.
  cta: { colors: [palette.rouge[500], palette.or[500]] as const, locations: [0.7, 1] as const },
};

/** Shared semantic aliases — never reference palette.* directly in components. */
export const color = {
  action:        palette.rouge[500],
  actionHover:   palette.rouge[600],
  actionActive:  palette.rouge[700],
  actionDisabled:palette.neutral[300],
  onAction:      palette.neutral[0],
  // Brand-red (#EA3829 = rgb 234,56,41) wash tints — single source for the red chip / tag / banner
  // fills that used to be hard-coded rgba(225,50,43,…) (the old #E1322B in decimal, which would
  // have drifted cool against the new anchor). Use these instead of raw rgba going forward.
  actionWashWeak:   'rgba(234,56,41,0.08)',
  actionWashMed:    'rgba(234,56,41,0.14)',
  actionWashStrong: 'rgba(234,56,41,0.22)',

  reward:        palette.or[500],
  rewardStrong:  palette.or[600],
  onReward:      palette.neutral[900],

  info:          palette.bleu[600],
  infoSoft:      palette.bleu[100],
  progress:      palette.vert[500],
  progressStrong:palette.vert[600],
  progressSoft:  palette.vert[100],

  danger:        palette.rouge[700], // destructive: darkest red + icon/label, never colour alone
  dangerSoft:    palette.rouge[50],
  warning:       palette.or[600],
  warningSoft:   palette.or[50],

  textPrimary:   palette.neutral[900],
  textSecondary: palette.neutral[600],
  textMuted:     palette.neutral[500],
  textOnInk:     palette.neutral[50],

  borderSubtle:  palette.neutral[200],
  borderStrong:  palette.neutral[300],
} as const;

/**
 * Coach v2 status-card tones — the "liseré de statut" system. ONE source for the 3px left rail +
 * filled-tint chip across every list card (Séances, Notifications, Disponibles, Revenus, Accueil,
 * Profil). Promotes the per-screen INK maps (SeancesScreen / SettingsScreen / NotificationCenter)
 * into a single token. Two variants: `paper` (cards on cream) and `ink` (cards on the dark band).
 * Contract: colour is NEVER the only signal — every chip pairs the tone with an icon + a word, and
 * the rail is additive on top of that. Foregrounds are AA on their surface.
 *   ok = confirmée (green) · danger = action requise (red) · pending = à venir (amber)
 *   info = check-in / in-process (blue) · neutral = passé / clôturé (grey)
 * `rail` = left-border colour · `fg` = chip text/icon · `bg` = chip fill.
 */
export const statusTones = {
  paper: {
    ok:      { rail: palette.vert[700],    fg: palette.vert[700],    bg: 'rgba(47,158,107,0.16)' },
    danger:  { rail: palette.rouge[600],   fg: palette.rouge[600],   bg: color.actionWashMed },
    pending: { rail: palette.or[800],      fg: palette.or[800],      bg: 'rgba(242,194,0,0.13)' },
    info:    { rail: palette.bleu[700],    fg: palette.bleu[700],    bg: 'rgba(166,183,219,0.14)' },
    neutral: { rail: palette.neutral[400], fg: palette.neutral[600], bg: 'rgba(156,156,156,0.16)' },
  },
  ink: {
    ok:      { rail: palette.vert[300],    fg: palette.vert[300],    bg: 'rgba(47,158,107,0.22)' },
    danger:  { rail: palette.rouge[400],   fg: palette.rouge[300],   bg: 'rgba(234,56,41,0.26)' },
    pending: { rail: palette.or[300],      fg: palette.or[300],      bg: 'rgba(242,194,0,0.20)' },
    info:    { rail: palette.bleu[200],    fg: palette.bleu[200],    bg: 'rgba(166,183,219,0.22)' },
    neutral: { rail: palette.neutral[300], fg: palette.neutral[300], bg: 'rgba(255,255,255,0.10)' },
  },
} as const;

export type StatusTone = keyof (typeof statusTones)['paper'];
export type CardSurface = keyof typeof statusTones;

export const typography = {
  family: { display: 'Anton', heading: 'Oswald', body: 'Inter' },
  weight: { display: 400, regular: 400, medium: 500, semibold: 600, bold: 700 },
  size: { caption:12, bodySm:14, body:16, bodyLg:18, subheading:20, h3:24, h2:32, h1:40, display:48, displayXl:64 },
  lineHeight: { tight:1.0, heading:1.15, snug:1.25, body:1.5, relaxed:1.6 },
  letterSpacing: { tight:'-0.01em', normal:'0', label:'0.06em' },
} as const;

export const spacing = { xs:4, sm:8, md:16, lg:24, xl:32, '2xl':48, '3xl':64 } as const;
export const radius  = { sm:8, md:12, lg:16, xl:24, '2xl':32, pill:999, button:14 } as const;

/** Apple-style card corner — ONE radius + value for every content card across the app.
 *  `radius.lg` (16) is the modern Apple card value (SwiftUI `RoundedRectangle(cornerRadius: 16,
 *  style: .continuous)`); `borderCurve: 'continuous'` is iOS's superellipse/squircle smoothing
 *  (no-op on Android). Every card surface — StatusCard, stat tiles, hero/premium panels, modal +
 *  onboarding cards — spreads this so corners stay uniform and can never drift. Non-cards (pills,
 *  buttons, avatars, progress bars, inputs) keep their own radii and do NOT use this. */
export const CARD_RADIUS = radius.lg;
export const cardShape = { borderRadius: CARD_RADIUS, borderCurve: 'continuous' } as const;
export const size    = { touchTargetMin:44, iconSm:16, iconMd:20, iconLg:24, avatarSm:32, avatarMd:48 } as const;

export const elevation = {
  level1: '0 1px 2px rgba(24,23,21,.06), 0 1px 3px rgba(24,23,21,.10)',
  level2: '0 4px 12px rgba(24,23,21,.08)',
  level3: '0 12px 32px rgba(24,23,21,.12)',
  // Coach v2 list-card "ombre douce" (web-string parity with shadow.card below).
  card: '0 1px 2px rgba(24,23,21,.05), 0 6px 16px rgba(24,23,21,.07)',
  glowAction: '0 8px 24px rgba(234,56,41,.35)', // brand red #EA3829 in decimal
} as const;

/** Coach v2 RN soft card shadow ("ombre douce"). RN-shaped (shadow* for iOS, elevation for Android).
 *  SINGLE SOURCE — the list <StatusCard> and its skeleton both import this so the skeleton→content
 *  swap can't pop (flat ghost → shadowed card). Deliberate scoped reversal of the old "shadow only
 *  on overlays" house rule, for Coach v2 list cards only; heroes/sheets/stat tiles stay flat. */
export const shadow = {
  card: {
    shadowColor: palette.neutral[900],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
} as const;

export const motion = {
  duration: { fast:120, base:200, slow:320 }, // ms
  easing: { standard:'cubic-bezier(0.2,0,0,1)', decelerate:'cubic-bezier(0,0,0,1)', spring:'cubic-bezier(0.2,0.8,0.2,1)' },
} as const;

/** The three intensities. Same base above; these set canvas + accent dosage. */
export const surfaces = {
  coach: {
    platform: 'mobile',
    // Typed as the wider union (not the 'light' literal) so screens can keep their
    // `colorScheme === 'dark'` branches — those hold the correct light-mode values and make a
    // future flip back to dark a one-line change. See VOLATILE colour-scheme history.
    colorScheme: 'light' as 'light' | 'dark', // FLIPPED 2026-06-16 — coach moved to light
    canvas: palette.neutral[50],     // warm paper, matches admin / ehpad
    surface: palette.neutral[0],     // white cards
    surfaceRaised: palette.neutral[0],
    textPrimary: palette.neutral[900],
    textSecondary: palette.neutral[600],
    accent: color.action,            // red dominant — the engine
    // Ink accent surface (DT-01) — the moodboard's "fond ink dramatique", DOSED as a hero band on
    // the cream base rather than the whole canvas. Cream breathes, ink dramatizes; white-on-ink is
    // AA per the moodboard ("texte foncé sur crème, blanc sur ink"). Use for hero/identity moments
    // only (Home top, next-session hero, level header) — never as a default screen background.
    ink: {
      bg: palette.neutral[900],                 // #181715 noir ring — the dramatic stage
      surfaceRaised: 'rgba(255,255,255,0.06)',  // a nested panel one step up from the ink
      textPrimary: palette.neutral[0],          // white — headings + figures
      textSecondary: palette.neutral[300],      // #C6BDAE — warm muted on ink (AA on #181715)
      border: 'rgba(255,255,255,0.12)',         // hairline divider / nested-panel edge on ink
      level: palette.or[300],                   // gold reads as reward on ink
    },
  },
  admin: {
    platform: 'desktop',
    colorScheme: 'light',            // LOCKED — web = light
    canvas: palette.neutral[50],
    surface: palette.neutral[0],
    textPrimary: palette.neutral[900],
    accent: color.action,            // red rare — active item + alerts
    dataLead: palette.or[500],        // KPIs / charts in gold
  },
  ehpad: {
    platform: 'tablet',
    colorScheme: 'light',            // LOCKED — web = light
    canvas: palette.neutral[50],
    surface: palette.neutral[0],
    textPrimary: palette.neutral[900],
    accent: color.info,              // blue leads — red near-absent
    accentSecondary: color.progress, // green = santé / progrès
  },
} as const;

export type SurfaceName = keyof typeof surfaces;

/** Shared raised-card gradient (top-lit → base). Light surface: white fading to a hair of warm
 *  paper, so cards read as crisp white panels with the faintest top-lit depth. Cards still carry a
 *  hairline border for separation against the paper canvas (house style = flat bordered cards).
 *  Single source of truth — every card (Home, Séances, Disponibles, Revenus, modals) imports this. */
export const cardGradient = ['#FFFFFF', '#FBFAF7'] as const;

export const theme = { palette, gradient, color, typography, spacing, radius, CARD_RADIUS, cardShape, size, elevation, shadow, motion, surfaces, cardGradient, statusTones };
export default theme;
