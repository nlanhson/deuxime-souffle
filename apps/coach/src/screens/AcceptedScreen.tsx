/**
 * Coach · Account approved / welcome (E01 / AUTH-07) — the WELCOME beat between the pending screen
 * and the app.
 *
 * Shown once, when the team validates a pending account (`status: 'approved'`). It closes the
 * application loop the pending screen opened ("we'll email you when you're approved") with a warm
 * confirmation + a short preview of what the coach can now do, then `enter()` lands them in the app.
 *
 * Mirrors the pending screen's structure (paper canvas, centred status hero, raised card) but in the
 * success register: a green validated mark instead of the amber hourglass. The 3 highlights echo the
 * Welcome screen's value pillars (matching · on-site check-in · earnings) so the first and last beats
 * of onboarding rhyme. Surface = coach (paper). Motion: one opacity+rise entrance, instant under
 * reduced motion.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, spacing as sp, radius as r, cardShape, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { useCopy } from '../i18n';
import type { Copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../auth/AuthContext';
import { useReducedMotion } from '../lib/useReducedMotion';
import { CheckCircle2, Hand, MapPin, Wallet, type LucideIcon } from '../icons';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const DIVIDER = palette.neutral[200];
const OK = { fg: palette.vert[700], bg: 'rgba(47,158,107,0.16)' };
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

// The three "what's waiting" rows — keys map into copy.auth.accepted.highlights.
const HIGHLIGHTS: { key: keyof Copy['auth']['accepted']['highlights']; icon: LucideIcon }[] = [
  { key: 'matching', icon: Hand },
  { key: 'checkin', icon: MapPin },
  { key: 'revenue', icon: Wallet },
];

export function AcceptedScreen() {
  const copy = useCopy();
  const c = copy.auth.accepted;
  const { applicantName, enter } = useAuth();
  const reduced = useReducedMotion();

  const title = applicantName ? `${c.titlePrefix}${applicantName}${c.titleSuffix}` : c.titleNoName;

  const anim = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.timing(anim, { toValue: 1, duration: dur.slow, easing: ease.out, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entranceStyle = {
    opacity: anim,
    transform: reduced ? [] : [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={entranceStyle}>
          {/* Status hero — green validated mark (success register, vs the pending screen's amber hourglass). */}
          <View style={st.hero}>
            <View style={st.iconChip}>
              <CheckCircle2 size={34} color={OK.fg} />
            </View>
            <View style={st.statusChip}>
              <Text style={st.statusTxt}>{c.statusChip}</Text>
            </View>
            <Text style={st.eyebrow}>{c.eyebrow}</Text>
            <Text style={st.title}>{title}</Text>
            <Text style={st.body}>{c.body}</Text>
          </View>

          {/* What's waiting — echoes the Welcome value pillars, so onboarding bookends rhyme. */}
          <Text style={st.cardEyebrow}>{c.highlightsTitle}</Text>
          <View style={st.card}>
            <LinearGradient
              colors={RAISED_GRAD}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, cardShape]}
              pointerEvents="none"
            />
            {HIGHLIGHTS.map((h, i) => (
              <View key={h.key} style={[st.row, i > 0 && st.rowDivider]}>
                <View style={st.rowIcon}>
                  <h.icon size={18} color={OK.fg} />
                </View>
                <Text style={st.rowTxt} numberOfLines={1}>{c.highlights[h.key]}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={st.footer}>
        <PrimaryButton label={c.cta} onPress={enter} style={st.cta} accessibilityLabel={c.cta} />
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: S.canvas },
  scroll: { flexGrow: 1, paddingHorizontal: sp.lg, paddingTop: sp.xl, paddingBottom: sp.lg, justifyContent: 'center' },

  /* hero */
  hero: { alignItems: 'center', paddingBottom: sp.xl },
  iconChip: {
    width: 88, height: 88, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: OK.bg, marginBottom: sp.md,
  },
  statusChip: { backgroundColor: OK.bg, borderRadius: r.pill, paddingVertical: 4, paddingHorizontal: 12, marginBottom: sp.md },
  statusTxt: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.3, color: OK.fg },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5, color: palette.neutral[600], marginBottom: sp.xs },
  // Anton: lineHeight ≥1.2× the size avoids the clip.
  title: { fontFamily: F.display, fontSize: 34, lineHeight: 41, color: S.textPrimary, textAlign: 'center' },
  body: { fontFamily: F.body, fontSize: 16, lineHeight: 23, color: ON_CARD_2, textAlign: 'center', marginTop: sp.sm, maxWidth: 340 },

  /* highlights card */
  cardEyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: palette.neutral[600], marginBottom: sp.sm },
  card: {
    backgroundColor: palette.neutral[0], ...cardShape, paddingHorizontal: sp.lg,
    borderWidth: 1, borderColor: 'rgba(24,23,21,0.08)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 52, paddingVertical: sp.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: DIVIDER },
  rowIcon: {
    width: 36, height: 36, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: OK.bg,
  },
  rowTxt: { flex: 1, fontFamily: F.body, fontSize: 15, lineHeight: 20, color: ON_CARD },

  /* footer */
  footer: { paddingHorizontal: sp.lg, paddingTop: sp.sm, paddingBottom: sp.md },
  cta: { width: '100%' },
});
