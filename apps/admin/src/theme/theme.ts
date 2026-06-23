/**
 * Le Mouvement — Deuxième Souffle · Typed design tokens
 * Shared across React Native (coach) and React (admin / EHPAD).
 * Destination once the Turborepo exists: packages/shared/theme.
 *
 * Principle: "une base, trois intensités" — one token set, three surface themes.
 * Rules baked in: body >= 16, touch targets >= 44, contrast AA.
 *
 * LOCKED DECISION (2026-06-08) — colour scheme is fixed per product, no user toggle in MVP:
 *   coach (mobile)  -> DARK
 *   ehpad (web)     -> LIGHT
 *   admin/DS (web)  -> LIGHT
 * Rule of thumb: mobile = dark, web = light. Revisit only if the client requests a toggle.
 */

export const palette = {
  rouge: { 50:'#FDECEA',100:'#FACFCB',200:'#F4A8A1',300:'#EE7B72',400:'#E85248',500:'#E1322B',600:'#C32721',700:'#9E1E19',800:'#771613',900:'#4F0E0C' },
  or:    { 50:'#FEF9E0',100:'#FDEFB0',200:'#FBE27A',300:'#F8D544',400:'#F5CB1F',500:'#F2C200',600:'#CCA300',700:'#9E7E00',800:'#6E5800',900:'#463800' },
  bleu:  { 50:'#ECF0F8',100:'#CDD8EC',200:'#A6B7DB',300:'#7B93C7',400:'#4F6DAE',500:'#2F4F92',600:'#1F3B73',700:'#182E5A',800:'#122242',900:'#0B152A' },
  vert:  { 50:'#E8F7EF',100:'#C2EAD4',200:'#93D9B5',300:'#62C795',400:'#41B47E',500:'#2F9E6B',600:'#268158',700:'#1D6444',800:'#154A32',900:'#0D2F20' },
  neutral:{ 0:'#FFFFFF',50:'#F7F4EF',100:'#EDE8E0',200:'#DED7CB',300:'#C6BDAE',400:'#A89E8D',500:'#8A8377',600:'#6B655B',700:'#4D4842',800:'#2E2B27',900:'#181715' },
} as const;

export const gradient = {
  movement: ['#E1322B', '#F2C200'] as const, // 135deg rouge -> or; signature, used on hero CTAs / medals / progress
};

/** Shared semantic aliases — never reference palette.* directly in components. */
export const color = {
  action:        palette.rouge[500],
  actionHover:   palette.rouge[600],
  actionActive:  palette.rouge[700],
  actionDisabled:palette.neutral[300],
  onAction:      palette.neutral[0],

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

export const typography = {
  family: { display: 'Anton', heading: 'Oswald', body: 'Inter' },
  weight: { display: 400, regular: 400, medium: 500, semibold: 600, bold: 700 },
  size: { caption:12, bodySm:14, body:16, bodyLg:18, subheading:20, h3:24, h2:32, h1:40, display:48, displayXl:64 },
  lineHeight: { tight:1.0, heading:1.15, snug:1.25, body:1.5, relaxed:1.6 },
  letterSpacing: { tight:'-0.01em', normal:'0', label:'0.06em' },
} as const;

export const spacing = { xs:4, sm:8, md:16, lg:24, xl:32, '2xl':48, '3xl':64 } as const;
export const radius  = { sm:8, md:12, lg:16, xl:24, '2xl':32, pill:999 } as const;
export const size    = { touchTargetMin:44, iconSm:16, iconMd:20, iconLg:24, avatarSm:32, avatarMd:48 } as const;

export const elevation = {
  level1: '0 1px 2px rgba(24,23,21,.06), 0 1px 3px rgba(24,23,21,.10)',
  level2: '0 4px 12px rgba(24,23,21,.08)',
  level3: '0 12px 32px rgba(24,23,21,.12)',
  glowAction: '0 8px 24px rgba(225,50,43,.35)',
} as const;

export const motion = {
  duration: { fast:120, base:200, slow:320 }, // ms
  easing: { standard:'cubic-bezier(0.2,0,0,1)', decelerate:'cubic-bezier(0,0,0,1)', spring:'cubic-bezier(0.2,0.8,0.2,1)' },
} as const;

/** The three intensities. Same base above; these set canvas + accent dosage. */
export const surfaces = {
  coach: {
    platform: 'mobile',
    colorScheme: 'dark',             // LOCKED — mobile = dark
    canvas: palette.neutral[900],
    surface: palette.neutral[800],
    surfaceRaised: palette.neutral[0],
    surfaceInteractive: palette.neutral[700], // tappable chip/ghost inside a surface card — SPEC §4.7
    textPrimary: palette.neutral[50],
    textSecondary: palette.neutral[300],
    accent: color.action,            // red dominant — the engine
    // Raised-card text polarity — white cards (hero, session) sit on the ink canvas, so their
    // text flips to dark ink rather than the crème textPrimary. SPEC §4.2.
    textOnRaised: palette.neutral[900],
    textOnRaisedSecondary: palette.neutral[600],
    // Status colors retuned for the ink canvas — the global semantic tokens are light-surface
    // tuned and read muddy on #181715. These stay AA on the canvas (SPEC §4.1):
    // vert-300 ≈ 8.3:1, or-300 ≈ 13:1, bleu-200 ≈ 7:1.
    successOnInk:       palette.vert[300],
    successOnInkBg:     'rgba(47,158,107,0.16)',
    warningOnInk:       palette.or[300],
    warningOnInkBg:     'rgba(242,194,0,0.13)',
    warningOnInkBorder: 'rgba(242,194,0,0.35)',
    infoOnInk:          palette.bleu[200],
    infoOnInkBg:        'rgba(166,183,219,0.14)',
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

export const theme = { palette, gradient, color, typography, spacing, radius, size, elevation, motion, surfaces };
export default theme;
