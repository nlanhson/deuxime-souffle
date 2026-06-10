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
  nextSession: {
    eyebrow: 'Next session',
    status: 'Confirmed',
    place: 'The Lindens Care Home',
    address: '12 Lilac Street, Lyon 3rd · 2.4 km',
    detail: 'Group session · 8 residents',
    checkin: "Check-in open — you're on site",
    start: 'Start',
    directions: 'Directions',
  },
  week: {
    eyebrow: 'This week',
    link: 'Sessions',
    count: '5',
    summary: 'sessions · 7h 30m scheduled',
  },
  available: {
    eyebrow: 'Available sessions',
    link: 'See all',
    near: '3 sessions near you · Lyon & nearby',
    apply: 'Apply',
  },
  earnings: {
    eyebrow: 'This month',
    link: 'Earnings',
    confirmed: 'Confirmed',
    confirmedSub: '12 sessions confirmed',
    projected: 'Projected',
    projectedSub: '+6 sessions upcoming',
  },
  tabs: {
    home: 'Home',
    sessions: 'Sessions',
    available: 'Available',
    earnings: 'Earnings',
  },
} as const;
