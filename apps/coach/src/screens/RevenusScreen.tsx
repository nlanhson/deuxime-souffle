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
 *  · submit the coach's own invoice for the month — a file (the PDF received by e-mail) or a photo
 * The payment HISTORY remains an ACTIVITY REPORT (not an invoice); the submit-invoice card is the
 * separate channel for the coach to send DS their actual invoice.
 *
 * Surface = coach: LIGHT app (cream canvas, S.canvas) with the Coach v2 "système de carte type" —
 * white StatusCards raised on the cream, each with a soft shadow + a 3px left status liseré. The
 * earnings hero is the single dark/strong focal block (its own rouge→or treatment + shadow). The
 * signature rouge→or gradient is reserved for the earned/expected progress meter (theme: gradient =
 * "hero CTAs / medals / progress"). UI text comes from ../copy.
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Download,
  Star, MapPin, Check, Hourglass, Clock, Banknote,
  FileText, Camera, CheckCircle2, Receipt, type LucideIcon,
} from '../icons';

import { palette, color, spacing as sp, radius as r, cardShape, surfaces, cardGradient as RAISED_GRAD, type StatusTone } from '../theme/theme';
import { StatusCard, StatusChip as ToneChip } from '../components/StatusCard';
import { copy } from '../copy';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { OptionSheet, type SheetOption } from '../components/OptionSheet';
import { RevenusSkeleton } from './skeletons';

const S = surfaces.coach;                     // cream (light) canvas / dark-on-cream text
const BORDER_INK = palette.neutral[200];      // dividers / hairlines on the cream canvas
const TRACK = palette.neutral[200];           // progress meter track
const MOVEMENT = [palette.rouge[500], palette.or[500]] as const; // signature gradient, 135°

/* Home's raised-surface texture — a slight top-lit vertical gradient + a very dim white hairline,
   so cards read as raised glass. Copied from Accueil so the two screens feel like one family. */
const RAISED_BORDER = 'rgba(24,23,21,0.07)';

/* Status tint pairs on the cream canvas — these match the shared `statusTones.paper` tokens and
   are kept here for the bits that aren't a StatusChip/StatusCard: the hero trend chip (ok/down) and
   the submit-invoice confirmation disc (ok). Payment-history + session rows now use the shared
   <StatusChip>/<StatusCard> instead. The `down` trend tint has no shared tone, so it stays raw. */
const INK = {
  ok:      { fg: palette.vert[700], bg: 'rgba(47,158,107,0.16)' },   // paid / trend up
  pending: { fg: palette.or[800], bg: 'rgba(242,194,0,0.13)' },      // awaiting payment
  info:    { fg: palette.bleu[700], bg: 'rgba(166,183,219,0.14)' },  // in progress (current month)
  down:    { fg: palette.rouge[600], bg: 'rgba(234,56,41,0.14)' },   // trend down
};

const F = {
  display: 'Anton_400Regular', // hero money totals (shared with Home) — Anton brand display face
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

/* 3-month rolling revenue forecast (DT-15) — DS books sessions ~3 months ahead, so the coach's
 * near-term income is largely projectable. M = current month (réalisé + prévu); M+1 / M+2 are
 * projected-only. Independent of the month stepper (always the next 3 months from "now"). June
 * matches the MONTHS data above (840 € earned + 1 260 € projected = 2 100 € expected). */
const FORECAST = [
  { key: 'jun', label: 'juin', earned: 840, projected: 1260 },
  { key: 'jul', label: 'juil.', earned: 0, projected: 1890 },
  { key: 'aug', label: 'août', earned: 0, projected: 1610 },
];
const FORECAST_MAX = Math.max(...FORECAST.map((f) => f.earned + f.projected)); // tallest bar = full track
const FORECAST_BAR_H = 120;
// Hero + average (Mint/Quicken pattern): the big 3-month total anchors the section; the average
// drives both the dashed reference line in the chart and the summary line below it.
const FORECAST_TOTAL = FORECAST.reduce((s, f) => s + f.earned + f.projected, 0);
const FORECAST_AVG = Math.round(FORECAST_TOTAL / FORECAST.length);
// Where the average reference line sits within the bar track (Quicken's average line, brand-styled).
const FORECAST_AVG_H = Math.round((FORECAST_AVG / FORECAST_MAX) * FORECAST_BAR_H);
const FORECAST_CAP = 6; // rounded bar tip
// Forecast bars use the brand orange ("braise/ember" from ehpad/admin): solid = réalisé (banked),
// light tint = prévu (projected). Same-hue solid/light split = Quicken's actual-vs-projected read.
const EMBER = '#F5821F';
const EMBER_SOFT = '#FBC089';

/* ---------- small building blocks ---------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={st.eyebrow}>{children}</Text>;
}

// Section heading — mirrors Accueil's section titles (Oswald, lightly tracked) so both screens
// share one heading voice.
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={st.secTitle}>{children}</Text>;
}

// Payment status → v2 StatusTone (PDF liseré legend): paid = Confirmée (green), awaiting = en
// attente (amber), inProgress = in-process (blue). Drives BOTH the row's left liseré and its chip.
const PAY_META: Record<PaymentStatus, { tone: StatusTone; icon: LucideIcon; label: string }> = {
  paid:       { tone: 'ok', icon: Check, label: copy.earnings.screen.status.paid },
  awaiting:   { tone: 'pending', icon: Hourglass, label: copy.earnings.screen.status.awaiting },
  inProgress: { tone: 'info', icon: Clock, label: copy.earnings.screen.status.inProgress },
};

// Status chip — the shared filled-tint pill; never colour alone (icon + word).
function StatusChip({ status }: { status: PaymentStatus }) {
  const m = PAY_META[status];
  return <ToneChip tone={m.tone} label={m.label} icon={m.icon} />;
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
      <Star size={13} color={palette.or[800]} fill={palette.or[800]} />
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

  // Submitted invoices, keyed by month — coaches send their own invoice to DS (a file received by
  // e-mail, or a photo). Mock-only: no real picker is wired; selecting a source records the method.
  const [invoices, setInvoices] = React.useState<Record<string, 'file' | 'photo'>>({});
  const [sourceOpen, setSourceOpen] = React.useState(false);
  const submittedVia = invoices[m.key];
  const ic = c.invoice;
  const sourceOptions: SheetOption[] = [
    { key: 'file', label: ic.fromFile, icon: FileText },
    { key: 'photo', label: ic.fromPhoto, icon: Camera },
    { key: 'library', label: ic.fromLibrary, icon: Receipt },
  ];
  const submitInvoice = (sourceKey: string) =>
    setInvoices((prev) => ({ ...prev, [m.key]: sourceKey === 'file' ? 'file' : 'photo' }));

  const expected = m.earned + m.projected;                 // total the month is on track for
  const pct = expected > 0 ? Math.min(1, m.earned / expected) : 1;
  const up = m.trendPct >= 0;
  const trend = up ? INK.ok : INK.down;
  const TrendIcon = up ? TrendingUp : TrendingDown;

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: S.canvas }}>
        {/* ===== Top bar — period + title left, close right (cream, per request). Opened from
             Home's "Earnings" button (Revenus is no longer a tab — coach nav is 3 tabs). ===== */}
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

          {/* Supporting subline (DoorDash idiom) — mirrors Home's earnings card: the quiet
              "projected to come" context sits under the big figure. Current month only (past
              months are fully realised → no projection to preview). */}
          {m.projected > 0 ? (
            <Text style={st.heroSub}>{eur(m.projected)} € {c.projectedLabel}</Text>
          ) : null}

          {/* earned → expected meter; gradient fill = realised share of the month */}
          <View style={st.meterTrack} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <LinearGradient
              colors={MOVEMENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[st.meterFill, { width: `${Math.round(pct * 100)}%` }]}
            />
          </View>
          {/* On-bar endpoint labels (Monarch idiom, mirrors Home) — the filled part = Gagné (left),
              the full track = attendu total (right). Projected moved up to the subline above. Past
              months are fully realised → drop the left label (the bar is full). */}
          <View style={st.meterLegend}>
            {m.projected > 0 ? (
              <Text style={st.metaLight}>{copy.earnings.earned}</Text>
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

        {/* ===== Monthly breakdown — sessions · hours worked/scheduled. The hourly-rate tile was
            removed (DT-05): the coach's rate is back-office-managed and never displayed. ===== */}
        <View style={st.statsRow}>
          <StatTile label={c.stat.sessions} value={String(m.completed)} unit={c.stat.sessionsUnit} />
          <StatTile
            label={c.stat.hours}
            value={`${m.hoursWorked}h`}
            unit={`${c.stat.scheduledPrefix} ${m.hoursScheduled}h ${c.stat.scheduledSuffix}`}
          />
        </View>

        {/* ===== Submit my invoice (per month) — coaches send their own invoice to DS, either as a
             file (the PDF received by e-mail) or a photo. One button opens a source sheet; once
             sent, the card flips to a confirmation for the selected month. ===== */}
        <View style={st.invoiceCard}>
          {submittedVia ? (
            <>
              <View style={st.invoiceHead}>
                <View style={[st.invoiceIcon, { backgroundColor: INK.ok.bg }]}>
                  <CheckCircle2 size={20} color={INK.ok.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.invoiceTitle}>{ic.submittedTitle}</Text>
                  <Text style={st.invoiceSub} numberOfLines={1}>
                    {m.label} · {ic.via[submittedVia]}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setSourceOpen(true)}
                  hitSlop={8}
                  style={({ pressed }) => [st.replaceBtn, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityLabel={ic.replaceA11y}
                >
                  <Text style={st.replaceTxt}>{ic.replace}</Text>
                </Pressable>
              </View>
              <Text style={st.invoiceNote}>{ic.submittedNote}</Text>
            </>
          ) : (
            <>
              <View style={st.invoiceHead}>
                <View style={[st.invoiceIcon, { backgroundColor: palette.neutral[200] }]}>
                  <Receipt size={20} color={S.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.invoiceTitle}>{ic.title}</Text>
                  <Text style={st.invoiceNote}>{ic.note}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setSourceOpen(true)}
                style={({ pressed }) => [st.invoiceBtn, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel={ic.ctaA11y}
              >
                <FileText size={16} color={S.textPrimary} style={{ marginRight: 8 }} />
                <Text style={st.invoiceBtnTxt}>{ic.cta}</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* ===== 3-month rolling revenue forecast (DT-15) — DS books ~3 months ahead, so the coach
             can anticipate cash flow. Current month = réalisé + prévu (stacked); next two = projected.
             Independent of the month stepper (always the next 3 months from now). ===== */}
        <View style={st.section}>
          <View style={st.secHead}>
            <SectionTitle>{c.forecastTitle}</SectionTitle>
          </View>
          <Text style={st.sectionNote}>{c.forecastNote}</Text>

          {/* Hero figure — the 3-month projected total, the number the coach is really here for
              (Mint/Quicken lead with the big amount before the chart). */}
          <View style={st.forecastHero}>
            <Text style={st.forecastHeroLabel}>{c.forecastHeroLabel}</Text>
            <View style={st.amountRow}>
              <Text style={st.forecastHeroApprox}>≈ </Text>
              <Text style={st.forecastHeroAmt}>{eur(FORECAST_TOTAL)}</Text>
              <Text style={st.forecastHeroCur}>€</Text>
            </View>
          </View>

          {/* Quicken-style column chart, flipped to rise from a baseline (income, not expense):
              red→orange brand bars, the current month stacking réalisé (red) under prévu (orange);
              a dashed average line crosses the columns. Amounts at the tips, months below. */}
          <View style={st.forecastChart}>
            {/* amounts at the bar tips */}
            <View style={st.fRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {FORECAST.map((f) => (
                <Text key={f.key} style={st.forecastAmt}>{eur(f.earned + f.projected)} €</Text>
              ))}
            </View>
            {/* bars + dashed average line + baseline axis */}
            <View
              style={st.barsRow}
              accessible
              accessibilityLabel={`${c.forecastA11y}. ${FORECAST.map((f) => `${f.label}, ${eur(f.earned + f.projected)} euros`).join('. ')}. ${c.forecastAvgLabel} ${eur(FORECAST_AVG)} euros ${c.forecastAvgUnit}.`}
            >
              {FORECAST.map((f) => {
                const projH = Math.round((f.projected / FORECAST_MAX) * FORECAST_BAR_H);
                const earnedH = Math.round((f.earned / FORECAST_MAX) * FORECAST_BAR_H);
                return (
                  <View key={f.key} style={st.barCell}>
                    {projH > 0 ? <View style={[st.segProj, st.capTop, { height: projH }]} /> : null}
                    {earnedH > 0 ? <View style={[st.segEarned, projH === 0 && st.capTop, { height: earnedH }]} /> : null}
                  </View>
                );
              })}
              <View pointerEvents="none" style={[st.avgLine, { bottom: FORECAST_AVG_H }]} />
              <View pointerEvents="none" style={st.axis} />
            </View>
            {/* month labels */}
            <View style={st.fRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {FORECAST.map((f) => (
                <Text key={f.key} style={st.forecastLbl}>{f.label}</Text>
              ))}
            </View>
          </View>

          {/* bar legend (red = réalisé, orange = prévu) */}
          <View style={st.forecastLegend}>
            <View style={st.legendItem}>
              <View style={[st.legendSwatch, { backgroundColor: EMBER }]} />
              <Text style={st.legendTxt}>{c.forecastEarned}</Text>
            </View>
            <View style={st.legendItem}>
              <View style={[st.legendSwatch, { backgroundColor: EMBER_SOFT }]} />
              <Text style={st.legendTxt}>{c.forecastProjected}</Text>
            </View>
          </View>

          {/* Quicken-style average line key — the dashed marker echoes the chart's reference line. */}
          <View style={st.avgSummary}>
            <View style={st.avgDash} />
            <Text style={st.avgSummaryLabel}>{c.forecastAvgLabel}</Text>
            <Text style={st.avgSummaryVal}>{eur(FORECAST_AVG)} € {c.forecastAvgUnit}</Text>
          </View>
        </View>

        {/* ===== Sessions contributing to this month ===== */}
        <View style={st.section}>
          <View style={st.secHead}>
            <SectionTitle>{c.sessionsTitle}</SectionTitle>
          </View>
          <Text style={st.sectionNote}>{c.sessionsNote}</Text>
          <View style={st.list}>
            {m.sessions.map((s) => (
              // Each contributing session = its own white v2 StatusCard. These are PAST, realised /
              // banked sessions → 'neutral' (passé / clôturé, grey liseré) — matching the PDF legend
              // and SeancesScreen's closed-session (reportSent) mapping; green=ok stays reserved for
              // confirmed/upcoming. The old per-row divider is gone; st.cardGap spaces the cards.
              <StatusCard key={`${s.place}-${s.date}`} status="neutral" style={st.cardGap}>
                <View style={st.sessionRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.sessionPlace} numberOfLines={1}>{s.place}</Text>
                    <View style={st.sessionMeta}>
                      <MapPin size={13} color={palette.neutral[500]} />
                      <Text style={st.sessionDate}>{s.date}</Text>
                      <View style={st.metaSep} />
                      <Rating value={s.rating} />
                    </View>
                  </View>
                  <Text style={st.sessionAmount}>{s.amount} €</Text>
                </View>
              </StatusCard>
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
            {HISTORY.map((p) => (
              // Each statement = its own white v2 StatusCard, the left liseré mirroring the chip's
              // tone (paid=ok/green, awaiting=pending/amber, inProgress=info/blue). Divider replaced
              // by marginBottom (st.cardGap). The Download button / ghost spacer are preserved.
              <StatusCard key={p.label} status={PAY_META[p.status].tone} style={st.cardGap}>
                <View style={st.histRow}>
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
              </StatusCard>
            ))}
          </View>
        </View>
        </ScrollView>
        </Reveal>

        {/* Source picker for the invoice — file (e-mail/files) or photo. */}
        <OptionSheet
          visible={sourceOpen}
          onClose={() => setSourceOpen(false)}
          title={ic.sheetTitle}
          help={ic.sheetHelp}
          options={sourceOptions}
          onSelect={submitInvoice}
          closeA11y={ic.sheetCloseA11y}
        />
      </View>
    </Modal>
  );
}

/* ---------- styles ----------
   Polarity: on the cream CANVAS -> S.textPrimary / S.textSecondary (dark-on-light). The list rows
   now live inside white v2 StatusCards, where the same dark-on-light ramp reads against the card. */
const st = StyleSheet.create({
  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, // Oswald — matches the header eyebrow on every other screen
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
  title: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: S.textPrimary, marginTop: 2 }, // Oswald — matches every other screen's title
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
    marginTop: sp.lg, ...cardShape, padding: sp.lg,
    borderWidth: 1, borderColor: RAISED_BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20,
  },
  heroHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.sm },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: sp.sm },
  // Anton for the hero money total — the brand display face carries the big figures (DS decision
  // 2026-06-18), shared with Home's "This month" hero. Supporting money (stats, per-session, bar
  // tips) stays Oswald. The € is a quiet Oswald unit. includeFontPadding:false keeps the tall Anton
  // glyphs off the line-box edges and baseline-aligned with the €.
  amountBig: { fontFamily: F.display, fontSize: 56, lineHeight: 68, letterSpacing: 0.5, color: S.textPrimary, includeFontPadding: false },
  amountCur: { fontFamily: F.oswB, fontSize: 30, color: S.textSecondary },
  // Supporting subline under the hero figure (DoorDash idiom, mirrors Home's earnings card).
  heroSub: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 4 },

  /* earned → expected meter */
  meterTrack: { height: 10, borderRadius: 999, backgroundColor: TRACK, overflow: 'hidden', marginTop: sp.sm },
  meterFill: { height: '100%', borderRadius: 999 },
  meterLegend: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: sp.sm, gap: sp.sm },
  metaLight: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, flexShrink: 1 },
  metaStrong: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary },

  /* export button — outline secondary (the gradient stays reserved for the progress meter) */
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: 44, borderRadius: r.button, marginTop: sp.lg,
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
  statUnit: { fontFamily: F.body, fontSize: 13, lineHeight: 15, color: S.textSecondary, marginTop: 6 },

  /* submit-invoice card — flat bordered card (house style: shadow reserved for overlays). The
     outline CTA matches the hero's export button; the gradient stays reserved for the meter. */
  invoiceCard: {
    marginTop: sp.xl, ...cardShape, padding: sp.lg,
    backgroundColor: S.surface, borderWidth: 1, borderColor: BORDER_INK,
  },
  invoiceHead: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  invoiceIcon: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  invoiceTitle: { fontFamily: F.bodyS, fontSize: 17, color: S.textPrimary },
  invoiceSub: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 3 },
  invoiceNote: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: S.textSecondary, marginTop: 4 },
  invoiceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: 44, borderRadius: r.button, marginTop: sp.md,
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  invoiceBtnTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: S.textPrimary },
  replaceBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  replaceTxt: { fontFamily: F.bodyS, fontSize: 14, color: palette.bleu[700] }, // bleu = interactive

  /* 3-month forecast (DT-15) — gold bars on the cream canvas: solid gold = réalisé, light gold =
     prévu. A faint track gives a max reference; each bar fills it from the bottom. Amounts align at
     the top, month labels at the bottom, so the three read as a clean little column chart. */
  // Hero figure above the chart — the 3-month projected total (Mint/Quicken lead-with-the-number).
  forecastHero: { marginTop: sp.sm },
  forecastHeroLabel: { fontFamily: F.body, fontSize: 13, letterSpacing: 0.4, color: S.textSecondary },
  forecastHeroApprox: { fontFamily: F.oswM, fontSize: 24, color: S.textSecondary, alignSelf: 'flex-end', marginBottom: 6 },
  // 3-month total — the screen's other hero figure → Anton, matching the month-earned hero above.
  forecastHeroAmt: { fontFamily: F.display, fontSize: 42, lineHeight: 51, letterSpacing: 0.5, color: S.textPrimary, includeFontPadding: false },
  forecastHeroCur: { fontFamily: F.oswB, fontSize: 24, color: S.textSecondary },
  /* 3-month forecast (DT-15) — Quicken-style column chart, flipped to rise from a baseline axis.
     Red→orange brand bars: solid red = réalisé (banked), orange = prévu (projected). A dashed
     average line crosses the columns. Amounts align at the tips, month labels at the bottom. */
  forecastChart: { marginTop: sp.lg },
  fRow: { flexDirection: 'row' },
  forecastAmt: { flex: 1, textAlign: 'center', fontFamily: F.oswB, fontSize: 16, color: S.textPrimary, marginBottom: 8 },
  barsRow: { flexDirection: 'row', height: FORECAST_BAR_H, alignItems: 'flex-end', position: 'relative' },
  barCell: { flex: 1, height: FORECAST_BAR_H, alignItems: 'center', justifyContent: 'flex-end' },
  segProj: { width: 46, backgroundColor: EMBER_SOFT },
  segEarned: { width: 46, backgroundColor: EMBER },
  capTop: { borderTopLeftRadius: FORECAST_CAP, borderTopRightRadius: FORECAST_CAP },
  // Dashed average reference line + the baseline axis the bars stand on.
  avgLine: { position: 'absolute', left: sp.sm, right: sp.sm, height: 0, borderTopWidth: 1.5, borderColor: palette.neutral[600], borderStyle: 'dashed', zIndex: 2 },
  axis: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1.5, borderRadius: 999, backgroundColor: palette.neutral[300] },
  forecastLbl: { flex: 1, textAlign: 'center', fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 8 },
  forecastLegend: { flexDirection: 'row', justifyContent: 'center', gap: sp.lg, marginTop: sp.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
  legendTxt: { fontFamily: F.body, fontSize: 13, color: S.textSecondary },
  // Quicken-style average summary — the dashed marker echoes the chart's reference line.
  avgSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: sp.sm },
  avgDash: { width: 16, height: 0, borderTopWidth: 1.5, borderColor: palette.neutral[600], borderStyle: 'dashed' },
  avgSummaryLabel: { fontFamily: F.body, fontSize: 13, color: S.textSecondary },
  avgSummaryVal: { fontFamily: F.bodyS, fontSize: 13, color: S.textPrimary },

  /* sections */
  section: { marginTop: sp.xl },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionNote: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 4, marginBottom: sp.sm },
  /* sessions / payment history — each row is now its own white v2 StatusCard (système de carte
     type); the cards are spaced by st.cardGap (no more hairline dividers). */
  list: { marginTop: 2 },
  cardGap: { marginBottom: sp.sm }, // spacing between stacked v2 cards (replaces the old divider)

  /* chips */
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  chipTxt: { fontFamily: F.body, fontSize: 13 },

  /* session rows — the v2 StatusCard supplies the card padding, so the row is just the flex layout */
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  sessionPlace: { fontFamily: F.bodyS, fontSize: 17, color: S.textPrimary },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sessionDate: { fontFamily: F.body, fontSize: 13, color: palette.neutral[600] },
  metaSep: { width: 3, height: 3, borderRadius: 999, backgroundColor: palette.neutral[500] },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingVal: { fontFamily: F.bodyS, fontSize: 13, color: palette.or[800] }, // DT-20: AA gold on light
  ratingNone: { fontFamily: F.body, fontSize: 13, color: palette.neutral[600] },
  sessionAmount: { fontFamily: F.oswB, fontSize: 18, color: S.textPrimary },

  /* payment-history rows — like sessionRow, the v2 StatusCard supplies padding; this is the flex layout */
  histRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  histLabel: { fontFamily: F.bodyS, fontSize: 17, color: S.textPrimary },
  histSub: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 2 },
  dlBtn: {
    width: 44, height: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[200],
  },
  dlBtnGhost: { width: 44, height: 44 },
});
