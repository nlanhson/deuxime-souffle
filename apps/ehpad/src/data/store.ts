/** Magasin en mémoire — l'unique « backend » du prototype.
 *  Un rechargement de page revient au jeu de données initial : attendu. */

import type {
  AppNotification,
  Coach,
  Contact,
  Contract,
  ContractDraft,
  Facility,
  Invoice,
  Session,
} from '@/types/models';
import { bootConfig } from '@/data/config';
import { buildEmptySeed } from '@/data/seed/empty';
import { buildRichSeed } from '@/data/seed/rich';

export interface DB {
  facility: Facility;
  contacts: Contact[];
  coaches: Coach[];
  contracts: Contract[];
  sessions: Session[];
  invoices: Invoice[];
  notifications: AppNotification[];
  contactsLastConfirmedAt: string;
  facilityHistory: { at: string; by: string; label: string }[];
  contractDraft: ContractDraft | null;
  deleteRequests: { at: string; by: string; reason?: string }[];
}

const db: DB = bootConfig.fixture === 'empty' ? buildEmptySeed() : buildRichSeed();
let version = 0;
const listeners = new Set<() => void>();

export const getDb = (): DB => db;
export const getVersion = (): number => version;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** À appeler après chaque mutation : notifie les écrans abonnés. */
export function commit(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}
