import type { CSSProperties, ReactNode } from 'react';
import { useStrings } from '@/i18n';
import styles from './Skeleton.module.css';

/** Région en chargement : annonce « Chargement… » aux lecteurs d'écran,
 *  les blocs squelettes apparaissent après ~300 ms (pas de flash). */
export function SkeletonGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  const fr = useStrings();
  return (
    <div className={className} aria-busy="true">
      <span className="sr-only" role="status">
        {fr.common.loading}
      </span>
      {children}
    </div>
  );
}

interface SkeletonProps {
  height?: number | string | undefined;
  width?: number | string | undefined;
  radius?: string | undefined;
  className?: string | undefined;
}

export function Skeleton({ height = 20, width = '100%', radius, className }: SkeletonProps) {
  const style: CSSProperties = { height, width };
  if (radius) style.borderRadius = radius;
  return <span className={`${styles.skeleton} ${className ?? ''}`} style={style} aria-hidden />;
}

export function SkeletonRows({ rows = 4, height = 56 }: { rows?: number; height?: number }) {
  return (
    <div className={styles.rows}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={height} radius="var(--radius-md)" />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4, height = 120 }: { count?: number; height?: number }) {
  return (
    <div className={styles.cards}>
      {Array.from({ length: count }, (_, i) => (
        // même rayon que la vraie carte : pas de changement de forme au chargement
        <Skeleton key={i} height={height} radius="var(--radius-lg)" />
      ))}
    </div>
  );
}
