import { useMemo, useState } from 'react';
import { AlertTriangle, Download, RefreshCw, Sparkles, FileText } from 'lucide-react';
import {
  PageHeader,
  KpiCard,
  Card,
  Button,
  Pill,
  Tabs,
  Table,
  Toolbar,
  SearchInput,
  Select,
  Modal,
  DefinitionList,
} from '@/components';
import type { Column, TabItem } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './BillingScreen.module.css';
import { INVOICES, BILLING_KPIS, STATUS_META, SYNC_META, type Invoice } from './data';

type TabId = 'all' | 'draft' | 'pending' | 'overdue' | 'paid';

const TAB_FILTER: Record<TabId, (i: Invoice) => boolean> = {
  all: () => true,
  draft: (i) => i.status === 'draft',
  pending: (i) => i.status === 'pending' || i.status === 'overdue',
  overdue: (i) => i.status === 'overdue',
  paid: (i) => i.status === 'paid',
};

const euro = (n: number) => `${n.toLocaleString('fr-FR')} €`;

export function BillingScreen() {
  const t = useStrings();
  const [tab, setTab] = useState<TabId>('all');
  const [query, setQuery] = useState('');
  const [marker, setMarker] = useState('all');
  const [open, setOpen] = useState<Invoice | null>(null);

  const overdue = INVOICES.filter((i) => i.status === 'overdue');
  const overdueTotal = overdue.reduce((sum, i) => sum + i.amountHt, 0);

  const filtered = useMemo(
    () =>
      INVOICES.filter(TAB_FILTER[tab])
        .filter((i) => (marker === 'all' ? true : i.markers.includes(marker as 'cfppa' | 'bdc')))
        .filter((i) =>
          query.trim()
            ? `${i.number} ${i.ehpad} ${i.period} ${i.group}`.toLowerCase().includes(query.toLowerCase())
            : true,
        ),
    [tab, query, marker],
  );

  const tabs: TabItem[] = [
    { id: 'all', label: t.billing.tabs.all },
    { id: 'draft', label: t.billing.tabs.draft, count: INVOICES.filter(TAB_FILTER.draft).length },
    { id: 'pending', label: t.billing.tabs.pending, count: INVOICES.filter((i) => i.status === 'pending').length },
    { id: 'overdue', label: t.billing.tabs.overdue, count: overdue.length },
    { id: 'paid', label: t.billing.tabs.paid, count: INVOICES.filter(TAB_FILTER.paid).length },
  ];

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: t.billing.columns.invoice,
      render: (i) => (
        <span className={shared.cellStack}>
          <span className={`${shared.cellStrong} ${shared.num}`}>{i.number}</span>
          <span className={shared.cellMuted}>{i.period}</span>
        </span>
      ),
    },
    {
      key: 'ehpad',
      header: t.billing.columns.establishment,
      render: (i) => (
        <span className={shared.cellStack}>
          <span className={shared.cellStrong}>{i.ehpad}</span>
          <span className={shared.cellMuted}>
            {i.group}
            {i.markers.length ? ` · ${i.markers.map((m) => t.billing.markers[m]).join(' · ')}` : ''}
          </span>
        </span>
      ),
    },
    {
      key: 'sessions',
      header: t.billing.columns.sessions,
      align: 'end',
      secondary: true,
      render: (i) => <span className={shared.num}>{i.sessions}</span>,
    },
    {
      key: 'amount',
      header: t.billing.columns.amountHt,
      align: 'end',
      render: (i) => <span className={`${shared.num} ${styles.amount}`}>{euro(i.amountHt)}</span>,
    },
    {
      key: 'sync',
      header: t.billing.columns.pennylane,
      align: 'end',
      secondary: true,
      render: (i) => <Pill tone={SYNC_META[i.sync].tone}>{t.billing.syncStatus[i.sync]}</Pill>,
    },
    {
      key: 'status',
      header: t.billing.columns.status,
      align: 'end',
      render: (i) => <Pill tone={STATUS_META[i.status].tone}>{t.billing.status[i.status]}</Pill>,
    },
  ];

  return (
    <div className={shared.stack}>
      <PageHeader
        title={t.billing.title}
        subtitle={t.billing.subtitle}
        actions={
          <>
            <Button variant="secondary" icon={Sparkles}>
              {t.billing.generate}
            </Button>
            <Button icon={RefreshCw}>{t.billing.sync}</Button>
          </>
        }
      />

      {overdue.length > 0 && (
        <div className={shared.banner} data-tone="danger">
          <AlertTriangle className={shared.bannerIcon} size={20} aria-hidden />
          <p className={shared.bannerText}>
            <strong>{t.billing.overdueBanner.headline(overdue.length, euro(overdueTotal))}</strong>{' '}
            {t.billing.overdueBanner.detail}
          </p>
          <Button size="md" variant="secondary">
            {t.billing.overdueBanner.action}
          </Button>
        </div>
      )}

      <section className={shared.kpis} aria-label={t.billing.kpiAria}>
        {BILLING_KPIS.map((k) => (
          <KpiCard
            key={k.id}
            label={t.billing.kpis[k.id].label}
            value={k.value}
            hint={t.billing.kpis[k.id].hint}
            {...(k.lead ? { lead: true } : {})}
          />
        ))}
      </section>

      <Tabs items={tabs} active={tab} onChange={(id) => setTab(id as TabId)} ariaLabel={t.billing.tabsAria} />

      <Card className={styles.tableCard}>
        <Toolbar end={<span className={shared.count}>{t.billing.count(filtered.length)}</span>}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.billing.searchPlaceholder}
            label={t.billing.searchLabel}
          />
          <Select
            value={marker}
            onChange={setMarker}
            label={t.billing.markerFilterLabel}
            options={[
              { value: 'all', label: t.billing.markerFilter.all },
              { value: 'cfppa', label: t.billing.markerFilter.cfppa },
              { value: 'bdc', label: t.billing.markerFilter.bdc },
            ]}
          />
        </Toolbar>
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(i) => i.id}
          onRowClick={(i) => setOpen(i)}
          ariaLabel={t.billing.tableAria}
          empty={t.billing.empty}
        />
      </Card>

      <InvoiceDetail invoice={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function InvoiceDetail({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const t = useStrings();
  if (!invoice) return null;
  const i = invoice;
  const total = i.lines.reduce((s, l) => s + l.qty * l.unit, 0);

  return (
    <Modal
      open={Boolean(invoice)}
      onClose={onClose}
      title={i.number}
      subtitle={`${i.ehpad} · ${i.period}`}
      footer={
        <>
          {i.status !== 'paid' && (
            <Button variant="ghost" icon={FileText}>
              {t.billing.detail.adjust}
            </Button>
          )}
          <Button variant="secondary" icon={Download}>
            {t.billing.detail.downloadPdf}
          </Button>
        </>
      }
    >
      <div className={styles.detail}>
        <div className={styles.detailTop}>
          <Pill tone={STATUS_META[i.status].tone}>{t.billing.status[i.status]}</Pill>
          <Pill tone={SYNC_META[i.sync].tone}>{t.billing.syncStatus[i.sync]}</Pill>
        </div>

        {i.sync === 'error' && (
          <div className={shared.banner} data-tone="danger">
            <AlertTriangle className={shared.bannerIcon} size={18} aria-hidden />
            <p className={shared.bannerText}>{t.billing.detail.syncError}</p>
          </div>
        )}

        <table className={styles.lines}>
          <thead>
            <tr>
              <th>{t.billing.detail.lineCols.service}</th>
              <th className={shared.num}>{t.billing.detail.lineCols.qty}</th>
              <th className={shared.num}>{t.billing.detail.lineCols.unitHt}</th>
              <th className={shared.num}>{t.billing.detail.lineCols.totalHt}</th>
            </tr>
          </thead>
          <tbody>
            {i.lines.map((l) => (
              <tr key={l.labelKey}>
                <td>{t.billing.lineLabels[l.labelKey]}</td>
                <td className={shared.num}>{l.qty}</td>
                <td className={shared.num}>{euro(l.unit)}</td>
                <td className={shared.num}>{euro(l.qty * l.unit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>{t.billing.detail.totalHt}</td>
              <td className={`${shared.num} ${styles.amount}`}>{euro(total)}</td>
            </tr>
          </tfoot>
        </table>

        <DefinitionList
          items={[
            { term: t.billing.detail.terms.period, value: i.period },
            { term: t.billing.detail.terms.dueDate, value: i.dueDate },
            { term: t.billing.detail.terms.billedSessions, value: String(i.sessions) },
            {
              term: t.billing.detail.terms.paymentDate,
              value: i.paymentDate ?? <span className={shared.muted}>—</span>,
            },
          ]}
        />
      </div>
    </Modal>
  );
}
