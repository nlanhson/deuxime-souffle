/**
 * Coach · Forgot password (E01 — Auth & Account).
 *
 * A dedicated reset flow, opened from Login's "Forgot password?" link (was an inline notice). Two
 * states: a one-field form → a privacy-preserving confirmation that NEVER reveals whether the email
 * is registered (so the screen can't be used to enumerate accounts).
 *
 * LAYOUT — a clean FULL PAGE on the ink canvas, matching Login (no hero video here, by design: the
 * brand film lives on the Welcome screen; this focused sub-task of the log-in flow stays calm and
 * content-first). Brand mark top-left, close top-right back to Login, then the form / confirmation.
 *
 * PROTOTYPE: no email backend yet — a valid-looking email flips to the confirmation; real code
 * triggers the reset email here. Surface = coach (ink). Motion: one opacity+rise entrance, instant
 * under reduced motion; the form→sent swap is a plain conditional (no layout animation).
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthTextField } from '../components/AuthTextField';
import { Logo } from '../components/Logo';
import { X, Mail, TriangleAlert, CheckCircle2 } from '../icons';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;
const ON_2 = palette.neutral[300];
const ERR = palette.rouge[300];
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

const EMAIL_RE = /\S+@\S+\.\S+/;

export function ForgotPasswordScreen({
  reduced,
  initialEmail = '',
  onBack,
  onDone,
}: {
  reduced: boolean;
  initialEmail?: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const c = copy.auth.forgot;

  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);
  const emailRef = useRef<TextInput>(null);

  const enter = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.timing(enter, { toValue: 1, duration: dur.slow, easing: ease.out, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailValid = EMAIL_RE.test(email.trim());

  const submit = () => {
    if (!emailValid) {
      setError(true);
      emailRef.current?.focus();
      return;
    }
    setSent(true);
  };

  const entranceStyle = {
    opacity: enter,
    transform: reduced ? [] : [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={st.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={st.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand mark owns the top-left corner; the close control returns to Login. */}
          <View style={st.topbar}>
            <Logo size={48} />
            <View style={st.flex} />
            <Pressable
              onPress={onBack}
              hitSlop={8}
              style={({ pressed }) => [st.closeBtn, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel={c.backA11y}
            >
              <X size={22} color={S.textPrimary} />
            </Pressable>
          </View>

          {sent ? (
            // ---- Confirmation state ----
            <Animated.View style={[entranceStyle, st.flex]}>
              <View style={st.sentIcon}>
                <CheckCircle2 size={26} color={color.progress} />
              </View>
              <Text style={st.title}>{c.sentTitle}</Text>
              <Text style={st.subtitle} accessibilityLiveRegion="polite">
                {c.sentBodyPrefix}
                <Text style={st.emailEmph}>{email.trim()}</Text>
                {c.sentBodySuffix}
              </Text>
              <Text style={st.hint}>{c.sentHint}</Text>

              <View style={st.flex} />

              <PrimaryButton label={c.done} onPress={onDone} style={st.submit} accessibilityLabel={c.done} />
              <Pressable
                onPress={() => setSent(false)}
                hitSlop={8}
                style={({ pressed }) => [st.linkBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel={c.resend}
              >
                <Text style={st.linkTxt}>{c.resend}</Text>
              </Pressable>
            </Animated.View>
          ) : (
            // ---- Form state ----
            <Animated.View style={[entranceStyle, st.flex]}>
              <Text style={st.eyebrow}>{c.eyebrow}</Text>
              <Text style={st.title}>{c.title}</Text>
              <Text style={st.subtitle}>{c.subtitle}</Text>

              <AuthTextField
                inputRef={emailRef}
                label={c.email.label}
                icon={Mail}
                value={email}
                onChangeText={(v) => { setEmail(v); if (error) setError(false); }}
                error={error && !emailValid}
                placeholder={c.email.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="go"
                onSubmitEditing={submit}
                autoFocus={!initialEmail}
              />

              {error ? (
                <View style={st.notice} accessibilityLiveRegion="polite" accessibilityRole="alert">
                  <TriangleAlert size={16} color={ERR} />
                  <Text style={st.noticeErr}>{c.invalid}</Text>
                </View>
              ) : null}

              <View style={st.flex} />

              <PrimaryButton label={c.submit} onPress={submit} style={st.submit} accessibilityLabel={c.submit} />
              <Pressable
                onPress={onBack}
                hitSlop={8}
                style={({ pressed }) => [st.linkBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel={c.backToLogin}
              >
                <Text style={st.linkTxt}>{c.backToLogin}</Text>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: palette.neutral[800],
  },

  sentIcon: {
    width: 52, height: 52, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(47,158,107,0.18)', marginBottom: sp.md,
  },

  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5, color: color.action, marginBottom: sp.sm },
  title: { fontFamily: F.display, fontSize: 40, lineHeight: 48, color: S.textPrimary },
  subtitle: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: ON_2, marginTop: sp.xs, marginBottom: sp.sm },
  emailEmph: { fontFamily: F.bodyS, color: S.textPrimary },
  hint: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: palette.neutral[500], marginTop: sp.xs },

  notice: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.md },
  noticeErr: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ERR },

  submit: { width: '100%', marginTop: sp.lg },

  linkBtn: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: sp.md, marginTop: sp.sm },
  linkTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_2, textDecorationLine: 'underline' },
});
