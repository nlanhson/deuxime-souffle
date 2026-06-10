/**
 * Decides which navigation bar to render.
 *
 * Why a runtime check and not a `.ios.tsx` / `.android.tsx` file extension:
 * file extensions resolve by Platform.OS (ios / android / web), but **Expo Go also runs
 * on iOS and Android** — and it does NOT bundle the react-native-bottom-tabs native module.
 * So the real question isn't "which OS" but "is the native tab controller available". That's
 * what this answers.
 *
 *   native bar  → iOS / Android dev or standalone build (module linked)
 *   JS fallback → Expo Go, web, and iOS older than the supported floor
 */
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/** Bump this if you start using native tab-bar features that need a newer iOS. */
export const MIN_IOS_FOR_NATIVE_TABS = 13;

export function supportsNativeTabs(): boolean {
  // Web has no native tab controller.
  if (Platform.OS === 'web') return false;

  // Expo Go ships a fixed set of native modules — react-native-bottom-tabs isn't one of them.
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return false;

  // Guard very old iOS.
  if (Platform.OS === 'ios') {
    const major = parseInt(String(Platform.Version), 10);
    if (!Number.isNaN(major) && major < MIN_IOS_FOR_NATIVE_TABS) return false;
  }

  return true;
}
