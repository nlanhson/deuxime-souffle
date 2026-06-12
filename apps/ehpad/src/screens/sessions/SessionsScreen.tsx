import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarRange, ChevronRight, Clock3, FileText, Star, User, Users } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { addDays } from '@/lib/calendar';
import {
  capitalize,
  formatDate,
  formatDuration,
  formatTime,
  formatWeekday,
  formatWeekdayDate,
  toIso,
} from '@/lib/format';
import { sessionStatusChip, unitLabel, unitTone } from '@/lib/status';
import {
  Avatar,
  Button,
  ButtonLink,
  EmptyState,
  LoadError,
  PageHeader,
  Select,
  SkeletonCards,
  SkeletonGroup,
  StatusChip,
  Tabs,
  panelId,
  tabId,
} from '@/components';
import type { Session } from '@/types/models';
import { CoachReportModal } from './CoachReportModal';
import styles from './sessions.module.css';

type TabKey = 'a_venir' | 'passees';
type PeriodKey = 'all' | 'next7' | 'next30' | 'thisMonth' | 'last30' | 'lastMonth';

/** SESS-11 — liste des séances : onglets À venir / Passées, filtres période + coach,
 *  séances regroupées par jour en cartes (liseré coloré par unité). */
export default function SessionsScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const [params, setParams] = useSearchParams();
  const tab: TabKey = params.get('onglet') === 'passees' ? 'passees' : 'a_venir';
  const [period, setPeriod] = useState<PeriodKey>('all');
  const [coachId, setCoachId] = useState('all');
  const [reportSession, setReportSession] = useState<Session | null>(null);

  const state = useAsync(
    () =>
      Promise.all([api.listSessions(), api.listCoaches(), api.listContracts()]).then(
        ([sessions, coaches, contracts]) => ({ sessions, coaches, contracts }),
      ),
    [version],
  );

  const todayIso = toIso(new Date());
  const tomorrowIso = toIso(addDays(new Date(), 1));

  const filtered = useMemo(() => {
    if (!state.data) return [];
    const { sessions } = state.data;
    const base =
      tab === 'a_venir'
        ? sessions
            .filter((s) => (s.status === 'a_venir' || s.status === 'reportee') && s.date >= todayIso)
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        : sessions
            .filter((s) => s.status === 'annulee' || s.status === 'terminee' || s.date < todayIso)
            .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

    const monthPrefix = todayIso.slice(0, 7);
    const lastMonthPrefix = toIso(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15)).slice(0, 7);
    const inPeriod = (s: Session): boolean => {
      switch (period) {
        case 'next7':
          return s.date <= toIso(addDays(new Date(), 7));
        case 'next30':
          return s.date <= toIso(addDays(new Date(), 30));
        case 'last30':
          return s.date >= toIso(addDays(new Date(), -30));
        case 'thisMonth':
          return s.date.startsWith(monthPrefix);
        case 'lastMonth':
          return s.date.startsWith(lastMonthPrefix);
        default:
          return true;
      }
    };
    return base.filter((s) => inPeriod(s) && (coachId === 'all' || s.coachId === coachId));
  }, [state.data, tab, period, coachId, todayIso]);

  // Regroupement par jour — `filtered` est déjà trié, donc les groupes et leur contenu
  // sortent dans le bon ordre (Map = ordre d'insertion).
  const groups = useMemo(() => {
    const byDate = new Map<string, Session[]>();
    for (const s of filtered) {
      const arr = byDate.get(s.date) ?? [];
      arr.push(s);
      byDate.set(s.date, arr);
    }
    return [...byDate.entries()].map(([date, items]) => ({ date, items }));
  }, [filtered]);

  const coach = (id: string | null) =>
    id ? (state.data?.coaches.find((c) => c.id === id) ?? null) : null;

  const coachName = (id: string | null): string => {
    const c = coach(id);
    return c ? `${c.firstName} ${c.lastName}` : fr.calendar.unassigned;
  };

  const changeTab = (next: string) => {
    setPeriod('all');
    setCoachId('all');
    setParams(next === 'passees' ? { onglet: 'passees' } : {});
  };

  const clearFilters = () => {
    setPeriod('all');
    setCoachId('all');
  };

  const hasFilters = period !== 'all' || coachId !== 'all';

  // En-tête de jour : « Aujourd'hui » / « Demain » / jour de la semaine, + la date complète en sourdine.
  const dayHeader = (iso: string): { lead: string; sub: string } => {
    if (iso === todayIso) return { lead: fr.calendar.today, sub: capitalize(formatWeekdayDate(iso)) };
    if (iso === tomorrowIso) return { lead: fr.calendar.tomorrow, sub: capitalize(formatWeekdayDate(iso)) };
    return { lead: capitalize(formatWeekday(iso)), sub: formatDate(iso) };
  };

  const periodOptions =
    tab === 'a_venir'
      ? [
          { value: 'all', label: fr.sessions.filters.allPeriods },
          { value: 'next7', label: fr.sessions.filters.next7 },
          { value: 'next30', label: fr.sessions.filters.next30 },
          { value: 'thisMonth', label: fr.sessions.filters.thisMonth },
        ]
      : [
          { value: 'all', label: fr.sessions.filters.allPeriods },
          { value: 'last30', label: fr.sessions.filters.last30 },
          { value: 'thisMonth', label: fr.sessions.filters.thisMonth },
          { value: 'lastMonth', label: fr.sessions.filters.lastMonth },
        ];

  const renderCard = (s: Session) => {
    const c = coach(s.coachId);
    const statusChip =
      s.status === 'annulee'
        ? <StatusChip spec={{ ...sessionStatusChip('annulee'), label: fr.sessions.cancelled }} />
        : <StatusChip spec={sessionStatusChip(s.status)} />;
    const canEvaluate = tab === 'passees' && s.status !== 'annulee';

    return (
      <article key={s.id} className={styles.sessionCard} data-tone={unitTone(s.unitType)}>
        <Link
          to={`/sessions/${s.id}`}
          className={styles.cardMain}
          aria-label={fr.calendar.sessionLink(formatDate(s.date), formatTime(s.time))}
        >
          <span className={styles.cardCoach}>
            {c ? (
              <Avatar firstName={c.firstName} lastName={c.lastName} size="sm" decorative />
            ) : (
              <span className={styles.cardCoachIcon}>
                <User aria-hidden />
              </span>
            )}
            <span className={c ? styles.cardCoachName : styles.cardCoachMuted}>{coachName(s.coachId)}</span>
          </span>
          <span className={styles.cardMeta}>
            <Clock3 className={styles.cardMetaIcon} aria-hidden />
            <span className={styles.cardTime}>{formatTime(s.time)}</span>
            <span className={styles.cardDuration}>· {formatDuration(s.durationMin)}</span>
          </span>
          <span className={styles.cardUnit}>{unitLabel(s.unitType)}</span>
        </Link>

        <div className={styles.cardAside}>
          {statusChip}
          <div className={styles.cardActions}>
            <Button size="md" variant="ghost" icon={FileText} onClick={() => setReportSession(s)}>
              {fr.sessions.table.report}
            </Button>
            {canEvaluate &&
              (s.evaluation ? (
                <ButtonLink size="md" variant="ghost" icon={Star} to={`/evaluations/${s.id}`}>
                  {fr.sessions.seeEvaluation}
                </ButtonLink>
              ) : (
                <ButtonLink size="md" variant="accent" icon={Star} to={`/evaluations/${s.id}`}>
                  {fr.sessions.evaluateAction}
                </ButtonLink>
              ))}
          </div>
        </div>

        <ChevronRight className={styles.cardChevron} aria-hidden />
      </article>
    );
  };

  const reportContract = reportSession
    ? (state.data?.contracts.find((c) => c.id === reportSession.contractId) ?? null)
    : null;
  const reportCoach = reportSession
    ? (state.data?.coaches.find((c) => c.id === reportSession.coachId) ?? null)
    : null;

  return (
    <>
      <PageHeader title={fr.sessions.title} />
      <Tabs
        idBase="sessions"
        label={fr.sessions.title}
        active={tab}
        onChange={changeTab}
        tabs={[
          { id: 'a_venir', label: fr.sessions.tabs.upcoming },
          { id: 'passees', label: fr.sessions.tabs.past },
        ]}
      />
      <div
        role="tabpanel"
        id={panelId('sessions', tab)}
        aria-labelledby={tabId('sessions', tab)}
        className={styles.tabPanel}
      >
        <div className={styles.filters}>
          <Select
            variant="pill"
            icon={CalendarRange}
            label={fr.sessions.filters.period}
            value={period}
            onChange={(value) => setPeriod(value as PeriodKey)}
            options={periodOptions}
          />
          <Select
            variant="pill"
            icon={Users}
            label={fr.sessions.filters.coach}
            value={coachId}
            onChange={setCoachId}
            options={[
              { value: 'all', label: fr.sessions.filters.allCoaches },
              ...(state.data?.coaches ?? []).map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}`,
              })),
            ]}
          />
        </div>

        {state.loading && (
          <SkeletonGroup>
            <SkeletonCards count={5} height={104} />
          </SkeletonGroup>
        )}
        {state.error && <LoadError onRetry={state.retry} />}
        {state.data && filtered.length === 0 && hasFilters && (
          <EmptyState
            variant="no-results"
            title={fr.sessions.noResults}
            action={<Button onClick={clearFilters}>{fr.common.clearFilters}</Button>}
          />
        )}
        {state.data && filtered.length === 0 && !hasFilters && (
          <EmptyState
            title={tab === 'a_venir' ? fr.sessions.emptyUpcoming : fr.sessions.emptyPast}
            body={tab === 'a_venir' ? fr.sessions.emptyUpcomingBody : fr.sessions.emptyPastBody}
          />
        )}
        {state.data && filtered.length > 0 && (
          <div className={styles.groupedList}>
            {groups.map((g) => {
              const h = dayHeader(g.date);
              return (
                <section key={g.date} className={styles.dayGroup} aria-label={`${h.lead} ${h.sub}`}>
                  <header className={styles.dayHeader}>
                    <span className={styles.dayLead}>{h.lead}</span>
                    <span className={styles.daySub}>{h.sub}</span>
                  </header>
                  <div className={styles.sessionList}>{g.items.map(renderCard)}</div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <CoachReportModal
        open={reportSession !== null}
        onClose={() => setReportSession(null)}
        session={reportSession}
        coach={reportCoach}
        sessionTypeLabel={reportContract ? fr.sessionTypes[reportContract.sessionType] : ''}
      />
    </>
  );
}
