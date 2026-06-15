/**
 * GoogleButton — "Continue with Google" (E01: social login restricted to coaches via Google;
 * Facebook is still gated on client sign-off, so it's intentionally absent).
 *
 * A light third-party button, deliberately NOT the brand gradient — Google sign-in isn't a
 * Deuxième Souffle action, so it stays visually distinct from the primary CTA. Carries the REAL
 * official Google "G" mark (see GoogleMark), per Google's "Sign in with Google" brand guidelines.
 */
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { palette, spacing as sp, radius as r } from '../theme/theme';
import { useReducedMotion } from '../lib/useReducedMotion';
import { GoogleMark } from './GoogleMark';

const F = { bodyS: 'Inter_600SemiBold' };

export function GoogleButton({ label, onPress }: { label: string; onPress?: () => void }) {
  // Self-contained vestibular safety: drop the press scale under reduced motion (opacity stays).
  const reduced = useReducedMotion();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        st.btn,
        pressed && { opacity: 0.9 },
        pressed && !reduced && { transform: [{ scale: 0.99 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <GoogleMark size={20} />
      <Text style={st.label} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp.sm,
    minHeight: 52, borderRadius: r.lg, backgroundColor: palette.neutral[0], paddingHorizontal: sp.md,
  },
  label: { fontFamily: F.bodyS, fontSize: 16, color: palette.neutral[900] },
});
