import styles from './Logo.module.css';

interface LogoProps {
  /** Square badge side, in px. */
  size?: number;
  /** Accessible name when the logo is alone. Omit → decorative (wordmark carries the name). */
  label?: string;
}

/** Deuxième Souffle mark — the official picto (hand knocked out of a solid square),
 *  pulled from deuxieme-souffle.com. Black variant sits on the app's light surfaces.
 *  Decorative by default (`alt=""`): it accompanies the "Deuxième Souffle" wordmark. */
export function Logo({ size = 40, label = '' }: LogoProps) {
  return (
    <img
      src="/brand/picto-black.svg"
      width={size}
      height={size}
      className={styles.logo}
      alt={label}
      draggable={false}
    />
  );
}
