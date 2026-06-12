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
          <Skeleton height={280} radius="var(--radius-xl)" />
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
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-md)',
            margin: 0,
          }}
        >
          <div>
            <dt style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)' }}>
              {fr.invoices.table.amount}
            </dt>
            <dd
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h2)',
                color: 'var(--color-accent)',
                lineHeight: 1.2,
              }}
            >
              {formatEuro(invoice.amountHT)}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)' }}>
              {fr.invoices.table.sessions}
            </dt>
            <dd style={{ margin: 0, fontSize: 'var(--text-body-lg)' }}>
              {fr.invoices.detail.sessions(invoice.sessionCount)}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)' }}>
              {invoice.paymentDate ? fr.invoices.table.paymentDate : fr.invoices.kpi.nextDue}
            </dt>
            <dd style={{ margin: 0, fontSize: 'var(--text-body-lg)' }}>
              {invoice.paymentDate
                ? fr.invoices.detail.paidOn(formatDate(invoice.paymentDate))
                : fr.invoices.detail.dueOn(formatDate(invoice.dueDate))}
            </dd>
          </div>
        </dl>
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <Button icon={Download} onClick={downloadPdf}>
            {fr.invoices.detail.downloadPdf}
          </Button>
        </div>
      </CardSection>
    </>
  );
}
