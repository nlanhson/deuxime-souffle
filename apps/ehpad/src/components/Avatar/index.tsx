import { useState } from 'react';
import { useStrings } from '@/i18n';
import styles from './Avatar.module.css';

interface AvatarProps {
  firstName: string;
  lastName: string;
  /** Photo réelle de la personne. Affichée en priorité ; repli sur les initiales si absente ou en erreur. */
  src?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | 'topbar' | undefined;
  /** Décoratif quand le nom est déjà affiché à côté. */
  decorative?: boolean | undefined;
}

const TONES = ['bleu', 'vert', 'or', 'neutre'] as const;

/** Photo réelle si disponible ; sinon initiales sur un ton déterministe (stable par personne). */
export function Avatar({ firstName, lastName, src, size = 'md', decorative = false }: AvatarProps) {
  const fr = useStrings();
  const [failed, setFailed] = useState(false);
  const name = `${firstName} ${lastName}`;
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const tone = TONES[hash % TONES.length] ?? 'neutre';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img', 'aria-label': fr.a11y.avatarOf(name) };

  if (src && !failed) {
    return (
      <span className={styles.avatar} data-size={size} data-photo {...a11y}>
        <img
          className={styles.photo}
          src={src}
          alt={decorative ? '' : name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={styles.avatar} data-size={size} data-tone={tone} {...a11y}>
      {initials}
    </span>
  );
}
