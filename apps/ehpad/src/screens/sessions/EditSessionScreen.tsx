import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { addDays } from '@/lib/calendar';
import { formatDate, toIso } from '@/lib/format';
import { isDayFullyExcluded } from '@/lib/exclusions';
import {
  Button,
  ButtonLink,
  Card,
  CardSection,
  DatePicker,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  TimePicker,
} from '@/components';
import styles from './sessions.module.css';

/** SESS-10 — déplacer UNE occurrence future non assignée (le contrat ne change pas). */
export default function EditSessionScreen() {
  const fr = useStrings();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const version = useDataVersion();

  const state = useAsync(
    () =>
      Promise.all([api.getSession(id), api.listContracts()]).then(([session, contracts]) => ({
        session,
        contracts,
      })),
    [id, version],
  );

  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const crumbs = (sessionDate?: string) => [
    { label: fr.sessions.detail.breadcrumb, to: '/sessions' },
    ...(sessionDate
      ? [{ label: fr.sessions.detail.title(formatDate(sessionDate)), to: `/sessions/${id}` }]
      : []),
    { label: fr.sessions.edit.title },
  ];

  if (state.loading) {
    return (
      <>
        <PageHeader title={fr.sessions.edit.title} crumbs={crumbs()} intro={fr.sessions.edit.intro} />
        <SkeletonGroup>
          <Card>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <Skeleton height={20} width={180} radius="var(--radius-pill)" />
            </div>
            <div className={styles.editForm}>
              {/* Date field: label + helper line + 52px control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <Skeleton height={16} width={120} radius="var(--radius-pill)" />
                <Skeleton height={12} width={220} radius="var(--radius-pill)" />
                <Skeleton height={52} radius="var(--radius-md)" />
              </div>
              {/* Time field: label + 52px control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <Skeleton height={16} width={120} radius="var(--radius-pill)" />
                <Skeleton height={52} radius="var(--radius-md)" />
              </div>
              <div className={styles.actionsRow}>
                <Skeleton height={44} width={120} radius="var(--radius-md)" />
                <Skeleton height={44} width={120} radius="var(--radius-md)" />
              </div>
            </div>
          </Card>
        </SkeletonGroup>
      </>
    );
  }

  if (state.error) {
    return (
      <>
        <PageHeader title={fr.sessions.edit.title} crumbs={crumbs()} />
        <LoadError onRetry={state.retry} />
      </>
    );
  }

  const session = state.data?.session ?? null;
  if (!session) {
    return (
      <>
        <PageHeader title={fr.sessions.edit.title} crumbs={crumbs()} />
        <EmptyState
          title={fr.sessions.notFound}
          body={fr.sessions.notFoundBody}
          action={<ButtonLink to="/sessions">{fr.common.back}</ButtonLink>}
        />
      </>
    );
  }

  const contract = state.data?.contracts.find((c) => c.id === session.contractId) ?? null;
  const todayIso = toIso(new Date());
  const editable =
    session.date > todayIso &&
    session.coachId === null &&
    (session.status === 'a_venir' || session.status === 'reportee');

  if (!editable) {
    return (
      <>
        <PageHeader title={fr.sessions.edit.title} crumbs={crumbs(session.date)} />
        <InlineAlert variant="info" title={fr.sessions.edit.notEditable} />
        <div>
          <ButtonLink to={`/sessions/${session.id}`}>{fr.common.back}</ButtonLink>
        </div>
      </>
    );
  }

  const submit = async () => {
    if (!date) {
      setDateError(fr.sessions.edit.dateHelp);
      return;
    }
    setBusy(true);
    setFailed(false);
    setConflict(false);
    try {
      await api.editSessionSchedule(
        id,
        date,
        time ?? session.time,
        user ? `${user.firstName} ${user.lastName}` : '',
      );
      showToast({ message: fr.sessions.edit.success });
      navigate(`/sessions/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message === 'conflit') setConflict(true);
      else setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={fr.sessions.edit.title}
        crumbs={crumbs(session.date)}
        intro={fr.sessions.edit.intro}
      />
      {conflict && <InlineAlert variant="warning" title={fr.sessions.edit.conflict} />}
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} autoFocus />}

      <CardSection title={fr.sessions.detail.title(formatDate(session.date))}>
        <div className={styles.editForm}>
          <DatePicker
            label={fr.sessions.edit.newDate}
            value={date}
            onChange={(iso) => {
              setDate(iso);
              setDateError(null);
              setConflict(false);
            }}
            min={toIso(addDays(new Date(), 1))}
            isDisabledDay={contract ? (d) => isDayFullyExcluded(contract.excludedSlots, d) : undefined}
            disabledDayReason={fr.a11y.closedDay}
            helper={fr.sessions.edit.dateHelp}
            error={dateError}
            required
          />
          <TimePicker
            label={fr.sessions.edit.newTime}
            value={time ?? session.time}
            onChange={setTime}
            required
          />
          <div className={styles.actionsRow}>
            <ButtonLink to={`/sessions/${id}`} variant="ghost">
              {fr.common.cancel}
            </ButtonLink>
            <Button
              variant="primary"
              onClick={submit}
              loading={busy}
              disabled={date === null}
              disabledReason={date === null ? fr.sessions.edit.dateHelp : undefined}
            >
              {fr.sessions.edit.submit}
            </Button>
          </div>
        </div>
      </CardSection>
    </>
  );
}
