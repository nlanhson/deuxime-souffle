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
  /** Shown as tooltip + to screen readers when the button is disabled (e.g. role gate). */
  disabledReason?: string | undefined;
}

/** « Le Club » button — the red→ember gradient is the default here because the
 *  app's only unmarked buttons are hero CTAs; secondary/ghost are opt-in. Pill
 *  shape + ≥44px target (52px default), mirroring the EHPAD app. */
export function Button({
  variant = 'primary',
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
