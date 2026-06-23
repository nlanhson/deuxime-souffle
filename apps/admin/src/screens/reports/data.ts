/* Données simulées — Comptes-rendus (SESS-21..23, côté admin).
 * Registre des rapports coach + évaluations EHPAD : complétude, délais. // demo */

export type ReportState = 'complete' | 'missing';
export type EvalState = 'received' | 'missing';

export interface CR {
  id: string;
  date: string;
  ehpad: string;
  coach: string;
  unit: string;
  report: ReportState;
  /** Délai de rendu du rapport (depuis la fin de séance). */
  delay: string;
  delayKind: 'fast' | 'normal' | 'late' | 'none';
  evaluation: EvalState;
  rating: number | null;
}

/** ID de KPI — le libellé/indice (texte) vit dans i18n (`t.reports.kpis[id]`). */
export type CrKpiId = 'total' | 'complete' | 'missing' | 'evals' | 'evalsMissing';

/** Métadonnées de présentation — valeurs + mise en avant ; texte en i18n. */
export const CR_KPIS: { id: CrKpiId; value: string; lead?: boolean }[] = [
  { id: 'total', value: '428' },
  { id: 'complete', value: '389', lead: true },
  { id: 'missing', value: '39' },
  { id: 'evals', value: '312' },
  { id: 'evalsMissing', value: '116' },
];

export const CRS: CR[] = [
  { id: 'cr1', date: '14 juin', ehpad: 'EHPAD Les Tilleuls', coach: 'Karim Benali', unit: 'UP / UHR', report: 'complete', delay: '1 h 45', delayKind: 'fast', evaluation: 'received', rating: 5 },
  { id: 'cr2', date: '14 juin', ehpad: 'Résidence du Parc', coach: 'Léa Dubois', unit: 'UC', report: 'complete', delay: '24 h', delayKind: 'late', evaluation: 'missing', rating: null },
  { id: 'cr3', date: '13 juin', ehpad: 'Résidence Bellevue', coach: 'Sophie Marchand', unit: 'UC', report: 'complete', delay: '3 h 10', delayKind: 'normal', evaluation: 'received', rating: 4 },
  { id: 'cr4', date: '13 juin', ehpad: 'La Roseraie', coach: 'Tom Lefebvre', unit: 'Personnel soignant', report: 'missing', delay: '—', delayKind: 'none', evaluation: 'missing', rating: null },
  { id: 'cr5', date: '12 juin', ehpad: 'Les Magnolias', coach: 'Nadia Cherif', unit: 'Aidants / Familles', report: 'complete', delay: '2 h 30', delayKind: 'normal', evaluation: 'received', rating: 5 },
  { id: 'cr6', date: '12 juin', ehpad: 'EHPAD Les Tilleuls', coach: 'Karim Benali', unit: 'UP / UHR', report: 'complete', delay: '0 h 55', delayKind: 'fast', evaluation: 'received', rating: 5 },
  { id: 'cr7', date: '11 juin', ehpad: 'Résidence Bellevue', coach: 'Sophie Marchand', unit: 'UC', report: 'missing', delay: '—', delayKind: 'none', evaluation: 'missing', rating: null },
  { id: 'cr8', date: '11 juin', ehpad: 'Résidence du Parc', coach: 'Léa Dubois', unit: 'UC', report: 'complete', delay: '4 h 20', delayKind: 'normal', evaluation: 'received', rating: 4 },
];

export const DELAY_TONE = {
  fast: 'progress',
  normal: 'neutral',
  late: 'warning',
  none: 'danger',
} as const;
