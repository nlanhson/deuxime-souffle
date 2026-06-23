import { useState } from 'react';
import {
  Zap,
  MapPin,
  CheckCircle2,
  Repeat,
  ChevronRight,
  Sparkles,
  History,
  Phone,
  CalendarX,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  PageHeader,
  KpiCard,
  Card,
  CardSection,
  Button,
  Pill,
  ScoreBar,
  Avatar,
  Modal,
  RadioCards,
  Field,
  TextArea,
} from '@/components';
import { useStrings } from '@/i18n';
import type { Copy } from '@/i18n/fr';
import shared from '../screen.module.css';
import styles from './AssignmentsScreen.module.css';
import {
  OPEN_SESSIONS,
  COVERAGE_KPIS,
  SCORE_WEIGHTS,
  ASSIGNMENT_LOGS,
  URGENCY_SESSIONS,
  LISTE_B,
  REPORT_DATES,
  OVERRIDE_REASONS,
  MASS_VALIDATE,
  type OpenSession,
  type Candidate,
  type UrgencySession,
} from './data';

const LOG_TONE = {
  auto: 'progress',
  manual: 'info',
  override: 'warning',
  emergency: 'danger',
} as const;

const DEADLINE_TONE = { 'J-3': 'danger', 'J-5': 'warning', 'J-7': 'info' } as const;

export function AssignmentsScreen() {
  const t = useStrings();
  const sessions = [...OPEN_SESSIONS].sort((a, b) => a.iso.localeCompare(b.iso));
  const [selectedId, setSelectedId] = useState<string>(sessions[0]?.id ?? '');
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [override, setOverride] = useState<{ session: OpenSession; candidate: Candidate } | null>(null);
  const [urgency, setUrgency] = useState<{ kind: 'report' | 'listB'; session: UrgencySession } | null>(null);
  const selected = sessions.find((s) => s.id === selectedId) ?? sessions[0];
  const urgentCount = URGENCY_SESSIONS.length;

  function assign(sessionId: string, candidate: Candidate) {
    setAssigned((prev) => ({ ...prev, [sessionId]: `${candidate.firstName} ${candidate.lastName}` }));
  }

  return (
    <div className={shared.stack}>
      <PageHeader
        title={t.assignments.title}
        subtitle={t.assignments.subtitle}
        actions={<Button icon={Sparkles}>{t.assignments.runAuto}</Button>}
      />

      {urgentCount > 0 && (
        <div className={shared.banner} data-tone="danger">
          <Zap className={shared.bannerIcon} size={20} aria-hidden />
          <p className={shared.bannerText}>
            <strong>{t.assignments.bannerLead}</strong> {t.assignments.bannerText(urgentCount)}
          </p>
        </div>
      )}

      <section className={shared.kpis} aria-label={t.assignments.kpiAria}>
        {COVERAGE_KPIS.map((k) => (
          <KpiCard
            key={k.id}
            label={t.assignments.kpis[k.id].label}
            value={k.value}
            hint={t.assignments.kpis[k.id].hint}
            {...(k.lead ? { lead: true } : {})}
          />
        ))}
      </section>

      {/* Mass validation summary */}
      <Card className={styles.massCard}>
        <div className={styles.massText}>
          <h3 className={styles.massTitle}>
            <CheckCheck size={18} aria-hidden /> {t.assignments.massTitle(MASS_VALIDATE.total)}
          </h3>
          <p className={shared.muted}>{t.assignments.massMeta(MASS_VALIDATE.revenue)}</p>
          <div className={styles.massStats}>
            <span><strong>{MASS_VALIDATE.clean}</strong> {t.assignments.massClean}</span>
            <span className={styles.massWarn}><strong>{MASS_VALIDATE.conflicts}</strong> {t.assignments.massConflicts}</span>
            <span className={styles.massDanger}><strong>{MASS_VALIDATE.manual}</strong> {t.assignments.massManual}</span>
          </div>
        </div>
        <Button icon={CheckCheck}>{t.assignments.massValidate(MASS_VALIDATE.clean)}</Button>
      </Card>

      {/* Urgency cascade */}
      <CardSection title={t.assignments.cascadeTitle} actions={<Pill tone="danger">{t.assignments.cascadeOpen(urgentCount)}</Pill>}>
        <div className={styles.urgencyGrid}>
          {URGENCY_SESSIONS.map((u) => (
            <div key={u.id} className={styles.urgencyCard} data-critical={u.deadline === 'J-3' || undefined}>
              <div className={styles.urgencyHead}>
                <Pill tone={DEADLINE_TONE[u.deadline]}>{u.deadline}</Pill>
                <span className={shared.cellMuted}>
                  {t.assignments.notifiedResponses(u.notified, u.responses)}
                </span>
              </div>
              <p className={styles.urgencyName}>{u.ehpad}</p>
              <p className={shared.cellMuted}>
                {u.date} {u.time} · {u.unit} · {u.city}
              </p>
              <ul className={styles.cascade}>
                {u.cascade.map((c) => (
                  <li key={c.step} className={styles.cascadeStep} data-done={c.done || undefined}>
                    {c.done ? <CheckCircle2 size={13} aria-hidden /> : <AlertTriangle size={13} aria-hidden />}
                    {t.assignments.cascadeSteps[c.step]}
                  </li>
                ))}
              </ul>
              <div className={styles.urgencyActions}>
                <Button size="md" variant="secondary" icon={CalendarX} onClick={() => setUrgency({ kind: 'report', session: u })}>
                  {t.assignments.report}
                </Button>
                <Button size="md" variant="ghost" icon={Phone} onClick={() => setUrgency({ kind: 'listB', session: u })}>
                  {t.assignments.listB}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardSection>

      <div className={shared.split}>
        <Card className={styles.listCard}>
          <div className={styles.listHead}>
            <h3 className={styles.listTitle}>{t.assignments.calendarTitle}</h3>
            <span className={shared.count}>{t.assignments.toFillCount(sessions.length)}</span>
          </div>
          <ul className={styles.queue}>
            {sessions.map((s) => {
              const done = assigned[s.id];
              const isSel = s.id === selected?.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={styles.row}
                    data-selected={isSel || undefined}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <span className={styles.rowDate}>
                      <span className={styles.rowDay}>{s.date}</span>
                      <span className={styles.rowTime}>{s.time}</span>
                    </span>
                    <span className={styles.rowMain}>
                      <span className={shared.cellStrong}>{s.ehpad}</span>
                      <span className={shared.cellMuted}>
                        {s.unit} · {s.city}
                      </span>
                    </span>
                    <span className={styles.rowState}>
                      {done ? (
                        <Pill tone="progress">
                          <CheckCircle2 size={13} aria-hidden /> {done}
                        </Pill>
                      ) : s.urgent ? (
                        <Pill tone="danger">{t.assignments.urgent}</Pill>
                      ) : (
                        <Pill tone="warning">{t.assignments.toFill}</Pill>
                      )}
                    </span>
                    <ChevronRight size={18} className={styles.rowChevron} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {selected && (
          <SuggestionPanel
            t={t}
            session={selected}
            assignedTo={assigned[selected.id]}
            onValidate={(c) => assign(selected.id, c)}
            onOverride={(c) => setOverride({ session: selected, candidate: c })}
          />
        )}
      </div>

      <CardSection title={t.assignments.logTitle} actions={<History size={18} aria-hidden />}>
        <ul className={styles.logs}>
          {ASSIGNMENT_LOGS.map((l) => (
            <li key={l.id} className={styles.logRow}>
              <Pill tone={LOG_TONE[l.kind]}>{l.actor}</Pill>
              <span className={styles.logText}>{l.text}</span>
              <span className={styles.logTime}>{l.time}</span>
            </li>
          ))}
        </ul>
      </CardSection>

      <OverrideModal
        t={t}
        target={override}
        onClose={() => setOverride(null)}
        onConfirm={(tg) => {
          assign(tg.session.id, tg.candidate);
          setOverride(null);
        }}
      />
      <UrgencyModal t={t} urgency={urgency} onClose={() => setUrgency(null)} />
    </div>
  );
}

function SuggestionPanel({
  t,
  session,
  assignedTo,
  onValidate,
  onOverride,
}: {
  t: Copy;
  session: OpenSession;
  assignedTo?: string | undefined;
  onValidate: (candidate: Candidate) => void;
  onOverride: (candidate: Candidate) => void;
}) {
  const ranked = [...session.candidates].sort((a, b) => b.score - a.score);
  return (
    <Card className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <h3 className={styles.panelTitle}>{t.assignments.suggestedTitle}</h3>
          <p className={shared.muted}>
            {session.ehpad} · {session.date} {session.time}
          </p>
        </div>
        {session.urgent && <Pill tone="danger">{t.assignments.urgent}</Pill>}
      </div>

      {session.reason && <p className={styles.reason}>{session.reason}</p>}

      <div className={styles.weights}>
        {t.assignments.weightsLead}{' '}
        {SCORE_WEIGHTS.map((w, i) => (
          <span key={w.key}>
            {i > 0 ? ' · ' : ''}
            {t.assignments.weights[w.key]} {w.weight}%
          </span>
        ))}
      </div>

      <ul className={styles.candidates}>
        {ranked.map((c, i) => {
          const picked = assignedTo === `${c.firstName} ${c.lastName}`;
          return (
            <li key={c.id} className={styles.candidate} data-picked={picked || undefined}>
              <div className={styles.candHead}>
                <span className={shared.person}>
                  <Avatar firstName={c.firstName} lastName={c.lastName} size="sm" decorative />
                  <span className={shared.cellStack}>
                    <span className={shared.cellStrong}>
                      {i === 0 && <span className={styles.best}>{t.assignments.recommended} · </span>}
                      {c.firstName} {c.lastName}
                    </span>
                    <span className={shared.cellMuted}>
                      <MapPin size={11} aria-hidden /> {c.city} · {c.distanceKm} km · {c.trust} ★
                    </span>
                  </span>
                </span>
                <span className={styles.scoreBig}>{c.score}</span>
              </div>

              <div className={styles.tags}>
                {c.selfPositioned && <Pill tone="progress">{t.assignments.selfPositioned}</Pill>}
                {c.chains && (
                  <Pill tone="info">
                    <Repeat size={12} aria-hidden /> {t.assignments.chained}
                  </Pill>
                )}
              </div>

              <div className={styles.scoreGrid}>
                <ScoreBar label={t.assignments.parts.auto} value={c.parts.auto} tone="accent" />
                <ScoreBar label={t.assignments.parts.fiabilite} value={c.parts.fiabilite} tone="progress" />
                <ScoreBar label={t.assignments.parts.proximite} value={c.parts.proximite} tone="info" />
                <ScoreBar label={t.assignments.parts.equite} value={c.parts.equite} tone="reward" />
              </div>

              <div className={styles.candActions}>
                {picked ? (
                  <Pill tone="progress">
                    <CheckCircle2 size={14} aria-hidden /> {t.assignments.assigned}
                  </Pill>
                ) : i === 0 ? (
                  <Button size="md" onClick={() => onValidate(c)}>
                    {t.assignments.validateSuggestion}
                  </Button>
                ) : (
                  <Button size="md" variant="secondary" onClick={() => onOverride(c)}>
                    {t.assignments.assignOverride}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function OverrideModal({
  t,
  target,
  onClose,
  onConfirm,
}: {
  t: Copy;
  target: { session: OpenSession; candidate: Candidate } | null;
  onClose: () => void;
  onConfirm: (target: { session: OpenSession; candidate: Candidate }) => void;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  if (!target) return null;
  const { session, candidate } = target;
  const top = [...session.candidates].sort((a, b) => b.score - a.score)[0];
  const gap = top ? candidate.score - top.score : 0;
  const reasonOptions = OVERRIDE_REASONS.map((value) => ({ value, label: t.assignments.reasons[value] }));

  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title={t.assignments.overrideTitle}
      subtitle={`${session.ehpad} · ${session.date} ${session.time}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.assignments.cancel}
          </Button>
          <Button disabled={!reason} disabledReason={reason ? undefined : t.assignments.reasonRequired} onClick={() => onConfirm(target)}>
            {t.assignments.validateOverride}
          </Button>
        </>
      }
    >
      <div className={styles.overrideBody}>
        <div className={styles.overrideCompare}>
          <div>
            <span className={shared.cellMuted}>{t.assignments.topPick}</span>
            <p className={shared.cellStrong}>
              {top?.firstName} {top?.lastName} · {top?.score}
            </p>
          </div>
          <div>
            <span className={shared.cellMuted}>{t.assignments.chosenCoach}</span>
            <p className={shared.cellStrong}>
              {candidate.firstName} {candidate.lastName} · {candidate.score}
            </p>
          </div>
          <div>
            <span className={shared.cellMuted}>{t.assignments.gapLabel}</span>
            <p className={styles.gap}>{t.assignments.gapPts(gap)}</p>
          </div>
        </div>
        <Field label={t.assignments.overrideReasonLabel} required>
          {() => <RadioCards name="override" options={reasonOptions} value={reason} onChange={setReason} />}
        </Field>
        <Field label={t.assignments.precisionLabel}>
          {(id) => (
            <TextArea id={id} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.assignments.precisionPlaceholder} />
          )}
        </Field>
      </div>
    </Modal>
  );
}

function UrgencyModal({
  t,
  urgency,
  onClose,
}: {
  t: Copy;
  urgency: { kind: 'report' | 'listB'; session: UrgencySession } | null;
  onClose: () => void;
}) {
  if (!urgency) return null;
  const { kind, session } = urgency;

  if (kind === 'report') {
    return (
      <Modal
        open
        onClose={onClose}
        title={t.assignments.reportTitle}
        subtitle={`${session.ehpad} · ${session.date} ${session.time}`}
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              {t.assignments.cancel}
            </Button>
            <Button onClick={onClose}>{t.assignments.confirmReport}</Button>
          </>
        }
      >
        <div className={styles.reportBody}>
          <ReportGroup t={t} title={t.assignments.reportShort} dates={REPORT_DATES.court} />
          <ReportGroup t={t} title={t.assignments.reportMedium} dates={REPORT_DATES.moyen} />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={t.assignments.listBTitle}
      subtitle={t.assignments.listBSubtitle}
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t.assignments.close}
        </Button>
      }
    >
      <ul className={styles.listB}>
        {LISTE_B.map((c) => (
          <li key={c.id} className={styles.listBRow}>
            <span className={shared.person}>
              <Avatar firstName={c.firstName} lastName={c.lastName} size="sm" decorative />
              <span className={shared.cellStack}>
                <span className={shared.cellStrong}>
                  {c.firstName} {c.lastName} · {c.score}
                </span>
                <span className={shared.cellMuted}>{c.note}</span>
              </span>
            </span>
            <span className={styles.listBRight}>
              {c.available ? <Pill tone="progress">{t.assignments.available}</Pill> : <Pill tone="warning">{t.assignments.toConfirm}</Pill>}
              <a className={styles.callBtn} href={`tel:${c.phone.replace(/\s/g, '')}`}>
                <Phone size={14} aria-hidden /> {c.phone}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function ReportGroup({
  t,
  title,
  dates,
}: {
  t: Copy;
  title: string;
  dates: { label: string; coaches: number; recommended: boolean }[];
}) {
  return (
    <section className={styles.block}>
      <h3 className={styles.blockTitle}>{title}</h3>
      <ul className={styles.reportDates}>
        {dates.map((d) => (
          <li key={d.label} className={styles.reportDate}>
            <span className={shared.cellStrong}>{d.label}</span>
            <span className={styles.reportRight}>
              <span className={shared.cellMuted}>{t.assignments.coachesAvailable(d.coaches)}</span>
              {d.recommended && <Pill tone="progress">{t.assignments.recommended}</Pill>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
