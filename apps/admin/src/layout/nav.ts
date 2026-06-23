import {
  LayoutDashboard,
  CalendarCheck,
  CalendarRange,
  FileText,
  Building2,
  Users,
  Receipt,
  Settings,
  ClipboardList,
  Map,
  type LucideIcon,
} from 'lucide-react';
import type { NavKey, NavSectionKey } from '@/i18n/fr';

/**
 * The back-office navigation model — single source of truth shared by the
 * Sidebar and the router. Items map 1:1 to the PRD §4 feature domains for the
 * DS Administrator console; they're grouped into sections so the rail reads as
 * a few labelled clusters rather than one long flat list. Labels, glosses and
 * section headers live in the i18n dictionaries, keyed by `key`, so the
 * navigation switches language with the rest of the UI.
 */
export interface NavItem {
  to: string;
  /** Dictionary key — resolves to `strings.nav[key].label` / `.gloss`. */
  key: NavKey;
  icon: LucideIcon;
  /** Pending-count badge (operational queue). Demo values for the prototype. */
  badge?: number;
}

export interface NavSection {
  /** Dictionary key — resolves to `strings.navSections[key]`. */
  key: NavSectionKey;
  items: NavItem[];
}

/**
 * Grouped navigation. Sections cluster the domains by the operator's mental
 * model — steering, daily operations, the records directory, money. Settings
 * is deliberately left out: it's a utility tab pinned to the foot of the rail.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    key: 'pilotage',
    items: [
      // Dashboard now holds both the live cockpit and the period-filtered
      // analytics as in-screen tabs (WBS epic "Admin Dashboard & KPIs").
      { to: '/', key: 'dashboard', icon: LayoutDashboard },
    ],
  },
  {
    key: 'operations',
    items: [
      { to: '/affectations', key: 'assignments', icon: CalendarCheck, badge: 6 },
      { to: '/seances', key: 'sessions', icon: CalendarRange },
      { to: '/comptes-rendus', key: 'reports', icon: ClipboardList },
      { to: '/couverture', key: 'coverage', icon: Map },
    ],
  },
  {
    key: 'directory',
    items: [
      { to: '/etablissements', key: 'establishments', icon: Building2 },
      { to: '/coachs', key: 'coaches', icon: Users, badge: 2 },
      { to: '/contrats', key: 'contracts', icon: FileText, badge: 4 },
    ],
  },
  {
    key: 'finance',
    items: [{ to: '/facturation', key: 'billing', icon: Receipt }],
  },
];

/** Utility tab — pinned to the foot of the rail, outside the sections. */
export const NAV_SETTINGS: NavItem = { to: '/parametres', key: 'settings', icon: Settings };

/**
 * Flat list of every destination, in display order — consumed by the router
 * and the top bar for path→title resolution. Derived from the sections so the
 * grouping stays the single source of truth.
 */
export const NAV_ITEMS: NavItem[] = [
  ...NAV_SECTIONS.flatMap((section) => section.items),
  NAV_SETTINGS,
];
