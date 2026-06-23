/**
 * Single source of truth for the coach bottom-nav tabs.
 * Both navigators read this — the native one (react-native-bottom-tabs, SF Symbols)
 * and the JS fallback (@react-navigation/bottom-tabs, lucide-react-native) — so the two
 * implementations can never drift. IA: Accueil · Séances · Disponibles · Profil (4 tabs).
 * Profil (the 4th) is the coach's identity home — photo + account status, a gear into the full
 * Settings hub, and the level card that opens the gamified surface (tier ladder, score) as a modal.
 * It replaced the standalone "Progression" tab; the gamification now lives one tap away from here.
 * Revenus is NOT a tab — the financial dashboard (C35) opens as a modal from Home's "Earnings"
 * button instead.
 */
import React, { type ComponentType, type ReactNode } from 'react';
import type { SFSymbol } from 'sf-symbols-typescript';
import { Home, Calendar, Search, CircleUserRound } from '../icons';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { AccueilScreen } from '../screens/AccueilScreen';
import { SeancesScreen } from '../screens/SeancesScreen';
import { DisponiblesScreen } from '../screens/DisponiblesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { Copy } from '../copy';

// react-native-bottom-tabs hosts each tab in its OWN native UIViewController (laid out
// edge-to-edge, ignoring the safe area). The root SafeAreaProvider's live measurement does
// not reach inside those re-parented controllers, so each screen needs its own provider to
// resolve insets — seeded with the real window metrics so they're correct from first paint.
// Built once per screen (stable identity) so React Navigation never remounts them.
function withSafeArea(Screen: ComponentType): ComponentType {
  function ScreenWithSafeArea() {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Screen />
      </SafeAreaProvider>
    );
  }
  ScreenWithSafeArea.displayName = `withSafeArea(${Screen.displayName ?? Screen.name})`;
  return ScreenWithSafeArea;
}

// Route names are stable internal identifiers (kept FR). The visible LABEL comes from the
// localization seam (copy.tabs) — English now, flip copy.ts to ship French. Both navigators
// render `label`, not the route name, so changing language never touches navigation code.
// Route names are ASCII identifiers — react-native-bottom-tabs uses them as native page keys
// and segfaults on non-ASCII (the 'é' in 'Séances' crashed the tab controller on selection).
// The visible label still comes from copy.tabs, so this rename isn't shown to users.
export type TabName = 'Accueil' | 'Seances' | 'Disponibles' | 'Profile';

export type TabDef = {
  name: TabName;
  /** Key into copy.tabs — the navigators resolve the visible label per active locale (i18n seam). */
  labelKey: keyof Copy['tabs'];
  component: ComponentType;
  /** iOS native tab bar — SF Symbol (filled when focused). */
  sf: { active: SFSymbol; inactive: SFSymbol };
  /** JS fallback (Expo Go / web / old iOS) — vector icon. */
  icon: (p: { color: string; size: number; focused: boolean }) => ReactNode;
};

export const TABS: TabDef[] = [
  {
    name: 'Accueil',
    labelKey: 'home',
    component: withSafeArea(AccueilScreen),
    sf: { active: 'house.fill', inactive: 'house' },
    icon: ({ color, size }) => <Home size={size} color={color} />,
  },
  {
    name: 'Seances',
    labelKey: 'sessions',
    component: withSafeArea(SeancesScreen),
    sf: { active: 'calendar', inactive: 'calendar' },
    icon: ({ color, size }) => <Calendar size={size} color={color} />,
  },
  {
    name: 'Disponibles',
    labelKey: 'available',
    component: withSafeArea(DisponiblesScreen),
    sf: { active: 'hand.raised.fill', inactive: 'hand.raised' },
    icon: ({ color, size }) => <Search size={size} color={color} />,
  },
  {
    name: 'Profile',
    labelKey: 'profile',
    component: withSafeArea(ProfileScreen),
    sf: { active: 'person.crop.circle.fill', inactive: 'person.crop.circle' },
    icon: ({ color, size }) => <CircleUserRound size={size} color={color} />,
  },
];
