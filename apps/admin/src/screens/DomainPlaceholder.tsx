import { PageHeader, Card, Pill } from '@/components';
import { useStrings } from '@/i18n';
import type { Capability } from '@/i18n/fr';
import styles from './DomainPlaceholder.module.css';

export type { Capability };

interface DomainPlaceholderProps {
  title: string;
  subtitle: string;
  source: string;
  capabilities: Capability[];
}

/**
 * Honest scope placeholder for a domain whose screens aren't built yet.
 * Lists the planned capabilities (from PRD §4 / the WBS) so the console is
 * navigable and the roadmap is legible — it never fakes a built feature.
 */
export function DomainPlaceholder({ title, subtitle, source, capabilities }: DomainPlaceholderProps) {
  const fr = useStrings();
  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<Pill tone="neutral">{fr.placeholder.comingSoon}</Pill>}
      />
      <div className={styles.grid}>
        {capabilities.map((c) => (
          <Card key={c.title} className={styles.cap}>
            <h3 className={styles.capTitle}>{c.title}</h3>
            <p className={styles.capDetail}>{c.detail}</p>
          </Card>
        ))}
      </div>
      <p className={styles.source}>{fr.placeholder.scope(source)}</p>
    </>
  );
}
