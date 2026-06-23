// Generates the web barrel (index.tsx) + componentSrcMap JSON from the live
// component files. PascalCase named exports only; ALL-CAPS consts excluded.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const COMP = 'src/components';
const files = readdirSync(COMP).filter((f) => f.endsWith('.tsx'));
const reExports = [];
const srcMap = {};

const collect = (relFile) => {
  const txt = readFileSync(relFile, 'utf8');
  const names = [...txt.matchAll(/export\s+(?:function|const)\s+([A-Z][A-Za-z0-9]*)/g)]
    .map((m) => m[1])
    .filter((n) => !/^[A-Z0-9_]+$/.test(n)); // drop ALL-CAPS consts (COACH)
  return [...new Set(names)];
};

for (const f of files) {
  const rel = join(COMP, f);
  const names = collect(rel);
  if (!names.length) continue;
  reExports.push(`export { ${names.join(', ')} } from '../${rel.replace(/\.tsx$/, '')}';`);
  for (const n of names) srcMap[n] = rel;
}
// segmented public component
const segNames = collect('src/components/segmented/Segmented.tsx');
if (segNames.includes('Segmented')) {
  reExports.push(`export { Segmented } from '../src/components/segmented/Segmented';`);
  srcMap['Segmented'] = 'src/components/segmented/Segmented.tsx';
}

writeFileSync('.ds-dist/index.tsx', '// AUTO-GENERATED web barrel for design-sync — do not edit by hand\n' + reExports.sort().join('\n') + '\n');
writeFileSync('.ds-dist/component-src-map.json', JSON.stringify(Object.fromEntries(Object.entries(srcMap).sort()), null, 2) + '\n');
console.log(`barrel: ${reExports.length} files, ${Object.keys(srcMap).length} components`);
console.log(Object.keys(srcMap).sort().join(', '));
