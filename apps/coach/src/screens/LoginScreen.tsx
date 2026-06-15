/**
 * Coach · Log in (E01 — Auth & Account).
 *
 * Email + password sign-in for an existing coach (a 30-day session and manual logout are handled by
 * the auth layer / Profile), plus Google OAuth (WBS: "Coach can log in via Google OAuth" — stubbed
 * here, real code wires the OAuth2 flow). Cross-links lead to registration ("Coach self-registration
 * … with admin validation") and the dedicated password-reset flow. Facebook stays gated on client
 * sign-off.
 *
 * LAYOUT — a clean FULL PAGE on the ink canvas (no hero video here, by design: the brand film lives
 * on the Welcome / "login options" screen; once the coach is on the focused log-in task the page is
 * calm and content-first). Brand mark top-left, close top-right back to Welcome, then the form.
 *
 * PROTOTYPE: no backend yet, so a valid-looking email + any non-empty password signs in; real code
 * wires Supabase auth and surfaces the server's error in the same error slot. Surface = coach (ink).
 *
 * Form details that matter: visible labels (not placeholder-only), 44px+ targets, a password
 * show/hide toggle, autofill hints so password managers work, a red focus ring, and a single live
 * error region. Inputs come from the shared AuthTextField. Motion: one opacity+rise entrance;
 * reduced motion makes it instant. The keyboard is kept clear of the fields via KeyboardAvoidingView.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { GoogleButton } from '../components/GoogleButton';
import { AuthTextField } from '../components/AuthTextField';
import { Logo } from '../components/Logo';
import { X, Mail, Lock, Eye, EyeOff, TriangleAlert } from '../icons';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;
const ICON = palette.neutral[400];
const ON_2 = palette.neutral[300];
const ERR = palette.rouge[300];
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

const EMAIL_RE = /\S+@\S+\.\S+/;

export function LoginScreen({
  onBack,
  onSuccess,
  onCreateAccount,
  onForgot,
  reduced,
}: {
  onBack: () => void;
  onSuccess: () => void;
  onCreateAccount: () => void;
  onForgot: (email?: string) => void;
  reduced: boolean;
}) {
  const c = copy.auth.login;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const enter = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.timing(enter, { toValue: 1, duration: dur.slow, easing: ease.out, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError = error && !emailValid;
  const passwordError = error && password.length === 0;

  const submit = () => {
    if (!emailValid || password.length === 0) {
      setError(true);
      return;
    }
    onSuccess();
  };

  const onEditField = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (error) setError(false);
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
          {/* Brand mark owns the top-left corner; the close control returns to Welcome. */}
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

          <Animated.View style={entranceStyle}>
            {/* Header: Oswald kicker over the Anton title. The Inter subtitle was dropped (it restated
                "Welcome back" / "Log in"). Field labels below are Inter — see AuthTextField. */}
            <Text style={st.eyebrow}>{c.eyebrow}</Text>
            <Text style={st.title}>{c.title}</Text>

            {/* Google OAuth (stub) — same entry as on sign-up; a real flow signs the coach in. */}
            <View style={st.googleWrap}>
              <GoogleButton label={c.google} onPress={onSuccess} />
            </View>
            <View style={st.divider}>
              <View style={st.divLine} />
              <Text style={st.divTxt}>{c.orDivider}</Text>
              <View style={st.divLine} />
            </View>

            <AuthTextField
              label={c.email.label}
              icon={Mail}
              value={email}
              onChangeText={onEditField(setEmail)}
              error={emailError}
              placeholder={c.email.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              submitBehavior="submit"
            />

            <AuthTextField
              inputRef={passwordRef}
              label={c.password.label}
              icon={Lock}
              value={password}
              onChangeText={onEditField(setPassword)}
              error={passwordError}
              placeholder={c.password.placeholder}
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
              trailing={
                <Pressable
                  onPress={() => setShow((s) => !s)}
                  hitSlop={10}
                  style={({ pressed }) => [st.eyeBtn, pressed && { opacity: 0.6 }]}
                  accessibilityRole="button"
                  accessibilityLabel={show ? c.password.hideA11y : c.password.showA11y}
                >
                  {show ? <EyeOff size={18} color={ICON} /> : <Eye size={18} color={ICON} />}
                </Pressable>
              }
            />

            {/* Forgot password — opens the dedicated reset flow, carrying any typed email across. */}
            <Pressable
              onPress={() => onForgot(email.trim() || undefined)}
              hitSlop={8}
              style={({ pressed }) => [st.forgotBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel={c.forgotA11y}
            >
              <Text style={st.forgotTxt}>{c.forgot}</Text>
            </Pressable>

            {/* Error — one live region */}
            {error ? (
              <View style={st.notice} accessibilityLiveRegion="polite" accessibilityRole="alert">
                <TriangleAlert size={16} color={ERR} />
                <Text style={st.noticeErr}>{c.error}</Text>
              </View>
            ) : null}
          </Animated.View>

          <View style={st.flex} />

          <PrimaryButton label={c.submit} onPress={submit} style={st.submit} accessibilityLabel={c.submit} />
          {/* Sign-up as a secondary (outline) button, paired under the primary Log in. */}
          <SecondaryButton label={c.createAccount} onPress={onCreateAccount} style={st.createAccount} accessibilityLabel={c.createAccount} />
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

  // Sentence case (brand rule: no all-caps) — the red eyebrow reads as a kicker, not a shout.
  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5,
    color: color.action, marginBottom: sp.sm,
  },
  // Anton: lineHeight ≥1.2× the size avoids the descender/cap clip.
  title: { fontFamily: F.display, fontSize: 40, lineHeight: 48, color: S.textPrimary, marginBottom: sp.sm },

  googleWrap: { marginTop: sp.md },
  divider: { flexDirection: 'row', alignItems: 'center', gap: sp.md, marginVertical: sp.md },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  divTxt: { fontFamily: F.body, fontSize: 13, color: palette.neutral[500] },

  eyeBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -sp.xs },

  forgotBtn: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: sp.xs, marginTop: sp.xs },
  forgotTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_2, textDecorationLine: 'underline' },

  notice: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.sm },
  noticeErr: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ERR },

  submit: { width: '100%', marginTop: sp.lg },
  createAccount: { width: '100%', marginTop: sp.md },
});
