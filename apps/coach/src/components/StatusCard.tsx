/**
 * StatusCard — the Coach v2 "système de carte type" (Carte #FFF · radius 16 Apple-continuous · ombre
 * douce · liseré 3px · chips pleins). Corner is single-sourced from theme `cardShape`/`CARD_RADIUS`
 * (16 + borderCurve:'continuous') so every card in the app shares one Apple-style corner.
 *
 * ONE card frame, reused across every list screen (Séances, Notifications, Disponibles, Revenus,
 * Accueil, Profil). It is a SURFACE primitive — a white card raised on the cream canvas with a soft
 * shadow and a 3px left status rail ("liseré de statut") — and it renders whatever each screen needs
 * as `children`. Screens keep their bespoke internal layout (time rails, icon discs, apply circles)
 * but all share this consistent frame + status system. Pair with <StatusChip> for the filled-tint
 * status pills (replaces the per-screen INK chip maps).
 *
 * Two surfaces: `paper` (white card on cream — the default, soft-shadowed) and `ink` (a nested panel
 * on the dark hero band — flat). Two kinds: `status` (carries the liseré) and `neutral` (info / stat
 * / sheet cards — no rail, flat by default), so the rail stays MEANINGFUL (a rail on every card is
 * noise). Colour is never the only signal: the rail is additive to the chip's icon + word.
 *
 * Soft shadow is a deliberate, SCOPED reversal of the old "flat bordered cards, shadow only on
 * overlays" house rule — for Coach v2 list cards only (`elevated`, default true on paper). It is
 * single-sourced from theme `shadow.card` so the matching skeleton can't drift.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  palette, spacing as sp, radius as r, CARD_RADIUS, shadow, statusTones, cardGradient as RAISED_GRAD,
  surfaces, type StatusTone, type CardSurface,
} from '../theme/theme';
import type { LucideIcon } from '../icons';

const S = surfaces.coach;
const F = { body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold' };

// Standardized card hairline — retires the old 0.07 variant so cards + skeletons finally agree.
const HAIRLINE = 'rgba(24,23,21,0.10)';
const RAIL_W = 3; // PDF: "liseré 3px"

export type { StatusTone, CardSurface };

export interface StatusCardProps {
  /** When set, drives the left rail colour (and implies kind='status'). */
  status?: StatusTone;
  /** 'status' carries the liseré; 'neutral' (info/stat/sheet cards) has none. Defaults from `status`. */
  kind?: 'status' | 'neutral';
  /** 'paper' (white on cream, default) | 'ink' (nested panel on the dark band). */
  surface?: CardSurface;
  /** Soft shadow ("ombre douce"). Defaults: true on paper, false on ink. */
  elevated?: boolean;
  /** Override whether the 3px status rail shows. Default = it's a status card with a status. */
  leftBorder?: boolean;
  /** Corner radius. Apple-style card default = 16 (CARD_RADIUS). Overridable, but cards should stay uniform. */
  radius?: number;
  /** Apply the default card padding (sp.md). Pass false to control padding via `contentStyle`/children. */
  padded?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** Outer style — margins, width, marginBottom between cards. */
  style?: StyleProp<ViewStyle>;
  /** Inner content style — padding overrides etc. */
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { expanded?: boolean; disabled?: boolean };
  testID?: string;
  children?: React.ReactNode;
}

export function StatusCard({
  status, kind, surface = 'paper', elevated, leftBorder, radius = CARD_RADIUS, padded = true,
  onPress, disabled, style, contentStyle, accessibilityLabel, accessibilityHint, accessibilityState,
  testID, children,
}: StatusCardProps) {
  const ink = surface === 'ink';
  const resolvedKind = kind ?? (status ? 'status' : 'neutral');
  const showRail = leftBorder ?? (resolvedKind === 'status' && !!status);
  const isElevated = elevated ?? !ink; // paper lifts; ink stays flat (it sits on the dark hero)
  const rail = showRail && status ? statusTones[surface][status].rail : undefined;

  const cardBg = ink ? S.ink.surfaceRaised : palette.neutral[0];
  const hair = ink ? S.ink.border : HAIRLINE;

  const inner = (
    <View style={[st.inner, { borderRadius: radius, borderCurve: 'continuous', borderColor: hair, backgroundColor: cardBg }]}>
      {/* top-lit raised-paper gradient (paper only) — crisp white fading to a hair of warm paper */}
      {!ink ? (
        <LinearGradient colors={RAISED_GRAD} style={StyleSheet.absoluteFill} pointerEvents="none" />
      ) : null}
      {/* status liseré */}
      {rail ? <View style={[st.rail, { backgroundColor: rail }]} pointerEvents="none" /> : null}
      <View style={[padded && st.pad, contentStyle]}>{children}</View>
    </View>
  );

  const outer: StyleProp<ViewStyle> = [
    { borderRadius: radius, borderCurve: 'continuous' },
    isElevated && !ink ? { backgroundColor: palette.neutral[0], ...shadow.card } : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
        testID={testID}
        style={({ pressed }) => [outer, pressed && !disabled ? { opacity: 0.94 } : null]}
      >
        {inner}
      </Pressable>
    );
  }
  return (
    <View style={outer} accessibilityLabel={accessibilityLabel} testID={testID}>
      {inner}
    </View>
  );
}

const st = StyleSheet.create({
  // overflow:hidden clips the gradient + rail to the rounded corners; the shadow lives on the OUTER
  // view (no clip) so it can cast beyond the card.
  inner: { overflow: 'hidden', borderWidth: 1 },
  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: RAIL_W },
  pad: { padding: sp.md },
});

/* ─────────────────────────────────────────────────────────────────────────────────────────────
 * StatusChip — the filled-tint status pill ("chips pleins"). Single source for the green/amber/blue/
 * red/grey status pills that were re-implemented per screen (Séances INK, Settings INK, Notif TYPE).
 * Never colour alone: pass an `icon` (preferred) or `dot` so the tone is carried by shape too.
 * ───────────────────────────────────────────────────────────────────────────────────────────── */
export function StatusChip({
  tone, label, icon: Icon, surface = 'paper', dot, style,
}: {
  tone: StatusTone;
  label: string;
  icon?: LucideIcon;
  surface?: CardSurface;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = statusTones[surface][tone];
  return (
    <View style={[chip.pill, { backgroundColor: t.bg }, style]}>
      {Icon ? (
        <Icon size={13} color={t.fg} />
      ) : dot ? (
        <View style={[chip.dot, { backgroundColor: t.fg }]} />
      ) : null}
      <Text style={[chip.txt, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const chip = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: r.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: r.pill },
  txt: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.1 },
});
