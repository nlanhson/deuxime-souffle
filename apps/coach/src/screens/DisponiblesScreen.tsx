/**
 * Coach · Disponibles ("Available") — the Available Sessions tab.
 *
 * Scope = WBS E02 "Available Sessions" + E03 Smart Assignment, coach side:
 * the coach browses OPEN sessions (future, not-yet-assigned) and **raises a hand** to
 * apply, or **withdraws** before the assignment is made (stories C11/C12).
 *
 * CALENDAR-LED: this screen reuses the Home calendar section (Week / Month toggle, metric
 * tiles, swipeable week strip, month grid, animated transitions) — wired to the OPEN sessions
 * instead of the coach's booked schedule. The two tiles are adapted to this screen: Open =
 * open sessions in the period, Applied = the ones the coach has raised a hand for. Tapping a
 * day lists that day's open sessions, each with the circular Raise-hand / Withdraw action and
 * a tap-through to the detail page. Matching is never first-come-first-served (the algorithm
 * ranks; DS assigns ONE coach), so there is deliberately no candidate / "N interested" count.
 *
 * Card fields trace to the client's session-detail spec (EHPAD name, time, address) + the
 * distance the Accueil preview established. The real layout still owes a check against the
 * coach video + approved Figma. Copy comes from ../copy (the localization seam).
 *
 * Surface = coach. Reads the (still-settling) colour scheme off the token and uses only tokens
 * valid in BOTH variants + the palette. Invariant in both: content cards are the dark "ink
 * component" and text inside them is light.
 */
import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Modal, AccessibilityInfo, Animated, Easing,
  LayoutChangeEvent, PanResponder, GestureResponderHandlers,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { MapPin, Clock, Hand, Check, X, Bell, CalendarX, CalendarDays, Sparkles, AlarmClock, LayoutList, SlidersHorizontal, Copy, Building2, DoorOpen, UserRound, ChevronLeft, ChevronRight, Car, Footprints, TriangleAlert, type LucideIcon } from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces, motion, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { NotificationCenter } from '../components/NotificationCenter';
import { Segmented } from '../components/segmented';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { ProfileScreen } from './ProfileScreen';
import { useTabBarInset } from '../navigation/tabBarInsets';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { DisponiblesSkeleton } from './skeletons';

const S = surfaces.coach;
const isDark = S.colorScheme === 'dark';
const CANVAS = S.canvas;                                            // ink (dark) | cream (light)
const CARD = S.surface;                                             // the dark ink card in both schemes
const SUBTLE = isDark ? palette.neutral[800] : palette.neutral[100]; // subtle container on the canvas
const DIVIDER = palette.neutral[700];                              // dividers inside dark cards
const ON_CANVAS = S.textPrimary;                                   // on-canvas text — adapts per scheme
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[50];                              // light text inside the dark card
const ON_CARD_2 = palette.neutral[300];

/* Status / accent colours used on the ink surface (the semantic status tokens are calibrated
   for light surfaces, so we reach into the global ramp here, like Accueil/Séances). */
const INK = {
  applied: { fg: palette.vert[300], bg: 'rgba(47,158,107,0.16)' }, // on the shortlist (green)
  info: { fg: palette.bleu[300], bg: 'rgba(123,147,199,0.14)' },   // open (blue)
};

/* Raised-surface effect for the metric tiles — a slight top-lit gradient + a dim hairline,
   copied from the Home calendar so the two screens' tiles read identically. */
const RAISED_BORDER = 'rgba(255,255,255,0.07)';

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

/* ---------- data model ---------- */

type ApplyState = 'open' | 'applied';
type SessionType = 'first' | 'regular'; // 'first' = TEST / first session with this EHPAD; 'regular' = ongoing
type Avail = {
  dom: number;      // June day-of-month (the whole prototype is June 2026)
  time: string;
  end: string;
  dur: string;
  place: string;    // EHPAD name
  address: string;  // full street address (shown in the detail page)
  loc: string;      // area · distance (the proximity the matching algorithm weights)
  km: number;       // numeric distance
  state: ApplyState;
  // Detail-page session info (WBS PLA-06).
  unit: string;     // care unit type + floor
  access: string;   // how to get in on arrival
  contact: string;  // on-site person to ask for
  sessionType: SessionType; // session type — label pulled from copy.availableScreen.type
};

// Mock open sessions — ONE source of truth, keyed by June day-of-month (like the Home calendar's
// schedule map). The week strip, the month grid, the tile counts AND the under-calendar list all
// read from this. Real code queries open sessions by date + locale. Names reused across screens
// so the prototype reads as one world. The Cedars (June 12) is pre-seeded as already applied.
const OPEN_BY_DAY: Record<number, Avail[]> = {
  10: [{ dom: 10, time: '09:30', end: '10:30', dur: '1h', place: 'Riverside Care Home', address: '14 Quai Rambaud, Lyon 7th', loc: 'Lyon 7th · 4.1 km', km: 4.1, state: 'open', unit: 'Long-term care · Ground floor', access: 'Main entrance, 14 Quai Rambaud', contact: 'Ask for Sophie Bernard · Coordinator', sessionType: 'first' }],
  11: [
    { dom: 11, time: '10:00', end: '11:00', dur: '1h', place: 'Park Care Home', address: '8 Rue Léon Blum, Villeurbanne', loc: 'Villeurbanne · 3.1 km', km: 3.1, state: 'open', unit: 'Memory care · 2nd floor', access: 'Staff entrance, Rue Léon Blum (buzz APA)', contact: 'Ask for Marc Dubois · Activities lead', sessionType: 'regular' },
    { dom: 11, time: '14:00', end: '15:00', dur: '1h', place: 'Maple Court', address: '27 Cours Gambetta, Lyon 6th', loc: 'Lyon 6th · 1.9 km', km: 1.9, state: 'open', unit: 'Assisted living · 1st floor', access: 'Visitor entrance, courtyard side', contact: 'Ask for Claire Petit · Coordinator', sessionType: 'regular' },
  ],
  12: [{ dom: 12, time: '16:00', end: '17:00', dur: '1h', place: 'The Cedars Residence', address: '5 Avenue Jean Jaurès, Lyon 7th', loc: 'Lyon 7th · 4.8 km', km: 4.8, state: 'applied', unit: 'Memory care · Ground floor', access: 'Reception desk, ground floor', contact: 'Ask for Marie Laurent · Coordinator', sessionType: 'regular' }],
  13: [{ dom: 13, time: '11:00', end: '12:00', dur: '1h', place: 'The Oaks', address: '19 Montée des Soldats, Caluire', loc: 'Caluire · 5.2 km', km: 5.2, state: 'open', unit: 'Long-term care · 3rd floor', access: 'Main entrance — sign in at the desk', contact: 'Ask for Julien Roy · Nurse manager', sessionType: 'first' }],
  // A genuinely far session (~15 km) so the over-limit travel warning (PLA-06) is demonstrable —
  // ~39 min by car, past the coach's 30-min preference, but still applyable.
  16: [{ dom: 16, time: '14:00', end: '15:00', dur: '1h', place: 'Greenfield Lodge', address: '22 Rue de la République, Meyzieu', loc: 'Meyzieu · 15.4 km', km: 15.4, state: 'open', unit: 'Long-term care · 2nd floor', access: 'Main gate, visitor parking', contact: 'Ask for Émilie Garnier · Coordinator', sessionType: 'regular' }],
  // further-out weeks (mock) so paging + the Month view have content to show
  18: [{ dom: 18, time: '10:00', end: '11:00', dur: '1h', place: 'Park Care Home', address: '8 Rue Léon Blum, Villeurbanne', loc: 'Villeurbanne · 3.1 km', km: 3.1, state: 'open', unit: 'Memory care · 2nd floor', access: 'Staff entrance, Rue Léon Blum (buzz APA)', contact: 'Ask for Marc Dubois · Activities lead', sessionType: 'regular' }],
  20: [{ dom: 20, time: '15:00', end: '16:00', dur: '1h', place: 'Riverside Care Home', address: '14 Quai Rambaud, Lyon 7th', loc: 'Lyon 7th · 4.1 km', km: 4.1, state: 'open', unit: 'Long-term care · Ground floor', access: 'Main entrance, 14 Quai Rambaud', contact: 'Ask for Sophie Bernard · Coordinator', sessionType: 'regular' }],
  25: [{ dom: 25, time: '11:00', end: '12:00', dur: '1h', place: 'Maple Court', address: '27 Cours Gambetta, Lyon 6th', loc: 'Lyon 6th · 1.9 km', km: 1.9, state: 'open', unit: 'Assisted living · 1st floor', access: 'Visitor entrance, courtyard side', contact: 'Ask for Claire Petit · Coordinator', sessionType: 'regular' }],
};
const OPEN: Avail[] = Object.values(OPEN_BY_DAY).flat();
const keyOf = (a: Avail) => `${a.dom}-${a.time}-${a.place}`;

// June 2026 calendar maths. June 1 2026 is a Monday, so weekday index = (n-1) mod 7 (Mon-first).
const TODAY = 9; // June 9 — the "today" marker
const WEEKDAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekMonday = (offset: number) => new Date(2026, 5, 8 + offset * 7);
const openOn = (dom: number) => OPEN_BY_DAY[dom] ?? [];
const dayLabel = (dom: number) => `${WEEKDAY_ABBR[(dom - 1) % 7]} · June ${dom}`;
const dayA11y = (dom: number, load: number) =>
  `${dayLabel(dom)}, ${load === 0 ? copy.availableScreen.cal.a11yNone : `${load} ${copy.availableScreen.cal.a11ySessions}`}`;
const firstOpenDom = Object.keys(OPEN_BY_DAY).map(Number).sort((a, b) => a - b)[0] ?? TODAY;

// Week strip is date-driven so it can page to any week. Days outside June have no mock sessions
// and render muted + non-selectable.
type WeekDay = { wd: string; dom: number; isJune: boolean; today: boolean; load: number; empty: boolean; key: string };
function weekEyebrow(offset: number) {
  const c = copy.availableScreen.cal;
  if (offset === 0) return c.thisWeek;
  if (offset === -1) return c.lastWeek;
  if (offset === 1) return c.nextWeek;
  const mon = weekMonday(offset);
  return `${c.weekOf} ${MONTHS_ABBR[mon.getMonth()]} ${mon.getDate()}`;
}
function weekData(offset: number) {
  const mon = weekMonday(offset);
  let openTotal = 0;
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
    const isJune = date.getFullYear() === 2026 && date.getMonth() === 5;
    const dom = date.getDate();
    const load = isJune ? openOn(dom).length : 0;
    openTotal += load;
    return { wd: WEEKDAY_ABBR[i], dom, isJune, today: isJune && dom === TODAY, load, empty: i >= 5, key: `${date.getMonth()}-${dom}` };
  });
  return { days, openTotal, eyebrow: weekEyebrow(offset) };
}

// Month grid is date-driven so it can page to any month (offset 0 = June 2026, ± = prev/next), like
// the Home calendar. Only June 2026 carries mock open sessions; other months render empty + muted
// (PLA-05 "navigate between months" — honest for the prototype's June-only data).
type MonthDay = { n: number; load: number; today: boolean; isData: boolean };
function monthData(offset: number) {
  const base = new Date(2026, 5 + offset, 1);
  const year = base.getFullYear(), mIdx = base.getMonth();
  const isData = year === 2026 && mIdx === 5;            // June 2026 holds the mock open sessions
  const daysIn = new Date(year, mIdx + 1, 0).getDate();
  const lead = (base.getDay() + 6) % 7;                  // Mon-first leading blanks before day 1
  let openTotal = 0;
  const days: MonthDay[] = Array.from({ length: daysIn }, (_, i) => {
    const n = i + 1;
    const load = isData ? openOn(n).length : 0;
    openTotal += load;
    return { n, load, today: isData && n === TODAY, isData };
  });
  return { days, lead, isData, openTotal, name: MONTHS_FULL[mIdx], label: `${MONTHS_FULL[mIdx]} ${year}` };
}

// How far the calendar content slides on a Week/Month switch (vestibular-friendly: a moderate
// offset, not the full width).
const SLIDE_DX = 56;

// Honour the OS "reduce motion" setting — calendar transitions collapse to an instant swap when
// it's on (vestibular safety is non-negotiable, not a taste call).
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

/* ---------- small building blocks ---------- */

function AppliedChip() {
  const c = INK.applied;
  return (
    <View style={[st.chip, { backgroundColor: c.bg }]}>
      <Check size={13} color={c.fg} />
      <Text style={[st.chipTxt, { color: c.fg }]} numberOfLines={1}>{copy.availableScreen.status.applied}</Text>
    </View>
  );
}

// One open-session row + the circular Raise-hand / Withdraw action on the right. Red solid =
// the primary engine; the red→gold gradient stays reserved for geolocated check-in elsewhere.
// In the List view the row also carries its own date (no day-group header there) and, when it's
// an urgent session, the remaining-days countdown — both optional so the day-list reuse is clean.
function AvailCard({ a, applied, first, onToggle, onOpen, dateLabel, urgency }: {
  a: Avail; applied: boolean; first: boolean; onToggle: () => void; onOpen: () => void;
  dateLabel?: string; urgency?: string;
}) {
  const isFirstVisit = a.sessionType === 'first';
  return (
    <View style={[st.card, first ? st.cardFirst : st.cardDivider]}>
      <View style={st.cardTop}>
        {/* tappable row → session detail */}
        <Pressable
          style={({ pressed }) => [st.headerTap, pressed && { opacity: 0.9 }]}
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={[dateLabel, `${a.place}, ${a.time}`, isFirstVisit ? copy.availableScreen.type.first : undefined, a.loc, urgency, applied ? copy.availableScreen.status.applied : undefined, 'View details.'].filter(Boolean).join(', ')}
        >
          <View style={st.timeRail}>
            <Text style={st.railTime} numberOfLines={1}>{a.time}</Text>
            <Text style={st.railEnd} numberOfLines={1}>{a.end}</Text>
          </View>
          <View style={st.cardBody}>
            {dateLabel ? (
              <View style={st.cardEyebrowRow}>
                <Text style={st.cardDate} numberOfLines={1}>{dateLabel}</Text>
              </View>
            ) : null}
            <View style={st.bodyHead}>
              <Text style={st.place} numberOfLines={1}>{a.place}</Text>
            </View>
            {/* location + distance — the only meta on the card now. Duration + travel ETA moved to
                the detail page so the list stays scannable (declutter pass). */}
            <View style={st.metaRow}>
              <MapPin size={14} color={ON_CARD_2} />
              <Text style={st.meta}>{a.loc}</Text>
            </View>
            {/* all status tags share one bottom line — urgency · session type · applied. Grouped
                here (instead of by the date / place name) so the upper rows stay clean; wraps if
                more than one is present. */}
            {(urgency || isFirstVisit || applied) ? (
              <View style={st.tagRow}>
                {urgency ? (
                  <View style={st.urgencyTag}>
                    <AlarmClock size={12} color={CAT_META.urgent.fg} strokeWidth={2.5} />
                    <Text style={st.urgencyTxt} numberOfLines={1}>{urgency}</Text>
                  </View>
                ) : null}
                {isFirstVisit ? (
                  <View style={st.typeTag}>
                    <Sparkles size={12} color={INK.info.fg} strokeWidth={2.5} />
                    <Text style={st.typeTagTxt} numberOfLines={1}>{copy.availableScreen.type.first}</Text>
                  </View>
                ) : null}
                {/* applied = compact pill matching the other tags. AppliedChip's fuller form is kept
                    for the detail sheet, where it sits beside the equally-sized context chip. */}
                {applied ? (
                  <View style={st.appliedTag}>
                    <Check size={12} color={INK.applied.fg} strokeWidth={2.5} />
                    <Text style={st.appliedTagTxt} numberOfLines={1}>{copy.availableScreen.status.applied}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
            {applied ? <Text style={st.appliedNote}>{copy.availableScreen.appliedNote}</Text> : null}
          </View>
        </Pressable>

        {/* circular action — raise a hand (apply) ↔ withdraw, top-aligned */}
        {applied ? (
          <Pressable
            style={({ pressed }) => [st.actionCircle, st.withdrawCircle, pressed && { opacity: 0.7 }]}
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel={`${copy.availableScreen.action.withdraw}, ${a.place}, ${a.time}`}
          >
            <X size={20} color={ON_CARD} />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [st.actionCircle, st.applyCircle, pressed && { opacity: 0.9 }]}
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel={`${copy.availableScreen.action.apply}, ${a.place}, ${a.time}, ${a.loc}`}
          >
            <Hand size={20} color={color.onAction} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <View style={st.empty}>
      <View style={st.emptyIcon}>
        <CalendarX size={26} color={ON_CANVAS_2} />
      </View>
      <Text style={st.emptyTitle}>{message ?? copy.availableScreen.cal.dayEmpty}</Text>
    </View>
  );
}

/* ---------- list view (the "All" tab): category filter + sections (PLA-15) ---------- */

// A filter pill with its count. Selected = red fill (matches the toggle accent); the pill also
// drives screen-reader selection state.
function CatChip({ label, count, selected, onPress }: { label: string; count: number; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[st.chipF, selected && st.chipFOn]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}, ${count}`}
    >
      <Text style={[st.chipFTxt, selected && st.chipFTxtOn]}>{label}</Text>
      <View style={[st.chipFCount, selected && st.chipFCountOn]}>
        <Text style={[st.chipFCountTxt, selected && st.chipFCountTxtOn]}>{count}</Text>
      </View>
    </Pressable>
  );
}

// One category block: a labelled header (icon chip + name + count + hint) followed by its cards.
function CatSection({ cat, items, applied, onToggle, onOpen }: {
  cat: Category; items: Avail[]; applied: Set<string>;
  onToggle: (a: Avail) => void; onOpen: (a: Avail) => void;
}) {
  const m = CAT_META[cat];
  const L = copy.availableScreen.list;
  const Icon = m.Icon;
  return (
    <View style={st.catBlock}>
      <View style={st.catHead}>
        <View style={[st.catIcon, { backgroundColor: m.bg }]}>
          <Icon size={14} color={m.fg} strokeWidth={2.5} />
        </View>
        <Text style={[st.catTitle, { color: m.fg }]}>{L.cats[cat]}</Text>
        <Text style={st.catCount}>{items.length}</Text>
      </View>
      {items.map((a, i) => (
        <AvailCard
          key={keyOf(a)}
          a={a}
          applied={applied.has(keyOf(a))}
          first={i === 0}
          onToggle={() => onToggle(a)}
          onOpen={() => onOpen(a)}
          dateLabel={dayLabel(a.dom)}
          urgency={cat === 'urgent' ? urgencyLabel(a.dom) : undefined}
        />
      ))}
    </View>
  );
}

/* ---------- calendar (copied from the Home calendar, wired to open sessions) ---------- */

type CalMode = 'week' | 'month' | 'all';
const MODE_ORDER: Record<CalMode, number> = { week: 0, month: 1, all: 2 }; // spatial order → slide direction

/* ---------- list-view categorisation (WBS PLA-15) ----------
   The "All" tab is the List view. Every open session is bucketed the way the matching algorithm
   weighs it for THIS coach, into ONE primary category so the counts partition the list:
     · Urgent      — starts within URGENT_WITHIN_DAYS (time-critical; needs a coach fast). Wins over
                     Recommended even for a close session: a deadline is the stronger call to action.
     · Recommended — not urgent, but within NEAR_KM (proximity = a strong match → ranks high).
     · Available   — everything else.
   Thresholds are prototype values; real code would read the coach's travel/availability prefs. */
type Category = 'recommended' | 'urgent' | 'available';
const CAT_ORDER: Category[] = ['recommended', 'urgent', 'available']; // section + chip order (spec order)
const URGENT_WITHIN_DAYS = 3;   // starts within 3 days → urgent
const NEAR_KM = 3.5;            // inside the coach's close range → recommended
const daysUntil = (dom: number) => dom - TODAY; // June-only prototype: day-of-month delta
function categoryOf(a: Avail): Category {
  const d = daysUntil(a.dom);
  if (d >= 0 && d <= URGENT_WITHIN_DAYS) return 'urgent';
  if (a.km <= NEAR_KM) return 'recommended';
  return 'available';
}

// Partition OPEN into the three buckets. OPEN is already date+time ascending (the BY_DAY keys
// iterate in numeric order, each day's array is time-sorted), so each bucket stays sorted too.
const LIST_BY_CAT: Record<Category, Avail[]> = { recommended: [], urgent: [], available: [] };
OPEN.forEach((a) => { LIST_BY_CAT[categoryOf(a)].push(a); });

// Per-category accent on the ink surface (reaching into the ramp, like INK above): Recommended =
// gold (a highlighted match), Urgent = red (time-critical), Available = neutral.
const CAT_META: Record<Category, { fg: string; bg: string; Icon: LucideIcon }> = {
  recommended: { fg: palette.or[300], bg: 'rgba(248,213,68,0.15)', Icon: Sparkles },
  urgent: { fg: palette.rouge[300], bg: 'rgba(238,123,114,0.16)', Icon: AlarmClock },
  available: { fg: palette.neutral[300], bg: 'rgba(255,255,255,0.06)', Icon: LayoutList },
};
type CatFilter = 'all' | Category;

// "remaining days before the session date" for an urgent card (PLA-15).
function urgencyLabel(dom: number): string {
  const u = copy.availableScreen.list.urgency;
  const d = daysUntil(dom);
  if (d <= 0) return u.today;
  if (d === 1) return u.tomorrow;
  return `${u.inDays} ${d} ${u.days}`;
}

/* ---------- travel time + over-limit warning (WBS PLA-06 / PLA-08) ----------
   The coach's saved travel preference (mock — mirrors the Home "up to 30 min · by car"). Real
   code reads this from the coach's profile. Travel time is DERIVED from each session's distance
   (a.km) + the preference, so there is no per-session travel field to drift out of sync. */
type TravelMode = 'car' | 'foot';
const TRAVEL_PREF: { mode: TravelMode; maxMin: number } = { mode: 'car', maxMin: 30 };
const TRAVEL_SPEED_KMH: Record<TravelMode, number> = { car: 24, foot: 4.8 }; // conservative city speeds
const TRAVEL_ICON: Record<TravelMode, LucideIcon> = { car: Car, foot: Footprints };
// km → whole minutes (ceil so we never under-promise; floor 1). Pure + deterministic.
const travelMins = (km: number, mode: TravelMode = TRAVEL_PREF.mode) => Math.max(1, Math.ceil((km / TRAVEL_SPEED_KMH[mode]) * 60));
const isOverLimit = (mins: number) => mins > TRAVEL_PREF.maxMin; // past the coach's configured max
// "~12 min by car" / "~24 min on foot" — composed here (units are placeholders, like the km labels).
function travelLabel(km: number): string {
  const t = copy.availableScreen.travel;
  const phrase = TRAVEL_PREF.mode === 'car' ? `${t.by} ${t.car}` : t.onFoot;
  return `~${travelMins(km)} ${t.min} ${phrase}`;
}
// Amber "attention" accent for the over-limit treatment — reuse palette.or (gold), NEVER
// color.action (red is reserved as the action/engine colour). Paired with text, never colour alone.
const WARN = { fg: palette.or[300], bg: 'rgba(248,213,68,0.15)', border: 'rgba(248,213,68,0.30)' };

/* ---------- list-view refine filter (Distance + Availability) ----------
   A secondary refinement reached via the filter icon in the List view. Distance maps to the
   coach's max-travel-time preference (WBS PLA-08); Availability is the coach's own application
   state. Both are orthogonal to the Recommended/Urgent/Available buckets, so they narrow WITHIN
   whatever category view is showing. The "≤ N km" labels are composed here (placeholder units). */
type StatusFilter = 'all' | 'open' | 'applied';
const DIST_OPTIONS: { km: number | null; label: string }[] = [
  { km: null, label: copy.availableScreen.filter.distAny },
  { km: 2, label: '≤ 2 km' },
  { km: 4, label: '≤ 4 km' },
  { km: 6, label: '≤ 6 km' },
];
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: copy.availableScreen.filter.statusAll },
  { value: 'open', label: copy.availableScreen.filter.statusOpen },
  { value: 'applied', label: copy.availableScreen.filter.statusApplied },
];

// One metric tile — top label, an accent icon chip + big Anton number with a small unit. Used as
// a pair (Open / Applied) above the calendar, identical surface to the Home tiles.
// The tile frame (icon + label) is constant across Week/Month — only the figure changes — so on
// a switch the card stays put and just the number+unit crossfades (ease in/out via valueOpacity).
function MetricTile({ label, value, unit, Icon, tint, tintBg, a11y, valueOpacity }: {
  label: string; value: number; unit: string; Icon: LucideIcon; tint: string; tintBg: string; a11y: string;
  valueOpacity?: Animated.Value;
}) {
  return (
    <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={st.tile} accessible accessibilityLabel={a11y}>
      {/* tinted icon chip pinned to the top-right corner — matches the Home calendar tiles */}
      <View style={[st.tileChip, { backgroundColor: tintBg }]}>
        <Icon size={18} color={tint} strokeWidth={2.5} />
      </View>
      <Text style={st.tileLabel}>{label}</Text>
      <Animated.View style={[st.tileNumWrap, valueOpacity != null && { opacity: valueOpacity }]}>
        <Text style={st.tileNum}>{value}</Text>
        <Text style={st.tileUnit}>{unit}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

function CalSummary({ open, applied, valueOpacity }: { open: number; applied: number; valueOpacity?: Animated.Value }) {
  const t = copy.availableScreen.cal.tiles;
  return (
    <View style={st.tileRow}>
      <MetricTile
        label={t.open} value={open} unit={t.unit}
        Icon={CalendarDays} tint={INK.info.fg} tintBg={INK.info.bg}
        a11y={`${open} ${t.unit} ${t.open.toLowerCase()}`}
        valueOpacity={valueOpacity}
      />
      <MetricTile
        label={t.applied} value={applied} unit={t.unit}
        Icon={Hand} tint={INK.applied.fg} tintBg={INK.applied.bg}
        a11y={`${applied} ${t.unit} ${t.applied.toLowerCase()}`}
        valueOpacity={valueOpacity}
      />
    </View>
  );
}

function WeekView({ days, selected, onSelect, fade, x, pan }: {
  days: WeekDay[]; selected: number; onSelect: (n: number) => void;
  fade: Animated.Value; x: Animated.Value; pan: GestureResponderHandlers;
}) {
  return (
    // Swipeable to page weeks: pan handlers capture only clear horizontal drags, so day taps and
    // vertical scroll pass through.
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
              <View style={st.load}>
                {Array.from({ length: day.load }).map((_, i) => (<View key={i} style={st.loadDot} />))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

function MonthView({ days, lead, selected, onSelect, fade, x, pan }: {
  days: MonthDay[]; lead: number; selected: number; onSelect: (n: number) => void;
  fade: Animated.Value; x: Animated.Value; pan: GestureResponderHandlers;
}) {
  return (
    // The weekday header is a static frame; only the day grid slides/fades when paging months. Pan
    // claims only clear horizontal drags, so day taps and vertical scroll pass through.
    <View {...pan}>
      <View style={st.moHead}>
        {WEEKDAY_ABBR.map((w, i) => (<Text key={i} style={st.moHeadTxt}>{w}</Text>))}
      </View>
      <Animated.View style={{ opacity: fade, transform: [{ translateX: x }] }}>
        <View style={st.moGrid}>
          {/* leading blanks so day 1 lands under its weekday */}
          {Array.from({ length: lead }).map((_, i) => (<View key={`blank-${i}`} style={st.moCellWrap} />))}
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
                  {/* one dot per open session that day (capped at 3) — differentiates by count (PLA-05) */}
                  <View style={st.moDotRow}>
                    {Array.from({ length: Math.min(day.load, 3) }).map((_, i) => (<View key={i} style={st.loadDot} />))}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

/* ---------- calendar header chrome (week range + month label) ---------- */

// Week view: prev/next week chevrons + the centred week-range label (PLA-04). The chevrons drive
// the SAME goWeek path as the swipe; the label crossfades with the strip via weekFade.
function WeekNav({ label, onPrev, onNext, prevDisabled, nextDisabled, labelFade }: {
  label: string; onPrev: () => void; onNext: () => void; prevDisabled: boolean; nextDisabled: boolean; labelFade: Animated.Value;
}) {
  const cc = copy.availableScreen.cal;
  // disabled at the edge of the weeks that have open sessions — mirrors MonthNav's boundary discipline
  const Chevron = ({ dir, onPress, disabled, a11y }: { dir: 'l' | 'r'; onPress: () => void; disabled: boolean; a11y: string }) => {
    const Icon = dir === 'l' ? ChevronLeft : ChevronRight;
    if (disabled) {
      return (
        <View style={[st.calNavBtn, st.calNavBtnOff]} accessible accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel={a11y}>
          <Icon size={20} color={palette.neutral[600]} />
        </View>
      );
    }
    return (
      <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [st.calNavBtn, pressed && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={a11y}>
        <Icon size={20} color={ON_CANVAS} />
      </Pressable>
    );
  };
  return (
    <View style={st.calNav}>
      <Chevron dir="l" onPress={onPrev} disabled={prevDisabled} a11y={cc.prevWeekA11y} />
      <Animated.Text style={[st.calNavLabel, { opacity: labelFade }]} numberOfLines={1}>{label}</Animated.Text>
      <Chevron dir="r" onPress={onNext} disabled={nextDisabled} a11y={cc.nextWeekA11y} />
    </View>
  );
}

// Month view: month label + prev/next chevrons. The calendar pages months freely (a live schedule,
// like Home), so the chevrons always navigate; the label crossfades with the grid via monthFade
// (PLA-05 "navigate between months"). Out-of-data months render empty + muted.
function MonthNav({ label, onPrev, onNext, labelFade }: {
  label: string; onPrev: () => void; onNext: () => void; labelFade: Animated.Value;
}) {
  const cc = copy.availableScreen.cal;
  return (
    <View style={st.calNav}>
      <Pressable onPress={onPrev} hitSlop={6} style={({ pressed }) => [st.calNavBtn, pressed && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={cc.prevMonthA11y}>
        <ChevronLeft size={20} color={ON_CANVAS} />
      </Pressable>
      <Animated.Text style={[st.calNavLabel, { opacity: labelFade }]} numberOfLines={1}>{label}</Animated.Text>
      <Pressable onPress={onNext} hitSlop={6} style={({ pressed }) => [st.calNavBtn, pressed && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={cc.nextMonthA11y}>
        <ChevronRight size={20} color={ON_CANVAS} />
      </Pressable>
    </View>
  );
}

/* ---------- session detail — pageSheet modal, opened by tapping a row ---------- */

function DetailRow({ Icon, label, value, first, onCopy, copyA11y }: {
  Icon: LucideIcon; label: string; value: string; first?: boolean;
  onCopy?: () => void; copyA11y?: string;
}) {
  return (
    <View style={[st.dRow, !first && st.dRowDivider]}>
      <View style={st.dRowIcon}><Icon size={18} color={ON_CARD_2} /></View>
      <View style={{ flex: 1 }}>
        <Text style={st.dRowLabel}>{label}</Text>
        <Text style={st.dRowValue}>{value}</Text>
      </View>
      {onCopy ? (
        <Pressable
          onPress={onCopy}
          hitSlop={10}
          style={({ pressed }) => [st.dCopyBtn, pressed && { opacity: 0.55 }]}
          accessibilityRole="button"
          accessibilityLabel={copyA11y}
        >
          <Copy size={18} color={ON_CARD_2} />
        </Pressable>
      ) : null}
    </View>
  );
}

type ToastTone = 'success' | 'neutral';

// A transient confirmation toast + its controller. One animated value drives a fade + small rise;
// the message auto-dismisses after ~1.9s (reduced motion → snap). Used on the main screen (card
// raise-hand / withdraw) AND inside the detail sheet (copy address + raise-hand / withdraw).
function useToast(reduced: boolean) {
  const [content, setContent] = React.useState<{ msg: string; tone: ToastTone } | null>(null);
  const a = React.useRef(new Animated.Value(0)).current;
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = React.useCallback((msg: string, tone: ToastTone = 'success') => {
    setContent({ msg, tone });
    if (timer.current) clearTimeout(timer.current);
    if (reduced) a.setValue(1);
    else Animated.timing(a, { toValue: 1, duration: motion.duration.fast, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      if (reduced) { a.setValue(0); setContent(null); return; }
      Animated.timing(a, { toValue: 0, duration: motion.duration.base, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { if (finished) setContent(null); });
    }, 1900);
  }, [reduced, a]);
  const hide = React.useCallback(() => { if (timer.current) clearTimeout(timer.current); a.setValue(0); setContent(null); }, [a]);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return { content, a, show, hide };
}

// Elevated dark pill, centred above `bottom`. Success = green check; neutral = muted X (withdraw).
function Toast({ content, anim, bottom }: { content: { msg: string; tone: ToastTone } | null; anim: Animated.Value; bottom: number }) {
  if (!content) return null;
  const Icon = content.tone === 'success' ? Check : X;
  const tint = content.tone === 'success' ? palette.vert[300] : ON_CANVAS_2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[st.toastWrap, { bottom, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}
    >
      <View style={st.toast}>
        <Icon size={16} color={tint} />
        <Text style={st.toastTxt}>{content.msg}</Text>
      </View>
    </Animated.View>
  );
}

function AvailDetail({ a, applied, onToggle, onClose }: { a: Avail | null; applied: boolean; onToggle: () => void; onClose: () => void }) {
  const c = copy.availableScreen;
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { content: toastContent, a: toastAnim, show: showToast, hide: hideToast } = useToast(reduced);

  // Copy the address to the clipboard, then flash the "Address copied" toast (PLA-06).
  const copyAddress = React.useCallback(async () => {
    if (!a) return;
    await Clipboard.setStringAsync(a.address);
    showToast(c.detail.copied, 'success');
  }, [a, c.detail.copied, showToast]);

  // Raise-hand / withdraw from the detail sheet — flip the state, then confirm (PLA-07).
  const onAction = React.useCallback(() => {
    if (!a) return;
    const willApply = !applied;
    onToggle();
    showToast(willApply ? c.toast.applied : c.toast.withdrawn, willApply ? 'success' : 'neutral');
  }, [a, applied, onToggle, showToast, c.toast.applied, c.toast.withdrawn]);

  // Reset the toast whenever the sheet closes, so it can't flash stale on the next open.
  React.useEffect(() => { if (!a) hideToast(); }, [a, hideToast]);

  // Session-type chip: first-visit = blue + Sparkles (matches the card tag); regular = neutral
  // so the "new relationship" glyph/accent never contradicts a "Regular session" label.
  const isFirstVisit = a?.sessionType === 'first';
  const TypeIcon = isFirstVisit ? Sparkles : CalendarDays;
  const typeAccent = isFirstVisit ? INK.info : { fg: ON_CARD_2, bg: 'rgba(255,255,255,0.06)' };

  return (
    <Modal visible={!!a} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        <View style={st.dHeader}>
          <Text style={st.dHeaderTitle}>{c.detail.title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.dClose} accessibilityRole="button" accessibilityLabel={c.detail.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        {a ? (
          <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: sp.xl }} showsVerticalScrollIndicator={false}>
            <Text style={st.dPlace}>{a.place}</Text>
            <View style={st.dChips}>
              <View style={[st.contextChip, { backgroundColor: typeAccent.bg }]} accessible accessibilityLabel={`${c.detail.contextA11y}: ${c.type[a.sessionType]}`}>
                <TypeIcon size={13} color={typeAccent.fg} />
                <Text style={[st.contextTxt, { color: typeAccent.fg }]}>{c.type[a.sessionType]}</Text>
              </View>
              {applied ? <AppliedChip /> : null}
            </View>

            {/* facts (deliberately no resident/candidate count — pre-assignment) */}
            <View style={st.dCard}>
              <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.xl }]} pointerEvents="none" />
              <DetailRow Icon={Clock} label={c.detail.when} value={`${dayLabel(a.dom)} · ${a.time} → ${a.end} · ${a.dur}`} first />
              <DetailRow Icon={MapPin} label={c.detail.where} value={a.address} onCopy={copyAddress} copyA11y={c.detail.copyA11y} />
              <DetailRow Icon={TRAVEL_ICON[TRAVEL_PREF.mode]} label={c.travel.detailLabel} value={`${travelLabel(a.km)} · ${a.km} km`} />
              <DetailRow Icon={Building2} label={c.detail.unit} value={a.unit} />
              <DetailRow Icon={DoorOpen} label={c.detail.access} value={a.access} />
              <DetailRow Icon={UserRound} label={c.detail.contact} value={a.contact} />
            </View>

            {/* non-blocking over-limit warning (PLA-06) — informs, never disables Raise hand */}
            {isOverLimit(travelMins(a.km)) ? (
              <View style={st.warnBanner}>
                <TriangleAlert size={18} color={WARN.fg} />
                <View style={{ flex: 1 }}>
                  <Text style={st.warnTitle}>{c.travel.overLimit}</Text>
                  <Text style={st.warnBody}>
                    {c.travel.overLimitBody
                      .replace('{mins}', String(travelMins(a.km)))
                      .replace('{mode}', TRAVEL_PREF.mode === 'car' ? `${c.travel.by} ${c.travel.car}` : c.travel.onFoot)
                      .replace('{max}', String(TRAVEL_PREF.maxMin))}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* raise hand ↔ withdraw — same loop as the row */}
            <View style={{ marginTop: sp.lg }}>
              {applied ? (
                <Pressable
                  style={({ pressed }) => [st.withdrawBtn, pressed && { opacity: 0.75 }]}
                  onPress={onAction}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.action.withdraw}, ${a.place}`}
                >
                  <X size={16} color={ON_CARD} style={{ marginRight: 6 }} />
                  <Text style={st.withdrawTxt}>{c.action.withdraw}</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [st.applyWrap, pressed && { opacity: 0.9 }]}
                  onPress={onAction}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.action.apply}, ${a.place}`}
                >
                  <View style={st.applyBtn}>
                    <Hand size={17} color={color.onAction} style={{ marginRight: 8 }} />
                    <Text style={st.applyTxt}>{c.action.apply}</Text>
                  </View>
                </Pressable>
              )}
            </View>
            {applied ? <Text style={st.appliedNote}>{c.appliedNote}</Text> : null}
          </ScrollView>
        ) : null}

        {/* Confirmations — "Address copied" (PLA-06) + raise-hand / withdraw (PLA-07) */}
        <Toast content={toastContent} anim={toastAnim} bottom={insets.bottom + sp.xl} />
      </View>
    </Modal>
  );
}

/* ---------- refine-filter sheet (Distance + Availability) ---------- */

// A plain selectable pill (no count) — used for the distance + availability options in the sheet.
function OptChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[st.opt, selected && st.optOn]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text style={[st.optTxt, selected && st.optTxtOn]}>{label}</Text>
    </Pressable>
  );
}

// Bottom sheet: narrow the List by distance + the coach's application status. Selections apply
// LIVE (the list behind updates), so the primary button just states the result and closes.
// The panel slides up from the bottom (the usual bottom-sheet motion) while the tinted backdrop
// fades in; kept mounted through the exit so the close animates too. Reduced motion → instant.
function FilterSheet({ visible, reduced, distMax, status, count, onDist, onStatus, onReset, onClose }: {
  visible: boolean; reduced: boolean; distMax: number | null; status: StatusFilter; count: number;
  onDist: (d: number | null) => void; onStatus: (s: StatusFilter) => void; onReset: () => void; onClose: () => void;
}) {
  const f = copy.availableScreen.filter;
  const insets = useSafeAreaInsets();
  const showLabel = count === 0 ? f.showNone : count === 1 ? f.showOne : `${f.showPrefix} ${count} ${f.showSuffix}`;

  const [mounted, setMounted] = React.useState(visible);
  const [panelH, setPanelH] = React.useState(0);
  const progress = React.useRef(new Animated.Value(0)).current; // 0 = down/hidden, 1 = up/shown
  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      if (reduced) { progress.setValue(1); return; }
      Animated.timing(progress, { toValue: 1, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      if (reduced) { progress.setValue(0); setMounted(false); return; }
      Animated.timing(progress, { toValue: 0, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { if (finished) setMounted(false); });
    }
  }, [visible, reduced, progress]);

  if (!mounted) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [panelH || 600, 0] });
  return (
    <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[st.sheetBackdrop, { opacity: progress }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel={f.closeA11y} />
      </Animated.View>
      <View style={st.sheetWrap} pointerEvents="box-none">
        <Animated.View
          onLayout={(e) => setPanelH(e.nativeEvent.layout.height)}
          style={[st.sheet, { paddingBottom: sp.lg + insets.bottom, transform: [{ translateY }] }]}
        >
          <View style={st.sheetHandle} />
          <View style={st.sheetHead}>
            <Text style={st.sheetTitle}>{f.title}</Text>
            <Pressable onPress={onClose} hitSlop={8} style={st.sheetClose} accessibilityRole="button" accessibilityLabel={f.closeA11y}>
              <X size={20} color={ON_CANVAS} />
            </Pressable>
          </View>

          <Text style={st.sheetLabel}>{f.distance}</Text>
          <View style={st.optRow}>
            {DIST_OPTIONS.map((o) => (
              <OptChip key={String(o.km)} label={o.label} selected={distMax === o.km} onPress={() => onDist(o.km)} />
            ))}
          </View>

          <Text style={[st.sheetLabel, { marginTop: sp.lg }]}>{f.status}</Text>
          <View style={st.optRow}>
            {STATUS_OPTIONS.map((o) => (
              <OptChip key={o.value} label={o.label} selected={status === o.value} onPress={() => onStatus(o.value)} />
            ))}
          </View>

          <View style={st.sheetFooter}>
            <Pressable onPress={onReset} hitSlop={8} style={st.resetBtn} accessibilityRole="button" accessibilityLabel={f.reset}>
              <Text style={st.resetTxt}>{f.reset}</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              disabled={count === 0}
              style={({ pressed }) => [st.showBtn, count === 0 && st.showBtnDisabled, pressed && { opacity: 0.9 }]}
              accessibilityRole="button"
              accessibilityLabel={showLabel}
            >
              <Text style={[st.showTxt, count === 0 && st.showTxtDisabled]}>{showLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ---------- screen ---------- */

export function DisponiblesScreen() {
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Avail | null>(null);
  const [calMode, setCalMode] = React.useState<CalMode>('week');     // drives the toggle — updates instantly
  const [shownMode, setShownMode] = React.useState<CalMode>('week'); // drives the content — lags one fade behind
  const [selectedDate, setSelectedDate] = React.useState<number>(firstOpenDom); // tapped day (June day-of-month)
  const [weekOffset, setWeekOffset] = React.useState(0);             // 0 = this week; ± = previous/next (swipe)
  const [monthOffset, setMonthOffset] = React.useState(0);          // 0 = this month (June 2026); ± = prev/next
  const [catFilter, setCatFilter] = React.useState<CatFilter>('all'); // List-view category filter (PLA-15) — drives the chips, updates instantly
  const [shownCat, setShownCat] = React.useState<CatFilter>('all');   // the rendered sections — lags one crossfade behind
  const [filterOpen, setFilterOpen] = React.useState(false);          // refine sheet open?
  const [distMax, setDistMax] = React.useState<number | null>(null);  // distance ceiling (km); null = any
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all'); // open / applied refine
  const clearRefine = React.useCallback(() => { setDistMax(null); setStatusFilter('all'); }, []);
  const reduced = useReducedMotion();
  const screenToast = useToast(reduced); // confirmation toast for card raise-hand / withdraw

  // Applied set, seeded from the data — toggling raises/withdraws (C11/C12).
  const [applied, setApplied] = React.useState<Set<string>>(
    () => new Set(OPEN.filter((o) => o.state === 'applied').map(keyOf)),
  );
  // Pure state flip — used by the detail sheet, which fires its own confirmation toast.
  const flip = React.useCallback((a: Avail) => {
    setApplied((prev) => {
      const next = new Set(prev);
      const k = keyOf(a);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }, []);
  // Card raise-hand / withdraw → flip + confirmation toast on the main screen (PLA-07).
  const toggle = React.useCallback((a: Avail) => {
    const willApply = !applied.has(keyOf(a));
    flip(a);
    screenToast.show(willApply ? copy.availableScreen.toast.applied : copy.availableScreen.toast.withdrawn, willApply ? 'success' : 'neutral');
  }, [applied, flip, screenToast]);

  // Calendar transition animation (Week ↔ Month), copied from the Home calendar.
  const fade = React.useRef(new Animated.Value(1)).current;
  const slideX = React.useRef(new Animated.Value(0)).current;
  const titleFade = React.useRef(new Animated.Value(1)).current;
  const weekFade = React.useRef(new Animated.Value(1)).current;
  const weekX = React.useRef(new Animated.Value(0)).current;
  const monthFade = React.useRef(new Animated.Value(1)).current;  // month-grid swipe (prev/next month)
  const monthX = React.useRef(new Animated.Value(0)).current;
  const gridH = React.useRef(new Animated.Value(0)).current;
  const listFade = React.useRef(new Animated.Value(1)).current; // category-filter crossfade (List view)
  const listY = React.useRef(new Animated.Value(0)).current;
  const listPhase = React.useRef<'idle' | 'out' | 'in'>('idle'); // guards a fade-out interrupted by a quick tap-back
  const modePhase = React.useRef<'idle' | 'out' | 'in'>('idle'); // same guard for the Week/Month/All switch
  const lastH = React.useRef(0);
  const [measured, setMeasured] = React.useState(false);
  const tabBarInset = useTabBarInset();
  const loading = useFirstLoad('disponibles');

  // Slide + fade between the periods. Reduced motion → instant swap.
  // `titleFade` (the title + tile-value crossfade) is driven on its OWN, separate from the grid's
  // fade/slideX. That matters going to/from "All": the grid unmounts at the swap, which interrupts
  // fade/slideX — and a shared Animated.parallel (stopTogether) would then freeze titleFade near 0,
  // leaving the tile figures invisible. Keeping it independent guarantees it settles back to 1.
  React.useEffect(() => {
    if (calMode === shownMode) {
      // Caught up. If a fade-OUT was interrupted by a quick tap back (e.g. Week→All→Week before the
      // swap), restore the shared drivers so the tiles / nav header / grid can't stay stuck near 0.
      if (modePhase.current === 'out') {
        modePhase.current = 'idle';
        titleFade.stopAnimation(); titleFade.setValue(1);
        fade.stopAnimation(); fade.setValue(1);
        slideX.setValue(0);
      }
      return;
    }
    if (reduced) { setShownMode(calMode); titleFade.setValue(1); fade.setValue(1); slideX.setValue(0); return; }
    const dir = MODE_ORDER[calMode] > MODE_ORDER[shownMode] ? 1 : -1;
    let cancelled = false;
    modePhase.current = 'out';
    // grid out (may be cut short by an unmount when "All" has no grid — that's fine)
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideX, { toValue: -dir * SLIDE_DX, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start();
    // title + tile-value crossfade — independent; also drives the mode swap at its midpoint
    Animated.timing(titleFade, { toValue: 0, duration: motion.duration.fast, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
      .start(({ finished }) => {
        if (!finished || cancelled) return;
        modePhase.current = 'in';
        setShownMode(calMode);
        slideX.setValue(dir * SLIDE_DX);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(slideX, { toValue: 0, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
        Animated.timing(titleFade, { toValue: 1, duration: motion.duration.base, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
          .start(({ finished: done }) => { if (done) modePhase.current = 'idle'; });
      });
    return () => { cancelled = true; };
  }, [calMode, shownMode, reduced, fade, slideX, titleFade]);

  // Crossfade the category sections when the coach switches list filter (All ↔ Recommended ↔
  // Urgent ↔ Available): fade the current sections out, swap, then fade + settle the new ones in.
  // The chips + count caption update instantly; only the sections lag. Reduced motion → instant.
  React.useEffect(() => {
    if (catFilter === shownCat) {
      // Caught up. If a fade-OUT was interrupted by a quick tap back, the content is identical
      // again — restore full opacity so the list can't stay stuck mid-fade.
      if (listPhase.current === 'out') {
        listPhase.current = 'idle';
        listFade.stopAnimation();
        listFade.setValue(1);
        listY.setValue(0);
      }
      return;
    }
    if (reduced) { setShownCat(catFilter); listFade.setValue(1); listY.setValue(0); return; }
    let cancelled = false;
    listPhase.current = 'out';
    Animated.timing(listFade, { toValue: 0, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true })
      .start(({ finished }) => {
        if (!finished || cancelled) return;
        listPhase.current = 'in';
        setShownCat(catFilter);
        listY.setValue(8);
        Animated.parallel([
          Animated.timing(listFade, { toValue: 1, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(listY, { toValue: 0, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start(({ finished: done }) => { if (done) listPhase.current = 'idle'; });
      });
    return () => { cancelled = true; };
  }, [catFilter, shownCat, reduced, listFade, listY]);

  // Animate the grid height so the day-list below slides rather than snaps between the 1-row week
  // strip and the ~5-row month grid. First measure (and reduced motion) set it instantly.
  const onGridLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (!h || h === lastH.current) return;
    lastH.current = h;
    if (!measured) { gridH.setValue(h); setMeasured(true); return; }
    if (reduced) { gridH.setValue(h); return; }
    Animated.timing(gridH, { toValue: h, duration: motion.duration.base, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
  };

  // Page the week strip (swipe). Same slide + fade language; reduced motion → instant.
  const goWeek = (dir: number) => {
    if (reduced) { setWeekOffset((o) => o + dir); return; }
    Animated.parallel([
      Animated.timing(weekFade, { toValue: 0, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(weekX, { toValue: -dir * SLIDE_DX, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setWeekOffset((o) => o + dir);
      weekX.setValue(dir * SLIDE_DX);
      Animated.parallel([
        Animated.timing(weekFade, { toValue: 1, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(weekX, { toValue: 0, duration: motion.duration.base, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  };
  const goWeekRef = React.useRef(goWeek);
  goWeekRef.current = goWeek;
  const weekPan = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) < 40 && Math.abs(g.vx) < 0.3) return;
        goWeekRef.current(g.dx < 0 ? 1 : -1);
      },
    })
  ).current;

  // Page the month grid prev/next — same slide + fade language as the week pager; reduced → instant.
  const goMonth = (dir: number) => {
    if (reduced) { setMonthOffset((o) => o + dir); return; }
    Animated.parallel([
      Animated.timing(monthFade, { toValue: 0, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(monthX, { toValue: -dir * SLIDE_DX, duration: motion.duration.fast, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setMonthOffset((o) => o + dir);
      monthX.setValue(dir * SLIDE_DX);
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
        if (Math.abs(g.dx) < 40 && Math.abs(g.vx) < 0.3) return;
        goMonthRef.current(g.dx < 0 ? 1 : -1);
      },
    })
  ).current;

  const wk = weekData(weekOffset);
  const mo = monthData(monthOffset);
  // Applied counts per period (runtime — depends on the live `applied` set). The mock data is
  // June-only, so a paged-away month reports 0 applied.
  const appliedThisWeek = wk.days.reduce((s, d) => s + (d.isJune ? openOn(d.dom).filter((o) => applied.has(keyOf(o))).length : 0), 0);
  const appliedThisMonth = mo.isData ? OPEN.filter((o) => applied.has(keyOf(o))).length : 0;
  const daySessions = openOn(selectedDate);

  // List-view refine filter (Distance + Availability) — narrows WITHIN the category sections, so
  // the chip counts + sections reflect it. Status depends on the live `applied` set, hence here.
  const passes = (a: Avail) =>
    (distMax == null || a.km <= distMax) &&
    (statusFilter === 'all' || (statusFilter === 'applied') === applied.has(keyOf(a)));
  const visByCat: Record<Category, Avail[]> = {
    recommended: LIST_BY_CAT.recommended.filter(passes),
    urgent: LIST_BY_CAT.urgent.filter(passes),
    available: LIST_BY_CAT.available.filter(passes),
  };
  const totalVisible = visByCat.recommended.length + visByCat.urgent.length + visByCat.available.length;
  const refineActive = distMax != null || statusFilter !== 'all';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANVAS }} edges={['top', 'left', 'right']}>
      <Reveal loading={loading} skeleton={<DisponiblesSkeleton />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp.xl + tabBarInset }}
      >
        {/* ===== Header — title left, notifications + profile right (per the locked IA) ===== */}
        <View style={st.appbar}>
          <View style={{ flex: 1 }}>
            <Text style={st.eyebrow}>{copy.availableScreen.eyebrow}</Text>
            <Text style={st.title} numberOfLines={1}>{copy.availableScreen.title}</Text>
          </View>
          <Pressable style={st.iconBtn} hitSlop={6} onPress={() => setNotifOpen(true)} accessibilityLabel={copy.header.notificationsA11y}>
            <Bell size={22} color={ON_CANVAS} fill={ON_CANVAS} />
            <View style={st.badgeDot} />
          </Pressable>
          <Pressable style={st.avatarWrap} hitSlop={6} onPress={() => setProfileOpen(true)} accessibilityLabel={copy.header.profileA11y}>
            <ProfileAvatar size={42} />
          </Pressable>
        </View>

        {/* ===== Near-you summary — count derived from the open set ===== */}
        <View style={st.nearRow}>
          <MapPin size={15} color={ON_CANVAS_2} />
          <Text style={st.near}>
            <Text style={st.nearCount}>{OPEN.length} </Text>
            {copy.availableScreen.nearSuffix}
          </Text>
        </View>

        {/* ===== Calendar — Week / Month (copied from Home) ===== */}
        <View style={st.section}>
          {/* Tiles stay put on a Week/Month switch — only the figures inside crossfade (ease
              in/out via titleFade; the value swaps at the fade's midpoint, masked). */}
          <CalSummary
            open={shownMode === 'week' ? wk.openTotal : mo.openTotal}
            applied={shownMode === 'week' ? appliedThisWeek : appliedThisMonth}
            valueOpacity={titleFade}
          />

          {/* Period toggle (filled pill) + refine-filter icon to its right. The refine filter
              acts on the List ("All") only, so it's grayed + unclickable on Week / Month. */}
          <View style={st.toggleRow}>
            <Segmented
              value={calMode}
              onChange={(m) => {
                setCalMode(m);
                if (m === 'week') {
                  setWeekOffset(0);
                  if (selectedDate < 8 || selectedDate > 14) setSelectedDate(firstOpenDom);
                } else if (m === 'month') {
                  setMonthOffset(0); // entering Month → back to the current month
                }
              }}
              options={[
                { value: 'week' as const, label: copy.availableScreen.cal.seg.week },
                { value: 'month' as const, label: mo.name }, // tracks the paged month
                { value: 'all' as const, label: copy.availableScreen.cal.seg.all },
              ]}
              accessibilityLabel={copy.availableScreen.cal.toggleA11y}
              variant="pill"
              theme={{ track: SUBTLE, selected: palette.neutral[900] }}
              style={{ flex: 1 }}
            />
            <Pressable
              style={[
                st.filterIconBtn,
                calMode === 'all' && refineActive && st.filterIconBtnOn,
                calMode !== 'all' && st.filterIconBtnDisabled,
              ]}
              disabled={calMode !== 'all'}
              onPress={() => setFilterOpen(true)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityState={{ disabled: calMode !== 'all', expanded: filterOpen }}
              accessibilityLabel={copy.availableScreen.filter.title}
            >
              <SlidersHorizontal size={18} color={calMode === 'all' && refineActive ? color.onAction : ON_CANVAS} />
            </Pressable>
          </View>

          {/* calendar header chrome — week range + prev/next (week) or month label + nav (month).
              Sits OUTSIDE the height-animated grid wrapper so it never perturbs the gridH tween;
              crossfades on the mode switch via titleFade (same driver as the tiles). */}
          {shownMode === 'week' ? (
            <Animated.View style={{ opacity: titleFade }}>
              <WeekNav label={wk.eyebrow} onPrev={() => goWeek(-1)} onNext={() => goWeek(1)} prevDisabled={false} nextDisabled={false} labelFade={weekFade} />
            </Animated.View>
          ) : null}
          {shownMode === 'month' ? (
            <Animated.View style={{ opacity: titleFade }}>
              <MonthNav label={mo.label} onPrev={() => goMonth(-1)} onNext={() => goMonth(1)} labelFade={monthFade} />
            </Animated.View>
          ) : null}

          {/* grid (Week / Month only — "All" is a flat list with no calendar). Outer wrapper
              animates height + clips the slide; inner slides + fades on switch. */}
          {shownMode !== 'all' ? (
            <Animated.View style={[measured && { height: gridH }, { overflow: 'hidden' }]}>
              <Animated.View style={{ opacity: fade, transform: [{ translateX: slideX }] }} onLayout={onGridLayout}>
                {shownMode === 'week'
                  ? <WeekView days={wk.days} selected={selectedDate} onSelect={setSelectedDate} fade={weekFade} x={weekX} pan={weekPan.panHandlers} />
                  : <MonthView days={mo.days} lead={mo.lead} selected={selectedDate} onSelect={setSelectedDate} fade={monthFade} x={monthX} pan={monthPan.panHandlers} />}
              </Animated.View>
            </Animated.View>
          ) : null}
        </View>

        {/* ===== Sessions — categorised List view in "All" (PLA-15), else the selected day's ===== */}
        {shownMode === 'all' ? (
          <View style={{ marginTop: sp.md }}>
            {/* category filter — All + the three buckets. Counts reflect the live refine filter
                (set via the icon by the toggle above), so they stay honest about what's shown. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={st.filterRow}
              accessibilityLabel={copy.availableScreen.list.filterA11y}
            >
              <CatChip
                label={copy.availableScreen.list.cats.all}
                count={totalVisible}
                selected={catFilter === 'all'}
                onPress={() => setCatFilter('all')}
              />
              {CAT_ORDER.map((c) => (
                <CatChip
                  key={c}
                  label={copy.availableScreen.list.cats[c]}
                  count={visByCat[c].length}
                  selected={catFilter === c}
                  onPress={() => setCatFilter(c)}
                />
              ))}
            </ScrollView>

            {/* total for the period (PLA-15) — "8 open this month", or "4 of 8 shown" once a
                refine filter narrows it. Distinct from the chips: it states the month framing. */}
            <Text style={st.listCount}>
              {refineActive
                ? `${totalVisible} ${copy.availableScreen.list.count.of} ${OPEN.length} ${copy.availableScreen.list.count.shown}`
                : `${totalVisible} ${copy.availableScreen.list.count.period}`}
            </Text>

            {/* sections crossfade on a filter switch (shownCat lags catFilter by one fade) */}
            <Animated.View style={{ opacity: listFade, transform: [{ translateY: listY }] }}>
              {/* all buckets when "All", else just the chosen one (empty ones skipped) */}
              {CAT_ORDER.filter((c) => shownCat === 'all' || shownCat === c).map((c) =>
                visByCat[c].length ? (
                  <CatSection
                    key={c}
                    cat={c}
                    items={visByCat[c]}
                    applied={applied}
                    onToggle={toggle}
                    onOpen={setSelected}
                  />
                ) : null,
              )}

              {/* nothing matches — the chosen bucket, or the whole list under the refine filter */}
              {(shownCat === 'all' ? totalVisible === 0 : visByCat[shownCat].length === 0) ? (
                <View style={st.group}>
                  <Text style={st.emptyTitle}>{refineActive ? copy.availableScreen.emptyFiltered : copy.availableScreen.list.empty}</Text>
                  {refineActive ? (
                    <Pressable onPress={clearRefine} style={st.clearBtn} accessibilityRole="button" accessibilityLabel={copy.availableScreen.clearFilters}>
                      <Text style={st.clearTxt}>{copy.availableScreen.clearFilters}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </Animated.View>
          </View>
        ) : (shownMode === 'week' ? wk.openTotal === 0 : mo.openTotal === 0) ? (
          // whole shown week / month has no open sessions (PLA-04 / PLA-05) — reachable now the
          // calendar pages freely past the seeded period
          <View style={st.group}>
            <EmptyState message={copy.availableScreen.cal.periodEmpty} />
          </View>
        ) : (
          <View style={st.group}>
            <Text style={st.groupLabel}>{dayLabel(selectedDate)}</Text>
            {daySessions.length === 0 ? (
              <EmptyState />
            ) : (
              daySessions.map((a, i) => (
                <AvailCard
                  key={keyOf(a)}
                  a={a}
                  applied={applied.has(keyOf(a))}
                  first={i === 0}
                  onToggle={() => toggle(a)}
                  onOpen={() => setSelected(a)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
      </Reveal>

      {/* card raise-hand / withdraw confirmation — floats above the tab bar (PLA-07) */}
      <Toast content={screenToast.content} anim={screenToast.a} bottom={tabBarInset + sp.md} />

      <AvailDetail
        a={selected}
        applied={selected ? applied.has(keyOf(selected)) : false}
        onToggle={() => selected && flip(selected)}
        onClose={() => setSelected(null)}
      />
      <FilterSheet
        visible={filterOpen}
        reduced={reduced}
        distMax={distMax}
        status={statusFilter}
        count={totalVisible}
        onDist={setDistMax}
        onStatus={setStatusFilter}
        onReset={clearRefine}
        onClose={() => setFilterOpen(false)}
      />
      <NotificationCenter visible={notifOpen} onClose={() => setNotifOpen(false)} />
      <ProfileScreen visible={profileOpen} onClose={() => setProfileOpen(false)} />
    </SafeAreaView>
  );
}

/* ---------- styles ----------
   Polarity legend:
   · on the CANVAS        -> ON_CANVAS / ON_CANVAS_2
   · inside the dark CARD  -> ON_CARD / ON_CARD_2 (light)
*/

const st = StyleSheet.create({
  /* header */
  appbar: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingTop: sp.sm, paddingBottom: sp.sm },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2 },
  title: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: ON_CANVAS, marginTop: 2 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  badgeDot: {
    position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 999,
    backgroundColor: color.action, borderWidth: 2, borderColor: CANVAS,
  },
  avatarWrap: {
    shadowColor: palette.bleu[300], shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },

  /* near-you summary */
  nearRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp.xs },
  near: { fontFamily: F.body, fontSize: 14, color: ON_CANVAS_2 },
  nearCount: { fontFamily: F.bodyB, color: ON_CANVAS },

  /* calendar section */
  section: { marginTop: sp.xl },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  secTitle: { fontFamily: F.oswR, fontSize: 16, letterSpacing: 0.9, color: ON_CANVAS_2 },
  secRight: { fontFamily: F.bodyS, fontSize: 14, color: ON_CANVAS_2 },

  /* metric tiles (Open / Applied) — raised ink surface, accent only in the icon chip + figure */
  tileRow: { flexDirection: 'row', gap: sp.sm },
  tile: { flex: 1, borderRadius: r.lg, padding: sp.md, gap: 2, borderWidth: 1, borderColor: RAISED_BORDER },
  tileLabel: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2 },
  // tinted icon chip pinned to the top-right corner (matches the Home calendar tiles)
  tileChip: { position: 'absolute', top: sp.md, right: sp.md, width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tileNumWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  tileNum: { fontFamily: F.display, fontSize: 30, color: ON_CANVAS },
  tileUnit: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2 },

  /* week strip — swipe left/right to page weeks */
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', gap: 2 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayMuted: { opacity: 0.4 },
  dayD: { fontFamily: F.body, fontSize: 13, letterSpacing: 0.2, color: ON_CANVAS_2 },
  dayNumWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  dayNumSel: { backgroundColor: color.action },
  dayN: { fontFamily: F.oswM, fontSize: 20, color: ON_CANVAS },
  dayNSelText: { color: color.onAction },
  load: { flexDirection: 'row', gap: 3, marginTop: 6, minHeight: 5 },
  loadDot: { width: 5, height: 5, borderRadius: 999, backgroundColor: color.action },

  /* month grid — 7-column calendar; one red dot marks days with open sessions */
  moHead: { flexDirection: 'row', marginBottom: sp.xs },
  moHeadTxt: { width: '14.2857%', textAlign: 'center', fontFamily: F.body, fontSize: 13, letterSpacing: 0.2, color: ON_CANVAS_2 },
  moGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  moCellWrap: { width: '14.2857%', alignItems: 'center', paddingVertical: 2 },
  moCell: { alignItems: 'center' },
  moNumWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  moNumSel: { backgroundColor: color.action },
  moNumSelText: { color: color.onAction },
  moNum: { fontFamily: F.oswM, fontSize: 15, color: ON_CANVAS },
  moDotRow: { flexDirection: 'row', gap: 3, marginTop: 4, minHeight: 5, alignItems: 'center' },

  /* calendar header chrome — week range / month label + prev-next chevrons */
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  calNavBtn: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: SUBTLE, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  calNavBtnOff: { opacity: 0.45 }, // disabled chevrons at the June boundary (June-only preview)
  calNavLabel: { flex: 1, textAlign: 'center', fontFamily: F.oswS, fontSize: 14, letterSpacing: 0.8, color: ON_CANVAS },

  /* groups (selected-day list) */
  group: { marginTop: sp.lg },
  groupLabel: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2, marginBottom: sp.xs },

  /* period toggle (pill) + refine-filter icon row */
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.md, marginBottom: sp.md },
  filterIconBtn: {
    width: 44, height: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: SUBTLE,
  },
  filterIconBtnOn: { backgroundColor: color.action, borderColor: color.action },
  filterIconBtnDisabled: { opacity: 0.4 },

  /* list-view category filter (the "All" tab) */
  filterRow: { gap: sp.sm, paddingVertical: sp.xs, paddingRight: sp.lg },
  listCount: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, marginTop: sp.sm },
  chipF: {
    flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: r.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: SUBTLE,
  },
  chipFOn: { backgroundColor: color.action, borderColor: color.action },
  chipFTxt: { fontFamily: F.bodyS, fontSize: 13, color: ON_CANVAS_2 },
  chipFTxtOn: { color: color.onAction },
  chipFCount: {
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)',
  },
  chipFCountOn: { backgroundColor: 'rgba(255,255,255,0.24)' },
  chipFCountTxt: { fontFamily: F.bodyB, fontSize: 11, color: ON_CANVAS_2 },
  chipFCountTxtOn: { color: color.onAction },

  /* list-view category section header */
  catBlock: { marginTop: sp.lg },
  catHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: sp.xs },
  catIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  catTitle: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1 }, // colour set inline per category
  catCount: { fontFamily: F.bodyB, fontSize: 13, color: ON_CANVAS_2 },

  /* card date + urgency countdown eyebrow (list view only) */
  cardEyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.sm, marginBottom: 4 },
  cardDate: { flex: 1, fontFamily: F.oswS, fontSize: 12, letterSpacing: 0.8, color: ON_CARD_2 },
  urgencyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: r.pill, backgroundColor: CAT_META.urgent.bg,
  },
  urgencyTxt: { fontFamily: F.bodyS, fontSize: 12, color: CAT_META.urgent.fg },

  /* open-session row — flat, matching the Séances list (hairline divider between rows) */
  card: { paddingVertical: sp.md },
  cardFirst: { paddingTop: sp.xs },   // first card hugs its day/category label (tighter red gap)
  cardDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm },
  headerTap: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: sp.md },
  timeRail: { width: 52, alignItems: 'flex-start' },
  railTime: { fontFamily: F.oswB, fontSize: 18, color: ON_CARD },
  railEnd: { fontFamily: F.body, fontSize: 12, color: palette.neutral[400], marginTop: 1 },
  cardBody: { flex: 1 },
  bodyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.sm },
  place: { flex: 1, fontFamily: F.bodyS, fontSize: 18, color: ON_CARD },
  // bottom tag row — urgency · session type · applied, grouped on one wrapping line below the meta
  // so the date + place-name rows stay uncluttered.
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: sp.sm, marginTop: 8 },
  // session-type tag (first visit) — blue, matches the detail context chip; sits in the tag row.
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, backgroundColor: INK.info.bg },
  typeTagTxt: { fontFamily: F.body, fontSize: 12, color: INK.info.fg },
  // applied status as a compact pill (card tag row) — same shape as the type / urgency tags so the
  // row reads as one set; green, matching AppliedChip's fuller detail-sheet form.
  appliedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: r.pill, backgroundColor: INK.applied.bg },
  appliedTagTxt: { fontFamily: F.bodyS, fontSize: 12, color: INK.applied.fg },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  meta: { fontFamily: F.body, fontSize: 14, color: ON_CARD_2 },
  appliedNote: { fontFamily: F.body, fontSize: 13, color: INK.applied.fg, marginTop: sp.sm },

  /* chip */
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill },
  chipTxt: { fontFamily: F.body, fontSize: 12 },

  /* detail-page tag row (session context + applied status, under the title) */
  dChips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: sp.sm, marginTop: sp.sm },
  contextChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill, backgroundColor: INK.info.bg },
  contextTxt: { fontFamily: F.body, fontSize: 12, color: INK.info.fg },

  /* circular action on the right of the row (≥44 touch target) */
  actionCircle: { width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  applyCircle: {
    backgroundColor: color.action,
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  withdrawCircle: { borderWidth: 1.5, borderColor: palette.neutral[600] },

  /* empty state (selected day with no open sessions) */
  empty: { alignItems: 'center', paddingTop: sp.lg, paddingHorizontal: sp.lg },
  emptyIcon: {
    width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE, marginBottom: sp.md,
  },
  emptyTitle: { fontFamily: F.body, fontSize: 14, color: ON_CANVAS_2, textAlign: 'center' },

  /* ----- session detail (pageSheet) ----- */
  dHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  dHeaderTitle: { fontFamily: F.oswS, fontSize: 22, color: ON_CANVAS },
  dClose: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: SUBTLE },
  dPlace: { fontFamily: F.bodyB, fontSize: 26, color: ON_CANVAS },
  dCard: { backgroundColor: CARD, borderRadius: r.xl, paddingHorizontal: sp.lg, marginTop: sp.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  dRowDivider: { borderTopWidth: 1, borderTopColor: DIVIDER },
  dRowIcon: { width: 24, alignItems: 'center' },
  dRowLabel: { fontFamily: F.body, fontSize: 12, color: palette.neutral[500] },
  dRowValue: { fontFamily: F.bodyS, fontSize: 15, color: ON_CARD, marginTop: 2 },
  dCopyBtn: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },

  /* over-limit travel warning banner (detail page) — amber, non-blocking, text-backed (not colour-alone) */
  warnBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm, marginTop: sp.lg, padding: sp.md, borderRadius: r.lg, backgroundColor: WARN.bg, borderWidth: 1, borderColor: WARN.border },
  warnTitle: { fontFamily: F.bodyS, fontSize: 14, color: WARN.fg },
  warnBody: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, marginTop: 2, lineHeight: 18 },

  /* full-width apply / withdraw buttons (detail page) */
  applyWrap: {
    borderRadius: r.pill,
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  applyBtn: {
    minHeight: 48, borderRadius: r.pill, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', backgroundColor: color.action,
  },
  applyTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
  withdrawBtn: {
    minHeight: 48, borderRadius: r.pill, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  withdrawTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD },

  /* ----- refine-filter sheet (Distance + Availability) ----- */
  sheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: CANVAS, borderTopLeftRadius: r.xl, borderTopRightRadius: r.xl,
    paddingHorizontal: sp.lg, paddingTop: sp.sm, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 999, backgroundColor: palette.neutral[600], marginTop: 6, marginBottom: sp.md },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.md },
  sheetTitle: { fontFamily: F.oswS, fontSize: 20, color: ON_CANVAS },
  sheetClose: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: SUBTLE },
  sheetLabel: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2, marginBottom: sp.sm },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  opt: {
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: r.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: SUBTLE,
  },
  optOn: { backgroundColor: color.action, borderColor: color.action },
  optTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CANVAS },
  optTxtOn: { color: color.onAction },
  sheetFooter: { flexDirection: 'row', alignItems: 'center', gap: sp.md, marginTop: sp.xl },
  resetBtn: { paddingVertical: 12, paddingHorizontal: sp.sm },
  resetTxt: { fontFamily: F.bodyS, fontSize: 15, color: ON_CANVAS_2 },
  showBtn: {
    flex: 1, minHeight: 50, borderRadius: r.pill, backgroundColor: color.action,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  showBtnDisabled: { backgroundColor: SUBTLE, shadowOpacity: 0 },
  showTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
  showTxtDisabled: { color: ON_CANVAS_2 },

  /* "no matches" → clear the refine filter */
  clearBtn: {
    alignSelf: 'flex-start', marginTop: sp.md, paddingVertical: 10, paddingHorizontal: sp.md,
    borderRadius: r.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  clearTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CANVAS },

  /* "Address copied" toast (detail page) — elevated dark pill, centred above the safe area */
  toastWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: r.pill, backgroundColor: SUBTLE, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  toastTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CANVAS },
});
