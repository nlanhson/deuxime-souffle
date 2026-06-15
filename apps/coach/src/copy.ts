/**
 * UI copy for the Coach app — the single localization seam.
 *
 * The app ships in FRENCH. Components must never hardcode user-facing text — pull it
 * from here. To support another locale, add a `copy.en.ts` (or similar) and select by locale.
 *
 * Note: the dates, times, weekday labels, distances (km) and currency (€) that appear in
 * the screen's mock data are placeholders. Real code will format those from data + locale,
 * not from this file.
 */
export const copy = {
  header: {
    date: 'mar. · 9 juin',
    greeting: 'Bonjour, Karim',
    notificationsA11y: 'Notifications, 2 non lues',
    profileA11y: 'Profil de Karim',
    // Coach badge / level chip in the header (WBS PLA-01: "Dashboard displays Coach badge").
    // "Lv" + the number is composed in-component; opens the Badges & level screen.
    levelPrefix: 'Niv',
    levelA11y: 'Votre niveau et vos badges',
  },
  reportBanner: {
    title: 'Compte rendu à compléter',
    subtitle: 'Séance d’hier · Résidence Bellevue',
    action: 'Compléter',
  },
  // Availability nudge (C15). Matching depends on the coach keeping availability + area current
  // (WBS: "the importance of coaches keeping their availability and area up to date"). The
  // "3 weeks ago" is mock — real code shows the actual staleness / hides this when fresh.
  availabilityBanner: {
    title: 'Confirmez vos disponibilités',
    subtitle: 'Mises à jour il y a 3 semaines. Restez disponible.',
    action: 'Mettre à jour',
    a11y: 'Confirmez vos disponibilités. Mises à jour il y a 3 semaines.',
  },
  // Report-due popup (C25). Steps are the WBS's verbatim 6-step post-session report.
  reportModal: {
    eyebrow: 'Séance d’hier · Résidence Bellevue',
    title: 'Complétez votre compte rendu',
    body: 'Le compte rendu en 6 étapes valide la séance et déclenche la facturation. Cela prend environ deux minutes.',
    steps: [
      'Nombre de participants',
      'Activités réalisées',
      'Points à signaler à l’établissement',
      'Notes pour la prochaine séance',
      'Préparation de l’établissement',
      'Votre volume de séances souhaité',
    ],
    primary: 'Commencer le compte rendu',
    secondary: 'Plus tard',
    closeA11y: 'Fermer la fenêtre du compte rendu',
  },
  // Post-session report (C25/C26) — the full-page form, opened straight from the home banner
  // and the Sessions "Write report" CTA (no "Start report" gate). Mirrors the WBS 6-step report
  // (SESS-01, Detail column): one numeric stepper, one single-choice, three Yes/No (two reveal a
  // text field), and a 5-point atmosphere rating. Submitting validates the session and triggers
  // billing. Field VALUES (counts, options) are mock placeholders formatted in the component.
  report: {
    eyebrow: 'Compte rendu de séance',
    // The reported session — mock, mirrors the home banner ("Yesterday's session · Bellevue").
    session: 'Séance d’hier',
    place: 'Résidence Bellevue',
    intro: 'Deux minutes. Cela valide la séance et déclenche votre facturation.',
    closeA11y: 'Fermer le compte rendu',
    required: 'Obligatoire',
    yes: 'Oui',
    no: 'Non',
    // 1 · participants (numeric stepper, WBS default-ish; pre-filled from the session size).
    participants: {
      label: 'Nombre de participants',
      help: 'Combien de résidents ont participé.',
      minusA11y: 'Un participant de moins',
      plusA11y: 'Un participant de plus',
      unit: 'résidents',
    },
    // 2 · activities (multiple choice from admin-configured options — mock list here).
    activities: {
      label: 'Activités réalisées',
      help: 'Sélectionnez tout ce qui s’applique.',
      options: ['Mobilité & équilibre', 'Renforcement', 'Souplesse', 'Coordination', 'Cardio', 'Jeux cognitifs'],
    },
    // 3 · flag to facility (Yes/No → reveals an optional message).
    flag: {
      label: 'Un point à signaler à l’établissement ?',
      help: 'Le coordinateur le verra directement.',
      placeholder: 'Que doit savoir l’établissement ?',
    },
    // 4 · notes for next session (Yes/No → reveals a REQUIRED note).
    nextNotes: {
      label: 'Des notes pour la prochaine séance ?',
      help: 'Transmises à la personne qui l’animera ensuite.',
      placeholder: 'ex. M. Lambert a besoin d’une chaise avec accoudoirs.',
    },
    // 5 · facility readiness (plain Yes/No).
    readiness: {
      label: 'L’établissement était-il prêt à vous accueillir ?',
      help: 'Salle préparée, résidents réunis, matériel disponible.',
    },
    // 6 · participant engagement (WBS SESS-01: 4 emoji options, not a star rating).
    engagement: {
      label: 'Engagement global des participants',
      help: 'À quel point le groupe était impliqué dans l’ensemble.',
      // index 0–3, low → high. The WBS's verbatim four levels.
      levels: [
        { emoji: '😴', word: 'Plutôt fatigués' },
        { emoji: '😐', word: 'Moyen' },
        { emoji: '🙂', word: 'Bien impliqués' },
        { emoji: '🔥', word: 'Très dynamiques' },
      ],
      a11y: 'Engagement des participants',
    },
    // 7 · perceived session difficulty (WBS SESS-01: Easy / Standard / Demanding).
    difficulty: {
      label: 'Difficulté ressentie de la séance',
      help: 'À quel point la séance a été exigeante à animer.',
      // index 0–2, light → hard.
      options: [
        { key: 'easy', word: 'Facile' },
        { key: 'standard', word: 'Standard' },
        { key: 'demanding', word: 'Exigeante' },
      ],
      a11y: 'Difficulté de la séance',
    },
    submit: 'Envoyer le compte rendu',
    incomplete: 'Répondez aux questions en surbrillance pour envoyer.',
    // Confirmation state (replaces the form after submit).
    done: {
      title: 'Compte rendu envoyé',
      body: 'Merci, Karim. Cette séance est validée et votre facturation est en cours.',
      cta: 'Terminé',
    },
  },
  // Availability popup (C15). Note line = current setup (day/time · max travel · transport),
  // the three things the WBS availability config holds; "3 weeks ago" is mock staleness.
  availabilityModal: {
    eyebrow: 'Mises à jour il y a 3 semaines',
    title: 'Toujours disponible comme d’habitude ?',
    body: 'Le matching utilise vos disponibilités hebdomadaires et votre zone de déplacement pour vous proposer des séances. Confirmez qu’elles sont à jour, ou modifiez-les.',
    note: 'Lun–ven matins · jusqu’à 30 min · en voiture',
    primary: 'Oui, c’est à jour',
    secondary: 'Modifier mes disponibilités',
    closeA11y: 'Fermer la fenêtre de disponibilités',
  },
  nextSession: {
    eyebrow: 'Prochaine séance',
    status: 'Confirmée',
    place: 'Résidence Les Tilleuls',
    address: '12 rue des Lilas, Lyon 3e · 2,4 km',
    // Condensed location for the hero card (neighbourhood + travel time). The full street address
    // and unit move to the session detail sheet — progressive disclosure keeps the card glanceable.
    locShort: 'Lyon 3e · ~10 min',
    // Care unit within the EHPAD (WBS PLA-01: "Session cards display Unit type").
    unit: 'Unité protégée · Rez-de-chaussée',
    unitLabel: 'Unité',
    // Client session-detail fields (WBS Coach Planning & Check-in): EHPAD name, time,
    // address, contact person. `contact` = the on-site person to ask for on arrival.
    contact: 'Demandez Marie Laurent · Coordinatrice',
    checkin: 'Check-in ouvert. Vous êtes sur place.',
    // Primary action = geolocated check-in (C16) — the PRD's #1 field action, not a generic "Start".
    checkInCta: 'Faire le check-in',
    directions: 'Itinéraire',
    // Live hero status (Square Go / Jobber pattern): the card reflects the REAL check-in window
    // and travel, not one always-open state. Mock times/distance are formatted in-component.
    inPrefix: 'dans',                        // "in 12 min" / "in 2h 05m" countdown to start
    minUnit: 'min',
    inProgress: 'En cours',
    travel: '~10 min · en voiture',          // travel estimate row (PLA-06)
    opensLine: 'Check-in ouvert à 14h15',    // shown before the check-in window opens
    awayLine: 'Rapprochez-vous pour faire le check-in', // shown when out of the check-in radius
    statusLate: 'En retard',                 // status chip when checked in after the on-time window
    checkedInLate: 'Check-in fait · en retard',
    // Tapping the hero opens the full session detail (same modal language as the available rows).
    detailEyebrow: 'Confirmée · Aujourd’hui',
    start: '14h30',
    end: '15h30',
    duration: '1 h',
    // Compact when-line on the hero card ("Today · 14:30 → 15:30"). "Today" because this is the
    // coach's NEXT session; real code formats the actual day/date from data + locale.
    whenPrefix: 'Aujourd’hui',
    closeA11y: 'Fermer le détail de la séance',
  },
  week: {
    eyebrow: 'Cette semaine',
    monthEyebrow: 'Ce mois-ci',
    // Week-view paging labels (swipe to previous/next week). |offset|>1 → "Week of {Mon Abbr} {d}".
    lastWeek: 'Semaine dernière',
    nextWeek: 'Semaine prochaine',
    weekOf: 'Semaine du',
    prevWeekA11y: 'Semaine précédente',
    nextWeekA11y: 'Semaine suivante',
    // Month-view paging labels — the home calendar pages months too (unlike the June-only
    // Available screen, where the month chevrons are present but disabled).
    prevMonthA11y: 'Mois précédent',
    nextMonthA11y: 'Mois suivant',
    link: 'Séances',
    // Week/Month toggle on the home calendar card (C09/C10).
    seg: { week: 'Semaine', month: 'Mois' },
    toggleA11y: 'Vue du calendrier',
    // Mon-first weekday initials for the month grid (locale-formatted in real code).
    weekdays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    // Reads "{done} done · {total} scheduled · {hours}" — counts are injected from data in the
    // screen; only words/units live here. `doneLabel` is the NEW done-so-far progress metric.
    doneLabel: 'faites',
    scheduledLabel: 'prévues',
    hours: '7 h 30',
    monthHours: '31 h',
    ofLabel: 'sur', // "4 of 5 sessions" — the condensed calendar summary connector
    progressA11y: 'séances faites cette semaine',
    monthProgressA11y: 'séances faites ce mois-ci',
    // Two metric tiles above the calendar: scheduled (the plan) + done (progress so far).
    tiles: {
      scheduled: 'Prévues',
      done: 'Faites',
      unit: 'séances',
      complete: 'terminées',
    },
    // Under-calendar detail: tapping a date reveals its sessions. Past ("due", already happened)
    // sessions read muted; upcoming ones read normal — the chip carries the status in words so
    // it never relies on the graying alone.
    daySection: {
      empty: 'Aucune séance ce jour',
      due: 'À faire',
      upcoming: 'À venir',
      a11ySessions: 'séances',
      a11yNone: 'aucune séance',
    },
  },
  available: {
    eyebrow: 'Séances disponibles aujourd’hui',
    link: 'Voir tout',
    near: 'Disponibles près de vous aujourd’hui · Lyon et alentours',
    apply: 'Postuler',
    // "See all" sheet (today's open sessions)
    allTitle: 'Séances disponibles aujourd’hui',
    closeA11y: 'Fermer les séances disponibles',
  },
  // Available sessions screen (Disponibles tab) — open, not-yet-assigned sessions the coach
  // can apply to. C-stories: "raise or withdraw my interest for an available session" from
  // the list view AND the week view (both named verbatim in the WBS).
  // Deliberate omission: matching is never first-come-first-served (the algorithm ranks and
  // DS assigns ONE coach), so this screen shows no candidate/competitor count — applying is
  // joining a shortlist, not winning a race. `appliedNote` makes that expectation explicit.
  availableScreen: {
    eyebrow: 'Séances ouvertes',
    title: 'Disponibles',
    seg: { list: 'Liste', week: 'Semaine' },
    filterA11y: 'Filtrer les séances ouvertes',
    // The leading count is formatted in code from the data, e.g. "5 open · Lyon & nearby".
    nearSuffix: 'ouvertes · Lyon et alentours',
    status: { applied: 'Postulé' },
    action: {
      apply: 'Lever la main',
      withdraw: 'Retirer',
    },
    // Transient confirmation toasts after raising a hand / withdrawing (WBS PLA-07, verbatim).
    toast: {
      applied: 'Votre candidature a été envoyée',
      withdrawn: 'Votre candidature a été annulée',
    },
    // Session type (WBS PLA-15 card field / PLA-06 "session context"). 'first' = a TEST / first
    // session with this EHPAD ("first visit"); 'regular' = an ongoing session. Localizable labels.
    type: { first: 'Première visite', regular: 'Séance régulière' },
    typeA11y: 'Type de séance',
    // Estimated travel time + over-limit warning (WBS PLA-06 / PLA-08). The estimate is derived
    // in-component from the session distance + the coach's transport preference (mock), so the
    // minute figures are composed in code, not stored here. {mins}/{mode}/{max} are filled in code.
    travel: {
      min: 'min',
      by: 'en',                 // "~12 min en voiture"
      car: 'voiture',
      onFoot: 'à pied',         // "~24 min à pied"
      detailLabel: 'Trajet',
      overLimit: 'Au-delà de votre temps de trajet',
      overLimitBody: 'Environ {mins} min {mode}, au-delà de votre limite de {max} min. Vous pouvez quand même lever la main.',
      overLimitTail: 'au-delà de votre limite',
    },
    appliedNote: 'Vous êtes présélectionné. DS désigne un seul coach.',
    empty: 'Aucune séance ouverte ici pour le moment.',
    emptyHint: 'De nouvelles apparaissent quand les EHPAD en ouvrent près de chez vous.',
    // Filter sheet (List view). Distance maps to the coach's max-travel-time preference (WBS
    // PLA-08); status is the coach's own application state. The "≤ N km" labels and the result
    // count are composed in-component from data.
    filter: {
      title: 'Filtres',
      closeA11y: 'Fermer les filtres',
      distance: 'Distance',
      status: 'Disponibilité',
      distAny: 'Toutes',
      statusAll: 'Toutes',
      statusOpen: 'Ouvertes',
      statusApplied: 'Postulé',
      reset: 'Réinitialiser',
      showPrefix: 'Voir',
      showSuffix: 'séances',
      showOne: 'Voir 1 séance',
      showNone: 'Aucun résultat',
    },
    emptyFiltered: 'Aucune séance ne correspond à vos filtres.',
    clearFilters: 'Effacer les filtres',
    // Calendar-led view (copied from the Home calendar, wired to OPEN sessions). The two metric
    // tiles are adapted to this screen: Open = open sessions in the period, Applied = how many
    // the coach has raised a hand for. Counts/dates are composed in-component from the data.
    cal: {
      // `seg.month` shows the current month name (composed in-component, e.g. "June").
      seg: { week: 'Semaine', month: 'Mois', all: 'Tout' },
      toggleA11y: 'Vue du calendrier',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois-ci',
      allTitle: 'Toutes les séances ouvertes',
      lastWeek: 'Semaine dernière',
      nextWeek: 'Semaine prochaine',
      weekOf: 'Semaine du',
      prevWeekA11y: 'Semaine précédente',
      nextWeekA11y: 'Semaine suivante',
      tiles: { open: 'Ouvertes', applied: 'Postulé', unit: 'séances' },
      // Per-day count (WBS PLA-04: "displays count per day"). Suffix for the day-detail header,
      // composed in-component as "{n} open" / "{n} open sessions".
      dayCountSuffix: 'ouvertes',
      dayEmpty: 'Aucune séance ouverte ce jour.',
      // Whole shown week / month has no open sessions (PLA-04 / PLA-05) — reachable now the
      // calendar pages freely past the seeded period.
      periodEmpty: 'Aucune séance prévue',
      a11ySessions: 'ouvertes',
      a11yNone: 'aucune séance ouverte',
      // Month view: prev/next month a11y + a legend for the day dots (WBS PLA-05). The calendar
      // pages months freely (a live schedule), so the chevrons are active.
      prevMonthA11y: 'Mois précédent',
      nextMonthA11y: 'Mois suivant',
    },
    // List view (the "All" tab) — open sessions bucketed the way the matching algorithm weighs
    // them for THIS coach (WBS PLA-15). Recommended = close to the coach (a strong match); Urgent
    // = starts very soon; Available = everything else. Each session has exactly one bucket, so the
    // counts partition the list. Counts + the urgency countdown are composed in-component.
    list: {
      filterA11y: 'Filtrer les séances ouvertes par catégorie',
      cats: { all: 'Toutes', recommended: 'Recommandées', urgent: 'Urgentes', available: 'Disponibles' },
      // Urgency countdown on urgent cards. "In N days" is composed as `${inDays} ${n} ${days}`.
      urgency: { today: 'Aujourd’hui', tomorrow: 'Demain', inDays: 'Dans', days: 'jours' },
      empty: 'Aucune séance dans cette catégorie.',
      // Total-count caption under the chips (PLA-15: total for the selected period — the List view
      // is one month). No filter → `${n} ${period}`; with a refine filter → `${vis} ${of} ${total} ${shown}`.
      count: { period: 'ouvertes ce mois-ci', of: 'sur', shown: 'affichées' },
    },
    // Detail page — opens when an available-session card is tapped (mirrors the Séances detail).
    detail: {
      title: 'Détails de la séance',
      closeA11y: 'Fermer les détails de la séance',
      when: 'Quand',
      where: 'Où',
      copyA11y: 'Copier l’adresse',
      copied: 'Adresse copiée',   // transient confirmation toast (PLA-06)
      // Session-info rows (PLA-06): the care unit, how to get in, and who to ask for on arrival.
      unit: 'Unité',
      access: 'Accès',
      contact: 'Contact',
      contextA11y: 'Contexte de la séance', // a11y prefix for the context tag (e.g. "First visit")
    },
  },
  earnings: {
    // Home preview (Earnings block on Accueil) — taps through to the Earnings dashboard.
    eyebrow: 'Revenus ce mois-ci',
    link: 'Revenus',
    earned: 'Gagné',
    confirmedSub: '12 séances confirmées',
    projected: 'Prévu',
    projectedSub: '+6 à venir',
    goal: 'Objectif', // monthly target (set at onboarding) — shown on the Earned card
    // Earnings screen (Revenus tab · C35 "View financial dashboard"). All copy here; the
    // euros, hours, dates, ratings and counts are placeholders formatted in the component.
    // Note: this is an *activity report*, not an invoice (WBS) — coaches invoice DS by email.
    screen: {
      eyebrow: 'Mon tableau de bord',
      title: 'Revenus',
      closeA11y: 'Fermer les revenus',
      prevMonthA11y: 'Mois précédent',
      nextMonthA11y: 'Mois suivant',
      earnedLabel: 'Gagné jusqu’ici',
      trendSuffix: 'vs', // composed in-component, e.g. "+12% vs mai"
      projectedLabel: 'prévu à venir',
      expectedLabel: 'attendu ce mois-ci',
      exportPdf: 'Exporter en PDF',
      exportA11y: 'Exporter ce mois-ci en résumé PDF',
      stat: {
        sessions: 'Séances',
        sessionsUnit: 'réalisées',
        hours: 'Heures',
        scheduledPrefix: 'sur', // composed in-component, e.g. "of 60h scheduled"
        scheduledSuffix: 'prévues',
        rate: 'Tarif',
        rateUnit: 'par heure',
      },
      sessionsTitle: 'Séances de ce mois-ci',
      sessionsNote: 'Les revenus se mettent à jour après chaque séance réalisée',
      notRated: 'Non évaluée',
      historyTitle: 'Historique des paiements',
      historyNote: 'Relevé d’activité, pas une facture',
      sessionsCountUnit: 'séances',
      status: {
        paid: 'Payé',
        awaiting: 'En attente de paiement',
        inProgress: 'En cours',
      },
      downloadA11y: 'Télécharger le relevé',
    },
  },
  // Sessions screen (Séances tab) — the coach's assigned sessions. Check-in (C16) and the
  // 6-step report (C25) are the contextual actions that live here.
  sessions: {
    eyebrow: 'Votre planning',
    title: 'Séances',
    seg: { upcoming: 'Confirmées', past: 'Passées', applications: 'Candidatures' },
    status: {
      checkinOpen: 'Check-in ouvert',
      confirmed: 'Confirmée',
      checkedIn: 'Check-in fait',
      reportDue: 'Compte rendu à faire',
      reportSent: 'Compte rendu envoyé',
    },
    action: {
      checkin: 'Faire le check-in',
      directions: 'Itinéraire',
      writeReport: 'Rédiger le compte rendu',
      viewReport: 'Voir le compte rendu',
    },
    emptyPast: 'Aucune séance passée pour l’instant.',
    emptyUpcoming: 'Aucune séance à venir.',
    expandA11y: 'Afficher les détails de la séance',
    collapseA11y: 'Masquer les détails de la séance',
    // Session detail page (C22 "View session details") — opens when a session card is tapped.
    detail: {
      title: 'Détails de la séance',
      closeA11y: 'Fermer les détails de la séance',
      when: 'Quand',
      where: 'Où',
      format: 'Format',
      contact: 'Contact sur place',
      // Coach hourly rate (WBS PLA-14) — the "€ / hour" value is composed in-component.
      rate: 'Votre tarif horaire',
      rateUnit: '€ / heure',
      // Copy address (WBS PLA-02 — no Google Maps API needed to grab the address).
      copyA11y: 'Copier l’adresse',
      copied: 'Copiée',
      // Action-required banner (Fresha pattern) — an explanatory strip at the top of the
      // sheet when the session needs the coach to do something next. Pairs with the pinned
      // footer button (which is the actual action).
      banner: {
        checkin: 'C’est bientôt l’heure — faites le check-in une fois sur place.',
        reportDue: 'Cette séance est terminée. Envoyez votre compte rendu pour que l’établissement reçoive votre retour.',
      },
    },
    // Check-in flow (C16) — geolocated presence confirm, opened by the "Check in" CTA. The modal
    // runs a small state machine: intro → locating → outcome. Outcomes encode the C17 time+location
    // validation and the C18 late case. Geolocation isn't wired yet, so a prototype switcher picks
    // the outcome to preview.
    checkInModal: {
      eyebrow: 'Sur place',
      title: 'Confirmer le check-in',
      body: 'Nous utilisons votre position pour confirmer que vous êtes à l’établissement, puis nous prévenons l’équipe de votre arrivée.',
      note: 'La position est vérifiée uniquement au check-in, jamais suivie en arrière-plan.',
      confirm: 'Faire le check-in',
      cancel: 'Pas encore',
      closeA11y: 'Fermer le check-in',
      locating: 'Vérification de votre présence sur place…',
      result: {
        success:  { title: 'Check-in effectué', body: 'Vous êtes sur place. L’établissement a été prévenu de votre arrivée. Bonne séance.' },
        late:     { title: 'Check-in effectué, en retard', body: 'Votre check-in est validé, mais après le créneau prévu. L’établissement a été prévenu de votre retard.' },
        tooFar:   { title: 'Vous n’y êtes pas encore', body: 'Vous êtes encore trop loin de l’établissement. Rendez-vous sur place et faites le check-in à votre arrivée.' },
        tooEarly: { title: 'Check-in pas encore ouvert', body: 'Le check-in ouvre peu avant le début de la séance. Revenez un peu plus près de l’heure.' },
        denied:   { title: 'Position requise', body: 'Nous avons besoin de votre position pour confirmer votre présence. Activez l’accès à la localisation pour faire le check-in.' },
      },
      done: 'Terminé',
      directions: 'Itinéraire',
      openSettings: 'Ouvrir les réglages',
      // Prototype-only control (no geolocation backend yet) to preview each outcome.
      demoLabel: 'Aperçu du résultat',
      demo: { success: 'Sur place', late: 'En retard', tooFar: 'Trop loin', tooEarly: 'Trop tôt', denied: 'Pas de GPS' },
    },
    // Per-session management actions — shown as a "Manage" group inside the session detail
    // sheet, because each acts on the session you're looking at: cancel participation (C24),
    // declare absence (C20), declare a delay (PLA-14 "Late"), transmission notes (C28).
    manage: {
      title: 'Gérer cette séance',
      cancelParticipation: 'Annuler ma participation',
      declareAbsence: 'Déclarer une absence',
      late: 'Signaler un retard',
      transmissionNotes: 'Notes de transmission',
    },
    // Declare a delay (WBS PLA-14: "Coach can declare a delay by selecting 'Late'") — pick a
    // rough delay, the care home is notified right away. Then a short acknowledgement.
    lateModal: {
      title: 'En retard ?',
      help: 'Indiquez à peu près votre retard. L’établissement est prévenu immédiatement.',
      options: {
        five: 'Environ 5 minutes',
        ten: 'Environ 10 minutes',
        fifteen: 'Environ 15 minutes',
        thirty: '30 minutes ou plus',
      },
      doneTitle: 'Retard déclaré',
      doneBody: 'L’établissement a été prévenu de votre retard. Faites le check-in comme d’habitude à votre arrivée.',
      closeA11y: 'Fermer la déclaration de retard',
    },
    // Cancel participation (C24) — confirm before dropping an assigned session. The warning nods to
    // the reputation rules: a late cancellation (< 48h) and a no-show both carry score penalties.
    cancelConfirm: {
      title: 'Annuler cette séance ?',
      body: 'Vous serez retiré de cette séance et l’établissement sera prévenu. Annuler peu avant le début peut affecter votre score de réputation.',
      confirm: 'Annuler ma participation',
      cancel: 'Garder la séance',
      closeA11y: 'Fermer',
    },
    // Declare absence (C20 / WBS PLA-11 — a 3-STEP required form, not a one-tap confirm):
    // 1 reason (required) → 2 message to the care home → 3 review + confirm. The assignment
    // algorithm treats a declared absence as an availability exclusion, and the reputation
    // system weighs absences/no-shows — hence the deliberate, reviewable flow.
    absenceModal: {
      title: 'Déclarer une absence',
      body: 'Prévenez l’établissement que vous ne pouvez pas venir. Il sera prévenu immédiatement et la séance réattribuée.',
      // "Step 1 of 3 — Reason" is composed in-component from these parts.
      stepPrefix: 'Étape',
      stepOf: 'sur',
      steps: { reason: 'Motif', details: 'Message', confirm: 'Confirmer' },
      reasonLabel: 'Motif',
      reasons: { illness: 'Maladie', emergency: 'Urgence personnelle', transport: 'Problème de transport', other: 'Autre' },
      detailsLabel: 'Message à l’établissement',
      detailsOptional: 'facultatif',
      detailsHelp: 'Toute information utile pour le coordinateur, envoyée avec la notification.',
      detailsPlaceholder: 'ex. Je pourrais animer la séance jeudi à la place.',
      summaryReason: 'Motif',
      summaryMessage: 'Message',
      summaryNone: 'Aucun message',
      note: 'Des absences fréquentes ou de dernière minute peuvent affecter votre score de réputation.',
      next: 'Continuer',
      back: 'Retour',
      confirm: 'Déclarer l’absence',
      cancel: 'Garder la séance',
      closeA11y: 'Fermer l’absence',
    },
    // Transmission notes (C28) — continuity log shared between coaches for a care home. The coach
    // reads prior notes and adds their own for whoever runs the next session there.
    notesModal: {
      title: 'Notes de transmission',
      body: 'Les notes sont partagées avec la personne qui animera la prochaine séance ici.',
      empty: 'Aucune note pour l’instant. Ajoutez la première.',
      placeholder: 'ex. M. Lambert préfère les exercices assis (genou). Le groupe réagit bien à la musique.',
      save: 'Enregistrer la note',
      you: 'Vous',
      justNow: 'À l’instant',
      closeA11y: 'Fermer les notes de transmission',
    },
    // View report (C27) — read-only view of a submitted report + its review status. Field labels
    // and the atmosphere/activity values are reused from copy.report (the 6-step form).
    reportView: {
      title: 'Compte rendu de séance',
      closeA11y: 'Fermer le compte rendu',
      submittedLabel: 'Envoyé',
      reviewStatus: { pending: 'En attente de validation', validated: 'Validé', changes: 'Modifications requises' },
      reviewNote: {
        pending: 'Envoyé. En attente de validation par l’équipe. La facturation démarre une fois validé.',
        validated: 'Validé. Cette séance est confirmée et votre facturation est en cours.',
        changes: 'L’équipe a demandé une modification avant de pouvoir valider ce compte rendu.',
      },
      flagNone: 'Rien à signaler',
      nextNone: 'Aucune note laissée',
      readyYes: 'Oui',
      readyNo: 'Non',
    },
    // Application status (C13) — a cross-session list (your applied-for sessions and where each
    // stands), so it's the third segment rather than a per-session action.
    appStatus: { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée' },
    emptyApplications: 'Aucune candidature en cours.',
    // Application detail (C13) — opens when an application row is tapped.
    appDetail: {
      title: 'Candidature',
      closeA11y: 'Fermer la candidature',
      statusLabel: 'Statut',
      when: 'Séance',
      where: 'Où',
      format: 'Format',
      contact: 'Contact sur place',
      applied: 'Postulé le',
      // A plain-language line explaining what the status means / what happens next.
      note: {
        pending: 'En attente de la décision de l’établissement. Vous serez prévenu dès qu’elle est prise.',
        accepted: 'Vous êtes désigné. Cette séance a été ajoutée à votre planning.',
        rejected: 'Cette séance a été attribuée à un autre coach.',
      },
      // Withdraw application (C14) — only offered while the application is still Pending; once
      // accepted/declined there's nothing to withdraw (an assigned session is cancelled, not withdrawn).
      manageTitle: 'Gérer la candidature',
      withdraw: 'Retirer ma candidature',
      withdrawConfirm: {
        title: 'Retirer cette candidature ?',
        body: 'Vous serez retiré des candidats pour cette séance. Vous pourrez repostuler tant qu’elle reste ouverte.',
        confirm: 'Retirer',
        cancel: 'Garder ma candidature',
      },
    },
  },
  // Generic placeholder screen — a built-but-unwired empty state for sub-flows that don't
  // have a screen yet (e.g. the Sessions overflow-menu destinations). Title is passed per use.
  blank: {
    title: 'Bientôt disponible',
    body: 'Cet écran arrive bientôt.',
    closeA11y: 'Fermer',
  },
  // Notification center (C32) — the near-full-screen modal behind the header bell.
  // Item titles/bodies/times are mock placeholders and live in the component, like other mock data.
  notifications: {
    title: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
    sectionNew: 'Nouvelles',
    sectionEarlier: 'Plus anciennes',
    empty: 'Vous êtes à jour.',
    closeA11y: 'Fermer les notifications',
    actionDone: 'Terminé',
    doneChipA11y: 'Terminé',
  },
  // Profile (C06) — the coach's personal space, opened from the header avatar (locked IA:
  // Profil lives top-right, not in the bottom nav). It is the HUB that gathers the coach's
  // account, documents, and — per the IA follow-up — availability preferences (C15 / PLA-08),
  // which the matching algorithm (E05) depends on. Gamification stays OUT (PRD defers it).
  // Field lists trace to the WBS (E01 Auth & Account, PLA-08 Availability); the screen LAYOUT
  // is a reasoned synthesis pending the client coach video + approved Figma. Mock values
  // (name, email, address, rate, "updated N days ago") live in the component as placeholders.
  profile: {
    eyebrow: 'Votre compte',
    title: 'Profil',
    closeA11y: 'Fermer le profil',
    editPhotoA11y: 'Changer la photo de profil',
    role: 'Coach APA · Lyon',
    // Account status (WBS E01: Active · Pending approval · Rejected · Deleted).
    status: { active: 'Actif', pending: 'En attente de validation', rejected: 'Candidature refusée' },
    // Availability & travel preferences (PLA-08 / S18) — the section matching leans on.
    availability: {
      eyebrow: 'Disponibilités',
      // "Updated N days ago" is composed in-component from the data.
      updatedPrefix: 'Mis à jour',
      justNow: 'à l’instant',
      dayAgo: 'jour',
      daysAgo: 'jours',
      staleNudge: 'Gardez-les à jour pour rester proposé aux séances proches.',
      schedule: 'Planning hebdomadaire',
      travel: 'Temps de trajet max',
      transport: 'Transport',
      // Plural (WBS PLA-08): a primary + an optional secondary departure point.
      departure: 'Adresses de départ',
      areas: 'Zones préférées',
      unavailability: 'Périodes d’indisponibilité',
      cta: 'Mettre à jour mes disponibilités',
    },
    // Progression & past activity — badges/levels (GAME-01/02), submitted reports (SESS-05) and
    // the EHPAD feedback the coach received (SESS-06). Row values are mock placeholders (like
    // availabilityModal.note) — real code composes them from data.
    activity: {
      eyebrow: 'Progression & activité',
      badges: 'Badges & niveau',
      badgesValue: 'Niveau 3 · 5 badges',
      reports: 'Historique des comptes rendus',
      reportsValue: '14 envoyés',
      feedback: 'Avis des établissements',
      feedbackValue: '4,8 de moyenne',
    },
    // Fairness target (target monthly volume + flexibility) and default rate.
    goals: {
      eyebrow: 'Objectifs & tarif',
      target: 'Objectif mensuel',
      rate: 'Tarif horaire par défaut',
    },
    // Onboarding / account-validation documents (WBS E01). An Active coach has all verified.
    documents: {
      eyebrow: 'Mes documents',
      note: 'Requis pour garder votre compte actif',
      cv: 'CV',
      urssaf: 'Attestation URSSAF',
      insurance: 'Assurance professionnelle',
      diploma: 'Diplôme APA',
      status: { verified: 'Vérifié', pending: 'En attente' },
    },
    account: {
      eyebrow: 'Compte',
      personal: 'Informations personnelles',
      calendar: 'Google Calendar',
      connected: 'Connecté',
      password: 'Changer le mot de passe',
      // Account deletion (WBS AUTH-14) — a REQUEST: the DS team processes it (GDPR), nothing is
      // wiped on-device. Once requested, the row shows the pending state.
      deleteAccount: 'Supprimer le compte',
      deleteRequested: 'Demandée',
    },
    support: {
      eyebrow: 'Aide',
      help: 'Centre d’aide',
      contact: 'Nous contacter',
      version: 'Version',
    },
    logout: 'Se déconnecter',
    logoutA11y: 'Se déconnecter de votre compte',
    // ---- Interactive sheets (every row is functional) ----
    // Quick selects/confirms use the shared BottomSheet; multi-field edits use a keyboard-safe
    // form sheet. Photo pick + document upload are mocked (no native picker wired in the prototype).
    common: { cancel: 'Annuler', save: 'Enregistrer', close: 'Fermer', done: 'Terminé' },
    avatarSheet: {
      title: 'Photo de profil',
      help: 'Ajoutez une photo pour que l’établissement vous reconnaisse à votre arrivée.',
      choose: 'Choisir une photo',
      remove: 'Supprimer la photo',
      closeA11y: 'Fermer les options de photo',
    },
    edit: {
      // WBS PLA-08 names Car + Two-wheel vehicle; Walking and the free-text Other stay as
      // client-accepted extras.
      transport: { title: 'Mode de transport', car: 'Voiture', twoWheel: 'Deux-roues', walking: 'À pied', other: 'Autre' },
      vehicle: { title: 'Votre véhicule', label: 'Véhicule', placeholder: 'ex. Transports en commun' },
      // Slider, 10–90 min (WBS PLA-08). The "≤ N min" readout is composed in-component.
      travel: {
        title: 'Temps de trajet max',
        help: 'Jusqu’où vous acceptez de vous déplacer, depuis votre adresse de départ.',
        decA11y: 'Diminuer le temps de trajet max',
        incA11y: 'Augmenter le temps de trajet max',
      },
      // Half-day grid, Mon→Sun (WBS PLA-09) — not whole weekdays.
      schedule: {
        title: 'Planning hebdomadaire',
        help: 'Activez les demi-journées où vous pouvez travailler, week-ends compris.',
        weekdays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        am: 'Matin',
        pm: 'Après-midi',
        notSet: 'Aucune demi-journée définie',
      },
      // Primary + optional secondary departure point (WBS PLA-08 "Departure addresses").
      departure: {
        title: 'Adresses de départ',
        primaryLabel: 'Adresse principale',
        secondaryLabel: 'Adresse secondaire',
        secondaryOptional: 'facultatif',
        help: 'Le temps de trajet vers chaque séance est calculé depuis la plus proche.',
      },
      areas: { title: 'Zones préférées', label: 'Zones', help: 'Les séances en dehors apparaissent quand même. Elles ne sont jamais masquées.' },
      unavailability: { title: 'Périodes d’indisponibilité', label: 'Période', help: 'Vacances ou congés. Indiquez « Aucune à venir » lorsque vous êtes pleinement disponible.' },
      target: { title: 'Objectif mensuel', label: 'Séances par mois', help: 'Utilisé pour répartir équitablement les séances entre coachs.', flexibilityLabel: 'Flexibilité', strict: 'Strict', flexible: 'Flexible' },
      rate: { title: 'Tarif horaire par défaut', label: 'Tarif (€ / heure)' },
      personal: { title: 'Informations personnelles', name: 'Nom complet', email: 'E-mail', phone: 'Téléphone' },
    },
    password: {
      title: 'Changer le mot de passe',
      current: 'Mot de passe actuel',
      next: 'Nouveau mot de passe',
      confirm: 'Confirmer le nouveau mot de passe',
      help: 'Au moins 8 caractères.',
      mismatch: 'Les nouveaux mots de passe ne correspondent pas.',
      tooShort: 'Utilisez au moins 8 caractères.',
      missing: 'Remplissez tous les champs.',
    },
    confirmAvail: {
      title: 'Toujours disponible comme d’habitude ?',
      body: 'Le matching utilise vos disponibilités hebdomadaires et votre zone de déplacement pour vous proposer des séances. Confirmez qu’elles sont à jour, ou vérifiez vos réglages.',
      primary: 'Oui, c’est à jour',
      secondary: 'Vérifier les réglages',
    },
    calendar: {
      connectTitle: 'Connecter Google Calendar',
      connectBody: 'Synchronisez automatiquement vos séances confirmées avec votre Google Calendar.',
      connect: 'Connecter',
      disconnectTitle: 'Déconnecter Google Calendar ?',
      disconnectBody: 'Vos séances confirmées ne seront plus synchronisées avec Google Calendar.',
      disconnect: 'Déconnecter',
      disconnected: 'Non connecté',
    },
    documentSheet: {
      body: 'Ce document est enregistré et garde votre compte actif.',
      replace: 'Remplacer le document',
      pendingNote: 'Nouveau fichier envoyé. En attente de vérification par l’équipe DS.',
    },
    logoutConfirm: { title: 'Se déconnecter ?', body: 'Vous devrez vous reconnecter pour voir vos séances.' },
    // Delete account (AUTH-14) — a deletion REQUEST handled by the DS team, framed as such.
    deleteConfirm: {
      title: 'Supprimer votre compte ?',
      body: 'Cela envoie une demande de suppression à l’équipe Deuxième Souffle. Votre compte, vos séances et vos documents sont supprimés une fois la demande traitée, et c’est irréversible.',
      confirm: 'Demander la suppression',
      requestedTitle: 'Suppression demandée',
      requestedBody: 'L’équipe a reçu votre demande et confirmera par e-mail. Vous pouvez continuer à utiliser l’app jusqu’à son traitement.',
    },
    about: { title: 'Deuxième Souffle · Coach', body: 'Coordination du coaching APA pour les établissements.\nVersion 0.1.0 (prototype).' },
    links: {
      helpUrl: 'https://deuxiemesouffle.fr/aide',
      contactEmail: 'support@deuxiemesouffle.fr',
      contactSubject: 'App Coach : demande d’assistance',
    },
  },
  // Onboarding & auth (E01 — Auth & Account). The coach is a VETTED professional: accounts go
  // Pending → Active only after the DS team verifies documents, so log-in is the entry point —
  // account creation is NOT self-serve in-app. Flow: Splash → Welcome → Login. The FIELD LIST
  // traces to E01 (email + password; a 30-day session + manual logout handled by the auth layer);
  // the LAYOUT is a reasoned synthesis pending the coach video + approved Figma. Facebook social
  // login is a PRD open question (pending client validation) — intentionally left out of this
  // draft.
  auth: {
    // Splash — the in-app branded launch beat (distinct from the native cold-start splash).
    splash: {
      wordmark: 'Deuxième Souffle',
      tagline: 'Le Club',
      a11y: 'Deuxième Souffle',
      skipA11y: 'Passer',
    },
    // Welcome — value proposition for the APA coach + the entry to log in.
    welcome: {
      eyebrow: 'Coach APA',
      // Headline traces to the coach's real job (matching · on-site check-in · earnings).
      title: 'Vos séances,\nvotre rythme.',
      body: 'Soyez mis en relation avec des séances en établissement près de chez vous, faites votre check-in sur place et suivez vos revenus, le tout au même endroit.',
      login: 'Se connecter',
      // Opens the self-registration flow (E01: "Coach self-registration … with admin validation").
      apply: 'Postuler comme coach',
      applyA11y: 'Poser sa candidature en tant que coach',
    },
    // Login — email + password sign-in (+ Google OAuth, per WBS "Coach can log in via Google
    // OAuth", + a cross-link to registration).
    login: {
      eyebrow: 'Bon retour',
      title: 'Connexion',
      subtitle: 'Connectez-vous à votre compte coach.',
      google: 'Continuer avec Google',
      orDivider: 'ou',
      email: { label: 'E-mail', placeholder: 'vous@email.com' },
      password: {
        label: 'Mot de passe',
        placeholder: 'Votre mot de passe',
        showA11y: 'Afficher le mot de passe',
        hideA11y: 'Masquer le mot de passe',
      },
      forgot: 'Mot de passe oublié ?',
      forgotA11y: 'Réinitialiser votre mot de passe',
      // Standard privacy-preserving confirmation (doesn't reveal whether the email is registered).
      // Prototype: no email backend yet — real code triggers the reset email here.
      forgotSent: 'Si cet e-mail est enregistré, nous enverrons un lien de réinitialisation.',
      submit: 'Se connecter',
      // Shown when the form is incomplete/invalid. (Prototype has no backend; real code surfaces
      // the server’s auth error in this same slot.)
      error: 'Saisissez un e-mail valide et votre mot de passe pour continuer.',
      backA11y: 'Retour',
      noAccount: 'Nouveau coach ?',
      createAccount: 'Créer un compte',
    },
    // Forgot password — dedicated reset flow opened from Login's "Forgot password?" link. One email
    // field → a privacy-preserving confirmation (never reveals whether the email is registered).
    // PROTOTYPE: no email backend yet; real code triggers the reset email on submit.
    forgot: {
      eyebrow: 'Aide mot de passe',
      title: 'Réinitialiser le mot de passe',
      subtitle: 'Saisissez l’e-mail de votre compte coach et nous enverrons un lien pour définir un nouveau mot de passe.',
      email: { label: 'E-mail', placeholder: 'vous@email.com' },
      submit: 'Envoyer le lien',
      invalid: 'Saisissez un e-mail valide pour continuer.',
      backA11y: 'Retour à la connexion',
      backToLogin: 'Retour à la connexion',
      // Confirmation state (replaces the form after submit). {email} is composed in-component.
      sentTitle: 'Vérifiez vos e-mails',
      sentBodyPrefix: 'Si ',
      sentBodySuffix: ' est enregistré, un lien pour réinitialiser votre mot de passe est en route. Il peut mettre quelques minutes à arriver.',
      sentHint: 'Pas reçu ? Vérifiez vos spams, ou renvoyez-le.',
      resend: 'Renvoyer',
      done: 'Retour à la connexion',
    },
    // Sign-up / registration (E01 — "Coach self-registration (email / Google) with admin validation").
    // The FIELD SET mirrors the client's back-office "Invite a coach · Step 1 — Coach's identity"
    // form (civility · date of birth · first name · name · email · phone · personal address ·
    // SIRET · legal status + the INSEE auto-verification note), plus what self-registration needs
    // on top: password, the optional invitation code (WBS code↔email pairing) and a consent gate.
    // Submitting creates a PENDING_APPROVAL account (see `pending` — the KYC-documents step).
    // Google OAuth, the INSEE/uniqueness checks and profile completion are stubbed here.
    signup: {
      eyebrow: 'Rejoindre le club',
      title: 'Candidater comme coach',
      subtitle: 'Créez votre compte coach. L’équipe le vérifie avant votre mise en ligne.',
      google: 'Continuer avec Google',
      orDivider: 'ou',
      // Step header, verbatim from the back-office flow; documents follow on the pending screen.
      step: 'Étape 1 : Identité du coach',
      optionalTag: 'facultatif',
      civility: {
        label: 'Civilité',
        placeholder: 'Sélectionner',
        sheetTitle: 'Civilité',
        options: { madam: 'Madame', sir: 'Monsieur' },
      },
      // Typed as DD/MM/YYYY (French format) — the slashes are inserted as you type.
      dob: { label: 'Date de naissance', placeholder: 'JJ/MM/AAAA' },
      firstName: { label: 'Prénom', placeholder: 'Marie' },
      lastName: { label: 'Nom', placeholder: 'Dubois' },
      email: { label: 'E-mail', placeholder: 'marie.dubois@coach.fr' },
      phone: { label: 'Téléphone', placeholder: '06 12 34 56 78' },
      address: {
        label: 'Adresse personnelle',
        placeholder: '12 rue de Vaugirard, 75015 Paris',
        help: 'Utilisée pour le calcul du temps de trajet par défaut.',
      },
      // SIRET = the independent coach's 14-digit business identifier (uniqueness enforced server-side).
      siret: { label: 'SIRET', placeholder: '123 456 789 00012', help: 'Votre numéro d’auto-entrepreneur ou de société.' },
      legalStatus: {
        label: 'Statut juridique',
        placeholder: 'Sélectionner',
        sheetTitle: 'Statut juridique',
        options: {
          selfEmployed: 'Auto-entrepreneur',
          soleProprietor: 'Entreprise individuelle',
          company: 'Société (EURL / SASU)',
          other: 'Autre',
        },
      },
      // Mirrors the back-office note: SIRET → INSEE check; the DS training course gates validation.
      verification: {
        title: 'Vérification automatique',
        body: 'Votre numéro SIRET est vérifié auprès de l’INSEE. La formation Deuxième Souffle est obligatoire avant la validation.',
      },
      password: {
        label: 'Mot de passe',
        placeholder: 'Au moins 8 caractères',
        showA11y: 'Afficher le mot de passe',
        hideA11y: 'Masquer le mot de passe',
      },
      // Optional — only coaches invited by the team receive a code (code ↔ email pairing).
      invite: { label: 'Code d’invitation', optional: 'facultatif', placeholder: 'Si l’équipe vous en a donné un' },
      consent: 'J’accepte les conditions d’utilisation et la politique de confidentialité.',
      consentA11y: 'Accepter les conditions d’utilisation et la politique de confidentialité',
      submit: 'Envoyer ma candidature',
      haveAccount: 'Vous avez déjà un compte ?',
      login: 'Se connecter',
      backA11y: 'Retour',
      // "Check" (not "fill in") — a field can be highlighted because it's invalid, not just empty.
      error: 'Vérifiez les champs en surbrillance pour envoyer votre candidature.',
    },
    // Pending-approval screen (E01 — "Account pending validation" screen). After registration the
    // account is PENDING_APPROVAL and the rest of the app is locked until an admin validates the KYC
    // documents (CV · URSSAF · insurance · APA diploma). "Complete my application" opens document
    // upload (stubbed here). A rejected application would get its own screen + resubmit (deferred).
    pending: {
      eyebrow: 'Statut du compte',
      statusChip: 'En attente de validation',
      title: 'Candidature en cours d’examen',
      // {name} is composed in-component from the registered first name. The indicative review
      // time moved out of the body into its own visible line (WBS AUTH-19).
      bodyPrefix: 'Merci pour votre candidature, ',
      bodySuffix: '. Notre équipe vérifie vos informations et vous enverra un e-mail dès que votre compte est approuvé.',
      bodyNoName: 'Merci pour votre candidature. Notre équipe vérifie vos informations et vous enverra un e-mail dès que votre compte est approuvé.',
      // Indicative processing time (WBS AUTH-19: "Indicative processing time displayed").
      processingTime: 'Délai habituel d’examen : 2–3 jours ouvrés',
      docsEyebrow: 'Documents requis',
      docsNote: 'Ajoutez ceux qui manquent pour accélérer votre validation.',
      docs: { cv: 'CV', urssaf: 'Attestation URSSAF', insurance: 'Assurance professionnelle', diploma: 'Diplôme APA' },
      // Per-document visual status (WBS AUTH-19: received vs pending, never colour alone).
      docStatusMissing: 'À ajouter',
      docStatusReceived: 'Reçu',
      complete: 'Compléter ma candidature',
      completeBody: 'L’envoi des documents est la prochaine étape. Votre candidature est enregistrée et l’équipe peut déjà la voir.',
      backA11y: 'Retour',
    },
  },
  // Badges & level (GAME-01 badge system · GAME-02 levels & progression). Counts, dates and the
  // level number are mock placeholders composed in-component. The note keeps expectations honest:
  // progression is recognition, not pay.
  game: {
    eyebrow: 'Progression',
    title: 'Badges & niveau',
    closeA11y: 'Fermer les badges et le niveau',
    levelPrefix: 'Niveau',
    // Composed in-component: "11 sessions to level 4".
    toNextMid: 'séances avant le niveau',
    totalSuffix: 'séances réalisées',
    earnedTitle: 'Obtenus',
    lockedTitle: 'En cours',
    earnedPrefix: 'Obtenu',
    note: 'Les badges et niveaux progressent avec les séances réalisées, les check-ins ponctuels et les avis des établissements. L’équipe DS les voit aussi, mais ils n’affectent jamais votre rémunération.',
    badges: {
      first: { name: 'Première séance', desc: 'Réalisez votre première séance' },
      ten: { name: '10 séances', desc: 'Réalisez 10 séances' },
      fifty: { name: '50 séances', desc: 'Réalisez 50 séances' },
      punctual: { name: 'Toujours à l’heure', desc: '20 check-ins ponctuels d’affilée' },
      favourite: { name: 'Coup de cœur des résidents', desc: 'Un mois au-dessus de 4,5 de note' },
      hundred: { name: '100 séances', desc: 'Réalisez 100 séances' },
      explorer: { name: 'Explorateur', desc: 'Coach dans 10 établissements différents' },
      streak: { name: 'Mois complet', desc: 'Un mois calendaire sans aucune absence' },
    },
  },
  // Report history (SESS-05) — chronological list of submitted reports, filterable by facility,
  // paginated. Dates/counts are mock placeholders; statuses reuse sessions.reportView wording.
  reportHistory: {
    eyebrow: 'Votre activité',
    title: 'Historique des comptes rendus',
    closeA11y: 'Fermer l’historique des comptes rendus',
    filterAll: 'Tous les établissements',
    filterA11y: 'Filtrer les comptes rendus par établissement',
    countSuffix: 'comptes rendus',
    participantsSuffix: 'participants',
    empty: 'Aucun compte rendu pour cet établissement.',
    showMore: 'Voir plus',
  },
  // EHPAD feedback (SESS-06) — the ratings + comments facilities left on the coach's sessions.
  ehpadFeedback: {
    eyebrow: 'Votre activité',
    title: 'Avis des établissements',
    closeA11y: 'Fermer les avis des établissements',
    averageLabel: 'Note moyenne',
    countSuffix: 'avis',
    note: 'Les établissements évaluent chaque séance après sa fin. Les nouveaux avis apparaissent ici.',
    empty: 'Aucun avis pour l’instant. Il apparaît après votre première séance évaluée.',
  },
  tabs: {
    home: 'Accueil',
    sessions: 'Séances',
    available: 'Disponibles',
    earnings: 'Revenus',
  },
} as const;
