import {
  LayoutDashboard,
  CalendarCheck,
  CalendarRange,
  FileText,
  Building2,
  Users,
  Receipt,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { NavKey } from '@/i18n/fr';

/**
 * The back-office navigation model — single source of truth shared by the
 * Sidebar and the router. Items map 1:1 to the PRD §4 feature domains for the
 * DS Administrator console. Labels and glosses live in the i18n dictionaries,
 * keyed by `key`, so the navigation switches language with the rest of the UI.
 */
export interface NavItem {
  to: string;
  /** Dictionary key — resolves to `strings.nav[key].label` / `.gloss`. */
  key: NavKey;
  icon: LucideIcon;
  /** Pending-count badge (operational queue). Demo values for the prototype. */
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', key: 'dashboard', icon: LayoutDashboard },
  { to: '/affectations', key: 'assignments', icon: CalendarCheck, badge: 6 },
  { to: '/seances', key: 'sessions', icon: CalendarRange },
  { to: '/contrats', key: 'contracts', icon: FileText, badge: 4 },
  { to: '/etablissements', key: 'establishments', icon: Building2 },
  { to: '/coachs', key: 'coaches', icon: Users, badge: 2 },
  { to: '/facturation', key: 'billing', icon: Receipt },
  { to: '/parametres', key: 'settings', icon: Settings },
];
