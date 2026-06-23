/**
 * Coach · Sign up / Apply to coach (E01 — "Coach self-registration (email / Google) with admin
 * validation").
 *
 * Opened from Welcome's "Apply to join" (and Login's "Create an account"). A 4-STEP application
 * wizard that mirrors the client's back-office "Invite a coach" flow, adapted to self-onboarding:
 *   1. Identité   — civility + DOB, names, email, phone, address, SIRET, legal status, INSEE note.
 *   2. Documents  — KYC pieces (CV, diploma, URSSAF/vigilance, RC Pro, DS training, + optional),
 *                   each with a received / waiting / optional status; pre-load what you already have.
 *   3. Zone       — favourite intervention areas + a weekly-availability grid. (Mode de transport
 *                   and max travel-time are intentionally omitted — back-office-managed.)
 *   4. Tarif      — desired hourly rate + presets, monthly goal, specialities, then the account
 *                   gate (password + optional invite code + consent) and submit.
 * The admin-only bits of the back-office comp (recap rail + "invite the coach") are dropped: the
 * coach is registering themselves.
 *
 * Submitting (email/password) goes to e-mail verification then PENDING_APPROVAL; Google OAuth2 skips
 * verification (pre-verified). The INSEE/uniqueness checks, file picker and Google "profile
 * completion" step are stubbed. Surface = coach (light/paper). Motion: one opacity entrance, instant
 * under reduced motion; the per-step swap doesn't animate (vestibular-safe).
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { useCopy } from '../i18n';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { GoogleButton } from '../components/GoogleButton';
import { AuthTextField } from '../components/AuthTextField';
import { SelectField } from '../components/SelectField';
import { Logo } from '../components/Logo';
import { StepProgress } from '../components/StepProgress';
import { OptionSheet } from '../components/OptionSheet';
import {
  X, Mail, Phone, IdCard, Lock, Eye, EyeOff, Check, Clock, Plus, TriangleAlert, MapPin, Briefcase,
  Lightbulb, CalendarDays, FileText, ScrollText, ShieldCheck, GraduationCap, Award, Car,
  type LucideIcon,
} from '../icons';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;
const ICON = palette.neutral[500];
const ON_2 = palette.neutral[600];
const ON_CARD = palette.neutral[900];
const ERR = palette.rouge[300];
// Paper-tuned KYC tones (match PendingApprovalScreen): dark amber + dark green hold AA on the wash.
const WAITING = { fg: palette.or[800], bg: 'rgba(242,194,0,0.16)' };
const RECEIVED = { fg: palette.vert[700], bg: 'rgba(47,158,107,0.16)' };
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  oswM: 'Oswald_500Medium',
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

// ── Step 2 (KYC) — the pieces, in order. Icons + obligation live here; status is mutable state. ──
type DocKey = 'cv' | 'diploma' | 'urssaf' | 'insurance' | 'training' | 'license' | 'record';
type DocStatus = 'received' | 'waiting' | 'optional';
const DOC_ROWS: { key: DocKey; icon: LucideIcon; mandatory: boolean; renew6m?: boolean }[] = [
  { key: 'cv', icon: FileText, mandatory: true },
  { key: 'diploma', icon: GraduationCap, mandatory: true },
  { key: 'urssaf', icon: ScrollText, mandatory: true, renew6m: true },
  { key: 'insurance', icon: ShieldCheck, mandatory: true },
  { key: 'training', icon: Award, mandatory: true },
  { key: 'license', icon: Car, mandatory: false },
  { key: 'record', icon: IdCard, mandatory: false },
];
// Seed: CV + diploma arrived with the application; the rest are still to come / optional.
const SEED_DOCS: Record<DocKey, DocStatus> = {
  cv: 'received', diploma: 'received', urssaf: 'waiting', insurance: 'waiting', training: 'waiting',
  license: 'optional', record: 'optional',
};

// ── Step 3 — favourite intervention areas (Île-de-France départements). ──
const ZONES: { key: string; label: string }[] = [
  { key: '75', label: '75 Paris' },
  { key: '92', label: '92 Hauts-de-Seine' },
  { key: '93', label: '93 Seine-Saint-Denis' },
  { key: '94', label: '94 Val-de-Marne' },
  { key: '95', label: '95 Val-d’Oise' },
  { key: '77', label: '77 Seine-et-Marne' },
  { key: '78', label: '78 Yvelines' },
  { key: '91', label: '91 Essonne' },
];
const SLOTS = ['am', 'pm'] as const;
const DEFAULT_AVAIL: Record<string, boolean> = {
  'am-0': true, 'am-1': true, 'am-2': false, 'am-3': true, 'am-4': true, 'am-5': false, 'am-6': false,
  'pm-0': true, 'pm-1': true, 'pm-2': true, 'pm-3': true, 'pm-4': true, 'pm-5': false, 'pm-6': false,
};

// ── Step 4 — tariff presets + specialities. ──
const SPEC_KEYS = ['classic', 'protected', 'helpers', 'caregivers', 'playful', 'memory', 'strength'] as const;

const TOTAL = 4;

export function SignUpScreen({
  reduced,
  onBack,
  onLogin,
  onRegister,
  onVerifyEmail,
}: {
  reduced: boolean;
  onBack: () => void;
  onLogin: () => void;
  /** Google path — already verified, so straight to PENDING_APPROVAL. */
  onRegister: (firstName?: string) => void;
  /** Email/password path — go verify the e-mail first, then registration completes. */
  onVerifyEmail: (firstName: string, email: string) => void;
}) {
  const copy = useCopy();
  const c = copy.auth.signup;
  const [step, setStep] = useState(0);
  // Identity (step 1)
  const [civility, setCivility] = useState<CivilityKey | null>(null);
  const [dob, setDob] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [siret, setSiret] = useState('');
  const [legal, setLegal] = useState<LegalKey>('selfEmployed');
  // Documents (step 2)
  const [docs, setDocs] = useState<Record<DocKey, DocStatus>>(SEED_DOCS);
  // Zone & availability (step 3)
  const [zones, setZones] = useState<string[]>(['75', '92', '94']);
  const [avail, setAvail] = useState<Record<string, boolean>>(DEFAULT_AVAIL);
  // Tariff & account (step 4)
  const [rate, setRate] = useState('40');
  const [target, setTarget] = useState('15');
  const [specs, setSpecs] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState(false);

  const [error, setError] = useState(false);
  const [civilityOpen, setCivilityOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
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
  // Land each step at the top of the scroll.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: !reduced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const emailValid = EMAIL_RE.test(email.trim());
  const siretValid = isSiret(siret);
  const passwordValid = password.length >= 8;
  const dobValid = dob === '' || isDob(dob);
  const identityValid =
    firstName.trim() !== '' && lastName.trim() !== '' && emailValid && phone.trim() !== '' &&
    address.trim() !== '' && siretValid && dobValid;
  const finalValid = identityValid && passwordValid && consent;

  const clear = () => { if (error) setError(false); };
  const onEdit = (setter: (v: string) => void) => (v: string) => { setter(v); clear(); };

  const focusFirstIdentity = () => {
    const firstInvalid =
      !dobValid ? dobRef
      : firstName.trim() === '' ? firstNameRef
      : lastName.trim() === '' ? lastRef
      : !emailValid ? emailRef
      : phone.trim() === '' ? phoneRef
      : address.trim() === '' ? addressRef
      : !siretValid ? siretRef
      : null;
    firstInvalid?.current?.focus();
  };

  const goNext = () => {
    if (step === 0 && !identityValid) { setError(true); focusFirstIdentity(); return; }
    setError(false);
    setStep((s) => Math.min(TOTAL - 1, s + 1));
  };
  const goBack = () => {
    setError(false);
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = () => {
    if (!finalValid) {
      setError(true);
      if (!identityValid) { setStep(0); requestAnimationFrame(focusFirstIdentity); }
      else if (!passwordValid) passwordRef.current?.focus();
      return;
    }
    onVerifyEmail(firstName.trim(), email.trim());
  };
  // Google sign-up (stub): straight to PENDING_APPROVAL without a captured name.
  const onGoogle = () => onRegister();

  const entranceStyle = {
    opacity: enter,
    transform: reduced ? [] : [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  const ca = (Number(rate) || 0) * (Number(target) || 0);
  const stepLabel = `${c.stepOfPrefix}${step + 1}${c.stepOfMid}${TOTAL}`;

  const toggle = (list: string[], set: (v: string[]) => void, key: string) =>
    set(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={st.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
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
            {/* Title + Google + divider only lead the first step. */}
            {step === 0 ? (
              <>
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
              </>
            ) : null}

            <StepProgress current={step + 1} total={TOTAL} label={stepLabel} style={st.stepper} />
            <Text style={st.step} accessibilityRole="header">{c.stepTitles[step]}</Text>

            {/* ===== Step 1 — Identity ===== */}
            {step === 0 ? (
              <>
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
                  returnKeyType="done"
                />

                <SelectField
                  label={c.legalStatus.label}
                  optional={c.optionalTag}
                  icon={Briefcase}
                  placeholder={c.legalStatus.placeholder}
                  value={c.legalStatus.options[legal]}
                  onPress={() => setLegalOpen(true)}
                />

                <View style={st.tipCard}>
                  <Lightbulb size={18} color={palette.bleu[600]} />
                  <View style={st.flex}>
                    <Text style={st.tipTitle}>{c.verification.title}</Text>
                    <Text style={st.tipBody}>{c.verification.body}</Text>
                  </View>
                </View>
              </>
            ) : null}

            {/* ===== Step 2 — KYC documents ===== */}
            {step === 1 ? (
              <>
                <Text style={st.secHelp}>{c.kyc.intro}</Text>
                {DOC_ROWS.map((d) => {
                  const status = docs[d.key];
                  const tag = d.mandatory ? (d.renew6m ? c.kyc.tagMandatory6m : c.kyc.tagMandatory) : c.kyc.tagOptional;
                  return (
                    <View
                      key={d.key}
                      style={[st.docItem, status === 'received' && st.docReceived, status === 'waiting' && st.docWaiting]}
                    >
                      <View style={st.docTop}>
                        <View style={st.docIcon}><d.icon size={18} color={ON_2} /></View>
                        <View style={st.docMain}>
                          <View style={st.docNameRow}>
                            <Text style={st.docName} numberOfLines={1}>{c.kyc.docs[d.key].label}</Text>
                            <View style={[st.tag, d.mandatory ? st.tagMand : st.tagOpt]}>
                              <Text style={[st.tagTxt, d.mandatory ? st.tagTxtMand : st.tagTxtOpt]}>{tag}</Text>
                            </View>
                          </View>
                          <Text style={st.docDesc} numberOfLines={1}>{c.kyc.docs[d.key].desc}</Text>
                        </View>
                        {/* status — icon + word, never colour alone */}
                        {status === 'received' ? (
                          <View style={[st.statusChip, { backgroundColor: RECEIVED.bg }]}>
                            <Check size={12} color={RECEIVED.fg} />
                            <Text style={[st.statusTxt, { color: RECEIVED.fg }]}>{c.kyc.statusReceived}</Text>
                          </View>
                        ) : status === 'waiting' ? (
                          <View style={[st.statusChip, { backgroundColor: WAITING.bg }]}>
                            <Clock size={12} color={WAITING.fg} />
                            <Text style={[st.statusTxt, { color: WAITING.fg }]}>{c.kyc.statusWaiting}</Text>
                          </View>
                        ) : (
                          <View style={[st.statusChip, st.statusOpt]}>
                            <Text style={[st.statusTxt, { color: ON_2 }]}>{c.kyc.statusOptional}</Text>
                          </View>
                        )}
                      </View>
                      <View style={st.docActions}>
                        {status === 'received' ? (
                          <Pressable
                            hitSlop={6}
                            style={({ pressed }) => [st.docLink, pressed && { opacity: 0.6 }]}
                            accessibilityRole="button"
                            accessibilityLabel={`${c.kyc.view} · ${c.kyc.docs[d.key].label}`}
                          >
                            <Text style={st.docLinkTxt}>{c.kyc.view}</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            hitSlop={6}
                            onPress={() => setDocs((prev) => ({ ...prev, [d.key]: 'received' }))}
                            style={({ pressed }) => [st.docAdd, pressed && { opacity: 0.85 }]}
                            accessibilityRole="button"
                            accessibilityLabel={`${c.kyc.add} · ${c.kyc.docs[d.key].label}`}
                          >
                            <Plus size={15} color={S.textPrimary} />
                            <Text style={st.docAddTxt}>{c.kyc.add}</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
                <View style={st.renewNote}>
                  <Clock size={17} color={palette.or[700]} />
                  <View style={st.flex}>
                    <Text style={st.renewTitle}>{c.kyc.renewTitle}</Text>
                    <Text style={st.renewBody}>{c.kyc.renewBody}</Text>
                  </View>
                </View>
              </>
            ) : null}

            {/* ===== Step 3 — Area & availability (transport + travel-time omitted) ===== */}
            {step === 2 ? (
              <>
                <View style={st.secHead}>
                  <MapPin size={17} color={color.action} />
                  <Text style={st.secLabel}>{c.area.zonesLabel}</Text>
                </View>
                <Text style={st.secHelp}>{c.area.zonesHelp}</Text>
                <View style={st.chipsWrap}>
                  {ZONES.map((z) => {
                    const on = zones.includes(z.key);
                    return (
                      <Pressable
                        key={z.key}
                        onPress={() => toggle(zones, setZones, z.key)}
                        style={[st.chip, on && st.chipOn]}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: on }}
                        accessibilityLabel={z.label}
                      >
                        {on ? <Check size={14} color={color.onAction} /> : null}
                        <Text style={[st.chipTxt, on && st.chipTxtOn]}>{z.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={[st.secHead, { marginTop: sp.lg }]}>
                  <CalendarDays size={17} color={color.action} />
                  <Text style={st.secLabel}>{c.area.availLabel}</Text>
                </View>
                <Text style={st.secHelp}>{c.area.availHelp}</Text>
                <View style={st.availCard}>
                  <View style={st.availHeadRow}>
                    <View style={st.availLabelCell} />
                    {c.area.days.map((d) => (
                      <Text key={d} style={st.availHead}>{d}</Text>
                    ))}
                  </View>
                  {SLOTS.map((slot) => (
                    <View key={slot} style={st.availRow}>
                      <Text style={st.availRowLabel} numberOfLines={2}>{slot === 'am' ? c.area.slotAm : c.area.slotPm}</Text>
                      {c.area.days.map((day, i) => {
                        const k = `${slot}-${i}`;
                        const on = !!avail[k];
                        return (
                          <Pressable
                            key={k}
                            onPress={() => setAvail((a) => ({ ...a, [k]: !a[k] }))}
                            style={[st.availCell, on && st.availCellOn]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: on }}
                            accessibilityLabel={`${slot === 'am' ? c.area.slotAm : c.area.slotPm}, ${day} — ${on ? c.area.cellOnA11y : c.area.cellOffA11y}`}
                          >
                            {on ? <Check size={16} color={RECEIVED.fg} /> : <X size={13} color={palette.neutral[400]} />}
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {/* ===== Step 4 — Tariff & preferences + account gate ===== */}
            {step === 3 ? (
              <>
                <AuthTextField
                  label={c.tariff.rateLabel}
                  value={rate}
                  onChangeText={onEdit(setRate)}
                  placeholder="40"
                  keyboardType="number-pad"
                  help={c.tariff.rateHelp}
                  trailing={<Text style={st.suffix}>{c.tariff.rateSuffix}</Text>}
                />
                <View style={st.presetsWrap}>
                  {([
                    { key: '35', sub: c.tariff.presetJunior },
                    { key: '40', sub: c.tariff.presetStandard },
                    { key: '50', sub: c.tariff.presetSenior },
                    { key: 'perso', sub: c.tariff.presetCustom },
                  ] as const).map((p) => {
                    const on = p.key === 'perso' ? !['35', '40', '50'].includes(rate) : p.key === rate;
                    return (
                      <Pressable
                        key={p.key}
                        onPress={() => { setRate(p.key === 'perso' ? '' : p.key); clear(); }}
                        style={[st.preset, on && st.presetOn]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={p.key === 'perso' ? p.sub : `${p.key} € · ${p.sub}`}
                      >
                        {p.key === 'perso'
                          ? <Text style={[st.presetTxt, on && st.presetTxtOn]}>{p.sub}</Text>
                          : <Text style={[st.presetTxt, on && st.presetTxtOn]}>{p.key} € <Text style={[st.presetSub, on && st.presetSubOn]}>· {p.sub}</Text></Text>}
                      </Pressable>
                    );
                  })}
                </View>

                <AuthTextField
                  label={c.tariff.targetLabel}
                  value={target}
                  onChangeText={onEdit(setTarget)}
                  placeholder="15"
                  keyboardType="number-pad"
                  help={c.tariff.targetHelp}
                  trailing={<Text style={st.suffix}>{c.tariff.targetSuffix}</Text>}
                />
                <Text style={st.caTxt}>{c.tariff.caPrefix}{ca}{c.tariff.caSuffix}</Text>

                <Text style={[st.secLabel, { marginTop: sp.lg }]}>{c.tariff.specialtiesLabel}</Text>
                <Text style={st.secHelp}>{c.tariff.specialtiesHelp}</Text>
                <View style={st.chipsWrap}>
                  {SPEC_KEYS.map((k) => {
                    const on = specs.includes(k);
                    return (
                      <Pressable
                        key={k}
                        onPress={() => toggle(specs, setSpecs, k)}
                        style={[st.chip, on && st.chipOn]}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: on }}
                        accessibilityLabel={c.tariff.specialties[k]}
                      >
                        {on ? <Check size={14} color={color.onAction} /> : null}
                        <Text style={[st.chipTxt, on && st.chipTxtOn]}>{c.tariff.specialties[k]}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Account gate — what self-onboarding adds over the back-office flow. */}
                <View style={st.gateDivider} />
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
              </>
            ) : null}

            {error ? (
              <View style={st.notice} accessibilityLiveRegion="polite" accessibilityRole="alert">
                <TriangleAlert size={16} color={ERR} />
                <Text style={st.noticeErr}>{c.error}</Text>
              </View>
            ) : null}

            {/* Footer nav — a consistent two-up pair on every step (Annuler/Précédent · Continuer/
                Postuler), so the footer buttons are always the same size (each flex: 1). The long
                "Envoyer ma candidature" stays the screen-reader name; the visible label is short so
                it never truncates. The login link sits under the pair on the first step. */}
            <View style={st.navRow}>
              <SecondaryButton
                label={step === 0 ? c.cancel : c.back}
                onPress={step === 0 ? onBack : goBack}
                style={st.flex}
                accessibilityLabel={step === 0 ? c.cancel : c.back}
              />
              {step < TOTAL - 1 ? (
                <PrimaryButton label={c.cont} onPress={goNext} style={st.flex} accessibilityLabel={c.cont} />
              ) : (
                <PrimaryButton label={c.submitShort} onPress={submit} style={st.flex} accessibilityLabel={c.submit} />
              )}
            </View>
            {step === 0 ? (
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
            ) : null}
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
    backgroundColor: palette.neutral[100],
  },

  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5,
    color: color.action, marginBottom: sp.sm,
  },
  title: { fontFamily: F.display, fontSize: 40, lineHeight: 48, color: S.textPrimary },
  subtitle: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: ON_2, marginTop: sp.xs },

  googleWrap: { marginTop: sp.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: sp.md, marginVertical: sp.md },
  divLine: { flex: 1, height: 1, backgroundColor: palette.neutral[200] },
  divTxt: { fontFamily: F.body, fontSize: 13, color: palette.neutral[600] },

  stepper: { marginTop: sp.xs },
  step: { fontFamily: F.oswM, fontSize: 16, letterSpacing: 0.5, color: S.textPrimary, marginTop: sp.xs, marginBottom: sp.xs },

  fieldRow: { flexDirection: 'row', gap: sp.sm },
  eyeBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -sp.xs },
  suffix: { fontFamily: F.body, fontSize: 14, color: ON_2 },

  // Info-blue tip card (paper-tuned).
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, marginTop: sp.md,
    padding: sp.md, borderRadius: r.lg, backgroundColor: palette.bleu[50],
    borderWidth: 1, borderColor: palette.bleu[200],
  },
  tipTitle: { fontFamily: F.bodyS, fontSize: 14, lineHeight: 20, color: palette.bleu[700] },
  tipBody: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: palette.bleu[600], marginTop: 2 },

  // Section heading (Zone / Tarif sub-sections).
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp.md, marginBottom: 4 },
  secLabel: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary },
  secHelp: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: palette.neutral[600], marginBottom: sp.sm, marginTop: 2 },

  // ── KYC document rows ──
  docItem: {
    padding: sp.md, borderRadius: r.lg, borderWidth: 1, borderColor: palette.neutral[200],
    backgroundColor: palette.neutral[0], marginTop: sp.sm,
  },
  docReceived: { backgroundColor: RECEIVED.bg, borderColor: palette.vert[200] },
  docWaiting: { backgroundColor: WAITING.bg, borderColor: palette.or[200] },
  docTop: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  docIcon: {
    width: 36, height: 36, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[100], flexShrink: 0,
  },
  docMain: { flex: 1, minWidth: 0 },
  docNameRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, flexWrap: 'wrap' },
  docName: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD },
  docDesc: { fontFamily: F.body, fontSize: 12, color: ON_2, marginTop: 2 },
  tag: { borderRadius: r.pill, paddingVertical: 2, paddingHorizontal: 8 },
  tagMand: { backgroundColor: 'rgba(242,194,0,0.18)' },
  tagOpt: { backgroundColor: palette.neutral[100] },
  tagTxt: { fontFamily: F.bodyS, fontSize: 11 },
  tagTxtMand: { color: palette.or[800] },
  tagTxtOpt: { color: ON_2 },
  statusChip: {
    flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: 9, borderRadius: r.pill,
  },
  statusOpt: { backgroundColor: palette.neutral[100] },
  statusTxt: { fontFamily: F.bodyS, fontSize: 12 },
  docActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: sp.sm },
  docAdd: {
    minHeight: 36, paddingHorizontal: sp.md, borderRadius: r.button, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 5,
    borderWidth: 1.5, borderColor: palette.neutral[300], backgroundColor: palette.neutral[0],
  },
  docAddTxt: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary },
  docLink: { minHeight: 36, paddingHorizontal: sp.sm, justifyContent: 'center' },
  docLinkTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_2, textDecorationLine: 'underline' },

  renewNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, marginTop: sp.md,
    padding: sp.md, borderRadius: r.lg, backgroundColor: 'rgba(242,194,0,0.10)',
    borderWidth: 1, borderColor: palette.or[200],
  },
  renewTitle: { fontFamily: F.bodyS, fontSize: 14, lineHeight: 20, color: palette.or[800] },
  renewBody: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: palette.or[800], marginTop: 2 },

  // ── Chips (zones, specialities) ──
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: sp.md,
    borderRadius: r.pill, borderWidth: 1.5, borderColor: palette.neutral[300], backgroundColor: palette.neutral[0],
  },
  chipOn: { backgroundColor: color.action, borderColor: color.action },
  chipTxt: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary },
  chipTxtOn: { color: color.onAction },

  // ── Weekly availability grid ──
  availCard: {
    borderWidth: 1, borderColor: palette.neutral[200], borderRadius: r.lg, padding: sp.md,
    backgroundColor: palette.neutral[0],
  },
  availHeadRow: { flexDirection: 'row', alignItems: 'center', marginBottom: sp.xs },
  availLabelCell: { width: 92 },
  availHead: { flex: 1, textAlign: 'center', fontFamily: F.bodyS, fontSize: 12, color: palette.neutral[600] },
  availRow: { flexDirection: 'row', alignItems: 'center', marginTop: sp.xs },
  availRowLabel: { width: 92, fontFamily: F.bodyS, fontSize: 12, color: S.textPrimary, paddingRight: 4 },
  availCell: {
    flex: 1, height: 42, marginHorizontal: 2, borderRadius: r.sm, borderWidth: 1,
    borderColor: palette.neutral[200], alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[0],
  },
  availCellOn: { backgroundColor: RECEIVED.bg, borderColor: palette.vert[300] },

  // ── Tariff presets ──
  presetsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm, marginTop: sp.sm },
  preset: {
    minHeight: 44, paddingHorizontal: sp.md, justifyContent: 'center',
    borderRadius: r.pill, borderWidth: 1.5, borderColor: palette.neutral[300], backgroundColor: palette.neutral[0],
  },
  presetOn: { backgroundColor: color.action, borderColor: color.action },
  presetTxt: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary },
  presetTxtOn: { color: color.onAction },
  presetSub: { fontFamily: F.body, fontSize: 13, color: ON_2 },
  presetSubOn: { color: 'rgba(255,255,255,0.85)' },
  caTxt: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary, marginTop: sp.sm, fontVariant: ['tabular-nums'] },

  gateDivider: { height: 1, backgroundColor: palette.neutral[200], marginTop: sp.lg, marginBottom: sp.xs },

  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, marginTop: sp.lg, minHeight: 44 },
  box: {
    width: 24, height: 24, borderRadius: r.sm, borderWidth: 1.5, borderColor: palette.neutral[500],
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  boxOn: { backgroundColor: color.action, borderColor: color.action },
  boxErr: { borderColor: ERR },
  consentTxt: { flex: 1, fontFamily: F.body, fontSize: 16, lineHeight: 20, color: ON_2 },

  notice: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.md },
  noticeErr: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ERR },

  navRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.lg },

  altRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp.xs, marginTop: sp.lg },
  altTxt: { fontFamily: F.body, fontSize: 14, color: ON_2 },
  altLink: { fontFamily: F.bodyS, fontSize: 14, color: color.action, textDecorationLine: 'underline' },
});
