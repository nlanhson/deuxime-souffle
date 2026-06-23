import React from 'react';
import { AuthTextField } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 18 }}>{children}</div>
);

export const Default = () => <Frame><AuthTextField label="E-mail" placeholder="vous@exemple.fr" /></Frame>;
export const Filled = () => <Frame><AuthTextField label="Nom complet" value="Camille Renaud" /></Frame>;
export const WithError = () => <Frame><AuthTextField label="Mot de passe" value="abc" error help="8 caractères minimum." secureTextEntry /></Frame>;
export const Optional = () => <Frame><AuthTextField label="Téléphone" optional="facultatif" placeholder="06 12 34 56 78" /></Frame>;
