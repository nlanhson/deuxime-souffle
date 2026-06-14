import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useStrings } from '@/i18n';
import { formatDate } from '@/lib/format';
import { Modal } from '@/components';
import type { Coach, Session } from '@/types/models';
import { SessionDetailBody } from './SessionDetailBody';
import styles from './sessions.module.css';

interface SessionPeekModalProps {
  open: boolean;
  session: Session | null;
  coach: Coach | null;
  onClose: () => void;
  /** Bascule vers le rapport du coach (l'appelant échange les modales). */
  onSeeReport: () => void;
  /** Bascule vers le report de séance (idem). */
  onPostpone: () => void;
}

/** Aperçu de séance type Google Agenda : un clic sur une séance du calendrier
 *  de l'accueil ouvre ce grand dialogue avec toute la fiche, sans changer de
 *  page. « Voir la fiche complète » reste l'échappatoire vers la page dédiée. */
export function SessionPeekModal({
  open,
  session,
  coach,
  onClose,
  onSeeReport,
  onPostpone,
}: SessionPeekModalProps) {
  const fr = useStrings();
  if (!session) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fr.sessions.detail.title(formatDate(session.date))}
      large
      quietTitle
      footer={
        <Link to={`/sessions/${session.id}`} className={styles.fullLink}>
          <span className={styles.fullLinkText}>{fr.sessions.detail.openFull}</span>
          <ArrowUpRight className={styles.fullLinkIcon} aria-hidden />
        </Link>
      }
    >
      <SessionDetailBody
        session={session}
        coach={coach}
        onSeeReport={onSeeReport}
        onPostpone={onPostpone}
        headingLevel="h3"
      />
    </Modal>
  );
}
