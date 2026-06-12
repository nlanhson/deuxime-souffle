import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Ban,
  CalendarClock,
  Clock3,
  FileText,
  Pencil,
  Star,
  Timer,
} from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import {
  capitalize,
  formatDuration,
  formatTime,
  formatTimestamp,
  formatWeekdayDate,
  formatDate,
  toIso,
} from '@/lib/format';
import { sessionStatusChip, unitLabel } from '@/lib/status';
import {
  Avatar,
  ButtonLink,
  Button,
  CardSection,
  Chip,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  RatingDisplay,
  Skeleton,
  SkeletonGroup,
  StatusChip,
} from '@/components';
import type { SessionEvent } from '@/types/models';
import { CoachReportModal } from './CoachReportModal';
import { PostponeModal } from './PostponeModal';
import styles from './sessions.module.css';

const EVENT_ICONS: Record<SessionEvent['kind'], LucideIcon> = {
  retard: Timer,
  report: Clock3,
  modification: Pencil,
  annulation: Ban,
  rapport_remis: FileText,
  evaluation: Star,
};

/** SESS-09 — détail de séance + journal des événements (NOTI-03) + actions. */
export default function SessionDetailScreen() {
  const fr = useStrings();
  const { id = '' } = useParams();
  const version = useDataVersion();
  const [reportOpen, setReportOpen] = useState(false);
  const [postponeOpen, setPostponeOpen] = useState(false);

  const state = useAsync(
    () =>
      Promise.all([api.getSession(id), api.listCoaches(), api.listContracts()]).then(
        ([session, coaches, contracts]) => ({ session, coaches, contracts }),
      ),
    [id, version],
  );

  if (state.loading) {
    return (
      <>
        <PageHeader title={fr.nav.sessions} crumbs={[{ label: fr.sessions.detail.breadcrumb, to: '/sessions' }]} />
        <SkeletonGroup>
          <Skeleton height={120} radius="var(--radius-lg)" />
          <div style={{ height: 'var(--space-md)' }} />
          <Skeleton height={280} radius="var(--radius-lg)" />
        </SkeletonGroup>
      </>
    );
  }

  if (state.error) {
    return (
      <>
        <PageHeader title={fr.nav.sessions} crumbs={[{ label: fr.sessions.detail.breadcrumb, to: '/sessions' }]} />
        <LoadError onRetry={state.retry} />
      </>
    );
  }

  const session = state.data?.session ?? null;
  if (!session) {
    return (
      <>
        <PageHeader title={fr.nav.sessions} crumbs={[{ label: fr.sessions.detail.breadcrumb, to: '/sessions' }]} />
        <EmptyState
          title={fr.sessions.notFound}
          body={fr.sessions.notFoundBody}
          action={<ButtonLink to="/sessions">{fr.common.back}</ButtonLink>}
        />
      </>
    );
  }

  const coach = state.data?.coaches.find((c) => c.id === session.coachId) ?? null;
  const contract = state.data?.contracts.find((c) => c.id === session.contractId) ?? null;
  const title = fr.sessions.detail.title(formatDate(session.date));

  const todayIso = toIso(new Date());
  const isFuture = session.date > todayIso && session.status !== 'annulee' && session.status !== 'terminee';
  const canEdit = isFuture && session.coachId === null;
  const canPostpone = isFuture;
  const canEvaluate = session.status === 'terminee' && !session.evaluation;

  const events = [...session.events].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <PageHeader
        title={title}
        crumbs={[{ label: fr.sessions.detail.breadcrumb, to: '/sessions' }, { label: title }]}
      />

      <section className={styles.headerCard}>
        <div className={styles.headerMain}>
          <p className={styles.headerDate}>
            {capitalize(formatWeekdayDate(session.date))} · {formatTime(session.time)}
          </p>
          <p className={styles.mutedText}>
            {fr.sessions.detail.duration} : {formatDuration(session.durationMin)}
          </p>
          <div className={styles.headerChips}>
            <StatusChip spec={sessionStatusChip(session.status)} />
            <Chip label={unitLabel(session.unitType)} variant="info" />
          </div>
        </div>
        <div className={styles.coachBlock}>
          {coach ? (
            <>
              <Avatar firstName={coach.firstName} lastName={coach.lastName} decorative />
              <span>
                <span className={styles.coachLabel}>{fr.sessions.detail.coach}</span>
                {coach.firstName} {coach.lastName}
              </span>
            </>
          ) : (
            <span>
              <span className={styles.coachLabel}>{fr.sessions.detail.coach}</span>
              {fr.sessions.detail.noCoach}
            </span>
          )}
        </div>
      </section>

      {session.isFirstTogether && (
        <InlineAlert variant="success" title={fr.sessions.detail.firstTogether} />
      )}

      <div className={styles.actionsRow}>
        <Button icon={FileText} onClick={() => setReportOpen(true)}>
          {fr.sessions.detail.seeReport}
        </Button>
        {canEdit && (
          <ButtonLink icon={Pencil} to={`/sessions/${session.id}/modifier`}>
            {fr.sessions.detail.editSession}
          </ButtonLink>
        )}
        {canPostpone && (
          <Button icon={Clock3} onClick={() => setPostponeOpen(true)}>
            {fr.sessions.detail.postpone}
          </Button>
        )}
        {canEvaluate && (
          <ButtonLink variant="primary" icon={Star} to={`/evaluations/${session.id}`}>
            {fr.sessions.detail.evaluate}
          </ButtonLink>
        )}
      </div>

      <div className={styles.detailGrid}>
        <CardSection title={fr.sessions.detail.interventionTitle}>
          {session.report ? (
            <div className={styles.stack}>
              <p>
                {fr.sessions.report.participants} : <strong>{session.report.participantCount}</strong>
              </p>
              <p className={styles.atmosphere}>
                {fr.sessions.report.atmosphere} :
                <RatingDisplay value={session.report.atmosphere.stars} showText={false} size="sm" />
                <span aria-hidden>{session.report.atmosphere.emoji}</span>
                <span className="sr-only">{fr.a11y.rating(session.report.atmosphere.stars)}</span>
              </p>
              <p>
                {fr.sessions.report.difficulties} :{' '}
                {session.report.hadDifficulties ? fr.common.yes : fr.common.no}
                {session.report.difficultiesNote ? ` — ${session.report.difficultiesNote}` : ''}
              </p>
              <p>{session.report.evaluationSummary}</p>
            </div>
          ) : (
            <p className={styles.mutedText}>{fr.sessions.detail.interventionEmpty}</p>
          )}
        </CardSection>

        <CardSection title={fr.sessions.detail.evaluationTitle}>
          {session.evaluation ? (
            <div className={styles.stack}>
              <RatingDisplay value={session.evaluation.stars} />
              <p>{fr.evaluations.form.impressions[session.evaluation.impression]}</p>
              {session.evaluation.comment && <p>« {session.evaluation.comment} »</p>}
              <p className={styles.evalMeta}>
                {fr.evaluations.form.submittedOn(
                  formatTimestamp(session.evaluation.submittedAt),
                  session.evaluation.submittedBy,
                )}
              </p>
            </div>
          ) : canEvaluate ? (
            <div className={`${styles.stack} ${styles.stackStart}`}>
              <p className={styles.mutedText}>{fr.sessions.detail.evaluationEmpty}</p>
              <ButtonLink variant="ghost" icon={Star} to={`/evaluations/${session.id}`}>
                {fr.sessions.detail.evaluate}
              </ButtonLink>
            </div>
          ) : (
            <p className={styles.mutedText}>{fr.sessions.detail.evaluationEmpty}</p>
          )}
        </CardSection>

        {session.coachMessage && (
          <CardSection title={fr.sessions.detail.coachMessageTitle}>
            <p>« {session.coachMessage} »</p>
          </CardSection>
        )}

        <CardSection title={fr.sessions.detail.journalTitle}>
          {events.length === 0 ? (
            <p className={styles.mutedText}>{fr.sessions.detail.journalEmpty}</p>
          ) : (
            <ul className={styles.journal}>
              {events.map((event) => {
                const Icon = EVENT_ICONS[event.kind] ?? CalendarClock;
                return (
                  <li key={event.id} className={styles.journalItem}>
                    <Icon className={styles.journalIcon} aria-hidden />
                    <span className={styles.journalText}>
                      {event.label}
                      <span className={styles.journalWhen}>{formatTimestamp(event.at)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardSection>
      </div>

      <CoachReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        session={session}
        coach={coach}
        sessionTypeLabel={contract ? fr.sessionTypes[contract.sessionType] : ''}
        hideOpenSession
      />
      <PostponeModal open={postponeOpen} onClose={() => setPostponeOpen(false)} session={session} />
    </>
  );
}
