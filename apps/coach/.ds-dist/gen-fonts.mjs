import { copyFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
const FONTS = [
  ['anton',  'Anton',  ['400Regular']],
  ['oswald', 'Oswald', ['400Regular','500Medium','600SemiBold','700Bold']],
  ['inter',  'Inter',  ['400Regular','500Medium','600SemiBold','700Bold']],
];
const weightOf = (w) => parseInt(w, 10);
mkdirSync('.ds-dist/fonts', { recursive: true });
const rules = [];
for (const [pkg, fam, weights] of FONTS) {
  for (const w of weights) {
    const family = `${fam}_${w}`;
    const src = `node_modules/@expo-google-fonts/${pkg}/${w}/${family}.ttf`;
    if (!existsSync(src)) { console.error('MISSING', src); continue; }
    copyFileSync(src, `.ds-dist/fonts/${family}.ttf`);
    // family name === the exact string react-native-web emits for fontFamily
    rules.push(
      `@font-face{font-family:'${family}';font-style:normal;font-weight:${weightOf(w)};font-display:swap;src:url('./fonts/${family}.ttf') format('truetype');}`
    );
  }
}
writeFileSync('.ds-dist/fonts.css', '/* Brand web fonts for Deuxième Souffle coach DS — host-provided at runtime via useFonts in the app; shipped here as @font-face so react-native-web fontFamily names resolve. */\n' + rules.join('\n') + '\n');
console.log(`fonts.css: ${rules.length} @font-face rules`);
