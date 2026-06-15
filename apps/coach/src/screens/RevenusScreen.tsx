/**
 * Coach · Revenus ("Earnings") — the Earnings tab. C35 "View financial dashboard".
 *
 * Scope is the WBS coach financial stories, nothing more:
 *  · actual revenue vs projected revenue for the SELECTED month, + trend vs previous month
 *  · monthly breakdown: hours worked / hours scheduled, completed-session count, default rate
 *  · the list of sessions contributing to the month (EHPAD, date, rating if any, € amount),
 *    "updated progressively after each completed session"
 *  · invoice/payment history grouped by month+year (sessions, amount, status, per-period export)
 *  · download the monthly financial summary as a PDF
 * Out of scope for V1: coach invoice *upload* (coaches email DS) — deliberately absent.
 * Per the WBS, this is an ACTIVITY REPORT, not an invoice.
 *
 * Surface = coach (locked DARK): ink canvas, dark cards, light in-card text — same vocabulary
 * as Accueil/Séances. The signature rouge→or gradient is reserved here for the earned/expected
 * progress meter (theme: gradient = "hero CTAs / medals / progress"). UI text comes from ../copy.
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Download,
  Star, MapPin, Check, Hourglass, Clock, Banknote, type LucideIcon,
} from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { RevenusSkeleton } from './skeletons';

const S = surfaces.coach;                     // ink canvas / dark cards / light card text
const BORDER_INK = palette.neutral[700];      // dividers / hairlines on ink
const TRACK = palette.neutral[700];           // progress meter track
const MOVEMENT = [palette.rouge[500], palette.or[500]] as const; // signature gradient, 135°

/* Home's raised-surface texture — a slight top-lit vertical gradient + a very dim white hairline,
   so cards read as raised glass. Copied from Accueil so the two screens feel like one family. */
const RAISED_BORDER = 'rgba(255,255,255,0.07)';

/* On-ink status colours — the semantic status tokens are tuned for light surfaces, so (as in
   Accueil/Séances) we reach into the global ramp for the ink variants. SPEC §4 proposes
   promoting these to coach-theme tokens. Used for both the trend chip and payment status. */
const INK = {
  ok:      { fg: palette.vert[300], bg: 'rgba(47,158,107,0.16)' },   // paid / trend up
  pending: { fg: palette.or[300], bg: 'rgba(242,194,0,0.13)' },      // awaiting payment
  info:    { fg: palette.bleu[200], bg: 'rgba(166,183,219,0.14)' },  // in progress (current month)
  down:    { fg: palette.rouge[300], bg: 'rgba(225,50,43,0.14)' },   // trend down
};

const F = {
  oswR: 'Oswald_400Regular',
  oswM: 'Oswald_500Medium',
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

/* ---------- data model ---------- *
 * Mock data — placeholder content. Real code formats euros/hours/dates/ratings from data +
 * locale (the app ships fr-FR; € grouping uses a thin space there). June's figures intentionally
 * match Accueil's "This month" preview (840 € earned · 1 260 € projected · 12 sessions). */

type PaymentStatus = 'paid' | 'awaiting' | 'inProgress';
type EarnSession = { place: string; date: string; rating: number | null; amount: number };
type Period = { label: string; sessions: number; amount: number; status: PaymentStatus };
type MonthData = {
  key: string;
  label: string;          // "June 2026"
  prevLabel: string;      // "May" — for the trend chip
  earned: number;         // actual revenue realised so far (€)
  projected: number;      // projected revenue from upcoming assigned sessions (€)
  trendPct: number;       // vs previous month (signed %)
  completed: number;      // completed sessions this month
  hoursWorked: number;
  hoursScheduled: number;
  rate: number;           // default hourly rate (€/h)
  sessions: EarnSession[];
};

const MONTHS: MonthData[] = [
  {
    key: '2026-04', label: 'avril 2026', prevLabel: 'mars',
    earned: 1925, projected: 0, trendPct: 4, completed: 28, hoursWorked: 55, hoursScheduled: 55, rate: 35,
    sessions: [
      { place: 'Résidence Les Cèdres', date: '28 avr.', rating: 4.9, amount: 70 },
      { place: 'Résidence Les Érables', date: '25 avr.', rating: 4.6, amount: 70 },
      { place: 'Résidence Bellevue', date: '22 avr.', rating: 5.0, amount: 105 },
      { place: 'Résidence du Parc', date: '18 avr.', rating: null, amount: 35 },
    ],
  },
  {
    key: '2026-05', label: 'mai 2026', prevLabel: 'avr.',
    earned: 2100, projected: 0, trendPct: 9, completed: 30, hoursWorked: 60, hoursScheduled: 60, rate: 35,
    sessions: [
      { place: 'Résidence Les Tilleuls', date: '30 mai', rating: 4.8, amount: 70 },
      { place: 'Résidence des Berges', date: '27 mai', rating: 4.7, amount: 35 },
      { place: 'Les Chênes', date: '24 mai', rating: 4.9, amount: 105 },
      { place: 'Résidence Les Érables', date: '20 mai', rating: null, amount: 70 },
    ],
  },
  {
    key: '2026-06', label: 'juin 2026', prevLabel: 'mai',
    earned: 840, projected: 1260, trendPct: 12, completed: 12, hoursWorked: 24, hoursScheduled: 60, rate: 35,
    sessions: [
      { place: 'Résidence Bellevue', date: '7 juin', rating: 4.8, amount: 105 },
      { place: 'Résidence des Berges', date: '7 juin', rating: 4.6, amount: 35 },
      { place: 'Les Chênes', date: '5 juin', rating: 5.0, amount: 70 },
      { place: 'Résidence Les Cèdres', date: '3 juin', rating: null, amount: 70 },
      { place: 'Résidence Les Érables', date: '2 juin', rating: 4.7, amount: 105 },
    ],
  },
];

// Invoice/payment history — grouped by month+year, most-recent first (chronological order).
// The current month carries no invoice yet → status "In progress", no export. Past months are
// statements the coach can download. Mirrors the per-month figures above.
const HISTORY: Period[] = [
  { label: 'juin 2026', sessions: 12, amount: 840, status: 'inProgress' },
  { label: 'mai 2026', sessions: 30, amount: 2100, status: 'paid' },
  { label: 'avril 2026', sessions: 28, amount: 1925, status: 'awaiting' },
  { label: 'mars 2026', sessions: 26, amount: 1820, status: 'paid' },
];

// € grouping — placeholder (en-US "1,260"); production formats with fr-FR from locale.
const eur = (n: number) => n.toLocaleString('en-US');

/* ---------- small building blocks ---------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={st.eyebrow}>{children}</Text>;
}

// Section heading — mirrors Accueil's section titles (Oswald, lightly tracked) so both screens
// share one heading voice.
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={st.secTitle}>{children}</Text>;
}

const PAY_META: Record<PaymentStatus, { tone: keyof typeof INK; icon: LucideIcon; label: string }> = {
  paid:       { tone: 'ok', icon: Check, label: copy.earnings.screen.status.paid },
  awaiting:   { tone: 'pending', icon: Hourglass, label: copy.earnings.screen.status.awaiting },
  inProgress: { tone: 'info', icon: Clock, label: copy.earnings.screen.status.inProgress },
};

// Status chip — never colour alone: every tone carries an icon AND a word.
function StatusChip({ status }: { status: PaymentStatus }) {
  const m = PAY_META[status];
  const c = INK[m.tone];
  const Icon = m.icon;
  return (
    <View style={[st.chip, { backgroundColor: c.bg }]}>
      <Icon size={13} color={c.fg} />
      <Text style={[st.chipTxt, { color: c.fg }]} numberOfLines={1}>{m.label}</Text>
    </View>
  );
}

// Star rating — gold star + value, or a muted "Not rated" (icon present in both, never colour-only).
function Rating({ value }: { value: number | null }) {
  if (value == null) {
    return (
      <View style={st.ratingRow}>
        <Star size={13} color={palette.neutral[500]} />
        <Text style={st.ratingNone}>{copy.earnings.screen.notRated}</Text>
      </View>
    );
  }
  return (
    <View style={st.ratingRow}>
      <Star size={13} color={palette.or[400]} fill={palette.or[400]} />
      <Text style={st.ratingVal}>{value.toFixed(1)}</Text>
    </View>
  );
}

function MonthStepper({
  label, onPrev, onNext, canPrev, canNext,
}: { label: string; onPrev: () => void; onNext: () => void; canPrev: boolean; canNext: boolean }) {
  return (
    <View style={st.monthRow}>
      <Pressable
        style={[st.stepBtn, !canPrev && st.stepBtnOff]}
        hitSlop={8}
        disabled={!canPrev}
        onPress={onPrev}
        accessibilityRole="button"
        accessibilityLabel={copy.earnings.screen.prevMonthA11y}
        accessibilityState={{ disabled: !canPrev }}
      >
        <ChevronLeft size={22} color={canPrev ? S.textPrimary : palette.neutral[600]} />
      </Pressable>
      <Text style={st.monthLabel}>{label}</Text>
      <Pressable
        style={[st.stepBtn, !canNext && st.stepBtnOff]}
        hitSlop={8}
        disabled={!canNext}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel={copy.earnings.screen.nextMonthA11y}
        accessibilityState={{ disabled: !canNext }}
      >
        <ChevronRight size={22} color={canNext ? S.textPrimary : palette.neutral[600]} />
      </Pressable>
    </View>
  );
}

// Bare stat — no card, no icon. The three sit in one row separated by blank space (label · figure ·
// unit stacked), so the breakdown reads as plain data under the hero rather than three more cards.
function StatTile({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={st.statTile}>
      <Text style={st.statLabel}>{label}</Text>
      <Text style={st.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{value}</Text>
      <Text style={st.statUnit} numberOfLines={2}>{unit}</Text>
    </View>
  );
}

/* ---------- screen ---------- */

export function RevenusScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [idx, setIdx] = React.useState(MONTHS.length - 1); // default = latest month
  const m = MONTHS[idx];
  const c = copy.earnings.screen;
  const loading = useFirstLoad('revenus', { active: visible, ms: 550 });

  const expected = m.earned + m.projected;                 // total the month is on track for
  const pct = expected > 0 ? Math.min(1, m.earned / expected) : 1;
  const up = m.trendPct >= 0;
  const trend = up ? INK.ok : INK.down;
  const TrendIcon = up ? TrendingUp : TrendingDown;

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: S.canvas }}>
        {/* ===== Top bar — period + title left, close right. Opened from Home's "Earnings"
             button (Revenus is no longer a tab — the WBS coach nav is 3 tabs). ===== */}
        <View style={st.topbar}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <Text style={st.title} numberOfLines={1}>{c.title}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={st.closeBtn} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={S.textPrimary} />
          </Pressable>
        </View>

        <Reveal loading={loading} skeleton={<RevenusSkeleton />}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp['2xl'] }}
        >
        {/* ===== Month selector ===== */}
        <MonthStepper
          label={m.label}
          onPrev={() => setIdx((i) => Math.max(0, i - 1))}
          onNext={() => setIdx((i) => Math.min(MONTHS.length - 1, i + 1))}
          canPrev={idx > 0}
          canNext={idx < MONTHS.length - 1}
        />

        {/* ===== Hero: actual revenue + trend, earned→expected meter, export ===== */}
        <LinearGradient
          colors={RAISED_GRAD}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={st.heroCard}
          accessibilityLabel={`${c.earnedLabel}: ${eur(m.earned)} euros, ${eur(m.projected)} ${c.projectedLabel}. ${m.trendPct > 0 ? '+' : ''}${m.trendPct}% ${c.trendSuffix} ${m.prevLabel}.`}
        >
          <View style={st.heroHead}>
            <Eyebrow>{c.earnedLabel}</Eyebrow>
            <View style={[st.chip, { backgroundColor: trend.bg }]}>
              <TrendIcon size={13} color={trend.fg} />
              <Text style={[st.chipTxt, { color: trend.fg }]}>
                {up ? '+' : ''}{m.trendPct}% {c.trendSuffix} {m.prevLabel}
              </Text>
            </View>
          </View>

          <View style={st.amountRow}>
            <Text style={st.amountBig}>{eur(m.earned)}</Text>
            <Text style={st.amountCur}>€</Text>
          </View>

          {/* earned → expected meter; gradient fill = realised share of the month */}
          <View style={st.meterTrack} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <LinearGradient
              colors={MOVEMENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[st.meterFill, { width: `${Math.round(pct * 100)}%` }]}
            />
          </View>
          <View style={st.meterLegend}>
            {/* Current month: "X € projected to come" on the left. Past months are fully
                realised (no projection) → just the total, so we drop the redundant left label. */}
            {m.projected > 0 ? (
              <Text style={st.metaLight}>{eur(m.projected)} € {c.projectedLabel}</Text>
            ) : (
              <View />
            )}
            <Text style={st.metaStrong}>{eur(expected)} € {c.expectedLabel}</Text>
          </View>

          <Pressable style={st.exportBtn} accessibilityRole="button" accessibilityLabel={c.exportA11y}>
            <Download size={16} color={S.textPrimary} style={{ marginRight: 8 }} />
            <Text style={st.exportTxt}>{c.exportPdf}</Text>
          </Pressable>
        </LinearGradient>

        {/* ===== Monthly breakdown — sessions · hours worked/scheduled · default rate ===== */}
        <View style={st.statsRow}>
          <StatTile label={c.stat.sessions} value={String(m.completed)} unit={c.stat.sessionsUnit} />
          <StatTile
            label={c.stat.hours}
            value={`${m.hoursWorked}h`}
            unit={`${c.stat.scheduledPrefix} ${m.hoursScheduled}h ${c.stat.scheduledSuffix}`}
          />
          <StatTile label={c.stat.rate} value={`${m.rate}€`} unit={c.stat.rateUnit} />
        </View>

        {/* ===== Sessions contributing to this month ===== */}
        <View style={st.section}>
          <View style={st.secHead}>
            <SectionTitle>{c.sessionsTitle}</SectionTitle>
          </View>
          <Text style={st.sectionNote}>{c.sessionsNote}</Text>
          <View style={st.list}>
            {m.sessions.map((s, i) => (
              <View key={`${s.place}-${s.date}`} style={[st.sessionRow, i > 0 && st.rowDivider]}>
                <View style={{ flex: 1 }}>
                  <Text style={st.sessionPlace} numberOfLines={1}>{s.place}</Text>
                  <View style={st.sessionMeta}>
                    <MapPin size={13} color={palette.neutral[400]} />
                    <Text style={st.sessionDate}>{s.date}</Text>
                    <View style={st.metaSep} />
                    <Rating value={s.rating} />
                  </View>
                </View>
                <Text style={st.sessionAmount}>{s.amount} €</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== Payment history (grouped by month/year · activity report, not an invoice) ===== */}
        <View style={st.section}>
          <View style={st.secHead}>
            <SectionTitle>{c.historyTitle}</SectionTitle>
          </View>
          <Text style={st.sectionNote}>{c.historyNote}</Text>
          <View style={st.list}>
            {HISTORY.map((p, i) => (
              <View key={p.label} style={[st.histRow, i > 0 && st.rowDivider]}>
                <View style={{ flex: 1 }}>
                  <Text style={st.histLabel} numberOfLines={1}>{p.label}</Text>
                  <Text style={st.histSub}>{p.sessions} {c.sessionsCountUnit} · {eur(p.amount)} €</Text>
                  <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                    <StatusChip status={p.status} />
                  </View>
                </View>
                {/* Download only when a statement exists (not for the in-progress month). */}
                {p.status !== 'inProgress' ? (
                  <Pressable style={st.dlBtn} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${c.downloadA11y}, ${p.label}`}>
                    <Download size={18} color={S.textPrimary} />
                  </Pressable>
                ) : (
                  <View style={st.dlBtnGhost} />
                )}
              </View>
            ))}
          </View>
        </View>
        </ScrollView>
        </Reveal>
      </View>
    </Modal>
  );
}

/* ---------- styles ----------
   Polarity: on the ink CANVAS -> S.textPrimary / S.textSecondary (light);
   inside the dark CARDS the text is the same light ramp (the cards are ink too). */
const st = StyleSheet.create({
  eyebrow: {
    fontFamily: F.body, fontSize: 13,
    letterSpacing: 1, color: S.textSecondary,
  },
  // Section heading — same voice as Accueil's secTitle (Oswald, lightly tracked).
  secTitle: {
    fontFamily: F.bodyS, fontSize: 16,
    letterSpacing: 0.9, color: S.textSecondary,
  },

  /* modal top bar (period + title left, close right) */
  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: S.surface,
  },
  title: { fontFamily: F.bodyS, fontSize: 28, lineHeight: 32, color: S.textPrimary, marginTop: 2 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  badgeDot: {
    position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 999,
    backgroundColor: color.action, borderWidth: 2, borderColor: S.canvas,
  },
  avatarWrap: {
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: F.oswB, fontSize: 17, color: color.onAction },

  /* month selector */
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: sp.md },
  stepBtn: {
    width: 44, height: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: S.surface, borderWidth: 1, borderColor: BORDER_INK,
  },
  stepBtnOff: { opacity: 0.45 },
  monthLabel: { flex: 1, textAlign: 'center', fontFamily: F.bodyS, fontSize: 20, color: S.textPrimary },

  /* hero card */
  heroCard: {
    marginTop: sp.lg, borderRadius: r.xl, padding: sp.lg,
    borderWidth: 1, borderColor: RAISED_BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20,
  },
  heroHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.sm },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: sp.sm },
  // Oswald bold for money figures (Anton is now reserved for time only).
  amountBig: { fontFamily: F.oswB, fontSize: 52, lineHeight: 64, color: S.textPrimary },
  amountCur: { fontFamily: F.oswB, fontSize: 30, color: S.textSecondary },

  /* earned → expected meter */
  meterTrack: { height: 10, borderRadius: 999, backgroundColor: TRACK, overflow: 'hidden', marginTop: sp.sm },
  meterFill: { height: '100%', borderRadius: 999 },
  meterLegend: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: sp.sm, gap: sp.sm },
  metaLight: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, flexShrink: 1 },
  metaStrong: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary },

  /* export button — outline secondary (the gradient stays reserved for the progress meter) */
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: 44, borderRadius: r.pill, marginTop: sp.lg,
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  exportTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: S.textPrimary },

  /* stat tiles — Accueil's metric-tile pattern: a label, an accent icon chip + the figure, and a
     dim baseline, all on the shared raised-surface gradient. */
  // Flat stats — no card/border/padding; just three columns sharing the row with blank space between.
  statsRow: { flexDirection: 'row', gap: sp.lg, marginTop: sp.xl },
  statTile: { flex: 1 },
  statLabel: { fontFamily: F.body, fontSize: 13, color: S.textSecondary },
  statValue: { fontFamily: F.oswB, fontSize: 28, lineHeight: 32, color: S.textPrimary, marginTop: 6 },
  statUnit: { fontFamily: F.body, fontSize: 12, lineHeight: 15, color: S.textSecondary, marginTop: 6 },

  /* sections */
  section: { marginTop: sp.xl },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionNote: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 4, marginBottom: sp.sm },
  /* sessions / payment history — flat entry stacks on the canvas (no box), rows split by hairlines */
  list: { marginTop: 2 },

  /* chips */
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  chipTxt: { fontFamily: F.body, fontSize: 12 },

  /* session rows */
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  rowDivider: { borderTopWidth: 1, borderTopColor: BORDER_INK },
  sessionPlace: { fontFamily: F.bodyS, fontSize: 17, color: S.textPrimary },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sessionDate: { fontFamily: F.body, fontSize: 13, color: palette.neutral[300] },
  metaSep: { width: 3, height: 3, borderRadius: 999, backgroundColor: palette.neutral[500] },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingVal: { fontFamily: F.bodyS, fontSize: 13, color: palette.or[300] },
  ratingNone: { fontFamily: F.body, fontSize: 13, color: palette.neutral[400] },
  sessionAmount: { fontFamily: F.oswB, fontSize: 18, color: S.textPrimary },

  /* payment-history rows */
  histRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  histLabel: { fontFamily: F.bodyS, fontSize: 17, color: S.textPrimary },
  histSub: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 2 },
  dlBtn: {
    width: 44, height: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[700],
  },
  dlBtnGhost: { width: 44, height: 44 },
});
