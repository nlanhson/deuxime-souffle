import { Link } from 'react-router-dom';
import {
  CalendarRange,
  MapPin,
  CalendarCheck,
  FileText,
  Receipt,
  Star,
  ChevronRight,
  AlertTriangle,
  Clock,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader, KpiCard, Card, Button, Pill } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useStrings } from '@/i18n';
import type { KpiId, QueueId } from '@/i18n/fr';
import type { KpiCardProps } from '@/components';
import styles from './DashboardScreen.module.css';

/* Presentation metadata — icons, tones, trend direction and demo counts. The
   user-facing text (labels, values, hints, notes) lives in the i18n dictionary,
   keyed by id, so the cockpit switches language with the rest of the console. */
type Trend = NonNullable<KpiCardProps['trend']>['dir'];
type PillTone = 'neutral' | 'info' | 'progress' | 'warning' | 'danger' | 'reward';

const KPI_META: { id: KpiId; icon: LucideIcon; lead?: boolean; trend?: Trend }[] = [
  { id: 'sessionsWeek', icon: CalendarRange, trend: 'up' },
  { id: 'coverage', icon: MapPin, lead: true, trend: 'up' },
  { id: 'pendingAssignments', icon: CalendarCheck, trend: 'flat' },
  { id: 'contractsToValidate', icon: FileText },
  { id: 'monthlyBilling', icon: Receipt, lead: true },
  { id: 'avgTrust', icon: Star },
];

const QUEUE_META: { id: QueueId; to: string; count: number; tone: PillTone }[] = [
  { id: 'assignments', to: '/affectations', count: 6, tone: 'warning' },
  { id: 'contracts', to: '/contrats', count: 4, tone: 'warning' },
  { id: 'coaches', to: '/coachs', count: 2, tone: 'info' },
  { id: 'sessions', to: '/seances', count: 1, tone: 'danger' },
];

const ACTIVITY_META: { icon: LucideIcon; tone: 'progress' | 'info' | 'danger' | 'neutral' }[] = [
  { icon: UserCheck, tone: 'progress' },
  { icon: FileText, tone: 'info' },
  { icon: AlertTriangle, tone: 'danger' },
  { icon: Clock, tone: 'neutral' },
];

export function DashboardScreen() {
  const fr = useStrings();
  const { user } = useAuth();
  const firstName = user?.name.split(' ')[0] ?? 'Camille';

  return (
    <>
      <PageHeader
        title={fr.dashboard.greeting(firstName)}
        subtitle={fr.dashboard.subtitle}
        actions={<Button>{fr.dashboard.runAssignments}</Button>}
      />

      <section className={styles.kpis} aria-label={fr.dashboard.kpiAria}>
        {KPI_META.map((meta) => {
          const copy = fr.dashboard.kpis[meta.id];
          const trend = meta.trend && copy.trend ? { dir: meta.trend, label: copy.trend } : null;
          return (
            <KpiCard
              key={meta.id}
              label={copy.label}
              value={copy.value}
              icon={meta.icon}
              {...(copy.hint !== undefined ? { hint: copy.hint } : {})}
              {...(meta.lead ? { lead: meta.lead } : {})}
              {...(trend ? { trend } : {})}
            />
          );
        })}
      </section>

      <div className={styles.columns}>
        <Card className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>{fr.dashboard.queueTitle}</h3>
            <span className={styles.panelMeta}>{fr.dashboard.queueMeta}</span>
          </div>
          <ul className={styles.queue}>
            {QUEUE_META.map((q) => {
              const copy = fr.dashboard.queue[q.id];
              return (
                <li key={q.id}>
                  <Link to={q.to} className={styles.queueRow}>
                    <span className={styles.queueCount}>
                      <Pill tone={q.tone}>{q.count}</Pill>
                    </span>
                    <span className={styles.queueText}>
                      <span className={styles.queueLabel}>{copy.label}</span>
                      <span className={styles.queueNote}>{copy.note}</span>
                    </span>
                    <ChevronRight size={18} className={styles.queueChevron} aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>{fr.dashboard.activityTitle}</h3>
            <span className={styles.panelMeta}>{fr.dashboard.activityMeta}</span>
          </div>
          <ul className={styles.activity}>
            {ACTIVITY_META.map((a, i) => {
              const Icon = a.icon;
              const copy = fr.dashboard.activity[i];
              if (!copy) return null;
              return (
                <li key={i} className={styles.activityRow}>
                  <span className={`${styles.activityIcon} ${styles[`tone_${a.tone}`]}`}>
                    <Icon size={16} aria-hidden />
                  </span>
                  <span className={styles.activityText}>{copy.text}</span>
                  <span className={styles.activityTime}>{copy.time}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
