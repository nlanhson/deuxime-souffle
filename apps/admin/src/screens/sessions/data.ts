/* Données simulées — Séances (Sessions & Post-Session Report, côté admin).
 * Couvre SESS-16..26 : vues par statut, édition / report / annulation,
 * gestion des incidents (SESS-07), rapports coach (SESS-21..23). // demo */

export type SessionStatus =
  | 'upcoming' // à venir, coach affecté
  | 'inProgress' // en cours (check-in fait)
  | 'completed' // terminée, rapport remis
  | 'incident' // retard / no-show
  | 'cancelled'; // annulée

export interface Report {
  participants: number;
  atmosphere: number; // /5
  difficulties: boolean;
  /** Rapport en 6 étapes : note de synthèse du coach. */
  summary: string;
  /** Message du coach à l'EHPAD. */
  messageToEhpad?: string;
  /** Évaluation EHPAD (si remise). */
  ehpadRating?: number;
  ehpadComment?: string;
  firstTogether?: boolean;
}

export interface Session {
  id: string;
  date: string;
  iso: string;
  time: string;
  duration: string;
  ehpad: string;
  city: string;
  coach: { firstName: string; lastName: string } | null;
  unit: string;
  status: SessionStatus;
  /** Détail d'incident (retard en min, no-show…). */
  incident?: string;
  report?: Report;
}

/** KPIs « séances » — texte (label/hint) dans le dictionnaire `t.sessions.kpis.<id>`. */
export type SessionKpiId = 'today' | 'week' | 'incidents' | 'reports';
export const SESSION_KPIS: { id: SessionKpiId; value: string; lead?: boolean }[] = [
  { id: 'today', value: '38' },
  { id: 'week', value: '142', lead: true },
  { id: 'incidents', value: '2' },
  { id: 'reports', value: '4' },
];

export const SESSIONS: Session[] = [
  {
    id: 'SE-9001',
    date: 'aujourd’hui',
    iso: '2026-06-15T14:00',
    time: '14:00',
    duration: '45 min',
    ehpad: 'La Roseraie',
    city: 'Caluire',
    coach: { firstName: 'Tom', lastName: 'Lefebvre' },
    unit: 'Personnel soignant',
    status: 'incident',
    incident: 'Coach en retard — seuil 10 min franchi, EHPAD notifié',
  },
  {
    id: 'SE-9002',
    date: 'aujourd’hui',
    iso: '2026-06-15T09:30',
    time: '09:30',
    duration: '45 min',
    ehpad: 'EHPAD Les Tilleuls',
    city: 'Villeurbanne',
    coach: { firstName: 'Karim', lastName: 'Benali' },
    unit: 'UP / UHR',
    status: 'completed',
    report: {
      participants: 9,
      atmosphere: 5,
      difficulties: false,
      summary:
        'Séance d’équilibre et de mobilisation douce. Bonne participation, deux résidents ont repris la marche accompagnée.',
      messageToEhpad: 'Mme Laurent a beaucoup progressé — pensez à lui proposer le créneau du jeudi.',
      ehpadRating: 5,
      ehpadComment: 'Le coach a su engager les résidents, très satisfaits.',
      firstTogether: false,
    },
  },
  {
    id: 'SE-9003',
    date: 'aujourd’hui',
    iso: '2026-06-15T11:00',
    time: '11:00',
    duration: '45 min',
    ehpad: 'Résidence Bellevue',
    city: 'Lyon 6e',
    coach: { firstName: 'Sophie', lastName: 'Marchand' },
    unit: 'UC',
    status: 'inProgress',
  },
  {
    id: 'SE-9004',
    date: 'aujourd’hui',
    iso: '2026-06-15T16:00',
    time: '16:00',
    duration: '45 min',
    ehpad: 'Les Magnolias',
    city: 'Bron',
    coach: null,
    unit: 'Aidants / Familles',
    status: 'incident',
    incident: 'No-show coach — séance à réaffecter en urgence',
  },
  {
    id: 'SE-9005',
    date: 'hier',
    iso: '2026-06-14T15:00',
    time: '15:00',
    duration: '45 min',
    ehpad: 'Résidence du Parc',
    city: 'Écully',
    coach: { firstName: 'Léa', lastName: 'Dubois' },
    unit: 'UC',
    status: 'completed',
    report: {
      participants: 7,
      atmosphere: 4,
      difficulties: true,
      summary:
        'Atelier renforcement musculaire. Un résident a manifesté de la fatigue, séance adaptée en cours de route.',
      messageToEhpad: 'Prévoir des chaises supplémentaires la prochaine fois.',
      firstTogether: true,
    },
  },
  {
    id: 'SE-9006',
    date: 'demain',
    iso: '2026-06-16T10:00',
    time: '10:00',
    duration: '45 min',
    ehpad: 'EHPAD Les Tilleuls',
    city: 'Villeurbanne',
    coach: { firstName: 'Karim', lastName: 'Benali' },
    unit: 'UP / UHR',
    status: 'upcoming',
  },
  {
    id: 'SE-9007',
    date: 'demain',
    iso: '2026-06-16T14:30',
    time: '14:30',
    duration: '45 min',
    ehpad: 'La Roseraie',
    city: 'Caluire',
    coach: { firstName: 'Nadia', lastName: 'Cherif' },
    unit: 'Personnel soignant',
    status: 'upcoming',
  },
  {
    id: 'SE-9008',
    date: 'mer. 18 juin',
    iso: '2026-06-18T11:00',
    time: '11:00',
    duration: '45 min',
    ehpad: 'Résidence Bellevue',
    city: 'Lyon 6e',
    coach: { firstName: 'Sophie', lastName: 'Marchand' },
    unit: 'UC',
    status: 'cancelled',
  },
];

/** Tons des statuts — le libellé vit dans `t.sessions.status.<status>`. */
export const STATUS_META: Record<
  SessionStatus,
  { tone: 'neutral' | 'info' | 'progress' | 'warning' | 'danger' }
> = {
  upcoming: { tone: 'info' },
  inProgress: { tone: 'progress' },
  completed: { tone: 'progress' },
  incident: { tone: 'danger' },
  cancelled: { tone: 'neutral' },
};

/* ---- Vue Mois : KPIs + heatmap (densité par jour) ---- */
/** KPIs de la vue Mois — texte dans `t.sessions.monthKpis.<id>`. */
export type MonthKpiId = 'total' | 'done' | 'upcoming' | 'noCoach' | 'incidents';
export const MONTH_KPIS: { id: MonthKpiId; value: string }[] = [
  { id: 'total', value: '215' },
  { id: 'done', value: '182' },
  { id: 'upcoming', value: '27' },
  { id: 'noCoach', value: '3' },
  { id: 'incidents', value: '3' },
];

/** Compte de séances par jour (juin 2026, commence un lundi). 0 = hors mois. */
export const MONTH_DAYS: { day: number; count: number; today?: boolean }[] = [
  ...Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const counts = [4, 6, 8, 5, 7, 2, 0, 9, 11, 7, 6, 10, 3, 0, 8, 12, 9, 5, 7, 4, 0, 6, 8, 10, 9, 7, 3, 0, 5, 8];
    return { day, count: counts[i] ?? 0, ...(day === 15 ? { today: true } : {}) };
  }),
];

/** Vue Semaine : densité par créneau horaire (lun→dim × 9h–17h).
 * WEEK_HOURS = libellés horaires, WEEK_DAYS = jours datés, WEEK_RANGE = plage
 * datée affichée dans le titre : tous du texte daté authoré, NON traduit. */
export const WEEK_HOURS = ['9h', '10h', '11h', '12h', '14h', '15h', '16h', '17h'];
export const WEEK_DAYS = ['Lun 15', 'Mar 16', 'Mer 17', 'Jeu 18', 'Ven 19', 'Sam 20', 'Dim 21'];
export const WEEK_RANGE = '15 au 21 juin';
/** Mois affiché dans le titre de la vue Mois — date authorée, NON traduite. */
export const MONTH_LABEL = 'Juin 2026';
/** Matrice [heure][jour] = nombre de séances. */
export const WEEK_GRID: number[][] = [
  [2, 3, 1, 2, 4, 0, 0],
  [4, 5, 3, 4, 3, 1, 0],
  [3, 4, 2, 5, 4, 0, 0],
  [1, 2, 1, 1, 2, 0, 0],
  [5, 6, 4, 3, 5, 1, 0],
  [4, 3, 5, 4, 3, 0, 0],
  [2, 3, 2, 4, 2, 1, 0],
  [1, 1, 2, 1, 1, 0, 0],
];

/* ---- Détail séance : historique complet (lifecycle/audit) ---- */
export interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
  actor: 'algo' | 'admin' | 'coach' | 'sync' | 'geo' | 'ehpad';
}

/** Historique de référence affiché dans le détail d'une séance. */
export const SESSION_TIMELINE: TimelineEvent[] = [
  { time: 'J-21 · 09:02', title: 'Séance créée', detail: 'Générée depuis le contrat C-2026-018 (récurrence hebdo)', actor: 'admin' },
  { time: 'J-21 · 09:02', title: 'Marqueurs posés', detail: 'CFPPA appliqué — tarif imposé 50 € HT', actor: 'admin' },
  { time: 'J-7 · 06:00', title: 'Algo lancé', detail: '27 coachs UC de la zone notifiés (cascade J-7)', actor: 'algo' },
  { time: 'J-6 · 14:31', title: 'Liste A — 1er positionnement', detail: 'Karim B. positionné · score 92/100', actor: 'coach' },
  { time: 'J-6 · 18:10', title: 'Liste A — 2e positionnement', detail: 'Sophie M. positionnée · score 84/100', actor: 'coach' },
  { time: 'J-5 · 10:20', title: 'Affectation validée', detail: 'Karim B. retenu par Camille R. — suggestion algo confirmée', actor: 'admin' },
  { time: 'J-5 · 10:21', title: 'Notifications envoyées', detail: 'Push + e-mail coach · e-mail EHPAD · copie admin', actor: 'sync' },
  { time: 'J-5 · 10:21', title: 'Synchro Google Calendar', detail: 'Événement créé dans l’agenda du coach', actor: 'sync' },
  { time: 'J · 13:48', title: 'Coach à proximité', detail: 'GPS à 80 m du site — check-in imminent', actor: 'geo' },
];

/** Acteurs de l'historique — libellés des pastilles dans `t.sessions.actor.<actor>`. */
export type TimelineActor = TimelineEvent['actor'];

/* ---- Options pour l'assistant « Créer une séance » ----
 * Métadonnées (value) seulement ; libellés/descriptions dans le dictionnaire,
 * fusionnés en composant via `t.sessions.<group>.<value>`. */
export const SESSION_TYPE_VALUES = ['ponctuelle', 'evenement', 'decouverte', 'test'] as const;
export const SESSION_ORIGIN_VALUES = ['tel', 'mail', 'salon', 'reco', 'campagne', 'web', 'autre'] as const;
export const UNIT_VALUES = ['uc', 'up', 'aidants', 'soignants'] as const;
export const TARIF_VALUES = ['150', '50', '0'] as const;
export const ASSIGN_MODE_VALUES = ['flex', 'fixed', 'direct'] as const;

export type SessionTypeValue = (typeof SESSION_TYPE_VALUES)[number];
export type SessionOriginValue = (typeof SESSION_ORIGIN_VALUES)[number];
export type UnitValue = (typeof UNIT_VALUES)[number];
export type TarifValue = (typeof TARIF_VALUES)[number];
export type AssignModeValue = (typeof ASSIGN_MODE_VALUES)[number];

/** Noms d'établissements — texte libre authoré, NON traduit. */
export const EHPAD_OPTIONS = [
  'EHPAD Les Tilleuls — Villeurbanne',
  'Résidence Bellevue — Lyon 6e',
  'La Roseraie — Caluire',
  'Résidence du Parc — Écully',
  'Les Magnolias — Bron',
];
