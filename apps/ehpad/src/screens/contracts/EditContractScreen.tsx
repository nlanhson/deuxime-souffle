import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { capitalize, formatDate } from '@/lib/format';
import {
  ButtonLink,
  Chip,
  DatePicker,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  RadioGroup,
  Select,
  Skeleton,
  SkeletonGroup,
  Textarea,
  Wizard,
} from '@/components';
import type { Frequency, SessionType } from '@/types/models';
import { Hourglass, Zap } from 'lucide-react';
import styles from './contracts.module.css';

/** CON-04 — modifier un contrat : ajustements mineurs (immédiats) vs
 *  modifications majeures (statut « Modification en attente », validation DS). */
export default function EditContractScreen() {
  const fr = useStrings();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const copy = fr.contracts.editWizard;

  const state = useAsync(() => api.getContract(id), [id]);
  const contract = state.data ?? null;

  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (contract) {
      setNotes(contract.availabilityNotes ?? '');
      setFrequency(contract.frequency);
      setSessionType(contract.sessionType);
      setStartDate(contract.startDate);
      setEndDate(contract.endDate);
    }
  }, [contract]);

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
          <Skeleton height={420} radius="var(--radius-xl)" />
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

  if (!contract) {
    return (
      <>
        <PageHeader title={copy.title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }]} />
        <EmptyState
          title={fr.common.notFound}
          body={fr.common.notFoundBody}
          action={<ButtonLink to="/contrats">{fr.common.back}</ButtonLink>}
        />
      </>
    );
  }

  /* ---------- détection des changements ---------- */

  const minorChanged = notes !== (contract.availabilityNotes ?? '');
  const majorChanges: string[] = [];
  if (frequency && frequency !== contract.frequency) {
    majorChanges.push(
      `${copy.fields.frequency} : ${fr.frequency[contract.frequency]} → ${fr.frequency[frequency]}`,
    );
  }
  if (sessionType && sessionType !== contract.sessionType) {
    majorChanges.push(
      `${copy.fields.sessionType} : ${fr.sessionTypes[contract.sessionType]} → ${fr.sessionTypes[sessionType]}`,
    );
  }
  if (
    (startDate && startDate !== contract.startDate) ||
    (endDate && endDate !== contract.endDate)
  ) {
    majorChanges.push(
      `${copy.fields.period} : ${formatDate(startDate ?? contract.startDate)} → ${formatDate(endDate ?? contract.endDate)}`,
    );
  }
  const hasChanges = minorChanged || majorChanges.length > 0;

  const submit = async () => {
    setBusy(true);
    setFailed(false);
    const by = user ? `${user.firstName} ${user.lastName}` : '';
    try {
      await api.applyContractEdit(
        id,
        {
          ...(minorChanged
            ? { minor: { availabilityNotes: notes }, minorLabel: `${copy.fields.notes} mises à jour` }
            : {}),
          ...(majorChanges.length > 0
            ? { major: {}, majorLabel: `${fr.history.modification_majeure} — ${majorChanges.join(' ; ')}` }
            : {}),
        },
        by,
      );
      showToast({
        message: majorChanges.length > 0 ? copy.majorSubmitted : copy.minorApplied,
        kind: majorChanges.length > 0 ? 'neutral' : 'success',
      });
      navigate(`/contrats/${id}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  const title = `${copy.title} — ${contract.reference}`;

  const stepEdit = (
    <>
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
          <h3 className={styles.summaryTitle} style={{ marginBottom: 0 }}>{copy.minorTitle}</h3>
          <Chip label={copy.minorBadge} variant="progress" icon={Zap} />
        </div>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>{copy.minorHelp}</p>
        <Textarea label={copy.notesLabel} value={notes} onChange={setNotes} />
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <ButtonLink size="md" variant="ghost" to="/sessions">
            {copy.oneOffLink}
          </ButtonLink>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
          <h3 className={styles.summaryTitle} style={{ marginBottom: 0 }}>{copy.majorTitle}</h3>
          <Chip label={copy.majorBadge} variant="pending" icon={Hourglass} />
        </div>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>{copy.majorHelp}</p>
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <Select
            label={copy.fields.frequency}
            value={frequency ?? ''}
            onChange={(value) => setFrequency(value as Frequency)}
            options={(['hebdo', 'bihebdo', 'bimensuel', 'mensuel', 'ponctuel'] as Frequency[]).map((f) => ({
              value: f,
              label: fr.frequency[f],
            }))}
          />
          <RadioGroup<SessionType>
            legend={copy.fields.sessionType}
            value={sessionType}
            onChange={setSessionType}
            options={[
              { value: 'collective', label: fr.sessionTypes.collective },
              { value: 'individuelle', label: fr.sessionTypes.individuelle },
            ]}
          />
          <div style={{ display: 'grid', gap: 'var(--space-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <DatePicker
              label={fr.contracts.card.start}
              value={startDate}
              onChange={setStartDate}
            />
            <DatePicker
              label={fr.contracts.card.end}
              value={endDate}
              onChange={setEndDate}
              min={startDate ?? undefined}
            />
          </div>
        </div>
      </section>
    </>
  );

  const stepRecap = (
    <>
      <h3 className={styles.summaryTitle}>{copy.recapTitle}</h3>
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}
      {!hasChanges && <InlineAlert variant="info" title={copy.noChanges} />}
      {minorChanged && (
        <div>
          <p className={styles.summaryLabel}>{copy.changesMinor}</p>
          <p>
            {copy.fields.notes} : {notes || '—'}
          </p>
        </div>
      )}
      {majorChanges.length > 0 && (
        <>
          <div>
            <p className={styles.summaryLabel}>{copy.changesMajor}</p>
            <ul className={styles.consequences}>
              {majorChanges.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </div>
          <InlineAlert variant="info">{copy.majorAlert}</InlineAlert>
        </>
      )}
    </>
  );

  return (
    <>
      <PageHeader
        title={title}
        crumbs={[
          { label: fr.contracts.title, to: '/contrats' },
          { label: fr.contracts.detail.title(contract.reference), to: `/contrats/${id}` },
          { label: copy.title },
        ]}
        intro={copy.intro}
      />
      <Wizard
        steps={[
          { id: 'edit', title: capitalize(copy.title.toLowerCase()) },
          { id: 'recap', title: copy.recapTitle },
        ]}
        current={step}
        onBack={step > 0 ? () => setStep(0) : undefined}
        onNext={() => {
          if (step === 0) setStep(1);
          else void submit();
        }}
        nextLabel={step === 0 ? fr.contracts.wizard.next : copy.submit}
        nextDisabled={step === 1 && !hasChanges}
        nextDisabledReason={step === 1 && !hasChanges ? copy.noChanges : undefined}
        busy={busy}
      >
        {step === 0 ? stepEdit : stepRecap}
      </Wizard>
    </>
  );
}
