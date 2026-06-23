/* Données simulées — Coachs (Management Coach + Coach Evaluation).
 * COACH-01..09, COACH-EVA-01/02 : profils, validation d'inscription, indice de
 * confiance, documents, coefficients, pénalités, financier. // demo */

export type CoachStatus = 'active' | 'pending' | 'invited' | 'suspended';

/** `key` indexe le libellé i18n: t.coaches.docNames.<key>. */
export type CoachDocKey = 'diplomeApa' | 'cv' | 'urssaf' | 'rcpro';
export interface CoachDoc {
  key: CoachDocKey;
  state: 'valid' | 'pending' | 'missing';
}

export interface TrustParts {
  rating: number; // évaluations EHPAD
  reliability: number; // ponctualité / no-show
  tenure: number; // ancienneté / volume
  responsiveness: number; // réactivité aux propositions
}

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  zone: string;
  status: CoachStatus;
  trust: number; // /5
  trustParts: TrustParts;
  sessionsThisMonth: number;
  totalSessions: number;
  rating: number; // /5
  earningsMonth: number; // € ce mois
  docs: CoachDoc[];
  /** Pénalité active (no-show), retirable manuellement (COACH-03). */
  penalty?: string;
  appliedAt?: string;
}

/** KPIs coachs — métadonnées de présentation (le texte vit dans i18n: t.coaches.kpis.<id>). */
export type CoachKpiId = 'active' | 'pending' | 'trust' | 'perCoach';
export const COACH_KPIS: { id: CoachKpiId; value: string; lead?: boolean; tone?: 'warning' }[] = [
  { id: 'active', value: '87' },
  { id: 'pending', value: '2', tone: 'warning' },
  { id: 'trust', value: '4,6', lead: true },
  { id: 'perCoach', value: '7,0' },
];

/** Statut coach — `tone` ici, libellé dans i18n: t.coaches.status.<key>. */
export const STATUS_META: Record<CoachStatus, { tone: 'neutral' | 'info' | 'progress' | 'warning' | 'danger' }> = {
  active: { tone: 'progress' },
  pending: { tone: 'warning' },
  invited: { tone: 'info' },
  suspended: { tone: 'danger' },
};

/** Pièces justificatives — `key` ici, libellé dans i18n: t.coaches.docNames.<key>. */
const FULL_DOCS: CoachDoc[] = [
  { key: 'diplomeApa', state: 'valid' },
  { key: 'cv', state: 'valid' },
  { key: 'urssaf', state: 'valid' },
  { key: 'rcpro', state: 'valid' },
];

export const COACHES: Coach[] = [
  {
    id: 'CO-01',
    firstName: 'Karim',
    lastName: 'Benali',
    email: 'karim.benali@gmail.com',
    zone: 'Villeurbanne · Lyon Est',
    status: 'active',
    trust: 4.8,
    trustParts: { rating: 96, reliability: 98, tenure: 90, responsiveness: 94 },
    sessionsThisMonth: 9,
    totalSessions: 312,
    rating: 4.8,
    earningsMonth: 2160,
    docs: FULL_DOCS,
  },
  {
    id: 'CO-02',
    firstName: 'Sophie',
    lastName: 'Marchand',
    email: 'sophie.marchand@gmail.com',
    zone: 'Lyon Centre · Presqu’île',
    status: 'active',
    trust: 4.6,
    trustParts: { rating: 92, reliability: 88, tenure: 84, responsiveness: 90 },
    sessionsThisMonth: 8,
    totalSessions: 248,
    rating: 4.6,
    earningsMonth: 1920,
    docs: FULL_DOCS,
  },
  {
    id: 'CO-03',
    firstName: 'Tom',
    lastName: 'Lefebvre',
    email: 'tom.lefebvre@gmail.com',
    zone: 'Lyon Sud · Oullins',
    status: 'suspended',
    trust: 4.1,
    trustParts: { rating: 84, reliability: 62, tenure: 80, responsiveness: 78 },
    sessionsThisMonth: 4,
    totalSessions: 176,
    rating: 4.4,
    earningsMonth: 960,
    docs: FULL_DOCS,
    penalty: 'No-show du 14/06 — pénalité de fiabilité appliquée',
    appliedAt: '14/06/2026',
  },
  {
    id: 'CO-04',
    firstName: 'Léa',
    lastName: 'Dubois',
    email: 'lea.dubois@gmail.com',
    zone: 'Lyon 6e · Caluire',
    status: 'active',
    trust: 4.9,
    trustParts: { rating: 98, reliability: 99, tenure: 70, responsiveness: 96 },
    sessionsThisMonth: 7,
    totalSessions: 132,
    rating: 4.9,
    earningsMonth: 1680,
    docs: FULL_DOCS,
  },
  {
    id: 'CO-05',
    firstName: 'Nadia',
    lastName: 'Cherif',
    email: 'nadia.cherif@gmail.com',
    zone: 'Caluire · Rillieux',
    status: 'pending',
    trust: 0,
    trustParts: { rating: 0, reliability: 0, tenure: 0, responsiveness: 0 },
    sessionsThisMonth: 0,
    totalSessions: 0,
    rating: 0,
    earningsMonth: 0,
    docs: [
      { key: 'diplomeApa', state: 'valid' },
      { key: 'cv', state: 'valid' },
      { key: 'urssaf', state: 'valid' },
      { key: 'rcpro', state: 'valid' },
    ],
  },
  {
    id: 'CO-06',
    firstName: 'Hugo',
    lastName: 'Garnier',
    email: 'hugo.garnier@gmail.com',
    zone: 'Bron · Vénissieux',
    status: 'pending',
    trust: 0,
    trustParts: { rating: 0, reliability: 0, tenure: 0, responsiveness: 0 },
    sessionsThisMonth: 0,
    totalSessions: 0,
    rating: 0,
    earningsMonth: 0,
    docs: [
      { key: 'diplomeApa', state: 'valid' },
      { key: 'cv', state: 'valid' },
      { key: 'urssaf', state: 'pending' },
      { key: 'rcpro', state: 'missing' },
    ],
  },
  {
    id: 'CO-07',
    firstName: 'Inès',
    lastName: 'Morel',
    email: 'ines.morel@gmail.com',
    zone: 'Écully · Tassin',
    status: 'invited',
    trust: 0,
    trustParts: { rating: 0, reliability: 0, tenure: 0, responsiveness: 0 },
    sessionsThisMonth: 0,
    totalSessions: 0,
    rating: 0,
    earningsMonth: 0,
    docs: [],
  },
];

/* ---- Options de l'assistant « Inviter un coach » ----
 * Valeurs seules ; les libellés affichés vivent dans i18n (t.coaches.wizard.*),
 * fusionnés avec ces clés dans le composant. */
export const CIVILITY_VALUES = ['mme', 'm', 'nc'] as const;
export type CivilityValue = (typeof CIVILITY_VALUES)[number];

export const LEGAL_STATUS_VALUES = ['ae', 'eurl', 'sasu', 'porte', 'autre'] as const;
export type LegalStatusValue = (typeof LEGAL_STATUS_VALUES)[number];

// Départements d'intervention (Île-de-France) — zones favorites en multi-sélection.
export const ZONES = [
  '75 Paris',
  '92 Hauts-de-Seine',
  '93 Seine-Saint-Denis',
  '94 Val-de-Marne',
  '95 Val-d’Oise',
  '77 Seine-et-Marne',
  '78 Yvelines',
  '91 Essonne',
];

// Pièces du dossier KYC. `status` = état pré-chargé par l'admin (reçu / en attente /
// optionnel) ; `mandatory` pilote la pastille obligatoire vs optionnel ; `renew6m`
// ajoute la mention de renouvellement semestriel (attestation de vigilance).
// `value` indexe le libellé + la description i18n (t.coaches.wizard.kycDocs.<value>).
export interface KycDoc {
  value: string;
  mandatory: boolean;
  renew6m?: boolean;
  status: 'received' | 'waiting' | 'optional';
}
export const KYC_DOCS: KycDoc[] = [
  { value: 'cv', mandatory: true, status: 'received' },
  { value: 'diplome', mandatory: true, status: 'received' },
  { value: 'urssaf', mandatory: true, renew6m: true, status: 'waiting' },
  { value: 'rcpro', mandatory: true, status: 'waiting' },
  { value: 'formation', mandatory: true, status: 'waiting' },
  { value: 'permis', mandatory: false, status: 'optional' },
  { value: 'b3', mandatory: false, status: 'optional' },
];

// Spécialités — valeurs seules ; libellés dans i18n (t.coaches.wizard.specialties.<value>).
export const SPECIALTY_VALUES = ['uc', 'up', 'aidants', 'soignants', 'ludique', 'memoire', 'renfo'] as const;
export type SpecialtyValue = (typeof SPECIALTY_VALUES)[number];

// Paliers de tarif horaire (€ HT) — `value` + le tarif numérique restent ici ;
// libellé/note dans i18n (t.coaches.wizard.tarifPresets.<value>). « perso » = saisie libre.
export const TARIF_PRESETS: { value: string }[] = [
  { value: '35' },
  { value: '40' },
  { value: '50' },
  { value: 'perso' },
];

// Disponibilités hebdomadaires — demi-journées × jours (le coach affine ensuite
// depuis son app). Clé d'une case : `${slot.key}-${dayIndex}`.
// AVAIL_DAYS = abréviations de données ; libellés de créneaux dans i18n (t.coaches.wizard.availSlots.<key>).
export const AVAIL_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const AVAIL_SLOT_KEYS = ['am', 'pm'] as const;
export type AvailSlotKey = (typeof AVAIL_SLOT_KEYS)[number];
export const DEFAULT_AVAIL: Record<string, boolean> = {
  'am-0': true, 'am-1': true, 'am-2': false, 'am-3': true, 'am-4': true, 'am-5': false, 'am-6': false,
  'pm-0': true, 'pm-1': true, 'pm-2': true, 'pm-3': true, 'pm-4': true, 'pm-5': false, 'pm-6': false,
};

/** Motifs de retrait d'un coach de toutes ses séances futures (COACH-03).
 *  Valeurs seules ; libellés dans i18n (t.coaches.removeReasons.<value>). */
export const REMOVE_REASON_VALUES = ['maladie', 'conge', 'depart', 'sanction', 'autre'] as const;
export type RemoveReasonValue = (typeof REMOVE_REASON_VALUES)[number];

/** Coefficients d'évaluation (COACH-EVA-02) — configurables dans Paramètres.
 *  `key` + `weight` ici ; libellé dans i18n (t.coaches.trustWeights.<key>). */
export const TRUST_WEIGHTS = [
  { key: 'rating', weight: 40 },
  { key: 'reliability', weight: 30 },
  { key: 'responsiveness', weight: 20 },
  { key: 'tenure', weight: 10 },
] as const;
