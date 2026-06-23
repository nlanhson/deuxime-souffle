import React from 'react';
import { SelectField } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', width: 360 }}>{children}</div>
);

export const Filled = () => (
  <Frame>
    <SelectField label="Civilité" value="Madame" onPress={() => {}} />
  </Frame>
);

export const Placeholder = () => (
  <Frame>
    <SelectField label="Statut juridique" placeholder="Sélectionnez un statut" onPress={() => {}} />
  </Frame>
);

export const Error = () => (
  <Frame>
    <SelectField
      label="Statut juridique"
      placeholder="Sélectionnez un statut"
      error
      help="Ce champ est obligatoire"
      onPress={() => {}}
    />
  </Frame>
);

export const Optional = () => (
  <Frame>
    <SelectField
      label="Spécialité"
      optional="facultatif"
      value="Gym douce"
      help="Modifiable à tout moment"
      onPress={() => {}}
    />
  </Frame>
);
