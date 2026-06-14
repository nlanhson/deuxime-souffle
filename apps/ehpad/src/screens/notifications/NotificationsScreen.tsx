import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Info, Receipt, RefreshCw, Star, Timer, Users } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { formatSince } from '@/lib/format';
import { notificationContent } from '@/lib/labels';
import {
  Button,
  Chip,
  EmptyState,
  List,
  ListItem,
  LoadError,
  PageHeader,
  Skeleton,
  SkeletonGroup,
} from '@/components';
import type { AppNotification } from '@/types/models';
import styles from './notifications.module.css';

const TYPE_ICONS: Record<AppNotification['type'], LucideIcon> = {
  coach_retard: Timer,
  eval_due: Star,
  contrat_renouvellement: RefreshCw,
  facture: Receipt,
  contacts: Users,
  systeme: Info,
};

/** NOTI-04 — centre de notifications (les lues restent dans l'historique) ;
 *  NOTI-03 — l'alerte de retard coach pointe vers le journal de la séance. */
export default function NotificationsScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const navigate = useNavigate();
  const state = useAsync(() => api.listNotifications(), [version]);

  const unreadCount = (state.data ?? []).filter((n) => !n.read).length;

  const open = (notification: AppNotification) => {
    void api.markNotificationRead(notification.id).then(() => {
      if (notification.link) navigate(notification.link);
    });
  };

  return (
    <>
      <PageHeader
        title={fr.notifications.title}
        intro={fr.notifications.intro}
        actions={
          unreadCount > 0 ? (
            <Button size="md" onClick={() => void api.markAllNotificationsRead()}>
              {fr.notifications.markAllRead}
            </Button>
          ) : undefined
        }
      />

      {state.loading && (
        <SkeletonGroup className={styles.listCard}>
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                minHeight: 64,
                padding: 'var(--space-sm) var(--space-xs)',
                borderTop: i === 0 ? undefined : '1px solid var(--color-border-subtle)',
              }}
            >
              <Skeleton width={44} height={44} radius="var(--radius-pill)" />
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <Skeleton height={16} width="40%" radius="var(--radius-sm)" />
                <Skeleton height={14} width="70%" radius="var(--radius-sm)" />
              </div>
              <Skeleton width={56} height={20} radius="var(--radius-pill)" />
            </div>
          ))}
        </SkeletonGroup>
      )}
      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && state.data.length === 0 && (
        <EmptyState title={fr.notifications.empty} body={fr.notifications.emptyBody} />
      )}

      {state.data && state.data.length > 0 && (
        <section className={styles.listCard}>
          <List label={fr.notifications.title}>
            {state.data.map((notification) => {
              const Icon = TYPE_ICONS[notification.type];
              const { title, body } = notificationContent(fr, notification);
              return (
                <ListItem
                  key={notification.id}
                  unread={!notification.read}
                  onClick={() => open(notification)}
                  leading={
                    <span
                      className={
                        notification.read ? styles.typeIcon : `${styles.typeIcon} ${styles.typeIconUnread}`
                      }
                    >
                      <Icon size={20} aria-hidden />
                    </span>
                  }
                  primary={title}
                  secondary={`${body} — ${formatSince(notification.createdAt)}`}
                  trailing={
                    !notification.read ? (
                      <Chip label={fr.notifications.unreadDot} variant="info" />
                    ) : undefined
                  }
                />
              );
            })}
          </List>
        </section>
      )}
    </>
  );
}
