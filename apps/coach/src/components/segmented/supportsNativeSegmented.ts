/**
 * Decides which Segmented control to render — the sibling of ./supportsNativeTabs, and
 * deliberately kept in lock-step with it so toggles behave like the bottom nav:
 *
 *   native bar / control → iOS / Android dev or standalone build (native look — on iOS 26
 *                          that's the Liquid Glass UISegmentedControl)
 *   JS fallback          → Expo Go, web, and pre-13 iOS (our branded Oswald pills)
 *
 * Note: unlike react-native-bottom-tabs, @react-native-segmented-control IS bundled in
 * Expo Go, so the native control *could* run there. We still fall back to the JS pills in
 * Expo Go BY CHOICE — the review build should look like the brand, not the raw system
 * control, and the native Liquid Glass control only earns its place in the real app. Flip
 * the StoreClient guard if you ever want to preview the native control inside Expo Go.
 */
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/** backgroundColor + appearance are iOS 13+; below that, fall back to the JS pills. */
export const MIN_IOS_FOR_NATIVE_SEGMENTED = 13;

/** iOS 26 is where UISegmentedControl became a Liquid Glass control (sibling of the glass tab bar). */
export const IOS_LIQUID_GLASS_MAJOR = 26;

/**
 * True on iOS 26+, where the native control renders as Liquid Glass. On glass, the system owns the
 * track + selected-capsule material and its own label contrast — feeding it a custom backgroundColor
 * or (dark) selectedSegmentTintColor suppresses the glass, so the sliding indicator shows no
 * background. Call sites use this to drop colour overrides on glass and keep them on pre-26 / Android.
 */
export function isLiquidGlassIOS(): boolean {
  if (Platform.OS !== 'ios') return false;
  const major = parseInt(String(Platform.Version), 10);
  return !Number.isNaN(major) && major >= IOS_LIQUID_GLASS_MAJOR;
}

export function supportsNativeSegmented(): boolean {
  // Web has no native segmented control — keep the branded pills there.
  if (Platform.OS === 'web') return false;

  // Expo Go → branded pills, same as the JS tab bar (a product choice, not a limitation).
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return false;

  // Guard very old iOS (the themeable props we rely on are 13+).
  if (Platform.OS === 'ios') {
    const major = parseInt(String(Platform.Version), 10);
    if (!Number.isNaN(major) && major < MIN_IOS_FOR_NATIVE_SEGMENTED) return false;
  }

  return true;
}
