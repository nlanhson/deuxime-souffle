import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import styles from './ActionCard.module.css';

type ActionTone = 'info' | 'progress' | 'action' | 'reward';

interface CommonProps {
  icon: LucideIcon;
  title: string;
  description?: string | undefined;
  /** Teinte de la pastille d'icône — le seul signal couleur d'« on peut cliquer ». */
  tone?: ActionTone | undefined;
  /** Comptage / état mis en avant à droite (ex. « 3 en attente »). */
  badge?: string | undefined;
}

interface LinkProps extends CommonProps {
  to: string;
  onClick?: undefined;
  disabledReason?: undefined;
}

interface ButtonProps extends CommonProps {
  onClick: () => void;
  to?: undefined;
  /** Si défini, la carte est inactive et explique pourquoi (rôle). */
  disabledReason?: string | undefined;
}

type ActionCardProps = LinkProps | ButtonProps;

/** Carte d'accès rapide — toute la carte est cliquable. La couleur (pastille +
 *  bord au survol) est l'unique affordance ; les cartes d'info restent neutres. */
export function ActionCard(props: ActionCardProps) {
  const { icon: Icon, title, description, tone = 'info', badge } = props;

  const inner = (
    <>
      <span className={styles.chip} data-tone={tone}>
        <Icon className={styles.icon} aria-hidden />
      </span>
      <span className={styles.body}>
        <span className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {badge && <span className={styles.badge}>{badge}</span>}
        </span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
    </>
  );

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={styles.card} data-tone={tone}>
        {inner}
      </Link>
    );
  }

  const { onClick, disabledReason } = props as ButtonProps;
  const disabled = Boolean(disabledReason);
  return (
    <button
      type="button"
      className={styles.card}
      data-tone={tone}
      onClick={onClick}
      disabled={disabled}
      {...(disabled ? { title: disabledReason } : {})}
    >
      {inner}
      {disabled && <span className="sr-only">, {disabledReason}</span>}
    </button>
  );
}
