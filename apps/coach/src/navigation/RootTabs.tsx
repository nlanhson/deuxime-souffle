/**
 * Coach bottom navigation — adaptive resolver.
 *
 * Renders the NATIVE tab bar (react-native-bottom-tabs → UITabBarController /
 * BottomNavigationView) where the native module is available, and falls back to the JS
 * tab bar (@react-navigation/bottom-tabs) in Expo Go, on web, and on very old iOS.
 *
 * The require() is deliberate: it defers evaluating each implementation until it's actually
 * chosen, so Expo Go / web never even load the native module (no "Unimplemented component"
 * warnings). The decision lives in ./supportsNativeTabs.
 */
import { supportsNativeTabs } from './supportsNativeTabs';

export function RootTabs() {
  if (supportsNativeTabs()) {
    const { NativeBottomTabs } = require('./NativeBottomTabs') as typeof import('./NativeBottomTabs');
    return <NativeBottomTabs />;
  }

  const { JsBottomTabs } = require('./JsBottomTabs') as typeof import('./JsBottomTabs');
  return <JsBottomTabs />;
}
