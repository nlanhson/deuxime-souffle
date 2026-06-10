/**
 * Bottom inset (px) the active screen must reserve so its scrollable content clears the
 * bottom tab bar.
 *
 * Why this exists: the NATIVE tab bar (react-native-bottom-tabs) lays each screen out
 * edge-to-edge UNDERNEATH the bar, so a ScrollView's last rows hide behind it unless the
 * content reserves the bar's height as bottom padding. NativeBottomTabs measures that height
 * (useBottomTabBarHeight) and feeds it in here. The JS fallback (Expo Go / web) already insets
 * each screen ABOVE its bar, so the default 0 is exactly right there — and screens must never
 * import react-native-bottom-tabs directly (it would load the native module in Expo Go), which
 * is why the height is bridged through this React-only context instead of the library hook.
 */
import React from 'react';

export const TabBarInsetContext = React.createContext(0);

export function useTabBarInset(): number {
  return React.useContext(TabBarInsetContext);
}
