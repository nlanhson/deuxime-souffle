/**
 * CancelModal — the coach's "I can't do this session" funnel.
 *
 * Merges the old impact-aware cancel + declare-absence into ONE deliberately high-friction path (the
 * only other session-management action left is "Signaler un retard" / delay). A coach pulling out of
 * a confirmed session hurts the care home and the matching algorithm, so the flow makes the
 * consequence legible and offers TWO retain off-ramps before it will commit (PLA-11 impact-aware ·
 * PLA-13 timing penalty).
 *
 * Funnel — 3 steps + a retain intercept + a result:
 *   1 · impact     — STEP 1/3: what cancelling costs (confidence index, sessions, CA forecast).
 *                    Retain (red, dominant) on top; proceed (quiet) below.
 *       ↳ maintain — retain intercept (bottom sheet) "Vous maintenez votre présence ?": green keep /
 *                    quiet "Non, je dois annuler" → reason.
 *   2 · reason     — STEP 2/3: pick a motive (+ optional proof by email/WhatsApp, never uploaded).
 *   3 · confirm    — STEP 3/3: what will happen + a required checkbox. Retain (red) / confirm (quiet).
 *   ↳ result       — kept (session unchanged) OR cancelled (−2 pts, replacement sought).
 *
 * `onConfirm` fires ONLY when the cancellation is finally confirmed (the parent then drops the
 * session). Every retain off-ramp closes via `onClose` WITHOUT `onConfirm`, so the session stays.
 *
 * NB (mock): the impact figures (51/60, 8→7, 320→280 €) are illustrative prototype values; the real
 * app reads them from the coach's live confidence index / month count / earnings forecast. The CA
 * (revenue) line follows the client mockup — aggregate earnings are already shown elsewhere
 * (Revenus), so this doesn't breach DT-05 (which hides the per-session RATE, not earnings).
 *
 * The header steps wear the ink band (the app's "dramatic stage"; white-on-ink is AA) — there is no
 * teal token, so the mockup's teal maps to ink. Reduced motion: content swaps are instant.
 */
import React from 'react';
import { AccessibilityInfo, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  X, ChevronLeft, TriangleAlert, Heart, Euro, CalendarDays, Check, ShieldCheck, type LucideIcon,
} from '../icons';
import { palette, color, spacing as sp, radius as r, cardShape, surfaces } from '../theme/theme';
import { useCopy } from '../i18n';
import { PrimaryButton } from './PrimaryButton';

const S = surfaces.coach;
const CANVAS = S.canvas;
const CARD = palette.neutral[0];
const SUBTLE = palette.neutral[100];
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
const DIVIDER = 'rgba(24,23,21,0.07)';
const BORDER = palette.neutral[200];

// Ink header band (mockup's teal → the app's ink "stage"). White-on-ink is AA.
const INK = palette.neutral[900];
const ON_INK = palette.neutral[50];
const ON_INK_2 = palette.neutral[300];

// Tints reused across the impact rows / boxes.
const RED = { fg: palette.rouge[700], bg: 'rgba(234,56,41,0.12)' };
const GOLD = { fg: palette.or[800], bg: 'rgba(242,194,0,0.16)', border: 'rgba(242,194,0,0.45)' };
const GREEN = { fg: palette.vert[700], bg: 'rgba(47,158,107,0.14)', border: 'rgba(47,158,107,0.40)' };
const DANGER = { fg: palette.rouge[700], bg: 'rgba(232,82,72,0.10)', border: 'rgba(232,82,72,0.40)' };

// Illustrative prototype impact (matches the client mockup). Real app reads these live.
const IMPACT = {
  confidence: { from: 51, to: 49, max: 60, delta: 2 }, // −2 confidence-index points (late penalty)
  sessions: { from: 8, to: 7, delta: 1 },
  ca: { from: 320, to: 280, delta: 40 },
};

const F = { osw: 'Oswald_600SemiBold', oswB: 'Oswald_700Bold', body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold' };

type Step = 'impact' | 'reason' | 'confirm';
type ReasonKey = 'emergency' | 'accident' | 'transport' | 'other';
const REASON_ORDER: ReasonKey[] = ['emergency', 'accident', 'transport', 'other'];

export function CancelModal({
  visible, session, onClose, onConfirm,
}: {
  visible: boolean;
  session: { place: string; time: string; day: string; startsInH?: number } | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const copy = useCopy();
  const c = copy.sessions.cancelFlow;
  const insets = useSafeAreaInsets();

  const [step, setStep] = React.useState<Step>('impact');
  const [maintainOpen, setMaintainOpen] = React.useState(false);
  const [reason, setReason] = React.useState<ReasonKey | null>(null);
  const [checked, setChecked] = React.useState(false);
  const [result, setResult] = React.useState<null | 'kept' | 'cancelled'>(null);

  // Fresh funnel on every open.
  React.useEffect(() => {
    if (visible) { setStep('impact'); setMaintainOpen(false); setReason(null); setChecked(false); setResult(null); }
  }, [visible]);

  const sessionLine = session ? `${session.place} · ${session.day} · ${session.time}` : '';

  // Retain off-ramp (any "I'll go after all") — keeps the session, no onConfirm.
  const keep = () => {
    setMaintainOpen(false);
    setResult('kept');
    AccessibilityInfo.announceForAccessibility(`${c.keptTitle}. ${c.keptBody}`);
  };
  // The one committing path — drop the session (parent) + show the penalised result.
  const commit = () => {
    onConfirm();
    setResult('cancelled');
    AccessibilityInfo.announceForAccessibility(`${c.cancelledTitle}. ${c.cancelledPenalty}`);
  };

  // pageSheet sits below the status bar, so the header uses a fixed top (insets.top would over-pad,
  // matching the app's other pageSheet modals); only the footer honours the bottom safe-area inset.
  const padBottom = Math.max(insets.bottom, sp.md);

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={st.fill}>
        {result ? (
          /* ===== result — kept (retained) OR cancelled (committed, penalised) ===== */
          <View style={st.fill}>
            <View style={[st.plainHeader, { paddingTop: sp.lg }]}>
              <View style={{ flex: 1 }} />
              <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
                <X size={22} color={ON_CANVAS} />
              </Pressable>
            </View>
            <View style={st.resultPad}>
              <View style={[st.resultIcon, { backgroundColor: result === 'kept' ? GREEN.bg : DANGER.bg }]}>
                {result === 'kept'
                  ? <Heart size={40} color={GREEN.fg} />
                  : <TriangleAlert size={40} color={DANGER.fg} />}
              </View>
              <Text style={st.resultTitle} accessibilityRole="header">
                {result === 'kept' ? c.keptTitle : c.cancelledTitle}
              </Text>
              <Text style={st.resultBody}>{result === 'kept' ? c.keptBody : c.cancelledBody}</Text>
              {result === 'cancelled' ? (
                <View style={[st.penaltyPill, { backgroundColor: DANGER.bg }]}>
                  <Text style={[st.penaltyTxt, { color: DANGER.fg }]}>{c.cancelledPenalty}</Text>
                </View>
              ) : null}
            </View>
            <View style={[st.footer, { paddingBottom: padBottom }]}>
              <PrimaryButton
                label={result === 'kept' ? c.keptCta : c.cancelledCta}
                onPress={onClose}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <>
            {/* ===== ink step header — Return · STEP n/3 · title ===== */}
            <View style={[st.inkHeader, { paddingTop: sp.lg }]}>
              <View style={st.inkTopRow}>
                <Pressable
                  onPress={step === 'impact' ? onClose : () => setStep(step === 'confirm' ? 'reason' : 'impact')}
                  hitSlop={8}
                  style={({ pressed }) => [st.backBtn, pressed && { opacity: 0.6 }]}
                  accessibilityRole="button"
                  accessibilityLabel={c.backA11y}
                >
                  <ChevronLeft size={20} color={ON_INK} />
                  <Text style={st.backTxt}>{c.back}</Text>
                </Pressable>
              </View>
              <View style={st.stepPill}>
                <Text style={st.stepPillTxt}>{`${c.step} ${step === 'impact' ? 1 : step === 'reason' ? 2 : 3}/3`.toUpperCase()}</Text>
              </View>
              <Text style={st.inkTitle} accessibilityRole="header">
                {step === 'impact' ? c.step1Title : step === 'reason' ? c.step2Title : c.step3Title}
              </Text>
            </View>

            {/* ===== STEP 1/3 — impact ===== */}
            {step === 'impact' ? (
              <>
                <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
                  <View style={[st.warnBox, { backgroundColor: GOLD.bg, borderColor: GOLD.border }]}>
                    <TriangleAlert size={18} color={GOLD.fg} />
                    <Text style={[st.warnTxt, { color: GOLD.fg }]}>{c.warn}</Text>
                  </View>

                  <Text style={st.sectionLabel}>{c.impactHeading}</Text>

                  <ImpactRow
                    Icon={Heart} tint={RED}
                    label={c.impact.confidence}
                    fromTo={`${IMPACT.confidence.from}/${IMPACT.confidence.max} → ${IMPACT.confidence.to}/${IMPACT.confidence.max}`}
                    delta={`−${IMPACT.confidence.delta} ${c.impact.pts}`}
                    deltaColor={RED.fg}
                    progress={IMPACT.confidence.to / IMPACT.confidence.max}
                    first
                  />
                  <ImpactRow
                    Icon={CalendarDays} tint={GOLD}
                    label={c.impact.sessions}
                    fromTo={`${IMPACT.sessions.from} → ${IMPACT.sessions.to}`}
                    delta={`−${IMPACT.sessions.delta} ${IMPACT.sessions.delta === 1 ? c.impact.sessionOne : c.impact.sessionMany}`}
                    deltaColor={GOLD.fg}
                  />
                  <ImpactRow
                    Icon={Euro} tint={GOLD}
                    label={c.impact.ca}
                    fromTo={`${IMPACT.ca.from} € → ${IMPACT.ca.to} €`}
                    delta={`−${IMPACT.ca.delta} €`}
                    deltaColor={GOLD.fg}
                  />
                </ScrollView>

                <View style={[st.footerCol, { paddingBottom: padBottom }]}>
                  {/* retain is the dominant (red) action — the friction nudges toward keeping */}
                  <PrimaryButton label={c.keepCta} onPress={keep} style={{ alignSelf: 'stretch' }} />
                  <Pressable
                    onPress={() => setMaintainOpen(true)}
                    style={({ pressed }) => [st.ghostBtn, pressed && { opacity: 0.6 }]}
                    accessibilityRole="button"
                  >
                    <Text style={st.ghostTxt}>{c.proceedCta}</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {/* ===== STEP 2/3 — reason ===== */}
            {step === 'reason' ? (
              <>
                <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
                  <Text style={st.intro}>{c.reasonIntro}</Text>
                  <Text style={st.sectionLabel}>{c.reasonSelect}</Text>

                  {REASON_ORDER.map((key) => {
                    const rr = c.reasons[key];
                    const on = reason === key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => setReason(key)}
                        style={({ pressed }) => [st.reasonRow, on && st.reasonRowOn, pressed && { opacity: 0.85 }]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={rr.label}
                      >
                        <View style={[st.radio, on && st.radioOn]}>{on ? <View style={st.radioDot} /> : null}</View>
                        <View style={{ flex: 1 }}>
                          <Text style={st.reasonLabel}>{rr.label}</Text>
                          {rr.hint ? <Text style={st.reasonHint}>{rr.hint}</Text> : null}
                        </View>
                      </Pressable>
                    );
                  })}

                  {/* Proof is informational only — sent out-of-app (email / WhatsApp), never uploaded. */}
                  <View style={st.proofBox}>
                    <Text style={st.proofTitle}>{c.proofTitle}</Text>
                    <Text style={st.proofBody}>{c.proofBody}</Text>
                  </View>
                </ScrollView>

                <View style={[st.footer, { paddingBottom: padBottom }]}>
                  <Pressable
                    onPress={() => reason && setStep('confirm')}
                    disabled={!reason}
                    style={({ pressed }) => [st.inkBtn, !reason && st.btnDisabled, pressed && { opacity: 0.9 }]}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !reason }}
                  >
                    <Text style={st.inkBtnTxt}>{c.continue}</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {/* ===== STEP 3/3 — final confirmation ===== */}
            {step === 'confirm' ? (
              <>
                <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
                  <View style={[st.willBox, { backgroundColor: DANGER.bg, borderColor: DANGER.border }]}>
                    <Text style={[st.willTitle, { color: DANGER.fg }]}>{c.willHappenTitle}</Text>
                    <Bullet text={c.willHappen.notifyDs} tint={DANGER.fg} />
                    <Bullet text={c.willHappen.notifyEhpad} tint={DANGER.fg} />
                    <Bullet text={c.willHappen.replacement} tint={DANGER.fg} />
                    <Bullet text={c.willHappen.penalty} tint={DANGER.fg} />
                  </View>

                  <Pressable
                    onPress={() => setChecked((v) => !v)}
                    style={[st.checkRow, { backgroundColor: GOLD.bg, borderColor: GOLD.border }]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={c.confirmCheck}
                  >
                    <View style={[st.checkbox, checked && st.checkboxOn]}>{checked ? <Check size={15} color={palette.neutral[0]} strokeWidth={3} /> : null}</View>
                    <Text style={st.checkTxt}>{c.confirmCheck}</Text>
                  </Pressable>
                </ScrollView>

                <View style={[st.footerCol, { paddingBottom: padBottom }]}>
                  {/* retain stays dominant (red); committing is the quiet, gated action */}
                  <PrimaryButton label={c.abortCta} onPress={keep} style={{ alignSelf: 'stretch' }} />
                  <Pressable
                    onPress={() => checked && commit()}
                    disabled={!checked}
                    style={({ pressed }) => [st.ghostBtn, !checked && st.btnDisabled, pressed && { opacity: 0.6 }]}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !checked }}
                  >
                    <Text style={[st.ghostTxt, st.ghostDanger]}>{c.confirmCta}</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {/* ===== retain intercept — "Vous maintenez votre présence ?" (bottom sheet over step 1) ===== */}
            {maintainOpen ? (
              <View style={st.overlay}>
                <Pressable style={st.scrim} onPress={() => setMaintainOpen(false)} accessibilityRole="button" accessibilityLabel={c.closeA11y} />
                <View style={[st.sheet, { paddingBottom: padBottom }]}>
                  <View style={st.grabber} />
                  <View style={[st.sheetIcon, { backgroundColor: GREEN.bg }]}>
                    <Heart size={32} color={GREEN.fg} />
                  </View>
                  <Text style={st.sheetTitle} accessibilityRole="header">{c.maintain.title}</Text>
                  {session ? <Text style={st.sheetSession}>{sessionLine}</Text> : null}
                  <Text style={st.sheetBody}>{c.maintain.body}</Text>

                  <View style={[st.preservedBox, { backgroundColor: GOLD.bg, borderColor: GOLD.border }]}>
                    <View style={st.preservedHead}>
                      <ShieldCheck size={16} color={GOLD.fg} />
                      <Text style={[st.preservedTitle, { color: GOLD.fg }]}>{c.maintain.preservedTitle}</Text>
                    </View>
                    <Text style={st.preservedTxt}>
                      {`${c.maintain.preservedConfidence} ${IMPACT.confidence.from}/${IMPACT.confidence.max} ${c.maintain.preservedMaintained} · ${c.maintain.preservedSession} · ${c.maintain.preservedCa} ${IMPACT.ca.from} €`}
                    </Text>
                  </View>

                  <Pressable onPress={keep} style={({ pressed }) => [st.greenBtn, pressed && { opacity: 0.9 }]} accessibilityRole="button">
                    <Text style={st.greenTxt}>{c.maintain.yes}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setMaintainOpen(false); setStep('reason'); }}
                    style={({ pressed }) => [st.ghostBtn, pressed && { opacity: 0.6 }]}
                    accessibilityRole="button"
                  >
                    <Text style={st.ghostTxt}>{c.maintain.no}</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </>
        )}
      </View>
    </Modal>
  );
}

// One impact row — icon chip · label + before→after · delta, with an optional progress bar.
function ImpactRow({ Icon, tint, label, fromTo, delta, deltaColor, progress, first }: {
  Icon: LucideIcon; tint: { fg: string; bg: string }; label: string; fromTo: string;
  delta: string; deltaColor: string; progress?: number; first?: boolean;
}) {
  return (
    <View style={[st.impactRow, first && { marginTop: sp.sm }]}>
      <View style={st.impactTop}>
        <View style={[st.impactChip, { backgroundColor: tint.bg }]}>
          <Icon size={18} color={tint.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.impactLabel}>{label}</Text>
          <Text style={st.impactValue}>{fromTo}</Text>
        </View>
        <Text style={[st.impactDelta, { color: deltaColor }]}>{delta}</Text>
      </View>
      {progress != null ? (
        <View style={st.barTrack}>
          <View style={[st.barFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

// One "what will happen" bullet.
function Bullet({ text, tint }: { text: string; tint: string }) {
  return (
    <View style={st.bulletRow}>
      <Text style={[st.bulletDot, { color: tint }]}>·</Text>
      <Text style={[st.bulletTxt, { color: tint }]}>{text}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: CANVAS },

  /* ink step header */
  inkHeader: { backgroundColor: INK, paddingHorizontal: sp.lg, paddingBottom: sp.lg },
  inkTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: -4, paddingVertical: 6 },
  backTxt: { fontFamily: F.body, fontSize: 15, color: ON_INK },
  stepPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: r.pill, paddingHorizontal: 10, paddingVertical: 4, marginTop: sp.sm },
  stepPillTxt: { fontFamily: F.bodyS, fontSize: 11, letterSpacing: 1, color: ON_INK_2 },
  inkTitle: { fontFamily: F.oswB, fontSize: 26, color: ON_INK, marginTop: sp.sm },

  /* plain (result) header */
  plainHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sp.lg, paddingBottom: sp.sm },
  close: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: SUBTLE },

  scroll: { paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.lg },
  intro: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CANVAS_2, marginBottom: sp.lg },
  sectionLabel: { fontFamily: F.osw, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2, textTransform: 'uppercase', marginBottom: sp.sm },

  /* step 1 — warning + impact rows */
  warnBox: { flexDirection: 'row', gap: sp.sm, ...cardShape, borderWidth: 1, padding: sp.md, marginBottom: sp.lg },
  warnTxt: { flex: 1, fontFamily: F.bodyS, fontSize: 14, lineHeight: 20 },
  impactRow: { backgroundColor: CARD, ...cardShape, borderWidth: 1, borderColor: DIVIDER, padding: sp.md, marginBottom: sp.sm },
  impactTop: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  impactChip: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  impactLabel: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2 },
  impactValue: { fontFamily: F.bodyS, fontSize: 16, color: ON_CANVAS, marginTop: 1 },
  impactDelta: { fontFamily: F.oswB, fontSize: 15 },
  barTrack: { height: 6, borderRadius: r.pill, backgroundColor: palette.neutral[200], marginTop: sp.sm, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: r.pill, backgroundColor: palette.rouge[500] },

  /* step 2 — reasons + proof */
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.md, borderWidth: 1, borderColor: BORDER, ...cardShape, padding: sp.md, marginBottom: sp.sm, backgroundColor: CARD },
  reasonRowOn: { borderColor: palette.rouge[400], backgroundColor: 'rgba(234,56,41,0.05)' },
  radio: { width: 22, height: 22, borderRadius: 999, borderWidth: 2, borderColor: palette.neutral[400], alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioOn: { borderColor: color.action },
  radioDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: color.action },
  reasonLabel: { fontFamily: F.bodyS, fontSize: 16, color: ON_CANVAS },
  reasonHint: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: ON_CANVAS_2, marginTop: 3 },
  proofBox: { backgroundColor: palette.bleu[50], ...cardShape, padding: sp.md, marginTop: sp.sm },
  proofTitle: { fontFamily: F.bodyS, fontSize: 14, color: palette.bleu[700], marginBottom: 4 },
  proofBody: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: palette.bleu[700] },

  /* step 3 — what happens + checkbox */
  willBox: { ...cardShape, borderWidth: 1, padding: sp.md, marginBottom: sp.md },
  willTitle: { fontFamily: F.bodyS, fontSize: 15, lineHeight: 21, marginBottom: sp.sm },
  bulletRow: { flexDirection: 'row', gap: sp.sm, marginTop: 4 },
  bulletDot: { fontFamily: F.bodyS, fontSize: 14, lineHeight: 20 },
  bulletTxt: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, ...cardShape, borderWidth: 1, padding: sp.md },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: palette.neutral[400], alignItems: 'center', justifyContent: 'center', backgroundColor: CARD },
  checkboxOn: { backgroundColor: color.action, borderColor: color.action },
  checkTxt: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ON_CANVAS },

  /* footers */
  footer: { paddingHorizontal: sp.lg, paddingTop: sp.sm, borderTopWidth: 1, borderTopColor: DIVIDER, flexDirection: 'row' },
  footerCol: { paddingHorizontal: sp.lg, paddingTop: sp.sm, borderTopWidth: 1, borderTopColor: DIVIDER, gap: sp.sm },
  ghostBtn: { minHeight: 48, borderRadius: r.button, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', backgroundColor: CARD },
  ghostTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CANVAS_2 },
  ghostDanger: { color: palette.rouge[700] },
  inkBtn: { flex: 1, minHeight: 50, borderRadius: r.button, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  inkBtnTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_INK },
  greenBtn: { minHeight: 50, borderRadius: r.button, backgroundColor: palette.vert[500], alignItems: 'center', justifyContent: 'center' },
  greenTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: palette.neutral[0] },
  btnDisabled: { opacity: 0.4 },

  /* retain intercept (bottom sheet) */
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { backgroundColor: CANVAS, borderTopLeftRadius: r.xl, borderTopRightRadius: r.xl, paddingHorizontal: sp.lg, paddingTop: sp.sm, alignItems: 'center' },
  grabber: { width: 36, height: 4, borderRadius: r.pill, backgroundColor: palette.neutral[300], marginBottom: sp.lg },
  sheetIcon: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontFamily: F.oswB, fontSize: 22, color: ON_CANVAS, textAlign: 'center', marginTop: sp.md },
  sheetSession: { fontFamily: F.bodyS, fontSize: 13, color: ON_CANVAS_2, textAlign: 'center', marginTop: 4 },
  sheetBody: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CANVAS_2, textAlign: 'center', marginTop: sp.sm },
  preservedBox: { alignSelf: 'stretch', ...cardShape, borderWidth: 1, padding: sp.md, marginTop: sp.lg, marginBottom: sp.md },
  preservedHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  preservedTitle: { fontFamily: F.bodyS, fontSize: 14 },
  preservedTxt: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: palette.or[900] },

  /* result */
  resultPad: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sp.xl },
  resultIcon: { width: 80, height: 80, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontFamily: F.oswB, fontSize: 24, color: ON_CANVAS, marginTop: sp.lg, textAlign: 'center' },
  resultBody: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CANVAS_2, textAlign: 'center', marginTop: sp.sm },
  penaltyPill: { ...cardShape, paddingHorizontal: sp.md, paddingVertical: sp.sm, marginTop: sp.lg },
  penaltyTxt: { fontFamily: F.bodyS, fontSize: 14, textAlign: 'center' },
});
