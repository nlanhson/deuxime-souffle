import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { formatDate } from '@/lib/format';
import {
  ButtonLink,
  EmptyState,
  LoadError,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  SkeletonRows,
} from '@/components';
import { CoachReportModal } from './CoachReportModal';
import { PostponeModal } from './PostponeModal';
import { SessionDetailBody } from './SessionDetailBody';
import styles from './sessions.module.css';

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
          {/* Zone 1 — en-tête sans cadre, clos par un filet (aucune carte). */}
          <div className={styles.detailHeader}>
            <div className={styles.headerMain}>
              <Skeleton height={28} width={220} radius="var(--radius-md)" />
              <div className={styles.headerMeta}>
                <Skeleton height={14} width={90} radius="var(--radius-md)" />
                <Skeleton height={22} width={72} radius="var(--radius-pill)" />
                <Skeleton height={22} width={72} radius="var(--radius-pill)" />
              </div>
            </div>
            <div className={styles.coachBlock}>
              <Skeleton height={36} width={36} radius="var(--radius-pill)" />
              <Skeleton height={16} width={120} radius="var(--radius-md)" />
            </div>
          </div>

          {/* Zone — rangée d'actions (pastilles). */}
          <div className={styles.actionsRow} style={{ marginTop: 'var(--space-md)' }}>
            <Skeleton height={40} width={150} radius="var(--radius-pill)" />
            <Skeleton height={40} width={150} radius="var(--radius-pill)" />
          </div>

          {/* Zone 2 — les faits, en sections séparées par des filets. */}
          <div className={styles.sections} style={{ marginTop: 'var(--space-lg)' }}>
            <section className={styles.section}>
              <Skeleton height={12} width={120} radius="var(--radius-md)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                <Skeleton height={14} width="80%" radius="var(--radius-md)" />
                <Skeleton height={14} width="60%" radius="var(--radius-md)" />
              </div>
            </section>
            <section className={styles.section}>
              <Skeleton height={12} width={120} radius="var(--radius-md)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                <Skeleton height={14} width="80%" radius="var(--radius-md)" />
                <Skeleton height={14} width="60%" radius="var(--radius-md)" />
              </div>
            </section>
            <section className={styles.section}>
              <Skeleton height={12} width={120} radius="var(--radius-md)" />
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <SkeletonRows rows={4} height={36} />
              </div>
            </section>
          </div>
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

  return (
    <>
      <PageHeader
        title={title}
        crumbs={[{ label: fr.sessions.detail.breadcrumb, to: '/sessions' }, { label: title }]}
      />

      <SessionDetailBody
        session={session}
        coach={coach}
        onSeeReport={() => setReportOpen(true)}
        onPostpone={() => setPostponeOpen(true)}
      />

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
