/** Dictionnaire français — source de vérité de la forme `Copy`.
 *  `en.ts` doit satisfaire ce même type. */

export interface NavEntry {
  label: string;
  gloss: string;
}

/** Clés de navigation — partagées par le routeur, la barre latérale et la barre du haut. */
export type NavKey =
  | 'dashboard'
  | 'assignments'
  | 'sessions'
  | 'reports'
  | 'contracts'
  | 'establishments'
  | 'coaches'
  | 'coverage'
  | 'billing'
  | 'settings';

/** Clés de section — regroupent les entrées de navigation en grappes étiquetées. */
export type NavSectionKey = 'pilotage' | 'operations' | 'directory' | 'finance';

/** Les 4 KPIs de l'aperçu opérationnel (DASH-14). */
export type KpiId = 'fillRate' | 'coachlessSessions' | 'monthlyRevenue' | 'satisfaction';

export interface KpiCopy {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
}

/** Famille de notification — pilote l'icône affichée dans le panneau. */
export type NotifKind = 'contract' | 'incident' | 'assignment' | 'report';

export interface NotificationCopy {
  id: string;
  kind: NotifKind;
  text: string;
  time: string;
  /** Non lue à l'ouverture de la session ; l'état « lu » est ensuite géré localement. */
  unread: boolean;
}

export interface Copy {
  app: {
    brandName: string;
    consoleName: string;
    /** Nom accessible du groupe de boutons de langue. */
    language: string;
  };
  topbar: {
    notifications: string;
    logout: string;
    /** Panneau déroulant ouvert depuis l'icône cloche. */
    notificationsPanel: {
      title: string;
      /** Nombre non lu, pour le badge accessible et l'en-tête. */
      unread: (n: number) => string;
      markAllRead: string;
      empty: string;
      viewAll: string;
      items: NotificationCopy[];
    };
  };
  sidebar: {
    mainNav: string;
    /** Libellé accessible du badge de file d'attente. */
    pending: (n: number) => string;
    version: string;
  };
  shell: {
    skipToContent: string;
  };
  placeholder: {
    comingSoon: string;
    scope: (source: string) => string;
  };
  notFound: {
    title: string;
    subtitle: string;
    back: string;
  };
  login: {
    brandTag: string;
    title: string;
    emailLabel: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submit: string;
    hintBefore: string;
    hintAfter: string;
  };
  dashboard: {
    greeting: (firstName: string) => string;
    subtitle: string;
    /** Sous-titre affiché sur l'onglet Analytics. */
    analyticsSubtitle: string;
    /** Sous-titre affiché sur l'onglet Supervision. */
    monitoringSubtitle: string;
    runAssignments: string;
    kpiAria: string;
    /** Libellés des onglets internes (cockpit / reporting / supervision) + nom accessible. */
    tabs: { overview: string; analytics: string; monitoring: string };
    tabsAria: string;
    /** Bandeau d'alerte « cascade d'urgence » (DASH-14, accès au workflow). */
    emergencyTitle: (n: number) => string;
    emergencyCta: string;
    /** Liste « séances à valider » (DASH-14). */
    validationTitle: string;
    validationMeta: string;
    /** Préfixe du coach proposé, étiquette de score, badge J-7, état vide. */
    proposed: string;
    score: string;
    d7: string;
    empty: string;
    kpis: Record<KpiId, KpiCopy>;
  };
  nav: Record<NavKey, NavEntry>;
  /** En-têtes de section de la barre latérale. */
  navSections: Record<NavSectionKey, string>;

  contracts: {
    title: string;
    subtitle: string;
    newContract: string;
    kpiAria: string;
    tabsAria: string;
    tableAria: string;
    searchPlaceholder: string;
    searchLabel: string;
    empty: string;
    count: (n: number) => string;
    tabs: { pending: string; active: string; renewal: string; all: string };
    columns: { ref: string; ehpad: string; frequency: string; period: string; status: string };
    decision: { approved: string; rejected: string };
    kpis: Record<'toValidate' | 'active' | 'renewal' | 'mrr', KpiCopy>;
    status: Record<'pending' | 'active' | 'renewal' | 'expired' | 'rejected', string>;
    fit: Record<'ideal' | 'good' | 'acceptable', string>;
    rejectReasons: Record<'tarif' | 'dispo' | 'zone' | 'doublon' | 'autre', string>;
    freq: Record<'1sem' | '2sem' | 'quinzaine' | 'mois' | 'ponctuel', { label: string; desc?: string }>;
    units: Record<'uc' | 'up' | 'aidants' | 'soignants' | 'autre', { label: string; desc?: string }>;
    consecutivity: Record<'oui' | 'non', { label: string; desc?: string }>;
    exclusions: Record<'weekend' | 'mercredi' | 'matin' | 'vendredi-am', string>;
    periods: Record<'12glissants' | 'civile' | '24mois' | 'sansfin', { label: string; desc?: string }>;
    markers: Record<'cfppa' | 'bdc' | 'groupe', string>;
    detail: {
      reject: string;
      approveWithChanges: string;
      approve: string;
      startRenewal: string;
      dueIn: (days: number) => string;
      majorChangeLabel: string;
      adminRequired: string;
      rejectionReasonLabel: string;
      period: string;
      rate: string;
      rateValue: (rate: number) => string;
      units: string;
      sessionsGenerated: string;
      group: string;
      notes: string;
      slotsTitle: string;
    };
    reject: {
      back: string;
      confirm: string;
      reasonRequired: string;
      reasonLabel: string;
      precisionLabel: string;
      precisionPlaceholder: string;
    };
    wizard: {
      title: string;
      subtitle: string;
      completeLabel: string;
      steps: string[];
      establishmentLabel: string;
      freqLabel: string;
      unitsLabel: string;
      unitsHint: string;
      consecLabel: string;
      exclusionsLabel: string;
      exclusionsHint: string;
      specialPeriodsLabel: string;
      specialPeriodsPlaceholder: string;
      periodLabel: string;
      rateLabel: string;
      markersLabel: string;
      recap: { establishment: string; frequency: string; units: string; period: string };
      mail: {
        title: string;
        subjectLabel: string;
        subject: string;
        bodyLead: (units: number, freq: string) => string;
        bodySessions: string;
        bodyTail: string;
        sessionsPill: string;
      };
    };
  };

  sessions: {
    title: string;
    subtitle: string;
    exportExcel: string;
    newSession: string;
    kpiAria: string;
    kpis: Record<'today' | 'week' | 'incidents' | 'reports', { label: string; hint: string }>;
    calendarViewAria: string;
    views: Record<'day' | 'week' | 'month', string>;
    tabs: { today: string; upcoming: string; completed: string; incident: string; all: string };
    columns: { when: string; ehpad: string; coach: string; status: string };
    status: Record<'upcoming' | 'inProgress' | 'completed' | 'incident' | 'cancelled', string>;
    unassigned: string;
    allCoaches: string;
    filterByStatus: string;
    filterByCoach: string;
    searchPlaceholder: string;
    searchLabel: string;
    tableAria: string;
    emptyFilter: string;
    sessionCount: (n: number) => string;
    sessionsTotal: (n: number) => string;
    weekTitle: (range: string) => string;
    monthKpiAria: string;
    monthKpis: Record<'total' | 'done' | 'upcoming' | 'noCoach' | 'incidents', string>;
    monthDay: (day: number) => string;
    weekdayShort: string[];
    densityLow: string;
    densityHigh: string;
    actor: Record<'algo' | 'admin' | 'coach' | 'sync' | 'geo' | 'ehpad', string>;
    detail: {
      reschedule: string;
      changeCoach: string;
      downloadPdf: string;
      coachUnassigned: string;
      firstTogether: string;
      participants: string;
      atmosphere: string;
      difficulties: string;
      yes: string;
      no: string;
      coachReport: string;
      messageToEhpad: string;
      ehpadRating: string;
      inProgressNote: (time: string) => string;
      fullHistory: string;
      origin: string;
      fromContract: string;
      fromContractValue: string;
      createdBy: string;
      createdByValue: string;
      unitType: string;
      city: string;
      rerunAlgo: string;
    };
    wizard: {
      title: string;
      subtitle: string;
      complete: string;
      steps: { type: string; establishment: string; details: string; assignment: string; recap: string };
      fields: {
        type: string;
        origin: string;
        establishment: string;
        establishmentHint: string;
        date: string;
        startTime: string;
        chained: string;
        chainedHint: string;
        unit: string;
        tarif: string;
        markers: string;
        assignMode: string;
      };
      count: { one: string; two: string; three: string };
      markers: { cfppa: string; bdc: string };
      types: Record<'ponctuelle' | 'evenement' | 'decouverte' | 'test', { label: string; desc: string }>;
      origins: Record<'tel' | 'mail' | 'salon' | 'reco' | 'campagne' | 'web' | 'autre', string>;
      units: Record<'uc' | 'up' | 'aidants' | 'soignants', { label: string; desc: string }>;
      tarifs: Record<'150' | '50' | '0', string>;
      modes: Record<'flex' | 'fixed' | 'direct', { label: string; desc: string }>;
      recap: {
        type: string;
        establishment: string;
        dateTime: string;
        format: string;
        tarif: string;
        free: string;
        assignment: string;
      };
      cost: {
        title: string;
        revenue: string;
        coachCost: string;
        margin: string;
        notifLabel: string;
        notifText: string;
      };
    };
  };

  assignments: {
    title: string;
    subtitle: string;
    runAuto: string;
    bannerLead: string;
    bannerText: (n: number) => string;
    kpiAria: string;
    kpis: Record<'toFill' | 'coverage' | 'emergency' | 'delay', { label: string; hint: string }>;
    massTitle: (total: number) => string;
    massMeta: (revenue: string) => string;
    massClean: string;
    massConflicts: string;
    massManual: string;
    massValidate: (clean: number) => string;
    cascadeTitle: string;
    cascadeOpen: (n: number) => string;
    notifiedResponses: (notified: number, responses: number) => string;
    cascadeSteps: Record<'j7' | 'j5' | 'j3', string>;
    report: string;
    listB: string;
    calendarTitle: string;
    toFillCount: (n: number) => string;
    urgent: string;
    toFill: string;
    suggestedTitle: string;
    weightsLead: string;
    weights: Record<'auto' | 'fiabilite' | 'proximite' | 'equite', string>;
    recommended: string;
    selfPositioned: string;
    chained: string;
    parts: { auto: string; fiabilite: string; proximite: string; equite: string };
    assigned: string;
    validateSuggestion: string;
    assignOverride: string;
    logTitle: string;
    overrideTitle: string;
    cancel: string;
    validateOverride: string;
    reasonRequired: string;
    topPick: string;
    chosenCoach: string;
    gapLabel: string;
    gapPts: (n: number) => string;
    overrideReasonLabel: string;
    precisionLabel: string;
    precisionPlaceholder: string;
    reasons: Record<'continuite' | 'demande' | 'nouveau' | 'ops' | 'autre', string>;
    reportTitle: string;
    confirmReport: string;
    reportShort: string;
    reportMedium: string;
    coachesAvailable: (n: number) => string;
    listBTitle: string;
    listBSubtitle: string;
    close: string;
    available: string;
    toConfirm: string;
  };

  establishments: {
    title: string;
    subtitle: string;
    export: string;
    create: string;
    kpiAria: string;
    kpis: Record<'active' | 'groups' | 'avgRate' | 'sessionsMonth', { label: string; hint: string }>;
    count: (n: number) => string;
    searchPlaceholder: string;
    searchLabel: string;
    groupFilterLabel: string;
    groupFilter: { all: string; none: string };
    tableAria: string;
    tableEmpty: string;
    unlinked: string;
    status: { active: string; inactive: string };
    columns: { name: string; group: string; contracts: string; rate: string; status: string };
    groupsTitle: string;
    groupCount: (n: number) => string;
    createGroup: string;
    markersTitle: string;
    markersReference: string;
    markers: Record<'cfppa' | 'bdc', { label: string; desc: string }>;
    markerUnits: { sessions: string; homes: string; revenue: string };
    detail: {
      editProfile: string;
      viewContracts: string;
      generalTitle: string;
      company: string;
      siret: string;
      vat: string;
      category: string;
      units: string;
      defaultRate: string;
      ratePerSession: (rate: number) => string;
      statsTitle: string;
      statsTotal: string;
      statsThisMonth: string;
      statsContracts: string;
      statsCoaches: string;
      contactsTitle: string;
      primaryContact: string;
    };
    wizard: {
      title: string;
      subtitle: string;
      complete: string;
      steps: string[];
      categories: Record<string, string>;
      groups: Record<string, string>;
      units: Record<string, string>;
      tarifs: Record<string, string>;
      markers: { cfppa: string; bdc: string };
      invite: {
        send: { label: string; desc: string };
        later: { label: string; desc: string };
      };
      recap: {
        title: string;
        unitsTarif: (units: number, tarif: string) => string;
        noMarker: string;
      };
      f: {
        commercialName: string;
        legalName: string;
        siret: string;
        vat: string;
        category: string;
        group: string;
        units: string;
        mainAddress: string;
        mainAddressHint: string;
        billingSame: string;
        billingAddress: string;
        billingAddressPlaceholder: string;
        sessionElsewhere: string;
        sessionAddress: string;
        sessionAddressPlaceholder: string;
        primaryContactTitle: string;
        firstName: string;
        lastName: string;
        role: string;
        rolePlaceholder: string;
        email: string;
        internalComment: string;
        internalCommentPlaceholder: string;
        extraContactsTitle: string;
        addContact: string;
        extraNamePlaceholder: string;
        extraNameAria: string;
        extraRolePlaceholder: string;
        extraRoleAria: string;
        removeContact: string;
        defaultTarif: string;
        defaultMarkers: string;
        invitation: string;
      };
    };
  };

  coaches: {
    title: string;
    subtitle: string;
    invite: string;
    kpiAria: string;
    kpis: Record<'active' | 'pending' | 'trust' | 'perCoach', { label: string; hint: string }>;
    tabs: { active: string; pending: string; invited: string; all: string };
    tabsAria: string;
    count: (n: number) => string;
    searchPlaceholder: string;
    searchLabel: string;
    tableAria: string;
    tableEmpty: string;
    columns: { coach: string; trust: string; sessionsPerMonth: string; status: string };
    status: Record<'active' | 'pending' | 'invited' | 'suspended', string>;
    decision: { approved: string; rejected: string };
    docNames: Record<'diplomeApa' | 'cv' | 'urssaf' | 'rcpro', string>;
    docState: Record<'valid' | 'pending' | 'missing', string>;
    trustParts: Record<'rating' | 'reliability' | 'responsiveness' | 'tenure', string>;
    trustWeights: Record<'rating' | 'reliability' | 'responsiveness' | 'tenure', string>;
    removeReasons: Record<'maladie' | 'conge' | 'depart' | 'sanction' | 'autre', string>;
    detail: {
      trustIndex: string;
      penaltyActive: string;
      clearPenalty: string;
      penaltyCleared: string;
      trustBreakdownTitle: string;
      coefficients: string;
      docsTitle: string;
      docsEmpty: string;
      activityTitle: string;
      email: string;
      sessionsDone: string;
      sessionsThisMonth: string;
      avgRating: string;
      earningsMonth: string;
      reject: string;
      approve: string;
      docsIncomplete: string;
      removeAll: string;
    };
    remove: {
      title: string;
      cancel: string;
      confirm: string;
      reasonRequired: string;
      confirmRequired: string;
      warning: string;
      reasonLabel: string;
      detailLabel: string;
      detailPlaceholder: string;
      ack: string;
    };
    wizard: {
      title: string;
      subtitle: string;
      completeLabel: (firstName: string) => string;
      theCoach: string;
      steps: { identity: string; kyc: string; zone: string; tarif: string };
      civilities: Record<'mme' | 'm' | 'nc', string>;
      legalStatus: Record<'ae' | 'eurl' | 'sasu' | 'porte' | 'autre', string>;
      specialties: Record<'uc' | 'up' | 'aidants' | 'soignants' | 'ludique' | 'memoire' | 'renfo', string>;
      availSlots: Record<'am' | 'pm', string>;
      kycDocs: Record<
        'cv' | 'diplome' | 'urssaf' | 'rcpro' | 'formation' | 'permis' | 'b3',
        { label: string; desc: string }
      >;
      tarifPresets: Record<'35' | '40' | '50' | 'perso', { label: string; note?: string }>;
      identity: {
        civility: string;
        dob: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        addressHint: string;
        siret: string;
        legal: string;
        noteStrong: string;
        noteBody: string;
      };
      kyc: {
        intro: string;
        mandatory: string;
        mandatory6m: string;
        optional: string;
        docStatus: Record<'received' | 'waiting' | 'optional', string>;
        view: string;
        upload: string;
        noteStrong: string;
        noteBody: string;
      };
      zone: {
        zonesLabel: string;
        zonesHint: string;
        availLabel: string;
        availHint: string;
        cellAria: (slot: string, day: string, on: boolean) => string;
      };
      tarif: {
        rateLabel: string;
        rateHint: string;
        rateSuffix: string;
        goalLabel: string;
        goalHint: string;
        goalSuffix: string;
        caEstimate: (ca: number) => string;
        specialtiesLabel: string;
        specialtiesHint: string;
        inviteBlock: string;
        inviteLabel: string;
        inviteHint: string;
      };
      recap: {
        newCoach: string;
        avatarFirst: string;
        avatarLast: string;
        email: string;
        phone: string;
        zones: string;
        rate: string;
        goal: string;
        goalValue: (n: string) => string;
        note: (firstName: string) => string;
        theCoachCap: string;
      };
    };
  };

  billing: {
    title: string;
    subtitle: string;
    generate: string;
    sync: string;
    kpiAria: string;
    overdueBanner: {
      headline: (n: number, total: string) => string;
      detail: string;
      action: string;
    };
    tabsAria: string;
    tabs: { all: string; draft: string; pending: string; overdue: string; paid: string };
    count: (n: number) => string;
    searchPlaceholder: string;
    searchLabel: string;
    markerFilterLabel: string;
    markerFilter: { all: string; cfppa: string; bdc: string };
    tableAria: string;
    empty: string;
    columns: {
      invoice: string;
      establishment: string;
      sessions: string;
      amountHt: string;
      pennylane: string;
      status: string;
    };
    kpis: Record<'unpaid' | 'pending' | 'avgDelay' | 'month', { label: string; hint: string }>;
    status: Record<'draft' | 'pending' | 'overdue' | 'paid', string>;
    syncStatus: Record<'synced' | 'pending' | 'error' | 'none', string>;
    markers: Record<'cfppa' | 'bdc', string>;
    lineLabels: Record<'apaSessions', string>;
    detail: {
      adjust: string;
      downloadPdf: string;
      syncError: string;
      lineCols: { service: string; qty: string; unitHt: string; totalHt: string };
      totalHt: string;
      terms: { period: string; dueDate: string; billedSessions: string; paymentDate: string };
    };
  };

  settings: {
    title: string;
    subtitle: string;
    save: string;
    total: (n: number) => string;
    units: {
      pts: string;
      ptsRemoved: string;
      minBeforeAfter: string;
      km: string;
      h: string;
    };
    autoMode: {
      title: string;
      on: string;
      off: string;
      note: string;
      stats: string;
      toggleAria: string;
      thresholdLabel: string;
    };
    scoreWeights: {
      title: string;
      note: string;
      auto: string;
      reliability: string;
      proximity: string;
      equity: string;
    };
    trustWeights: {
      title: string;
      note: string;
      rating: string;
      reliability: string;
      responsiveness: string;
      tenure: string;
    };
    businessRules: {
      title: string;
      checkInWindow: string;
      geoRadius: string;
      lateNotifyThreshold: string;
      lateCancelThreshold: string;
      cancelNotice: string;
      invoiceGeneration: string;
      invoiceOptions: { day1: string; day5: string; manual: string };
    };
    penalties: {
      title: string;
      cap: string;
      note: string;
      noShow: string;
      lateCancel: string;
      refusal: string;
      staleAvail: string;
    };
    channels: { email: string; sms: string; push: string };
    templates: {
      title: string;
      edit: string;
      toggleAria: (name: string) => string;
      items: Record<'n1' | 'n2' | 'n3' | 'n4' | 'n5' | 'n6', { name: string; audience: string }>;
    };
    accounts: {
      title: string;
      invite: string;
      note: string;
      roleAdmin: string;
      roleGuest: string;
      colMember: string;
      colEmail: string;
      colRole: string;
      colLastLogin: string;
    };
  };

  coverage: {
    title: string;
    subtitle: string;
    periodLabel: string;
    periods: Record<'this' | 'next' | 'avg', string>;
    kpiAria: string;
    kpis: Record<
      'total' | 'booked' | 'residual' | 'saturated' | 'underserved',
      { label: string; hint?: string }
    >;
    matrixTitle: string;
    matrixHint: string;
    zoneCol: string;
    days: Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri', string>;
    halves: Record<'am' | 'pm', string>;
    cellTitle: (zone: string, slot: string, n: number) => string;
    legendNone: string;
    legendMax: string;
    highPotentialTitle: string;
    underservedTitle: string;
    viewLeads: string;
    recruit: string;
  };

  analytics: {
    periodAria: string;
    periods: Record<'1' | '3' | '6' | '12', string>;
    sections: {
      health: string;
      activity: string;
      pricing: string;
      byGroup: string;
      topCoaches: string;
      topEhpads: string;
    };
    health: Record<'incident' | 'report' | 'late' | 'noshow' | 'recovered', string>;
    activity: Record<'sessions' | 'revenue' | 'coachCost' | 'fill', string>;
    pricingLeadLabel: string;
    revenueTableTitle: string;
    revenueTableAria: string;
    revenueTable: {
      ehpad: string;
      group: string;
      sessions: string;
      avgRate: string;
      revenue: string;
      margin: string;
    };
    groupMeta: (sessions: number, homes: number) => string;
    sessionsCount: (n: number) => string;
  };

  reports: {
    title: string;
    subtitle: string;
    kpiAria: string;
    kpis: Record<'total' | 'complete' | 'missing' | 'evals' | 'evalsMissing', { label: string; hint?: string }>;
    tabs: { all: string; reportMissing: string; evalMissing: string; complete: string };
    tabsAria: string;
    columns: {
      session: string;
      establishment: string;
      coach: string;
      report: string;
      delay: string;
      evaluation: string;
      actions: string;
    };
    report: { complete: string; missing: string };
    evaluation: { pending: string };
    actions: { remind: string; pdf: string };
    count: (n: number) => string;
    searchPlaceholder: string;
    searchLabel: string;
    tableAria: string;
    empty: string;
  };
}

export const fr: Copy = {
  app: {
    brandName: 'Deuxième Souffle',
    consoleName: 'Console DS',
    language: 'Langue',
  },
  topbar: {
    notifications: 'Notifications',
    logout: 'Se déconnecter',
    notificationsPanel: {
      title: 'Notifications',
      unread: (n) => `${n} non lue${n > 1 ? 's' : ''}`,
      markAllRead: 'Tout marquer comme lu',
      empty: 'Vous êtes à jour — aucune notification.',
      viewAll: 'Voir toute l’activité',
      items: [
        {
          id: 'n1',
          kind: 'contract',
          text: 'Nouveau contrat soumis — Résidence Bellevue (2×/sem.)',
          time: 'il y a 24 min',
          unread: true,
        },
        {
          id: 'n2',
          kind: 'incident',
          text: 'Retard signalé — séance 14:00 à La Roseraie',
          time: 'il y a 41 min',
          unread: true,
        },
        {
          id: 'n3',
          kind: 'assignment',
          text: 'Affectation auto proposée pour 12 séances de la semaine 25',
          time: 'il y a 1 h',
          unread: true,
        },
        {
          id: 'n4',
          kind: 'report',
          text: 'Compte-rendu validé — Karim B. à l’EHPAD Les Tilleuls',
          time: 'il y a 2 h',
          unread: false,
        },
      ],
    },
  },
  sidebar: {
    mainNav: 'Navigation principale',
    pending: (n) => `${n} en attente`,
    version: 'v0.1 · prototype',
  },
  shell: {
    skipToContent: 'Aller au contenu',
  },
  placeholder: {
    comingSoon: 'Écran à venir',
    scope: (source) => `Portée — ${source}`,
  },
  notFound: {
    title: 'Page introuvable',
    subtitle: 'Cette page n’existe pas ou a été déplacée.',
    back: 'Retour au tableau de bord',
  },
  login: {
    brandTag: 'Console DS — back-office opérations',
    title: 'Connexion',
    emailLabel: 'Adresse e-mail',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'n’importe lequel (démo)',
    submit: 'Se connecter',
    hintBefore:
      'Prototype sur données simulées — n’importe quel mot de passe fonctionne. Astuce : ajoutez ',
    hintAfter: ' à l’URL pour entrer directement.',
  },
  dashboard: {
    greeting: (firstName) => `Bonjour, ${firstName}`,
    subtitle:
      'Vue d’ensemble opérationnelle — affectations, séances, contrats et facturation en temps réel.',
    analyticsSubtitle:
      'Pilotage opérationnel et financier — santé, activité, tarification effective et tops.',
    monitoringSubtitle:
      'Signaux opérationnels — séances en souffrance, demande, concentration et risques coachs/EHPAD.',
    runAssignments: 'Lancer les affectations',
    kpiAria: 'Indicateurs clés',
    tabs: { overview: 'Vue d’ensemble', analytics: 'Analytics', monitoring: 'Supervision' },
    tabsAria: 'Vues du tableau de bord',
    emergencyTitle: (n) => `${n} séance${n > 1 ? 's' : ''} en cascade d’urgence`,
    emergencyCta: 'Traiter',
    validationTitle: 'Séances à valider',
    validationMeta: 'Affectations proposées par l’algorithme',
    proposed: 'Proposé',
    score: 'Score',
    d7: 'J-7',
    empty: 'Aucune séance en attente de validation.',
    kpis: {
      fillRate: { label: 'Taux de remplissage', value: '92 %', trend: '+3 pts' },
      coachlessSessions: { label: 'Séances sans coach', value: '6', hint: 'à pourvoir cette semaine' },
      monthlyRevenue: { label: 'CA du mois', value: '38 200 €', hint: 'HT · brouillon Pennylane' },
      satisfaction: { label: 'Satisfaction moyenne', value: '4,6', hint: 'sur 5 · 30 derniers jours' },
    },
  },
  nav: {
    dashboard: {
      label: 'Tableau de bord',
      gloss: "Santé opérationnelle, activité, revenus et couverture en un coup d'œil.",
    },
    assignments: {
      label: 'Affectations',
      gloss: 'Algorithme de matching, calendrier d’attribution, override manuel, mode urgence.',
    },
    sessions: {
      label: 'Séances',
      gloss: 'Suivi des séances, check-in géolocalisé, rapports, incidents et retards.',
    },
    reports: {
      label: 'Comptes-rendus',
      gloss: 'Rapports coachs et évaluations EHPAD : complétude, délais, relances.',
    },
    contracts: {
      label: 'Contrats',
      gloss: 'File de validation, cycle de vie complet, créneaux suggérés, renouvellements.',
    },
    establishments: {
      label: 'Établissements',
      gloss: 'Profils EHPAD, contacts, hiérarchie de groupes et gestion tarifaire.',
    },
    coaches: {
      label: 'Coachs',
      gloss: 'Profils coachs, indice de confiance, coefficients d’évaluation, validations.',
    },
    coverage: {
      label: 'Couverture',
      gloss: 'Carte des disponibilités coachs par zone : zones saturées, sous-dotées, leads.',
    },
    billing: {
      label: 'Facturation',
      gloss: 'Génération mensuelle, tableau des factures, ajustements, synchro Pennylane.',
    },
    settings: {
      label: 'Paramètres',
      gloss: 'Coefficients de score, règles métier, modèles de notification, paramètres globaux.',
    },
  },
  navSections: {
    pilotage: 'Pilotage',
    operations: 'Opérations',
    directory: 'Annuaire',
    finance: 'Finance',
  },
  contracts: {
    title: 'Contrats',
    subtitle:
      'Valider, suivre et faire évoluer les contrats commerciaux qui génèrent les séances.',
    newContract: 'Nouveau contrat',
    kpiAria: 'Indicateurs contrats',
    tabsAria: 'Filtrer par statut',
    tableAria: 'Liste des contrats',
    searchPlaceholder: 'EHPAD, groupe, référence…',
    searchLabel: 'Rechercher un contrat',
    empty: 'Aucun contrat pour ce filtre.',
    count: (n) => `${n} contrat(s)`,
    tabs: { pending: 'À valider', active: 'Actifs', renewal: 'À renouveler', all: 'Tous' },
    columns: { ref: 'Réf.', ehpad: 'Établissement', frequency: 'Fréquence', period: 'Période', status: 'Statut' },
    decision: { approved: 'Validé', rejected: 'Rejeté' },
    kpis: {
      toValidate: { label: 'Contrats à valider', value: '4', hint: '2 prioritaires' },
      active: { label: 'Contrats actifs', value: '63', hint: '18 établissements' },
      renewal: { label: 'À renouveler (< 90 j)', value: '7', hint: 'relances en cours' },
      mrr: { label: 'Revenu récurrent / mois', value: '38 200 €', hint: 'HT estimé' },
    },
    status: {
      pending: 'En attente de validation',
      active: 'Actif',
      renewal: 'À renouveler',
      expired: 'Expiré',
      rejected: 'Rejeté',
    },
    fit: { ideal: 'Idéal', good: 'Bon', acceptable: 'Acceptable' },
    rejectReasons: {
      tarif: 'Tarif sous le plancher',
      dispo: 'Indisponibilités incompatibles',
      zone: 'Zone non couverte',
      doublon: 'Doublon avec un contrat existant',
      autre: 'Autre (préciser)',
    },
    freq: {
      '1sem': { label: '1× / semaine', desc: '~4 séances / mois — le plus courant' },
      '2sem': { label: '2× / semaine', desc: '~8 séances / mois' },
      quinzaine: { label: '1× / quinzaine', desc: '~2 séances / mois' },
      mois: { label: '1× / mois', desc: '~1 séance / mois' },
      ponctuel: { label: 'Autre — ponctuel / événement', desc: 'Hors récurrence' },
    },
    units: {
      uc: { label: 'Unité classique (UC)', desc: '~40 résidents' },
      up: { label: 'Unité protégée (UP) / UHR', desc: '~20 résidents' },
      aidants: { label: 'Aidants / Familles' },
      soignants: { label: 'Personnel soignant 30 min', desc: 'Doit être accolée' },
      autre: { label: 'Autre' },
    },
    consecutivity: {
      oui: { label: 'Oui — 2 séances d’affilée le même jour', desc: 'UC → UP, ~2 h, 1 seul déplacement' },
      non: { label: 'Non — sur 2 jours différents', desc: 'Ex. Lundi UC + Jeudi UP · +30 % de chance de 2 coachs' },
    },
    exclusions: {
      weekend: 'Week-end fermé',
      mercredi: 'Pas de mercredi',
      matin: 'Pas le matin',
      'vendredi-am': 'Vendredi après-midi fermé',
    },
    periods: {
      '12glissants': { label: '12 mois glissants (recommandé)', desc: '~48 séances générées' },
      civile: { label: 'Année civile', desc: 'Jusqu’au 31 décembre' },
      '24mois': { label: '24 mois' },
      sansfin: { label: 'Sans fin — reconduction tacite', desc: 'Validation EHPAD trimestrielle' },
    },
    markers: { cfppa: 'CFPPA', bdc: 'Bon de commande', groupe: 'Tarif négocié groupe' },
    detail: {
      reject: 'Rejeter',
      approveWithChanges: 'Approuver avec modifs',
      approve: 'Approuver le contrat',
      startRenewal: 'Lancer le renouvellement',
      dueIn: (days) => `Échéance dans ${days} jours`,
      majorChangeLabel: 'Modification majeure —',
      adminRequired: 'Validation admin requise.',
      rejectionReasonLabel: 'Motif du rejet —',
      period: 'Période',
      rate: 'Tarif',
      rateValue: (rate) => `${rate} € HT / séance`,
      units: 'Unités prises en charge',
      sessionsGenerated: 'Séances générées',
      group: 'Groupe',
      notes: 'Notes de planification',
      slotsTitle: 'Créneaux récurrents suggérés (CON-08)',
    },
    reject: {
      back: 'Retour',
      confirm: 'Confirmer le rejet',
      reasonRequired: 'Motif obligatoire',
      reasonLabel: 'Motif du rejet (transmis à l’EHPAD)',
      precisionLabel: 'Précision (facultatif)',
      precisionPlaceholder: 'Détail du motif…',
    },
    wizard: {
      title: 'Créer un contrat (mode admin)',
      subtitle:
        'Saisie pour le compte d’un établissement — un e-mail de confirmation lui sera envoyé',
      completeLabel: 'Créer & envoyer le mail à l’EHPAD',
      steps: ['Fréquence', 'Unités', 'Consécutivité', 'Indispos', 'Période', 'Validation'],
      establishmentLabel: 'Établissement',
      freqLabel: 'Fréquence souhaitée',
      unitsLabel: 'Quelles unités cibler ?',
      unitsHint: 'Plusieurs unités possibles',
      consecLabel: 'Enchaîner les unités d’affilée ?',
      exclusionsLabel: 'Exclusions rapides',
      exclusionsHint: 'Créneaux où aucune séance ne sera proposée',
      specialPeriodsLabel: 'Périodes spéciales (fermetures, événements)',
      specialPeriodsPlaceholder: 'Ex. Fermeture estivale 10–24 août',
      periodLabel: 'Période du contrat',
      rateLabel: 'Tarif (€ HT / séance)',
      markersLabel: 'Marqueurs (admin)',
      recap: { establishment: 'Établissement', frequency: 'Fréquence', units: 'Unités', period: 'Période' },
      mail: {
        title: 'Mail à l’EHPAD',
        subjectLabel: 'Objet :',
        subject: 'Votre contrat APA Deuxième Souffle',
        bodyLead: (units, freq) =>
          `Bonjour, voici le récapitulatif de votre contrat (${units} unité${units > 1 ? 's' : ''}, ${freq}). Environ `,
        bodySessions: '48 séances',
        bodyTail: ' seront générées sur la période. Merci de valider via le lien ci-dessous.',
        sessionsPill: '~48 séances générées',
      },
    },
  },
  sessions: {
    title: 'Séances',
    subtitle: 'Suivre l’exécution des séances — du check-in au rapport — et traiter les incidents.',
    exportExcel: 'Export Excel',
    newSession: 'Nouvelle séance',
    kpiAria: 'Indicateurs séances',
    kpis: {
      today: { label: 'Séances aujourd’hui', hint: '31 terminées · 5 à venir' },
      week: { label: 'Séances cette semaine', hint: '+12 % vs S24' },
      incidents: { label: 'Incidents ouverts', hint: 'retard + no-show' },
      reports: { label: 'Rapports en attente', hint: 'à relancer' },
    },
    calendarViewAria: 'Vue du calendrier',
    views: { day: 'Jour', week: 'Semaine', month: 'Mois' },
    tabs: {
      today: 'Aujourd’hui',
      upcoming: 'À venir',
      completed: 'Terminées',
      incident: 'Incidents',
      all: 'Toutes',
    },
    columns: { when: 'Quand', ehpad: 'Établissement', coach: 'Animée par', status: 'Statut' },
    status: {
      upcoming: 'À venir',
      inProgress: 'En cours',
      completed: 'Terminée',
      incident: 'Incident',
      cancelled: 'Annulée',
    },
    unassigned: 'Non affecté',
    allCoaches: 'Tous les coachs',
    filterByStatus: 'Filtrer par statut',
    filterByCoach: 'Filtrer par coach',
    searchPlaceholder: 'EHPAD, ville, coach…',
    searchLabel: 'Rechercher une séance',
    tableAria: 'Liste des séances',
    emptyFilter: 'Aucune séance pour ce filtre.',
    sessionCount: (n) => `${n} séance(s)`,
    sessionsTotal: (n) => `${n} séances`,
    weekTitle: (range) => `Semaine du ${range} · densité`,
    monthKpiAria: 'Indicateurs du mois',
    monthKpis: {
      total: 'Total',
      done: 'Réalisées',
      upcoming: 'À venir',
      noCoach: 'Sans coach',
      incidents: 'Incidents',
    },
    monthDay: (day) => `${day} juin`,
    weekdayShort: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    densityLow: 'Densité',
    densityHigh: 'élevée',
    actor: { algo: 'Algo', admin: 'Admin', coach: 'Coach', sync: 'Système', geo: 'GPS', ehpad: 'EHPAD' },
    detail: {
      reschedule: 'Reporter',
      changeCoach: 'Changer le coach',
      downloadPdf: 'Télécharger le PDF',
      coachUnassigned: 'Coach non affecté',
      firstTogether: 'Première séance ensemble',
      participants: 'Participants',
      atmosphere: 'Ambiance générale',
      difficulties: 'Difficultés',
      yes: 'Oui',
      no: 'Non',
      coachReport: 'Rapport du coach',
      messageToEhpad: 'Message à l’EHPAD :',
      ehpadRating: 'Évaluation EHPAD :',
      inProgressNote: (time) =>
        `Séance en cours — check-in validé à ${time}. Le rapport sera disponible à la fin.`,
      fullHistory: 'Historique complet',
      origin: 'Origine',
      fromContract: 'Provient du contrat',
      fromContractValue: 'C-2026-018 (récurrence hebdomadaire)',
      createdBy: 'Créée par',
      createdByValue: 'Génération automatique',
      unitType: 'Type d’unité',
      city: 'Ville',
      rerunAlgo: 'Relancer l’algo',
    },
    wizard: {
      title: 'Créer une séance',
      subtitle: 'Séance hors contrat — saisie pour le compte d’un établissement',
      complete: 'Créer la séance',
      steps: {
        type: 'Type & origine',
        establishment: 'Établissement',
        details: 'Détails',
        assignment: 'Affectation',
        recap: 'Récapitulatif',
      },
      fields: {
        type: 'Type de séance',
        origin: 'Origine de la demande',
        establishment: 'Établissement',
        establishmentHint: 'Rechercher par nom, ville ou SIRET',
        date: 'Date',
        startTime: 'Heure de début',
        chained: 'Séances enchaînées le même jour',
        chainedHint: '1 h par unité',
        unit: 'Unité',
        tarif: 'Tarif',
        markers: 'Marqueurs',
        assignMode: 'Mode d’affectation du coach',
      },
      count: { one: '1 séance', two: '2 séances (2 h)', three: '3 séances (3 h)' },
      markers: { cfppa: 'CFPPA', bdc: 'Bon de commande' },
      types: {
        ponctuelle: { label: 'Séance ponctuelle', desc: 'Hors contrat récurrent' },
        evenement: { label: 'Événement spécial', desc: 'Animation exceptionnelle' },
        decouverte: { label: 'Séance découverte', desc: 'Gratuite — prospection' },
        test: { label: 'Test / formation interne', desc: 'Non facturée' },
      },
      origins: {
        tel: 'Demande EHPAD — téléphone',
        mail: 'Demande EHPAD — e-mail',
        salon: 'Salon',
        reco: 'Recommandation',
        campagne: 'Campagne de prospection',
        web: 'Réseaux sociaux / web',
        autre: 'Autre',
      },
      units: {
        uc: { label: 'UC — Unité classique', desc: '~40 résidents' },
        up: { label: 'UP / UHR — Unité protégée', desc: '~20 résidents' },
        aidants: { label: 'Aidants / Familles', desc: 'Atelier dédié' },
        soignants: { label: 'Personnel soignant', desc: 'Séance 30 min' },
      },
      tarifs: { '150': 'Tarif EHPAD — 150 €', '50': 'CFPPA — 50 €', '0': 'Découverte — gratuite' },
      modes: {
        flex: {
          label: 'Date flexible — l’algo propose les meilleurs créneaux',
          desc: 'Top 4 créneaux autour de la date, classés par nombre de coachs disponibles',
        },
        fixed: {
          label: 'Horaire imposé — Liste B des coachs disponibles',
          desc: 'Coachs éligibles sur le créneau fixe, classés par pertinence',
        },
        direct: {
          label: 'Attribution directe à un coach précis',
          desc: 'Recherche par nom + contrôle automatique des conflits',
        },
      },
      recap: {
        type: 'Type',
        establishment: 'Établissement',
        dateTime: 'Date & heure',
        format: 'Format',
        tarif: 'Tarif',
        free: 'Gratuite',
        assignment: 'Affectation',
      },
      cost: {
        title: 'Coût pour DS',
        revenue: 'CA séance',
        coachCost: 'Coût coach (est.)',
        margin: 'Marge HT',
        notifLabel: 'Notifications',
        notifText: 'Coach (push + e-mail), EHPAD (e-mail), copie admin.',
      },
    },
  },
  assignments: {
    title: 'Affectations',
    subtitle: 'Assigner le bon coach à chaque séance — vite, équitablement et de façon auditable.',
    runAuto: 'Lancer l’affectation auto',
    bannerLead: 'Cascade d’urgence —',
    bannerText: (n) =>
      `${n} séances sans coach à l’approche de l’échéance. Traiter en priorité (report ou Liste B).`,
    kpiAria: 'Indicateurs d’affectation',
    kpis: {
      toFill: { label: 'Séances à pourvoir', hint: 'semaine 25' },
      coverage: { label: 'Taux de couverture', hint: '+3 pts vs S24' },
      emergency: { label: 'Urgences ouvertes', hint: 'no-show + absence' },
      delay: { label: 'Délai moyen d’affectation', hint: 'objectif < 4 h' },
    },
    massTitle: (total) => `Validation en masse · ${total} affectations`,
    massMeta: (revenue) => `Préparation mensuelle proposée par l’algo · CA prévu ${revenue}`,
    massClean: 'sans conflit',
    massConflicts: 'conflits potentiels',
    massManual: 'à traiter manuellement',
    massValidate: (clean) => `Valider les ${clean} affectations`,
    cascadeTitle: 'Cascade d’urgence',
    cascadeOpen: (n) => `${n} ouvertes`,
    notifiedResponses: (notified, responses) =>
      `${notified} notifiés · ${responses} réponse${responses > 1 ? 's' : ''}`,
    cascadeSteps: {
      j7: 'J-7 · élargissement notif',
      j5: 'J-5 · 2e relance ciblée',
      j3: 'J-3 · alerte admin',
    },
    report: 'Reporter',
    listB: 'Liste B',
    calendarTitle: 'Calendrier d’attribution · semaine 25',
    toFillCount: (n) => `${n} séances à pourvoir`,
    urgent: 'Urgent',
    toFill: 'À pourvoir',
    suggestedTitle: 'Coachs suggérés · Liste A',
    weightsLead: 'Score composite pondéré —',
    weights: {
      auto: 'Auto-positionnement',
      fiabilite: 'Fiabilité',
      proximite: 'Proximité',
      equite: 'Équité',
    },
    recommended: 'Recommandé',
    selfPositioned: 'Auto-positionné',
    chained: 'Séance enchaînée',
    parts: {
      auto: 'Auto-position.',
      fiabilite: 'Fiabilité',
      proximite: 'Proximité',
      equite: 'Équité',
    },
    assigned: 'Affecté',
    validateSuggestion: 'Valider la suggestion',
    assignOverride: 'Affecter (override)',
    logTitle: 'Journal des affectations',
    overrideTitle: 'Override — choisir un coach hors recommandation',
    cancel: 'Annuler',
    validateOverride: 'Valider l’override',
    reasonRequired: 'Motif obligatoire',
    topPick: 'Recommandé n°1',
    chosenCoach: 'Coach choisi',
    gapLabel: 'Écart',
    gapPts: (n) => `${n} pts`,
    overrideReasonLabel: 'Motif de l’override',
    precisionLabel: 'Précision (facultatif)',
    precisionPlaceholder: 'Contexte de la décision…',
    reasons: {
      continuite: 'Continuité avec l’établissement',
      demande: 'Demande explicite de l’EHPAD',
      nouveau: 'Profil recommandé trop nouveau',
      ops: 'Optimisation opérationnelle',
      autre: 'Autre (préciser)',
    },
    reportTitle: 'Reporter la séance',
    confirmReport: 'Confirmer le report',
    reportShort: 'Court terme (sous 2 semaines)',
    reportMedium: 'Moyen terme (2–6 semaines)',
    coachesAvailable: (n) => `${n} coachs dispo`,
    listBTitle: 'Liste B — coachs à contacter',
    listBSubtitle: 'Appel direct (Liste A vide)',
    close: 'Fermer',
    available: 'Dispo',
    toConfirm: 'À confirmer',
  },
  establishments: {
    title: 'Établissements',
    subtitle:
      'Gérer les EHPAD clients, leurs contacts, leur rattachement de groupe et leur tarification.',
    export: 'Exporter',
    create: 'Nouvel établissement',
    kpiAria: 'Indicateurs établissements',
    kpis: {
      active: { label: 'Établissements actifs', hint: '1 inactif' },
      groups: { label: 'Groupes', hint: '5 EHPAD non rattachés' },
      avgRate: { label: 'Tarif moyen / séance', hint: 'HT' },
      sessionsMonth: { label: 'Séances ce mois', hint: 'tous établissements' },
    },
    count: (n) => `${n} établissement(s)`,
    searchPlaceholder: 'Nom, ville, raison sociale…',
    searchLabel: 'Rechercher un établissement',
    groupFilterLabel: 'Filtrer par groupe',
    groupFilter: { all: 'Tous les groupes', none: 'Sans groupe' },
    tableAria: 'Liste des établissements',
    tableEmpty: 'Aucun établissement pour ce filtre.',
    unlinked: 'Non rattaché',
    status: { active: 'Actif', inactive: 'Inactif' },
    columns: {
      name: 'Établissement',
      group: 'Groupe',
      contracts: 'Contrats actifs',
      rate: 'Tarif / séance',
      status: 'Statut',
    },
    groupsTitle: 'Groupes',
    groupCount: (n) => `${n} EHPAD`,
    createGroup: 'Créer un groupe',
    markersTitle: 'Marqueurs CFPPA & Bons de commande',
    markersReference: 'Référence · sans impact algo',
    markers: {
      cfppa: { label: 'CFPPA', desc: 'Tarif imposé 50 € HT · reporting régional' },
      bdc: { label: 'Bon de commande', desc: 'N° BdC reporté sur Pennylane' },
    },
    markerUnits: { sessions: 'séances', homes: 'EHPAD', revenue: 'CA' },
    detail: {
      editProfile: 'Modifier le profil',
      viewContracts: 'Voir les contrats',
      generalTitle: 'Informations générales',
      company: 'Raison sociale',
      siret: 'SIRET',
      vat: 'N° TVA',
      category: 'Catégorie',
      units: 'Unités prises en charge',
      defaultRate: 'Tarif par défaut',
      ratePerSession: (rate) => `${rate} € HT / séance`,
      statsTitle: 'Statistiques opérationnelles',
      statsTotal: 'Séances réalisées',
      statsThisMonth: 'Ce mois',
      statsContracts: 'Contrats actifs',
      statsCoaches: 'Coachs intervenants',
      contactsTitle: 'Contacts',
      primaryContact: 'Contact principal',
    },
    wizard: {
      title: 'Créer un établissement',
      subtitle: 'Profil EHPAD + invitation du contact référent à son espace',
      complete: 'Créer & inviter l’EHPAD',
      steps: ['Infos', 'Adresses', 'Contacts', 'Tarif & invitation'],
      categories: {
        public: 'EHPAD public',
        prive: 'EHPAD privé',
        asso: 'EHPAD associatif',
        autonomie: 'Résidence autonomie',
        rss: 'Résidence services seniors',
        usld: 'USLD',
        autre: 'Autre',
      },
      groups: {
        none: 'Indépendant',
        korian: 'Groupe Korian',
        domusvi: 'Groupe DomusVi',
        lyon: 'Réseau Lyon Santé',
      },
      units: {
        uc: 'UC — Unité classique',
        up: 'UP / UHR',
        aidants: 'Aidants / Familles',
        soignants: 'Personnel soignant',
      },
      tarifs: {
        '150': 'Standard — 150 €',
        '130': 'Négocié groupe — 130 €',
        '50': 'CFPPA — 50 €',
      },
      markers: { cfppa: 'CFPPA (subvention)', bdc: 'Bon de commande' },
      invite: {
        send: { label: 'Envoyer l’invitation au référent', desc: 'Mail d’activation de l’espace EHPAD' },
        later: { label: 'Créer sans inviter', desc: 'Inviter plus tard' },
      },
      recap: {
        title: 'Récapitulatif',
        unitsTarif: (units, tarif) => `${units} unité(s) · tarif ${tarif} € HT`,
        noMarker: 'Aucun marqueur',
      },
      f: {
        commercialName: 'Nom commercial',
        legalName: 'Raison sociale (facturation)',
        siret: 'SIRET',
        vat: 'N° TVA intracom.',
        category: 'Catégorie',
        group: 'Groupe',
        units: 'Unités présentes',
        mainAddress: 'Adresse principale (siège)',
        mainAddressHint: 'Sert au calcul de proximité des coachs (Google Maps)',
        billingSame: 'Adresse de facturation identique',
        billingAddress: 'Adresse de facturation',
        billingAddressPlaceholder: 'Adresse de facturation',
        sessionElsewhere: 'Lieu des séances différent du siège',
        sessionAddress: 'Adresse des séances',
        sessionAddressPlaceholder: 'Adresse du lieu des séances',
        primaryContactTitle: 'Contact référent principal',
        firstName: 'Prénom',
        lastName: 'Nom',
        role: 'Rôle',
        rolePlaceholder: 'Directeur / Animateur',
        email: 'Email',
        internalComment: 'Commentaire interne (admin uniquement)',
        internalCommentPlaceholder: 'Jamais visible par le contact',
        extraContactsTitle: 'Contacts additionnels',
        addContact: 'Ajouter un contact',
        extraNamePlaceholder: 'Prénom Nom',
        extraNameAria: 'Nom du contact additionnel',
        extraRolePlaceholder: 'Rôle',
        extraRoleAria: 'Rôle du contact additionnel',
        removeContact: 'Retirer ce contact',
        defaultTarif: 'Tarif par défaut (€ HT / séance)',
        defaultMarkers: 'Marqueurs par défaut',
        invitation: 'Invitation',
      },
    },
  },
  coaches: {
    title: 'Coachs',
    subtitle: 'Valider les inscriptions, suivre les profils et piloter l’indice de confiance des coachs.',
    invite: 'Inviter un coach',
    kpiAria: 'Indicateurs coachs',
    kpis: {
      active: { label: 'Coachs actifs', hint: '+4 ce mois' },
      pending: { label: 'Inscriptions à valider', hint: 'dossiers complets' },
      trust: { label: 'Indice de confiance moyen', hint: 'sur 5' },
      perCoach: { label: 'Séances / coach / mois', hint: 'objectif 6–8' },
    },
    tabs: { active: 'Actifs', pending: 'À valider', invited: 'Invités', all: 'Tous' },
    tabsAria: 'Filtrer par statut',
    count: (n) => `${n} coach(s)`,
    searchPlaceholder: 'Nom, zone d’intervention…',
    searchLabel: 'Rechercher un coach',
    tableAria: 'Liste des coachs',
    tableEmpty: 'Aucun coach pour ce filtre.',
    columns: {
      coach: 'Coach',
      trust: 'Indice de confiance',
      sessionsPerMonth: 'Séances / mois',
      status: 'Statut',
    },
    status: { active: 'Actif', pending: 'À valider', invited: 'Invité', suspended: 'Suspendu' },
    decision: { approved: 'Approuvé', rejected: 'Refusé' },
    docNames: {
      diplomeApa: 'Diplôme APA',
      cv: 'CV',
      urssaf: 'Attestation URSSAF',
      rcpro: 'Assurance RC pro',
    },
    docState: { valid: 'Validé', pending: 'En attente', missing: 'Manquant' },
    trustParts: {
      rating: 'Évaluations EHPAD',
      reliability: 'Fiabilité',
      responsiveness: 'Réactivité',
      tenure: 'Ancienneté & volume',
    },
    trustWeights: {
      rating: 'Évaluations EHPAD',
      reliability: 'Fiabilité (ponctualité, no-show)',
      responsiveness: 'Réactivité aux propositions',
      tenure: 'Ancienneté & volume',
    },
    removeReasons: {
      maladie: 'Maladie',
      conge: 'Congé / maternité',
      depart: 'Départ de la plateforme',
      sanction: 'Sanction',
      autre: 'Autre (préciser)',
    },
    detail: {
      trustIndex: 'indice de confiance',
      penaltyActive: 'Pénalité active —',
      clearPenalty: 'Retirer la pénalité',
      penaltyCleared: 'Pénalité retirée manuellement — historisée dans le journal.',
      trustBreakdownTitle: 'Décomposition de l’indice de confiance',
      coefficients: 'Coefficients —',
      docsTitle: 'Pièces justificatives',
      docsEmpty: 'Invitation envoyée — le coach n’a pas encore déposé son dossier.',
      activityTitle: 'Activité & financier',
      email: 'Email',
      sessionsDone: 'Séances réalisées',
      sessionsThisMonth: 'Séances ce mois',
      avgRating: 'Note moyenne',
      earningsMonth: 'Revenus ce mois',
      reject: 'Refuser',
      approve: 'Approuver l’inscription',
      docsIncomplete: 'Documents incomplets',
      removeAll: 'Retirer de toutes ses séances',
    },
    remove: {
      title: 'Retirer de toutes ses séances futures',
      cancel: 'Annuler',
      confirm: 'Confirmer le retrait',
      reasonRequired: 'Motif obligatoire',
      confirmRequired: 'Confirmation requise',
      warning:
        'Les 18 séances futures repasseront en « recherche de coach », l’algo sera relancé et les EHPAD concernés notifiés. Le compte du coach reste actif ; les séances passées ne sont pas touchées.',
      reasonLabel: 'Motif du retrait',
      detailLabel: 'Précision (facultatif)',
      detailPlaceholder: 'Contexte…',
      ack: 'Je confirme le retrait des 18 séances futures',
    },
    wizard: {
      title: 'Inviter un coach',
      subtitle: 'Création du profil + invitation — formation DS obligatoire avant validation',
      completeLabel: (firstName) => `Créer & inviter ${firstName}`,
      theCoach: 'le coach',
      steps: {
        identity: 'Identité',
        kyc: 'Documents KYC',
        zone: 'Zone & disponibilités',
        tarif: 'Tarif & invitation',
      },
      civilities: { mme: 'Madame', m: 'Monsieur', nc: 'Non précisé' },
      legalStatus: {
        ae: 'Auto-entrepreneur',
        eurl: 'EURL',
        sasu: 'SASU',
        porte: 'Salarié porté',
        autre: 'Autre',
      },
      specialties: {
        uc: 'Unité classique',
        up: 'Unité protégée (UP / UHR)',
        aidants: 'Aidants',
        soignants: 'Personnel soignant',
        ludique: 'Activité ludique',
        memoire: 'Travail de mémoire',
        renfo: 'Renforcement musculaire',
      },
      availSlots: { am: 'Matin (10–12h)', pm: 'Après-midi (14–17h)' },
      kycDocs: {
        cv: { label: 'CV', desc: 'Parcours professionnel · PDF' },
        diplome: { label: 'Diplôme APA ou équivalent', desc: 'STAPS APA, BPJEPS APT, etc. · PDF' },
        urssaf: { label: 'Attestation URSSAF / vigilance', desc: 'À jour de moins de 6 mois · PDF' },
        rcpro: { label: 'Assurance RC Pro', desc: 'En cours de validité · PDF' },
        formation: { label: 'Attestation de formation DS', desc: 'Formation Deuxième Souffle suivie · PDF' },
        permis: { label: 'Permis / pass Navigo', desc: 'Selon le mode de transport · PDF' },
        b3: { label: 'Casier judiciaire (B3)', desc: 'Recommandé pour interventions auprès des seniors · PDF' },
      },
      tarifPresets: {
        '35': { label: '35 €', note: 'junior' },
        '40': { label: '40 €', note: 'standard' },
        '50': { label: '50 €', note: 'sénior confirmé' },
        perso: { label: 'Personnalisé' },
      },
      identity: {
        civility: 'Civilité',
        dob: 'Date de naissance',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        address: 'Adresse personnelle',
        addressHint: 'Sert au calcul de proximité par défaut (Google Maps).',
        siret: 'SIRET',
        legal: 'Statut juridique',
        noteStrong: 'Vérification automatique.',
        noteBody:
          'Le SIRET sera contrôlé via l’INSEE. La formation Deuxième Souffle est obligatoire avant la validation.',
      },
      kyc: {
        intro:
          'Le coach pourra téléverser ses pièces lui-même depuis son espace. Vous pouvez pré-charger ce que vous avez déjà.',
        mandatory: 'obligatoire',
        mandatory6m: 'obligatoire · 6 mois',
        optional: 'optionnel',
        docStatus: { received: 'Reçu', waiting: 'En attente', optional: 'Optionnel' },
        view: 'Voir',
        upload: 'Uploader',
        noteStrong: 'Attestation de vigilance · relance 6 mois.',
        noteBody:
          'Le système relance automatiquement le coach pour fournir une attestation à jour tous les 6 mois (notifications J-30, J-15, J-7, J0).',
      },
      zone: {
        zonesLabel: 'Zones d’intervention favorites',
        zonesHint:
          'Zones où le coach souhaite intervenir en priorité. Il peut tout de même recevoir des propositions ailleurs (libre d’accepter ou non) ; le critère de proximité de l’algo privilégie ces zones.',
        availLabel: 'Disponibilités hebdomadaires',
        availHint:
          'Cochez les demi-journées habituellement disponibles. Le coach pourra affiner depuis son app.',
        cellAria: (slot, day, on) => `${slot}, ${day} — ${on ? 'disponible' : 'indisponible'}`,
      },
      tarif: {
        rateLabel: 'Tarif horaire par défaut',
        rateHint:
          'Coût pour DS pour 1 h de séance. Modifiable à tout moment + override possible par séance.',
        rateSuffix: '€ HT / heure de séance',
        goalLabel: 'Objectif mensuel souhaité',
        goalHint: 'Indicatif — l’algo aide le coach à atteindre son objectif dans un souci d’équité.',
        goalSuffix: 'Séances / mois (idéal)',
        caEstimate: (ca) => `≈ ${ca} € de CA mensuel`,
        specialtiesLabel: 'Spécialités',
        specialtiesHint: 'Optionnel — aide l’admin à affecter aux bonnes unités.',
        inviteBlock: 'Invitation',
        inviteLabel: 'Envoyer l’invitation par e-mail pour finaliser l’inscription',
        inviteHint:
          'Le coach reçoit un lien unique pour créer son mot de passe et compléter son profil depuis l’app.',
      },
      recap: {
        newCoach: 'Nouveau coach',
        avatarFirst: 'Nouveau',
        avatarLast: 'Coach',
        email: 'E-mail',
        phone: 'Tél.',
        zones: 'Zones',
        rate: 'Tarif horaire',
        goal: 'Objectif',
        goalValue: (n) => `${n} séances / mois`,
        note: (firstName) =>
          `${firstName} recevra son lien d’invitation d’ici une minute, puis pourra compléter son profil depuis l’app.`,
        theCoachCap: 'Le coach',
      },
    },
  },
  billing: {
    title: 'Facturation',
    subtitle: 'Générer, ajuster et synchroniser la facturation mensuelle vers Pennylane.',
    generate: 'Générer les factures du mois',
    sync: 'Synchroniser Pennylane',
    kpiAria: 'Indicateurs facturation',
    overdueBanner: {
      headline: (n, total) => `${n} facture${n > 1 ? 's' : ''} en retard — ${total} HT`,
      detail: 'à recouvrer. Relance recommandée auprès des établissements concernés.',
      action: 'Relancer',
    },
    tabsAria: 'Filtrer par statut',
    tabs: { all: 'Toutes', draft: 'Brouillons', pending: 'En attente', overdue: 'En retard', paid: 'Payées' },
    count: (n) => `${n} facture(s)`,
    searchPlaceholder: 'N° de facture, EHPAD, groupe…',
    searchLabel: 'Rechercher une facture',
    markerFilterLabel: 'Filtrer par marqueur',
    markerFilter: { all: 'Tous les marqueurs', cfppa: 'CFPPA', bdc: 'Bon de commande' },
    tableAria: 'Liste des factures',
    empty: 'Aucune facture pour ce filtre.',
    columns: {
      invoice: 'Facture',
      establishment: 'Établissement',
      sessions: 'Séances',
      amountHt: 'Montant HT',
      pennylane: 'Pennylane',
      status: 'Statut',
    },
    kpis: {
      unpaid: { label: 'Impayés', hint: '4 factures' },
      pending: { label: 'En attente de paiement', hint: 'factures émises' },
      avgDelay: { label: 'Délai moyen de paiement', hint: 'objectif < 30 j' },
      month: { label: 'Facturé ce mois', hint: 'HT' },
    },
    status: {
      draft: 'Brouillon',
      pending: 'En attente',
      overdue: 'En retard',
      paid: 'Payée',
    },
    syncStatus: {
      synced: 'Synchro Pennylane',
      pending: 'À synchroniser',
      error: 'Échec synchro',
      none: 'Non poussée',
    },
    markers: { cfppa: 'CFPPA', bdc: 'BdC' },
    lineLabels: { apaSessions: 'Séances APA réalisées' },
    detail: {
      adjust: 'Ajuster',
      downloadPdf: 'Télécharger le PDF',
      syncError: 'Échec de synchronisation Pennylane — relancer l’envoi depuis la barre d’outils.',
      lineCols: { service: 'Prestation', qty: 'Qté', unitHt: 'PU HT', totalHt: 'Total HT' },
      totalHt: 'Total HT',
      terms: {
        period: 'Période',
        dueDate: 'Échéance',
        billedSessions: 'Séances facturées',
        paymentDate: 'Date de paiement',
      },
    },
  },
  settings: {
    title: 'Paramètres',
    subtitle:
      'Les leviers de configuration globale qui pilotent le matching, l’évaluation et les notifications.',
    save: 'Enregistrer',
    total: (n) => `Total ${n} %`,
    units: {
      pts: 'pts',
      ptsRemoved: 'pts retirés',
      minBeforeAfter: 'min avant / après',
      km: 'km',
      h: 'h',
    },
    autoMode: {
      title: 'Mode AUTO d’affectation',
      on: 'Activé',
      off: 'Désactivé',
      note:
        'Affecte automatiquement le coach au meilleur score lorsque l’écart avec le 2ᵉ dépasse le seuil. Sinon, l’affectation reste manuelle. Désactivé par défaut en V1.',
      stats: '30 derniers jours : 73 auto · 27 manuel · récap quotidien par e-mail.',
      toggleAria: 'Activer le mode AUTO',
      thresholdLabel: 'Seuil d’écart avec le 2ᵉ',
    },
    scoreWeights: {
      title: 'Coefficients de score (matching)',
      note:
        'Pondération des composantes du score composite qui classe les coachs éligibles à chaque séance. Le total doit faire 100 %.',
      auto: 'Auto-positionnement',
      reliability: 'Fiabilité',
      proximity: 'Proximité',
      equity: 'Équité',
    },
    trustWeights: {
      title: 'Coefficients d’évaluation (indice de confiance)',
      note:
        'Pondération des critères qui alimentent l’indice de confiance des coachs, visible dans la fiche coach et utilisé par le matching.',
      rating: 'Évaluations EHPAD',
      reliability: 'Fiabilité',
      responsiveness: 'Réactivité',
      tenure: 'Ancienneté & volume',
    },
    businessRules: {
      title: 'Règles métier',
      checkInWindow: 'Fenêtre de check-in',
      geoRadius: 'Rayon géographique d’éligibilité',
      lateNotifyThreshold: 'Seuil de retard → notification',
      lateCancelThreshold: 'Seuil de retard → annulation',
      cancelNotice: 'Préavis d’annulation EHPAD',
      invoiceGeneration: 'Génération des factures',
      invoiceOptions: { day1: 'Le 1er du mois', day5: 'Le 5 du mois', manual: 'Manuelle' },
    },
    penalties: {
      title: 'Pénalités de fiabilité',
      cap: 'Plafond −20 pts',
      note:
        'Points retirés à l’indice de confiance du coach. Les modifications n’affectent que les calculs futurs.',
      noShow: 'No-show confirmé',
      lateCancel: 'Annulation < 48 h',
      refusal: 'Refus après affectation',
      staleAvail: 'Dispos non confirmées > 30 j',
    },
    channels: { email: 'E-mail', sms: 'SMS', push: 'Push' },
    templates: {
      title: 'Modèles de notification',
      edit: 'Modifier',
      toggleAria: (name) => `Activer « ${name} »`,
      items: {
        n1: { name: 'Rappel de séance (J-1)', audience: 'Coach + EHPAD' },
        n2: { name: 'Proposition d’affectation', audience: 'Coach' },
        n3: { name: 'Alerte retard coach', audience: 'EHPAD + Admin' },
        n4: { name: 'No-show détecté', audience: 'Admin' },
        n5: { name: 'Contrat à renouveler (J-90)', audience: 'EHPAD' },
        n6: { name: 'Facture en retard', audience: 'EHPAD' },
      },
    },
    accounts: {
      title: 'Comptes admin',
      invite: 'Inviter un membre',
      note:
        'Deux rôles en V1 : Admin (accès complet) et Invité (lecture seule du planning, sans données financières).',
      roleAdmin: 'Admin',
      roleGuest: 'Invité',
      colMember: 'Membre',
      colEmail: 'Email',
      colRole: 'Rôle',
      colLastLogin: 'Dernière connexion',
    },
  },
  coverage: {
    title: 'Couverture',
    subtitle:
      'Disponibilités des coachs par zone et créneau — repérer les zones saturées et sous-dotées.',
    periodLabel: 'Période',
    periods: {
      this: 'Cette semaine',
      next: 'Semaine prochaine',
      avg: 'Moyenne 4 prochaines semaines',
    },
    kpiAria: 'Indicateurs de couverture',
    kpis: {
      total: { label: 'Dispos coachs', hint: 'cette semaine' },
      booked: { label: 'Séances bookées' },
      residual: { label: 'Capacité résiduelle' },
      saturated: { label: 'Zones saturées' },
      underserved: { label: 'Zones sous-dotées' },
    },
    matrixTitle: 'Coachs disponibles · zone × créneau',
    matrixHint: 'M = matin 10–12h · A = après-midi 14–17h',
    zoneCol: 'Zone',
    days: { mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven' },
    halves: { am: 'M', pm: 'A' },
    cellTitle: (zone, slot, n) => `${zone} · ${slot} · ${n} coach(s)`,
    legendNone: '0',
    legendMax: '6+',
    highPotentialTitle: 'Zones à fort potentiel',
    underservedTitle: 'Zones sous-dotées',
    viewLeads: 'Voir les leads',
    recruit: 'Recruter',
  },
  analytics: {
    periodAria: 'Période d’analyse',
    periods: { '1': '1 mois', '3': '3 mois', '6': '6 mois', '12': '12 mois' },
    sections: {
      health: 'Santé opérationnelle',
      activity: 'Activité & chiffre d’affaires',
      pricing: 'Tarification effective',
      byGroup: 'CA par groupe',
      topCoaches: 'Top 5 coachs',
      topEhpads: 'Top 5 établissements',
    },
    health: {
      incident: 'Taux d’incident',
      report: 'Taux de report',
      late: 'Annulation tardive',
      noshow: 'No-show',
      recovered: 'Séances récupérées',
    },
    activity: {
      sessions: 'Séances réalisées',
      revenue: 'CA HT',
      coachCost: 'Coût coachs HT',
      fill: 'Taux de remplissage',
    },
    pricingLeadLabel: 'Tarif moyen effectif',
    revenueTableTitle: 'CA par établissement · top 8',
    revenueTableAria: 'CA par établissement',
    revenueTable: {
      ehpad: 'Établissement',
      group: 'Groupe',
      sessions: 'Séances',
      avgRate: 'Tarif moy.',
      revenue: 'CA HT',
      margin: 'Marge',
    },
    groupMeta: (sessions, homes) => `${sessions} séances · ${homes} EHPAD`,
    sessionsCount: (n) => `${n} séances`,
  },
  reports: {
    title: 'Comptes-rendus',
    subtitle:
      'Rapports des coachs et évaluations des EHPAD — complétude, délais de rendu et relances.',
    kpiAria: 'Indicateurs comptes-rendus',
    kpis: {
      total: { label: 'Rapports coach', hint: 'séances réalisées en juin' },
      complete: { label: 'Complets' },
      missing: { label: 'Rapports manquants', hint: 'à relancer' },
      evals: { label: 'Évals EHPAD reçues' },
      evalsMissing: { label: 'Évals manquantes' },
    },
    tabs: {
      all: 'Tous',
      reportMissing: 'Rapport manquant',
      evalMissing: 'Éval manquante',
      complete: 'Complets',
    },
    tabsAria: 'Filtrer par complétude',
    columns: {
      session: 'Séance',
      establishment: 'Établissement',
      coach: 'Coach',
      report: 'Rapport coach',
      delay: 'Délai',
      evaluation: 'Éval EHPAD',
      actions: 'Actions',
    },
    report: { complete: 'Complet', missing: 'Manquant' },
    evaluation: { pending: 'En attente' },
    actions: { remind: 'Relancer', pdf: 'PDF' },
    count: (n) => `${n} séance(s)`,
    searchPlaceholder: 'EHPAD, coach…',
    searchLabel: 'Rechercher un compte-rendu',
    tableAria: 'Liste des comptes-rendus',
    empty: 'Aucun compte-rendu pour ce filtre.',
  },
};
