/** Domain model — built exactly from the build prompt §1.8.
 *  Dates are ISO `YYYY-MM-DD` strings, times are `HH:mm`.
 *  IDs are stable string slugs so cross-references read clearly. */

export type Role = 'admin' | 'user'; // admin = Contact principal, user = Autre contact
export type UnitType = 'UC' | 'UP_UHR' | 'AIDANTS' | 'SOIGNANTS' | 'AUTRE';
export type SessionStatus = 'a_venir' | 'terminee' | 'annulee' | 'reportee';
export type ContractStatus =
  | 'active'
  | 'a_renouveler'
  | 'en_attente_validation'
  | 'expire'
  | 'rejete'
  | 'modification_en_attente'
  | 'non_renouvele';
export type InvoiceStatus = 'en_attente' | 'en_retard' | 'payee';
export type Frequency = 'hebdo' | 'bihebdo' | 'bimensuel' | 'mensuel' | 'ponctuel';
export type SessionType = 'collective' | 'individuelle';

export interface Address {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
}

export type ContactRole =
  | 'comptable'
  | 'coordinateur_animation'
  | 'directeur'
  | 'psychomotricien'
  | 'ergotherapeute'
  | 'psychologue'
  | 'specialiste_apa'
  | 'directeur_adjoint'
  | 'autre';

export interface StandardSession {
  id: string;
  label: string;
  weekday: number; // 0 = lundi … 6 = dimanche
  time: string;
  durationMin: number;
  unitType: UnitType;
}

/** Exclusions de planification (CON-02) — half-day weekly blocks + special periods. */
export interface ExcludedSlot {
  id: string;
  kind: 'demi_journee' | 'fermeture' | 'jour_unique' | 'periode_recurrente';
  part: 'journee' | 'matin' | 'apres_midi';
  weekday?: number; // demi_journee only
  startDate?: string; // periods only
  endDate?: string;
  label: string; // plain-French render
}

export interface ContractHistoryEntry {
  id: string;
  at: string; // ISO datetime
  by: string;
  kind:
    | 'creation'
    | 'soumission'
    | 'validation'
    | 'modification_mineure'
    | 'modification_majeure'
    | 'rejet'
    | 'resoumission'
    | 'renouvellement'
    | 'non_renouvellement';
  label: string;
}

export interface Facility {
  // AUTH-10/11, EST-09 — exactly one
  id: string;
  tradeName: string;
  companyName: string;
  siret: string;
  vatNumber: string;
  category: string;
  group?: { id: string; name: string }; // EST-09: read-only EHPAD-side; absent ⇒ "non rattaché"
  status: 'actif' | 'inactif';
  units: UnitType[];
  addresses: { main: Address; billing: Address; sessionLocation?: Address };
  defaultSessionRate: number;
  markers: string[];
  standardSessions: StandardSession[];
  stats: { totalCompleted: number; thisMonth: number; coachCount: number; upcoming: number };
}

export interface Contact {
  // AUTH-21
  id: string;
  civility: 'M' | 'Mme' | 'Mlle';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'principal' | 'additionnel';
  isSessionCoordinator: boolean;
  roles: ContactRole[];
  otherRoleLabel?: string;
  account?: { role: Role; active: boolean };
}

export interface Contract {
  // CON-01..16
  id: string;
  reference: string; // "CT-2026-014"
  status: ContractStatus;
  units: UnitType[];
  frequency: Frequency;
  sessionType: SessionType;
  startDate: string;
  endDate: string;
  availabilityNotes?: string;
  excludedSlots: ExcludedSlot[]; // CON-02
  rejectionReason?: string; // CON-06
  generatedSessionCount: number;
  completedSessionCount: number;
  rate: number;
  avgRatingFromFacility?: number; // CON-03 contract-level average
  history: ContractHistoryEntry[];
}

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  avgRatingFromFacility?: number; // CON-03 per-coach average from this facility
}

export interface Session {
  // SESS-04/08/09/10/11/12/13
  id: string;
  contractId: string;
  coachId: string | null; // null ⇒ non assignée (modifiable, SESS-10)
  date: string;
  time: string;
  durationMin: number;
  unitType: UnitType; // drives calendar colour
  status: SessionStatus;
  isFirstTogether?: boolean; // SESS-04
  report?: SessionReport;
  evaluation?: Evaluation;
  coachMessage?: string; // SESS-09
  modificationHistory: { at: string; by: string; change: string }[];
  events: SessionEvent[]; // NOTI-03 journal des événements
}

export interface SessionEvent {
  // NOTI-03 + audit — renders in the "Journal des événements"
  id: string;
  at: string; // ISO datetime
  kind: 'retard' | 'report' | 'modification' | 'annulation' | 'rapport_remis' | 'evaluation';
  label: string; // plain-French line
}

export interface SessionReport {
  // SESS-04
  participantCount: number;
  atmosphere: { stars: number; emoji: string };
  hadDifficulties: boolean;
  difficultiesNote?: string;
  evaluationSummary: string;
}

export interface Evaluation {
  // SESS-13
  stars: number;
  impression: 'tres_bien' | 'bien' | 'correct' | 'a_ameliorer';
  comment?: string;
  submittedAt: string;
  submittedBy: string;
}

export interface Invoice {
  // BILL-01 — all amounts HT (hors taxes)
  id: string;
  number: string;
  period: string; // "Mai 2026"
  sessionCount: number;
  amountHT: number;
  status: InvoiceStatus;
  dueDate: string;
  paymentDate?: string;
}

export interface AppNotification {
  // NOTI-03/04
  id: string;
  type: 'coach_retard' | 'eval_due' | 'contrat_renouvellement' | 'facture' | 'contacts' | 'systeme';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

/* ---------- App-level supporting types ---------- */

export interface SessionUser {
  contactId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

/** CON-08 — precomputed suggestion (the mock "matching"). */
export interface SlotSuggestion {
  id: string;
  weekday: number; // 0 = lundi
  time: string;
  suitability: 'ideal' | 'bon' | 'acceptable';
  reason: string;
}

/** SESS-12 — postponement proposal. */
export interface PostponeOption {
  id: string;
  date: string;
  time: string;
  horizon: 'deux_semaines' | 'deux_a_six_semaines';
  recommended: boolean;
}

/** Contract wizard state (CON-01/02/08) — persisted as a shared draft. */
export interface WeeklyExclusion {
  weekday: number; // 0 = lundi … 6 = dimanche
  part: 'matin' | 'apres_midi';
}

export interface SpecialPeriod {
  id: string;
  kind: 'fermeture' | 'jour_unique' | 'recurrent';
  label: string;
  startDate: string;
  endDate?: string;
  part: 'journee' | 'matin' | 'apres_midi';
}

export interface WizardData {
  frequency: Frequency | null;
  sessionType: SessionType | null;
  units: UnitType[];
  otherUnitLabel: string;
  multiUnitPlanning: 'meme_jour' | 'jours_separes' | null;
  weeklyExclusions: WeeklyExclusion[];
  specialPeriods: SpecialPeriod[];
  planningNotes: string;
  startDate: string | null;
  endDate: string | null;
  selectedSlotId: string | null;
  removedSlotIds: string[];
}

export interface ContractDraft {
  savedAt: string;
  savedBy: string;
  step: number;
  data: WizardData;
}
