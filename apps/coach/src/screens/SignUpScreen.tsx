/**
 * Coach · Sign up / Apply to coach (E01 — "Coach self-registration (email / Google) with admin
 * validation").
 *
 * Opened from Welcome's "Apply to join" (and Login's "Create an account"). Collects the registration
 * fields the AUTH stories name — identity, email, phone, SIRET, password, an optional invitation code
 * (the WBS enforces code↔email pairing for invited coaches) and a consent gate — then creates a
 * PENDING_APPROVAL account via the auth seam, which drops the coach onto the pending-approval screen.
 *
 * PROTOTYPE: no backend, so a valid-looking form submits straight to pending; Google OAuth2, the
 * SIRET/email uniqueness checks, and the Google "profile completion" step are stubbed. LAYOUT is a
 * synthesis pending the coach video + Figma. Surface = coach (ink). Motion: one opacity entrance,
 * instant under reduced motion.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';
import { GoogleButton } from '../components/GoogleButton';
import { AuthTextField } from '../components/AuthTextField';
import { Logo } from '../components/Logo';
import { X, Mail, Phone, IdCard, Lock, Eye, EyeOff, Check, TriangleAlert } from '../icons';
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
const isSiret = (v: string) => /^\d{14}$/.test(v.replace(/\s/g, ''));

export function SignUpScreen({
  reduced,
  onBack,
  onLogin,
  onRegister,
}: {
  reduced: boolean;
  onBack: () => void;
  onLogin: () => void;
  onRegister: (firstName?: string) => void;
}) {
  const c = copy.auth.signup;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [siret, setSiret] = useState('');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(false);

  const firstNameRef = useRef<TextInput>(null);
  const lastRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const siretRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const inviteRef = useRef<TextInput>(null);

  const enter = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.timing(enter, { toValue: 1, duration: dur.slow, easing: ease.out, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailValid = EMAIL_RE.test(email.trim());
  const siretValid = isSiret(siret);
  const passwordValid = password.length >= 8;
  const valid =
    firstName.trim() !== '' && lastName.trim() !== '' && emailValid && phone.trim() !== '' && siretValid && passwordValid && consent;

  const clear = () => { if (error) setError(false); };
  const onEdit = (setter: (v: string) => void) => (v: string) => { setter(v); clear(); };

  const submit = () => {
    if (!valid) {
      setError(true);
      // Move focus (and scroll) to the first invalid text field so the error isn't off-screen.
      const firstInvalid =
        firstName.trim() === '' ? firstNameRef
        : lastName.trim() === '' ? lastRef
        : !emailValid ? emailRef
        : phone.trim() === '' ? phoneRef
        : !siretValid ? siretRef
        : !passwordValid ? passwordRef
        : null;
      firstInvalid?.current?.focus();
      return;
    }
    onRegister(firstName);
  };
  // Google sign-up (stub): a real Google OAuth2 flow would return the profile, then a completion
  // step; here it goes straight to PENDING_APPROVAL without a captured name.
  const onGoogle = () => onRegister();

  const entranceStyle = {
    opacity: enter,
    transform: reduced ? [] : [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={st.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
          {/* Brand mark owns the top-left corner; the close control returns to Welcome. */}
          <View style={st.topbar}>
            <Logo size={40} rounded={r.md} />
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
            <Text style={st.eyebrow}>{c.eyebrow}</Text>
            <Text style={st.title}>{c.title}</Text>
            <Text style={st.subtitle}>{c.subtitle}</Text>

            <View style={st.googleWrap}>
              <GoogleButton label={c.google} onPress={onGoogle} />
            </View>
            <View style={st.divider}>
              <View style={st.divLine} />
              <Text style={st.divTxt}>{c.orDivider}</Text>
              <View style={st.divLine} />
            </View>

            <View style={st.nameRow}>
              <AuthTextField
                containerStyle={st.flex}
                inputRef={firstNameRef}
                label={c.firstName.label}
                value={firstName}
                onChangeText={onEdit(setFirstName)}
                error={error && firstName.trim() === ''}
                placeholder={c.firstName.placeholder}
                autoCapitalize="words"
                textContentType="givenName"
                returnKeyType="next"
                onSubmitEditing={() => lastRef.current?.focus()}
                submitBehavior="submit"
              />
              <AuthTextField
                containerStyle={st.flex}
                inputRef={lastRef}
                label={c.lastName.label}
                value={lastName}
                onChangeText={onEdit(setLastName)}
                error={error && lastName.trim() === ''}
                placeholder={c.lastName.placeholder}
                autoCapitalize="words"
                textContentType="familyName"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                submitBehavior="submit"
              />
            </View>

            <AuthTextField
              inputRef={emailRef}
              label={c.email.label}
              icon={Mail}
              value={email}
              onChangeText={onEdit(setEmail)}
              error={error && !emailValid}
              placeholder={c.email.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              submitBehavior="submit"
            />

            <AuthTextField
              inputRef={phoneRef}
              label={c.phone.label}
              icon={Phone}
              value={phone}
              onChangeText={onEdit(setPhone)}
              error={error && phone.trim() === ''}
              placeholder={c.phone.placeholder}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="next"
              onSubmitEditing={() => siretRef.current?.focus()}
              submitBehavior="submit"
            />

            <AuthTextField
              inputRef={siretRef}
              label={c.siret.label}
              icon={IdCard}
              help={c.siret.help}
              value={siret}
              onChangeText={onEdit(setSiret)}
              error={error && !siretValid}
              placeholder={c.siret.placeholder}
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              submitBehavior="submit"
            />

            <AuthTextField
              inputRef={passwordRef}
              label={c.password.label}
              icon={Lock}
              value={password}
              onChangeText={onEdit(setPassword)}
              error={error && !passwordValid}
              placeholder={c.password.placeholder}
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => inviteRef.current?.focus()}
              submitBehavior="submit"
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

            <AuthTextField
              inputRef={inviteRef}
              label={c.invite.label}
              optional={c.invite.optional}
              value={invite}
              onChangeText={onEdit(setInvite)}
              placeholder={c.invite.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={submit}
            />

            {/* Consent gate */}
            <Pressable
              onPress={() => { setConsent((v) => !v); clear(); }}
              hitSlop={6}
              style={st.consentRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consent }}
              accessibilityLabel={c.consentA11y}
            >
              <View style={[st.box, consent && st.boxOn, error && !consent && st.boxErr]}>
                {consent ? <Check size={14} color={color.onAction} /> : null}
              </View>
              <Text style={st.consentTxt}>{c.consent}</Text>
            </Pressable>

            {error ? (
              <View style={st.notice} accessibilityLiveRegion="polite" accessibilityRole="alert">
                <TriangleAlert size={16} color={ERR} />
                <Text style={st.noticeErr}>{c.error}</Text>
              </View>
            ) : null}

            <PrimaryButton label={c.submit} onPress={submit} style={st.submit} accessibilityLabel={c.submit} />

            <View style={st.altRow}>
              <Text style={st.altTxt}>{c.haveAccount}</Text>
              <Pressable
                onPress={onLogin}
                hitSlop={8}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel={c.login}
              >
                <Text style={st.altLink}>{c.login}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: S.canvas },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: sp.lg, paddingTop: sp.sm, paddingBottom: sp['2xl'] },

  topbar: { flexDirection: 'row', alignItems: 'center', marginBottom: sp.md },
  closeBtn: {
    width: 44, height: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[800],
  },

  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
    color: color.action, marginBottom: sp.sm,
  },
  // Anton: lineHeight ≥1.2× the size avoids the descender/cap clip.
  title: { fontFamily: F.display, fontSize: 40, lineHeight: 48, color: S.textPrimary },
  subtitle: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: ON_2, marginTop: sp.xs },

  googleWrap: { marginTop: sp.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: sp.md, marginVertical: sp.md },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  divTxt: { fontFamily: F.body, fontSize: 13, color: palette.neutral[500] },

  nameRow: { flexDirection: 'row', gap: sp.sm },
  eyeBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -sp.xs },

  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, marginTop: sp.lg, minHeight: 44 },
  box: {
    width: 24, height: 24, borderRadius: r.sm, borderWidth: 1.5, borderColor: palette.neutral[500],
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  boxOn: { backgroundColor: color.action, borderColor: color.action },
  boxErr: { borderColor: ERR },
  consentTxt: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ON_2 },

  notice: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.md },
  noticeErr: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ERR },

  submit: { width: '100%', marginTop: sp.lg },

  altRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp.xs, marginTop: sp.lg },
  altTxt: { fontFamily: F.body, fontSize: 14, color: ON_2 },
  altLink: { fontFamily: F.bodyS, fontSize: 14, color: color.action, textDecorationLine: 'underline' },
});
