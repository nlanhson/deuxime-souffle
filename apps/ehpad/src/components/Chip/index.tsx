import type { LucideIcon } from 'lucide-react';
import type { ChipSpec, ChipVariant } from '@/lib/status';
import styles from './Chip.module.css';

interface ChipProps {
  label: string;
  variant: ChipVariant;
  icon?: LucideIcon | undefined;
}

/** Pastille de statut — toujours icône/point + texte, jamais la couleur seule. */
export function Chip({ label, variant, icon: Icon }: ChipProps) {
  return (
    <span className={styles.chip} data-variant={variant}>
      {Icon ? <Icon className={styles.icon} aria-hidden /> : <span className={styles.dot} aria-hidden />}
      <span>{label}</span>
    </span>
  );
}

export function StatusChip({ spec }: { spec: ChipSpec }) {
  return <Chip label={spec.label} variant={spec.variant} icon={spec.icon} />;
}
