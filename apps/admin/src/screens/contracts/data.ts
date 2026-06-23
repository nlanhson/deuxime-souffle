/* Données simulées — Contrats (Contract management, côté admin).
 * Couvre CON-07..17 : file de validation, approbation/rejet, cycle de vie,
 * créneaux suggérés (CON-08), génération de séances (CON-09), renouvellement
 * (CON-15). // demo */

export type ContractStatus =
  | 'pending' // En attente de validation admin
  | 'active' // Actif
  | 'renewal' // À renouveler (< 90 j)
  | 'expired' // Expiré
  | 'rejected'; // Rejeté

export interface SuggestedSlot {
  label: string;
  fit: 'ideal' | 'good' | 'acceptable';
}

export interface Contract {
  id: string;
  ehpad: string;
  city: string;
  group?: string;
  frequency: string;
  units: string[];
  start: string;
  end: string;
  status: ContractStatus;
  rate: number; // € HT / séance
  generated: number;
  completed: number;
  /** Modification majeure en attente (CON-04). */
  majorChange?: string;
  rejectionReason?: string;
  slots?: SuggestedSlot[];
  notes?: string;
  daysToEnd?: number;
}

/* Metadata only — label/value/hint TEXT lives in i18n (`t.contracts.*`).
 * `value` keys here pair with dictionary records to build displayed strings. */

export type ContractKpiId = 'toValidate' | 'active' | 'renewal' | 'mrr';

export const CONTRACT_KPIS: { id: ContractKpiId; lead?: boolean }[] = [
  { id: 'toValidate' },
  { id: 'active' },
  { id: 'renewal' },
  { id: 'mrr', lead: true },
];

export const STATUS_META: Record<
  ContractStatus,
  { tone: 'neutral' | 'info' | 'progress' | 'warning' | 'danger' }
> = {
  pending: { tone: 'warning' },
  active: { tone: 'progress' },
  renewal: { tone: 'info' },
  expired: { tone: 'neutral' },
  rejected: { tone: 'danger' },
};

export const FIT_META: Record<SuggestedSlot['fit'], { tone: 'progress' | 'info' | 'neutral' }> = {
  ideal: { tone: 'progress' },
  good: { tone: 'info' },
  acceptable: { tone: 'neutral' },
};

/* ---- Options de l'assistant « Créer un contrat » (mode admin) ----
 * Establishment names stay here (authored free-text); option `value`s pair
 * with dictionary records for label/desc. */
export const CONTRACT_EHPADS = [
  'EHPAD Les Tilleuls — Villeurbanne',
  'Résidence Bellevue — Lyon 6e',
  'La Roseraie — Caluire',
  'Résidence du Parc — Écully',
];

export type FreqValue = '1sem' | '2sem' | 'quinzaine' | 'mois' | 'ponctuel';
export const FREQ_VALUES: FreqValue[] = ['1sem', '2sem', 'quinzaine', 'mois', 'ponctuel'];

export type UnitValue = 'uc' | 'up' | 'aidants' | 'soignants' | 'autre';
export const UNIT_VALUES: UnitValue[] = ['uc', 'up', 'aidants', 'soignants', 'autre'];

export type ConsecutivityValue = 'oui' | 'non';
export const CONSECUTIVITY_VALUES: ConsecutivityValue[] = ['oui', 'non'];

export type ExclusionValue = 'weekend' | 'mercredi' | 'matin' | 'vendredi-am';
export const EXCLUSION_VALUES: ExclusionValue[] = ['weekend', 'mercredi', 'matin', 'vendredi-am'];

export type PeriodValue = '12glissants' | 'civile' | '24mois' | 'sansfin';
export const PERIOD_VALUES: PeriodValue[] = ['12glissants', 'civile', '24mois', 'sansfin'];

export type MarkerValue = 'cfppa' | 'bdc' | 'groupe';
export const MARKER_VALUES: MarkerValue[] = ['cfppa', 'bdc', 'groupe'];

export type RejectReasonValue = 'tarif' | 'dispo' | 'zone' | 'doublon' | 'autre';
export const REJECT_REASON_VALUES: RejectReasonValue[] = ['tarif', 'dispo', 'zone', 'doublon', 'autre'];

export const CONTRACTS: Contract[] = [
  {
    id: 'CT-2041',
    ehpad: 'Résidence Bellevue',
    city: 'Lyon 6e',
    group: 'Groupe Korian',
    frequency: '2× / semaine',
    units: ['UC', 'UP / UHR'],
    start: '01/07/2026',
    end: '30/06/2027',
    status: 'pending',
    rate: 75,
    generated: 0,
    completed: 0,
    notes: 'Souhaite démarrer rapidement, créneaux du matin privilégiés.',
    slots: [
      { label: 'Mardi 10:30', fit: 'ideal' },
      { label: 'Jeudi 10:30', fit: 'ideal' },
      { label: 'Lundi 14:00', fit: 'good' },
      { label: 'Vendredi 15:00', fit: 'acceptable' },
    ],
  },
  {
    id: 'CT-2042',
    ehpad: 'Les Magnolias',
    city: 'Bron',
    frequency: '1× / semaine',
    units: ['Aidants / Familles'],
    start: '15/07/2026',
    end: '14/07/2027',
    status: 'pending',
    rate: 70,
    generated: 0,
    completed: 0,
    majorChange: 'Changement de fréquence demandé (1× → 2× / semaine)',
    slots: [
      { label: 'Mercredi 11:00', fit: 'ideal' },
      { label: 'Vendredi 11:00', fit: 'good' },
    ],
  },
  {
    id: 'CT-2018',
    ehpad: 'EHPAD Les Tilleuls',
    city: 'Villeurbanne',
    group: 'Groupe Korian',
    frequency: '2× / semaine',
    units: ['UP / UHR'],
    start: '01/01/2026',
    end: '31/12/2026',
    status: 'active',
    rate: 78,
    generated: 96,
    completed: 64,
  },
  {
    id: 'CT-2019',
    ehpad: 'La Roseraie',
    city: 'Caluire',
    frequency: '1× / semaine',
    units: ['Personnel soignant'],
    start: '01/03/2026',
    end: '28/02/2027',
    status: 'active',
    rate: 72,
    generated: 52,
    completed: 18,
  },
  {
    id: 'CT-2007',
    ehpad: 'Résidence du Parc',
    city: 'Écully',
    frequency: '1× / semaine',
    units: ['UC'],
    start: '01/10/2025',
    end: '30/09/2026',
    status: 'renewal',
    rate: 74,
    generated: 52,
    completed: 38,
    daysToEnd: 107,
  },
  {
    id: 'CT-2003',
    ehpad: 'Villa Sérénité',
    city: 'Tassin',
    frequency: '1× / 2 semaines',
    units: ['UC'],
    start: '01/09/2025',
    end: '31/08/2026',
    status: 'renewal',
    rate: 70,
    generated: 26,
    completed: 22,
    daysToEnd: 77,
  },
  {
    id: 'CT-1990',
    ehpad: 'Le Clos Fleuri',
    city: 'Oullins',
    frequency: '1× / semaine',
    units: ['UP / UHR'],
    start: '01/06/2025',
    end: '31/05/2026',
    status: 'expired',
    rate: 72,
    generated: 52,
    completed: 50,
  },
  {
    id: 'CT-2030',
    ehpad: 'Résidence Horizon',
    city: 'Vénissieux',
    frequency: '2× / semaine',
    units: ['UC', 'Personnel soignant'],
    start: '—',
    end: '—',
    status: 'rejected',
    rate: 68,
    generated: 0,
    completed: 0,
    rejectionReason: 'Tarif proposé sous le plancher — à renégocier avant resoumission.',
  },
];
