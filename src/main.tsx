import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { SecureConfigProvider } from './contexts/SecureConfigContext';
import { registerSW } from 'virtual:pwa-register';

// Register specific application service worker for PWA caching & updates
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new version of StudyForge is available. Refresh to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('StudyForge is now ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SecureConfigProvider>
        <App />
      </SecureConfigProvider>
    </LanguageProvider>
  </StrictMode>,
);

