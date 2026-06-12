import { useStrings } from '@/i18n';
import styles from './Avatar.module.css';

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Décoratif quand le nom est déjà affiché à côté. */
  decorative?: boolean | undefined;
}

const TONES = ['bleu', 'vert', 'or', 'neutre'] as const;

/** Initiales sur un ton déterministe (pas d'aléatoire, stable par personne). */
export function Avatar({ firstName, lastName, size = 'md', decorative = false }: AvatarProps) {
  const fr = useStrings();
  const name = `${firstName} ${lastName}`;
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const tone = TONES[hash % TONES.length] ?? 'neutre';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return (
    <span
      className={styles.avatar}
      data-size={size}
      data-tone={tone}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': fr.a11y.avatarOf(name) })}
    >
      {initials}
    </span>
  );
}
