/**
 * Web stub for NativeBottomTabs.
 *
 * react-native-bottom-tabs imports react-native internals (codegenNativeComponent) that don't
 * exist on web, and Metro statically bundles every `require()`d file — so even though
 * supportsNativeTabs() returns false on web and RootTabs never renders this at runtime, the
 * web bundle would still try to load the native module and fail.
 *
 * This `.web` variant is what Metro resolves for `require('./NativeBottomTabs')` on web, so the
 * native module is never pulled into the web build. It re-exports the JS bar purely to satisfy
 * the import shape; it is never actually rendered (the resolver picks JsBottomTabs directly on web).
 */
export { JsBottomTabs as NativeBottomTabs } from './JsBottomTabs';
