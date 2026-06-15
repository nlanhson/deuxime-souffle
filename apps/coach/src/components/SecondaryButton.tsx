/**
 * SecondaryButton — the app's secondary (outline) action, paired under the PrimaryButton.
 *
 * Transparent fill + a 1.5px neutral hairline + light label: clearly subordinate to the rouge
 * gradient PrimaryButton, but still a real button (not a text link). This is the single source for
 * the outline button so every secondary CTA matches — the inline `secondaryBtn` styles already used
 * on Accueil / Séances follow this same recipe. Sizing/layout is left to the caller via `style`.
 */
import React from 'react';
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius as r, spacing as sp } from '../theme/theme';
import { useReducedMotion } from '../lib/useReducedMotion';

type Props = {
  label: string;
  onPress?: () => void;
  /** Sizing/layout from the caller — e.g. `{ width: '100%' }`. */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function SecondaryButton({ label, onPress, style, accessibilityLabel, disabled }: Props) {
  // Self-contained vestibular safety: drop the press scale under reduced motion (opacity stays).
  const reduced = useReducedMotion();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        st.btn,
        style,
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        pressed && !reduced && { transform: [{ scale: 0.99 }] },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text style={st.txt} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  // minHeight matches PrimaryButton + GoogleButton (52) so every auth CTA is the same size.
  btn: {
    minHeight: 52, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: sp.md, borderWidth: 1.5, borderColor: palette.neutral[600],
    backgroundColor: 'transparent',
  },
  // Light grey label (not full white) so the outline button stays clearly subordinate to the primary.
  txt: { fontFamily: 'Inter_600SemiBold', fontSize: 16, letterSpacing: 0.2, color: palette.neutral[300] },
});
