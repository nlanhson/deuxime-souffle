/** Jeu de données « vide » (?state=empty) — un établissement tout neuf :
 *  zéro séance, contrat, facture ou notification, et pas de groupe (EST-09
 *  « non rattaché »). Les deux comptes de connexion restent disponibles. */

import { addDays } from '@/lib/calendar';
import { toIso } from '@/lib/format';
import type { Contact, Facility } from '@/types/models';
import type { DB } from '@/data/store';

export function buildEmptySeed(): DB {
  const today = new Date();

  const facility: Facility = {
    id: 'ehpad-les-tilleuls',
    tradeName: 'EHPAD Les Tilleuls',
    companyName: 'SAS Résidence Les Tilleuls',
    siret: '832 147 569 00027',
    vatNumber: 'FR32 832147569',
    category: 'EHPAD privé associatif',
    status: 'actif',
    units: ['UC'],
    addresses: {
      main: { line1: '12 rue des Tilleuls', postalCode: '69005', city: 'Lyon' },
      billing: { line1: '12 rue des Tilleuls', postalCode: '69005', city: 'Lyon' },
    },
    defaultSessionRate: 65,
    markers: [],
    standardSessions: [],
    stats: { totalCompleted: 0, thisMonth: 0, coachCount: 0, upcoming: 0 },
  };

  const contacts: Contact[] = [
    {
      id: 'c-sophie',
      civility: 'Mme',
      firstName: 'Sophie',
      lastName: 'Mercier',
      email: 'sophie.mercier@les-tilleuls.fr',
      phone: '0612345678',
      type: 'principal',
      isSessionCoordinator: true,
      roles: ['directeur'],
      account: { role: 'admin', active: true },
    },
    {
      id: 'c-thomas',
      civility: 'M',
      firstName: 'Thomas',
      lastName: 'Lefèvre',
      email: 'thomas.lefevre@les-tilleuls.fr',
      phone: '0698765432',
      type: 'additionnel',
      isSessionCoordinator: false,
      roles: ['coordinateur_animation'],
      account: { role: 'user', active: true },
    },
  ];

  return {
    facility,
    contacts,
    coaches: [],
    contracts: [],
    sessions: [],
    invoices: [],
    notifications: [],
    contactsLastConfirmedAt: `${toIso(addDays(today, -10))}T09:00:00`,
    facilityHistory: [],
    contractDraft: null,
    deleteRequests: [],
  };
}
