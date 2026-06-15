import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './nav';
import { useStrings } from '@/i18n';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const fr = useStrings();
  return (
    <aside className={styles.sidebar} aria-label={fr.sidebar.mainNav}>
      <div className={styles.brand}>
        <img src="/brand/picto-black.svg" alt="" className={styles.logo} width={36} height={36} />
        <span className={styles.brandText}>
          <span className={styles.brandName}>{fr.app.brandName}</span>
          <span className={styles.brandTag}>{fr.app.consoleName}</span>
        </span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.list}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const label = fr.nav[item.key].label;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.linkActive}` : styles.link
                  }
                  title={label}
                >
                  <Icon className={styles.icon} size={20} strokeWidth={2} aria-hidden />
                  <span className={styles.label}>{label}</span>
                  {item.badge ? (
                    <span className={styles.badge} aria-label={fr.sidebar.pending(item.badge)}>
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className={styles.footer}>
        <span className={styles.version}>{fr.sidebar.version}</span>
      </p>
    </aside>
  );
}
