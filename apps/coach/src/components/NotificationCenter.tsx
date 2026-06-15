/**
 * Notification center (C32) — the near-full-screen modal behind the header bell.
 * Presented as an iOS pageSheet (slides up, leaves a top gap, swipe-to-dismiss); on
 * Android a Modal is full-screen. Coach surface (ink); scheme-robust like the screens.
 *
 * v0.1: list + read-state interactions. Item content is mock (placeholders) and echoes the
 * Accueil/Séances data so the demo reads coherently. UI chrome comes from ../copy.
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import {
  X, MapPin, FileText, CalendarPlus, CheckCircle2, Wallet, CalendarClock, Check, type LucideIcon,
} from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { ReportScreen } from '../screens/ReportScreen';
import { RevenusScreen } from '../screens/RevenusScreen';
import { BottomSheet } from './BottomSheet';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { NotificationsSkeleton } from '../screens/skeletons';

const S = surfaces.coach;
const isDark = S.colorScheme === 'dark';
const CANVAS = S.canvas;                                            // ink (dark) | cream (light)
const CARD = S.surface;                                             // dark ink card in both schemes
const SUBTLE = isDark ? palette.neutral[800] : palette.neutral[100]; // subtle container on the canvas
const DIVIDER = palette.neutral[700];
const ON_CANVAS = S.textPrimary;                                   // on-canvas text — adapts per scheme
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[50];                              // light text inside the dark card
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];

const F = {
  oswR: 'Oswald_400Regular',
  oswS: 'Oswald_600SemiBold',
  oswM: 'Oswald_500Medium',
  interM: 'Inter_500Medium',   // titles (screen / row / detail) — per request
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

/* ---------- data ---------- */

type NotifType = 'assigned' | 'checkin' | 'reportDue' | 'confirmed' | 'payment' | 'availability';
type Notif = {
  id: string; type: NotifType; title: string; body: string;
  detail: string;   // full text shown in the detail modal
  action: string;   // contextual CTA label in the detail modal
  time: string; unread: boolean;
  result?: string;  // set once the notification's task is done (shows as a chip on the row)
};

/* What pressing a notification's CTA actually DOES, per type.
   · 'report'  → opens the real 6-step post-session report form (ReportScreen)
   · 'revenus' → opens the real earnings dashboard (RevenusScreen)
   · 'task'    → performs the action in place (apply / check-in / save / refresh) and confirms
                 it with a success state; the row then carries a "done" chip. */
type ActionKind = 'task' | 'report' | 'revenus';
const TYPE_ACTION: Record<NotifType, {
  kind: ActionKind;
  doneTitle?: string;   // success-state heading (task kind)
  doneBody?: string;    // success-state body (task kind)
  resultChip?: string;  // short label left on the row after the task completes
}> = {
  assigned:     { kind: 'task', doneTitle: 'Hand raised', doneBody: "You're on the shortlist for this session. We'll let you know as soon as the coordinator confirms.", resultChip: 'Applied' },
  checkin:      { kind: 'task', doneTitle: 'Checked in', doneBody: 'Your geolocated check-in is confirmed. The session has started, so have a great session.', resultChip: 'Checked in' },
  reportDue:    { kind: 'report' },
  confirmed:    { kind: 'task', doneTitle: 'Added to your calendar', doneBody: 'This session is saved to your calendar. Directions open on the day from your schedule.', resultChip: 'In calendar' },
  payment:      { kind: 'revenus' },
  availability: { kind: 'task', doneTitle: 'Availability updated', doneBody: 'Your availability is refreshed. The matching algorithm will keep offering you sessions that fit your schedule.', resultChip: 'Updated' },
};

// Icon + on-ink colour per type (same tones the screens use for status).
const TYPE_META: Record<NotifType, { Icon: LucideIcon; fg: string; bg: string }> = {
  assigned:     { Icon: CalendarPlus, fg: color.action,      bg: 'rgba(225,50,43,0.16)' },
  checkin:      { Icon: MapPin,        fg: palette.bleu[200], bg: 'rgba(166,183,219,0.14)' },
  reportDue:    { Icon: FileText,      fg: palette.or[300],   bg: 'rgba(242,194,0,0.13)' },
  confirmed:    { Icon: CheckCircle2,  fg: palette.vert[300], bg: 'rgba(47,158,107,0.16)' },
  payment:      { Icon: Wallet,        fg: palette.vert[300], bg: 'rgba(47,158,107,0.16)' },
  availability: { Icon: CalendarClock, fg: palette.or[300],   bg: 'rgba(242,194,0,0.13)' },
};

// Mock notifications — placeholders (real code pulls from the notifications service / push).
const SEED: Notif[] = [
  {
    id: 'n1', type: 'assigned', title: 'New session available', body: 'Maple Court · Thu 11 June, 11:00 · 1.9 km', time: '2m', unread: true,
    detail: 'Maple Court is looking for a coach for a group session on Thursday 11 June at 11:00 (1 hour, ~10 residents). It’s 1.9 km from you. Raise your hand to be matched.',
    action: 'Raise your hand',
  },
  {
    id: 'n2', type: 'checkin', title: 'Check-in window open', body: 'The Lindens Care Home · 14:30 · you’re on site', time: '12m', unread: true,
    detail: 'You’ve arrived at The Lindens Care Home. Your 14:30 group session check-in window is open. Confirm your geolocated check-in to start the session.',
    action: 'Check in',
  },
  {
    id: 'n3', type: 'reportDue', title: 'Report to complete', body: 'Bellevue Residence · yesterday’s session', time: '1h', unread: true,
    detail: 'Your session at Bellevue Residence yesterday needs a post-session report. Complete the 6-step report to validate the session and trigger billing.',
    action: 'Write report',
  },
  {
    id: 'n4', type: 'confirmed', title: 'Session confirmed', body: 'Park Care Home · today 17:00', time: '3h', unread: false,
    detail: 'Your application for Park Care Home today at 17:00 was accepted. The session is now confirmed in your schedule.',
    action: 'Add to calendar',
  },
  {
    id: 'n5', type: 'payment', title: 'Payment processed', body: '€840 for May · via Pennylane', time: 'Yesterday', unread: false,
    detail: 'Your payment of €840 for May has been processed via Pennylane. It should arrive in your account within 2–3 business days.',
    action: 'View earnings',
  },
  {
    id: 'n6', type: 'availability', title: 'Update your availability', body: 'It’s 6 days old. Refresh it to keep getting matched to sessions', time: '2d', unread: false,
    detail: 'Your availability was last updated 6 days ago. Keep it fresh so the matching algorithm can offer you sessions that fit your schedule.',
    action: 'Update availability',
  },
];

/* ---------- pieces ---------- */

function Row({ n, first, onPress }: { n: Notif; first: boolean; onPress: () => void }) {
  const m = TYPE_META[n.type];
  const Icon = m.Icon;
  // Read-state drives the icon tone now (not the per-type accent): unread = white, read = grey.
  const iconColor = n.unread ? palette.neutral[50] : palette.neutral[500];
  return (
    <Pressable
      style={({ pressed }) => [st.row, !first && st.rowDivider, pressed && { opacity: 0.9 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${n.title}. ${n.body}. ${n.time}${n.result ? `, ${n.result}` : n.unread ? ', unread' : ''}`}
    >
      <View style={st.iconWrap}>
        <Icon size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={st.rowHead}>
          <Text style={st.title} numberOfLines={1}>{n.title}</Text>
          <Text style={st.time}>{n.time}</Text>
        </View>
        <Text style={st.body}>{n.body}</Text>
        {n.result ? (
          <View style={st.doneChip}>
            <Check size={12} color={palette.vert[300]} />
            <Text style={st.doneChipTxt}>{n.result}</Text>
          </View>
        ) : null}
      </View>
      {n.unread && !n.result ? <View style={st.unreadDot} /> : null}
    </Pressable>
  );
}

function Section({ label, items, onOpen }: { label: string; items: Notif[]; onOpen: (n: Notif) => void }) {
  if (!items.length) return null;
  return (
    <View style={st.section}>
      <Text style={st.eyebrow}>{label}</Text>
      {items.map((n, i) => <Row key={n.id} n={n} first={i === 0} onPress={() => onOpen(n)} />)}
    </View>
  );
}

/* ---------- modal ---------- */

export function NotificationCenter({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [items, setItems] = React.useState<Notif[]>(SEED);
  const [selected, setSelected] = React.useState<Notif | null>(null);
  const [reportOpen, setReportOpen] = React.useState(false);   // the real 6-step report form
  const [revenusOpen, setRevenusOpen] = React.useState(false); // the real earnings dashboard
  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  // Opening a notification marks it read and pops the detail modal over the center.
  const open = (n: Notif) => {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    setSelected(n);
  };

  // The CTA inside the detail routes by type: report/payment open the real screens (the detail
  // gets out of the way first); 'task' types are handled in place by the detail itself.
  const runAction = (n: Notif) => {
    const kind = TYPE_ACTION[n.type].kind;
    if (kind === 'report') { setSelected(null); setReportOpen(true); }
    else if (kind === 'revenus') { setSelected(null); setRevenusOpen(true); }
  };

  // A 'task' CTA completed — stamp the row with its result chip (and keep it read).
  const completeTask = (id: string, resultChip?: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, unread: false, result: resultChip ?? x.result } : x)));
    setSelected((cur) => (cur && cur.id === id ? { ...cur, unread: false, result: resultChip ?? cur.result } : cur));
  };

  const unread = items.filter((n) => n.unread);
  const earlier = items.filter((n) => !n.unread);
  const loading = useFirstLoad('notifications', { active: visible, ms: 500 });

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        {/* header */}
        <View style={st.header}>
          <Text style={st.h1}>{copy.notifications.title}</Text>
          <View style={{ flex: 1 }} />
          {unread.length ? (
            <Pressable onPress={markAll} hitSlop={8} style={st.markBtn} accessibilityRole="button">
              <Text style={st.markTxt}>{copy.notifications.markAllRead}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={st.closeBtn}
            accessibilityRole="button"
            accessibilityLabel={copy.notifications.closeA11y}
          >
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <Reveal loading={loading} skeleton={<NotificationsSkeleton />}>
        <ScrollView contentContainerStyle={{ paddingBottom: sp.xl }} showsVerticalScrollIndicator={false}>
          <Section label={copy.notifications.sectionNew} items={unread} onOpen={open} />
          <Section label={copy.notifications.sectionEarlier} items={earlier} onOpen={open} />
          {items.length === 0 ? <Text style={st.empty}>{copy.notifications.empty}</Text> : null}
        </ScrollView>
        </Reveal>

        {/* Detail pops over the center as a dimmed popup (transparent modal stacks reliably). */}
        <NotificationDetail
          notif={selected}
          onClose={() => setSelected(null)}
          onRoute={runAction}
          onCompleteTask={completeTask}
        />

        {/* Real destinations the CTAs open — stacked over the center, dismissing back to it. */}
        <ReportScreen visible={reportOpen} onClose={() => setReportOpen(false)} />
        <RevenusScreen visible={revenusOpen} onClose={() => setRevenusOpen(false)} />
      </View>
    </Modal>
  );
}

/* ---------- detail modal ---------- */

function NotificationDetail({
  notif, onClose, onRoute, onCompleteTask,
}: {
  notif: Notif | null;
  onClose: () => void;
  onRoute: (n: Notif) => void;                          // open a real screen (report / earnings)
  onCompleteTask: (id: string, chip?: string) => void;  // mark a 'task' notification done
}) {
  const m = notif ? TYPE_META[notif.type] : null;
  const Icon = m?.Icon;
  const cfg = notif ? TYPE_ACTION[notif.type] : null;

  // 'task' CTAs resolve in place: pressing flips the card to a success state. Seed it from the
  // notification's stored result, so reopening an already-done task lands straight on success.
  const [done, setDone] = React.useState(false);
  React.useEffect(() => { setDone(!!notif?.result); }, [notif?.id, notif?.result]);

  const onCta = () => {
    if (!notif || !cfg) return;
    if (cfg.kind === 'task') {
      onCompleteTask(notif.id, cfg.resultChip);
      setDone(true);
    } else {
      onRoute(notif); // report / revenus — the parent closes the detail and opens the screen
    }
  };

  return (
    <BottomSheet visible={!!notif} onClose={onClose} a11yLabel={copy.notifications.closeA11y}>
          <View style={st.detailTop}>
            {done ? (
              <View style={st.detailIcon}>
                <CheckCircle2 size={26} color={ON_CARD} />
              </View>
            ) : m && Icon ? (
              <View style={st.detailIcon}>
                <Icon size={26} color={ON_CARD} />
              </View>
            ) : null}
            <Pressable onPress={onClose} hitSlop={8} style={st.detailClose} accessibilityRole="button" accessibilityLabel={copy.notifications.closeA11y}>
              <X size={22} color={ON_CANVAS} />
            </Pressable>
          </View>

          {notif && cfg ? (
            done ? (
              /* success state — the task ran (applied / checked in / saved / refreshed) */
              <>
                <Text style={st.detailTitle}>{cfg.doneTitle}</Text>
                <Text style={st.detailBody}>{cfg.doneBody}</Text>
                <Pressable style={st.detailCta} onPress={onClose} accessibilityRole="button">
                  <Text style={st.detailCtaTxt}>{copy.notifications.actionDone}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={st.detailTime}>{notif.time}</Text>
                <Text style={st.detailTitle}>{notif.title}</Text>
                <Text style={st.detailBody}>{notif.detail}</Text>

                <Pressable style={st.detailCta} onPress={onCta} accessibilityRole="button">
                  <Text style={st.detailCtaTxt}>{notif.action}</Text>
                </Pressable>
              </>
            )
          ) : null}
    </BottomSheet>
  );
}

/* ---------- styles ---------- */

const st = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  h1: { fontFamily: F.interM, fontSize: 26, color: ON_CANVAS },
  markBtn: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 4 },
  markTxt: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.2, color: color.action },
  closeBtn: {
    width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },

  section: { marginTop: sp.md, paddingHorizontal: sp.lg },
  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, letterSpacing: 1,
    color: ON_CANVAS_2, marginBottom: sp.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  rowDivider: { borderTopWidth: 1, borderTopColor: DIVIDER },
  iconWrap: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',   // very dim, just enough to seat the icon
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.sm },
  title: { flex: 1, fontFamily: F.interM, fontSize: 16, color: ON_CARD },
  time: { fontFamily: F.body, fontSize: 12, color: ON_CARD_3 },
  body: { fontFamily: F.body, fontSize: 14, color: ON_CARD_2, marginTop: 2 },
  unreadDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: color.action },
  // "task done" chip — green, on the row, replaces the unread dot once the CTA has run.
  doneChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    marginTop: 6, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill,
    backgroundColor: 'rgba(47,158,107,0.16)',
  },
  doneChipTxt: { fontFamily: F.oswM, fontSize: 11, letterSpacing: 0.6, color: palette.vert[300] },

  empty: { fontFamily: F.body, fontSize: 15, color: ON_CANVAS_2, textAlign: 'center', marginTop: sp['2xl'] },

  /* detail popup — content inside the shared BottomSheet (the sheet owns the card + backdrop) */
  detailTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  // Lighter than the card (neutral-800) so the white glyph sits on a clearly distinct chip.
  detailIcon: {
    width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[700], borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  detailClose: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  detailTime: { fontFamily: F.body, fontSize: 12, letterSpacing: 0.3, color: ON_CARD_3, marginTop: sp.md },
  detailTitle: { fontFamily: F.interM, fontSize: 22, color: ON_CARD, marginTop: 4 },
  detailBody: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CARD_2, marginTop: sp.sm },
  detailCta: {
    minHeight: 48, borderRadius: r.pill, backgroundColor: color.action,
    alignItems: 'center', justifyContent: 'center', marginTop: sp.lg,
  },
  detailCtaTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
});
