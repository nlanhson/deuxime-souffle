import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { capitalize, formatTime, formatTimestamp, formatWeekdayDate } from '@/lib/format';
import {
  Avatar,
  Button,
  ButtonLink,
  Card,
  CardSection,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  RadioGroup,
  RatingDisplay,
  RatingInput,
  Skeleton,
  SkeletonGroup,
  Textarea,
} from '@/components';
import type { Evaluation } from '@/types/models';
import styles from './evaluations.module.css';

type Impression = Evaluation['impression'];

/** SESS-13 — le flux « 3 gestes » : note → impression → envoi. Sans friction. */
export default function EvaluateScreen() {
  const fr = useStrings();
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const version = useDataVersion();

  const state = useAsync(
    () =>
      Promise.all([api.getSession(sessionId), api.listCoaches()]).then(([session, coaches]) => ({
        session,
        coaches,
      })),
    [sessionId, version],
  );

  const [stars, setStars] = useState<number | null>(null);
  const [impression, setImpression] = useState<Impression | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const crumbs = [{ label: fr.evaluations.title, to: '/evaluations' }, { label: fr.evaluations.form.title }];

  if (state.loading) {
    return (
      <>
        <PageHeader title={fr.evaluations.form.title} crumbs={crumbs} />
        <SkeletonGroup>
          <div className={styles.skeletonStack}>
            <Skeleton height={64} radius="var(--radius-lg)" />
            <Skeleton height={320} radius="var(--radius-lg)" />
          </div>
        </SkeletonGroup>
      </>
    );
  }

  if (state.error) {
    return (
      <>
        <PageHeader title={fr.evaluations.form.title} crumbs={crumbs} />
        <LoadError onRetry={state.retry} />
      </>
    );
  }

  const session = state.data?.session ?? null;
  if (!session) {
    return (
      <>
        <PageHeader title={fr.evaluations.form.title} crumbs={crumbs} />
        <EmptyState
          title={fr.sessions.notFound}
          body={fr.sessions.notFoundBody}
          action={<ButtonLink to="/evaluations">{fr.common.back}</ButtonLink>}
        />
      </>
    );
  }

  const coach = state.data?.coaches.find((c) => c.id === session.coachId);

  // Rappel compact (une ligne) : la carte d'évaluation reste le héros de l'écran.
  const sessionInfo = (
    <section className={styles.recap} aria-labelledby="eval-recap-heading">
      <h2 id="eval-recap-heading" className="sr-only">
        {fr.evaluations.form.sessionInfo}
      </h2>
      <div className={styles.recapRow}>
        {coach && <Avatar firstName={coach.firstName} lastName={coach.lastName} size="sm" decorative />}
        <p className={styles.recapDate}>
          {capitalize(formatWeekdayDate(session.date))} · {formatTime(session.time)}
        </p>
        {coach && (
          <span className={styles.recapCoach}>
            {coach.firstName} {coach.lastName}
          </span>
        )}
      </div>
      {session.isFirstTogether && (
        <InlineAlert variant="success" title={fr.sessions.detail.firstTogether} />
      )}
    </section>
  );

  // Déjà évaluée → lecture seule de l'évaluation envoyée
  if (session.evaluation) {
    return (
      <>
        <PageHeader title={fr.evaluations.form.title} crumbs={crumbs} />
        {sessionInfo}
        <InlineAlert variant="info" title={fr.evaluations.form.alreadyDone} />
        <CardSection title={fr.sessions.detail.evaluationTitle}>
          <div className={styles.stackSm}>
            <RatingDisplay value={session.evaluation.stars} />
            <p>{fr.evaluations.form.impressions[session.evaluation.impression]}</p>
            {session.evaluation.comment && <p>« {session.evaluation.comment} »</p>}
            <p className={styles.metaText}>
              {fr.evaluations.form.submittedOn(
                formatTimestamp(session.evaluation.submittedAt),
                session.evaluation.submittedBy,
              )}
            </p>
          </div>
        </CardSection>
        <div>
          <ButtonLink to="/evaluations">{fr.common.back}</ButtonLink>
        </div>
      </>
    );
  }

  // Non terminée → bloquée
  if (session.status !== 'terminee') {
    return (
      <>
        <PageHeader title={fr.evaluations.form.title} crumbs={crumbs} />
        {sessionInfo}
        <InlineAlert variant="info" title={fr.evaluations.form.notCompleted} />
        <div>
          <ButtonLink to={`/sessions/${session.id}`}>{fr.common.back}</ButtonLink>
        </div>
      </>
    );
  }

  const missingReason =
    stars === null
      ? fr.evaluations.form.missingStars
      : impression === null
        ? fr.evaluations.form.missingImpression
        : null;

  const submit = async () => {
    if (stars === null || impression === null) return;
    setBusy(true);
    setFailed(false);
    try {
      await api.submitEvaluation(
        sessionId,
        { stars, impression, ...(comment.trim() ? { comment: comment.trim() } : {}) },
        user ? `${user.firstName} ${user.lastName}` : '',
      );
      showToast({ message: fr.evaluations.form.success });
      navigate('/evaluations');
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={fr.evaluations.form.title} crumbs={crumbs} />
      {sessionInfo}
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} autoFocus />}

      {/* Titre de section (lecteurs d'écran) : rétablit la hiérarchie h1 → h2 entre
          le titre de page et les légendes de champ. */}
      <h2 className="sr-only">{fr.evaluations.form.heading}</h2>
      {/* Une seule carte : le flux « 3 gestes » se termine dans son contenant.
          Vrai <form> : structure sémantique (WCAG 1.3.1) + un seul chemin de soumission. */}
      <Card>
        <form
          className={styles.formCard}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          <RatingInput legend={fr.evaluations.form.starsLabel} value={stars} onChange={setStars} />
          <RadioGroup<Impression>
            legend={fr.evaluations.form.impressionLabel}
            value={impression}
            onChange={setImpression}
            appearance="card"
            options={[
              { value: 'tres_bien', label: fr.evaluations.form.impressions.tres_bien },
              { value: 'bien', label: fr.evaluations.form.impressions.bien },
              { value: 'correct', label: fr.evaluations.form.impressions.correct },
              { value: 'a_ameliorer', label: fr.evaluations.form.impressions.a_ameliorer },
            ]}
          />
          <Textarea
            label={fr.evaluations.form.commentLabel}
            value={comment}
            onChange={setComment}
            helper={fr.evaluations.form.commentHelper}
          />
          <div className={styles.submitRow}>
            <Button
              type="submit"
              variant="primary"
              loading={busy}
              disabled={missingReason !== null}
              disabledReason={missingReason ?? undefined}
            >
              {fr.evaluations.form.submit}
            </Button>
            {missingReason && (
              <p className={styles.submitHint} aria-live="polite">
                {missingReason}
              </p>
            )}
          </div>
        </form>
      </Card>
    </>
  );
}
