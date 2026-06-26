/**
 * Coach · Account pending validation (E01 — the PENDING_APPROVAL screen).
 *
 * Where a freshly-registered coach lands. The brief locks the rest of the app while an account is
 * pending — so this is the ONLY screen shown in that state (mounted by App's auth gate), with the
 * KYC document checklist (CV · URSSAF · insurance · APA diploma), a per-document received/pending
 * status (WBS AUTH-19), the indicative processing time, and the "Complete my application" action.
 * "Complete my application" opens the KYC document upload (UploadDocumentsScreen), which shares the
 * doc statuses lifted here so the checklist updates live as documents are added. A rejected
 * application would get its own screen + resubmit flow (deferred). Surface = coach (paper canvas).
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, color, spacing as sp, radius as r, cardShape, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { useCopy } from '../i18n';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../auth/AuthContext';
import { UploadDocumentsScreen, DOC_META, INITIAL_DOCS, type DocStatuses } from './UploadDocumentsScreen';
import { ChevronLeft, Hourglass, Plus, Check, Clock } from '../icons';

const S = surfaces.coach;
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const DIVIDER = palette.neutral[200];
const PENDING = { fg: palette.or[800], bg: 'rgba(242,194,0,0.16)' }; // on-paper pending tone — dark amber holds AA on the cream wash (was ink-era or[300])
const RECEIVED = { fg: palette.vert[700], bg: 'rgba(47,158,107,0.16)' }; // on-paper received tone — matches EmailVerify's paper-tuned green (was ink-era vert[300])
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

export function PendingApprovalScreen() {
  const copy = useCopy();
  const c = copy.auth.pending;
  const { applicantName, backToSignup, approve } = useAuth();
  const [docsOpen, setDocsOpen] = useState(false);
  // KYC document statuses — lifted here so the checklist below and the upload screen share one
  // source of truth (uploading on the upload screen updates this checklist live). AUTH-19.
  const [docs, setDocs] = useState<DocStatuses>(INITIAL_DOCS);

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
            style={[StyleSheet.absoluteFill, cardShape]}
            pointerEvents="none"
          />
          {DOC_META.map((d, i) => (
            <View key={d.key} style={[st.docRow, i > 0 && st.docDivider]}>
              <View style={st.docIcon}>
                <d.icon size={18} color={ON_CARD_2} />
              </View>
              <Text style={st.docLabel} numberOfLines={1}>{c.docs[d.key]}</Text>
              {/* Received vs to-add (AUTH-19) — icon + word, never colour alone. */}
              {docs[d.key].received ? (
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

        {/* PROTOTYPE-ONLY: there's no validation backend yet, so this stands in for an admin
            approving the account → the welcome/accepted screen. Clearly labelled "Aperçu" so it
            never reads as a real coach action. Remove once the real status arrives from the backend. */}
        <Pressable
          onPress={approve}
          hitSlop={8}
          style={({ pressed }) => [st.demoBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel={c.demoApprove}
        >
          <Text style={st.demoTxt}>{c.demoApprove}</Text>
        </Pressable>
      </ScrollView>

      {/* KYC document upload (AUTH-19) — shares the doc statuses with the checklist above. */}
      <UploadDocumentsScreen visible={docsOpen} onClose={() => setDocsOpen(false)} docs={docs} onChange={setDocs} />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: S.canvas },
  flex: { flex: 1 },

  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sp.lg, paddingTop: sp.sm },
  backBtn: {
    width: 44, height: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[100],
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
  statusTxt: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.3, color: PENDING.fg },
  // Sentence case (brand rule: no all-caps).
  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5,
    color: palette.neutral[600], marginBottom: sp.xs,
  },
  // Anton: lineHeight ≥1.2× the size avoids the clip.
  title: { fontFamily: F.display, fontSize: 34, lineHeight: 41, color: S.textPrimary, textAlign: 'center' },
  body: { fontFamily: F.body, fontSize: 16, lineHeight: 23, color: ON_CARD_2, textAlign: 'center', marginTop: sp.sm, maxWidth: 340 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp.md },
  timeTxt: { fontFamily: F.bodyS, fontSize: 13, color: ON_CARD_2 },

  /* documents */
  docsEyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: palette.neutral[600], marginBottom: 4 },
  docsNote: { fontFamily: F.body, fontSize: 13, color: palette.neutral[600], marginBottom: sp.sm },
  card: {
    backgroundColor: palette.neutral[0], ...cardShape, paddingHorizontal: sp.lg,
    borderWidth: 1, borderColor: palette.neutral[200],
  },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 60, paddingVertical: sp.sm },
  docDivider: { borderTopWidth: 1, borderTopColor: DIVIDER },
  docIcon: {
    width: 34, height: 34, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[100],
  },
  docLabel: { flex: 1, fontFamily: F.oswS, fontSize: 16, color: ON_CARD },
  docChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: PENDING.bg, borderRadius: r.pill, paddingVertical: 4, paddingHorizontal: 9,
  },
  docChipReceived: { backgroundColor: RECEIVED.bg },
  docChipTxt: { fontFamily: F.body, fontSize: 13, color: PENDING.fg },

  cta: { width: '100%', marginTop: sp.lg },

  /* prototype-only demo control */
  demoBtn: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: sp.md, marginTop: sp.md },
  demoTxt: { fontFamily: F.body, fontSize: 13, color: palette.neutral[600], textDecorationLine: 'underline' },
});
