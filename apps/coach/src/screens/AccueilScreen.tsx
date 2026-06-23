/**
 * Coach · Accueil ("Hi, Karim") — the Home tab.
 * Ported from project/coach-app (v0.1 vertical slice) into the native-tab app.
 * Its own hand-drawn bottom bar was dropped — the native RootTabs provides the tab bar now.
 *
 * Surface = coach (cream canvas + an ink hero band up top — DT-01 dosed ink accent, not a dark
 * app). Cream breathes below; ink dramatizes the identity/score moment. MVP scope (no gamification).
 * UI text comes from ../copy (the localization seam — English for review, French to ship).
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Easing, AccessibilityInfo, LayoutChangeEvent, PanResponder, GestureResponderHandlers } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { setStatusBarStyle } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, CaretDownSolid, Bell, MapPin, CalendarDays, Check, CheckCircle2, Clock, Hand, X, AlarmClock, Sparkles } from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces, motion, cardGradient as RAISED_GRAD } from '../theme/theme';
import { useCopy } from '../i18n';
import type { Copy } from '../copy';
import { NotificationCenter } from '../components/NotificationCenter';
import { PrimaryButton } from '../components/PrimaryButton';
import { GradientFill } from '../components/GradientFill';
import { InkHeader } from '../components/InkHeader';
import { CalendarLegend } from '../components/CalendarLegend';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { COACH_PHOTO } from '../lib/coachProfile';
import { AvailableDetailModal } from '../components/AvailableDetailModal';
import { AvailableTodayModal } from '../components/AvailableTodayModal';
import { NextSessionDetailModal } from '../components/NextSessionDetailModal';
import { SessionMap } from '../components/SessionMap';
import { CheckInModal } from '../components/CheckInModal';
import { OptionSheet } from '../components/OptionSheet';
import { RevenusScreen } from './RevenusScreen';
import { currentTier, nextTier, sessionsToNext, tierProgress, TIERS } from '../lib/gamification';
import { useCompletedSessions } from '../lib/badgeCelebration';
import { useTabBarInset } from '../navigation/tabBarInsets';
import { openDirections } from '../lib/openDirections';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { AccueilSkeleton } from './skeletons';

const S = surfaces.coach;                     // canvas / surface / surfaceRaised / text / accent
const BORDER_INK = palette.neutral[200];      // dividers on the light canvas
const ON_LIGHT = palette.neutral[900];        // text on the raised white card
const ON_LIGHT_2 = palette.neutral[600];
const MOVEMENT = [palette.rouge[500], palette.or[500]] as const; // signature gradient, 135°

/* On-ink status colors — the gap the slice surfaced (semantic status tokens are tuned for
   light surfaces). Reaching into the global ramp here; SPEC §4 proposes promoting these
   to coach-theme tokens (--color-success-on-ink, etc.). */
const INK = {
  ok: palette.vert[500],
  okBg: 'rgba(47,158,107,0.16)',
  pending: palette.or[300],
  pendingBg: 'rgba(242,194,0,0.13)',
  pendingBorder: 'rgba(242,194,0,0.35)',
  info: palette.bleu[300],                 // #7B93C7 — readable blue on ink
  infoBg: 'rgba(123,147,199,0.14)',
  infoBorder: 'rgba(123,147,199,0.34)',
};

/* "This month" earnings — minimal metric tiles (icon · title · figure), like a fintech balance
   card but on the dark raised surface (no colour fill). The colour lives in the accent only: a
   tinted icon chip + the figure (Earned = green, Projected = yellow). The red check-in CTA stays
   the loudest thing on the screen. */
const ACCENT_GREEN = palette.vert[500];              // brand Vert (#2F9E6B) — Earned figure + icon
const ACCENT_GREEN_BG = INK.okBg;                    // brand Vert tint — green icon-chip
const ACCENT_YELLOW = palette.or[500];               // brand Or (#F2C200) — Projected figure + icon
const ACCENT_YELLOW_BG = 'rgba(242,194,0,0.16)';     // brand Or tint — yellow icon-chip

// "This month" earnings preview figures — mirror the Earnings screen's June data (840 € earned ·
// 1 260 € projected · 2 100 € expected) so Home and the dashboard never disagree. Real code reads
// these from the schedule; eur() is the en-US placeholder formatter (prod uses fr-FR thin spaces).
const MONTH_EARNED = 840;
const MONTH_PROJECTED = 1260;
const MONTH_EXPECTED = MONTH_EARNED + MONTH_PROJECTED;
const MONTH_PCT = Math.round((MONTH_EARNED / MONTH_EXPECTED) * 100); // realised share → meter fill
const eur = (n: number) => n.toLocaleString('en-US');

/* Raised-surface effect, shared by the summary tiles (Scheduled / Done) and the next-session hero:
   a slight top-lit vertical gradient centred on the surface (neutral[800] #2B2B2B) + a very dim
   hairline edge, so the card reads as raised glass. */
const RAISED_BORDER = 'rgba(24,23,21,0.07)';       // very dim hairline edge on the white card

const F = {
  display: 'Anton_400Regular',
  oswR: 'Oswald_400Regular',
  oswM: 'Oswald_500Medium',
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

// Live date anchor. Both calendar views are driven off the *real* current date, so "today", "this
// week" and the month grid always reflect now. The schedule (SESSIONS_BY_DAY) keeps its day-of-month
// keys as offsets against ANCHOR_TODAY (the prototype's original June-9 "today") and is materialised
// onto real dates relative to today, so the demo always shows the same done/upcoming spread whatever
// day it is opened. Real code queries the schedule by date + locale.
const NOW = new Date();
const TODAY_DATE = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());   // local midnight
const addDays = (base: Date, n: number) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));              // Mon-first week start
const daysBetween = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86_400_000);
const TODAY_KEY = dateKey(TODAY_DATE);
const ANCHOR_TODAY = 9; // the seed day-of-month keys are offsets against this original "today"

// Hero next-session timing (LIVE). The card's check-in state + countdown derive from a mock "now"
// anchored to today's session and ticked from the real-time delta — so the hero behaves like a real
// app (pre-window → check-in open → checked in) instead of a single static state, the way Jobber /
// Square Go do. Times mirror copy.nextSession.start/end (14:30 → 15:30).
const SESSION_START = new Date(TODAY_DATE.getFullYear(), TODAY_DATE.getMonth(), TODAY_DATE.getDate(), 14, 30);
const CHECKIN_LEAD_MS = 15 * 60 * 1000;                       // check-in opens 15 min before start
const CHECKIN_OPENS = SESSION_START.getTime() - CHECKIN_LEAD_MS;
// Seed "now" 12 min before start: the window is already open and the coach is on site, so the
// signature "Check in" CTA shows on load with a live countdown. Different seeds/proximity render
// the pre-window ("Check-in opens at …") and out-of-radius ("Move closer") states automatically.
const MOCK_NOW_SEED = SESSION_START.getTime() - 12 * 60 * 1000;
const ON_SITE = true; // mock proximity; false renders the out-of-radius "move closer" state

type CheckInPhase = 'tooEarly' | 'away' | 'ready';

type DaySession = { place: string; time: string; end: string; addr: string };
const SESSIONS_BY_DAY: Record<number, DaySession[]> = {
  2:  [{ place: 'Les Glycines', time: '10:00', end: '11:00', addr: 'Villeurbanne · 3.1 km' }],
  4:  [{ place: 'Résidence Bellevue', time: '09:30', end: '10:30', addr: 'Lyon 6e · 2.0 km' },
       { place: 'Résidence du Parc', time: '15:00', end: '16:00', addr: 'Villeurbanne · 3.1 km' }],
  6:  [{ place: 'Les Tilleuls', time: '11:00', end: '12:00', addr: 'Lyon 3e · 1.8 km' }],
  8:  [{ place: 'Résidence Bellevue', time: '14:30', end: '15:30', addr: 'Lyon 6e · 2.0 km' }],
  9:  [{ place: 'Résidence Les Tilleuls', time: '14:30', end: '15:30', addr: '12 rue des Lilas, Lyon 3e · 2.4 km' }],
  11: [{ place: 'Résidence du Parc', time: '10:00', end: '11:00', addr: 'Villeurbanne · 3.1 km' }],
  12: [{ place: 'Résidence Les Cèdres', time: '16:00', end: '17:00', addr: 'Lyon 7e · 4.8 km' }],
  16: [{ place: 'Les Glycines', time: '10:00', end: '11:00', addr: 'Villeurbanne · 3.1 km' }],
  18: [{ place: 'Résidence Bellevue', time: '15:00', end: '16:00', addr: 'Lyon 6e · 2.0 km' }],
  20: [{ place: 'Les Tilleuls', time: '09:30', end: '10:30', addr: 'Lyon 3e · 1.8 km' }],
  23: [{ place: 'Résidence du Parc', time: '11:00', end: '12:00', addr: 'Villeurbanne · 3.1 km' }],
  25: [{ place: 'Résidence Les Cèdres', time: '16:00', end: '17:00', addr: 'Lyon 7e · 4.8 km' }],
  27: [{ place: 'Les Glycines', time: '14:00', end: '15:00', addr: 'Villeurbanne · 3.1 km' }],
  30: [{ place: 'Résidence Bellevue', time: '10:30', end: '11:30', addr: 'Lyon 6e · 2.0 km' }],
};
// Materialise the schedule onto real dates (date = today + (seedDom − ANCHOR_TODAY)) and key it by
// date, so the calendar, the dots and the under-calendar detail all read the same source.
const SESSIONS_BY_KEY: Record<string, DaySession[]> = {};
Object.keys(SESSIONS_BY_DAY).map(Number).forEach((seedDom) => {
  SESSIONS_BY_KEY[dateKey(addDays(TODAY_DATE, seedDom - ANCHOR_TODAY))] = SESSIONS_BY_DAY[seedDom];
});
const sessionsOn = (key: string) => SESSIONS_BY_KEY[key] ?? [];
const isDue = (d: Date) => d < TODAY_DATE; // past sessions already happened → "due", shown grayed

const WEEKDAY_ABBR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_ABBR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MONTHS_FULL = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const dayLabel = (d: Date) => `${WEEKDAY_ABBR[(d.getDay() + 6) % 7]} · ${d.getDate()} ${MONTHS_ABBR[d.getMonth()]}`;
const dayA11y = (d: Date, load: number, ds: Copy['week']['daySection']) =>
  `${dayLabel(d)}, ${load === 0 ? ds.a11yNone : `${load} ${ds.a11ySessions}`}` +
  (load > 0 && isDue(d) ? `, ${ds.due}` : '');

// Week strip is date-driven so it can page to any week (offset 0 = this week, ± = next/previous).
const weekMonday = (offset: number) => addDays(mondayOf(TODAY_DATE), offset * 7);
const parseMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

type WeekDay = { wd: string; date: Date; today: boolean; load: number; empty: boolean; key: string };
function weekEyebrow(offset: number, w: Copy['week']) {
  if (offset === 0) return w.eyebrow;
  if (offset === -1) return w.lastWeek;
  if (offset === 1) return w.nextWeek;
  const mon = weekMonday(offset);
  return `${w.weekOf} ${MONTHS_ABBR[mon.getMonth()]} ${mon.getDate()}`;
}
// Everything the week view shows for a given offset: the 7 days + the summary numbers, all from
// the one session map + the today boundary (done = sessions already past, hours = summed durations).
function weekData(offset: number, w: Copy['week']) {
  const mon = weekMonday(offset);
  let done = 0, total = 0, mins = 0;
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(mon, i);
    const key = dateKey(date);
    const list = sessionsOn(key);
    total += list.length;
    if (date < TODAY_DATE) done += list.length;
    for (const s of list) mins += parseMin(s.end) - parseMin(s.time);
    return { wd: WEEKDAY_ABBR[i], date, today: key === TODAY_KEY, load: list.length, empty: i >= 5, key };
  });
  const h = Math.floor(mins / 60), m = mins % 60;
  return { days, total, done, pct: total ? Math.round((done / total) * 100) : 0, hours: m ? `${h}h ${m}m` : `${h}h`, eyebrow: weekEyebrow(offset, w) };
}

// Month grid is date-driven so it can page to any month (offset 0 = this month, ± = prev/next).
// Every day is selectable; sessions land on whichever days fall in range. Real code queries by month.
type MonthDay = { n: number; date: Date; load: number; today: boolean; key: string };
function monthData(offset: number) {
  const base = new Date(TODAY_DATE.getFullYear(), TODAY_DATE.getMonth() + offset, 1);
  const year = base.getFullYear(), mIdx = base.getMonth();
  const daysIn = new Date(year, mIdx + 1, 0).getDate();
  const lead = (base.getDay() + 6) % 7;                 // Mon-first leading blanks before day 1
  let done = 0, total = 0, mins = 0;
  const days: MonthDay[] = Array.from({ length: daysIn }, (_, i) => {
    const n = i + 1;
    const date = new Date(year, mIdx, n);
    const key = dateKey(date);
    const list = sessionsOn(key);
    total += list.length;
    if (date < TODAY_DATE) done += list.length;          // done-so-far = sessions already past
    for (const s of list) mins += parseMin(s.end) - parseMin(s.time);
    return { n, date, load: list.length, today: key === TODAY_KEY, key };
  });
  const h = Math.floor(mins / 60), m = mins % 60;
  return {
    days, lead,
    total, done, pct: total ? Math.round((done / total) * 100) : 0,
    hours: m ? `${h}h ${m}m` : `${h}h`,
    label: `${MONTHS_FULL[mIdx]} ${year}`, // "{Month} {Year}" — paging-aware label for the nav band
  };
}

// Open sessions to apply for (mock). DS schedules ~3 months ahead and fills most sessions early,
// so the open pool is mostly FURTHER-OUT sessions; only a couple still-unfilled near-term ones are
// "urgent" (a session about to start with no coach = grab it before it falls through). Each row
// carries `days` (how soon it starts) + `type` so the Home block surfaces the urgent ones first
// with the Disponibles chip mechanic (DT-14): ⏰ urgency chip + ✦ session-type chip. `when` is the
// card's date line. Day-sorted; only the first two trip the 3-day urgency window.
// The date strings (dow / when / date) are derived from each row's `days` offset against today, so
// the preview stays truthful as the real date moves (same materialisation as the calendar).
const availWhen = (offset: number) => {
  const d = addDays(TODAY_DATE, offset);
  const wd = WEEKDAY_ABBR[(d.getDay() + 6) % 7];
  const dm = `${d.getDate()} ${MONTHS_ABBR[d.getMonth()]}`;
  if (offset === 0) return { dow: 'Aujourd’hui', when: 'Aujourd’hui', date: `Aujourd’hui · ${wd} ${dm}` };
  if (offset === 1) return { dow: 'Demain', when: `${wd} · ${dm}`, date: `Demain · ${wd} ${dm}` };
  return { dow: wd, when: `${wd} · ${dm}`, date: `${wd} · ${dm}` };
};
const AVAILABLE = [
  { hr: '16:00', end: '17:00', nm: 'Résidence Les Érables', ds: 'Lyon 6e · 1.9 km · 1h', dur: '1h', addr: '5 rue Bellecour, Lyon 6e · 1.9 km', days: 0, type: 'regular' },
  { hr: '09:30', end: '10:30', nm: 'Résidence des Berges', ds: 'Lyon 7e · 4.1 km · 1h', dur: '1h', addr: '40 quai Rambaud, Lyon 7e · 4.1 km', days: 1, type: 'first' },
  { hr: '14:00', end: '15:00', nm: 'Résidence du Parc', ds: 'Villeurbanne · 3.1 km · 1h', dur: '1h', addr: '8 rue des Tilleuls, Villeurbanne · 3.1 km', days: 6, type: 'regular' },
  { hr: '11:00', end: '12:00', nm: 'Résidence Les Cèdres', ds: 'Lyon 7e · 4.8 km · 1h', dur: '1h', addr: '23 avenue du Parc, Lyon 7e · 4.8 km', days: 9, type: 'regular' },
  { hr: '10:00', end: '11:00', nm: 'Les Glycines', ds: 'Villeurbanne · 3.1 km · 1h', dur: '1h', addr: '12 rue de la Paix, Villeurbanne · 3.1 km', days: 13, type: 'first' },
].map((a) => ({ ...a, ...availWhen(a.days) }));
type AvailItem = (typeof AVAILABLE)[number];

// Urgent = starts within 3 days (same threshold as the Disponibles tab) — the still-unfilled
// near-term openings the coach should grab fast (DT-14). The rest are normal upcoming openings.
const URGENT_WITHIN_DAYS = 3;
const URGENT_AVAIL = AVAILABLE.filter((a) => a.days <= URGENT_WITHIN_DAYS);
const LATER_AVAIL = AVAILABLE.filter((a) => a.days > URGENT_WITHIN_DAYS).slice(0, 2); // Home teaser cap
// "Aujourd'hui" / "Demain" / "Dans N jours" — mirrors the Disponibles urgency label.
const availUrgencyLabel = (days: number, u: Copy['availableScreen']['list']['urgency']) =>
  days <= 0 ? u.today : days === 1 ? u.tomorrow : `${u.inDays} ${days} ${u.days}`;

/* ---------- small building blocks ---------- */

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <Text style={[st.eyebrow, light && { color: ON_LIGHT_2 }]}>{children}</Text>;
}

function SectionHeader({ title, link, onLink, right }: { title: string; link?: string; onLink?: () => void; right?: string }) {
  // When tappable, the WHOLE header row is the button (title + chevron), not just the chevron.
  // The link TEXT is optional — omit it for a chevron-only affordance (e.g. Earnings), keep it
  // for a labelled link (e.g. "See all"). `right` is a non-interactive trailing label (e.g. the
  // current month in the calendar's Month view).
  const body = (
    <>
      <Text style={st.secTitle}>{title}</Text>
      {onLink ? (
        <View style={st.linkBtn}>
          {link ? <Text style={st.linkTxt}>{link}</Text> : null}
          <ChevronRight size={16} color={S.textSecondary} />
        </View>
      ) : right ? (
        <Text style={st.secRight}>{right}</Text>
      ) : null}
    </>
  );
  if (!onLink) return <View style={st.secHead}>{body}</View>;
  return (
    <Pressable
      style={({ pressed }) => [st.secHead, pressed && { opacity: 0.6 }]}
      hitSlop={6}
      onPress={onLink}
      accessibilityRole="button"
      accessibilityLabel={link ?? title}
    >
      {body}
    </Pressable>
  );
}

function GhostBtn({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={({ pressed }) => [st.ghostBtn, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <Text style={st.ghostTxt}>{label}</Text>
    </Pressable>
  );
}

/* ---------- calendar card: Week / Month (C09 / C10) ---------- */

type CalMode = 'week' | 'month';

// How far the calendar content slides on a Week/Month switch — a moderate offset (not full
// width), enough to read as a slide while keeping the moving area small (vestibular-friendlier).
const SLIDE_DX = 56;

// Honour the OS "reduce motion" setting — the Week/Month crossfade collapses to an instant
// swap when it's on (vestibular safety is non-negotiable, not a taste call). Mirrors the hook
// in DisponiblesScreen.
function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    let on = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (on) setReduced(v); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { on = false; sub.remove(); };
  }, []);
  return reduced;
}

// Done-so-far summary + progress, shared by both views (counts differ per period).
// One Apple-Fitness-style metric tile: a top label, an accent icon chip + big Anton number with a
// small unit, and a muted baseline line. Used as a pair (scheduled / done) above the calendar.
// The tile frame (icon + label) is constant across Week/Month — only the figure + baseline change
// — so on a switch the card stays put and just the number/base crossfades (ease in/out via valueOpacity).
function MetricTile({ label, value, unit, base, Icon, tint, tintBg, a11y, valueOpacity }: {
  label: string; value: number; unit: string; base: string;
  Icon: typeof Check; tint: string; tintBg: string; a11y: string; valueOpacity?: Animated.Value;
}) {
  return (
    <LinearGradient
      colors={RAISED_GRAD}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={st.tile}
      accessible
      accessibilityLabel={a11y}
    >
      {/* Tinted rounded circle in the top-right corner (same chip language as the Earnings card). */}
      <View style={[st.tileChip, { backgroundColor: tintBg }]}>
        <Icon size={18} color={tint} strokeWidth={2.5} />
      </View>
      <Text style={st.tileLabel}>{label}</Text>
      <Animated.View style={[st.tileNumWrap, valueOpacity != null && { opacity: valueOpacity }]}>
        <Text style={st.tileNum}>{value}</Text>
        <Text style={st.tileUnit}>{unit}</Text>
      </Animated.View>
      <Animated.Text style={[st.tileBase, valueOpacity != null && { opacity: valueOpacity }]}>{base}</Animated.Text>
    </LinearGradient>
  );
}

// Condensed to a single quiet line ("4 of 5 sessions · 7h 30m") instead of two big-number tiles —
// the calendar grid below is the real "schedule at a glance"; this is just its caption. The done
// count keeps a subtle green accent; everything else stays muted. Crossfades on Week/Month switch.
// Caption (client reword): "{done} confirmed session(s) out of {total} scheduled · {hours}" — the
// confirmed-so-far count + the period plan + total scheduled hours. This restores the done/total
// ratio that was earlier dropped as ambiguous (Q2); the explicit "confirmed … out of … scheduled"
// wording the client supplied removes that ambiguity. Both figures are emphasised; singular/plural
// variants keep the agreement correct in FR and EN.
function CalSummary({ done, total, hours, valueOpacity }: { done: number; total: number; hours: string; valueOpacity?: Animated.Value }) {
  const copy = useCopy();
  const w = copy.week;
  const confirmedWord = done === 1 ? w.summaryConfirmedOne : w.summaryConfirmedMany;
  const scheduledWord = total === 1 ? w.summaryScheduledOne : w.summaryScheduledMany;
  return (
    <Animated.Text
      style={[st.calSummary, valueOpacity != null && { opacity: valueOpacity }]}
      accessibilityLabel={`${done} ${confirmedWord} ${w.summaryOf} ${total} ${scheduledWord}, ${hours}`}
    >
      <Text style={st.calSummaryStrong}>{done}</Text>
      {` ${confirmedWord} ${w.summaryOf} `}
      <Text style={st.calSummaryStrong}>{total}</Text>
      {` ${scheduledWord} · ${hours}`}
    </Animated.Text>
  );
}

function WeekView({ days, selected, onSelect, fade, x, pan }: {
  days: WeekDay[];
  selected: string;
  onSelect: (d: Date) => void;
  fade: Animated.Value;
  x: Animated.Value;
  pan: GestureResponderHandlers;
}) {
  const copy = useCopy();
  return (
    // The strip is swipeable to page weeks: pan handlers capture only clear horizontal drags, so
    // day taps and vertical scroll pass through.
    <Animated.View style={{ opacity: fade, transform: [{ translateX: x }] }} {...pan}>
      <View style={st.weekStrip}>
        {days.map((day) => {
          const on = day.key === selected;
          return (
            <Pressable
              key={day.key}
              style={st.day}
              onPress={() => onSelect(day.date)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={dayA11y(day.date, day.load, copy.week.daySection)}
            >
              <Text style={st.dayD}>{day.wd}</Text>
              <View style={[st.dayNumWrap, on && st.dayNumSel]}>
                <Text style={[st.dayN, on && st.dayNSelText, day.empty && !on && { color: S.textSecondary }, day.today && !on && { color: palette.rouge[600] }]}>{day.date.getDate()}</Text>
              </View>
              {/* Per-day session count — a small red number circle (shared with the Available page). */}
              <View style={st.load}>
                {day.load > 0 ? (
                  <View style={st.dayCountPill}>
                    <Text style={st.dayCountTxt}>{day.load}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

function MonthView({ days, lead, selected, onSelect, fade, x, pan }: {
  days: MonthDay[];
  lead: number;
  selected: string;
  onSelect: (d: Date) => void;
  fade: Animated.Value;
  x: Animated.Value;
  pan: GestureResponderHandlers;
}) {
  const copy = useCopy();
  return (
    // The pan + the weekday header (Mon–Sun) are STATIC — only the day grid slides/fades when paging
    // months, so the weekday strip stays put as a fixed frame. Pan claims only clear horizontal
    // drags, so day taps and vertical scroll pass through (same gesture contract as the week strip).
    <View {...pan}>
      <View style={st.moHead}>
        {WEEKDAY_ABBR.map((w, i) => (
          <Text key={i} style={st.moHeadTxt}>{w}</Text>
        ))}
      </View>
      <Animated.View style={{ opacity: fade, transform: [{ translateX: x }] }}>
        <View style={st.moGrid}>
          {/* leading blanks so day 1 lands under its weekday */}
          {Array.from({ length: lead }).map((_, i) => (
            <View key={`blank-${i}`} style={st.moCellWrap} />
          ))}
          {days.map((day) => {
            const on = day.key === selected;
            return (
              <Pressable
                key={day.n}
                style={st.moCellWrap}
                hitSlop={4}
                onPress={() => onSelect(day.date)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={dayA11y(day.date, day.load, copy.week.daySection)}
              >
                <View style={st.moCell}>
                  <View style={[st.moNumWrap, on && st.moNumSel]}>
                    <Text style={[st.moNum, on && st.moNumSelText, !day.load && !day.today && !on && { color: S.textSecondary }, day.today && !on && { color: palette.rouge[600] }]}>{day.n}</Text>
                  </View>
                  <View style={st.moDotRow}>{day.load ? <View style={st.loadDot} /> : null}</View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

// Week / Month nav band — prev/next chevrons flanking the centred period label, matching the
// Available screen's calendar nav. The chevrons drive the SAME goWeek / goMonth paths as the
// swipe gestures, so both stay in sync; the label crossfades with its grid via `labelFade`
// (weekFade when paging weeks, monthFade when paging months). Unlike the Available screen — a
// finite, June-only open-session list with bounded/disabled chevrons — the home calendar is a
// live, freely-browsable schedule, so the chevrons always page (no disabled boundary).
function CalNav({ label, onOpenMenu, menuA11y, onPrev, onNext, labelFade, prevA11y, nextA11y }: {
  label: string; onOpenMenu: () => void; menuA11y: string;
  onPrev: () => void; onNext: () => void;
  labelFade: Animated.Value; prevA11y: string; nextA11y: string;
}) {
  return (
    <View style={st.calNav}>
      {/* Title + a bare down-chevron — tapping opens the Week/Month view sheet (no pill chrome). */}
      <Pressable onPress={onOpenMenu} hitSlop={8} style={({ pressed }) => [st.calTitleBtn, pressed && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={menuA11y}>
        <Animated.Text style={[st.calNavLabel, { opacity: labelFade }]} numberOfLines={1}>{label}</Animated.Text>
        <CaretDownSolid size={22} color={S.textPrimary} style={st.calTitleChevron} />
      </Pressable>
      {/* Both chevrons grouped on the right, no circle chrome (Blackbird date-strip pattern). */}
      <View style={st.calNavBtns}>
        <Pressable onPress={onPrev} hitSlop={8} style={({ pressed }) => [st.calNavBtn, pressed && { opacity: 0.5 }]} accessibilityRole="button" accessibilityLabel={prevA11y}>
          <ChevronLeft size={22} color={S.textPrimary} />
        </Pressable>
        <Pressable onPress={onNext} hitSlop={8} style={({ pressed }) => [st.calNavBtn, pressed && { opacity: 0.5 }]} accessibilityRole="button" accessibilityLabel={nextA11y}>
          <ChevronRight size={22} color={S.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

// Under-calendar detail — the sessions on the tapped date. Past ("due") sessions read muted; the
// chip states the status in words so it never leans on color/graying alone.
function DaySessions({ date, onPressSession }: { date: Date; onPressSession?: () => void }) {
  const copy = useCopy();
  const sessions = sessionsOn(dateKey(date));
  const due = isDue(date);
  return (
    // Lives INSIDE the calendar card, under a full-bleed hairline rule — the tapped day's sessions
    // are part of the "Mon planning" card design (client: include the entry below, don't leave it
    // bare beside the carded calendar). The rule sets the grid above off from the day's list below.
    <View style={st.daySess}>
      {/* Date header + status tag removed per request — the day context comes from the calendar
          grid above; here we just list the selected day's sessions. */}
      {sessions.length === 0 ? (
        <Text style={st.muted}>{copy.week.daySection.empty}</Text>
      ) : (
        sessions.map((s, i) => (
          // Whole row taps through to the session detail (same modal the hero next-session opens).
          <Pressable
            key={i}
            style={({ pressed }) => [st.availRow, i === 0 && st.daySessFirst, i > 0 && st.availDivider, pressed && { opacity: 0.7 }]}
            onPress={onPressSession}
            accessibilityRole="button"
            accessibilityLabel={`${s.place}, ${s.time} to ${s.end}, ${s.addr}`}
          >
            <View style={st.availWhen}>
              <Text style={[st.availHr, due && { color: S.textSecondary }]}>{s.time}</Text>
              <Text style={st.dayEnd}>{s.end}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.availNm, due && { color: S.textSecondary }]}>{s.place}</Text>
              <Text style={st.availDs}>{s.addr}</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

/* ---------- screen ---------- */

export function AccueilScreen() {
  const copy = useCopy();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const navigation = useNavigation();                            // tab nav — header avatar + tier teaser → Profil tab
  // Tier teaser (Bronze → Diamant) — derived from the live session count, mirrors the Profil card.
  const sessions = useCompletedSessions();
  const heroTier = currentTier(sessions) ?? TIERS[0];
  const heroNextTier = nextTier(sessions);
  const heroTierRemaining = sessionsToNext(sessions);
  const [availDetail, setAvailDetail] = React.useState<AvailItem | null>(null);
  const [nextDetail, setNextDetail] = React.useState(false);
  const [checkInOpen, setCheckInOpen] = React.useState(false);   // C16 check-in flow (hero next session)
  const [checkedIn, setCheckedIn] = React.useState(false);       // flips the hero CTA once on site
  const [late, setLate] = React.useState(false);                 // C18 — checked in after the on-time window
  const [seeAllOpen, setSeeAllOpen] = React.useState(false);
  const [revenusOpen, setRevenusOpen] = React.useState(false);
  // Applied state for the Home "Séances supplémentaires" open sessions (DT-13). Shared by the
  // preview rows AND the "See all" sheet so raising / withdrawing a hand syncs across both.
  const [appliedAvail, setAppliedAvail] = React.useState<Set<string>>(() => new Set());
  const toggleAvail = React.useCallback((nm: string) => {
    setAppliedAvail((prev) => {
      const next = new Set(prev);
      if (next.has(nm)) next.delete(nm); else next.add(nm);
      return next;
    });
  }, []);
  const [calMode, setCalMode] = React.useState<CalMode>('week');   // drives the toggle — updates instantly on press
  const [calMenuOpen, setCalMenuOpen] = React.useState(false);     // Week/Month view dropdown (OptionSheet)
  const [shownMode, setShownMode] = React.useState<CalMode>('week'); // drives the content — lags one fade behind
  const [selectedDate, setSelectedDate] = React.useState<Date>(TODAY_DATE); // tapped calendar day
  const [weekOffset, setWeekOffset] = React.useState(0);            // 0 = this week; ± = previous/next (swipe)
  const [monthOffset, setMonthOffset] = React.useState(0);          // 0 = this month (June 2026); ± = prev/next (swipe)
  const reduced = useReducedMotion();
  const fade = React.useRef(new Animated.Value(1)).current;         // 1 = content shown, 0 = mid-swap (opacity)
  const slideX = React.useRef(new Animated.Value(0)).current;       // horizontal slide (px) — content moves with the toggle
  const titleFade = React.useRef(new Animated.Value(1)).current;    // section title crossfades (ease-in-out, no slide)
  const weekFade = React.useRef(new Animated.Value(1)).current;     // week-strip swipe (prev/next week)
  const weekX = React.useRef(new Animated.Value(0)).current;
  const monthFade = React.useRef(new Animated.Value(1)).current;    // month-grid swipe (prev/next month)
  const monthX = React.useRef(new Animated.Value(0)).current;
  const gridH = React.useRef(new Animated.Value(0)).current;        // animates the grid height so the page below doesn't jump
  const lastH = React.useRef(0);
  const [measured, setMeasured] = React.useState(false);
  const tabBarInset = useTabBarInset();
  const loading = useFirstLoad('accueil');

  // Home wears the ink header, so the status-bar glyphs (clock, wifi, battery) must be LIGHT here
  // to stay legible. Revert to dark (the app default) on blur, since every other screen is on the
  // cream canvas. Focus-scoped so tab switches restore the right polarity.
  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  // Live mock clock for the hero — anchored to the session day, ticked from the real-time delta so
  // the countdown actually moves. Drives the check-in phase + the "starts in …" readout. We poll
  // each second but only re-render when the displayed MINUTE changes (the countdown + every phase
  // boundary are minute-aligned), so the screen doesn't re-render 60×/min for no visible change.
  const [nowMs, setNowMs] = React.useState(MOCK_NOW_SEED);
  React.useEffect(() => {
    const t0 = Date.now();
    let lastMin = Math.floor(MOCK_NOW_SEED / 60000);
    const id = setInterval(() => {
      const next = MOCK_NOW_SEED + (Date.now() - t0);
      const min = Math.floor(next / 60000);
      if (min !== lastMin) { lastMin = min; setNowMs(next); }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Slide + fade between the two periods. The content moves WITH the toggle's spatial order
  // (Week left, Month right): picking Month slides the current view out to the left and brings
  // Month in from the right; picking Week reverses it. The fade masks the swap so nothing pops
  // from nothing; the toggle pill itself moves instantly. Height settles via onGridLayout.
  // Reduced motion → instant swap (no slide, no fade — vestibular safety).
  React.useEffect(() => {
    if (calMode === shownMode) return;
    if (reduced) { setShownMode(calMode); return; }
    const dir = calMode === 'month' ? 1 : -1; // forward (→) slides out left, in from right
    let cancelled = false;
    // out: content slides off + fades; the title only crossfades (ease-in-out, no slide)
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideX, { toValue: -dir * SLIDE_DX, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(titleFade, { toValue: 0, duration: motion.duration.fast, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished || cancelled) return;
      setShownMode(calMode);
      slideX.setValue(dir * SLIDE_DX); // place the incoming view on its starting side
      // in: content slides to rest + fades; the title crossfades back in (ease-in-out)
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideX, { toValue: 0, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleFade, { toValue: 1, duration: motion.duration.base, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
    return () => { cancelled = true; };
  }, [calMode, shownMode, reduced, fade, slideX, titleFade]);

  // The week strip (~1 row) and month grid (~5 rows) differ a lot in height; animate the
  // wrapper to the new content height so the sections below slide rather than snap. The first
  // measure (and reduced motion) set it instantly.
  const onGridLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (!h || h === lastH.current) return;
    lastH.current = h;
    if (!measured) { gridH.setValue(h); setMeasured(true); return; }
    if (reduced) { gridH.setValue(h); return; }
    Animated.timing(gridH, { toValue: h, duration: motion.duration.base, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
  };

  // Page the week strip to the previous (dir −1) / next (dir +1) week. Same slide + fade language
  // as the Week/Month switch, directional; reduced motion → instant. The strip height is constant,
  // so this never triggers the grid-height animation.
  const goWeek = (dir: number) => {
    if (reduced) { setWeekOffset((o) => o + dir); return; }
    Animated.parallel([
      Animated.timing(weekFade, { toValue: 0, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(weekX, { toValue: -dir * SLIDE_DX, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setWeekOffset((o) => o + dir);
      weekX.setValue(dir * SLIDE_DX); // incoming week starts on the side it travels from
      Animated.parallel([
        Animated.timing(weekFade, { toValue: 1, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(weekX, { toValue: 0, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  };
  // PanResponder is created once; a ref keeps it pointed at the latest goWeek (captures `reduced`).
  const goWeekRef = React.useRef(goWeek);
  goWeekRef.current = goWeek;
  const weekPan = React.useRef(
    PanResponder.create({
      // Claim the gesture only for clear horizontal drags — taps and vertical scroll pass through.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) < 40 && Math.abs(g.vx) < 0.3) return; // ignore small drags / flicks
        goWeekRef.current(g.dx < 0 ? 1 : -1); // swipe left → next week, right → previous week
      },
    })
  ).current;
  const wk = weekData(weekOffset, copy.week);
  const selectedKey = dateKey(selectedDate);

  // Page the month grid prev/next — same slide + fade language as the week pager. The grid-height
  // animation (onGridLayout) absorbs the 5↔6-row difference between months so nothing snaps.
  const goMonth = (dir: number) => {
    if (reduced) { setMonthOffset((o) => o + dir); return; }
    Animated.parallel([
      Animated.timing(monthFade, { toValue: 0, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(monthX, { toValue: -dir * SLIDE_DX, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setMonthOffset((o) => o + dir);
      monthX.setValue(dir * SLIDE_DX); // incoming month starts on the side it travels from
      Animated.parallel([
        Animated.timing(monthFade, { toValue: 1, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(monthX, { toValue: 0, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  };
  const goMonthRef = React.useRef(goMonth);
  goMonthRef.current = goMonth;
  const monthPan = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) < 40 && Math.abs(g.vx) < 0.3) return; // ignore small drags / flicks
        goMonthRef.current(g.dx < 0 ? 1 : -1); // swipe left → next month, right → previous month
      },
    })
  ).current;
  const mo = monthData(monthOffset);

  // Switch the calendar between Week and Month (from the view dropdown). Entering Week resets to
  // this week and keeps the highlight on a visible cell; entering Month returns to the current
  // month. (Formerly the Segmented onChange — same logic, now driven by the OptionSheet.)
  const changeCalMode = (m: CalMode) => {
    setCalMode(m);
    if (m === 'week') {
      setWeekOffset(0);
      setMonthOffset(0);
      // snap the selected day back into this week if it has drifted out (e.g. after Month paging)
      const fromMon = daysBetween(selectedDate, weekMonday(0));
      if (fromMon < 0 || fromMon > 6) setSelectedDate(TODAY_DATE);
    } else {
      setMonthOffset(0);
    }
  };

  // Hero check-in phase, derived live from the mock clock + proximity. Pre-window shows a
  // countdown to when check-in opens; out-of-radius asks the coach to move closer; on site shows
  // the red check-in CTA. The status chip and countdown track the same source.
  const checkInPhase: CheckInPhase =
    nowMs < CHECKIN_OPENS ? 'tooEarly' : !ON_SITE ? 'away' : 'ready';
  const statusChip = checkedIn
    ? (late
        ? { label: copy.nextSession.statusLate, fg: INK.pending, bg: INK.pendingBg }
        : { label: copy.sessions.status.checkedIn, fg: INK.ok, bg: INK.okBg })
    : checkInPhase === 'ready'
      ? { label: copy.sessions.status.checkinOpen, fg: INK.ok, bg: INK.okBg }
      : { label: copy.nextSession.status, fg: INK.info, bg: INK.infoBg };

  // One open-session row for the "Séances ouvertes à venir" block (DT-13/14). The ⏰ urgency chip
  // shows ONLY when the session is genuinely urgent (starts within the window); the ✦ type chip and
  // the raise-hand apply action are always present. Shared by the Urgentes + "Plus tard" groups.
  const renderOpenRow = (a: AvailItem, i: number) => {
    const applied = appliedAvail.has(a.nm);
    const isFirst = a.type === 'first';
    const urgent = a.days <= URGENT_WITHIN_DAYS;
    const showTags = urgent || isFirst || applied;
    return (
      <View key={a.nm} style={[st.addlRow, i === 0 && { paddingTop: 0 }, i > 0 && st.availDivider]}>
        <Pressable
          style={({ pressed }) => [st.addlRowBody, pressed && { opacity: 0.7 }]}
          onPress={() => setAvailDetail(a)}
          accessibilityRole="button"
          accessibilityLabel={[a.nm, `${a.when} ${a.hr} to ${a.end}`, a.ds, urgent ? availUrgencyLabel(a.days, copy.availableScreen.list.urgency) : undefined, isFirst ? copy.availableScreen.type.first : undefined, applied ? copy.availableScreen.status.applied : undefined].filter(Boolean).join(', ')}
        >
          <View style={st.availWhen}>
            <Text style={st.availHr}>{a.hr}</Text>
            <Text style={st.dayEnd}>{a.end}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {/* date line (Available-page card) */}
            <Text style={st.urgWhen}>{a.when}</Text>
            <Text style={st.availNm} numberOfLines={1}>{a.nm}</Text>
            <Text style={st.availDs} numberOfLines={1}>{a.ds}</Text>
            {/* chip row — urgency (urgent only) · session type · applied (all carry an icon + word) */}
            {showTags ? (
              <View style={st.tagRow}>
                {urgent ? (
                  <View style={st.urgencyTag}>
                    <AlarmClock size={12} color={palette.rouge[600]} strokeWidth={2.5} />
                    <Text style={st.urgencyTxt}>{availUrgencyLabel(a.days, copy.availableScreen.list.urgency)}</Text>
                  </View>
                ) : null}
                {isFirst ? (
                  <View style={st.typeTag}>
                    <Sparkles size={12} color={color.info} strokeWidth={2.5} />
                    <Text style={st.typeTagTxt}>{copy.availableScreen.type.first}</Text>
                  </View>
                ) : null}
                {applied ? (
                  <View style={st.appliedTag}>
                    <Check size={12} color={palette.vert[600]} strokeWidth={2.5} />
                    <Text style={st.appliedTagTxt}>{copy.availableScreen.status.applied}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </Pressable>
        {/* raise-hand (apply) ↔ withdraw — the Disponibles-tab action, now on Home (DT-13/14) */}
        {applied ? (
          <Pressable
            style={({ pressed }) => [st.actionCircle, st.withdrawCircle, pressed && { opacity: 0.7 }]}
            onPress={() => toggleAvail(a.nm)}
            accessibilityRole="button"
            accessibilityLabel={`${copy.availableScreen.action.withdraw}, ${a.nm}`}
          >
            <X size={20} color={ON_LIGHT} />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [st.actionCircle, st.applyCircle, pressed && { opacity: 0.9 }]}
            onPress={() => toggleAvail(a.nm)}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: S.canvas }} edges={['left', 'right']}>
      {/* ===== Fixed ink hero (DT-01 + moodboard coach hero) — greeting + bell/avatar on one row,
          then stats. Sits OUTSIDE the ScrollView so it stays pinned to the top while the body
          scrolls; the ranked level card sits below on cream. ===== */}
      {/* Home tightens the shared band's bottom padding by 12px (sp.lg → 12) — the same amount the
          greeting↔level gap was trimmed — so the hero hugs its content and reads compact/intentional. */}
      <InkHeader style={{ paddingBottom: sp.lg - 12 }}>
        {/* Top row: greeting (left, fills the space) aligned with notifications + avatar (right).
            Anton display caps, HERO ONLY (no-all-caps holds everywhere else). */}
        <View style={st.heroTop}>
          <Text style={st.heroGreet} numberOfLines={2}>{copy.header.greeting}</Text>
          <View style={st.heroTopRight}>
            <Pressable style={st.iconBtn} hitSlop={6} onPress={() => setNotifOpen(true)} accessibilityLabel={copy.header.notificationsA11y}>
              <Bell size={22} color={S.ink.textPrimary} fill={S.ink.textPrimary} />
              <View style={[st.badgeDot, { borderColor: S.ink.bg }]} />
            </Pressable>
            <Pressable style={st.avatarWrap} hitSlop={6} onPress={() => navigation.navigate('Profile' as never)} accessibilityLabel={copy.header.profileA11y}>
              <ProfileAvatar size={44} uri={COACH_PHOTO} />
            </Pressable>
          </View>
        </View>

        {/* Level + progress under the greeting (PLA-01) — "NIVEAU 4" in gold + slim rouge→or meter,
            on the ink hero. A teaser only: it taps through to the Profil tab, where the level card
            opens the full gamified surface (tier ladder, badges, matching score) as a modal. */}
        <Pressable
          style={({ pressed }) => [st.levelRow, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.navigate('Profile' as never)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${copy.header.levelA11y}. ${copy.game.tierPrefix} ${copy.game.tiers[heroTier.key].name}.${heroNextTier ? ` ${heroTierRemaining} ${heroTierRemaining <= 1 ? copy.game.toNextOne : copy.game.toNextN} ${copy.game.tiers[heroNextTier.key].name}.` : ` ${copy.game.maxedCaption}.`}`}
        >
          <Text style={st.levelTxt}>{copy.game.tiers[heroTier.key].name}</Text>
          <View
            style={st.levelTrack}
            accessibilityRole="progressbar"
            accessibilityValue={heroNextTier ? { min: 0, max: heroNextTier.threshold, now: sessions } : { min: 0, max: 1, now: 1 }}
          >
            <LinearGradient colors={MOVEMENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[st.levelFill, { width: `${Math.round(tierProgress(sessions) * 100)}%` }]} />
          </View>
        </Pressable>

        {/* Streak + residents stats removed — neither traces to the WBS (header = greeting + bell +
            avatar, C32/C06; streak is PRD-deferred gamification, residents an invented figure). The
            hero now leads with greeting + LEVEL only. */}
      </InkHeader>
      <Reveal loading={loading} skeleton={<AccueilSkeleton />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp.xl + tabBarInset }}
      >

        {/* Coach level now lives in the ink hero (compact "LEVEL 3" + meter under the greeting); the
            full badge grid + matching score live on the Badges & level screen, one tap away. The
            standalone Home card was removed to keep the ink accent dosed to a single hero moment. */}

        {/* Report-due and availability nudges intentionally NOT on Home: per the WBS both surface
            through the notification center (the bell) — kept off Home to stick to scope. */}

        {/* ===== This month earnings (C35) — Home preview card =====
            Design language shared with the full Revenus dashboard hero (RevenusScreen): DoorDash-style
            hierarchy + Monarch-style on-bar endpoint labels (Mobbin refs 2026-06-19). The two are
            INTENTIONALLY kept in sync — iterate on both together so Home and the dashboard read as one.
              · eyebrow + explicit "Revenus ›" link (DoorDash affordance, replaces the bare chevron)
              · Anton hero figure = Gagné so far
              · quiet supporting subline (DoorDash) — confirmed + upcoming session context
              · earned→expected gradient meter (brand DT-02)
              · on-bar endpoint labels (Monarch) — filled part = Gagné, full track = attendu
            Tappable → financial dashboard. ===== */}
        <View style={[st.section, { marginTop: sp.lg }]}>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            onPress={() => setRevenusOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`${copy.earnings.eyebrow}. ${copy.earnings.earned}, ${eur(MONTH_EARNED)} €. ${eur(MONTH_PROJECTED)} € ${copy.earnings.projected.toLowerCase()}, ${eur(MONTH_EXPECTED)} € ${copy.earnings.expected}.`}
          >
            <View style={st.earnCardHead}>
              <Text style={st.secTitle}>{copy.earnings.eyebrow}</Text>
              {/* explicit labelled link instead of a bare chevron (DoorDash "View payout details") */}
              <View style={st.linkBtn}>
                <Text style={st.linkTxt}>{copy.earnings.link}</Text>
                <ChevronRight size={16} color={S.textSecondary} />
              </View>
            </View>
            <View style={st.earnHeroRow}>
              <Text style={st.earnFig}>{eur(MONTH_EARNED)}</Text>
              <Text style={st.earnCur}>€</Text>
            </View>
            {/* supporting subline — quiet context under the big figure (DoorDash idiom) */}
            <Text style={st.earnSub}>{`${copy.earnings.confirmedSub} · ${copy.earnings.projectedSub}`}</Text>
            {/* earned → expected meter — the Earnings hero's signature, brand gradient (DT-02) */}
            <View style={st.earnMeter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <LinearGradient colors={MOVEMENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[st.earnMeterFill, { width: `${MONTH_PCT}%` }]} />
            </View>
            {/* on-bar endpoint labels — filled part = Gagné (left), full track = attendu (right) */}
            <View style={st.earnLegend}>
              <Text style={st.earnLegendLight}>{copy.earnings.earned}</Text>
              <Text style={st.earnLegendStrong}>{`${eur(MONTH_EXPECTED)} € ${copy.earnings.expected}`}</Text>
            </View>
          </Pressable>
        </View>

        {/* ===== Hero: next session (C16 / C21 / C22) — the screen's single focal point ===== */}
        <View style={st.section}>
          <View style={st.secHead}>
            <Text style={st.secTitle}>{copy.nextSession.eyebrow}</Text>
            {/* Status chip lives on the section-title row (outside the card), far right. Tracks the
                live phase: Confirmed → Check-in open → Checked in (or Running late). */}
            <View style={[st.chip, { backgroundColor: statusChip.bg }]}>
              <View style={[st.dot, { backgroundColor: statusChip.fg }]} />
              <Text style={[st.chipTxt, { color: statusChip.fg }]}>{statusChip.label}</Text>
            </View>
          </View>

          {/* The whole card is tappable → full session detail. The inner Directions / Check in
              Pressables capture their own taps, so they still fire their own actions. */}
          <Pressable
            style={({ pressed }) => [st.heroCard, pressed && { opacity: 0.85 }]}
            onPress={() => setNextDetail(true)}
            accessibilityRole="button"
            accessibilityLabel={`${copy.nextSession.place}, ${copy.nextSession.start} to ${copy.nextSession.end}, ${copy.nextSession.address}`}
          >
            {/* Fresha "Upcoming" layout: a functional map on top, then a minimal info stack
                (place · when · duration+unit). The map shows WHERE, so the address line is dropped. */}
            <View style={st.heroClip}>
              <SessionMap
                onPress={() => openDirections(copy.nextSession.address)}
                a11y={`${copy.nextSession.directions}: ${copy.nextSession.address}`}
                style={st.heroMap}
              />
              {/* Ink body (DT-02) — dark surface under the map; the gradient CTA pops on it. */}
              <View style={st.heroBody}>
                <Text style={st.heroTitle} numberOfLines={1}>{copy.nextSession.place}</Text>
                <Text style={st.heroWhen}>{`${copy.nextSession.whenPrefix} · ${copy.nextSession.start} → ${copy.nextSession.end}`}</Text>
                <Text style={st.heroMeta} numberOfLines={1}>{`${copy.nextSession.duration} · ${copy.nextSession.unit}`}</Text>

              {/* Single CTA: one Check-in button across every state (Directions dropped — the map
                  above taps through to directions). On site → enabled red CTA; pre-window /
                  out-of-radius → disabled CTA with the reason on a status line; checked in → badge. */}
              {checkedIn ? (
                <View style={st.ctaRow}>
                  <View style={st.checkedInBadge}>
                    <CheckCircle2 size={16} color={palette.vert[500]} style={{ marginRight: 6 }} />
                    <Text style={st.checkedInTxt}>{late ? copy.nextSession.checkedInLate : copy.sessions.status.checkedIn}</Text>
                  </View>
                </View>
              ) : checkInPhase === 'ready' ? (
                <View style={st.ctaRow}>
                  <PrimaryButton
                    compact
                    icon={<MapPin size={16} color={color.onAction} />}
                    label={copy.nextSession.checkInCta}
                    onPress={() => setCheckInOpen(true)}
                    style={{ flex: 1 }}
                  />
                </View>
              ) : (
                <>
                  <View style={st.statusLine}>
                    {checkInPhase === 'tooEarly'
                      ? <Clock size={14} color={INK.info} />
                      : <MapPin size={14} color={INK.pending} />}
                    <Text style={[st.statusLineTxt, { color: checkInPhase === 'tooEarly' ? INK.info : INK.pending }]}>
                      {checkInPhase === 'tooEarly' ? copy.nextSession.opensLine : copy.nextSession.awayLine}
                    </Text>
                  </View>
                  <View style={st.ctaRow}>
                    <View style={[st.disabledBtn, { flex: 1, flexDirection: 'row' }]} accessibilityRole="button" accessibilityState={{ disabled: true }}>
                      <MapPin size={16} color={palette.neutral[400]} style={{ marginRight: 6 }} />
                      <Text style={st.disabledTxt}>{copy.nextSession.checkInCta}</Text>
                    </View>
                  </View>
                </>
              )}
              </View>
            </View>
          </Pressable>
        </View>

        {/* ===== Mon planning — calendar (C09 / C10). DT-13: titled as the coach's CONFIRMED
             schedule, set apart from the "Séances supplémentaires" opportunities block below. ===== */}
        <View style={st.section}>
          {/* "Mon planning" title (DT-13) — names the confirmed schedule. The done/total summary
              sits on its OWN line directly under the title (client reword: caption under the title,
              not on the same line). The period label lives in the nav band inside the card below.
              The summary crossfades on a Week/Month switch — only the figures change (titleFade). */}
          <View style={st.planningHead}>
            <Text style={st.secTitle}>{copy.week.planningTitle}</Text>
            <CalSummary
              done={shownMode === 'week' ? wk.done : mo.done}
              total={shownMode === 'week' ? wk.total : mo.total}
              hours={shownMode === 'week' ? wk.hours : mo.hours}
              valueOpacity={titleFade}
            />
          </View>
          {/* The calendar itself (period nav + grid + legend) is boxed in a flat bordered card so it
              reads as a distinct tile, set clearly apart from the bare selected-day session list
              below (client: separate the two). House "flat bordered card" — white raised gradient +
              hairline edge; no shadow (shadow is for overlays only). */}
          <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={st.calCard}>
            {/* period nav — week-range / month label + a view-mode dropdown (Week/Month) beside it,
                prev/next chevrons on the right. The Segmented toggle was folded into this dropdown to
                simplify the section (one nav row instead of a separate toggle row). Crossfades on the
                Week/Month switch via titleFade; the label itself crossfades on paging via weekFade /
                monthFade inside CalNav. Sits OUTSIDE the height-animated grid wrapper so it never
                perturbs the gridH tween. */}
            <Animated.View style={{ opacity: titleFade }}>
              {shownMode === 'week' ? (
                <CalNav
                  label={wk.eyebrow}
                  onOpenMenu={() => setCalMenuOpen(true)}
                  menuA11y={copy.week.toggleA11y}
                  onPrev={() => goWeek(-1)}
                  onNext={() => goWeek(1)}
                  labelFade={weekFade}
                  prevA11y={copy.week.prevWeekA11y}
                  nextA11y={copy.week.nextWeekA11y}
                />
              ) : (
                <CalNav
                  label={mo.label}
                  onOpenMenu={() => setCalMenuOpen(true)}
                  menuA11y={copy.week.toggleA11y}
                  onPrev={() => goMonth(-1)}
                  onNext={() => goMonth(1)}
                  labelFade={monthFade}
                  prevA11y={copy.week.prevMonthA11y}
                  nextA11y={copy.week.nextMonthA11y}
                />
              )}
            </Animated.View>
            {/* grid: outer wrapper animates height + clips the slide; inner slides + fades on mode switch */}
            <Animated.View style={[measured && { height: gridH }, { overflow: 'hidden' }]}>
              <Animated.View style={{ opacity: fade, transform: [{ translateX: slideX }] }} onLayout={onGridLayout}>
                {shownMode === 'week'
                  ? <WeekView days={wk.days} selected={selectedKey} onSelect={setSelectedDate} fade={weekFade} x={weekX} pan={weekPan.panHandlers} />
                  : <MonthView days={mo.days} lead={mo.lead} selected={selectedKey} onSelect={setSelectedDate} fade={monthFade} x={monthX} pan={monthPan.panHandlers} />}
              </Animated.View>
            </Animated.View>
            {/* Dot legend (coach feedback) — only the Month grid carries the dot; clarify it marks the
                coach's CONFIRMED sessions (vs Disponibles, where the same dot means "available"). */}
            {shownMode === 'month' ? (
              <CalendarLegend items={[{ color: color.action, label: copy.week.legend }]} />
            ) : null}
            {/* Selected-date sessions — part of the SAME card, under a full-bleed divider (C09 / C10). */}
            <DaySessions date={selectedDate} onPressSession={() => setNextDetail(true)} />
          </LinearGradient>
        </View>

        {/* ===== Séances supplémentaires (DT-13 / DT-14) — open sessions to apply for, set apart from
             the confirmed schedule by a distinct title (not a box): flat rows on the canvas. The
             URGENT ones (start within 3 days) are surfaced as the top section with the same chip
             mechanic as the Disponibles tab (⏰ urgency + ✦ session type), so the coach can spot
             sessions to grab fast. Raise-hand applies; "Voir tout" opens the full list. ===== */}
        <View style={st.addlSection}>
          <View style={st.addlHead}>
            <View style={{ flex: 1 }}>
              <Text style={st.secTitle}>{copy.available.homeTitle}</Text>
            </View>
            <Pressable
              onPress={() => setSeeAllOpen(true)}
              hitSlop={6}
              style={({ pressed }) => [st.linkBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel={copy.available.link}
            >
              <Text style={st.linkTxt}>{copy.available.link}</Text>
              <ChevronRight size={16} color={S.textSecondary} />
            </Pressable>
          </View>

          {/* ⏰ Urgentes — the still-unfilled near-term openings, surfaced first (DT-14). */}
          {URGENT_AVAIL.length ? (
            <>
              <View style={st.urgHead}>
                <View style={st.urgIcon}><AlarmClock size={13} color={palette.rouge[600]} strokeWidth={2.5} /></View>
                <Text style={st.urgTitle}>{copy.availableScreen.list.cats.urgent}</Text>
                <Text style={st.urgCount}>{URGENT_AVAIL.length}</Text>
              </View>
              {URGENT_AVAIL.map((a, i) => renderOpenRow(a, i))}
            </>
          ) : null}

          {/* Plus tard — the rest of the upcoming openings (no urgency chip). */}
          {LATER_AVAIL.length ? (
            <>
              <Text style={st.laterHead}>{copy.available.homeLater}</Text>
              {LATER_AVAIL.map((a, i) => renderOpenRow(a, i))}
            </>
          ) : null}
        </View>
      </ScrollView>
      </Reveal>

      <NotificationCenter visible={notifOpen} onClose={() => setNotifOpen(false)} />
      {/* Profil is a tab now — the header avatar + level teaser navigate to it (no inline sheet). */}

      {/* Financial dashboard (C35) — opened from the "Earnings" button (no longer a tab). */}
      <RevenusScreen visible={revenusOpen} onClose={() => setRevenusOpen(false)} />

      {/* "See all" → today's open sessions; tapping a row inside it opens the same detail. */}
      <AvailableTodayModal visible={seeAllOpen} onClose={() => setSeeAllOpen(false)} items={AVAILABLE} applied={appliedAvail} onToggle={toggleAvail} />

      {/* Available-session detail (C11/C12) — opened from a preview card or its Apply button. */}
      <AvailableDetailModal item={availDetail} onClose={() => setAvailDetail(null)} />

      {/* Next-session detail (C16/C21) — opened by tapping the hero card or a day-session row; its
          "Check in" opens the same geolocated flow. The detail sheet must finish dismissing BEFORE
          the check-in sheet presents — two BottomSheet Modals can't be on screen at once on iOS, so
          opening it immediately would silently drop the check-in sheet. */}
      <NextSessionDetailModal
        visible={nextDetail}
        onClose={() => setNextDetail(false)}
        onCheckIn={() => { setNextDetail(false); setTimeout(() => setCheckInOpen(true), 260); }}
      />

      {/* C16 — the same geolocated check-in flow as Séances, from the Home hero next session. */}
      <CheckInModal
        visible={checkInOpen}
        session={{ place: copy.nextSession.place, time: copy.nextSession.start, addr: copy.nextSession.address }}
        onClose={() => setCheckInOpen(false)}
        onConfirmed={(wasLate) => { setCheckedIn(true); setLate(wasLate); }}
      />

      {/* Calendar view switch (Week / Month) — opened from the dropdown in the planning nav band. */}
      <OptionSheet
        visible={calMenuOpen}
        onClose={() => setCalMenuOpen(false)}
        title={copy.week.toggleA11y}
        closeA11y={copy.week.viewSheetCloseA11y}
        options={[
          { key: 'week', label: copy.week.seg.week },
          { key: 'month', label: copy.week.seg.month },
        ]}
        selectedKey={calMode}
        onSelect={(k) => changeCalMode(k as CalMode)}
      />
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */

const st = StyleSheet.create({
  eyebrow: {
    fontFamily: F.body, fontSize: 13,
    letterSpacing: 1, color: S.textSecondary,
  },
  // Section title — a pronounced version of the eyebrow: bigger, bold, and crème (not muted),
  // so each home section (Next session / This week / Available today / This month) reads as a
  // distinct heading rather than a quiet label. Small eyebrows stay for the date + in-card labels.
  secTitle: {
    fontFamily: F.oswR, fontSize: 16,
    letterSpacing: 0.9, color: S.textSecondary,
  },
  // Selected-date header under the calendar — a date readout, not a section divider, so it
  // reads as normal text: Inter, regular weight, normal case ("Tue · June 9").
  dayTitle: {
    fontFamily: F.body, fontSize: 14, color: S.textPrimary,
  },
  // Tighten the gap under the date title to the session info below (overrides secHead's margin
  // and the first row's top padding — this section only).
  dayHead: { marginBottom: sp.xs },
  daySessFirst: { paddingTop: sp.xs },

  /* The ink hero band itself is now the shared <InkHeader> (a fixed header outside the ScrollView);
     these styles are just its inner content. */
  // Top row: greeting (left, flex:1) aligned with bell + avatar (right). Center-aligned so the
  // avatar sits level with the greeting — on its line (one line) or its vertical centre (two lines).
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  heroTopRight: { flexDirection: 'row', alignItems: 'center', gap: sp.xs },
  // Greeting — Anton display caps (hero only). Big, white, tight leading like the moodboard.
  // Anton is a tall display face — the line box must be generously taller than the font size or the
  // caps clip top/bottom. 34px glyph in a 46px line box (incl. a little padding) keeps it uncropped
  // while staying the smaller size we picked. includeFontPadding:false trims Android's extra gap.
  heroGreet: { flex: 1, fontFamily: F.display, fontSize: 34, lineHeight: 46, letterSpacing: 0.5, color: S.ink.textPrimary, textTransform: 'uppercase', paddingTop: 2, includeFontPadding: false },
  // Motivational stats row — icon · number · label, two columns.
  /* header */
  appbar: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingTop: sp.sm, paddingBottom: sp.sm },
  greet: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: S.textPrimary },
  // Level + progress under the greeting (PLA-01) — "LEVEL 3" in gold (Oswald label, reads as reward
  // without a chip) beside a slim rouge→or meter, on the ink hero. Row padding + hitSlop keep the
  // tap target ≥44. Track is translucent-white so it reads on ink (the big-card neutral[200] track
  // was for the light canvas).
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: -4, minHeight: 32, paddingVertical: 4, alignSelf: 'flex-start' },
  levelTxt: { fontFamily: F.oswB, fontSize: 13, letterSpacing: 0.5, color: palette.or[300], textTransform: 'uppercase' },
  levelTrack: { width: 96, height: 6, borderRadius: r.pill, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  levelFill: { height: 6, borderRadius: r.pill },
  // No background — the bell sits directly on the canvas; keep 44×44 for the tap target.
  iconBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 999,
    backgroundColor: color.action, borderWidth: 2, borderColor: S.canvas,
  },
  avatarWrap: {},   // no glow — the avatar sits flat on the ink header
  avatar: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: F.oswB, fontSize: 17, color: color.onAction },


  /* sections */
  section: { marginTop: sp.xl },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  // "Mon planning" title with the done/total summary stacked on its OWN line beneath it (client:
  // caption under the title, not on the same line). marginBottom is the gap down to the calendar card.
  planningHead: { gap: sp.xs, marginBottom: sp.md },
  // The calendar (period nav + grid + legend) boxed as a flat bordered tile — sets it visually apart
  // from the bare selected-day session list below. White raised gradient fill + hairline edge.
  calCard: { borderRadius: r.lg, borderWidth: 1, borderColor: RAISED_BORDER, padding: sp.md },
  // Selected-day sessions block inside the calendar card — a full-bleed hairline rule sets it off
  // from the grid above; the negative margins bleed the rule to the card edges, the padding re-insets
  // the rows back to the grid's gutter.
  daySess: { marginTop: sp.md, marginHorizontal: -sp.md, paddingTop: sp.md, paddingHorizontal: sp.md, borderTopWidth: 1, borderTopColor: BORDER_INK },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 6 },
  linkTxt: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.2, color: S.textSecondary },
  // Trailing label on a section header (e.g. the current month in the calendar Month view).
  secRight: { fontFamily: F.bodyS, fontSize: 14, color: S.textSecondary },

  /* chips */
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  chipLight: { backgroundColor: color.progressSoft },
  chipTxt: { fontFamily: F.body, fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: 999 },

  /* hero card — Fresha "Upcoming" layout: a map on top, then a minimal info stack. The outer
     Pressable carries the rounded shadow; heroClip rounds + clips the map's top corners; heroBody
     is the ink fill under the map holding the text + actions. */
  // Next-session card — ink surface (DT-02), map on top, ink info body below. Ink reads as a key
  // moment against the cream canvas (no border needed — the ink/cream contrast defines the edge).
  heroCard: {
    backgroundColor: S.ink.bg, borderRadius: r.xl,
  },
  heroClip: { borderRadius: r.xl, overflow: 'hidden' },
  heroMap: { height: 150 }, // square corners — heroClip rounds the top; the body covers the bottom
  heroBody: { padding: sp.lg, backgroundColor: S.ink.bg },
  heroTitle: { fontFamily: F.bodyB, fontSize: 20, color: S.ink.textPrimary },
  // Compact when-line ("Today · 14:30 → 15:30") — replaces the old 50px Anton time block.
  heroWhen: { fontFamily: F.bodyS, fontSize: 16, color: S.ink.textPrimary, marginTop: 12 },
  heroMeta: { fontFamily: F.body, fontSize: 14, color: S.ink.textSecondary, marginTop: 2 },

  ctaRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.lg },
  secondaryBtn: {
    flex: 1, minHeight: 44, borderRadius: r.button, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  secondaryTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: S.textPrimary },
  // checked-in confirmation — replaces the CTA row on the hero once the coach is on site
  checkedInBadge: {
    flex: 1, minHeight: 44, borderRadius: r.button, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47,158,107,0.16)',
  },
  checkedInTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: palette.vert[500] },

  /* generic card on ink */
  /* month grid — 7-column calendar; one red dot marks days with sessions, today gold-on-ink */
  moHead: { flexDirection: 'row', marginBottom: sp.xs },
  moHeadTxt: {
    width: '14.2857%', textAlign: 'center', fontFamily: F.body, fontSize: 13, letterSpacing: 0.2, color: S.textSecondary,
  },
  moGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  moCellWrap: { width: '14.2857%', alignItems: 'center', paddingVertical: 2 },
  // Same language as the week strip: plain numbers, the selected day's number in a solid red
  // circle (white digit), today's number white. No per-cell box.
  moCell: { alignItems: 'center' },
  moNumWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  moNumSel: { backgroundColor: color.action }, // selected day → filled red circle
  moNumSelText: { color: color.onAction },     // white digit on the red circle
  moNum: { fontFamily: F.oswM, fontSize: 16, color: S.textPrimary },
  moDotRow: { flexDirection: 'row', gap: 3, marginTop: 4, minHeight: 5, alignItems: 'center' },

  /* calendar nav band (Blackbird date-strip pattern) — period label + a Week/Month view dropdown on
     the LEFT, both prev/next chevrons grouped on the RIGHT with no circle chrome. Bare chevrons +
     hitSlop:8 keep the tap target ≥44pt; the pager is pushed right with marginLeft:auto. */
  calNav: { flexDirection: 'row', alignItems: 'center', marginBottom: sp.sm },
  calNavBtns: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginLeft: 'auto' },
  calNavBtn: { padding: 4, alignItems: 'center', justifyContent: 'center' },
  // Title + a bare down-chevron form the view-switch tap target (no pill). flexShrink lets the
  // title truncate before it crowds the pager. Padded for a comfortable tap area + breathing room;
  // the negative left margin offsets the padding so the title stays flush with the section gutter.
  calTitleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, paddingVertical: 6, paddingHorizontal: 8, marginLeft: -8 },
  // Nudge the caret slightly to sit optically aligned with the title's baseline.
  calTitleChevron: { transform: [{ translateY: 1 }] },
  calNavLabel: { flexShrink: 1, textAlign: 'left', fontFamily: F.oswS, fontSize: 16, letterSpacing: 0.8, color: S.textPrimary },

  /* week strip — swipe left/right to page weeks */
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', gap: 2 },
  // Reference: weekday label above a plain number; the SELECTED day's number sits in a solid red
  // circle (white digit). No per-cell box; non-selected days are just text.
  day: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayMuted: { opacity: 0.4 }, // days outside June (paged weeks) — shown for context, not selectable
  dayD: { fontFamily: F.body, fontSize: 13, letterSpacing: 0.2, color: S.textSecondary },
  dayNumWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  dayNumSel: { backgroundColor: color.action }, // selected day → filled red circle
  dayN: { fontFamily: F.oswM, fontSize: 20, color: S.textPrimary },
  dayNSelText: { color: color.onAction }, // white digit on the red circle
  load: { flexDirection: 'row', marginTop: 6, minHeight: 16, alignItems: 'center', justifyContent: 'center' },
  // Week strip: per-day session count as a small red number circle (shared with the Available page).
  dayCountPill: {
    minWidth: 16, height: 16, borderRadius: 999, paddingHorizontal: 4,
    backgroundColor: 'rgba(225,50,43,0.16)', alignItems: 'center', justifyContent: 'center',
  },
  dayCountTxt: { fontFamily: F.bodyS, fontSize: 13, color: palette.rouge[700] }, // DT-20: AA on the red-tint pill
  // Month grid: a simple red dot marks days with sessions (count circle reserved for the week strip).
  loadDot: { width: 5, height: 5, borderRadius: 999, backgroundColor: color.action },
  muted: { fontFamily: F.body, fontSize: 14, color: S.textSecondary },
  // Apple-Fitness-style metric tiles (scheduled / done) — two cards side by side above the
  // calendar. Each is its own raised tile; the accent lives in a small icon chip (info-blue for
  // the plan, success-green for progress) so red stays the CTA/selected-day colour.
  tileRow: { flexDirection: 'row', gap: sp.sm },
  tile: { flex: 1, borderRadius: r.lg, padding: sp.md, gap: 2, borderWidth: 1, borderColor: RAISED_BORDER },
  // tinted rounded square, pinned to the top-right corner — same 36×36 chip as the Earnings card
  tileChip: { position: 'absolute', top: sp.md, right: sp.md, width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontFamily: F.body, fontSize: 13, color: S.textSecondary },
  // number + unit share a baseline so "4 sessions" reads as one line
  tileNumWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  tileNum: { fontFamily: F.display, fontSize: 30, color: S.textPrimary },
  tileUnit: { fontFamily: F.body, fontSize: 13, color: S.textSecondary },
  tileBase: { fontFamily: F.body, fontSize: 13, color: S.textSecondary },
  // Condensed calendar caption ("4 of 5 sessions · 7h 30m") — sits on its own line directly under
  // the "Mon planning" title (the planningHead gap owns the spacing down to the card).
  calSummary: { fontFamily: F.body, fontSize: 14, color: S.textSecondary },
  calSummaryStrong: { fontFamily: F.bodyS, fontSize: 14, color: palette.vert[700] },

  /* available rows */
  availRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  availDivider: { borderTopWidth: 1, borderTopColor: BORDER_INK },
  availWhen: { width: 52, alignItems: 'flex-start' },
  availDow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.4, color: S.textSecondary },
  availHr: { fontFamily: F.oswB, fontSize: 18, color: S.textPrimary },
  availNm: { fontFamily: F.bodyS, fontSize: 16, color: S.textPrimary },
  availDs: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 1 },
  dayEnd: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 1 }, // end time under the start time

  /* Available-section PREVIEW rows — kept identical to the "See all" sheet (AvailableTodayModal)
     so the Home preview and the full list read as one component. Separate from the calendar's
     avail* styles above on purpose, so this matching pass doesn't touch the day-list layout. */
  pvRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, paddingVertical: sp.md },
  pvWhen: { width: 44 },
  pvHr: { fontFamily: F.oswB, fontSize: 16, lineHeight: 20, color: S.textPrimary },
  pvNm: { fontFamily: F.oswS, fontSize: 16, lineHeight: 20, color: S.textPrimary },
  pvDs: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 1 },

  /* ghost button (≥44 touch target — non-negotiable). neutral-200 = a soft light inset that
     stays visible against the white cards / paper canvas it sits on. */
  ghostBtn: {
    minHeight: 32, paddingVertical: 6, paddingHorizontal: sp.sm + 4, borderRadius: r.button,
    backgroundColor: palette.neutral[200],
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
  },
  ghostTxt: { fontFamily: F.bodyS, fontSize: 14, letterSpacing: 0.2, color: S.textPrimary },

  /* "This month" earnings — minimal metric tiles (icon · title · figure) on the dark raised
     surface; colour is the accent only (tinted icon chip + accent-coloured figure: Earned green,
     Projected yellow). The outer Pressable holds the shadow; the tile clips its gradient. */
  // Bare earnings row — no boxed background (gradient/border/shadow removed); the two columns sit
  // directly on the canvas, like the Available rows. A little top breathing under the section title.
  earnFill: { flexDirection: 'row', alignItems: 'center', marginTop: sp.xs },
  /* Each half: icon · (title + figure). */
  metricCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  metricIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  metricText: { flex: 1 },
  metricTitle: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginBottom: 2 },
  metricValue: { fontFamily: F.bodyS, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  metricUnit: { fontFamily: F.bodyS, fontSize: 18 },
  // Sub-figure under each earnings number (e.g. "12 sessions confirmed" / "+6 upcoming").
  metricSub: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 2 },
  // Condensed earnings caption at the foot of the page — one compact line, a single green accent
  // on the realised figure (Earned); projected stays neutral so colour isn't overused.
  // Flat bordered container (no shadow) — signals tappable per the house style, lighter than a card.
  earnCardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  earnHeroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: sp.xs },
  // Quiet supporting subline under the hero figure (DoorDash idiom) — confirmed + upcoming context.
  earnSub: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 2 },
  // Earned hero figure in Anton — the brand display face now carries the big money totals (DS
  // decision 2026-06-18, item 6), shared with the Earnings hero (amountBig / forecast total) so the
  // two screens speak one hero voice. Supporting money (per-session, stats) stays Oswald. The €
  // stays Oswald — a quiet unit beside the loud figure. includeFontPadding:false + a generous line
  // box so the tall Anton glyphs aren't clipped and still baseline-align with the €.
  earnFig: { fontFamily: F.display, fontSize: 40, lineHeight: 48, letterSpacing: 0.5, color: ACCENT_GREEN, includeFontPadding: false },
  earnCur: { fontFamily: F.oswB, fontSize: 22, color: ACCENT_GREEN },
  // earned → expected meter (mirrors the Earnings hero) — neutral track on cream, brand-gradient fill.
  earnMeter: { height: 10, borderRadius: r.pill, backgroundColor: palette.neutral[200], overflow: 'hidden', marginTop: sp.sm },
  earnMeterFill: { height: '100%', borderRadius: r.pill },
  // On-bar endpoint labels under the meter (Monarch idiom) — the filled part = Gagné (left, quiet),
  // the full track = attendu total (right, strong). Reads as "what's earned of what's expected".
  earnLegend: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: sp.sm, gap: sp.sm },
  earnLegendLight: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, flexShrink: 1 },
  earnLegendStrong: { fontFamily: F.bodyS, fontSize: 14, color: S.textPrimary },

  /* hero — phase status line + disabled check-in (out-of-radius) */
  // Status line above the CTA row in the pre-window / out-of-radius states (icon + word — never
  // colour alone). Colour is carried inline per phase (info blue / pending amber).
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp.sm },
  statusLineTxt: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.2 },
  // Disabled check-in button (out-of-radius): a step lighter than the card, muted label — clearly
  // not the live red CTA.
  // Disabled check-in (pre-window / out-of-radius) — on the ink card: a faint white-alpha fill with
  // a muted-but-legible label, clearly not the live gradient CTA.
  disabledBtn: { minHeight: 44, borderRadius: r.button, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  disabledTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: palette.neutral[400] },

  /* Séances supplémentaires (DT-13) — the "additional sessions to apply for" block, set apart from
     the confirmed schedule by its distinct TITLE only (no box / border): flat rows on the canvas,
     same vocabulary as the old design and the calendar day-list. */
  addlSection: { marginTop: sp.xl },
  addlHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  // Rows are taller now (date line + chips), so the time rail + raise-hand top-align (DT-14).
  addlRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, paddingVertical: sp.md },
  addlRowBody: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: sp.md },
  // raise-hand / withdraw circle — same language as the Disponibles tab (red apply, outline withdraw).
  actionCircle: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  applyCircle: {
    backgroundColor: color.action,
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  withdrawCircle: { borderWidth: 1.5, borderColor: palette.neutral[600] },

  /* ⏰ Urgentes top section + Available-page chips (DT-14). Reds/blues are tuned for AA on the LIGHT
     canvas (a step darker than the Disponibles ink-card tints) so the small 12px chip text stays
     legible — same meaning (red = urgent, blue = session type, green = applied), just contrast-safe. */
  urgHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  urgIcon: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(225,50,43,0.10)' },
  urgTitle: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: palette.rouge[600] },
  urgCount: { fontFamily: F.bodyB, fontSize: 13, color: S.textSecondary },
  // Quiet sub-header for the non-urgent upcoming openings — muted, no red, clearly secondary to ⏰ Urgentes.
  laterHead: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: S.textSecondary, marginTop: sp.lg, marginBottom: 2 },
  // date line above the place name (Available-page card)
  urgWhen: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginBottom: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: sp.sm, marginTop: 8 },
  urgencyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, backgroundColor: 'rgba(225,50,43,0.10)' },
  urgencyTxt: { fontFamily: F.bodyS, fontSize: 13, color: palette.rouge[600] },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, backgroundColor: palette.bleu[50] },
  typeTagTxt: { fontFamily: F.body, fontSize: 13, color: color.info },
  appliedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, backgroundColor: palette.vert[50] },
  appliedTagTxt: { fontFamily: F.bodyS, fontSize: 13, color: palette.vert[600] },
});
