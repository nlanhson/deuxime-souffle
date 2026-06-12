import { useState } from 'react';
import { OctagonX, Pencil, Plus, UserCheck } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { formatPhone, formatSince } from '@/lib/format';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  EmptyState,
  InlineAlert,
  LoadError,
  Modal,
  MultiSelect,
  PageHeader,
  SegmentedControl,
  Select,
  SkeletonCards,
  SkeletonGroup,
  TextField,
} from '@/components';
import type { Contact, ContactRole } from '@/types/models';
import styles from './contacts.module.css';

const TWO_MONTHS_MS = 1000 * 60 * 60 * 24 * 61;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

let newContactSeq = 0;

/** AUTH-21 — gestion des contacts : cartes, rôles multiples, suppression avec
 *  confirmation, horloge de fraîcheur bimestrielle. Écriture réservée à l'Admin. */
export default function ContactsScreen() {
  const fr = useStrings();
  const ROLE_OPTIONS = (Object.keys(fr.contactRoles) as ContactRole[]).map((role) => ({
    value: role,
    label: fr.contactRoles[role],
  }));
  const version = useDataVersion();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const state = useAsync(
    () =>
      Promise.all([api.listContacts(), api.getContactsLastConfirmed()]).then(
        ([contacts, lastConfirmed]) => ({ contacts, lastConfirmed }),
      ),
    [version],
  );

  const [draft, setDraft] = useState<Contact | null>(null);
  const [draftErrors, setDraftErrors] = useState<Record<string, string | null>>({});
  const [deleting, setDeleting] = useState<Contact | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const gateReason = isAdmin ? undefined : fr.common.adminOnly;
  const stale =
    state.data !== null &&
    Date.now() - new Date(state.data.lastConfirmed).getTime() > TWO_MONTHS_MS;

  const startNew = () => {
    setDraftErrors({});
    setDraft({
      id: `c-nouveau-${(newContactSeq += 1)}`,
      civility: 'Mme',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      type: 'additionnel',
      isSessionCoordinator: false,
      roles: [],
    });
  };

  const saveDraft = async () => {
    if (!draft) return;
    const errors: Record<string, string | null> = {
      firstName: draft.firstName.trim() ? null : fr.common.requiredField,
      lastName: draft.lastName.trim() ? null : fr.common.requiredField,
      email: draft.email.trim()
        ? EMAIL_RE.test(draft.email.trim())
          ? null
          : fr.auth.forgot.emailInvalid
        : fr.common.requiredField,
      phone: draft.phone.trim() ? null : fr.common.requiredField,
    };
    setDraftErrors(errors);
    if (Object.values(errors).some((e) => e !== null)) return;
    setBusy(true);
    setFailed(false);
    try {
      await api.upsertContact(draft);
      showToast({ message: fr.contactsPage.saved });
      setDraft(null);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteContact(deleting.id);
      showToast({ message: fr.contactsPage.deleted, kind: 'neutral' });
      setDeleting(null);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const confirmFresh = () => {
    void api.confirmContactsFresh().then(() => {
      showToast({ message: fr.contactsPage.confirmedFresh });
    });
  };

  const editForm = (contact: Contact) => (
    <div className={styles.form}>
      <SegmentedControl
        label={fr.contactsPage.civility}
        value={contact.civility}
        onChange={(civility) => setDraft({ ...contact, civility })}
        options={[
          { value: 'M', label: fr.civility.M },
          { value: 'Mme', label: fr.civility.Mme },
          { value: 'Mlle', label: fr.civility.Mlle },
        ]}
      />
      <div className={styles.formGrid}>
        <TextField
          label={fr.contactsPage.firstName}
          value={contact.firstName}
          onChange={(firstName) => setDraft({ ...contact, firstName })}
          error={draftErrors.firstName ?? null}
          required
        />
        <TextField
          label={fr.contactsPage.lastName}
          value={contact.lastName}
          onChange={(lastName) => setDraft({ ...contact, lastName })}
          error={draftErrors.lastName ?? null}
          required
        />
        <TextField
          label={fr.contactsPage.email}
          type="email"
          value={contact.email}
          onChange={(email) => setDraft({ ...contact, email })}
          error={draftErrors.email ?? null}
          required
        />
        <TextField
          label={fr.contactsPage.phone}
          type="tel"
          inputMode="tel"
          value={contact.phone}
          onChange={(phone) => setDraft({ ...contact, phone })}
          error={draftErrors.phone ?? null}
          required
        />
      </div>
      <Select
        label={fr.contactsPage.type}
        value={contact.type}
        onChange={(type) => setDraft({ ...contact, type: type as Contact['type'] })}
        options={[
          { value: 'principal', label: fr.contactsPage.types.principal },
          { value: 'additionnel', label: fr.contactsPage.types.additionnel },
        ]}
      />
      <Checkbox
        label={fr.contactsPage.coordinator}
        checked={contact.isSessionCoordinator}
        onChange={(isSessionCoordinator) => setDraft({ ...contact, isSessionCoordinator })}
      />
      <MultiSelect
        label={fr.contactsPage.rolesLabel}
        values={contact.roles}
        onChange={(roles) => setDraft({ ...contact, roles: roles as ContactRole[] })}
        options={ROLE_OPTIONS}
      />
      {contact.roles.includes('autre') && (
        <TextField
          label={fr.contactsPage.otherRole}
          value={contact.otherRoleLabel ?? ''}
          onChange={(otherRoleLabel) => setDraft({ ...contact, otherRoleLabel })}
        />
      )}
      <div className={styles.formActions}>
        <Button variant="ghost" onClick={() => setDraft(null)}>
          {fr.common.cancel}
        </Button>
        <Button variant="primary" onClick={() => void saveDraft()} loading={busy}>
          {fr.contactsPage.save}
        </Button>
      </div>
    </div>
  );

  const contactCard = (contact: Contact) => {
    if (draft && draft.id === contact.id) {
      return (
        <Card key={contact.id} className={styles.card}>
          {editForm(draft)}
        </Card>
      );
    }
    return (
      <Card key={contact.id} className={styles.card}>
        <div className={styles.cardHead}>
          <Avatar firstName={contact.firstName} lastName={contact.lastName} decorative />
          <div className={styles.identity}>
            <p className={styles.name}>
              {fr.civility[contact.civility]} {contact.firstName} {contact.lastName}
            </p>
            <p className={styles.meta}>{fr.contactsPage.types[contact.type]}</p>
          </div>
        </div>
        <p className={styles.line}>{contact.email}</p>
        <p className={styles.line}>{formatPhone(contact.phone)}</p>
        <div className={styles.chips}>
          {contact.isSessionCoordinator && (
            <Chip label={fr.contactsPage.coordinator} variant="info" icon={UserCheck} />
          )}
          {contact.roles.map((role) => (
            <Chip
              key={role}
              label={role === 'autre' && contact.otherRoleLabel ? contact.otherRoleLabel : fr.contactRoles[role]}
              variant="neutral"
            />
          ))}
        </div>
        {contact.account && (
          <p className={styles.meta}>
            {contact.account.active ? fr.contactsPage.hasAccount : fr.contactsPage.accountInactive}
          </p>
        )}
        <div className={styles.cardActions}>
          <Button
            size="md"
            icon={Pencil}
            disabled={!isAdmin}
            disabledReason={gateReason}
            onClick={() => {
              setDraftErrors({});
              setDraft({ ...contact });
            }}
          >
            {fr.common.edit}
          </Button>
          <Button
            size="md"
            variant="danger"
            icon={OctagonX}
            disabled={!isAdmin || contact.type === 'principal'}
            disabledReason={
              !isAdmin ? gateReason : contact.type === 'principal' ? fr.contactsPage.cannotDeletePrincipal : undefined
            }
            onClick={() => setDeleting(contact)}
          >
            {fr.common.delete}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <>
      <PageHeader
        title={fr.contactsPage.title}
        intro={fr.contactsPage.intro}
        actions={
          <Button
            variant="primary"
            icon={Plus}
            disabled={!isAdmin || draft !== null}
            disabledReason={gateReason}
            onClick={startNew}
          >
            {fr.contactsPage.addContact}
          </Button>
        }
      />

      {!isAdmin && <InlineAlert variant="info">{fr.common.adminOnlyBody}</InlineAlert>}
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}

      {state.data && isAdmin && stale && (
        <InlineAlert
          variant="info"
          title={fr.contactsPage.refreshNudge(formatSince(state.data.lastConfirmed))}
          action={
            <Button size="md" onClick={confirmFresh}>
              {fr.contactsPage.confirmFresh}
            </Button>
          }
        />
      )}
      {state.data && !stale && (
        <InlineAlert variant="success" title={fr.contactsPage.upToDate} />
      )}

      {state.loading && (
        <SkeletonGroup>
          <SkeletonCards count={3} height={260} />
        </SkeletonGroup>
      )}
      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && state.data.contacts.length === 0 && !draft && (
        <EmptyState
          title={fr.contactsPage.empty}
          body={fr.contactsPage.emptyBody}
          action={
            <Button variant="primary" disabled={!isAdmin} disabledReason={gateReason} onClick={startNew}>
              {fr.contactsPage.addContact}
            </Button>
          }
        />
      )}

      {state.data && (state.data.contacts.length > 0 || draft) && (
        <div className={styles.grid}>
          {state.data.contacts.map(contactCard)}
          {draft && !state.data.contacts.some((c) => c.id === draft.id) && (
            <Card className={styles.card}>{editForm(draft)}</Card>
          )}
        </div>
      )}

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={fr.contactsPage.deleteTitle}
        destructive
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              {fr.common.cancel}
            </Button>
            <Button variant="danger" icon={OctagonX} onClick={() => void confirmDelete()} loading={busy}>
              {fr.contactsPage.deleteConfirm}
            </Button>
          </>
        }
      >
        {deleting && (
          <p>{fr.contactsPage.deleteBody(`${deleting.firstName} ${deleting.lastName}`)}</p>
        )}
      </Modal>
    </>
  );
}
