import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, Send } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPhone } from '@/lib/format';
import { Button, InlineAlert, PageHeader, Textarea, TextField } from '@/components';
import styles from './ContactScreen.module.css';

/** Nous contacter — en-tête de page standard puis panneau à deux colonnes
 *  (coordonnées DS à gauche, formulaire à droite), habillé aux jetons DS.
 *  Le sujet est préremplissable depuis les factures en retard, l'annulation
 *  SESS-12 et le rappel CON-16 ; l'identité vient de la session authentifiée. */
export default function ContactScreen() {
  const fr = useStrings();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [params] = useSearchParams();

  const prefillKey = params.get('sujet');
  const contractRef = params.get('contrat');
  const prefillSubject =
    prefillKey === 'annulation'
      ? fr.support.prefills.cancellation
      : prefillKey === 'facture'
        ? fr.support.prefills.overdue
        : prefillKey === 'rappel'
          ? fr.support.prefills.callback
          : prefillKey === 'invitation'
            ? fr.support.prefills.invitation
            : '';

  const [subject, setSubject] = useState(prefillSubject);
  const [message, setMessage] = useState(contractRef ? `${fr.contracts.detail.title(contractRef)} — ` : '');
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const subjectOk = subject.trim() !== '';
    const messageOk = message.trim() !== '';
    setSubjectError(subjectOk ? null : fr.support.subjectRequired);
    setMessageError(messageOk ? null : fr.support.messageRequired);
    if (!subjectOk || !messageOk) return;
    setBusy(true);
    setFailed(false);
    try {
      await api.sendSupportMessage(
        subject.trim(),
        message.trim(),
        user ? `${user.firstName} ${user.lastName}` : '',
      );
      showToast({ message: fr.support.success });
      setSubject('');
      setMessage('');
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={fr.support.title} intro={fr.support.intro} />
      <div className={styles.panel}>
        <div className={styles.grid}>
          {/* Colonne info — coordonnées DS */}
          <div className={styles.info}>
            <ul className={styles.methods}>
              <li className={styles.method}>
                <span className={styles.badge} aria-hidden>
                  <Mail />
                </span>
                <span className={styles.methodText}>
                  <span className={styles.methodLabel}>{fr.support.email}</span>
                  <a className={styles.methodValue} href={`mailto:${fr.support.dsEmail}`}>
                    {fr.support.dsEmail}
                  </a>
                </span>
              </li>
              <li className={styles.method}>
                <span className={styles.badge} aria-hidden>
                  <Phone />
                </span>
                <span className={styles.methodText}>
                  <span className={styles.methodLabel}>{fr.support.phone}</span>
                  <a className={styles.methodValue} href={`tel:${fr.support.dsPhone.replace(/\s/g, '')}`}>
                    {formatPhone(fr.support.dsPhone)}
                  </a>
                </span>
              </li>
            </ul>
          </div>

          {/* Colonne formulaire — écrivez-nous */}
          <div className={styles.formCol}>
            {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}
            <form onSubmit={submit} noValidate className={styles.form}>
              <TextField
                label={fr.support.subject}
                value={subject}
                onChange={(value) => {
                  setSubject(value);
                  if (subjectError) setSubjectError(null);
                }}
                onBlur={() => setSubjectError(subject.trim() ? null : fr.support.subjectRequired)}
                error={subjectError}
                required
              />
              <Textarea
                label={fr.support.message}
                value={message}
                onChange={(value) => {
                  setMessage(value);
                  if (messageError) setMessageError(null);
                }}
                onBlur={() => setMessageError(message.trim() ? null : fr.support.messageRequired)}
                error={messageError}
                required
                rows={5}
              />
              <div className={styles.submit}>
                <Button type="submit" variant="primary" icon={Send} loading={busy}>
                  {fr.support.submit}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
