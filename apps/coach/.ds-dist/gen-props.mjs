// Emit export interface <Name>Props {...} per component into .ds-dist/types/,
// with types RESOLVED via ts-morph (local types expand to readable shapes),
// RN style/animated props sanitized to `unknown`, and giant unions capped.
// The design-sync converter globs apps/coach/**/*.d.ts and binds <Name>Props.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const require = (await import('node:module')).createRequire(resolve('.ds-sync/x.js'));
const { Project, Node, ts } = require('ts-morph');

const srcMap = JSON.parse(readFileSync('apps/coach/.ds-dist/component-src-map.json', 'utf8'));
mkdirSync('apps/coach/ds-sync-types', { recursive: true });

const project = new Project({
  tsConfigFilePath: 'apps/coach/tsconfig.json',
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { skipLibCheck: true, strict: false, noEmit: true },
});

const FMT = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType
  | ts.TypeFormatFlags.InTypeAlias;
const STYLE_RX = /ViewStyle|TextStyle|ImageStyle|StyleProp|RegisteredStyle|RecursiveArray|Falsy|GestureResponder|LayoutChangeEvent|NativeSyntheticEvent/;

const ALLOW = new Set(['React','ReactNode','Record','ReadonlyArray','ReadonlySet','Readonly','Partial','Pick','Omit','Array','Promise','Map','Set','Date']);
function simplify(txt) {
  if (!txt) return 'unknown';
  if (STYLE_RX.test(txt)) return 'unknown';
  if (txt.length > 200) return 'unknown';
  txt = txt.replace(/import\([^)]*\)\./g, '');
  // collapse to unknown if any non-allowlisted Capitalized type-name appears
  // (undeclared local types / generics) — but allow React.<member> access.
  const bad = [...txt.matchAll(/(?<![.\w])([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]).some((id) => !ALLOW.has(id));
  if (bad) return 'unknown';
  return txt;
}

const results = {};
for (const [name, rel] of Object.entries(srcMap)) {
  const abs = resolve('apps/coach', rel);
  const sf = project.addSourceFileAtPathIfExists(abs) || project.getSourceFile(abs);
  if (!sf) { results[name] = 'MISSING'; continue; }
  let fn = sf.getFunction(name) || null;
  if (!fn) { const v = sf.getVariableDeclaration(name); const init = v && v.getInitializer();
    if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) fn = init; }
  if (!fn) { results[name] = 'NO_FN'; continue; }
  const param = fn.getParameters?.()[0];
  const lines = [];
  if (param) {
    try {
      for (const p of param.getType().getProperties()) {
        const decl = p.getDeclarations()[0];
        if (!decl) continue;
        const fp = decl.getSourceFile().getFilePath();
        if (!fp.includes('/apps/coach/src/')) continue; // own props only
        const pname = p.getName();
        const opt = Node.isPropertySignature(decl) ? decl.hasQuestionToken() : false;
        let tt;
        try { tt = simplify(p.getTypeAtLocation(decl).getText(decl, FMT)); } catch { tt = 'unknown'; }
        lines.push(`  ${pname}${opt ? '?' : ''}: ${tt};`);
      }
    } catch (e) { results[name] = 'ERR:' + e.message; }
  }
  const body = lines.length ? lines.join('\n') : '  [prop: string]: unknown;';
  writeFileSync(`apps/coach/ds-sync-types/${name}.d.ts`,
    `import * as React from 'react';\nexport interface ${name}Props {\n${body}\n}\nexport declare const ${name}: React.FC<${name}Props>;\n`);
  results[name] = results[name] || `${lines.length} props`;
}
for (const [n, r] of Object.entries(results).sort()) console.log(`${String(r).padEnd(12)} ${n}`);
