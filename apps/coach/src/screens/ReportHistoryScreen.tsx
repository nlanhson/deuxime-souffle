/**
 * Coach · Report history (SESS-05 — "Chronological list of submitted reports, filter by
 * date/facility, pagination").
 *
 * Brought IN by the client mismatch review (2026-06). A read-only archive: every submitted
 * post-session report, newest first, filterable by facility (chips) and paginated ("Show more" —
 * the mobile idiom for the WBS's pagination). Each row carries the facility, date, participant
 * count and the report's review status (wording shared with sessions.reportView so the two
 * surfaces agree). Rows are informational, not actions — neutral cards, no chevron (house rule:
 * colour = clickable).
 *
 * Opened as a pageSheet modal from Profile ("Report history"). Mock data is placeholder — real
 * code pages from the backend. Surface = coach (ink).
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

import { X, FileText, Check, Hourglass, Edit3, Users, type LucideIcon } from '../icons';
import { palette, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { ReportHistorySkeleton } from './skeletons';

const S = surfaces.coach;
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];
const SUBTLE = palette.neutral[800];

/* On-ink status tones (same ramp-reach as Revenus/Profile). */
const INK = {
  ok:      { fg: palette.vert[300], bg: 'rgba(47,158,107,0.16)' },
  pending: { fg: palette.or[300], bg: 'rgba(242,194,0,0.13)' },
  changes: { fg: palette.rouge[300], bg: 'rgba(225,50,43,0.14)' },
};

const F = {
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

/* ---------- mock data (placeholders — real code pages from the backend) ---------- */

type ReviewStatus = 'pending' | 'validated' | 'changes';
type Report = { id: string; place: string; date: string; participants: number; status: ReviewStatus };

const REPORTS: Report[] = [
  { id: 'r14', place: 'Bellevue Residence', date: 'Jun 8', participants: 9, status: 'pending' },
  { id: 'r13', place: 'Riverside Care Home', date: 'Jun 7', participants: 6, status: 'validated' },
  { id: 'r12', place: 'The Oaks', date: 'Jun 5', participants: 11, status: 'validated' },
  { id: 'r11', place: 'The Cedars Residence', date: 'Jun 3', participants: 8, status: 'changes' },
  { id: 'r10', place: 'Maple Court', date: 'Jun 2', participants: 10, status: 'validated' },
  { id: 'r9', place: 'The Lindens Care Home', date: 'May 30', participants: 7, status: 'validated' },
  { id: 'r8', place: 'Riverside Care Home', date: 'May 27', participants: 6, status: 'validated' },
  { id: 'r7', place: 'The Oaks', date: 'May 24', participants: 12, status: 'validated' },
  { id: 'r6', place: 'Maple Court', date: 'May 20', participants: 9, status: 'validated' },
  { id: 'r5', place: 'Bellevue Residence', date: 'May 16', participants: 8, status: 'validated' },
  { id: 'r4', place: 'The Cedars Residence', date: 'May 12', participants: 10, status: 'validated' },
  { id: 'r3', place: 'Park Care Home', date: 'May 8', participants: 5, status: 'validated' },
  { id: 'r2', place: 'The Lindens Care Home', date: 'May 5', participants: 7, status: 'validated' },
  { id: 'r1', place: 'Maple Court', date: 'May 2', participants: 9, status: 'validated' },
];

const PAGE = 8; // pagination size — "Show more" reveals the next page

/* ---------- screen ---------- */

export function ReportHistoryScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = copy.reportHistory;
  const statusCopy = copy.sessions.reportView.reviewStatus;
  const [facility, setFacility] = React.useState<string | null>(null); // null = all
  const [shown, setShown] = React.useState(PAGE);

  // Reset the filter + page each open, so the archive always starts whole.
  React.useEffect(() => { if (visible) { setFacility(null); setShown(PAGE); } }, [visible]);

  const facilities = [...new Set(REPORTS.map((rep) => rep.place))];
  const filtered = facility ? REPORTS.filter((rep) => rep.place === facility) : REPORTS;
  const page = filtered.slice(0, shown);
  const loading = useFirstLoad('reportHistory', { active: visible, ms: 550 });

  const STATUS_META: Record<ReviewStatus, { tone: keyof typeof INK; icon: LucideIcon; label: string }> = {
    validated: { tone: 'ok', icon: Check, label: statusCopy.validated },
    pending: { tone: 'pending', icon: Hourglass, label: statusCopy.pending },
    changes: { tone: 'changes', icon: Edit3, label: statusCopy.changes },
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={st.fill}>
        <View style={st.topbar}>
          <View style={{ flex: 1 }}>
            <Text style={st.eyebrow}>{c.eyebrow}</Text>
            <Text style={st.title} numberOfLines={1}>{c.title}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={st.closeBtn} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <Reveal loading={loading} skeleton={<ReportHistorySkeleton />}>
        {/* Facility filter — horizontal chips (the WBS's filter, in the mobile idiom). */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.chips}
          accessibilityLabel={c.filterA11y}
        >
          {[null, ...facilities].map((f) => {
            const on = facility === f;
            return (
              <Pressable
                key={f ?? 'all'}
                onPress={() => { setFacility(f); setShown(PAGE); }}
                style={[st.chip, on && st.chipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={f ?? c.filterAll}
              >
                <Text style={[st.chipTxt, on && st.chipTxtOn]}>{f ?? c.filterAll}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
          <Text style={st.count}>{`${filtered.length} ${c.countSuffix}`}</Text>

          {page.length === 0 ? (
            <Text style={st.empty}>{c.empty}</Text>
          ) : (
            page.map((rep) => {
              const m = STATUS_META[rep.status];
              return (
                <View
                  key={rep.id}
                  style={st.row}
                  accessible
                  accessibilityLabel={`${rep.place}, ${rep.date}, ${rep.participants} ${c.participantsSuffix}, ${m.label}`}
                >
                  <View style={st.rowIcon}>
                    <FileText size={18} color={ON_CARD_2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={st.rowPlace} numberOfLines={1}>{rep.place}</Text>
                    <View style={st.rowMeta}>
                      <Text style={st.rowMetaTxt}>{rep.date}</Text>
                      <Text style={st.rowDot}>·</Text>
                      <Users size={13} color={ON_CARD_3} />
                      <Text style={st.rowMetaTxt}>{rep.participants}</Text>
                    </View>
                  </View>
                  <View style={[st.status, { backgroundColor: INK[m.tone].bg }]}>
                    <m.icon size={12} color={INK[m.tone].fg} />
                    <Text style={[st.statusTxt, { color: INK[m.tone].fg }]}>{m.label}</Text>
                  </View>
                </View>
              );
            })
          )}

          {filtered.length > shown ? (
            <Pressable
              onPress={() => setShown((n) => n + PAGE)}
              style={({ pressed }) => [st.more, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel={c.showMore}
            >
              <Text style={st.moreTxt}>{c.showMore}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
        </Reveal>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: S.canvas },
  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2 },
  title: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: ON_CANVAS, marginTop: 2 },
  closeBtn: {
    width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },

  chips: { paddingHorizontal: sp.lg, gap: sp.sm, paddingBottom: sp.sm },
  chip: {
    minHeight: 40, paddingVertical: 8, paddingHorizontal: 14, borderRadius: r.pill,
    backgroundColor: palette.neutral[800], borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  chipOn: { backgroundColor: palette.rouge[500], borderColor: palette.rouge[500] },
  chipTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },
  chipTxtOn: { color: palette.neutral[0] },

  scroll: { paddingHorizontal: sp.lg, paddingBottom: sp['2xl'] },
  count: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, marginBottom: sp.sm },
  empty: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CANVAS_2, marginTop: sp.md },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: sp.md,
    borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm,
    backgroundColor: palette.neutral[800], borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[700],
  },
  rowPlace: { fontFamily: F.bodyB, fontSize: 15, color: ON_CARD },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  rowMetaTxt: { fontFamily: F.body, fontSize: 13, color: ON_CARD_3 },
  rowDot: { fontFamily: F.body, fontSize: 13, color: ON_CARD_3 },

  status: {
    flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  statusTxt: { fontFamily: F.body, fontSize: 12 },

  more: {
    minHeight: 48, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)', marginTop: sp.sm,
  },
  moreTxt: { fontFamily: F.bodyS, fontSize: 15, color: ON_CARD_2 },
});
