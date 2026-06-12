/** « Backend » simulé — toutes les lectures/écritures passent par ici.
 *  Chaque appel renvoie une Promise avec 150–400 ms de latence pour que les
 *  squelettes de chargement soient réels. ?debug=error fait échouer tous les
 *  appels, ?debug=slow les ralentit (états d'erreur / chargement à la demande).
 *  Tout ce qui serait côté serveur en production est marqué // STUB:. */

import { getStrings } from '@/i18n';
import { addDays, addMonths, mondayIndex } from '@/lib/calendar';
import { formatDate, formatTime, parseDate, toIso } from '@/lib/format';
import type {
  AppNotification,
  Coach,
  Contact,
  Contract,
  ContractDraft,
  ContractHistoryEntry,
  Evaluation,
  Facility,
  Frequency,
  Invoice,
  PostponeOption,
  Session,
  SessionType,
  SessionUser,
  SlotSuggestion,
  SpecialPeriod,
  WizardData,
} from '@/types/models';
import { bootConfig } from '@/data/config';
import { commit, getDb } from '@/data/store';

/* ---------- latence + pannes simulées ---------- */

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function wait(): Promise<void> {
  if (bootConfig.debug === 'error') {
    await sleep(400);
    throw new Error('SIMULATION'); // STUB: panne simulée via ?debug=error
  }
  await sleep(bootConfig.debug === 'slow' ? 2500 : 150 + Math.random() * 250);
}

let seq = 1000;
const newId = (prefix: string) => `${prefix}-${(seq += 1)}`;
const nowIso = () => new Date().toISOString();

/* ============================ AUTHENTIFICATION ============================ */
// STUB: aucune vraie authentification — identifiants vérifiés contre le seed.

export type LoginResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: 'invalid' | 'inactive' };

export async function login(email: string, password: string): Promise<LoginResult> {
  await wait();
  const contact = getDb().contacts.find(
    (c) => c.account && c.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!contact?.account || password.length === 0) return { ok: false, reason: 'invalid' };
  if (!contact.account.active) return { ok: false, reason: 'inactive' };
  return {
    ok: true,
    user: {
      contactId: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      role: contact.account.role,
    },
  };
}

// STUB: liens d'invitation/réinitialisation vérifiés contre une liste codée en dur
// pour que les états valide / expiré / déjà utilisé soient tous démontrables.
const ACTIVATION_TOKENS: Record<string, 'valid' | 'expired' | 'used'> = {
  'invitation-valide': 'valid',
  'invitation-expiree': 'expired',
  'invitation-utilisee': 'used',
};
const RESET_TOKENS: Record<string, 'valid' | 'expired' | 'used'> = {
  'reset-valide': 'valid',
  'reset-expire': 'expired',
  'reset-utilise': 'used',
};

const INVITE_EMAIL = 'claire.dubois@les-tilleuls.fr';

export type TokenStatus = 'valid' | 'expired' | 'used' | 'invalid';

export async function checkActivationToken(
  token: string,
): Promise<{ status: TokenStatus; email?: string; roleLabels?: string[] }> {
  await wait();
  const status = ACTIVATION_TOKENS[token] ?? 'invalid';
  if (status !== 'valid') return { status };
  const contact = getDb().contacts.find((c) => c.email === INVITE_EMAIL);
  return {
    status: 'valid',
    email: INVITE_EMAIL,
    roleLabels: (contact?.roles ?? ['ergotherapeute']).map((r) => getStrings().contactRoles[r]),
  };
}

export async function activateAccount(
  _token: string,
  payload: { firstName: string; lastName: string; phone: string },
): Promise<void> {
  await wait();
  const contact = getDb().contacts.find((c) => c.email === INVITE_EMAIL);
  if (contact?.account) {
    contact.firstName = payload.firstName;
    contact.lastName = payload.lastName;
    contact.phone = payload.phone;
    contact.account.active = true;
    commit();
  }
  // STUB: en production, le compte serait créé côté serveur.
}

export async function requestPasswordReset(email: string): Promise<void> {
  await wait();
  console.info('// STUB: email de réinitialisation simulé pour', email);
}

export async function checkResetToken(token: string): Promise<TokenStatus> {
  await wait();
  return RESET_TOKENS[token] ?? 'invalid';
}

export async function resetPassword(_token: string): Promise<void> {
  await wait();
  // STUB: aucun mot de passe réellement stocké.
}

/* ============================ LECTURES ============================ */

export async function getFacility(): Promise<Facility> {
  await wait();
  return getDb().facility;
}

export async function getFacilityHistory(): Promise<{ at: string; by: string; label: string }[]> {
  await wait();
  return [...getDb().facilityHistory].sort((a, b) => b.at.localeCompare(a.at));
}

export async function listContacts(): Promise<Contact[]> {
  await wait();
  return getDb().contacts;
}

export async function getContactsLastConfirmed(): Promise<string> {
  await wait();
  return getDb().contactsLastConfirmedAt;
}

export async function listCoaches(): Promise<Coach[]> {
  await wait();
  return getDb().coaches;
}

export async function listSessions(): Promise<Session[]> {
  await wait();
  return getDb().sessions;
}

export async function getSession(id: string): Promise<Session | null> {
  await wait();
  return getDb().sessions.find((s) => s.id === id) ?? null;
}

export async function listContracts(): Promise<Contract[]> {
  await wait();
  return getDb().contracts;
}

export async function getContract(id: string): Promise<Contract | null> {
  await wait();
  return getDb().contracts.find((c) => c.id === id) ?? null;
}

export async function listInvoices(): Promise<Invoice[]> {
  await wait();
  return getDb().invoices;
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  await wait();
  return getDb().invoices.find((i) => i.id === id) ?? null;
}

export async function listNotifications(): Promise<AppNotification[]> {
  await wait();
  return [...getDb().notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ============================ SÉANCES ============================ */

const isExcludedDay = (contract: Contract | undefined, date: Date, time: string): boolean => {
  if (!contract) return false;
  const weekday = mondayIndex(date);
  const hour = Number(time.split(':')[0] ?? 0);
  return contract.excludedSlots.some((slot) => {
    if (slot.kind === 'demi_journee') {
      if (slot.weekday !== weekday) return false;
      if (slot.part === 'journee') return true;
      return slot.part === 'matin' ? hour < 12 : hour >= 12;
    }
    if (slot.startDate) {
      const iso = toIso(date);
      const end = slot.endDate ?? slot.startDate;
      return iso >= slot.startDate && iso <= end;
    }
    return false;
  });
};

/** SESS-10 — la date/heure d'une seule occurrence future non assignée. */
export async function editSessionSchedule(
  id: string,
  date: string,
  time: string,
  by: string,
): Promise<Session> {
  await wait();
  const session = getDb().sessions.find((s) => s.id === id);
  if (!session) throw new Error('introuvable');
  const contract = getDb().contracts.find((c) => c.id === session.contractId);
  if (isExcludedDay(contract, parseDate(date), time)) throw new Error('conflit');
  const label = getStrings().events.modification(formatDate(date), formatTime(time));
  session.date = date;
  session.time = time;
  session.modificationHistory.push({ at: nowIso(), by, change: label });
  session.events.push({ id: newId('ev'), at: nowIso(), kind: 'modification', label });
  commit();
  return session;
}

/** SESS-12 — propositions de report (générateur simulé sur les disponibilités). */
export async function getPostponeOptions(sessionId: string): Promise<PostponeOption[]> {
  await wait();
  const session = getDb().sessions.find((s) => s.id === sessionId);
  if (!session) return [];
  const contract = getDb().contracts.find((c) => c.id === session.contractId);
  const today = new Date();

  const make = (offset: number, time: string, recommended: boolean): PostponeOption | null => {
    let date = addDays(today, offset);
    let guard = 0;
    while (isExcludedDay(contract, date, time) && guard < 7) {
      date = addDays(date, 1);
      guard += 1;
    }
    if (guard >= 7) return null;
    const finalOffset = Math.round((date.getTime() - today.getTime()) / 86_400_000);
    return {
      id: `opt-${sessionId}-${offset}`,
      date: toIso(date),
      time,
      horizon: finalOffset <= 14 ? 'deux_semaines' : 'deux_a_six_semaines',
      recommended,
    };
  };

  // STUB: en production, généré depuis les disponibilités réelles du coach.
  return [
    make(3, '10:00', false),
    make(6, session.time, true),
    make(10, '15:00', false),
    make(21, session.time, false),
    make(32, '10:00', false),
  ].filter((o): o is PostponeOption => o !== null);
}

export interface SessionSnapshot {
  date: string;
  time: string;
  status: Session['status'];
}

export async function postponeSession(
  id: string,
  option: PostponeOption,
  by: string,
): Promise<SessionSnapshot> {
  await wait();
  const session = getDb().sessions.find((s) => s.id === id);
  if (!session) throw new Error('introuvable');
  const prev: SessionSnapshot = { date: session.date, time: session.time, status: session.status };
  const label = getStrings().events.report(formatDate(option.date), formatTime(option.time));
  session.date = option.date;
  session.time = option.time;
  session.status = 'reportee';
  session.modificationHistory.push({ at: nowIso(), by, change: label });
  session.events.push({ id: newId('ev'), at: nowIso(), kind: 'report', label });
  commit();
  return prev;
}

/** Annuler un report (toast « Annuler ») — l'historique reste honnête. */
export async function restoreSession(id: string, prev: SessionSnapshot, by: string): Promise<void> {
  await wait();
  const session = getDb().sessions.find((s) => s.id === id);
  if (!session) return;
  session.date = prev.date;
  session.time = prev.time;
  session.status = prev.status;
  session.modificationHistory.push({ at: nowIso(), by, change: getStrings().events.reportUndone });
  session.events.push({ id: newId('ev'), at: nowIso(), kind: 'report', label: getStrings().events.reportUndone });
  commit();
}

/** SESS-08 — « Planifier une séance » : séance ponctuelle depuis un contrat actif. */
export async function createOneOffSession(
  contractId: string,
  date: string,
  time: string,
): Promise<Session> {
  await wait();
  const contract = getDb().contracts.find((c) => c.id === contractId);
  if (!contract) throw new Error('introuvable');
  const session: Session = {
    id: newId('s-ponctuelle'),
    contractId,
    coachId: null,
    date,
    time,
    durationMin: 60,
    unitType: contract.units[0] ?? 'AUTRE',
    status: 'a_venir',
    modificationHistory: [],
    events: [{ id: newId('ev'), at: nowIso(), kind: 'modification', label: getStrings().events.planned }],
  };
  getDb().sessions.push(session);
  contract.generatedSessionCount += 1;
  commit();
  return session;
}

/* ============================ ÉVALUATIONS ============================ */

export async function listPendingEvaluations(): Promise<Session[]> {
  await wait();
  return getDb()
    .sessions.filter((s) => s.status === 'terminee' && !s.evaluation)
    .sort((a, b) => b.date.localeCompare(a.date));
}

const blend = (current: number | undefined, stars: number): number =>
  current === undefined ? stars : Math.round(((current * 12 + stars) / 13) * 10) / 10;

export async function submitEvaluation(
  sessionId: string,
  payload: { stars: number; impression: Evaluation['impression']; comment?: string },
  by: string,
): Promise<void> {
  await wait();
  const db = getDb();
  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error('introuvable');
  if (session.status !== 'terminee') throw new Error('non-terminee');
  if (session.evaluation) throw new Error('deja-evaluee');
  session.evaluation = {
    stars: payload.stars,
    impression: payload.impression,
    ...(payload.comment ? { comment: payload.comment } : {}),
    submittedAt: nowIso(),
    submittedBy: by,
  };
  session.events.push({ id: newId('ev'), at: nowIso(), kind: 'evaluation', label: getStrings().events.evaluation });
  const coach = db.coaches.find((c) => c.id === session.coachId);
  if (coach) coach.avgRatingFromFacility = blend(coach.avgRatingFromFacility, payload.stars);
  const contract = db.contracts.find((c) => c.id === session.contractId);
  if (contract) contract.avgRatingFromFacility = blend(contract.avgRatingFromFacility, payload.stars);
  commit();
}

/* ============================ CONTRATS ============================ */

export async function getContractDraft(): Promise<ContractDraft | null> {
  await wait();
  return getDb().contractDraft;
}

export async function saveContractDraft(draft: ContractDraft): Promise<void> {
  await wait();
  getDb().contractDraft = draft;
  commit();
}

export async function discardContractDraft(): Promise<void> {
  await wait();
  getDb().contractDraft = null;
  commit();
}

/** CON-08 — Top 4 des créneaux récurrents suggérés (présélection simulée). */
export async function getSlotSuggestions(data: WizardData): Promise<SlotSuggestion[]> {
  await wait();
  // STUB: en production, calculé par le moteur de matching DS.
  const candidates: { weekday: number; time: string }[] = [
    { weekday: 1, time: '10:30' },
    { weekday: 3, time: '15:00' },
    { weekday: 0, time: '14:00' },
    { weekday: 4, time: '10:00' },
    { weekday: 2, time: '11:00' },
    { weekday: 1, time: '16:00' },
    { weekday: 4, time: '15:30' },
  ];
  const excluded = (weekday: number, time: string) => {
    const hour = Number(time.split(':')[0] ?? 0);
    if (
      data.weeklyExclusions.some(
        (e) => e.weekday === weekday && (e.part === 'matin' ? hour < 12 : hour >= 12),
      )
    )
      return true;
    return false;
  };
  const reasons = [
    getStrings().contracts.wizard.slots.reasons.proximity,
    getStrings().contracts.wizard.slots.reasons.continuity,
    getStrings().contracts.wizard.slots.reasons.fit,
    getStrings().contracts.wizard.slots.reasons.alternative,
  ];
  return candidates
    .filter((c) => !excluded(c.weekday, c.time))
    .slice(0, 4)
    .map((c, i) => ({
      id: `slot-${c.weekday}-${c.time}`,
      weekday: c.weekday,
      time: c.time,
      suitability: i === 0 ? 'ideal' : i < 3 ? 'bon' : 'acceptable',
      reason: reasons[i] ?? reasons[3] ?? '',
    }));
}

const historyEntry = (
  kind: ContractHistoryEntry['kind'],
  by: string,
  label: string,
): ContractHistoryEntry => ({ id: newId('h'), at: nowIso(), by, kind, label });

const nextReference = (): string => {
  const year = new Date().getFullYear();
  const nums = getDb()
    .contracts.map((c) => /^CT-(\d{4})-(\d+)$/.exec(c.reference))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[2]));
  const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
  return `CT-${year}-${String(next).padStart(3, '0')}`;
};

const slotsFromWizard = (data: WizardData): Contract['excludedSlots'] => {
  const slots: Contract['excludedSlots'] = [];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    const am = data.weeklyExclusions.some((e) => e.weekday === weekday && e.part === 'matin');
    const pm = data.weeklyExclusions.some((e) => e.weekday === weekday && e.part === 'apres_midi');
    const day = getStrings().weekdays[weekday] ?? '';
    if (am && pm) {
      slots.push({ id: newId('ex'), kind: 'demi_journee', part: 'journee', weekday, label: `${day} — toute la journée` });
    } else if (am) {
      slots.push({ id: newId('ex'), kind: 'demi_journee', part: 'matin', weekday, label: `${day} — matin` });
    } else if (pm) {
      slots.push({ id: newId('ex'), kind: 'demi_journee', part: 'apres_midi', weekday, label: `${day} — après-midi` });
    }
  }
  data.specialPeriods.forEach((p) => {
    slots.push({
      id: newId('ex'),
      kind: p.kind === 'fermeture' ? 'fermeture' : p.kind === 'jour_unique' ? 'jour_unique' : 'periode_recurrente',
      part: p.part,
      startDate: p.startDate,
      ...(p.endDate ? { endDate: p.endDate } : {}),
      label: p.label,
    });
  });
  return slots;
};

/** CON-01/02/08 — soumission du wizard ; CON-06 — resoumission ; CON-15 — renouvellement personnalisé. */
export async function submitContract(
  data: WizardData,
  by: string,
  options: { resubmitOf?: string; renewalOf?: string } = {},
): Promise<Contract> {
  await wait();
  const db = getDb();

  if (options.resubmitOf) {
    const existing = db.contracts.find((c) => c.id === options.resubmitOf);
    if (!existing) throw new Error('introuvable');
    existing.status = 'en_attente_validation';
    existing.frequency = data.frequency ?? existing.frequency;
    existing.sessionType = data.sessionType ?? existing.sessionType;
    existing.units = data.units.length > 0 ? data.units : existing.units;
    existing.startDate = data.startDate ?? existing.startDate;
    existing.endDate = data.endDate ?? existing.endDate;
    existing.excludedSlots = slotsFromWizard(data);
    if (data.planningNotes) existing.availabilityNotes = data.planningNotes;
    existing.history.push(historyEntry('resoumission', by, getStrings().history.resoumission));
    db.contractDraft = null;
    commit();
    return existing;
  }

  const contract: Contract = {
    id: newId('ct'),
    reference: nextReference(),
    status: 'en_attente_validation',
    units: data.units,
    frequency: data.frequency ?? 'hebdo',
    sessionType: data.sessionType ?? 'collective',
    startDate: data.startDate ?? toIso(new Date()),
    endDate: data.endDate ?? toIso(addMonths(new Date(), 12)),
    ...(data.planningNotes ? { availabilityNotes: data.planningNotes } : {}),
    excludedSlots: slotsFromWizard(data),
    generatedSessionCount: 0,
    completedSessionCount: 0,
    rate: db.facility.defaultSessionRate,
    history: [
      historyEntry('creation', by, getStrings().history.creation),
      historyEntry('soumission', by, getStrings().history.soumission),
    ],
  };
  db.contracts.unshift(contract);

  if (options.renewalOf) {
    const old = db.contracts.find((c) => c.id === options.renewalOf);
    old?.history.push(historyEntry('renouvellement', by, getStrings().history.renouvellement));
  }
  db.contractDraft = null;
  commit();
  return contract;
}

/** CON-04 — ajustements mineurs (appliqués) / modifications majeures (en attente DS). */
export async function applyContractEdit(
  id: string,
  payload: {
    minor?: { availabilityNotes?: string; addSpecialPeriod?: SpecialPeriod };
    minorLabel?: string;
    major?: {
      frequency?: Frequency;
      sessionType?: SessionType;
      startDate?: string;
      endDate?: string;
    };
    majorLabel?: string;
  },
  by: string,
): Promise<Contract> {
  await wait();
  const contract = getDb().contracts.find((c) => c.id === id);
  if (!contract) throw new Error('introuvable');

  if (payload.minor) {
    if (payload.minor.availabilityNotes !== undefined) {
      contract.availabilityNotes = payload.minor.availabilityNotes;
    }
    if (payload.minor.addSpecialPeriod) {
      const p = payload.minor.addSpecialPeriod;
      contract.excludedSlots.push({
        id: newId('ex'),
        kind: p.kind === 'fermeture' ? 'fermeture' : p.kind === 'jour_unique' ? 'jour_unique' : 'periode_recurrente',
        part: p.part,
        startDate: p.startDate,
        ...(p.endDate ? { endDate: p.endDate } : {}),
        label: p.label,
      });
    }
    contract.history.push(
      historyEntry('modification_mineure', by, payload.minorLabel ?? getStrings().history.modification_mineure),
    );
  }

  if (payload.major) {
    // Les changements majeurs ne s'appliquent qu'après validation DS — on ne
    // modifie pas les valeurs, seulement le statut + l'historique.
    contract.status = 'modification_en_attente';
    contract.history.push(
      historyEntry('modification_majeure', by, payload.majorLabel ?? getStrings().history.modification_majeure),
    );
  }

  commit();
  return contract;
}

/** CON-15 — renouvellement tel que proposé (sans personnalisation). */
export async function renewContractAsProposed(id: string, by: string): Promise<Contract> {
  await wait();
  const db = getDb();
  const old = db.contracts.find((c) => c.id === id);
  if (!old) throw new Error('introuvable');
  const start = addDays(parseDate(old.endDate), 1);
  const contract: Contract = {
    id: newId('ct'),
    reference: nextReference(),
    status: 'en_attente_validation',
    units: [...old.units],
    frequency: old.frequency,
    sessionType: old.sessionType,
    startDate: toIso(start),
    endDate: toIso(addDays(addMonths(start, 12), -1)),
    ...(old.availabilityNotes ? { availabilityNotes: old.availabilityNotes } : {}),
    excludedSlots: old.excludedSlots.map((s) => ({ ...s, id: newId('ex') })),
    generatedSessionCount: 0,
    completedSessionCount: 0,
    rate: old.rate,
    history: [
      historyEntry('creation', by, `${getStrings().history.creation} (renouvellement de ${old.reference})`),
      historyEntry('soumission', by, getStrings().history.soumission),
    ],
  };
  db.contracts.unshift(contract);
  old.history.push(historyEntry('renouvellement', by, getStrings().history.renouvellement));
  commit();
  return contract;
}

/** CON-16 — non-reconduction confirmée. */
export async function confirmNonRenewal(
  id: string,
  reasonLabel: string,
  comment: string,
  by: string,
): Promise<void> {
  await wait();
  const contract = getDb().contracts.find((c) => c.id === id);
  if (!contract) throw new Error('introuvable');
  contract.status = 'non_renouvele';
  contract.history.push(
    historyEntry(
      'non_renouvellement',
      by,
      `${getStrings().history.non_renouvellement} — motif : ${reasonLabel.toLowerCase()}${comment ? ` (${comment})` : ''}`,
    ),
  );
  commit();
}

/* ============================ CONTACTS ============================ */

export async function upsertContact(contact: Contact): Promise<void> {
  await wait();
  const db = getDb();
  const index = db.contacts.findIndex((c) => c.id === contact.id);
  if (index >= 0) db.contacts[index] = contact;
  else db.contacts.push(contact);
  commit();
}

export async function deleteContact(id: string): Promise<void> {
  await wait();
  const db = getDb();
  db.contacts = db.contacts.filter((c) => c.id !== id);
  commit();
}

export async function confirmContactsFresh(): Promise<void> {
  await wait();
  const db = getDb();
  db.contactsLastConfirmedAt = nowIso();
  db.notifications.forEach((n) => {
    if (n.type === 'contacts') n.read = true;
  });
  commit();
}

/* ============================ ÉTABLISSEMENT & COMPTE ============================ */

export async function updateFacility(
  patch: Partial<Omit<Facility, 'id' | 'group' | 'stats'>>,
  by: string,
  label: string,
): Promise<void> {
  await wait();
  const db = getDb();
  Object.assign(db.facility, patch);
  db.facilityHistory.unshift({ at: nowIso(), by, label });
  commit();
}

export async function updateMyContact(
  contactId: string,
  patch: { firstName: string; lastName: string; phone: string; roles: Contact['roles']; otherRoleLabel?: string },
): Promise<void> {
  await wait();
  const contact = getDb().contacts.find((c) => c.id === contactId);
  if (!contact) throw new Error('introuvable');
  contact.firstName = patch.firstName;
  contact.lastName = patch.lastName;
  contact.phone = patch.phone;
  contact.roles = patch.roles;
  if (patch.otherRoleLabel !== undefined) contact.otherRoleLabel = patch.otherRoleLabel;
  commit();
}

/** AUTH-14 — demande de suppression (jamais de suppression directe). */
export async function submitDeleteRequest(by: string, reason?: string): Promise<void> {
  await wait();
  getDb().deleteRequests.push({ at: nowIso(), by, ...(reason ? { reason } : {}) });
  console.info('// STUB: demande de suppression transmise à l’équipe DS', { by, reason });
  commit();
}

/* ============================ NOTIFICATIONS & SUPPORT ============================ */

export async function markNotificationRead(id: string): Promise<void> {
  await wait();
  const notification = getDb().notifications.find((n) => n.id === id);
  if (notification) notification.read = true;
  commit();
}

export async function markAllNotificationsRead(): Promise<void> {
  await wait();
  getDb().notifications.forEach((n) => {
    n.read = true;
  });
  commit();
}

export async function sendSupportMessage(subject: string, message: string, by: string): Promise<void> {
  await wait();
  console.info('// STUB: message envoyé à l’équipe DS (aucun email réel)', { subject, message, by });
}
