/**
 * HeroMedal — the app's medal/medallion: a rouge→or "movement" gradient RING around a white disc
 * with a gold (or[800]) Lucide icon.
 *
 * Single source for every medal moment so they never drift: the BadgeCelebration unlock overlay
 * (104), the Progression ink-hero medallion (116), the next-badge spotlight (56) and the earned-tile
 * mini-medals (44). The gradient is the signature gesture the theme reserves for medals / progress —
 * keep it ONLY on medals and meters. Purely presentational (no a11y surface of its own; the caller
 * labels the surrounding context).
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette } from '../theme/theme';
import type { LucideIcon } from '../icons';

const MOVEMENT = [palette.rouge[500], palette.or[500]] as const; // signature gradient (medals / progress)
const GOLD_FG = palette.or[800]; // dark gold — AA on the white disc

export function HeroMedal({
  Icon,
  ringSize = 104,
  ring = 6,
  iconSize = 42,
  innerColor = palette.neutral[0],
  iconColor = GOLD_FG,
}: {
  Icon: LucideIcon;
  ringSize?: number;
  ring?: number;
  iconSize?: number;
  innerColor?: string;
  iconColor?: string;
}) {
  const innerSize = ringSize - ring * 2;
  return (
    <LinearGradient
      colors={MOVEMENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[st.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
      // Purely decorative — the surrounding context carries the label. Hide on both platforms so
      // it never grabs a stray (label-less) focus stop on Android TalkBack.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[st.inner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2, backgroundColor: innerColor }]}>
        <Icon size={iconSize} color={iconColor} />
      </View>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
  inner: { alignItems: 'center', justifyContent: 'center' },
});
