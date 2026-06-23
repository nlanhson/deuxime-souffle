import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS, NAV_SETTINGS, type NavItem } from './nav';
import { useStrings } from '@/i18n';
import type { Copy } from '@/i18n/fr';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import styles from './Sidebar.module.css';

function NavRow({ item, fr }: { item: NavItem; fr: Copy }) {
  const Icon = item.icon;
  const label = fr.nav[item.key].label;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/'}
        className={({ isActive }) =>
          isActive ? `${styles.link} ${styles.linkActive}` : styles.link
        }
        title={label}
      >
        <Icon className={styles.icon} size={18} strokeWidth={1.75} aria-hidden />
        <span className={styles.label}>{label}</span>
        {item.badge ? (
          <span className={styles.badge} aria-label={fr.sidebar.pending(item.badge)}>
            {item.badge}
          </span>
        ) : null}
      </NavLink>
    </li>
  );
}

export function Sidebar() {
  const fr = useStrings();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src="/brand/picto-black.svg" alt="" className={styles.logo} width={36} height={36} />
        <span className={styles.brandText}>
          <span className={styles.brandName}>{fr.app.brandName}</span>
          <span className={styles.brandTag}>{fr.app.consoleName}</span>
        </span>
      </div>

      <nav className={styles.nav} aria-label={fr.sidebar.mainNav}>
        {NAV_SECTIONS.map((section) => {
          const headingId = `navsec-${section.key}`;
          return (
            <div key={section.key} className={styles.section}>
              <p className={styles.sectionLabel} id={headingId}>
                {fr.navSections[section.key]}
              </p>
              <ul className={styles.list} aria-labelledby={headingId}>
                {section.items.map((item) => (
                  <NavRow key={item.to} item={item} fr={fr} />
                ))}
              </ul>
            </div>
          );
        })}

        <div className={styles.footer}>
          <ul className={styles.footerList}>
            <NavRow item={NAV_SETTINGS} fr={fr} />
          </ul>
          <div className={styles.langWrap}>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
    </aside>
  );
}
