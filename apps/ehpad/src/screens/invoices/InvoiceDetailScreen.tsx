import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAsync } from '@/hooks/useAsync';
import { downloadStub } from '@/lib/pdf';
import { invoiceLineItems } from '@/lib/invoice';
import {
  capitalize,
  formatDate,
  formatEuro,
  formatMonthYear,
  formatShortDate,
  parseDate,
} from '@/lib/format';
import { invoiceStatusChip, unitLabel } from '@/lib/status';
import {
  Button,
  ButtonLink,
  Card,
  CardSection,
  EmptyState,
  LoadError,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  StatusChip,
} from '@/components';
import styles from './invoices.module.css';

/** BILL-01 — détail d'une facture + téléchargement PDF (simulé). Montants HT. */
export default function InvoiceDetailScreen() {
  const fr = useStrings();
  const { id = '' } = useParams();
  const state = useAsync(
    () =>
      Promise.all([api.getInvoice(id), api.listCoaches()]).then(([invoice, coaches]) => ({
        invoice,
        coaches,
      })),
    [id],
  );
  const invoice = state.data?.invoice ?? null;
  const coaches = useMemo(() => state.data?.coaches ?? [], [state.data]);

  // Détail séance-par-séance (simulé, déterministe) — cf. lib/invoice.ts.
  const lines = useMemo(() => (invoice ? invoiceLineItems(invoice, coaches) : []), [invoice, coaches]);
  const coachName = (coachId: string): string => {
    const c = coaches.find((x) => x.id === coachId);
    return c ? `${c.firstName} ${c.lastName}` : '—';
  };

  if (state.loading) {
    return (
      <>
        <PageHeader
          title={fr.invoices.title}
          crumbs={[{ label: fr.invoices.detail.breadcrumb, to: '/factures' }]}
          intro={fr.invoices.htNote}
          actions={<Skeleton height={28} width={120} radius="var(--radius-pill)" />}
        />
        <SkeletonGroup>
          <Card>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <Skeleton height={20} width={180} radius="var(--radius-md)" />
            </div>
            <dl className={styles.detailGrid}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <Skeleton height={12} width="55%" radius="var(--radius-pill)" />
                <Skeleton height={32} width="70%" radius="var(--radius-md)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <Skeleton height={12} width="55%" radius="var(--radius-pill)" />
                <Skeleton height={18} width="65%" radius="var(--radius-md)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <Skeleton height={12} width="55%" radius="var(--radius-pill)" />
                <Skeleton height={18} width="65%" radius="var(--radius-md)" />
              </div>
            </dl>
            <div className={styles.cardActions}>
              <Skeleton height={40} width={150} radius="var(--radius-md)" />
            </div>
          </Card>
        </SkeletonGroup>
      </>
    );
  }

  if (state.error) {
    return (
      <>
        <PageHeader title={fr.invoices.title} crumbs={[{ label: fr.invoices.detail.breadcrumb, to: '/factures' }]} />
        <LoadError onRetry={state.retry} />
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <PageHeader title={fr.invoices.title} crumbs={[{ label: fr.invoices.detail.breadcrumb, to: '/factures' }]} />
        <EmptyState
          title={fr.invoices.notFound}
          body={fr.common.notFoundBody}
          action={<ButtonLink to="/factures">{fr.common.back}</ButtonLink>}
        />
      </>
    );
  }

  const title = fr.invoices.detail.title(invoice.number);

  const downloadPdf = () => {
    // STUB: PDF une page généré côté client
    downloadStub(fr.invoices.detail.pdfName(invoice.number), title, [
      `${fr.invoices.table.period} : ${capitalize(formatMonthYear(parseDate(invoice.period)))}`,
      `${fr.invoices.table.sessions} : ${invoice.sessionCount}`,
      `${fr.invoices.table.amount} : ${formatEuro(invoice.amountHT)}`,
      `${fr.invoices.table.status} : ${invoiceStatusChip(invoice.status).label}`,
      invoice.paymentDate
        ? fr.invoices.detail.paidOn(formatDate(invoice.paymentDate))
        : fr.invoices.detail.dueOn(formatDate(invoice.dueDate)),
      fr.invoices.htNote,
    ]);
  };

  return (
    <>
      <PageHeader
        title={title}
        crumbs={[{ label: fr.invoices.detail.breadcrumb, to: '/factures' }, { label: title }]}
        intro={fr.invoices.htNote}
        actions={<StatusChip spec={invoiceStatusChip(invoice.status)} />}
      />

      <CardSection title={capitalize(formatMonthYear(parseDate(invoice.period)))}>
        <dl className={styles.detailGrid}>
          <div>
            <dt className={styles.detailLabel}>{fr.invoices.table.amount}</dt>
            <dd className={styles.amount}>{formatEuro(invoice.amountHT)}</dd>
          </div>
          <div>
            <dt className={styles.detailLabel}>{fr.invoices.table.sessions}</dt>
            <dd className={styles.detailValue}>{fr.invoices.detail.sessions(invoice.sessionCount)}</dd>
          </div>
          <div>
            <dt className={styles.detailLabel}>
              {invoice.paymentDate ? fr.invoices.table.paymentDate : fr.invoices.kpi.nextDue}
            </dt>
            <dd className={styles.detailValue}>
              {invoice.paymentDate
                ? fr.invoices.detail.paidOn(formatDate(invoice.paymentDate))
                : fr.invoices.detail.dueOn(formatDate(invoice.dueDate))}
            </dd>
          </div>
        </dl>
        <div className={styles.cardActions}>
          {/* Action principale de la page : télécharger la facture → CTA primaire (dégradé). */}
          <Button variant="primary" icon={Download} onClick={downloadPdf}>
            {fr.invoices.detail.downloadPdf}
          </Button>
        </div>
      </CardSection>

      {/* QE-6 — détail séance-par-séance (transparence de facturation) : date, coach,
          type, montant unitaire. Données simulées déterministes (cf. lib/invoice.ts) ;
          la somme des lignes égale toujours le montant HT de la facture. */}
      {lines.length > 0 && (
        <CardSection title={fr.invoices.detail.breakdownTitle}>
          <p className={styles.breakdownIntro}>{fr.invoices.detail.breakdownIntro}</p>
          <div className={styles.breakdownScroll}>
            <table className={styles.breakdownTable}>
              <thead>
                <tr>
                  <th scope="col">{fr.invoices.detail.breakdownDate}</th>
                  <th scope="col">{fr.invoices.detail.breakdownCoach}</th>
                  <th scope="col">{fr.invoices.detail.breakdownType}</th>
                  <th scope="col" className={styles.breakdownNum}>
                    {fr.invoices.detail.breakdownAmount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={`${line.date}-${i}`}>
                    <td>{capitalize(formatShortDate(line.date))}</td>
                    <td>{coachName(line.coachId)}</td>
                    <td>{unitLabel(line.unitType)}</td>
                    <td className={styles.breakdownNum}>{formatEuro(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={3}>
                    {fr.invoices.detail.breakdownTotal}
                  </th>
                  <td className={styles.breakdownNum}>{formatEuro(invoice.amountHT)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardSection>
      )}
    </>
  );
}
