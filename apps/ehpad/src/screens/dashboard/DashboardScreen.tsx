import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CalendarPlus, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { downloadStub } from '@/lib/pdf';
import {
  capitalize,
  formatDate,
  formatDateTime,
  formatMonthYear,
  formatTime,
  parseDate,
  toIso,
} from '@/lib/format';
import { unitLabel } from '@/lib/status';
import {
  Button,
  Calendar,
  EmptyState,
  LoadError,
  RatingDisplay,
  Skeleton,
  SkeletonGroup,
} from '@/components';
import type { CalendarView } from '@/components';
import type { Session } from '@/types/models';
import { PageHeader } from '@/components/PageHeader';
import { CoachReportModal } from '@/screens/sessions/CoachReportModal';
import { PostponeModal } from '@/screens/sessions/PostponeModal';
import { SessionPeekModal } from '@/screens/sessions/SessionPeekModal';
import { PlanSessionModal } from './PlanSessionModal';
import { QuickCreatePopover } from './QuickCreatePopover';
import type { SlotAnchor } from './QuickCreatePopover';
import styles from './Dashboard.module.css';

// v2 : la vue par défaut passe à « Semaine » — on repart d'une clé neuve pour
// qu'une préférence « Mois » mémorisée n'écrase pas le nouveau défaut à l'entrée.
const VIEW_KEY = 'ds-ehpad.calendarView.v2';

// Drapeau remis à zéro à chaque chargement de page : il distingue la 1re arrivée
// sur le site (→ vue primaire « Semaine », toujours) d'une navigation interne
// (→ on respecte le choix fait pendant la session).
let viewSessionStarted = false;

/** SESS-08 — Accueil : « est-ce que quelque chose m'attend ? » en 5 secondes. */
export default function DashboardScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState<string | undefined>(undefined);
  const [planTime, setPlanTime] = useState<string | undefined>(undefined);
  // Création rapide « à la Google Agenda » : clic sur un créneau vide de la
  // vue Semaine → pop-up ancrée au créneau.
  const [quickCreate, setQuickCreate] = useState<{ iso: string; time: string; anchor: SlotAnchor } | null>(
    null,
  );
  // Aperçu de séance (type Google Agenda) ouvert depuis le calendrier. Une seule
  // modale à la fois (peek → rapport / report) — le verrou de défilement de
  // Modal reste sain (deux modales ouvertes le casseraient).
  const [sessionModal, setSessionModal] = useState<
    { session: Session; mode: 'peek' | 'report' | 'postpone' } | null
  >(null);

  const openPlan = (date?: string, time?: string) => {
    setPlanDate(date);
    setPlanTime(time);
    setPlanOpen(true);
  };

  // Vue principale : « Semaine » (sur mobile « Liste » — la grille semaine défile
  // horizontalement, peu lisible sur téléphone).
  const primaryView: CalendarView = isMobile ? 'list' : 'week';
  const [view, setView] = useState<CalendarView>(() => {
    // 1re arrivée sur le site → toujours la vue primaire, quelle que soit la
    // préférence mémorisée. En navigation interne, on respecte le choix de session.
    if (!viewSessionStarted) return primaryView;
    const stored = localStorage.getItem(VIEW_KEY);
    if (stored === 'month' || stored === 'week' || stored === 'list') return stored;
    return primaryView;
  });

  // À la 1re arrivée : on ancre la vue primaire (efface une préférence « Mois »
  // mémorisée) pour qu'un aller-retour entre écrans reste cohérent.
  useEffect(() => {
    if (!viewSessionStarted) {
      viewSessionStarted = true;
      localStorage.setItem(VIEW_KEY, primaryView);
    }
  }, [primaryView]);

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

  /* La prochaine séance à venir — l'écran doit y répondre en 5 secondes,
     en toutes lettres, pas dans une pastille de 24px au fond de la grille. */
  const nextSession = useMemo(() => {
    if (!state.data) return null;
    const now = new Date();
    const todayIso = toIso(now);
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const upcoming = state.data.sessions
      .filter(
        (s) =>
          (s.status === 'a_venir' || s.status === 'reportee') &&
          (s.date > todayIso || (s.date === todayIso && s.time >= nowTime)),
      )
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return upcoming[0] ?? null;
  }, [state.data]);

  const nextRelative = useMemo(() => {
    if (!nextSession) return '';
    const days = Math.round(
      (parseDate(nextSession.date).getTime() - parseDate(toIso(new Date())).getTime()) / 86_400_000,
    );
    if (days <= 0) return fr.dashboard.next.today;
    if (days === 1) return fr.dashboard.next.tomorrow;
    return fr.dashboard.next.inDays(days);
  }, [nextSession, fr]);

  const nextSub = useMemo(() => {
    if (!nextSession || !state.data) return '';
    const coach = state.data.coaches.find((c) => c.id === nextSession.coachId);
    const who = coach ? `${coach.firstName} ${coach.lastName}` : fr.calendar.unassigned;
    return `${who} · ${unitLabel(nextSession.unitType)}`;
  }, [nextSession, state.data, fr]);

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
    // `fr` : `unitLabel` lit la langue active — recalculer au basculement FR ⇄ EN.
  }, [state.data, fr]);

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
      `${fr.app.name} : ${period}`,
      kpis.inMonth.map(
        (s) =>
          `${formatDate(s.date)};${formatTime(s.time)};${coachName(s.coachId)};${unitLabel(s.unitType)}`,
      ),
    );
    showToast({ message: fr.dashboard.exportDone });
  };

  const modalSession = sessionModal?.session ?? null;
  const modalCoach =
    modalSession && state.data
      ? state.data.coaches.find((c) => c.id === modalSession.coachId) ?? null
      : null;
  const modalContract =
    modalSession && state.data
      ? state.data.contracts.find((c) => c.id === modalSession.contractId) ?? null
      : null;

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
          {/* 1 · Bandeau « prochaine séance » — on réserve sa place (88px) */}
          <div className={styles.hero} style={{ cursor: 'default' }}>
            <Skeleton width={48} height={48} radius="var(--radius-md)" />
            <span className={styles.heroBody}>
              <Skeleton width={120} height={14} radius="var(--radius-pill)" />
              <Skeleton width="60%" height={20} radius="var(--radius-md)" />
              <Skeleton width={160} height={14} radius="var(--radius-pill)" />
            </span>
            <Skeleton width={22} height={22} radius="var(--radius-pill)" />
          </div>

          {/* 2 · Bande de stats — UNE feuille bordée (réutilise statBand : grille
              4 colonnes, filets internes, repli 4→2 à 719px) */}
          <div className={styles.statBand}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.stat}>
                <Skeleton width={80} height={14} radius="var(--radius-pill)" />
                <Skeleton width={56} height={32} radius="var(--radius-md)" />
                <Skeleton width={100} height={12} radius="var(--radius-pill)" />
              </div>
            ))}
          </div>

          {/* 3 · Calendrier — barre d'outils puis la grille (radius-lg) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-md)',
                flexWrap: 'wrap',
              }}
            >
              <Skeleton width={180} height={36} radius="var(--radius-pill)" />
              <Skeleton width={220} height={36} radius="var(--radius-pill)" />
            </div>
            <Skeleton height={520} radius="var(--radius-lg)" />
          </div>
        </SkeletonGroup>
      )}

      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && kpis && (
        <>
          {/* 1 · Le point focal : la prochaine séance, en toutes lettres */}
          {nextSession && (
            <button
              type="button"
              className={styles.hero}
              onClick={() => setSessionModal({ session: nextSession, mode: 'peek' })}
            >
              <span className={styles.heroChip} aria-hidden>
                <CalendarClock />
              </span>
              <span className={styles.heroBody}>
                <span className={styles.heroEyebrow}>
                  {fr.dashboard.next.eyebrow} · {nextRelative}
                </span>
                <span className={styles.heroTitle}>
                  {capitalize(formatDateTime(nextSession.date, nextSession.time))}
                </span>
                <span className={styles.heroSub}>{nextSub}</span>
              </span>
              <ChevronRight className={styles.heroChevron} aria-hidden />
            </button>
          )}

          {/* 2 · Vue d'ensemble — bandeau éditorial (un objet, filets internes) */}
          <div className={styles.statBand}>
            <div className={styles.stat}>
              <p className={styles.statEyebrow}>{fr.dashboard.kpi.sessionsMonth}</p>
              <p className={styles.statNumber}>{kpis.inMonth.length}</p>
              <p className={styles.statDetail}>
                <span className={styles.statDone}>{fr.dashboard.kpi.sessionsDone(kpis.done)}</span>
                {' · '}
                {fr.dashboard.kpi.sessionsUpcoming(kpis.upcoming)}
              </p>
            </div>

            <div className={styles.stat}>
              <p className={styles.statEyebrow}>{fr.dashboard.kpi.activeContracts}</p>
              <p className={styles.statNumber}>{kpis.actives.length}</p>
              {kpis.activeUnits.length > 0 && (
                <p className={styles.statDetail}>{kpis.activeUnits.join(' · ')}</p>
              )}
            </div>

            {/* Évaluations en attente : la seule cellule actionnable. Voile bleu +
                lien « Évaluer » uniquement s'il reste des évals ; sinon « à jour ». */}
            <div className={styles.stat} data-action={kpis.pending > 0 || undefined}>
              <p className={styles.statEyebrow}>{fr.dashboard.kpi.pendingEvaluations}</p>
              <p className={styles.statNumber}>{kpis.pending}</p>
              {kpis.pending > 0 ? (
                <Link to="/evaluations" className={styles.statLink}>
                  {fr.dashboard.kpi.evaluate}
                  <span aria-hidden> →</span>
                </Link>
              ) : (
                <p className={styles.statDetail}>{fr.dashboard.kpi.allUpToDate}</p>
              )}
            </div>

            <div className={styles.stat}>
              <p className={styles.statEyebrow}>{fr.dashboard.kpi.avgRating}</p>
              {kpis.avg !== null ? (
                <>
                  <p className={styles.statNumber}>
                    {kpis.avg.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
                    <span className={styles.statUnit}>{fr.dashboard.kpi.outOfFive}</span>
                  </p>
                  <div className={`${styles.statDetail} ${styles.statRating}`}>
                    <RatingDisplay value={kpis.avg} showText={false} size="sm" />
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.statNumber}>—</p>
                  <p className={styles.statDetail}>{fr.dashboard.kpi.avgRatingEmpty}</p>
                </>
              )}
            </div>
          </div>

          {/* 3 · Calendrier */}
          <Calendar
            sessions={state.data.sessions}
            coaches={state.data.coaches}
            view={view}
            onViewChange={changeView}
            onAddSession={openPlan}
            onSlotClick={(iso, time, anchor) => setQuickCreate({ iso, time, anchor })}
            activeSlot={quickCreate ? { iso: quickCreate.iso, time: quickCreate.time } : undefined}
            onSessionSelect={(s) => setSessionModal({ session: s, mode: 'peek' })}
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

      {quickCreate && (
        <QuickCreatePopover
          anchor={quickCreate.anchor}
          date={quickCreate.iso}
          time={quickCreate.time}
          contracts={state.data?.contracts ?? []}
          onClose={() => setQuickCreate(null)}
          onMore={() => {
            openPlan(quickCreate.iso, quickCreate.time);
            setQuickCreate(null);
          }}
        />
      )}

      <PlanSessionModal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        contracts={state.data?.contracts ?? []}
        userName={user ? `${user.firstName} ${user.lastName}` : ''}
        initialDate={planDate}
        initialTime={planTime}
      />

      {/* Aperçu de séance type Google Agenda + ses bascules (rapport / report). */}
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
