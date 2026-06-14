import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, formatDuration, formatEuro, formatPhone, formatTime, formatTimestamp } from '@/lib/format';
import { contractStatusChip, unitLabel } from '@/lib/status';
import { Avatar, Button, LoadError, Modal, PageHeader, Skeleton, SkeletonGroup } from '@/components';
import type { Address, Contact } from '@/types/models';
import styles from './facility.module.css';

/** Les contrats les plus pertinents d'abord (en cours / à renouveler avant les clos). */
const CONTRACT_ORDER = [
  'active',
  'a_renouveler',
  'en_attente_validation',
  'modification_en_attente',
  'rejete',
  'expire',
  'non_renouvele',
];

/* ---- Section à deux volets : intitulé à gauche, contenu à droite ---- */
const Pane = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className={styles.pane}>
    <div className={styles.rail}>
      <h2 className={styles.railTitle}>{title}</h2>
      {action}
    </div>
    <div>{children}</div>
  </section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={styles.field}>
    <p className={styles.fieldKey}>{label}</p>
    <p className={styles.fieldVal}>{children}</p>
  </div>
);

/** Contact en ligne : nom + fonction seulement, cliquable → fiche détaillée. */
const ContactItem = ({ contact, onOpen }: { contact: Contact; onOpen: () => void }) => {
  const fr = useStrings();
  const sub = [
    contact.roles.map((r) => fr.contactRoles[r]).join(', '),
    contact.type === 'principal' ? fr.facility.mainContact : '',
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <button type="button" className={styles.person} onClick={onOpen}>
      <Avatar firstName={contact.firstName} lastName={contact.lastName} size="sm" decorative />
      <span className={styles.personMain}>
        <span className={styles.personName}>
          {fr.civility[contact.civility]} {contact.firstName} {contact.lastName}
        </span>
        {sub && <span className={styles.personRole}>{sub}</span>}
      </span>
    </button>
  );
};

const addressLines = (address: Address): ReactNode => (
  <>
    {address.line1}
    {address.line2 ? <><br />{address.line2}</> : null}
    <br />
    {address.postalCode} {address.city}
  </>
);

const AddressBlock = ({ label, lines }: { label: string; lines: ReactNode }) => (
  <div>
    <p className={styles.addrLabel}>{label}</p>
    <p className={styles.addrLines}>{lines}</p>
  </div>
);

/* ---- Squelette : volet à deux colonnes (intitulé à gauche, contenu à droite) ---- */
const PaneSkeleton = ({ children }: { children: ReactNode }) => (
  <section className={styles.pane}>
    <Skeleton width={140} height={18} radius="var(--radius-sm)" />
    <div>{children}</div>
  </section>
);

/* Stub de champ : libellé puis valeur, empilés. */
const FieldStub = () => (
  <div>
    <Skeleton width={90} height={12} radius="var(--radius-sm)" />
    <span style={{ display: 'block', marginTop: 4 }}>
      <Skeleton width="70%" height={16} radius="var(--radius-sm)" />
    </span>
  </div>
);

/** AUTH-10 — profil de l'établissement (Groupe en lecture seule, EST-09). */
export default function FacilityScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const state = useAsync(
    () =>
      Promise.all([
        api.getFacility(),
        api.listContacts(),
        api.listContracts(),
        api.getFacilityHistory(),
      ]).then(([facility, contacts, contracts, history]) => ({ facility, contacts, contracts, history })),
    [version],
  );

  if (state.loading) {
    return (
      <>
        <PageHeader
          title={fr.facility.title}
          actions={<Skeleton width={120} height={40} radius="var(--radius-md)" />}
          intro={' '}
        />
        <SkeletonGroup className={styles.sheet}>
          {/* Bandeau d'identité */}
          <div className={styles.identity}>
            <Skeleton width={56} height={56} radius="var(--radius-md)" />
            <div className={styles.identityMain}>
              <Skeleton width={220} height={22} radius="var(--radius-sm)" />
              <span style={{ display: 'block', marginTop: 4 }}>
                <Skeleton width={140} height={14} radius="var(--radius-sm)" />
              </span>
            </div>
            <div className={styles.identityMeta}>
              <Skeleton width={90} height={14} radius="var(--radius-sm)" />
              <Skeleton width={120} height={14} radius="var(--radius-sm)" />
            </div>
          </div>

          {/* Mentions légales — 4 champs */}
          <PaneSkeleton>
            <div className={styles.fields}>
              {Array.from({ length: 4 }, (_, i) => (
                <FieldStub key={i} />
              ))}
            </div>
          </PaneSkeleton>

          {/* Adresses — 3 blocs multi-lignes */}
          <PaneSkeleton>
            <div className={styles.addressGrid}>
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i}>
                  <Skeleton width={90} height={12} radius="var(--radius-sm)" />
                  <span style={{ display: 'block', marginTop: 6 }}>
                    <Skeleton width="80%" height={14} radius="var(--radius-sm)" />
                  </span>
                  <span style={{ display: 'block', marginTop: 4 }}>
                    <Skeleton width="60%" height={14} radius="var(--radius-sm)" />
                  </span>
                </div>
              ))}
            </div>
          </PaneSkeleton>

          {/* Contacts — liste de personnes */}
          <PaneSkeleton>
            <div className={styles.people}>
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <Skeleton width={32} height={32} radius="var(--radius-pill)" />
                  <div>
                    <Skeleton width={160} height={16} radius="var(--radius-sm)" />
                    <span style={{ display: 'block', marginTop: 3 }}>
                      <Skeleton width={110} height={13} radius="var(--radius-sm)" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PaneSkeleton>

          {/* Tarification — 2 champs */}
          <PaneSkeleton>
            <div className={styles.fields}>
              {Array.from({ length: 2 }, (_, i) => (
                <FieldStub key={i} />
              ))}
            </div>
          </PaneSkeleton>

          {/* Séances standard — emploi du temps */}
          <PaneSkeleton>
            <div className={styles.timetable}>
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'baseline', flexWrap: 'wrap' }}
                >
                  <Skeleton width={150} height={16} radius="var(--radius-sm)" />
                  <Skeleton width="40%" height={16} radius="var(--radius-sm)" />
                  <Skeleton width={80} height={13} radius="var(--radius-sm)" />
                </div>
              ))}
            </div>
          </PaneSkeleton>

          {/* Statistiques — 4 champs */}
          <PaneSkeleton>
            <div className={styles.fields}>
              {Array.from({ length: 4 }, (_, i) => (
                <FieldStub key={i} />
              ))}
            </div>
          </PaneSkeleton>

          {/* Contrats — jusqu'à 5 rangées */}
          <PaneSkeleton>
            <div className={styles.contractList}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <Skeleton width={120} height={16} radius="var(--radius-sm)" />
                  <Skeleton width={200} height={13} radius="var(--radius-sm)" />
                </div>
              ))}
            </div>
          </PaneSkeleton>
        </SkeletonGroup>
      </>
    );
  }

  if (state.error || !state.data) {
    return (
      <>
        <PageHeader title={fr.facility.title} />
        <LoadError onRetry={state.retry} />
      </>
    );
  }

  const { facility, contacts, contracts, history } = state.data;
  const principal = contacts.find((c) => c.type === 'principal');
  const additionnels = contacts.filter((c) => c.type === 'additionnel');
  const allContacts = principal ? [principal, ...additionnels] : additionnels;
  const lastChange = history[0];

  const words = facility.tradeName.split(/\s+/).filter(Boolean);
  const monogram = ((words[0]?.[0] ?? '') + (words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '')).toUpperCase();

  // Contrats : les plus pertinents d'abord, plafonnés ; le reste sur leur page.
  const topContracts = [...contracts]
    .sort((a, b) => CONTRACT_ORDER.indexOf(a.status) - CONTRACT_ORDER.indexOf(b.status))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={fr.facility.title}
        actions={
          <Button
            variant="primary"
            icon={Pencil}
            disabled={!isAdmin}
            disabledReason={isAdmin ? undefined : fr.common.adminOnly}
            onClick={() => navigate('/etablissement/modifier')}
          >
            {fr.facility.editAction}
          </Button>
        }
        intro={lastChange ? fr.facility.lastModified(lastChange.by, formatTimestamp(lastChange.at)) : undefined}
      />

      <div className={styles.sheet}>
        {/* Bandeau d'identité — le « visage » de l'établissement */}
        <div className={styles.identity}>
          <span className={styles.monogram} aria-hidden>
            {monogram}
          </span>
          <div className={styles.identityMain}>
            <h2 className={styles.facilityName}>{facility.tradeName}</h2>
            <p className={styles.identitySub}>{facility.companyName}</p>
          </div>
          <div className={styles.identityMeta}>
            <span className={styles.status} data-status={facility.status}>
              <span className={styles.statusDot} aria-hidden />
              {facility.status === 'actif' ? fr.facility.statusActive : fr.facility.statusInactive}
            </span>
            <span className={styles.group}>{facility.group ? facility.group.name : fr.facility.groupNone}</span>
            <span className={styles.identityNote}>
              {fr.facility.groupHelp}{' '}
              <Link to="/contact" className={styles.inlineLink}>
                {fr.facility.contactDsLink}
              </Link>
            </span>
          </div>
        </div>

        <Pane title={fr.facility.legalTitle}>
          <div className={styles.fields}>
            <Field label={fr.facility.siret}>{facility.siret}</Field>
            <Field label={fr.facility.vat}>{facility.vatNumber}</Field>
            <Field label={fr.facility.category}>{facility.category}</Field>
            <Field label={fr.facility.unitsLabel}>{facility.units.map(unitLabel).join(', ')}</Field>
          </div>
        </Pane>

        <Pane title={fr.facility.addresses}>
          <div className={styles.addressGrid}>
            <AddressBlock label={fr.facility.mainAddress} lines={addressLines(facility.addresses.main)} />
            <AddressBlock label={fr.facility.billingAddress} lines={addressLines(facility.addresses.billing)} />
            <AddressBlock
              label={fr.facility.sessionAddress}
              lines={
                facility.addresses.sessionLocation ? (
                  addressLines(facility.addresses.sessionLocation)
                ) : (
                  <span className={styles.muted}>{fr.facility.sessionAddressSame}</span>
                )
              }
            />
          </div>
        </Pane>

        <Pane
          title={fr.facility.contactsTitle}
          action={
            <Link to="/contacts" className={styles.railLink}>
              {fr.facility.manageContacts}
            </Link>
          }
        >
          <div className={styles.people}>
            {allContacts.map((c) => (
              <ContactItem key={c.id} contact={c} onOpen={() => setActiveContact(c)} />
            ))}
          </div>
        </Pane>

        <Pane title={fr.facility.pricing}>
          <div className={styles.fields}>
            <Field label={fr.facility.defaultRate}>{formatEuro(facility.defaultSessionRate)}</Field>
            <Field label={fr.facility.markers}>
              {facility.markers.length > 0 ? facility.markers.join(', ') : fr.facility.noMarkers}
            </Field>
          </div>
        </Pane>

        <Pane title={fr.facility.standardSessions}>
          {facility.standardSessions.length === 0 ? (
            <p className={styles.muted}>{fr.facility.standardSessionsEmpty}</p>
          ) : (
            <div className={styles.timetable}>
              {facility.standardSessions.map((s) => (
                <div key={s.id} className={styles.session}>
                  <span className={styles.sessionWhen}>
                    {fr.weekdays[s.weekday]} · {formatTime(s.time)}
                  </span>
                  <span className={styles.sessionLabel}>{s.label}</span>
                  <span className={styles.sessionUnit}>
                    {formatDuration(s.durationMin)} · {unitLabel(s.unitType)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Pane>

        <Pane title={fr.facility.statsTitle}>
          <div className={styles.fields}>
            <Field label={fr.facility.statTotal}>{facility.stats.totalCompleted}</Field>
            <Field label={fr.facility.statMonth}>{facility.stats.thisMonth}</Field>
            <Field label={fr.facility.statCoaches}>{facility.stats.coachCount}</Field>
            <Field label={fr.facility.statUpcoming}>{facility.stats.upcoming}</Field>
          </div>
        </Pane>

        <Pane
          title={fr.facility.contractsTitle}
          action={
            <Link to="/contrats" className={styles.railLink}>
              {fr.facility.seeContracts}
            </Link>
          }
        >
          {contracts.length === 0 ? (
            <p className={styles.muted}>{fr.contracts.empty}</p>
          ) : (
            <div className={styles.contractList}>
              {topContracts.map((contract) => (
                <Link key={contract.id} to={`/contrats/${contract.id}`} className={styles.contractRow}>
                  <span className={styles.contractRef}>{contract.reference}</span>
                  <span className={styles.contractMeta}>
                    {contractStatusChip(contract.status).label} · {fr.facility.contractUntil(formatDate(contract.endDate))}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Pane>
      </div>

      {activeContact && (
        <Modal
          open
          onClose={() => setActiveContact(null)}
          title={`${fr.civility[activeContact.civility]} ${activeContact.firstName} ${activeContact.lastName}`}
        >
          <Field label={fr.facility.contactModal.type}>
            {activeContact.type === 'principal' ? fr.facility.mainContact : fr.facility.contactModal.additional}
          </Field>
          {activeContact.roles.length > 0 && (
            <Field label={fr.facility.contactModal.role}>
              {activeContact.roles.map((r) => fr.contactRoles[r]).join(', ')}
              {activeContact.otherRoleLabel ? ` (${activeContact.otherRoleLabel})` : ''}
            </Field>
          )}
          {activeContact.isSessionCoordinator && (
            <Field label={fr.facility.contactModal.coordinator}>{fr.common.yes}</Field>
          )}
          <Field label={fr.facility.contactModal.email}>
            <a href={`mailto:${activeContact.email}`} className={styles.inlineLink}>
              {activeContact.email}
            </a>
          </Field>
          <Field label={fr.facility.contactModal.phone}>
            <a href={`tel:${activeContact.phone.replace(/\s/g, '')}`} className={styles.inlineLink}>
              {formatPhone(activeContact.phone)}
            </a>
          </Field>
        </Modal>
      )}
    </>
  );
}
