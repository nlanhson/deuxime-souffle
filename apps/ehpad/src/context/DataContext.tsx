import { createContext, useContext, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { getVersion, subscribe } from '@/data/store';

/** Expose la version du magasin : chaque mutation l'incrémente, les écrans
 *  l'utilisent comme dépendance de `useAsync` pour se rafraîchir. */
const DataContext = createContext<number>(0);

export function DataProvider({ children }: { children: ReactNode }) {
  const version = useSyncExternalStore(subscribe, getVersion);
  return <DataContext.Provider value={version}>{children}</DataContext.Provider>;
}

export function useDataVersion(): number {
  return useContext(DataContext);
}
