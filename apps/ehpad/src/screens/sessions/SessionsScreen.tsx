import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarRange, ChevronRight, Clock3, User, Users } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { addDays } from '@/lib/calendar';
import {
  capitalize,
  formatDate,
  formatShortDate,
  formatTime,
  formatTimeRange,
  formatWeekday,
  formatWeekdayDate,
  toIso,
} from '@/lib/format';
import { sessionStatusChip, unitLabel, unitTone } from '@/lib/status';
import {
  Avatar,
  Button,
  EmptyState,
  LoadError,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  SkeletonGroup,
  StatusChip,
  Tabs,
  panelId,
  tabId,
} from '@/components';
import type { Session } from '@/types/models';
import { CoachReportModal } from './CoachReportModal';
import { PostponeModal } from './PostponeModal';
import { SessionPeekModal } from './SessionPeekModal';
import styles from './sessions.module.css';

type TabKey = 'a_venir' | 'passees';
type PeriodKey = 'all' | 'next7' | 'next30' | 'thisMonth' | 'last30' | 'lastMonth';

/** Pagination : nombre de jours (groupes) par page. On pagine par JOUR entier
 *  pour ne jamais couper une journée entre deux pages. Réglable d'un seul endroit. */
const DAYS_PER_PAGE = 6;

/** SESS-11 — liste des séances : onglets À venir / Passées, filtres période + coach,
 *  séances regroupées par jour en cartes (liseré coloré par unité). */
export default function SessionsScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const [params, setParams] = useSearchParams();
  const tab: TabKey = params.get('onglet') === 'passees' ? 'passees' : 'a_venir';
  const [period, setPeriod] = useState<PeriodKey>('all');
  const [coachId, setCoachId] = useState('all');
  const [page, setPage] = useState(1);
  // Aperçu de séance (modale type Google Agenda, comme sur le tableau de bord) :
  // un clic sur une carte ouvre la fiche sans changer de page. Une seule modale à
  // la fois — l'aperçu bascule vers le rapport / le report sans s'empiler.
  // « Voir la fiche complète » reste l'échappatoire vers /sessions/:id.
  const [sessionModal, setSessionModal] = useState<
    { session: Session; mode: 'peek' | 'report' | 'postpone' } | null
  >(null);

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

  // Pagination par jour : on découpe les groupes en pages de DAYS_PER_PAGE jours.
  // `currentPage` est borné au cas où les filtres réduisent le nombre de pages
  // avant que l'effet de réinitialisation ne s'applique.
  const pageCount = Math.max(1, Math.ceil(groups.length / DAYS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pagedGroups = groups.slice((currentPage - 1) * DAYS_PER_PAGE, currentPage * DAYS_PER_PAGE);

  // Onglet / filtres changent → on repart de la page 1.
  useEffect(() => {
    setPage(1);
  }, [tab, period, coachId]);

  // Changement de page : on remonte tout en haut de la zone de contenu (#contenu
  // est le conteneur défilant) — titre « Séances » + onglets + filtres réapparaissent.
  // Saut instantané : aucune animation à neutraliser pour prefers-reduced-motion.
  const goToPage = (next: number) => {
    setPage(next);
    document.getElementById('contenu')?.scrollTo({ top: 0 });
  };

  const coach = (id: string | null) =>
    id ? (state.data?.coaches.find((c) => c.id === id) ?? null) : null;

  const coachName = (id: string | null): string => {
    const c = coach(id);
    return c ? `${c.firstName} ${c.lastName}` : fr.calendar.unassigned;
  };

  // Données dérivées pour les modales d'aperçu (séance / coach / contrat courants).
  const modalSession = sessionModal?.session ?? null;
  const modalCoach = coach(modalSession?.coachId ?? null);
  const modalContract =
    modalSession && state.data
      ? state.data.contracts.find((c) => c.id === modalSession.contractId) ?? null
      : null;

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

  // En-tête de jour (calé sur la réf Time2book) : le terme à mettre en avant — « Aujourd'hui »,
  // « Demain », sinon le jour de la semaine — porte le gros caractère gras ; la date complète
  // l'accompagne en plus petit et plus discret. Today/Demain gardent le jour dans la date
  // (« Samedi 13 juin ») ; au-delà le jour est déjà le titre, la date se réduit à « 15 juin ».
  const dayHeader = (iso: string): { lead: string; sub: string } => {
    if (iso === todayIso) return { lead: fr.calendar.today, sub: capitalize(formatWeekdayDate(iso)) };
    if (iso === tomorrowIso) return { lead: fr.calendar.tomorrow, sub: capitalize(formatWeekdayDate(iso)) };
    return { lead: capitalize(formatWeekday(iso)), sub: formatShortDate(iso) };
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

    return (
      <article key={s.id} className={styles.sessionCard} data-tone={unitTone(s.unitType)}>
        <button
          type="button"
          className={styles.cardMain}
          onClick={() => setSessionModal({ session: s, mode: 'peek' })}
          aria-label={fr.calendar.sessionLink(formatDate(s.date), formatTime(s.time))}
        >
          {/* Titre = la séance (l'unité), comme le nom de cours dans la réf. */}
          <span className={styles.cardTitle}>{unitLabel(s.unitType)}</span>
          {/* Une seule ligne de méta à icônes : plage horaire · coach. */}
          <span className={styles.cardMetaRow}>
            <span className={styles.cardMeta}>
              <Clock3 className={styles.cardMetaIcon} aria-hidden />
              {formatTimeRange(s.time, s.durationMin)}
            </span>
            <span className={styles.cardMeta}>
              {c ? (
                <Avatar firstName={c.firstName} lastName={c.lastName} size="sm" decorative />
              ) : (
                <span className={styles.cardCoachIcon}>
                  <User aria-hidden />
                </span>
              )}
              {coachName(s.coachId)}
            </span>
          </span>
        </button>

        <div className={styles.cardAside}>{statusChip}</div>

        <ChevronRight className={styles.cardChevron} aria-hidden />
      </article>
    );
  };

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
            <div className={styles.groupedList}>
              {[0, 1].map((g) => (
                <div key={g} className={styles.dayGroup}>
                  <div className={styles.dayHeader}>
                    <Skeleton height={24} width={120} radius="var(--radius-md)" />
                    <Skeleton height={12} width={70} radius="var(--radius-pill)" />
                  </div>
                  <div className={styles.sessionList}>
                    {Array.from({ length: g === 0 ? 3 : 2 }).map((_, i) => (
                      <Skeleton key={i} height={104} radius="var(--radius-lg)" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
          <>
            <div className={styles.groupedList}>
              {pagedGroups.map((g) => {
                const h = dayHeader(g.date);
                return (
                  <section key={g.date} className={styles.dayGroup} aria-label={`${h.lead} ${h.sub}`.trim()}>
                    <header className={styles.dayHeader}>
                      <span className={styles.dayLead}>{h.lead}</span>
                      {h.sub && <span className={styles.daySub}>{h.sub}</span>}
                    </header>
                    <div className={styles.sessionList}>{g.items.map(renderCard)}</div>
                  </section>
                );
              })}
            </div>
            <Pagination page={currentPage} pageCount={pageCount} onChange={goToPage} variant="plain" />
          </>
        )}
      </div>

      {/* Aperçu de séance type Google Agenda + ses bascules (rapport / report),
          identique au tableau de bord — une seule modale ouverte à la fois. */}
      <SessionPeekModal
        open={sessionModal?.mode === 'peek'}
        session={modalSession}
        coach={modalCoach}
        onClose={() => setSessionModal(null)}
        onSeeReport={() => setSessionModal((m) => (m ? { ...m, mode: 'report' } : null))}
        onPostpone={() => setSessionModal((m) => (m ? { ...m, mode: 'postpone' } : null))}
      />
      <CoachReportModal
        open={sessionModal?.mode === 'report'}
        onClose={() => setSessionModal(null)}
        session={modalSession}
        coach={modalCoach}
        sessionTypeLabel={modalContract ? fr.sessionTypes[modalContract.sessionType] : ''}
      />
      {modalSession && (
        <PostponeModal
          open={sessionModal?.mode === 'postpone'}
          onClose={() => setSessionModal(null)}
          session={modalSession}
        />
      )}
    </>
  );
}
