import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useStrings } from '@/i18n';
import styles from './AppShell.module.css';

export function AppShell() {
  const fr = useStrings();
  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        {fr.shell.skipToContent}
      </a>
      <Sidebar />
      <div className={styles.main}>
        <TopBar />
        <main id="main" className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
