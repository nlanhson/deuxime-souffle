/** Drapeaux de démonstration lus au démarrage, persistés en sessionStorage :
 *  ?state=empty|rich   → jeu de données vide / riche
 *  ?role=admin|user    → connexion automatique avec le rôle choisi
 *  ?debug=error|slow|off → toutes les requêtes simulées échouent / ralentissent
 *  Documentés dans apps/ehpad/README.md. */

import type { Role } from '@/types/models';

export type DebugMode = 'error' | 'slow' | null;

export interface BootConfig {
  fixture: 'rich' | 'empty';
  autoRole: Role | null;
  debug: DebugMode;
}

function readFlag(param: string, allowed: readonly string[], storageKey: string): string | null {
  let fromUrl: string | null = null;
  try {
    fromUrl = new URLSearchParams(window.location.search).get(param);
  } catch {
    fromUrl = null;
  }
  try {
    if (fromUrl !== null) {
      if (allowed.includes(fromUrl)) {
        sessionStorage.setItem(storageKey, fromUrl);
        return fromUrl;
      }
      sessionStorage.removeItem(storageKey); // toute autre valeur (off, rich…) réinitialise
      return null;
    }
    const stored = sessionStorage.getItem(storageKey);
    return stored !== null && allowed.includes(stored) ? stored : null;
  } catch {
    return fromUrl !== null && allowed.includes(fromUrl) ? fromUrl : null;
  }
}

const fixture = readFlag('state', ['empty'], 'ds-ehpad.state') === 'empty' ? 'empty' : 'rich';
const role = readFlag('role', ['admin', 'user'], 'ds-ehpad.role');
const debug = readFlag('debug', ['error', 'slow'], 'ds-ehpad.debug');

export const bootConfig: BootConfig = {
  fixture,
  autoRole: role === 'admin' || role === 'user' ? role : null,
  debug: debug === 'error' || debug === 'slow' ? debug : null,
};
