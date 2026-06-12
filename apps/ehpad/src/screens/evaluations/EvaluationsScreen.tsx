import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, formatTime } from '@/lib/format';
import { unitLabel } from '@/lib/status';
import {
  Avatar,
  ButtonLink,
  EmptyState,
  List,
  ListItem,
  LoadError,
  PageHeader,
  SkeletonGroup,
  SkeletonRows,
} from '@/components';
import styles from './evaluations.module.css';

/** SESS-13 — liste des évaluations en attente (une destination, plusieurs accès). */
export default function EvaluationsScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const state = useAsync(
    () =>
      Promise.all([api.listPendingEvaluations(), api.listCoaches()]).then(
        ([pending, coaches]) => ({ pending, coaches }),
      ),
    [version],
  );

  return (
    <>
      <PageHeader title={fr.evaluations.title} intro={fr.evaluations.pendingIntro} />

      {state.loading && (
        <SkeletonGroup>
          <SkeletonRows rows={4} height={72} />
        </SkeletonGroup>
      )}
      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && state.data.pending.length === 0 && (
        <EmptyState title={fr.evaluations.empty} body={fr.evaluations.emptyBody} />
      )}

      {state.data && state.data.pending.length > 0 && (
        <section className={styles.listCard}>
          <h2 className="sr-only">{fr.evaluations.pendingTitle}</h2>
          <List label={fr.evaluations.pendingTitle}>
            {state.data.pending.map((session) => {
              const coach = state.data?.coaches.find((c) => c.id === session.coachId);
              return (
                <ListItem
                  key={session.id}
                  leading={
                    coach ? (
                      <Avatar firstName={coach.firstName} lastName={coach.lastName} decorative />
                    ) : undefined
                  }
                  primary={fr.evaluations.sessionOf(formatDate(session.date), formatTime(session.time))}
                  secondary={`${coach ? `${coach.firstName} ${coach.lastName} · ` : ''}${unitLabel(session.unitType)}`}
                  trailing={
                    <ButtonLink size="md" to={`/evaluations/${session.id}`}>
                      {fr.evaluations.evaluate}
                    </ButtonLink>
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
