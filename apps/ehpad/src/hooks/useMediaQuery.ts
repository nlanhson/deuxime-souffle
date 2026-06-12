import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Largeurs de référence : mobile < 720px, tablette < 1024px. */
export const useIsMobile = (): boolean => useMediaQuery('(max-width: 719px)');
export const useIsTablet = (): boolean => useMediaQuery('(max-width: 1023px)');
