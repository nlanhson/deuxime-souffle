/**
 * Coach · Sign up / Apply to coach (E01 — "Coach self-registration (email / Google) with admin
 * validation").
 *
 * Opened from Welcome's "Apply to join" (and Login's "Create an account"). The FIELD SET mirrors
 * the client's back-office "Invite a coach · Step 1 — Coach's identity" form: civility + date of
 * birth, first name + name, email, phone, personal address (feeds the default travel-time
 * calculation), SIRET + legal status, and the INSEE auto-verification note. Self-registration
 * adds what the back-office flow doesn't need: a password, the optional invitation code (the WBS
 * enforces code↔email pairing for invited coaches) and a consent gate. Submitting creates a
 * PENDING_APPROVAL account via the auth seam — the KYC-documents step lives on the pending screen.
 *
 * PROTOTYPE: no backend, so a valid-looking form submits straight to pending; Google OAuth2, the
 * INSEE/uniqueness checks, and the Google "profile completion" step are stubbed. Surface = coach
 * (ink). Motion: one opacity entrance, instant under reduced motion.
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
import { SelectField } from '../components/SelectField';
import { Logo } from '../components/Logo';
import { OptionSheet } from '../components/OptionSheet';
import {
  X, Mail, Phone, IdCard, Lock, Eye, EyeOff, Check, TriangleAlert, MapPin, Briefcase, Lightbulb,
} from '../icons';
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

/** Masks a date-of-birth as DD/MM/YYYY while typing (digits in, slashes inserted). */
const formatDob = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};
/** A complete, plausible DD/MM/YYYY birth date (real calendar day, coach at least 16). */
const isDob = (v: string) => {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const dd = Number(m[1]), mm = Number(m[2]), yyyy = Number(m[3]);
  if (mm < 1 || mm > 12 || dd < 1 || yyyy < 1900) return false;
  if (dd > new Date(yyyy, mm, 0).getDate()) return false;
  return yyyy <= new Date().getFullYear() - 16;
};

type CivilityKey = 'madam' | 'sir';
type LegalKey = 'selfEmployed' | 'soleProprietor' | 'company' | 'other';

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
  const [civility, setCivility] = useState<CivilityKey | null>(null);
  const [dob, setDob] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [siret, setSiret] = useState('');
  // Back-office parity: the legal-status select arrives preset to Self-employed.
  const [legal, setLegal] = useState<LegalKey>('selfEmployed');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(false);
  const [civilityOpen, setCivilityOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  const dobRef = useRef<TextInput>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
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
  // Civility, date of birth and legal status are optional (back-office parity: no asterisk) —
  // but a partially-typed birth date is invalid, not missing.
  const dobValid = dob === '' || isDob(dob);
  const valid =
    firstName.trim() !== '' && lastName.trim() !== '' && emailValid && phone.trim() !== '' &&
    address.trim() !== '' && siretValid && passwordValid && dobValid && consent;

  const clear = () => { if (error) setError(false); };
  const onEdit = (setter: (v: string) => void) => (v: string) => { setter(v); clear(); };

  const submit = () => {
    if (!valid) {
      setError(true);
      // Move focus (and scroll) to the first invalid text field so the error isn't off-screen.
      const firstInvalid =
        !dobValid ? dobRef
        : firstName.trim() === '' ? firstNameRef
        : lastName.trim() === '' ? lastRef
        : !emailValid ? emailRef
        : phone.trim() === '' ? phoneRef
        : address.trim() === '' ? addressRef
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

            {/* Step header — verbatim from the back-office "Invite a coach" flow. */}
            <Text style={st.step} accessibilityRole="header">{c.step}</Text>

            <View style={st.fieldRow}>
              <SelectField
                containerStyle={st.flex}
                label={c.civility.label}
                optional={c.optionalTag}
                placeholder={c.civility.placeholder}
                value={civility ? c.civility.options[civility] : undefined}
                onPress={() => setCivilityOpen(true)}
              />
              <AuthTextField
                containerStyle={st.flex}
                inputRef={dobRef}
                label={c.dob.label}
                optional={c.optionalTag}
                value={dob}
                onChangeText={(v) => { setDob(formatDob(v)); clear(); }}
                error={error && !dobValid}
                placeholder={c.dob.placeholder}
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="next"
                onSubmitEditing={() => firstNameRef.current?.focus()}
                submitBehavior="submit"
              />
            </View>

            <View style={st.fieldRow}>
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
              onSubmitEditing={() => addressRef.current?.focus()}
              submitBehavior="submit"
            />

            <AuthTextField
              inputRef={addressRef}
              label={c.address.label}
              icon={MapPin}
              help={c.address.help}
              value={address}
              onChangeText={onEdit(setAddress)}
              error={error && address.trim() === ''}
              placeholder={c.address.placeholder}
              autoCapitalize="words"
              autoComplete="street-address"
              textContentType="fullStreetAddress"
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

            <SelectField
              label={c.legalStatus.label}
              optional={c.optionalTag}
              icon={Briefcase}
              placeholder={c.legalStatus.placeholder}
              value={c.legalStatus.options[legal]}
              onPress={() => setLegalOpen(true)}
            />

            {/* Automatic-verification note (back-office parity: SIRET → INSEE, training gate). */}
            <View style={st.verifyCard}>
              <Lightbulb size={18} color={palette.bleu[300]} />
              <View style={st.flex}>
                <Text style={st.verifyTitle}>{c.verification.title}</Text>
                <Text style={st.verifyBody}>{c.verification.body}</Text>
              </View>
            </View>

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

      <OptionSheet
        visible={civilityOpen}
        onClose={() => setCivilityOpen(false)}
        title={c.civility.sheetTitle}
        options={(Object.keys(c.civility.options) as CivilityKey[]).map((k) => ({ key: k, label: c.civility.options[k] }))}
        selectedKey={civility ?? undefined}
        onSelect={(k) => { setCivility(k as CivilityKey); clear(); }}
      />
      <OptionSheet
        visible={legalOpen}
        onClose={() => setLegalOpen(false)}
        title={c.legalStatus.sheetTitle}
        options={(Object.keys(c.legalStatus.options) as LegalKey[]).map((k) => ({ key: k, label: c.legalStatus.options[k] }))}
        selectedKey={legal}
        onSelect={(k) => { setLegal(k as LegalKey); clear(); }}
      />
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

  // Sentence case (brand rule: no all-caps) — the red eyebrow reads as a kicker, not a shout.
  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5,
    color: color.action, marginBottom: sp.sm,
  },
  // Anton: lineHeight ≥1.2× the size avoids the descender/cap clip.
  title: { fontFamily: F.display, fontSize: 40, lineHeight: 48, color: S.textPrimary },
  subtitle: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: ON_2, marginTop: sp.xs },

  googleWrap: { marginTop: sp.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: sp.md, marginVertical: sp.md },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  divTxt: { fontFamily: F.body, fontSize: 13, color: palette.neutral[500] },

  step: { fontFamily: F.oswS, fontSize: 15, letterSpacing: 0.5, color: S.textPrimary, marginTop: sp.xs },

  fieldRow: { flexDirection: 'row', gap: sp.sm },
  eyeBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -sp.xs },

  // Info-blue tint derived from palette.bleu (500 wash + 300 hairline) — readable on ink.
  verifyCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, marginTop: sp.md,
    padding: sp.md, borderRadius: r.lg, backgroundColor: 'rgba(47,79,146,0.22)',
    borderWidth: 1, borderColor: 'rgba(123,147,199,0.35)',
  },
  verifyTitle: { fontFamily: F.bodyS, fontSize: 14, lineHeight: 20, color: palette.bleu[200] },
  verifyBody: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: palette.bleu[200], marginTop: 2 },

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
