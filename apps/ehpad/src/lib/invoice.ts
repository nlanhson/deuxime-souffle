import type { Coach, Invoice, UnitType } from '@/types/models';

export interface InvoiceLine {
  /** ISO yyyy-mm-dd — séance dans le mois facturé. */
  date: string;
  coachId: string;
  unitType: UnitType;
  /** Montant HT de la séance. */
  amount: number;
}

/** Unités en rotation pour le détail (toutes les séances DS sont collectives — cf.
 *  DT-E4 ; le « type » d'une ligne renvoie donc à l'unité desservie). */
const LINE_UNIT_ROTATION: UnitType[] = ['UC', 'AIDANTS', 'UP_UHR', 'SOIGNANTS'];

/**
 * Détail séance-par-séance d'une facture mensuelle — données simulées mais
 * **déterministes** (prototype sans backend) : `sessionCount` lignes au prix
 * unitaire (montant ÷ nb séances, soit 65 € HT dans le jeu de données), réparties
 * dans le mois facturé, coachs et unités en rotation. La somme des lignes égale
 * toujours exactement `amountHT` (la dernière ligne absorbe l'arrondi).
 */
export function invoiceLineItems(invoice: Invoice, coaches: Coach[]): InvoiceLine[] {
  const n = invoice.sessionCount;
  if (n <= 0 || coaches.length === 0) return [];

  const unit = Math.round(invoice.amountHT / n);
  const [year, month] = invoice.period.split('-').map(Number); // "YYYY-MM-01"
  const mm = String(month).padStart(2, '0');

  const lines: InvoiceLine[] = [];
  let allocated = 0;
  for (let i = 0; i < n; i += 1) {
    // Index toujours dans les bornes (modulo) ; `?? …[0]` / `?? 'UC'` satisfont
    // `noUncheckedIndexedAccess` sans assertion non-null.
    const coach = coaches[i % coaches.length] ?? coaches[0];
    if (!coach) continue;
    const day = Math.min(28, 3 + i * 3); // réparti dans le mois, déterministe
    const amount = i === n - 1 ? invoice.amountHT - allocated : unit;
    allocated += unit;
    lines.push({
      date: `${year}-${mm}-${String(day).padStart(2, '0')}`,
      coachId: coach.id,
      unitType: LINE_UNIT_ROTATION[i % LINE_UNIT_ROTATION.length] ?? 'UC',
      amount,
    });
  }
  return lines;
}
