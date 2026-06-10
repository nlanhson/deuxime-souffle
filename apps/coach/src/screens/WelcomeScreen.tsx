/**
 * Coach · Welcome — first interactive onboarding screen (E01 — Auth & Account).
 *
 * Value proposition for the APA coach + the entry point to log in. Coaches are vetted (accounts
 * go Pending → Active after the DS team verifies documents), so account creation is NOT self-serve
 * here — "Apply to join" opens a short note explaining how onboarding actually works rather than a
 * (non-existent) sign-up form.
 *
 * The COPY traces to the coach's real job (matching · on-site check-in · earnings); the LAYOUT is
 * a reasoned synthesis pending the coach video + approved Figma. Surface = coach (ink). Motion: one
 * ease-out rise, text → CTA staggered; reduced motion keeps opacity only (no translate, no stagger).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';
import { Logo } from '../components/Logo';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;
const ON_2 = palette.neutral[300];
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

export function WelcomeScreen({ onLogin, onApply, reduced }: { onLogin: () => void; onApply: () => void; reduced: boolean }) {
  const c = copy.auth.welcome;

  const a = useRef(new Animated.Value(0)).current; // text group
  const b = useRef(new Animated.Value(0)).current; // CTA group

  useEffect(() => {
    if (reduced) {
      a.setValue(1);
      b.setValue(1);
      return;
    }
    Animated.stagger(dur.entryStagger, [
      Animated.timing(a, { toValue: 1, duration: 420, easing: ease.out, useNativeDriver: true }),
      Animated.timing(b, { toValue: 1, duration: 420, easing: ease.out, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rise = (v: Animated.Value) => ({
    opacity: v,
    transform: reduced ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.body}>
        {/* Brand lockup */}
        <View style={st.brand}>
          <Logo size={44} rounded={r.lg} />
          <Text style={st.brandWord} numberOfLines={1}>{copy.auth.splash.wordmark}</Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Headline + body */}
        <Animated.View style={rise(a)}>
          <Text style={st.eyebrow}>{c.eyebrow}</Text>
          <Text style={st.title}>{c.title}</Text>
          <Text style={st.bodyTxt}>{c.body}</Text>
        </Animated.View>

        {/* CTAs */}
        <Animated.View style={[rise(b), st.ctas]}>
          <PrimaryButton label={c.login} onPress={onLogin} style={st.loginBtn} />
          <Pressable
            onPress={onApply}
            hitSlop={10}
            style={({ pressed }) => [
              st.applyBtn,
              pressed && !reduced && { transform: [{ scale: 0.98 }] },
              pressed && { opacity: 0.75 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={c.applyA11y}
          >
            <Text style={st.applyTxt}>{c.apply}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: S.canvas },
  body: { flex: 1, paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.lg },

  /* brand lockup */
  brand: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  brandWord: { flex: 1, fontFamily: F.oswS, fontSize: 18, letterSpacing: 0.3, color: S.textPrimary },

  /* headline + body */
  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
    color: color.action, marginBottom: sp.sm,
  },
  // Anton: lineHeight ≥1.2× the size keeps multi-line display type from clipping.
  title: { fontFamily: F.display, fontSize: 44, lineHeight: 53, color: S.textPrimary, marginBottom: sp.md },
  bodyTxt: { fontFamily: F.body, fontSize: 17, lineHeight: 26, color: ON_2, maxWidth: 340 },

  /* CTAs */
  ctas: { marginTop: sp.xl, gap: sp.md },
  loginBtn: { width: '100%' },
  applyBtn: { alignSelf: 'center', minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sp.md },
  // Underlined so it reads as a link without relying on colour alone.
  applyTxt: { fontFamily: F.bodyS, fontSize: 15, color: ON_2, textDecorationLine: 'underline' },
});
