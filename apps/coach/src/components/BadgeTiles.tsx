/**
 * Tier collection tiles — the REACHED (gold) and LOCKED (light silhouette) rung cards, shared by the
 * Progression tab's preview grid and the full Médailles page so the two can never drift.
 *
 * Presentational: copy strings + the live session count + the choreography `anim` flag are passed in.
 * Reached tiles wear the raised card wash + a rouge→or HeroMedal mini + a gold-wash "Atteint" chip;
 * locked tiles wear a grey disc + padlock + a progress meter toward the rung's session threshold,
 * with the locked state carried by icon + text (never colour alone). Sizing/layout (the 48% slot, the
 * grid) stays with the caller.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, spacing as sp, radius as r, cardGradient as RAISED_GRAD } from '../theme/theme';
import { Lock } from '../icons';
import { HeroMedal } from './HeroMedal';
import { AnimatedMeterFill } from './AnimatedMeterFill';
import type { Tier } from '../lib/gamification';

export type Anim = { animate: boolean; play: boolean };

const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const HAIR = 'rgba(24,23,21,0.07)';
const GOLD_FG = palette.or[800];
const GOLD_WASH = 'rgba(242,194,0,0.13)';

const F = {
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

export function EarnedTile({ tier, name, desc, reachedLabel }: { tier: Tier; name: string; desc: string; reachedLabel: string }) {
  return (
    <View style={st.tile} accessible accessibilityLabel={`${name}, ${reachedLabel}`}>
      <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.lg }]} pointerEvents="none" />
      <HeroMedal Icon={tier.icon} ringSize={44} ring={4} iconSize={20} />
      <Text style={st.tileName} numberOfLines={1}>{name}</Text>
      <Text style={st.tileDesc} numberOfLines={2}>{desc}</Text>
      <View style={st.dateChip}>
        <Text style={st.dateChipTxt}>{reachedLabel}</Text>
      </View>
    </View>
  );
}

export function LockedTile({ tier, name, desc, sessions, anim, ofTarget, lockedA11y }: {
  tier: Tier; name: string; desc: string; sessions: number; anim: Anim; ofTarget: string; lockedA11y: string;
}) {
  const target = tier.threshold;
  const current = Math.min(sessions, target);
  const frac = target ? current / target : 0;
  const Icon = tier.icon;
  return (
    <View
      style={st.tile}
      accessible
      accessibilityLabel={`${name}, ${lockedA11y}, ${current} ${ofTarget} ${target}`}
    >
      <View style={st.lockDisc} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon size={20} color={palette.neutral[500]} />
        <View style={st.lockBadge}>
          <Lock size={11} color={ON_CARD_2} />
        </View>
      </View>
      <Text style={st.tileNameLocked} numberOfLines={1}>{name}</Text>
      <Text style={st.tileDesc} numberOfLines={2}>{desc}</Text>
      <View style={st.lockMeterRow}>
        <AnimatedMeterFill frac={frac} play={anim.play} animate={anim.animate} height={6} style={{ flex: 1 }} a11yValue={{ min: 0, max: target, now: current }} />
        <Text style={st.lockCount}>{`${current} / ${target}`}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  tile: { flex: 1, borderRadius: r.lg, padding: sp.md, backgroundColor: palette.neutral[0], borderWidth: 1, borderColor: HAIR, overflow: 'hidden' },
  tileName: { fontFamily: F.bodyB, fontSize: 16, color: ON_CARD, marginTop: sp.sm },
  tileNameLocked: { fontFamily: F.bodyB, fontSize: 16, color: ON_CARD_2, marginTop: sp.sm },
  // Reserve two lines so 1-line and 2-line descriptions yield identically-sized cards.
  tileDesc: { fontFamily: F.body, fontSize: 13, lineHeight: 17, minHeight: 34, color: ON_CARD_2, marginTop: 2 },
  dateChip: { alignSelf: 'flex-start', backgroundColor: GOLD_WASH, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, marginTop: sp.sm },
  dateChipTxt: { fontFamily: F.bodyS, fontSize: 12, color: GOLD_FG },
  lockDisc: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.neutral[100] },
  lockBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.neutral[100], borderWidth: 1.5, borderColor: palette.neutral[0] },
  lockMeterRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.sm },
  lockCount: { fontFamily: F.oswS, fontSize: 12, color: ON_CARD_2, minWidth: 44, textAlign: 'right' },
});
