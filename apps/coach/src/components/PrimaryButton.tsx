/**
 * PrimaryButton — the app's ONE primary-action style.
 *
 * A red-dominant gradient pill with a rouge glow: rouge holds 0→70% of the diagonal, then a
 * soft ~30% ramp into the brand GOLD in the bottom-right corner (locations [0.7, 1]) — the
 * moodboard's signature rouge→or "movement" gesture (DT-02). The label stays centred over the
 * rouge field, so white-on-red contrast holds; the gold is a corner accent, never under the text.
 * This is the single source of truth for the main call-to-action on any screen, so every primary
 * button looks identical. Secondary (outline) and ghost (low-emphasis) buttons stay separate
 * by design — the gradient is reserved for the one dominant action per context.
 *
 * Sizing is left to the caller via `style` (e.g. `{ flex: 1 }` / `{ flex: 2 }` in a CTA row).
 */
import React from 'react';
import { View, Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, color, gradient, radius as r, spacing as sp } from '../theme/theme';

// Rouge holds the field; the bottom-right corner ramps into the brand gold — the moodboard's
// rouge→or signature (DT-02). Sourced from theme `gradient.cta` (the single source of truth shared
// with <GradientFill/>), so the CTA, the inline/circular action buttons, the level meter and the
// medals all read as one gesture. Label centres over the rouge field, so contrast is unaffected.
const CTA_COLORS = gradient.cta.colors;
const CTA_LOCATIONS = gradient.cta.locations;

type Props = {
  label: string;
  onPress?: () => void;
  /** Sizing/layout from the caller — e.g. `{ flex: 1 }` to share a row. */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
  /** Smaller height + label (still ≥44 touch target) for tighter CTA rows. */
  compact?: boolean;
  /** Optional icon rendered to the left of the label. */
  icon?: React.ReactNode;
};

export function PrimaryButton({ label, onPress, style, accessibilityLabel, disabled, compact, icon }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [st.wrap, compact && st.wrapCompact, style, disabled && { opacity: 0.5 }, pressed && !disabled && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <LinearGradient
        colors={CTA_COLORS}
        locations={CTA_LOCATIONS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[st.btn, compact && st.btnCompact]}
      >
        {icon ? (
          <View style={st.row}>
            {icon}
            <Text style={[st.txt, compact && st.txtCompact]} numberOfLines={1}>{label}</Text>
          </View>
        ) : (
          <Text style={[st.txt, compact && st.txtCompact]} numberOfLines={1}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const st = StyleSheet.create({
  wrap: {
    borderRadius: r.button,
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 12,
  },
  // Compact = tighter rows (e.g. inline session cards): quieter glow so the button reads as
  // present, not dominant.
  wrapCompact: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8 },
  btn: {
    minHeight: 52, borderRadius: r.button, paddingHorizontal: sp.md,
    alignItems: 'center', justifyContent: 'center',
  },
  btnCompact: { minHeight: 44, paddingHorizontal: sp.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txt: {
    fontFamily: 'Inter_600SemiBold', fontSize: 16,
    letterSpacing: 0.2, color: color.onAction,
  },
  txtCompact: { fontSize: 16 },
});
