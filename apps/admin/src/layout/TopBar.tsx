import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Check,
  CircleUser,
  ClipboardCheck,
  FileText,
  LogOut,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { NAV_ITEMS } from './nav';
import { useAuth } from '@/context/AuthContext';
import { useStrings } from '@/i18n';
import type { NotifKind } from '@/i18n/fr';
import styles from './TopBar.module.css';

/** Icône par famille de notification. */
const NOTIF_ICON: Record<NotifKind, LucideIcon> = {
  contract: FileText,
  incident: AlertTriangle,
  assignment: Sparkles,
  report: ClipboardCheck,
};

type Popover = 'notifications' | 'user' | null;

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

  // One popover open at a time — opening one closes the other.
  const [open, setOpen] = useState<Popover>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Read state lives client-side: ids marked read individually, plus a "clear all".
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());
  const [allRead, setAllRead] = useState(false);

  const notif = fr.topbar.notificationsPanel;
  const isUnread = (id: string, unread: boolean) => unread && !allRead && !readIds.has(id);
  const unreadCount = useMemo(
    () => notif.items.filter((n) => n.unread && !allRead && !readIds.has(n.id)).length,
    [notif.items, readIds, allRead],
  );

  // Close either popover on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setOpen(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className={styles.bar}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions} ref={actionsRef}>
        {/* ---- Notifications ---- */}
        <div className={styles.notif}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setOpen((o) => (o === 'notifications' ? null : 'notifications'))}
            aria-expanded={open === 'notifications'}
            aria-haspopup="dialog"
            aria-label={
              unreadCount > 0
                ? `${fr.topbar.notifications}, ${notif.unread(unreadCount)}`
                : fr.topbar.notifications
            }
          >
            <Bell size={24} aria-hidden />
            {unreadCount > 0 ? <span className={styles.dot} aria-hidden /> : null}
          </button>

          {open === 'notifications' ? (
            <div className={styles.panel} role="dialog" aria-label={notif.title}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>{notif.title}</span>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    className={styles.panelAction}
                    onClick={() => setAllRead(true)}
                  >
                    <Check size={14} aria-hidden />
                    {notif.markAllRead}
                  </button>
                ) : null}
              </div>

              <ul className={styles.notifList}>
                {notif.items.map((item) => {
                  const Icon = NOTIF_ICON[item.kind];
                  const unread = isUnread(item.id, item.unread);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={styles.notifItem}
                        data-unread={unread}
                        onClick={() =>
                          setReadIds((prev) => new Set(prev).add(item.id))
                        }
                      >
                        <span className={styles.notifIcon} aria-hidden>
                          <Icon size={16} />
                        </span>
                        <span className={styles.notifBody}>
                          <span className={styles.notifText}>{item.text}</span>
                          <span className={styles.notifTime}>{item.time}</span>
                        </span>
                        {unread ? <span className={styles.notifDot} aria-hidden /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                className={styles.panelFooter}
                onClick={() => {
                  setOpen(null);
                  navigate('/');
                }}
              >
                {notif.viewAll}
              </button>
            </div>
          ) : null}
        </div>

        {/* ---- User menu ---- */}
        <div className={styles.user}>
          <button
            type="button"
            className={styles.userButton}
            onClick={() => setOpen((o) => (o === 'user' ? null : 'user'))}
            aria-expanded={open === 'user'}
            aria-haspopup="menu"
            aria-label={user?.name ?? 'Menu utilisateur'}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className={styles.avatar} aria-hidden />
            ) : (
              <CircleUser size={42} strokeWidth={1.5} className={styles.avatarIcon} aria-hidden />
            )}
          </button>

          {open === 'user' ? (
            <div className={styles.menu} role="menu">
              <div className={styles.menuHeader} role="presentation">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className={styles.menuAvatar} aria-hidden />
                ) : (
                  <span className={styles.menuAvatar} aria-hidden>{user?.initials ?? 'DS'}</span>
                )}
                <div className={styles.menuMeta}>
                  <span className={styles.menuName}>{user?.name}</span>
                  <span className={styles.menuRole}>{user?.roleLabel}</span>
                </div>
              </div>
              <div className={styles.menuDivider} role="separator" />
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
