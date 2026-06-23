import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { PageHeader, KpiCard, Card, Button, Pill, Tabs } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useStrings } from '@/i18n';
import type { Copy, KpiId } from '@/i18n/fr';
import type { KpiCardProps } from '@/components';
import { AnalyticsPanel } from '../analytics/AnalyticsScreen';
import { MonitoringPanel } from '../monitoring/MonitoringPanel';
import styles from './DashboardScreen.module.css';

/* Presentation metadata — the 4 DASH-14 KPIs (text/values live in i18n). */
type Trend = NonNullable<KpiCardProps['trend']>['dir'];
type PillTone = 'neutral' | 'info' | 'progress' | 'warning' | 'danger' | 'reward';

const KPI_META: { id: KpiId; lead?: boolean; trend?: Trend }[] = [
  { id: 'fillRate', lead: true, trend: 'up' },
  { id: 'coachlessSessions' },
  { id: 'monthlyRevenue', lead: true },
  { id: 'satisfaction' },
];

/* Mock: sessions awaiting assignment validation (DASH-14). `d7` flags a session
   reaching D-7; `EMERGENCY_COUNT` is the coachless-cascade subset (→ DASH-15). */
interface PendingSession {
  id: string;
  day: string;
  time: string;
  ehpad: string;
  coach: string;
  score: number;
  d7: boolean;
}

const PENDING_VALIDATION: PendingSession[] = [
  { id: 'v1', day: 'Lun. 16', time: '10:00', ehpad: 'EHPAD Les Tilleuls', coach: 'Karim Benali', score: 96, d7: false },
  { id: 'v2', day: 'Lun. 16', time: '14:00', ehpad: 'Résidence Bellevue', coach: 'Léa Dubois', score: 91, d7: true },
  { id: 'v3', day: 'Mar. 17', time: '11:00', ehpad: 'La Roseraie', coach: 'Sophie Marchand', score: 84, d7: false },
  { id: 'v4', day: 'Mer. 18', time: '09:30', ehpad: 'Résidence du Parc', coach: 'Nadia Cherif', score: 78, d7: true },
];

const EMERGENCY_COUNT = 3;

const scoreTone = (s: number): PillTone => (s >= 90 ? 'progress' : s >= 80 ? 'info' : 'warning');

type TabId = 'overview' | 'analytics' | 'monitoring';

/**
 * Admin Dashboard & KPIs (WBS epic DASH-01..15). One destination, three tabs:
 * Overview is the live operational cockpit (DASH-14); Analytics is the
 * period-filtered reporting (DASH-01, 06–11); Supervision is the read-only
 * monitoring rollups (DASH-02, 03, 05, 12, 13).
 */
export function DashboardScreen() {
  const fr = useStrings();
  const { user } = useAuth();
  const firstName = user?.name.split(' ')[0] ?? 'Camille';
  const [tab, setTab] = useState<TabId>('overview');

  const subtitle: Record<TabId, string> = {
    overview: fr.dashboard.subtitle,
    analytics: fr.dashboard.analyticsSubtitle,
    monitoring: fr.dashboard.monitoringSubtitle,
  };

  return (
    <>
      <PageHeader
        title={fr.dashboard.greeting(firstName)}
        subtitle={subtitle[tab]}
        actions={tab === 'overview' ? <Button>{fr.dashboard.runAssignments}</Button> : undefined}
      />

      <div className={styles.tabBar}>
        <Tabs
          items={[
            { id: 'overview', label: fr.dashboard.tabs.overview },
            { id: 'analytics', label: fr.dashboard.tabs.analytics },
            { id: 'monitoring', label: fr.dashboard.tabs.monitoring },
          ]}
          active={tab}
          onChange={(id) => setTab(id as TabId)}
          ariaLabel={fr.dashboard.tabsAria}
        />
      </div>

      {tab === 'overview' && <Overview fr={fr} />}
      {tab === 'analytics' && <AnalyticsPanel />}
      {tab === 'monitoring' && <MonitoringPanel />}
    </>
  );
}

/**
 * DASH-14 Operational Overview — the focused cockpit: 4 KPIs, the emergency
 * cascade alert, and the queue of sessions awaiting assignment validation.
 */
function Overview({ fr }: { fr: Copy }) {
  return (
    <div className={styles.body}>
      <section className={styles.kpis} aria-label={fr.dashboard.kpiAria}>
        {KPI_META.map((meta) => {
          const copy = fr.dashboard.kpis[meta.id];
          const trend = meta.trend && copy.trend ? { dir: meta.trend, label: copy.trend } : null;
          return (
            <KpiCard
              key={meta.id}
              label={copy.label}
              value={copy.value}
              {...(copy.hint !== undefined ? { hint: copy.hint } : {})}
              {...(meta.lead ? { lead: meta.lead } : {})}
              {...(trend ? { trend } : {})}
            />
          );
        })}
      </section>

      {EMERGENCY_COUNT > 0 && (
        <Link to="/affectations" className={styles.emergency} data-tone="danger">
          <AlertTriangle size={20} className={styles.emergencyIcon} aria-hidden />
          <span className={styles.emergencyText}>{fr.dashboard.emergencyTitle(EMERGENCY_COUNT)}</span>
          <span className={styles.emergencyCta}>
            {fr.dashboard.emergencyCta}
            <ChevronRight size={16} aria-hidden />
          </span>
        </Link>
      )}

      <Card className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>{fr.dashboard.validationTitle}</h3>
          <span className={styles.panelMeta}>{fr.dashboard.validationMeta}</span>
        </div>
        {PENDING_VALIDATION.length === 0 ? (
          <p className={styles.empty}>{fr.dashboard.empty}</p>
        ) : (
          <ul className={styles.validation}>
            {PENDING_VALIDATION.map((s) => (
              <li key={s.id}>
                <Link to="/affectations" className={styles.vRow} data-d7={s.d7 || undefined}>
                  <span className={styles.vWhen}>
                    <span className={styles.vDay}>{s.day}</span>
                    <span className={styles.vTime}>{s.time}</span>
                  </span>
                  <span className={styles.vMain}>
                    <span className={styles.vEhpad}>{s.ehpad}</span>
                    <span className={styles.vCoach}>
                      {fr.dashboard.proposed} · {s.coach}
                    </span>
                  </span>
                  {s.d7 ? <Pill tone="danger">{fr.dashboard.d7}</Pill> : null}
                  <span className={styles.vScore}>
                    <span className={styles.vScoreLabel}>{fr.dashboard.score}</span>
                    <Pill tone={scoreTone(s.score)}>{s.score}</Pill>
                  </span>
                  <ChevronRight size={18} className={styles.vChevron} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
