import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/theme/tokens.css';
import '@/styles/global.css';
import App from '@/App';

const root = document.getElementById('root');
if (!root) throw new Error('Élément racine introuvable');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
