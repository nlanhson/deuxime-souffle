/** Statuts → libellé + variante + icône (la couleur n'est jamais le seul signal). */

import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  CircleSlash,
  Clock3,
  FileQuestion,
  Hourglass,
  RefreshCw,
  Star,
  ThumbsUp,
  Medal,
} from 'lucide-react';
import { getStrings } from '@/i18n';
import type {
  ContractStatus,
  InvoiceStatus,
  SessionStatus,
  UnitType,
} from '@/types/models';

export type ChipVariant = 'info' | 'progress' | 'warning' | 'pending' | 'neutral';

export interface ChipSpec {
  label: string;
  variant: ChipVariant;
  icon: LucideIcon;
}

export function sessionStatusChip(status: SessionStatus): ChipSpec {
  switch (status) {
    case 'a_venir':
      return { label: getStrings().status.session.a_venir, variant: 'info', icon: CalendarClock };
    case 'terminee':
      return { label: getStrings().status.session.terminee, variant: 'progress', icon: CheckCircle2 };
    case 'annulee':
      return { label: getStrings().status.session.annulee, variant: 'neutral', icon: Ban };
    case 'reportee':
      return { label: getStrings().status.session.reportee, variant: 'pending', icon: Clock3 };
  }
}

export function contractStatusChip(status: ContractStatus): ChipSpec {
  switch (status) {
    case 'active':
      return { label: getStrings().status.contract.active, variant: 'progress', icon: CheckCircle2 };
    case 'a_renouveler':
      return { label: getStrings().status.contract.a_renouveler, variant: 'warning', icon: RefreshCw };
    case 'en_attente_validation':
      return {
        label: getStrings().status.contract.en_attente_validation,
        variant: 'pending',
        icon: Hourglass,
      };
    case 'expire':
      return { label: getStrings().status.contract.expire, variant: 'neutral', icon: CircleSlash };
    case 'rejete':
      return { label: getStrings().status.contract.rejete, variant: 'warning', icon: AlertTriangle };
    case 'modification_en_attente':
      return {
        label: getStrings().status.contract.modification_en_attente,
        variant: 'pending',
        icon: Hourglass,
      };
    case 'non_renouvele':
      return { label: getStrings().status.contract.non_renouvele, variant: 'neutral', icon: FileQuestion };
  }
}

export function invoiceStatusChip(status: InvoiceStatus): ChipSpec {
  switch (status) {
    case 'en_attente':
      return { label: getStrings().status.invoice.en_attente, variant: 'pending', icon: Clock3 };
    case 'en_retard':
      return { label: getStrings().status.invoice.en_retard, variant: 'warning', icon: AlertTriangle };
    case 'payee':
      return { label: getStrings().status.invoice.payee, variant: 'progress', icon: CheckCircle2 };
  }
}

export function evaluationChip(done: boolean): ChipSpec {
  return done
    ? { label: getStrings().status.evaluation.done, variant: 'progress', icon: CheckCircle2 }
    : { label: getStrings().status.evaluation.pending, variant: 'pending', icon: Star };
}

export function suitabilityChip(level: 'ideal' | 'bon' | 'acceptable'): ChipSpec {
  switch (level) {
    case 'ideal':
      return { label: getStrings().suitability.ideal, variant: 'progress', icon: Medal };
    case 'bon':
      return { label: getStrings().suitability.bon, variant: 'info', icon: ThumbsUp };
    case 'acceptable':
      return { label: getStrings().suitability.acceptable, variant: 'neutral', icon: CheckCircle2 };
  }
}

/* ---- Types d'unités : libellé + clé de couleur calendrier ---- */

export type UnitTone = 'uc' | 'up' | 'aidants' | 'soignants' | 'autre';

export const unitTone = (unit: UnitType): UnitTone =>
  (({ UC: 'uc', UP_UHR: 'up', AIDANTS: 'aidants', SOIGNANTS: 'soignants', AUTRE: 'autre' }) as const)[
    unit
  ];

export const unitLabel = (unit: UnitType): string => getStrings().units[unit];

export const ALL_UNIT_TYPES: UnitType[] = ['UC', 'UP_UHR', 'AIDANTS', 'SOIGNANTS', 'AUTRE'];
