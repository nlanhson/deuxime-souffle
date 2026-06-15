import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useStrings } from '@/i18n';
import { addDays, addMonths, addWeeks, isSameMonth, isToday, monthGrid, weekDays } from '@/lib/calendar';
import {
  capitalize,
  formatDate,
  formatMonthYear,
  formatTime,
  formatWeekdayDate,
  toIso,
} from '@/lib/format';
import { ALL_UNIT_TYPES, unitLabel, unitTone } from '@/lib/status';
import { SegmentedControl } from '@/components/SegmentedControl';
import type { Coach, Session } from '@/types/models';
import styles from './Calendar.module.css';

export type CalendarView = 'month' | 'week' | 'list';

interface CalendarProps {
  sessions: Session[];
  coaches: Coach[];
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  /** Affiché à la place de la grille quand il n'y a aucune séance. */
  emptyState?: ReactNode | undefined;
  /** « + » sur une case (jour planifiable) → ouvre la planification, date pré-remplie. */
  onAddSession?: ((iso: string) => void) | undefined;
  /** Clic sur un créneau vide de la vue Semaine → création rapide « à la Google
   *  Agenda » : date + heure pré-remplies, pop-up ancrée au rectangle du créneau. */
  onSlotClick?:
    | ((iso: string, time: string, anchor: { top: number; bottom: number; left: number; right: number }) => void)
    | undefined;
  /** Créneau dont la pop-up de création est ouverte : son bloc fantôme reste
   *  épinglé (l'utilisateur voit où la séance va se poser). */
  activeSlot?: { iso: string; time: string } | undefined;
  /** Clic sur une séance → aperçu modal (accueil). Absent ailleurs ⇒ navigation
   *  vers la fiche, comme avant. */
  onSessionSelect?: ((session: Session) => void) | undefined;
}

const UNIT_SHORT: Record<string, string> = {
  UC: 'UC',
  UP_UHR: 'UP/UHR',
  AIDANTS: 'Aidants',
  SOIGNANTS: 'Soignants',
  AUTRE: 'Autre',
};

/** Plage horaire affichée en vue Semaine (grille horaire type planning). */
const WT_START = 0; // 0h — journée complète (24h), défilable comme Google Agenda
const WT_END = 24; // 24h
const WT_SCROLL_TO = 7; // heure amenée en haut à l'ouverture (séances en journée)

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Heure de fin lisible : `endTime('14:00', 60)` → `3:00pm` (même format 12 h que formatTime). */
const endTime = (time: string, durationMin: number): string => {
  const total = toMinutes(time) + durationMin;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return formatTime(`${hh}:${mm}`);
};

/** Gouttière horaire de la vue Semaine : `7` → `7am`, `13` → `1pm` (12 h, cohérent avec formatTime). */
const hourLabel = (h: number): string => {
  const period = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${period}`;
};

/** Calendrier SESS-08 — Mois / Semaine / Liste, couleurs par type d'unité
 *  (identiques dans les trois vues, toujours doublées d'un libellé), légende
 *  visible, prochaine séance mise en avant (« Prochaine »). */
export function Calendar({
  sessions,
  coaches,
  view,
  onViewChange,
  emptyState,
  onAddSession,
  onSessionSelect,
  onSlotClick,
  activeSlot,
}: CalendarProps) {
  const fr = useStrings();
  const [cursor, setCursor] = useState(() => new Date());
  const tomorrowIso = toIso(addDays(new Date(), 1));

  // Survol d'un créneau dans la vue Semaine → bloc fantôme « créer ici ».
  const [hoverSlot, setHoverSlot] = useState<{ iso: string; topPct: number } | null>(null);

  // Grille Semaine défilable : on amène les heures de journée en haut à
  // l'ouverture (façon Google Agenda), plutôt que minuit.
  const weekScrollRef = useRef<HTMLDivElement>(null);
  const weekBodyRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (view !== 'week') return;
    const id = requestAnimationFrame(() => {
      const scroller = weekScrollRef.current;
      const body = weekBodyRef.current;
      if (!scroller || !body) return;
      scroller.scrollTop = ((WT_SCROLL_TO - WT_START) / (WT_END - WT_START)) * body.offsetHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [view]);

  const coachName = (id: string | null): string => {
    if (!id) return fr.calendar.unassigned;
    const coach = coaches.find((c) => c.id === id);
    return coach ? `${coach.firstName} ${coach.lastName}` : fr.calendar.unassigned;
  };

  const visible = useMemo(
    () => sessions.filter((s) => s.status !== 'annulee'),
    [sessions],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    visible.forEach((s) => {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    });
    map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [visible]);

  const nextSessionId = useMemo(() => {
    const now = new Date();
    const todayIso = toIso(now);
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const upcoming = visible
      .filter(
        (s) =>
          (s.status === 'a_venir' || s.status === 'reportee') &&
          (s.date > todayIso || (s.date === todayIso && s.time >= nowTime)),
      )
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return upcoming[0]?.id ?? null;
  }, [visible]);

  const goPrev = () => setCursor((c) => (view === 'week' ? addWeeks(c, -1) : addMonths(c, -1)));
  const goNext = () => setCursor((c) => (view === 'week' ? addWeeks(c, 1) : addMonths(c, 1)));

  // Virgule après le jour de la semaine, dans la plage de la vue Semaine
  // uniquement : « Lundi, 8 juin – dimanche, 14 juin » (le 1er espace sépare
  // le jour du quantième).
  const weekdayDateComma = (iso: string) => formatWeekdayDate(iso).replace(' ', ', ');
  const periodLabel =
    view === 'week'
      ? `${capitalize(weekdayDateComma(toIso(weekDays(cursor)[0] ?? cursor)))} – ${weekdayDateComma(toIso(weekDays(cursor)[6] ?? cursor))}`
      : capitalize(formatMonthYear(cursor));

  const eventAria = (s: Session) =>
    `${fr.calendar.sessionLink(formatDate(s.date), formatTime(s.time))}, ${coachName(s.coachId)}, ${unitLabel(s.unitType)}${s.id === nextSessionId ? `, ${fr.calendar.nextSession}` : ''}`;

  /* Clic sur une séance : si l'appelant fournit onSessionSelect (accueil), on
     ouvre l'aperçu modal au lieu de naviguer — tout en gardant le <Link> (donc
     « ouvrir dans un nouvel onglet » au cmd/ctrl-clic) comme repli. */
  const onEventClick = (s: Session) =>
    onSessionSelect
      ? (e: ReactMouseEvent) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          onSessionSelect(s);
        }
      : undefined;
  const eventPopup = onSessionSelect ? ('dialog' as const) : undefined;

  const monthBody = () => {
    const weeks = monthGrid(cursor);
    return (
      <div className={styles.monthGrid} role="list">
        {fr.weekdaysShort.map((day) => (
          <span key={day} className={styles.weekdayHeader} aria-hidden>
            {day}
          </span>
        ))}
        {weeks.flat().map((date) => {
          const iso = toIso(date);
          const events = byDay.get(iso) ?? [];
          const shown = events.slice(0, 4);
          const more = events.length - shown.length;
          const inMonth = isSameMonth(date, cursor);
          const canAdd = Boolean(onAddSession) && inMonth && iso >= tomorrowIso;
          return (
            <div
              key={iso}
              role="listitem"
              className={styles.dayCell}
              data-outside={!inMonth || undefined}
              data-today={isToday(date) || undefined}
            >
              <span className={styles.dayNumber}>
                {isToday(date) && <span className="sr-only">{fr.calendar.today}, </span>}
                {date.getDate()}
              </span>
              {shown.map((s) => (
                <Link
                  key={s.id}
                  to={`/sessions/${s.id}`}
                  className={styles.mEvent}
                  data-tone={unitTone(s.unitType)}
                  aria-label={eventAria(s)}
                  aria-haspopup={eventPopup}
                  onClick={onEventClick(s)}
                >
                  <span className={styles.mDot} aria-hidden />
                  <span className={styles.mTime}>{formatTime(s.time)}</span>
                  <span className={styles.mCoach}>{coachName(s.coachId)}</span>
                </Link>
              ))}
              {more > 0 && (
                <button
                  type="button"
                  className={styles.moreBtn}
                  onClick={() => {
                    setCursor(date);
                    onViewChange('week');
                  }}
                >
                  {fr.calendar.moreEvents(more)}
                </button>
              )}
              {canAdd && (
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => onAddSession?.(iso)}
                  aria-label={fr.calendar.addOn(formatDate(iso))}
                >
                  <Plus aria-hidden />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const weekBody = () => {
    const days = weekDays(cursor);
    const hours = Array.from({ length: WT_END - WT_START }, (_, i) => WT_START + i);
    const span = (WT_END - WT_START) * 60; // minutes affichées (positions en %)
    const slotPct = (60 / span) * 100; // hauteur d'un créneau d'1 h, en %
    const now = new Date();
    const nowIso = toIso(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nowTop = ((nowMin - WT_START * 60) / span) * 100;
    const nowVisible = nowMin >= WT_START * 60 && nowMin <= WT_END * 60;

    // Créneau (heure + position) sous le curseur, calé sur 30 min, gardant 1 h
    // avant la fin de journée.
    const SNAP = 30;
    const slotAt = (e: ReactMouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const frac = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      let mins = WT_START * 60 + frac * span;
      mins = Math.round(mins / SNAP) * SNAP;
      mins = Math.min(mins, WT_END * 60 - 60);
      mins = Math.max(mins, WT_START * 60);
      const topPct = ((mins - WT_START * 60) / span) * 100;
      const time = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      return { time, topPct, rect };
    };

    return (
      <div className={styles.weekTime} ref={weekScrollRef}>
        <div className={styles.wtInner}>
          <div className={styles.wtHeadRow}>
            <div className={styles.wtCorner} aria-hidden />
            {days.map((date) => (
              <div
                key={toIso(date)}
                className={styles.wtDayHead}
                data-today={isToday(date) || undefined}
              >
                <span className={styles.wtDayName}>
                  {fr.weekdaysShort[(date.getDay() + 6) % 7]}
                </span>
                <span className={styles.wtDayNum}>
                  {isToday(date) && <span className="sr-only">{fr.calendar.today}, </span>}
                  {date.getDate()}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.wtBody} ref={weekBodyRef}>
            <div className={styles.wtGutter}>
              {hours.map((h) => (
                <div key={h} className={styles.wtHour}>
                  <span className={styles.wtHourLabel}>{hourLabel(h)}</span>
                </div>
              ))}
            </div>

            {days.map((date) => {
              const iso = toIso(date);
              const events = byDay.get(iso) ?? [];
              return (
                // Le clic-créneau est une interaction de POINTEUR (le « où » dans le
                // temps n'a pas d'équivalent clavier naturel) ; le chemin clavier
                // pour créer reste le CTA « Planifier une séance ».
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  key={iso}
                  className={styles.wtCol}
                  data-today={isToday(date) || undefined}
                  data-clickable={Boolean(onSlotClick) || undefined}
                  style={{ backgroundSize: `100% ${100 / hours.length}%` }}
                  onMouseMove={
                    onSlotClick
                      ? (e) => {
                          const { topPct } = slotAt(e);
                          setHoverSlot((p) => (p?.iso === iso && p.topPct === topPct ? p : { iso, topPct }));
                        }
                      : undefined
                  }
                  onMouseLeave={
                    onSlotClick ? () => setHoverSlot((p) => (p?.iso === iso ? null : p)) : undefined
                  }
                  onClick={
                    onSlotClick
                      ? (e) => {
                          if (e.target !== e.currentTarget) return; // ignore les clics sur une séance
                          const { time, topPct, rect } = slotAt(e);
                          const top = rect.top + (topPct / 100) * rect.height;
                          onSlotClick(iso, time, {
                            top,
                            bottom: top + (slotPct / 100) * rect.height,
                            left: rect.left,
                            right: rect.right,
                          });
                        }
                      : undefined
                  }
                >
                  {/* Bloc épinglé : créneau dont la pop-up est ouverte (reste visible). */}
                  {activeSlot?.iso === iso && (
                    <div
                      className={styles.wtGhost}
                      data-pinned
                      style={{
                        top: `${((toMinutes(activeSlot.time) - WT_START * 60) / span) * 100}%`,
                        height: `${slotPct}%`,
                      }}
                      aria-hidden
                    />
                  )}
                  {/* Bloc fantôme de survol — masqué pendant qu'une pop-up est ouverte. */}
                  {onSlotClick && !activeSlot && hoverSlot?.iso === iso && (
                    <div
                      className={styles.wtGhost}
                      style={{ top: `${hoverSlot.topPct}%`, height: `${slotPct}%` }}
                      aria-hidden
                    />
                  )}
                  {events.map((s) => {
                    const top = ((toMinutes(s.time) - WT_START * 60) / span) * 100;
                    const height = (s.durationMin / span) * 100;
                    return (
                      <Link
                        key={s.id}
                        to={`/sessions/${s.id}`}
                        className={styles.wtEvent}
                        data-tone={unitTone(s.unitType)}
                        data-next={s.id === nextSessionId || undefined}
                        data-compact={s.durationMin < 45 || undefined}
                        style={{ top: `${top}%`, height: `${height}%` }}
                        aria-label={eventAria(s)}
                        aria-haspopup={eventPopup}
                        onClick={onEventClick(s)}
                      >
                        <span className={styles.wtEventTitle}>{coachName(s.coachId)}</span>
                        <span className={styles.wtEventMeta}>
                          {formatTime(s.time)}–{endTime(s.time, s.durationMin)} · {UNIT_SHORT[s.unitType]}
                        </span>
                      </Link>
                    );
                  })}
                  {nowVisible && iso === nowIso && (
                    <div className={styles.wtNow} style={{ top: `${nowTop}%` }} aria-hidden>
                      <span className={styles.wtNowDot} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const listBody = () => {
    const monthIso = toIso(cursor).slice(0, 7);
    const inMonth = visible
      .filter((s) => s.date.startsWith(monthIso))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (inMonth.length === 0) {
      return <p className={styles.listEmpty}>{fr.calendar.emptyList}</p>;
    }
    return (
      <ul className={styles.list}>
        {inMonth.map((s) => (
          <li key={s.id}>
            <Link
              to={`/sessions/${s.id}`}
              className={styles.listRow}
              data-tone={unitTone(s.unitType)}
              data-next={s.id === nextSessionId || undefined}
              aria-label={eventAria(s)}
              aria-haspopup={eventPopup}
              onClick={onEventClick(s)}
            >
              <span className={styles.listWhen}>
                {s.id === nextSessionId && (
                  <span className={styles.listNextTag}>{fr.calendar.nextBadge}</span>
                )}
                <span className={styles.listDate}>
                  {capitalize(formatWeekdayDate(s.date))} · {formatTime(s.time)}
                </span>
              </span>
              <span className={styles.eventCoach}>{coachName(s.coachId)}</span>
              <span className={styles.listTrailing}>
                <span className={styles.listUnit}>{unitLabel(s.unitType)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.toolbar}>
        <SegmentedControl
          label={fr.calendar.viewLabel}
          value={view}
          onChange={onViewChange}
          options={[
            { value: 'week', label: fr.calendar.views.week },
            { value: 'month', label: fr.calendar.views.month },
            { value: 'list', label: fr.calendar.views.list },
          ]}
        />
        <div className={styles.nav}>
          <button type="button" className={styles.navBtn} onClick={goPrev} aria-label={fr.calendar.previous}>
            <ChevronLeft aria-hidden />
          </button>
          <p className={styles.periodLabel} aria-live="polite">
            {periodLabel}
          </p>
          <button type="button" className={styles.navBtn} onClick={goNext} aria-label={fr.calendar.next}>
            <ChevronRight aria-hidden />
          </button>
          <button type="button" className={styles.todayBtn} onClick={() => setCursor(new Date())}>
            {fr.calendar.today}
          </button>
        </div>
      </div>

      {visible.length === 0 && emptyState ? (
        emptyState
      ) : (
        <>
          {view === 'month' && monthBody()}
          {view === 'week' && weekBody()}
          {view === 'list' && listBody()}
        </>
      )}

      <div className={styles.legend} aria-label={fr.calendar.legend}>
        <span className={styles.legendTitle}>{fr.calendar.legend} :</span>
        {ALL_UNIT_TYPES.map((unit) => (
          <span key={unit} className={styles.legendItem} data-tone={unitTone(unit)}>
            {unitLabel(unit)}
          </span>
        ))}
      </div>
    </div>
  );
}
