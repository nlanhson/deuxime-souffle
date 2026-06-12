import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { capitalize, formatDate, formatTime, formatWeekdayDate } from '@/lib/format';
import { Button, Chip, EmptyState, InlineAlert, Modal, SkeletonGroup, SkeletonRows } from '@/components';
import type { PostponeOption, Session } from '@/types/models';
import forms from '@/components/forms.module.css';
import styles from './sessions.module.css';

interface PostponeModalProps {
  open: boolean;
  onClose: () => void;
  session: Session;
}

/** SESS-12 — reporter (jamais annuler) : dates proposées groupées, une
 *  recommandée, note d'annulation obligatoire, Annuler possible après coup. */
export function PostponeModal({ open, onClose, session }: PostponeModalProps) {
  const fr = useStrings();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const options = useAsync(
    () => (open ? api.getPostponeOptions(session.id) : Promise.resolve([])),
    [open, session.id],
  );

  const byHorizon = (horizon: PostponeOption['horizon']) =>
    (options.data ?? []).filter((o) => o.horizon === horizon);

  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  const confirm = async () => {
    const option = options.data?.find((o) => o.id === selectedId);
    if (!option) return;
    setBusy(true);
    setFailed(false);
    try {
      const prev = await api.postponeSession(session.id, option, userName);
      onClose();
      showToast({
        message: fr.sessions.postpone.success(formatDate(option.date), formatTime(option.time)),
        action: {
          label: fr.sessions.postpone.undo,
          run: () => {
            void api.restoreSession(session.id, prev, userName).then(() => {
              showToast({ message: fr.sessions.postpone.undone, kind: 'neutral' });
            });
          },
        },
      });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const OptionRow = ({ option }: { option: PostponeOption }) => (
    <label className={styles.option} data-checked={selectedId === option.id}>
      <input
        type="radio"
        className={forms.srInput}
        name="postpone-option"
        checked={selectedId === option.id}
        onChange={() => setSelectedId(option.id)}
      />
      <span className={`${forms.box} ${forms.round}`} aria-hidden>
        <span className={styles.radioDot} />
      </span>
      <span className={styles.optionLabel}>
        {capitalize(formatWeekdayDate(option.date))} · {formatTime(option.time)}
      </span>
      {option.recommended && (
        <Chip label={fr.sessions.postpone.recommended} variant="progress" icon={BadgeCheck} />
      )}
    </label>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fr.sessions.postpone.title}
      footer={
        options.data && options.data.length > 0 ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              {fr.common.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={confirm}
              loading={busy}
              disabled={selectedId === null}
              disabledReason={selectedId === null ? fr.contracts.wizard.slots.slotError : undefined}
            >
              {fr.sessions.postpone.confirm}
            </Button>
          </>
        ) : undefined
      }
    >
      <p>{fr.sessions.postpone.intro}</p>
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}

      {options.loading && (
        <SkeletonGroup>
          <SkeletonRows rows={4} height={52} />
        </SkeletonGroup>
      )}
      {options.error && (
        <EmptyState variant="error" title={fr.common.loadError} onRetry={options.retry} />
      )}
      {options.data && options.data.length === 0 && !options.loading && (
        <EmptyState
          title={fr.sessions.postpone.empty}
          action={
            <Button
              onClick={() => {
                onClose();
                navigate('/contact?sujet=annulation');
              }}
            >
              {fr.sessions.postpone.contactDs}
            </Button>
          }
        />
      )}

      {options.data && options.data.length > 0 && (
        <fieldset className={styles.optionGroup}>
          <legend className="sr-only">{fr.sessions.postpone.chooseSlot}</legend>
          {byHorizon('deux_semaines').length > 0 && (
            <>
              <p className={styles.optionHorizon}>{fr.sessions.postpone.withinTwoWeeks}</p>
              {byHorizon('deux_semaines').map((option) => (
                <OptionRow key={option.id} option={option} />
              ))}
            </>
          )}
          {byHorizon('deux_a_six_semaines').length > 0 && (
            <>
              <p className={styles.optionHorizon}>{fr.sessions.postpone.twoToSix}</p>
              {byHorizon('deux_a_six_semaines').map((option) => (
                <OptionRow key={option.id} option={option} />
              ))}
            </>
          )}
        </fieldset>
      )}

      <InlineAlert variant="info">{fr.sessions.postpone.cancellationNote}</InlineAlert>
    </Modal>
  );
}
