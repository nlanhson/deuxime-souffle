/** Rendu localisé des données « gravées » au seed / créées par l'API.
 *
 *  Les événements, l'historique de contrat et les notifications stockent un
 *  DISCRIMINANT (`kind` / `type`) + des paramètres — jamais une phrase figée.
 *  Le texte est recomposé ICI, à partir de la langue active, pour que tout se
 *  retraduise au basculement FR ⇄ EN (et non dans la langue de création). */

import type { Copy } from '@/i18n/fr';
import type { AppNotification, ContractHistoryEntry, SessionEvent } from '@/types/models';
import { formatDate, formatTime } from './format';

/** Ligne du journal d'une séance (« Le coach a signalé un retard de 10 min »). */
export function eventText(s: Copy, e: SessionEvent): string {
  const ev = s.events;
  const key = e.messageKey ?? e.kind;
  const p = e.params ?? {};
  switch (key) {
    case 'retard':
      return ev.retard(p.minutes ?? 0);
    case 'report':
      return ev.report(formatDate(p.date ?? ''), formatTime(p.time ?? '00:00'));
    case 'modification':
      return ev.modification(formatDate(p.date ?? ''), formatTime(p.time ?? '00:00'));
    case 'retardCancelled':
      return ev.retardCancelled;
    case 'reportUndone':
      return ev.reportUndone;
    case 'planned':
      return ev.planned;
    case 'rapport_remis':
      return ev.rapport_remis;
    case 'evaluation':
      return ev.evaluation;
    case 'annulation':
      return ev.annulation;
    default:
      return e.label ?? '';
  }
}

/** Entrée de l'historique d'un contrat (libellé de base + détail optionnel). */
export function historyText(s: Copy, h: ContractHistoryEntry): string {
  const base = s.history[h.kind];
  return h.detailKey ? `${base} ${s.history[h.detailKey]}` : base;
}

/** Titre + corps d'une notification, recomposés selon son type et ses paramètres. */
export function notificationContent(s: Copy, n: AppNotification): { title: string; body: string } {
  const t = s.notifications.types;
  const p = n.params ?? {};
  switch (n.type) {
    case 'coach_retard':
      return { title: t.coachLate.title, body: t.coachLate.body(formatTime(p.time ?? '00:00')) };
    case 'eval_due':
      return { title: t.evalDue.title, body: t.evalDue.body(p.count ?? 0) };
    case 'contrat_renouvellement':
      return { title: t.renewal.title, body: t.renewal.body(p.contractRef ?? '', p.days ?? 0) };
    case 'facture':
      return { title: t.invoice.title, body: t.invoice.body(p.invoiceRef ?? '') };
    case 'contacts':
      return { title: t.contacts.title, body: t.contacts.body };
    case 'systeme':
      return { title: t.system.title, body: t.system.body };
  }
}
