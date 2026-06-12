/** Formatage fr-FR centralisé — dates, montants, téléphones, durées (via Intl). */

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const weekdayDateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const weekdayFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });
const shortDateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const monthYearFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const euroFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const relativeFmt = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });

/** Parse `YYYY-MM-DD` en date locale (sans surprise de fuseau). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toIso(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** `14 mars 2026` */
export const formatDate = (iso: string): string => dateFmt.format(parseDate(iso));

/** `mardi 16 juin` */
export const formatWeekdayDate = (iso: string): string => weekdayDateFmt.format(parseDate(iso));

/** `mardi` — jour de la semaine seul (en-têtes de groupe de la liste des séances). */
export const formatWeekday = (iso: string): string => weekdayFmt.format(parseDate(iso));

/** `16 juin` */
export const formatShortDate = (iso: string): string => shortDateFmt.format(parseDate(iso));

/** `mardi 16 juin · 14h30` */
export const formatDateTime = (iso: string, time: string): string =>
  `${formatWeekdayDate(iso)} · ${formatTime(time)}`;

/** Horloge française 24 h : `(14, 30)` → `14h30`, `(9, 0)` → `9h00`.
    L'écriture « 14h30 » est celle que lisent nos directrices et directeurs —
    l'am/pm anglo-saxon prêtait à confusion. */
function clock24(h: number, m: number): string {
  return `${h}h${String(m).padStart(2, '0')}`;
}

/** `14:30` → `14h30`, `09:00` → `9h00` */
export function formatTime(time: string): string {
  const [h, m] = time.split(':');
  return clock24(Number(h ?? 0), Number(m ?? 0));
}

/** `juin 2026` */
export const formatMonthYear = (date: Date): string => monthYearFmt.format(date);

/** Horodatage d'événement : `11 juin 2026 à 14h10` */
export function formatTimestamp(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  return `${dateTimeFmt.format(d)} à ${clock24(d.getHours(), d.getMinutes())}`;
}

/** `1 240,00 €` */
export const formatEuro = (amount: number): string => euroFmt.format(amount);

/** `0612345678` → `06 12 34 56 78` */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim() || phone;
}

/** Durées en toutes lettres : 90 → `1 h 30`, 60 → `1 h`, 45 → `45 min`. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

/** `il y a 2 mois` — pour les horloges de fraîcheur. */
export function formatSince(isoDateTime: string): string {
  const diffMs = new Date(isoDateTime).getTime() - Date.now();
  const days = Math.round(diffMs / 86_400_000);
  if (Math.abs(days) >= 60) return relativeFmt.format(Math.round(days / 30), 'month');
  if (Math.abs(days) >= 1) return relativeFmt.format(days, 'day');
  return relativeFmt.format(Math.round(diffMs / 3_600_000), 'hour');
}

/** Majuscule initiale (les jours/mois Intl sont en minuscules). */
export const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
