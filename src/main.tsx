import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { SecureConfigProvider } from './contexts/SecureConfigContext';
import { ZoteroProvider } from './contexts/ZoteroContext';
import { LLMProvider } from './contexts/LLMContext';
import { AgentProvider } from './contexts/AgentContext';
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
        <ZoteroProvider>
          <LLMProvider>
            <AgentProvider>
              <App />
            </AgentProvider>
          </LLMProvider>
        </ZoteroProvider>
      </SecureConfigProvider>
    </LanguageProvider>
  </StrictMode>,
);

