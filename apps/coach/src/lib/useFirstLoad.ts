/**
 * useFirstLoad — simulates the first data fetch for a surface so the skeleton has something to
 * cover, then caches "loaded" per key for the rest of the app session.
 *
 * There's no backend yet (every screen renders mock data synchronously), so this gives the
 * skeleton system a real loading window to reveal from. The per-key cache means a surface
 * skeletons ONCE — re-selecting a tab or re-opening a sheet within the session renders instantly,
 * mirroring a real client cache. A cold app launch resets it (module reload), so each surface
 * skeletons once per launch.
 *
 * `active` lets sheets defer their load until they're opened (pass `visible`): the component is
 * mounted by its parent long before the user opens it, so without this the timer would elapse
 * off-screen and the skeleton would never show.
 */
import { useEffect, useState } from 'react';

const loaded = new Set<string>();

export function useFirstLoad(key: string, opts?: { active?: boolean; ms?: number }): boolean {
  const active = opts?.active ?? true;
  const ms = opts?.ms ?? 650;
  // Initialise true only when this surface is active AND hasn't loaded yet — so a tab's very first
  // paint is the skeleton (no one-frame flash of content before the effect runs).
  const [loading, setLoading] = useState(() => active && !loaded.has(key));

  useEffect(() => {
    if (!active || loaded.has(key)) return;
    setLoading(true);
    const id = setTimeout(() => {
      loaded.add(key);
      setLoading(false);
    }, ms);
    return () => clearTimeout(id);
  }, [active, key, ms]);

  return loading;
}
