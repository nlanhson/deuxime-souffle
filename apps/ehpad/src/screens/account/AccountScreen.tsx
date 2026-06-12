import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import {
  Button,
  CardSection,
  Checkbox,
  Chip,
  InlineAlert,
  LoadError,
  Modal,
  MultiSelect,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  Textarea,
  TextField,
} from '@/components';
import type { ContactRole } from '@/types/models';
import styles from './account.module.css';

/** AUTH-11 (compte propre) + AUTH-14 (demande de suppression — jamais directe). */
export default function AccountScreen() {
  const fr = useStrings();
  const ROLE_OPTIONS = (Object.keys(fr.contactRoles) as ContactRole[]).map((role) => ({
    value: role,
    label: fr.contactRoles[role],
  }));
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const version = useDataVersion();
  const [params, setParams] = useSearchParams();

  const state = useAsync(() => api.listContacts(), [version]);
  const me = state.data?.find((c) => c.id === user?.contactId) ?? null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<ContactRole[]>([]);
  const [otherRole, setOtherRole] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Modale AUTH-14
  const [deleteOpen, setDeleteOpen] = useState(params.get('suppression') === '1');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [deleteSent, setDeleteSent] = useState(false);

  useEffect(() => {
    if (me && !loaded) {
      setFirstName(me.firstName);
      setLastName(me.lastName);
      setPhone(me.phone);
      setRoles(me.roles);
      setOtherRole(me.otherRoleLabel ?? '');
      setLoaded(true);
    }
  }, [me, loaded]);

  useEffect(() => {
    if (params.get('suppression') === '1') setDeleteOpen(true);
  }, [params]);

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleteFailed(false);
    setDeleteConfirmed(false);
    if (params.get('suppression')) setParams({}, { replace: true });
  };

  const save = async () => {
    if (!me || !user) return;
    const unchanged =
      firstName === me.firstName &&
      lastName === me.lastName &&
      phone === me.phone &&
      JSON.stringify(roles) === JSON.stringify(me.roles) &&
      otherRole === (me.otherRoleLabel ?? '');
    if (unchanged) {
      showToast({ message: fr.common.noChange, kind: 'neutral' });
      return;
    }
    setBusy(true);
    setFailed(false);
    try {
      await api.updateMyContact(user.contactId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        roles,
        ...(roles.includes('autre') ? { otherRoleLabel: otherRole.trim() } : {}),
      });
      refreshUser({ firstName: firstName.trim(), lastName: lastName.trim() });
      showToast({ message: fr.account.saved });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const submitDeleteRequest = async () => {
    if (!deleteConfirmed || !user) return;
    setDeleteBusy(true);
    setDeleteFailed(false);
    try {
      await api.submitDeleteRequest(
        `${user.firstName} ${user.lastName}`,
        deleteReason.trim() || undefined,
      );
      setDeleteSent(true);
      closeDelete();
      showToast({ message: fr.account.deleteSuccess, kind: 'neutral' });
    } catch {
      setDeleteFailed(true);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={fr.account.title} intro={fr.account.intro} />
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}
      {deleteSent && <InlineAlert variant="success" title={fr.account.deleteSuccess} />}

      {state.loading && (
        <SkeletonGroup>
          <Skeleton height={360} radius="var(--radius-lg)" />
        </SkeletonGroup>
      )}
      {state.error && <LoadError onRetry={state.retry} />}

      {me && user && (
        <>
          {/* « Informations générales » : le h1 dit déjà « Mon compte » — pas de titre dupliqué. */}
          <CardSection
            title={fr.facility.general}
            actions={<Chip label={fr.roles[user.role]} variant="info" />}
          >
            <div className={styles.fieldGrid}>
              <TextField label={fr.account.firstName} value={firstName} onChange={setFirstName} required />
              <TextField label={fr.account.lastName} value={lastName} onChange={setLastName} required />
              <TextField label={fr.account.phone} type="tel" inputMode="tel" value={phone} onChange={setPhone} />
              <TextField
                label={fr.account.email}
                type="email"
                value={me.email}
                onChange={() => undefined}
                readOnly
                helper={fr.account.emailHelp}
              />
            </div>
            <div className={styles.rolesBlock}>
              <MultiSelect
                label={fr.account.rolesLabel}
                values={roles}
                onChange={(values) => setRoles(values as ContactRole[])}
                options={ROLE_OPTIONS}
              />
              {roles.includes('autre') && (
                <div className={styles.otherRole}>
                  <TextField label={fr.contactsPage.otherRole} value={otherRole} onChange={setOtherRole} />
                </div>
              )}
            </div>
            <div className={styles.formActions}>
              <Button variant="primary" onClick={() => void save()} loading={busy}>
                {fr.account.save}
              </Button>
            </div>
          </CardSection>

          <CardSection title={fr.account.deleteTitle}>
            <p className={styles.dangerIntro}>{fr.account.deleteIntro}</p>
            <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>
              {fr.header.deleteRequest}
            </Button>
          </CardSection>
        </>
      )}

      <Modal
        open={deleteOpen}
        onClose={closeDelete}
        title={fr.account.deleteTitle}
        destructive
        footer={
          <>
            <Button variant="ghost" onClick={closeDelete}>
              {fr.common.cancel}
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => void submitDeleteRequest()}
              loading={deleteBusy}
              disabled={!deleteConfirmed}
              disabledReason={!deleteConfirmed ? fr.account.deleteUnderstand : undefined}
            >
              {fr.account.deleteSubmit}
            </Button>
          </>
        }
      >
        <p>{fr.account.deleteIntro}</p>
        {deleteFailed && <InlineAlert variant="danger" title={fr.account.deleteError} />}
        <Textarea label={fr.account.deleteReason} value={deleteReason} onChange={setDeleteReason} />
        <Checkbox label={fr.account.deleteUnderstand} checked={deleteConfirmed} onChange={setDeleteConfirmed} />
      </Modal>
    </>
  );
}
