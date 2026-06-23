/**
 * GradientFill — the rouge→or "movement" CTA fill (DT-02), absolutely positioned to sit BEHIND a
 * button's label/icon.
 *
 * Drop it as the FIRST child of any Pressable/View, then render the content (Text/icon) after it so
 * the content paints on top. Match `radius` to the button's own borderRadius (default = r.button;
 * pass 999 for circular "Raise hand" actions) so the gradient's corners line up with the button.
 * The host view keeps its `backgroundColor` as a one-frame fallback / iOS shadow caster — the
 * gradient covers it once mounted.
 *
 * Single source of truth = theme `gradient.cta`, shared with <PrimaryButton/>, so every primary
 * action button across the app shows the identical brand gesture and cannot drift.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { gradient, radius as r } from '../theme/theme';

export function GradientFill({ radius = r.button }: { radius?: number }) {
  return (
    <LinearGradient
      colors={gradient.cta.colors}
      locations={gradient.cta.locations}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      pointerEvents="none"
    />
  );
}
