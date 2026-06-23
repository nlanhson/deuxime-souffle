import React from 'react';
import { CalendarLegend } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', maxWidth: 380 }}>{children}</div>
);

// Home "Mon planning" — the red dot marks a CONFIRMED session.
export const Confirmed = () => (
  <Frame>
    <CalendarLegend items={[{ color: '#E1322B', label: 'Séance confirmée' }]} />
  </Frame>
);

// Disponibles — same glyph, opposite meaning: an AVAILABLE (open) session.
export const Available = () => (
  <Frame>
    <CalendarLegend items={[{ color: '#E1322B', label: 'Séance disponible' }]} />
  </Frame>
);

// Extensible: two markers shown together (DT-13).
export const TwoMarkers = () => (
  <Frame>
    <CalendarLegend
      items={[
        { color: '#E1322B', label: 'Séance confirmée' },
        { color: '#2F9E6B', label: 'Disponibilité' },
      ]}
    />
  </Frame>
);
