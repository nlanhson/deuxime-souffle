// Web stub for react-native-safe-area-context. On web there are no device safe
// areas; the real package's useSafeAreaInsets() THROWS without a provider, which
// blanks any preview that (transitively) reads insets. This returns zero insets
// deterministically and makes the provider/view passthroughs, so every component
// renders headless without async layout measurement.
import { createElement } from 'react';
import { View } from 'react-native';

const ZERO = { top: 0, right: 0, bottom: 0, left: 0 };
const FRAME = { x: 0, y: 0, width: 390, height: 844 };

export const initialWindowMetrics = { frame: FRAME, insets: ZERO };
export const useSafeAreaInsets = () => ZERO;
export const useSafeAreaFrame = () => FRAME;
export const SafeAreaProvider = ({ children }) => children;
export const SafeAreaView = ({ children, style, ...rest }) => createElement(View, { style, ...rest }, children);
export const SafeAreaInsetsContext = { Provider: ({ children }) => children, Consumer: ({ children }) => children(ZERO) };
export const SafeAreaFrameContext = { Provider: ({ children }) => children, Consumer: ({ children }) => children(FRAME) };
export const useSafeArea = () => ZERO;
export default { SafeAreaProvider, SafeAreaView, useSafeAreaInsets, useSafeAreaFrame, initialWindowMetrics };
