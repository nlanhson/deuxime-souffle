/**
 * Coach · Account pending validation (E01 — the PENDING_APPROVAL screen).
 *
 * Where a freshly-registered coach lands. The brief locks the rest of the app while an account is
 * pending — so this is the ONLY screen shown in that state (mounted by App's auth gate), with the
 * KYC document checklist (CV · URSSAF · insurance · APA diploma), a per-document received/pending
 * status (WBS AUTH-19), the indicative processing time, and the "Complete my application" action.
 * Document upload is the next slice (stubbed here via BlankScreen). Log out is available so the
 * coach is never truly trapped. A rejected application would get its own screen + resubmit flow
 * (deferred). Surface = coach (ink); cards reuse the shared raised-card gradient.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, color, spacing as sp, radius as r, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';
import { BlankScreen } from '../components/BlankScreen';
import { useAuth } from '../auth/AuthContext';
import {
  ChevronLeft, Hourglass, Plus, Check, Clock, FileText, ScrollText, ShieldCheck, GraduationCap,
  type LucideIcon,
} from '../icons';

const S = surfaces.coach;
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const DIVIDER = palette.neutral[700];
const PENDING = { fg: palette.or[300], bg: 'rgba(242,194,0,0.13)' }; // on-ink pending tone
const RECEIVED = { fg: palette.vert[300], bg: 'rgba(47,158,107,0.14)' }; // on-ink received tone
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

// Mock per-document statuses (AUTH-19): the CV and URSSAF made it in with the application;
// insurance + diploma are still to add. Real code reads these from the application record.
const DOCS: { key: keyof typeof copy.auth.pending.docs; icon: LucideIcon; received: boolean }[] = [
  { key: 'cv', icon: FileText, received: true },
  { key: 'urssaf', icon: ScrollText, received: true },
  { key: 'insurance', icon: ShieldCheck, received: false },
  { key: 'diploma', icon: GraduationCap, received: false },
];

export function PendingApprovalScreen() {
  const c = copy.auth.pending;
  const { applicantName, backToSignup } = useAuth();
  const [docsOpen, setDocsOpen] = useState(false);

  const body = applicantName ? `${c.bodyPrefix}${applicantName}${c.bodySuffix}` : c.bodyNoName;

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      {/* Top bar — a plain back button out (this is a mock; the pending state isn't framed as a
          real logged-in session). It returns to the Apply-to-coach form. */}
      <View style={st.topbar}>
        <Pressable
          onPress={backToSignup}
          hitSlop={8}
          style={({ pressed }) => [st.backBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={c.backA11y}
        >
          <ChevronLeft size={24} color={S.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {/* Status hero */}
        <View style={st.hero}>
          <View style={st.iconChip}>
            <Hourglass size={30} color={PENDING.fg} />
          </View>
          <View style={st.statusChip}>
            <Text style={st.statusTxt}>{c.statusChip}</Text>
          </View>
          <Text style={st.eyebrow}>{c.eyebrow}</Text>
          <Text style={st.title}>{c.title}</Text>
          <Text style={st.body}>{body}</Text>
          {/* Indicative processing time (AUTH-19) — its own visible line, not buried in prose. */}
          <View style={st.timeRow}>
            <Clock size={15} color={ON_CARD_2} />
            <Text style={st.timeTxt}>{c.processingTime}</Text>
          </View>
        </View>

        {/* KYC documents checklist */}
        <Text style={st.docsEyebrow}>{c.docsEyebrow}</Text>
        <Text style={st.docsNote}>{c.docsNote}</Text>
        <View style={st.card}>
          <LinearGradient
            colors={RAISED_GRAD}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: r.xl }]}
            pointerEvents="none"
          />
          {DOCS.map((d, i) => (
            <View key={d.key} style={[st.docRow, i > 0 && st.docDivider]}>
              <View style={st.docIcon}>
                <d.icon size={18} color={ON_CARD_2} />
              </View>
              <Text style={st.docLabel} numberOfLines={1}>{c.docs[d.key]}</Text>
              {/* Received vs to-add (AUTH-19) — icon + word, never colour alone. */}
              {d.received ? (
                <View style={[st.docChip, st.docChipReceived]}>
                  <Check size={12} color={RECEIVED.fg} />
                  <Text style={[st.docChipTxt, { color: RECEIVED.fg }]}>{c.docStatusReceived}</Text>
                </View>
              ) : (
                <View style={st.docChip}>
                  <Plus size={12} color={PENDING.fg} />
                  <Text style={st.docChipTxt}>{c.docStatusMissing}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <PrimaryButton label={c.complete} onPress={() => setDocsOpen(true)} style={st.cta} accessibilityLabel={c.complete} />
      </ScrollView>

      {/* Document upload — the next slice (stubbed). */}
      <BlankScreen visible={docsOpen} onClose={() => setDocsOpen(false)} title={c.complete} body={c.completeBody} Icon={FileText} />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: S.canvas },
  flex: { flex: 1 },

  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sp.lg, paddingTop: sp.sm },
  backBtn: {
    width: 44, height: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[800],
  },

  scroll: { paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp['2xl'] },

  /* hero */
  hero: { alignItems: 'center', paddingBottom: sp.xl },
  iconChip: {
    width: 88, height: 88, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PENDING.bg, marginBottom: sp.md,
  },
  statusChip: {
    backgroundColor: PENDING.bg, borderRadius: r.pill, paddingVertical: 4, paddingHorizontal: 12, marginBottom: sp.md,
  },
  statusTxt: { fontFamily: F.bodyS, fontSize: 12, letterSpacing: 0.3, color: PENDING.fg },
  // Sentence case (brand rule: no all-caps).
  eyebrow: {
    fontFamily: F.oswS, fontSize: 12, letterSpacing: 0.5,
    color: palette.neutral[500], marginBottom: sp.xs,
  },
  // Anton: lineHeight ≥1.2× the size avoids the clip.
  title: { fontFamily: F.display, fontSize: 34, lineHeight: 41, color: S.textPrimary, textAlign: 'center' },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 23, color: ON_CARD_2, textAlign: 'center', marginTop: sp.sm, maxWidth: 340 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp.md },
  timeTxt: { fontFamily: F.bodyS, fontSize: 13, color: ON_CARD_2 },

  /* documents */
  docsEyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: palette.neutral[400], marginBottom: 4 },
  docsNote: { fontFamily: F.body, fontSize: 13, color: palette.neutral[500], marginBottom: sp.sm },
  card: {
    backgroundColor: palette.neutral[800], borderRadius: r.xl, paddingHorizontal: sp.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 60, paddingVertical: sp.sm },
  docDivider: { borderTopWidth: 1, borderTopColor: DIVIDER },
  docIcon: {
    width: 34, height: 34, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[900],
  },
  docLabel: { flex: 1, fontFamily: F.oswS, fontSize: 16, color: ON_CARD },
  docChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: PENDING.bg, borderRadius: r.pill, paddingVertical: 4, paddingHorizontal: 9,
  },
  docChipReceived: { backgroundColor: RECEIVED.bg },
  docChipTxt: { fontFamily: F.body, fontSize: 12, color: PENDING.fg },

  cta: { width: '100%', marginTop: sp.lg },
});
