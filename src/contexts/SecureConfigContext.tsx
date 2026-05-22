import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from 'react';
import { db } from '../lib/db';
import { decryptApiKey, encryptApiKey } from '../lib/crypto';

interface SecureConfigContextState {
  hasMasterPasswordSet: boolean;
  isUnlocked: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  setMasterPassword: (password: string) => Promise<void>;
  saveApiKey: (providerId: string, apiKey: string) => Promise<void>;
  getApiKey: (providerId: string) => Promise<string | null>;
  inactivityTimeoutMinutes: number;
  setInactivityTimeoutMinutes: (minutes: number) => void;
}

const SecureConfigContext = createContext<SecureConfigContextState | undefined>(undefined);

const DEFAULT_TIMEOUT_MINUTES = 15;
const MAX_TIMEOUT_MINUTES = 120;

export function SecureConfigProvider({ children }: { children: ReactNode }) {
  const [hasMasterPasswordSet, setHasMasterPasswordSet] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inactivityTimeoutMinutes, setInactivityTimeoutMinutesState] = useState(DEFAULT_TIMEOUT_MINUTES);

  const masterPasswordRef = useRef<string | null>(null);
  const lastActivityTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    lastActivityTime.current = Date.now();
    db.secureConfig.get('master_check').then((entry) => {
      setHasMasterPasswordSet(!!entry);
    });
  }, []);

  const resetActivity = () => {
    lastActivityTime.current = Date.now();
  };

  const lock = () => {
    masterPasswordRef.current = null;
    setIsUnlocked(false);
  };

  const setInactivityTimeoutMinutes = (minutes: number) => {
    const clamped = Math.min(Math.max(minutes, 1), MAX_TIMEOUT_MINUTES);
    setInactivityTimeoutMinutesState(clamped);
  };

  useEffect(() => {
    const handleActivity = () => resetActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      timerRef.current = window.setInterval(() => {
        const idleTime = Date.now() - lastActivityTime.current;
        if (idleTime > inactivityTimeoutMinutes * 60 * 1000) {
          lock();
        }
      }, 60000);
    } else if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isUnlocked, inactivityTimeoutMinutes]);

  const unlock = async (password: string) => {
    try {
      const entry = await db.secureConfig.get('master_check');
      if (!entry) {
        await encryptApiKey('timing_probe', password, '_timing_probe');
        return false;
      }
      await decryptApiKey(entry, password);
      masterPasswordRef.current = password;
      setIsUnlocked(true);
      resetActivity();
      return true;
    } catch {
      return false;
    }
  };

  const setMasterPassword = async (password: string) => {
    if (password.length < 8) {
      throw new Error('Master password must be at least 8 characters');
    }
    const entry = await encryptApiKey('master_check_validation', password, 'master_check');
    await db.secureConfig.put(entry);
    masterPasswordRef.current = password;
    setIsUnlocked(true);
    setHasMasterPasswordSet(true);
    resetActivity();
  };

  const saveApiKey = async (providerId: string, apiKey: string) => {
    if (!masterPasswordRef.current) throw new Error('Vault is locked');
    const entry = await encryptApiKey(apiKey, masterPasswordRef.current, providerId);
    await db.secureConfig.put(entry);
    resetActivity();
  };

  const getApiKey = async (providerId: string) => {
    if (!masterPasswordRef.current) return null;
    const entry = await db.secureConfig.get(providerId);
    if (!entry) return null;
    try {
      const key = await decryptApiKey(entry, masterPasswordRef.current);
      resetActivity();
      return key;
    } catch {
      return null;
    }
  };

  return (
    <SecureConfigContext.Provider
      value={{
        hasMasterPasswordSet,
        isUnlocked,
        unlock,
        lock,
        setMasterPassword,
        saveApiKey,
        getApiKey,
        inactivityTimeoutMinutes,
        setInactivityTimeoutMinutes,
      }}
    >
      {children}
    </SecureConfigContext.Provider>
  );
}

export function useSecureConfig() {
  const context = useContext(SecureConfigContext);
  if (context === undefined) {
    throw new Error('useSecureConfig must be used within a SecureConfigProvider');
  }
  return context;
}
