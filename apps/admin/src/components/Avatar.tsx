import styles from './Avatar.module.css';

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Decorative when the name is already shown next to it. */
  decorative?: boolean | undefined;
}

const TONES = ['bleu', 'vert', 'or', 'neutre'] as const;

/** Initials on a deterministic tone (no randomness, stable per person). */
export function Avatar({ firstName, lastName, size = 'md', decorative = false }: AvatarProps) {
  const name = `${firstName} ${lastName}`;
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const tone = TONES[hash % TONES.length] ?? 'neutre';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return (
    <span
      className={styles.avatar}
      data-size={size}
      data-tone={tone}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `Avatar de ${name}` })}
    >
      {initials}
    </span>
  );
}
