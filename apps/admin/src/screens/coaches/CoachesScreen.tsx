import { useMemo, useState } from 'react';
import {
  UserPlus,
  Check,
  X,
  Star,
  FileCheck2,
  FileClock,
  FileX2,
  ShieldCheck,
  MapPin,
  UserX,
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
  Modal,
  ScoreBar,
  DefinitionList,
  Avatar,
  Field,
  RadioCards,
  TextArea,
  CheckboxCards,
} from '@/components';
import type { Column, TabItem } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './CoachesScreen.module.css';
import { CreateCoachWizard } from './CreateCoachWizard';
import {
  COACHES,
  COACH_KPIS,
  STATUS_META,
  TRUST_WEIGHTS,
  REMOVE_REASON_VALUES,
  type Coach,
  type CoachDoc,
} from './data';

type TabId = 'active' | 'pending' | 'invited' | 'all';

const TAB_FILTER: Record<TabId, (c: Coach) => boolean> = {
  active: (c) => c.status === 'active' || c.status === 'suspended',
  pending: (c) => c.status === 'pending',
  invited: (c) => c.status === 'invited',
  all: () => true,
};

const DOC_ICON = { valid: FileCheck2, pending: FileClock, missing: FileX2 } as const;
const DOC_TONE = { valid: 'progress', pending: 'warning', missing: 'danger' } as const;

type Decision = 'approved' | 'rejected';

export function CoachesScreen() {
  const t = useStrings();
  const [tab, setTab] = useState<TabId>('active');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Coach | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Coach | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [penaltyCleared, setPenaltyCleared] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () =>
      COACHES.filter(TAB_FILTER[tab]).filter((c) =>
        query.trim()
          ? `${c.firstName} ${c.lastName} ${c.zone}`.toLowerCase().includes(query.toLowerCase())
          : true,
      ),
    [tab, query],
  );

  const tabs: TabItem[] = [
    { id: 'active', label: t.coaches.tabs.active, count: COACHES.filter(TAB_FILTER.active).length },
    { id: 'pending', label: t.coaches.tabs.pending, count: COACHES.filter(TAB_FILTER.pending).length },
    { id: 'invited', label: t.coaches.tabs.invited, count: COACHES.filter(TAB_FILTER.invited).length },
    { id: 'all', label: t.coaches.tabs.all },
  ];

  function decide(id: string, d: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: d }));
    setOpen(null);
  }

  const columns: Column<Coach>[] = [
    {
      key: 'name',
      header: t.coaches.columns.coach,
      render: (c) => (
        <span className={shared.person}>
          <Avatar firstName={c.firstName} lastName={c.lastName} size="sm" decorative />
          <span className={shared.cellStack}>
            <span className={shared.cellStrong}>
              {c.firstName} {c.lastName}
            </span>
            <span className={shared.cellMuted}>{c.zone}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'trust',
      header: t.coaches.columns.trust,
      secondary: true,
      render: (c) =>
        c.trust > 0 ? (
          <span className={styles.trustCell}>
            <Star size={14} className={styles.starIcon} aria-hidden />
            <span className={shared.num}>{c.trust.toFixed(1)}</span>
          </span>
        ) : (
          <span className={shared.cellMuted}>—</span>
        ),
    },
    {
      key: 'sessions',
      header: t.coaches.columns.sessionsPerMonth,
      align: 'end',
      secondary: true,
      render: (c) => <span className={shared.num}>{c.sessionsThisMonth}</span>,
    },
    {
      key: 'status',
      header: t.coaches.columns.status,
      align: 'end',
      render: (c) => {
        const d = decisions[c.id];
        if (d === 'approved') return <Pill tone="progress">{t.coaches.decision.approved}</Pill>;
        if (d === 'rejected') return <Pill tone="danger">{t.coaches.decision.rejected}</Pill>;
        const meta = STATUS_META[c.status];
        return <Pill tone={meta.tone}>{t.coaches.status[c.status]}</Pill>;
      },
    },
  ];

  return (
    <div className={shared.stack}>
      <PageHeader
        title={t.coaches.title}
        subtitle={t.coaches.subtitle}
        actions={<Button icon={UserPlus} onClick={() => setCreating(true)}>{t.coaches.invite}</Button>}
      />

      <section className={shared.kpis} aria-label={t.coaches.kpiAria}>
        {COACH_KPIS.map((k) => {
          const copy = t.coaches.kpis[k.id];
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

      <Tabs items={tabs} active={tab} onChange={(id) => setTab(id as TabId)} ariaLabel={t.coaches.tabsAria} />

      <Card className={styles.tableCard}>
        <Toolbar end={<span className={shared.count}>{t.coaches.count(filtered.length)}</span>}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.coaches.searchPlaceholder}
            label={t.coaches.searchLabel}
          />
        </Toolbar>
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(c) => c.id}
          onRowClick={(c) => setOpen(c)}
          ariaLabel={t.coaches.tableAria}
          empty={t.coaches.tableEmpty}
        />
      </Card>

      <CoachDetail
        coach={open}
        decision={open ? decisions[open.id] : undefined}
        penaltyCleared={open ? Boolean(penaltyCleared[open.id]) : false}
        onClose={() => setOpen(null)}
        onDecide={decide}
        onClearPenalty={(id) => setPenaltyCleared((prev) => ({ ...prev, [id]: true }))}
        onRemoveAll={(coach) => {
          setOpen(null);
          setRemoving(coach);
        }}
      />
      <CreateCoachWizard open={creating} onClose={() => setCreating(false)} />
      <RemoveAllModal coach={removing} onClose={() => setRemoving(null)} />
    </div>
  );
}

function RemoveAllModal({ coach, onClose }: { coach: Coach | null; onClose: () => void }) {
  const t = useStrings();
  const [reason, setReason] = useState('');
  const [ack, setAck] = useState<string[]>([]);
  if (!coach) return null;
  const confirmed = ack.includes('ok');
  const reasonOptions = REMOVE_REASON_VALUES.map((value) => ({ value, label: t.coaches.removeReasons[value] }));
  return (
    <Modal
      open={Boolean(coach)}
      onClose={onClose}
      title={t.coaches.remove.title}
      subtitle={`${coach.firstName} ${coach.lastName}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.coaches.remove.cancel}
          </Button>
          <Button
            variant="danger"
            icon={UserX}
            disabled={!reason || !confirmed}
            disabledReason={!reason ? t.coaches.remove.reasonRequired : !confirmed ? t.coaches.remove.confirmRequired : undefined}
            onClick={onClose}
          >
            {t.coaches.remove.confirm}
          </Button>
        </>
      }
    >
      <div className={styles.removeBody}>
        <div className={shared.banner} data-tone="warning">
          <UserX className={shared.bannerIcon} size={18} aria-hidden />
          <p className={shared.bannerText}>{t.coaches.remove.warning}</p>
        </div>
        <Field label={t.coaches.remove.reasonLabel} required>
          {() => <RadioCards name="remove" options={reasonOptions} value={reason} onChange={setReason} columns={2} />}
        </Field>
        <Field label={t.coaches.remove.detailLabel}>
          {(id) => <TextArea id={id} placeholder={t.coaches.remove.detailPlaceholder} />}
        </Field>
        <CheckboxCards
          options={[{ value: 'ok', label: t.coaches.remove.ack }]}
          values={ack}
          onChange={setAck}
          columns={1}
        />
      </div>
    </Modal>
  );
}

function DocRow({ doc }: { doc: CoachDoc }) {
  const t = useStrings();
  const Icon = DOC_ICON[doc.state];
  return (
    <li className={styles.docRow}>
      <Icon size={16} className={styles[`doc_${doc.state}`]} aria-hidden />
      <span className={styles.docLabel}>{t.coaches.docNames[doc.key]}</span>
      <Pill tone={DOC_TONE[doc.state]}>{t.coaches.docState[doc.state]}</Pill>
    </li>
  );
}

function CoachDetail({
  coach,
  decision,
  penaltyCleared,
  onClose,
  onDecide,
  onClearPenalty,
  onRemoveAll,
}: {
  coach: Coach | null;
  decision?: Decision | undefined;
  penaltyCleared: boolean;
  onClose: () => void;
  onDecide: (id: string, d: Decision) => void;
  onClearPenalty: (id: string) => void;
  onRemoveAll: (coach: Coach) => void;
}) {
  const t = useStrings();
  if (!coach) return null;
  const c = coach;
  const isReview = c.status === 'pending' && !decision;
  const isActive = c.status === 'active' || c.status === 'suspended';
  const docsComplete = c.docs.length > 0 && c.docs.every((d) => d.state === 'valid');

  return (
    <Modal
      open={Boolean(coach)}
      onClose={onClose}
      size="wide"
      title={`${c.firstName} ${c.lastName}`}
      subtitle={c.zone}
      footer={
        isReview ? (
          <>
            <Button variant="danger" icon={X} onClick={() => onDecide(c.id, 'rejected')}>
              {t.coaches.detail.reject}
            </Button>
            <Button
              icon={Check}
              disabled={!docsComplete}
              disabledReason={docsComplete ? undefined : t.coaches.detail.docsIncomplete}
              onClick={() => onDecide(c.id, 'approved')}
            >
              {t.coaches.detail.approve}
            </Button>
          </>
        ) : isActive ? (
          <Button variant="danger" icon={UserX} onClick={() => onRemoveAll(c)}>
            {t.coaches.detail.removeAll}
          </Button>
        ) : undefined
      }
    >
      <div className={styles.detail}>
        <div className={styles.detailTop}>
          <span className={shared.metaRow}>
            <MapPin size={14} aria-hidden /> {c.zone}
          </span>
          {c.trust > 0 && (
            <span className={styles.trustCell}>
              <Star size={14} className={styles.starIcon} aria-hidden />
              <strong>{c.trust.toFixed(1)}</strong> {t.coaches.detail.trustIndex}
            </span>
          )}
        </div>

        {c.penalty && !penaltyCleared && (
          <div className={shared.banner} data-tone="danger">
            <ShieldCheck className={shared.bannerIcon} size={18} aria-hidden />
            <p className={shared.bannerText}>
              <strong>{t.coaches.detail.penaltyActive}</strong> {c.penalty} ({c.appliedAt}).
            </p>
            <Button size="md" variant="secondary" onClick={() => onClearPenalty(c.id)}>
              {t.coaches.detail.clearPenalty}
            </Button>
          </div>
        )}
        {c.penalty && penaltyCleared && (
          <div className={shared.banner} data-tone="warning">
            <ShieldCheck className={shared.bannerIcon} size={18} aria-hidden />
            <p className={shared.bannerText}>{t.coaches.detail.penaltyCleared}</p>
          </div>
        )}

        {c.trust > 0 && (
          <section className={styles.block}>
            <h3 className={styles.blockTitle}>{t.coaches.detail.trustBreakdownTitle}</h3>
            <p className={styles.weights}>
              {t.coaches.detail.coefficients}{' '}
              {TRUST_WEIGHTS.map((w, i) => (
                <span key={w.key}>
                  {i > 0 ? ' · ' : ''}
                  {t.coaches.trustWeights[w.key]} {w.weight}%
                </span>
              ))}
            </p>
            <div className={styles.scoreGrid}>
              <ScoreBar label={t.coaches.trustParts.rating} value={c.trustParts.rating} tone="reward" />
              <ScoreBar label={t.coaches.trustParts.reliability} value={c.trustParts.reliability} tone="progress" />
              <ScoreBar label={t.coaches.trustParts.responsiveness} value={c.trustParts.responsiveness} tone="info" />
              <ScoreBar label={t.coaches.trustParts.tenure} value={c.trustParts.tenure} tone="accent" />
            </div>
          </section>
        )}

        <section className={styles.block}>
          <h3 className={styles.blockTitle}>{t.coaches.detail.docsTitle}</h3>
          {c.docs.length > 0 ? (
            <ul className={styles.docs}>
              {c.docs.map((d) => (
                <DocRow key={d.key} doc={d} />
              ))}
            </ul>
          ) : (
            <p className={shared.muted}>{t.coaches.detail.docsEmpty}</p>
          )}
        </section>

        {c.status !== 'invited' && c.totalSessions > 0 && (
          <section className={styles.block}>
            <h3 className={styles.blockTitle}>{t.coaches.detail.activityTitle}</h3>
            <DefinitionList
              items={[
                { term: t.coaches.detail.email, value: c.email },
                { term: t.coaches.detail.sessionsDone, value: String(c.totalSessions) },
                { term: t.coaches.detail.sessionsThisMonth, value: String(c.sessionsThisMonth) },
                { term: t.coaches.detail.avgRating, value: `${c.rating.toFixed(1)} / 5` },
                { term: t.coaches.detail.earningsMonth, value: <span className={shared.num}>{c.earningsMonth} € HT</span> },
              ]}
            />
          </section>
        )}
      </div>
    </Modal>
  );
}
