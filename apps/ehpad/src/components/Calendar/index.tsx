import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
}

const UNIT_SHORT: Record<string, string> = {
  UC: 'UC',
  UP_UHR: 'UP/UHR',
  AIDANTS: 'Aidants',
  SOIGNANTS: 'Soignants',
  AUTRE: 'Autre',
};

/** Plage horaire affichée en vue Semaine (grille horaire type planning). */
const WT_START = 7; // 7h
const WT_END = 21; // 21h
const WT_HOUR_PX = 48;

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Heure de fin lisible : `endTime('14:00', 60)` → `15h00` (même format 24 h que formatTime). */
const endTime = (time: string, durationMin: number): string => {
  const total = toMinutes(time) + durationMin;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return formatTime(`${hh}:${mm}`);
};

/** Gouttière horaire de la vue Semaine : `7` → `7h`, `14` → `14h` (24 h, cohérent avec formatTime). */
const hourLabel = (h: number): string => `${h}h`;

/** Calendrier SESS-08 — Mois / Semaine / Liste, couleurs par type d'unité
 *  (identiques dans les trois vues, toujours doublées d'un libellé), légende
 *  visible, prochaine séance mise en avant (« Prochaine »). */
export function Calendar({ sessions, coaches, view, onViewChange, emptyState, onAddSession }: CalendarProps) {
  const fr = useStrings();
  const [cursor, setCursor] = useState(() => new Date());
  const tomorrowIso = toIso(addDays(new Date(), 1));

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

  const periodLabel =
    view === 'week'
      ? `${capitalize(formatWeekdayDate(toIso(weekDays(cursor)[0] ?? cursor)))} – ${formatWeekdayDate(toIso(weekDays(cursor)[6] ?? cursor))}`
      : capitalize(formatMonthYear(cursor));

  const eventAria = (s: Session) =>
    `${fr.calendar.sessionLink(formatDate(s.date), formatTime(s.time))} — ${coachName(s.coachId)} — ${unitLabel(s.unitType)}${s.id === nextSessionId ? ` — ${fr.calendar.nextSession}` : ''}`;

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
                {isToday(date) && <span className="sr-only">{fr.calendar.today} — </span>}
                {date.getDate()}
              </span>
              {shown.map((s) => (
                <Link
                  key={s.id}
                  to={`/sessions/${s.id}`}
                  className={styles.mEvent}
                  data-tone={unitTone(s.unitType)}
                  data-next={s.id === nextSessionId || undefined}
                  aria-label={eventAria(s)}
                >
                  <span className={styles.mDot} aria-hidden />
                  <span className={styles.mTime}>{formatTime(s.time)}</span>
                  <span className={styles.mCoach}>{coachName(s.coachId)}</span>
                  {s.id === nextSessionId && <span className={styles.nextDot} aria-hidden />}
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
    const bodyHeight = (WT_END - WT_START) * WT_HOUR_PX;
    const now = new Date();
    const nowIso = toIso(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nowTop = ((nowMin - WT_START * 60) / 60) * WT_HOUR_PX;
    const nowVisible = nowMin >= WT_START * 60 && nowMin <= WT_END * 60;

    return (
      <div className={styles.weekTime}>
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
                  {isToday(date) && <span className="sr-only">{fr.calendar.today} — </span>}
                  {date.getDate()}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.wtBody} style={{ height: bodyHeight }}>
            <div className={styles.wtGutter}>
              {hours.map((h) => (
                <div key={h} className={styles.wtHour} style={{ height: WT_HOUR_PX }}>
                  <span className={styles.wtHourLabel}>{hourLabel(h)}</span>
                </div>
              ))}
            </div>

            {days.map((date) => {
              const iso = toIso(date);
              const events = byDay.get(iso) ?? [];
              return (
                <div
                  key={iso}
                  className={styles.wtCol}
                  data-today={isToday(date) || undefined}
                  style={{ backgroundSize: `100% ${WT_HOUR_PX}px` }}
                >
                  {events.map((s) => {
                    const top = ((toMinutes(s.time) - WT_START * 60) / 60) * WT_HOUR_PX;
                    const height = Math.max((s.durationMin / 60) * WT_HOUR_PX, 24);
                    return (
                      <Link
                        key={s.id}
                        to={`/sessions/${s.id}`}
                        className={styles.wtEvent}
                        data-tone={unitTone(s.unitType)}
                        data-next={s.id === nextSessionId || undefined}
                        data-compact={height < 34 || undefined}
                        style={{ top, height }}
                        aria-label={eventAria(s)}
                      >
                        <span className={styles.wtEventTitle}>{coachName(s.coachId)}</span>
                        <span className={styles.wtEventMeta}>
                          {formatTime(s.time)}–{endTime(s.time, s.durationMin)} · {UNIT_SHORT[s.unitType]}
                        </span>
                      </Link>
                    );
                  })}
                  {nowVisible && iso === nowIso && (
                    <div className={styles.wtNow} style={{ top: nowTop }} aria-hidden>
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
              aria-label={eventAria(s)}
            >
              <span className={styles.listDate}>
                {capitalize(formatWeekdayDate(s.date))} · {formatTime(s.time)}
              </span>
              <span className={styles.eventCoach}>{coachName(s.coachId)}</span>
              <span className={styles.listTrailing}>
                <span className={styles.eventUnit}>{unitLabel(s.unitType)}</span>
                {s.id === nextSessionId && <span className={styles.nextBadge}>{fr.calendar.nextBadge}</span>}
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
            <span className={styles.legendDot} aria-hidden />
            {unitLabel(unit)}
          </span>
        ))}
      </div>
    </div>
  );
}
