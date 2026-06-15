import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, Send } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPhone } from '@/lib/format';
import { Button, InlineAlert, PageHeader, Select, Textarea, TextField } from '@/components';
import styles from './ContactScreen.module.css';

/** Nous contacter — coordonnées DS + formulaire posés à plat (plus de cadre).
 *  Type de demande, objet et canal de réponse se préremplissent depuis les factures
 *  en retard (BILL-01), le report de séance (SESS-12) et la non-reconduction (CON-16) ;
 *  l'identité vient de la session authentifiée. */
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
          : '';
  const prefillType =
    prefillKey === 'annulation'
      ? 'planning'
      : prefillKey === 'facture'
        ? 'facturation'
        : prefillKey === 'rappel'
          ? 'contrat'
          : '';
  // « Demande de rappel » (CON-16) → canal téléphone présélectionné.
  const prefillReply = prefillKey === 'rappel' ? 'telephone' : 'email';

  const [requestType, setRequestType] = useState(prefillType);
  const [subject, setSubject] = useState(prefillSubject);
  const [message, setMessage] = useState(
    contractRef ? `${fr.contracts.detail.title(contractRef)} : ` : '',
  );
  const [replyPreference, setReplyPreference] = useState(prefillReply);
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
      await api.sendSupportMessage({
        subject: subject.trim(),
        message: message.trim(),
        by: user ? `${user.firstName} ${user.lastName}` : '',
        requestType: requestType || undefined,
        replyPreference,
      });
      showToast({ message: fr.support.success });
      setSubject('');
      setMessage('');
      setRequestType('');
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
        {/* Coordonnées DS — email + téléphone sur une seule ligne */}
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
              <a
                className={styles.methodValue}
                href={`tel:${fr.support.dsPhone.replace(/\s/g, '')}`}
              >
                {formatPhone(fr.support.dsPhone)}
              </a>
            </span>
          </li>
        </ul>

        {/* Formulaire — écrivez-nous */}
        {failed && <InlineAlert variant="danger" title={fr.common.genericError} autoFocus />}
        <form onSubmit={submit} noValidate className={styles.form}>
          {user && (
            <p className={styles.sendingAs}>
              {fr.support.sendingAs(`${user.firstName} ${user.lastName}`, user.email)}
            </p>
          )}
          <Select
            label={fr.support.requestType}
            value={requestType}
            onChange={setRequestType}
            placeholder={fr.support.requestTypePlaceholder}
            options={[
              { value: 'facturation', label: fr.support.requestTypes.facturation },
              { value: 'planning', label: fr.support.requestTypes.planning },
              { value: 'contrat', label: fr.support.requestTypes.contrat },
              { value: 'compte', label: fr.support.requestTypes.compte },
              { value: 'autre', label: fr.support.requestTypes.autre },
            ]}
          />
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
          <Select
            label={fr.support.replyPreference}
            value={replyPreference}
            onChange={setReplyPreference}
            options={[
              { value: 'email', label: fr.support.replyPreferences.email },
              { value: 'telephone', label: fr.support.replyPreferences.telephone },
            ]}
          />
          <div className={styles.submit}>
            <Button type="submit" variant="primary" icon={Send} loading={busy}>
              {fr.support.submit}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
