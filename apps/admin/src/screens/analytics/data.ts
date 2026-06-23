/* Données simulées — Analytics opérationnel (DASH-01..15). // demo
 * Le texte visible (libellés de métriques, périodes) vit dans le dictionnaire
 * i18n sous `analytics`; ici on ne garde que les valeurs/métadonnées non-texte
 * et les données chiffrées libres (hints porteurs de nombres). */

/** Clés de filtre de période — le libellé vit dans `t.analytics.periods`. */
export type TimeFilterKey = '1' | '3' | '6' | '12';
export const TIME_FILTERS: { value: TimeFilterKey }[] = [
  { value: '1' },
  { value: '3' },
  { value: '6' },
  { value: '12' },
];

/** Clés de métriques santé — le libellé vit dans `t.analytics.health`. */
export type HealthId = 'incident' | 'report' | 'late' | 'noshow' | 'recovered';
export const HEALTH: { id: HealthId; value: string; hint: string }[] = [
  { id: 'incident', value: '3,4 %', hint: '12 incidents' },
  { id: 'report', value: '2,1 %', hint: '8 reports' },
  { id: 'late', value: '1,8 %', hint: '7 cas' },
  { id: 'noshow', value: '0,9 %', hint: '3 cas' },
  { id: 'recovered', value: '2,3 %', hint: '9 cas' },
];

/** Clés de métriques activité — le libellé vit dans `t.analytics.activity`. */
export type ActivityId = 'sessions' | 'revenue' | 'coachCost' | 'fill';
export const ACTIVITY: { id: ActivityId; value: string; hint: string; lead?: boolean }[] = [
  { id: 'sessions', value: '428', hint: '+12 % vs T-1', lead: false },
  { id: 'revenue', value: '64 200 €', hint: '+9 % vs T-1', lead: true },
  { id: 'coachCost', value: '17 850 €', hint: 'marge 72 %' },
  { id: 'fill', value: '92 %', hint: '+3 pts' },
];

export const PRICING = {
  avg: '141 €',
  trend: '+4 % vs T-1',
  distribution: [
    // Libellés de paliers tarifaires : noms de schémas + montants (texte libre, non traduits).
    { label: '50 € (CFPPA)', count: 42, ratio: 0.18 },
    { label: '130 € (groupe)', count: 96, ratio: 0.4 },
    { label: '150 € (standard)', count: 214, ratio: 0.9 },
    { label: '180 € (premium)', count: 38, ratio: 0.16 },
  ],
};

export interface RevenueRow {
  ehpad: string;
  group: string;
  sessions: number;
  avgRate: number;
  revenue: number;
  margin: number; // %
}

export const REVENUE_BY_EHPAD: RevenueRow[] = [
  { ehpad: 'EHPAD Les Tilleuls', group: 'Korian', sessions: 96, avgRate: 78, revenue: 7488, margin: 71 },
  { ehpad: 'Résidence Bellevue', group: 'Korian', sessions: 84, avgRate: 75, revenue: 6300, margin: 70 },
  { ehpad: 'La Roseraie', group: 'Lyon Santé', sessions: 52, avgRate: 72, revenue: 3744, margin: 68 },
  { ehpad: 'Résidence du Parc', group: 'Indépendant', sessions: 48, avgRate: 74, revenue: 3552, margin: 69 },
  { ehpad: 'Les Magnolias', group: 'DomusVi', sessions: 36, avgRate: 70, revenue: 2520, margin: 67 },
  { ehpad: 'Villa Sérénité', group: 'Indépendant', sessions: 28, avgRate: 70, revenue: 1960, margin: 66 },
  { ehpad: 'Le Clos Fleuri', group: 'Indépendant', sessions: 24, avgRate: 72, revenue: 1728, margin: 68 },
  { ehpad: 'Résidence Horizon', group: 'DomusVi', sessions: 20, avgRate: 68, revenue: 1360, margin: 65 },
];

export const REVENUE_BY_GROUP = [
  { group: 'Korian', revenue: '13 788 €', sessions: 180, homes: 6, trend: '+11 %' },
  { group: 'DomusVi', revenue: '3 880 €', sessions: 56, homes: 4, trend: '+4 %' },
  { group: 'Lyon Santé', revenue: '3 744 €', sessions: 52, homes: 3, trend: '+7 %' },
  { group: 'Indépendants', revenue: '7 240 €', sessions: 100, homes: 5, trend: '−2 %' },
];

export const TOP_COACHES = [
  { name: 'Karim Benali', sessions: 96, rating: 4.8 },
  { name: 'Sophie Marchand', sessions: 84, rating: 4.6 },
  { name: 'Léa Dubois', sessions: 72, rating: 4.9 },
  { name: 'Nadia Cherif', sessions: 58, rating: 4.7 },
  { name: 'Tom Lefebvre', sessions: 44, rating: 4.4 },
];

export const TOP_EHPADS = [
  { name: 'EHPAD Les Tilleuls', sessions: 96, rating: 4.7 },
  { name: 'Résidence Bellevue', sessions: 84, rating: 4.5 },
  { name: 'La Roseraie', sessions: 52, rating: 4.6 },
  { name: 'Résidence du Parc', sessions: 48, rating: 4.4 },
  { name: 'Les Magnolias', sessions: 36, rating: 4.8 },
];
