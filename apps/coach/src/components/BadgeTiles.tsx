/**
 * Tier collection tiles — the REACHED (gold) and LOCKED (light silhouette) rung cards, shared by the
 * Progression tab's preview grid and the full Médailles page so the two can never drift.
 *
 * Coach v2 "système de carte type": each tile is now a <StatusCard> (white card, soft shadow, 3px
 * left liseré). The rung's standing maps to a status tone — reached -> 'ok' (green), the NEXT
 * in-progress rung -> 'pending' (amber), future/locked rungs -> 'neutral' (grey, no rail). The rail
 * is ADDITIVE: reached tiles keep their gold HeroMedal + gold "Atteint" tag (reward = a gold
 * ATTRIBUTE, not a 5th rail colour), locked tiles keep the padlock + meter + count, so status is
 * never carried by colour alone.
 *
 * Presentational: copy strings + the live session count + the choreography `anim` flag are passed in;
 * `isNext` (first locked rung) is decided by the caller. Sizing/layout (the 48% slot, the grid) stays
 * with the caller.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { palette, spacing as sp, radius as r } from '../theme/theme';
import { Lock } from '../icons';
import { StatusCard } from './StatusCard';
import { HeroMedal } from './HeroMedal';
import { AnimatedMeterFill } from './AnimatedMeterFill';
import type { Tier } from '../lib/gamification';

export type Anim = { animate: boolean; play: boolean };

const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const GOLD_FG = palette.or[800];
const GOLD_WASH = 'rgba(242,194,0,0.13)';

const F = {
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

export function EarnedTile({ tier, name, desc, reachedLabel, showRail = true }: { tier: Tier; name: string; desc: string; reachedLabel: string; showRail?: boolean }) {
  // Reached rung -> 'ok' liseré. The gold medal + gold "Atteint" tag are the REWARD attribute (gold),
  // layered on top of the green status rail — gold is not a 5th rail colour. `showRail` lets a caller
  // (Profile) drop the liseré while keeping the white card + soft shadow.
  return (
    <StatusCard status="ok" leftBorder={showRail} radius={r.lg} style={st.tile} accessibilityLabel={`${name}, ${reachedLabel}`}>
      <HeroMedal Icon={tier.icon} ringSize={44} ring={4} iconSize={20} />
      <Text style={st.tileName} numberOfLines={1}>{name}</Text>
      <Text style={st.tileDesc} numberOfLines={2}>{desc}</Text>
      <View style={st.dateChip}>
        <Text style={st.dateChipTxt}>{reachedLabel}</Text>
      </View>
    </StatusCard>
  );
}

export function LockedTile({ tier, name, desc, sessions, anim, ofTarget, lockedA11y, isNext, showRail = true }: {
  tier: Tier; name: string; desc: string; sessions: number; anim: Anim; ofTarget: string; lockedA11y: string;
  /** The NEXT rung (first locked one) — the in-progress tile, so it earns the 'pending' (amber) rail.
   *  Future locked rungs stay 'neutral' (grey, no rail). The padlock + meter still carry "locked", so
   *  the rail is additive, never colour-alone. */
  isNext?: boolean;
  /** Drop the left liseré (Profile asks for rail-less tiles); the white card + soft shadow stay. */
  showRail?: boolean;
}) {
  const target = tier.threshold;
  const current = Math.min(sessions, target);
  const frac = target ? current / target : 0;
  const Icon = tier.icon;
  return (
    <StatusCard
      status={isNext ? 'pending' : 'neutral'}
      leftBorder={showRail}
      radius={r.lg}
      style={st.tile}
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
    </StatusCard>
  );
}

const st = StyleSheet.create({
  // Layout only — the white surface, radius, soft shadow, hairline and sp.md padding now come from
  // the wrapping <StatusCard>.
  tile: { flex: 1 },
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
