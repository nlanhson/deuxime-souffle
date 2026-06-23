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
    // DT-18: the English "Hi, Karim" is kept in BOTH locales as the sporty/community brand greeting
    // (client decision 2026-06-19) — not localized to "Salut". Shown in Anton caps in the hero.
    greeting: 'Hi, Karim',
    notificationsA11y: 'Notifications, 2 non lues',
    profileA11y: 'Profil de Karim',
    // Accessibility label for the tier card (WBS PLA-01) — opens the progression surface.
    levelA11y: 'Votre palier et votre progression',
    // Section title above the tier card on Home (same style as the other Home titles).
    levelTitle: 'Mon palier',
    // Hero motivational stats (mock values composed in-component: "×5", "214").
    streakLabel: 'Série',
    residentsLabel: 'Résidents',
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
  // Post-session report (C25/C26 · WBS SESS-01) — a 3-step form: Résumé · À transmettre · Confirmation.
  report: {
    eyebrow: 'Compte rendu de séance',
    // The reported session — mock, mirrors the home banner ("Yesterday's session · Bellevue").
    session: 'Séance d’hier',
    place: 'Résidence Bellevue',
    intro: 'Cela valide la séance et déclenche votre facturation.',
    closeA11y: 'Fermer le compte rendu',
    required: 'Obligatoire',
    yes: 'Oui',
    no: 'Non',
    // 3-step wizard chrome (SESS-01 revised + mockup).
    stepPrefix: 'Étape',
    stepOf: 'sur',
    steps: { summary: 'Résumé', recipients: 'À transmettre', confirm: 'Confirmation' },
    back: 'Retour',
    continue: 'Continuer',
    // 48h speed-bonus reminder (SESS-01) — a report sent within 48h earns +1 confidence point.
    speedBonus: {
      title: 'Bonus rapidité',
      body: 'Envoyez votre compte rendu sous 48 h pour gagner +1 point d’indice de confiance.',
      remaining: 'Il vous reste 47 h.',
    },
    // Step 1 · participants (numeric stepper; pre-filled from the session size, default 8).
    participants: {
      label: 'Nombre de participants',
      help: 'Comptez les résidents présents, sans les nommer.',
      minusA11y: 'Un participant de moins',
      plusA11y: 'Un participant de plus',
      unit: 'résidents',
    },
    // Step 1 · activities (multiple choice from admin-configured options — mock list here).
    activities: {
      label: 'Activités réalisées',
      help: 'Sélectionnez tout ce qui s’applique.',
      options: ['Mobilité & équilibre', 'Renforcement', 'Souplesse', 'Coordination', 'Cardio', 'Jeux cognitifs'],
    },
    // Step 1 · facility readiness (plain Yes/No).
    readiness: {
      label: 'L’établissement était-il prêt à vous accueillir ?',
      help: 'Salle préparée, résidents réunis, matériel disponible.',
    },
    // Step 1 · participant dynamism / engagement (SESS-01: 4 emoji options, not a star rating).
    engagement: {
      label: 'Dynamisme global des participants',
      help: 'À quel point le groupe était impliqué dans l’ensemble.',
      // index 0–3, low → high. The WBS's verbatim four levels.
      levels: [
        { emoji: '😴', word: 'Plutôt fatigués' },
        { emoji: '😐', word: 'Moyen' },
        { emoji: '🙂', word: 'Bien impliqués' },
        { emoji: '🔥', word: 'Très dynamiques' },
      ],
      a11y: 'Dynamisme des participants',
    },
    // Step 1 · perceived session difficulty (SESS-01: Easy / Standard / Demanding).
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
    // Step 1 · overall "bilan" (SESS-01 Q4) — the binary that triggers the admin alert; a vigilance
    // reveals a required detail.
    bilan: {
      label: 'Bilan de la séance',
      help: 'Tout s’est-il bien passé, ou y a-t-il un point de vigilance ?',
      ok: 'Rien à signaler',
      issue: 'Point de vigilance',
      detailLabel: 'Détail du point de vigilance',
      detailPlaceholder: 'Décrivez le point de vigilance…',
    },
    // Step 2 · the 3 distinct confidential recipients (SESS-01) — each optional, 200 characters max,
    // visible only to its own recipient.
    recipients: {
      intro: 'Trois destinataires distincts. Chaque message est facultatif et n’est vu que par son destinataire.',
      max: 200,
      coordinator: {
        title: 'Coordinateur de l’établissement',
        audience: 'Visible par l’établissement uniquement',
        help: 'Aménagement de la salle, matériel, observation sur le groupe. Pas de noms de résidents.',
        placeholder: 'Votre message au coordinateur…',
        toggleA11y: 'Ajouter un message au coordinateur',
      },
      ds: {
        title: 'Équipe Deuxième Souffle',
        audience: 'Confidentiel — visible par Deuxième Souffle uniquement',
        help: 'Difficulté opérationnelle, problème d’accès, observation confidentielle.',
        placeholder: 'Votre message confidentiel à l’équipe DS…',
        toggleA11y: 'Ajouter un message confidentiel à l’équipe DS',
      },
      nextCoach: {
        title: 'Prochain coach',
        audience: 'Visible par le prochain coach de ce type de séance',
        help: 'Continuité pédagogique : ce qui aide à préparer la prochaine séance.',
        placeholder: 'ex. M. Lambert a besoin d’une chaise avec accoudoirs.',
        toggleA11y: 'Ajouter une note pour le prochain coach',
      },
      emptyEnabled: 'Écrivez un message ou désactivez ce destinataire.',
    },
    submit: 'Envoyer le compte rendu',
    incomplete: 'Répondez aux questions en surbrillance pour continuer.',
    // Step 3 · confirmation (replaces the form after submit) — validated + billing, the speed-bonus
    // box, and a recap of who received what.
    done: {
      title: 'Compte rendu envoyé',
      body: 'Merci, Karim. Cette séance est validée et votre facturation est en cours.',
      bonusTitle: 'Bonus rapidité obtenu',
      bonusBody: '+1 point d’indice de confiance (envoyé sous 48 h).',
      routingTitle: 'Qui reçoit quoi',
      routing: {
        coordinator: 'Le coordinateur de l’établissement reçoit votre message.',
        ds: 'L’équipe Deuxième Souffle suit la séance.',
        nextCoach: 'Le prochain coach verra votre note.',
      },
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
    // Detail-sheet row labels (scannable icon + label + value rows) + the Call quick action.
    whenLabel: 'Horaire',
    whereLabel: 'Adresse',
    contactLabel: 'Contact',
    callLabel: 'Appeler',
    // Client session-detail fields (WBS Coach Planning & Check-in): EHPAD name, time,
    // address, contact person. `contact` = the on-site person to ask for on arrival.
    contact: 'Demandez Marie Laurent · Coordinatrice',
    // Direct line of the on-site reference person (DT-12) — tap-to-call from the session detail.
    phone: '04 78 30 12 45',
    callA11y: 'Appeler le contact sur place',
    // Previous coach's handover note (DT-09 / SESS-01 Step 2) — shown DIRECTLY on the next-session
    // detail (not behind a menu), integrated from the previous coach's report. Mirrors the same
    // session's transmission note in the Sessions tab so the two screens tell one story.
    handover: {
      label: 'Note de transmission',
      meta: 'Sophie Marchand · coach précédent · 28 mai',
      text: 'M. Lambert préfère les exercices assis à cause d’un problème de genou. Gardez l’échauffement court ; le groupe réagit bien à la musique.',
    },
    checkin: 'Check-in ouvert. Vous êtes sur place.',
    // Primary action = the coach's arrival declaration (WBS PLA-09 "I am on site"; DT-04). The
    // "check-in" term stays on statuses/alerts — only this action button is reworded.
    checkInCta: 'Je suis sur place',
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
  // Coach score (DT-07 / PLA-09) — per-coach matching transparency: the three signals the
  // algorithm weighs (Équité / Réputation / Proximité), /100. Explicitly NOT a ranking vs other
  // coaches (DT-06 keeps gamification non-comparative). Mock figures live in the component. Home + Profile.
  score: {
    title: 'Score coach',
    outOf: '/ 100',
    equity: 'Équité',
    reputation: 'Réputation',
    proximity: 'Proximité',
    caption: 'Critères d’attribution de l’algorithme.',
    a11y: 'Score coach',
  },
  week: {
    eyebrow: 'Cette semaine',
    monthEyebrow: 'Ce mois-ci',
    // Title over the Home calendar (DT-13) — "My schedule": the coach's confirmed/booked sessions,
    // distinct from the "Séances supplémentaires" opportunities block.
    planningTitle: 'Mon planning',
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
    viewSheetCloseA11y: 'Fermer la vue du calendrier',
    // Mon-first weekday initials for the month grid (locale-formatted in real code).
    weekdays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    // Calendar caption (client reword): "{done} séance(s) confirmée(s) sur {total} prévue(s) · {hours}"
    // — e.g. "1 séance confirmée sur 4 prévues · 4 h". Counts are injected from data in the screen;
    // only the words/units live here. Singular/plural variants keep the agreement correct.
    summaryConfirmedOne: 'séance confirmée',
    summaryConfirmedMany: 'séances confirmées',
    summaryOf: 'sur',
    summaryScheduledOne: 'prévue',
    summaryScheduledMany: 'prévues',
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
    // Month-grid dot legend (coach feedback): the red dot here marks the coach's CONFIRMED sessions
    // (this calendar is "Mon planning"). Disponibles' identical dot means "available" — see its copy.
    legend: 'Séance confirmée',
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
    // Home "additional sessions" block (DT-13) — titled distinctly from "Mon planning" (the
    // confirmed schedule) so the coach reads opportunities-to-grab apart from booked sessions.
    homeTitle: 'Séances disponibles à venir',
    // Sub-header for the non-urgent openings, below the ⏰ Urgentes group (DT-14).
    homeLater: 'Plus tard',
    link: 'Voir tout',
    near: 'Disponibles près de vous · Lyon et alentours',
    apply: 'Postuler',
    // "See all" sheet (open upcoming sessions — span several days, so no "today")
    allTitle: 'Séances disponibles à venir',
    closeA11y: 'Fermer les séances disponibles',
  },
  // Available sessions screen (Disponibles tab) — open, not-yet-assigned sessions the coach
  // can apply to. C-stories: "raise or withdraw my interest for an available session" from
  // the list view AND the week view (both named verbatim in the WBS).
  // Deliberate omission: matching is never first-come-first-served (the algorithm ranks and
  // DS assigns ONE coach), so this screen shows no candidate/competitor count — applying is
  // joining a shortlist, not winning a race. `appliedNote` makes that expectation explicit.
  availableScreen: {
    eyebrow: 'Séances disponibles',
    title: 'Disponibles',
    seg: { list: 'Liste', week: 'Semaine' },
    filterA11y: 'Filtrer les séances disponibles',
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
    empty: 'Aucune séance disponible ici pour le moment.',
    emptyHint: 'De nouvelles apparaissent quand les EHPAD en ouvrent près de chez vous.',
    // Filter sheet (List view). Status is the coach's own application state. The result count is
    // composed in-component from data.
    filter: {
      title: 'Filtres',
      closeA11y: 'Fermer les filtres',
      status: 'Statut',
      statusAll: 'Toutes',
      statusOpen: 'À postuler',
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
      viewSheetCloseA11y: 'Fermer la vue du calendrier',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois-ci',
      allTitle: 'Toutes les séances disponibles',
      lastWeek: 'Semaine dernière',
      nextWeek: 'Semaine prochaine',
      weekOf: 'Semaine du',
      prevWeekA11y: 'Semaine précédente',
      nextWeekA11y: 'Semaine suivante',
      tiles: { open: 'Disponibles', applied: 'Postulé', unit: 'séances', unitOne: 'séance' },
      // Month-grid dot legend (coach feedback): here the red dot marks AVAILABLE (open) sessions to
      // apply for. Home's identical dot means "confirmed" (copy.week.legend) — hence the per-screen key.
      legend: 'Séance disponible',
      // Per-day count (WBS PLA-04: "displays count per day"). Suffix for the day-detail header,
      // composed in-component as "{n} open" / "{n} open sessions".
      dayCountSuffix: 'disponibles',
      dayCountSuffixOne: 'disponible',
      dayEmpty: 'Aucune séance disponible ce jour.',
      // Whole shown week / month has no open sessions (PLA-04 / PLA-05) — reachable now the
      // calendar pages freely past the seeded period.
      periodEmpty: 'Aucune séance prévue',
      a11ySessions: 'disponibles',
      a11ySessionsOne: 'disponible',
      a11yNone: 'aucune séance disponible',
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
      filterA11y: 'Filtrer les séances disponibles par catégorie',
      cats: { all: 'Toutes', recommended: 'Recommandées', urgent: 'Urgentes', available: 'Disponibles' },
      // Per-card triage tags (singular). The List view is now date-grouped, so a card carries its
      // matching category as a tag instead of sitting under a category section header.
      tag: { recommended: 'Recommandé', urgent: 'Urgent' },
      // today / tomorrow day-group headers reuse these; the per-card urgency countdown was dropped
      // (the day header already states the date).
      urgency: { today: 'Aujourd’hui', tomorrow: 'Demain', inDays: 'Dans', days: 'jours' },
      empty: 'Aucune séance dans cette catégorie.',
      // Total-count caption under the chips (PLA-15: total for the selected period — the List view
      // is one month). No filter → `${n} ${period}`; with a refine filter → `${vis} ${of} ${total} ${shown}`.
      count: { period: 'disponibles ce mois-ci', of: 'sur', shown: 'affichées' },
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
    expected: 'attendu', // Home meter legend — total the month is on track for (Gagné + Prévu)
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
      // 3-month rolling revenue forecast (DT-15) — DS books ~3 months ahead, so the coach can
      // anticipate cash flow. Current month = réalisé + prévu; next two = projected.
      forecastTitle: 'Prévision sur 3 mois',
      forecastNote: 'Revenu projeté pour les 3 prochains mois — DS planifie 3 mois à l’avance.',
      forecastHeroLabel: 'Prévu sur 3 mois',
      forecastEarned: 'Réalisé',
      forecastProjected: 'Prévu',
      forecastAvgLabel: 'Moyenne',
      forecastAvgUnit: 'par mois',
      forecastA11y: 'Prévision de revenus sur 3 mois',
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
      // Submit-invoice card (per month) — coaches send their own invoice to Deuxième Souffle,
      // either as a file (the PDF they received by e-mail) or a photo. The button opens a source
      // sheet; once sent, the card shows a confirmation for that month.
      invoice: {
        title: 'Soumettre ma facture',
        note: 'Envoyez votre facture du mois — un fichier reçu par e-mail ou une photo.',
        cta: 'Ajouter ma facture',
        ctaA11y: 'Ajouter ma facture pour ce mois-ci',
        sheetTitle: 'Soumettre ma facture',
        sheetHelp: 'Importez un fichier (le PDF reçu par e-mail) ou prenez votre facture en photo.',
        sheetCloseA11y: 'Fermer',
        fromFile: 'Importer un fichier',
        fromPhoto: 'Prendre une photo',
        fromLibrary: 'Choisir une photo',
        // Confirmation once a month's invoice is submitted.
        submittedTitle: 'Facture envoyée',
        via: { file: 'Fichier importé', photo: 'Photo' },
        submittedNote: 'Reçue par Deuxième Souffle · en cours de traitement',
        replace: 'Remplacer',
        replaceA11y: 'Remplacer la facture envoyée',
      },
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
      // Time-derived (PLA-14) — shown while a session is currently running.
      inProgress: 'En cours',
    },
    // "First session together" indicator (TEST session) — a small celebratory tag on the card + detail.
    firstVisit: 'Première séance',
    action: {
      checkin: 'Je suis sur place',
      directions: 'Itinéraire',
      writeReport: 'Rédiger le compte rendu',
      viewReport: 'Voir le compte rendu',
    },
    emptyPast: 'Aucune séance passée pour l’instant.',
    emptyUpcoming: 'Aucune séance à venir.',
    // Empty-state link → the availability editor (WBS S14: "see availability"). Keeping availability
    // up to date is how the coach gets offered sessions.
    emptyUpcomingHint: 'Tenez vos disponibilités à jour pour qu’on vous propose des séances.',
    seeAvailability: 'Voir mes disponibilités',
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
      phone: 'Téléphone',
      // Tap-to-call the on-site reference person (DT-12).
      callA11y: 'Appeler le contact sur place',
      // How to get in on arrival (WBS PLA-14 §5 — "access details if available"); shown only when set.
      access: 'Accès',
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
      confirm: 'Je suis sur place',
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
    // declare absence (C20), declare a delay (PLA-14 "Late"). Transmission notes (C28) now have
    // their own visible section above this group (read prior notes + `notesAdd`).
    manage: {
      title: 'Gérer cette séance',
      cancelParticipation: 'Annuler ma participation',
      declareAbsence: 'Déclarer une absence',
      late: 'Signaler un retard',
      // Short labels for the icon-action toolbar (the full phrases above stay as a11y labels).
      cancelShort: 'Annuler',
      absenceShort: 'Absence',
      lateShort: 'Retard',
      transmissionNotes: 'Notes de transmission',
      notesAdd: 'Ajouter une note',
    },
    // Availability shortcut from a session detail (M1 entry point) → the dedicated editor.
    availability: {
      title: 'Disponibilités',
      intro: 'Ajustez vos créneaux et votre zone — cela change les séances qui vous sont proposées.',
      row: 'Mettre à jour mes disponibilités',
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
    // Cancel participation (C24 · WBS PLA-11 impact-aware + PLA-13 time-phase) — the consequence is
    // timing-based, per the algorithm's configurable penalties: > 48h before the session = no
    // penalty; ≤ 48h = −2 confidence-index points. Per DT-05 no rate/euro figure is shown — impact
    // is reputation + operational (slot reopens, care home notified, future matching).
    cancelModal: {
      title: 'Annuler cette séance ?',
      intro: 'Vous serez retiré de cette séance. Voici ce que cela implique.',
      // Reputation impact — one of the two shows, depending on timing.
      free: { label: 'Aucune pénalité', detail: 'Vous annulez à plus de 48 h du début de la séance.' },
      late: { label: '−2 points d’indice de confiance', detail: 'Vous annulez à moins de 48 h du début de la séance.' },
      consequences: {
        reopen: 'La séance est aussitôt remise aux coachs disponibles.',
        notify: 'L’établissement est prévenu immédiatement.',
        matching: 'Les annulations tardives répétées pèsent sur vos prochaines propositions.',
      },
      confirm: 'Annuler ma participation',
      keep: 'Garder la séance',
      closeA11y: 'Fermer',
      // Acknowledgement (replaces the review after confirming).
      doneTitle: 'Séance annulée',
      doneBody: 'L’établissement a été prévenu et la séance est de nouveau disponible.',
      doneBodyLate: 'L’établissement a été prévenu et la séance est de nouveau disponible. −2 points d’indice de confiance ont été appliqués.',
      doneCta: 'Terminé',
    },
    // Cancellation funnel — the coach's "I can't do this session". A deliberately high-friction flow
    // that MERGES the old impact-aware cancel + declare-absence into one path (the only other
    // session action left is "Signaler un retard"). 3 steps + a retain intercept + a result, with two
    // retain off-ramps before it commits (PLA-11 impact-aware · PLA-13 timing penalty). The impact
    // figures are illustrative prototype values (real app reads the live index / month / forecast).
    cancelFlow: {
      closeA11y: 'Fermer',
      backA11y: 'Retour',
      back: 'Retour',
      step: 'Étape', // "Étape 1/3" — composed in-component as `${step} ${n}/3`
      // ----- Step 1/3 · impact -----
      step1Title: 'Avant d’annuler…',
      warn: 'Annuler cette séance aura un impact sur votre indice de confiance et votre nombre de séances.',
      impactHeading: 'Voici l’impact :',
      impact: {
        confidence: 'Indice de confiance',
        sessions: 'Séances ce mois-ci',
        ca: 'Prévision CA',
        pts: 'pts',
        sessionOne: 'séance',
        sessionMany: 'séances',
      },
      keepCta: 'Finalement, je peux y aller',
      proceedCta: 'J’ai compris, je continue',
      // ----- retain intercept · maintain presence -----
      maintain: {
        title: 'Vous maintenez votre présence ?',
        body: 'Confirmez que vous êtes bien disponible pour cette séance. L’établissement compte sur vous.',
        preservedTitle: 'Avantages préservés',
        preservedConfidence: 'Indice de confiance',
        preservedMaintained: 'maintenu',
        preservedSession: 'Séance comptée dans votre mois',
        preservedCa: 'Prévision CA',
        yes: 'Oui, je maintiens ma présence',
        no: 'Non, je dois vraiment annuler',
      },
      // ----- Step 2/3 · reason -----
      step2Title: 'Quelle est votre raison ?',
      reasonIntro: 'Votre retour aide l’équipe DS à mieux comprendre la situation et à fluidifier le remplacement.',
      reasonSelect: 'Sélectionnez un motif',
      reasons: {
        emergency: { label: 'Urgence médicale ou familiale', hint: 'Un justificatif (certificat médical, hospitalisation…) éviterait le retrait de points — facultatif.' },
        accident: { label: 'Accident', hint: 'Vous pouvez joindre une attestation ou un mot du médecin si vous en avez un — non obligatoire.' },
        transport: { label: 'Problème de transport exceptionnel', hint: '' },
        other: { label: 'Une autre raison', hint: '' },
      },
      proofTitle: 'Justificatif (facultatif)',
      proofBody: 'En tant que coach indépendant·e, vous êtes libre. Si vous avez un justificatif (certificat, attestation…), envoyez-le par e-mail à contact@deuxiemesouffle.fr ou par WhatsApp à l’équipe DS — pas besoin de l’importer dans l’app. Un justificatif valide évite le retrait de points.',
      continue: 'Continuer',
      // ----- Step 3/3 · final confirmation -----
      step3Title: 'Confirmation finale',
      willHappenTitle: 'En confirmant, voici ce qui va se passer :',
      willHappen: {
        notifyDs: 'L’équipe Deuxième Souffle est prévenue immédiatement',
        notifyEhpad: 'L’EHPAD est averti (« coach indisponible, nouveau coach en cours »)',
        replacement: 'L’équipe DS prend en charge la recherche d’un remplaçant',
        penalty: 'Retrait de −2 pts sur votre indice de confiance (sauf justificatif valide fourni)',
      },
      confirmCheck: 'Je confirme que je ne pourrai finalement pas assurer cette séance, et j’accepte l’impact sur mon indice de confiance.',
      abortCta: 'Non, finalement je peux y aller',
      confirmCta: 'Je confirme l’annulation',
      // ----- result -----
      keptTitle: 'Votre séance est maintenue',
      keptBody: 'Rien ne change : même créneau, même établissement. L’établissement compte toujours sur vous.',
      keptCta: 'Parfait',
      cancelledTitle: 'Séance annulée',
      cancelledBody: 'L’établissement est prévenu et l’équipe DS recherche un remplaçant.',
      cancelledPenalty: '−2 points d’indice de confiance ont été appliqués.',
      cancelledCta: 'Terminé',
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
      coordinatorNone: 'Aucun message',
      dsNone: 'Aucun message',
      nextNone: 'Aucune note laissée',
      readyYes: 'Oui',
      readyNo: 'Non',
    },
    // Application status (C13) — a cross-session list (your applied-for sessions and where each
    // stands), so it's the third segment rather than a per-session action.
    // DT-08: only "pending" — no "Acceptée" (auto-moves to Confirmed) or "Refusée" (DS never rejects).
    appStatus: { pending: 'En attente' },
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
      // Tap-to-call the on-site reference person (DT-12).
      callA11y: 'Appeler le contact sur place',
      applied: 'Postulé le',
      // A plain-language line explaining what the status means / what happens next.
      note: {
        // DT-08: notified only IF selected — DS never sends a rejection.
        pending: 'En attente de la décision de l’établissement. Vous serez prévenu si vous êtes retenu pour cette séance.',
      },
      // Withdraw application (C14) — only offered while the application is still Pending; once
      // accepted/declined there's nothing to withdraw (an assigned session is cancelled, not withdrawn).
      manageTitle: 'Gérer la candidature',
      withdraw: 'Retirer ma candidature',
      withdrawConfirm: {
        title: 'Retirer cette candidature ?',
        body: 'Vous serez retiré des candidats pour cette séance. Vous pourrez repostuler tant qu’elle reste disponible.',
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
    // Settings (the gear, top-right of the Profil tab) — the hub of everything that isn't the
    // identity card or the level: availability, goals, documents, account, support, log out.
    settingsTitle: 'Réglages',
    settingsEyebrow: 'Compte & application',
    openSettingsA11y: 'Ouvrir les réglages',
    // Account status (WBS E01: Active · Pending approval · Rejected · Deleted).
    status: { active: 'Actif', pending: 'En attente de validation', rejected: 'Candidature refusée' },
    // App preferences — the FR/EN language toggle lives here (the i18n seam).
    preferences: {
      eyebrow: 'Préférences',
      language: 'Langue',
      a11y: 'Choisir la langue de l’application',
    },
    // Availability & travel preferences (PLA-08 / S18) — the section matching leans on. Lives in a
    // dedicated screen (M1); `manage` labels the Profile summary row, `title`/`intro`/`closeA11y`
    // belong to the screen itself.
    availability: {
      eyebrow: 'Disponibilités',
      title: 'Mes disponibilités',
      // Profile summary row → opens the dedicated screen.
      manage: 'Disponibilités & déplacements',
      intro: 'Le matching s’appuie sur vos disponibilités et votre zone de déplacement pour vous proposer des séances proches.',
      closeA11y: 'Fermer mes disponibilités',
      // "Updated N days ago" is composed in-component from the data.
      updatedPrefix: 'Mis à jour',
      justNow: 'à l’instant',
      dayAgo: 'jour',
      daysAgo: 'jours',
      staleNudge: 'Gardez-les à jour pour rester proposé aux séances proches.',
      schedule: 'Planning hebdomadaire',
      travel: 'Temps de trajet max',
      transport: 'Transport',
      // The primary departure address — the default for any slot no per-slot point covers (PLA-08).
      departure: 'Adresse de départ',
      // Authorized zones (DT-16 revised, 2026-06-22) — hand-picked from a preselected département
      // list. A priority preference the matching favours, not a hard filter. The row value is the
      // chosen codes ("75 · 92 · 94"), composed in-screen; `areasNone` is the empty state.
      areas: 'Zones autorisées',
      areasNone: 'Aucune sélectionnée',
      // Per-slot departure addresses (DT-16) — a coach who leaves from different places at different
      // times sets an address + its own radius for the chosen half-days. Composed counts/summaries
      // are built in-screen.
      perSlot: {
        eyebrow: 'Adresses par créneau',
        hint: 'Vous partez d’ailleurs certains créneaux ? Ajoutez une adresse et un rayon dédiés.',
        empty: 'Tous vos créneaux partent de l’adresse principale.',
        add: 'Ajouter une adresse par créneau',
        coverage: 'Créneaux',
        radius: 'Rayon',
        noCoverage: 'Aucun créneau sélectionné',
        remove: 'Retirer cette adresse',
        slotOne: 'créneau',
        slotMany: 'créneaux',
      },
      // Fine time-slots (v5 "créneaux précis") — refine an open half-day into precise windows, each
      // with its own zones + travel cap. Section labels; the composer's own labels live in edit.fine.
      fine: {
        eyebrow: 'Créneaux précis',
        hint: 'Affinez une demi-journée en plages horaires, chacune avec ses zones et son trajet. Sans plage, la demi-journée reste ouverte en entier.',
        empty: 'Aucun créneau précis. Vos demi-journées ouvertes le sont en entier.',
        add: 'Ajouter un créneau précis',
        remove: 'Retirer ce créneau',
        allZones: 'Toutes mes zones',
        noneOpen: 'Activez d’abord une demi-journée dans le planning.',
      },
      unavailability: 'Périodes d’indisponibilité',
      cta: 'Mettre à jour mes disponibilités',
      // Weekly potential gauge (item 5 / mockup) — sessions/week the coach's availability could
      // yield. The figure (~N) + level are derived in-screen from the slots.
      potential: {
        eyebrow: 'Potentiel hebdomadaire',
        approx: '~',
        perWeek: 'séances / semaine',
        levels: { good: 'Bon potentiel', medium: 'Potentiel moyen', low: 'Potentiel limité' },
        hint: 'Estimé selon vos créneaux et votre zone. Ajoutez des créneaux pour l’augmenter.',
        a11y: 'Potentiel hebdomadaire',
      },
      // ---- Guided flow (mockup "dispos coach v5" screens 2→12) — hub-and-spoke step copy. Reuses
      // edit.* for the shared pieces (transport modes, day/AM-PM labels, fine-slot composer); these
      // are the step-specific titles, intros, buttons and info notes.
      flow: {
        back: 'Retour',
        gauge: 'Potentiel de séances',
        // Hub (screen 2)
        hubAddresses: 'Adresses',
        hubZones: 'Zones favorites',
        hubCreneaux: 'Créneaux',
        detailedPill: 'en détaillé',
        activeSlotsOne: 'demi-journée active',
        activeSlotsMany: 'demi-journées actives',
        validate: 'Valider mes dispos',
        // Transport (screen 3)
        transportTitle: 'Transport & trajet',
        transportQ: 'Comment vous déplacez-vous ?',
        travelDefault: 'Temps de trajet max (par défaut)',
        travelNote: 'Ce temps peut être ajusté par créneau (ex. entre deux séances déjà calées).',
        // Adresses (screens 4 / 5)
        addressTitle: 'Adresses de départ',
        addressIntro: 'D’où partez-vous pour aller chez nos EHPAD ?',
        primaryBadge: 'Par défaut',
        addSecondary: 'Ajouter une adresse différente certains jours',
        whyTwoTitle: 'Pourquoi deux adresses ?',
        whyTwoBody: 'Vous logez parfois ailleurs en semaine (garde alternée…) ? Précisez-le pour matcher les bonnes séances.',
        secondaryTitle: 'Adresse par jour',
        secondaryIntro: 'Jours où vous partez d’une autre adresse.',
        secondaryBadge: 'Adresse secondaire',
        activeDays: 'Jours actifs',
        removeSecondary: 'Retirer cette adresse',
        street: 'Rue',
        postal: 'Code postal',
        city: 'Ville',
        // Zones (screen 6)
        zonesTitle: 'Mes zones',
        zonesIntro: 'Cochez vos départements. Vous pourrez restreindre certaines zones par créneau à l’étape Créneaux.',
        // Créneaux — rapide + détaillé (screens 7 / 8)
        creneauxTitle: 'Mes créneaux',
        modeRapide: 'Mode rapide',
        modeDetaille: 'Mode détaillé',
        rapideHint: 'Touchez pour activer ou désactiver chaque demi-journée.',
        detailleHint: 'Touchez une demi-journée active pour la détailler en créneaux précis.',
        amRange: '9 h – 12 h',
        pmRange: '14 h – 17 h',
        legendFine: '🎯 = créneaux précis définis',
        recapLink: 'Récap de la semaine',
        detailedOn: 'Mode détaillé activé',
        addSlot: 'Ajouter un créneau',
        gapTitle: 'Trou volontaire ?',
        gapBody: 'Entre deux créneaux, l’algo ne proposera rien sur cette plage — c’est volontaire et OK.',
        detailGate: 'Activez d’abord cette demi-journée en mode rapide.',
        // Créneau précis — heure + zones (screens 9 / 10)
        slotTitle: 'Nouveau créneau',
        slotEditTitle: 'Modifier le créneau',
        nextZones: 'Suivant : zones autorisées',
        slotZonesTitle: 'Zones pour ce créneau',
        slotZonesIntro: 'Sur ce créneau, je suis disponible pour :',
        allZonesHint: 'par défaut',
        restrictedHint: 'Je sélectionne ci-dessous',
        slotTravelHint: 'Réduit pour rester proche entre deux séances.',
        validateSlot: 'Valider ce créneau',
        endAfterStart: 'La fin doit suivre le début.',
        // Récap (screen 11)
        recapTitle: 'Récap de ma semaine',
        allZonesShort: 'toutes zones',
        closed: 'Indispo',
        // Indispos & validation (screen 12)
        validationTitle: 'Indispos & validation',
        timeOffIntro: 'Périodes où vous ne serez pas disponible.',
        addPeriod: 'Ajouter une période',
        periodLabel: 'Intitulé',
        periodStart: 'Début',
        periodEnd: 'Fin',
        periodLabelPh: 'ex. Congés d’été',
        periodDatePh: 'ex. 4 août 2026',
        removePeriod: 'Retirer cette période',
        savePeriod: 'Ajouter la période',
        finalRecap: 'Récap final',
        confirm: 'Confirmer mes disponibilités',
        halfDayCount: 'demi-journée(s)',
        fineDayCount: 'jour(s) en détaillé',
      },
    },
    // Progression & past activity — badges/levels (GAME-01/02), submitted reports (SESS-05) and
    // the EHPAD feedback the coach received (SESS-06). Row values are mock placeholders (like
    // availabilityModal.note) — real code composes them from data.
    activity: {
      eyebrow: 'Progression & activité',
      badges: 'Paliers',
      badgesValue: 'Or · 3/5 paliers',
      reports: 'Historique des comptes rendus',
      reportsValue: '14 envoyés',
      feedback: 'Avis des établissements',
      feedbackValue: '4,8 de moyenne',
    },
    // Fairness target (target monthly volume + flexibility). The default-rate field was removed
    // from the coach UI (DT-05) — `rate` copy below is now unused but kept to avoid type churn.
    goals: {
      eyebrow: 'Objectifs',
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
      transport: { title: 'Mode de transport', car: 'Voiture', twoWheel: 'Deux-roues', velo: 'Vélo', transports: 'Transports', walking: 'À pied', other: 'Autre' },
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
      // Primary departure address (WBS PLA-08) — the default for any slot no per-slot point covers.
      departure: {
        title: 'Adresse de départ',
        primaryLabel: 'Adresse principale',
        help: 'Le point de départ par défaut. Le temps de trajet vers chaque séance est calculé depuis ici.',
      },
      // Per-slot departure point editor (DT-16): address, the half-days it covers, and its own radius.
      point: {
        title: 'Adresse par créneau',
        addTitle: 'Nouvelle adresse par créneau',
        addressLabel: 'Adresse',
        addressHelp: 'D’où vous partez pour les créneaux choisis.',
        coverageTitle: 'Créneaux concernés',
        coverageHelp: 'Cochez les demi-journées qui partent de cette adresse.',
        radiusTitle: 'Rayon pour cette adresse',
      },
      // Fine time-slot composer (v5 screens 9+10) — half-day · start/end on the 30-min grid · zones
      // allowed · per-window travel cap. Shape matches FineSlotSheet's `labels` prop (passed whole).
      fine: {
        addTitle: 'Nouveau créneau précis',
        editTitle: 'Modifier le créneau',
        daySection: 'Demi-journée',
        start: 'Heure de début',
        end: 'Heure de fin',
        selected: 'Créneau sélectionné',
        zonesSection: 'Zones autorisées sur ce créneau',
        allZones: 'Toutes mes zones',
        restricted: 'Zones restreintes',
        travel: 'Trajet max sur ce créneau',
        decA11y: 'Diminuer le trajet max',
        incA11y: 'Augmenter le trajet max',
        closeA11y: 'Fermer le créneau précis',
      },
      // Authorized zones picker (DT-16 revised) — multi-select from the preselected département
      // list. Help mirrors the agreed framing: a priority, not an exclusivity.
      zones: {
        title: 'Zones autorisées',
        help: 'Les zones où vous souhaitez intervenir en priorité. Vous pouvez aussi recevoir des propositions de séances dans d’autres zones (libre à vous de les accepter). Le critère de « proximité » du matching favorisera ces zones.',
        closeA11y: 'Fermer les zones autorisées',
      },
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
    // Delete account (AUTH-14) — a soft-delete REQUEST handled by the DS team (item 17 / Q5): the
    // account is deactivated and personal data removed, but invoices + activity history are legally
    // retained (URSSAF / accounting) before purge — never an instant, irreversible wipe of everything.
    deleteConfirm: {
      title: 'Supprimer votre compte ?',
      body: 'Cela envoie une demande à l’équipe Deuxième Souffle. Votre compte sera désactivé et vos données personnelles supprimées. Vos factures et votre historique d’activité sont conservés le temps imposé par la loi (URSSAF, comptabilité), puis supprimés.',
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
      tagline: 'Le Mouvement',
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
      eyebrow: 'Rejoindre le Mouvement',
      title: 'Candidater comme coach',
      subtitle: 'Créez votre compte coach. L’équipe le vérifie avant votre mise en ligne.',
      google: 'Continuer avec Google',
      orDivider: 'ou',
      // Two-step application: step 1 = identity (this form), step 2 = KYC documents (pending screen).
      // The stepper makes the "1 sur 2" progress explicit; the title names what this step covers.
      stepLabel: 'Étape 1 sur 2',
      stepCurrent: 1,
      stepTotal: 2,
      step: 'Identité du coach',
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
      // Short label for the wizard footer button (the full phrase truncates at half-width); the
      // long `submit` stays the accessible name.
      submitShort: 'Postuler',
      haveAccount: 'Vous avez déjà un compte ?',
      login: 'Se connecter',
      backA11y: 'Retour',
      // "Check" (not "fill in") — a field can be highlighted because it's invalid, not just empty.
      error: 'Vérifiez les champs en surbrillance pour envoyer votre candidature.',

      // ── Multi-step application wizard (Identité → Documents → Zone & dispos → Tarif) ──
      // Mirrors the back-office "Inviter un coach" flow, adapted to self-onboarding (no admin
      // recap / invitation). Mode de transport + temps de trajet max are intentionally omitted
      // from the Zone step (the coach sets zones + availability; transport is back-office-managed).
      stepTitles: ['Identité du coach', 'Vos documents', 'Zone & disponibilités', 'Tarif & préférences'],
      stepOfPrefix: 'Étape ',
      stepOfMid: ' sur ',
      back: 'Précédent',
      cancel: 'Annuler',
      cont: 'Continuer',
      kyc: {
        intro: 'Ajoutez les justificatifs que vous avez déjà — vous pourrez compléter le reste depuis votre espace.',
        tagMandatory: 'obligatoire',
        tagMandatory6m: 'obligatoire · 6 mois',
        tagOptional: 'optionnel',
        statusReceived: 'Reçu',
        statusWaiting: 'En attente',
        statusOptional: 'Optionnel',
        add: 'Ajouter',
        view: 'Voir',
        renewTitle: 'Attestation de vigilance · relance 6 mois',
        renewBody: 'Le système vous relance automatiquement pour fournir une attestation à jour tous les 6 mois.',
        docs: {
          cv: { label: 'CV', desc: 'Parcours professionnel · PDF' },
          diploma: { label: 'Diplôme APA ou équivalent', desc: 'STAPS APA, BPJEPS APT, etc. · PDF' },
          urssaf: { label: 'Attestation URSSAF / vigilance', desc: 'À jour de moins de 6 mois · PDF' },
          insurance: { label: 'Assurance RC Pro', desc: 'En cours de validité · PDF' },
          training: { label: 'Attestation de formation DS', desc: 'Formation Deuxième Souffle suivie · PDF' },
          license: { label: 'Permis / pass Navigo', desc: 'Selon votre mode de transport · PDF' },
          record: { label: 'Casier judiciaire (B3)', desc: 'Recommandé auprès des seniors · PDF' },
        },
      },
      area: {
        zonesLabel: 'Zones d’intervention favorites',
        zonesHelp: 'Zones où vous souhaitez intervenir en priorité. Vous pouvez tout de même recevoir des propositions ailleurs.',
        availLabel: 'Disponibilités hebdomadaires',
        availHelp: 'Cochez les demi-journées où vous êtes habituellement disponible. Vous pourrez affiner plus tard.',
        days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        slotAm: 'Matin (10–12h)',
        slotPm: 'Après-midi (14–17h)',
        cellOnA11y: 'disponible',
        cellOffA11y: 'indisponible',
      },
      tariff: {
        rateLabel: 'Tarif horaire souhaité',
        rateHelp: 'Indicatif — l’équipe valide votre tarif avant la mise en ligne. Modifiable plus tard.',
        rateSuffix: '€ HT / h',
        presetJunior: 'junior',
        presetStandard: 'standard',
        presetSenior: 'sénior',
        presetCustom: 'Personnalisé',
        targetLabel: 'Objectif mensuel souhaité',
        targetSuffix: 'séances / mois',
        targetHelp: 'Indicatif — nous aide à vous proposer le bon volume de séances.',
        caPrefix: '≈ ',
        caSuffix: ' € de CA mensuel',
        specialtiesLabel: 'Spécialités',
        specialtiesHelp: 'Facultatif — aide l’équipe à vous affecter aux bonnes unités.',
        specialties: {
          classic: 'Unité classique',
          protected: 'Unité protégée (UP / UHR)',
          helpers: 'Aidants',
          caregivers: 'Personnel soignant',
          playful: 'Activité ludique',
          memory: 'Travail de mémoire',
          strength: 'Renforcement musculaire',
        },
      },
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
      // PROTOTYPE-ONLY control: no validation backend yet, so this stands in for an admin approving
      // the account. Clearly labelled "Aperçu" so it never reads as a real coach action.
      demoApprove: 'Aperçu : simuler la validation',
      // KYC document upload (AUTH-19) — the screen behind "Compléter ma candidature". PROTOTYPE:
      // no native file picker (the app mocks pickers, like the profile photo), so picking simulates
      // an upload. Doc names reuse `docs` above.
      upload: {
        title: 'Mes documents',
        intro: 'Ajoutez vos justificatifs. L’équipe les vérifie dès qu’ils sont reçus.',
        formats: 'Formats acceptés : PDF, JPG ou PNG · 10 Mo maximum.',
        required: 'Requis',
        received: 'Reçu',
        missing: 'À ajouter',
        uploading: 'Envoi…',
        add: 'Ajouter',
        replace: 'Remplacer',
        remove: 'Supprimer',
        removeA11y: 'Supprimer ce document',
        // Mock picker (OptionSheet) — choose a source.
        pickTitle: 'Ajouter un document',
        pickFile: 'Choisir un fichier',
        pickPhoto: 'Prendre une photo',
        pickCloseA11y: 'Fermer le choix du document',
        closeA11y: 'Fermer mes documents',
        // Footer summary — {n} composed in-component.
        remainingOne: 'document encore à ajouter',
        remainingMany: 'documents encore à ajouter',
        allIn: 'Tous vos documents sont reçus.',
        done: 'Terminé',
      },
    },
    // Email verification (AUTH-01/02) — the last step of email/password registration, before the
    // application goes under review. Google sign-ups skip this (Google e-mails are pre-verified).
    // PROTOTYPE: no e-mail backend — the "J’ai confirmé" CTA stands in for clicking the real link.
    verify: {
      eyebrow: 'Dernière étape',
      title: 'Vérifiez votre e-mail',
      // {email} is composed in-component.
      bodyPrefix: 'Nous avons envoyé un lien de confirmation à ',
      bodySuffix: '. Ouvrez-le pour finaliser votre candidature.',
      hint: 'Pas reçu ? Vérifiez vos spams, ou renvoyez le lien.',
      confirm: 'J’ai confirmé mon e-mail',
      resend: 'Renvoyer l’e-mail',
      resent: 'E-mail renvoyé',
      // {n} = remaining seconds, composed in-component.
      resendInPrefix: 'Renvoyer dans ',
      resendInSuffix: ' s',
      changeEmail: 'Modifier mon adresse e-mail',
      closeA11y: 'Retour à l’inscription',
    },
    // Account approved (AUTH-07) — the welcome beat shown when the team validates a pending account,
    // between the pending screen and the app. PROTOTYPE: reached via the pending screen's demo control.
    accepted: {
      eyebrow: 'Bienvenue dans le Mouvement',
      statusChip: 'Compte validé',
      // {name} is composed in-component.
      titlePrefix: 'Bienvenue, ',
      titleSuffix: ' !',
      titleNoName: 'Vous êtes des nôtres !',
      body: 'Votre candidature est acceptée. Votre espace coach est prêt.',
      highlightsTitle: 'Ce qui vous attend',
      highlights: {
        matching: 'Des séances près de chez vous',
        checkin: 'Check-in sur place en un geste',
        revenue: 'Vos revenus, au même endroit',
      },
      cta: 'Accéder à mon espace',
    },
  },
  // Tiers (gamification). ONE progression: a five-rung session-count ladder — Bronze → Argent → Or →
  // Platine → Diamant — climbed purely by completing sessions (no levels, no points, no other badge
  // categories). Thresholds live in lib/gamification; copy here is recognition-only, never pay.
  game: {
    eyebrow: 'Progression',
    tierPrefix: 'Palier',                       // hero kicker / card pill prefix
    totalSuffix: 'séances réalisées',           // "99 séances réalisées"
    collected: '{n}/{total} obtenus',           // completion pill + section chip
    // Progress caption, composed in-component: "{n} séance(s) avant {palier}".
    toNextOne: 'séance avant',                  // singular (1 left)
    toNextN: 'séances avant',                   // plural
    maxedReadout: 'Palier max',                 // meter readout at the top rung
    maxedCaption: 'Palier maximum atteint',     // caption at the top rung
    closeA11y: 'Fermer la progression',         // modal-mode close button (Profil → progression sheet)
    // Next-tier spotlight
    nextTierEyebrow: 'Prochain palier',
    gapOne: 'Bientôt débloqué',                 // 1 session left
    gapN: 'Plus que {n}',                       // n sessions left
    ofTarget: 'sur',                            // locked a11y: "99 sur 100"
    lockedA11y: 'verrouillé',                   // locked-tile state, spoken
    // Collection — the full ladder page + the tab preview
    collectionTitle: 'Paliers',
    seeAll: 'Voir tout',
    collectionCloseA11y: 'Fermer les paliers',
    earnedTitle: 'Obtenus',
    lockedTitle: 'À débloquer',
    reachedLabel: 'Atteint',                    // reached-tile chip
    // How you climb (sessions only — punctuality/reviews no longer feed progression)
    howTitle: 'Comment progresser',
    how: {
      sessions: { title: 'Réalisez des séances', desc: 'Chaque séance terminée vous rapproche du palier suivant.' },
      climb: { title: 'Grimpez les paliers', desc: 'De Bronze à Diamant : cinq paliers à débloquer.' },
    },
    note: 'Vos paliers progressent uniquement avec les séances réalisées. L’équipe DS les voit aussi, mais ils n’affectent jamais votre rémunération.',
    // The five rungs (desc = the session threshold that unlocks each).
    tiers: {
      bronze: { name: 'Bronze', desc: '1 séance réalisée' },
      argent: { name: 'Argent', desc: '25 séances réalisées' },
      or: { name: 'Or', desc: '50 séances réalisées' },
      platine: { name: 'Platine', desc: '100 séances réalisées' },
      diamant: { name: 'Diamant', desc: '200 séances réalisées' },
    },
    // Celebration overlay — the moment a tier is reached (after a completed session report).
    celebrate: {
      eyebrow: 'Palier débloqué',
      today: 'Atteint aujourd’hui',
      subtitle: 'La reconnaissance, jamais la rémunération.',
      cta: 'Génial !',
      announce: 'Palier débloqué :', // screen-reader announcement, prepended to the tier name
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
    profile: 'Profil',
    progress: 'Progression', // not a tab label anymore — reused as the level-card eyebrow on Profil
    earnings: 'Revenus',
  },
} as const;

/**
 * Structural type of the copy tree — the localization contract. The French `copy` above is the
 * source of truth; `copy.en.ts` provides a deep-partial English override (untranslated keys fall
 * back to French), and `i18n.tsx` merges + serves the active locale via `useCopy()`.
 */
export type Copy = typeof copy;
