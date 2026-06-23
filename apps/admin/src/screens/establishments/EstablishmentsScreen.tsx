import { useMemo, useState } from 'react';
import { Plus, Download, Building2, Mail, Phone, Layers, BadgeCheck } from 'lucide-react';
import {
  PageHeader,
  KpiCard,
  Card,
  CardSection,
  Button,
  Pill,
  Table,
  Toolbar,
  SearchInput,
  Select,
  Modal,
  DefinitionList,
} from '@/components';
import type { Column } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './EstablishmentsScreen.module.css';
import { CreateEstablishmentWizard } from './CreateEstablishmentWizard';
import { ESTABLISHMENTS, EST_KPIS, GROUPS, MARKERS_INFO, type Establishment } from './data';

export function EstablishmentsScreen() {
  const t = useStrings();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [open, setOpen] = useState<Establishment | null>(null);
  const [creating, setCreating] = useState(false);

  const groupOptions = [
    { value: 'all', label: t.establishments.groupFilter.all },
    ...GROUPS.map((g) => ({ value: g.name, label: g.name })),
    { value: '__none', label: t.establishments.groupFilter.none },
  ];

  const filtered = useMemo(
    () =>
      ESTABLISHMENTS.filter((e) =>
        group === 'all' ? true : group === '__none' ? e.group === null : e.group === group,
      ).filter((e) =>
        query.trim()
          ? `${e.name} ${e.city} ${e.company}`.toLowerCase().includes(query.toLowerCase())
          : true,
      ),
    [query, group],
  );

  const columns: Column<Establishment>[] = [
    {
      key: 'name',
      header: t.establishments.columns.name,
      render: (e) => (
        <span className={shared.cellStack}>
          <span className={shared.cellStrong}>{e.name}</span>
          <span className={shared.cellMuted}>
            {e.category} · {e.city}
          </span>
        </span>
      ),
    },
    {
      key: 'group',
      header: t.establishments.columns.group,
      secondary: true,
      render: (e) =>
        e.group ? (
          <Pill tone="info">{e.group}</Pill>
        ) : (
          <span className={shared.cellMuted}>{t.establishments.unlinked}</span>
        ),
    },
    {
      key: 'contracts',
      header: t.establishments.columns.contracts,
      align: 'end',
      secondary: true,
      render: (e) => <span className={shared.num}>{e.activeContracts}</span>,
    },
    {
      key: 'rate',
      header: t.establishments.columns.rate,
      align: 'end',
      render: (e) => <span className={shared.num}>{e.defaultRate} €</span>,
    },
    {
      key: 'status',
      header: t.establishments.columns.status,
      align: 'end',
      render: (e) =>
        e.status === 'active' ? (
          <Pill tone="progress">{t.establishments.status.active}</Pill>
        ) : (
          <Pill tone="neutral">{t.establishments.status.inactive}</Pill>
        ),
    },
  ];

  return (
    <div className={shared.stack}>
      <PageHeader
        title={t.establishments.title}
        subtitle={t.establishments.subtitle}
        actions={
          <>
            <Button variant="secondary" icon={Download}>
              {t.establishments.export}
            </Button>
            <Button icon={Plus} onClick={() => setCreating(true)}>
              {t.establishments.create}
            </Button>
          </>
        }
      />

      <section className={shared.kpis} aria-label={t.establishments.kpiAria}>
        {EST_KPIS.map((k) => {
          const copy = t.establishments.kpis[k.id];
          return (
            <KpiCard
              key={k.id}
              label={copy.label}
              value={k.value}
              hint={copy.hint}
              {...('lead' in k && k.lead ? { lead: true } : {})}
            />
          );
        })}
      </section>

      <div className={shared.split}>
        <Card className={styles.tableCard}>
          <Toolbar end={<span className={shared.count}>{t.establishments.count(filtered.length)}</span>}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t.establishments.searchPlaceholder}
              label={t.establishments.searchLabel}
            />
            <Select value={group} onChange={setGroup} options={groupOptions} label={t.establishments.groupFilterLabel} />
          </Toolbar>
          <Table
            columns={columns}
            rows={filtered}
            getRowKey={(e) => e.id}
            onRowClick={(e) => setOpen(e)}
            ariaLabel={t.establishments.tableAria}
            empty={t.establishments.tableEmpty}
          />
        </Card>

        <Card className={styles.groupsCard}>
          <div className={styles.groupsHead}>
            <Layers size={18} aria-hidden />
            <h3 className={styles.groupsTitle}>{t.establishments.groupsTitle}</h3>
          </div>
          <ul className={styles.groups}>
            {GROUPS.map((g) => (
              <li key={g.id} className={styles.groupRow}>
                <span className={shared.cellStack}>
                  <span className={shared.cellStrong}>{g.name}</span>
                  <span className={shared.cellMuted}>{g.city}</span>
                </span>
                <Pill tone="neutral">{t.establishments.groupCount(g.count)}</Pill>
              </li>
            ))}
          </ul>
          <Button variant="ghost" icon={Plus} size="md">
            {t.establishments.createGroup}
          </Button>
        </Card>
      </div>

      <CardSection
        title={t.establishments.markersTitle}
        actions={<Pill tone="neutral">{t.establishments.markersReference}</Pill>}
      >
        <div className={styles.markers}>
          {MARKERS_INFO.map((m) => {
            const copy = t.establishments.markers[m.id];
            return (
              <div key={m.id} className={styles.markerCard}>
                <div className={styles.markerHead}>
                  <BadgeCheck size={18} aria-hidden />
                  <h4 className={styles.markerTitle}>{copy.label}</h4>
                </div>
                <p className={shared.cellMuted}>{copy.desc}</p>
                <div className={styles.markerStats}>
                  <span>
                    <strong className={shared.num}>{m.sessions}</strong> {t.establishments.markerUnits.sessions}
                  </span>
                  <span>
                    <strong className={shared.num}>{m.homes}</strong> {t.establishments.markerUnits.homes}
                  </span>
                  <span>
                    <strong className={shared.num}>{m.revenue}</strong> {t.establishments.markerUnits.revenue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardSection>

      <EstablishmentDetail establishment={open} onClose={() => setOpen(null)} />
      <CreateEstablishmentWizard open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}

function EstablishmentDetail({
  establishment,
  onClose,
}: {
  establishment: Establishment | null;
  onClose: () => void;
}) {
  const t = useStrings();
  if (!establishment) return null;
  const e = establishment;
  return (
    <Modal
      open={Boolean(establishment)}
      onClose={onClose}
      size="wide"
      title={e.name}
      subtitle={`${e.company} · ${e.city}`}
      footer={
        <>
          <Button variant="secondary" icon={Building2}>
            {t.establishments.detail.editProfile}
          </Button>
          <Button>{t.establishments.detail.viewContracts}</Button>
        </>
      }
    >
      <div className={styles.detail}>
        <div className={styles.detailTop}>
          {e.status === 'active' ? (
            <Pill tone="progress">{t.establishments.status.active}</Pill>
          ) : (
            <Pill tone="neutral">{t.establishments.status.inactive}</Pill>
          )}
          {e.group ? (
            <Pill tone="info">{e.group}</Pill>
          ) : (
            <Pill tone="warning">{t.establishments.unlinked}</Pill>
          )}
        </div>

        <section className={styles.block}>
          <h3 className={styles.blockTitle}>{t.establishments.detail.generalTitle}</h3>
          <DefinitionList
            items={[
              { term: t.establishments.detail.company, value: e.company },
              { term: t.establishments.detail.siret, value: <span className={shared.num}>{e.siret}</span> },
              { term: t.establishments.detail.vat, value: <span className={shared.num}>{e.vat}</span> },
              { term: t.establishments.detail.category, value: e.category },
              { term: t.establishments.detail.units, value: e.units.join(', ') },
              { term: t.establishments.detail.defaultRate, value: t.establishments.detail.ratePerSession(e.defaultRate) },
            ]}
          />
        </section>

        <section className={styles.block}>
          <h3 className={styles.blockTitle}>{t.establishments.detail.statsTitle}</h3>
          <div className={styles.stats}>
            <Stat value={String(e.totalSessions)} label={t.establishments.detail.statsTotal} />
            <Stat value={String(e.sessionsThisMonth)} label={t.establishments.detail.statsThisMonth} />
            <Stat value={String(e.activeContracts)} label={t.establishments.detail.statsContracts} />
            <Stat value={String(e.coaches)} label={t.establishments.detail.statsCoaches} />
          </div>
        </section>

        <section className={styles.block}>
          <h3 className={styles.blockTitle}>{t.establishments.detail.contactsTitle}</h3>
          <ul className={styles.contacts}>
            {e.contacts.map((c) => (
              <li key={c.email} className={styles.contact}>
                <div className={styles.contactTop}>
                  <span className={shared.cellStrong}>{c.name}</span>
                  {c.primary && <Pill tone="info">{t.establishments.detail.primaryContact}</Pill>}
                </div>
                <span className={shared.cellMuted}>{c.role}</span>
                <div className={shared.metaRow}>
                  <span className={styles.contactLine}>
                    <Mail size={13} aria-hidden /> {c.email}
                  </span>
                  <span className={styles.contactLine}>
                    <Phone size={13} aria-hidden /> {c.phone}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
