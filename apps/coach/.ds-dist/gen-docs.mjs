// Per-component doc files: category frontmatter (-> DS-pane group) + the real
// leading JSDoc prose (-> prompt.md). Discovered via cfg.docsDir by name.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const srcMap = JSON.parse(readFileSync('apps/coach/.ds-dist/component-src-map.json', 'utf8'));
const GROUP = {
  PrimaryButton:'Buttons & Actions', SecondaryButton:'Buttons & Actions', GoogleButton:'Buttons & Actions',
  Segmented:'Controls & Inputs', StepProgress:'Controls & Inputs', AuthTextField:'Controls & Inputs', SelectField:'Controls & Inputs',
  ScoreCard:'Cards & Display', LevelCard:'Cards & Display', InkHeader:'Cards & Display', CalendarLegend:'Cards & Display', NotificationCenter:'Cards & Display', ProfileAvatar:'Cards & Display',
  Logo:'Brand', GoogleMark:'Brand',
  Skeleton:'Feedback & Motion', SkeletonCircle:'Feedback & Motion', GradientFill:'Feedback & Motion', Reveal:'Feedback & Motion', BlankScreen:'Feedback & Motion',
  AbsenceModal:'Modals', ActionModal:'Modals', CancelModal:'Modals', CheckInModal:'Modals', NextSessionDetailModal:'Modals', AvailableDetailModal:'Modals', AvailableTodayModal:'Modals',
  BottomSheet:'Sheets', FieldEditSheet:'Sheets', HalfDayScheduleSheet:'Sheets', MultiSelectSheet:'Sheets', OptionSheet:'Sheets', SliderSheet:'Sheets',
  SessionMap:'Map',
};
mkdirSync('.design-sync/docs', { recursive: true });
function jsdoc(src) {
  const m = src.match(/\/\*\*([\s\S]*?)\*\//);
  if (!m) return '';
  return m[1].split('\n').map((l) => l.replace(/^\s*\*?\s?/, '').replace(/\s+$/, '')).join('\n').trim();
}
let n = 0;
for (const [name, rel] of Object.entries(srcMap)) {
  if (!rel) continue;
  const src = readFileSync(resolve('apps/coach', rel), 'utf8');
  const cat = GROUP[name] || 'Components';
  const body = jsdoc(src);
  writeFileSync(`.design-sync/docs/${name}.md`, `---\ncategory: ${cat}\n---\n\n${body || `# ${name}`}\n`);
  n++;
}
console.log(`wrote ${n} doc files`);
