import * as React from 'react';
export interface ScoreCardProps {
  scores?: { equity: number; reputation: number; proximity: number; total: number; };
  compact?: boolean;
}
export declare const ScoreCard: React.FC<ScoreCardProps>;
