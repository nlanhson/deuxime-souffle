/* Données simulées — Facturation & Pennylane (BILL-02,03,08-13).
 * Génération mensuelle, suivi des factures, ajustements, synchro Pennylane. // demo */

export type InvoiceStatus = 'draft' | 'pending' | 'overdue' | 'paid';
export type SyncStatus = 'synced' | 'pending' | 'error' | 'none';

/** `labelKey` resolves to prestation text via i18n (`t.billing.lineLabels[labelKey]`). */
export type LineLabelKey = 'apaSessions';

export interface InvoiceLine {
  labelKey: LineLabelKey;
  qty: number;
  unit: number;
}

export interface Invoice {
  id: string;
  number: string;
  period: string;
  ehpad: string;
  group: string;
  sessions: number;
  amountHt: number;
  status: InvoiceStatus;
  paymentDate?: string;
  dueDate: string;
  sync: SyncStatus;
  markers: ('cfppa' | 'bdc')[];
  lines: InvoiceLine[];
}

/** KPI id — label/hint text lives in i18n (`t.billing.kpis[id]`); value stays here. */
export type BillingKpiId = 'unpaid' | 'pending' | 'avgDelay' | 'month';

export const BILLING_KPIS: { id: BillingKpiId; value: string; tone?: 'danger'; lead?: boolean }[] = [
  { id: 'unpaid', value: '12 480 €', tone: 'danger' },
  { id: 'pending', value: '9' },
  { id: 'avgDelay', value: '34 j' },
  { id: 'month', value: '38 200 €', lead: true },
];

/** Invoice-status tone — label text lives in i18n (`t.billing.status[status]`). */
export const STATUS_META: Record<
  InvoiceStatus,
  { tone: 'neutral' | 'info' | 'progress' | 'warning' | 'danger' }
> = {
  draft: { tone: 'neutral' },
  pending: { tone: 'warning' },
  overdue: { tone: 'danger' },
  paid: { tone: 'progress' },
};

/** Pennylane sync tone — label text lives in i18n (`t.billing.sync[status]`). */
export const SYNC_META: Record<SyncStatus, { tone: 'neutral' | 'info' | 'progress' | 'danger' }> = {
  synced: { tone: 'progress' },
  pending: { tone: 'info' },
  error: { tone: 'danger' },
  none: { tone: 'neutral' },
};

function lines(sessions: number, rate: number): InvoiceLine[] {
  return [{ labelKey: 'apaSessions', qty: sessions, unit: rate }];
}

export const INVOICES: Invoice[] = [
  {
    id: 'IN-01',
    number: 'DS-2026-0612',
    period: 'Mai 2026',
    ehpad: 'EHPAD Les Tilleuls',
    group: 'Korian',
    sessions: 32,
    amountHt: 2496,
    status: 'overdue',
    dueDate: '10/06/2026',
    sync: 'synced',
    markers: [],
    lines: lines(32, 78),
  },
  {
    id: 'IN-02',
    number: 'DS-2026-0613',
    period: 'Mai 2026',
    ehpad: 'Résidence Bellevue',
    group: 'Korian',
    sessions: 28,
    amountHt: 2100,
    status: 'overdue',
    dueDate: '10/06/2026',
    sync: 'synced',
    markers: [],
    lines: lines(28, 75),
  },
  {
    id: 'IN-03',
    number: 'DS-2026-0614',
    period: 'Mai 2026',
    ehpad: 'La Roseraie',
    group: 'Réseau Lyon Santé',
    sessions: 18,
    amountHt: 1296,
    status: 'pending',
    dueDate: '30/06/2026',
    sync: 'synced',
    markers: ['cfppa'],
    lines: lines(18, 72),
  },
  {
    id: 'IN-04',
    number: 'DS-2026-0615',
    period: 'Mai 2026',
    ehpad: 'Les Magnolias',
    group: 'Groupe DomusVi',
    sessions: 12,
    amountHt: 840,
    status: 'pending',
    dueDate: '30/06/2026',
    sync: 'error',
    markers: ['cfppa'],
    lines: lines(12, 70),
  },
  {
    id: 'IN-05',
    number: 'DS-2026-0616',
    period: 'Juin 2026',
    ehpad: 'EHPAD Les Tilleuls',
    group: 'Korian',
    sessions: 30,
    amountHt: 2340,
    status: 'draft',
    dueDate: '10/07/2026',
    sync: 'pending',
    markers: [],
    lines: lines(30, 78),
  },
  {
    id: 'IN-06',
    number: 'DS-2026-0617',
    period: 'Juin 2026',
    ehpad: 'Résidence du Parc',
    group: 'Indépendant',
    sessions: 16,
    amountHt: 1184,
    status: 'draft',
    dueDate: '10/07/2026',
    sync: 'pending',
    markers: ['bdc'],
    lines: lines(16, 74),
  },
  {
    id: 'IN-07',
    number: 'DS-2026-0598',
    period: 'Avril 2026',
    ehpad: 'EHPAD Les Tilleuls',
    group: 'Korian',
    sessions: 31,
    amountHt: 2418,
    status: 'paid',
    paymentDate: '02/06/2026',
    dueDate: '10/05/2026',
    sync: 'synced',
    markers: [],
    lines: lines(31, 78),
  },
  {
    id: 'IN-08',
    number: 'DS-2026-0599',
    period: 'Avril 2026',
    ehpad: 'Résidence Bellevue',
    group: 'Korian',
    sessions: 27,
    amountHt: 2025,
    status: 'paid',
    paymentDate: '28/05/2026',
    dueDate: '10/05/2026',
    sync: 'synced',
    markers: [],
    lines: lines(27, 75),
  },
];
