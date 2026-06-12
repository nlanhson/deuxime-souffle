import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Info, OctagonX } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from './Toast.module.css';

export interface ToastOptions {
  kind?: 'success' | 'neutral' | 'danger';
  message: string;
  action?: { label: string; run: () => void };
}

interface ToastItem extends Required<Pick<ToastOptions, 'kind' | 'message'>> {
  id: number;
  action?: ToastOptions['action'];
}

const ToastContext = createContext<{ showToast: (options: ToastOptions) => void } | null>(null);

let toastSeq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const fr = useStrings();
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const queue = useRef<ToastItem[]>([]);
  const timer = useRef<number | null>(null);
  const paused = useRef(false);

  const dismiss = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setCurrent(queue.current.shift() ?? null);
  }, []);

  const arm = useCallback(
    (toast: ToastItem) => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (paused.current) arm(toast); // l'auto-fermeture attend la fin du survol / focus
        else dismiss();
      }, toast.action ? 8000 : 4000);
    },
    [dismiss],
  );

  useEffect(() => {
    if (current) arm(current);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [current, arm]);

  const showToast = useCallback((options: ToastOptions) => {
    const toast: ToastItem = {
      id: (toastSeq += 1),
      kind: options.kind ?? 'success',
      message: options.message,
      ...(options.action ? { action: options.action } : {}),
    };
    setCurrent((existing) => {
      if (existing) {
        queue.current.push(toast); // une seule à la fois — les suivantes patientent
        return existing;
      }
      return toast;
    });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const Icon = current?.kind === 'danger' ? OctagonX : current?.kind === 'neutral' ? Info : CheckCircle2;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={styles.region}
        role={current?.kind === 'danger' ? 'alert' : 'status'}
        aria-live={current?.kind === 'danger' ? 'assertive' : 'polite'}
        onMouseEnter={() => {
          paused.current = true;
        }}
        onMouseLeave={() => {
          paused.current = false;
        }}
        onFocus={() => {
          paused.current = true;
        }}
        onBlur={() => {
          paused.current = false;
        }}
      >
        {current && (
          <div key={current.id} className={styles.toast} data-kind={current.kind}>
            <Icon className={styles.icon} aria-hidden />
            <div className={styles.content}>
              <p className={styles.message}>
                {current.kind === 'danger' ? `${fr.common.error} : ` : ''}
                {current.message}
              </p>
              {current.action && (
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => {
                    current.action?.run();
                    dismiss();
                  }}
                >
                  {current.action.label}
                </button>
              )}
            </div>
            <button type="button" className={styles.close} onClick={dismiss} aria-label={fr.common.close}>
              ×
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): { showToast: (options: ToastOptions) => void } {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast doit être utilisé sous ToastProvider');
  return value;
}
