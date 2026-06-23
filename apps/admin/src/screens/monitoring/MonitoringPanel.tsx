import { useState } from 'react';
import { RefreshCw, ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from 'lucide-react';
import { Card, CardSection, Table, Pill, Avatar, Button, Select } from '@/components';
import type { Column } from '@/components';
import shared from '../screen.module.css';
import styles from './MonitoringPanel.module.css';
import {
  MONTH_OPTIONS,
  NO_COACH_SESSIONS,
  HIGH_CANCELLATION,
  POPULAR_SESSIONS,
  CONCENTRATION,
  COACH_PERFORMANCE,
  EHPAD_SENSITIVITY,
  type NoCoachSession,
  type PopularSession,
  type ConcentrationCoach,
  type CoachPerfRow,
  type SensitivityRow,
} from './data';

const TREND_ICON: Record<CoachPerfRow['trend'], LucideIcon> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

const SENSITIVITY: Record<SensitivityRow['level'], { label: string; tone: 'progress' | 'warning' | 'danger' }> = {
  stable: { label: 'Stable', tone: 'progress' },
  watch: { label: 'À surveiller', tone: 'warning' },
  sensitive: { label: 'Sensible', tone: 'danger' },
};

/**
 * Supervision tab for the Dashboard — read-only monitoring rollups
 * (WBS DASH-02 problem sessions, DASH-03 popular sessions, DASH-05 coach
 * concentration, DASH-12 coach performance, DASH-13 EHPAD sensitivity).
 */
export function MonitoringPanel() {
  const [month, setMonth] = useState('2026-06');

  /* DASH-02 — séances sans coach > 7 j */
  const noCoachCols: Column<NoCoachSession>[] = [
    { key: 'ehpad', header: 'Établissement', render: (r) => <span className={shared.cellStrong}>{r.ehpad}</span> },
    { key: 'slot', header: 'Créneau', secondary: true, render: (r) => r.slot },
    { key: 'unit', header: 'Type', secondary: true, render: (r) => <Pill tone="neutral">{r.unit}</Pill> },
    {
      key: 'age',
      header: 'Ancienneté',
      align: 'end',
      render: (r) => <Pill tone={r.ageDays >= 14 ? 'danger' : 'warning'}>{r.ageDays} j</Pill>,
    },
  ];

  /* DASH-03 — séances populaires */
  const popularCols: Column<PopularSession>[] = [
    { key: 'ehpad', header: 'Établissement', render: (r) => <span className={shared.cellStrong}>{r.ehpad}</span> },
    { key: 'slot', header: 'Créneau', secondary: true, render: (r) => r.slot },
    {
      key: 'hands',
      header: 'Mains levées',
      align: 'end',
      render: (r) => <span className={shared.num}>{r.handRaises}</span>,
    },
    {
      key: 'potential',
      header: 'Potentiel',
      align: 'end',
      secondary: true,
      render: (r) => (
        <Pill tone={r.potential === 'high' ? 'reward' : 'info'}>
          {r.potential === 'high' ? 'Fort' : 'Moyen'}
        </Pill>
      ),
    },
  ];

  /* DASH-12 — performance des coachs */
  const perfCols: Column<CoachPerfRow>[] = [
    {
      key: 'coach',
      header: 'Coach',
      render: (r) => (
        <span className={shared.person}>
          <Avatar firstName={r.firstName} lastName={r.lastName} size="sm" decorative />
          <span className={shared.cellStrong}>
            {r.firstName} {r.lastName}
          </span>
          {r.atRisk ? <Pill tone="danger">À risque</Pill> : null}
        </span>
      ),
    },
    { key: 'assigned', header: 'Assignées', align: 'end', secondary: true, render: (r) => <span className={shared.num}>{r.assigned}</span> },
    { key: 'completed', header: 'Réalisées', align: 'end', render: (r) => <span className={shared.num}>{r.completed}</span> },
    {
      key: 'achievement',
      header: 'Atteinte cible',
      align: 'end',
      render: (r) => (
        <span className={styles.achieveCell}>
          <span className={styles.achieveTrack}>
            <span
              className={styles.achieveFill}
              data-low={r.achievement < 60 || undefined}
              style={{ width: `${r.achievement}%` }}
            />
          </span>
          <span className={shared.num}>{r.achievement} %</span>
        </span>
      ),
    },
    {
      key: 'trend',
      header: '',
      align: 'end',
      render: (r) => {
        const Icon = TREND_ICON[r.trend];
        return <Icon size={16} className={styles[`trend_${r.trend}`]} aria-label={`Tendance ${r.trend}`} />;
      },
    },
  ];

  return (
    <div className={shared.stack}>
      {/* DASH-02 — séances à problème */}
      <div className={shared.split}>
        <CardSection
          title="Séances sans coach · +7 jours"
          actions={
            <Button size="md" variant="secondary" icon={RefreshCw}>
              Relancer l’algo
            </Button>
          }
        >
          <Table
            columns={noCoachCols}
            rows={NO_COACH_SESSIONS}
            getRowKey={(r) => r.id}
            ariaLabel="Séances sans coach depuis plus de 7 jours"
          />
        </CardSection>

        <CardSection title="EHPAD à fort taux d’annulation">
          <ul className={styles.simpleList}>
            {HIGH_CANCELLATION.map((e) => (
              <li key={e.ehpad} className={styles.simpleRow}>
                <span className={shared.cellStack}>
                  <span className={shared.cellStrong}>{e.ehpad}</span>
                  <span className={shared.cellMuted}>{e.cancellations} annulations</span>
                </span>
                <Pill tone={e.rate >= 15 ? 'danger' : 'warning'}>{e.rate} %</Pill>
              </li>
            ))}
          </ul>
        </CardSection>
      </div>

      {/* DASH-03 — séances populaires */}
      <CardSection title="Séances les plus demandées">
        <Table
          columns={popularCols}
          rows={POPULAR_SESSIONS}
          getRowKey={(r) => r.id}
          ariaLabel="Séances avec le plus de mains levées"
        />
      </CardSection>

      {/* DASH-05 — concentration des coachs */}
      <CardSection title="Concentration des coachs">
        <div className={styles.concentration}>
          <ConcentrationGroup title="Stars" hint="> 35 % d’une zone" tone="reward" rows={CONCENTRATION.stars} />
          <ConcentrationGroup title="Sous-utilisés" hint="< 50 % du volume cible" tone="info" rows={CONCENTRATION.underused} />
          <ConcentrationGroup title="À risque" hint="pénalités cumulées" tone="danger" rows={CONCENTRATION.atRisk} />
        </div>
      </CardSection>

      {/* DASH-12 — performance des coachs */}
      <Card className={styles.tableCard}>
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>Performance des coachs</h3>
          <Select value={month} onChange={setMonth} options={MONTH_OPTIONS} label="Mois" />
        </div>
        <Table
          columns={perfCols}
          rows={COACH_PERFORMANCE}
          getRowKey={(r) => `${r.firstName} ${r.lastName}`}
          ariaLabel="Performance et charge des coachs"
        />
      </Card>

      {/* DASH-13 — sensibilité des EHPAD */}
      <CardSection title="Sensibilité des EHPAD">
        <ul className={styles.sensitivityList}>
          {EHPAD_SENSITIVITY.map((e) => {
            const s = SENSITIVITY[e.level];
            return (
              <li key={e.ehpad} className={styles.sensitivityRow}>
                <span className={styles.sensitivityName}>
                  <span className={shared.cellStrong}>{e.ehpad}</span>
                  <Pill tone={s.tone}>{s.label}</Pill>
                </span>
                <span className={styles.factors}>
                  {e.factors.length > 0 ? (
                    e.factors.map((f) => (
                      <span key={f} className={styles.factor}>
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className={shared.cellMuted}>Aucun signal</span>
                  )}
                </span>
                <span className={shared.cellMuted}>
                  {e.reports} signalement{e.reports > 1 ? 's' : ''}
                </span>
              </li>
            );
          })}
        </ul>
      </CardSection>
    </div>
  );
}

function ConcentrationGroup({
  title,
  hint,
  tone,
  rows,
}: {
  title: string;
  hint: string;
  tone: 'reward' | 'info' | 'danger';
  rows: ConcentrationCoach[];
}) {
  return (
    <div className={styles.concGroup}>
      <div className={styles.concHead}>
        <Pill tone={tone}>{title}</Pill>
        <span className={shared.cellMuted}>{hint}</span>
      </div>
      <ul className={styles.concList}>
        {rows.map((c) => (
          <li key={`${c.firstName} ${c.lastName}`} className={styles.concRow}>
            <Avatar firstName={c.firstName} lastName={c.lastName} size="sm" decorative />
            <span className={shared.cellStack}>
              <span className={shared.cellStrong}>
                {c.firstName} {c.lastName}
              </span>
              <span className={shared.cellMuted}>
                {c.zone} · {c.metric}
              </span>
            </span>
            <span className={styles.concAction}>{c.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
