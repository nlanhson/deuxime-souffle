import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { CalendarPlus, Pencil, RefreshCw, Send } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { capitalize, formatDate, formatEuro, formatTime, formatTimestamp } from '@/lib/format';
import { contractStatusChip, sessionStatusChip, unitLabel } from '@/lib/status';
import { historyText } from '@/lib/labels';
import {
  Avatar,
  Button,
  ButtonLink,
  EmptyState,
  InlineAlert,
  List,
  ListItem,
  LoadError,
  PageHeader,
  ProgressBar,
  RatingDisplay,
  Skeleton,
  SkeletonGroup,
  StatusChip,
} from '@/components';
import { PlanSessionModal } from '@/screens/dashboard/PlanSessionModal';
import styles from './contracts.module.css';

/** CON-03 — détail du contrat : résumé, séances générées, coachs, historique. */
export default function ContractDetailScreen() {
  const fr = useStrings();
  const { id = '' } = useParams();
  const version = useDataVersion();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [planOpen, setPlanOpen] = useState(false);

  const state = useAsync(
    () =>
      Promise.all([api.getContract(id), api.listSessions(), api.listCoaches(), api.listContracts()]).then(
        ([contract, sessions, coaches, contracts]) => ({ contract, sessions, coaches, contracts }),
      ),
    [id, version],
  );

  const contract = state.data?.contract ?? null;

  const contractSessions = useMemo(
    () =>
      (state.data?.sessions ?? [])
        .filter((s) => s.contractId === id)
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [state.data?.sessions, id],
  );

  const participatingCoaches = useMemo(() => {
    const ids = [...new Set(contractSessions.map((s) => s.coachId).filter((c): c is string => c !== null))];
    return ids
      .map((coachId) => state.data?.coaches.find((c) => c.id === coachId))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [contractSessions, state.data?.coaches]);

  if (state.loading) {
    return (
      <>
        <PageHeader
          title={fr.contracts.title}
          crumbs={[{ label: fr.contracts.detail.breadcrumb, to: '/contrats' }]}
          actions={<Skeleton height={28} width={120} radius="var(--radius-pill)" />}
        />
        {/* Squelette calqué sur la page « document » dé-encadrée : les QUATRE
            sections réelles (résumé, coachs, séances, historique), chacune
            séparée d'un filet (titre + lignes), pas de grandes cartes. */}
        <div className={styles.actionRow} style={{ marginBottom: 'var(--space-lg)' }}>
          <Skeleton height={40} width={150} radius="var(--radius-md)" />
          <Skeleton height={40} width={150} radius="var(--radius-md)" />
        </div>
        <SkeletonGroup className={styles.detailFlow}>
          {/* 1 — Résumé : titre + grille de champs + barre de progression. */}
          <div className={styles.section}>
            <Skeleton height={22} width={160} />
            <div className={styles.fieldGrid}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={styles.skeletonField}>
                  <Skeleton height={12} width="55%" />
                  <Skeleton height={16} width="80%" />
                </div>
              ))}
            </div>
            <Skeleton height={8} width="60%" radius="var(--radius-pill)" />
          </div>
          {/* 2 — Coachs : titre + rangées avatar / nom / note. */}
          <div className={styles.section}>
            <Skeleton height={22} width={150} />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={styles.coachRow}>
                <Skeleton height={36} width={36} radius="var(--radius-pill)" />
                <div className={styles.coachName} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <Skeleton height={14} width="40%" />
                  <Skeleton height={12} width="55%" />
                </div>
                <Skeleton height={14} width={72} radius="var(--radius-pill)" />
              </div>
            ))}
          </div>
          {/* 3 — Séances : titre + rangées de liste (date/heure + statut). */}
          <div className={styles.section}>
            <Skeleton height={22} width={170} />
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-md)',
                  minHeight: 48,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', flex: 1, minWidth: 0 }}>
                  <Skeleton height={15} width="55%" />
                  <Skeleton height={12} width="35%" />
                </div>
                <Skeleton height={22} width={90} radius="var(--radius-pill)" />
              </div>
            ))}
          </div>
          {/* 4 — Historique : titre + entrées (texte + ligne méta). */}
          <div className={styles.section}>
            <Skeleton height={22} width={140} />
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={styles.historyItem} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <Skeleton height={15} width="70%" />
                <Skeleton height={12} width="45%" />
              </div>
            ))}
          </div>
        </SkeletonGroup>
      </>
    );
  }

  if (state.error) {
    return (
      <>
        <PageHeader title={fr.contracts.title} crumbs={[{ label: fr.contracts.detail.breadcrumb, to: '/contrats' }]} />
        <LoadError onRetry={state.retry} />
      </>
    );
  }

  if (!contract) {
    return (
      <>
        <PageHeader title={fr.contracts.title} crumbs={[{ label: fr.contracts.detail.breadcrumb, to: '/contrats' }]} />
        <EmptyState
          title={fr.common.notFound}
          body={fr.common.notFoundBody}
          action={<ButtonLink to="/contrats">{fr.common.back}</ButtonLink>}
        />
      </>
    );
  }

  const title = fr.contracts.detail.title(contract.reference);
  const gateReason = isAdmin ? undefined : fr.common.adminOnly;
  const lastModification = [...contract.history].sort((a, b) => b.at.localeCompare(a.at))[0];

  return (
    <>
      <PageHeader
        title={title}
        crumbs={[{ label: fr.contracts.detail.breadcrumb, to: '/contrats' }, { label: title }]}
        actions={<StatusChip spec={contractStatusChip(contract.status)} />}
      />

      {contract.status === 'rejete' && contract.rejectionReason && (
        <InlineAlert
          variant="warning"
          title={fr.contracts.detail.rejectionTitle}
          action={
            <Button
              size="md"
              icon={Send}
              disabled={!isAdmin}
              disabledReason={gateReason}
              onClick={() => navigate(`/contrats/${contract.id}/resoumettre`)}
            >
              {fr.contracts.actions.resubmit}
            </Button>
          }
        >
          {contract.rejectionReason}
        </InlineAlert>
      )}
      {contract.status === 'en_attente_validation' && (
        <InlineAlert variant="info">{fr.contracts.detail.pendingInfo}</InlineAlert>
      )}
      {contract.status === 'modification_en_attente' && (
        <InlineAlert variant="info">{fr.contracts.detail.modifPendingInfo}</InlineAlert>
      )}
      {contract.status === 'non_renouvele' && (
        <InlineAlert variant="info">
          {fr.contracts.detail.nonRenewedInfo(formatDate(contract.endDate))}
        </InlineAlert>
      )}

      <div className={styles.actionRow}>
        {contract.status === 'active' && (
          <Button icon={CalendarPlus} onClick={() => setPlanOpen(true)}>
            {fr.contracts.actions.oneOff}
          </Button>
        )}
        {contract.status === 'a_renouveler' && (
          <Button
            icon={RefreshCw}
            disabled={!isAdmin}
            disabledReason={gateReason}
            onClick={() => navigate(`/contrats/${contract.id}/renouveler`)}
          >
            {fr.contracts.actions.renew}
          </Button>
        )}
        {(contract.status === 'active' || contract.status === 'a_renouveler') && (
          <Button
            icon={Pencil}
            disabled={!isAdmin}
            disabledReason={gateReason}
            onClick={() => navigate(`/contrats/${contract.id}/modifier`)}
          >
            {fr.contracts.actions.edit}
          </Button>
        )}
      </div>

      <div className={styles.detailFlow}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{fr.contracts.detail.summary}</h2>
          {/* Le statut vit déjà dans l'en-tête de page — pas de doublon ici. */}
          <dl className={styles.fieldGrid}>
            <div>
              <dt>{fr.contracts.card.units}</dt>
              <dd>{contract.units.map(unitLabel).join(', ')}</dd>
            </div>
            <div>
              <dt>{fr.contracts.card.frequency}</dt>
              <dd>{fr.frequency[contract.frequency]}</dd>
            </div>
            <div>
              <dt>{fr.contracts.card.sessionType}</dt>
              <dd>{fr.sessionTypes[contract.sessionType]}</dd>
            </div>
            <div>
              <dt>{fr.contracts.card.start}</dt>
              <dd>{capitalize(formatDate(contract.startDate))}</dd>
            </div>
            <div>
              <dt>{fr.contracts.card.end}</dt>
              <dd>{capitalize(formatDate(contract.endDate))}</dd>
            </div>
            <div>
              <dt>{fr.contracts.card.rate}</dt>
              <dd>{formatEuro(contract.rate)}</dd>
            </div>
            {contract.availabilityNotes && (
              <div className={styles.fieldSpan}>
                <dt>{fr.contracts.card.notes}</dt>
                <dd>{contract.availabilityNotes}</dd>
              </div>
            )}
          </dl>
          <div className={styles.subBlock}>
            <ProgressBar
              value={contract.completedSessionCount}
              max={Math.max(contract.generatedSessionCount, 1)}
              label={fr.contracts.detail.sessionsProgress(
                contract.completedSessionCount,
                contract.generatedSessionCount,
              )}
            />
          </div>
          {lastModification && (
            <p className={`${styles.historyMeta} ${styles.subNote}`}>
              {fr.contracts.detail.modifiedBy(lastModification.by, formatTimestamp(lastModification.at))}
            </p>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{fr.contracts.detail.coachesTitle}</h2>
          {participatingCoaches.length === 0 ? (
            <p className={styles.muted}>{fr.contracts.detail.coachesEmpty}</p>
          ) : (
            <>
              {participatingCoaches.map((coach) => (
                <div key={coach.id} className={styles.coachRow}>
                  <Avatar firstName={coach.firstName} lastName={coach.lastName} src={coach.avatarUrl} decorative />
                  <span className={styles.coachName}>
                    {coach.firstName} {coach.lastName}
                    <span className={styles.coachHint}>{fr.contracts.detail.avgFromFacility}</span>
                  </span>
                  {coach.avgRatingFromFacility !== undefined && (
                    <RatingDisplay value={coach.avgRatingFromFacility} size="sm" />
                  )}
                </div>
              ))}
              {contract.avgRatingFromFacility !== undefined && (
                <div className={styles.ratingDivider}>
                  <p className={styles.summaryLabel}>{fr.contracts.detail.contractAvg}</p>
                  <RatingDisplay value={contract.avgRatingFromFacility} />
                </div>
              )}
            </>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{fr.contracts.detail.sessionsTitle}</h2>
          {contractSessions.length === 0 ? (
            <p className={styles.muted}>{fr.contracts.detail.sessionsEmpty}</p>
          ) : (
            <>
              <List label={fr.contracts.detail.sessionsTitle}>
                {contractSessions.slice(0, 8).map((session) => (
                  <ListItem
                    key={session.id}
                    to={`/sessions/${session.id}`}
                    primary={`${capitalize(formatDate(session.date))} · ${formatTime(session.time)}`}
                    secondary={unitLabel(session.unitType)}
                    trailing={<StatusChip spec={sessionStatusChip(session.status)} />}
                  />
                ))}
              </List>
              {contractSessions.length > 8 && (
                <ButtonLink size="md" variant="ghost" to="/sessions">
                  {fr.dashboard.widgets.seeAll}
                </ButtonLink>
              )}
            </>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{fr.contracts.detail.historyTitle}</h2>
          {contract.history.length === 0 ? (
            <p className={styles.muted}>{fr.contracts.detail.historyEmpty}</p>
          ) : (
            <ul className={styles.historyList}>
              {[...contract.history]
                .sort((a, b) => b.at.localeCompare(a.at))
                .map((entry) => (
                  <li key={entry.id} className={styles.historyItem}>
                    {historyText(fr, entry)}
                    <span className={styles.historyMeta}>
                      {fr.contracts.detail.modifiedBy(entry.by, formatTimestamp(entry.at))}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>

      <PlanSessionModal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        contracts={state.data?.contracts ?? []}
        userName=""
        initialContractId={contract.id}
      />
    </>
  );
}
