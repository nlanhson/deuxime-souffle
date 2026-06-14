import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';
import { surfaces } from './src/theme/theme';

// Web: paint the document shell (html / body / #root) with the coach ink canvas as early as the
// bundle executes — before React's first render. Expo's default web template sets no background,
// so the browser body stays white; every page-sheet Modal portals over that white body, flashing
// it during the slide-in and on the initial load. Tinting the shell once removes the flash and
// makes route/modal transitions read as a continuous dark surface.
// Native needs none of this — userInterfaceStyle:"dark" already makes its containers dark.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const ink = surfaces.coach.canvas;
  const paint = () => {
    document.documentElement.style.backgroundColor = ink;
    if (document.body) document.body.style.backgroundColor = ink;
    const root = document.getElementById('root');
    if (root) root.style.backgroundColor = ink;
  };
  paint();
  // If the bundle somehow runs before <body> exists, repaint once the DOM is ready.
  if (!document.body) document.addEventListener('DOMContentLoaded', paint);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
