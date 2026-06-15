import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Clock3, Pencil, RefreshCw } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { addDays, addMonths, lastWeekday, mondayIndex, nextWeekday } from '@/lib/calendar';
import { capitalize, formatDate, formatEuro, formatTime, parseDate, toIso } from '@/lib/format';
import { contractStatusChip, unitLabel } from '@/lib/status';
import {
  Button,
  ButtonLink,
  Card,
  CardSection,
  Chip,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  StatusChip,
} from '@/components';
import styles from './contracts.module.css';

const SESSIONS_PER_YEAR: Record<string, number> = {
  hebdo: 46,
  bihebdo: 92,
  bimensuel: 23,
  mensuel: 11,
  ponctuel: 1,
};

/** CON-15 — renouvellement : actuel vs proposition, rappels 90/60/30,
 *  confirmer / personnaliser / décliner (→ non-reconduction). */
export default function RenewScreen() {
  const fr = useStrings();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const copy = fr.contracts.renew;

  const state = useAsync(
    () => Promise.all([api.getContract(id), api.listSessions()]).then(([contract, sessions]) => ({ contract, sessions })),
    [id],
  );
  const contract = state.data?.contract ?? null;

  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const proposal = useMemo(() => {
    if (!contract) return null;
    const start = addDays(parseDate(contract.endDate), 1);
    const end = addDays(addMonths(start, 12), -1);
    // Cadence dérivée des séances existantes (jour + heure les plus récents)
    const last = (state.data?.sessions ?? [])
      .filter((s) => s.contractId === contract.id)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))[0];
    const weekday = last ? mondayIndex(parseDate(last.date)) : 1;
    const time = last?.time ?? '10:30';
    const firstSessions = Array.from({ length: 6 }, (_, i) =>
      toIso(nextWeekday(lastWeekday(start, weekday, 0), weekday, i)),
    );
    const estimated = SESSIONS_PER_YEAR[contract.frequency] ?? 46;
    return { start: toIso(start), end: toIso(end), weekday, time, firstSessions, estimated };
  }, [contract, state.data?.sessions]);

  if (!isAdmin) {
    return (
      <>
        <PageHeader title={copy.title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }]} />
        <InlineAlert variant="info" title={fr.common.adminOnlyAlert}>
          {fr.common.adminOnlyBody}
        </InlineAlert>
        <div>
          <ButtonLink to={`/contrats/${id}`}>{fr.common.back}</ButtonLink>
        </div>
      </>
    );
  }

  if (state.loading) {
    return (
      <>
        <PageHeader title={copy.title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }]} />
        <SkeletonGroup>
          <div className={styles.compareGrid}>
            {[0, 1].map((card) => (
              <Card key={card} variant="static">
                <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  <Skeleton height={20} width="45%" radius="var(--radius-md)" />
                  {card === 1 && <Skeleton height={24} width={120} radius="var(--radius-pill)" />}
                </header>
                <dl className={styles.fieldGrid}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className={styles.skeletonField}>
                      <Skeleton height={12} width="60%" radius="var(--radius-md)" />
                      <Skeleton height={16} width="80%" radius="var(--radius-md)" />
                    </div>
                  ))}
                </dl>
                {card === 1 && (
                  <div className={styles.subBlock}>
                    <Skeleton height={12} width="40%" radius="var(--radius-md)" />
                    <div className={styles.skeletonStack} style={{ marginTop: 'var(--space-sm)' }}>
                      {Array.from({ length: 7 }, (_, i) => (
                        <Skeleton key={i} height={14} width="70%" radius="var(--radius-md)" />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div style={{ marginTop: 'var(--space-md)' }}>
            <Card variant="static">
              <Skeleton height={20} width="30%" radius="var(--radius-md)" />
              <div className={styles.skeletonStack} style={{ marginTop: 'var(--space-md)' }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <Skeleton height={24} width={90} radius="var(--radius-pill)" />
                    <Skeleton height={14} width="55%" radius="var(--radius-md)" />
                  </div>
                ))}
                <Skeleton height={12} width="45%" radius="var(--radius-md)" />
              </div>
            </Card>
          </div>

          <div className={styles.actionRow} style={{ marginTop: 'var(--space-md)' }}>
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} height={40} width={150} radius="var(--radius-md)" />
            ))}
          </div>
        </SkeletonGroup>
      </>
    );
  }

  if (state.error) {
    return (
      <>
        <PageHeader title={copy.title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }]} />
        <LoadError onRetry={state.retry} />
      </>
    );
  }

  if (!contract || !proposal) {
    return (
      <>
        <PageHeader title={copy.title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }]} />
        <EmptyState title={fr.common.notFound} body={fr.common.notFoundBody} action={<ButtonLink to="/contrats">{fr.common.back}</ButtonLink>} />
      </>
    );
  }

  if (contract.status !== 'a_renouveler') {
    return (
      <>
        <PageHeader title={copy.title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }, { label: contract.reference, to: `/contrats/${id}` }]} />
        <InlineAlert variant="info" title={copy.notRenewable} />
        <div>
          <ButtonLink to={`/contrats/${id}`}>{fr.common.back}</ButtonLink>
        </div>
      </>
    );
  }

  const confirmRenewal = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const renewed = await api.renewContractAsProposed(id, user ? `${user.firstName} ${user.lastName}` : '');
      showToast({ message: copy.confirmSuccess, kind: 'neutral' });
      navigate(`/contrats/${renewed.id}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  const endDate = parseDate(contract.endDate);
  const today = toIso(new Date());
  const milestones = [90, 60, 30].map((days) => {
    const date = toIso(addDays(endDate, -days));
    return { days, date, passed: date <= today };
  });

  const fields = (period: string, estimated: string) => (
    <dl className={styles.fieldGrid}>
      <div>
        <dt>{copy.period}</dt>
        <dd>{period}</dd>
      </div>
      <div>
        <dt>{fr.contracts.card.frequency}</dt>
        <dd>{fr.frequency[contract.frequency]}</dd>
      </div>
      <div>
        <dt>{fr.contracts.card.units}</dt>
        <dd>{contract.units.map(unitLabel).join(', ')}</dd>
      </div>
      <div>
        <dt>{fr.contracts.card.sessionType}</dt>
        <dd>{fr.sessionTypes[contract.sessionType]}</dd>
      </div>
      <div>
        <dt>{fr.contracts.card.rate}</dt>
        <dd>{formatEuro(contract.rate)}</dd>
      </div>
      <div>
        <dt>{copy.estimatedSessions}</dt>
        <dd>{estimated}</dd>
      </div>
    </dl>
  );

  return (
    <>
      <PageHeader
        title={copy.title}
        crumbs={[
          { label: fr.contracts.title, to: '/contrats' },
          { label: fr.contracts.detail.title(contract.reference), to: `/contrats/${id}` },
          { label: copy.title },
        ]}
      />
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} autoFocus />}

      <div className={styles.compareGrid}>
        <CardSection title={copy.current} actions={<StatusChip spec={contractStatusChip(contract.status)} />}>
          {fields(
            `${capitalize(formatDate(contract.startDate))} → ${formatDate(contract.endDate)}`,
            `${contract.generatedSessionCount}`,
          )}
        </CardSection>

        {/* Dernière carte de .compareGrid : liseré accent (voir contracts.module.css). */}
        <CardSection title={copy.proposal}>
          <p className={styles.mutedLead}>{copy.proposalIntro}</p>
          {fields(
            `${capitalize(formatDate(proposal.start))} → ${formatDate(proposal.end)}`,
            `≈ ${proposal.estimated}`,
          )}
          <div className={styles.subBlock}>
            <p className={styles.summaryLabel}>{copy.generatedSessions}</p>
            <ul className={styles.sessionPreview}>
              {proposal.firstSessions.map((date) => (
                <li key={date}>
                  {capitalize(formatDate(date))} · {formatTime(proposal.time)}
                </li>
              ))}
              <li>{copy.andMore(Math.max(proposal.estimated - proposal.firstSessions.length, 0))}</li>
            </ul>
          </div>
        </CardSection>
      </div>

      <CardSection title={copy.timeline}>
        <ul className={styles.timeline}>
          {milestones.map((milestone) => (
            <li key={milestone.days} className={styles.timelineItem}>
              <Chip
                label={milestone.passed ? copy.milestoneDone : copy.milestoneUpcoming}
                variant={milestone.passed ? 'progress' : 'pending'}
                icon={milestone.passed ? CheckCircle2 : Clock3}
              />
              <span>
                {copy.milestone(milestone.days)} · {capitalize(formatDate(milestone.date))}
              </span>
            </li>
          ))}
          <li className={styles.timelineItem}>
            <strong>{copy.endsOn(formatDate(contract.endDate))}</strong>
          </li>
        </ul>
        <p className={`${styles.muted} ${styles.subNote}`}>{copy.slotsReserved}</p>
      </CardSection>

      <div className={styles.actionRow}>
        <Button variant="primary" icon={RefreshCw} onClick={confirmRenewal} loading={busy}>
          {copy.confirm}
        </Button>
        <Button icon={Pencil} onClick={() => navigate(`/contrats/nouveau?from=${id}`)}>
          {copy.customize}
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/contrats/${id}/non-renouvellement`)}>
          {copy.decline}
        </Button>
      </div>
    </>
  );
}
