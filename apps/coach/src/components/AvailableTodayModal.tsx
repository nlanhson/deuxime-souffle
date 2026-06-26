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
import { X, Hand, Check, AlarmClock, Sparkles } from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { useCopy } from '../i18n';
import { AvailableDetailModal, type AvailDetailItem } from './AvailableDetailModal';
import { GradientFill } from './GradientFill';

const S = surfaces.coach;
const BORDER_INK = palette.neutral[200];

const F = { oswR: 'Oswald_400Regular', oswS: 'Oswald_600SemiBold', oswB: 'Oswald_700Bold', body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold' };

// Rows need these display fields; the detail needs the rest (AvailDetailItem). `when` is the date
// line; `days`/`type` drive the DT-14 urgency + session-type chips (sessions span several days).
type Item = AvailDetailItem & { dow: string; ds: string; when?: string; days: number; type: string };

// Urgent = starts within 3 days (same threshold as the Home block + Disponibles tab).
const URGENT_WITHIN_DAYS = 3;

export function AvailableTodayModal({
  visible, onClose, items, applied, onToggle,
}: { visible: boolean; onClose: () => void; items: readonly Item[]; applied: ReadonlySet<string>; onToggle: (nm: string) => void }) {
  const [selected, setSelected] = React.useState<Item | null>(null);
  const copy = useCopy();
  const c = copy.available;

  // DT-14 on the See-all sheet: same as Home — urgent openings (start within 3 days) first under
  // ⏰ Urgentes, the rest under "Plus tard", each row carrying the urgency + session-type chips.
  const u = copy.availableScreen.list.urgency;
  const ulabel = (days: number) => (days <= 0 ? u.today : days === 1 ? u.tomorrow : `${u.inDays} ${days} ${u.days}`);
  const urgent = items.filter((a) => a.days <= URGENT_WITHIN_DAYS);
  const later = items.filter((a) => a.days > URGENT_WITHIN_DAYS);

  const renderRow = (a: Item, first: boolean) => {
    const isApplied = applied.has(a.nm);
    const isFirst = a.type === 'first';
    const isUrgent = a.days <= URGENT_WITHIN_DAYS;
    const showTags = isUrgent || isFirst || isApplied;
    return (
      <View key={a.nm} style={[st.row, first ? { paddingTop: 0 } : st.rowDivider]}>
        {/* row body → opens the detail; the circle handles apply/withdraw */}
        <Pressable
          style={({ pressed }) => [st.rowBody, pressed && { opacity: 0.7 }]}
          onPress={() => setSelected(a)}
          accessibilityRole="button"
          accessibilityLabel={[a.nm, `${a.when ?? a.dow} ${a.hr} to ${a.end}`, a.ds, isUrgent ? ulabel(a.days) : undefined, isFirst ? copy.availableScreen.type.first : undefined, isApplied ? copy.availableScreen.status.applied : undefined].filter(Boolean).join(', ')}
        >
          <View style={st.when}>
            <Text style={st.hr}>{a.hr}</Text>
            <Text style={st.end}>{a.end}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {a.when ? <Text style={st.dateLine}>{a.when}</Text> : null}
            <Text style={st.nm} numberOfLines={1}>{a.nm}</Text>
            <Text style={st.ds} numberOfLines={1}>{a.ds}</Text>
            {showTags ? (
              <View style={st.tagRow}>
                {isUrgent ? (
                  <View style={st.urgencyTag}>
                    <AlarmClock size={12} color={palette.rouge[600]} strokeWidth={2.5} />
                    <Text style={st.urgencyTxt}>{ulabel(a.days)}</Text>
                  </View>
                ) : null}
                {isFirst ? (
                  <View style={st.typeTag}>
                    <Sparkles size={12} color={color.info} strokeWidth={2.5} />
                    <Text style={st.typeTagTxt}>{copy.availableScreen.type.first}</Text>
                  </View>
                ) : null}
                {isApplied ? (
                  <View style={st.appliedTag}>
                    <Check size={12} color={palette.vert[600]} strokeWidth={2.5} />
                    <Text style={st.appliedTagTxt}>{copy.availableScreen.status.applied}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </Pressable>
        {/* raise-hand (apply) ↔ withdraw — matches the Disponibles tab + the Home preview. */}
        {isApplied ? (
          <Pressable
            style={({ pressed }) => [st.actionCircle, st.withdrawCircle, pressed && { opacity: 0.7 }]}
            onPress={() => onToggle(a.nm)}
            accessibilityRole="button"
            accessibilityLabel={`${copy.availableScreen.action.withdraw}, ${a.nm}`}
          >
            <X size={20} color={S.textPrimary} />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [st.actionCircle, st.applyCircle, pressed && { opacity: 0.9 }]}
            onPress={() => onToggle(a.nm)}
            accessibilityRole="button"
            accessibilityLabel={`${copy.availableScreen.action.apply}, ${a.nm}`}
          >
            <GradientFill radius={999} />
            <Hand size={20} color={color.onAction} />
          </Pressable>
        )}
      </View>
    );
  };

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

          {/* ⏰ Urgentes — the still-unfilled near-term openings, surfaced first (DT-14). */}
          {urgent.length ? (
            <>
              <View style={st.urgHead}>
                <View style={st.urgIcon}><AlarmClock size={13} color={palette.rouge[600]} strokeWidth={2.5} /></View>
                <Text style={st.urgTitle}>{copy.availableScreen.list.cats.urgent}</Text>
                <Text style={st.urgCount}>{urgent.length}</Text>
              </View>
              {urgent.map((a, i) => renderRow(a, i === 0))}
            </>
          ) : null}

          {/* Plus tard — the rest of the upcoming openings (no urgency chip). */}
          {later.length ? (
            <>
              <Text style={st.laterHead}>{c.homeLater}</Text>
              {later.map((a, i) => renderRow(a, i === 0))}
            </>
          ) : null}
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

  // Flat rows on the canvas (no card) — identical metrics to the Home preview so the sheet and the
  // preview read as one component. Rows are taller (date line + chips), so they top-align (DT-14).
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, paddingVertical: sp.md },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: BORDER_INK },
  when: { width: 52, alignItems: 'center' },
  hr: { fontFamily: F.oswB, fontSize: 18, color: S.textPrimary },
  end: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 1 },
  dateLine: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginBottom: 2 },
  nm: { fontFamily: F.bodyS, fontSize: 16, color: S.textPrimary },
  ds: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 1 },
  // raise-hand / withdraw circle — same language as the Disponibles tab + the Home preview (DT-13).
  actionCircle: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  applyCircle: {
    backgroundColor: color.action,
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  withdrawCircle: { borderWidth: 1.5, borderColor: palette.neutral[600] },

  /* ⏰ Urgentes / Plus tard sections + Available-page chips (DT-14) — mirrors the Home block. Reds/
     blues are tuned for AA on the light canvas (a step darker than the Disponibles ink-card tints). */
  urgHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp.xs, marginBottom: 2 },
  urgIcon: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(234,56,41,0.10)' },
  urgTitle: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: palette.rouge[600] },
  urgCount: { fontFamily: F.bodyS, fontSize: 13, color: S.textSecondary },
  laterHead: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: S.textSecondary, marginTop: sp.lg, marginBottom: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: sp.sm, marginTop: 8 },
  urgencyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, backgroundColor: 'rgba(234,56,41,0.10)' },
  urgencyTxt: { fontFamily: F.bodyS, fontSize: 13, color: palette.rouge[600] },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, backgroundColor: palette.bleu[50] },
  typeTagTxt: { fontFamily: F.body, fontSize: 13, color: color.info },
  appliedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, backgroundColor: palette.vert[50] },
  appliedTagTxt: { fontFamily: F.bodyS, fontSize: 13, color: palette.vert[600] },
});
