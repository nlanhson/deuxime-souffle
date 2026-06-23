/* Données simulées — Établissements & Groupes (EST-01..09, GROUP-01..05).
 * Profils EHPAD, contacts, rattachement de groupe, tarification, statut. // demo */

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
  primary?: boolean;
}

export interface Establishment {
  id: string;
  name: string;
  company: string;
  siret: string;
  vat: string;
  category: string;
  city: string;
  group: string | null;
  status: 'active' | 'inactive';
  units: string[];
  defaultRate: number;
  activeContracts: number;
  sessionsThisMonth: number;
  totalSessions: number;
  coaches: number;
  contacts: Contact[];
}

/* KPI presentation metadata — label/hint text lives in i18n (keyed by id). */
export type EstKpiId = 'active' | 'groups' | 'avgRate' | 'sessionsMonth';

export const EST_KPIS: { id: EstKpiId; value: string; lead?: boolean }[] = [
  { id: 'active', value: '18' },
  { id: 'groups', value: '3' },
  { id: 'avgRate', value: '74 €', lead: true },
  { id: 'sessionsMonth', value: '612' },
];

export const GROUPS = [
  { id: 'g1', name: 'Groupe Korian', count: 6, city: 'National' },
  { id: 'g2', name: 'Groupe DomusVi', count: 4, city: 'National' },
  { id: 'g3', name: 'Réseau Lyon Santé', count: 3, city: 'Métropole de Lyon' },
];

/* ---- Marqueurs CFPPA / Bon de commande (référence, pas d'impact algo) ---- */
/* label/desc text lives in i18n (keyed by id); numeric stats stay here. */
export type MarkerId = 'cfppa' | 'bdc';

export const MARKERS_INFO: { id: MarkerId; sessions: number; homes: number; revenue: string }[] = [
  { id: 'cfppa', sessions: 42, homes: 14, revenue: '2 100 €' },
  { id: 'bdc', sessions: 28, homes: 9, revenue: '4 760 €' },
];

/* ---- Options de l'assistant « Créer un établissement » ----
   value = stable key (metadata); displayed label text lives in i18n,
   merged in the component (e.g. t.establishments.wizard.categories[value]). */
export const EST_CATEGORIES = [
  { value: 'public' },
  { value: 'prive' },
  { value: 'asso' },
  { value: 'autonomie' },
  { value: 'rss' },
  { value: 'usld' },
  { value: 'autre' },
];

export const GROUP_SELECT = [
  { value: 'none' },
  { value: 'korian' },
  { value: 'domusvi' },
  { value: 'lyon' },
];

export const EST_UNITS = [
  { value: 'uc' },
  { value: 'up' },
  { value: 'aidants' },
  { value: 'soignants' },
];

export const EST_TARIFS = [
  { value: '150' },
  { value: '130' },
  { value: '50' },
];

const CONTACTS_KORIAN: Contact[] = [
  {
    name: 'Hélène Faure',
    role: 'Directrice',
    email: 'h.faure@bellevue.fr',
    phone: '04 72 00 11 22',
    primary: true,
  },
  {
    name: 'Marc Dubois',
    role: 'Animateur / coordinateur de séances',
    email: 'm.dubois@bellevue.fr',
    phone: '04 72 00 11 23',
  },
];

export const ESTABLISHMENTS: Establishment[] = [
  {
    id: 'EH-01',
    name: 'EHPAD Les Tilleuls',
    company: 'SAS Les Tilleuls',
    siret: '812 345 678 00021',
    vat: 'FR 32 812345678',
    category: 'EHPAD public',
    city: 'Villeurbanne',
    group: 'Groupe Korian',
    status: 'active',
    units: ['UP / UHR', 'UC'],
    defaultRate: 78,
    activeContracts: 1,
    sessionsThisMonth: 32,
    totalSessions: 412,
    coaches: 3,
    contacts: CONTACTS_KORIAN,
  },
  {
    id: 'EH-02',
    name: 'Résidence Bellevue',
    company: 'SARL Bellevue Santé',
    siret: '799 112 334 00015',
    vat: 'FR 21 799112334',
    category: 'EHPAD privé',
    city: 'Lyon 6e',
    group: 'Groupe Korian',
    status: 'active',
    units: ['UC', 'UP / UHR'],
    defaultRate: 75,
    activeContracts: 2,
    sessionsThisMonth: 28,
    totalSessions: 318,
    coaches: 4,
    contacts: CONTACTS_KORIAN,
  },
  {
    id: 'EH-03',
    name: 'La Roseraie',
    company: 'Association La Roseraie',
    siret: '534 998 221 00010',
    vat: 'FR 18 534998221',
    category: 'EHPAD associatif',
    city: 'Caluire',
    group: 'Réseau Lyon Santé',
    status: 'active',
    units: ['Personnel soignant'],
    defaultRate: 72,
    activeContracts: 1,
    sessionsThisMonth: 18,
    totalSessions: 204,
    coaches: 2,
    contacts: [
      {
        name: 'Sandrine Petit',
        role: 'Animatrice',
        email: 's.petit@roseraie.org',
        phone: '04 78 00 44 55',
        primary: true,
      },
    ],
  },
  {
    id: 'EH-04',
    name: 'Résidence du Parc',
    company: 'SAS Parc Résidences',
    siret: '901 223 445 00033',
    vat: 'FR 44 901223445',
    category: 'EHPAD privé',
    city: 'Écully',
    group: null,
    status: 'active',
    units: ['UC'],
    defaultRate: 74,
    activeContracts: 1,
    sessionsThisMonth: 16,
    totalSessions: 152,
    coaches: 2,
    contacts: [
      {
        name: 'Pauline Roche',
        role: 'Directrice adjointe',
        email: 'p.roche@residenceparc.fr',
        phone: '04 78 22 33 44',
        primary: true,
      },
    ],
  },
  {
    id: 'EH-05',
    name: 'Les Magnolias',
    company: 'DomusVi Bron',
    siret: '655 778 991 00027',
    vat: 'FR 09 655778991',
    category: 'EHPAD privé',
    city: 'Bron',
    group: 'Groupe DomusVi',
    status: 'active',
    units: ['Aidants / Familles'],
    defaultRate: 70,
    activeContracts: 1,
    sessionsThisMonth: 12,
    totalSessions: 96,
    coaches: 2,
    contacts: [
      {
        name: 'Julien Mercier',
        role: 'Directeur',
        email: 'j.mercier@magnolias.fr',
        phone: '04 72 88 99 00',
        primary: true,
      },
    ],
  },
  {
    id: 'EH-06',
    name: 'Le Clos Fleuri',
    company: 'SARL Clos Fleuri',
    siret: '422 556 778 00019',
    vat: 'FR 55 422556778',
    category: 'EHPAD privé',
    city: 'Oullins',
    group: null,
    status: 'inactive',
    units: ['UP / UHR'],
    defaultRate: 72,
    activeContracts: 0,
    sessionsThisMonth: 0,
    totalSessions: 188,
    coaches: 0,
    contacts: [
      {
        name: 'Claire Bonnet',
        role: 'Directrice',
        email: 'c.bonnet@closfleuri.fr',
        phone: '04 78 50 60 70',
        primary: true,
      },
    ],
  },
];
