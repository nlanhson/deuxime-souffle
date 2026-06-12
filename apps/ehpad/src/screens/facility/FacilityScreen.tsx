import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { capitalize, formatDate, formatDuration, formatEuro, formatPhone, formatTime, formatTimestamp } from '@/lib/format';
import { contractStatusChip, unitLabel } from '@/lib/status';
import { Button, LoadError, PageHeader, SkeletonCards, SkeletonGroup } from '@/components';
import { useNavigate } from 'react-router-dom';
import type { Address } from '@/types/models';
import styles from './facility.module.css';

/** Une rangée Donnée : libellé à gauche, valeur alignée à droite sur la grille. */
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={styles.row}>
    <dt className={styles.rowLabel}>{label}</dt>
    <dd className={styles.rowValue}>{children}</dd>
  </div>
);

const Section = ({
  no,
  title,
  action,
  children,
}: {
  no: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className={styles.section}>
    <div className={styles.sectionHead}>
      <div className={styles.sectionHeadLeft}>
        <span className={styles.sectionNo}>{no}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const addressLines = (address: Address): ReactNode => (
  <>
    {address.line1}
    {address.line2 ? <><br />{address.line2}</> : null}
    <br />
    {address.postalCode} {address.city}
  </>
);

/** AUTH-10 — profil de l'établissement (Groupe en lecture seule, EST-09). */
export default function FacilityScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

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
        <PageHeader title={fr.facility.title} />
        <SkeletonGroup>
          <SkeletonCards count={4} height={220} />
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
  const lastChange = history[0];

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
        <Section no="01" title={fr.facility.general}>
          <dl className={styles.rows}>
            <Row label={fr.facility.tradeName}>{facility.tradeName}</Row>
            <Row label={fr.facility.companyName}>{facility.companyName}</Row>
            <Row label={fr.facility.siret}>{facility.siret}</Row>
            <Row label={fr.facility.vat}>{facility.vatNumber}</Row>
            <Row label={fr.facility.category}>{facility.category}</Row>
            <Row label={fr.facility.group}>
              {facility.group ? facility.group.name : fr.facility.groupNone}
              <span className={styles.help}>{fr.facility.groupHelp}</span>
            </Row>
            <Row label={fr.facility.statusLabel}>
              {facility.status === 'actif' ? fr.facility.statusActive : fr.facility.statusInactive}
            </Row>
            <Row label={fr.facility.unitsLabel}>{facility.units.map(unitLabel).join(', ')}</Row>
          </dl>
        </Section>

        <Section no="02" title={fr.facility.addresses}>
          <dl className={styles.rows}>
            <Row label={fr.facility.mainAddress}>{addressLines(facility.addresses.main)}</Row>
            <Row label={fr.facility.billingAddress}>{addressLines(facility.addresses.billing)}</Row>
            <Row label={fr.facility.sessionAddress}>
              {facility.addresses.sessionLocation ? (
                addressLines(facility.addresses.sessionLocation)
              ) : (
                <span className={styles.muted}>{fr.facility.sessionAddressSame}</span>
              )}
            </Row>
          </dl>
        </Section>

        <Section
          no="03"
          title={fr.facility.contactsTitle}
          action={
            <Link to="/contacts" className={styles.sectionLink}>
              {fr.facility.manageContacts}
            </Link>
          }
        >
          <dl className={styles.rows}>
            {principal && (
              <Row label={fr.facility.mainContact}>
                <strong>
                  {fr.civility[principal.civility]} {principal.firstName} {principal.lastName}
                </strong>
                {principal.roles.length > 0 && ` — ${principal.roles.map((r) => fr.contactRoles[r]).join(', ')}`}
                <br />
                {principal.email} · {formatPhone(principal.phone)}
              </Row>
            )}
            {additionnels.length > 0 && (
              <Row label={fr.facility.additionalContacts}>
                {additionnels.map((c) => `${fr.civility[c.civility]} ${c.firstName} ${c.lastName}`).join(' · ')}
              </Row>
            )}
          </dl>
        </Section>

        <Section no="04" title={fr.facility.standardSessions}>
          {facility.standardSessions.length === 0 ? (
            <p className={styles.muted}>{fr.facility.standardSessionsEmpty}</p>
          ) : (
            <div className={styles.lines}>
              {facility.standardSessions.map((session) => (
                <div key={session.id} className={styles.line}>
                  <span className={styles.lineMain}>{session.label}</span>
                  <span className={styles.lineMeta}>
                    {fr.weekdays[session.weekday]} · {formatTime(session.time)} · {formatDuration(session.durationMin)} · {unitLabel(session.unitType)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section no="05" title={fr.facility.pricing}>
          <dl className={styles.rows}>
            <Row label={fr.facility.defaultRate}>{formatEuro(facility.defaultSessionRate)}</Row>
            <Row label={fr.facility.markers}>
              {facility.markers.length > 0 ? facility.markers.join(', ') : fr.facility.noMarkers}
            </Row>
          </dl>
        </Section>

        <Section no="06" title={fr.facility.statsTitle}>
          <dl className={styles.rows}>
            <Row label={fr.facility.statTotal}>
              <span className={styles.num}>{facility.stats.totalCompleted}</span>
            </Row>
            <Row label={fr.facility.statMonth}>
              <span className={styles.num}>{facility.stats.thisMonth}</span>
            </Row>
            <Row label={fr.facility.statCoaches}>
              <span className={styles.num}>{facility.stats.coachCount}</span>
            </Row>
            <Row label={fr.facility.statUpcoming}>
              <span className={styles.num}>{facility.stats.upcoming}</span>
            </Row>
          </dl>
        </Section>

        <Section
          no="07"
          title={fr.facility.contractsTitle}
          action={
            <Link to="/contrats" className={styles.sectionLink}>
              {fr.facility.seeContracts}
            </Link>
          }
        >
          {contracts.length === 0 ? (
            <p className={styles.muted}>
              {fr.contracts.empty} — <Link to="/contrats">{fr.facility.seeContracts}</Link>
            </p>
          ) : (
            <div className={styles.lines}>
              {contracts.slice(0, 5).map((contract) => (
                <Link key={contract.id} to={`/contrats/${contract.id}`} className={styles.lineLink}>
                  <span className={styles.lineMain}>{contract.reference}</span>
                  <span className={styles.lineMeta}>
                    {capitalize(formatDate(contract.startDate))} → {formatDate(contract.endDate)} · {formatEuro(contract.rate)} · {contractStatusChip(contract.status).label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
