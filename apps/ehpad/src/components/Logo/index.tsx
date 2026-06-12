import styles from './Logo.module.css';

interface LogoProps {
  /** Côté du badge carré, en px. */
  size?: number;
  /** Nom accessible quand le logo est SEUL. Omis → décoratif (le mot-symbole porte le nom). */
  label?: string;
}

/** Marque Deuxième Souffle — la main blanche sur le dégradé rouge→or, en badge arrondi.
 *  Même asset que l'app coach (`assets/icon.png`) pour une marque strictement identique.
 *  Décoratif par défaut (`alt=""`) : il accompagne le mot-symbole « Deuxième Souffle »
 *  qui porte déjà le nom pour les lecteurs d'écran. */
export function Logo({ size = 40, label = '' }: LogoProps) {
  return (
    <img
      src="/brand/logo.png"
      width={size}
      height={size}
      className={styles.logo}
      alt={label}
      draggable={false}
    />
  );
}
