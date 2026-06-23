import { useMemo, useState } from 'react';
import { FileDown, Send, Star } from 'lucide-react';
import {
  PageHeader,
  KpiCard,
  Card,
  Pill,
  Tabs,
  Table,
  Toolbar,
  SearchInput,
  Button,
} from '@/components';
import type { Column, TabItem } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './ReportsScreen.module.css';
import { CRS, CR_KPIS, DELAY_TONE, type CR } from './data';

type TabId = 'all' | 'reportMissing' | 'evalMissing' | 'complete';

const TAB_FILTER: Record<TabId, (c: CR) => boolean> = {
  all: () => true,
  reportMissing: (c) => c.report === 'missing',
  evalMissing: (c) => c.evaluation === 'missing',
  complete: (c) => c.report === 'complete' && c.evaluation === 'received',
};

export function ReportsScreen() {
  const t = useStrings();
  const [tab, setTab] = useState<TabId>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      CRS.filter(TAB_FILTER[tab]).filter((c) =>
        query.trim() ? `${c.ehpad} ${c.coach}`.toLowerCase().includes(query.toLowerCase()) : true,
      ),
    [tab, query],
  );

  const tabs: TabItem[] = [
    { id: 'all', label: t.reports.tabs.all },
    { id: 'reportMissing', label: t.reports.tabs.reportMissing, count: CRS.filter(TAB_FILTER.reportMissing).length },
    { id: 'evalMissing', label: t.reports.tabs.evalMissing, count: CRS.filter(TAB_FILTER.evalMissing).length },
    { id: 'complete', label: t.reports.tabs.complete, count: CRS.filter(TAB_FILTER.complete).length },
  ];

  const columns: Column<CR>[] = [
    {
      key: 'date',
      header: t.reports.columns.session,
      render: (c) => (
        <span className={shared.cellStack}>
          <span className={shared.cellStrong}>{c.date}</span>
          <span className={shared.cellMuted}>{c.unit}</span>
        </span>
      ),
    },
    { key: 'ehpad', header: t.reports.columns.establishment, render: (c) => c.ehpad },
    { key: 'coach', header: t.reports.columns.coach, secondary: true, render: (c) => c.coach },
    {
      key: 'report',
      header: t.reports.columns.report,
      render: (c) =>
        c.report === 'complete' ? (
          <Pill tone="progress">{t.reports.report.complete}</Pill>
        ) : (
          <Pill tone="danger">{t.reports.report.missing}</Pill>
        ),
    },
    {
      key: 'delay',
      header: t.reports.columns.delay,
      secondary: true,
      render: (c) =>
        c.delayKind === 'none' ? (
          <span className={shared.cellMuted}>—</span>
        ) : (
          <Pill tone={DELAY_TONE[c.delayKind]}>{c.delay}</Pill>
        ),
    },
    {
      key: 'eval',
      header: t.reports.columns.evaluation,
      render: (c) =>
        c.evaluation === 'received' ? (
          <span className={styles.ratingCell}>
            <Star size={13} className={styles.star} aria-hidden />
            {c.rating}
          </span>
        ) : (
          <Pill tone="warning">{t.reports.evaluation.pending}</Pill>
        ),
    },
    {
      key: 'actions',
      header: t.reports.columns.actions,
      align: 'end',
      render: (c) =>
        c.report === 'missing' || c.evaluation === 'missing' ? (
          <Button size="md" variant="ghost" icon={Send}>
            {t.reports.actions.remind}
          </Button>
        ) : (
          <Button size="md" variant="ghost" icon={FileDown}>
            {t.reports.actions.pdf}
          </Button>
        ),
    },
  ];

  return (
    <div className={shared.stack}>
      <PageHeader title={t.reports.title} subtitle={t.reports.subtitle} />

      <section className={shared.kpis} aria-label={t.reports.kpiAria}>
        {CR_KPIS.map((k) => {
          const copy = t.reports.kpis[k.id];
          return (
            <KpiCard
              key={k.id}
              label={copy.label}
              value={k.value}
              {...(copy.hint !== undefined ? { hint: copy.hint } : {})}
              {...(k.lead ? { lead: true } : {})}
            />
          );
        })}
      </section>

      <Tabs items={tabs} active={tab} onChange={(id) => setTab(id as TabId)} ariaLabel={t.reports.tabsAria} />

      <Card className={styles.tableCard}>
        <Toolbar end={<span className={shared.count}>{t.reports.count(filtered.length)}</span>}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.reports.searchPlaceholder}
            label={t.reports.searchLabel}
          />
        </Toolbar>
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(c) => c.id}
          ariaLabel={t.reports.tableAria}
          empty={t.reports.empty}
        />
      </Card>
    </div>
  );
}
