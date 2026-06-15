/** English dictionary — must satisfy the `Copy` shape defined in `fr.ts`. */

import type { Copy } from './fr';

export const en: Copy = {
  app: {
    brandName: 'Deuxième Souffle',
    consoleName: 'DS Console',
    language: 'Language',
  },
  topbar: {
    searchPlaceholder: 'Search a coach, a care home, a session…',
    searchLabel: 'Global search',
    notifications: 'Notifications',
    logout: 'Sign out',
  },
  sidebar: {
    mainNav: 'Main navigation',
    pending: (n) => `${n} pending`,
    version: 'v0.1 · prototype',
  },
  shell: {
    skipToContent: 'Skip to content',
  },
  placeholder: {
    comingSoon: 'Screen coming soon',
    scope: (source) => `Scope — ${source}`,
  },
  notFound: {
    title: 'Page not found',
    subtitle: 'This page doesn’t exist or has been moved.',
    back: 'Back to dashboard',
  },
  login: {
    brandTag: 'DS Console — operations back-office',
    title: 'Sign in',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    passwordPlaceholder: 'anything (demo)',
    submit: 'Sign in',
    hintBefore:
      'Prototype on simulated data — any password works. Tip: add ',
    hintAfter: ' to the URL to go straight in.',
  },
  dashboard: {
    greeting: (firstName) => `Hello, ${firstName}`,
    subtitle:
      'Operational overview — assignments, sessions, contracts and billing in real time.',
    runAssignments: 'Run assignments',
    kpiAria: 'Key indicators',
    queueTitle: 'Operational queue',
    queueMeta: 'What needs action',
    activityTitle: 'Recent activity',
    activityMeta: 'Operations log',
    kpis: {
      sessionsWeek: { label: 'Sessions this week', value: '142', hint: '38 today', trend: '+12%' },
      coverage: { label: 'Coverage rate', value: '94%', trend: '+3 pts' },
      pendingAssignments: { label: 'Pending assignments', value: '6', hint: 'to validate', trend: 'steady' },
      contractsToValidate: { label: 'Contracts to validate', value: '4', hint: '2 priority' },
      monthlyBilling: { label: 'Billing this month', value: '€38,200', hint: 'excl. VAT · Pennylane draft' },
      avgTrust: { label: 'Average trust index', value: '4.6', hint: 'out of 5 · 87 active coaches' },
    },
    queue: {
      assignments: { label: 'Assignments to validate', note: 'sessions with no coach assigned' },
      contracts: { label: 'Contracts awaiting validation', note: '2 with major changes' },
      coaches: { label: 'Coach profiles to validate', note: 'sign-ups awaiting approval' },
      sessions: { label: 'Incidents & delays', note: 'coach reported running late' },
    },
    activity: [
      { text: 'Karim B. checked in at Les Tilleuls care home', time: '8 min ago' },
      { text: 'New contract submitted — Résidence Bellevue (2×/week)', time: '24 min ago' },
      { text: 'Delay reported — 2:00 pm session at La Roseraie', time: '41 min ago' },
      { text: 'Auto-assignment proposed for 12 sessions in week 25', time: '1 h ago' },
    ],
  },
  nav: {
    dashboard: {
      label: 'Dashboard',
      gloss: 'Operational health, activity, revenue and coverage at a glance.',
    },
    assignments: {
      label: 'Assignments',
      gloss: 'Matching algorithm, assignment calendar, manual override, urgency mode.',
    },
    sessions: {
      label: 'Sessions',
      gloss: 'Session tracking, geolocated check-in, reports, incidents and delays.',
    },
    contracts: {
      label: 'Contracts',
      gloss: 'Validation queue, full lifecycle, suggested slots, renewals.',
    },
    establishments: {
      label: 'Care homes',
      gloss: 'Care-home profiles, contacts, group hierarchy and pricing management.',
    },
    coaches: {
      label: 'Coaches',
      gloss: 'Coach profiles, trust index, evaluation coefficients, validations.',
    },
    billing: {
      label: 'Billing',
      gloss: 'Monthly generation, invoice table, adjustments, Pennylane sync.',
    },
    settings: {
      label: 'Settings',
      gloss: 'Score coefficients, business rules, notification templates, global settings.',
    },
  },
  screens: {
    assignments: {
      title: 'Assignments',
      subtitle:
        'The heart of the back-office: assign the right coach to every session, fast and auditably.',
      source: 'PRD §4 · Smart Assignment (must-have MVP)',
      capabilities: [
        {
          title: 'Composite-score matching algorithm',
          detail:
            'Rank eligible coaches by score: self-positioning, fairness, reliability and proximity.',
        },
        {
          title: 'Assignment calendar',
          detail: 'View of sessions to fill by area and by week, with coach suggestions.',
        },
        {
          title: 'Validation & manual override',
          detail: 'Approve the suggested coach or force another choice, with a full audit trail.',
        },
        {
          title: 'Urgency mode',
          detail: 'Express replacement in case of a last-minute absence or no-show.',
        },
        {
          title: 'Configurable scoring criteria',
          detail: 'Weight each component of the score from the global settings.',
        },
      ],
    },
    sessions: {
      title: 'Sessions',
      subtitle:
        'Track session execution, from geolocated check-in to the report, and handle incidents.',
      source: 'PRD §4 · Sessions & Reports',
      capabilities: [
        {
          title: 'Session tracking',
          detail: 'Every session and its status: upcoming, in progress, completed, cancelled.',
        },
        {
          title: 'Geolocated check-in',
          detail: 'Arrival validation within the configured time window and geographic radius.',
        },
        {
          title: 'Post-session report (6 steps)',
          detail: 'Review the structured reports submitted by coaches after each session.',
        },
        {
          title: 'Incidents & delays',
          detail: 'Automatic no-show detection, delay alerts, event log.',
        },
        {
          title: 'Inter-session notes',
          detail: 'Handovers between coaches to ensure continuity of care.',
        },
      ],
    },
    contracts: {
      title: 'Contracts',
      subtitle: 'Validate, track and evolve the commercial contracts that generate sessions.',
      source: 'PRD §4 · Contracts · WBS CON-01 → CON-16',
      capabilities: [
        {
          title: 'Validation queue',
          detail: 'Approve or reject “Awaiting validation” contracts, with a rejection reason.',
        },
        {
          title: 'Full lifecycle',
          detail: 'Create, edit, extend, close; automatic session generation from recurrence.',
        },
        {
          title: 'Suggested slots (CON-08)',
          detail: 'Top recurring slots based on coach availability and care-home constraints.',
        },
        {
          title: 'Major changes',
          detail: 'Validate changes to frequency, slots, unit type or contract period.',
        },
        {
          title: 'Renewals',
          detail: 'Configurable reminders (90 / 60 / 30 days) and non-renewal tracking.',
        },
      ],
    },
    establishments: {
      title: 'Care homes',
      subtitle:
        'Manage client care homes, their contacts, group affiliation and pricing.',
      source: 'PRD §4 · Establishments & Groups · WBS EST / AUTH-21',
      capabilities: [
        {
          title: 'Care-home profiles',
          detail: 'Legal name, SIRET, VAT, addresses, units served and category.',
        },
        {
          title: 'Contacts',
          detail: 'Primary and additional contacts, roles, update reminders.',
        },
        {
          title: 'Group hierarchy',
          detail: 'Commercial affiliation of establishments to a group, filtering by group.',
        },
        {
          title: 'Pricing management',
          detail: 'Default session rate and markers applied per establishment.',
        },
      ],
    },
    coaches: {
      title: 'Coaches',
      subtitle:
        'Validate sign-ups, track profiles and steer the coaches’ trust index.',
      source: 'PRD §4 · Coach Management & Evaluation',
      capabilities: [
        {
          title: 'Coach profiles',
          detail: 'Identity, documents (CV, URSSAF, insurance, APA diploma), area and availability.',
        },
        {
          title: 'Sign-up validation',
          detail: 'Approve pending coaches after self sign-up (email / Google).',
        },
        {
          title: 'Trust index',
          detail: 'Dynamic tracking fed by the evaluations submitted by care homes.',
        },
        {
          title: 'Evaluation coefficients',
          detail: 'Configure the criteria and weights for rating coaches.',
        },
        {
          title: 'Coach financial table',
          detail: 'Revenue and session volume per coach over the period.',
        },
      ],
    },
    billing: {
      title: 'Billing',
      subtitle: 'Generate, adjust and sync monthly billing to Pennylane.',
      source: 'PRD §4 · Billing & Pennylane (must-have MVP)',
      capabilities: [
        {
          title: 'Monthly generation',
          detail: 'One draft invoice per establishment on the 1st, from completed sessions.',
        },
        {
          title: 'Invoice table',
          detail: 'Consolidated tracking: statuses, amounts excl. VAT, history per establishment.',
        },
        {
          title: 'Adjustments',
          detail: 'Corrections and reconciliations before validation and sending.',
        },
        {
          title: 'Pennylane sync',
          detail: 'Push invoices to Pennylane — a critical MVP integration.',
        },
      ],
    },
    settings: {
      title: 'Settings',
      subtitle:
        'The global configuration levers that drive matching, business rules and notifications.',
      source: 'PRD §4 · cross-cutting (matching, evaluation, notifications)',
      capabilities: [
        {
          title: 'Score coefficients',
          detail: 'Weight self-positioning, fairness, reliability and proximity in matching.',
        },
        {
          title: 'Business rules',
          detail: 'Check-in window, geographic radius, cancellation policy, delay thresholds.',
        },
        {
          title: 'Notification templates',
          detail: 'Configurable email / SMS / push templates (reminders, alerts, assignments).',
        },
        {
          title: 'Evaluation',
          detail: 'Rating criteria and coefficients feeding the trust index.',
        },
        {
          title: 'Global settings',
          detail: 'Default rates, unit types, public holidays and scheduling exceptions.',
        },
      ],
    },
  },
};
