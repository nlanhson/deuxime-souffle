/**
 * Coach · Verify your email (E01 / AUTH-01/02) — the last step of email/password registration.
 *
 * After the Apply form is submitted with a valid e-mail, the coach lands here: we've "sent" a
 * confirmation link, and opening it finalises the application (which then goes under review on the
 * pending screen). Google sign-ups skip this screen — Google e-mails are already verified.
 *
 * LAYOUT — the same calm, content-first FULL PAGE on the paper canvas as ForgotPassword: brand mark
 * top-left, a close control back to the Apply form, a mail icon, the {email} we wrote to, a primary
 * "I've confirmed" and a resend with a short cooldown. (Resend is throttled so the screen can't be
 * hammered; the countdown is announced for screen readers.)
 *
 * PROTOTYPE: there's no e-mail backend, so the "J'ai confirmé mon e-mail" CTA stands in for the
 * coach clicking the real link — it calls onVerified, which completes registration. Surface = coach
 * (paper). Motion: one opacity+rise entrance, instant under reduced motion.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { useCopy } from '../i18n';
import { PrimaryButton } from '../components/PrimaryButton';
import { Logo } from '../components/Logo';
import { X, Mail, Check } from '../icons';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;
const ON_2 = palette.neutral[600];
const OK = { fg: palette.vert[700], bg: 'rgba(47,158,107,0.18)' };
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

const RESEND_COOLDOWN = 30; // seconds before "Resend" is tappable again

export function EmailVerifyScreen({
  reduced,
  email,
  onBack,
  onVerified,
}: {
  reduced: boolean;
  email: string;
  onBack: () => void;
  onVerified: () => void;
}) {
  const copy = useCopy();
  const c = copy.auth.verify;

  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Tick the resend cooldown down to zero. A single interval that clears itself at 0 — no leak, and
  // nothing animates, so reduced motion is unaffected.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((n) => (n <= 1 ? 0 : n - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const resend = () => {
    if (cooldown > 0) return;
    setResent(true);
    setCooldown(RESEND_COOLDOWN);
  };

  const enter = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.timing(enter, { toValue: 1, duration: dur.slow, easing: ease.out, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entranceStyle = {
    opacity: enter,
    transform: reduced ? [] : [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  const resendLabel = cooldown > 0 ? `${c.resendInPrefix}${cooldown}${c.resendInSuffix}` : c.resend;

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={st.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand mark owns the top-left corner; the close control returns to the Apply form. */}
        <View style={st.topbar}>
          <Logo size={48} />
          <View style={st.flex} />
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => [st.closeBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel={c.closeA11y}
          >
            <X size={22} color={S.textPrimary} />
          </Pressable>
        </View>

        <Animated.View style={[entranceStyle, st.flex]}>
          <View style={st.icon}>
            <Mail size={26} color={color.action} />
          </View>
          <Text style={st.eyebrow}>{c.eyebrow}</Text>
          <Text style={st.title}>{c.title}</Text>
          <Text style={st.subtitle} accessibilityLiveRegion="polite">
            {c.bodyPrefix}
            <Text style={st.emailEmph}>{email.trim()}</Text>
            {c.bodySuffix}
          </Text>
          <Text style={st.hint}>{c.hint}</Text>

          {/* Resend confirmation — appears only after a resend, announced for screen readers. */}
          {resent ? (
            <View style={st.resentRow} accessibilityLiveRegion="polite">
              <Check size={16} color={OK.fg} />
              <Text style={st.resentTxt}>{c.resent}</Text>
            </View>
          ) : null}

          <View style={st.flex} />

          <PrimaryButton label={c.confirm} onPress={onVerified} style={st.submit} accessibilityLabel={c.confirm} />

          <Pressable
            onPress={resend}
            disabled={cooldown > 0}
            hitSlop={8}
            style={({ pressed }) => [st.linkBtn, pressed && cooldown === 0 && { opacity: 0.6 }, cooldown > 0 && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityState={{ disabled: cooldown > 0 }}
            accessibilityLabel={resendLabel}
          >
            <Text style={st.linkTxt}>{resendLabel}</Text>
          </Pressable>

          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => [st.linkBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel={c.changeEmail}
          >
            <Text style={st.linkTxt}>{c.changeEmail}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: S.canvas },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: sp.lg, paddingTop: sp.sm, paddingBottom: sp.lg },

  topbar: { flexDirection: 'row', alignItems: 'center', marginBottom: sp.xl },
  closeBtn: {
    width: 44, height: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[100],
  },

  icon: {
    width: 52, height: 52, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(234,56,41,0.10)', marginBottom: sp.sm,
  },

  // "Last step" groups with the icon (tight gap above) and separates from the title (larger gap below).
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5, color: color.action, marginBottom: sp.md },
  title: { fontFamily: F.display, fontSize: 40, lineHeight: 48, color: S.textPrimary },
  subtitle: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: ON_2, marginTop: sp.xs, marginBottom: sp.sm },
  emailEmph: { fontFamily: F.bodyS, color: S.textPrimary },
  hint: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: palette.neutral[600], marginTop: sp.xs },

  resentRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.md },
  resentTxt: { fontFamily: F.bodyS, fontSize: 14, color: OK.fg },

  submit: { width: '100%', marginTop: sp.lg },

  linkBtn: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: sp.md, marginTop: sp.sm },
  linkTxt: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary, textDecorationLine: 'underline' },
});
