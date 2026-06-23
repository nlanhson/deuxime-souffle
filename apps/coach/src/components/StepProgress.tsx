/**
 * StepProgress — a compact multi-step progress indicator for short flows.
 *
 * Renders `total` segments with the first `current` filled in the action colour and the rest left
 * as a muted track, plus a small "Étape 1 sur 2"-style label. Built for the coach sign-up header,
 * where the form is step 1 of 2 (identity → KYC documents on the pending screen) but nothing told
 * the coach how far they were. Generic on purpose: pass `current`/`total`/`label` and reuse it for
 * any other short, linear flow.
 *
 * Accessibility: the whole control is a single `progressbar` exposing min/max/now, and the visible
 * label doubles as its accessible name — so a screen reader announces "Étape 1 sur 2" once, not a
 * row of anonymous bars.
 */
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';

const S = surfaces.coach;

type Props = {
  /** How many steps are complete-or-current (1-based). Segment indices < current render filled. */
  current: number;
  /** Total number of steps. */
  total: number;
  /** Visible + accessible label, e.g. "Étape 1 sur 2". */
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function StepProgress({ current, total, label, style }: Props) {
  return (
    <View
      style={[st.wrap, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: total, now: current }}
    >
      <View style={st.track} importantForAccessibility="no-hide-descendants">
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[st.seg, i < current ? st.segOn : st.segOff]} />
        ))}
      </View>
      <Text style={st.label}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { gap: sp.xs },
  track: { flexDirection: 'row', gap: sp.xs },
  seg: { flex: 1, height: 4, borderRadius: r.pill },
  segOn: { backgroundColor: color.action },
  segOff: { backgroundColor: palette.neutral[200] },
  // Oswald medium kicker — same family as the step title, one tier down and muted.
  label: { fontFamily: 'Oswald_500Medium', fontSize: 13, letterSpacing: 0.5, color: S.textSecondary },
});
