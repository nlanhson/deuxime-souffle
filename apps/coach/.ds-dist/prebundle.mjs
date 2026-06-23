// Pre-bundle the coach RN components into a web-compatible ESM dist entry.
// react-native -> react-native-web; react/react-dom stay EXTERNAL so the
// design-sync converter externalizes them to window.React/window.ReactDOM
// (single React instance shared with react-native-web).
import { build } from '/Users/du-mac/UnicornProjects/deuxime-souffle/.ds-sync/node_modules/esbuild/lib/main.js';
await build({
  entryPoints: ['.ds-dist/index.tsx'],
  bundle: true,
  format: 'esm',
  outfile: '.ds-dist/web-dist.mjs',
  platform: 'browser',
  target: 'es2020',
  jsx: 'transform',
  external: ['react', 'react-dom', 'react-dom/*', 'react/*'],
  alias: { 'react-native': 'react-native-web', '@react-native-segmented-control/segmented-control': './.ds-dist/stubs/segmented-control.js', 'react-native-safe-area-context': './.ds-dist/stubs/safe-area-context.js' },
  resolveExtensions: ['.web.tsx','.web.ts','.web.jsx','.web.js','.tsx','.ts','.jsx','.js','.json'],
  mainFields: ['browser','module','main'],
  conditions: ['browser','module','default'],
  loader: { '.png':'dataurl','.jpg':'dataurl','.jpeg':'dataurl','.gif':'dataurl','.ttf':'dataurl','.otf':'dataurl','.woff':'dataurl','.woff2':'dataurl' },
  banner: { js: "globalThis.process=globalThis.process||{env:{}};globalThis.process.env.NODE_ENV=globalThis.process.env.NODE_ENV||'production';globalThis.__DEV__=false;" +
    // react-native-web injects <style id=\"react-native-stylesheet\"> whose id matches the design-sync
    // render-check selector [id^=\"r\"] and sorts first in document order, making roots[0] an empty
    // <style> -> false 'root empty'. RN-web caches the sheet element ref, so renaming its id is safe.
    "(function(){if(typeof document==='undefined')return;var f=function(){var s=document.getElementById('react-native-stylesheet');if(s){s.id='dsrnw-stylesheet';return true}return false};if(!f()){var m=new MutationObserver(function(){if(f())m.disconnect()});m.observe(document.documentElement,{childList:true,subtree:true})}})();" },
  define: { __DEV__: 'false', 'process.env.NODE_ENV': '"production"', 'process.env.EXPO_OS': '"web"', global: 'window' },
  logLevel: 'warning',
}).then((r) => { for (const w of r.warnings||[]) console.error('warn:', w.text); console.log('PREBUNDLE OK'); })
  .catch((e) => { console.error('PREBUNDLE FAILED'); console.error(e.message||e); process.exit(1); });
