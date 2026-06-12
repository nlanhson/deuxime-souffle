import { useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAsync } from '@/hooks/useAsync';
import { downloadStub } from '@/lib/pdf';
import { formatDate, formatEuro } from '@/lib/format';
import { invoiceStatusChip } from '@/lib/status';
import {
  Button,
  ButtonLink,
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
  const state = useAsync(() => api.getInvoice(id), [id]);
  const invoice = state.data ?? null;

  if (state.loading) {
    return (
      <>
        <PageHeader title={fr.invoices.title} crumbs={[{ label: fr.invoices.detail.breadcrumb, to: '/factures' }]} />
        <SkeletonGroup>
          <Skeleton height={280} radius="var(--radius-lg)" />
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
      `${fr.invoices.table.period} : ${invoice.period}`,
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

      <CardSection title={invoice.period}>
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
          <Button icon={Download} onClick={downloadPdf}>
            {fr.invoices.detail.downloadPdf}
          </Button>
        </div>
      </CardSection>
    </>
  );
}
