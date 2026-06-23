import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Star,
  Download,
  CalendarClock,
  Clock,
  Users,
  Plus,
  History,
  Link2,
  RefreshCw,
  UserCog,
} from 'lucide-react';
import {
  PageHeader,
  KpiCard,
  Card,
  Button,
  Pill,
  Tabs,
  Table,
  Toolbar,
  SearchInput,
  Select,
  Modal,
  DefinitionList,
  Avatar,
} from '@/components';
import type { Column, TabItem } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './SessionsScreen.module.css';
import { CreateSessionWizard } from './CreateSessionWizard';
import {
  SESSIONS,
  SESSION_KPIS,
  STATUS_META,
  MONTH_KPIS,
  MONTH_DAYS,
  WEEK_HOURS,
  WEEK_DAYS,
  WEEK_GRID,
  SESSION_TIMELINE,
  WEEK_RANGE,
  MONTH_LABEL,
  type Session,
} from './data';

type View = 'day' | 'week' | 'month';
type TabId = 'today' | 'upcoming' | 'completed' | 'incident' | 'all';

const TAB_FILTER: Record<TabId, (s: Session) => boolean> = {
  today: (s) => s.iso.startsWith('2026-06-15'),
  upcoming: (s) => s.status === 'upcoming',
  completed: (s) => s.status === 'completed',
  incident: (s) => s.status === 'incident',
  all: () => true,
};

/** Filtre coach — `all` est traduit ; les noms restent du texte authoré. */
const COACHES = [
  { value: 'all', label: null },
  { value: 'Karim', label: 'Karim Benali' },
  { value: 'Sophie', label: 'Sophie Marchand' },
  { value: 'Tom', label: 'Tom Lefebvre' },
  { value: 'Léa', label: 'Léa Dubois' },
  { value: 'Nadia', label: 'Nadia Cherif' },
] as const;

const VIEW_IDS: View[] = ['day', 'week', 'month'];

export function SessionsScreen() {
  const t = useStrings();
  const [view, setView] = useState<View>('day');
  const [tab, setTab] = useState<TabId>('today');
  const [query, setQuery] = useState('');
  const [coach, setCoach] = useState('all');
  const [open, setOpen] = useState<Session | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className={shared.stack}>
      <PageHeader
        title={t.sessions.title}
        subtitle={t.sessions.subtitle}
        actions={
          <>
            <Button variant="secondary" icon={Download}>
              {t.sessions.exportExcel}
            </Button>
            <Button icon={Plus} onClick={() => setCreating(true)}>
              {t.sessions.newSession}
            </Button>
          </>
        }
      />

      <section className={shared.kpis} aria-label={t.sessions.kpiAria}>
        {SESSION_KPIS.map((k) => {
          const copy = t.sessions.kpis[k.id];
          return (
            <KpiCard
              key={k.id}
              label={copy.label}
              value={k.value}
              hint={copy.hint}
              {...(k.lead ? { lead: true } : {})}
            />
          );
        })}
      </section>

      <div className={styles.viewBar}>
        <div className={styles.viewSwitch} role="tablist" aria-label={t.sessions.calendarViewAria}>
          {VIEW_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              className={styles.viewBtn}
              data-active={view === id || undefined}
              onClick={() => setView(id)}
            >
              {t.sessions.views[id]}
            </button>
          ))}
        </div>
      </div>

      {view === 'day' && (
        <DayView
          tab={tab}
          setTab={setTab}
          query={query}
          setQuery={setQuery}
          coach={coach}
          setCoach={setCoach}
          onOpen={setOpen}
        />
      )}
      {view === 'week' && <WeekView />}
      {view === 'month' && <MonthView />}

      <SessionDetail session={open} onClose={() => setOpen(null)} />
      <CreateSessionWizard open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}

function DayView({
  tab,
  setTab,
  query,
  setQuery,
  coach,
  setCoach,
  onOpen,
}: {
  tab: TabId;
  setTab: (t: TabId) => void;
  query: string;
  setQuery: (q: string) => void;
  coach: string;
  setCoach: (c: string) => void;
  onOpen: (s: Session) => void;
}) {
  const t = useStrings();
  const filtered = useMemo(() => {
    return SESSIONS.filter(TAB_FILTER[tab])
      .filter((s) => (coach === 'all' ? true : s.coach?.firstName === coach))
      .filter((s) =>
        query.trim()
          ? `${s.ehpad} ${s.city} ${s.coach?.firstName ?? ''} ${s.coach?.lastName ?? ''}`
              .toLowerCase()
              .includes(query.toLowerCase())
          : true,
      )
      .sort((a, b) => a.iso.localeCompare(b.iso));
  }, [tab, coach, query]);

  const tabs: TabItem[] = [
    { id: 'today', label: t.sessions.tabs.today, count: SESSIONS.filter(TAB_FILTER.today).length },
    { id: 'upcoming', label: t.sessions.tabs.upcoming, count: SESSIONS.filter(TAB_FILTER.upcoming).length },
    { id: 'completed', label: t.sessions.tabs.completed, count: SESSIONS.filter(TAB_FILTER.completed).length },
    { id: 'incident', label: t.sessions.tabs.incident, count: SESSIONS.filter(TAB_FILTER.incident).length },
    { id: 'all', label: t.sessions.tabs.all },
  ];

  const columns: Column<Session>[] = [
    {
      key: 'when',
      header: t.sessions.columns.when,
      render: (s) => (
        <span className={shared.cellStack}>
          <span className={shared.cellStrong}>{s.date}</span>
          <span className={shared.cellMuted}>
            {s.time} · {s.duration}
          </span>
        </span>
      ),
    },
    {
      key: 'ehpad',
      header: t.sessions.columns.ehpad,
      render: (s) => (
        <span className={shared.cellStack}>
          <span className={shared.cellStrong}>{s.ehpad}</span>
          <span className={shared.cellMuted}>
            {s.unit} · {s.city}
          </span>
        </span>
      ),
    },
    {
      key: 'coach',
      header: t.sessions.columns.coach,
      secondary: true,
      render: (s) =>
        s.coach ? (
          <span className={shared.person}>
            <Avatar firstName={s.coach.firstName} lastName={s.coach.lastName} size="sm" decorative />
            <span>
              {s.coach.firstName} {s.coach.lastName}
            </span>
          </span>
        ) : (
          <Pill tone="danger">{t.sessions.unassigned}</Pill>
        ),
    },
    {
      key: 'status',
      header: t.sessions.columns.status,
      align: 'end',
      render: (s) => {
        const meta = STATUS_META[s.status];
        return <Pill tone={meta.tone}>{t.sessions.status[s.status]}</Pill>;
      },
    },
  ];

  const coachOptions = COACHES.map((c) => ({
    value: c.value,
    label: c.label ?? t.sessions.allCoaches,
  }));

  return (
    <>
      <Tabs items={tabs} active={tab} onChange={(id) => setTab(id as TabId)} ariaLabel={t.sessions.filterByStatus} />
      <Card className={styles.tableCard}>
        <Toolbar end={<span className={shared.count}>{t.sessions.sessionCount(filtered.length)}</span>}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.sessions.searchPlaceholder}
            label={t.sessions.searchLabel}
          />
          <Select value={coach} onChange={setCoach} options={coachOptions} label={t.sessions.filterByCoach} />
        </Toolbar>
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(s) => s.id}
          onRowClick={onOpen}
          ariaLabel={t.sessions.tableAria}
          empty={t.sessions.emptyFilter}
        />
      </Card>
    </>
  );
}

function WeekView() {
  const t = useStrings();
  const max = Math.max(...WEEK_GRID.flat());
  const total = WEEK_GRID.flat().reduce((a, b) => a + b, 0);
  return (
    <Card className={styles.tableCard}>
      <div className={styles.calHead}>
        <h3 className={styles.calTitle}>{t.sessions.weekTitle(WEEK_RANGE)}</h3>
        <span className={shared.count}>{t.sessions.sessionsTotal(total)}</span>
      </div>
      <div className={styles.weekGrid}>
        <div className={styles.weekCorner} />
        {WEEK_DAYS.map((d) => (
          <div key={d} className={styles.weekDayHead}>
            {d}
          </div>
        ))}
        {WEEK_HOURS.map((h, hi) => (
          <div key={h} className={styles.weekRow}>
            <div className={styles.weekHour}>{h}</div>
            {WEEK_DAYS.map((d, di) => {
              const n = WEEK_GRID[hi]?.[di] ?? 0;
              const level = n === 0 ? 0 : Math.ceil((n / max) * 4);
              return (
                <div
                  key={d}
                  className={styles.weekCell}
                  data-level={level}
                  title={`${d} ${h} · ${t.sessions.sessionCount(n)}`}
                >
                  {n > 0 ? n : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <Legend />
    </Card>
  );
}

function MonthView() {
  const t = useStrings();
  const max = Math.max(...MONTH_DAYS.map((d) => d.count));
  const total = MONTH_DAYS.reduce((a, d) => a + d.count, 0);
  return (
    <>
      <section className={shared.kpis} aria-label={t.sessions.monthKpiAria}>
        {MONTH_KPIS.map((k) => (
          <KpiCard key={k.id} label={t.sessions.monthKpis[k.id]} value={k.value} />
        ))}
      </section>
      <Card className={styles.tableCard}>
        <div className={styles.calHead}>
          <h3 className={styles.calTitle}>{MONTH_LABEL}</h3>
          <span className={shared.count}>{t.sessions.sessionsTotal(total)}</span>
        </div>
        <div className={styles.monthGrid}>
          {t.sessions.weekdayShort.map((d, i) => (
            <div key={i} className={styles.monthDayHead}>
              {d}
            </div>
          ))}
          {MONTH_DAYS.map((d) => {
            const level = d.count === 0 ? 0 : Math.ceil((d.count / max) * 4);
            return (
              <div
                key={d.day}
                className={styles.monthCell}
                data-level={level}
                data-today={d.today || undefined}
                title={`${t.sessions.monthDay(d.day)} · ${t.sessions.sessionCount(d.count)}`}
              >
                <span className={styles.monthDayNum}>{d.day}</span>
                {d.count > 0 && <span className={styles.monthCount}>{d.count}</span>}
              </div>
            );
          })}
        </div>
        <Legend />
      </Card>
    </>
  );
}

function Legend() {
  const t = useStrings();
  return (
    <div className={styles.legend}>
      <span className={shared.cellMuted}>{t.sessions.densityLow}</span>
      {[0, 1, 2, 3, 4].map((l) => (
        <span key={l} className={styles.legendCell} data-level={l} />
      ))}
      <span className={shared.cellMuted}>{t.sessions.densityHigh}</span>
    </div>
  );
}

function SessionDetail({ session, onClose }: { session: Session | null; onClose: () => void }) {
  const t = useStrings();
  if (!session) return null;
  const meta = STATUS_META[session.status];
  const r = session.report;

  return (
    <Modal
      open={Boolean(session)}
      onClose={onClose}
      size="wide"
      title={`${session.ehpad} — ${session.unit}`}
      subtitle={`${session.date} · ${session.time} · ${session.duration}`}
      footer={
        session.status === 'upcoming' ? (
          <>
            <Button variant="ghost" icon={CalendarClock}>{t.sessions.detail.reschedule}</Button>
            <Button variant="secondary" icon={UserCog}>{t.sessions.detail.changeCoach}</Button>
          </>
        ) : r ? (
          <Button icon={Download}>{t.sessions.detail.downloadPdf}</Button>
        ) : undefined
      }
    >
      <div className={styles.detail}>
        <div className={styles.detailTop}>
          <Pill tone={meta.tone}>{t.sessions.status[session.status]}</Pill>
          {session.coach ? (
            <span className={shared.person}>
              <Avatar firstName={session.coach.firstName} lastName={session.coach.lastName} size="sm" decorative />
              <span>
                {session.coach.firstName} {session.coach.lastName}
              </span>
            </span>
          ) : (
            <Pill tone="danger">{t.sessions.detail.coachUnassigned}</Pill>
          )}
          {r?.firstTogether && <Pill tone="reward">{t.sessions.detail.firstTogether}</Pill>}
        </div>

        {session.incident && (
          <div className={shared.banner} data-tone="danger">
            <AlertTriangle className={shared.bannerIcon} size={18} aria-hidden />
            <p className={shared.bannerText}>{session.incident}</p>
          </div>
        )}

        {r && (
          <div className={styles.metrics}>
            <Metric icon={Users} label={t.sessions.detail.participants} value={String(r.participants)} />
            <Metric icon={Star} label={t.sessions.detail.atmosphere} value={`${r.atmosphere} / 5`} />
            <Metric
              icon={AlertTriangle}
              label={t.sessions.detail.difficulties}
              value={r.difficulties ? t.sessions.detail.yes : t.sessions.detail.no}
            />
          </div>
        )}

        {r && (
          <section className={styles.block}>
            <h3 className={styles.blockTitle}>{t.sessions.detail.coachReport}</h3>
            <p className={styles.prose}>{r.summary}</p>
            {r.messageToEhpad && (
              <p className={styles.prose}>
                <strong>{t.sessions.detail.messageToEhpad} </strong>
                {r.messageToEhpad}
              </p>
            )}
            {r.ehpadRating !== undefined && (
              <p className={styles.prose}>
                <strong>{t.sessions.detail.ehpadRating} </strong>
                {r.ehpadRating} / 5{r.ehpadComment ? ` — « ${r.ehpadComment} »` : ''}
              </p>
            )}
          </section>
        )}

        {!r && session.status === 'inProgress' && (
          <div className={shared.banner} data-tone="warning">
            <Clock className={shared.bannerIcon} size={18} aria-hidden />
            <p className={shared.bannerText}>{t.sessions.detail.inProgressNote(session.time)}</p>
          </div>
        )}

        <section className={styles.block}>
          <h3 className={styles.blockTitle}>
            <History size={16} aria-hidden /> {t.sessions.detail.fullHistory}
          </h3>
          <ol className={styles.timeline}>
            {SESSION_TIMELINE.map((e, i) => (
              <li key={i} className={styles.tlRow}>
                <span className={styles.tlTime}>{e.time}</span>
                <span className={styles.tlDot} data-actor={e.actor} />
                <span className={styles.tlBody}>
                  <span className={styles.tlTitle}>
                    {e.title} <Pill tone="neutral">{t.sessions.actor[e.actor]}</Pill>
                  </span>
                  <span className={shared.cellMuted}>{e.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.block}>
          <h3 className={styles.blockTitle}>
            <Link2 size={16} aria-hidden /> {t.sessions.detail.origin}
          </h3>
          <DefinitionList
            items={[
              { term: t.sessions.detail.fromContract, value: t.sessions.detail.fromContractValue },
              { term: t.sessions.detail.createdBy, value: t.sessions.detail.createdByValue },
              { term: t.sessions.detail.unitType, value: session.unit },
              { term: t.sessions.detail.city, value: session.city },
            ]}
          />
        </section>

        <div className={styles.adminActions}>
          <Button variant="ghost" size="md" icon={RefreshCw}>{t.sessions.detail.rerunAlgo}</Button>
          <Button variant="ghost" size="md" icon={UserCog}>{t.sessions.detail.changeCoach}</Button>
          <Button variant="ghost" size="md" icon={CalendarClock}>{t.sessions.detail.reschedule}</Button>
        </div>
      </div>
    </Modal>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <Icon size={18} className={styles.metricIcon} aria-hidden />
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  );
}
