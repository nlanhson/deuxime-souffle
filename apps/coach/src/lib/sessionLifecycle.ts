/**
 * Session lifecycle — the WBS time-derived status (PLA-14 §7/§8): a session is Upcoming before it
 * starts, In progress between start and end, and Completed once the end time has passed. Derived
 * from the clock so the displayed status updates dynamically (see useNow), rather than being a
 * static field.
 *
 * This is the *temporal* axis. It's separate from the coach's *workflow* status (check-in open /
 * confirmed / checked-in / report due / report sent), which drives the contextual CTAs.
 */
export type Lifecycle = 'upcoming' | 'inProgress' | 'completed';

/** Concrete start/end Date for a session, given the day it falls on and "HH:MM" strings. */
export function sessionStartEnd(dayDate: Date, start: string, end: string): { start: Date; end: Date } {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const s = new Date(dayDate); s.setHours(sh, sm, 0, 0);
  let e = new Date(dayDate); e.setHours(eh, em, 0, 0);
  if (e.getTime() <= s.getTime()) e = new Date(e.getTime() + 24 * 60 * 60 * 1000); // overnight guard
  return { start: s, end: e };
}

export function lifecycleOf(start: Date, end: Date, now: Date): Lifecycle {
  const t = now.getTime();
  if (t < start.getTime()) return 'upcoming';
  if (t <= end.getTime()) return 'inProgress';
  return 'completed';
}
