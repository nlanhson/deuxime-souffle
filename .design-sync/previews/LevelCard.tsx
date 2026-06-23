import React from 'react';
import { LevelCard } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', maxWidth: 380 }}>{children}</div>
);

// Canonical: the gold level badge + rouge→or progress meter on the coach profile.
export const Default = () => (
  <Frame>
    <LevelCard onPress={() => {}} />
  </Frame>
);

// Same card as it appears stacked under the Home hero (shared component, narrower gutter).
export const OnHome = () => (
  <div style={{ padding: 16, background: '#F7F4EF', maxWidth: 320 }}>
    <LevelCard onPress={() => {}} />
  </div>
);
