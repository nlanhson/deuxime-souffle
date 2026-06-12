import { useMemo, useState } from 'react';
import { CalendarPlus, FileSpreadsheet } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { downloadStub } from '@/lib/pdf';
import { formatDate, formatMonthYear, formatTime, toIso } from '@/lib/format';
import { unitLabel } from '@/lib/status';
import {
  Button,
  ButtonLink,
  Calendar,
  EmptyState,
  KpiCard,
  LoadError,
  RatingDisplay,
  Skeleton,
  SkeletonCards,
  SkeletonGroup,
} from '@/components';
import type { CalendarView } from '@/components';
import { PageHeader } from '@/components/PageHeader';
import { PlanSessionModal } from './PlanSessionModal';
import styles from './Dashboard.module.css';

const VIEW_KEY = 'ds-ehpad.calendarView';

/** SESS-08 — Accueil : « est-ce que quelque chose m'attend ? » en 5 secondes. */
export default function DashboardScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState<string | undefined>(undefined);

  const openPlan = (date?: string) => {
    setPlanDate(date);
    setPlanOpen(true);
  };

  const [view, setView] = useState<CalendarView>(() => {
    const stored = localStorage.getItem(VIEW_KEY);
    if (stored === 'month' || stored === 'week' || stored === 'list') return stored;
    return isMobile ? 'list' : 'month';
  });

  const changeView = (next: CalendarView) => {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  };

  const state = useAsync(
    () =>
      Promise.all([api.listSessions(), api.listContracts(), api.listCoaches()]).then(
        ([sessions, contracts, coaches]) => ({ sessions, contracts, coaches }),
      ),
    [version],
  );

  const kpis = useMemo(() => {
    if (!state.data) return null;
    const { sessions, contracts } = state.data;
    const monthPrefix = toIso(new Date()).slice(0, 7);
    const inMonth = sessions.filter((s) => s.date.startsWith(monthPrefix));
    const done = inMonth.filter((s) => s.status === 'terminee').length;
    const upcoming = inMonth.filter((s) => s.status === 'a_venir' || s.status === 'reportee').length;
    const actives = contracts.filter((c) => c.status === 'active');
    const activeUnits = [...new Set(actives.flatMap((c) => c.units))].map(unitLabel);
    const pending = sessions.filter((s) => s.status === 'terminee' && !s.evaluation).length;
    const rated = sessions.filter((s) => s.evaluation);
    const avg =
      rated.length > 0
        ? rated.reduce((sum, s) => sum + (s.evaluation?.stars ?? 0), 0) / rated.length
        : null;
    return { inMonth, done, upcoming, actives, activeUnits, pending, avg };
  }, [state.data]);

  const exportExcel = () => {
    const data = state.data;
    if (!data || !kpis) return;
    const period = formatMonthYear(new Date());
    const coachName = (id: string | null) =>
      id
        ? (data.coaches.find((c) => c.id === id)?.lastName ?? fr.calendar.unassigned)
        : fr.calendar.unassigned;
    // STUB: export tableur de démonstration (pas de vrai moteur Excel côté client)
    downloadStub(
      `Calendrier_seances_${toIso(new Date()).slice(0, 7)}.xlsx`,
      `${fr.app.name} — ${period}`,
      kpis.inMonth.map(
        (s) =>
          `${formatDate(s.date)};${formatTime(s.time)};${coachName(s.coachId)};${unitLabel(s.unitType)}`,
      ),
    );
    showToast({ message: fr.dashboard.exportDone });
  };

  return (
    <>
      <PageHeader
        title={fr.dashboard.title}
        actions={
          <>
            <Button variant="primary" size="md" icon={CalendarPlus} onClick={() => openPlan()}>
              {fr.dashboard.ctaPlan}
            </Button>
            <Button size="md" icon={FileSpreadsheet} onClick={exportExcel}>
              {fr.dashboard.ctaExport}
            </Button>
          </>
        }
      />

      {state.loading && (
        <SkeletonGroup>
          <SkeletonCards count={4} height={132} />
          <div style={{ height: 'var(--space-lg)' }} />
          <Skeleton height={420} radius="var(--radius-xl)" />
        </SkeletonGroup>
      )}

      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && kpis && (
        <>
          {/* 1 · Vue d'ensemble — cartes d'info neutres (non cliquables, sans couleur) */}
          <div className={styles.statRow}>
            <KpiCard
              eyebrow={fr.dashboard.kpi.sessionsMonth}
              value={kpis.inMonth.length}
              detail={fr.dashboard.kpi.sessionsMonthDetail(kpis.done, kpis.upcoming)}
            />
            <KpiCard
              eyebrow={fr.dashboard.kpi.activeContracts}
              value={kpis.actives.length}
              detail={kpis.activeUnits.length > 0 ? kpis.activeUnits.join(' · ') : undefined}
            />
            {/* Évaluations en attente + action directe « Évaluer » (maquette v2 + WBS).
                La couleur d'accent ne sort que s'il reste des évals à faire ; à zéro,
                carte neutre « Tout est à jour ✓ » sans action. */}
            <KpiCard
              eyebrow={fr.dashboard.kpi.pendingEvaluations}
              value={kpis.pending}
              tone={kpis.pending > 0 ? 'accent' : 'neutral'}
              detail={kpis.pending === 0 ? fr.dashboard.kpi.allUpToDate : undefined}
              action={
                kpis.pending > 0 ? (
                  <ButtonLink to="/evaluations" variant="ghost" size="md">
                    {fr.dashboard.kpi.evaluate}
                    <span aria-hidden> →</span>
                  </ButtonLink>
                ) : undefined
              }
            />
            <KpiCard
              eyebrow={fr.dashboard.kpi.avgRating}
              value={
                kpis.avg !== null
                  ? kpis.avg.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
                  : '—'
              }
              unit={kpis.avg !== null ? fr.dashboard.kpi.outOfFive : undefined}
              detail={
                kpis.avg !== null ? (
                  <RatingDisplay value={kpis.avg} showText={false} size="sm" />
                ) : (
                  fr.dashboard.kpi.avgRatingEmpty
                )
              }
            />
          </div>

          {/* 2 · Calendrier */}
          <Calendar
            sessions={state.data.sessions}
            coaches={state.data.coaches}
            view={view}
            onViewChange={changeView}
            onAddSession={openPlan}
            emptyState={
              <EmptyState
                title={fr.dashboard.emptyCalendar}
                action={
                  // secondaire : le CTA rouge « Planifier une séance » est déjà au-dessus
                  <Button onClick={() => openPlan()}>
                    {fr.dashboard.emptyCalendarAction}
                  </Button>
                }
              />
            }
          />
        </>
      )}

      <PlanSessionModal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        contracts={state.data?.contracts ?? []}
        userName={user ? `${user.firstName} ${user.lastName}` : ''}
        initialDate={planDate}
      />
    </>
  );
}
