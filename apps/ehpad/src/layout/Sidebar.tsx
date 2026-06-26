import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarDays,
  FileText,
  Home,
  Mail,
  Receipt,
  Star,
  Users,
} from 'lucide-react';
import { useStrings } from '@/i18n';
import { useDataVersion } from '@/context/DataContext';
import { getDb } from '@/data/store';
import { Logo } from '@/components/Logo';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  /** Clé du libellé dans `fr.nav` — traduite au rendu, jamais en dur. */
  key: 'home' | 'sessions' | 'evaluations' | 'contracts' | 'contacts' | 'invoices' | 'facility' | 'support';
  icon: LucideIcon;
  end?: boolean | undefined;
}

/** Navigation groupée par pertinence (réduction de la charge mentale) :
   le travail quotidien en haut, et — comme « réglages » et « aide » sont
   rarement consultés — l'établissement et le support sont envoyés en bas.
   Les notifications vivent dans la cloche de la barre du haut. */
const NAV_PRIMARY: NavItem[] = [
  { to: '/', key: 'home', icon: Home, end: true },
  { to: '/sessions', key: 'sessions', icon: CalendarDays },
  { to: '/evaluations', key: 'evaluations', icon: Star },
  { to: '/contrats', key: 'contracts', icon: FileText },
  { to: '/contacts', key: 'contacts', icon: Users },
  { to: '/factures', key: 'invoices', icon: Receipt },
];

const NAV_SECONDARY: NavItem[] = [
  { to: '/etablissement', key: 'facility', icon: Building2 },
  { to: '/contact', key: 'support', icon: Mail },
];

export function useUnreadCount(): number {
  useDataVersion(); // re-rend à chaque mutation du magasin
  return getDb().notifications.filter((n) => !n.read).length;
}

/** Séances terminées sans évaluation — le compteur porté par l'onglet « Évaluations ». */
export function usePendingEvalCount(): number {
  useDataVersion();
  return getDb().sessions.filter((s) => s.status === 'terminee' && !s.evaluation).length;
}

interface NavListProps {
  onNavigate?: (() => void) | undefined;
}

/** Liste de navigation — icône + libellé TOUJOURS visible (jamais icône seule).
   Deux groupes : le principal, puis le secondaire (réglages/aide) ancré en bas. */
export function NavList({ onNavigate }: NavListProps) {
  const fr = useStrings();
  const pendingEvals = usePendingEvalCount();

  const renderItem = (item: NavItem) => {
    const badge = item.key === 'evaluations' && pendingEvals > 0 ? pendingEvals : 0;
    return (
      <li key={item.to}>
        <NavLink
          to={item.to}
          end={item.end ?? false}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          onClick={onNavigate}
        >
          <item.icon className={styles.icon} aria-hidden />
          <span className={styles.label}>{fr.nav[item.key]}</span>
          {badge > 0 && (
            <span className={styles.badge} aria-label={fr.nav.pendingEval(badge)}>
              {badge}
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      <ul className={styles.navList}>{NAV_PRIMARY.map(renderItem)}</ul>
      <ul className={`${styles.navList} ${styles.navSecondary}`}>
        {NAV_SECONDARY.map(renderItem)}
      </ul>
    </>
  );
}

export function Sidebar() {
  const fr = useStrings();
  return (
    <nav className={styles.sidebar} aria-label={fr.nav.mainNav}>
      <div className={styles.brandRow}>
        <Logo size={40} color="var(--color-nav-red)" rounded />
        <p className={styles.brand}>
          <span className={styles.brandName}>{fr.app.space}</span>
        </p>
      </div>
      <NavList />
    </nav>
  );
}
