import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarClock, ChevronRight, User } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { capitalize, formatDate, formatTime, formatWeekdayDate } from '@/lib/format';
import { evaluationChip, unitLabel } from '@/lib/status';
import {
  Avatar,
  EmptyState,
  LoadError,
  PageHeader,
  RatingDisplay,
  Skeleton,
  SkeletonGroup,
  StatusChip,
  Tabs,
  panelId,
  tabId,
} from '@/components';
import type { Session } from '@/types/models';
import styles from './evaluations.module.css';

type TabKey = 'a_evaluer' | 'historique';

/** SESS-13 — page Évaluations : onglet « À évaluer » (en attente) + onglet
 *  « Historique » (séances déjà évaluées → « Voir mon évaluation »). */
export default function EvaluationsScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const [params, setParams] = useSearchParams();
  const tab: TabKey = params.get('onglet') === 'historique' ? 'historique' : 'a_evaluer';

  const state = useAsync(
    () =>
      Promise.all([
        api.listPendingEvaluations(),
        api.listSubmittedEvaluations(),
        api.listCoaches(),
      ]).then(([pending, history, coaches]) => ({ pending, history, coaches })),
    [version],
  );

  const changeTab = (next: string) =>
    setParams(next === 'historique' ? { onglet: 'historique' } : {});

  // Carte d'entrée partagée : zone gauche (titre + date·heure, le lien), zone centrale
  // (coach), zone droite (aside : pastille « À évaluer » ou note des étoiles).
  const renderCard = (session: Session, aside: ReactNode, ariaLabel: string) => {
    const coach = state.data?.coaches.find((c) => c.id === session.coachId);
    const coachName = coach
      ? `${coach.firstName} ${coach.lastName}`
      : fr.calendar.unassigned;
    return (
      <article key={session.id} className={styles.entryCard}>
        <Link to={`/evaluations/${session.id}`} className={styles.entryMain} aria-label={ariaLabel}>
          <span className={styles.entryTitle}>{unitLabel(session.unitType)}</span>
          <span className={styles.entryMeta}>
            <CalendarClock className={styles.entryMetaIcon} aria-hidden />
            {capitalize(formatWeekdayDate(session.date))} · {formatTime(session.time)}
          </span>
        </Link>

        <div className={styles.entryCoach}>
          {coach ? (
            <Avatar firstName={coach.firstName} lastName={coach.lastName} src={coach.avatarUrl} size="sm" decorative />
          ) : (
            <span className={styles.entryCoachIcon}>
              <User aria-hidden />
            </span>
          )}
          <span className={styles.entryCoachName}>{coachName}</span>
        </div>

        <div className={styles.entryAside}>{aside}</div>

        <ChevronRight className={styles.entryChevron} aria-hidden />
      </article>
    );
  };

  const renderPending = () => {
    const list = state.data?.pending ?? [];
    if (list.length === 0) {
      return <EmptyState title={fr.evaluations.empty} body={fr.evaluations.emptyBody} />;
    }
    return (
      <section aria-labelledby="eval-pending-heading">
        <h2 id="eval-pending-heading" className="sr-only">
          {fr.evaluations.pendingTitle}
        </h2>
        <div className={styles.entryList}>
          {list.map((session) =>
            renderCard(
              session,
              <StatusChip spec={evaluationChip(false)} />,
              `${fr.evaluations.evaluate} : ${fr.evaluations.sessionOf(
                formatDate(session.date),
                formatTime(session.time),
              )}`,
            ),
          )}
        </div>
      </section>
    );
  };

  const renderHistory = () => {
    const list = state.data?.history ?? [];
    if (list.length === 0) {
      return <EmptyState title={fr.evaluations.historyEmpty} body={fr.evaluations.historyEmptyBody} />;
    }
    return (
      <section aria-labelledby="eval-history-heading">
        <h2 id="eval-history-heading" className="sr-only">
          {fr.evaluations.historyTitle}
        </h2>
        <div className={styles.entryList}>
          {list.map((session) =>
            renderCard(
              session,
              session.evaluation ? (
                <RatingDisplay value={session.evaluation.stars} size="sm" showText={false} />
              ) : null,
              `${fr.evaluations.viewEvaluation} : ${fr.evaluations.sessionOf(
                formatDate(session.date),
                formatTime(session.time),
              )}`,
            ),
          )}
        </div>
      </section>
    );
  };

  return (
    <>
      <PageHeader title={fr.evaluations.title} intro={fr.evaluations.pendingIntro} />
      <Tabs
        idBase="evaluations"
        label={fr.evaluations.title}
        active={tab}
        onChange={changeTab}
        tabs={[
          { id: 'a_evaluer', label: fr.evaluations.tabs.pending },
          { id: 'historique', label: fr.evaluations.tabs.history },
        ]}
      />
      <div
        role="tabpanel"
        id={panelId('evaluations', tab)}
        aria-labelledby={tabId('evaluations', tab)}
        className={styles.tabPanel}
      >
        {state.loading && (
          <SkeletonGroup>
            <div className={styles.entryList}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={68} radius="var(--radius-lg)" />
              ))}
            </div>
          </SkeletonGroup>
        )}
        {state.error && <LoadError onRetry={state.retry} />}
        {state.data && (tab === 'a_evaluer' ? renderPending() : renderHistory())}
      </div>
    </>
  );
}
