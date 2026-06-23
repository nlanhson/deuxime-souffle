/**
 * LevelCard — the coach's current TIER + progress toward the next rung (Bronze → Argent → Or →
 * Platine → Diamant). (Name kept for its single consumer, the Profil tab; it shows a tier now, not a
 * numeric level.)
 *
 * A gold tier badge, the session readout, and the signature rouge→or progress meter; the whole card
 * taps through to the gamification surface. The WBS puts the coach's standing "on the coach profile
 * with a progress indicator to the next rung", so it's a shared treatment (DT-17: one prominent gold
 * card, no drift).
 *
 * Self-contained: it derives everything from the LIVE session count (useCompletedSessions) + the
 * ladder helpers, so a caller only passes `onPress`. Recognition only — never pay.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, spacing as sp, radius as r } from '../theme/theme';
import { useCopy } from '../i18n';
import { ChevronRight } from '../icons';
import { currentTier, nextTier, sessionsToNext, tierProgress, TIERS, TIER_COUNT } from '../lib/gamification';
import { useCompletedSessions } from '../lib/badgeCelebration';

const MOVEMENT = [palette.rouge[500], palette.or[500]] as const; // signature gradient (medals / progress)
const F = { oswB: 'Oswald_700Bold', oswS: 'Oswald_600SemiBold', body: 'Inter_400Regular' };

export function LevelCard({ onPress, style }: { onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const copy = useCopy();
  const c = copy.game;
  const sessions = useCompletedSessions();

  const cur = currentTier(sessions) ?? TIERS[0]; // pre-Bronze is mock-impossible; fall back gracefully
  const nxt = nextTier(sessions);
  const curName = c.tiers[cur.key].name;
  const TierIcon = cur.icon;

  const remaining = sessionsToNext(sessions);
  const readout = nxt ? `${sessions} / ${nxt.threshold}` : c.maxedReadout;
  const caption = nxt
    ? `${remaining} ${remaining <= 1 ? c.toNextOne : c.toNextN} ${c.tiers[nxt.key].name}`
    : c.maxedCaption;

  return (
    <Pressable
      style={({ pressed }) => [st.card, style, pressed && { opacity: 0.92 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${copy.header.levelA11y}. ${c.tierPrefix} ${curName}. ${caption}.`}
    >
      <View style={st.head}>
        <View style={st.pill}>
          <TierIcon size={13} color={palette.neutral[900]} />
          <Text style={st.pillTxt}>{curName}</Text>
        </View>
        <View style={st.ptsRow}>
          <Text style={st.pts}>{readout}</Text>
          <ChevronRight size={18} color={palette.neutral[400]} />
        </View>
      </View>
      <View
        style={st.meter}
        accessibilityRole="progressbar"
        accessibilityValue={nxt ? { min: 0, max: nxt.threshold, now: sessions } : { min: 0, max: TIER_COUNT, now: TIER_COUNT }}
      >
        <LinearGradient colors={MOVEMENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[st.meterFill, { width: `${Math.round(tierProgress(sessions) * 100)}%` }]} />
      </View>
      <Text style={st.caption}>{caption}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  // Flat bordered card matching the Profile settings cards: r.xl corners + a 10% translucent
  // hairline (no shadow).
  card: { backgroundColor: palette.neutral[0], borderRadius: r.xl, padding: sp.md, borderWidth: 1, borderColor: 'rgba(24,23,21,0.10)' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.or[300], paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill },
  pillTxt: { fontFamily: F.oswB, fontSize: 13, letterSpacing: 0.4, color: palette.neutral[900], textTransform: 'uppercase' },
  ptsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pts: { fontFamily: F.oswS, fontSize: 16, color: palette.neutral[600] },
  meter: { height: 10, borderRadius: r.pill, backgroundColor: palette.neutral[200], overflow: 'hidden', marginTop: sp.md },
  meterFill: { height: '100%', borderRadius: r.pill },
  caption: { fontFamily: F.body, fontSize: 13, color: palette.neutral[600], marginTop: sp.sm },
});
