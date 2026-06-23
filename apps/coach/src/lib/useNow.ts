/**
 * useNow — a live clock that re-renders only when the minute rolls over (and on app foreground).
 *
 * Used by time-derived UI (e.g. the session lifecycle status: Upcoming → In progress → Completed).
 * Lifecycle boundaries are minute-aligned, so polling every 15s but committing state only on a
 * minute change keeps the screen from re-rendering needlessly while staying accurate to ~the minute.
 * (`Date.now()` is fine in app code — the ban only applies to workflow scripts.)
 */
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let lastMin = Math.floor(Date.now() / 60_000);
    const tick = () => {
      const min = Math.floor(Date.now() / 60_000);
      if (min !== lastMin) { lastMin = min; setNow(new Date()); }
    };
    const id = setInterval(tick, 15_000);
    // Re-sync immediately when the app returns to the foreground (it may have been backgrounded
    // across several minutes, during which the interval was throttled/paused).
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') tick(); });
    return () => { clearInterval(id); sub.remove(); };
  }, []);
  return now;
}
