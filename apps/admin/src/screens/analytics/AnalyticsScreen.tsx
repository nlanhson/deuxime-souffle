import { useState } from 'react';
import { Star } from 'lucide-react';
import { KpiCard, Card, CardSection, Table, Pill, Tabs } from '@/components';
import type { Column } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './AnalyticsScreen.module.css';
import {
  TIME_FILTERS,
  HEALTH,
  ACTIVITY,
  PRICING,
  REVENUE_BY_EHPAD,
  REVENUE_BY_GROUP,
  TOP_COACHES,
  TOP_EHPADS,
  type RevenueRow,
} from './data';

const euro = (n: number) => `${n.toLocaleString('fr-FR')} €`;

/**
 * Analytics tab body for the Dashboard (WBS DASH-01, 06–11). Renders without a
 * page header — the Dashboard container owns the title; this panel carries only
 * its own period filter.
 */
export function AnalyticsPanel() {
  const t = useStrings();
  const [range, setRange] = useState('3');

  const revenueCols: Column<RevenueRow>[] = [
    { key: 'ehpad', header: t.analytics.revenueTable.ehpad, render: (r) => r.ehpad },
    { key: 'group', header: t.analytics.revenueTable.group, secondary: true, render: (r) => <Pill tone="neutral">{r.group}</Pill> },
    { key: 'sessions', header: t.analytics.revenueTable.sessions, align: 'end', render: (r) => <span className={shared.num}>{r.sessions}</span> },
    { key: 'avgRate', header: t.analytics.revenueTable.avgRate, align: 'end', secondary: true, render: (r) => <span className={shared.num}>{r.avgRate} €</span> },
    { key: 'revenue', header: t.analytics.revenueTable.revenue, align: 'end', render: (r) => <span className={`${shared.num} ${styles.strong}`}>{euro(r.revenue)}</span> },
    { key: 'margin', header: t.analytics.revenueTable.margin, align: 'end', secondary: true, render: (r) => <span className={shared.num}>{r.margin} %</span> },
  ];

  return (
    <div className={shared.stack}>
      <div className={styles.toolbar}>
        <Tabs
          items={TIME_FILTERS.map((f) => ({ id: f.value, label: t.analytics.periods[f.value] }))}
          active={range}
          onChange={setRange}
          ariaLabel={t.analytics.periodAria}
        />
      </div>

      <CardSection title={t.analytics.sections.health}>
        <div className={shared.kpis}>
          {HEALTH.map((h) => (
            <KpiCard key={h.id} label={t.analytics.health[h.id]} value={h.value} hint={h.hint} />
          ))}
        </div>
      </CardSection>

      <CardSection title={t.analytics.sections.activity}>
        <div className={shared.kpis}>
          {ACTIVITY.map((a) => (
            <KpiCard key={a.id} label={t.analytics.activity[a.id]} value={a.value} hint={a.hint} {...(a.lead ? { lead: true } : {})} />
          ))}
        </div>
      </CardSection>

      <CardSection title={t.analytics.sections.pricing}>
        <div className={styles.pricing}>
          <div className={styles.pricingLead}>
            <span className={shared.cellMuted}>{t.analytics.pricingLeadLabel}</span>
            <span className={styles.pricingValue}>{PRICING.avg}</span>
            <Pill tone="progress">{PRICING.trend}</Pill>
          </div>
          <div className={styles.bars}>
            {PRICING.distribution.map((d) => (
              <div key={d.label} className={styles.barRow}>
                <span className={styles.barLabel}>{d.label}</span>
                <span className={styles.barTrack}>
                  <span className={styles.barFill} style={{ width: `${d.ratio * 100}%` }} />
                </span>
                <span className={styles.barCount}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardSection>

      <Card className={styles.tableCard}>
        <h3 className={styles.blockTitle}>{t.analytics.revenueTableTitle}</h3>
        <Table columns={revenueCols} rows={REVENUE_BY_EHPAD} getRowKey={(r) => r.ehpad} ariaLabel={t.analytics.revenueTableAria} />
      </Card>

      <CardSection title={t.analytics.sections.byGroup}>
        <div className={styles.groups}>
          {REVENUE_BY_GROUP.map((g) => (
            <div key={g.group} className={styles.groupCard}>
              <span className={shared.cellStrong}>{g.group}</span>
              <span className={styles.groupRevenue}>{g.revenue}</span>
              <span className={shared.cellMuted}>
                {t.analytics.groupMeta(g.sessions, g.homes)}
              </span>
              <Pill tone={g.trend.startsWith('−') ? 'danger' : 'progress'}>{g.trend}</Pill>
            </div>
          ))}
        </div>
      </CardSection>

      <div className={shared.split}>
        <CardSection title={t.analytics.sections.topCoaches}>
          <TopList rows={TOP_COACHES} sessionsLabel={t.analytics.sessionsCount} />
        </CardSection>
        <CardSection title={t.analytics.sections.topEhpads}>
          <TopList rows={TOP_EHPADS} sessionsLabel={t.analytics.sessionsCount} />
        </CardSection>
      </div>
    </div>
  );
}

function TopList({
  rows,
  sessionsLabel,
}: {
  rows: { name: string; sessions: number; rating: number }[];
  sessionsLabel: (n: number) => string;
}) {
  return (
    <ol className={styles.topList}>
      {rows.map((r, i) => (
        <li key={r.name} className={styles.topRow}>
          <span className={styles.rank}>{i + 1}</span>
          <span className={styles.topName}>{r.name}</span>
          <span className={shared.cellMuted}>{sessionsLabel(r.sessions)}</span>
          <span className={styles.topRating}>
            <Star size={13} className={styles.star} aria-hidden />
            {r.rating.toFixed(1)}
          </span>
        </li>
      ))}
    </ol>
  );
}
