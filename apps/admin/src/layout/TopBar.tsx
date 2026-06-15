import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut } from 'lucide-react';
import { NAV_ITEMS } from './nav';
import { useAuth } from '@/context/AuthContext';
import { useStrings } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import styles from './TopBar.module.css';

function useCurrentTitle(): string {
  const fr = useStrings();
  const { pathname } = useLocation();
  const match = NAV_ITEMS.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  );
  return match ? fr.nav[match.key].label : fr.app.consoleName;
}

export function TopBar() {
  const fr = useStrings();
  const title = useCurrentTitle();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className={styles.bar}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        {/* STUB: global search — present for layout, not yet wired. */}
        <div className={styles.search}>
          <Search size={16} aria-hidden className={styles.searchIcon} />
          <input
            type="search"
            placeholder={fr.topbar.searchPlaceholder}
            aria-label={fr.topbar.searchLabel}
            className={styles.searchInput}
          />
        </div>

        {/* STUB: notification centre */}
        <button type="button" className={styles.iconButton} aria-label={fr.topbar.notifications}>
          <Bell size={18} aria-hidden />
          <span className={styles.dot} aria-hidden />
        </button>

        <LanguageSwitcher />

        <div className={styles.user}>
          <button
            type="button"
            className={styles.userButton}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className={styles.avatar} aria-hidden>
              {user?.initials ?? 'DS'}
            </span>
            <span className={styles.userMeta}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userRole}>{user?.roleLabel}</span>
            </span>
          </button>

          {menuOpen ? (
            <div className={styles.menu} role="menu">
              <button type="button" role="menuitem" className={styles.menuItem} onClick={handleLogout}>
                <LogOut size={16} aria-hidden />
                {fr.topbar.logout}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
