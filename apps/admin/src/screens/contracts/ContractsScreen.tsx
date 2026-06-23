import { useMemo, useState } from 'react';
import { Check, X, FileText, RefreshCw, Plus } from 'lucide-react';
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
  Modal,
  DefinitionList,
  Field,
  RadioCards,
  TextArea,
} from '@/components';
import type { Column, TabItem } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './ContractsScreen.module.css';
import { CreateContractWizard } from './CreateContractWizard';
import {
  CONTRACTS,
  CONTRACT_KPIS,
  STATUS_META,
  FIT_META,
  REJECT_REASON_VALUES,
  type Contract,
} from './data';

type TabId = 'pending' | 'active' | 'renewal' | 'all';

const TAB_FILTER: Record<TabId, (c: Contract) => boolean> = {
  pending: (c) => c.status === 'pending',
  active: (c) => c.status === 'active',
  renewal: (c) => c.status === 'renewal',
  all: () => true,
};

type Decision = 'approved' | 'rejected';

export function ContractsScreen() {
  const t = useStrings();
  const [tab, setTab] = useState<TabId>('pending');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Contract | null>(null);
  const [creating, setCreating] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const filtered = useMemo(
    () =>
      CONTRACTS.filter(TAB_FILTER[tab]).filter((c) =>
        query.trim()
          ? `${c.ehpad} ${c.city} ${c.id} ${c.group ?? ''}`.toLowerCase().includes(query.toLowerCase())
          : true,
      ),
    [tab, query],
  );

  const tabs: TabItem[] = [
    { id: 'pending', label: t.contracts.tabs.pending, count: CONTRACTS.filter(TAB_FILTER.pending).length },
    { id: 'active', label: t.contracts.tabs.active, count: CONTRACTS.filter(TAB_FILTER.active).length },
    { id: 'renewal', label: t.contracts.tabs.renewal, count: CONTRACTS.filter(TAB_FILTER.renewal).length },
    { id: 'all', label: t.contracts.tabs.all },
  ];

  function decide(id: string, decision: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
    setOpen(null);
  }

  const columns: Column<Contract>[] = [
    {
      key: 'ref',
      header: t.contracts.columns.ref,
      render: (c) => <span className={shared.num}>{c.id}</span>,
    },
    {
      key: 'ehpad',
      header: t.contracts.columns.ehpad,
      render: (c) => (
        <span className={shared.cellStack}>
          <span className={shared.cellStrong}>{c.ehpad}</span>
          <span className={shared.cellMuted}>
            {c.group ? `${c.group} · ` : ''}
            {c.city}
          </span>
        </span>
      ),
    },
    {
      key: 'frequency',
      header: t.contracts.columns.frequency,
      secondary: true,
      render: (c) => (
        <span className={shared.cellStack}>
          <span>{c.frequency}</span>
          <span className={shared.cellMuted}>{c.units.join(', ')}</span>
        </span>
      ),
    },
    {
      key: 'period',
      header: t.contracts.columns.period,
      secondary: true,
      render: (c) => (
        <span className={shared.cellMuted}>
          {c.start} → {c.end}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.contracts.columns.status,
      align: 'end',
      render: (c) => {
        const d = decisions[c.id];
        if (d === 'approved') return <Pill tone="progress">{t.contracts.decision.approved}</Pill>;
        if (d === 'rejected') return <Pill tone="danger">{t.contracts.decision.rejected}</Pill>;
        const meta = STATUS_META[c.status];
        return <Pill tone={meta.tone}>{t.contracts.status[c.status]}</Pill>;
      },
    },
  ];

  return (
    <div className={shared.stack}>
      <PageHeader
        title={t.contracts.title}
        subtitle={t.contracts.subtitle}
        actions={<Button icon={Plus} onClick={() => setCreating(true)}>{t.contracts.newContract}</Button>}
      />

      <section className={shared.kpis} aria-label={t.contracts.kpiAria}>
        {CONTRACT_KPIS.map((k) => {
          const copy = t.contracts.kpis[k.id];
          return (
            <KpiCard
              key={k.id}
              label={copy.label}
              value={copy.value}
              {...(copy.hint ? { hint: copy.hint } : {})}
              {...(k.lead ? { lead: true } : {})}
            />
          );
        })}
      </section>

      <Tabs items={tabs} active={tab} onChange={(id) => setTab(id as TabId)} ariaLabel={t.contracts.tabsAria} />

      <Card className={styles.tableCard}>
        <Toolbar end={<span className={shared.count}>{t.contracts.count(filtered.length)}</span>}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.contracts.searchPlaceholder}
            label={t.contracts.searchLabel}
          />
        </Toolbar>
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(c) => c.id}
          onRowClick={(c) => setOpen(c)}
          ariaLabel={t.contracts.tableAria}
          empty={t.contracts.empty}
        />
      </Card>

      <ContractDetail
        contract={open}
        decision={open ? decisions[open.id] : undefined}
        onClose={() => setOpen(null)}
        onDecide={decide}
      />
      <CreateContractWizard open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}

function ContractDetail({
  contract,
  decision,
  onClose,
  onDecide,
}: {
  contract: Contract | null;
  decision?: Decision | undefined;
  onClose: () => void;
  onDecide: (id: string, d: Decision) => void;
}) {
  const t = useStrings();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  if (!contract) return null;
  const c = contract;
  const meta = STATUS_META[c.status];
  const isPending = c.status === 'pending' && !decision;
  const rejectOptions = REJECT_REASON_VALUES.map((value) => ({
    value,
    label: t.contracts.rejectReasons[value],
  }));

  return (
    <Modal
      open={Boolean(contract)}
      onClose={onClose}
      size="wide"
      title={`${c.ehpad} — ${c.id}`}
      subtitle={`${c.frequency} · ${c.units.join(', ')}`}
      footer={
        isPending ? (
          rejecting ? (
            <>
              <Button variant="ghost" onClick={() => setRejecting(false)}>
                {t.contracts.reject.back}
              </Button>
              <Button
                variant="danger"
                icon={X}
                disabled={!reason}
                disabledReason={reason ? undefined : t.contracts.reject.reasonRequired}
                onClick={() => onDecide(c.id, 'rejected')}
              >
                {t.contracts.reject.confirm}
              </Button>
            </>
          ) : (
            <>
              <Button variant="danger" icon={X} onClick={() => setRejecting(true)}>
                {t.contracts.detail.reject}
              </Button>
              <Button variant="secondary" icon={Check} onClick={() => onDecide(c.id, 'approved')}>
                {t.contracts.detail.approveWithChanges}
              </Button>
              <Button icon={Check} onClick={() => onDecide(c.id, 'approved')}>
                {t.contracts.detail.approve}
              </Button>
            </>
          )
        ) : c.status === 'renewal' ? (
          <Button icon={RefreshCw}>{t.contracts.detail.startRenewal}</Button>
        ) : undefined
      }
    >
      <div className={styles.detail}>
        <div className={styles.detailTop}>
          <Pill tone={meta.tone}>{t.contracts.status[c.status]}</Pill>
          {c.daysToEnd !== undefined && (
            <span className={shared.muted}>{t.contracts.detail.dueIn(c.daysToEnd)}</span>
          )}
        </div>

        {c.majorChange && (
          <div className={shared.banner} data-tone="warning">
            <FileText className={shared.bannerIcon} size={18} aria-hidden />
            <p className={shared.bannerText}>
              <strong>{t.contracts.detail.majorChangeLabel}</strong> {c.majorChange}. {t.contracts.detail.adminRequired}
            </p>
          </div>
        )}

        {c.rejectionReason && (
          <div className={shared.banner} data-tone="danger">
            <X className={shared.bannerIcon} size={18} aria-hidden />
            <p className={shared.bannerText}>
              <strong>{t.contracts.detail.rejectionReasonLabel}</strong> {c.rejectionReason}
            </p>
          </div>
        )}

        {rejecting && (
          <div className={styles.rejectBox}>
            <Field label={t.contracts.reject.reasonLabel} required>
              {() => <RadioCards name="reject" options={rejectOptions} value={reason} onChange={setReason} columns={2} />}
            </Field>
            <Field label={t.contracts.reject.precisionLabel}>
              {(id) => <TextArea id={id} placeholder={t.contracts.reject.precisionPlaceholder} />}
            </Field>
          </div>
        )}

        <DefinitionList
          items={[
            { term: t.contracts.detail.period, value: `${c.start} → ${c.end}` },
            { term: t.contracts.detail.rate, value: t.contracts.detail.rateValue(c.rate) },
            { term: t.contracts.detail.units, value: c.units.join(', ') },
            { term: t.contracts.detail.sessionsGenerated, value: `${c.completed} / ${c.generated}` },
            ...(c.group ? [{ term: t.contracts.detail.group, value: c.group }] : []),
            ...(c.notes ? [{ term: t.contracts.detail.notes, value: c.notes }] : []),
          ]}
        />

        {c.slots && c.slots.length > 0 && (
          <section className={styles.block}>
            <h3 className={styles.blockTitle}>{t.contracts.detail.slotsTitle}</h3>
            <ul className={styles.slots}>
              {c.slots.map((s) => {
                const fit = FIT_META[s.fit];
                return (
                  <li key={s.label} className={styles.slot}>
                    <span className={shared.num}>{s.label}</span>
                    <Pill tone={fit.tone}>{t.contracts.fit[s.fit]}</Pill>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
