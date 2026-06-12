import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { toIso } from '@/lib/format';
import {
  Button,
  ButtonLink,
  CardSection,
  Checkbox,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  RadioGroup,
  Skeleton,
  SkeletonGroup,
  Textarea,
} from '@/components';
import styles from './contracts.module.css';

type Reason = 'budget' | 'reorganisation' | 'insatisfait' | 'fermeture' | 'autre';

/** CON-16 — non-reconduction en 3 étapes, volontairement freinée :
 *  « Finalement, je renouvelle » domine (bleu, large) à chaque étape ;
 *  la confirmation reste une action secondaire calme — jamais rouge. */
export default function NonRenewalScreen() {
  const fr = useStrings();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const copy = fr.contracts.nonRenewal;

  const state = useAsync(
    () => Promise.all([api.getContract(id), api.listSessions()]).then(([contract, sessions]) => ({ contract, sessions })),
    [id],
  );
  const contract = state.data?.contract ?? null;

  const [step, setStep] = useState(1);
  const [reason, setReason] = useState<Reason | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

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
          <Skeleton height={360} radius="var(--radius-xl)" />
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
        <EmptyState title={fr.common.notFound} body={fr.common.notFoundBody} action={<ButtonLink to="/contrats">{fr.common.back}</ButtonLink>} />
      </>
    );
  }

  const upcomingCount = (state.data?.sessions ?? []).filter(
    (s) => s.contractId === id && (s.status === 'a_venir' || s.status === 'reportee') && s.date >= toIso(new Date()),
  ).length;

  const renewInstead = (
    <Button variant="accent" icon={RefreshCw} onClick={() => navigate(`/contrats/${id}/renouveler`)}>
      {copy.renewInstead}
    </Button>
  );

  const confirm = async () => {
    if (!reason) return;
    setBusy(true);
    setFailed(false);
    try {
      await api.confirmNonRenewal(
        id,
        copy.reasons[reason],
        comment.trim(),
        user ? `${user.firstName} ${user.lastName}` : '',
      );
      showToast({ message: copy.success, kind: 'neutral' });
      navigate(`/contrats/${id}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  const crumbs = [
    { label: fr.contracts.title, to: '/contrats' },
    { label: fr.contracts.detail.title(contract.reference), to: `/contrats/${id}` },
    { label: copy.title },
  ];

  return (
    <>
      <PageHeader title={copy.title} crumbs={crumbs} />
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}

      {step === 1 && (
        <CardSection title={copy.step1Title}>
          <div className={styles.nrCard}>
            <p>{copy.step1Body(upcomingCount)}</p>
            <div className={styles.nrActions}>
              {renewInstead}
              <Button variant="ghost" onClick={() => setStep(2)}>
                {copy.continueAnyway}
              </Button>
            </div>
          </div>
        </CardSection>
      )}

      {step === 2 && (
        <CardSection title={copy.step2Title}>
          <div className={styles.nrCard}>
            <p style={{ marginBottom: 'var(--space-md)' }}>{copy.step2Body}</p>
            <RadioGroup<Reason>
              legend={copy.step2Title}
              value={reason}
              onChange={(value) => {
                setReason(value);
                setReasonError(null);
              }}
              error={reasonError}
              required
              options={[
                { value: 'budget', label: copy.reasons.budget },
                { value: 'reorganisation', label: copy.reasons.reorganisation },
                { value: 'insatisfait', label: copy.reasons.insatisfait },
                { value: 'fermeture', label: copy.reasons.fermeture },
                { value: 'autre', label: copy.reasons.autre },
              ]}
            />
            <div style={{ marginTop: 'var(--space-md)' }}>
              <Textarea label={copy.commentLabel} value={comment} onChange={setComment} />
            </div>
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <ButtonLink
                size="md"
                variant="ghost"
                to={`/contact?sujet=rappel&contrat=${contract.reference}`}
              >
                {copy.callback}
              </ButtonLink>
            </div>
            <div className={styles.nrActions}>
              {renewInstead}
              <Button
                variant="ghost"
                onClick={() => {
                  if (!reason) {
                    setReasonError(copy.reasonError);
                    return;
                  }
                  setStep(3);
                }}
              >
                {fr.common.confirm}
              </Button>
            </div>
          </div>
        </CardSection>
      )}

      {step === 3 && (
        <CardSection title={copy.step3Title}>
          <div className={styles.nrCard}>
            <p>{copy.step3Body}</p>
            <ul className={styles.consequences} style={{ margin: 'var(--space-md) 0' }}>
              <li>{copy.consequence1}</li>
              <li>{copy.consequence2}</li>
              <li>{copy.consequence3}</li>
            </ul>
            <Checkbox label={copy.understand} checked={understood} onChange={setUnderstood} />
            <div className={styles.nrActions}>
              {renewInstead}
              <Button
                variant="ghost"
                onClick={confirm}
                loading={busy}
                disabled={!understood}
                disabledReason={!understood ? copy.understand : undefined}
              >
                {copy.confirmFinal}
              </Button>
            </div>
          </div>
        </CardSection>
      )}
    </>
  );
}
