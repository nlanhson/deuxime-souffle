/**
 * JS fallback bottom tabs — @react-navigation/bottom-tabs (JS-drawn, no native module).
 * Used in Expo Go, on web, and on iOS older than the supported floor. Themed to match the
 * native bar as closely as possible: ink canvas, red active tint, Inter labels.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { surfaces, color, palette } from '../theme/theme';
import { useCopy } from '../i18n';
import { TABS, type TabName } from './tabs';

type ParamList = Record<TabName, undefined>;
const Tabs = createBottomTabNavigator<ParamList>();
const coach = surfaces.coach;

export function JsBottomTabs() {
  const copy = useCopy();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.action,
        tabBarInactiveTintColor: palette.neutral[600],
        tabBarStyle: {
          backgroundColor: coach.canvas,
          borderTopColor: palette.neutral[200],
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 13,
          letterSpacing: 0.4,
          marginTop: 4,
        },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            tabBarLabel: copy.tabs[t.labelKey],
            tabBarIcon: ({ color: c, size, focused }) => t.icon({ color: c, size, focused }),
          }}
        />
      ))}
    </Tabs.Navigator>
  );
}
