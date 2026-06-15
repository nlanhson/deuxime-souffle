/**
 * Coach · Accueil ("Hi, Karim") — the Home tab.
 * Ported from project/coach-app (v0.1 vertical slice) into the native-tab app.
 * Its own hand-drawn bottom bar was dropped — the native RootTabs provides the tab bar now.
 *
 * Surface = coach (ink canvas, red the engine). MVP scope only (no gamification).
 * UI text comes from ../copy (the localization seam — English for review, French to ship).
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Easing, AccessibilityInfo, LayoutChangeEvent, PanResponder, GestureResponderHandlers } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Bell, MapPin, CalendarDays, Check, CheckCircle2, Clock } from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces, motion, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { NotificationCenter } from '../components/NotificationCenter';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { COACH_PHOTO } from '../lib/coachProfile';
import { AvailableDetailModal } from '../components/AvailableDetailModal';
import { AvailableTodayModal } from '../components/AvailableTodayModal';
import { NextSessionDetailModal } from '../components/NextSessionDetailModal';
import { SessionMap } from '../components/SessionMap';
import { CheckInModal } from '../components/CheckInModal';
import { Segmented } from '../components/segmented';
import { ProfileScreen } from './ProfileScreen';
import { RevenusScreen } from './RevenusScreen';
import { BadgesScreen, CURRENT_LEVEL, LEVEL_PROGRESS } from './BadgesScreen';
import { useTabBarInset } from '../navigation/tabBarInsets';
import { openDirections } from '../lib/openDirections';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { AccueilSkeleton } from './skeletons';

const S = surfaces.coach;                     // canvas / surface / surfaceRaised / text / accent
const BORDER_INK = palette.neutral[700];      // dividers on ink
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

/* Raised-surface effect, shared by the summary tiles (Scheduled / Done) and the next-session hero:
   a slight top-lit vertical gradient centred on the surface (neutral[800] #2B2B2B) + a very dim
   hairline edge, so the card reads as raised glass. */
const RAISED_BORDER = 'rgba(255,255,255,0.07)';       // very dim top-lit hairline

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

// Mock schedule — ONE source of truth, keyed by June day-of-month (both calendar views are
// June 2026). Real code queries the schedule by date + locale. The load dots, the done/scheduled
// totals, AND the under-calendar detail all read from this, so a day's dot count always matches
// what tapping it reveals, and "done" always means "already happened".
const TODAY = 9; // June 9 — the today marker AND the past/future boundary (due vs upcoming)

// Hero next-session timing (LIVE). The card's check-in state + countdown derive from a mock "now"
// anchored to the session day and ticked from the real-time delta — so the hero behaves like a
// real app (pre-window → check-in open → checked in) instead of a single static state, the way
// Jobber / Square Go do. Times mirror copy.nextSession.start/end (14:30 → 15:30).
const SESSION_START = new Date(2026, 5, TODAY, 14, 30);
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
const isDue = (n: number) => n < TODAY; // past sessions already happened → "due", shown grayed
// "Mon · June 8" label — June 1 2026 is a Monday, so weekday index = (n-1) mod 7 (Mon-first).
const WEEKDAY_ABBR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const dayLabel = (n: number) => `${WEEKDAY_ABBR[(n - 1) % 7]} · ${n} juin`;
const dayA11y = (n: number, load: number) =>
  `${dayLabel(n)}, ${load === 0 ? copy.week.daySection.a11yNone : `${load} ${copy.week.daySection.a11ySessions}`}` +
  (load > 0 && isDue(n) ? `, ${copy.week.daySection.due}` : '');

// Week strip is date-driven so it can page to any week. June 8 2026 is the Monday of "this
// week" (offset 0); offset ±1 = next/previous week. Days outside June have no mock sessions
// (the map is June-only) and render muted + non-selectable. Month grid stays June.
const MONTHS_ABBR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MONTHS_FULL = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const weekMonday = (offset: number) => new Date(2026, 5, 8 + offset * 7);
const TODAY_DATE = new Date(2026, 5, TODAY);
const parseMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

type WeekDay = { wd: string; dom: number; isJune: boolean; today: boolean; load: number; empty: boolean; key: string };
function weekEyebrow(offset: number) {
  if (offset === 0) return copy.week.eyebrow;
  if (offset === -1) return copy.week.lastWeek;
  if (offset === 1) return copy.week.nextWeek;
  const mon = weekMonday(offset);
  return `${copy.week.weekOf} ${MONTHS_ABBR[mon.getMonth()]} ${mon.getDate()}`;
}
// Everything the week view shows for a given offset: the 7 days + the summary numbers, all from
// the one session map + the today boundary (done = sessions already past, hours = summed durations).
function weekData(offset: number) {
  const mon = weekMonday(offset);
  let done = 0, total = 0, mins = 0;
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
    const isJune = date.getFullYear() === 2026 && date.getMonth() === 5;
    const dom = date.getDate();
    const list = isJune ? SESSIONS_BY_DAY[dom] ?? [] : [];
    total += list.length;
    if (date < TODAY_DATE) done += list.length;
    for (const s of list) mins += parseMin(s.end) - parseMin(s.time);
    return { wd: WEEKDAY_ABBR[i], dom, isJune, today: isJune && dom === TODAY, load: list.length, empty: i >= 5, key: `${date.getMonth()}-${dom}` };
  });
  const h = Math.floor(mins / 60), m = mins % 60;
  return { days, total, done, pct: total ? Math.round((done / total) * 100) : 0, hours: m ? `${h}h ${m}m` : `${h}h`, eyebrow: weekEyebrow(offset) };
}

// Month grid is date-driven so it can page to any month (offset 0 = June 2026, ± = prev/next).
// Only June carries mock sessions; other months render as empty, muted, non-selectable grids
// (same honesty as the week strip's out-of-June days). Real code queries sessions by month.
type MonthDay = { n: number; load: number; today: boolean; isData: boolean };
function monthData(offset: number) {
  const base = new Date(2026, 5 + offset, 1);
  const year = base.getFullYear(), mIdx = base.getMonth();
  const isData = year === 2026 && mIdx === 5;          // June 2026 holds the mock sessions
  const daysIn = new Date(year, mIdx + 1, 0).getDate();
  const lead = (base.getDay() + 6) % 7;                 // Mon-first leading blanks before day 1
  let done = 0, total = 0, mins = 0;
  const days: MonthDay[] = Array.from({ length: daysIn }, (_, i) => {
    const n = i + 1;
    const list = isData ? SESSIONS_BY_DAY[n] ?? [] : [];
    total += list.length;
    if (isData && n < TODAY) done += list.length;       // done-so-far = sessions already past
    for (const s of list) mins += parseMin(s.end) - parseMin(s.time);
    return { n, load: list.length, today: isData && n === TODAY, isData };
  });
  const h = Math.floor(mins / 60), m = mins % 60;
  return {
    days, lead, isData,
    total, done, pct: total ? Math.round((done / total) * 100) : 0,
    hours: m ? `${h}h ${m}m` : `${h}h`,
    name: MONTHS_FULL[mIdx], // month name for the toggle label (e.g. "June" → "July" on swipe)
    label: `${MONTHS_FULL[mIdx]} ${year}`, // "{Month} {Year}" — paging-aware label for the nav band
  };
}

// Today's open sessions (mock). The Home card previews the first two; "See all" lists them all.
// `pay` = the session fee (mock; real code formats it from rate × duration). Surfaced on the row
// so coaches can triage open sessions by pay at a glance — the Grab Driver "Booking Planner" pattern.
const AVAILABLE = [
  { dow: 'Aujourd’hui', hr: '10:00', nm: 'Résidence du Parc', ds: 'Villeurbanne · 3.1 km · 1h', pay: '45 €',
    date: 'Aujourd’hui · Mar 9 juin', end: '11:00', dur: '1h', addr: '8 rue des Tilleuls, Villeurbanne · 3.1 km' },
  { dow: 'Aujourd’hui', hr: '13:30', nm: 'Résidence Les Cèdres', ds: 'Lyon 7e · 4.8 km · 1h', pay: '45 €',
    date: 'Aujourd’hui · Mar 9 juin', end: '14:30', dur: '1h', addr: '23 avenue du Parc, Lyon 7e · 4.8 km' },
  { dow: 'Aujourd’hui', hr: '16:00', nm: 'Résidence Les Érables', ds: 'Lyon 6e · 1.9 km · 1h', pay: '50 €',
    date: 'Aujourd’hui · Mar 9 juin', end: '17:00', dur: '1h', addr: '5 rue Bellecour, Lyon 6e · 1.9 km' },
  { dow: 'Aujourd’hui', hr: '17:30', nm: 'Résidence des Berges', ds: 'Lyon 7e · 4.1 km · 1h', pay: '45 €',
    date: 'Aujourd’hui · Mar 9 juin', end: '18:30', dur: '1h', addr: '40 quai Rambaud, Lyon 7e · 4.1 km' },
];
type AvailItem = (typeof AVAILABLE)[number];

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
function CalSummary({ done, total, hours, valueOpacity }: { done: number; total: number; pct: number; hours: string; valueOpacity?: Animated.Value }) {
  const t = copy.week.tiles;
  return (
    <Animated.Text
      style={[st.calSummary, valueOpacity != null && { opacity: valueOpacity }]}
      accessibilityLabel={`${done} ${copy.week.ofLabel} ${total} ${t.unit} ${t.done.toLowerCase()}, ${hours}`}
    >
      <Text style={st.calSummaryStrong}>{done}</Text>
      {` ${copy.week.ofLabel} ${total} ${t.unit} · ${hours}`}
    </Animated.Text>
  );
}

function WeekView({ days, selected, onSelect, fade, x, pan }: {
  days: WeekDay[];
  selected: number;
  onSelect: (n: number) => void;
  fade: Animated.Value;
  x: Animated.Value;
  pan: GestureResponderHandlers;
}) {
  return (
    // The strip is swipeable to page weeks: pan handlers capture only clear horizontal drags, so
    // day taps and vertical scroll pass through.
    <Animated.View style={{ opacity: fade, transform: [{ translateX: x }] }} {...pan}>
      <View style={st.weekStrip}>
        {days.map((day) => {
          const on = day.isJune && day.dom === selected;
          return (
            <Pressable
              key={day.key}
              style={[st.day, !day.isJune && st.dayMuted]}
              onPress={day.isJune ? () => onSelect(day.dom) : undefined}
              disabled={!day.isJune}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: !day.isJune }}
              accessibilityLabel={day.isJune ? dayA11y(day.dom, day.load) : undefined}
            >
              <Text style={st.dayD}>{day.wd}</Text>
              <View style={[st.dayNumWrap, on && st.dayNumSel]}>
                <Text style={[st.dayN, on && st.dayNSelText, day.empty && !on && { color: S.textSecondary }, day.today && { color: palette.neutral[0] }]}>{day.dom}</Text>
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
  selected: number;
  onSelect: (n: number) => void;
  fade: Animated.Value;
  x: Animated.Value;
  pan: GestureResponderHandlers;
}) {
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
            const on = day.isData && day.n === selected;
            return (
              <Pressable
                key={day.n}
                style={[st.moCellWrap, !day.isData && st.dayMuted]}
                hitSlop={4}
                onPress={day.isData ? () => onSelect(day.n) : undefined}
                disabled={!day.isData}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled: !day.isData }}
                accessibilityLabel={day.isData ? dayA11y(day.n, day.load) : undefined}
              >
                <View style={st.moCell}>
                  <View style={[st.moNumWrap, on && st.moNumSel]}>
                    <Text style={[st.moNum, on && st.moNumSelText, !day.load && !day.today && !on && { color: S.textSecondary }, day.today && { color: palette.neutral[0] }]}>{day.n}</Text>
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
function CalNav({ label, onPrev, onNext, labelFade, prevA11y, nextA11y }: {
  label: string; onPrev: () => void; onNext: () => void;
  labelFade: Animated.Value; prevA11y: string; nextA11y: string;
}) {
  return (
    <View style={st.calNav}>
      <Pressable onPress={onPrev} hitSlop={6} style={({ pressed }) => [st.calNavBtn, pressed && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={prevA11y}>
        <ChevronLeft size={20} color={S.textPrimary} />
      </Pressable>
      <Animated.Text style={[st.calNavLabel, { opacity: labelFade }]} numberOfLines={1}>{label}</Animated.Text>
      <Pressable onPress={onNext} hitSlop={6} style={({ pressed }) => [st.calNavBtn, pressed && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={nextA11y}>
        <ChevronRight size={20} color={S.textPrimary} />
      </Pressable>
    </View>
  );
}

// Under-calendar detail — the sessions on the tapped date. Past ("due") sessions read muted; the
// chip states the status in words so it never leans on color/graying alone.
function DaySessions({ date, onPressSession }: { date: number; onPressSession?: () => void }) {
  const sessions = SESSIONS_BY_DAY[date] ?? [];
  const due = isDue(date);
  return (
    // A comfortable gap below the calendar (matches the Available screen) — enough to separate the
    // selected-day detail from the grid, but less than a full section break (it's still the
    // calendar's detail, not a new section).
    <View style={[st.section, { marginTop: sp.lg }]}>
      {/* Date header + status tag removed per request — the selected day's sessions sit bare
          on the canvas (the day context comes from the calendar grid above). */}
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
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [badgesOpen, setBadgesOpen] = React.useState(false);    // PLA-01 coach badge → Badges & level
  const [availDetail, setAvailDetail] = React.useState<AvailItem | null>(null);
  const [nextDetail, setNextDetail] = React.useState(false);
  const [checkInOpen, setCheckInOpen] = React.useState(false);   // C16 check-in flow (hero next session)
  const [checkedIn, setCheckedIn] = React.useState(false);       // flips the hero CTA once on site
  const [late, setLate] = React.useState(false);                 // C18 — checked in after the on-time window
  const [seeAllOpen, setSeeAllOpen] = React.useState(false);
  const [revenusOpen, setRevenusOpen] = React.useState(false);
  const [calMode, setCalMode] = React.useState<CalMode>('week');   // drives the toggle — updates instantly on press
  const [shownMode, setShownMode] = React.useState<CalMode>('week'); // drives the content — lags one fade behind
  const [selectedDate, setSelectedDate] = React.useState<number>(TODAY); // tapped calendar day (June day-of-month)
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
  const wk = weekData(weekOffset);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: S.canvas }} edges={['top', 'left', 'right']}>
      <Reveal loading={loading} skeleton={<AccueilSkeleton />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp.xl + tabBarInset }}
      >
        {/* ===== App header — name + level/progress left, notifications + profile right ===== */}
        <View style={st.appbar}>
          <View style={{ flex: 1 }}>
            <Text style={st.greet} numberOfLines={1}>{copy.header.greeting}</Text>
            {/* Level + progress to next (PLA-01) — sits under the name as plain "Lv3" + a meter
                (no badge/chip), opening Badges & level. The rouge→or meter matches the Badges
                screen's level bar (the theme reserves that gradient for medals / progress). */}
            <Pressable
              style={({ pressed }) => [st.levelRow, pressed && { opacity: 0.6 }]}
              hitSlop={8}
              onPress={() => setBadgesOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={copy.header.levelA11y}
            >
              <Text style={st.levelTxt}>{`${copy.header.levelPrefix}${CURRENT_LEVEL}`}</Text>
              <View style={st.levelTrack}>
                <LinearGradient
                  colors={MOVEMENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[st.levelFill, { width: `${Math.round(LEVEL_PROGRESS * 100)}%` }]}
                />
              </View>
            </Pressable>
          </View>
          <Pressable style={st.iconBtn} hitSlop={6} onPress={() => setNotifOpen(true)} accessibilityLabel={copy.header.notificationsA11y}>
            <Bell size={22} color={S.textPrimary} fill={S.textPrimary} />
            <View style={st.badgeDot} />
          </Pressable>
          <Pressable style={st.avatarWrap} hitSlop={6} onPress={() => setProfileOpen(true)} accessibilityLabel={copy.header.profileA11y}>
            <ProfileAvatar size={42} uri={COACH_PHOTO} />
          </Pressable>
        </View>

        {/* Report-due and availability nudges intentionally NOT on Home: per the WBS both
            surface through the notification center (the bell) — report alerts are anomaly-only,
            availability reminders live in the coach inbox. Kept off Home to stick to scope. */}

        {/* ===== This month earnings (C35) — kept at the top, condensed to a single quiet line. No
            box/border (per design direction): it reads as a plain section header + figures, tappable
            via the chevron + press feedback, flush with the other sections. ===== */}
        <View style={st.section}>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            onPress={() => setRevenusOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`${copy.earnings.eyebrow}. ${copy.earnings.earned}, 840 €. ${copy.earnings.projected}, 1,260 €`}
          >
            <View style={st.earnCardHead}>
              <Text style={st.secTitle}>{copy.earnings.eyebrow}</Text>
              <ChevronRight size={16} color={S.textSecondary} />
            </View>
            <View style={st.earnRowVals}>
              <Text style={st.earnFigEarned}>840 €</Text>
              <Text style={st.earnWord}>{copy.earnings.earned}</Text>
              <Text style={st.earnSep}>·</Text>
              <Text style={st.earnFigProj}>1,260 €</Text>
              <Text style={st.earnWord}>{copy.earnings.projected}</Text>
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
              <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={st.heroBody}>
                <Text style={st.heroTitle} numberOfLines={1}>{copy.nextSession.place}</Text>
                <Text style={st.heroWhen}>{`${copy.nextSession.whenPrefix} · ${copy.nextSession.start} → ${copy.nextSession.end}`}</Text>
                <Text style={st.heroMeta} numberOfLines={1}>{`${copy.nextSession.duration} · ${copy.nextSession.unit}`}</Text>

              {/* Phase-aware footer (mirrors the CheckInModal's own time + location states):
                  pre-window  → "Check-in opens at …" + Directions only
                  out-of-radius → "Move closer" hint + Directions + a disabled Check-in
                  on site     → Directions + the red Check-in CTA
                  checked in  → confirmation badge (with the late variant). */}
              {checkedIn ? (
                <View style={st.ctaRow}>
                  <View style={st.checkedInBadge}>
                    <CheckCircle2 size={16} color={palette.vert[500]} style={{ marginRight: 6 }} />
                    <Text style={st.checkedInTxt}>{late ? copy.nextSession.checkedInLate : copy.sessions.status.checkedIn}</Text>
                  </View>
                </View>
              ) : checkInPhase === 'tooEarly' ? (
                <>
                  <View style={st.statusLine}>
                    <Clock size={14} color={INK.info} />
                    <Text style={[st.statusLineTxt, { color: INK.info }]}>{copy.nextSession.opensLine}</Text>
                  </View>
                  <View style={st.ctaRow}>
                    <Pressable
                      style={st.secondaryBtn}
                      onPress={() => openDirections(copy.nextSession.address)}
                      accessibilityRole="button"
                      accessibilityLabel={copy.nextSession.directions}
                    >
                      <Text style={st.secondaryTxt}>{copy.nextSession.directions}</Text>
                    </Pressable>
                  </View>
                </>
              ) : checkInPhase === 'away' ? (
                <>
                  <View style={st.statusLine}>
                    <MapPin size={14} color={INK.pending} />
                    <Text style={[st.statusLineTxt, { color: INK.pending }]}>{copy.nextSession.awayLine}</Text>
                  </View>
                  <View style={st.ctaRow}>
                    <Pressable
                      style={st.secondaryBtn}
                      onPress={() => openDirections(copy.nextSession.address)}
                      accessibilityRole="button"
                      accessibilityLabel={copy.nextSession.directions}
                    >
                      <Text style={st.secondaryTxt}>{copy.nextSession.directions}</Text>
                    </Pressable>
                    <View style={[st.disabledBtn, { flex: 1 }]} accessibilityRole="button" accessibilityState={{ disabled: true }}>
                      <Text style={st.disabledTxt}>{copy.nextSession.checkInCta}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={st.ctaRow}>
                  <Pressable
                    style={st.secondaryBtn}
                    onPress={() => openDirections(copy.nextSession.address)}
                    accessibilityRole="button"
                    accessibilityLabel={copy.nextSession.directions}
                  >
                    <Text style={st.secondaryTxt}>{copy.nextSession.directions}</Text>
                  </Pressable>
                  <PrimaryButton compact label={copy.nextSession.checkInCta} onPress={() => setCheckInOpen(true)} style={{ flex: 1 }} />
                </View>
              )}
              </LinearGradient>
            </View>
          </Pressable>
        </View>

        {/* ===== Available sessions (C11 / C12) ===== */}
        <View style={st.section}>
          {/* "See all" wording dropped — just the chevron remains (whole row taps through). */}
          <SectionHeader title={copy.available.eyebrow} onLink={() => setSeeAllOpen(true)} />
          {/* Flat rows on the canvas (no card) — same vocabulary as the calendar day-list: the
              start time with the end time under it, place + address. The whole row is the button
              (opens the detail, where the Apply / Raise-hand CTA lives). */}
          {AVAILABLE.slice(0, 2).map((a, i) => (
            <Pressable
              key={a.nm}
              style={({ pressed }) => [st.availRow, i === 0 && { paddingTop: 0 }, i > 0 && st.availDivider, pressed && { opacity: 0.7 }]}
              onPress={() => setAvailDetail(a)}
              accessibilityRole="button"
              accessibilityLabel={`${a.nm}, ${a.dow} ${a.hr} to ${a.end}, ${a.ds}`}
            >
              <View style={st.availWhen}>
                <Text style={st.availHr}>{a.hr}</Text>
                <Text style={st.dayEnd}>{a.end}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.availNm} numberOfLines={1}>{a.nm}</Text>
                <Text style={st.availDs} numberOfLines={1}>{a.ds}</Text>
              </View>
              {/* Session fee, trailing — lets coaches triage open sessions by pay (Grab Driver). */}
              <Text style={st.availPay}>{a.pay}</Text>
            </Pressable>
          ))}
        </View>

        {/* ===== Calendar — Week / Month (C09 / C10) ===== */}
        <View style={st.section}>
          {/* The period label lives in the nav band below (between the toggle and the grid), not
              in a section header — matching the Available screen's calendar. */}
          {/* Tiles stay put on a Week/Month switch — only the figures inside crossfade (titleFade;
              the value swaps at the fade's midpoint, masked). */}
          <CalSummary
            done={shownMode === 'week' ? wk.done : mo.done}
            total={shownMode === 'week' ? wk.total : mo.total}
            pct={shownMode === 'week' ? wk.pct : mo.pct}
            hours={shownMode === 'week' ? wk.hours : mo.hours}
            valueOpacity={titleFade}
          />
          <Segmented
            value={calMode}
            onChange={(m) => {
              setCalMode(m);
              if (m === 'week') {
                setWeekOffset(0); // entering Week → back to this week
                setMonthOffset(0); // keep the Month tab showing the current month while in Week view
                // keep the highlight on a visible cell (this week = June 8–14)
                if (selectedDate < 8 || selectedDate > 14) setSelectedDate(TODAY);
              } else {
                setMonthOffset(0); // entering Month → back to the current month
              }
            }}
            options={[
              { value: 'week', label: copy.week.seg.week },
              { value: 'month', label: mo.name }, // tracks the swiped month
            ]}
            accessibilityLabel={copy.week.toggleA11y}
            variant="underline"
            stretch
            theme={{ label: S.textSecondary, selectedLabel: color.action }}
            style={{ marginTop: sp.md, marginBottom: sp.md }}
          />
          {/* period nav — prev/next chevrons + the centred week-range / month label. Crossfades on
              the Week/Month switch via titleFade (like the tiles); the label itself crossfades on
              paging via weekFade / monthFade inside CalNav. Sits OUTSIDE the height-animated grid
              wrapper so it never perturbs the gridH tween. */}
          <Animated.View style={{ opacity: titleFade }}>
            {shownMode === 'week' ? (
              <CalNav
                label={wk.eyebrow}
                onPrev={() => goWeek(-1)}
                onNext={() => goWeek(1)}
                labelFade={weekFade}
                prevA11y={copy.week.prevWeekA11y}
                nextA11y={copy.week.nextWeekA11y}
              />
            ) : (
              <CalNav
                label={mo.label}
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
                ? <WeekView days={wk.days} selected={selectedDate} onSelect={setSelectedDate} fade={weekFade} x={weekX} pan={weekPan.panHandlers} />
                : <MonthView days={mo.days} lead={mo.lead} selected={selectedDate} onSelect={setSelectedDate} fade={monthFade} x={monthX} pan={monthPan.panHandlers} />}
            </Animated.View>
          </Animated.View>
        </View>

        {/* ===== Selected-date sessions — sits directly under the calendar (C09 / C10) ===== */}
        <DaySessions date={selectedDate} onPressSession={() => setNextDetail(true)} />
      </ScrollView>
      </Reveal>

      <NotificationCenter visible={notifOpen} onClose={() => setNotifOpen(false)} />
      <ProfileScreen visible={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Coach badge / level (PLA-01) — opened from the header level chip. */}
      <BadgesScreen visible={badgesOpen} onClose={() => setBadgesOpen(false)} />

      {/* Financial dashboard (C35) — opened from the "Earnings" button (no longer a tab). */}
      <RevenusScreen visible={revenusOpen} onClose={() => setRevenusOpen(false)} />

      {/* "See all" → today's open sessions; tapping a row inside it opens the same detail. */}
      <AvailableTodayModal visible={seeAllOpen} onClose={() => setSeeAllOpen(false)} items={AVAILABLE} />

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

  /* header */
  appbar: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingTop: sp.sm, paddingBottom: sp.sm },
  greet: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: S.textPrimary },
  // Level + progress under the name (PLA-01) — plain "Lv3" in gold (reads as reward without a
  // chip/badge) beside a slim rouge→or meter. Row padding + hitSlop keep the tap target ≥44.
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: 0, minHeight: 32, paddingVertical: 4, alignSelf: 'flex-start' },
  levelTxt: { fontFamily: F.bodyS, fontSize: 13, color: palette.or[300] },
  levelTrack: { width: 96, height: 6, borderRadius: r.pill, backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden' },
  levelFill: { height: 6, borderRadius: r.pill },
  // No background — the bell sits directly on the canvas; keep 44×44 for the tap target.
  iconBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 999,
    backgroundColor: color.action, borderWidth: 2, borderColor: S.canvas,
  },
  avatarWrap: {
    shadowColor: palette.bleu[300], shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: F.oswB, fontSize: 17, color: color.onAction },


  /* sections */
  section: { marginTop: sp['2xl'] },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
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
  chipTxt: { fontFamily: F.body, fontSize: 12 },
  dot: { width: 8, height: 8, borderRadius: 999 },

  /* hero card — Fresha "Upcoming" layout: a map on top, then a minimal info stack. The outer
     Pressable carries the rounded shadow; heroClip rounds + clips the map's top corners; heroBody
     is the ink fill under the map holding the text + actions. */
  heroCard: {
    backgroundColor: S.surface, borderRadius: r.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20,
  },
  heroClip: { borderRadius: r.xl, overflow: 'hidden', borderWidth: 1, borderColor: RAISED_BORDER },
  heroMap: { height: 150 }, // square corners — heroClip rounds the top; the body covers the bottom
  heroBody: { padding: sp.lg },
  heroTitle: { fontFamily: F.bodyB, fontSize: 20, color: S.textPrimary },
  // Compact when-line ("Today · 14:30 → 15:30") — replaces the old 50px Anton time block.
  heroWhen: { fontFamily: F.bodyS, fontSize: 15, color: S.textPrimary, marginTop: 12 },
  heroMeta: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 2 },

  ctaRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.lg },
  secondaryBtn: {
    flex: 1, minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  secondaryTxt: { fontFamily: F.bodyS, fontSize: 15, letterSpacing: 0.2, color: S.textPrimary },
  // checked-in confirmation — replaces the CTA row on the hero once the coach is on site
  checkedInBadge: {
    flex: 1, minHeight: 44, borderRadius: r.pill, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47,158,107,0.16)',
  },
  checkedInTxt: { fontFamily: F.bodyS, fontSize: 15, letterSpacing: 0.2, color: palette.vert[500] },

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
  moNum: { fontFamily: F.oswM, fontSize: 15, color: S.textPrimary },
  moDotRow: { flexDirection: 'row', gap: 3, marginTop: 4, minHeight: 5, alignItems: 'center' },

  /* calendar nav band — prev/next chevrons flanking the centred period label (matches the
     Available screen's calNav). Buttons are 40×40 + hitSlop, so the tap target clears 44pt. */
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  calNavBtn: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[800], borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  calNavLabel: { flex: 1, textAlign: 'center', fontFamily: F.oswS, fontSize: 14, letterSpacing: 0.8, color: S.textPrimary },

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
  dayCountTxt: { fontFamily: F.bodyS, fontSize: 11, color: palette.rouge[300] },
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
  tileBase: { fontFamily: F.body, fontSize: 12, color: S.textSecondary },
  // Condensed calendar caption ("4 of 5 sessions · 7h 30m") — replaces the two big-number tiles.
  calSummary: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginBottom: sp.xs },
  calSummaryStrong: { fontFamily: F.bodyS, fontSize: 14, color: palette.vert[500] },

  /* available rows */
  availRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  availDivider: { borderTopWidth: 1, borderTopColor: BORDER_INK },
  availWhen: { width: 52, alignItems: 'flex-start' },
  availDow: { fontFamily: F.oswS, fontSize: 11, letterSpacing: 0.4, color: S.textSecondary },
  availHr: { fontFamily: F.oswB, fontSize: 18, color: S.textPrimary },
  availNm: { fontFamily: F.bodyS, fontSize: 16, color: S.textPrimary },
  availDs: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 1 },
  dayEnd: { fontFamily: F.body, fontSize: 12, color: S.textSecondary, marginTop: 1 }, // end time under the start time

  /* Available-section PREVIEW rows — kept identical to the "See all" sheet (AvailableTodayModal)
     so the Home preview and the full list read as one component. Separate from the calendar's
     avail* styles above on purpose, so this matching pass doesn't touch the day-list layout. */
  pvRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, paddingVertical: sp.md },
  pvWhen: { width: 44 },
  pvHr: { fontFamily: F.oswB, fontSize: 16, lineHeight: 20, color: S.textPrimary },
  pvNm: { fontFamily: F.oswS, fontSize: 16, lineHeight: 20, color: S.textPrimary },
  pvDs: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 1 },

  /* ghost button (≥44 touch target — non-negotiable). neutral-700 = one step lighter than
     the neutral-800 cards it sits in, so it stays visible on both cards and the banner. */
  ghostBtn: {
    minHeight: 32, paddingVertical: 6, paddingHorizontal: sp.sm + 4, borderRadius: r.pill,
    backgroundColor: palette.neutral[700],
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
  metricSub: { fontFamily: F.body, fontSize: 12, color: S.textSecondary, marginTop: 2 },
  // Condensed earnings caption at the foot of the page — one compact line, a single green accent
  // on the realised figure (Earned); projected stays neutral so colour isn't overused.
  // Flat bordered container (no shadow) — signals tappable per the house style, lighter than a card.
  earnCardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  earnRowVals: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6, marginTop: sp.xs },
  earnFigEarned: { fontFamily: F.bodyS, fontSize: 18, color: palette.vert[500] },
  earnFigProj: { fontFamily: F.bodyS, fontSize: 18, color: S.textPrimary },
  earnWord: { fontFamily: F.body, fontSize: 13, color: S.textSecondary },
  earnSep: { fontFamily: F.body, fontSize: 13, color: S.textSecondary },

  /* hero — phase status line + disabled check-in (out-of-radius) */
  // Status line above the CTA row in the pre-window / out-of-radius states (icon + word — never
  // colour alone). Colour is carried inline per phase (info blue / pending amber).
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp.sm },
  statusLineTxt: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.2 },
  // Disabled check-in button (out-of-radius): a step lighter than the card, muted label — clearly
  // not the live red CTA.
  disabledBtn: { minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.neutral[700] },
  disabledTxt: { fontFamily: F.bodyS, fontSize: 15, letterSpacing: 0.2, color: palette.neutral[400] },
  // Session fee, trailing on the available-row (green = money, matching the Earned figure).
  availPay: { fontFamily: F.oswS, fontSize: 16, color: palette.vert[500] },
});
