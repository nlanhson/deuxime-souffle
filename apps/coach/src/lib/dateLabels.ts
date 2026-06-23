/**
 * Locale-explicit day labels for the Séances agenda headers.
 *
 * We format with hand-rolled FR/EN tables rather than Intl/`toLocaleDateString`: on Hermes the
 * ICU locale data isn't guaranteed, so `toLocaleDateString('fr-FR', …)` can silently fall back to
 * en-US. These tables keep the labels correct and warm in both languages (Craft idiom: a relative
 * word when the day is near, otherwise the weekday + date).
 */
import type { Locale } from '../i18n';

const WORDS: Record<Locale, {
  today: string; tomorrow: string; yesterday: string;
  weekdays: readonly string[]; months: readonly string[];
}> = {
  fr: {
    today: "Aujourd’hui", tomorrow: 'Demain', yesterday: 'Hier',
    // Sunday-first (matches Date.getDay()); French convention lowercases weekdays + months.
    weekdays: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  },
  en: {
    today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday',
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Local-midnight Date for `today` shifted by `offset` whole days (0 = today, 1 = tomorrow, …). */
export function dayFromOffset(offset: number, today: Date = new Date()): Date {
  const d = new Date(today);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

/**
 * Human day-group header. Within ±1 day → relative word + date ("Aujourd’hui · 19 juin",
 * "Today · June 19"); otherwise weekday + date ("Jeudi 11 juin", "Thursday June 11").
 */
export function dayLabel(date: Date, locale: Locale, today: Date = new Date()): string {
  const w = WORDS[locale] ?? WORDS.fr;
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - t.getTime()) / 86_400_000);

  const day = d.getDate();
  const month = w.months[d.getMonth()];
  const datePart = locale === 'en' ? `${month} ${day}` : `${day} ${month}`;

  if (diff === 0) return `${w.today} · ${datePart}`;
  if (diff === 1) return `${w.tomorrow} · ${datePart}`;
  if (diff === -1) return `${w.yesterday} · ${datePart}`;
  return `${cap(w.weekdays[d.getDay()])} ${datePart}`;
}
