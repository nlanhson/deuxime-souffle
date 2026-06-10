/**
 * UI copy for the Coach app — the single localization seam.
 *
 * English for now (for review / easier understanding). The production app ships in
 * FRENCH: to localize, translate the values in this file (or add a `copy.fr.ts` and
 * select by locale). Components must never hardcode user-facing text — pull it from here.
 *
 * Note: the dates, times, weekday labels, distances (km) and currency (€) that appear in
 * the screen's mock data are placeholders. Real code will format those from data + locale,
 * not from this file.
 */
export const copy = {
  header: {
    date: 'Tue · June 9',
    greeting: 'Hi, Karim',
    notificationsA11y: 'Notifications, 2 unread',
    profileA11y: "Karim's profile",
  },
  reportBanner: {
    title: 'Report to complete',
    subtitle: "Yesterday's session · Bellevue Residence",
    action: 'Complete',
  },
  // Availability nudge (C15). Matching depends on the coach keeping availability + area current
  // (WBS: "the importance of coaches keeping their availability and area up to date"). The
  // "3 weeks ago" is mock — real code shows the actual staleness / hides this when fresh.
  availabilityBanner: {
    title: 'Confirm your availability',
    subtitle: 'Last updated 3 weeks ago — stay matchable',
    action: 'Update',
    a11y: 'Confirm your availability — last updated 3 weeks ago',
  },
  // Report-due popup (C25). Steps are the WBS's verbatim 6-step post-session report.
  reportModal: {
    eyebrow: "Yesterday's session · Bellevue Residence",
    title: 'Complete your report',
    body: 'The 6-step post-session report validates the session and triggers billing. It takes about two minutes.',
    steps: [
      'Number of participants',
      'Activities covered',
      'Anything to flag to the facility',
      'Notes for the next session',
      'Facility readiness',
      'Your desired session volume',
    ],
    primary: 'Start report',
    secondary: 'Later',
    closeA11y: 'Close report prompt',
  },
  // Post-session report (C25/C26) — the full-page form, opened straight from the home banner
  // and the Sessions "Write report" CTA (no "Start report" gate). Mirrors the WBS 6-step report
  // (SESS-01, Detail column): one numeric stepper, one single-choice, three Yes/No (two reveal a
  // text field), and a 5-point atmosphere rating. Submitting validates the session and triggers
  // billing. Field VALUES (counts, options) are mock placeholders formatted in the component.
  report: {
    eyebrow: 'Post-session report',
    // The reported session — mock, mirrors the home banner ("Yesterday's session · Bellevue").
    session: "Yesterday's session",
    place: 'Bellevue Residence',
    intro: 'Two minutes. This validates the session and triggers your billing.',
    closeA11y: 'Close report',
    required: 'Required',
    yes: 'Yes',
    no: 'No',
    // 1 · participants (numeric stepper, WBS default-ish; pre-filled from the session size).
    participants: {
      label: 'Number of participants',
      help: 'How many residents took part.',
      minusA11y: 'One fewer participant',
      plusA11y: 'One more participant',
      unit: 'residents',
    },
    // 2 · activities (multiple choice from admin-configured options — mock list here).
    activities: {
      label: 'Activities covered',
      help: 'Select all that apply.',
      options: ['Mobility & balance', 'Strength', 'Flexibility', 'Coordination', 'Cardio', 'Cognitive games'],
    },
    // 3 · flag to facility (Yes/No → reveals an optional message).
    flag: {
      label: 'Anything to flag to the facility?',
      help: 'The coordinator will see this directly.',
      placeholder: 'What should the facility know?',
    },
    // 4 · notes for next session (Yes/No → reveals a REQUIRED note).
    nextNotes: {
      label: 'Notes for the next session?',
      help: 'Carried over to whoever runs it next.',
      placeholder: 'e.g. Mr Lambert needs a chair with armrests.',
    },
    // 5 · facility readiness (plain Yes/No).
    readiness: {
      label: 'Was the facility ready for you?',
      help: 'Room set up, residents gathered, equipment available.',
    },
    // 6 · atmosphere (5-point rating + emoji).
    atmosphere: {
      label: 'Session atmosphere',
      help: 'Overall energy and engagement.',
      // index 0–4 → 1–5 stars; emoji + word shown for the current choice.
      levels: [
        { emoji: '😴', word: 'Flat' },
        { emoji: '😐', word: 'Quiet' },
        { emoji: '🙂', word: 'Good' },
        { emoji: '😄', word: 'Lively' },
        { emoji: '🔥', word: 'On fire' },
      ],
      starA11y: 'Rate atmosphere', // composed in-component: "Rate atmosphere 3 of 5"
    },
    submit: 'Submit report',
    incomplete: 'Answer the highlighted questions to submit.',
    // Confirmation state (replaces the form after submit).
    done: {
      title: 'Report sent',
      body: 'Thanks, Karim. This session is validated and your billing is on its way.',
      cta: 'Done',
    },
  },
  // Availability popup (C15). Note line = current setup (day/time · max travel · transport),
  // the three things the WBS availability config holds; "3 weeks ago" is mock staleness.
  availabilityModal: {
    eyebrow: 'Last updated 3 weeks ago',
    title: 'Still available as usual?',
    body: 'Matching uses your weekly availability and travel area to offer you sessions. Confirm it’s current, or edit it.',
    note: 'Mon–Fri mornings · up to 30 min · by car',
    primary: "Yes, it's current",
    secondary: 'Edit availability',
    closeA11y: 'Close availability prompt',
  },
  nextSession: {
    eyebrow: 'Next session',
    status: 'Confirmed',
    place: 'The Lindens Care Home',
    address: '12 Lilac Street, Lyon 3rd · 2.4 km',
    // Client session-detail fields (WBS Coach Planning & Check-in): EHPAD name, time,
    // address, contact person. `contact` = the on-site person to ask for on arrival.
    contact: 'Ask for Marie Laurent · Coordinator',
    checkin: "Check-in open — you're on site",
    // Primary action = geolocated check-in (C16) — the PRD's #1 field action, not a generic "Start".
    checkInCta: 'Check in',
    directions: 'Directions',
    // Tapping the hero opens the full session detail (same modal language as the available rows).
    detailEyebrow: 'Confirmed · Today',
    start: '14:30',
    end: '15:30',
    duration: '1h',
    closeA11y: 'Close session detail',
  },
  week: {
    eyebrow: 'This week',
    monthEyebrow: 'This month',
    // Week-view paging labels (swipe to previous/next week). |offset|>1 → "Week of {Mon Abbr} {d}".
    lastWeek: 'Last week',
    nextWeek: 'Next week',
    weekOf: 'Week of',
    prevWeekA11y: 'Previous week',
    nextWeekA11y: 'Next week',
    // Month-view paging labels — the home calendar pages months too (unlike the June-only
    // Available screen, where the month chevrons are present but disabled).
    prevMonthA11y: 'Previous month',
    nextMonthA11y: 'Next month',
    link: 'Sessions',
    // Week/Month toggle on the home calendar card (C09/C10).
    seg: { week: 'Week', month: 'Month' },
    toggleA11y: 'Calendar view',
    // Mon-first weekday initials for the month grid (locale-formatted in real code).
    weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    // Reads "{done} done · {total} scheduled · {hours}" — counts are injected from data in the
    // screen; only words/units live here. `doneLabel` is the NEW done-so-far progress metric.
    doneLabel: 'done',
    scheduledLabel: 'scheduled',
    hours: '7h 30m',
    monthHours: '31h',
    progressA11y: 'sessions done this week',
    monthProgressA11y: 'sessions done this month',
    // Two metric tiles above the calendar: scheduled (the plan) + done (progress so far).
    tiles: {
      scheduled: 'Scheduled',
      done: 'Done',
      unit: 'sessions',
      complete: 'complete',
    },
    // Under-calendar detail: tapping a date reveals its sessions. Past ("due", already happened)
    // sessions read muted; upcoming ones read normal — the chip carries the status in words so
    // it never relies on the graying alone.
    daySection: {
      empty: 'No session this day',
      due: 'Due',
      upcoming: 'Upcoming',
      a11ySessions: 'sessions',
      a11yNone: 'no session',
    },
  },
  available: {
    eyebrow: 'Available sessions today',
    link: 'See all',
    near: 'Open near you today · Lyon & nearby',
    apply: 'Apply',
    // "See all" sheet (today's open sessions)
    allTitle: 'Available sessions today',
    closeA11y: 'Close available sessions',
  },
  // Available sessions screen (Disponibles tab) — open, not-yet-assigned sessions the coach
  // can apply to. C-stories: "raise or withdraw my interest for an available session" from
  // the list view AND the week view (both named verbatim in the WBS).
  // Deliberate omission: matching is never first-come-first-served (the algorithm ranks and
  // DS assigns ONE coach), so this screen shows no candidate/competitor count — applying is
  // joining a shortlist, not winning a race. `appliedNote` makes that expectation explicit.
  availableScreen: {
    eyebrow: 'Open sessions',
    title: 'Available',
    seg: { list: 'List', week: 'Week' },
    filterA11y: 'Filter open sessions',
    // The leading count is formatted in code from the data, e.g. "5 open · Lyon & nearby".
    nearSuffix: 'open · Lyon & nearby',
    status: { applied: 'Applied' },
    action: {
      apply: 'Raise hand',
      withdraw: 'Withdraw',
    },
    // Transient confirmation toasts after raising a hand / withdrawing (WBS PLA-07, verbatim).
    toast: {
      applied: 'Your application has been sent',
      withdrawn: 'Your candidacy has been cancelled',
    },
    // Session type (WBS PLA-15 card field / PLA-06 "session context"). 'first' = a TEST / first
    // session with this EHPAD ("first visit"); 'regular' = an ongoing session. Localizable labels.
    type: { first: 'First visit', regular: 'Regular session' },
    typeA11y: 'Session type',
    // Estimated travel time + over-limit warning (WBS PLA-06 / PLA-08). The estimate is derived
    // in-component from the session distance + the coach's transport preference (mock), so the
    // minute figures are composed in code, not stored here. {mins}/{mode}/{max} are filled in code.
    travel: {
      min: 'min',
      by: 'by',                 // "~12 min by car"
      car: 'car',
      onFoot: 'on foot',        // "~24 min on foot"
      detailLabel: 'Travel',
      overLimit: 'Over your travel limit',
      overLimitBody: 'About {mins} min {mode} — past your {max}-min limit. You can still raise your hand.',
      overLimitTail: 'over your limit',
    },
    appliedNote: "You're on the shortlist — DS assigns one coach.",
    empty: 'No open sessions here right now.',
    emptyHint: 'New ones appear as EHPADs open them up near you.',
    // Filter sheet (List view). Distance maps to the coach's max-travel-time preference (WBS
    // PLA-08); status is the coach's own application state. The "≤ N km" labels and the result
    // count are composed in-component from data.
    filter: {
      title: 'Filters',
      closeA11y: 'Close filters',
      distance: 'Distance',
      status: 'Availability',
      distAny: 'Any',
      statusAll: 'All',
      statusOpen: 'Open',
      statusApplied: 'Applied',
      reset: 'Reset',
      showPrefix: 'Show',
      showSuffix: 'sessions',
      showOne: 'Show 1 session',
      showNone: 'No matches',
    },
    emptyFiltered: 'No sessions match your filters.',
    clearFilters: 'Clear filters',
    // Calendar-led view (copied from the Home calendar, wired to OPEN sessions). The two metric
    // tiles are adapted to this screen: Open = open sessions in the period, Applied = how many
    // the coach has raised a hand for. Counts/dates are composed in-component from the data.
    cal: {
      // `seg.month` shows the current month name (composed in-component, e.g. "June").
      seg: { week: 'Week', month: 'Month', all: 'All' },
      toggleA11y: 'Calendar view',
      thisWeek: 'This week',
      thisMonth: 'This month',
      allTitle: 'All open sessions',
      lastWeek: 'Last week',
      nextWeek: 'Next week',
      weekOf: 'Week of',
      prevWeekA11y: 'Previous week',
      nextWeekA11y: 'Next week',
      tiles: { open: 'Open', applied: 'Applied', unit: 'sessions' },
      dayEmpty: 'No open sessions this day.',
      // Whole shown week / month has no open sessions (PLA-04 / PLA-05) — reachable now the
      // calendar pages freely past the seeded period.
      periodEmpty: 'No sessions scheduled',
      a11ySessions: 'open',
      a11yNone: 'no open sessions',
      // Month view: prev/next month a11y + a legend for the day dots (WBS PLA-05). The calendar
      // pages months freely (a live schedule), so the chevrons are active.
      prevMonthA11y: 'Previous month',
      nextMonthA11y: 'Next month',
    },
    // List view (the "All" tab) — open sessions bucketed the way the matching algorithm weighs
    // them for THIS coach (WBS PLA-15). Recommended = close to the coach (a strong match); Urgent
    // = starts very soon; Available = everything else. Each session has exactly one bucket, so the
    // counts partition the list. Counts + the urgency countdown are composed in-component.
    list: {
      filterA11y: 'Filter open sessions by category',
      cats: { all: 'All', recommended: 'Recommended', urgent: 'Urgent', available: 'Available' },
      // Urgency countdown on urgent cards. "In N days" is composed as `${inDays} ${n} ${days}`.
      urgency: { today: 'Today', tomorrow: 'Tomorrow', inDays: 'In', days: 'days' },
      empty: 'No sessions in this category.',
      // Total-count caption under the chips (PLA-15: total for the selected period — the List view
      // is one month). No filter → `${n} ${period}`; with a refine filter → `${vis} ${of} ${total} ${shown}`.
      count: { period: 'open this month', of: 'of', shown: 'shown' },
    },
    // Detail page — opens when an available-session card is tapped (mirrors the Séances detail).
    detail: {
      title: 'Session details',
      closeA11y: 'Close session details',
      when: 'When',
      where: 'Where',
      copyA11y: 'Copy address',
      copied: 'Address copied',   // transient confirmation toast (PLA-06)
      // Session-info rows (PLA-06): the care unit, how to get in, and who to ask for on arrival.
      unit: 'Unit',
      access: 'Access',
      contact: 'Contact',
      contextA11y: 'Session context', // a11y prefix for the context tag (e.g. "First visit")
    },
  },
  earnings: {
    // Home preview (Earnings block on Accueil) — taps through to the Earnings dashboard.
    eyebrow: 'This month Earnings',
    link: 'Earnings',
    earned: 'Earned',
    confirmedSub: '12 sessions confirmed',
    projected: 'Projected',
    projectedSub: '+6 upcoming',
    goal: 'Goal', // monthly target (set at onboarding) — shown on the Earned card
    // Earnings screen (Revenus tab · C35 "View financial dashboard"). All copy here; the
    // euros, hours, dates, ratings and counts are placeholders formatted in the component.
    // Note: this is an *activity report*, not an invoice (WBS) — coaches invoice DS by email.
    screen: {
      eyebrow: 'My dashboard',
      title: 'Earnings',
      closeA11y: 'Close earnings',
      prevMonthA11y: 'Previous month',
      nextMonthA11y: 'Next month',
      earnedLabel: 'Earned so far',
      trendSuffix: 'vs', // composed in-component, e.g. "+12% vs May"
      projectedLabel: 'projected to come',
      expectedLabel: 'expected this month',
      exportPdf: 'Export PDF',
      exportA11y: 'Export this month as a PDF summary',
      stat: {
        sessions: 'Sessions',
        sessionsUnit: 'completed',
        hours: 'Hours',
        scheduledPrefix: 'of', // composed in-component, e.g. "of 60h scheduled"
        scheduledSuffix: 'scheduled',
        rate: 'Rate',
        rateUnit: 'per hour',
      },
      sessionsTitle: "This month's sessions",
      sessionsNote: 'Revenue updates after each completed session',
      notRated: 'Not rated',
      historyTitle: 'Payment history',
      historyNote: 'Activity report — not an invoice',
      sessionsCountUnit: 'sessions',
      status: {
        paid: 'Paid',
        awaiting: 'Awaiting payment',
        inProgress: 'In progress',
      },
      downloadA11y: 'Download statement',
    },
  },
  // Sessions screen (Séances tab) — the coach's assigned sessions. Check-in (C16) and the
  // 6-step report (C25) are the contextual actions that live here.
  sessions: {
    eyebrow: 'Your schedule',
    title: 'Sessions',
    seg: { upcoming: 'Confirmed', past: 'Past', applications: 'Applications' },
    status: {
      checkinOpen: 'Check-in open',
      confirmed: 'Confirmed',
      checkedIn: 'Checked in',
      reportDue: 'Report due',
      reportSent: 'Report sent',
    },
    action: {
      checkin: 'Check in',
      directions: 'Directions',
      writeReport: 'Write report',
      viewReport: 'View report',
    },
    emptyPast: 'No past sessions yet.',
    emptyUpcoming: 'No upcoming sessions.',
    expandA11y: 'Show session details',
    collapseA11y: 'Hide session details',
    // Session detail page (C22 "View session details") — opens when a session card is tapped.
    detail: {
      title: 'Session details',
      closeA11y: 'Close session details',
      when: 'When',
      where: 'Where',
      format: 'Format',
      contact: 'On-site contact',
    },
    // Check-in flow (C16) — geolocated presence confirm, opened by the "Check in" CTA. The modal
    // runs a small state machine: intro → locating → outcome. Outcomes encode the C17 time+location
    // validation and the C18 late case. Geolocation isn't wired yet, so a prototype switcher picks
    // the outcome to preview.
    checkInModal: {
      eyebrow: 'On site',
      title: 'Confirm check-in',
      body: "We'll use your location to confirm you're at the care home, then notify the team you've arrived.",
      note: 'Location is checked only at check-in — never tracked in the background.',
      confirm: 'Check in now',
      cancel: 'Not yet',
      closeA11y: 'Close check-in',
      locating: "Checking you're on site…",
      result: {
        success:  { title: 'Checked in', body: "You're on site. The care home has been notified you've arrived — have a great session." },
        late:     { title: 'Checked in — running late', body: "You're checked in, but after the on-time window. The care home has been notified you're running late." },
        tooFar:   { title: "You're not there yet", body: 'You\'re still too far from the care home. Head over and check in once you arrive.' },
        tooEarly: { title: 'Check-in not open yet', body: 'Check-in opens shortly before the session starts. Come back a little closer to the time.' },
        denied:   { title: 'Location needed', body: "We need your location to confirm you're on site. Turn on location access to check in." },
      },
      done: 'Done',
      directions: 'Directions',
      openSettings: 'Open settings',
      // Prototype-only control (no geolocation backend yet) to preview each outcome.
      demoLabel: 'Preview outcome',
      demo: { success: 'On site', late: 'Late', tooFar: 'Too far', tooEarly: 'Too early', denied: 'No GPS' },
    },
    // Per-session management actions — shown as a "Manage" group inside the session detail
    // sheet, because each acts on the session you're looking at: cancel participation (C24),
    // declare absence (C20), transmission notes (C28). Destinations aren't built yet.
    manage: {
      title: 'Manage this session',
      cancelParticipation: 'Cancel participation',
      declareAbsence: 'Declare absence',
      transmissionNotes: 'Transmission notes',
    },
    // Cancel participation (C24) — confirm before dropping an assigned session. The warning nods to
    // the reputation rules: a late cancellation (< 48h) and a no-show both carry score penalties.
    cancelConfirm: {
      title: 'Cancel this session?',
      body: "You'll be removed from this session and the care home will be notified. Cancelling close to the start time can affect your reputation score.",
      confirm: 'Cancel participation',
      cancel: 'Keep session',
      closeA11y: 'Close',
    },
    // Declare absence (C20) — "I can't attend this one." Unlike a plain cancel, it captures a reason
    // (the assignment algorithm treats a declared absence as an availability exclusion, and the
    // reputation system weighs absences/no-shows). Picking a reason is required before confirming.
    absenceModal: {
      title: 'Declare absence',
      body: "Let the care home know you can't attend. They'll be notified right away and the session reassigned.",
      note: 'Frequent or last-minute absences can affect your reputation score.',
      reasonLabel: 'Reason',
      reasons: { illness: 'Illness', emergency: 'Personal emergency', transport: 'Transport problem', other: 'Other' },
      confirm: 'Declare absence',
      cancel: 'Keep session',
      closeA11y: 'Close absence',
    },
    // Transmission notes (C28) — continuity log shared between coaches for a care home. The coach
    // reads prior notes and adds their own for whoever runs the next session there.
    notesModal: {
      title: 'Transmission notes',
      body: 'Notes are shared with whoever runs the next session here.',
      empty: 'No notes yet — add the first one.',
      placeholder: 'e.g. Mr Lambert prefers seated exercises (knee). The group responds well to music.',
      save: 'Save note',
      you: 'You',
      justNow: 'Just now',
      closeA11y: 'Close transmission notes',
    },
    // View report (C27) — read-only view of a submitted report + its review status. Field labels
    // and the atmosphere/activity values are reused from copy.report (the 6-step form).
    reportView: {
      title: 'Session report',
      closeA11y: 'Close report',
      submittedLabel: 'Submitted',
      reviewStatus: { pending: 'Awaiting validation', validated: 'Validated', changes: 'Needs changes' },
      reviewNote: {
        pending: "Submitted — awaiting validation by the team. Billing starts once it's validated.",
        validated: 'Validated. This session is confirmed and your billing is on its way.',
        changes: 'The team asked for a change before this report can be validated.',
      },
      flagNone: 'Nothing flagged',
      nextNone: 'No notes left',
      readyYes: 'Yes',
      readyNo: 'No',
    },
    // Application status (C13) — a cross-session list (your applied-for sessions and where each
    // stands), so it's the third segment rather than a per-session action.
    appStatus: { pending: 'Pending', accepted: 'Accepted', rejected: 'Declined' },
    emptyApplications: 'No applications in progress.',
    // Application detail (C13) — opens when an application row is tapped.
    appDetail: {
      title: 'Application',
      closeA11y: 'Close application',
      statusLabel: 'Status',
      when: 'Session',
      where: 'Where',
      format: 'Format',
      contact: 'On-site contact',
      applied: 'Applied on',
      // A plain-language line explaining what the status means / what happens next.
      note: {
        pending: "Awaiting the care home's decision — you'll be notified as soon as it's reviewed.",
        accepted: "You're assigned. This session has been added to your schedule.",
        rejected: 'This session was assigned to another coach.',
      },
      // Withdraw application (C14) — only offered while the application is still Pending; once
      // accepted/declined there's nothing to withdraw (an assigned session is cancelled, not withdrawn).
      manageTitle: 'Manage application',
      withdraw: 'Withdraw application',
      withdrawConfirm: {
        title: 'Withdraw this application?',
        body: "You'll be removed from the candidates for this session. You can apply again while it stays open.",
        confirm: 'Withdraw',
        cancel: 'Keep application',
      },
    },
  },
  // Generic placeholder screen — a built-but-unwired empty state for sub-flows that don't
  // have a screen yet (e.g. the Sessions overflow-menu destinations). Title is passed per use.
  blank: {
    title: 'Coming soon',
    body: 'This screen is on the way.',
    closeA11y: 'Close',
  },
  // Notification center (C32) — the near-full-screen modal behind the header bell.
  // Item titles/bodies/times are mock placeholders and live in the component, like other mock data.
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all read',
    sectionNew: 'New',
    sectionEarlier: 'Earlier',
    empty: "You're all caught up.",
    closeA11y: 'Close notifications',
    actionDone: 'Done',
    doneChipA11y: 'Done',
  },
  // Profile (C06) — the coach's personal space, opened from the header avatar (locked IA:
  // Profil lives top-right, not in the bottom nav). It is the HUB that gathers the coach's
  // account, documents, and — per the IA follow-up — availability preferences (C15 / PLA-08),
  // which the matching algorithm (E05) depends on. Gamification stays OUT (PRD defers it).
  // Field lists trace to the WBS (E01 Auth & Account, PLA-08 Availability); the screen LAYOUT
  // is a reasoned synthesis pending the client coach video + approved Figma. Mock values
  // (name, email, address, rate, "updated N days ago") live in the component as placeholders.
  profile: {
    eyebrow: 'Your account',
    title: 'Profile',
    closeA11y: 'Close profile',
    editPhotoA11y: 'Change profile photo',
    role: 'APA Coach · Lyon',
    // Account status (WBS E01: Active · Pending approval · Rejected · Deleted).
    status: { active: 'Active', pending: 'Pending approval', rejected: 'Application rejected' },
    // Availability & travel preferences (PLA-08 / S18) — the section matching leans on.
    availability: {
      eyebrow: 'Availability',
      // "Updated N days ago" is composed in-component from the data.
      updatedPrefix: 'Updated',
      justNow: 'just now',
      dayAgo: 'day ago',
      daysAgo: 'days ago',
      staleNudge: 'Keep it fresh so you stay matched to sessions nearby.',
      schedule: 'Weekly schedule',
      travel: 'Max travel time',
      transport: 'Transport',
      departure: 'Departure address',
      areas: 'Preferred areas',
      unavailability: 'Unavailable periods',
      cta: 'Update availability',
    },
    // Fairness target (target monthly volume + flexibility) and default rate.
    goals: {
      eyebrow: 'Goals & rate',
      target: 'Monthly target',
      rate: 'Default hourly rate',
    },
    // Onboarding / account-validation documents (WBS E01). An Active coach has all verified.
    documents: {
      eyebrow: 'My documents',
      note: 'Required to keep your account active',
      cv: 'CV',
      urssaf: 'URSSAF certificate',
      insurance: 'Professional insurance',
      diploma: 'APA diploma',
      status: { verified: 'Verified', pending: 'Pending' },
    },
    account: {
      eyebrow: 'Account',
      personal: 'Personal information',
      calendar: 'Google Calendar',
      connected: 'Connected',
      password: 'Change password',
    },
    support: {
      eyebrow: 'Support',
      help: 'Help centre',
      contact: 'Contact us',
      version: 'Version',
    },
    logout: 'Log out',
    logoutA11y: 'Log out of your account',
    // ---- Interactive sheets (every row is functional) ----
    // Quick selects/confirms use the shared BottomSheet; multi-field edits use a keyboard-safe
    // form sheet. Photo pick + document upload are mocked (no native picker wired in the prototype).
    common: { cancel: 'Cancel', save: 'Save', close: 'Close', done: 'Done' },
    avatarSheet: {
      title: 'Profile photo',
      help: 'Add a photo so the care home recognises you on arrival.',
      choose: 'Choose a photo',
      remove: 'Remove photo',
      closeA11y: 'Close photo options',
    },
    edit: {
      transport: { title: 'Mode of transport', car: 'Car', walking: 'Walking', other: 'Other' },
      vehicle: { title: 'Your vehicle', label: 'Vehicle', placeholder: 'e.g. Scooter, Bike, Public transport' },
      travel: { title: 'Max travel time', help: 'How far you’ll travel — measured from your departure address.' },
      schedule: { title: 'Weekly schedule', help: 'Pick the days you can work.', weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], notSet: 'No days set' },
      departure: { title: 'Departure address', label: 'Address', help: 'Your travel time to each session is measured from here.' },
      areas: { title: 'Preferred areas', label: 'Areas', help: 'Sessions outside these still appear — they’re never hidden.' },
      unavailability: { title: 'Unavailable periods', label: 'Period', help: 'Holidays or time off. Use “None upcoming” when you’re fully available.' },
      target: { title: 'Monthly target', label: 'Sessions per month', help: 'Used to share sessions fairly between coaches.', flexibilityLabel: 'Flexibility', strict: 'Strict', flexible: 'Flexible' },
      rate: { title: 'Default hourly rate', label: 'Rate (€ / hour)' },
      personal: { title: 'Personal information', name: 'Full name', email: 'Email', phone: 'Phone' },
    },
    travelOptions: ['≤ 15 min', '≤ 30 min', '≤ 45 min', '≤ 60 min'],
    password: {
      title: 'Change password',
      current: 'Current password',
      next: 'New password',
      confirm: 'Confirm new password',
      help: 'At least 8 characters.',
      mismatch: 'New passwords don’t match.',
      tooShort: 'Use at least 8 characters.',
      missing: 'Fill in every field.',
    },
    confirmAvail: {
      title: 'Still available as usual?',
      body: 'Matching uses your weekly availability and travel area to offer you sessions. Confirm it’s current, or review your settings.',
      primary: 'Yes, it’s current',
      secondary: 'Review settings',
    },
    calendar: {
      connectTitle: 'Connect Google Calendar',
      connectBody: 'Sync your confirmed sessions to your Google Calendar automatically.',
      connect: 'Connect',
      disconnectTitle: 'Disconnect Google Calendar?',
      disconnectBody: 'Your confirmed sessions will stop syncing to Google Calendar.',
      disconnect: 'Disconnect',
      disconnected: 'Not connected',
    },
    documentSheet: {
      body: 'This document is on file and keeps your account active.',
      replace: 'Replace document',
      pendingNote: 'New file uploaded — pending review by the DS team.',
    },
    logoutConfirm: { title: 'Log out?', body: 'You’ll need to sign in again to see your sessions.' },
    about: { title: 'Deuxième Souffle · Coach', body: 'APA coaching coordination for care homes.\nVersion 0.1.0 — prototype.' },
    links: {
      helpUrl: 'https://deuxiemesouffle.fr/aide',
      contactEmail: 'support@deuxiemesouffle.fr',
      contactSubject: 'Coach app — support request',
    },
  },
  // Onboarding & auth (E01 — Auth & Account). The coach is a VETTED professional: accounts go
  // Pending → Active only after the DS team verifies documents, so log-in is the entry point —
  // account creation is NOT self-serve in-app. Flow: Splash → Welcome → Login. The FIELD LIST
  // traces to E01 (email + password; a 30-day session + manual logout handled by the auth layer);
  // the LAYOUT is a reasoned synthesis pending the coach video + approved Figma. Facebook social
  // login is a PRD open question (pending client validation) — intentionally left out of this
  // draft. English for review; French to ship (translate the values here).
  auth: {
    // Splash — the in-app branded launch beat (distinct from the native cold-start splash).
    splash: {
      wordmark: 'Deuxième Souffle',
      tagline: 'Le Club',
      a11y: 'Deuxième Souffle',
      skipA11y: 'Skip',
    },
    // Welcome — value proposition for the APA coach + the entry to log in.
    welcome: {
      eyebrow: 'APA Coach',
      // Headline traces to the coach's real job (matching · on-site check-in · earnings).
      title: 'Your sessions,\nyour rhythm.',
      body: 'Get matched to sessions in care homes near you, check in on site, and keep an eye on your earnings — all in one place.',
      login: 'Log in',
      // Opens the self-registration flow (E01: "Coach self-registration … with admin validation").
      apply: 'New coach? Apply to join',
      applyA11y: 'Apply to join as a coach',
    },
    // Login — email + password sign-in (+ a cross-link to registration).
    login: {
      eyebrow: 'Welcome back',
      title: 'Log in',
      subtitle: 'Sign in to your coach account.',
      email: { label: 'Email', placeholder: 'you@email.com' },
      password: {
        label: 'Password',
        placeholder: 'Your password',
        showA11y: 'Show password',
        hideA11y: 'Hide password',
      },
      forgot: 'Forgot password?',
      forgotA11y: 'Reset your password',
      // Standard privacy-preserving confirmation (doesn't reveal whether the email is registered).
      // Prototype: no email backend yet — real code triggers the reset email here.
      forgotSent: 'If that email is registered, we’ll send a reset link.',
      submit: 'Log in',
      // Shown when the form is incomplete/invalid. (Prototype has no backend; real code surfaces
      // the server’s auth error in this same slot.)
      error: 'Enter a valid email and your password to continue.',
      backA11y: 'Back',
      noAccount: 'New coach?',
      createAccount: 'Create an account',
    },
    // Sign-up / registration (E01 — "Coach self-registration (email / Google) with admin validation").
    // Fields trace to the AUTH stories: identity + email + phone + SIRET + password, an optional
    // invitation code (the WBS enforces code↔email pairing for invited coaches), and a consent gate.
    // Submitting creates a PENDING_APPROVAL account (see `pending`). Google OAuth, SIRET/email
    // uniqueness, and the profile-completion step are stubbed here. LAYOUT is a synthesis pending the
    // coach video + Figma.
    signup: {
      eyebrow: 'Join the club',
      title: 'Apply to coach',
      subtitle: 'Create your coach account — the team reviews it before you go live.',
      google: 'Continue with Google',
      orDivider: 'or',
      firstName: { label: 'First name', placeholder: 'Karim' },
      lastName: { label: 'Last name', placeholder: 'Benali' },
      email: { label: 'Email', placeholder: 'you@email.com' },
      phone: { label: 'Phone', placeholder: '06 12 34 56 78' },
      // SIRET = the independent coach's 14-digit business identifier (uniqueness enforced server-side).
      siret: { label: 'SIRET', placeholder: '14-digit business number', help: 'Your auto-entrepreneur or company number.' },
      password: {
        label: 'Password',
        placeholder: 'At least 8 characters',
        showA11y: 'Show password',
        hideA11y: 'Hide password',
      },
      // Optional — only coaches invited by the team receive a code (code ↔ email pairing).
      invite: { label: 'Invitation code', optional: 'optional', placeholder: 'If the team gave you one' },
      consent: 'I agree to the Terms of Service and Privacy Policy.',
      consentA11y: 'Agree to the Terms of Service and Privacy Policy',
      submit: 'Submit application',
      haveAccount: 'Already have an account?',
      login: 'Log in',
      backA11y: 'Back',
      error: 'Fill in the highlighted fields to submit your application.',
    },
    // Pending-approval screen (E01 — "Account pending validation" screen). After registration the
    // account is PENDING_APPROVAL and the rest of the app is locked until an admin validates the KYC
    // documents (CV · URSSAF · insurance · APA diploma). "Complete my application" opens document
    // upload (stubbed here). A rejected application would get its own screen + resubmit (deferred).
    pending: {
      eyebrow: 'Account status',
      statusChip: 'Pending approval',
      title: 'Application under review',
      // {name} is composed in-component from the registered first name.
      bodyPrefix: 'Thanks for applying, ',
      bodySuffix: '. Our team is verifying your details — we’ll email you as soon as your account is approved, usually within a couple of working days.',
      bodyNoName: 'Thanks for applying. Our team is verifying your details — we’ll email you as soon as your account is approved, usually within a couple of working days.',
      docsEyebrow: 'Required documents',
      docsNote: 'Add these to speed up your approval.',
      docs: { cv: 'CV', urssaf: 'URSSAF certificate', insurance: 'Professional insurance', diploma: 'APA diploma' },
      docStatusMissing: 'To add',
      complete: 'Complete my application',
      completeBody: 'Document upload is the next slice — your application is saved and the team can already see it.',
      backA11y: 'Back',
    },
  },
  tabs: {
    home: 'Home',
    sessions: 'Sessions',
    available: 'Available',
    earnings: 'Earnings',
  },
} as const;
