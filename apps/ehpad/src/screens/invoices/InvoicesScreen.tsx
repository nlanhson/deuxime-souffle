import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { addDays } from '@/lib/calendar';
import { formatDate, formatEuro, parseDate, toIso } from '@/lib/format';
import { invoiceStatusChip } from '@/lib/status';
import {
  Button,
  DataTable,
  EmptyState,
  InlineAlert,
  KpiCard,
  LoadError,
  PageHeader,
  SkeletonCards,
  SkeletonGroup,
  SkeletonRows,
  StatusChip,
  TextField,
} from '@/components';
import type { Column } from '@/components';
import type { Invoice } from '@/types/models';
import styles from './invoices.module.css';

/** BILL-01 — factures : bannière de retard (ambre, jamais rouge), KPI factuels,
 *  table triée par période décroissante, recherche par numéro. Tout est HT. */
export default function InvoicesScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const state = useAsync(() => api.listInvoices(), [version]);

  const computed = useMemo(() => {
    const invoices = state.data ?? [];
    const overdue = invoices.filter((i) => i.status === 'en_retard');
    const unpaid = invoices.filter((i) => i.status !== 'payee');
    const unpaidTotal = unpaid.reduce((sum, i) => sum + i.amountHT, 0);
    const awaiting = invoices.filter((i) => i.status === 'en_attente').length;
    const paid = invoices.filter((i) => i.status === 'payee' && i.paymentDate);
    const avgDelay =
      paid.length > 0
        ? Math.round(
            paid.reduce((sum, i) => {
              const issued = addDays(parseDate(i.dueDate), -30);
              const paidAt = parseDate(i.paymentDate ?? i.dueDate);
              return sum + Math.max(0, (paidAt.getTime() - issued.getTime()) / 86_400_000);
            }, 0) / paid.length,
          )
        : null;
    const today = toIso(new Date());
    const nextDue = unpaid
      .filter((i) => i.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    return { overdue, unpaidTotal, awaiting, avgDelay, nextDue };
  }, [state.data]);

  const rows = useMemo(() => {
    const invoices = state.data ?? [];
    const query = search.trim().toLowerCase();
    return invoices.filter((i) => query === '' || i.number.toLowerCase().includes(query));
  }, [state.data, search]);

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: fr.invoices.table.number,
      sortValue: (i) => i.number,
      render: (i) => (
        <Link to={`/factures/${i.id}`} className={styles.numberLink}>
          {i.number}
        </Link>
      ),
    },
    {
      key: 'period',
      header: fr.invoices.table.period,
      sortValue: (i) => i.dueDate,
      render: (i) => i.period,
    },
    {
      key: 'sessions',
      header: fr.invoices.table.sessions,
      align: 'right',
      render: (i) => i.sessionCount,
    },
    {
      key: 'amount',
      header: fr.invoices.table.amount,
      align: 'right',
      sortValue: (i) => i.amountHT,
      render: (i) => formatEuro(i.amountHT),
    },
    {
      key: 'status',
      header: fr.invoices.table.status,
      render: (i) => <StatusChip spec={invoiceStatusChip(i.status)} />,
    },
    {
      key: 'payment',
      header: fr.invoices.table.paymentDate,
      render: (i) => (i.paymentDate ? formatDate(i.paymentDate) : '—'),
    },
  ];

  return (
    <>
      <PageHeader title={fr.invoices.title} />

      {state.loading && (
        <SkeletonGroup>
          <div className={styles.skeletonStack}>
            <SkeletonCards count={4} height={120} />
            <SkeletonRows rows={6} height={60} />
          </div>
        </SkeletonGroup>
      )}
      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && state.data.length === 0 && (
        <EmptyState title={fr.invoices.empty} body={fr.invoices.emptyBody} />
      )}

      {state.data && state.data.length > 0 && (
        <>
          {computed.overdue.length > 0 && (
            <InlineAlert
              variant="warning"
              banner
              title={fr.invoices.overdueTitle}
              action={
                <Button size="md" onClick={() => navigate('/contact?sujet=facture')}>
                  {fr.invoices.contactDs}
                </Button>
              }
            >
              {fr.invoices.overdueBanner(
                computed.overdue.length,
                formatEuro(computed.overdue.reduce((sum, i) => sum + i.amountHT, 0)),
              )}
            </InlineAlert>
          )}

          {/* Le total impayé en tête de grille = la réponse à « dois-je quelque chose ? » */}
          <div className={styles.kpiGrid}>
            <KpiCard eyebrow={fr.invoices.kpi.unpaid} value={formatEuro(computed.unpaidTotal)} />
            <KpiCard eyebrow={fr.invoices.kpi.awaiting} value={computed.awaiting} />
            <KpiCard
              eyebrow={fr.invoices.kpi.avgDelay}
              value={computed.avgDelay ?? '—'}
              unit={computed.avgDelay !== null ? fr.invoices.kpi.days : undefined}
            />
            <KpiCard
              eyebrow={fr.invoices.kpi.nextDue}
              value={computed.nextDue ? formatDate(computed.nextDue.dueDate) : fr.invoices.kpi.none}
            />
          </div>

          <div className={styles.searchField}>
            <TextField
              label={fr.invoices.searchLabel}
              type="search"
              value={search}
              onChange={setSearch}
              placeholder={fr.invoices.searchPlaceholder}
            />
          </div>

          {rows.length === 0 ? (
            <EmptyState
              variant="no-results"
              title={fr.invoices.noResults}
              action={<Button onClick={() => setSearch('')}>{fr.invoices.clearSearch}</Button>}
            />
          ) : (
            <div className={styles.tableBlock}>
              <p className={styles.htNote}>{fr.invoices.htNote}</p>
              <DataTable
                columns={columns}
                rows={rows}
                rowKey={(i) => i.id}
                caption={fr.invoices.title}
                defaultSort="-period"
                onRowClick={(i) => navigate(`/factures/${i.id}`)}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
