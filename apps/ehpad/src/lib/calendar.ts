/** Grilles de calendrier (semaine qui commence le lundi) — date-fns + locale fr. */

import {
  addDays,
  addMonths,
  addWeeks,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export { addDays, addMonths, addWeeks, isSameDay, isSameMonth, isToday };

export const startOfWeekMonday = (d: Date): Date => startOfWeek(d, { weekStartsOn: 1 });

/** Index de jour 0 = lundi … 6 = dimanche. */
export const mondayIndex = (d: Date): number => (d.getDay() + 6) % 7;

/** Grille mensuelle : 4 à 6 semaines de 7 jours, lundi en tête. */
export function monthGrid(cursor: Date): Date[][] {
  const first = startOfWeekMonday(startOfMonth(cursor));
  const weeks: Date[][] = [];
  let day = first;
  do {
    const week: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  } while (isSameMonth(day, cursor) && weeks.length < 6);
  return weeks;
}

/** Les 7 jours de la semaine du curseur. */
export function weekDays(cursor: Date): Date[] {
  const first = startOfWeekMonday(cursor);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i));
}

/** Prochaine occurrence d'un jour de semaine (0 = lundi), strictement après `from`. */
export function nextWeekday(from: Date, weekday: number, weeksAhead = 0): Date {
  let diff = (weekday - mondayIndex(from) + 7) % 7;
  if (diff === 0) diff = 7;
  return addDays(from, diff + weeksAhead * 7);
}

/** Dernière occurrence d'un jour de semaine, strictement avant `from`. */
export function lastWeekday(from: Date, weekday: number, weeksBack = 0): Date {
  let diff = (mondayIndex(from) - weekday + 7) % 7;
  if (diff === 0) diff = 7;
  return addDays(from, -(diff + weeksBack * 7));
}
