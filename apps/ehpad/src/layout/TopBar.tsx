import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Info,
  LogOut,
  Menu as MenuIcon,
  Receipt,
  RefreshCw,
  Star,
  Timer,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import { useStrings } from '@/i18n';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { getDb } from '@/data/store';
import * as api from '@/data/api';
import { formatSince } from '@/lib/format';
import { notificationContent } from '@/lib/labels';
import { Avatar } from '@/components/Avatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import type { AppNotification } from '@/types/models';
import { useUnreadCount } from './Sidebar';
import styles from './TopBar.module.css';

interface TopBarProps {
  onOpenMenu?: (() => void) | undefined;
  showMenuButton: boolean;
}

type OpenMenu = 'notifications' | 'account' | null;

/** Nombre de notifications affichées dans la cloche avant « Voir tout ». */
const PREVIEW_COUNT = 5;

const TYPE_ICONS: Record<AppNotification['type'], LucideIcon> = {
  coach_retard: Timer,
  eval_due: Star,
  contrat_renouvellement: RefreshCw,
  facture: Receipt,
  contacts: Users,
  systeme: Info,
};

export function TopBar({ onOpenMenu, showMenuButton }: TopBarProps) {
  const fr = useStrings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unread = useUnreadCount();
  useDataVersion();
  const facility = getDb().facility;

  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const notifWrapRef = useRef<HTMLDivElement>(null);
  const notifTriggerRef = useRef<HTMLButtonElement>(null);
  const accountWrapRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifWrapRef.current?.contains(target)) return;
      if (accountWrapRef.current?.contains(target)) return;
      setOpenMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const trigger = openMenu === 'notifications' ? notifTriggerRef : accountTriggerRef;
        setOpenMenu(null);
        trigger.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  if (!user) return null;

  const recent = [...getDb().notifications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, PREVIEW_COUNT);

  const openNotification = (notification: AppNotification) => {
    setOpenMenu(null);
    void api.markNotificationRead(notification.id).then(() => {
      navigate(notification.link ?? '/notifications');
    });
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {showMenuButton && (
          <button type="button" className={styles.iconBtn} onClick={onOpenMenu} aria-label={fr.nav.openMenu}>
            <MenuIcon aria-hidden />
          </button>
        )}
        <p className={styles.facility}>{facility.tradeName}</p>
        <span className={styles.groupChip}>
          {facility.group ? facility.group.name : fr.header.groupNone}
        </span>
      </div>

      <div className={styles.right}>
        <LanguageSwitcher />

        <div className={styles.menuWrap} ref={notifWrapRef}>
          <button
            type="button"
            ref={notifTriggerRef}
            className={styles.iconBtn}
            aria-haspopup="menu"
            aria-expanded={openMenu === 'notifications'}
            aria-label={unread > 0 ? fr.header.unread(unread) : fr.header.noUnread}
            onClick={() =>
              setOpenMenu((current) => (current === 'notifications' ? null : 'notifications'))
            }
          >
            <Bell aria-hidden />
            {unread > 0 && (
              <span className={styles.bellBadge} aria-hidden>
                {unread}
              </span>
            )}
          </button>
          {openMenu === 'notifications' && (
            <div className={styles.notifMenu} role="menu" aria-label={fr.header.notificationsMenu}>
              <p className={styles.menuHeader}>
                <strong>{fr.notifications.title}</strong>
                <span>{unread > 0 ? fr.header.unread(unread) : fr.header.noUnread}</span>
              </p>

              {recent.length === 0 ? (
                <p className={styles.notifEmpty}>{fr.notifications.empty}</p>
              ) : (
                <ul className={styles.notifList}>
                  {recent.map((notification) => {
                    const Icon = TYPE_ICONS[notification.type];
                    const { title, body } = notificationContent(fr, notification);
                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.notifItem}
                          onClick={() => openNotification(notification)}
                        >
                          <span
                            className={`${styles.notifIcon} ${
                              notification.read ? '' : styles.notifIconUnread
                            }`}
                          >
                            <Icon size={18} aria-hidden />
                          </span>
                          <span className={styles.notifTexts}>
                            <span className={styles.notifTitle}>
                              {!notification.read && <span className={styles.notifDot} aria-hidden />}
                              {title}
                            </span>
                            <span className={styles.notifBody}>
                              {body} · {formatSince(notification.createdAt)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Link
                to="/notifications"
                role="menuitem"
                className={styles.viewAllBtn}
                onClick={() => setOpenMenu(null)}
              >
                {fr.notifications.viewAll}
              </Link>
            </div>
          )}
        </div>

        <div className={styles.menuWrap} ref={accountWrapRef}>
          <button
            type="button"
            ref={accountTriggerRef}
            className={styles.avatarBtn}
            aria-haspopup="menu"
            aria-expanded={openMenu === 'account'}
            aria-label={fr.header.accountMenu}
            onClick={() => setOpenMenu((current) => (current === 'account' ? null : 'account'))}
          >
            <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} size="topbar" decorative />
          </button>
          {openMenu === 'account' && (
            <div className={styles.menu} role="menu" aria-label={fr.header.accountMenu}>
              <p className={styles.menuHeader}>
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                <span>{fr.roles[user.role]}</span>
              </p>
              <Link
                to="/mon-compte"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => setOpenMenu(null)}
              >
                <UserRound aria-hidden className={styles.menuIcon} />
                {fr.header.account}
              </Link>
              <Link
                to="/mon-compte?suppression=1"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => setOpenMenu(null)}
              >
                <Trash2 aria-hidden className={styles.menuIcon} />
                {fr.header.deleteRequest}
              </Link>
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  setOpenMenu(null);
                  logout();
                  navigate('/connexion');
                }}
              >
                <LogOut aria-hidden className={styles.menuIcon} />
                {fr.header.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
