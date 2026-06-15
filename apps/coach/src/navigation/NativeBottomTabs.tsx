/**
 * Native bottom tabs — real UITabBarController (iOS) / BottomNavigationView (Android)
 * via react-native-bottom-tabs. Only evaluated where the native module exists
 * (see supportsNativeTabs). SF Symbol icons, ink theme, red active tint.
 */
import { type ComponentType } from 'react';
import { Platform } from 'react-native';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';

import { surfaces, palette } from '../theme/theme';
import { TABS, type TabName } from './tabs';
import { TabBarInsetContext } from './tabBarInsets';

type ParamList = Record<TabName, undefined>;
const Tabs = createNativeBottomTabNavigator<ParamList>();
const coach = surfaces.coach;

// The native bar overlays each screen (screens are laid out edge-to-edge under it). Publish the
// measured bar height to the screen so its ScrollView can reserve room for the last rows. Built
// once per screen (stable identity) so React Navigation never remounts them. useBottomTabBarHeight
// is only valid inside a Native-Bottom-Tab screen — which is exactly where this renders.
function withTabBarInset(Screen: ComponentType): ComponentType {
  function ScreenWithTabBarInset() {
    const height = useBottomTabBarHeight();
    return (
      <TabBarInsetContext.Provider value={height}>
        <Screen />
      </TabBarInsetContext.Provider>
    );
  }
  ScreenWithTabBarInset.displayName = `withTabBarInset(${Screen.displayName ?? Screen.name})`;
  return ScreenWithTabBarInset;
}

const NATIVE_TABS = TABS.map((t) => ({ ...t, component: withTabBarInset(t.component) }));

// iOS 26's Liquid Glass tab bar renders the selected item's tint desaturated (washed-out light
// red). The library exposes no per-state icon colour, so we compensate at the app level: feed the
// native bar a DEEPER red (rouge[600]) that lands closer to the brand #E1322B after the wash, and
// mute the inactive tint one step for extra contrast. The JS bar (no glass) keeps the exact brand
// red — see JsBottomTabs.
const NATIVE_ACTIVE_TINT = palette.rouge[600]; // #C32721 — pre-compensated for the iOS 26 glass wash

// iOS 26 draws the tab bar as a floating Liquid Glass element and lets iOS render its own frosted
// glass material as the background — exactly like the system tab bar in Apple's own apps. The catch
// is that ANY override forces an OPAQUE UITabBarAppearance the SwiftUI glass bar then leaves unfilled
// (clear): translucent={false} → configureWithOpaqueBackground; tabBarStyle.backgroundColor →
// appearance.backgroundColor. So on iOS we pass NEITHER and keep the default glass. Android has no
// Liquid Glass, so it keeps the solid ink bar.
const ANDROID_BAR_STYLE = Platform.OS === 'android' ? { backgroundColor: coach.canvas } : undefined;

export function NativeBottomTabs() {
  return (
    <Tabs.Navigator
      tabBarActiveTintColor={NATIVE_ACTIVE_TINT}
      tabBarInactiveTintColor={palette.neutral[500]}
      tabBarStyle={ANDROID_BAR_STYLE}
      hapticFeedbackEnabled
      labeled
    >
      {NATIVE_TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            tabBarLabel: t.label,
            tabBarIcon: ({ focused }) => ({ sfSymbol: focused ? t.sf.active : t.sf.inactive }),
          }}
        />
      ))}
    </Tabs.Navigator>
  );
}
