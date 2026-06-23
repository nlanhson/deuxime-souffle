import { useState } from 'react';
import { TrendingUp, Megaphone } from 'lucide-react';
import { PageHeader, KpiCard, Card, CardSection, Button, Select } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './CoverageScreen.module.css';
import {
  COVERAGE_KPIS,
  PERIOD_VALUES,
  SLOTS,
  ZONE_ROWS,
  HIGH_POTENTIAL,
  UNDERSERVED,
} from './data';

export function CoverageScreen() {
  const t = useStrings();
  const [period, setPeriod] = useState('this');
  const max = Math.max(...ZONE_ROWS.flatMap((r) => r.slots));

  const periodOptions = PERIOD_VALUES.map((value) => ({ value, label: t.coverage.periods[value] }));
  const slotLabel = (i: number) => {
    const s = SLOTS[i]!;
    return `${t.coverage.days[s.day]} ${t.coverage.halves[s.half]}`;
  };

  return (
    <div className={shared.stack}>
      <PageHeader
        title={t.coverage.title}
        subtitle={t.coverage.subtitle}
        actions={<Select value={period} onChange={setPeriod} options={periodOptions} label={t.coverage.periodLabel} />}
      />

      <section className={shared.kpis} aria-label={t.coverage.kpiAria}>
        {COVERAGE_KPIS.map((k) => {
          const copy = t.coverage.kpis[k.id];
          return (
            <KpiCard
              key={k.id}
              label={copy.label}
              value={k.value}
              {...(copy.hint ? { hint: copy.hint } : {})}
              {...(k.lead ? { lead: true } : {})}
            />
          );
        })}
      </section>

      <Card className={styles.matrixCard}>
        <div className={styles.matrixHead}>
          <h3 className={styles.matrixTitle}>{t.coverage.matrixTitle}</h3>
          <span className={shared.cellMuted}>{t.coverage.matrixHint}</span>
        </div>
        <div className={styles.matrix} style={{ ['--cols' as string]: SLOTS.length }}>
          <div className={styles.corner}>{t.coverage.zoneCol}</div>
          {SLOTS.map((s, i) => (
            <div key={`${s.day}-${s.half}`} className={styles.colHead}>
              {slotLabel(i)}
            </div>
          ))}
          {ZONE_ROWS.map((row) => (
            <div key={row.zone} className={styles.matrixRow}>
              <div className={styles.rowHead}>{row.zone}</div>
              {row.slots.map((n, i) => {
                const level = n === 0 ? 0 : Math.ceil((n / max) * 4);
                return (
                  <div key={i} className={styles.cell} data-level={level} title={t.coverage.cellTitle(row.zone, slotLabel(i), n)}>
                    {n > 0 ? n : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className={styles.legend}>
          <span className={shared.cellMuted}>{t.coverage.legendNone}</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={styles.legendCell} data-level={l} />
          ))}
          <span className={shared.cellMuted}>{t.coverage.legendMax}</span>
        </div>
      </Card>

      <div className={shared.split}>
        <CardSection title={t.coverage.highPotentialTitle} actions={<TrendingUp size={18} aria-hidden />}>
          <ul className={styles.recoList}>
            {HIGH_POTENTIAL.map((z) => (
              <li key={z.zone} className={styles.recoRow}>
                <span className={shared.cellStack}>
                  <span className={shared.cellStrong}>{z.zone}</span>
                  <span className={shared.cellMuted}>{z.detail}</span>
                </span>
                <Button size="md" variant="ghost">
                  {t.coverage.viewLeads}
                </Button>
              </li>
            ))}
          </ul>
        </CardSection>

        <CardSection title={t.coverage.underservedTitle} actions={<Megaphone size={18} aria-hidden />}>
          <ul className={styles.recoList}>
            {UNDERSERVED.map((z) => (
              <li key={z.zone} className={styles.recoRow}>
                <span className={shared.cellStack}>
                  <span className={shared.cellStrong}>{z.zone}</span>
                  <span className={shared.cellMuted}>{z.detail}</span>
                </span>
                <Button size="md" variant="secondary" icon={Megaphone}>
                  {t.coverage.recruit}
                </Button>
              </li>
            ))}
          </ul>
        </CardSection>
      </div>
    </div>
  );
}
