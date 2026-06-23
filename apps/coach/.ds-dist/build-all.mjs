// Rebuilds the web-compatible dist the design-sync converter consumes:
//   1) barrel index.tsx   2) fonts.css + ttf copy   3) per-component Props .d.ts
//   4) esbuild pre-bundle (react-native -> react-native-web)
// Deterministic. Run from the repo root: `node apps/coach/.ds-dist/build-all.mjs`.
import { execFileSync } from 'node:child_process';

const node = process.execPath;
const atCoach = (f) => execFileSync(node, [f], { stdio: 'inherit', cwd: 'apps/coach' });
const atRoot = (f) => execFileSync(node, [f], { stdio: 'inherit' });

atCoach('.ds-dist/gen-barrel.mjs');           // reads src/components -> index.tsx + component-src-map.json
atCoach('.ds-dist/gen-fonts.mjs');            // copies @expo-google-fonts ttfs -> fonts.css
atRoot('apps/coach/.ds-dist/gen-docs.mjs');   // category + JSDoc -> .design-sync/docs/<Name>.md
atRoot('apps/coach/.ds-dist/gen-props.mjs');  // ts-morph over src -> .ds-dist/types/<Name>.d.ts (repo-root paths)
atCoach('.ds-dist/prebundle.mjs');            // esbuild -> .ds-dist/web-dist.mjs
console.error('\nbuild-all OK');
