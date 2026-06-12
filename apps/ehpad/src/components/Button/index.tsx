import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';

interface CommonProps {
  variant?: ButtonVariant | undefined;
  icon?: LucideIcon | undefined;
  size?: 'md' | 'lg' | undefined;
  children: ReactNode;
}

interface ButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  loading?: boolean | undefined;
  /** Affiché en infobulle + lecteur d'écran quand le bouton est désactivé (ex. rôle). */
  disabledReason?: string | undefined;
}

/** Bouton « Le Club » EHPAD — secondary est le bouton par défaut (le rouge est
 *  réservé au seul CTA primaire de la vue). Cible ≥ 44px (52px par défaut). */
export function Button({
  variant = 'secondary',
  icon: Icon,
  size = 'lg',
  loading = false,
  disabledReason,
  children,
  disabled,
  type,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type ?? 'button'}
      className={styles.button}
      data-variant={variant}
      data-size={size}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...(disabled && disabledReason ? { title: disabledReason } : {})}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden />
      ) : (
        Icon && <Icon className={styles.icon} aria-hidden />
      )}
      <span>{children}</span>
      {disabled && disabledReason && <span className="sr-only"> — {disabledReason}</span>}
    </button>
  );
}

interface ButtonLinkProps extends CommonProps {
  to: string;
  state?: unknown | undefined;
}

export function ButtonLink({ variant = 'secondary', icon: Icon, size = 'lg', to, state, children }: ButtonLinkProps) {
  return (
    <Link to={to} state={state} className={styles.button} data-variant={variant} data-size={size}>
      {Icon && <Icon className={styles.icon} aria-hidden />}
      <span>{children}</span>
    </Link>
  );
}
