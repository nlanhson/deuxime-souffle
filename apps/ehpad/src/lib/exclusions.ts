/** Aide CON-02 — savoir si un jour est entièrement indisponible
 *  (utilisé par les sélecteurs de date pour griser les jours fermés). */

import { mondayIndex } from '@/lib/calendar';
import { toIso } from '@/lib/format';
import type { ExcludedSlot } from '@/types/models';

export function isDayFullyExcluded(slots: ExcludedSlot[], date: Date): boolean {
  const weekday = mondayIndex(date);
  const iso = toIso(date);
  let am = false;
  let pm = false;

  for (const slot of slots) {
    if (slot.kind === 'demi_journee') {
      if (slot.weekday !== weekday) continue;
      if (slot.part === 'journee') return true;
      if (slot.part === 'matin') am = true;
      if (slot.part === 'apres_midi') pm = true;
    } else if (slot.startDate) {
      const end = slot.endDate ?? slot.startDate;
      if (iso >= slot.startDate && iso <= end) {
        if (slot.part === 'journee') return true;
        if (slot.part === 'matin') am = true;
        if (slot.part === 'apres_midi') pm = true;
      }
    }
  }
  return am && pm;
}
