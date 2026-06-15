/**
 * PrimaryButton — the app's ONE primary-action style.
 *
 * A red-dominant gradient pill with a rouge glow: rouge holds 0→70% of the diagonal, then a
 * soft ~30% ramp into the orange ember in the bottom-right corner (locations [0.7, 1]). This is
 * the single source of truth for the main call-to-action on any screen, so every primary
 * button looks identical. Secondary (outline) and ghost (low-emphasis) buttons stay separate
 * by design — the gradient is reserved for the one dominant action per context.
 *
 * Sizing is left to the caller via `style` (e.g. `{ flex: 1 }` / `{ flex: 2 }` in a CTA row).
 */
import React from 'react';
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, color, radius as r, spacing as sp } from '../theme/theme';

// Rouge holds the field; the bottom-right ember now ramps into orange (not the gold Or token).
const CTA_ORANGE = '#F5821F';                       // warm ember orange for the CTA corner
const CTA_COLORS = [palette.rouge[500], CTA_ORANGE] as const;
const CTA_LOCATIONS = [0.7, 1] as const;

type Props = {
  label: string;
  onPress?: () => void;
  /** Sizing/layout from the caller — e.g. `{ flex: 1 }` to share a row. */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
  /** Smaller height + label (still ≥44 touch target) for tighter CTA rows. */
  compact?: boolean;
};

export function PrimaryButton({ label, onPress, style, accessibilityLabel, disabled, compact }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [st.wrap, style, disabled && { opacity: 0.5 }, pressed && !disabled && { opacity: 0.9 }]}
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
        <Text style={[st.txt, compact && st.txtCompact]} numberOfLines={1}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const st = StyleSheet.create({
  wrap: {
    borderRadius: r.pill,
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 12,
  },
  btn: {
    minHeight: 52, borderRadius: r.pill, paddingHorizontal: sp.md,
    alignItems: 'center', justifyContent: 'center',
  },
  btnCompact: { minHeight: 44, paddingHorizontal: sp.sm },
  txt: {
    fontFamily: 'Inter_600SemiBold', fontSize: 16,
    letterSpacing: 0.2, color: color.onAction,
  },
  txtCompact: { fontSize: 15 },
});
