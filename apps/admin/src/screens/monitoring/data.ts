/* Données simulées — Supervision opérationnelle (DASH-02, 03, 05, 12, 13). // demo
   Vues de pilotage en lecture seule : repérer les séances en souffrance, la
   demande, et les coachs / EHPAD qui demandent une attention. */

export const MONTH_OPTIONS = [
  { value: '2026-06', label: 'Juin 2026' },
  { value: '2026-05', label: 'Mai 2026' },
  { value: '2026-04', label: 'Avril 2026' },
];

/* ---- DASH-02 · Séances à problème ---- */

export interface NoCoachSession {
  id: string;
  ehpad: string;
  slot: string; // jour + heure
  unit: string;
  ageDays: number; // ancienneté du problème
}

/** Séances sans coach assigné depuis plus de 7 jours, triées par ancienneté. */
export const NO_COACH_SESSIONS: NoCoachSession[] = [
  { id: 'nc1', ehpad: 'Résidence Horizon', slot: 'Lun. 14:00', unit: 'UVP', ageDays: 19 },
  { id: 'nc2', ehpad: 'Le Clos Fleuri', slot: 'Mer. 10:00', unit: 'EHPAD', ageDays: 14 },
  { id: 'nc3', ehpad: 'Villa Sérénité', slot: 'Jeu. 15:00', unit: 'UVP', ageDays: 11 },
  { id: 'nc4', ehpad: 'Les Magnolias', slot: 'Ven. 11:00', unit: 'EHPAD', ageDays: 8 },
];

export interface HighCancelEhpad {
  ehpad: string;
  rate: number; // % d'annulation sur la période
  cancellations: number;
}

/** EHPAD dont le taux d'annulation dépasse le seuil configurable (10 %). */
export const HIGH_CANCELLATION: HighCancelEhpad[] = [
  { ehpad: 'Villa Sérénité', rate: 18, cancellations: 7 },
  { ehpad: 'Résidence Horizon', rate: 14, cancellations: 5 },
  { ehpad: 'Le Clos Fleuri', rate: 11, cancellations: 4 },
];

/* ---- DASH-03 · Séances populaires ---- */

export interface PopularSession {
  id: string;
  ehpad: string;
  slot: string; // jour + heure
  handRaises: number; // mains levées de coachs
  potential: 'high' | 'mid';
}

/** Séances avec le plus de mains levées — créneaux à fort potentiel commercial. */
export const POPULAR_SESSIONS: PopularSession[] = [
  { id: 'p1', ehpad: 'EHPAD Les Tilleuls', slot: 'Mar. 10:00', handRaises: 9, potential: 'high' },
  { id: 'p2', ehpad: 'Résidence Bellevue', slot: 'Jeu. 14:00', handRaises: 7, potential: 'high' },
  { id: 'p3', ehpad: 'La Roseraie', slot: 'Lun. 11:00', handRaises: 6, potential: 'mid' },
  { id: 'p4', ehpad: 'Résidence du Parc', slot: 'Ven. 15:00', handRaises: 5, potential: 'mid' },
  { id: 'p5', ehpad: 'Les Magnolias', slot: 'Mer. 09:00', handRaises: 4, potential: 'mid' },
];

/* ---- DASH-05 · Concentration des coachs ---- */

export interface ConcentrationCoach {
  firstName: string;
  lastName: string;
  zone: string;
  metric: string; // ratio ou compte de pénalités
  action: string; // action recommandée
}

export const CONCENTRATION: {
  stars: ConcentrationCoach[];
  underused: ConcentrationCoach[];
  atRisk: ConcentrationCoach[];
} = {
  // > 35 % d'une zone — risque de dépendance
  stars: [
    { firstName: 'Karim', lastName: 'Benali', zone: 'Lyon 3e', metric: '42 % de la zone', action: 'Diversifier la zone' },
    { firstName: 'Léa', lastName: 'Dubois', zone: 'Villeurbanne', metric: '38 % de la zone', action: 'Recruter en renfort' },
  ],
  // < 50 % du volume cible — sous-utilisés
  underused: [
    { firstName: 'Tom', lastName: 'Lefebvre', zone: 'Lyon 7e', metric: '34 % du volume cible', action: 'Augmenter l’attribution' },
    { firstName: 'Nadia', lastName: 'Cherif', zone: 'Bron', metric: '46 % du volume cible', action: 'Proposer plus de créneaux' },
  ],
  // pénalités cumulées (retards, no-shows, incidents)
  atRisk: [
    { firstName: 'Hugo', lastName: 'Martin', zone: 'Lyon 8e', metric: '3 pénalités', action: 'Entretien de suivi' },
    { firstName: 'Sophie', lastName: 'Marchand', zone: 'Caluire', metric: '2 pénalités', action: 'Surveiller' },
  ],
};

/* ---- DASH-12 · Performance des coachs ---- */

export interface CoachPerfRow {
  firstName: string;
  lastName: string;
  assigned: number;
  completed: number;
  achievement: number; // % d'atteinte du volume cible
  trend: 'up' | 'down' | 'flat';
  atRisk: boolean; // score de pénalité > 10 sur 30 j
}

export const COACH_PERFORMANCE: CoachPerfRow[] = [
  { firstName: 'Karim', lastName: 'Benali', assigned: 24, completed: 23, achievement: 96, trend: 'up', atRisk: false },
  { firstName: 'Léa', lastName: 'Dubois', assigned: 20, completed: 19, achievement: 90, trend: 'up', atRisk: false },
  { firstName: 'Sophie', lastName: 'Marchand', assigned: 18, completed: 15, achievement: 71, trend: 'down', atRisk: false },
  { firstName: 'Nadia', lastName: 'Cherif', assigned: 14, completed: 13, achievement: 62, trend: 'flat', atRisk: false },
  { firstName: 'Hugo', lastName: 'Martin', assigned: 16, completed: 11, achievement: 52, trend: 'down', atRisk: true },
  { firstName: 'Tom', lastName: 'Lefebvre', assigned: 10, completed: 9, achievement: 45, trend: 'flat', atRisk: false },
];

/* ---- DASH-13 · Sensibilité des EHPAD ---- */

export type SensitivityLevel = 'stable' | 'watch' | 'sensitive';

export interface SensitivityRow {
  ehpad: string;
  level: SensitivityLevel;
  reports: number; // comptes-rendus « point de vigilance »
  factors: string[]; // facteurs contributifs récurrents
}

/** Signal de sensibilité calculé à partir des retours récurrents des coachs
    (comptes-rendus + messages confidentiels). */
export const EHPAD_SENSITIVITY: SensitivityRow[] = [
  { ehpad: 'Villa Sérénité', level: 'sensitive', reports: 6, factors: ['Encadrement absent', 'Salle non préparée'] },
  { ehpad: 'Résidence Horizon', level: 'watch', reports: 3, factors: ['Horaires changeants'] },
  { ehpad: 'Le Clos Fleuri', level: 'watch', reports: 3, factors: ['Matériel manquant'] },
  { ehpad: 'EHPAD Les Tilleuls', level: 'stable', reports: 0, factors: [] },
];
