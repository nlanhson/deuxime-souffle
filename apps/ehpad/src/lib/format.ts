/** Formatage centralisé — dates, montants, téléphones, durées (via Intl).
 *  Sensible à la langue active : les formateurs sont résolus à CHAQUE appel via
 *  `getLocale()` (et mis en cache par langue). Les composants consommant
 *  `useStrings()` se re-rendent au changement de langue, donc leurs dates se
 *  reformatent dans la foulée. */

import { getLocale } from '@/i18n';
import type { Locale } from '@/i18n';

/** Étiquette BCP-47 par langue : `en-GB` garde l'ordre jour-mois-année (parité
 *  de gabarit avec le français, p. ex. « 13 June 2026 »). */
const INTL_TAG: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB' };

/** Connecteur d'horodatage : « 13 juin 2026 à 14h » / « 13 June 2026 at 2pm ». */
const AT_WORD: Record<Locale, string> = { fr: 'à', en: 'at' };

interface Formatters {
  date: Intl.DateTimeFormat;
  weekdayDate: Intl.DateTimeFormat;
  weekday: Intl.DateTimeFormat;
  shortDate: Intl.DateTimeFormat;
  shortDateYear: Intl.DateTimeFormat;
  monthYear: Intl.DateTimeFormat;
  shortMonthYear: Intl.DateTimeFormat;
  dateTime: Intl.DateTimeFormat;
  euro: Intl.NumberFormat;
  relative: Intl.RelativeTimeFormat;
}

/* Construits une fois par langue puis réutilisés (les objets Intl sont coûteux). */
const cache = new Map<Locale, Formatters>();

function fmt(): Formatters {
  const locale = getLocale();
  let f = cache.get(locale);
  if (!f) {
    const tag = INTL_TAG[locale];
    f = {
      date: new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }),
      weekdayDate: new Intl.DateTimeFormat(tag, { weekday: 'long', day: 'numeric', month: 'long' }),
      weekday: new Intl.DateTimeFormat(tag, { weekday: 'long' }),
      shortDate: new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short' }),
      shortDateYear: new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', year: 'numeric' }),
      monthYear: new Intl.DateTimeFormat(tag, { month: 'long', year: 'numeric' }),
      shortMonthYear: new Intl.DateTimeFormat(tag, { month: 'short', year: 'numeric' }),
      dateTime: new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }),
      euro: new Intl.NumberFormat(tag, { style: 'currency', currency: 'EUR' }),
      relative: new Intl.RelativeTimeFormat(tag, { numeric: 'auto' }),
    };
    cache.set(locale, f);
  }
  return f;
}

/** Parse `YYYY-MM-DD` en date locale (sans surprise de fuseau). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toIso(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** `14 mars 2026` / `14 March 2026` */
export const formatDate = (iso: string): string => fmt().date.format(parseDate(iso));

/** `mardi 16 juin` / `Tuesday 16 June` */
export const formatWeekdayDate = (iso: string): string => fmt().weekdayDate.format(parseDate(iso));

/** `mardi` / `Tuesday` — jour de la semaine seul (en-têtes de groupe de la liste des séances). */
export const formatWeekday = (iso: string): string => fmt().weekday.format(parseDate(iso));

/** `16 juin` / `16 Jun` */
export const formatShortDate = (iso: string): string => fmt().shortDate.format(parseDate(iso));

/** `16 juin 2026` / `16 Jun 2026` — compact avec l'année (colonnes de table serrées). */
export const formatShortDateYear = (iso: string): string => fmt().shortDateYear.format(parseDate(iso));

/** `mardi 16 juin · 2:30pm` / `Tuesday 16 June · 2:30pm` */
export const formatDateTime = (iso: string, time: string): string =>
  `${formatWeekdayDate(iso)} · ${formatTime(time)}`;

/** Horloge 12 h (am/pm) : `(13, 0)` → `1:00pm`, `(9, 5)` → `9:05am`,
    `(0, 0)` → `12:00am`, `(12, 0)` → `12:00pm`. Format demandé par le client
    pour toutes les langues (remplace l'ancien 24 h « 14h30 »). Note : l'heure
    reste stockée en 24 h `HH:mm` côté données — seul l'affichage change. */
function clock12(h: number, m: number): string {
  const period = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')}${period}`;
}

/** `14:30` → `2:30pm`, `09:00` → `9:00am` */
export function formatTime(time: string): string {
  const [h, m] = time.split(':');
  return clock12(Number(h ?? 0), Number(m ?? 0));
}

/** Plage horaire début → fin : `('14:30', 45)` → `2:30pm — 3:15pm`. */
export function formatTimeRange(time: string, durationMin: number): string {
  const [h, m] = time.split(':');
  const startMin = Number(h ?? 0) * 60 + Number(m ?? 0);
  const endMin = startMin + durationMin;
  return `${formatTime(time)} — ${clock12(Math.floor(endMin / 60) % 24, endMin % 60)}`;
}

/** `juin 2026` / `June 2026` */
export const formatMonthYear = (date: Date): string => fmt().monthYear.format(date);

/** `juin 2026` → `juin 2026`, `septembre 2025` → `sept. 2025` — mois abrégé, pour
 *  les colonnes serrées (tables à largeur égale). */
export const formatShortMonthYear = (date: Date): string => fmt().shortMonthYear.format(date);

/** Horodatage d'événement : `11 juin 2026 à 2:10pm` / `11 June 2026 at 2:10pm` */
export function formatTimestamp(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  return `${fmt().dateTime.format(d)} ${AT_WORD[getLocale()]} ${clock12(d.getHours(), d.getMinutes())}`;
}

/** `1 240,00 €` / `€1,240.00` */
export const formatEuro = (amount: number): string => fmt().euro.format(amount);

/** `0612345678` → `06 12 34 56 78` */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim() || phone;
}

/** Durées en toutes lettres : 90 → `1 h 30` / `1h 30`, 60 → `1 h` / `1h`, 45 → `45 min`. */
export function formatDuration(minutes: number): string {
  const sep = getLocale() === 'fr' ? ' h' : 'h'; // « 1 h 30 » vs « 1h 30 »
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}${sep}` : `${h}${sep} ${String(m).padStart(2, '0')}`;
}

/** `il y a 2 mois` / `2 months ago` — pour les horloges de fraîcheur. */
export function formatSince(isoDateTime: string): string {
  const diffMs = new Date(isoDateTime).getTime() - Date.now();
  const days = Math.round(diffMs / 86_400_000);
  const rel = fmt().relative;
  if (Math.abs(days) >= 60) return rel.format(Math.round(days / 30), 'month');
  if (Math.abs(days) >= 1) return rel.format(days, 'day');
  return rel.format(Math.round(diffMs / 3_600_000), 'hour');
}

/** Majuscule initiale (les jours/mois Intl sont en minuscules en français). */
export const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
