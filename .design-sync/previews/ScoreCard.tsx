import React from 'react';
import { ScoreCard } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', maxWidth: 380 }}>{children}</div>
);

export const Default = () => <Frame><ScoreCard /></Frame>;
export const CustomScores = () => (
  <Frame><ScoreCard scores={{ equity: 64, reputation: 71, proximity: 58, total: 65 }} /></Frame>
);
export const Compact = () => <Frame><ScoreCard compact /></Frame>;
