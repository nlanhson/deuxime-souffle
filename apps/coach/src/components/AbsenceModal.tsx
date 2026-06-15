/**
 * AbsenceModal (C20 / WBS PLA-11) — "Declare absence" for an assigned session, opened from the
 * session detail's Manage group.
 *
 * The WBS specifies a 3-STEP required form (not a one-tap confirm): 1 pick a reason (required)
 * → 2 message to the care home (optional, sent with the notification) → 3 review + confirm. The
 * deliberate pacing is the point — an absence excludes the coach from matching for that slot and
 * weighs on the reputation score, so the form makes the coach look at what they're sending.
 *
 * A pageSheet modal (like TransmissionNotes) rather than a bottom sheet, because step 2 carries
 * a text field that must ride above the keyboard. Step transitions are instant content swaps —
 * no slide — so there's nothing to suppress under reduced motion. On confirm, the screen drops
 * the session from the list (the real app persists reason + message and notifies the care home).
 */
import React from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { CalendarX, X } from '../icons';
import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';

const S = surfaces.coach;
const CANVAS = S.canvas;
const CARD = S.surface;
const SUBTLE = palette.neutral[800];
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];
const DANGER = palette.rouge[300];
const DIVIDER = 'rgba(255,255,255,0.08)';

const F = { oswS: 'Oswald_600SemiBold', body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold', bodyB: 'Inter_700Bold' };

const C = copy.sessions.absenceModal;

export type AbsenceReason = keyof typeof C.reasons;
const REASON_ORDER: AbsenceReason[] = ['illness', 'emergency', 'transport', 'other'];
const STEPS = ['reason', 'details', 'confirm'] as const;
type Step = (typeof STEPS)[number];

export function AbsenceModal({
  visible, session, onClose, onConfirm,
}: {
  visible: boolean;
  session: { place: string; time: string; day: string } | null;
  onClose: () => void;
  onConfirm: (reason: AbsenceReason, message?: string) => void;
}) {
  const [step, setStep] = React.useState<Step>('reason');
  const [reason, setReason] = React.useState<AbsenceReason | null>(null);
  const [message, setMessage] = React.useState('');

  // Reset the whole form each time it opens.
  React.useEffect(() => { if (visible) { setStep('reason'); setReason(null); setMessage(''); } }, [visible]);

  const stepIdx = STEPS.indexOf(step);
  const canContinue = step === 'reason' ? reason !== null : true;

  const next = () => {
    if (step === 'reason' && reason) setStep('details');
    else if (step === 'details') setStep('confirm');
    else if (step === 'confirm' && reason) { onConfirm(reason, message.trim() || undefined); onClose(); }
  };
  const back = () => {
    if (step === 'details') setStep('reason');
    else if (step === 'confirm') setStep('details');
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={st.fill}>
        {/* header */}
        <View style={st.header}>
          <Text style={st.headerTitle}>{C.title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={C.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {session ? <Text style={st.session}>{`${session.place} · ${session.day} · ${session.time}`}</Text> : null}
            <Text style={st.intro}>{C.body}</Text>

            {/* Step indicator — dots + a spoken "Step N of 3 — Label" line. */}
            <View style={st.stepHead} accessibilityLiveRegion="polite">
              <View style={st.dots}>
                {STEPS.map((s, i) => (
                  <View key={s} style={[st.stepDot, i <= stepIdx && st.stepDotOn]} />
                ))}
              </View>
              <Text style={st.stepTxt}>
                {`${C.stepPrefix} ${stepIdx + 1} ${C.stepOf} ${STEPS.length}: ${C.steps[step]}`}
              </Text>
            </View>

            {step === 'reason' ? (
              /* ===== 1 · reason (required) ===== */
              <View style={st.card}>
                <Text style={st.fieldLabel}>{C.reasonLabel}</Text>
                <View style={st.reasonRow}>
                  {REASON_ORDER.map((rk) => {
                    const on = reason === rk;
                    return (
                      <Pressable
                        key={rk}
                        onPress={() => setReason(rk)}
                        style={[st.chip, on && st.chipOn]}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        accessibilityLabel={C.reasons[rk]}
                      >
                        <Text style={[st.chipTxt, on && st.chipTxtOn]}>{C.reasons[rk]}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : step === 'details' ? (
              /* ===== 2 · message to the care home (optional) ===== */
              <View style={st.card}>
                <View style={st.labelRow}>
                  <Text style={st.fieldLabel}>{C.detailsLabel}</Text>
                  <Text style={st.optional}>{C.detailsOptional}</Text>
                </View>
                <TextInput
                  style={st.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={C.detailsPlaceholder}
                  placeholderTextColor={ON_CARD_3}
                  multiline
                  accessibilityLabel={C.detailsLabel}
                />
                <Text style={st.helpTxt}>{C.detailsHelp}</Text>
              </View>
            ) : (
              /* ===== 3 · review + confirm ===== */
              <View style={st.card}>
                <View style={st.sumRow}>
                  <Text style={st.sumLabel}>{C.summaryReason}</Text>
                  <Text style={st.sumValue}>{reason ? C.reasons[reason] : ''}</Text>
                </View>
                <View style={[st.sumRow, st.sumDivider]}>
                  <Text style={st.sumLabel}>{C.summaryMessage}</Text>
                  <Text style={[st.sumValue, !message.trim() && { color: ON_CARD_3 }]}>
                    {message.trim() || C.summaryNone}
                  </Text>
                </View>
                <View style={st.noteWrap}>
                  <CalendarX size={15} color={DANGER} />
                  <Text style={st.noteTxt}>{C.note}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* footer — back (from step 2) + continue / confirm */}
          <View style={st.footer}>
            {stepIdx > 0 ? (
              <Pressable style={({ pressed }) => [st.backBtn, pressed && { opacity: 0.7 }]} onPress={back} accessibilityRole="button">
                <Text style={st.backTxt}>{C.back}</Text>
              </Pressable>
            ) : (
              <Pressable style={({ pressed }) => [st.backBtn, pressed && { opacity: 0.7 }]} onPress={onClose} accessibilityRole="button">
                <Text style={st.backTxt}>{C.cancel}</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [st.primary, step === 'confirm' && st.primaryDanger, !canContinue && st.primaryDisabled, pressed && canContinue && { opacity: 0.9 }]}
              onPress={next}
              disabled={!canContinue}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canContinue }}
            >
              <Text style={st.primaryTxt}>{step === 'confirm' ? C.confirm : C.next}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: CANVAS },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  headerTitle: { fontFamily: F.oswS, fontSize: 22, color: ON_CANVAS },
  close: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  scroll: { paddingHorizontal: sp.lg, paddingBottom: sp.lg },

  session: { fontFamily: F.bodyS, fontSize: 14, color: ON_CANVAS_2 },
  intro: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CANVAS_2, marginTop: sp.xs },

  stepHead: { marginTop: sp.lg, marginBottom: sp.sm },
  dots: { flexDirection: 'row', gap: 6 },
  stepDot: { flex: 1, height: 4, borderRadius: 999, backgroundColor: palette.neutral[700] },
  stepDotOn: { backgroundColor: color.action },
  stepTxt: { fontFamily: F.oswS, fontSize: 14, letterSpacing: 0.3, color: ON_CANVAS, marginTop: sp.sm },

  card: {
    backgroundColor: CARD, borderRadius: r.xl, padding: sp.lg,
    borderWidth: 1, borderColor: DIVIDER,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD },
  optional: { fontFamily: F.body, fontSize: 12, color: ON_CARD_3 },

  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm, marginTop: sp.sm },
  chip: {
    minHeight: 44, paddingVertical: 10, paddingHorizontal: 14, borderRadius: r.pill,
    backgroundColor: palette.neutral[900], borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  chipOn: { borderColor: DANGER, backgroundColor: 'rgba(225,50,43,0.14)' },
  chipTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },
  chipTxtOn: { color: DANGER },

  input: {
    minHeight: 96, maxHeight: 160, backgroundColor: palette.neutral[900], borderRadius: r.lg,
    paddingHorizontal: sp.md, paddingTop: sp.sm, paddingBottom: sp.sm, marginTop: sp.sm,
    fontFamily: F.body, fontSize: 15, color: ON_CARD, textAlignVertical: 'top',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  helpTxt: { fontFamily: F.body, fontSize: 12, lineHeight: 17, color: ON_CARD_3, marginTop: sp.sm },

  sumRow: { paddingVertical: sp.sm },
  sumDivider: { borderTopWidth: 1, borderTopColor: DIVIDER },
  sumLabel: { fontFamily: F.body, fontSize: 12, color: ON_CARD_3 },
  sumValue: { fontFamily: F.bodyS, fontSize: 15, lineHeight: 21, color: ON_CARD, marginTop: 2 },
  noteWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, marginTop: sp.sm },
  noteTxt: { flex: 1, fontFamily: F.body, fontSize: 13, lineHeight: 19, color: ON_CARD_3 },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    paddingHorizontal: sp.lg, paddingTop: sp.sm, paddingBottom: sp.xl,
    borderTopWidth: 1, borderTopColor: DIVIDER,
  },
  backBtn: { minHeight: 48, paddingHorizontal: sp.lg, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CANVAS_2 },
  primary: {
    flex: 1, minHeight: 48, borderRadius: r.pill, backgroundColor: color.action,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryDanger: { backgroundColor: palette.rouge[600] },
  primaryDisabled: { opacity: 0.4 },
  primaryTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
});
