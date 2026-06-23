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
/** DT-E3 — créneaux de disponibilité par type d'établissement :
 *  EHPAD (matin 11 h–12 h, après-midi 14 h–17 h) vs structures souples (9 h–19 h). */
export type AvailabilityProfile = 'ehpad' | 'etendu';

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
  /** Détail traduisible optionnel, accolé au libellé de base (rendu via `historyText()`). */
  detailKey?: 'detailFreqDouble' | 'detailReasonBudget';
  label?: string; // ancien rendu FR — repli uniquement
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
  avatarUrl?: string;
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
  /** DT-E5 — contrat « sans fin » (reconduction tacite). endDate garde une
   *  échéance nominale pour la génération des séances, mais l'UI lit ce drapeau. */
  openEnded?: boolean;
  /** DT-E3 — profil de disponibilité prédéfini selon le type d'établissement. */
  availabilityProfile?: AvailabilityProfile;
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
  /** Clé i18n explicite quand le message diffère du `kind` (report→reportUndone,
   *  modification→planned, annulation→retardCancelled). Par défaut = `kind`.
   *  Le texte est rendu via `eventText()` dans la langue active. */
  messageKey?:
    | 'retard'
    | 'report'
    | 'modification'
    | 'annulation'
    | 'rapport_remis'
    | 'evaluation'
    | 'retardCancelled'
    | 'reportUndone'
    | 'planned';
  params?: { minutes?: number; date?: string; time?: string };
  label?: string; // ancien rendu FR — repli uniquement
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
  period: string; // ISO month anchor "YYYY-MM-01" — rendered via formatMonthYear (locale-aware)
  sessionCount: number;
  amountHT: number;
  status: InvoiceStatus;
  dueDate: string;
  paymentDate?: string;
}

export interface AppNotification {
  // NOTI-03/04 — titre + corps rendus via `notificationContent()` dans la langue active
  id: string;
  type: 'coach_retard' | 'eval_due' | 'contrat_renouvellement' | 'facture' | 'contacts' | 'systeme';
  params?: { time?: string; count?: number; contractRef?: string; days?: number; invoiceRef?: string };
  createdAt: string;
  read: boolean;
  link?: string;
}

/* ---------- App-level supporting types ---------- */

export interface SessionUser {
  contactId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
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
  /** DT-E3 — profil de disponibilité (défaut selon le type d'établissement). */
  availabilityProfile: AvailabilityProfile;
  startDate: string | null;
  endDate: string | null;
  /** DT-E5 — « contrat sans fin » : pas de date de fin (reconduction tacite). */
  openEnded: boolean;
  selectedSlotId: string | null;
  removedSlotIds: string[];
}

export interface ContractDraft {
  savedAt: string;
  savedBy: string;
  step: number;
  data: WizardData;
}
