/**
 * Availability & travel store (WBS PLA-08 / S18) — the single source of truth the matching
 * algorithm (E05) leans on: weekly half-day schedule, max travel time, transport mode, departure
 * addresses, and the freshness clock.
 *
 * Why a module-level store rather than per-screen state: the same availability is edited from the
 * dedicated "Mes disponibilités" screen (M1), summarised on Profile, and reachable from a session
 * detail — and Profile itself is mounted independently under each tab (Accueil / Séances /
 * Disponibles). A shared store keeps every one of those views in sync from one edit. It uses
 * React's useSyncExternalStore, so any subscribed component re-renders on change with no provider
 * wiring. Real code swaps the in-memory state for the backend (read on load, PATCH on save).
 */
import React from 'react';
import type { HalfDayValue } from '../components/HalfDayScheduleSheet';

// Travel-time slider bounds (WBS PLA-08: a slider, 10–90 minutes — not a preset list).
export const TRAVEL = { min: 10, max: 90, step: 5 } as const;

/**
 * Authorized zones (DT-16 revised, 2026-06-22) — the coach hand-picks the départements they want to
 * work in as a priority. NOT a hard filter: the coach can still receive proposals in other areas
 * (free to accept each one); the matching algorithm's "proximity" criterion simply favours these.
 * A preselected list, so the value stays clean for the algorithm + analytics. `code` is the French
 * département number (idiomatic shorthand, e.g. 75 = Paris).
 */
export const ZONE_OPTIONS: { code: string; name: string }[] = [
  { code: '75', name: 'Paris' },
  { code: '92', name: 'Hauts-de-Seine' },
  { code: '93', name: 'Seine-Saint-Denis' },
  { code: '94', name: 'Val-de-Marne' },
  { code: '95', name: 'Val-d’Oise' },
  { code: '77', name: 'Seine-et-Marne' },
  { code: '78', name: 'Yvelines' },
  { code: '91', name: 'Essonne' },
];

// After this many days the availability is treated as stale and the freshness nudge appears.
export const STALE_AFTER_DAYS = 3;

/** The four transport modes (mockup "dispos coach v5" screen 3). Stored as a stable key; the
 *  display label comes from copy via `transportLabel`. */
export type TransportMode = 'voiture' | '2roues' | 'velo' | 'transports';
export const TRANSPORT_MODES: readonly TransportMode[] = ['voiture', '2roues', 'velo', 'transports'];

/** A postal address, split for the per-field form (mockup screens 4/5). */
export type Address = { rue: string; cp: string; ville: string };

/**
 * A secondary departure address scoped to specific weekdays (mockup screen 5) — for a coach who
 * leaves from somewhere else on certain days (garde alternée, second home…). On those days the
 * matching reads this address instead of the primary one; every other day uses the primary.
 */
export type SecondaryAddress = Address & { days: string[] };

/** A time-off period (mockup screen 12) — a named span the coach is unavailable. Dates are stored
 *  as display strings in the prototype (a real picker would store ISO). */
export type TimeOffPeriod = { id: string; label: string; start: string; end: string };

/**
 * A fine time-slot (créneau précis — "dispos coach v5" screens 7🎯/8/9/10). Inside an OPEN half-day,
 * a precise window the coach is actually available, optionally restricted to a subset of zones with
 * its own travel cap. The matching rule: a half-day with NO fine slots stays fully open ("rapide"
 * mode); a half-day with ≥1 fine slot is available ONLY inside those windows — a session must (2) fall
 * inside a window AND (3) its EHPAD zone must be allowed on that window. Example (Marie): Mon 14:00–15:00
 * is Paris-only (just after a private client there); 15:30–17:00 opens up to 75/92/94.
 */
export type FineSlot = {
  id: string;
  start: string; // 'HH:MM' on the 30-min grid
  end: string; // 'HH:MM', after start
  /** Allowed départements for this window (subset of the coach's zones). Empty = all the coach's zones. */
  zones: string[];
  /** This window's travel cap — overrides the default + any per-slot departure point radius. */
  travelMin: number;
};

/** Fine slots keyed by `${day}_${half}` (e.g. 'Lun_pm'); value = the windows for that half-day, ordered. */
export type FineSlotMap = Record<string, FineSlot[]>;

export type AvailabilityData = {
  slots: HalfDayValue;
  /** Default max travel time (PLA-08 slider, 10–90 min) — the radius from the departure address. */
  travelMin: number;
  /** Transport mode (mockup screen 3) — one of the four fixed modes. */
  transport: TransportMode;
  /** Primary departure address — the default for any day the secondary address doesn't claim. */
  primaryAddress: Address;
  /** Optional secondary address for specific weekdays (mockup screen 5); null = single address. */
  secondaryAddress: SecondaryAddress | null;
  /** Fine time-slots (v5) keyed by `${day}_${half}`. A half-day absent here is fully open;
   *  present → available only inside its windows (the matching narrows to those). */
  fineSlots: FineSlotMap;
  /** Authorized zones — département codes (see ZONE_OPTIONS) the coach prioritises. A soft
   *  preference the matching favours, not a hard filter. */
  zones: string[];
  /** Time-off periods (mockup screen 12) — spans the coach is unavailable. */
  timeOff: TimeOffPeriod[];
};

type AvailabilityState = {
  av: AvailabilityData;
  /** Days since the coach last edited or confirmed — drives the staleness nudge. */
  updatedDaysAgo: number;
};

const INITIAL: AvailabilityState = {
  av: {
    slots: {
      Lun: { am: true, pm: true },
      Mar: { am: true, pm: true },
      Mer: { am: true, pm: false },
      Jeu: { am: true, pm: true },
      Ven: { am: false, pm: true },
      Sam: { am: false, pm: false },
      Dim: { am: false, pm: false },
    },
    travelMin: 45,
    transport: 'voiture',
    // Île-de-France seed (coherent with the 75/92/94 zones below + the v5 mockup): primary in
    // Saint-Maur (94); secondary in Paris 12 on Thursdays/Fridays (a garde-alternée example).
    primaryAddress: { rue: '15 rue de Vaugirard', cp: '94100', ville: 'Saint-Maur' },
    secondaryAddress: { rue: '8 rue Daumesnil', cp: '75012', ville: 'Paris 12', days: ['Jeu', 'Ven'] },
    // Seeded fine slots (v5 example) — Monday & Thursday afternoons are detailed: Mon 14:00–15:00 is
    // Paris-only then opens to 75/92/94 at 15:30 (a 15:00–15:30 gap left on purpose); Thu 14:00–16:30
    // stays Paris-only. Every other open half-day has no fine slots = fully open ("rapide").
    fineSlots: {
      Lun_pm: [
        { id: 'f1', start: '14:00', end: '15:00', zones: ['75'], travelMin: 30 },
        // [] = all the coach's zones (Marie opens up after 15:30) — adapts if she edits her zones.
        { id: 'f2', start: '15:30', end: '17:00', zones: [], travelMin: 45 },
      ],
      Jeu_pm: [{ id: 'f3', start: '14:00', end: '16:30', zones: ['75'], travelMin: 30 }],
    },
    // Seeded zones (match the picker mock) — Paris + two close départements.
    zones: ['75', '92', '94'],
    // Seeded time off (mockup screen 12) — a summer-holiday span the coach can edit or remove.
    timeOff: [{ id: 't1', label: 'Congés d’été', start: '4 août 2026', end: '15 août 2026' }],
  },
  updatedDaysAgo: 6,
};

let state: AvailabilityState = INITIAL;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};
// getSnapshot must be referentially stable between changes (state is only replaced on mutation),
// otherwise useSyncExternalStore loops.
const getSnapshot = () => state;

/** Patch the availability; any edit also resets the freshness clock (the matching-freshness loop). */
export function editAvailability(patch: Partial<AvailabilityData>) {
  state = { av: { ...state.av, ...patch }, updatedDaysAgo: 0 };
  emit();
}

/** Confirm "still up to date" without changing anything — just clears the stale nudge. */
export function markAvailabilityFresh() {
  if (state.updatedDaysAgo === 0) return;
  state = { ...state, updatedDaysAgo: 0 };
  emit();
}

/**
 * Format the half-day slots for a one-line summary: full day → "Mon"; one half → "Mon (am)".
 * The (am)/(pm) tags are data formatting (like dates/km), composed in-component.
 */
export function formatSlots(slots: HalfDayValue, order: readonly string[], notSet: string): string {
  const parts = order
    .map((d) => {
      const s = slots[d];
      if (!s || (!s.am && !s.pm)) return null;
      if (s.am && s.pm) return d;
      return `${d} (${s.am ? 'matin' : 'aprèm'})`;
    })
    .filter(Boolean);
  return parts.length ? parts.join(' · ') : notSet;
}

/**
 * One-line summary of the authorized zones for the row value, e.g. "75 · 92 · 94" (département codes,
 * the idiomatic shorthand). Empty → the `none` label. Formatting only, composed in-screen like the
 * other summaries; the picker sheet shows the full "code + name" labels.
 */
export function formatZones(codes: string[], none: string): string {
  if (codes.length === 0) return none;
  // Keep ZONE_OPTIONS order regardless of pick order, so the summary reads consistently.
  return ZONE_OPTIONS.filter((z) => codes.includes(z.code)).map((z) => z.code).join(' · ');
}

/* ---------- transport + addresses (mockup screens 3/4/5) ---------- */

/** Copy-driven labels for the four transport modes (kept out of the data layer). */
export type TransportLabels = { car: string; twoWheel: string; velo: string; transports: string };
export function transportLabel(mode: TransportMode, l: TransportLabels): string {
  switch (mode) {
    case 'voiture': return l.car;
    case '2roues': return l.twoWheel;
    case 'velo': return l.velo;
    case 'transports': return l.transports;
  }
}

/** One-line postal address, e.g. "15 rue de Vaugirard, 94100 Saint-Maur" (summaries + a11y). */
export function addressLine(a: Address): string {
  const cpVille = [a.cp, a.ville].filter(Boolean).join(' ');
  return [a.rue, cpVille].filter(Boolean).join(', ').trim();
}

/**
 * The matching read that replaces the old per-slot points: which address the coach leaves from on a
 * given weekday — the secondary address on its claimed days, otherwise the primary.
 */
export function addressForDay(av: AvailabilityData, day: string): Address {
  if (av.secondaryAddress && av.secondaryAddress.days.includes(day)) return av.secondaryAddress;
  return av.primaryAddress;
}

/** One-line summary of selected weekdays in week order, e.g. "Jeu · Ven"; empty → the none label. */
export function formatDays(days: string[], order: readonly string[], none: string): string {
  const picked = order.filter((d) => days.includes(d));
  return picked.length ? picked.join(' · ') : none;
}

/** Active half-days count (0–14) — the hub "N demi-journées actives" summary + the potential calc. */
export function countActiveSlots(slots: HalfDayValue): number {
  let n = 0;
  for (const k of Object.keys(slots)) {
    if (slots[k]?.am) n += 1;
    if (slots[k]?.pm) n += 1;
  }
  return n;
}

/* ---------- time off (mockup screen 12) ---------- */

let timeOffSeq = 1; // seeded t1 — keep new ids clear of the seed
export function newTimeOff(label: string, start: string, end: string): TimeOffPeriod {
  timeOffSeq += 1;
  return { id: `t${timeOffSeq}`, label, start, end };
}

/* ---------- fine time-slots (créneaux précis — v5 screens 7🎯/8/9/10) ---------- */

// 30-min grid bounds per half-day (matches the mockup's pickers: morning 9–13h, afternoon 14–19h).
export const FINE = { am: { from: '09:00', to: '13:00' }, pm: { from: '14:00', to: '19:00' }, stepMin: 30 } as const;

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Display a stored 'HH:MM' as the French clock idiom: '14:00' → '14h', '14:30' → '14h30'. */
export const formatClock = (hhmm: string) => { const [h, m] = hhmm.split(':'); return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`; };

export const fineSlotKey = (day: string, half: 'am' | 'pm') => `${day}_${half}`;
export const fineSlotsFor = (av: AvailabilityData, day: string, half: 'am' | 'pm'): FineSlot[] =>
  av.fineSlots[fineSlotKey(day, half)] ?? [];
export const hasFineSlots = (av: AvailabilityData, day: string, half: 'am' | 'pm'): boolean =>
  fineSlotsFor(av, day, half).length > 0;

/** How many open half-days carry fine slots — drives the "N en détaillé" summary pill. */
export function countFineSlotDays(map: FineSlotMap): number {
  return Object.values(map).filter((a) => a.length > 0).length;
}

/** Start / end options for a half-day's 30-min grid. `ends` start one step after `from`. */
export function timeGrid(half: 'am' | 'pm'): { starts: string[]; ends: string[] } {
  const b = FINE[half];
  const from = toMin(b.from), to = toMin(b.to);
  const starts: string[] = [], ends: string[] = [];
  for (let t = from; t < to; t += FINE.stepMin) starts.push(toHHMM(t));
  for (let t = from + FINE.stepMin; t <= to; t += FINE.stepMin) ends.push(toHHMM(t));
  return { starts, ends };
}

let fineSeq = 3; // seeded f1..f3 — keep new ids clear of the seed
export function newFineSlot(start: string, end: string, zones: string[], travelMin: number): FineSlot {
  fineSeq += 1;
  return { id: `f${fineSeq}`, start, end, zones, travelMin };
}

/** Add (or replace, by id) a window under a half-day key, kept ordered by start time. */
export function withFineSlot(map: FineSlotMap, key: string, slot: FineSlot): FineSlotMap {
  const rest = (map[key] ?? []).filter((s) => s.id !== slot.id);
  return { ...map, [key]: [...rest, slot].sort((a, b) => a.start.localeCompare(b.start)) };
}

/** Remove a window; drops the half-day key entirely when its last window goes (→ back to "rapide"). */
export function withoutFineSlot(map: FineSlotMap, key: string, id: string): FineSlotMap {
  const next = (map[key] ?? []).filter((s) => s.id !== id);
  const copy = { ...map };
  if (next.length) copy[key] = next; else delete copy[key];
  return copy;
}

/** One window's allowed zones for a summary, e.g. "75 · 92 · 94"; empty → the "all zones" label. */
export function formatFineZones(slot: FineSlot, allLabel: string): string {
  if (slot.zones.length === 0) return allLabel;
  return ZONE_OPTIONS.filter((z) => slot.zones.includes(z.code)).map((z) => z.code).join(' · ');
}

/**
 * The matching read (rules 2 + 3) for a candidate session: is the coach available at `time` in `zone`
 * on this half-day? A half-day with no fine slots is fully open (rule 1 already satisfied upstream);
 * otherwise the session must fall inside a window AND that window must allow the zone. This is the
 * single source the algorithm would call — surfaced here so the editor and matching can't diverge.
 */
export function isSessionAllowed(av: AvailabilityData, day: string, half: 'am' | 'pm', time: string, zone: string): boolean {
  const slots = fineSlotsFor(av, day, half);
  if (slots.length === 0) return true;
  const t = toMin(time);
  return slots.some((s) => t >= toMin(s.start) && t < toMin(s.end) && (s.zones.length === 0 || s.zones.includes(zone)));
}

/**
 * Weekly session potential (item 5 / mockup "dispos coach v5") — a motivating read-out of how many
 * sessions/week the coach's availability could yield, shown as a gauge on the availability screen.
 * Mock derivation: a weighted "openness" score 0–1 — active half-days dominate, authorized zones
 * add a strong push, with max-travel and transport mode as minor nudges — scaled to a sessions/week
 * figure. Real code would also weigh zone density + historical fill rate. Derived live from the
 * whole availability, so editing any of those inputs moves the gauge (mockup screens 3/6/7 behaviour).
 */
// Relative reach per transport mode — a car opens the widest catchment, a bicycle the narrowest.
const TRANSPORT_REACH: Record<TransportMode, number> = { voiture: 1, '2roues': 0.8, transports: 0.5, velo: 0.45 };
const POTENTIAL_MAX_SESSIONS = 12; // a fully-open profile's headline figure (the gauge's full mark)
export function weeklyPotential(av: AvailabilityData): { sessions: number; ratio: number; level: 'low' | 'medium' | 'good' } {
  const slotCount = countActiveSlots(av.slots); // 0–14
  const zoneCount = av.zones.length; // 0–8
  const travelBonus = Math.max(0, Math.min(1, (av.travelMin - TRAVEL.min) / (TRAVEL.max - TRAVEL.min)));
  const transportBonus = TRANSPORT_REACH[av.transport] ?? 0.5;
  const ratio = Math.max(0, Math.min(1,
    (slotCount / 14) * 0.55 + (zoneCount / 8) * 0.3 + travelBonus * 0.08 + transportBonus * 0.07));
  const sessions = Math.round(ratio * POTENTIAL_MAX_SESSIONS);
  const level: 'low' | 'medium' | 'good' = ratio >= 0.66 ? 'good' : ratio >= 0.33 ? 'medium' : 'low';
  return { sessions, ratio, level };
}

export function useAvailability() {
  const snap = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    av: snap.av,
    updatedDaysAgo: snap.updatedDaysAgo,
    stale: snap.updatedDaysAgo > STALE_AFTER_DAYS,
    editAv: editAvailability,
    markFresh: markAvailabilityFresh,
  };
}
