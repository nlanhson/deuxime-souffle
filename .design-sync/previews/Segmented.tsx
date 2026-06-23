import React from 'react';
import { Segmented } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', width: 360 }}>{children}</div>
);

const weekMonth = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
];

const sessionTabs = [
  { value: 'todo', label: 'À venir' },
  { value: 'done', label: 'Passées' },
  { value: 'all', label: 'Toutes' },
];

export const Pill = () => (
  <Frame>
    <Segmented value="week" options={weekMonth} onChange={() => {}} />
  </Frame>
);

export const PillThree = () => (
  <Frame>
    <Segmented value="done" options={sessionTabs} onChange={() => {}} />
  </Frame>
);

export const Underline = () => (
  <Frame>
    <Segmented variant="underline" stretch value="todo" options={sessionTabs} onChange={() => {}} />
  </Frame>
);
