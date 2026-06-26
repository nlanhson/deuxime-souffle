/**
 * Coach · Upload KYC documents (E01 / AUTH-19) — the screen behind the pending screen's
 * "Compléter ma candidature". Replaces the earlier BlankScreen stub.
 *
 * Lists the four required documents (CV · URSSAF · professional insurance · APA diploma), each with
 * its received/missing status and per-document upload / replace / remove actions. Uploading a doc
 * flips its status, which the pending screen's checklist reflects (shared state, lifted to the
 * parent — single source of truth).
 *
 * PROTOTYPE: the app has no native file picker installed (pickers are mocked, like the profile
 * photo), so "Choisir un fichier" / "Prendre une photo" simulate an upload (a brief progress beat →
 * received). Real code swaps the OptionSheet for expo-document-picker / expo-image-picker → upload →
 * the returned file ref. Surface = coach (paper canvas, white cards, dark text). Motion: a native
 * ActivityIndicator during the mock upload; nothing else animates (reduced-motion safe).
 */
import React from 'react';
import { AccessibilityInfo, ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { X, Check, Plus, Camera, FileText, ScrollText, ShieldCheck, GraduationCap, type LucideIcon } from '../icons';
import { palette, color, spacing as sp, radius as r, cardShape, surfaces } from '../theme/theme';
import { useCopy } from '../i18n';
import type { Copy } from '../copy';
import { OptionSheet } from '../components/OptionSheet';
import { PrimaryButton } from '../components/PrimaryButton';

const S = surfaces.coach;
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const DIVIDER = 'rgba(24,23,21,0.08)';
// Paper-tuned tones (match PendingApprovalScreen): dark amber + dark green hold AA on the cream wash.
const PENDING = { fg: palette.or[800], bg: 'rgba(242,194,0,0.16)' };
const RECEIVED = { fg: palette.vert[700], bg: 'rgba(47,158,107,0.16)' };

const F = {
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

export type DocKey = keyof Copy['auth']['pending']['docs'];
export type DocStatus = { received: boolean; file?: string };
export type DocStatuses = Record<DocKey, DocStatus>;

// The four KYC documents (AUTH-19), in order. Icons live here; mutable status lives in parent state.
export const DOC_META: { key: DocKey; icon: LucideIcon }[] = [
  { key: 'cv', icon: FileText },
  { key: 'urssaf', icon: ScrollText },
  { key: 'insurance', icon: ShieldCheck },
  { key: 'diploma', icon: GraduationCap },
];

// Seed: CV + URSSAF arrived with the application; insurance + diploma are still to add.
export const INITIAL_DOCS: DocStatuses = {
  cv: { received: true, file: 'cv-karim-benali.pdf' },
  urssaf: { received: true, file: 'attestation-urssaf-2024.pdf' },
  insurance: { received: false },
  diploma: { received: false },
};

const UPLOAD_MS = 700; // mock upload duration

export function UploadDocumentsScreen({
  visible, onClose, docs, onChange,
}: {
  visible: boolean;
  onClose: () => void;
  docs: DocStatuses;
  onChange: React.Dispatch<React.SetStateAction<DocStatuses>>;
}) {
  const copy = useCopy();
  const c = copy.auth.pending.upload;
  const names = copy.auth.pending.docs;
  const insets = useSafeAreaInsets();

  const [pickFor, setPickFor] = React.useState<DocKey | null>(null);
  const [uploading, setUploading] = React.useState<DocKey[]>([]);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear pending mock-upload timers + transient state when the sheet closes.
  React.useEffect(() => {
    if (!visible) {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setUploading([]);
      setPickFor(null);
    }
  }, [visible]);
  // Belt-and-braces: clear any timers on unmount.
  React.useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const fileName = (key: DocKey, method: string) => `${key}.${method === 'photo' ? 'jpg' : 'pdf'}`;

  // Mock upload: show a brief progress beat, then mark received. Functional setState avoids any
  // stale-closure issue if several docs upload at once.
  const startUpload = (key: DocKey, method: string) => {
    setUploading((u) => (u.includes(key) ? u : [...u, key]));
    const t = setTimeout(() => {
      onChange((prev) => ({ ...prev, [key]: { received: true, file: fileName(key, method) } }));
      setUploading((u) => u.filter((k) => k !== key));
      AccessibilityInfo.announceForAccessibility(`${names[key]} · ${c.received}`);
    }, UPLOAD_MS);
    timers.current.push(t);
  };

  const remove = (key: DocKey) => onChange((prev) => ({ ...prev, [key]: { received: false } }));

  const remaining = DOC_META.filter((d) => !docs[d.key].received).length;

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={st.fill}>
        {/* header */}
        <View style={st.header}>
          <Text style={st.title} accessibilityRole="header">{c.title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={S.textPrimary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
          <Text style={st.intro}>{c.intro}</Text>
          <Text style={st.formats}>{c.formats}</Text>

          {DOC_META.map((d) => {
            const status = docs[d.key];
            const busy = uploading.includes(d.key);
            return (
              <View key={d.key} style={st.docCard}>
                <View style={st.docTop}>
                  <View style={st.docIcon}><d.icon size={18} color={ON_CARD_2} /></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={st.docName} numberOfLines={1}>{names[d.key]}</Text>
                    <Text style={st.docMeta} numberOfLines={1}>
                      {busy ? c.uploading : status.received ? status.file : c.required}
                    </Text>
                  </View>
                  {/* status — icon + word, never colour alone (a spinner stands in while uploading). */}
                  {busy ? (
                    <ActivityIndicator size="small" color={PENDING.fg} />
                  ) : status.received ? (
                    <View style={[st.chip, { backgroundColor: RECEIVED.bg }]}>
                      <Check size={12} color={RECEIVED.fg} />
                      <Text style={[st.chipTxt, { color: RECEIVED.fg }]}>{c.received}</Text>
                    </View>
                  ) : (
                    <View style={[st.chip, { backgroundColor: PENDING.bg }]}>
                      <Plus size={12} color={PENDING.fg} />
                      <Text style={[st.chipTxt, { color: PENDING.fg }]}>{c.missing}</Text>
                    </View>
                  )}
                </View>

                {!busy ? (
                  <View style={st.actions}>
                    {status.received ? (
                      <>
                        <Pressable
                          onPress={() => setPickFor(d.key)}
                          style={({ pressed }) => [st.linkBtn, pressed && { opacity: 0.6 }]}
                          accessibilityRole="button"
                          accessibilityLabel={`${c.replace} · ${names[d.key]}`}
                        >
                          <Text style={st.linkTxt}>{c.replace}</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => remove(d.key)}
                          style={({ pressed }) => [st.linkBtn, pressed && { opacity: 0.6 }]}
                          accessibilityRole="button"
                          accessibilityLabel={`${c.removeA11y} · ${names[d.key]}`}
                        >
                          <Text style={[st.linkTxt, st.linkDanger]}>{c.remove}</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => setPickFor(d.key)}
                        style={({ pressed }) => [st.addBtn, pressed && { opacity: 0.85 }]}
                        accessibilityRole="button"
                        accessibilityLabel={`${c.add} · ${names[d.key]}`}
                      >
                        <Plus size={16} color={S.textPrimary} />
                        <Text style={st.addTxt}>{c.add}</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        {/* footer — remaining count + done */}
        <View style={[st.footer, { paddingBottom: Math.max(insets.bottom, sp.md) }]}>
          <View style={st.summaryRow} accessibilityLiveRegion="polite">
            {remaining === 0 ? <Check size={16} color={RECEIVED.fg} /> : null}
            <Text style={[st.summaryTxt, remaining === 0 && { color: RECEIVED.fg }]}>
              {remaining === 0 ? c.allIn : `${remaining} ${remaining === 1 ? c.remainingOne : c.remainingMany}`}
            </Text>
          </View>
          <PrimaryButton label={c.done} onPress={onClose} style={{ alignSelf: 'stretch' }} accessibilityLabel={c.done} />
        </View>

        {/* Mock picker — no native picker installed, so both sources simulate an upload. */}
        <OptionSheet
          visible={!!pickFor}
          onClose={() => setPickFor(null)}
          title={c.pickTitle}
          options={[
            { key: 'file', label: c.pickFile, icon: FileText },
            { key: 'photo', label: c.pickPhoto, icon: Camera },
          ]}
          onSelect={(method) => { if (pickFor) startUpload(pickFor, method); }}
          closeA11y={c.pickCloseA11y}
        />
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: S.canvas },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  title: { fontFamily: F.oswS, fontSize: 22, color: S.textPrimary },
  close: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[100],
  },

  scroll: { paddingHorizontal: sp.lg, paddingBottom: sp.lg },
  intro: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: S.textSecondary },
  formats: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: palette.neutral[600], marginTop: sp.xs, marginBottom: sp.lg },

  docCard: {
    backgroundColor: palette.neutral[0], ...cardShape, padding: sp.lg, marginBottom: sp.md,
    borderWidth: 1, borderColor: DIVIDER,
  },
  docTop: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  docIcon: {
    width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[100],
  },
  docName: { fontFamily: F.oswS, fontSize: 16, color: ON_CARD },
  docMeta: { fontFamily: F.body, fontSize: 13, color: ON_CARD_2, marginTop: 2 },

  chip: {
    flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  chipTxt: { fontFamily: F.bodyS, fontSize: 12 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.md },
  addBtn: {
    minHeight: 44, paddingHorizontal: sp.lg, borderRadius: r.button, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: palette.neutral[300],
  },
  addTxt: { fontFamily: F.bodyS, fontSize: 15, color: S.textPrimary },
  linkBtn: { minHeight: 44, paddingHorizontal: sp.md, justifyContent: 'center' },
  linkTxt: { fontFamily: F.bodyS, fontSize: 15, color: ON_CARD_2, textDecorationLine: 'underline' },
  linkDanger: { color: color.danger },

  footer: {
    paddingHorizontal: sp.lg, paddingTop: sp.md, gap: sp.sm,
    borderTopWidth: 1, borderTopColor: DIVIDER, backgroundColor: S.canvas,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryTxt: { fontFamily: F.bodyS, fontSize: 14, color: S.textSecondary },
});
