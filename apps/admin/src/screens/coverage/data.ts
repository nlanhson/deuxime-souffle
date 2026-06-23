/* Données simulées — Couverture (GEO-01/02).
 * Disponibilités coachs par zone × créneau : zones saturées / sous-dotées. // demo
 * Le TEXTE visible (libellés KPI, options de période, en-têtes de créneaux) vit
 * dans le dictionnaire i18n sous `coverage`. Ici on ne garde que la métadonnée
 * non textuelle (id, value, hint, lead, données chiffrées). */

export type CoverageKpiId = 'total' | 'booked' | 'residual' | 'saturated' | 'underserved';

export interface CoverageKpi {
  id: CoverageKpiId;
  value: string;
  lead?: boolean;
}

export const COVERAGE_KPIS: CoverageKpi[] = [
  { id: 'total', value: '342 h' },
  { id: 'booked', value: '280 h' },
  { id: 'residual', value: '62 h', lead: true },
  { id: 'saturated', value: '3' },
  { id: 'underserved', value: '2' },
];

/** Valeurs des options de période (le libellé visible vit dans i18n). */
export type PeriodValue = 'this' | 'next' | 'avg';
export const PERIOD_VALUES: PeriodValue[] = ['this', 'next', 'avg'];

/** Demi-journées (colonnes) — jour + demi-journée ; le texte vit dans i18n.
 * day = clé jour court · half = 'am' (matin) | 'pm' (après-midi). */
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export type HalfKey = 'am' | 'pm';
export interface Slot {
  day: DayKey;
  half: HalfKey;
}

export const SLOTS: Slot[] = [
  { day: 'mon', half: 'am' },
  { day: 'mon', half: 'pm' },
  { day: 'tue', half: 'am' },
  { day: 'tue', half: 'pm' },
  { day: 'wed', half: 'am' },
  { day: 'wed', half: 'pm' },
  { day: 'thu', half: 'am' },
  { day: 'thu', half: 'pm' },
  { day: 'fri', half: 'am' },
  { day: 'fri', half: 'pm' },
];

export interface ZoneRow {
  zone: string;
  /** Nombre de coachs disponibles par demi-journée. */
  slots: number[];
}

export const ZONE_ROWS: ZoneRow[] = [
  { zone: '69 Lyon', slots: [6, 5, 4, 6, 3, 5, 4, 6, 2, 4] },
  { zone: '69 Villeurbanne', slots: [4, 3, 5, 4, 2, 3, 3, 4, 1, 2] },
  { zone: '69 Caluire', slots: [2, 1, 3, 2, 1, 2, 2, 1, 0, 1] },
  { zone: '01 Ain', slots: [1, 0, 1, 1, 0, 1, 0, 1, 0, 0] },
  { zone: '38 Nord-Isère', slots: [0, 1, 0, 0, 1, 0, 1, 0, 0, 0] },
  { zone: '42 Loire', slots: [1, 1, 2, 1, 0, 1, 1, 1, 0, 1] },
];

export interface ZoneReco {
  zone: string;
  detail: string;
}

export const HIGH_POTENTIAL: ZoneReco[] = [
  { zone: '69 Lyon Centre', detail: '18 coachs dispo · 4 EHPAD clients — prospecter' },
  { zone: '69 Villeurbanne', detail: '11 coachs dispo · 3 EHPAD clients — leads chauds' },
];

export const UNDERSERVED: ZoneReco[] = [
  { zone: '38 Nord-Isère', detail: '2 coachs · 5 séances/sem. — lancer un recrutement' },
  { zone: '01 Ain', detail: '3 coachs · demande croissante — recruter' },
];
