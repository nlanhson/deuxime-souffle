/* Données simulées — Affectations (Smart Assignment).
 * Couvre SM-ASG-01..07 : suggestion auto à score composite, calendrier
 * d'attribution, affectation manuelle / override, journal, mode urgence.
 * Marqué `// demo` : aucune logique de matching réelle. */

export type ScoreParts = {
  /** Auto-positionnement : le coach s'est rendu disponible sur ce créneau. */
  auto: number;
  /** Équité : répartition de la charge entre coachs. */
  equite: number;
  /** Fiabilité : ponctualité, taux de no-show, indice de confiance. */
  fiabilite: number;
  /** Proximité géographique du domicile / d'une séance contiguë. */
  proximite: number;
};

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  distanceKm: number;
  trust: number; // /5
  /** Score composite pondéré /100. */
  score: number;
  parts: ScoreParts;
  /** Le coach s'est positionné spontanément sur ce créneau. */
  selfPositioned: boolean;
  /** Enchaîne avec une séance contiguë (moins de trajet). */
  chains?: boolean;
}

export interface OpenSession {
  id: string;
  date: string; // affichage
  iso: string; // tri
  time: string;
  ehpad: string;
  city: string;
  unit: string;
  urgent: boolean;
  /** Pourquoi c'est urgent (no-show, absence coach…). */
  reason?: string;
  candidates: Candidate[];
}

/** KPIs de couverture — texte (label/hint) dans i18n, clé `t.assignments.kpis.<id>`. */
export type CoverageKpiId = 'toFill' | 'coverage' | 'emergency' | 'delay';

export const COVERAGE_KPIS: {
  id: CoverageKpiId;
  value: string;
  tone?: 'warning' | 'danger';
  lead?: boolean;
}[] = [
  { id: 'toFill', value: '6', tone: 'warning' },
  { id: 'coverage', value: '94 %', lead: true },
  { id: 'emergency', value: '2', tone: 'danger' },
  { id: 'delay', value: '3,2 h' },
];

export const OPEN_SESSIONS: OpenSession[] = [
  {
    id: 'S-2511',
    date: 'lun. 16 juin',
    iso: '2026-06-16T14:00',
    time: '14:00',
    ehpad: 'EHPAD Les Tilleuls',
    city: 'Villeurbanne',
    unit: 'UP / UHR',
    urgent: true,
    reason: 'No-show signalé sur la séance d’origine',
    candidates: [
      {
        id: 'c-karim',
        firstName: 'Karim',
        lastName: 'Benali',
        city: 'Villeurbanne',
        distanceKm: 2.1,
        trust: 4.8,
        score: 92,
        parts: { auto: 95, equite: 78, fiabilite: 96, proximite: 98 },
        selfPositioned: true,
        chains: true,
      },
      {
        id: 'c-sophie',
        firstName: 'Sophie',
        lastName: 'Marchand',
        city: 'Lyon 3e',
        distanceKm: 5.4,
        trust: 4.6,
        score: 84,
        parts: { auto: 80, equite: 90, fiabilite: 88, proximite: 80 },
        selfPositioned: true,
      },
      {
        id: 'c-tom',
        firstName: 'Tom',
        lastName: 'Lefebvre',
        city: 'Lyon 7e',
        distanceKm: 8.9,
        trust: 4.4,
        score: 73,
        parts: { auto: 60, equite: 85, fiabilite: 82, proximite: 66 },
        selfPositioned: false,
      },
    ],
  },
  {
    id: 'S-2512',
    date: 'mar. 17 juin',
    iso: '2026-06-17T10:30',
    time: '10:30',
    ehpad: 'Résidence Bellevue',
    city: 'Lyon 6e',
    unit: 'UC',
    urgent: true,
    reason: 'Absence coach déclarée ce matin',
    candidates: [
      {
        id: 'c-sophie2',
        firstName: 'Sophie',
        lastName: 'Marchand',
        city: 'Lyon 3e',
        distanceKm: 3.0,
        trust: 4.6,
        score: 88,
        parts: { auto: 85, equite: 88, fiabilite: 88, proximite: 92 },
        selfPositioned: true,
        chains: true,
      },
      {
        id: 'c-lea',
        firstName: 'Léa',
        lastName: 'Dubois',
        city: 'Lyon 6e',
        distanceKm: 1.2,
        trust: 4.9,
        score: 86,
        parts: { auto: 70, equite: 82, fiabilite: 98, proximite: 99 },
        selfPositioned: false,
      },
    ],
  },
  {
    id: 'S-2513',
    date: 'mer. 18 juin',
    iso: '2026-06-18T15:00',
    time: '15:00',
    ehpad: 'La Roseraie',
    city: 'Caluire',
    unit: 'Personnel soignant',
    urgent: false,
    candidates: [
      {
        id: 'c-tom2',
        firstName: 'Tom',
        lastName: 'Lefebvre',
        city: 'Lyon 7e',
        distanceKm: 6.5,
        trust: 4.4,
        score: 81,
        parts: { auto: 90, equite: 80, fiabilite: 82, proximite: 72 },
        selfPositioned: true,
      },
      {
        id: 'c-nadia',
        firstName: 'Nadia',
        lastName: 'Cherif',
        city: 'Caluire',
        distanceKm: 0.8,
        trust: 4.7,
        score: 79,
        parts: { auto: 60, equite: 86, fiabilite: 90, proximite: 99 },
        selfPositioned: false,
      },
    ],
  },
  {
    id: 'S-2514',
    date: 'jeu. 19 juin',
    iso: '2026-06-19T09:30',
    time: '09:30',
    ehpad: 'Résidence du Parc',
    city: 'Écully',
    unit: 'UC',
    urgent: false,
    candidates: [
      {
        id: 'c-lea2',
        firstName: 'Léa',
        lastName: 'Dubois',
        city: 'Lyon 6e',
        distanceKm: 7.2,
        trust: 4.9,
        score: 83,
        parts: { auto: 88, equite: 84, fiabilite: 98, proximite: 70 },
        selfPositioned: true,
      },
    ],
  },
  {
    id: 'S-2515',
    date: 'ven. 20 juin',
    iso: '2026-06-20T11:00',
    time: '11:00',
    ehpad: 'Les Magnolias',
    city: 'Bron',
    unit: 'Aidants / Familles',
    urgent: false,
    candidates: [
      {
        id: 'c-karim2',
        firstName: 'Karim',
        lastName: 'Benali',
        city: 'Villeurbanne',
        distanceKm: 4.4,
        trust: 4.8,
        score: 85,
        parts: { auto: 82, equite: 76, fiabilite: 96, proximite: 86 },
        selfPositioned: true,
        chains: true,
      },
      {
        id: 'c-nadia2',
        firstName: 'Nadia',
        lastName: 'Cherif',
        city: 'Caluire',
        distanceKm: 9.1,
        trust: 4.7,
        score: 72,
        parts: { auto: 55, equite: 88, fiabilite: 90, proximite: 60 },
        selfPositioned: false,
      },
    ],
  },
  {
    id: 'S-2516',
    date: 'ven. 20 juin',
    iso: '2026-06-20T16:00',
    time: '16:00',
    ehpad: 'EHPAD Les Tilleuls',
    city: 'Villeurbanne',
    unit: 'UP / UHR',
    urgent: false,
    candidates: [
      {
        id: 'c-tom3',
        firstName: 'Tom',
        lastName: 'Lefebvre',
        city: 'Lyon 7e',
        distanceKm: 5.8,
        trust: 4.4,
        score: 77,
        parts: { auto: 75, equite: 80, fiabilite: 82, proximite: 74 },
        selfPositioned: true,
      },
    ],
  },
];

/** Poids actuels du score composite (configurables dans Paramètres).
 *  Libellé dans i18n — clé `t.assignments.weights.<key>`. */
export type ScoreWeightKey = 'auto' | 'fiabilite' | 'proximite' | 'equite';

export const SCORE_WEIGHTS: { key: ScoreWeightKey; weight: number }[] = [
  { key: 'auto', weight: 35 },
  { key: 'fiabilite', weight: 30 },
  { key: 'proximite', weight: 20 },
  { key: 'equite', weight: 15 },
];

/* ---- Mode urgence : cascade J-7 → J-5 → J-3 ---- */
/** Étape de cascade — libellé dans i18n, clé `t.assignments.cascadeSteps.<step>`. */
export type CascadeStep = 'j7' | 'j5' | 'j3';

export interface UrgencySession {
  id: string;
  ehpad: string;
  city: string;
  date: string;
  time: string;
  unit: string;
  deadline: 'J-3' | 'J-5' | 'J-7';
  notified: number;
  responses: number;
  /** Étapes de la cascade déjà franchies. */
  cascade: { step: CascadeStep; done: boolean }[];
}

export const URGENCY_SESSIONS: UrgencySession[] = [
  {
    id: 'U-1',
    ehpad: 'Le Parc Meaux',
    city: 'Meaux',
    date: 'jeu. 18 juin',
    time: '14:00',
    unit: 'UP / UHR',
    deadline: 'J-3',
    notified: 18,
    responses: 0,
    cascade: [
      { step: 'j7', done: true },
      { step: 'j5', done: true },
      { step: 'j3', done: false },
    ],
  },
  {
    id: 'U-2',
    ehpad: 'Résidence Bellevue',
    city: 'Lyon 6e',
    date: 'sam. 20 juin',
    time: '10:30',
    unit: 'UC',
    deadline: 'J-5',
    notified: 22,
    responses: 0,
    cascade: [
      { step: 'j7', done: true },
      { step: 'j5', done: false },
      { step: 'j3', done: false },
    ],
  },
  {
    id: 'U-3',
    ehpad: 'Les Magnolias',
    city: 'Bron',
    date: 'lun. 22 juin',
    time: '11:00',
    unit: 'Aidants / Familles',
    deadline: 'J-7',
    notified: 18,
    responses: 1,
    cascade: [
      { step: 'j7', done: false },
      { step: 'j5', done: false },
      { step: 'j3', done: false },
    ],
  },
];

/** Liste B — coachs éligibles à appeler quand la Liste A est vide. */
export interface ListBCoach {
  id: string;
  firstName: string;
  lastName: string;
  score: number;
  note: string;
  available: boolean;
  phone: string;
}

export const LISTE_B: ListBCoach[] = [
  { id: 'b1', firstName: 'Léa', lastName: 'Dubois', score: 49, note: 'UP/UHR · 7 km', available: true, phone: '06 12 34 56 78' },
  { id: 'b2', firstName: 'Karim', lastName: 'Benali', score: 47, note: 'UP/UHR · enchaîne une séance', available: true, phone: '06 23 45 67 89' },
  { id: 'b3', firstName: 'Tom', lastName: 'Lefebvre', score: 41, note: 'UC · dispo à confirmer', available: false, phone: '06 34 56 78 90' },
];

/** Dates de report proposées par l'algo, groupées par horizon. */
export const REPORT_DATES = {
  court: [
    { label: 'mar. 23 juin · 14:00', coaches: 4, recommended: true },
    { label: 'jeu. 25 juin · 10:30', coaches: 3, recommended: false },
  ],
  moyen: [
    { label: 'mar. 30 juin · 14:00', coaches: 5, recommended: false },
    { label: 'jeu. 9 juil. · 11:00', coaches: 6, recommended: false },
  ],
};

/** Motifs obligatoires d'un override (choix hors recommandation algo).
 *  Ordre d'affichage — libellé dans i18n, clé `t.assignments.reasons.<value>`. */
export type OverrideReasonValue = 'continuite' | 'demande' | 'nouveau' | 'ops' | 'autre';

export const OVERRIDE_REASONS: OverrideReasonValue[] = [
  'continuite',
  'demande',
  'nouveau',
  'ops',
  'autre',
];

/** Synthèse de la validation en masse (préparation mensuelle). */
export const MASS_VALIDATE = {
  total: 100,
  clean: 93,
  conflicts: 5,
  manual: 2,
  revenue: '14 200 €',
};

export interface AssignmentLog {
  id: string;
  text: string;
  actor: string;
  time: string;
  kind: 'auto' | 'manual' | 'override' | 'emergency';
}

export const ASSIGNMENT_LOGS: AssignmentLog[] = [
  { id: 'l1', text: 'Karim B. affecté à la séance 14:00 — Les Tilleuls', actor: 'Auto', time: 'il y a 6 min', kind: 'auto' },
  { id: 'l2', text: 'Override : Léa D. remplace la suggestion sur Bellevue', actor: 'Camille R.', time: 'il y a 22 min', kind: 'override' },
  { id: 'l3', text: 'Mode urgence déclenché — absence coach à Bellevue', actor: 'Système', time: 'il y a 38 min', kind: 'emergency' },
  { id: 'l4', text: '12 séances de la S25 affectées automatiquement', actor: 'Auto', time: 'il y a 1 h', kind: 'auto' },
  { id: 'l5', text: 'Affectation manuelle — Nadia C. sur La Roseraie', actor: 'Camille R.', time: 'il y a 2 h', kind: 'manual' },
];
