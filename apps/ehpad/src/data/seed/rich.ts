/** Jeu de données riche — EHPAD Les Tilleuls (Lyon).
 *  Dates générées relativement à aujourd'hui pour que la démo reste vivante.
 *  Déterministe : aucun aléatoire à l'exécution. */

import { getStrings } from '@/i18n';
import { addDays, lastWeekday, nextWeekday } from '@/lib/calendar';
import { formatDate, formatTime, toIso } from '@/lib/format';
import type {
  AppNotification,
  Coach,
  Contact,
  Contract,
  Facility,
  Invoice,
  Session,
  SessionEvent,
} from '@/types/models';
import type { DB } from '@/data/store';

const SOPHIE = 'Sophie Mercier';
const THOMAS = 'Thomas Lefèvre';

export function buildRichSeed(): DB {
  const today = new Date();
  const d = (offset: number) => toIso(addDays(today, offset));
  const at = (iso: string, time: string) => `${iso}T${time}:00`;

  /* ---------- Établissement ---------- */

  const facility: Facility = {
    id: 'ehpad-les-tilleuls',
    tradeName: 'EHPAD Les Tilleuls',
    companyName: 'SAS Résidence Les Tilleuls',
    siret: '832 147 569 00027',
    vatNumber: 'FR32 832147569',
    category: 'EHPAD privé associatif',
    group: { id: 'grp-harmonie', name: 'Groupe Harmonie Soins' },
    status: 'actif',
    units: ['UC', 'UP_UHR', 'AIDANTS', 'SOIGNANTS'],
    addresses: {
      main: { line1: '12 rue des Tilleuls', postalCode: '69005', city: 'Lyon' },
      billing: {
        line1: 'Groupe Harmonie Soins — Service comptabilité',
        line2: '8 avenue Berthelot',
        postalCode: '69007',
        city: 'Lyon',
      },
      sessionLocation: {
        line1: 'Salle polyvalente — 14 rue des Tilleuls',
        postalCode: '69005',
        city: 'Lyon',
      },
    },
    defaultSessionRate: 65,
    markers: ['Convention 2026', 'Tarif groupe'],
    standardSessions: [
      { id: 'ss-1', label: 'Gym douce — résidents', weekday: 1, time: '10:30', durationMin: 60, unitType: 'UC' },
      { id: 'ss-2', label: 'Équilibre & mobilité', weekday: 3, time: '15:00', durationMin: 60, unitType: 'UP_UHR' },
      { id: 'ss-3', label: 'Atelier dos & posture', weekday: 4, time: '14:00', durationMin: 45, unitType: 'SOIGNANTS' },
    ],
    stats: { totalCompleted: 96, thisMonth: 0, coachCount: 3, upcoming: 0 },
  };

  /* ---------- Contacts (3) — 2 comptes actifs + 1 invitation en attente ---------- */

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
    {
      id: 'c-claire',
      civility: 'Mme',
      firstName: 'Claire',
      lastName: 'Dubois',
      email: 'claire.dubois@les-tilleuls.fr',
      phone: '0655443322',
      type: 'additionnel',
      isSessionCoordinator: false,
      roles: ['ergotherapeute'],
      account: { role: 'user', active: false },
    },
  ];

  /* ---------- Coachs ---------- */

  const coaches: Coach[] = [
    { id: 'k-karim', firstName: 'Karim', lastName: 'Belkacem', avgRatingFromFacility: 4.8 },
    { id: 'k-julie', firstName: 'Julie', lastName: 'Renard', avgRatingFromFacility: 4.5 },
    { id: 'k-marc', firstName: 'Marc', lastName: 'Petit', avgRatingFromFacility: 4.2 },
  ];

  /* ---------- Contrats — les 7 statuts ---------- */

  const contracts: Contract[] = [
    {
      id: 'ct-2026-014',
      reference: 'CT-2026-014',
      status: 'active',
      units: ['UC'],
      frequency: 'hebdo',
      sessionType: 'collective',
      startDate: d(-150),
      endDate: d(+215),
      availabilityNotes: 'Éviter les heures de repas (12 h – 14 h).',
      excludedSlots: [
        { id: 'ex-14-1', kind: 'demi_journee', part: 'journee', weekday: 2, label: 'Mercredi — toute la journée' },
      ],
      generatedSessionCount: 34,
      completedSessionCount: 19,
      rate: 65,
      avgRatingFromFacility: 4.7,
      history: [
        { id: 'h-14-1', at: at(d(-160), '10:05'), by: SOPHIE, kind: 'creation', label: getStrings().history.creation },
        { id: 'h-14-2', at: at(d(-160), '10:20'), by: SOPHIE, kind: 'soumission', label: getStrings().history.soumission },
        { id: 'h-14-3', at: at(d(-156), '09:00'), by: 'Équipe DS', kind: 'validation', label: 'Contrat validé par l’équipe DS' },
      ],
    },
    {
      id: 'ct-2026-009',
      reference: 'CT-2026-009',
      status: 'a_renouveler',
      units: ['UP_UHR'],
      frequency: 'hebdo',
      sessionType: 'collective',
      startDate: d(-320),
      endDate: d(+45),
      availabilityNotes: 'Résidents plus disponibles l’après-midi.',
      excludedSlots: [
        { id: 'ex-09-1', kind: 'demi_journee', part: 'matin', weekday: 0, label: 'Lundi — matin' },
      ],
      generatedSessionCount: 48,
      completedSessionCount: 44,
      rate: 68,
      avgRatingFromFacility: 4.5,
      history: [
        { id: 'h-09-1', at: at(d(-330), '11:00'), by: SOPHIE, kind: 'creation', label: getStrings().history.creation },
        { id: 'h-09-2', at: at(d(-330), '11:15'), by: SOPHIE, kind: 'soumission', label: getStrings().history.soumission },
        { id: 'h-09-3', at: at(d(-326), '14:00'), by: 'Équipe DS', kind: 'validation', label: 'Contrat validé par l’équipe DS' },
      ],
    },
    {
      id: 'ct-2026-021',
      reference: 'CT-2026-021',
      status: 'en_attente_validation',
      units: ['AIDANTS'],
      frequency: 'mensuel',
      sessionType: 'collective',
      startDate: d(+30),
      endDate: d(+395),
      availabilityNotes: 'Ateliers familles de préférence le samedi matin.',
      excludedSlots: [],
      generatedSessionCount: 0,
      completedSessionCount: 0,
      rate: 70,
      history: [
        { id: 'h-21-1', at: at(d(-3), '16:40'), by: SOPHIE, kind: 'creation', label: getStrings().history.creation },
        { id: 'h-21-2', at: at(d(-3), '16:55'), by: SOPHIE, kind: 'soumission', label: getStrings().history.soumission },
      ],
    },
    {
      id: 'ct-2025-031',
      reference: 'CT-2025-031',
      status: 'expire',
      units: ['UC', 'SOIGNANTS'],
      frequency: 'hebdo',
      sessionType: 'collective',
      startDate: d(-500),
      endDate: d(-120),
      excludedSlots: [],
      generatedSessionCount: 38,
      completedSessionCount: 36,
      rate: 62,
      avgRatingFromFacility: 4.3,
      history: [
        { id: 'h-31-1', at: at(d(-510), '09:30'), by: SOPHIE, kind: 'creation', label: getStrings().history.creation },
        { id: 'h-31-2', at: at(d(-510), '09:45'), by: SOPHIE, kind: 'soumission', label: getStrings().history.soumission },
        { id: 'h-31-3', at: at(d(-505), '10:00'), by: 'Équipe DS', kind: 'validation', label: 'Contrat validé par l’équipe DS' },
      ],
    },
    {
      id: 'ct-2026-018',
      reference: 'CT-2026-018',
      status: 'rejete',
      units: ['UP_UHR'],
      frequency: 'bihebdo',
      sessionType: 'individuelle',
      startDate: d(+20),
      endDate: d(+385),
      availabilityNotes: 'Séances individuelles en chambre, le matin uniquement.',
      excludedSlots: [
        { id: 'ex-18-1', kind: 'demi_journee', part: 'apres_midi', weekday: 0, label: 'Lundi — après-midi' },
        { id: 'ex-18-2', kind: 'demi_journee', part: 'apres_midi', weekday: 1, label: 'Mardi — après-midi' },
        { id: 'ex-18-3', kind: 'demi_journee', part: 'apres_midi', weekday: 2, label: 'Mercredi — après-midi' },
        { id: 'ex-18-4', kind: 'demi_journee', part: 'apres_midi', weekday: 3, label: 'Jeudi — après-midi' },
        { id: 'ex-18-5', kind: 'demi_journee', part: 'apres_midi', weekday: 4, label: 'Vendredi — après-midi' },
      ],
      rejectionReason: 'Créneaux incompatibles avec la disponibilité du coach',
      generatedSessionCount: 0,
      completedSessionCount: 0,
      rate: 72,
      history: [
        { id: 'h-18-1', at: at(d(-12), '14:10'), by: SOPHIE, kind: 'creation', label: getStrings().history.creation },
        { id: 'h-18-2', at: at(d(-12), '14:25'), by: SOPHIE, kind: 'soumission', label: getStrings().history.soumission },
        { id: 'h-18-3', at: at(d(-5), '09:15'), by: 'Équipe DS', kind: 'rejet', label: getStrings().history.rejet },
      ],
    },
    {
      id: 'ct-2026-011',
      reference: 'CT-2026-011',
      status: 'modification_en_attente',
      units: ['SOIGNANTS'],
      frequency: 'hebdo',
      sessionType: 'collective',
      startDate: d(-90),
      endDate: d(+275),
      availabilityNotes: 'Personnel disponible après la relève de 13 h 30.',
      excludedSlots: [],
      generatedSessionCount: 14,
      completedSessionCount: 7,
      rate: 65,
      avgRatingFromFacility: 4.2,
      history: [
        { id: 'h-11-1', at: at(d(-100), '15:00'), by: SOPHIE, kind: 'creation', label: getStrings().history.creation },
        { id: 'h-11-2', at: at(d(-100), '15:10'), by: SOPHIE, kind: 'soumission', label: getStrings().history.soumission },
        { id: 'h-11-3', at: at(d(-96), '11:30'), by: 'Équipe DS', kind: 'validation', label: 'Contrat validé par l’équipe DS' },
        {
          id: 'h-11-4',
          at: at(d(-2), '10:45'),
          by: SOPHIE,
          kind: 'modification_majeure',
          detailKey: 'detailFreqDouble',
        },
      ],
    },
    {
      id: 'ct-2025-027',
      reference: 'CT-2025-027',
      status: 'non_renouvele',
      units: ['AIDANTS'],
      frequency: 'hebdo',
      sessionType: 'collective',
      startDate: d(-340),
      endDate: d(+20),
      excludedSlots: [],
      generatedSessionCount: 46,
      completedSessionCount: 44,
      rate: 60,
      avgRatingFromFacility: 4.6,
      history: [
        { id: 'h-27-1', at: at(d(-350), '10:00'), by: SOPHIE, kind: 'creation', label: getStrings().history.creation },
        { id: 'h-27-2', at: at(d(-350), '10:15'), by: SOPHIE, kind: 'soumission', label: getStrings().history.soumission },
        { id: 'h-27-3', at: at(d(-345), '09:00'), by: 'Équipe DS', kind: 'validation', label: 'Contrat validé par l’équipe DS' },
        {
          id: 'h-27-4',
          at: at(d(-15), '17:20'),
          by: SOPHIE,
          kind: 'non_renouvellement',
          detailKey: 'detailReasonBudget',
        },
      ],
    },
  ];

  /* ---------- Séances (~26) ---------- */

  const sessions: Session[] = [];
  let evtSeq = 0;
  const evt = (
    kind: SessionEvent['kind'],
    atIso: string,
    extra?: { messageKey?: SessionEvent['messageKey']; params?: SessionEvent['params'] },
  ): SessionEvent => ({
    id: `ev-${(evtSeq += 1)}`,
    at: atIso,
    kind,
    ...(extra?.messageKey ? { messageKey: extra.messageKey } : {}),
    ...(extra?.params ? { params: extra.params } : {}),
  });

  interface PastSpec {
    id: string;
    contractId: string;
    coachId: string;
    weekday: number;
    weeksBack: number;
    time: string;
    durationMin: number;
    unitType: Session['unitType'];
    evaluation?: { stars: number; impression: 'tres_bien' | 'bien' | 'correct' | 'a_ameliorer'; comment?: string; by: string };
    report?: { participants: number; stars: number; emoji: string; difficulties?: string; summary: string };
    isFirstTogether?: boolean;
    coachMessage?: string;
  }

  const pushPast = (s: PastSpec) => {
    const iso = toIso(lastWeekday(today, s.weekday, s.weeksBack));
    const events: SessionEvent[] = [];
    const session: Session = {
      id: s.id,
      contractId: s.contractId,
      coachId: s.coachId,
      date: iso,
      time: s.time,
      durationMin: s.durationMin,
      unitType: s.unitType,
      status: 'terminee',
      modificationHistory: [],
      events,
    };
    if (s.isFirstTogether) session.isFirstTogether = true;
    if (s.coachMessage) session.coachMessage = s.coachMessage;
    if (s.report) {
      session.report = {
        participantCount: s.report.participants,
        atmosphere: { stars: s.report.stars, emoji: s.report.emoji },
        hadDifficulties: Boolean(s.report.difficulties),
        ...(s.report.difficulties ? { difficultiesNote: s.report.difficulties } : {}),
        evaluationSummary: s.report.summary,
      };
      events.push(evt('rapport_remis', at(iso, '18:00')));
    }
    if (s.evaluation) {
      const submittedAt = at(toIso(addDays(lastWeekday(today, s.weekday, s.weeksBack), 1)), '09:30');
      session.evaluation = {
        stars: s.evaluation.stars,
        impression: s.evaluation.impression,
        ...(s.evaluation.comment ? { comment: s.evaluation.comment } : {}),
        submittedAt,
        submittedBy: s.evaluation.by,
      };
      events.push(evt('evaluation', submittedAt));
    }
    sessions.push(session);
  };

  const pushUpcoming = (
    id: string,
    contractId: string,
    coachId: string | null,
    weekday: number,
    weeksAhead: number,
    time: string,
    durationMin: number,
    unitType: Session['unitType'],
  ) => {
    sessions.push({
      id,
      contractId,
      coachId,
      date: toIso(nextWeekday(today, weekday, weeksAhead)),
      time,
      durationMin,
      unitType,
      status: 'a_venir',
      modificationHistory: [],
      events: [],
    });
  };

  // Contrat UC — mardis 10:30, Karim
  pushPast({ id: 's-uc-p4', contractId: 'ct-2026-014', coachId: 'k-karim', weekday: 1, weeksBack: 4, time: '10:30', durationMin: 60, unitType: 'UC', report: { participants: 11, stars: 5, emoji: '😊', summary: 'Très belle énergie du groupe, parcours de marche en cercle réussi.' }, evaluation: { stars: 5, impression: 'tres_bien', comment: 'Les résidents en parlent encore le lendemain.', by: SOPHIE } });
  pushPast({ id: 's-uc-p3', contractId: 'ct-2026-014', coachId: 'k-karim', weekday: 1, weeksBack: 3, time: '10:30', durationMin: 60, unitType: 'UC', report: { participants: 9, stars: 4, emoji: '🙂', summary: 'Travail de l’équilibre avec ballons, bonne participation générale.' }, evaluation: { stars: 4, impression: 'bien', by: THOMAS } });
  pushPast({ id: 's-uc-p2', contractId: 'ct-2026-014', coachId: 'k-karim', weekday: 1, weeksBack: 2, time: '10:30', durationMin: 60, unitType: 'UC', report: { participants: 12, stars: 5, emoji: '😊', summary: 'Séance assise dynamique, Mme Roux a retrouvé le sourire.' }, evaluation: { stars: 5, impression: 'tres_bien', by: SOPHIE } });
  pushPast({ id: 's-uc-p1', contractId: 'ct-2026-014', coachId: 'k-karim', weekday: 1, weeksBack: 1, time: '10:30', durationMin: 60, unitType: 'UC', report: { participants: 10, stars: 4, emoji: '🙂', summary: 'Exercices de coordination, groupe attentif malgré la chaleur.' } });
  pushPast({ id: 's-uc-p0', contractId: 'ct-2026-014', coachId: 'k-karim', weekday: 1, weeksBack: 0, time: '10:30', durationMin: 60, unitType: 'UC', report: { participants: 10, stars: 5, emoji: '😊', summary: 'Parcours moteur complet, belle progression de M. Bernard.' } });

  pushUpcoming('s-uc-u0', 'ct-2026-014', 'k-karim', 1, 0, '10:30', 60, 'UC');
  pushUpcoming('s-uc-u1', 'ct-2026-014', null, 1, 1, '10:30', 60, 'UC'); // future non assignée → modifiable (SESS-10)
  pushUpcoming('s-uc-u2', 'ct-2026-014', 'k-karim', 1, 2, '10:30', 60, 'UC');
  pushUpcoming('s-uc-u3', 'ct-2026-014', 'k-karim', 1, 3, '10:30', 60, 'UC');

  // Séance annulée (retard > 30 min)
  {
    const iso = d(-9);
    sessions.push({
      id: 's-uc-ann',
      contractId: 'ct-2026-014',
      coachId: 'k-karim',
      date: iso,
      time: '10:30',
      durationMin: 60,
      unitType: 'UC',
      status: 'annulee',
      modificationHistory: [],
      events: [
        evt('retard', at(iso, '11:00'), { params: { minutes: 30 } }),
        evt('annulation', at(iso, '11:05'), { messageKey: 'retardCancelled' }),
      ],
    });
  }

  // Contrat UP/UHR — jeudis 15:00, Julie
  pushPast({ id: 's-up-p2', contractId: 'ct-2026-009', coachId: 'k-julie', weekday: 3, weeksBack: 2, time: '15:00', durationMin: 60, unitType: 'UP_UHR', report: { participants: 6, stars: 4, emoji: '🙂', summary: 'Atelier mobilité douce, résidents bien installés.' }, evaluation: { stars: 4, impression: 'bien', by: SOPHIE } });
  pushPast({ id: 's-up-p1', contractId: 'ct-2026-009', coachId: 'k-julie', weekday: 3, weeksBack: 1, time: '15:00', durationMin: 60, unitType: 'UP_UHR', report: { participants: 7, stars: 5, emoji: '😊', summary: 'Très bon moment, exercices sensoriels appréciés.' }, evaluation: { stars: 5, impression: 'tres_bien', comment: 'Julie est très douce avec les résidents de l’unité protégée.', by: SOPHIE } });
  pushPast({ id: 's-up-p0', contractId: 'ct-2026-009', coachId: 'k-julie', weekday: 3, weeksBack: 0, time: '15:00', durationMin: 60, unitType: 'UP_UHR', report: { participants: 6, stars: 4, emoji: '😌', difficulties: 'Deux résidentes fatiguées en fin de séance — exercices terminés en position assise.', summary: 'Séance adaptée au rythme du jour, ambiance calme.' }, coachMessage: 'Pensez à réserver la salle polyvalente jeudi prochain : nous ferons un parcours d’équilibre.' });

  pushUpcoming('s-up-u0', 'ct-2026-009', 'k-julie', 3, 0, '15:00', 60, 'UP_UHR');
  pushUpcoming('s-up-u1', 'ct-2026-009', 'k-julie', 3, 1, '15:00', 60, 'UP_UHR');
  pushUpcoming('s-up-u2', 'ct-2026-009', 'k-julie', 3, 2, '15:00', 60, 'UP_UHR');

  // Séance reportée (SESS-12 déjà passée par là)
  {
    const newIso = d(+9);
    const label = getStrings().events.report(formatDate(newIso), formatTime('15:00'));
    sessions.push({
      id: 's-up-rep',
      contractId: 'ct-2026-009',
      coachId: 'k-julie',
      date: newIso,
      time: '15:00',
      durationMin: 60,
      unitType: 'UP_UHR',
      status: 'reportee',
      modificationHistory: [{ at: at(d(-2), '11:20'), by: SOPHIE, change: label }],
      events: [evt('report', at(d(-2), '11:20'), { params: { date: newIso, time: '15:00' } })],
    });
  }

  // Contrat Soignants — vendredis 14:00, Marc
  pushPast({ id: 's-soi-p1', contractId: 'ct-2026-011', coachId: 'k-marc', weekday: 4, weeksBack: 1, time: '14:00', durationMin: 45, unitType: 'SOIGNANTS', isFirstTogether: true, report: { participants: 9, stars: 4, emoji: '🙂', summary: 'Première séance avec l’équipe : étirements et prévention des lombalgies.' }, evaluation: { stars: 4, impression: 'bien', by: THOMAS } });
  pushPast({ id: 's-soi-p0', contractId: 'ct-2026-011', coachId: 'k-marc', weekday: 4, weeksBack: 0, time: '14:00', durationMin: 45, unitType: 'SOIGNANTS' });

  pushUpcoming('s-soi-u0', 'ct-2026-011', 'k-marc', 4, 0, '14:00', 45, 'SOIGNANTS');
  pushUpcoming('s-soi-u1', 'ct-2026-011', 'k-marc', 4, 1, '14:00', 45, 'SOIGNANTS');

  // Séance du jour à 14 h 00 — alerte retard NOTI-03 (chaîne canonique)
  {
    const iso = d(0);
    sessions.push({
      id: 's-jour',
      contractId: 'ct-2026-011',
      coachId: 'k-marc',
      date: iso,
      time: '14:00',
      durationMin: 45,
      unitType: 'SOIGNANTS',
      status: 'a_venir',
      modificationHistory: [],
      events: [evt('retard', at(iso, '14:10'), { params: { minutes: 10 } })],
    });
  }

  // Contrat Aidants (non reconduit — actif jusqu'à sa fin) — lundis 11:00, Julie
  pushPast({ id: 's-aid-p1', contractId: 'ct-2025-027', coachId: 'k-julie', weekday: 0, weeksBack: 1, time: '11:00', durationMin: 60, unitType: 'AIDANTS', report: { participants: 7, stars: 5, emoji: '😊', summary: 'Atelier aidants-aidés : marche accompagnée dans le jardin.' }, evaluation: { stars: 5, impression: 'tres_bien', by: SOPHIE } });
  pushPast({ id: 's-aid-p0', contractId: 'ct-2025-027', coachId: 'k-julie', weekday: 0, weeksBack: 0, time: '11:00', durationMin: 60, unitType: 'AIDANTS', report: { participants: 8, stars: 4, emoji: '🙂', summary: 'Exercices de portage et de transfert en binôme, très utiles aux familles.' }, evaluation: { stars: 4, impression: 'bien', by: THOMAS } });

  pushUpcoming('s-aid-u0', 'ct-2025-027', 'k-julie', 0, 0, '11:00', 60, 'AIDANTS');
  pushUpcoming('s-aid-u1', 'ct-2025-027', 'k-julie', 0, 1, '11:00', 60, 'AIDANTS');

  /* ---------- Factures (6, montants HT) ---------- */

  // Ancre de mois au format ISO (YYYY-MM-01) — la période de facture est rendue
  // dans la langue active via formatMonthYear (plus de libellé FR figé au seed).
  const monthLabel = (offset: number) => {
    const dt = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const invoices: Invoice[] = [
    { id: 'f-2026-052', number: 'F-2026-052', period: monthLabel(-1), sessionCount: 9, amountHT: 585, status: 'en_attente', dueDate: d(+12) },
    { id: 'f-2026-041', number: 'F-2026-041', period: monthLabel(-2), sessionCount: 8, amountHT: 520, status: 'en_retard', dueDate: d(-15) },
    { id: 'f-2026-033', number: 'F-2026-033', period: monthLabel(-3), sessionCount: 10, amountHT: 650, status: 'payee', dueDate: d(-45), paymentDate: d(-48) },
    { id: 'f-2026-027', number: 'F-2026-027', period: monthLabel(-4), sessionCount: 8, amountHT: 520, status: 'payee', dueDate: d(-75), paymentDate: d(-71) },
    { id: 'f-2026-018', number: 'F-2026-018', period: monthLabel(-5), sessionCount: 9, amountHT: 585, status: 'payee', dueDate: d(-105), paymentDate: d(-107) },
    { id: 'f-2025-104', number: 'F-2025-104', period: monthLabel(-6), sessionCount: 7, amountHT: 455, status: 'payee', dueDate: d(-135), paymentDate: d(-133) },
    // Historique payé (mois -7 à -12) : assez de lignes pour que la pagination
    // de la table ait du sens. Toutes « payée » → KPIs (impayé/retard/échéance)
    // inchangés ; seul le délai moyen s'appuie sur un échantillon plus large.
    { id: 'f-2025-093', number: 'F-2025-093', period: monthLabel(-7), sessionCount: 8, amountHT: 520, status: 'payee', dueDate: d(-165), paymentDate: d(-168) },
    { id: 'f-2025-081', number: 'F-2025-081', period: monthLabel(-8), sessionCount: 9, amountHT: 585, status: 'payee', dueDate: d(-195), paymentDate: d(-191) },
    { id: 'f-2025-072', number: 'F-2025-072', period: monthLabel(-9), sessionCount: 10, amountHT: 650, status: 'payee', dueDate: d(-225), paymentDate: d(-228) },
    { id: 'f-2025-064', number: 'F-2025-064', period: monthLabel(-10), sessionCount: 7, amountHT: 455, status: 'payee', dueDate: d(-255), paymentDate: d(-252) },
    { id: 'f-2025-055', number: 'F-2025-055', period: monthLabel(-11), sessionCount: 8, amountHT: 520, status: 'payee', dueDate: d(-285), paymentDate: d(-288) },
    { id: 'f-2025-043', number: 'F-2025-043', period: monthLabel(-12), sessionCount: 9, amountHT: 585, status: 'payee', dueDate: d(-315), paymentDate: d(-312) },
  ];

  /* ---------- Notifications ---------- */

  const notifications: AppNotification[] = [
    {
      id: 'n-retard',
      type: 'coach_retard',
      params: { time: '14:00' },
      createdAt: at(d(0), '14:10'),
      read: false,
      link: '/sessions/s-jour',
    },
    {
      id: 'n-evals',
      type: 'eval_due',
      params: { count: 4 },
      createdAt: at(d(-1), '08:00'),
      read: false,
      link: '/evaluations',
    },
    {
      id: 'n-renouv',
      type: 'contrat_renouvellement',
      params: { contractRef: 'CT-2026-009', days: 45 },
      createdAt: at(d(-2), '09:00'),
      read: false,
      link: '/contrats/ct-2026-009',
    },
    {
      id: 'n-facture',
      type: 'facture',
      params: { invoiceRef: 'F-2026-041' },
      createdAt: at(d(-10), '10:00'),
      read: true,
      link: '/factures/f-2026-041',
    },
    {
      id: 'n-contacts',
      type: 'contacts',
      createdAt: at(d(-4), '09:30'),
      read: false,
      link: '/contacts',
    },
    {
      id: 'n-bienvenue',
      type: 'systeme',
      createdAt: at(d(-60), '12:00'),
      read: true,
    },
  ];

  /* ---------- Statistiques dérivées ---------- */

  const thisMonth = sessions.filter(
    (s) => s.status === 'terminee' && s.date.slice(0, 7) === toIso(today).slice(0, 7),
  ).length;
  const upcoming = sessions.filter((s) => s.status === 'a_venir' || s.status === 'reportee').length;
  facility.stats = { totalCompleted: 96, thisMonth, coachCount: 3, upcoming };

  return {
    facility,
    contacts,
    coaches,
    contracts,
    sessions,
    invoices,
    notifications,
    contactsLastConfirmedAt: at(d(-65), '09:00'),
    facilityHistory: [
      { at: at(d(-30), '09:12'), by: SOPHIE, label: 'Tarif de séance par défaut mis à jour' },
    ],
    contractDraft: null,
    deleteRequests: [],
  };
}
