import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { SecureConfigProvider } from './contexts/SecureConfigContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SecureConfigProvider>
        <App />
      </SecureConfigProvider>
    </LanguageProvider>
  </StrictMode>,
);
