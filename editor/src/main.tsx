import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { injectTextureCss } from '@game/model/parts/Decoration';
import { App } from './App';
import './index.css';

injectTextureCss();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
