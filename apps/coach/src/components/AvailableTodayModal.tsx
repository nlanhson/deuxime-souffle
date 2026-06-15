/**
 * AvailableTodayModal — the "See all" sheet for today's open sessions (C11/C12).
 *
 * A pageSheet listing today's available sessions as tappable rows (same vocabulary as the Home
 * preview). Tapping a row — or its Apply chip — opens the session detail, which is NESTED inside
 * this modal's view tree (the proven NotificationCenter pattern) so the popup stacks reliably
 * over the sheet instead of fighting it as a sibling modal. UI text comes from ../copy.
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { X } from '../icons';

import { palette, spacing as sp, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { AvailableDetailModal, type AvailDetailItem } from './AvailableDetailModal';

const S = surfaces.coach;
const BORDER_INK = palette.neutral[700];

const F = { oswR: 'Oswald_400Regular', oswS: 'Oswald_600SemiBold', oswB: 'Oswald_700Bold', body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold' };

// Rows need these display fields; the detail needs the rest (AvailDetailItem).
type Item = AvailDetailItem & { dow: string; ds: string; pay: string };

export function AvailableTodayModal({
  visible, onClose, items,
}: { visible: boolean; onClose: () => void; items: readonly Item[] }) {
  const [selected, setSelected] = React.useState<Item | null>(null);
  const c = copy.available;
  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: S.canvas }}>
        <View style={st.topbar}>
          {/* Title takes the remaining width (truncates) so the close button always keeps its slot. */}
          <Text style={st.title} numberOfLines={2}>{c.allTitle}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={S.textPrimary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp.xl }} showsVerticalScrollIndicator={false}>
          <Text style={st.near}>{c.near}</Text>
          {/* Flat rows on the canvas (no card) — start time with the end time under it, place +
              address. The whole row is the button → opens the detail (where the Apply CTA lives). */}
          {items.map((a, i) => (
            <Pressable
              key={a.nm}
              style={({ pressed }) => [st.row, i > 0 && st.rowDivider, pressed && { opacity: 0.7 }]}
              onPress={() => setSelected(a)}
              accessibilityRole="button"
              accessibilityLabel={`${a.nm}, ${a.dow} ${a.hr} to ${a.end}, ${a.ds}`}
            >
              <View style={st.when}>
                <Text style={st.hr}>{a.hr}</Text>
                <Text style={st.end}>{a.end}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.nm} numberOfLines={1}>{a.nm}</Text>
                <Text style={st.ds} numberOfLines={1}>{a.ds}</Text>
              </View>
              {/* Session fee, trailing — matches the Home preview (Grab Driver pattern). */}
              <Text style={st.pay}>{a.pay}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Detail nested inside the sheet → reliable stacking (NotificationCenter pattern). */}
        <AvailableDetailModal item={selected} onClose={() => setSelected(null)} />
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: sp.md,
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  title: { flex: 1, fontFamily: F.oswS, fontSize: 26, lineHeight: 30, color: S.textPrimary },
  close: {
    width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: S.surface,
  },
  near: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginBottom: sp.sm },

  // Flat rows on the canvas (no card) — identical metrics to the Home Available preview so the
  // sheet and the preview read as one component: start time bold with the end time muted under it.
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, paddingVertical: sp.md },
  rowDivider: { borderTopWidth: 1, borderTopColor: BORDER_INK },
  when: { width: 52, alignItems: 'center' },
  hr: { fontFamily: F.oswB, fontSize: 18, color: S.textPrimary },
  end: { fontFamily: F.body, fontSize: 12, color: S.textSecondary, marginTop: 1 },
  nm: { fontFamily: F.bodyS, fontSize: 16, color: S.textPrimary },
  ds: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 1 },
  pay: { fontFamily: F.oswS, fontSize: 16, color: palette.vert[300], marginLeft: sp.sm },
});
