import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStrings } from '@/i18n';
import { useToast } from '@/context/ToastContext';
import { useIsTablet } from '@/hooks/useMediaQuery';
import { Logo } from '@/components/Logo';
import { NavList, Sidebar, useUnreadCount } from './Sidebar';
import { TopBar } from './TopBar';
import styles from './AppShell.module.css';

// Garde au niveau module : la pop-up d'accueil ne se montre qu'une fois par
// chargement de page (sinon StrictMode double le montage → toast en double).
let welcomeToastShown = false;

/** Coquille persistante : NavRail + TopBar + contenu. Sur mobile/tablette
 *  étroite, le rail devient un tiroir ouvert depuis la barre supérieure. */
export function AppShell() {
  const fr = useStrings();
  const isNarrow = useIsTablet();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const unreadAtEntry = useRef(useUnreadCount()); // compteur figé à l'arrivée sur le site

  useEffect(() => {
    setDrawerOpen(false); // fermer le tiroir à chaque navigation
  }, [location.pathname]);

  // Accueil (calendrier : vues Mois et Liste) + page Séances : on masque
  // visuellement la barre de défilement de la zone de contenu (le défilement
  // reste fonctionnel à la molette / au clavier). La vue Semaine garde sa propre
  // barre, contenue dans la fenêtre du calendrier. Les autres pages la gardent.
  const hideScrollbar =
    location.pathname === '/' ||
    location.pathname === '/sessions' ||
    location.pathname.startsWith('/sessions/');

  // À l'entrée sur le site : une seule pop-up si des notifications attendent.
  useEffect(() => {
    if (welcomeToastShown) return;
    const count = unreadAtEntry.current;
    if (count > 0) {
      welcomeToastShown = true;
      showToast({
        kind: 'neutral',
        message: fr.notifications.welcomeToast(count),
        action: { label: fr.notifications.welcomeToastAction, run: () => navigate('/notifications') },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois, au montage
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#contenu">
        {fr.app.skipToContent}
      </a>
      {!isNarrow && <Sidebar />}
      <div className={styles.main}>
        <TopBar showMenuButton={isNarrow} onOpenMenu={() => setDrawerOpen(true)} />
        <main
          id="contenu"
          className={`${styles.content}${hideScrollbar ? ` ${styles.hideScrollbar}` : ''}`}
          tabIndex={-1}
        >
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>

      {isNarrow && drawerOpen && (
        <div
          className={styles.drawerScrim}
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setDrawerOpen(false)}
        >
          <nav className={styles.drawer} aria-label={fr.nav.mainNav}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerBrand}>
                <Logo size={40} color="var(--color-nav-red)" rounded />
                <p className={styles.drawerTitle}>{fr.nav.menu}</p>
              </div>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setDrawerOpen(false)}
                aria-label={fr.nav.closeMenu}
              >
                <X aria-hidden />
              </button>
            </div>
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </nav>
        </div>
      )}
    </div>
  );
}
