import { useNavigate } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { useStrings } from '@/i18n';
import { downloadStub } from '@/lib/pdf';
import { capitalize, formatDate, formatDuration, formatTime } from '@/lib/format';
import { Button, EmptyState, InlineAlert, Modal, RatingDisplay } from '@/components';
import type { Coach, Session } from '@/types/models';
import styles from './sessions.module.css';

interface CoachReportModalProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  coach: Coach | null;
  sessionTypeLabel: string;
  /** Masquer « Rapport de séance » quand on est déjà sur le détail. */
  hideOpenSession?: boolean | undefined;
}

/** SESS-04 — modale « Rapport du coach » + téléchargement PDF (simulé). */
export function CoachReportModal({
  open,
  onClose,
  session,
  coach,
  sessionTypeLabel,
  hideOpenSession,
}: CoachReportModalProps) {
  const fr = useStrings();
  const navigate = useNavigate();
  if (!session) return null;

  const report = session.report;
  const coachName = coach ? `${coach.firstName} ${coach.lastName}` : fr.calendar.unassigned;

  const downloadPdf = () => {
    if (!report) return;
    // STUB: PDF une page généré côté client
    downloadStub(
      fr.sessions.report.pdfName(coach?.lastName ?? 'coach', session.date),
      `${fr.sessions.report.title} : ${coachName}`,
      [
        `${fr.sessions.report.date} : ${formatDate(session.date)}`,
        `${fr.sessions.report.time} : ${formatTime(session.time)}`,
        `${fr.sessions.report.duration} : ${formatDuration(session.durationMin)}`,
        `${fr.sessions.report.type} : ${sessionTypeLabel}`,
        `${fr.sessions.report.participants} : ${report.participantCount}`,
        `${fr.sessions.report.atmosphere} : ${report.atmosphere.stars}/5 ${report.atmosphere.emoji}`,
        `${fr.sessions.report.difficulties} : ${report.hadDifficulties ? fr.common.yes : fr.common.no}`,
        ...(report.difficultiesNote ? [report.difficultiesNote] : []),
        `${fr.sessions.report.evaluationSummary} : ${report.evaluationSummary}`,
      ],
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fr.sessions.report.title}
      footer={
        report ? (
          <>
            {!hideOpenSession && (
              <Button
                variant="ghost"
                icon={FileText}
                onClick={() => {
                  onClose();
                  navigate(`/sessions/${session.id}`);
                }}
              >
                {fr.sessions.report.openSession}
              </Button>
            )}
            <Button icon={Download} onClick={downloadPdf}>
              {fr.sessions.report.downloadPdf}
            </Button>
          </>
        ) : undefined
      }
    >
      {!report ? (
        <EmptyState
          title={fr.sessions.report.notSubmitted}
          body={fr.sessions.report.notSubmittedBody}
        />
      ) : (
        <>
          {session.isFirstTogether && (
            <InlineAlert variant="info" title={fr.sessions.detail.firstTogether} />
          )}
          <dl className={styles.reportGrid}>
            <div>
              <dt>{fr.sessions.report.coach}</dt>
              <dd>{coachName}</dd>
            </div>
            <div>
              <dt>{fr.sessions.report.date}</dt>
              <dd>{capitalize(formatDate(session.date))}</dd>
            </div>
            <div>
              <dt>{fr.sessions.report.time}</dt>
              <dd>{formatTime(session.time)}</dd>
            </div>
            <div>
              <dt>{fr.sessions.report.duration}</dt>
              <dd>{formatDuration(session.durationMin)}</dd>
            </div>
            <div>
              <dt>{fr.sessions.report.type}</dt>
              <dd>{sessionTypeLabel}</dd>
            </div>
            <div>
              <dt>{fr.sessions.report.participants}</dt>
              <dd>{report.participantCount}</dd>
            </div>
          </dl>

          <div>
            <p className={styles.reportLabel}>{fr.sessions.report.atmosphere}</p>
            <p className={styles.atmosphere}>
              <RatingDisplay value={report.atmosphere.stars} showText={false} />
              <span aria-hidden>{report.atmosphere.emoji}</span>
              <span>{fr.sessions.report.atmosphereValue(report.atmosphere.stars)}</span>
            </p>
          </div>

          <div>
            <p className={styles.reportLabel}>{fr.sessions.report.difficulties}</p>
            <p>
              {report.hadDifficulties ? fr.common.yes : fr.common.no}
              {report.difficultiesNote ? `. ${report.difficultiesNote}` : ''}
            </p>
          </div>

          <div>
            <p className={styles.reportLabel}>{fr.sessions.report.evaluationSummary}</p>
            <p>{report.evaluationSummary}</p>
          </div>
        </>
      )}
    </Modal>
  );
}
