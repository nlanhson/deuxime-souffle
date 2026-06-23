import { useState } from 'react';
import {
  Activity,
  Brain,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Dumbbell,
  HandHeart,
  Mail,
  OctagonX,
  PartyPopper,
  Pencil,
  Phone,
  Plus,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Star,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
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
  EmptyState,
  InlineAlert,
  LoadError,
  Modal,
  MultiSelect,
  PageHeader,
  Select,
  Skeleton,
  SkeletonGroup,
  TextField,
} from '@/components';
import type { Contact, ContactRole } from '@/types/models';
import styles from './contacts.module.css';

const DAY_MS = 1000 * 60 * 60 * 24;
/** ~2 mois : on invite à vérifier, mais en sourdine (simple ligne grise). */
const NUDGE_AFTER_MS = DAY_MS * 61;
/** ~5 mois : là, c'est vraiment en retard — on hausse le ton (bannière douce). */
const OVERDUE_AFTER_MS = DAY_MS * 150;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Une icône par fonction : on scanne la page par « qui fait quoi », pas par visage. */
const ROLE_ICON: Record<ContactRole, LucideIcon> = {
  comptable: Receipt,
  coordinateur_animation: PartyPopper,
  directeur: Building2,
  psychomotricien: Activity,
  ergotherapeute: HandHeart,
  psychologue: Brain,
  specialiste_apa: Dumbbell,
  directeur_adjoint: Briefcase,
  autre: UserRound,
};

let newContactSeq = 0;

/** AUTH-21 — gestion des contacts. Affichage hiérarchisé : un contact principal mis
 *  en avant, les autres en grille menée par la FONCTION (pas le nom), e-mail et
 *  téléphone joignables d'un geste. Écriture réservée à l'Admin. */
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
  const ageMs = state.data ? Date.now() - new Date(state.data.lastConfirmed).getTime() : 0;
  const stale = state.data !== null && ageMs > NUDGE_AFTER_MS;
  const overdue = state.data !== null && ageMs > OVERDUE_AFTER_MS;

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

  /** Les fonctions d'un contact, dans l'ordre d'importance (coordination des séances
   *  d'abord — c'est l'interlocuteur clé pour DS), prêtes à servir de titre + icône. */
  const functionsOf = (contact: Contact): { icon: LucideIcon; label: string }[] => [
    ...(contact.isSessionCoordinator
      ? [{ icon: CalendarCheck, label: fr.contactsPage.coordinator }]
      : []),
    ...contact.roles.map((role) => ({
      icon: ROLE_ICON[role],
      label:
        role === 'autre' && contact.otherRoleLabel ? contact.otherRoleLabel : fr.contactRoles[role],
    })),
  ];

  const editForm = (contact: Contact) => (
    <div className={styles.form}>
      {/* Le nom mène — deux champs par ligne, jamais trois. */}
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
      </div>
      <div className={styles.formGrid}>
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
      {/* Civilité (secondaire) rangée avec le type — deux petits sélecteurs sur une
          ligne, plus jamais en tête de formulaire. */}
      <div className={styles.formGrid}>
        <Select
          label={fr.contactsPage.civility}
          value={contact.civility}
          onChange={(civility) => setDraft({ ...contact, civility: civility as Contact['civility'] })}
          options={[
            { value: 'M', label: fr.civility.M },
            { value: 'Mme', label: fr.civility.Mme },
            { value: 'Mlle', label: fr.civility.Mlle },
          ]}
        />
        <Select
          label={fr.contactsPage.type}
          value={contact.type}
          onChange={(type) => setDraft({ ...contact, type: type as Contact['type'] })}
          options={[
            { value: 'principal', label: fr.contactsPage.types.principal },
            { value: 'additionnel', label: fr.contactsPage.types.additionnel },
          ]}
        />
      </div>
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
        searchable
      />
      {contact.roles.includes('autre') && (
        <TextField
          label={fr.contactsPage.otherRole}
          value={contact.otherRoleLabel ?? ''}
          onChange={(otherRoleLabel) => setDraft({ ...contact, otherRoleLabel })}
        />
      )}
    </div>
  );

  const contactCard = (contact: Contact, hero = false) => {
    const fns = functionsOf(contact);
    // Héros : l'étoile « contact principal » mène ; secondaires : la fonction mène.
    const lead = hero
      ? { icon: Star, label: fr.contactsPage.types.principal }
      : (fns[0] ?? { icon: UserRound, label: fr.contactsPage.types[contact.type] });
    // Le reste des casquettes en une ligne calme — fini la « soupe de pastilles ».
    const extraLabels = (hero ? fns : fns.slice(1)).map((f) => f.label);
    const fullName = `${contact.firstName} ${contact.lastName}`;

    // Photo en tête (annuaire « vrai site ») : le visage mène, la fonction reste en
    // libellé d'attaque ; l'étoile dorée garde le repère « contact principal ».
    const identity = (
      <div className={styles.identity}>
        <Avatar
          firstName={contact.firstName}
          lastName={contact.lastName}
          src={contact.avatarUrl}
          size={hero ? 'lg' : 'md'}
          decorative
        />
        <div className={styles.identityText}>
          <span className={`${styles.leadLabel} ${hero ? styles.leadLabelPrincipal : ''}`}>
            {hero && <Star className={styles.principalStar} aria-hidden />}
            {lead.label}
          </span>
          <p className={`${styles.name} ${hero ? styles.heroName : ''}`}>
            {fr.civility[contact.civility]} {fullName}
          </p>
          {extraLabels.length > 0 && <p className={styles.roleLine}>{extraLabels.join(' · ')}</p>}
        </div>
      </div>
    );

    const reach = (
      <div className={styles.channels}>
        <a
          className={styles.channel}
          href={`mailto:${contact.email}`}
          aria-label={fr.contactsPage.emailLabel(fullName)}
        >
          <Mail aria-hidden />
          <span>{contact.email}</span>
        </a>
        <a
          className={styles.channel}
          href={`tel:${contact.phone.replace(/\s/g, '')}`}
          aria-label={fr.contactsPage.callLabel(fullName)}
        >
          <Phone aria-hidden />
          <span>{formatPhone(contact.phone)}</span>
        </a>
        {contact.account && (
          <p className={`${styles.account} ${contact.account.active ? '' : styles.accountInactive}`}>
            {contact.account.active ? <ShieldCheck aria-hidden /> : <ShieldAlert aria-hidden />}
            <span>
              {contact.account.active ? fr.contactsPage.hasAccount : fr.contactsPage.accountInactive}
            </span>
          </p>
        )}
      </div>
    );

    const actions = (
      <div className={styles.cardActions}>
        <Button
          variant="secondary"
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
            !isAdmin
              ? gateReason
              : contact.type === 'principal'
                ? fr.contactsPage.cannotDeletePrincipal
                : undefined
          }
          onClick={() => setDeleting(contact)}
        >
          {fr.common.delete}
        </Button>
      </div>
    );

    return (
      <Card key={contact.id} className={styles.card}>
        {hero ? (
          <>
            <div className={styles.heroBody}>
              <div>{identity}</div>
              <div>{reach}</div>
            </div>
            {actions}
          </>
        ) : (
          <>
            {identity}
            {reach}
            {actions}
          </>
        )}
      </Card>
    );
  };

  const principal = state.data?.contacts.find((c) => c.type === 'principal') ?? null;
  const others = state.data?.contacts.filter((c) => c.type !== 'principal') ?? [];
  // Édition/ajout : un brouillon « tout neuf » porte un id temporaire `c-nouveau-…`.
  const editingNew = draft !== null && draft.id.startsWith('c-nouveau-');

  return (
    <>
      <div className={styles.page}>
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
        {failed && draft === null && (
          <InlineAlert variant="danger" title={fr.common.genericError} autoFocus />
        )}

        {/* Fraîcheur des coordonnées : discrète par défaut (simple ligne grise),
            elle ne reprend la voix d'une bannière que si c'est vraiment en retard. */}
        {state.data && isAdmin && overdue && (
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
        {state.data && isAdmin && !overdue && (
          <div className={`${styles.freshness} ${stale ? '' : styles.freshnessFresh}`}>
            {stale ? <Clock aria-hidden /> : <CheckCircle2 aria-hidden />}
            <span>
              {stale
                ? fr.contactsPage.refreshNudge(formatSince(state.data.lastConfirmed))
                : fr.contactsPage.upToDate}
            </span>
            {stale && (
              <button type="button" className={styles.freshnessAction} onClick={confirmFresh}>
                {fr.contactsPage.confirmFresh}
              </button>
            )}
          </div>
        )}

        {state.loading && (
          <SkeletonGroup>
            {/* Hero : le contact principal, longue bande pleine largeur. */}
            <Skeleton height={220} width="100%" radius="var(--radius-lg)" />
            {/* Section « Autres contacts » : titre puis grille 3 → 2 → 1. */}
            <div className={styles.section}>
              <Skeleton height={20} width={140} radius="var(--radius-pill)" />
              <div className={styles.grid}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={180} radius="var(--radius-lg)" />
                ))}
              </div>
            </div>
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

        {state.data && state.data.contacts.length > 0 && (
          <>
            {principal && contactCard(principal, true)}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{fr.contactsPage.othersTitle}</h2>
              {others.length === 0 ? (
                <p className={styles.roleLine}>{fr.contactsPage.noOthers}</p>
              ) : (
                <div className={styles.grid}>{others.map((c) => contactCard(c))}</div>
              )}
            </section>
          </>
        )}
      </div>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={editingNew ? fr.contactsPage.addContact : fr.contactsPage.editTitle}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              {fr.common.cancel}
            </Button>
            <Button variant="primary" onClick={() => void saveDraft()} loading={busy}>
              {fr.contactsPage.save}
            </Button>
          </>
        }
      >
        {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}
        {draft && editForm(draft)}
      </Modal>

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
