import type { LucideIcon } from 'lucide-react';
import { Ban, CalendarClock, Clock3, FileText, Pencil, Star, Timer } from 'lucide-react';
import { useStrings } from '@/i18n';
import {
  capitalize,
  formatDuration,
  formatTime,
  formatTimestamp,
  formatWeekdayDate,
  toIso,
} from '@/lib/format';
import { sessionStatusChip, unitLabel } from '@/lib/status';
import { eventText } from '@/lib/labels';
import {
  Avatar,
  Button,
  ButtonLink,
  Chip,
  InlineAlert,
  RatingDisplay,
  StatusChip,
} from '@/components';
import type { Coach, Session, SessionEvent } from '@/types/models';
import styles from './sessions.module.css';

const EVENT_ICONS: Record<SessionEvent['kind'], LucideIcon> = {
  retard: Timer,
  report: Clock3,
  modification: Pencil,
  annulation: Ban,
  rapport_remis: FileText,
  evaluation: Star,
};

interface SessionDetailBodyProps {
  session: Session;
  coach: Coach | null;
  /** Ouvre le rapport du coach (modale propre au contexte : page détail ou aperçu). */
  onSeeReport: () => void;
  /** Ouvre le report de séance (idem). */
  onPostpone: () => void;
  /** Niveau des intertitres de section, selon le contexte de rendu : `h2` sous le
   *  `h1` de la page détail (défaut), `h3` dans l'aperçu modal (sous le `h2` du
   *  dialogue) — pour garder une arborescence de titres sans saut ni collision. */
  headingLevel?: 'h2' | 'h3' | undefined;
}

/** Corps de la fiche séance — partagé par la page détail (SESS-09) et l'aperçu
 *  modal. Présentationnel : reçoit la séance déjà chargée et délègue les actions
 *  « rapport » / « reporter » à l'appelant.
 *
 *  Mise en page « deux zones » sans cadres imbriqués (le dialogue EST le cadre) :
 *  Zone 1 = en-tête sans bordure (gros titre date·heure + méta + coach), close par
 *  un filet ; Zone 2 = les faits, en sections séparées par des filets, jamais en
 *  cartes. Une séance à venir sans données ne montre qu'une ligne calme + le journal. */
export function SessionDetailBody({
  session,
  coach,
  onSeeReport,
  onPostpone,
  headingLevel = 'h2',
}: SessionDetailBodyProps) {
  const fr = useStrings();
  // Tag d'intertitre dynamique (h2 page / h3 modal) — variable capitalisée pour
  // que JSX la traite comme un élément et non comme une balise littérale.
  const SectionHeading = headingLevel;

  const todayIso = toIso(new Date());
  const isFuture = session.date > todayIso && session.status !== 'annulee' && session.status !== 'terminee';
  const canEdit = isFuture && session.coachId === null;
  const canPostpone = isFuture;
  const canEvaluate = session.status === 'terminee' && !session.evaluation;

  const events = [...session.events].sort((a, b) => b.at.localeCompare(a.at));

  // Séance à venir, encore vide : pas deux sections fantômes — une ligne calme
  // suffit, et le journal (seul contenu réel) prend la tête.
  const isUpcomingEmpty = isFuture && !session.report && !session.evaluation && !canEvaluate;

  const coachMessageSection = session.coachMessage ? (
    <section className={styles.section}>
      <SectionHeading className={styles.sectionLabel}>{fr.sessions.detail.coachMessageTitle}</SectionHeading>
      <p>« {session.coachMessage} »</p>
    </section>
  ) : null;

  const journalSection = (
    <section className={styles.section}>
      <SectionHeading className={styles.sectionLabel}>{fr.sessions.detail.journalTitle}</SectionHeading>
      {events.length === 0 ? (
        <p className={styles.emptyLine}>{fr.sessions.detail.journalEmpty}</p>
      ) : (
        <ul className={styles.journal}>
          {events.map((event) => {
            const Icon = EVENT_ICONS[event.kind] ?? CalendarClock;
            return (
              <li key={event.id} className={styles.journalItem}>
                <Icon className={styles.journalIcon} aria-hidden />
                <span className={styles.journalText}>
                  {eventText(fr, event)}
                  <span className={styles.journalWhen}>{formatTimestamp(event.at)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  return (
    <>
      {/* Zone 1 — en-tête sans cadre : la date·heure est le seul gros titre.
          Un <div> (et non <header>) : un <header> serait un repère « banner »
          parasite à l'intérieur du dialogue. */}
      <div className={styles.detailHeader}>
        <div className={styles.headerMain}>
          <p className={styles.headerDate}>
            {capitalize(formatWeekdayDate(session.date))} · {formatTime(session.time)}
          </p>
          <div className={styles.headerMeta}>
            <span>
              {fr.sessions.detail.duration} : {formatDuration(session.durationMin)}
            </span>
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
      </div>

      {session.isFirstTogether && (
        <InlineAlert variant="success" title={fr.sessions.detail.firstTogether} />
      )}

      <div className={styles.actionsRow}>
        <Button icon={FileText} onClick={onSeeReport}>
          {fr.sessions.detail.seeReport}
        </Button>
        {canEdit && (
          <ButtonLink icon={Pencil} to={`/sessions/${session.id}/modifier`}>
            {fr.sessions.detail.editSession}
          </ButtonLink>
        )}
        {canPostpone && (
          <Button icon={Clock3} onClick={onPostpone}>
            {fr.sessions.detail.postpone}
          </Button>
        )}
        {canEvaluate && (
          <ButtonLink variant="primary" icon={Star} to={`/evaluations/${session.id}`}>
            {fr.sessions.detail.evaluate}
          </ButtonLink>
        )}
      </div>

      {/* Zone 2 — les faits, en sections séparées par des filets (aucune carte). */}
      <div className={styles.sections}>
        {isUpcomingEmpty ? (
          <>
            <section className={styles.section}>
              <p className={styles.upcomingNote}>{fr.sessions.detail.upcomingNote}</p>
            </section>
            {coachMessageSection}
            {journalSection}
          </>
        ) : (
          <>
            <section className={styles.section}>
              <SectionHeading className={styles.sectionLabel}>{fr.sessions.detail.interventionTitle}</SectionHeading>
              {session.report ? (
                <div className={styles.stack}>
                  <dl className={styles.factList}>
                    <dt>{fr.sessions.report.participants}</dt>
                    <dd>{session.report.participantCount}</dd>
                    <dt>{fr.sessions.report.atmosphere}</dt>
                    <dd className={styles.atmosphere}>
                      {/* RatingDisplay émet déjà le texte « n sur 5 » en sr-only quand
                          showText=false — pas de second span pour éviter le doublon. */}
                      <RatingDisplay value={session.report.atmosphere.stars} showText={false} size="sm" />
                      <span aria-hidden>{session.report.atmosphere.emoji}</span>
                    </dd>
                    <dt>{fr.sessions.report.difficulties}</dt>
                    <dd>
                      {session.report.hadDifficulties ? fr.common.yes : fr.common.no}
                      {session.report.difficultiesNote ? ` — ${session.report.difficultiesNote}` : ''}
                    </dd>
                  </dl>
                  {session.report.evaluationSummary && <p>{session.report.evaluationSummary}</p>}
                </div>
              ) : (
                <p className={styles.emptyLine}>{fr.sessions.detail.interventionEmpty}</p>
              )}
            </section>

            <section className={styles.section}>
              <SectionHeading className={styles.sectionLabel}>{fr.sessions.detail.evaluationTitle}</SectionHeading>
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
              ) : (
                // Pas de second « Évaluer » ici : le CTA principal est déjà dans
                // la rangée d'actions (évite un doublon de lien même libellé/cible).
                <p className={styles.emptyLine}>{fr.sessions.detail.evaluationEmpty}</p>
              )}
            </section>

            {coachMessageSection}
            {journalSection}
          </>
        )}
      </div>
    </>
  );
}
