import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Info, Receipt, RefreshCw, Star, Timer, Users } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { formatSince } from '@/lib/format';
import {
  Button,
  Chip,
  EmptyState,
  List,
  ListItem,
  LoadError,
  PageHeader,
  SkeletonGroup,
  SkeletonRows,
} from '@/components';
import type { AppNotification } from '@/types/models';

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
        <SkeletonGroup>
          <SkeletonRows rows={5} height={72} />
        </SkeletonGroup>
      )}
      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && state.data.length === 0 && (
        <EmptyState title={fr.notifications.empty} body={fr.notifications.emptyBody} />
      )}

      {state.data && state.data.length > 0 && (
        <section
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--elevation-1)',
            padding: 'var(--space-sm) var(--space-lg)',
          }}
        >
          <List label={fr.notifications.title}>
            {state.data.map((notification) => {
              const Icon = TYPE_ICONS[notification.type];
              return (
                <ListItem
                  key={notification.id}
                  unread={!notification.read}
                  onClick={() => open(notification)}
                  leading={
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: notification.read ? 'var(--lc-neutral-100)' : 'var(--color-info-soft)',
                        color: notification.read ? 'var(--color-text-secondary)' : 'var(--color-accent)',
                      }}
                    >
                      <Icon size={20} aria-hidden />
                    </span>
                  }
                  primary={notification.title}
                  secondary={`${notification.body} — ${formatSince(notification.createdAt)}`}
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
